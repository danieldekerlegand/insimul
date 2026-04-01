/**
 * Unreal C++ Generator
 *
 * Generates C++ header and source files for the UE5 project:
 * - Data structs (USTRUCTs for DataTable rows)
 * - Core classes (GameMode, GameInstance, PlayerController)
 * - Character classes (Player, NPC)
 * - Game systems (Action, Combat, Quest, Inventory, Crafting, Resource, Survival, Dialogue, Rule)
 * - Part 2 systems (CharacterController, CameraManager, NPC assembly/animation/movement/schedule/LOD/greeting/activity/conversation,
 *   LipSync, BusinessInteraction, QuestCompletion, CombatMode, ResourceGathering, Exploration, Reputation,
 *   SpatialAudio, Photography, Puzzle, Onboarding, TruthSync, SaveLoad, AnimalNPC, VR)
 * - UI classes (HUD widget with health, energy, gold, survival bars, compass, quest journal)
 * - Part 2 UI (ChatPanel, GameMenu, QuestTracker, QuestOffer, IntroSequence, ActionQuickBar, DocumentReader)
 * - World generators (Building, Nature, Road, Dungeon, WorldScale)
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './unreal-project-generator';
import { loadStaticTemplate, loadTemplate, cppFloat, type TokenMap } from './unreal-template-loader';

const M = 'InsimulExport'; // Module name

// ─────────────────────────────────────────────
// Data Structs (DataTable row types)
// ─────────────────────────────────────────────

function genDataStructs(): GeneratedFile[] {
  const base = `Source/${M}/Data`;
  return [
    { path: `${base}/CharacterData.h`,  content: loadStaticTemplate('source/data/CharacterData.h') },
    { path: `${base}/NPCData.h`,        content: loadStaticTemplate('source/data/NPCData.h') },
    { path: `${base}/ActionData.h`,     content: loadStaticTemplate('source/data/ActionData.h') },
    { path: `${base}/RuleData.h`,       content: loadStaticTemplate('source/data/RuleData.h') },
    { path: `${base}/QuestData.h`,      content: loadStaticTemplate('source/data/QuestData.h') },
    { path: `${base}/SettlementData.h`, content: loadStaticTemplate('source/data/SettlementData.h') },
    { path: `${base}/BuildingData.h`,   content: loadStaticTemplate('source/data/BuildingData.h') },
    { path: `${base}/DialogueContextData.h`, content: loadStaticTemplate('source/data/DialogueContextData.h') },
    { path: `${base}/WaterFeatureData.h`, content: loadStaticTemplate('source/data/WaterFeatureData.h') },
    { path: `${base}/GameTypes.h`,     content: loadStaticTemplate('source/data/GameTypes.h') },
    { path: `${base}/LotData.h`,       content: loadStaticTemplate('source/data/LotData.h') },
    { path: `${base}/InfrastructureData.h`, content: loadStaticTemplate('source/data/InfrastructureData.h') },
    { path: `${base}/ResourceData.h`,   content: loadStaticTemplate('source/data/ResourceData.h') },
    { path: `${base}/AnimationData.h`, content: loadStaticTemplate('source/data/AnimationData.h') },
    { path: `${base}/BiomeZoneData.h`, content: loadStaticTemplate('source/data/BiomeZoneData.h') },
    { path: `${base}/FoliageLayerData.h`, content: loadStaticTemplate('source/data/FoliageLayerData.h') },
  ];
}

// ─────────────────────────────────────────────
// Core Classes
// ─────────────────────────────────────────────

function genCoreClasses(ir: WorldIR): GeneratedFile[] {
  const base = `Source/${M}/Core`;
  const theme = ir.theme.visualTheme;

  const gameModeTokens: TokenMap = {
    GROUND_COLOR_R: cppFloat(theme.groundColor.r),
    GROUND_COLOR_G: cppFloat(theme.groundColor.g),
    GROUND_COLOR_B: cppFloat(theme.groundColor.b),
    BASE_COLOR_R:   cppFloat(theme.settlementBaseColor.r),
    BASE_COLOR_G:   cppFloat(theme.settlementBaseColor.g),
    BASE_COLOR_B:   cppFloat(theme.settlementBaseColor.b),
    ROOF_COLOR_R:   cppFloat(theme.settlementRoofColor.r),
    ROOF_COLOR_G:   cppFloat(theme.settlementRoofColor.g),
    ROOF_COLOR_B:   cppFloat(theme.settlementRoofColor.b),
    ROAD_COLOR_R:   cppFloat(theme.roadColor.r),
    ROAD_COLOR_G:   cppFloat(theme.roadColor.g),
    ROAD_COLOR_B:   cppFloat(theme.roadColor.b),
  };

  const controllerTokens: TokenMap = {
    PLAYER_MAX_ENERGY:  ir.player.initialEnergy,
    SHOW_HEALTH_BAR:    ir.ui.showHealthBar ? 'true' : 'false',
    SHOW_STAMINA_BAR:   ir.ui.showStaminaBar ? 'true' : 'false',
    SHOW_COMPASS:       ir.ui.showCompass ? 'true' : 'false',
    HAS_SURVIVAL:       ir.survival ? 'true' : 'false',
  };

  return [
    { path: `${base}/InsimulGameInstance.h`,        content: loadStaticTemplate('source/core/InsimulGameInstance.h') },
    { path: `${base}/InsimulGameInstance.cpp`,      content: loadStaticTemplate('source/core/InsimulGameInstance.cpp') },
    { path: `${base}/InsimulMeshActor.h`,           content: loadStaticTemplate('source/core/InsimulMeshActor.h') },
    { path: `${base}/InsimulMeshActor.cpp`,         content: loadStaticTemplate('source/core/InsimulMeshActor.cpp') },
    { path: `${base}/InsimulPlayerController.h`,    content: loadStaticTemplate('source/core/InsimulPlayerController.h') },
    { path: `${base}/InsimulPlayerController.cpp`,  content: loadTemplate('source/core/InsimulPlayerController.cpp', controllerTokens) },
    { path: `${base}/CreateLevelCommandlet.h`,      content: loadStaticTemplate('source/core/CreateLevelCommandlet.h') },
    { path: `${base}/CreateLevelCommandlet.cpp`,    content: loadStaticTemplate('source/core/CreateLevelCommandlet.cpp') },
    { path: `${base}/InsimulGameMode.h`,            content: loadStaticTemplate('source/core/InsimulGameMode.h') },
    { path: `${base}/InsimulGameMode.cpp`,          content: loadTemplate('source/core/InsimulGameMode.cpp', gameModeTokens) },
    { path: `${base}/DataLoader.h`,                 content: loadStaticTemplate('source/core/DataLoader.h') },
    { path: `${base}/DataLoader.cpp`,               content: loadStaticTemplate('source/core/DataLoader.cpp') },
  ];
}

// ─────────────────────────────────────────────
// Character Classes
// ─────────────────────────────────────────────

function genCharacterClasses(ir: WorldIR): GeneratedFile[] {
  const base = `Source/${M}/Characters`;
  const p = ir.player;

  const playerHTokens: TokenMap = {
    PLAYER_INITIAL_HEALTH: p.initialHealth,
    PLAYER_INITIAL_ENERGY: p.initialEnergy,
    PLAYER_INITIAL_GOLD:   p.initialGold,
    PLAYER_SPEED:          p.speed,
    PLAYER_JUMP_HEIGHT:    p.jumpHeight,
  };

  const playerCppTokens: TokenMap = {
    PLAYER_GRAVITY: cppFloat(p.gravity),
  };

  return [
    { path: `${base}/PlayerCharacter.h`,   content: loadTemplate('source/characters/PlayerCharacter.h', playerHTokens) },
    { path: `${base}/PlayerCharacter.cpp`, content: loadTemplate('source/characters/PlayerCharacter.cpp', playerCppTokens) },
    { path: `${base}/NPCCharacter.h`,      content: loadStaticTemplate('source/characters/NPCCharacter.h') },
    { path: `${base}/NPCCharacter.cpp`,    content: loadStaticTemplate('source/characters/NPCCharacter.cpp') },
    { path: `${base}/InsimulAnimInstance.h`,   content: loadStaticTemplate('source/characters/InsimulAnimInstance.h') },
    { path: `${base}/InsimulAnimInstance.cpp`, content: loadStaticTemplate('source/characters/InsimulAnimInstance.cpp') },
  ];
}

// ─────────────────────────────────────────────
// Game Systems
// ─────────────────────────────────────────────

function genSystemClasses(ir: WorldIR): GeneratedFile[] {
  const base = `Source/${M}/Systems`;
  const cs = ir.combat.settings;
  const genre = ir.meta.genreConfig;

  const combatTokens: TokenMap = {
    COMBAT_STYLE:               ir.combat.style,
    COMBAT_BASE_DAMAGE:         cppFloat(cs.baseDamage),
    COMBAT_CRITICAL_CHANCE:     cppFloat(cs.criticalChance),
    COMBAT_CRITICAL_MULTIPLIER: cppFloat(cs.criticalMultiplier),
    COMBAT_BLOCK_REDUCTION:     cppFloat(cs.blockReduction),
    COMBAT_DODGE_CHANCE:        cppFloat(cs.dodgeChance),
  };

  const files: GeneratedFile[] = [
    { path: `${base}/ActionSystem.h`,    content: loadStaticTemplate('source/systems/ActionSystem.h') },
    { path: `${base}/ActionSystem.cpp`,  content: loadStaticTemplate('source/systems/ActionSystem.cpp') },
    { path: `${base}/RuleEnforcer.h`,    content: loadStaticTemplate('source/systems/RuleEnforcer.h') },
    { path: `${base}/RuleEnforcer.cpp`,  content: loadStaticTemplate('source/systems/RuleEnforcer.cpp') },
    { path: `${base}/CombatSystem.h`,    content: loadTemplate('source/systems/CombatSystem.h', combatTokens) },
    { path: `${base}/CombatSystem.cpp`,  content: loadStaticTemplate('source/systems/CombatSystem.cpp') },
    { path: `${base}/QuestSystem.h`,     content: loadStaticTemplate('source/systems/QuestSystem.h') },
    { path: `${base}/QuestSystem.cpp`,   content: loadStaticTemplate('source/systems/QuestSystem.cpp') },
    { path: `${base}/InventorySystem.h`, content: loadStaticTemplate('source/systems/InventorySystem.h') },
    { path: `${base}/InventorySystem.cpp`, content: loadStaticTemplate('source/systems/InventorySystem.cpp') },
    { path: `${base}/DialogueSystem.h`,  content: loadStaticTemplate('source/systems/DialogueSystem.h') },
    { path: `${base}/DialogueSystem.cpp`, content: loadStaticTemplate('source/systems/DialogueSystem.cpp') },
    { path: `${base}/DayNightSystem.h`,  content: loadStaticTemplate('source/systems/DayNightSystem.h') },
    { path: `${base}/DayNightSystem.cpp`, content: loadStaticTemplate('source/systems/DayNightSystem.cpp') },
    { path: `${base}/WeatherSystem.h`,   content: loadStaticTemplate('source/systems/WeatherSystem.h') },
    { path: `${base}/WeatherSystem.cpp`,  content: loadStaticTemplate('source/systems/WeatherSystem.cpp') },
    { path: `${base}/BuildingInteriorSystem.h`,  content: loadStaticTemplate('source/systems/BuildingInteriorSystem.h') },
    { path: `${base}/BuildingInteriorSystem.cpp`, content: loadStaticTemplate('source/systems/BuildingInteriorSystem.cpp') },
    { path: `${base}/AudioSystem.h`,  content: loadStaticTemplate('source/systems/AudioSystem.h') },
    { path: `${base}/AudioSystem.cpp`, content: loadStaticTemplate('source/systems/AudioSystem.cpp') },
    { path: `${base}/EventBus.h`,      content: loadStaticTemplate('source/systems/EventBus.h') },
    { path: `${base}/EventBus.cpp`,    content: loadStaticTemplate('source/systems/EventBus.cpp') },
    { path: `${base}/PrologEngine.h`,  content: loadStaticTemplate('source/systems/PrologEngine.h') },
    { path: `${base}/PrologEngine.cpp`, content: loadStaticTemplate('source/systems/PrologEngine.cpp') },
    // Building systems
    { path: `${base}/BuildingPlacementSystem.h`, content: loadStaticTemplate('source/systems/BuildingPlacementSystem.h') },
    { path: `${base}/BuildingPlacementSystem.cpp`, content: loadStaticTemplate('source/systems/BuildingPlacementSystem.cpp') },
    { path: `${base}/BuildingSignManager.h`, content: loadStaticTemplate('source/systems/BuildingSignManager.h') },
    { path: `${base}/BuildingSignManager.cpp`, content: loadStaticTemplate('source/systems/BuildingSignManager.cpp') },
    { path: `${base}/BuildingCollisionSystem.h`, content: loadStaticTemplate('source/systems/BuildingCollisionSystem.h') },
    { path: `${base}/BuildingCollisionSystem.cpp`, content: loadStaticTemplate('source/systems/BuildingCollisionSystem.cpp') },
    // Spawning systems
    { path: `${base}/ContainerSpawnSystem.h`, content: loadStaticTemplate('source/systems/ContainerSpawnSystem.h') },
    { path: `${base}/ContainerSpawnSystem.cpp`, content: loadStaticTemplate('source/systems/ContainerSpawnSystem.cpp') },
    { path: `${base}/ExteriorItemManager.h`, content: loadStaticTemplate('source/systems/ExteriorItemManager.h') },
    { path: `${base}/ExteriorItemManager.cpp`, content: loadStaticTemplate('source/systems/ExteriorItemManager.cpp') },
    // Character controller & camera
    { path: `${base}/CharacterController.h`, content: loadStaticTemplate('source/systems/CharacterController.h') },
    { path: `${base}/CharacterController.cpp`, content: loadStaticTemplate('source/systems/CharacterController.cpp') },
    { path: `${base}/CameraManager.h`, content: loadStaticTemplate('source/systems/CameraManager.h') },
    { path: `${base}/CameraManager.cpp`, content: loadStaticTemplate('source/systems/CameraManager.cpp') },
    // NPC systems
    { path: `${base}/NPCModularAssembler.h`, content: loadStaticTemplate('source/systems/NPCModularAssembler.h') },
    { path: `${base}/NPCModularAssembler.cpp`, content: loadStaticTemplate('source/systems/NPCModularAssembler.cpp') },
    { path: `${base}/NPCAccessorySystem.h`, content: loadStaticTemplate('source/systems/NPCAccessorySystem.h') },
    { path: `${base}/NPCAccessorySystem.cpp`, content: loadStaticTemplate('source/systems/NPCAccessorySystem.cpp') },
    { path: `${base}/NPCAnimationController.h`, content: loadStaticTemplate('source/systems/NPCAnimationController.h') },
    { path: `${base}/NPCAnimationController.cpp`, content: loadStaticTemplate('source/systems/NPCAnimationController.cpp') },
    { path: `${base}/NPCMovementController.h`, content: loadStaticTemplate('source/systems/NPCMovementController.h') },
    { path: `${base}/NPCMovementController.cpp`, content: loadStaticTemplate('source/systems/NPCMovementController.cpp') },
    { path: `${base}/NPCScheduleSystem.h`, content: loadStaticTemplate('source/systems/NPCScheduleSystem.h') },
    { path: `${base}/NPCScheduleSystem.cpp`, content: loadStaticTemplate('source/systems/NPCScheduleSystem.cpp') },
    { path: `${base}/NPCSimulationLOD.h`, content: loadStaticTemplate('source/systems/NPCSimulationLOD.h') },
    { path: `${base}/NPCSimulationLOD.cpp`, content: loadStaticTemplate('source/systems/NPCSimulationLOD.cpp') },
    { path: `${base}/NPCGreetingSystem.h`, content: loadStaticTemplate('source/systems/NPCGreetingSystem.h') },
    { path: `${base}/NPCGreetingSystem.cpp`, content: loadStaticTemplate('source/systems/NPCGreetingSystem.cpp') },
    { path: `${base}/NPCActivityLabelSystem.h`, content: loadStaticTemplate('source/systems/NPCActivityLabelSystem.h') },
    { path: `${base}/NPCActivityLabelSystem.cpp`, content: loadStaticTemplate('source/systems/NPCActivityLabelSystem.cpp') },
    { path: `${base}/AmbientConversationSystem.h`, content: loadStaticTemplate('source/systems/AmbientConversationSystem.h') },
    { path: `${base}/AmbientConversationSystem.cpp`, content: loadStaticTemplate('source/systems/AmbientConversationSystem.cpp') },
    // Dialogue & interaction
    { path: `${base}/LipSyncController.h`, content: loadStaticTemplate('source/systems/LipSyncController.h') },
    { path: `${base}/LipSyncController.cpp`, content: loadStaticTemplate('source/systems/LipSyncController.cpp') },
    { path: `${base}/BusinessInteractionSystem.h`, content: loadStaticTemplate('source/systems/BusinessInteractionSystem.h') },
    { path: `${base}/BusinessInteractionSystem.cpp`, content: loadStaticTemplate('source/systems/BusinessInteractionSystem.cpp') },
    // Quest completion
    { path: `${base}/QuestCompletionManager.h`, content: loadStaticTemplate('source/systems/QuestCompletionManager.h') },
    { path: `${base}/QuestCompletionManager.cpp`, content: loadStaticTemplate('source/systems/QuestCompletionManager.cpp') },
    // Combat modes
    { path: `${base}/CombatModeManager.h`, content: loadStaticTemplate('source/systems/CombatModeManager.h') },
    { path: `${base}/CombatModeManager.cpp`, content: loadStaticTemplate('source/systems/CombatModeManager.cpp') },
    // Resource gathering
    { path: `${base}/ResourceGatheringSystem.h`, content: loadStaticTemplate('source/systems/ResourceGatheringSystem.h') },
    { path: `${base}/ResourceGatheringSystem.cpp`, content: loadStaticTemplate('source/systems/ResourceGatheringSystem.cpp') },
    // Exploration & reputation
    { path: `${base}/ExplorationDiscoverySystem.h`, content: loadStaticTemplate('source/systems/ExplorationDiscoverySystem.h') },
    { path: `${base}/ExplorationDiscoverySystem.cpp`, content: loadStaticTemplate('source/systems/ExplorationDiscoverySystem.cpp') },
    { path: `${base}/ReputationManager.h`, content: loadStaticTemplate('source/systems/ReputationManager.h') },
    { path: `${base}/ReputationManager.cpp`, content: loadStaticTemplate('source/systems/ReputationManager.cpp') },
    // Audio & media
    { path: `${base}/SpatialAudioManager.h`, content: loadStaticTemplate('source/systems/SpatialAudioManager.h') },
    { path: `${base}/SpatialAudioManager.cpp`, content: loadStaticTemplate('source/systems/SpatialAudioManager.cpp') },
    { path: `${base}/PhotographySystem.h`, content: loadStaticTemplate('source/systems/PhotographySystem.h') },
    { path: `${base}/PhotographySystem.cpp`, content: loadStaticTemplate('source/systems/PhotographySystem.cpp') },
    // Puzzle & dungeons
    { path: `${base}/PuzzleGameSystem.h`, content: loadStaticTemplate('source/systems/PuzzleGameSystem.h') },
    { path: `${base}/PuzzleGameSystem.cpp`, content: loadStaticTemplate('source/systems/PuzzleGameSystem.cpp') },
    // Onboarding & tutorials
    { path: `${base}/OnboardingManager.h`, content: loadStaticTemplate('source/systems/OnboardingManager.h') },
    { path: `${base}/OnboardingManager.cpp`, content: loadStaticTemplate('source/systems/OnboardingManager.cpp') },
    // Truth sync & content gating
    { path: `${base}/TruthSyncSystem.h`, content: loadStaticTemplate('source/systems/TruthSyncSystem.h') },
    { path: `${base}/TruthSyncSystem.cpp`, content: loadStaticTemplate('source/systems/TruthSyncSystem.cpp') },
    // Save/load
    { path: `${base}/SaveLoadSystem.h`, content: loadStaticTemplate('source/systems/SaveLoadSystem.h') },
    { path: `${base}/SaveLoadSystem.cpp`, content: loadStaticTemplate('source/systems/SaveLoadSystem.cpp') },
    // Animal NPCs
    { path: `${base}/AnimalNPCManager.h`, content: loadStaticTemplate('source/systems/AnimalNPCManager.h') },
    { path: `${base}/AnimalNPCManager.cpp`, content: loadStaticTemplate('source/systems/AnimalNPCManager.cpp') },
    // VR scaffolding
    { path: `${base}/VRScaffolding.h`, content: loadStaticTemplate('source/systems/VRScaffolding.h') },
    { path: `${base}/VRScaffolding.cpp`, content: loadStaticTemplate('source/systems/VRScaffolding.cpp') },
  ];

  if (genre.features.crafting) {
    files.push({ path: `${base}/CraftingSystem.h`,   content: loadStaticTemplate('source/systems/CraftingSystem.h') });
    files.push({ path: `${base}/CraftingSystem.cpp`, content: loadStaticTemplate('source/systems/CraftingSystem.cpp') });
  }

  if (genre.features.resources) {
    files.push({ path: `${base}/ResourceSystem.h`,   content: loadStaticTemplate('source/systems/ResourceSystem.h') });
    files.push({ path: `${base}/ResourceSystem.cpp`, content: loadStaticTemplate('source/systems/ResourceSystem.cpp') });
  }

  if (ir.survival) {
    files.push({ path: `${base}/SurvivalSystem.h`,   content: loadStaticTemplate('source/systems/SurvivalSystem.h') });
    files.push({ path: `${base}/SurvivalSystem.cpp`, content: loadStaticTemplate('source/systems/SurvivalSystem.cpp') });
  }

  return files;
}

// ─────────────────────────────────────────────
// World Generators
// ─────────────────────────────────────────────

function genWorldGenerators(ir: WorldIR): GeneratedFile[] {
  const base = `Source/${M}/World`;
  const theme = ir.theme.visualTheme;

  const worldScaleTokens: TokenMap = {
    TERRAIN_SIZE:      ir.geography.terrainSize,
    WORLD_SCALE_FACTOR: cppFloat(ir.geography.worldScaleFactor ?? 1.0),
    GROUND_COLOR_R: cppFloat(theme.groundColor.r),
    GROUND_COLOR_G: cppFloat(theme.groundColor.g),
    GROUND_COLOR_B: cppFloat(theme.groundColor.b),
    SKY_COLOR_R:    cppFloat(theme.skyColor.r),
    SKY_COLOR_G:    cppFloat(theme.skyColor.g),
    SKY_COLOR_B:    cppFloat(theme.skyColor.b),
    ROAD_COLOR_R:   cppFloat(theme.roadColor.r),
    ROAD_COLOR_G:   cppFloat(theme.roadColor.g),
    ROAD_COLOR_B:   cppFloat(theme.roadColor.b),
  };

  const buildingTokens: TokenMap = {
    BASE_COLOR_R: cppFloat(theme.settlementBaseColor.r),
    BASE_COLOR_G: cppFloat(theme.settlementBaseColor.g),
    BASE_COLOR_B: cppFloat(theme.settlementBaseColor.b),
    ROOF_COLOR_R: cppFloat(theme.settlementRoofColor.r),
    ROOF_COLOR_G: cppFloat(theme.settlementRoofColor.g),
    ROOF_COLOR_B: cppFloat(theme.settlementRoofColor.b),
  };

  const roadTokens: TokenMap = {
    ROAD_COLOR_R: cppFloat(theme.roadColor.r),
    ROAD_COLOR_G: cppFloat(theme.roadColor.g),
    ROAD_COLOR_B: cppFloat(theme.roadColor.b),
    ROAD_RADIUS:  cppFloat(theme.roadRadius),
  };

  return [
    { path: `${base}/WorldScaleManager.h`,              content: loadTemplate('source/world/WorldScaleManager.h', worldScaleTokens) },
    { path: `${base}/WorldScaleManager.cpp`,            content: loadStaticTemplate('source/world/WorldScaleManager.cpp') },
    { path: `${base}/ProceduralBuildingGenerator.h`,    content: loadTemplate('source/world/ProceduralBuildingGenerator.h', buildingTokens) },
    { path: `${base}/ProceduralBuildingGenerator.cpp`,  content: loadStaticTemplate('source/world/ProceduralBuildingGenerator.cpp') },
    { path: `${base}/RoadGenerator.h`,                  content: loadTemplate('source/world/RoadGenerator.h', roadTokens) },
    { path: `${base}/RoadGenerator.cpp`,                content: loadStaticTemplate('source/world/RoadGenerator.cpp') },
    { path: `${base}/ProceduralNatureGenerator.h`,      content: loadStaticTemplate('source/world/ProceduralNatureGenerator.h') },
    { path: `${base}/ProceduralNatureGenerator.cpp`,    content: loadStaticTemplate('source/world/ProceduralNatureGenerator.cpp') },
    { path: `${base}/ProceduralDungeonGenerator.h`,     content: loadStaticTemplate('source/world/ProceduralDungeonGenerator.h') },
    { path: `${base}/ProceduralDungeonGenerator.cpp`,   content: loadStaticTemplate('source/world/ProceduralDungeonGenerator.cpp') },
    { path: `${base}/ProceduralTerrainGenerator.h`,     content: loadStaticTemplate('source/world/ProceduralTerrainGenerator.h') },
    { path: `${base}/ProceduralTerrainGenerator.cpp`,   content: loadStaticTemplate('source/world/ProceduralTerrainGenerator.cpp') },
    { path: `${base}/AnimalSystem.h`,                   content: loadStaticTemplate('source/world/AnimalSystem.h') },
    { path: `${base}/AnimalSystem.cpp`,                 content: loadStaticTemplate('source/world/AnimalSystem.cpp') },
    // Terrain & settlement systems
    { path: `${base}/TerrainFoundationRenderer.h`, content: loadStaticTemplate('source/world/TerrainFoundationRenderer.h') },
    { path: `${base}/TerrainFoundationRenderer.cpp`, content: loadStaticTemplate('source/world/TerrainFoundationRenderer.cpp') },
    { path: `${base}/SettlementSceneManager.h`, content: loadStaticTemplate('source/world/SettlementSceneManager.h') },
    { path: `${base}/SettlementSceneManager.cpp`, content: loadStaticTemplate('source/world/SettlementSceneManager.cpp') },
    { path: `${base}/ChunkManager.h`, content: loadStaticTemplate('source/world/ChunkManager.h') },
    { path: `${base}/ChunkManager.cpp`, content: loadStaticTemplate('source/world/ChunkManager.cpp') },
    { path: `${base}/TownSquareGenerator.h`, content: loadStaticTemplate('source/world/TownSquareGenerator.h') },
    { path: `${base}/TownSquareGenerator.cpp`, content: loadStaticTemplate('source/world/TownSquareGenerator.cpp') },
    // Water & nature
    { path: `${base}/WaterRenderer.h`, content: loadStaticTemplate('source/world/WaterRenderer.h') },
    { path: `${base}/WaterRenderer.cpp`, content: loadStaticTemplate('source/world/WaterRenderer.cpp') },
    { path: `${base}/OutdoorFurnitureGenerator.h`, content: loadStaticTemplate('source/world/OutdoorFurnitureGenerator.h') },
    { path: `${base}/OutdoorFurnitureGenerator.cpp`, content: loadStaticTemplate('source/world/OutdoorFurnitureGenerator.cpp') },
    // Interiors
    { path: `${base}/InteriorSceneManager.h`, content: loadStaticTemplate('source/world/InteriorSceneManager.h') },
    { path: `${base}/InteriorSceneManager.cpp`, content: loadStaticTemplate('source/world/InteriorSceneManager.cpp') },
    { path: `${base}/BuildingInteriorGenerator.h`, content: loadStaticTemplate('source/world/BuildingInteriorGenerator.h') },
    { path: `${base}/BuildingInteriorGenerator.cpp`, content: loadStaticTemplate('source/world/BuildingInteriorGenerator.cpp') },
    { path: `${base}/InteriorLightingSystem.h`, content: loadStaticTemplate('source/world/InteriorLightingSystem.h') },
    { path: `${base}/InteriorLightingSystem.cpp`, content: loadStaticTemplate('source/world/InteriorLightingSystem.cpp') },
    { path: `${base}/InteriorDecorationGenerator.h`, content: loadStaticTemplate('source/world/InteriorDecorationGenerator.h') },
    { path: `${base}/InteriorDecorationGenerator.cpp`, content: loadStaticTemplate('source/world/InteriorDecorationGenerator.cpp') },
  ];
}

// ─────────────────────────────────────────────
// UI Widgets
// ─────────────────────────────────────────────

function genUIWidgets(ir: WorldIR): GeneratedFile[] {
  const base = `Source/${M}/UI`;
  const minimapTokens: TokenMap = {
    MINIMAP_SIZE: ir.ui?.showMinimap !== false ? 150 : 0,
  };

  const journal = ir.ui.questJournal;
  const journalTokens: TokenMap = {
    MAX_TRACKED_QUESTS: journal?.maxTrackedQuests ?? 3,
    SHOW_QUEST_MARKERS: journal?.showQuestMarkers ? 'true' : 'false',
    AUTO_TRACK_NEW: journal?.autoTrackNew ? 'true' : 'false',
  };

  const pauseMenuTokens: TokenMap = {
    MAX_SAVE_SLOTS: ir.ui?.menuConfig?.pauseMenu?.maxSaveSlots ?? 5,
  };

  const files: GeneratedFile[] = [
    { path: `${base}/InsimulInventoryUI.h`,   content: loadStaticTemplate('source/ui/InsimulInventoryUI.h') },
    { path: `${base}/InsimulInventoryUI.cpp`, content: loadStaticTemplate('source/ui/InsimulInventoryUI.cpp') },
    { path: `${base}/DialogueWidget.h`,   content: loadStaticTemplate('source/ui/DialogueWidget.h') },
    { path: `${base}/DialogueWidget.cpp`, content: loadStaticTemplate('source/ui/DialogueWidget.cpp') },
    { path: `${base}/InsimulMinimap.h`,   content: loadTemplate('source/ui/InsimulMinimap.h', minimapTokens) },
    { path: `${base}/InsimulMinimap.cpp`, content: loadStaticTemplate('source/ui/InsimulMinimap.cpp') },
    { path: `${base}/InsimulHUD.h`,       content: loadStaticTemplate('source/ui/InsimulHUD.h') },
    { path: `${base}/InsimulHUD.cpp`,     content: loadStaticTemplate('source/ui/InsimulHUD.cpp') },
    { path: `${base}/QuestJournalWidget.h`,   content: loadTemplate('source/ui/QuestJournalWidget.h', journalTokens) },
    { path: `${base}/QuestJournalWidget.cpp`, content: loadStaticTemplate('source/ui/QuestJournalWidget.cpp') },
    { path: `${base}/InsimulPauseMenuWidget.h`,   content: loadTemplate('source/ui/InsimulPauseMenuWidget.h', pauseMenuTokens) },
    { path: `${base}/InsimulPauseMenuWidget.cpp`, content: loadStaticTemplate('source/ui/InsimulPauseMenuWidget.cpp') },
    { path: `${base}/InsimulSaveGame.h`,   content: loadStaticTemplate('source/ui/InsimulSaveGame.h') },
    { path: `${base}/InsimulSaveGame.cpp`, content: loadStaticTemplate('source/ui/InsimulSaveGame.cpp') },
    { path: `${base}/InsimulShopPanel.h`,   content: loadStaticTemplate('source/ui/InsimulShopPanel.h') },
    { path: `${base}/InsimulShopPanel.cpp`, content: loadStaticTemplate('source/ui/InsimulShopPanel.cpp') },
    { path: `${base}/InsimulSkillTreePanel.h`,   content: loadStaticTemplate('source/ui/InsimulSkillTreePanel.h') },
    { path: `${base}/InsimulSkillTreePanel.cpp`, content: loadStaticTemplate('source/ui/InsimulSkillTreePanel.cpp') },
    // Part 2 UI widgets
    { path: `${base}/InsimulChatPanel.h`,   content: loadStaticTemplate('source/ui/InsimulChatPanel.h') },
    { path: `${base}/InsimulChatPanel.cpp`, content: loadStaticTemplate('source/ui/InsimulChatPanel.cpp') },
    { path: `${base}/InsimulGameMenuWidget.h`,   content: loadStaticTemplate('source/ui/InsimulGameMenuWidget.h') },
    { path: `${base}/InsimulGameMenuWidget.cpp`, content: loadStaticTemplate('source/ui/InsimulGameMenuWidget.cpp') },
    { path: `${base}/InsimulQuestTrackerWidget.h`,   content: loadStaticTemplate('source/ui/InsimulQuestTrackerWidget.h') },
    { path: `${base}/InsimulQuestTrackerWidget.cpp`, content: loadStaticTemplate('source/ui/InsimulQuestTrackerWidget.cpp') },
    { path: `${base}/InsimulQuestOfferPanel.h`,   content: loadStaticTemplate('source/ui/InsimulQuestOfferPanel.h') },
    { path: `${base}/InsimulQuestOfferPanel.cpp`, content: loadStaticTemplate('source/ui/InsimulQuestOfferPanel.cpp') },
    { path: `${base}/InsimulIntroSequence.h`,   content: loadStaticTemplate('source/ui/InsimulIntroSequence.h') },
    { path: `${base}/InsimulIntroSequence.cpp`, content: loadStaticTemplate('source/ui/InsimulIntroSequence.cpp') },
    { path: `${base}/InsimulActionQuickBar.h`,   content: loadStaticTemplate('source/ui/InsimulActionQuickBar.h') },
    { path: `${base}/InsimulActionQuickBar.cpp`, content: loadStaticTemplate('source/ui/InsimulActionQuickBar.cpp') },
    { path: `${base}/InsimulDocumentReader.h`,   content: loadStaticTemplate('source/ui/InsimulDocumentReader.h') },
    { path: `${base}/InsimulDocumentReader.cpp`, content: loadStaticTemplate('source/ui/InsimulDocumentReader.cpp') },
  ];

  // World map widget (always included when map screen is enabled or by default)
  const mapEnabled = ir.ui?.menuConfig?.mapScreen?.enabled !== false;
  if (mapEnabled) {
    files.push({ path: `${base}/InsimulWorldMap.h`,   content: loadStaticTemplate('source/ui/InsimulWorldMap.h') });
    files.push({ path: `${base}/InsimulWorldMap.cpp`, content: loadStaticTemplate('source/ui/InsimulWorldMap.cpp') });
  }

  // Assessment widget (included when assessment instruments are configured)
  if (ir.assessment && ir.assessment.instruments.length > 0) {
    const phases = ir.assessment.phases ?? [];
    const totalQuestions = ir.assessment.instruments.reduce(
      (sum, inst) => sum + (inst.questions?.length ?? 0), 0
    );
    const assessmentTokens: TokenMap = {
      INSTRUMENT_COUNT: ir.assessment.instruments.length,
      TOTAL_QUESTION_COUNT: totalQuestions,
      HAS_PRE_PHASE: phases.includes('pre') ? 'true' : 'false',
      HAS_POST_PHASE: phases.includes('post') ? 'true' : 'false',
      HAS_DELAYED_PHASE: phases.includes('delayed') ? 'true' : 'false',
    };
    files.push({ path: `${base}/InsimulAssessmentWidget.h`,   content: loadTemplate('source/ui/InsimulAssessmentWidget.h', assessmentTokens) });
    files.push({ path: `${base}/InsimulAssessmentWidget.cpp`, content: loadStaticTemplate('source/ui/InsimulAssessmentWidget.cpp') });
  }

  // Language quiz widget (included when language learning is configured)
  if (ir.languageLearning) {
    const lang = ir.languageLearning;
    const quizTokens: TokenMap = {
      VOCABULARY_COUNT: lang.vocabulary?.length ?? 0,
      GRAMMAR_PATTERN_COUNT: lang.grammarPatterns?.length ?? 0,
      XP_PER_VOCABULARY_USE: lang.xpPerVocabularyUse ?? 10,
      XP_PER_GRAMMAR_USE: lang.xpPerGrammarUse ?? 15,
      ADAPTIVE_DIFFICULTY: lang.adaptiveDifficulty ? 'true' : 'false',
    };
    files.push({ path: `${base}/InsimulLanguageQuizWidget.h`,   content: loadTemplate('source/ui/InsimulLanguageQuizWidget.h', quizTokens) });
    files.push({ path: `${base}/InsimulLanguageQuizWidget.cpp`, content: loadStaticTemplate('source/ui/InsimulLanguageQuizWidget.cpp') });
  }

  return files;
}

// ─────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────

function genServiceClasses(ir: WorldIR): GeneratedFile[] {
  const base = `Source/${M}/Services`;
  // The Insimul plugin (Plugins/Insimul/) handles all conversation logic.
  // We generate a thin initializer that loads exported world data into the plugin.
  return [
    { path: `${base}/InsimulPluginInitializer.h`, content: generatePluginInitializerH() },
    { path: `${base}/InsimulPluginInitializer.cpp`, content: generatePluginInitializerCpp(ir) },
  ];
}

function generatePluginInitializerH(): string {
  return `// Auto-generated — initializes the Insimul plugin with exported world data.
#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "InsimulPluginInitializer.generated.h"

/**
 * Initializes the Insimul plugin's character mapping subsystem
 * with exported world data at game start.
 *
 * The Insimul plugin (Plugins/Insimul/) handles all conversation logic.
 * This class just bootstraps it with the exported data.
 */
UCLASS()
class ${M.toUpperCase()}_API UInsimulPluginInitializer : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
};
`;
}

function generatePluginInitializerCpp(ir: WorldIR): string {
  return `// Auto-generated — initializes the Insimul plugin with exported world data.
#include "InsimulPluginInitializer.h"
#include "InsimulSettings.h"

void UInsimulPluginInitializer::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);

    // The Insimul plugin auto-initializes from UInsimulSettings (DefaultGame.ini).
    // World data is loaded from Content/InsimulData/world_export.json when
    // ChatProvider=Local. For Server mode, characters are fetched from the server.
    //
    // The InsimulCharacterMappingSubsystem auto-loads characters at startup
    // based on the configured provider. No additional initialization needed here.

    const UInsimulSettings* Settings = UInsimulSettings::Get();
    if (Settings)
    {
        UE_LOG(LogTemp, Log, TEXT("[InsimulExport] Plugin initialized — Chat: %s, World: %s"),
            Settings->IsOfflineMode() ? TEXT("Local") : TEXT("Server"),
            *Settings->DefaultWorldID);
    }
}
`;
}

// ─────────────────────────────────────────────
// AI Bundle code generation
// ─────────────────────────────────────────────

/** Escape a string for use inside a C++ TEXT("...") literal. */
function cppEscape(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Generate InsimulAIBundle.cpp with baked-in AI config, dialogue contexts,
 * and knowledge base from the WorldIR.
 */
function generateAIBundleCpp(ir: WorldIR): string {
  const ai = ir.aiConfig;
  const contexts = ir.systems.dialogueContexts || [];
  const kb = ir.systems.knowledgeBase || '';

  // Build dialogue context initializers
  const contextEntries = contexts.map(ctx => {
    const truths = ctx.truths || [];
    const truthLines = truths.map(t =>
      `        { FInsimulDialogueTruth Truth; Truth.Title = TEXT("${cppEscape(t.title)}"); Truth.Content = TEXT("${cppEscape(t.content)}"); Ctx.Truths.Add(Truth); }`
    ).join('\n');

    return `    {
        Ctx.CharacterId = TEXT("${cppEscape(ctx.characterId)}");
        Ctx.CharacterName = TEXT("${cppEscape(ctx.characterName)}");
        Ctx.SystemPrompt = TEXT("${cppEscape(ctx.systemPrompt)}");
        Ctx.Greeting = TEXT("${cppEscape(ctx.greeting)}");
        Ctx.Voice = TEXT("${cppEscape(ctx.voice)}");
${truthLines}
        Result.Add(Ctx);
    }`;
  });

  const contextBlock = contexts.length > 0
    ? `    FInsimulDialogueContext Ctx;
${contextEntries.join('\n    Ctx = FInsimulDialogueContext();\n')}`
    : '';

  return `// Auto-generated by Insimul export pipeline — do not edit manually.
#include "InsimulAIBundle.h"
#include "Services/InsimulAIService.h"

void UInsimulAIBundle::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);

    // Auto-initialize the AI service with baked-in data
    UInsimulAIService* AIService = GetGameInstance()->GetSubsystem<UInsimulAIService>();
    if (AIService)
    {
        AIService->InitializeService(GetBundledConfig(), GetBundledContexts());
        bInitialized = true;
        UE_LOG(LogTemp, Log, TEXT("[InsimulAIBundle] AI service initialized with %d dialogue contexts"), GetBundledContexts().Num());
    }
    else
    {
        UE_LOG(LogTemp, Warning, TEXT("[InsimulAIBundle] InsimulAIService subsystem not found"));
    }
}

FInsimulAIConfig UInsimulAIBundle::GetBundledConfig() const
{
    FInsimulAIConfig Config;
    Config.ApiMode = TEXT("${cppEscape(ai.apiMode)}");
    Config.InsimulEndpoint = TEXT("${cppEscape(ai.insimulEndpoint)}");
    Config.GeminiModel = TEXT("${cppEscape(ai.geminiModel)}");
    Config.GeminiApiKey = TEXT("${cppEscape(ai.geminiApiKeyPlaceholder)}");
    Config.bVoiceEnabled = ${ai.voiceEnabled ? 'true' : 'false'};
    Config.DefaultVoice = TEXT("${cppEscape(ai.defaultVoice)}");
    return Config;
}

TArray<FInsimulDialogueContext> UInsimulAIBundle::GetBundledContexts() const
{
    TArray<FInsimulDialogueContext> Result;
${contextBlock}
    return Result;
}

FString UInsimulAIBundle::GetKnowledgeBase() const
{
    return TEXT("${cppEscape(kb)}");
}
`;
}


// ─────────────────────────────────────────────
// UI Classes (HUD + Main Menu)
// ─────────────────────────────────────────────

function genHUDWidgets(): GeneratedFile[] {
  const base = `Source/${M}/UI`;
  return [
    { path: `${base}/InsimulHUDWidget.h`,   content: loadStaticTemplate('source/ui/InsimulHUDWidget.h') },
    { path: `${base}/InsimulHUDWidget.cpp`, content: loadStaticTemplate('source/ui/InsimulHUDWidget.cpp') },
  ];
}

// ─────────────────────────────────────────────
// UI Classes (Main Menu)
// ─────────────────────────────────────────────

function genMenuClasses(ir: WorldIR): GeneratedFile[] {
  const base = `Source/${M}/UI`;
  const menu = ir.ui?.menuConfig;
  const title = menu?.mainMenu?.title ?? ir.meta.worldName;
  const bg = menu?.mainMenu?.backgroundImage ?? '';

  const gameModeTokens: TokenMap = {
    MENU_TITLE: title,
    MENU_BACKGROUND: bg,
  };

  return [
    { path: `${base}/InsimulMainMenuWidget.h`,      content: loadStaticTemplate('source/ui/InsimulMainMenuWidget.h') },
    { path: `${base}/InsimulMainMenuWidget.cpp`,    content: loadStaticTemplate('source/ui/InsimulMainMenuWidget.cpp') },
    { path: `${base}/InsimulMainMenuGameMode.h`,    content: loadTemplate('source/ui/InsimulMainMenuGameMode.h', gameModeTokens) },
    { path: `${base}/InsimulMainMenuGameMode.cpp`,  content: loadStaticTemplate('source/ui/InsimulMainMenuGameMode.cpp') },
  ];
}

// ─────────────────────────────────────────────
// Asset Setup Scripts
// ─────────────────────────────────────────────

function genAssetScripts(): GeneratedFile[] {
  return [
    { path: 'Scripts/ImportInsimulAssets.py', content: loadStaticTemplate('scripts/ImportInsimulAssets.py') },
    { path: 'Setup.bat',                      content: loadStaticTemplate('scripts/Setup.bat') },
    { path: 'setup.sh',                       content: loadStaticTemplate('scripts/setup.sh') },
    { path: 'Content/Data/ASSET_SETUP.md',    content: loadStaticTemplate('scripts/ASSET_SETUP.md') },
  ];
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateCppFiles(ir: WorldIR): GeneratedFile[] {
  return [
    ...genDataStructs(),
    ...genCoreClasses(ir),
    ...genCharacterClasses(ir),
    ...genSystemClasses(ir),
    ...genUIWidgets(ir),
    ...genServiceClasses(ir),
    ...genHUDWidgets(),
    ...genWorldGenerators(ir),
    ...genMenuClasses(ir),
    ...genAssetScripts(),
  ];
}
