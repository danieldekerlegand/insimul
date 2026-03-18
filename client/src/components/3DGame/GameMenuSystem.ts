/**
 * GameMenuSystem - Unified fullscreen game menu
 *
 * Replaces individual toggle panels (P, N, X, L, Q, I, R, H) with a single
 * fullscreen overlay that has tabbed navigation, similar to AAA games like
 * The Witcher 3. Opens with ESC, closes with ESC or clicking the close button.
 *
 * Tabs: Character, Quests, Inventory, Map, Vocabulary, Skill Tree, Notice Board, Contact List, System
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
  Image,
  Rectangle,
  ScrollViewer,
  StackPanel,
  TextBlock,
  TextWrapping,
} from "@babylonjs/gui";

import type { ConversationRecord, VocabularyEntry, GrammarPattern } from '@shared/language/language-progress';
import type { MinimapData } from './BabylonGUIManager';
import { NotificationStore } from './NotificationStore';
import type { SkillTreeStats } from './BabylonSkillTreePanel';
import type { NoticeArticle } from './BabylonNoticeBoardPanel';
import type { PlayerAssessmentData } from '@shared/assessment-types';
import type { GameSaveState } from '@shared/game-engine/types';
import {
  SKILL_TIERS,
  createDefaultSkillTreeState,
  updateSkillProgress,
  type SkillTreeState,
} from '@shared/language/language-skill-tree';

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

export interface MenuQuestObjective {
  type: string;
  description: string;
  completed?: boolean;
  current?: number;
  required?: number;
  target?: string;
}

export interface MenuQuestData {
  id: string;
  title: string;
  description: string;
  status: string;
  questType: string;
  difficulty: string;
  progress: Record<string, any> | null;
  objectives?: MenuQuestObjective[];
  experienceReward?: number;
  assignedBy?: string | null;
  targetLanguage?: string;
  tags?: string[] | null;
}

export interface MenuInventoryItem {
  id: string;
  name: string;
  description?: string;
  type: string;
  quantity: number;
  icon?: string;
  languageLearningData?: {
    targetWord: string;
    targetLanguage: string;
    pronunciation: string;
    category: string;
  };
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
  enabledModules?: string[];
  gameType?: string;
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

export interface MenuContactData {
  id: string;
  name: string;
  occupation?: string;
  disposition?: string;
  role?: string;
  questGiver: boolean;
  conversationCount: number;
  lastSpokenTimestamp: number;
  knownDetails: string[];
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

export interface SaveSlotInfo {
  slotIndex: number;
  savedAt: string;
  gameTime: number;
  zoneName?: string;
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
  getMinimapData?: () => MinimapData | null;
  getWorldSnapshot?: () => HTMLCanvasElement | null;
  // Language learning panel data
  getVocabularyData?: () => { vocabulary: VocabularyEntry[]; grammarPatterns: GrammarPattern[]; overallFluency: number; totalCorrectUsages: number; dueForReview: VocabularyEntry[] } | null;
  getConversationHistory?: () => ConversationRecord[];
  getSkillTreeStats?: () => SkillTreeStats | null;
  getNoticeArticles?: () => { articles: NoticeArticle[]; playerFluency: number };
  getAssessmentData?: () => { data: PlayerAssessmentData | null; playerLevel: number };
  onNoticeWordClicked?: (word: string, meaning: string) => void;
  onNoticeQuestionAnswered?: (correct: boolean, articleId: string) => void;
  onVocabWordSpeak?: (word: string) => void;
  getContacts?: () => MenuContactData[];
  onNPCSelected?: (npcId: string) => void;
  onNPCCalled?: (npcId: string) => void;
  onQuestSetActive?: (questId: string) => void;
  onPayFines?: () => void;
  onBackToEditor?: () => void;
  onToggleFullscreen?: () => void;
  onToggleDebug?: () => void;
  onToggleVR?: () => void;
  onToggleModule?: (moduleId: string, enabled: boolean) => void;
  getSaveSlots?: () => Promise<Array<SaveSlotInfo | null>>;
  onSaveGame?: (slotIndex: number) => Promise<boolean>;
  onLoadGame?: (slotIndex: number) => Promise<boolean>;
}

export type MenuTab =
  | "character"
  | "quests"
  | "inventory"
  | "map"
  | "vocabulary"
  | "skills"
  | "notices"
  | "contacts"
  | "notifications"
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
  { id: "vocabulary", label: "Knowledge", icon: "📚" },
  { id: "skills", label: "Skill Tree", icon: "🌳" },
  { id: "notices", label: "Library", icon: "📖" },
  { id: "contacts", label: "Contact List", icon: "📱" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
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
  private skillTreeState: SkillTreeState = createDefaultSkillTreeState();
  private answeredNoticeQuestions: Set<string> = new Set();
  private noticeShowTranslations: boolean = true;

  // Save/Load state
  private systemSubView: 'main' | 'save' | 'load' = 'main';
  private saveSlotCache: Array<SaveSlotInfo | null> = [null, null, null];
  private saveLoadBusy = false;

  // Vocabulary tab state
  private vocabSubTab: 'vocabulary' | 'grammar' = 'vocabulary';
  private vocabSortMode: 'mastery' | 'alpha' | 'recent' | 'used' | 'review' = 'mastery';
  private vocabCategoryFilter: string = 'all';

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
    grid.addColumnDefinition(165, true);  // Sidebar: fixed width
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
    closeBtn.width = "36px";
    closeBtn.height = "36px";
    closeBtn.color = COLORS.textSecondary;
    closeBtn.background = "transparent";
    closeBtn.thickness = 0;
    closeBtn.fontSize = 18;
    closeBtn.cornerRadius = 18;
    closeBtn.top = "9px";
    closeBtn.left = "-15px";
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
    escHint.text = "Press M to close";
    escHint.color = COLORS.textMuted;
    escHint.fontSize = 12;
    escHint.height = "24px";
    escHint.top = "-12px";
    escHint.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.overlay.addControl(escHint);
  }

  private buildSidebar(): void {
    if (!this.sidebarPanel) return;

    const stack = new StackPanel("sidebarStack");
    stack.width = "90%";
    stack.top = "14px";
    stack.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.sidebarPanel.addControl(stack);

    // Title
    const title = new TextBlock("menuTitle");
    title.text = "GAME MENU";
    title.color = COLORS.textSecondary;
    title.fontSize = 12;
    title.fontWeight = "bold";
    title.height = "24px";
    title.paddingLeft = "17px";
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(title);

    // Spacer
    const spacer = new Rectangle("sidebarSpacer1");
    spacer.width = 1;
    spacer.height = "6px";
    spacer.thickness = 0;
    spacer.background = "transparent";
    stack.addControl(spacer);

    // Tab buttons
    TABS.forEach((tab) => {
      const btn = Button.CreateSimpleButton(`tab_${tab.id}`, `  ${tab.icon}  ${tab.label}`);
      btn.width = "100%";
      btn.height = "29px";
      btn.color = COLORS.textPrimary;
      btn.background = COLORS.tabIdle;
      btn.fontSize = 12;
      btn.thickness = 0;
      btn.cornerRadius = 5;
      btn.paddingTop = "2px";
      btn.paddingBottom = "2px";
      btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      // Left-align text
      if (btn.textBlock) {
        btn.textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        btn.textBlock.paddingLeft = "11px";
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
      case "vocabulary":
        this.renderVocabularyTab();
        break;
      case "skills":
        this.renderSkillsTab();
        break;
      case "notices":
        this.renderNoticesTab();
        break;
      case "contacts":
        this.renderContactsTab();
        break;
      case "notifications":
        this.renderNotificationsTab();
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
    scroll.height = "95%";
    scroll.top = "15px";
    scroll.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    scroll.thickness = 0;
    scroll.barSize = 8;
    scroll.barColor = COLORS.textMuted;
    this.contentPanel!.addControl(scroll);

    const stack = new StackPanel(`${name}_stack`);
    stack.width = "90%";
    stack.left = "15px";
    stack.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    scroll.addControl(stack);

    // Top spacer inside stack (since padding/top offset clips inside ScrollViewer)
    const topSpacer = new Rectangle(`${name}_topSpacer`);
    topSpacer.height = "10px";
    topSpacer.thickness = 0;
    topSpacer.background = "transparent";
    stack.addControl(topSpacer);

    return { scroll, stack };
  }

  private addSectionHeader(parent: StackPanel, text: string): void {
    const header = new TextBlock();
    header.text = text;
    header.color = COLORS.textPrimary;
    header.fontSize = 18;
    header.fontWeight = "bold";
    header.height = "33px";
    header.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    parent.addControl(header);
  }

  private addSubHeader(parent: StackPanel, text: string): void {
    const sub = new TextBlock();
    sub.text = text;
    sub.color = COLORS.textSecondary;
    sub.fontSize = 12;
    sub.height = "30px";
    sub.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    sub.paddingBottom = "11px";
    parent.addControl(sub);
  }

  private addDivider(parent: StackPanel): void {
    const line = new Rectangle();
    line.width = 1;
    line.height = "2px";
    line.background = COLORS.divider;
    line.thickness = 0;
    line.paddingTop = "6px";
    line.paddingBottom = "6px";
    parent.addControl(line);

    const spacer = new Rectangle();
    spacer.width = 1;
    spacer.height = "11px";
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
    card.cornerRadius = 6;
    card.paddingBottom = "6px";
    parent.addControl(card);

    const inner = new StackPanel();
    inner.width = "100%";
    inner.paddingTop = "11px";
    inner.paddingBottom = "11px";
    inner.paddingLeft = "14px";
    inner.paddingRight = "14px";
    card.addControl(inner);

    return inner;
  }

  private addStatRow(parent: StackPanel, label: string, value: string, valueColor?: string): void {
    const row = new Rectangle();
    row.width = 1;
    row.height = "23px";
    row.thickness = 0;
    row.background = "transparent";
    parent.addControl(row);

    const lbl = new TextBlock();
    lbl.text = label;
    lbl.color = COLORS.textSecondary;
    lbl.fontSize = 12;
    lbl.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    lbl.paddingLeft = "5px";
    row.addControl(lbl);

    const val = new TextBlock();
    val.text = value;
    val.color = valueColor || COLORS.textPrimary;
    val.fontSize = 12;
    val.fontWeight = "bold";
    val.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    val.paddingRight = "5px";
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
    barOuter.height = "18px";
    barOuter.background = "rgba(255,255,255,0.06)";
    barOuter.cornerRadius = 3;
    barOuter.thickness = 0;
    barOuter.paddingBottom = "5px";
    parent.addControl(barOuter);

    const pct = Math.max(0, Math.min(1, current / max));
    const barFill = new Rectangle();
    barFill.width = pct;
    barFill.height = 1;
    barFill.background = color;
    barFill.cornerRadius = 3;
    barFill.thickness = 0;
    barFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    barOuter.addControl(barFill);

    if (label) {
      const txt = new TextBlock();
      txt.text = label;
      txt.color = "#fff";
      txt.fontSize = 12;
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
      noData.fontSize = 12;
      noData.height = "33px";
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
    spacer.height = "11px";
    spacer.thickness = 0;
    spacer.background = "transparent";
    stack.addControl(spacer);

    const energyCard = this.makeCard(stack);
    const energyLabel = new TextBlock();
    energyLabel.text = "Energy";
    energyLabel.color = COLORS.textSecondary;
    energyLabel.fontSize = 12;
    energyLabel.height = "18px";
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
      repTitle.fontSize = 15;
      repTitle.fontWeight = "bold";
      repTitle.height = "29px";
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
          warn.height = "17px";
          warn.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
          repCard.addControl(warn);
        }
        if (rep.outstandingFines > 0 && !rep.isBanned) {
          const fineBtn = Button.CreateSimpleButton("payFines", `Pay Fines (${rep.outstandingFines}g)`);
          fineBtn.width = "132px";
          fineBtn.height = "24px";
          fineBtn.color = "white";
          fineBtn.background = COLORS.accentGreen;
          fineBtn.cornerRadius = 5;
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
    const allQuests = this.callbacks.getQuests();

    // active = currently pursued (only one), available = selectable, unavailable = locked
    const active = allQuests.filter(q => q.status === "active");
    const available = allQuests.filter(q => q.status === "available");

    this.addSectionHeader(stack, "Quests");

    const counts: string[] = [];
    if (active.length > 0) counts.push(`1 active`);
    if (available.length > 0) counts.push(`${available.length} available`);
    this.addSubHeader(stack, counts.length > 0 ? counts.join("  ·  ") : "No quests yet");

    if (allQuests.length === 0) {
      const empty = new TextBlock();
      empty.text = "Talk to NPCs to discover quests!";
      empty.color = COLORS.textMuted;
      empty.fontSize = 12;
      empty.height = "33px";
      stack.addControl(empty);
      return;
    }

    // Render active quests first, then available
    const renderGroup = (label: string, quests: MenuQuestData[], color: string) => {
      if (quests.length === 0) return;

      const groupLabel = new TextBlock();
      groupLabel.text = `${label} (${quests.length})`;
      groupLabel.color = color;
      groupLabel.fontSize = 13;
      groupLabel.fontWeight = "bold";
      groupLabel.height = "28px";
      groupLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      groupLabel.paddingTop = "6px";
      stack.addControl(groupLabel);

      quests.forEach((quest) => {
        this.renderQuestCard(stack, quest);
      });
    };

    renderGroup("Active", active, COLORS.accentGreen);
    renderGroup("Available", available, COLORS.accent);
  }

  private renderQuestCard(parent: StackPanel, quest: MenuQuestData): void {
    const card = this.makeCard(parent);

    // ── Title row ──────────────────────────────────────────────────────────
    const titleRow = new Rectangle();
    titleRow.width = 1;
    titleRow.height = "24px";
    titleRow.thickness = 0;
    titleRow.background = "transparent";
    card.addControl(titleRow);

    const titleText = new TextBlock();
    titleText.text = quest.title;
    titleText.color = COLORS.textPrimary;
    titleText.fontSize = 14;
    titleText.fontWeight = "bold";
    titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    titleRow.addControl(titleText);

    // XP badge on the right
    if (quest.experienceReward) {
      const xpBadge = new TextBlock();
      xpBadge.text = `${quest.experienceReward} XP`;
      xpBadge.color = COLORS.gold;
      xpBadge.fontSize = 11;
      xpBadge.fontWeight = "bold";
      xpBadge.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      titleRow.addControl(xpBadge);
    }

    // ── Description ────────────────────────────────────────────────────────
    if (quest.description) {
      const desc = new TextBlock();
      desc.text = quest.description;
      desc.color = COLORS.textSecondary;
      desc.fontSize = 11;
      desc.textWrapping = TextWrapping.WordWrap;
      desc.resizeToFit = true;
      desc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      desc.paddingBottom = "4px";
      card.addControl(desc);
    }

    // ── Meta row ───────────────────────────────────────────────────────────
    const metaRow = new StackPanel();
    metaRow.isVertical = false;
    metaRow.width = 1;
    metaRow.height = "18px";
    card.addControl(metaRow);

    if (quest.questType) {
      const typeBadge = this.makeInlineBadge(quest.questType, COLORS.accent);
      metaRow.addControl(typeBadge);
    }
    if (quest.difficulty) {
      const diffColor =
        quest.difficulty === "beginner" || quest.difficulty === "easy" ? COLORS.accentGreen :
        quest.difficulty === "advanced" || quest.difficulty === "hard" ? COLORS.accentRed :
        COLORS.accentYellow;
      const diffBadge = this.makeInlineBadge(quest.difficulty, diffColor);
      metaRow.addControl(diffBadge);
    }
    if (quest.assignedBy) {
      const giverBadge = this.makeInlineBadge(`from ${quest.assignedBy}`, COLORS.textMuted);
      metaRow.addControl(giverBadge);
    }

    // ── Objectives ─────────────────────────────────────────────────────────
    const objectives = quest.objectives || [];
    if (objectives.length > 0) {
      const objHeader = new TextBlock();
      objHeader.text = "Objectives";
      objHeader.color = COLORS.textSecondary;
      objHeader.fontSize = 10;
      objHeader.fontWeight = "bold";
      objHeader.height = "20px";
      objHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      objHeader.paddingTop = "4px";
      card.addControl(objHeader);

      objectives.forEach((obj) => {
        const objRow = new StackPanel();
        objRow.isVertical = false;
        objRow.width = 1;
        objRow.height = "18px";
        card.addControl(objRow);

        // Checkbox indicator
        const check = new TextBlock();
        check.text = obj.completed ? "✓" : "○";
        check.color = obj.completed ? COLORS.accentGreen : COLORS.textMuted;
        check.fontSize = 11;
        check.width = "18px";
        check.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        objRow.addControl(check);

        // Description
        const objDesc = new TextBlock();
        objDesc.text = obj.description || obj.type;
        objDesc.color = obj.completed ? COLORS.textMuted : COLORS.textPrimary;
        objDesc.fontSize = 11;
        objDesc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        objRow.addControl(objDesc);

        // Progress count if countable
        if (obj.required && obj.required > 1) {
          const countText = new TextBlock();
          countText.text = `${obj.current || 0}/${obj.required}`;
          countText.color = COLORS.textMuted;
          countText.fontSize = 10;
          countText.width = "40px";
          countText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
          objRow.addControl(countText);
        }
      });

      // Overall progress bar
      const completedCount = objectives.filter(o => o.completed).length;
      if (objectives.length > 1) {
        const progressBg = new Rectangle();
        progressBg.width = 1;
        progressBg.height = "6px";
        progressBg.background = "rgba(255,255,255,0.08)";
        progressBg.thickness = 0;
        progressBg.cornerRadius = 3;
        progressBg.paddingTop = "4px";
        card.addControl(progressBg);

        const progressFill = new Rectangle();
        const pct = objectives.length > 0 ? completedCount / objectives.length : 0;
        progressFill.width = Math.max(pct, 0.02); // min 2% so it's visible
        progressFill.height = 1;
        progressFill.background = pct >= 1 ? COLORS.accentGreen : COLORS.accent;
        progressFill.thickness = 0;
        progressFill.cornerRadius = 3;
        progressFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        progressBg.addControl(progressFill);
      }
    }

    // "Make Active" button for available quests
    if (quest.status === "available" && this.callbacks.onQuestSetActive) {
      const btnRow = new Rectangle();
      btnRow.width = 1;
      btnRow.height = "26px";
      btnRow.thickness = 0;
      btnRow.background = "transparent";
      btnRow.paddingTop = "4px";
      card.addControl(btnRow);

      const btn = new Rectangle();
      btn.width = "100px";
      btn.height = "22px";
      btn.background = "rgba(66, 165, 245, 0.25)";
      btn.color = COLORS.accent;
      btn.thickness = 1;
      btn.cornerRadius = 4;
      btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      btn.isPointerBlocker = true;
      btn.hoverCursor = "pointer";

      const btnLabel = new TextBlock();
      btnLabel.text = "▶ Make Active";
      btnLabel.color = COLORS.accent;
      btnLabel.fontSize = 10;
      btnLabel.fontWeight = "bold";
      btn.addControl(btnLabel);

      btn.onPointerEnterObservable.add(() => { btn.background = "rgba(66, 165, 245, 0.45)"; });
      btn.onPointerOutObservable.add(() => { btn.background = "rgba(66, 165, 245, 0.25)"; });
      btn.onPointerClickObservable.add(() => {
        this.callbacks.onQuestSetActive!(quest.id);
        // Re-render the tab to reflect the change
        this.renderQuestsTab();
      });

      btnRow.addControl(btn);
    }

    // Status badge for active quests
    if (quest.status === "active") {
      const activeBadgeRow = new Rectangle();
      activeBadgeRow.width = 1;
      activeBadgeRow.height = "22px";
      activeBadgeRow.thickness = 0;
      activeBadgeRow.background = "transparent";
      activeBadgeRow.paddingTop = "4px";
      card.addControl(activeBadgeRow);

      const badge = new Rectangle();
      badge.width = "80px";
      badge.height = "18px";
      badge.background = "rgba(76, 175, 80, 0.2)";
      badge.cornerRadius = 3;
      badge.thickness = 0;
      badge.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

      const badgeLabel = new TextBlock();
      badgeLabel.text = "● Active";
      badgeLabel.color = COLORS.accentGreen;
      badgeLabel.fontSize = 10;
      badgeLabel.fontWeight = "bold";
      badge.addControl(badgeLabel);

      activeBadgeRow.addControl(badge);
    }

    // Card bottom spacer
    const spacer = new Rectangle();
    spacer.width = 1;
    spacer.height = "6px";
    spacer.thickness = 0;
    spacer.background = "transparent";
    parent.addControl(spacer);
  }

  private makeInlineBadge(text: string, color: string): Rectangle {
    const badge = new Rectangle();
    badge.width = `${Math.max(text.length * 7 + 12, 50)}px`;
    badge.height = "16px";
    badge.background = "rgba(255,255,255,0.06)";
    badge.cornerRadius = 3;
    badge.thickness = 0;
    badge.paddingRight = "4px";

    const label = new TextBlock();
    label.text = text;
    label.color = color;
    label.fontSize = 9;
    label.fontWeight = "bold";
    badge.addControl(label);

    return badge;
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
      empty.fontSize = 12;
      empty.height = "33px";
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
      typeHeader.fontSize = 12;
      typeHeader.fontWeight = "bold";
      typeHeader.height = "24px";
      typeHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      typeHeader.paddingTop = "6px";
      stack.addControl(typeHeader);

      typeItems.forEach((item) => {
        const card = this.makeCard(stack);

        const nameRow = new Rectangle();
        nameRow.width = 1;
        nameRow.height = "21px";
        nameRow.thickness = 0;
        nameRow.background = "transparent";
        card.addControl(nameRow);

        const nameText = new TextBlock();
        const itemDisplayName = item.languageLearningData?.targetWord || item.name;
        nameText.text = `${item.icon || "•"} ${itemDisplayName}`;
        nameText.color = COLORS.textPrimary;
        nameText.fontSize = 12;
        nameText.fontWeight = "bold";
        nameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        nameRow.addControl(nameText);

        if (item.quantity > 1) {
          const qty = new TextBlock();
          qty.text = `×${item.quantity}`;
          qty.color = COLORS.accentYellow;
          qty.fontSize = 12;
          qty.fontWeight = "bold";
          qty.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
          nameRow.addControl(qty);
        }

        if (item.description) {
          const desc = new TextBlock();
          desc.text = item.description;
          desc.color = COLORS.textSecondary;
          desc.fontSize = 12;
          desc.height = "18px";
          desc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
          card.addControl(desc);
        }
      });
    });
  }

  // ─── MAP TAB ────────────────────────────────────────────────────────────

  /** Reusable canvas for compositing the menu map view. */
  private _menuMapCanvas: HTMLCanvasElement | null = null;
  private _menuMapCtx: CanvasRenderingContext2D | null = null;

  private renderMapTab(): void {
    const { stack } = this.makeScrollableContent("map");

    const minimapData = this.callbacks.getMinimapData?.() ?? null;
    const snapshot = this.callbacks.getWorldSnapshot?.() ?? null;

    this.addSectionHeader(stack, "World Map");

    if (!minimapData || minimapData.settlements.length === 0) {
      const empty = new TextBlock();
      empty.text = "Map data not available";
      empty.color = COLORS.textMuted;
      empty.fontSize = 12;
      empty.height = "33px";
      stack.addControl(empty);
      return;
    }

    this.addSubHeader(stack, `${minimapData.settlements.length} settlements discovered`);

    // ── Large rendered map (reuses world snapshot like FullscreenMap) ────
    const MAP_PX = 480;

    const mapFrame = new Rectangle("fullMap");
    mapFrame.width = `${MAP_PX + 4}px`;
    mapFrame.height = `${MAP_PX + 4}px`;
    mapFrame.background = "rgba(20, 20, 30, 0.95)";
    mapFrame.cornerRadius = 6;
    mapFrame.color = COLORS.cardBorder;
    mapFrame.thickness = 1;
    stack.addControl(mapFrame);

    // Render the snapshot + overlays onto a canvas, then display as Image
    const mapImage = new Image("menuMapImage");
    mapImage.width = `${MAP_PX}px`;
    mapImage.height = `${MAP_PX}px`;
    mapFrame.addControl(mapImage);

    // Container for dynamic GUI markers on top of the image
    const mapContainer = new Container("menuMapMarkerContainer");
    mapContainer.width = `${MAP_PX}px`;
    mapContainer.height = `${MAP_PX}px`;
    mapFrame.addControl(mapContainer);

    // Composit the snapshot + streets onto the canvas
    if (!this._menuMapCanvas) {
      this._menuMapCanvas = document.createElement("canvas");
      this._menuMapCanvas.width = MAP_PX;
      this._menuMapCanvas.height = MAP_PX;
      this._menuMapCtx = this._menuMapCanvas.getContext("2d");
    }
    const ctx = this._menuMapCtx;
    if (ctx) {
      ctx.clearRect(0, 0, MAP_PX, MAP_PX);
      if (snapshot) {
        ctx.drawImage(snapshot, 0, 0, MAP_PX, MAP_PX);
      } else {
        ctx.fillStyle = "rgba(20, 20, 30, 1)";
        ctx.fillRect(0, 0, MAP_PX, MAP_PX);
      }
      // Draw streets
      if (minimapData.streets && minimapData.streets.length > 0) {
        const worldSize = minimapData.worldSize;
        const worldHalf = worldSize / 2;
        ctx.save();
        ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (const street of minimapData.streets) {
          if (street.waypoints.length < 2) continue;
          ctx.lineWidth = Math.max(1, (street.width / worldSize) * MAP_PX);
          ctx.beginPath();
          const sx = ((street.waypoints[0].x + worldHalf) / worldSize) * MAP_PX;
          const sy = ((-street.waypoints[0].z + worldHalf) / worldSize) * MAP_PX;
          ctx.moveTo(sx, sy);
          for (let i = 1; i < street.waypoints.length; i++) {
            const px = ((street.waypoints[i].x + worldHalf) / worldSize) * MAP_PX;
            const py = ((-street.waypoints[i].z + worldHalf) / worldSize) * MAP_PX;
            ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
      // Draw buildings
      if (minimapData.buildings && minimapData.buildings.length > 0) {
        const worldSize = minimapData.worldSize;
        const worldHalf = worldSize / 2;
        ctx.save();
        for (const b of minimapData.buildings) {
          const bx = ((b.position.x + worldHalf) / worldSize) * MAP_PX;
          const by = ((-b.position.z + worldHalf) / worldSize) * MAP_PX;
          const bw = Math.max(2, ((b.width ?? 6) / worldSize) * MAP_PX);
          const bh = Math.max(2, ((b.depth ?? 6) / worldSize) * MAP_PX);
          ctx.fillStyle = b.type === "business" ? "rgba(100,149,237,0.6)"
            : b.type === "residence" ? "rgba(210,180,140,0.6)"
            : "rgba(160,160,160,0.5)";
          ctx.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
        }
        ctx.restore();
      }
      mapImage.source = this._menuMapCanvas.toDataURL("image/jpeg", 0.9);
    }

    // ── Helper: world coords → map pixel offset ──
    const worldSize = minimapData.worldSize;
    const worldHalf = worldSize / 2;
    const mapHalf = MAP_PX / 2;
    const toMap = (wx: number, wz: number): [number, number] => {
      const mx = ((wx + worldHalf) / worldSize) * MAP_PX - mapHalf;
      const mz = ((-wz + worldHalf) / worldSize) * MAP_PX - mapHalf;
      return [mx, mz];
    };

    // ── Settlement markers ──
    for (const s of minimapData.settlements) {
      const [sx, sz] = toMap(s.position.x, s.position.z);
      const dot = new Ellipse(`menuMapSettDot_${s.id}`);
      dot.width = "10px";
      dot.height = "10px";
      dot.background = s.type === "city" ? "#9C27B0" : s.type === "town" ? "#2196F3" : "#4CAF50";
      dot.color = "white";
      dot.thickness = 1;
      dot.left = `${sx}px`;
      dot.top = `${sz}px`;
      mapContainer.addControl(dot);

      const label = new TextBlock(`menuMapSettLabel_${s.id}`, s.name);
      label.fontSize = 10;
      label.color = "white";
      label.left = `${sx}px`;
      label.top = `${sz - 13}px`;
      label.resizeToFit = true;
      mapContainer.addControl(label);
    }

    // ── NPC markers ──
    if (minimapData.npcPositions) {
      for (const npc of minimapData.npcPositions) {
        const [nx, nz] = toMap(npc.position.x, npc.position.z);
        const dot = new Ellipse(`menuMapNpc_${npc.id}`);
        dot.width = "6px";
        dot.height = "6px";
        dot.thickness = 0;
        dot.background = npc.role === "guard" ? "#F44336"
          : npc.role === "merchant" ? "#4CAF50"
          : npc.role === "questgiver" ? "#FFC107"
          : "rgba(200,200,200,0.7)";
        dot.left = `${nx}px`;
        dot.top = `${nz}px`;
        mapContainer.addControl(dot);
      }
    }

    // ── Quest markers ──
    if (minimapData.questMarkers) {
      for (const quest of minimapData.questMarkers) {
        const [qx, qz] = toMap(quest.position.x, quest.position.z);
        const marker = new Rectangle(`menuMapQuest_${quest.id}`);
        marker.width = "12px";
        marker.height = "12px";
        marker.background = "#E040FB";
        marker.color = "#FFFFFF";
        marker.thickness = 1;
        marker.cornerRadius = 2;
        marker.rotation = Math.PI / 4;
        marker.left = `${qx}px`;
        marker.top = `${qz}px`;
        mapContainer.addControl(marker);

        const qlabel = new TextBlock(`menuMapQuestLabel_${quest.id}`, quest.title);
        qlabel.fontSize = 9;
        qlabel.color = "#E040FB";
        qlabel.left = `${qx}px`;
        qlabel.top = `${qz - 13}px`;
        qlabel.resizeToFit = true;
        mapContainer.addControl(qlabel);
      }
    }

    // ── Quest item markers (gold circles for fetch quest collectibles) ──
    if (minimapData.questItemMarkers) {
      for (const item of minimapData.questItemMarkers) {
        const [ix, iz] = toMap(item.position.x, item.position.z);
        const itemMarker = new Ellipse(`menuMapQuestItem_${item.id}`);
        itemMarker.width = "8px";
        itemMarker.height = "8px";
        itemMarker.background = "#FFD700";
        itemMarker.color = "#FFFFFF";
        itemMarker.thickness = 1;
        itemMarker.left = `${ix}px`;
        itemMarker.top = `${iz}px`;
        mapContainer.addControl(itemMarker);
      }
    }

    // ── Player marker (always on top) ──
    const [ppx, ppz] = toMap(minimapData.playerPosition.x, minimapData.playerPosition.z);
    const playerOuter = new Ellipse("menuMapPlayerOuter");
    playerOuter.width = "18px";
    playerOuter.height = "18px";
    playerOuter.background = "rgba(0,0,0,0.4)";
    playerOuter.color = "transparent";
    playerOuter.thickness = 0;
    playerOuter.left = `${ppx}px`;
    playerOuter.top = `${ppz}px`;
    mapContainer.addControl(playerOuter);

    const playerDot = new Ellipse("menuMapPlayerDot");
    playerDot.width = "14px";
    playerDot.height = "14px";
    playerDot.background = "#FFC107";
    playerDot.color = "white";
    playerDot.thickness = 2;
    playerDot.left = `${ppx}px`;
    playerDot.top = `${ppz}px`;
    mapContainer.addControl(playerDot);

    // ── Legend ──
    this.addDivider(stack);
    const legendCard = this.makeCard(stack);
    this.addStatRow(legendCard, "Yellow dot", "You", "#FFC107");
    this.addStatRow(legendCard, "Purple dot", "City", "#9C27B0");
    this.addStatRow(legendCard, "Blue dot", "Town", "#2196F3");
    this.addStatRow(legendCard, "Green dot", "Village", "#4CAF50");
    this.addStatRow(legendCard, "Pink diamond", "Quest", "#E040FB");
    this.addStatRow(legendCard, "Red dot", "Guard", "#F44336");
    this.addStatRow(legendCard, "Green dot", "Merchant", "#4CAF50");

    // ── Settlement list below map ──
    this.addDivider(stack);
    const settlements = this.callbacks.getSettlements();
    if (settlements.length > 0) {
      const settTitle = new TextBlock();
      settTitle.text = "Settlements";
      settTitle.color = COLORS.textPrimary;
      settTitle.fontSize = 15;
      settTitle.fontWeight = "bold";
      settTitle.height = "29px";
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

  // ─── CONTACT LIST TAB ───────────────────────────────────────────────────

  private renderContactsTab(): void {
    const { stack } = this.makeScrollableContent("contacts");
    const contacts = this.callbacks.getContacts?.() || [];

    this.addSectionHeader(stack, "Contact List");

    if (contacts.length === 0) {
      const empty = new TextBlock();
      empty.text = "No contacts yet.\nSpeak with NPCs in person to add them to your contact list.";
      empty.color = COLORS.textMuted;
      empty.fontSize = 12;
      empty.height = "50px";
      empty.textWrapping = true;
      stack.addControl(empty);
      return;
    }

    this.addSubHeader(stack, `${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`);

    // Sort: most recently spoken to first
    const sorted = [...contacts].sort((a, b) => b.lastSpokenTimestamp - a.lastSpokenTimestamp);

    sorted.forEach((contact) => {
      const card = this.makeCard(stack);

      // Name row with role badge
      const nameRow = new Rectangle();
      nameRow.width = 1;
      nameRow.height = "21px";
      nameRow.thickness = 0;
      nameRow.background = "transparent";
      card.addControl(nameRow);

      const roleIcon =
        contact.role === "guard" ? "🛡️" :
        contact.role === "merchant" ? "🪙" :
        contact.role === "questgiver" ? "❗" : "🧑";

      const nameText = new TextBlock();
      nameText.text = `${roleIcon} ${contact.name}`;
      nameText.color = contact.questGiver ? COLORS.accentYellow : COLORS.textPrimary;
      nameText.fontSize = 13;
      nameText.fontWeight = "bold";
      nameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      nameRow.addControl(nameText);

      if (contact.role) {
        const roleBadge = new TextBlock();
        roleBadge.text = contact.role.toUpperCase();
        roleBadge.color = COLORS.textMuted;
        roleBadge.fontSize = 10;
        roleBadge.fontWeight = "bold";
        roleBadge.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        nameRow.addControl(roleBadge);
      }

      // Occupation
      if (contact.occupation) {
        const occText = new TextBlock();
        occText.text = contact.occupation;
        occText.color = COLORS.textSecondary;
        occText.fontSize = 12;
        occText.height = "17px";
        occText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(occText);
      }

      // Known details
      if (contact.knownDetails.length > 0) {
        const detailsHeader = new TextBlock();
        detailsHeader.text = "What you know:";
        detailsHeader.color = COLORS.textMuted;
        detailsHeader.fontSize = 10;
        detailsHeader.height = "16px";
        detailsHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(detailsHeader);

        for (const detail of contact.knownDetails.slice(0, 4)) {
          const detailText = new TextBlock();
          detailText.text = `  · ${detail}`;
          detailText.color = COLORS.textSecondary;
          detailText.fontSize = 11;
          detailText.height = "15px";
          detailText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
          card.addControl(detailText);
        }
        if (contact.knownDetails.length > 4) {
          const moreText = new TextBlock();
          moreText.text = `  +${contact.knownDetails.length - 4} more...`;
          moreText.color = COLORS.textMuted;
          moreText.fontSize = 10;
          moreText.height = "14px";
          moreText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
          card.addControl(moreText);
        }
      }

      // Stats row
      const timeAgo = this.formatTimeAgo(contact.lastSpokenTimestamp);
      this.addStatRow(card, "Conversations", `${contact.conversationCount}`, COLORS.textSecondary);
      this.addStatRow(card, "Last spoken", timeAgo, COLORS.textMuted);

      // Call button
      const callBtn = Button.CreateSimpleButton(`callNPC_${contact.id}`, "📞 Call");
      callBtn.width = "80px";
      callBtn.height = "25px";
      callBtn.color = "white";
      callBtn.background = COLORS.accentGreen;
      callBtn.cornerRadius = 5;
      callBtn.fontSize = 12;
      callBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      callBtn.onPointerClickObservable.add(() => {
        this.callbacks.onNPCCalled?.(contact.id);
        this.close();
      });
      callBtn.onPointerEnterObservable.add(() => {
        callBtn.background = "#2E9348";
      });
      callBtn.onPointerOutObservable.add(() => {
        callBtn.background = COLORS.accentGreen;
      });
      card.addControl(callBtn);

      // Spacer
      const spacer = new Rectangle();
      spacer.width = 1;
      spacer.height = "5px";
      spacer.thickness = 0;
      spacer.background = "transparent";
      stack.addControl(spacer);
    });
  }

  private formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // ─── NOTIFICATIONS TAB ──────────────────────────────────────────────────

  private renderNotificationsTab(): void {
    const { stack } = this.makeScrollableContent("notifications");

    this.addSectionHeader(stack, "Notifications");

    const items = NotificationStore.all();

    if (items.length === 0) {
      const empty = new TextBlock();
      empty.text = "No notifications yet.";
      empty.color = COLORS.textMuted;
      empty.fontSize = 12;
      empty.height = "40px";
      empty.textWrapping = true;
      stack.addControl(empty);
      return;
    }

    this.addSubHeader(stack, `${items.length} notification${items.length !== 1 ? "s" : ""}`);

    // Clear all button
    const clearBtn = Button.CreateSimpleButton("clearNotifs", "Clear All");
    clearBtn.width = "90px";
    clearBtn.height = "26px";
    clearBtn.color = COLORS.textSecondary;
    clearBtn.background = COLORS.cardBg;
    clearBtn.fontSize = 11;
    clearBtn.cornerRadius = 4;
    clearBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    clearBtn.onPointerClickObservable.add(() => {
      NotificationStore.clear();
      this.refreshActiveTab();
    });
    stack.addControl(clearBtn);

    this.addDivider(stack);

    for (const n of items) {
      const card = this.makeCard(stack);

      // Header row: icon + title + time
      const headerRow = new Rectangle();
      headerRow.width = 1;
      headerRow.height = "20px";
      headerRow.thickness = 0;
      headerRow.background = "transparent";
      card.addControl(headerRow);

      const titleText = new TextBlock();
      titleText.text = `${n.icon ? n.icon + " " : ""}${n.title}`;
      titleText.color = n.color || COLORS.textPrimary;
      titleText.fontSize = 12;
      titleText.fontWeight = "bold";
      titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      headerRow.addControl(titleText);

      // Timestamp
      const timeText = new TextBlock();
      const date = new Date(n.timestamp);
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      timeText.text = `${h}:${m}`;
      timeText.color = COLORS.textMuted;
      timeText.fontSize = 10;
      timeText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      headerRow.addControl(timeText);

      // Description
      if (n.description) {
        const descText = new TextBlock();
        descText.text = n.description;
        descText.color = COLORS.textSecondary;
        descText.fontSize = 11;
        descText.height = "18px";
        descText.textWrapping = TextWrapping.WordWrap;
        descText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(descText);
      }

      // Category badge
      if (n.category) {
        const badge = new TextBlock();
        badge.text = n.category.toUpperCase();
        badge.color = COLORS.textMuted;
        badge.fontSize = 9;
        badge.height = "14px";
        badge.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(badge);
      }
    }
  }

  // ─── SYSTEM TAB ─────────────────────────────────────────────────────────

  private renderSystemTab(): void {
    switch (this.systemSubView) {
      case 'save':
        this.renderSaveLoadView('save');
        return;
      case 'load':
        this.renderSaveLoadView('load');
        return;
    }

    const { stack } = this.makeScrollableContent("system");

    this.addSectionHeader(stack, "System");
    this.addSubHeader(stack, "Game settings and controls");

    // Save / Load buttons at top
    if (this.callbacks.onSaveGame || this.callbacks.onLoadGame) {
      const saveLoadRow = new StackPanel("saveLoadRow");
      saveLoadRow.isVertical = false;
      saveLoadRow.width = 1;
      saveLoadRow.height = "40px";
      saveLoadRow.paddingBottom = "8px";
      stack.addControl(saveLoadRow);

      if (this.callbacks.onSaveGame) {
        const saveBtn = this.makeSystemButton("sys_saveGame", "Save Game");
        saveBtn.width = "140px";
        saveBtn.height = "34px";
        saveBtn.fontSize = 13;
        saveBtn.fontWeight = "bold";
        saveBtn.background = COLORS.accent;
        saveBtn.color = "#FFFFFF";
        saveBtn.paddingRight = "8px";
        saveBtn.onPointerEnterObservable.add(() => { saveBtn.background = "#5A9CF5"; });
        saveBtn.onPointerOutObservable.add(() => { saveBtn.background = COLORS.accent; });
        saveBtn.onPointerClickObservable.add(() => {
          this.systemSubView = 'save';
          this.refreshSaveSlots();
        });
        saveLoadRow.addControl(saveBtn);
      }

      if (this.callbacks.onLoadGame) {
        const loadBtn = this.makeSystemButton("sys_loadGame", "Load Game");
        loadBtn.width = "140px";
        loadBtn.height = "34px";
        loadBtn.fontSize = 13;
        loadBtn.fontWeight = "bold";
        loadBtn.onPointerClickObservable.add(() => {
          this.systemSubView = 'load';
          this.refreshSaveSlots();
        });
        saveLoadRow.addControl(loadBtn);
      }

      this.addDivider(stack);
    }

    // Keyboard shortcuts
    const shortcutsTitle = new TextBlock();
    shortcutsTitle.text = "Keyboard Shortcuts";
    shortcutsTitle.color = COLORS.textPrimary;
    shortcutsTitle.fontSize = 15;
    shortcutsTitle.fontWeight = "bold";
    shortcutsTitle.height = "29px";
    shortcutsTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(shortcutsTitle);

    const shortcuts = [
      { key: "ESC / M", action: "Open / Close this menu" },
      { key: "W / A / S / D", action: "Move" },
      { key: "Q / E", action: "Strafe left / right" },
      { key: "Shift", action: "Sprint" },
      { key: "Space", action: "Jump" },
      { key: "Enter", action: "Enter / Exit building" },
      { key: "G", action: "Talk to nearest NPC" },
      { key: "F", action: "Attack" },
      { key: "T", action: "Target nearest enemy" },
      { key: "Y", action: "Eavesdrop on NPC conversation" },
      { key: "X", action: "Examine nearby object" },
      { key: "R", action: "Push-to-talk (hold to record)" },
      { key: "J", action: "Quest log" },
      { key: "Tab", action: "Full-screen map" },
      { key: "F5", action: "Quick save" },
      { key: "F9", action: "Quick load" },
    ];

    const shortcutCard = this.makeCard(stack);
    shortcuts.forEach((sc) => {
      this.addStatRow(shortcutCard, sc.action, `[ ${sc.key} ]`, COLORS.textMuted);
    });

    this.addDivider(stack);

    // System buttons — horizontal row
    const buttonRow = new StackPanel("sysButtonRow");
    buttonRow.isVertical = false;
    buttonRow.width = 1;
    buttonRow.height = "32px";
    buttonRow.paddingTop = "4px";
    stack.addControl(buttonRow);

    const buttonDefs = [
      { label: "Fullscreen", icon: "\u{1F5A5}\uFE0F", cb: () => this.callbacks.onToggleFullscreen?.() },
      { label: "VR Mode", icon: "\u{1F97D}", cb: () => this.callbacks.onToggleVR?.() },
      { label: "Debug", icon: "\u{1F527}", cb: () => this.callbacks.onToggleDebug?.() },
    ];

    buttonDefs.forEach((def) => {
      const btn = Button.CreateSimpleButton(`sys_${def.label}`, `${def.icon} ${def.label}`);
      btn.width = "110px";
      btn.height = "28px";
      btn.color = COLORS.textSecondary;
      btn.background = COLORS.cardBg;
      btn.cornerRadius = 4;
      btn.fontSize = 10;
      btn.thickness = 1;
      (btn as any).borderColor = COLORS.cardBorder;
      btn.paddingRight = "4px";

      btn.onPointerEnterObservable.add(() => {
        btn.background = COLORS.tabHover;
        btn.color = COLORS.textPrimary;
      });
      btn.onPointerOutObservable.add(() => {
        btn.background = COLORS.cardBg;
        btn.color = COLORS.textSecondary;
      });

      btn.onPointerClickObservable.add(() => def.cb());
      buttonRow.addControl(btn);
    });

    // Feature Modules section
    if (this.callbacks.onToggleModule) {
      this.addDivider(stack);

      const modulesTitle = new TextBlock();
      modulesTitle.text = "Feature Modules";
      modulesTitle.color = COLORS.textPrimary;
      modulesTitle.fontSize = 15;
      modulesTitle.fontWeight = "bold";
      modulesTitle.height = "29px";
      modulesTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      stack.addControl(modulesTitle);

      const modulesDesc = new TextBlock();
      modulesDesc.text = "Toggle gameplay features on or off for this world.";
      modulesDesc.color = COLORS.textMuted;
      modulesDesc.fontSize = 11;
      modulesDesc.height = "18px";
      modulesDesc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      stack.addControl(modulesDesc);

      const world = this.callbacks.getWorldData?.();
      const enabled = new Set(world?.enabledModules ?? []);

      const MODULE_DEFS: Array<{ id: string; label: string }> = [
        { id: 'knowledge-acquisition', label: 'Knowledge Tracking' },
        { id: 'proficiency', label: 'Proficiency' },
        { id: 'pattern-recognition', label: 'Pattern Recognition' },
        { id: 'gamification', label: 'XP & Levels' },
        { id: 'skill-tree', label: 'Skill Tree' },
        { id: 'adaptive-difficulty', label: 'Adaptive Difficulty' },
        { id: 'assessment', label: 'Assessment' },
        { id: 'npc-exams', label: 'NPC Exams' },
        { id: 'performance-scoring', label: 'Performance Scoring' },
        { id: 'voice', label: 'Voice Interaction' },
        { id: 'world-lore', label: 'World Lore' },
        { id: 'conversation-analytics', label: 'Conversation Analytics' },
        { id: 'onboarding', label: 'Onboarding' },
      ];

      const moduleCard = this.makeCard(stack);
      for (const mod of MODULE_DEFS) {
        const isEnabled = enabled.has(mod.id);
        const row = new Rectangle();
        row.width = 1;
        row.height = "26px";
        row.thickness = 0;
        row.background = "transparent";
        moduleCard.addControl(row);

        const label = new TextBlock();
        label.text = `${isEnabled ? '✓' : '○'} ${mod.label}`;
        label.color = isEnabled ? COLORS.textPrimary : COLORS.textMuted;
        label.fontSize = 11;
        label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        label.left = "8px";
        row.addControl(label);

        row.isPointerBlocker = true;
        row.onPointerClickObservable.add(() => {
          this.callbacks.onToggleModule?.(mod.id, !isEnabled);
          // Re-render system tab to reflect change
          this.renderSystemTab();
        });
        row.onPointerEnterObservable.add(() => { row.background = COLORS.tabHover; });
        row.onPointerOutObservable.add(() => { row.background = "transparent"; });
      }
    }
  }

  private makeSystemButton(name: string, label: string): Button {
    const btn = Button.CreateSimpleButton(name, label);
    btn.color = COLORS.textSecondary;
    btn.background = COLORS.cardBg;
    btn.cornerRadius = 6;
    btn.thickness = 1;
    (btn as any).borderColor = COLORS.cardBorder;
    btn.onPointerEnterObservable.add(() => {
      btn.background = COLORS.tabHover;
      btn.color = COLORS.textPrimary;
    });
    btn.onPointerOutObservable.add(() => {
      btn.background = COLORS.cardBg;
      btn.color = COLORS.textSecondary;
    });
    return btn;
  }

  private refreshSaveSlots(): void {
    if (!this.callbacks.getSaveSlots) {
      this.renderSystemTab();
      return;
    }
    this.callbacks.getSaveSlots().then((slots) => {
      this.saveSlotCache = slots;
      this.refreshActiveTab();
    }).catch(() => {
      this.refreshActiveTab();
    });
  }

  private formatGameTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  private formatSaveDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  private renderSaveLoadView(mode: 'save' | 'load'): void {
    const { stack } = this.makeScrollableContent("saveload");

    // Back button + header
    const headerRow = new Rectangle();
    headerRow.width = 1;
    headerRow.height = "36px";
    headerRow.thickness = 0;
    headerRow.background = "transparent";
    stack.addControl(headerRow);

    const backBtn = Button.CreateSimpleButton("saveload_back", "< Back");
    backBtn.width = "70px";
    backBtn.height = "28px";
    backBtn.color = COLORS.textSecondary;
    backBtn.background = COLORS.cardBg;
    backBtn.cornerRadius = 4;
    backBtn.fontSize = 11;
    backBtn.thickness = 1;
    (backBtn as any).borderColor = COLORS.cardBorder;
    backBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    backBtn.onPointerEnterObservable.add(() => { backBtn.background = COLORS.tabHover; backBtn.color = COLORS.textPrimary; });
    backBtn.onPointerOutObservable.add(() => { backBtn.background = COLORS.cardBg; backBtn.color = COLORS.textSecondary; });
    backBtn.onPointerClickObservable.add(() => {
      this.systemSubView = 'main';
      this.refreshActiveTab();
    });
    headerRow.addControl(backBtn);

    this.addSectionHeader(stack, mode === 'save' ? "Save Game" : "Load Game");
    this.addSubHeader(stack, mode === 'save'
      ? "Choose a slot to save your progress"
      : "Choose a save slot to load");

    // Render 3 slots
    for (let i = 0; i < 3; i++) {
      const slot = this.saveSlotCache[i];
      this.renderSlotCard(stack, i, slot, mode);
    }
  }

  private renderSlotCard(parent: StackPanel, slotIndex: number, slot: SaveSlotInfo | null, mode: 'save' | 'load'): void {
    const card = new Rectangle(`slot_card_${slotIndex}`);
    card.width = 1;
    card.height = "80px";
    card.background = COLORS.cardBg;
    card.color = COLORS.cardBorder;
    card.thickness = 1;
    card.cornerRadius = 6;
    card.paddingBottom = "8px";
    card.isPointerBlocker = true;
    parent.addControl(card);

    const slotLabel = new TextBlock();
    slotLabel.text = `Slot ${slotIndex + 1}${slotIndex === 0 ? ' (Quick Save)' : ''}`;
    slotLabel.color = COLORS.textPrimary;
    slotLabel.fontSize = 14;
    slotLabel.fontWeight = "bold";
    slotLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    slotLabel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    slotLabel.left = "14px";
    slotLabel.top = "12px";
    card.addControl(slotLabel);

    if (slot) {
      const dateText = new TextBlock();
      dateText.text = this.formatSaveDate(slot.savedAt);
      dateText.color = COLORS.textSecondary;
      dateText.fontSize = 11;
      dateText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      dateText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      dateText.left = "14px";
      dateText.top = "34px";
      card.addControl(dateText);

      const timeText = new TextBlock();
      timeText.text = `Play time: ${this.formatGameTime(slot.gameTime)}`;
      timeText.color = COLORS.textMuted;
      timeText.fontSize = 11;
      timeText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      timeText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      timeText.left = "14px";
      timeText.top = "50px";
      card.addControl(timeText);

      if (slot.zoneName) {
        const zoneText = new TextBlock();
        zoneText.text = slot.zoneName;
        zoneText.color = COLORS.textMuted;
        zoneText.fontSize = 11;
        zoneText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        zoneText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        zoneText.left = "-14px";
        zoneText.top = "34px";
        card.addControl(zoneText);
      }
    } else {
      const emptyText = new TextBlock();
      emptyText.text = mode === 'save' ? "Empty slot" : "No save data";
      emptyText.color = COLORS.textMuted;
      emptyText.fontSize = 12;
      emptyText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      emptyText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      emptyText.left = "14px";
      emptyText.top = "36px";
      card.addControl(emptyText);
    }

    // Action button
    const isDisabled = mode === 'load' && !slot;
    const actionBtn = Button.CreateSimpleButton(
      `slot_action_${slotIndex}`,
      mode === 'save' ? (slot ? "Overwrite" : "Save") : "Load"
    );
    actionBtn.width = "80px";
    actionBtn.height = "28px";
    actionBtn.fontSize = 11;
    actionBtn.fontWeight = "bold";
    actionBtn.cornerRadius = 4;
    actionBtn.thickness = 0;
    actionBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    actionBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    actionBtn.left = "-14px";
    actionBtn.top = "-12px";

    if (isDisabled) {
      actionBtn.color = COLORS.textMuted;
      actionBtn.background = COLORS.cardBg;
      actionBtn.isEnabled = false;
    } else {
      actionBtn.color = "#FFFFFF";
      actionBtn.background = mode === 'save' ? COLORS.accent : COLORS.accentGreen;
      const hoverColor = mode === 'save' ? "#5A9CF5" : "#45B864";
      const baseColor = mode === 'save' ? COLORS.accent : COLORS.accentGreen;
      actionBtn.onPointerEnterObservable.add(() => { actionBtn.background = hoverColor; });
      actionBtn.onPointerOutObservable.add(() => { actionBtn.background = baseColor; });
      actionBtn.onPointerClickObservable.add(() => {
        if (this.saveLoadBusy) return;
        // For save with existing data, show overwrite confirmation
        if (mode === 'save' && slot) {
          this.showOverwriteConfirm(slotIndex);
        } else if (mode === 'load' && slot) {
          this.showLoadConfirm(slotIndex);
        } else {
          this.executeSave(slotIndex);
        }
      });
    }
    card.addControl(actionBtn);

    // Hover effects on card
    card.onPointerEnterObservable.add(() => { card.background = COLORS.tabHover; });
    card.onPointerOutObservable.add(() => { card.background = COLORS.cardBg; });
  }

  private showOverwriteConfirm(slotIndex: number): void {
    if (!this.overlay) return;
    const confirmBg = new Rectangle("confirmOverlay");
    confirmBg.width = 1;
    confirmBg.height = 1;
    confirmBg.background = "rgba(0, 0, 0, 0.6)";
    confirmBg.thickness = 0;
    confirmBg.zIndex = 200;
    this.overlay.addControl(confirmBg);

    const dialog = new Rectangle("confirmDialog");
    dialog.width = "340px";
    dialog.height = "140px";
    dialog.background = COLORS.sidebarBg;
    dialog.color = COLORS.cardBorder;
    dialog.thickness = 1;
    dialog.cornerRadius = 10;
    confirmBg.addControl(dialog);

    const msg = new TextBlock();
    msg.text = `Overwrite Slot ${slotIndex + 1}?`;
    msg.color = COLORS.textPrimary;
    msg.fontSize = 15;
    msg.fontWeight = "bold";
    msg.top = "-20px";
    dialog.addControl(msg);

    const sub = new TextBlock();
    sub.text = "This will replace the existing save.";
    sub.color = COLORS.textSecondary;
    sub.fontSize = 11;
    sub.top = "8px";
    dialog.addControl(sub);

    const btnRow = new StackPanel();
    btnRow.isVertical = false;
    btnRow.width = "220px";
    btnRow.height = "34px";
    btnRow.top = "38px";
    dialog.addControl(btnRow);

    const cancelBtn = Button.CreateSimpleButton("confirmCancel", "Cancel");
    cancelBtn.width = "100px";
    cancelBtn.height = "30px";
    cancelBtn.fontSize = 12;
    cancelBtn.color = COLORS.textSecondary;
    cancelBtn.background = COLORS.cardBg;
    cancelBtn.cornerRadius = 4;
    cancelBtn.thickness = 0;
    cancelBtn.paddingRight = "8px";
    cancelBtn.onPointerClickObservable.add(() => { this.overlay?.removeControl(confirmBg); });
    btnRow.addControl(cancelBtn);

    const okBtn = Button.CreateSimpleButton("confirmOk", "Overwrite");
    okBtn.width = "100px";
    okBtn.height = "30px";
    okBtn.fontSize = 12;
    okBtn.color = "#FFFFFF";
    okBtn.background = COLORS.accentRed;
    okBtn.cornerRadius = 4;
    okBtn.thickness = 0;
    okBtn.onPointerClickObservable.add(() => {
      this.overlay?.removeControl(confirmBg);
      this.executeSave(slotIndex);
    });
    btnRow.addControl(okBtn);
  }

  private showLoadConfirm(slotIndex: number): void {
    if (!this.overlay) return;
    const confirmBg = new Rectangle("loadConfirmOverlay");
    confirmBg.width = 1;
    confirmBg.height = 1;
    confirmBg.background = "rgba(0, 0, 0, 0.6)";
    confirmBg.thickness = 0;
    confirmBg.zIndex = 200;
    this.overlay.addControl(confirmBg);

    const dialog = new Rectangle("loadConfirmDialog");
    dialog.width = "340px";
    dialog.height = "140px";
    dialog.background = COLORS.sidebarBg;
    dialog.color = COLORS.cardBorder;
    dialog.thickness = 1;
    dialog.cornerRadius = 10;
    confirmBg.addControl(dialog);

    const msg = new TextBlock();
    msg.text = `Load Slot ${slotIndex + 1}?`;
    msg.color = COLORS.textPrimary;
    msg.fontSize = 15;
    msg.fontWeight = "bold";
    msg.top = "-20px";
    dialog.addControl(msg);

    const sub = new TextBlock();
    sub.text = "Any unsaved progress will be lost.";
    sub.color = COLORS.textSecondary;
    sub.fontSize = 11;
    sub.top = "8px";
    dialog.addControl(sub);

    const btnRow = new StackPanel();
    btnRow.isVertical = false;
    btnRow.width = "220px";
    btnRow.height = "34px";
    btnRow.top = "38px";
    dialog.addControl(btnRow);

    const cancelBtn = Button.CreateSimpleButton("loadCancel", "Cancel");
    cancelBtn.width = "100px";
    cancelBtn.height = "30px";
    cancelBtn.fontSize = 12;
    cancelBtn.color = COLORS.textSecondary;
    cancelBtn.background = COLORS.cardBg;
    cancelBtn.cornerRadius = 4;
    cancelBtn.thickness = 0;
    cancelBtn.paddingRight = "8px";
    cancelBtn.onPointerClickObservable.add(() => { this.overlay?.removeControl(confirmBg); });
    btnRow.addControl(cancelBtn);

    const okBtn = Button.CreateSimpleButton("loadOk", "Load");
    okBtn.width = "100px";
    okBtn.height = "30px";
    okBtn.fontSize = 12;
    okBtn.color = "#FFFFFF";
    okBtn.background = COLORS.accentGreen;
    okBtn.cornerRadius = 4;
    okBtn.thickness = 0;
    okBtn.onPointerClickObservable.add(() => {
      this.overlay?.removeControl(confirmBg);
      this.executeLoad(slotIndex);
    });
    btnRow.addControl(okBtn);
  }

  private async executeSave(slotIndex: number): Promise<void> {
    if (this.saveLoadBusy || !this.callbacks.onSaveGame) return;
    this.saveLoadBusy = true;
    this.showSaveLoadOverlay("Saving...");
    try {
      await this.callbacks.onSaveGame(slotIndex);
      this.showSaveLoadOverlay("Saved!");
      setTimeout(() => {
        this.removeSaveLoadOverlay();
        this.saveLoadBusy = false;
        this.refreshSaveSlots();
      }, 800);
    } catch {
      this.showSaveLoadOverlay("Save failed");
      setTimeout(() => {
        this.removeSaveLoadOverlay();
        this.saveLoadBusy = false;
      }, 1500);
    }
  }

  private async executeLoad(slotIndex: number): Promise<void> {
    if (this.saveLoadBusy || !this.callbacks.onLoadGame) return;
    this.saveLoadBusy = true;
    this.showSaveLoadOverlay("Loading...");
    try {
      const success = await this.callbacks.onLoadGame(slotIndex);
      if (success) {
        this.showSaveLoadOverlay("Loaded!");
        setTimeout(() => {
          this.removeSaveLoadOverlay();
          this.saveLoadBusy = false;
          this.close();
        }, 800);
      } else {
        this.showSaveLoadOverlay("No save data");
        setTimeout(() => {
          this.removeSaveLoadOverlay();
          this.saveLoadBusy = false;
        }, 1500);
      }
    } catch {
      this.showSaveLoadOverlay("Load failed");
      setTimeout(() => {
        this.removeSaveLoadOverlay();
        this.saveLoadBusy = false;
      }, 1500);
    }
  }

  private saveLoadOverlayRect: Rectangle | null = null;

  private showSaveLoadOverlay(text: string): void {
    this.removeSaveLoadOverlay();
    const rect = new Rectangle("saveLoadOverlay");
    rect.width = "200px";
    rect.height = "60px";
    rect.background = "rgba(0, 0, 0, 0.85)";
    rect.cornerRadius = 10;
    rect.thickness = 0;
    rect.zIndex = 300;
    this.advancedTexture.addControl(rect);

    const txt = new TextBlock();
    txt.text = text;
    txt.color = COLORS.textPrimary;
    txt.fontSize = 16;
    txt.fontWeight = "bold";
    rect.addControl(txt);

    this.saveLoadOverlayRect = rect;
  }

  private removeSaveLoadOverlay(): void {
    if (this.saveLoadOverlayRect) {
      this.advancedTexture.removeControl(this.saveLoadOverlayRect);
      this.saveLoadOverlayRect.dispose();
      this.saveLoadOverlayRect = null;
    }
  }

  /** Quick-save to slot 0. Can be called externally (e.g. from F5 key). */
  public quickSave(): void {
    this.executeSave(0);
  }

  /** Quick-load from slot 0. Can be called externally (e.g. from F9 key). */
  public quickLoad(): void {
    this.executeLoad(0);
  }

  // ── VOCABULARY TAB ──────────────────────────────────────────────────────

  private renderVocabularyTab(): void {
    const { stack } = this.makeScrollableContent("vocab");
    const data = this.callbacks.getVocabularyData?.();

    this.addSectionHeader(stack, "Language Progress");

    // ── Sub-tab buttons (Vocabulary / Grammar) ──
    const subTabRow = new Rectangle();
    subTabRow.width = 1;
    subTabRow.height = "30px";
    subTabRow.thickness = 0;
    subTabRow.background = "transparent";
    stack.addControl(subTabRow);

    const vocSubBtn = Button.CreateSimpleButton("vocSubTab_vocab", "Vocabulary");
    vocSubBtn.width = "116px";
    vocSubBtn.height = "24px";
    vocSubBtn.fontSize = 12;
    vocSubBtn.fontWeight = "bold";
    vocSubBtn.color = COLORS.textPrimary;
    vocSubBtn.cornerRadius = 5;
    vocSubBtn.background = this.vocabSubTab === 'vocabulary' ? COLORS.tabActive : COLORS.cardBg;
    vocSubBtn.thickness = 1;
    (vocSubBtn as any).borderColor = this.vocabSubTab === 'vocabulary' ? COLORS.tabActiveBorder : COLORS.cardBorder;
    vocSubBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    vocSubBtn.left = "5px";
    vocSubBtn.onPointerClickObservable.add(() => {
      this.vocabSubTab = 'vocabulary';
      this.refreshActiveTab();
    });
    subTabRow.addControl(vocSubBtn);

    const gramSubBtn = Button.CreateSimpleButton("vocSubTab_gram", "Grammar");
    gramSubBtn.width = "116px";
    gramSubBtn.height = "24px";
    gramSubBtn.fontSize = 12;
    gramSubBtn.fontWeight = "bold";
    gramSubBtn.color = COLORS.textPrimary;
    gramSubBtn.cornerRadius = 5;
    gramSubBtn.background = this.vocabSubTab === 'grammar' ? COLORS.tabActive : COLORS.cardBg;
    gramSubBtn.thickness = 1;
    (gramSubBtn as any).borderColor = this.vocabSubTab === 'grammar' ? COLORS.tabActiveBorder : COLORS.cardBorder;
    gramSubBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    gramSubBtn.left = "126px";
    gramSubBtn.onPointerClickObservable.add(() => {
      this.vocabSubTab = 'grammar';
      this.refreshActiveTab();
    });
    subTabRow.addControl(gramSubBtn);

    if (!data || (data.vocabulary.length === 0 && data.grammarPatterns.length === 0)) {
      const noData = new TextBlock();
      noData.text = "No vocabulary learned yet.\nTalk to NPCs to learn new words!";
      noData.color = COLORS.textMuted;
      noData.fontSize = 12;
      noData.height = "50px";
      noData.textWrapping = true;
      stack.addControl(noData);
      return;
    }

    // Stats summary (always visible)
    const mastered = data.vocabulary.filter(v => v.masteryLevel === 'mastered').length;
    const totalAttempts = data.totalCorrectUsages +
      data.vocabulary.reduce((sum, v) => sum + v.timesUsedIncorrectly, 0);
    const accuracy = totalAttempts > 0 ? Math.round((data.totalCorrectUsages / totalAttempts) * 100) : 0;

    const statsCard = this.makeCard(stack);
    this.addStatRow(statsCard, "Words Learned", `${data.vocabulary.length}`);
    this.addStatRow(statsCard, "Words Mastered", `${mastered}`, COLORS.gold);
    this.addStatRow(statsCard, "Accuracy", `${accuracy}%`, accuracy >= 80 ? COLORS.accentGreen : COLORS.accentYellow);
    this.addStatRow(statsCard, "Fluency", `${Math.round(data.overallFluency)}%`, COLORS.accent);
    this.addProgressBar(statsCard, data.overallFluency, 100, COLORS.accent, `${Math.round(data.overallFluency)}% fluency`);

    // ── Per-category mastery breakdown bars ──
    const categoryMap = new Map<string, { total: number; mastered: number; familiar: number; learning: number }>();
    for (const v of data.vocabulary) {
      const cat = v.category || 'general';
      if (!categoryMap.has(cat)) categoryMap.set(cat, { total: 0, mastered: 0, familiar: 0, learning: 0 });
      const entry = categoryMap.get(cat)!;
      entry.total++;
      if (v.masteryLevel === 'mastered') entry.mastered++;
      else if (v.masteryLevel === 'familiar') entry.familiar++;
      else if (v.masteryLevel === 'learning') entry.learning++;
    }
    if (categoryMap.size > 1) {
      this.addDivider(stack);
      const breakdownTitle = new TextBlock();
      breakdownTitle.text = "Category Mastery";
      breakdownTitle.color = COLORS.textPrimary;
      breakdownTitle.fontSize = 14;
      breakdownTitle.fontWeight = "bold";
      breakdownTitle.height = "24px";
      breakdownTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      stack.addControl(breakdownTitle);

      const sortedCats = Array.from(categoryMap.entries())
        .sort((a, b) => b[1].total - a[1].total);
      for (const [cat, counts] of sortedCats) {
        const label = cat.charAt(0).toUpperCase() + cat.slice(1);
        const pct = counts.total > 0 ? Math.round(((counts.mastered + counts.familiar) / counts.total) * 100) : 0;
        const color = pct >= 80 ? COLORS.accentGreen : pct >= 50 ? COLORS.accentYellow : COLORS.accentRed;
        const catCard = this.makeCard(stack);
        this.addStatRow(catCard, label, `${counts.mastered + counts.familiar}/${counts.total} known (${pct}%)`, color);
        this.addProgressBar(catCard, counts.mastered + counts.familiar, counts.total, color);
      }
    }

    if (this.vocabSubTab === 'vocabulary') {
      this.renderVocabularySubTab(stack, data);
    } else {
      this.renderGrammarSubTab(stack, data);
    }
  }

  private renderVocabularySubTab(stack: StackPanel, data: NonNullable<ReturnType<NonNullable<GameMenuCallbacks['getVocabularyData']>>>): void {
    const CATEGORIES = [
      'all', 'greetings', 'numbers', 'food', 'family', 'nature',
      'body', 'emotions', 'actions', 'colors', 'time', 'general',
    ];

    // ── Category filter row ──
    this.addDivider(stack);
    const filterLabel = new TextBlock();
    filterLabel.text = "Category";
    filterLabel.color = COLORS.textSecondary;
    filterLabel.fontSize = 12;
    filterLabel.height = "17px";
    filterLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(filterLabel);

    // Two rows of category buttons (6 per row to fit)
    for (let rowIdx = 0; rowIdx < 2; rowIdx++) {
      const catRow = new Rectangle();
      catRow.width = 1;
      catRow.height = "24px";
      catRow.thickness = 0;
      catRow.background = "transparent";
      stack.addControl(catRow);

      const rowCats = CATEGORIES.slice(rowIdx * 6, (rowIdx + 1) * 6);
      let xOff = 4;
      for (const cat of rowCats) {
        const label = cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1);
        const isActive = this.vocabCategoryFilter === cat;
        const btn = Button.CreateSimpleButton(`catBtn_${cat}`, label);
        const btnWidth = Math.max(24, label.length * 5 + 8);
        btn.width = `${btnWidth}px`;
        btn.height = "21px";
        btn.fontSize = 12;
        btn.color = COLORS.textPrimary;
        btn.cornerRadius = 3;
        btn.thickness = 1;
        (btn as any).borderColor = isActive ? COLORS.tabActiveBorder : COLORS.cardBorder;
        btn.background = isActive ? COLORS.tabActive : COLORS.cardBg;
        btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        btn.left = `${xOff}px`;
        btn.onPointerClickObservable.add(() => {
          this.vocabCategoryFilter = cat;
          this.refreshActiveTab();
        });
        catRow.addControl(btn);
        xOff += btnWidth + 4;
      }
    }

    // ── Sort row ──
    const sortRow = new Rectangle();
    sortRow.width = 1;
    sortRow.height = "24px";
    sortRow.thickness = 0;
    sortRow.background = "transparent";
    stack.addControl(sortRow);

    const sortLabel = new TextBlock();
    sortLabel.text = "Sort:";
    sortLabel.fontSize = 12;
    sortLabel.color = COLORS.textSecondary;
    sortLabel.width = "24px";
    sortLabel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    sortLabel.left = "5px";
    sortRow.addControl(sortLabel);

    const sortOptions: { key: 'mastery' | 'alpha' | 'recent' | 'used' | 'review'; label: string }[] = [
      { key: 'mastery', label: 'Mastery' },
      { key: 'alpha', label: 'A-Z' },
      { key: 'recent', label: 'Recent' },
      { key: 'used', label: 'Most Used' },
      { key: 'review', label: 'Due' },
    ];

    let sortX = 38;
    for (const opt of sortOptions) {
      const isActive = this.vocabSortMode === opt.key;
      const btn = Button.CreateSimpleButton(`sortBtn_${opt.key}`, opt.label);
      const btnW = opt.label.length * 5 + 9;
      btn.width = `${btnW}px`;
      btn.height = "20px";
      btn.fontSize = 12;
      btn.color = COLORS.textPrimary;
      btn.cornerRadius = 3;
      btn.thickness = 1;
      (btn as any).borderColor = isActive ? COLORS.tabActiveBorder : COLORS.cardBorder;
      btn.background = isActive ? COLORS.tabActive : COLORS.cardBg;
      btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      btn.left = `${sortX}px`;
      btn.onPointerClickObservable.add(() => {
        this.vocabSortMode = opt.key;
        this.refreshActiveTab();
      });
      sortRow.addControl(btn);
      sortX += btnW + 4;
    }

    // ── Due for review ──
    const dueSet = new Set((data.dueForReview || []).map(v => v.word));
    if (data.dueForReview.length > 0) {
      this.addDivider(stack);
      const reviewTitle = new TextBlock();
      reviewTitle.text = `Due for Review (${data.dueForReview.length})`;
      reviewTitle.color = COLORS.accentYellow;
      reviewTitle.fontSize = 14;
      reviewTitle.fontWeight = "bold";
      reviewTitle.height = "24px";
      reviewTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      stack.addControl(reviewTitle);

      for (const word of data.dueForReview.slice(0, 10)) {
        const card = this.makeCard(stack);
        this.addStatRow(card, word.word, word.meaning, COLORS.accentYellow);
      }
    }

    // ── Apply filter and sort ──
    let filtered = [...data.vocabulary];
    if (this.vocabCategoryFilter !== 'all') {
      filtered = filtered.filter(v => (v.category || 'general') === this.vocabCategoryFilter);
    }

    const masteryOrder: Record<string, number> = { mastered: 0, familiar: 1, learning: 2, new: 3 };
    switch (this.vocabSortMode) {
      case 'mastery':
        filtered.sort((a, b) => masteryOrder[a.masteryLevel] - masteryOrder[b.masteryLevel]);
        break;
      case 'alpha':
        filtered.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case 'recent':
        filtered.sort((a, b) => b.lastEncountered - a.lastEncountered);
        break;
      case 'used':
        filtered.sort((a, b) => (b.timesUsedCorrectly + b.timesEncountered) - (a.timesUsedCorrectly + a.timesEncountered));
        break;
      case 'review':
        filtered.sort((a, b) => {
          const aDue = dueSet.has(a.word) ? 0 : 1;
          const bDue = dueSet.has(b.word) ? 0 : 1;
          if (aDue !== bDue) return aDue - bDue;
          return a.lastEncountered - b.lastEncountered;
        });
        break;
    }

    // ── Word list ──
    this.addDivider(stack);
    const vocabTitle = new TextBlock();
    vocabTitle.text = this.vocabCategoryFilter === 'all'
      ? `All Words (${filtered.length})`
      : `${this.vocabCategoryFilter.charAt(0).toUpperCase() + this.vocabCategoryFilter.slice(1)} (${filtered.length})`;
    vocabTitle.color = COLORS.textPrimary;
    vocabTitle.fontSize = 15;
    vocabTitle.fontWeight = "bold";
    vocabTitle.height = "29px";
    vocabTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(vocabTitle);

    if (filtered.length === 0) {
      const emptyText = new TextBlock();
      emptyText.text = data.vocabulary.length === 0
        ? "No vocabulary learned yet.\nTalk to NPCs to learn new words!"
        : "No words in this category.";
      emptyText.color = COLORS.textMuted;
      emptyText.fontSize = 12;
      emptyText.height = "42px";
      emptyText.textWrapping = true;
      stack.addControl(emptyText);
      return;
    }

    // Header row
    const headerRow = new Rectangle();
    headerRow.width = 1;
    headerRow.height = "21px";
    headerRow.thickness = 0;
    headerRow.background = COLORS.headerBg;
    headerRow.cornerRadius = 3;
    stack.addControl(headerRow);

    const hWord = new TextBlock();
    hWord.text = "WORD";
    hWord.color = COLORS.textMuted;
    hWord.fontSize = 12;
    hWord.fontWeight = "bold";
    hWord.width = "28%";
    hWord.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hWord.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hWord.paddingLeft = "5px";
    headerRow.addControl(hWord);

    const hMeaning = new TextBlock();
    hMeaning.text = "MEANING";
    hMeaning.color = COLORS.textMuted;
    hMeaning.fontSize = 12;
    hMeaning.fontWeight = "bold";
    hMeaning.width = "30%";
    hMeaning.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hMeaning.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hMeaning.left = "28%";
    headerRow.addControl(hMeaning);

    const hMastery = new TextBlock();
    hMastery.text = "MASTERY";
    hMastery.color = COLORS.textMuted;
    hMastery.fontSize = 12;
    hMastery.fontWeight = "bold";
    hMastery.width = "16%";
    hMastery.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hMastery.left = "58%";
    headerRow.addControl(hMastery);

    const hUsed = new TextBlock();
    hUsed.text = "USED";
    hUsed.color = COLORS.textMuted;
    hUsed.fontSize = 12;
    hUsed.fontWeight = "bold";
    hUsed.width = "10%";
    hUsed.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    hUsed.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    hUsed.left = "-45px";
    headerRow.addControl(hUsed);

    const masteryColors: Record<string, string> = { mastered: '#f1c40f', familiar: '#2ecc71', learning: '#f39c12', new: '#e74c3c' };
    const masteryLabels: Record<string, string> = { new: 'New', learning: 'Learning', familiar: 'Familiar', mastered: 'Mastered' };

    for (const entry of filtered) {
      const isDue = dueSet.has(entry.word);
      const row = new Rectangle();
      row.width = 1;
      row.height = "27px";
      row.thickness = 0;
      row.background = isDue ? "rgba(251, 188, 4, 0.06)" : "transparent";
      row.paddingBottom = "2px";
      stack.addControl(row);

      const wordText = new TextBlock();
      wordText.text = entry.word;
      wordText.color = COLORS.textPrimary;
      wordText.fontSize = 12;
      wordText.fontWeight = "bold";
      wordText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      wordText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      wordText.paddingLeft = "5px";
      wordText.width = "28%";
      row.addControl(wordText);

      const meaningText = new TextBlock();
      meaningText.text = entry.meaning;
      meaningText.color = COLORS.textSecondary;
      meaningText.fontSize = 12;
      meaningText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      meaningText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      meaningText.left = "28%";
      meaningText.width = "30%";
      row.addControl(meaningText);

      const masteryText = new TextBlock();
      masteryText.text = isDue ? 'Review!' : (masteryLabels[entry.masteryLevel] || entry.masteryLevel);
      masteryText.color = isDue ? COLORS.accentYellow : (masteryColors[entry.masteryLevel] || COLORS.textMuted);
      masteryText.fontSize = 12;
      masteryText.fontWeight = "bold";
      masteryText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      masteryText.left = "58%";
      masteryText.width = "16%";
      row.addControl(masteryText);

      const usedText = new TextBlock();
      usedText.text = `${entry.timesUsedCorrectly}/${entry.timesEncountered}`;
      usedText.color = COLORS.textMuted;
      usedText.fontSize = 12;
      usedText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      usedText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      usedText.left = "-45px";
      usedText.width = "10%";
      row.addControl(usedText);

      // TTS speaker button
      const speakBtn = Button.CreateSimpleButton(`speak_${entry.word}`, "\u{1F50A}");
      speakBtn.width = "21px";
      speakBtn.height = "21px";
      speakBtn.fontSize = 12;
      speakBtn.color = COLORS.accent;
      speakBtn.background = "transparent";
      speakBtn.thickness = 0;
      speakBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      speakBtn.left = "-3px";
      speakBtn.onPointerClickObservable.add(() => {
        this.callbacks.onVocabWordSpeak?.(entry.word);
      });
      speakBtn.onPointerEnterObservable.add(() => { speakBtn.color = COLORS.accentGreen; });
      speakBtn.onPointerOutObservable.add(() => { speakBtn.color = COLORS.accent; });
      row.addControl(speakBtn);
    }
  }

  private renderGrammarSubTab(stack: StackPanel, data: NonNullable<ReturnType<NonNullable<GameMenuCallbacks['getVocabularyData']>>>): void {
    this.addDivider(stack);
    const gramTitle = new TextBlock();
    gramTitle.text = `Grammar Patterns (${data.grammarPatterns.length})`;
    gramTitle.color = COLORS.textPrimary;
    gramTitle.fontSize = 15;
    gramTitle.fontWeight = "bold";
    gramTitle.height = "29px";
    gramTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(gramTitle);

    if (data.grammarPatterns.length === 0) {
      const emptyText = new TextBlock();
      emptyText.text = "No grammar patterns tracked yet.\nConverse with NPCs to practice grammar!";
      emptyText.color = COLORS.textMuted;
      emptyText.fontSize = 12;
      emptyText.height = "42px";
      emptyText.textWrapping = true;
      stack.addControl(emptyText);
      return;
    }

    // Sort: weak patterns first, then by total usage
    const sorted = [...data.grammarPatterns].sort((a, b) => {
      const aWeak = !a.mastered && a.timesUsedIncorrectly > 0;
      const bWeak = !b.mastered && b.timesUsedIncorrectly > 0;
      if (aWeak && !bWeak) return -1;
      if (!aWeak && bWeak) return 1;
      return (b.timesUsedCorrectly + b.timesUsedIncorrectly) - (a.timesUsedCorrectly + a.timesUsedIncorrectly);
    });

    for (const pattern of sorted) {
      const total = pattern.timesUsedCorrectly + pattern.timesUsedIncorrectly;
      const acc = total > 0 ? Math.round((pattern.timesUsedCorrectly / total) * 100) : 0;
      const isWeak = !pattern.mastered && pattern.timesUsedIncorrectly > 0;

      const card = this.makeCard(stack);

      // Pattern name row with status badge
      const nameRow = new Rectangle();
      nameRow.width = 1;
      nameRow.height = "20px";
      nameRow.thickness = 0;
      card.addControl(nameRow);

      const nameText = new TextBlock();
      nameText.text = pattern.pattern;
      nameText.color = COLORS.textPrimary;
      nameText.fontSize = 12;
      nameText.fontWeight = "bold";
      nameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      nameRow.addControl(nameText);

      const badgeText = new TextBlock();
      badgeText.text = pattern.mastered ? "Mastered" : (isWeak ? "Practice this!" : "Learning");
      badgeText.color = pattern.mastered ? COLORS.gold : (isWeak ? COLORS.accentRed : COLORS.textMuted);
      badgeText.fontSize = 12;
      badgeText.fontWeight = "bold";
      badgeText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      nameRow.addControl(badgeText);

      // Accuracy
      this.addStatRow(card, "Accuracy", `${acc}% (${pattern.timesUsedCorrectly}/${total})`,
        pattern.mastered ? COLORS.gold : (acc >= 80 ? COLORS.accentGreen : (acc >= 50 ? COLORS.accentYellow : COLORS.accentRed)));
      this.addProgressBar(card, acc, 100, acc >= 80 ? COLORS.accentGreen : (acc >= 50 ? COLORS.accentYellow : COLORS.accentRed));

      // Example correction (most recent)
      if (pattern.examples && pattern.examples.length > 0) {
        const exText = new TextBlock();
        exText.text = `Example: "${pattern.examples[pattern.examples.length - 1]}"`;
        exText.color = COLORS.textMuted;
        exText.fontSize = 12;
        exText.fontStyle = "italic";
        exText.height = "17px";
        exText.textWrapping = true;
        exText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(exText);
      }

      // Pattern explanation (most recent)
      if (pattern.explanations && pattern.explanations.length > 0) {
        const explainText = new TextBlock();
        explainText.text = `Rule: ${pattern.explanations[pattern.explanations.length - 1]}`;
        explainText.color = COLORS.textSecondary;
        explainText.fontSize = 12;
        explainText.height = "17px";
        explainText.textWrapping = true;
        explainText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(explainText);
      }
    }
  }

  // ── CONVERSATIONS TAB ───────────────────────────────────────────────────

  // ── SKILL TREE TAB ──────────────────────────────────────────────────────

  private renderSkillsTab(): void {
    const { stack } = this.makeScrollableContent("skills");
    const stats = this.callbacks.getSkillTreeStats?.();

    this.addSectionHeader(stack, "Skill Tree");

    if (stats) {
      updateSkillProgress(this.skillTreeState, stats);
    }

    const unlocked = this.skillTreeState.nodes.filter(n => n.unlocked).length;
    const total = this.skillTreeState.nodes.length;
    this.addSubHeader(stack, `${unlocked}/${total} skills unlocked`);

    for (const tierDef of SKILL_TIERS) {
      const tierNodes = this.skillTreeState.nodes.filter(n => n.tier === tierDef.tier);
      const unlockedCount = tierNodes.filter(n => n.unlocked).length;
      const allUnlocked = unlockedCount === tierNodes.length;

      // Tier header card
      const tierCard = this.makeCard(stack);

      const tierHeader = new Rectangle();
      tierHeader.width = 1;
      tierHeader.height = "20px";
      tierHeader.thickness = 0;
      tierCard.addControl(tierHeader);

      const tierTitle = new TextBlock();
      tierTitle.text = `Tier ${tierDef.tier}: ${tierDef.name}  (${tierDef.range[0]}-${tierDef.range[1]}% fluency)`;
      tierTitle.color = allUnlocked ? tierDef.color : COLORS.textSecondary;
      tierTitle.fontSize = 12;
      tierTitle.fontWeight = "bold";
      tierTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      tierHeader.addControl(tierTitle);

      const tierBadge = new TextBlock();
      tierBadge.text = `${unlockedCount}/${tierNodes.length}`;
      tierBadge.color = allUnlocked ? COLORS.accentGreen : COLORS.textMuted;
      tierBadge.fontSize = 12;
      tierBadge.fontWeight = "bold";
      tierBadge.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      tierHeader.addControl(tierBadge);

      // Individual skill nodes
      for (const node of tierNodes) {
        const nodeRow = new Rectangle();
        nodeRow.width = 1;
        nodeRow.height = "33px";
        nodeRow.thickness = 0;
        nodeRow.background = node.unlocked
          ? `rgba(${this.hexToRgb(tierDef.color)}, 0.1)`
          : "transparent";
        nodeRow.cornerRadius = 3;
        tierCard.addControl(nodeRow);

        const icon = new TextBlock();
        icon.text = node.icon;
        icon.fontSize = 15;
        icon.width = "24px";
        icon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        icon.left = "5px";
        nodeRow.addControl(icon);

        const nodeName = new TextBlock();
        nodeName.text = node.name;
        nodeName.color = node.unlocked ? COLORS.textPrimary : COLORS.textMuted;
        nodeName.fontSize = 12;
        nodeName.fontWeight = "bold";
        nodeName.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        nodeName.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        nodeName.left = "30px";
        nodeName.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        nodeName.top = "5px";
        nodeName.height = "15px";
        nodeRow.addControl(nodeName);

        const nodeDesc = new TextBlock();
        nodeDesc.text = node.description;
        nodeDesc.color = node.unlocked ? COLORS.textSecondary : COLORS.textMuted;
        nodeDesc.fontSize = 12;
        nodeDesc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        nodeDesc.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        nodeDesc.left = "30px";
        nodeDesc.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        nodeDesc.top = "18px";
        nodeDesc.height = "12px";
        nodeRow.addControl(nodeDesc);

        if (node.unlocked) {
          const check = new TextBlock();
          check.text = "✓";
          check.fontSize = 14;
          check.fontWeight = "bold";
          check.color = COLORS.accentGreen;
          check.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
          check.left = "-12px";
          check.width = "20px";
          nodeRow.addControl(check);
        } else {
          const pctText = new TextBlock();
          pctText.text = `${Math.round(node.progress * 100)}%`;
          pctText.fontSize = 12;
          pctText.color = COLORS.textMuted;
          pctText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
          pctText.left = "-12px";
          pctText.width = "30px";
          nodeRow.addControl(pctText);
        }
      }
    }
  }

  private hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  // ── NOTICE BOARD TAB ────────────────────────────────────────────────────

  private renderNoticesTab(): void {
    const { stack } = this.makeScrollableContent("notices");
    const noticeData = this.callbacks.getNoticeArticles?.();

    this.addSectionHeader(stack, "Library");
    this.addSubHeader(stack, "Collected readings from notice boards and documents found in the world");

    if (!noticeData || noticeData.articles.length === 0) {
      const noData = new TextBlock();
      noData.text = "No readings collected yet. Find notice boards in settlements or documents in the world to start your collection!";
      noData.color = COLORS.textMuted;
      noData.fontSize = 12;
      noData.height = "50px";
      noData.textWrapping = TextWrapping.WordWrap;
      stack.addControl(noData);
      return;
    }

    // Stats header
    const statsText = new TextBlock();
    const totalArticles = noticeData.articles.length;
    const stories = noticeData.articles.filter((a: any) => a.documentType === 'story' || a.documentType === 'poem').length;
    const notices = totalArticles - stories;
    statsText.text = `${totalArticles} collected: ${notices} notices, ${stories} stories/poems`;
    statsText.color = COLORS.textMuted;
    statsText.fontSize = 11;
    statsText.height = "20px";
    statsText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(statsText);

    // Toggle translations button
    const toggleBtn = Button.CreateSimpleButton("noticeToggleTrans", this.noticeShowTranslations ? "Hide Translations" : "Show Translations");
    toggleBtn.width = "149px";
    toggleBtn.height = "27px";
    toggleBtn.color = COLORS.textPrimary;
    toggleBtn.background = COLORS.cardBg;
    toggleBtn.cornerRadius = 5;
    toggleBtn.fontSize = 12;
    toggleBtn.thickness = 1;
    (toggleBtn as any).borderColor = COLORS.cardBorder;
    toggleBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    toggleBtn.paddingBottom = "6px";
    toggleBtn.onPointerClickObservable.add(() => {
      this.noticeShowTranslations = !this.noticeShowTranslations;
      this.refreshActiveTab();
    });
    stack.addControl(toggleBtn);

    // Filter articles by fluency
    const articles = noticeData.articles.filter(a => {
      if (a.difficulty === 'beginner') return true;
      if (a.difficulty === 'intermediate') return noticeData.playerFluency >= 25;
      if (a.difficulty === 'advanced') return noticeData.playerFluency >= 55;
      return true;
    });

    for (const article of articles) {
      const diffColor = article.difficulty === 'beginner' ? COLORS.accentGreen
        : (article.difficulty === 'intermediate' ? COLORS.accentYellow : COLORS.accentRed);

      const card = this.makeCard(stack);

      // Title row
      const titleRow = new Rectangle();
      titleRow.width = 1;
      titleRow.height = "20px";
      titleRow.thickness = 0;
      card.addControl(titleRow);

      const titleText = new TextBlock();
      titleText.text = article.title;
      titleText.color = COLORS.textPrimary;
      titleText.fontSize = 12;
      titleText.fontWeight = "bold";
      titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      titleRow.addControl(titleText);

      const diffText = new TextBlock();
      diffText.text = article.difficulty;
      diffText.color = diffColor;
      diffText.fontSize = 12;
      diffText.fontWeight = "bold";
      diffText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      titleRow.addControl(diffText);

      // Title translation
      if (this.noticeShowTranslations) {
        const titleTrans = new TextBlock();
        titleTrans.text = `(${article.titleTranslation})`;
        titleTrans.color = COLORS.textMuted;
        titleTrans.fontSize = 12;
        titleTrans.fontStyle = "italic";
        titleTrans.height = "15px";
        titleTrans.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(titleTrans);
      }

      // Body
      const bodyText = new TextBlock();
      bodyText.text = article.body;
      bodyText.color = COLORS.textSecondary;
      bodyText.fontSize = 12;
      bodyText.textWrapping = true;
      bodyText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      bodyText.resizeToFit = true;
      bodyText.paddingTop = "5px";
      bodyText.paddingBottom = "5px";
      card.addControl(bodyText);

      // Body translation
      if (this.noticeShowTranslations) {
        const bodyTrans = new TextBlock();
        bodyTrans.text = article.bodyTranslation;
        bodyTrans.color = COLORS.textMuted;
        bodyTrans.fontSize = 12;
        bodyTrans.fontStyle = "italic";
        bodyTrans.textWrapping = true;
        bodyTrans.resizeToFit = true;
        bodyTrans.paddingBottom = "5px";
        bodyTrans.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(bodyTrans);
      }

      // Vocabulary words
      if (article.vocabularyWords.length > 0) {
        const vocabText = new TextBlock();
        vocabText.text = "Vocab: " + article.vocabularyWords.map(w => `${w.word} (${w.meaning})`).join(", ");
        vocabText.color = COLORS.accent;
        vocabText.fontSize = 12;
        vocabText.textWrapping = true;
        vocabText.resizeToFit = true;
        vocabText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(vocabText);
      }

      // Comprehension question
      const hasQuestion = article.comprehensionQuestion && !this.answeredNoticeQuestions.has(article.id);
      if (hasQuestion && article.comprehensionQuestion) {
        const q = article.comprehensionQuestion;

        const spacer = new Rectangle();
        spacer.width = 1;
        spacer.height = "6px";
        spacer.thickness = 0;
        spacer.background = "transparent";
        card.addControl(spacer);

        const qText = new TextBlock();
        qText.text = this.noticeShowTranslations ? `${q.question} (${q.questionTranslation})` : q.question;
        qText.color = COLORS.textPrimary;
        qText.fontSize = 12;
        qText.fontWeight = "bold";
        qText.textWrapping = true;
        qText.resizeToFit = true;
        qText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(qText);

        for (let i = 0; i < q.options.length; i++) {
          const opt = q.options[i];
          const isCorrect = i === q.correctIndex;
          const optBtn = Button.CreateSimpleButton(`noticeOpt_${article.id}_${i}`, opt);
          optBtn.width = "100%";
          optBtn.height = "24px";
          optBtn.color = COLORS.textPrimary;
          optBtn.background = COLORS.cardBg;
          optBtn.cornerRadius = 3;
          optBtn.fontSize = 12;
          optBtn.thickness = 1;
          (optBtn as any).borderColor = COLORS.cardBorder;
          optBtn.paddingTop = "3px";
          optBtn.paddingBottom = "3px";
          optBtn.onPointerClickObservable.add(() => {
            this.answeredNoticeQuestions.add(article.id);
            this.callbacks.onNoticeQuestionAnswered?.(isCorrect, article.id);
            this.refreshActiveTab();
          });
          card.addControl(optBtn);
        }
      }
    }
  }

}
