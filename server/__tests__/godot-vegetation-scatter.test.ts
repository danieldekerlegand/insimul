/**
 * Tests for Godot vegetation scatter (nature_generator.gd)
 *
 * Verifies that:
 * 1. The data generator correctly exports foliage_layers.json
 * 2. The GDScript nature_generator.gd template is included in exports
 * 3. Foliage layer data has the expected structure for the GDScript consumer
 */

import { describe, it, expect } from 'vitest';
import { generateDataFiles } from '../services/game-export/godot/godot-data-generator';
import { generateGDScriptFiles } from '../services/game-export/godot/godot-gdscript-generator';
import type { WorldIR, FoliageLayerIR } from '@shared/game-engine/ir-types';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

const SAMPLE_FOLIAGE_LAYERS: FoliageLayerIR[] = [
  {
    type: 'grass',
    biome: 'temperate',
    settlementId: 'settlement-1',
    density: 0.8,
    scaleRange: [0.5, 1.5],
    maxSlope: 0.6,
    elevationRange: [0, 0.5],
    instances: [
      { position: { x: 10, y: 0, z: 20 }, rotation: 0.5, scale: 1.0, speciesId: 'tall_grass' },
      { position: { x: 15, y: 0.1, z: 25 }, rotation: 1.2, scale: 0.8, speciesId: 'short_grass' },
      { position: { x: 20, y: 0, z: 30 }, rotation: 2.1, scale: 1.2, speciesId: 'tall_grass' },
    ],
  },
  {
    type: 'bush',
    biome: 'temperate',
    settlementId: 'settlement-1',
    density: 0.3,
    scaleRange: [0.8, 2.0],
    maxSlope: 0.4,
    elevationRange: [0, 0.7],
    instances: [
      { position: { x: 50, y: 1, z: 60 }, rotation: 0, scale: 1.5, speciesId: 'holly_bush' },
    ],
  },
  {
    type: 'flower',
    biome: 'tropical',
    settlementId: 'settlement-2',
    density: 0.5,
    scaleRange: [0.3, 0.8],
    maxSlope: 0.5,
    elevationRange: [0.1, 0.4],
    instances: [],
  },
];

function makeIRWithFoliage(foliageLayers: FoliageLayerIR[] = SAMPLE_FOLIAGE_LAYERS): WorldIR {
  return {
    meta: {
      worldId: 'w1',
      worldName: 'Test World',
      worldType: 'medieval_fantasy',
      seed: 'vegetation-test',
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
      terrainSize: 200,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
      foliageLayers,
      biomeZones: [],
      terrainFeatures: [],
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
  } as WorldIR;
}

// ─────────────────────────────────────────────
// Data generator: foliage layers
// ─────────────────────────────────────────────

describe('Godot data generator - foliage layers', () => {
  it('generates foliage_layers.json file', () => {
    const ir = makeIRWithFoliage();
    const files = generateDataFiles(ir);
    const flFile = files.find(f => f.path === 'data/foliage_layers.json');
    expect(flFile).toBeDefined();
  });

  it('exports correct number of foliage layers', () => {
    const ir = makeIRWithFoliage();
    const files = generateDataFiles(ir);
    const flFile = files.find(f => f.path === 'data/foliage_layers.json');
    const layers = JSON.parse(flFile!.content);
    expect(layers).toHaveLength(3);
  });

  it('exports layer metadata correctly', () => {
    const ir = makeIRWithFoliage();
    const files = generateDataFiles(ir);
    const flFile = files.find(f => f.path === 'data/foliage_layers.json');
    const layers = JSON.parse(flFile!.content);
    const grassLayer = layers[0];

    expect(grassLayer.type).toBe('grass');
    expect(grassLayer.biome).toBe('temperate');
    expect(grassLayer.settlement_id).toBe('settlement-1');
    expect(grassLayer.density).toBe(0.8);
    expect(grassLayer.scale_range_min).toBe(0.5);
    expect(grassLayer.scale_range_max).toBe(1.5);
    expect(grassLayer.max_slope).toBe(0.6);
    expect(grassLayer.elevation_range_min).toBe(0);
    expect(grassLayer.elevation_range_max).toBe(0.5);
  });

  it('exports instance data with position, rotation, scale, species_id', () => {
    const ir = makeIRWithFoliage();
    const files = generateDataFiles(ir);
    const flFile = files.find(f => f.path === 'data/foliage_layers.json');
    const layers = JSON.parse(flFile!.content);
    const grassLayer = layers[0];

    expect(grassLayer.instance_count).toBe(3);
    expect(grassLayer.instances).toHaveLength(3);

    const inst = grassLayer.instances[0];
    expect(inst.x).toBe(10);
    expect(inst.y).toBe(0);
    expect(inst.z).toBe(20);
    expect(inst.rotation).toBe(0.5);
    expect(inst.scale).toBe(1.0);
    expect(inst.species_id).toBe('tall_grass');
  });

  it('handles layers with empty instances', () => {
    const ir = makeIRWithFoliage();
    const files = generateDataFiles(ir);
    const flFile = files.find(f => f.path === 'data/foliage_layers.json');
    const layers = JSON.parse(flFile!.content);
    const flowerLayer = layers[2];

    expect(flowerLayer.type).toBe('flower');
    expect(flowerLayer.instance_count).toBe(0);
    expect(flowerLayer.instances).toHaveLength(0);
  });

  it('handles IR with no foliage layers', () => {
    const ir = makeIRWithFoliage([]);
    const files = generateDataFiles(ir);
    const flFile = files.find(f => f.path === 'data/foliage_layers.json');
    expect(flFile).toBeDefined();
    const layers = JSON.parse(flFile!.content);
    expect(layers).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────
// GDScript template: nature_generator.gd
// ─────────────────────────────────────────────

describe('Godot GDScript - nature_generator.gd template', () => {
  it('nature_generator.gd template file exists', () => {
    const templatePath = path.resolve(
      __dirname,
      '../services/game-export/godot/templates/scripts/world/nature_generator.gd',
    );
    expect(fs.existsSync(templatePath)).toBe(true);
  });

  it('contains generate_from_data entry point', () => {
    const templatePath = path.resolve(
      __dirname,
      '../services/game-export/godot/templates/scripts/world/nature_generator.gd',
    );
    const content = fs.readFileSync(templatePath, 'utf-8');
    expect(content).toContain('func generate_from_data(world_data: Dictionary)');
  });

  it('reads foliageLayers from geography data', () => {
    const templatePath = path.resolve(
      __dirname,
      '../services/game-export/godot/templates/scripts/world/nature_generator.gd',
    );
    const content = fs.readFileSync(templatePath, 'utf-8');
    expect(content).toContain('foliageLayers');
  });

  it('falls back to DataLoader.load_foliage_layers()', () => {
    const templatePath = path.resolve(
      __dirname,
      '../services/game-export/godot/templates/scripts/world/nature_generator.gd',
    );
    const content = fs.readFileSync(templatePath, 'utf-8');
    expect(content).toContain('DataLoader.load_foliage_layers()');
  });

  it('uses MultiMeshInstance3D for large layers', () => {
    const templatePath = path.resolve(
      __dirname,
      '../services/game-export/godot/templates/scripts/world/nature_generator.gd',
    );
    const content = fs.readFileSync(templatePath, 'utf-8');
    expect(content).toContain('MultiMeshInstance3D');
    expect(content).toContain('MultiMesh');
  });

  it('creates procedural meshes per foliage type', () => {
    const templatePath = path.resolve(
      __dirname,
      '../services/game-export/godot/templates/scripts/world/nature_generator.gd',
    );
    const content = fs.readFileSync(templatePath, 'utf-8');
    expect(content).toContain('_create_mesh_for_type');
    // Should handle all foliage types
    for (const t of ['grass', 'bush', 'flower', 'fern', 'mushroom']) {
      expect(content).toContain(`"${t}"`);
    }
  });

  it('applies position, rotation, and scale from instance data', () => {
    const templatePath = path.resolve(
      __dirname,
      '../services/game-export/godot/templates/scripts/world/nature_generator.gd',
    );
    const content = fs.readFileSync(templatePath, 'utf-8');
    // Instance data fields used for placement
    expect(content).toContain('inst.get("x"');
    expect(content).toContain('inst.get("y"');
    expect(content).toContain('inst.get("z"');
    expect(content).toContain('inst.get("rotation"');
    expect(content).toContain('inst.get("scale"');
  });

  it('is included in GDScript generator output', () => {
    const ir = makeIRWithFoliage();
    const files = generateGDScriptFiles(ir);
    const natureScript = files.find(f => f.path.includes('nature_generator.gd'));
    expect(natureScript).toBeDefined();
    expect(natureScript!.content).toContain('generate_from_data');
  });
});

// ─────────────────────────────────────────────
// DataLoader template: foliage loader
// ─────────────────────────────────────────────

describe('Godot DataLoader - foliage loader', () => {
  it('data_loader.gd contains load_foliage_layers function', () => {
    const templatePath = path.resolve(
      __dirname,
      '../services/game-export/godot/templates/scripts/core/data_loader.gd',
    );
    const content = fs.readFileSync(templatePath, 'utf-8');
    expect(content).toContain('func load_foliage_layers() -> Array:');
    expect(content).toContain('foliage_layers.json');
  });

  it('data_loader.gd contains load_biome_zones function', () => {
    const templatePath = path.resolve(
      __dirname,
      '../services/game-export/godot/templates/scripts/core/data_loader.gd',
    );
    const content = fs.readFileSync(templatePath, 'utf-8');
    expect(content).toContain('func load_biome_zones() -> Array:');
    expect(content).toContain('biome_zones.json');
  });
});
