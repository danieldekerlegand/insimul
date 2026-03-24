/**
 * Tests for Unity character animation controller export.
 *
 * Verifies that the CharacterAnimationController template is:
 * - Included in the generated C# files
 * - Contains correct animator parameter definitions
 * - Integrated into player and NPC controllers
 * - InsimulAnimationData is included in data classes
 */

import { describe, it, expect } from 'vitest';
import { generateCSharpFiles } from '../services/game-export/unity/unity-csharp-generator';
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
      npcs: [],
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
    assets: [],
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
// CharacterAnimationController template
// ─────────────────────────────────────────────

describe('Unity C# generator - CharacterAnimationController', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('includes CharacterAnimationController.cs in output', () => {
    const animController = files.find(f => f.path.endsWith('CharacterAnimationController.cs'));
    expect(animController).toBeDefined();
    expect(animController!.path).toBe('Assets/Scripts/Characters/CharacterAnimationController.cs');
  });

  it('defines animator parameter hashes', () => {
    const animController = files.find(f => f.path.endsWith('CharacterAnimationController.cs'));
    expect(animController!.content).toContain('SpeedHash');
    expect(animController!.content).toContain('IsGroundedHash');
    expect(animController!.content).toContain('IsTalkingHash');
    expect(animController!.content).toContain('AttackHash');
    expect(animController!.content).toContain('InteractHash');
    expect(animController!.content).toContain('DieHash');
  });

  it('uses Animator.StringToHash for parameters', () => {
    const animController = files.find(f => f.path.endsWith('CharacterAnimationController.cs'));
    expect(animController!.content).toContain('Animator.StringToHash("Speed")');
    expect(animController!.content).toContain('Animator.StringToHash("IsGrounded")');
    expect(animController!.content).toContain('Animator.StringToHash("Attack")');
  });

  it('provides SetSpeed, SetGrounded, SetTalking methods', () => {
    const animController = files.find(f => f.path.endsWith('CharacterAnimationController.cs'));
    expect(animController!.content).toContain('public void SetSpeed(float speed)');
    expect(animController!.content).toContain('public void SetGrounded(bool grounded)');
    expect(animController!.content).toContain('public void SetTalking(bool talking)');
  });

  it('provides trigger methods for one-shot animations', () => {
    const animController = files.find(f => f.path.endsWith('CharacterAnimationController.cs'));
    expect(animController!.content).toContain('public void TriggerAttack()');
    expect(animController!.content).toContain('public void TriggerInteract()');
    expect(animController!.content).toContain('public void TriggerDie()');
  });

  it('provides PlayClip for action-specific animations', () => {
    const animController = files.find(f => f.path.endsWith('CharacterAnimationController.cs'));
    expect(animController!.content).toContain('public void PlayClip(string clipName');
    expect(animController!.content).toContain('CrossFadeInFixedTime');
  });

  it('falls back gracefully when no Animator present', () => {
    const animController = files.find(f => f.path.endsWith('CharacterAnimationController.cs'));
    expect(animController!.content).toContain('_hasAnimator');
    expect(animController!.content).toContain('GetComponentInChildren<Animator>()');
    expect(animController!.content).toContain('if (!_hasAnimator) return;');
  });

  it('lives in Insimul.Characters namespace', () => {
    const animController = files.find(f => f.path.endsWith('CharacterAnimationController.cs'));
    expect(animController!.content).toContain('namespace Insimul.Characters');
  });
});

// ─────────────────────────────────────────────
// InsimulAnimationData included in data classes
// ─────────────────────────────────────────────

describe('Unity C# generator - InsimulAnimationData', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('includes InsimulAnimationData.cs in output', () => {
    const animData = files.find(f => f.path.endsWith('InsimulAnimationData.cs'));
    expect(animData).toBeDefined();
    expect(animData!.path).toBe('Assets/Scripts/Data/InsimulAnimationData.cs');
  });

  it('defines animation data fields matching IR', () => {
    const animData = files.find(f => f.path.endsWith('InsimulAnimationData.cs'));
    expect(animData!.content).toContain('animationType');
    expect(animData!.content).toContain('assetPath');
    expect(animData!.content).toContain('loop');
    expect(animData!.content).toContain('speedRatio');
    expect(animData!.content).toContain('isMixamo');
  });
});

// ─────────────────────────────────────────────
// Player controller integration
// ─────────────────────────────────────────────

describe('Unity player controller - animation integration', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('references CharacterAnimationController', () => {
    const player = files.find(f => f.path.endsWith('InsimulPlayerController.cs'));
    expect(player!.content).toContain('CharacterAnimationController');
    expect(player!.content).toContain('_animController');
  });

  it('updates speed and grounded state each frame', () => {
    const player = files.find(f => f.path.endsWith('InsimulPlayerController.cs'));
    expect(player!.content).toContain('UpdateAnimations()');
    expect(player!.content).toContain('_animController.SetSpeed');
    expect(player!.content).toContain('_animController.SetGrounded');
  });

  it('triggers attack animation on OnAttack', () => {
    const player = files.find(f => f.path.endsWith('InsimulPlayerController.cs'));
    expect(player!.content).toContain('_animController.TriggerAttack()');
  });

  it('triggers interact animation on OnInteract', () => {
    const player = files.find(f => f.path.endsWith('InsimulPlayerController.cs'));
    expect(player!.content).toContain('_animController.TriggerInteract()');
  });
});

// ─────────────────────────────────────────────
// NPC controller integration
// ─────────────────────────────────────────────

describe('Unity NPC controller - animation integration', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('references CharacterAnimationController', () => {
    const npc = files.find(f => f.path.endsWith('NPCController.cs'));
    expect(npc!.content).toContain('CharacterAnimationController');
    expect(npc!.content).toContain('_animController');
  });

  it('updates speed from NavMeshAgent each frame', () => {
    const npc = files.find(f => f.path.endsWith('NPCController.cs'));
    expect(npc!.content).toContain('UpdateAnimations()');
    expect(npc!.content).toContain('_animController.SetSpeed');
  });

  it('sets talking state during dialogue', () => {
    const npc = files.find(f => f.path.endsWith('NPCController.cs'));
    expect(npc!.content).toContain('_animController.SetTalking(true)');
    expect(npc!.content).toContain('_animController.SetTalking(false)');
  });
});
