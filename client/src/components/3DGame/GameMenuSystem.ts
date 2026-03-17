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

import type { ConversationRecord, VocabularyEntry, GrammarPattern } from '@shared/language/language-progress';
import type { SkillTreeStats } from './BabylonSkillTreePanel';
import { type NoticeArticle, SAMPLE_ARTICLES } from './BabylonNoticeBoardPanel';
import type { PlayerAssessmentData } from '@shared/assessment-types';
import {
  SKILL_TIERS,
  createDefaultSkillTreeState,
  updateSkillProgress,
  type SkillTreeState,
  type SkillNode,
} from '@shared/language/language-skill-tree';
import {
  ASSESSMENT_DIMENSIONS,
  CEFR_COLORS,
  CEFR_DESCRIPTIONS,
  DIMENSION_ICONS,
  DIMENSION_LABELS,
  getImprovementArrow,
  getImprovementColor,
  getScoreColor,
} from '@shared/assessment-types';

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
  // Language learning panel data
  getVocabularyData?: () => { vocabulary: VocabularyEntry[]; grammarPatterns: GrammarPattern[]; overallFluency: number; totalCorrectUsages: number; dueForReview: VocabularyEntry[] } | null;
  getConversationHistory?: () => ConversationRecord[];
  getSkillTreeStats?: () => SkillTreeStats | null;
  getNoticeArticles?: () => { articles: NoticeArticle[]; playerFluency: number };
  getAssessmentData?: () => { data: PlayerAssessmentData | null; playerLevel: number };
  onNoticeWordClicked?: (word: string, meaning: string) => void;
  onNoticeQuestionAnswered?: (correct: boolean, articleId: string) => void;
  onVocabWordSpeak?: (word: string) => void;
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
  | "vocabulary"
  | "conversations"
  | "skills"
  | "notices"
  | "assessment"
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
  { id: "vocabulary", label: "Vocabulary", icon: "📚" },
  { id: "conversations", label: "Conversations", icon: "💬" },
  { id: "skills", label: "Skill Tree", icon: "🌳" },
  { id: "notices", label: "Notice Board", icon: "📌" },
  { id: "assessment", label: "Assessment", icon: "📊" },
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
  private skillTreeState: SkillTreeState = createDefaultSkillTreeState();
  private answeredNoticeQuestions: Set<string> = new Set();
  private noticeShowTranslations: boolean = true;

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
      btn.height = "34px";
      btn.color = COLORS.textPrimary;
      btn.background = COLORS.tabIdle;
      btn.fontSize = 13;
      btn.thickness = 0;
      btn.cornerRadius = 6;
      btn.paddingTop = "1px";
      btn.paddingBottom = "1px";
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
      case "vocabulary":
        this.renderVocabularyTab();
        break;
      case "conversations":
        this.renderConversationsTab();
        break;
      case "skills":
        this.renderSkillsTab();
        break;
      case "notices":
        this.renderNoticesTab();
        break;
      case "assessment":
        this.renderAssessmentTab();
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
        const itemDisplayName = item.languageLearningData?.targetWord || item.name;
        nameText.text = `${item.icon || "•"} ${itemDisplayName}`;
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
      { key: "Q / E", action: "Strafe left / right" },
      { key: "Shift", action: "Sprint" },
      { key: "Space", action: "Jump" },
      { key: "Enter", action: "Enter / Exit building" },
      { key: "G", action: "Interact / Talk to nearest NPC" },
      { key: "F", action: "Attack" },
      { key: "T", action: "Target nearest enemy" },
      { key: "1 / 2 / 3", action: "Camera: Follow / Orbit / Free" },
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

  // ── VOCABULARY TAB ──────────────────────────────────────────────────────

  private renderVocabularyTab(): void {
    const { stack } = this.makeScrollableContent("vocab");
    const data = this.callbacks.getVocabularyData?.();

    this.addSectionHeader(stack, "Language Progress");

    // ── Sub-tab buttons (Vocabulary / Grammar) ──
    const subTabRow = new Rectangle();
    subTabRow.width = 1;
    subTabRow.height = "36px";
    subTabRow.thickness = 0;
    subTabRow.background = "transparent";
    stack.addControl(subTabRow);

    const vocSubBtn = Button.CreateSimpleButton("vocSubTab_vocab", "Vocabulary");
    vocSubBtn.width = "140px";
    vocSubBtn.height = "30px";
    vocSubBtn.fontSize = 13;
    vocSubBtn.fontWeight = "bold";
    vocSubBtn.color = COLORS.textPrimary;
    vocSubBtn.cornerRadius = 6;
    vocSubBtn.background = this.vocabSubTab === 'vocabulary' ? COLORS.tabActive : COLORS.cardBg;
    vocSubBtn.thickness = 1;
    (vocSubBtn as any).borderColor = this.vocabSubTab === 'vocabulary' ? COLORS.tabActiveBorder : COLORS.cardBorder;
    vocSubBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    vocSubBtn.left = "4px";
    vocSubBtn.onPointerClickObservable.add(() => {
      this.vocabSubTab = 'vocabulary';
      this.refreshActiveTab();
    });
    subTabRow.addControl(vocSubBtn);

    const gramSubBtn = Button.CreateSimpleButton("vocSubTab_gram", "Grammar");
    gramSubBtn.width = "140px";
    gramSubBtn.height = "30px";
    gramSubBtn.fontSize = 13;
    gramSubBtn.fontWeight = "bold";
    gramSubBtn.color = COLORS.textPrimary;
    gramSubBtn.cornerRadius = 6;
    gramSubBtn.background = this.vocabSubTab === 'grammar' ? COLORS.tabActive : COLORS.cardBg;
    gramSubBtn.thickness = 1;
    (gramSubBtn as any).borderColor = this.vocabSubTab === 'grammar' ? COLORS.tabActiveBorder : COLORS.cardBorder;
    gramSubBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    gramSubBtn.left = "152px";
    gramSubBtn.onPointerClickObservable.add(() => {
      this.vocabSubTab = 'grammar';
      this.refreshActiveTab();
    });
    subTabRow.addControl(gramSubBtn);

    if (!data || (data.vocabulary.length === 0 && data.grammarPatterns.length === 0)) {
      const noData = new TextBlock();
      noData.text = "No vocabulary learned yet.\nTalk to NPCs to learn new words!";
      noData.color = COLORS.textMuted;
      noData.fontSize = 15;
      noData.height = "60px";
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
    filterLabel.height = "20px";
    filterLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(filterLabel);

    // Two rows of category buttons (6 per row to fit)
    for (let rowIdx = 0; rowIdx < 2; rowIdx++) {
      const catRow = new Rectangle();
      catRow.width = 1;
      catRow.height = "30px";
      catRow.thickness = 0;
      catRow.background = "transparent";
      stack.addControl(catRow);

      const rowCats = CATEGORIES.slice(rowIdx * 6, (rowIdx + 1) * 6);
      let xOff = 4;
      for (const cat of rowCats) {
        const label = cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1);
        const isActive = this.vocabCategoryFilter === cat;
        const btn = Button.CreateSimpleButton(`catBtn_${cat}`, label);
        const btnWidth = Math.max(44, label.length * 8 + 14);
        btn.width = `${btnWidth}px`;
        btn.height = "26px";
        btn.fontSize = 11;
        btn.color = COLORS.textPrimary;
        btn.cornerRadius = 4;
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
    sortRow.height = "30px";
    sortRow.thickness = 0;
    sortRow.background = "transparent";
    stack.addControl(sortRow);

    const sortLabel = new TextBlock();
    sortLabel.text = "Sort:";
    sortLabel.fontSize = 11;
    sortLabel.color = COLORS.textSecondary;
    sortLabel.width = "30px";
    sortLabel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    sortLabel.left = "4px";
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
      const btnW = opt.label.length * 8 + 16;
      btn.width = `${btnW}px`;
      btn.height = "24px";
      btn.fontSize = 11;
      btn.color = COLORS.textPrimary;
      btn.cornerRadius = 4;
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
      reviewTitle.fontSize = 16;
      reviewTitle.fontWeight = "bold";
      reviewTitle.height = "30px";
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
    vocabTitle.fontSize = 18;
    vocabTitle.fontWeight = "bold";
    vocabTitle.height = "34px";
    vocabTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(vocabTitle);

    if (filtered.length === 0) {
      const emptyText = new TextBlock();
      emptyText.text = data.vocabulary.length === 0
        ? "No vocabulary learned yet.\nTalk to NPCs to learn new words!"
        : "No words in this category.";
      emptyText.color = COLORS.textMuted;
      emptyText.fontSize = 14;
      emptyText.height = "50px";
      emptyText.textWrapping = true;
      stack.addControl(emptyText);
      return;
    }

    // Header row
    const headerRow = new Rectangle();
    headerRow.width = 1;
    headerRow.height = "26px";
    headerRow.thickness = 0;
    headerRow.background = COLORS.headerBg;
    headerRow.cornerRadius = 4;
    stack.addControl(headerRow);

    const hWord = new TextBlock();
    hWord.text = "WORD";
    hWord.color = COLORS.textMuted;
    hWord.fontSize = 10;
    hWord.fontWeight = "bold";
    hWord.width = "28%";
    hWord.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hWord.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hWord.paddingLeft = "4px";
    headerRow.addControl(hWord);

    const hMeaning = new TextBlock();
    hMeaning.text = "MEANING";
    hMeaning.color = COLORS.textMuted;
    hMeaning.fontSize = 10;
    hMeaning.fontWeight = "bold";
    hMeaning.width = "30%";
    hMeaning.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hMeaning.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hMeaning.left = "28%";
    headerRow.addControl(hMeaning);

    const hMastery = new TextBlock();
    hMastery.text = "MASTERY";
    hMastery.color = COLORS.textMuted;
    hMastery.fontSize = 10;
    hMastery.fontWeight = "bold";
    hMastery.width = "16%";
    hMastery.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hMastery.left = "58%";
    headerRow.addControl(hMastery);

    const hUsed = new TextBlock();
    hUsed.text = "USED";
    hUsed.color = COLORS.textMuted;
    hUsed.fontSize = 10;
    hUsed.fontWeight = "bold";
    hUsed.width = "10%";
    hUsed.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    hUsed.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    hUsed.left = "-30px";
    headerRow.addControl(hUsed);

    const masteryColors: Record<string, string> = { mastered: '#f1c40f', familiar: '#2ecc71', learning: '#f39c12', new: '#e74c3c' };
    const masteryLabels: Record<string, string> = { new: 'New', learning: 'Learning', familiar: 'Familiar', mastered: 'Mastered' };

    for (const entry of filtered) {
      const isDue = dueSet.has(entry.word);
      const row = new Rectangle();
      row.width = 1;
      row.height = "32px";
      row.thickness = 0;
      row.background = isDue ? "rgba(251, 188, 4, 0.06)" : "transparent";
      row.paddingBottom = "1px";
      stack.addControl(row);

      const wordText = new TextBlock();
      wordText.text = entry.word;
      wordText.color = COLORS.textPrimary;
      wordText.fontSize = 13;
      wordText.fontWeight = "bold";
      wordText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      wordText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      wordText.paddingLeft = "4px";
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
      masteryText.fontSize = 11;
      masteryText.fontWeight = "bold";
      masteryText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      masteryText.left = "58%";
      masteryText.width = "16%";
      row.addControl(masteryText);

      const usedText = new TextBlock();
      usedText.text = `${entry.timesUsedCorrectly}/${entry.timesEncountered}`;
      usedText.color = COLORS.textMuted;
      usedText.fontSize = 11;
      usedText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      usedText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      usedText.left = "-30px";
      usedText.width = "10%";
      row.addControl(usedText);

      // TTS speaker button
      const speakBtn = Button.CreateSimpleButton(`speak_${entry.word}`, "\u{1F50A}");
      speakBtn.width = "26px";
      speakBtn.height = "26px";
      speakBtn.fontSize = 13;
      speakBtn.color = COLORS.accent;
      speakBtn.background = "transparent";
      speakBtn.thickness = 0;
      speakBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      speakBtn.left = "-2px";
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
    gramTitle.fontSize = 18;
    gramTitle.fontWeight = "bold";
    gramTitle.height = "34px";
    gramTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(gramTitle);

    if (data.grammarPatterns.length === 0) {
      const emptyText = new TextBlock();
      emptyText.text = "No grammar patterns tracked yet.\nConverse with NPCs to practice grammar!";
      emptyText.color = COLORS.textMuted;
      emptyText.fontSize = 14;
      emptyText.height = "50px";
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
      nameRow.height = "24px";
      nameRow.thickness = 0;
      card.addControl(nameRow);

      const nameText = new TextBlock();
      nameText.text = pattern.pattern;
      nameText.color = COLORS.textPrimary;
      nameText.fontSize = 15;
      nameText.fontWeight = "bold";
      nameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      nameRow.addControl(nameText);

      const badgeText = new TextBlock();
      badgeText.text = pattern.mastered ? "Mastered" : (isWeak ? "Practice this!" : "Learning");
      badgeText.color = pattern.mastered ? COLORS.gold : (isWeak ? COLORS.accentRed : COLORS.textMuted);
      badgeText.fontSize = 11;
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
        exText.fontSize = 11;
        exText.fontStyle = "italic";
        exText.height = "20px";
        exText.textWrapping = true;
        exText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(exText);
      }

      // Pattern explanation (most recent)
      if (pattern.explanations && pattern.explanations.length > 0) {
        const explainText = new TextBlock();
        explainText.text = `Rule: ${pattern.explanations[pattern.explanations.length - 1]}`;
        explainText.color = COLORS.textSecondary;
        explainText.fontSize = 11;
        explainText.height = "20px";
        explainText.textWrapping = true;
        explainText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(explainText);
      }
    }
  }

  // ── CONVERSATIONS TAB ───────────────────────────────────────────────────

  private renderConversationsTab(): void {
    const { stack } = this.makeScrollableContent("convhist");
    const conversations = this.callbacks.getConversationHistory?.() || [];

    this.addSectionHeader(stack, "Conversation History");
    this.addSubHeader(stack, "Recent NPC conversations and language stats");

    if (conversations.length === 0) {
      const noData = new TextBlock();
      noData.text = "No conversations yet.\nTalk to NPCs to start learning!";
      noData.color = COLORS.textMuted;
      noData.fontSize = 15;
      noData.height = "60px";
      noData.textWrapping = true;
      stack.addControl(noData);
      return;
    }

    // Summary stats
    const totalFluency = conversations.reduce((s, c) => s + c.fluencyGained, 0);
    const totalWords = new Set(conversations.flatMap(c => c.wordsUsed)).size;
    const summaryCard = this.makeCard(stack);
    this.addStatRow(summaryCard, "Conversations", `${conversations.length}`);
    this.addStatRow(summaryCard, "Total Fluency Gained", `+${totalFluency.toFixed(1)}`, COLORS.accentGreen);
    this.addStatRow(summaryCard, "Unique Words Used", `${totalWords}`, COLORS.accent);

    this.addDivider(stack);

    // Conversation cards (most recent first)
    const sorted = [...conversations].sort((a, b) => b.timestamp - a.timestamp);
    for (const conv of sorted) {
      const grammarTotal = conv.grammarCorrectCount + conv.grammarErrorCount;
      const grammarAccuracy = grammarTotal > 0
        ? Math.round((conv.grammarCorrectCount / grammarTotal) * 100) : 0;
      const tlColor = conv.targetLanguagePercentage >= 80 ? COLORS.accentGreen
        : (conv.targetLanguagePercentage >= 50 ? COLORS.accentYellow : COLORS.accentRed);

      const card = this.makeCard(stack);

      // NPC name and date
      const nameRow = new Rectangle();
      nameRow.width = 1;
      nameRow.height = "24px";
      nameRow.thickness = 0;
      card.addControl(nameRow);

      const nameText = new TextBlock();
      nameText.text = conv.characterName;
      nameText.color = COLORS.accent;
      nameText.fontSize = 15;
      nameText.fontWeight = "bold";
      nameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      nameRow.addControl(nameText);

      const date = new Date(conv.timestamp);
      const dateText = new TextBlock();
      dateText.text = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      dateText.color = COLORS.textMuted;
      dateText.fontSize = 11;
      dateText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      nameRow.addControl(dateText);

      // Stats
      this.addStatRow(card, "Turns", `${conv.turns}`);
      this.addStatRow(card, "Fluency Gained", `+${conv.fluencyGained.toFixed(1)}`,
        conv.fluencyGained >= 1.5 ? COLORS.accentGreen : COLORS.textSecondary);
      this.addStatRow(card, "Target Language", `${Math.round(conv.targetLanguagePercentage)}%`, tlColor);
      if (grammarTotal > 0) {
        this.addStatRow(card, "Grammar Accuracy", `${grammarAccuracy}%`,
          grammarAccuracy >= 80 ? COLORS.accentGreen : COLORS.accentYellow);
      }

      // Target language usage bar
      this.addProgressBar(card, conv.targetLanguagePercentage, 100, tlColor);

      // Words used
      if (conv.wordsUsed.length > 0) {
        const wordsStr = conv.wordsUsed.slice(0, 8).join(', ') +
          (conv.wordsUsed.length > 8 ? ` +${conv.wordsUsed.length - 8} more` : '');
        const wordsText = new TextBlock();
        wordsText.text = `Words: ${wordsStr}`;
        wordsText.color = COLORS.textMuted;
        wordsText.fontSize = 11;
        wordsText.fontStyle = "italic";
        wordsText.height = "20px";
        wordsText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        wordsText.textWrapping = true;
        card.addControl(wordsText);
      }
    }
  }

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
      tierHeader.height = "24px";
      tierHeader.thickness = 0;
      tierCard.addControl(tierHeader);

      const tierTitle = new TextBlock();
      tierTitle.text = `Tier ${tierDef.tier}: ${tierDef.name}  (${tierDef.range[0]}-${tierDef.range[1]}% fluency)`;
      tierTitle.color = allUnlocked ? tierDef.color : COLORS.textSecondary;
      tierTitle.fontSize = 14;
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
        nodeRow.height = "40px";
        nodeRow.thickness = 0;
        nodeRow.background = node.unlocked
          ? `rgba(${this.hexToRgb(tierDef.color)}, 0.1)`
          : "transparent";
        nodeRow.cornerRadius = 4;
        tierCard.addControl(nodeRow);

        const icon = new TextBlock();
        icon.text = node.icon;
        icon.fontSize = 18;
        icon.width = "30px";
        icon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        icon.left = "4px";
        nodeRow.addControl(icon);

        const nodeName = new TextBlock();
        nodeName.text = node.name;
        nodeName.color = node.unlocked ? COLORS.textPrimary : COLORS.textMuted;
        nodeName.fontSize = 13;
        nodeName.fontWeight = "bold";
        nodeName.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        nodeName.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        nodeName.left = "36px";
        nodeName.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        nodeName.top = "4px";
        nodeName.height = "18px";
        nodeRow.addControl(nodeName);

        const nodeDesc = new TextBlock();
        nodeDesc.text = node.description;
        nodeDesc.color = node.unlocked ? COLORS.textSecondary : COLORS.textMuted;
        nodeDesc.fontSize = 10;
        nodeDesc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        nodeDesc.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        nodeDesc.left = "36px";
        nodeDesc.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        nodeDesc.top = "22px";
        nodeDesc.height = "14px";
        nodeRow.addControl(nodeDesc);

        if (node.unlocked) {
          const check = new TextBlock();
          check.text = "✓";
          check.fontSize = 16;
          check.fontWeight = "bold";
          check.color = COLORS.accentGreen;
          check.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
          check.left = "-8px";
          check.width = "24px";
          nodeRow.addControl(check);
        } else {
          const pctText = new TextBlock();
          pctText.text = `${Math.round(node.progress * 100)}%`;
          pctText.fontSize = 11;
          pctText.color = COLORS.textMuted;
          pctText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
          pctText.left = "-8px";
          pctText.width = "36px";
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

    this.addSectionHeader(stack, "Notice Board");
    this.addSubHeader(stack, "Articles in the target language");

    if (!noticeData || noticeData.articles.length === 0) {
      const noData = new TextBlock();
      noData.text = "No notices available yet.";
      noData.color = COLORS.textMuted;
      noData.fontSize = 15;
      noData.height = "40px";
      stack.addControl(noData);
      return;
    }

    // Toggle translations button
    const toggleBtn = Button.CreateSimpleButton("noticeToggleTrans", this.noticeShowTranslations ? "Hide Translations" : "Show Translations");
    toggleBtn.width = "180px";
    toggleBtn.height = "32px";
    toggleBtn.color = COLORS.textPrimary;
    toggleBtn.background = COLORS.cardBg;
    toggleBtn.cornerRadius = 6;
    toggleBtn.fontSize = 13;
    toggleBtn.thickness = 1;
    (toggleBtn as any).borderColor = COLORS.cardBorder;
    toggleBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    toggleBtn.paddingBottom = "8px";
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
      titleRow.height = "24px";
      titleRow.thickness = 0;
      card.addControl(titleRow);

      const titleText = new TextBlock();
      titleText.text = article.title;
      titleText.color = COLORS.textPrimary;
      titleText.fontSize = 15;
      titleText.fontWeight = "bold";
      titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      titleRow.addControl(titleText);

      const diffText = new TextBlock();
      diffText.text = article.difficulty;
      diffText.color = diffColor;
      diffText.fontSize = 11;
      diffText.fontWeight = "bold";
      diffText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      titleRow.addControl(diffText);

      // Title translation
      if (this.noticeShowTranslations) {
        const titleTrans = new TextBlock();
        titleTrans.text = `(${article.titleTranslation})`;
        titleTrans.color = COLORS.textMuted;
        titleTrans.fontSize = 11;
        titleTrans.fontStyle = "italic";
        titleTrans.height = "18px";
        titleTrans.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(titleTrans);
      }

      // Body
      const bodyText = new TextBlock();
      bodyText.text = article.body;
      bodyText.color = COLORS.textSecondary;
      bodyText.fontSize = 13;
      bodyText.textWrapping = true;
      bodyText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      bodyText.resizeToFit = true;
      bodyText.paddingTop = "4px";
      bodyText.paddingBottom = "4px";
      card.addControl(bodyText);

      // Body translation
      if (this.noticeShowTranslations) {
        const bodyTrans = new TextBlock();
        bodyTrans.text = article.bodyTranslation;
        bodyTrans.color = COLORS.textMuted;
        bodyTrans.fontSize = 11;
        bodyTrans.fontStyle = "italic";
        bodyTrans.textWrapping = true;
        bodyTrans.resizeToFit = true;
        bodyTrans.paddingBottom = "4px";
        bodyTrans.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        card.addControl(bodyTrans);
      }

      // Vocabulary words
      if (article.vocabularyWords.length > 0) {
        const vocabText = new TextBlock();
        vocabText.text = "Vocab: " + article.vocabularyWords.map(w => `${w.word} (${w.meaning})`).join(", ");
        vocabText.color = COLORS.accent;
        vocabText.fontSize = 11;
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
        spacer.height = "8px";
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
          optBtn.height = "30px";
          optBtn.color = COLORS.textPrimary;
          optBtn.background = COLORS.cardBg;
          optBtn.cornerRadius = 4;
          optBtn.fontSize = 12;
          optBtn.thickness = 1;
          (optBtn as any).borderColor = COLORS.cardBorder;
          optBtn.paddingTop = "2px";
          optBtn.paddingBottom = "2px";
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

  // ── ASSESSMENT TAB ──────────────────────────────────────────────────────

  private renderAssessmentTab(): void {
    const { stack } = this.makeScrollableContent("assessment");
    const assessData = this.callbacks.getAssessmentData?.();

    this.addSectionHeader(stack, "Language Assessment");
    this.addSubHeader(stack, "CEFR proficiency level and dimension scores");

    if (!assessData || !assessData.data) {
      const noData = new TextBlock();
      noData.text = "No assessment data yet.\nComplete your first assessment to see your progress!";
      noData.color = COLORS.textMuted;
      noData.fontSize = 15;
      noData.height = "60px";
      noData.textWrapping = true;
      stack.addControl(noData);
      return;
    }

    const { data, playerLevel } = assessData;

    // CEFR badge
    const cefrCard = this.makeCard(stack);

    const cefrRow = new Rectangle();
    cefrRow.width = 1;
    cefrRow.height = "50px";
    cefrRow.thickness = 0;
    cefrCard.addControl(cefrRow);

    const cefrLevel = new TextBlock();
    cefrLevel.text = data.cefrLevel;
    cefrLevel.fontSize = 28;
    cefrLevel.fontWeight = "bold";
    cefrLevel.color = CEFR_COLORS[data.cefrLevel];
    cefrLevel.width = "60px";
    cefrLevel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    cefrRow.addControl(cefrLevel);

    const cefrDesc = new TextBlock();
    cefrDesc.text = CEFR_DESCRIPTIONS[data.cefrLevel];
    cefrDesc.fontSize = 16;
    cefrDesc.color = COLORS.textPrimary;
    cefrDesc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    cefrDesc.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    cefrDesc.left = "70px";
    cefrDesc.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    cefrDesc.top = "4px";
    cefrDesc.height = "24px";
    cefrRow.addControl(cefrDesc);

    const cefrSub = new TextBlock();
    cefrSub.text = "CEFR Proficiency Level";
    cefrSub.fontSize = 11;
    cefrSub.color = COLORS.textMuted;
    cefrSub.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    cefrSub.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    cefrSub.left = "70px";
    cefrSub.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    cefrSub.top = "28px";
    cefrSub.height = "18px";
    cefrRow.addControl(cefrSub);

    // Dimension bars
    this.addDivider(stack);
    const dimTitle = new TextBlock();
    dimTitle.text = "Assessment Dimensions";
    dimTitle.color = COLORS.textPrimary;
    dimTitle.fontSize = 18;
    dimTitle.fontWeight = "bold";
    dimTitle.height = "34px";
    dimTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.addControl(dimTitle);

    const scoreMap = new Map(data.dimensionScores.map(s => [s.dimension, s]));
    for (const dim of ASSESSMENT_DIMENSIONS) {
      const scoreData = scoreMap.get(dim);
      const score = scoreData?.score ?? 0;
      const previousScore = scoreData?.previousScore;
      const arrow = getImprovementArrow(score, previousScore);

      const dimCard = this.makeCard(stack);

      const dimRow = new Rectangle();
      dimRow.width = 1;
      dimRow.height = "28px";
      dimRow.thickness = 0;
      dimCard.addControl(dimRow);

      const dimIcon = new TextBlock();
      dimIcon.text = DIMENSION_ICONS[dim];
      dimIcon.fontSize = 16;
      dimIcon.width = "24px";
      dimIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      dimRow.addControl(dimIcon);

      const dimLabel = new TextBlock();
      dimLabel.text = DIMENSION_LABELS[dim];
      dimLabel.color = COLORS.textPrimary;
      dimLabel.fontSize = 13;
      dimLabel.fontWeight = "bold";
      dimLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      dimLabel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      dimLabel.left = "28px";
      dimRow.addControl(dimLabel);

      const scoreText = new TextBlock();
      scoreText.text = score > 0 ? `${score}/5${arrow ? ' ' + arrow : ''}` : '-';
      scoreText.fontSize = 13;
      scoreText.fontWeight = "bold";
      scoreText.color = score > 0 ? getScoreColor(score) : COLORS.textMuted;
      scoreText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      dimRow.addControl(scoreText);

      this.addProgressBar(dimCard, score, 5, getScoreColor(score));
    }

    // Next assessment info
    this.addDivider(stack);
    const infoCard = this.makeCard(stack);
    if (data.nextAssessmentLevel && playerLevel < data.nextAssessmentLevel) {
      this.addStatRow(infoCard, "Next Assessment", `Level ${data.nextAssessmentLevel}`, COLORS.textSecondary);
      this.addStatRow(infoCard, "Current Level", `${playerLevel}`, COLORS.accent);
    } else {
      this.addStatRow(infoCard, "Status", "Assessment available!", COLORS.accentGreen);
    }
  }
}
