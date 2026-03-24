/**
 * Tests for Unreal NPC schedule-driven behavior export
 *
 * Verifies that:
 * - NPCData.h template includes schedule structs (FScheduleBlock, FNPCSchedule, EScheduleActivity)
 * - NPCCharacter.h template includes schedule state and methods
 * - NPCCharacter.cpp template includes schedule evaluation logic
 * - GameMode.cpp template parses schedule JSON and calls SetSchedule
 * - DataTable generator exports schedule data for NPCs
 */

import { describe, it, expect } from 'vitest';
import { generateDataTableFiles } from '../services/game-export/unreal/unreal-datatable-generator';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import type { WorldIR, NPCDailyScheduleIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
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
      foliageLayers: [],
    },
    entities: {
      characters: [
        {
          id: 'char-1',
          firstName: 'Ada',
          lastName: 'Smith',
          gender: 'female',
          isAlive: true,
          occupation: 'blacksmith',
          currentLocation: 'settlement-1',
          status: null,
          birthYear: 1830,
          personality: { openness: 0.7, conscientiousness: 0.8, extroversion: 0.5, agreeableness: 0.6, neuroticism: 0.3 },
          skills: [],
          relationships: [],
          familyName: 'Smith',
          parentIds: [],
          childIds: [],
          spouseId: null,
          genealogyData: {},
        },
      ],
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
    ui: { showMinimap: true, showHealthBar: true, showStaminaBar: true, showAmmoCounter: false, showCompass: true, genreLayout: 'rpg', questJournal: { enabled: true, maxTrackedQuests: 3, showQuestMarkers: true, autoTrackNew: true, sortOrder: 'newest' as const, categories: ['conversation', 'vocabulary'] } },
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
// NPCData.h — schedule structs
// ─────────────────────────────────────────────

describe('Unreal NPC schedule - NPCData.h structs', () => {
  it('includes EScheduleActivity enum', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcData = files.find(f => f.path.endsWith('NPCData.h'));
    expect(npcData).toBeDefined();
    expect(npcData!.content).toContain('enum class EScheduleActivity');
    expect(npcData!.content).toContain('Sleep');
    expect(npcData!.content).toContain('Work');
    expect(npcData!.content).toContain('Eat');
    expect(npcData!.content).toContain('Socialize');
    expect(npcData!.content).toContain('Shop');
    expect(npcData!.content).toContain('Wander');
    expect(npcData!.content).toContain('IdleAtHome');
    expect(npcData!.content).toContain('VisitFriend');
  });

  it('includes FScheduleBlock struct', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcData = files.find(f => f.path.endsWith('NPCData.h'))!;
    expect(npcData.content).toContain('struct FScheduleBlock');
    expect(npcData.content).toContain('StartHour');
    expect(npcData.content).toContain('EndHour');
    expect(npcData.content).toContain('Activity');
    expect(npcData.content).toContain('BuildingId');
    expect(npcData.content).toContain('Priority');
  });

  it('includes FNPCSchedule struct', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcData = files.find(f => f.path.endsWith('NPCData.h'))!;
    expect(npcData.content).toContain('struct FNPCSchedule');
    expect(npcData.content).toContain('HomeBuildingId');
    expect(npcData.content).toContain('WorkBuildingId');
    expect(npcData.content).toContain('FriendBuildingIds');
    expect(npcData.content).toContain('WakeHour');
    expect(npcData.content).toContain('BedtimeHour');
    expect(npcData.content).toContain('TArray<FScheduleBlock> Blocks');
  });

  it('includes Schedule field in FInsimulNPCData', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcData = files.find(f => f.path.endsWith('NPCData.h'))!;
    expect(npcData.content).toContain('FNPCSchedule Schedule');
  });
});

// ─────────────────────────────────────────────
// NPCCharacter.h — schedule state and methods
// ─────────────────────────────────────────────

describe('Unreal NPC schedule - NPCCharacter.h', () => {
  it('includes ScheduleMove state in ENPCState enum', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcH = files.find(f => f.path.endsWith('NPCCharacter.h'))!;
    expect(npcH.content).toContain('ScheduleMove');
  });

  it('includes SetSchedule method', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcH = files.find(f => f.path.endsWith('NPCCharacter.h'))!;
    expect(npcH.content).toContain('void SetSchedule(const FNPCSchedule& InSchedule)');
  });

  it('includes GetCurrentScheduleActivity method', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcH = files.find(f => f.path.endsWith('NPCCharacter.h'))!;
    expect(npcH.content).toContain('GetCurrentScheduleActivity');
  });

  it('includes schedule-related properties', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcH = files.find(f => f.path.endsWith('NPCCharacter.h'))!;
    expect(npcH.content).toContain('FNPCSchedule Schedule');
    expect(npcH.content).toContain('bHasSchedule');
    expect(npcH.content).toContain('CurrentBlockIndex');
    expect(npcH.content).toContain('ScheduleTargetPosition');
  });

  it('includes NPCData.h for schedule types', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcH = files.find(f => f.path.endsWith('NPCCharacter.h'))!;
    expect(npcH.content).toContain('#include "../Data/NPCData.h"');
  });
});

// ─────────────────────────────────────────────
// NPCCharacter.cpp — schedule logic
// ─────────────────────────────────────────────

describe('Unreal NPC schedule - NPCCharacter.cpp', () => {
  it('implements EvaluateSchedule method', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcCpp = files.find(f => f.path.endsWith('NPCCharacter.cpp'))!;
    expect(npcCpp.content).toContain('ANPCCharacter::EvaluateSchedule');
  });

  it('implements FindBlockForHour method', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcCpp = files.find(f => f.path.endsWith('NPCCharacter.cpp'))!;
    expect(npcCpp.content).toContain('ANPCCharacter::FindBlockForHour');
  });

  it('implements MoveTowardTarget method', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcCpp = files.find(f => f.path.endsWith('NPCCharacter.cpp'))!;
    expect(npcCpp.content).toContain('ANPCCharacter::MoveTowardTarget');
  });

  it('calls EvaluateSchedule in Tick when bHasSchedule is true', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcCpp = files.find(f => f.path.endsWith('NPCCharacter.cpp'))!;
    expect(npcCpp.content).toContain('if (bHasSchedule)');
    expect(npcCpp.content).toContain('EvaluateSchedule(GameHour)');
  });

  it('handles ScheduleMove state in Tick switch', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcCpp = files.find(f => f.path.endsWith('NPCCharacter.cpp'))!;
    expect(npcCpp.content).toContain('case ENPCState::ScheduleMove:');
    expect(npcCpp.content).toContain('MoveTowardTarget(DeltaTime)');
  });

  it('handles midnight-wrapping schedule blocks', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcCpp = files.find(f => f.path.endsWith('NPCCharacter.cpp'))!;
    // Sleep block wraps midnight (22:00 to 6:00)
    expect(npcCpp.content).toContain('Block.StartHour <= Block.EndHour');
    expect(npcCpp.content).toContain('Hour >= Block.StartHour || Hour < Block.EndHour');
  });

  it('implements SetSchedule method', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcCpp = files.find(f => f.path.endsWith('NPCCharacter.cpp'))!;
    expect(npcCpp.content).toContain('ANPCCharacter::SetSchedule');
    expect(npcCpp.content).toContain('bHasSchedule = Schedule.Blocks.Num() > 0');
  });

  it('maps activities to NPC states via ActivityToState', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const npcCpp = files.find(f => f.path.endsWith('NPCCharacter.cpp'))!;
    expect(npcCpp.content).toContain('ANPCCharacter::ActivityToState');
    expect(npcCpp.content).toContain('EScheduleActivity::Wander');
    expect(npcCpp.content).toContain('ENPCState::Patrol');
  });
});

// ─────────────────────────────────────────────
// GameMode.cpp — schedule parsing during NPC spawn
// ─────────────────────────────────────────────

describe('Unreal NPC schedule - GameMode schedule parsing', () => {
  it('parses schedule JSON from NPC DataTable', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const gmCpp = files.find(f => f.path.endsWith('InsimulGameMode.cpp'))!;
    expect(gmCpp.content).toContain('TryGetObjectField(TEXT("Schedule")');
    expect(gmCpp.content).toContain('NPC->SetSchedule(Sched)');
  });

  it('parses schedule blocks with activity string mapping', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const gmCpp = files.find(f => f.path.endsWith('InsimulGameMode.cpp'))!;
    expect(gmCpp.content).toContain('ActivityStr == TEXT("sleep")');
    expect(gmCpp.content).toContain('ActivityStr == TEXT("work")');
    expect(gmCpp.content).toContain('ActivityStr == TEXT("eat")');
    expect(gmCpp.content).toContain('ActivityStr == TEXT("socialize")');
    expect(gmCpp.content).toContain('ActivityStr == TEXT("shop")');
    expect(gmCpp.content).toContain('ActivityStr == TEXT("wander")');
    expect(gmCpp.content).toContain('ActivityStr == TEXT("idle_at_home")');
    expect(gmCpp.content).toContain('ActivityStr == TEXT("visit_friend")');
  });

  it('parses wake/bedtime hours from schedule JSON', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const gmCpp = files.find(f => f.path.endsWith('InsimulGameMode.cpp'))!;
    expect(gmCpp.content).toContain('GetNumberField(TEXT("wakeHour"))');
    expect(gmCpp.content).toContain('GetNumberField(TEXT("bedtimeHour"))');
  });

  it('includes NPCData.h header for schedule types', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const gmCpp = files.find(f => f.path.endsWith('InsimulGameMode.cpp'))!;
    expect(gmCpp.content).toContain('#include "../Data/NPCData.h"');
  });
});

// ─────────────────────────────────────────────
// DataTable — schedule data export
// ─────────────────────────────────────────────

describe('Unreal NPC schedule - DataTable export', () => {
  it('exports schedule data in DT_NPCs.json', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const npcsFile = files.find(f => f.path.endsWith('DT_NPCs.json'))!;
    const npcs = JSON.parse(npcsFile.content);
    expect(npcs).toHaveLength(1);
    const npc = npcs[0];
    expect(npc.Schedule).toBeDefined();
    expect(npc.Schedule).not.toBeNull();
  });

  it('includes schedule building IDs', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const npcsFile = files.find(f => f.path.endsWith('DT_NPCs.json'))!;
    const npc = JSON.parse(npcsFile.content)[0];
    expect(npc.Schedule.homeBuildingId).toBe('bld-home-1');
    expect(npc.Schedule.workBuildingId).toBe('bld-work-1');
    expect(npc.Schedule.friendBuildingIds).toEqual(['bld-friend-1']);
  });

  it('includes schedule time blocks', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const npcsFile = files.find(f => f.path.endsWith('DT_NPCs.json'))!;
    const npc = JSON.parse(npcsFile.content)[0];
    expect(npc.Schedule.blocks).toHaveLength(7);
    const workBlock = npc.Schedule.blocks.find((b: any) => b.activity === 'work' && b.startHour === 7.5);
    expect(workBlock).toBeDefined();
    expect(workBlock.endHour).toBe(12);
    expect(workBlock.buildingId).toBe('bld-work-1');
  });

  it('includes wake/bedtime hours', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const npcsFile = files.find(f => f.path.endsWith('DT_NPCs.json'))!;
    const npc = JSON.parse(npcsFile.content)[0];
    expect(npc.Schedule.wakeHour).toBe(6.5);
    expect(npc.Schedule.bedtimeHour).toBe(22);
  });

  it('exports null schedule for NPCs without one', () => {
    const ir = makeMinimalIR({
      entities: {
        ...makeMinimalIR().entities,
        npcs: [{
          characterId: 'char-2',
          role: 'guard',
          homePosition: { x: 5, y: 0, z: 5 },
          patrolRadius: 10,
          disposition: 50,
          settlementId: null,
          questIds: [],
          greeting: null,
          schedule: null,
        }],
      },
    });
    const files = generateDataTableFiles(ir);
    const npcsFile = files.find(f => f.path.endsWith('DT_NPCs.json'))!;
    const npc = JSON.parse(npcsFile.content)[0];
    expect(npc.Schedule).toBeNull();
  });
});
