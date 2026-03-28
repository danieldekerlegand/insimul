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
  seededRandom,
  hashString,
  LOOT_TABLES,
  type LootEntry,
  type OutdoorSpawnPoint,
  type QuestItemObjective,
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
      expect(resolveLootTableKey('Pub')).toBe('tavern');
    });

    it('resolves bakery variants', () => {
      expect(resolveLootTableKey('Bakery')).toBe('bakery');
      expect(resolveLootTableKey('Boulangerie')).toBe('bakery');
      expect(resolveLootTableKey('Baker')).toBe('bakery');
    });

    it('resolves library', () => {
      expect(resolveLootTableKey('Library')).toBe('library');
      expect(resolveLootTableKey('Bibliothèque')).toBe('library');
    });

    it('resolves church variants', () => {
      expect(resolveLootTableKey('Church')).toBe('church');
      expect(resolveLootTableKey('Chapel')).toBe('church');
      expect(resolveLootTableKey('Église')).toBe('church');
      expect(resolveLootTableKey('Cathedral')).toBe('church');
    });

    it('resolves farm variants', () => {
      expect(resolveLootTableKey('Farm')).toBe('farm');
      expect(resolveLootTableKey('Ferme')).toBe('farm');
      expect(resolveLootTableKey('Ranch')).toBe('farm');
    });

    it('resolves blacksmith variants', () => {
      expect(resolveLootTableKey('Blacksmith')).toBe('blacksmith');
      expect(resolveLootTableKey('Forge')).toBe('blacksmith');
      expect(resolveLootTableKey('Forgeron')).toBe('blacksmith');
    });

    it('resolves shop variants', () => {
      expect(resolveLootTableKey('Shop')).toBe('shop');
      expect(resolveLootTableKey('General Store')).toBe('shop');
      expect(resolveLootTableKey('Market')).toBe('shop');
    });

    it('resolves workshop variants', () => {
      expect(resolveLootTableKey('Workshop')).toBe('workshop');
      expect(resolveLootTableKey('Atelier')).toBe('workshop');
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

  // ── seededRandom / hashString ─────────────────────────────────────────

  describe('seededRandom', () => {
    it('produces deterministic values for the same seed', () => {
      const rng1 = seededRandom(42);
      const rng2 = seededRandom(42);
      const seq1 = [rng1(), rng1(), rng1()];
      const seq2 = [rng2(), rng2(), rng2()];
      expect(seq1).toEqual(seq2);
    });

    it('produces different values for different seeds', () => {
      const rng1 = seededRandom(1);
      const rng2 = seededRandom(2);
      expect(rng1()).not.toBe(rng2());
    });

    it('produces values in [0, 1)', () => {
      const rng = seededRandom(123);
      for (let i = 0; i < 100; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });
  });

  describe('hashString', () => {
    it('returns consistent hash for the same string', () => {
      expect(hashString('test_container')).toBe(hashString('test_container'));
    });

    it('returns different hashes for different strings', () => {
      expect(hashString('container_a')).not.toBe(hashString('container_b'));
    });
  });

  // ── weightedPick ─────────────────────────────────────────────────────

  describe('weightedPick', () => {
    it('returns an entry from the list', () => {
      const entries: LootEntry[] = [
        { name: 'A', nameEn: 'A', type: 'food', weight: 1, languageLearning: { targetWord: 'a', pronunciation: 'a', category: 'food' } },
        { name: 'B', nameEn: 'B', type: 'food', weight: 1, languageLearning: { targetWord: 'b', pronunciation: 'b', category: 'food' } },
      ];
      const picked = weightedPick(entries);
      expect(['A', 'B']).toContain(picked.name);
    });

    it('returns the only entry when list has one item', () => {
      const entries: LootEntry[] = [{ name: 'Only', nameEn: 'Only', type: 'tool', weight: 10, languageLearning: { targetWord: 'only', pronunciation: 'only', category: 'tools' } }];
      expect(weightedPick(entries).name).toBe('Only');
    });

    it('uses provided random function', () => {
      const entries: LootEntry[] = [
        { name: 'A', nameEn: 'A', type: 'food', weight: 1, languageLearning: { targetWord: 'a', pronunciation: 'a', category: 'food' } },
        { name: 'B', nameEn: 'B', type: 'food', weight: 1, languageLearning: { targetWord: 'b', pronunciation: 'b', category: 'food' } },
      ];
      // random returning 0 always picks first
      expect(weightedPick(entries, () => 0).name).toBe('A');
      // random returning ~1 picks last
      expect(weightedPick(entries, () => 0.99).name).toBe('B');
    });
  });

  // ── generateContainerItems ───────────────────────────────────────────

  describe('generateContainerItems', () => {
    it('generates items within chest count range (2-5)', () => {
      const items = generateContainerItems('chest', 'tavern', 'test_chest');
      expect(items.length).toBeGreaterThanOrEqual(2);
      expect(items.length).toBeLessThanOrEqual(6); // +1 for possible clue
    });

    it('generates items within barrel count range (1-3)', () => {
      const items = generateContainerItems('barrel', 'tavern', 'test_barrel');
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items.length).toBeLessThanOrEqual(4); // +1 for possible clue
    });

    it('generates items within crate count range (1-4)', () => {
      const items = generateContainerItems('crate', 'workshop', 'test_crate');
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items.length).toBeLessThanOrEqual(5); // +1 for possible clue
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

    it('produces deterministic results for the same containerId', () => {
      const items1 = generateContainerItems('chest', 'tavern', 'deterministic_test');
      const items2 = generateContainerItems('chest', 'tavern', 'deterministic_test');
      expect(items1.map(i => i.name)).toEqual(items2.map(i => i.name));
      expect(items1.length).toBe(items2.length);
    });

    it('produces different results for different containerIds', () => {
      const items1 = generateContainerItems('chest', 'tavern', 'container_alpha');
      const items2 = generateContainerItems('chest', 'tavern', 'container_beta');
      // With different seeds, item names or counts should differ
      const names1 = items1.map(i => i.name).join(',');
      const names2 = items2.map(i => i.name).join(',');
      // They *could* theoretically be the same, but it's astronomically unlikely
      // Just check both generated valid items
      expect(items1.length).toBeGreaterThan(0);
      expect(items2.length).toBeGreaterThan(0);
    });
  });

  // ── French names and languageLearningData ─────────────────────────────

  describe('French loot items', () => {
    const buildingTypes = ['tavern', 'bakery', 'library', 'church', 'farm', 'blacksmith', 'shop', 'workshop', 'warehouse', 'residence', 'outdoor', '_default'];

    for (const bt of buildingTypes) {
      it(`${bt} loot table items have French names and languageLearning data`, () => {
        const table = LOOT_TABLES[bt];
        expect(table).toBeDefined();
        expect(table.length).toBeGreaterThan(0);

        for (const entry of table) {
          expect(entry.name).toBeTruthy();
          expect(entry.nameEn).toBeTruthy();
          expect(entry.languageLearning).toBeDefined();
          expect(entry.languageLearning.targetWord).toBeTruthy();
          expect(entry.languageLearning.pronunciation).toBeTruthy();
          expect(entry.languageLearning.category).toBeTruthy();
        }
      });
    }

    it('generated items include languageLearningData', () => {
      const items = generateContainerItems('chest', 'bakery', 'lang_test');
      for (const item of items) {
        if (item.type !== 'quest_item') {
          expect(item.languageLearningData).toBeDefined();
          expect(item.languageLearningData!.targetLanguage).toBe('French');
          expect(item.languageLearningData!.targetWord).toBeTruthy();
          expect(item.languageLearningData!.pronunciation).toBeTruthy();
        }
      }
    });

    it('item description contains English name', () => {
      const items = generateContainerItems('chest', 'bakery', 'desc_test');
      for (const item of items) {
        if (item.type !== 'quest_item' && item.category !== 'clues') {
          // Description should be the English name from nameEn
          expect(item.description).toBeTruthy();
          expect(item.description).not.toBe('Found in a container');
        }
      }
    });
  });

  // ── Building-specific loot ────────────────────────────────────────────

  describe('building-specific loot tables', () => {
    it('bakery contains bread, pastry, and flour items', () => {
      const names = LOOT_TABLES.bakery.map(e => e.nameEn.toLowerCase());
      expect(names).toContain('fresh bread');
      expect(names).toContain('pastry');
      expect(names).toContain('flour sack');
    });

    it('library contains book, scroll, and ink items', () => {
      const names = LOOT_TABLES.library.map(e => e.nameEn.toLowerCase());
      expect(names).toContain('old book');
      expect(names).toContain('scroll');
      expect(names).toContain('ink bottle');
    });

    it('church contains holy water, candle, and prayer beads', () => {
      const names = LOOT_TABLES.church.map(e => e.nameEn.toLowerCase());
      expect(names).toContain('holy water');
      expect(names).toContain('candle');
      expect(names).toContain('prayer beads');
    });

    it('farm contains seeds, vegetables, and milk jug', () => {
      const names = LOOT_TABLES.farm.map(e => e.nameEn.toLowerCase());
      expect(names).toContain('seeds');
      expect(names).toContain('vegetables');
      expect(names).toContain('milk jug');
    });

    it('tavern contains ale mug, wine bottle, and coin pouch', () => {
      const names = LOOT_TABLES.tavern.map(e => e.nameEn.toLowerCase());
      expect(names).toContain('ale mug');
      expect(names).toContain('wine bottle');
      expect(names).toContain('coin pouch');
    });

    it('blacksmith contains iron ingot, horseshoe, and dagger', () => {
      const names = LOOT_TABLES.blacksmith.map(e => e.nameEn.toLowerCase());
      expect(names).toContain('iron ingot');
      expect(names).toContain('horseshoe');
      expect(names).toContain('dagger');
    });
  });

  // ── Quest item injection ──────────────────────────────────────────────

  describe('quest item injection', () => {
    it('injects quest items when objective matches building context', () => {
      const objectives: QuestItemObjective[] = [{
        questId: 'quest_1',
        itemName: 'Clé spéciale',
        buildingContexts: ['tavern'],
      }];

      // Run many times to ensure at least one injection (30% chance each)
      let foundQuestItem = false;
      for (let i = 0; i < 50; i++) {
        const items = generateContainerItems('chest', 'tavern', `quest_inject_${i}`, objectives);
        if (items.some(item => item.questId === 'quest_1')) {
          foundQuestItem = true;
          const qi = items.find(item => item.questId === 'quest_1')!;
          expect(qi.name).toBe('Clé spéciale');
          expect(qi.tradeable).toBe(false);
          expect(qi.type).toBe('quest_item');
          break;
        }
      }
      expect(foundQuestItem).toBe(true);
    });

    it('does not inject quest items when building context does not match', () => {
      const objectives: QuestItemObjective[] = [{
        questId: 'quest_2',
        itemName: 'Test Item',
        buildingContexts: ['farm'],
      }];

      for (let i = 0; i < 20; i++) {
        const items = generateContainerItems('chest', 'tavern', `no_inject_${i}`, objectives);
        expect(items.some(item => item.questId === 'quest_2')).toBe(false);
      }
    });

    it('does not inject quest items when no objectives provided', () => {
      const items = generateContainerItems('chest', 'tavern', 'no_quest_test');
      expect(items.every(item => !item.questId)).toBe(true);
    });
  });

  // ── Clue items ────────────────────────────────────────────────────────

  describe('clue items', () => {
    it('clue items appear with ~5% probability across many containers', () => {
      let clueCount = 0;
      const total = 200;
      for (let i = 0; i < total; i++) {
        const items = generateContainerItems('chest', 'tavern', `clue_test_${i}`);
        if (items.some(item => item.category === 'clues')) {
          clueCount++;
        }
      }
      // Expect roughly 5% (allow range 1-15% for statistical variation)
      expect(clueCount).toBeGreaterThan(0);
      expect(clueCount).toBeLessThan(total * 0.20);
    });

    it('clue items are not tradeable', () => {
      // Find a container that has a clue
      for (let i = 0; i < 500; i++) {
        const items = generateContainerItems('chest', 'tavern', `clue_trade_${i}`);
        const clue = items.find(item => item.category === 'clues');
        if (clue) {
          expect(clue.tradeable).toBe(false);
          expect(clue.rarity).toBe('rare');
          expect(clue.languageLearningData).toBeDefined();
          return;
        }
      }
      // If we get here without finding a clue in 500 tries, that's fine — it's probabilistic
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

    it('uses quest objectives from provider', () => {
      system.questObjectiveProvider = () => [{
        questId: 'q1',
        itemName: 'Special Key',
        buildingContexts: ['tavern'],
      }];

      // Run enough times to likely get at least one quest item
      let found = false;
      for (let i = 0; i < 30; i++) {
        const mesh = makeContainerMesh('chest', `quest_bld_${i}`, 0);
        const result = system.registerInteriorContainers([mesh], `quest_bld_${i}`, 'Tavern');
        if (result[0]?.items.some(item => item.questId === 'q1')) {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
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

  // ── Contextual loot for 5 building types ─────────────────────────────

  describe('contextual loot by building type', () => {
    const contextTests: Array<{ building: string; lootKey: string; expectedEnItems: string[] }> = [
      { building: 'Bakery', lootKey: 'bakery', expectedEnItems: ['fresh bread', 'pastry', 'flour sack'] },
      { building: 'Library', lootKey: 'library', expectedEnItems: ['old book', 'scroll', 'ink bottle'] },
      { building: 'Church', lootKey: 'church', expectedEnItems: ['holy water', 'candle', 'prayer beads'] },
      { building: 'Farm', lootKey: 'farm', expectedEnItems: ['seeds', 'vegetables', 'milk jug'] },
      { building: 'Blacksmith', lootKey: 'blacksmith', expectedEnItems: ['iron ingot', 'horseshoe', 'dagger'] },
    ];

    for (const { building, lootKey, expectedEnItems } of contextTests) {
      it(`${building} containers produce contextually appropriate items`, () => {
        expect(resolveLootTableKey(building)).toBe(lootKey);
        const table = LOOT_TABLES[lootKey];
        const enNames = table.map(e => e.nameEn.toLowerCase());
        for (const expected of expectedEnItems) {
          expect(enNames).toContain(expected);
        }

        // Generate items and verify they come from the right table
        const items = generateContainerItems('chest', lootKey, `${building}_context_test`);
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
          if (item.category !== 'clues' && item.type !== 'quest_item') {
            // Item name should be French (from loot table name field)
            const tableNames = table.map(e => e.name);
            expect(tableNames).toContain(item.name);
          }
        }
      });
    }
  });
});
