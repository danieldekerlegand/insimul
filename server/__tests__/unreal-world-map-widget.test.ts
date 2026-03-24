/**
 * Tests for Unreal world map widget export
 *
 * Verifies that the Unreal export pipeline correctly generates:
 * - InsimulWorldMap.h and InsimulWorldMap.cpp template files
 * - Conditional inclusion based on mapScreen.enabled
 * - Correct UUserWidget structure and required features
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
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
    ui: { showMinimap: true, showHealthBar: true, showStaminaBar: true, showAmmoCounter: false, showCompass: true, genreLayout: 'rpg' },
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
// World Map Widget generation
// ─────────────────────────────────────────────

describe('Unreal export - World Map Widget', () => {
  it('generates InsimulWorldMap.h in UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulWorldMap.h'));
    expect(header).toBeDefined();
    expect(header!.path).toContain('/UI/');
  });

  it('generates InsimulWorldMap.cpp in UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulWorldMap.cpp'));
    expect(source).toBeDefined();
    expect(source!.path).toContain('/UI/');
  });

  it('header declares UUserWidget subclass', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulWorldMap.h'))!;
    expect(header.content).toContain('UUserWidget');
    expect(header.content).toContain('UInsimulWorldMap');
    expect(header.content).toContain('UCLASS()');
  });

  it('header declares map marker enum and struct', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulWorldMap.h'))!;
    expect(header.content).toContain('EInsimulMapMarkerType');
    expect(header.content).toContain('FInsimulMapMarker');
    expect(header.content).toContain('Settlement');
    expect(header.content).toContain('QuestObjective');
    expect(header.content).toContain('NPC');
    expect(header.content).toContain('Player');
  });

  it('header declares road struct for map rendering', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulWorldMap.h'))!;
    expect(header.content).toContain('FInsimulMapRoad');
    expect(header.content).toContain('Waypoints');
    expect(header.content).toContain('Width');
  });

  it('header includes zoom and pan support', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulWorldMap.h'))!;
    expect(header.content).toContain('ZoomLevels');
    expect(header.content).toContain('PanOffset');
    expect(header.content).toContain('CycleZoom');
    expect(header.content).toContain('NativeOnMouseWheel');
    expect(header.content).toContain('NativeOnMouseMove');
  });

  it('header includes ToggleMap and IsMapOpen', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulWorldMap.h'))!;
    expect(header.content).toContain('ToggleMap');
    expect(header.content).toContain('IsMapOpen');
  });

  it('header includes InitializeMap with world size and zoom levels', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulWorldMap.h'))!;
    expect(header.content).toContain('InitializeMap');
    expect(header.content).toContain('InWorldSize');
    expect(header.content).toContain('InZoomLevels');
  });

  it('header includes player position tracking', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulWorldMap.h'))!;
    expect(header.content).toContain('UpdatePlayerPosition');
    expect(header.content).toContain('PlayerPosition');
    expect(header.content).toContain('PlayerRotation');
  });

  it('source implements toggle with game pause and cursor show', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulWorldMap.cpp'))!;
    expect(source.content).toContain('SetGamePaused');
    expect(source.content).toContain('bShowMouseCursor');
    expect(source.content).toContain('ToggleMap');
  });

  it('source implements coordinate conversion (WorldToMap)', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulWorldMap.cpp'))!;
    expect(source.content).toContain('WorldToMap');
    expect(source.content).toContain('WorldSize');
  });

  it('source implements NativePaint with roads, markers, and player arrow', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulWorldMap.cpp'))!;
    expect(source.content).toContain('NativePaint');
    expect(source.content).toContain('Roads');
    expect(source.content).toContain('DrawMarker');
    expect(source.content).toContain('WORLD MAP');
  });

  it('source renders player arrow with rotation', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulWorldMap.cpp'))!;
    expect(source.content).toContain('PlayerRotation');
    expect(source.content).toContain('PLAYER_ARROW_SIZE');
    expect(source.content).toContain('DegreesToRadians');
  });

  it('source includes legend with zoom info and controls', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulWorldMap.cpp'))!;
    expect(source.content).toContain('Scroll to zoom');
    expect(source.content).toContain('Drag to pan');
    expect(source.content).toContain('M to close');
  });
});

// ─────────────────────────────────────────────
// Conditional inclusion
// ─────────────────────────────────────────────

describe('Unreal export - World Map conditional inclusion', () => {
  it('includes world map when ui has no menuConfig (default enabled)', () => {
    const ir = makeMinimalIR();
    // The default fixture has no menuConfig — should still include the map
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulWorldMap.h'));
    expect(header).toBeDefined();
  });

  it('includes world map when mapScreen.enabled is true', () => {
    const ir = makeMinimalIR();
    (ir.ui as any).menuConfig = { mapScreen: { enabled: true, zoomLevels: [0.5, 1, 2, 4] } };
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulWorldMap.h'));
    expect(header).toBeDefined();
  });

  it('excludes world map when mapScreen.enabled is false', () => {
    const ir = makeMinimalIR();
    (ir.ui as any).menuConfig = { mapScreen: { enabled: false, zoomLevels: [] } };
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulWorldMap.h'));
    expect(header).toBeUndefined();
  });
});
