/**
 * Tests for Godot character animation controller export.
 *
 * Verifies that the animation controller GDScript template is included
 * in exports, and that player/NPC controllers reference it correctly.
 */

import { describe, it, expect } from 'vitest';
import { generateGDScriptFiles } from '../services/game-export/godot/godot-gdscript-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(): WorldIR {
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
  } as WorldIR;
}

// ─────────────────────────────────────────────
// Animation controller template tests
// ─────────────────────────────────────────────

describe('Godot character animation controller', () => {
  it('includes character_animation_controller.gd in generated files', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const animCtrl = files.find(f => f.path === 'scripts/characters/character_animation_controller.gd');
    expect(animCtrl).toBeDefined();
  });

  it('animation controller extends Node', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const animCtrl = files.find(f => f.path === 'scripts/characters/character_animation_controller.gd')!;
    expect(animCtrl.content).toMatch(/^extends Node/);
  });

  it('animation controller has set_speed method', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const animCtrl = files.find(f => f.path === 'scripts/characters/character_animation_controller.gd')!;
    expect(animCtrl.content).toContain('func set_speed(speed: float)');
  });

  it('animation controller has set_grounded method', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const animCtrl = files.find(f => f.path === 'scripts/characters/character_animation_controller.gd')!;
    expect(animCtrl.content).toContain('func set_grounded(grounded: bool)');
  });

  it('animation controller has set_talking method', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const animCtrl = files.find(f => f.path === 'scripts/characters/character_animation_controller.gd')!;
    expect(animCtrl.content).toContain('func set_talking(talking: bool)');
  });

  it('animation controller has trigger methods', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const animCtrl = files.find(f => f.path === 'scripts/characters/character_animation_controller.gd')!;
    expect(animCtrl.content).toContain('func trigger_attack()');
    expect(animCtrl.content).toContain('func trigger_interact()');
    expect(animCtrl.content).toContain('func trigger_die()');
  });

  it('animation controller has play_clip method', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const animCtrl = files.find(f => f.path === 'scripts/characters/character_animation_controller.gd')!;
    expect(animCtrl.content).toContain('func play_clip(clip_name: String)');
  });

  it('animation controller has has_animator method', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const animCtrl = files.find(f => f.path === 'scripts/characters/character_animation_controller.gd')!;
    expect(animCtrl.content).toContain('func has_animator() -> bool');
  });

  it('animation controller emits animation_changed signal', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const animCtrl = files.find(f => f.path === 'scripts/characters/character_animation_controller.gd')!;
    expect(animCtrl.content).toContain('signal animation_changed(anim_name: String)');
  });

  it('animation controller searches for AnimationPlayer recursively', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const animCtrl = files.find(f => f.path === 'scripts/characters/character_animation_controller.gd')!;
    expect(animCtrl.content).toContain('func _find_animation_player(node: Node) -> AnimationPlayer');
  });
});

// ─────────────────────────────────────────────
// Player controller animation integration tests
// ─────────────────────────────────────────────

describe('Godot player controller animation integration', () => {
  it('player controller finds animation controller child', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const player = files.find(f => f.path === 'scripts/characters/player_controller.gd')!;
    expect(player.content).toContain('_find_anim_controller');
  });

  it('player controller calls set_speed with horizontal velocity', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const player = files.find(f => f.path === 'scripts/characters/player_controller.gd')!;
    expect(player.content).toContain('_anim_controller.set_speed(horizontal_speed)');
  });

  it('player controller calls set_grounded', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const player = files.find(f => f.path === 'scripts/characters/player_controller.gd')!;
    expect(player.content).toContain('_anim_controller.set_grounded(is_on_floor())');
  });

  it('player controller triggers attack animation', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const player = files.find(f => f.path === 'scripts/characters/player_controller.gd')!;
    expect(player.content).toContain('_anim_controller.trigger_attack()');
  });

  it('player controller triggers interact animation', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const player = files.find(f => f.path === 'scripts/characters/player_controller.gd')!;
    expect(player.content).toContain('_anim_controller.trigger_interact()');
  });
});

// ─────────────────────────────────────────────
// NPC controller animation integration tests
// ─────────────────────────────────────────────

describe('Godot NPC controller animation integration', () => {
  it('NPC controller finds animation controller child', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const npc = files.find(f => f.path === 'scripts/characters/npc_controller.gd')!;
    expect(npc.content).toContain('_find_anim_controller');
  });

  it('NPC controller sets speed to zero when idle', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const npc = files.find(f => f.path === 'scripts/characters/npc_controller.gd')!;
    expect(npc.content).toContain('_anim_controller.set_speed(0.0)');
  });

  it('NPC controller sets speed during patrol', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const npc = files.find(f => f.path === 'scripts/characters/npc_controller.gd')!;
    expect(npc.content).toContain('_anim_controller.set_speed(velocity.length())');
  });

  it('NPC controller sets talking state for dialogue', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const npc = files.find(f => f.path === 'scripts/characters/npc_controller.gd')!;
    expect(npc.content).toContain('_anim_controller.set_talking(true)');
    expect(npc.content).toContain('_anim_controller.set_talking(false)');
  });
});

// ─────────────────────────────────────────────
// NPC spawner animation integration tests
// ─────────────────────────────────────────────

describe('Godot NPC spawner animation controller attachment', () => {
  it('NPC spawner loads animation controller script', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const spawner = files.find(f => f.path === 'scripts/characters/npc_spawner.gd')!;
    expect(spawner.content).toContain('load("res://scripts/characters/character_animation_controller.gd")');
  });

  it('NPC spawner creates AnimationController node', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const spawner = files.find(f => f.path === 'scripts/characters/npc_spawner.gd')!;
    expect(spawner.content).toContain('anim_ctrl.name = "AnimationController"');
  });

  it('NPC spawner attaches animation controller before NPC script', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const spawner = files.find(f => f.path === 'scripts/characters/npc_spawner.gd')!;
    const animCtrlIdx = spawner.content.indexOf('character_animation_controller.gd');
    const npcScriptIdx = spawner.content.indexOf('npc_controller.gd');
    expect(animCtrlIdx).toBeLessThan(npcScriptIdx);
  });
});
