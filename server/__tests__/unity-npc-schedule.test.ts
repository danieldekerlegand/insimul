/**
 * Tests for Unity NPC schedule-driven behavior export
 *
 * Verifies that:
 * - InsimulNPCData.cs includes schedule data classes (ScheduleBlockData, NPCScheduleData)
 * - GameClock.cs singleton is generated
 * - NPCController.cs includes schedule state and evaluation logic
 * - Data generator exports schedule data for NPCs
 */

import { describe, it, expect } from 'vitest';
import { generateCSharpFiles } from '../services/game-export/unity/unity-csharp-generator';
import { generateDataFiles } from '../services/game-export/unity/unity-data-generator';
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
// GameClock.cs — singleton time system
// ─────────────────────────────────────────────

describe('Unity NPC schedule - GameClock.cs', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('includes GameClock.cs in output', () => {
    const clock = files.find(f => f.path.endsWith('GameClock.cs'));
    expect(clock).toBeDefined();
    expect(clock!.path).toBe('Assets/Scripts/Core/GameClock.cs');
  });

  it('is a singleton with static Instance', () => {
    const clock = files.find(f => f.path.endsWith('GameClock.cs'))!;
    expect(clock.content).toContain('static GameClock Instance');
  });

  it('has CurrentHour property', () => {
    const clock = files.find(f => f.path.endsWith('GameClock.cs'))!;
    expect(clock.content).toContain('CurrentHour');
  });

  it('has timeScale field for configurable speed', () => {
    const clock = files.find(f => f.path.endsWith('GameClock.cs'))!;
    expect(clock.content).toContain('timeScale');
  });

  it('tracks Day count', () => {
    const clock = files.find(f => f.path.endsWith('GameClock.cs'))!;
    expect(clock.content).toContain('Day');
  });

  it('supports pausing', () => {
    const clock = files.find(f => f.path.endsWith('GameClock.cs'))!;
    expect(clock.content).toContain('IsPaused');
  });

  it('wraps hours at 24', () => {
    const clock = files.find(f => f.path.endsWith('GameClock.cs'))!;
    expect(clock.content).toContain('>= 24f');
    expect(clock.content).toContain('-= 24f');
  });
});

// ─────────────────────────────────────────────
// InsimulNPCData.cs — schedule data classes
// ─────────────────────────────────────────────

describe('Unity NPC schedule - InsimulNPCData.cs', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('includes ScheduleBlockData class', () => {
    const npcData = files.find(f => f.path.endsWith('InsimulNPCData.cs'))!;
    expect(npcData.content).toContain('class ScheduleBlockData');
    expect(npcData.content).toContain('startHour');
    expect(npcData.content).toContain('endHour');
    expect(npcData.content).toContain('activity');
    expect(npcData.content).toContain('buildingId');
    expect(npcData.content).toContain('priority');
  });

  it('includes NPCScheduleData class', () => {
    const npcData = files.find(f => f.path.endsWith('InsimulNPCData.cs'))!;
    expect(npcData.content).toContain('class NPCScheduleData');
    expect(npcData.content).toContain('homeBuildingId');
    expect(npcData.content).toContain('workBuildingId');
    expect(npcData.content).toContain('friendBuildingIds');
    expect(npcData.content).toContain('wakeHour');
    expect(npcData.content).toContain('bedtimeHour');
    expect(npcData.content).toContain('ScheduleBlockData[] blocks');
  });

  it('InsimulNPCData has schedule field', () => {
    const npcData = files.find(f => f.path.endsWith('InsimulNPCData.cs'))!;
    expect(npcData.content).toContain('NPCScheduleData schedule');
  });
});

// ─────────────────────────────────────────────
// NPCController.cs — schedule-driven behavior
// ─────────────────────────────────────────────

describe('Unity NPC schedule - NPCController.cs', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('includes ScheduleMove state in NPCState enum', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('ScheduleMove');
  });

  it('has hasSchedule field', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('hasSchedule');
  });

  it('has currentBlockIndex field', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('currentBlockIndex');
  });

  it('implements EvaluateSchedule method', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('EvaluateSchedule()');
  });

  it('implements FindBlockForHour method', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('FindBlockForHour');
  });

  it('reads GameClock.Instance.CurrentHour', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('GameClock.Instance');
    expect(ctrl.content).toContain('CurrentHour');
  });

  it('handles midnight-wrapping schedule blocks', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('b.startHour <= b.endHour');
    expect(ctrl.content).toContain('hour >= b.startHour || hour < b.endHour');
  });

  it('resolves building positions for navigation', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('ResolveBuildingPosition');
    expect(ctrl.content).toContain('InsimulGameManager.Instance');
  });

  it('uses NavMeshAgent for schedule movement', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('NavMesh.SamplePosition');
    expect(ctrl.content).toContain('_agent.SetDestination');
  });

  it('loads schedule from InitFromData', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('data.schedule');
    expect(ctrl.content).toContain('_scheduleBlocks');
    expect(ctrl.content).toContain('hasSchedule = true');
  });

  it('pauses schedule during dialogue', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('currentState != NPCState.Talking');
  });

  it('resets block index on EndDialogue to re-evaluate', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('currentBlockIndex = -1');
  });

  it('handles wander activity as patrol', () => {
    const ctrl = files.find(f => f.path.endsWith('NPCController.cs'))!;
    expect(ctrl.content).toContain('"wander"');
    expect(ctrl.content).toContain('NPCState.Patrol');
  });
});

// ─────────────────────────────────────────────
// Data generator — schedule export
// ─────────────────────────────────────────────

describe('Unity NPC schedule - data export', () => {
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
