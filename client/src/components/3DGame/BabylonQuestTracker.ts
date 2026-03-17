import {
  AdvancedDynamicTexture,
  Button,
  Control,
  Rectangle,
  ScrollViewer,
  StackPanel,
  TextBlock,
  TextWrapping
} from "@babylonjs/gui";
import { Scene, Vector3 } from "@babylonjs/core";
import { QuestWaypointManager } from './QuestWaypointManager';
import type { GamePrologEngine } from './GamePrologEngine';

export interface QuestObjective {
  type: string;
  description: string;
  completed: boolean;
  current?: number;
  required?: number;
  position?: { x: number; y: number; z: number };
  locationPosition?: { x: number; y: number; z: number };
  locationName?: string;
}

export interface Quest {
  id: string;
  worldId: string;
  assignedTo: string;
  assignedBy: string | null;
  assignedByCharacterId: string | null;
  title: string;
  description: string;
  questType: string;
  difficulty: string;
  targetLanguage: string;
  progress: Record<string, any> | null;
  status: string;
  completionCriteria: Record<string, any> | null;
  experienceReward: number;
  assignedAt: Date;
  completedAt: Date | null;
  conversationContext: string | null;
  objectives?: QuestObjective[];
  rewards?: Record<string, any> | null;
  locationName?: string;
  hintsUsed?: number;
  performanceRating?: number;
  vocabularyUsed?: string[];
  grammarAccuracy?: number;
}

/** Filter criteria for quest log */
export interface QuestFilters {
  questType?: string;
  difficulty?: string;
  assignedBy?: string;
  search?: string;
}

/** Sort options for quest log */
export type QuestSortBy = 'recent' | 'difficulty' | 'reward';

/** Aggregated quest statistics */
export interface QuestStats {
  totalCompleted: number;
  totalActive: number;
  totalFailed: number;
  totalAbandoned: number;
  completionRate: number;
  averagePerformance: number;
  totalXpEarned: number;
  vocabularyWordsLearned: number;
  grammarPatternsCount: number;
  questsByType: Record<string, number>;
  questsByDifficulty: Record<string, number>;
}

/** Color for quest type background tint */
export function getQuestTypeColor(questType: string): string {
  switch (questType) {
    case 'conversation': case 'social': return '#2196F3'; // blue
    case 'vocabulary': case 'collection': return '#4CAF50'; // green
    case 'navigation': case 'exploration': return '#FF9800'; // orange
    case 'listening_comprehension': return '#9C27B0'; // purple
    case 'cultural': return '#F44336'; // red
    case 'grammar': return '#00BCD4'; // cyan
    case 'translation': case 'translation_challenge': return '#3F51B5'; // indigo
    case 'combat': return '#D32F2F'; // dark red
    case 'crafting': return '#795548'; // brown
    case 'escort': case 'delivery': return '#607D8B'; // blue grey
    default: return '#9E9E9E'; // grey
  }
}

/** Difficulty to star count (1-3) */
export function getDifficultyStars(difficulty: string): number {
  switch (difficulty) {
    case 'beginner': case 'easy': return 1;
    case 'intermediate': case 'normal': return 2;
    case 'advanced': case 'hard': case 'legendary': return 3;
    default: return 1;
  }
}

/** Difficulty color */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': case 'easy': return '#4CAF50';
    case 'intermediate': case 'normal': return '#FFC107';
    case 'advanced': case 'hard': return '#F44336';
    case 'legendary': return '#9C27B0';
    default: return '#888';
  }
}

/** Quest type icon */
export function getQuestIcon(questType: string): string {
  switch (questType) {
    case 'conversation': return '\u{1F4AC}';
    case 'translation': case 'translation_challenge': return '\u{1F504}';
    case 'vocabulary': return '\u{1F4DA}';
    case 'grammar': return '\u{1F4DD}';
    case 'cultural': return '\u{1F30D}';
    case 'listening_comprehension': return '\u{1F3A7}';
    case 'navigation': return '\u{1F9ED}';
    case 'combat': return '\u2694\uFE0F';
    case 'collection': return '\u{1F4E6}';
    case 'exploration': return '\u{1F5FA}\uFE0F';
    case 'escort': return '\u{1F6E1}\uFE0F';
    case 'delivery': return '\u{1F4E8}';
    case 'crafting': return '\u{1F528}';
    case 'social': return '\u{1F91D}';
    default: return '\u{1F3AF}';
  }
}

/** Calculate progress from objectives array */
export function calculateObjectivesProgress(objectives: QuestObjective[]): number {
  if (objectives.length === 0) return 0;
  const completed = objectives.filter(o => o.completed).length;
  return completed / objectives.length;
}

/** Calculate progress from completionCriteria/progress */
export function calculateCriteriaProgress(criteria: Record<string, any>, progress: Record<string, any>): number | null {
  switch (criteria.type) {
    case 'vocabulary_usage':
      if (criteria.requiredCount && progress.currentCount !== undefined) {
        return Math.min(progress.currentCount / criteria.requiredCount, 1);
      }
      break;
    case 'conversation_turns':
      if (criteria.requiredTurns && progress.turnsCompleted !== undefined) {
        return Math.min(progress.turnsCompleted / criteria.requiredTurns, 1);
      }
      break;
    case 'grammar_pattern':
      if (criteria.requiredCount && progress.currentCount !== undefined) {
        return Math.min(progress.currentCount / criteria.requiredCount, 1);
      }
      break;
    case 'conversation_engagement':
      if (criteria.requiredMessages && progress.messagesCount !== undefined) {
        return Math.min(progress.messagesCount / criteria.requiredMessages, 1);
      }
      break;
    case 'listening_comprehension':
      if (criteria.questions?.length && progress.questionsCorrect !== undefined) {
        return Math.min(progress.questionsCorrect / criteria.questions.length, 1);
      }
      break;
    case 'translation_challenge':
      if (criteria.phrases?.length && progress.translationsCorrect !== undefined) {
        return Math.min(progress.translationsCorrect / criteria.phrases.length, 1);
      }
      break;
    case 'navigate_language':
      if (criteria.waypoints?.length && progress.waypointsReached !== undefined) {
        return Math.min(progress.waypointsReached / criteria.waypoints.length, 1);
      }
      break;
    case 'follow_directions': {
      const required = criteria.stepsRequired || criteria.requiredCount || 1;
      if (progress.stepsCompleted !== undefined) {
        return Math.min(progress.stepsCompleted / required, 1);
      }
      break;
    }
  }
  return null;
}

/** Format distance for display */
export function formatDistance(distance: number): string {
  if (distance < 1) return '<1m';
  if (distance < 100) return `${Math.round(distance)}m`;
  return `${(distance / 100).toFixed(1)}km`;
}

/** Difficulty numeric value for sorting */
const DIFFICULTY_ORDER: Record<string, number> = {
  beginner: 1, easy: 1,
  intermediate: 2, normal: 2,
  advanced: 3, hard: 3,
  legendary: 4,
};

/** Filter quests by type, difficulty, NPC giver, and search keyword */
export function filterQuests(quests: Quest[], filters: QuestFilters): Quest[] {
  return quests.filter(q => {
    if (filters.questType && q.questType !== filters.questType) return false;
    if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
    if (filters.assignedBy && q.assignedBy !== filters.assignedBy) return false;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      if (!q.title.toLowerCase().includes(term) && !q.description.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });
}

/** Sort quests by the given criterion */
export function sortQuests(quests: Quest[], sortBy: QuestSortBy): Quest[] {
  const sorted = [...quests];
  switch (sortBy) {
    case 'recent':
      sorted.sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.assignedAt).getTime();
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.assignedAt).getTime();
        return dateB - dateA;
      });
      break;
    case 'difficulty':
      sorted.sort((a, b) => (DIFFICULTY_ORDER[b.difficulty] ?? 0) - (DIFFICULTY_ORDER[a.difficulty] ?? 0));
      break;
    case 'reward':
      sorted.sort((a, b) => b.experienceReward - a.experienceReward);
      break;
  }
  return sorted;
}

/** Compute aggregate statistics from a full quest list */
export function computeQuestStats(quests: Quest[]): QuestStats {
  const completed = quests.filter(q => q.status === 'completed');
  const active = quests.filter(q => q.status === 'active');
  const failed = quests.filter(q => q.status === 'failed');
  const abandoned = quests.filter(q => q.status === 'abandoned');

  const totalWithOutcome = completed.length + failed.length + abandoned.length;
  const completionRate = totalWithOutcome > 0 ? completed.length / totalWithOutcome : 0;

  const ratings = completed.filter(q => q.performanceRating != null).map(q => q.performanceRating!);
  const averagePerformance = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const totalXpEarned = completed.reduce((sum, q) => sum + q.experienceReward, 0);

  const vocabSet = new Set<string>();
  for (const q of completed) {
    if (q.vocabularyUsed) {
      for (const word of q.vocabularyUsed) vocabSet.add(word);
    }
  }

  let grammarPatternsCount = 0;
  for (const q of completed) {
    if (q.questType === 'grammar') grammarPatternsCount++;
  }

  const questsByType: Record<string, number> = {};
  const questsByDifficulty: Record<string, number> = {};
  for (const q of quests) {
    questsByType[q.questType] = (questsByType[q.questType] || 0) + 1;
    questsByDifficulty[q.difficulty] = (questsByDifficulty[q.difficulty] || 0) + 1;
  }

  return {
    totalCompleted: completed.length,
    totalActive: active.length,
    totalFailed: failed.length,
    totalAbandoned: abandoned.length,
    completionRate,
    averagePerformance,
    totalXpEarned,
    vocabularyWordsLearned: vocabSet.size,
    grammarPatternsCount,
    questsByType,
    questsByDifficulty,
  };
}

/** Get unique NPC givers from quest list */
export function getUniqueQuestGivers(quests: Quest[]): string[] {
  const givers = new Set<string>();
  for (const q of quests) {
    if (q.assignedBy) givers.add(q.assignedBy);
  }
  return Array.from(givers).sort();
}

/** Get unique quest types from quest list */
export function getUniqueQuestTypes(quests: Quest[]): string[] {
  const types = new Set<string>();
  for (const q of quests) {
    types.add(q.questType);
  }
  return Array.from(types).sort();
}

export class BabylonQuestTracker {
  private advancedTexture: AdvancedDynamicTexture;
  private scene: Scene;
  private questPanel: Rectangle | null = null;
  private questListPanel: StackPanel | null = null;
  private detailPanel: Rectangle | null = null;
  private detailStack: StackPanel | null = null;
  private quests: Quest[] = [];
  private isVisible = false;
  private isMinimized = false;

  // Tab state
  private activeTab: 'active' | 'completed' | 'stats' = 'active';
  private activeTabBtn: Button | null = null;
  private completedTabBtn: Button | null = null;
  private statsTabBtn: Button | null = null;

  // Filter, sort, search state
  private filters: QuestFilters = {};
  private sortBy: QuestSortBy = 'recent';
  private filterBarPanel: StackPanel | null = null;

  // Selection and tracking
  private selectedQuestId: string | null = null;
  private trackedQuestId: string | null = null;

  // Player position for distance calculation
  private playerPosition: Vector3 = Vector3.Zero();

  // Waypoint system
  private waypointManager: QuestWaypointManager;
  private showWaypoints: boolean = true;

  // World context for quest types
  private worldId: string = '';

  // Prolog engine for quest evaluation
  private prologEngine: GamePrologEngine | null = null;
  private playerId: string = 'player';

  // Callbacks
  private onClose: (() => void) | null = null;

  // Scroll viewer reference for layout
  private scrollViewer: ScrollViewer | null = null;

  constructor(advancedTexture: AdvancedDynamicTexture, scene: Scene) {
    this.advancedTexture = advancedTexture;
    this.scene = scene;
    this.waypointManager = new QuestWaypointManager(scene);
    this.createQuestUI();
  }

  private createQuestUI() {
    // Main container
    this.questPanel = new Rectangle("questPanel");
    this.questPanel.width = "380px";
    this.questPanel.height = "500px";
    this.questPanel.background = "rgba(0, 0, 0, 0.9)";
    this.questPanel.color = "#FFD700";
    this.questPanel.thickness = 2;
    this.questPanel.cornerRadius = 10;
    this.questPanel.top = "10px";
    this.questPanel.left = "-10px";
    this.questPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.questPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.questPanel.isVisible = false;

    const mainStack = new StackPanel();
    mainStack.width = "100%";
    mainStack.height = "100%";
    this.questPanel.addControl(mainStack);

    // Header
    const header = new Rectangle("questHeader");
    header.width = "100%";
    header.height = "50px";
    header.background = "rgba(30, 30, 30, 0.95)";
    header.thickness = 0;
    mainStack.addControl(header);

    const headerStack = new StackPanel();
    headerStack.isVertical = false;
    headerStack.width = "100%";
    headerStack.height = "100%";
    header.addControl(headerStack);

    const titleText = new TextBlock();
    titleText.text = "Quest Log";
    titleText.color = "#FFD700";
    titleText.fontSize = 18;
    titleText.fontWeight = "bold";
    titleText.paddingLeft = "15px";
    titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    titleText.width = "220px";
    headerStack.addControl(titleText);

    // Minimize button
    const minimizeBtn = Button.CreateSimpleButton("minimizeQuest", "\u2212");
    minimizeBtn.width = "35px";
    minimizeBtn.height = "35px";
    minimizeBtn.color = "white";
    minimizeBtn.background = "rgba(100, 100, 100, 0.8)";
    minimizeBtn.cornerRadius = 5;
    minimizeBtn.fontSize = 22;
    minimizeBtn.onPointerClickObservable.add(() => {
      this.toggleMinimize();
    });
    headerStack.addControl(minimizeBtn);

    // Close button
    const closeBtn = Button.CreateSimpleButton("closeQuest", "\u2715");
    closeBtn.width = "35px";
    closeBtn.height = "35px";
    closeBtn.color = "white";
    closeBtn.background = "rgba(255, 50, 50, 0.8)";
    closeBtn.cornerRadius = 5;
    closeBtn.fontSize = 18;
    closeBtn.paddingLeft = "5px";
    closeBtn.onPointerClickObservable.add(() => {
      this.hide();
      this.onClose?.();
    });
    headerStack.addControl(closeBtn);

    // Tab bar
    const tabBar = new StackPanel("questTabBar");
    tabBar.isVertical = false;
    tabBar.width = "100%";
    tabBar.height = "35px";
    mainStack.addControl(tabBar);

    this.activeTabBtn = Button.CreateSimpleButton("activeTab", "Active");
    this.activeTabBtn.width = "34%";
    this.activeTabBtn.height = "35px";
    this.activeTabBtn.color = "white";
    this.activeTabBtn.background = "#4CAF50";
    this.activeTabBtn.fontSize = 12;
    this.activeTabBtn.fontWeight = "bold";
    this.activeTabBtn.thickness = 0;
    this.activeTabBtn.onPointerClickObservable.add(() => {
      this.setActiveTab('active');
    });
    tabBar.addControl(this.activeTabBtn);

    this.completedTabBtn = Button.CreateSimpleButton("completedTab", "Completed");
    this.completedTabBtn.width = "33%";
    this.completedTabBtn.height = "35px";
    this.completedTabBtn.color = "#AAA";
    this.completedTabBtn.background = "rgba(60, 60, 60, 0.8)";
    this.completedTabBtn.fontSize = 12;
    this.completedTabBtn.fontWeight = "bold";
    this.completedTabBtn.thickness = 0;
    this.completedTabBtn.onPointerClickObservable.add(() => {
      this.setActiveTab('completed');
    });
    tabBar.addControl(this.completedTabBtn);

    this.statsTabBtn = Button.CreateSimpleButton("statsTab", "Stats");
    this.statsTabBtn.width = "33%";
    this.statsTabBtn.height = "35px";
    this.statsTabBtn.color = "#AAA";
    this.statsTabBtn.background = "rgba(60, 60, 60, 0.8)";
    this.statsTabBtn.fontSize = 12;
    this.statsTabBtn.fontWeight = "bold";
    this.statsTabBtn.thickness = 0;
    this.statsTabBtn.onPointerClickObservable.add(() => {
      this.setActiveTab('stats');
    });
    tabBar.addControl(this.statsTabBtn);

    // Filter bar (for active/completed tabs)
    this.filterBarPanel = new StackPanel("filterBar");
    this.filterBarPanel.width = "100%";
    this.filterBarPanel.adaptHeightToChildren = true;
    mainStack.addControl(this.filterBarPanel);
    this.rebuildFilterBar();

    // Quest list scroll area
    this.scrollViewer = new ScrollViewer("questScroll");
    this.scrollViewer.width = "100%";
    this.scrollViewer.height = "370px";
    this.scrollViewer.paddingTop = "5px";
    this.scrollViewer.paddingBottom = "5px";
    this.scrollViewer.background = "rgba(20, 20, 20, 0.5)";
    mainStack.addControl(this.scrollViewer);

    this.questListPanel = new StackPanel("questListPanel");
    this.questListPanel.width = "100%";
    this.scrollViewer.addControl(this.questListPanel);

    // Detail panel (hidden by default, overlays over the list)
    this.detailPanel = new Rectangle("questDetailPanel");
    this.detailPanel.width = "380px";
    this.detailPanel.height = "500px";
    this.detailPanel.background = "rgba(10, 10, 10, 0.95)";
    this.detailPanel.color = "#FFD700";
    this.detailPanel.thickness = 2;
    this.detailPanel.cornerRadius = 10;
    this.detailPanel.top = "10px";
    this.detailPanel.left = "-10px";
    this.detailPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.detailPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.detailPanel.isVisible = false;

    const detailScroll = new ScrollViewer("questDetailScroll");
    detailScroll.width = "100%";
    detailScroll.height = "100%";
    detailScroll.paddingTop = "10px";
    detailScroll.paddingBottom = "10px";
    this.detailPanel.addControl(detailScroll);

    this.detailStack = new StackPanel("questDetailStack");
    this.detailStack.width = "100%";
    detailScroll.addControl(this.detailStack);

    this.advancedTexture.addControl(this.questPanel);
    this.advancedTexture.addControl(this.detailPanel);
  }

  private setActiveTab(tab: 'active' | 'completed' | 'stats') {
    this.activeTab = tab;
    this.selectedQuestId = null;
    this.hideDetailPanel();

    const inactive = { bg: "rgba(60, 60, 60, 0.8)", color: "#AAA" };
    const buttons = [
      { btn: this.activeTabBtn, active: tab === 'active', activeBg: "#4CAF50", activeColor: "white" },
      { btn: this.completedTabBtn, active: tab === 'completed', activeBg: "#FFD700", activeColor: "#000" },
      { btn: this.statsTabBtn, active: tab === 'stats', activeBg: "#9C27B0", activeColor: "white" },
    ];
    for (const { btn, active, activeBg, activeColor } of buttons) {
      if (btn) {
        btn.background = active ? activeBg : inactive.bg;
        btn.color = active ? activeColor : inactive.color;
      }
    }

    // Show/hide filter bar for stats tab
    if (this.filterBarPanel) {
      this.filterBarPanel.isVisible = tab !== 'stats';
    }

    this.updateQuestsDisplay();
  }

  public async updateQuests(worldId: string) {
    try {
      this.worldId = worldId;
      const response = await fetch(`/api/worlds/${worldId}/quests`);
      if (!response.ok) {
        throw new Error('Failed to fetch quests');
      }

      this.quests = await response.json();
      this.updateQuestsDisplay();
      this.updateWaypoints();
    } catch (error) {
      console.error('Failed to load quests:', error);
    }
  }

  public setPlayerPosition(position: Vector3) {
    this.playerPosition = position.clone();
  }

  private updateQuestsDisplay() {
    if (!this.questListPanel) return;

    this.questListPanel.clearControls();

    const allActive = this.quests.filter(q => q.status === 'active');
    const allCompleted = this.quests.filter(q => q.status === 'completed');

    // Update tab labels with counts
    if (this.activeTabBtn) this.activeTabBtn.textBlock!.text = `Active (${allActive.length})`;
    if (this.completedTabBtn) this.completedTabBtn.textBlock!.text = `Done (${allCompleted.length})`;

    if (this.activeTab === 'stats') {
      this.renderStatsTab();
      return;
    }

    // Determine base quests for current tab
    const baseQuests = this.activeTab === 'active' ? allActive : allCompleted;

    // Apply filters and sorting
    const filtered = filterQuests(baseQuests, this.filters);
    const sorted = sortQuests(filtered, this.sortBy);

    if (sorted.length === 0) {
      const emptyText = new TextBlock();
      emptyText.text = this.activeTab === 'active'
        ? "No active quests\n\nTalk to NPCs to receive quests!"
        : "No completed quests yet.";
      emptyText.color = "#888";
      emptyText.fontSize = 14;
      emptyText.height = "80px";
      emptyText.textWrapping = TextWrapping.WordWrap;
      emptyText.paddingTop = "20px";
      this.questListPanel.addControl(emptyText);
      return;
    }

    sorted.forEach((quest) => {
      this.questListPanel?.addControl(this.createQuestCard(quest));
    });
  }

  private createQuestCard(quest: Quest): Rectangle {
    const typeColor = getQuestTypeColor(quest.questType);
    const isTracked = this.trackedQuestId === quest.id;

    const card = new Rectangle(`quest-${quest.id}`);
    card.width = "95%";
    card.adaptHeightToChildren = true;
    card.background = quest.status === 'active'
      ? `${typeColor}22`  // very transparent type color tint
      : "rgba(80, 80, 80, 0.25)";
    card.color = isTracked ? "#FFD700" : typeColor;
    card.thickness = isTracked ? 2 : 1;
    card.cornerRadius = 6;
    card.paddingTop = "8px";
    card.paddingBottom = "8px";
    card.paddingLeft = "8px";
    card.paddingRight = "8px";

    // Click to select
    card.onPointerClickObservable.add(() => {
      this.selectedQuestId = quest.id;
      this.showDetailPanel(quest);
    });

    const cardStack = new StackPanel();
    cardStack.width = "100%";
    card.addControl(cardStack);

    // Title row with icon, title, and difficulty stars
    const titleRow = new StackPanel();
    titleRow.isVertical = false;
    titleRow.width = "100%";
    titleRow.height = "22px";
    cardStack.addControl(titleRow);

    const iconText = new TextBlock();
    iconText.text = getQuestIcon(quest.questType);
    iconText.fontSize = 14;
    iconText.width = "25px";
    iconText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    titleRow.addControl(iconText);

    const titleText = new TextBlock();
    titleText.text = quest.title;
    titleText.color = "white";
    titleText.fontSize = 13;
    titleText.fontWeight = "bold";
    titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    titleText.textWrapping = TextWrapping.Clip;
    titleText.width = "230px";
    titleRow.addControl(titleText);

    // Difficulty stars
    const stars = getDifficultyStars(quest.difficulty);
    const starsText = new TextBlock();
    starsText.text = "\u2605".repeat(stars) + "\u2606".repeat(3 - stars);
    starsText.color = getDifficultyColor(quest.difficulty);
    starsText.fontSize = 12;
    starsText.width = "60px";
    starsText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    titleRow.addControl(starsText);

    // Metadata row: XP reward + type badge + distance
    const metaRow = new StackPanel();
    metaRow.isVertical = false;
    metaRow.width = "100%";
    metaRow.height = "18px";
    metaRow.paddingTop = "3px";
    cardStack.addControl(metaRow);

    const rewardText = new TextBlock();
    rewardText.text = `${quest.experienceReward} XP`;
    rewardText.color = "#FFD700";
    rewardText.fontSize = 10;
    rewardText.width = "60px";
    rewardText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    metaRow.addControl(rewardText);

    const typeLabel = new TextBlock();
    typeLabel.text = quest.questType.replace(/_/g, ' ');
    typeLabel.color = typeColor;
    typeLabel.fontSize = 10;
    typeLabel.fontWeight = "bold";
    typeLabel.width = "120px";
    typeLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    metaRow.addControl(typeLabel);

    // Distance from player (if quest has location)
    const distance = this.getQuestDistance(quest);
    if (distance !== null) {
      const distText = new TextBlock();
      distText.text = formatDistance(distance);
      distText.color = "#AAA";
      distText.fontSize = 10;
      distText.width = "60px";
      distText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      metaRow.addControl(distText);
    }

    // Completed quest: show completion date and rewards
    if (quest.status === 'completed' && quest.completedAt) {
      const completedRow = new StackPanel();
      completedRow.isVertical = false;
      completedRow.width = "100%";
      completedRow.height = "16px";
      completedRow.paddingTop = "3px";
      cardStack.addControl(completedRow);

      const dateText = new TextBlock();
      const date = new Date(quest.completedAt);
      dateText.text = `Completed: ${date.toLocaleDateString()}`;
      dateText.color = "#4CAF50";
      dateText.fontSize = 10;
      dateText.width = "160px";
      dateText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      completedRow.addControl(dateText);

      const earnedText = new TextBlock();
      earnedText.text = `Earned: ${quest.experienceReward} XP`;
      earnedText.color = "#FFD700";
      earnedText.fontSize = 10;
      earnedText.width = "120px";
      earnedText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      completedRow.addControl(earnedText);
    }

    // Per-objective progress (for active quests with objectives)
    if (quest.status === 'active' && quest.objectives && quest.objectives.length > 0) {
      quest.objectives.forEach((obj, idx) => {
        const objRow = new StackPanel();
        objRow.isVertical = false;
        objRow.width = "100%";
        objRow.height = "16px";
        objRow.paddingTop = idx === 0 ? "5px" : "2px";
        cardStack.addControl(objRow);

        const checkText = new TextBlock();
        checkText.text = obj.completed ? "\u2713" : "\u25CB";
        checkText.color = obj.completed ? "#4CAF50" : "#888";
        checkText.fontSize = 11;
        checkText.width = "20px";
        checkText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        objRow.addControl(checkText);

        const objDesc = new TextBlock();
        const progressSuffix = (obj.required && obj.required > 1)
          ? ` (${obj.current ?? 0}/${obj.required})`
          : '';
        objDesc.text = (obj.description || obj.type.replace(/_/g, ' ')) + progressSuffix;
        objDesc.color = obj.completed ? "#4CAF50" : "#CCC";
        objDesc.fontSize = 10;
        objDesc.width = "300px";
        objDesc.textWrapping = TextWrapping.Clip;
        objDesc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        objRow.addControl(objDesc);
      });

      // Overall objectives progress bar
      const objectiveProgress = calculateObjectivesProgress(quest.objectives);
      this.addProgressBar(cardStack, objectiveProgress, typeColor);
    }
    // Fallback: criteria-based progress bar
    else if (quest.status === 'active' && quest.completionCriteria && quest.progress) {
      const progress = this.calculateProgress(quest);
      if (progress !== null) {
        this.addProgressBar(cardStack, progress, typeColor);
      }
    }

    return card;
  }

  private addProgressBar(parent: StackPanel, progress: number, color: string) {
    const container = new Rectangle();
    container.width = "100%";
    container.height = "14px";
    container.background = "rgba(40, 40, 40, 0.8)";
    container.cornerRadius = 3;
    container.thickness = 0;
    container.paddingTop = "4px";
    parent.addControl(container);

    const bar = new Rectangle();
    bar.width = `${Math.max(progress * 100, 2)}%`;
    bar.height = "14px";
    bar.background = color;
    bar.cornerRadius = 3;
    bar.thickness = 0;
    bar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    container.addControl(bar);

    const pctText = new TextBlock();
    pctText.text = `${Math.round(progress * 100)}%`;
    pctText.color = "white";
    pctText.fontSize = 9;
    pctText.fontWeight = "bold";
    container.addControl(pctText);
  }

  private showDetailPanel(quest: Quest) {
    if (!this.detailPanel || !this.detailStack) return;

    this.detailStack.clearControls();

    // Back button
    const backBtn = Button.CreateSimpleButton("backBtn", "\u2190 Back");
    backBtn.width = "80px";
    backBtn.height = "30px";
    backBtn.color = "white";
    backBtn.background = "rgba(80, 80, 80, 0.8)";
    backBtn.cornerRadius = 5;
    backBtn.fontSize = 13;
    backBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    backBtn.paddingLeft = "10px";
    backBtn.onPointerClickObservable.add(() => {
      this.hideDetailPanel();
    });
    this.detailStack.addControl(backBtn);

    const typeColor = getQuestTypeColor(quest.questType);

    // Title
    const title = new TextBlock();
    title.text = `${getQuestIcon(quest.questType)} ${quest.title}`;
    title.color = "white";
    title.fontSize = 16;
    title.fontWeight = "bold";
    title.height = "30px";
    title.paddingTop = "10px";
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    title.paddingLeft = "10px";
    this.detailStack.addControl(title);

    // Type + difficulty row
    const infoRow = new StackPanel();
    infoRow.isVertical = false;
    infoRow.width = "100%";
    infoRow.height = "22px";
    infoRow.paddingLeft = "10px";
    this.detailStack.addControl(infoRow);

    const typeBadge = new TextBlock();
    typeBadge.text = quest.questType.replace(/_/g, ' ').toUpperCase();
    typeBadge.color = typeColor;
    typeBadge.fontSize = 11;
    typeBadge.fontWeight = "bold";
    typeBadge.width = "150px";
    typeBadge.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    infoRow.addControl(typeBadge);

    const stars = getDifficultyStars(quest.difficulty);
    const diffText = new TextBlock();
    diffText.text = `${quest.difficulty.toUpperCase()} ${ "\u2605".repeat(stars)}`;
    diffText.color = getDifficultyColor(quest.difficulty);
    diffText.fontSize = 11;
    diffText.fontWeight = "bold";
    diffText.width = "150px";
    diffText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    infoRow.addControl(diffText);

    // Description
    const desc = new TextBlock();
    desc.text = quest.description;
    desc.color = "#CCC";
    desc.fontSize = 12;
    desc.textWrapping = TextWrapping.WordWrap;
    desc.resizeToFit = true;
    desc.paddingTop = "10px";
    desc.paddingLeft = "10px";
    desc.paddingRight = "10px";
    desc.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.detailStack.addControl(desc);

    // Assigner
    if (quest.assignedBy) {
      const assignerText = new TextBlock();
      assignerText.text = `From: ${quest.assignedBy}`;
      assignerText.color = "#AAA";
      assignerText.fontSize = 11;
      assignerText.height = "20px";
      assignerText.paddingTop = "5px";
      assignerText.paddingLeft = "10px";
      assignerText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      this.detailStack.addControl(assignerText);
    }

    // Location and distance
    const distance = this.getQuestDistance(quest);
    if (quest.locationName || distance !== null) {
      const locText = new TextBlock();
      const parts: string[] = [];
      if (quest.locationName) parts.push(quest.locationName);
      if (distance !== null) parts.push(formatDistance(distance) + ' away');
      locText.text = `Location: ${parts.join(' \u2022 ')}`;
      locText.color = "#AAA";
      locText.fontSize = 11;
      locText.height = "20px";
      locText.paddingLeft = "10px";
      locText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      this.detailStack.addControl(locText);
    }

    // Reward
    const rewardRow = new TextBlock();
    rewardRow.text = `Reward: ${quest.experienceReward} XP`;
    rewardRow.color = "#FFD700";
    rewardRow.fontSize = 12;
    rewardRow.fontWeight = "bold";
    rewardRow.height = "22px";
    rewardRow.paddingTop = "5px";
    rewardRow.paddingLeft = "10px";
    rewardRow.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.detailStack.addControl(rewardRow);

    // Objectives section header
    const objectivesHeader = new TextBlock();
    objectivesHeader.text = "OBJECTIVES";
    objectivesHeader.color = "#FFD700";
    objectivesHeader.fontSize = 12;
    objectivesHeader.fontWeight = "bold";
    objectivesHeader.height = "25px";
    objectivesHeader.paddingTop = "10px";
    objectivesHeader.paddingLeft = "10px";
    objectivesHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.detailStack.addControl(objectivesHeader);

    // Objectives list
    const objectives = quest.objectives || [];
    if (objectives.length > 0) {
      objectives.forEach((obj) => {
        const objRow = new StackPanel();
        objRow.isVertical = false;
        objRow.width = "100%";
        objRow.height = "22px";
        objRow.paddingLeft = "15px";
        this.detailStack!.addControl(objRow);

        const check = new TextBlock();
        check.text = obj.completed ? "\u2713" : "\u25CB";
        check.color = obj.completed ? "#4CAF50" : "#888";
        check.fontSize = 13;
        check.width = "20px";
        check.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        objRow.addControl(check);

        const objText = new TextBlock();
        const progressStr = (obj.required && obj.required > 1)
          ? ` (${obj.current ?? 0}/${obj.required})`
          : '';
        objText.text = (obj.description || obj.type.replace(/_/g, ' ')) + progressStr;
        objText.color = obj.completed ? "#4CAF50" : "#DDD";
        objText.fontSize = 12;
        objText.textWrapping = TextWrapping.WordWrap;
        objText.width = "310px";
        objText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        objRow.addControl(objText);

        // Per-objective progress bar if applicable
        if (!obj.completed && obj.required && obj.required > 1 && obj.current !== undefined) {
          const objProgress = Math.min(obj.current / obj.required, 1);
          const objBar = new Rectangle();
          objBar.width = "90%";
          objBar.height = "8px";
          objBar.background = "rgba(40, 40, 40, 0.8)";
          objBar.cornerRadius = 2;
          objBar.thickness = 0;
          objBar.paddingLeft = "35px";
          this.detailStack!.addControl(objBar);

          const objFill = new Rectangle();
          objFill.width = `${Math.max(objProgress * 100, 2)}%`;
          objFill.height = "8px";
          objFill.background = typeColor;
          objFill.cornerRadius = 2;
          objFill.thickness = 0;
          objFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
          objBar.addControl(objFill);
        }
      });
    } else {
      const noObj = new TextBlock();
      noObj.text = "No specific objectives listed.";
      noObj.color = "#888";
      noObj.fontSize = 11;
      noObj.height = "20px";
      noObj.paddingLeft = "15px";
      noObj.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      this.detailStack.addControl(noObj);
    }

    // Track button (active quests only)
    if (quest.status === 'active') {
      const isTracked = this.trackedQuestId === quest.id;
      const trackBtn = Button.CreateSimpleButton(
        "trackBtn",
        isTracked ? "\u2713 Tracking" : "Track Quest"
      );
      trackBtn.width = "140px";
      trackBtn.height = "35px";
      trackBtn.color = isTracked ? "#000" : "white";
      trackBtn.background = isTracked ? "#FFD700" : typeColor;
      trackBtn.cornerRadius = 5;
      trackBtn.fontSize = 13;
      trackBtn.fontWeight = "bold";
      trackBtn.paddingTop = "15px";
      trackBtn.onPointerClickObservable.add(() => {
        this.trackQuest(quest.id);
        this.showDetailPanel(quest); // refresh
        this.updateQuestsDisplay(); // refresh list too
      });
      this.detailStack.addControl(trackBtn);
    }

    // Completed quest: show completion info
    if (quest.status === 'completed' && quest.completedAt) {
      const completedInfo = new TextBlock();
      const date = new Date(quest.completedAt);
      completedInfo.text = `Completed on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
      completedInfo.color = "#4CAF50";
      completedInfo.fontSize = 12;
      completedInfo.height = "25px";
      completedInfo.paddingTop = "15px";
      completedInfo.paddingLeft = "10px";
      completedInfo.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      this.detailStack.addControl(completedInfo);

      const earnedXP = new TextBlock();
      earnedXP.text = `Earned: ${quest.experienceReward} XP`;
      earnedXP.color = "#FFD700";
      earnedXP.fontSize = 12;
      earnedXP.fontWeight = "bold";
      earnedXP.height = "22px";
      earnedXP.paddingLeft = "10px";
      earnedXP.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      this.detailStack.addControl(earnedXP);

      // Performance rating
      if (quest.performanceRating != null) {
        const perfText = new TextBlock();
        const fullStars = Math.round(quest.performanceRating);
        perfText.text = `Performance: ${ "\u2605".repeat(fullStars)}${"\u2606".repeat(5 - fullStars)}`;
        perfText.color = "#FFC107";
        perfText.fontSize = 12;
        perfText.height = "20px";
        perfText.paddingLeft = "10px";
        perfText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.detailStack.addControl(perfText);
      }

      // Time taken
      if (quest.assignedAt && quest.completedAt) {
        const msElapsed = new Date(quest.completedAt).getTime() - new Date(quest.assignedAt).getTime();
        const mins = Math.round(msElapsed / 60000);
        const timeText = new TextBlock();
        timeText.text = `Time taken: ${mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`}`;
        timeText.color = "#AAA";
        timeText.fontSize = 11;
        timeText.height = "18px";
        timeText.paddingLeft = "10px";
        timeText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.detailStack.addControl(timeText);
      }

      // Hints used
      if (quest.hintsUsed != null && quest.hintsUsed > 0) {
        const hintsText = new TextBlock();
        hintsText.text = `Hints used: ${quest.hintsUsed}`;
        hintsText.color = "#AAA";
        hintsText.fontSize = 11;
        hintsText.height = "18px";
        hintsText.paddingLeft = "10px";
        hintsText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.detailStack.addControl(hintsText);
      }

      // Vocabulary used
      if (quest.vocabularyUsed && quest.vocabularyUsed.length > 0) {
        const vocabLabel = new TextBlock();
        vocabLabel.text = `Vocabulary: ${quest.vocabularyUsed.join(', ')}`;
        vocabLabel.color = "#4CAF50";
        vocabLabel.fontSize = 11;
        vocabLabel.textWrapping = TextWrapping.WordWrap;
        vocabLabel.resizeToFit = true;
        vocabLabel.paddingLeft = "10px";
        vocabLabel.paddingRight = "10px";
        vocabLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.detailStack.addControl(vocabLabel);
      }

      // Grammar accuracy
      if (quest.grammarAccuracy != null) {
        const grammarText = new TextBlock();
        grammarText.text = `Grammar accuracy: ${Math.round(quest.grammarAccuracy * 100)}%`;
        grammarText.color = "#00BCD4";
        grammarText.fontSize = 11;
        grammarText.height = "18px";
        grammarText.paddingLeft = "10px";
        grammarText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.detailStack.addControl(grammarText);
      }
    }

    this.detailPanel.isVisible = true;
  }

  private rebuildFilterBar() {
    if (!this.filterBarPanel) return;
    this.filterBarPanel.clearControls();

    // Row 1: Sort buttons + search hint
    const sortRow = new StackPanel("sortRow");
    sortRow.isVertical = false;
    sortRow.width = "100%";
    sortRow.height = "26px";
    this.filterBarPanel.addControl(sortRow);

    const sortLabel = new TextBlock();
    sortLabel.text = "Sort:";
    sortLabel.color = "#AAA";
    sortLabel.fontSize = 10;
    sortLabel.width = "35px";
    sortLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    sortLabel.paddingLeft = "5px";
    sortRow.addControl(sortLabel);

    const sortOptions: { label: string; value: QuestSortBy }[] = [
      { label: "Recent", value: "recent" },
      { label: "Difficulty", value: "difficulty" },
      { label: "Reward", value: "reward" },
    ];

    for (const opt of sortOptions) {
      const btn = Button.CreateSimpleButton(`sort_${opt.value}`, opt.label);
      btn.width = "70px";
      btn.height = "22px";
      btn.fontSize = 10;
      btn.thickness = 0;
      btn.cornerRadius = 3;
      btn.color = this.sortBy === opt.value ? "white" : "#888";
      btn.background = this.sortBy === opt.value ? "rgba(100,100,100,0.8)" : "transparent";
      btn.onPointerClickObservable.add(() => {
        this.sortBy = opt.value;
        this.rebuildFilterBar();
        this.updateQuestsDisplay();
      });
      sortRow.addControl(btn);
    }

    // Row 2: Filter buttons (type cycling + difficulty cycling + clear)
    const filterRow = new StackPanel("filterRow");
    filterRow.isVertical = false;
    filterRow.width = "100%";
    filterRow.height = "26px";
    this.filterBarPanel.addControl(filterRow);

    // Quest type filter button
    const types = getUniqueQuestTypes(this.quests);
    const typeBtn = Button.CreateSimpleButton("filterType",
      this.filters.questType ? `Type: ${this.filters.questType}` : "All Types");
    typeBtn.width = "110px";
    typeBtn.height = "22px";
    typeBtn.fontSize = 10;
    typeBtn.thickness = 0;
    typeBtn.cornerRadius = 3;
    typeBtn.color = this.filters.questType ? "white" : "#888";
    typeBtn.background = this.filters.questType ? getQuestTypeColor(this.filters.questType) + "88" : "transparent";
    typeBtn.onPointerClickObservable.add(() => {
      if (!this.filters.questType) {
        this.filters.questType = types[0];
      } else {
        const idx = types.indexOf(this.filters.questType);
        this.filters.questType = idx < types.length - 1 ? types[idx + 1] : undefined;
      }
      this.rebuildFilterBar();
      this.updateQuestsDisplay();
    });
    filterRow.addControl(typeBtn);

    // Difficulty filter button
    const diffs = ['beginner', 'intermediate', 'advanced'];
    const diffBtn = Button.CreateSimpleButton("filterDiff",
      this.filters.difficulty ? `Diff: ${this.filters.difficulty}` : "All Diff");
    diffBtn.width = "100px";
    diffBtn.height = "22px";
    diffBtn.fontSize = 10;
    diffBtn.thickness = 0;
    diffBtn.cornerRadius = 3;
    diffBtn.color = this.filters.difficulty ? "white" : "#888";
    diffBtn.background = this.filters.difficulty ? getDifficultyColor(this.filters.difficulty) + "88" : "transparent";
    diffBtn.onPointerClickObservable.add(() => {
      if (!this.filters.difficulty) {
        this.filters.difficulty = diffs[0];
      } else {
        const idx = diffs.indexOf(this.filters.difficulty);
        this.filters.difficulty = idx < diffs.length - 1 ? diffs[idx + 1] : undefined;
      }
      this.rebuildFilterBar();
      this.updateQuestsDisplay();
    });
    filterRow.addControl(diffBtn);

    // NPC filter button
    const givers = getUniqueQuestGivers(this.quests);
    if (givers.length > 0) {
      const npcBtn = Button.CreateSimpleButton("filterNpc",
        this.filters.assignedBy ? `NPC: ${this.filters.assignedBy.substring(0, 8)}` : "All NPCs");
      npcBtn.width = "90px";
      npcBtn.height = "22px";
      npcBtn.fontSize = 10;
      npcBtn.thickness = 0;
      npcBtn.cornerRadius = 3;
      npcBtn.color = this.filters.assignedBy ? "white" : "#888";
      npcBtn.background = this.filters.assignedBy ? "rgba(100,100,100,0.8)" : "transparent";
      npcBtn.onPointerClickObservable.add(() => {
        if (!this.filters.assignedBy) {
          this.filters.assignedBy = givers[0];
        } else {
          const idx = givers.indexOf(this.filters.assignedBy);
          this.filters.assignedBy = idx < givers.length - 1 ? givers[idx + 1] : undefined;
        }
        this.rebuildFilterBar();
        this.updateQuestsDisplay();
      });
      filterRow.addControl(npcBtn);
    }

    // Clear all filters button
    const hasFilters = this.filters.questType || this.filters.difficulty || this.filters.assignedBy || this.filters.search;
    if (hasFilters) {
      const clearBtn = Button.CreateSimpleButton("clearFilters", "\u2715");
      clearBtn.width = "30px";
      clearBtn.height = "22px";
      clearBtn.fontSize = 12;
      clearBtn.thickness = 0;
      clearBtn.cornerRadius = 3;
      clearBtn.color = "#F44336";
      clearBtn.background = "transparent";
      clearBtn.onPointerClickObservable.add(() => {
        this.filters = {};
        this.rebuildFilterBar();
        this.updateQuestsDisplay();
      });
      filterRow.addControl(clearBtn);
    }

    // Row 3: Search display (show current search term if any)
    if (this.filters.search) {
      const searchRow = new StackPanel("searchRow");
      searchRow.isVertical = false;
      searchRow.width = "100%";
      searchRow.height = "22px";
      this.filterBarPanel.addControl(searchRow);

      const searchText = new TextBlock();
      searchText.text = `Search: "${this.filters.search}"`;
      searchText.color = "#AAA";
      searchText.fontSize = 10;
      searchText.width = "300px";
      searchText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      searchText.paddingLeft = "10px";
      searchRow.addControl(searchText);
    }
  }

  private renderStatsTab() {
    if (!this.questListPanel) return;

    const stats = computeQuestStats(this.quests);

    // Title
    const title = new TextBlock();
    title.text = "Quest Statistics";
    title.color = "#FFD700";
    title.fontSize = 16;
    title.fontWeight = "bold";
    title.height = "30px";
    title.paddingTop = "10px";
    this.questListPanel.addControl(title);

    // Summary stats
    const summaryItems = [
      { label: "Total Completed", value: `${stats.totalCompleted}`, color: "#4CAF50" },
      { label: "Active Quests", value: `${stats.totalActive}`, color: "#2196F3" },
      { label: "Failed / Abandoned", value: `${stats.totalFailed} / ${stats.totalAbandoned}`, color: "#F44336" },
      { label: "Completion Rate", value: `${Math.round(stats.completionRate * 100)}%`, color: "#FFC107" },
      { label: "Avg Performance", value: stats.averagePerformance > 0 ? `${stats.averagePerformance.toFixed(1)} / 5` : "N/A", color: "#FFC107" },
      { label: "Total XP Earned", value: `${stats.totalXpEarned}`, color: "#FFD700" },
      { label: "Vocabulary Learned", value: `${stats.vocabularyWordsLearned} words`, color: "#4CAF50" },
      { label: "Grammar Quests", value: `${stats.grammarPatternsCount}`, color: "#00BCD4" },
    ];

    for (const item of summaryItems) {
      const row = new StackPanel();
      row.isVertical = false;
      row.width = "100%";
      row.height = "24px";
      row.paddingLeft = "15px";
      this.questListPanel.addControl(row);

      const label = new TextBlock();
      label.text = item.label;
      label.color = "#AAA";
      label.fontSize = 12;
      label.width = "180px";
      label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      row.addControl(label);

      const value = new TextBlock();
      value.text = item.value;
      value.color = item.color;
      value.fontSize = 12;
      value.fontWeight = "bold";
      value.width = "150px";
      value.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      row.addControl(value);
    }

    // Quests by type breakdown
    const typeHeader = new TextBlock();
    typeHeader.text = "BY TYPE";
    typeHeader.color = "#FFD700";
    typeHeader.fontSize = 12;
    typeHeader.fontWeight = "bold";
    typeHeader.height = "28px";
    typeHeader.paddingTop = "12px";
    typeHeader.paddingLeft = "15px";
    typeHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.questListPanel.addControl(typeHeader);

    for (const [type, count] of Object.entries(stats.questsByType)) {
      const row = new StackPanel();
      row.isVertical = false;
      row.width = "100%";
      row.height = "20px";
      row.paddingLeft = "20px";
      this.questListPanel.addControl(row);

      const typeLabel = new TextBlock();
      typeLabel.text = `${getQuestIcon(type)} ${type.replace(/_/g, ' ')}`;
      typeLabel.color = getQuestTypeColor(type);
      typeLabel.fontSize = 11;
      typeLabel.width = "200px";
      typeLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      row.addControl(typeLabel);

      const countText = new TextBlock();
      countText.text = `${count}`;
      countText.color = "#CCC";
      countText.fontSize = 11;
      countText.width = "50px";
      countText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      row.addControl(countText);
    }

    // Quests by difficulty breakdown
    const diffHeader = new TextBlock();
    diffHeader.text = "BY DIFFICULTY";
    diffHeader.color = "#FFD700";
    diffHeader.fontSize = 12;
    diffHeader.fontWeight = "bold";
    diffHeader.height = "28px";
    diffHeader.paddingTop = "12px";
    diffHeader.paddingLeft = "15px";
    diffHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.questListPanel.addControl(diffHeader);

    for (const [diff, count] of Object.entries(stats.questsByDifficulty)) {
      const row = new StackPanel();
      row.isVertical = false;
      row.width = "100%";
      row.height = "20px";
      row.paddingLeft = "20px";
      this.questListPanel.addControl(row);

      const diffLabel = new TextBlock();
      const stars = getDifficultyStars(diff);
      diffLabel.text = `${diff} ${"\u2605".repeat(stars)}`;
      diffLabel.color = getDifficultyColor(diff);
      diffLabel.fontSize = 11;
      diffLabel.width = "200px";
      diffLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      row.addControl(diffLabel);

      const countText = new TextBlock();
      countText.text = `${count}`;
      countText.color = "#CCC";
      countText.fontSize = 11;
      countText.width = "50px";
      countText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      row.addControl(countText);
    }
  }

  private hideDetailPanel() {
    if (this.detailPanel) {
      this.detailPanel.isVisible = false;
    }
    this.selectedQuestId = null;
  }

  /** Track a quest — activates waypoints for its objectives */
  public trackQuest(questId: string) {
    if (this.trackedQuestId === questId) {
      // Untrack
      this.trackedQuestId = null;
      this.waypointManager.clearAll();
    } else {
      this.trackedQuestId = questId;
      this.updateWaypointsForTrackedQuest();
    }
  }

  private getQuestDistance(quest: Quest): number | null {
    // Try to find a position from objectives
    const objectives = quest.objectives || [];
    for (const obj of objectives) {
      if (obj.completed) continue;
      const pos = obj.position || obj.locationPosition;
      if (pos) {
        const target = new Vector3(pos.x || 0, pos.y || 0, pos.z || 0);
        return Vector3.Distance(this.playerPosition, target);
      }
    }

    // Try completionCriteria objectives
    if (quest.completionCriteria?.objectives) {
      const criteriaObjs = Array.isArray(quest.completionCriteria.objectives)
        ? quest.completionCriteria.objectives : [];
      for (const obj of criteriaObjs) {
        if (obj.completed) continue;
        const pos = obj.position || obj.locationPosition;
        if (pos) {
          const target = new Vector3(pos.x || 0, pos.y || 0, pos.z || 0);
          return Vector3.Distance(this.playerPosition, target);
        }
      }
    }

    return null;
  }

  private calculateProgress(quest: Quest): number | null {
    if (!quest.completionCriteria || !quest.progress) return null;

    // Check Prolog-based completion (async, fire-and-forget for UI update)
    if (this.prologEngine && quest.status === 'active') {
      this.evaluateQuestCompletion(quest.id).then(complete => {
        if (complete && quest.status === 'active') {
          console.log(`[BabylonQuestTracker] Prolog reports quest "${quest.title}" is complete`);
        }
      }).catch(() => { /* non-fatal */ });
    }

    return calculateCriteriaProgress(quest.completionCriteria, quest.progress);
  }

  private getQuestIcon(questType: string): string {
    switch (questType) {
      // Language learning
      case 'conversation': return '💬';
      case 'translation': return '🔄';
      case 'vocabulary': return '📚';
      case 'grammar': return '📝';
      case 'cultural': return '🌍';
      case 'listening_comprehension': return '🎧';
      case 'translation_challenge': return '🔄';
      case 'navigation': return '🧭';

      // RPG
      case 'combat': return '⚔️';
      case 'collection': return '📦';
      case 'exploration': return '🗺️';
      case 'escort': return '🛡️';
      case 'delivery': return '📨';
      case 'crafting': return '🔨';
      case 'social': return '🤝';

      default: return '🎯';
    }
  }

  private getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      // Language learning
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FFC107';
      case 'advanced': return '#F44336';

      // RPG
      case 'easy': return '#4CAF50';
      case 'normal': return '#FFC107';
      case 'hard': return '#F44336';
      case 'legendary': return '#9C27B0'; // Purple

      default: return '#888';
    }
  }

  public show() {
    this.isVisible = true;
    if (this.questPanel) {
      this.questPanel.isVisible = true;
    }
  }

  public hide() {
    this.isVisible = false;
    if (this.questPanel) {
      this.questPanel.isVisible = false;
    }
    this.hideDetailPanel();
  }

  public toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  private toggleMinimize() {
    if (!this.questPanel) return;

    this.isMinimized = !this.isMinimized;

    if (this.isMinimized) {
      this.questPanel.height = "50px";
      this.hideDetailPanel();
    } else {
      this.questPanel.height = "500px";
    }
  }

  public setOnClose(callback: () => void) {
    this.onClose = callback;
  }

  public setPrologEngine(engine: GamePrologEngine): void {
    this.prologEngine = engine;
  }

  public async evaluateQuestCompletion(questId: string): Promise<boolean> {
    if (!this.prologEngine) return false;
    try {
      return await this.prologEngine.isQuestComplete(questId, this.playerId);
    } catch {
      return false;
    }
  }

  public async isQuestAvailable(questId: string): Promise<boolean> {
    if (!this.prologEngine) return true;
    try {
      return await this.prologEngine.isQuestAvailable(questId, this.playerId);
    } catch {
      return true;
    }
  }

  private updateWaypoints() {
    // If tracking a specific quest, only show its waypoints
    if (this.trackedQuestId) {
      this.updateWaypointsForTrackedQuest();
      return;
    }

    if (!this.showWaypoints) {
      this.waypointManager.clearAll();
      return;
    }

    this.waypointManager.clearAll();

    const activeQuests = this.quests.filter(q => q.status === 'active');

    activeQuests.forEach(quest => {
      this.createWaypointsForQuest(quest);
    });

    console.log(`[BabylonQuestTracker] Updated ${this.waypointManager.getWaypointCount()} waypoints`);
  }

  private updateWaypointsForTrackedQuest() {
    this.waypointManager.clearAll();

    if (!this.trackedQuestId) return;

    const quest = this.quests.find(q => q.id === this.trackedQuestId);
    if (!quest) return;

    this.createWaypointsForQuest(quest);
    console.log(`[BabylonQuestTracker] Tracking "${quest.title}" with ${this.waypointManager.getWaypointCount()} waypoints`);
  }

  private createWaypointsForQuest(quest: Quest) {
    // From objectives array
    if (quest.objectives) {
      quest.objectives.forEach((obj, index) => {
        if (obj.completed) return;
        const pos = obj.position || obj.locationPosition;
        if (pos) {
          const position = new Vector3(pos.x || 0, pos.y || 0, pos.z || 0);
          this.waypointManager.createWaypointForObjectiveType(
            `${quest.id}_obj_${index}`,
            position,
            obj.type || quest.questType
          );
        }
      });
    }

    // From completionCriteria objectives
    if (quest.completionCriteria?.objectives) {
      const criteriaObjs = Array.isArray(quest.completionCriteria.objectives)
        ? quest.completionCriteria.objectives : [];

      criteriaObjs.forEach((objective: any, index: number) => {
        if (objective.completed) return;
        const objectiveId = `${quest.id}_cobj_${index}`;
        const pos = objective.position || objective.locationPosition;
        if (pos) {
          const position = new Vector3(pos.x || 0, pos.y || 0, pos.z || 0);
          this.waypointManager.createWaypointForObjectiveType(
            objectiveId,
            position,
            objective.type || quest.questType
          );
        }
      });
    }
  }

  public toggleWaypoints(): boolean {
    this.showWaypoints = !this.showWaypoints;

    if (this.showWaypoints) {
      this.updateWaypoints();
    } else {
      this.waypointManager.clearAll();
    }

    return this.showWaypoints;
  }

  public setWaypointsVisible(visible: boolean) {
    this.showWaypoints = visible;

    if (visible) {
      this.updateWaypoints();
    } else {
      this.waypointManager.clearAll();
    }
  }

  public getWaypointManager(): QuestWaypointManager {
    return this.waypointManager;
  }

  public getTrackedQuestId(): string | null {
    return this.trackedQuestId;
  }

  public getSelectedQuestId(): string | null {
    return this.selectedQuestId;
  }

  public getActiveTab(): 'active' | 'completed' | 'stats' {
    return this.activeTab;
  }

  /** Set search filter and refresh display */
  public setSearch(term: string) {
    this.filters.search = term || undefined;
    this.rebuildFilterBar();
    this.updateQuestsDisplay();
  }

  /** Get current filters (for testing) */
  public getFilters(): QuestFilters {
    return { ...this.filters };
  }

  /** Get current sort (for testing) */
  public getSortBy(): QuestSortBy {
    return this.sortBy;
  }

  public dispose() {
    if (this.questPanel) {
      this.advancedTexture.removeControl(this.questPanel);
    }
    if (this.detailPanel) {
      this.advancedTexture.removeControl(this.detailPanel);
    }
    this.waypointManager.dispose();
  }
}
