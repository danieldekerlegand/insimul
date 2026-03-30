/**
 * BabylonGame - Main game class that encapsulates all game logic and state
 * This replaces the React hooks and state management in BabylonWorld.tsx
 *
 * This is a pure TypeScript class with no React dependencies.
 * BabylonWorld.tsx becomes a minimal wrapper that just creates this class.
 */

import {
  AbstractMesh,
  ArcRotateCamera,
  Camera,
  Color3,
  Color4,
  DirectionalLight,
  DynamicTexture,
  Effect,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  PointerEventTypes,
  PointerInfo,
  Ray,
  Scene,
  SceneLoader,
  ShaderMaterial,
  Skeleton,
  Sound,
  StandardMaterial,
  Texture,
  Tools,
  Vector3,
  Observer
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";

import { CharacterController } from "@shared/game-engine/rendering/CharacterController";
import { Action, ActionContext, ActionResult } from "@shared/game-engine/types";
import { ActionManager } from "@shared/game-engine/logic/actions/ActionManager";
import { TextureManager } from "@shared/game-engine/rendering/TextureManager";
import { AudioManager } from "@shared/game-engine/rendering/AudioManager";
import { CameraManager, CameraMode } from "@shared/game-engine/rendering/CameraManager";
import { BabylonGUIManager } from "@shared/game-engine/rendering/BabylonGUIManager";
import { BabylonChatPanel } from "@shared/game-engine/rendering/BabylonChatPanel";
import { BabylonQuestTracker } from "@shared/game-engine/rendering/BabylonQuestTracker";
import { BabylonRadialMenu } from "@shared/game-engine/rendering/BabylonRadialMenu";
import { ContextualActionMenu } from "@shared/game-engine/rendering/actions/ContextualActionMenu";
import { getAnimationForAction } from "@shared/game-engine/action-animation-map";
import { QuestRewardIntegration } from "@shared/game-engine/logic/QuestRewardIntegration";
import { resolveActions, resolveMenuOptions, type ActionResolverContext } from "@shared/game-engine/rendering/actions/ContextualActionResolver";
import { QuestObjectManager } from "@shared/game-engine/rendering/QuestObjectManager";
import { QuestHotspotManager } from "@shared/game-engine/rendering/QuestHotspotManager";
import { CONVERSATIONAL_GESTURES } from "@shared/game-engine/action-animation-map";
import { QuestIndicatorManager } from "@shared/game-engine/rendering/QuestIndicatorManager";
import { QuestWorldObjectLinker } from "@shared/game-engine/rendering/QuestWorldObjectLinker";
import { ListeningComprehensionManager } from "@shared/game-engine/rendering/ListeningComprehensionManager";
import { ProceduralBuildingGenerator, BuildingStyle } from "@shared/game-engine/rendering/ProceduralBuildingGenerator";
import { computeFoundationData } from "@shared/game-engine/rendering/TerrainFoundationRenderer";
import { ProceduralNatureGenerator, BiomeStyle } from "@shared/game-engine/rendering/ProceduralNatureGenerator";
import { AnimalNPCSystem } from "@shared/game-engine/rendering/AnimalNPCSystem";
import { ItemThumbnailRenderer } from "@shared/game-engine/rendering/ItemThumbnailRenderer";
import { RomanceSystem } from "@shared/game-engine/logic/RomanceSystem";
import { RoadGenerator } from "@shared/game-engine/rendering/RoadGenerator";
import { RiverGenerator } from "@shared/game-engine/rendering/RiverGenerator";
import { WaterRenderer } from "@shared/game-engine/rendering/WaterRenderer";
import { buildStreetNetwork } from "@shared/game-engine/logic/StreetNetworkLayout";
import { NPCScheduleSystem } from "@shared/game-engine/rendering/NPCScheduleSystem";
import { ScheduleExecutor } from "@shared/game-engine/rendering/ScheduleExecutor";
import { VolitionSystem, type NPCState as VolitionNPCState, type VolitionGoal, TERMINAL_ACTIONS } from "@shared/game-engine/logic/VolitionSystem";
import { WorldScaleManager, ScaledSettlement } from "@shared/game-engine/rendering/WorldScaleManager";
import { BuildingInfoDisplay } from "@shared/game-engine/rendering/BuildingInfoDisplay";
import { ChunkManager } from "@shared/game-engine/rendering/ChunkManager";
import { FullscreenMap } from "@shared/game-engine/rendering/FullscreenMap";
import { BabylonMinimap } from "@shared/game-engine/rendering/BabylonMinimap";
import { ExplorationDiscoverySystem, getDefaultHiddenLocations } from "@shared/game-engine/rendering/ExplorationDiscoverySystem";
import { renderWorldCanvas } from "@shared/game-engine/rendering/MinimapTerrainRenderer";
import { BabylonInventory, InventoryItem } from "@shared/game-engine/rendering/BabylonInventory";
import { TerrainRenderer } from "@shared/game-engine/rendering/TerrainRenderer";
import { BabylonShopPanel, ShopTransaction } from "@shared/game-engine/rendering/BabylonShopPanel";
import { BabylonContainerPanel, ContainerTransaction } from "@shared/game-engine/rendering/BabylonContainerPanel";
import { ContainerSpawnSystem } from "@shared/game-engine/rendering/ContainerSpawnSystem";
import { BabylonRulesPanel, Rule } from "@shared/game-engine/rendering/BabylonRulesPanel";
import { RuleEnforcer, RuleViolation } from "@shared/game-engine/rendering/RuleEnforcer";
import { CombatSystem, CombatStyle, DamageResult } from "@shared/game-engine/rendering/CombatSystem";
import { EquipmentManager } from "@shared/game-engine/logic/EquipmentManager";
import { RangedCombatSystem } from "@shared/game-engine/rendering/RangedCombatSystem";
import { FightingCombatSystem } from "@shared/game-engine/rendering/FightingCombatSystem";
import { TurnBasedCombatSystem } from "@shared/game-engine/rendering/TurnBasedCombatSystem";
import { GenreUIManager, GenreUIConfig } from "@shared/game-engine/rendering/GenreUIManager";
import { ResourceSystem } from "@shared/game-engine/rendering/ResourceSystem";
import { CraftingSystem } from "@shared/game-engine/logic/CraftingSystem";
import { BuildingPlacementSystem } from "@shared/game-engine/rendering/BuildingPlacementSystem";
import { SurvivalNeedsSystem } from "@shared/game-engine/systems/SurvivalNeedsSystem";
import { RunManager } from "@shared/game-engine/logic/RunManager";
import { ProceduralDungeonGenerator } from "@shared/game-engine/rendering/ProceduralDungeonGenerator";
import { getGenreConfig } from "@shared/game-genres/index";
import { HealthBar } from "@shared/game-engine/rendering/HealthBar";
import { CombatUI } from "@shared/game-engine/rendering/CombatUI";
import { VRManager } from "@shared/game-engine/rendering/VRManager";
import { VRUIPanel, VRHandMenu } from "@shared/game-engine/rendering/VRUIPanel";
import { VRInteractionManager } from "@shared/game-engine/rendering/VRInteractionManager";
import { resolveNPCModelFromCharacter } from "@shared/game-engine/logic/NPCModelManifest";
import { VRHUDManager } from "@shared/game-engine/rendering/VRHUDManager";
import { VRCombatAdapter } from "@shared/game-engine/rendering/VRCombatAdapter";
import { BabylonVocabularyPanel } from "@shared/game-engine/rendering/BabylonVocabularyPanel";
import { BuildingSignManager, BuildingSignData } from "@shared/game-engine/rendering/BuildingSignManager";
import { getResidenceSign, getBusinessSign } from "@shared/language/world-sign-provider";
import { LanguageGamificationTracker } from "@shared/game-engine/rendering/LanguageGamificationTracker";
import { QuestCompletionManager } from "@shared/game-engine/rendering/QuestCompletionManager";
import { QuestAutoCompletionDetector } from "@shared/game-engine/logic/QuestAutoCompletionDetector";
import { BabylonConversationHistoryPanel } from "@shared/game-engine/rendering/BabylonConversationHistoryPanel";
import { BabylonSkillTreePanel } from "@shared/game-engine/rendering/BabylonSkillTreePanel";
import { EnvironmentalAudioManager } from "@shared/game-engine/rendering/EnvironmentalAudioManager";
import { CulturalEventManager } from "@shared/game-engine/logic/CulturalEventManager";
import { BabylonNoticeBoardPanel, type NoticeArticle } from "@shared/game-engine/rendering/BabylonNoticeBoardPanel";
import { assessmentModalOpen } from "@shared/game-engine/rendering/AssessmentModalUI";
import { compositionModalOpen } from "@shared/game-engine/rendering/CompositionWritingUI";
import { SettlementNoticeBoard } from "@shared/game-engine/rendering/SettlementNoticeBoard";
import { createTownSquare } from "@shared/game-engine/rendering/TownSquareGenerator";
import { getCenterBlockBounds, getBlockCellSize } from "@shared/game-engine/rendering/StreetAlignedPlacement";
import { generateSettlementNotices, type NPCAuthorInfo } from "@shared/game-engine/logic/NoticeGenerator";
import { dbTextToNoticeArticle } from "@shared/game-engine/logic/GameTextTypes";
import { ContentGatingManager } from "@shared/game-engine/logic/ContentGatingManager";
import { generateQuestSuggestions, selectQuestForNPC } from "@shared/game-engine/logic/DynamicQuestBoard";
import { VRChatPanel } from "@shared/game-engine/rendering/VRChatPanel";
import { VRVocabularyLabels } from "@shared/game-engine/rendering/VRVocabularyLabels";
import { VRHandTrackingManager } from "@shared/game-engine/rendering/VRHandTrackingManager";
import {
  createDebugLabel,
  isDebugLabelsEnabled,
  setDebugLabelsEnabled,
  createDebugHoverTooltip,
  showDebugHoverTooltip,
  hideDebugHoverTooltip,
  disposeDebugHoverTooltip,
  applyDebugHighlight,
  clearDebugHighlight,
  buildDebugLabel,
} from "@shared/game-engine/rendering/DebugLabelUtils";
import { VRAccessibilityManager } from "@shared/game-engine/rendering/VRAccessibilityManager";
import { NPCTalkingIndicator } from "@shared/game-engine/rendering/NPCTalkingIndicator";
import { NPCAmbientConversationManager } from "@shared/game-engine/rendering/NPCAmbientConversationManager";
import { VehicleSystem } from "@shared/game-engine/rendering/VehicleSystem";
import { AmbientLifeBehaviorSystem, type NearbyBuildingInfo, type NearbyNPCInfo } from "@shared/game-engine/logic/AmbientLifeBehaviorSystem";
import { NPCActivityLabelSystem } from "@shared/game-engine/rendering/NPCActivityLabelSystem";
import { NPCInitiatedConversationController } from "@shared/game-engine/rendering/NPCInitiatedConversationController";
import { NPCSocializationController } from "@shared/game-engine/rendering/NPCSocializationController";
import type { SocializableNPC, ConversationResult } from "@shared/game-engine/rendering/NPCSocializationController";
import { generateLocalNpcConversation } from "@shared/game-engine/logic/LocalNpcConversation";
import { LocalAIClient } from "@/components/3DGame/LocalAIClient";
import { BuildingInteriorGenerator, InteriorLayout } from "@shared/game-engine/rendering/BuildingInteriorGenerator";
import { InteriorSceneManager, getInteriorModelPath } from "@shared/game-engine/rendering/InteriorSceneManager";
import { OutdoorFurnitureGenerator, getFurnitureSet, FURNITURE_ROLE_MAP, FURNITURE_SIZE_MAP, type OutdoorFurnitureType } from "@shared/game-engine/rendering/OutdoorFurnitureGenerator";
import { FurnitureModelLoader } from "@shared/game-engine/rendering/FurnitureModelLoader";
import { InteriorItemManager } from "@shared/game-engine/rendering/InteriorItemManager";
import { BookSpawnManager, type BookTextData } from "@shared/game-engine/rendering/BookSpawnManager";
import { DocumentReadingPanel, type ReadableDocument } from "@shared/game-engine/rendering/DocumentReadingPanel";
import { TextSpawner, type CollectibleTextData } from "@shared/game-engine/rendering/TextSpawner";
import { ExteriorItemManager } from "@shared/game-engine/rendering/ExteriorItemManager";
import { GameMenuSystem, GameMenuCallbacks, SaveSlotInfo, type MenuJournalData, type MenuClueData } from "@shared/game-engine/rendering/GameMenuSystem";
import { ClueStore } from "@shared/game-engine/logic/ClueStore";
import { NarrativeCutscenePanel, NarrativeBeatDispatcher } from "@shared/game-engine/rendering/NarrativeCutscenePanel";
import type { PendingNarrativeBeat } from "@shared/quest/main-quest-chapters";
import { MainMenuScreen, type PlaythroughInfo } from "@shared/game-engine/rendering/MainMenuScreen";
import { WorldStateManager, type GameStateSource, type GameStateTarget } from "@/components/3DGame/WorldStateManager";
import { SaveIndicator } from "@shared/game-engine/rendering/SaveIndicator";
import { DataSource, ApiDataSource, createDataSource, type GenerationJobSummary } from "@/components/3DGame/DataSource";
import { PlaythroughQuestOverlay } from "@shared/game-engine/logic/PlaythroughQuestOverlay";
import { RelationshipManager } from "@shared/game-engine/logic/RelationshipManager";
import { SettlementSceneManager, SettlementZone } from "@shared/game-engine/rendering/SettlementSceneManager";
import { GamePrologEngine } from "@shared/game-engine/logic/GamePrologEngine";
import { GameEventBus, type ItemAcquisitionSource } from "@shared/game-engine/logic/GameEventBus";
import { GameTimeManager } from "@shared/game-engine/logic/GameTimeManager";
import { WeatherSystem } from "@shared/game-engine/rendering/WeatherSystem";
import { DayNightCycle } from "@shared/game-engine/rendering/DayNightCycle";
import { BuildingCollisionSystem } from "@shared/game-engine/rendering/BuildingCollisionSystem";
import { BuildingEntrySystem } from "@shared/game-engine/rendering/BuildingEntrySystem";
import { InteriorNPCManager } from "@shared/game-engine/rendering/InteriorNPCManager";
import { NPCBusinessInteractionSystem, type BusinessInteraction, type ServiceResult } from "@shared/game-engine/rendering/NPCBusinessInteractionSystem";
import { BusinessBehaviorSystem } from "@shared/game-engine/logic/BusinessBehaviorSystem";
import { BusinessPopulationManager } from "@shared/game-engine/rendering/BusinessPopulationManager";
import { NPCSimulationLOD } from "@shared/game-engine/rendering/NPCSimulationLOD";
import { generateNPCAppearance, generateBillboardColor, blendWithRoleTint, getClothingColorForMesh, type NPCAppearance } from "@shared/game-engine/rendering/NPCAppearanceGenerator";
import { NPCAccessorySystem } from "@shared/game-engine/rendering/NPCAccessorySystem";
import { InteractionPromptSystem } from "@shared/game-engine/rendering/InteractionPromptSystem";
import { FurnitureInteractionManager } from "@shared/game-engine/rendering/FurnitureInteractionManager";
import { PlayerActionSystem } from "@shared/game-engine/rendering/PlayerActionSystem";
import { ResidenceActivitySystem, type BedSleepData } from "@shared/game-engine/logic/ResidenceActivitySystem";
import { FishingSystem } from "@shared/game-engine/logic/FishingSystem";
import { WorldObjectActionManager } from "@shared/game-engine/logic/WorldObjectActionManager";
import { NPCModelInstancer } from "@shared/game-engine/rendering/NPCModelInstancer";
import { NPCModularAssembler, deriveBodyType as deriveModularBodyType } from "@shared/game-engine/rendering/NPCModularAssembler";
import { QuaterniusNPCLoader, normalizeToQuaterniusGender, selectQuaterniusConfig, isCompleteCharacterModel } from "@shared/game-engine/rendering/QuaterniusNPCLoader";
import { selectNPCModel, type NPCGender } from "@shared/game-engine/logic/NPCModelVariety";
import { QuestOfferPanel } from "@shared/game-engine/rendering/QuestOfferPanel";
import type { QuestOfferData } from "@shared/game-engine/rendering/QuestOfferPanel";
import { QuestNotificationManager } from "@shared/game-engine/rendering/QuestNotificationManager";
import { ReputationManager } from "@shared/game-engine/rendering/ReputationManager";
import { QuestLanguageFeedbackTracker } from "@shared/language/quest-language-feedback";
import { LanguageProgressTracker } from "@shared/game-engine/logic/LanguageProgressTracker";
import { extractObjectiveMarkers } from "@shared/game-engine/logic/QuestMinimapMarkers";
import {
  isFirstPlaythrough,
  isLanguageLearningWorld,
  getTargetLanguage,
  getItemTranslation,
  launchOnboarding,
} from "@shared/game-engine/rendering/OnboardingLauncher";
import {
  isArrivalAssessmentQuest,
  markPhaseObjectiveComplete,
  computeProgress,
} from "@shared/services/assessment-quest-bridge-shared";
import type { OnboardingLaunchResult } from "@shared/game-engine/rendering/OnboardingLauncher";
import {
  KEY_BUILDING_INTERACT,
  KEY_ATTACK,
  KEY_TARGET_ENEMY,
  KEY_TOGGLE_VR,
  KEY_GAME_MENU,
  KEY_FULLSCREEN_MAP,
  KEY_PUSH_TO_TALK,
  KEY_EXAMINE_OBJECT,
  KEY_EAVESDROP,
  KEY_QUICK_SAVE,
  KEY_QUICK_LOAD,
  KEY_CAMERA_MODE,
  KEY_PHOTO_BOOK,
  KEY_CYCLE_VEHICLE,
  KEY_PHYSICAL_ACTION,
} from "@shared/game-engine/logic/KeyboardMap";
import { BabylonPhotographySystem, type SceneObject } from "@shared/game-engine/rendering/BabylonPhotographySystem";
import { BabylonPhotoBookPanel } from "@shared/game-engine/rendering/BabylonPhotoBookPanel";
import type { VisualAsset } from "@shared/schema";
import {
  PLAYER_MODEL_URL,
  NPC_DEFAULT_MODEL_URL,
  FOOTSTEP_SOUND_URL,
  GROUND_DIFFUSE_URL,
  GROUND_NORMAL_URL,
  GROUND_HEIGHTMAP_URL,
} from "@shared/asset-paths";

// Constants
const NPC_MODEL_URL = NPC_DEFAULT_MODEL_URL;
const MAX_NPCS = 100;
const MAX_VISIBLE_NPCS = 20;
const MAX_WANDER_RAYCASTS_PER_TICK = 3;
const NPC_BATCH_BUDGET_MS = 2;
const MAX_SETTLEMENTS_3D = 16;
const DEFAULT_PLAYER_ID = "player";
const INITIAL_ENERGY = 100;

// Types
type SceneStatus = "idle" | "loading" | "ready" | "error";
type NPCState = 'idle' | 'fleeing' | 'pursuing' | 'alert' | 'returning';
type NPCRole =
  | 'civilian' | 'guard' | 'soldier' | 'merchant' | 'questgiver'
  | 'farmer' | 'blacksmith' | 'innkeeper' | 'priest' | 'teacher'
  | 'doctor' | 'child' | 'elder' | 'noble' | 'beggar' | 'sailor';

interface WorldCharacter {
  id: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  occupation?: string;
  faction?: string;
  disposition?: string;
  gender?: string;
  physicalTraits?: string[];
}

interface QuestSummary {
  id: string;
  name?: string;
  giverCharacterId?: string;
  status?: string;
}

interface SettlementSummary {
  id: string;
  name: string;
  settlementType?: string;
  terrain?: string;
  population?: number;
  streets?: any; // StreetNetwork (graph) or Location[] (legacy)
}

interface WorldData {
  characters: WorldCharacter[];
  actions: Action[];
  baseActions: Action[];
  quests: QuestSummary[];
  settlements: SettlementSummary[];
  rules: any[];
  baseRules: any[];
  countries: any[];
}

interface NPCDisplayInfo {
  id: string;
  name: string;
  occupation?: string;
  disposition?: string;
  questGiver: boolean;
  position: { x: number; z: number };
}

interface NPCInstance {
  mesh: Mesh;
  controller?: CharacterController | null;
  questMarker?: Mesh | null;
  state: NPCState;
  role: NPCRole;
  homePosition?: Vector3;
  stateExpiry?: number;
  fleeTarget?: Vector3;
  pursuitTarget?: Vector3;
  disposition: number;
  characterData?: any;
  // AI wandering
  wanderTarget?: Vector3;
  wanderWaitUntil?: number;
  isInConversation?: boolean;
  preConversationPosition?: Vector3;
  // Animation tracking
  animationGroups?: any[];
  currentAnimation?: any;
  // Phase 7: per-NPC throttling
  lastAIUpdate?: number;
  blendingDisabled?: boolean;
  // Phase 4: NPC billboard LOD
  billboardLOD?: Mesh;
  isBillboardMode?: boolean;
  // Stuck detection for wandering
  lastWanderPosition?: Vector3;
  stuckTicks?: number;
  // Schedule-driven movement
  schedulePathWaypoints?: Vector3[];
  schedulePathIndex?: number;
  scheduleGoalExpiry?: number;
  isInsideBuilding?: boolean;
  insideBuildingId?: string;
  // Building exit fade-in
  fadeInProgress?: number; // 0..1, undefined = not fading
  // Volition-driven spontaneous behavior
  volitionGoalId?: string;
  volitionActionId?: string;
  volitionTargetNpcId?: string;
  // Escort quest — NPC follows the player
  isBeingEscorted?: boolean;
  // Ambient life behavior — current animation override
  ambientActivityAnimation?: string;
  // Debug
  _debugLogged?: boolean;
}

interface WorldVisualTheme {
  groundColor: Color3;
  skyColor: Color3;
  roadColor: Color3;
  roadRadius: number;
  settlementBaseColor: Color3;
  settlementRoofColor: Color3;
}

interface BabylonGameConfig {
  worldId: string;
  worldName: string;
  worldType?: string;
  userId?: string;
  authToken?: string;
  playthroughId?: string;
  onBack?: () => void;
  dataSource?: DataSource;
  /** API server URL for cloud saves in standalone/Electron mode (e.g., 'http://localhost:8080') */
  apiUrl?: string;
}

function computeWorldVisualTheme(worldType?: string): WorldVisualTheme {
  const type = (worldType || "").toLowerCase();

  if (type.includes("cyberpunk") || type.includes("sci-fi") || type.includes("space")) {
    return {
      groundColor: new Color3(0.12, 0.12, 0.16),
      skyColor: new Color3(0.05, 0.08, 0.16),
      roadColor: new Color3(0.18, 0.2, 0.32),
      roadRadius: 1.4,
      settlementBaseColor: new Color3(0.25, 0.4, 0.7),
      settlementRoofColor: new Color3(0.5, 0.2, 0.7)
    };
  }

  if (type.includes("post-apocalyptic") || type.includes("wild-west")) {
    return {
      groundColor: new Color3(0.6, 0.54, 0.4),
      skyColor: new Color3(0.78, 0.7, 0.55),
      roadColor: new Color3(0.45, 0.36, 0.26),
      roadRadius: 1.3,
      settlementBaseColor: new Color3(0.55, 0.4, 0.25),
      settlementRoofColor: new Color3(0.3, 0.18, 0.12)
    };
  }

  if (type.includes("solarpunk")) {
    return {
      groundColor: new Color3(0.35, 0.6, 0.35),
      skyColor: new Color3(0.55, 0.8, 0.95),
      roadColor: new Color3(0.5, 0.6, 0.5),
      roadRadius: 1.1,
      settlementBaseColor: new Color3(0.45, 0.7, 0.5),
      settlementRoofColor: new Color3(0.7, 0.85, 0.6)
    };
  }

  if (
    type.includes("medieval") ||
    type.includes("fantasy") ||
    type.includes("historical") ||
    type.includes("mythological")
  ) {
    return {
      groundColor: new Color3(0.45, 0.7, 0.38),
      skyColor: new Color3(0.4, 0.6, 0.9),
      roadColor: new Color3(0.38, 0.3, 0.22),
      roadRadius: 1.2,
      settlementBaseColor: new Color3(0.7, 0.55, 0.35),
      settlementRoofColor: new Color3(0.4, 0.2, 0.15)
    };
  }

  if (
    type.includes("modern") ||
    type.includes("superhero") ||
    type.includes("urban-fantasy")
  ) {
    return {
      groundColor: new Color3(0.3, 0.55, 0.38),
      skyColor: new Color3(0.5, 0.7, 0.95),
      roadColor: new Color3(0.2, 0.22, 0.28),
      roadRadius: 1.3,
      settlementBaseColor: new Color3(0.6, 0.6, 0.65),
      settlementRoofColor: new Color3(0.25, 0.25, 0.3)
    };
  }

  return {
    groundColor: new Color3(0.9, 0.6, 0.4),
    skyColor: new Color3(0.4, 0.6, 0.9),
    roadColor: new Color3(0.35, 0.28, 0.2),
    roadRadius: 1.2,
    settlementBaseColor: new Color3(0.8, 0.55, 0.35),
    settlementRoofColor: new Color3(0.4, 0.2, 0.15)
  };
}

/**
 * Main game class - pure TypeScript, no React
 */
export class BabylonGame {
  // Configuration
  private config: BabylonGameConfig;
  private canvas: HTMLCanvasElement;
  private dataSource: DataSource;

  // Core Babylon.js objects
  private engine: Engine | null = null;
  private scene: Scene | null = null;
  private camera: ArcRotateCamera | null = null;

  // Game systems
  private actionManager: ActionManager | null = null;
  private textureManager: TextureManager | null = null;
  private audioManager: AudioManager | null = null;
  private cameraManager: CameraManager | null = null;
  private guiManager: BabylonGUIManager | null = null;
  private chatPanel: BabylonChatPanel | null = null;
  private questTracker: BabylonQuestTracker | null = null;
  private radialMenu: BabylonRadialMenu | null = null;
  private contextualActionMenu: ContextualActionMenu | null = null;
  private questObjectManager: QuestObjectManager | null = null;
  private questHotspotManager: QuestHotspotManager | null = null;
  private questIndicatorManager: QuestIndicatorManager | null = null;
  private questOfferPanel: QuestOfferPanel | null = null;
  /** Set to true when opening chat after accepting from the QuestOfferPanel to avoid re-showing the offer */
  private skipQuestOfferOnce = false;
  private questWorldObjectLinker: QuestWorldObjectLinker | null = null;
  private questNotificationManager: QuestNotificationManager | null = null;
  private questLanguageFeedbackTracker: QuestLanguageFeedbackTracker | null = null;
  private listeningComprehensionManager: ListeningComprehensionManager | null = null;
  private buildingGenerator: ProceduralBuildingGenerator | null = null;
  private natureGenerator: ProceduralNatureGenerator | null = null;
  private animalNPCSystem: AnimalNPCSystem | null = null;
  private roadGenerator: RoadGenerator | null = null;
  private riverGenerator: RiverGenerator | null = null;
  private waterRenderer: WaterRenderer | null = null;
  private worldScaleManager: WorldScaleManager | null = null;
  private buildingInfoDisplay: BuildingInfoDisplay | null = null;
  private minimap: BabylonMinimap | null = null;
  private fullscreenMap: FullscreenMap | null = null;
  private inventory: BabylonInventory | null = null;
  private shopPanel: BabylonShopPanel | null = null;
  private containerPanel: BabylonContainerPanel | null = null;
  private containerSpawnSystem: ContainerSpawnSystem | null = null;
  private rulesPanel: BabylonRulesPanel | null = null;
  private vocabularyPanel: BabylonVocabularyPanel | null = null;
  private conversationHistoryPanel: BabylonConversationHistoryPanel | null = null;
  private skillTreePanel: BabylonSkillTreePanel | null = null;
  private buildingSignManager: BuildingSignManager | null = null;
  private gamificationTracker: LanguageGamificationTracker | null = null;
  private questRewardIntegration: QuestRewardIntegration | null = null;
  private questCompletionManager: QuestCompletionManager | null = null;
  private questAutoCompletionDetector: QuestAutoCompletionDetector | null = null;
  private environmentalAudio: EnvironmentalAudioManager | null = null;
  private culturalEventManager: CulturalEventManager | null = null;
  private noticeBoardPanel: BabylonNoticeBoardPanel | null = null;
  private settlementNoticeBoard: SettlementNoticeBoard | null = null;
  private contentGatingManager: ContentGatingManager | null = null;
  private photographySystem: BabylonPhotographySystem | null = null;
  private explorationDiscovery: ExplorationDiscoverySystem | null = null;
  private photoBookPanel: BabylonPhotoBookPanel | null = null;
  private ruleEnforcer: RuleEnforcer | null = null;
  private prologEngine: GamePrologEngine | null = null;
  private eventBus: GameEventBus = new GameEventBus();
  private gameTimeManager: GameTimeManager = new GameTimeManager();
  private weatherSystem: WeatherSystem | null = null;
  private dayNightCycle: DayNightCycle | null = null;
  private combatSystem: CombatSystem | null = null;
  private romanceSystem: RomanceSystem | null = null;
  private equipmentManager: EquipmentManager | null = null;
  private rangedCombat: RangedCombatSystem | null = null;
  private fightingCombat: FightingCombatSystem | null = null;
  private turnBasedCombat: TurnBasedCombatSystem | null = null;
  private genreUI: GenreUIManager | null = null;
  private resourceSystem: ResourceSystem | null = null;
  private craftingSystem: CraftingSystem | null = null;
  private buildingSystem: BuildingPlacementSystem | null = null;
  private survivalNeeds: SurvivalNeedsSystem | null = null;
  private runManager: RunManager | null = null;
  private dungeonGenerator: ProceduralDungeonGenerator | null = null;
  private combatUI: CombatUI | null = null;
  private npcTalkingIndicator: NPCTalkingIndicator | null = null;
  private ambientConversationManager: NPCAmbientConversationManager | null = null;
  private socializationController: NPCSocializationController | null = null;
  private vehicleSystem: VehicleSystem | null = null;
  private npcInitiatedConversationController: NPCInitiatedConversationController | null = null;
  private vrManager: VRManager | null = null;
  private gameMenuSystem: GameMenuSystem | null = null;
  private mainMenuScreen: MainMenuScreen | null = null;
  private worldStateManager: WorldStateManager | null = null;
  private saveIndicator: SaveIndicator | null = null;

  // Onboarding / assessment
  private onboardingResult: OnboardingLaunchResult | null = null;
  private onboardingActive: boolean = false;
  private assessmentActive: boolean = false;
  /** NPC ID highlighted for the current assessment conversation phase. */
  private _assessmentTargetNpcId: string | null = null;

  // Player
  private playerController: CharacterController | null = null;
  private playerMesh: Mesh | null = null;
  private playerHealthBar: HealthBar | null = null;
  private playerEnergy: number = INITIAL_ENERGY;
  private playerGold: number = 100;
  private playerHealth: number = 100;
  private playerCefrLevel: string | null = null;
  private mainQuestJournalData: MenuJournalData | null = null;
  private portfolioData: import('@shared/quest/portfolio-types').PortfolioData | null = null;
  private clueStore: ClueStore | null = null;
  private cutscenePanel: NarrativeCutscenePanel | null = null;
  private narrativeBeatDispatcher: NarrativeBeatDispatcher | null = null;

  // NPCs
  private npcMeshes: Map<string, NPCInstance> = new Map();
  private npcInfos: NPCDisplayInfo[] = [];
  private npcHealthBars: Map<string, HealthBar> = new Map();
  private selectedNPCId: string | null = null;
  private conversationNPCId: string | null = null;
  private preConversationCameraMode: CameraMode | null = null;
  private prePhotoCameraMode: CameraMode | null = null;
  // NPC model instancer: caches templates, clones for subsequent NPCs, shared materials
  private npcModelInstancer: NPCModelInstancer | null = null;
  // NPC modular assembler: builds NPCs from procedural body-part meshes
  private npcModularAssembler: NPCModularAssembler | null = null;
  // Quaternius NPC loader: composite body+hair+outfit from Quaternius assets
  private quaterniusNPCLoader: QuaterniusNPCLoader | null = null;

  // Settlements and world
  private settlementMeshes: Map<string, Mesh> = new Map();
  private settlementRoadMeshes: Mesh[] = [];
  private zoneBoundaryMeshes: Map<string, { boundary: Mesh | null; particles?: ParticleSystem | null; zoneRadius?: number; zoneColor?: Color3 }> = new Map();
  private buildingData: Map<string, {
    position: Vector3; metadata: any; mesh: Mesh;
    width: number; depth: number; rotation: number;
    hasPorch?: boolean; porchDepth?: number; porchSteps?: number;
  }> = new Map();
  /** Building footprints for point-in-building checks (NPC spawn/wander validation). */
  private buildingFootprints: Array<{ cx: number; cz: number; halfW: number; halfD: number; cos: number; sin: number }> = [];
  private buildingCollisionSystem: BuildingCollisionSystem | null = null;
  private settlementStats: Map<string, {
    id: string;
    name: string;
    type: string;
    population: number;
    businesses: number;
    residences: number;
    lots: number;
    buildingCount: number;
    terrain?: string;
  }> = new Map();
  // Phase 8: Settlement scene isolation
  private settlementSceneManager: SettlementSceneManager | null = null;

  // Game state
  private sceneStatus: SceneStatus = "idle";
  
  // Game data
  private worldData: WorldData | null = null;
  private characters: any[] = [];
  private actions: any[] = [];
  private quests: any[] = [];
  private settlements: any[] = [];
  private rules: any[] = [];
  private countries: any[] = [];
  private states: any[] = [];
  private baseResources: any = {};
  private assets: any[] = [];
  private config3D: any = {};
  private worldItems: any[] = [];
  private terrainSize: number = 512;
  private terrainRenderer: TerrainRenderer = new TerrainRenderer();
  private actionInProgress: boolean = false;
  private isInCombat: boolean = false;
  private isVRMode: boolean = false;
  private vrSupported: boolean = false;
  private combatTargetId: string | null = null;
  private firstSettlementSpawnPosition: Vector3 | null = null;

  // Zone system
  private currentZone: { id: string; name: string; type: string } | null = null;
  private playthroughId: string | null = null;
  private languageProgressTracker: LanguageProgressTracker | null = null;
  private titleScreen: MainMenuScreen | null = null;
  /** Secondary API-based data source for cloud saves (used when signed in from standalone mode). */
  private cloudDataSource: ApiDataSource | null = null;
  private questOverlay: PlaythroughQuestOverlay = new PlaythroughQuestOverlay();
  private relationshipManager: RelationshipManager | null = null;
  private currentReputation: any | null = null;
  private reputationManager: ReputationManager | null = null;

  // Reading progress persistence
  private readingProgressAnsweredIds: Set<string> = new Set();
  private readingProgressQuizAnswers: Array<{ articleId: string; selectedIndex: number; correctIndex: number; correct: boolean; answeredAt: number }> = [];
  private readingProgressDirty = false;
  private readingProgressSyncTimer: ReturnType<typeof setTimeout> | null = null;

  // VR
  private vrUIPanels: Map<string, VRUIPanel> = new Map();
  private vrInteraction: VRInteractionManager | null = null;
  private vrHUD: VRHUDManager | null = null;
  private vrHandMenu: VRHandMenu | null = null;
  private vrCombatAdapter: VRCombatAdapter | null = null;
  private vrChatPanel: VRChatPanel | null = null;
  private vrVocabLabels: VRVocabularyLabels | null = null;
  private vrHandTracking: VRHandTrackingManager | null = null;
  private vrAccessibility: VRAccessibilityManager | null = null;

  // Textures
  private availableTextures: VisualAsset[] = [];
  private selectedGroundTexture: string | null = null;
  private selectedWallTexture: string | null = null;
  private selectedRoadTexture: string | null = null;

  // World-level 3D model configuration
  private world3DConfig: {
    buildingModels?: Record<string, string>;
    natureModels?: Record<string, string>;
    characterModels?: Record<string, string>;
    objectModels?: Record<string, string>;
    groundTextureId?: string;
    roadTextureId?: string;
    wallTextureId?: string;
    roofTextureId?: string;
    playerModels?: Record<string, string>;
    questObjectModels?: Record<string, string>;
    audioAssets?: Record<string, string>;
    modelScaling?: Record<string, { x: number; y: number; z: number }>;
    proceduralBuildings?: import('@shared/game-engine/types').ProceduralBuildingConfig | null;
    buildingTypeConfigs?: Record<string, { interiorConfig?: import('@shared/game-engine/types').InteriorTemplateConfig }>;
  } | null = null;
  private worldAssets: VisualAsset[] = [];

  // Prop/object model templates loaded from world3DConfig.objectModels
  private objectModelTemplates: Map<string, Mesh> = new Map();
  private objectModelOriginalHeights: Map<string, number> = new Map();
  private objectModelScaleHints: Map<string, number> = new Map();
  private itemThumbnailRenderer: ItemThumbnailRenderer | null = null;
  private worldPropMeshes: Mesh[] = [];

  // Shared material cache for furniture props (avoids duplicate materials)
  private furnitureMaterialCache: Map<string, StandardMaterial> = new Map();
  private outdoorFurnitureGenerator: OutdoorFurnitureGenerator | null = null;

  // Audio
  private zoneEnterSound: Sound | null = null;
  private zoneExitSound: Sound | null = null;
  private violationSound: Sound | null = null;

  // Theme
  private worldTheme: WorldVisualTheme;

  // Spatial chunk system for distance culling
  private chunkManager: ChunkManager | null = null;

  // Phase 4: Building interiors
  private interiorSceneManager: InteriorSceneManager | null = null;
  private interiorGenerator: BuildingInteriorGenerator | null = null;
  private furnitureModelLoader: FurnitureModelLoader | null = null;
  private activeInterior: InteriorLayout | null = null;
  private activeBuildingId: string | null = null;
  private interiorCamera: ArcRotateCamera | null = null;
  private interiorPlayerMesh: Mesh | null = null;
  private interiorPlayerController: CharacterController | null = null;
  private savedOverworldPosition: Vector3 | null = null;
  private savedOverworldRotationY: number = 0;
  private savedOverworldCameraAlpha: number = 0;
  private isInsideBuilding: boolean = false;
  private interiorDoorTrigger: Mesh | null = null;
  private interiorItemManager: InteriorItemManager | null = null;
  private bookSpawnManager: BookSpawnManager | null = null;
  private worldTextCache: BookTextData[] = [];
  private documentReadingPanel: DocumentReadingPanel | null = null;
  private textSpawner: TextSpawner | null = null;
  private fullTextCache: ReadableDocument[] = [];
  private exteriorItemManager: ExteriorItemManager | null = null;
  private buildingEntrySystem: BuildingEntrySystem | null = null;
  private interiorNPCManager: InteriorNPCManager | null = null;
  private businessInteractionSystem: NPCBusinessInteractionSystem = new NPCBusinessInteractionSystem();
  private currentBuildingBusinessType: string | undefined = undefined;
  private businessBehaviorSystem: BusinessBehaviorSystem | null = null;
  private businessPopulationManager: BusinessPopulationManager = new BusinessPopulationManager();

  // NPC Simulation LOD
  private npcSimulationLOD: NPCSimulationLOD | null = null;

  // NPC Accessory & Occupation-Visual System
  private npcAccessorySystem: NPCAccessorySystem | null = null;

  // Unified interaction prompt — world-space billboard for all interactables
  private interactionPrompt: InteractionPromptSystem | null = null;

  // Furniture interaction manager — chairs, beds, bookshelves, workstations
  private furnitureInteractionManager: FurnitureInteractionManager | null = null;
  private playerActionSystem: PlayerActionSystem | null = null;
  private fishingSystem: FishingSystem | null = null;

  // World Object Action Manager — wires identify/examine/point-and-name/read-sign to world objects
  private worldObjectActionManager: WorldObjectActionManager | null = null;

  // NPC Schedule System — sidewalk pathfinding and goal-directed behavior
  private npcScheduleSystem: NPCScheduleSystem = new NPCScheduleSystem();
  private ambientLifeSystem: AmbientLifeBehaviorSystem = new AmbientLifeBehaviorSystem();
  private npcActivityLabelSystem: NPCActivityLabelSystem | null = null;
  /** Unified NPC routine manager — replaces NPCLocationCycler */
  private scheduleExecutor!: ScheduleExecutor;
  private residenceActivitySystem: ResidenceActivitySystem | null = null;

  // Volition System — Ensemble-style spontaneous NPC goal formation
  private volitionSystem: VolitionSystem = new VolitionSystem({
    emit: (eventName: string, data: any) => {
      this.eventBus.emit({ type: eventName, ...data } as any);
    }
  });
  private _volitionTimestep = 0;

  // Eavesdrop state
  private isEavesdropping: boolean = false;
  private eavesdropNPC2Id: string | undefined;

  // Observers (for cleanup)
  private keyboardHandler: ((event: KeyboardEvent) => void) | null = null;
  private keyUpHandler: ((event: KeyboardEvent) => void) | null = null;
  private resizeHandler: (() => void) | null = null;
  private pointerObserver: Observer<PointerInfo> | null = null;
  private debugHoverObserver: Observer<PointerInfo> | null = null;
  private renderObserver: Observer<Scene> | null = null;
  private npcBehaviorInterval: number | null = null;
  // Phase 7: batched NPC update state
  private _npcBehaviorObserver: Observer<Scene> | null = null;
  private _npcBatchIndex = 0;
  private _npcBehaviorAccum = 0;
  private _wanderRaycastsThisTick = 0;

  private updatePlayerStatusUI(status: string = "Ready"): void {
    if (!this.guiManager) return;

    this.guiManager.updatePlayerStatus({
      energy: this.playerEnergy,
      maxEnergy: INITIAL_ENERGY,
      status,
      gold: this.playerGold
    });
  }

  private getZoneTypeForSettlement(type: string): string {
    const t = (type || "").toLowerCase();
    if (t === "city") return "neutral";
    if (t === "village") return "caution";
    return "safe";
  }

  constructor(canvas: HTMLCanvasElement, config: BabylonGameConfig) {
    this.canvas = canvas;
    this.config = config;
    this.dataSource = config.dataSource || createDataSource(config.authToken);
    this.worldTheme = computeWorldVisualTheme(config.worldType);
    // ScheduleExecutor is created after eventBus is available (in init)
  }

  /**
   * Initialize the game - call this after construction
   */
  // Loading screen overlay
  private _loadingOverlay: HTMLDivElement | null = null;
  private _loadingText: HTMLDivElement | null = null;
  private _loadingBar: HTMLDivElement | null = null;
  private _aiStatusText: HTMLDivElement | null = null;
  private _aiStatusPollTimer: ReturnType<typeof setInterval> | null = null;

  private showLoadingScreen(): void {
    // Ensure the canvas parent is a positioning context so the overlay covers it exactly
    const parent = this.canvas.parentElement;
    if (parent && !parent.style.position) {
      parent.style.position = 'relative';
    }

    this._loadingOverlay = document.createElement('div');
    this._loadingOverlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10000;pointer-events:auto;';

    this._loadingText = document.createElement('div');
    this._loadingText.style.cssText = 'color:#ccc;font:16px sans-serif;margin-bottom:16px;';
    this._loadingText.textContent = 'Loading world...';

    const barContainer = document.createElement('div');
    barContainer.style.cssText = 'width:280px;height:6px;background:#333;border-radius:3px;overflow:hidden;';

    this._loadingBar = document.createElement('div');
    this._loadingBar.style.cssText = 'width:0%;height:100%;background:#4a9;border-radius:3px;transition:width 0.2s;';

    this._aiStatusText = document.createElement('div');
    this._aiStatusText.style.cssText = 'color:#8b8;font:12px sans-serif;margin-top:12px;min-height:16px;opacity:0;transition:opacity 0.3s;';

    barContainer.appendChild(this._loadingBar);
    this._loadingOverlay.appendChild(this._loadingText);
    this._loadingOverlay.appendChild(barContainer);
    this._loadingOverlay.appendChild(this._aiStatusText);
    parent?.appendChild(this._loadingOverlay);
  }

  private updateLoadingScreen(step: string, progress: number): void {
    if (this._loadingText) this._loadingText.textContent = step;
    if (this._loadingBar) this._loadingBar.style.width = `${Math.min(100, progress)}%`;
  }

  /** Format AI generation jobs into a human-readable status string. */
  private formatAIStatus(jobs: GenerationJobSummary[]): string {
    if (jobs.length === 0) return '';
    const processing = jobs.filter((j) => j.status === 'processing');
    const queued = jobs.filter((j) => j.status === 'queued');
    const parts: string[] = [];
    if (processing.length > 0) {
      const totalCompleted = processing.reduce((s, j) => s + j.completedCount, 0);
      const totalItems = processing.reduce((s, j) => s + j.batchSize, 0);
      const types = Array.from(new Set(processing.map((j) => j.assetType).filter(Boolean)));
      const typeLabel = types.length > 0 ? types.join(', ') : 'assets';
      parts.push(`AI generating ${typeLabel}: ${totalCompleted}/${totalItems}`);
    }
    if (queued.length > 0) {
      parts.push(`${queued.length} queued`);
    }
    return parts.join(' · ');
  }

  /** Start polling AI generation job status during loading. */
  private startAIStatusPolling(): void {
    this.stopAIStatusPolling();
    // Do an immediate check, then poll every 3 seconds
    this.pollAIStatus();
    this._aiStatusPollTimer = setInterval(() => this.pollAIStatus(), 3000);
  }

  private async pollAIStatus(): Promise<void> {
    try {
      const jobs = await this.dataSource.loadGenerationJobs(this.config.worldId);
      const statusText = this.formatAIStatus(jobs);
      if (this._aiStatusText) {
        this._aiStatusText.textContent = statusText;
        this._aiStatusText.style.opacity = statusText ? '1' : '0';
      }
    } catch {
      // Silently ignore polling errors
    }
  }

  private stopAIStatusPolling(): void {
    if (this._aiStatusPollTimer) {
      clearInterval(this._aiStatusPollTimer);
      this._aiStatusPollTimer = null;
    }
  }

  private hideLoadingScreen(): void {
    this.stopAIStatusPolling();
    if (this._loadingOverlay) {
      this._loadingOverlay.style.transition = 'opacity 0.4s';
      this._loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        this._loadingOverlay?.remove();
        this._loadingOverlay = null;
        this._loadingText = null;
        this._loadingBar = null;
        this._aiStatusText = null;
      }, 400);
    }
  }

  public async init(): Promise<void> {
    try {
      this.showLoadingScreen();

      this.updateLoadingScreen('Initializing engine...', 5);
      await this.initializeEngine();
      this.updateLoadingScreen('Setting up scene...', 10);
      await this.initializeScene();
      this.updateLoadingScreen('Initializing systems...', 15);
      await this.initializeSystems();

      // Start a minimal render loop so the engine can process GPU uploads
      // during asset loading. The full game loop replaces this after init.
      this.engine!.runRenderLoop(() => {
        this.scene?.render();
      });

      // If no playthroughId was provided, show the playthrough selection menu
      if (!this.config.playthroughId) {
        // Try to restore a previous cloud session from localStorage
        await this.tryRestoreCloudSession();

        this.hideLoadingScreen();
        // Also hide the outer HTML loading screen so the canvas-based menu is visible
        const htmlLoadingScreen = document.getElementById('loadingScreen');
        if (htmlLoadingScreen) htmlLoadingScreen.classList.add('hidden');
        const selectedId = await this.showPlaythroughSelectionMenu();
        if (!selectedId) return; // User went back
        this.config.playthroughId = selectedId;
        this.showLoadingScreen();
      }

      this.updateLoadingScreen('Loading world data...', 20);
      await this.loadWorldData();
      // Start polling AI generation status in the background
      this.startAIStatusPolling();
      this.updateLoadingScreen('Generating world...', 30);
      await this.generateProceduralWorld();
      this.updateLoadingScreen('Starting playthrough...', 50);
      await this.startPlaythrough();
      this.updateLoadingScreen('Loading player...', 60);
      try {
        await this.loadPlayer();
      } catch (playerError) {
        console.error('[BabylonGame] loadPlayer failed, creating fallback capsule:', playerError);
        // Create a simple capsule so the player can still move around
        if (!this.playerMesh && this.scene) {
          const { MeshBuilder, Vector3: V3 } = await import('@babylonjs/core');
          this.playerMesh = MeshBuilder.CreateCapsule('player_fallback', { height: 2, radius: 0.4 }, this.scene);
          this.playerMesh.position = this.firstSettlementSpawnPosition?.clone() ?? new V3(0, 1, 0);
          this.playerMesh.checkCollisions = true;
          this.playerMesh.isVisible = false; // first-person: player shouldn't see themselves
        }
      }
      this.updateLoadingScreen('Loading NPCs...', 70);
      await this.loadNPCs();
      this.populateBusinessesWithNPCs();
      await this.initializeRelationshipManager();
      this.updateLoadingScreen('Setting up controls...', 90);
      await this.setupKeyboardHandlers();
      this.setupPointerHandlers();
      this.setupUpdateLoop();

      // Start ambient conversation system
      if (this.ambientConversationManager) {
        if (this.prologEngine) {
          this.ambientConversationManager.setPrologEngine(this.prologEngine);
        }
        this.ambientConversationManager.start();
      }

      // Everything loaded — start rendering and hide loading screen
      this.updateLoadingScreen('Ready!', 100);
      this.startGameLoop();
      this.hideLoadingScreen();


      // Show game intro cutscene on first playthrough
      this.tryShowGameIntro();

      // Launch onboarding for first-time language-learning playthroughs
      this.tryLaunchOnboarding();
    } catch (error) {
      console.error('[BabylonGame] Failed to initialize game:', error);
      this.hideLoadingScreen();
      this.guiManager?.showToast({
        title: "Initialization Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  }

  /**
   * Try to restore a cloud session from a previously saved auth token.
   * Only applicable in standalone/Electron mode with an apiUrl configured.
   */
  private async tryRestoreCloudSession(): Promise<void> {
    const apiUrl = this.config.apiUrl;
    if (!apiUrl) return;

    const savedToken = localStorage.getItem('insimul_token');
    if (!savedToken) return;

    try {
      const res = await fetch(`${apiUrl}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (res.ok) {
        this.config.authToken = savedToken;
        this.cloudDataSource = new ApiDataSource(savedToken, apiUrl);
        console.log('[BabylonGame] Restored cloud session from saved token');
      } else {
        // Token expired or invalid
        localStorage.removeItem('insimul_token');
        localStorage.removeItem('insimul_username');
      }
    } catch {
      // Server unreachable — proceed offline silently
      console.log('[BabylonGame] Could not reach API server — playing offline');
    }
  }

  /**
   * Show the playthrough selection/creation menu and wait for the user to pick one.
   * Returns the selected playthrough ID, or null if the user cancelled (went back).
   */
  private async showPlaythroughSelectionMenu(): Promise<string | null> {
    if (!this.guiManager) return null;

    // Ensure we have the real world name (it may not be available yet from the parent component)
    let worldName = this.config.worldName;
    if (!worldName || worldName === 'Selected World' || worldName === 'Unknown World') {
      try {
        const worldData = await this.dataSource.loadWorld(this.config.worldId);
        if (worldData?.name) {
          worldName = worldData.name;
          this.config.worldName = worldName;
        }
      } catch {
        // Fall through with existing name
      }
    }

    // Determine which data source to use for new game creation
    const getActiveDataSource = (): DataSource => {
      // If signed in with cloud, prefer cloud for new playthroughs
      if (this.cloudDataSource && this.config.authToken) return this.cloudDataSource;
      return this.dataSource;
    };

    return new Promise<string | null>((resolve) => {
      this.titleScreen = new MainMenuScreen(
        this.guiManager!.advancedTexture,
        worldName || 'Untitled World',
        {
          getPlaythroughs: async (): Promise<PlaythroughInfo[]> => {
            const results: PlaythroughInfo[] = [];

            // Always get local playthroughs
            try {
              const localList = await this.dataSource.listPlaythroughs(
                this.config.worldId,
                this.config.authToken || '',
              );
              for (const p of localList) {
                results.push({
                  id: p.id,
                  name: p.name || 'Playthrough',
                  status: p.status || 'active',
                  lastPlayedAt: p.lastPlayedAt,
                  createdAt: p.createdAt,
                  playtime: p.playtime || 0,
                  actionsCount: p.actionsCount || 0,
                  source: 'local',
                });
              }
            } catch (err) {
              console.error('[BabylonGame] Failed to list local playthroughs:', err);
            }

            // If signed in, also fetch cloud playthroughs
            if (this.cloudDataSource && this.config.authToken) {
              try {
                const cloudList = await this.cloudDataSource.listPlaythroughs(
                  this.config.worldId,
                  this.config.authToken,
                );
                for (const p of cloudList) {
                  results.push({
                    id: p.id,
                    name: p.name || 'Playthrough',
                    status: p.status || 'active',
                    lastPlayedAt: p.lastPlayedAt,
                    createdAt: p.createdAt,
                    playtime: p.playtime || 0,
                    actionsCount: p.actionsCount || 0,
                    source: 'cloud',
                  });
                }
              } catch (err) {
                console.error('[BabylonGame] Failed to list cloud playthroughs:', err);
              }
            }

            return results;
          },
          onNewGame: async (): Promise<string | null> => {
            const playthroughName = `${this.config.worldName || 'World'} Playthrough`;
            const ds = getActiveDataSource();
            try {
              const playthrough = await ds.startPlaythrough(
                this.config.worldId,
                this.config.authToken || '',
                playthroughName,
              );
              if (playthrough?.id) {
                this.titleScreen = null;
                resolve(playthrough.id);
                return playthrough.id;
              }
            } catch (err) {
              console.error('[BabylonGame] Failed to create playthrough:', err);
            }
            return null;
          },
          onContinue: (playthroughId: string) => {
            this.titleScreen = null;
            resolve(playthroughId);
          },
          onBack: () => {
            this.titleScreen?.dispose();
            this.titleScreen = null;
            // In standalone/Electron mode, close the window
            if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
              window.close();
            } else {
              this.config.onBack?.();
            }
            resolve(null);
          },

          // ── Cloud save sign-in callbacks (only active when apiUrl is set) ──
          ...(this.config.apiUrl ? {
            onSignIn: async (username: string, password: string) => {
              const apiUrl = this.config.apiUrl!;
              try {
                const res = await fetch(`${apiUrl}/api/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username, password }),
                });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({ message: 'Login failed' }));
                  return { success: false, error: err.message || 'Login failed' };
                }
                const data = await res.json();
                this.config.authToken = data.token;
                localStorage.setItem('insimul_token', data.token);
                localStorage.setItem('insimul_username', data.user?.username || username);
                this.cloudDataSource = new ApiDataSource(data.token, apiUrl);
                return { success: true };
              } catch {
                return { success: false, error: 'Could not connect to server' };
              }
            },
            onSignOut: () => {
              this.config.authToken = undefined;
              this.cloudDataSource = null;
              localStorage.removeItem('insimul_token');
              localStorage.removeItem('insimul_username');
            },
            isSignedIn: () => !!(this.config.authToken && this.cloudDataSource),
            getUsername: () => localStorage.getItem('insimul_username'),
          } : {}),
        },
      );
      this.titleScreen.show();
    });
  }

  // ─── Save / Load ──────────────────────────────────────────────────────

  private createGameStateSource(): GameStateSource {
    return {
      getPlayerPosition: () => {
        const p = this.playerMesh?.position;
        return p ? { x: p.x, y: p.y, z: p.z } : { x: 0, y: 0, z: 0 };
      },
      getPlayerRotation: () => {
        const r = this.playerMesh?.rotation;
        return r ? { x: r.x, y: r.y, z: r.z } : { x: 0, y: 0, z: 0 };
      },
      getPlayerGold: () => this.playerGold,
      getPlayerHealth: () => this.playerHealth,
      getPlayerEnergy: () => this.playerEnergy,
      getInventoryItems: () => this.inventory?.getAllItems() ?? [],
      getNPCStates: () => {
        const states: any[] = [];
        this.npcMeshes.forEach((instance, id) => {
          states.push({
            id,
            position: instance.mesh
              ? { x: instance.mesh.position.x, y: instance.mesh.position.y, z: instance.mesh.position.z }
              : { x: 0, y: 0, z: 0 },
            state: 'idle',
            disposition: 0,
          });
        });
        return states;
      },
      getRelationships: () => ({}),
      getRomanceData: () => null,
      getMerchantStates: () => [],
      getCurrentZone: () => this.currentZone,
      getQuestProgress: () => {
        const progress: Record<string, any> = {};
        (this.quests || []).forEach((q: any) => {
          progress[q.id] = { status: q.status, progress: q.progress };
        });
        return progress;
      },
      getGameTime: () => {
        const s = this.gameTimeManager.getState();
        return s.day * 10000 + s.hour * 100 + s.minute;
      },
      getWorldId: () => this.config.worldId,
      getPlaythroughId: () => this.playthroughId,
      getPhotoBookState: () => {
        const photos = this.photographySystem?.getPhotos();
        return photos && photos.length > 0 ? { photos } : undefined as any;
      },
    };
  }

  private createGameStateTarget(): GameStateTarget {
    return {
      restorePlayerPosition: (pos, rot) => {
        if (this.playerMesh) {
          this.playerMesh.position.set(pos.x, pos.y, pos.z);
          this.playerMesh.rotation.set(rot.x, rot.y, rot.z);
          this.playerController?.resetPhysicsState();
        }
      },
      restorePlayerStats: (gold, health, energy) => {
        this.playerGold = gold;
        this.playerHealth = health;
        this.playerEnergy = energy;
        this.inventory?.setGold(gold);
        this.playerHealthBar?.updateHealth(health / 100);
      },
      restoreInventory: (items) => {
        if (this.inventory) {
          this.inventory.clearAll();
          items.forEach((item) => this.inventory!.addItem(item));
        }
      },
      restoreNPCStates: () => { /* NPC positions restored on next tick */ },
      restoreRelationships: () => { /* Not tracked locally yet */ },
      restoreRomanceData: () => { /* Not tracked locally yet */ },
      restoreMerchantStates: () => { /* Not tracked locally yet */ },
      restoreCurrentZone: (zone) => { this.currentZone = zone; },
      restoreQuestProgress: (progress) => {
        // The overlay is already deserialized by WorldStateManager.applyState(),
        // so re-merge base quests with the restored overlay to update this.quests.
        if (this.questOverlay && this.quests) {
          this.quests = this.questOverlay.mergeQuests(this.quests);
          // Restore objective states into the completion engine
          const engine = this.questObjectManager?.getCompletionEngine();
          if (engine) {
            engine.restoreObjectiveStates(this.questOverlay.getObjectiveStates());
          }
          this.syncActiveQuestToHud();
          this.questTracker?.updateQuests(this.config.worldId);
          return;
        }
        // Fallback for flat format (no overlay active)
        if (progress && typeof progress === 'object' && !('overrides' in progress)) {
          for (const q of (this.quests || [])) {
            const saved = progress[q.id];
            if (saved) {
              if (saved.status !== undefined) q.status = saved.status;
              if (saved.progress !== undefined) q.progress = saved.progress;
            }
          }
        }
      },
      restoreGameTime: (encoded: number) => {
        const day = Math.floor(encoded / 10000);
        const hour = Math.floor((encoded % 10000) / 100);
        const minute = encoded % 100;
        this.gameTimeManager.setTime(hour, minute, day || 1);
      },
      restorePhotoBookState: (data) => {
        if (data?.photos && this.photographySystem) {
          this.photographySystem.setPhotos(data.photos);
          this.photoBookPanel?.setPhotos(data.photos);
        }
      },
    };
  }

  private async getSaveSlots(): Promise<Array<SaveSlotInfo | null>> {
    if (!this.worldStateManager || !this.playthroughId) return [null, null, null];
    const slots = await this.worldStateManager.listSaveSlots(this.config.worldId, this.playthroughId);
    return slots.map((s) => s as SaveSlotInfo | null);
  }

  /** Push completion engine objective states into the quest overlay before saving. */
  private syncObjectiveStatesToOverlay(): void {
    const engine = this.questObjectManager?.getCompletionEngine();
    if (engine && this.questOverlay) {
      this.questOverlay.setObjectiveStates(engine.serializeObjectiveStates());
    }
  }

  private async handleSaveGame(slotIndex: number): Promise<boolean> {
    if (!this.worldStateManager) return false;
    return this.worldStateManager.save(slotIndex);
  }

  private async handleLoadGame(slotIndex: number): Promise<boolean> {
    if (!this.worldStateManager || !this.playthroughId) return false;
    const target = this.createGameStateTarget();
    return this.worldStateManager.load(target, this.config.worldId, this.playthroughId, slotIndex);
  }

  // ─── Clue System ─────────────────────────────────────────────────────────

  private initClueStore(): void {
    this.clueStore = new ClueStore(this.eventBus);

    // Auto-discover clues from texts with clueText
    this.eventBus.on('text_collected', (event) => {
      if (event.clueText) {
        this.clueStore?.addTextClue(event.title, event.clueText, event.authorName);
      }
    });

    // Auto-discover clues from investigation-relevant conversations
    this.eventBus.on('conversation_turn', (event) => {
      if (ClueStore.isInvestigationRelevant(event.keywords)) {
        const npcName = this.getNpcNameById(event.npcId) ?? event.npcId;
        this.clueStore?.addConversationClue(npcName, event.keywords);
      }
    });

    // Auto-discover photo clues for quest-relevant subjects
    this.eventBus.on('photo_taken', (event) => {
      if (event.subjectCategory === 'building' || event.subjectCategory === 'item') {
        this.clueStore?.addPhotoClue(event.subjectName, event.subjectCategory, event.location);
      }
    });

    // Auto-discover clues from location visits that are quest-relevant
    this.eventBus.on('location_visited', (event) => {
      if (ClueStore.isInvestigationRelevant([event.locationName])) {
        this.clueStore?.addPhysicalClue(
          `Visited ${event.locationName}`,
          event.locationName,
          [event.locationName.toLowerCase()],
        );
      }
    });

    // Auto-discover physical evidence clues from hidden location investigations
    this.eventBus.on('investigation_completed', (event: any) => {
      if (event.contentType === 'clue') {
        this.clueStore?.addPhysicalClue(
          event.content || 'Physical evidence found',
          event.locationName || 'Unknown location',
          [event.locationId, 'investigation', 'writer'].filter(Boolean),
        );
      }
    });

    // Auto-discover clues from hidden location discovery (writer secret spots)
    this.eventBus.on('location_discovered', (event: any) => {
      if (event.isWriterSecret) {
        this.clueStore?.addPhysicalClue(
          `Discovered writer's secret location: ${event.locationName}`,
          event.locationName || 'Secret location',
          [event.locationId, 'writer', 'secret', 'location'].filter(Boolean),
        );
      }
    });
  }

  private initCutscenePanel(): void {
    if (!this.guiManager) return;
    this.cutscenePanel = new NarrativeCutscenePanel(this.guiManager.advancedTexture, this.eventBus);
    this.narrativeBeatDispatcher = new NarrativeBeatDispatcher(this.cutscenePanel);
  }

  /** Show game intro cutscene on first playthrough — pulls content from the Narrative truth */
  private async tryShowGameIntro(): Promise<void> {
    if (!this.cutscenePanel || !this.dataSource) return;

    // Check if intro was already shown (stored in playthrough saveData)
    const playthrough = this.worldData?.playthrough || (this.worldData as any)?.activePlaythrough;
    const saveData = playthrough?.saveData as Record<string, any> | undefined;
    if (saveData?.introShown) return;

    try {
      // Load narrative truth for intro content
      const truths = await this.dataSource.loadTruths(this.config.worldId);
      const narrativeTruth = truths.find((t: any) => t.entryType === 'world_narrative');
      let narrative: any = null;
      if (narrativeTruth?.content) {
        try { narrative = JSON.parse(narrativeTruth.content); } catch {}
      }

      // Build context from world data
      const settlements = this.worldData?.settlements || [];
      const settlement = settlements[0];
      const countries = this.worldData?.countries || [];
      const country = countries[0];
      const targetLanguage = (this.worldData as any)?.targetLanguage || 'the local language';

      const { buildIntroPages } = await import('./GameIntroSequence');
      const { resolveNarrativeVariables } = await import('../../narrative/narrative-generator');
      const writerName = narrative?.writerName || 'a local writer';
      const settlementName = settlement?.name || 'the settlement';

      const pages = buildIntroPages({
        settlementName,
        countryName: country?.name || 'the region',
        targetLanguage,
        writerName,
        playerName: (playthrough as any)?.name || undefined,
        narrative: narrative || undefined,
      });

      // Resolve {{variable|fallback}} templates in all page text
      const resolvedPages = pages.map(p => ({
        ...p,
        text: resolveNarrativeVariables(p.text, { writerName, settlementName }),
      }));

      if (resolvedPages.length > 0) {
        this.cutscenePanel.show(resolvedPages);

        // Mark intro as shown so it doesn't replay
        if (playthrough?.id) {
          try {
            await this.dataSource.updatePlaythrough?.(playthrough.id, {
              saveData: { ...(saveData || {}), introShown: true },
            });
          } catch {}
        }
      }
    } catch (err) {
      console.warn('[BabylonGame] Failed to show game intro:', err);
    }
  }

  private getNpcNameById(npcId: string): string | null {
    const npc = this.npcInfos.find(n => n.id === npcId);
    return npc?.name ?? null;
  }

  private getClueMenuData(): MenuClueData | null {
    if (!this.clueStore) return null;

    // Build chapter grouping from MAIN_QUEST_CHAPTERS
    let cluesByChapter: MenuClueData['cluesByChapter'];
    try {
      const { MAIN_QUEST_CHAPTERS } = require('../../quest/main-quest-chapters');
      if (MAIN_QUEST_CHAPTERS?.length > 0) {
        cluesByChapter = MAIN_QUEST_CHAPTERS.map((ch: any) => ({
          chapterId: ch.id,
          chapterTitle: ch.title,
          chapterNumber: ch.number,
          clues: this.clueStore!.getCluesByChapter(ch.id),
        })).filter((g: any) => g.clues.length > 0);
      }
    } catch { /* MAIN_QUEST_CHAPTERS not available */ }

    return {
      clues: this.clueStore.getClues(),
      clueCount: this.clueStore.getClueCount(),
      totalClueCount: this.clueStore.getTotalClueCount(),
      connections: this.clueStore.getConnections(),
      cluesByChapter,
    };
  }

  // ─── Playthrough Management ──────────────────────────────────────────────

  private getPlaythroughInfo(): PlaythroughInfo | null {
    if (!this.playthroughId) return null;
    if (this.playthroughMeta) return this.playthroughMeta;
    return {
      id: this.playthroughId,
      name: this.config.worldName + ' Playthrough',
      status: 'active',
      playtime: 0,
      actionsCount: 0,
      createdAt: new Date().toISOString(),
    };
  }

  private async fetchPlaythroughMeta(): Promise<void> {
    if (!this.playthroughId || !this.config.authToken) return;
    try {
      const data = await this.dataSource.getPlaythrough(this.playthroughId);
      if (data) {
        this.playthroughMeta = {
          id: data.id,
          name: data.name || this.config.worldName + ' Playthrough',
          status: data.status || 'active',
          playtime: data.playtime || 0,
          actionsCount: data.actionsCount || 0,
          createdAt: data.createdAt || data.startedAt || new Date().toISOString(),
          lastPlayedAt: data.lastPlayedAt,
        };
      }
    } catch {
      // Non-critical — we'll use fallback info
    }
  }

  private async patchPlaythrough(updates: Record<string, any>): Promise<boolean> {
    if (!this.playthroughId || !this.config.authToken) return false;
    try {
      const result = await this.dataSource.updatePlaythrough(this.playthroughId, updates);
      return result != null;
    } catch {
      return false;
    }
  }

  private async handleRenamePlaythrough(newName: string): Promise<boolean> {
    const ok = await this.patchPlaythrough({ name: newName });
    if (ok && this.playthroughMeta) {
      this.playthroughMeta.name = newName;
    }
    return ok;
  }

  private async handlePausePlaythrough(): Promise<void> {
    // Auto-save first
    if (this.worldStateManager) {
      await this.worldStateManager.save(0);
    }
    await this.patchPlaythrough({ status: 'paused' });
    this.gameMenuSystem?.close();
    this.config.onBack?.();
  }

  private async handleAbandonPlaythrough(): Promise<void> {
    await this.patchPlaythrough({ status: 'abandoned' });
    this.gameMenuSystem?.close();
    this.config.onBack?.();
  }

  private async handleDeletePlaythrough(): Promise<void> {
    if (!this.playthroughId || !this.config.authToken) return;
    try {
      await this.dataSource.deletePlaythrough(this.playthroughId);
    } catch {
      // Best-effort
    }
    this.gameMenuSystem?.close();
    this.config.onBack?.();
  }

  private async handleReturnToMainMenu(): Promise<void> {
    // Auto-save and pause
    if (this.worldStateManager) {
      await this.worldStateManager.save(0);
    }
    await this.patchPlaythrough({ status: 'paused' });
    this.gameMenuSystem?.close();
    this.config.onBack?.();
  }

  private async handleQuitGame(): Promise<void> {
    // Auto-save before quit
    if (this.worldStateManager) {
      await this.worldStateManager.save(0);
    }
    await this.patchPlaythrough({ status: 'paused' });
    this.gameMenuSystem?.close();
    this.config.onBack?.();
  }

  private async handleDeleteSave(slotIndex: number): Promise<boolean> {
    if (!this.worldStateManager || !this.playthroughId) return false;
    return this.worldStateManager.deleteSlot(this.config.worldId, this.playthroughId, slotIndex);
  }

  /**
   * Dispose of all game resources
   */
  public dispose(): void {
    this.titleScreen?.dispose();
    this.titleScreen = null;
    this.disposeKeyboardHandlers();
    this.disposePointerHandlers();
    this.disposeUpdateLoop();
    this.disposeAudio();
    this.disposeVR();
    this.disposeCombat();
    this.disposeNPCs();
    this.disposePlayer();
    this.disposeWorld();
    this.disposeSystems();
    this.disposeScene();
    this.disposeEngine();

    // Remove FPS overlay
    if (this._perfDiv) {
      this._perfDiv.remove();
      this._perfDiv = null;
    }
  }

  // ============================================================================
  // INITIALIZATION METHODS
  // ============================================================================

  private async initializeEngine(): Promise<void> {
    this.engine = new Engine(this.canvas, false, {
      preserveDrawingBuffer: false,
      stencil: true,
      antialias: false,
      adaptToDeviceRatio: true,
    });

    // Handle resize
    this.resizeHandler = () => {
      this.engine?.resize();
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  private async initializeScene(): Promise<void> {
    if (!this.engine) throw new Error("Engine not initialized");

    this.scene = new Scene(this.engine);
    await this.setupScene(this.scene, this.canvas, this.worldTheme);

    // Guard against dispose() being called during the async setupScene above
    if (!this.scene) return;

    // Initialize day/night cycle (drives lighting + sky transitions from game time)
    this.dayNightCycle = new DayNightCycle({
      scene: this.scene,
      timeManager: this.gameTimeManager,
      baseSkyColor: this.worldTheme.skyColor,
    });

    // Create camera
    this.camera = this.createCamera(this.scene, this.canvas);

    // Initialize camera manager for mode switching
    this.cameraManager = new CameraManager(this.scene, this.camera);
    this.cameraManager.setOnModeChanged((mode) => {
      const displayName = this.cameraManager?.getModeDisplayName(mode) || mode;
      this.guiManager?.showToast({
        title: 'Camera Mode',
        description: displayName,
        duration: 1500
      });
    });

    this.sceneStatus = "ready";
  }

  private async setupScene(scene: Scene, canvas: HTMLCanvasElement, theme: WorldVisualTheme): Promise<void> {
    scene.clearColor = new Color4(0.75, 0.75, 0.75, 1);
    scene.ambientColor = new Color3(1, 1, 1);
    scene.collisionsEnabled = true;

    // Initialize building collision system
    this.buildingCollisionSystem = new BuildingCollisionSystem(scene);

    // Initialize NPC simulation LOD system
    this.npcSimulationLOD = new NPCSimulationLOD(scene);

    // Initialize NPC accessory & occupation-visual system
    this.npcAccessorySystem = new NPCAccessorySystem(scene);

    // Initialize unified interaction prompt (world-space billboard for all interactables)
    this.interactionPrompt = new InteractionPromptSystem(scene);
    this.interactionPrompt.setConversationPartnerCallback((npcId) => {
      return this.ambientConversationManager?.getConversationPartner(npcId) ?? null;
    });
    this.interactionPrompt.setQuestIndicatorCallback((npcId) => {
      return this.questIndicatorManager?.getIndicatorTypeForNPC(npcId) ?? null;
    });
    this.interactionPrompt.setIsSignObjectCallback((objectRole) => {
      return this.worldObjectActionManager?.isSignObject(objectRole) ?? false;
    });

    // Initialize furniture interaction manager
    this.furnitureInteractionManager = new FurnitureInteractionManager({
      showToast: (opts) => this.guiManager?.showToast(opts),
      showConfirm: async (_title, message) => window.confirm(message),
      showLorePopup: (title, content) => {
        this.guiManager?.showToast({ title, description: content, duration: 5000 });
      },
      setMovementLocked: (locked) => {
        const ctrl = this.interiorPlayerController ?? this.playerController;
        ctrl?.enableKeyBoard(!locked);
      },
      playPlayerAnimation: (clipName) => {
        this.playActionAnimation('player', { clip: clipName, loop: true, speed: 1.0 });
      },
      stopPlayerAnimation: (_clipName) => {
        this.playActionAnimation('player', { clip: 'Idle', loop: true, speed: 1.0 });
      },
      getTruths: () => (this as any)._cachedTruths ?? [],
      isPlayerOwnedBuilding: (_id) => false, // ownership not yet implemented
      getCurrentBusinessType: () => this.currentBuildingBusinessType ?? null,
      getCurrentBuildingId: () => this.activeInterior?.buildingId ?? null,
    });
    this.furnitureInteractionManager.setEventBus(this.eventBus);
    if (this.gameTimeManager) {
      this.furnitureInteractionManager.setTimeManager(this.gameTimeManager);
    }

    // Initialize player action system (physical actions: fishing, mining, cooking, etc.)
    this.playerActionSystem = new PlayerActionSystem({
      showToast: (opts) => this.guiManager?.showToast(opts),
      setMovementLocked: (locked) => {
        const ctrl = this.interiorPlayerController ?? this.playerController;
        ctrl?.enableKeyBoard(!locked);
      },
      playPlayerAnimation: (clipName) => {
        this.playActionAnimation('player', { clip: clipName, loop: true, speed: 1.0 });
      },
      stopPlayerAnimation: (_clipName) => {
        // Resume idle animation
        this.playActionAnimation('player', { clip: 'Idle', loop: true, speed: 1.0 });
      },
      getPlayerEnergy: () => this.playerEnergy,
      setPlayerEnergy: (energy) => { this.playerEnergy = energy; },
      addInventoryItem: (itemName, quantity) => {
        const displayName = itemName.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const item: InventoryItem = {
          id: `action_${itemName}_${Date.now()}`,
          name: displayName,
          description: `Obtained from physical action`,
          type: 'material',
          quantity,
          value: 5,
          sellValue: 3,
          weight: 1,
          tradeable: true,
        };
        this.inventory?.addItem(item);
      },
      hasInventoryItem: (itemName) => {
        const items = this.inventory?.getAllItems() ?? [];
        return items.some((item: InventoryItem) => item.name.toLowerCase().replace(/\s+/g, '_') === itemName.toLowerCase() || item.id.includes(itemName));
      },
      getCurrentBuildingId: () => this.activeInterior?.buildingId ?? null,
      getCurrentBusinessType: () => this.currentBuildingBusinessType ?? null,
    });
    this.playerActionSystem.setEventBus(this.eventBus);

    // Initialize fishing system (vocabulary, skill progression, water hotspot detection)
    this.fishingSystem = new FishingSystem({
      showToast: (opts) => this.guiManager?.showToast(opts),
      addInventoryItem: (itemName, quantity) => {
        const displayName = itemName.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const item: InventoryItem = {
          id: `fish_${itemName}_${Date.now()}`,
          name: displayName,
          description: 'Caught while fishing',
          type: 'material',
          quantity,
          value: 5,
          sellValue: 3,
          weight: 1,
          category: 'food',
          tradeable: true,
        };
        this.inventory?.addItem(item);
      },
      hasInventoryItem: (itemName) => {
        const items = this.inventory?.getAllItems() ?? [];
        return items.some((item: InventoryItem) => item.name.toLowerCase().replace(/\s+/g, '_') === itemName.toLowerCase() || item.id.includes(itemName));
      },
    });
    this.fishingSystem.setEventBus(this.eventBus);

    // Initialize NPC model instancer (template caching + cloning + shared materials)
    this.npcModelInstancer = new NPCModelInstancer(scene);
    // Initialize NPC modular assembler (procedural body-part construction)
    this.npcModularAssembler = new NPCModularAssembler(scene);
    // Initialize Quaternius NPC loader (composite body+hair+outfit models)
    this.quaterniusNPCLoader = new QuaterniusNPCLoader(scene);

    // Share the world prop mesh array with the interaction prompt system
    this.interactionPrompt?.setWorldPropSource(this.worldPropMeshes);

    // Initialize world object action manager (examine, identify, point-and-name, read sign)
    this.worldObjectActionManager = new WorldObjectActionManager(this.eventBus, {
      targetLanguage: getTargetLanguage(this.worldData),
    });
    this.worldObjectActionManager.setOnToast((title, description, duration) => {
      this.guiManager?.showToast({ title, description, duration: duration ?? 2500 });
    });

    // Performance: skip unnecessary per-frame clears when sky dome covers background
    scene.autoClear = false;
    scene.autoClearDepthAndStencil = true;

    // Performance: enable frustum culling (default but ensure not disabled)
    scene.skipFrustumClipping = false;

    // Performance: disable constant pointer-move picking (expensive per-frame raycast)
    scene.constantlyUpdateMeshUnderPointer = false;
    // Only pick on pointer down, not on move
    scene.skipPointerMovePicking = true;

    // Performance: pointer picking should only test pickable meshes
    scene.pointerDownPredicate = (mesh) => {
      return mesh.isPickable && mesh.isEnabled() && mesh.isVisible;
    };

    // Phase 1: Ensure debug layer is never active in production
    if (scene.debugLayer.isVisible()) {
      scene.debugLayer.hide();
    }

    // Lighting
    const hemiLight = new HemisphericLight("hemi-light", new Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.7;

    const sun = new DirectionalLight("sun", new Vector3(-0.5, -1, -0.5), scene);
    sun.position = new Vector3(0, 20, 0);
    sun.intensity = 1.1;

    // Phase 1: Shadow configuration — low resolution, limited casters
    // Shadows are expensive; use 512x512 and limit to nearby dynamic objects only
    sun.autoCalcShadowZBounds = true;

    // Sky dome with gradient shader
    const skyDome = MeshBuilder.CreateSphere("sky-dome", { diameter: 1000, segments: 16, sideOrientation: Mesh.BACKSIDE }, scene);
    skyDome.isPickable = false;
    skyDome.checkCollisions = false;
    skyDome.infiniteDistance = true;

    // Register inline shader for sky gradient
    Effect.ShadersStore["skyGradientVertexShader"] = `
      precision highp float;
      attribute vec3 position;
      attribute vec3 normal;
      uniform mat4 worldViewProjection;
      varying vec3 vPosition;
      void main() {
        gl_Position = worldViewProjection * vec4(position, 1.0);
        vPosition = position;
      }
    `;
    Effect.ShadersStore["skyGradientFragmentShader"] = `
      precision highp float;
      uniform vec3 zenithColor;
      uniform vec3 horizonColor;
      uniform vec3 groundColor;
      varying vec3 vPosition;
      void main() {
        float h = normalize(vPosition).y;
        vec3 color;
        if (h > 0.0) {
          float t = pow(h, 0.6);
          color = mix(horizonColor, zenithColor, t);
        } else {
          float t = pow(-h, 0.4);
          color = mix(horizonColor, groundColor, t);
        }
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const skyMat = new ShaderMaterial("sky-gradient-mat", scene, {
      vertex: "skyGradient",
      fragment: "skyGradient",
    }, {
      attributes: ["position", "normal"],
      uniforms: ["worldViewProjection", "zenithColor", "horizonColor", "groundColor"],
    });
    skyMat.backFaceCulling = false;

    // Initial sky colors — DayNightCycle will override these each frame
    skyMat.setColor3("zenithColor", new Color3(0.4, 0.6, 0.9));
    skyMat.setColor3("horizonColor", new Color3(0.7, 0.75, 0.85));
    skyMat.setColor3("groundColor", new Color3(0.35, 0.35, 0.3));
    skyDome.material = skyMat;

    // Initialize weather system (rain, clouds, fog, atmospheric effects)
    this.weatherSystem = new WeatherSystem(scene);

    // Create ground and wait for it to be ready
    await this.createGround(scene, this.terrainSize, theme);
  }

  private createCamera(scene: Scene, canvas: HTMLCanvasElement): ArcRotateCamera {
    const camera = new ArcRotateCamera("orbit-camera", -Math.PI / 2, Math.PI / 3, 10, new Vector3(0, 1.5, 0), scene);
    camera.attachControl(canvas, true);
    // Lock camera zoom — radius is fixed, no mouse wheel zoom
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 10;
    camera.inputs.removeByType("ArcRotateCameraMouseWheelInput");
    camera.checkCollisions = false;
    camera.lowerBetaLimit = 0.3;
    camera.upperBetaLimit = Math.PI / 2.1;
    camera.keysUp = [];
    camera.keysDown = [];
    camera.keysLeft = [];
    camera.keysRight = [];
    return camera;
  }

  private createGround(scene: Scene, size: number = 512, theme?: WorldVisualTheme): Promise<void> {
    return new Promise((resolve) => {
      const groundMaterial = new StandardMaterial("ground-mat", scene);

      // Select biome-appropriate ground texture tiling based on world type
      const worldType = (this.config.worldType || '').toLowerCase();
      let tileScale = 48;
      let bumpScale = 48;

      if (worldType.includes('desert') || worldType.includes('sand')) {
        tileScale = 32; // Larger, smoother sand dunes
        bumpScale = 32;
      } else if (worldType.includes('tundra') || worldType.includes('snow') || worldType.includes('ice')) {
        tileScale = 36;
        bumpScale = 36;
      } else if (worldType.includes('forest') || worldType.includes('fantasy') || worldType.includes('medieval')) {
        tileScale = 56; // Denser grass tiling
        bumpScale = 56;
      } else if (worldType.includes('cyberpunk') || worldType.includes('sci-fi') || worldType.includes('modern')) {
        tileScale = 36; // Urban concrete
        bumpScale = 36;
      }

      const diffuseTexture = new Texture(GROUND_DIFFUSE_URL, scene);
      diffuseTexture.uScale = tileScale;
      diffuseTexture.vScale = tileScale;
      groundMaterial.diffuseTexture = diffuseTexture;

      const bumpTexture = new Texture(GROUND_NORMAL_URL, scene);
      bumpTexture.uScale = bumpScale;
      bumpTexture.vScale = bumpScale;
      groundMaterial.bumpTexture = bumpTexture;
      groundMaterial.diffuseColor = theme?.groundColor ?? new Color3(0.9, 0.6, 0.4);
      groundMaterial.specularColor = Color3.Black();

      let settled = false;
      const finalize = (mesh: Mesh) => {
        if (settled) return;
        settled = true;
        mesh.material = groundMaterial;
        mesh.checkCollisions = true;
        mesh.isPickable = true;
        mesh.receiveShadows = true;
        mesh.metadata = { ...(mesh.metadata || {}), terrainSize: size };
        resolve();
      };

      const ground = MeshBuilder.CreateGroundFromHeightMap(
        "ground",
        GROUND_HEIGHTMAP_URL,
        {
          width: size,
          height: size,
          minHeight: 0,
          maxHeight: 0, // Flat terrain — elevation disabled until placement/physics are fixed
          subdivisions: 64,
          onReady: (mesh) => finalize(mesh),
        },
        scene
      );
      ground.metadata = { ...(ground.metadata || {}), terrainSize: size };

      // Fallback: if heightmap fails to load, resolve with a flat ground after timeout
      setTimeout(() => {
        if (!settled) {
          console.warn('[BabylonGame] Heightmap load timed out — using flat ground');
          finalize(ground);
        }
      }, 5000);
    });
  }

  private rescaleGround(): void {
    if (!this.scene) return;

    const ground = this.scene.getMeshByName("ground") as Mesh | null;
    if (!ground) return;

    const currentSize = (ground.metadata?.terrainSize as number) || this.terrainSize;
    if (!this.terrainSize || !currentSize || this.terrainSize === currentSize) return;

    // Ground mesh is 4x the logical terrain size; scale relative to that
    const scale = this.terrainSize / currentSize;
    ground.scaling.x = scale;
    ground.scaling.z = scale;
    ground.metadata = { ...(ground.metadata || {}), terrainSize: this.terrainSize };
  }

  private projectToGround(x: number, z: number): Vector3 {
    if (!this.scene) {
      return new Vector3(x, 0, z);
    }

    const origin = new Vector3(x, 100, z);
    const direction = new Vector3(0, -1, 0);
    const ray = new Ray(origin, direction, 300);
    const pickInfo = this.scene.pickWithRay(ray, (mesh) => mesh.name === "ground");
    const y = pickInfo?.hit && pickInfo.pickedPoint ? pickInfo.pickedPoint.y : 0;
    return new Vector3(x, y, z);
  }

  /**
   * Place a simple procedural tree at a position (used for park lots in the town square block).
   */
  private placeTreeAtPosition(scene: Scene, position: Vector3, settlementId: string): void {
    const treeId = `park_tree_${settlementId}_${Math.random().toString(36).slice(2, 6)}`;
    const trunk = MeshBuilder.CreateCylinder(
      `${treeId}_trunk`,
      { height: 3, diameter: 0.4, tessellation: 8 },
      scene,
    );
    trunk.position = position.clone();
    trunk.position.y += 1.5;
    const trunkMat = new StandardMaterial(`${treeId}_trunk_mat`, scene);
    trunkMat.diffuseColor = new Color3(0.35, 0.22, 0.1);
    trunkMat.specularColor = Color3.Black();
    trunk.material = trunkMat;

    const crown = MeshBuilder.CreateSphere(
      `${treeId}_crown`,
      { diameter: 3.5, segments: 8 },
      scene,
    );
    crown.position = new Vector3(0, 2.2, 0);
    crown.parent = trunk;
    const crownMat = new StandardMaterial(`${treeId}_crown_mat`, scene);
    crownMat.diffuseColor = new Color3(0.15, 0.4, 0.12);
    crownMat.specularColor = Color3.Black();
    crown.material = crownMat;

    trunk.isPickable = false;
    trunk.checkCollisions = true;
    this.worldPropMeshes.push(trunk);
  }

  /**
   * Place cemetery gravestones in a park lot for deceased residents.
   * Arranges gravestones in a grid with name and birth/death year inscriptions.
   */
  /** Fixed cemetery footprint — fits within a single lot (~10x12m). */
  private static readonly CEMETERY_WIDTH = 10;
  private static readonly CEMETERY_DEPTH = 12;

  private placeCemeteryGravestones(
    scene: Scene,
    lotCenter: Vector3,
    deceasedCharacters: any[],
    settlementId: string
  ): void {
    // Layout constants — fixed single-lot-sized cemetery
    const GRAVE_SPACING_X = 2.5;
    const GRAVE_SPACING_Z = 3.0;
    const STONE_HEIGHT = 1.2;
    const STONE_WIDTH = 0.8;
    const STONE_DEPTH = 0.15;
    const CEM_W = BabylonGame.CEMETERY_WIDTH;
    const CEM_D = BabylonGame.CEMETERY_DEPTH;

    // Compute grid capacity
    const cols = Math.max(1, Math.floor(CEM_W / GRAVE_SPACING_X));
    const rows = Math.max(1, Math.floor(CEM_D / GRAVE_SPACING_Z));

    // Shared materials
    const stoneMat = new StandardMaterial(`cemetery_stone_mat_${settlementId}`, scene);
    stoneMat.diffuseColor = new Color3(0.6, 0.6, 0.58);
    stoneMat.specularColor = new Color3(0.1, 0.1, 0.1);

    const baseMat = new StandardMaterial(`cemetery_base_mat_${settlementId}`, scene);
    baseMat.diffuseColor = new Color3(0.45, 0.45, 0.43);
    baseMat.specularColor = Color3.Black();

    // Place gravestones in a grid, centered on lotCenter
    const maxGraves = Math.min(deceasedCharacters.length, cols * rows);
    const startX = lotCenter.x - (Math.min(cols, maxGraves) - 1) * GRAVE_SPACING_X / 2;
    const startZ = lotCenter.z - (Math.ceil(maxGraves / cols) - 1) * GRAVE_SPACING_Z / 2;

    for (let i = 0; i < maxGraves; i++) {
      const character = deceasedCharacters[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const gx = startX + col * GRAVE_SPACING_X;
      const gz = startZ + row * GRAVE_SPACING_Z;
      const groundPos = this.projectToGround(gx, gz);

      const graveId = `grave_${settlementId}_${i}`;

      // Headstone
      const headstone = MeshBuilder.CreateBox(`${graveId}_stone`, {
        width: STONE_WIDTH,
        height: STONE_HEIGHT,
        depth: STONE_DEPTH,
      }, scene);
      headstone.position = new Vector3(groundPos.x, groundPos.y + STONE_HEIGHT / 2, groundPos.z);
      headstone.material = stoneMat;
      headstone.isPickable = false;
      headstone.checkCollisions = true;

      // Small base slab
      const base = MeshBuilder.CreateBox(`${graveId}_base`, {
        width: STONE_WIDTH + 0.2,
        height: 0.15,
        depth: STONE_DEPTH + 0.15,
      }, scene);
      base.position = new Vector3(groundPos.x, groundPos.y + 0.075, groundPos.z);
      base.material = baseMat;
      base.isPickable = false;

      // Text inscription using DynamicTexture
      const name = `${character.firstName || ''} ${character.lastName || ''}`.trim();
      const birthYear = character.birthYear ?? '?';
      const deathYear = character.departureYear ?? '?';

      const texW = 256;
      const texH = 256;
      const tex = new DynamicTexture(`${graveId}_tex`, { width: texW, height: texH }, scene, false);
      const ctx = tex.getContext() as any as CanvasRenderingContext2D;
      // Stone-colored background matching headstone
      ctx.fillStyle = '#97968f';
      ctx.fillRect(0, 0, texW, texH);
      ctx.fillStyle = '#1a1a18';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Old-style serif font for gravestone look
      const fontSize = Math.min(30, Math.floor(texW / (name.length * 0.6)));
      ctx.font = `bold ${fontSize}px "Georgia", "Times New Roman", "Palatino Linotype", serif`;
      ctx.fillText(name, texW / 2, texH * 0.38, texW - 20);
      // Decorative dash between years
      const yearFontSize = Math.floor(fontSize * 0.7);
      ctx.font = `${yearFontSize}px "Georgia", "Times New Roman", serif`;
      ctx.fillText(`${birthYear} \u2014 ${deathYear}`, texW / 2, texH * 0.62, texW - 20);
      // Small cross or decorative element
      ctx.font = `${Math.floor(fontSize * 0.5)}px serif`;
      ctx.fillText('\u271D', texW / 2, texH * 0.15);
      tex.update();
      tex.hasAlpha = false;

      const textMat = new StandardMaterial(`${graveId}_text_mat`, scene);
      textMat.diffuseTexture = tex;
      textMat.emissiveTexture = tex;
      textMat.disableLighting = true;
      textMat.backFaceCulling = false;
      textMat.specularColor = Color3.Black();

      // Text plane fixed to the front face of the headstone (facing +Z)
      const textPlane = MeshBuilder.CreatePlane(`${graveId}_text`, {
        width: STONE_WIDTH - 0.05,
        height: STONE_HEIGHT - 0.1,
        sideOrientation: Mesh.DOUBLESIDE,
      }, scene);
      textPlane.position = new Vector3(
        groundPos.x,
        groundPos.y + STONE_HEIGHT / 2,
        groundPos.z
      );
      textPlane.material = textMat;
      textPlane.isPickable = false;

      this.worldPropMeshes.push(headstone, base, textPlane);
    }
  }

  private async initializeSystems(): Promise<void> {
    if (!this.scene || !this.canvas) {
      return;
    }

    const scene = this.scene;

    // Wire game time manager to event bus
    this.gameTimeManager.setEventBus(this.eventBus);

    // Create unified NPC routine manager (replaces NPCLocationCycler)
    this.scheduleExecutor = new ScheduleExecutor(
      this.gameTimeManager,
      this.eventBus,
      this.npcScheduleSystem,
      this.ambientLifeSystem,
    );

    // Initialize activity label + observation system
    this.npcActivityLabelSystem = new NPCActivityLabelSystem(scene, {
      getPlayerPosition: () => this.playerMesh?.position ?? null,
      getNPCActivity: (npcId) => this.scheduleExecutor?.getCurrentActivity(npcId)
        || this.ambientLifeSystem.getActivityDescription(npcId)
        || null,
      getNPCName: (npcId) => this.npcInfos.find(n => n.id === npcId)?.name || 'Person',
      getNPCMesh: (npcId) => this.npcMeshes.get(npcId)?.mesh ?? null,
      onActivityObserved: (npcId, npcName, activity, duration) => {
        const engine = this.questObjectManager?.getCompletionEngine();
        engine?.trackEvent({ type: 'activity_observed', npcId, npcName, activity, durationSeconds: duration });
        this.updateQuestIndicators();
        // Clear progress indicator
        this.guiManager?.hideProgressBar?.();
      },
      onObservationProgress: (_npcId, npcName, activity, progress) => {
        if (progress > 0.1 && progress < 1) {
          const pct = Math.round(progress * 100);
          const bar = '\u2588'.repeat(Math.round(progress * 10)) + '\u2591'.repeat(10 - Math.round(progress * 10));
          this.guiManager?.showToast({
            title: `Observing ${npcName}...`,
            description: `${bar} ${pct}% — ${activity}`,
            duration: 800,
          });
        }
      },
    });

    // Initialize texture manager with DataSource for API-free asset resolution
    this.textureManager = new TextureManager(scene);
    this.textureManager.setDataSource(this.dataSource);

    // In exported games, provide the asset ID → file path map so TextureManager
    // can resolve MongoDB asset IDs to local files without an API server
    if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
      try {
        const ds = this.dataSource as any;
        const idMap = ds.worldIR?.meta?.assetIdToPath;
        if (idMap && typeof idMap === 'object') {
          this.textureManager.setAssetIdMap(idMap);
        }
      } catch { /* not a FileDataSource — ignore */ }
    }

    // Initialize audio manager
    this.audioManager = new AudioManager(scene);

    // Initialize GUI manager
    this.guiManager = new BabylonGUIManager(scene, {
      worldName: this.config.worldName,
      worldId: this.config.worldId
    });
    
    // Check if GUI texture is properly attached
    
    // Set up GUI callbacks
    this.guiManager.setOnBackPressed(() => this.config.onBack?.());
    this.guiManager.setOnFullscreenPressed(() => this.handleToggleFullscreen());
    this.guiManager.setOnDebugPressed(() => this.handleToggleDebug());
    this.guiManager.setOnVRToggled(() => this.handleToggleVR());
    this.guiManager.setOnNPCSelected((npcId) => this.setSelectedNPC(npcId));
    this.guiManager.setOnActionSelected((actionId) => this.handlePerformAction(actionId));
    this.guiManager.setOnPayFines(() => this.handlePayFines());
    // Time speed/pause controls are now in the game menu Character tab
    this.guiManager.setMinimapNavigateCallback((worldX, worldZ) => {
      if (this.playerMesh) {
        this.playerMesh.position.x = worldX;
        this.playerMesh.position.z = worldZ;
      }
    });

    // Initialize unified game menu system (ESC to toggle)
    const menuCallbacks: GameMenuCallbacks = {
      getPlayerData: () => ({
        name: 'Player',
        energy: this.playerEnergy,
        maxEnergy: INITIAL_ENERGY,
        status: this.isInCombat ? 'In Combat' : 'Ready',
        gold: this.playerGold,
      }),
      getReputations: () => {
        // Use ReputationManager for live reputation data
        if (this.reputationManager) {
          const reps = this.reputationManager.getAllReputations();
          if (reps.length > 0) {
            return reps.map(r => ({
              settlementName: r.entityName,
              score: r.score,
              standing: r.standing,
              isBanned: r.isBanned,
              violationCount: r.violationCount,
              outstandingFines: r.outstandingFines,
            }));
          }
        }
        // Fallback: show neutral for all settlements
        const reps: any[] = [];
        this.settlementStats.forEach((stats) => {
          reps.push({
            settlementName: stats.name,
            score: 0,
            standing: 'neutral',
            isBanned: false,
            violationCount: 0,
            outstandingFines: 0,
          });
        });
        return reps;
      },
      getQuests: () => {
        return (this.quests || []).map((q: any) => ({
          id: q.id,
          title: q.title || q.name || q.id,
          description: q.description || '',
          status: q.status || 'available',
          questType: q.questType || '',
          difficulty: q.difficulty || '',
          progress: q.progress || null,
          objectives: q.objectives || [],
          experienceReward: q.experienceReward || 0,
          assignedBy: q.assignedBy || null,
          targetLanguage: q.targetLanguage || '',
          tags: q.tags || null,
        }));
      },
      getInventoryItems: () => {
        if (!this.inventory) return [];
        return this.inventory.getAllItems().map((item: InventoryItem) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          type: item.type,
          quantity: item.quantity,
          icon: item.icon,
        }));
      },
      getRules: () => {
        const worldRules = this.worldData?.rules || [];
        const baseRules = this.worldData?.baseRules || [];
        return [...worldRules, ...baseRules].map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          ruleType: r.ruleType || 'default',
          category: r.category,
          priority: r.priority,
          isActive: true,
          isBase: !!r.isBase,
        }));
      },
      getWorldData: () => {
        if (!this.worldData) return null;
        return {
          worldName: this.config.worldName,
          countries: this.worldData.countries?.length || 0,
          settlements: this.settlements?.length || this.worldData.settlements?.length || 0,
          characters: this.characters?.length || this.worldData.characters?.length || 0,
          rules: this.worldData.rules?.length || 0,
          baseRules: this.worldData.baseRules?.length || 0,
          actions: this.worldData.actions?.length || 0,
          baseActions: this.worldData.baseActions?.length || 0,
          quests: this.worldData.quests?.length || 0,
        };
      },
      getNPCs: () => {
        const npcs: any[] = [];
        this.npcMeshes.forEach((instance, npcId) => {
          const info = this.npcInfos.find((n) => n.id === npcId);
          let distance: number | undefined;
          if (this.playerMesh && instance.mesh) {
            const dx = this.playerMesh.position.x - instance.mesh.position.x;
            const dz = this.playerMesh.position.z - instance.mesh.position.z;
            distance = Math.sqrt(dx * dx + dz * dz);
          }
          npcs.push({
            id: npcId,
            name: info?.name || npcId,
            occupation: info?.occupation,
            disposition: info?.disposition,
            questGiver: info?.questGiver || false,
            role: instance.role,
            distance,
          });
        });
        return npcs;
      },
      getSettlements: () => {
        const settlements: any[] = [];
        this.settlementStats.forEach((stats) => {
          settlements.push({
            id: stats.id,
            name: stats.name,
            type: stats.type,
            population: stats.population,
            businesses: stats.businesses,
            residences: stats.residences,
            lots: stats.lots,
            buildingCount: stats.buildingCount,
            terrain: stats.terrain,
          });
        });
        return settlements;
      },
      getMapData: () => {
        const settlements: any[] = [];
        this.settlementStats.forEach((stats, id) => {
          const mesh = this.settlementMeshes.get(id);
          if (mesh) {
            settlements.push({
              id,
              name: stats.name,
              position: { x: mesh.position.x, z: mesh.position.z },
              type: stats.type,
              zoneType: stats.type === 'city' ? 'neutral' : stats.type === 'village' ? 'caution' : 'safe',
              buildingCount: stats.buildingCount,
            });
          }
        });
        return {
          settlements,
          playerPosition: this.playerMesh
            ? { x: this.playerMesh.position.x, z: this.playerMesh.position.z }
            : { x: 0, z: 0 },
          worldSize: this.terrainSize || 512,
        };
      },
      // Language learning panel data callbacks
      // Use conversation tracker (live data) if active, otherwise persistent tracker (server data)
      getVocabularyData: () => {
        const tracker = this.chatPanel?.getLanguageTracker() || this.languageProgressTracker;
        if (!tracker) return null;
        const progress = tracker.getProgress();
        return {
          vocabulary: tracker.getVocabulary(),
          grammarPatterns: tracker.getGrammarPatterns(),
          overallFluency: progress.overallFluency,
          totalCorrectUsages: progress.totalCorrectUsages,
          dueForReview: tracker.getWordsDueForReview(),
        };
      },
      getConversationHistory: () => {
        const tracker = this.chatPanel?.getLanguageTracker() || this.languageProgressTracker;
        return tracker ? tracker.getRecentConversations(20) : [];
      },
      getSkillTreeStats: () => {
        const tracker = this.chatPanel?.getLanguageTracker() || this.languageProgressTracker;
        if (!tracker) return null;
        const progress = tracker.getProgress();
        const conversations = progress.conversations || [];
        const avgTLPct = conversations.length > 0
          ? conversations.reduce((s, c) => s + c.targetLanguagePercentage, 0) / conversations.length
          : 0;
        const maxTurns = conversations.length > 0
          ? Math.max(...conversations.map(c => c.turns))
          : 0;
        return {
          wordsLearned: progress.totalWordsLearned,
          wordsMastered: progress.vocabulary.filter(v => v.masteryLevel === 'mastered').length,
          conversations: progress.totalConversations,
          grammarPatterns: progress.grammarPatterns.length,
          avgTargetLanguagePct: avgTLPct,
          fluency: progress.overallFluency,
          maxSustainedTurns: maxTurns,
          questsCompleted: this.gamificationTracker?.getState().questsCompleted || 0,
        };
      },
      getGuildQuestData: () => {
        return (this.quests || []).map((q: any) => ({
          guildId: q.guildId,
          guildTier: q.guildTier,
          status: q.status,
        }));
      },
      getNoticeArticles: () => {
        const tracker = this.chatPanel?.getLanguageTracker() || this.languageProgressTracker;
        return {
          articles: this.noticeBoardPanel?.getArticles() || [],
          playerFluency: tracker ? tracker.getFluency() : 0,
        };
      },
      fetchServerTexts: async () => {
        try {
          const resp = await fetch(`/api/worlds/${this.config.worldId}/texts`);
          if (!resp.ok) return [];
          const texts = await resp.json();
          if (!Array.isArray(texts)) return [];
          return texts.map((t: any) => this.serverTextToNoticeArticle(t));
        } catch {
          return [];
        }
      },
      getAssessmentData: () => {
        const gamState = this.gamificationTracker?.getState();
        return {
          data: null as any, // Assessment data comes from server
          playerLevel: gamState?.xp?.level || 1,
        };
      },
      onNoticeWordClicked: (word: string, meaning: string) => {
        this.guiManager?.showToast({
          title: `${word}`,
          description: meaning,
          duration: 3000,
        });
      },
      onNoticeQuestionAnswered: (correct: boolean, articleId: string, selectedIndex: number, correctIndex: number) => {
        this.recordQuizAnswer(correct, articleId, selectedIndex, correctIndex);
        this.guiManager?.showToast({
          title: correct ? "Correct!" : "Not quite...",
          description: correct ? "Great job!" : "Try again next time",
          duration: 2000,
        });
      },
      onReadingCompleted: (articleId: string, title: string) => {
        this.eventBus.emit({ type: 'reading_completed', textId: articleId, title });
      },
      onQuestionsAnswered: (articleId: string, questionsCorrect: number, questionsTotal: number) => {
        const score = questionsTotal > 0 ? questionsCorrect / questionsTotal : 0;
        this.eventBus.emit({ type: 'questions_answered', textId: articleId, score, questionsCorrect, questionsTotal });
      },
      getAnsweredArticleIds: () => this.readingProgressAnsweredIds,
      onVocabWordSpeak: (word: string) => {
        this.chatPanel?.speakWord(word);
      },
      getPhotos: () => {
        const photos = this.photographySystem?.getPhotos() || [];
        return photos.map(p => ({
          id: p.id,
          thumbnail: p.thumbnail,
          imageData: p.imageData,
          takenAt: p.takenAt,
          locationName: p.location.settlementName || p.location.buildingName || 'Unknown',
          favorite: p.favorite,
          labelCount: p.labels.length,
          labels: p.labels.map(l => ({ name: l.name, category: l.category, activity: l.activity, x: l.x, y: l.y })),
          caption: p.caption,
        }));
      },
      onDeletePhoto: (photoId: string) => this.photographySystem?.deletePhoto(photoId),
      onTogglePhotoFavorite: (photoId: string) => this.photographySystem?.toggleFavorite(photoId),
      getPhotoQuestObjectives: () => {
        const engine = this.questObjectManager?.getCompletionEngine();
        if (!engine) return [];
        const activeQuests = this.questObjectManager?.getActiveQuests() || [];
        const completionQuests = engine.getQuests();
        const objectives: Array<{ questId: string; questTitle: string; objectiveDescription: string; targetSubject?: string; targetCategory?: string; targetActivity?: string; currentCount: number; requiredCount: number; completed: boolean }> = [];
        for (const cq of completionQuests) {
          const activeQ = activeQuests.find(q => q.id === cq.id);
          if (!activeQ || !cq.objectives) continue;
          for (const obj of cq.objectives) {
            if (obj.type === 'photograph_subject') {
              objectives.push({
                questId: cq.id,
                questTitle: activeQ.title || cq.id,
                objectiveDescription: obj.description || `Photograph ${obj.targetSubject || 'a subject'}`,
                targetSubject: obj.targetSubject,
                targetCategory: obj.targetCategory,
                targetActivity: obj.targetActivity,
                currentCount: obj.currentCount || 0,
                requiredCount: obj.requiredCount || 1,
                completed: obj.completed || false,
              });
            }
          }
        }
        return objectives;
      },
      onNPCSelected: (npcId: string) => this.setSelectedNPC(npcId),
      onQuestSetActive: (questId: string) => this.handleSetActiveQuest(questId),
      onPayFines: () => this.handlePayFines(),
      onBackToEditor: () => this.config.onBack?.(),
      onToggleFullscreen: () => this.handleToggleFullscreen(),
      onToggleDebug: () => this.handleToggleDebug(),
      onToggleVR: () => this.handleToggleVR(),
      getSaveSlots: () => this.getSaveSlots(),
      onSaveGame: (slotIndex: number) => this.handleSaveGame(slotIndex),
      onLoadGame: (slotIndex: number) => this.handleLoadGame(slotIndex),
      onDeleteSave: (slotIndex: number) => this.handleDeleteSave(slotIndex),
      getJournalData: () => this.mainQuestJournalData,
      getClueData: () => this.getClueMenuData(),
      onToggleClueFollowedUp: (clueId: string) => this.clueStore?.toggleFollowedUp(clueId),
      getPortfolioData: () => this.portfolioData,
      // Playthrough management
      getPlaythroughInfo: () => this.getPlaythroughInfo(),
      onRenamePlaythrough: (newName: string) => this.handleRenamePlaythrough(newName),
      onPausePlaythrough: () => this.handlePausePlaythrough(),
      onAbandonPlaythrough: () => this.handleAbandonPlaythrough(),
      onDeletePlaythrough: () => this.handleDeletePlaythrough(),
      onReturnToMainMenu: () => this.handleReturnToMainMenu(),
      onQuitGame: () => this.handleQuitGame(),
      // Rest / time-skip
      getTimeData: () => ({
        timeString: this.gameTimeManager.timeString,
        day: this.gameTimeManager.day,
        timeOfDay: this.gameTimeManager.timeOfDay,
        timeScale: this.gameTimeManager.timeScale,
        paused: this.gameTimeManager.paused,
      }),
      onRest: (hours: number) => this.gameTimeManager.advanceHours(hours),
      onTimeSpeedChange: (delta: number) => this.handleTimeSpeedChange(delta),
      onTimePauseToggle: () => this.handleTimePauseToggle(),
      // Crafting
      getCraftingRecipes: () => {
        if (!this.craftingSystem) return [];
        return this.craftingSystem.getAllRecipes().map(recipe => {
          const ingredientEntries = Object.entries(recipe.ingredients as Record<string, number>);
          return {
            id: recipe.id,
            name: recipe.name,
            category: recipe.category,
            ingredients: ingredientEntries.map(([name, required]) => ({
              name,
              required,
              available: this.resourceSystem?.getResourceAmount(name as any) ?? 0,
            })),
            canCraft: this.craftingSystem?.canCraft(recipe.id) ?? false,
            outputName: recipe.name,
            outputQuantity: recipe.outputQuantity ?? 1,
          };
        });
      },
      onCraftItem: (recipeId: string) => {
        if (this.craftingSystem) {
          this.craftingSystem.startCraft(recipeId);
        }
      },
    };

    // Initialize WorldStateManager for save/load
    this.worldStateManager = new WorldStateManager(this.dataSource);
    this.worldStateManager.setGameSource(this.createGameStateSource());
    this.worldStateManager.attachTriggers(this.eventBus);
    this.worldStateManager.setPreSaveHook(() => this.syncObjectiveStatesToOverlay());
    this.worldStateManager.startAutoSave(0);

    // Wire up save indicator HUD
    this.saveIndicator = new SaveIndicator(this.guiManager.advancedTexture);
    this.worldStateManager.setAutoSaveCallbacks(
      () => this.saveIndicator?.showSaving(),
      (saved) => this.saveIndicator?.showResult(saved),
    );

    this.initClueStore();
    this.initCutscenePanel();

    this.gameMenuSystem = new GameMenuSystem(this.guiManager.advancedTexture, menuCallbacks);
    if (isLanguageLearningWorld(this.worldData)) {
      this.gameMenuSystem.setTargetLanguage(getTargetLanguage(this.worldData));
    }
    this.gameMenuSystem.setOnMenuOpened(() => {
      // Pause character controller input when menu is open
      if (this.playerController) {
        this.playerController.enableKeyBoard(false);
      }
    });
    this.gameMenuSystem.setOnMenuClosed(() => {
      // Resume character controller input when menu is closed
      if (this.playerController) {
        this.playerController.enableKeyBoard(true);
      }
    });

    // Initialize chat panel
    this.chatPanel = new BabylonChatPanel(this.guiManager.advancedTexture, scene);
    this.chatPanel.setDataSource(this.dataSource);
    // Initialize chat panel UI (hidden until player talks to an NPC)
    this.chatPanel.initialize();

    // Keep NPC indicator positioned below minimap + notifications
    this.guiManager.onHudLayoutChanged((npcIndicatorTop: number) => {
      this.chatPanel?.setNpcIndicatorTop(npcIndicatorTop);
    });
    // Set initial position
    this.chatPanel.setNpcIndicatorTop(this.guiManager.getNotifPanelBottom());

    this.chatPanel.setOnClose(() => {
      this.handleConversationEnd();
    });
    this.chatPanel.setOnTalkRequested(() => {
      this.handleProximityInteraction();
    });
    this.chatPanel.setOnQuestAssigned(async (questData) => {
      // Enforce one-active-at-a-time: demote existing active quests
      const currentActive = (this.quests || []).filter((q: any) => q.status === 'active' && q.id !== questData.id);
      for (const q of currentActive) {
        try {
          await this.dataSource.updateQuest(q.id, { status: 'available' });
          q.status = 'available';
        } catch (e) {
          console.warn('[BabylonGame] Failed to demote quest:', q.id, e);
        }
      }

      // Add new quest to local list
      if (!this.quests) this.quests = [];
      if (!this.quests.find((q: any) => q.id === questData.id)) {
        this.quests.push(questData);
      }

      this.syncActiveQuestToHud();
      this.questTracker?.updateQuests(this.config.worldId);
      this.updateQuestIndicators();
      this.guiManager?.showToast({
        title: 'New Quest!',
        description: questData.title || 'Quest assigned',
      });
      this.eventBus.emit({ type: 'quest_accepted', questId: questData.id || '', questTitle: questData.title || '' });

      // Register listening comprehension quests when newly assigned
      if (questData.completionCriteria?.type === 'listening_comprehension' && this.listeningComprehensionManager) {
        this.listeningComprehensionManager.registerQuest(
          questData.id,
          questData.completionCriteria.storyNpcId || questData.assignedByCharacterId,
          questData.completionCriteria.answerNpcId,
          questData.completionCriteria.questions || [],
          (this.worldData as any)?.targetLanguage,
        );
      }
    });
    this.chatPanel.setOnQuestTurnedIn(async (questId, rewards) => {
      // QuestCompletionManager handles server call, celebration, and rewards
      if (this.questCompletionManager) {
        const questData = this.quests.find(q => q.id === questId);
        if (questData) {
          // Mark completed in overlay (local state for immediate UI update)
          await this.dataSource.updateQuest(questId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
          });
          const goldReward = rewards?.goldReward ?? questData.rewards?.gold ?? questData.rewards?.goldReward ?? 0;
          await this.questCompletionManager.completeQuest({
            id: questData.id,
            worldId: questData.worldId || this.config.worldId,
            title: questData.title,
            questType: questData.questType,
            difficulty: questData.difficulty,
            experienceReward: questData.experienceReward || 0,
            goldReward,
            itemRewards: questData.itemRewards,
            skillRewards: questData.skillRewards,
            unlocks: questData.unlocks,
            questChainId: questData.questChainId,
            questChainOrder: questData.questChainOrder,
            assignedBy: questData.assignedBy,
          });
        }
      }
      this.questTracker?.updateQuests(this.config.worldId);
      this.updateQuestIndicators();
      // Record against main quest progression (non-blocking)
      const questForType = this.quests?.find((q: any) => q.id === questId);
      if (questForType?.questType) {
        this.recordMainQuestProgress(questForType.questType);
      }
    });
    this.chatPanel.setOnActionSelect((actionId: string) => {
      this.handlePerformAction(actionId);
    });
    // Wire conversational gesture panel
    this.chatPanel.setOnGesturePerformed((gestureId: string) => {
      this.handleConversationalGesture(gestureId);
    });

    this.chatPanel.setOnNPCConversationStarted((npcId: string) => {
      // Track NPC conversation for quest objectives (talk_to_npc)
      this.questObjectManager?.trackNPCConversation(npcId);
      this.eventBus.emit({ type: 'npc_talked', npcId, npcName: npcId, turnCount: 1 });

      // Check deliver_item objectives: does the player hold the required item?
      this.checkDeliverItemObjectives(npcId);
    });
    this.chatPanel.setOnVocabularyUsed((word: string) => {
      this.questObjectManager?.trackVocabularyUsage(word);
      this.eventBus.emit({ type: 'vocabulary_used', word, correct: true });
      // Forward vocabulary usage to quest language tracker
      if (this.questLanguageFeedbackTracker) {
        this.questLanguageFeedbackTracker.processVocabularyUsage([
          { word, meaning: '', usedCorrectly: true },
        ]);
        this.questNotificationManager?.updateLanguageProgress(this.questLanguageFeedbackTracker.getState());
      }
    });
    this.chatPanel.setOnConversationTurn((keywords: string[]) => {
      this.questObjectManager?.trackConversationTurn(keywords);
      if (this.conversationNPCId) {
        this.eventBus.emit({ type: 'conversation_turn', npcId: this.conversationNPCId, keywords });
      }
    });
    this.chatPanel.setOnNpcConversationTurn((npcId: string, topicTag: string | undefined) => {
      this.questObjectManager?.trackNpcConversationTurn(npcId, topicTag);
      this.eventBus.emit({ type: 'npc_conversation_turn', npcId, topicTag });
    });
    this.chatPanel.setOnWritingSubmitted((text: string, wordCount: number) => {
      this.questObjectManager?.trackWritingSubmission(text, wordCount);
    });
    this.chatPanel.setOnConversationalAction((actions, turnState) => {
      for (const action of actions) {
        this.questObjectManager?.trackConversationalAction(action.action, action.npcId, action.topic, action.questId);
        this.eventBus.emit({ type: 'conversational_action', action: action.action, topic: action.topic, npcId: action.npcId, questId: action.questId });

        // Show visual feedback for conversational actions
        this.showConversationalActionFeedback(action.action, action.npcId, action.topic);
      }
      this.questObjectManager?.trackConversationTurnCounted(turnState.npcId, turnState.totalTurns, turnState.meaningfulTurns);
      this.eventBus.emit({ type: 'conversation_turn_counted', npcId: turnState.npcId, totalTurns: turnState.totalTurns, meaningfulTurns: turnState.meaningfulTurns });
    });
    this.chatPanel.setOnListenAndRepeat((result: any) => {
      // Emit listen & repeat events to the game event bus for quest tracking
      if (result.type === 'utterance_evaluated') {
        this.eventBus.emit(result);
      } else if (result.type === 'action_executed') {
        this.eventBus.emit(result);
      } else {
        // RepeatAttemptResult — emit both utterance and action events
        this.eventBus.emit({
          type: 'utterance_evaluated',
          objectiveId: result.phrase?.phraseId || '',
          input: result.playerSpoken || '',
          score: result.score || 0,
          passed: result.passed || false,
          feedback: result.feedback || '',
        });
        this.eventBus.emit({
          type: 'action_executed',
          actionName: 'listen_and_repeat',
          actorId: 'player',
          targetId: result.phrase?.npcId || '',
          targetName: result.phrase?.npcName || '',
          category: 'language',
          result: result.passed ? 'success' : 'failure',
          xpGained: result.xpAwarded || 0,
        });
      }
    });
    this.chatPanel.setOnNPCSpeechUpdate((text: string) => {
      // Update the speech bubble above the NPC with the latest response text
      if (this.conversationNPCId && this.npcTalkingIndicator) {
        this.npcTalkingIndicator.updateText(this.conversationNPCId, text);
      }
    });
    this.chatPanel.setOnFluencyGain((fluency: number, gain: number) => {
      this.guiManager?.updateFluency(fluency, gain);
    });
    this.chatPanel.setOnConversationSummary((result: any) => {
      // Calculate star rating: 1-5 based on composite score
      const grammarStars = Math.ceil(result.grammarScore * 2.5); // 0-2.5
      const fluencyStars = Math.min(2.5, result.gain); // 0-2.5
      const stars = Math.max(1, Math.min(5, Math.round(grammarStars + fluencyStars)));
      const starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);

      // Build detailed description
      const lines: string[] = [];
      lines.push(`Fluency: +${result.gain.toFixed(2)} (${result.previousFluency.toFixed(0)}% → ${result.newFluency.toFixed(0)}%)`);

      if (result.targetLanguagePercentage !== undefined) {
        lines.push(`Target language: ${Math.round(result.targetLanguagePercentage)}%`);
      }
      if (result.grammarScore !== undefined) {
        lines.push(`Grammar: ${Math.round(result.grammarScore * 100)}%`);
      }
      if (result.wordsLearned > 0) {
        const wordList = result.newWordsList?.map((w: any) => w.word).slice(0, 5).join(', ') || '';
        lines.push(`New words: ${result.wordsLearned}${wordList ? ` (${wordList})` : ''}`);
      }
      if (result.wordsReinforced > 0) {
        lines.push(`Words practiced: ${result.wordsReinforced}`);
      }
      if (result.bonuses.length > 0) {
        lines.push(result.bonuses.join(' • '));
      }

      // Feed conversation result to gamification tracker
      this.gamificationTracker?.onConversationEnd(result);

      // Update content gating based on new stats
      if (this.contentGatingManager) {
        const tracker = this.chatPanel?.getLanguageTracker();
        const gamification = this.gamificationTracker;
        if (tracker && gamification) {
          const progress = tracker.getProgress();
          const gState = gamification.getState();
          this.contentGatingManager.updatePlayerProgress({
            fluency: progress.overallFluency,
            level: gState.xp.level,
            wordsMastered: progress.vocabulary.filter(v => v.masteryLevel === 'mastered').length,
            questsCompleted: gState.questsCompleted,
          });
        }
      }

      // If assessment is active, signal that a conversation was completed
      if (this.assessmentActive) {
        const npcId = this.conversationNPCId || '';
        this.eventBus.emit({
          type: 'assessment_conversation_completed',
          npcId,
        });
        // Emit conversation_assessment_completed trigger for quest objective completion
        // Use the result's turn count (player messages count as turns)
        const turnCount = result.playerMessageCount ?? result.totalExchanges ?? 3;
        this.eventBus.emit({ type: 'conversation_assessment_completed', npcId, turnCount });
      }

      this.guiManager?.showToast({
        title: `Conversation Complete ${starStr}`,
        description: lines.join('\n'),
      });
    });

    // Wire gamification to word/grammar events from chat panel
    this.chatPanel.setOnNewWordLearned((entry: any) => {
      this.gamificationTracker?.onNewWordLearned(entry);
    });
    this.chatPanel.setOnWordMastered((entry: any) => {
      this.gamificationTracker?.onWordMastered(entry);
    });
    this.chatPanel.setOnGrammarFeedbackExternal((feedback: any) => {
      this.gamificationTracker?.onGrammarFeedback(feedback);
      // Forward grammar feedback to quest language tracker
      if (this.questLanguageFeedbackTracker) {
        this.questLanguageFeedbackTracker.processGrammarFeedback(feedback);
        this.questNotificationManager?.updateLanguageProgress(this.questLanguageFeedbackTracker.getState());
      }
    });

    // Initialize quest tracker
    this.questTracker = new BabylonQuestTracker(this.guiManager.advancedTexture, scene);
    this.questTracker.setDataSource(this.dataSource);
    if (this.prologEngine) {
      this.questTracker.setPrologEngine(this.prologEngine);
    }

    // Initialize quest notification manager (toasts + HUD indicator)
    this.questNotificationManager = new QuestNotificationManager(this.guiManager.advancedTexture, this.eventBus);
    this.questNotificationManager.setOnHudClicked(() => {
      this.gameMenuSystem?.open("quests");
    });


    // Initialize zone audio
    this.initializeZoneAudio(scene);

    // Initialize radial menus
    this.radialMenu = new BabylonRadialMenu(scene);
    this.contextualActionMenu = new ContextualActionMenu(scene);

    // Initialize quest object manager
    this.questObjectManager = new QuestObjectManager(scene);
    this.questObjectManager.setPointInBuildingCheck((x, z) => this.isPointInsideAnyBuilding(x, z));

    // Initialize quest hotspot manager for quest-spawned temporary hotspots
    if (this.interactionPrompt) {
      this.questHotspotManager = new QuestHotspotManager(scene, this.interactionPrompt, this.minimap ?? null);
    }
    this.questObjectManager.setOnQuestItemCollected((questId, objectiveId, itemName) => {
      // Add quest-spawned item to inventory with quest type tag
      if (this.inventory) {
        const questItem: InventoryItem = {
          id: `quest_${questId}_${objectiveId}_${Date.now()}`,
          name: itemName,
          description: `Quest item`,
          type: 'quest',
          quantity: 1,
          questId,
        };
        this.inventory.addItem(questItem);
      }
      // Persist to server
      this.dataSource.transferItem(this.config.worldId, {
        toEntityId: 'player',
        itemId: `quest_${questId}_${objectiveId}`,
        itemName,
        itemType: 'quest',
        quantity: 1,
        transactionType: 'collect',
      }).catch(() => {});
    });
    this.questObjectManager.setOnObjectCollected((questId, objectiveId) => {
      this.handleQuestObjectiveCompleted(questId, objectiveId, 'collect');
    });
    this.questObjectManager.setOnLocationVisited((questId, objectiveId) => {
      this.handleQuestObjectiveCompleted(questId, objectiveId, 'visit');
    });
    this.questObjectManager.setOnObjectiveCompleted((questId, objectiveId) => {
      this.handleQuestObjectiveCompleted(questId, objectiveId, 'objective');
    });
    this.questObjectManager.setShowToast((title, description) => {
      this.guiManager?.showToast({ title, description, duration: 3000 });
    });
    this.questObjectManager.setOnStoryTTS((text, _npcId) => {
      // Speak the listening comprehension story text via TTS
      this.chatPanel?.speakWord(text);
    });

    // Initialize listening comprehension manager
    this.listeningComprehensionManager = new ListeningComprehensionManager();
    this.listeningComprehensionManager.setOnComplete((questId, score, storyText, passed) => {
      // Update quest progress with score and story
      this.dataSource.updateQuest(questId, {
        progress: { comprehensionScore: score, storyText },
      }).catch(err => console.error('[ListeningComprehension] Failed to save progress:', err));

      // Track each answer as correct/incorrect based on pass threshold
      if (passed) {
        this.questObjectManager?.trackListeningAnswer(true, questId);
      }

      // Award XP for listening comprehension
      this.gamificationTracker?.onListeningComprehensionCompleted(passed);

      this.guiManager?.showToast({
        title: passed ? 'Comprehension Passed!' : 'Comprehension Check',
        description: passed
          ? `Score: ${score}/100 — Great listening skills!`
          : `Score: ${score}/100 — You need 60% to pass. Try again!`,
        duration: 4000,
      });
    });

    // Wire listening comprehension prompt augmentation into chat panel
    this.chatPanel?.setSystemPromptAugmentation((npcId: string) => {
      return this.listeningComprehensionManager?.getPromptAugmentation(npcId) ?? null;
    });

    // Wire chat exchange to listening comprehension manager
    this.chatPanel?.setOnChatExchange((npcId: string, playerMessage: string, npcResponse: string) => {
      this.listeningComprehensionManager?.handleChatExchange(npcId, playerMessage, npcResponse);
    });

    // Initialize quest indicator manager
    this.questIndicatorManager = new QuestIndicatorManager(scene);
    // Delegate completion checks to QuestCompletionEngine (single source of truth)
    this.questIndicatorManager.setQuestCompletionChecker((questId: string) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      return engine?.isQuestComplete(questId) ?? false;
    });

    // Initialize quest offer panel
    this.questOfferPanel = new QuestOfferPanel(scene);
    this.questOfferPanel.setOnResult(async (result, offer) => {
      if (result === 'accepted') {
        // Immediately create the quest via POST — don't rely on NPC emitting QUEST_ASSIGN
        try {
          const createdQuest = await this.createQuestFromOffer(offer);
          // Notify quest assigned callback to update UI immediately
          if (createdQuest) {
            await this.handleQuestAssignedFromPanel(createdQuest);
          }
          // Then open chat so NPC can discuss the quest naturally (quest is already saved)
          await this.openChatWithQuestOffer(offer);
        } catch (err) {
          console.error('[BabylonGame] Failed to create quest from offer:', err);
          this.guiManager?.showToast({
            title: 'Quest Error',
            description: 'Failed to accept quest. Please try again.',
            variant: 'destructive',
            duration: 3000,
          });
        }
      } else {
        this.eventBus.emit({ type: 'quest_declined', npcId: offer.npcId, npcName: offer.npcName, questTitle: offer.questTitle });
        this.guiManager?.showToast({ title: 'Quest Declined', description: `You declined "${offer.questTitle}"`, duration: 2000 });
      }
    });

    // Initialize quest world object linker
    this.questWorldObjectLinker = new QuestWorldObjectLinker(scene);
    this.questWorldObjectLinker.setOnQuestObjectClicked((info) => {
      this.guiManager?.showToast({
        title: info.questTitle,
        description: info.objectiveDescription,
        duration: 4000,
      });
    });

    // Initialize building info display
    this.buildingInfoDisplay = new BuildingInfoDisplay(scene, this.guiManager.advancedTexture);

    // Initialize minimap
    this.minimap = new BabylonMinimap(scene, this.guiManager.advancedTexture, this.terrainSize || 512);

    // Initialize full-screen map
    this.fullscreenMap = new FullscreenMap(this.guiManager.advancedTexture);

    // Wire minimap fullscreen button to toggle the full-screen map
    this.minimap.setOnFullscreenToggle(() => {
      this.fullscreenMap?.toggle();
    });

    // Initialize exploration discovery system
    this.explorationDiscovery = new ExplorationDiscoverySystem(
      scene,
      this.eventBus,
      getDefaultHiddenLocations(this.terrainSize || 512),
      (x: number, z: number) => this.projectToGround(x, z),
    );

    // Initialize inventory
    this.inventory = new BabylonInventory(scene, this.guiManager.advancedTexture);
    this.inventory.setOnItemDropped((item) => this.handleDropItem(item));
    this.inventory.setOnItemUsed((item) => this.handleUseItem(item));
    this.inventory.setOnItemEquipped((item) => this.handleEquipItem(item));
    this.inventory.setOnItemUnequipped((item) => this.handleUnequipItem(item));

    // Initialize shop panel
    this.shopPanel = new BabylonShopPanel(this.guiManager.advancedTexture);
    this.shopPanel.setOnBuy((transaction) => this.handleShopBuy(transaction));
    this.shopPanel.setOnSell((transaction) => this.handleShopSell(transaction));
    this.shopPanel.setOnClose(() => {
      // Sync gold back to inventory
      if (this.inventory && this.shopPanel) {
        this.inventory.setGold(this.shopPanel.getPlayerGold());
        this.playerGold = this.shopPanel.getPlayerGold();
      }
    });

    // Initialize container panel and spawn system
    this.containerPanel = new BabylonContainerPanel(this.guiManager.advancedTexture);
    this.containerPanel.setOnTake((transaction) => this.handleContainerTake(transaction));
    this.containerPanel.setOnPlace((transaction) => this.handleContainerPlace(transaction));
    this.containerPanel.setOnExamine((transaction) => this.handleContainerExamine(transaction));
    this.containerPanel.setOnClose(() => {});
    if (isLanguageLearningWorld(this.worldData)) {
      this.containerPanel.setTargetLanguage(getTargetLanguage(this.worldData));
    }
    this.containerSpawnSystem = new ContainerSpawnSystem(scene, this.eventBus);

    // Initialize rules panel
    this.rulesPanel = new BabylonRulesPanel(scene, this.guiManager.advancedTexture);

    // Initialize vocabulary/grammar panel (V key)
    this.vocabularyPanel = new BabylonVocabularyPanel(this.guiManager.advancedTexture);
    this.vocabularyPanel.setOnClose(() => {
      // Resume game input when panel closes
    });
    this.vocabularyPanel.setOnWordSpeak((word: string) => {
      // Use TTS to pronounce the word
      this.chatPanel?.speakWord(word);
    });

    // Initialize photography system (C key) and photo book (P key)
    this.photographySystem = new BabylonPhotographySystem(
      scene,
      this.guiManager.advancedTexture,
      {
        onPhotoTaken: (photo) => {
          this.photoBookPanel?.setPhotos(this.photographySystem?.getPhotos() || []);
          // Dispatch photo_taken events to quest completion engine for each label
          const engine = this.questObjectManager?.getCompletionEngine();
          if (engine) {
            for (const label of photo.labels) {
              const cat = label.category === 'person' ? 'npc' : label.category as 'item' | 'npc' | 'building' | 'nature';
              engine.trackEvent({ type: 'photo_taken', subjectName: label.name, subjectCategory: cat, subjectActivity: label.activity });
              // Also dispatch activity_photographed for NPC activity photography objectives
              if (cat === 'npc' && label.activity) {
                // Extract base NPC name (strip " - Activity" suffix added for display)
                const baseName = label.name.includes(' - ') ? label.name.split(' - ')[0] : label.name;
                engine.trackEvent({ type: 'activity_photographed', npcId: label.id, npcName: baseName, activity: label.activity });
              }
            }
            this.updateQuestIndicators();
          }
        },
        getPlayerPosition: () => {
          const pos = this.playerMesh?.position;
          return pos ? { x: pos.x, y: pos.y, z: pos.z } : { x: 0, y: 0, z: 0 };
        },
        getLocationInfo: () => ({
          settlementId: this.currentZone?.id,
          settlementName: this.currentZone?.name,
          buildingId: this.isInsideBuilding ? this.currentBuildingBusinessType : undefined,
          buildingName: this.isInsideBuilding ? this.currentBuildingBusinessType : undefined,
        }),
        getVisibleSceneObjects: () => this.getVisibleSceneObjectsForPhoto(),
        showToast: (title, description) => {
          this.guiManager?.showToast({ title, description, duration: 2000 });
        },
      },
    );

    this.photoBookPanel = new BabylonPhotoBookPanel(this.guiManager.advancedTexture, {
      onDeletePhoto: (id) => this.photographySystem?.deletePhoto(id),
      onToggleFavorite: (id) => this.photographySystem?.toggleFavorite(id),
      onRemoveLabel: (photoId, labelId) => this.photographySystem?.removeLabel(photoId, labelId),
    });

    // Initialize conversation history panel (H key)
    this.conversationHistoryPanel = new BabylonConversationHistoryPanel(this.guiManager.advancedTexture);
    this.conversationHistoryPanel.setOnClose(() => {});

    // Initialize skill tree panel (K key)
    this.skillTreePanel = new BabylonSkillTreePanel(this.guiManager.advancedTexture);
    this.skillTreePanel.setOnClose(() => {});
    this.skillTreePanel.setOnSkillUnlocked((node) => {
      this.guiManager?.showToast({
        title: `${node.icon} Skill Unlocked!`,
        description: `${node.name}: ${node.description}`,
        duration: 4000,
      });
    });

    // Initialize environmental audio manager
    this.environmentalAudio = new EnvironmentalAudioManager(scene);
    this.environmentalAudio.setOnSubtitle((text, _translation, duration) => {
      this.guiManager?.showToast({
        title: text,
        description: '',
        duration,
      });
    });
    this.environmentalAudio.start();

    // Initialize cultural event manager
    this.culturalEventManager = new CulturalEventManager();
    this.culturalEventManager.setOnEventStart((event) => {
      this.guiManager?.showToast({
        title: `${event.targetLanguageName}`,
        description: event.description,
        duration: 6000,
      });
    });
    this.culturalEventManager.setOnEventEnd((event) => {
      this.guiManager?.showToast({
        title: `${event.name} has ended`,
        description: 'The celebration winds down...',
        duration: 3000,
      });
    });
    this.culturalEventManager.start();

    // Initialize notice board panel (N key)
    this.noticeBoardPanel = new BabylonNoticeBoardPanel(this.guiManager.advancedTexture);
    this.noticeBoardPanel.setOnClose(() => {});
    this.noticeBoardPanel.setOnWordClicked((word, meaning) => {
      const tracker = this.chatPanel?.getLanguageTracker();
      if (tracker) {
        tracker.analyzeNPCResponse(word);
      }
      this.guiManager?.showToast({
        title: word,
        description: meaning,
        duration: 2500,
      });
    });
    this.noticeBoardPanel.setOnQuestionAnswered((correct, _articleId) => {
      if (correct) {
        this.gamificationTracker?.onQuestCompleted('cultural');
        this.guiManager?.showToast({
          title: 'Correct!',
          description: 'Bonus XP earned for comprehension!',
          duration: 3000,
        });
      } else {
        this.guiManager?.showToast({
          title: 'Not quite...',
          description: 'Try reading the article again!',
          duration: 3000,
        });
      }
    });

    // Initialize physical notice boards for settlements
    this.settlementNoticeBoard = new SettlementNoticeBoard(scene);
    this.settlementNoticeBoard.setOnBoardClicked((settlementId, articles) => {
      if (this.noticeBoardPanel) {
        // Load articles into the GUI panel and show it
        for (const article of articles) {
          this.noticeBoardPanel.addArticle(article);
        }
        this.noticeBoardPanel.show();
      }
    });

    // Initialize document reading panel for text documents
    this.documentReadingPanel = new DocumentReadingPanel(this.guiManager.advancedTexture);
    this.documentReadingPanel.setOnClose(() => {});
    this.documentReadingPanel.setOnWordClicked((word, translation) => {
      const tracker = this.chatPanel?.getLanguageTracker();
      if (tracker) {
        tracker.analyzeNPCResponse(word);
      }
      this.guiManager?.showToast({ title: word, description: translation, duration: 2500 });
    });
    this.documentReadingPanel.setOnQuestionAnswered((correct, docId, xp) => {
      if (correct) {
        this.gamificationTracker?.onQuestCompleted('cultural');
        this.guiManager?.showToast({ title: 'Correct!', description: `+${xp} XP`, duration: 3000 });
        this.eventBus.emit('questions_answered', { correct: true, textId: docId, xp });
      } else {
        this.guiManager?.showToast({ title: 'Not quite...', description: 'Try again next time!', duration: 3000 });
      }
    });
    this.documentReadingPanel.setOnDocumentRead((docId) => {
      const textData = this.fullTextCache.find(t => t.id === docId) as any;
      this.eventBus.emit('text_collected', {
        textId: docId,
        title: textData?.title || '',
        authorName: textData?.authorName || undefined,
        clueText: textData?.clueText || undefined,
      });

      // Recipe discovery: if this text has a linked recipeId, unlock the recipe
      if (textData?.textCategory === 'recipe' || textData?.recipeId) {
        const recipeId = textData.recipeId;
        if (recipeId && this.craftingSystem) {
          const unlocked = this.craftingSystem.unlockRecipe(recipeId);
          if (unlocked) {
            const recipe = this.craftingSystem.getAllRecipes().find(r => r.id === recipeId);
            this.guiManager?.showToast({
              title: 'Recipe Discovered!',
              description: `Learned to craft: ${recipe?.name || recipeId}`,
              duration: 4000,
            });
            this.eventBus.emit({
              type: 'action_executed', actionName: 'learn_word', actorId: 'player',
              category: 'crafting', result: 'success',
            } as any);
          }
        }
      }
    });
    this.documentReadingPanel.setOnClueDiscovered((_docId, clueText) => {
      this.guiManager?.showToast({ title: 'Clue Discovered!', description: clueText, duration: 5000 });
    });
    this.documentReadingPanel.setOnVocabularyAdded((words) => {
      const tracker = this.chatPanel?.getLanguageTracker();
      if (tracker) {
        for (const w of words) {
          tracker.analyzeNPCResponse(w.word);
        }
      }
    });

    // Initialize text spawner for outdoor document placement
    this.textSpawner = new TextSpawner(scene);
    this.textSpawner.setOnTextCollected((data) => {
      this.openDocumentReader(data.id);
    });
    this.initializeTextSpawner();

    // Initialize content gating manager (unlockable content by fluency/level)
    this.contentGatingManager = new ContentGatingManager();
    this.contentGatingManager.setOnContentUnlocked((gate) => {
      this.guiManager?.showToast({
        title: `Unlocked: ${gate.name}`,
        description: gate.description,
        duration: 4000,
      });
    });

    // Initialize building sign manager for bilingual signage
    this.buildingSignManager = new BuildingSignManager(scene);
    this.buildingSignManager.setOnSignClicked((data) => {
      // Add the word to vocabulary when player clicks a sign
      const tracker = this.chatPanel?.getLanguageTracker();
      if (tracker) {
        tracker.analyzeNPCResponse(data.targetName);
      }
      this.guiManager?.showToast({
        title: data.targetName,
        description: `${data.nativeName} — ${data.businessType || data.buildingType}`,
        duration: 3000,
      });
    });
    this.buildingSignManager.setOnObjectInteracted((data) => {
      const tracker = this.chatPanel?.getLanguageTracker();
      if (tracker) {
        tracker.analyzeNPCResponse(data.targetWord);
      }
      this.guiManager?.showToast({
        title: data.targetWord,
        description: data.nativeWord,
        duration: 2500,
      });
    });
    this.buildingSignManager.setOnVocabularyLookup((event) => {
      // Track as a passive vocabulary encounter
      const tracker = this.chatPanel?.getLanguageTracker();
      if (tracker) {
        tracker.addVocabularyWord(event.word, event.meaning, event.category);
      }
      this.eventBus.emit({
        type: 'vocabulary_lookup',
        word: event.word,
        meaning: event.meaning,
        category: event.category,
        source: event.source,
        objectId: event.objectId,
        dwellMs: event.dwellMs,
      });
    });

    // Initialize gamification tracker (XP, achievements, daily challenges)
    this.gamificationTracker = new LanguageGamificationTracker();
    this.gamificationTracker.setOnXPGain((event) => {
      this.guiManager?.showToast({
        title: `+${event.amount} XP`,
        description: event.reason,
        duration: 2000,
      });
      // Update skill tree with latest stats on every XP gain
      this.refreshSkillTreeStats();
    });
    this.gamificationTracker.setOnLevelUp((event) => {
      this.guiManager?.showToast({
        title: `Level Up! Level ${event.newLevel}`,
        description: `${event.tier} tier reached`,
        duration: 5000,
      });
      // Refresh skill tree on level-up
      this.refreshSkillTreeStats();
    });
    this.gamificationTracker.setOnLevelRewards((rewards) => {
      for (const reward of rewards) {
        this.guiManager?.showToast({
          title: 'Level Reward!',
          description: reward.label,
          duration: 3000,
        });
      }
    });
    this.gamificationTracker.setOnAchievementUnlocked((event) => {
      this.guiManager?.showToast({
        title: `${event.achievement.icon} Achievement Unlocked!`,
        description: `${event.achievement.name}: ${event.achievement.description}`,
        duration: 5000,
      });
    });
    this.gamificationTracker.setOnDailyChallengeCompleted((challenge) => {
      this.guiManager?.showToast({
        title: 'Daily Challenge Complete!',
        description: `${challenge.description} (+${challenge.xpReward} XP)`,
        duration: 4000,
      });
    });

    // Set world ID for server XP sync
    this.gamificationTracker.setWorldId(this.config.worldId);

    // Wire achievement detection to gameplay events via event bus
    this.gamificationTracker.subscribeToEventBus(this.eventBus);

    // Initialize quest completion manager
    this.questCompletionManager = new QuestCompletionManager(scene, this.guiManager.advancedTexture);
    this.questCompletionManager.setEventBus(this.eventBus);
    this.questCompletionManager.setGamificationTracker(this.gamificationTracker);
    this.questCompletionManager.setDataSource(this.dataSource);
    this.questCompletionManager.setOnGoldAwarded((amount) => {
      this.playerGold += amount;
      this.inventory?.setGold(this.playerGold);
    });
    if (this.questTracker) {
      this.questCompletionManager.setQuestTracker(this.questTracker);
    }

    // Initialize quest auto-completion detector
    this.questAutoCompletionDetector = new QuestAutoCompletionDetector(
      () => this.questObjectManager?.getActiveQuests() ?? [],
      (quest) => this.handleAutoQuestCompletion(quest),
    );
    this.questAutoCompletionDetector.start();

    // Initialize rule enforcer
    this.ruleEnforcer = new RuleEnforcer(scene);
    this.ruleEnforcer.setOnViolation((violation: RuleViolation) => {
      this.guiManager?.showToast({
        title: `Rule Violation: ${violation.ruleName}`,
        description: violation.message,
        variant: violation.severity === 'high' ? 'destructive' : 'default',
        duration: 4000
      });
    });

    // Initialize Prolog engine and connect to event bus
    this.prologEngine = new GamePrologEngine();
    this.prologEngine.subscribeToEventBus(this.eventBus);
    this.prologEngine.setOnQuestCompleted(async (questId) => {
      if (this.questCompletionManager) {
        const questData = this.quests.find(q => q.id === questId);
        if (questData) {
          await this.dataSource.updateQuest(questId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
          });
          const goldReward = questData.rewards?.gold ?? questData.rewards?.goldReward ?? 0;
          await this.questCompletionManager.completeQuest({
            id: questData.id,
            worldId: questData.worldId || this.config.worldId,
            title: questData.title,
            questType: questData.questType,
            difficulty: questData.difficulty,
            experienceReward: questData.experienceReward || 0,
            goldReward,
            itemRewards: questData.itemRewards,
            skillRewards: questData.skillRewards,
            unlocks: questData.unlocks,
            questChainId: questData.questChainId,
            questChainOrder: questData.questChainOrder,
            assignedBy: questData.assignedBy,
          });
        }
      }
      this.updateQuestIndicators();
    });

    // Wire Prolog engine into rule enforcer
    this.ruleEnforcer.setPrologEngine(this.prologEngine);

    // Subscribe to quest-relevant events to refresh NPC indicators
    this.eventBus.on('quest_failed', () => this.updateQuestIndicators());
    this.eventBus.on('quest_abandoned', () => this.updateQuestIndicators());

    // Initialize quest reward integration (vocabulary, knowledge, skill unlocks)
    this.questRewardIntegration = new QuestRewardIntegration();
    this.questRewardIntegration.setEventBus(this.eventBus);
    this.questRewardIntegration.setMarkVocabularyPracticed((words) => {
      const tracker = this.chatPanel?.getLanguageTracker();
      if (tracker) words.forEach(w => tracker.analyzeNPCResponse(w));
    });
    this.questRewardIntegration.setAddVocabulary((entries) => {
      const tracker = this.chatPanel?.getLanguageTracker();
      if (tracker) entries.forEach(e => tracker.analyzeNPCResponse(e.word));
    });
    this.questRewardIntegration.setOnSummaryReady((summary) => {
      if (summary.vocabularyLearned.length > 0 || summary.skillsUnlocked.length > 0) {
        const parts: string[] = [];
        if (summary.vocabularyLearned.length > 0) parts.push(`${summary.vocabularyLearned.length} words learned`);
        if (summary.skillsUnlocked.length > 0) parts.push(`Skill unlocked: ${summary.skillsUnlocked[0].skillBranch}`);
        this.guiManager?.showToast({ title: 'Rewards', description: parts.join(', '), duration: 4000 });
      }
    });

    // Clean up quest-spawned hotspots when quests end
    this.eventBus.on('quest_completed', (event) => {
      this.questHotspotManager?.removeAllForQuest(event.questId);

      // Process quest rewards (vocabulary, knowledge, skills)
      const quest = this.quests?.find((q: any) => q.id === event.questId);
      if (quest && this.questRewardIntegration) {
        this.questRewardIntegration.processQuestCompletion({
          questId: event.questId,
          questTitle: quest.title || quest.name || event.questId,
          questCategory: quest.questType,
          chapterNumber: quest.chapterNumber,
          targetVocabulary: quest.targetVocabulary,
          xpEarned: quest.experienceReward || 0,
        });
      }
    });
    this.eventBus.on('quest_failed', (event: any) => {
      if (event?.questId) this.questHotspotManager?.removeAllForQuest(event.questId);
    });
    this.eventBus.on('quest_abandoned', (event: any) => {
      if (event?.questId) this.questHotspotManager?.removeAllForQuest(event.questId);
    });
    this.eventBus.on('utterance_quest_completed', () => this.updateQuestIndicators());
    this.eventBus.on('utterance_quest_progress', () => this.updateQuestIndicators());
    this.eventBus.on('item_collected', () => this.updateQuestIndicators());
    this.eventBus.on('item_delivered', () => this.updateQuestIndicators());
    this.eventBus.on('location_visited', () => this.updateQuestIndicators());
    this.eventBus.on('npc_talked', () => this.updateQuestIndicators());
    this.eventBus.on('npc_initiated_conversation', (event) => {
      this.questObjectManager?.trackConversationInitiation(event.npcId, event.accepted);
    });

    // Show notifications for action_executed events (unified action tracking)
    this.eventBus.on('action_executed', (event) => {
      const actorLabel = event.actorId === 'player' ? 'You' : (event.actorName || 'NPC');
      const targetLabel = event.itemName || event.targetName || '';
      const details: string[] = [];
      if (targetLabel) details.push(targetLabel);
      if (event.xpGained) details.push(`+${event.xpGained} XP`);
      if (event.energyCost) details.push(`-${event.energyCost} energy`);

      this.guiManager?.showToast({
        title: `${actorLabel}: ${event.actionName.replace(/_/g, ' ')}`,
        description: details.join(', ') || undefined,
        duration: 2500,
      });

      // Track in quest completion engine
      const engine = this.questObjectManager?.getCompletionEngine();
      engine?.trackEvent({ type: 'action_executed' as any, actionName: event.actionName });
      this.updateQuestIndicators();
    });

    // Bridge object-interaction GameEventBus events → QuestCompletionEngine
    this.eventBus.on('object_examined', (event) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      engine?.trackEvent({ type: 'object_examined', objectName: event.objectName });
      this.updateQuestIndicators();
    });
    this.eventBus.on('object_identified', (event) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      engine?.trackEvent({ type: 'object_identified', objectName: event.objectName, questId: event.questId });
      this.updateQuestIndicators();
    });
    this.eventBus.on('sign_read', (event) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      engine?.trackEvent({ type: 'sign_read', signId: event.signId, questId: event.questId });
      this.updateQuestIndicators();
    });
    this.eventBus.on('object_named', (event) => {
      if (event.correct) {
        const engine = this.questObjectManager?.getCompletionEngine();
        engine?.trackEvent({ type: 'object_pointed_and_named', objectName: event.targetWord });
        this.updateQuestIndicators();
      }
    });

    // Bridge physical action events → QuestCompletionEngine
    this.eventBus.on('physical_action_completed', (event) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      engine?.trackEvent({
        type: 'physical_action',
        actionType: event.actionType,
        itemsProduced: event.itemsProduced.map(i => i.itemName),
      });
      // Also emit item_collected for each produced item so quest tracking picks it up
      for (const item of event.itemsProduced) {
        this.eventBus.emit({
          type: 'item_collected',
          itemId: `action_${item.itemName}_${Date.now()}`,
          itemName: item.itemName,
          quantity: item.quantity,
        });
      }
      this.updateQuestIndicators();

      // Award XP from physical actions via the gamification tracker
      if (event.xpGained && event.xpGained > 0) {
        this.gamificationTracker?.onQuestCompleted(event.actionType, event.xpGained);
      }
    });

    // Bridge reading events → QuestCompletionEngine
    this.eventBus.on('text_collected', (event) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      engine?.trackEvent({ type: 'text_found', textId: event.textId, textName: event.title });
      this.updateQuestIndicators();
    });
    this.eventBus.on('reading_completed', (event) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      engine?.trackEvent({ type: 'text_read', textId: event.textId });
      this.updateQuestIndicators();
    });
    this.eventBus.on('questions_answered', (event) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      for (let i = 0; i < event.questionsTotal; i++) {
        engine?.trackEvent({ type: 'comprehension_answer', isCorrect: i < event.questionsCorrect });
      }
      this.updateQuestIndicators();
    });

    // Wire escort quest events — make NPC follow the player
    this.eventBus.on('escort_started', (event: any) => {
      const npcId = event.npcId;
      if (!npcId) return;
      const instance = this.npcMeshes.get(npcId);
      if (instance) {
        instance.isBeingEscorted = true;
        // Bring NPC outside if currently inside a building
        if (instance.isInsideBuilding) {
          instance.isInsideBuilding = false;
          instance.insideBuildingId = undefined;
          if (instance.mesh) {
            instance.mesh.setEnabled(true);
            instance.mesh.isVisible = true;
          }
        }
        console.log(`[BabylonGame] NPC ${npcId} is now being escorted`);
      }
    });
    this.eventBus.on('escort_completed', (event: any) => {
      const npcId = event.npcId;
      if (!npcId) return;
      const instance = this.npcMeshes.get(npcId);
      if (instance) {
        instance.isBeingEscorted = false;
        instance.wanderTarget = undefined;
        console.log(`[BabylonGame] NPC ${npcId} escort completed`);
      }
    });

    // Wire learning activity events to gamification tracker for XP awards
    // and route assessment phase completions to quest objective tracking
    this.eventBus.on('assessment_phase_completed', (event) => {
      this.gamificationTracker?.onAssessmentPhaseCompleted();
      this.handleAssessmentPhaseCompleted(event.phase, event.score, event.maxScore ?? 0);
    });

    // Route specific assessment objective triggers to QuestCompletionEngine
    this.eventBus.on('reading_completed', (event: any) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      engine?.trackEvent({ type: 'reading_completed', textId: event.textId, questId: event.questId });
    });
    this.eventBus.on('writing_submitted', (event: any) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      engine?.trackEvent({ type: 'writing_submitted', text: event.text ?? '', wordCount: event.wordCount ?? 0, questId: event.questId });
    });
    this.eventBus.on('listening_completed', (event: any) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      engine?.trackEvent({ type: 'listening_completed', questId: event.questId });
    });
    this.eventBus.on('npc_talked', (event: any) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      engine?.trackEvent({ type: 'npc_talked', npcId: event.npcId, questId: event.questId });
    });
    this.eventBus.on('conversation_assessment_completed', (event: any) => {
      const engine = this.questObjectManager?.getCompletionEngine();
      engine?.trackEvent({ type: 'conversation_assessment_completed', npcId: event.npcId, turnCount: event.turnCount, questId: event.questId });
    });

    this.eventBus.on('assessment_completed', (event) => {
      this.gamificationTracker?.onAssessmentCompleted();
      this.guiManager.clearHighlightedNpc();
      // Track CEFR level for main quest gating
      if (event.cefrLevel) {
        this.playerCefrLevel = event.cefrLevel;
        // Try to unlock next chapter if CEFR-gated
        const worldId = this.config.worldId;
        const playerId = this.config.userId || 'player';
        this.dataSource.tryUnlockMainQuest(worldId, playerId, event.cefrLevel)
          .then(() => this.fetchMainQuestJournalData()).catch(() => {});
      }
    });
    // When the conversation assessment phase starts, pick the nearest NPC and highlight it
    this.eventBus.on('assessment_conversation_quest_start', () => {
      if (!this.playerMesh) {
        console.warn('[BabylonGame] assessment_conversation_quest_start: no playerMesh — cannot pick NPC');
        return;
      }
      const playerPos = this.playerMesh.position;
      let bestId: string | null = null;
      let bestDist = Infinity;
      // Also track closest NPC ignoring building constraints as fallback
      let fallbackId: string | null = null;
      let fallbackDist = Infinity;

      this.npcMeshes.forEach((instance, npcId) => {
        if (!instance?.mesh) return;

        // Track fallback: any NPC with a mesh (even disabled / inside building)
        const dx = playerPos.x - instance.mesh.position.x;
        const dz = playerPos.z - instance.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < fallbackDist) {
          fallbackDist = dist;
          fallbackId = npcId;
        }

        // Primary: prefer enabled outdoor NPCs
        if (!instance.mesh.isEnabled() || instance.isInsideBuilding) return;
        if (this.isPointInsideAnyBuilding(instance.mesh.position.x, instance.mesh.position.z)) return;
        if (dist < bestDist) {
          bestDist = dist;
          bestId = npcId;
        }
      });

      const targetId = bestId || fallbackId;
      if (targetId) {
        // If we fell back to an indoor NPC, bring them outside so the player can reach them
        if (!bestId && fallbackId) {
          const instance = this.npcMeshes.get(fallbackId);
          if (instance) {
            console.log(`[BabylonGame] No outdoor NPC found — bringing ${fallbackId} outside for assessment`);
            instance.isInsideBuilding = false;
            instance.insideBuildingId = undefined;
            instance.mesh.setEnabled(true);
            if (instance.billboardLOD) instance.billboardLOD.setEnabled(true);
            // Move NPC near the player so they're reachable
            const angle = Math.random() * Math.PI * 2;
            const spawnDist = 15 + Math.random() * 10;
            const spawnX = playerPos.x + Math.cos(angle) * spawnDist;
            const spawnZ = playerPos.z + Math.sin(angle) * spawnDist;
            const safePos = this.findSafeSpawnNear(
              new Vector3(spawnX, instance.mesh.position.y, spawnZ),
              10, 5, 8,
            );
            instance.mesh.position.x = safePos.x;
            instance.mesh.position.z = safePos.z;
          }
        }
        console.log(`[BabylonGame] Highlighting NPC ${targetId} for assessment conversation (outdoor: ${!!bestId})`);
        this._assessmentTargetNpcId = targetId;
        this.guiManager?.setHighlightedNpc(targetId);
      } else {
        console.warn('[BabylonGame] assessment_conversation_quest_start: no NPCs available to highlight');
      }
    });
    // When the guided conversation phase starts, inject assessment prompt into the chat panel
    this.eventBus.on('assessment_guided_conversation_start', (event) => {
      const topics = event.topics.join(', ');
      const guidancePrompt = `\n\nASSESSMENT CONVERSATION MODE: This is a language assessment conversation. Guide the conversation through these topics: ${topics}. Ask the player questions in the target language, starting simple and gradually increasing complexity. Aim for ${event.minExchanges}–${event.maxExchanges} exchanges. Evaluate their responses naturally — do not grade out loud. Keep the conversation flowing and supportive.`;
      this.chatPanel?.setQuestGuidancePrompt(guidancePrompt);
    });
    this.eventBus.on('assessment_conversation_completed', () => {
      this._assessmentTargetNpcId = null;
      this.guiManager?.clearHighlightedNpc();
      this.chatPanel?.setQuestGuidancePrompt(null);
    });
    this.eventBus.on('onboarding_step_completed', () => {
      this.gamificationTracker?.onOnboardingStepCompleted();
    });
    this.eventBus.on('onboarding_completed', () => {
      this.gamificationTracker?.onOnboardingCompleted();
    });
    this.eventBus.on('puzzle_solved', () => {
      this.gamificationTracker?.onPuzzleSolved();
    });
    this.eventBus.on('location_discovered', () => {
      this.gamificationTracker?.onLocationDiscovered();
    });
    this.eventBus.on('npc_exam_completed', (event) => {
      this.gamificationTracker?.onNpcExamCompleted(event.percentage);
    });

    // Initialize combat system
    this.combatSystem = new CombatSystem(scene);
    this.combatSystem.setOnDamageDealt((result: DamageResult) => {
      this.handleDamageDealt(result);
    });
    this.combatSystem.setOnEntityDeath((entityId: string, killedBy: string) => {
      this.handleEntityDeath(entityId, killedBy);
    });
    this.combatSystem.setOnCombatStart((attackerId: string, targetId: string) => {
      if (attackerId === 'player' || targetId === 'player') {
        this.isInCombat = true;
      }
    });

    // Initialize romance system
    this.romanceSystem = new RomanceSystem(this.eventBus);

    // Initialize combat UI
    this.combatUI = new CombatUI(scene, this.guiManager.advancedTexture);

    // Initialize VR manager
    this.vrManager = new VRManager(scene);
    this.vrManager.setOnVRSessionStart(() => {
      this.isVRMode = true;
      this.onVRSessionStarted();
    });
    this.vrManager.setOnVRSessionEnd(() => {
      this.isVRMode = false;
      this.onVRSessionEnded();
    });

    // Initialize NPC talking indicator and wire up shared GUI texture
    this.npcTalkingIndicator = new NPCTalkingIndicator(scene);
    if (this.guiManager?.advancedTexture) {
      this.npcTalkingIndicator.setGUI(this.guiManager.advancedTexture);
    }

    // Initialize ambient conversation manager
    this.ambientConversationManager = new NPCAmbientConversationManager(
      scene,
      this.config.worldId,
      this.npcTalkingIndicator
    );

    // Wire up animation callback for NPC conversations
    this.ambientConversationManager.setAnimationCallback((npcId: string, animation: string) => {
      const instance = this.npcMeshes.get(npcId);
      if (!instance?.animationGroups?.length) return;

      // Find the matching animation group
      const animNames: Record<string, string[]> = {
        talk: ['talk', 'Talk', 'talking', 'speak', 'gesture'],
        listen: ['listen', 'Listen', 'listening', 'nod'],
        idle: ['idle', 'Idle', 'standing', 'breathe'],
      };
      const searchNames = animNames[animation] || [animation];
      const group = instance.animationGroups.find((ag: any) =>
        searchNames.some((n: string) => ag.name?.toLowerCase().includes(n.toLowerCase()))
      );

      if (group) {
        // Stop current animation and play the new one
        for (const ag of instance.animationGroups) {
          if (ag !== group) ag.stop();
        }
        group.start(true); // loop
      }
    });

    // Wire up eavesdrop prompt — show/hide "Press F to eavesdrop" hint
    this.ambientConversationManager.setEavesdropPromptCallback(
      (available, _npc1Id, _npc2Id, npc1Name, npc2Name) => {
        if (available && npc1Name && npc2Name) {
          this.guiManager?.showToast({
            title: `${npc1Name} and ${npc2Name} are talking`,
            description: 'Press Y to eavesdrop',
            duration: 5000,
          });
        }
      }
    );

    // Wire up eavesdrop activation — open chat panel in eavesdrop (read-only) mode
    this.ambientConversationManager.setEavesdropActivateCallback(
      (npc1Id: string, npc2Id: string) => {
        this.startEavesdropConversation(npc1Id, npc2Id);
      }
    );

    // Initialize NPC socialization controller (personality-driven NPC-NPC interactions)
    this.socializationController = new NPCSocializationController({
      onMoveTo: (npcId, targetPos, _speed) => {
        const instance = this.npcMeshes.get(npcId);
        if (instance?.mesh && instance.controller) {
          const dir = targetPos.subtract(instance.mesh.position);
          dir.y = 0;
          if (dir.lengthSquared() > 0.001) {
            instance.mesh.rotation.y = Math.atan2(dir.x, dir.z);
            instance.controller.walk(true);
          }
        }
      },
      onFaceDirection: (npcId, targetPos) => {
        const instance = this.npcMeshes.get(npcId);
        if (instance?.mesh) {
          const dir = targetPos.subtract(instance.mesh.position);
          dir.y = 0;
          if (dir.lengthSquared() > 0.001) {
            instance.mesh.rotation.y = Math.atan2(dir.x, dir.z) + Math.PI;
          }
        }
      },
      onAnimationChange: (npcId, state) => {
        const instance = this.npcMeshes.get(npcId);
        if (instance?.controller) {
          instance.controller.walk(false);
          instance.controller.turnLeft(false);
          instance.controller.turnRight(false);
        }
        if (instance?.animationGroups?.length) {
          const animNames: Record<string, string[]> = {
            talk: ['talk', 'Talk', 'talking', 'speak', 'gesture'],
            listen: ['listen', 'Listen', 'listening', 'nod'],
            idle: ['idle', 'Idle', 'standing', 'breathe'],
          };
          const searchNames = animNames[state] || [state];
          const group = instance.animationGroups.find((ag: any) =>
            searchNames.some((n: string) => ag.name?.toLowerCase().includes(n.toLowerCase()))
          );
          if (group) {
            for (const ag of instance.animationGroups) {
              if (ag !== group) ag.stop();
            }
            group.start(true);
          }
        }
      },
      onStartConversation: async (npc1Id: string, npc2Id: string, topic?: string): Promise<ConversationResult | null> => {
        // Try local AI first (Electron offline mode)
        if (LocalAIClient.isAvailable()) {
          const npc1Data = this.npcMeshes.get(npc1Id)?.characterData;
          const npc2Data = this.npcMeshes.get(npc2Id)?.characterData;
          if (npc1Data && npc2Data) {
            const result = await generateLocalNpcConversation(npc1Data, npc2Data, topic);
            if (result) return result;
          }
        }
        // Fall back to server API
        if (typeof window !== 'undefined' && (window.location?.protocol === 'file:' || !this.config.authToken)) return null;
        try {
          return await this.dataSource.startNpcNpcConversation(this.config.worldId, npc1Id, npc2Id, topic);
        } catch {
          return null;
        }
      },
      onRelationshipUpdate: (_npc1Id, _npc2Id, _delta) => {
        // Relationship updates are handled server-side in the endpoint
      },
      onEmitEvent: (event) => this.eventBus?.emit(event),
      onStreamToPlayer: (text, _speakerId, speakerName) => {
        this.guiManager?.showToast({
          title: speakerName,
          description: `"${text}"`,
          duration: 4000,
        });
      },
      getGameHour: () => 12,
      getPlayerPosition: () => this.playerMesh?.position ?? null,
    });

    // Initialize NPC-initiated conversation controller
    this.npcInitiatedConversationController = new NPCInitiatedConversationController({
      onMoveTo: (npcId, targetPos, _speed) => {
        const instance = this.npcMeshes.get(npcId);
        if (instance?.mesh && instance.controller) {
          // Point NPC toward target and start walking
          const dir = targetPos.subtract(instance.mesh.position);
          dir.y = 0;
          if (dir.lengthSquared() > 0.001) {
            instance.mesh.rotation.y = Math.atan2(dir.x, dir.z);
            instance.controller.walk(true);
          }
        }
      },
      onFaceDirection: (npcId, targetPos) => {
        const instance = this.npcMeshes.get(npcId);
        if (instance?.mesh) {
          const dir = targetPos.subtract(instance.mesh.position);
          dir.y = 0;
          if (dir.lengthSquared() > 0.001) {
            instance.mesh.rotation.y = Math.atan2(dir.x, dir.z) + Math.PI;
          }
        }
      },
      onAnimationChange: (npcId, state) => {
        const instance = this.npcMeshes.get(npcId);
        if (instance?.controller) {
          instance.controller.walk(false);
          instance.controller.turnLeft(false);
          instance.controller.turnRight(false);
        }
        if (instance?.animController) {
          instance.animController.setState(state as any);
        }
      },
      onShowGreeting: (npcId, npcName, greeting) => {
        this.guiManager?.showToast({
          title: `${npcName} approaches`,
          description: `"${greeting}" [G to talk]`,
          duration: 15000,
        });
      },
      onDismissGreeting: (_npcId) => {
        // Toast auto-dismisses; no explicit dismiss needed
      },
      onOpenChat: async (npcId) => {
        this.setSelectedNPC(npcId);
        await this.handleOpenChat();
      },
      getGameHour: () => 12, // Default to noon; no global clock tracked
      getPlayerPosition: () => this.playerMesh?.position ?? null,
      isPlayerInConversation: () => this.conversationNPCId !== null,
      onEmitEvent: (event) => this.eventBus?.emit(event),
    });

    // Initialize procedural generators
    this.buildingGenerator = new ProceduralBuildingGenerator(scene);
    this.natureGenerator = new ProceduralNatureGenerator(scene);
    this.animalNPCSystem = new AnimalNPCSystem(scene);
    this.roadGenerator = new RoadGenerator(scene);
    this.riverGenerator = new RiverGenerator(scene);
    this.waterRenderer = new WaterRenderer(scene);
    // Initialize interior scene system — must happen before BuildingEntrySystem
    // which depends on interiorGenerator.
    console.log('[Init] Creating InteriorSceneManager. engine:', !!this.engine, 'scene:', !!scene);
    this.interiorSceneManager = new InteriorSceneManager(this.engine!, scene);
    const interiorScene = this.interiorSceneManager.getInteriorScene();
    this.interiorGenerator = new BuildingInteriorGenerator(interiorScene);
    this.interiorGenerator.setTargetScene(interiorScene, true);
    this.interiorItemManager = new InteriorItemManager(interiorScene, this.objectModelTemplates, this.objectModelOriginalHeights, this.objectModelScaleHints);
    this.bookSpawnManager = new BookSpawnManager(interiorScene);
    this.fetchWorldTextsForBooks();
    console.log('[Init] InteriorSceneManager ready:', !!this.interiorSceneManager);
    this.buildingEntrySystem = new BuildingEntrySystem(scene, this.interiorGenerator, {
      onTeleportPlayer: (pos: Vector3) => {
        if (this.playerMesh) {
          this.playerMesh.position = pos;
          // Reset character controller physics state to prevent
          // accumulated fall time from causing the player to plunge
          // through the floor after teleporting
          this.playerController?.resetPhysicsState();
        }
      },
      onSetPlayerRotationY: (radians: number) => {
        if (this.playerMesh) this.playerMesh.rotation.y = radians;
      },
      getPlayerRotationY: () => this.playerMesh?.rotation.y ?? 0,
      getPlayerPosition: () => this.playerMesh?.position ?? null,
      getPlayerMesh: () => this.playerMesh ?? null,
      onEnterBuilding: (buildingId: string, interior: InteriorLayout) => {
        this.activeInterior = interior;
        this.isInsideBuilding = true;
        // Update quest markers for building interior
        this.questObjectManager?.onEnterBuilding(buildingId, interior.position);
      },
      onExitBuilding: () => {
        this.activeInterior = null;
        this.isInsideBuilding = false;
        this.savedOverworldPosition = null;
        // Restore quest markers for overworld
        this.questObjectManager?.onExitBuilding();
      },
      onShowToast: (title: string, description?: string, duration?: number) => {
        this.guiManager?.showToast({ title, description, duration });
      },
    });
    // Initialize interior NPC manager
    this.interiorNPCManager = new InteriorNPCManager({
      onAnimationChange: (npcId: string, state: string) => {
        const instance = this.npcMeshes.get(npcId);
        if (instance?.controller) {
          // Use controller's animation system
          instance.controller.walk(state === 'walk');
          instance.controller.run(state === 'run');
        }
      },
      onFaceDirection: (npcId: string, targetPos: Vector3) => {
        const instance = this.npcMeshes.get(npcId);
        if (instance?.mesh) {
          const dir = targetPos.subtract(instance.mesh.position);
          instance.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
      },
      onNPCGreeting: (npcId: string, greeting: string) => {
        const instance = this.npcMeshes.get(npcId);
        const name = instance?.characterData?.firstName || 'NPC';
        this.guiManager?.showToast({
          title: name,
          description: greeting,
          duration: 3000,
        });
      },
    });

    // Wire schedule source for dynamic NPC entry/exit in interiors
    this.interiorNPCManager.setScheduleSource({
      getScheduledBuildingId: (npcId: string) => {
        const instance = this.npcMeshes.get(npcId);
        if (instance?.isInsideBuilding && instance.insideBuildingId) {
          return instance.insideBuildingId;
        }
        return null;
      },
      getScheduledNPCIds: () => {
        const ids: string[] = [];
        this.npcMeshes.forEach((instance, id) => {
          if (instance.isInsideBuilding && instance.insideBuildingId) {
            ids.push(id);
          }
        });
        return ids;
      },
    });
    this.interiorNPCManager.setNPCSource(() => this.npcMeshes as any);

    // Initialize business behavior system for owner/employee work action cycling
    this.businessBehaviorSystem = new BusinessBehaviorSystem({
      onAnimationChange: (npcId: string, state: string) => {
        const instance = this.npcMeshes.get(npcId);
        if (instance?.controller) {
          instance.controller.walk(state === 'walk');
          instance.controller.run(state === 'run');
        }
      },
      onStatusText: (npcId: string, text: string) => {
        // Status text available for debug/UI if needed
      },
    });

    // Disable BuildingEntrySystem's own keyboard handler — BabylonGame handles
    // E-key entry/exit directly to support interior scene switching.
    this.buildingEntrySystem.disableKeyboard();
    // Disable BuildingEntrySystem's door proximity prompt — the unified
    // InteractionPromptSystem now shows "[G]: Enter Building" billboards.
    this.buildingEntrySystem.disableDoorPrompt();

    // Wire InteriorNPCManager into BuildingEntrySystem for automatic NPC placement
    this.buildingEntrySystem.setInteriorNPCManager(
      this.interiorNPCManager,
      () => this.npcMeshes as any,
      () => undefined
    );
    this.buildingEntrySystem.setBusinessBehaviorSystem(this.businessBehaviorSystem);

    // Pause/resume overworld NPC movement when entering/exiting buildings
    this.buildingEntrySystem.registerNPCPauseCallback(
      () => {
        // Pause: disable NPC controllers
        this.npcMeshes.forEach((instance) => {
          if (instance.controller) {
            instance.controller.walk(false);
            instance.controller.run(false);
          }
        });
      },
      () => {
        // Resume: NPC behavior loop will pick back up naturally
      }
    );
    const scaleFactor = (this.worldData as any)?.generationConfig?.worldScaleFactor ?? 1.0;
    this.worldScaleManager = new WorldScaleManager(512, this.config.worldId, scaleFactor);

    if (this.buildingGenerator) {
      await this.buildingGenerator.initializeAssets(this.config.worldType);
    }
    if (this.natureGenerator) {
      await this.natureGenerator.initializeAssets(this.config.worldType);
    }
  }

  private initializeZoneAudio(scene: Scene): void {
    // Initialize zone audio effects
    // TODO: Load actual audio files
  }

  private async loadWorldData(): Promise<void> {
    try {
      const worldId = this.config.worldId;

      // Use the data source instead of direct API calls
      const [
        world,
        characters,
        actions,
        baseActions,
        quests,
        settlements,
        rules,
        baseRules,
        countries,
        states,
        baseResources,
        assets,
        config3D,
        worldItems
      ] = await Promise.all([
        this.dataSource.loadWorld(worldId),
        this.dataSource.loadCharacters(worldId),
        this.dataSource.loadActions(worldId),
        this.dataSource.loadBaseActions(),
        this.dataSource.loadQuests(worldId),
        this.dataSource.loadSettlements(worldId),
        this.dataSource.loadRules(worldId),
        this.dataSource.loadBaseRules(),
        this.dataSource.loadCountries(worldId),
        this.dataSource.loadStates(worldId),
        this.dataSource.loadBaseResources(worldId),
        this.dataSource.loadAssets(worldId),
        this.dataSource.loadConfig3D(worldId),
        this.dataSource.loadWorldItems(worldId)
      ]);

      // Store the data (same as before)
      this.worldData = world;
      this.characters = characters;
      this.actions = [...actions, ...baseActions];
      this.quests = quests;
      // Register all quests with QuestCompletionEngine so objective tracking works
      this.registerQuestsWithCompletionEngine(quests);
      // Sync active quest to HUD panel (with full objectives for task tracker)
      this.syncActiveQuestToHud();
      // Load quests into the quest tracker panel
      this.questTracker?.updateQuests(this.config.worldId);
      // Fetch main quest journal data and portfolio (non-blocking)
      this.fetchMainQuestJournalData();
      this.fetchPortfolioData();
      this.settlements = settlements;
      this.rules = [...rules, ...baseRules];
      this.countries = countries;
      this.states = states;
      this.baseResources = baseResources;
      this.assets = assets;
      this.config3D = config3D;
      this.worldItems = worldItems || [];

      // Wire base items and texts into container loot system
      if (this.containerSpawnSystem && this.worldItems.length > 0) {
        this.containerSpawnSystem.setWorldItems(this.worldItems, getTargetLanguage(this.worldData));
      }
      if (this.containerSpawnSystem && this.fullTextCache.length > 0) {
        this.containerSpawnSystem.setWorldTexts(
          this.fullTextCache.map((t: any) => ({
            id: t.id,
            title: t.title || '',
            textCategory: t.textCategory || 'book',
            recipeId: t.recipeId || undefined,
          })),
        );
      }

      // Spawn exterior items (items with metadata.position) in the overworld
      if (this.scene && this.worldItems.length > 0) {
        this.exteriorItemManager = new ExteriorItemManager(
          this.scene,
          this.objectModelTemplates,
          this.objectModelOriginalHeights,
          this.objectModelScaleHints,
          (x: number, z: number) => this.projectToGround(x, z).y,
        );
        // Validate item positions against roads and buildings
        this.exteriorItemManager.setPositionValidator((x, z) => {
          if (this.isPointInsideAnyBuilding(x, z)) return true;
          // roadHalfWidth + 1.5m clearance for exterior items
          if (this.roadGenerator?.isPointOnRoad(x, z, 1.5)) return true;
          return false;
        });
        const extMeshes = this.exteriorItemManager.spawnItems(this.worldItems);
        this.worldPropMeshes.push(...extMeshes);
      }

      // Register world items with the action manager for examine/identify/read-sign/point-and-name
      if (this.worldObjectActionManager && this.worldItems.length > 0) {
        const meshPositions = new Map<string, { x: number; y: number; z: number }>();
        for (const mesh of this.worldPropMeshes) {
          if (!mesh || mesh.isDisposed()) continue;
          const role = (mesh.metadata?.objectRole || '').toLowerCase();
          if (role && !meshPositions.has(role)) {
            meshPositions.set(role, { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z });
          }
        }
        this.worldObjectActionManager.registerObjects(this.worldItems, meshPositions);
      }

      // Enable language-learning display mode for inventory
      if (this.inventory && isLanguageLearningWorld(this.worldData)) {
        this.inventory.setLanguageLearning(true, getTargetLanguage(this.worldData));
      }

      // Initialize persistent language progress tracker and load server data
      const targetLangName = getTargetLanguage(this.worldData) || (this.worldData as any)?.targetLanguage;
      if (targetLangName && targetLangName !== 'English') {
        this.languageProgressTracker = new LanguageProgressTracker(
          'player',
          this.config.worldId,
          targetLangName,
          this.config.playthroughId || undefined
        );
        this.languageProgressTracker.setDataSource(this.dataSource);
        // Share with chat panel so conversations accumulate into the persistent tracker
        if (this.chatPanel) {
          this.chatPanel.setPersistentLanguageTracker(this.languageProgressTracker);
        }
        // Non-blocking load from server
        this.languageProgressTracker.loadFromServer().catch(err =>
          console.warn('[BabylonGame] Failed to load language progress:', err)
        );
      }

      // Register active listening comprehension quests
      if (this.listeningComprehensionManager && quests) {
        for (const quest of quests) {
          if (quest.status === 'active' && quest.completionCriteria?.type === 'listening_comprehension') {
            this.listeningComprehensionManager.registerQuest(
              quest.id,
              quest.completionCriteria.storyNpcId || quest.assignedByCharacterId,
              quest.completionCriteria.answerNpcId,
              quest.completionCriteria.questions || [],
              world?.targetLanguage,
            );
          }
        }
      }

      // Initialize quest language feedback tracker for the first active language quest
      this.initQuestLanguageFeedbackTracker(quests);

      // Initialize Prolog engine with world data (with timeout to prevent hanging)
      if (this.prologEngine) {
        const PROLOG_TIMEOUT_MS = 15000;
        try {
          await Promise.race([
            (async () => {
              const prologContent = await this.dataSource.loadPrologContent(worldId);
              const truths = await this.dataSource.loadTruths(worldId);
              (this as any)._cachedTruths = truths || [];
              await this.prologEngine!.initialize({
                characters: characters || [],
                settlements: settlements || [],
                rules: rules || [],
                actions: [...(actions || []), ...(baseActions || [])],
                quests: quests || [],
                truths: truths || [],
                content: prologContent || undefined,
              });

              // Load IS-A reasoning rules for item hierarchy queries
              await this.prologEngine!.loadItemReasoningRules();

              // Sync world item definitions (taxonomy) to Prolog
              if (this.worldItems.length > 0) {
                await this.prologEngine!.initializeWorldItems(this.worldItems);
              }

              // Sync existing inventory items to Prolog
              if (this.inventory) {
                const existingItems = this.inventory.getAllItems();
                if (existingItems.length > 0) {
                  await this.prologEngine!.initializeInventory(existingItems);
                }
              }
            })(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Prolog initialization timed out')), PROLOG_TIMEOUT_MS)
            ),
          ]);
        } catch (prologError) {
        }
      }

      // Extract world assets from assets array
      const worldAssets = assets || [];
      const world3DConfig = config3D || {};

      // Store world assets, textures (for future texture panel use), and 3D config
      this.worldAssets = worldAssets;
      this.availableTextures = worldAssets.filter(
        (asset) => asset.assetType && asset.assetType.startsWith('texture_')
      );
      this.world3DConfig = world3DConfig;


      // Apply 3D model overrides if generators are ready
      if (this.scene && this.buildingGenerator && this.natureGenerator) {
        await this.applyWorld3DConfig(worldAssets, world3DConfig);
      }

      // Apply world textures (ground, and potentially settlements/roads) from visual assets
      if (this.textureManager) {
        await this.applyWorldTexturesFromAssets();
      }

      // Initialize audio manager with audio config from asset collection
      if (this.audioManager && world3DConfig?.audioAssets) {
        await this.audioManager.initialize(world3DConfig.audioAssets, worldAssets);
      }

      // Update GUI with loaded world data
      this.updateWorldStatsUI();
      this.rulesPanel?.updateRules(rules, baseRules);

      // Use stored world map dimensions if available, otherwise compute from entity counts
      const worldMapWidth = (this.worldData as any)?.mapWidth;
      const worldMapDepth = (this.worldData as any)?.mapDepth;
      const optimalSize = (worldMapWidth && worldMapWidth > 0)
        ? Math.max(worldMapWidth, worldMapDepth ?? worldMapWidth)
        : WorldScaleManager.calculateOptimalWorldSize({
            countryCount: countries.length,
            stateCount: states.length,
            settlementCount: settlements.length
          });
      this.terrainSize = optimalSize;
      this.rescaleGround();

      // Try to upgrade flat ground to terrain mesh if heightmap data available
      await this.tryApplyTerrainHeightmap();

    } catch (error) {
      console.error('Failed to load world data', error);
      throw error;
    }
  }

  /**
   * Attempt to load geography heightmap data and replace the flat ground
   * with a terrain mesh. Falls back to existing flat ground if no data.
   */
  private async tryApplyTerrainHeightmap(): Promise<void> {
    // Disabled: elevation causes floating buildings and stuck characters.
    // Re-enable once terrain-adaptive placement/physics are implemented.
    return;
    if (!this.scene) return;
    try {
      const geo = await this.dataSource.loadGeography(this.config.worldId);
      if (!geo?.heightmap || geo.heightmap.length < 2) return;

      const size = geo.terrainSize || this.terrainSize;

      // Remove existing flat ground
      const oldGround = this.scene.getMeshByName("ground");
      if (oldGround) {
        oldGround.dispose();
      }

      // Create terrain mesh from heightmap data
      const terrain = this.terrainRenderer.createTerrainMesh(
        geo.heightmap,
        size,
        this.scene,
      );

      // Rename to "ground" so existing systems (projectToGround, etc.) find it
      terrain.name = "ground";
      terrain.metadata = { ...(terrain.metadata || {}), terrainSize: size };

    } catch (err) {
    }
  }

  /**
   * Resolve world 3D config to actual loaded Babylon meshes and register them
   * on the procedural generators. This is best-effort and will gracefully
   * fall back to existing style-based models or primitives if anything fails.
   */
  private async applyWorld3DConfig(
    worldAssets: VisualAsset[],
    config3D: {
      buildingModels?: Record<string, string>;
      natureModels?: Record<string, string>;
      characterModels?: Record<string, string>;
      objectModels?: Record<string, string>;
      groundTextureId?: string;
      roadTextureId?: string;
      wallTextureId?: string;
      roofTextureId?: string;
      playerModels?: Record<string, string>;
      questObjectModels?: Record<string, string>;
      audioAssets?: Record<string, string>;
      modelScaling?: Record<string, { x: number; y: number; z: number }>;
    } | null
  ): Promise<void> {
    if (!this.scene || !config3D) {
      return;
    }

    // Diagnostic: log what the asset collection provides
    console.log('[applyWorld3DConfig] buildingModels:', Object.keys(config3D.buildingModels || {}));
    console.log('[applyWorld3DConfig] proceduralPresets:', (config3D as any).proceduralBuildings?.stylePresets?.length ?? 0);
    console.log('[applyWorld3DConfig] worldAssets count:', worldAssets.length);

    const scene = this.scene;

    const findAssetById = (id: string | undefined | null): VisualAsset | null => {
      if (!id) return null;
      const asset = worldAssets.find((a) => a.id === id);
      if (!asset) {
        console.warn(`[applyWorld3DConfig] Asset not found for id: ${id}`);
      }
      return asset || null;
    };

    const loadModelTemplate = async (asset: VisualAsset | null): Promise<Mesh | null> => {
      if (!asset) return null;
      if (!asset.filePath) return null;

      try {
        let rootUrl: string;
        let fileName: string;

        // Detect absolute URL vs relative path
        if (asset.filePath.startsWith('http://') || asset.filePath.startsWith('https://')) {
          // External URL (not recommended, but supported for backwards compatibility)
          rootUrl = '';
          fileName = asset.filePath;
        } else {
          // Local relative path — split into directory (rootUrl) and filename
          // so BabylonJS resolves gltf-relative texture paths correctly.
          // e.g. "assets/polyhaven/models/tree_small_02.gltf"
          //   → rootUrl = "./assets/polyhaven/models/"
          //   → fileName = "tree_small_02.gltf"
          // Use relative ./ prefix (not absolute /) so it works on file:// protocol in exports.
          const cleanPath = asset.filePath.replace(/^\.?\//, '');
          const lastSlash = cleanPath.lastIndexOf('/');
          if (lastSlash >= 0) {
            rootUrl = './' + cleanPath.substring(0, lastSlash + 1);
            fileName = cleanPath.substring(lastSlash + 1);
          } else {
            rootUrl = './';
            fileName = cleanPath;
          }
        }

        const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, scene);
        if (result.meshes.length === 0) {
          return null;
        }
        // Return the root node (meshes[0]) which parents all child meshes.
        // glTF imports produce a __root__ TransformNode with child Mesh nodes;
        // returning only one child would lose siblings on clone.
        const root = result.meshes[0] as Mesh;
        root.setEnabled(false);
        for (const child of result.meshes) {
          child.setEnabled(false);
        }
        // Debug: log all mesh names to identify env/skybox meshes causing black box
        for (const m of result.meshes) {
          const bi = m.getBoundingInfo();
          const size = bi.boundingBox.maximumWorld.subtract(bi.boundingBox.minimumWorld);
        }
        return root;
      } catch (err) {
        console.error(`[BabylonGame] ❌ Failed to load model for asset ${asset.id} (${asset.filePath}):`, err);
        return null;
      }
    };

    // Helper: apply model scaling from collection config
    const scaling = config3D.modelScaling || {};
    const applyModelScaling = (mesh: Mesh, group: string, role: string) => {
      const key = `${group}.${role}`;
      const s = scaling[key];
      if (s) {
        mesh.scaling.x *= s.x;
        mesh.scaling.y *= s.y;
        mesh.scaling.z *= s.z;
      }
    };

    // Building models: register ALL role-keyed models from the collection
    if (this.buildingGenerator && config3D.buildingModels) {
      for (const [role, id] of Object.entries(config3D.buildingModels)) {
        const asset = findAssetById(id);
        const mesh = await loadModelTemplate(asset);
        if (mesh) {
          // Attach per-model scaleHint from asset metadata so the building
          // generator can use it directly instead of guessing units.
          const scaleHint = (asset?.metadata as any)?.scaleHint;
          if (scaleHint != null) {
            mesh.metadata = { ...(mesh.metadata || {}), scaleHint };
          }
          applyModelScaling(mesh, 'buildingModels', role);
          this.buildingGenerator.registerRoleModel(role, mesh);
        }
      }
    }

    // Apply wall/roof textures to building generator if available.
    // Skip global fallback when procedural presets are configured — each preset
    // has its own wallTextureId/roofTextureId loaded on-demand by the building generator.
    const hasProceduralPresets = (config3D as any).proceduralBuildings?.stylePresets?.length > 0;
    if (this.buildingGenerator && this.textureManager) {
      // Wall texture: only set global texture if explicitly configured (not a blind fallback)
      if (config3D.wallTextureId) {
        const wallAsset = worldAssets.find((a) => a.id === config3D.wallTextureId);
        if (wallAsset) {
          const wallTex = this.textureManager.loadTexture(wallAsset);
          this.buildingGenerator.setWallTexture(wallTex);
        }
      } else if (!hasProceduralPresets) {
        // Only use assetType fallback for non-procedural worlds (KayKit, etc.)
        const wallAsset = worldAssets.find((a) => a.assetType === 'texture_wall');
        if (wallAsset) {
          const wallTex = this.textureManager.loadTexture(wallAsset);
          this.buildingGenerator.setWallTexture(wallTex);
        }
      }

      // Roof texture: same logic
      if (config3D.roofTextureId) {
        const roofAsset = worldAssets.find((a) => a.id === config3D.roofTextureId);
        if (roofAsset) {
          const roofTex = this.textureManager.loadTexture(roofAsset);
          this.buildingGenerator.setRoofTexture(roofTex);
        }
      } else if (!hasProceduralPresets) {
        const roofAsset = worldAssets.find((a) =>
          a.assetType === 'texture_material' && (a.tags?.includes('roof') || a.name?.toLowerCase().includes('roof'))
        );
        if (roofAsset) {
          const roofTex = this.textureManager.loadTexture(roofAsset);
          this.buildingGenerator.setRoofTexture(roofTex);
        }
      }
    }

    // Apply procedural building config from asset collection
    if (this.buildingGenerator && this.world3DConfig?.proceduralBuildings) {
      this.buildingGenerator.setProceduralConfig(this.world3DConfig.proceduralBuildings);

      // Give the building generator a TextureManager reference for on-demand texture loading
      if (this.textureManager) {
        this.buildingGenerator.setTextureManager(this.textureManager);

        // Pre-load ALL texture IDs from style presets and per-type overrides
        const presets = this.world3DConfig.proceduralBuildings.stylePresets || [];
        const textureIds = new Set<string>();
        const collectTextureIds = (obj: Record<string, any>) => {
          for (const key of Object.keys(obj)) {
            if (key.endsWith('TextureId') && typeof obj[key] === 'string' && obj[key]) {
              textureIds.add(obj[key] as string);
            }
          }
        };
        for (const preset of presets) {
          collectTextureIds(preset);
        }
        // Also collect from per-building-type styleOverrides
        const typeOverrides = this.world3DConfig.proceduralBuildings.buildingTypeOverrides || {};
        for (const override of Object.values(typeOverrides)) {
          if (override && typeof override === 'object') collectTextureIds(override);
        }
        // And from buildingTypeConfigs styleOverrides
        if (this.world3DConfig.buildingTypeConfigs) {
          for (const cfg of Object.values(this.world3DConfig.buildingTypeConfigs)) {
            if ((cfg as any)?.styleOverrides) collectTextureIds((cfg as any).styleOverrides);
          }
        }
        for (const assetId of textureIds) {
          const asset = worldAssets.find((a) => a.id === assetId);
          if (asset) {
            const tex = this.textureManager.loadTexture(asset);
            this.buildingGenerator.registerPresetTexture(assetId, tex);
          }
        }
      }
    }

    // Nature models: iterate ALL keys from config3D.natureModels
    // Primary keys (defaultTree, rock, shrub, bush) register as overrides;
    // additional tree-like keys become random tree variants;
    // additional rock-like keys become random rock variants.
    if (this.natureGenerator && config3D.natureModels) {
      const treeVariantKeys = new Set(['tree_deciduous', 'tree_dead', 'tree_small', 'evergreen', 'sacred', 'stump']);
      const rockVariantKeys = new Set(['rock_large', 'boulder', 'rock_alt']);

      for (const [key, assetId] of Object.entries(config3D.natureModels)) {
        if (!assetId) continue;
        const asset = findAssetById(assetId);
        const mesh = await loadModelTemplate(asset);
        if (!mesh) continue;
        applyModelScaling(mesh, 'natureModels', key);

        if (key === 'defaultTree') {
          this.natureGenerator.registerTreeOverride(mesh);
        } else if (key === 'rock') {
          this.natureGenerator.registerRockOverride(mesh);
        } else if (key === 'shrub') {
          this.natureGenerator.registerShrubOverride(mesh);
        } else if (key === 'bush') {
          this.natureGenerator.registerBushOverride(mesh);
        } else if (treeVariantKeys.has(key) || key.startsWith('tree')) {
          this.natureGenerator.registerAdditionalTreeVariant(mesh);
        } else if (rockVariantKeys.has(key) || key.startsWith('rock')) {
          this.natureGenerator.registerAdditionalRockVariant(mesh);
        } else {
          // Unknown nature key — register as tree variant as a reasonable default
          this.natureGenerator.registerAdditionalTreeVariant(mesh);
        }
      }
    }

    // Character models (for future extension): config3D.characterModels
    // Currently NPCs still use the shared NPC_MODEL_URL; world-level overrides
    // can be wired in here in a future iteration.

    // Object/prop models: preload templates keyed by semantic role (chest, sword, etc.)
    // Measure original height at import time; downstream cloning uses absolute scaling.
    this.objectModelTemplates.clear();
    this.objectModelOriginalHeights.clear();
    this.objectModelScaleHints.clear();
    this.itemThumbnailRenderer?.dispose();
    this.itemThumbnailRenderer = null;
    if (config3D.objectModels) {
      for (const [role, id] of Object.entries(config3D.objectModels)) {
        const asset = findAssetById(id);
        const template = await loadModelTemplate(asset);
        if (template) {
          applyModelScaling(template, 'objectModels', role);
          template.computeWorldMatrix(true);
          const kids = template.getChildMeshes(false);
          let oMin = new Vector3(Infinity, Infinity, Infinity);
          let oMax = new Vector3(-Infinity, -Infinity, -Infinity);
          for (const kid of kids) {
            kid.computeWorldMatrix(true);
            const bi = kid.getBoundingInfo();
            oMin = Vector3.Minimize(oMin, bi.boundingBox.minimumWorld);
            oMax = Vector3.Maximize(oMax, bi.boundingBox.maximumWorld);
          }
          if (isFinite(oMin.x)) {
            const h = oMax.y - oMin.y;
            if (h > 0.001) {
              this.objectModelOriginalHeights.set(role, h);
            }
          }
          // Store pre-computed scaleHint from asset metadata if available
          const scaleHint = (asset?.metadata as any)?.scaleHint;
          if (scaleHint != null && scaleHint > 0) {
            this.objectModelScaleHints.set(role, scaleHint);
          }
          this.objectModelTemplates.set(role, template);
        }
      }
    }

    // Auto-populate templates from items with visualAssetId (asset-first items)
    if (this.worldItems.length > 0) {
      for (const item of this.worldItems) {
        if (item.visualAssetId && item.objectRole && !this.objectModelTemplates.has(item.objectRole)) {
          const asset = findAssetById(item.visualAssetId);
          const template = await loadModelTemplate(asset);
          if (template) {
            applyModelScaling(template, 'objectModels', item.objectRole);
            template.computeWorldMatrix(true);
            const kids = template.getChildMeshes(false);
            let oMin = new Vector3(Infinity, Infinity, Infinity);
            let oMax = new Vector3(-Infinity, -Infinity, -Infinity);
            for (const kid of kids) {
              kid.computeWorldMatrix(true);
              const bi = kid.getBoundingInfo();
              oMin = Vector3.Minimize(oMin, bi.boundingBox.minimumWorld);
              oMax = Vector3.Maximize(oMax, bi.boundingBox.maximumWorld);
            }
            if (isFinite(oMin.x)) {
              const h = oMax.y - oMin.y;
              if (h > 0.001) {
                this.objectModelOriginalHeights.set(item.objectRole, h);
              }
            }
            this.objectModelTemplates.set(item.objectRole, template);
          }
        }
      }
    }

    // Generate item thumbnails from loaded object model templates
    if (this.objectModelTemplates.size > 0 && scene) {
      this.itemThumbnailRenderer = new ItemThumbnailRenderer(scene);
      await this.itemThumbnailRenderer.generateThumbnails(this.objectModelTemplates, this.objectModelOriginalHeights);
      this.containerPanel?.setThumbnailRenderer(this.itemThumbnailRenderer);
    }

    // Quest object models: preload templates for quest items (collectible, marker, container, etc.)
    if (this.questObjectManager && config3D.questObjectModels) {
      for (const [role, id] of Object.entries(config3D.questObjectModels)) {
        const asset = findAssetById(id);
        const template = await loadModelTemplate(asset);
        if (template) {
          this.questObjectManager.registerQuestModelTemplate(role, template);
        }
      }
    }

    // Furniture models: preload glTF templates for building interior furniture
    if (this.interiorGenerator && scene) {
      this.furnitureModelLoader = new FurnitureModelLoader(scene);
      await this.furnitureModelLoader.loadAll();
      this.interiorGenerator.setFurnitureLoader(this.furnitureModelLoader);
    }

    // Interior configs and textures from asset collection
    if (this.interiorGenerator && this.world3DConfig?.buildingTypeConfigs) {
      const interiorConfigs: Record<string, import('@shared/game-engine/types').InteriorTemplateConfig> = {};
      const textureIds = new Set<string>();

      for (const [type, cfg] of Object.entries(this.world3DConfig.buildingTypeConfigs)) {
        if (cfg.interiorConfig) {
          interiorConfigs[type] = cfg.interiorConfig;
          if (cfg.interiorConfig.wallTextureId) textureIds.add(cfg.interiorConfig.wallTextureId);
          if (cfg.interiorConfig.floorTextureId) textureIds.add(cfg.interiorConfig.floorTextureId);
          if (cfg.interiorConfig.ceilingTextureId) textureIds.add(cfg.interiorConfig.ceilingTextureId);
        }
      }

      this.interiorGenerator.setInteriorConfigs(interiorConfigs);

      // Load and register interior textures
      if (this.textureManager && textureIds.size > 0) {
        for (const assetId of textureIds) {
          const asset = worldAssets.find((a) => a.id === assetId);
          if (asset) {
            const tex = this.textureManager.loadTexture(asset);
            this.interiorGenerator.registerInteriorTexture(assetId, tex);
          }
        }
      }
    }
  }

  private updateWorldStatsUI(): void {
    if (!this.guiManager || !this.worldData) return;

    // Add safety checks for undefined properties
    const { countries = [], settlements = [], characters = [], rules = [], baseRules = [], actions = [], baseActions = [], quests = [] } = this.worldData;

    this.guiManager.updateWorldStats({
      countries: countries.length,
      settlements: settlements.length,
      characters: characters.length,
      rules: rules.length,
      baseRules: baseRules.length,
      actions: actions.length,
      baseActions: baseActions.length,
      quests: quests.length
    });
  }

  private async generateProceduralWorld(): Promise<void> {
    if (!this.scene || !this.worldData || !this.buildingGenerator || !this.natureGenerator || !this.worldScaleManager) {
      return;
    }

    const scene = this.scene;
    const buildingGenerator = this.buildingGenerator;
    const natureGenerator = this.natureGenerator;
    const worldScaleManager = this.worldScaleManager;
    const worldId = this.config.worldId;
    const worldType = this.config.worldType;
    const terrainSize = this.terrainSize || 512;

    const sampleHeight = (x: number, z: number) => this.projectToGround(x, z).y;

    // Block material dirty mechanism during bulk world generation
    scene.blockMaterialDirtyMechanism = true;

    // Clear any previously generated world meshes
    this.disposeWorld();

    const settlements = (this.settlements || this.worldData.settlements || []).slice(0, MAX_SETTLEMENTS_3D);
    
    if (settlements.length === 0) {
      this.guiManager?.showToast({
        title: 'No settlements found',
        description: 'Try creating a settlement in the Society tab first.',
        duration: 8000,
      });
      return;
    }

    const worldStyle = ProceduralBuildingGenerator.getStyleForWorld(worldType, "plains");
    const proceduralBuildingConfig = this.world3DConfig?.proceduralBuildings || null;
    const biome = ProceduralNatureGenerator.getBiomeFromWorldType(worldType);

    console.log(`[generateProceduralWorld] worldType=${worldType}, presets=${proceduralBuildingConfig?.stylePresets?.length ?? 0}, typeOverrides=${proceduralBuildingConfig?.buildingTypeOverrides ? Object.keys(proceduralBuildingConfig.buildingTypeOverrides).length : 0}`);


    const scaledSettlements = worldScaleManager.distributeSettlements(
      {
        bounds: {
          minX: -terrainSize / 2,
          maxX: terrainSize / 2,
          minZ: -terrainSize / 2,
          maxZ: terrainSize / 2,
          centerX: 0,
          centerZ: 0
        },
        id: worldId
      },
      settlements.map((s) => ({ ...s, population: s.population || 100 })),
      false,
      sampleHeight,
    );

    const settlementMap = new Map<string, Mesh>();
    const boundaryData: { id: string; settlement: SettlementSummary; position: Vector3 }[] = [];
    const allBuildingPositions: Vector3[] = [];

    for (let i = 0; i < scaledSettlements.length; i++) {
      const scaledSettlement = scaledSettlements[i];
      const settlement = settlements[i];
      if (!settlement) continue;

      try {
        const [businesses, lots, residences] = await Promise.all([
          this.dataSource.loadSettlementBusinesses(settlement.id),
          this.dataSource.loadSettlementLots(settlement.id),
          this.dataSource.loadSettlementResidences(settlement.id)
        ]);


        // Calculate building count based on population and actual building data
        const buildingCount = Math.max(
          WorldScaleManager.getBuildingCount(scaledSettlement.population),
          businesses.length + residences.length,
          lots.length,
          5 // Minimum 5 buildings per settlement
        );

        // Record settlement stats for UI
        this.settlementStats.set(settlement.id, {
          id: settlement.id,
          name: settlement.name,
          type: settlement.settlementType || scaledSettlement.settlementType || "town",
          population: scaledSettlement.population,
          businesses: businesses.length,
          residences: residences.length,
          lots: lots.length,
          buildingCount,
          terrain: settlement.terrain
        });

        // ── Build lot lookup from DB positions ─────────────────────────────
        // DB lots are the single source of truth for building positions.
        // This ensures the 3D game matches the Society preview exactly.
        const lotById = new Map<string, any>();
        for (const lot of lots) {
          lotById.set(lot.id, lot);
        }

        // Normalize lot positions: support both flat (positionX/positionZ) and nested (position.x/position.z) formats
        for (const l of lots) {
          if (l.positionX == null && l.position?.x != null) {
            l.positionX = l.position.x;
            l.positionZ = l.position.z ?? l.position.y ?? 0;
          }
        }

        // Check if DB lots have world-space positions
        const lotsHavePositions = lots.some((l: any) => l.positionX != null && l.positionZ != null);

        // Fallback: generate positions client-side only when DB has none
        let fallbackLotPositions: { position: Vector3; facingAngle: number; zone: string }[] = [];
        if (!lotsHavePositions) {
          const lotStreetNames = Array.from(new Set(lots.map((l: any) => l.streetName).filter(Boolean)));
          const storedStreets: any[] = Array.isArray(settlement.streets) ? settlement.streets : [];
          const getWaypoints = (s: any): { x: number; z: number }[] | null => {
            if (Array.isArray(s.waypoints) && s.waypoints.length >= 2) return s.waypoints;
            if (s.properties && Array.isArray(s.properties.waypoints) && s.properties.waypoints.length >= 2) return s.properties.waypoints;
            return null;
          };
          const hasStoredWaypoints = storedStreets.some((s: any) => getWaypoints(s) !== null);
          const existingStreetNetwork = hasStoredWaypoints
            ? {
                segments: storedStreets
                  .filter((s: any) => getWaypoints(s) !== null)
                  .map((s: any, idx: number) => ({
                    id: s.id || `existing_${idx}`,
                    name: s.name || '',
                    waypoints: getWaypoints(s)!,
                    width: s.width || s.properties?.width || 2.5,
                  })),
              }
            : null;
          const streetLayout = worldScaleManager.generateStreetAlignedSettlement(
            scaledSettlement,
            buildingCount,
            businesses.length,
            lotStreetNames.length > 0 ? lotStreetNames : undefined,
            existingStreetNetwork,
          );
          // Separate park lots from buildable lots
          const buildableLots = streetLayout.lots.filter((l) => l.zone !== 'park');
          const parkLots = streetLayout.lots.filter((l) => l.zone === 'park');
          fallbackLotPositions = buildableLots.map((l) => ({
            position: this.projectToGround(l.position.x, l.position.z),
            facingAngle: l.facingAngle,
            zone: l.zone,
          }));

          // Place trees at park lot positions (center block = town square park)
          // Reserve one park lot for cemetery if there are deceased characters
          const genAllChars = this.characters || this.worldData?.characters || [];
          const genDeceasedChars = genAllChars.filter((c: any) =>
            (c.isAlive === false || c.status === 'deceased') &&
            (c.currentLocation === settlement.id || c.currentLocation === settlement.name)
          );
          let genCemeteryCenter: Vector3 | null = null;
          let genCemeteryUsed = false;
          const genCemW = BabylonGame.CEMETERY_WIDTH;
          const genCemD = BabylonGame.CEMETERY_DEPTH;
          for (const parkLot of parkLots) {
            const parkPos = this.projectToGround(parkLot.position.x, parkLot.position.z);
            if (!genCemeteryUsed && genDeceasedChars.length > 0) {
              genCemeteryUsed = true;
              genCemeteryCenter = parkPos.clone();
              this.placeCemeteryGravestones(scene, parkPos, genDeceasedChars, settlement.id);
              // Don't place a tree on top of the cemetery lot
              continue;
            }
            // Skip trees that would overlap the cemetery
            if (genCemeteryCenter && Math.abs(parkPos.x - genCemeteryCenter.x) < genCemW / 2 + 1 && Math.abs(parkPos.z - genCemeteryCenter.z) < genCemD / 2 + 1) {
              continue;
            }
            this.placeTreeAtPosition(scene, parkPos, settlement.id);
          }
        }

        // Compute re-centering offset: lot positions are in server local-space
        // (centered around the settlement center), but the game world places the
        // settlement elsewhere. We must use the SAME centroid as the street network
        // (offsetNetwork in StreetNetworkLayout.ts) so buildings align with roads.
        // Using the lot centroid causes a shift because lots aren't symmetrically
        // distributed (park blocks have no lots).
        const lotsWithPos = lots.filter((l: any) => l.positionX != null && l.positionZ != null);
        let lotOffsetX = 0, lotOffsetZ = 0;
        if (lotsWithPos.length > 0) {
          // Prefer street waypoint centroid (same reference as offsetNetwork)
          const storedStreetsForOffset: any[] = Array.isArray(settlement.streets) ? settlement.streets : [];
          let centroidX = 0, centroidZ = 0;
          let wpCount = 0;
          for (const s of storedStreetsForOffset) {
            const wps: { x: number; z: number }[] | null =
              Array.isArray(s.waypoints) && s.waypoints.length >= 2 ? s.waypoints :
              s.properties && Array.isArray(s.properties.waypoints) && s.properties.waypoints.length >= 2 ? s.properties.waypoints :
              null;
            if (wps) {
              for (const wp of wps) { centroidX += wp.x; centroidZ += wp.z; wpCount++; }
            }
          }
          if (wpCount > 0) {
            // Use street waypoint centroid — matches offsetNetwork exactly
            centroidX /= wpCount;
            centroidZ /= wpCount;
          } else {
            // No stored streets — fall back to lot centroid
            let sumX = 0, sumZ = 0;
            for (const l of lotsWithPos) { sumX += l.positionX; sumZ += l.positionZ; }
            centroidX = sumX / lotsWithPos.length;
            centroidZ = sumZ / lotsWithPos.length;
          }
          lotOffsetX = scaledSettlement.position.x - centroidX;
          lotOffsetZ = scaledSettlement.position.z - centroidZ;
        }

        let fallbackIdx = 0;
        const resolveBuildingPosition = (building: any): { position: Vector3; facingAngle: number; zone: string } => {
          const lot = building.lotId ? lotById.get(building.lotId) : null;
          if (lot && lot.positionX != null && lot.positionZ != null) {
            return {
              position: this.projectToGround(lot.positionX + lotOffsetX, lot.positionZ + lotOffsetZ),
              facingAngle: lot.facingAngle ?? 0,
              zone: lot.building?.buildingCategory === 'business' ? 'commercial' : 'residential',
            };
          }
          // Fallback to generated position
          if (fallbackIdx < fallbackLotPositions.length) {
            return fallbackLotPositions[fallbackIdx++];
          }
          // Last resort: settlement center
          return {
            position: this.projectToGround(scaledSettlement.position.x, scaledSettlement.position.z),
            facingAngle: 0,
            zone: 'residential',
          };
        };

        // Spawn buildings (track per-settlement positions for street furniture)
        const settlementBuildingPositions: Vector3[] = [];
        const settlementBuildingSpecs: { position: Vector3; rotation: number; depth: number; width: number }[] = [];

        // First, spawn businesses at their lots
        console.log(`[BuildingPlacement] Settlement ${settlement.name}: businesses=${businesses.length}, lots=${lots.length}, lotsHavePos=${lotsHavePositions}, lotOffset=(${lotOffsetX.toFixed(1)}, ${lotOffsetZ.toFixed(1)}), settlementPos=(${scaledSettlement.position.x.toFixed(1)}, ${scaledSettlement.position.z.toFixed(1)})`);
        for (const business of businesses) {
          const lotInfo = resolveBuildingPosition(business);
          if (businesses.indexOf(business) === 0) {
            console.log(`[BuildingPlacement] First building: pos=(${lotInfo.position.x.toFixed(1)}, ${lotInfo.position.y.toFixed(1)}, ${lotInfo.position.z.toFixed(1)}), lotId=${business.lotId}`);
          }

          const bizLot = business.lotId ? lotById.get(business.lotId) : null;
          let buildingSpec = ProceduralBuildingGenerator.createSpecFromData({
            id: business.id,
            type: 'business',
            businessType: business.businessType,
            position: lotInfo.position,
            worldStyle,
            population: scaledSettlement.population,
            rotation: lotInfo.facingAngle,
            zone: lotInfo.zone as any,
            proceduralConfig: proceduralBuildingConfig,
          });

          // Clamp building footprint to lot dimensions so it doesn't overflow into streets
          if (bizLot?.lotWidth) buildingSpec.width = Math.min(buildingSpec.width, bizLot.lotWidth * 0.75);
          if (bizLot?.lotDepth) buildingSpec.depth = Math.min(buildingSpec.depth, bizLot.lotDepth * 0.75);
          // Fallback: clamp to block cell size when DB lot dimensions are unavailable
          if (!bizLot?.lotWidth || !bizLot?.lotDepth) {
            const cellSize = getBlockCellSize(scaledSettlement.radius);
            buildingSpec.width = Math.min(buildingSpec.width, cellSize.maxWidth);
            buildingSpec.depth = Math.min(buildingSpec.depth, cellSize.maxDepth);
          }

          buildingSpec = {
            ...buildingSpec,
            position: this.findStableBuildingPosition(
              buildingSpec.position,
              buildingSpec.width,
              buildingSpec.depth
            )
          };

          // Compute terrain-adaptive foundation
          buildingSpec.foundation = computeFoundationData(
            buildingSpec.position.x, buildingSpec.position.z,
            buildingSpec.width, buildingSpec.depth, sampleHeight,
          );

          const building = buildingGenerator.generateBuilding(buildingSpec);
          allBuildingPositions.push(building.position);
          settlementBuildingPositions.push(building.position.clone());
          settlementBuildingSpecs.push({
            position: building.position.clone(),
            rotation: buildingSpec.rotation,
            depth: buildingSpec.depth,
            width: buildingSpec.width,
          });

          // Store business metadata for NPC assignment
          building.metadata = {
            buildingId: business.id,
            buildingType: 'business',
            businessId: business.id,
            businessType: business.businessType,
            businessName: business.name,
            settlementId: settlement.id,
            ownerId: business.ownerId,
            employees: business.employees || []
          };
          building.isPickable = true;

          // Store in building data map for NPC positioning
          this.buildingData.set(business.id, {
            position: building.position.clone(),
            metadata: building.metadata,
            mesh: building,
            width: buildingSpec.width, depth: buildingSpec.depth, rotation: buildingSpec.rotation,
            hasPorch: buildingSpec.hasPorch, porchDepth: buildingSpec.style?.porchDepth, porchSteps: buildingSpec.style?.porchSteps,
          });

          // Register building with NPC schedule system for pathfinding
          this.npcScheduleSystem.registerBuilding(
            business.id,
            building.position.clone(),
            buildingSpec.rotation,
            buildingSpec.depth,
            'business',
            business.businessType
          );

          // Generate wall collision meshes
          this.buildingCollisionSystem?.generateCollision({
            id: business.id,
            position: building.position,
            rotation: buildingSpec.rotation,
            width: buildingSpec.width,
            depth: buildingSpec.depth,
            floors: buildingSpec.floors,
          });
          this.registerBuildingFootprint(building.position, buildingSpec.rotation, buildingSpec.width, buildingSpec.depth);

          // Register building for entry system
          this.buildingEntrySystem?.registerBuilding({
            id: business.id,
            position: building.position.clone(),
            rotation: buildingSpec.rotation,
            width: buildingSpec.width,
            depth: buildingSpec.depth,
            buildingType: 'business',
            businessType: business.businessType,
            buildingName: business.name,
            mesh: building,
            metadata: building.metadata,
          });
          this.interactionPrompt?.registerBuilding({
            id: business.id, name: business.name, mesh: building,
            doorPosition: this.computeBuildingDoorPosition(building.position, buildingSpec.rotation, buildingSpec.depth),
          });

          // Register building for hover info display
          this.buildingInfoDisplay?.registerBuilding(building);

          // Create building sign — always show business name; bilingual if language data exists
          if (this.buildingSignManager) {
            const tracker = this.chatPanel?.getLanguageTracker();
            if (tracker) {
              this.buildingSignManager.setPlayerFluency(tracker.getFluency());
            }
            const lang = (this.worldData as any)?.targetLanguage || '';
            const signEntry = lang ? getBusinessSign(lang, business.id, business.businessType || '', business.name) : null;
            const displayName = signEntry?.targetText || business.name || business.businessType || 'Business';
            this.buildingSignManager.createBuildingSign(building, {
              buildingId: business.id,
              nativeName: business.businessType || 'Business',
              targetName: displayName,
              targetDetail: signEntry?.detailText,
              buildingType: 'business',
              businessType: business.businessType,
            });
          }

          // Door-mounted business name plaque
          this.createDoorLabel(
            scene, business.id,
            business.name || business.businessType || 'Business',
            building.position, buildingSpec.rotation,
            buildingSpec.depth, buildingSpec.width
          );

        }

        // Then spawn residences from backend data
        for (const residence of residences) {
          const lotInfo = resolveBuildingPosition(residence);

          // Determine residence type based on occupancy/size
          const occupants = residence.residentIds || residence.occupants || [];
          const sizeCategory = occupants.length > 8
            ? 'residence_large'
            : occupants.length > 4
              ? 'residence_medium'
              : 'residence_small';

          // Use the actual DB residenceType (e.g. 'house', 'cottage') so that
          // asset collection models keyed by residence type are matched.
          // Fall back to size-based category for legacy/procedural generation.
          const residenceType = (residence as any).residenceType || sizeCategory;

          const resLot = residence.lotId ? lotById.get(residence.lotId) : null;
          let buildingSpec = ProceduralBuildingGenerator.createSpecFromData({
            id: residence.id,
            type: 'residence',
            businessType: residenceType,
            position: lotInfo.position,
            worldStyle,
            population: occupants.length,
            rotation: lotInfo.facingAngle,
            zone: lotInfo.zone as any,
            proceduralConfig: proceduralBuildingConfig,
          });

          // Clamp building footprint to lot dimensions so it doesn't overflow into streets
          if (resLot?.lotWidth) buildingSpec.width = Math.min(buildingSpec.width, resLot.lotWidth * 0.75);
          if (resLot?.lotDepth) buildingSpec.depth = Math.min(buildingSpec.depth, resLot.lotDepth * 0.75);
          // Fallback: clamp to block cell size when DB lot dimensions are unavailable
          if (!resLot?.lotWidth || !resLot?.lotDepth) {
            const cellSize = getBlockCellSize(scaledSettlement.radius);
            buildingSpec.width = Math.min(buildingSpec.width, cellSize.maxWidth);
            buildingSpec.depth = Math.min(buildingSpec.depth, cellSize.maxDepth);
          }

          buildingSpec = {
            ...buildingSpec,
            position: this.findStableBuildingPosition(
              buildingSpec.position,
              buildingSpec.width,
              buildingSpec.depth
            )
          };

          // Compute terrain-adaptive foundation
          buildingSpec.foundation = computeFoundationData(
            buildingSpec.position.x, buildingSpec.position.z,
            buildingSpec.width, buildingSpec.depth, sampleHeight,
          );

          const building = buildingGenerator.generateBuilding(buildingSpec);
          allBuildingPositions.push(building.position);
          settlementBuildingSpecs.push({
            position: building.position.clone(),
            rotation: buildingSpec.rotation,
            depth: buildingSpec.depth,
            width: buildingSpec.width,
          });

          // Store residence position for NPC assignment
          building.metadata = {
            buildingId: residence.id,
            buildingType: 'residence',
            residenceId: residence.id,
            settlementId: settlement.id,
            occupants: residence.residentIds || residence.occupants
          };
          building.isPickable = true;

          // Store in building data map for NPC positioning
          this.buildingData.set(residence.id, {
            position: building.position.clone(),
            metadata: building.metadata,
            mesh: building,
            width: buildingSpec.width, depth: buildingSpec.depth, rotation: buildingSpec.rotation,
            hasPorch: buildingSpec.hasPorch, porchDepth: buildingSpec.style?.porchDepth, porchSteps: buildingSpec.style?.porchSteps,
          });

          // Register building with NPC schedule system for pathfinding
          this.npcScheduleSystem.registerBuilding(
            residence.id,
            building.position.clone(),
            buildingSpec.rotation,
            buildingSpec.depth,
            'residence'
          );

          // Generate wall collision meshes
          this.buildingCollisionSystem?.generateCollision({
            id: residence.id,
            position: building.position,
            rotation: buildingSpec.rotation,
            width: buildingSpec.width,
            depth: buildingSpec.depth,
            floors: buildingSpec.floors,
          });
          this.registerBuildingFootprint(building.position, buildingSpec.rotation, buildingSpec.width, buildingSpec.depth);

          // Register building for entry system
          this.buildingEntrySystem?.registerBuilding({
            id: residence.id,
            position: building.position.clone(),
            rotation: buildingSpec.rotation,
            width: buildingSpec.width,
            depth: buildingSpec.depth,
            buildingType: 'residence',
            buildingName: 'Residence',
            mesh: building,
            metadata: building.metadata,
          });
          this.interactionPrompt?.registerBuilding({
            id: residence.id, name: 'Residence', mesh: building,
            doorPosition: this.computeBuildingDoorPosition(building.position, buildingSpec.rotation, buildingSpec.depth),
          });

          // Register building for hover info display
          this.buildingInfoDisplay?.registerBuilding(building);

          // Create residence sign — always show address; bilingual if language data exists
          if (this.buildingSignManager) {
            const tracker = this.chatPanel?.getLanguageTracker();
            if (tracker) {
              this.buildingSignManager.setPlayerFluency(tracker.getFluency());
            }
            const lang = (this.worldData as any)?.targetLanguage || '';
            const resType = (residence as any).residenceType || residenceType;
            const signEntry = lang ? getResidenceSign(lang, residence.id, resType) : null;
            // Build address from lot data: "42 Main St" or fallback to type label
            const houseNum = resLot?.houseNumber;
            const streetName = resLot?.streetName;
            const addressLabel = houseNum && streetName
              ? `${houseNum} ${streetName}`
              : streetName
                ? streetName
                : resType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
            this.buildingSignManager.createBuildingSign(building, {
              buildingId: residence.id,
              nativeName: addressLabel,
              targetName: signEntry?.targetText || addressLabel,
              buildingType: 'residence',
            });
          }

          // Door-mounted address number
          const doorNumber = resLot?.houseNumber ? String(resLot.houseNumber) : null;
          if (doorNumber) {
            this.createDoorLabel(
              scene, residence.id, doorNumber,
              building.position, buildingSpec.rotation,
              buildingSpec.depth, buildingSpec.width
            );
          }
        }

        // Place trees/features at DB park lots (park, forest, cemetery, garden)
        const parkLotTypes = new Set(['park', 'forest', 'cemetery', 'garden']);
        const dbParkLots = lots.filter((l: any) =>
          parkLotTypes.has(l.lotType) && l.positionX != null && l.positionZ != null
        );
        const allChars = this.characters || this.worldData?.characters || [];
        const deceasedChars = allChars.filter((c: any) =>
          (c.isAlive === false || c.status === 'deceased') &&
          (c.currentLocation === settlement.id || c.currentLocation === settlement.name)
        );
        let cemeteryCenter: Vector3 | null = null;
        for (const parkLot of dbParkLots) {
          const parkPos = this.projectToGround(
            parkLot.positionX + lotOffsetX,
            parkLot.positionZ + lotOffsetZ
          );
          const pw = parkLot.lotWidth || 30;
          const pd = parkLot.lotDepth || 30;
          const lt = parkLot.lotType || 'park';

          // Seeded RNG for deterministic placement
          let parkSeed = 0;
          for (let ci = 0; ci < parkLot.id.length; ci++) parkSeed = ((parkSeed << 5) - parkSeed + parkLot.id.charCodeAt(ci)) | 0;
          parkSeed = Math.abs(parkSeed);
          const parkRng = () => { parkSeed = (parkSeed * 16807 + 0) % 2147483647; return parkSeed / 2147483647; };

          if (lt === 'cemetery') {
            // Cemetery: place gravestones
            cemeteryCenter = parkPos.clone();
            this.placeCemeteryGravestones(scene, parkPos, deceasedChars, settlement.id);
          } else if (lt === 'forest' || lt === 'garden') {
            // Forest/garden: dense trees
            const treeCount = Math.max(4, Math.floor((pw * pd) / 80));
            for (let ti = 0; ti < treeCount; ti++) {
              const tx = parkPos.x + (parkRng() - 0.5) * pw * 0.8;
              const tz = parkPos.z + (parkRng() - 0.5) * pd * 0.8;
              const treePos = this.projectToGround(tx, tz);
              this.placeTreeAtPosition(scene, treePos, settlement.id);
            }
          } else {
            // Town square (park): place notice board area + scattered trees
            const treeCount = Math.max(2, Math.floor((pw * pd) / 120));
            for (let ti = 0; ti < treeCount; ti++) {
              const tx = parkPos.x + (parkRng() - 0.5) * pw * 0.8;
              const tz = parkPos.z + (parkRng() - 0.5) * pd * 0.8;
              const treePos = this.projectToGround(tx, tz);
              this.placeTreeAtPosition(scene, treePos, settlement.id);
            }
          }
        }

        // Collect DB lots not yet claimed by a business or residence for auto-fill
        const usedLotIds = new Set<string>();
        for (const b of businesses) { if (b.lotId) usedLotIds.add(b.lotId); }
        for (const r of residences) { if (r.lotId) usedLotIds.add(r.lotId); }
        const unclaimedLots = lots.filter((l: any) =>
          !usedLotIds.has(l.id) && !parkLotTypes.has(l.lotType) && l.positionX != null && l.positionZ != null
        );
        // Also build a simple fallback array for auto-fill phases
        const autoFillPositions = unclaimedLots.map((l: any) => ({
          position: this.projectToGround(l.positionX + lotOffsetX, l.positionZ + lotOffsetZ),
          facingAngle: l.facingAngle ?? 0,
          zone: 'residential' as const,
        }));
        let autoFillIdx = 0;

        // Phase 1: Fill with minimum business buildings if backend didn't provide any
        if (businesses.length === 0 && autoFillIdx < autoFillPositions.length) {
          // Determine world-type-appropriate business mix
          const wt = (worldType || '').toLowerCase();
          let businessMix: { businessType: string; name: string }[];

          if (wt.includes('medieval') || wt.includes('fantasy') || wt.includes('mytholog')) {
            businessMix = [
              { businessType: 'Tavern', name: 'Tavern' },
              { businessType: 'Blacksmith', name: 'Smithy' },
              { businessType: 'Market', name: 'Market' },
              { businessType: 'Inn', name: 'Inn' },
              { businessType: 'Church', name: 'Temple' },
            ];
          } else if (wt.includes('cyberpunk') || wt.includes('sci-fi') || wt.includes('modern')) {
            businessMix = [
              { businessType: 'Restaurant', name: 'Eatery' },
              { businessType: 'Shop', name: 'Shop' },
              { businessType: 'Hospital', name: 'Clinic' },
              { businessType: 'Bank', name: 'Bank' },
              { businessType: 'Theater', name: 'Entertainment Hub' },
            ];
          } else if (wt.includes('western') || wt.includes('frontier')) {
            businessMix = [
              { businessType: 'Tavern', name: 'Saloon' },
              { businessType: 'Shop', name: 'General Store' },
              { businessType: 'Blacksmith', name: 'Smithy' },
              { businessType: 'Bank', name: 'Bank' },
            ];
          } else if (wt.includes('pirate') || wt.includes('tropical')) {
            businessMix = [
              { businessType: 'Tavern', name: 'Tavern' },
              { businessType: 'Market', name: 'Harbor Market' },
              { businessType: 'Shop', name: 'Trade Post' },
              { businessType: 'Inn', name: 'Inn' },
            ];
          } else if (wt.includes('steampunk')) {
            businessMix = [
              { businessType: 'Tavern', name: 'Pub' },
              { businessType: 'Blacksmith', name: 'Workshop' },
              { businessType: 'Shop', name: 'Emporium' },
              { businessType: 'Library', name: 'Library' },
              { businessType: 'Bank', name: 'Bank' },
            ];
          } else if (wt.includes('post-apocal')) {
            businessMix = [
              { businessType: 'Market', name: 'Trading Post' },
              { businessType: 'Blacksmith', name: 'Workshop' },
              { businessType: 'Restaurant', name: 'Mess Hall' },
            ];
          } else {
            // Generic default
            businessMix = [
              { businessType: 'Tavern', name: 'Tavern' },
              { businessType: 'Shop', name: 'Shop' },
              { businessType: 'Blacksmith', name: 'Workshop' },
              { businessType: 'Market', name: 'Market' },
            ];
          }

          // Scale: use at most ~40% of lot positions for businesses, minimum 2
          const maxBusinessSlots = Math.max(2, Math.floor(autoFillPositions.length * 0.4));
          const businessesToPlace = businessMix.slice(0, Math.min(businessMix.length, maxBusinessSlots));

          for (const biz of businessesToPlace) {
            if (autoFillIdx >= autoFillPositions.length) break;
            const slotInfo = autoFillPositions[autoFillIdx];

            const bizId = `business_auto_${settlement.id}_${autoFillIdx}`;
            let buildingSpec = ProceduralBuildingGenerator.createSpecFromData({
              id: bizId,
              type: 'business',
              businessType: biz.businessType,
              position: slotInfo.position,
              worldStyle,
              population: scaledSettlement.population,
              rotation: slotInfo.facingAngle,
              zone: slotInfo.zone,
              proceduralConfig: proceduralBuildingConfig,
            });

            // Clamp auto-fill buildings to block cell size
            {
              const cellSize = getBlockCellSize(scaledSettlement.radius);
              buildingSpec.width = Math.min(buildingSpec.width, cellSize.maxWidth);
              buildingSpec.depth = Math.min(buildingSpec.depth, cellSize.maxDepth);
            }

            buildingSpec = {
              ...buildingSpec,
              position: this.findStableBuildingPosition(
                buildingSpec.position,
                buildingSpec.width,
                buildingSpec.depth
              )
            };

            // Compute terrain-adaptive foundation
            buildingSpec.foundation = computeFoundationData(
              buildingSpec.position.x, buildingSpec.position.z,
              buildingSpec.width, buildingSpec.depth, sampleHeight,
            );

            const building = buildingGenerator.generateBuilding(buildingSpec);
            allBuildingPositions.push(building.position);
            settlementBuildingPositions.push(building.position.clone());

            building.metadata = {
              buildingId: bizId,
              buildingType: 'business',
              businessId: bizId,
              businessType: biz.businessType,
              businessName: biz.name,
              settlementId: settlement.id,
              ownerId: null,
              employees: []
            };
            building.isPickable = true;

            this.buildingData.set(bizId, {
              position: building.position.clone(),
              metadata: building.metadata,
              mesh: building,
              width: buildingSpec.width, depth: buildingSpec.depth, rotation: buildingSpec.rotation,
              hasPorch: buildingSpec.hasPorch, porchDepth: buildingSpec.style?.porchDepth, porchSteps: buildingSpec.style?.porchSteps,
            });

            // Register with NPC schedule system
            this.npcScheduleSystem.registerBuilding(
              bizId,
              building.position.clone(),
              buildingSpec.rotation,
              buildingSpec.depth,
              'business'
            );

            // Generate wall collision meshes
            this.buildingCollisionSystem?.generateCollision({
              id: bizId,
              position: building.position,
              rotation: buildingSpec.rotation,
              width: buildingSpec.width,
              depth: buildingSpec.depth,
              floors: buildingSpec.floors,
            });
            this.registerBuildingFootprint(building.position, buildingSpec.rotation, buildingSpec.width, buildingSpec.depth);

            // Register building for entry system
            this.buildingEntrySystem?.registerBuilding({
              id: bizId,
              position: building.position.clone(),
              rotation: buildingSpec.rotation,
              width: buildingSpec.width,
              depth: buildingSpec.depth,
              buildingType: 'business',
              businessType: biz.businessType,
              buildingName: biz.name,
              mesh: building,
              metadata: building.metadata,
            });
            this.interactionPrompt?.registerBuilding({
              id: bizId, name: biz.name, mesh: building,
              doorPosition: this.computeBuildingDoorPosition(building.position, buildingSpec.rotation, buildingSpec.depth),
            });

            this.buildingInfoDisplay?.registerBuilding(building);

            // Create business name sign
            if (this.buildingSignManager) {
              this.buildingSignManager.createBuildingSign(building, {
                buildingId: bizId,
                nativeName: biz.businessType,
                targetName: biz.name,
                buildingType: 'business',
                businessType: biz.businessType,
              });
            }

            // Door-mounted business name plaque
            this.createDoorLabel(
              scene, bizId, biz.name,
              building.position, buildingSpec.rotation,
              buildingSpec.depth, buildingSpec.width
            );

            autoFillIdx++;
          }

        }

        // Phase 2: Fill any remaining positions with generic residences
        while (autoFillIdx < autoFillPositions.length) {
          const slotInfo = autoFillPositions[autoFillIdx];
          const residenceType = Math.random() > 0.7
            ? 'residence_large'
            : Math.random() > 0.4
              ? 'residence_medium'
              : 'residence_small';

          let buildingSpec = ProceduralBuildingGenerator.createSpecFromData({
            id: `residence_generic_${settlement.id}_${autoFillIdx}`,
            type: 'residence',
            businessType: residenceType,
            position: slotInfo.position,
            worldStyle,
            population: Math.floor(scaledSettlement.population / buildingCount),
            rotation: slotInfo.facingAngle,
            zone: slotInfo.zone,
            proceduralConfig: proceduralBuildingConfig,
          });

          // Clamp auto-fill residences to block cell size
          {
            const cellSize = getBlockCellSize(scaledSettlement.radius);
            buildingSpec.width = Math.min(buildingSpec.width, cellSize.maxWidth);
            buildingSpec.depth = Math.min(buildingSpec.depth, cellSize.maxDepth);
          }

          buildingSpec = {
            ...buildingSpec,
            position: this.findStableBuildingPosition(
              buildingSpec.position,
              buildingSpec.width,
              buildingSpec.depth
            )
          };

          // Compute terrain-adaptive foundation
          buildingSpec.foundation = computeFoundationData(
            buildingSpec.position.x, buildingSpec.position.z,
            buildingSpec.width, buildingSpec.depth, sampleHeight,
          );

          const building = buildingGenerator.generateBuilding(buildingSpec);
          allBuildingPositions.push(building.position);
          settlementBuildingPositions.push(building.position.clone());

          // Add metadata for generic residences
          const genericResId = `residence_generic_${settlement.id}_${autoFillIdx}`;
          building.metadata = {
            buildingId: genericResId,
            buildingType: 'residence',
            residenceId: genericResId,
            settlementId: settlement.id,
            occupants: []
          };
          building.isPickable = true;

          // Store in building data map for E-key interaction
          this.buildingData.set(genericResId, {
            position: building.position.clone(),
            metadata: building.metadata,
            mesh: building,
            width: buildingSpec.width, depth: buildingSpec.depth, rotation: buildingSpec.rotation,
            hasPorch: buildingSpec.hasPorch, porchDepth: buildingSpec.style?.porchDepth, porchSteps: buildingSpec.style?.porchSteps,
          });

          // Generate wall collision meshes
          this.buildingCollisionSystem?.generateCollision({
            id: genericResId,
            position: building.position,
            rotation: buildingSpec.rotation,
            width: buildingSpec.width,
            depth: buildingSpec.depth,
            floors: buildingSpec.floors,
          });
          this.registerBuildingFootprint(building.position, buildingSpec.rotation, buildingSpec.width, buildingSpec.depth);

          // Register building for entry system
          this.buildingEntrySystem?.registerBuilding({
            id: genericResId,
            position: building.position.clone(),
            rotation: buildingSpec.rotation,
            width: buildingSpec.width,
            depth: buildingSpec.depth,
            buildingType: 'residence',
            buildingName: 'Residence',
            mesh: building,
            metadata: building.metadata,
          });
          this.interactionPrompt?.registerBuilding({
            id: genericResId, name: 'Residence', mesh: building,
            doorPosition: this.computeBuildingDoorPosition(building.position, buildingSpec.rotation, buildingSpec.depth),
          });

          // Register building for hover info display
          this.buildingInfoDisplay?.registerBuilding(building);

          // Create residence sign with type label
          if (this.buildingSignManager) {
            const typeLabel = residenceType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
            this.buildingSignManager.createBuildingSign(building, {
              buildingId: genericResId,
              nativeName: typeLabel,
              targetName: typeLabel,
              buildingType: 'residence',
            });
          }

          autoFillIdx++;
        }

        // Generate street furniture (lamp posts, benches, barrels, etc.) near buildings
        const settlementCenterForProps = this.projectToGround(
          scaledSettlement.position.x,
          scaledSettlement.position.z
        );
        this.generateStreetFurniture(
          settlement.id,
          settlementCenterForProps,
          settlementBuildingPositions,
          worldType || '',
          sampleHeight
        );

        // Generate intra-settlement streets using street network topology
        if (this.roadGenerator) {
          // Prefer street network graph if available (new procgen format)
          if (
            settlement.streets &&
            !Array.isArray(settlement.streets) &&
            settlement.streets.nodes &&
            settlement.streets.edges
          ) {
            this.roadGenerator.generateStreetNetworkRoads(
              settlement.streets,
              sampleHeight
            );
          } else {
            // Try to reconstruct a StreetNetwork from stored street waypoints
            // so we render the server-generated layout instead of regenerating.
            let serverNetwork: { nodes: any[]; segments: any[] } | null = null;
            const storedStreets2: any[] = Array.isArray(settlement.streets) ? settlement.streets : [];
            const getWps = (s: any): { x: number; z: number }[] | null => {
              if (Array.isArray(s.waypoints) && s.waypoints.length >= 2) return s.waypoints;
              if (s.properties && Array.isArray(s.properties.waypoints) && s.properties.waypoints.length >= 2) return s.properties.waypoints;
              return null;
            };
            const hasWaypoints = storedStreets2.some((s: any) => getWps(s) !== null);

            if (hasWaypoints) {
              // Build nodes from ALL waypoints (not just endpoints) so that
              // intermediate intersections are properly detected. Two segments
              // sharing a waypoint position means that point is an intersection.
              const nodeMap = new Map<string, { id: string; x: number; z: number; intersectionOf: string[] }>();
              const segments: any[] = [];
              const nodeKey = (x: number, z: number) => `${Math.round(x * 10)}:${Math.round(z * 10)}`;
              const getOrCreateNode = (x: number, z: number) => {
                const key = nodeKey(x, z);
                if (!nodeMap.has(key)) {
                  nodeMap.set(key, { id: `n-${nodeMap.size}`, x, z, intersectionOf: [] });
                }
                return nodeMap.get(key)!;
              };

              for (const s of storedStreets2) {
                const wps: { x: number; z: number }[] | null = getWps(s);
                if (!wps) continue;

                const segId = s.id || `seg-${segments.length}`;

                // Register ALL waypoints as potential nodes (intersections are
                // detected by having intersectionOf.length >= 2)
                const segNodeIds: string[] = [];
                for (const wp of wps) {
                  const node = getOrCreateNode(wp.x, wp.z);
                  if (!node.intersectionOf.includes(segId)) {
                    node.intersectionOf.push(segId);
                  }
                  segNodeIds.push(node.id);
                }

                segments.push({
                  id: segId,
                  name: s.name || '',
                  direction: s.direction || 'NS',
                  nodeIds: segNodeIds,
                  waypoints: wps,
                  width: s.width || 2.5,
                });
              }

              serverNetwork = {
                nodes: Array.from(nodeMap.values()),
                segments,
              };
            }

            const streetNetwork = buildStreetNetwork(
              {
                settlementId: settlement.id,
                centerX: settlementCenterForProps.x,
                centerZ: settlementCenterForProps.z,
                radius: scaledSettlement.radius,
                population: scaledSettlement.population,
                settlementType: settlement.settlementType || scaledSettlement.settlementType || 'town',
                streetNames: storedStreets2.map((s: any) => s.name).filter(Boolean),
              },
              serverNetwork
            );
            this.roadGenerator.generateSettlementStreets(
              settlement.id,
              streetNetwork,
              sampleHeight
            );
            // Generate walkway paths from sidewalks to building front doors
            if (settlementBuildingSpecs.length > 0) {
              this.roadGenerator.generateBuildingWalkways(
                settlementBuildingSpecs,
                streetNetwork,
                sampleHeight
              );
            }
            // Place lamp posts along sidewalks and register lights with day/night cycle
            const lampLights = this.roadGenerator.placeLampPosts(settlement.id, streetNetwork, sampleHeight);
            if (this.dayNightCycle && lampLights.length > 0) {
              this.dayNightCycle.addStreetLights(lampLights);
            }

            // Register street network with NPC schedule system for sidewalk pathfinding
            this.npcScheduleSystem.addStreetNetwork(streetNetwork, sampleHeight);

            // Collect street segments for minimap overlay
            for (const seg of streetNetwork.segments) {
              if (seg.waypoints.length >= 2) {
                this._minimapStreets.push({ waypoints: seg.waypoints, width: seg.width });
              }
            }
          }
        }

        // Spawn outdoor containers near buildings (using real building geometry)
        if (this.containerSpawnSystem && this.interactionPrompt) {
          const buildingContexts: import('./ContainerSpawnSystem').BuildingContainerContext[] = [];
          for (const [buildingId, buildingInfo] of this.buildingData) {
            const meta = buildingInfo.metadata as Record<string, any> | undefined;
            if (!meta?.settlementId || meta.settlementId !== settlement.id) continue;
            buildingContexts.push({
              buildingId,
              position: buildingInfo.position,
              width: buildingInfo.width,
              depth: buildingInfo.depth,
              rotation: buildingInfo.rotation,
              businessType: meta?.businessType,
              buildingType: meta?.buildingType,
              hasPorch: buildingInfo.hasPorch,
              porchDepth: buildingInfo.porchDepth,
              porchSteps: buildingInfo.porchSteps,
            });
          }
          if (buildingContexts.length > 0) {
            const spawned = this.containerSpawnSystem.spawnExteriorContainers(buildingContexts);
            for (const container of spawned) {
              if (container.mesh) {
                this.interactionPrompt.registerContainer(
                  container.mesh,
                  container.id,
                  container.type,
                  container.type,
                  false,
                );
              }
            }
          }
        }

        // Create a subtle ground marker and signpost for the settlement center
        const settlementCenter = this.projectToGround(
          scaledSettlement.position.x,
          scaledSettlement.position.z
        );
        // Add settlement center to avoidance list so trees don't spawn on the sign
        allBuildingPositions.push(settlementCenter.clone());

        // Store player spawn position — prefer 'landing' settlement (dock/arrival point),
        // fall back to first settlement if no landing exists.
        // Landing always wins, even if a fallback was already set from an earlier index.
        const isLanding = (settlement as any).settlementType === 'landing';
        if (isLanding || (!this.firstSettlementSpawnPosition && i === 0)) {
          // Always offset from center by at least the settlement radius
          const offsetDist = Math.max(scaledSettlement.radius || 30, 30);
          const spawnEdge = this.projectToGround(
            settlementCenter.x + offsetDist,
            settlementCenter.z
          );
          spawnEdge.y += 0.5;
          this.firstSettlementSpawnPosition = spawnEdge;
          console.log(`[Spawn] Player spawn set to edge of town: (${spawnEdge.x.toFixed(1)}, ${spawnEdge.y.toFixed(1)}, ${spawnEdge.z.toFixed(1)}), offset=${offsetDist.toFixed(1)} from center (${settlementCenter.x.toFixed(1)}, ${settlementCenter.z.toFixed(1)})`);
        }

        // ── Town Square ──────────────────────────────────────────────────────
        // Creates a decorated plaza at the settlement center with a central feature,
        // benches, lamps, and structured positions for civic objects.
        // Use the actual DB park lot position/dimensions so assets align with
        // the park trees instead of a separately-computed grid position.
        const sampleH = (x: number, z: number) => this.projectToGround(x, z).y;
        const primaryParkLot = dbParkLots[0];
        let parkBlockBounds: { minX: number; maxX: number; minZ: number; maxZ: number } | null = null;
        let parkCenter = settlementCenter;
        if (primaryParkLot) {
          const px = primaryParkLot.positionX + lotOffsetX;
          const pz = primaryParkLot.positionZ + lotOffsetZ;
          const hw = (primaryParkLot.lotWidth || 30) / 2;
          const hd = (primaryParkLot.lotDepth || 30) / 2;
          parkBlockBounds = { minX: px - hw, maxX: px + hw, minZ: pz - hd, maxZ: pz + hd };
          parkCenter = new Vector3(px, 0, pz);
        } else {
          parkBlockBounds = getCenterBlockBounds(settlementCenter, scaledSettlement.radius);
        }
        const townSquare = createTownSquare(scene, {
          settlementId: settlement.id,
          settlementName: settlement.name,
          center: parkCenter,
          worldType: this.config.worldType || '',
          sampleHeight: sampleH,
          blockBounds: parkBlockBounds,
        });
        // Track all square meshes for disposal
        for (const m of townSquare.meshes) {
          this.worldPropMeshes.push(m);
        }

        // Settlement signpost at the town square edge
        const signPole = MeshBuilder.CreateCylinder(
          `settlement_sign_pole_${settlement.id}`,
          { height: 3, diameter: 0.15, tessellation: 8 },
          scene
        );
        signPole.position = townSquare.signPosition.clone();
        signPole.position.y += 1.5;
        signPole.isPickable = false;

        const poleMat = new StandardMaterial(`settlement_sign_pole_mat_${settlement.id}`, scene);
        poleMat.diffuseColor = new Color3(0.35, 0.25, 0.15);
        poleMat.specularColor = Color3.Black();
        signPole.material = poleMat;
        this.worldPropMeshes.push(signPole);

        // Name plate on the signpost
        const signPlate = MeshBuilder.CreatePlane(
          `settlement_sign_plate_${settlement.id}`,
          { width: 3, height: 0.8 },
          scene
        );
        signPlate.position = townSquare.signPosition.clone();
        signPlate.position.y += 3.2;
        signPlate.billboardMode = Mesh.BILLBOARDMODE_Y;
        signPlate.isPickable = false;

        const signTexture = new DynamicTexture(
          `settlement_sign_tex_${settlement.id}`,
          { width: 256, height: 64 },
          scene,
          false
        );
        const ctx = signTexture.getContext() as CanvasRenderingContext2D;
        ctx.fillStyle = 'rgba(50, 35, 20, 0.85)';
        ctx.fillRect(0, 0, 256, 64);
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, 252, 60);
        ctx.fillStyle = '#e8d5b5';
        ctx.font = 'bold 22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(settlement.name, 128, 32);
        signTexture.update();

        const signMat = new StandardMaterial(`settlement_sign_mat_${settlement.id}`, scene);
        signMat.diffuseTexture = signTexture;
        signMat.emissiveTexture = signTexture;
        signMat.useAlphaFromDiffuseTexture = true;
        signMat.disableLighting = true;
        signPlate.material = signMat;
        this.worldPropMeshes.push(signPlate);

        signPlate.addLODLevel(300, null);
        signPole.addLODLevel(200, null);

        // Use the town square root as the settlement marker for the map
        const settlementMarker = townSquare.root as any as Mesh;

        // Spawn world-type-specific props at structured town square positions
        if (this.objectModelTemplates.size > 0 && townSquare.propPositions.length > 0) {
          const availableRoles = Array.from(this.objectModelTemplates.keys());
          const rolesToSpawn = availableRoles.slice(0, townSquare.propPositions.length);

          for (let idx = 0; idx < Math.min(rolesToSpawn.length, townSquare.propPositions.length); idx++) {
            const role = rolesToSpawn[idx];
            const template = this.objectModelTemplates.get(role);
            if (!template) continue;

            const propPos = townSquare.propPositions[idx].clone();
            propPos.y += 0.3;

            let propInstance: Mesh | null = null;
            if (template.getTotalVertices() === 0 && template.getChildMeshes().length > 0) {
              const root = template.instantiateHierarchy(
                null,
                undefined,
                (source, clone) => { clone.name = `${source.name}_prop_${role}_${idx}`; }
              );
              if (root) {
                root.setEnabled(true);
                root.getChildMeshes().forEach(m => m.setEnabled(true));
                propInstance = root as Mesh;
              }
            } else {
              propInstance = template.clone(`prop_${role}_${settlement.id}_${idx}`) as Mesh;
            }
            if (!propInstance) continue;
            propInstance.position = propPos;
            propInstance.isVisible = true;
            propInstance.setEnabled(true);
            propInstance.checkCollisions = true;
            propInstance.isPickable = true;
            const propScaleHint = this.objectModelScaleHints.get(role);
            let propAbsScale: number;
            if (propScaleHint != null && propScaleHint > 0) {
              propAbsScale = propScaleHint;
            } else {
              const propSizeMap: Record<string, number> = {
                'chest': 0.6, 'data_pad': 0.3, 'lantern': 0.5,
                'lamp': 2.5, 'lamp_table': 0.5, 'storage': 0.8,
                'storage_alt': 0.8, 'furniture_stool': 0.5, 'furniture_chair': 0.8,
                'furniture_table': 0.8, 'prop': 0.8, 'decoration': 0.6,
                'electronics': 0.4,
              };
              const propTarget = propSizeMap[role] || 0.8;
              const propOrigH = this.objectModelOriginalHeights.get(role) || 1;
              propAbsScale = propTarget / propOrigH;
            }
            propInstance.scaling.set(propAbsScale, propAbsScale, propAbsScale);
            propInstance.metadata = { ...(propInstance.metadata || {}), objectRole: role };
            propInstance.getChildMeshes().forEach(child => {
              child.isPickable = true;
              child.checkCollisions = true;
              child.metadata = { ...(child.metadata || {}), objectRole: role };
            });
            this.worldPropMeshes.push(propInstance);
          }
        }

        settlementMap.set(settlement.id, settlementMarker);
        boundaryData.push({ id: settlement.id, settlement, position: settlementCenter.clone() });

        // Register settlement as a safe zone with rule enforcer
        this.ruleEnforcer?.registerSettlementZone(
          settlement.id,
          scaledSettlement.position.clone(),
          scaledSettlement.radius
        );

        // Place physical notice board at town square edge
        if (this.settlementNoticeBoard) {
          const settlementNPCs: NPCAuthorInfo[] = (this.characters || [])
            .filter((c: any) => c.settlementId === settlement.id || c.currentLocation === settlement.id)
            .slice(0, 6)
            .map((c: any) => ({
              characterId: c.id,
              name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
              occupation: c.occupation || undefined,
            }));
          const articles = generateSettlementNotices(settlement.id, settlement.name, settlementNPCs);
          // Add notice/flyer/letter DB texts to the board
          const boardCategories = new Set(['notice', 'flyer', 'letter']);
          const noticeTexts = this.fullTextCache.filter(t => boardCategories.has(t.textCategory));
          for (const nt of noticeTexts) {
            articles.push(dbTextToNoticeArticle(nt as any));
          }
          const boardNode = this.settlementNoticeBoard.createBoard({
            settlementId: settlement.id,
            settlementName: settlement.name,
            position: townSquare.noticeBoardPosition.clone(),
            articles,
            playerFluency: 0,
          });
          // Register notice board with unified interaction prompt
          if (boardNode && this.interactionPrompt) {
            const boardMesh = boardNode instanceof Mesh ? boardNode : boardNode.getChildMeshes()[0] as Mesh;
            if (boardMesh) {
              this.interactionPrompt.registerNoticeBoard(boardMesh, settlement.id, 'Notice Board');
            }
          }
        }
      } catch (error) {
        console.error(`Failed to generate buildings for settlement ${settlement.name}:`, error);
      }
    }

    this.settlementMeshes = settlementMap;

    // Generate roads between settlements
    if (this.roadGenerator && boundaryData.length >= 2) {

      // Set road appearance based on world type (softer colors as texture fallback)
      const wt = (this.config.worldType || '').toLowerCase();
      if (wt.includes('medieval') || wt.includes('fantasy')) {
        this.roadGenerator.setRoadColor(new Color3(0.42, 0.38, 0.33)); // Soft dirt path
        this.roadGenerator.setRoadWidth(10);
      } else if (wt.includes('cyberpunk') || wt.includes('sci-fi') || wt.includes('modern')) {
        this.roadGenerator.setRoadColor(new Color3(0.36, 0.36, 0.38)); // Soft asphalt
        this.roadGenerator.setRoadWidth(14);
      } else if (wt.includes('desert') || wt.includes('sand')) {
        this.roadGenerator.setRoadColor(new Color3(0.50, 0.46, 0.40)); // Soft sandy path
        this.roadGenerator.setRoadWidth(8);
      } else {
        this.roadGenerator.setRoadColor(new Color3(0.40, 0.39, 0.36)); // Soft neutral default
        this.roadGenerator.setRoadWidth(10);
      }

      // Apply road texture from asset collection if available, otherwise use default asphalt
      if (this.textureManager && this.selectedRoadTexture) {
        const roadAsset = this.worldAssets.find((a) => a.id === this.selectedRoadTexture);
        if (roadAsset) {
          const roadTex = this.textureManager.loadTexture(roadAsset);
          this.roadGenerator.setRoadTexture(roadTex);
        }
      }
      // Fall back to built-in asphalt texture for realistic roads
      this.roadGenerator.loadDefaultAsphaltTexture();

      const settlementNodes = boundaryData.map((s) => ({
        id: s.id,
        position: s.position
      }));

      this.roadGenerator.generateRoads(settlementNodes, sampleHeight);
    }

    // Water generation disabled — rivers were overlapping with settlements.
    // Register any existing water meshes as fishing hotspots
    if (this.waterRenderer && this.interactionPrompt) {
      const waterMeshes = this.waterRenderer.getWaterMeshes();
      for (const wMesh of waterMeshes) {
        wMesh.isPickable = true;
        const prompt = PlayerActionSystem.getPromptText('fishing');
        this.interactionPrompt.registerActionHotspot(wMesh, 'fishing', prompt);
      }
    }

    // Generate nature elements (trees, rocks, grass, flowers)

    // Validate nature positions against roads, sidewalks, and buildings
    natureGenerator.setPositionValidator((x, z) => {
      if (this.isPointInsideAnyBuilding(x, z)) return true;
      // roadHalfWidth + 2m margin covers road surface + sidewalk buffer
      if (this.roadGenerator?.isPointOnRoad(x, z, 2)) return true;
      return false;
    });
    // Extra building proximity check for geological features (5m clearance)
    natureGenerator.setBuildingProximityChecker((x, z, margin) => {
      return this.isPointNearAnyBuilding(x, z, margin);
    });

    const worldBounds = {
      minX: -terrainSize / 2 + 50, // Leave space at edges
      maxX: terrainSize / 2 - 50,
      minZ: -terrainSize / 2 + 50,
      maxZ: terrainSize / 2 - 50
    };

    // Collect road and river positions for avoidance (trees shouldn't grow on roads or in rivers)
    const avoidPositions = [...allBuildingPositions];
    if (this.roadGenerator) {
      for (const roadMesh of this.roadGenerator.getRoadMeshes()) {
        avoidPositions.push(roadMesh.position.clone());
      }
    }
    // River avoidance removed — water generation disabled.

    // Scale vegetation counts by biome density
    const vegetationScale = Math.max(0.1, biome.treeDensity);

    // Trees - avoid building and road positions (count determined internally by biome density)
    natureGenerator.generateTrees(biome, worldBounds, avoidPositions, 20, sampleHeight);

    // Rocks — more in mountains/wasteland, fewer in forests
    const rockCount = Math.floor((terrainSize / 20) * (biome.treeType === 'dead' ? 2 : 1));
    natureGenerator.generateRocks(biome, worldBounds, rockCount, sampleHeight);

    // Geological features — boulders, rock clusters, pillars, outcrops, crystals
    const geoBaseCount = Math.floor(terrainSize / 30);
    natureGenerator.generateGeologicalFeatures(biome, worldBounds, geoBaseCount, sampleHeight);

    // Shrubs/bushes — scale with vegetation richness
    const shrubCount = Math.floor(30 * vegetationScale);
    natureGenerator.generateShrubs(biome, worldBounds, shrubCount, sampleHeight);

    // Grass patches — scale with biome
    const grassCount = Math.floor((terrainSize / 5) * vegetationScale);
    natureGenerator.generateGrass(biome, worldBounds, grassCount, sampleHeight);

    // Flowers
    if (biome.hasFlowers) {
      const flowerCount = Math.floor((terrainSize / 10) * vegetationScale);
      natureGenerator.generateFlowers(biome, worldBounds, flowerCount, sampleHeight);
    }

    // Post-spawn cleanup: remove any nature elements that ended up on roads
    if (this.roadGenerator) {
      const rg = this.roadGenerator;
      natureGenerator.removeRoadOverlaps((x, z) => rg.isPointOnRoad(x, z, 1.5));
    }

    // Ambient animals (cats, dogs, birds) for world ambiance
    if (this.animalNPCSystem) {
      const animalScale = Math.max(0.5, vegetationScale);
      this.animalNPCSystem.spawnAnimals({
        worldBounds,
        avoidPositions,
        sampleHeight,
        counts: {
          cats: Math.floor(4 * animalScale),
          dogs: Math.floor(3 * animalScale),
          birds: Math.floor(6 * animalScale),
        },
      });
    }

    // Lake generation disabled — lakes were overlapping with settlements.

    // Generate wilderness props (camps, ruins, landmarks) between settlements
    this.generateWildernessProps(
      worldBounds,
      boundaryData.map((s) => s.position),
      worldType || '',
      sampleHeight
    );


    // Diagnostic: scene state after generation
    const groundMesh = scene.getMeshByName('ground');

    // Re-enable material dirty mechanism after bulk generation
    scene.blockMaterialDirtyMechanism = false;

    // Performance: freeze world matrices and optimize static meshes
    this.optimizeStaticMeshes();

    // Diagnostic: find any abnormally large or high-flying meshes
    // if (this.scene) {
    //   for (const m of this.scene.meshes) {
    //     if (m.isDisposed()) continue;
    //     const bi = m.getBoundingInfo();
    //     const sz = bi.boundingBox.maximumWorld.subtract(bi.boundingBox.minimumWorld);
    //     const maxDim = Math.max(Math.abs(sz.x), Math.abs(sz.y), Math.abs(sz.z));
    //     const absY = Math.abs(m.getAbsolutePosition().y);
    //     if (maxDim > 10 && m.name !== 'ground' && !m.name.includes('sky')) {
    //       console.log(`[WorldGen] LARGE mesh: "${m.name}" maxDim=${maxDim.toFixed(1)} absY=${absY.toFixed(1)} scale=(${m.scaling.x.toFixed(4)}, ${m.scaling.y.toFixed(4)}, ${m.scaling.z.toFixed(4)}) enabled=${m.isEnabled()} visible=${m.isVisible}`);
    //     }
    //     if (absY > 30 && m.name !== 'ground' && !m.name.includes('sky')) {
    //       console.log(`[WorldGen] HIGH mesh: "${m.name}" absY=${absY.toFixed(1)} maxDim=${maxDim.toFixed(1)} scale=(${m.scaling.x.toFixed(4)}, ${m.scaling.y.toFixed(4)}, ${m.scaling.z.toFixed(4)}) enabled=${m.isEnabled()}`);
    //     }
    //   }
    // }

    // Generate 2D top-down world map for the minimap (terrain + streets).
    // Buildings are added later when first collected in updateMinimapOverlay().
    this.generateMinimapTerrainBackground();

    // Hide ALL template prototype meshes now that world generation is done.
    // We move them far off-screen rather than disposing because
    // instantiateHierarchy shares geometry/materials with the source.
    // Disabled-but-present PBR templates can cause black box / floating object artifacts.
    this.buildingGenerator?.hidePrototypes();
    this.natureGenerator?.hidePrototypes();
    this.questObjectManager?.hidePrototypes();

    // Also hide object model templates (lamps, chests, etc.)
    this.objectModelTemplates.forEach((mesh) => {
      if (mesh && !mesh.isDisposed()) {
        mesh.position.y = -10000;
        mesh.setEnabled(false);
        mesh.isVisible = false;
        mesh.isPickable = false;
        mesh.getChildMeshes().forEach((c) => {
          c.setEnabled(false);
          c.isVisible = false;
          c.isPickable = false;
        });
      }
    });

    // Create visual zone boundaries around settlements
    this.createZoneBoundaries(boundaryData);
  }

  /**
   * Freeze world matrices and mark non-pickable on all static meshes.
   * Also registers them with the chunk manager for distance-based culling.
   * Called once after world generation is complete.
   */
  private optimizeStaticMeshes(): void {
    if (!this.scene) return;

    // Initialize chunk manager
    const terrainSize = this.terrainSize || 512;
    this.chunkManager = new ChunkManager({
      worldSize: terrainSize,
      chunkSize: 64,
      renderRadius: 3,
      disposeRadius: 0, // Disable permanent disposal — deactivation is sufficient
    });

    const skipNames = new Set(['ground', 'sky-dome']);
    let frozenCount = 0;
    let nonPickableCount = 0;
    let chunkedCount = 0;

    for (const mesh of this.scene.meshes) {
      if (mesh.isDisposed()) continue;
      const name = mesh.name;

      // Skip ground (needed for raycasts), sky dome, player, and NPC meshes
      if (skipNames.has(name)) continue;
      if (name.startsWith('npc_') || name.startsWith('player')) continue;
      // Skip template prototype meshes — they must stay disabled (instances reference them)
      if (name.startsWith('template_')) continue;

      // Identify static meshes: trees, rocks, grass, flowers, buildings,
      // roads, settlement markers, signs, street furniture, props
      const isStatic =
        name.includes('tree') ||
        name.includes('rock') ||
        name.includes('grass') ||
        name.includes('flower') ||
        name.includes('shrub') ||
        name.includes('bush') ||
        name.includes('building') ||
        name.includes('road') ||
        name.includes('settlement_sign') ||
        name.includes('street_prop') ||
        name.includes('prop_') ||
        name.includes('wilderness_') ||
        name.includes('zone_boundary') ||
        name.includes('pine') ||
        name.includes('oak') ||
        name.includes('palm') ||
        name.includes('dead_tree');

      if (isStatic) {
        // Freeze world matrix - eliminates per-frame matrix recomputation
        mesh.freezeWorldMatrix();
        frozenCount++;

        // Mark non-pickable unless it's an interactive building
        if (!mesh.metadata?.buildingId && !mesh.metadata?.settlementId) {
          mesh.isPickable = false;
          nonPickableCount++;
        }

        // Roads are lightweight and should always be visible — skip chunk culling
        const isRoad = name.includes('road') || name.includes('street') || name.includes('sidewalk') || name.includes('crosswalk') || name.includes('walkway');
        if (isRoad) {
          mesh.alwaysSelectAsActiveMesh = true;
        } else {
          // Ensure mesh doesn't force itself into the active list
          mesh.alwaysSelectAsActiveMesh = false;

          // Register with chunk manager for distance culling
          // Skip child meshes of parented hierarchies (parent handles enable/disable)
          if (!mesh.parent) {
            this.chunkManager.registerMesh(mesh);
            chunkedCount++;
          }
        }
      }
    }

    // Defer material freezing — textures loaded via CreateGroundFromHeightMap or
    // async asset pipelines may not be ready yet. Freezing too early locks the
    // material before the GPU uploads the texture, resulting in invisible geometry.
    let frozenMaterials = 0;
    setTimeout(() => {
      if (!this.scene || this.scene.isDisposed) return;
      for (const material of this.scene.materials) {
        if (material instanceof StandardMaterial) {
          material.freeze();
          frozenMaterials++;
        }
      }
    }, 3000);

    // Note: Octree spatial partitioning is NOT used because it indexes meshes
    // at creation time. Meshes added later (player, NPCs) are excluded from
    // frustum checks and become invisible. The ChunkManager already provides
    // effective spatial culling for static geometry.

    // Activate all chunks initially so everything is visible until the
    // render loop starts calling update() with the player position.
    this.chunkManager.activateAll();

    const stats = this.chunkManager.getStats();

    // Phase 8: Initialize settlement scene isolation
    this.initSettlementSceneManager();
  }

  /**
   * Phase 8: Initialize the SettlementSceneManager by registering zones,
   * categorizing all meshes, and associating NPCs with settlements.
   */
  private initSettlementSceneManager(): void {
    if (!this.scene) return;

    this.settlementSceneManager = new SettlementSceneManager(this.scene, {
      exitBufferDistance: 8,
      onEnterSettlement: (zone) => {
        this.guiManager?.showToast({
          title: `Entering ${zone.name}`,
          description: zone.type.charAt(0).toUpperCase() + zone.type.slice(1),
          duration: 2000,
        });
      },
      onExitSettlement: (zone) => {
        this.guiManager?.showToast({
          title: `Leaving ${zone.name}`,
          description: 'Returning to the overworld',
          duration: 2000,
        });
      },
    });

    // Register settlement zones from pre-calculated zone boundaries
    this.zoneBoundaryMeshes.forEach((zoneData, id) => {
      if (!zoneData.zoneRadius) return;
      const settlementMesh = this.settlementMeshes.get(id);
      if (!settlementMesh) return;
      const stats = this.settlementStats.get(id);

      this.settlementSceneManager!.registerZone({
        id,
        name: stats?.name ?? id,
        center: settlementMesh.position.clone(),
        radius: zoneData.zoneRadius,
        type: stats?.type ?? 'town',
      });
    });

    // Categorize all meshes
    const globalNames = new Set(['ground', 'terrain', 'sky-dome', 'sky_dome', 'skybox', 'sunLight', 'hemisphericLight']);

    for (const mesh of this.scene.meshes) {
      if (mesh.isDisposed()) continue;
      const name = mesh.name;

      // Skip NPC meshes (managed separately) and player
      if (name.startsWith('npc_') || name.startsWith('player')) continue;

      // Global meshes: terrain, sky, lighting — always visible
      if (globalNames.has(name) || name.includes('light') || name.includes('camera')) {
        this.settlementSceneManager!.registerGlobalMesh(mesh);
        continue;
      }

      // Building/settlement meshes: check metadata for settlementId
      const settlementId = mesh.metadata?.settlementId as string | undefined;
      if (settlementId) {
        this.settlementSceneManager!.registerSettlementMesh(mesh, settlementId);
        // Also register child meshes
        for (const child of mesh.getChildMeshes()) {
          this.settlementSceneManager!.registerSettlementMesh(child, settlementId);
        }
        continue;
      }

      // Settlement markers and their children
      if (name.startsWith('settlement_')) {
        // Find which settlement this belongs to
        const markerSettlementId = mesh.metadata?.settlementId as string | undefined;
        if (markerSettlementId) {
          this.settlementSceneManager!.registerSettlementMesh(mesh, markerSettlementId);
          continue;
        }
      }

      // Street props with settlement ID in name (e.g., "street_prop_<settlementId>_N")
      if (name.startsWith('street_prop_')) {
        const match = this.findSettlementForMesh(mesh);
        if (match) {
          this.settlementSceneManager!.registerSettlementMesh(mesh, match);
          continue;
        }
      }

      // Everything else is overworld (nature, wilderness, roads between settlements)
      this.settlementSceneManager!.registerOverworldMesh(mesh);
    }

    // Categorize building data meshes (these have explicit settlementId)
    this.buildingData.forEach((data) => {
      if (data.metadata?.settlementId && data.mesh && !data.mesh.isDisposed()) {
        this.settlementSceneManager!.registerSettlementMesh(data.mesh, data.metadata.settlementId);
        for (const child of data.mesh.getChildMeshes()) {
          this.settlementSceneManager!.registerSettlementMesh(child, data.metadata.settlementId);
        }
      }
    });

    // Associate NPCs with settlements via their building assignments
    this.npcMeshes.forEach((instance, npcId) => {
      const settlementId = this.findNPCSettlement(npcId, instance);
      if (settlementId) {
        this.settlementSceneManager!.registerNPC(npcId, settlementId);
      }
    });

    const ssmStats = this.settlementSceneManager!.getStats();
  }

  /**
   * Phase 8: Find which settlement a mesh belongs to by proximity to settlement centers.
   */
  private findSettlementForMesh(mesh: AbstractMesh): string | null {
    if (!this.settlementSceneManager) return null;
    const pos = mesh.getAbsolutePosition();
    let closestId: string | null = null;
    let closestDist = Infinity;

    this.zoneBoundaryMeshes.forEach((zoneData, id) => {
      const settlementMesh = this.settlementMeshes.get(id);
      if (!settlementMesh || !zoneData.zoneRadius) return;
      const dist = Vector3.Distance(pos, settlementMesh.position);
      if (dist <= zoneData.zoneRadius && dist < closestDist) {
        closestId = id;
        closestDist = dist;
      }
    });

    return closestId;
  }

  /**
   * Phase 8: Determine which settlement an NPC belongs to via building metadata.
   */
  private findNPCSettlement(npcId: string, instance: NPCInstance): string | null {
    const character = instance.characterData;
    if (!character) return null;
    const characterId = character.id;

    // Check building data for a link
    let foundSettlementId: string | null = null;
    this.buildingData.forEach((data) => {
      if (foundSettlementId) return; // Already found
      const meta = data.metadata;
      if (!meta?.settlementId) return;

      const bc = meta.buildingCategory || meta.buildingType;
      if (bc === 'business') {
        if (meta.ownerId === characterId ||
            (Array.isArray(meta.employees) && meta.employees.some((e: any) =>
              typeof e === 'string' ? e === characterId : e?.id === characterId
            ))) {
          foundSettlementId = meta.settlementId;
        }
      }
      if (bc === 'residence') {
        if (Array.isArray(meta.occupants) && meta.occupants.some((o: any) =>
          typeof o === 'string' ? o === characterId : o?.id === characterId
        )) {
          foundSettlementId = meta.settlementId;
        }
      }
    });
    if (foundSettlementId) return foundSettlementId;

    // Fallback: assign to nearest settlement by NPC position
    return this.findSettlementForMesh(instance.mesh);
  }

  /**
   * Generate procedural street furniture around buildings in a settlement.
   * Creates world-type-appropriate props like lamp posts, benches, wells, etc.
   */
  private generateStreetFurniture(
    settlementId: string,
    center: Vector3,
    buildingPositions: Vector3[],
    worldType: string,
    sampleHeight: (x: number, z: number) => number
  ): void {
    if (!this.scene || buildingPositions.length === 0) return;
    const scene = this.scene;

    // Determine furniture set based on world type (includes new outdoor types)
    const furnitureSet = getFurnitureSet(worldType);

    // Place 1-2 props per building, along the "street" side
    const maxProps = Math.min(buildingPositions.length * 2, 20);
    let propCount = 0;

    for (const bldgPos of buildingPositions) {
      if (propCount >= maxProps) break;

      // Place prop offset from building towards settlement center
      const toCenter = center.subtract(bldgPos);
      toCenter.y = 0;
      const dist = toCenter.length();
      if (dist < 1) continue;
      toCenter.normalize();

      // Offset to the side of the building-to-center line
      const perpX = -toCenter.z;
      const perpZ = toCenter.x;
      const sideOffset = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3);

      const propX = bldgPos.x + toCenter.x * 4 + perpX * sideOffset;
      const propZ = bldgPos.z + toCenter.z * 4 + perpZ * sideOffset;

      // Skip if the prop would land inside a building or on a road
      if (this.isPointInsideAnyBuilding(propX, propZ)) continue;
      if (this.roadGenerator?.isPointOnRoad(propX, propZ)) continue;

      const propY = sampleHeight(propX, propZ);

      const furnitureType = furnitureSet[Math.floor(Math.random() * furnitureSet.length)];
      const prop = this.createFurnitureProp(furnitureType, `street_prop_${settlementId}_${propCount}`, scene);
      if (!prop) continue;

      prop.position = new Vector3(propX, propY, propZ);
      prop.rotation.y = Math.random() * Math.PI * 2;
      prop.checkCollisions = true;
      prop.getChildMeshes().forEach(child => { child.checkCollisions = true; });
      prop.isPickable = false;
      this.worldPropMeshes.push(prop);
      propCount++;
    }
  }

  private createFurnitureProp(
    type: string,
    name: string,
    scene: Scene
  ): Mesh | null {
    // Try to use collection objectModel template if available
    const roles = FURNITURE_ROLE_MAP[type] || [];
    for (const role of roles) {
      const template = this.objectModelTemplates.get(role);
      if (template) {
        let cloned: Mesh | null = null;
        // glTF root nodes have 0 vertices — use instantiateHierarchy
        if (template.getTotalVertices() === 0 && template.getChildMeshes().length > 0) {
          const root = template.instantiateHierarchy(
            null,
            undefined,
            (source, clone) => { clone.name = `${source.name}_${name}`; }
          );
          if (root) {
            root.setEnabled(true);
            root.getChildMeshes().forEach(m => m.setEnabled(true));
            cloned = root as Mesh;
          }
        } else {
          cloned = template.clone(name, null, false, false) as Mesh;
        }
        if (cloned) {
          cloned.setEnabled(true);
          // Use stored scaleHint if available; fall back to target/originalH
          const furnScaleHint = this.objectModelScaleHints.get(role);
          let furnAbsScale: number;
          if (furnScaleHint != null && furnScaleHint > 0) {
            furnAbsScale = furnScaleHint;
          } else {
            const targetSize = FURNITURE_SIZE_MAP[type] || 1.0;
            const furnOrigH = this.objectModelOriginalHeights.get(role) || 1;
            furnAbsScale = targetSize / furnOrigH;
          }
          cloned.scaling.set(furnAbsScale, furnAbsScale, furnAbsScale);
          return cloned;
        }
      }
    }

    // Try outdoor furniture generator for new and enhanced types (market_stall, picnic_table, etc.)
    if (!this.outdoorFurnitureGenerator) {
      this.outdoorFurnitureGenerator = new OutdoorFurnitureGenerator(this.furnitureMaterialCache);
    }
    const outdoorMesh = this.outdoorFurnitureGenerator.createOutdoorFurniture(type, name, scene);
    if (outdoorMesh) {
      createDebugLabel(scene, outdoorMesh, `FURNITURE: ${type}`, 5);
      return outdoorMesh;
    }

    // Fallback to procedural primitives with shared materials
    const parent = new Mesh(name, scene);

    // Helper to get or create a shared furniture material
    const getFurnMat = (key: string, create: () => StandardMaterial): StandardMaterial => {
      let mat = this.furnitureMaterialCache.get(key);
      if (!mat) {
        mat = create();
        this.furnitureMaterialCache.set(key, mat);
      }
      return mat;
    };

    if (type === 'lamp_post' || type === 'streetlight') {
      const pole = MeshBuilder.CreateCylinder(`${name}_pole`, { height: 2.5, diameter: 0.15, tessellation: 6 }, scene);
      pole.position.y = 1.25;
      pole.parent = parent;
      pole.material = getFurnMat(`furn_pole_${type}`, () => {
        const m = new StandardMaterial(`furn_pole_${type}`, scene);
        m.diffuseColor = type === 'streetlight' ? new Color3(0.4, 0.4, 0.45) : new Color3(0.25, 0.2, 0.15);
        m.specularColor = Color3.Black();
        return m;
      });

      const lamp = MeshBuilder.CreateSphere(`${name}_lamp`, { diameter: 0.4, segments: 6 }, scene);
      lamp.position.y = 2.6;
      lamp.parent = parent;
      lamp.material = getFurnMat('furn_lamp_glow', () => {
        const m = new StandardMaterial('furn_lamp_glow', scene);
        m.diffuseColor = new Color3(1, 0.9, 0.6);
        m.emissiveColor = new Color3(0.4, 0.35, 0.2);
        return m;
      });

    } else if (type === 'bench') {
      const seatMat = getFurnMat('furn_bench_wood', () => {
        const m = new StandardMaterial('furn_bench_wood', scene);
        m.diffuseColor = new Color3(0.45, 0.3, 0.2);
        m.specularColor = Color3.Black();
        return m;
      });
      const seat = MeshBuilder.CreateBox(`${name}_seat`, { width: 2, height: 0.15, depth: 0.6 }, scene);
      seat.position.y = 0.5;
      seat.parent = parent;
      seat.material = seatMat;
      for (const dx of [-0.8, 0.8]) {
        const leg = MeshBuilder.CreateBox(`${name}_leg_${dx}`, { width: 0.1, height: 0.5, depth: 0.5 }, scene);
        leg.position = new Vector3(dx, 0.25, 0);
        leg.parent = parent;
        leg.material = seatMat;
      }

    } else if (type === 'well') {
      const stoneMat = getFurnMat('furn_well_stone', () => {
        const m = new StandardMaterial('furn_well_stone', scene);
        m.diffuseColor = new Color3(0.5, 0.5, 0.45);
        m.specularColor = Color3.Black();
        return m;
      });
      const ring = MeshBuilder.CreateTorus(`${name}_ring`, { diameter: 1.5, thickness: 0.4, tessellation: 8 }, scene);
      ring.position.y = 0.5;
      ring.parent = parent;
      ring.material = stoneMat;
      for (const dx of [-0.6, 0.6]) {
        const post = MeshBuilder.CreateCylinder(`${name}_post_${dx}`, { height: 2, diameter: 0.12, tessellation: 4 }, scene);
        post.position = new Vector3(dx, 1.5, 0);
        post.parent = parent;
        post.material = stoneMat;
      }

    } else if (type === 'barrel') {
      const barrel = MeshBuilder.CreateCylinder(`${name}_barrel`, { height: 1.2, diameter: 0.7, tessellation: 6 }, scene);
      barrel.position.y = 0.6;
      barrel.parent = parent;
      barrel.material = getFurnMat('furn_barrel_wood', () => {
        const m = new StandardMaterial('furn_barrel_wood', scene);
        m.diffuseColor = new Color3(0.5, 0.35, 0.2);
        m.specularColor = Color3.Black();
        return m;
      });

    } else if (type === 'crate') {
      const crate = MeshBuilder.CreateBox(`${name}_crate`, { width: 0.8, height: 0.8, depth: 0.8 }, scene);
      crate.position.y = 0.4;
      crate.parent = parent;
      crate.material = getFurnMat('furn_crate_wood', () => {
        const m = new StandardMaterial('furn_crate_wood', scene);
        m.diffuseColor = new Color3(0.55, 0.4, 0.25);
        m.specularColor = Color3.Black();
        return m;
      });

    } else if (type === 'terminal') {
      const post = MeshBuilder.CreateBox(`${name}_post`, { width: 0.5, height: 1.5, depth: 0.3 }, scene);
      post.position.y = 0.75;
      post.parent = parent;
      post.material = getFurnMat('furn_terminal_metal', () => {
        const m = new StandardMaterial('furn_terminal_metal', scene);
        m.diffuseColor = new Color3(0.35, 0.35, 0.4);
        m.specularColor = new Color3(0.3, 0.3, 0.3);
        return m;
      });

      const screen = MeshBuilder.CreatePlane(`${name}_screen`, { width: 0.4, height: 0.3 }, scene);
      screen.position.y = 1.3;
      screen.position.z = -0.16;
      screen.parent = parent;
      screen.material = getFurnMat('furn_terminal_screen', () => {
        const m = new StandardMaterial('furn_terminal_screen', scene);
        m.diffuseColor = new Color3(0.1, 0.3, 0.5);
        m.emissiveColor = new Color3(0.1, 0.25, 0.4);
        return m;
      });

    } else if (type === 'planter') {
      const pot = MeshBuilder.CreateCylinder(`${name}_pot`, { height: 0.6, diameterTop: 0.8, diameterBottom: 0.5, tessellation: 8 }, scene);
      pot.position.y = 0.3;
      pot.parent = parent;
      pot.material = getFurnMat('furn_planter_pot', () => {
        const m = new StandardMaterial('furn_planter_pot', scene);
        m.diffuseColor = new Color3(0.5, 0.35, 0.25);
        m.specularColor = Color3.Black();
        return m;
      });

      const bush = MeshBuilder.CreateSphere(`${name}_bush`, { diameter: 0.7, segments: 6 }, scene);
      bush.position.y = 0.8;
      bush.parent = parent;
      bush.material = getFurnMat('furn_planter_bush', () => {
        const m = new StandardMaterial('furn_planter_bush', scene);
        m.diffuseColor = new Color3(0.2, 0.5, 0.2);
        return m;
      });

    } else {
      parent.dispose();
      return null;
    }

    createDebugLabel(scene, parent, `FURNITURE: ${type}`, 5);
    return parent;
  }

  /**
   * Generate wilderness props (camps, ruins, landmarks) in the open areas
   * between settlements to create points of interest in the wilderness.
   */
  private generateWildernessProps(
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
    settlementPositions: Vector3[],
    worldType: string,
    sampleHeight: (x: number, z: number) => number
  ): void {
    if (!this.scene) return;
    const scene = this.scene;
    const wt = (worldType || '').toLowerCase();

    // Minimum distance from any settlement center to place a wilderness prop
    const minSettlementDist = 60;

    // Determine number of wilderness props based on world area
    const areaWidth = bounds.maxX - bounds.minX;
    const areaDepth = bounds.maxZ - bounds.minZ;
    const propCount = Math.max(3, Math.floor((areaWidth * areaDepth) / 8000));

    type WildernessType = 'camp' | 'ruins' | 'standing_stones' | 'shrine' | 'campfire';
    let wildernessSet: WildernessType[];

    if (wt.includes('medieval') || wt.includes('fantasy')) {
      wildernessSet = ['camp', 'ruins', 'standing_stones', 'shrine'];
    } else if (wt.includes('post-apocalyptic') || wt.includes('wasteland')) {
      wildernessSet = ['ruins', 'campfire', 'ruins', 'camp'];
    } else if (wt.includes('cyberpunk') || wt.includes('sci-fi')) {
      wildernessSet = ['ruins', 'camp', 'shrine'];
    } else {
      wildernessSet = ['camp', 'standing_stones', 'campfire', 'shrine'];
    }

    let placed = 0;
    let attempts = 0;
    const maxAttempts = propCount * 10;

    while (placed < propCount && attempts < maxAttempts) {
      attempts++;

      const x = bounds.minX + Math.random() * areaWidth;
      const z = bounds.minZ + Math.random() * areaDepth;

      // Ensure far from all settlements
      const tooClose = settlementPositions.some((sp) => {
        const dx = sp.x - x;
        const dz = sp.z - z;
        return Math.sqrt(dx * dx + dz * dz) < minSettlementDist;
      });
      if (tooClose) continue;

      const y = sampleHeight(x, z);
      const wildType = wildernessSet[Math.floor(Math.random() * wildernessSet.length)];
      const prop = this.createWildernessProp(wildType, `wilderness_${placed}`, scene, wt);
      if (!prop) continue;

      prop.position = new Vector3(x, y, z);
      prop.rotation.y = Math.random() * Math.PI * 2;
      prop.checkCollisions = true;
      prop.getChildMeshes().forEach(child => { child.checkCollisions = true; });
      prop.isPickable = false;
      createDebugLabel(scene, prop, `WILDERNESS: ${wildType}`, 5);
      this.worldPropMeshes.push(prop);
      placed++;
    }

    if (placed > 0) {
    }
  }

  private createWildernessProp(
    type: string,
    name: string,
    scene: Scene,
    worldType: string
  ): Mesh | null {
    const parent = new Mesh(name, scene);

    if (type === 'camp') {
      // Tent: cone shape
      const tent = MeshBuilder.CreateCylinder(`${name}_tent`, {
        height: 2.5, diameterTop: 0, diameterBottom: 3, tessellation: 12
      }, scene);
      tent.position.y = 1.25;
      tent.parent = parent;
      const tentMat = new StandardMaterial(`${name}_tent_mat`, scene);
      tentMat.diffuseColor = new Color3(0.6, 0.5, 0.35);
      tentMat.specularColor = Color3.Black();
      tent.material = tentMat;

      // Bedroll (flat box)
      const bedroll = MeshBuilder.CreateBox(`${name}_bedroll`, { width: 1.2, height: 0.1, depth: 2 }, scene);
      bedroll.position = new Vector3(2, 0.05, 0);
      bedroll.parent = parent;
      const bedMat = new StandardMaterial(`${name}_bed_mat`, scene);
      bedMat.diffuseColor = new Color3(0.4, 0.3, 0.2);
      bedMat.specularColor = Color3.Black();
      bedroll.material = bedMat;

      // Small campfire ring
      const fireRing = MeshBuilder.CreateTorus(`${name}_firering`, { diameter: 1.2, thickness: 0.2, tessellation: 10 }, scene);
      fireRing.position = new Vector3(-1.5, 0.1, 1.5);
      fireRing.parent = parent;
      const ringMat = new StandardMaterial(`${name}_ring_mat`, scene);
      ringMat.diffuseColor = new Color3(0.35, 0.35, 0.3);
      ringMat.specularColor = Color3.Black();
      fireRing.material = ringMat;

    } else if (type === 'campfire') {
      // Simple campfire: ring of stones + embers + crossed logs
      const stoneMat = new StandardMaterial(`${name}_stone_mat`, scene);
      stoneMat.diffuseColor = new Color3(0.4, 0.4, 0.38);
      stoneMat.specularColor = Color3.Black();

      // Scatter a few small rocks in a rough circle instead of a torus
      for (let si = 0; si < 6; si++) {
        const sa = (Math.PI * 2 * si) / 6 + (Math.random() - 0.5) * 0.4;
        const sr = 0.5 + Math.random() * 0.2;
        const rock = MeshBuilder.CreateSphere(`${name}_rock_${si}`, { diameter: 0.25 + Math.random() * 0.15, segments: 4 }, scene);
        rock.position = new Vector3(Math.cos(sa) * sr, 0.1, Math.sin(sa) * sr);
        rock.scaling.y = 0.6;
        rock.parent = parent;
        rock.material = stoneMat;
      }

      // Small ember glow in center (flat, ground-level)
      const ember = MeshBuilder.CreateSphere(`${name}_ember`, { diameter: 0.3, segments: 6 }, scene);
      ember.position.y = 0.1;
      ember.scaling = new Vector3(1.2, 0.4, 1.2);
      ember.parent = parent;
      const emberMat = new StandardMaterial(`${name}_ember_mat`, scene);
      emberMat.diffuseColor = new Color3(0.6, 0.2, 0.05);
      emberMat.emissiveColor = new Color3(0.3, 0.1, 0.03);
      ember.material = emberMat;

      // Crossed logs
      const logMat = new StandardMaterial(`${name}_log_mat`, scene);
      logMat.diffuseColor = new Color3(0.35, 0.25, 0.15);
      logMat.specularColor = Color3.Black();

      for (let li = 0; li < 2; li++) {
        const log = MeshBuilder.CreateCylinder(`${name}_log_${li}`, { height: 1, diameter: 0.12, tessellation: 6 }, scene);
        log.rotation.z = Math.PI / 2;
        log.rotation.y = li * Math.PI / 3;
        log.position.y = 0.1;
        log.parent = parent;
        log.material = logMat;
      }

    } else if (type === 'ruins') {
      // Broken wall segments
      const wallMat = new StandardMaterial(`${name}_wall_mat`, scene);
      wallMat.diffuseColor = worldType.includes('cyber') || worldType.includes('sci')
        ? new Color3(0.4, 0.4, 0.45) : new Color3(0.5, 0.48, 0.42);
      wallMat.specularColor = Color3.Black();

      // Two broken wall pieces at angles
      const wall1 = MeshBuilder.CreateBox(`${name}_wall1`, { width: 4, height: 2.5, depth: 0.4 }, scene);
      wall1.position = new Vector3(0, 1.25, 0);
      wall1.rotation.y = Math.random() * 0.3;
      wall1.parent = parent;
      wall1.material = wallMat;

      const wall2 = MeshBuilder.CreateBox(`${name}_wall2`, { width: 2.5, height: 1.5, depth: 0.4 }, scene);
      wall2.position = new Vector3(2, 0.75, 2.5);
      wall2.rotation.y = Math.PI / 2 + Math.random() * 0.3;
      wall2.parent = parent;
      wall2.material = wallMat;

      // Rubble pile
      const rubble = MeshBuilder.CreateSphere(`${name}_rubble`, { diameter: 1.5, segments: 6 }, scene);
      rubble.position = new Vector3(1, 0.3, 1);
      rubble.scaling = new Vector3(1.5, 0.4, 1.2);
      rubble.parent = parent;
      rubble.material = wallMat;

    } else if (type === 'standing_stones') {
      // Circle of standing stones (3-5 tall rough stones)
      const stoneCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < stoneCount; i++) {
        const angle = (Math.PI * 2 * i) / stoneCount;
        const radius = 2.5;
        const sx = Math.cos(angle) * radius;
        const sz = Math.sin(angle) * radius;
        const height = 1.8 + Math.random() * 1.5;

        // Tapered cylinder looks more like a rough stone than a box
        const stone = MeshBuilder.CreateCylinder(`${name}_stone_${i}`, {
          height: height,
          diameterTop: 0.3 + Math.random() * 0.3,
          diameterBottom: 0.6 + Math.random() * 0.4,
          tessellation: 5 + Math.floor(Math.random() * 3), // Irregular shape
        }, scene);
        stone.position = new Vector3(sx, height / 2, sz);
        stone.rotation.y = angle + Math.random() * 0.8;
        stone.rotation.z = (Math.random() - 0.5) * 0.25; // More lean
        stone.rotation.x = (Math.random() - 0.5) * 0.1;
        stone.parent = parent;

        // Vary color per stone slightly
        const colorVar = 0.05 * (Math.random() - 0.5);
        const stoneMat = new StandardMaterial(`${name}_stone_mat_${i}`, scene);
        stoneMat.diffuseColor = new Color3(0.5 + colorVar, 0.48 + colorVar, 0.44 + colorVar);
        stoneMat.specularColor = new Color3(0.05, 0.05, 0.05);
        stone.material = stoneMat;
      }

    } else if (type === 'shrine') {
      // Small pedestal with a glowing orb
      const baseMat = new StandardMaterial(`${name}_base_mat`, scene);
      baseMat.diffuseColor = new Color3(0.5, 0.5, 0.48);
      baseMat.specularColor = Color3.Black();

      const base = MeshBuilder.CreateCylinder(`${name}_base`, {
        height: 1.2, diameterTop: 0.8, diameterBottom: 1.2, tessellation: 8
      }, scene);
      base.position.y = 0.6;
      base.parent = parent;
      base.material = baseMat;

      // Glowing sphere on top
      const orb = MeshBuilder.CreateSphere(`${name}_orb`, { diameter: 0.5, segments: 8 }, scene);
      orb.position.y = 1.5;
      orb.parent = parent;
      const orbMat = new StandardMaterial(`${name}_orb_mat`, scene);
      orbMat.diffuseColor = new Color3(0.3, 0.6, 0.9);
      orbMat.emissiveColor = new Color3(0.15, 0.3, 0.45);
      orb.material = orbMat;

    } else {
      parent.dispose();
      return null;
    }

    return parent;
  }

  private getHeightRangeForFootprint(center: Vector3, width: number, depth: number): number {
    const halfW = width / 2;
    const halfD = depth / 2;

    const samples: number[] = [];

    const points = [
      { dx: 0, dz: 0 },
      { dx: -halfW, dz: -halfD },
      { dx: halfW, dz: -halfD },
      { dx: -halfW, dz: halfD },
      { dx: halfW, dz: halfD }
    ];

    for (const p of points) {
      const samplePos = this.projectToGround(center.x + p.dx, center.z + p.dz);
      samples.push(samplePos.y);
    }

    const minY = Math.min(...samples);
    const maxY = Math.max(...samples);
    return maxY - minY;
  }

  private findStableBuildingPosition(
    original: Vector3,
    width: number,
    depth: number,
    maxHeightDiff: number = 2.0,
    searchRadius: number = 10,
    maxAttempts: number = 12
  ): Vector3 {
    let bestCenter = this.projectToGround(original.x, original.z);
    let bestRange = this.getHeightRangeForFootprint(bestCenter, width, depth);

    if (bestRange <= maxHeightDiff) {
      return bestCenter;
    }

    for (let i = 0; i < maxAttempts; i++) {
      const angle = (Math.PI * 2 * i) / maxAttempts;
      const radius = (searchRadius * (i + 1)) / maxAttempts;
      const candX = original.x + Math.cos(angle) * radius;
      const candZ = original.z + Math.sin(angle) * radius;
      const candCenter = this.projectToGround(candX, candZ);
      const range = this.getHeightRangeForFootprint(candCenter, width, depth);

      if (range < bestRange) {
        bestRange = range;
        bestCenter = candCenter;
      }

      if (range <= maxHeightDiff) {
        break;
      }
    }

    return bestCenter;
  }

  private createZoneBoundaries(
    settlements: { id: string; settlement: SettlementSummary; position: Vector3 }[]
  ): void {
    if (!this.scene) return;

    // Dispose any existing boundaries
    this.zoneBoundaryMeshes.forEach(({ boundary, particles }) => {
      particles?.dispose();
      boundary?.dispose();
    });
    this.zoneBoundaryMeshes.clear();

    const scene = this.scene;

    settlements.forEach(({ id, settlement, position }) => {
      try {
        const type = settlement.settlementType?.toLowerCase() ?? 'town';

        // Calculate zone radius based on settlement type
        const baseSize = type === 'city' ? 24 : type === 'village' ? 14 : 18;
        const buildingRadius = baseSize * 1.6;
        const zoneRadius = buildingRadius * 1.8; // Extend beyond buildings

        // Determine zone color based on settlement type
        let zoneColor: Color3;

        if (type === 'city') {
          // Cities: Blue glow (neutral zone)
          zoneColor = new Color3(0.3, 0.5, 0.9);
        } else if (type === 'village') {
          // Villages: Amber glow (caution zone)
          zoneColor = new Color3(0.9, 0.6, 0.2);
        } else {
          // Towns: Green glow (safe zone)
          zoneColor = new Color3(0.2, 0.8, 0.3);
        }

        // NOTE: Zone boundary visuals (torus ring + particles) have been removed
        // because the large colored torus meshes appeared as immersion-breaking
        // "rainbow arches" in the 3D view. The radius calculation above is kept
        // so it can be used by the minimap, map overlay, or gameplay systems
        // (e.g. settlement proximity detection). To re-enable visuals in the
        // future, create a torus mesh here with diameter = zoneRadius * 2.
        this.zoneBoundaryMeshes.set(id, { boundary: null, particles: null, zoneRadius, zoneColor });
      } catch (error) {
        console.error(`Failed to create zone boundary for settlement ${id}:`, error);
      }
    });
  }

  private async startPlaythrough(): Promise<void> {
    // Attach quest overlay to DataSource so all quest reads/writes
    // go through the playthrough-scoped overlay instead of the world.
    this.dataSource.questOverlay = this.questOverlay;
    // Attach quest overlay to WorldStateManager for save/load serialization
    this.worldStateManager?.setQuestOverlay(this.questOverlay);

    if (!this.config.worldId) return;

    // Use pre-selected playthrough ID if provided
    if (this.config.playthroughId) {
      this.playthroughId = this.config.playthroughId;

      // Switch FileDataSource to the selected playthrough for scoped saves
      if ('switchPlaythrough' in this.dataSource) {
        (this.dataSource as any).switchPlaythrough(this.config.playthroughId);
      }

      this.initReputationManager();

      // Check if this is an editor-created playthrough that needs initialization
      const ptData = await this.dataSource.getPlaythrough(this.config.playthroughId);
      if (ptData?.needsInitialization) {
        console.log('[BabylonGame] Editor-created playthrough needs initialization — running new-game flow');
        this.guiManager?.showToast({
          title: "Starting Adventure",
          description: "This adventure was started but not yet played. Starting from the beginning...",
          variant: "default"
        });
        // Clear the flag so subsequent loads restore normally
        await this.dataSource.markPlaythroughInitialized(this.config.playthroughId);
        // Skip save restoration — let the game run its normal first-time init
        return;
      }

      // Restore quest progress from previous session
      await this.restoreQuestProgressFromServer();
      this.fetchPlaythroughMeta();
      return;
    }

    try {
      const playthrough = await this.dataSource.startPlaythrough(
        this.config.worldId,
        this.config.authToken || '',
        `${this.config.worldName} - Playthrough`
      );

      if (playthrough && playthrough.id) {
        this.playthroughId = playthrough.id;
        this.chatPanel?.setPlaythroughId(playthrough.id);
        this.gamificationTracker?.setPlaythroughId(playthrough.id);
        this.initReputationManager();
        this.fetchPlaythroughMeta();
        this.loadReadingProgress();
      } else {
        // Continue without playthrough for development/testing
        this.loadReadingProgress();
      }
    } catch (error) {
      console.error('Error starting playthrough:', error);
      // Continue without playthrough for development/testing
      this.loadReadingProgress();
    }
  }

  /** Initialize the playthrough-scoped NPC relationship manager. */
  private async initializeRelationshipManager(): Promise<void> {
    if (!this.playthroughId || !this.eventBus) return;
    try {
      this.relationshipManager = new RelationshipManager({
        playthroughId: this.playthroughId,
        playerCharacterId: DEFAULT_PLAYER_ID,
        eventBus: this.eventBus,
        dataSource: this.dataSource,
        onNotification: (message, variant) => {
          this.guiManager?.showToast({ title: 'Relationship', description: message, variant: variant || 'default' });
        },
      });
      await this.relationshipManager.initialize(this.characters);
      // Wire relationship context into chat panel
      this.chatPanel?.setRelationshipManager(this.relationshipManager);
    } catch (err) {
      console.error('[BabylonGame] RelationshipManager init failed:', err);
    }
  }

  /** Restore quest progress from a previous session's saved data. */
  private async restoreQuestProgressFromServer(): Promise<void> {
    if (!this.playthroughId) return;
    try {
      const saved = await this.dataSource.loadQuestProgress(this.playthroughId);
      if (saved) {
        this.questOverlay.deserialize(saved);
        if (this.quests) {
          this.quests = this.questOverlay.mergeQuests(this.quests);
          // Restore objective states into the completion engine
          const engine = this.questObjectManager?.getCompletionEngine();
          if (engine) {
            engine.restoreObjectiveStates(this.questOverlay.getObjectiveStates());
          }
          this.syncActiveQuestToHud();
          this.questTracker?.updateQuests(this.config.worldId);
        }
      }
    } catch (err) {
      console.error('[BabylonGame] Failed to restore quest progress:', err);
    }
  }

  /**
   * Detect first playthrough in a language-learning world and launch onboarding.
   * Runs asynchronously after the game loop starts so the world is visible.
   */
  private async tryLaunchOnboarding(): Promise<void> {
    if (!this.worldData || !this.guiManager) return;
    if (!isLanguageLearningWorld(this.worldData)) return;

    const playerId = this.config.userId || DEFAULT_PLAYER_ID;
    const authToken = this.config.authToken || '';

    const firstPlay = await isFirstPlaythrough(
      this.config.worldId,
      playerId,
      authToken,
    );
    if (!firstPlay) {
      return;
    }

    // Add a special assessment notice to the notice board panel
    const targetLang = getTargetLanguage(this.worldData);
    const assessmentNotice = this.createAssessmentNotice('arrival', targetLang);
    this.noticeBoardPanel?.addArticle(assessmentNotice);

    // Set up callback: when assessment notice is clicked, launch the assessment
    this.noticeBoardPanel?.setOnAssessmentClicked(async (assessmentType) => {
      if (assessmentType !== 'arrival') return;

      // Remove the notice
      this.noticeBoardPanel?.removeArticle('assessment_arrival');

      // Launch the actual assessment
      this.onboardingActive = true;
      this.assessmentActive = true;

      const result = await launchOnboarding({
        eventBus: this.eventBus,
        worldId: this.config.worldId,
        playerId,
        authToken,
        targetLanguage: targetLang,
        guiManager: this.guiManager!,
      });

      this.onboardingActive = false;
      this.assessmentActive = false;
      this._assessmentTargetNpcId = null;

      if (result) {
        this.onboardingResult = result;

        // Apply CEFR-based content gating if available
        if (this.contentGatingManager) {
          try {
            (this.contentGatingManager as any).setCefrLevel?.(result.cefrLevel);
          } catch {
            // Content gating may not support setCefrLevel yet
          }
        }

        this.guiManager?.showToast({
          title: `Language Level: ${result.cefrLevel}`,
          description: 'Your adventure begins! Talk to NPCs to practice.',
          duration: 5000,
        });
      }
    });

    // Show a toast directing the player to the notice board
    this.guiManager?.showToast({
      title: 'Welcome!',
      description: 'Visit the Notice Board (N) to begin your language assessment.',
      duration: 6000,
    });
  }

  /**
   * Create a special NoticeArticle for an assessment (arrival or departure).
   */
  private createAssessmentNotice(
    assessmentType: 'arrival' | 'departure',
    targetLanguage: string,
  ): NoticeArticle {
    if (assessmentType === 'arrival') {
      return {
        id: 'assessment_arrival',
        title: 'Évaluation des Nouveaux Arrivants',
        titleTranslation: 'Newcomer Assessment',
        body: `Bienvenue, voyageur! Avant de commencer votre aventure, nous devons évaluer votre connaissance de la langue. Cette évaluation nous aidera à adapter votre expérience à votre niveau.`,
        bodyTranslation: `Welcome, traveler! Before you begin your adventure, we need to assess your language knowledge. This assessment will help us tailor your experience to your level.`,
        difficulty: 'beginner',
        vocabularyWords: [
          { word: 'évaluation', meaning: 'assessment' },
          { word: 'voyageur', meaning: 'traveler' },
          { word: 'aventure', meaning: 'adventure' },
          { word: 'connaissance', meaning: 'knowledge' },
        ],
        noticeType: 'official',
        readingXp: 5,
        author: {
          characterId: 'village_elder',
          name: 'Le Conseil du Village',
          occupation: 'Village Council',
        },
        assessmentHook: {
          assessmentType: 'arrival',
          buttonLabel: 'Commencer l\'Évaluation',
          buttonLabelTranslation: 'Begin Assessment',
        },
      };
    }
    // Departure assessment
    return {
      id: 'assessment_departure',
      title: 'Évaluation de Départ',
      titleTranslation: 'Departure Assessment',
      body: `Votre séjour touche à sa fin. Avant de partir, passez cette évaluation finale pour mesurer vos progrès dans la langue.`,
      bodyTranslation: `Your stay is coming to an end. Before you leave, take this final assessment to measure your progress in the language.`,
      difficulty: 'beginner',
      vocabularyWords: [
        { word: 'départ', meaning: 'departure' },
        { word: 'séjour', meaning: 'stay' },
        { word: 'progrès', meaning: 'progress' },
        { word: 'langue', meaning: 'language' },
      ],
      noticeType: 'official',
      readingXp: 5,
      author: {
        characterId: 'village_elder',
        name: 'Le Conseil du Village',
        occupation: 'Village Council',
      },
      assessmentHook: {
        assessmentType: 'departure',
        buttonLabel: 'Commencer l\'Évaluation Finale',
        buttonLabelTranslation: 'Begin Final Assessment',
      },
    };
  }

  private async loadPlayer(): Promise<void> {
    if (!this.scene) return;

    try {
      // Determine player model URL from asset collection or fallback to hardcoded
      let playerModelUrl = PLAYER_MODEL_URL;
      let playerRootUrl = '';
      let playerFileName = playerModelUrl;
      const playerModelId = this.world3DConfig?.playerModels?.default;
      if (playerModelId && this.worldAssets && this.worldAssets.length > 0) {
        const playerAsset = this.worldAssets.find((a) => a.id === playerModelId);
        if (playerAsset && playerAsset.filePath) {
          const cleanPath = playerAsset.filePath.replace(/^\//, '');
          const lastSlash = cleanPath.lastIndexOf('/');
          playerRootUrl = lastSlash >= 0 ? '/' + cleanPath.substring(0, lastSlash + 1) : '/';
          playerFileName = lastSlash >= 0 ? cleanPath.substring(lastSlash + 1) : cleanPath;
        }
      }

      const result = await SceneLoader.ImportMeshAsync("", playerRootUrl, playerFileName, this.scene);

      const playerMeshRaw = this.selectPlayerMesh(result.meshes) || (result.meshes[0] as Mesh);
      const skeleton = result.skeletons[0];
      const playerMesh = this.preparePlayerMesh(playerMeshRaw, skeleton);

      // Apply model scaling from collection config if available
      const playerScale = this.world3DConfig?.modelScaling?.['playerModels.default'];
      playerMesh.scaling = playerScale
        ? new Vector3(playerScale.x, playerScale.y, playerScale.z)
        : new Vector3(1, 1, 1);
      playerMesh.checkCollisions = true;

      // Collision ellipsoid for the player
      playerMesh.ellipsoid = new Vector3(0.5, 1, 0.5);
      playerMesh.ellipsoidOffset = new Vector3(0, 1, 0);

      // Spawn player in first settlement if available, otherwise at origin
      if (this.firstSettlementSpawnPosition) {
        playerMesh.position = this.firstSettlementSpawnPosition.clone();
      } else {
        // Spawn at origin but above ground level
        playerMesh.position = new Vector3(0, 10, 0);
      }

      this.playerMesh = playerMesh;

      // Ensure player mesh and all children are visible
      playerMesh.setEnabled(true);
      playerMesh.visibility = 1;
      playerMesh.getChildMeshes().forEach(child => {
        child.setEnabled(true);
        child.visibility = 1;
      });

      if (this.camera) {
        this.camera.target = playerMesh.position.add(new Vector3(0, 1.6, 0));
        this.camera.radius = 10;
        this.camera.alpha = -Math.PI / 2;
        this.camera.beta = Math.PI / 3;

        const controller = new CharacterController(playerMesh, this.camera, this.scene, undefined, true);
        controller.setCameraTarget(new Vector3(0, 1.6, 0));
        controller.setNoFirstPerson(true);
        controller.setStepOffset(0.75);
        controller.setSlopeLimit(15, 75);
        controller.setWalkSpeed(2.5);
        controller.setRunSpeed(5);
        controller.setLeftSpeed(2);
        controller.setRightSpeed(2);
        controller.setJumpSpeed(6);
        controller.setTurnSpeed(60);

        // Wire animations: use animation groups for GLB models, ranges for .babylon
        if (result.animationGroups && result.animationGroups.length > 0) {
          // GLB format — map animation groups by name
          const agByName: Record<string, any> = {};
          for (const ag of result.animationGroups) {
            agByName[ag.name] = ag;
            ag.stop(); // Stop all groups initially
          }
          const agMap: Record<string, any> = {};
          if (agByName['idle']) agMap['idle'] = agByName['idle'];
          if (agByName['walk']) agMap['walk'] = agByName['walk'];
          if (agByName['run']) agMap['run'] = agByName['run'];
          if (agByName['turnLeft']) agMap['turnLeft'] = agByName['turnLeft'];
          if (agByName['turnRight']) agMap['turnRight'] = agByName['turnRight'];
          if (agByName['walkBack']) agMap['walkBack'] = agByName['walkBack'];
          if (agByName['idleJump']) agMap['idleJump'] = agByName['idleJump'];
          if (agByName['runJump']) agMap['runJump'] = agByName['runJump'];
          if (agByName['fall']) agMap['fall'] = agByName['fall'];
          if (agByName['slideBack']) agMap['slideBack'] = agByName['slideBack'];
          if (agByName['strafeLeft']) agMap['strafeLeft'] = agByName['strafeLeft'];
          if (agByName['strafeRight']) agMap['strafeRight'] = agByName['strafeRight'];
          controller.setAnimationGroups(agMap);
        } else {
          // .babylon format — use skeleton animation ranges
          controller.setIdleAnim("idle", 1, true);
          controller.setWalkAnim("walk", 1, true);
          controller.setRunAnim("run", 1.2, true);
          controller.setTurnLeftAnim("turnLeft", 0.5, true);
          controller.setTurnRightAnim("turnRight", 0.5, true);
          controller.setWalkBackAnim("walkBack", 0.5, true);
          controller.setIdleJumpAnim("idleJump", 0.5, false);
          controller.setRunJumpAnim("runJump", 0.6, false);
          controller.setFallAnim("fall", 2, false);
          controller.setSlideBackAnim("slideBack", 1, false);
        }

        // Determine footstep sound URL from asset collection or fallback to hardcoded
        let footstepSoundUrl = FOOTSTEP_SOUND_URL;
        const footstepAssetId = this.world3DConfig?.audioAssets?.footstep;
        if (footstepAssetId && this.worldAssets && this.worldAssets.length > 0) {
          const footstepAsset = this.worldAssets.find((a) => a.id === footstepAssetId);
          if (footstepAsset && footstepAsset.filePath) {
            footstepSoundUrl = footstepAsset.filePath.startsWith('/')
              ? footstepAsset.filePath
              : '/' + footstepAsset.filePath;
          }
        }

        const walkSound = new Sound(
          "player-walk",
          footstepSoundUrl,
          this.scene,
          () => {
            controller.setSound(walkSound);
          },
          { loop: false }
        );

        controller.setCameraElasticity(true);
        controller.makeObstructionInvisible(true);
        controller.start();

        this.playerController = controller;

        // Initialize vehicle system for faster travel (bicycle / horse)
        this.vehicleSystem = new VehicleSystem(
          this.scene,
          playerMesh,
          controller,
          2.5,  // base walk speed
          5.0,  // base run speed
          60,   // base turn speed (degrees)
          this.eventBus,
        );

        // Connect camera manager to player and controller
        if (this.cameraManager) {
          this.cameraManager.setCharacterController(controller);
          this.cameraManager.setPlayerMesh(playerMesh);

          // Apply world creator's camera perspective if specified
          const perspective = (this.worldData as any)?.cameraPerspective;
          if (perspective && ['first_person', 'third_person', 'isometric', 'side_scroll', 'top_down', 'fighting'].includes(perspective)) {
            this.cameraManager.setMode(perspective as CameraMode, false);
          }
        }
      }

      this.playerHealthBar = new HealthBar(this.scene, playerMesh, 2.5);
      this.playerHealthBar.updateHealth(1.0);

      if (this.combatSystem) {
        this.combatSystem.registerEntity(
          'player',
          'Player',
          100,
          playerMesh,
          1.0,
          10,
          0.15
        );
        this.equipmentManager = new EquipmentManager(this.combatSystem, 'player');
      }

      // Set player mesh for ambient conversation manager
      if (this.ambientConversationManager) {
        this.ambientConversationManager.setPlayerMesh(playerMesh);
      }

      this.updatePlayerStatusUI("Ready");
    } catch (error) {
      console.error("Failed to load player", error);
    }
  }

  private selectPlayerMesh(meshes: AbstractMesh[]): Mesh | null {
    const explicitRoot = meshes.find(m => m.name === "__root__" && m instanceof Mesh) as Mesh | undefined;
    if (explicitRoot) return explicitRoot;

    const skinned = meshes.find(m => !!m.skeleton) as Mesh | undefined;
    if (skinned) return skinned;

    const firstMesh = meshes.find(m => m instanceof Mesh) as Mesh | undefined;
    return firstMesh ?? null;
  }

  private preparePlayerMesh(mesh: Mesh, skeleton?: Skeleton): Mesh {
    if (mesh.parent) {
      mesh.setParent(null);
    }

    if (skeleton) {
      skeleton.enableBlending(0.1);
      mesh.skeleton = skeleton;
    }

    // Match old implementation: start above terrain, let character controller handle falling to ground
    mesh.position = new Vector3(0, 12, 0);
    mesh.rotation = Vector3.Zero();
    mesh.scaling = new Vector3(1, 1, 1);
    mesh.checkCollisions = true;
    mesh.ellipsoid = new Vector3(0.5, 1, 0.5);
    mesh.ellipsoidOffset = new Vector3(0, 1, 0);
    mesh.computeWorldMatrix(true);
    return mesh;
  }

  private async loadNPCs(): Promise<void> {
    
    if (!this.scene || !this.worldData) {
      return;
    }

    const allCharacters = this.characters || this.worldData.characters || [];
    // Filter out deceased and departed characters — they should not walk around
    const characters = allCharacters
      .filter((c: any) => c.isAlive !== false && c.status !== 'deceased' && c.status !== 'inactive')
      .slice(0, MAX_NPCS);

    if (characters.length === 0) {
      return;
    }

    // Block material dirty mechanism during bulk NPC loading to prevent
    // redundant material state recomputation per NPC
    if (this.scene) this.scene.blockMaterialDirtyMechanism = true;

    const total = characters.length;
    // Load NPCs in parallel batches for faster startup
    const BATCH_SIZE = 8;
    for (let batchStart = 0; batchStart < total; batchStart += BATCH_SIZE) {
      const batch = characters.slice(batchStart, batchStart + BATCH_SIZE);
      this.updateLoadingScreen(`Loading NPCs... (${Math.min(batchStart + BATCH_SIZE, total)}/${total})`, 70 + Math.round((batchStart / total) * 15));
      await Promise.all(batch.map(character =>
        this.loadNPC(character).catch(error => {
          console.error(`Failed to load NPC ${character.id}:`, error);
        })
      ));
    }

    // Re-enable material dirty mechanism
    if (this.scene) this.scene.blockMaterialDirtyMechanism = false;

    // Populate NPC list panel
    if (this.guiManager) {
      const npcList = this.npcInfos.map((npc) => {
        const instance = this.npcMeshes.get(npc.id);
        const role = instance?.role;
        return {
          id: npc.id,
          name: npc.name,
          occupation: npc.occupation,
          disposition: npc.disposition,
          questGiver: npc.questGiver,
          role
        };
      });
      this.guiManager.updateNPCList(npcList);
    }

    // Log NPC itineraries for debugging
    console.log('=== NPC Itineraries ===');
    this.npcMeshes.forEach((instance, npcId) => {
      const name = instance.characterData
        ? `${instance.characterData.firstName || ''} ${instance.characterData.lastName || ''}`.trim()
        : npcId;
      const itinerary = this.npcScheduleSystem.getItinerary(npcId);
      console.log(`  ${name}: ${itinerary}`);
    });
    console.log(`=== ${this.npcMeshes.size} NPCs loaded ===`);

    // Update quest indicators after NPCs are loaded
    this.updateQuestIndicators();
  }

  /**
   * Populate businesses with customer NPCs during game loading.
   * Owners/employees are already near their workplace via findNPCSpawnPosition.
   * This assigns 1-3 random civilian NPCs as customers to each open business.
   */
  private populateBusinessesWithNPCs(): void {
    const result = this.businessPopulationManager.populate(
      this.buildingData as Map<string, any>,
      this.npcMeshes as Map<string, any>,
      {
        gameHour: this.gameTimeManager?.getState().hour ?? 12,
        isPointInsideBuilding: (x, z) => this.isPointInsideAnyBuilding(x, z),
      },
    );
    if (result.totalCustomersAssigned > 0) {
      console.log(`[BabylonGame] Populated businesses with ${result.totalCustomersAssigned} customer NPCs across ${result.customersByBusiness.size} businesses`);
    }
  }

  private getRoleForCharacter(character: WorldCharacter): NPCRole {
    const occupation = (character.occupation || '').toLowerCase();
    const faction = (character.faction || '').toLowerCase();
    const quests = this.worldData?.quests || [];
    const age = (character as any).age ?? 30;

    // Quest givers always take precedence
    if (quests.some((q) => q.giverCharacterId === character.id)) {
      return 'questgiver';
    }

    // Age-based roles
    if (age < 14) return 'child';
    if (age >= 65) return 'elder';

    const text = `${occupation} ${faction}`;

    // Military / enforcement
    if (text.includes('guard') || text.includes('watch') || text.includes('police') || text.includes('sheriff')) return 'guard';
    if (text.includes('soldier') || text.includes('knight') || text.includes('militia') || text.includes('army') || text.includes('warrior')) return 'soldier';

    // Commerce
    if (text.includes('merchant') || text.includes('shop') || text.includes('trader') || text.includes('vendor') || text.includes('market')) return 'merchant';

    // Trades & labor
    if (text.includes('farm') || text.includes('ranch') || text.includes('harvest') || text.includes('shepherd')) return 'farmer';
    if (text.includes('smith') || text.includes('forge') || text.includes('armorer') || text.includes('weaponsmith')) return 'blacksmith';
    if (text.includes('innkeep') || text.includes('barkeep') || text.includes('tavern') || text.includes('bartend')) return 'innkeeper';

    // Learned professions
    if (text.includes('priest') || text.includes('cleric') || text.includes('monk') || text.includes('clergy') || text.includes('pastor') || text.includes('chaplain')) return 'priest';
    if (text.includes('teach') || text.includes('tutor') || text.includes('professor') || text.includes('scholar') || text.includes('librarian')) return 'teacher';
    if (text.includes('doctor') || text.includes('physician') || text.includes('healer') || text.includes('apothecary') || text.includes('nurse') || text.includes('medic')) return 'doctor';

    // Social classes
    if (text.includes('noble') || text.includes('lord') || text.includes('lady') || text.includes('duke') || text.includes('baron') || text.includes('count') || text.includes('mayor')) return 'noble';
    if (text.includes('beggar') || text.includes('vagrant') || text.includes('homeless') || text.includes('drifter')) return 'beggar';

    // Maritime
    if (text.includes('sailor') || text.includes('fisher') || text.includes('captain') || text.includes('navigator') || text.includes('boatswain')) return 'sailor';

    return 'civilian';
  }

  /**
   * Resolve the model URL for an NPC based on role, gender, and available asset pool.
   * Uses deterministic selection so the same character always gets the same model.
   */
  private resolveNPCModelUrl(role: NPCRole, character?: WorldCharacter): { rootUrl: string; file: string; cacheKey: string } | null {
    const characterModels = this.world3DConfig?.characterModels || {};
    const gender: NPCGender = (character?.gender?.toLowerCase() as NPCGender) || 'other';
    const characterId = character?.id || '';

    // Use variety system to pick from available pool
    const npcConfigId = selectNPCModel(characterModels, characterId, role, gender);

    if (npcConfigId && this.worldAssets && this.worldAssets.length > 0) {
      const overrideAsset = this.worldAssets.find((a) => a.id === npcConfigId);
      if (overrideAsset && overrideAsset.filePath) {
        const cleanPath = overrideAsset.filePath.replace(/^\//, '');
        const lastSlash = cleanPath.lastIndexOf('/');
        const rootUrl = lastSlash >= 0 ? '/' + cleanPath.substring(0, lastSlash + 1) : '/';
        const file = lastSlash >= 0 ? cleanPath.substring(lastSlash + 1) : cleanPath;
        return { rootUrl, file, cacheKey: npcConfigId };
      }
    }
    return null;
  }

  /**
   * Load or retrieve a cached NPC model via the instancer. First call loads
   * the template; subsequent calls clone from it (sharing geometry buffers).
   */
  private async getOrLoadNPCModel(cacheKey: string, rootUrl: string, file: string, npcId: string, role: NPCRole): Promise<{ root: Mesh; animationGroups: any[]; lodProxy: Mesh | null; billboard: Mesh | null } | null> {
    if (!this.scene || !this.npcModelInstancer) return null;
    return this.npcModelInstancer.acquire(cacheKey, rootUrl, file, npcId, role);
  }

  private async loadNPC(character: WorldCharacter): Promise<void> {
    if (!this.scene) return;

    try {
      const role = this.getRoleForCharacter(character);
      let root: Mesh | null = null;
      let animationGroups: any[] = [];
      let instancedBillboard: Mesh | null = null;
      let usedModularAssembly = false;
      let usedCompleteCharacterModel = false;

      // Primary path: Quaternius character models (complete body + outfit baked in)
      if (!root && this.quaterniusNPCLoader?.hasAssets()) {
        try {
          const quatGender = normalizeToQuaterniusGender(character.gender);
          const savedAppearance = (character as any).generationConfig?.quaterniusAppearance;
          const quatResult = await this.quaterniusNPCLoader.loadForCharacter(
            character.id,
            quatGender,
            role,
            savedAppearance,
          );
          if (quatResult) {
            root = quatResult.root;
            animationGroups = quatResult.animationGroups;
            // Check if this was a complete character model (outfit/hair baked in)
            const quatConfig = selectQuaterniusConfig(character.id, quatGender, role);
            usedCompleteCharacterModel = isCompleteCharacterModel(quatConfig.body.id);
          }
        } catch { /* Quaternius assets not available — fall through */ }
      }

      // Tier 2: modular NPC assembly from procedural body parts
      if (!root && this.npcModularAssembler) {
        try {
          const bodyType = deriveModularBodyType(character.physicalTraits, character.occupation);
          const assembled = this.npcModularAssembler.assemble(character.id, role, bodyType);
          root = assembled.root;
          usedModularAssembly = true;
        } catch { /* modular assembly failed — fall through */ }
      }

      // Fallback: Try world-level NPC override (role+gender specific, with fallback chain)
      if (!root) {
        try {
          const modelInfo = this.resolveNPCModelUrl(role, character);
          if (modelInfo) {
            const modelResult = await this.getOrLoadNPCModel(modelInfo.cacheKey, modelInfo.rootUrl, modelInfo.file, character.id, role);
            if (modelResult) {
              root = modelResult.root;
              animationGroups = modelResult.animationGroups;
              instancedBillboard = modelResult.billboard;
            }
          }
        } catch { /* world-level override failed — fall through */ }
      }

      // Fallback: Try diverse NPC model based on gender, body type, and world genre
      if (!root) {
        try {
          const diverseModel = resolveNPCModelFromCharacter(character, role, this.config.worldType);
          const diverseResult = await this.getOrLoadNPCModel(diverseModel.cacheKey, diverseModel.rootUrl, diverseModel.file, character.id, role);
          if (diverseResult) {
            root = diverseResult.root;
            animationGroups = diverseResult.animationGroups;
            instancedBillboard = diverseResult.billboard;
          }
        } catch { /* diverse model failed — fall through */ }
      }

      // Fallback: shared default NPC model (uses instancer with cloning)
      if (!root) {
        try {
          const defaultResult = await this.getOrLoadNPCModel('__default_npc__', '', NPC_MODEL_URL, character.id, role);
          if (defaultResult) {
            root = defaultResult.root;
            animationGroups = defaultResult.animationGroups;
            instancedBillboard = defaultResult.billboard;
          }
        } catch { /* default model failed — fall through */ }
      }

      // Final fallback: direct load if all else failed
      if (!root) {
        try {
          const result = await SceneLoader.ImportMeshAsync("", "", NPC_MODEL_URL, this.scene);
          root = (this.selectPlayerMesh(result.meshes) || (result.meshes[0] as Mesh));
          animationGroups = result.animationGroups || [];
        } catch { /* even final fallback failed */ }
      }
      if (!root) {
        console.error(`[BabylonGame] ❌ No usable mesh found for NPC ${character.id}, skipping`);
        return;
      }
      root.name = `npc_${character.id}`;
      root.metadata = { npcId: character.id, npcRole: role };
      root.checkCollisions = true;

      // Collision ellipsoid for NPCs (same as player)
      root.ellipsoid = new Vector3(0.5, 1, 0.5);
      root.ellipsoidOffset = new Vector3(0, 1, 0);

      // Phase 8A: Place NPC near their workplace/residence building if found
      const spawnPos = this.findNPCSpawnPosition(character, role);
      root.position = spawnPos;

      // Phase 8B: Apply procedural appearance variation for visual distinction
      // Complete character models and modular assembly have appearance baked in;
      // only generate appearance data for billboard/accessory use without modifying meshes
      let appearance: NPCAppearance;
      if (usedModularAssembly || usedCompleteCharacterModel) {
        appearance = generateNPCAppearance(character.id, role);
      } else {
        const allNpcMeshes = [root, ...root.getChildMeshes()];
        appearance = this.applyNPCAppearance(allNpcMeshes, character.id, role);
      }

      // Create CharacterController for NPCs (with null camera for programmatic control)
      let controller: CharacterController | null = null;
      try {
        // Pass null as camera - NPCs don't need camera control
        controller = new CharacterController(root, null as any, this.scene);
        controller.setFaceForward(false);
        controller.setMode(0);
        controller.setStepOffset(0.75);
        controller.setSlopeLimit(15, 75);
        
        // Set up animations — find AnimationGroup objects by name
        // GLTF models register animation groups on the scene; the CharacterController
        // requires AnimationGroup objects (not strings) when _isAG is true.
        const findAG = (name: string) => {
          // First check the NPC's own animation groups (cloned per-NPC)
          const own = animationGroups.find((ag: any) => ag.name === name);
          if (own) return own;
          // Fallback: search scene animation groups (may be shared)
          return this.scene?.animationGroups?.find((ag: any) => ag.name === name) ?? null;
        };

        const idleAG = findAG("Idle") || findAG("Idle_Neutral") || findAG("idle");
        const walkAG = findAG("Walk") || findAG("walk");
        const runAG = findAG("Run") || findAG("run");
        const turnLeftAG = findAG("Run_Left") || findAG("turnLeft");
        const turnRightAG = findAG("Run_Right") || findAG("turnRight");
        const walkBackAG = findAG("Run_Back") || findAG("walkBack");

        if (idleAG) controller.setIdleAnim(idleAG, 1, true);
        if (walkAG) controller.setWalkAnim(walkAG, 1, true);
        if (runAG) controller.setRunAnim(runAG, 1.2, true);
        if (turnLeftAG) controller.setTurnLeftAnim(turnLeftAG, 0.5, true);
        if (turnRightAG) controller.setTurnRightAnim(turnRightAG, 0.5, true);
        if (walkBackAG) controller.setWalkBackAnim(walkBackAG, 0.5, true);
        
        // Disable keyboard control - NPCs are controlled programmatically
        controller.enableKeyBoard(false);

        // NPC walk speed: natural walking pace (default is 3, player speed)
        controller.setWalkSpeed(2.0);
        // Faster turn speed for NPCs so they don't circle around targets (default ~22.5 deg/s)
        controller.setTurnSpeed(180);

        // Start the controller
        controller.start();
        
      } catch (controllerError) {
        console.error(`Failed to create NPC controller for ${character.id}:`, controllerError);
      }

      const npcInstance: NPCInstance = {
        mesh: root,
        controller,
        questMarker: null,
        state: 'idle',
        role,
        homePosition: root.position.clone(),
        disposition: 0,
        characterData: character,
        animationGroups: animationGroups || [],
        currentAnimation: null
      };

      // Billboard LOD: use instancer's billboard (with mesh-level LOD) or create standalone
      const npcName = `${character.firstName || ''} ${character.lastName || ''}`.trim() || character.id;
      npcInstance.billboardLOD = instancedBillboard || this.createNPCBillboard(npcName, role, root.position, appearance);

      // Attach occupation-based accessories (hats, tools, etc.)
      // Skip for complete character models — they have appearance baked in
      if (this.npcAccessorySystem && !usedCompleteCharacterModel) {
        this.npcAccessorySystem.attachAccessories(
          character.id,
          root,
          npcName,
          character.occupation || '',
        );
        // Attach procedural hair and facial hair
        this.npcAccessorySystem.attachHair(character.id, root, appearance);
      }

      // Register with unified interaction prompt (world-space billboard)
      this.interactionPrompt?.registerNPC({ id: character.id, name: npcName, mesh: root });

      this.npcMeshes.set(character.id, npcInstance);

      // Register with simulation LOD system
      if (this.npcSimulationLOD) {
        this.npcSimulationLOD.registerNPC(character.id, root, npcInstance.billboardLOD);
      }

      // Register NPC with schedule system (find associated work/home buildings + friends)
      {
        let workBuildingId: string | undefined;
        let homeBuildingId: string | undefined;
        const friendBuildingIds: string[] = [];
        const charId = character.id;

        this.buildingData.forEach((data, buildingId) => {
          const meta = data.metadata;
          if (!meta) return;
          if (meta.buildingType === 'business') {
            if (meta.ownerId === charId ||
                (Array.isArray(meta.employees) && meta.employees.some((e: any) =>
                  typeof e === 'string' ? e === charId : e?.id === charId
                ))) {
              workBuildingId = buildingId;
            }
          }
          if (meta.buildingType === 'residence') {
            if (Array.isArray(meta.occupants) && meta.occupants.some((o: any) =>
              typeof o === 'string' ? o === charId : o?.id === charId
            )) {
              homeBuildingId = buildingId;
            }
          }
        });

        // Find friend/family residences from character relationships
        const charAny = character as any;
        const relationships = charAny.relationships as Record<string, any> | undefined;
        if (relationships) {
          for (const relCharId of Object.keys(relationships)) {
            this.buildingData.forEach((data, buildingId) => {
              const meta = data.metadata;
              if (meta?.buildingType === 'residence' && buildingId !== homeBuildingId) {
                if (Array.isArray(meta.occupants) && meta.occupants.some((o: any) =>
                  typeof o === 'string' ? o === relCharId : o?.id === relCharId
                )) {
                  if (!friendBuildingIds.includes(buildingId)) {
                    friendBuildingIds.push(buildingId);
                  }
                }
              }
            });
          }
        }

        // Also add family members' residences
        const parentIds = charAny.parentIds as string[] | undefined;
        const childIds = charAny.childIds as string[] | undefined;
        const familyIds = [...(parentIds || []), ...(childIds || [])];
        for (const famId of familyIds) {
          this.buildingData.forEach((data, buildingId) => {
            const meta = data.metadata;
            if (meta?.buildingType === 'residence' && buildingId !== homeBuildingId) {
              if (Array.isArray(meta.occupants) && meta.occupants.some((o: any) =>
                typeof o === 'string' ? o === famId : o?.id === famId
              )) {
                if (!friendBuildingIds.includes(buildingId)) {
                  friendBuildingIds.push(buildingId);
                }
              }
            }
          });
        }

        const personality = charAny.personality as Record<string, number> | undefined;
        this.npcScheduleSystem.registerNPC(
          character.id,
          workBuildingId,
          homeBuildingId,
          friendBuildingIds.length > 0 ? friendBuildingIds : undefined,
          personality ? {
            openness: personality.openness ?? personality.Openness,
            conscientiousness: personality.conscientiousness ?? personality.Conscientiousness,
            extroversion: personality.extroversion ?? personality.Extroversion,
            agreeableness: personality.agreeableness ?? personality.Agreeableness,
            neuroticism: personality.neuroticism ?? personality.Neuroticism,
          } : undefined
        );

        // Register with unified schedule executor for daily routine management
        this.scheduleExecutor.registerNPC(character.id, personality ? {
          openness: personality.openness ?? personality.Openness,
          conscientiousness: personality.conscientiousness ?? personality.Conscientiousness,
          extroversion: personality.extroversion ?? personality.Extroversion,
          agreeableness: personality.agreeableness ?? personality.Agreeableness,
          neuroticism: personality.neuroticism ?? personality.Neuroticism,
        } : undefined);
        this.npcActivityLabelSystem?.registerNPC(character.id);

        // Assign NPC to settlement zone for boundary confinement.
        // Tries: (1) work building metadata, (2) home building metadata,
        // (3) character's own currentLocation/settlementId field,
        // (4) nearest settlement by proximity.
        {
          let npcSettlementId: string | undefined;
          if (workBuildingId) {
            npcSettlementId = this.buildingData.get(workBuildingId)?.metadata?.settlementId;
          }
          if (!npcSettlementId && homeBuildingId) {
            npcSettlementId = this.buildingData.get(homeBuildingId)?.metadata?.settlementId;
          }
          if (!npcSettlementId) {
            npcSettlementId = (character as any).settlementId
              || (character as any).currentLocation
              || undefined;
          }
          // Final fallback: nearest settlement by NPC spawn position
          if (!npcSettlementId && instance.mesh) {
            npcSettlementId = this.findSettlementForMesh(instance.mesh) ?? undefined;
          }
          // If still nothing and we have any settlements, use the first one
          if (!npcSettlementId && this.settlementMeshes.size > 0) {
            npcSettlementId = this.settlementMeshes.keys().next().value as string;
          }
          if (npcSettlementId) {
            const zoneData = this.zoneBoundaryMeshes.get(npcSettlementId);
            const settlementMesh = this.settlementMeshes.get(npcSettlementId);
            if (zoneData?.zoneRadius && settlementMesh) {
              this.npcScheduleSystem.setNPCSettlement(
                character.id,
                npcSettlementId,
                settlementMesh.position,
                zoneData.zoneRadius
              );
            }
          }
        }

        // Register with Volition System for spontaneous goal formation
        const volitionPersonality = {
          openness: personality?.openness ?? personality?.Openness ?? 0.5,
          conscientiousness: personality?.conscientiousness ?? personality?.Conscientiousness ?? 0.5,
          extroversion: personality?.extroversion ?? personality?.Extroversion ?? 0.5,
          agreeableness: personality?.agreeableness ?? personality?.Agreeableness ?? 0.5,
          neuroticism: personality?.neuroticism ?? personality?.Neuroticism ?? 0.5,
        };
        const volitionRelationships: Record<string, { charge: number; spark: number; type: string }> = {};
        if (charAny.relationships) {
          for (const [relId, relData] of Object.entries(charAny.relationships as Record<string, any>)) {
            volitionRelationships[relId] = {
              charge: relData?.charge ?? relData?.affinity ?? 0,
              spark: relData?.spark ?? 0,
              type: relData?.type ?? 'acquaintance',
            };
          }
        }
        this.volitionSystem.registerNPC({
          id: character.id,
          name: `${character.firstName || ''} ${character.lastName || ''}`.trim() || character.id,
          personality: volitionPersonality,
          relationships: volitionRelationships,
          currentLocation: 'settlement',
          health: 1.0,
          emotionalState: 'content',
          recentEvents: [],
        });
      }

      const npcInfo: NPCDisplayInfo = {
        id: character.id,
        name: npcName,
        occupation: character.occupation,
        disposition: character.disposition,
        questGiver: role === 'questgiver',
        position: { x: root.position.x, z: root.position.z }
      };

      this.npcInfos.push(npcInfo);

      const healthBar = new HealthBar(this.scene!, root, 2.5);
      healthBar.updateHealth(1.0);
      healthBar.hide();
      this.npcHealthBars.set(character.id, healthBar);

      if (this.combatSystem) {
        this.combatSystem.registerEntity(
          character.id,
          npcInfo.name,
          100,
          root,
          1.0,
          3,
          0.1
        );
      }

      // Register NPC for ambient conversations
      if (this.ambientConversationManager) {
        this.ambientConversationManager.registerNPC(
          character.id,
          npcInfo.name,
          root,
          npcInstance.state
        );
      }

      // Register NPC for socialization (personality-driven NPC-NPC interactions)
      if (this.socializationController) {
        const charAny = character as any;
        const personality = charAny.personality || {
          openness: 0.5, conscientiousness: 0.5, extroversion: 0.5,
          agreeableness: 0.5, neuroticism: 0.5,
        };
        this.socializationController.registerNPC({
          id: character.id,
          position: root.position.clone(),
          personality,
          relationships: charAny.relationships || {},
          mood: charAny.mood || 'neutral',
          isInConversation: false,
          locationId: charAny.currentLocation || 'overworld',
        });
      }

      // Register NPC for NPC-initiated conversations
      if (this.npcInitiatedConversationController) {
        const personality = character.personality || {
          openness: 0.5, conscientiousness: 0.5, extroversion: 0.5,
          agreeableness: 0.5, neuroticism: 0.5,
        };
        this.npcInitiatedConversationController.registerNPC({
          id: character.id,
          name: npcName,
          position: root.position.clone(),
          personality,
          relationships: character.relationships || {},
          mood: character.mood || 'neutral',
          isInConversation: false,
          occupation: character.occupation,
        });
      }
    } catch (error) {
      console.error(`Failed to load NPC ${character.id}:`, error);
    }
  }

  /**
   * Phase 8A: Find a spawn position for an NPC near their workplace or residence building.
   * Searches buildingData for buildings where the character is owner, employee, or occupant.
   */
  /** Register a building footprint for point-in-building checks. */
  private registerBuildingFootprint(position: Vector3, rotation: number, width: number, depth: number): void {
    const pad = 1.5; // extra padding so NPCs don't spawn right at the edge
    this.buildingFootprints.push({
      cx: position.x,
      cz: position.z,
      halfW: width / 2 + pad,
      halfD: depth / 2 + pad,
      cos: Math.cos(-rotation),
      sin: Math.sin(-rotation),
    });
  }

  /** Compute the door world position for a building (front face center, offset outward). */
  private computeBuildingDoorPosition(position: Vector3, rotation: number, depth: number): Vector3 {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const doorLocalZ = depth / 2 + 0.5;
    return new Vector3(
      position.x + sin * doorLocalZ,
      position.y,
      position.z + cos * doorLocalZ,
    );
  }

  /**
   * Create a small text label next to the front door of a building.
   * For residences: shows the address number (e.g. "123").
   * For businesses: shows the business name (e.g. "Tavern").
   */
  private createDoorLabel(
    scene: Scene,
    buildingId: string,
    label: string,
    buildingPos: Vector3,
    rotation: number,
    depth: number,
    width: number
  ): void {
    if (!label) return;

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    // Door is at front face center; offset slightly right of center
    const doorLocalZ = depth / 2 + 0.15;
    const rightOffset = Math.min(width * 0.3, 1.5);

    // Right direction relative to building facing: perpendicular to forward
    const labelX = buildingPos.x + sin * doorLocalZ + cos * rightOffset;
    const labelZ = buildingPos.z + cos * doorLocalZ - sin * rightOffset;
    const labelY = buildingPos.y + 1.8; // slightly above eye level beside door

    // Dynamic texture for the label
    const texW = 256;
    const texH = 64;
    const tex = new DynamicTexture(`door_label_tex_${buildingId}`, { width: texW, height: texH }, scene, false);
    const ctx = tex.getContext() as any as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, texW, texH);

    // Background plaque
    ctx.fillStyle = 'rgba(40, 30, 20, 0.85)';
    ctx.fillRect(4, 4, texW - 8, texH - 8);
    ctx.strokeStyle = '#a08060';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, texW - 8, texH - 8);

    // Label text
    ctx.fillStyle = '#f0e8d8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = Math.min(32, Math.floor(texW / (label.length * 0.7)));
    ctx.font = `bold ${fontSize}px "Georgia", serif`;
    ctx.fillText(label, texW / 2, texH / 2, texW - 16);
    tex.update();
    tex.hasAlpha = true;

    // Plane sized proportionally to text length
    const planeW = Math.min(2.0, Math.max(0.6, label.length * 0.15));
    const planeH = planeW * (texH / texW);
    const plane = MeshBuilder.CreatePlane(
      `door_label_${buildingId}`,
      { width: planeW, height: planeH, sideOrientation: Mesh.DOUBLESIDE },
      scene
    );
    plane.position = new Vector3(labelX, labelY, labelZ);
    // Orient the label to face the same direction as the building front
    plane.rotation.y = rotation;
    plane.isPickable = false;

    const mat = new StandardMaterial(`door_label_mat_${buildingId}`, scene);
    mat.diffuseTexture = tex;
    mat.emissiveTexture = tex;
    mat.disableLighting = true;
    mat.backFaceCulling = false;
    mat.useAlphaFromDiffuseTexture = true;
    plane.material = mat;

    this.worldPropMeshes.push(plane);
  }

  /** Check whether a world-space XZ point falls inside any registered building footprint. */
  private isPointInsideAnyBuilding(x: number, z: number): boolean {
    for (const b of this.buildingFootprints) {
      // Translate to building-local coords then rotate
      const dx = x - b.cx;
      const dz = z - b.cz;
      const lx = dx * b.cos - dz * b.sin;
      const lz = dx * b.sin + dz * b.cos;
      if (Math.abs(lx) < b.halfW && Math.abs(lz) < b.halfD) {
        return true;
      }
    }
    return false;
  }

  /** Check whether a world-space XZ point is within `margin` meters of any building footprint edge. */
  private isPointNearAnyBuilding(x: number, z: number, margin: number): boolean {
    for (const b of this.buildingFootprints) {
      const dx = x - b.cx;
      const dz = z - b.cz;
      const lx = dx * b.cos - dz * b.sin;
      const lz = dx * b.sin + dz * b.cos;
      if (Math.abs(lx) < b.halfW + margin && Math.abs(lz) < b.halfD + margin) {
        return true;
      }
    }
    return false;
  }

  /** Generate a spawn candidate near a center point, validated against buildings. */
  private findSafeSpawnNear(center: Vector3, spread: number, minOffset: number, maxAttempts = 20): Vector3 {
    // Try random positions, starting close and expanding outward
    for (let i = 0; i < maxAttempts; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = minOffset + Math.random() * spread;
      const x = center.x + Math.cos(angle) * dist;
      const z = center.z + Math.sin(angle) * dist;
      if (!this.isPointInsideAnyBuilding(x, z)) {
        return new Vector3(x, 12, z);
      }
    }
    // All attempts landed inside buildings — push well outside with building check
    for (let ring = 1; ring <= 4; ring++) {
      const dist = spread + minOffset * ring;
      for (let a = 0; a < 8; a++) {
        const angle = (a / 8) * Math.PI * 2;
        const x = center.x + Math.cos(angle) * dist;
        const z = center.z + Math.sin(angle) * dist;
        if (!this.isPointInsideAnyBuilding(x, z)) {
          return new Vector3(x, 12, z);
        }
      }
    }
    // Ultimate fallback — far enough that it can't be inside any building
    const angle = Math.random() * Math.PI * 2;
    const dist = spread * 2 + 20;
    return new Vector3(center.x + Math.cos(angle) * dist, 12, center.z + Math.sin(angle) * dist);
  }

  private findNPCSpawnPosition(character: WorldCharacter, role: NPCRole): Vector3 {
    const characterId = character.id;

    // Search building data for a building associated with this character
    const buildingEntries = Array.from(this.buildingData.values());
    for (const data of buildingEntries) {
      const meta = data.metadata;
      if (!meta) continue;

      // Check if character owns or works at a business
      if (meta.buildingType === 'business') {
        if (meta.ownerId === characterId ||
            (Array.isArray(meta.employees) && meta.employees.some((e: any) =>
              typeof e === 'string' ? e === characterId : e?.id === characterId
            ))) {
          return this.findSafeSpawnNear(data.position, 16, 6);
        }
      }

      // Check if character lives in a residence
      if (meta.buildingType === 'residence') {
        if (Array.isArray(meta.occupants) && meta.occupants.some((o: any) =>
          typeof o === 'string' ? o === characterId : o?.id === characterId
        )) {
          return this.findSafeSpawnNear(data.position, 16, 6);
        }
      }
    }

    // Fallback: place near a random settlement center if available
    const settlements = this.settlements || this.worldData?.settlements || [];
    if (settlements.length > 0 && this.settlementMeshes.size > 0) {
      const meshEntries = Array.from(this.settlementMeshes.values());
      const settlementMesh = meshEntries[Math.floor(Math.random() * meshEntries.length)];
      if (settlementMesh) {
        return this.findSafeSpawnNear(settlementMesh.position, 30, 4);
      }
    }

    // Ultimate fallback: random position near origin
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 20;
    return new Vector3(Math.cos(angle) * radius, 12, Math.sin(angle) * radius);
  }

  /**
   * Phase 8B: Apply procedural appearance variation to NPC meshes.
   * Each NPC gets a unique, deterministic combination of skin tone,
   * clothing color, scale, and material properties based on their character ID.
   */
  private applyNPCAppearance(meshes: AbstractMesh[], characterId: string, role: NPCRole): NPCAppearance {
    const appearance = generateNPCAppearance(characterId, role);

    // Apply scale to root mesh (first in array)
    if (meshes.length > 0) {
      const root = meshes[0];
      root.scaling = appearance.scale;
    }

    // Apply color and material variations to all sub-meshes
    let clothingMeshIndex = 0;
    let meshIndex = 0;
    for (const mesh of meshes) {
      if (mesh.material && mesh.material instanceof StandardMaterial) {
        const mat = mesh.material.clone(`${mesh.material.name}_appearance_${characterId.slice(-6)}`) as StandardMaterial;

        let baseColor: Color3;
        if (meshIndex === 0) {
          // First mesh: skin
          baseColor = appearance.skinColor;
        } else if (meshIndex === meshes.length - 1 && meshes.length > 2) {
          // Last mesh (when >2): accent color
          baseColor = appearance.accentColor;
        } else {
          // Clothing meshes: alternate primary/secondary with per-mesh hue shift
          baseColor = getClothingColorForMesh(appearance, clothingMeshIndex);
          clothingMeshIndex++;
        }

        // Blend base color with role tint
        mat.diffuseColor = blendWithRoleTint(baseColor, appearance);

        // Apply material property variations
        mat.specularPower = appearance.roughness * 100;
        if (appearance.emissiveIntensity > 0) {
          mat.emissiveColor = mat.diffuseColor.scale(appearance.emissiveIntensity);
        }

        mesh.material = mat;
        meshIndex++;
      }

      // Apply shoulder/head scaling to named mesh parts
      const meshName = mesh.name.toLowerCase();
      if (meshName.includes('shoulder') || meshName.includes('upper_arm') || meshName.includes('chest')) {
        mesh.scaling.x *= appearance.shoulderScale;
        mesh.scaling.z *= appearance.shoulderScale;
      } else if (meshName.includes('head') || meshName.includes('skull')) {
        mesh.scaling = mesh.scaling.scale(appearance.headScale);
      }
    }

    return appearance;
  }

  /**
   * Phase 4: Create a billboard LOD plane for an NPC.
   * At medium distance (60-120u), the full mesh is hidden and replaced
   * with a simple colored rectangle + name label. Starts hidden.
   * Uses the NPC's procedural appearance for consistent color at distance.
   */
  private createNPCBillboard(name: string, role: NPCRole, position: Vector3, appearance?: NPCAppearance): Mesh {
    const billboard = MeshBuilder.CreatePlane(
      `npc_billboard_${name}`,
      { width: 1.2, height: 2.4 },
      this.scene!
    );
    billboard.position = position.clone();
    billboard.position.y += 1.2;
    billboard.billboardMode = Mesh.BILLBOARDMODE_Y;
    billboard.isPickable = false;
    billboard.setEnabled(false); // Hidden by default

    const mat = new StandardMaterial(`npc_billboard_mat_${name}`, this.scene!);
    const color = appearance
      ? generateBillboardColor(appearance)
      : new Color3(0.6, 0.6, 0.6);
    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(0.4);
    mat.disableLighting = true;
    mat.backFaceCulling = false;
    billboard.material = mat;

    return billboard;
  }

  /**
   * Handle E-key building interaction: enter the nearest building or exit
   * the current interior.
   */
  private async handleBuildingInteraction(): Promise<void> {
    // If already inside a building, exit
    if (this.isInsideBuilding) {
      await this.exitBuilding();
      return;
    }

    if (!this.playerMesh) return;

    const playerPos = this.playerMesh.position;
    const maxDist = 8;
    let nearestBuilding: Mesh | null = null;
    let nearestDist = maxDist;

    // Search buildingData map (populated when buildings are placed in the world)
    this.buildingData.forEach((data) => {
      const meta = data.metadata;
      if (!meta?.buildingId || !meta?.buildingType) return;
      const dist = Vector3.Distance(playerPos, data.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestBuilding = data.mesh;
      }
    });

    // Fallback: scan all scene meshes for any building with metadata
    if (!nearestBuilding && this.scene) {
      for (const mesh of this.scene.meshes) {
        const meta = mesh.metadata;
        if (!meta?.buildingId || !meta?.buildingType) continue;
        const dist = Vector3.Distance(playerPos, mesh.position);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestBuilding = mesh as Mesh;
        }
      }
    }

    if (nearestBuilding) {
      const meta = nearestBuilding.metadata;
      await this.enterBuilding(
        meta.buildingId || meta.businessId || meta.residenceId,
        meta.buildingType,
        meta.businessType,
        nearestBuilding.position.clone()
      );
    } else {
      this.guiManager?.showToast({
        title: 'No building nearby',
        description: 'Walk closer to a building and press E to enter.',
        duration: 2000,
      });
    }
  }

  /**
   * Phase 4B: Enter a building interior. Loads a GLB interior model if one
   * is mapped to this business/building type; otherwise falls back to
   * procedural generation. Switches the engine to the interior scene.
   */
  private async enterBuilding(
    buildingId: string,
    buildingType: string,
    businessType?: string,
    doorWorldPos?: Vector3
  ): Promise<void> {
    if (!this.playerMesh || !this.scene || this.isInsideBuilding) return;

    // Lazy-init interior scene manager
    if (!this.interiorSceneManager && this.engine && this.scene) {
      console.log('[Interior] Lazy-creating InteriorSceneManager');
      this.interiorSceneManager = new InteriorSceneManager(this.engine, this.scene);
      if (this.interiorGenerator) {
        const interiorScene = this.interiorSceneManager.getInteriorScene();
        this.interiorGenerator.setTargetScene(interiorScene, true);
        this.interiorItemManager = new InteriorItemManager(interiorScene, this.objectModelTemplates, this.objectModelOriginalHeights, this.objectModelScaleHints);
        this.bookSpawnManager = new BookSpawnManager(interiorScene);
        this.fetchWorldTextsForBooks();
      }
    }

    if (!this.interiorSceneManager) {
      console.warn('[Interior] Cannot enter building — no interiorSceneManager');
      return;
    }

    // Save current overworld state
    this.savedOverworldPosition = this.playerMesh.position.clone();
    this.savedOverworldRotationY = this.playerMesh.rotation.y;
    if (this.camera) {
      this.savedOverworldCameraAlpha = this.camera.alpha;
    }

    this.activeBuildingId = buildingId;

    // Fade to black
    await this.performFadeTransition(true);

    // Switch to the interior scene
    this.playerMesh.setEnabled(false);
    const interiorScene = this.interiorSceneManager.getInteriorScene();

    // Create 3rd-person camera + player mesh for interior — same controls as overworld
    let spawnPos = new Vector3(0, 0, 0);

    // Create a capsule avatar for the interior (same mesh type as fallback player)
    const interiorAvatar = MeshBuilder.CreateCapsule('interior_player', { height: 2, radius: 0.4 }, interiorScene);
    interiorAvatar.position = new Vector3(spawnPos.x, spawnPos.y + 1, spawnPos.z);
    interiorAvatar.checkCollisions = true;
    interiorAvatar.ellipsoid = new Vector3(0.5, 1, 0.5);
    interiorAvatar.ellipsoidOffset = new Vector3(0, 1, 0);
    interiorAvatar.isVisible = true;
    // Give the interior player a subtle material so it's visible
    const avatarMat = new StandardMaterial('interior_player_mat', interiorScene);
    avatarMat.diffuseColor = new Color3(0.4, 0.5, 0.7);
    avatarMat.emissiveColor = new Color3(0.1, 0.15, 0.2);
    interiorAvatar.material = avatarMat;
    this.interiorPlayerMesh = interiorAvatar;

    // Create ArcRotateCamera — same setup as overworld 3rd-person
    const intCam = new ArcRotateCamera(
      'interior_camera',
      -Math.PI / 2,   // alpha — behind player
      Math.PI / 3,    // beta — above player
      8,              // radius — slightly closer than overworld (10) for tighter spaces
      interiorAvatar.position.add(new Vector3(0, 1.6, 0)),
      interiorScene
    );
    intCam.attachControl(this.engine!.getRenderingCanvas(), true);
    intCam.minZ = 0.1;
    intCam.lowerRadiusLimit = 3;   // Allow closer zoom for tight interiors
    intCam.upperRadiusLimit = 12;
    intCam.wheelDeltaPercentage = 0.01;
    this.interiorCamera = intCam;
    interiorScene.activeCamera = intCam;

    // Create CharacterController — identical config to overworld player
    const intController = new CharacterController(interiorAvatar, intCam, interiorScene, undefined, true);
    intController.setCameraTarget(new Vector3(0, 1.6, 0));
    intController.setNoFirstPerson(true);
    intController.setStepOffset(0.75);
    intController.setSlopeLimit(15, 75);
    intController.setWalkSpeed(2.5);
    intController.setRunSpeed(5);
    intController.setLeftSpeed(2);
    intController.setRightSpeed(2);
    intController.setJumpSpeed(6);
    intController.setTurnSpeed(60);
    intController.setCameraElasticity(true);
    intController.makeObstructionInvisible(true);
    intController.start();
    this.interiorPlayerController = intController;

    // Now safe to switch — interior scene has an active camera
    this.interiorSceneManager.switchToInterior();

    // Determine interior type: check asset collection config first, then building data
    const buildingInfo = this.buildingData.get(buildingId);
    const interiorAssetPath = buildingInfo?.metadata?.interiorAssetPath || null;

    if (interiorAssetPath) {
      console.log(`[Interior] Loading asset interior: ${interiorAssetPath} for ${businessType || buildingType}`);
      try {
        const { spawnPosition, meshCount } = await this.interiorSceneManager.loadInteriorModel(interiorAssetPath);
        spawnPos = spawnPosition;
        console.log(`[Interior] Asset interior loaded: ${meshCount} meshes`);
      } catch (err) {
        console.warn('[Interior] Failed to load asset interior, falling back to procedural:', err);
        spawnPos = this.generateProceduralInterior(buildingId, buildingType, businessType, doorWorldPos);
      }
    } else {
      console.log(`[Interior] Using procedural interior for ${businessType || buildingType}`);
      spawnPos = this.generateProceduralInterior(buildingId, buildingType, businessType, doorWorldPos);
    }

    // Position the interior player avatar at the spawn point (feet on floor)
    interiorAvatar.position = new Vector3(spawnPos.x, spawnPos.y + 1, spawnPos.z);
    intCam.target = interiorAvatar.position.add(new Vector3(0, 1.6, 0));
    intController.resetPhysicsState();

    // Debug NPC capsule for height reference (1.8m tall standing on floor)
    const debugNPC = MeshBuilder.CreateCapsule('interior_debug_npc', {
      height: 1.8,
      radius: 0.3,
    }, interiorScene);
    debugNPC.position = new Vector3(spawnPos.x + 2, spawnPos.y + 0.9, spawnPos.z + 3);
    const debugMat = new StandardMaterial('debug_npc_mat', interiorScene);
    debugMat.diffuseColor = new Color3(0.2, 0.6, 0.9);
    debugMat.emissiveColor = new Color3(0.1, 0.3, 0.45);
    debugNPC.material = debugMat;

    this.playerController?.resetPhysicsState();
    this.isInsideBuilding = true;
    this.currentBuildingBusinessType = businessType;

    // Register placed interior NPCs
    if (this.businessBehaviorSystem && this.interiorNPCManager && businessType) {
      this.businessBehaviorSystem.clearAll();
      for (const placed of this.interiorNPCManager.getPlacedNPCs()) {
        this.businessBehaviorSystem.registerNPC(placed.npcId, placed.role, businessType);
      }
    }

    // Spawn item props (only for procedural interiors)
    if (this.activeInterior) {
      this.interiorItemManager?.spawnItems(buildingId, this.activeInterior, this.worldItems);

      // Spawn physical book meshes from server texts
      if (this.bookSpawnManager && this.worldTextCache.length > 0) {
        const spawnedBooks = this.bookSpawnManager.spawnBooks(buildingId, this.activeInterior, this.worldTextCache);
        // Register book meshes with interaction prompt system for detection
        if (this.interactionPrompt) {
          for (const book of spawnedBooks) {
            if (!book.collected) {
              this.interactionPrompt.registerWorldProp(book.mesh);
            }
          }
        }
      }
    }

    // Register furniture meshes for interaction prompts
    if (this.activeInterior && this.interactionPrompt) {
      this.interactionPrompt.clearFurniture();
      for (const mesh of this.activeInterior.furniture) {
        const meta = mesh.metadata;
        if (meta?.isFurniture && meta.furnitureType) {
          this.interactionPrompt.registerFurniture(mesh, meta.furnitureType, meta.furnitureSubType || meta.furnitureType, buildingId);
          // Also register child meshes for ray-pick hit detection
          for (const child of mesh.getChildMeshes()) {
            this.interactionPrompt.registerFurniture(child, meta.furnitureType, meta.furnitureSubType || meta.furnitureType, buildingId);
          }
        }
      }
    }

    // Register action hotspots based on business type
    if (this.activeInterior && this.interactionPrompt && businessType) {
      this.interactionPrompt.clearActionHotspots();
      const hotspots = PlayerActionSystem.getHotspotsForBusiness(businessType);
      for (const hotspot of hotspots) {
        for (const mesh of this.activeInterior.furniture) {
          const meta = mesh.metadata;
          if (meta?.isFurniture && meta.furnitureSubType === hotspot.furnitureSubType) {
            const prompt = PlayerActionSystem.getPromptText(hotspot.actionType);
            this.interactionPrompt.registerActionHotspot(mesh, hotspot.actionType, prompt, buildingId);
            for (const child of mesh.getChildMeshes()) {
              this.interactionPrompt.registerActionHotspot(child, hotspot.actionType, prompt, buildingId);
            }
          }
        }
      }
    }

    // Register container meshes for interaction
    if (this.activeInterior && this.containerSpawnSystem && this.interactionPrompt) {
      this.interactionPrompt.clearContainers();
      const containers = this.containerSpawnSystem.spawnInteriorContainers(
        this.activeInterior.furniture,
        buildingId,
        businessType,
        buildingType,
      );
      for (const container of containers) {
        if (container.mesh) {
          this.interactionPrompt.registerContainer(
            container.mesh,
            container.id,
            container.type,
            container.type,
            false,
          );
          for (const child of container.mesh.getChildMeshes()) {
            this.interactionPrompt.registerContainer(
              child,
              container.id,
              container.type,
              container.type,
              false,
            );
          }
        }
      }
    }

    const label = businessType || buildingType || 'Building';
    this.guiManager?.showToast({
      title: `Entered ${label}`,
      description: 'Press E to exit',
      duration: 2500,
    });

    await this.performFadeTransition(false);
  }

  /** Generate a procedural interior and return the spawn position. */
  private generateProceduralInterior(
    buildingId: string,
    buildingType: string,
    businessType?: string,
    doorWorldPos?: Vector3
  ): Vector3 {
    if (!this.interiorGenerator) {
      return new Vector3(0, 1.6, 0);
    }
    const interior = this.interiorGenerator.generateInterior(
      buildingId, buildingType, businessType, doorWorldPos
    );
    this.activeInterior = interior;
    // Spawn a few paces inside the room (door is at -Z wall, room center is at position)
    const spawnPos = interior.doorPosition.clone();
    spawnPos.y = interior.position.y; // Floor level
    spawnPos.z += 4; // Step into the room (away from door, toward +Z)
    return spawnPos;
  }

  /**
   * Create an invisible trigger zone at the interior door opening.
   * When the player crosses it (walks outside the room), auto-exit.
   */
  private createInteriorDoorTrigger(interior: InteriorLayout): void {
    // Clean up previous trigger
    this.interiorDoorTrigger?.dispose();
    this.interiorDoorTrigger = null;

    // Use interior scene if available, otherwise overworld
    const targetScene = this.interiorSceneManager?.scene ?? this.scene;
    if (!targetScene) return;

    // Place a thin invisible box just outside the door opening
    const trigger = MeshBuilder.CreateBox('interior_door_trigger', {
      width: 3,
      height: 3,
      depth: 1,
    }, targetScene);
    // Position it just outside (south of) the door
    trigger.position = new Vector3(
      interior.doorPosition.x,
      interior.doorPosition.y + 0.5,
      interior.doorPosition.z - 1.5
    );
    trigger.isVisible = false;
    trigger.isPickable = false;
    trigger.checkCollisions = false;

    this.interiorDoorTrigger = trigger;
  }

  /**
   * Phase 4B: Exit the current building interior. Restores the player to
   * their saved overworld position with a fade transition.
   */
  private async exitBuilding(): Promise<void> {
    if (!this.playerMesh || !this.isInsideBuilding || !this.activeInterior) return;

    // Capture state before async operations
    const interior = this.activeInterior;
    const buildingId = this.activeBuildingId;

    // Fade to black
    await this.performFadeTransition(true);

    // Clean up interior scene resources
    if (this.interiorSceneManager) {
      // Dispose the interior player controller and mesh
      if (this.interiorPlayerController) {
        this.interiorPlayerController.stop();
        this.interiorPlayerController = null;
      }
      if (this.interiorPlayerMesh) {
        this.interiorPlayerMesh.dispose();
        this.interiorPlayerMesh = null;
      }

      // Dispose the interior camera
      this.interiorCamera?.detachControl();
      this.interiorCamera?.dispose();
      this.interiorCamera = null;

      // Dispose the interior geometry
      if (buildingId) {
        this.interiorGenerator?.disposeInterior(buildingId);
      }
      this.interiorSceneManager.clearInteriorMeshes();

      // Switch back to overworld rendering
      this.interiorSceneManager.switchToOverworld();

      // Re-enable player mesh in overworld
      this.playerMesh.setEnabled(true);

      // Re-attach overworld camera
      if (this.camera) {
        this.camera.attachControl(this.engine!.getRenderingCanvas(), true);
      }
    }

    // Restore camera to overworld settings
    if (this.camera) {
      this.camera.lowerRadiusLimit = 10;
      this.camera.upperRadiusLimit = 10;
      this.camera.radius = 10;
    }

    // Teleport player back to overworld
    if (this.savedOverworldPosition) {
      this.playerMesh.position = this.savedOverworldPosition.clone();
      this.playerMesh.rotation.y = this.savedOverworldRotationY;
      if (this.camera) {
        this.camera.alpha = this.savedOverworldCameraAlpha;
      }
    } else if (interior?.exitPosition) {
      this.playerMesh.position = interior.exitPosition.clone();
    }
    this.playerController?.resetPhysicsState();

    // Clean up interior items, books, and door trigger
    this.interiorItemManager?.clearItems();
    this.bookSpawnManager?.clearBooks();
    this.interiorDoorTrigger?.dispose();
    this.interiorDoorTrigger = null;

    this.isInsideBuilding = false;
    this.activeInterior = null;
    this.activeBuildingId = null;
    this.savedOverworldPosition = null;
    this.currentBuildingBusinessType = undefined;

    // Stand up if seated before exiting; cancel any in-progress physical action
    this.furnitureInteractionManager?.standUp();
    this.playerActionSystem?.cancelAction();
    // Clear furniture, action hotspot, and container registrations
    this.interactionPrompt?.clearFurniture();
    this.interactionPrompt?.clearActionHotspots();
    this.interactionPrompt?.clearContainers();
    this.containerPanel?.hide();

    // Clear business behavior tracking
    this.businessBehaviorSystem?.clearAll();

    this.guiManager?.showToast({
      title: 'Exited building',
      description: '',
      duration: 1500,
    });

    // Fade back in
    await this.performFadeTransition(false);
  }

  /**
   * Phase 4B: Simple fade-to-black / fade-from-black transition using a fullscreen GUI overlay.
   * @param fadeOut true = fade to black, false = fade from black to clear
   */
  private performFadeTransition(fadeOut: boolean): Promise<void> {
    return new Promise((resolve) => {
      const activeScene = this.interiorSceneManager?.getActiveScene() ?? this.scene;
      if (!activeScene) { resolve(); return; }

      // Create a fullscreen overlay plane in the currently active scene
      const overlay = MeshBuilder.CreatePlane('fade_overlay', { size: 500 }, activeScene);
      overlay.position = activeScene.activeCamera
        ? activeScene.activeCamera.position.clone()
        : Vector3.Zero();
      overlay.billboardMode = Mesh.BILLBOARDMODE_ALL;
      overlay.renderingGroupId = 3;
      overlay.isPickable = false;

      const mat = new StandardMaterial('fade_mat', activeScene);
      mat.diffuseColor = Color3.Black();
      mat.emissiveColor = Color3.Black();
      mat.disableLighting = true;
      mat.backFaceCulling = false;
      mat.alpha = fadeOut ? 0 : 1;
      overlay.material = mat;

      const duration = 400; // ms
      const startTime = Date.now();
      const startAlpha = fadeOut ? 0 : 1;
      const endAlpha = fadeOut ? 1 : 0;

      const observer = activeScene.onBeforeRenderObservable.add(() => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        mat.alpha = startAlpha + (endAlpha - startAlpha) * t;

        // Keep overlay in front of camera
        if (activeScene?.activeCamera) {
          const cam = activeScene.activeCamera;
          const forward = cam.getForwardRay().direction.normalize();
          overlay.position = cam.position.add(forward.scale(1));
        }

        if (t >= 1) {
          activeScene.onBeforeRenderObservable.remove(observer);
          overlay.dispose();
          mat.dispose();
          resolve();
        }
      });
    });
  }

  /**
   * Phase 8: Check if the player has entered or exited a settlement zone.
   * Triggers scene isolation transitions with fade effects.
   */
  private async checkSettlementTransition(): Promise<void> {
    if (!this.settlementSceneManager || !this.playerMesh) return;
    if (this.settlementSceneManager.transitioning) return;

    const zone = this.settlementSceneManager.checkPlayerZone(this.playerMesh.position);
    const currentId = this.settlementSceneManager.activeSettlementId;

    if (zone && !currentId) {
      // Player entered a settlement
      this.settlementSceneManager.transitioning = true;
      await this.performFadeTransition(true);

      this.settlementSceneManager.enterSettlement(zone.id);

      // Track location visit/discovery for quest objectives
      this.questObjectManager?.trackLocationVisit(zone.id, zone.name || zone.id);
      this.eventBus.emit({ type: 'settlement_entered', settlementId: zone.id, settlementName: zone.name || zone.id });
      this.reputationManager?.setCurrentSettlement(zone.id, zone.name || zone.id);

      // Hide NPCs not in this settlement (skip NPCs in active conversation)
      this.npcMeshes.forEach((instance, npcId) => {
        if (instance.isInConversation) return;
        if (!this.settlementSceneManager!.isNPCInActiveSettlement(npcId)) {
          if (instance.mesh && instance.mesh.isEnabled()) {
            instance.mesh.setEnabled(false);
          }
          if (instance.controller) {
            instance.controller.walk(false);
            instance.controller.turnLeft(false);
            instance.controller.turnRight(false);
          }
        }
      });

      this.settlementSceneManager.transitioning = false;
      await this.performFadeTransition(false);
    } else if (!zone && currentId) {
      // Player exited a settlement
      this.settlementSceneManager.transitioning = true;
      await this.performFadeTransition(true);

      this.settlementSceneManager.exitSettlement();

      // Re-enable all NPCs (Phase 7 distance culling will manage visibility)
      this.npcMeshes.forEach((instance) => {
        if (instance.mesh) {
          instance.mesh.setEnabled(true);
        }
      });

      // Force chunk manager to re-evaluate all chunks after restoring overworld
      if (this.chunkManager && this.playerMesh) {
        this.chunkManager.update(this.playerMesh.position);
      }

      this.settlementSceneManager.transitioning = false;
      await this.performFadeTransition(false);
    }
  }

  private setupKeyboardHandlers(): void {
    this.keyboardHandler = async (event: KeyboardEvent) => {
      await this.handleKeyDown(event);
    };
    this.keyUpHandler = (event: KeyboardEvent) => {
      if (event.code === KEY_PUSH_TO_TALK) {
        this.chatPanel?.stopPushToTalk();
      }
    };
    window.addEventListener('keydown', this.keyboardHandler);
    window.addEventListener('keyup', this.keyUpHandler);
  }

  private setupPointerHandlers(): void {
    if (!this.scene) return;

    this.pointerObserver = this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) return;
      const pickInfo = pointerInfo.pickInfo;
      if (!pickInfo?.hit || !pickInfo.pickedMesh) return;
      // Walk up parent chain to find root mesh with meaningful metadata
      let pickedMesh = pickInfo.pickedMesh;
      while (pickedMesh.parent && !pickedMesh.metadata?.buildingId && !pickedMesh.metadata?.npcId && !pickedMesh.metadata?.objectRole && !pickedMesh.metadata?.interiorExit) {
        pickedMesh = pickedMesh.parent as Mesh;
      }
      const metadata = pickedMesh.metadata || {};

      // World prop interaction (chests, data pads, lanterns, etc.)
      const objectRole = metadata.objectRole as string | undefined;
      if (objectRole) {
        this.handleWorldPropClicked(pickedMesh as Mesh, objectRole);
        return;
      }

      // Settlement click — no-op (details panel removed)

      // Phase 4B: Interior exit door — click to leave building
      if (metadata.interiorExit && metadata.buildingId) {
        this.exitBuilding();
        return;
      }

      // Phase 4B: Building door — click to enter building interior
      if (metadata.buildingType && metadata.buildingId) {
        const buildingMesh = pickInfo.pickedMesh as Mesh;
        // Only enter if player is close enough (within 12 units)
        if (this.playerMesh) {
          const dist = Vector3.Distance(this.playerMesh.position, buildingMesh.position);
          if (dist < 12) {
            const buildingId = metadata.buildingId || metadata.businessId || metadata.residenceId;
            this.enterBuilding(
              buildingId,
              metadata.buildingType,
              metadata.businessType,
              buildingMesh.position.clone()
            );
            return;
          }
        }
      }

      const npcId = metadata.npcId as string | undefined;
      if (npcId && this.npcMeshes.has(npcId)) {
        this.setSelectedNPC(npcId);
        // Click on NPC opens conversation (same as Enter key interaction)
        if (!this.conversationNPCId) {
          this.handleOpenChat();
        }
      }
    });
  }

  private handleWorldPropClicked(mesh: Mesh, objectRole: string): void {
    // Check if the item is possessable before allowing pickup
    const role = (objectRole || "").toLowerCase();
    const dbItem = this.worldItems.find(
      (item: any) => item.objectRole && item.objectRole.toLowerCase() === role
    );
    if (dbItem && dbItem.possessable === false) {
      // Non-possessable items can be examined but not collected
      const examTranslation = getItemTranslation(dbItem, getTargetLanguage(this.worldData));
      const examName = (examTranslation?.targetWord && isLanguageLearningWorld(this.worldData))
        ? `${examTranslation.targetWord} (${dbItem.name})`
        : (dbItem.name || objectRole);
      this.guiManager?.showToast({
        title: examName,
        description: dbItem.description || 'You cannot pick this up.',
        duration: 2500,
      });
      return;
    }

    // Remove from tracking list and dispose the mesh
    this.worldPropMeshes = this.worldPropMeshes.filter((m) => m !== mesh);
    mesh.dispose();

    const item = this.createInventoryItemForObjectRole(objectRole);

    // Centralized acquisition (inventory + event + quest + toast + language overlay)
    const questMatches = this.handleItemAcquired(item, 'world');

    // Tag as quest item if it matched a quest objective
    if (questMatches.length > 0) {
      item.type = 'quest';
      item.questId = questMatches[0].questId;
    }

    // Persist to server-side playthrough state
    this.dataSource.transferItem(this.config.worldId, {
      toEntityId: 'player',
      itemId: item.id,
      itemName: item.name,
      itemDescription: item.description,
      itemType: item.type,
      quantity: 1,
      transactionType: 'collect',
    }).catch(() => {});
  }

  /**
   * Briefly show the target language word as a large centered overlay when collecting
   * an item with translations.
   */
  private showLanguageWordOverlay(targetWord: string, targetLanguage?: string, englishName?: string): void {
    if (!this.guiManager?.advancedTexture) return;

    const container = new GUI.Rectangle('lang_word_overlay');
    container.width = '400px';
    container.height = '120px';
    container.cornerRadius = 12;
    container.color = 'white';
    container.thickness = 2;
    container.background = 'rgba(0, 0, 0, 0.8)';
    container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    container.top = '-100px';

    const stack = new GUI.StackPanel();
    container.addControl(stack);

    const wordText = new GUI.TextBlock();
    wordText.text = targetWord;
    wordText.color = '#FFD700';
    wordText.fontSize = 36;
    wordText.height = '50px';
    stack.addControl(wordText);

    if (englishName) {
      const engText = new GUI.TextBlock();
      engText.text = `(${englishName})`;
      engText.color = '#CCCCCC';
      engText.fontSize = 18;
      engText.height = '30px';
      stack.addControl(engText);
    }

    if (targetLanguage) {
      const langText = new GUI.TextBlock();
      langText.text = targetLanguage;
      langText.color = '#AAAAAA';
      langText.fontSize = 14;
      langText.height = '25px';
      stack.addControl(langText);
    }

    this.guiManager.advancedTexture.addControl(container);

    // Fade out after 2.5 seconds
    setTimeout(() => {
      container.dispose();
    }, 2500);
  }

  /**
   * Find the nearest world-prop mesh within a given range.
   * Returns the mesh and its objectRole, or null if nothing is nearby.
   */
  private findNearestWorldProp(maxDistance: number): { mesh: Mesh; objectRole: string } | null {
    if (!this.playerMesh) return null;

    const playerPos = this.playerMesh.position;
    let nearestMesh: Mesh | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const propMesh of this.worldPropMeshes) {
      if (!propMesh || propMesh.isDisposed()) continue;
      const dx = playerPos.x - propMesh.position.x;
      const dz = playerPos.z - propMesh.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance <= maxDistance && distance < nearestDistance) {
        nearestMesh = propMesh;
        nearestDistance = distance;
      }
    }

    if (!nearestMesh) return null;

    const objectRole = (nearestMesh.metadata?.objectRole || nearestMesh.name || "").toLowerCase();
    return { mesh: nearestMesh, objectRole };
  }

  /**
   * Resolve a DB item from an objectRole string.
   */
  private resolveWorldItem(objectRole: string): any {
    return this.worldItems.find(
      (item: any) => item.objectRole && item.objectRole.toLowerCase() === objectRole
    ) ?? null;
  }

  /**
   * Handle X key: examine the nearest world-prop object within range.
   * Delegates to WorldObjectActionManager for action dispatch:
   *  - Signs trigger read_sign
   *  - Regular objects trigger examine_object
   * Emits events for quest/vocabulary tracking.
   */
  private handleExamineObject(): void {
    if (!this.playerMesh) return;

    const nearest = this.findNearestWorldProp(5);

    if (!nearest) {
      this.guiManager?.showToast({
        title: "Nothing to examine",
        description: "Move closer to an object and try again (X)",
        duration: 1500,
      });
      return;
    }

    const dbItem = this.resolveWorldItem(nearest.objectRole);
    const isLangWorld = isLanguageLearningWorld(this.worldData);

    if (this.worldObjectActionManager) {
      // Build a WorldObjectRef from the mesh + DB item
      const objRef = {
        id: dbItem?.id || nearest.objectRole,
        objectRole: nearest.objectRole,
        name: dbItem?.name || nearest.objectRole.split(/[_\s]+/).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(" "),
        position: { x: nearest.mesh.position.x, y: nearest.mesh.position.y, z: nearest.mesh.position.z },
        translations: dbItem?.translations,
        signData: dbItem?.signData,
        isSign: this.worldObjectActionManager.isSignObject(nearest.objectRole),
        description: dbItem?.description,
      };

      const result = objRef.isSign
        ? this.worldObjectActionManager.readSign(objRef, isLangWorld, 0)
        : this.worldObjectActionManager.examineObject(objRef, isLangWorld);

      this.guiManager?.showToast({
        title: result.displayTitle,
        description: result.displayDescription,
        duration: result.action === 'read_sign' ? 4000 : 3000,
      });

      // Track vocabulary exposure for language learning worlds
      const resolvedLangData = dbItem ? getItemTranslation(dbItem, getTargetLanguage(this.worldData)) : null;
      if (isLangWorld && resolvedLangData?.targetWord) {
        const tracker = this.chatPanel?.getLanguageTracker();
        if (tracker) {
          tracker.analyzeNPCResponse(resolvedLangData.targetWord);
        }
      }
    } else {
      // Fallback: direct event emission (no manager available)
      const itemName = dbItem?.name || nearest.objectRole.split(/[_\s]+/).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      const langData = dbItem ? getItemTranslation(dbItem, getTargetLanguage(this.worldData)) : null;

      if (isLangWorld && langData?.targetWord) {
        const pronunciation = langData.pronunciation ? ` [${langData.pronunciation}]` : '';
        this.guiManager?.showToast({
          title: langData.targetWord,
          description: `${itemName}${pronunciation}`,
          duration: 3000,
        });
        this.eventBus.emit({
          type: 'object_examined',
          objectId: dbItem?.id || nearest.objectRole,
          objectName: itemName,
          targetWord: langData.targetWord,
          targetLanguage: getTargetLanguage(this.worldData),
          pronunciation: langData.pronunciation,
          category: langData.category,
        });
      } else {
        this.guiManager?.showToast({
          title: itemName,
          description: dbItem?.description || 'You examine the object closely.',
          duration: 2500,
        });
      }
    }
  }

  /** Handle picking up a physical book from a shelf. */
  private handleBookPickup(mesh: Mesh): void {
    const bookData = mesh.metadata?.bookData;
    if (!bookData?.textId) return;

    // Mark as collected in BookSpawnManager
    this.bookSpawnManager?.markCollected(bookData.textId);

    // Unregister from interaction system
    this.interactionPrompt?.unregisterWorldProp(mesh);

    // Add to inventory as collectible/quest item
    const isMainQuest = bookData.textCategory === 'book';
    const item: InventoryItem = {
      id: `book_${bookData.textId}`,
      name: bookData.title,
      description: bookData.titleTranslation || `A ${bookData.textCategory} to read in your Library.`,
      type: isMainQuest ? 'quest' : 'collectible',
      quantity: 1,
      icon: 'book',
      category: 'books',
    };

    // Centralized acquisition (inventory + event + quest + toast)
    const questMatches = this.handleItemAcquired(item, 'world');
    if (questMatches.length > 0) {
      item.type = 'quest';
      item.questId = questMatches[0].questId;
    }

    // Persist collection
    this.dataSource.transferItem(this.config.worldId, {
      toEntityId: 'player',
      itemId: item.id,
      itemName: item.name,
      itemDescription: item.description,
      itemType: item.type,
      quantity: 1,
      transactionType: 'collect',
    }).catch(() => {});

    // Open the document reading panel
    this.openDocumentReader(bookData.textId);
  }

  /** Initialize outdoor text spawner with world texts. */
  private async initializeTextSpawner(): Promise<void> {
    if (!this.textSpawner) return;
    try {
      const texts = await this.dataSource.loadTexts(this.config.worldId);
      if (!Array.isArray(texts) || texts.length === 0) return;

      // Cache full text data for reading panel
      this.fullTextCache = texts.map((t: any): ReadableDocument => ({
        id: t.id,
        title: t.title || '',
        titleTranslation: t.titleTranslation || '',
        textCategory: t.textCategory || 'book',
        cefrLevel: t.cefrLevel || 'A1',
        pages: t.pages || [],
        vocabularyHighlights: t.vocabularyHighlights || [],
        comprehensionQuestions: t.comprehensionQuestions || [],
        authorName: t.authorName || null,
        clueText: t.clueText || null,
        spawnLocationHint: t.spawnLocationHint || 'market',
      }));

      // Build CollectibleTextData for the spawner — spawn ALL texts, hide gated ones
      const allSpawnableTexts = texts.map((t: any) => {
        const tags: string[] = t.tags || [];
        const chapterTag = tags.find((tag: string) => tag.startsWith('chapterId:'));
        return {
          id: t.id as string,
          title: (t.title || '') as string,
          textCategory: (t.textCategory || 'book') as CollectibleTextData['textCategory'],
          cefrLevel: (t.cefrLevel || 'A1') as string,
          spawnLocationHint: (t.spawnLocationHint || 'market') as CollectibleTextData['spawnLocationHint'],
          authorName: t.authorName as string | undefined,
          clueText: t.clueText as string | undefined,
          isMainQuest: tags.includes('main_quest'),
          chapterTag: chapterTag || undefined,
        };
      });

      // Determine which chapters' texts should be visible
      const visibleChapterIds = new Set<string>();
      if (this.mainQuestJournalData?.currentChapterId) {
        visibleChapterIds.add(`chapterId:${this.mainQuestJournalData.currentChapterId}`);
      }
      for (const ch of (this.mainQuestJournalData?.chapters || [])) {
        if (ch.progress?.status === 'completed') {
          visibleChapterIds.add(`chapterId:${ch.chapter?.id}`);
        }
      }

      if (allSpawnableTexts.length > 0) {
        const buildings: { id: string; businessType?: string; position: { x: number; y: number; z: number } }[] = [];
        this.buildingData.forEach((bd, id) => {
          buildings.push({ id, businessType: bd.metadata?.businessType, position: { x: bd.position.x, y: bd.position.y, z: bd.position.z } });
        });
        this.textSpawner.spawnTexts(allSpawnableTexts, buildings, [], visibleChapterIds);
      }
    } catch {
      // Texts unavailable — outdoor texts won't spawn
    }
  }

  /** Open the document reading panel for a specific text. */
  private openDocumentReader(textId: string): void {
    const doc = this.fullTextCache.find(t => t.id === textId);
    if (doc && this.documentReadingPanel) {
      this.documentReadingPanel.openDocument(doc);
    }
  }

  /** Fetch server texts and cache for book spawning. */
  private async fetchWorldTextsForBooks(): Promise<void> {
    try {
      const resp = await fetch(`/api/worlds/${this.config.worldId}/texts`);
      if (!resp.ok) return;
      const texts = await resp.json();
      if (!Array.isArray(texts)) return;
      this.worldTextCache = texts.map((t: any) => ({
        id: t.id,
        title: t.title || '',
        titleTranslation: t.titleTranslation || '',
        textCategory: t.textCategory || 'book',
        cefrLevel: t.cefrLevel,
        spawnLocationHint: t.spawnLocationHint || '',
        authorName: t.authorName,
        tags: t.tags,
      }));
    } catch {
      // Texts unavailable — books won't spawn, which is fine
    }
  }

  /** Gather nearby NPCs and world props as SceneObjects for photo labeling. */
  private getVisibleSceneObjectsForPhoto(): SceneObject[] {
    const objects: SceneObject[] = [];
    if (!this.playerMesh) return objects;

    const playerPos = this.playerMesh.position;
    const maxDist = 30;

    // NPCs
    this.npcMeshes.forEach((instance, npcId) => {
      if (!instance.mesh) return;
      const dist = Vector3.Distance(playerPos, instance.mesh.position);
      if (dist > maxDist) return;
      const npcInfo = this.npcInfos.find(n => n.id === npcId);
      // Get NPC's current activity: check schedule executor first (work activities),
      // then ambient life system (idle activities)
      const activity = this.scheduleExecutor?.getCurrentActivity(npcId)
        || this.ambientLifeSystem.getActivityDescription(npcId)
        || undefined;
      const npcName = npcInfo?.name || 'Person';
      objects.push({
        id: npcId,
        name: activity ? `${npcName} - ${activity.charAt(0).toUpperCase() + activity.slice(1)}` : npcName,
        category: 'person',
        position: instance.mesh.position,
        activity,
      });
    });

    // World props
    for (const propMesh of this.worldPropMeshes) {
      if (!propMesh || propMesh.isDisposed()) continue;
      const dist = Vector3.Distance(playerPos, propMesh.position);
      if (dist > maxDist) continue;

      const objectRole = (propMesh.metadata?.objectRole || propMesh.name || '').toLowerCase();
      const dbItem = this.resolveWorldItem(objectRole);
      const langData = dbItem ? getItemTranslation(dbItem, getTargetLanguage(this.worldData)) : null;
      const name = dbItem?.name || objectRole.split(/[_\s]+/).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

      objects.push({
        id: dbItem?.id || objectRole,
        name,
        category: langData?.category || 'item',
        position: propMesh.position,
        targetWord: langData?.targetWord,
        targetLanguage: langData ? getTargetLanguage(this.worldData) : undefined,
        pronunciation: langData?.pronunciation,
      });
    }

    return objects;
  }

  private createInventoryItemForObjectRole(objectRole: string): InventoryItem {
    const role = (objectRole || "").toLowerCase();
    const id = `prop_${role || "generic"}`;

    const makeName = (fallback: string) => {
      if (!role) return fallback;
      return role
        .split(/[_\s]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    };

    // Try to find item definition from loaded world items (DB-driven)
    const dbItem = this.worldItems.find(
      (item: any) => item.objectRole && item.objectRole.toLowerCase() === role
    );
    if (dbItem) {
      return {
        id: dbItem.id || id,
        name: dbItem.name,
        description: dbItem.description || '',
        type: dbItem.itemType || 'collectible',
        quantity: 1,
        value: dbItem.value || 0,
        sellValue: dbItem.sellValue || 0,
        weight: dbItem.weight || 1,
        tradeable: dbItem.tradeable !== false,
        effects: dbItem.effects || undefined,
        category: dbItem.category || undefined,
        material: dbItem.material || undefined,
        baseType: dbItem.baseType || undefined,
        rarity: dbItem.rarity || undefined,
        possessable: dbItem.possessable !== false,
        translations: dbItem.translations || undefined,
      };
    }

    // Fallback to hardcoded mapping for backward compatibility
    switch (role) {
      case "chest":
        return {
          id,
          name: "Treasure Chest",
          description: "A sturdy chest that once held valuables.",
          type: "collectible",
          quantity: 1,
        };
      case "sword":
        return {
          id,
          name: "Iron Sword",
          description: "A basic sword suitable for training or combat.",
          type: "collectible",
          quantity: 1,
        };
      case "shield":
        return {
          id,
          name: "Wooden Shield",
          description: "A simple wooden shield offering modest protection.",
          type: "collectible",
          quantity: 1,
        };
      case "goblet":
        return {
          id,
          name: "Golden Goblet",
          description: "An ornate goblet, likely used in royal feasts.",
          type: "collectible",
          quantity: 1,
        };
      case "crown":
        return {
          id,
          name: "Jeweled Crown",
          description: "A crown encrusted with jewels, symbol of authority.",
          type: "quest",
          quantity: 1,
        };
      case "data_pad":
        return {
          id,
          name: "Encrypted Data Pad",
          description: "A handheld device containing encrypted data.",
          type: "quest",
          quantity: 1,
        };
      case "energy_core":
        return {
          id,
          name: "Energy Core",
          description: "A pulsating core of stored energy.",
          type: "collectible",
          quantity: 1,
        };
      case "holo_table":
        return {
          id,
          name: "Holographic Table",
          description: "An interface projecting three-dimensional data.",
          type: "collectible",
          quantity: 1,
        };
      case "crate":
        return {
          id,
          name: "Supply Crate",
          description: "A crate of supplies from distant worlds.",
          type: "collectible",
          quantity: 1,
        };
      case "console":
        return {
          id,
          name: "Control Console",
          description: "A console used to operate local systems.",
          type: "collectible",
          quantity: 1,
        };
      case "lantern":
        return {
          id,
          name: "Oil Lantern",
          description: "A lantern that casts a warm historical glow.",
          type: "collectible",
          quantity: 1,
        };
      case "revolver":
        return {
          id,
          name: "Revolver",
          description: "A classic six-shooter from a wilder age.",
          type: "collectible",
          quantity: 1,
        };
      case "saloon_sign":
        return {
          id,
          name: "Saloon Sign",
          description: "A weathered sign advertising a local saloon.",
          type: "collectible",
          quantity: 1,
        };
      case "wanted_poster":
        return {
          id,
          name: "Wanted Poster",
          description: "A poster describing a notorious outlaw.",
          type: "quest",
          quantity: 1,
        };
      case "bookshelf":
        return {
          id,
          name: "Bookshelf",
          description: "A shelf filled with dusty tomes and secrets.",
          type: "collectible",
          quantity: 1,
        };
      default: {
        const name = makeName("Mystery Object");
        return {
          id,
          name,
          description: "A curious object discovered in this world.",
          type: "collectible",
          quantity: 1,
        };
      }
    }
  }

  private _npcGroundSnapTimer = 0;
  private _fpsDisplayTimer = 0;
  private _settlementCheckTimer = 0;
  private _interactionPromptTimer = 0;

  private setupUpdateLoop(): void {
    if (!this.scene) return;

    // Throttled NPC ground snapping, minimap updates, and chunk culling
    this.renderObserver = this.scene.onBeforeRenderObservable.add(() => {
      const dt = this.scene?.getEngine().getDeltaTime() || 16;

      // Update quest indicator positions (world-space, tracking NPC meshes)
      this.questIndicatorManager?.updatePositions();

      // Update weather system (rain, clouds, fog)
      if (this.weatherSystem) {
        if (this.playerMesh) {
          this.weatherSystem.setPlayerPosition(this.playerMesh.position);
        }
        this.weatherSystem.update(dt);
      }

      // Clamp player to terrain bounds so they can't walk off the edge
      if (this.playerMesh && !this.isInsideBuilding) {
        const half = (this.terrainSize || 512) / 2 - 2; // 2-unit margin from edge
        const pos = this.playerMesh.position;
        if (pos.x < -half) pos.x = -half;
        if (pos.x > half) pos.x = half;
        if (pos.z < -half) pos.z = -half;
        if (pos.z > half) pos.z = half;
      }

      // Update interaction prompts (throttled to every 100ms)
      this._interactionPromptTimer += dt;
      if (this._interactionPromptTimer >= 100) {
        this._interactionPromptTimer = 0;
        // Unified world-space interaction prompt
        this.interactionPrompt?.update();
      }

      // Door trigger check removed — player exits by pressing E.

      // Update business behavior system when inside a building
      if (this.isInsideBuilding && this.businessBehaviorSystem) {
        const dtSec = dt / 1000;
        // Check player proximity to owner NPCs for serve-customer mode
        let nearOwner = false;
        let nearOwnerId: string | undefined;
        if (this.playerMesh && this.interiorNPCManager) {
          for (const placed of this.interiorNPCManager.getPlacedNPCs()) {
            if (placed.role === 'owner') {
              const dist = Vector3.Distance(this.playerMesh.position, placed.mesh.position);
              if (dist < 3.0) {
                nearOwner = true;
                nearOwnerId = placed.npcId;
                break;
              }
            }
          }
        }
        this.businessBehaviorSystem.update(dtSec, nearOwner, nearOwnerId);
      }

      // Update NPC simulation LOD system
      if (this.npcSimulationLOD && this.playerMesh) {
        this.npcSimulationLOD.setPlayerPosition(this.playerMesh.position);
        this.npcSimulationLOD.update(dt);
      }

      // Update chunk visibility based on player position (cheap: just compares chunk coords)
      // Phase 8: Skip chunk updates during settlement isolation (settlement manager handles visibility)
      if (this.chunkManager && this.playerMesh && !this.settlementSceneManager?.isIsolated) {
        this.chunkManager.update(this.playerMesh.position);
      }

      // Phase 8: Settlement proximity detection (every 500ms)
      this._settlementCheckTimer += dt;
      if (this._settlementCheckTimer >= 500 && this.settlementSceneManager && this.playerMesh) {
        this._settlementCheckTimer = 0;

        // Settlement transitions only when outside
        if (!this.isInsideBuilding) {
          this.checkSettlementTransition();
        }

        // Exploration discovery proximity checks (exterior only)
        if (this.explorationDiscovery && this.playerMesh && !this.isInsideBuilding) {
          this.explorationDiscovery.checkPlayerProximity(this.playerMesh.position);
        }

        // Quest proximity checks run both inside and outside buildings
        if (this.questObjectManager && this.playerMesh) {
          this.questObjectManager.checkLocationProximity(this.playerMesh.position);
          this.questObjectManager.checkDirectionProximity(this.playerMesh.position);
          this.questObjectManager.checkEscortProximity((npcId: string) => {
            const instance = this.npcMeshes.get(npcId);
            return instance?.mesh?.position ?? null;
          });
        }

        // Update quest waypoint fading and compass
        if (this.questTracker && this.playerMesh) {
          // Pass player forward angle from camera
          if (this.cameraManager) {
            const cam = this.scene.activeCamera;
            if (cam && 'rotation' in cam) {
              this.questTracker.setPlayerForwardAngle((cam as any).rotation.y || 0);
            }
          }
          this.questTracker.updateFrame(this.playerMesh.position);
        }
      }

      // Ground-snap NPCs at most every 500ms
      this._npcGroundSnapTimer += dt;
      if (this._npcGroundSnapTimer >= 500) {
        this._npcGroundSnapTimer = 0;
        if (!this.isInsideBuilding) {
          this.npcMeshes.forEach((instance) => {
            if (!instance?.mesh) return;
            // Skip ground snapping for NPCs in conversation (controller is stopped)
            if (instance.isInConversation) return;
            // Phase 8: Skip ground snapping for disabled NPCs (hidden by isolation or distance)
            if (!instance.mesh.isEnabled()) return;
            const mesh = instance.mesh;
            const groundPos = this.projectToGround(mesh.position.x, mesh.position.z);
            const targetY = groundPos.y;
            if (Math.abs(mesh.position.y - targetY) > 0.5) {
              mesh.position.y = targetY;
              instance.homePosition = mesh.position.clone();
              instance.controller?.resetPhysicsState();
            }
          });
        }
      }

      // Update NPC-initiated conversation controller (position sync throttled to 500ms via ground snap timer)
      if (this.npcInitiatedConversationController) {
        if (this._npcGroundSnapTimer === 0) {
          // Sync NPC positions alongside ground snapping
          this.npcMeshes.forEach((instance, npcId) => {
            if (instance?.mesh) {
              this.npcInitiatedConversationController!.updateNPC(npcId, {
                position: instance.mesh.position.clone(),
                isInConversation: instance.isInConversation || false,
              });
            }
          });
        }
        this.npcInitiatedConversationController.update(dt, 60000);
      }

      // Update minimap markers at most every 250ms
      this._minimapUpdateTimer += dt;
      if (this._minimapUpdateTimer >= 250) {
        this._minimapUpdateTimer = 0;
        this.npcMeshes.forEach((instance, npcId) => {
          if (!instance?.mesh) return;
          const npcInfo = this.npcInfos.find((n) => n.id === npcId);
          const label = npcInfo?.name ?? npcId;
          let color: string | undefined;
          switch (instance.role) {
            case 'guard': case 'soldier': color = '#F44336'; break;
            case 'merchant': color = '#4CAF50'; break;
            case 'questgiver': color = '#FFC107'; break;
            case 'noble': color = '#9C27B0'; break;
            case 'priest': color = '#E8E0D0'; break;
            case 'doctor': color = '#00BCD4'; break;
            case 'innkeeper': color = '#FF9800'; break;
            case 'farmer': color = '#8D6E63'; break;
            case 'blacksmith': color = '#607D8B'; break;
            case 'teacher': color = '#7E57C2'; break;
            case 'sailor': color = '#1565C0'; break;
            default: color = '#9E9E9E'; break;
          }
          this.minimap?.addMarker({
            id: `npc_${npcId}`,
            position: instance.mesh.position,
            type: 'npc',
            label,
            color
          });
        });

        if (this.playerMesh) {
          this.minimap?.addMarker({
            id: 'player',
            position: this.playerMesh.position,
            type: 'player',
            label: 'You'
          });
        }

        // Add discovered location markers to minimap
        if (this.explorationDiscovery) {
          for (const marker of this.explorationDiscovery.getMinimapMarkers()) {
            this.minimap?.addMarker({
              id: marker.id,
              position: marker.position,
              type: 'discovery',
              label: marker.label,
              color: marker.color,
            });
          }
        }
      }
      // Phase 3: Update audio listener position for distance-based culling
      if (this.playerMesh && this.audioManager) {
        this.audioManager.setListenerPosition(this.playerMesh.position);
      }

      // Water animation disabled — water generation removed.

      // Update Prolog game state (every 500ms, aligned with ground snap timer)
      if (this._npcGroundSnapTimer === 0 && this.prologEngine && this.playerMesh) {
        const pPos = this.playerMesh.position;
        const nearbyNPCIds: string[] = [];
        this.npcMeshes.forEach((instance, npcId) => {
          if (instance.mesh && instance.mesh.isEnabled()) {
            const d = Vector3.Distance(pPos, instance.mesh.position);
            if (d <= 30) nearbyNPCIds.push(npcId);
          }
        });
        this.prologEngine.updateGameState({
          playerCharacterId: 'player',
          playerName: 'player',
          playerEnergy: this.playerEnergy,
          playerPosition: { x: pPos.x, y: pPos.y, z: pPos.z },
          currentSettlement: this.currentZone?.name,
          nearbyNPCs: nearbyNPCIds,
        }).catch(() => { /* non-fatal */ });
      }
    });

    // Phase 7: Batched NPC behavior updates with frame budget
    // Replaces the old 200ms setInterval with a per-frame budget-limited system.
    // Accumulates time and processes NPCs round-robin within a 2ms budget per frame.
    this._npcBehaviorObserver = this.scene.onBeforeRenderObservable.add(() => {
      const dt = this.scene?.getEngine().getDeltaTime() || 16;

      // Update ambient animals every frame (lightweight)
      if (this.animalNPCSystem) {
        this.animalNPCSystem.update(dt / 1000);
      }

      this._npcBehaviorAccum += dt;
      if (this._npcBehaviorAccum < 100) return; // Check at most every 100ms
      this._npcBehaviorAccum = 0;
      this.updateNPCBehaviorsBatched();

      // Update socialization controller — uses 60s real = 1 game hour
      if (this.socializationController) {
        this.socializationController.update(dt, 60000);
        // Sync NPC positions into the controller
        this.npcMeshes.forEach((instance, npcId) => {
          if (instance.mesh) {
            this.socializationController!.updateNPC(npcId, {
              position: instance.mesh.position.clone(),
              isInConversation: this.conversationNPCId === npcId,
            });
          }
        });
      }
    });
  }


  /**
   * Process pending NPC actions from the ScheduleExecutor.
   * Applies goal changes, pathfinding, and building entry/exit for NPCs.
   */
  private processScheduleExecutorActions(): void {
    const now = Date.now();

    // Update NPC positions in the executor for pathfinding
    this.npcMeshes.forEach((instance, npcId) => {
      if (instance.mesh) {
        this.scheduleExecutor.updateNPCPosition(npcId, instance.mesh.position);
      }
    });

    // Run the executor's per-frame update (checks expiry, etc.)
    this.scheduleExecutor.update(now);

    // Update activity labels and observation tracking
    this.npcActivityLabelSystem?.update(now);

    // Drain and apply pending actions
    const actions = this.scheduleExecutor.drainPendingActions();
    if (actions.size === 0) return;

    for (const [npcId, action] of Array.from(actions.entries())) {
      if (!action) continue;
      const instance = this.npcMeshes.get(npcId);
      if (!instance?.mesh) continue;

      const entry = this.npcScheduleSystem.getEntry(npcId);

      switch (action.type) {
        case 'new_goal': {
          if (entry) entry.currentGoal = action.goal;
          instance.schedulePathWaypoints = action.pathWaypoints;
          instance.schedulePathIndex = 0;
          // Clear any idle state
          instance.wanderWaitUntil = undefined;
          break;
        }
        case 'enter_building': {
          instance.isInsideBuilding = true;
          instance.insideBuildingId = action.buildingId;
          instance.scheduleGoalExpiry = now + action.stayDurationMs;
          instance.controller?.walk(false);

          // If NPC is going to sleep and we can find a bed, position them visibly
          if (action.occasion === 'sleeping') {
            const bedData = this.findBedForNPC(npcId, action.buildingId);
            if (bedData) {
              // Keep NPC visible and position on bed
              this.ensureResidenceActivitySystem();
              this.residenceActivitySystem!.startOccasion(npcId, 'sleeping', undefined, bedData);
              // Don't hide the mesh — the callback will position it
              break;
            }
          }

          // Default: hide NPC inside building (no bed found, or not sleeping)
          instance.mesh.setEnabled(false);
          if (instance.billboardLOD) instance.billboardLOD.setEnabled(false);
          break;
        }
        case 'exit_building': {
          // End residence activity if NPC was sleeping on a bed
          if (this.residenceActivitySystem?.isSleepingOnBed(npcId)) {
            this.residenceActivitySystem.endOccasion(npcId);
          }

          instance.isInsideBuilding = false;
          instance.insideBuildingId = undefined;
          instance.scheduleGoalExpiry = undefined;
          instance.schedulePathWaypoints = undefined;
          instance.schedulePathIndex = undefined;

          // Place at building door
          if (action.doorPosition) {
            instance.mesh.position = action.doorPosition.clone();
            instance.controller?.resetPhysicsState();
          }

          // Fade-in effect
          instance.mesh.setEnabled(true);
          if (instance.billboardLOD) instance.billboardLOD.setEnabled(true);
          instance.fadeInProgress = 0;
          instance.mesh.getChildMeshes().forEach(m => { m.visibility = 0; });
          instance.mesh.visibility = 0;
          break;
        }
        case 'idle': {
          instance.wanderWaitUntil = now + action.durationMs;
          instance.schedulePathWaypoints = undefined;
          instance.schedulePathIndex = undefined;
          if (entry) entry.currentGoal = null;
          break;
        }
        case 'go_home': {
          instance.schedulePathWaypoints = action.pathWaypoints;
          instance.schedulePathIndex = 0;
          instance.wanderWaitUntil = undefined;
          break;
        }
      }
    }
  }

  // ---- Residence Activity (visible sleep on beds) ----

  /**
   * Lazily create the ResidenceActivitySystem with callbacks that
   * position/un-position NPC meshes on beds.
   */
  private ensureResidenceActivitySystem(): void {
    if (this.residenceActivitySystem) return;

    this.residenceActivitySystem = new ResidenceActivitySystem({
      onAnimationChange: (npcId, state) => {
        const instance = this.npcMeshes.get(npcId);
        if (instance?.animController) {
          instance.animController.setState(state as any);
        }
      },
      onSleepOnBed: (npcId, bedData) => {
        const instance = this.npcMeshes.get(npcId);
        if (!instance?.mesh) return;

        // Position NPC mesh at the bed
        instance.mesh.position.x = bedData.position.x;
        instance.mesh.position.y = bedData.position.y + bedData.mattressHeight;
        instance.mesh.position.z = bedData.position.z;
        instance.mesh.rotation.y = bedData.rotation;

        // Keep NPC visible on the bed
        instance.mesh.setEnabled(true);
        instance.mesh.visibility = 1;
        instance.mesh.getChildMeshes().forEach(m => { m.visibility = 1; });
        if (instance.billboardLOD) instance.billboardLOD.setEnabled(false);

        // Play sleep animation
        if (instance.animController) {
          instance.animController.setState('sleep' as any);
        }
      },
      onWakeFromBed: (npcId) => {
        const instance = this.npcMeshes.get(npcId);
        if (!instance?.mesh) return;

        // Switch to idle animation (brief pause before they walk to door)
        if (instance.animController) {
          instance.animController.setState('idle' as any);
        }
      },
    });
  }

  /**
   * Find a bed in the building's interior for an NPC to sleep on.
   * Returns BedSleepData if a bed is available, undefined otherwise.
   */
  private findBedForNPC(npcId: string, buildingId: string): BedSleepData | undefined {
    const interior = this.interiorGenerator?.getInterior(buildingId);
    if (!interior?.beds?.length) return undefined;

    // Collect beds already claimed by other sleeping NPCs
    const claimedBedIds = new Set<string>();
    if (this.residenceActivitySystem) {
      for (const [otherId] of this.npcMeshes) {
        if (otherId !== npcId && this.residenceActivitySystem.isSleepingOnBed(otherId)) {
          const otherBed = this.residenceActivitySystem.getBedData(otherId);
          if (otherBed) claimedBedIds.add(otherBed.bedId);
        }
      }
    }

    // Pick first unclaimed bed
    const bed = interior.beds.find(b => !claimedBedIds.has(b.bedId));
    if (!bed) return undefined;

    // Convert BedAssignment offsets to world-space position
    // Interior positions are relative to the interior's root position
    return {
      bedId: bed.bedId,
      position: {
        x: interior.position.x + bed.offsetX,
        y: interior.position.y + bed.offsetY,
        z: interior.position.z + bed.offsetZ,
      },
      rotation: 0, // Beds aligned with room; no extra rotation needed
      mattressHeight: 0.25, // Half the mattress height (spec.height * 0.5 / 2)
    };
  }

  // Distance thresholds for NPC optimization (Phase 7 enhanced)
  private static readonly NPC_HIDE_DISTANCE = 120;      // Hide mesh entirely
  private static readonly NPC_BILLBOARD_DISTANCE = 60;   // Show billboard instead of full mesh
  private static readonly NPC_SKIP_AI_DISTANCE = 80;     // Skip wandering AI
  private static readonly NPC_DISABLE_BLEND_DISTANCE = 40; // Snap animations (no blending)
  private static readonly NPC_DISABLE_COLLISION_DISTANCE = 30; // Simplified collision
  private static readonly NPC_THROTTLE_AI_DISTANCE = 20; // 500ms ticks instead of 200ms

  /**
   * Phase 7: Batched NPC behavior update with frame budget.
   * Processes NPCs round-robin within NPC_BATCH_BUDGET_MS per call.
   * Also enforces: visible NPC cap, distance-based AI throttling,
   * collision simplification, and animation blending toggling.
   */
  private updateNPCBehaviorsBatched(): void {
    const now = Date.now();
    const playerPos = this.playerMesh?.position;
    const entries = Array.from(this.npcMeshes.entries());
    if (entries.length === 0) return;

    this._wanderRaycastsThisTick = 0;

    // Phase 7: Sort by distance for visible NPC cap
    let sorted: { npcId: string; instance: NPCInstance; dist: number }[] | null = null;
    if (playerPos) {
      sorted = entries.map(([npcId, instance]) => ({
        npcId,
        instance,
        dist: instance.mesh ? Vector3.Distance(playerPos, instance.mesh.position) : Infinity,
      }));
      sorted.sort((a, b) => a.dist - b.dist);
    }

    const npcList = sorted || entries.map(([npcId, instance]) => ({ npcId, instance, dist: Infinity }));
    const count = npcList.length;

    // Pass 1: Visibility updates for ALL NPCs (cheap — no frame budget)
    for (let i = 0; i < count; i++) {
      const { npcId, instance, dist } = npcList[i];
      if (!instance.mesh || !instance.controller) continue;

      // Never cull the NPC the player is currently talking to
      if (instance.isInConversation) {
        if (!instance.mesh.isEnabled()) {
          instance.mesh.setEnabled(true);
        }
        // Also guard against obstruction system hiding via isVisible
        if (!instance.mesh.isVisible) {
          instance.mesh.isVisible = true;
        }
        if (instance.billboardLOD?.isEnabled()) instance.billboardLOD.setEnabled(false);
        instance.isBillboardMode = false;
        continue;
      }

      // Phase 8: Hide NPCs not in active settlement during isolation
      if (this.settlementSceneManager?.isIsolated &&
          !this.settlementSceneManager.isNPCInActiveSettlement(npcId)) {
        if (instance.mesh.isEnabled()) {
          instance.mesh.setEnabled(false);
          instance.controller.walk(false);
          instance.controller.turnLeft(false);
          instance.controller.turnRight(false);
        }
        if (instance.billboardLOD?.isEnabled()) instance.billboardLOD.setEnabled(false);
        continue;
      }

      // Phase 7: Visible NPC cap — beyond MAX_VISIBLE_NPCS, hide mesh
      if (sorted && i >= MAX_VISIBLE_NPCS) {
        if (instance.mesh.isEnabled()) {
          instance.mesh.setEnabled(false);
          instance.controller.walk(false);
          instance.controller.turnLeft(false);
          instance.controller.turnRight(false);
        }
        if (instance.billboardLOD?.isEnabled()) instance.billboardLOD.setEnabled(false);
        instance.isBillboardMode = false;
        continue;
      }

      // Distance-based visibility
      if (dist > BabylonGame.NPC_HIDE_DISTANCE) {
        if (instance.mesh.isEnabled()) {
          instance.mesh.setEnabled(false);
          instance.controller.walk(false);
          instance.controller.turnLeft(false);
          instance.controller.turnRight(false);
        }
        if (instance.billboardLOD?.isEnabled()) instance.billboardLOD.setEnabled(false);
        instance.isBillboardMode = false;
        continue;
      }

      if (dist > BabylonGame.NPC_BILLBOARD_DISTANCE) {
        if (instance.mesh.isEnabled()) {
          instance.mesh.setEnabled(false);
          instance.controller.walk(false);
          instance.controller.turnLeft(false);
          instance.controller.turnRight(false);
        }
        if (instance.billboardLOD) {
          instance.billboardLOD.position.x = instance.mesh.position.x;
          instance.billboardLOD.position.y = instance.mesh.position.y + 1.2;
          instance.billboardLOD.position.z = instance.mesh.position.z;
          if (!instance.billboardLOD.isEnabled()) instance.billboardLOD.setEnabled(true);
        }
        instance.isBillboardMode = true;
        continue;
      }

      // Close range: show full mesh, hide billboard
      if (!instance.mesh.isEnabled()) instance.mesh.setEnabled(true);
      if (instance.isBillboardMode && instance.billboardLOD?.isEnabled()) {
        instance.billboardLOD.setEnabled(false);
        instance.isBillboardMode = false;
      }

      // Distance-based animation blending toggle
      if (dist > BabylonGame.NPC_DISABLE_BLEND_DISTANCE) {
        if (!instance.blendingDisabled) {
          instance.controller.disableBlending();
          instance.blendingDisabled = true;
        }
      } else if (instance.blendingDisabled) {
        instance.controller.enableBlending(0.05);
        instance.blendingDisabled = false;
      }

      // Simplified collision at distance
      if (dist > BabylonGame.NPC_DISABLE_COLLISION_DISTANCE) {
        if (instance.mesh.checkCollisions) instance.mesh.checkCollisions = false;
      } else if (!instance.mesh.checkCollisions) {
        instance.mesh.checkCollisions = true;
      }
    }

    // Volition system: recalculate NPC spontaneous goals periodically
    this._volitionTimestep++;
    this.volitionSystem.update(this._volitionTimestep);

    // Sync volition location state for NPCs (building-based co-location)
    for (const { npcId, instance } of npcList) {
      const location = instance.isInsideBuilding && instance.insideBuildingId
        ? instance.insideBuildingId : 'settlement';
      this.volitionSystem.updateNPCState(npcId, { currentLocation: location } as any);
    }

    // Pass 2: AI behavior updates (budget-limited, round-robin)
    const startTime = performance.now();
    if (this._npcBatchIndex >= count) this._npcBatchIndex = 0;
    let processed = 0;

    for (let i = 0; i < count; i++) {
      if (processed > 0 && (performance.now() - startTime) >= NPC_BATCH_BUDGET_MS) break;

      const idx = (this._npcBatchIndex + i) % count;
      const { npcId, instance, dist } = npcList[idx];
      if (!instance.mesh || !instance.controller) continue;
      if (!instance.mesh.isEnabled()) continue; // Skip hidden NPCs

      // Beyond skip-AI distance: no wandering, just idle
      if (dist > BabylonGame.NPC_SKIP_AI_DISTANCE) {
        instance.controller.walk(false);
        instance.controller.turnLeft(false);
        instance.controller.turnRight(false);
        continue;
      }

      // Distance-based AI throttling
      const tickInterval = dist > BabylonGame.NPC_THROTTLE_AI_DISTANCE ? 500 : 200;
      const lastUpdate = instance.lastAIUpdate || 0;
      if (now - lastUpdate < tickInterval) continue;
      instance.lastAIUpdate = now;

      processed++;
      this.updateSingleNPCBehavior(instance, now);
    }

    this._npcBatchIndex = (this._npcBatchIndex + processed) % Math.max(count, 1);

    // Minimap overlay (cheap, runs after NPC updates)
    this.updateMinimapOverlay();

    // Update chat panel with nearest NPC proximity info
    this.updateNearbyNPCForChat();
  }

  /**
   * Updates a single NPC's schedule-driven AI behavior.
   * NPCs follow a daily schedule: work → shop → work → home.
   * They walk along sidewalks using A* pathfinding and enter/exit buildings.
   */
  private updateSingleNPCBehavior(instance: NPCInstance, now: number): void {
    if (!instance.mesh || !instance.controller) return;

    // Update building-exit fade-in (runs even during conversation)
    if (instance.fadeInProgress !== undefined && instance.fadeInProgress < 1) {
      const dt = Math.min(this.scene.getEngine().getDeltaTime() / 1000, 0.1);
      const fadeSpeed = 2.0; // fully visible in 0.5 seconds
      instance.fadeInProgress = Math.min(1, instance.fadeInProgress + fadeSpeed * dt);
      const v = instance.fadeInProgress;
      instance.mesh.visibility = v;
      instance.mesh.getChildMeshes().forEach(m => { m.visibility = v; });
      if (instance.fadeInProgress >= 1) {
        instance.fadeInProgress = undefined;
      }
    }

    // Skip AI if NPC is in conversation (player or ambient)
    const characterId = instance.characterData?.id;
    if (instance.isInConversation ||
        (characterId && this.ambientConversationManager?.isInConversation(characterId))) {
      instance.controller.walk(false);
      instance.controller.turnLeft(false);
      instance.controller.turnRight(false);

      // Smoothly face conversation partner
      const dt = Math.min(this.scene.getEngine().getDeltaTime() / 1000, 0.1);
      let faceTarget: Vector3 | null = null;

      if (instance.isInConversation && this.conversationNPCId === characterId && this.playerMesh) {
        // Player conversation — face the player
        faceTarget = this.playerMesh.position;
      } else if (characterId && this.ambientConversationManager?.isInConversation(characterId)) {
        // Ambient NPC-NPC conversation — face the partner
        const partner = this.ambientConversationManager.getConversationPartner(characterId);
        if (partner) {
          const partnerInstance = this.npcMeshes.get(partner.partnerId);
          if (partnerInstance?.mesh) {
            faceTarget = partnerInstance.mesh.position;
          }
        }
      }

      if (faceTarget && instance.mesh) {
        const fdx = faceTarget.x - instance.mesh.position.x;
        const fdz = faceTarget.z - instance.mesh.position.z;
        const targetAngle = Math.atan2(fdx, fdz);
        let angleDiff = targetAngle - instance.mesh.rotation.y;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        const turnSpeed = 5.0;
        const step = turnSpeed * dt;
        if (Math.abs(angleDiff) <= step) {
          instance.mesh.rotation.y = targetAngle;
        } else {
          instance.mesh.rotation.y += Math.sign(angleDiff) * step;
        }
      }

      return;
    }

    if (!characterId) return;

    const currentPos = instance.mesh.position;

    // Escort behavior — NPC follows the player at a short distance
    if (instance.isBeingEscorted && this.playerMesh) {
      const playerPos = this.playerMesh.position;
      const distToPlayer = Vector3.Distance(currentPos, playerPos);
      const followDistance = 4; // Stay 4 units behind the player
      const maxFollowRange = 30; // If player is too far, teleport closer

      if (distToPlayer > maxFollowRange) {
        // Teleport NPC closer if player ran too far ahead
        const dir = playerPos.subtract(currentPos).normalize();
        instance.mesh.position = playerPos.subtract(dir.scale(followDistance));
        instance.controller.walk(false);
      } else if (distToPlayer > followDistance) {
        // Walk toward the player
        instance.wanderTarget = playerPos.clone();
      } else {
        // Close enough — stop moving
        instance.wanderTarget = undefined;
        instance.controller.walk(false);
        instance.controller.turnLeft(false);
        instance.controller.turnRight(false);
      }
      // Fall through to normal wander movement logic which handles wanderTarget
    }

    // --- Handle NPC inside a building (hidden) ---
    // Building exit is now handled by processScheduleExecutorActions(),
    // but we still need to skip AI for NPCs that are inside
    if (instance.isInsideBuilding) {
      return;
    }

    // --- If waiting (idle pause), try ambient activity or stay idle ---
    if (instance.wanderWaitUntil && now < instance.wanderWaitUntil) {
      instance.controller.walk(false);
      instance.controller.turnLeft(false);
      instance.controller.turnRight(false);

      // Try ambient life behavior instead of standing idle
      if (characterId) {
        const behavior = this.updateAmbientLifeBehavior(instance, characterId, now);
        if (behavior?.faceTargetPosition && instance.mesh) {
          // Smoothly face the activity target
          const dx = behavior.faceTargetPosition.x - instance.mesh.position.x;
          const dz = behavior.faceTargetPosition.z - instance.mesh.position.z;
          if (dx * dx + dz * dz > 0.01) {
            instance.mesh.rotation.y = Math.atan2(dx, dz);
          }
        }
      }
      return;
    }

    // Clear ambient activity when NPC starts moving again
    if (characterId) {
      this.scheduleExecutor.clearAmbientBehavior(characterId);
      if (instance.ambientActivityAnimation) {
        this.playNPCAnimation(instance, 'idle');
        instance.ambientActivityAnimation = undefined;
      }
    }

    // --- Volition override: spontaneous behavior from VolitionSystem ---
    if (this.volitionSystem.isOnScheduleOverride(characterId)) {
      const override = this.volitionSystem.getScheduleOverride(characterId);
      if (override && !instance.volitionGoalId) {
        // Start executing the volition goal
        instance.volitionGoalId = override.goalId;
        const goals = this.volitionSystem.getTopGoals(characterId, 10);
        const activeGoal = goals.find(g => g.goalId === override.goalId);
        if (activeGoal) {
          instance.volitionActionId = activeGoal.actionId;
          instance.volitionTargetNpcId = activeGoal.targetId;
          this.executeVolitionGoal(instance, activeGoal, now);
          return;
        }
      }

      // Continue executing an active volition goal (follow path)
      if (instance.volitionGoalId && instance.schedulePathWaypoints) {
        const waypoints = instance.schedulePathWaypoints;
        const wpIdx = instance.schedulePathIndex ?? 0;
        if (wpIdx < waypoints.length) {
          const targetWP = waypoints[wpIdx];
          const dx = targetWP.x - currentPos.x;
          const dz = targetWP.z - currentPos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 1.5) {
            instance.schedulePathIndex = wpIdx + 1;
            if (wpIdx + 1 >= waypoints.length) {
              // Arrived at volition destination — complete the goal
              this.completeVolitionGoal(instance, characterId);
              return;
            }
          }
          this.moveNPCToward(instance, targetWP);
          return;
        } else {
          // Path exhausted — complete
          this.completeVolitionGoal(instance, characterId);
          return;
        }
      }
    } else if (instance.volitionGoalId) {
      // Override was cleared externally — clean up volition state
      instance.volitionGoalId = undefined;
      instance.volitionActionId = undefined;
      instance.volitionTargetNpcId = undefined;
    }

    // --- Schedule-driven behavior via ScheduleExecutor ---
    if (this.npcScheduleSystem.hasStreetData()) {
      const entry = this.npcScheduleSystem.getEntry(characterId);

      // Boundary confinement: if NPC has drifted outside their settlement, redirect them back
      if (!this.npcScheduleSystem.isWithinNPCBounds(characterId, currentPos)) {
        const clamped = this.npcScheduleSystem.clampToSettlementBounds(characterId, currentPos);
        const path = this.npcScheduleSystem.findSidewalkPathForNPC(characterId, currentPos, clamped);
        instance.schedulePathWaypoints = path.length > 0 ? path : [clamped];
        instance.schedulePathIndex = 0;
        if (entry) entry.currentGoal = { type: 'wander_sidewalk', expiresAt: 0 };
      }

      // --- Follow the sidewalk path ---
      const waypoints = instance.schedulePathWaypoints;
      const wpIdx = instance.schedulePathIndex ?? 0;

      if (waypoints && wpIdx < waypoints.length) {
        const targetWP = waypoints[wpIdx];

        // Stuck detection — turn away from obstacle, skip waypoints, or abandon path
        if (instance.lastWanderPosition) {
          const moved = Vector3.Distance(currentPos, instance.lastWanderPosition);
          if (moved < 0.05) {
            instance.stuckTicks = (instance.stuckTicks || 0) + 1;
            if (instance.stuckTicks >= 2 && instance.stuckTicks < 5) {
              // First response: stop walking and rotate away from the wall
              instance.controller.walk(false);
              const turnAngle = (Math.PI / 2) + Math.random() * Math.PI;
              instance.mesh.rotation.y += turnAngle;
              return;
            }
            if (instance.stuckTicks >= 5) {
              // Persistent stuck: abandon the path and let ScheduleExecutor pick a new goal
              instance.controller.walk(false);
              instance.controller.turnLeft(false);
              instance.controller.turnRight(false);
              instance.schedulePathWaypoints = undefined;
              instance.stuckTicks = 0;
              this.scheduleExecutor.abandonGoal(characterId);
              this.scheduleExecutor.setIdle(characterId, now);
              instance.wanderWaitUntil = now + 2000 + Math.random() * 3000;
              instance.lastWanderPosition = currentPos.clone();
              return;
            }
          } else {
            instance.stuckTicks = 0;
          }
        }
        instance.lastWanderPosition = currentPos.clone();

        const dx = targetWP.x - currentPos.x;
        const dz = targetWP.z - currentPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 1.0) {
          // Reached this waypoint — advance to next
          instance.schedulePathIndex = wpIdx + 1;
          this.scheduleExecutor.advancePathIndex(characterId);

          // If this was the last waypoint, we've arrived at destination
          if (wpIdx + 1 >= waypoints.length) {
            instance.controller.walk(false);
            instance.controller.turnLeft(false);
            instance.controller.turnRight(false);

            const goal = entry?.currentGoal;
            if ((goal?.type === 'go_to_building' || goal?.type === 'visit_friend') && goal.buildingId) {
              // Enter the building via ScheduleExecutor (handles duration calculation)
              this.scheduleExecutor.enterBuilding(characterId, goal.buildingId, now);
            } else {
              // Wander/idle goal complete — let ScheduleExecutor manage idle + re-evaluation
              this.scheduleExecutor.setIdle(characterId, now);
              instance.wanderWaitUntil = now + 3000 + Math.random() * 5000;
              instance.schedulePathWaypoints = undefined;
              if (entry) entry.currentGoal = null;
            }
          }
          return;
        }

        // Walk toward the current waypoint
        this.moveNPCToward(instance, targetWP);
        return;
      }

      // No active path — force the ScheduleExecutor to pick a new goal immediately
      if (!this.scheduleExecutor.hasPendingAction(characterId)) {
        this.scheduleExecutor.forceEvaluateNPC(characterId);
        // Brief pause to avoid re-evaluating every tick if no goal is available
        if (!this.scheduleExecutor.hasPendingAction(characterId)) {
          instance.wanderWaitUntil = now + 2000 + Math.random() * 3000;
          instance.schedulePathWaypoints = undefined;
          if (entry) entry.currentGoal = null;
        }
      }
      return;
    }

    // --- Fallback: random wander if no street data ---
    this.updateNPCRandomWander(instance, now);
  }

  /**
   * Translate a volition goal into concrete NPC movement.
   * Maps terminal actions to destinations: social actions → target NPC position,
   * commerce → random business, self-care → home, explore → random sidewalk.
   */
  /**
   * Try to assign an ambient life behavior to an idle NPC.
   * Gathers nearby context (buildings, NPCs) and delegates to AmbientLifeBehaviorSystem.
   */
  private updateAmbientLifeBehavior(
    instance: NPCInstance,
    characterId: string,
    now: number,
  ): { faceTargetPosition?: { x: number; z: number } } | null {
    if (!instance.mesh) return null;

    const npcX = instance.mesh.position.x;
    const npcZ = instance.mesh.position.z;
    const gameHour = this.gameTimeManager.getState().hour;
    const schedEntry = this.npcScheduleSystem.getEntry(characterId);
    const personality = schedEntry?.personality;

    // Gather nearby buildings
    const nearbyBuildings: NearbyBuildingInfo[] = [];
    this.buildingData.forEach((data, id) => {
      const dx = data.position.x - npcX;
      const dz = data.position.z - npcZ;
      if (dx * dx + dz * dz < 225) { // 15^2
        nearbyBuildings.push({
          id,
          buildingType: data.metadata?.buildingType ?? 'business',
          doorX: data.position.x,
          doorZ: data.position.z,
          isHome: id === schedEntry?.homeBuildingId,
          isWork: id === schedEntry?.workBuildingId,
        });
      }
    });

    // Gather nearby visible NPCs
    const nearbyNPCs: NearbyNPCInfo[] = [];
    this.npcMeshes.forEach((otherInstance, otherId) => {
      if (otherId === characterId) return;
      if (!otherInstance.mesh?.isEnabled()) return;
      const dx = otherInstance.mesh.position.x - npcX;
      const dz = otherInstance.mesh.position.z - npcZ;
      if (dx * dx + dz * dz < 144) { // 12^2
        nearbyNPCs.push({ id: otherId, x: otherInstance.mesh.position.x, z: otherInstance.mesh.position.z });
      }
    });

    const behavior = this.ambientLifeSystem.update(
      characterId, now, gameHour, npcX, npcZ,
      personality, nearbyBuildings, nearbyNPCs
    );

    if (behavior) {
      // Play the appropriate animation if it changed
      if (instance.ambientActivityAnimation !== behavior.animation) {
        instance.ambientActivityAnimation = behavior.animation;
        this.playNPCAnimation(instance, behavior.animation);
      }
      // Extend the idle wait to cover the full activity duration
      if (instance.wanderWaitUntil && instance.wanderWaitUntil < behavior.endTime) {
        instance.wanderWaitUntil = behavior.endTime;
      }
      return behavior;
    }
    return null;
  }

  /**
   * Play an animation on an NPC by searching its animation groups for a matching name.
   */
  private playNPCAnimation(instance: NPCInstance, animation: string): void {
    if (!instance.animationGroups?.length) return;

    const searchNames: Record<string, string[]> = {
      idle: ['idle', 'Idle', 'standing', 'breathe'],
      walk: ['walk', 'Walk', 'walking'],
      run: ['run', 'Run', 'running'],
      talk: ['talk', 'Talk', 'talking', 'speak', 'gesture'],
      listen: ['listen', 'Listen', 'listening', 'nod'],
      work: ['work', 'Work', 'working', 'work_standing'],
      sit: ['sit', 'Sit', 'sitting', 'seated'],
      eat: ['eat', 'Eat', 'eating', 'drink'],
      wave: ['wave', 'Wave', 'waving', 'greet'],
      sleep: ['sleep', 'Sleep', 'sleeping', 'lying'],
    };

    const names = searchNames[animation] || [animation];
    const group = instance.animationGroups.find((ag: any) =>
      names.some((n: string) => ag.name?.toLowerCase().includes(n.toLowerCase()))
    );

    if (group) {
      for (const ag of instance.animationGroups) {
        if (ag !== group) ag.stop();
      }
      group.start(true);
    }
  }

  /**
   * Play an animation from an ActionResult's animation data on an entity.
   * Searches the entity's animation groups for the clip name (exact or fuzzy match).
   * Works for both player mesh and NPC instances.
   */
  private playActionAnimation(entityId: string, animData: { clip: string; clipAlt?: string; loop: boolean; speed?: number; blendIn?: number }): void {
    // Find the entity's animation groups
    let animGroups: any[] | undefined;

    if (entityId === 'player') {
      // Player mesh in first-person doesn't have animations,
      // but if a third-person model is loaded, use its groups
      animGroups = this.scene?.animationGroups as any[];
    } else {
      const instance = this.npcMeshes.get(entityId);
      animGroups = instance?.animationGroups;
    }

    if (!animGroups?.length) return;

    // Search for the animation clip by name (exact first, then fuzzy)
    const findClip = (clipName: string) => {
      // Exact match
      let group = animGroups!.find((ag: any) => ag.name === clipName);
      if (group) return group;
      // Case-insensitive match
      const lower = clipName.toLowerCase();
      group = animGroups!.find((ag: any) => ag.name?.toLowerCase() === lower);
      if (group) return group;
      // Substring match
      return animGroups!.find((ag: any) => ag.name?.toLowerCase().includes(lower));
    };

    const group = findClip(animData.clip) || (animData.clipAlt ? findClip(animData.clipAlt) : null);
    if (!group) return;

    // Stop other animations and play the matched one
    for (const ag of animGroups) {
      if (ag !== group) ag.stop();
    }

    if (animData.speed && typeof group.speedRatio !== 'undefined') {
      group.speedRatio = animData.speed;
    }

    group.start(animData.loop);
  }

  private executeVolitionGoal(instance: NPCInstance, goal: VolitionGoal, now: number): void {
    if (!instance.mesh) return;
    const currentPos = instance.mesh.position;
    let destination: Vector3 | null = null;

    const terminal = TERMINAL_ACTIONS[goal.actionId];
    const characterId = instance.characterData?.id;

    if (terminal?.requiresTarget && goal.targetId) {
      // Social/hostile/romantic actions: walk toward target NPC
      const targetInstance = this.npcMeshes.get(goal.targetId);
      if (targetInstance?.mesh) {
        destination = targetInstance.mesh.position.clone();
      }
    } else if (['visit_shop', 'trade_goods', 'walk_to_tavern'].includes(goal.actionId)) {
      // Commerce/tavern: walk to a random business
      const door = this.findRandomBusinessDoor();
      if (door) destination = door;
    } else if (['rest', 'eat_food', 'seek_solitude'].includes(goal.actionId)) {
      // Self-care: go home
      if (characterId) {
        const schedEntry = this.npcScheduleSystem.getEntry(characterId);
        if (schedEntry?.homeBuildingId) {
          const door = this.npcScheduleSystem.getBuildingDoor(schedEntry.homeBuildingId);
          if (door) destination = door;
        }
      }
    }

    // Fallback: random sidewalk destination within NPC's settlement bounds
    if (!destination) {
      destination = this.npcScheduleSystem.getRandomSidewalkTarget(characterId);
    }

    if (destination && this.npcScheduleSystem.hasStreetData()) {
      const path = this.npcScheduleSystem.findSidewalkPathForNPC(characterId!, currentPos, destination);
      instance.schedulePathWaypoints = path;
      instance.schedulePathIndex = 0;
    }
  }

  /**
   * Complete the current volition goal and return to schedule.
   */
  private completeVolitionGoal(instance: NPCInstance, characterId: string): void {
    if (!instance.controller) return;
    instance.controller.walk(false);
    instance.controller.turnLeft(false);
    instance.controller.turnRight(false);

    const goalId = instance.volitionGoalId;
    if (goalId) {
      this.volitionSystem.completeGoal(characterId, goalId);
    }

    // Clear volition state — NPC returns to schedule
    instance.volitionGoalId = undefined;
    instance.volitionActionId = undefined;
    instance.volitionTargetNpcId = undefined;
    instance.schedulePathWaypoints = undefined;
    instance.schedulePathIndex = undefined;
    // Brief idle before resuming schedule
    instance.wanderWaitUntil = Date.now() + 2000 + Math.random() * 3000;
  }

  /**
   * Find a random business building door position.
   */
  private findRandomBusinessDoor(): Vector3 | null {
    const businesses: string[] = [];
    this.buildingData.forEach((data, buildingId) => {
      if (data.metadata?.buildingType === 'business') {
        businesses.push(buildingId);
      }
    });
    if (businesses.length === 0) return null;
    const chosen = businesses[Math.floor(Math.random() * businesses.length)];
    return this.npcScheduleSystem.getBuildingDoor(chosen);
  }

  /**
   * Steer an NPC toward a target position using smooth direct rotation + walk command.
   * Uses direct rotation interpolation instead of slow discrete turn commands
   * to eliminate circling behavior and teleportation-like jitter.
   */
  private moveNPCToward(instance: NPCInstance, target: Vector3): void {
    if (!instance.mesh || !instance.controller) return;
    const currentPos = instance.mesh.position;

    // Ground-clamp NPC Y position to prevent floating or falling through terrain
    const groundHit = this.projectToGround(currentPos.x, currentPos.z);
    if (Math.abs(currentPos.y - groundHit.y) > 1.5) {
      currentPos.y = groundHit.y;
    }

    const dx = target.x - currentPos.x;
    const dz = target.z - currentPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.1) {
      instance.controller.walk(false);
      instance.controller.turnLeft(false);
      instance.controller.turnRight(false);
      this.playNPCAnimation(instance, 'idle');
      return;
    }

    instance.controller.run(false);

    // Smooth direct rotation toward target
    const targetRotation = Math.atan2(dx, dz);
    let rotationDiff = targetRotation - instance.mesh.rotation.y;
    while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
    while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;

    const turnThreshold = 0.15;
    if (Math.abs(rotationDiff) > turnThreshold) {
      // Smooth interpolation: rotate toward target at ~5 rad/s, capped by dt
      const dt = Math.min(this.scene.getEngine().getDeltaTime() / 1000, 0.1);
      const turnSpeed = 5.0; // radians per second
      const step = turnSpeed * dt;
      if (Math.abs(rotationDiff) <= step) {
        instance.mesh.rotation.y = targetRotation;
      } else {
        instance.mesh.rotation.y += Math.sign(rotationDiff) * step;
      }
    } else {
      instance.mesh.rotation.y = targetRotation;
    }

    // Stop discrete turn commands — rotation is handled directly above
    instance.controller.turnLeft(false);
    instance.controller.turnRight(false);

    // Only walk forward when roughly facing the target
    if (Math.abs(rotationDiff) < Math.PI / 3) {
      instance.controller.walk(true);
      this.playNPCAnimation(instance, 'walk');
    } else {
      instance.controller.walk(false);
      this.playNPCAnimation(instance, 'idle');
    }
  }

  /**
   * Play a named animation on an NPC instance by searching its animation groups.
   * Stops all other animations and starts the matched one (looping).
   */
  private playNPCAnimation(instance: NPCInstance, animName: string): void {
    if (!instance.animationGroups?.length) return;
    const nameMap: Record<string, string[]> = {
      walk: ['walk', 'Walk', 'walking'],
      idle: ['idle', 'Idle', 'standing', 'breathe', 'Idle_Neutral'],
      run: ['run', 'Run', 'running'],
      talk: ['talk', 'Talk', 'talking', 'speak', 'gesture'],
      listen: ['listen', 'Listen', 'listening', 'nod'],
    };
    const search = nameMap[animName] || [animName];
    const group = instance.animationGroups.find((ag: any) =>
      search.some((n: string) => ag.name?.toLowerCase().includes(n.toLowerCase()))
    );
    if (group && instance.currentAnimation !== group) {
      for (const ag of instance.animationGroups) {
        if (ag !== group) ag.stop();
      }
      group.start(true);
      instance.currentAnimation = group;
    }
  }

  /**
   * Legacy random wander behavior — used when no street network data is available.
   */
  private updateNPCRandomWander(instance: NPCInstance, now: number): void {
    if (!instance.mesh || !instance.controller) return;
    const homePos = instance.homePosition || instance.mesh.position;
    const currentPos = instance.mesh.position;
    const wanderRadius = 8;
    const halfTerrain = (this.terrainSize || 512) / 2 - 5;

    // Stuck detection — turn away from wall before abandoning target
    if (instance.wanderTarget && instance.lastWanderPosition) {
      const moved = Vector3.Distance(currentPos, instance.lastWanderPosition);
      if (moved < 0.05) {
        instance.stuckTicks = (instance.stuckTicks || 0) + 1;
        if (instance.stuckTicks >= 2 && instance.stuckTicks < 4) {
          // Turn away from the obstacle
          instance.controller.walk(false);
          instance.mesh.rotation.y += (Math.PI / 2) + Math.random() * Math.PI;
          return;
        }
        if (instance.stuckTicks >= 4) {
          // Give up on this target
          instance.wanderTarget = undefined;
          instance.stuckTicks = 0;
          instance.wanderWaitUntil = now + 1000 + Math.random() * 2000;
          instance.controller.walk(false);
          instance.controller.turnLeft(false);
          instance.controller.turnRight(false);
          return;
        }
      } else {
        instance.stuckTicks = 0;
      }
    }
    instance.lastWanderPosition = currentPos.clone();

    // Pick new target if needed
    if (!instance.wanderTarget || Vector3.Distance(currentPos, instance.wanderTarget) < 2) {
      instance.controller.walk(false);
      instance.controller.turnLeft(false);
      instance.controller.turnRight(false);
      this.playNPCAnimation(instance, 'idle');
      instance.wanderWaitUntil = now + 4000 + Math.random() * 6000;

      if (this._wanderRaycastsThisTick < MAX_WANDER_RAYCASTS_PER_TICK) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * wanderRadius;
        let tx = homePos.x + Math.cos(angle) * distance;
        let tz = homePos.z + Math.sin(angle) * distance;
        tx = Math.max(-halfTerrain, Math.min(halfTerrain, tx));
        tz = Math.max(-halfTerrain, Math.min(halfTerrain, tz));
        // Reject wander targets inside buildings
        if (!this.isPointInsideAnyBuilding(tx, tz)) {
          instance.wanderTarget = this.projectToGround(tx, tz);
        }
        this._wanderRaycastsThisTick++;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * wanderRadius;
        let tx = homePos.x + Math.cos(angle) * distance;
        let tz = homePos.z + Math.sin(angle) * distance;
        tx = Math.max(-halfTerrain, Math.min(halfTerrain, tx));
        tz = Math.max(-halfTerrain, Math.min(halfTerrain, tz));
        // Reject wander targets inside buildings
        if (!this.isPointInsideAnyBuilding(tx, tz)) {
          instance.wanderTarget = new Vector3(tx, currentPos.y, tz);
        }
      }
      return;
    }

    // Move toward wander target
    if (instance.wanderTarget) {
      this.moveNPCToward(instance, instance.wanderTarget);
    }
  }

  /**
   * Render a 2D top-down world map for the minimap background.
   * Draws terrain, streets, and building footprints onto a canvas.
   */
  private generateMinimapTerrainBackground(): void {
    if (!this.guiManager) return;
    const biome = ProceduralNatureGenerator.getBiomeFromWorldType(this.config.worldType);
    const biomeName = biome.name.toLowerCase();
    const worldSize = this.terrainSize || 512;

    // Render a 2D top-down world map with terrain, streets, and buildings.
    // Use 2048px for sharp building footprints when zoomed in.
    const canvas = renderWorldCanvas(
      2048,
      worldSize,
      biomeName,
      this._minimapStreets,
      this._minimapBuildings,
    );

    // Set as terrain background layer (visible behind sliding viewport)
    this.guiManager.setMinimapTerrainBackground(canvas);
    // Set as the full-world image to enable the sliding-window viewport
    this.guiManager.setMinimapImage(canvas.toDataURL('image/png'), worldSize);
    // Share with fullscreen map
    this.fullscreenMap?.setWorldImage(canvas, worldSize);
  }

  private updateNearbyNPCForChat(): void {
    if (!this.chatPanel || !this.playerMesh || this.conversationNPCId) return;

    const playerPos = this.playerMesh.position;
    let nearestName: string | null = null;
    let nearestDist = 8; // max proximity distance

    this.npcMeshes.forEach((instance) => {
      if (!instance.mesh || instance.isInsideBuilding) return;
      const dx = playerPos.x - instance.mesh.position.x;
      const dz = playerPos.z - instance.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestName = instance.characterData?.firstName || 'NPC';
      }
    });

    this.chatPanel.setNearbyNPC(nearestName);
  }

  private _minimapBuildingsCollected = false;
  private _minimapBuildings: Array<{ position: { x: number; z: number }; type: 'business' | 'residence' | 'other'; width: number; depth: number }> = [];
  private _minimapStreets: Array<{ waypoints: Array<{ x: number; z: number }>; width: number }> = [];

  private updateMinimapOverlay(): void {
    if (!this.guiManager || !this.worldData || !this.playerMesh) return;

    const settlementsData = Array.from(this.settlementMeshes.entries()).map(([id, mesh]) => {
      const stats = this.settlementStats.get(id);
      const settlement = this.settlements?.find((s) => s.id === id) || this.worldData?.settlements?.find((s) => s.id === id);

      const type = settlement?.settlementType || stats?.type || "town";
      const zoneType = this.getZoneTypeForSettlement(type);

      return {
        id,
        name: settlement?.name || stats?.name || id,
        position: { x: mesh.position.x, z: mesh.position.z },
        type,
        zoneType,
        buildingCount: stats?.buildingCount ?? 0
      };
    });

    if (settlementsData.length === 0) return;

    // Collect building positions once for the static minimap layer
    if (!this._minimapBuildingsCollected && this.buildingData.size > 0) {
      this._minimapBuildings = [];
      this.buildingData.forEach((data) => {
        const bType = data.metadata?.buildingType === 'business' ? 'business' as const
          : data.metadata?.buildingType === 'residence' ? 'residence' as const
          : 'other' as const;
        // Extract footprint dimensions from mesh bounding box
        let width = 6;
        let depth = 6;
        if (data.mesh) {
          const bounds = data.mesh.getBoundingInfo?.()?.boundingBox;
          if (bounds) {
            const ext = bounds.extendSize;
            width = ext.x * 2;
            depth = ext.z * 2;
          }
        }
        this._minimapBuildings.push({
          position: { x: data.position.x, z: data.position.z },
          type: bType,
          width,
          depth
        });
      });
      this._minimapBuildingsCollected = true;
      // Re-render the minimap world image now that buildings are available
      this.generateMinimapTerrainBackground();
    }

    // Collect quest markers from active quests that have a location (legacy fallback)
    const questMarkers: Array<{ id: string; title: string; position: { x: number; z: number } }> = [];
    for (const quest of this.quests) {
      if (quest.status !== 'active') continue;
      if (quest.locationPosition) {
        questMarkers.push({
          id: quest.id,
          title: quest.title,
          position: { x: quest.locationPosition.x, z: quest.locationPosition.z }
        });
      }
    }

    // Derive markers from individual quest objectives (type-specific colors/shapes)
    const questObjectiveMarkers = extractObjectiveMarkers(this.quests).map(m => ({
      id: m.id,
      questTitle: m.questTitle,
      objectiveType: m.objectiveType,
      objectiveDescription: m.objectiveDescription,
      position: m.position,
      color: m.color,
      shape: m.shape,
    }));

    // Collect quest item markers from active fetch quest collectibles
    const questItemMarkers = this.questObjectManager?.getCollectibleItemPositions()?.map(item => ({
      id: item.id,
      itemName: item.itemName,
      position: item.position
    })) ?? [];

    // Collect NPC positions
    const npcPositions: Array<{ id: string; position: { x: number; z: number }; role?: string; name?: string; questIndicator?: string | null }> = [];
    this.npcMeshes.forEach((instance, npcId) => {
      if (!instance?.mesh || !instance.mesh.isEnabled()) return;
      npcPositions.push({
        id: npcId,
        position: { x: instance.mesh.position.x, z: instance.mesh.position.z },
        role: instance.role,
        name: instance.characterData?.firstName,
        questIndicator: this.questIndicatorManager?.getIndicatorTypeForNPC(npcId) ?? null,
      });
    });

    const minimapData = {
      settlements: settlementsData,
      buildings: this._minimapBuildings,
      streets: this._minimapStreets,
      questMarkers,
      questObjectiveMarkers,
      questItemMarkers,
      npcPositions,
      playerPosition: {
        x: this.playerMesh.position.x,
        z: this.playerMesh.position.z
      },
      playerRotationY: this.playerMesh.rotation.y,
      worldSize: this.terrainSize || 512
    };

    this.guiManager.updateMinimap(minimapData);
    this.fullscreenMap?.update(minimapData);
  }

  private _perfDiv: HTMLDivElement | null = null;
  private _perfTimer = 0;

  private startGameLoop(): void {
    if (!this.engine) return;

    // Create FPS/mesh counter overlay
    this._perfDiv = document.createElement('div');
    this._perfDiv.style.cssText = 'position:absolute;top:4px;left:4px;color:#0f0;font:bold 13px monospace;background:rgba(0,0,0,0.5);padding:4px 8px;pointer-events:none;z-index:9999;border-radius:4px;';
    this.canvas.parentElement?.appendChild(this._perfDiv);

    this.engine.runRenderLoop(() => {
      if (!this.scene) return;

      // Advance game time and update day/night visuals
      this.gameTimeManager.update(this.engine!.getDeltaTime());
      this.dayNightCycle?.update();

      // Update physical action progress (fishing, mining, cooking, etc.)
      this.playerActionSystem?.update(this.engine!.getDeltaTime());

      // Process NPC schedule actions from the unified routine manager
      this.processScheduleExecutorActions();

      // Update time HUD indicator
      this.guiManager?.updateTime(
        this.gameTimeManager.timeString,
        this.gameTimeManager.day,
        this.gameTimeManager.timeOfDay,
        this.gameTimeManager.timeScale,
        this.gameTimeManager.paused,
      );

      // Update time display in game menu (if open on Rest tab)
      this.gameMenuSystem?.updateTime(
        this.gameTimeManager.timeString,
        this.gameTimeManager.day,
        this.gameTimeManager.timeOfDay,
      );

      // Render whichever scene is active (overworld or interior)
      const activeScene = this.interiorSceneManager?.getActiveScene() ?? this.scene;
      activeScene.render();

      // Update perf overlay every 500ms
      this._perfTimer += this.engine!.getDeltaTime();
      if (this._perfTimer >= 500 && this._perfDiv) {
        this._perfTimer = 0;
        const fps = this.engine!.getFps().toFixed(0);
        const activeMeshes = activeScene.getActiveMeshes().length;
        const totalMeshes = activeScene.meshes.length;
        const drawCalls = (this.engine as any)._drawCalls?.lastSecAverage?.toFixed(0) ?? (this.engine as any)._drawCalls?.current ?? 0;
        const materials = activeScene.materials.length;
        const frameMs = this.engine!.getDeltaTime().toFixed(1);
        this._perfDiv.textContent = `${fps} FPS | ${frameMs}ms | ${activeMeshes}/${totalMeshes} meshes | ${drawCalls} draws | ${materials} mats`;

        // Measurement: log slow frames (>33ms)
        const dt = this.engine!.getDeltaTime();
        if (dt > 33) {
        }
      }
    });
  }

  // ============================================================================
  // GAME LOGIC
  // ============================================================================

  private async handleKeyDown(event: KeyboardEvent): Promise<void> {
    // Prevent handling if in text input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // M - Close full-screen map first, then toggle game menu
    if (event.code === KEY_GAME_MENU && !event.repeat) {
      event.preventDefault();
      if (this.fullscreenMap?.isOpen) {
        this.fullscreenMap.close();
        return;
      }
      if (this.gameMenuSystem) {
        this.gameMenuSystem.toggle();
      }
      return; // Don't process other keys while toggling menu
    }

    // F5 - Quick save (works even with menu open)
    if (event.code === KEY_QUICK_SAVE && !event.repeat) {
      event.preventDefault();
      this.gameMenuSystem?.quickSave();
      return;
    }

    // F9 - Quick load (works even with menu open)
    if (event.code === KEY_QUICK_LOAD && !event.repeat) {
      event.preventDefault();
      this.gameMenuSystem?.quickLoad();
      return;
    }

    // Time controls moved to Game Menu → Rest tab

    // If the unified menu is open, block all other game input
    if (this.gameMenuSystem?.isOpen) {
      return;
    }

    // Block game input when any text-input modal/panel is open
    if (assessmentModalOpen || compositionModalOpen ||
        this.chatPanel?.getIsVisible() || this.noticeBoardPanel?.getIsVisible()) {
      return;
    }

    // Enter - Universal interact: dispatch based on what the player is looking at
    if (event.code === KEY_BUILDING_INTERACT && !event.repeat) {
      event.preventDefault();
      // If the contextual action menu is open, let its own keyboard handler process Enter
      if (this.contextualActionMenu?.isOpen()) return;
      if (this.conversationNPCId) {
        // If in conversation, exit it
        this.handleConversationEnd();
        this.chatPanel?.hide(false); // Don't trigger onClose callback
        this.guiManager?.showToast({
          title: "Conversation Ended",
          duration: 1500
        });
      } else {
        // Check if an NPC is approaching and accept their conversation
        const accepted = await this.npcInitiatedConversationController?.acceptApproach();
        if (!accepted) {
          // Dispatch based on unified interaction prompt target
          await this.handleUnifiedInteraction();
        }
      }
    }

    // F - Attack/Respawn
    if (event.code === KEY_ATTACK && !event.repeat) {
      event.preventDefault();
      this.handleAttack();
    }

    // Q - Contextual action menu (for any target the player is looking at)
    if (event.code === KEY_PHYSICAL_ACTION && !event.repeat) {
      if (this.contextualActionMenu?.isOpen()) {
        event.preventDefault();
        this.contextualActionMenu.hide();
      } else {
        event.preventDefault();
        await this.handleUnifiedInteraction();
      }
    }

    // T - Target nearest enemy
    if (event.code === KEY_TARGET_ENEMY && !event.repeat) {
      event.preventDefault();
      this.handleTargetEnemy();
    }

    // J shortcut removed — access Journal via Game Menu

    // Tab - Open game menu Map tab
    if (event.code === KEY_FULLSCREEN_MAP && !event.repeat) {
      event.preventDefault();
      this.gameMenuSystem?.open("map");
    }

    // Shift+V - Toggle VR
    if (event.code === KEY_TOGGLE_VR && event.shiftKey && !event.repeat) {
      event.preventDefault();
      await this.handleToggleVR();
    }

    // Y - Eavesdrop on nearby NPC conversation
    if (event.code === KEY_EAVESDROP && !event.repeat) {
      event.preventDefault();
      this.ambientConversationManager?.activateEavesdrop();
    }

    // R - Push-to-talk (hold to record)
    if (event.code === KEY_PUSH_TO_TALK && !event.repeat) {
      event.preventDefault();
      this.chatPanel?.startPushToTalk();
    }

    // X - Examine nearest object (legacy fallback, G now handles this too)
    if (event.code === KEY_EXAMINE_OBJECT && !event.repeat) {
      event.preventDefault();
      this.handleExamineObject();
    }

    // C - Toggle camera viewfinder (photography mode)
    if (event.code === KEY_CAMERA_MODE && !event.repeat) {
      event.preventDefault();
      if (this.photographySystem?.active) {
        // Exiting photo mode — restore previous camera
        this.photographySystem.toggleViewfinder();
        if (this.cameraManager && this.prePhotoCameraMode) {
          this.cameraManager.setMode(this.prePhotoCameraMode, false);
          this.prePhotoCameraMode = null;
        }
      } else {
        // Entering photo mode — switch to first person
        if (this.cameraManager) {
          this.prePhotoCameraMode = this.cameraManager.getCurrentMode();
          this.cameraManager.setMode('first_person', false);
        }
        this.photographySystem?.toggleViewfinder();
      }
    }

    // Space while in photo mode - take photo
    if (event.code === 'Space' && this.photographySystem?.active && !event.repeat) {
      event.preventDefault();
      this.photographySystem.capturePhoto();
    }

    // P - Open game menu Photos tab
    if (event.code === KEY_PHOTO_BOOK && !event.repeat) {
      event.preventDefault();
      if (this.photographySystem?.active) {
        this.photographySystem.toggleViewfinder(); // close viewfinder first
        if (this.cameraManager && this.prePhotoCameraMode) {
          this.cameraManager.setMode(this.prePhotoCameraMode, false);
          this.prePhotoCameraMode = null;
        }
      }
      this.gameMenuSystem?.open("photos");
    }

    // B - Cycle vehicle (on foot → bicycle → horse → on foot)
    if (event.code === KEY_CYCLE_VEHICLE && !event.repeat) {
      event.preventDefault();
      if (this.vehicleSystem) {
        this.vehicleSystem.cycleVehicle();
        this.guiManager?.showToast({
          title: this.vehicleSystem.getLabel(),
          duration: 1500,
        });
      }
    }
  }
  
  private async handleProximityInteraction(): Promise<void> {
    if (!this.playerMesh || this.npcMeshes.size === 0) return;

    const playerPos = this.playerMesh.position;
    let nearestId: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    const maxInteractionDistance = 8;

    this.npcMeshes.forEach((instance, npcId) => {
      if (!instance.mesh) return;
      const npcPos = instance.mesh.position;
      const dx = playerPos.x - npcPos.x;
      const dz = playerPos.z - npcPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance <= maxInteractionDistance && distance < nearestDistance) {
        nearestId = npcId;
        nearestDistance = distance;
      }
    });

    if (nearestId) {
      this.setSelectedNPC(nearestId);

      // If inside a business building, show business interaction menu
      if (this.isInsideBuilding && this.currentBuildingBusinessType && this.interiorNPCManager) {
        const placedNPC = this.interiorNPCManager.getPlacedNPC(nearestId);
        if (placedNPC) {
          await this.handleBusinessInteraction(placedNPC);
          return;
        }
      }

      // Default: open chat directly
      await this.handleOpenChat();
    }
  }

  /**
   * Unified interaction dispatcher. Checks what the player is looking at
   * via the InteractionPromptSystem, resolves available actions, and either
   * auto-executes (single action) or shows the ContextualActionMenu.
   * Falls back to proximity-based NPC interaction if no target is in view.
   */
  private async handleUnifiedInteraction(): Promise<void> {
    const target = this.interactionPrompt?.getCurrentTarget();

    if (!target) {
      // Fallback: old proximity-based NPC interaction
      await this.handleProximityInteraction();
      return;
    }

    // Build resolver context
    const playerPos = this.playerMesh?.getAbsolutePosition();
    const nearbyTypes = playerPos && this.interactionPrompt
      ? this.interactionPrompt.getNearbyActionHotspotTypes(playerPos, 4)
      : [];

    // Check if NPC has business interactions
    let hasBusinessInteractions = false;
    if (target.type === 'npc' && this.isInsideBuilding && this.currentBuildingBusinessType && this.interiorNPCManager) {
      const placedNPC = this.interiorNPCManager.getPlacedNPC(target.id);
      hasBusinessInteractions = !!placedNPC;
    }

    const resolverContext: ActionResolverContext = {
      playerActionSystem: this.playerActionSystem,
      nearbyActionHotspotTypes: nearbyTypes,
      isInsideBuilding: this.isInsideBuilding,
      currentBusinessType: this.currentBuildingBusinessType,
      hasBusinessInteractions,
      hasInventoryItems: (this.inventory?.getAllItems()?.length ?? 0) > 0,
    };

    const actions = resolveActions(target, resolverContext);
    const menuOptions = resolveMenuOptions(target);

    if (actions.length === 0) {
      await this.handleProximityInteraction();
      return;
    }

    // Show the contextual menu (auto-executes if single action)
    const autoExecuted = this.contextualActionMenu?.show(
      actions,
      menuOptions,
      (action) => this.dispatchContextualAction(action, target),
      () => { /* menu closed */ },
    );

    // If auto-executed, the callback already fired
    if (autoExecuted) return;
  }

  /**
   * Dispatch a selected contextual action to the appropriate handler.
   */
  private async dispatchContextualAction(
    action: import('./actions/ContextualActionMenu').ContextualAction,
    target: import('./InteractionPromptSystem').InteractableTarget,
  ): Promise<void> {
    switch (action.id) {
      // ── Social ─────────────────────────────────────────────────────
      case '__talk__': {
        this.setSelectedNPC(target.id);
        await this.handleOpenChat();
        break;
      }
      case '__business__': {
        this.setSelectedNPC(target.id);
        if (this.interiorNPCManager) {
          const placedNPC = this.interiorNPCManager.getPlacedNPC(target.id);
          if (placedNPC) {
            await this.handleBusinessInteraction(placedNPC);
            return;
          }
        }
        await this.handleOpenChat();
        break;
      }
      case '__eavesdrop__': {
        this.ambientConversationManager?.activateEavesdrop();
        break;
      }

      // ── Navigation ─────────────────────────────────────────────────
      case '__enter_building__': {
        await this.handleBuildingInteraction();
        break;
      }

      // ── Examine ────────────────────────────────────────────────────
      case '__examine__': {
        this.handleExamineObject();
        break;
      }
      case '__pick_up_book__': {
        this.handleBookPickup(target.mesh as Mesh);
        break;
      }
      case '__pick_up__': {
        const objectRole = target.objectRole || target.mesh.metadata?.objectRole || '';
        this.handleWorldPropClicked(target.mesh as Mesh, objectRole);
        break;
      }
      case '__read_notice_board__': {
        this.noticeBoardPanel?.show();
        break;
      }

      // ── Furniture ──────────────────────────────────────────────────
      case '__furniture_sit__':
      case '__furniture_read__':
      case '__furniture_use__': {
        await this.furnitureInteractionManager?.handleInteraction(target);
        break;
      }

      // ── Romance ──────────────────────────────────────────────────
      case '__give_gift__': {
        this.setSelectedNPC(target.id);
        await this.handlePerformAction('give_gift');
        break;
      }

      // ── Containers ─────────────────────────────────────────────────
      case '__open_container__': {
        this.handleContainerInteraction(target);
        break;
      }

      // ── Physical actions ───────────────────────────────────────────
      default: {
        if (action.id.startsWith('__physical_') && this.playerActionSystem) {
          const actionType = action.id.replace('__physical_', '').replace('__', '');
          const definition = this.playerActionSystem.getDefinition(
            actionType as import('./PlayerActionSystem').PhysicalActionType,
          );
          if (definition) {
            this.playerActionSystem.startAction(definition);
          }
        }
        break;
      }
    }
  }

  // ── Conversational action feedback ──────────────────────────────────────

  private static readonly CONVERSATIONAL_ACTION_FEEDBACK: Record<string, { icon: string; label: string; labelFr: string }> = {
    asked_about_topic: { icon: '❓', label: 'Asked about a topic', labelFr: 'Question posée' },
    used_target_language: { icon: '🗣️', label: 'Used target language!', labelFr: 'Langue cible utilisée !' },
    answered_question: { icon: '💬', label: 'Answered a question', labelFr: 'Répondu à une question' },
    requested_information: { icon: '🔎', label: 'Requested information', labelFr: 'Information demandée' },
    made_introduction: { icon: '👋', label: 'Introduced yourself', labelFr: 'Présentation faite' },
  };

  private handleConversationalGesture(gestureId: string): void {
    const gesture = CONVERSATIONAL_GESTURES.find((g) => g.id === gestureId);
    if (!gesture) return;

    // Play the player animation
    this.playActionAnimation?.('player', gesture.animationClip);

    // Emit as conversational action for quest tracking
    const npcId = this.selectedNPCId || '';
    const actionName = `gesture_${gestureId}`;
    this.eventBus.emit({ type: 'conversational_action', action: actionName, npcId, topic: undefined, questId: undefined });
    this.questObjectManager?.trackConversationalAction(actionName, npcId);

    // Show toast feedback
    this.guiManager?.showToast({
      title: `${gesture.icon} ${gesture.labelFr}`,
      description: gesture.labelEn,
      duration: 1500,
    });
  }

  private showConversationalActionFeedback(action: string, _npcId?: string, topic?: string): void {
    const feedback = BabylonGame.CONVERSATIONAL_ACTION_FEEDBACK[action];
    if (!feedback) return;

    const description = topic ? `"${topic}"` : feedback.label;

    this.guiManager?.showToast({
      title: `${feedback.icon} ${feedback.labelFr}`,
      description,
      duration: 2000,
    });
  }

  private async handleOpenChat(): Promise<void> {
    if (!this.chatPanel || !this.worldData) {
      this.guiManager?.showToast({
        title: "Chat Unavailable",
        description: "Chat panel or world data not ready",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    if (!this.selectedNPCId) {
      this.guiManager?.showToast({
        title: "No NPC Selected",
        description: "Select an NPC first (click or press SPACE near them)",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    const npcId = this.selectedNPCId;
    const npcInfo = this.npcInfos.find((n) => n.id === npcId);
    if (!npcInfo) return;

    // If this NPC has an available quest, show the quest offer panel first
    if (!this.skipQuestOfferOnce) {
      const questIndicator = this.questIndicatorManager?.getIndicatorTypeForNPC(npcId);
      if (questIndicator === 'available' && this.questOfferPanel) {
        const offer = this.buildQuestOfferForNPC(npcId, npcInfo.name);
        if (offer) {
          this.questOfferPanel.show(offer);
          return;
        }
      }
    }
    this.skipQuestOfferOnce = false;

    try {
      // Use cached character data — check this.characters first (primary), fallback to worldData.characters
      const worldCharacter = (this.characters || this.worldData?.characters || []).find((c: any) => c.id === npcId);
      if (!worldCharacter) {
        throw new Error(`Character ${npcId} not found in world data`);
      }

      // Transform WorldCharacter to Character type by adding worldId (cast as any to avoid type issues)
      const character = {
        ...worldCharacter,
        worldId: this.config.worldId
      } as any;

      // Fetch truths first (before NPC setup)
      let truths: any[] = [];
      try {
        truths = await this.dataSource.loadTruths(this.config.worldId);
      } catch (truthsError) {
      }

      const npcInstance = this.npcMeshes.get(npcId);
      const npcMesh = npcInstance?.mesh;

      // ── MINIMAL CONVERSATION START ──
      // ONLY open the chat window. Do NOT touch the NPC mesh, NPC controller,
      // player controller, camera, indicators, or any other game system.
      // Previous attempts to manipulate any of these caused NPC disappearance.
      this.conversationNPCId = npcId;
      if (npcInstance) {
        npcInstance.isInConversation = true;
      }

      // Exclude NPC mesh from camera obstruction hiding.
      // The CharacterController raycasts from camera to player and sets isVisible=false
      // on anything in between — which includes the NPC you're talking to.
      // This exclusion prevents that without moving/rotating/modifying the NPC.
      if (npcMesh && this.playerController) {
        this.playerController.addObstructionExclusion(npcMesh);
      }

      // Pause ambient NPC conversations so their TTS doesn't overlap with the player's chat
      this.ambientConversationManager?.pause();
      this.npcInitiatedConversationController?.pause();

      // Switch to first-person view for conversation immersion
      if (this.cameraManager) {
        this.preConversationCameraMode = this.cameraManager.getCurrentMode();
        this.cameraManager.setMode('first_person', false);
      }

      // Turn the NPC to face the player
      if (npcMesh && this.playerMesh) {
        const dir = this.playerMesh.position.subtract(npcMesh.position);
        dir.y = 0; // Keep rotation on the horizontal plane
        if (dir.lengthSquared() > 0.001) {
          const angle = Math.atan2(dir.x, dir.z);
          npcMesh.rotation.y = angle + Math.PI;
        }
      }

      // Set target language so NPC speaks in the correct language
      this.chatPanel.setTargetLanguage(getTargetLanguage(this.worldData) || (this.worldData as any)?.targetLanguage || null);

      // Inject reputation context into NPC conversation prompt
      if (this.reputationManager && this.currentZone) {
        const repContext = this.reputationManager.getConversationContext(this.currentZone.id);
        if (repContext) {
          this.chatPanel.setQuestGuidancePrompt(repContext);
        }
      }

      // Fetch NPC quest guidance (non-blocking — sets context before or shortly after show)
      this.fetchQuestGuidance(npcId, this.config.worldId);

      // Open the chat panel — this is the core action
      this.chatPanel.show(character, truths, npcMesh);

      // If this NPC is the assessment target, signal that the player initiated the conversation
      if (this.assessmentActive && this._assessmentTargetNpcId && npcId === this._assessmentTargetNpcId) {
        this.eventBus.emit({
          type: 'assessment_conversation_initiated',
          npcId,
        });
        // Emit npc_talked trigger for quest objective completion
        this.eventBus.emit({ type: 'npc_talked', npcId });
      }
    } catch (error) {
      console.error("Failed to open chat:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.guiManager?.showToast({
        title: "Chat Error",
        description: `Failed to load character data: ${errorMessage}`,
        variant: "destructive",
        duration: 3000
      });
    }
  }

  /**
   * Start an eavesdrop conversation between two NPCs.
   * Opens the chat panel in eavesdrop mode — the player observes the NPCs
   * conversing using the same streaming conversation pipeline as player-NPC chat.
   */
  private async startEavesdropConversation(npc1Id: string, npc2Id: string): Promise<void> {
    if (!this.chatPanel || !this.worldData) return;

    // Find both characters in world data
    const chars = this.characters || this.worldData.characters || [];
    const char1 = (chars as any[]).find((c: any) => c.id === npc1Id);
    const char2 = (chars as any[]).find((c: any) => c.id === npc2Id);
    if (!char1 || !char2) return;

    const npc1Name = `${char1.firstName || ''} ${char1.lastName || ''}`.trim();
    const npc2Name = `${char2.firstName || ''} ${char2.lastName || ''}`.trim();

    // Pause ambient conversations
    this.ambientConversationManager?.pause();

    // Fetch truths
    let truths: any[] = [];
    try {
      truths = await this.dataSource.loadTruths(this.config.worldId);
    } catch {
      // continue without truths
    }

    // Use char1 as the "primary" character for the chat panel
    const character = { ...char1, worldId: this.config.worldId } as any;

    // Set target language
    this.chatPanel.setTargetLanguage(
      getTargetLanguage(this.worldData) || (this.worldData as any)?.targetLanguage || null
    );

    // Open chat panel with char1
    const npc1Instance = this.npcMeshes.get(npc1Id);
    this.chatPanel.show(character, truths, npc1Instance?.mesh);

    // Enter eavesdrop mode — hide input area, show system message
    this.chatPanel.setEavesdropMode(true);
    this.chatPanel.addSystemMessage(
      `You are eavesdropping on a conversation between ${npc1Name} and ${npc2Name}. Press G to stop listening.`
    );

    // Mark as eavesdrop conversation
    this.conversationNPCId = npc1Id;
    this.isEavesdropping = true;
    this.eavesdropNPC2Id = npc2Id;

    // Start the NPC-NPC conversation loop
    this.runEavesdropLoop(npc1Id, npc2Id, npc1Name, npc2Name);
  }

  /**
   * Run the eavesdrop conversation loop — fetches a rich AI-generated conversation
   * between two NPCs in the target language, then displays utterances with TTS audio.
   */
  private async runEavesdropLoop(
    npc1Id: string, npc2Id: string,
    _npc1Name: string, _npc2Name: string
  ): Promise<void> {
    try {
      // Try local AI first, then fall back to server
      let utterances: Array<{ speaker: string; text: string; gender?: string }> | null = null;

      if (LocalAIClient.isAvailable()) {
        const npc1Data = this.npcMeshes.get(npc1Id)?.characterData;
        const npc2Data = this.npcMeshes.get(npc2Id)?.characterData;
        if (npc1Data && npc2Data) {
          const result = await generateLocalNpcConversation(npc1Data, npc2Data);
          if (result) {
            utterances = result.exchanges.map(ex => ({
              speaker: ex.speakerName,
              text: ex.text,
              gender: (ex.speakerId === npc1Id ? npc1Data.gender : npc2Data.gender) ?? 'neutral',
            }));
          }
        }
      }

      if (!utterances) {
        const data = await this.dataSource.simulateRichConversation(this.config.worldId, npc1Id, npc2Id, 6);
        utterances = data?.utterances ?? null;
      }

      if (!utterances || !this.isEavesdropping) {
        this.chatPanel?.addSystemMessage('You could not make out what they were saying.');
        this.endEavesdrop();
        return;
      }

      if (!utterances || !Array.isArray(utterances) || utterances.length === 0) {
        this.chatPanel?.addSystemMessage('The conversation seems to have ended before you could listen in.');
        this.endEavesdrop();
        return;
      }

      // Display each utterance with TTS
      for (const utterance of utterances) {
        if (!this.isEavesdropping) break;

        const speakerName = utterance.speaker || 'Someone';
        const text = utterance.text || '...';
        const gender = utterance.gender || 'neutral';
        const voice = gender === 'female' ? 'Kore' : 'Charon';

        // Display in chat panel
        this.chatPanel?.addNPCMessage(`${speakerName}: ${text}`);

        // Play TTS audio
        try {
          const targetLanguage = getTargetLanguage(this.worldData) ||
            (this.worldData as any)?.targetLanguage || null;
          const audioBlob = await this.dataSource.textToSpeech(text, voice, gender, targetLanguage);

          if (audioBlob && this.isEavesdropping) {
            await new Promise<void>((resolve) => {
              const audio = new Audio(URL.createObjectURL(audioBlob));
              audio.onended = () => { URL.revokeObjectURL(audio.src); resolve(); };
              audio.onerror = () => { URL.revokeObjectURL(audio.src); resolve(); };
              audio.play().catch(() => resolve());
            });
          } else {
            // No TTS — just wait for readability
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch {
          // TTS failed — wait for readability
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Brief pause between utterances
        if (this.isEavesdropping) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      if (this.isEavesdropping) {
        this.chatPanel?.addSystemMessage('The conversation has ended.');
        this.endEavesdrop();
      }
    } catch (error) {
      console.error('[Eavesdrop] Error in conversation loop:', error);
      this.chatPanel?.addSystemMessage('You lost track of the conversation.');
      this.endEavesdrop();
    }
  }

  /**
   * End the eavesdrop session and clean up state.
   */
  private endEavesdrop(): void {
    this.isEavesdropping = false;
    this.eavesdropNPC2Id = undefined;
    this.chatPanel?.setEavesdropMode(false);
    this.ambientConversationManager?.endEavesdrop();
    this.ambientConversationManager?.resume();
    // Award XP for eavesdropping on NPC conversation
    this.gamificationTracker?.onEavesdropCompleted();
  }

  /**
   * Build a QuestOfferData for an NPC that can give quests.
   * Uses the DynamicQuestBoard's suggestion data or NPC occupation to create a contextual offer.
   */
  private buildQuestOfferForNPC(npcId: string, npcName: string): QuestOfferData | null {
    const character = (this.characters || this.worldData?.characters || []).find((c: any) => c.id === npcId);
    if (!character) return null;

    const occupation = (character as any).occupation || 'townsperson';
    const firstName = (character as any).firstName || npcName;
    const lastName = (character as any).lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return {
      npcId,
      npcName: fullName,
      questTitle: `A Task from ${fullName}`,
      questDescription: `${fullName} the ${occupation} has a task for you. Accept to begin a conversation and learn more about what they need.`,
      questType: 'conversation',
      difficulty: 'normal',
      objectives: 'Talk to the NPC to learn quest details',
      category: occupation,
    };
  }

  /**
   * Open the chat panel with quest offering context after the player accepts from the QuestOfferPanel.
   */
  private async openChatWithQuestOffer(offer: QuestOfferData): Promise<void> {
    if (!this.chatPanel || !this.worldData) return;

    // Select the NPC
    this.setSelectedNPC(offer.npcId);

    // Skip the quest offer panel on the next handleOpenChat call
    this.skipQuestOfferOnce = true;

    // Set quest offering context on the chat panel so the NPC will assign the quest
    this.chatPanel.setQuestOfferingContext({
      questTitle: offer.questTitle,
      questDescription: offer.questDescription,
      questType: offer.questType,
      difficulty: offer.difficulty,
      objectives: offer.objectives,
      category: offer.category,
    });

    // Open the regular chat flow
    await this.handleOpenChat();
  }

  /**
   * Create a quest immediately from a quest offer panel acceptance.
   * Returns the created quest data from the server.
   */
  private async createQuestFromOffer(offer: QuestOfferData): Promise<any> {
    const worldId = this.config.worldId;

    // Map difficulty to experience reward (same logic as BabylonChatPanel)
    let experienceReward = 50;
    const difficulty = (offer.difficulty || 'normal').toLowerCase();
    if (difficulty === 'beginner') experienceReward = 10;
    else if (difficulty === 'intermediate') experienceReward = 25;
    else if (difficulty === 'advanced') experienceReward = 50;
    else if (difficulty === 'easy') experienceReward = 50;
    else if (difficulty === 'normal') experienceReward = 100;
    else if (difficulty === 'hard') experienceReward = 200;
    else if (difficulty === 'legendary') experienceReward = 500;

    // Parse objectives from the offer string
    const parsedObjectives: { description: string; type?: string }[] = [];
    if (offer.objectives) {
      const parts = offer.objectives.split(/[;,]|\d+\.\s+/).filter(p => p.trim());
      for (const part of parts) {
        parsedObjectives.push({ description: part.trim() });
      }
    }

    const questData = {
      assignedTo: 'Player',
      assignedBy: offer.npcName,
      assignedByCharacterId: offer.npcId,
      title: offer.questTitle,
      description: offer.questDescription,
      questType: offer.questType || 'conversation',
      difficulty,
      targetLanguage: (this.worldData as any)?.targetLanguage || 'English',
      status: 'active',
      experienceReward,
      gameType: (this.worldData as any)?.gameType || (this.worldData as any)?.worldType || 'language-learning',
      objectives: parsedObjectives.length > 0 ? parsedObjectives : undefined,
      rewards: offer.rewards,
    };

    const response = await fetch(`/api/worlds/${worldId}/quests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questData),
    });

    if (!response.ok) {
      throw new Error(`Quest creation failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Handle quest assignment from the quest offer panel.
   * Same logic as the onQuestAssigned callback but called directly.
   */
  private async handleQuestAssignedFromPanel(questData: any): Promise<void> {
    // Enforce one-active-at-a-time: demote existing active quests
    const currentActive = (this.quests || []).filter((q: any) => q.status === 'active' && q.id !== questData.id);
    for (const q of currentActive) {
      try {
        await this.dataSource.updateQuest(q.id, { status: 'available' });
        q.status = 'available';
      } catch (e) {
        console.warn('[BabylonGame] Failed to demote quest:', q.id, e);
      }
    }

    // Add new quest to local list
    if (!this.quests) this.quests = [];
    if (!this.quests.find((q: any) => q.id === questData.id)) {
      this.quests.push(questData);
    }

    this.syncActiveQuestToHud();
    this.questTracker?.updateQuests(this.config.worldId);
    this.updateQuestIndicators();
    this.guiManager?.showToast({
      title: 'New Quest!',
      description: questData.title || 'Quest assigned',
    });
    this.eventBus.emit({ type: 'quest_accepted', questId: questData.id || '', questTitle: questData.title || '' });

    // Register listening comprehension quests when newly assigned
    if (questData.completionCriteria?.type === 'listening_comprehension' && this.listeningComprehensionManager) {
      this.listeningComprehensionManager.registerQuest(
        questData.id,
        questData.completionCriteria.storyNpcId || questData.assignedByCharacterId,
        questData.completionCriteria.answerNpcId,
        questData.completionCriteria.questions || [],
        (this.worldData as any)?.targetLanguage,
      );
    }
  }

  /**
   * Fetch quest guidance context for an NPC and apply it to the chat panel.
   * Runs async — the chat panel will update its system prompt when guidance arrives.
   */
  private async fetchQuestGuidance(npcId: string, worldId: string): Promise<void> {
    try {
      const guidance = await this.dataSource.getNpcQuestGuidance(worldId, npcId);
      if (guidance?.hasGuidance && guidance.systemPromptAddition) {
        this.chatPanel?.setQuestGuidancePrompt(guidance.systemPromptAddition);
        // If the conversation just started and hasn't had an NPC greeting yet,
        // trigger one now so the NPC initiates about the active quest
        this.chatPanel?.triggerQuestGuidanceGreeting();
      }
    } catch (e) {
      // Non-critical — NPC will work without quest guidance
    }
  }

  // ─── Shop / Mercantile Handlers ──────────────────────────────────────────

  private async handleOpenShop(merchantId: string, businessType?: string): Promise<void> {
    if (!this.shopPanel || !this.inventory) return;

    try {
      const merchantData = await this.dataSource.getMerchantInventory(
        this.config.worldId,
        merchantId,
        businessType || this.currentBuildingBusinessType || undefined
      );

      if (!merchantData) {
        this.guiManager?.showToast({
          title: 'Shop Unavailable',
          description: 'This merchant has nothing to sell right now.',
          duration: 2000,
        });
        return;
      }

      this.shopPanel.open(
        merchantData,
        this.inventory.getAllItems(),
        this.playerGold
      );
    } catch (error) {
      console.error('[BabylonGame] Failed to open shop:', error);
      this.guiManager?.showToast({
        title: 'Shop Error',
        description: 'Failed to load merchant inventory',
        variant: 'destructive',
        duration: 2000,
      });
    }
  }

  /**
   * Centralized item acquisition handler. ALL item acquisition paths (container,
   * shop, world pickup, gift, craft, quest reward) must funnel through this
   * method so that inventory, events, quest tracking, and notifications stay
   * consistent.
   *
   * Returns quest objective matches so callers can act on them (e.g. tagging
   * items as quest items).
   */
  handleItemAcquired(
    item: InventoryItem,
    source: ItemAcquisitionSource,
  ): import('./QuestCompletionEngine').CollectedItemMatch[] {
    // 1. Add to inventory
    this.inventory?.addItem(item);

    // 2. Emit item_collected event
    this.eventBus.emit({
      type: 'item_collected',
      itemId: item.id,
      itemName: item.name,
      quantity: item.quantity,
      source,
      taxonomy: {
        category: item.category,
        material: item.material,
        baseType: item.baseType,
        rarity: item.rarity,
        itemType: item.type,
      },
    });

    // 3. Track quest objectives
    const questMatches = this.questObjectManager?.trackCollectedItemByName(
      item.name, undefined, item.category,
    ) || [];

    // 4. Show pickup toast (with quest context if applicable)
    const collectedTranslation = getItemTranslation(item, getTargetLanguage(this.worldData));
    const targetWord = collectedTranslation?.targetWord;
    const displayName = (targetWord && isLanguageLearningWorld(this.worldData))
      ? targetWord
      : item.name;

    if (questMatches.length > 0) {
      const m = questMatches[0];
      const progressText = m.required > 1 ? ` (${m.current}/${m.required})` : '';
      if (m.completed) {
        // Prominent quest objective completion notification
        this.guiManager?.showToast({
          title: `\u2705 Quest objective completed!`,
          description: `Collect ${displayName}${progressText}`,
          duration: 4000,
        });
      } else {
        this.guiManager?.showToast({
          title: `${displayName} collected!${progressText}`,
          description: `Quest: ${m.objectiveDescription}`,
          duration: 3000,
        });
      }
    } else {
      const subtitle = (targetWord && isLanguageLearningWorld(this.worldData))
        ? `(${item.name}) — ${item.description || ''}`
        : (item.description || `Added to your inventory (${item.type})`);
      this.guiManager?.showToast({
        title: `Collected ${displayName}`,
        description: subtitle,
        duration: 2500,
      });
    }

    // 5. Show language learning overlay if applicable
    if (collectedTranslation?.targetWord) {
      this.showLanguageWordOverlay(
        collectedTranslation.targetWord,
        getTargetLanguage(this.worldData),
        item.name,
      );
    }

    return questMatches;
  }

  private handleShopBuy(transaction: ShopTransaction): void {
    const item: InventoryItem = {
      id: transaction.item.id,
      name: transaction.item.name,
      description: transaction.item.description,
      type: transaction.item.type as any,
      quantity: transaction.quantity,
      value: (transaction.item as any).buyPrice || transaction.totalPrice,
      sellValue: (transaction.item as any).sellPrice,
      tradeable: true,
    };

    // Deduct gold before centralized acquisition
    this.playerGold -= transaction.totalPrice;
    this.inventory?.setGold(this.playerGold);

    // Centralized item acquisition (inventory + event + quest + toast)
    this.handleItemAcquired(item, 'shop');

    // Additional shop-specific events
    this.eventBus.emit({
      type: 'item_purchased', itemId: item.id, itemName: item.name, quantity: transaction.quantity, totalPrice: transaction.totalPrice,
    });

    // Record transfer via API
    this.dataSource.transferItem(this.config.worldId, {
      toEntityId: 'player',
      itemId: item.id,
      itemName: item.name,
      itemDescription: item.description,
      itemType: item.type,
      quantity: transaction.quantity,
      transactionType: 'buy',
      totalPrice: transaction.totalPrice,
    }).catch(() => {});

    // Emit mercantile events for quest tracking
    const merchantId = transaction.merchantId || '';
    const merchantName = transaction.merchantName || '';
    const businessType = transaction.businessType;

    if (merchantId) {
      this.eventBus.emit({
        type: 'item_purchased', itemId: item.id, itemName: item.name,
        quantity: transaction.quantity, totalPrice: transaction.totalPrice,
        merchantId, merchantName, businessType,
      });

      // Food ordering at food-serving businesses
      const foodBusinessTypes = new Set(['Restaurant', 'Bar', 'Bakery', 'GroceryStore', 'Farm', 'Brewery']);
      const isFoodItem = item.type === 'food' || item.type === 'drink';
      if (isFoodItem && businessType && foodBusinessTypes.has(businessType)) {
        this.eventBus.emit({
          type: 'food_ordered', itemId: item.id, itemName: item.name,
          quantity: transaction.quantity, merchantId, merchantName, businessType,
        });
        this.questObjectManager?.trackFoodOrdered(item.name, merchantId, businessType);
      }

      // Price haggling: typed the item name in target language
      if (transaction.typedInTargetLanguage && transaction.typedWord && transaction.targetWord) {
        this.eventBus.emit({
          type: 'price_haggled', itemId: item.id, itemName: item.name,
          merchantId, merchantName,
          typedWord: transaction.typedWord, targetWord: transaction.targetWord,
        });
        this.questObjectManager?.trackPriceHaggled(item.name, merchantId, transaction.typedWord);
      }
    }
  }

  private handleShopSell(transaction: ShopTransaction): void {
    this.inventory?.removeItem(transaction.item.id, transaction.quantity);
    this.playerGold += transaction.totalPrice;
    this.inventory?.setGold(this.playerGold);

    this.eventBus.emit({ type: 'item_removed', itemId: transaction.item.id, itemName: transaction.item.name, quantity: transaction.quantity });
    this.eventBus.emit({ type: 'action_executed', actionName: 'sell_item', actorId: 'player', targetId: transaction.item.id, itemName: transaction.item.name, itemType: transaction.item.type, category: 'items', result: 'success' });

    // Record transfer via API
    this.dataSource.transferItem(this.config.worldId, {
      fromEntityId: 'player',
      itemId: transaction.item.id,
      itemName: transaction.item.name,
      itemDescription: transaction.item.description,
      itemType: transaction.item.type,
      quantity: transaction.quantity,
      transactionType: 'sell',
      totalPrice: transaction.totalPrice,
    }).catch(() => {});
  }

  // ─── Container Interaction Handlers ───────────────────────────────────────

  private handleContainerInteraction(target: import('./InteractionPromptSystem').InteractableTarget): void {
    if (!this.containerSpawnSystem || !this.containerPanel) return;

    const mesh = target.mesh as Mesh;
    const containerData = this.containerSpawnSystem.openContainerByMesh(mesh);
    if (!containerData) {
      // Already opened — re-open the panel with current state
      const containerId = target.containerId || mesh.metadata?.containerId;
      if (containerId) {
        const existing = this.containerSpawnSystem.getContainer(containerId);
        if (existing) {
          this.openContainerPanel(existing);
          return;
        }
      }
      this.guiManager?.showToast({ title: 'This container is empty', duration: 1500 });
      return;
    }

    this.openContainerPanel(containerData);
  }

  private openContainerPanel(containerData: import('./ContainerSpawnSystem').ContainerData): void {
    if (!this.containerPanel) return;

    const playerItems = this.inventory?.getAllItems() || [];
    this.containerPanel.open({
      container: {
        id: containerData.id,
        name: this.formatContainerName(containerData.type),
        containerType: containerData.type as any,
        items: containerData.items,
        capacity: containerData.items.length + 5,
        isLocked: false,
        buildingId: containerData.buildingId,
      },
      playerItems,
    });
  }

  private formatContainerName(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  private handleContainerTake(transaction: ContainerTransaction): void {
    const item = transaction.item;
    this.handleItemAcquired({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      quantity: transaction.quantity,
      icon: item.icon,
      value: item.value,
      rarity: item.rarity,
      category: item.category,
      translations: item.translations,
    }, 'container');
  }

  private handleContainerPlace(transaction: ContainerTransaction): void {
    this.inventory?.removeItem(transaction.item.id, transaction.quantity);
    this.eventBus.emit({ type: 'item_removed', itemId: transaction.item.id, itemName: transaction.item.name, quantity: transaction.quantity });
  }

  private handleContainerExamine(transaction: ContainerTransaction): void {
    const item = transaction.item;
    this.eventBus.emit({ type: 'object_examined', itemId: item.id, itemName: item.name });

    // Show language word overlay if translation exists
    const lang = getTargetLanguage(this.worldData);
    const translation = getItemTranslation(item, lang);
    if (translation?.targetWord) {
      this.showLanguageWordOverlay(translation.targetWord, lang, item.name);
    } else {
      // No translation — just show the item name as a toast
      this.guiManager?.showToast({
        title: item.name,
        description: item.description || `${item.category || item.type}`,
        duration: 3000,
      });
    }
  }

  // ─── Business Interaction Handlers ────────────────────────────────────────

  private async handleBusinessInteraction(placedNPC: import('./InteriorNPCManager').PlacedInteriorNPC): Promise<void> {
    if (!this.playerMesh) return;

    const playerStats = {
      gold: this.playerGold,
      health: this.playerHealth,
      maxHealth: 100,
      energy: this.playerEnergy,
      maxEnergy: INITIAL_ENERGY,
    };

    const interactions = this.businessInteractionSystem.getInteractionsForNPC(
      placedNPC,
      this.currentBuildingBusinessType,
      playerStats,
      { x: this.playerMesh.position.x, z: this.playerMesh.position.z }
    );

    if (interactions.length === 0) {
      // No business interactions — fall back to regular chat
      await this.handleOpenChat();
      return;
    }

    // If only chat is available, go straight to chat
    if (interactions.length === 1 && interactions[0].id === '__chat__') {
      await this.handleOpenChat();
      return;
    }

    // Convert business interactions to radial menu actions
    if (!this.radialMenu) {
      await this.handleOpenChat();
      return;
    }

    const npcName = placedNPC.characterData?.firstName || 'NPC';
    const actions = interactions.map((interaction) => ({
      id: interaction.id,
      name: `${interaction.icon} ${interaction.label}`,
      description: interaction.enabled
        ? interaction.description
        : interaction.disabledReason || interaction.description,
      category: 'social' as const,
      energyCost: 0,
      effects: [],
      conditions: [],
    }));

    this.radialMenu.show(
      actions,
      this.playerEnergy,
      async (actionId: string) => {
        if (actionId === '__chat__') {
          await this.handleOpenChat();
        } else if (actionId === '__browse_wares__') {
          await this.handleOpenShop(placedNPC.npcId);
        } else {
          await this.handleBusinessServiceAction(actionId, placedNPC);
        }
      },
      () => { /* no-op on close */ }
    );

    this.guiManager?.showToast({
      title: `${npcName}`,
      description: 'Choose an interaction',
      duration: 2000,
    });
  }

  private async handleBusinessServiceAction(
    serviceId: string,
    placedNPC: import('./InteriorNPCManager').PlacedInteriorNPC
  ): Promise<void> {
    if (!this.currentBuildingBusinessType) return;

    const services = this.businessInteractionSystem.getServicesForBusinessType(this.currentBuildingBusinessType);
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const playerStats = {
      gold: this.playerGold,
      health: this.playerHealth,
      maxHealth: 100,
      energy: this.playerEnergy,
      maxEnergy: INITIAL_ENERGY,
    };

    const result = this.businessInteractionSystem.executeService(service, playerStats);

    if (!result.success) {
      this.guiManager?.showToast({
        title: 'Service Unavailable',
        description: result.message,
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Apply effects
    for (const effect of result.effects) {
      switch (effect.type) {
        case 'gold':
          this.playerGold += effect.amount;
          this.inventory?.setGold(this.playerGold);
          break;
        case 'health':
          this.playerHealth = Math.min(100, Math.max(0, this.playerHealth + effect.amount));
          this.playerHealthBar?.updateHealth(this.playerHealth / 100);
          break;
        case 'energy':
          this.playerEnergy = Math.min(INITIAL_ENERGY, Math.max(0, this.playerEnergy + effect.amount));
          break;
      }
    }

    const npcName = placedNPC.characterData?.firstName || 'NPC';
    this.guiManager?.showToast({
      title: `${npcName}`,
      description: result.message,
      duration: 3000,
    });

    this.eventBus.emit({
      type: 'business_service_used',
      serviceId: service.id,
      serviceName: service.name,
      businessType: this.currentBuildingBusinessType,
      npcId: placedNPC.npcId,
      cost: service.cost,
    } as any);
  }

  private handleDropItem(item: InventoryItem): void {
    this.playInventoryActionAnimation('drop_item');
    this.inventory?.removeItem(item.id, 1);

    this.eventBus.emit({ type: 'item_dropped', itemId: item.id, itemName: item.name, quantity: 1 });
    this.eventBus.emit({ type: 'action_executed', actionName: 'drop_item', actorId: 'player', targetId: item.id, itemName: item.name, itemType: item.type, category: 'items', result: 'success' });

    this.dataSource.transferItem(this.config.worldId, {
      fromEntityId: 'player',
      itemId: item.id,
      itemName: item.name,
      itemType: item.type,
      quantity: 1,
      transactionType: 'discard',
      totalPrice: 0,
    }).catch(() => {});

    this.guiManager?.showToast({
      title: `Dropped ${item.name}`,
      description: 'Item removed from inventory',
      duration: 2000,
    });
  }

  /** Play a brief animation for an inventory action, then return to idle. */
  private playInventoryActionAnimation(actionName: string): void {
    const entry = getAnimationForAction(actionName);
    this.playActionAnimation('player', { clip: entry.animationClip, clipAlt: entry.animationFallback, loop: false, speed: 1.0 });
    // Return to idle after a short delay
    setTimeout(() => {
      this.playActionAnimation('player', { clip: 'Idle', loop: true, speed: 1.0 });
    }, 1500);
  }

  private handleUseItem(item: InventoryItem): void {
    // Document items: open the reading panel
    if (item.type === 'document' || item.type === 'collectible' && item.category === 'document') {
      const textId = (item as any).textId;
      if (textId) {
        this.openDocumentReader(textId);
      } else {
        this.guiManager?.showToast({
          title: `Read ${item.name}`,
          description: item.description || 'A document with no readable content.',
          duration: 2000,
        });
      }
      this.eventBus.emit({ type: 'item_used', itemId: item.id, itemName: item.name });
      this.eventBus.emit({ type: 'action_executed', actionName: 'use_item', actorId: 'player', targetId: item.id, itemName: item.name, itemType: item.type, category: 'items', result: 'success' });
      return;
    }

    // Quest and key items: emit event without consuming
    if (item.type === 'quest' || item.type === 'key') {
      this.eventBus.emit({ type: 'item_used', itemId: item.id, itemName: item.name });
      this.eventBus.emit({ type: 'action_executed', actionName: 'use_item', actorId: 'player', targetId: item.id, itemName: item.name, itemType: item.type, category: 'items', result: 'success' });
      this.guiManager?.showToast({
        title: `Used ${item.name}`,
        description: item.type === 'key' ? 'Key item activated' : 'Quest item used',
        duration: 2000,
      });
      return;
    }

    // Consumable, food, drink: apply effects and consume
    if (['consumable', 'food', 'drink'].includes(item.type)) {
      this.playInventoryActionAnimation('consume');
      this.inventory?.removeItem(item.id, 1);
      this.eventBus.emit({ type: 'item_used', itemId: item.id, itemName: item.name });

      const effects = item.effects || {};
      const descriptions: string[] = [];

      if (effects.health) {
        this.playerHealth = Math.min(100, this.playerHealth + effects.health);
        this.playerHealthBar?.updateHealth(this.playerHealth / 100);
        const entity = this.combatSystem?.getEntity('player');
        if (entity) entity.health = this.playerHealth;
        descriptions.push(`Health +${effects.health}`);
      }
      if (effects.energy) {
        this.playerEnergy = Math.min(100, this.playerEnergy + effects.energy);
        descriptions.push(`Energy +${effects.energy}`);
      }

      // Fallback if no effects defined
      if (descriptions.length === 0) {
        this.playerEnergy = Math.min(100, this.playerEnergy + 15);
        descriptions.push('Energy +15');
      }

      // Emit unified action_executed for quest tracking
      this.eventBus.emit({ type: 'action_executed', actionName: 'consume', actorId: 'player', targetId: item.id, itemName: item.name, itemType: item.type, category: 'items', result: 'success' });

      this.guiManager?.showToast({
        title: `Used ${item.name}`,
        description: descriptions.join(', '),
        duration: 2000,
      });
    }
  }

  private handleEquipItem(item: InventoryItem): void {
    if (!this.equipmentManager) return;
    this.playInventoryActionAnimation('equip_item');

    const result = this.equipmentManager.equip(item);
    if (result) {
      // If a previous item was in that slot, mark it unequipped
      if (result.previousItem) {
        result.previousItem.equipped = false;
      }
      item.equipped = true;

      this.inventory?.refreshItemList();
      this.inventory?.updateEquipmentDisplay(this.equipmentManager.getAllEquipped());

      this.eventBus.emit({
        type: 'item_equipped',
        itemId: item.id,
        itemName: item.name,
        slot: result.slot,
      });
      this.eventBus.emit({ type: 'action_executed', actionName: 'equip_item', actorId: 'player', targetId: item.id, itemName: item.name, itemType: item.type, category: 'items', result: 'success' });

      const entity = this.combatSystem?.getEntity('player');
      this.guiManager?.showToast({
        title: `Equipped ${item.name}`,
        description: `ATK: ${entity?.attackPower.toFixed(1)} | DEF: ${entity?.defense}`,
        duration: 2000,
      });
    }
  }

  private handleUnequipItem(item: InventoryItem): void {
    if (!this.equipmentManager) return;

    const slot = this.equipmentManager.findSlot(item);
    if (!slot) return;

    this.equipmentManager.unequip(slot);
    item.equipped = false;

    this.inventory?.refreshItemList();
    this.inventory?.updateEquipmentDisplay(this.equipmentManager.getAllEquipped());

    this.eventBus.emit({
      type: 'item_unequipped',
      itemId: item.id,
      itemName: item.name,
      slot,
    });

    const entity = this.combatSystem?.getEntity('player');
    this.guiManager?.showToast({
      title: `Unequipped ${item.name}`,
      description: `ATK: ${entity?.attackPower.toFixed(1)} | DEF: ${entity?.defense}`,
      duration: 2000,
    });
  }

  private handleConversationEnd(): void {
    // Release NPC from conversation and hide talking indicator
    if (this.conversationNPCId) {
      // Emit assessment event before clearing the NPC ID — this is a safety net
      // in case the chat panel's onConversationSummary callback doesn't fire
      // (e.g., no language tracker, or tracker returns null)
      if (this.assessmentActive) {
        this.eventBus.emit({
          type: 'assessment_conversation_completed',
          npcId: this.conversationNPCId,
        });
        // Safety net: also emit conversation_assessment_completed trigger
        this.eventBus.emit({
          type: 'conversation_assessment_completed',
          npcId: this.conversationNPCId,
          turnCount: 3, // fallback minimum
        });
      }

      const npcInstance = this.npcMeshes.get(this.conversationNPCId);
      if (npcInstance) {
        npcInstance.isInConversation = false;
        // Remove obstruction exclusion so normal camera obstruction handling resumes
        if (npcInstance.mesh && this.playerController) {
          this.playerController.removeObstructionExclusion(npcInstance.mesh);
        }
      }
      if (this.npcTalkingIndicator) {
        this.npcTalkingIndicator.hide(this.conversationNPCId);
      }
      this.conversationNPCId = null;

      // Resume ambient NPC conversations
      this.ambientConversationManager?.resume();
      this.npcInitiatedConversationController?.resume();
    }

    // Restore player mesh visibility
    if (this.playerMesh) {
      this.playerMesh.visibility = 1;
    }

    // Restore previous camera mode (do this BEFORE restarting the controller,
    // so limits are correct when the controller's _updateTargetValue runs)
    if (this.cameraManager && this.preConversationCameraMode && this.camera) {
      // Re-attach camera controls first so mode switch can take effect
      this.camera.attachControl(this.canvas, true);

      // Restore camera mode (this resets radius, beta, limits, and player visibility)
      this.cameraManager.setMode(this.preConversationCameraMode, false);
      this.preConversationCameraMode = null;

      // Re-target camera to player if available
      if (this.playerMesh) {
        this.camera.setTarget(this.playerMesh.position.add(new Vector3(0, 1.6, 0)));
      }
    }

    // Restart the player's CharacterController
    if (this.playerController) {
      this.playerController.start();
    }
  }

  private handleRadialMenu(): void {
    if (!this.radialMenu) return;

    if (this.radialMenu.isOpen()) {
      this.radialMenu.hide();
      return;
    }

    if (!this.selectedNPCId) {
      this.guiManager?.showToast({
        title: "No Actions Available",
        description: "Select an NPC first to see available actions",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    const actions = this.getAvailableActions(this.selectedNPCId);

    if (actions.length === 0) {
      this.guiManager?.showToast({
        title: "No Actions Available",
        description: "No social actions available for this NPC",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    this.radialMenu.show(
      actions,
      this.playerEnergy,
      (actionId: string) => this.handlePerformAction(actionId),
      () => {
        // No-op on close
      }
    );

    this.guiManager?.showToast({
      title: "Action Menu",
      description: "Select an action or press TAB/ESC to close",
      duration: 2000
    });
  }

  private async handleAttack(): Promise<void> {
    if (!this.combatSystem || !this.playerMesh) return;

    const playerEntity = this.combatSystem.getEntity('player');

    // If player is dead, respawn on F
    if (playerEntity && !playerEntity.isAlive) {
      this.combatSystem.revive('player', 1.0);
      this.playerHealth = 100;
      this.playerHealthBar?.updateHealth(1.0);
      this.combatTargetId = null;
      this.isInCombat = false;

      this.guiManager?.showToast({
        title: "Respawned!",
        description: "You have been restored to full health",
        duration: 2000
      });
      return;
    }

    if (!this.combatTargetId) {
      return;
    }

    const targetId = this.combatTargetId;

    // Rule check for combat
    if (this.ruleEnforcer) {
      const settlementInfo = this.ruleEnforcer.isInSettlement(this.playerMesh.position);
      const gameContext = {
        playerId: 'player',
        playerPosition: this.playerMesh.position,
        actionType: 'combat',
        inSettlement: settlementInfo.inSettlement,
        settlementId: settlementInfo.settlementId,
        playerInventory: this.inventory?.getAllItems() || [],
      };

      const combatAllowed = await this.ruleEnforcer.canPerformActionAsync('attack', 'combat', gameContext);

      if (!combatAllowed.allowed) {
        this.guiManager?.showToast({
          title: "Combat Restricted",
          description: combatAllowed.reason || "Combat is not allowed here",
          variant: "destructive",
          duration: 3000
        });

        if (combatAllowed.violatedRule) {
          this.ruleEnforcer.recordViolation(
            combatAllowed.violatedRule,
            gameContext,
            "Attempted combat in restricted area"
          );
        }
        return;
      }
    }

    // Range check
    if (!this.combatSystem.isInRange('player', targetId)) {
      this.guiManager?.showToast({
        title: "Out of Range",
        description: "Move closer to attack",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    // Cooldown check
    if (!this.combatSystem.canAttack('player')) {
      return; // Silently fail while on cooldown
    }

    this.combatSystem.attack('player', targetId);
  }

  private handleTargetEnemy(): void {
    if (!this.combatSystem) return;

    const nearestId = this.combatSystem.getNearestEnemy('player', false);

    if (nearestId) {
      this.combatTargetId = nearestId;
      this.setSelectedNPC(nearestId);
    }
  }

  private handleToggleVocabularyPanel(): void {
    if (!this.vocabularyPanel) return;

    // Refresh data from language tracker before showing
    const tracker = this.chatPanel?.getLanguageTracker();
    if (tracker) {
      const progress = tracker.getProgress();
      this.vocabularyPanel.updateData(
        tracker.getVocabulary(),
        tracker.getGrammarPatterns(),
        progress.overallFluency,
        progress.totalCorrectUsages,
        tracker.getWordsDueForReview()
      );
    }
    this.vocabularyPanel.toggle();
  }

  private handleToggleConversationHistory(): void {
    if (!this.conversationHistoryPanel) return;

    const tracker = this.chatPanel?.getLanguageTracker() || this.languageProgressTracker;
    if (tracker) {
      this.conversationHistoryPanel.updateData(tracker.getRecentConversations(20));
    }
    this.conversationHistoryPanel.toggle();
  }

  private refreshSkillTreeStats(): void {
    if (!this.skillTreePanel) return;

    const tracker = this.chatPanel?.getLanguageTracker() || this.languageProgressTracker;
    if (!tracker) return;

    const progress = tracker.getProgress();
    const conversations = progress.conversations || [];
    const avgTLPct = conversations.length > 0
      ? conversations.reduce((s, c) => s + c.targetLanguagePercentage, 0) / conversations.length
      : 0;
    const maxTurns = conversations.length > 0
      ? Math.max(...conversations.map(c => c.turns))
      : 0;

    this.skillTreePanel.updateStats({
      wordsLearned: progress.totalWordsLearned,
      wordsMastered: progress.vocabulary.filter(v => v.masteryLevel === 'mastered').length,
      conversations: progress.totalConversations,
      grammarPatterns: progress.grammarPatterns.length,
      avgTargetLanguagePct: avgTLPct,
      fluency: progress.overallFluency,
      maxSustainedTurns: maxTurns,
      questsCompleted: this.gamificationTracker?.getState().questsCompleted || 0,
    });
  }

  private handleToggleSkillTree(): void {
    if (!this.skillTreePanel) return;
    this.refreshSkillTreeStats();
    this.skillTreePanel.toggle();
  }

  /**
   * Fetch main quest journal data from the server.
   * Called on world load and after quest completions.
   */
  private async fetchMainQuestJournalData(): Promise<void> {
    // In exported games (file:// protocol or no auth token), build journal from local quest data
    if (typeof window !== 'undefined' && (window.location?.protocol === 'file:' || !this.config.authToken)) {
      const mainQuests = (this.quests || []).filter((q: any) => q.questType === 'main_quest');
      this.mainQuestJournalData = {
        currentChapterId: mainQuests[0]?.id ?? null,
        totalXPEarned: 0,
        chapters: mainQuests.map((q: any, i: number) => ({
          id: q.id, title: q.title, description: q.description,
          order: q.questChainOrder ?? i, status: i === 0 ? 'active' : 'locked',
          objectives: q.objectives || [],
        })),
        playerCefrLevel: this.playerCefrLevel,
        investigationBoard: null, caseNotes: [],
      };
      return;
    }
    try {
      const worldId = this.config.worldId;
      const playerId = this.config.userId || 'player';
      const data = await this.dataSource.getMainQuestJournal(worldId, playerId, this.playerCefrLevel);
      if (!data) return;
      this.mainQuestJournalData = {
        currentChapterId: data.state?.currentChapterId ?? null,
        totalXPEarned: data.state?.totalXPEarned ?? 0,
        chapters: data.chapters ?? [],
        playerCefrLevel: this.playerCefrLevel,
        investigationBoard: data.investigationBoard ?? null,
        caseNotes: data.state?.caseNotes ?? [],
        narrativeHistory: data.narrativeHistory ?? [],
      };
    } catch {
      // Non-critical — journal will show empty state
    }
  }

  /**
   * Fetch quest portfolio and learning journal data from the server.
   */
  private async fetchPortfolioData(): Promise<void> {
    if (typeof window !== 'undefined' && (window.location?.protocol === 'file:' || !this.config.authToken)) return;
    try {
      const worldId = this.config.worldId;
      const playerName = this.config.userId || 'Player';
      const data = await this.dataSource.getPortfolio(worldId, playerName);
      if (data) {
        this.portfolioData = data;
      }
    } catch {
      // Non-critical — portfolio will show empty state
    }
  }

  /**
   * Record a quest completion against the main quest progression.
   */
  private async recordMainQuestProgress(questType: string): Promise<void> {
    try {
      const worldId = this.config.worldId;
      const playerId = this.config.userId || 'player';
      const response = await this.dataSource.recordMainQuestCompletion(worldId, playerId, questType, this.playerCefrLevel);
      if (!response) return;
      const { result } = response;
      if (result?.chapterAdvance?.advanced && this.narrativeBeatDispatcher) {
        const advance = result.chapterAdvance;
        const outroBeat: PendingNarrativeBeat | null = advance.outroNarrative ? {
          id: `chapter_outro:${advance.completedChapterId || 'unknown'}`,
          type: 'chapter_outro',
          chapterId: advance.completedChapterId || 'unknown',
          chapterTitle: advance.completedChapterTitle || 'Chapter Complete',
          text: advance.outroNarrative,
        } : null;
        const introBeat: PendingNarrativeBeat | null = (advance.nextChapterTitle && advance.introNarrative) ? {
          id: `chapter_intro:${advance.nextChapterId || 'unknown'}`,
          type: 'chapter_intro',
          chapterId: advance.nextChapterId || 'unknown',
          chapterTitle: advance.nextChapterTitle,
          text: advance.introNarrative,
        } : null;
        this.narrativeBeatDispatcher.queueChapterTransition(outroBeat, introBeat);
      } else if (result?.chapterAdvance?.advanced) {
        // Fallback to toast if cutscene panel unavailable
        this.guiManager?.showToast({
          title: `Chapter Complete: ${result.chapterAdvance.completedChapterTitle}`,
          description: result.chapterAdvance.outroNarrative || '',
          duration: 6000,
        });
      }
      // Refresh journal and portfolio data
      await this.fetchMainQuestJournalData();
      this.fetchPortfolioData();

      // Reveal texts for the newly active chapter
      if (this.textSpawner && this.mainQuestJournalData) {
        const visibleIds = new Set<string>();
        if (this.mainQuestJournalData.currentChapterId) {
          visibleIds.add(`chapterId:${this.mainQuestJournalData.currentChapterId}`);
        }
        for (const ch of (this.mainQuestJournalData.chapters || [])) {
          if (ch.progress?.status === 'completed') {
            visibleIds.add(`chapterId:${ch.chapter?.id}`);
          }
        }
        this.textSpawner.updateVisibility(visibleIds);
      }
    } catch {
      // Non-critical
    }
  }

  private handleToggleNoticeBoard(): void {
    if (!this.noticeBoardPanel) return;

    const tracker = this.chatPanel?.getLanguageTracker();
    if (tracker) {
      this.noticeBoardPanel.setPlayerFluency(tracker.getFluency());
    }
    this.noticeBoardPanel.toggle();
  }

  private async handleToggleVR(): Promise<void> {
    if (!this.vrManager || !this.scene) return;

    // Initialize VR if not already available
    if (!this.vrManager.isVRAvailable()) {
      const success = await this.vrManager.initializeVR();
      if (success) {
        this.vrSupported = true;
        this.guiManager?.showToast({
          title: "VR Ready",
          description: "Press Shift+V again to enter VR mode",
          duration: 3000
        });
      } else {
        this.guiManager?.showToast({
          title: "VR Not Supported",
          description: "WebXR is not available on this device",
          variant: "destructive",
          duration: 3000
        });
      }
    } else {
      // Toggle VR session
      if (this.vrManager.isInVR()) {
        await this.vrManager.exitVR();
      } else {
        await this.vrManager.enterVR();
      }
    }
  }

  /**
   * Called when VR session starts — switch to VR mode
   */
  private onVRSessionStarted(): void {

    // Hide all 2D overlay UI
    this.guiManager?.setVisible(false);

    // Create VR interaction system
    if (this.scene && this.vrManager) {
      this.vrInteraction = new VRInteractionManager(this.scene, this.vrManager);

      // Register NPC meshes as interactables
      this.npcMeshes.forEach((instance, npcId) => {
        if (instance.mesh) {
          const npcInfo = this.npcInfos.find(n => n.id === npcId);
          this.vrInteraction?.registerInteractable(
            instance.mesh,
            'npc',
            npcId,
            npcInfo?.name
          );
        }
      });

      // Wire NPC selection via VR trigger
      this.vrInteraction.setOnSelect((interactable) => {
        if (interactable.type === 'npc') {
          this.setSelectedNPC(interactable.id);
        }
      });

      this.vrInteraction.enable();
    }

    // Create VR HUD
    if (this.scene && this.vrManager) {
      this.vrHUD = new VRHUDManager(this.scene, this.vrManager);
      this.vrHUD.show();

      // Attach wrist HUD to left controller if available
      const leftController = this.vrManager.getController('left');
      if (leftController?.mesh) {
        this.vrHUD.attachToController(leftController.mesh);
      }

      // Listen for controller added to attach wrist HUD
      this.vrManager.setOnControllerAdded((controller) => {
        if (controller.hand === 'left' && controller.mesh) {
          this.vrHUD?.attachToController(controller.mesh);
        }
      });

      this.vrHUD.showToast('VR Mode Activated', 3000);
    }

    // Create VR hand menu on left wrist
    if (this.scene) {
      this.vrHandMenu = new VRHandMenu(this.scene, 'main_hand_menu');

      // Attach to left controller
      const leftController = this.vrManager?.getController('left');
      if (leftController?.mesh && leftController.mesh instanceof Mesh) {
        this.vrHandMenu.attachToController(leftController.mesh);
      }

      this.vrHandMenu.show();
    }

    // NOTE: Locomotion is now wired in Phase 7 accessibility section below
    // (includes vignette comfort during movement)

    // --- Phase 4: VR Combat Adapter ---
    if (this.scene && this.vrManager && this.combatSystem) {
      this.vrCombatAdapter = new VRCombatAdapter(
        this.scene,
        this.vrManager,
        this.vrInteraction,
        this.combatSystem
      );

      // Wire combat sub-systems
      const style = this.combatSystem.getCombatStyle();
      this.vrCombatAdapter.setCombatSystems(
        style,
        this.rangedCombat,
        this.fightingCombat,
        this.turnBasedCombat
      );

      // Route damage events through existing handler
      this.vrCombatAdapter.setOnDamageDealt((result) => {
        this.handleDamageDealt(result);
      });

      this.vrCombatAdapter.enable();
    }

    // --- Phase 5: VR Spatial Audio ---
    this.audioManager?.enableVRSpatialAudio();

    // Bind NPC sounds to their meshes for spatial audio
    if (this.audioManager) {
      this.npcMeshes.forEach((instance, npcId) => {
        if (instance.mesh) {
          this.audioManager?.bindSoundToMesh(
            `audio_interact_${npcId}`,
            instance.mesh,
            'interact'
          );
        }
      });
    }

    // --- Phase 6: VR Chat Panel ---
    if (this.scene && this.vrManager) {
      this.vrChatPanel = new VRChatPanel(this.scene, this.vrManager);

      this.vrChatPanel.setOnQuestAssigned((questData) => {
        this.guiManager?.showToast({
          title: 'Quest Assigned',
          description: questData.name || 'New quest',
          duration: 3000,
        });
      });

      // Override NPC select to open VR chat instead of 2D chat
      this.vrInteraction?.setOnSelect((interactable) => {
        if (interactable.type === 'npc') {
          this.setSelectedNPC(interactable.id);
          this.openVRChat(interactable.id);
        }
      });
    }

    // --- Phase 6: VR Vocabulary Labels ---
    if (this.scene && this.vrManager) {
      this.vrVocabLabels = new VRVocabularyLabels(this.scene, this.vrManager);

      // Register NPC meshes with their names as vocabulary
      this.npcMeshes.forEach((instance, npcId) => {
        if (instance.mesh) {
          const npcInfo = this.npcInfos.find(n => n.id === npcId);
          if (npcInfo) {
            this.vrVocabLabels?.registerObject(npcId, instance.mesh, {
              nativeWord: npcInfo.name,
              targetWord: npcInfo.name, // Will be translated if target language is set
              mastery: 'new',
            });
          }
        }
      });

      // Wire click callback to add words to vocabulary
      this.vrVocabLabels.setOnLabelClicked((entry, _id) => {
        const tracker = this.chatPanel?.getLanguageTracker();
        if (tracker) {
          tracker.analyzeNPCResponse(entry.targetWord);
        }
        this.guiManager?.showToast({
          title: entry.targetWord,
          description: entry.nativeWord,
          duration: 2500,
        });
      });

      this.vrVocabLabels.enable();
    }

    // --- Phase 7: Hand Tracking ---
    if (this.scene && this.vrManager) {
      this.vrHandTracking = new VRHandTrackingManager(this.scene, this.vrManager);
      this.vrHandTracking.initialize().then((ok) => {
        if (ok) {
          this.vrHandTracking?.enable();

          // Palm-up gesture opens/closes hand menu
          this.vrHandTracking?.setOnPalmUp((hand) => {
            if (hand === 'left') {
              this.vrHandMenu?.toggle();
            }
          });

          // Pinch on right hand acts as trigger select
          this.vrHandTracking?.setOnPinchStart((hand) => {
            if (hand === 'right') {
              const hovered = this.vrInteraction?.getHoveredInteractable();
              if (hovered && hovered.type === 'npc') {
                this.setSelectedNPC(hovered.id);
                this.openVRChat(hovered.id);
              }
            }
          });

          // Grab gesture logs for future grab mechanics
          this.vrHandTracking?.setOnGrabStart((hand) => {
            this.vrManager?.triggerHapticPulse(hand, 0.2, 40);
          });

          this.vrHUD?.showToast('Hand tracking active', 2000);
        }
      });
    }

    // --- Phase 7: VR Accessibility ---
    if (this.scene && this.vrManager) {
      this.vrAccessibility = new VRAccessibilityManager(this.scene, this.vrManager);
      this.vrAccessibility.enable();

      // Show vignette during locomotion for comfort
      this.vrManager.setOnLocomotion((axes) => {
        if (!this.playerController) return;

        const deadzone = 0.15;
        const absX = Math.abs(axes.x);
        const absY = Math.abs(axes.y);
        const isMoving = absX > deadzone || absY > deadzone;

        if (isMoving) {
          this.vrAccessibility?.showVignette();
        } else {
          this.vrAccessibility?.hideVignette();
        }

        // Forward/backward
        if (absY > deadzone) {
          if (axes.y > 0) {
            this.playerController.walk(true);
            this.playerController.walkBack(false);
          } else {
            this.playerController.walkBack(true);
            this.playerController.walk(false);
          }
        } else {
          this.playerController.walk(false);
          this.playerController.walkBack(false);
        }

        // Strafe
        if (absX > deadzone) {
          if (axes.x > 0) {
            this.playerController.strafeRight(true);
            this.playerController.strafeLeft(false);
          } else {
            this.playerController.strafeLeft(true);
            this.playerController.strafeRight(false);
          }
        } else {
          this.playerController.strafeLeft(false);
          this.playerController.strafeRight(false);
        }
      });
    }
  }

  /**
   * Open VR world-space chat with an NPC
   */
  private async openVRChat(npcId: string): Promise<void> {
    if (!this.vrChatPanel || !this.worldData) return;

    const npcInfo = this.npcInfos.find(n => n.id === npcId);
    if (!npcInfo) return;

    try {
      const [character, truths] = await Promise.all([
        this.dataSource.loadCharacter(npcId),
        this.dataSource.loadTruths(this.config.worldId)
      ]);

      if (!character) return;

      const npcInstance = this.npcMeshes.get(npcId);
      const npcMesh = npcInstance?.mesh;

      this.vrChatPanel.show(character, truths, npcMesh);

      // Show toast in VR HUD
      this.vrHUD?.showToast(`Chatting with ${npcInfo.name}`, 2000);

      // Track NPC conversation for quests
      this.questObjectManager?.trackNPCConversation(npcId);
    } catch (error) {
      console.error('[VR] Failed to open VR chat:', error);
    }
  }

  /**
   * Called when VR session ends — restore desktop mode
   */
  private onVRSessionEnded(): void {

    // Clear locomotion input
    this.playerController?.idle();

    // Disable and dispose VR combat adapter
    this.vrCombatAdapter?.dispose();
    this.vrCombatAdapter = null;

    // Dispose VR chat panel
    this.vrChatPanel?.dispose();
    this.vrChatPanel = null;

    // Disable VR vocabulary labels
    this.vrVocabLabels?.dispose();
    this.vrVocabLabels = null;

    // Disable hand tracking
    this.vrHandTracking?.dispose();
    this.vrHandTracking = null;

    // Disable accessibility
    this.vrAccessibility?.dispose();
    this.vrAccessibility = null;

    // Disable VR spatial audio
    this.audioManager?.disableVRSpatialAudio();

    // Disable and dispose VR interaction
    this.vrInteraction?.dispose();
    this.vrInteraction = null;

    // Dispose VR HUD
    this.vrHUD?.dispose();
    this.vrHUD = null;

    // Dispose VR hand menu
    this.vrHandMenu?.dispose();
    this.vrHandMenu = null;

    // Restore all 2D overlay UI
    this.guiManager?.setVisible(true);

    this.guiManager?.showToast({
      title: 'VR Mode Deactivated',
      description: 'You have exited VR mode',
    });
  }

  private handleToggleFullscreen(): void {
    const elem: any = this.canvas.parentElement ?? this.canvas;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err: unknown) => {
          console.error("Failed to enter fullscreen", err);
        });
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch((err: unknown) => {
        console.error("Failed to exit fullscreen", err);
      });
    }
  }

  private handleToggleDebug(): void {
    if (!this.scene) return;

    const enabling = !isDebugLabelsEnabled();

    // Toggle perf overlay
    if (this._perfDiv) {
      this._perfDiv.style.display = enabling ? 'block' : 'none';
    }

    // Toggle debug labels on all procedural fallback meshes
    setDebugLabelsEnabled(enabling);

    // Toggle Babylon inspector
    if (enabling) {
      this.scene.debugLayer.show({ overlay: true });
    } else {
      this.scene.debugLayer.hide();
    }

    // Toggle debug hover tooltip system
    if (enabling) {
      this.enableDebugHover();
    } else {
      this.disableDebugHover();
    }
  }

  private static readonly TIME_SPEED_STEPS = [0.25, 0.5, 1, 2, 4, 8, 16];

  private handleTimeSpeedChange(delta: number): void {
    const steps = BabylonGame.TIME_SPEED_STEPS;
    const cur = this.gameTimeManager.timeScale;
    let idx = steps.findIndex(s => s >= cur);
    if (idx === -1) idx = steps.length - 1;
    idx = Math.max(0, Math.min(steps.length - 1, idx + delta));
    this.gameTimeManager.setTimeScale(steps[idx]);
  }

  private handleTimePauseToggle(): void {
    if (this.gameTimeManager.paused) {
      this.gameTimeManager.resume();
    } else {
      this.gameTimeManager.pause();
    }
  }

  private enableDebugHover(): void {
    if (!this.scene || this.debugHoverObserver) return;

    // Create tooltip element if needed
    const canvas = this.scene.getEngine().getRenderingCanvas();
    if (canvas?.parentElement) {
      createDebugHoverTooltip(canvas.parentElement);
    }

    // Allow pointer-move picking while debug is active — include
    // non-pickable meshes so trees, rocks, etc. can be inspected.
    this.scene.skipPointerMovePicking = false;
    this.scene.pointerMovePredicate = (mesh) =>
      mesh.isEnabled() && mesh.isVisible;

    this.debugHoverObserver = this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type !== PointerEventTypes.POINTERMOVE) return;
      const pickInfo = pointerInfo.pickInfo;
      if (!pickInfo?.hit || !pickInfo.pickedMesh) {
        hideDebugHoverTooltip();
        clearDebugHighlight();
        return;
      }

      // Walk up parent chain, but only while the current mesh has no
      // metadata AND no recognisable name. Stop as soon as we hit
      // something identifiable so we don't overshoot to a scene root.
      let mesh = pickInfo.pickedMesh;
      while (mesh.parent) {
        const md = mesh.metadata;
        if (md?.buildingId || md?.npcId || md?.objectRole || md?.interiorExit || md?.settlementId) break;
        // Also stop if the mesh itself has a meaningful name (tree, rock, etc.)
        if (mesh.name && buildDebugLabel(mesh)) break;
        mesh = mesh.parent as Mesh;
      }

      const label = buildDebugLabel(mesh);
      if (!label) {
        hideDebugHoverTooltip();
        clearDebugHighlight();
        return;
      }

      const evt = pointerInfo.event as PointerEvent;
      const cvs = this.scene!.getEngine().getRenderingCanvas();
      const rect = cvs?.getBoundingClientRect();
      const x = rect ? evt.clientX - rect.left : evt.clientX;
      const y = rect ? evt.clientY - rect.top : evt.clientY;

      showDebugHoverTooltip(x, y, label);
      applyDebugHighlight(mesh);
    });
  }

  private disableDebugHover(): void {
    if (this.scene && this.debugHoverObserver) {
      this.scene.onPointerObservable.remove(this.debugHoverObserver);
      this.debugHoverObserver = null;
      // Restore performance optimization
      this.scene.skipPointerMovePicking = true;
    }
    hideDebugHoverTooltip();
    clearDebugHighlight();
  }

  private getAvailableActions(npcId: string): Action[] {
    if (!this.actionManager || !this.worldData) return [];

    const context: ActionContext = {
      actor: this.characters[0]?.id || DEFAULT_PLAYER_ID,
      target: npcId,
      timestamp: Date.now(),
      playerEnergy: this.playerEnergy,
      playerPosition: this.playerMesh
        ? { x: this.playerMesh.position.x, y: this.playerMesh.position.z }
        : { x: 0, y: 0 }
    };

    const actions = this.actionManager.getSocialActionsForNPC(npcId, context);

    // Add "Browse Wares" action for merchant NPCs or business owner/employees inside buildings
    const npcInstance = this.npcMeshes.get(npcId);
    const shouldShowShop = npcInstance?.role === 'merchant' || (
      this.isInsideBuilding &&
      this.currentBuildingBusinessType &&
      this.businessInteractionSystem.isMercantileBusiness(this.currentBuildingBusinessType) &&
      this.interiorNPCManager?.getPlacedNPC(npcId)?.role !== 'visitor'
    );

    if (shouldShowShop) {
      actions.unshift({
        id: '__browse_wares__',
        name: 'Browse Wares',
        description: 'See what this merchant has for sale',
        category: 'social',
        energyCost: 0,
        effects: [],
        conditions: [],
      } as any);
    }

    // Add business service actions when inside a business building
    if (this.isInsideBuilding && this.currentBuildingBusinessType) {
      const placedNPC = this.interiorNPCManager?.getPlacedNPC(npcId);
      if (placedNPC) {
        const playerStats = {
          gold: this.playerGold,
          health: this.playerHealth,
          maxHealth: 100,
          energy: this.playerEnergy,
          maxEnergy: INITIAL_ENERGY,
        };
        const interactions = this.businessInteractionSystem.getInteractionsForNPC(
          placedNPC,
          this.currentBuildingBusinessType,
          playerStats
        );
        for (const interaction of interactions) {
          if (interaction.isShopAction || interaction.id === '__chat__') continue;
          actions.push({
            id: interaction.id,
            name: `${interaction.icon} ${interaction.label}`,
            description: interaction.description,
            category: 'social',
            energyCost: 0,
            effects: [],
            conditions: [],
          } as any);
        }
      }
    }

    return actions;
  }

  /**
   * Filter actions through Prolog prerequisites asynchronously.
   * Returns only actions whose Prolog prerequisites are met.
   */
  private async filterActionsByProlog(actions: Action[], npcId: string): Promise<Action[]> {
    if (!this.prologEngine || actions.length === 0) return actions;

    const actorId = this.characters[0]?.id || 'player';
    const results = await Promise.all(
      actions.map(async (action) => {
        // Skip non-game actions like __browse_wares__
        if (action.id.startsWith('__')) return { action, allowed: true };
        try {
          const result = await this.prologEngine!.canPerformAction(action.id, actorId, npcId);
          return { action, allowed: result.allowed };
        } catch {
          return { action, allowed: true }; // Graceful degradation
        }
      })
    );
    return results.filter(r => r.allowed).map(r => r.action);
  }

  private async handlePerformAction(actionId: string): Promise<void> {
    if (!this.selectedNPCId || !this.worldData) return;

    // Handle shop action specially
    if (actionId === '__browse_wares__') {
      await this.handleOpenShop(this.selectedNPCId);
      return;
    }

    // Handle business service actions
    if (this.isInsideBuilding && this.currentBuildingBusinessType) {
      const placedNPC = this.interiorNPCManager?.getPlacedNPC(this.selectedNPCId);
      if (placedNPC) {
        const services = this.businessInteractionSystem.getServicesForBusinessType(this.currentBuildingBusinessType);
        if (services.some(s => s.id === actionId)) {
          await this.handleBusinessServiceAction(actionId, placedNPC);
          return;
        }
      }
    }

    if (!this.actionManager) return;

    const npcId = this.selectedNPCId;

    const context: ActionContext = {
      actor: this.characters[0]?.id || DEFAULT_PLAYER_ID,
      target: npcId,
      timestamp: Date.now(),
      playerEnergy: this.playerEnergy,
      playerPosition: this.playerMesh
        ? { x: this.playerMesh.position.x, y: this.playerMesh.position.z }
        : { x: 0, y: 0 }
    };

    // Check rules before performing action
    if (this.ruleEnforcer) {
      const actionDefinition = this.findActionDefinition(actionId);
      const actionType = actionDefinition?.category || 'social';

      const playerMesh = this.playerMesh;
      const targetNPCInstance = this.npcMeshes.get(npcId);
      const settlementInfo = playerMesh
        ? this.ruleEnforcer.isInSettlement(playerMesh.position)
        : { inSettlement: false };

      const gameContext = {
        playerId: 'player',
        playerPosition: playerMesh?.position,
        playerEnergy: this.playerEnergy,
        targetNPCId: npcId,
        targetNPCPosition: targetNPCInstance?.mesh.position,
        actionId,
        actionType,
        inSettlement: settlementInfo.inSettlement,
        settlementId: settlementInfo.settlementId,
        nearNPC: true,
        playerInventory: this.inventory?.getAllItems() || [],
      };

      // Use async path that checks Prolog prerequisites first, then falls back to JS rules
      const ruleCheck = await this.ruleEnforcer.canPerformActionAsync(actionId, actionType, gameContext);

      if (!ruleCheck.allowed) {
        this.guiManager?.showToast({
          title: "Action Restricted",
          description: ruleCheck.reason || "This action is not allowed here",
          variant: "destructive",
          duration: 4000
        });

        if (ruleCheck.violatedRule) {
          this.ruleEnforcer.recordViolation(
            ruleCheck.violatedRule,
            gameContext,
            ruleCheck.reason || "Action attempted"
          );
        }

        return;
      }
    }

    this.actionInProgress = true;

    try {
      const result = await this.actionManager.performAction(actionId, context);
      const actionDefinition = this.findActionDefinition(actionId);
      const actionName = actionDefinition?.name || "Action";

      const targetNPC = this.characters?.find((npc) => npc.id === npcId) || this.worldData?.characters?.find((npc) => npc.id === npcId);
      const targetName = targetNPC
        ? `${targetNPC.firstName || ''} ${targetNPC.lastName || ''}`.trim() || "NPC"
        : "NPC";

      if (result.energyUsed) {
        this.playerEnergy = Math.max(0, this.playerEnergy - result.energyUsed);
        this.updatePlayerStatusUI();
      }

      // Process item and gold effects
      if (result.success && result.effects) {
        for (const effect of result.effects) {
          if (effect.type === 'gold' && typeof effect.value === 'number') {
            this.playerGold += effect.value;
            this.inventory?.setGold(this.playerGold);
          } else if (effect.type === 'item' && effect.value) {
            const { itemId, quantity } = effect.value;
            if (quantity > 0) {
              this.inventory?.addItem({
                id: itemId,
                name: itemId.replace(/_/g, ' '),
                type: 'collectible',
                quantity,
              });
            } else if (quantity < 0) {
              this.inventory?.removeItem(itemId, Math.abs(quantity));
            }
          }
        }
      }

      this.guiManager?.showToast({
        title: result.success ? `${actionName} succeeded` : `${actionName} failed`,
        description: result.narrativeText || result.message,
        variant: result.success ? "default" : "destructive"
      });

      // Play animation from action result
      if (result.success && result.animation) {
        this.playActionAnimation('player', result.animation);
      }

      // Record action in Prolog knowledge base (for quest tracking & NPC memory)
      if (result.success && this.prologEngine) {
        this.prologEngine.recordPlayerAction('player', npcId, actionId).catch(() => {});
        // Assert effects as Prolog facts
        if (result.effects) {
          for (const effect of result.effects) {
            if (effect.type === 'item' && effect.value?.itemId) {
              this.prologEngine.assertFact(
                `has_item(player, ${effect.value.itemId.toLowerCase().replace(/[^a-z0-9_]/g, '_')})`
              ).catch(() => {});
            }
          }
        }
      }

      // Wire give_gift actions to quest objective tracking and inventory
      if (result.success && actionId === 'give_gift' && this.questObjectManager && this.inventory) {
        const giftItem = this.findGiftItemForNpc(npcId);
        if (giftItem) {
          this.questObjectManager.trackGiftGiven(npcId, giftItem.name);
          this.inventory.removeItem(giftItem.id, 1);
          this.dataSource.transferItem(this.config.worldId, {
            fromEntityId: 'player',
            toEntityId: npcId,
            itemId: giftItem.id,
            itemName: giftItem.name,
            itemType: giftItem.type,
            quantity: 1,
            transactionType: 'give',
            totalPrice: 0,
          }).catch(() => {});
        } else {
          // No specific item — still track for quest objectives with empty item name
          this.questObjectManager.trackGiftGiven(npcId, '');
        }
      }

      // Wire romance actions through the RomanceSystem
      const ROMANCE_ACTION_IDS = ['compliment', 'flirt', 'give_gift', 'ask_on_date', 'confess_feelings', 'propose'];
      if (this.romanceSystem && ROMANCE_ACTION_IDS.includes(actionId)) {
        // Initialize relationship if needed
        const targetNPCData = this.characters?.find((c) => c.id === npcId) || this.worldData?.characters?.find((c) => c.id === npcId);
        const npcName = targetNPCData ? `${targetNPCData.firstName || ''} ${targetNPCData.lastName || ''}`.trim() : npcId;
        this.romanceSystem.initRelationship(npcId, npcName);

        const romanceResult = this.romanceSystem.performAction(npcId, actionId, targetNPCData?.personality);

        if (romanceResult.stageChanged && romanceResult.newStage) {
          this.guiManager?.showToast({
            title: `\u2764\uFE0F ${romanceResult.message}`,
            description: `Stage: ${romanceResult.newStage}`,
            duration: 4000,
          });
        } else if (romanceResult.success) {
          this.guiManager?.showToast({
            title: `\u2764\uFE0F ${npcName}`,
            description: romanceResult.message,
            duration: 2500,
          });
        } else {
          this.guiManager?.showToast({
            title: `\uD83D\uDC94 ${npcName}`,
            description: romanceResult.message,
            duration: 2500,
          });
        }
      }
    } catch (error) {
      console.error("Failed to perform action", error);
      this.guiManager?.showToast({
        title: "Action error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      this.actionInProgress = false;
    }
  }

  /**
   * Check deliver_item quest objectives when talking to an NPC.
   * If the player holds a required item, complete the objective and remove the item.
   */
  private checkDeliverItemObjectives(npcId: string): void {
    if (!this.questObjectManager || !this.inventory) return;

    const playerItems = this.inventory.getAllItems();
    if (playerItems.length === 0) return;

    const playerItemNames = playerItems.map(i => i.name);

    // Find deliver_item objectives that will match before tracking
    const quests = this.questObjectManager.getCompletionEngine().getQuests();
    const deliverableItems: string[] = [];
    for (const quest of quests) {
      for (const obj of quest.objectives || []) {
        if (obj.type !== 'deliver_item' || obj.completed) continue;
        const matchesNpc = obj.npcId === npcId || !obj.npcId;
        if (matchesNpc && obj.itemName) {
          const normalizedObjItem = obj.itemName.toLowerCase();
          const matchingPlayerItem = playerItems.find(
            i => i.name.toLowerCase() === normalizedObjItem
          );
          if (matchingPlayerItem) {
            deliverableItems.push(matchingPlayerItem.id);
          }
        }
      }
    }

    if (deliverableItems.length === 0) return;

    // Track the delivery (marks objectives complete)
    this.questObjectManager.trackItemDelivery(npcId, playerItemNames);

    // Remove delivered items from inventory and sync via API
    for (const itemId of deliverableItems) {
      const item = playerItems.find(i => i.id === itemId);
      this.inventory.removeItem(itemId, 1);
      this.dataSource.transferItem(this.config.worldId, {
        fromEntityId: 'player',
        toEntityId: npcId,
        itemId,
        itemName: item?.name || itemId,
        itemType: item?.type || 'quest',
        quantity: 1,
        transactionType: 'give',
        totalPrice: 0,
      }).catch(() => {});
    }

    this.guiManager?.showToast({
      title: 'Item Delivered',
      description: 'Quest item delivered successfully',
      duration: 2500,
    });
  }

  /**
   * Find the best item to give as a gift to an NPC.
   * Prefers items matching give_gift quest objectives, then any non-quest/key item.
   */
  private findGiftItemForNpc(npcId: string): InventoryItem | null {
    if (!this.inventory || !this.questObjectManager) return null;

    const playerItems = this.inventory.getAllItems();
    if (playerItems.length === 0) return null;

    // Check give_gift objectives for a specific item match
    const quests = this.questObjectManager.getCompletionEngine().getQuests();
    for (const quest of quests) {
      for (const obj of quest.objectives || []) {
        if (obj.type !== 'give_gift' || obj.completed) continue;
        if (obj.npcId && obj.npcId !== npcId) continue;
        if (obj.itemName) {
          const match = playerItems.find(
            i => i.name.toLowerCase() === obj.itemName!.toLowerCase()
          );
          if (match) return match;
        }
      }
    }

    // Fall back to first giftable item (not quest/key items)
    return playerItems.find(i => i.type !== 'quest' && i.type !== 'key') || null;
  }

  private findActionDefinition(actionId: string): Action | undefined {
    if (!this.worldData) return undefined;
    return [...this.worldData.actions, ...this.worldData.baseActions].find((action) => action.id === actionId);
  }

  private setSelectedNPC(npcId: string | null): void {
    this.selectedNPCId = npcId;

    if (!this.guiManager) return;

    // Update NPC list panel
    this.guiManager.updateNPCList(
      this.npcInfos.map((npc) => ({
        id: npc.id,
        name: npc.name,
        occupation: npc.occupation,
        disposition: npc.disposition,
        questGiver: npc.questGiver
      }))
    );

  }

  private initReputationManager(): void {
    if (!this.playthroughId || !this.config.authToken) return;
    this.reputationManager = new ReputationManager(
      this.playthroughId,
      this.config.authToken,
      this.eventBus,
    );
    // Load existing reputations from server
    this.reputationManager.loadAll();
    // Listen for reputation changes and show floating notifications
    this.reputationManager.onReputationChange((change) => {
      const color = change.delta > 0 ? 'green' : 'red';
      const sign = change.delta > 0 ? '+' : '';
      this.guiManager?.showToast({
        title: `${sign}${change.delta} Reputation`,
        description: `${change.entityName}: ${change.reason} (${change.newStanding})`,
        variant: change.delta < 0 ? 'destructive' : 'default',
        duration: 3000,
      });
      // Update the reputation panel in the HUD
      if (this.currentZone && change.entityId === this.currentZone.id) {
        const rep = this.reputationManager?.getReputation('settlement', change.entityId);
        if (rep) {
          this.currentReputation = rep;
          this.guiManager?.updateReputation({
            settlementName: rep.entityName,
            score: rep.score,
            standing: rep.standing,
            isBanned: rep.isBanned,
            violationCount: rep.violationCount,
            outstandingFines: rep.outstandingFines,
          });
        }
      }
      // Bridge positive reputation changes to quest objective tracking
      if (change.delta > 0) {
        // Try both entityId and entityName since quest objectives may use either as factionId
        this.questObjectManager?.trackReputationGain(change.entityId, change.delta);
        if (change.entityName !== change.entityId) {
          this.questObjectManager?.trackReputationGain(change.entityName, change.delta);
        }
      }
    });
  }

  private async handlePayFines(): Promise<void> {
    if (!this.currentZone || !this.playthroughId || !this.currentReputation) {
      this.guiManager?.showToast({
        title: "Cannot Pay Fines",
        description: "No active reputation record",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    const fineAmount = this.currentReputation.outstandingFines || 0;

    if (this.playerGold < fineAmount) {
      this.guiManager?.showToast({
        title: "Insufficient Gold",
        description: `You need ${fineAmount} gold but only have ${this.playerGold}`,
        variant: "destructive",
        duration: 4000
      });
      return;
    }

    try {
      const result = await this.dataSource.payFines(this.playthroughId, this.currentZone.id);

      if (result) {

        this.playerGold = Math.max(0, this.playerGold - fineAmount);
        this.updatePlayerStatusUI();

        this.currentReputation = {
          ...this.currentReputation,
          outstandingFines: result.outstandingFines || 0,
          score: result.newScore,
          standing: result.newStanding
        };

        this.guiManager?.updateReputation({
          settlementName: this.currentZone.name,
          score: result.newScore,
          standing: result.newStanding,
          isBanned: this.currentReputation.isBanned,
          violationCount: this.currentReputation.violationCount,
          outstandingFines: result.outstandingFines || 0
        });

        this.guiManager?.showToast({
          title: "Fines Paid",
          description: `Paid ${fineAmount} gold. Your reputation has improved slightly.`,
          duration: 4000
        });
      } else {
        console.error('Failed to pay fines');
        this.guiManager?.showToast({
          title: "Payment Failed",
          description: "Failed to pay fines",
          variant: "destructive",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error paying fines:', error);
      this.guiManager?.showToast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
        duration: 3000
      });
    }
  }

  private handleDamageDealt(result: DamageResult): void {
    // Emit combat_action event for quest tracking
    this.eventBus.emit({
      type: 'combat_action',
      actionType: 'attack',
      targetId: result.targetId,
    });

    if (this.combatUI && this.combatSystem) {
      const targetEntity = this.combatSystem.getEntity(result.targetId);
      if (targetEntity?.mesh) {
        this.combatUI.showDamageNumber(
          result.actualDamage,
          targetEntity.mesh.position,
          result.didCrit,
          result.didDodge
        );
      }

      const attackerName = result.targetId === 'player'
        ? (this.combatTargetId
            ? (this.combatSystem.getEntity(this.combatTargetId)?.name ?? 'Enemy')
            : 'Enemy')
        : 'You';

      this.combatUI.showDamageDealt(
        attackerName,
        result.targetName,
        result.actualDamage,
        result.didCrit,
        result.didDodge
      );
    }

    // Update health bars
    if (result.targetId === 'player') {
      this.playerHealth = result.remainingHealth;
      this.playerHealthBar?.updateHealth(result.remainingHealth / 100);
    } else {
      const healthBar = this.npcHealthBars.get(result.targetId);
      if (healthBar && this.combatSystem) {
        const entity = this.combatSystem.getEntity(result.targetId);
        if (entity) {
          healthBar.updateHealth(entity.health / entity.maxHealth);
        }
      }
    }

    if (result.wasKilled) {
      if (result.targetId === 'player') {
        this.guiManager?.showToast({
          title: "You were defeated!",
          description: "Press F to respawn",
          variant: "destructive",
          duration: 5000
        });
      } else {
        this.guiManager?.showToast({
          title: `${result.targetName} defeated!`,
          description: "Victory!",
          duration: 3000
        });
      }
    }
  }

  private handleEntityDeath(entityId: string, killedBy: string): void {
    if (this.combatUI && this.combatSystem) {
      const entity = this.combatSystem.getEntity(entityId);
      const killer = this.combatSystem.getEntity(killedBy);
      if (entity && killer) {
        this.combatUI.showEntityDeath(entity.name, killer.name);
      }
    }

    // Track enemy defeat for quest objectives and drop loot
    if (killedBy === 'player') {
      const entity = this.combatSystem?.getEntity(entityId);
      const enemyType = entity?.name || entityId;
      this.questObjectManager?.trackEnemyDefeat(enemyType);
      this.eventBus.emit({ type: 'enemy_defeated', entityId, enemyType });

      // Drop loot at enemy position
      this.dropLootAtEntity(entityId);
    }

    // Exit combat when enemy dies
    if (this.combatSystem && entityId === this.combatTargetId) {
      this.combatTargetId = null;
      this.isInCombat = false;
      this.combatSystem.exitCombat('player');
    }
  }

  /**
   * Drop loot items at an entity's position after it is defeated.
   * Generates loot from world items with lootWeight > 0, spawns pickup meshes.
   */
  private dropLootAtEntity(entityId: string): void {
    const npcInstance = this.npcMeshes.get(entityId);
    if (!npcInstance?.mesh || !this.scene) return;

    const dropPosition = npcInstance.mesh.position.clone();
    dropPosition.y += 0.5; // Slightly above ground

    // Get lootable items from world items
    const lootableItems = this.worldItems.filter((item: any) => item.lootWeight > 0);
    if (lootableItems.length === 0) return;

    // Calculate total weight for probability
    const totalWeight = lootableItems.reduce((sum: number, item: any) => sum + item.lootWeight, 0);

    // Roll for 1-3 loot drops
    const dropCount = Math.floor(Math.random() * 3) + 1;
    const droppedItems: InventoryItem[] = [];

    for (let i = 0; i < dropCount; i++) {
      // Weighted random selection
      let roll = Math.random() * totalWeight;
      for (const item of lootableItems) {
        roll -= item.lootWeight;
        if (roll <= 0) {
          // Drop chance based on rarity tags
          const dropChance = item.tags?.includes('loot:rare') ? 0.1
            : item.tags?.includes('loot:uncommon') ? 0.3
            : 0.5;
          if (Math.random() < dropChance) {
            droppedItems.push({
              id: `loot_${item.id || item.name}_${Date.now()}_${i}`,
              name: item.name,
              description: item.description || '',
              type: item.itemType || 'collectible',
              quantity: 1,
              value: item.value || 0,
              sellValue: item.sellValue || 0,
              tradeable: item.tradeable !== false,
              category: item.category || undefined,
              material: item.material || undefined,
              baseType: item.baseType || undefined,
              rarity: item.rarity || undefined,
            });
          }
          break;
        }
      }
    }

    // Also drop gold
    const goldDrop = Math.floor(Math.random() * 15) + 1;
    if (goldDrop > 0 && this.inventory) {
      this.inventory.addGold(goldDrop);
      this.playerGold += goldDrop;
    }

    if (droppedItems.length === 0 && goldDrop <= 0) return;

    // Funnel each dropped item through centralized handler
    for (const item of droppedItems) {
      this.handleItemAcquired(item, 'world');
    }
  }

  /**
   * Initialize the quest language feedback tracker for the first active
   * language-learning quest that has vocabulary or grammar objectives.
   */
  private initQuestLanguageFeedbackTracker(quests: any[]): void {
    if (!quests) return;

    const languageQuestTypes = ['vocabulary', 'grammar', 'conversation', 'translation'];
    const activeQuest = quests.find(
      (q: any) => q.status === 'active' && languageQuestTypes.includes(q.questType),
    );

    if (!activeQuest || !activeQuest.objectives?.length) {
      this.questLanguageFeedbackTracker = null;
      this.questNotificationManager?.hideLanguageProgress();
      return;
    }

    // Build vocab meanings from world language context if available
    const vocabMeanings: Record<string, string> = {};
    const lang = this.chatPanel?.getLanguageTracker();
    if (lang) {
      for (const entry of lang.getVocabulary()) {
        vocabMeanings[entry.word] = entry.meaning;
      }
    }

    this.questLanguageFeedbackTracker = new QuestLanguageFeedbackTracker(
      activeQuest.id,
      activeQuest.title,
      activeQuest.questType,
      activeQuest.objectives,
      vocabMeanings,
    );

    // Wire callbacks to update language bars in the Active Quest HUD
    this.questLanguageFeedbackTracker.setOnFeedbackUpdate((state) => {
      this.questNotificationManager?.updateLanguageProgress(state);
    });

    // Push initial state to the HUD
    this.questNotificationManager?.updateLanguageProgress(this.questLanguageFeedbackTracker.getState());
  }

  private async handleQuestObjectiveCompleted(questId: string, objectiveId: string, type: string): Promise<void> {
    try {
      // Sync engine objective states to overlay FIRST so dataSource.loadQuests merges them
      this.syncObjectiveStatesToOverlay();

      // Emit event for auto-save triggers and immediately persist quest progress
      this.eventBus?.emit({ type: 'quest_objective_completed', questId, objectiveId });
      this.worldStateManager?.saveQuestProgress().catch(() => {});

      const quests = await this.dataSource.loadQuests(this.config.worldId);
      const quest = quests.find((q: any) => q.id === questId);
      if (!quest) return;

      // Update this.quests so syncActiveQuestToHud and other reads see the change
      this.quests = quests;

      const updatedProgress = { ...quest.progress };

      if (type === 'collect') {
        updatedProgress.collectedItems = updatedProgress.collectedItems || [];
        if (!updatedProgress.collectedItems.includes(objectiveId)) {
          updatedProgress.collectedItems.push(objectiveId);
        }
      } else if (type === 'visit') {
        updatedProgress.visitedLocations = updatedProgress.visitedLocations || [];
        updatedProgress.visitedLocations.push(objectiveId);
      }

      // Aggregate quest metadata from objective states
      if (quest.objectives) {
        const objs = quest.objectives as any[];
        const photographed = objs.flatMap((o: any) => o.photographedSubjects || []);
        if (photographed.length > 0) updatedProgress.photosMatched = photographed;
        const texts = objs.flatMap((o: any) => o.textsRead || []);
        if (texts.length > 0) updatedProgress.textsRead = texts;
        const convCount = objs.filter((o: any) =>
          (o.type === 'talk_to_npc' || o.type === 'complete_conversation') && o.completed
        ).length;
        if (convCount > 0) updatedProgress.conversationsCompleted = convCount;
      }
      // Include clues found from clue store
      const clueCount = this.clueStore?.getClues()?.length ?? 0;
      if (clueCount > 0) updatedProgress.cluesFound = clueCount;

      const allObjectivesComplete = quest.objectives?.every((obj: any) => obj.completed);

      // Persist both progress and updated objectives to the data source
      await this.dataSource.updateQuest(questId, {
        progress: updatedProgress,
        objectives: quest.objectives,
      });

      this.questTracker?.updateQuests(this.config.worldId);

      // Refresh HUD task tracker with updated objectives
      this.syncActiveQuestToHud();

      // Sync quest state changes to Prolog knowledge base
      if (this.prologEngine) {
        const qId = questId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        if (type === 'collect') {
          this.prologEngine.assertFact(`quest_collected(player, ${qId}, ${objectiveId.toLowerCase().replace(/[^a-z0-9_]/g, '_')})`).catch(() => {});
        } else if (type === 'visit') {
          this.prologEngine.assertFact(`quest_visited(player, ${qId}, ${objectiveId.toLowerCase().replace(/[^a-z0-9_]/g, '_')})`).catch(() => {});
        }
        if (allObjectivesComplete) {
          this.prologEngine.assertFact(`quest_completed(player, ${qId})`).catch(() => {});
        }
      }

      // Apply quest rewards on completion and trigger celebration
      if (allObjectivesComplete) {
        this.applyQuestRewards(quest);
        // Mark in auto-detector to prevent duplicate celebration
        this.questAutoCompletionDetector?.markCompleted(questId);
        // Trigger full celebration ceremony + server completion sync
        this.handleAutoQuestCompletion({
          id: questId,
          worldId: quest.worldId || this.config.worldId,
          title: quest.title,
        });
        // Reveal clue if this is a reading quest about a main-quest text
        if (quest.tags?.includes('main-quest-clue') && quest.relatedTruthIds?.length) {
          const textId = quest.relatedTruthIds[0];
          const textObj = quest.objectives?.find((o: any) => o.textId === textId);
          const bookTitle = textObj?.itemName || quest.title.replace('Read & Understand: ', '');
          this.clueStore?.addTextClue(bookTitle, `Clue discovered by completing reading quest: ${quest.title}`, undefined);
        }
      }

      this.guiManager?.showToast({
        title: allObjectivesComplete ? 'Quest Completed!' : 'Objective Completed',
        description: allObjectivesComplete
          ? `You completed: ${quest.title}`
          : `Progress updated for: ${quest.title}`,
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to update quest progress:', error);
    }
  }

  /**
   * Register all loaded quests with the QuestCompletionEngine so that
   * event-driven objective tracking works (including the Arrival Assessment).
   */
  private registerQuestsWithCompletionEngine(quests: any[]): void {
    const engine = this.questObjectManager?.getCompletionEngine();
    if (!engine) return;

    for (const quest of quests) {
      if (!quest?.id) continue;
      // Avoid duplicates — check if already registered
      const existing = engine.getQuests().find((q: any) => q.id === quest.id);
      if (existing) continue;

      // Map quest objectives to CompletionObjective format
      const objectives = (quest.objectives || []).map((obj: any) => ({
        id: obj.id,
        questId: quest.id,
        type: obj.type || 'unknown',
        description: obj.description || '',
        completed: obj.completed || false,
        requiredCount: obj.requiredCount ?? 1,
        currentCount: obj.currentCount ?? 0,
        completionTrigger: obj.completionTrigger,
        minWordCount: obj.minWordCount,
        npcId: obj.npcId,
        order: obj.order,
        dependsOn: obj.dependsOn,
      }));

      engine.addQuest({ id: quest.id, objectives });

      // Spawn temporary hotspots for objectives that require them (staged, not yet active)
      if (this.questHotspotManager && quest.locationPosition) {
        for (const obj of (quest.objectives || [])) {
          if (obj.requiredHotspotType && !obj.completed) {
            const pos = quest.locationPosition;
            this.questHotspotManager.spawnHotspot(
              quest.id,
              obj.id,
              obj.requiredHotspotType,
              new Vector3(pos.x ?? 0, pos.y ?? 0, pos.z ?? 0),
              obj.description,
            );
          }
        }
      }
    }

    // Activate hotspots whose objectives are "up next" (not blocked)
    this.refreshQuestHotspotStates();
  }

  /**
   * Refresh which quest-spawned hotspots are active based on objective ordering.
   * Only the next incomplete, non-blocked objective's hotspot gets the "!" marker.
   */
  private refreshQuestHotspotStates(): void {
    const engine = this.questObjectManager?.getCompletionEngine();
    if (!engine || !this.questHotspotManager) return;

    this.questHotspotManager.refreshActiveState((questId, objectiveId) => {
      const quest = engine.getQuests().find((q: any) => q.id === questId);
      if (!quest) return false;
      const objective = (quest.objectives || []).find((o: any) => o.id === objectiveId);
      if (!objective || objective.completed) return false;
      return !engine.isObjectiveLocked(quest, objective);
    });
  }

  /**
   * Handle an assessment phase completing by marking the corresponding
   * quest objective as completed, persisting state, and asserting Prolog facts.
   */
  private async handleAssessmentPhaseCompleted(phaseId: string, score: number, maxScore: number): Promise<void> {
    try {
      // Find the Arrival Assessment quest
      const quest = this.quests.find((q: any) => isArrivalAssessmentQuest(q));
      if (!quest) {
        console.warn('[BabylonGame] No arrival assessment quest found for phase:', phaseId);
        return;
      }

      const objectives = (quest.objectives ?? []) as any[];
      const { objectives: updated, allComplete } = markPhaseObjectiveComplete(objectives, phaseId, score, maxScore);
      quest.objectives = updated;

      // Find the objective that was just completed to get its ID
      const completedObj = updated.find((o: any) => o.assessmentPhaseId === phaseId && o.completed);
      if (!completedObj) return;

      // Route to QuestCompletionEngine so UI updates
      const engine = this.questObjectManager?.getCompletionEngine();
      if (engine) {
        engine.trackEvent({
          type: 'assessment_phase_completed',
          phaseId,
          score,
          maxScore,
          questId: quest.id,
          objectiveId: completedObj.id,
        });
      }

      // Assert phase_score/3 Prolog predicate so assessment_complete/1 can evaluate
      if (this.prologEngine) {
        const questAtom = 'arrival_encounter';
        const phaseAtom = phaseId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        await this.prologEngine.assertFact(`phase_score(${questAtom}, ${phaseAtom}, ${score})`).catch(() => {});
      }

      // Persist updated objectives and progress to server
      const progress = { ...quest.progress, percentComplete: computeProgress(updated) };
      this.syncObjectiveStatesToOverlay();
      await this.dataSource.updateQuest(quest.id, { objectives: updated, progress });

      // Refresh HUD
      this.questTracker?.updateQuests(this.config.worldId);
      this.syncActiveQuestToHud();

      if (allComplete) {
        // Assert quest completion in Prolog
        if (this.prologEngine) {
          await this.prologEngine.assertFact('quest_completed(player, arrival_encounter)').catch(() => {});
        }

        // Mark quest as completed and award 50 XP via server endpoint
        this.applyQuestRewards(quest);
        this.questAutoCompletionDetector?.markCompleted(quest.id);
        this.handleAutoQuestCompletion({
          id: quest.id,
          worldId: quest.worldId || this.config.worldId,
          title: quest.title,
        });

        this.guiManager?.showToast({
          title: 'Assessment Complete!',
          description: `You completed: ${quest.title}`,
          duration: 4000,
        });
      } else {
        this.guiManager?.showToast({
          title: 'Phase Complete',
          description: `${phaseId.replace(/^arrival_/, '').replace(/_/g, ' ')} assessment finished`,
          duration: 3000,
        });
      }

      console.log(`[BabylonGame] Assessment phase ${phaseId} completed (score: ${score}/${maxScore}). All complete: ${allComplete}`);
    } catch (error) {
      console.error('[BabylonGame] Failed to handle assessment phase completion:', error);
    }
  }

  /**
   * Set a quest as the single active quest. Demotes the current active quest
   * to 'available' first, then promotes the selected one.
   */
  private async handleSetActiveQuest(questId: string): Promise<void> {
    try {
      const worldId = this.config.worldId;

      // Demote current active quest(s) to 'available'
      const currentActive = (this.quests || []).filter((q: any) => q.status === 'active');
      for (const q of currentActive) {
        await this.dataSource.updateQuest(q.id, { status: 'available' });
        q.status = 'available';
      }

      // Promote selected quest to 'active'
      await this.dataSource.updateQuest(questId, { status: 'active' });
      const promoted = (this.quests || []).find((q: any) => q.id === questId);
      if (promoted) promoted.status = 'active';

      // Refresh HUD and quest tracker
      this.syncActiveQuestToHud();
      this.questTracker?.updateQuests(worldId);
      this.updateQuestIndicators();

      this.guiManager?.showToast({
        title: 'Quest Activated',
        description: promoted?.title || 'Quest set as active',
      });
    } catch (error) {
      console.error('[BabylonGame] Failed to set active quest:', error);
    }
  }

  /** Push the current active quest (with full objectives) to the HUD task tracker. */
  private syncActiveQuestToHud(): void {
    const activeQuest = (this.quests || []).find((q: any) => q.status === 'active');
    if (activeQuest) {
      this.questNotificationManager?.setActiveQuest({
        id: activeQuest.id,
        title: activeQuest.title || activeQuest.name || activeQuest.id,
        questType: activeQuest.questType || '',
        objectives: (activeQuest.objectives || []).map((obj: any) => ({
          type: obj.type || '',
          description: obj.description || obj.type?.replace(/_/g, ' ') || '',
          completed: !!obj.completed,
          current: obj.current,
          required: obj.required,
          hint: obj.hint,
        })),
        progress: activeQuest.progress,
      });
    } else {
      this.questNotificationManager?.setActiveQuest(null);
    }
  }

  /**
   * Called by QuestAutoCompletionDetector when all objectives are detected complete.
   * Triggers full celebration ceremony and syncs completion to server.
   */
  private async handleAutoQuestCompletion(quest: { id: string; worldId: string; title: string }): Promise<void> {
    try {
      const questData = this.quests.find(q => q.id === quest.id);
      if (!questData) return;

      // Mark as completed in overlay (local state for immediate UI update)
      await this.dataSource.updateQuest(quest.id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      // QuestCompletionManager handles server call, celebration, and rewards
      if (this.questCompletionManager) {
        const goldReward = questData.rewards?.gold ?? questData.rewards?.goldReward ?? 0;
        await this.questCompletionManager.completeQuest({
          id: questData.id,
          worldId: questData.worldId || this.config.worldId,
          title: questData.title,
          questType: questData.questType,
          difficulty: questData.difficulty,
          experienceReward: questData.experienceReward || 0,
          goldReward,
          itemRewards: questData.itemRewards,
          skillRewards: questData.skillRewards,
          unlocks: questData.unlocks,
          questChainId: questData.questChainId,
          questChainOrder: questData.questChainOrder,
          assignedBy: questData.assignedBy,
        });
      }

      this.questTracker?.updateQuests(this.config.worldId);
      this.updateQuestIndicators();
    } catch (e) {
    }
  }

  private applyQuestRewards(quest: any): void {
    const rewards = quest.rewards || quest.completionCriteria?.rewards || {};

    // Gold reward
    const goldReward = rewards.gold || rewards.goldReward || 0;
    if (goldReward > 0) {
      this.playerGold += goldReward;
      this.inventory?.setGold(this.playerGold);
      this.guiManager?.showToast({
        title: `+${goldReward} Gold`,
        description: 'Quest reward',
        duration: 2000,
      });
    }

    // Item rewards — funnel through centralized handler
    const itemRewards = rewards.items || [];
    for (const rewardItem of itemRewards) {
      const item: InventoryItem = {
        id: rewardItem.id || `reward_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: rewardItem.name || 'Quest Reward',
        description: rewardItem.description,
        type: rewardItem.type || 'collectible',
        quantity: rewardItem.quantity || 1,
        value: rewardItem.value || 0,
        tradeable: true,
      };
      this.handleItemAcquired(item, 'quest_reward');
    }

    // XP reward (store for future use)
    const xpReward = rewards.xp || rewards.experience || 0;
    if (xpReward > 0) {
      this.guiManager?.showToast({
        title: `+${xpReward} XP`,
        description: 'Quest experience',
        duration: 2000,
      });
    }

    // Default gold reward if none specified
    if (goldReward === 0 && itemRewards.length === 0) {
      const defaultGold = quest.difficulty === 'hard' ? 50 : quest.difficulty === 'medium' ? 25 : 10;
      this.playerGold += defaultGold;
      this.inventory?.setGold(this.playerGold);
      this.guiManager?.showToast({
        title: `+${defaultGold} Gold`,
        description: 'Quest completion reward',
        duration: 2000,
      });
    }

    // Record quest reward transaction
    this.dataSource.transferItem(this.config.worldId, {
      toEntityId: 'player',
      itemId: `quest_reward_${quest.id}`,
      itemName: `${quest.title} Reward`,
      transactionType: 'quest_reward',
      totalPrice: goldReward,
    }).catch(() => {});
  }

  /**
   * Update quest indicators above NPCs based on current quest state
   */
  private async updateQuestIndicators(): Promise<void> {
    if (!this.questIndicatorManager) return;

    try {
      // Fetch current quests
      const quests = await this.dataSource.loadQuests(this.config.worldId);

      // Build NPC map from npcMeshes
      const npcMap = new Map<string, { mesh: Mesh; character: any }>();
      this.npcMeshes.forEach((npcInstance, npcId) => {
        if (npcInstance.mesh && npcInstance.characterData) {
          npcMap.set(npcId, {
            mesh: npcInstance.mesh,
            character: npcInstance.characterData
          });
        }
      });

      // Update NPC indicators
      this.questIndicatorManager.updateIndicators(npcMap, quests);

      // Update quest-related world object labels and interactivity
      if (this.questWorldObjectLinker && this.buildingData.size > 0) {
        // Build NPC-to-building map for objective matching
        const npcBuildingMap = new Map<string, string>();
        this.buildingData.forEach((data, buildingId) => {
          const meta = data.metadata;
          if (!meta) return;
          if (meta.ownerId) npcBuildingMap.set(meta.ownerId, buildingId);
          if (Array.isArray(meta.employees)) {
            meta.employees.forEach((e: any) => {
              const eid = typeof e === 'string' ? e : e?.id;
              if (eid) npcBuildingMap.set(eid, buildingId);
            });
          }
          if (Array.isArray(meta.occupants)) {
            meta.occupants.forEach((o: any) => {
              const oid = typeof o === 'string' ? o : o?.id;
              if (oid) npcBuildingMap.set(oid, buildingId);
            });
          }
        });
        this.questWorldObjectLinker.updateLinks(quests, this.buildingData, npcBuildingMap);

        // Pass world data to quest tracker for dynamic waypoint resolution
        if (this.questTracker) {
          // Collect NPC positions from spawned NPC meshes
          const npcPositions: Array<{ id: string; position: { x: number; y: number; z: number }; role?: string; name?: string }> = [];
          this.npcMeshes.forEach((instance) => {
            if (!instance?.mesh) return;
            const charId = instance.characterId || instance.mesh.metadata?.characterId;
            if (charId) {
              npcPositions.push({
                id: charId,
                position: { x: instance.mesh.position.x, y: instance.mesh.position.y, z: instance.mesh.position.z },
                role: instance.mesh.metadata?.occupation,
                name: instance.mesh.metadata?.name,
              });
            }
          });

          // Convert buildingData to the director's format (positions are already Vector3-compatible)
          const directorBuildingData = new Map<string, { position: { x: number; y: number; z: number }; metadata: any }>();
          this.buildingData.forEach((data, id) => {
            directorBuildingData.set(id, {
              position: { x: data.position.x, y: data.position.y, z: data.position.z },
              metadata: data.metadata,
            });
          });

          this.questTracker.setWorldData(directorBuildingData, npcBuildingMap, npcPositions);
        }
      }

      // Refresh quest hotspot active states (only show "!" for objectives that are up next)
      this.refreshQuestHotspotStates();
    } catch (error) {
      console.error('[BabylonGame] Failed to update quest indicators:', error);
    }
  }

  /**
   * Set the appropriate camera mode based on the world's game type
   */
  private setCameraModeForGameType(gameType: string): void {
    if (!this.cameraManager) return;

    // Map game types to camera modes
    const gameTypeToCameraMode: Record<string, CameraMode> = {
      // Third-person games
      'rpg': 'third_person',
      'action': 'third_person',
      'adventure': 'third_person',
      'survival': 'third_person',
      'sandbox': 'third_person',
      'language-learning': 'third_person',
      'educational': 'third_person',
      'simulation': 'third_person',
      
      // First-person games
      'shooter': 'first_person',
      
      // Isometric/top-down games
      'strategy': 'isometric',
      'city-building': 'top_down',
      'roguelike': 'top_down',
      
      // Side-scroll games
      'platformer': 'side_scroll',
      'fighting': 'fighting',
    };

    const cameraMode = gameTypeToCameraMode[gameType] || 'third_person';
    
    this.cameraManager.setMode(cameraMode, false);

    // Initialize appropriate combat variant based on game type
    this.initCombatVariantForGameType(gameType);

    // Initialize genre-specific UI
    this.initGenreUI(gameType);

    // Initialize genre-specific gameplay systems
    this.initGenreFeatures(gameType);
  }

  /**
   * Initialize genre-specific UI overlay based on game type
   */
  private initGenreUI(gameType: string): void {
    if (!this.guiManager || !this.scene) return;

    // Set game type on GUI manager for language-learning HUD visibility
    this.guiManager.setGameType(gameType);

    // Dispose previous genre UI
    this.genreUI?.dispose();
    this.genreUI = null;

    const genreConfig = getGenreConfig(gameType);

    const uiConfig: GenreUIConfig = {
      layout: genreConfig.uiLayout,
      features: genreConfig.features,
      showMinimap: genreConfig.showMinimap,
      showHealthBar: genreConfig.showHealthBar,
      showStaminaBar: genreConfig.showStaminaBar,
      showAmmoCounter: genreConfig.showAmmoCounter,
      showCompass: genreConfig.showCompass,
    };

    this.genreUI = new GenreUIManager(this.scene, this.guiManager.advancedTexture, uiConfig);

    // Wire up ammo updates for ranged combat
    if (this.rangedCombat && this.genreUI) {
      this.rangedCombat.setOnAmmoChanged((current, max, total) => {
        this.genreUI?.updateAmmo(current, max, total);
      });
      this.rangedCombat.setOnReloadStart(() => {
        this.genreUI?.showReloading(true);
      });
      this.rangedCombat.setOnReloadEnd(() => {
        this.genreUI?.showReloading(false);
      });
    }

    // Wire up fighting UI updates
    if (this.fightingCombat && this.genreUI) {
      this.fightingCombat.setOnComboHit((attackerId, combo) => {
        this.genreUI?.showCombo(combo.hits.length, combo.totalDamage);
      });
      this.fightingCombat.setOnSpecialMeterChanged((entityId, meter) => {
        if (entityId === 'player') {
          this.genreUI?.updateSpecialMeter(meter);
        }
      });
    }

  }

  /**
   * Initialize genre-specific gameplay systems (resources, crafting, building, survival)
   */
  private initGenreFeatures(gameType: string): void {
    if (!this.scene) return;

    const genreConfig = getGenreConfig(gameType);
    const features = genreConfig.features;

    // Dispose previous systems
    this.resourceSystem?.dispose();
    this.resourceSystem = null;
    this.craftingSystem?.dispose();
    this.craftingSystem = null;
    this.buildingSystem?.dispose();
    this.buildingSystem = null;
    this.survivalNeeds?.dispose();
    this.survivalNeeds = null;

    // Resource system - needed by crafting and building
    if (features.resources || features.crafting || features.building) {
      this.resourceSystem = new ResourceSystem(this.scene);
      this.resourceSystem.setOnResourceGathered((type, amount, total) => {
        this.guiManager?.showToast({
          title: `+${amount} ${type}`,
          description: `Total: ${total}`,
          duration: 2000,
        });
        // Update RTS HUD if active
        this.genreUI?.updateResource(type, type.charAt(0).toUpperCase() + type.slice(1), String(total));
      });
    }

    // Crafting system
    if (features.crafting && this.resourceSystem) {
      this.craftingSystem = new CraftingSystem(this.resourceSystem);
      this.craftingSystem.setOnCraftComplete((craftedItem) => {
        // Convert CraftedItem to InventoryItem for centralized handler
        const invItem: InventoryItem = {
          id: craftedItem.id,
          name: craftedItem.name,
          type: 'material',
          quantity: craftedItem.quantity || 1,
          category: craftedItem.category,
        };
        this.handleItemAcquired(invItem, 'craft');

        // Crafting-specific quest tracking and event
        this.questObjectManager?.trackItemCrafted(craftedItem.name);
        this.eventBus.emit({
          type: 'item_crafted', itemId: craftedItem.name, itemName: craftedItem.name, quantity: craftedItem.quantity || 1,
          taxonomy: { category: craftedItem.category, itemType: craftedItem.category },
        });
      });
      this.craftingSystem.setOnCraftFailed((_recipeId, reason) => {
        this.guiManager?.showToast({
          title: 'Crafting Failed',
          description: reason,
          variant: 'destructive',
          duration: 3000,
        });
      });
    }

    // Building system
    if (features.building && this.resourceSystem) {
      this.buildingSystem = new BuildingPlacementSystem(this.scene, this.resourceSystem);
      this.buildingSystem.setHeightSampler((x, z) => this.projectToGround(x, z).y);
      this.buildingSystem.setOnBuildingComplete((building) => {
        this.guiManager?.showToast({
          title: `${building.name} Complete`,
          description: 'Construction finished',
          duration: 3000,
        });
      });
    }

    // Survival needs - enable for genres that have survival mechanics
    const survivalGenres = ['survival', 'sandbox'];
    const hasSurvivalNeeds = survivalGenres.includes(gameType);
    if (hasSurvivalNeeds) {
      const enabledNeeds: ('hunger' | 'thirst' | 'temperature' | 'stamina' | 'sleep')[] = ['hunger', 'thirst', 'stamina'];
      this.survivalNeeds = new SurvivalNeedsSystem(enabledNeeds as any);
      this.survivalNeeds.setOnSurvivalEvent((event) => {
        if (event.type === 'need_critical' || event.type === 'need_warning') {
          this.guiManager?.showToast({
            title: event.message,
            variant: event.type === 'need_critical' ? 'destructive' : 'default',
            duration: 4000,
          });
        }
      });
      this.survivalNeeds.setOnDamageFromNeed((_needType, damage) => {
        if (this.combatSystem) {
          const player = this.combatSystem.getEntity('player');
          if (player) {
            const newHealth = Math.max(0, player.health - damage);
            this.combatSystem.setHealth('player', newHealth);
          }
        }
      });
    }

    // Roguelike systems
    this.runManager?.dispose();
    this.runManager = null;
    this.dungeonGenerator?.dispose();
    this.dungeonGenerator = null;

    if (gameType === 'roguelike') {
      this.runManager = new RunManager();
      this.runManager.setOnRunEnd((stats, _meta) => {
        this.guiManager?.showToast({
          title: stats.deathCause ? 'Run Over' : 'Victory!',
          description: `Score: ${stats.score} | Floors: ${stats.floorsCleared}`,
          duration: 5000,
        });
      });
      this.runManager.setOnFloorCleared((floor) => {
        this.guiManager?.showToast({
          title: `Floor ${floor.floorNumber} Cleared`,
          description: `${floor.enemyCount} enemies defeated`,
          duration: 3000,
        });
      });

      this.dungeonGenerator = new ProceduralDungeonGenerator(this.scene);
    }
  }

  /**
   * Initialize the appropriate combat variant system based on game type
   */
  private initCombatVariantForGameType(gameType: string): void {
    if (!this.combatSystem || !this.scene) return;

    // Map game types to combat styles
    const gameTypeToCombatStyle: Record<string, CombatStyle> = {
      'rpg': 'melee',
      'action': 'melee',
      'adventure': 'melee',
      'survival': 'hybrid',
      'sandbox': 'hybrid',
      'shooter': 'ranged',
      'strategy': 'none',
      'city-building': 'none',
      'platformer': 'melee',
      'fighting': 'fighting',
      'roguelike': 'hybrid',
      'puzzle': 'none',
      'language-learning': 'none',
      'educational': 'none',
      'simulation': 'none',
    };

    const combatStyle = gameTypeToCombatStyle[gameType] || 'melee';
    this.combatSystem.setCombatStyle(combatStyle);

    // Initialize specialized combat systems
    switch (combatStyle) {
      case 'ranged':
      case 'hybrid':
        this.rangedCombat = new RangedCombatSystem(this.scene, this.combatSystem);
        this.rangedCombat.setOnHit((result) => this.handleDamageDealt(result));
        break;
      case 'fighting':
        this.fightingCombat = new FightingCombatSystem(this.scene, this.combatSystem);
        this.fightingCombat.setOnAttackLanded((result) => this.handleDamageDealt(result));
        break;
      case 'turn_based':
        this.turnBasedCombat = new TurnBasedCombatSystem(this.scene, this.combatSystem);
        this.turnBasedCombat.setOnCombatEnd((victory) => {
        });
        break;
    }
  }

  private disposeKeyboardHandlers(): void {
    if (this.keyboardHandler) {
      window.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
    if (this.keyUpHandler) {
      window.removeEventListener('keyup', this.keyUpHandler);
      this.keyUpHandler = null;
    }
  }

  private disposePointerHandlers(): void {
    if (this.scene && this.pointerObserver) {
      this.scene.onPointerObservable.remove(this.pointerObserver);
      this.pointerObserver = null;
    }
    this.disableDebugHover();
    disposeDebugHoverTooltip();
  }

  private disposeUpdateLoop(): void {
    if (this.scene && this.renderObserver) {
      this.scene.onBeforeRenderObservable.remove(this.renderObserver);
      this.renderObserver = null;
    }
    if (this.npcBehaviorInterval !== null) {
      window.clearInterval(this.npcBehaviorInterval);
      this.npcBehaviorInterval = null;
    }
    // Phase 7: Clean up batched NPC behavior observer
    if (this.scene && this._npcBehaviorObserver) {
      this.scene.onBeforeRenderObservable.remove(this._npcBehaviorObserver);
      this._npcBehaviorObserver = null;
    }
    // Clean up weather system
    if (this.weatherSystem) {
      this.weatherSystem.dispose();
      this.weatherSystem = null;
    }
    // Clean up NPC simulation LOD
    if (this.npcSimulationLOD) {
      this.npcSimulationLOD.dispose();
      this.npcSimulationLOD = null;
    }
    // Clean up animal NPC system
    if (this.animalNPCSystem) {
      this.animalNPCSystem.dispose();
      this.animalNPCSystem = null;
    }
    // Clean up NPC accessory system
    if (this.npcAccessorySystem) {
      this.npcAccessorySystem.dispose();
      this.npcAccessorySystem = null;
    }
    // Clean up unified interaction prompt
    if (this.interactionPrompt) {
      this.interactionPrompt.dispose();
      this.interactionPrompt = null;
    }
    // Clean up furniture interaction manager
    if (this.furnitureInteractionManager) {
      this.furnitureInteractionManager.dispose();
      this.furnitureInteractionManager = null;
    }
    // Clean up player action system
    if (this.playerActionSystem) {
      this.playerActionSystem.dispose();
      this.playerActionSystem = null;
    }
    // Clean up world object action manager
    if (this.worldObjectActionManager) {
      this.worldObjectActionManager.dispose();
      this.worldObjectActionManager = null;
    }
  }

  private disposeAudio(): void {
    this.zoneEnterSound?.dispose();
    this.zoneExitSound?.dispose();
    this.violationSound?.dispose();
    this.zoneEnterSound = null;
    this.zoneExitSound = null;
    this.violationSound = null;
  }

  private disposeVR(): void {
    this.vrCombatAdapter?.dispose();
    this.vrCombatAdapter = null;
    this.vrChatPanel?.dispose();
    this.vrChatPanel = null;
    this.vrVocabLabels?.dispose();
    this.vrVocabLabels = null;
    this.vrHandTracking?.dispose();
    this.vrHandTracking = null;
    this.vrAccessibility?.dispose();
    this.vrAccessibility = null;
    this.vrInteraction?.dispose();
    this.vrInteraction = null;
    this.vrHUD?.dispose();
    this.vrHUD = null;
    this.vrHandMenu?.dispose();
    this.vrHandMenu = null;
    this.vrUIPanels.forEach(p => p.dispose());
    this.vrUIPanels.clear();
    this.audioManager?.disableVRSpatialAudio();
    this.vrManager?.dispose();
    this.vrManager = null;
  }

  private disposeCombat(): void {
    this.rangedCombat?.dispose();
    this.rangedCombat = null;
    this.fightingCombat?.dispose();
    this.fightingCombat = null;
    this.turnBasedCombat?.dispose();
    this.turnBasedCombat = null;
    this.genreUI?.dispose();
    this.genreUI = null;
    this.survivalNeeds?.dispose();
    this.survivalNeeds = null;
    this.buildingSystem?.dispose();
    this.buildingSystem = null;
    this.craftingSystem?.dispose();
    this.craftingSystem = null;
    this.runManager?.dispose();
    this.runManager = null;
    this.dungeonGenerator?.dispose();
    this.dungeonGenerator = null;
    this.resourceSystem?.dispose();
    this.resourceSystem = null;
    this.combatSystem?.dispose();
    this.combatSystem = null;
    this.combatUI?.dispose();
    this.combatUI = null;
  }

  private disposeNPCs(): void {
    this.npcMeshes.forEach((instance) => {
      instance.controller?.stop();
      instance.questMarker?.dispose();
      instance.billboardLOD?.dispose();
      instance.mesh?.dispose();
    });
    this.npcMeshes.clear();
    this.npcInfos = [];

    this.npcHealthBars.forEach((bar) => bar.dispose());
    this.npcHealthBars.clear();

    // Dispose NPC model instancer (templates + shared materials)
    this.npcModelInstancer?.dispose();
    this.npcModelInstancer = null;
    // Dispose NPC modular assembler (cached materials)
    this.npcModularAssembler?.dispose();
    this.npcModularAssembler = null;
    // Dispose Quaternius NPC loader (cached templates)
    this.quaterniusNPCLoader?.dispose();
    this.quaterniusNPCLoader = null;
  }

  private disposePlayer(): void {
    this.vehicleSystem?.dispose();
    this.vehicleSystem = null;

    this.playerController?.stop();
    this.playerController = null;

    this.playerHealthBar?.dispose();
    this.playerHealthBar = null;

    this.playerMesh?.dispose();
    this.playerMesh = null;
  }

  private disposeWorld(): void {
    this.settlementSceneManager?.dispose();
    this.settlementSceneManager = null;
    this.chunkManager?.dispose();
    this.chunkManager = null;

    this.settlementMeshes.forEach((mesh) => mesh.dispose());
    this.settlementMeshes.clear();

    this.settlementRoadMeshes.forEach((mesh) => mesh.dispose());
    this.settlementRoadMeshes = [];

    this.worldPropMeshes.forEach((mesh) => mesh.dispose());
    this.worldPropMeshes = [];

    this.zoneBoundaryMeshes.forEach(({ boundary, particles }) => {
      particles?.dispose();
      boundary?.dispose();
    });
    this.zoneBoundaryMeshes.clear();

    this.buildingData.forEach(({ mesh }) => mesh.dispose());
    this.buildingData.clear();
    this.settlementStats.clear();

    // Dispose building entry system, interior NPCs, and interiors
    this.interiorNPCManager?.dispose();
    this.interiorNPCManager = null;
    this.businessBehaviorSystem?.dispose();
    this.businessBehaviorSystem = null;
    this.buildingEntrySystem?.dispose();
    this.buildingEntrySystem = null;
    this.interiorItemManager?.dispose();
    this.interiorItemManager = null;
    this.bookSpawnManager?.dispose();
    this.bookSpawnManager = null;
    this.exteriorItemManager?.dispose();
    this.exteriorItemManager = null;
    this.interiorGenerator?.dispose();
    this.interiorSceneManager?.dispose();
    this.interiorSceneManager = null;
    this.interiorPlayerController?.stop();
    this.interiorPlayerController = null;
    this.interiorPlayerMesh?.dispose();
    this.interiorPlayerMesh = null;
    this.interiorCamera?.dispose();
    this.interiorCamera = null;
    this.furnitureModelLoader?.dispose();
    this.furnitureModelLoader = null;
    this.activeInterior = null;
    this.activeBuildingId = null;
    this.savedOverworldPosition = null;
    this.isInsideBuilding = false;
  }

  private async applyWorldTexturesFromAssets(): Promise<void> {
    if (!this.textureManager) {
      return;
    }

    // Helper: find asset in worldAssets, or fetch it directly by ID as fallback
    const findAsset = async (id: string | undefined): Promise<VisualAsset | undefined> => {
      if (!id) return undefined;
      const local = this.worldAssets.find((a) => a.id === id);
      if (local) return local;
      // Asset not in worldAssets — fetch directly so config changes are always reflected
      const resolved = await this.dataSource.resolveAssetById(id);
      return resolved ?? undefined;
    };

    // Prefer an explicit ground texture from 3D config, otherwise first texture_ground asset
    let groundAsset = await findAsset(this.world3DConfig?.groundTextureId);

    if (!groundAsset) {
      groundAsset = this.worldAssets.find((a) => a.assetType === "texture_ground");
    }

    if (groundAsset) {
      this.textureManager.applyGroundTexture(groundAsset, { uScale: 48, vScale: 48, useBump: true });
      this.selectedGroundTexture = groundAsset.id;

      // Reset diffuseColor to white so the texture shows its true colors
      // (createGround sets a tinting color that would fight with collection textures)
      const groundMesh = this.scene?.getMeshByName("ground");
      if (groundMesh?.material) {
        (groundMesh.material as StandardMaterial).diffuseColor = new Color3(1, 1, 1);
      }
    }

    // Prefer an explicit road texture from 3D config, otherwise first texture_material asset,
    // finally fall back to the ground texture if nothing else is available
    let roadAsset = await findAsset(this.world3DConfig?.roadTextureId);

    if (!roadAsset) {
      roadAsset = this.worldAssets.find((a) => a.assetType === "texture_material");
    }

    if (!roadAsset && groundAsset) {
      roadAsset = groundAsset;
    }

    if (roadAsset) {
      this.textureManager.applyRoadTexture(roadAsset, { uScale: 24, vScale: 24 });
      this.selectedRoadTexture = roadAsset.id;
    }

    // Apply wall textures to buildings if available
    const wallAsset = this.worldAssets.find((a) => a.assetType === "texture_wall");
    if (wallAsset) {
      this.textureManager.applySettlementTextures(wallAsset, { uScale: 8, vScale: 8 });
      this.selectedWallTexture = wallAsset.id;
    }
  }

  private handleSettlementSelected(settlementId: string): void {
    if (!this.guiManager || !this.worldData) return;

    const stats = this.settlementStats.get(settlementId);
    const settlement = this.settlements?.find((s) => s.id === settlementId) || this.worldData?.settlements?.find((s) => s.id === settlementId);
    if (!stats || !settlement) return;

    const type = settlement.settlementType || stats.type;
    const population = typeof settlement.population === "number" && settlement.population > 0
      ? settlement.population
      : stats.population;

    this.guiManager.updateSettlementDetails({
      id: settlementId,
      name: settlement.name,
      type,
      population,
      businesses: stats.businesses,
      residences: stats.residences,
      lots: stats.lots,
      buildingCount: stats.buildingCount,
      terrain: settlement.terrain,
      zoneType: this.getZoneTypeForSettlement(type)
    });
  }

  private disposeSystems(): void {
    this.onboardingActive = false;
    this.assessmentActive = false;
    this.onboardingResult = null;
    this.scheduleExecutor?.dispose();
    this.npcActivityLabelSystem?.dispose();
    this.npcActivityLabelSystem = null;
    this.ambientConversationManager?.dispose();
    this.npcInitiatedConversationController?.dispose();
    this.socializationController?.dispose();
    this.ambientLifeSystem.dispose();
    this.ambientConversationManager = null;
    this.socializationController = null;
    this.npcTalkingIndicator?.dispose();
    this.npcTalkingIndicator = null;
    this.buildingCollisionSystem?.dispose();
    this.buildingCollisionSystem = null;
    this.buildingInfoDisplay?.dispose();
    this.explorationDiscovery?.dispose();
    this.explorationDiscovery = null;
    this.fullscreenMap?.dispose();
    this.inventory?.dispose();
    this.shopPanel?.dispose();
    this.containerPanel?.dispose();
    this.containerSpawnSystem?.dispose();
    this.rulesPanel?.dispose();
    this.vocabularyPanel?.dispose();
    this.conversationHistoryPanel?.dispose();
    this.skillTreePanel?.dispose();
    this.buildingSignManager?.dispose();
    this.gamificationTracker?.dispose();
    this.questCompletionManager?.dispose();
    this.questAutoCompletionDetector?.dispose();
    this.environmentalAudio?.dispose();
    this.culturalEventManager?.dispose();
    this.noticeBoardPanel?.dispose();
    this.settlementNoticeBoard?.dispose();
    this.contentGatingManager?.dispose();
    this.ruleEnforcer?.dispose();
    this.reputationManager?.dispose();
    this.reputationManager = null;
    this.prologEngine?.dispose();
    this.prologEngine = null;
    this.dayNightCycle?.dispose();
    this.dayNightCycle = null;
    this.gameTimeManager.dispose();
    this.eventBus.dispose();
    this.questObjectManager?.dispose();
    this.questIndicatorManager?.dispose();
    this.questOfferPanel?.dispose();
    this.questWorldObjectLinker?.dispose();
    this.questWorldObjectLinker = null;
    this.questIndicatorManager = null;
    this.questOfferPanel = null;
    this.radialMenu?.dispose();
    this.contextualActionMenu?.dispose();
    this.questNotificationManager?.dispose();
    this.questNotificationManager = null;
    this.questLanguageFeedbackTracker = null;
    this.questTracker?.dispose();
    this.chatPanel?.dispose();
    this.worldStateManager?.dispose();
    this.worldStateManager = null;
    this.saveIndicator?.dispose();
    this.saveIndicator = null;
    this.gameMenuSystem?.dispose();
    this.gameMenuSystem = null;
    this.guiManager?.dispose();
    this.textureManager?.dispose();
    this.audioManager?.dispose();
    this.cameraManager?.dispose();
    this.actionManager = null;
    this.buildingGenerator?.dispose();
    this.natureGenerator?.dispose();
    this.roadGenerator?.dispose();
    this.riverGenerator?.dispose();
    this.waterRenderer?.dispose();
    this.fishingSystem?.dispose();
    this.fishingSystem = null;
    this.worldScaleManager = null;
  }

  private disposeScene(): void {
    this.scene?.dispose();
    this.scene = null;
    this.camera = null;
  }

  private disposeEngine(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    this.engine?.dispose();
    this.engine = null;
  }

  // ── Reading Progress Persistence ─────────────────────────────────────────

  private async loadReadingProgress(): Promise<void> {
    const playerId = this.config.userId || 'player';
    const worldId = this.config.worldId;
    const ptId = this.playthroughId || undefined;
    try {
      const data = await this.dataSource.loadReadingProgress(playerId, worldId, ptId);
      if (data?.quizAnswers && Array.isArray(data.quizAnswers)) {
        this.readingProgressQuizAnswers = data.quizAnswers;
        this.readingProgressAnsweredIds = new Set(data.quizAnswers.map((a: any) => a.articleId));
      }
    } catch (err) {
      console.warn('[BabylonGame] Failed to load reading progress:', err);
    }
  }

  private scheduleReadingProgressSync(): void {
    if (this.readingProgressSyncTimer) return;
    this.readingProgressSyncTimer = setTimeout(() => {
      this.readingProgressSyncTimer = null;
      this.syncReadingProgress();
    }, 2000);
  }

  private async syncReadingProgress(): Promise<void> {
    if (!this.readingProgressDirty) return;
    this.readingProgressDirty = false;

    const playerId = this.config.userId || 'player';
    const worldId = this.config.worldId;
    const ptId = this.playthroughId || undefined;

    try {
      await this.dataSource.syncReadingProgress({
        playerId,
        worldId,
        ...(ptId ? { playthroughId: ptId } : {}),
        quizAnswers: this.readingProgressQuizAnswers,
        totalCorrect: this.readingProgressQuizAnswers.filter(a => a.correct).length,
        totalAttempted: this.readingProgressQuizAnswers.length,
      });
    } catch (err) {
      console.warn('[BabylonGame] Failed to sync reading progress:', err);
      this.readingProgressDirty = true; // retry next time
    }
  }

  private serverTextToNoticeArticle(t: any): import('./BabylonNoticeBoardPanel').NoticeArticle {
    const pages = Array.isArray(t.pages) ? t.pages : [];
    const body = pages.length > 0 ? pages.map((p: any) => p.content || '').join('\n\n') : (t.title || '');
    const bodyTranslation = pages.length > 0 ? pages.map((p: any) => p.contentTranslation || '').join('\n\n') : (t.titleTranslation || '');
    const cefrToDiff: Record<string, 'beginner' | 'intermediate' | 'advanced'> = { A1: 'beginner', A2: 'intermediate', B1: 'intermediate', B2: 'advanced' };
    const difficulty = t.difficulty || (t.cefrLevel && cefrToDiff[t.cefrLevel]) || 'beginner';
    const categoryToDocType: Record<string, string> = { book: 'book', journal: 'journal', letter: 'letter', flyer: 'notice', recipe: 'recipe' };
    const documentType = categoryToDocType[t.textCategory] || t.textCategory || 'book';
    return {
      id: t.id,
      title: t.title || '',
      titleTranslation: t.titleTranslation || '',
      body,
      bodyTranslation,
      difficulty,
      vocabularyWords: Array.isArray(t.vocabularyHighlights)
        ? t.vocabularyHighlights.map((v: any) => ({ word: v.word, meaning: v.translation || '' }))
        : [],
      comprehensionQuestion: Array.isArray(t.comprehensionQuestions) && t.comprehensionQuestions.length > 0
        ? t.comprehensionQuestions[0]
        : undefined,
      author: t.authorName ? { characterId: '', name: t.authorName } : undefined,
      readingXp: difficulty === 'beginner' ? 10 : (difficulty === 'intermediate' ? 15 : 25),
      documentType: documentType as any,
      clueText: t.clueText,
      cefrLevel: t.cefrLevel,
      pages,
    } as any;
  }

  private recordQuizAnswer(correct: boolean, articleId: string, selectedIndex: number, correctIndex: number): void {
    this.readingProgressAnsweredIds.add(articleId);
    this.readingProgressQuizAnswers.push({
      articleId,
      selectedIndex,
      correctIndex,
      correct,
      answeredAt: Date.now(),
    });
    this.readingProgressDirty = true;
    this.scheduleReadingProgressSync();
  }
}
