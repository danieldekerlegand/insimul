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
  Vector3,
  Observer
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

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
import { ProceduralBuildingGenerator, BuildingStyle } from "@/components/3DGame/ProceduralBuildingGenerator.ts";
import { ProceduralNatureGenerator, BiomeStyle } from "@/components/3DGame/ProceduralNatureGenerator.ts";
import { RoadGenerator } from "@/components/3DGame/RoadGenerator.ts";
import { WorldScaleManager, ScaledSettlement } from "@/components/3DGame/WorldScaleManager.ts";
import { BuildingInfoDisplay } from "@/components/3DGame/BuildingInfoDisplay.ts";
import { ChunkManager } from "@/components/3DGame/ChunkManager.ts";
import { BabylonMinimap } from "@/components/3DGame/BabylonMinimap.ts";
import { BabylonInventory, InventoryItem } from "@/components/3DGame/BabylonInventory.ts";
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
import { VRHUDManager } from "@/components/3DGame/VRHUDManager.ts";
import { VRCombatAdapter } from "@/components/3DGame/VRCombatAdapter.ts";
import { VRChatPanel } from "@/components/3DGame/VRChatPanel.ts";
import { VRVocabularyLabels } from "@/components/3DGame/VRVocabularyLabels.ts";
import { VRHandTrackingManager } from "@/components/3DGame/VRHandTrackingManager.ts";
import { createDebugLabel } from "@/components/3DGame/DebugLabelUtils.ts";
import { VRAccessibilityManager } from "@/components/3DGame/VRAccessibilityManager.ts";
import { NPCTalkingIndicator } from "@/components/3DGame/NPCTalkingIndicator.ts";
import { NPCAmbientConversationManager } from "@/components/3DGame/NPCAmbientConversationManager.ts";
import { BuildingInteriorGenerator, InteriorLayout } from "@/components/3DGame/BuildingInteriorGenerator.ts";
import { GameMenuSystem, GameMenuCallbacks } from "@/components/3DGame/GameMenuSystem.ts";
import { DataSource, createDataSource } from "@/components/3DGame/DataSource.ts";
import { SettlementSceneManager, SettlementZone } from "@/components/3DGame/SettlementSceneManager.ts";
import { GamePrologEngine } from "@/components/3DGame/GamePrologEngine.ts";
import { GameEventBus } from "@/components/3DGame/GameEventBus.ts";
import type { VisualAsset } from "@shared/schema.ts";

// Constants
const PLAYER_MODEL_URL = "/assets/player/Vincent-frontFacing.babylon";
const NPC_MODEL_URL = "/assets/npc/starterAvatars.babylon";
const FOOTSTEP_SOUND_URL = "/assets/footstep_carpet_000.ogg";
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
  occupation?: string;
  faction?: string;
  disposition?: string;
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
  // Animation tracking
  animationGroups?: any[];
  currentAnimation?: any;
  // Phase 7: per-NPC throttling
  lastAIUpdate?: number;
  blendingDisabled?: boolean;
  // Phase 4: NPC billboard LOD
  billboardLOD?: Mesh;
  isBillboardMode?: boolean;
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
  private buildingGenerator: ProceduralBuildingGenerator | null = null;
  private natureGenerator: ProceduralNatureGenerator | null = null;
  private roadGenerator: RoadGenerator | null = null;
  private worldScaleManager: WorldScaleManager | null = null;
  private buildingInfoDisplay: BuildingInfoDisplay | null = null;
  private minimap: BabylonMinimap | null = null;
  private inventory: BabylonInventory | null = null;
  private shopPanel: BabylonShopPanel | null = null;
  private rulesPanel: BabylonRulesPanel | null = null;
  private ruleEnforcer: RuleEnforcer | null = null;
  private prologEngine: GamePrologEngine | null = null;
  private eventBus: GameEventBus = new GameEventBus();
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
  private vrManager: VRManager | null = null;
  private gameMenuSystem: GameMenuSystem | null = null;

  // Player
  private playerController: CharacterController | null = null;
  private playerMesh: Mesh | null = null;
  private playerHealthBar: HealthBar | null = null;
  private playerEnergy: number = INITIAL_ENERGY;
  private playerGold: number = 100;
  private playerHealth: number = 100;

  // NPCs
  private npcMeshes: Map<string, NPCInstance> = new Map();
  private npcInfos: NPCDisplayInfo[] = [];
  private npcHealthBars: Map<string, HealthBar> = new Map();
  private selectedNPCId: string | null = null;
  private conversationNPCId: string | null = null;
  private preConversationCameraMode: CameraMode | null = null;
  // NPC model cache: load each model URL once, clone for subsequent NPCs
  private npcModelCache: Map<string, { root: Mesh; animationGroups: any[] }> = new Map();

  // Settlements and world
  private settlementMeshes: Map<string, Mesh> = new Map();
  private settlementRoadMeshes: Mesh[] = [];
  private zoneBoundaryMeshes: Map<string, { boundary: Mesh | null; particles?: ParticleSystem | null; zoneRadius?: number; zoneColor?: Color3 }> = new Map();
  private buildingData: Map<string, { position: Vector3; metadata: any; mesh: Mesh }> = new Map();
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
  private actionInProgress: boolean = false;
  private isInCombat: boolean = false;
  private isVRMode: boolean = false;
  private vrSupported: boolean = false;
  private combatTargetId: string | null = null;
  private firstSettlementSpawnPosition: Vector3 | null = null;

  // Zone system
  private currentZone: { id: string; name: string; type: string } | null = null;
  private playthroughId: string | null = null;
  private currentReputation: any | null = null;

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
  private isInsideBuilding: boolean = false;

  // Observers (for cleanup)
  private keyboardHandler: ((event: KeyboardEvent) => void) | null = null;
  private resizeHandler: (() => void) | null = null;
  private pointerObserver: Observer<PointerInfo> | null = null;
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
        console.error('[BabylonGame] loadPlayer failed (continuing to NPCs):', playerError);
      }
      this.updateLoadingScreen('Loading NPCs...', 70);
      await this.loadNPCs();
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

      console.log('[BabylonGame] Init complete! Scene meshes:', this.scene?.meshes.length,
        'Active meshes:', this.scene?.getActiveMeshes().length);
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
   * Dispose of all game resources
   */
  public dispose(): void {
    console.warn('[BabylonGame] dispose() called — destroying game instance');
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
      console.log(`[BabylonGame] Camera mode changed to: ${mode}`);
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
    camera.checkCollisions = true;
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

      const diffuseTexture = new Texture("/assets/ground/ground.jpg", scene);
      diffuseTexture.uScale = tileScale;
      diffuseTexture.vScale = tileScale;
      groundMaterial.diffuseTexture = diffuseTexture;

      const bumpTexture = new Texture("/assets/ground/ground-normal.png", scene);
      bumpTexture.uScale = bumpScale;
      bumpTexture.vScale = bumpScale;
      groundMaterial.bumpTexture = bumpTexture;
      groundMaterial.diffuseColor = theme?.groundColor ?? new Color3(0.9, 0.6, 0.4);
      groundMaterial.specularColor = Color3.Black();

      const ground = MeshBuilder.CreateGroundFromHeightMap(
        "ground",
        "/assets/ground/ground_heightMap.png",
        {
          width: size,
          height: size,
          minHeight: 0,
          maxHeight: 10,
          subdivisions: 64,
          onReady: (mesh) => {
            mesh.material = groundMaterial;
            mesh.checkCollisions = true;
            mesh.isPickable = true;
            mesh.receiveShadows = true;
            mesh.metadata = { ...(mesh.metadata || {}), terrainSize: size };
            console.log('Ground ready! Terrain size:', size);
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
      console.warn('[BabylonGame] initializeSystems: scene or canvas is null, returning early');
      return;
    }

    const scene = this.scene;

    // Initialize texture manager
    this.textureManager = new TextureManager(scene);

    // Initialize audio manager
    this.audioManager = new AudioManager(scene);

    // Initialize GUI manager
    console.log('[BabylonGame] About to initialize GUI manager...');
    this.guiManager = new BabylonGUIManager(scene, {
      worldName: this.config.worldName,
      worldId: this.config.worldId
    });
    
    // Check if GUI texture is properly attached
    console.log('[BabylonGame] GUI texture created:', this.guiManager.advancedTexture);
    console.log('[BabylonGame] Scene active camera:', scene.activeCamera);
    
    // Set up GUI callbacks
    this.guiManager.setOnBackPressed(() => this.config.onBack?.());
    this.guiManager.setOnFullscreenPressed(() => this.handleToggleFullscreen());
    this.guiManager.setOnDebugPressed(() => this.handleToggleDebug());
    this.guiManager.setOnVRToggled(() => this.handleToggleVR());
    this.guiManager.setOnNPCSelected((npcId) => this.setSelectedNPC(npcId));
    this.guiManager.setOnActionSelected((actionId) => this.handlePerformAction(actionId));
    this.guiManager.setOnPayFines(() => this.handlePayFines());

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
        // Collect all reputation data from settlements
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
        const quests = this.worldData?.quests || [];
        return quests.map((q) => ({
          id: q.id,
          title: q.name || q.id,
          description: '',
          status: q.status || 'active',
          questType: '',
          difficulty: '',
          progress: null,
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
      onNPCSelected: (npcId: string) => this.setSelectedNPC(npcId),
      onPayFines: () => this.handlePayFines(),
      onBackToEditor: () => this.config.onBack?.(),
      onToggleFullscreen: () => this.handleToggleFullscreen(),
      onToggleDebug: () => this.handleToggleDebug(),
      onToggleVR: () => this.handleToggleVR(),
    };

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
    console.log('[BabylonGame] About to initialize chat panel...');
    this.chatPanel = new BabylonChatPanel(this.guiManager.advancedTexture, scene);
    console.log('[BabylonGame] Chat panel initialized with texture:', this.chatPanel.advancedTexture);
    console.log('[BabylonGame] GUI manager texture:', this.guiManager.advancedTexture);
    console.log('[BabylonGame] Are they the same?', this.chatPanel.advancedTexture === this.guiManager.advancedTexture);
    this.chatPanel.setOnClose(() => {
      console.log('Chat closed');
      this.handleConversationEnd();
    });
    this.chatPanel.setOnQuestAssigned((questData) => {
      this.questTracker?.updateQuests(this.config.worldId);
      this.updateQuestIndicators(); // Update NPC indicators
      this.guiManager?.showToast({
        title: 'New Quest!',
        description: questData.title || 'Quest assigned',
      });
      this.eventBus.emit({ type: 'quest_accepted', questId: questData.id || '', questTitle: questData.title || '' });
    });
    this.chatPanel.setOnQuestTurnedIn((questId, rewards) => {
      this.questTracker?.updateQuests(this.config.worldId);
      this.updateQuestIndicators(); // Update NPC indicators
      console.log('[BabylonGame] Quest turned in:', questId, rewards);
    });
    this.chatPanel.setOnActionSelect((actionId: string) => {
      this.handlePerformAction(actionId);
    });
    this.chatPanel.setOnNPCConversationStarted((npcId: string) => {
      // Track NPC conversation for quest objectives (talk_to_npc)
      this.questObjectManager?.trackNPCConversation(npcId);
      this.eventBus.emit({ type: 'npc_talked', npcId, npcName: npcId, turnCount: 1 });
      console.log('[BabylonGame] NPC conversation started with:', npcId);
    });
    this.chatPanel.setOnVocabularyUsed((word: string) => {
      this.questObjectManager?.trackVocabularyUsage(word);
      this.eventBus.emit({ type: 'vocabulary_used', word, correct: true });
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

    // Initialize quest tracker
    this.questTracker = new BabylonQuestTracker(this.guiManager.advancedTexture, scene);
    if (this.prologEngine) {
      this.questTracker.setPrologEngine(this.prologEngine);
    }

    // Initialize zone audio
    this.initializeZoneAudio(scene);

    // Initialize radial menu
    this.radialMenu = new BabylonRadialMenu(scene);

    // Initialize quest object manager
    this.questObjectManager = new QuestObjectManager(scene);
    this.questObjectManager.setOnObjectCollected((questId, objectiveId) => {
      this.handleQuestObjectiveCompleted(questId, objectiveId, 'collect');
    });
    this.questObjectManager.setOnLocationVisited((questId, objectiveId) => {
      this.handleQuestObjectiveCompleted(questId, objectiveId, 'visit');
    });
    this.questObjectManager.setOnObjectiveCompleted((questId, objectiveId) => {
      this.handleQuestObjectiveCompleted(questId, objectiveId, 'objective');
    });

    // Initialize quest indicator manager
    this.questIndicatorManager = new QuestIndicatorManager(scene);

    // Initialize building info display
    this.buildingInfoDisplay = new BuildingInfoDisplay(scene, this.guiManager.advancedTexture);

    // Initialize minimap
    this.minimap = new BabylonMinimap(scene, this.guiManager.advancedTexture, this.terrainSize);

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
    this.prologEngine.setOnQuestCompleted((questId) => {
      console.log('[BabylonGame] Prolog determined quest complete:', questId);
      this.questTracker?.updateQuests(this.config.worldId);
      this.updateQuestIndicators();
    });

    // Wire Prolog engine into rule enforcer
    this.ruleEnforcer.setPrologEngine(this.prologEngine);

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

    // Initialize procedural generators
    this.buildingGenerator = new ProceduralBuildingGenerator(scene);
    this.natureGenerator = new ProceduralNatureGenerator(scene);
    this.roadGenerator = new RoadGenerator(scene);
    this.interiorGenerator = new BuildingInteriorGenerator(scene);
    this.worldScaleManager = new WorldScaleManager(512, this.config.worldId);

    if (this.buildingGenerator) {
      console.log('[BabylonGame] initializeSystems: initializing building assets...');
      await this.buildingGenerator.initializeAssets(this.config.worldType);
      console.log('[BabylonGame] initializeSystems: building assets done');
    }
    if (this.natureGenerator) {
      console.log('[BabylonGame] initializeSystems: initializing nature assets...');
      await this.natureGenerator.initializeAssets(this.config.worldType);
      console.log('[BabylonGame] initializeSystems: nature assets done');
    }
    console.log('[BabylonGame] initializeSystems complete');
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
      this.settlements = settlements;
      this.rules = [...rules, ...baseRules];
      this.countries = countries;
      this.states = states;
      this.baseResources = baseResources;
      this.assets = assets;
      this.config3D = config3D;
      this.worldItems = worldItems || [];

      console.log('[BabylonGame] World data loaded successfully');
      console.log('[BabylonGame] Data summary:', {
        world: world?.name || 'no world',
        settlements: settlements?.length || 0,
        characters: characters?.length || 0,
        quests: quests?.length || 0,
        assets: assets?.length || 0
      });

      // Initialize Prolog engine with world data
      if (this.prologEngine) {
        try {
          const prologContent = await this.dataSource.loadPrologContent(worldId);
          const truths = await this.dataSource.loadTruths(worldId);
          await this.prologEngine.initialize({
            characters: characters || [],
            settlements: settlements || [],
            rules: rules || [],
            actions: [...(actions || []), ...(baseActions || [])],
            quests: quests || [],
            truths: truths || [],
            content: prologContent || undefined,
          });
          console.log('[BabylonGame] Prolog engine initialized:', this.prologEngine.getStats());

          // Sync existing inventory items to Prolog
          if (this.inventory) {
            const existingItems = this.inventory.getAllItems();
            if (existingItems.length > 0) {
              await this.prologEngine.initializeInventory(existingItems);
            }
          }
        } catch (prologError) {
          console.warn('[BabylonGame] Prolog engine initialization failed (non-fatal):', prologError);
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

      console.log('[BabylonGame] World data loaded successfully');

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
      console.log(`World size: ${optimalSize} (${countries.length} countries, ${states.length} states, ${settlements.length} settlements)`);
      this.rescaleGround();

    } catch (error) {
      console.error('Failed to load world data', error);
      throw error;
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
    console.log(`[BabylonGame] applyWorld3DConfig CALLED — assets=${worldAssets?.length ?? 0}, config3D=${config3D ? 'present' : 'NULL'}`);
    if (!this.scene || !config3D) {
      console.warn(`[BabylonGame] applyWorld3DConfig skipped: scene=${!!this.scene}, config3D=${!!config3D}`);
      return;
    }

    // Diagnostic: log what the asset collection provides
    console.log(`[BabylonGame] 3D Config:`, {
      buildingModels: config3D.buildingModels ? Object.keys(config3D.buildingModels) : 'none',
      natureModels: config3D.natureModels ? Object.keys(config3D.natureModels) : 'none',
      objectModels: config3D.objectModels ? Object.keys(config3D.objectModels) : 'none',
      questObjectModels: config3D.questObjectModels ? Object.keys(config3D.questObjectModels) : 'none',
      groundTextureId: config3D.groundTextureId || 'none',
      roadTextureId: config3D.roadTextureId || 'none',
      wallTextureId: config3D.wallTextureId || 'none',
      roofTextureId: config3D.roofTextureId || 'none',
    });
    console.log(`[BabylonGame] World assets available: ${worldAssets.length} total, ${worldAssets.filter(a => a.filePath).length} with filePath`);
    console.log(`[BabylonGame] World asset IDs:`, worldAssets.map(a => `${a.id} (${a.name})`));

    const scene = this.scene;

    const findAssetById = (id: string | undefined | null): VisualAsset | null => {
      if (!id) return null;
      const asset = worldAssets.find((a) => a.id === id);
      if (!asset) {
        console.warn(`[BabylonGame] ⚠️ findAssetById MISS: id="${id}" not found in ${worldAssets.length} worldAssets`);
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
          console.warn(`[BabylonGame] Loading model from external URL (should be local): ${asset.filePath}`);
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

        console.log(`[BabylonGame] Loading model: rootUrl="${rootUrl}", fileName="${fileName}" (asset: ${asset.name || asset.id})`);
        const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, scene);
        if (result.meshes.length === 0) {
          console.warn(`[BabylonGame] Model loaded but no meshes in result for asset ${asset.id} (${asset.filePath})`);
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
        console.log(`[BabylonGame] ✅ Model loaded successfully: ${asset.name || asset.id} (${result.meshes.length} meshes)`);
        // Debug: log all mesh names to identify env/skybox meshes causing black box
        for (const m of result.meshes) {
          const bi = m.getBoundingInfo();
          const size = bi.boundingBox.maximumWorld.subtract(bi.boundingBox.minimumWorld);
          console.log(`  [mesh] "${m.name}" size=(${size.x.toFixed(1)}, ${size.y.toFixed(1)}, ${size.z.toFixed(1)})`);
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
          console.log(`[BabylonGame] Registered building model for role: ${role}${scaleHint != null ? ` (scaleHint=${scaleHint})` : ''}`);
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
        console.log(`[BabylonGame] Applied wall texture to building generator: ${wallAsset.name}`);
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
        console.log(`[BabylonGame] Applied roof texture to building generator: ${roofAsset.name}`);
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
              console.log(`[BabylonGame] Measured object "${role}" originalH=${h.toFixed(2)}`);
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
      console.warn('[BabylonGame] generateProceduralWorld: missing dependencies', {
        scene: !!this.scene,
        worldData: !!this.worldData,
        buildingGenerator: !!this.buildingGenerator,
        natureGenerator: !!this.natureGenerator,
        worldScaleManager: !!this.worldScaleManager,
      });
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
    console.log('[BabylonGame] Found settlements:', settlements.length, settlements);
    
    if (settlements.length === 0) {
      console.log("No settlements found for procedural world generation");
      return;
    }

    const worldStyle = ProceduralBuildingGenerator.getStyleForWorld(worldType, "plains");
    const biome = ProceduralNatureGenerator.getBiomeFromWorldType(worldType);

    console.log(`Generating procedural world: ${settlements.length} settlements, style: ${worldStyle.name}, biome: ${biome.name}`);

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
      false
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

        console.log(
          `Settlement ${settlement.name}: ${businesses.length} businesses, ${lots.length} lots, ${residences.length} residences`
        );

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

        // Generate lot positions
        const lotPositions = worldScaleManager
          .generateLotPositions(scaledSettlement, buildingCount)
          .map((pos) => this.projectToGround(pos.x, pos.z));

        // Spawn buildings (track per-settlement positions for street furniture)
        const settlementBuildingPositions: Vector3[] = [];
        let buildingIndex = 0;

        // First, spawn businesses at their lots
        for (const business of businesses) {
          if (buildingIndex >= lotPositions.length) break;

          let buildingSpec = ProceduralBuildingGenerator.createSpecFromData({
            id: business.id,
            type: 'business',
            businessType: business.businessType,
            position: lotPositions[buildingIndex],
            worldStyle,
            population: scaledSettlement.population
          });

          buildingSpec = {
            ...buildingSpec,
            position: this.findStableBuildingPosition(
              buildingSpec.position,
              buildingSpec.width,
              buildingSpec.depth
            )
          };

          const building = buildingGenerator.generateBuilding(buildingSpec);
          allBuildingPositions.push(building.position);
          settlementBuildingPositions.push(building.position.clone());

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

          // Register building for hover info display
          this.buildingInfoDisplay?.registerBuilding(building);

          buildingIndex++;
        }

        // Then spawn residences from backend data
        for (const residence of residences) {
          if (buildingIndex >= lotPositions.length) break;

          // Determine residence type based on occupancy/size
          const occupants = residence.residentIds || residence.occupants || [];
          const residenceType = occupants.length > 8
            ? 'residence_large'
            : occupants.length > 4
              ? 'residence_medium'
              : 'residence_small';

          let buildingSpec = ProceduralBuildingGenerator.createSpecFromData({
            id: residence.id,
            type: 'residence',
            businessType: residenceType,
            position: lotPositions[buildingIndex],
            worldStyle,
            population: occupants.length
          });

          buildingSpec = {
            ...buildingSpec,
            position: this.findStableBuildingPosition(
              buildingSpec.position,
              buildingSpec.width,
              buildingSpec.depth
            )
          };

          const building = buildingGenerator.generateBuilding(buildingSpec);
          allBuildingPositions.push(building.position);

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

          // Register building for hover info display
          this.buildingInfoDisplay?.registerBuilding(building);

          buildingIndex++;
        }

        // Phase 1: Fill with minimum business buildings if backend didn't provide any
        if (businesses.length === 0 && buildingIndex < lotPositions.length) {
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
          const maxBusinessSlots = Math.max(2, Math.floor(lotPositions.length * 0.4));
          const businessesToPlace = businessMix.slice(0, Math.min(businessMix.length, maxBusinessSlots - buildingIndex));

          for (const biz of businessesToPlace) {
            if (buildingIndex >= lotPositions.length) break;

            const bizId = `business_auto_${settlement.id}_${buildingIndex}`;
            let buildingSpec = ProceduralBuildingGenerator.createSpecFromData({
              id: bizId,
              type: 'business',
              businessType: biz.businessType,
              position: lotPositions[buildingIndex],
              worldStyle,
              population: scaledSettlement.population
            });

            buildingSpec = {
              ...buildingSpec,
              position: this.findStableBuildingPosition(
                buildingSpec.position,
                buildingSpec.width,
                buildingSpec.depth
              )
            };

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

            this.buildingInfoDisplay?.registerBuilding(building);
            buildingIndex++;
          }

          console.log(`  Auto-placed ${businessesToPlace.length} business buildings for ${settlement.name}`);
        }

        // Phase 2: Fill any remaining positions with generic residences
        while (buildingIndex < lotPositions.length) {
          const residenceType = Math.random() > 0.7
            ? 'residence_large'
            : Math.random() > 0.4
              ? 'residence_medium'
              : 'residence_small';

          let buildingSpec = ProceduralBuildingGenerator.createSpecFromData({
            id: `residence_generic_${settlement.id}_${buildingIndex}`,
            type: 'residence',
            businessType: residenceType,
            position: lotPositions[buildingIndex],
            worldStyle,
            population: Math.floor(scaledSettlement.population / buildingCount)
          });

          buildingSpec = {
            ...buildingSpec,
            position: this.findStableBuildingPosition(
              buildingSpec.position,
              buildingSpec.width,
              buildingSpec.depth
            )
          };

          const building = buildingGenerator.generateBuilding(buildingSpec);
          allBuildingPositions.push(building.position);
          settlementBuildingPositions.push(building.position.clone());

          // Add metadata for generic residences
          const genericResId = `residence_generic_${settlement.id}_${buildingIndex}`;
          building.metadata = {
            buildingId: genericResId,
            buildingType: 'residence',
            residenceId: genericResId,
            settlementId: settlement.id,
            occupants: []
          };
          building.isPickable = true;

          // Register building for hover info display
          this.buildingInfoDisplay?.registerBuilding(building);

          buildingIndex++;
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

        // Generate intra-settlement streets (hub-and-spoke from center to buildings)
        if (this.roadGenerator && settlementBuildingPositions.length > 0) {
          this.roadGenerator.generateSettlementRoads(
            settlement.id,
            settlementCenterForProps,
            settlementBuildingPositions,
            sampleHeight
          );
        }

        // Create a subtle ground marker and signpost for the settlement center
        const settlementCenter = this.projectToGround(
          scaledSettlement.position.x,
          scaledSettlement.position.z
        );

        // Store first settlement position for player spawn
        if (!this.firstSettlementSpawnPosition && i === 0) {
          this.firstSettlementSpawnPosition = settlementCenter.clone();
          console.log(`[BabylonGame] Player will spawn in ${settlement.name} at:`, this.firstSettlementSpawnPosition);
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
            propInstance.checkCollisions = false;
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
      } catch (error) {
        console.error(`Failed to generate buildings for settlement ${settlement.name}:`, error);
      }
    }

    this.settlementMeshes = settlementMap;

    // Generate roads between settlements
    if (this.roadGenerator && boundaryData.length >= 2) {
      console.log('Generating roads between settlements...');

      // Set road appearance based on world type
      const wt = (this.config.worldType || '').toLowerCase();
      if (wt.includes('medieval') || wt.includes('fantasy')) {
        this.roadGenerator.setRoadColor(new Color3(0.5, 0.4, 0.3)); // Dirt path
        this.roadGenerator.setRoadWidth(3);
      } else if (wt.includes('cyberpunk') || wt.includes('sci-fi') || wt.includes('modern')) {
        this.roadGenerator.setRoadColor(new Color3(0.3, 0.3, 0.35)); // Asphalt
        this.roadGenerator.setRoadWidth(5);
      } else if (wt.includes('desert') || wt.includes('sand')) {
        this.roadGenerator.setRoadColor(new Color3(0.6, 0.5, 0.35)); // Sandy path
        this.roadGenerator.setRoadWidth(2.5);
      } else {
        this.roadGenerator.setRoadColor(new Color3(0.45, 0.38, 0.3)); // Default dirt
        this.roadGenerator.setRoadWidth(3);
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

    // Generate nature elements (trees, rocks, grass, flowers)
    console.log('Generating nature elements...');

    const worldBounds = {
      minX: -terrainSize / 2 + 50, // Leave space at edges
      maxX: terrainSize / 2 - 50,
      minZ: -terrainSize / 2 + 50,
      maxZ: terrainSize / 2 - 50
    };

    // Collect road positions for avoidance (trees shouldn't grow on roads)
    const avoidPositions = [...allBuildingPositions];
    if (this.roadGenerator) {
      for (const roadMesh of this.roadGenerator.getRoadMeshes()) {
        avoidPositions.push(roadMesh.position.clone());
      }
    }

    // Scale vegetation counts by biome density
    const vegetationScale = Math.max(0.1, biome.treeDensity);

    // Trees - avoid building and road positions (count determined internally by biome density)
    natureGenerator.generateTrees(biome, worldBounds, avoidPositions, 20, sampleHeight);

    // Rocks — more in mountains/wasteland, fewer in forests
    const rockCount = Math.floor((terrainSize / 20) * (biome.treeType === 'dead' ? 2 : 1));
    natureGenerator.generateRocks(biome, worldBounds, rockCount, sampleHeight);

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

    // Generate wilderness props (camps, ruins, landmarks) between settlements
    this.generateWildernessProps(
      worldBounds,
      boundaryData.map((s) => s.position),
      worldType || '',
      sampleHeight
    );

    console.log('Procedural world generation complete!');

    // Diagnostic: scene state after generation
    const groundMesh = scene.getMeshByName('ground');
    console.log('[BabylonGame] Post-generation diagnostics:', {
      totalMeshes: scene.meshes.length,
      groundExists: !!groundMesh,
      groundEnabled: groundMesh?.isEnabled(),
      groundVisible: groundMesh?.isVisible,
      groundPosition: groundMesh ? `(${groundMesh.position.x}, ${groundMesh.position.y}, ${groundMesh.position.z})` : 'N/A',
      buildingCount: this.buildingData.size,
      settlementMeshCount: this.settlementMeshes.size,
      worldPropCount: this.worldPropMeshes.length,
      firstSettlementSpawn: this.firstSettlementSpawnPosition
        ? `(${this.firstSettlementSpawnPosition.x.toFixed(1)}, ${this.firstSettlementSpawnPosition.y.toFixed(1)}, ${this.firstSettlementSpawnPosition.z.toFixed(1)})`
        : 'none',
    });

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
          console.warn(`[DIAG] Large mesh: "${m.name}" size=(${sz.x.toFixed(1)},${sz.y.toFixed(1)},${sz.z.toFixed(1)}) pos=(${m.position.x.toFixed(1)},${m.position.y.toFixed(1)},${m.position.z.toFixed(1)}) enabled=${m.isEnabled()} visible=${m.isVisible}`);
        }
      }
    }

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
      console.log(`[Perf] Deferred freeze: ${frozenMaterials} materials frozen`);
    }, 3000);

    // Note: Octree spatial partitioning is NOT used because it indexes meshes
    // at creation time. Meshes added later (player, NPCs) are excluded from
    // frustum checks and become invisible. The ChunkManager already provides
    // effective spatial culling for static geometry.

    // Activate all chunks initially so everything is visible until the
    // render loop starts calling update() with the player position.
    this.chunkManager.activateAll();

    const stats = this.chunkManager.getStats();
    console.log(`[Perf] Optimized: ${frozenCount} meshes frozen, ${nonPickableCount} non-pickable, ${chunkedCount} chunked (${stats.totalChunks} chunks, all activated)`);

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
    const globalNames = new Set(['ground', 'sky-dome', 'sky_dome', 'skybox', 'sunLight', 'hemisphericLight']);

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
    console.log(`[Phase 8] SettlementSceneManager initialized: ${ssmStats.totalZones} zones, ${ssmStats.categorized.settlement} settlement meshes, ${ssmStats.categorized.overworld} overworld meshes, ${ssmStats.categorized.global} global meshes`);
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
      const propY = sampleHeight(propX, propZ);

      const furnitureType = furnitureSet[Math.floor(Math.random() * furnitureSet.length)];
      const prop = this.createFurnitureProp(furnitureType, `street_prop_${settlementId}_${propCount}`, scene);
      if (!prop) continue;

      prop.position = new Vector3(propX, propY, propZ);
      prop.rotation.y = Math.random() * Math.PI * 2;
      prop.checkCollisions = false;
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
      prop.checkCollisions = false;
      prop.isPickable = false;
      createDebugLabel(scene, prop, `WILDERNESS: ${wildType}`, 5);
      this.worldPropMeshes.push(prop);
      placed++;
    }

    if (placed > 0) {
      console.log(`[BabylonGame] Placed ${placed} wilderness props`);
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
    if (!this.config.authToken || !this.config.worldId) return;

    try {
      const playthrough = await this.dataSource.startPlaythrough(
        this.config.worldId,
        this.config.authToken || '',
        `${this.config.worldName} - Playthrough`
      );
      
      if (playthrough && playthrough.id) {
        this.playthroughId = playthrough.id;
        console.log('[BabylonGame] Playthrough started:', this.playthroughId);
      } else {
        console.warn('[BabylonGame] Failed to start playthrough - no valid response');
        // Continue without playthrough for development/testing
      }
    } catch (error) {
      console.error('Error starting playthrough:', error);
      // Continue without playthrough for development/testing
    }
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
          console.log('[BabylonGame] Using player model from asset collection:', playerRootUrl + playerFileName);
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
        console.log('[BabylonGame] Player spawned in first settlement at:', playerMesh.position);
      } else {
        // Spawn at origin but above ground level
        playerMesh.position = new Vector3(0, 10, 0);
        console.log('[BabylonGame] Player spawned at world origin (no settlements found)');
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
        controller.setStepOffset(0.4);
        controller.setSlopeLimit(30, 60);
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
            console.log('[BabylonGame] Using footstep sound from asset collection:', footstepSoundUrl);
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
            console.log(`[BabylonGame] Camera perspective set to: ${perspective}`);
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
    console.log('[BabylonGame] loadNPCs called');
    
    if (!this.scene || !this.worldData) {
      console.warn('[BabylonGame] loadNPCs skipped: scene or worldData missing', {
        scene: !!this.scene,
        worldData: !!this.worldData
      });
      return;
    }

    const characters = (this.characters || this.worldData.characters || []).slice(0, MAX_NPCS);
    console.log(`[BabylonGame] loadNPCs: ${characters.length} characters to load (max ${MAX_NPCS})`);
    console.log('[BabylonGame] characters source:', this.characters ? 'this.characters' : this.worldData.characters ? 'worldData.characters' : 'none');

    if (characters.length === 0) {
      console.warn('[BabylonGame] No characters found!');
      console.log('[BabylonGame] this.characters:', this.characters);
      console.log('[BabylonGame] this.worldData.characters:', this.worldData.characters);
      return;
    }

    // Block material dirty mechanism during bulk NPC loading to prevent
    // redundant material state recomputation per NPC
    if (this.scene) this.scene.blockMaterialDirtyMechanism = true;

    for (const character of characters) {
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
   * Resolve the model URL for an NPC based on role overrides and world config.
   */
  private resolveNPCModelUrl(role: NPCRole): { rootUrl: string; file: string; cacheKey: string } | null {
    const characterModels = this.world3DConfig?.characterModels || {};
    const roleSpecificId = characterModels[role];
    const defaultId = characterModels.npcDefault;
    const npcConfigId = roleSpecificId || defaultId;

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
   * Load or retrieve a cached NPC model template. The first call for a given
   * cacheKey loads the model via ImportMeshAsync; subsequent calls clone it.
   */
  private async getOrLoadNPCModel(_cacheKey: string, rootUrl: string, file: string): Promise<{ root: Mesh; animationGroups: any[] } | null> {
    if (!this.scene) return null;

    try {
      // Load a fresh copy each time — the browser caches the file download.
      // instantiateHierarchy/clone approaches break for .babylon files where
      // geometry meshes are siblings rather than children of __root__.
      const result = await SceneLoader.ImportMeshAsync('', rootUrl, file, this.scene);
      const root = this.selectPlayerMesh(result.meshes) || result.meshes[0];
      if (!root || !(root instanceof Mesh)) {
        result.meshes.forEach((m: any) => m.dispose());
        return null;
      }

      // Reparent sibling meshes under root so they move together
      for (const m of result.meshes) {
        if (m !== root && !m.parent) {
          m.parent = root;
        }
      }

      return { root, animationGroups: result.animationGroups || [] };
    } catch (err) {
      console.warn(`[BabylonGame] Failed to load NPC model ${_cacheKey}:`, err);
      return null;
    }
  }

  private async loadNPC(character: WorldCharacter): Promise<void> {
    if (!this.scene) return;

    try {
      const role = this.getRoleForCharacter(character);
      let root: Mesh | null = null;
      let animationGroups: any[] = [];

      // Try world-level NPC override first (role-specific, then npcDefault fallback)
      const modelInfo = this.resolveNPCModelUrl(role);
      if (modelInfo) {
        const modelResult = await this.getOrLoadNPCModel(modelInfo.cacheKey, modelInfo.rootUrl, modelInfo.file);
        if (modelResult) {
          root = modelResult.root;
          animationGroups = modelResult.animationGroups;
        }
      }

      // Fallback to shared default NPC model
      if (!root) {
        const defaultResult = await this.getOrLoadNPCModel('__default_npc__', '', NPC_MODEL_URL);
        if (defaultResult) {
          root = defaultResult.root;
          animationGroups = defaultResult.animationGroups;
        }
      }

      // Final fallback: direct load if caching failed
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

      // Debug: log mesh state to diagnose visibility issues
      const childMeshes = root.getChildMeshes();
      console.log(`[BabylonGame] NPC ${character.id} mesh debug:`, {
        rootType: root.constructor.name,
        rootEnabled: root.isEnabled(),
        rootVisibility: root.visibility,
        rootIsVisible: root.isVisible,
        childCount: childMeshes.length,
        children: childMeshes.map(m => ({
          name: m.name,
          type: m.constructor.name,
          enabled: m.isEnabled(),
          visibility: m.visibility,
          isVisible: m.isVisible,
          hasMaterial: !!m.material,
          vertexCount: m instanceof Mesh ? m.getTotalVertices() : 0
        }))
      });

      // Collision ellipsoid for NPCs (same as player)
      root.ellipsoid = new Vector3(0.5, 1, 0.5);
      root.ellipsoidOffset = new Vector3(0, 1, 0);

      // Phase 8A: Place NPC near their workplace/residence building if found
      const spawnPos = this.findNPCSpawnPosition(character, role);
      root.position = spawnPos;

      // Phase 8B: Apply role-based color tint for visual distinction
      const allNpcMeshes = [root, ...root.getChildMeshes()];
      this.applyNPCRoleTint(allNpcMeshes, role);

      // Create CharacterController for NPCs (with null camera for programmatic control)
      let controller: CharacterController | null = null;
      try {
        // Pass null as camera - NPCs don't need camera control
        controller = new CharacterController(root, null as any, this.scene);
        controller.setFaceForward(false);
        controller.setMode(0);
        controller.setStepOffset(0.4);
        controller.setSlopeLimit(30, 60);
        
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

        // Slow NPC walk speed to a natural stroll (default is 3, player speed)
        controller.setWalkSpeed(1.2);

        // Start the controller
        controller.start();
        
        console.log(`[BabylonGame] NPC ${character.id} CharacterController initialized`);
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

      // Phase 4: Create billboard LOD plane for distant NPC rendering
      const npcName = `${character.firstName || ''} ${character.lastName || ''}`.trim() || character.id;
      npcInstance.billboardLOD = this.createNPCBillboard(npcName, role, root.position);

      this.npcMeshes.set(character.id, npcInstance);

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
    } catch (error) {
      console.error(`Failed to load NPC ${character.id}:`, error);
    }
  }

  /**
   * Phase 8A: Find a spawn position for an NPC near their workplace or residence building.
   * Searches buildingData for buildings where the character is owner, employee, or occupant.
   */
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
          // Place near the business, offset enough to be outside building footprint
          const rawX = (Math.random() - 0.5) * 16;
          const rawZ = (Math.random() - 0.5) * 16;
          const offset = new Vector3(
            Math.sign(rawX || 1) * Math.max(Math.abs(rawX), 6),
            0,
            Math.sign(rawZ || 1) * Math.max(Math.abs(rawZ), 6)
          );
          const pos = data.position.add(offset);
          return new Vector3(pos.x, 12, pos.z);
        }
      }

      // Check if character lives in a residence
      if (meta.buildingType === 'residence') {
        if (Array.isArray(meta.occupants) && meta.occupants.some((o: any) =>
          typeof o === 'string' ? o === characterId : o?.id === characterId
        )) {
          // Place near the residence, offset enough to be outside building footprint
          const rawX = (Math.random() - 0.5) * 16;
          const rawZ = (Math.random() - 0.5) * 16;
          const offset = new Vector3(
            Math.sign(rawX || 1) * Math.max(Math.abs(rawX), 6),
            0,
            Math.sign(rawZ || 1) * Math.max(Math.abs(rawZ), 6)
          );
          const pos = data.position.add(offset);
          return new Vector3(pos.x, 12, pos.z);
        }
      }
    }

    // Fallback: place near a random settlement center if available
    const settlements = this.settlements || this.worldData?.settlements || [];
    if (settlements.length > 0 && this.settlementMeshes.size > 0) {
      // Pick a random settlement mesh to place near
      const meshEntries = Array.from(this.settlementMeshes.values());
      const settlementMesh = meshEntries[Math.floor(Math.random() * meshEntries.length)];
      if (settlementMesh) {
        const offset = new Vector3(
          (Math.random() - 0.5) * 30,
          0,
          (Math.random() - 0.5) * 30
        );
        const pos = settlementMesh.position.add(offset);
        return new Vector3(pos.x, 12, pos.z);
      }
    }

    // Ultimate fallback: random position near origin
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 20;
    return new Vector3(Math.cos(angle) * radius, 12, Math.sin(angle) * radius);
  }

  /**
   * Phase 8B: Apply role-based color tint to NPC mesh materials.
   * Guards get a reddish tint, merchants get a golden tint, questgivers get a blue tint.
   */
  private applyNPCRoleTint(meshes: AbstractMesh[], role: NPCRole): void {
    const tintColors: Record<NPCRole, Color3> = {
      guard: new Color3(0.85, 0.5, 0.45),
      merchant: new Color3(0.85, 0.75, 0.45),
      questgiver: new Color3(0.5, 0.65, 0.9),
      civilian: new Color3(0.7, 0.7, 0.7)
    };

    const tint = tintColors[role] || tintColors.civilian;

    // Apply subtle tint to all sub-meshes that have a standard material
    for (const mesh of meshes) {
      if (mesh.material && mesh.material instanceof StandardMaterial) {
        const mat = mesh.material.clone(`${mesh.material.name}_${role}_tint`) as StandardMaterial;
        mat.diffuseColor = Color3.Lerp(mat.diffuseColor, tint, 0.3);
        mesh.material = mat;
      }
    }
  }

  /**
   * Phase 4: Create a billboard LOD plane for an NPC.
   * At medium distance (60-120u), the full mesh is hidden and replaced
   * with a simple colored rectangle + name label. Starts hidden.
   */
  private createNPCBillboard(name: string, role: NPCRole, position: Vector3): Mesh {
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

    const roleColors: Record<NPCRole, Color3> = {
      guard: new Color3(0.85, 0.4, 0.35),
      merchant: new Color3(0.85, 0.75, 0.35),
      questgiver: new Color3(0.4, 0.55, 0.9),
      civilian: new Color3(0.6, 0.6, 0.6),
    };

    const mat = new StandardMaterial(`npc_billboard_mat_${name}`, this.scene!);
    const color = roleColors[role] || roleColors.civilian;
    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(0.4);
    mat.disableLighting = true;
    mat.backFaceCulling = false;
    billboard.material = mat;

    return billboard;
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

    // Save current overworld position
    this.savedOverworldPosition = this.playerMesh.position.clone();

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

    // Teleport player to interior door position
    this.playerMesh.position = interior.doorPosition.clone();
    this.isInsideBuilding = true;

    // Show toast notification
    const label = businessType || buildingType || 'Building';
    this.guiManager?.showToast({
      title: `Entered ${label}`,
      description: 'Click the door to exit',
      duration: 2500,
    });

    // Fade back in
    await this.performFadeTransition(false);
  }

  /**
   * Phase 4B: Exit the current building interior. Restores the player to
   * their saved overworld position with a fade transition.
   */
  private async exitBuilding(): Promise<void> {
    if (!this.playerMesh || !this.isInsideBuilding || !this.activeInterior) return;

    // Fade to black
    await this.performFadeTransition(true);

    // Teleport player back to overworld
    if (this.savedOverworldPosition) {
      this.playerMesh.position = this.savedOverworldPosition.clone();
    } else {
      // Fallback: use the exit position stored in the interior layout
      this.playerMesh.position = this.activeInterior.exitPosition.clone();
    }

    this.isInsideBuilding = false;
    this.activeInterior = null;
    this.savedOverworldPosition = null;

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

      // Hide NPCs not in this settlement
      this.npcMeshes.forEach((instance, npcId) => {
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
    window.addEventListener('keydown', this.keyboardHandler);
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
        const mesh = pickInfo.pickedMesh as Mesh;
        this.handleWorldPropClicked(mesh, objectRole);
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
        // Only enter if player is close enough (within 8 units)
        if (this.playerMesh) {
          const dist = Vector3.Distance(this.playerMesh.position, buildingMesh.position);
          if (dist < 12) {
            this.enterBuilding(
              metadata.buildingId || metadata.businessId || metadata.residenceId,
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
      }
    });
  }

  private handleWorldPropClicked(mesh: Mesh, objectRole: string): void {
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
    this.eventBus.emit({ type: 'item_collected', itemId: item.id, itemName: item.name, quantity: 1 });

    this.guiManager?.showToast({
      title: `Collected ${item.name}`,
      description: item.description || `Added to your inventory (${item.type})`,
      duration: 2500,
    });
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

        // Check quest location proximity while we have the timer
        if (this.questObjectManager && this.playerMesh) {
          this.questObjectManager.checkLocationProximity(this.playerMesh.position);
        }
      }

      // Ground-snap NPCs at most every 500ms
      this._npcGroundSnapTimer += dt;
      if (this._npcGroundSnapTimer >= 500) {
        this._npcGroundSnapTimer = 0;
        if (!this.isInsideBuilding) {
          this.npcMeshes.forEach((instance) => {
            if (!instance?.mesh) return;
            // Phase 8: Skip ground snapping for disabled NPCs (hidden by isolation or distance)
            if (!instance.mesh.isEnabled()) return;
            const mesh = instance.mesh;
            const groundPos = this.projectToGround(mesh.position.x, mesh.position.z);
            const targetY = groundPos.y;
            if (Math.abs(mesh.position.y - targetY) > 0.5) {
              mesh.position.y = targetY;
              instance.homePosition = mesh.position.clone();
            }
          });
        }
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
  }

  /**
   * Updates a single NPC's wandering AI behavior.
   */
  private updateSingleNPCBehavior(instance: NPCInstance, now: number): void {
    if (!instance.mesh || !instance.controller) return;

    // Skip AI if NPC is in conversation
    if (instance.isInConversation) {
      instance.controller.walk(false);
      instance.controller.turnLeft(false);
      instance.controller.turnRight(false);

      // Make NPC face the player during conversation
      if (this.playerMesh && instance.mesh) {
        const npcPos = instance.mesh.position;
        const pPos = this.playerMesh.position;
        const directionToPlayer = pPos.subtract(npcPos).normalize();
        const targetRotation = Math.atan2(directionToPlayer.x, directionToPlayer.z) + Math.PI;

        instance.mesh.rotation.y = targetRotation;
        if ((instance.controller as any)._avatar) {
          (instance.controller as any)._avatar.rotation.y = targetRotation;
        }
        if (instance.mesh.parent && instance.mesh.parent instanceof Mesh) {
          (instance.mesh.parent as Mesh).rotation.y = targetRotation;
        }
      }
      return;
    }

    // Wandering AI — NPCs mill about near their home/workplace
    const homePos = instance.homePosition || instance.mesh.position;
    const currentPos = instance.mesh.position;
    const wanderRadius = 8;

    // If waiting, check if wait is over
    if (instance.wanderWaitUntil && now < instance.wanderWaitUntil) {
      instance.controller.walk(false);
      instance.controller.turnLeft(false);
      instance.controller.turnRight(false);
      return;
    }

    // If no wander target or reached target, pick new one
    if (!instance.wanderTarget || Vector3.Distance(currentPos, instance.wanderTarget) < 2) {
      instance.controller.walk(false);
      instance.controller.turnLeft(false);
      instance.controller.turnRight(false);

      // Longer idle pauses for a more natural look (4-10 seconds)
      instance.wanderWaitUntil = now + 4000 + Math.random() * 6000;

      // Phase 7: Cap wander target raycasts per tick
      if (this._wanderRaycastsThisTick < MAX_WANDER_RAYCASTS_PER_TICK) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * wanderRadius;
        const offsetX = Math.cos(angle) * distance;
        const offsetZ = Math.sin(angle) * distance;

        const targetPos = this.projectToGround(
          homePos.x + offsetX,
          homePos.z + offsetZ
        );
        instance.wanderTarget = targetPos;
        this._wanderRaycastsThisTick++;
      } else {
        // Fallback: use flat target without raycast
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * wanderRadius;
        instance.wanderTarget = new Vector3(
          homePos.x + Math.cos(angle) * distance,
          currentPos.y,
          homePos.z + Math.sin(angle) * distance
        );
      }
      return;
    }

    // Move toward wander target
    if (instance.wanderTarget) {
      const direction = instance.wanderTarget.subtract(currentPos);
      direction.y = 0;
      const distance = direction.length();

      if (distance > 0.1) {
        const normalized = direction.normalize();
        const targetRotation = Math.atan2(normalized.x, normalized.z);
        const currentRotation = instance.mesh.rotation.y;

        let rotationDiff = targetRotation - currentRotation;
        while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
        while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;

        const turnThreshold = 0.1;

        if (Math.abs(rotationDiff) < turnThreshold) {
          instance.controller.walk(true);
          instance.controller.turnLeft(false);
          instance.controller.turnRight(false);
        } else if (rotationDiff > 0) {
          instance.controller.turnLeft(true);
          instance.controller.turnRight(false);
          instance.controller.walk(true);
        } else {
          instance.controller.turnRight(true);
          instance.controller.turnLeft(false);
          instance.controller.walk(true);
        }
      } else {
        instance.controller.walk(false);
        instance.controller.turnLeft(false);
        instance.controller.turnRight(false);
      }
    }
  }

  private _minimapBuildingsCollected = false;
  private _minimapBuildings: Array<{ position: { x: number; z: number }; type: 'business' | 'residence' | 'other' }> = [];

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
        this._minimapBuildings.push({
          position: { x: data.position.x, z: data.position.z },
          type: bType
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

    // Collect NPC positions
    const npcPositions: Array<{ id: string; position: { x: number; z: number }; role?: string }> = [];
    this.npcMeshes.forEach((instance, npcId) => {
      if (!instance?.mesh || !instance.mesh.isEnabled()) return;
      npcPositions.push({
        id: npcId,
        position: { x: instance.mesh.position.x, z: instance.mesh.position.z },
        role: instance.role
      });
    });

    this.guiManager.updateMinimap({
      settlements: settlementsData,
      buildings: this._minimapBuildings,
      questMarkers,
      npcPositions,
      playerPosition: {
        x: this.playerMesh.position.x,
        z: this.playerMesh.position.z
      },
      worldSize: this.terrainSize || 512
    });
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
          console.warn(`[Perf] Slow frame: ${dt.toFixed(1)}ms (${(1000 / dt).toFixed(0)} FPS) | ${activeMeshes} active meshes | ${drawCalls} draw calls`);
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

    // ESC - Toggle unified game menu (or close it if open)
    if (event.code === 'Escape' && !event.repeat) {
      event.preventDefault();
      if (this.gameMenuSystem) {
        this.gameMenuSystem.toggle();
      }
      return; // Don't process other keys while toggling menu
    }

    // If the unified menu is open, block all other game input
    if (this.gameMenuSystem?.isOpen) {
      return;
    }

    // G - Interact with nearest NPC (selects + opens chat) or exit conversation
    if (event.code === 'KeyG' && !event.repeat) {
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
        // Otherwise, try to interact with nearest NPC
        await this.handleProximityInteraction();
      }
    }

    // F - Attack/Respawn
    if (event.code === 'KeyF' && !event.repeat) {
      event.preventDefault();
      this.handleAttack();
    }

    // T - Target nearest enemy
    if (event.code === 'KeyT' && !event.repeat) {
      event.preventDefault();
      this.handleTargetEnemy();
    }

    // Shift+V - Toggle VR
    if (event.code === 'KeyV' && event.shiftKey && !event.repeat) {
      event.preventDefault();
      await this.handleToggleVR();
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
      // Directly open chat with the nearest NPC
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

      // Try to fetch truths for conversation context (optional - fallback to empty array)
      let truths: any[] = [];
      try {
        truths = await this.dataSource.loadTruths(this.config.worldId);
      } catch (truthsError) {
        console.warn('[BabylonGame] Failed to fetch truths:', truthsError);
      }

      const npcInstance = this.npcMeshes.get(npcId);
      const npcMesh = npcInstance?.mesh;

      // Mark NPC as in conversation (stops their wandering)
      if (npcInstance) {
        npcInstance.isInConversation = true;
        
        // Make NPC turn to face the player
        if (npcMesh && this.playerMesh) {
          const npcPos = npcMesh.position;
          const playerPos = this.playerMesh.position;
          
          // Calculate direction from NPC to player
          const directionToPlayer = playerPos.subtract(npcPos).normalize();
          
          // Calculate the rotation angle (in radians)
          // Note: Babylon.js uses Y rotation, where 0 = facing +Z, PI/2 = facing +X
          // Add PI to make NPC face the player instead of away
          const targetRotation = Math.atan2(directionToPlayer.x, directionToPlayer.z) + Math.PI;
          
          // Try multiple ways to rotate the NPC
          console.log(`[Conversation] Rotating NPC to face player. Target rotation: ${targetRotation}`);
          
          // Method 1: Direct mesh rotation
          npcMesh.rotation.y = targetRotation;
          
          // Method 2: If CharacterController has an avatar, rotate that
          if (npcInstance.controller && (npcInstance.controller as any)._avatar) {
            (npcInstance.controller as any)._avatar.rotation.y = targetRotation;
            console.log('[Conversation] Rotated CharacterController avatar');
          }
          
          // Method 3: Try rotating parent if it exists and is a Mesh
          if (npcMesh.parent && npcMesh.parent instanceof Mesh) {
            (npcMesh.parent as Mesh).rotation.y = targetRotation;
          }
          
          // Also stop any ongoing movement
          if (npcInstance.controller) {
            npcInstance.controller.walk(false);
            npcInstance.controller.turnLeft(false);
            npcInstance.controller.turnRight(false);
          }

          // Show conversation indicator (speech bubble + body sway)
          if (this.npcTalkingIndicator) {
            this.npcTalkingIndicator.show(npcId, npcMesh);
          }
        }
      }
      this.conversationNPCId = npcId;

      // Save current camera mode and switch to conversation mode
      if (this.cameraManager && this.camera && npcMesh) {
        this.preConversationCameraMode = this.cameraManager.getCurrentMode();
        
        // Stop the player's CharacterController to prevent camera updates
        if (this.playerController) {
          this.playerController.stop();
        }
        
        // Get NPC and player positions
        const npcPos = npcMesh.position.clone();
        const playerPos = this.playerMesh?.position || npcPos.add(new Vector3(1, 0, 0));
        
        // DON'T switch to first-person mode - keep current mode but override position
        // this.cameraManager.setMode('first_person', false);
        
        // Calculate direction from player to NPC
        const playerToNPC = npcPos.subtract(playerPos).normalize();
        
        // Calculate camera position: start from player, move back along the player-to-NPC direction
        const conversationDistance = 4;
        const cameraPos = playerPos.add(playerToNPC.scale(-conversationDistance));
        
        // Target is NPC's face
        const targetPos = npcPos.add(new Vector3(0, 1.6, 0));
        
        // Set camera position directly
        this.camera.position = cameraPos.add(new Vector3(0, 1.6, 0)); // Eye level
        this.camera.setTarget(targetPos);
        
        // Adjust camera settings for conversation
        this.camera.radius = conversationDistance;
        this.camera.beta = Math.PI / 2.2; // Looking slightly down
        this.camera.lowerRadiusLimit = conversationDistance;
        this.camera.upperRadiusLimit = conversationDistance;
        
        // Lock the camera by disabling camera controls
        this.camera.detachControl();
        
        // Force camera to update immediately
        this.camera.rebuildAnglesAndRadius();
      }

      // Set player inventory context for NPC awareness
      if (this.inventory) {
        this.chatPanel.setPlayerInventoryContext(
          this.inventory.getAllItems().map(i => ({ name: i.name, type: i.type, quantity: i.quantity })),
          this.playerGold
        );
      }

      this.chatPanel.show(character, truths, npcMesh);
      console.log('[Chat] Chat panel shown for character:', character.firstName, character.lastName);

      let actions = this.getAvailableActions(npcId);
      // Filter actions through Prolog prerequisites (async, non-blocking)
      this.filterActionsByProlog(actions, npcId).then(filtered => {
        this.chatPanel?.setDialogueActions(filtered, this.playerEnergy);
      }).catch(() => { /* use unfiltered on error */ });
      this.chatPanel.setDialogueActions(actions, this.playerEnergy);

      // Track NPC conversation for quests
      this.questObjectManager?.trackNPCConversation(npcId);

      // Check if player can deliver any quest items to this NPC
      if (this.inventory && this.questObjectManager) {
        const playerItemNames = this.inventory.getAllItems().map(i => i.name);
        this.questObjectManager.trackItemDelivery(npcId, playerItemNames);
      }

      this.guiManager?.showToast({
        title: `Chatting with ${npcInfo.name}`,
        description: "Press G to close chat",
        duration: 2000
      });
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

    this.eventBus.emit({ type: 'item_collected', itemId: item.id, itemName: item.name, quantity: transaction.quantity });

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
    }).catch(err => console.warn('[Shop] Failed to record buy transaction:', err));

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
    }).catch(err => console.warn('[Shop] Failed to record sell transaction:', err));
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
    }).catch(err => console.warn('[Inventory] Failed to record drop:', err));

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
      const npcInstance = this.npcMeshes.get(this.conversationNPCId);
      if (npcInstance) {
        npcInstance.isInConversation = false;
      }
      if (this.npcTalkingIndicator) {
        this.npcTalkingIndicator.hide(this.conversationNPCId);
      }
      this.conversationNPCId = null;
    }

    // Restart the player's CharacterController
    if (this.playerController) {
      this.playerController.start();
    }

    // Restore previous camera mode
    if (this.cameraManager && this.preConversationCameraMode && this.camera) {
      // Restore locked camera radius
      this.camera.lowerRadiusLimit = 10;
      this.camera.upperRadiusLimit = 10;
      
      // Only switch mode if it's different from current
      if (this.cameraManager.getCurrentMode() !== this.preConversationCameraMode) {
        this.cameraManager.setMode(this.preConversationCameraMode, false);
      }
      this.preConversationCameraMode = null;
      
      // Re-target camera to player if available
      if (this.playerMesh) {
        this.camera.setTarget(this.playerMesh.position.add(new Vector3(0, 1.6, 0)));
      }
      
      // Re-attach camera controls
      this.camera.attachControl(this.canvas, true);
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
    console.log('[VR] Session started — switching to VR mode');

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
            console.log(`[VR] Hand grab detected: ${hand}`);
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
    console.log('[VR] Session ended — restoring desktop mode');

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

    if (this.scene.debugLayer.isVisible()) {
      this.scene.debugLayer.hide();
    } else {
      this.scene.debugLayer.show({ overlay: true });
    }
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

    // Add "Browse Wares" action for merchant NPCs
    const npcInstance = this.npcMeshes.get(npcId);
    if (npcInstance?.role === 'merchant') {
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
      this.eventBus.emit({ type: 'item_collected', itemId: item.id, itemName: item.name, quantity: 1 });
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

      await this.dataSource.updateQuest(questId, {
        progress: updatedProgress,
        status: allObjectivesComplete ? 'completed' : 'active',
        completedAt: allObjectivesComplete ? new Date() : null
      });

      this.questTracker?.updateQuests(this.config.worldId);

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

      // Apply quest rewards on completion
      if (allObjectivesComplete) {
        this.applyQuestRewards(quest);
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
    }).catch(err => console.warn('[Quest] Failed to record reward:', err));
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

      // Update indicators
      this.questIndicatorManager.updateIndicators(npcMap, quests);
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
    
    console.log(`[BabylonGame] Setting camera mode '${cameraMode}' for game type '${gameType}'`);
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

    console.log(`[BabylonGame] Initialized genre UI: ${genreConfig.uiLayout} for '${gameType}'`);
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
      console.log(`[BabylonGame] Initialized ResourceSystem for '${gameType}'`);
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
        this.eventBus.emit({ type: 'item_crafted', itemId: item.name, itemName: item.name, quantity: item.quantity || 1 });
      });
      this.craftingSystem.setOnCraftFailed((_recipeId, reason) => {
        this.guiManager?.showToast({
          title: 'Crafting Failed',
          description: reason,
          variant: 'destructive',
          duration: 3000,
        });
      });
      console.log(`[BabylonGame] Initialized CraftingSystem for '${gameType}'`);
    }

    // Building system
    if (features.building && this.resourceSystem) {
      this.buildingSystem = new BuildingPlacementSystem(this.scene, this.resourceSystem);
      this.buildingSystem.setOnBuildingComplete((building) => {
        this.guiManager?.showToast({
          title: `${building.name} Complete`,
          description: 'Construction finished',
          duration: 3000,
        });
      });
      console.log(`[BabylonGame] Initialized BuildingPlacementSystem for '${gameType}'`);
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
      console.log(`[BabylonGame] Initialized SurvivalNeedsSystem for '${gameType}'`);
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
      console.log(`[BabylonGame] Initialized RunManager + DungeonGenerator for '${gameType}'`);
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
        console.log(`[BabylonGame] Initialized RangedCombatSystem for '${gameType}'`);
        break;
      case 'fighting':
        this.fightingCombat = new FightingCombatSystem(this.scene, this.combatSystem);
        this.fightingCombat.setOnAttackLanded((result) => this.handleDamageDealt(result));
        console.log(`[BabylonGame] Initialized FightingCombatSystem for '${gameType}'`);
        break;
      case 'turn_based':
        this.turnBasedCombat = new TurnBasedCombatSystem(this.scene, this.combatSystem);
        this.turnBasedCombat.setOnCombatEnd((victory) => {
          console.log(`[BabylonGame] Turn-based combat ended: ${victory ? 'Victory' : 'Defeat'}`);
        });
        console.log(`[BabylonGame] Initialized TurnBasedCombatSystem for '${gameType}'`);
        break;
    }
  }

  private disposeKeyboardHandlers(): void {
    if (this.keyboardHandler) {
      window.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  private disposePointerHandlers(): void {
    if (this.scene && this.pointerObserver) {
      this.scene.onPointerObservable.remove(this.pointerObserver);
      this.pointerObserver = null;
    }
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

    // Dispose cached NPC model templates
    this.npcModelCache.forEach(({ root }) => {
      if (!root.isDisposed()) root.dispose();
    });
    this.npcModelCache.clear();
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

    // Dispose building interiors
    this.interiorGenerator?.dispose();
    this.activeInterior = null;
    this.savedOverworldPosition = null;
    this.isInsideBuilding = false;
  }

  private applyWorldTexturesFromAssets(): void {
    if (!this.textureManager || !this.worldAssets || this.worldAssets.length === 0) {
      console.log('[BabylonGame] No world assets available for texture application');
      return;
    }

    console.log(`[BabylonGame] Applying world textures from ${this.worldAssets.length} assets, 3DConfig groundTextureId: ${this.world3DConfig?.groundTextureId || 'none'}`);

    // Prefer an explicit ground texture from 3D config, otherwise first texture_ground asset
    let groundAsset = this.world3DConfig?.groundTextureId
      ? this.worldAssets.find((a) => a.id === this.world3DConfig!.groundTextureId)
      : undefined;

    if (!groundAsset) {
      groundAsset = this.worldAssets.find((a) => a.assetType === "texture_ground");
    }

    if (groundAsset) {
      console.log(`[BabylonGame] Applying ground texture: ${groundAsset.name} (${groundAsset.filePath})`);
      this.textureManager.applyGroundTexture(groundAsset, { uScale: 8, vScale: 8, useBump: true });
      this.selectedGroundTexture = groundAsset.id;

      // Reset diffuseColor to white so the texture shows its true colors
      // (createGround sets a tinting color that would fight with collection textures)
      const groundMesh = this.scene?.getMeshByName("ground");
      if (groundMesh?.material) {
        (groundMesh.material as StandardMaterial).diffuseColor = new Color3(1, 1, 1);
      }
    } else {
      console.log('[BabylonGame] No ground texture found in assets or 3D config, using default');
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
      console.log(`[BabylonGame] Applying wall texture: ${wallAsset.name}`);
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
    this.ambientConversationManager?.dispose();
    this.ambientConversationManager = null;
    this.npcTalkingIndicator?.dispose();
    this.npcTalkingIndicator = null;
    this.buildingInfoDisplay?.dispose();
    this.minimap?.dispose();
    this.inventory?.dispose();
    this.shopPanel?.dispose();
    this.rulesPanel?.dispose();
    this.ruleEnforcer?.dispose();
    this.prologEngine?.dispose();
    this.prologEngine = null;
    this.eventBus.dispose();
    this.questObjectManager?.dispose();
    this.radialMenu?.dispose();
    this.questTracker?.dispose();
    this.chatPanel?.dispose();
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
