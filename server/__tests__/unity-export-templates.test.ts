/**
 * Tests for Unity export template updates (US-060)
 *
 * Verifies that Unity export templates correctly consume new IR data:
 * - Water features from geography
 * - Lot data within settlements
 * - Street network data in road generation
 * - Scene descriptor includes all new data
 */

import { describe, it, expect } from 'vitest';
import { generateDataFiles } from '../services/game-export/unity/unity-data-generator';
import { generateSceneFiles } from '../services/game-export/unity/unity-scene-generator';
import { generateCSharpFiles } from '../services/game-export/unity/unity-csharp-generator';
import { generateProjectFiles } from '../services/game-export/unity/unity-project-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(): WorldIR {
  return {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'test-world',
      worldName: 'Test World',
      worldType: 'medieval_fantasy',
      seed: 'test-seed',
      terrainSize: 512,
      genreConfig: {
        genre: 'rpg',
        features: { crafting: false, resources: false, survival: false },
      },
    },
    geography: {
      terrainSize: 512,
      countries: [],
      states: [],
      settlements: [
        {
          id: 'settlement_1',
          name: 'Testville',
          description: 'A test town',
          settlementType: 'town',
          population: 100,
          position: { x: 50, y: 0, z: 50 },
          radius: 30,
          countryId: 'c1',
          stateId: 's1',
          mayorId: 'char_1',
          lots: [
            {
              id: 'lot_1',
              address: '1 Main St',
              houseNumber: 1,
              streetName: 'Main St',
              block: 'A',
              districtName: 'Downtown',
              position: { x: 55, y: 0, z: 55 },
              buildingType: 'residence',
              buildingId: 'bld_1',
            },
            {
              id: 'lot_2',
              address: '2 Oak Ave',
              houseNumber: 2,
              streetName: 'Oak Ave',
              block: null,
              districtName: null,
              position: { x: 60, y: 0, z: 60 },
              buildingType: 'Bakery',
              buildingId: 'bld_2',
            },
          ],
          businessIds: ['biz_1'],
          internalRoads: [],
          infrastructure: [],
          streetNetwork: {
            layout: 'grid',
            nodes: [
              { id: 'node_1', position: { x: 40, y: 0, z: 40 }, intersectionOf: ['Main St', 'Oak Ave'] },
              { id: 'node_2', position: { x: 60, y: 0, z: 40 }, intersectionOf: ['Main St'] },
              { id: 'node_3', position: { x: 40, y: 0, z: 60 }, intersectionOf: ['Oak Ave'] },
            ],
            segments: [
              {
                id: 'seg_1',
                name: 'Main St',
                direction: 'EW' as const,
                nodeIds: ['node_1', 'node_2'],
                waypoints: [{ x: 40, y: 0, z: 40 }, { x: 60, y: 0, z: 40 }],
                width: 3,
              },
              {
                id: 'seg_2',
                name: 'Oak Ave',
                direction: 'NS' as const,
                nodeIds: ['node_1', 'node_3'],
                waypoints: [{ x: 40, y: 0, z: 40 }, { x: 40, y: 0, z: 60 }],
                width: 2.5,
              },
            ],
          },
        },
      ],
      waterFeatures: [
        {
          id: 'water_1',
          worldId: 'test-world',
          type: 'river',
          subType: 'fresh',
          name: 'Test River',
          position: { x: 100, y: 0, z: 100 },
          waterLevel: 0.5,
          bounds: { minX: 80, maxX: 120, minZ: 90, maxZ: 110, centerX: 100, centerZ: 100 },
          depth: 3,
          width: 8,
          flowDirection: { x: 1, y: 0, z: 0 },
          flowSpeed: 2.5,
          shorelinePoints: [
            { x: 80, y: 0.5, z: 90 },
            { x: 120, y: 0.5, z: 90 },
            { x: 120, y: 0.5, z: 110 },
            { x: 80, y: 0.5, z: 110 },
          ],
          settlementId: 'settlement_1',
          biome: 'temperate',
          isNavigable: true,
          isDrinkable: true,
          modelAssetKey: null,
          color: { r: 0.2, g: 0.5, b: 0.7 },
          transparency: 0.3,
        },
        {
          id: 'water_2',
          worldId: 'test-world',
          type: 'lake',
          subType: 'fresh',
          name: 'Mirror Lake',
          position: { x: 200, y: 0, z: 200 },
          waterLevel: 1.0,
          bounds: { minX: 180, maxX: 220, minZ: 180, maxZ: 220, centerX: 200, centerZ: 200 },
          depth: 10,
          width: 40,
          flowDirection: null,
          flowSpeed: 0,
          shorelinePoints: [
            { x: 190, y: 1, z: 180 },
            { x: 210, y: 1, z: 180 },
            { x: 220, y: 1, z: 200 },
            { x: 210, y: 1, z: 220 },
            { x: 190, y: 1, z: 220 },
            { x: 180, y: 1, z: 200 },
          ],
          settlementId: null,
          biome: 'temperate',
          isNavigable: true,
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
          id: 'bld_1',
          settlementId: 'settlement_1',
          position: { x: 55, y: 0, z: 55 },
          rotation: 0,
          spec: { buildingRole: 'residence_small', floors: 1, width: 8, depth: 8, hasChimney: false, hasBalcony: false },
          style: { baseColor: { r: 0.5, g: 0.4, b: 0.3 }, roofColor: { r: 0.3, g: 0.2, b: 0.1 }, windowColor: { r: 0.9, g: 0.9, b: 0.7 }, doorColor: { r: 0.4, g: 0.25, b: 0.15 }, materialType: 'wood', architectureStyle: 'medieval' },
          occupantIds: ['char_1'],
          interior: null,
          businessId: null,
          modelAssetKey: null,
        },
      ],
      roads: [],
      businesses: [],
      natureObjects: [],
      animals: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [],
      truths: [],
      grammars: [],
      items: [],
      lootTables: [],
      languages: [],
      knowledgeBase: null,
      dialogueContexts: [],
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.5, g: 0.4, b: 0.3 },
        skyColor: { r: 0.6, g: 0.7, b: 0.9 },
        roadColor: { r: 0.3, g: 0.3, b: 0.3 },
        roadRadius: 1.5,
        settlementBaseColor: { r: 0.6, g: 0.5, b: 0.4 },
        settlementRoofColor: { r: 0.3, g: 0.2, b: 0.15 },
      },
      ambientLighting: { color: [0.4, 0.4, 0.5], intensity: 0.5 },
      directionalLight: { direction: [0, 1, 0], intensity: 1.0 },
      fog: { density: 0.02 },
    },
    assets: { animations: [], models: [], textures: [], sounds: [] },
    player: {
      speed: 5,
      jumpHeight: 1.2,
      gravity: 1,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
      startPosition: { x: 50, y: 0, z: 50 },
    },
    ui: {
      minimap: true,
      healthBar: true,
      staminaBar: false,
      ammoCounter: false,
      compass: true,
    },
    combat: {
      style: 'melee',
      settings: {
        baseDamage: 10,
        criticalChance: 0.15,
        criticalMultiplier: 1.5,
        blockReduction: 0.25,
        dodgeChance: 0.1,
        attackCooldown: 1000,
        combatRange: 2,
      },
    },
    survival: null,
    resources: null,
  } as unknown as WorldIR;
}

// ─────────────────────────────────────────────
// Data generator: water features
// ─────────────────────────────────────────────

describe('Unity data generator - water features', () => {
  const ir = makeMinimalIR();
  const files = generateDataFiles(ir);

  it('generates water_features.json data file', () => {
    const wfFile = files.find(f => f.path.endsWith('water_features.json'));
    expect(wfFile).toBeDefined();
    const data = JSON.parse(wfFile!.content);
    expect(data).toHaveLength(2);
  });

  it('includes bounds data for water features', () => {
    const wfFile = files.find(f => f.path.endsWith('water_features.json'));
    const data = JSON.parse(wfFile!.content);
    const river = data.find((w: any) => w.id === 'water_1');
    expect(river.bounds).toBeDefined();
    expect(river.bounds.minX).toBe(80);
    expect(river.bounds.maxX).toBe(120);
    expect(river.bounds.centerX).toBe(100);
  });

  it('includes flow direction for rivers', () => {
    const wfFile = files.find(f => f.path.endsWith('water_features.json'));
    const data = JSON.parse(wfFile!.content);
    const river = data.find((w: any) => w.id === 'water_1');
    expect(river.flowDirection).toEqual({ x: 1, y: 0, z: 0 });
    expect(river.flowSpeed).toBe(2.5);
  });

  it('includes null flow direction for still water', () => {
    const wfFile = files.find(f => f.path.endsWith('water_features.json'));
    const data = JSON.parse(wfFile!.content);
    const lake = data.find((w: any) => w.id === 'water_2');
    expect(lake.flowDirection).toBeNull();
    expect(lake.flowSpeed).toBe(0);
  });

  it('exports shoreline points as Vec3', () => {
    const wfFile = files.find(f => f.path.endsWith('water_features.json'));
    const data = JSON.parse(wfFile!.content);
    const river = data.find((w: any) => w.id === 'water_1');
    expect(river.shorelinePoints).toHaveLength(4);
    for (const pt of river.shorelinePoints) {
      expect(pt).toHaveProperty('x');
      expect(pt).toHaveProperty('y');
      expect(pt).toHaveProperty('z');
    }
  });

  it('exports color data when present', () => {
    const wfFile = files.find(f => f.path.endsWith('water_features.json'));
    const data = JSON.parse(wfFile!.content);
    const river = data.find((w: any) => w.id === 'water_1');
    expect(river.color).toEqual({ r: 0.2, g: 0.5, b: 0.7 });
    const lake = data.find((w: any) => w.id === 'water_2');
    expect(lake.color).toBeNull();
  });
});

// ─────────────────────────────────────────────
// Data generator: lot data in settlements
// ─────────────────────────────────────────────

describe('Unity data generator - lot data in settlements', () => {
  const ir = makeMinimalIR();
  const files = generateDataFiles(ir);

  it('includes lots array in settlement data', () => {
    const settFile = files.find(f => f.path.endsWith('settlements.json'));
    expect(settFile).toBeDefined();
    const data = JSON.parse(settFile!.content);
    expect(data[0].lots).toBeDefined();
    expect(data[0].lots).toHaveLength(2);
  });

  it('exports lot position as Vec3', () => {
    const settFile = files.find(f => f.path.endsWith('settlements.json'));
    const data = JSON.parse(settFile!.content);
    const lot = data[0].lots[0];
    expect(lot.position).toEqual({ x: 55, y: 0, z: 55 });
  });

  it('exports lot address fields', () => {
    const settFile = files.find(f => f.path.endsWith('settlements.json'));
    const data = JSON.parse(settFile!.content);
    const lot = data[0].lots[0];
    expect(lot.id).toBe('lot_1');
    expect(lot.address).toBe('1 Main St');
    expect(lot.houseNumber).toBe(1);
    expect(lot.streetName).toBe('Main St');
    expect(lot.block).toBe('A');
    expect(lot.districtName).toBe('Downtown');
  });

  it('exports lot building references', () => {
    const settFile = files.find(f => f.path.endsWith('settlements.json'));
    const data = JSON.parse(settFile!.content);
    const lot = data[0].lots[0];
    expect(lot.buildingType).toBe('residence');
    expect(lot.buildingId).toBe('bld_1');
  });

  it('defaults null fields to empty strings', () => {
    const settFile = files.find(f => f.path.endsWith('settlements.json'));
    const data = JSON.parse(settFile!.content);
    const lot2 = data[0].lots[1];
    expect(lot2.block).toBe('');
    expect(lot2.districtName).toBe('');
  });
});

// ─────────────────────────────────────────────
// Data generator: street network in settlements
// ─────────────────────────────────────────────

describe('Unity data generator - street network export', () => {
  const ir = makeMinimalIR();
  const files = generateDataFiles(ir);

  it('exports street network with layout', () => {
    const settFile = files.find(f => f.path.endsWith('settlements.json'));
    const data = JSON.parse(settFile!.content);
    expect(data[0].streetNetwork.layout).toBe('grid');
  });

  it('exports street nodes with Vec3 positions', () => {
    const settFile = files.find(f => f.path.endsWith('settlements.json'));
    const data = JSON.parse(settFile!.content);
    const nodes = data[0].streetNetwork.nodes;
    expect(nodes).toHaveLength(3);
    expect(nodes[0].position).toEqual({ x: 40, y: 0, z: 40 });
    expect(nodes[0].intersectionOf).toEqual(['Main St', 'Oak Ave']);
  });

  it('exports street segments with waypoints', () => {
    const settFile = files.find(f => f.path.endsWith('settlements.json'));
    const data = JSON.parse(settFile!.content);
    const segments = data[0].streetNetwork.segments;
    expect(segments).toHaveLength(2);
    expect(segments[0].name).toBe('Main St');
    expect(segments[0].direction).toBe('EW');
    expect(segments[0].waypoints).toHaveLength(2);
    expect(segments[0].width).toBe(3);
  });
});

// ─────────────────────────────────────────────
// Scene generator: water features
// ─────────────────────────────────────────────

describe('Unity scene generator - water features', () => {
  const ir = makeMinimalIR();
  const files = generateSceneFiles(ir);

  it('includes waterFeatures in scene descriptor', () => {
    const sceneFile = files.find(f => f.path.endsWith('SceneDescriptor.json'));
    expect(sceneFile).toBeDefined();
    const descriptor = JSON.parse(sceneFile!.content);
    expect(descriptor.waterFeatures).toBeDefined();
    expect(descriptor.waterFeatures).toHaveLength(2);
  });

  it('scene water features include position and bounds', () => {
    const sceneFile = files.find(f => f.path.endsWith('SceneDescriptor.json'));
    const descriptor = JSON.parse(sceneFile!.content);
    const river = descriptor.waterFeatures.find((w: any) => w.id === 'water_1');
    expect(river.position).toEqual({ x: 100, y: 0, z: 100 });
    expect(river.bounds.minX).toBe(80);
    expect(river.waterLevel).toBe(0.5);
  });

  it('scene water features include shoreline points', () => {
    const sceneFile = files.find(f => f.path.endsWith('SceneDescriptor.json'));
    const descriptor = JSON.parse(sceneFile!.content);
    const river = descriptor.waterFeatures.find((w: any) => w.id === 'water_1');
    expect(river.shorelinePoints).toHaveLength(4);
  });

  it('scene water features include flow data', () => {
    const sceneFile = files.find(f => f.path.endsWith('SceneDescriptor.json'));
    const descriptor = JSON.parse(sceneFile!.content);
    const river = descriptor.waterFeatures.find((w: any) => w.id === 'water_1');
    expect(river.flowDirection).toEqual({ x: 1, y: 0, z: 0 });
    expect(river.flowSpeed).toBe(2.5);
  });
});

// ─────────────────────────────────────────────
// C# generator: includes new templates
// ─────────────────────────────────────────────

describe('Unity C# generator - new templates', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('includes WaterFeatureGenerator.cs', () => {
    const wfGen = files.find(f => f.path.endsWith('WaterFeatureGenerator.cs'));
    expect(wfGen).toBeDefined();
    expect(wfGen!.content).toContain('class WaterFeatureGenerator');
    expect(wfGen!.content).toContain('GenerateFromData');
  });

  it('includes InsimulWaterFeatureData.cs', () => {
    const wfData = files.find(f => f.path.endsWith('InsimulWaterFeatureData.cs'));
    expect(wfData).toBeDefined();
    expect(wfData!.content).toContain('class InsimulWaterFeatureData');
    expect(wfData!.content).toContain('InsimulBoundsData');
    expect(wfData!.content).toContain('shorelinePoints');
  });

  it('includes InsimulLotData.cs', () => {
    const lotData = files.find(f => f.path.endsWith('InsimulLotData.cs'));
    expect(lotData).toBeDefined();
    expect(lotData!.content).toContain('class InsimulLotData');
    expect(lotData!.content).toContain('streetName');
    expect(lotData!.content).toContain('buildingId');
  });

  it('InsimulGameManager.cs references WaterFeatureGenerator', () => {
    const gm = files.find(f => f.path.endsWith('InsimulGameManager.cs'));
    expect(gm).toBeDefined();
    expect(gm!.content).toContain('WaterFeatureGenerator');
  });

  it('InsimulWorldIR.cs includes waterFeatures in GeographyData', () => {
    const worldIR = files.find(f => f.path.endsWith('InsimulWorldIR.cs'));
    expect(worldIR).toBeDefined();
    expect(worldIR!.content).toContain('InsimulWaterFeatureData[] waterFeatures');
  });

  it('InsimulSettlementData.cs includes lots array', () => {
    const settlement = files.find(f => f.path.endsWith('InsimulSettlementData.cs'));
    expect(settlement).toBeDefined();
    expect(settlement!.content).toContain('InsimulLotData[] lots');
  });

  it('RoadGenerator.cs uses street network segments', () => {
    const road = files.find(f => f.path.endsWith('RoadGenerator.cs'));
    expect(road).toBeDefined();
    expect(road!.content).toContain('streetNetwork');
    expect(road!.content).toContain('GenerateStreetSegment');
  });
});

// ─────────────────────────────────────────────
// Main menu and settings screen
// ─────────────────────────────────────────────

describe('Unity C# generator - MainMenuUI', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('includes MainMenuUI.cs in output', () => {
    const menu = files.find(f => f.path.endsWith('MainMenuUI.cs'));
    expect(menu).toBeDefined();
    expect(menu!.path).toBe('Assets/Scripts/UI/MainMenuUI.cs');
  });

  it('MainMenuUI.cs contains the MainMenuUI class', () => {
    const menu = files.find(f => f.path.endsWith('MainMenuUI.cs'))!;
    expect(menu.content).toContain('class MainMenuUI');
    expect(menu.content).toContain('namespace Insimul.UI');
  });

  it('substitutes GAME_TITLE token with world name', () => {
    const menu = files.find(f => f.path.endsWith('MainMenuUI.cs'))!;
    expect(menu.content).toContain('Test World');
    expect(menu.content).not.toContain('{{GAME_TITLE}}');
  });

  it('has New Game button that loads Gameplay scene', () => {
    const menu = files.find(f => f.path.endsWith('MainMenuUI.cs'))!;
    expect(menu.content).toContain('"New Game"');
    expect(menu.content).toContain('SceneManager.LoadScene');
    expect(menu.content).toContain('SCENE_GAMEPLAY');
  });

  it('has Continue button', () => {
    const menu = files.find(f => f.path.endsWith('MainMenuUI.cs'))!;
    expect(menu.content).toContain('"Continue"');
  });

  it('has Settings button and settings panel', () => {
    const menu = files.find(f => f.path.endsWith('MainMenuUI.cs'))!;
    expect(menu.content).toContain('"Settings"');
    expect(menu.content).toContain('CreateSettingsPanel');
    expect(menu.content).toContain('ShowSettings');
  });

  it('has Quit with UNITY_EDITOR check', () => {
    const menu = files.find(f => f.path.endsWith('MainMenuUI.cs'))!;
    expect(menu.content).toContain('Application.Quit()');
    expect(menu.content).toContain('#if UNITY_EDITOR');
    expect(menu.content).toContain('EditorApplication.isPlaying');
  });

  it('has audio settings: master, music, SFX sliders', () => {
    const menu = files.find(f => f.path.endsWith('MainMenuUI.cs'))!;
    expect(menu.content).toContain('"Master Volume"');
    expect(menu.content).toContain('"Music Volume"');
    expect(menu.content).toContain('"SFX Volume"');
    expect(menu.content).toContain('_masterVolSlider');
    expect(menu.content).toContain('_musicVolSlider');
    expect(menu.content).toContain('_sfxVolSlider');
  });

  it('has graphics settings: quality, resolution, fullscreen, vsync', () => {
    const menu = files.find(f => f.path.endsWith('MainMenuUI.cs'))!;
    expect(menu.content).toContain('"Quality"');
    expect(menu.content).toContain('"Resolution"');
    expect(menu.content).toContain('"Fullscreen"');
    expect(menu.content).toContain('"VSync"');
    expect(menu.content).toContain('_qualityDropdown');
    expect(menu.content).toContain('_resolutionDropdown');
    expect(menu.content).toContain('_fullscreenToggle');
    expect(menu.content).toContain('_vsyncToggle');
  });

  it('has controls settings: sensitivity and invert-Y', () => {
    const menu = files.find(f => f.path.endsWith('MainMenuUI.cs'))!;
    expect(menu.content).toContain('"Mouse Sensitivity"');
    expect(menu.content).toContain('"Invert Y-Axis"');
    expect(menu.content).toContain('_sensitivitySlider');
    expect(menu.content).toContain('_invertYToggle');
  });

  it('uses PlayerPrefs for settings persistence', () => {
    const menu = files.find(f => f.path.endsWith('MainMenuUI.cs'))!;
    expect(menu.content).toContain('PlayerPrefs.SetFloat');
    expect(menu.content).toContain('PlayerPrefs.GetFloat');
    expect(menu.content).toContain('PlayerPrefs.SetInt');
    expect(menu.content).toContain('PlayerPrefs.GetInt');
    expect(menu.content).toContain('PlayerPrefs.Save()');
  });

  it('applies settings to Unity systems', () => {
    const menu = files.find(f => f.path.endsWith('MainMenuUI.cs'))!;
    expect(menu.content).toContain('AudioListener.volume');
    expect(menu.content).toContain('QualitySettings.SetQualityLevel');
    expect(menu.content).toContain('Screen.SetResolution');
    expect(menu.content).toContain('Screen.fullScreen');
  });
});

describe('Unity C# generator - GameMenuUI pause menu', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('includes GameMenuUI.cs', () => {
    const menu = files.find(f => f.path.endsWith('GameMenuUI.cs'));
    expect(menu).toBeDefined();
  });

  it('has Resume, Settings, Main Menu, and Quit buttons', () => {
    const menu = files.find(f => f.path.endsWith('GameMenuUI.cs'))!;
    expect(menu.content).toContain('"Resume"');
    expect(menu.content).toContain('"Settings"');
    expect(menu.content).toContain('"Main Menu"');
    expect(menu.content).toContain('"Quit"');
  });

  it('can return to main menu scene', () => {
    const menu = files.find(f => f.path.endsWith('GameMenuUI.cs'))!;
    expect(menu.content).toContain('SCENE_MAIN_MENU');
    expect(menu.content).toContain('SceneManager.LoadScene');
  });

  it('toggles with Escape key', () => {
    const menu = files.find(f => f.path.endsWith('GameMenuUI.cs'))!;
    expect(menu.content).toContain('KeyCode.Escape');
    expect(menu.content).toContain('ToggleMenu');
  });

  it('pauses time when open', () => {
    const menu = files.find(f => f.path.endsWith('GameMenuUI.cs'))!;
    expect(menu.content).toContain('Time.timeScale');
  });
});

describe('Unity project generator - EditorBuildSettings', () => {
  const ir = makeMinimalIR();
  const files = generateProjectFiles(ir);

  it('includes EditorBuildSettings.asset', () => {
    const buildSettings = files.find(f => f.path.endsWith('EditorBuildSettings.asset'));
    expect(buildSettings).toBeDefined();
    expect(buildSettings!.path).toBe('ProjectSettings/EditorBuildSettings.asset');
  });

  it('registers MainMenu and Gameplay scenes', () => {
    const buildSettings = files.find(f => f.path.endsWith('EditorBuildSettings.asset'))!;
    expect(buildSettings.content).toContain('MainMenu.unity');
    expect(buildSettings.content).toContain('Gameplay.unity');
  });

  it('has both scenes enabled', () => {
    const buildSettings = files.find(f => f.path.endsWith('EditorBuildSettings.asset'))!;
    const enabledCount = (buildSettings.content.match(/enabled: 1/g) || []).length;
    expect(enabledCount).toBe(2);
  });
});
