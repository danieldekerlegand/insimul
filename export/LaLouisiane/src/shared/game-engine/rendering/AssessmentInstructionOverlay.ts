/**
 * AssessmentInstructionOverlay — Babylon.js GUI overlay for phase instructions.
 *
 * Shows a centered card with the current assessment phase name, instructions,
 * and either a "Continue" button (placeholder phases) or a hint to talk to
 * an NPC (conversational phase). Auto-dismisses the conversational hint after
 * a few seconds so the player can walk to an NPC.
 */

import {
  AdvancedDynamicTexture,
  Button,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
} from '@babylonjs/gui';

export interface InstructionConfig {
  phaseName: string;
  phaseIndex: number;
  totalPhases: number;
  instruction: string;
  /** If true, show a "Talk to an NPC" hint instead of Continue button */
  isConversational: boolean;
  /** Called when Continue is clicked (non-conversational phases) */
  onContinue?: () => void;
}

export class AssessmentInstructionOverlay {
  private advancedTexture: AdvancedDynamicTexture;
  private backdrop: Rectangle | null = null;
  private card: Rectangle | null = null;
  private autoDismissTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(advancedTexture: AdvancedDynamicTexture) {
    this.advancedTexture = advancedTexture;
  }

  show(config: InstructionConfig): void {
    this.hide(); // clear any previous overlay

    // Semi-transparent backdrop
    const backdrop = new Rectangle('instructionBackdrop');
    backdrop.width = '100%';
    backdrop.height = '100%';
    backdrop.background = 'rgba(0, 0, 0, 0.6)';
    backdrop.thickness = 0;
    backdrop.isPointerBlocker = true;
    backdrop.zIndex = 95;
    this.advancedTexture.addControl(backdrop);
    this.backdrop = backdrop;

    // Centered card
    const card = new Rectangle('instructionCard');
    card.width = '480px';
    card.height = config.isConversational ? '320px' : '360px';
    card.background = 'rgba(15, 15, 25, 0.95)';
    card.color = '#FFD700';
    card.thickness = 2;
    card.cornerRadius = 12;
    card.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    card.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    card.zIndex = 96;
    backdrop.addControl(card);
    this.card = card;

    // Inner stack
    const stack = new StackPanel('instructionStack');
    stack.isVertical = true;
    stack.spacing = 8;
    stack.paddingTop = '24px';
    stack.paddingBottom = '24px';
    stack.paddingLeft = '28px';
    stack.paddingRight = '28px';
    card.addControl(stack);

    // Phase indicator (e.g. "Phase 1 of 4")
    const phaseIndicator = new TextBlock('phaseIndicator');
    phaseIndicator.text = `Section ${config.phaseIndex + 1} of ${config.totalPhases}`;
    phaseIndicator.fontSize = 13;
    phaseIndicator.color = '#9ca3af';
    phaseIndicator.height = '20px';
    phaseIndicator.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(phaseIndicator);

    // Phase name header
    const header = new TextBlock('phaseHeader');
    header.text = config.phaseName;
    header.fontSize = 26;
    header.fontWeight = 'bold';
    header.color = '#FFD700';
    header.height = '40px';
    header.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(header);

    // Divider
    const divider = new Rectangle('instructionDivider');
    divider.width = '80%';
    divider.height = '2px';
    divider.background = '#FFD700';
    divider.alpha = 0.3;
    divider.thickness = 0;
    stack.addControl(divider);

    // Spacer
    const spacer1 = new Rectangle('spacer1');
    spacer1.height = '8px';
    spacer1.thickness = 0;
    spacer1.background = 'transparent';
    stack.addControl(spacer1);

    // Instruction text
    const instructionText = new TextBlock('instructionBody');
    instructionText.text = config.instruction;
    instructionText.fontSize = 15;
    instructionText.color = '#e5e7eb';
    instructionText.textWrapping = true;
    instructionText.lineSpacing = '4px';
    instructionText.height = '80px';
    instructionText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(instructionText);

    // Spacer
    const spacer2 = new Rectangle('spacer2');
    spacer2.height = '12px';
    spacer2.thickness = 0;
    spacer2.background = 'transparent';
    stack.addControl(spacer2);

    if (config.isConversational) {
      // Hint: "Press G near an NPC to start a conversation"
      const hint = new TextBlock('conversationHint');
      hint.text = 'Press  G  near an NPC to start a conversation';
      hint.fontSize = 16;
      hint.fontWeight = 'bold';
      hint.color = '#22c55e';
      hint.height = '30px';
      hint.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      stack.addControl(hint);

      const subHint = new TextBlock('conversationSubHint');
      subHint.text = 'This message will dismiss in a few seconds...';
      subHint.fontSize = 12;
      subHint.color = '#6b7280';
      subHint.height = '20px';
      subHint.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      stack.addControl(subHint);

      // Auto-dismiss after 5 seconds so the player can interact
      this.autoDismissTimeout = setTimeout(() => {
        this.hide();
      }, 5000);
    } else {
      // Task description for placeholder phases
      const placeholderNote = new TextBlock('placeholderNote');
      placeholderNote.text = 'Full interactive tasks coming soon.\nFor now, click Continue to proceed.';
      placeholderNote.fontSize = 13;
      placeholderNote.color = '#9ca3af';
      placeholderNote.fontStyle = 'italic';
      placeholderNote.textWrapping = true;
      placeholderNote.height = '40px';
      placeholderNote.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      stack.addControl(placeholderNote);

      // Spacer
      const spacer3 = new Rectangle('spacer3');
      spacer3.height = '12px';
      spacer3.thickness = 0;
      spacer3.background = 'transparent';
      stack.addControl(spacer3);

      // Continue button
      const continueBtn = Button.CreateSimpleButton('continueBtn', 'Continue');
      continueBtn.width = '200px';
      continueBtn.height = '44px';
      continueBtn.color = 'white';
      continueBtn.background = '#22c55e';
      continueBtn.cornerRadius = 8;
      continueBtn.fontSize = 16;
      continueBtn.fontWeight = 'bold';
      continueBtn.thickness = 0;
      continueBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      continueBtn.onPointerEnterObservable.add(() => {
        continueBtn.background = '#16a34a';
      });
      continueBtn.onPointerOutObservable.add(() => {
        continueBtn.background = '#22c55e';
      });
      continueBtn.onPointerClickObservable.add(() => {
        this.hide();
        config.onContinue?.();
      });
      stack.addControl(continueBtn);
    }
  }

  hide(): void {
    if (this.autoDismissTimeout) {
      clearTimeout(this.autoDismissTimeout);
      this.autoDismissTimeout = null;
    }
    if (this.backdrop) {
      this.backdrop.dispose();
      this.backdrop = null;
    }
    this.card = null;
  }

  dispose(): void {
    this.hide();
  }
}
