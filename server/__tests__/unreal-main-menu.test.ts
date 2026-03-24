/**
 * Tests for Unreal main menu widget and level generation.
 *
 * Verifies that the Unreal export pipeline correctly generates:
 * - Main menu widget C++ templates (InsimulMainMenuWidget.h/.cpp)
 * - Main menu game mode C++ templates (InsimulMainMenuGameMode.h/.cpp)
 * - Main menu level descriptor JSON (MainMenuLevel.json)
 * - Menu title and background from WorldIR menu config
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import { generateLevelFiles } from '../services/game-export/unreal/unreal-level-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture with menu config
// ─────────────────────────────────────────────

function makeMenuIR(overrides?: Partial<WorldIR>): WorldIR {
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
    ui: {
      showMinimap: true,
      showHealthBar: true,
      showStaminaBar: true,
      showAmmoCounter: false,
      showCompass: true,
      genreLayout: 'rpg',
      menuConfig: {
        mainMenu: {
          title: 'Realm of Shadows',
          backgroundImage: 'ui/backgrounds/fantasy_landscape.jpg',
          buttons: [
            { label: 'New Game', action: 'new_game' },
            { label: 'Continue', action: 'continue' },
            { label: 'Settings', action: 'open_settings' },
            { label: 'Quit', action: 'quit' },
          ],
        },
        pauseMenu: {
          buttons: [
            { label: 'Resume', action: 'resume' },
            { label: 'Settings', action: 'open_settings' },
            { label: 'Save', action: 'save_game' },
            { label: 'Main Menu', action: 'main_menu' },
            { label: 'Quit', action: 'quit' },
          ],
        },
        settingsMenu: {
          categories: [
            { name: 'Audio', settings: [{ key: 'master_volume', label: 'Master Volume', type: 'slider', default: 80 }] },
            { name: 'Graphics', settings: [{ key: 'quality', label: 'Quality', type: 'dropdown', default: 'medium', options: ['low', 'medium', 'high'] }] },
          ],
        },
        inventoryScreen: { slots: 40, categories: ['All'] },
        mapScreen: { enabled: true, zoomLevels: [0.5, 1, 2, 4] },
      },
    },
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
// C++ Main Menu Widget generation
// ─────────────────────────────────────────────

describe('Unreal export - Main Menu Widget C++', () => {
  it('generates InsimulMainMenuWidget.h', () => {
    const ir = makeMenuIR();
    const files = generateCppFiles(ir);
    const widget = files.find(f => f.path.endsWith('InsimulMainMenuWidget.h'));
    expect(widget).toBeDefined();
    expect(widget!.content).toContain('UInsimulMainMenuWidget');
    expect(widget!.content).toContain('UUserWidget');
  });

  it('generates InsimulMainMenuWidget.cpp', () => {
    const ir = makeMenuIR();
    const files = generateCppFiles(ir);
    const widget = files.find(f => f.path.endsWith('InsimulMainMenuWidget.cpp'));
    expect(widget).toBeDefined();
    expect(widget!.content).toContain('NativeConstruct');
    expect(widget!.content).toContain('OnNewGameClicked');
    expect(widget!.content).toContain('OnSettingsClicked');
    expect(widget!.content).toContain('OnQuitClicked');
  });

  it('generates InsimulMainMenuGameMode.h with title token', () => {
    const ir = makeMenuIR();
    const files = generateCppFiles(ir);
    const gm = files.find(f => f.path.endsWith('InsimulMainMenuGameMode.h'));
    expect(gm).toBeDefined();
    expect(gm!.content).toContain('Realm of Shadows');
    expect(gm!.content).toContain('AInsimulMainMenuGameMode');
  });

  it('generates InsimulMainMenuGameMode.cpp', () => {
    const ir = makeMenuIR();
    const files = generateCppFiles(ir);
    const gm = files.find(f => f.path.endsWith('InsimulMainMenuGameMode.cpp'));
    expect(gm).toBeDefined();
    expect(gm!.content).toContain('MainMenuWidget');
    expect(gm!.content).toContain('AddToViewport');
  });

  it('places UI files in Source/InsimulExport/UI/', () => {
    const ir = makeMenuIR();
    const files = generateCppFiles(ir);
    const uiFiles = files.filter(f => f.path.includes('/UI/'));
    expect(uiFiles.length).toBe(4);
    expect(uiFiles.every(f => f.path.startsWith('Source/InsimulExport/UI/'))).toBe(true);
  });

  it('substitutes background image token in game mode header', () => {
    const ir = makeMenuIR();
    const files = generateCppFiles(ir);
    const gm = files.find(f => f.path.endsWith('InsimulMainMenuGameMode.h'));
    expect(gm!.content).toContain('ui/backgrounds/fantasy_landscape.jpg');
    expect(gm!.content).not.toContain('{{MENU_BACKGROUND}}');
  });

  it('falls back to worldName when menuConfig is missing', () => {
    const ir = makeMenuIR();
    (ir.ui as any).menuConfig = undefined;
    const files = generateCppFiles(ir);
    const gm = files.find(f => f.path.endsWith('InsimulMainMenuGameMode.h'));
    expect(gm!.content).toContain('Test World');
  });
});

// ─────────────────────────────────────────────
// Main Menu Level Descriptor
// ─────────────────────────────────────────────

describe('Unreal export - Main Menu Level Descriptor', () => {
  it('generates MainMenuLevel.json', () => {
    const ir = makeMenuIR();
    const files = generateLevelFiles(ir);
    const menuLevel = files.find(f => f.path.endsWith('MainMenuLevel.json'));
    expect(menuLevel).toBeDefined();
  });

  it('includes correct level type and version', () => {
    const ir = makeMenuIR();
    const files = generateLevelFiles(ir);
    const menuLevel = files.find(f => f.path.endsWith('MainMenuLevel.json'))!;
    const data = JSON.parse(menuLevel.content);
    expect(data.version).toBe(1);
    expect(data.levelType).toBe('main_menu');
  });

  it('includes menu title from IR', () => {
    const ir = makeMenuIR();
    const files = generateLevelFiles(ir);
    const menuLevel = files.find(f => f.path.endsWith('MainMenuLevel.json'))!;
    const data = JSON.parse(menuLevel.content);
    expect(data.title).toBe('Realm of Shadows');
  });

  it('includes background image path', () => {
    const ir = makeMenuIR();
    const files = generateLevelFiles(ir);
    const menuLevel = files.find(f => f.path.endsWith('MainMenuLevel.json'))!;
    const data = JSON.parse(menuLevel.content);
    expect(data.backgroundImage).toBe('ui/backgrounds/fantasy_landscape.jpg');
  });

  it('includes all menu buttons', () => {
    const ir = makeMenuIR();
    const files = generateLevelFiles(ir);
    const menuLevel = files.find(f => f.path.endsWith('MainMenuLevel.json'))!;
    const data = JSON.parse(menuLevel.content);
    expect(data.buttons).toHaveLength(4);
    expect(data.buttons[0]).toEqual({ label: 'New Game', action: 'new_game' });
    expect(data.buttons[3]).toEqual({ label: 'Quit', action: 'quit' });
  });

  it('includes settings categories', () => {
    const ir = makeMenuIR();
    const files = generateLevelFiles(ir);
    const menuLevel = files.find(f => f.path.endsWith('MainMenuLevel.json'))!;
    const data = JSON.parse(menuLevel.content);
    expect(data.settingsCategories).toEqual(['Audio', 'Graphics']);
  });

  it('includes game level name for navigation', () => {
    const ir = makeMenuIR();
    const files = generateLevelFiles(ir);
    const menuLevel = files.find(f => f.path.endsWith('MainMenuLevel.json'))!;
    const data = JSON.parse(menuLevel.content);
    expect(data.gameLevelName).toBe('GameLevel');
  });

  it('still generates LevelDescriptor.json alongside menu level', () => {
    const ir = makeMenuIR();
    const files = generateLevelFiles(ir);
    const gameLevel = files.find(f => f.path.endsWith('LevelDescriptor.json'));
    expect(gameLevel).toBeDefined();
  });

  it('falls back gracefully when menuConfig is missing', () => {
    const ir = makeMenuIR();
    (ir.ui as any).menuConfig = undefined;
    const files = generateLevelFiles(ir);
    const menuLevel = files.find(f => f.path.endsWith('MainMenuLevel.json'))!;
    const data = JSON.parse(menuLevel.content);
    expect(data.title).toBe('Test World');
    expect(data.buttons).toEqual([]);
    expect(data.settingsCategories).toEqual([]);
  });
});
