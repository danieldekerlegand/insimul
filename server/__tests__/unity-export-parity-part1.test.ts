/**
 * Tests for Unity export parity part 1
 *
 * Verifies:
 * - C# generator includes all new template files (8 new world generators)
 * - New templates contain expected classes and key identifiers
 * - Enhanced templates have biome/terrain and sign improvements
 * - Unity asset path routing maps categories to correct subdirectories
 * - Existing templates are preserved
 */

import { describe, it, expect } from 'vitest';
import { generateCSharpFiles } from '../services/game-export/unity/unity-csharp-generator';
import { generateUnityFilesFromIR } from '../services/game-export/unity/unity-exporter';
import type { WorldIR } from '@shared/game-engine/ir-types';

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
      waterFeatures: [],
      biomeZones: [],
      foliageLayers: [],
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
      containers: [],
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
// C# Generator — New Templates
// ─────────────────────────────────────────────

describe('Unity C# generator — new world templates', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);
  const filenames = files.map(f => f.path.split('/').pop());

  const newWorldTemplates = [
    'SettlementSceneManager.cs',
    'ChunkManager.cs',
    'TownSquareGenerator.cs',
    'BuildingPlacementSystem.cs',
    'BuildingCollisionSystem.cs',
    'InteriorSceneManager.cs',
    'InteriorLightingSystem.cs',
    'InteriorDecorationGenerator.cs',
  ];

  for (const template of newWorldTemplates) {
    it(`includes ${template}`, () => {
      expect(filenames).toContain(template);
    });
  }
});

// ─────────────────────────────────────────────
// Template Content Verification
// ─────────────────────────────────────────────

describe('Unity C# generator — template content verification', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('SettlementSceneManager.cs has MAX_SETTLEMENTS_3D constant', () => {
    const f = files.find(f => f.path.endsWith('SettlementSceneManager.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('MAX_SETTLEMENTS_3D');
    expect(f!.content).toContain('class SettlementSceneManager');
    expect(f!.content).toContain('RegisterSettlement');
  });

  it('ChunkManager.cs has CHUNK_SIZE constant', () => {
    const f = files.find(f => f.path.endsWith('ChunkManager.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('CHUNK_SIZE');
    expect(f!.content).toContain('class ChunkManager');
    expect(f!.content).toContain('WorldToChunk');
  });

  it('TownSquareGenerator.cs has square generation', () => {
    const f = files.find(f => f.path.endsWith('TownSquareGenerator.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class TownSquareGenerator');
    expect(f!.content).toContain('GenerateTownSquare');
    expect(f!.content).toContain('PlaceFountain');
  });

  it('BuildingPlacementSystem.cs has zone enum and LOT_SPACING', () => {
    const f = files.find(f => f.path.endsWith('BuildingPlacementSystem.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('enum BuildingZone');
    expect(f!.content).toContain('LOT_SPACING');
    expect(f!.content).toContain('PlaceBuilding');
  });

  it('BuildingCollisionSystem.cs has entry detection', () => {
    const f = files.find(f => f.path.endsWith('BuildingCollisionSystem.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class BuildingCollisionSystem');
    expect(f!.content).toContain('BuildingEntryTrigger');
    expect(f!.content).toContain('OnTriggerEnter');
  });

  it('InteriorSceneManager.cs has interior mode enum', () => {
    const f = files.find(f => f.path.endsWith('InteriorSceneManager.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('enum InteriorMode');
    expect(f!.content).toContain('EnterBuilding');
    expect(f!.content).toContain('ExitBuilding');
    expect(f!.content).toContain('MODEL_INTERIORS');
  });

  it('InteriorLightingSystem.cs has lighting presets', () => {
    const f = files.find(f => f.path.endsWith('InteriorLightingSystem.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('enum LightingPreset');
    expect(f!.content).toContain('Bright');
    expect(f!.content).toContain('Candlelit');
    expect(f!.content).toContain('ApplyLighting');
    expect(f!.content).toContain('LightFlicker');
  });

  it('InteriorDecorationGenerator.cs has furniture role sets', () => {
    const f = files.find(f => f.path.endsWith('InteriorDecorationGenerator.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class InteriorDecorationGenerator');
    expect(f!.content).toContain('ROLE_FURNITURE');
    expect(f!.content).toContain('DecorateInterior');
    expect(f!.content).toContain('FurnitureInteractable');
  });
});

// ─────────────────────────────────────────────
// Enhanced Templates
// ─────────────────────────────────────────────

describe('Unity C# generator — enhanced templates', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('TerrainMeshGenerator.cs has biome zone support', () => {
    const f = files.find(f => f.path.endsWith('TerrainMeshGenerator.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('biomeZones');
    expect(f!.content).toContain('BIOME_LAYER_MAP');
    expect(f!.content).toContain('GenerateUnityTerrain');
    expect(f!.content).toContain('TerrainLayer');
    expect(f!.content).toContain('splatmap');
  });

  it('TerrainMeshGenerator.cs has terrain texture support', () => {
    const f = files.find(f => f.path.endsWith('TerrainMeshGenerator.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('groundDiffuse');
    expect(f!.content).toContain('groundNormal');
    expect(f!.content).toContain('groundHeightmap');
  });

  it('BuildingSignManager.cs has business name support', () => {
    const f = files.find(f => f.path.endsWith('BuildingSignManager.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('RegisterBusinessName');
    expect(f!.content).toContain('_businessNames');
    expect(f!.content).toContain('worldGenre');
    expect(f!.content).toContain('CreateSignBacking');
  });

  it('BuildingSignManager.cs has genre-aware sign styles', () => {
    const f = files.find(f => f.path.endsWith('BuildingSignManager.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('cyberpunk');
    expect(f!.content).toContain('medieval');
    expect(f!.content).toContain('sign_neon');
    expect(f!.content).toContain('sign_wood');
  });
});

// ─────────────────────────────────────────────
// Unity Asset Path Routing
// ─────────────────────────────────────────────

describe('Unity exporter — asset path routing', () => {
  const ir = makeMinimalIR();
  const files = generateUnityFilesFromIR(ir);

  it('generates all expected file categories', () => {
    const csharpFiles = files.filter(f => f.path.endsWith('.cs'));
    const dataFiles = files.filter(f => f.path.endsWith('.json'));
    const metaFiles = files.filter(f => f.path.endsWith('.meta'));

    expect(csharpFiles.length).toBeGreaterThan(0);
    expect(dataFiles.length).toBeGreaterThan(0);
    expect(metaFiles.length).toBeGreaterThan(0);
  });

  it('new templates are in Assets/Scripts/World/', () => {
    const worldFiles = files.filter(f => f.path.startsWith('Assets/Scripts/World/'));
    const worldFilenames = worldFiles.map(f => f.path.split('/').pop());

    expect(worldFilenames).toContain('SettlementSceneManager.cs');
    expect(worldFilenames).toContain('ChunkManager.cs');
    expect(worldFilenames).toContain('TownSquareGenerator.cs');
    expect(worldFilenames).toContain('BuildingPlacementSystem.cs');
    expect(worldFilenames).toContain('BuildingCollisionSystem.cs');
    expect(worldFilenames).toContain('InteriorSceneManager.cs');
    expect(worldFilenames).toContain('InteriorLightingSystem.cs');
    expect(worldFilenames).toContain('InteriorDecorationGenerator.cs');
  });
});

// ─────────────────────────────────────────────
// Existing templates preserved
// ─────────────────────────────────────────────

describe('Unity C# generator — existing templates preserved', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);
  const filenames = files.map(f => f.path.split('/').pop());

  const existingTemplates = [
    'WorldScaleManager.cs',
    'TerrainMeshGenerator.cs',
    'ProceduralBuildingGenerator.cs',
    'RoadGenerator.cs',
    'ProceduralNatureGenerator.cs',
    'WaterFeatureGenerator.cs',
    'DayNightCycleManager.cs',
    'WeatherSystem.cs',
    'TerrainFoundationRenderer.cs',
    'BuildingInteriorGenerator.cs',
    'BuildingSignManager.cs',
    'OutdoorFurnitureGenerator.cs',
    'ItemSpawnManager.cs',
    'InsimulGameManager.cs',
    'InsimulDataLoader.cs',
    'GameClock.cs',
    'InsimulPlayerController.cs',
    'NPCController.cs',
    'ActionSystem.cs',
    'CombatSystem.cs',
    'QuestSystem.cs',
    'InventorySystem.cs',
    'EventBus.cs',
    'PrologEngine.cs',
    'AudioManager.cs',
    'HUDManager.cs',
    'MinimapUI.cs',
  ];

  for (const template of existingTemplates) {
    it(`still includes ${template}`, () => {
      expect(filenames).toContain(template);
    });
  }
});

// ─────────────────────────────────────────────
// Total file count verification
// ─────────────────────────────────────────────

describe('Unity C# generator — file count', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('generates expected number of C# files (including 8 new templates)', () => {
    // Previous count + 8 new templates
    expect(files.length).toBeGreaterThanOrEqual(80);
  });

  it('all C# files have .cs extension', () => {
    for (const f of files) {
      expect(f.path).toMatch(/\.cs$/);
    }
  });

  it('all C# files are in Assets/Scripts/', () => {
    for (const f of files) {
      expect(f.path).toMatch(/^Assets\/Scripts\//);
    }
  });
});
