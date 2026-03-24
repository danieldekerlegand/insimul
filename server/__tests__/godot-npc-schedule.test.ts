/**
 * Tests for Godot NPC schedule-driven behavior export
 *
 * Verifies that:
 * - game_clock.gd autoload singleton is generated
 * - npc_controller.gd includes schedule state and evaluation logic
 * - project.godot registers GameClock autoload
 * - Data generator exports schedule data for NPCs
 */

import { describe, it, expect } from 'vitest';
import { generateGDScriptFiles } from '../services/game-export/godot/godot-gdscript-generator';
import { generateProjectFiles } from '../services/game-export/godot/godot-project-generator';
import { generateDataFiles } from '../services/game-export/godot/godot-data-generator';
import type { WorldIR, NPCDailyScheduleIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

function makeScheduleIR(): NPCDailyScheduleIR {
  return {
    homeBuildingId: 'bld-home-1',
    workBuildingId: 'bld-work-1',
    friendBuildingIds: ['bld-friend-1'],
    wakeHour: 6.5,
    bedtimeHour: 22,
    blocks: [
      { startHour: 22, endHour: 6.5, activity: 'sleep', buildingId: 'bld-home-1', priority: 1 },
      { startHour: 6.5, endHour: 7.5, activity: 'eat', buildingId: 'bld-home-1', priority: 1 },
      { startHour: 7.5, endHour: 12, activity: 'work', buildingId: 'bld-work-1', priority: 1 },
      { startHour: 12, endHour: 13, activity: 'eat', buildingId: null, priority: 1 },
      { startHour: 13, endHour: 17, activity: 'work', buildingId: 'bld-work-1', priority: 1 },
      { startHour: 17, endHour: 19, activity: 'socialize', buildingId: null, priority: 1 },
      { startHour: 19, endHour: 22, activity: 'idle_at_home', buildingId: 'bld-home-1', priority: 1 },
    ],
  };
}

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
      settlements: [],
      waterFeatures: [],
      foliageLayers: [],
      biomeZones: [],
    },
    entities: {
      characters: [],
      npcs: [
        {
          characterId: 'char-1',
          role: 'merchant',
          homePosition: { x: 10, y: 0, z: 20 },
          patrolRadius: 15,
          disposition: 75,
          settlementId: 'settlement-1',
          questIds: ['quest-1'],
          greeting: 'Welcome!',
          schedule: makeScheduleIR(),
        },
      ],
      buildings: [],
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
// game_clock.gd — singleton time system
// ─────────────────────────────────────────────

describe('Godot NPC schedule - game_clock.gd', () => {
  const ir = makeMinimalIR();
  const files = generateGDScriptFiles(ir);

  it('includes game_clock.gd in output', () => {
    const clock = files.find(f => f.path.endsWith('game_clock.gd'));
    expect(clock).toBeDefined();
    expect(clock!.path).toBe('scripts/core/game_clock.gd');
  });

  it('has current_hour variable', () => {
    const clock = files.find(f => f.path.endsWith('game_clock.gd'))!;
    expect(clock.content).toContain('current_hour');
  });

  it('has time_scale field for configurable speed', () => {
    const clock = files.find(f => f.path.endsWith('game_clock.gd'))!;
    expect(clock.content).toContain('time_scale');
  });

  it('tracks day count', () => {
    const clock = files.find(f => f.path.endsWith('game_clock.gd'))!;
    expect(clock.content).toContain('var day');
  });

  it('supports pausing', () => {
    const clock = files.find(f => f.path.endsWith('game_clock.gd'))!;
    expect(clock.content).toContain('is_paused');
  });

  it('wraps hours at 24', () => {
    const clock = files.find(f => f.path.endsWith('game_clock.gd'))!;
    expect(clock.content).toContain('>= 24.0');
    expect(clock.content).toContain('-= 24.0');
  });

  it('emits hour_changed event', () => {
    const clock = files.find(f => f.path.endsWith('game_clock.gd'))!;
    expect(clock.content).toContain('hour_changed');
  });

  it('emits day_changed event', () => {
    const clock = files.find(f => f.path.endsWith('game_clock.gd'))!;
    expect(clock.content).toContain('day_changed');
  });
});

// ─────────────────────────────────────────────
// project.godot — GameClock autoload
// ─────────────────────────────────────────────

describe('Godot NPC schedule - project.godot autoload', () => {
  const ir = makeMinimalIR();
  const files = generateProjectFiles(ir);

  it('registers GameClock as autoload', () => {
    const project = files.find(f => f.path === 'project.godot')!;
    expect(project.content).toContain('GameClock="*res://scripts/core/game_clock.gd"');
  });
});

// ─────────────────────────────────────────────
// npc_controller.gd — schedule-driven behavior
// ─────────────────────────────────────────────

describe('Godot NPC schedule - npc_controller.gd', () => {
  const ir = makeMinimalIR();
  const files = generateGDScriptFiles(ir);

  it('includes SCHEDULE_MOVE state in NPCState enum', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('SCHEDULE_MOVE');
  });

  it('has has_schedule field', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('has_schedule');
  });

  it('has current_block_index field', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('current_block_index');
  });

  it('implements _evaluate_schedule method', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('_evaluate_schedule()');
  });

  it('implements _find_block_for_hour method', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('_find_block_for_hour');
  });

  it('reads GameClock.current_hour', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('GameClock.current_hour');
  });

  it('handles midnight-wrapping schedule blocks', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('start <= end');
    expect(ctrl.content).toContain('hour >= start or hour < end');
  });

  it('resolves building positions for navigation', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('_resolve_building_position');
    expect(ctrl.content).toContain('DataLoader.load_buildings()');
  });

  it('uses NavigationAgent3D for schedule movement', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('nav_agent.target_position');
    expect(ctrl.content).toContain('nav_agent.get_next_path_position()');
  });

  it('loads schedule from init_from_data', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('_load_schedule');
    expect(ctrl.content).toContain('_schedule_blocks');
    expect(ctrl.content).toContain('has_schedule = true');
  });

  it('pauses schedule during dialogue', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('current_state != NPCState.TALKING');
  });

  it('resets block index on end_dialogue to re-evaluate', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('current_block_index = -1');
  });

  it('handles wander activity as patrol', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    expect(ctrl.content).toContain('"wander"');
    expect(ctrl.content).toContain('NPCState.PATROL');
  });

  it('scheduled NPCs skip idle patrol behavior', () => {
    const ctrl = files.find(f => f.path.endsWith('npc_controller.gd'))!;
    // _update_idle should return early if has_schedule
    expect(ctrl.content).toContain('if has_schedule:\n\t\treturn');
  });
});

// ─────────────────────────────────────────────
// Data generator — schedule export
// ─────────────────────────────────────────────

describe('Godot NPC schedule - data export', () => {
  it('exports schedule data in npcs.json', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const npcsFile = files.find(f => f.path.endsWith('npcs.json'))!;
    const npcs = JSON.parse(npcsFile.content);
    expect(npcs).toHaveLength(1);
    expect(npcs[0].schedule).toBeDefined();
    expect(npcs[0].schedule).not.toBeNull();
  });

  it('includes schedule building IDs', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const npcsFile = files.find(f => f.path.endsWith('npcs.json'))!;
    const npc = JSON.parse(npcsFile.content)[0];
    expect(npc.schedule.homeBuildingId).toBe('bld-home-1');
    expect(npc.schedule.workBuildingId).toBe('bld-work-1');
    expect(npc.schedule.friendBuildingIds).toEqual(['bld-friend-1']);
  });

  it('includes schedule time blocks', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const npcsFile = files.find(f => f.path.endsWith('npcs.json'))!;
    const npc = JSON.parse(npcsFile.content)[0];
    expect(npc.schedule.blocks).toHaveLength(7);
    const workBlock = npc.schedule.blocks.find((b: any) => b.activity === 'work' && b.startHour === 7.5);
    expect(workBlock).toBeDefined();
    expect(workBlock.endHour).toBe(12);
    expect(workBlock.buildingId).toBe('bld-work-1');
  });

  it('includes wake/bedtime hours', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const npcsFile = files.find(f => f.path.endsWith('npcs.json'))!;
    const npc = JSON.parse(npcsFile.content)[0];
    expect(npc.schedule.wakeHour).toBe(6.5);
    expect(npc.schedule.bedtimeHour).toBe(22);
  });

  it('exports null schedule for NPCs without one', () => {
    const ir = makeMinimalIR();
    ir.entities.npcs = [{
      characterId: 'char-2',
      role: 'guard',
      homePosition: { x: 5, y: 0, z: 5 },
      patrolRadius: 10,
      disposition: 50,
      settlementId: null as any,
      questIds: [],
      greeting: null as any,
      schedule: null,
    }];
    const files = generateDataFiles(ir);
    const npcsFile = files.find(f => f.path.endsWith('npcs.json'))!;
    const npc = JSON.parse(npcsFile.content)[0];
    expect(npc.schedule).toBeNull();
  });
});
