/**
 * Tests for Godot minimap UI generation
 *
 * Verifies that the minimap script, scene node, and external resource
 * are conditionally included based on ir.ui.showMinimap.
 */

import { describe, it, expect } from 'vitest';
import { generateGDScriptFiles } from '../services/game-export/godot/godot-gdscript-generator';
import { generateSceneFiles } from '../services/game-export/godot/godot-scene-generator';
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
// GDScript generator — minimap inclusion
// ─────────────────────────────────────────────

describe('Godot GDScript generator - minimap', () => {
  it('includes minimap.gd when showMinimap is true', () => {
    const ir = makeMinimalIR({ ui: { showMinimap: true, showQuestTracker: true, showChat: true } as any });
    const files = generateGDScriptFiles(ir);
    const minimap = files.find(f => f.path === 'scripts/ui/minimap.gd');
    expect(minimap).toBeDefined();
  });

  it('excludes minimap.gd when showMinimap is false', () => {
    const ir = makeMinimalIR({ ui: { showMinimap: false, showQuestTracker: true, showChat: true } as any });
    const files = generateGDScriptFiles(ir);
    const minimap = files.find(f => f.path === 'scripts/ui/minimap.gd');
    expect(minimap).toBeUndefined();
  });

  it('minimap script extends Control', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const minimap = files.find(f => f.path === 'scripts/ui/minimap.gd');
    expect(minimap!.content).toMatch(/^extends Control/);
  });

  it('minimap script has required methods', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const minimap = files.find(f => f.path === 'scripts/ui/minimap.gd')!;
    expect(minimap.content).toContain('func _ready()');
    expect(minimap.content).toContain('func _process(');
    expect(minimap.content).toContain('func add_poi(');
    expect(minimap.content).toContain('func remove_poi(');
    expect(minimap.content).toContain('func set_minimap_visible(');
  });

  it('minimap script uses SubViewport for rendering', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const minimap = files.find(f => f.path === 'scripts/ui/minimap.gd')!;
    expect(minimap.content).toContain('SubViewport.new()');
    expect(minimap.content).toContain('SubViewportContainer.new()');
    expect(minimap.content).toContain('Camera3D.new()');
  });

  it('minimap script supports POI types: quest, npc, building', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const minimap = files.find(f => f.path === 'scripts/ui/minimap.gd')!;
    expect(minimap.content).toContain('"quest"');
    expect(minimap.content).toContain('"npc"');
    expect(minimap.content).toContain('"building"');
  });

  it('minimap script has toggle keybind (M key)', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const minimap = files.find(f => f.path === 'scripts/ui/minimap.gd')!;
    expect(minimap.content).toContain('KEY_M');
  });
});

// ─────────────────────────────────────────────
// Scene generator — minimap node
// ─────────────────────────────────────────────

describe('Godot scene generator - minimap', () => {
  it('adds Minimap node as child of HUD when showMinimap is true', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main.tscn')!;
    expect(tscn.content).toContain('[node name="Minimap" type="Control" parent="HUD"]');
  });

  it('excludes Minimap node when showMinimap is false', () => {
    const ir = makeMinimalIR({ ui: { showMinimap: false, showQuestTracker: true, showChat: true } as any });
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main.tscn')!;
    expect(tscn.content).not.toContain('Minimap');
  });

  it('adds minimap.gd external resource when showMinimap is true', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main.tscn')!;
    expect(tscn.content).toContain('path="res://scripts/ui/minimap.gd"');
  });

  it('excludes minimap.gd external resource when showMinimap is false', () => {
    const ir = makeMinimalIR({ ui: { showMinimap: false, showQuestTracker: true, showChat: true } as any });
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main.tscn')!;
    expect(tscn.content).not.toContain('minimap.gd');
  });

  it('updates load_steps count when minimap is included', () => {
    const irWith = makeMinimalIR({ ui: { showMinimap: true, showQuestTracker: true, showChat: true } as any });
    const irWithout = makeMinimalIR({ ui: { showMinimap: false, showQuestTracker: true, showChat: true } as any });

    const tscnWith = generateSceneFiles(irWith).find(f => f.path === 'scenes/main.tscn')!;
    const tscnWithout = generateSceneFiles(irWithout).find(f => f.path === 'scenes/main.tscn')!;

    const stepsWithMatch = tscnWith.content.match(/load_steps=(\d+)/);
    const stepsWithoutMatch = tscnWithout.content.match(/load_steps=(\d+)/);
    expect(stepsWithMatch).not.toBeNull();
    expect(stepsWithoutMatch).not.toBeNull();

    const stepsWith = parseInt(stepsWithMatch![1]);
    const stepsWithout = parseInt(stepsWithoutMatch![1]);
    expect(stepsWith).toBe(stepsWithout + 1);
  });

  it('Minimap node references correct ExtResource id', () => {
    const ir = makeMinimalIR();
    const files = generateSceneFiles(ir);
    const tscn = files.find(f => f.path === 'scenes/main.tscn')!;
    // minimap.gd is ext resource id 18 (after all other UI scripts)
    expect(tscn.content).toContain('path="res://scripts/ui/minimap.gd" id="18"');
    // And it's the Minimap node that uses it
    const minimapSection = tscn.content.split('[node name="Minimap"')[1];
    expect(minimapSection).toContain('ExtResource("18")');
  });
});
