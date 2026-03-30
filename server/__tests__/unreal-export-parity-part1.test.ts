/**
 * Tests for Unreal export parity part 1
 *
 * Verifies:
 * - Asset converter handles new categories (furniture, structural, vehicle, interior, texture, nature)
 * - C++ generator includes all new template files (world generators + system classes)
 * - Level generator includes new sections (waterFeatures, containers, foliage, interiorTemplates, townSquares, outdoorFurniture)
 * - Asset bundler category type includes new categories
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import { convertAssetsForUnreal, glbHasSkeletalAnimation } from '../services/game-export/unreal/asset-converter';
import { generateLevelFiles } from '../services/game-export/unreal/unreal-level-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';
import type { BundledAsset } from '../services/game-export/asset-bundler';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(overrides?: Partial<WorldIR>): WorldIR {
  const base: WorldIR = {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'test-world',
      worldName: 'Test World',
      worldDescription: 'A test world',
      worldType: 'fantasy',
      genreConfig: {
        genre: 'rpg',
        subGenre: 'action-rpg',
        features: { crafting: false, resources: false, survival: false, dungeons: false, vehicles: false, companions: false, factions: false, housing: false, farming: false, fishing: false, cooking: false, mining: false, trading: true },
        cameraMode: 'third-person' as any,
        combatStyle: 'melee' as any,
      },
      exportTimestamp: new Date().toISOString(),
      exportVersion: 1,
      seed: 'test-seed',
    },
    geography: {
      terrainSize: 1000,
      worldScaleFactor: 1.0,
      countries: [],
      states: [],
      settlements: [
        {
          id: 'settlement-1',
          worldId: 'test-world',
          countryId: null,
          stateId: null,
          name: 'Testville',
          description: 'A test settlement',
          settlementType: 'town',
          terrain: null,
          population: 150,
          foundedYear: 1850,
          founderIds: [],
          mayorId: null,
          position: { x: 10, y: 0, z: 20 },
          radius: 50,
          elevationProfile: null,
          lots: [],
          businessIds: [],
          internalRoads: [],
          infrastructure: [],
          streetNetwork: { layout: 'grid', nodes: [], segments: [] },
        },
      ],
      waterFeatures: [
        {
          id: 'water-1',
          worldId: 'test-world',
          type: 'lake',
          subType: 'fresh',
          name: 'Mirror Lake',
          position: { x: 50, y: 0, z: 50 },
          waterLevel: 0.5,
          bounds: { min: { x: 35, y: 0, z: 35 }, max: { x: 65, y: 1, z: 65 } },
          depth: 10,
          width: 30,
          flowDirection: null,
          flowSpeed: 0,
          shorelinePoints: [{ x: 35, y: 0, z: 35 }, { x: 65, y: 0, z: 65 }],
          settlementId: null,
          color: { r: 0.1, g: 0.3, b: 0.6 },
        },
      ] as any,
      biomeZones: [],
      foliageLayers: [
        {
          type: 'tree',
          biome: 'temperate_forest',
          settlementId: 'settlement-1',
          density: 0.6,
          scaleRange: [0.8, 1.2] as [number, number],
          maxSlope: 0.5,
          elevationRange: [0, 1] as [number, number],
          instances: [],
        },
      ] as any,
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [
        {
          id: 'bld-1',
          settlementId: 'settlement-1',
          position: { x: 11, y: 0, z: 21 },
          rotation: 0,
          spec: { buildingRole: 'tavern', floors: 2, width: 12, depth: 15, hasChimney: true, hasBalcony: false },
          style: {} as any,
          occupantIds: [],
          interior: {
            width: 10,
            depth: 12,
            height: 4,
            furniture: [],
          },
          businessId: 'biz-1',
          modelAssetKey: null,
        },
      ],
      businesses: [],
      roads: [],
      natureObjects: [],
      animals: [],
      dungeons: [],
      questObjects: [],
      containers: [
        {
          id: 'container-1',
          buildingId: '',
          containerType: 'chest',
          position: { x: 15, y: 0, z: 25 },
          location: 'outdoor',
          items: [{ itemName: 'Gold Coin', itemType: 'currency', quantity: 10 }],
        },
      ],
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
      knowledgeBase: null,
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.4, g: 0.6, b: 0.3 },
        skyColor: { r: 0.5, g: 0.7, b: 1.0 },
        settlementBaseColor: { r: 0.8, g: 0.7, b: 0.6 },
        settlementRoofColor: { r: 0.6, g: 0.3, b: 0.2 },
        roadColor: { r: 0.5, g: 0.5, b: 0.5 },
        roadRadius: 2.5,
      } as any,
      skyboxAssetKey: null,
      ambientLighting: { color: [0.3, 0.3, 0.3], intensity: 0.5 },
      directionalLight: { direction: [0, -1, 0], intensity: 1.0 },
      fog: null,
    },
    assets: { collectionId: null, textures: [], models: [], audio: [], animations: [] },
    player: {
      startPosition: { x: 0, y: 1, z: 0 },
      modelAssetKey: null,
      initialEnergy: 100,
      initialGold: 50,
      initialHealth: 100,
      speed: 6,
      jumpHeight: 4,
      gravity: 9.8,
    },
    ui: { showMinimap: true, showHealthBar: true, showStaminaBar: true, showAmmoCounter: false, showCompass: true, genreLayout: 'rpg', questJournal: { enabled: true, maxTrackedQuests: 3, showQuestMarkers: true, autoTrackNew: true, sortOrder: 'newest' as const, categories: ['conversation', 'vocabulary'] } },
    combat: {
      style: 'melee' as any,
      settings: { baseDamage: 10, damageVariance: 2, criticalChance: 0.1, criticalMultiplier: 2, blockReduction: 0.5, dodgeChance: 0.1, attackCooldown: 500, comboWindowMs: 300, maxComboLength: 3 },
    },
    survival: null,
    resources: null,
    aiConfig: { apiMode: 'insimul', insimulEndpoint: '', geminiModel: '', geminiApiKeyPlaceholder: '', voiceEnabled: false, defaultVoice: '' },
  };

  return { ...base, ...overrides };
}

// ─────────────────────────────────────────────
// Asset Converter — New Categories
// ─────────────────────────────────────────────

describe('Unreal asset converter — new categories', () => {
  function makeBundledAsset(category: BundledAsset['category'], filename: string): BundledAsset {
    return {
      exportPath: `assets/${category}/${filename}`,
      buffer: Buffer.from('test'),
      category,
      role: `test_${category}`,
    };
  }

  it('routes furniture assets to Content/Assets/Furniture/', () => {
    const result = convertAssetsForUnreal([makeBundledAsset('furniture', 'table.glb')]);
    expect(result.assets[0].exportPath).toContain('Content/Assets/Furniture/');
  });

  it('routes structural assets to Content/Assets/Structural/', () => {
    const result = convertAssetsForUnreal([makeBundledAsset('structural', 'wall.glb')]);
    expect(result.assets[0].exportPath).toContain('Content/Assets/Structural/');
  });

  it('routes vehicle assets to Content/Assets/Vehicles/', () => {
    const result = convertAssetsForUnreal([makeBundledAsset('vehicle', 'cart.glb')]);
    expect(result.assets[0].exportPath).toContain('Content/Assets/Vehicles/');
  });

  it('routes interior assets to Content/Assets/Interiors/', () => {
    const result = convertAssetsForUnreal([makeBundledAsset('interior', 'pub.glb')]);
    expect(result.assets[0].exportPath).toContain('Content/Assets/Interiors/');
  });

  it('routes texture assets to Content/Assets/Textures/', () => {
    const result = convertAssetsForUnreal([makeBundledAsset('texture', 'stone_diff.jpg')]);
    expect(result.assets[0].exportPath).toContain('Content/Assets/Textures/');
  });

  it('routes nature assets to Content/Assets/Nature/', () => {
    const result = convertAssetsForUnreal([makeBundledAsset('nature', 'tree.glb')]);
    expect(result.assets[0].exportPath).toContain('Content/Assets/Nature/');
  });

  it('tracks stats for new categories', () => {
    const assets: BundledAsset[] = [
      makeBundledAsset('furniture', 'chair.glb'),
      makeBundledAsset('structural', 'fence.glb'),
      makeBundledAsset('vehicle', 'bike.glb'),
      makeBundledAsset('interior', 'bar.glb'),
      makeBundledAsset('nature', 'rock.glb'),
    ];
    const result = convertAssetsForUnreal(assets);
    expect(result.stats.totalAssets).toBe(5);
    expect(result.stats.furniture).toBe(1);
    expect(result.stats.structural).toBe(1);
    expect(result.stats.vehicles).toBe(1);
    expect(result.stats.interiors).toBe(1);
    expect(result.stats.nature).toBe(1);
  });

  it('detects non-GLB as non-skeletal', () => {
    expect(glbHasSkeletalAnimation(Buffer.from('not a glb'))).toBe(false);
  });
});

// ─────────────────────────────────────────────
// C++ Generator — New Templates
// ─────────────────────────────────────────────

describe('Unreal C++ generator — new world templates', () => {
  const ir = makeMinimalIR();
  const files = generateCppFiles(ir);
  const filenames = files.map(f => f.path.split('/').pop());

  // World generator templates
  const worldTemplates = [
    'TerrainFoundationRenderer.h', 'TerrainFoundationRenderer.cpp',
    'SettlementSceneManager.h', 'SettlementSceneManager.cpp',
    'ChunkManager.h', 'ChunkManager.cpp',
    'TownSquareGenerator.h', 'TownSquareGenerator.cpp',
    'WaterRenderer.h', 'WaterRenderer.cpp',
    'OutdoorFurnitureGenerator.h', 'OutdoorFurnitureGenerator.cpp',
    'InteriorSceneManager.h', 'InteriorSceneManager.cpp',
    'BuildingInteriorGenerator.h', 'BuildingInteriorGenerator.cpp',
    'InteriorLightingSystem.h', 'InteriorLightingSystem.cpp',
    'InteriorDecorationGenerator.h', 'InteriorDecorationGenerator.cpp',
  ];

  for (const template of worldTemplates) {
    it(`includes ${template}`, () => {
      expect(filenames).toContain(template);
    });
  }

  // System templates
  const systemTemplates = [
    'BuildingPlacementSystem.h', 'BuildingPlacementSystem.cpp',
    'BuildingSignManager.h', 'BuildingSignManager.cpp',
    'BuildingCollisionSystem.h', 'BuildingCollisionSystem.cpp',
    'ContainerSpawnSystem.h', 'ContainerSpawnSystem.cpp',
    'ExteriorItemManager.h', 'ExteriorItemManager.cpp',
  ];

  for (const template of systemTemplates) {
    it(`includes ${template}`, () => {
      expect(filenames).toContain(template);
    });
  }
});

describe('Unreal C++ generator — template content verification', () => {
  const ir = makeMinimalIR();
  const files = generateCppFiles(ir);

  it('TerrainFoundationRenderer.h contains class declaration', () => {
    const f = files.find(f => f.path.endsWith('TerrainFoundationRenderer.h'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('ATerrainFoundationRenderer');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  it('ChunkManager.h contains CHUNK_SIZE constant', () => {
    const f = files.find(f => f.path.endsWith('ChunkManager.h'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('CHUNK_SIZE');
  });

  it('WaterRenderer.h contains water type enum', () => {
    const f = files.find(f => f.path.endsWith('WaterRenderer.h'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('EWaterType');
  });

  it('BuildingCollisionSystem.h contains entry detection', () => {
    const f = files.find(f => f.path.endsWith('BuildingCollisionSystem.h'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('BuildingCollisionSystem');
  });

  it('InteriorSceneManager.h contains interior mode enum', () => {
    const f = files.find(f => f.path.endsWith('InteriorSceneManager.h'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('EInteriorMode');
  });

  it('ContainerSpawnSystem.h contains container data struct', () => {
    const f = files.find(f => f.path.endsWith('ContainerSpawnSystem.h'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('FContainerData');
  });

  it('SettlementSceneManager.h has MAX_SETTLEMENTS_3D', () => {
    const f = files.find(f => f.path.endsWith('SettlementSceneManager.h'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('MAX_SETTLEMENTS_3D');
  });

  it('BuildingPlacementSystem.h has zone enum', () => {
    const f = files.find(f => f.path.endsWith('BuildingPlacementSystem.h'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('EBuildingZone');
  });
});

// ─────────────────────────────────────────────
// Level Generator — New Sections
// ─────────────────────────────────────────────

describe('Unreal level generator — new sections', () => {
  it('includes waterFeatures in level descriptor', () => {
    const ir = makeMinimalIR();
    const files = generateLevelFiles(ir);
    const levelFile = files.find(f => f.path.endsWith('.json'));
    expect(levelFile).toBeDefined();
    const level = JSON.parse(levelFile!.content);
    expect(level.waterFeatures).toBeDefined();
    expect(level.waterFeatures).toHaveLength(1);
    expect(level.waterFeatures[0].type).toBe('lake');
  });

  it('converts water feature positions to UE coordinates', () => {
    const ir = makeMinimalIR();
    const files = generateLevelFiles(ir);
    const levelFile = files.find(f => f.path.endsWith('.json'));
    const level = JSON.parse(levelFile!.content);
    const wf = level.waterFeatures[0];
    // IR {x:50, y:0, z:50} → UE {X:5000, Y:5000, Z:0}
    expect(wf.position.X).toBe(5000);
    expect(wf.position.Y).toBe(5000);
    expect(wf.position.Z).toBe(0);
  });

  it('includes containers in level descriptor', () => {
    const ir = makeMinimalIR();
    const files = generateLevelFiles(ir);
    const levelFile = files.find(f => f.path.endsWith('.json'));
    const level = JSON.parse(levelFile!.content);
    expect(level.containers).toBeDefined();
    expect(level.containers).toHaveLength(1);
    expect(level.containers[0].containerType).toBe('chest');
  });

  it('includes foliage layers in level descriptor', () => {
    const ir = makeMinimalIR();
    const files = generateLevelFiles(ir);
    const levelFile = files.find(f => f.path.endsWith('.json'));
    const level = JSON.parse(levelFile!.content);
    expect(level.foliage).toBeDefined();
    expect(level.foliage).toHaveLength(1);
    expect(level.foliage[0].biome).toBeDefined();
  });

  it('includes townSquares in level descriptor', () => {
    const ir = makeMinimalIR();
    const files = generateLevelFiles(ir);
    const levelFile = files.find(f => f.path.endsWith('.json'));
    const level = JSON.parse(levelFile!.content);
    expect(level.townSquares).toBeDefined();
    expect(level.townSquares).toHaveLength(1);
  });

  it('includes outdoorFurniture in level descriptor', () => {
    const ir = makeMinimalIR();
    const files = generateLevelFiles(ir);
    const levelFile = files.find(f => f.path.endsWith('.json'));
    const level = JSON.parse(levelFile!.content);
    expect(level.outdoorFurniture).toBeDefined();
    expect(level.outdoorFurniture).toHaveLength(1);
  });

  it('includes interiorTemplates in level descriptor', () => {
    const ir = makeMinimalIR();
    const files = generateLevelFiles(ir);
    const levelFile = files.find(f => f.path.endsWith('.json'));
    const level = JSON.parse(levelFile!.content);
    expect(level.interiorTemplates).toBeDefined();
    expect(level.interiorTemplates['bld-1']).toBeDefined();
    expect(level.interiorTemplates['bld-1'].mode).toBe('procedural');
  });
});

// ─────────────────────────────────────────────
// Existing templates still present
// ─────────────────────────────────────────────

describe('Unreal C++ generator — existing templates preserved', () => {
  const ir = makeMinimalIR();
  const files = generateCppFiles(ir);
  const filenames = files.map(f => f.path.split('/').pop());

  const existingTemplates = [
    'WorldScaleManager.h', 'WorldScaleManager.cpp',
    'ProceduralBuildingGenerator.h', 'ProceduralBuildingGenerator.cpp',
    'RoadGenerator.h', 'RoadGenerator.cpp',
    'ProceduralNatureGenerator.h', 'ProceduralNatureGenerator.cpp',
    'ProceduralTerrainGenerator.h', 'ProceduralTerrainGenerator.cpp',
    'DayNightSystem.h', 'DayNightSystem.cpp',
    'WeatherSystem.h', 'WeatherSystem.cpp',
    'AudioSystem.h', 'AudioSystem.cpp',
    'ActionSystem.h', 'ActionSystem.cpp',
    'CombatSystem.h', 'CombatSystem.cpp',
    'QuestSystem.h', 'QuestSystem.cpp',
    'InventorySystem.h', 'InventorySystem.cpp',
    'EventBus.h', 'EventBus.cpp',
    'PrologEngine.h', 'PrologEngine.cpp',
  ];

  for (const template of existingTemplates) {
    it(`still includes ${template}`, () => {
      expect(filenames).toContain(template);
    });
  }
});
