/**
 * AssessmentModalUI — Babylon.js GUI modal for reading, writing, and listening
 * assessment sections.
 *
 * Reading: displays a passage + comprehension questions with text inputs
 * Writing: displays writing prompts with text inputs
 * Listening: plays audio via TTS, then shows comprehension questions with text inputs
 *
 * Follows the BabylonPuzzleUI pattern: backdrop + centered card + InputText fields.
 */

import * as GUI from '@babylonjs/gui';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AssessmentModalConfig {
  phaseType: 'reading' | 'writing' | 'listening';
  phaseName: string;
  phaseIndex: number;
  totalPhases: number;
  /** Reading/listening passage text (in target language) */
  passage?: string;
  /** Comprehension questions for reading/listening */
  questions?: Array<{ id: string; questionText: string; maxPoints: number }>;
  /** Writing prompts */
  writingPrompts?: string[];
  /** Audio URL for listening section (TTS-generated) */
  audioUrl?: string;
  /** Called when the player submits their answers */
  onSubmit: (answers: Record<string, string>) => void;
}

/**
 * Module-level flag indicating whether the assessment modal is currently open.
 * Imported by BabylonGame and CharacterController to block keyboard input.
 */
export let assessmentModalOpen = false;

// ─── Component ───────────────────────────────────────────────────────────────

export class AssessmentModalUI {
  private overlay: GUI.Rectangle | null = null;
  private inputs: Map<string, GUI.InputText> = new Map();
  private audioElement: HTMLAudioElement | null = null;

  show(fullscreenUI: GUI.AdvancedDynamicTexture, config: AssessmentModalConfig): void {
    this.hide();
    assessmentModalOpen = true;

    // Semi-transparent backdrop
    const backdrop = new GUI.Rectangle('assessmentBackdrop');
    backdrop.width = '100%';
    backdrop.height = '100%';
    backdrop.background = 'rgba(0, 0, 0, 0.7)';
    backdrop.thickness = 0;
    backdrop.isPointerBlocker = true;
    backdrop.zIndex = 95;
    fullscreenUI.addControl(backdrop);
    this.overlay = backdrop;

    // Modal card
    const modal = new GUI.Rectangle('assessmentModal');
    modal.width = '560px';
    modal.adaptHeightToChildren = true;
    modal.paddingBottom = '24px';
    modal.background = 'rgba(15, 15, 25, 0.95)';
    modal.color = '#FFD700';
    modal.thickness = 2;
    modal.cornerRadius = 12;
    modal.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    modal.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    modal.zIndex = 96;
    backdrop.addControl(modal);

    // Scroll viewer for tall content
    const scroll = new GUI.ScrollViewer('assessmentScroll');
    scroll.width = '100%';
    scroll.height = '600px';
    scroll.thickness = 0;
    scroll.barSize = 8;
    scroll.barColor = '#FFD700';
    modal.addControl(scroll);

    // Inner stack
    const stack = new GUI.StackPanel('assessmentStack');
    stack.isVertical = true;
    stack.spacing = 10;
    stack.paddingTop = '24px';
    stack.paddingBottom = '24px';
    stack.paddingLeft = '36px';
    stack.paddingRight = '28px';
    stack.width = '100%';
    scroll.addControl(stack);

    // Phase indicator
    const phaseIndicator = new GUI.TextBlock('phaseIndicator');
    phaseIndicator.text = `Section ${config.phaseIndex + 1} of ${config.totalPhases}`;
    phaseIndicator.fontSize = 13;
    phaseIndicator.color = '#9ca3af';
    phaseIndicator.height = '20px';
    phaseIndicator.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(phaseIndicator);

    // Phase name header
    const header = new GUI.TextBlock('phaseHeader');
    header.text = config.phaseName;
    header.fontSize = 24;
    header.fontWeight = 'bold';
    header.color = '#FFD700';
    header.height = '36px';
    header.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(header);

    // Divider
    const divider = new GUI.Rectangle('divider');
    divider.width = '80%';
    divider.height = '2px';
    divider.background = '#FFD700';
    divider.alpha = 0.3;
    divider.thickness = 0;
    stack.addControl(divider);

    this.addSpacer(stack, 8);

    // Build content based on phase type
    if (config.phaseType === 'reading') {
      this.buildReadingContent(stack, config);
    } else if (config.phaseType === 'writing') {
      this.buildWritingContent(stack, config);
    } else if (config.phaseType === 'listening') {
      this.buildListeningContent(stack, config);
    }

    this.addSpacer(stack, 12);

    // Submit button
    const submitBtn = this.makeButton('submitBtn', 'Submit Answers', '#22c55e');
    submitBtn.onPointerClickObservable.add(() => {
      const answers: Record<string, string> = {};
      this.inputs.forEach((input, key) => {
        answers[key] = input.text.trim();
      });
      this.hide();
      config.onSubmit(answers);
    });
    stack.addControl(submitBtn);
  }

  hide(): void {
    assessmentModalOpen = false;
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    if (this.overlay) {
      this.overlay.dispose();
      this.overlay = null;
    }
    this.inputs.clear();
  }

  dispose(): void {
    this.hide();
  }

  isVisible(): boolean {
    return this.overlay !== null;
  }

  // ─── Content Builders ────────────────────────────────────────────────────

  private buildReadingContent(stack: GUI.StackPanel, config: AssessmentModalConfig): void {
    // Instructions
    const instructions = new GUI.TextBlock('readInstructions');
    instructions.text = 'Read the passage below carefully, then answer the comprehension questions.';
    instructions.fontSize = 14;
    instructions.color = '#e5e7eb';
    instructions.textWrapping = true;
    instructions.height = '40px';
    instructions.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(instructions);

    this.addSpacer(stack, 8);

    // Passage display
    if (config.passage) {
      this.addPassageBlock(stack, config.passage);
    }

    this.addSpacer(stack, 12);

    // Questions
    if (config.questions) {
      this.addQuestionInputs(stack, config.questions);
    }
  }

  private buildWritingContent(stack: GUI.StackPanel, config: AssessmentModalConfig): void {
    // Instructions
    const instructions = new GUI.TextBlock('writeInstructions');
    instructions.text = 'Respond to each writing prompt below in the target language. Write as much as you can.';
    instructions.fontSize = 14;
    instructions.color = '#e5e7eb';
    instructions.textWrapping = true;
    instructions.height = '40px';
    instructions.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(instructions);

    this.addSpacer(stack, 8);

    // Writing prompts with text inputs
    if (config.writingPrompts) {
      for (let i = 0; i < config.writingPrompts.length; i++) {
        const promptLabel = new GUI.TextBlock(`promptLabel${i}`);
        promptLabel.text = `Prompt ${i + 1}: ${config.writingPrompts[i]}`;
        promptLabel.fontSize = 14;
        promptLabel.color = '#d1d5db';
        promptLabel.textWrapping = true;
        promptLabel.height = '50px';
        promptLabel.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stack.addControl(promptLabel);

        const input = this.createTextInput(`p${i + 1}`, 'Write your response here...');
        input.height = '60px';
        stack.addControl(input);

        this.addSpacer(stack, 8);
      }
    }
  }

  private buildListeningContent(stack: GUI.StackPanel, config: AssessmentModalConfig): void {
    // Instructions
    const instructions = new GUI.TextBlock('listenInstructions');
    instructions.text = 'Listen to the audio passage, then answer the comprehension questions below. You may replay the audio.';
    instructions.fontSize = 14;
    instructions.color = '#e5e7eb';
    instructions.textWrapping = true;
    instructions.height = '50px';
    instructions.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(instructions);

    this.addSpacer(stack, 8);

    // Audio player controls
    const audioRow = new GUI.StackPanel('audioRow');
    audioRow.isVertical = false;
    audioRow.height = '48px';
    audioRow.spacing = 12;
    audioRow.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(audioRow);

    const playBtn = this.makeButton('playBtn', '\u25B6  Play Audio', '#3b82f6');
    playBtn.width = '160px';
    const statusText = new GUI.TextBlock('audioStatus', 'Ready to play');
    statusText.fontSize = 13;
    statusText.color = '#9ca3af';
    statusText.width = '160px';
    statusText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

    playBtn.onPointerClickObservable.add(() => {
      if (config.audioUrl) {
        this.playAudio(config.audioUrl, statusText, playBtn);
      } else if (config.passage) {
        // Fallback: use browser TTS if no audio URL
        this.speakText(config.passage, statusText, playBtn);
      }
    });

    audioRow.addControl(playBtn);
    audioRow.addControl(statusText);

    this.addSpacer(stack, 12);

    // Questions (passage is NOT displayed — player must listen)
    if (config.questions) {
      this.addQuestionInputs(stack, config.questions);
    }
  }

  // ─── Shared UI Helpers ───────────────────────────────────────────────────

  private addPassageBlock(stack: GUI.StackPanel, passage: string): void {
    const passageContainer = new GUI.Rectangle('passageContainer');
    passageContainer.width = '100%';
    passageContainer.adaptHeightToChildren = true;
    passageContainer.paddingTop = '16px';
    passageContainer.paddingBottom = '16px';
    passageContainer.paddingLeft = '20px';
    passageContainer.paddingRight = '20px';
    passageContainer.background = 'rgba(255, 215, 0, 0.08)';
    passageContainer.cornerRadius = 8;
    passageContainer.thickness = 1;
    passageContainer.color = 'rgba(255, 215, 0, 0.3)';
    stack.addControl(passageContainer);

    const passageText = new GUI.TextBlock('passageText');
    passageText.text = passage;
    passageText.fontSize = 15;
    passageText.color = '#f3f4f6';
    passageText.fontStyle = 'italic';
    passageText.textWrapping = true;
    passageText.lineSpacing = '6px';
    passageText.resizeToFit = true;
    passageText.paddingLeft = '4px';
    passageText.paddingRight = '4px';
    passageText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    passageContainer.addControl(passageText);
  }

  private addQuestionInputs(stack: GUI.StackPanel, questions: Array<{ id: string; questionText: string; maxPoints: number }>): void {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      const qLabel = new GUI.TextBlock(`qLabel${i}`);
      qLabel.text = `Q${i + 1}: ${q.questionText}`;
      qLabel.fontSize = 14;
      qLabel.color = '#d1d5db';
      qLabel.textWrapping = true;
      qLabel.height = '40px';
      qLabel.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      stack.addControl(qLabel);

      const input = this.createTextInput(q.id, 'Type your answer here...');
      stack.addControl(input);

      this.addSpacer(stack, 6);
    }
  }

  private createTextInput(id: string, placeholder: string): GUI.InputText {
    const input = new GUI.InputText(`input_${id}`, '');
    input.width = '100%';
    input.height = '36px';
    input.fontSize = 14;
    input.color = 'white';
    input.background = 'rgba(255, 255, 255, 0.08)';
    input.focusedBackground = 'rgba(255, 255, 255, 0.12)';
    input.thickness = 1;
    input.placeholderText = placeholder;
    input.placeholderColor = '#6b7280';
    this.inputs.set(id, input);
    return input;
  }

  private makeButton(name: string, label: string, color: string): GUI.Rectangle {
    const btn = new GUI.Rectangle(name);
    btn.width = '200px';
    btn.height = '44px';
    btn.background = color;
    btn.cornerRadius = 8;
    btn.thickness = 0;
    btn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    btn.isPointerBlocker = true;

    const text = new GUI.TextBlock(`${name}Text`, label);
    text.fontSize = 16;
    text.fontWeight = 'bold';
    text.color = 'white';
    btn.addControl(text);

    btn.onPointerEnterObservable.add(() => {
      btn.alpha = 0.85;
    });
    btn.onPointerOutObservable.add(() => {
      btn.alpha = 1.0;
    });

    return btn;
  }

  private addSpacer(stack: GUI.StackPanel, height: number): void {
    const spacer = new GUI.Rectangle(`spacer_${Math.random().toString(36).slice(2, 6)}`);
    spacer.height = `${height}px`;
    spacer.thickness = 0;
    spacer.background = 'transparent';
    stack.addControl(spacer);
  }

  // ─── Audio Playback ────────────────────────────────────────────────────

  private playAudio(url: string, statusText: GUI.TextBlock, playBtn: GUI.Rectangle): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.audioElement = new Audio(url);
    statusText.text = 'Playing...';
    statusText.color = '#22c55e';
    playBtn.alpha = 0.5;

    this.audioElement.onended = () => {
      statusText.text = 'Finished — click to replay';
      statusText.color = '#9ca3af';
      playBtn.alpha = 1.0;
    };

    this.audioElement.onerror = () => {
      statusText.text = 'Audio error — try again';
      statusText.color = '#ef4444';
      playBtn.alpha = 1.0;
    };

    this.audioElement.play().catch(() => {
      statusText.text = 'Playback failed — try again';
      statusText.color = '#ef4444';
      playBtn.alpha = 1.0;
    });
  }

  private speakText(text: string, statusText: GUI.TextBlock, playBtn: GUI.Rectangle): void {
    if (!('speechSynthesis' in window)) {
      statusText.text = 'TTS not supported in this browser';
      statusText.color = '#ef4444';
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;

    statusText.text = 'Speaking...';
    statusText.color = '#22c55e';
    playBtn.alpha = 0.5;

    utterance.onend = () => {
      statusText.text = 'Finished — click to replay';
      statusText.color = '#9ca3af';
      playBtn.alpha = 1.0;
    };

    utterance.onerror = () => {
      statusText.text = 'Speech error — try again';
      statusText.color = '#ef4444';
      playBtn.alpha = 1.0;
    };

    window.speechSynthesis.speak(utterance);
  }
}
