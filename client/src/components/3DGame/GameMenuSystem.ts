/**
 * GameMenuSystem - Unified fullscreen game menu
 *
 * Replaces individual toggle panels (P, N, X, L, Q, I, R, H) with a single
 * fullscreen overlay that has tabbed navigation, similar to AAA games like
 * The Witcher 3. Opens with ESC, closes with ESC or clicking the close button.
 *
 * Tabs: Character, Quests, Inventory, Map, Rules, World Info, NPCs
 *
 * HUD elements (minimap, health bar, energy/gold) remain always visible
 * and are NOT part of this menu system.
 */

import {
  AdvancedDynamicTexture,
  Button,
  Container,
  Control,
  Ellipse,
  Grid,
  Rectangle,
  ScrollViewer,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui";

// ─── Data interfaces ────────────────────────────────────────────────────────

export interface MenuPlayerData {
  name: string;
  energy: number;
  maxEnergy: number;
  status: string;
  gold: number;
  level?: number;
}

export interface MenuReputationData {
  settlementName: string;
  score: number;
  standing: string;
  isBanned: boolean;
  violationCount: number;
  outstandingFines: number;
}

export interface MenuQuestData {
  id: string;
  title: string;
  description: string;
  status: string;
  questType: string;
  difficulty: string;
  progress: Record<string, any> | null;
}

export interface MenuInventoryItem {
  id: string;
  name: string;
  description?: string;
  type: string;
  quantity: number;
  icon?: string;
}

export interface MenuRuleData {
  id: string;
  name: string;
  description?: string;
  ruleType: string;
  category?: string;
  priority?: number;
  isActive?: boolean;
  isBase?: boolean;
}

export interface MenuWorldData {
  worldName: string;
  countries: number;
  settlements: number;
  characters: number;
  rules: number;
  baseRules: number;
  actions: number;
  baseActions: number;
  quests: number;
}

export interface MenuNPCData {
  id: string;
  name: string;
  occupation?: string;
  disposition?: string;
  questGiver: boolean;
  role?: string;
  distance?: number;
}

export interface MenuSettlementData {
  id: string;
  name: string;
  type: string;
  population: number;
  businesses: number;
  residences: number;
  lots: number;
  buildingCount: number;
  terrain?: string;
}

export interface MenuMapData {
  settlements: Array<{
    id: string;
    name: string;
    position: { x: number; z: number };
    type: string;
    zoneType: string;
    buildingCount?: number;
  }>;
  playerPosition: { x: number; z: number };
  worldSize: number;
}

/** Callback interface for requesting data and dispatching actions from the menu */
export interface GameMenuCallbacks {
  getPlayerData: () => MenuPlayerData | null;
  getReputations: () => MenuReputationData[];
  getQuests: () => MenuQuestData[];
  getInventoryItems: () => MenuInventoryItem[];
  getRules: () => MenuRuleData[];
  getWorldData: () => MenuWorldData | null;
  getNPCs: () => MenuNPCData[];
  getSettlements: () => MenuSettlementData[];
  getMapData: () => MenuMapData | null;
  onNPCSelected?: (npcId: string) => void;
  onPayFines?: () => void;
  onBackToEditor?: () => void;
  onToggleFullscreen?: () => void;
  onToggleDebug?: () => void;
  onToggleVR?: () => void;
}

export type MenuTab =
  | "character"
  | "quests"
  | "inventory"
  | "map"
  | "rules"
  | "world"
  | "npcs"
  | "system";

interface TabDef {
  id: MenuTab;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { id: "character", label: "Character", icon: "👤" },
  { id: "quests", label: "Quests", icon: "📜" },
  { id: "inventory", label: "Inventory", icon: "🎒" },
  { id: "map", label: "Map", icon: "🗺️" },
  { id: "rules", label: "Rules", icon: "📖" },
  { id: "world", label: "World", icon: "🌍" },
  { id: "npcs", label: "NPCs", icon: "🧑‍🤝‍🧑" },
  { id: "system", label: "System", icon: "⚙️" },
];

// ─── Colors ─────────────────────────────────────────────────────────────────

const COLORS = {
  bg: "rgba(12, 12, 18, 0.96)",
  sidebarBg: "rgba(18, 18, 28, 0.98)",
  tabIdle: "rgba(255, 255, 255, 0.06)",
  tabHover: "rgba(255, 255, 255, 0.12)",
  tabActive: "rgba(66, 133, 244, 0.35)",
  tabActiveBorder: "#4285F4",
  headerBg: "rgba(255, 255, 255, 0.04)",
  cardBg: "rgba(255, 255, 255, 0.05)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  textPrimary: "#E8EAED",
  textSecondary: "#9AA0A6",
  textMuted: "#5F6368",
  accent: "#4285F4",
  accentGreen: "#34A853",
  accentYellow: "#FBBC04",
  accentRed: "#EA4335",
  gold: "#FFD700",
  divider: "rgba(255, 255, 255, 0.08)",
};

// ─── Main class ─────────────────────────────────────────────────────────────

export class GameMenuSystem {
  private advancedTexture: AdvancedDynamicTexture;
  private callbacks: GameMenuCallbacks;

  // Root overlay
  private overlay: Rectangle | null = null;
  private sidebarPanel: Rectangle | null = null;
  private contentPanel: Rectangle | null = null;
  private tabButtons: Map<MenuTab, Button> = new Map();

  // State
  private _isOpen = false;
  private activeTab: MenuTab = "character";

  // Callbacks for game state management
  private onMenuOpened: (() => void) | null = null;
  private onMenuClosed: (() => void) | null = null;

  constructor(
    advancedTexture: AdvancedDynamicTexture,
    callbacks: GameMenuCallbacks
  ) {
    this.advancedTexture = advancedTexture;
    this.callbacks = callbacks;
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  public get isOpen(): boolean {
    return this._isOpen;
  }

  public toggle(): void {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(tab?: MenuTab): void {
    if (!this.overlay) {
      this.buildUI();
    }
    if (tab) {
      this.activeTab = tab;
    }
    this.overlay!.isVisible = true;
    this._isOpen = true;
    this.refreshActiveTab();
    this.updateTabHighlights();
    this.onMenuOpened?.();
  }

  public close(): void {
    if (this.overlay) {
      this.overlay.isVisible = false;
    }
    this._isOpen = false;
    this.onMenuClosed?.();
  }

  public setOnMenuOpened(cb: () => void): void {
    this.onMenuOpened = cb;
  }

  public setOnMenuClosed(cb: () => void): void {
    this.onMenuClosed = cb;
  }

  public dispose(): void {
    if (this.overlay) {
      this.advancedTexture.removeControl(this.overlay);
      this.overlay.dispose();
      this.overlay = null;
    }
    this.tabButtons.clear();
  }

  // ─── Build UI ───────────────────────────────────────────────────────────

  private buildUI(): void {
    // Full-screen semi-transparent overlay
    this.overlay = new Rectangle("gameMenuOverlay");
    this.overlay.width = 1;
    this.overlay.height = 1;
    this.overlay.background = COLORS.bg;
    this.overlay.thickness = 0;
    this.overlay.isVisible = false;
    this.overlay.zIndex = 100;
    this.advancedTexture.addControl(this.overlay);

    // ── Inner frame (centered, with some padding from edges) ──
    const frame = new Rectangle("menuFrame");
    frame.width = "94%";
    frame.height = "92%";
    frame.thickness = 0;
    frame.background = "transparent";
    this.overlay.addControl(frame);

    // Use a Grid to split into sidebar (200px fixed) and content (remaining)
    const grid = new Grid("menuGrid");
    grid.width = 1;
    grid.height = 1;
    grid.addColumnDefinition(200, true);  // Sidebar: 200px fixed
    grid.addColumnDefinition(1);          // Content: remaining space
    grid.addRowDefinition(1);             // Single row
    frame.addControl(grid);

    // ── Sidebar (left column) ──
    this.sidebarPanel = new Rectangle("menuSidebar");
    this.sidebarPanel.width = 1;
    this.sidebarPanel.height = 1;
    this.sidebarPanel.background = COLORS.sidebarBg;
    this.sidebarPanel.thickness = 0;
    grid.addControl(this.sidebarPanel, 0, 0);

    this.buildSidebar();

    // ── Content area (right column) ──
    this.contentPanel = new Rectangle("menuContent");
    this.contentPanel.width = 1;
    this.contentPanel.height = 1;
    this.contentPanel.background = "transparent";
    this.contentPanel.thickness = 0;
    grid.addControl(this.contentPanel, 0, 1);

    // ── Close button (top-right) ──
    const closeBtn = Button.CreateSimpleButton("menuCloseBtn", "✕");
    closeBtn.width = "44px";
    closeBtn.height = "44px";
    closeBtn.color = COLORS.textSecondary;
    closeBtn.background = "transparent";
    closeBtn.thickness = 0;
    closeBtn.fontSize = 22;
    closeBtn.cornerRadius = 22;
    closeBtn.top = "10px";
    closeBtn.left = "-10px";
    closeBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    closeBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    closeBtn.onPointerClickObservable.add(() => this.close());
    closeBtn.onPointerEnterObservable.add(() => {
      closeBtn.color = COLORS.textPrimary;
      closeBtn.background = COLORS.tabHover;
    });
    closeBtn.onPointerOutObservable.add(() => {
      closeBtn.color = COLORS.textSecondary;
      closeBtn.background = "transparent";
    });
    this.overlay.addControl(closeBtn);

    // ── ESC hint (bottom center) ──
    const escHint = new TextBlock("escHint");
    escHint.text = "Press ESC to close";
    escHint.color = COLORS.textMuted;
    escHint.fontSize = 13;
    escHint.height = "30px";
    escHint.top = "-8px";
    escHint.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.overlay.addControl(escHint);
  }

  private buildSidebar(): void {
    if (!this.sidebarPanel) return;

    const stack = new StackPanel("sidebarStack");
    stack.width = "100%";
    stack.paddingTop = "16px";
    stack.paddingBottom = "16px";
    this.sidebarPanel.addControl(stack);

    // Title
    const title = new TextBlock("menuTitle");
    title.text = "GAME MENU";
    title.color = COLORS.textSecondary;
    title.fontSize = 11;
    title.fontWeight = "bold";
    title.height = "30px";
    title.paddingLeft = "20px";
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(title);

    // Spacer
    const spacer = new Rectangle("sidebarSpacer1");
    spacer.width = 1;
    spacer.height = "8px";
    spacer.thickness = 0;
    spacer.background = "transparent";
    stack.addControl(spacer);

    // Tab buttons
    TABS.forEach((tab) => {
      const btn = Button.CreateSimpleButton(`tab_${tab.id}`, `  ${tab.icon}  ${tab.label}`);
      btn.width = "184px";
      btn.height = "44px";
      btn.color = COLORS.textPrimary;
      btn.background = COLORS.tabIdle;
      btn.fontSize = 15;
      btn.thickness = 0;
      btn.cornerRadius = 6;
      btn.paddingTop = "2px";
      btn.paddingBottom = "2px";
      btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      // Left-align text
      if (btn.textBlock) {
        btn.textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        btn.textBlock.paddingLeft = "12px";
      }

      btn.onPointerClickObservable.add(() => {
        this.activeTab = tab.id;
        this.refreshActiveTab();
        this.updateTabHighlights();
      });

      btn.onPointerEnterObservable.add(() => {
        if (this.activeTab !== tab.id) {
          btn.background = COLORS.tabHover;
        }
      });

      btn.onPointerOutObservable.add(() => {
        if (this.activeTab !== tab.id) {
          btn.background = COLORS.tabIdle;
        }
      });

      stack.addControl(btn);
      this.tabButtons.set(tab.id, btn);
    });
  }

  private updateTabHighlights(): void {
    this.tabButtons.forEach((btn, tabId) => {
      if (tabId === this.activeTab) {
        btn.background = COLORS.tabActive;
        btn.color = "#fff";
        // Simulate left border accent by using thickness
        (btn as any).thickness = 0;
      } else {
        btn.background = COLORS.tabIdle;
        btn.color = COLORS.textPrimary;
        (btn as any).thickness = 0;
      }
    });
  }

  // ─── Tab content rendering ──────────────────────────────────────────────

  private refreshActiveTab(): void {
    if (!this.contentPanel) return;

    // Clear old content
    this.contentPanel.children.slice().forEach((c) => {
      this.contentPanel!.removeControl(c);
      c.dispose();
    });

    switch (this.activeTab) {
      case "character":
        this.renderCharacterTab();
        break;
      case "quests":
        this.renderQuestsTab();
        break;
      case "inventory":
        this.renderInventoryTab();
        break;
      case "map":
        this.renderMapTab();
        break;
      case "rules":
        this.renderRulesTab();
        break;
      case "world":
        this.renderWorldTab();
        break;
      case "npcs":
        this.renderNPCsTab();
        break;
      case "system":
        this.renderSystemTab();
        break;
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private makeScrollableContent(name: string): { scroll: ScrollViewer; stack: StackPanel } {
    const scroll = new ScrollViewer(`${name}_scroll`);
    scroll.width = 1;
    scroll.height = 1;
    scroll.thickness = 0;
    scroll.barSize = 8;
    scroll.barColor = COLORS.textMuted;
    this.contentPanel!.addControl(scroll);

    const stack = new StackPanel(`${name}_stack`);
    stack.width = "100%";
    stack.paddingTop = "28px";
    stack.paddingBottom = "28px";
    stack.paddingLeft = "36px";
    stack.paddingRight = "36px";
    scroll.addControl(stack);

    return { scroll, stack };
  }

  private addSectionHeader(parent: StackPanel, text: string): void {
    const header = new TextBlock();
    header.text = text;
    header.color = COLORS.textPrimary;
    header.fontSize = 22;
    header.fontWeight = "bold";
    header.height = "40px";
    header.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    parent.addControl(header);
  }

  private addSubHeader(parent: StackPanel, text: string): void {
    const sub = new TextBlock();
    sub.text = text;
    sub.color = COLORS.textSecondary;
    sub.fontSize = 13;
    sub.height = "24px";
    sub.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    sub.paddingBottom = "12px";
    parent.addControl(sub);
  }

  private addDivider(parent: StackPanel): void {
    const line = new Rectangle();
    line.width = 1;
    line.height = "1px";
    line.background = COLORS.divider;
    line.thickness = 0;
    line.paddingTop = "8px";
    line.paddingBottom = "8px";
    parent.addControl(line);

    const spacer = new Rectangle();
    spacer.width = 1;
    spacer.height = "12px";
    spacer.thickness = 0;
    spacer.background = "transparent";
    parent.addControl(spacer);
  }

  private makeCard(parent: StackPanel, height?: string): StackPanel {
    const card = new Rectangle();
    card.width = 1;
    card.height = height || "auto";
    card.adaptHeightToChildren = !height;
    card.background = COLORS.cardBg;
    card.color = COLORS.cardBorder;
    card.thickness = 1;
    card.cornerRadius = 8;
    card.paddingBottom = "8px";
    parent.addControl(card);

    const inner = new StackPanel();
    inner.width = "100%";
    inner.paddingTop = "12px";
    inner.paddingBottom = "12px";
    inner.paddingLeft = "16px";
    inner.paddingRight = "16px";
    card.addControl(inner);

    return inner;
  }

  private addStatRow(parent: StackPanel, label: string, value: string, valueColor?: string): void {
    const row = new Rectangle();
    row.width = 1;
    row.height = "28px";
    row.thickness = 0;
    row.background = "transparent";
    parent.addControl(row);

    const lbl = new TextBlock();
    lbl.text = label;
    lbl.color = COLORS.textSecondary;
    lbl.fontSize = 14;
    lbl.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    lbl.paddingLeft = "4px";
    row.addControl(lbl);

    const val = new TextBlock();
    val.text = value;
    val.color = valueColor || COLORS.textPrimary;
    val.fontSize = 14;
    val.fontWeight = "bold";
    val.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    val.paddingRight = "4px";
    row.addControl(val);
  }

  private addProgressBar(
    parent: StackPanel,
    current: number,
    max: number,
    color: string,
    label?: string
  ): void {
    const barOuter = new Rectangle();
    barOuter.width = 1;
    barOuter.height = "22px";
    barOuter.background = "rgba(255,255,255,0.06)";
    barOuter.cornerRadius = 4;
    barOuter.thickness = 0;
    barOuter.paddingBottom = "4px";
    parent.addControl(barOuter);

    const pct = Math.max(0, Math.min(1, current / max));
    const barFill = new Rectangle();
    barFill.width = pct;
    barFill.height = 1;
    barFill.background = color;
    barFill.cornerRadius = 4;
    barFill.thickness = 0;
    barFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    barOuter.addControl(barFill);

    if (label) {
      const txt = new TextBlock();
      txt.text = label;
      txt.color = "#fff";
      txt.fontSize = 11;
      barOuter.addControl(txt);
    }
  }

  // ─── CHARACTER TAB ──────────────────────────────────────────────────────

  private renderCharacterTab(): void {
    const { stack } = this.makeScrollableContent("char");
    const player = this.callbacks.getPlayerData();

    this.addSectionHeader(stack, "Character");
    this.addSubHeader(stack, "Player stats, status, and reputation");

    if (!player) {
      const noData = new TextBlock();
      noData.text = "No player data available";
      noData.color = COLORS.textMuted;
      noData.fontSize = 15;
      noData.height = "40px";
      stack.addControl(noData);
      return;
    }

    // Status card
    const statusCard = this.makeCard(stack);
    this.addStatRow(statusCard, "Status", player.status, COLORS.accentGreen);
    this.addStatRow(statusCard, "Gold", `${player.gold}`, COLORS.gold);
    if (player.level !== undefined) {
      this.addStatRow(statusCard, "Level", `${player.level}`, COLORS.accent);
    }

    // Energy bar
    const spacer = new Rectangle();
    spacer.width = 1;
    spacer.height = "12px";
    spacer.thickness = 0;
    spacer.background = "transparent";
    stack.addControl(spacer);

    const energyCard = this.makeCard(stack);
    const energyLabel = new TextBlock();
    energyLabel.text = "Energy";
    energyLabel.color = COLORS.textSecondary;
    energyLabel.fontSize = 13;
    energyLabel.height = "22px";
    energyLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    energyCard.addControl(energyLabel);

    const energyPct = player.energy / player.maxEnergy;
    const energyColor =
      energyPct > 0.5 ? COLORS.accentGreen : energyPct > 0.25 ? COLORS.accentYellow : COLORS.accentRed;
    this.addProgressBar(energyCard, player.energy, player.maxEnergy, energyColor, `${player.energy} / ${player.maxEnergy}`);

    // Reputation section
    this.addDivider(stack);
    const reputations = this.callbacks.getReputations();
    if (reputations.length > 0) {
      const repTitle = new TextBlock();
      repTitle.text = "Reputation";
      repTitle.color = COLORS.textPrimary;
      repTitle.fontSize = 18;
      repTitle.fontWeight = "bold";
      repTitle.height = "34px";
      repTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      stack.addControl(repTitle);

      reputations.forEach((rep) => {
        const repCard = this.makeCard(stack);
        this.addStatRow(repCard, rep.settlementName, rep.standing.charAt(0).toUpperCase() + rep.standing.slice(1), this.getReputationColor(rep.score));
        this.addProgressBar(repCard, rep.score + 100, 200, this.getReputationColor(rep.score), `${rep.score}`);
        if (rep.isBanned) {
          const warn = new TextBlock();
          warn.text = "⚠ BANNED";
          warn.color = COLORS.accentRed;
          warn.fontSize = 12;
          warn.height = "20px";
          warn.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
          repCard.addControl(warn);
        }
        if (rep.outstandingFines > 0 && !rep.isBanned) {
          const fineBtn = Button.CreateSimpleButton("payFines", `Pay Fines (${rep.outstandingFines}g)`);
          fineBtn.width = "160px";
          fineBtn.height = "30px";
          fineBtn.color = "white";
          fineBtn.background = COLORS.accentGreen;
          fineBtn.cornerRadius = 6;
          fineBtn.fontSize = 12;
          fineBtn.onPointerClickObservable.add(() => this.callbacks.onPayFines?.());
          repCard.addControl(fineBtn);
        }
      });
    }
  }

  private getReputationColor(score: number): string {
    if (score >= 51) return COLORS.accentGreen;
    if (score >= 1) return "#8BC34A";
    if (score >= -49) return COLORS.accentYellow;
    if (score >= -99) return "#FF9800";
    return COLORS.accentRed;
  }

  // ─── QUESTS TAB ─────────────────────────────────────────────────────────

  private renderQuestsTab(): void {
    const { stack } = this.makeScrollableContent("quests");
    const quests = this.callbacks.getQuests();

    this.addSectionHeader(stack, "Quests");
    this.addSubHeader(stack, `${quests.length} active quest${quests.length !== 1 ? "s" : ""}`);

    if (quests.length === 0) {
      const empty = new TextBlock();
      empty.text = "No active quests. Talk to NPCs to find quests!";
      empty.color = COLORS.textMuted;
      empty.fontSize = 15;
      empty.height = "40px";
      stack.addControl(empty);
      return;
    }

    quests.forEach((quest) => {
      const card = this.makeCard(stack);

      // Quest title row
      const titleRow = new Rectangle();
      titleRow.width = 1;
      titleRow.height = "28px";
      titleRow.thickness = 0;
      titleRow.background = "transparent";
      card.addControl(titleRow);

      const titleText = new TextBlock();
      titleText.text = quest.title;
      titleText.color = COLORS.textPrimary;
      titleText.fontSize = 16;
      titleText.fontWeight = "bold";
      titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      titleRow.addControl(titleText);

      const statusBadge = new TextBlock();
      statusBadge.text = quest.status.toUpperCase();
      statusBadge.color =
        quest.status === "completed" ? COLORS.accentGreen :
        quest.status === "failed" ? COLORS.accentRed :
        COLORS.accentYellow;
      statusBadge.fontSize = 11;
      statusBadge.fontWeight = "bold";
      statusBadge.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      titleRow.addControl(statusBadge);

      // Description
      const desc = new TextBlock();
      desc.text = quest.description || "No description";
      desc.color = COLORS.textSecondary;
      desc.fontSize = 13;
      desc.height = "40px";
      desc.textWrapping = true;
      desc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      desc.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      card.addControl(desc);

      // Meta row
      this.addStatRow(card, "Type", quest.questType, COLORS.textSecondary);
      this.addStatRow(card, "Difficulty", quest.difficulty, COLORS.textSecondary);

      // Spacer between cards
      const spacer = new Rectangle();
      spacer.width = 1;
      spacer.height = "6px";
      spacer.thickness = 0;
      spacer.background = "transparent";
      stack.addControl(spacer);
    });
  }

  // ─── INVENTORY TAB ──────────────────────────────────────────────────────

  private renderInventoryTab(): void {
    const { stack } = this.makeScrollableContent("inv");
    const items = this.callbacks.getInventoryItems();

    this.addSectionHeader(stack, "Inventory");
    this.addSubHeader(stack, `${items.length} item${items.length !== 1 ? "s" : ""}`);

    if (items.length === 0) {
      const empty = new TextBlock();
      empty.text = "Your inventory is empty. Explore the world to find items!";
      empty.color = COLORS.textMuted;
      empty.fontSize = 15;
      empty.height = "40px";
      stack.addControl(empty);
      return;
    }

    // Group items by type
    const grouped = new Map<string, MenuInventoryItem[]>();
    items.forEach((item) => {
      const type = item.type || "misc";
      if (!grouped.has(type)) grouped.set(type, []);
      grouped.get(type)!.push(item);
    });

    grouped.forEach((typeItems, type) => {
      // Type header
      const typeHeader = new TextBlock();
      typeHeader.text = type.charAt(0).toUpperCase() + type.slice(1);
      typeHeader.color = COLORS.accent;
      typeHeader.fontSize = 15;
      typeHeader.fontWeight = "bold";
      typeHeader.height = "30px";
      typeHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      typeHeader.paddingTop = "8px";
      stack.addControl(typeHeader);

      typeItems.forEach((item) => {
        const card = this.makeCard(stack);

        const nameRow = new Rectangle();
        nameRow.width = 1;
        nameRow.height = "26px";
        nameRow.thickness = 0;
        nameRow.background = "transparent";
        card.addControl(nameRow);

        const nameText = new TextBlock();
        nameText.text = `${item.icon || "•"} ${item.name}`;
        nameText.color = COLORS.textPrimary;
        nameText.fontSize = 14;
        nameText.fontWeight = "bold";
        nameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        nameRow.addControl(nameText);

        if (item.quantity > 1) {
          const qty = new TextBlock();
          qty.text = `×${item.quantity}`;
          qty.color = COLORS.accentYellow;
          qty.fontSize = 13;
          qty.fontWeight = "bold";
          qty.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
          nameRow.addControl(qty);
        }

        if (item.description) {
          const desc = new TextBlock();
          desc.text = item.description;
          desc.color = COLORS.textSecondary;
          desc.fontSize = 12;
          desc.height = "22px";
          desc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
          card.addControl(desc);
        }
      });
    });
  }

  // ─── MAP TAB ────────────────────────────────────────────────────────────

  private renderMapTab(): void {
    const { stack } = this.makeScrollableContent("map");
    const mapData = this.callbacks.getMapData();

    this.addSectionHeader(stack, "World Map");

    if (!mapData) {
      const empty = new TextBlock();
      empty.text = "Map data not available";
      empty.color = COLORS.textMuted;
      empty.fontSize = 15;
      empty.height = "40px";
      stack.addControl(empty);
      return;
    }

    this.addSubHeader(stack, `${mapData.settlements.length} settlements discovered`);

    // Large map display
    const mapFrame = new Rectangle("fullMap");
    mapFrame.width = 1;
    mapFrame.height = "500px";
    mapFrame.background = "rgba(20, 20, 30, 0.95)";
    mapFrame.cornerRadius = 8;
    mapFrame.color = COLORS.cardBorder;
    mapFrame.thickness = 1;
    stack.addControl(mapFrame);

    const mapContainer = new Container("fullMapContainer");
    mapContainer.width = 1;
    mapContainer.height = 1;
    mapFrame.addControl(mapContainer);

    const mapSize = 480;
    const scale = mapSize / mapData.worldSize;

    // Draw settlement zones and markers
    mapData.settlements.forEach((settlement) => {
      const x = settlement.position.x * scale;
      const z = -settlement.position.z * scale;

      let zoneColor = COLORS.accentGreen;
      if (settlement.zoneType === "neutral") zoneColor = COLORS.accent;
      else if (settlement.zoneType === "caution") zoneColor = "#FF9800";

      // Zone circle
      const baseRadius = settlement.type === "city" ? 20 : settlement.type === "village" ? 10 : 15;
      const zone = new Ellipse(`mapZone_${settlement.id}`);
      zone.width = `${baseRadius * 2}px`;
      zone.height = `${baseRadius * 2}px`;
      zone.color = zoneColor;
      zone.thickness = 2;
      zone.background = `${zoneColor}22`;
      zone.left = `${x}px`;
      zone.top = `${z}px`;
      mapContainer.addControl(zone);

      // Settlement dot
      const dot = new Ellipse(`mapDot_${settlement.id}`);
      dot.width = "10px";
      dot.height = "10px";
      dot.color = "white";
      dot.background = zoneColor;
      dot.thickness = 1;
      dot.left = `${x}px`;
      dot.top = `${z}px`;
      mapContainer.addControl(dot);

      // Label
      const label = new TextBlock(`mapLabel_${settlement.id}`);
      label.text = settlement.name;
      label.color = COLORS.textPrimary;
      label.fontSize = 11;
      label.height = "16px";
      label.left = `${x}px`;
      label.top = `${z + baseRadius + 6}px`;
      mapContainer.addControl(label);
    });

    // Player marker
    const px = mapData.playerPosition.x * scale;
    const pz = -mapData.playerPosition.z * scale;
    const playerDot = new Rectangle("mapPlayerDot");
    playerDot.width = "10px";
    playerDot.height = "10px";
    playerDot.background = COLORS.accentYellow;
    playerDot.color = "white";
    playerDot.thickness = 2;
    playerDot.cornerRadius = 5;
    playerDot.left = `${px}px`;
    playerDot.top = `${pz}px`;
    mapContainer.addControl(playerDot);

    // Legend
    this.addDivider(stack);
    const legendCard = this.makeCard(stack);
    this.addStatRow(legendCard, "🟢 Green", "Safe Zone", COLORS.accentGreen);
    this.addStatRow(legendCard, "🔵 Blue", "Neutral Zone", COLORS.accent);
    this.addStatRow(legendCard, "🟠 Amber", "Caution Zone", "#FF9800");
    this.addStatRow(legendCard, "🟡 Yellow", "You", COLORS.accentYellow);

    // Settlement list below map
    this.addDivider(stack);
    const settlements = this.callbacks.getSettlements();
    if (settlements.length > 0) {
      const settTitle = new TextBlock();
      settTitle.text = "Settlements";
      settTitle.color = COLORS.textPrimary;
      settTitle.fontSize = 18;
      settTitle.fontWeight = "bold";
      settTitle.height = "34px";
      settTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      stack.addControl(settTitle);

      settlements.forEach((s) => {
        const card = this.makeCard(stack);
        this.addStatRow(card, "Name", s.name, COLORS.textPrimary);
        this.addStatRow(card, "Type", s.type, COLORS.textSecondary);
        this.addStatRow(card, "Population", `${s.population.toLocaleString()}`, COLORS.textSecondary);
        this.addStatRow(card, "Buildings", `${s.buildingCount}`, COLORS.textSecondary);
        if (s.terrain) {
          this.addStatRow(card, "Terrain", s.terrain, COLORS.textSecondary);
        }
      });
    }
  }

  // ─── RULES TAB ──────────────────────────────────────────────────────────

  private renderRulesTab(): void {
    const { stack } = this.makeScrollableContent("rules");
    const rules = this.callbacks.getRules();

    this.addSectionHeader(stack, "Rules");
    this.addSubHeader(stack, `${rules.length} rule${rules.length !== 1 ? "s" : ""} active in this world`);

    if (rules.length === 0) {
      const empty = new TextBlock();
      empty.text = "No rules defined for this world.";
      empty.color = COLORS.textMuted;
      empty.fontSize = 15;
      empty.height = "40px";
      stack.addControl(empty);
      return;
    }

    // Group by category
    const grouped = new Map<string, MenuRuleData[]>();
    rules.forEach((rule) => {
      const cat = rule.category || rule.ruleType || "general";
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(rule);
    });

    grouped.forEach((catRules, category) => {
      const catHeader = new TextBlock();
      catHeader.text = category.charAt(0).toUpperCase() + category.slice(1);
      catHeader.color = COLORS.accent;
      catHeader.fontSize = 15;
      catHeader.fontWeight = "bold";
      catHeader.height = "30px";
      catHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      catHeader.paddingTop = "8px";
      stack.addControl(catHeader);

      catRules.forEach((rule) => {
        const card = this.makeCard(stack);

        const nameRow = new Rectangle();
        nameRow.width = 1;
        nameRow.height = "26px";
        nameRow.thickness = 0;
        nameRow.background = "transparent";
        card.addControl(nameRow);

        const nameText = new TextBlock();
        nameText.text = rule.name;
        nameText.color = COLORS.textPrimary;
        nameText.fontSize = 14;
        nameText.fontWeight = "bold";
        nameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        nameRow.addControl(nameText);

        const typeBadge = new TextBlock();
        typeBadge.text = rule.isBase ? "BASE" : rule.ruleType.toUpperCase();
        typeBadge.color = rule.isBase ? COLORS.textMuted : COLORS.accent;
        typeBadge.fontSize = 10;
        typeBadge.fontWeight = "bold";
        typeBadge.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        nameRow.addControl(typeBadge);

        if (rule.description) {
          const desc = new TextBlock();
          desc.text = rule.description;
          desc.color = COLORS.textSecondary;
          desc.fontSize = 12;
          desc.height = "36px";
          desc.textWrapping = true;
          desc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
          desc.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
          card.addControl(desc);
        }
      });
    });
  }

  // ─── WORLD TAB ──────────────────────────────────────────────────────────

  private renderWorldTab(): void {
    const { stack } = this.makeScrollableContent("world");
    const world = this.callbacks.getWorldData();

    this.addSectionHeader(stack, "World Information");

    if (!world) {
      const empty = new TextBlock();
      empty.text = "World data not available";
      empty.color = COLORS.textMuted;
      empty.fontSize = 15;
      empty.height = "40px";
      stack.addControl(empty);
      return;
    }

    this.addSubHeader(stack, world.worldName);

    const statsCard = this.makeCard(stack);
    this.addStatRow(statsCard, "Countries", `${world.countries}`, COLORS.textPrimary);
    this.addStatRow(statsCard, "Settlements", `${world.settlements}`, COLORS.textPrimary);
    this.addStatRow(statsCard, "Characters", `${world.characters}`, COLORS.textPrimary);
    this.addStatRow(statsCard, "Rules", `${world.rules + world.baseRules}`, COLORS.textPrimary);
    this.addStatRow(statsCard, "Actions", `${world.actions + world.baseActions}`, COLORS.textPrimary);
    this.addStatRow(statsCard, "Quests", `${world.quests}`, COLORS.textPrimary);
  }

  // ─── NPCs TAB ───────────────────────────────────────────────────────────

  private renderNPCsTab(): void {
    const { stack } = this.makeScrollableContent("npcs");
    const npcs = this.callbacks.getNPCs();

    this.addSectionHeader(stack, "NPCs");
    this.addSubHeader(stack, `${npcs.length} NPC${npcs.length !== 1 ? "s" : ""} in the world`);

    if (npcs.length === 0) {
      const empty = new TextBlock();
      empty.text = "No NPCs found nearby.";
      empty.color = COLORS.textMuted;
      empty.fontSize = 15;
      empty.height = "40px";
      stack.addControl(empty);
      return;
    }

    // Sort: quest givers first, then by distance
    const sorted = [...npcs].sort((a, b) => {
      if (a.questGiver && !b.questGiver) return -1;
      if (!a.questGiver && b.questGiver) return 1;
      return (a.distance || 999) - (b.distance || 999);
    });

    sorted.forEach((npc) => {
      const card = this.makeCard(stack);

      // Name row
      const nameRow = new Rectangle();
      nameRow.width = 1;
      nameRow.height = "26px";
      nameRow.thickness = 0;
      nameRow.background = "transparent";
      card.addControl(nameRow);

      const roleIcon =
        npc.role === "guard" ? "🛡️" :
        npc.role === "merchant" ? "🪙" :
        npc.role === "questgiver" ? "❗" : "🧑";

      const nameText = new TextBlock();
      nameText.text = `${roleIcon} ${npc.name}`;
      nameText.color = npc.questGiver ? COLORS.accentYellow : COLORS.textPrimary;
      nameText.fontSize = 14;
      nameText.fontWeight = "bold";
      nameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      nameRow.addControl(nameText);

      if (npc.role) {
        const roleBadge = new TextBlock();
        roleBadge.text = npc.role.toUpperCase();
        roleBadge.color = COLORS.textMuted;
        roleBadge.fontSize = 10;
        roleBadge.fontWeight = "bold";
        roleBadge.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        nameRow.addControl(roleBadge);
      }

      if (npc.occupation) {
        const occText = new TextBlock();
        occText.text = npc.occupation;
        occText.color = COLORS.textSecondary;
        occText.fontSize = 12;
        occText.height = "20px";
        occText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(occText);
      }

      if (npc.distance !== undefined) {
        this.addStatRow(card, "Distance", `${npc.distance.toFixed(0)}m`, COLORS.textSecondary);
      }

      // Talk button
      const talkBtn = Button.CreateSimpleButton(`talkNPC_${npc.id}`, "Talk");
      talkBtn.width = "80px";
      talkBtn.height = "28px";
      talkBtn.color = "white";
      talkBtn.background = COLORS.accent;
      talkBtn.cornerRadius = 6;
      talkBtn.fontSize = 12;
      talkBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      talkBtn.onPointerClickObservable.add(() => {
        this.callbacks.onNPCSelected?.(npc.id);
        this.close();
      });
      card.addControl(talkBtn);

      // Spacer
      const spacer = new Rectangle();
      spacer.width = 1;
      spacer.height = "4px";
      spacer.thickness = 0;
      spacer.background = "transparent";
      stack.addControl(spacer);
    });
  }

  // ─── SYSTEM TAB ─────────────────────────────────────────────────────────

  private renderSystemTab(): void {
    const { stack } = this.makeScrollableContent("system");

    this.addSectionHeader(stack, "System");
    this.addSubHeader(stack, "Game settings and controls");

    // Keyboard shortcuts
    const shortcutsTitle = new TextBlock();
    shortcutsTitle.text = "Keyboard Shortcuts";
    shortcutsTitle.color = COLORS.textPrimary;
    shortcutsTitle.fontSize = 18;
    shortcutsTitle.fontWeight = "bold";
    shortcutsTitle.height = "34px";
    shortcutsTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(shortcutsTitle);

    const shortcuts = [
      { key: "ESC", action: "Open / Close this menu" },
      { key: "W / A / S / D", action: "Move" },
      { key: "Shift", action: "Sprint" },
      { key: "Space", action: "Jump" },
      { key: "G", action: "Interact / Talk to nearest NPC" },
      { key: "F", action: "Attack" },
      { key: "T", action: "Target nearest enemy" },
      { key: "V", action: "Cycle camera mode" },
      { key: "Shift+V", action: "Toggle VR Mode" },
    ];

    const shortcutCard = this.makeCard(stack);
    shortcuts.forEach((sc) => {
      this.addStatRow(shortcutCard, sc.action, `[ ${sc.key} ]`, COLORS.textMuted);
    });

    this.addDivider(stack);

    // System buttons
    const buttonsTitle = new TextBlock();
    buttonsTitle.text = "Actions";
    buttonsTitle.color = COLORS.textPrimary;
    buttonsTitle.fontSize = 18;
    buttonsTitle.fontWeight = "bold";
    buttonsTitle.height = "34px";
    buttonsTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(buttonsTitle);

    const buttonDefs = [
      { label: "🖥️  Toggle Fullscreen", cb: () => this.callbacks.onToggleFullscreen?.() },
      { label: "🥽  Toggle VR Mode", cb: () => this.callbacks.onToggleVR?.() },
      { label: "🔧  Toggle Debug Info", cb: () => this.callbacks.onToggleDebug?.() },
      { label: "⬅️  Back to Editor", cb: () => { this.close(); this.callbacks.onBackToEditor?.(); } },
    ];

    buttonDefs.forEach((def) => {
      const btn = Button.CreateSimpleButton(`sys_${def.label}`, def.label);
      btn.width = "280px";
      btn.height = "46px";
      btn.color = COLORS.textPrimary;
      btn.background = COLORS.cardBg;
      btn.cornerRadius = 8;
      btn.fontSize = 15;
      btn.thickness = 1;
      (btn as any).borderColor = COLORS.cardBorder;
      btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      btn.paddingTop = "4px";
      btn.paddingBottom = "4px";

      btn.onPointerEnterObservable.add(() => {
        btn.background = COLORS.tabHover;
      });
      btn.onPointerOutObservable.add(() => {
        btn.background = COLORS.cardBg;
      });

      btn.onPointerClickObservable.add(() => def.cb());
      stack.addControl(btn);
    });
  }
}
