/**
 * Tests for Godot main menu scene generation.
 *
 * Verifies that the scene generator produces a valid main_menu.tscn,
 * the GDScript generator includes main_menu.gd with correct token substitution,
 * and the project.godot template references the main menu as the entry scene.
 */

import { describe, it, expect } from 'vitest';
import { generateSceneFiles } from '../services/game-export/godot/godot-scene-generator';
import { generateGDScriptFiles } from '../services/game-export/godot/godot-gdscript-generator';
import { generateProjectFiles } from '../services/game-export/godot/godot-project-generator';
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
    ...overrides,
  } as WorldIR;
}

// ─────────────────────────────────────────────
// Scene generator: main_menu.tscn
// ─────────────────────────────────────────────

describe('Godot scene generator - main menu', () => {
  it('generates main_menu.tscn file', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const menuFile = files.find(f => f.path === 'scenes/main_menu.tscn');
    expect(menuFile).toBeDefined();
  });

  it('main_menu.tscn has valid gd_scene header', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main_menu.tscn')!.content;
    expect(tscn).toMatch(/^\[gd_scene load_steps=\d+ format=3\]/);
  });

  it('references main_menu.gd script', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main_menu.tscn')!.content;
    expect(tscn).toContain('path="res://scripts/ui/main_menu.gd"');
  });

  it('has root MainMenu Control node', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main_menu.tscn')!.content;
    expect(tscn).toContain('[node name="MainMenu" type="Control"]');
  });

  it('contains title label, buttons, and settings panel', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main_menu.tscn')!.content;

    expect(tscn).toContain('[node name="TitleLabel" type="Label"');
    expect(tscn).toContain('[node name="NewGameButton" type="Button"');
    expect(tscn).toContain('[node name="SettingsButton" type="Button"');
    expect(tscn).toContain('[node name="QuitButton" type="Button"');
    expect(tscn).toContain('[node name="SettingsPanel" type="PanelContainer"');
  });

  it('uses world name as title when menuConfig is absent', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main_menu.tscn')!.content;
    expect(tscn).toContain('text = "Test World"');
  });

  it('uses menuConfig title when present', () => {
    const ir = makeMinimalIR({
      ui: {
        showMinimap: true,
        showQuestTracker: true,
        showChat: true,
        showHealthBar: true,
        showStaminaBar: false,
        showAmmoCounter: false,
        showCompass: false,
        genreLayout: 'default',
        menuConfig: {
          mainMenu: { title: 'My Custom Title', buttons: [] },
          pauseMenu: { buttons: [] },
          settingsMenu: { categories: [] },
          inventoryScreen: { slots: 20, categories: [] },
          mapScreen: {},
          questJournal: {},
        },
        questJournal: { maxEntries: 50, showCompleted: true, categories: [] },
      },
    } as Partial<WorldIR>);
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main_menu.tscn')!.content;
    expect(tscn).toContain('text = "My Custom Title"');
  });

  it('uses sky color for background tint', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main_menu.tscn')!.content;
    // Sky color is {r:0.5, g:0.7, b:1.0} * 0.3
    expect(tscn).toContain('Color(0.15');
  });

  it('settings panel is hidden by default', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main_menu.tscn')!.content;
    expect(tscn).toContain('visible = false');
  });

  it('still generates main.tscn alongside main_menu.tscn', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    expect(files.find(f => f.path === 'scenes/main.tscn')).toBeDefined();
    expect(files.find(f => f.path === 'scenes/main_menu.tscn')).toBeDefined();
    expect(files.find(f => f.path === 'data/scene_descriptor.json')).toBeDefined();
  });
});

// ─────────────────────────────────────────────
// GDScript generator: main_menu.gd
// ─────────────────────────────────────────────

describe('Godot GDScript generator - main menu', () => {
  it('includes main_menu.gd in output', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const menuScript = files.find(f => f.path === 'scripts/ui/main_menu.gd');
    expect(menuScript).toBeDefined();
  });

  it('substitutes GAME_TITLE token with world name', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const menuScript = files.find(f => f.path === 'scripts/ui/main_menu.gd')!;
    expect(menuScript.content).not.toContain('{{GAME_TITLE}}');
    expect(menuScript.content).toContain('"Test World"');
  });

  it('main_menu.gd has scene transition to main.tscn', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const menuScript = files.find(f => f.path === 'scripts/ui/main_menu.gd')!;
    expect(menuScript.content).toContain('res://scenes/main.tscn');
  });

  it('main_menu.gd has quit function', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const menuScript = files.find(f => f.path === 'scripts/ui/main_menu.gd')!;
    expect(menuScript.content).toContain('get_tree().quit()');
  });
});

// ─────────────────────────────────────────────
// Project config: main scene entry
// ─────────────────────────────────────────────

describe('Godot project config - main menu as entry scene', () => {
  it('project.godot sets main_menu.tscn as the main scene', () => {
    const ir = makeMinimalIR();
    const files = generateProjectFiles(ir);
    const projectFile = files.find(f => f.path === 'project.godot');
    expect(projectFile).toBeDefined();
    expect(projectFile!.content).toContain('run/main_scene="res://scenes/main_menu.tscn"');
  });
});
