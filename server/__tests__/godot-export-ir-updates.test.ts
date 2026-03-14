/**
 * Tests for Godot export template IR consumption updates (US-061)
 *
 * Verifies that the Godot data generator, scene generator, and GDScript
 * generator correctly handle water features, lots, and enhanced building data.
 */

import { describe, it, expect } from 'vitest';
import { generateDataFiles } from '../services/game-export/godot/godot-data-generator';
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
      terrainSize: 200,
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
          lots: [
            {
              id: 'lot-1',
              address: '1 Main St',
              houseNumber: 1,
              streetName: 'Main St',
              block: 'A',
              districtName: 'Downtown',
              position: { x: 95, y: 0, z: 105 },
              buildingType: 'tavern',
              buildingId: 'bld-1',
            },
            {
              id: 'lot-2',
              address: '2 Main St',
              houseNumber: 2,
              streetName: 'Main St',
              block: 'A',
              districtName: null,
              position: { x: 105, y: 0, z: 105 },
              buildingType: null,
              buildingId: null,
            },
          ],
          businessIds: [],
          roads: [],
          infrastructure: [],
          streetNetwork: {
            layout: 'grid',
            nodes: [],
            segments: [],
          },
        },
      ],
      waterFeatures: [
        {
          id: 'wf-lake',
          worldId: 'w1',
          type: 'lake',
          subType: 'fresh',
          name: 'Crystal Lake',
          position: { x: 50, y: 0, z: 50 },
          waterLevel: -1,
          bounds: { minX: 30, maxX: 70, minZ: 30, maxZ: 70, centerX: 50, centerZ: 50 },
          depth: 10,
          width: 40,
          flowDirection: null,
          flowSpeed: 0,
          shorelinePoints: [
            { x: 30, y: -1, z: 50 },
            { x: 50, y: -1, z: 30 },
            { x: 70, y: -1, z: 50 },
            { x: 50, y: -1, z: 70 },
          ],
          settlementId: null,
          biome: 'temperate',
          isNavigable: true,
          isDrinkable: true,
          modelAssetKey: null,
          color: { r: 0.1, g: 0.4, b: 0.7 },
          transparency: 0.3,
        },
        {
          id: 'wf-river',
          worldId: 'w1',
          type: 'river',
          subType: 'fresh',
          name: 'Test River',
          position: { x: 0, y: 0, z: 0 },
          waterLevel: -0.5,
          bounds: { minX: 0, maxX: 100, minZ: 45, maxZ: 55, centerX: 50, centerZ: 50 },
          depth: 3,
          width: 6,
          flowDirection: { x: 1, y: 0, z: 0 },
          flowSpeed: 2.5,
          shorelinePoints: [
            { x: 0, y: -0.5, z: 50 },
            { x: 50, y: -0.5, z: 50 },
            { x: 100, y: -0.5, z: 50 },
          ],
          settlementId: 'settlement-1',
          biome: null,
          isNavigable: false,
          isDrinkable: true,
          modelAssetKey: null,
          color: null,
          transparency: 0.4,
        },
      ],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [
        {
          id: 'bld-1',
          settlementId: 'settlement-1',
          position: { x: 95, y: 0, z: 105 },
          rotation: 1.57,
          spec: { buildingRole: 'tavern', floors: 2, width: 10, depth: 8, hasChimney: true, hasBalcony: false },
          style: { preset: 'medieval_wood', wallColor: { r: 0.6, g: 0.4, b: 0.2 }, roofColor: { r: 0.3, g: 0.2, b: 0.1 } },
          occupantIds: [],
          interior: null,
          businessId: null,
          modelAssetKey: null,
        },
      ],
      businesses: [],
      roads: [],
      natureObjects: [],
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
    ...overrides,
  } as WorldIR;
}

// ─────────────────────────────────────────────
// Data generator tests
// ─────────────────────────────────────────────

describe('Godot data generator - water features', () => {
  it('generates water_features.json with color field', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const wfFile = files.find(f => f.path === 'data/water_features.json');
    expect(wfFile).toBeDefined();

    const waterFeatures = JSON.parse(wfFile!.content);
    expect(waterFeatures).toHaveLength(2);

    // Lake has explicit color
    const lake = waterFeatures.find((w: any) => w.id === 'wf-lake');
    expect(lake.color).toEqual({ r: 0.1, g: 0.4, b: 0.7 });
    expect(lake.transparency).toBe(0.3);

    // River has null color
    const river = waterFeatures.find((w: any) => w.id === 'wf-river');
    expect(river.color).toBeNull();
  });

  it('exports all water feature types and properties', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const wfFile = files.find(f => f.path === 'data/water_features.json');
    const waterFeatures = JSON.parse(wfFile!.content);
    const lake = waterFeatures.find((w: any) => w.id === 'wf-lake');

    expect(lake.type).toBe('lake');
    expect(lake.subType).toBe('fresh');
    expect(lake.name).toBe('Crystal Lake');
    expect(lake.position).toEqual({ x: 50, y: 0, z: 50 });
    expect(lake.waterLevel).toBe(-1);
    expect(lake.bounds.minX).toBe(30);
    expect(lake.depth).toBe(10);
    expect(lake.flowDirection).toBeNull();
    expect(lake.flowSpeed).toBe(0);
    expect(lake.shorelinePoints).toHaveLength(4);
    expect(lake.isNavigable).toBe(true);
    expect(lake.isDrinkable).toBe(true);
  });

  it('exports flow direction for rivers', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const wfFile = files.find(f => f.path === 'data/water_features.json');
    const waterFeatures = JSON.parse(wfFile!.content);
    const river = waterFeatures.find((w: any) => w.id === 'wf-river');

    expect(river.flowDirection).toEqual({ x: 1, y: 0, z: 0 });
    expect(river.flowSpeed).toBe(2.5);
  });
});

describe('Godot data generator - lots', () => {
  it('generates lots.json from settlement lots', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const lotsFile = files.find(f => f.path === 'data/lots.json');
    expect(lotsFile).toBeDefined();

    const lots = JSON.parse(lotsFile!.content);
    expect(lots).toHaveLength(2);
  });

  it('includes settlementId on each lot', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const lotsFile = files.find(f => f.path === 'data/lots.json');
    const lots = JSON.parse(lotsFile!.content);

    for (const lot of lots) {
      expect(lot.settlementId).toBe('settlement-1');
    }
  });

  it('exports lot address and position data', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const lotsFile = files.find(f => f.path === 'data/lots.json');
    const lots = JSON.parse(lotsFile!.content);
    const lot1 = lots.find((l: any) => l.id === 'lot-1');

    expect(lot1.address).toBe('1 Main St');
    expect(lot1.houseNumber).toBe(1);
    expect(lot1.streetName).toBe('Main St');
    expect(lot1.block).toBe('A');
    expect(lot1.districtName).toBe('Downtown');
    expect(lot1.position).toEqual({ x: 95, y: 0, z: 105 });
    expect(lot1.buildingType).toBe('tavern');
    expect(lot1.buildingId).toBe('bld-1');
  });

  it('handles null lot fields gracefully', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const lotsFile = files.find(f => f.path === 'data/lots.json');
    const lots = JSON.parse(lotsFile!.content);
    const lot2 = lots.find((l: any) => l.id === 'lot-2');

    expect(lot2.districtName).toBe('');
    expect(lot2.buildingType).toBe('');
    expect(lot2.buildingId).toBe('');
  });
});

// ─────────────────────────────────────────────
// Scene generator tests
// ─────────────────────────────────────────────

describe('Godot scene generator - water features', () => {
  it('includes waterFeatures in scene descriptor', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const descriptorFile = files.find(f => f.path === 'data/scene_descriptor.json');
    expect(descriptorFile).toBeDefined();

    const descriptor = JSON.parse(descriptorFile!.content);
    expect(descriptor.waterFeatures).toBeDefined();
    expect(descriptor.waterFeatures).toHaveLength(2);

    const lake = descriptor.waterFeatures.find((w: any) => w.id === 'wf-lake');
    expect(lake.type).toBe('lake');
    expect(lake.waterLevel).toBe(-1);
    expect(lake.color).toEqual({ r: 0.1, g: 0.4, b: 0.7 });
    expect(lake.transparency).toBe(0.3);
    expect(lake.bounds.minX).toBe(30);
    expect(lake.shorelinePoints).toHaveLength(4);
  });

  it('includes lots in scene descriptor', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(files.find(f => f.path === 'data/scene_descriptor.json')!.content);

    expect(descriptor.lots).toBeDefined();
    expect(descriptor.lots).toHaveLength(2);
    expect(descriptor.lots[0].settlementId).toBe('settlement-1');
  });

  it('includes WaterGenerator node in main.tscn', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscnFile = files.find(f => f.path === 'scenes/main.tscn');
    expect(tscnFile).toBeDefined();

    expect(tscnFile!.content).toContain('water_generator.gd');
    expect(tscnFile!.content).toContain('[node name="WaterGenerator"');
  });

  it('has correct external resource for water_generator.gd', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscnFile = files.find(f => f.path === 'scenes/main.tscn');

    expect(tscnFile!.content).toContain('path="res://scripts/world/water_generator.gd"');
  });
});

// ─────────────────────────────────────────────
// GDScript generator tests
// ─────────────────────────────────────────────

describe('Godot GDScript generator - water generator', () => {
  it('includes water_generator.gd in output', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const waterGen = files.find(f => f.path === 'scripts/world/water_generator.gd');
    expect(waterGen).toBeDefined();
  });

  it('substitutes water color tokens', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const waterGen = files.find(f => f.path === 'scripts/world/water_generator.gd');
    expect(waterGen).toBeDefined();

    // Should not contain unresolved tokens
    expect(waterGen!.content).not.toContain('{{WATER_COLOR_R}}');
    expect(waterGen!.content).not.toContain('{{WATER_ALPHA}}');

    // Should contain Color() with substituted values
    expect(waterGen!.content).toContain('Color(0.15, 0.45, 0.65, 0.7)');
  });

  it('water generator template has generate_from_data method', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const waterGen = files.find(f => f.path === 'scripts/world/water_generator.gd');

    expect(waterGen!.content).toContain('func generate_from_data(world_data: Dictionary)');
    expect(waterGen!.content).toContain('load_water_features()');
  });
});
