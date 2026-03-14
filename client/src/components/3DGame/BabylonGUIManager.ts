import {
  AdvancedDynamicTexture,
  Button,
  Container,
  Control,
  Ellipse,
  Rectangle,
  ScrollViewer,
  StackPanel,
  TextBlock,
  Image
} from "@babylonjs/gui";
import { Scene } from "@babylonjs/core";
import type { Action } from "./types/actions.ts";

export interface GUIConfig {
  worldName: string;
  worldId: string;
}

export interface WorldStats {
  countries: number;
  settlements: number;
  characters: number;
  rules: number;
  baseRules: number;
  actions: number;
  baseActions: number;
  quests: number;
}

export interface PlayerStatus {
  energy: number;
  maxEnergy: number;
  status: string;
  gold?: number; // Player's currency
}

export interface NPCInfo {
  id: string;
  name: string;
  occupation?: string;
  disposition?: string;
  questGiver: boolean;
  role?: 'civilian' | 'guard' | 'merchant' | 'questgiver';
}

export interface ActionFeedbackData {
  actionName: string;
  targetName: string;
  narrativeText: string;
  success: boolean;
  timestamp: number;
}

export interface MinimapBuilding {
  position: { x: number; z: number };
  type: 'business' | 'residence' | 'other';
}

export interface MinimapData {
  settlements: Array<{
    id: string;
    name: string;
    position: { x: number; z: number };
    type: string; // city, town, village
    zoneType: string; // safe, neutral, caution
    buildingCount?: number;
  }>;
  buildings?: MinimapBuilding[];
  questMarkers?: Array<{
    id: string;
    title: string;
    position: { x: number; z: number };
  }>;
  npcPositions?: Array<{
    id: string;
    position: { x: number; z: number };
    role?: string;
  }>;
  playerPosition: { x: number; z: number };
  playerRotationY: number; // Player's Y-axis rotation in radians
  worldSize: number; // Terrain size for scaling
}

export interface ReputationData {
  settlementName: string;
  score: number; // -100 to 100
  standing: string; // hostile, unfriendly, neutral, friendly, revered
  isBanned: boolean;
  violationCount: number;
  outstandingFines: number;
}

export interface SettlementDetails {
  id: string;
  name: string;
  type: string;
  population: number;
  businesses: number;
  residences: number;
  lots: number;
  buildingCount: number;
  zoneType?: string;
  terrain?: string;
}

export class BabylonGUIManager {
  public advancedTexture: AdvancedDynamicTexture;
  private scene: Scene;
  private config: GUIConfig;

  // UI Elements
  private hudContainer: Container | null = null;
  private worldStatsPanel: Container | null = null;
  private playerStatsPanel: Container | null = null;
  private actionPanel: Container | null = null;
  private npcListPanel: Container | null = null;
  private feedbackPanel: Container | null = null;
  private menuButton: Button | null = null;
  private cameraButton: Button | null = null;
  private fullscreenButton: Button | null = null;
  private menuPanel: Rectangle | null = null;
  private minimapPanel: Container | null = null;
  private minimapStaticRendered: boolean = false;
  private minimapStaticImage: Image | null = null;
  private minimapTerrainImage: Image | null = null;
  private reputationPanel: Container | null = null;
  private settlementDetailsPanel: Container | null = null;
  private helpPanel: Container | null = null;
  private toastContainer: StackPanel | null = null;
  private activeToasts: Map<string, Container> = new Map();
  private fluencyPanel: Rectangle | null = null;
  private _gameType: string | null = null;

  // State
  private isMenuOpen = false;
  private selectedNPCId: string | null = null;
  private toastIdCounter = 0;

  // Callbacks
  private onActionSelected: ((actionId: string) => void) | null = null;
  private onNPCSelected: ((npcId: string) => void) | null = null;
  private onBackPressed: (() => void) | null = null;
  private onFullscreenPressed: (() => void) | null = null;
  private onDebugPressed: (() => void) | null = null;
  private onPayFines: (() => void) | null = null;
  private onVRToggled: (() => void) | null = null;
  private onCameraModePressed: (() => void) | null = null;

  constructor(scene: Scene, config: GUIConfig) {
    this.scene = scene;
    this.config = config;
    // Revert to layer mode (third parameter = true)
    this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
    console.log('[GUIManager] Advanced texture created:', this.advancedTexture);
    console.log('[GUIManager] Scene:', scene);
    console.log('[GUIManager] Texture layer mode:', true);
    console.log('[GUIManager] Texture rootContainer children:', this.advancedTexture.rootContainer.children.length);
    
    this.initialize();
  }

  private initialize() {
    this.createHUD();
    this.createFullscreenButton();

    console.log('[GUIManager] GUI initialized successfully');
  }

  private createHUD() {
    // Main HUD container
    this.hudContainer = new Container("hud");
    this.advancedTexture.addControl(this.hudContainer);

    // Create all HUD panels
    this.createPlayerStatsPanel();
    this.createWorldStatsPanel();
    this.createNPCListPanel();
    this.createActionPanel();
    this.createFeedbackPanel();
    this.createMinimapPanel();
    this.createReputationPanel();
    this.createFluencyPanel();
  }

  private createMenuButton() {
    this.menuButton = Button.CreateSimpleButton("menuBtn", "☰ Menu");
    this.menuButton.width = "100px";
    this.menuButton.height = "40px";
    this.menuButton.color = "white";
    this.menuButton.background = "rgba(0, 0, 0, 0.6)";
    this.menuButton.cornerRadius = 5;
    this.menuButton.top = "10px";
    this.menuButton.left = "-10px";
    this.menuButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.menuButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.menuButton.fontSize = 16;
    this.menuButton.isVisible = true; // Explicitly set visible

    this.menuButton.onPointerClickObservable.add(() => {
      console.log('[GUIManager] Menu button clicked!');
      this.toggleMenu();
    });

    this.advancedTexture.addControl(this.menuButton);
    console.log('[GUIManager] Menu button added, isVisible:', this.menuButton.isVisible);
  }

  private createCameraButton() {
    this.cameraButton = Button.CreateSimpleButton("cameraBtn", "📷 3rd Person");
    this.cameraButton.width = "120px";
    this.cameraButton.height = "40px";
    this.cameraButton.color = "white";
    this.cameraButton.background = "rgba(0, 0, 0, 0.6)";
    this.cameraButton.cornerRadius = 5;
    this.cameraButton.top = "60px"; // Position below menu button
    this.cameraButton.left = "-10px";
    this.cameraButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.cameraButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.cameraButton.fontSize = 14;

    this.cameraButton.onPointerClickObservable.add(() => {
      this.onCameraModePressed?.();
    });

    this.advancedTexture.addControl(this.cameraButton);
  }

  /**
   * Update the camera button text to reflect current mode
   */
  public updateCameraButtonText(modeText: string): void {
    if (this.cameraButton) {
      const icon = modeText === 'First Person' ? '👁️' : modeText === 'Isometric' ? '🗺️' : '📷';
      (this.cameraButton.children[0] as any).text = `${icon} ${modeText}`;
    }
  }

  private createFullscreenButton() {
    this.fullscreenButton = Button.CreateSimpleButton("fullscreenBtn", "⛶ Fullscreen");
    this.fullscreenButton.width = "120px";
    this.fullscreenButton.height = "40px";
    this.fullscreenButton.color = "white";
    this.fullscreenButton.background = "rgba(0, 0, 0, 0.6)";
    this.fullscreenButton.cornerRadius = 5;
    this.fullscreenButton.top = "-10px";
    this.fullscreenButton.left = "-10px";
    this.fullscreenButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.fullscreenButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.fullscreenButton.fontSize = 14;

    this.fullscreenButton.onPointerClickObservable.add(() => {
      this.onFullscreenPressed?.();
    });

    this.advancedTexture.addControl(this.fullscreenButton);
  }

  /**
   * Set callback for camera mode button
   */
  public setOnCameraModePressed(callback: () => void): void {
    this.onCameraModePressed = callback;
  }

  private toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      this.showMenu();
    } else {
      this.hideMenu();
    }
  }

  private showMenu() {
    if (this.menuPanel) {
      this.menuPanel.isVisible = true;
      return;
    }

    // Create menu panel
    this.menuPanel = new Rectangle("menuPanel");
    this.menuPanel.width = "400px";
    this.menuPanel.height = "500px";
    this.menuPanel.background = "rgba(0, 0, 0, 0.9)";
    this.menuPanel.color = "white";
    this.menuPanel.thickness = 2;
    this.menuPanel.cornerRadius = 10;
    this.menuPanel.top = "110px"; // Position below camera button
    this.menuPanel.left = "-10px";
    this.menuPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.menuPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

    const menuStack = new StackPanel();
    menuStack.width = "100%";
    menuStack.paddingTop = "20px";
    menuStack.paddingBottom = "20px";
    this.menuPanel.addControl(menuStack);

    // Title
    const title = new TextBlock();
    title.text = this.config.worldName;
    title.color = "white";
    title.fontSize = 24;
    title.height = "40px";
    title.fontWeight = "bold";
    menuStack.addControl(title);

    // World ID
    const worldId = new TextBlock();
    worldId.text = `World ID: ${this.config.worldId}`;
    worldId.color = "#888";
    worldId.fontSize = 14;
    worldId.height = "30px";
    menuStack.addControl(worldId);

    // Buttons
    const buttonsData = [
      { text: "🥽 Toggle VR Mode", callback: () => this.onVRToggled?.() },
      { text: "🖥️ Fullscreen", callback: () => this.onFullscreenPressed?.() },
      { text: "🔧 Toggle Debug", callback: () => this.onDebugPressed?.() },
      { text: "⬅️ Back to Menu", callback: () => this.onBackPressed?.() }
    ];

    buttonsData.forEach((data) => {
      const btn = Button.CreateSimpleButton("menuBtn", data.text);
      btn.width = "90%";
      btn.height = "50px";
      btn.color = "white";
      btn.background = "rgba(60, 60, 60, 0.8)";
      btn.cornerRadius = 5;
      btn.fontSize = 16;
      btn.paddingTop = "10px";
      btn.paddingBottom = "10px";
      btn.onPointerClickObservable.add(() => {
        data.callback();
        this.toggleMenu();
      });
      menuStack.addControl(btn);
    });

    this.advancedTexture.addControl(this.menuPanel);
  }

  private hideMenu() {
    if (this.menuPanel) {
      this.menuPanel.isVisible = false;
    }
  }

  private createPlayerStatsPanel() {
    const panel = new Rectangle("playerStats");
    panel.width = "200px";
    panel.height = "125px"; // Increased height for gold display
    panel.background = "rgba(0, 0, 0, 0.7)";
    panel.color = "white";
    panel.thickness = 2;
    panel.cornerRadius = 5;
    panel.top = "60px";
    panel.left = "10px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

    const stack = new StackPanel();
    stack.paddingTop = "10px";
    panel.addControl(stack);

    // Title
    const title = new TextBlock();
    title.text = "Player Status";
    title.color = "white";
    title.fontSize = 16;
    title.height = "25px";
    title.fontWeight = "bold";
    stack.addControl(title);

    // Status text
    const statusText = new TextBlock("playerStatusText");
    statusText.text = "Ready";
    statusText.color = "#4CAF50";
    statusText.fontSize = 14;
    statusText.height = "20px";
    stack.addControl(statusText);

    // Energy bar background
    const energyBg = new Rectangle("energyBg");
    energyBg.width = "180px";
    energyBg.height = "20px";
    energyBg.background = "rgba(60, 60, 60, 0.8)";
    energyBg.color = "#444";
    energyBg.thickness = 1;
    energyBg.cornerRadius = 3;
    stack.addControl(energyBg);

    // Energy bar fill
    const energyFill = new Rectangle("energyFill");
    energyFill.width = "180px";
    energyFill.height = "20px";
    energyFill.background = "#4CAF50";
    energyFill.cornerRadius = 3;
    energyFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    energyBg.addControl(energyFill);

    // Energy text
    const energyText = new TextBlock("energyText");
    energyText.text = "100 / 100";
    energyText.color = "white";
    energyText.fontSize = 12;
    energyBg.addControl(energyText);

    // Gold display
    const goldText = new TextBlock("playerGoldText");
    goldText.text = "Gold: 100";
    goldText.color = "#FFD700"; // Gold color
    goldText.fontSize = 14;
    goldText.height = "20px";
    goldText.fontWeight = "bold";
    goldText.paddingTop = "5px";
    stack.addControl(goldText);

    panel.isVisible = false; // Start hidden - toggle with P key
    this.playerStatsPanel = panel;
    this.advancedTexture.addControl(panel);
  }

  private createWorldStatsPanel() {
    const panel = new Rectangle("worldStats");
    panel.width = "250px";
    panel.height = "220px";
    panel.background = "rgba(0, 0, 0, 0.7)";
    panel.color = "white";
    panel.thickness = 2;
    panel.cornerRadius = 5;
    panel.top = "170px";
    panel.left = "10px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

    const stack = new StackPanel();
    stack.paddingTop = "10px";
    stack.paddingLeft = "10px";
    stack.paddingRight = "10px";
    panel.addControl(stack);

    // Title
    const title = new TextBlock();
    title.text = "World Data";
    title.color = "white";
    title.fontSize = 16;
    title.height = "25px";
    title.fontWeight = "bold";
    stack.addControl(title);

    // Stats container (will be populated dynamically)
    const statsContainer = new StackPanel("worldStatsContainer");
    statsContainer.width = "100%";
    stack.addControl(statsContainer);

    panel.isVisible = false; // Start hidden - toggle with L key
    this.worldStatsPanel = panel;
    this.advancedTexture.addControl(panel);
  }

  private createSettlementDetailsPanel() {
    const panel = new Rectangle("settlementDetailsPanel");
    panel.width = "250px";
    panel.height = "180px";
    panel.background = "rgba(0, 0, 0, 0.7)";
    panel.color = "white";
    panel.thickness = 2;
    panel.cornerRadius = 5;
    panel.top = "330px";
    panel.left = "10px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

    const stack = new StackPanel();
    stack.paddingTop = "10px";
    stack.paddingLeft = "10px";
    stack.paddingRight = "10px";
    panel.addControl(stack);

    const title = new TextBlock();
    title.text = "Settlement";
    title.color = "white";
    title.fontSize = 16;
    title.height = "24px";
    title.fontWeight = "bold";
    stack.addControl(title);

    const nameText = new TextBlock("settlementDetailsName");
    nameText.text = "";
    nameText.color = "#E5E7EB";
    nameText.fontSize = 14;
    nameText.height = "20px";
    nameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(nameText);

    const typePopText = new TextBlock("settlementDetailsTypePop");
    typePopText.text = "";
    typePopText.color = "#9CA3AF";
    typePopText.fontSize = 13;
    typePopText.height = "20px";
    typePopText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(typePopText);

    const buildingsText = new TextBlock("settlementDetailsBuildings");
    buildingsText.text = "";
    buildingsText.color = "#D1D5DB";
    buildingsText.fontSize = 13;
    buildingsText.height = "40px";
    buildingsText.textWrapping = true;
    buildingsText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(buildingsText);

    const zoneTerrainText = new TextBlock("settlementDetailsZoneTerrain");
    zoneTerrainText.text = "";
    zoneTerrainText.color = "#9CA3AF";
    zoneTerrainText.fontSize = 12;
    zoneTerrainText.height = "20px";
    zoneTerrainText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(zoneTerrainText);

    panel.isVisible = false;
    this.settlementDetailsPanel = panel;
    this.advancedTexture.addControl(panel);
  }

  private createNPCListPanel() {
    const panel = new Rectangle("npcList");
    panel.width = "300px";
    panel.height = "200px";
    panel.background = "rgba(0, 0, 0, 0.7)";
    panel.color = "white";
    panel.thickness = 2;
    panel.cornerRadius = 5;
    panel.top = "-10px";
    panel.left = "-10px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

    const stack = new StackPanel();
    stack.paddingTop = "10px";
    panel.addControl(stack);

    // Title
    const title = new TextBlock();
    title.text = "NPCs Nearby";
    title.color = "white";
    title.fontSize = 16;
    title.height = "25px";
    title.fontWeight = "bold";
    stack.addControl(title);

    // NPC list container
    const scrollViewer = new ScrollViewer("npcScrollViewer");
    scrollViewer.width = "100%";
    scrollViewer.height = "160px";
    scrollViewer.paddingTop = "5px";
    scrollViewer.paddingBottom = "5px";
    stack.addControl(scrollViewer);

    const npcContainer = new StackPanel("npcContainer");
    npcContainer.width = "100%";
    scrollViewer.addControl(npcContainer);

    panel.isVisible = false; // Start hidden - toggle with N key
    this.npcListPanel = panel;
    this.advancedTexture.addControl(panel);
  }

  private createActionPanel() {
    const panel = new Rectangle("actionPanel");
    panel.width = "350px";
    panel.height = "250px";
    panel.background = "rgba(0, 0, 0, 0.8)";
    panel.color = "white";
    panel.thickness = 2;
    panel.cornerRadius = 5;
    panel.top = "-220px";
    panel.left = "-10px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    panel.isVisible = false;

    const stack = new StackPanel();
    stack.paddingTop = "10px";
    panel.addControl(stack);

    // Title
    const title = new TextBlock("actionPanelTitle");
    title.text = "Actions";
    title.color = "white";
    title.fontSize = 16;
    title.height = "25px";
    title.fontWeight = "bold";
    stack.addControl(title);

    // Action list container
    const scrollViewer = new ScrollViewer("actionScrollViewer");
    scrollViewer.width = "100%";
    scrollViewer.height = "210px";
    scrollViewer.paddingTop = "5px";
    scrollViewer.paddingBottom = "5px";
    stack.addControl(scrollViewer);

    const actionContainer = new StackPanel("actionContainer");
    actionContainer.width = "100%";
    scrollViewer.addControl(actionContainer);

    panel.isVisible = false; // Start hidden - toggle with X key
    this.actionPanel = panel;
    this.advancedTexture.addControl(panel);
  }

  private createFeedbackPanel() {
    const panel = new Rectangle("feedbackPanel");
    panel.width = "400px";
    panel.height = "120px";
    panel.background = "rgba(0, 0, 0, 0.9)";
    panel.color = "#4CAF50";
    panel.thickness = 2;
    panel.cornerRadius = 5;
    panel.top = "10px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    panel.isVisible = false;

    const stack = new StackPanel();
    stack.paddingTop = "10px";
    stack.paddingLeft = "15px";
    stack.paddingRight = "15px";
    panel.addControl(stack);

    // Title
    const title = new TextBlock("feedbackTitle");
    title.text = "Action Result";
    title.color = "white";
    title.fontSize = 16;
    title.height = "25px";
    title.fontWeight = "bold";
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(title);

    // Message
    const message = new TextBlock("feedbackMessage");
    message.text = "";
    message.color = "white";
    message.fontSize = 14;
    message.height = "80px";
    message.textWrapping = true;
    message.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    message.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    stack.addControl(message);

    this.feedbackPanel = panel;
    this.advancedTexture.addControl(panel);
  }

  private createMinimapPanel() {
    const MAP_SIZE = 200;

    const panel = new Rectangle("minimapPanel");
    panel.width = `${MAP_SIZE + 20}px`;
    panel.height = `${MAP_SIZE + 40}px`;
    panel.background = "rgba(0, 0, 0, 0.75)";
    panel.color = "rgba(255,255,255,0.5)";
    panel.thickness = 2;
    panel.cornerRadius = 8;
    panel.top = "10px";
    panel.left = "-10px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

    // Title
    const title = new TextBlock();
    title.text = "Map";
    title.color = "white";
    title.fontSize = 13;
    title.height = "22px";
    title.fontWeight = "bold";
    title.top = "4px";
    title.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    panel.addControl(title);

    // Map background (terrain color)
    const mapBackground = new Rectangle("minimapBackground");
    mapBackground.width = `${MAP_SIZE}px`;
    mapBackground.height = `${MAP_SIZE}px`;
    mapBackground.background = "#1a3a1a"; // Dark green terrain
    mapBackground.cornerRadius = 4;
    mapBackground.top = "28px";
    mapBackground.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    panel.addControl(mapBackground);

    // Terrain background image (heightmap-derived coloring)
    const terrainImage = new Image("minimapTerrainImage");
    terrainImage.width = `${MAP_SIZE}px`;
    terrainImage.height = `${MAP_SIZE}px`;
    terrainImage.top = "28px";
    terrainImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    terrainImage.isVisible = false;
    panel.addControl(terrainImage);
    this.minimapTerrainImage = terrainImage;

    // Static map image (rendered once with buildings/terrain)
    const staticImage = new Image("minimapStaticImage");
    staticImage.width = `${MAP_SIZE}px`;
    staticImage.height = `${MAP_SIZE}px`;
    staticImage.top = "28px";
    staticImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    staticImage.isVisible = false;
    panel.addControl(staticImage);
    this.minimapStaticImage = staticImage;

    // Container for dynamic elements (player, NPCs, quests)
    const mapContainer = new Container("minimapContainer");
    mapContainer.width = `${MAP_SIZE}px`;
    mapContainer.height = `${MAP_SIZE}px`;
    mapContainer.top = "28px";
    mapContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    panel.addControl(mapContainer);

    this.minimapPanel = panel;
    this.advancedTexture.addControl(panel);
  }

  private createReputationPanel() {
    const panel = new Rectangle("reputationPanel");
    panel.width = "220px";
    panel.height = "160px"; // Increased height for fine payment button
    panel.background = "rgba(0, 0, 0, 0.75)";
    panel.color = "white";
    panel.thickness = 2;
    panel.cornerRadius = 5;
    panel.top = "-10px";
    panel.left = "10px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    panel.isVisible = false; // Hidden by default, shown when in a zone

    const stack = new StackPanel();
    stack.paddingTop = "10px";
    stack.paddingLeft = "10px";
    stack.paddingRight = "10px";
    panel.addControl(stack);

    // Title
    const title = new TextBlock("reputationTitle");
    title.text = "Reputation";
    title.color = "white";
    title.fontSize = 14;
    title.height = "20px";
    title.fontWeight = "bold";
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(title);

    // Settlement name
    const settlementName = new TextBlock("reputationSettlement");
    settlementName.text = "Unknown";
    settlementName.color = "#AAA";
    settlementName.fontSize = 12;
    settlementName.height = "18px";
    settlementName.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(settlementName);

    // Standing text
    const standing = new TextBlock("reputationStanding");
    standing.text = "Neutral";
    standing.color = "#FFC107";
    standing.fontSize = 14;
    standing.height = "20px";
    standing.fontWeight = "bold";
    standing.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(standing);

    // Reputation bar background
    const repBarBg = new Rectangle("reputationBarBg");
    repBarBg.width = "200px";
    repBarBg.height = "16px";
    repBarBg.background = "rgba(60, 60, 60, 0.9)";
    repBarBg.color = "#444";
    repBarBg.thickness = 1;
    repBarBg.cornerRadius = 3;
    stack.addControl(repBarBg);

    // Reputation bar fill
    const repBarFill = new Rectangle("reputationBarFill");
    repBarFill.width = "100px"; // Will be updated based on score
    repBarFill.height = "16px";
    repBarFill.background = "#FFC107"; // Yellow for neutral
    repBarFill.cornerRadius = 3;
    repBarFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    repBarBg.addControl(repBarFill);

    // Score text overlay
    const scoreText = new TextBlock("reputationScore");
    scoreText.text = "0 / 100";
    scoreText.color = "white";
    scoreText.fontSize = 11;
    repBarBg.addControl(scoreText);

    // Warning/Ban indicator
    const warningText = new TextBlock("reputationWarning");
    warningText.text = "";
    warningText.color = "#F44336";
    warningText.fontSize = 11;
    warningText.height = "16px";
    warningText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(warningText);

    // Pay Fines button
    const payFinesBtn = Button.CreateSimpleButton("payFinesBtn", "Pay Fines (50g)");
    payFinesBtn.width = "200px";
    payFinesBtn.height = "28px";
    payFinesBtn.color = "white";
    payFinesBtn.background = "rgba(76, 175, 80, 0.8)"; // Green
    payFinesBtn.cornerRadius = 5;
    payFinesBtn.fontSize = 12;
    payFinesBtn.fontWeight = "bold";
    payFinesBtn.paddingTop = "4px";
    payFinesBtn.isVisible = false; // Hidden until there are fines
    payFinesBtn.onPointerClickObservable.add(() => {
      if (this.onPayFines) {
        this.onPayFines();
      }
    });
    stack.addControl(payFinesBtn);

    this.reputationPanel = panel;
    this.advancedTexture.addControl(panel);
  }

  private createFluencyPanel() {
    const panel = new Rectangle("fluencyPanel");
    panel.width = "280px";
    panel.height = "50px";
    panel.background = "rgba(0, 0, 0, 0.7)";
    panel.color = "#4FC3F7";
    panel.thickness = 1;
    panel.cornerRadius = 5;
    panel.top = "10px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    panel.isVisible = false; // Only visible for language-learning games

    const fluencyStack = new StackPanel("fluencyStack");
    fluencyStack.isVertical = true;
    fluencyStack.width = "100%";
    fluencyStack.paddingTop = "5px";
    fluencyStack.spacing = 5;
    panel.addControl(fluencyStack);

    // Fluency level label
    const levelLabel = new TextBlock("fluencyLevelLabel");
    levelLabel.text = "Beginner";
    levelLabel.color = "#4FC3F7";
    levelLabel.fontSize = 12;
    levelLabel.fontWeight = "bold";
    levelLabel.height = "16px";
    fluencyStack.addControl(levelLabel);

    // Bar background
    const barBg = new Rectangle("fluencyBarBg");
    barBg.width = "250px";
    barBg.height = "12px";
    barBg.background = "rgba(60, 60, 60, 0.9)";
    barBg.color = "#555";
    barBg.thickness = 1;
    barBg.cornerRadius = 6;
    fluencyStack.addControl(barBg);

    // Bar fill
    const barFill = new Rectangle("fluencyBarFill");
    barFill.width = "0px";
    barFill.height = "12px";
    barFill.background = "#4FC3F7";
    barFill.cornerRadius = 6;
    barFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    barBg.addControl(barFill);

    // Fluency percentage text
    const percentText = new TextBlock("fluencyPercentText");
    percentText.text = "0%";
    percentText.color = "white";
    percentText.fontSize = 9;
    barBg.addControl(percentText);

    this.fluencyPanel = panel;
    this.advancedTexture.addControl(panel);
  }

  public setGameType(gameType: string) {
    this._gameType = gameType;
    const isLanguageLearning = gameType === 'language-learning' || gameType === 'educational';
    if (this.fluencyPanel) {
      this.fluencyPanel.isVisible = isLanguageLearning;
    }
  }

  public updateFluency(fluency: number, fluencyGain?: number) {
    if (!this.fluencyPanel) return;

    // Determine level label
    let levelName: string;
    let color: string;
    if (fluency >= 80) { levelName = 'Near-Native'; color = '#FFD700'; }
    else if (fluency >= 60) { levelName = 'Advanced'; color = '#4CAF50'; }
    else if (fluency >= 40) { levelName = 'Intermediate'; color = '#8BC34A'; }
    else if (fluency >= 20) { levelName = 'Elementary'; color = '#FFC107'; }
    else { levelName = 'Beginner'; color = '#4FC3F7'; }

    const levelLabel = this.fluencyPanel.getDescendants().find(
      c => c.name === 'fluencyLevelLabel'
    ) as TextBlock;
    if (levelLabel) {
      levelLabel.text = `${levelName} — ${fluency.toFixed(0)}%`;
      levelLabel.color = color;
    }

    const barFill = this.fluencyPanel.getDescendants().find(
      c => c.name === 'fluencyBarFill'
    ) as Rectangle;
    if (barFill) {
      barFill.width = `${250 * (fluency / 100)}px`;
      barFill.background = color;
    }

    const percentText = this.fluencyPanel.getDescendants().find(
      c => c.name === 'fluencyPercentText'
    ) as TextBlock;
    if (percentText) {
      percentText.text = `${fluency.toFixed(1)}%`;
    }

    this.fluencyPanel.color = color;

    // Show floating gain text if provided
    if (fluencyGain && fluencyGain > 0) {
      this.showFluencyGainToast(`+${fluencyGain.toFixed(2)} Fluency`);
    }
  }

  private showFluencyGainToast(text: string) {
    const toast = new TextBlock("fluencyGainToast");
    toast.text = text;
    toast.color = "#4FC3F7";
    toast.fontSize = 16;
    toast.fontWeight = "bold";
    toast.top = "65px";
    toast.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    toast.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.advancedTexture.addControl(toast);

    // Animate fade out
    let alpha = 1;
    let yOffset = 65;
    const interval = setInterval(() => {
      alpha -= 0.02;
      yOffset -= 0.5;
      toast.alpha = alpha;
      toast.top = `${yOffset}px`;
      if (alpha <= 0) {
        clearInterval(interval);
        this.advancedTexture.removeControl(toast);
      }
    }, 33);
  }

  // Public methods for updating UI

  public updatePlayerStatus(status: PlayerStatus) {
    if (!this.playerStatsPanel) return;

    const statusText = this.playerStatsPanel.getDescendants().find(
      (c) => c.name === "playerStatusText"
    ) as TextBlock;
    if (statusText) {
      statusText.text = status.status;
    }

    const energyText = this.playerStatsPanel.getDescendants().find(
      (c) => c.name === "energyText"
    ) as TextBlock;
    if (energyText) {
      energyText.text = `${status.energy} / ${status.maxEnergy}`;
    }

    const energyFill = this.playerStatsPanel.getDescendants().find(
      (c) => c.name === "energyFill"
    ) as Rectangle;
    if (energyFill) {
      const percentage = status.energy / status.maxEnergy;
      energyFill.width = `${180 * percentage}px`;

      // Change color based on energy level
      if (percentage > 0.5) {
        energyFill.background = "#4CAF50"; // Green
      } else if (percentage > 0.25) {
        energyFill.background = "#FFC107"; // Yellow
      } else {
        energyFill.background = "#F44336"; // Red
      }
    }

    // Update gold display
    if (status.gold !== undefined) {
      const goldText = this.playerStatsPanel.getDescendants().find(
        (c) => c.name === "playerGoldText"
      ) as TextBlock;
      if (goldText) {
        goldText.text = `Gold: ${status.gold}`;
      }
    }
  }

  public updateWorldStats(stats: WorldStats) {
    if (!this.worldStatsPanel) return;

    const container = this.worldStatsPanel.getDescendants().find(
      (c) => c.name === "worldStatsContainer"
    ) as StackPanel;
    if (!container) return;

    // Clear existing stats
    container.clearControls();

    const statsData = [
      { label: "Countries", value: stats.countries },
      { label: "Settlements", value: stats.settlements },
      { label: "Characters", value: stats.characters },
      { label: "Rules", value: `${stats.rules + stats.baseRules}` },
      { label: "Actions", value: `${stats.actions + stats.baseActions}` },
      { label: "Quests", value: stats.quests }
    ];

    statsData.forEach((stat) => {
      const statText = new TextBlock();
      statText.text = `${stat.label}: ${stat.value}`;
      statText.color = "white";
      statText.fontSize = 13;
      statText.height = "22px";
      statText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      statText.paddingLeft = "5px";
      container.addControl(statText);
    });
  }

  public updateSettlementDetails(data: SettlementDetails | null) {
    if (!this.settlementDetailsPanel) return;

    if (!data) {
      this.settlementDetailsPanel.isVisible = false;
      return;
    }

    this.settlementDetailsPanel.isVisible = true;

    const nameText = this.settlementDetailsPanel.getDescendants().find(
      (c) => c.name === "settlementDetailsName"
    ) as TextBlock;
    if (nameText) {
      nameText.text = data.name;
    }

    const typePopText = this.settlementDetailsPanel.getDescendants().find(
      (c) => c.name === "settlementDetailsTypePop"
    ) as TextBlock;
    if (typePopText) {
      const popText = data.population ? data.population.toLocaleString() : "Unknown";
      typePopText.text = `Type: ${data.type || "Settlement"} · Population: ${popText}`;
    }

    const buildingsText = this.settlementDetailsPanel.getDescendants().find(
      (c) => c.name === "settlementDetailsBuildings"
    ) as TextBlock;
    if (buildingsText) {
      buildingsText.text = `Buildings: ${data.buildingCount} (Lots: ${data.lots}, Businesses: ${data.businesses}, Residences: ${data.residences})`;
    }

    const zoneTerrainText = this.settlementDetailsPanel.getDescendants().find(
      (c) => c.name === "settlementDetailsZoneTerrain"
    ) as TextBlock;
    if (zoneTerrainText) {
      const zone = data.zoneType ? `Zone: ${data.zoneType}` : "";
      const terrain = data.terrain ? `Terrain: ${data.terrain}` : "";
      const parts = [zone, terrain].filter(Boolean);
      zoneTerrainText.text = parts.join(" · ");
    }
  }

  public updateNPCList(npcs: NPCInfo[]) {
    if (!this.npcListPanel) return;

    const container = this.npcListPanel.getDescendants().find(
      (c) => c.name === "npcContainer"
    ) as StackPanel;
    if (!container) return;

    // Clear existing NPCs
    container.clearControls();

    if (npcs.length === 0) {
      const emptyText = new TextBlock();
      emptyText.text = "No NPCs nearby";
      emptyText.color = "#888";
      emptyText.fontSize = 14;
      emptyText.height = "30px";
      container.addControl(emptyText);
      return;
    }

    npcs.forEach((npc) => {
      let roleTag = '';
      if (npc.role === 'guard') roleTag = '[Guard] ';
      else if (npc.role === 'merchant') roleTag = '[Merchant] ';
      else if (npc.role === 'questgiver') roleTag = '[Quest] ';
      else if (npc.role === 'civilian') roleTag = '[Civ] ';

      const label = `${roleTag}${npc.name}`;

      const btn = Button.CreateSimpleButton(`npc-${npc.id}`, label);
      btn.width = "95%";
      btn.height = "35px";
      btn.fontSize = 14;
      btn.paddingTop = "5px";
      btn.paddingBottom = "5px";

      if (npc.id === this.selectedNPCId) {
        btn.background = "rgba(76, 175, 80, 0.8)";
        btn.color = "white";
      } else if (npc.questGiver) {
        btn.background = "rgba(255, 193, 7, 0.6)";
        btn.color = "white";
      } else {
        btn.background = "rgba(60, 60, 60, 0.6)";
        btn.color = "white";
      }

      btn.cornerRadius = 3;

      btn.onPointerClickObservable.add(() => {
        this.selectedNPCId = npc.id;
        this.onNPCSelected?.(npc.id);
        this.updateNPCList(npcs); // Refresh to update selection
      });

      container.addControl(btn);
    });
  }

  public updateActionList(npc: NPCInfo | null, actions: Action[], playerEnergy: number) {
    if (!this.actionPanel) return;

    const title = this.actionPanel.getDescendants().find(
      (c) => c.name === "actionPanelTitle"
    ) as TextBlock;
    const container = this.actionPanel.getDescendants().find(
      (c) => c.name === "actionContainer"
    ) as StackPanel;

    if (!container) return;

    // Clear existing actions
    container.clearControls();

    if (!npc) {
      this.actionPanel.isVisible = false;
      return;
    }

    this.actionPanel.isVisible = true;

    if (title) {
      title.text = `Actions: ${npc.name}`;
    }

    if (actions.length === 0) {
      const emptyText = new TextBlock();
      emptyText.text = "No actions available";
      emptyText.color = "#888";
      emptyText.fontSize = 14;
      emptyText.height = "30px";
      container.addControl(emptyText);
      return;
    }

    actions.forEach((action) => {
      const canAfford = !action.energyCost || playerEnergy >= action.energyCost;

      const btn = Button.CreateSimpleButton(`action-${action.id}`, action.name);
      btn.width = "95%";
      btn.height = "40px";
      btn.fontSize = 14;
      btn.paddingTop = "5px";
      btn.paddingBottom = "5px";
      btn.color = "white";
      btn.cornerRadius = 3;

      if (canAfford) {
        btn.background = "rgba(33, 150, 243, 0.8)";
      } else {
        btn.background = "rgba(100, 100, 100, 0.5)";
        btn.color = "#666";
      }

      btn.onPointerClickObservable.add(() => {
        if (canAfford) {
          this.onActionSelected?.(action.id);
        }
      });

      container.addControl(btn);

      // Energy cost label
      if (action.energyCost) {
        const costText = new TextBlock();
        costText.text = `⚡${action.energyCost}`;
        costText.color = canAfford ? "#FFC107" : "#666";
        costText.fontSize = 12;
        costText.height = "18px";
        costText.paddingLeft = "10px";
        costText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.addControl(costText);
      }
    });
  }

  public showActionFeedback(feedback: ActionFeedbackData) {
    if (!this.feedbackPanel) return;

    const title = this.feedbackPanel.getDescendants().find(
      (c) => c.name === "feedbackTitle"
    ) as TextBlock;
    const message = this.feedbackPanel.getDescendants().find(
      (c) => c.name === "feedbackMessage"
    ) as TextBlock;

    if (title) {
      title.text = `${feedback.actionName} → ${feedback.targetName}`;
    }

    if (message) {
      message.text = feedback.narrativeText || (feedback.success ? "Action succeeded!" : "Action failed.");
    }

    // Update color based on success
    if (this.feedbackPanel instanceof Rectangle) {
      this.feedbackPanel.color = feedback.success ? "#4CAF50" : "#F44336";
    }

    this.feedbackPanel.isVisible = true;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (this.feedbackPanel) {
        this.feedbackPanel.isVisible = false;
      }
    }, 5000);
  }

  public hideActionFeedback() {
    if (this.feedbackPanel) {
      this.feedbackPanel.isVisible = false;
    }
  }

  /**
   * Set the minimap terrain background from a canvas rendered by MinimapTerrainRenderer.
   * This layer sits behind the 3D screenshot and provides heightmap-based coloring.
   */
  public setMinimapTerrainBackground(canvas: HTMLCanvasElement): void {
    if (!this.minimapTerrainImage) return;
    const dataUrl = canvas.toDataURL('image/png');
    this.minimapTerrainImage.source = dataUrl;
    this.minimapTerrainImage.isVisible = true;
    console.log('[Insimul] Minimap terrain background set');
  }

  /**
   * Set the minimap background image from a pre-rendered data URL.
   * Called once during loading by BabylonGame after capturing a top-down screenshot.
   */
  public setMinimapImage(dataUrl: string, worldSize: number): void {
    this._minimapWorldSize = worldSize;

    // Load the data URL into an HTMLImageElement, then draw to a canvas
    // so we can do sliding-window extraction efficiently.
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        this._minimapFullImage = canvas;
        this.minimapStaticRendered = true;
        console.log(`[Insimul] Minimap snapshot loaded: ${img.width}x${img.height}`);
      }
    };
    img.src = dataUrl;
  }

  private _minimapWorldSize: number = 512;

  /** The full-world overhead snapshot canvas, used by the sliding-window minimap. */
  private _minimapFullImage: HTMLCanvasElement | null = null;
  /** Reusable offscreen canvas for minimap viewport extraction (avoids per-frame allocation). */
  private _minimapVpCanvas: HTMLCanvasElement | null = null;
  private _minimapVpCtx: CanvasRenderingContext2D | null = null;
  /** Last source rect used for the minimap viewport, to skip redundant redraws. */
  private _minimapLastSrcX = -1;
  private _minimapLastSrcY = -1;
  /** Last data URL assigned to the minimap background to avoid redundant source assignments. */
  private _minimapLastDataUrl = '';

  // Persistent minimap controls (created once, updated per frame)
  private _minimapPlayerOuter: Ellipse | null = null;
  private _minimapPlayerMarker: Ellipse | null = null;
  private _minimapConeImg: Image | null = null;
  private _minimapConeSvgUrl = '';
  /** Ephemeral minimap controls that are recreated each frame (NPCs, quests). */
  private _minimapDynamicControls: Control[] = [];

  public updateMinimap(data: MinimapData) {
    if (!this.minimapPanel) return;

    const mapContainer = this.minimapPanel.getDescendants().find(
      (c) => c.name === "minimapContainer"
    ) as Container;

    if (!mapContainer) return;

    const MAP_SIZE = 200;
    const mapHalf = MAP_SIZE / 2;
    const worldSize = data.worldSize;
    const worldHalf = worldSize / 2;

    // --- Sliding-window background: extract the area around the player ---
    if (this._minimapFullImage && this.minimapStaticImage) {
      const viewRadius = worldSize * 0.2;
      const px = data.playerPosition.x;
      const pz = data.playerPosition.z;

      const imgW = this._minimapFullImage.width;
      const imgH = this._minimapFullImage.height;
      const playerImgX = ((px + worldHalf) / worldSize) * imgW;
      const playerImgY = ((-pz + worldHalf) / worldSize) * imgH;
      const viewRadiusPx = (viewRadius / worldSize) * imgW;

      const srcX = Math.max(0, Math.min(imgW - viewRadiusPx * 2, playerImgX - viewRadiusPx));
      const srcY = Math.max(0, Math.min(imgH - viewRadiusPx * 2, playerImgY - viewRadiusPx));
      const srcSize = viewRadiusPx * 2;

      // Only re-encode when the viewport has shifted enough to matter visually.
      const dx = Math.abs(srcX - this._minimapLastSrcX);
      const dy = Math.abs(srcY - this._minimapLastSrcY);
      if (dx >= 2 || dy >= 2 || !this.minimapStaticImage.isVisible) {
        if (!this._minimapVpCanvas) {
          this._minimapVpCanvas = document.createElement('canvas');
          this._minimapVpCanvas.width = MAP_SIZE;
          this._minimapVpCanvas.height = MAP_SIZE;
          this._minimapVpCtx = this._minimapVpCanvas.getContext('2d');
        }
        if (this._minimapVpCtx) {
          this._minimapVpCtx.drawImage(
            this._minimapFullImage, srcX, srcY, srcSize, srcSize,
            0, 0, MAP_SIZE, MAP_SIZE
          );
          const dataUrl = this._minimapVpCanvas.toDataURL('image/jpeg', 0.85);
          // Only assign source when the data URL actually changed, to avoid
          // triggering an image reload cycle that causes flicker.
          if (dataUrl !== this._minimapLastDataUrl) {
            this.minimapStaticImage.source = dataUrl;
            this._minimapLastDataUrl = dataUrl;
          }
          this.minimapStaticImage.isVisible = true;
        }
        this._minimapLastSrcX = srcX;
        this._minimapLastSrcY = srcY;
      }
    }

    // --- Remove only ephemeral markers (NPCs, quests) from the previous frame ---
    for (const ctrl of this._minimapDynamicControls) {
      mapContainer.removeControl(ctrl);
      ctrl.dispose();
    }
    this._minimapDynamicControls = [];

    // Map world coords to minimap pixel offsets relative to the current viewport
    const viewRadius = worldSize * 0.2;
    const vpCx = data.playerPosition.x;
    const vpCz = data.playerPosition.z;
    const vpSize = viewRadius * 2;

    const toMap = (wx: number, wz: number): [number, number] => {
      const mx = ((wx - vpCx) / vpSize) * MAP_SIZE;
      const mz = (-(wz - vpCz) / vpSize) * MAP_SIZE;
      return [mx, mz];
    };

    // Draw NPC markers (small dots) — ephemeral, recreated each frame
    if (data.npcPositions) {
      for (const npc of data.npcPositions) {
        const [nx, nz] = toMap(npc.position.x, npc.position.z);
        if (Math.abs(nx) > mapHalf || Math.abs(nz) > mapHalf) continue;

        const dot = new Ellipse(`npc-${npc.id}`);
        dot.width = "5px";
        dot.height = "5px";
        dot.thickness = 0;

        if (npc.role === 'guard') dot.background = '#F44336';
        else if (npc.role === 'merchant') dot.background = '#4CAF50';
        else if (npc.role === 'questgiver') dot.background = '#FFC107';
        else dot.background = 'rgba(200,200,200,0.7)';

        dot.left = `${nx}px`;
        dot.top = `${nz}px`;
        mapContainer.addControl(dot);
        this._minimapDynamicControls.push(dot);
      }
    }

    // Draw quest markers (diamond shape) — ephemeral
    if (data.questMarkers) {
      for (const quest of data.questMarkers) {
        const [qx, qz] = toMap(quest.position.x, quest.position.z);
        if (Math.abs(qx) > mapHalf || Math.abs(qz) > mapHalf) continue;

        const questMarker = new Rectangle(`quest-${quest.id}`);
        questMarker.width = "10px";
        questMarker.height = "10px";
        questMarker.background = "#E040FB";
        questMarker.color = "#FFFFFF";
        questMarker.thickness = 1;
        questMarker.cornerRadius = 2;
        questMarker.rotation = Math.PI / 4;
        questMarker.left = `${qx}px`;
        questMarker.top = `${qz}px`;
        mapContainer.addControl(questMarker);
        this._minimapDynamicControls.push(questMarker);
      }
    }

    // --- Persistent player controls: created once, updated per frame ---

    // Direction cone (added first so it renders behind the player dot)
    if (!this._minimapConeImg) {
      const coneW = 10;
      const coneH = 28;
      const triH = 10;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${coneW}" height="${coneH}" viewBox="0 0 ${coneW} ${coneH}">` +
        `<polygon points="${coneW / 2},1 ${coneW - 1},${triH} ${1},${triH}" ` +
        `fill="rgba(255,193,7,0.5)" stroke="#FFC107" stroke-width="1"/>` +
        `</svg>`;
      this._minimapConeSvgUrl = "data:image/svg+xml," + encodeURIComponent(svg);

      this._minimapConeImg = new Image("player-cone", this._minimapConeSvgUrl);
      this._minimapConeImg.width = `${coneW}px`;
      this._minimapConeImg.height = `${coneH}px`;
      mapContainer.addControl(this._minimapConeImg);
    }
    this._minimapConeImg.rotation = data.playerRotationY;

    if (!this._minimapPlayerOuter) {
      this._minimapPlayerOuter = new Ellipse("player-marker-outer");
      this._minimapPlayerOuter.width = "14px";
      this._minimapPlayerOuter.height = "14px";
      this._minimapPlayerOuter.background = "rgba(0,0,0,0.4)";
      this._minimapPlayerOuter.color = "transparent";
      this._minimapPlayerOuter.thickness = 0;
      mapContainer.addControl(this._minimapPlayerOuter);
    }

    if (!this._minimapPlayerMarker) {
      this._minimapPlayerMarker = new Ellipse("player-marker");
      this._minimapPlayerMarker.width = "10px";
      this._minimapPlayerMarker.height = "10px";
      this._minimapPlayerMarker.background = "#FFC107";
      this._minimapPlayerMarker.color = "white";
      this._minimapPlayerMarker.thickness = 2;
      mapContainer.addControl(this._minimapPlayerMarker);
    }
  }

  /**
   * Force a re-render of the minimap's 3D overhead snapshot.
   * Currently a no-op since the snapshot is captured during loading.
   */
  public refreshMinimapSnapshot(_data: MinimapData): Promise<void> {
    return Promise.resolve();
  }

  public updateReputation(data: ReputationData | null) {
    if (!this.reputationPanel) return;

    // Hide panel if no reputation data (not in any zone)
    if (!data) {
      this.reputationPanel.isVisible = false;
      return;
    }

    // Show panel
    this.reputationPanel.isVisible = true;

    // Update settlement name
    const settlementName = this.reputationPanel.getDescendants().find(
      (c) => c.name === "reputationSettlement"
    ) as TextBlock;
    if (settlementName) {
      settlementName.text = data.settlementName;
    }

    // Update standing text and color
    const standing = this.reputationPanel.getDescendants().find(
      (c) => c.name === "reputationStanding"
    ) as TextBlock;
    if (standing) {
      standing.text = data.standing.charAt(0).toUpperCase() + data.standing.slice(1);

      // Color based on standing
      if (data.standing === 'revered') {
        standing.color = "#4CAF50"; // Green
      } else if (data.standing === 'friendly') {
        standing.color = "#8BC34A"; // Light green
      } else if (data.standing === 'neutral') {
        standing.color = "#FFC107"; // Yellow
      } else if (data.standing === 'unfriendly') {
        standing.color = "#FF9800"; // Orange
      } else if (data.standing === 'hostile') {
        standing.color = "#F44336"; // Red
      }
    }

    // Update reputation bar
    const repBarFill = this.reputationPanel.getDescendants().find(
      (c) => c.name === "reputationBarFill"
    ) as Rectangle;
    if (repBarFill) {
      // Convert score (-100 to 100) to bar width (0 to 200px)
      const normalizedScore = ((data.score + 100) / 200) * 200;
      repBarFill.width = `${Math.max(0, Math.min(200, normalizedScore))}px`;

      // Color based on score
      if (data.score >= 51) {
        repBarFill.background = "#4CAF50"; // Green (Revered)
      } else if (data.score >= 1) {
        repBarFill.background = "#8BC34A"; // Light green (Friendly)
      } else if (data.score >= -49) {
        repBarFill.background = "#FFC107"; // Yellow (Neutral)
      } else if (data.score >= -99) {
        repBarFill.background = "#FF9800"; // Orange (Unfriendly)
      } else {
        repBarFill.background = "#F44336"; // Red (Hostile)
      }
    }

    // Update score text
    const scoreText = this.reputationPanel.getDescendants().find(
      (c) => c.name === "reputationScore"
    ) as TextBlock;
    if (scoreText) {
      scoreText.text = `${data.score} / 100`;
    }

    // Update warning/ban text
    const warningText = this.reputationPanel.getDescendants().find(
      (c) => c.name === "reputationWarning"
    ) as TextBlock;
    if (warningText) {
      if (data.isBanned) {
        warningText.text = "⚠ BANNED - Leave immediately!";
        warningText.color = "#F44336";
      } else if (data.violationCount > 0) {
        warningText.text = `⚠ Violations: ${data.violationCount}`;
        warningText.color = "#FF9800";
      } else if (data.outstandingFines > 0) {
        warningText.text = `Fine due: ${data.outstandingFines} gold`;
        warningText.color = "#FFC107";
      } else {
        warningText.text = "";
      }
    }

    // Show/hide Pay Fines button based on outstanding fines
    const payFinesBtn = this.reputationPanel.getDescendants().find(
      (c) => c.name === "payFinesBtn"
    ) as Button;
    if (payFinesBtn) {
      if (data.outstandingFines > 0 && !data.isBanned) {
        payFinesBtn.isVisible = true;
        payFinesBtn.textBlock!.text = `Pay Fines (${data.outstandingFines}g)`;
      } else {
        payFinesBtn.isVisible = false;
      }
    }
  }

  // Panel toggle methods
  public togglePlayerStatsPanel() {
    if (this.playerStatsPanel) {
      this.playerStatsPanel.isVisible = !this.playerStatsPanel.isVisible;
    }
  }

  public toggleWorldStatsPanel() {
    if (this.worldStatsPanel) {
      this.worldStatsPanel.isVisible = !this.worldStatsPanel.isVisible;
    }
  }

  public toggleNPCListPanel() {
    if (this.npcListPanel) {
      this.npcListPanel.isVisible = !this.npcListPanel.isVisible;
    }
  }

  public toggleActionPanel() {
    if (this.actionPanel) {
      this.actionPanel.isVisible = !this.actionPanel.isVisible;
    }
  }

  // Toast notification system
  public showToast(options: { title: string; description?: string; variant?: 'default' | 'destructive'; duration?: number }) {
    if (!this.toastContainer) {
      this.createToastContainer();
    }

    const toastId = `toast_${this.toastIdCounter++}`;
    const duration = options.duration || 3000;

    // Create toast
    const toast = new Rectangle(toastId);
    toast.width = "350px";
    toast.height = options.description ? "100px" : "70px";
    toast.background = options.variant === 'destructive' ? "rgba(220, 38, 38, 0.95)" : "rgba(0, 0, 0, 0.95)";
    toast.color = "white";
    toast.thickness = 2;
    toast.cornerRadius = 8;
    toast.paddingTop = "10px";
    toast.paddingBottom = "10px";

    const stack = new StackPanel();
    stack.paddingLeft = "15px";
    stack.paddingRight = "15px";
    toast.addControl(stack);

    // Title
    const title = new TextBlock();
    title.text = options.title;
    title.color = "white";
    title.fontSize = 16;
    title.fontWeight = "bold";
    title.height = "25px";
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(title);

    // Description
    if (options.description) {
      const desc = new TextBlock();
      desc.text = options.description;
      desc.color = "rgba(255, 255, 255, 0.9)";
      desc.fontSize = 14;
      desc.height = "50px";
      desc.textWrapping = true;
      desc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      desc.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      stack.addControl(desc);
    }

    this.toastContainer!.addControl(toast);
    this.activeToasts.set(toastId, toast);

    // Auto-dismiss after duration
    setTimeout(() => {
      this.dismissToast(toastId);
    }, duration);
  }

  private createToastContainer() {
    this.toastContainer = new StackPanel("toastContainer");
    this.toastContainer.width = "400px";
    this.toastContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.toastContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.toastContainer.top = "80px";
    this.toastContainer.left = "-20px";
    this.advancedTexture.addControl(this.toastContainer);
  }

  private dismissToast(toastId: string) {
    const toast = this.activeToasts.get(toastId);
    if (toast && this.toastContainer) {
      this.toastContainer.removeControl(toast);
      this.activeToasts.delete(toastId);
      toast.dispose();
    }
  }

  // Help panel
  public toggleHelpPanel() {
    if (!this.helpPanel) {
      this.createHelpPanel();
    }
    this.helpPanel!.isVisible = !this.helpPanel!.isVisible;
  }

  private createHelpPanel() {
    const panel = new Rectangle("helpPanel");
    panel.width = "700px";
    panel.height = "600px";
    panel.background = "rgba(0, 0, 0, 0.95)";
    panel.color = "white";
    panel.thickness = 2;
    panel.cornerRadius = 10;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    panel.isVisible = false;

    const scrollViewer = new ScrollViewer("helpScroll");
    scrollViewer.width = "100%";
    scrollViewer.height = "100%";
    panel.addControl(scrollViewer);

    const mainStack = new StackPanel();
    mainStack.width = "100%";
    mainStack.paddingTop = "20px";
    mainStack.paddingBottom = "20px";
    mainStack.paddingLeft = "30px";
    mainStack.paddingRight = "30px";
    scrollViewer.addControl(mainStack);

    // Title
    const title = new TextBlock();
    title.text = "Keyboard Shortcuts";
    title.color = "white";
    title.fontSize = 24;
    title.fontWeight = "bold";
    title.height = "40px";
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    mainStack.addControl(title);

    // Subtitle
    const subtitle = new TextBlock();
    subtitle.text = "Press H to toggle this help menu";
    subtitle.color = "rgba(255, 255, 255, 0.7)";
    subtitle.fontSize = 14;
    subtitle.height = "30px";
    subtitle.paddingBottom = "20px";
    subtitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    mainStack.addControl(subtitle);

    // Sections
    this.addHelpSection(mainStack, "UI Panels", [
      { key: "P", action: "Toggle Player Status Panel" },
      { key: "N", action: "Toggle NPCs Nearby Panel" },
      { key: "X", action: "Toggle Action Console" },
      { key: "L", action: "Toggle World Data Panel" },
      { key: "H", action: "Toggle Help (this menu)" }
    ]);

    this.addHelpSection(mainStack, "Movement", [
      { key: "W/A/S/D", action: "Move Forward/Left/Backward/Right" },
      { key: "Shift", action: "Sprint" },
      { key: "Space", action: "Jump" }
    ]);

    this.addHelpSection(mainStack, "Interactions", [
      { key: "Space", action: "Interact with nearest NPC" },
      { key: "C", action: "Open Chat Panel" },
      { key: "Q", action: "Toggle Quest Tracker" },
      { key: "M", action: "Toggle Minimap" },
      { key: "I", action: "Toggle Inventory" },
      { key: "R", action: "Toggle Rules Panel" },
      { key: "Tab", action: "Action Menu (Radial)" }
    ]);

    this.addHelpSection(mainStack, "Combat", [
      { key: "F", action: "Attack" },
      { key: "T", action: "Target Nearest Enemy" }
    ]);

    this.addHelpSection(mainStack, "Other", [
      { key: "Shift+V", action: "Toggle VR Mode" }
    ]);

    this.helpPanel = panel;
    this.advancedTexture.addControl(panel);
  }

  private addHelpSection(parent: StackPanel, title: string, shortcuts: Array<{ key: string; action: string }>) {
    // Section title
    const sectionTitle = new TextBlock();
    sectionTitle.text = title;
    sectionTitle.color = "white";
    sectionTitle.fontSize = 18;
    sectionTitle.fontWeight = "bold";
    sectionTitle.height = "35px";
    sectionTitle.paddingTop = "15px";
    sectionTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    parent.addControl(sectionTitle);

    // Shortcuts
    shortcuts.forEach(shortcut => {
      const container = new Rectangle();
      container.width = "100%";
      container.height = "40px";
      container.background = "rgba(255, 255, 255, 0.05)";
      container.cornerRadius = 5;
      container.thickness = 0;
      container.paddingTop = "5px";
      container.paddingBottom = "5px";

      const stack = new StackPanel();
      stack.isVertical = false;
      stack.width = "100%";
      stack.height = "100%";
      container.addControl(stack);

      const actionText = new TextBlock();
      actionText.text = shortcut.action;
      actionText.color = "white";
      actionText.fontSize = 14;
      actionText.width = "500px";
      actionText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      actionText.paddingLeft = "10px";
      stack.addControl(actionText);

      const keyBadge = new Rectangle();
      keyBadge.width = "100px";
      keyBadge.height = "30px";
      keyBadge.background = "rgba(100, 100, 100, 0.8)";
      keyBadge.cornerRadius = 5;
      keyBadge.thickness = 1;
      keyBadge.color = "rgba(255, 255, 255, 0.3)";

      const keyText = new TextBlock();
      keyText.text = shortcut.key;
      keyText.color = "white";
      keyText.fontSize = 14;
      keyText.fontWeight = "bold";
      keyBadge.addControl(keyText);
      stack.addControl(keyBadge);

      parent.addControl(container);
    });
  }

  // Callback setters
  public setOnActionSelected(callback: (actionId: string) => void) {
    this.onActionSelected = callback;
  }

  public setOnNPCSelected(callback: (npcId: string) => void) {
    this.onNPCSelected = callback;
  }

  public setOnBackPressed(callback: () => void) {
    this.onBackPressed = callback;
  }

  public setOnFullscreenPressed(callback: () => void) {
    this.onFullscreenPressed = callback;
  }

  public setOnDebugPressed(callback: () => void) {
    this.onDebugPressed = callback;
  }

  public setOnPayFines(callback: () => void) {
    this.onPayFines = callback;
  }
  
  public setOnVRToggled(callback: () => void) {
    this.onVRToggled = callback;
  }

  /**
   * Show or hide all 2D overlay UI elements.
   * Used when entering/exiting VR to switch between 2D and world-space UI.
   */
  public setVisible(visible: boolean): void {
    if (this.hudContainer) this.hudContainer.isVisible = visible;
    if (this.menuButton) this.menuButton.isVisible = visible;
    if (this.cameraButton) this.cameraButton.isVisible = visible;
    if (this.fullscreenButton) this.fullscreenButton.isVisible = visible;
    if (this.toastContainer) this.toastContainer.isVisible = visible;
    if (this.minimapPanel) this.minimapPanel.isVisible = visible && this.minimapPanel.isVisible;

    // Hide any open panels when going invisible
    if (!visible) {
      if (this.menuPanel) this.menuPanel.isVisible = false;
      if (this.helpPanel) this.helpPanel.isVisible = false;
      if (this.playerStatsPanel) this.playerStatsPanel.isVisible = false;
      if (this.worldStatsPanel) this.worldStatsPanel.isVisible = false;
      if (this.npcListPanel) this.npcListPanel.isVisible = false;
      if (this.actionPanel) this.actionPanel.isVisible = false;
      if (this.settlementDetailsPanel) this.settlementDetailsPanel.isVisible = false;
      if (this.reputationPanel) this.reputationPanel.isVisible = false;
    }
  }

  public dispose() {
    this.advancedTexture.dispose();
  }
}
