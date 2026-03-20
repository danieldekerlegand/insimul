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
  FreeCamera,
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
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";

import { CharacterController } from "@/components/3DGame/CharacterController.ts";
import { Action, ActionContext, ActionResult } from "@/components/3DGame/types/actions.ts";
import { ActionManager } from "@/components/3DGame/actions/ActionManager.ts";
import { TextureManager } from "@/components/3DGame/TextureManager.ts";
import { AudioManager } from "@/components/3DGame/AudioManager.ts";
import { CameraManager, CameraMode } from "@/components/3DGame/CameraManager.ts";
import { BabylonGUIManager } from "@/components/3DGame/BabylonGUIManager.ts";
import { BabylonChatPanel } from "@/components/3DGame/BabylonChatPanel.ts";
import { BabylonQuestTracker } from "@/components/3DGame/BabylonQuestTracker.ts";
import { BabylonRadialMenu } from "@/components/3DGame/BabylonRadialMenu.ts";
import { QuestObjectManager } from "@/components/3DGame/QuestObjectManager.ts";
import { QuestIndicatorManager } from "@/components/3DGame/QuestIndicatorManager.ts";
import { QuestWorldObjectLinker } from "@/components/3DGame/QuestWorldObjectLinker.ts";
import { ListeningComprehensionManager } from "@/components/3DGame/ListeningComprehensionManager.ts";
import { ProceduralBuildingGenerator, BuildingStyle } from "@/components/3DGame/ProceduralBuildingGenerator.ts";
import { computeFoundationData } from "@/components/3DGame/TerrainFoundationRenderer.ts";
import { ProceduralNatureGenerator, BiomeStyle } from "@/components/3DGame/ProceduralNatureGenerator.ts";
import { RoadGenerator } from "@/components/3DGame/RoadGenerator.ts";
import { RiverGenerator } from "@/components/3DGame/RiverGenerator.ts";
import { WaterRenderer } from "@/components/3DGame/WaterRenderer.ts";
import { buildStreetNetwork } from "@/components/3DGame/StreetNetworkLayout.ts";
import { NPCScheduleSystem } from "@/components/3DGame/NPCScheduleSystem.ts";
import { VolitionSystem, type NPCState as VolitionNPCState, type VolitionGoal, TERMINAL_ACTIONS } from "@/components/3DGame/VolitionSystem.ts";
import { WorldScaleManager, ScaledSettlement } from "@/components/3DGame/WorldScaleManager.ts";
import { BuildingInfoDisplay } from "@/components/3DGame/BuildingInfoDisplay.ts";
import { ChunkManager } from "@/components/3DGame/ChunkManager.ts";
import { BabylonMinimap } from "@/components/3DGame/BabylonMinimap.ts";
import { FullscreenMap } from "@/components/3DGame/FullscreenMap.ts";
import { TERRAIN_PALETTES } from "@/components/3DGame/MinimapTerrainRenderer.ts";
import { BabylonInventory, InventoryItem } from "@/components/3DGame/BabylonInventory.ts";
import { TerrainRenderer } from "@/components/3DGame/TerrainRenderer.ts";
import { BabylonShopPanel, ShopTransaction } from "@/components/3DGame/BabylonShopPanel.ts";
import { BabylonRulesPanel, Rule } from "@/components/3DGame/BabylonRulesPanel.ts";
import { RuleEnforcer, RuleViolation } from "@/components/3DGame/RuleEnforcer.ts";
import { CombatSystem, CombatStyle, DamageResult } from "@/components/3DGame/CombatSystem.ts";
import { EquipmentManager } from "@/components/3DGame/EquipmentManager.ts";
import { RangedCombatSystem } from "@/components/3DGame/RangedCombatSystem.ts";
import { FightingCombatSystem } from "@/components/3DGame/FightingCombatSystem.ts";
import { TurnBasedCombatSystem } from "@/components/3DGame/TurnBasedCombatSystem.ts";
import { GenreUIManager, GenreUIConfig } from "@/components/3DGame/GenreUIManager.ts";
import { ResourceSystem } from "@/components/3DGame/ResourceSystem.ts";
import { CraftingSystem } from "@/components/3DGame/CraftingSystem.ts";
import { BuildingPlacementSystem } from "@/components/3DGame/BuildingPlacementSystem.ts";
import { SurvivalNeedsSystem } from "@/components/3DGame/SurvivalNeedsSystem.ts";
import { RunManager } from "@/components/3DGame/RunManager.ts";
import { ProceduralDungeonGenerator } from "@/components/3DGame/ProceduralDungeonGenerator.ts";
import { getGenreConfig } from "@shared/game-genres/index";
import { HealthBar } from "@/components/3DGame/HealthBar.ts";
import { CombatUI } from "@/components/3DGame/CombatUI.ts";
import { VRManager } from "@/components/3DGame/VRManager.ts";
import { VRUIPanel, VRHandMenu } from "@/components/3DGame/VRUIPanel.ts";
import { VRInteractionManager } from "@/components/3DGame/VRInteractionManager.ts";
import { resolveNPCModelFromCharacter } from "@/components/3DGame/NPCModelManifest.ts";
import { VRHUDManager } from "@/components/3DGame/VRHUDManager.ts";
import { VRCombatAdapter } from "@/components/3DGame/VRCombatAdapter.ts";
import { BabylonVocabularyPanel } from "@/components/3DGame/BabylonVocabularyPanel.ts";
import { BuildingSignManager, BuildingSignData } from "@/components/3DGame/BuildingSignManager.ts";
import { LanguageGamificationTracker } from "@/components/3DGame/LanguageGamificationTracker.ts";
import { QuestCompletionManager } from "@/components/3DGame/QuestCompletionManager.ts";
import { QuestAutoCompletionDetector } from "@/components/3DGame/QuestAutoCompletionDetector.ts";
import { BabylonConversationHistoryPanel } from "@/components/3DGame/BabylonConversationHistoryPanel.ts";
import { BabylonSkillTreePanel } from "@/components/3DGame/BabylonSkillTreePanel.ts";
import { EnvironmentalAudioManager } from "@/components/3DGame/EnvironmentalAudioManager.ts";
import { CulturalEventManager } from "@/components/3DGame/CulturalEventManager.ts";
import { BabylonNoticeBoardPanel, SAMPLE_ARTICLES, type NoticeArticle } from "@/components/3DGame/BabylonNoticeBoardPanel.ts";
import { SettlementNoticeBoard } from "@/components/3DGame/SettlementNoticeBoard.ts";
import { generateSettlementNotices, type NPCAuthorInfo } from "@/components/3DGame/NoticeGenerator.ts";
import { ContentGatingManager } from "@/components/3DGame/ContentGatingManager.ts";
import { generateQuestSuggestions, selectQuestForNPC } from "@/components/3DGame/DynamicQuestBoard.ts";
import { VRChatPanel } from "@/components/3DGame/VRChatPanel.ts";
import { VRVocabularyLabels } from "@/components/3DGame/VRVocabularyLabels.ts";
import { VRHandTrackingManager } from "@/components/3DGame/VRHandTrackingManager.ts";
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
} from "@/components/3DGame/DebugLabelUtils.ts";
import { VRAccessibilityManager } from "@/components/3DGame/VRAccessibilityManager.ts";
import { NPCTalkingIndicator } from "@/components/3DGame/NPCTalkingIndicator.ts";
import { NPCAmbientConversationManager } from "@/components/3DGame/NPCAmbientConversationManager.ts";
import { NPCInitiatedConversationController } from "@/components/3DGame/NPCInitiatedConversationController.ts";
import { NPCSocializationController } from "@/components/3DGame/NPCSocializationController.ts";
import type { SocializableNPC, ConversationResult } from "@/components/3DGame/NPCSocializationController.ts";
import { BuildingInteriorGenerator, InteriorLayout } from "@/components/3DGame/BuildingInteriorGenerator.ts";
import { GameMenuSystem, GameMenuCallbacks, SaveSlotInfo, type MenuJournalData } from "@/components/3DGame/GameMenuSystem.ts";
import { MainMenuScreen, type PlaythroughInfo } from "@/components/3DGame/MainMenuScreen.ts";
import { WorldStateManager, type GameStateSource, type GameStateTarget } from "@/components/3DGame/WorldStateManager.ts";
import { SaveIndicator } from "@/components/3DGame/SaveIndicator.ts";
import { DataSource, createDataSource } from "@/components/3DGame/DataSource.ts";
import { PlaythroughQuestOverlay } from "@/components/3DGame/PlaythroughQuestOverlay.ts";
import { RelationshipManager } from "@/components/3DGame/RelationshipManager.ts";
import { SettlementSceneManager, SettlementZone } from "@/components/3DGame/SettlementSceneManager.ts";
import { GamePrologEngine } from "@/components/3DGame/GamePrologEngine.ts";
import { GameEventBus } from "@/components/3DGame/GameEventBus.ts";
import { GameTimeManager } from "@/components/3DGame/GameTimeManager.ts";
import { BuildingCollisionSystem } from "@/components/3DGame/BuildingCollisionSystem.ts";
import { BuildingEntrySystem } from "@/components/3DGame/BuildingEntrySystem.ts";
import { InteriorNPCManager } from "@/components/3DGame/InteriorNPCManager.ts";
import { NPCBusinessInteractionSystem, type BusinessInteraction, type ServiceResult } from "@/components/3DGame/NPCBusinessInteractionSystem.ts";
import { BusinessBehaviorSystem } from "@/components/3DGame/BusinessBehaviorSystem.ts";
import { NPCSimulationLOD } from "@/components/3DGame/NPCSimulationLOD.ts";
import { generateNPCAppearance, generateBillboardColor, blendWithRoleTint, type NPCAppearance } from "@/components/3DGame/NPCAppearanceGenerator.ts";
import { NPCAccessorySystem } from "@/components/3DGame/NPCAccessorySystem.ts";
import { NPCInteractionPrompt } from "@/components/3DGame/NPCInteractionPrompt.ts";
import { NPCModelInstancer } from "@/components/3DGame/NPCModelInstancer.ts";
import { selectNPCModel, type NPCGender } from "@/components/3DGame/NPCModelVariety.ts";
import { QuestNotificationManager } from "@/components/3DGame/QuestNotificationManager.ts";
import { ReputationManager } from "@/components/3DGame/ReputationManager.ts";
import { QuestLanguageFeedbackPanel } from "@/components/3DGame/QuestLanguageFeedbackPanel.ts";
import { QuestLanguageFeedbackTracker } from "@shared/language/quest-language-feedback";
import {
  isFirstPlaythrough,
  isLanguageLearningWorld,
  getTargetLanguage,
  launchOnboarding,
} from "@/components/3DGame/OnboardingLauncher.ts";
import type { OnboardingLaunchResult } from "@/components/3DGame/OnboardingLauncher.ts";
import {
  KEY_NPC_INTERACT,
  KEY_BUILDING_INTERACT,
  KEY_ATTACK,
  KEY_TARGET_ENEMY,
  KEY_TOGGLE_VR,
  KEY_GAME_MENU,
  KEY_QUEST_LOG,
  KEY_FULLSCREEN_MAP,
  KEY_PUSH_TO_TALK,
  KEY_EXAMINE_OBJECT,
  KEY_EAVESDROP,
  KEY_QUICK_SAVE,
  KEY_QUICK_LOAD,
} from "@/components/3DGame/KeyboardMap.ts";
import type { VisualAsset } from "@shared/schema.ts";
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
type NPCRole = 'civilian' | 'guard' | 'merchant' | 'questgiver';

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
  private questObjectManager: QuestObjectManager | null = null;
  private questIndicatorManager: QuestIndicatorManager | null = null;
  private questWorldObjectLinker: QuestWorldObjectLinker | null = null;
  private questNotificationManager: QuestNotificationManager | null = null;
  private questLanguageFeedbackPanel: QuestLanguageFeedbackPanel | null = null;
  private questLanguageFeedbackTracker: QuestLanguageFeedbackTracker | null = null;
  private listeningComprehensionManager: ListeningComprehensionManager | null = null;
  private buildingGenerator: ProceduralBuildingGenerator | null = null;
  private natureGenerator: ProceduralNatureGenerator | null = null;
  private roadGenerator: RoadGenerator | null = null;
  private riverGenerator: RiverGenerator | null = null;
  private waterRenderer: WaterRenderer | null = null;
  private worldScaleManager: WorldScaleManager | null = null;
  private buildingInfoDisplay: BuildingInfoDisplay | null = null;
  private minimap: BabylonMinimap | null = null;
  private fullscreenMap: FullscreenMap | null = null;
  private inventory: BabylonInventory | null = null;
  private shopPanel: BabylonShopPanel | null = null;
  private rulesPanel: BabylonRulesPanel | null = null;
  private vocabularyPanel: BabylonVocabularyPanel | null = null;
  private conversationHistoryPanel: BabylonConversationHistoryPanel | null = null;
  private skillTreePanel: BabylonSkillTreePanel | null = null;
  private buildingSignManager: BuildingSignManager | null = null;
  private gamificationTracker: LanguageGamificationTracker | null = null;
  private questCompletionManager: QuestCompletionManager | null = null;
  private questAutoCompletionDetector: QuestAutoCompletionDetector | null = null;
  private environmentalAudio: EnvironmentalAudioManager | null = null;
  private culturalEventManager: CulturalEventManager | null = null;
  private noticeBoardPanel: BabylonNoticeBoardPanel | null = null;
  private settlementNoticeBoard: SettlementNoticeBoard | null = null;
  private contentGatingManager: ContentGatingManager | null = null;
  private ruleEnforcer: RuleEnforcer | null = null;
  private prologEngine: GamePrologEngine | null = null;
  private eventBus: GameEventBus = new GameEventBus();
  private gameTimeManager: GameTimeManager = new GameTimeManager();
  private combatSystem: CombatSystem | null = null;
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

  // NPCs
  private npcMeshes: Map<string, NPCInstance> = new Map();
  private npcInfos: NPCDisplayInfo[] = [];
  private npcHealthBars: Map<string, HealthBar> = new Map();
  private selectedNPCId: string | null = null;
  private conversationNPCId: string | null = null;
  private preConversationCameraMode: CameraMode | null = null;
  // NPC model instancer: caches templates, clones for subsequent NPCs, shared materials
  private npcModelInstancer: NPCModelInstancer | null = null;

  // Settlements and world
  private settlementMeshes: Map<string, Mesh> = new Map();
  private settlementRoadMeshes: Mesh[] = [];
  private zoneBoundaryMeshes: Map<string, { boundary: Mesh | null; particles?: ParticleSystem | null; zoneRadius?: number; zoneColor?: Color3 }> = new Map();
  private buildingData: Map<string, { position: Vector3; metadata: any; mesh: Mesh }> = new Map();
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
  private titleScreen: MainMenuScreen | null = null;
  private questOverlay: PlaythroughQuestOverlay = new PlaythroughQuestOverlay();
  private relationshipManager: RelationshipManager | null = null;
  private currentReputation: any | null = null;
  private reputationManager: ReputationManager | null = null;

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
  } | null = null;
  private worldAssets: VisualAsset[] = [];

  // Prop/object model templates loaded from world3DConfig.objectModels
  private objectModelTemplates: Map<string, Mesh> = new Map();
  private objectModelOriginalHeights: Map<string, number> = new Map();
  private worldPropMeshes: Mesh[] = [];

  // Shared material cache for furniture props (avoids duplicate materials)
  private furnitureMaterialCache: Map<string, StandardMaterial> = new Map();

  // Audio
  private zoneEnterSound: Sound | null = null;
  private zoneExitSound: Sound | null = null;
  private violationSound: Sound | null = null;

  // Theme
  private worldTheme: WorldVisualTheme;

  // Spatial chunk system for distance culling
  private chunkManager: ChunkManager | null = null;

  // Phase 4: Building interiors
  private interiorGenerator: BuildingInteriorGenerator | null = null;
  private activeInterior: InteriorLayout | null = null;
  private savedOverworldPosition: Vector3 | null = null;
  private savedOverworldRotationY: number = 0;
  private savedOverworldCameraAlpha: number = 0;
  private isInsideBuilding: boolean = false;
  private interiorDoorTrigger: Mesh | null = null;
  private buildingEntrySystem: BuildingEntrySystem | null = null;
  private interiorNPCManager: InteriorNPCManager | null = null;
  private businessInteractionSystem: NPCBusinessInteractionSystem = new NPCBusinessInteractionSystem();
  private currentBuildingBusinessType: string | undefined = undefined;
  private businessBehaviorSystem: BusinessBehaviorSystem | null = null;

  // NPC Simulation LOD
  private npcSimulationLOD: NPCSimulationLOD | null = null;

  // NPC Accessory & Occupation-Visual System
  private npcAccessorySystem: NPCAccessorySystem | null = null;

  // NPC Interaction Prompt — shows contextual prompts when looking at NPCs
  private npcInteractionPrompt: NPCInteractionPrompt | null = null;

  // NPC Schedule System — sidewalk pathfinding and goal-directed behavior
  private npcScheduleSystem: NPCScheduleSystem = new NPCScheduleSystem();

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
  }

  /**
   * Initialize the game - call this after construction
   */
  // Loading screen overlay
  private _loadingOverlay: HTMLDivElement | null = null;
  private _loadingText: HTMLDivElement | null = null;
  private _loadingBar: HTMLDivElement | null = null;

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

    barContainer.appendChild(this._loadingBar);
    this._loadingOverlay.appendChild(this._loadingText);
    this._loadingOverlay.appendChild(barContainer);
    parent?.appendChild(this._loadingOverlay);
  }

  private updateLoadingScreen(step: string, progress: number): void {
    if (this._loadingText) this._loadingText.textContent = step;
    if (this._loadingBar) this._loadingBar.style.width = `${Math.min(100, progress)}%`;
  }

  private hideLoadingScreen(): void {
    if (this._loadingOverlay) {
      this._loadingOverlay.style.transition = 'opacity 0.4s';
      this._loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        this._loadingOverlay?.remove();
        this._loadingOverlay = null;
        this._loadingText = null;
        this._loadingBar = null;
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
      if (!this.config.playthroughId && this.config.authToken) {
        this.hideLoadingScreen();
        const selectedId = await this.showPlaythroughSelectionMenu();
        if (!selectedId) return; // User went back
        this.config.playthroughId = selectedId;
        this.showLoadingScreen();
      }

      this.updateLoadingScreen('Loading world data...', 20);
      await this.loadWorldData();
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

    return new Promise<string | null>((resolve) => {
      this.titleScreen = new MainMenuScreen(
        this.guiManager!.advancedTexture,
        worldName || 'Untitled World',
        {
          getPlaythroughs: async (): Promise<PlaythroughInfo[]> => {
            try {
              const list = await this.dataSource.listPlaythroughs(
                this.config.worldId,
                this.config.authToken || '',
              );
              return list.map((p: any) => ({
                id: p.id,
                name: p.name || 'Playthrough',
                status: p.status,
                lastPlayedAt: p.lastPlayedAt,
                createdAt: p.createdAt,
                playtime: p.playtime || 0,
                actionsCount: p.actionsCount || 0,
              }));
            } catch (err) {
              console.error('[BabylonGame] Failed to list playthroughs:', err);
              return [];
            }
          },
          onNewGame: async (): Promise<string | null> => {
            const playthroughName = `${this.config.worldName || 'World'} Playthrough`;
            try {
              const playthrough = await this.dataSource.startPlaythrough(
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
            this.config.onBack?.();
            resolve(null);
          },
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
      const res = await fetch(`/api/playthroughs/${this.playthroughId}`, {
        headers: { Authorization: `Bearer ${this.config.authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
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
      const res = await fetch(`/api/playthroughs/${this.playthroughId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.authToken}`,
        },
        body: JSON.stringify(updates),
      });
      return res.ok;
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
      await fetch(`/api/playthroughs/${this.playthroughId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.config.authToken}` },
      });
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
      antialias: false
    });

    // Render at 67% resolution for significant GPU savings (barely visible)
    this.engine.setHardwareScalingLevel(1.5);

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

    // Initialize NPC interaction prompt (look-at based contextual prompts)
    this.npcInteractionPrompt = new NPCInteractionPrompt(scene);
    this.npcInteractionPrompt.setConversationPartnerCallback((npcId) => {
      return this.ambientConversationManager?.getConversationPartner(npcId) ?? null;
    });

    // Initialize NPC model instancer (template caching + cloning + shared materials)
    this.npcModelInstancer = new NPCModelInstancer(scene);

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

    // Derive sky gradient colors from theme
    const zenith = new Color3(
      theme.skyColor.r * 0.5,
      theme.skyColor.g * 0.55,
      theme.skyColor.b * 1.1
    );
    const horizon = new Color3(
      Math.min(1, theme.skyColor.r * 1.3 + 0.15),
      Math.min(1, theme.skyColor.g * 1.2 + 0.12),
      Math.min(1, theme.skyColor.b * 0.95 + 0.1)
    );
    const ground = new Color3(
      theme.skyColor.r * 0.6 + 0.15,
      theme.skyColor.g * 0.65 + 0.1,
      theme.skyColor.b * 0.5 + 0.08
    );

    skyMat.setColor3("zenithColor", zenith);
    skyMat.setColor3("horizonColor", horizon);
    skyMat.setColor3("groundColor", ground);
    skyDome.material = skyMat;

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
      let tileScale = 6;
      let bumpScale = 12;

      if (worldType.includes('desert') || worldType.includes('sand')) {
        tileScale = 3; // Larger, smoother sand dunes
        bumpScale = 6;
      } else if (worldType.includes('tundra') || worldType.includes('snow') || worldType.includes('ice')) {
        tileScale = 4;
        bumpScale = 8;
      } else if (worldType.includes('forest') || worldType.includes('fantasy') || worldType.includes('medieval')) {
        tileScale = 8; // Denser grass tiling
        bumpScale = 14;
      } else if (worldType.includes('cyberpunk') || worldType.includes('sci-fi') || worldType.includes('modern')) {
        tileScale = 4; // Urban concrete
        bumpScale = 8;
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

      const ground = MeshBuilder.CreateGroundFromHeightMap(
        "ground",
        GROUND_HEIGHTMAP_URL,
        {
          width: size,
          height: size,
          minHeight: 0,
          maxHeight: 0, // Flat terrain — elevation disabled until placement/physics are fixed
          subdivisions: 64,
          onReady: (mesh) => {
            mesh.material = groundMaterial;
            mesh.checkCollisions = true;
            mesh.isPickable = true;
            mesh.receiveShadows = true;
            mesh.metadata = { ...(mesh.metadata || {}), terrainSize: size };
            resolve();
          }
        },
        scene
      );
      ground.metadata = { ...(ground.metadata || {}), terrainSize: size };
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

  private async initializeSystems(): Promise<void> {
    if (!this.scene || !this.canvas) {
      return;
    }

    const scene = this.scene;

    // Wire game time manager to event bus
    this.gameTimeManager.setEventBus(this.eventBus);

    // Initialize texture manager
    this.textureManager = new TextureManager(scene);

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
      getVocabularyData: () => {
        const tracker = this.chatPanel?.getLanguageTracker();
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
        const tracker = this.chatPanel?.getLanguageTracker();
        return tracker ? tracker.getRecentConversations(20) : [];
      },
      getSkillTreeStats: () => {
        const tracker = this.chatPanel?.getLanguageTracker();
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
      getNoticeArticles: () => {
        const tracker = this.chatPanel?.getLanguageTracker();
        return {
          articles: SAMPLE_ARTICLES,
          playerFluency: tracker ? tracker.getFluency() : 0,
        };
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
      onNoticeQuestionAnswered: (correct: boolean, _articleId: string) => {
        this.guiManager?.showToast({
          title: correct ? "Correct!" : "Not quite...",
          description: correct ? "Great job!" : "Try again next time",
          duration: 2000,
        });
      },
      onVocabWordSpeak: (word: string) => {
        this.chatPanel?.speakWord(word);
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
      getPortfolioData: () => this.portfolioData,
      // Playthrough management
      getPlaythroughInfo: () => this.getPlaythroughInfo(),
      onRenamePlaythrough: (newName: string) => this.handleRenamePlaythrough(newName),
      onPausePlaythrough: () => this.handlePausePlaythrough(),
      onAbandonPlaythrough: () => this.handleAbandonPlaythrough(),
      onDeletePlaythrough: () => this.handleDeletePlaythrough(),
      onReturnToMainMenu: () => this.handleReturnToMainMenu(),
      onQuitGame: () => this.handleQuitGame(),
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

    this.gameMenuSystem = new GameMenuSystem(this.guiManager.advancedTexture, menuCallbacks);
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
      // Use QuestCompletionManager for the full ceremony
      if (this.questCompletionManager) {
        const questData = this.quests.find(q => q.id === questId);
        if (questData) {
          // Mark completed in overlay
          await this.dataSource.updateQuest(questId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
          });
          await this.questCompletionManager.completeQuest({
            id: questData.id,
            worldId: questData.worldId || this.config.worldId,
            title: questData.title,
            questType: questData.questType,
            experienceReward: questData.experienceReward || 0,
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
      this.eventBus.emit({ type: 'quest_completed', questId });
      // Record against main quest progression (non-blocking)
      const questForType = this.quests?.find((q: any) => q.id === questId);
      if (questForType?.questType) {
        this.recordMainQuestProgress(questForType.questType);
      }
    });
    this.chatPanel.setOnActionSelect((actionId: string) => {
      this.handlePerformAction(actionId);
    });
    this.chatPanel.setOnNPCConversationStarted((npcId: string) => {
      // Track NPC conversation for quest objectives (talk_to_npc)
      this.questObjectManager?.trackNPCConversation(npcId);
      this.eventBus.emit({ type: 'npc_talked', npcId, npcName: npcId, turnCount: 1 });
    });
    this.chatPanel.setOnVocabularyUsed((word: string) => {
      this.questObjectManager?.trackVocabularyUsage(word);
      this.eventBus.emit({ type: 'vocabulary_used', word, correct: true });
      // Forward vocabulary usage to quest language tracker
      if (this.questLanguageFeedbackTracker) {
        const items = this.questLanguageFeedbackTracker.processVocabularyUsage([
          { word, meaning: '', usedCorrectly: true },
        ]);
        for (const item of items) {
          this.questLanguageFeedbackPanel?.addFeedbackItem(item);
        }
        this.questLanguageFeedbackPanel?.updateFromState(this.questLanguageFeedbackTracker.getState());
      }
    });
    this.chatPanel.setOnConversationTurn((keywords: string[]) => {
      this.questObjectManager?.trackConversationTurn(keywords);
      if (this.conversationNPCId) {
        this.eventBus.emit({ type: 'conversation_turn', npcId: this.conversationNPCId, keywords });
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
        this.eventBus.emit({
          type: 'assessment_conversation_completed',
          npcId: this.conversationNPCId || '',
        });
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
        const items = this.questLanguageFeedbackTracker.processGrammarFeedback(feedback);
        for (const item of items) {
          this.questLanguageFeedbackPanel?.addFeedbackItem(item);
        }
        this.questLanguageFeedbackPanel?.updateFromState(this.questLanguageFeedbackTracker.getState());
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

    // Initialize quest language feedback panel (real-time grammar/vocab overlay)
    this.questLanguageFeedbackPanel = new QuestLanguageFeedbackPanel(this.guiManager.advancedTexture);

    // Initialize zone audio
    this.initializeZoneAudio(scene);

    // Initialize radial menu
    this.radialMenu = new BabylonRadialMenu(scene);

    // Initialize quest object manager
    this.questObjectManager = new QuestObjectManager(scene);
    this.questObjectManager.setPointInBuildingCheck((x, z) => this.isPointInsideAnyBuilding(x, z));
    this.questObjectManager.setOnObjectCollected((questId, objectiveId) => {
      this.handleQuestObjectiveCompleted(questId, objectiveId, 'collect');
    });
    this.questObjectManager.setOnLocationVisited((questId, objectiveId) => {
      this.handleQuestObjectiveCompleted(questId, objectiveId, 'visit');
    });
    this.questObjectManager.setOnObjectiveCompleted((questId, objectiveId) => {
      this.handleQuestObjectiveCompleted(questId, objectiveId, 'objective');
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
    this.minimap = new BabylonMinimap(scene, this.guiManager.advancedTexture, this.terrainSize);

    // Initialize full-screen map
    this.fullscreenMap = new FullscreenMap(this.guiManager.advancedTexture);

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

    // Initialize gamification tracker (XP, achievements, daily challenges)
    this.gamificationTracker = new LanguageGamificationTracker();
    this.gamificationTracker.setOnXPGain((event) => {
      this.guiManager?.showToast({
        title: `+${event.amount} XP`,
        description: event.reason,
        duration: 2000,
      });
    });
    this.gamificationTracker.setOnLevelUp((event) => {
      this.guiManager?.showToast({
        title: `Level Up! Level ${event.newLevel}`,
        description: `${event.tier} tier reached`,
        duration: 5000,
      });
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
          // Mark completed in overlay
          await this.dataSource.updateQuest(questId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
          });
          await this.questCompletionManager.completeQuest({
            id: questData.id,
            worldId: questData.worldId || this.config.worldId,
            title: questData.title,
            questType: questData.questType,
            experienceReward: questData.experienceReward || 0,
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
    this.eventBus.on('utterance_quest_completed', () => this.updateQuestIndicators());
    this.eventBus.on('utterance_quest_progress', () => this.updateQuestIndicators());
    this.eventBus.on('item_collected', () => this.updateQuestIndicators());
    this.eventBus.on('item_delivered', () => this.updateQuestIndicators());
    this.eventBus.on('location_visited', () => this.updateQuestIndicators());
    this.eventBus.on('npc_talked', () => this.updateQuestIndicators());

    // Wire learning activity events to gamification tracker for XP awards
    this.eventBus.on('assessment_phase_completed', () => {
      this.gamificationTracker?.onAssessmentPhaseCompleted();
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
        fetch(`/api/worlds/${worldId}/main-quest/${playerId}/try-unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cefrLevel: event.cefrLevel }),
        }).then(() => this.fetchMainQuestJournalData()).catch(() => {});
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
        try {
          const response = await fetch(`/api/worlds/${this.config.worldId}/npc-npc-conversation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ npc1Id, npc2Id, topic }),
          });
          if (!response.ok) return null;
          const data = await response.json();
          return {
            exchanges: data.exchanges ?? [],
            relationshipDelta: data.relationshipDelta ?? { friendshipChange: 0, trustChange: 0, romanceSpark: 0 },
            topic: data.topic ?? 'small_talk',
            languageUsed: data.languageUsed ?? 'English',
          };
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
    this.roadGenerator = new RoadGenerator(scene);
    this.riverGenerator = new RiverGenerator(scene);
    this.waterRenderer = new WaterRenderer(scene);
    this.interiorGenerator = new BuildingInteriorGenerator(scene);
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
        // NPC population is now handled internally by BuildingEntrySystem
      },
      onExitBuilding: () => {
        this.activeInterior = null;
        this.isInsideBuilding = false;
        this.savedOverworldPosition = null;
        // NPC cleanup is now handled internally by BuildingEntrySystem
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
    this.worldScaleManager = new WorldScaleManager(512, this.config.worldId);

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

      // Enable language-learning display mode for inventory
      if (this.inventory && isLanguageLearningWorld(this.worldData)) {
        this.inventory.setLanguageLearning(true);
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
      if (this.textureManager && this.worldAssets.length > 0) {
        this.applyWorldTexturesFromAssets();
      }

      // Initialize audio manager with audio config from asset collection
      if (this.audioManager && world3DConfig?.audioAssets) {
        await this.audioManager.initialize(world3DConfig.audioAssets, worldAssets);
      }

      // Update GUI with loaded world data
      this.updateWorldStatsUI();
      this.rulesPanel?.updateRules(rules, baseRules);

      // Calculate optimal world size based on geography
      const optimalSize = WorldScaleManager.calculateOptimalWorldSize({
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
    } | null
  ): Promise<void> {
    if (!this.scene || !config3D) {
      return;
    }

    // Diagnostic: log what the asset collection provides

    const scene = this.scene;

    const findAssetById = (id: string | undefined | null): VisualAsset | null => {
      if (!id) return null;
      const asset = worldAssets.find((a) => a.id === id);
      if (!asset) {
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
          //   → rootUrl = "/assets/polyhaven/models/"
          //   → fileName = "tree_small_02.gltf"
          const cleanPath = asset.filePath.replace(/^\//, '');
          const lastSlash = cleanPath.lastIndexOf('/');
          if (lastSlash >= 0) {
            rootUrl = '/' + cleanPath.substring(0, lastSlash + 1);
            fileName = cleanPath.substring(lastSlash + 1);
          } else {
            rootUrl = '/';
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
          this.buildingGenerator.registerRoleModel(role, mesh);
        }
      }
    }

    // Apply wall/roof textures to building generator if available
    if (this.buildingGenerator && this.textureManager) {
      // Wall texture: prefer explicit config3D reference, then fall back to assetType lookup
      let wallAsset = config3D.wallTextureId
        ? worldAssets.find((a) => a.id === config3D.wallTextureId)
        : undefined;
      if (!wallAsset) {
        wallAsset = worldAssets.find((a) => a.assetType === 'texture_wall');
      }
      if (wallAsset) {
        const wallTex = this.textureManager.loadTexture(wallAsset);
        this.buildingGenerator.setWallTexture(wallTex);
      }

      // Roof texture: prefer explicit config3D reference, then fall back to tag/name lookup
      let roofAsset = config3D.roofTextureId
        ? worldAssets.find((a) => a.id === config3D.roofTextureId)
        : undefined;
      if (!roofAsset) {
        roofAsset = worldAssets.find((a) =>
          a.assetType === 'texture_material' && (a.tags?.includes('roof') || a.name?.toLowerCase().includes('roof'))
        );
      }
      if (roofAsset) {
        const roofTex = this.textureManager.loadTexture(roofAsset);
        this.buildingGenerator.setRoofTexture(roofTex);
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
    if (config3D.objectModels) {
      for (const [role, id] of Object.entries(config3D.objectModels)) {
        const asset = findAssetById(id);
        const template = await loadModelTemplate(asset);
        if (template) {
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
          this.objectModelTemplates.set(role, template);
        }
      }
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
    const biome = ProceduralNatureGenerator.getBiomeFromWorldType(worldType);


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
          fallbackLotPositions = streetLayout.lots.map((l) => ({
            position: this.projectToGround(l.position.x, l.position.z),
            facingAngle: l.facingAngle,
            zone: l.zone,
          }));
        }

        // Compute re-centering offset: lot positions are in server local-space
        // (centered at mapSize/2), but the game world places the settlement elsewhere.
        // Use the street waypoint centroid (same as StreetNetworkLayout.offsetNetwork)
        // so that buildings and roads use an identical transform.
        const lotsWithPos = lots.filter((l: any) => l.positionX != null && l.positionZ != null);
        let lotOffsetX = 0, lotOffsetZ = 0;
        if (lotsWithPos.length > 0) {
          // Prefer street waypoint centroid for consistency with road rendering
          const storedStreetsForCentroid: any[] = Array.isArray(settlement.streets) ? settlement.streets : [];
          let centroidX = 0, centroidZ = 0;
          let wpCount = 0;
          for (const s of storedStreetsForCentroid) {
            const wps = Array.isArray(s.waypoints) ? s.waypoints
              : (s.properties && Array.isArray(s.properties.waypoints) ? s.properties.waypoints : []);
            for (const wp of wps) {
              if (wp.x != null && wp.z != null) {
                centroidX += wp.x;
                centroidZ += wp.z;
                wpCount++;
              }
            }
          }
          if (wpCount > 0) {
            centroidX /= wpCount;
            centroidZ /= wpCount;
          } else {
            // Fallback to lot centroid if no street data
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
              zone: lot.buildingType === 'business' ? 'commercial' : 'residential',
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
        for (const business of businesses) {
          const lotInfo = resolveBuildingPosition(business);

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
          });

          // Clamp building footprint to lot dimensions so it doesn't overflow into streets
          if (bizLot?.lotWidth) buildingSpec.width = Math.min(buildingSpec.width, bizLot.lotWidth * 0.75);
          if (bizLot?.lotDepth) buildingSpec.depth = Math.min(buildingSpec.depth, bizLot.lotDepth * 0.75);

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
            mesh: building
          });

          // Register building with NPC schedule system for pathfinding
          this.npcScheduleSystem.registerBuilding(
            business.id,
            building.position.clone(),
            buildingSpec.rotation,
            buildingSpec.depth,
            'business'
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

          // Register building for hover info display
          this.buildingInfoDisplay?.registerBuilding(building);

          // Create bilingual building sign (language-learning worlds)
          if (this.buildingSignManager && business.name) {
            const tracker = this.chatPanel?.getLanguageTracker();
            if (tracker) {
              this.buildingSignManager.setPlayerFluency(tracker.getFluency());
            }
            this.buildingSignManager.createBuildingSign(building, {
              buildingId: business.id,
              nativeName: business.businessType || 'Business',
              targetName: business.name,
              buildingType: 'business',
              businessType: business.businessType,
            });
          }

        }

        // Then spawn residences from backend data
        for (const residence of residences) {
          const lotInfo = resolveBuildingPosition(residence);

          // Determine residence type based on occupancy/size
          const occupants = residence.residentIds || residence.occupants || [];
          const residenceType = occupants.length > 8
            ? 'residence_large'
            : occupants.length > 4
              ? 'residence_medium'
              : 'residence_small';

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
          });

          // Clamp building footprint to lot dimensions so it doesn't overflow into streets
          if (resLot?.lotWidth) buildingSpec.width = Math.min(buildingSpec.width, resLot.lotWidth * 0.75);
          if (resLot?.lotDepth) buildingSpec.depth = Math.min(buildingSpec.depth, resLot.lotDepth * 0.75);

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
            mesh: building
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

          // Register building for hover info display
          this.buildingInfoDisplay?.registerBuilding(building);
        }

        // Collect DB lots not yet claimed by a business or residence for auto-fill
        const usedLotIds = new Set<string>();
        for (const b of businesses) { if (b.lotId) usedLotIds.add(b.lotId); }
        for (const r of residences) { if (r.lotId) usedLotIds.add(r.lotId); }
        const unclaimedLots = lots.filter((l: any) =>
          !usedLotIds.has(l.id) && l.positionX != null && l.positionZ != null
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
            });

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
              mesh: building
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

            this.buildingInfoDisplay?.registerBuilding(building);
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
          });

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

          // Register building for hover info display
          this.buildingInfoDisplay?.registerBuilding(building);

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

        // Create a subtle ground marker and signpost for the settlement center
        const settlementCenter = this.projectToGround(
          scaledSettlement.position.x,
          scaledSettlement.position.z
        );

        // Store first settlement position for player spawn
        if (!this.firstSettlementSpawnPosition && i === 0) {
          this.firstSettlementSpawnPosition = settlementCenter.clone();
        }

        // Flat disc on the ground as a subtle marker
        const settlementMarker = MeshBuilder.CreateDisc(
          `settlement_marker_${settlement.id}`,
          { radius: 1.5, tessellation: 24 },
          scene
        );
        settlementMarker.position = settlementCenter.clone();
        settlementMarker.position.y += 0.08;
        settlementMarker.rotation.x = Math.PI / 2;
        settlementMarker.isPickable = true;

        settlementMarker.metadata = {
          ...(settlementMarker.metadata || {}),
          settlementId: settlement.id
        };

        const markerMat = new StandardMaterial(`settlement_marker_mat_${settlement.id}`, scene);
        markerMat.diffuseColor = new Color3(0.6, 0.5, 0.3);
        markerMat.emissiveColor = new Color3(0.2, 0.15, 0.05);
        markerMat.alpha = 0.4;
        markerMat.specularColor = Color3.Black();
        settlementMarker.material = markerMat;

        // Signpost: thin pole + name plate (stored for disposal)
        const signPole = MeshBuilder.CreateCylinder(
          `settlement_sign_pole_${settlement.id}`,
          { height: 3, diameter: 0.15, tessellation: 8 },
          scene
        );
        signPole.position = settlementCenter.clone();
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
        signPlate.position = settlementCenter.clone();
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

        // Phase 4: Billboard impostor for distant settlement — the signplate
        // already has BILLBOARDMODE_Y and the settlement name. Add LOD levels
        // to the signpost so it remains visible at distance while buildings cull.
        signPlate.addLODLevel(300, null); // Hide at extreme distance
        signPole.addLODLevel(200, null);  // Hide pole at 200u
        settlementMarker.addLODLevel(200, null); // Hide disc at 200u

        // Spawn a small cluster of world-type-specific props around the settlement center
        if (this.objectModelTemplates.size > 0) {
          const preferredRoles = ["chest", "data_pad", "lantern"];
          const availableRoles = Array.from(this.objectModelTemplates.keys());

          const rolesToSpawn: string[] = [];
          for (const role of preferredRoles) {
            if (availableRoles.includes(role)) {
              rolesToSpawn.push(role);
            }
          }
          for (const role of availableRoles) {
            if (rolesToSpawn.length >= 3) break;
            if (!rolesToSpawn.includes(role)) {
              rolesToSpawn.push(role);
            }
          }

          const count = rolesToSpawn.length;
          for (let idx = 0; idx < count; idx++) {
            const role = rolesToSpawn[idx];
            const template = this.objectModelTemplates.get(role);
            if (!template) continue;

            const angle = (Math.PI * 2 * idx) / count + Math.random() * 0.5;
            const radius = 4 + Math.random() * 8;
            const offsetX = Math.cos(angle) * radius;
            const offsetZ = Math.sin(angle) * radius;

            const groundPos = this.projectToGround(
              settlementCenter.x + offsetX,
              settlementCenter.z + offsetZ
            );
            groundPos.y += 0.3;

            let propInstance: Mesh | null = null;
            // glTF root nodes have 0 vertices — use instantiateHierarchy
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
            propInstance.position = groundPos;
            propInstance.isVisible = true;
            propInstance.setEnabled(true);
            propInstance.checkCollisions = true;
            propInstance.isPickable = true;
            // Compute absolute scale from original height to reach target meters
            const propSizeMap: Record<string, number> = {
              'chest': 0.6, 'data_pad': 0.3, 'lantern': 0.5,
              'lamp': 2.5, 'lamp_table': 0.5, 'storage': 0.8,
              'storage_alt': 0.8, 'furniture_stool': 0.5, 'furniture_chair': 0.8,
              'furniture_table': 0.8, 'prop': 0.8, 'decoration': 0.6,
              'electronics': 0.4,
            };
            const propTarget = propSizeMap[role] || 0.8;
            const propOrigH = this.objectModelOriginalHeights.get(role) || 1;
            const propAbsScale = propTarget / propOrigH;
            propInstance.scaling.set(propAbsScale, propAbsScale, propAbsScale);
            propInstance.metadata = {
              ...(propInstance.metadata || {}),
              objectRole: role,
            };
            // Ensure child meshes (glTF hierarchies) are also pickable, collidable, and carry objectRole
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

        // Add settlement marker to minimap
        this.minimap?.addMarker({
          id: `settlement_${settlement.id}`,
          position: scaledSettlement.position.clone(),
          type: 'settlement',
          label: settlement.name
        });

        // Register settlement as a safe zone with rule enforcer
        this.ruleEnforcer?.registerSettlementZone(
          settlement.id,
          scaledSettlement.position.clone(),
          scaledSettlement.radius
        );

        // Place physical notice board at settlement center
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
          this.settlementNoticeBoard.createBoard({
            settlementId: settlement.id,
            settlementName: settlement.name,
            position: settlementCenter.clone(),
            articles,
            playerFluency: 0,
          });
        }
      } catch (error) {
        console.error(`Failed to generate buildings for settlement ${settlement.name}:`, error);
      }
    }

    this.settlementMeshes = settlementMap;

    // Generate roads between settlements
    if (this.roadGenerator && boundaryData.length >= 2) {

      // Set road appearance based on world type
      const wt = (this.config.worldType || '').toLowerCase();
      if (wt.includes('medieval') || wt.includes('fantasy')) {
        this.roadGenerator.setRoadColor(new Color3(0.35, 0.28, 0.2)); // Dirt path
        this.roadGenerator.setRoadWidth(10);
      } else if (wt.includes('cyberpunk') || wt.includes('sci-fi') || wt.includes('modern')) {
        this.roadGenerator.setRoadColor(new Color3(0.22, 0.22, 0.25)); // Asphalt
        this.roadGenerator.setRoadWidth(14);
      } else if (wt.includes('desert') || wt.includes('sand')) {
        this.roadGenerator.setRoadColor(new Color3(0.45, 0.38, 0.28)); // Sandy path
        this.roadGenerator.setRoadWidth(8);
      } else {
        this.roadGenerator.setRoadColor(new Color3(0.32, 0.28, 0.22)); // Default packed dirt
        this.roadGenerator.setRoadWidth(10);
      }

      // Apply road texture from asset collection if available
      if (this.textureManager && this.selectedRoadTexture) {
        const roadAsset = this.worldAssets.find((a) => a.id === this.selectedRoadTexture);
        if (roadAsset) {
          const roadTex = this.textureManager.loadTexture(roadAsset);
          this.roadGenerator.setRoadTexture(roadTex);
        }
      }

      const settlementNodes = boundaryData.map((s) => ({
        id: s.id,
        position: s.position
      }));

      this.roadGenerator.generateRoads(settlementNodes, sampleHeight);
    }

    // Water generation disabled — rivers were overlapping with settlements.

    // Generate nature elements (trees, rocks, grass, flowers)

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

    // Diagnostic: find any abnormally large meshes in the scene
    if (this.scene) {
      for (const m of this.scene.meshes) {
        if (m.isDisposed()) continue;
        const bi = m.getBoundingInfo();
        const sz = bi.boundingBox.maximumWorld.subtract(bi.boundingBox.minimumWorld);
        const maxDim = Math.max(Math.abs(sz.x), Math.abs(sz.y), Math.abs(sz.z));
        if (maxDim > 50) {
        }
      }
    }

    // Generate terrain background for the minimap from the heightmap
    this.generateMinimapTerrainBackground();

    // Capture the minimap snapshot BEFORE hiding prototypes.
    // InstancedMesh objects require their source prototype meshes to be enabled
    // in order to render in an RTT-based screenshot. After hidePrototypes() the
    // source meshes are disabled and instanced buildings won't appear.
    await this.captureMinimapSnapshot();

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

      if (meta.buildingType === 'business') {
        if (meta.ownerId === characterId ||
            (Array.isArray(meta.employees) && meta.employees.some((e: any) =>
              typeof e === 'string' ? e === characterId : e?.id === characterId
            ))) {
          foundSettlementId = meta.settlementId;
        }
      }
      if (meta.buildingType === 'residence') {
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
    const wt = (worldType || '').toLowerCase();

    // Determine furniture set based on world type
    type FurnitureType = 'lamp_post' | 'bench' | 'well' | 'barrel' | 'crate' | 'market_stall' | 'streetlight' | 'terminal' | 'planter';
    let furnitureSet: FurnitureType[];

    if (wt.includes('medieval') || wt.includes('fantasy')) {
      furnitureSet = ['lamp_post', 'bench', 'well', 'barrel', 'crate', 'market_stall'];
    } else if (wt.includes('cyberpunk') || wt.includes('sci-fi') || wt.includes('modern')) {
      furnitureSet = ['streetlight', 'bench', 'terminal', 'planter', 'crate'];
    } else if (wt.includes('western') || wt.includes('frontier')) {
      furnitureSet = ['barrel', 'crate', 'lamp_post', 'bench', 'well'];
    } else {
      furnitureSet = ['lamp_post', 'bench', 'barrel', 'planter'];
    }

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

      // Skip if the prop would land inside a building
      if (this.isPointInsideAnyBuilding(propX, propZ)) continue;

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
    const furnitureToRoleMap: Record<string, string[]> = {
      'lamp_post': ['lamp', 'lamp_table'],
      'streetlight': ['lamp', 'lamp_table'],
      'barrel': ['storage', 'storage_alt'],
      'crate': ['chest', 'storage'],
      'bench': ['furniture_stool', 'furniture_chair'],
      'well': ['prop', 'decoration'],
      'market_stall': ['furniture_table'],
      'terminal': ['electronics', 'prop'],
      'planter': ['decoration', 'prop'],
    };

    const roles = furnitureToRoleMap[type] || [];
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
          // Templates are normalized to 1 unit height at load time.
          // Scale by desired real-world height in meters.
          const furnitureSizeMap: Record<string, number> = {
            'lamp_post': 2.5,
            'streetlight': 3.0,
            'bench': 0.8,
            'well': 1.2,
            'barrel': 0.8,
            'crate': 0.6,
            'market_stall': 2.0,
            'terminal': 1.2,
            'planter': 0.6,
          };
          const targetSize = furnitureSizeMap[type] || 1.0;
          const furnOrigH = this.objectModelOriginalHeights.get(role) || 1;
          const furnAbsScale = targetSize / furnOrigH;
          cloned.scaling.set(furnAbsScale, furnAbsScale, furnAbsScale);
          return cloned;
        }
      }
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

    } else if (type === 'market_stall') {
      const woodMat = getFurnMat('furn_stall_wood', () => {
        const m = new StandardMaterial('furn_stall_wood', scene);
        m.diffuseColor = new Color3(0.5, 0.35, 0.2);
        m.specularColor = Color3.Black();
        return m;
      });
      const table = MeshBuilder.CreateBox(`${name}_table`, { width: 2.5, height: 0.1, depth: 1.2 }, scene);
      table.position.y = 1;
      table.parent = parent;
      table.material = woodMat;

      const awning = MeshBuilder.CreateBox(`${name}_awning`, { width: 2.8, height: 0.05, depth: 1.5 }, scene);
      awning.position.y = 2.5;
      awning.parent = parent;
      awning.material = getFurnMat('furn_awning', () => {
        const m = new StandardMaterial('furn_awning', scene);
        m.diffuseColor = new Color3(0.7, 0.2, 0.15);
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

    if (!this.config.authToken || !this.config.worldId) return;

    // Use pre-selected playthrough ID if provided
    if (this.config.playthroughId) {
      this.playthroughId = this.config.playthroughId;
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
      } else {
        // Continue without playthrough for development/testing
      }
    } catch (error) {
      console.error('Error starting playthrough:', error);
      // Continue without playthrough for development/testing
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

    // Add exclamation marker on the minimap at the first settlement's position
    // to guide the player toward the notice board
    const firstSettlementMesh = this.settlementMeshes.values().next().value;
    if (firstSettlementMesh && this.minimap) {
      this.minimap.addMarker({
        id: 'assessment_notice_board',
        position: firstSettlementMesh.position.clone(),
        type: 'exclamation',
        label: 'Notice Board',
        color: '#ffcc00',
      });
    }

    // Add a special assessment notice to the notice board panel
    const targetLang = getTargetLanguage(this.worldData);
    const assessmentNotice = this.createAssessmentNotice('arrival', targetLang);
    this.noticeBoardPanel?.addArticle(assessmentNotice);

    // Set up callback: when assessment notice is clicked, launch the assessment
    this.noticeBoardPanel?.setOnAssessmentClicked(async (assessmentType) => {
      if (assessmentType !== 'arrival') return;

      // Remove the marker and notice
      this.minimap?.removeMarker('assessment_notice_board');
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

      playerMesh.scaling = new Vector3(1, 1, 1);
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

    const characters = (this.characters || this.worldData.characters || []).slice(0, MAX_NPCS);

    if (characters.length === 0) {
      return;
    }

    // Block material dirty mechanism during bulk NPC loading to prevent
    // redundant material state recomputation per NPC
    if (this.scene) this.scene.blockMaterialDirtyMechanism = true;

    const total = characters.length;
    for (let i = 0; i < total; i++) {
      const character = characters[i];
      if (i % 5 === 0) {
        this.updateLoadingScreen(`Loading NPCs... (${i + 1}/${total})`, 70 + Math.round((i / total) * 15));
      }
      try {
        await this.loadNPC(character);
      } catch (error) {
        console.error(`Failed to load NPC ${character.id}:`, error);
      }
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

  private getRoleForCharacter(character: WorldCharacter): NPCRole {
    const occupation = (character.occupation || '').toLowerCase();
    const faction = (character.faction || '').toLowerCase();
    const quests = this.worldData?.quests || [];

    // Quest givers always take precedence
    if (quests.some((q) => q.giverCharacterId === character.id)) {
      return 'questgiver';
    }

    const guardText = `${occupation} ${faction}`;
    if (
      guardText.includes('guard') ||
      guardText.includes('soldier') ||
      guardText.includes('watch') ||
      guardText.includes('knight') ||
      guardText.includes('militia') ||
      guardText.includes('army') ||
      guardText.includes('police')
    ) {
      return 'guard';
    }

    const merchantText = `${occupation} ${faction}`;
    if (
      merchantText.includes('merchant') ||
      merchantText.includes('shop') ||
      merchantText.includes('trader') ||
      merchantText.includes('vendor') ||
      merchantText.includes('market') ||
      merchantText.includes('guild')
    ) {
      return 'merchant';
    }

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

      // Try world-level NPC override first (role+gender specific, with fallback chain)
      const modelInfo = this.resolveNPCModelUrl(role, character);
      if (modelInfo) {
        const modelResult = await this.getOrLoadNPCModel(modelInfo.cacheKey, modelInfo.rootUrl, modelInfo.file, character.id, role);
        if (modelResult) {
          root = modelResult.root;
          animationGroups = modelResult.animationGroups;
          instancedBillboard = modelResult.billboard;
        }
      }

      // Try diverse NPC model based on gender, body type, and world genre
      if (!root) {
        const diverseModel = resolveNPCModelFromCharacter(character, role, this.config.worldType);
        const diverseResult = await this.getOrLoadNPCModel(diverseModel.cacheKey, diverseModel.rootUrl, diverseModel.file, character.id, role);
        if (diverseResult) {
          root = diverseResult.root;
          animationGroups = diverseResult.animationGroups;
          instancedBillboard = diverseResult.billboard;
        }
      }

      // Fallback to shared default NPC model (uses instancer with cloning)
      if (!root) {
        const defaultResult = await this.getOrLoadNPCModel('__default_npc__', '', NPC_MODEL_URL, character.id, role);
        if (defaultResult) {
          root = defaultResult.root;
          animationGroups = defaultResult.animationGroups;
          instancedBillboard = defaultResult.billboard;
        }
      }

      // Final fallback: direct load if instancer failed entirely
      if (!root) {
        const result = await SceneLoader.ImportMeshAsync("", "", NPC_MODEL_URL, this.scene);
        root = (this.selectPlayerMesh(result.meshes) || (result.meshes[0] as Mesh));
        animationGroups = result.animationGroups || [];
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
      const allNpcMeshes = [root, ...root.getChildMeshes()];
      const appearance = this.applyNPCAppearance(allNpcMeshes, character.id, role);

      // Create CharacterController for NPCs (with null camera for programmatic control)
      let controller: CharacterController | null = null;
      try {
        // Pass null as camera - NPCs don't need camera control
        controller = new CharacterController(root, null as any, this.scene);
        controller.setFaceForward(false);
        controller.setMode(0);
        controller.setStepOffset(0.75);
        controller.setSlopeLimit(15, 75);
        
        // Set up animations
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
      if (this.npcAccessorySystem) {
        this.npcAccessorySystem.attachAccessories(
          character.id,
          root,
          npcName,
          character.occupation || '',
        );
      }

      // Register with interaction prompt system (look-at based contextual prompts)
      if (this.npcInteractionPrompt) {
        this.npcInteractionPrompt.registerNPC({ id: character.id, name: npcName, mesh: root });
      }

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

      this.minimap?.addMarker({
        id: `npc_${character.id}`,
        position: root.position.clone(),
        type: 'npc',
        label: npcInfo.name
      });

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

  /** Generate a spawn candidate near a center point, validated against buildings. */
  private findSafeSpawnNear(center: Vector3, spread: number, minOffset: number, maxAttempts = 8): Vector3 {
    for (let i = 0; i < maxAttempts; i++) {
      const rawX = (Math.random() - 0.5) * spread;
      const rawZ = (Math.random() - 0.5) * spread;
      const x = center.x + Math.sign(rawX || 1) * Math.max(Math.abs(rawX), minOffset);
      const z = center.z + Math.sign(rawZ || 1) * Math.max(Math.abs(rawZ), minOffset);
      if (!this.isPointInsideAnyBuilding(x, z)) {
        return new Vector3(x, 12, z);
      }
    }
    // All attempts landed inside buildings — push further out
    const angle = Math.random() * Math.PI * 2;
    const dist = spread * 0.75 + minOffset;
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
    let meshIndex = 0;
    for (const mesh of meshes) {
      if (mesh.material && mesh.material instanceof StandardMaterial) {
        const mat = mesh.material.clone(`${mesh.material.name}_appearance_${characterId.slice(-6)}`) as StandardMaterial;

        // Alternate between skin and clothing colors based on mesh index
        // Typically mesh 0 is body/skin, others are clothing/accessories
        const baseColor = meshIndex === 0 ? appearance.skinColor
          : meshIndex % 2 === 1 ? appearance.clothingColor
          : appearance.accentColor;

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
   * Phase 4B: Enter a building interior. Generates the interior if needed,
   * performs a fade-to-black transition, and teleports the player inside.
   */
  private async enterBuilding(
    buildingId: string,
    buildingType: string,
    businessType?: string,
    doorWorldPos?: Vector3
  ): Promise<void> {
    if (!this.playerMesh || !this.scene || !this.interiorGenerator || this.isInsideBuilding) return;

    // Save current overworld position, rotation, and camera state
    this.savedOverworldPosition = this.playerMesh.position.clone();
    this.savedOverworldRotationY = this.playerMesh.rotation.y;
    if (this.camera) {
      this.savedOverworldCameraAlpha = this.camera.alpha;
    }

    // Generate interior (or retrieve cached)
    const interior = this.interiorGenerator.generateInterior(
      buildingId,
      buildingType,
      businessType,
      doorWorldPos
    );
    this.activeInterior = interior;

    // Fade to black
    await this.performFadeTransition(true);

    // Hide the sky dome and set a dark clear color so no void is visible
    const skyDome = this.scene.getMeshByName('sky-dome');
    if (skyDome) skyDome.setEnabled(false);
    this.scene.clearColor = new Color4(0.05, 0.04, 0.03, 1);

    // Teleport player to interior door position and face inward (north / +Z)
    this.playerMesh.position = interior.doorPosition.clone();
    this.playerMesh.rotation.y = 0; // face +Z (into the room)

    // Adjust camera for interior: bring it close to the player so walls
    // fill the view and no void is visible outside the room
    if (this.camera) {
      this.camera.alpha = -Math.PI / 2;
      const interiorRadius = Math.min(interior.width, interior.depth) / 4;
      const clampedRadius = Math.max(2, Math.min(interiorRadius, 5));
      this.camera.lowerRadiusLimit = clampedRadius;
      this.camera.upperRadiusLimit = clampedRadius;
      this.camera.radius = clampedRadius;
    }
    this.playerController?.resetPhysicsState();
    this.isInsideBuilding = true;
    this.currentBuildingBusinessType = businessType;

    // Register placed interior NPCs with business behavior system
    if (this.businessBehaviorSystem && this.interiorNPCManager && businessType) {
      this.businessBehaviorSystem.clearAll();
      for (const placed of this.interiorNPCManager.getPlacedNPCs()) {
        this.businessBehaviorSystem.registerNPC(placed.npcId, placed.role, businessType);
      }
    }

    // Create an invisible trigger zone just outside the door opening.
    // When the player walks through the door, this detects it and auto-exits.
    this.createInteriorDoorTrigger(interior);

    // Show toast notification
    const label = businessType || buildingType || 'Building';
    this.guiManager?.showToast({
      title: `Entered ${label}`,
      description: 'Walk through the door or press E to exit',
      duration: 2500,
    });

    // Fade back in
    await this.performFadeTransition(false);
  }

  /**
   * Create an invisible trigger zone at the interior door opening.
   * When the player crosses it (walks outside the room), auto-exit.
   */
  private createInteriorDoorTrigger(interior: InteriorLayout): void {
    // Clean up previous trigger
    this.interiorDoorTrigger?.dispose();
    this.interiorDoorTrigger = null;

    if (!this.scene) return;

    // Place a thin invisible box just outside the door opening
    const trigger = MeshBuilder.CreateBox('interior_door_trigger', {
      width: 3,
      height: 3,
      depth: 1,
    }, this.scene);
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

    // Capture interior before async operations (activeInterior may be nulled by callbacks during await)
    const interior = this.activeInterior;

    // Fade to black
    await this.performFadeTransition(true);

    // Restore sky dome and clear color for the overworld
    if (this.scene) {
      const skyDome = this.scene.getMeshByName('sky-dome');
      if (skyDome) skyDome.setEnabled(true);
      this.scene.clearColor = new Color4(0.75, 0.75, 0.75, 1);
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
      // Restore camera angle to where it was before entering
      if (this.camera) {
        this.camera.alpha = this.savedOverworldCameraAlpha;
      }
    } else if (interior?.exitPosition) {
      // Fallback: use the exit position stored in the interior layout
      this.playerMesh.position = interior.exitPosition.clone();
    }
    this.playerController?.resetPhysicsState();

    // Clean up door trigger
    this.interiorDoorTrigger?.dispose();
    this.interiorDoorTrigger = null;

    this.isInsideBuilding = false;
    this.activeInterior = null;
    this.savedOverworldPosition = null;
    this.currentBuildingBusinessType = undefined;

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
      if (!this.scene) { resolve(); return; }

      // Create a fullscreen overlay plane
      const overlay = MeshBuilder.CreatePlane('fade_overlay', { size: 500 }, this.scene);
      overlay.position = this.scene.activeCamera
        ? this.scene.activeCamera.position.clone()
        : Vector3.Zero();
      overlay.billboardMode = Mesh.BILLBOARDMODE_ALL;
      overlay.renderingGroupId = 3;
      overlay.isPickable = false;

      const mat = new StandardMaterial('fade_mat', this.scene);
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

      const observer = this.scene.onBeforeRenderObservable.add(() => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        mat.alpha = startAlpha + (endAlpha - startAlpha) * t;

        // Keep overlay in front of camera
        if (this.scene?.activeCamera) {
          const cam = this.scene.activeCamera;
          const forward = cam.getForwardRay().direction.normalize();
          overlay.position = cam.position.add(forward.scale(1));
        }

        if (t >= 1) {
          if (this.scene) {
            this.scene.onBeforeRenderObservable.remove(observer);
          }
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

      // Track location discovery for quest objectives
      this.questObjectManager?.trackLocationDiscovery(zone.id);
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
        if (this.buildingEntrySystem?.isInside) {
          this.buildingEntrySystem.exitBuilding();
        } else {
          this.exitBuilding();
        }
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
            if (this.buildingEntrySystem) {
              this.buildingEntrySystem.enterBuilding(buildingId);
            } else {
              this.enterBuilding(
                buildingId,
                metadata.buildingType,
                metadata.businessType,
                buildingMesh.position.clone()
              );
            }
            return;
          }
        }
      }

      const npcId = metadata.npcId as string | undefined;
      if (npcId && this.npcMeshes.has(npcId)) {
        this.setSelectedNPC(npcId);
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
      const examName = (dbItem.languageLearningData?.targetWord && isLanguageLearningWorld(this.worldData))
        ? `${dbItem.languageLearningData.targetWord} (${dbItem.name})`
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

    if (this.inventory) {
      this.inventory.addItem(item);
    }

    if (this.questObjectManager) {
      this.questObjectManager.trackCollectedItemByName(item.name);
    }
    this.eventBus.emit({
      type: 'item_collected', itemId: item.id, itemName: item.name, quantity: 1,
      taxonomy: { category: item.category, material: item.material, baseType: item.baseType, rarity: item.rarity, itemType: item.type },
    });

    // Use target language name for language-learning games
    const targetWord = item.languageLearningData?.targetWord;
    const displayName = (targetWord && isLanguageLearningWorld(this.worldData))
      ? targetWord
      : item.name;
    const subtitle = (targetWord && isLanguageLearningWorld(this.worldData))
      ? `(${item.name}) — ${item.description || ''}`
      : (item.description || `Added to your inventory (${item.type})`);

    this.guiManager?.showToast({
      title: `Collected ${displayName}`,
      description: subtitle,
      duration: 2500,
    });
  }

  /**
   * Handle X key: examine the nearest world-prop object within range.
   * Shows its target-language name (if in a language-learning world) and
   * emits an object_examined event for quest/vocabulary tracking.
   */
  private handleExamineObject(): void {
    if (!this.playerMesh) return;

    const maxExamineDistance = 5;
    const playerPos = this.playerMesh.position;
    let nearestMesh: Mesh | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const propMesh of this.worldPropMeshes) {
      if (!propMesh || propMesh.isDisposed()) continue;
      const dx = playerPos.x - propMesh.position.x;
      const dz = playerPos.z - propMesh.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance <= maxExamineDistance && distance < nearestDistance) {
        nearestMesh = propMesh;
        nearestDistance = distance;
      }
    }

    if (!nearestMesh) {
      this.guiManager?.showToast({
        title: "Nothing to examine",
        description: "Move closer to an object and try again (X)",
        duration: 1500,
      });
      return;
    }

    // Resolve the object role from mesh metadata
    const objectRole = (nearestMesh.metadata?.objectRole || nearestMesh.name || "").toLowerCase();
    const dbItem = this.worldItems.find(
      (item: any) => item.objectRole && item.objectRole.toLowerCase() === objectRole
    );

    const itemName = dbItem?.name || objectRole.split(/[_\s]+/).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    const langData = dbItem?.languageLearningData;
    const isLangWorld = isLanguageLearningWorld(this.worldData);

    if (isLangWorld && langData?.targetWord) {
      // Show target-language label with pronunciation
      const pronunciation = langData.pronunciation ? ` [${langData.pronunciation}]` : '';
      this.guiManager?.showToast({
        title: langData.targetWord,
        description: `${itemName}${pronunciation}`,
        duration: 3000,
      });

      // Track vocabulary exposure via language tracker
      const tracker = this.chatPanel?.getLanguageTracker();
      if (tracker) {
        tracker.analyzeNPCResponse(langData.targetWord);
      }

      // Emit event for quest tracking and Prolog assertion
      this.eventBus.emit({
        type: 'object_examined',
        objectId: dbItem?.id || objectRole,
        objectName: itemName,
        targetWord: langData.targetWord,
        targetLanguage: langData.targetLanguage,
        pronunciation: langData.pronunciation,
        category: langData.category,
      });
    } else {
      // Non-language-learning world: just show the object name
      this.guiManager?.showToast({
        title: itemName,
        description: dbItem?.description || 'You examine the object closely.',
        duration: 2500,
      });
    }
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
        languageLearningData: dbItem.languageLearningData || undefined,
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
  private _minimapUpdateTimer = 0;
  private _fpsDisplayTimer = 0;
  private _settlementCheckTimer = 0;
  private _interactionPromptTimer = 0;

  private setupUpdateLoop(): void {
    if (!this.scene) return;

    // Throttled NPC ground snapping, minimap updates, and chunk culling
    this.renderObserver = this.scene.onBeforeRenderObservable.add(() => {
      const dt = this.scene?.getEngine().getDeltaTime() || 16;

      // Clamp player to terrain bounds so they can't walk off the edge
      if (this.playerMesh && !this.isInsideBuilding) {
        const half = (this.terrainSize || 512) / 2 - 2; // 2-unit margin from edge
        const pos = this.playerMesh.position;
        if (pos.x < -half) pos.x = -half;
        if (pos.x > half) pos.x = half;
        if (pos.z < -half) pos.z = -half;
        if (pos.z > half) pos.z = half;
      }

      // Update NPC interaction prompt (throttled to every 100ms)
      this._interactionPromptTimer += dt;
      if (this._interactionPromptTimer >= 100) {
        this._interactionPromptTimer = 0;
        this.npcInteractionPrompt?.update();
      }

      // Check if player walked through the interior door trigger zone
      if (this.isInsideBuilding && this.interiorDoorTrigger && this.playerMesh) {
        if (this.interiorDoorTrigger.intersectsMesh(this.playerMesh, false)) {
          this.exitBuilding();
        }
      }

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
      if (this._settlementCheckTimer >= 500 && this.settlementSceneManager && this.playerMesh && !this.isInsideBuilding) {
        this._settlementCheckTimer = 0;
        this.checkSettlementTransition();

        // Check quest location and direction proximity while we have the timer
        if (this.questObjectManager && this.playerMesh) {
          this.questObjectManager.checkLocationProximity(this.playerMesh.position);
          this.questObjectManager.checkDirectionProximity(this.playerMesh.position);
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
            case 'guard': color = '#F44336'; break;
            case 'merchant': color = '#4CAF50'; break;
            case 'questgiver': color = '#FFC107'; break;
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
      return;
    }

    if (!characterId) return;

    const currentPos = instance.mesh.position;

    // --- Handle NPC inside a building (hidden) ---
    if (instance.isInsideBuilding) {
      // Check if goal has expired — time to exit the building
      if (instance.scheduleGoalExpiry && now >= instance.scheduleGoalExpiry) {
        instance.isInsideBuilding = false;
        instance.insideBuildingId = undefined;
        instance.scheduleGoalExpiry = undefined;
        instance.schedulePathWaypoints = undefined;
        instance.schedulePathIndex = undefined;

        // Place NPC at the building door before showing
        const entry = this.npcScheduleSystem.getEntry(characterId);
        if (entry?.currentGoal?.doorPosition) {
          instance.mesh.position = entry.currentGoal.doorPosition.clone();
          instance.controller?.resetPhysicsState();
        }

        // Show the NPC mesh with fade-in to avoid teleportation pop-in
        instance.mesh.setEnabled(true);
        if (instance.billboardLOD) instance.billboardLOD.setEnabled(true);
        instance.fadeInProgress = 0;
        // Start fully transparent
        instance.mesh.getChildMeshes().forEach(m => { m.visibility = 0; });
        instance.mesh.visibility = 0;
      } else {
        // Still inside — do nothing
        return;
      }
    }

    // --- If waiting (idle pause), check if wait is over ---
    if (instance.wanderWaitUntil && now < instance.wanderWaitUntil) {
      instance.controller.walk(false);
      instance.controller.turnLeft(false);
      instance.controller.turnRight(false);
      return;
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

    // --- Schedule system available? Use goal-directed behavior ---
    if (this.npcScheduleSystem.hasStreetData()) {
      const entry = this.npcScheduleSystem.getEntry(characterId);

      // Pick a new goal if none or expired
      if (!entry?.currentGoal || now >= (instance.scheduleGoalExpiry || 0)) {
        const goal = this.npcScheduleSystem.pickNextGoal(characterId, now);
        if (!goal) return;

        // Update the schedule entry
        if (entry) entry.currentGoal = goal;
        instance.scheduleGoalExpiry = goal.expiresAt;

        if ((goal.type === 'go_to_building' || goal.type === 'visit_friend') && goal.doorPosition) {
          // Compute sidewalk path to building door
          const path = this.npcScheduleSystem.findSidewalkPath(currentPos, goal.doorPosition);
          instance.schedulePathWaypoints = path;
          instance.schedulePathIndex = 0;
        } else if (goal.type === 'wander_sidewalk' || goal.type === 'idle_at_building') {
          // Pick a random sidewalk destination (idle_at_building also wanders if no building)
          const target = this.npcScheduleSystem.getRandomSidewalkTarget();
          if (target) {
            const path = this.npcScheduleSystem.findSidewalkPath(currentPos, target);
            instance.schedulePathWaypoints = path;
            instance.schedulePathIndex = 0;
          }
        }
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
              // Turn ~90-180 degrees away from current heading
              const turnAngle = (Math.PI / 2) + Math.random() * Math.PI;
              instance.mesh.rotation.y += turnAngle;
              return;
            }
            if (instance.stuckTicks >= 5) {
              // Persistent stuck: abandon the path entirely and pick a new goal
              instance.controller.walk(false);
              instance.controller.turnLeft(false);
              instance.controller.turnRight(false);
              instance.schedulePathWaypoints = undefined;
              instance.scheduleGoalExpiry = undefined;
              instance.stuckTicks = 0;
              instance.wanderWaitUntil = now + 2000 + Math.random() * 3000;
              if (entry) entry.currentGoal = null;
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

          // If this was the last waypoint, we've arrived at destination
          if (wpIdx + 1 >= waypoints.length) {
            instance.controller.walk(false);
            instance.controller.turnLeft(false);
            instance.controller.turnRight(false);

            const goal = entry?.currentGoal;
            if ((goal?.type === 'go_to_building' || goal?.type === 'visit_friend') && goal.buildingId) {
              // Enter the building — hide the NPC
              instance.isInsideBuilding = true;
              instance.insideBuildingId = goal.buildingId;
              instance.mesh.setEnabled(false);
              if (instance.billboardLOD) instance.billboardLOD.setEnabled(false);

              // Set expiry for when NPC exits the building
              // Goal expiry determines how long they stay
              const stayDuration = Math.max(0, goal.expiresAt - now);
              instance.scheduleGoalExpiry = now + stayDuration;
            } else {
              // Wander goal complete — idle briefly then pick a new goal
              instance.wanderWaitUntil = now + 3000 + Math.random() * 5000;
              instance.schedulePathWaypoints = undefined;
              instance.scheduleGoalExpiry = undefined;
              if (entry) entry.currentGoal = null;
            }
          }
          return;
        }

        // Walk toward the current waypoint
        this.moveNPCToward(instance, targetWP);
        return;
      }

      // No path — idle briefly, then pick a new goal
      instance.controller.walk(false);
      instance.controller.turnLeft(false);
      instance.controller.turnRight(false);
      instance.wanderWaitUntil = now + 2000 + Math.random() * 3000;
      instance.schedulePathWaypoints = undefined;
      if (entry) entry.currentGoal = null;
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

    // Fallback: random sidewalk destination for explore/wander/other
    if (!destination) {
      destination = this.npcScheduleSystem.getRandomSidewalkTarget();
    }

    if (destination && this.npcScheduleSystem.hasStreetData()) {
      const path = this.npcScheduleSystem.findSidewalkPath(currentPos, destination);
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
    const dx = target.x - currentPos.x;
    const dz = target.z - currentPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.1) {
      instance.controller.walk(false);
      instance.controller.turnLeft(false);
      instance.controller.turnRight(false);
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
    } else {
      instance.controller.walk(false);
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
   * Capture a top-down orthographic screenshot of the world for the minimap.
   * Must be called BEFORE hidePrototypes() so clone source meshes are present.
   */
  private generateMinimapTerrainBackground(): void {
    if (!this.guiManager) return;
    const biome = ProceduralNatureGenerator.getBiomeFromWorldType(this.config.worldType);
    const biomeName = biome.name.toLowerCase();

    // Terrain elevation is disabled (flat ground), so generate a uniform
    // minimap background using the biome's midland color instead of the
    // heightmap PNG (which would show false water zones at low elevations).
    const palette = TERRAIN_PALETTES[biomeName] || TERRAIN_PALETTES.plains;
    const [r, g, b] = palette.midland;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(0, 0, size, size);
      this.guiManager?.setMinimapTerrainBackground(canvas);
    }
  }

  private async captureMinimapSnapshot(): Promise<void> {
    if (!this.scene || !this.guiManager) return;
    const engine = this.scene.getEngine();
    if (!engine) return;

    const worldSize = this.terrainSize || 512;
    const half = worldSize / 2;

    // Create an orthographic camera looking straight down
    const snapCam = new FreeCamera("_minimapSnapCam", new Vector3(0, 800, -0.01), this.scene);
    snapCam.rotation = new Vector3(Math.PI / 2, 0, 0);
    snapCam.mode = Camera.ORTHOGRAPHIC_CAMERA;
    snapCam.orthoLeft = -half;
    snapCam.orthoRight = half;
    snapCam.orthoTop = half;
    snapCam.orthoBottom = -half;
    snapCam.minZ = 0.1;
    snapCam.maxZ = 2000;

    // Hide sky dome so it doesn't dominate the view
    const hideNames = new Set(['sky-dome', 'sky_dome', 'skybox', 'skyBox', 'backdrop', 'environment']);
    const meshesToRestore: { mesh: AbstractMesh; wasEnabled: boolean }[] = [];
    for (const mesh of this.scene.meshes) {
      if (hideNames.has(mesh.name) && mesh.isEnabled()) {
        meshesToRestore.push({ mesh, wasEnabled: true });
        mesh.setEnabled(false);
      }
    }

    // Hide GUI so fullscreen button / panels don't appear in the snapshot
    const guiWasVisible = this.guiManager.advancedTexture.rootContainer.isVisible;
    this.guiManager.advancedTexture.rootContainer.isVisible = false;

    const prevClearColor = this.scene.clearColor.clone();
    this.scene.clearColor = new Color4(0.22, 0.35, 0.18, 1);

    const SNAPSHOT_SIZE = 2048;

    // Temporarily remove LOD levels so distant buildings aren't culled.
    // Buildings have addLODLevel(500, null) but the minimap camera is at y=800.
    const lodBackup: { mesh: Mesh; distance: number }[] = [];
    for (const mesh of this.scene.meshes) {
      if (mesh.isDisposed() || !(mesh instanceof Mesh)) continue;
      const lodLevels = mesh.getLODLevels();
      if (lodLevels.length > 0) {
        for (const lod of lodLevels) {
          lodBackup.push({ mesh, distance: lod.distanceOrScreenCoverage });
          mesh.removeLODLevel(lod.mesh);
        }
      }
    }

    try {
      const dataUrl = await Tools.CreateScreenshotUsingRenderTargetAsync(
        engine, snapCam, SNAPSHOT_SIZE
      );
      this.guiManager.setMinimapImage(dataUrl, worldSize);
      // Share the snapshot with the full-screen map
      if (this.fullscreenMap) {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            this.fullscreenMap?.setWorldImage(canvas, worldSize);
          }
        };
        img.src = dataUrl;
      }
    } catch (err) {
      console.error('[BabylonGame] Minimap snapshot failed:', err);
    }

    // Restore LOD levels
    for (const entry of lodBackup) {
      if (!entry.mesh.isDisposed()) {
        entry.mesh.addLODLevel(entry.distance, null);
      }
    }

    // Restore scene state
    for (const entry of meshesToRestore) {
      entry.mesh.setEnabled(entry.wasEnabled);
    }
    this.guiManager.advancedTexture.rootContainer.isVisible = guiWasVisible;
    this.scene.clearColor = prevClearColor;
    snapCam.dispose();
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
    }

    // Collect quest markers from active quests that have a location
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

    // Collect quest item markers from active fetch quest collectibles
    const questItemMarkers = this.questObjectManager?.getCollectibleItemPositions()?.map(item => ({
      id: item.id,
      itemName: item.itemName,
      position: item.position
    })) ?? [];

    // Collect NPC positions
    const npcPositions: Array<{ id: string; position: { x: number; z: number }; role?: string; name?: string }> = [];
    this.npcMeshes.forEach((instance, npcId) => {
      if (!instance?.mesh || !instance.mesh.isEnabled()) return;
      npcPositions.push({
        id: npcId,
        position: { x: instance.mesh.position.x, z: instance.mesh.position.z },
        role: instance.role,
        name: instance.characterData?.firstName,
      });
    });

    const minimapData = {
      settlements: settlementsData,
      buildings: this._minimapBuildings,
      streets: this._minimapStreets,
      questMarkers,
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

      // Advance game time
      this.gameTimeManager.update(this.engine!.getDeltaTime());

      this.scene.render();

      // Update perf overlay every 500ms
      this._perfTimer += this.engine!.getDeltaTime();
      if (this._perfTimer >= 500 && this._perfDiv) {
        this._perfTimer = 0;
        const fps = this.engine!.getFps().toFixed(0);
        const activeMeshes = this.scene.getActiveMeshes().length;
        const totalMeshes = this.scene.meshes.length;
        const drawCalls = (this.engine as any)._drawCalls?.lastSecAverage?.toFixed(0) ?? (this.engine as any)._drawCalls?.current ?? 0;
        const materials = this.scene.materials.length;
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

    // If the unified menu is open, block all other game input
    if (this.gameMenuSystem?.isOpen) {
      return;
    }

    // G - Interact with nearest NPC (selects + opens chat) or exit conversation
    if (event.code === KEY_NPC_INTERACT && !event.repeat) {
      event.preventDefault();
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
          // Otherwise, try to interact with nearest NPC
          await this.handleProximityInteraction();
        }
      }
    }

    // Enter - Enter/exit nearest building
    if (event.code === KEY_BUILDING_INTERACT && !event.repeat) {
      event.preventDefault();
      await this.handleBuildingInteraction();
    }

    // F - Attack/Respawn
    if (event.code === KEY_ATTACK && !event.repeat) {
      event.preventDefault();
      this.handleAttack();
    }

    // T - Target nearest enemy
    if (event.code === KEY_TARGET_ENEMY && !event.repeat) {
      event.preventDefault();
      this.handleTargetEnemy();
    }

    // J - Open journal (game menu journal tab)
    if (event.code === KEY_QUEST_LOG && !event.repeat) {
      event.preventDefault();
      this.gameMenuSystem?.open("journal");
    }

    // Tab - Toggle full-screen map
    if (event.code === KEY_FULLSCREEN_MAP && !event.repeat) {
      event.preventDefault();
      this.fullscreenMap?.toggle();
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

    // X - Examine nearest object (target-language label)
    if (event.code === KEY_EXAMINE_OBJECT && !event.repeat) {
      event.preventDefault();
      this.handleExamineObject();
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
      // Use the rich conversation API (Gemini-powered, target language)
      const response = await fetch('/api/conversations/simulate-rich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          char1Id: npc1Id,
          char2Id: npc2Id,
          worldId: this.config.worldId,
          turnCount: 6,
        }),
      });

      if (!response.ok || !this.isEavesdropping) {
        this.chatPanel?.addSystemMessage('You could not make out what they were saying.');
        this.endEavesdrop();
        return;
      }

      const data = await response.json();
      const utterances = data.utterances;

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
          const ttsResponse = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice, gender, targetLanguage }),
          });

          if (ttsResponse.ok && this.isEavesdropping) {
            const audioBlob = await ttsResponse.blob();
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
   * Fetch quest guidance context for an NPC and apply it to the chat panel.
   * Runs async — the chat panel will update its system prompt when guidance arrives.
   */
  private async fetchQuestGuidance(npcId: string, worldId: string): Promise<void> {
    try {
      const res = await fetch(`/api/worlds/${worldId}/quests/npc-guidance/${npcId}`);
      if (!res.ok) return;
      const guidance = await res.json();
      if (guidance.hasGuidance && guidance.systemPromptAddition) {
        this.chatPanel.setQuestGuidancePrompt(guidance.systemPromptAddition);
      }
    } catch (e) {
      // Non-critical — NPC will work without quest guidance
    }
  }

  // ─── Shop / Mercantile Handlers ──────────────────────────────────────────

  private async handleOpenShop(merchantId: string): Promise<void> {
    if (!this.shopPanel || !this.inventory) return;

    try {
      const merchantData = await this.dataSource.getMerchantInventory(
        this.config.worldId,
        merchantId
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

    this.inventory?.addItem(item);
    this.playerGold -= transaction.totalPrice;
    this.inventory?.setGold(this.playerGold);

    this.eventBus.emit({
      type: 'item_collected', itemId: item.id, itemName: item.name, quantity: transaction.quantity,
      taxonomy: { category: item.category, material: item.material, baseType: item.baseType, rarity: item.rarity, itemType: item.type },
    });
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

    // Check quest objectives for item collection
    this.questObjectManager?.trackCollectedItemByName(item.name);
  }

  private handleShopSell(transaction: ShopTransaction): void {
    this.inventory?.removeItem(transaction.item.id, transaction.quantity);
    this.playerGold += transaction.totalPrice;
    this.inventory?.setGold(this.playerGold);

    this.eventBus.emit({ type: 'item_removed', itemId: transaction.item.id, itemName: transaction.item.name, quantity: transaction.quantity });

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
    this.inventory?.removeItem(item.id, 1);

    this.eventBus.emit({ type: 'item_dropped', itemId: item.id, itemName: item.name, quantity: 1 });

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

  private handleUseItem(item: InventoryItem): void {
    // Quest and key items: emit event without consuming
    if (item.type === 'quest' || item.type === 'key') {
      this.eventBus.emit({ type: 'item_used', itemId: item.id, itemName: item.name });
      this.guiManager?.showToast({
        title: `Used ${item.name}`,
        description: item.type === 'key' ? 'Key item activated' : 'Quest item used',
        duration: 2000,
      });
      return;
    }

    // Consumable, food, drink: apply effects and consume
    if (['consumable', 'food', 'drink'].includes(item.type)) {
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

      this.guiManager?.showToast({
        title: `Used ${item.name}`,
        description: descriptions.join(', '),
        duration: 2000,
      });
    }
  }

  private handleEquipItem(item: InventoryItem): void {
    if (!this.equipmentManager) return;

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

    const tracker = this.chatPanel?.getLanguageTracker();
    if (tracker) {
      this.conversationHistoryPanel.updateData(tracker.getRecentConversations(20));
    }
    this.conversationHistoryPanel.toggle();
  }

  private handleToggleSkillTree(): void {
    if (!this.skillTreePanel) return;

    const tracker = this.chatPanel?.getLanguageTracker();
    if (tracker) {
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
    this.skillTreePanel.toggle();
  }

  /**
   * Fetch main quest journal data from the server.
   * Called on world load and after quest completions.
   */
  private async fetchMainQuestJournalData(): Promise<void> {
    try {
      const worldId = this.config.worldId;
      const playerId = this.config.userId || 'player';
      const cefrParam = this.playerCefrLevel ? `?cefrLevel=${this.playerCefrLevel}` : '';
      const res = await fetch(`/api/worlds/${worldId}/main-quest/${playerId}${cefrParam}`);
      if (!res.ok) return;
      const data = await res.json();
      this.mainQuestJournalData = {
        currentChapterId: data.state?.currentChapterId ?? null,
        totalXPEarned: data.state?.totalXPEarned ?? 0,
        chapters: data.chapters ?? [],
        playerCefrLevel: this.playerCefrLevel,
      };
    } catch {
      // Non-critical — journal will show empty state
    }
  }

  /**
   * Fetch quest portfolio and learning journal data from the server.
   */
  private async fetchPortfolioData(): Promise<void> {
    try {
      const worldId = this.config.worldId;
      const playerName = this.config.userId || 'Player';
      const res = await fetch(`/api/worlds/${worldId}/portfolio/${encodeURIComponent(playerName)}`);
      if (!res.ok) return;
      this.portfolioData = await res.json();
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
      const res = await fetch(`/api/worlds/${worldId}/main-quest/${playerId}/record-completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questType, cefrLevel: this.playerCefrLevel }),
      });
      if (!res.ok) return;
      const { result } = await res.json();
      if (result?.chapterAdvance?.advanced) {
        this.guiManager?.showToast({
          title: `Chapter Complete: ${result.chapterAdvance.completedChapterTitle}`,
          description: result.chapterAdvance.outroNarrative || '',
          duration: 6000,
        });
        if (result.chapterAdvance.nextChapterTitle) {
          setTimeout(() => {
            this.guiManager?.showToast({
              title: `New Chapter: ${result.chapterAdvance.nextChapterTitle}`,
              description: result.chapterAdvance.introNarrative || '',
              duration: 6000,
            });
          }, 3000);
        }
      }
      // Refresh journal and portfolio data
      await this.fetchMainQuestJournalData();
      this.fetchPortfolioData();
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

    // Add items directly to inventory and emit events
    for (const item of droppedItems) {
      this.inventory?.addItem(item);
      this.eventBus.emit({
        type: 'item_collected', itemId: item.id, itemName: item.name, quantity: 1,
        taxonomy: { category: item.category, material: item.material, baseType: item.baseType, rarity: item.rarity, itemType: item.type },
      });
      this.questObjectManager?.trackCollectedItemByName(item.name);
    }

    // Show loot toast
    const lootDesc = droppedItems.map(i => i.name).join(', ');
    const goldDesc = goldDrop > 0 ? `${goldDrop} gold` : '';
    const parts = [lootDesc, goldDesc].filter(Boolean).join(' + ');
    if (parts) {
      this.guiManager?.showToast({
        title: 'Loot Dropped!',
        description: parts,
        duration: 3000,
      });
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
      this.questLanguageFeedbackPanel?.hide();
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

    // Wire callbacks
    this.questLanguageFeedbackTracker.setOnFeedbackUpdate((state) => {
      this.questLanguageFeedbackPanel?.updateFromState(state);
    });
    this.questLanguageFeedbackTracker.setOnFeedbackItem((item) => {
      this.questLanguageFeedbackPanel?.addFeedbackItem(item);
    });

    // Show panel
    this.questLanguageFeedbackPanel?.show(activeQuest.title);
    this.questLanguageFeedbackPanel?.updateFromState(this.questLanguageFeedbackTracker.getState());
  }

  private async handleQuestObjectiveCompleted(questId: string, objectiveId: string, type: string): Promise<void> {
    try {
      const quests = await this.dataSource.loadQuests(this.config.worldId);
      const quest = quests.find((q: any) => q.id === questId);
      if (!quest) return;

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

      const allObjectivesComplete = quest.objectives?.every((obj: any) => obj.completed);

      // TODO: Write progress/completion to playthrough delta layer, not world data.
      // For now, only write progress updates (not status changes) to keep world data clean.
      await this.dataSource.updateQuest(questId, {
        progress: updatedProgress,
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

      // Mark as completed in overlay (not world)
      await this.dataSource.updateQuest(quest.id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      // Trigger full celebration ceremony
      if (this.questCompletionManager) {
        await this.questCompletionManager.completeQuest({
          id: questData.id,
          worldId: questData.worldId || this.config.worldId,
          title: questData.title,
          questType: questData.questType,
          experienceReward: questData.experienceReward || 0,
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

    // Item rewards
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
      this.inventory?.addItem(item);
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
      }
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
      this.craftingSystem.setOnCraftComplete((item) => {
        this.guiManager?.showToast({
          title: `Crafted: ${item.icon} ${item.name}`,
          description: `x${item.quantity}`,
          duration: 3000,
        });
        // Track crafting for quest objectives
        this.questObjectManager?.trackItemCrafted(item.name);
        this.eventBus.emit({
          type: 'item_crafted', itemId: item.name, itemName: item.name, quantity: item.quantity || 1,
          taxonomy: { category: item.category, itemType: item.category },
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
    // Clean up NPC simulation LOD
    if (this.npcSimulationLOD) {
      this.npcSimulationLOD.dispose();
      this.npcSimulationLOD = null;
    }
    // Clean up NPC accessory system
    if (this.npcAccessorySystem) {
      this.npcAccessorySystem.dispose();
      this.npcAccessorySystem = null;
    }
    // Clean up NPC interaction prompt
    if (this.npcInteractionPrompt) {
      this.npcInteractionPrompt.dispose();
      this.npcInteractionPrompt = null;
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
  }

  private disposePlayer(): void {
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
    this.interiorGenerator?.dispose();
    this.activeInterior = null;
    this.savedOverworldPosition = null;
    this.isInsideBuilding = false;
  }

  private applyWorldTexturesFromAssets(): void {
    if (!this.textureManager || !this.worldAssets || this.worldAssets.length === 0) {
      return;
    }


    // Prefer an explicit ground texture from 3D config, otherwise first texture_ground asset
    let groundAsset = this.world3DConfig?.groundTextureId
      ? this.worldAssets.find((a) => a.id === this.world3DConfig!.groundTextureId)
      : undefined;

    if (!groundAsset) {
      groundAsset = this.worldAssets.find((a) => a.assetType === "texture_ground");
    }

    if (groundAsset) {
      this.textureManager.applyGroundTexture(groundAsset, { uScale: 8, vScale: 8, useBump: true });
      this.selectedGroundTexture = groundAsset.id;

      // Reset diffuseColor to white so the texture shows its true colors
      // (createGround sets a tinting color that would fight with collection textures)
      const groundMesh = this.scene?.getMeshByName("ground");
      if (groundMesh?.material) {
        (groundMesh.material as StandardMaterial).diffuseColor = new Color3(1, 1, 1);
      }
    } else {
    }

    // Prefer an explicit road texture from 3D config, otherwise first texture_material asset,
    // finally fall back to the ground texture if nothing else is available
    let roadAsset = this.world3DConfig?.roadTextureId
      ? this.worldAssets.find((a) => a.id === this.world3DConfig!.roadTextureId)
      : undefined;

    if (!roadAsset) {
      roadAsset = this.worldAssets.find((a) => a.assetType === "texture_material");
    }

    if (!roadAsset && groundAsset) {
      roadAsset = groundAsset;
    }

    if (roadAsset) {
      this.textureManager.applyRoadTexture(roadAsset, { uScale: 4, vScale: 4 });
      this.selectedRoadTexture = roadAsset.id;
    }

    // Apply wall textures to buildings if available
    const wallAsset = this.worldAssets.find((a) => a.assetType === "texture_wall");
    if (wallAsset) {
      this.textureManager.applySettlementTextures(wallAsset, { uScale: 2, vScale: 2 });
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
    this.ambientConversationManager?.dispose();
    this.npcInitiatedConversationController?.dispose();
    this.socializationController?.dispose();
    this.ambientConversationManager = null;
    this.socializationController = null;
    this.npcTalkingIndicator?.dispose();
    this.npcTalkingIndicator = null;
    this.buildingCollisionSystem?.dispose();
    this.buildingCollisionSystem = null;
    this.buildingInfoDisplay?.dispose();
    this.minimap?.dispose();
    this.fullscreenMap?.dispose();
    this.inventory?.dispose();
    this.shopPanel?.dispose();
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
    this.gameTimeManager.dispose();
    this.eventBus.dispose();
    this.questObjectManager?.dispose();
    this.questIndicatorManager?.dispose();
    this.questWorldObjectLinker?.dispose();
    this.questWorldObjectLinker = null;
    this.questIndicatorManager = null;
    this.radialMenu?.dispose();
    this.questNotificationManager?.dispose();
    this.questNotificationManager = null;
    this.questLanguageFeedbackPanel?.dispose();
    this.questLanguageFeedbackPanel = null;
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
}
