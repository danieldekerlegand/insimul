/**
 * Tests for Godot world map export feature.
 *
 * Verifies that the world_map.gd template is generated with correct token
 * substitution, registered in the scene, and that the scene descriptor
 * includes required map data.
 */

import { describe, it, expect } from 'vitest';
import { generateSceneFiles } from '../services/game-export/godot/godot-scene-generator';
import { generateGDScriptFiles } from '../services/game-export/godot/godot-gdscript-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(overrides?: Partial<WorldIR>): WorldIR {
  return {
    meta: {
      worldId: 'w1',
      worldName: 'Test World',
      worldType: 'medieval_fantasy',
      seed: 'test-seed',
      insimulVersion: '1.0.0',
      exportedAt: '2026-03-14',
      genreConfig: {
        id: 'medieval_fantasy',
        name: 'Medieval Fantasy',
        features: { crafting: false, resources: false, magic: false },
        worldDefaults: {},
      },
    },
    geography: {
      terrainSize: 400,
      countries: [],
      states: [],
      settlements: [
        {
          id: 'settlement-1',
          name: 'Testville',
          description: 'A test town',
          settlementType: 'town',
          population: 50,
          position: { x: 100, y: 0, z: 100 },
          radius: 50,
          countryId: null,
          stateId: null,
          mayorId: null,
          elevationProfile: { minElevation: 0, maxElevation: 5, meanElevation: 2, elevationRange: 5, slopeClass: 'flat' },
          lots: [],
          businessIds: [],
          roads: [],
          infrastructure: [],
          streetNetwork: { layout: 'grid', nodes: [], segments: [] },
        },
        {
          id: 'settlement-2',
          name: 'Otherton',
          description: 'Another town',
          settlementType: 'village',
          population: 20,
          position: { x: 300, y: 0, z: 250 },
          radius: 30,
          countryId: null,
          stateId: null,
          mayorId: null,
          elevationProfile: { minElevation: 0, maxElevation: 3, meanElevation: 1, elevationRange: 3, slopeClass: 'flat' },
          lots: [],
          businessIds: [],
          roads: [],
          infrastructure: [],
          streetNetwork: { layout: 'organic', nodes: [], segments: [] },
        },
      ],
      waterFeatures: [
        {
          id: 'wf-lake',
          worldId: 'w1',
          type: 'lake',
          subType: 'fresh',
          name: 'Crystal Lake',
          position: { x: 200, y: 0, z: 200 },
          waterLevel: -1,
          bounds: { minX: 180, maxX: 220, minZ: 180, maxZ: 220, centerX: 200, centerZ: 200 },
          depth: 10,
          width: 40,
          flowDirection: null,
          flowSpeed: 0,
          shorelinePoints: [],
          settlementId: null,
          biome: 'temperate',
          isNavigable: true,
          isDrinkable: true,
          modelAssetKey: null,
          color: { r: 0.1, g: 0.4, b: 0.7 },
          transparency: 0.3,
        },
      ],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      businesses: [],
      roads: [
        {
          fromId: 'settlement-1',
          toId: 'settlement-2',
          waypoints: [
            { x: 100, y: 0, z: 100 },
            { x: 200, y: 0, z: 175 },
            { x: 300, y: 0, z: 250 },
          ],
          width: 4,
          materialKey: null,
        },
      ],
      natureObjects: [],
      animals: [],
      dungeons: [],
      questObjects: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [
        {
          id: 'q1',
          name: 'Find the crystal',
          description: 'Go find the crystal',
          questType: 'fetch',
          status: 'available',
          locationId: 'settlement-1',
          locationName: 'Testville',
          locationPosition: { x: 100, y: 0, z: 100 },
          objectives: [],
          rewards: [],
          prerequisites: [],
          assignedNpcId: null,
          turnInNpcId: null,
        },
      ],
      truths: [],
      grammars: [],
      languages: [],
      items: [],
      lootTables: [],
      dialogueContexts: [],
      knowledgeBase: '',
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.3, g: 0.5, b: 0.2 },
        skyColor: { r: 0.5, g: 0.7, b: 1.0 },
        roadColor: { r: 0.4, g: 0.35, b: 0.3 },
        roadRadius: 2,
        settlementBaseColor: { r: 0.7, g: 0.6, b: 0.5 },
        settlementRoofColor: { r: 0.5, g: 0.3, b: 0.2 },
      },
      ambientLighting: { color: [0.5, 0.5, 0.5], intensity: 0.5 },
      directionalLight: { direction: [0, -1, 0.5], intensity: 1 },
      fog: null,
    },
    assets: { textures: [], models: [], audio: [], animations: [] },
    player: {
      startPosition: { x: 100, y: 1, z: 100 },
      speed: 5,
      jumpHeight: 1.5,
      gravity: 9.8,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
    },
    ui: { showMinimap: true, showQuestTracker: true, showChat: true },
    combat: {
      style: 'real-time',
      settings: {
        baseDamage: 10,
        criticalChance: 0.1,
        criticalMultiplier: 2,
        blockReduction: 0.5,
        dodgeChance: 0.1,
        attackCooldown: 1000,
      },
    },
    survival: null,
    resources: null,
    aiConfig: { apiMode: 'none', model: '', endpoint: '' },
    ...overrides,
  } as WorldIR;
}

// ─────────────────────────────────────────────
// GDScript generator tests
// ─────────────────────────────────────────────

describe('Godot GDScript generator - world map', () => {
  it('includes world_map.gd in output', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const worldMap = files.find(f => f.path === 'scripts/ui/world_map.gd');
    expect(worldMap).toBeDefined();
  });

  it('substitutes terrain size token', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const worldMap = files.find(f => f.path === 'scripts/ui/world_map.gd')!;

    expect(worldMap.content).not.toContain('{{TERRAIN_SIZE}}');
    expect(worldMap.content).toContain('var _terrain_size := 400');
  });

  it('substitutes ground color tokens', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const worldMap = files.find(f => f.path === 'scripts/ui/world_map.gd')!;

    expect(worldMap.content).not.toContain('{{GROUND_COLOR_R}}');
    expect(worldMap.content).toContain('Color(0.3, 0.5, 0.2)');
  });

  it('substitutes road color tokens', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const worldMap = files.find(f => f.path === 'scripts/ui/world_map.gd')!;

    expect(worldMap.content).not.toContain('{{ROAD_COLOR_R}}');
    expect(worldMap.content).toContain('Color(0.4, 0.35, 0.3)');
  });

  it('contains key map features', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const worldMap = files.find(f => f.path === 'scripts/ui/world_map.gd')!;

    // Toggle with M key
    expect(worldMap.content).toContain('KEY_M');
    // Pan and zoom
    expect(worldMap.content).toContain('MOUSE_BUTTON_WHEEL_UP');
    expect(worldMap.content).toContain('MOUSE_BUTTON_WHEEL_DOWN');
    expect(worldMap.content).toContain('_is_dragging');
    // Pause game
    expect(worldMap.content).toContain('get_tree().paused');
    // Drawing methods
    expect(worldMap.content).toContain('_draw_settlements');
    expect(worldMap.content).toContain('_draw_roads');
    expect(worldMap.content).toContain('_draw_player');
    expect(worldMap.content).toContain('_draw_quest_markers');
    expect(worldMap.content).toContain('_draw_water');
  });

  it('uses different terrain sizes based on IR', () => {
    const ir = makeMinimalIR({
      geography: {
        ...makeMinimalIR().geography,
        terrainSize: 800,
      },
    });
    const files = generateGDScriptFiles(ir);
    const worldMap = files.find(f => f.path === 'scripts/ui/world_map.gd')!;

    expect(worldMap.content).toContain('var _terrain_size := 800');
  });
});

// ─────────────────────────────────────────────
// Scene generator tests
// ─────────────────────────────────────────────

describe('Godot scene generator - world map', () => {
  it('includes WorldMap node in main.tscn', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscnFile = files.find(f => f.path === 'scenes/main.tscn')!;

    expect(tscnFile.content).toContain('[node name="WorldMap"');
  });

  it('has external resource for world_map.gd', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscnFile = files.find(f => f.path === 'scenes/main.tscn')!;

    expect(tscnFile.content).toContain('path="res://scripts/ui/world_map.gd"');
  });

  it('WorldMap node is a CanvasLayer with process_mode 3 (Always)', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscnFile = files.find(f => f.path === 'scenes/main.tscn')!;

    expect(tscnFile.content).toContain('type="CanvasLayer"');
    // process_mode = 3 means PROCESS_MODE_ALWAYS so it works while paused
    expect(tscnFile.content).toContain('process_mode = 3');
  });

  it('scene descriptor includes settlements with position data for map', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(
      files.find(f => f.path === 'data/scene_descriptor.json')!.content,
    );

    expect(descriptor.settlements).toHaveLength(2);
    expect(descriptor.settlements[0].position).toEqual({ x: 100, y: 0, z: 100 });
    expect(descriptor.settlements[0].name).toBe('Testville');
    expect(descriptor.settlements[0].population).toBe(50);
    expect(descriptor.settlements[1].name).toBe('Otherton');
  });

  it('scene descriptor includes roads for map rendering', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(
      files.find(f => f.path === 'data/scene_descriptor.json')!.content,
    );

    expect(descriptor.roads).toBeDefined();
  });

  it('scene descriptor includes water features for map rendering', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(
      files.find(f => f.path === 'data/scene_descriptor.json')!.content,
    );

    expect(descriptor.waterFeatures).toHaveLength(1);
    expect(descriptor.waterFeatures[0].bounds.minX).toBe(180);
  });

  it('load_steps count includes world_map.gd resource', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscnFile = files.find(f => f.path === 'scenes/main.tscn')!;

    // Dynamically verify load_steps matches ext_resource count + 3 sub_resources
    const extCount = (tscnFile.content.match(/\[ext_resource/g) || []).length;
    expect(tscnFile.content).toContain(`load_steps=${extCount + 3}`);
  });
});
