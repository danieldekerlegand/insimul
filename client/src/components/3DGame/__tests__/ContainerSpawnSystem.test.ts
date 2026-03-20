/**
 * Tests for ContainerSpawnSystem
 *
 * Run with: npx vitest run client/src/components/3DGame/__tests__/ContainerSpawnSystem.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Babylon.js before imports
vi.mock('@babylonjs/core', () => {
  class Vector3 {
    constructor(public x = 0, public y = 0, public z = 0) {}
    clone() { return new Vector3(this.x, this.y, this.z); }
    scale(s: number) { return new Vector3(this.x * s, this.y * s, this.z * s); }
  }
  class Color3 {
    constructor(public r = 0, public g = 0, public b = 0) {}
    scale(s: number) { return new Color3(this.r * s, this.g * s, this.b * s); }
  }
  class Mesh {
    name: string;
    material: any = null;
    position = new Vector3();
    metadata: any = null;
    isPickable = true;
    checkCollisions = false;
    constructor(name: string, _scene?: any) { this.name = name; }
    dispose() {}
  }
  class StandardMaterial {
    name: string;
    diffuseColor: any;
    specularColor: any;
    constructor(name: string, _scene: any) { this.name = name; }
    dispose() {}
  }
  const MeshBuilder = {
    CreateBox: (name: string, _opts: any, _scene: any) => new Mesh(name),
  };
  class Scene {}
  return { Vector3, Color3, Mesh, StandardMaterial, MeshBuilder, Scene };
});

import { Vector3, Mesh, Scene } from '@babylonjs/core';
import {
  ContainerSpawnSystem,
  resolveLootTableKey,
  weightedPick,
  generateContainerItems,
  type LootEntry,
  type OutdoorSpawnPoint,
} from '../ContainerSpawnSystem';

// Minimal GameEventBus mock
function makeEventBus() {
  return {
    emit: vi.fn(),
    on: vi.fn(() => () => {}),
  } as any;
}

function makeContainerMesh(
  containerType: string,
  buildingId: string,
  index = 0,
): any {
  const mesh = new Mesh(`interior_${buildingId}_furn_${index}_${containerType}`);
  mesh.metadata = {
    isContainer: true,
    containerType,
    containerId: `interior_${buildingId}_container_${index}`,
    buildingId,
    businessType: 'tavern',
  };
  mesh.isPickable = true;
  return mesh;
}

function makeNonContainerMesh(name = 'table'): any {
  const mesh = new Mesh(name);
  mesh.isPickable = false;
  return mesh;
}

describe('ContainerSpawnSystem', () => {
  let system: ContainerSpawnSystem;
  let scene: any;
  let eventBus: any;

  beforeEach(() => {
    scene = new Scene();
    eventBus = makeEventBus();
    system = new ContainerSpawnSystem(scene as any, eventBus);
  });

  // ── resolveLootTableKey ──────────────────────────────────────────────

  describe('resolveLootTableKey', () => {
    it('resolves tavern variants', () => {
      expect(resolveLootTableKey('Tavern')).toBe('tavern');
      expect(resolveLootTableKey('Inn')).toBe('tavern');
      expect(resolveLootTableKey('Bar')).toBe('tavern');
    });

    it('resolves shop variants', () => {
      expect(resolveLootTableKey('Shop')).toBe('shop');
      expect(resolveLootTableKey('General Store')).toBe('shop');
      expect(resolveLootTableKey('Market')).toBe('shop');
    });

    it('resolves workshop variants', () => {
      expect(resolveLootTableKey('Blacksmith')).toBe('workshop');
      expect(resolveLootTableKey('Forge')).toBe('workshop');
      expect(resolveLootTableKey('Workshop')).toBe('workshop');
    });

    it('resolves warehouse', () => {
      expect(resolveLootTableKey('Warehouse')).toBe('warehouse');
      expect(resolveLootTableKey('Storage')).toBe('warehouse');
    });

    it('resolves residence', () => {
      expect(resolveLootTableKey('Residence')).toBe('residence');
      expect(resolveLootTableKey('House')).toBe('residence');
    });

    it('returns _default for unknown types', () => {
      expect(resolveLootTableKey('UnknownType')).toBe('_default');
      expect(resolveLootTableKey(undefined)).toBe('_default');
    });

    it('uses buildingType as fallback', () => {
      expect(resolveLootTableKey(undefined, 'tavern')).toBe('tavern');
    });
  });

  // ── weightedPick ─────────────────────────────────────────────────────

  describe('weightedPick', () => {
    it('returns an entry from the list', () => {
      const entries: LootEntry[] = [
        { name: 'A', type: 'food', weight: 1 },
        { name: 'B', type: 'food', weight: 1 },
      ];
      const picked = weightedPick(entries);
      expect(['A', 'B']).toContain(picked.name);
    });

    it('returns the only entry when list has one item', () => {
      const entries: LootEntry[] = [{ name: 'Only', type: 'tool', weight: 10 }];
      expect(weightedPick(entries).name).toBe('Only');
    });
  });

  // ── generateContainerItems ───────────────────────────────────────────

  describe('generateContainerItems', () => {
    it('generates items within chest count range (2-5)', () => {
      const items = generateContainerItems('chest', 'tavern', 'test_chest');
      expect(items.length).toBeGreaterThanOrEqual(2);
      expect(items.length).toBeLessThanOrEqual(5);
    });

    it('generates items within barrel count range (1-3)', () => {
      const items = generateContainerItems('barrel', 'tavern', 'test_barrel');
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items.length).toBeLessThanOrEqual(3);
    });

    it('generates items within crate count range (1-4)', () => {
      const items = generateContainerItems('crate', 'workshop', 'test_crate');
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items.length).toBeLessThanOrEqual(4);
    });

    it('each item has required fields', () => {
      const items = generateContainerItems('chest', 'residence', 'test');
      for (const item of items) {
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.type).toBeTruthy();
        expect(item.quantity).toBe(1);
      }
    });

    it('falls back to _default table for unknown key', () => {
      const items = generateContainerItems('chest', 'nonexistent', 'test');
      expect(items.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── registerInteriorContainers ───────────────────────────────────────

  describe('registerInteriorContainers', () => {
    it('registers container meshes and skips non-containers', () => {
      const containerMesh = makeContainerMesh('chest', 'building1');
      const tableMesh = makeNonContainerMesh('table');

      const result = system.registerInteriorContainers(
        [containerMesh, tableMesh],
        'building1',
        'Tavern',
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('chest');
      expect(result[0].location).toBe('interior');
      expect(result[0].buildingId).toBe('building1');
      expect(result[0].opened).toBe(false);
      expect(result[0].items.length).toBeGreaterThan(0);
    });

    it('does not double-register the same container', () => {
      const mesh = makeContainerMesh('barrel', 'building2');

      system.registerInteriorContainers([mesh], 'building2', 'Tavern');
      const second = system.registerInteriorContainers([mesh], 'building2', 'Tavern');

      expect(second).toHaveLength(0);
      expect(system.getAllContainers()).toHaveLength(1);
    });

    it('registers multiple containers from same building', () => {
      const chest = makeContainerMesh('chest', 'building3', 0);
      const barrel = makeContainerMesh('barrel', 'building3', 1);

      const result = system.registerInteriorContainers(
        [chest, barrel],
        'building3',
        'Warehouse',
      );

      expect(result).toHaveLength(2);
      expect(system.getContainerCounts().interior).toBe(2);
    });
  });

  // ── spawnOutdoorContainers ───────────────────────────────────────────

  describe('spawnOutdoorContainers', () => {
    it('spawns outdoor containers at specified points', () => {
      const points: OutdoorSpawnPoint[] = [
        {
          position: new Vector3(10, 0, 20) as any,
          containerType: 'barrel',
          buildingId: 'b1',
          businessType: 'Tavern',
        },
      ];

      const result = system.spawnOutdoorContainers(points);

      expect(result).toHaveLength(1);
      expect(result[0].location).toBe('outdoor');
      expect(result[0].type).toBe('barrel');
      expect(result[0].mesh).toBeTruthy();
    });

    it('uses outdoor loot table when no businessType', () => {
      const points: OutdoorSpawnPoint[] = [
        {
          position: new Vector3(5, 0, 5) as any,
          containerType: 'crate',
        },
      ];

      const result = system.spawnOutdoorContainers(points);
      expect(result).toHaveLength(1);
      expect(result[0].items.length).toBeGreaterThan(0);
    });

    it('does not spawn duplicates at same position', () => {
      const points: OutdoorSpawnPoint[] = [
        { position: new Vector3(10, 0, 20) as any, containerType: 'barrel' },
      ];

      system.spawnOutdoorContainers(points);
      const second = system.spawnOutdoorContainers(points);

      expect(second).toHaveLength(0);
      expect(system.getContainerCounts().outdoor).toBe(1);
    });
  });

  // ── generateOutdoorSpawnPoints ───────────────────────────────────────

  describe('generateOutdoorSpawnPoints', () => {
    it('generates 0-2 spawn points', () => {
      const results = new Set<number>();
      for (let i = 0; i < 50; i++) {
        const points = system.generateOutdoorSpawnPoints(
          new Vector3(0, 0, 0) as any,
          10, 8, 0, 'b1', 'Shop',
        );
        results.add(points.length);
      }
      expect(Math.max(...results)).toBeLessThanOrEqual(2);
    });

    it('includes buildingId and businessType on spawn points', () => {
      const originalRandom = Math.random;
      Math.random = () => 0.1;
      try {
        const points = system.generateOutdoorSpawnPoints(
          new Vector3(0, 0, 0) as any,
          10, 8, 0, 'building1', 'Tavern',
        );
        expect(points.length).toBe(2);
        for (const p of points) {
          expect(p.buildingId).toBe('building1');
          expect(p.businessType).toBe('Tavern');
        }
      } finally {
        Math.random = originalRandom;
      }
    });
  });

  // ── openContainer ────────────────────────────────────────────────────

  describe('openContainer', () => {
    it('opens a container and emits event', () => {
      const mesh = makeContainerMesh('chest', 'b1');
      system.registerInteriorContainers([mesh], 'b1', 'Tavern');

      const containerId = mesh.metadata.containerId;
      const result = system.openContainer(containerId);

      expect(result).not.toBeNull();
      expect(result!.opened).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'container_opened',
          containerId,
          containerType: 'chest',
          location: 'interior',
        }),
      );
    });

    it('returns null for already opened container', () => {
      const mesh = makeContainerMesh('barrel', 'b2');
      system.registerInteriorContainers([mesh], 'b2', 'Shop');

      const containerId = mesh.metadata.containerId;
      system.openContainer(containerId);
      const second = system.openContainer(containerId);

      expect(second).toBeNull();
    });

    it('returns null for unknown container ID', () => {
      expect(system.openContainer('nonexistent')).toBeNull();
    });

    it('invokes onContainerOpened callback', () => {
      const callback = vi.fn();
      system.onContainerOpened = callback;

      const mesh = makeContainerMesh('crate', 'b3');
      system.registerInteriorContainers([mesh], 'b3', 'Workshop');
      system.openContainer(mesh.metadata.containerId);

      expect(callback).toHaveBeenCalledOnce();
      expect(callback.mock.calls[0][0].type).toBe('crate');
    });
  });

  // ── openContainerByMesh ──────────────────────────────────────────────

  describe('openContainerByMesh', () => {
    it('opens a container when given its mesh', () => {
      const mesh = makeContainerMesh('chest', 'b1');
      system.registerInteriorContainers([mesh], 'b1', 'Tavern');

      const result = system.openContainerByMesh(mesh);
      expect(result).not.toBeNull();
      expect(result!.type).toBe('chest');
    });

    it('returns null for non-container mesh', () => {
      const mesh = makeNonContainerMesh();
      expect(system.openContainerByMesh(mesh)).toBeNull();
    });
  });

  // ── isUnopenedContainer ──────────────────────────────────────────────

  describe('isUnopenedContainer', () => {
    it('returns true for registered unopened container', () => {
      const mesh = makeContainerMesh('chest', 'b1');
      system.registerInteriorContainers([mesh], 'b1', 'Tavern');

      expect(system.isUnopenedContainer(mesh)).toBe(true);
    });

    it('returns false after opening', () => {
      const mesh = makeContainerMesh('chest', 'b1');
      system.registerInteriorContainers([mesh], 'b1', 'Tavern');

      system.openContainerByMesh(mesh);
      expect(system.isUnopenedContainer(mesh)).toBe(false);
    });

    it('returns false for non-container mesh', () => {
      expect(system.isUnopenedContainer(makeNonContainerMesh() as any)).toBe(false);
    });
  });

  // ── clearBuildingContainers ──────────────────────────────────────────

  describe('clearBuildingContainers', () => {
    it('removes interior containers for specified building', () => {
      const mesh1 = makeContainerMesh('chest', 'b1');
      const mesh2 = makeContainerMesh('barrel', 'b2');

      system.registerInteriorContainers([mesh1], 'b1', 'Tavern');
      system.registerInteriorContainers([mesh2], 'b2', 'Shop');

      system.clearBuildingContainers('b1');

      expect(system.getContainerCounts().total).toBe(1);
      expect(system.getContainer(mesh1.metadata.containerId)).toBeUndefined();
      expect(system.getContainer(mesh2.metadata.containerId)).toBeDefined();
    });
  });

  // ── getContainerCounts ───────────────────────────────────────────────

  describe('getContainerCounts', () => {
    it('tracks interior, outdoor, opened, and total', () => {
      const mesh = makeContainerMesh('chest', 'b1');
      system.registerInteriorContainers([mesh], 'b1', 'Tavern');
      system.spawnOutdoorContainers([
        { position: new Vector3(10, 0, 10) as any, containerType: 'barrel' },
      ]);

      const counts = system.getContainerCounts();
      expect(counts.interior).toBe(1);
      expect(counts.outdoor).toBe(1);
      expect(counts.total).toBe(2);
      expect(counts.opened).toBe(0);

      system.openContainerByMesh(mesh);
      expect(system.getContainerCounts().opened).toBe(1);
    });
  });

  // ── dispose ──────────────────────────────────────────────────────────

  describe('dispose', () => {
    it('clears all containers and outdoor meshes', () => {
      const mesh = makeContainerMesh('chest', 'b1');
      system.registerInteriorContainers([mesh], 'b1', 'Tavern');
      system.spawnOutdoorContainers([
        { position: new Vector3(5, 0, 5) as any, containerType: 'crate' },
      ]);

      system.dispose();

      expect(system.getAllContainers()).toHaveLength(0);
      expect(system.getContainerCounts().total).toBe(0);
    });
  });
});
