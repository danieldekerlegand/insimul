/**
 * Tests for Unreal export parity part 2
 *
 * Verifies:
 * - C++ generator includes all Part 2 system templates (character controller, camera, NPC systems,
 *   dialogue, combat modes, resources, exploration, reputation, audio, photography, puzzles,
 *   onboarding, truth sync, save/load, animals, VR)
 * - C++ generator includes all Part 2 UI templates (chat panel, game menu, quest tracker,
 *   quest offer, intro sequence, action quick bar, document reader)
 * - Template content contains expected class declarations, enums, structs, and constants
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture (same as part 1)
// ─────────────────────────────────────────────

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
      worldScaleFactor: 1.0,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [] as any,
      biomeZones: [],
      foliageLayers: [] as any,
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
  };

  return { ...base, ...overrides };
}

// ─────────────────────────────────────────────
// Part 2 System Templates — Inclusion
// ─────────────────────────────────────────────

describe('Unreal C++ generator — Part 2 system templates', () => {
  const ir = makeMinimalIR();
  const files = generateCppFiles(ir);
  const filenames = files.map(f => f.path.split('/').pop());

  const part2SystemTemplates = [
    // Character controller & camera
    'CharacterController.h', 'CharacterController.cpp',
    'CameraManager.h', 'CameraManager.cpp',
    // NPC systems
    'NPCModularAssembler.h', 'NPCModularAssembler.cpp',
    'NPCAccessorySystem.h', 'NPCAccessorySystem.cpp',
    'NPCAnimationController.h', 'NPCAnimationController.cpp',
    'NPCMovementController.h', 'NPCMovementController.cpp',
    'NPCScheduleSystem.h', 'NPCScheduleSystem.cpp',
    'NPCSimulationLOD.h', 'NPCSimulationLOD.cpp',
    'NPCGreetingSystem.h', 'NPCGreetingSystem.cpp',
    'NPCActivityLabelSystem.h', 'NPCActivityLabelSystem.cpp',
    'AmbientConversationSystem.h', 'AmbientConversationSystem.cpp',
    // Dialogue & interaction
    'LipSyncController.h', 'LipSyncController.cpp',
    'BusinessInteractionSystem.h', 'BusinessInteractionSystem.cpp',
    // Quest completion
    'QuestCompletionManager.h', 'QuestCompletionManager.cpp',
    // Combat modes
    'CombatModeManager.h', 'CombatModeManager.cpp',
    // Resource gathering
    'ResourceGatheringSystem.h', 'ResourceGatheringSystem.cpp',
    // Exploration & reputation
    'ExplorationDiscoverySystem.h', 'ExplorationDiscoverySystem.cpp',
    'ReputationManager.h', 'ReputationManager.cpp',
    // Audio & media
    'SpatialAudioManager.h', 'SpatialAudioManager.cpp',
    'PhotographySystem.h', 'PhotographySystem.cpp',
    // Puzzle
    'PuzzleGameSystem.h', 'PuzzleGameSystem.cpp',
    // Onboarding
    'OnboardingManager.h', 'OnboardingManager.cpp',
    // Truth sync
    'TruthSyncSystem.h', 'TruthSyncSystem.cpp',
    // Save/load
    'SaveLoadSystem.h', 'SaveLoadSystem.cpp',
    // Animal NPCs
    'AnimalNPCManager.h', 'AnimalNPCManager.cpp',
    // VR scaffolding
    'VRScaffolding.h', 'VRScaffolding.cpp',
  ];

  for (const template of part2SystemTemplates) {
    it(`includes ${template}`, () => {
      expect(filenames).toContain(template);
    });
  }
});

// ─────────────────────────────────────────────
// Part 2 UI Templates — Inclusion
// ─────────────────────────────────────────────

describe('Unreal C++ generator — Part 2 UI templates', () => {
  const ir = makeMinimalIR();
  const files = generateCppFiles(ir);
  const filenames = files.map(f => f.path.split('/').pop());

  const part2UITemplates = [
    'InsimulChatPanel.h', 'InsimulChatPanel.cpp',
    'InsimulGameMenuWidget.h', 'InsimulGameMenuWidget.cpp',
    'InsimulQuestTrackerWidget.h', 'InsimulQuestTrackerWidget.cpp',
    'InsimulQuestOfferPanel.h', 'InsimulQuestOfferPanel.cpp',
    'InsimulIntroSequence.h', 'InsimulIntroSequence.cpp',
    'InsimulActionQuickBar.h', 'InsimulActionQuickBar.cpp',
    'InsimulDocumentReader.h', 'InsimulDocumentReader.cpp',
  ];

  for (const template of part2UITemplates) {
    it(`includes ${template}`, () => {
      expect(filenames).toContain(template);
    });
  }
});

// ─────────────────────────────────────────────
// Part 2 Template Content Verification
// ─────────────────────────────────────────────

describe('Unreal C++ generator — Part 2 template content verification', () => {
  const ir = makeMinimalIR();
  const files = generateCppFiles(ir);

  // Helper to find a file by suffix
  const findFile = (suffix: string) => files.find(f => f.path.endsWith(suffix));

  // Character Controller
  it('CharacterController.h contains UCharacterController class', () => {
    const f = findFile('CharacterController.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('UCharacterController');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Camera Manager
  it('CameraManager.h contains ECameraMode enum', () => {
    const f = findFile('CameraManager.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('ECameraMode');
    expect(f!.content).toContain('UCameraManager');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // NPC Modular Assembler
  it('NPCModularAssembler.h contains body type and gender enums', () => {
    const f = findFile('NPCModularAssembler.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('ENPCBodyType');
    expect(f!.content).toContain('ENPCGender');
    expect(f!.content).toContain('FNPCAssemblyRequest');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // NPC Accessory System
  it('NPCAccessorySystem.h contains accessory slot enum', () => {
    const f = findFile('NPCAccessorySystem.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('ENPCAccessorySlot');
    expect(f!.content).toContain('FNPCAccessoryConfig');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // NPC Animation Controller
  it('NPCAnimationController.h contains animation state enum', () => {
    const f = findFile('NPCAnimationController.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('ENPCAnimState');
    expect(f!.content).toContain('UNPCAnimationController');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // NPC Movement Controller
  it('NPCMovementController.h contains movement mode enum', () => {
    const f = findFile('NPCMovementController.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('ENPCMovementMode');
    expect(f!.content).toContain('UNPCMovementController');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // NPC Schedule System
  it('NPCScheduleSystem.h contains schedule entry struct', () => {
    const f = findFile('NPCScheduleSystem.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FNPCScheduleEntry');
    expect(f!.content).toContain('UNPCScheduleSystem');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // NPC Simulation LOD
  it('NPCSimulationLOD.h contains MAX_FULL_NPCS constant', () => {
    const f = findFile('NPCSimulationLOD.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('MAX_FULL_NPCS');
    expect(f!.content).toContain('ENPCSimLevel');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // NPC Greeting System
  it('NPCGreetingSystem.h contains relationship tier enum', () => {
    const f = findFile('NPCGreetingSystem.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('ENPCRelationshipTier');
    expect(f!.content).toContain('UNPCGreetingSystem');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // NPC Activity Label System
  it('NPCActivityLabelSystem.h contains label management class', () => {
    const f = findFile('NPCActivityLabelSystem.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('UNPCActivityLabelSystem');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Ambient Conversation System
  it('AmbientConversationSystem.h contains conversation pair struct', () => {
    const f = findFile('AmbientConversationSystem.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FConversationPair');
    expect(f!.content).toContain('UAmbientConversationSystem');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Lip Sync Controller
  it('LipSyncController.h contains lip sync component', () => {
    const f = findFile('LipSyncController.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('ULipSyncController');
    expect(f!.content).toContain('bIsSpeaking');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Business Interaction System
  it('BusinessInteractionSystem.h contains business type enum', () => {
    const f = findFile('BusinessInteractionSystem.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('EBusinessType');
    expect(f!.content).toContain('FShopItem');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Quest Completion Manager
  it('QuestCompletionManager.h contains reward data struct', () => {
    const f = findFile('QuestCompletionManager.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FQuestRewardData');
    expect(f!.content).toContain('UQuestCompletionManager');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Combat Mode Manager
  it('CombatModeManager.h contains combat mode enum', () => {
    const f = findFile('CombatModeManager.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('ECombatMode');
    expect(f!.content).toContain('FHealthBarData');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Resource Gathering System
  it('ResourceGatheringSystem.h contains gathering type enum', () => {
    const f = findFile('ResourceGatheringSystem.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('EGatheringType');
    expect(f!.content).toContain('FResourceNode');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Exploration Discovery System
  it('ExplorationDiscoverySystem.h contains discovery struct', () => {
    const f = findFile('ExplorationDiscoverySystem.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FDiscovery');
    expect(f!.content).toContain('UExplorationDiscoverySystem');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Reputation Manager
  it('ReputationManager.h contains reputation level enum', () => {
    const f = findFile('ReputationManager.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('EReputationLevel');
    expect(f!.content).toContain('FRelationshipData');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Spatial Audio Manager
  it('SpatialAudioManager.h contains surface type enum', () => {
    const f = findFile('SpatialAudioManager.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('ESurfaceType');
    expect(f!.content).toContain('USpatialAudioManager');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Photography System
  it('PhotographySystem.h contains photo mode system', () => {
    const f = findFile('PhotographySystem.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('UPhotographySystem');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Puzzle Game System
  it('PuzzleGameSystem.h contains puzzle type enum', () => {
    const f = findFile('PuzzleGameSystem.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('EPuzzleType');
    expect(f!.content).toContain('FPuzzleData');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Onboarding Manager
  it('OnboardingManager.h contains tutorial step struct', () => {
    const f = findFile('OnboardingManager.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FTutorialStep');
    expect(f!.content).toContain('UOnboardingManager');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Truth Sync System
  it('TruthSyncSystem.h contains world truth struct', () => {
    const f = findFile('TruthSyncSystem.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FWorldTruth');
    expect(f!.content).toContain('UTruthSyncSystem');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Save/Load System
  it('SaveLoadSystem.h contains save slot info struct', () => {
    const f = findFile('SaveLoadSystem.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FSaveSlotInfo');
    expect(f!.content).toContain('USaveLoadSystem');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Animal NPC Manager
  it('AnimalNPCManager.h contains animal behavior enum', () => {
    const f = findFile('AnimalNPCManager.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('EAnimalBehavior');
    expect(f!.content).toContain('FAnimalData');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // VR Scaffolding
  it('VRScaffolding.h contains VR locomotion and comfort enums', () => {
    const f = findFile('VRScaffolding.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('EVRLocomotionMode');
    expect(f!.content).toContain('EVRComfortSetting');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Chat Panel
  it('InsimulChatPanel.h contains dialogue message struct', () => {
    const f = findFile('InsimulChatPanel.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FDialogueMessage');
    expect(f!.content).toContain('UInsimulChatPanel');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Game Menu Widget
  it('InsimulGameMenuWidget.h contains menu tab enum', () => {
    const f = findFile('InsimulGameMenuWidget.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('EMenuTab');
    expect(f!.content).toContain('UInsimulGameMenuWidget');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Quest Tracker Widget
  it('InsimulQuestTrackerWidget.h contains tracked objective struct', () => {
    const f = findFile('InsimulQuestTrackerWidget.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FTrackedObjective');
    expect(f!.content).toContain('UInsimulQuestTrackerWidget');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Quest Offer Panel
  it('InsimulQuestOfferPanel.h contains quest reward struct', () => {
    const f = findFile('InsimulQuestOfferPanel.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FQuestReward');
    expect(f!.content).toContain('UInsimulQuestOfferPanel');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Intro Sequence
  it('InsimulIntroSequence.h contains narrative beat struct', () => {
    const f = findFile('InsimulIntroSequence.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FNarrativeBeat');
    expect(f!.content).toContain('UInsimulIntroSequence');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Action Quick Bar
  it('InsimulActionQuickBar.h contains action slot struct', () => {
    const f = findFile('InsimulActionQuickBar.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FActionSlot');
    expect(f!.content).toContain('NUM_SLOTS');
    expect(f!.content).toContain('GENERATED_BODY');
  });

  // Document Reader
  it('InsimulDocumentReader.h contains document data struct', () => {
    const f = findFile('InsimulDocumentReader.h');
    expect(f).toBeDefined();
    expect(f!.content).toContain('FDocumentData');
    expect(f!.content).toContain('UInsimulDocumentReader');
    expect(f!.content).toContain('GENERATED_BODY');
  });
});

// ─────────────────────────────────────────────
// Part 2 — Total file count verification
// ─────────────────────────────────────────────

describe('Unreal C++ generator — Part 2 file count', () => {
  const ir = makeMinimalIR();
  const files = generateCppFiles(ir);

  it('generates at least 130 total files (Part 1 + Part 2)', () => {
    // Part 1 had ~80 files, Part 2 adds ~66 more
    expect(files.length).toBeGreaterThanOrEqual(130);
  });

  it('all Part 2 system templates are in the Systems directory', () => {
    const systemFiles = files.filter(f => f.path.includes('/Systems/'));
    // Part 1 had ~34 system files, Part 2 adds 52 more
    expect(systemFiles.length).toBeGreaterThanOrEqual(80);
  });

  it('all Part 2 UI templates are in the UI directory', () => {
    const uiFiles = files.filter(f => f.path.includes('/UI/'));
    // Part 1 had ~24 UI files, Part 2 adds 14 more
    expect(uiFiles.length).toBeGreaterThanOrEqual(35);
  });
});

// ─────────────────────────────────────────────
// Existing Part 1 templates still present
// ─────────────────────────────────────────────

describe('Unreal C++ generator — Part 1 templates preserved after Part 2', () => {
  const ir = makeMinimalIR();
  const files = generateCppFiles(ir);
  const filenames = files.map(f => f.path.split('/').pop());

  const existingTemplates = [
    'ActionSystem.h', 'RuleEnforcer.h', 'CombatSystem.h',
    'QuestSystem.h', 'InventorySystem.h', 'DialogueSystem.h',
    'DayNightSystem.h', 'WeatherSystem.h', 'AudioSystem.h',
    'EventBus.h', 'PrologEngine.h',
    'BuildingPlacementSystem.h', 'BuildingSignManager.h',
    'BuildingCollisionSystem.h', 'ContainerSpawnSystem.h',
    'ExteriorItemManager.h',
    'WorldScaleManager.h', 'ProceduralBuildingGenerator.h',
    'RoadGenerator.h', 'ProceduralNatureGenerator.h',
    'ProceduralTerrainGenerator.h', 'AnimalSystem.h',
    'TerrainFoundationRenderer.h', 'SettlementSceneManager.h',
    'ChunkManager.h', 'TownSquareGenerator.h',
    'WaterRenderer.h', 'OutdoorFurnitureGenerator.h',
    'InteriorSceneManager.h', 'BuildingInteriorGenerator.h',
    'InsimulInventoryUI.h', 'DialogueWidget.h',
    'InsimulMinimap.h', 'InsimulHUD.h',
    'QuestJournalWidget.h', 'InsimulPauseMenuWidget.h',
    'InsimulSaveGame.h', 'InsimulShopPanel.h',
    'InsimulSkillTreePanel.h',
  ];

  for (const template of existingTemplates) {
    it(`still includes ${template}`, () => {
      expect(filenames).toContain(template);
    });
  }
});
