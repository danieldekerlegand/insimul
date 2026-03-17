/**
 * NPCExamEngine — Orchestrates NPC-triggered reading and writing exams.
 *
 * Lightweight wrapper around the existing assessment infrastructure that:
 * 1. Builds a CEFR-adaptive exam encounter (1-2 phases: reading/writing)
 * 2. Generates content via POST /api/assessments/generate-content
 * 3. Displays phases via AssessmentModalUI
 * 4. Scores answers via POST /api/assessments/score-phase
 * 5. Emits results on the GameEventBus
 *
 * Triggered by teacher/professor NPCs, quest milestones, or time intervals.
 */

import type { GameEventBus } from './GameEventBus';
import type { AssessmentModalConfig } from './AssessmentModalUI';
import type { CEFRLevel, ContentTemplate, PhaseType } from '../../../../shared/assessment/assessment-types';
import {
  buildNPCExamEncounter,
  type BusinessContext,
  type NPCExamType,
} from '../../../../shared/assessment/npc-exam-encounter';
import { mapScoreToCEFR } from '../../../../shared/assessment/cefr-mapping';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NPCExamConfig {
  /** Auth token for API calls */
  authToken: string;
  /** Target language being assessed */
  targetLanguage: string;
  /** City name for content generation context */
  cityName: string;
  /** Player's current CEFR level */
  cefrLevel: CEFRLevel;
  /** Which phases to include */
  examType: NPCExamType;
  /** Optional business context for themed prompts */
  businessContext?: BusinessContext;
  /** NPC who triggered the exam (for event emission) */
  npcId?: string;
  /** NPC name (for UI display) */
  npcName?: string;
  /** Player ID */
  playerId?: string;
  /** World ID */
  worldId?: string;
}

export interface NPCExamResult {
  examType: NPCExamType;
  totalScore: number;
  maxScore: number;
  cefrLevel: CEFRLevel;
  phaseResults: Array<{
    phaseId: string;
    phaseType: PhaseType;
    score: number;
    maxScore: number;
    dimensionScores?: Record<string, number>;
  }>;
  npcId?: string;
  completedAt: number;
}

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

// ─── Engine ──────────────────────────────────────────────────────────────────

export class NPCExamEngine {
  private eventBus: GameEventBus | null;
  private _aborted = false;
  private _onShowModal?: (config: AssessmentModalConfig) => void;
  private _onHideModal?: () => void;
  private _onExamStarted?: (examType: NPCExamType, npcName?: string) => void;
  private _onPhaseCompleted?: (phaseId: string, score: number, maxScore: number) => void;
  private _onExamCompleted?: (result: NPCExamResult) => void;

  constructor(eventBus?: GameEventBus) {
    this.eventBus = eventBus ?? null;
  }

  // ── Callback registration ──────────────────────────────────────────────

  onShowModal(cb: (config: AssessmentModalConfig) => void): void { this._onShowModal = cb; }
  onHideModal(cb: () => void): void { this._onHideModal = cb; }
  onExamStarted(cb: (examType: NPCExamType, npcName?: string) => void): void { this._onExamStarted = cb; }
  onPhaseCompleted(cb: (phaseId: string, score: number, maxScore: number) => void): void { this._onPhaseCompleted = cb; }
  onExamCompleted(cb: (result: NPCExamResult) => void): void { this._onExamCompleted = cb; }

  // ── Main entry point ───────────────────────────────────────────────────

  async runExam(config: NPCExamConfig): Promise<NPCExamResult | null> {
    this._aborted = false;
    const encounter = buildNPCExamEncounter(config.examType, config.cefrLevel, config.businessContext);

    console.log(`[NPCExamEngine] Starting ${config.examType} exam at ${config.cefrLevel} level`);
    this._onExamStarted?.(config.examType, config.npcName);

    this.eventBus?.emit({
      type: 'assessment_started',
      sessionId: encounter.id,
      instrumentId: 'npc_exam',
      phase: 'npc_exam',
      participantId: config.playerId ?? '',
      assessmentType: `npc_exam_${config.examType}`,
      playerId: config.playerId,
    });

    const phaseResults: NPCExamResult['phaseResults'] = [];
    let totalScore = 0;

    for (let i = 0; i < encounter.phases.length; i++) {
      if (this._aborted) return null;

      const phase = encounter.phases[i];
      const task = phase.tasks[0];
      if (!task?.contentTemplate) continue;

      this.eventBus?.emit({
        type: 'assessment_phase_started',
        sessionId: encounter.id,
        instrumentId: 'npc_exam',
        phase: phase.type,
        phaseId: phase.id,
        phaseIndex: i,
      });

      // Generate content
      let content: GeneratedContent = {};
      try {
        content = await this._generateContent(
          phase.type as PhaseType,
          task.contentTemplate,
          config,
        );
      } catch (err) {
        console.warn('[NPCExamEngine] Content generation failed:', err);
      }

      if (this._aborted) return null;

      // Show modal and wait for answers
      const answers = await this._showModalAndWait(phase, i, encounter.phases.length, content);
      if (this._aborted || !answers) continue;

      // Score
      let phaseScore = 0;
      let dimensionScores: Record<string, number> | undefined;
      try {
        const scoring = await this._scorePhase(phase.type as PhaseType, content, answers, config);
        phaseScore = Math.min(phase.maxScore ?? 0, scoring.totalScore);
        if (scoring.dimensionScores) {
          dimensionScores = {};
          for (const [key, val] of Object.entries(scoring.dimensionScores)) {
            dimensionScores[key] = val.score;
          }
        }
      } catch (err) {
        console.warn('[NPCExamEngine] Scoring failed, estimating:', err);
        const nonEmpty = Object.values(answers).filter(a => a.length > 0).length;
        const totalFields = Object.keys(answers).length || 1;
        phaseScore = Math.round((nonEmpty / totalFields) * (phase.maxScore ?? 0) * 0.5);
      }

      totalScore += phaseScore;
      phaseResults.push({
        phaseId: phase.id,
        phaseType: phase.type as PhaseType,
        score: phaseScore,
        maxScore: phase.maxScore ?? 0,
        dimensionScores,
      });

      this._onPhaseCompleted?.(phase.id, phaseScore, phase.maxScore ?? 0);
      this._onHideModal?.();

      this.eventBus?.emit({
        type: 'assessment_phase_completed',
        sessionId: encounter.id,
        instrumentId: 'npc_exam',
        phase: phase.type,
        score: phaseScore,
        phaseId: phase.id,
        maxScore: phase.maxScore,
      });
    }

    if (this._aborted) return null;

    const cefrResult = mapScoreToCEFR(totalScore, encounter.totalMaxPoints);
    const result: NPCExamResult = {
      examType: config.examType,
      totalScore,
      maxScore: encounter.totalMaxPoints,
      cefrLevel: cefrResult.level,
      phaseResults,
      npcId: config.npcId,
      completedAt: Date.now(),
    };

    console.log(`[NPCExamEngine] Exam complete — ${totalScore}/${encounter.totalMaxPoints} (${cefrResult.level})`);
    this._onExamCompleted?.(result);

    this.eventBus?.emit({
      type: 'assessment_completed',
      sessionId: encounter.id,
      instrumentId: 'npc_exam',
      totalScore,
      totalMaxScore: encounter.totalMaxPoints,
      cefrLevel: cefrResult.level,
    });

    return result;
  }

  abort(): void {
    this._aborted = true;
    this._onHideModal?.();
  }

  dispose(): void {
    this.abort();
    this._onShowModal = undefined;
    this._onHideModal = undefined;
    this._onExamStarted = undefined;
    this._onPhaseCompleted = undefined;
    this._onExamCompleted = undefined;
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private async _generateContent(
    phaseType: PhaseType,
    template: ContentTemplate,
    config: NPCExamConfig,
  ): Promise<GeneratedContent> {
    const res = await fetch('/api/assessments/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.authToken ? { Authorization: `Bearer ${config.authToken}` } : {}),
      },
      body: JSON.stringify({
        phaseType,
        targetLanguage: config.targetLanguage,
        cityName: config.cityName,
        contentTemplate: template,
      }),
    });

    if (!res.ok) throw new Error(`Content generation failed: ${res.status}`);
    return await res.json();
  }

  private _showModalAndWait(
    phase: { id: string; name: string; type: string },
    phaseIndex: number,
    totalPhases: number,
    content: GeneratedContent,
  ): Promise<Record<string, string> | null> {
    return new Promise<Record<string, string> | null>((resolve) => {
      if (!this._onShowModal) {
        console.warn('[NPCExamEngine] No modal handler registered');
        resolve(null);
        return;
      }

      const modalConfig: AssessmentModalConfig = {
        phaseType: phase.type as 'reading' | 'writing',
        phaseName: phase.name,
        phaseIndex,
        totalPhases,
        passage: content.passage,
        questions: content.questions,
        writingPrompts: content.writingPrompts,
        onSubmit: (answers: Record<string, string>) => {
          this._onHideModal?.();
          resolve(answers);
        },
      };

      this._onShowModal(modalConfig);
    });
  }

  private async _scorePhase(
    phaseType: PhaseType,
    content: GeneratedContent,
    answers: Record<string, string>,
    config: NPCExamConfig,
  ): Promise<ScoringResult> {
    const res = await fetch('/api/assessments/score-phase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.authToken ? { Authorization: `Bearer ${config.authToken}` } : {}),
      },
      body: JSON.stringify({
        phaseType,
        targetLanguage: config.targetLanguage,
        passage: content.passage,
        questions: content.questions?.map(q => ({ id: q.id, text: q.questionText, maxPoints: q.maxPoints })),
        writingPrompts: content.writingPrompts,
        answers,
      }),
    });

    if (!res.ok) throw new Error(`Scoring failed: ${res.status}`);
    return await res.json();
  }
}
