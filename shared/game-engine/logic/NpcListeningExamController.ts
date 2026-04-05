/**
 * NpcListeningExamController — Client-side orchestrator for NPC listening
 * comprehension exams.
 *
 * Uses the existing assessment infrastructure:
 *   - POST /api/assessments/generate-content (phaseType='listening')
 *   - POST /api/assessments/tts (audio generation)
 *   - POST /api/assessments/score-phase (answer scoring)
 *   - AssessmentModalUI (question display and answer collection)
 *
 * Flow:
 *   1. NPC initiates exam → controller generates content + TTS audio
 *   2. Chat panel enters "listening mode" (hides text, shows waveform)
 *   3. Audio plays through chat panel; player can request one replay
 *   4. AssessmentModalUI shows comprehension questions
 *   5. Answers scored via server; results emitted on event bus
 */

import type { GameEventBus } from './GameEventBus';
import type { AssessmentModalConfig } from '@shared/assessment/assessment-types';
import type { CEFRLevel, ContentTemplate } from '@shared/assessment/assessment-types';

// ── Types ───────────────────────────────────────────────────────────────────

export interface NpcListeningExamConfig {
  npcId: string;
  npcName: string;
  businessType: string;
  targetLanguage: string;
  cefrLevel: CEFRLevel;
  cityName?: string;
  authToken?: string;
}

export interface ListeningExamState {
  examId: string;
  status: 'generating' | 'listening' | 'answering' | 'scoring' | 'complete' | 'error';
  passage?: string;
  audioUrl?: string;
  questions?: Array<{ id: string; questionText: string; maxPoints: number }>;
  replaysUsed: number;
  maxReplays: number;
  result?: NpcExamResultClient;
}

export interface NpcExamResultClient {
  examId: string;
  npcId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  questionScores?: Array<{ questionId: string; score: number; maxScore: number; rationale: string }>;
  overallRationale: string;
}

// ── Business Context Templates (client mirror) ─────────────────────────────

const LISTENING_EXAM_TEMPLATES: Record<string, ContentTemplate> = {
  bakery: {
    topic: 'A baker describing today\'s fresh bread varieties, their ingredients, prices, and a special pastry recommendation for a visitor.',
    difficulty: 'beginner',
    lengthSentences: 4,
    questionCount: 3,
  },
  restaurant: {
    topic: 'A waiter reciting the daily specials, describing each dish\'s main ingredients, portion sizes, and recommending a popular local dish.',
    difficulty: 'beginner',
    lengthSentences: 5,
    questionCount: 3,
  },
  blacksmith: {
    topic: 'A blacksmith explaining the types of tools and weapons available, the materials used, current prices, and how long a custom order takes.',
    difficulty: 'intermediate',
    lengthSentences: 5,
    questionCount: 3,
  },
  market: {
    topic: 'A market vendor describing seasonal fruits and vegetables, their prices per kilo, where they were grown, and a recipe suggestion.',
    difficulty: 'beginner',
    lengthSentences: 4,
    questionCount: 3,
  },
  inn: {
    topic: 'An innkeeper describing available rooms, nightly rates, meal times, house rules, and nearby points of interest for travelers.',
    difficulty: 'intermediate',
    lengthSentences: 5,
    questionCount: 3,
  },
  guide: {
    topic: 'A local guide giving directions to three landmarks, describing the walking time, what to see along the way, and a warning about a closed road.',
    difficulty: 'intermediate',
    lengthSentences: 5,
    questionCount: 3,
  },
};

interface CefrAdaptation {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lengthSentences: number;
  ttsSpeed: number;
  maxReplays: number;
}

function getCefrAdaptation(level: CEFRLevel): CefrAdaptation {
  switch (level) {
    case 'A1': return { difficulty: 'beginner', lengthSentences: 2, ttsSpeed: 0.7, maxReplays: 2 };
    case 'A2': return { difficulty: 'beginner', lengthSentences: 4, ttsSpeed: 0.85, maxReplays: 1 };
    case 'B1': return { difficulty: 'intermediate', lengthSentences: 5, ttsSpeed: 1.0, maxReplays: 1 };
    case 'B2': return { difficulty: 'advanced', lengthSentences: 6, ttsSpeed: 1.0, maxReplays: 0 };
    case 'C1': return { difficulty: 'advanced', lengthSentences: 8, ttsSpeed: 1.1, maxReplays: 0 };
    case 'C2': return { difficulty: 'advanced', lengthSentences: 10, ttsSpeed: 1.2, maxReplays: 0 };
    default: return { difficulty: 'beginner', lengthSentences: 4, ttsSpeed: 0.85, maxReplays: 1 };
  }
}

const MAX_POINTS = 13;
const PASS_THRESHOLD = 0.6;

// ── Controller ──────────────────────────────────────────────────────────────

export class NpcListeningExamController {
  private eventBus: GameEventBus | null;
  private _onShowModal: ((config: AssessmentModalConfig) => void) | null = null;
  private _onHideModal: (() => void) | null = null;
  private _onEnterListeningMode: ((npcId: string, audioUrl: string, onReplay: () => void, maxReplays: number) => void) | null = null;
  private _onExitListeningMode: (() => void) | null = null;
  private activeExam: ListeningExamState | null = null;

  constructor(eventBus?: GameEventBus) {
    this.eventBus = eventBus ?? null;
  }

  // ── Callback Registration ───────────────────────────────────────────────

  onShowModal(cb: (config: AssessmentModalConfig) => void): void {
    this._onShowModal = cb;
  }

  onHideModal(cb: () => void): void {
    this._onHideModal = cb;
  }

  onEnterListeningMode(cb: (npcId: string, audioUrl: string, onReplay: () => void, maxReplays: number) => void): void {
    this._onEnterListeningMode = cb;
  }

  onExitListeningMode(cb: () => void): void {
    this._onExitListeningMode = cb;
  }

  // ── Public API ──────────────────────────────────────────────────────────

  getActiveExam(): ListeningExamState | null {
    return this.activeExam;
  }

  isExamActive(): boolean {
    return this.activeExam !== null && this.activeExam.status !== 'complete' && this.activeExam.status !== 'error';
  }

  /**
   * Start a listening comprehension exam initiated by an NPC.
   * Generates content, plays audio, shows questions, and scores answers.
   */
  async startExam(config: NpcListeningExamConfig): Promise<NpcExamResultClient | null> {
    if (this.isExamActive()) {
      console.warn('[NpcListeningExam] Exam already in progress');
      return null;
    }

    const adaptation = getCefrAdaptation(config.cefrLevel);
    const template = this.resolveTemplate(config.businessType, adaptation);

    const examId = `npc_exam_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    this.activeExam = {
      examId,
      status: 'generating',
      replaysUsed: 0,
      maxReplays: adaptation.maxReplays,
    };

    // Emit exam started event
    this.eventBus?.emit({
      type: 'npc_exam_started',
      examId,
      npcId: config.npcId,
      npcName: config.npcName,
      businessType: config.businessType,
      examType: 'listening_comprehension',
    });

    console.log(`[NpcListeningExam] Starting exam ${examId} — ${config.businessType} (${config.cefrLevel})`);

    try {
      // Step 1: Generate listening content
      const content = await this.generateContent(config, template);
      if (!content.passage || !content.questions?.length) {
        throw new Error('Content generation returned empty passage or questions');
      }

      this.activeExam.passage = content.passage;
      this.activeExam.questions = content.questions;

      // Step 2: Generate TTS audio
      const audioUrl = await this.generateTTS(content.passage, config.targetLanguage, config.authToken);
      this.activeExam.audioUrl = audioUrl;

      // Emit ready event
      this.eventBus?.emit({
        type: 'npc_exam_listening_ready',
        examId,
        audioUrl,
        passage: content.passage,
        questions: content.questions,
        maxReplays: adaptation.maxReplays,
      });

      // Step 3: Enter listening mode (audio plays, text hidden)
      this.activeExam.status = 'listening';
      await this.playListeningPhase(config.npcId, audioUrl, adaptation.maxReplays);

      // Step 4: Show comprehension questions via modal
      this.activeExam.status = 'answering';
      this._onExitListeningMode?.();
      const answers = await this.showQuestionModal(content.passage, content.questions);

      if (!answers) {
        this.activeExam.status = 'error';
        return null;
      }

      // Step 5: Score answers
      this.activeExam.status = 'scoring';
      const scoring = await this.scoreAnswers(
        config.targetLanguage,
        content.passage,
        content.questions,
        answers,
        config.authToken,
      );

      // Step 6: Build result
      const totalScore = Math.min(MAX_POINTS, scoring.totalScore);
      const percentage = Math.round((totalScore / MAX_POINTS) * 100);
      const result: NpcExamResultClient = {
        examId,
        npcId: config.npcId,
        totalScore,
        maxScore: MAX_POINTS,
        percentage,
        passed: totalScore / MAX_POINTS >= PASS_THRESHOLD,
        questionScores: scoring.questionScores,
        overallRationale: scoring.overallRationale,
      };

      this.activeExam.result = result;
      this.activeExam.status = 'complete';

      // Emit completion event
      this.eventBus?.emit({
        type: 'npc_exam_completed',
        examId,
        npcId: config.npcId,
        score: result.totalScore,
        maxScore: result.maxScore,
        percentage: result.percentage,
        passed: result.passed,
      });

      console.log(`[NpcListeningExam] Exam ${examId} complete — ${result.totalScore}/${result.maxScore} (${result.passed ? 'PASSED' : 'FAILED'})`);
      return result;

    } catch (error) {
      console.error('[NpcListeningExam] Exam failed:', error);
      this.activeExam.status = 'error';
      this._onExitListeningMode?.();
      return null;
    }
  }

  /**
   * Cancel an active exam.
   */
  cancelExam(): void {
    if (this.activeExam) {
      console.log(`[NpcListeningExam] Cancelling exam ${this.activeExam.examId}`);
      this.activeExam.status = 'error';
      this.activeExam = null;
      this._onExitListeningMode?.();
      this._onHideModal?.();
    }
  }

  dispose(): void {
    this.cancelExam();
    this._onShowModal = null;
    this._onHideModal = null;
    this._onEnterListeningMode = null;
    this._onExitListeningMode = null;
    this.eventBus = null;
  }

  // ── Private: Content Generation ─────────────────────────────────────────

  private resolveTemplate(businessType: string, adaptation: CefrAdaptation): ContentTemplate {
    const base = LISTENING_EXAM_TEMPLATES[businessType] ?? LISTENING_EXAM_TEMPLATES.guide;
    return {
      ...base,
      difficulty: adaptation.difficulty,
      lengthSentences: adaptation.lengthSentences,
    };
  }

  private async generateContent(
    config: NpcListeningExamConfig,
    template: ContentTemplate,
  ): Promise<{ passage?: string; questions?: Array<{ id: string; questionText: string; maxPoints: number }> }> {
    // TODO: Listening exam content generation should be folded into the quest/Prolog system.
    // quest_language(listening_exam, french) triggers the quest flow which generates content
    // as part of the NPC conversation. Results stored as Prolog facts.
    console.warn('[NpcListeningExam] Content generation stubbed — TODO: integrate via quest_language predicates');
    throw new Error('Listening exam content generation pending quest/Prolog integration');
  }

  private async generateTTS(
    passage: string,
    targetLanguage: string,
    authToken?: string,
  ): Promise<string> {
    // TODO: Assessment TTS should route through @insimul/typescript SDK's synthesizeSpeech().
    // When folded into quests, TTS is part of the NPC conversation flow.
    console.warn('[NpcListeningExam] TTS stubbed — TODO: route through SDK or quest conversation');
    try {
      const { getInsimulClient } = await import('@shared/game-engine/InsimulClientRegistry');
      const client = getInsimulClient();
      if (client) {
        const buffer = await client.synthesizeSpeech(passage);
        if (buffer) {
          const blob = new Blob([buffer], { type: 'audio/mp3' });
          return URL.createObjectURL(blob);
        }
      }
    } catch { /* SDK not available */ }
    throw new Error('TTS unavailable — SDK or quest system not initialized');
  }

  // ── Private: Listening Phase ────────────────────────────────────────────

  private playListeningPhase(
    npcId: string,
    audioUrl: string,
    maxReplays: number,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this._onEnterListeningMode) {
        let replaysUsed = 0;

        const onReplay = () => {
          if (replaysUsed < maxReplays) {
            replaysUsed++;
            if (this.activeExam) {
              this.activeExam.replaysUsed = replaysUsed;
            }
          }
        };

        this._onEnterListeningMode(npcId, audioUrl, onReplay, maxReplays);

        // Audio plays via the chat panel's listening mode.
        // Resolve after a reasonable listening period (audio duration + buffer).
        // The actual audio playback is handled by the chat panel.
        const audio = new Audio(audioUrl);
        audio.addEventListener('loadedmetadata', () => {
          // Wait for audio duration + replay time + small buffer
          const totalTime = (audio.duration * 1000) * (1 + maxReplays) + 3000;
          setTimeout(resolve, Math.min(totalTime, 60000));
        });
        audio.addEventListener('error', () => {
          // If audio fails to load, resolve after a short delay
          setTimeout(resolve, 5000);
        });
        // Fallback timeout
        setTimeout(resolve, 30000);
      } else {
        // No listening mode handler — skip straight to questions
        resolve();
      }
    });
  }

  // ── Private: Question Modal ─────────────────────────────────────────────

  private showQuestionModal(
    passage: string,
    questions: Array<{ id: string; questionText: string; maxPoints: number }>,
  ): Promise<Record<string, string> | null> {
    return new Promise<Record<string, string> | null>((resolve) => {
      if (!this._onShowModal) {
        console.warn('[NpcListeningExam] No modal handler — cannot show questions');
        resolve(null);
        return;
      }

      const config: AssessmentModalConfig = {
        phaseType: 'listening',
        phaseName: 'Listening Comprehension',
        phaseIndex: 0,
        totalPhases: 1,
        passage, // Passage is passed but NOT displayed in listening mode
        questions,
        audioUrl: this.activeExam?.audioUrl,
        onSubmit: (answers) => {
          this._onHideModal?.();
          resolve(answers);
        },
      };

      this._onShowModal(config);
    });
  }

  // ── Private: Scoring ────────────────────────────────────────────────────

  private async scoreAnswers(
    targetLanguage: string,
    passage: string,
    questions: Array<{ id: string; questionText: string; maxPoints: number }>,
    answers: Record<string, string>,
    authToken?: string,
  ): Promise<{
    totalScore: number;
    maxScore: number;
    questionScores?: Array<{ questionId: string; score: number; maxScore: number; rationale: string }>;
    overallRationale: string;
  }> {
    // TODO: Listening exam scoring should be folded into the quest/Prolog system.
    // Results stored as Prolog facts: listening_score(PlayerID, ExamID, Score, MaxScore).
    console.warn('[NpcListeningExam] Scoring stubbed — TODO: integrate via quest_language Prolog predicates');
    // Return a basic heuristic score based on answer presence
    let totalScore = 0;
    const maxScore = questions.reduce((sum, q) => sum + q.maxPoints, 0);
    const questionScores = questions.map(q => {
      const answer = answers[q.id] || '';
      const score = answer.trim().length > 0 ? Math.round(q.maxPoints * 0.5) : 0;
      totalScore += score;
      return { questionId: q.id, score, maxScore: q.maxPoints, rationale: 'Heuristic scoring — pending Prolog integration' };
    });
    return { totalScore, maxScore, questionScores, overallRationale: 'Scoring pending quest/Prolog integration' };
  }
}
