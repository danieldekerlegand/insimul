/**
 * Tests for Unreal pause menu widget and save game generation
 *
 * Verifies that the Unreal export pipeline correctly generates:
 * - InsimulPauseMenuWidget.h and .cpp in UI directory
 * - InsimulSaveGame.h and .cpp in UI directory
 * - PlayerController includes pause menu creation and input binding
 * - MAX_SAVE_SLOTS token substitution from IR
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
// Pause Menu Widget generation
// ─────────────────────────────────────────────

describe('Unreal export - Pause Menu widget', () => {
  it('generates InsimulPauseMenuWidget.h in UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const h = files.find(f => f.path.endsWith('UI/InsimulPauseMenuWidget.h'));
    expect(h).toBeDefined();
    expect(h!.content).toContain('UInsimulPauseMenuWidget');
    expect(h!.content).toContain('UUserWidget');
  });

  it('generates InsimulPauseMenuWidget.cpp in UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('UI/InsimulPauseMenuWidget.cpp'));
    expect(cpp).toBeDefined();
    expect(cpp!.content).toContain('UInsimulPauseMenuWidget');
  });

  it('pause menu header declares toggle, close, and save/load methods', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const h = files.find(f => f.path.endsWith('UI/InsimulPauseMenuWidget.h'))!;
    expect(h.content).toContain('TogglePauseMenu');
    expect(h.content).toContain('ClosePauseMenu');
    expect(h.content).toContain('OnSaveGameClicked');
    expect(h.content).toContain('OnLoadGameClicked');
    expect(h.content).toContain('OnResumeClicked');
    expect(h.content).toContain('OnQuitToMenuClicked');
  });

  it('pause menu cpp implements game pause/unpause', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('UI/InsimulPauseMenuWidget.cpp'))!;
    expect(cpp.content).toContain('SetGamePaused');
    expect(cpp.content).toContain('SetShowMouseCursor');
    expect(cpp.content).toContain('FInputModeUIOnly');
    expect(cpp.content).toContain('FInputModeGameOnly');
  });

  it('pause menu cpp implements save to slot', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('UI/InsimulPauseMenuWidget.cpp'))!;
    expect(cpp.content).toContain('SaveGameToSlot');
    expect(cpp.content).toContain('InsimulSave_');
  });

  it('pause menu cpp implements load from slot', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('UI/InsimulPauseMenuWidget.cpp'))!;
    expect(cpp.content).toContain('LoadGameFromSlot');
    expect(cpp.content).toContain('SetActorLocation');
    expect(cpp.content).toContain('SetActorRotation');
  });

  it('pause menu cpp has quit to main menu', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('UI/InsimulPauseMenuWidget.cpp'))!;
    expect(cpp.content).toContain('MainMenuLevel');
    expect(cpp.content).toContain('OpenLevel');
  });

  it('substitutes MAX_SAVE_SLOTS with default of 5', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const h = files.find(f => f.path.endsWith('UI/InsimulPauseMenuWidget.h'))!;
    expect(h.content).toContain('MaxSaveSlots = 5');
    expect(h.content).not.toContain('{{MAX_SAVE_SLOTS}}');
  });

  it('substitutes MAX_SAVE_SLOTS from IR when configured', () => {
    const ir = makeMinimalIR({
      ui: {
        showMinimap: true,
        showHealthBar: true,
        showStaminaBar: true,
        showAmmoCounter: false,
        showCompass: true,
        genreLayout: 'rpg',
        menuConfig: {
          mainMenu: { title: 'Test', buttons: [] },
          pauseMenu: { buttons: [], maxSaveSlots: 10 },
          settingsMenu: { categories: [] },
          inventoryScreen: { slots: 20, categories: [] },
          mapScreen: { enabled: true, zoomLevels: [1, 2, 4] },
        },
      } as any,
    });
    const files = generateCppFiles(ir);
    const h = files.find(f => f.path.endsWith('UI/InsimulPauseMenuWidget.h'))!;
    expect(h.content).toContain('MaxSaveSlots = 10');
  });
});

// ─────────────────────────────────────────────
// SaveGame generation
// ─────────────────────────────────────────────

describe('Unreal export - SaveGame', () => {
  it('generates InsimulSaveGame.h in UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const h = files.find(f => f.path.endsWith('UI/InsimulSaveGame.h'));
    expect(h).toBeDefined();
    expect(h!.content).toContain('UInsimulSaveGame');
    expect(h!.content).toContain('USaveGame');
  });

  it('generates InsimulSaveGame.cpp in UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('UI/InsimulSaveGame.cpp'));
    expect(cpp).toBeDefined();
    expect(cpp!.content).toContain('UInsimulSaveGame');
  });

  it('save game header has player state fields', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const h = files.find(f => f.path.endsWith('UI/InsimulSaveGame.h'))!;
    expect(h.content).toContain('PlayerLocation');
    expect(h.content).toContain('PlayerRotation');
    expect(h.content).toContain('PlayerHealth');
    expect(h.content).toContain('PlayerEnergy');
    expect(h.content).toContain('PlayerGold');
  });

  it('save game header has quest and inventory fields', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const h = files.find(f => f.path.endsWith('UI/InsimulSaveGame.h'))!;
    expect(h.content).toContain('ActiveQuestIds');
    expect(h.content).toContain('CompletedQuestIds');
    expect(h.content).toContain('InventoryItemIds');
  });

  it('save game header has world state fields', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const h = files.find(f => f.path.endsWith('UI/InsimulSaveGame.h'))!;
    expect(h.content).toContain('CurrentLevelName');
    expect(h.content).toContain('PlayTimeSeconds');
    expect(h.content).toContain('SaveDisplayName');
    expect(h.content).toContain('SaveTimestamp');
  });
});

// ─────────────────────────────────────────────
// PlayerController pause menu integration
// ─────────────────────────────────────────────

describe('Unreal export - PlayerController pause menu integration', () => {
  it('PlayerController header declares PauseMenuWidget', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const h = files.find(f => f.path.endsWith('InsimulPlayerController.h'))!;
    expect(h.content).toContain('UInsimulPauseMenuWidget');
    expect(h.content).toContain('PauseMenuWidget');
    expect(h.content).toContain('TogglePauseMenu');
  });

  it('PlayerController cpp creates pause menu widget', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulPlayerController.cpp'))!;
    expect(cpp.content).toContain('CreateWidget<UInsimulPauseMenuWidget>');
    expect(cpp.content).toContain('CreatePauseMenu');
  });

  it('PlayerController cpp binds PauseMenu input action', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulPlayerController.cpp'))!;
    expect(cpp.content).toContain('BindAction');
    expect(cpp.content).toContain('"PauseMenu"');
    expect(cpp.content).toContain('TogglePauseMenu');
  });

  it('PlayerController cpp adds pause menu at high viewport priority', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulPlayerController.cpp'))!;
    expect(cpp.content).toContain('AddToViewport(100)');
  });
});
