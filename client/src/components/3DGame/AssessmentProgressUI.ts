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

const PHASE_LABELS = ['Reading', 'Writing', 'Listening', 'Conversation'];
const TOTAL_PHASES = 4;

// Timer color thresholds (in seconds)
const AMBER_THRESHOLD = 120; // 2 minutes
const RED_THRESHOLD = 60;    // 1 minute

export class AssessmentProgressUI {
  private advancedTexture: AdvancedDynamicTexture;
  private panel: Rectangle | null = null;
  private phaseDots: Ellipse[] = [];
  private phaseLabel: TextBlock | null = null;
  private timerText: TextBlock | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private currentPhase = 0;
  private _isVisible = false;
  private _timeRemaining = 0;
  private _statusMode = false;
  private _onClick: (() => void) | null = null;

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
      this.timerText.fontSize = 11;
    }
  }

  /** Mark a phase as completed and advance to the next phase. */
  public transitionToNextPhase(nextPhaseIndex: number, timeRemainingSeconds: number): void {
    this.setPhase(nextPhaseIndex, timeRemainingSeconds);
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

  /** Register a callback for when the panel is clicked. */
  public onClicked(cb: () => void): void {
    this._onClick = cb;
  }

  public dispose(): void {
    this.stopTimer();
    this._onClick = null;
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
    // Main compact panel — bottom-left corner
    const panel = new Rectangle('assessmentProgressPanel');
    panel.width = '186px';
    panel.height = '68px';
    panel.background = 'rgba(0, 0, 0, 0.85)';
    panel.color = '#FFD700';
    panel.thickness = 1;
    panel.cornerRadius = 6;
    panel.top = '-8px';
    panel.left = '8px';
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    panel.isVisible = false;
    panel.zIndex = 50;
    panel.isPointerBlocker = true;
    panel.onPointerClickObservable.add(() => {
      this._onClick?.();
    });
    panel.onPointerEnterObservable.add(() => {
      panel.alpha = 0.85;
    });
    panel.onPointerOutObservable.add(() => {
      panel.alpha = 1.0;
    });
    this.advancedTexture.addControl(panel);
    this.panel = panel;

    // Inner stack
    const stack = new StackPanel('assessmentStack');
    stack.isVertical = true;
    stack.spacing = 3;
    stack.paddingTop = '6px';
    stack.paddingBottom = '6px';
    stack.paddingLeft = '8px';
    stack.paddingRight = '8px';
    panel.addControl(stack);

    // Row 1: Phase label
    const label = new TextBlock('assessmentPhaseLabel', 'Assessment');
    label.fontSize = 11;
    label.fontWeight = 'bold';
    label.color = '#FFD700';
    label.height = '16px';
    label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(label);
    this.phaseLabel = label;

    // Row 2: Phase dots
    const dotRow = new StackPanel('assessmentDotRow');
    dotRow.isVertical = false;
    dotRow.height = '18px';
    dotRow.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    dotRow.spacing = 8;
    stack.addControl(dotRow);

    for (let i = 0; i < TOTAL_PHASES; i++) {
      const dot = new Ellipse(`assessmentDot_${i}`);
      dot.width = '10px';
      dot.height = '10px';
      dot.color = '#FFD700';
      dot.thickness = 1;
      dot.background = 'transparent';
      dotRow.addControl(dot);
      this.phaseDots.push(dot);
    }

    // Row 3: Timer / Status
    const timer = new TextBlock('assessmentTimer', '--:--');
    timer.fontSize = 12;
    timer.fontWeight = 'bold';
    timer.color = 'white';
    timer.height = '18px';
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
      this.phaseLabel.text = `Section ${this.currentPhase + 1}: ${name}`;
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
    this.timerText.fontSize = 12;

    if (secs <= RED_THRESHOLD) {
      this.timerText.color = '#ef4444';
    } else if (secs <= AMBER_THRESHOLD) {
      this.timerText.color = '#fbbf24';
    } else {
      this.timerText.color = 'white';
    }
  }

}
