/**
 * Unity C# Generator
 *
 * Loads C# template files from `templates/` and performs {{TOKEN}} substitution
 * for world-specific values. Static scripts are copied as-is; dynamic scripts
 * receive a substitution map built from the WorldIR. Conditional scripts
 * (crafting, resources, survival) are included only when the genre enables them.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './unity-project-generator';
import { loadStaticTemplate, loadTemplate, type TokenMap } from './unity-template-loader';

// ─────────────────────────────────────────────
// Data Classes (fully static)
// ─────────────────────────────────────────────

function genDataClasses(): GeneratedFile[] {
  const base = 'Assets/Scripts/Data';
  return [
    { path: `${base}/InsimulCharacterData.cs`, content: loadStaticTemplate('scripts/data/InsimulCharacterData.cs') },
    { path: `${base}/InsimulNPCData.cs`,       content: loadStaticTemplate('scripts/data/InsimulNPCData.cs') },
    { path: `${base}/InsimulActionData.cs`,    content: loadStaticTemplate('scripts/data/InsimulActionData.cs') },
    { path: `${base}/InsimulRuleData.cs`,      content: loadStaticTemplate('scripts/data/InsimulRuleData.cs') },
    { path: `${base}/InsimulQuestData.cs`,     content: loadStaticTemplate('scripts/data/InsimulQuestData.cs') },
    { path: `${base}/InsimulSettlementData.cs`,content: loadStaticTemplate('scripts/data/InsimulSettlementData.cs') },
    { path: `${base}/InsimulBuildingData.cs`,  content: loadStaticTemplate('scripts/data/InsimulBuildingData.cs') },
    { path: `${base}/InsimulWorldIR.cs`,       content: loadStaticTemplate('scripts/data/InsimulWorldIR.cs') },
    { path: `${base}/InsimulAssetManifest.cs`, content: loadStaticTemplate('scripts/data/InsimulAssetManifest.cs') },
    { path: `${base}/InsimulDialogueContext.cs`, content: loadStaticTemplate('scripts/data/InsimulDialogueContext.cs') },
    { path: `${base}/InsimulAIConfig.cs`, content: loadStaticTemplate('scripts/data/InsimulAIConfig.cs') },
    { path: `${base}/InsimulWaterFeatureData.cs`, content: loadStaticTemplate('scripts/data/InsimulWaterFeatureData.cs') },
    { path: `${base}/InsimulLotData.cs`, content: loadStaticTemplate('scripts/data/InsimulLotData.cs') },
    { path: `${base}/InsimulAnimationData.cs`, content: loadStaticTemplate('scripts/data/InsimulAnimationData.cs') },
    { path: `${base}/InsimulBiomeZoneData.cs`, content: loadStaticTemplate('scripts/data/InsimulBiomeZoneData.cs') },
  ];
}

// ─────────────────────────────────────────────
// Core Classes (fully static)
// ─────────────────────────────────────────────

function genCoreClasses(): GeneratedFile[] {
  const base = 'Assets/Scripts/Core';
  return [
    { path: `${base}/InsimulGameManager.cs`, content: loadStaticTemplate('scripts/core/InsimulGameManager.cs') },
    { path: `${base}/InsimulDataLoader.cs`,  content: loadStaticTemplate('scripts/core/InsimulDataLoader.cs') },
    { path: `${base}/GameClock.cs`,          content: loadStaticTemplate('scripts/core/GameClock.cs') },
  ];
}

// ─────────────────────────────────────────────
// Character Classes
// ─────────────────────────────────────────────

function genCharacterClasses(ir: WorldIR): GeneratedFile[] {
  const base = 'Assets/Scripts/Characters';
  const p = ir.player;
  const playerTokens: TokenMap = {
    PLAYER_SPEED:          p.speed,
    PLAYER_JUMP_HEIGHT:    p.jumpHeight,
    PLAYER_GRAVITY:        p.gravity,
    PLAYER_INITIAL_HEALTH: p.initialHealth,
    PLAYER_INITIAL_ENERGY: p.initialEnergy,
    PLAYER_INITIAL_GOLD:   p.initialGold,
  };

  return [
    { path: `${base}/InsimulPlayerController.cs`, content: loadTemplate('scripts/characters/InsimulPlayerController.cs', playerTokens) },
    { path: `${base}/NPCController.cs`,           content: loadStaticTemplate('scripts/characters/NPCController.cs') },
    { path: `${base}/NPCManager.cs`,              content: loadStaticTemplate('scripts/characters/NPCManager.cs') },
    { path: `${base}/CharacterAnimationController.cs`, content: loadStaticTemplate('scripts/characters/CharacterAnimationController.cs') },
    { path: `${base}/NPCAppearanceGenerator.cs`,      content: loadStaticTemplate('scripts/characters/NPCAppearanceGenerator.cs') },
    { path: `${base}/NPCGreetingSystem.cs`,          content: loadStaticTemplate('scripts/characters/NPCGreetingSystem.cs') },
    { path: `${base}/NPCTalkingIndicator.cs`,       content: loadStaticTemplate('scripts/characters/NPCTalkingIndicator.cs') },
    // ── Export parity part 2: enhanced character systems ──
    { path: `${base}/InsimulCharacterController.cs`, content: loadStaticTemplate('scripts/characters/InsimulCharacterController.cs') },
    { path: `${base}/CameraManager.cs`,              content: loadStaticTemplate('scripts/characters/CameraManager.cs') },
    { path: `${base}/NPCModularAssembler.cs`,        content: loadStaticTemplate('scripts/characters/NPCModularAssembler.cs') },
    { path: `${base}/NPCAccessorySystem.cs`,         content: loadStaticTemplate('scripts/characters/NPCAccessorySystem.cs') },
    { path: `${base}/NPCAnimationController.cs`,     content: loadStaticTemplate('scripts/characters/NPCAnimationController.cs') },
    { path: `${base}/NPCMovementController.cs`,      content: loadStaticTemplate('scripts/characters/NPCMovementController.cs') },
    { path: `${base}/LipSyncController.cs`,          content: loadStaticTemplate('scripts/characters/LipSyncController.cs') },
    { path: `${base}/NPCActivityLabelSystem.cs`,     content: loadStaticTemplate('scripts/characters/NPCActivityLabelSystem.cs') },
  ];
}

// ─────────────────────────────────────────────
// Game Systems
// ─────────────────────────────────────────────

function genSystemClasses(ir: WorldIR): GeneratedFile[] {
  const base = 'Assets/Scripts/Systems';
  const cs = ir.combat.settings;
  const combatTokens: TokenMap = {
    COMBAT_STYLE:               ir.combat.style,
    COMBAT_BASE_DAMAGE:         cs.baseDamage,
    COMBAT_CRITICAL_CHANCE:     cs.criticalChance,
    COMBAT_CRITICAL_MULTIPLIER: cs.criticalMultiplier,
    COMBAT_BLOCK_REDUCTION:     cs.blockReduction,
    COMBAT_DODGE_CHANCE:        cs.dodgeChance,
    COMBAT_ATTACK_COOLDOWN:     cs.attackCooldown / 1000,
  };

  const files: GeneratedFile[] = [
    { path: `${base}/IInteractable.cs`,   content: loadStaticTemplate('scripts/systems/IInteractable.cs') },
    { path: `${base}/ActionSystem.cs`,    content: loadStaticTemplate('scripts/systems/ActionSystem.cs') },
    { path: `${base}/RuleEnforcer.cs`,    content: loadStaticTemplate('scripts/systems/RuleEnforcer.cs') },
    { path: `${base}/CombatSystem.cs`,    content: loadTemplate('scripts/systems/CombatSystem.cs', combatTokens) },
    { path: `${base}/QuestSystem.cs`,     content: loadStaticTemplate('scripts/systems/QuestSystem.cs') },
    { path: `${base}/InventorySystem.cs`, content: loadStaticTemplate('scripts/systems/InventorySystem.cs') },
    { path: `${base}/DialogueSystem.cs`,  content: loadStaticTemplate('scripts/systems/DialogueSystem.cs') },
    { path: `${base}/EventBus.cs`,       content: loadStaticTemplate('scripts/systems/EventBus.cs') },
    { path: `${base}/PrologEngine.cs`,   content: loadStaticTemplate('scripts/systems/PrologEngine.cs') },
    { path: `${base}/AudioManager.cs`,    content: loadStaticTemplate('scripts/systems/AudioManager.cs') },
    { path: `${base}/AmbientSoundSystem.cs`, content: loadStaticTemplate('scripts/systems/AmbientSoundSystem.cs') },
    { path: `${base}/InteractionPromptSystem.cs`, content: loadStaticTemplate('scripts/systems/InteractionPromptSystem.cs') },
    { path: `${base}/HoverTranslationSystem.cs`, content: loadStaticTemplate('scripts/systems/HoverTranslationSystem.cs') },
    { path: `${base}/ReputationManager.cs`,      content: loadStaticTemplate('scripts/systems/ReputationManager.cs') },
    { path: `${base}/ContainerSystem.cs`,       content: loadStaticTemplate('scripts/systems/ContainerSystem.cs') },
    { path: `${base}/PuzzleSystem.cs`,          content: loadStaticTemplate('scripts/systems/PuzzleSystem.cs') },
    { path: `${base}/OnboardingManager.cs`,     content: loadStaticTemplate('scripts/systems/OnboardingManager.cs') },
    // ── Export parity part 2: gameplay systems ──
    { path: `${base}/NPCScheduleSystem.cs`,           content: loadStaticTemplate('scripts/systems/NPCScheduleSystem.cs') },
    { path: `${base}/NPCSimulationLOD.cs`,            content: loadStaticTemplate('scripts/systems/NPCSimulationLOD.cs') },
    { path: `${base}/AmbientConversationSystem.cs`,   content: loadStaticTemplate('scripts/systems/AmbientConversationSystem.cs') },
    { path: `${base}/NPCBusinessInteractionSystem.cs`, content: loadStaticTemplate('scripts/systems/NPCBusinessInteractionSystem.cs') },
    { path: `${base}/QuestCompletionManager.cs`,      content: loadStaticTemplate('scripts/systems/QuestCompletionManager.cs') },
    { path: `${base}/ExplorationDiscoverySystem.cs`,  content: loadStaticTemplate('scripts/systems/ExplorationDiscoverySystem.cs') },
    { path: `${base}/AnimalNPCSystem.cs`,             content: loadStaticTemplate('scripts/systems/AnimalNPCSystem.cs') },
    { path: `${base}/PhotographySystem.cs`,           content: loadStaticTemplate('scripts/systems/PhotographySystem.cs') },
    { path: `${base}/SaveSystem.cs`,                  content: loadStaticTemplate('scripts/systems/SaveSystem.cs') },
    // ── Export parity part 2: VR scaffolding ──
    { path: `${base}/VRManager.cs`,                   content: loadStaticTemplate('scripts/systems/VRManager.cs') },
    { path: `${base}/VRHandTrackingManager.cs`,       content: loadStaticTemplate('scripts/systems/VRHandTrackingManager.cs') },
    { path: `${base}/VRInteractionManager.cs`,        content: loadStaticTemplate('scripts/systems/VRInteractionManager.cs') },
    { path: `${base}/VRHUDManager.cs`,                content: loadStaticTemplate('scripts/systems/VRHUDManager.cs') },
    { path: `${base}/VRChatPanel.cs`,                 content: loadStaticTemplate('scripts/systems/VRChatPanel.cs') },
    { path: `${base}/VRCombatAdapter.cs`,             content: loadStaticTemplate('scripts/systems/VRCombatAdapter.cs') },
  ];

  const genre = ir.meta.genreConfig;
  if (genre.features.crafting) {
    files.push({ path: `${base}/CraftingSystem.cs`, content: loadStaticTemplate('scripts/systems/CraftingSystem.cs') });
  }
  if (genre.features.resources) {
    files.push({ path: `${base}/ResourceSystem.cs`, content: loadStaticTemplate('scripts/systems/ResourceSystem.cs') });
  }
  // Genre-conditional combat variants
  const combatStyle = ir.combat?.style || 'base';
  if (combatStyle === 'fighting' || genre.features.combat) {
    files.push({ path: `${base}/FightingCombatSystem.cs`, content: loadStaticTemplate('scripts/systems/FightingCombatSystem.cs') });
  }
  if (combatStyle === 'turnbased' || genre.id === 'rpg') {
    files.push({ path: `${base}/TurnBasedCombatSystem.cs`, content: loadStaticTemplate('scripts/systems/TurnBasedCombatSystem.cs') });
  }
  if (combatStyle === 'ranged' || genre.id === 'shooter') {
    files.push({ path: `${base}/RangedCombatSystem.cs`, content: loadStaticTemplate('scripts/systems/RangedCombatSystem.cs') });
  }
  // Always include SurvivalSystem — it gracefully no-ops when survival data is absent,
  // and other scripts (HUDManager) reference it unconditionally.
  files.push({ path: `${base}/SurvivalSystem.cs`, content: loadStaticTemplate('scripts/systems/SurvivalSystem.cs') });

  return files;
}

// ─────────────────────────────────────────────
// World Generators
// ─────────────────────────────────────────────

function genWorldGenerators(ir: WorldIR): GeneratedFile[] {
  const base = 'Assets/Scripts/World';
  const theme = ir.theme.visualTheme;

  const worldScaleTokens: TokenMap = {
    TERRAIN_SIZE:      ir.geography.terrainSize,
    WORLD_SCALE_FACTOR: ir.geography.worldScaleFactor ?? 1.0,
    GROUND_COLOR_R: theme.groundColor.r,
    GROUND_COLOR_G: theme.groundColor.g,
    GROUND_COLOR_B: theme.groundColor.b,
    SKY_COLOR_R:    theme.skyColor.r,
    SKY_COLOR_G:    theme.skyColor.g,
    SKY_COLOR_B:    theme.skyColor.b,
    ROAD_COLOR_R:   theme.roadColor.r,
    ROAD_COLOR_G:   theme.roadColor.g,
    ROAD_COLOR_B:   theme.roadColor.b,
  };

  const buildingTokens: TokenMap = {
    BASE_COLOR_R: theme.settlementBaseColor.r,
    BASE_COLOR_G: theme.settlementBaseColor.g,
    BASE_COLOR_B: theme.settlementBaseColor.b,
    ROOF_COLOR_R: theme.settlementRoofColor.r,
    ROOF_COLOR_G: theme.settlementRoofColor.g,
    ROOF_COLOR_B: theme.settlementRoofColor.b,
  };

  const roadTokens: TokenMap = {
    ROAD_COLOR_R: theme.roadColor.r,
    ROAD_COLOR_G: theme.roadColor.g,
    ROAD_COLOR_B: theme.roadColor.b,
    ROAD_WIDTH:   theme.roadRadius * 2,
  };

  return [
    { path: `${base}/WorldScaleManager.cs`,          content: loadTemplate('scripts/world/WorldScaleManager.cs', worldScaleTokens) },
    { path: `${base}/TerrainMeshGenerator.cs`,       content: loadStaticTemplate('scripts/world/TerrainMeshGenerator.cs') },
    { path: `${base}/ProceduralBuildingGenerator.cs`, content: loadTemplate('scripts/world/ProceduralBuildingGenerator.cs', buildingTokens) },
    { path: `${base}/RoadGenerator.cs`,              content: loadTemplate('scripts/world/RoadGenerator.cs', roadTokens) },
    { path: `${base}/ProceduralNatureGenerator.cs`,  content: loadStaticTemplate('scripts/world/ProceduralNatureGenerator.cs') },
    { path: `${base}/ProceduralDungeonGenerator.cs`, content: loadStaticTemplate('scripts/world/ProceduralDungeonGenerator.cs') },
    { path: `${base}/WaterFeatureGenerator.cs`,      content: loadStaticTemplate('scripts/world/WaterFeatureGenerator.cs') },
    { path: `${base}/DayNightCycleManager.cs`,      content: loadStaticTemplate('scripts/world/DayNightCycleManager.cs') },
    { path: `${base}/WeatherSystem.cs`,             content: loadStaticTemplate('scripts/world/WeatherSystem.cs') },
    { path: `${base}/TerrainFoundationRenderer.cs`, content: loadStaticTemplate('scripts/world/TerrainFoundationRenderer.cs') },
    { path: `${base}/ItemSpawnManager.cs`,          content: loadStaticTemplate('scripts/world/ItemSpawnManager.cs') },
    { path: `${base}/BuildingInteriorGenerator.cs`, content: loadStaticTemplate('scripts/world/BuildingInteriorGenerator.cs') },
    { path: `${base}/AnimalAmbientLifeSystem.cs`, content: loadStaticTemplate('scripts/world/AnimalAmbientLifeSystem.cs') },
    { path: `${base}/BuildingSignManager.cs`,    content: loadStaticTemplate('scripts/world/BuildingSignManager.cs') },
    { path: `${base}/OutdoorFurnitureGenerator.cs`, content: loadStaticTemplate('scripts/world/OutdoorFurnitureGenerator.cs') },
    // ── Export parity part 1: new world generators ──
    { path: `${base}/SettlementSceneManager.cs`,    content: loadStaticTemplate('scripts/world/SettlementSceneManager.cs') },
    { path: `${base}/ChunkManager.cs`,              content: loadStaticTemplate('scripts/world/ChunkManager.cs') },
    { path: `${base}/TownSquareGenerator.cs`,       content: loadStaticTemplate('scripts/world/TownSquareGenerator.cs') },
    { path: `${base}/BuildingPlacementSystem.cs`,   content: loadStaticTemplate('scripts/world/BuildingPlacementSystem.cs') },
    { path: `${base}/BuildingCollisionSystem.cs`,   content: loadStaticTemplate('scripts/world/BuildingCollisionSystem.cs') },
    { path: `${base}/InteriorSceneManager.cs`,      content: loadStaticTemplate('scripts/world/InteriorSceneManager.cs') },
    { path: `${base}/InteriorLightingSystem.cs`,    content: loadStaticTemplate('scripts/world/InteriorLightingSystem.cs') },
    { path: `${base}/InteriorDecorationGenerator.cs`, content: loadStaticTemplate('scripts/world/InteriorDecorationGenerator.cs') },
  ];
}

// ─────────────────────────────────────────────
// UI Scripts (fully static)
// ─────────────────────────────────────────────

function genUIClasses(ir: WorldIR): GeneratedFile[] {
  const base = 'Assets/Scripts/UI';
  const menuTokens: TokenMap = {
    GAME_TITLE: ir.meta.worldName,
  };
  const files: GeneratedFile[] = [
    { path: `${base}/HUDManager.cs`,      content: loadStaticTemplate('scripts/ui/HUDManager.cs') },
    { path: `${base}/QuestTrackerUI.cs`,  content: loadStaticTemplate('scripts/ui/QuestTrackerUI.cs') },
    { path: `${base}/GameMenuUI.cs`,      content: loadStaticTemplate('scripts/ui/GameMenuUI.cs') },
    { path: `${base}/MainMenuUI.cs`,      content: loadTemplate('scripts/ui/MainMenuUI.cs', menuTokens) },
    { path: `${base}/ChatPanel.cs`,       content: loadStaticTemplate('scripts/ui/ChatPanel.cs') },
    { path: `${base}/InventoryUI.cs`,    content: loadStaticTemplate('scripts/ui/InventoryUI.cs') },
    { path: `${base}/QuestJournalUI.cs`, content: loadStaticTemplate('scripts/ui/QuestJournalUI.cs') },
    { path: `${base}/MinimapUI.cs`,     content: loadStaticTemplate('scripts/ui/MinimapUI.cs') },
    { path: `${base}/ShopPanelUI.cs`,       content: loadStaticTemplate('scripts/ui/ShopPanelUI.cs') },
    { path: `${base}/VocabularyPanelUI.cs`, content: loadStaticTemplate('scripts/ui/VocabularyPanelUI.cs') },
    { path: `${base}/SkillTreeUI.cs`,       content: loadStaticTemplate('scripts/ui/SkillTreeUI.cs') },
    { path: `${base}/NoticeBoardUI.cs`,     content: loadStaticTemplate('scripts/ui/NoticeBoardUI.cs') },
    { path: `${base}/QuestIndicatorManager.cs`, content: loadStaticTemplate('scripts/ui/QuestIndicatorManager.cs') },
    { path: `${base}/RadialActionMenu.cs`,    content: loadStaticTemplate('scripts/ui/RadialActionMenu.cs') },
    { path: `${base}/QuestWaypointManager.cs`, content: loadStaticTemplate('scripts/ui/QuestWaypointManager.cs') },
    { path: `${base}/NotificationSystem.cs`,   content: loadStaticTemplate('scripts/ui/NotificationSystem.cs') },
    { path: `${base}/ConversationHistoryPanel.cs`, content: loadStaticTemplate('scripts/ui/ConversationHistoryPanel.cs') },
    { path: `${base}/CombatUI.cs`,            content: loadStaticTemplate('scripts/ui/CombatUI.cs') },
    // ── Export parity part 2: new UI panels ──
    { path: `${base}/GameIntroSequence.cs`,       content: loadStaticTemplate('scripts/ui/GameIntroSequence.cs') },
    { path: `${base}/ActionQuickBar.cs`,          content: loadStaticTemplate('scripts/ui/ActionQuickBar.cs') },
    { path: `${base}/DocumentReadingPanel.cs`,    content: loadStaticTemplate('scripts/ui/DocumentReadingPanel.cs') },
  ];

  const mapEnabled = ir.ui?.menuConfig?.mapScreen?.enabled !== false;
  if (mapEnabled) {
    files.push({ path: `${base}/WorldMapUI.cs`, content: loadStaticTemplate('scripts/ui/WorldMapUI.cs') });
  }

  const dialogueEnabled = ir.ui?.menuConfig?.dialogueScreen?.enabled !== false;
  if (dialogueEnabled) {
    files.push({ path: `${base}/DialogueUI.cs`, content: loadStaticTemplate('scripts/ui/DialogueUI.cs') });
  }

  return files;
}

// ─────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────

function genServiceClasses(): GeneratedFile[] {
  const base = 'Assets/Scripts/Services';
  return [
    { path: `${base}/InsimulAIService.cs`, content: loadStaticTemplate('scripts/services/InsimulAIService.cs') },
    { path: `${base}/LlamaNativePlugin.cs`, content: loadStaticTemplate('scripts/services/LlamaNativePlugin.cs') },
    { path: `${base}/LocalAIService.cs`, content: loadStaticTemplate('scripts/services/LocalAIService.cs') },
  ];
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateCSharpFiles(ir: WorldIR): GeneratedFile[] {
  return [
    ...genDataClasses(),
    ...genCoreClasses(),
    ...genCharacterClasses(ir),
    ...genSystemClasses(ir),
    ...genWorldGenerators(ir),
    ...genUIClasses(ir),
    ...genServiceClasses(),
  ];
}
