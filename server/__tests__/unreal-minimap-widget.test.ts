/**
 * Tests for Unreal minimap UMG widget export
 *
 * Verifies that the Unreal export pipeline generates:
 * - InsimulMinimap.h/.cpp UUserWidget with SceneCapture, markers, zoom
 * - InsimulHUD.h/.cpp that owns the minimap widget
 * - Correct token substitution for minimap size
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
// Minimap widget generation
// ─────────────────────────────────────────────

describe('Unreal export - Minimap UMG widget', () => {
  it('generates InsimulMinimap.h template', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulMinimap.h'));
    expect(header).toBeDefined();
    expect(header!.path).toContain('UI/');
  });

  it('generates InsimulMinimap.cpp template', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulMinimap.cpp'));
    expect(source).toBeDefined();
  });

  it('generates InsimulHUD.h and InsimulHUD.cpp', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const hudH = files.find(f => f.path.endsWith('InsimulHUD.h'));
    const hudCpp = files.find(f => f.path.endsWith('InsimulHUD.cpp'));
    expect(hudH).toBeDefined();
    expect(hudCpp).toBeDefined();
  });

  it('minimap header extends UUserWidget', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulMinimap.h'))!;
    expect(header.content).toContain('public UUserWidget');
  });

  it('minimap header declares SceneCaptureComponent2D', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulMinimap.h'))!;
    expect(header.content).toContain('TextureRenderTarget2D');
  });

  it('minimap header declares marker types', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulMinimap.h'))!;
    expect(header.content).toContain('EMinimapMarkerType');
    expect(header.content).toContain('Player');
    expect(header.content).toContain('NPC_Friendly');
    expect(header.content).toContain('NPC_Hostile');
    expect(header.content).toContain('Quest');
    expect(header.content).toContain('Building');
  });

  it('minimap header declares zoom methods', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulMinimap.h'))!;
    expect(header.content).toContain('ZoomIn');
    expect(header.content).toContain('ZoomOut');
    expect(header.content).toContain('ZoomLevels');
  });

  it('minimap cpp implements WorldToMinimap conversion', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulMinimap.cpp'))!;
    expect(source.content).toContain('WorldToMinimap');
  });

  it('minimap cpp creates orthographic scene capture', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulMinimap.cpp'))!;
    expect(source.content).toContain('Orthographic');
    expect(source.content).toContain('SceneCaptureComponent2D');
  });

  it('minimap cpp implements compass rotation', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulMinimap.cpp'))!;
    expect(source.content).toContain('UpdateCompass');
    expect(source.content).toContain('CompassOverlay');
  });

  it('substitutes MINIMAP_SIZE token with 150 when showMinimap is true', () => {
    const ir = makeMinimalIR({ ui: { showMinimap: true, showHealthBar: true, showStaminaBar: true, showAmmoCounter: false, showCompass: true, genreLayout: 'rpg' } });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulMinimap.h'))!;
    expect(header.content).toContain('MinimapSize = 150');
    expect(header.content).not.toContain('{{MINIMAP_SIZE}}');
  });

  it('substitutes MINIMAP_SIZE token with 0 when showMinimap is false', () => {
    const ir = makeMinimalIR({ ui: { showMinimap: false, showHealthBar: true, showStaminaBar: true, showAmmoCounter: false, showCompass: true, genreLayout: 'rpg' } });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulMinimap.h'))!;
    expect(header.content).toContain('MinimapSize = 0');
  });

  it('HUD header includes minimap forward declaration', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulHUD.h'))!;
    expect(header.content).toContain('class UInsimulMinimap');
  });

  it('HUD cpp creates minimap widget in BeginPlay', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulHUD.cpp'))!;
    expect(source.content).toContain('CreateWidget<UInsimulMinimap>');
    expect(source.content).toContain('AddToViewport');
  });

  it('minimap cpp has marker color mapping', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulMinimap.cpp'))!;
    expect(source.content).toContain('GetMarkerColor');
    expect(source.content).toContain('FLinearColor::Green');
    expect(source.content).toContain('FLinearColor::Red');
  });

  it('UI files are placed under Source/InsimulExport/UI/', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const uiFiles = files.filter(f => f.path.includes('/UI/'));
    expect(uiFiles.length).toBeGreaterThanOrEqual(4);
    expect(uiFiles.every(f => f.path.startsWith('Source/InsimulExport/UI/'))).toBe(true);
  });
});
