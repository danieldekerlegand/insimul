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
import { WorldScaleManager, ScaledSettlement } from "@/components/3DGame/WorldScaleManager.ts";
import { BuildingInfoDisplay } from "@/components/3DGame/BuildingInfoDisplay.ts";
import { BabylonMinimap } from "@/components/3DGame/BabylonMinimap.ts";
import { BabylonInventory, InventoryItem } from "@/components/3DGame/BabylonInventory.ts";
import { BabylonRulesPanel, Rule } from "@/components/3DGame/BabylonRulesPanel.ts";
import { RuleEnforcer, RuleViolation } from "@/components/3DGame/RuleEnforcer.ts";
import { CombatSystem, CombatStyle, DamageResult } from "@/components/3DGame/CombatSystem.ts";
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
import { VRUIPanel } from "@/components/3DGame/VRUIPanel.ts";
import { NPCTalkingIndicator } from "@/components/3DGame/NPCTalkingIndicator.ts";
import { NPCAmbientConversationManager } from "@/components/3DGame/NPCAmbientConversationManager.ts";
import type { VisualAsset } from "@shared/schema.ts";

// Constants
const PLAYER_MODEL_URL = "/assets/player/Vincent-frontFacing.babylon";
const NPC_MODEL_URL = "/assets/npc/starterAvatars.babylon";
const FOOTSTEP_SOUND_URL = "/assets/footstep_carpet_000.ogg";
const MAX_NPCS = 8;
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
  private worldScaleManager: WorldScaleManager | null = null;
  private buildingInfoDisplay: BuildingInfoDisplay | null = null;
  private minimap: BabylonMinimap | null = null;
  private inventory: BabylonInventory | null = null;
  private rulesPanel: BabylonRulesPanel | null = null;
  private ruleEnforcer: RuleEnforcer | null = null;
  private combatSystem: CombatSystem | null = null;
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

  // Settlements and world
  private settlementMeshes: Map<string, Mesh> = new Map();
  private settlementRoadMeshes: Mesh[] = [];
  private zoneBoundaryMeshes: Map<string, { boundary: Mesh; particles?: ParticleSystem }> = new Map();
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

  // Game state
  private sceneStatus: SceneStatus = "idle";
  private worldData: WorldData | null = null;
  private terrainSize: number = 512;
  private actionInProgress: boolean = false;
  private isInCombat: boolean = false;
  private isVRMode: boolean = false;
  private vrSupported: boolean = false;
  private combatTargetId: string | null = null;

  // Zone system
  private currentZone: { id: string; name: string; type: string } | null = null;
  private playthroughId: string | null = null;
  private currentReputation: any | null = null;

  // VR
  private vrUIPanels: Map<string, VRUIPanel> = new Map();

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
    playerModels?: Record<string, string>;
    questObjectModels?: Record<string, string>;
    audioAssets?: Record<string, string>;
  } | null = null;
  private worldAssets: VisualAsset[] = [];

  // Prop/object model templates loaded from world3DConfig.objectModels
  private objectModelTemplates: Map<string, Mesh> = new Map();
  private worldPropMeshes: Mesh[] = [];

  // Audio
  private zoneEnterSound: Sound | null = null;
  private zoneExitSound: Sound | null = null;
  private violationSound: Sound | null = null;

  // Theme
  private worldTheme: WorldVisualTheme;

  // Observers (for cleanup)
  private keyboardHandler: ((event: KeyboardEvent) => void) | null = null;
  private resizeHandler: (() => void) | null = null;
  private pointerObserver: Observer<PointerInfo> | null = null;
  private renderObserver: Observer<Scene> | null = null;
  private npcBehaviorInterval: number | null = null;

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
    this.worldTheme = computeWorldVisualTheme(config.worldType);
  }

  /**
   * Initialize the game - call this after construction
   */
  public async init(): Promise<void> {
    try {
      await this.initializeEngine();
      await this.initializeScene();
      await this.initializeSystems();
      await this.loadWorldData();
      await this.generateProceduralWorld();
      await this.startPlaythrough();
      await this.loadPlayer();
      await this.loadNPCs();
      await this.setupKeyboardHandlers();
      this.setupPointerHandlers();
      this.setupUpdateLoop();
      this.startGameLoop();

      // Start ambient conversation system
      if (this.ambientConversationManager) {
        this.ambientConversationManager.start();
        console.log('[BabylonGame] Ambient conversation system started');
      }
    } catch (error) {
      console.error('Failed to initialize game:', error);
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
  }

  // ============================================================================
  // INITIALIZATION METHODS
  // ============================================================================

  private async initializeEngine(): Promise<void> {
    this.engine = new Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
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
      // Update camera button text
      this.guiManager?.updateCameraButtonText(displayName);
    });

    this.sceneStatus = "ready";
  }

  private async setupScene(scene: Scene, canvas: HTMLCanvasElement, theme: WorldVisualTheme): Promise<void> {
    scene.clearColor = new Color4(0.75, 0.75, 0.75, 1);
    scene.ambientColor = new Color3(1, 1, 1);
    scene.collisionsEnabled = true;

    // Lighting
    const hemiLight = new HemisphericLight("hemi-light", new Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.7;

    const sun = new DirectionalLight("sun", new Vector3(-0.5, -1, -0.5), scene);
    sun.position = new Vector3(0, 20, 0);
    sun.intensity = 1.1;

    // Sky dome
    const skyDome = MeshBuilder.CreateSphere("sky-dome", { diameter: 1000, sideOrientation: Mesh.BACKSIDE }, scene);
    const skyMaterial = new StandardMaterial("sky-mat", scene);
    skyMaterial.emissiveColor = theme.skyColor;
    skyMaterial.specularColor = Color3.Black();
    skyMaterial.backFaceCulling = false;
    skyMaterial.disableLighting = true;
    skyDome.material = skyMaterial;
    skyDome.isPickable = false;
    skyDome.checkCollisions = false;
    skyDome.infiniteDistance = true;

    // Create ground and wait for it to be ready
    await this.createGround(scene, this.terrainSize, theme);
  }

  private createCamera(scene: Scene, canvas: HTMLCanvasElement): ArcRotateCamera {
    const camera = new ArcRotateCamera("orbit-camera", -Math.PI / 2, Math.PI / 3, 10, new Vector3(0, 1.5, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 40;
    camera.wheelPrecision = 15;
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
      const diffuseTexture = new Texture("/assets/ground/ground.jpg", scene);
      diffuseTexture.uScale = 4;
      diffuseTexture.vScale = 4;
      groundMaterial.diffuseTexture = diffuseTexture;

      const bumpTexture = new Texture("/assets/ground/ground-normal.png", scene);
      bumpTexture.uScale = 12;
      bumpTexture.vScale = 12;
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
    if (!this.scene || !this.canvas) return;

    const scene = this.scene;

    // Initialize texture manager
    this.textureManager = new TextureManager(scene);

    // Initialize audio manager
    this.audioManager = new AudioManager(scene);

    // Initialize GUI manager
    this.guiManager = new BabylonGUIManager(scene, {
      worldName: this.config.worldName,
      worldId: this.config.worldId
    });

    // Set up GUI callbacks
    this.guiManager.setOnBackPressed(() => this.config.onBack?.());
    this.guiManager.setOnFullscreenPressed(() => this.handleToggleFullscreen());
    this.guiManager.setOnDebugPressed(() => this.handleToggleDebug());
    this.guiManager.setOnVRToggled(() => this.handleToggleVR());
    this.guiManager.setOnNPCSelected((npcId) => this.setSelectedNPC(npcId));
    this.guiManager.setOnActionSelected((actionId) => this.handlePerformAction(actionId));
    this.guiManager.setOnPayFines(() => this.handlePayFines());
    this.guiManager.setOnCameraModePressed(() => this.cameraManager?.cycleMode());

    // Initialize chat panel
    this.chatPanel = new BabylonChatPanel(this.guiManager.advancedTexture, scene);
    this.chatPanel.setOnClose(() => console.log('Chat closed'));
    this.chatPanel.setOnQuestAssigned((questData) => {
      this.questTracker?.updateQuests(this.config.worldId);
      this.updateQuestIndicators(); // Update NPC indicators
      this.guiManager?.showToast({
        title: 'New Quest!',
        description: questData.title || 'Quest assigned',
      });
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
      console.log('[BabylonGame] NPC conversation started with:', npcId);
    });

    // Initialize quest tracker
    this.questTracker = new BabylonQuestTracker(this.guiManager.advancedTexture, scene);

    // Initialize zone audio
    this.initializeZoneAudio(scene);

    // Initialize radial menu
    this.radialMenu = new BabylonRadialMenu(scene);

    // Initialize quest object manager
    this.questObjectManager = new QuestObjectManager(scene);
    this.questObjectManager.setOnObjectCollected((questId, objectiveId) => {
      this.handleQuestObjectiveCompleted(questId, objectiveId, 'collect');
    });

    // Initialize quest indicator manager
    this.questIndicatorManager = new QuestIndicatorManager(scene);

    // Initialize building info display
    this.buildingInfoDisplay = new BuildingInfoDisplay(scene, this.guiManager.advancedTexture);

    // Initialize minimap
    this.minimap = new BabylonMinimap(scene, this.guiManager.advancedTexture, this.terrainSize);

    // Initialize inventory
    this.inventory = new BabylonInventory(scene, this.guiManager.advancedTexture);

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
      this.guiManager?.showToast({
        title: 'VR Mode Activated',
        description: 'You are now in VR mode',
      });
    });
    this.vrManager.setOnVRSessionEnd(() => {
      this.isVRMode = false;
      this.guiManager?.showToast({
        title: 'VR Mode Deactivated',
        description: 'You have exited VR mode',
      });
    });

    // Initialize NPC talking indicator
    this.npcTalkingIndicator = new NPCTalkingIndicator(scene);

    // Initialize ambient conversation manager
    this.ambientConversationManager = new NPCAmbientConversationManager(
      scene,
      this.config.worldId,
      this.npcTalkingIndicator
    );

    // Initialize procedural generators
    this.buildingGenerator = new ProceduralBuildingGenerator(scene);
    this.natureGenerator = new ProceduralNatureGenerator(scene);
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

      const headers: HeadersInit = this.config.authToken
        ? { 'Authorization': `Bearer ${this.config.authToken}` }
        : {};

      const [
        worldRes,
        charactersRes,
        actionsRes,
        baseActionsRes,
        questsRes,
        settlementsRes,
        rulesRes,
        baseRulesRes,
        countriesRes,
        statesRes,
        baseConfigRes,
        assetsRes,
        config3DRes
      ] = await Promise.all([
        fetch(`/api/worlds/${worldId}`, { headers }),
        fetch(`/api/worlds/${worldId}/characters`, { headers }),
        fetch(`/api/worlds/${worldId}/actions`, { headers }),
        fetch(`/api/actions/base`, { headers }),
        fetch(`/api/worlds/${worldId}/quests`, { headers }),
        fetch(`/api/worlds/${worldId}/settlements`, { headers }),
        fetch(`/api/rules?worldId=${worldId}`, { headers }),
        fetch(`/api/rules/base`, { headers }),
        fetch(`/api/worlds/${worldId}/countries`, { headers }),
        fetch(`/api/worlds/${worldId}/states`, { headers }),
        fetch(`/api/worlds/${worldId}/base-resources/config`, { headers }),
        fetch(`/api/worlds/${worldId}/assets`, { headers }),
        fetch(`/api/worlds/${worldId}/3d-config`, { headers })
      ]);

      const world = worldRes.ok ? await worldRes.json() : {};
      const characters = charactersRes.ok ? await charactersRes.json() : [];
      const actions = actionsRes.ok ? await actionsRes.json() : [];
      let baseActions = baseActionsRes.ok ? await baseActionsRes.json() : [];
      const quests = questsRes.ok ? await questsRes.json() : [];
      const settlements = settlementsRes.ok ? await settlementsRes.json() : [];
      let rules = rulesRes.ok ? await rulesRes.json() : [];
      let baseRules = baseRulesRes.ok ? await baseRulesRes.json() : [];
      const countries = countriesRes.ok ? await countriesRes.json() : [];
      const states = statesRes.ok ? await statesRes.json() : [];
      const baseConfig = baseConfigRes.ok ? await baseConfigRes.json() : {};
      const worldAssets: VisualAsset[] = assetsRes.ok ? await assetsRes.json() : [];
      const world3DConfig = config3DRes.ok ? await config3DRes.json() : {};

      // Set camera mode based on game type
      const gameType = world.gameType || world.worldType || 'rpg';
      this.setCameraModeForGameType(gameType);

      // Filter disabled actions/rules
      if (Array.isArray(baseConfig.disabledBaseActions) && baseConfig.disabledBaseActions.length > 0) {
        baseActions = baseActions.filter((action: Action) => !baseConfig.disabledBaseActions.includes(action.id));
      }
      if (Array.isArray(baseConfig.disabledBaseRules) && baseConfig.disabledBaseRules.length > 0) {
        baseRules = baseRules.filter((rule: any) => !baseConfig.disabledBaseRules.includes(rule.id));
      }

      const manager = new ActionManager(actions, baseActions);
      this.actionManager = manager;

      this.worldData = {
        characters,
        actions,
        baseActions,
        quests,
        settlements,
        rules,
        baseRules,
        countries
      };

      // Store world assets, textures (for future texture panel use), and 3D config
      this.worldAssets = worldAssets;
      this.availableTextures = worldAssets.filter(
        (asset) => asset.assetType.startsWith('texture_')
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
      playerModels?: Record<string, string>;
      questObjectModels?: Record<string, string>;
      audioAssets?: Record<string, string>;
    } | null
  ): Promise<void> {
    if (!this.scene || !config3D) return;

    const scene = this.scene;

    const findAssetById = (id: string | undefined | null): VisualAsset | null => {
      if (!id) return null;
      const asset = worldAssets.find((a) => a.id === id);
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
          // Local relative path
          rootUrl = '/';
          fileName = asset.filePath.replace(/^\//, '');
        }

        const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, scene);
        const mesh = result.meshes.find((m) => m instanceof Mesh) as Mesh | undefined;
        if (!mesh) return null;
        mesh.setEnabled(false);
        return mesh;
      } catch (err) {
        console.warn('[BabylonGame] Failed to load model for asset', asset.id, asset.filePath, err);
        return null;
      }
    };

    // Building models: default + smallResidence
    if (this.buildingGenerator && config3D.buildingModels) {
      const defaultId = config3D.buildingModels['default'];
      const smallId = config3D.buildingModels['smallResidence'];

      const defaultAsset = findAssetById(defaultId);
      const smallAsset = findAssetById(smallId);

      const [defaultMesh, smallMesh] = await Promise.all([
        loadModelTemplate(defaultAsset),
        loadModelTemplate(smallAsset)
      ]);

      if (defaultMesh) {
        this.buildingGenerator.registerRoleModel('default', defaultMesh);
      }
      if (smallMesh) {
        this.buildingGenerator.registerRoleModel('smallResidence', smallMesh);
      }
    }

    // Nature models: defaultTree, rock, shrub, bush
    if (this.natureGenerator && config3D.natureModels) {
      // Tree
      const treeId = config3D.natureModels['defaultTree'];
      const treeAsset = findAssetById(treeId);
      const treeMesh = await loadModelTemplate(treeAsset);
      if (treeMesh) {
        this.natureGenerator.registerTreeOverride(treeMesh);
      }

      // Rock
      const rockId = config3D.natureModels['rock'];
      const rockAsset = findAssetById(rockId);
      const rockMesh = await loadModelTemplate(rockAsset);
      if (rockMesh) {
        this.natureGenerator.registerRockOverride(rockMesh);
      }

      // Shrub
      const shrubId = config3D.natureModels['shrub'];
      const shrubAsset = findAssetById(shrubId);
      const shrubMesh = await loadModelTemplate(shrubAsset);
      if (shrubMesh) {
        this.natureGenerator.registerShrubOverride(shrubMesh);
      }

      // Bush
      const bushId = config3D.natureModels['bush'];
      const bushAsset = findAssetById(bushId);
      const bushMesh = await loadModelTemplate(bushAsset);
      if (bushMesh) {
        this.natureGenerator.registerBushOverride(bushMesh);
      }
    }

    // Character models (for future extension): config3D.characterModels
    // Currently NPCs still use the shared NPC_MODEL_URL; world-level overrides
    // can be wired in here in a future iteration.

    // Object/prop models: preload templates keyed by semantic role (chest, sword, etc.)
    this.objectModelTemplates.clear();
    if (config3D.objectModels) {
      for (const [role, id] of Object.entries(config3D.objectModels)) {
        const asset = findAssetById(id);
        const template = await loadModelTemplate(asset);
        if (template) {
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

    const { countries, settlements, characters, rules, baseRules, actions, baseActions, quests } = this.worldData;

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

    // Clear any previously generated world meshes
    this.disposeWorld();

    const settlements = this.worldData.settlements.slice(0, MAX_SETTLEMENTS_3D);
    if (settlements.length === 0) {
      console.log("No settlements found for procedural world generation");
      return;
    }

    const worldStyle = ProceduralBuildingGenerator.getStyleForWorld(worldType, "plains");
    const biome = ProceduralNatureGenerator.getBiomeFromTerrain(worldType);

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
        const [businessesRes, lotsRes, residencesRes] = await Promise.all([
          fetch(`/api/settlements/${settlement.id}/businesses`),
          fetch(`/api/settlements/${settlement.id}/lots`),
          fetch(`/api/settlements/${settlement.id}/residences`)
        ]);

        const businesses = businessesRes.ok ? await businessesRes.json() : [];
        const lots = lotsRes.ok ? await lotsRes.json() : [];
        const residences = residencesRes.ok ? await residencesRes.json() : [];

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

        // Spawn buildings
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

          // Store business metadata for NPC assignment
          building.metadata = {
            buildingType: 'business',
            businessId: business.id,
            businessType: business.businessType,
            businessName: business.name,
            settlementId: settlement.id,
            ownerId: business.ownerId,
            employees: business.employees || []
          };

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
          const occupants = residence.occupants || [];
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
            buildingType: 'residence',
            residenceId: residence.id,
            settlementId: settlement.id,
            occupants: residence.occupants
          };

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

        // Fill any remaining positions with generic residences
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

          // Add metadata for generic residences
          building.metadata = {
            buildingType: 'residence',
            residenceId: `residence_generic_${settlement.id}_${buildingIndex}`,
            settlementId: settlement.id,
            occupants: []
          };

          // Register building for hover info display
          this.buildingInfoDisplay?.registerBuilding(building);

          buildingIndex++;
        }

        // Create a marker for the settlement center
        const settlementCenter = this.projectToGround(
          scaledSettlement.position.x,
          scaledSettlement.position.z
        );
        const settlementMarker = MeshBuilder.CreateCylinder(
          `settlement_marker_${settlement.id}`,
          { diameter: 3, height: 0.5, tessellation: 16 },
          scene
        );
        settlementMarker.position = settlementCenter.clone();
        settlementMarker.position.y += 0.25;
        settlementMarker.isPickable = true;

        settlementMarker.metadata = {
          ...(settlementMarker.metadata || {}),
          settlementId: settlement.id
        };

        const markerMat = new StandardMaterial(`settlement_marker_mat_${settlement.id}`, scene);
        markerMat.diffuseColor = new Color3(0.8, 0.6, 0.2);
        markerMat.emissiveColor = new Color3(0.4, 0.3, 0.1);
        settlementMarker.material = markerMat;

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

            const propInstance = template.clone(`prop_${role}_${settlement.id}_${idx}`) as Mesh;
            propInstance.position = groundPos;
            propInstance.isVisible = true;
            propInstance.setEnabled(true);
            propInstance.checkCollisions = false;
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

    // Generate nature elements (trees, rocks, grass, flowers)
    console.log('Generating nature elements...');

    const worldBounds = {
      minX: -terrainSize / 2 + 50, // Leave space at edges
      maxX: terrainSize / 2 - 50,
      minZ: -terrainSize / 2 + 50,
      maxZ: terrainSize / 2 - 50
    };

    // Trees - avoid building positions
    natureGenerator.generateTrees(biome, worldBounds, allBuildingPositions, 20, sampleHeight);

    // Rocks
    natureGenerator.generateRocks(biome, worldBounds, Math.floor(terrainSize / 20), sampleHeight);

    // Grass patches (fewer for performance)
    natureGenerator.generateGrass(biome, worldBounds, Math.floor(terrainSize / 5), sampleHeight);

    // Flowers
    natureGenerator.generateFlowers(biome, worldBounds, Math.floor(terrainSize / 10), sampleHeight);

    console.log('Procedural world generation complete!');

    // Create visual zone boundaries around settlements
    this.createZoneBoundaries(boundaryData);
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

        // Create boundary torus (ring)
        const boundaryRing = MeshBuilder.CreateTorus(
          `zone-boundary-${id}`,
          {
            diameter: zoneRadius * 2,
            thickness: 1.5,
            tessellation: 48
          },
          scene
        );

        boundaryRing.position = position.clone();
        boundaryRing.position.y = 2; // Float above ground
        boundaryRing.rotation.x = Math.PI / 2; // Rotate to be horizontal
        boundaryRing.checkCollisions = false;
        boundaryRing.isPickable = false;

        // Create semi-transparent glowing material
        const boundaryMat = new StandardMaterial(`zone-boundary-mat-${id}`, scene);
        boundaryMat.diffuseColor = zoneColor;
        boundaryMat.emissiveColor = zoneColor.scale(0.6);
        boundaryMat.alpha = 0.5;
        boundaryMat.specularColor = Color3.Black();
        boundaryRing.material = boundaryMat;

        // Create ground circle markers
        const groundMarker = MeshBuilder.CreateDisc(
          `zone-ground-${id}`,
          {
            radius: zoneRadius,
            tessellation: 64
          },
          scene
        );

        groundMarker.position = position.clone();
        groundMarker.position.y = 0.1; // Slightly above ground
        groundMarker.rotation.x = Math.PI / 2;
        groundMarker.checkCollisions = false;
        groundMarker.isPickable = false;

        const groundMat = new StandardMaterial(`zone-ground-mat-${id}`, scene);
        groundMat.diffuseColor = zoneColor;
        groundMat.emissiveColor = zoneColor.scale(0.3);
        groundMat.alpha = 0.15;
        groundMat.specularColor = Color3.Black();
        groundMarker.material = groundMat;
        groundMarker.parent = boundaryRing;

        // Create particle system for zone boundary
        const particleSystem = new ParticleSystem(`zone-particles-${id}`, 300, scene);
        particleSystem.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png", scene);

        // Emit particles from the boundary ring
        particleSystem.emitter = boundaryRing;
        particleSystem.minEmitBox = new Vector3(-zoneRadius, 0, -zoneRadius);
        particleSystem.maxEmitBox = new Vector3(zoneRadius, 5, zoneRadius);

        particleSystem.color1 = new Color4(zoneColor.r, zoneColor.g, zoneColor.b, 0.8);
        particleSystem.color2 = new Color4(zoneColor.r, zoneColor.g, zoneColor.b, 0.4);
        particleSystem.colorDead = new Color4(zoneColor.r, zoneColor.g, zoneColor.b, 0.0);

        particleSystem.minSize = 0.3;
        particleSystem.maxSize = 0.8;

        particleSystem.minLifeTime = 1.0;
        particleSystem.maxLifeTime = 2.5;

        particleSystem.emitRate = 20;
        particleSystem.start();

        this.zoneBoundaryMeshes.set(id, { boundary: boundaryRing, particles: particleSystem });
      } catch (error) {
        console.error(`Failed to create zone boundary for settlement ${id}:`, error);
      }
    });
  }

  private async startPlaythrough(): Promise<void> {
    if (!this.config.authToken || !this.config.worldId) return;

    try {
      const response = await fetch(`/api/worlds/${this.config.worldId}/playthroughs/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`,
        },
        body: JSON.stringify({
          name: `${this.config.worldName} - Playthrough`,
        }),
      });

      if (response.ok) {
        const playthrough = await response.json();
        this.playthroughId = playthrough.id;
      } else {
        console.warn('Failed to start playthrough', await response.text());
      }
    } catch (error) {
      console.error('Error starting playthrough', error);
    }
  }

  private async loadPlayer(): Promise<void> {
    if (!this.scene) return;

    try {
      // Determine player model URL from asset collection or fallback to hardcoded
      let playerModelUrl = PLAYER_MODEL_URL;
      const playerModelId = this.world3DConfig?.playerModels?.default;
      if (playerModelId && this.worldAssets && this.worldAssets.length > 0) {
        const playerAsset = this.worldAssets.find((a) => a.id === playerModelId);
        if (playerAsset && playerAsset.filePath) {
          playerModelUrl = playerAsset.filePath.startsWith('/') 
            ? playerAsset.filePath 
            : '/' + playerAsset.filePath;
          console.log('[BabylonGame] Using player model from asset collection:', playerModelUrl);
        }
      }

      const result = await SceneLoader.ImportMeshAsync("", "", playerModelUrl, this.scene);

      const playerMeshRaw = this.selectPlayerMesh(result.meshes) || (result.meshes[0] as Mesh);
      const skeleton = result.skeletons[0];
      const playerMesh = this.preparePlayerMesh(playerMeshRaw, skeleton);

      playerMesh.scaling = new Vector3(1, 1, 1);
      playerMesh.checkCollisions = true;

      // Collision ellipsoid for the player
      playerMesh.ellipsoid = new Vector3(0.5, 1, 0.5);
      playerMesh.ellipsoidOffset = new Vector3(0, 1, 0);

      this.playerMesh = playerMesh;

      if (this.camera) {
        this.camera.target = playerMesh.position.add(new Vector3(0, 1.6, 0));
        this.camera.radius = 10;
        this.camera.alpha = -Math.PI / 2;
        this.camera.beta = Math.PI / 3;

        const controller = new CharacterController(playerMesh, this.camera, this.scene, undefined, true);
        controller.setCameraTarget(new Vector3(0, 1.6, 0));
        controller.setNoFirstPerson(false);
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
    if (!this.scene || !this.worldData) return;

    const characters = this.worldData.characters.slice(0, MAX_NPCS);

    for (const character of characters) {
      try {
        await this.loadNPC(character);
      } catch (error) {
        console.error(`Failed to load NPC ${character.id}:`, error);
      }
    }

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

  private async loadNPC(character: WorldCharacter): Promise<void> {
    if (!this.scene) return;

    try {
      const role = this.getRoleForCharacter(character);
      let result: any = null;

      // Try world-level NPC override first (role-specific, then npcDefault fallback)
      const characterModels = this.world3DConfig?.characterModels || {};
      const roleSpecificId = characterModels[role];
      const defaultId = characterModels.npcDefault;
      const npcConfigId = roleSpecificId || defaultId;
      if (npcConfigId && this.worldAssets && this.worldAssets.length > 0) {
        const overrideAsset = this.worldAssets.find((a) => a.id === npcConfigId);
        if (overrideAsset && overrideAsset.filePath) {
          try {
            const rootUrl = '/';
            const file = overrideAsset.filePath.replace(/^\//, '');
            result = await SceneLoader.ImportMeshAsync('', rootUrl, file, this.scene);
          } catch (overrideError) {
            console.warn('Failed to load NPC override model', npcConfigId, overrideError);
          }
        }
      }

      // Fallback to shared default NPC model
      if (!result) {
        result = await SceneLoader.ImportMeshAsync("", "", NPC_MODEL_URL, this.scene);
      }

      const root = (this.selectPlayerMesh(result.meshes) || (result.meshes[0] as Mesh));
      root.name = `npc_${character.id}`;
      root.metadata = { npcId: character.id, npcRole: role };
      root.checkCollisions = true;

      // Collision ellipsoid for NPCs (same as player)
      root.ellipsoid = new Vector3(0.5, 1, 0.5);
      root.ellipsoidOffset = new Vector3(0, 1, 0);

      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      root.position = new Vector3(x, 12, z);

      let controller: CharacterController | null = null;
      try {
        controller = new CharacterController(root, null as any, this.scene);
        controller.setFaceForward(false);
        controller.setMode(0);
        controller.setStepOffset(0.4);
        controller.setSlopeLimit(30, 60);
        controller.setIdleAnim("idle", 1, true);
        controller.setTurnLeftAnim("turnLeft", 0.5, true);
        controller.setTurnRightAnim("turnRight", 0.5, true);
        controller.setWalkBackAnim("walkBack", 0.5, true);
        controller.setIdleJumpAnim("idleJump", 0.5, false);
        controller.setRunJumpAnim("runJump", 0.6, false);
        controller.setFallAnim("fall", 2, false);
        controller.setSlideBackAnim("slideBack", 1, false);
        controller.enableKeyBoard(false);

        // Determine footstep sound URL from asset collection or fallback to hardcoded
        let footstepSoundUrl = FOOTSTEP_SOUND_URL;
        const footstepAssetId = this.world3DConfig?.audioAssets?.footstep;
        if (footstepAssetId && this.worldAssets && this.worldAssets.length > 0) {
          const footstepAsset = this.worldAssets.find((a) => a.id === footstepAssetId);
          if (footstepAsset && footstepAsset.filePath) {
            footstepSoundUrl = footstepAsset.filePath.startsWith('/')
              ? footstepAsset.filePath
              : '/' + footstepAsset.filePath;
            console.log(`[BabylonGame] Using NPC footstep sound from asset collection: ${footstepSoundUrl}`);
          }
        }

        const walkSound = new Sound(
          `npc-walk-${character.id}`,
          footstepSoundUrl,
          this.scene,
          () => {
            controller?.setSound(walkSound);
          },
          { loop: false }
        );

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
        characterData: character
      };

      this.npcMeshes.set(character.id, npcInstance);

      const npcInfo: NPCDisplayInfo = {
        id: character.id,
        name: `${character.firstName || ''} ${character.lastName || ''}`.trim() || character.id,
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
      const metadata = pickInfo.pickedMesh.metadata || {};

      // World prop interaction (chests, data pads, lanterns, etc.)
      const objectRole = metadata.objectRole as string | undefined;
      if (objectRole) {
        const mesh = pickInfo.pickedMesh as Mesh;
        this.handleWorldPropClicked(mesh, objectRole);
        return;
      }

      // Settlement selection
      const settlementId = metadata.settlementId as string | undefined;
      if (settlementId && this.settlementStats.has(settlementId)) {
        this.handleSettlementSelected(settlementId);
        return;
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

  private setupUpdateLoop(): void {
    if (!this.scene) return;

    // NPC selection outline update, ground snapping, and minimap updates
    this.renderObserver = this.scene.onBeforeRenderObservable.add(() => {
      this.npcMeshes.forEach((instance, npcId) => {
        if (!instance || !instance.mesh) return;
        const mesh = instance.mesh;

        // Selection outline
        const isSelected = npcId === this.selectedNPCId;
        mesh.renderOutline = isSelected;
        mesh.outlineWidth = isSelected ? 0.06 : 0;
        if (isSelected) {
          mesh.outlineColor = new Color3(1, 0.9, 0.4);
        }

        // Snap NPCs to ground if they drift too far above/below terrain
        const groundPos = this.projectToGround(mesh.position.x, mesh.position.z);
        const targetY = groundPos.y;
        if (Math.abs(mesh.position.y - targetY) > 0.5) {
          mesh.position.y = targetY;
          instance.homePosition = mesh.position.clone();
        }

        // Update NPC marker on minimap
        const npcInfo = this.npcInfos.find((n) => n.id === npcId);
        const label = npcInfo?.name ?? npcId;
        let color: string | undefined;
        switch (instance.role) {
          case 'guard':
            color = '#F44336'; // Red
            break;
          case 'merchant':
            color = '#4CAF50'; // Green
            break;
          case 'questgiver':
            color = '#FFC107'; // Yellow
            break;
          case 'civilian':
          default:
            color = '#9E9E9E'; // Grey
            break;
        }
        this.minimap?.addMarker({
          id: `npc_${npcId}`,
          position: mesh.position.clone(),
          type: 'npc',
          label,
          color
        });
      });

      // Update player marker on minimap
      if (this.playerMesh) {
        this.minimap?.addMarker({
          id: 'player',
          position: this.playerMesh.position.clone(),
          type: 'player',
          label: 'You'
        });
      }
    });

    // NPC behavior update interval
    this.npcBehaviorInterval = window.setInterval(() => {
      this.updateNPCBehaviors();
    }, 100);
  }

  private updateNPCBehaviors(): void {
    // Use this interval primarily to keep the GUI minimap in sync with the world state
    this.updateMinimapOverlay();
  }

  private updateMinimapOverlay(): void {
    if (!this.guiManager || !this.worldData || !this.playerMesh) return;

    const settlementsData = Array.from(this.settlementMeshes.entries()).map(([id, mesh]) => {
      const stats = this.settlementStats.get(id);
      const settlement = this.worldData!.settlements.find((s) => s.id === id);

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

    this.guiManager.updateMinimap({
      settlements: settlementsData,
      playerPosition: {
        x: this.playerMesh.position.x,
        z: this.playerMesh.position.z
      },
      worldSize: this.terrainSize || 512
    });
  }

  private startGameLoop(): void {
    if (!this.engine) return;

    this.engine.runRenderLoop(() => {
      this.scene?.render();
    });
  }

  // ============================================================================
  // GAME LOGIC
  // ============================================================================

  private async handleKeyDown(event: KeyboardEvent): Promise<void> {
    // Prevent handling if in text input
    // ...
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // SPACE - Interact with nearest NPC
    if (event.code === 'Space' && !event.repeat) {
      event.preventDefault();
      this.handleProximityInteraction();
    }

    // C - Open chat
    if (event.code === 'KeyC' && !event.repeat) {
      event.preventDefault();
      await this.handleOpenChat();
    }

    // TAB - Radial menu
    if (event.code === 'Tab' && !event.repeat) {
      event.preventDefault();
      this.handleRadialMenu();
    }

    // Q - Quest tracker
    if (event.code === 'KeyQ' && !event.repeat) {
      event.preventDefault();
      this.questTracker?.toggle();
      this.questTracker?.updateQuests(this.config.worldId);
      this.guiManager?.showToast({ title: "Quest Tracker", description: "Press Q to toggle", duration: 1500 });
    }

    // I - Inventory
    if (event.code === 'KeyI' && !event.repeat) {
      event.preventDefault();
      this.inventory?.toggle();
      this.guiManager?.showToast({ title: "Inventory", description: "Press I to toggle", duration: 1500 });
    }

    // R - Rules panel
    if (event.code === 'KeyR' && !event.repeat) {
      event.preventDefault();
      this.rulesPanel?.toggle();
      this.guiManager?.showToast({ title: "Rules Panel", description: "View active rules", duration: 1500 });
    }

    // M - Minimap
    if (event.code === 'KeyM' && !event.repeat) {
      event.preventDefault();
      this.minimap?.toggle();
      this.guiManager?.showToast({ title: "Minimap", description: "Press M to toggle", duration: 1500 });
    }

    // V - Cycle camera mode (first person / third person / isometric)
    if (event.code === 'KeyV' && !event.repeat) {
      event.preventDefault();
      this.cameraManager?.cycleMode();
    }

    // 1, 2, 3 - Direct camera mode selection
    if (event.code === 'Digit1' && !event.repeat) {
      event.preventDefault();
      this.cameraManager?.setMode('first_person');
    }
    if (event.code === 'Digit2' && !event.repeat) {
      event.preventDefault();
      this.cameraManager?.setMode('third_person');
    }
    if (event.code === 'Digit3' && !event.repeat) {
      event.preventDefault();
      this.cameraManager?.setMode('isometric');
    }
    if (event.code === 'Digit4' && !event.repeat) {
      event.preventDefault();
      this.cameraManager?.setMode('side_scroll');
    }
    if (event.code === 'Digit5' && !event.repeat) {
      event.preventDefault();
      this.cameraManager?.setMode('top_down');
    }
    if (event.code === 'Digit6' && !event.repeat) {
      event.preventDefault();
      this.cameraManager?.setMode('fighting');
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

    // V - Toggle VR
    if (event.code === 'KeyV' && !event.repeat) {
      event.preventDefault();
      await this.handleToggleVR();
    }

    // Panel toggles
    if (event.code === 'KeyP' && !event.repeat) {
      event.preventDefault();
      this.guiManager?.togglePlayerStatsPanel();
    }

    if (event.code === 'KeyN' && !event.repeat) {
      event.preventDefault();
      this.guiManager?.toggleNPCListPanel();
    }

    if (event.code === 'KeyX' && !event.repeat) {
      event.preventDefault();
      this.guiManager?.toggleActionPanel();
    }

    if (event.code === 'KeyL' && !event.repeat) {
      event.preventDefault();
      this.guiManager?.toggleWorldStatsPanel();
    }
  }
  
  private handleProximityInteraction(): void {
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

      const npc = this.npcInfos.find((n) => n.id === nearestId);
      if (npc) {
        this.guiManager?.showToast({
          title: `Interacting with ${npc.name}`,
          description: npc.occupation || "Character",
          duration: 2000
        });
      }
    } else {
      this.guiManager?.showToast({
        title: "No one nearby",
        description: "Move closer to an NPC to interact",
        variant: "destructive",
        duration: 2000
      });
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
      const [characterRes, truthsRes] = await Promise.all([
        fetch(`/api/characters/${npcId}`),
        fetch(`/api/truths?worldId=${this.config.worldId}`)
      ]);

      if (!characterRes.ok || !truthsRes.ok) {
        throw new Error("Failed to load character or truths");
      }

      const character = await characterRes.json();
      const truths = await truthsRes.json();

      const npcInstance = this.npcMeshes.get(npcId);
      const npcMesh = npcInstance?.mesh;

      this.chatPanel.show(character, truths, npcMesh);

      const actions = this.getAvailableActions(npcId);
      this.chatPanel.setDialogueActions(actions, this.playerEnergy);

      // Track NPC conversation for quests
      this.questObjectManager?.trackNPCConversation(npcId);

      this.guiManager?.showToast({
        title: `Chatting with ${npcInfo.name}`,
        description: "Press C again to close chat",
        duration: 2000
      });
    } catch (error) {
      console.error("Failed to open chat:", error);
      this.guiManager?.showToast({
        title: "Chat Error",
        description: "Failed to load character data",
        variant: "destructive",
        duration: 2000
      });
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

  private handleAttack(): void {
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
      this.guiManager?.showToast({
        title: "No Target",
        description: "Press T to target nearest enemy",
        variant: "destructive",
        duration: 2000
      });
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
        settlementId: settlementInfo.settlementId
      };

      const combatAllowed = this.ruleEnforcer.canPerformAction('attack', 'combat', gameContext);

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

      const target = this.combatSystem.getEntity(nearestId);
      this.guiManager?.showToast({
        title: "Target Locked",
        description: `Targeting ${target?.name || 'Enemy'}. Press F to attack.`,
        duration: 2000
      });
    } else {
      this.guiManager?.showToast({
        title: "No Targets",
        description: "No enemies nearby",
        variant: "destructive",
        duration: 2000
      });
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
          description: "Press V again to enter VR mode",
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
      actor: this.worldData.characters[0]?.id || DEFAULT_PLAYER_ID,
      target: npcId,
      timestamp: Date.now(),
      playerEnergy: this.playerEnergy,
      playerPosition: this.playerMesh
        ? { x: this.playerMesh.position.x, y: this.playerMesh.position.z }
        : { x: 0, y: 0 }
    };

    return this.actionManager.getSocialActionsForNPC(npcId, context);
  }

  private async handlePerformAction(actionId: string): Promise<void> {
    if (!this.actionManager || !this.selectedNPCId || !this.worldData) return;

    const npcId = this.selectedNPCId;

    const context: ActionContext = {
      actor: this.worldData.characters[0]?.id || DEFAULT_PLAYER_ID,
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
        nearNPC: true
      };

      const ruleCheck = this.ruleEnforcer.canPerformAction(actionId, actionType, gameContext);

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

      const targetNPC = this.worldData.characters.find((npc) => npc.id === npcId);
      const targetName = targetNPC
        ? `${targetNPC.firstName || ''} ${targetNPC.lastName || ''}`.trim() || "NPC"
        : "NPC";

      if (result.energyUsed) {
        this.playerEnergy = Math.max(0, this.playerEnergy - result.energyUsed);
        this.updatePlayerStatusUI();
      }

      this.guiManager?.showToast({
        title: result.success ? `${actionName} succeeded` : `${actionName} failed`,
        description: result.narrativeText || result.message,
        variant: result.success ? "default" : "destructive"
      });
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

    // Update action panel for selected NPC
    if (npcId) {
      const npcInfo = this.npcInfos.find((n) => n.id === npcId) || null;
      const actions = npcInfo ? this.getAvailableActions(npcInfo.id) : [];
      this.guiManager.updateActionList(npcInfo, actions, this.playerEnergy);
    } else {
      this.guiManager.updateActionList(null, [], this.playerEnergy);
    }
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
      const response = await fetch(
        `/api/playthroughs/${this.playthroughId}/reputations/settlement/${this.currentZone.id}/pay-fines`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.config.authToken ? `Bearer ${this.config.authToken}` : ''
          }
        }
      );

      if (response.ok) {
        const result = await response.json();

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
        const errorText = await response.text();
        this.guiManager?.showToast({
          title: "Payment Failed",
          description: `Failed to pay fines: ${errorText}`,
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

    // Exit combat when enemy dies
    if (this.combatSystem && entityId === this.combatTargetId) {
      this.combatTargetId = null;
      this.isInCombat = false;
      this.combatSystem.exitCombat('player');
    }
  }

  private async handleQuestObjectiveCompleted(questId: string, objectiveId: string, type: string): Promise<void> {
    try {
      const questRes = await fetch(`/api/worlds/${this.config.worldId}/quests`);
      if (!questRes.ok) return;

      const quests = await questRes.json();
      const quest = quests.find((q: any) => q.id === questId);
      if (!quest) return;

      const updatedProgress = { ...quest.progress };

      if (type === 'collect') {
        updatedProgress.collectedItems = updatedProgress.collectedItems || [];
        updatedProgress.collectedItems.push(objectiveId);

        if (this.inventory) {
          this.inventory.addItem({
            id: objectiveId,
            name: 'Quest Item',
            description: `Collected for: ${quest.title}`,
            type: 'quest',
            quantity: 1,
            questId
          });
        }
      } else if (type === 'visit') {
        updatedProgress.visitedLocations = updatedProgress.visitedLocations || [];
        updatedProgress.visitedLocations.push(objectiveId);
      }

      const allObjectivesComplete = quest.objectives?.every((obj: any) => obj.completed);

      await fetch(`/api/quests/${questId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress: updatedProgress,
          status: allObjectivesComplete ? 'completed' : 'active',
          completedAt: allObjectivesComplete ? new Date() : null
        })
      });

      this.questTracker?.updateQuests(this.config.worldId);

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
   * Update quest indicators above NPCs based on current quest state
   */
  private async updateQuestIndicators(): Promise<void> {
    if (!this.questIndicatorManager) return;

    try {
      // Fetch current quests
      const response = await fetch(`/api/worlds/${this.config.worldId}/quests`);
      if (!response.ok) return;

      const quests = await response.json();

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
    // VRManager does not expose a dedicated dispose method; clear reference
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
      instance.mesh?.dispose();
    });
    this.npcMeshes.clear();
    this.npcInfos = [];

    this.npcHealthBars.forEach((bar) => bar.dispose());
    this.npcHealthBars.clear();
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
  }

  private handleSettlementSelected(settlementId: string): void {
    if (!this.guiManager || !this.worldData) return;

    const stats = this.settlementStats.get(settlementId);
    const settlement = this.worldData.settlements.find((s) => s.id === settlementId);
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
    this.rulesPanel?.dispose();
    this.ruleEnforcer?.dispose();
    this.questObjectManager?.dispose();
    this.radialMenu?.dispose();
    this.questTracker?.dispose();
    this.chatPanel?.dispose();
    this.guiManager?.dispose();
    this.textureManager?.dispose();
    this.audioManager?.dispose();
    this.cameraManager?.dispose();
    this.actionManager = null;
    this.buildingGenerator?.dispose();
    this.natureGenerator?.dispose();
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
