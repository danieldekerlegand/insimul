/**
 * BabylonEavesdropPanel
 *
 * Semi-transparent side panel (right, 25% width) for eavesdropping on nearby
 * NPC-NPC conversations. Displays speaker names with color-coding, a typewriter
 * line effect, and hover-to-translate via HoverTranslationSystem.
 *
 * Vocabulary encountered during eavesdropping is recorded to the
 * LanguageProgressTracker for passive learning.
 */

import {
  Control,
  Rectangle,
  ScrollViewer,
  StackPanel,
  TextBlock,
  TextWrapping,
  Button,
} from '@babylonjs/gui';
import type { AdvancedDynamicTexture } from '@babylonjs/gui';
import type { Scene } from '@babylonjs/core';
import type { HoverTranslationSystem } from './HoverTranslationSystem';
import type { LanguageProgressTracker } from '../logic/LanguageProgressTracker';
import type { GameEventBus } from '../logic/GameEventBus';
import type { IDataSource as DataSource } from '@shared/game-engine/data-source';

// ── Types ────────────────────────────────────────────────────────────────────

export interface EavesdropLine {
  speaker: string;
  speakerId: string;
  text: string;
  lineIndex: number;
}

interface DisplayedLine {
  /** The TextBlock control for this line */
  control: TextBlock;
  /** Full text of the line (speaker: text) */
  fullText: string;
  /** How many characters have been revealed so far */
  revealedChars: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

/** Typewriter speed: ms per character */
const TYPEWRITER_CHAR_MS = 25;
/** Colors for alternating speakers */
const SPEAKER_1_COLOR = '#87CEEB'; // Sky blue
const SPEAKER_2_COLOR = '#FFD700'; // Gold
const SYSTEM_COLOR = '#888888';
const PANEL_BG = 'rgba(15, 20, 35, 0.82)';
const PANEL_BORDER = 'rgba(100, 140, 200, 0.4)';
const HEADER_BG = 'rgba(25, 35, 55, 0.95)';

// ── Panel ────────────────────────────────────────────────────────────────────

export class BabylonEavesdropPanel {
  private scene: Scene;
  private gui: AdvancedDynamicTexture;

  // GUI controls
  private container: Rectangle;
  private headerBar: Rectangle;
  private titleText: TextBlock;
  private closeButton: Button;
  private scrollViewer: ScrollViewer;
  private messageStack: StackPanel;

  // State
  private _isVisible = false;
  private lines: DisplayedLine[] = [];
  private typewriterTimer: ReturnType<typeof setInterval> | null = null;
  private currentTypewriterLine: DisplayedLine | null = null;
  private pendingLines: Array<{ speaker: string; text: string }> = [];

  // Speaker tracking (map speakerId → index for color assignment)
  private speakerMap: Map<string, number> = new Map();
  private speakerNames: Map<string, string> = new Map();

  // Session tracking
  private npc1Id: string | null = null;
  private npc2Id: string | null = null;
  private sessionStartTime: number = 0;
  private topic: string = 'general';
  private lineCount: number = 0;

  // Rate limiting: Set of "npc1Id:npc2Id" pairs already emitted this session
  private emittedPairs: Set<string> = new Set();

  // External integrations
  private hoverTranslation: HoverTranslationSystem | null = null;
  private languageTracker: LanguageProgressTracker | null = null;
  private eventBus: GameEventBus | null = null;
  private dataSource: DataSource | null = null;
  private targetLanguage: string | null = null;

  // TTS
  private ttsEnabled = true;
  private playerDistance: number = 0; // Distance to eavesdropped NPCs

  constructor(scene: Scene, gui: AdvancedDynamicTexture) {
    this.scene = scene;
    this.gui = gui;

    // ── Container (right side, 25% width) ──────────────────────────────────
    this.container = new Rectangle('eavesdropPanel');
    this.container.width = '25%';
    this.container.height = '60%';
    this.container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.container.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.container.left = '-8px';
    this.container.background = PANEL_BG;
    this.container.color = PANEL_BORDER;
    this.container.thickness = 1;
    this.container.cornerRadius = 8;
    this.container.isVisible = false;
    this.container.isPointerBlocker = true;
    this.gui.addControl(this.container);

    // ── Header bar ─────────────────────────────────────────────────────────
    this.headerBar = new Rectangle('eavesdropHeader');
    this.headerBar.width = '100%';
    this.headerBar.height = '36px';
    this.headerBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.headerBar.background = HEADER_BG;
    this.headerBar.thickness = 0;
    this.headerBar.cornerRadius = 8;
    this.container.addControl(this.headerBar);

    // Title
    this.titleText = new TextBlock('eavesdropTitle');
    this.titleText.text = 'Eavesdropping...';
    this.titleText.color = 'rgba(255,255,255,0.8)';
    this.titleText.fontSize = 12;
    this.titleText.fontStyle = 'italic';
    this.titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.titleText.paddingLeft = '10px';
    this.headerBar.addControl(this.titleText);

    // Close button
    this.closeButton = Button.CreateSimpleButton('eavesdropClose', 'X');
    this.closeButton.width = '28px';
    this.closeButton.height = '28px';
    this.closeButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.closeButton.color = 'rgba(255,255,255,0.6)';
    this.closeButton.background = 'transparent';
    this.closeButton.thickness = 0;
    this.closeButton.fontSize = 12;
    this.closeButton.onPointerClickObservable.add(() => this.hide());
    this.headerBar.addControl(this.closeButton);

    // ── Scroll area ────────────────────────────────────────────────────────
    this.scrollViewer = new ScrollViewer('eavesdropScroll');
    this.scrollViewer.width = '100%';
    this.scrollViewer.height = '100%';
    this.scrollViewer.top = '36px';
    this.scrollViewer.paddingTop = '4px';
    this.scrollViewer.paddingBottom = '8px';
    this.scrollViewer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.scrollViewer.barSize = 6;
    this.scrollViewer.barColor = 'rgba(100,140,200,0.3)';
    this.scrollViewer.thumbLength = 0.2;
    this.scrollViewer.thickness = 0;
    this.container.addControl(this.scrollViewer);

    this.messageStack = new StackPanel('eavesdropStack');
    this.messageStack.width = '100%';
    this.messageStack.isVertical = true;
    (this.messageStack as any).adaptHeight = true;
    this.scrollViewer.addControl(this.messageStack);
  }

  // ── Public API ───────────────────────────────────────────────────────────

  public get isVisible(): boolean {
    return this._isVisible;
  }

  /**
   * Show the eavesdrop panel for a conversation between two NPCs.
   */
  public show(npc1Id: string, npc2Id: string, npc1Name: string, npc2Name: string, topic?: string): void {
    this.npc1Id = npc1Id;
    this.npc2Id = npc2Id;
    this.topic = topic || 'general';
    this.sessionStartTime = Date.now();
    this.lineCount = 0;

    // Assign speaker colors
    this.speakerMap.clear();
    this.speakerNames.clear();
    this.speakerMap.set(npc1Id, 0);
    this.speakerMap.set(npc2Id, 1);
    this.speakerNames.set(npc1Id, npc1Name);
    this.speakerNames.set(npc2Id, npc2Name);

    // Reset display
    this.clearLines();
    this.titleText.text = `${npc1Name} & ${npc2Name}`;

    // Add system message
    this.addSystemLine(`Listening to ${npc1Name} and ${npc2Name}...`);

    this.container.isVisible = true;
    this._isVisible = true;
  }

  /**
   * Hide the panel and emit completion event.
   */
  public hide(): void {
    if (!this._isVisible) return;

    this.stopTypewriter();
    this.emitEavesdropCompleted();

    this.container.isVisible = false;
    this._isVisible = false;
    this.npc1Id = null;
    this.npc2Id = null;
    this.pendingLines = [];
    this.currentTypewriterLine = null;
  }

  /**
   * Add a new NPC line to the panel with typewriter effect.
   */
  public addLine(line: EavesdropLine): void {
    this.lineCount++;
    const speakerName = this.speakerNames.get(line.speakerId) || line.speaker;
    const formatted = `${speakerName}: ${line.text}`;

    // Record vocabulary encounters
    this.recordVocabularyEncounter(line.text);

    // Queue for typewriter
    this.pendingLines.push({ speaker: line.speakerId, text: formatted });
    this.processNextPendingLine();

    // TTS with distance-scaled volume
    if (this.ttsEnabled && this.dataSource) {
      this.playDistanceScaledTTS(line.text, line.speakerId);
    }
  }

  /**
   * Add a system message (not typewritten).
   */
  public addSystemLine(text: string): void {
    const textBlock = this.createTextBlock(text, SYSTEM_COLOR, true);
    this.messageStack.addControl(textBlock);
    this.lines.push({ control: textBlock, fullText: text, revealedChars: text.length });
    this.scrollToBottom();
  }

  /**
   * Update the player's distance to the eavesdropped NPCs (for TTS volume scaling).
   */
  public setPlayerDistance(distance: number): void {
    this.playerDistance = distance;
  }

  public setHoverTranslationSystem(system: HoverTranslationSystem): void {
    this.hoverTranslation = system;
  }

  public setLanguageProgressTracker(tracker: LanguageProgressTracker): void {
    this.languageTracker = tracker;
  }

  public setGameEventBus(bus: GameEventBus): void {
    this.eventBus = bus;
  }

  public setDataSource(ds: DataSource): void {
    this.dataSource = ds;
  }

  public setTargetLanguage(lang: string | null): void {
    this.targetLanguage = lang;
  }

  public setTTSEnabled(enabled: boolean): void {
    this.ttsEnabled = enabled;
  }

  /**
   * Check if an eavesdrop event has already been emitted for this NPC pair.
   */
  public hasEmittedForPair(npc1Id: string, npc2Id: string): boolean {
    const key = [npc1Id, npc2Id].sort().join(':');
    return this.emittedPairs.has(key);
  }

  /**
   * Reset rate-limiting state (e.g., on session change).
   */
  public resetRateLimits(): void {
    this.emittedPairs.clear();
  }

  public dispose(): void {
    this.stopTypewriter();
    this.gui.removeControl(this.container);
    this.container.dispose();
  }

  // ── Private: typewriter effect ───────────────────────────────────────────

  private processNextPendingLine(): void {
    // Already animating a line — wait
    if (this.currentTypewriterLine) return;
    // Nothing pending
    if (this.pendingLines.length === 0) return;

    const next = this.pendingLines.shift()!;
    const color = this.getSpeakerColor(next.speaker);
    const textBlock = this.createTextBlock('', color, false);
    this.messageStack.addControl(textBlock);

    const displayed: DisplayedLine = {
      control: textBlock,
      fullText: next.text,
      revealedChars: 0,
    };
    this.lines.push(displayed);
    this.currentTypewriterLine = displayed;

    this.typewriterTimer = globalThis.setInterval(() => {
      this.typewriterTick();
    }, TYPEWRITER_CHAR_MS);
  }

  private typewriterTick(): void {
    const line = this.currentTypewriterLine;
    if (!line) { this.stopTypewriter(); return; }

    line.revealedChars++;
    line.control.text = line.fullText.slice(0, line.revealedChars);

    if (line.revealedChars >= line.fullText.length) {
      // Done with this line
      this.stopTypewriter();
      this.currentTypewriterLine = null;
      this.scrollToBottom();
      // Process next pending line
      this.processNextPendingLine();
    }
  }

  private stopTypewriter(): void {
    if (this.typewriterTimer !== null) {
      globalThis.clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
  }

  // ── Private: display helpers ─────────────────────────────────────────────

  private createTextBlock(text: string, color: string, isSystem: boolean): TextBlock {
    const tb = new TextBlock();
    tb.text = text;
    tb.color = color;
    tb.fontSize = isSystem ? 11 : 12;
    tb.fontStyle = isSystem ? 'italic' : 'normal';
    tb.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    tb.textWrapping = TextWrapping.WordWrap;
    tb.resizeToFit = true;
    tb.width = '95%';
    tb.paddingLeft = '8px';
    tb.paddingRight = '8px';
    tb.paddingTop = '3px';
    tb.paddingBottom = '3px';
    return tb;
  }

  private getSpeakerColor(speakerId: string): string {
    const idx = this.speakerMap.get(speakerId);
    if (idx === 0) return SPEAKER_1_COLOR;
    if (idx === 1) return SPEAKER_2_COLOR;
    return 'rgba(255,255,255,0.9)';
  }

  private scrollToBottom(): void {
    // Defer to next frame to let layout settle
    setTimeout(() => {
      this.scrollViewer.verticalBar.value = 1;
    }, 50);
  }

  private clearLines(): void {
    this.stopTypewriter();
    this.currentTypewriterLine = null;
    this.pendingLines = [];
    for (const line of this.lines) {
      this.messageStack.removeControl(line.control);
      line.control.dispose();
    }
    this.lines = [];
  }

  // ── Private: vocabulary learning ─────────────────────────────────────────

  private recordVocabularyEncounter(text: string): void {
    if (!this.hoverTranslation || !this.targetLanguage) return;

    // Tokenize the text and record each word encounter
    const tokens = this.hoverTranslation.tokenize(text);
    for (const token of tokens) {
      if (token.isWord) {
        this.hoverTranslation.recordWordEncounter(token.text, 'beginner');
      }
    }

    // Emit vocabulary_overheard events for each word
    if (this.eventBus && this.npc1Id) {
      const words = tokens.filter(t => t.isWord);
      for (const word of words) {
        const translation = this.hoverTranslation.getTranslation(word.text);
        if (translation) {
          this.eventBus.emit({
            type: 'vocabulary_overheard',
            word: word.text,
            translation: translation.translation,
            language: this.targetLanguage,
            context: text,
            conversationId: `eavesdrop_${this.npc1Id}_${this.npc2Id}`,
            speakerNpcId: this.npc1Id,
          });
        }
      }
    }
  }

  // ── Private: TTS with distance scaling ───────────────────────────────────

  private async playDistanceScaledTTS(text: string, speakerId: string): Promise<void> {
    if (!this.dataSource || !this.targetLanguage) return;

    // Scale volume by distance: full at 0, silent at 15+ units
    const maxDistance = 15;
    const volume = Math.max(0, 1 - (this.playerDistance / maxDistance));
    if (volume <= 0.05) return; // Too far to hear

    // Determine voice by speaker index
    const speakerIdx = this.speakerMap.get(speakerId) ?? 0;
    const voice = speakerIdx === 0 ? 'Kore' : 'Charon';
    const gender = speakerIdx === 0 ? 'female' : 'male';

    try {
      const audioBlob = await this.dataSource.textToSpeech(text, voice, gender, this.targetLanguage);
      if (audioBlob && this._isVisible) {
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.volume = volume;
        audio.onended = () => URL.revokeObjectURL(audio.src);
        audio.onerror = () => URL.revokeObjectURL(audio.src);
        audio.play().catch(() => { /* ignore play errors */ });
      }
    } catch {
      // TTS failure is non-critical for eavesdrop
    }
  }

  // ── Private: quest integration ───────────────────────────────────────────

  private emitEavesdropCompleted(): void {
    if (!this.eventBus || !this.npc1Id || !this.npc2Id) return;

    // Rate limit: only emit once per NPC pair per session
    const pairKey = [this.npc1Id, this.npc2Id].sort().join(':');
    if (this.emittedPairs.has(pairKey)) return;
    this.emittedPairs.add(pairKey);

    const durationSeconds = Math.round((Date.now() - this.sessionStartTime) / 1000);

    this.eventBus.emit({
      type: 'conversation_overheard',
      npcId1: this.npc1Id,
      npcId2: this.npc2Id,
      topic: this.topic,
      languageUsed: this.targetLanguage || 'unknown',
    });

    // Also emit ambient conversation ended for broader tracking
    this.eventBus.emit({
      type: 'ambient_conversation_ended',
      conversationId: `eavesdrop_${this.npc1Id}_${this.npc2Id}`,
      participants: [this.npc1Id, this.npc2Id],
      durationMs: durationSeconds * 1000,
      vocabularyCount: this.lineCount,
    });
  }
}
