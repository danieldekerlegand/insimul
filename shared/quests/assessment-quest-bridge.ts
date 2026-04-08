/**
 * Assessment Quest Bridge (Server)
 *
 * Re-exports shared bridge functions for the arrival assessment and adds:
 * - Server-typed buildArrivalAssessmentQuest that returns InsertQuest
 * - Departure assessment quest creation, phase completion, eligibility, and report card generation
 */

// ── Arrival assessment (shared) ─────────────────────────────────────────────

export {
  type AssessmentQuestObjective,
  type AssessmentQuestConfig,
  markPhaseObjectiveComplete,
  computeProgress,
  isArrivalAssessmentQuest,
  getArrivalPhaseIds,
} from '../services/assessment-quest-bridge-shared.js';

import { buildArrivalAssessmentQuest as buildShared } from '../services/assessment-quest-bridge-shared.js';
import type { AssessmentQuestConfig } from '../services/assessment-quest-bridge-shared.js';
import type { InsertQuest, Quest } from '../schema.js';
import type {
  AssessmentSession,
  AssessmentDimensionScores,
  AssessmentPhaseResult,
  AssessmentCompletionResult,
  CEFRLevel,
  PhaseType,
} from '../assessment/assessment-types.js';
import { DEPARTURE_ENCOUNTER } from '../assessment/departure-encounter.js';
import { mapScoreToCEFR } from '../assessment/cefr-mapping.js';
import { generateAssessmentPrologContent } from '../prolog/assessment-prolog-generator.js';

/**
 * Server-typed version that returns InsertQuest.
 */
export function buildArrivalAssessmentQuest(config: AssessmentQuestConfig): InsertQuest {
  return buildShared(config) as InsertQuest;
}

// ── Departure assessment types ──────────────────────────────────────────────

export interface DimensionDelta {
  dimension: keyof AssessmentDimensionScores;
  before: number;
  after: number;
  delta: number;
}

export interface PhaseDelta {
  phaseType: PhaseType;
  phaseName: string;
  beforeScore: number;
  afterScore: number;
  maxScore: number;
  delta: number;
}

export interface LearningReportCard {
  playerId: string;
  worldId: string;
  /** Arrival (pre-test) session data */
  arrivalSessionId: string;
  /** Departure (post-test) session data */
  departureSessionId: string;
  /** CEFR level at arrival */
  arrivalCefrLevel: CEFRLevel;
  /** CEFR level at departure */
  departureCefrLevel: CEFRLevel;
  /** Whether CEFR level improved */
  cefrImproved: boolean;
  /** Total score comparison */
  arrivalTotalScore: number;
  departureTotalScore: number;
  maxScore: number;
  totalDelta: number;
  /** Per-phase score deltas */
  phaseDeltas: PhaseDelta[];
  /** Per-dimension score deltas (comprehension, fluency, vocabulary, grammar, pronunciation) */
  dimensionDeltas: DimensionDelta[];
  /** Summary of periodic (mid-game) assessment scores for progress trajectory */
  periodicSnapshots: PeriodicSnapshot[];
  /** Generated at this timestamp */
  generatedAt: number;
}

export interface PeriodicSnapshot {
  sessionId: string;
  totalScore: number;
  maxScore: number;
  cefrLevel: CEFRLevel;
  completedAt: number;
}

/** Minimum number of completed quests before departure assessment is offered */
export const DEPARTURE_QUEST_THRESHOLD = 10;

// ── Phase-to-objective mapping ───────────────────────────────────────────────

const PHASE_OBJECTIVES = DEPARTURE_ENCOUNTER.phases.map((phase) => ({
  type: phase.type === 'conversation' ? 'complete_conversation' : 'listening_comprehension',
  objectiveId: phase.id,
  description: `Complete ${phase.name} assessment phase`,
  target: phase.id,
  required: 1,
  completed: false,
  progress: 0,
  phaseType: phase.type,
  maxScore: phase.maxScore ?? 0,
}));

// ── Departure quest creation ─────────────────────────────────────────────────

/**
 * Create a departure assessment quest record ready for insertion.
 * Each of the 4 assessment phases becomes a quest objective.
 */
export function createDepartureAssessmentQuest(params: {
  worldId: string;
  playerName: string;
  playerCharacterId?: string;
  targetLanguage: string;
}): InsertQuest {
  return {
    worldId: params.worldId,
    assignedTo: params.playerName,
    assignedBy: 'System',
    assignedToCharacterId: params.playerCharacterId,
    title: 'Departure Assessment',
    description:
      `Complete your final ${params.targetLanguage} proficiency assessment before departing. ` +
      'This measures how much you have learned during your stay.',
    questType: 'assessment',
    difficulty: 'intermediate',
    targetLanguage: params.targetLanguage,
    objectives: PHASE_OBJECTIVES.map((obj) => ({ ...obj })),
    progress: { currentPhaseIndex: 0, phasesCompleted: 0 },
    status: 'active',
    completionCriteria: {
      type: 'all_objectives',
      assessmentDefinitionId: DEPARTURE_ENCOUNTER.id,
    },
    experienceReward: 500,
    rewards: {
      type: 'report_card',
      description: 'Language Learning Report Card comparing your arrival and departure scores',
    },
    tags: ['assessment', 'departure', 'non-skippable'],
    content: generateAssessmentPrologContent({
      encounter: DEPARTURE_ENCOUNTER,
      difficulty: 'intermediate',
      targetLanguage: params.targetLanguage,
      tags: ['assessment', 'departure', 'non-skippable'],
      experienceReward: 500,
      departureThreshold: DEPARTURE_QUEST_THRESHOLD,
    }),
  };
}

// ── Phase completion ─────────────────────────────────────────────────────────

/**
 * Update the departure assessment quest when a phase is completed.
 * Returns the updated objectives and progress, or null if the phase
 * doesn't match any objective.
 */
export function markPhaseCompleted(
  quest: Quest,
  phaseId: string,
  phaseScore: number,
): { objectives: any[]; progress: Record<string, any>; allComplete: boolean } | null {
  const objectives = (quest.objectives as any[]) ?? [];
  const idx = objectives.findIndex((obj: any) => obj.objectiveId === phaseId);
  if (idx === -1) return null;

  const updated = objectives.map((obj: any, i: number) =>
    i === idx ? { ...obj, completed: true, progress: 1, score: phaseScore } : obj,
  );

  const phasesCompleted = updated.filter((obj: any) => obj.completed).length;
  const allComplete = phasesCompleted === updated.length;

  return {
    objectives: updated,
    progress: { currentPhaseIndex: phasesCompleted, phasesCompleted },
    allComplete,
  };
}

// ── Eligibility check ────────────────────────────────────────────────────────

/**
 * Check whether a player is eligible for the departure assessment.
 * Requires completing at least DEPARTURE_QUEST_THRESHOLD quests.
 */
export function isDepartureEligible(completedQuestCount: number): boolean {
  return completedQuestCount >= DEPARTURE_QUEST_THRESHOLD;
}

// ── Report card generation ───────────────────────────────────────────────────

const DIMENSION_KEYS: (keyof AssessmentDimensionScores)[] = [
  'comprehension',
  'fluency',
  'vocabulary',
  'grammar',
  'pronunciation',
];

const PHASE_TYPE_ORDER: PhaseType[] = ['reading', 'writing', 'listening', 'conversation'];

/**
 * Compare arrival and departure assessment sessions to produce a
 * Language Learning Report Card with improvement deltas.
 */
export function generateReportCard(params: {
  playerId: string;
  worldId: string;
  arrivalSession: AssessmentSession;
  departureSession: AssessmentSession;
  periodicSessions: AssessmentSession[];
}): LearningReportCard {
  const { playerId, worldId, arrivalSession, departureSession, periodicSessions } = params;

  const arrivalTotal = arrivalSession.totalScore ?? 0;
  const departureTotal = departureSession.totalScore ?? 0;
  const maxScore = DEPARTURE_ENCOUNTER.totalMaxPoints;

  const arrivalCefr = resolveCefrLevel(arrivalSession, maxScore);
  const departureCefr = resolveCefrLevel(departureSession, maxScore);

  // Per-phase deltas
  const phaseDeltas = buildPhaseDeltas(arrivalSession, departureSession);

  // Per-dimension deltas
  const dimensionDeltas = buildDimensionDeltas(
    arrivalSession.dimensionScores,
    departureSession.dimensionScores,
  );

  // Periodic snapshots for progress trajectory
  const periodicSnapshots: PeriodicSnapshot[] = periodicSessions
    .filter((s) => s.completedAt)
    .sort((a, b) => toTimestamp(a.completedAt!) - toTimestamp(b.completedAt!))
    .map((s) => ({
      sessionId: s.id,
      totalScore: s.totalScore ?? 0,
      maxScore: s.totalMaxPoints,
      cefrLevel: resolveCefrLevel(s, s.totalMaxPoints),
      completedAt: toTimestamp(s.completedAt!),
    }));

  return {
    playerId,
    worldId,
    arrivalSessionId: arrivalSession.id,
    departureSessionId: departureSession.id,
    arrivalCefrLevel: arrivalCefr,
    departureCefrLevel: departureCefr,
    cefrImproved: cefrRank(departureCefr) > cefrRank(arrivalCefr),
    arrivalTotalScore: arrivalTotal,
    departureTotalScore: departureTotal,
    maxScore,
    totalDelta: departureTotal - arrivalTotal,
    phaseDeltas,
    dimensionDeltas,
    periodicSnapshots,
    generatedAt: Date.now(),
  };
}

// ── Report card from quest overlays ─────────────────────────────────────

/**
 * Data extracted from a quest overlay for report card generation.
 * The quest overlay stores phaseResults and assessmentResult when
 * an assessment is completed during gameplay.
 */
export interface QuestOverlayAssessmentData {
  questId: string;
  phaseResults: AssessmentPhaseResult[];
  assessmentResult: AssessmentCompletionResult;
}

/**
 * Generate a LearningReportCard from quest overlay data instead of
 * AssessmentSession objects. Used when assessment results are stored
 * in the quest overlay (save file) rather than the AssessmentSession collection.
 *
 * Find arrival/departure quests by tags: ['assessment', 'arrival'] / ['assessment', 'departure']
 */
export function generateReportCardFromOverlays(params: {
  playerId: string;
  worldId: string;
  arrivalData: QuestOverlayAssessmentData;
  departureData: QuestOverlayAssessmentData;
  periodicData?: QuestOverlayAssessmentData[];
}): LearningReportCard {
  const { playerId, worldId, arrivalData, departureData, periodicData } = params;

  const arrivalTotal = arrivalData.assessmentResult.totalScore;
  const departureTotal = departureData.assessmentResult.totalScore;
  const maxScore = departureData.assessmentResult.maxScore;

  const arrivalCefr = arrivalData.assessmentResult.cefrLevel;
  const departureCefr = departureData.assessmentResult.cefrLevel;

  // Per-phase deltas from overlay phase results
  const phaseDeltas = buildPhaseeDeltasFromOverlays(
    arrivalData.phaseResults,
    departureData.phaseResults,
  );

  // Per-dimension deltas from overlay dimension scores
  const dimensionDeltas = buildDimensionDeltas(
    arrivalData.assessmentResult.dimensionScores as Record<string, number> | undefined,
    departureData.assessmentResult.dimensionScores as Record<string, number> | undefined,
  );

  // Periodic snapshots from overlay data
  const periodicSnapshots: PeriodicSnapshot[] = (periodicData ?? [])
    .filter((d) => d.assessmentResult.completedAt)
    .sort((a, b) =>
      toTimestamp(a.assessmentResult.completedAt) - toTimestamp(b.assessmentResult.completedAt),
    )
    .map((d) => ({
      sessionId: d.questId,
      totalScore: d.assessmentResult.totalScore,
      maxScore: d.assessmentResult.maxScore,
      cefrLevel: d.assessmentResult.cefrLevel,
      completedAt: toTimestamp(d.assessmentResult.completedAt),
    }));

  return {
    playerId,
    worldId,
    arrivalSessionId: arrivalData.questId,
    departureSessionId: departureData.questId,
    arrivalCefrLevel: arrivalCefr,
    departureCefrLevel: departureCefr,
    cefrImproved: cefrRank(departureCefr) > cefrRank(arrivalCefr),
    arrivalTotalScore: arrivalTotal,
    departureTotalScore: departureTotal,
    maxScore,
    totalDelta: departureTotal - arrivalTotal,
    phaseDeltas,
    dimensionDeltas,
    periodicSnapshots,
    generatedAt: Date.now(),
  };
}

/**
 * Extract assessment data from a quest's overlay for report card generation.
 * Returns null if the quest doesn't have assessment overlay data.
 */
export function extractOverlayAssessmentData(
  quest: { id: string; [key: string]: any },
): QuestOverlayAssessmentData | null {
  const phaseResults = quest.phaseResults as AssessmentPhaseResult[] | undefined;
  const assessmentResult = quest.assessmentResult as AssessmentCompletionResult | undefined;

  if (!phaseResults || !assessmentResult) return null;

  return {
    questId: quest.id,
    phaseResults,
    assessmentResult,
  };
}

function buildPhaseeDeltasFromOverlays(
  arrivalPhases: AssessmentPhaseResult[],
  departurePhases: AssessmentPhaseResult[],
): PhaseDelta[] {
  return PHASE_TYPE_ORDER.map((phaseType) => {
    const phaseDef = DEPARTURE_ENCOUNTER.phases.find((p) => p.type === phaseType);
    const arrivalPhase = arrivalPhases.find((pr) => pr.phaseId.includes(phaseType));
    const departurePhase = departurePhases.find((pr) => pr.phaseId.includes(phaseType));

    const beforeScore = arrivalPhase?.score ?? 0;
    const afterScore = departurePhase?.score ?? 0;
    const maxPhaseScore = phaseDef?.maxScore ?? phaseDef?.maxPoints ?? 0;

    return {
      phaseType,
      phaseName: phaseDef?.name ?? phaseType,
      beforeScore,
      afterScore,
      maxScore: maxPhaseScore,
      delta: afterScore - beforeScore,
    };
  });
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function resolveCefrLevel(session: AssessmentSession, maxScore: number): CEFRLevel {
  if (session.cefrLevel && ['A1', 'A2', 'B1', 'B2'].includes(session.cefrLevel)) {
    return session.cefrLevel as CEFRLevel;
  }
  return mapScoreToCEFR(session.totalScore ?? 0, maxScore).level;
}

function cefrRank(level: CEFRLevel): number {
  const ranks: Record<CEFRLevel, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  return ranks[level];
}

function toTimestamp(value: string | number): number {
  return typeof value === 'number' ? value : new Date(value).getTime();
}

function buildPhaseDeltas(
  arrival: AssessmentSession,
  departure: AssessmentSession,
): PhaseDelta[] {
  return PHASE_TYPE_ORDER.map((phaseType) => {
    const phaseDef = DEPARTURE_ENCOUNTER.phases.find((p) => p.type === phaseType);
    const arrivalPhase = arrival.phaseResults.find((pr) =>
      pr.phaseId.includes(phaseType),
    );
    const departurePhase = departure.phaseResults.find((pr) =>
      pr.phaseId.includes(phaseType),
    );

    const beforeScore = arrivalPhase?.totalScore ?? arrivalPhase?.score ?? 0;
    const afterScore = departurePhase?.totalScore ?? departurePhase?.score ?? 0;
    const maxPhaseScore = phaseDef?.maxScore ?? phaseDef?.maxPoints ?? 0;

    return {
      phaseType,
      phaseName: phaseDef?.name ?? phaseType,
      beforeScore,
      afterScore,
      maxScore: maxPhaseScore,
      delta: afterScore - beforeScore,
    };
  });
}

function buildDimensionDeltas(
  arrivalDims: Record<string, number> | undefined,
  departureDims: Record<string, number> | undefined,
): DimensionDelta[] {
  return DIMENSION_KEYS.map((dim) => {
    const before = arrivalDims?.[dim] ?? 0;
    const after = departureDims?.[dim] ?? 0;
    return { dimension: dim, before, after, delta: after - before };
  });
}
