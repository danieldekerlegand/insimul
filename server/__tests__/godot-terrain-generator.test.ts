/**
 * Tests for Godot terrain heightmap mesh generator (terrain_generator.gd)
 *
 * Verifies that the terrain generator GDScript template is included in the
 * export pipeline, properly wired into the scene, and has correct token
 * substitution.
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
      worldName: 'Terrain Test World',
      worldType: 'medieval_fantasy',
      seed: 'terrain-seed',
      insimulVersion: '1.0.0',
      exportedAt: '2026-03-24',
      genreConfig: {
        id: 'medieval_fantasy',
        name: 'Medieval Fantasy',
        features: { crafting: false, resources: false, magic: false },
        worldDefaults: {},
      },
    },
    geography: {
      terrainSize: 256,
      heightmap: [
        [0.0, 0.1, 0.2],
        [0.1, 0.5, 0.3],
        [0.2, 0.3, 0.8],
      ],
      slopeMap: [
        [0.0, 0.1, 0.05],
        [0.1, 0.4, 0.2],
        [0.05, 0.2, 0.6],
      ],
      terrainFeatures: [
        {
          id: 'peak-1',
          name: 'Test Peak',
          featureType: 'peak',
          position: { x: 128, y: 20, z: 128 },
          radius: 30,
          elevation: 20,
        },
      ],
      biomeZones: [],
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      businesses: [],
      roads: [],
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
      quests: [],
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
      startPosition: { x: 128, y: 1, z: 128 },
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

describe('Godot GDScript generator - terrain generator', () => {
  it('includes terrain_generator.gd in output', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const terrainGen = files.find(f => f.path === 'scripts/world/terrain_generator.gd');
    expect(terrainGen).toBeDefined();
  });

  it('substitutes terrain tokens correctly', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const terrainGen = files.find(f => f.path === 'scripts/world/terrain_generator.gd');
    expect(terrainGen).toBeDefined();

    const content = terrainGen!.content;
    // Should not contain unresolved tokens
    expect(content).not.toContain('{{TERRAIN_SIZE}}');
    expect(content).not.toContain('{{HEIGHT_SCALE}}');
    expect(content).not.toContain('{{GROUND_COLOR_R}}');
    expect(content).not.toContain('{{SLOPE_COLOR_R}}');
    expect(content).not.toContain('{{PEAK_COLOR_R}}');

    // Terrain size should match IR
    expect(content).toContain('terrain_size := 256');
    // Height scale = terrainSize * 0.15 = 38.4
    expect(content).toContain('height_scale := 38.4');
  });

  it('uses ground color from theme', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const terrainGen = files.find(f => f.path === 'scripts/world/terrain_generator.gd');

    // Ground color from theme: r=0.3, g=0.5, b=0.2
    expect(terrainGen!.content).toContain('ground_color := Color(0.3, 0.5, 0.2)');
  });

  it('terrain generator has generate_from_data method', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const terrainGen = files.find(f => f.path === 'scripts/world/terrain_generator.gd');

    expect(terrainGen!.content).toContain('func generate_from_data(world_data: Dictionary)');
  });

  it('terrain generator has sample_height method', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const terrainGen = files.find(f => f.path === 'scripts/world/terrain_generator.gd');

    expect(terrainGen!.content).toContain('func sample_height(world_x: float, world_z: float) -> float');
  });

  it('terrain generator creates ArrayMesh for heightmap', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const terrainGen = files.find(f => f.path === 'scripts/world/terrain_generator.gd');

    expect(terrainGen!.content).toContain('ArrayMesh.new()');
    expect(terrainGen!.content).toContain('add_surface_from_arrays');
  });

  it('terrain generator creates ConcavePolygonShape3D for collision', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const terrainGen = files.find(f => f.path === 'scripts/world/terrain_generator.gd');

    expect(terrainGen!.content).toContain('ConcavePolygonShape3D.new()');
    expect(terrainGen!.content).toContain('StaticBody3D.new()');
  });

  it('terrain generator uses vertex colors for slope-based texturing', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const terrainGen = files.find(f => f.path === 'scripts/world/terrain_generator.gd');

    expect(terrainGen!.content).toContain('vertex_color_use_as_albedo = true');
    expect(terrainGen!.content).toContain('Mesh.ARRAY_COLOR');
  });

  it('terrain generator falls back to flat terrain without heightmap', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const terrainGen = files.find(f => f.path === 'scripts/world/terrain_generator.gd');

    expect(terrainGen!.content).toContain('_generate_flat_terrain()');
    expect(terrainGen!.content).toContain('PlaneMesh.new()');
  });
});

// ─────────────────────────────────────────────
// Scene generator tests
// ─────────────────────────────────────────────

describe('Godot scene generator - terrain generator', () => {
  it('includes TerrainGenerator node in main.tscn', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscnFile = files.find(f => f.path === 'scenes/main.tscn');
    expect(tscnFile).toBeDefined();

    expect(tscnFile!.content).toContain('[node name="TerrainGenerator"');
    expect(tscnFile!.content).toContain('terrain_generator.gd');
  });

  it('has correct external resource for terrain_generator.gd', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscnFile = files.find(f => f.path === 'scenes/main.tscn');

    expect(tscnFile!.content).toContain('path="res://scripts/world/terrain_generator.gd"');
  });

  it('includes heightmap in scene descriptor terrain data', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const descriptorFile = files.find(f => f.path === 'data/scene_descriptor.json');
    expect(descriptorFile).toBeDefined();

    const descriptor = JSON.parse(descriptorFile!.content);
    expect(descriptor.terrain).toBeDefined();
    expect(descriptor.terrain.size).toBe(256);
    expect(descriptor.terrain.heightmap).toBeDefined();
    expect(descriptor.terrain.heightmap).toHaveLength(3);
    expect(descriptor.terrain.heightmap[0]).toHaveLength(3);
  });

  it('includes slopeMap in scene descriptor terrain data', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const descriptorFile = files.find(f => f.path === 'data/scene_descriptor.json');
    const descriptor = JSON.parse(descriptorFile!.content);

    expect(descriptor.terrain.slopeMap).toBeDefined();
    expect(descriptor.terrain.slopeMap).toHaveLength(3);
  });

  it('includes terrainFeatures in scene descriptor', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const descriptorFile = files.find(f => f.path === 'data/scene_descriptor.json');
    const descriptor = JSON.parse(descriptorFile!.content);

    expect(descriptor.terrain.terrainFeatures).toHaveLength(1);
    expect(descriptor.terrain.terrainFeatures[0].featureType).toBe('peak');
  });

  it('handles null heightmap gracefully', () => {
    const ir = makeMinimalIR({
      geography: {
        ...makeMinimalIR().geography,
        heightmap: undefined,
        slopeMap: undefined,
      },
    });
    const files = generateSceneFiles(ir);
    const descriptorFile = files.find(f => f.path === 'data/scene_descriptor.json');
    const descriptor = JSON.parse(descriptorFile!.content);

    expect(descriptor.terrain.heightmap).toBeNull();
    expect(descriptor.terrain.slopeMap).toBeNull();
  });

  it('TerrainGenerator node appears after WorldScaleManager', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscnFile = files.find(f => f.path === 'scenes/main.tscn');
    const content = tscnFile!.content;

    const scaleIdx = content.indexOf('WorldScaleManager');
    const terrainIdx = content.indexOf('TerrainGenerator');
    const buildingIdx = content.indexOf('BuildingGenerator');

    expect(scaleIdx).toBeGreaterThan(-1);
    expect(terrainIdx).toBeGreaterThan(scaleIdx);
    expect(buildingIdx).toBeGreaterThan(terrainIdx);
  });
});
