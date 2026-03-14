/**
 * AssessmentProgressUI — Babylon.js GUI overlay for assessment progress.
 *
 * Displays phase dots (4 phases), a status message or countdown timer,
 * and smooth phase transition fade overlays.
 * Style matches BabylonQuestTracker.ts.
 */

import {
  AdvancedDynamicTexture,
  Control,
  Ellipse,
  Rectangle,
  StackPanel,
  TextBlock,
} from '@babylonjs/gui';

export interface AssessmentPhaseInfo {
  index: number;
  name: string;
  totalPhases: number;
  timeRemainingSeconds: number;
}

const PHASE_LABELS = ['Conversational', 'Listening', 'Writing', 'Visual'];
const TOTAL_PHASES = 4;

// Timer color thresholds (in seconds)
const AMBER_THRESHOLD = 120; // 2 minutes
const RED_THRESHOLD = 60;    // 1 minute

// Fade overlay duration (ms) — softened from original values
const FADE_DURATION = 500;
const FADE_HOLD = 400;

export class AssessmentProgressUI {
  private advancedTexture: AdvancedDynamicTexture;
  private panel: Rectangle | null = null;
  private phaseDots: Ellipse[] = [];
  private phaseLabel: TextBlock | null = null;
  private timerText: TextBlock | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private fadeOverlay: Rectangle | null = null;
  private fadeTimeout: ReturnType<typeof setTimeout> | null = null;
  private fadeAnimInterval: ReturnType<typeof setInterval> | null = null;
  private currentPhase = 0;
  private _isVisible = false;
  private _timeRemaining = 0;
  private _statusMode = false;

  constructor(advancedTexture: AdvancedDynamicTexture) {
    this.advancedTexture = advancedTexture;
    this.buildUI();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  public show(): void {
    if (this.panel) {
      this.panel.isVisible = true;
      this._isVisible = true;
    }
  }

  public hide(): void {
    this.stopTimer();
    if (this.panel) {
      this.panel.isVisible = false;
      this._isVisible = false;
    }
  }

  public get isVisible(): boolean {
    return this._isVisible;
  }

  /** Set the active phase (0-based index) and start the timer or show status. */
  public setPhase(phaseIndex: number, timeRemainingSeconds: number): void {
    this.currentPhase = Math.max(0, Math.min(phaseIndex, TOTAL_PHASES - 1));
    this._timeRemaining = timeRemainingSeconds;
    this.updatePhaseDots();
    this.updatePhaseLabel();

    if (timeRemainingSeconds <= 0) {
      // Interactive mode — show status text instead of countdown
      this._statusMode = true;
      this.stopTimer();
      this.setStatusText('Complete the task to continue');
    } else {
      this._statusMode = false;
      this.updateTimerDisplay();
      this.startTimer();
    }
  }

  /** Set a custom status message in the timer area. */
  public setStatusText(text: string): void {
    this._statusMode = true;
    this.stopTimer();
    if (this.timerText) {
      this.timerText.text = text;
      this.timerText.color = '#22c55e';
      this.timerText.fontSize = 13;
    }
  }

  /** Mark a phase as completed and show the transition fade overlay. */
  public transitionToNextPhase(nextPhaseIndex: number, timeRemainingSeconds: number): void {
    this.showFadeOverlay(PHASE_LABELS[nextPhaseIndex] ?? `Phase ${nextPhaseIndex + 1}`, () => {
      this.setPhase(nextPhaseIndex, timeRemainingSeconds);
    });
  }

  /** Update the timer externally (e.g. from server sync). */
  public updateTimer(secondsRemaining: number): void {
    this._timeRemaining = secondsRemaining;
    if (!this._statusMode) {
      this.updateTimerDisplay();
    }
  }

  /** Get the current time remaining in seconds. */
  public get timeRemaining(): number {
    return this._timeRemaining;
  }

  public dispose(): void {
    this.stopTimer();
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
    if (this.fadeAnimInterval) {
      clearInterval(this.fadeAnimInterval);
      this.fadeAnimInterval = null;
    }
    if (this.fadeOverlay) {
      this.fadeOverlay.dispose();
      this.fadeOverlay = null;
    }
    if (this.panel) {
      this.panel.dispose();
      this.panel = null;
    }
    this.phaseDots = [];
    this.phaseLabel = null;
    this.timerText = null;
  }

  // ---------------------------------------------------------------------------
  // UI Construction
  // ---------------------------------------------------------------------------

  private buildUI(): void {
    // Main compact panel — top-right, below quest tracker area
    const panel = new Rectangle('assessmentProgressPanel');
    panel.width = '280px';
    panel.height = '90px';
    panel.background = 'rgba(0, 0, 0, 0.85)';
    panel.color = '#FFD700';
    panel.thickness = 2;
    panel.cornerRadius = 10;
    panel.top = '470px';
    panel.left = '-10px';
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    panel.isVisible = false;
    panel.zIndex = 50;
    this.advancedTexture.addControl(panel);
    this.panel = panel;

    // Inner stack
    const stack = new StackPanel('assessmentStack');
    stack.isVertical = true;
    stack.spacing = 6;
    stack.paddingTop = '10px';
    stack.paddingBottom = '10px';
    stack.paddingLeft = '14px';
    stack.paddingRight = '14px';
    panel.addControl(stack);

    // Row 1: Phase label
    const label = new TextBlock('assessmentPhaseLabel', 'Assessment');
    label.fontSize = 13;
    label.fontWeight = 'bold';
    label.color = '#FFD700';
    label.height = '18px';
    label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(label);
    this.phaseLabel = label;

    // Row 2: Phase dots
    const dotRow = new StackPanel('assessmentDotRow');
    dotRow.isVertical = false;
    dotRow.height = '24px';
    dotRow.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    dotRow.spacing = 12;
    stack.addControl(dotRow);

    for (let i = 0; i < TOTAL_PHASES; i++) {
      const dot = new Ellipse(`assessmentDot_${i}`);
      dot.width = '14px';
      dot.height = '14px';
      dot.color = '#FFD700';
      dot.thickness = 2;
      dot.background = 'transparent';
      dotRow.addControl(dot);
      this.phaseDots.push(dot);
    }

    // Row 3: Timer / Status
    const timer = new TextBlock('assessmentTimer', '--:--');
    timer.fontSize = 16;
    timer.fontWeight = 'bold';
    timer.color = 'white';
    timer.height = '22px';
    timer.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(timer);
    this.timerText = timer;
  }

  // ---------------------------------------------------------------------------
  // Phase dots
  // ---------------------------------------------------------------------------

  private updatePhaseDots(): void {
    for (let i = 0; i < this.phaseDots.length; i++) {
      const dot = this.phaseDots[i];
      if (i < this.currentPhase) {
        // Completed
        dot.background = '#22c55e';
        dot.color = '#22c55e';
      } else if (i === this.currentPhase) {
        // Active
        dot.background = '#FFD700';
        dot.color = '#FFD700';
      } else {
        // Pending
        dot.background = 'transparent';
        dot.color = '#6b7280';
      }
    }
  }

  private updatePhaseLabel(): void {
    if (this.phaseLabel) {
      const name = PHASE_LABELS[this.currentPhase] ?? `Phase ${this.currentPhase + 1}`;
      this.phaseLabel.text = `Phase ${this.currentPhase + 1}: ${name}`;
    }
  }

  // ---------------------------------------------------------------------------
  // Timer
  // ---------------------------------------------------------------------------

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this._timeRemaining = Math.max(0, this._timeRemaining - 1);
      this.updateTimerDisplay();
      if (this._timeRemaining <= 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateTimerDisplay(): void {
    if (!this.timerText || this._statusMode) return;
    const secs = Math.ceil(this._timeRemaining);
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    this.timerText.text = `${min}:${sec.toString().padStart(2, '0')}`;
    this.timerText.fontSize = 16;

    if (secs <= RED_THRESHOLD) {
      this.timerText.color = '#ef4444';
    } else if (secs <= AMBER_THRESHOLD) {
      this.timerText.color = '#fbbf24';
    } else {
      this.timerText.color = 'white';
    }
  }

  // ---------------------------------------------------------------------------
  // Phase transition fade overlay — smooth, eased
  // ---------------------------------------------------------------------------

  public showFadeOverlay(phaseName: string, onMidpoint?: () => void): void {
    this.clearFadeOverlay();

    const overlay = new Rectangle('assessmentFadeOverlay');
    overlay.width = '100%';
    overlay.height = '100%';
    overlay.background = 'rgba(0, 0, 0, 0.6)';
    overlay.thickness = 0;
    overlay.alpha = 0;
    overlay.isPointerBlocker = true;
    overlay.zIndex = 100;
    this.advancedTexture.addControl(overlay);
    this.fadeOverlay = overlay;

    const text = new TextBlock('fadeText', phaseName);
    text.fontSize = 28;
    text.fontWeight = 'bold';
    text.color = '#FFD700';
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    overlay.addControl(text);

    // Fade in with easing
    this.animateAlpha(overlay, 0, 1, FADE_DURATION).then(() => {
      onMidpoint?.();
      // Hold, then fade out
      this.fadeTimeout = setTimeout(() => {
        this.animateAlpha(overlay, 1, 0, FADE_DURATION).then(() => {
          this.clearFadeOverlay();
        });
      }, FADE_HOLD);
    });
  }

  private clearFadeOverlay(): void {
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
    if (this.fadeAnimInterval) {
      clearInterval(this.fadeAnimInterval);
      this.fadeAnimInterval = null;
    }
    if (this.fadeOverlay) {
      this.fadeOverlay.dispose();
      this.fadeOverlay = null;
    }
  }

  private animateAlpha(control: Rectangle, from: number, to: number, durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      const steps = Math.max(1, Math.floor(durationMs / 16));
      let step = 0;
      control.alpha = from;

      // Clear any previous animation interval
      if (this.fadeAnimInterval) {
        clearInterval(this.fadeAnimInterval);
      }

      this.fadeAnimInterval = setInterval(() => {
        step++;
        // Ease-in-out curve for smoother transition
        const t = step / steps;
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        control.alpha = from + (to - from) * eased;
        if (step >= steps) {
          control.alpha = to;
          if (this.fadeAnimInterval) {
            clearInterval(this.fadeAnimInterval);
            this.fadeAnimInterval = null;
          }
          resolve();
        }
      }, 16);
    });
  }
}
