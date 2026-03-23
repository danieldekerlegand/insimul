/**
 * Quest Language Feedback Panel
 *
 * Compact Babylon.js GUI overlay that displays real-time grammar and vocabulary
 * feedback during active language-learning quests. Shows vocabulary progress,
 * grammar accuracy, and scrolling feedback items.
 */

import {
  AdvancedDynamicTexture,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
  TextWrapping,
} from "@babylonjs/gui";
import type {
  QuestLanguageFeedbackState,
  FeedbackItem,
} from "@shared/language/quest-language-feedback";

const PANEL_WIDTH = 280;
const PANEL_BG = "rgba(10, 15, 30, 0.88)";
const ACCENT_VOCAB = "#42A5F5";
const ACCENT_GRAMMAR = "#66BB6A";
const ACCENT_ERROR = "#FFC107";
const ACCENT_MILESTONE = "#FFD700";
const FEEDBACK_TTL = 8000; // ms before a feedback item fades

interface ActiveFeedbackRow {
  container: Rectangle;
  expiry: number;
}

export class QuestLanguageFeedbackPanel {
  private advancedTexture: AdvancedDynamicTexture;
  private rootContainer: Rectangle | null = null;

  // Sub-elements
  private titleText: TextBlock | null = null;
  private vocabProgressFill: Rectangle | null = null;
  private vocabProgressText: TextBlock | null = null;
  private grammarProgressFill: Rectangle | null = null;
  private grammarProgressText: TextBlock | null = null;
  private feedbackStack: StackPanel | null = null;

  // Active feedback rows with auto-cleanup
  private activeFeedbackRows: ActiveFeedbackRow[] = [];
  private cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

  private visible = false;

  constructor(advancedTexture: AdvancedDynamicTexture) {
    this.advancedTexture = advancedTexture;
    this.buildPanel();
    this.startCleanupLoop();
  }

  // ── Panel Construction ──────────────────────────────────────────────────

  private buildPanel(): void {
    // Root container — bottom-left of screen
    this.rootContainer = new Rectangle("questLangFeedback");
    this.rootContainer.width = `${PANEL_WIDTH}px`;
    this.rootContainer.adaptHeightToChildren = true;
    this.rootContainer.background = PANEL_BG;
    this.rootContainer.color = "#555";
    this.rootContainer.thickness = 1;
    this.rootContainer.cornerRadius = 6;
    this.rootContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.rootContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.rootContainer.left = "10px";
    this.rootContainer.top = "-70px";
    this.rootContainer.isVisible = false;
    this.advancedTexture.addControl(this.rootContainer);

    const mainStack = new StackPanel("qlf_main");
    mainStack.width = "100%";
    mainStack.paddingTop = "8px";
    mainStack.paddingBottom = "8px";
    mainStack.paddingLeft = "10px";
    mainStack.paddingRight = "10px";
    this.rootContainer.addControl(mainStack);

    // Title
    this.titleText = new TextBlock("qlf_title");
    this.titleText.text = "Quest Language Progress";
    this.titleText.color = "#E0E0E0";
    this.titleText.fontSize = 12;
    this.titleText.fontWeight = "bold";
    this.titleText.height = "20px";
    this.titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    mainStack.addControl(this.titleText);

    // Vocabulary progress bar
    this.buildProgressBar(mainStack, "Vocabulary", ACCENT_VOCAB, (fill, text) => {
      this.vocabProgressFill = fill;
      this.vocabProgressText = text;
    });

    // Grammar accuracy bar
    this.buildProgressBar(mainStack, "Grammar", ACCENT_GRAMMAR, (fill, text) => {
      this.grammarProgressFill = fill;
      this.grammarProgressText = text;
    });

    // Spacer
    const spacer = new Rectangle("qlf_spacer");
    spacer.width = "100%";
    spacer.height = "4px";
    spacer.background = "transparent";
    spacer.thickness = 0;
    mainStack.addControl(spacer);

    // Feedback items stack
    this.feedbackStack = new StackPanel("qlf_feedbackStack");
    this.feedbackStack.width = "100%";
    mainStack.addControl(this.feedbackStack);
  }

  private buildProgressBar(
    parent: StackPanel,
    label: string,
    color: string,
    onCreated: (fill: Rectangle, text: TextBlock) => void,
  ): void {
    // Label row
    const labelRow = new StackPanel(`qlf_${label}_row`);
    labelRow.isVertical = false;
    labelRow.width = "100%";
    labelRow.height = "16px";
    parent.addControl(labelRow);

    const labelText = new TextBlock(`qlf_${label}_label`);
    labelText.text = label;
    labelText.color = "#AAA";
    labelText.fontSize = 10;
    labelText.width = "70px";
    labelText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    labelRow.addControl(labelText);

    const valueText = new TextBlock(`qlf_${label}_value`);
    valueText.text = "0%";
    valueText.color = color;
    valueText.fontSize = 10;
    valueText.fontWeight = "bold";
    valueText.width = `${PANEL_WIDTH - 90}px`;
    valueText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    labelRow.addControl(valueText);

    // Bar background
    const barBg = new Rectangle(`qlf_${label}_barBg`);
    barBg.width = "100%";
    barBg.height = "6px";
    barBg.background = "rgba(255,255,255,0.1)";
    barBg.thickness = 0;
    barBg.cornerRadius = 3;
    parent.addControl(barBg);

    // Bar fill
    const barFill = new Rectangle(`qlf_${label}_barFill`);
    barFill.width = "0%";
    barFill.height = "6px";
    barFill.background = color;
    barFill.thickness = 0;
    barFill.cornerRadius = 3;
    barFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    barBg.addControl(barFill);

    onCreated(barFill, valueText);
  }

  // ── Public API ────────────────────────────────────────────────────────

  /** Show the panel for an active quest. */
  public show(questTitle?: string): void {
    if (this.rootContainer) {
      this.rootContainer.isVisible = true;
      this.visible = true;
      if (questTitle && this.titleText) {
        this.titleText.text = questTitle;
      }
    }
  }

  /** Hide the panel. */
  public hide(): void {
    if (this.rootContainer) {
      this.rootContainer.isVisible = false;
      this.visible = false;
    }
  }

  /** Update the panel from a QuestLanguageFeedbackState snapshot. */
  public updateFromState(state: QuestLanguageFeedbackState): void {
    if (!this.visible) this.show(state.questTitle);

    // Update vocabulary progress
    if (this.vocabProgressFill && this.vocabProgressText) {
      const vocabPct = state.vocabularyProgress;
      this.vocabProgressFill.width = `${Math.max(1, vocabPct)}%`;
      if (state.vocabularyRequiredCount > 0) {
        this.vocabProgressText.text = `${state.vocabularyUsedCount}/${state.vocabularyRequiredCount} (${vocabPct}%)`;
      } else {
        this.vocabProgressText.text = `${vocabPct}%`;
      }
    }

    // Update grammar accuracy
    if (this.grammarProgressFill && this.grammarProgressText) {
      const gramPct = state.grammarAccuracy;
      this.grammarProgressFill.width = `${Math.max(1, gramPct)}%`;
      const total = state.grammarCorrectCount + state.grammarErrorCount;
      if (total > 0) {
        this.grammarProgressText.text = `${state.grammarCorrectCount}/${total} correct (${gramPct}%)`;
        this.grammarProgressFill.background =
          gramPct >= 80 ? ACCENT_GRAMMAR : gramPct >= 50 ? ACCENT_ERROR : "#F44336";
      } else {
        this.grammarProgressText.text = "No grammar data yet";
      }
    }
  }

  /** Add a feedback item to the scrolling feed. */
  public addFeedbackItem(item: FeedbackItem): void {
    if (!this.feedbackStack) return;

    const row = new Rectangle(`qlf_fb_${item.id}`);
    row.width = "100%";
    row.adaptHeightToChildren = true;
    row.background = "transparent";
    row.thickness = 0;
    row.paddingTop = "2px";
    row.paddingBottom = "2px";

    const text = new TextBlock(`qlf_fb_text_${item.id}`);
    text.text = this.formatFeedbackItem(item);
    text.color = this.getFeedbackColor(item.type);
    text.fontSize = 10;
    text.textWrapping = TextWrapping.WordWrap;
    text.resizeToFit = true;
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    text.paddingLeft = "4px";
    row.addControl(text);

    this.feedbackStack.addControl(row);
    this.activeFeedbackRows.push({ container: row, expiry: Date.now() + FEEDBACK_TTL });

    // Cap visible items at 5
    while (this.activeFeedbackRows.length > 5) {
      const oldest = this.activeFeedbackRows.shift();
      if (oldest) {
        this.feedbackStack.removeControl(oldest.container);
      }
    }
  }

  /** Dispose the panel and clean up resources. */
  public dispose(): void {
    if (this.cleanupIntervalId !== null) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
    if (this.rootContainer) {
      this.advancedTexture.removeControl(this.rootContainer);
      this.rootContainer.dispose();
      this.rootContainer = null;
    }
    this.activeFeedbackRows = [];
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  private formatFeedbackItem(item: FeedbackItem): string {
    switch (item.type) {
      case 'vocabulary_used': return `+ ${item.message}`;
      case 'vocabulary_hint': return `? ${item.message}`;
      case 'grammar_correct': return `v ${item.message}`;
      case 'grammar_correction': return `> ${item.message}`;
      case 'grammar_focus': return `! ${item.message}`;
      case 'milestone': return `* ${item.message}`;
      default: return item.message;
    }
  }

  private getFeedbackColor(type: FeedbackItem['type']): string {
    switch (type) {
      case 'vocabulary_used': return ACCENT_VOCAB;
      case 'vocabulary_hint': return "#90CAF9";
      case 'grammar_correct': return ACCENT_GRAMMAR;
      case 'grammar_correction': return ACCENT_ERROR;
      case 'grammar_focus': return "#FF9800";
      case 'milestone': return ACCENT_MILESTONE;
      default: return "#CCC";
    }
  }

  private startCleanupLoop(): void {
    this.cleanupIntervalId = setInterval(() => {
      const now = Date.now();
      this.activeFeedbackRows = this.activeFeedbackRows.filter(row => {
        if (now >= row.expiry) {
          this.feedbackStack?.removeControl(row.container);
          return false;
        }
        return true;
      });
    }, 2000);
  }
}
