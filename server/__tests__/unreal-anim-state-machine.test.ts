/**
 * Tests for Unreal character animation state machine export
 *
 * Verifies that the Unreal export pipeline generates InsimulAnimInstance
 * template files with correct animation state machine structure.
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(): WorldIR {
  return {
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
}

// ─────────────────────────────────────────────
// AnimInstance template generation
// ─────────────────────────────────────────────

describe('Unreal export - InsimulAnimInstance generation', () => {
  it('generates InsimulAnimInstance.h in Characters folder', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulAnimInstance.h'));
    expect(header).toBeDefined();
    expect(header!.path).toContain('/Characters/');
  });

  it('generates InsimulAnimInstance.cpp in Characters folder', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulAnimInstance.cpp'));
    expect(source).toBeDefined();
    expect(source!.path).toContain('/Characters/');
  });
});

// ─────────────────────────────────────────────
// AnimInstance header content
// ─────────────────────────────────────────────

describe('Unreal export - InsimulAnimInstance header', () => {
  const ir = makeMinimalIR();
  const files = generateCppFiles(ir);
  const header = files.find(f => f.path.endsWith('InsimulAnimInstance.h'))!;

  it('extends UAnimInstance', () => {
    expect(header.content).toContain('public UAnimInstance');
  });

  it('declares EInsimulAnimState enum with all activity types', () => {
    expect(header.content).toContain('EInsimulAnimState');
    for (const state of ['Idle', 'Walk', 'Run', 'Talk', 'Work', 'Sit', 'Eat', 'Sleep']) {
      expect(header.content).toContain(state);
    }
  });

  it('exposes Speed property for blend space', () => {
    expect(header.content).toContain('float Speed');
  });

  it('exposes Direction property for blend space', () => {
    expect(header.content).toContain('float Direction');
  });

  it('exposes bIsInAir for jump/fall detection', () => {
    expect(header.content).toContain('bool bIsInAir');
  });

  it('exposes AnimState for state machine transitions', () => {
    expect(header.content).toContain('EInsimulAnimState AnimState');
  });

  it('declares NativeUpdateAnimation override', () => {
    expect(header.content).toContain('NativeUpdateAnimation');
  });

  it('declares PlayActionMontage for one-shot animations', () => {
    expect(header.content).toContain('PlayActionMontage');
    expect(header.content).toContain('UAnimMontage*');
  });

  it('declares walk and run speed thresholds', () => {
    expect(header.content).toContain('WalkThreshold');
    expect(header.content).toContain('RunThreshold');
  });

  it('has BlueprintReadOnly on animation properties', () => {
    expect(header.content).toContain('BlueprintReadOnly');
  });
});

// ─────────────────────────────────────────────
// AnimInstance source content
// ─────────────────────────────────────────────

describe('Unreal export - InsimulAnimInstance source', () => {
  const ir = makeMinimalIR();
  const files = generateCppFiles(ir);
  const source = files.find(f => f.path.endsWith('InsimulAnimInstance.cpp'))!;

  it('includes InsimulAnimInstance.h', () => {
    expect(source.content).toContain('#include "InsimulAnimInstance.h"');
  });

  it('reads velocity from pawn owner', () => {
    expect(source.content).toContain('GetVelocity');
    expect(source.content).toContain('Size2D');
  });

  it('calculates movement direction', () => {
    expect(source.content).toContain('CalculateDirection');
  });

  it('checks falling state for airborne detection', () => {
    expect(source.content).toContain('IsFalling');
  });

  it('maps NPC Talking state to Talk animation', () => {
    expect(source.content).toContain('ENPCState::Talking');
    expect(source.content).toContain('EInsimulAnimState::Talk');
  });

  it('maps NPC Fleeing/Pursuing to Run animation', () => {
    expect(source.content).toContain('ENPCState::Fleeing');
    expect(source.content).toContain('ENPCState::Pursuing');
  });

  it('uses velocity thresholds for idle/walk/run transitions', () => {
    expect(source.content).toContain('RunThreshold');
    expect(source.content).toContain('WalkThreshold');
    expect(source.content).toContain('EInsimulAnimState::Run');
    expect(source.content).toContain('EInsimulAnimState::Walk');
    expect(source.content).toContain('EInsimulAnimState::Idle');
  });

  it('implements Montage_Play for action montages', () => {
    expect(source.content).toContain('Montage_Play');
  });

  it('implements Montage_Stop for stopping montages', () => {
    expect(source.content).toContain('Montage_Stop');
  });

  it('references NPCCharacter for NPC state reading', () => {
    expect(source.content).toContain('#include "NPCCharacter.h"');
    expect(source.content).toContain('ANPCCharacter');
  });
});

// ─────────────────────────────────────────────
// Existing character files still generated
// ─────────────────────────────────────────────

describe('Unreal export - character file completeness', () => {
  it('still generates all character files including AnimInstance', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const charFiles = files.filter(f => f.path.includes('/Characters/'));
    const names = charFiles.map(f => f.path.split('/').pop());
    expect(names).toContain('PlayerCharacter.h');
    expect(names).toContain('PlayerCharacter.cpp');
    expect(names).toContain('NPCCharacter.h');
    expect(names).toContain('NPCCharacter.cpp');
    expect(names).toContain('InsimulAnimInstance.h');
    expect(names).toContain('InsimulAnimInstance.cpp');
  });
});
