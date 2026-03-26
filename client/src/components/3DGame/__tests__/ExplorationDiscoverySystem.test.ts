/**
 * Tests for ExplorationDiscoverySystem
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Vector3 } from '@babylonjs/core';
import { GameEventBus, type GameEvent } from '../GameEventBus';
import { NotificationStore } from '../NotificationStore';
import {
  ExplorationDiscoverySystem,
  getDefaultHiddenLocations,
  getExplorationQuests,
  type HiddenLocationDef,
} from '../ExplorationDiscoverySystem';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeMinimalScene(): any {
  return {
    actionManager: null,
    // GlowLayer constructor needs a scene with getEngine
    getEngine: () => ({
      getRenderWidth: () => 800,
      getRenderHeight: () => 600,
      _gl: {},
      scenes: [],
    }),
    effectLayers: [],
    onDisposeObservable: { add: vi.fn() },
    // MeshBuilder needs scene.addMesh
    addMesh: vi.fn(),
    removeMesh: vi.fn(),
    getMeshByName: vi.fn(),
    meshes: [],
  };
}

function makeProjectToGround(): (x: number, z: number) => Vector3 {
  return (x: number, z: number) => new Vector3(x, 0, z);
}

function makeTwoLocations(): HiddenLocationDef[] {
  return [
    {
      id: 'loc_a',
      nameFr: 'Lieu A',
      nameEn: 'Location A',
      description: 'Test location A',
      position: { x: 10, z: 10 },
      rarity: 'common',
      isWriterSecret: false,
      investigationPoints: [
        { id: 'ip_a1', offset: { x: 1, z: 0 }, contentType: 'lore', contentFr: 'Texte français', contentEn: 'English text' },
      ],
    },
    {
      id: 'loc_b',
      nameFr: 'Lieu B',
      nameEn: 'Location B',
      description: 'Test location B',
      position: { x: -50, z: -50 },
      rarity: 'rare',
      isWriterSecret: true,
      investigationPoints: [
        { id: 'ip_b1', offset: { x: 0, z: 1 }, contentType: 'clue', contentFr: 'Un indice', contentEn: 'A clue' },
        { id: 'ip_b2', offset: { x: 2, z: 0 }, contentType: 'vocabulary', contentFr: 'le mot', contentEn: 'the word' },
      ],
    },
  ];
}

// ── Mock Babylon mesh creation ───────────────────────────────────────────────

vi.mock('@babylonjs/core', async () => {
  const actual = await vi.importActual<typeof import('@babylonjs/core')>('@babylonjs/core');

  // Minimal mesh mock
  class MockMesh {
    name: string;
    position = new actual.Vector3(0, 0, 0);
    material: any = null;
    isPickable = true;
    actionManager: any = null;
    dispose = vi.fn();
    setEnabled = vi.fn();
  }

  // Minimal material mock
  class MockMaterial {
    name: string;
    diffuseColor = new actual.Color3(1, 1, 1);
    emissiveColor = new actual.Color3(0, 0, 0);
    alpha = 1;
    constructor(name: string) { this.name = name; }
    dispose = vi.fn();
  }

  return {
    ...actual,
    MeshBuilder: {
      CreateCylinder: (name: string) => {
        const m = new MockMesh();
        m.name = name;
        return m;
      },
      CreateSphere: (name: string) => {
        const m = new MockMesh();
        m.name = name;
        return m;
      },
    },
    StandardMaterial: MockMaterial,
    GlowLayer: class {
      intensity = 0;
      addIncludedOnlyMesh = vi.fn();
      dispose = vi.fn();
    },
    ActionManager: class {
      static OnPickTrigger = 1;
      registerAction = vi.fn();
    },
    ExecuteCodeAction: class {
      constructor(public trigger: number, public func: () => void) {}
    },
  };
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ExplorationDiscoverySystem', () => {
  let scene: any;
  let eventBus: GameEventBus;
  let system: ExplorationDiscoverySystem;
  let locations: HiddenLocationDef[];

  beforeEach(() => {
    scene = makeMinimalScene();
    eventBus = new GameEventBus();
    locations = makeTwoLocations();
    NotificationStore.clear();
    system = new ExplorationDiscoverySystem(scene, eventBus, locations, makeProjectToGround());
  });

  afterEach(() => {
    system.dispose();
    eventBus.dispose();
  });

  // ── getDefaultHiddenLocations ──────────────────────────────────────────

  it('generates 6 default hidden locations', () => {
    const defs = getDefaultHiddenLocations(512);
    expect(defs).toHaveLength(6);
    expect(defs.map((d) => d.id)).toEqual([
      'hidden_clearing',
      'abandoned_cabin',
      'old_well',
      'cave_entrance',
      'ancient_tree',
      'secret_garden',
    ]);
  });

  it('marks 3 locations as writer secrets', () => {
    const defs = getDefaultHiddenLocations(512);
    const secrets = defs.filter((d) => d.isWriterSecret);
    expect(secrets).toHaveLength(3);
  });

  it('all default locations have investigation points', () => {
    const defs = getDefaultHiddenLocations(512);
    for (const d of defs) {
      expect(d.investigationPoints.length).toBeGreaterThan(0);
    }
  });

  // ── getExplorationQuests ───────────────────────────────────────────────

  it('provides 3 exploration quests', () => {
    const quests = getExplorationQuests();
    expect(quests).toHaveLength(3);
    expect(quests.map((q) => q.id)).toEqual([
      'quest_discover_3',
      'quest_investigate_cabin',
      'quest_writer_secrets',
    ]);
  });

  // ── Initial state ─────────────────────────────────────────────────────

  it('starts with no discoveries', () => {
    expect(system.getProgress()).toEqual({ discovered: 0, total: 2 });
    expect(system.getDiscoveredLocations()).toHaveLength(0);
  });

  it('reports location definitions', () => {
    expect(system.getLocationDefs()).toHaveLength(2);
  });

  // ── Discovery via proximity ────────────────────────────────────────────

  it('discovers a location when player enters 15m radius', () => {
    const events: GameEvent[] = [];
    eventBus.onAny((e) => events.push(e));

    // Player at (10, 0, 10) — exactly at loc_a position
    system.checkPlayerProximity(new Vector3(10, 0, 10));

    expect(system.isDiscovered('loc_a')).toBe(true);
    expect(system.isDiscovered('loc_b')).toBe(false);
    expect(system.getProgress()).toEqual({ discovered: 1, total: 2 });

    // Check location_discovered event was emitted
    const discoveryEvents = events.filter((e) => e.type === 'location_discovered');
    expect(discoveryEvents).toHaveLength(1);
    expect(discoveryEvents[0]).toMatchObject({
      type: 'location_discovered',
      locationId: 'loc_a',
      locationName: 'Lieu A',
    });

    // Check XP event (common = 10 XP)
    const xpEvents = events.filter((e) => e.type === 'xp_gained');
    expect(xpEvents).toHaveLength(1);
    expect((xpEvents[0] as any).amount).toBe(10);
  });

  it('does not discover location when player is outside radius', () => {
    system.checkPlayerProximity(new Vector3(30, 0, 30));
    expect(system.isDiscovered('loc_a')).toBe(false);
  });

  it('discovers location at boundary (14.9m)', () => {
    // loc_a is at (10, 10). 15m radius => boundary check
    // Distance from (10, 0, 10) to (24.9, 0, 10) = 14.9m
    system.checkPlayerProximity(new Vector3(24.9, 0, 10));
    expect(system.isDiscovered('loc_a')).toBe(true);
  });

  it('does not re-discover already discovered location', () => {
    const events: GameEvent[] = [];
    eventBus.onAny((e) => events.push(e));

    system.checkPlayerProximity(new Vector3(10, 0, 10));
    system.checkPlayerProximity(new Vector3(10, 0, 10));

    const discoveryEvents = events.filter((e) => e.type === 'location_discovered');
    expect(discoveryEvents).toHaveLength(1); // only once
  });

  it('awards more XP for rare locations', () => {
    const events: GameEvent[] = [];
    eventBus.onAny((e) => events.push(e));

    // Discover loc_b (rare)
    system.checkPlayerProximity(new Vector3(-50, 0, -50));

    const xpEvents = events.filter((e) => e.type === 'xp_gained');
    expect(xpEvents).toHaveLength(1);
    expect((xpEvents[0] as any).amount).toBe(25); // rare = 25 XP
  });

  // ── Notifications ─────────────────────────────────────────────────────

  it('pushes discovery notification to NotificationStore', () => {
    system.checkPlayerProximity(new Vector3(10, 0, 10));

    const notifications = NotificationStore.all();
    expect(notifications.length).toBeGreaterThanOrEqual(1);
    const discoveryNotif = notifications.find((n) => n.title.includes('Lieu A'));
    expect(discoveryNotif).toBeDefined();
    expect(discoveryNotif!.title).toContain('Lieu A');
    expect(discoveryNotif!.description).toContain('Location A');
  });

  // ── Minimap markers ───────────────────────────────────────────────────

  it('returns no minimap markers before discovery', () => {
    expect(system.getMinimapMarkers()).toHaveLength(0);
  });

  it('returns minimap marker after discovery', () => {
    system.checkPlayerProximity(new Vector3(10, 0, 10));

    const markers = system.getMinimapMarkers();
    expect(markers).toHaveLength(1);
    expect(markers[0].id).toBe('discovery_loc_a');
    expect(markers[0].label).toContain('Lieu A');
    expect(markers[0].label).toContain('Location A');
  });

  // ── Discovery progress ────────────────────────────────────────────────

  it('tracks discovery progress correctly', () => {
    expect(system.getProgress()).toEqual({ discovered: 0, total: 2 });

    system.checkPlayerProximity(new Vector3(10, 0, 10));
    expect(system.getProgress()).toEqual({ discovered: 1, total: 2 });

    system.checkPlayerProximity(new Vector3(-50, 0, -50));
    expect(system.getProgress()).toEqual({ discovered: 2, total: 2 });
  });

  // ── getDiscoveredLocations ─────────────────────────────────────────────

  it('returns discovered location details', () => {
    system.checkPlayerProximity(new Vector3(10, 0, 10));

    const discovered = system.getDiscoveredLocations();
    expect(discovered).toHaveLength(1);
    expect(discovered[0].id).toBe('loc_a');
    expect(discovered[0].nameFr).toBe('Lieu A');
    expect(discovered[0].nameEn).toBe('Location A');
    expect(discovered[0].discoveredAt).toBeGreaterThan(0);
    expect(discovered[0].investigated.size).toBe(0);
  });

  // ── Dispose ────────────────────────────────────────────────────────────

  it('stops processing after dispose', () => {
    system.dispose();

    system.checkPlayerProximity(new Vector3(10, 0, 10));
    expect(system.isDiscovered('loc_a')).toBe(false);
  });
});
