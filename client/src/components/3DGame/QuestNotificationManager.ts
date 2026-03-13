/**
 * Quest Notification Manager
 *
 * Subscribes to GameEventBus quest events and provides:
 * 1. Styled in-game toast notifications for quest state changes
 * 2. A compact always-visible HUD indicator showing active quest count + tracked quest progress
 */

import {
  AdvancedDynamicTexture,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
  TextWrapping,
} from "@babylonjs/gui";
import type { GameEventBus, GameEvent } from "./GameEventBus";

// ── Toast config per event type ─────────────────────────────────────────────

interface QuestToastConfig {
  icon: string;
  color: string;        // border / accent color
  background: string;   // panel background
  duration: number;      // ms
}

const TOAST_CONFIGS: Record<string, QuestToastConfig> = {
  quest_accepted: {
    icon: "📜",
    color: "#4CAF50",
    background: "rgba(20, 60, 20, 0.95)",
    duration: 4000,
  },
  quest_completed: {
    icon: "🏆",
    color: "#FFD700",
    background: "rgba(60, 50, 10, 0.95)",
    duration: 5000,
  },
  quest_failed: {
    icon: "💀",
    color: "#F44336",
    background: "rgba(60, 15, 15, 0.95)",
    duration: 4000,
  },
  quest_abandoned: {
    icon: "🚫",
    color: "#888",
    background: "rgba(40, 40, 40, 0.95)",
    duration: 3000,
  },
  utterance_quest_progress: {
    icon: "📊",
    color: "#2196F3",
    background: "rgba(15, 30, 60, 0.95)",
    duration: 2500,
  },
  utterance_quest_completed: {
    icon: "✅",
    color: "#4CAF50",
    background: "rgba(20, 60, 20, 0.95)",
    duration: 4000,
  },
};

// ── Types ───────────────────────────────────────────────────────────────────

interface ActiveQuestInfo {
  id: string;
  title: string;
  progress?: number; // 0-1
}

// ── Manager ─────────────────────────────────────────────────────────────────

export class QuestNotificationManager {
  private advancedTexture: AdvancedDynamicTexture;
  private eventBus: GameEventBus;

  // Toast system
  private toastContainer: StackPanel | null = null;
  private toastIdCounter = 0;
  private activeToasts = new Map<string, Rectangle>();

  // HUD indicator
  private hudContainer: Rectangle | null = null;
  private hudCountText: TextBlock | null = null;
  private hudTrackedTitle: TextBlock | null = null;
  private hudProgressBar: Rectangle | null = null;
  private hudProgressFill: Rectangle | null = null;
  private hudProgressText: TextBlock | null = null;

  // State
  private activeQuestCount = 0;
  private trackedQuest: ActiveQuestInfo | null = null;

  // Event unsubscribe functions
  private unsubscribers: Array<() => void> = [];

  // Callback when HUD indicator is clicked
  private onHudClicked: (() => void) | null = null;

  constructor(advancedTexture: AdvancedDynamicTexture, eventBus: GameEventBus) {
    this.advancedTexture = advancedTexture;
    this.eventBus = eventBus;

    this.createToastContainer();
    this.createHudIndicator();
    this.subscribeToEvents();
  }

  // ── Toast Container ─────────────────────────────────────────────────────

  private createToastContainer(): void {
    this.toastContainer = new StackPanel("questToastContainer");
    this.toastContainer.width = "380px";
    this.toastContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.toastContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.toastContainer.top = "20px";
    this.advancedTexture.addControl(this.toastContainer);
  }

  // ── HUD Indicator ─────────────────────────────────────────────────────

  private createHudIndicator(): void {
    // Compact pill in top-left showing quest status
    this.hudContainer = new Rectangle("questHudIndicator");
    this.hudContainer.width = "200px";
    this.hudContainer.height = "50px";
    this.hudContainer.background = "rgba(0, 0, 0, 0.75)";
    this.hudContainer.color = "#FFD700";
    this.hudContainer.thickness = 1;
    this.hudContainer.cornerRadius = 8;
    this.hudContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.hudContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.hudContainer.top = "10px";
    this.hudContainer.left = "10px";
    this.hudContainer.isPointerBlocker = true;
    this.hudContainer.onPointerClickObservable.add(() => {
      this.onHudClicked?.();
    });

    const mainStack = new StackPanel("questHudStack");
    mainStack.width = "100%";
    mainStack.paddingLeft = "10px";
    mainStack.paddingRight = "10px";
    this.hudContainer.addControl(mainStack);

    // Top row: icon + quest count
    const topRow = new StackPanel("questHudTopRow");
    topRow.isVertical = false;
    topRow.width = "100%";
    topRow.height = "24px";
    mainStack.addControl(topRow);

    const iconText = new TextBlock("questHudIcon");
    iconText.text = "🎯";
    iconText.fontSize = 14;
    iconText.width = "25px";
    iconText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    topRow.addControl(iconText);

    this.hudCountText = new TextBlock("questHudCount");
    this.hudCountText.text = "0 Active Quests";
    this.hudCountText.color = "#FFD700";
    this.hudCountText.fontSize = 12;
    this.hudCountText.fontWeight = "bold";
    this.hudCountText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.hudCountText.width = "155px";
    topRow.addControl(this.hudCountText);

    // Tracked quest title
    this.hudTrackedTitle = new TextBlock("questHudTracked");
    this.hudTrackedTitle.text = "";
    this.hudTrackedTitle.color = "#CCC";
    this.hudTrackedTitle.fontSize = 10;
    this.hudTrackedTitle.height = "14px";
    this.hudTrackedTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.hudTrackedTitle.textWrapping = TextWrapping.Clip;
    mainStack.addControl(this.hudTrackedTitle);

    // Progress bar
    this.hudProgressBar = new Rectangle("questHudProgressBg");
    this.hudProgressBar.width = "100%";
    this.hudProgressBar.height = "6px";
    this.hudProgressBar.background = "rgba(255, 255, 255, 0.15)";
    this.hudProgressBar.cornerRadius = 3;
    this.hudProgressBar.thickness = 0;
    this.hudProgressBar.isVisible = false;
    mainStack.addControl(this.hudProgressBar);

    this.hudProgressFill = new Rectangle("questHudProgressFill");
    this.hudProgressFill.width = "0%";
    this.hudProgressFill.height = "6px";
    this.hudProgressFill.background = "#4CAF50";
    this.hudProgressFill.cornerRadius = 3;
    this.hudProgressFill.thickness = 0;
    this.hudProgressFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.hudProgressBar.addControl(this.hudProgressFill);

    this.advancedTexture.addControl(this.hudContainer);
  }

  // ── Event Subscriptions ───────────────────────────────────────────────

  private subscribeToEvents(): void {
    this.unsubscribers.push(
      this.eventBus.on("quest_accepted", (e) => {
        this.showQuestToast("quest_accepted", "New Quest!", e.questTitle);
        this.activeQuestCount++;
        this.setTrackedQuest({ id: e.questId, title: e.questTitle, progress: 0 });
        this.updateHud();
      }),

      this.eventBus.on("quest_completed", (e) => {
        this.showQuestToast("quest_completed", "Quest Complete!", `Quest ${e.questId} completed`);
        this.activeQuestCount = Math.max(0, this.activeQuestCount - 1);
        if (this.trackedQuest?.id === e.questId) {
          this.trackedQuest = null;
        }
        this.updateHud();
      }),

      this.eventBus.on("quest_failed", (e) => {
        this.showQuestToast("quest_failed", "Quest Failed", `Quest ${e.questId} failed`);
        this.activeQuestCount = Math.max(0, this.activeQuestCount - 1);
        if (this.trackedQuest?.id === e.questId) {
          this.trackedQuest = null;
        }
        this.updateHud();
      }),

      this.eventBus.on("quest_abandoned", (e) => {
        this.showQuestToast("quest_abandoned", "Quest Abandoned", `Quest ${e.questId} abandoned`);
        this.activeQuestCount = Math.max(0, this.activeQuestCount - 1);
        if (this.trackedQuest?.id === e.questId) {
          this.trackedQuest = null;
        }
        this.updateHud();
      }),

      this.eventBus.on("utterance_quest_progress", (e) => {
        const pct = Math.round(e.percentage);
        this.showQuestToast(
          "utterance_quest_progress",
          "Quest Progress",
          `${pct}% complete (${e.current}/${e.required})`
        );
        if (this.trackedQuest?.id === e.questId) {
          this.trackedQuest.progress = e.percentage / 100;
          this.updateHud();
        }
      }),

      this.eventBus.on("utterance_quest_completed", (e) => {
        this.showQuestToast(
          "utterance_quest_completed",
          "Objective Complete!",
          `+${e.xpAwarded} XP (Score: ${e.finalScore})`
        );
      }),
    );
  }

  // ── Toast Display ─────────────────────────────────────────────────────

  private showQuestToast(eventType: string, title: string, description: string): void {
    if (!this.toastContainer) return;

    const config = TOAST_CONFIGS[eventType] || TOAST_CONFIGS.quest_accepted;
    const toastId = `questToast_${this.toastIdCounter++}`;

    const toast = new Rectangle(toastId);
    toast.width = "360px";
    toast.height = "70px";
    toast.background = config.background;
    toast.color = config.color;
    toast.thickness = 2;
    toast.cornerRadius = 8;
    toast.paddingTop = "5px";
    toast.paddingBottom = "5px";

    const row = new StackPanel();
    row.isVertical = false;
    row.width = "100%";
    row.height = "100%";
    toast.addControl(row);

    // Icon
    const icon = new TextBlock();
    icon.text = config.icon;
    icon.fontSize = 24;
    icon.width = "45px";
    row.addControl(icon);

    // Text column
    const textCol = new StackPanel();
    textCol.width = "300px";
    textCol.paddingRight = "10px";
    row.addControl(textCol);

    const titleText = new TextBlock();
    titleText.text = title;
    titleText.color = config.color;
    titleText.fontSize = 15;
    titleText.fontWeight = "bold";
    titleText.height = "24px";
    titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    textCol.addControl(titleText);

    const descText = new TextBlock();
    descText.text = description;
    descText.color = "rgba(255, 255, 255, 0.85)";
    descText.fontSize = 12;
    descText.height = "30px";
    descText.textWrapping = TextWrapping.WordWrap;
    descText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    textCol.addControl(descText);

    this.toastContainer.addControl(toast);
    this.activeToasts.set(toastId, toast);

    // Auto-dismiss
    setTimeout(() => {
      this.dismissToast(toastId);
    }, config.duration);
  }

  private dismissToast(toastId: string): void {
    const toast = this.activeToasts.get(toastId);
    if (toast && this.toastContainer) {
      this.toastContainer.removeControl(toast);
      this.activeToasts.delete(toastId);
      toast.dispose();
    }
  }

  // ── HUD Updates ───────────────────────────────────────────────────────

  private updateHud(): void {
    if (this.hudCountText) {
      const label = this.activeQuestCount === 1 ? "Active Quest" : "Active Quests";
      this.hudCountText.text = `${this.activeQuestCount} ${label}`;
    }

    if (this.trackedQuest) {
      if (this.hudTrackedTitle) {
        this.hudTrackedTitle.text = this.trackedQuest.title;
      }
      if (this.hudProgressBar && this.hudProgressFill) {
        this.hudProgressBar.isVisible = true;
        const pct = Math.round((this.trackedQuest.progress ?? 0) * 100);
        this.hudProgressFill.width = `${pct}%`;
      }
    } else {
      if (this.hudTrackedTitle) {
        this.hudTrackedTitle.text = this.activeQuestCount > 0 ? "Click to view quests" : "No active quests";
      }
      if (this.hudProgressBar) {
        this.hudProgressBar.isVisible = false;
      }
    }
  }

  // ── Public API ────────────────────────────────────────────────────────

  /** Set the active quest count (e.g. after loading quests from server). */
  public setActiveQuestCount(count: number): void {
    this.activeQuestCount = count;
    this.updateHud();
  }

  /** Set the currently tracked quest shown in the HUD. */
  public setTrackedQuest(quest: ActiveQuestInfo | null): void {
    this.trackedQuest = quest;
    this.updateHud();
  }

  /** Register callback when HUD indicator is clicked. */
  public setOnHudClicked(callback: () => void): void {
    this.onHudClicked = callback;
  }

  /** Show/hide the HUD indicator. */
  public setHudVisible(visible: boolean): void {
    if (this.hudContainer) {
      this.hudContainer.isVisible = visible;
    }
  }

  /** Clean up all subscriptions and UI elements. */
  public dispose(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];

    // Dismiss remaining toasts
    this.activeToasts.forEach((_toast, id) => {
      this.dismissToast(id);
    });

    if (this.toastContainer) {
      this.advancedTexture.removeControl(this.toastContainer);
      this.toastContainer.dispose();
      this.toastContainer = null;
    }

    if (this.hudContainer) {
      this.advancedTexture.removeControl(this.hudContainer);
      this.hudContainer.dispose();
      this.hudContainer = null;
    }
  }
}
