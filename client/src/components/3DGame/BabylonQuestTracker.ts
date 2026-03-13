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
  private activeTab: 'active' | 'completed' = 'active';
  private activeTabBtn: Button | null = null;
  private completedTabBtn: Button | null = null;

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
    this.activeTabBtn.width = "50%";
    this.activeTabBtn.height = "35px";
    this.activeTabBtn.color = "white";
    this.activeTabBtn.background = "#4CAF50";
    this.activeTabBtn.fontSize = 13;
    this.activeTabBtn.fontWeight = "bold";
    this.activeTabBtn.thickness = 0;
    this.activeTabBtn.onPointerClickObservable.add(() => {
      this.setActiveTab('active');
    });
    tabBar.addControl(this.activeTabBtn);

    this.completedTabBtn = Button.CreateSimpleButton("completedTab", "Completed");
    this.completedTabBtn.width = "50%";
    this.completedTabBtn.height = "35px";
    this.completedTabBtn.color = "#AAA";
    this.completedTabBtn.background = "rgba(60, 60, 60, 0.8)";
    this.completedTabBtn.fontSize = 13;
    this.completedTabBtn.fontWeight = "bold";
    this.completedTabBtn.thickness = 0;
    this.completedTabBtn.onPointerClickObservable.add(() => {
      this.setActiveTab('completed');
    });
    tabBar.addControl(this.completedTabBtn);

    // Quest list scroll area
    this.scrollViewer = new ScrollViewer("questScroll");
    this.scrollViewer.width = "100%";
    this.scrollViewer.height = "415px";
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

  private setActiveTab(tab: 'active' | 'completed') {
    this.activeTab = tab;
    this.selectedQuestId = null;
    this.hideDetailPanel();

    if (this.activeTabBtn && this.completedTabBtn) {
      if (tab === 'active') {
        this.activeTabBtn.background = "#4CAF50";
        this.activeTabBtn.color = "white";
        this.completedTabBtn.background = "rgba(60, 60, 60, 0.8)";
        this.completedTabBtn.color = "#AAA";
      } else {
        this.completedTabBtn.background = "#FFD700";
        this.completedTabBtn.color = "#000";
        this.activeTabBtn.background = "rgba(60, 60, 60, 0.8)";
        this.activeTabBtn.color = "#AAA";
      }
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

    const activeQuests = this.quests.filter(q => q.status === 'active');
    const completedQuests = this.quests.filter(q => q.status === 'completed');

    if (this.activeTab === 'active') {
      // Update tab label with count
      if (this.activeTabBtn) {
        this.activeTabBtn.textBlock!.text = `Active (${activeQuests.length})`;
      }
      if (this.completedTabBtn) {
        this.completedTabBtn.textBlock!.text = `Completed (${completedQuests.length})`;
      }

      if (activeQuests.length === 0) {
        const emptyText = new TextBlock();
        emptyText.text = "No active quests\n\nTalk to NPCs to receive quests!";
        emptyText.color = "#888";
        emptyText.fontSize = 14;
        emptyText.height = "80px";
        emptyText.textWrapping = TextWrapping.WordWrap;
        emptyText.paddingTop = "20px";
        this.questListPanel.addControl(emptyText);
        return;
      }

      activeQuests.forEach((quest) => {
        this.questListPanel?.addControl(this.createQuestCard(quest));
      });
    } else {
      // Update tab labels
      if (this.activeTabBtn) {
        this.activeTabBtn.textBlock!.text = `Active (${activeQuests.length})`;
      }
      if (this.completedTabBtn) {
        this.completedTabBtn.textBlock!.text = `Completed (${completedQuests.length})`;
      }

      if (completedQuests.length === 0) {
        const emptyText = new TextBlock();
        emptyText.text = "No completed quests yet.";
        emptyText.color = "#888";
        emptyText.fontSize = 14;
        emptyText.height = "50px";
        emptyText.textWrapping = TextWrapping.WordWrap;
        emptyText.paddingTop = "20px";
        this.questListPanel.addControl(emptyText);
        return;
      }

      completedQuests.forEach((quest) => {
        this.questListPanel?.addControl(this.createQuestCard(quest));
      });
    }
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
    }

    this.detailPanel.isVisible = true;
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

  public getActiveTab(): 'active' | 'completed' {
    return this.activeTab;
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
