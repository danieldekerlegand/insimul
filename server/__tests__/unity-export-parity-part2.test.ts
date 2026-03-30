/**
 * Tests for Unity export parity part 2
 *
 * Verifies:
 * - C# generator includes all 23 new template files across characters, systems, UI, and VR
 * - New templates contain expected classes and key identifiers
 * - Templates are placed in correct Assets/Scripts/ subdirectories
 * - Existing templates from part 1 are preserved
 * - Total file count reflects additions
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
      worldId: 'test-world-p2',
      worldName: 'Test World Part 2',
      worldDescription: 'A test world for parity part 2',
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
      seed: 'test-seed-p2',
    },
    geography: {
      terrainSize: 1000,
      worldScaleFactor: 1.0,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
      biomeZones: [],
      foliageLayers: [],
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
      containers: [],
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
  } as any;
}

// ─────────────────────────────────────────────
// New Character Templates
// ─────────────────────────────────────────────

describe('Unity export parity part 2 — new character templates', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);
  const filenames = files.map(f => f.path.split('/').pop());

  const newCharacterTemplates = [
    'InsimulCharacterController.cs',
    'CameraManager.cs',
    'NPCModularAssembler.cs',
    'NPCAccessorySystem.cs',
    'NPCAnimationController.cs',
    'NPCMovementController.cs',
    'LipSyncController.cs',
    'NPCActivityLabelSystem.cs',
  ];

  for (const template of newCharacterTemplates) {
    it(`includes ${template}`, () => {
      expect(filenames).toContain(template);
    });
  }

  it('character templates are in Assets/Scripts/Characters/', () => {
    const charFiles = files.filter(f => f.path.startsWith('Assets/Scripts/Characters/'));
    const charNames = charFiles.map(f => f.path.split('/').pop());
    for (const template of newCharacterTemplates) {
      expect(charNames).toContain(template);
    }
  });
});

// ─────────────────────────────────────────────
// New System Templates
// ─────────────────────────────────────────────

describe('Unity export parity part 2 — new system templates', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);
  const filenames = files.map(f => f.path.split('/').pop());

  const newSystemTemplates = [
    'NPCScheduleSystem.cs',
    'NPCSimulationLOD.cs',
    'AmbientConversationSystem.cs',
    'NPCBusinessInteractionSystem.cs',
    'QuestCompletionManager.cs',
    'ExplorationDiscoverySystem.cs',
    'AnimalNPCSystem.cs',
    'PhotographySystem.cs',
    'SaveSystem.cs',
    'VRManager.cs',
    'VRHandTrackingManager.cs',
    'VRInteractionManager.cs',
    'VRHUDManager.cs',
    'VRChatPanel.cs',
    'VRCombatAdapter.cs',
  ];

  for (const template of newSystemTemplates) {
    it(`includes ${template}`, () => {
      expect(filenames).toContain(template);
    });
  }

  it('system templates are in Assets/Scripts/Systems/', () => {
    const sysFiles = files.filter(f => f.path.startsWith('Assets/Scripts/Systems/'));
    const sysNames = sysFiles.map(f => f.path.split('/').pop());
    for (const template of newSystemTemplates) {
      expect(sysNames).toContain(template);
    }
  });
});

// ─────────────────────────────────────────────
// New UI Templates
// ─────────────────────────────────────────────

describe('Unity export parity part 2 — new UI templates', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);
  const filenames = files.map(f => f.path.split('/').pop());

  const newUITemplates = [
    'GameIntroSequence.cs',
    'ActionQuickBar.cs',
    'DocumentReadingPanel.cs',
  ];

  for (const template of newUITemplates) {
    it(`includes ${template}`, () => {
      expect(filenames).toContain(template);
    });
  }

  it('UI templates are in Assets/Scripts/UI/', () => {
    const uiFiles = files.filter(f => f.path.startsWith('Assets/Scripts/UI/'));
    const uiNames = uiFiles.map(f => f.path.split('/').pop());
    for (const template of newUITemplates) {
      expect(uiNames).toContain(template);
    }
  });
});

// ─────────────────────────────────────────────
// Template Content Verification — Characters
// ─────────────────────────────────────────────

describe('Unity export parity part 2 — character template content', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('InsimulCharacterController.cs has sprint and ground detection', () => {
    const f = files.find(f => f.path.endsWith('InsimulCharacterController.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class InsimulCharacterController');
    expect(f!.content).toContain('sprintSpeed');
    expect(f!.content).toContain('IsSprinting');
    expect(f!.content).toContain('CheckGround');
    expect(f!.content).toContain('CharacterController');
  });

  it('CameraManager.cs has orbit and dialogue modes', () => {
    const f = files.find(f => f.path.endsWith('CameraManager.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class CameraManager');
    expect(f!.content).toContain('enum CameraMode');
    expect(f!.content).toContain('Exterior');
    expect(f!.content).toContain('Dialogue');
    expect(f!.content).toContain('UpdateOrbitCamera');
    expect(f!.content).toContain('collisionRadius');
  });

  it('NPCModularAssembler.cs has modular part assembly', () => {
    const f = files.find(f => f.path.endsWith('NPCModularAssembler.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class NPCModularAssembler');
    expect(f!.content).toContain('AttachBody');
    expect(f!.content).toContain('AttachHair');
    expect(f!.content).toContain('AttachOutfit');
    expect(f!.content).toContain('BODY_TYPES');
    expect(f!.content).toContain('SkinnedMeshRenderer');
  });

  it('NPCAccessorySystem.cs has occupation-based accessories', () => {
    const f = files.find(f => f.path.endsWith('NPCAccessorySystem.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class NPCAccessorySystem');
    expect(f!.content).toContain('OCCUPATION_ACCESSORIES');
    expect(f!.content).toContain('BONE_MAPPINGS');
    expect(f!.content).toContain('GenerateAccessories');
  });

  it('NPCAnimationController.cs has state machine with blend trees', () => {
    const f = files.find(f => f.path.endsWith('NPCAnimationController.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class NPCAnimationController');
    expect(f!.content).toContain('Animator');
    expect(f!.content).toContain('PlayState');
    expect(f!.content).toContain('CrossFade');
    expect(f!.content).toContain('GetOccupationClipName');
  });

  it('NPCMovementController.cs has NavMesh pathfinding', () => {
    const f = files.find(f => f.path.endsWith('NPCMovementController.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class NPCMovementController');
    expect(f!.content).toContain('NavMeshAgent');
    expect(f!.content).toContain('MoveTo');
    expect(f!.content).toContain('wanderRadius');
    expect(f!.content).toContain('SetPatrolRoute');
    expect(f!.content).toContain('ReturnHome');
  });

  it('LipSyncController.cs has BlendShape and viseme support', () => {
    const f = files.find(f => f.path.endsWith('LipSyncController.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class LipSyncController');
    expect(f!.content).toContain('SetBlendShapeWeight');
    expect(f!.content).toContain('GetVisemeWeight');
    expect(f!.content).toContain('StartTextSync');
    expect(f!.content).toContain('jawBone');
  });

  it('NPCActivityLabelSystem.cs has world-space labels with billboard', () => {
    const f = files.find(f => f.path.endsWith('NPCActivityLabelSystem.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class NPCActivityLabelSystem');
    expect(f!.content).toContain('LookAt');
    expect(f!.content).toContain('SetActivity');
    expect(f!.content).toContain('SetTalking');
    expect(f!.content).toContain('fadeStartDistance');
    expect(f!.content).toContain('TextMeshProUGUI');
  });
});

// ─────────────────────────────────────────────
// Template Content Verification — Systems
// ─────────────────────────────────────────────

describe('Unity export parity part 2 — system template content', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('NPCScheduleSystem.cs has daily routine scheduling', () => {
    const f = files.find(f => f.path.endsWith('NPCScheduleSystem.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class NPCScheduleSystem');
    expect(f!.content).toContain('RegisterNPC');
    expect(f!.content).toContain('EvaluateAllSchedules');
    expect(f!.content).toContain('FindActiveBlock');
    expect(f!.content).toContain('GameClock');
  });

  it('NPCSimulationLOD.cs has MAX_NPCS and tier system', () => {
    const f = files.find(f => f.path.endsWith('NPCSimulationLOD.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class NPCSimulationLOD');
    expect(f!.content).toContain('MAX_NPCS');
    expect(f!.content).toContain('enum SimulationTier');
    expect(f!.content).toContain('Billboard');
    expect(f!.content).toContain('LODGroup');
  });

  it('AmbientConversationSystem.cs has NPC-NPC conversations', () => {
    const f = files.find(f => f.path.endsWith('AmbientConversationSystem.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class AmbientConversationSystem');
    expect(f!.content).toContain('TryStartConversation');
    expect(f!.content).toContain('conversationRange');
    expect(f!.content).toContain('ReputationManager');
  });

  it('NPCBusinessInteractionSystem.cs has shop and trade', () => {
    const f = files.find(f => f.path.endsWith('NPCBusinessInteractionSystem.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class NPCBusinessInteractionSystem');
    expect(f!.content).toContain('IInteractable');
    expect(f!.content).toContain('BuyItem');
    expect(f!.content).toContain('SellItem');
    expect(f!.content).toContain('ShopItem');
    expect(f!.content).toContain('OpenNoticeBoard');
  });

  it('QuestCompletionManager.cs has objective tracking and rewards', () => {
    const f = files.find(f => f.path.endsWith('QuestCompletionManager.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class QuestCompletionManager');
    expect(f!.content).toContain('CompleteObjective');
    expect(f!.content).toContain('OnQuestCompleted');
    expect(f!.content).toContain('AwardRewards');
    expect(f!.content).toContain('CheckAutoCompletion');
  });

  it('ExplorationDiscoverySystem.cs has area discovery and codex', () => {
    const f = files.find(f => f.path.endsWith('ExplorationDiscoverySystem.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class ExplorationDiscoverySystem');
    expect(f!.content).toContain('DiscoverArea');
    expect(f!.content).toContain('AddCodexEntry');
    expect(f!.content).toContain('ShowContextualHint');
    expect(f!.content).toContain('discoveryXPReward');
  });

  it('AnimalNPCSystem.cs has animal spawning and mount system', () => {
    const f = files.find(f => f.path.endsWith('AnimalNPCSystem.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class AnimalNPCSystem');
    expect(f!.content).toContain('enum AnimalBehavior');
    expect(f!.content).toContain('SpawnAnimal');
    expect(f!.content).toContain('MountAnimal');
    expect(f!.content).toContain('DismountAnimal');
    expect(f!.content).toContain('NavMeshAgent');
  });

  it('PhotographySystem.cs has photo mode and capture', () => {
    const f = files.find(f => f.path.endsWith('PhotographySystem.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class PhotographySystem');
    expect(f!.content).toContain('EnterPhotoMode');
    expect(f!.content).toContain('CapturePhoto');
    expect(f!.content).toContain('ScreenCapture');
    expect(f!.content).toContain('persistentDataPath');
  });

  it('SaveSystem.cs has auto-save and slot management', () => {
    const f = files.find(f => f.path.endsWith('SaveSystem.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class SaveSystem');
    expect(f!.content).toContain('autoSaveInterval');
    expect(f!.content).toContain('Save');
    expect(f!.content).toContain('Load');
    expect(f!.content).toContain('SaveState');
    expect(f!.content).toContain('maxSlots');
  });
});

// ─────────────────────────────────────────────
// Template Content Verification — VR
// ─────────────────────────────────────────────

describe('Unity export parity part 2 — VR template content', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('VRManager.cs has XR rig setup', () => {
    const f = files.find(f => f.path.endsWith('VRManager.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class VRManager');
    expect(f!.content).toContain('InitializeVR');
    expect(f!.content).toContain('XR Rig');
    expect(f!.content).toContain('snapTurnEnabled');
    expect(f!.content).toContain('seatedMode');
  });

  it('VRHandTrackingManager.cs has hand tracking', () => {
    const f = files.find(f => f.path.endsWith('VRHandTrackingManager.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class VRHandTrackingManager');
    expect(f!.content).toContain('grabRadius');
    expect(f!.content).toContain('Initialize');
  });

  it('VRInteractionManager.cs has interaction and teleport', () => {
    const f = files.find(f => f.path.endsWith('VRInteractionManager.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class VRInteractionManager');
    expect(f!.content).toContain('TriggerHaptic');
    expect(f!.content).toContain('teleportLayers');
  });

  it('VRHUDManager.cs has world-space HUD', () => {
    const f = files.find(f => f.path.endsWith('VRHUDManager.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class VRHUDManager');
    expect(f!.content).toContain('hudDistance');
    expect(f!.content).toContain('WorldSpace');
  });

  it('VRChatPanel.cs has VR dialogue panel', () => {
    const f = files.find(f => f.path.endsWith('VRChatPanel.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class VRChatPanel');
    expect(f!.content).toContain('SetDialogueText');
    expect(f!.content).toContain('TextMeshProUGUI');
  });

  it('VRCombatAdapter.cs has swing detection', () => {
    const f = files.find(f => f.path.endsWith('VRCombatAdapter.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class VRCombatAdapter');
    expect(f!.content).toContain('OnSwingDetected');
    expect(f!.content).toContain('swingSpeedThreshold');
    expect(f!.content).toContain('OnRangedAim');
  });
});

// ─────────────────────────────────────────────
// Template Content Verification — UI
// ─────────────────────────────────────────────

describe('Unity export parity part 2 — UI template content', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('GameIntroSequence.cs has intro and cutscene support', () => {
    const f = files.find(f => f.path.endsWith('GameIntroSequence.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class GameIntroSequence');
    expect(f!.content).toContain('PlayIntro');
    expect(f!.content).toContain('PlayCutscene');
    expect(f!.content).toContain('TypeText');
    expect(f!.content).toContain('FadeIn');
  });

  it('ActionQuickBar.cs has SLOT_COUNT and radial menu', () => {
    const f = files.find(f => f.path.endsWith('ActionQuickBar.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class ActionQuickBar');
    expect(f!.content).toContain('SLOT_COUNT');
    expect(f!.content).toContain('radialMenuPanel');
    expect(f!.content).toContain('AssignSlot');
    expect(f!.content).toContain('ActivateSlot');
  });

  it('DocumentReadingPanel.cs has pagination and composition', () => {
    const f = files.find(f => f.path.endsWith('DocumentReadingPanel.cs'));
    expect(f).toBeDefined();
    expect(f!.content).toContain('class DocumentReadingPanel');
    expect(f!.content).toContain('OpenDocument');
    expect(f!.content).toContain('NextPage');
    expect(f!.content).toContain('PrevPage');
    expect(f!.content).toContain('charsPerPage');
    expect(f!.content).toContain('OpenComposition');
  });
});

// ─────────────────────────────────────────────
// Existing templates preserved
// ─────────────────────────────────────────────

describe('Unity export parity part 2 — existing templates preserved', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);
  const filenames = files.map(f => f.path.split('/').pop());

  const existingTemplates = [
    'InsimulPlayerController.cs',
    'NPCController.cs',
    'NPCManager.cs',
    'CharacterAnimationController.cs',
    'NPCAppearanceGenerator.cs',
    'NPCGreetingSystem.cs',
    'NPCTalkingIndicator.cs',
    'InsimulGameManager.cs',
    'InsimulDataLoader.cs',
    'GameClock.cs',
    'CombatSystem.cs',
    'QuestSystem.cs',
    'InventorySystem.cs',
    'EventBus.cs',
    'AudioManager.cs',
    'HUDManager.cs',
    'ChatPanel.cs',
    'InventoryUI.cs',
    'QuestJournalUI.cs',
    'SkillTreeUI.cs',
    'ReputationManager.cs',
    'OnboardingManager.cs',
    'PuzzleSystem.cs',
    'RuleEnforcer.cs',
    'SettlementSceneManager.cs',
    'ChunkManager.cs',
  ];

  for (const template of existingTemplates) {
    it(`still includes ${template}`, () => {
      expect(filenames).toContain(template);
    });
  }
});

// ─────────────────────────────────────────────
// Total file count
// ─────────────────────────────────────────────

describe('Unity export parity part 2 — file count', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('generates expected number of C# files (including 23 new templates)', () => {
    // Part 1 had ~80+, adding 23 new = 100+
    expect(files.length).toBeGreaterThanOrEqual(100);
  });

  it('all C# files have .cs extension', () => {
    for (const f of files) {
      expect(f.path).toMatch(/\.cs$/);
    }
  });

  it('all C# files are in Assets/Scripts/', () => {
    for (const f of files) {
      expect(f.path).toMatch(/^Assets\/Scripts\//);
    }
  });

  it('no duplicate file paths', () => {
    const paths = files.map(f => f.path);
    const unique = new Set(paths);
    expect(unique.size).toBe(paths.length);
  });
});

// ─────────────────────────────────────────────
// Namespace verification
// ─────────────────────────────────────────────

describe('Unity export parity part 2 — namespace consistency', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  const charFiles = [
    'InsimulCharacterController.cs', 'CameraManager.cs', 'NPCModularAssembler.cs',
    'NPCAccessorySystem.cs', 'NPCAnimationController.cs', 'NPCMovementController.cs',
    'LipSyncController.cs', 'NPCActivityLabelSystem.cs',
  ];

  for (const name of charFiles) {
    it(`${name} uses Insimul.Characters namespace`, () => {
      const f = files.find(f => f.path.endsWith(name));
      expect(f).toBeDefined();
      expect(f!.content).toContain('namespace Insimul.Characters');
    });
  }

  const sysFiles = [
    'NPCScheduleSystem.cs', 'NPCSimulationLOD.cs', 'AmbientConversationSystem.cs',
    'NPCBusinessInteractionSystem.cs', 'QuestCompletionManager.cs', 'ExplorationDiscoverySystem.cs',
    'AnimalNPCSystem.cs', 'PhotographySystem.cs', 'SaveSystem.cs',
    'VRManager.cs', 'VRHandTrackingManager.cs', 'VRInteractionManager.cs',
    'VRHUDManager.cs', 'VRChatPanel.cs', 'VRCombatAdapter.cs',
  ];

  for (const name of sysFiles) {
    it(`${name} uses Insimul.Systems namespace`, () => {
      const f = files.find(f => f.path.endsWith(name));
      expect(f).toBeDefined();
      expect(f!.content).toContain('namespace Insimul.Systems');
    });
  }

  const uiFiles = ['GameIntroSequence.cs', 'ActionQuickBar.cs', 'DocumentReadingPanel.cs'];

  for (const name of uiFiles) {
    it(`${name} uses Insimul.UI namespace`, () => {
      const f = files.find(f => f.path.endsWith(name));
      expect(f).toBeDefined();
      expect(f!.content).toContain('namespace Insimul.UI');
    });
  }
});
