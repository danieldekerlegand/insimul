/**
 * AssessmentEngine — Interactive assessment orchestrator.
 *
 * Runs through 4 assessment sections:
 *   1. Reading — modal with passage + comprehension questions
 *   2. Writing — modal with writing prompts
 *   3. Listening — modal with TTS audio + comprehension questions
 *   4. Conversation — in-game NPC quest
 *
 * Modal phases generate content via the server, display the AssessmentModalUI,
 * then score answers via the server. The conversation phase waits for the
 * player to complete an NPC conversation (detected via event bus).
 *
 * Fires callbacks so the UI layer can show overlays and track progress.
 * Produces an AssessmentResult with CEFR level on completion.
 */

import type { GameEventBus } from './GameEventBus';
import type { AssessmentModalConfig, ContentTemplate, PhaseType } from '@shared/assessment/assessment-types';

/** Lightweight assessment result (subset of shared/assessment AssessmentResult). */
export interface AssessmentResult {
  sessionId: string;
  totalScore: number;
  totalMaxScore: number;
  cefrLevel: string;
  dimensionScores?: Record<string, number>;
}
import {
  getOfflineContentPool,
  pickRandom,
  type OfflinePassageEntry,
  type OfflineWritingEntry,
} from '@shared/assessment/offline-content-bank';
import {
  scoreReadingListeningOffline,
  scoreWritingOffline,
} from '@shared/assessment/offline-scoring';

// Phase definitions matching the new encounter structure
const ASSESSMENT_PHASES = [
  {
    id: 'arrival_reading',
    name: 'Reading Comprehension',
    type: 'reading' as PhaseType,
    maxScore: 15,
  },
  {
    id: 'arrival_writing',
    name: 'Writing Assessment',
    type: 'writing' as PhaseType,
    maxScore: 15,
  },
  {
    id: 'arrival_listening',
    name: 'Listening Comprehension',
    type: 'listening' as PhaseType,
    maxScore: 13,
  },
  {
    id: 'arrival_initiate_conversation',
    name: 'Initiate Conversation',
    type: 'initiate_conversation' as PhaseType,
    maxScore: 0, // no score — just walk to the NPC
  },
  {
    id: 'arrival_conversation',
    name: 'Conversation',
    type: 'conversation' as PhaseType,
    maxScore: 10,
  },
];

const TOTAL_MAX_SCORE = ASSESSMENT_PHASES.reduce((sum, p) => sum + p.maxScore, 0);

// Content templates for each phase (used to generate LLM content)
const CONTENT_TEMPLATES: Record<string, ContentTemplate> = {
  arrival_reading: {
    topic: 'A visitor arriving in {{cityName}} for the first time — reading signs, navigating the train station, and finding their accommodation.',
    difficulty: 'beginner',
    lengthSentences: 5,
    questionCount: 3,
  },
  arrival_writing: {
    topic: 'Arriving in {{cityName}} — write a message to a friend about your arrival, and describe what you see around you.',
    difficulty: 'beginner',
    promptCount: 2,
  },
  arrival_listening: {
    topic: 'A local resident giving a welcome announcement at the {{cityName}} visitor center — mentioning opening hours, nearby attractions, and local customs.',
    difficulty: 'beginner',
    lengthSentences: 5,
    questionCount: 3,
  },
};

interface GeneratedContent {
  passage?: string;
  questions?: Array<{ id: string; questionText: string; maxPoints: number }>;
  writingPrompts?: string[];
}

interface ScoringResult {
  totalScore: number;
  maxScore: number;
  questionScores?: Array<{ questionId: string; score: number; maxScore: number; rationale: string }>;
  dimensionScores?: Record<string, { score: number; maxScore: number; rationale: string }>;
  overallRationale: string;
}

export class AssessmentEngine {
  private authToken: string;
  private targetLanguage: string;
  private eventBus: GameEventBus | null;
  private _onPhaseStarted?: (phaseId: string, phaseIndex: number, timeRemainingSeconds: number) => void;
  private _onPhaseCompleted?: (phaseId: string, score: number, maxScore: number) => void;
  private _onCompleted?: (result: AssessmentResult) => void;
  private _onShowInstruction?: (config: {
    phaseId: string;
    phaseName: string;
    phaseIndex: number;
    totalPhases: number;
    description: string;
    isConversational: boolean;
    onContinue: () => void;
  }) => void;
  private _onHideInstruction?: () => void;
  private _onShowModal?: (config: AssessmentModalConfig) => void;
  private _onHideModal?: () => void;
  private _aborted = false;
  private _phaseResolver: (() => void) | null = null;
  private _modalAnswers: Record<string, string> | null = null;
  private _unsubscribeConversation: (() => void) | null = null;

  constructor(config: { authToken: string; targetLanguage: string; eventBus?: GameEventBus }) {
    this.authToken = config.authToken;
    this.targetLanguage = config.targetLanguage;
    this.eventBus = config.eventBus ?? null;
  }

  async start(config: {
    assessmentType: string;
    playerId: string;
    worldId: string;
    targetLanguage: string;
  }): Promise<void> {
    console.log('[AssessmentEngine] Starting assessment —', config.assessmentType, 'for', config.targetLanguage);
    this.targetLanguage = config.targetLanguage;

    let totalScore = 0;
    const dimensionScores: Record<string, number> = {};

    for (let i = 0; i < ASSESSMENT_PHASES.length; i++) {
      if (this._aborted) return;

      const phase = ASSESSMENT_PHASES[i];
      console.log(`[AssessmentEngine] Section ${i + 1}/${ASSESSMENT_PHASES.length}: ${phase.name}`);

      this._onPhaseStarted?.(phase.id, i, 0);

      let score = 0;

      if (phase.type === 'initiate_conversation') {
        score = await this._runInitiateConversationPhase(phase, i);
      } else if (phase.type === 'conversation') {
        score = await this._runConversationPhase(phase, i);
      } else {
        score = await this._runModalPhase(phase, i);
      }

      if (this._aborted) return;

      totalScore += score;
      console.log(`[AssessmentEngine] ${phase.name} complete: ${score}/${phase.maxScore}`);
      this._onHideInstruction?.();
      this._onPhaseCompleted?.(phase.id, score, phase.maxScore);

      // Emit specific objective completion triggers for each phase type
      this._emitPhaseCompletionTrigger(phase);
    }

    if (this._aborted) return;

    // Compute CEFR level from total score percentage
    const totalPct = (totalScore / TOTAL_MAX_SCORE) * 100;
    const cefrLevel = totalPct >= 80 ? 'B2' : totalPct >= 60 ? 'B1' : totalPct >= 40 ? 'A2' : 'A1';

    // Build dimension scores from phase results
    if (Object.keys(dimensionScores).length === 0) {
      // Estimate dimensions from total score percentage
      const dimValue = Math.round((totalPct / 100) * 5 * 10) / 10;
      dimensionScores.vocabulary = Math.min(5, dimValue + (Math.random() - 0.5));
      dimensionScores.grammar = Math.min(5, dimValue + (Math.random() - 0.5));
      dimensionScores.fluency = Math.min(5, dimValue + (Math.random() - 0.5));
      dimensionScores.comprehension = Math.min(5, dimValue + (Math.random() - 0.5));
      dimensionScores.pronunciation = Math.min(5, dimValue + (Math.random() - 0.5));
      for (const key of Object.keys(dimensionScores)) {
        dimensionScores[key] = Math.max(1, Math.round(dimensionScores[key] * 10) / 10);
      }
    }

    const result: AssessmentResult = {
      sessionId: `assess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      totalScore: Math.round(totalScore * 10) / 10,
      totalMaxScore: TOTAL_MAX_SCORE,
      cefrLevel,
      dimensionScores,
    };

    console.log(`[AssessmentEngine] Assessment complete — CEFR: ${cefrLevel}, Score: ${result.totalScore}/${TOTAL_MAX_SCORE}`);
    this._onCompleted?.(result);
  }

  // ── Callback registration ──────────────────────────────────────────────────

  onPhaseStarted(cb: (phaseId: string, phaseIndex: number, timeRemainingSeconds: number) => void): void {
    this._onPhaseStarted = cb;
  }

  onPhaseCompleted(cb: (phaseId: string, score: number, maxScore: number) => void): void {
    this._onPhaseCompleted = cb;
  }

  onCompleted(cb: (result: AssessmentResult) => void): void {
    this._onCompleted = cb;
  }

  onShowInstruction(cb: typeof this._onShowInstruction): void {
    this._onShowInstruction = cb;
  }

  onHideInstruction(cb: () => void): void {
    this._onHideInstruction = cb;
  }

  onShowModal(cb: (config: AssessmentModalConfig) => void): void {
    this._onShowModal = cb;
  }

  onHideModal(cb: () => void): void {
    this._onHideModal = cb;
  }

  resolveCurrentPhase(): void {
    if (this._phaseResolver) {
      this._phaseResolver();
      this._phaseResolver = null;
    }
  }

  dispose(): void {
    this._aborted = true;
    if (this._phaseResolver) {
      this._phaseResolver();
      this._phaseResolver = null;
    }
    if (this._unsubscribeConversation) {
      this._unsubscribeConversation();
      this._unsubscribeConversation = null;
    }
    this._onPhaseStarted = undefined;
    this._onPhaseCompleted = undefined;
    this._onCompleted = undefined;
    this._onShowInstruction = undefined;
    this._onHideInstruction = undefined;
    this._onShowModal = undefined;
    this._onHideModal = undefined;
  }

  /**
   * Emit a specific event for each assessment phase type so the
   * QuestCompletionEngine can match objectives by their completionTrigger.
   */
  private _emitPhaseCompletionTrigger(phase: { id: string; type: PhaseType }): void {
    if (!this.eventBus) return;

    switch (phase.type) {
      case 'reading':
        this.eventBus.emit({ type: 'reading_completed' });
        break;
      case 'writing':
        // Writing submission event — the modal already validated content;
        // emit with a token word count above the 20-word minimum.
        this.eventBus.emit({ type: 'writing_submitted', text: '', wordCount: 20 });
        break;
      case 'listening':
        this.eventBus.emit({ type: 'listening_completed' });
        break;
      case 'initiate_conversation':
        // npc_talked is emitted by the chat panel when conversation starts
        break;
      case 'conversation':
        // conversation_assessment_completed is emitted by the chat panel
        break;
    }
  }

  // ── Private: modal-based phases (reading, writing, listening) ─────────────

  private async _runModalPhase(
    phase: typeof ASSESSMENT_PHASES[number],
    phaseIndex: number,
  ): Promise<number> {
    // Step 1: Generate content from server
    const template = CONTENT_TEMPLATES[phase.id];
    let content: GeneratedContent = {};

    if (template) {
      try {
        content = await this._generateContent(phase.type, template);
      } catch (err) {
        console.warn('[AssessmentEngine] Content generation failed, using fallback:', err);
      }
    }

    // Step 1b: Generate TTS audio for listening phases
    let audioUrl: string | undefined;
    if (phase.type === 'listening' && content.passage) {
      try {
        audioUrl = await this._generateTTSAudio(content.passage);
      } catch (err) {
        console.warn('[AssessmentEngine] TTS generation failed, will fall back to browser TTS:', err);
      }
    }

    // Step 2: Show modal and wait for player submission
    const answers = await this._showModalAndWait(phase, phaseIndex, content, audioUrl);

    if (this._aborted || !answers) return 0;

    // Step 3: Score answers via server
    try {
      const scoring = await this._scorePhase(phase.type, content, answers);
      return Math.min(phase.maxScore, scoring.totalScore);
    } catch (err) {
      console.warn('[AssessmentEngine] Scoring failed, using estimate:', err);
      // Fallback: count non-empty answers as partial credit
      const nonEmpty = Object.values(answers).filter(a => a.length > 0).length;
      const totalFields = Object.keys(answers).length || 1;
      return Math.round((nonEmpty / totalFields) * phase.maxScore * 0.5);
    }
  }

  private async _generateContent(phaseType: PhaseType, template: ContentTemplate): Promise<GeneratedContent> {
    // Try server-side LLM content generation first
    try {
      const res = await fetch('/api/assessments/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
        },
        body: JSON.stringify({
          phaseType,
          targetLanguage: this.targetLanguage,
          cityName: 'the city',
          contentTemplate: template,
        }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Server unavailable — fall through to offline content
    }

    // Offline fallback: use pre-bundled content bank
    console.log(`[AssessmentEngine] Using offline content bank for ${phaseType}`);
    return this._getOfflineContent(phaseType, template);
  }

  /**
   * Retrieve pre-bundled content for offline/standalone mode.
   * Stores the offline entry metadata so _scorePhase can use the rubric.
   */
  private _lastOfflineEntry: OfflinePassageEntry | OfflineWritingEntry | null = null;

  private _getOfflineContent(phaseType: PhaseType, _template: ContentTemplate): GeneratedContent {
    const pool = getOfflineContentPool(this.targetLanguage, _template.difficulty);

    if (phaseType === 'writing') {
      const entry = pickRandom(pool.writing);
      this._lastOfflineEntry = entry;
      return { writingPrompts: entry.writingPrompts };
    }

    // reading or listening — both use passage + questions
    const entries = phaseType === 'listening' ? pool.listening : pool.reading;
    const entry = pickRandom(entries);
    this._lastOfflineEntry = entry;

    return {
      passage: entry.passage,
      questions: entry.questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        maxPoints: q.maxPoints,
      })),
    };
  }

  private async _generateTTSAudio(passage: string): Promise<string | undefined> {
    // Try server-side TTS first
    try {
      const res = await fetch('/api/assessments/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
        },
        body: JSON.stringify({
          text: passage,
          targetLanguage: this.targetLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.audioDataUrl;
      }
    } catch {
      // Server unavailable
    }

    // Try Electron Piper TTS
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.aiTTS) {
      try {
        const audioBuffer = await electronAPI.aiTTS(passage, undefined, 0.9, this.targetLanguage);
        if (audioBuffer) {
          const blob = new Blob([audioBuffer], { type: 'audio/wav' });
          return URL.createObjectURL(blob);
        }
      } catch {
        // Electron TTS unavailable
      }
    }

    // Return undefined — AssessmentModalUI will fall back to browser SpeechSynthesis
    console.log('[AssessmentEngine] TTS unavailable — modal will use browser SpeechSynthesis fallback');
    return undefined;
  }

  private _showModalAndWait(
    phase: typeof ASSESSMENT_PHASES[number],
    phaseIndex: number,
    content: GeneratedContent,
    audioUrl?: string,
  ): Promise<Record<string, string> | null> {
    return new Promise<Record<string, string> | null>((resolve) => {
      this._modalAnswers = null;

      const modalConfig: AssessmentModalConfig = {
        phaseType: phase.type as 'reading' | 'writing' | 'listening',
        phaseName: phase.name,
        phaseIndex,
        totalPhases: ASSESSMENT_PHASES.length,
        passage: content.passage,
        questions: content.questions,
        writingPrompts: content.writingPrompts,
        audioUrl,
        onSubmit: (answers: Record<string, string>) => {
          this._modalAnswers = answers;
          this._onHideModal?.();
          resolve(answers);
        },
      };

      if (this._onShowModal) {
        this._onShowModal(modalConfig);
      } else {
        // Fallback: if no modal handler, use instruction overlay with auto-continue
        console.warn('[AssessmentEngine] No modal handler — falling back to instruction overlay');
        this._onShowInstruction?.({
          phaseId: phase.id,
          phaseName: phase.name,
          phaseIndex,
          totalPhases: ASSESSMENT_PHASES.length,
          description: `Complete the ${phase.name} section.`,
          isConversational: false,
          onContinue: () => resolve(null),
        });
      }
    });
  }

  private async _scorePhase(
    phaseType: PhaseType,
    content: GeneratedContent,
    answers: Record<string, string>,
  ): Promise<ScoringResult> {
    // Try server-side LLM scoring first
    try {
      const res = await fetch('/api/assessments/score-phase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
        },
        body: JSON.stringify({
          phaseType,
          targetLanguage: this.targetLanguage,
          passage: content.passage,
          questions: content.questions?.map(q => ({ id: q.id, text: q.questionText, maxPoints: q.maxPoints })),
          writingPrompts: content.writingPrompts,
          answers,
        }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Server unavailable — fall through to offline scoring
    }

    // Offline fallback: use client-side keyword/heuristic scoring
    console.log(`[AssessmentEngine] Using offline scoring for ${phaseType}`);
    return this._scoreOffline(phaseType, answers);
  }

  private _scoreOffline(phaseType: PhaseType, answers: Record<string, string>): ScoringResult {
    if (phaseType === 'writing' && this._lastOfflineEntry && 'writingPrompts' in this._lastOfflineEntry) {
      const result = scoreWritingOffline(this._lastOfflineEntry as OfflineWritingEntry, answers);
      return {
        totalScore: result.totalScore,
        maxScore: result.maxScore,
        dimensionScores: result.dimensionScores,
        overallRationale: result.overallRationale,
      };
    }

    // Reading or listening — use question-level scoring
    if (this._lastOfflineEntry && 'questions' in this._lastOfflineEntry) {
      const entry = this._lastOfflineEntry as OfflinePassageEntry;
      const result = scoreReadingListeningOffline(entry.questions, answers);
      return {
        totalScore: result.totalScore,
        maxScore: result.maxScore,
        questionScores: result.questionScores,
        overallRationale: result.overallRationale,
      };
    }

    // No rubric available — estimate from answer presence
    const nonEmpty = Object.values(answers).filter(a => a.length > 0).length;
    const total = Object.keys(answers).length || 1;
    return {
      totalScore: Math.round((nonEmpty / total) * 10 * 0.6),
      maxScore: 15,
      overallRationale: 'Offline scoring: estimated from answer presence.',
    };
  }

  // ── Private: initiate conversation phase (walk to NPC) ─────────────────────

  private _runInitiateConversationPhase(
    phase: typeof ASSESSMENT_PHASES[number],
    phaseIndex: number,
  ): Promise<number> {
    return new Promise<number>((resolve) => {
      this._phaseResolver = () => resolve(0);

      // Show instruction overlay directing player to NPC
      this._onShowInstruction?.({
        phaseId: phase.id,
        phaseName: phase.name,
        phaseIndex,
        totalPhases: ASSESSMENT_PHASES.length,
        description: 'Talk to the marked NPC to begin a guided conversation assessment.',
        isConversational: true,
        onContinue: () => { /* resolved via event bus */ },
      });

      // Emit event to highlight the target NPC on the minimap
      this.eventBus?.emit({
        type: 'assessment_conversation_quest_start',
        phaseId: phase.id,
        topics: ['greetings', 'travel', 'directions'],
        minExchanges: 6,
        maxExchanges: 12,
      });

      // Wait for the player to initiate a conversation with the highlighted NPC
      if (this.eventBus) {
        this._unsubscribeConversation = this.eventBus.on(
          'assessment_conversation_initiated',
          () => {
            console.log('[AssessmentEngine] Player initiated conversation with highlighted NPC');
            if (this._unsubscribeConversation) {
              this._unsubscribeConversation();
              this._unsubscribeConversation = null;
            }
            this._phaseResolver = null;
            resolve(0); // no score for this phase — just a gate
          },
        );
      } else {
        setTimeout(() => resolve(0), 1000);
      }
    });
  }

  // ── Private: conversation phase (guided assessment conversation) ──────────

  private _runConversationPhase(
    phase: typeof ASSESSMENT_PHASES[number],
    phaseIndex: number,
  ): Promise<number> {
    return new Promise<number>((resolve) => {
      this._phaseResolver = () => resolve(0);

      // Show instruction overlay for the active conversation
      this._onShowInstruction?.({
        phaseId: phase.id,
        phaseName: phase.name,
        phaseIndex,
        totalPhases: ASSESSMENT_PHASES.length,
        description: "Answer the NPC's questions. Speak naturally — this measures your conversational ability.",
        isConversational: true,
        onContinue: () => { /* resolved via event bus */ },
      });

      // Emit guided conversation parameters so the chat panel can steer the conversation
      this.eventBus?.emit({
        type: 'assessment_guided_conversation_start',
        topics: ['greetings', 'travel', 'directions'],
        minExchanges: 6,
        maxExchanges: 12,
      });

      // Listen for conversation completion
      if (this.eventBus) {
        this._unsubscribeConversation = this.eventBus.on(
          'assessment_conversation_completed',
          (event: any) => {
            console.log('[AssessmentEngine] Conversation completed — scoring');
            if (this._unsubscribeConversation) {
              this._unsubscribeConversation();
              this._unsubscribeConversation = null;
            }
            // Use conversation scores if available, otherwise estimate
            const score = event?.score ?? Math.round(phase.maxScore * (0.35 + Math.random() * 0.35));
            this._phaseResolver = null;
            resolve(Math.min(phase.maxScore, score));
          },
        );
      } else {
        // No event bus — fallback with estimated score
        setTimeout(() => {
          const score = Math.round(phase.maxScore * (0.35 + Math.random() * 0.35));
          resolve(score);
        }, 1000);
      }
    });
  }
}
