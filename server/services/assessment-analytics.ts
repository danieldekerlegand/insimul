/**
 * Assessment Analytics Service
 *
 * Computes detailed pre/post assessment comparisons, learning gains
 * (normalized gain, effect size), and aggregate analytics across players.
 */

import type { AssessmentSession, CEFRLevel } from '../../shared/assessment/assessment-types';
import { mapScoreToCEFR } from '../../shared/assessment/cefr-mapping';
import type {
  LearningGain,
  DimensionGain,
  PhaseGain,
  PrePostComparison,
  SessionSummary,
  TrajectoryPoint,
  AssessmentAnalyticsSummary,
} from '../../shared/analytics/assessment-analytics-types';

const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
const DIMENSION_KEYS = ['comprehension', 'fluency', 'vocabulary', 'grammar', 'pronunciation'];

function cefrRank(level: string): number {
  const idx = CEFR_ORDER.indexOf(level as CEFRLevel);
  return idx >= 0 ? idx : 0;
}

function resolveCefr(session: AssessmentSession): CEFRLevel {
  if (session.cefrLevel && CEFR_ORDER.includes(session.cefrLevel as CEFRLevel)) {
    return session.cefrLevel as CEFRLevel;
  }
  const maxScore = session.totalMaxPoints || 1;
  return mapScoreToCEFR(session.totalScore ?? 0, maxScore).level;
}

function toTimestamp(value: string | number | undefined): number | null {
  if (value === undefined) return null;
  return typeof value === 'number' ? value : new Date(value).getTime();
}

// ─── Learning Gain Calculation ──────────────────────────────────────────────

/** Compute learning gains between pre and post scores */
export function computeLearningGain(pre: number, post: number, max: number): LearningGain {
  const rawGain = post - pre;

  // Hake's normalized gain: (post - pre) / (max - pre)
  const denominator = max - pre;
  const normalizedGain = denominator > 0 ? rawGain / denominator : null;

  // Percentage change
  const percentChange = pre > 0 ? (rawGain / pre) * 100 : null;

  // Effect size (Cohen's d) uses individual pre/post as single measurements
  // For single-subject: d = (post - pre) / sd, approximate sd from range
  const effectSize = max > 0 ? rawGain / (max * 0.25) : null;

  return { rawGain, normalizedGain, effectSize, percentChange };
}

// ─── Session Summary ────────────────────────────────────────────────────────

function buildSessionSummary(session: AssessmentSession): SessionSummary {
  const totalScore = session.totalScore ?? 0;
  const maxScore = session.totalMaxPoints || 1;
  return {
    sessionId: session.id,
    assessmentType: session.assessmentType,
    totalScore,
    maxScore: session.totalMaxPoints,
    percentage: (totalScore / maxScore) * 100,
    cefrLevel: resolveCefr(session),
    dimensionScores: session.dimensionScores ?? {},
    completedAt: toTimestamp(session.completedAt),
  };
}

// ─── Pre/Post Comparison ────────────────────────────────────────────────────

/**
 * Build a detailed pre/post comparison for a player.
 * Requires both an arrival (pre) and departure (post) session.
 */
export function buildPrePostComparison(
  preSession: AssessmentSession,
  postSession: AssessmentSession,
  periodicSessions: AssessmentSession[] = [],
): PrePostComparison {
  const pre = buildSessionSummary(preSession);
  const post = buildSessionSummary(postSession);

  const maxScore = Math.max(pre.maxScore, post.maxScore) || 1;
  const overallGain = computeLearningGain(pre.totalScore, post.totalScore, maxScore);

  const preCefr = pre.cefrLevel;
  const postCefr = post.cefrLevel;
  const levelsGained = cefrRank(postCefr) - cefrRank(preCefr);

  // Per-dimension gains
  const dimensionGains: DimensionGain[] = DIMENSION_KEYS.map(dim => {
    const preScore = pre.dimensionScores[dim] ?? 0;
    const postScore = post.dimensionScores[dim] ?? 0;
    const dimMax = 5; // dimensions are scored 1-5
    return {
      dimension: dim,
      preScore,
      postScore,
      maxScore: dimMax,
      gain: computeLearningGain(preScore, postScore, dimMax),
    };
  });

  // Per-phase gains
  const phaseGains: PhaseGain[] = buildPhaseGains(preSession, postSession);

  // Find strongest/weakest growth
  const validDimGains = dimensionGains.filter(d => d.gain.normalizedGain !== null);
  let strongestGrowth: string | null = null;
  let weakestGrowth: string | null = null;
  if (validDimGains.length > 0) {
    validDimGains.sort((a, b) => (b.gain.normalizedGain ?? 0) - (a.gain.normalizedGain ?? 0));
    strongestGrowth = validDimGains[0].dimension;
    weakestGrowth = validDimGains[validDimGains.length - 1].dimension;
  }

  // Build trajectory from periodic assessments
  const trajectory: TrajectoryPoint[] = periodicSessions
    .filter(s => s.completedAt)
    .sort((a, b) => toTimestamp(a.completedAt)! - toTimestamp(b.completedAt)!)
    .map(s => {
      const score = s.totalScore ?? 0;
      const max = s.totalMaxPoints || 1;
      return {
        sessionId: s.id,
        totalScore: score,
        maxScore: s.totalMaxPoints,
        percentage: (score / max) * 100,
        cefrLevel: resolveCefr(s),
        completedAt: toTimestamp(s.completedAt)!,
      };
    });

  return {
    playerId: preSession.playerId,
    worldId: preSession.worldId,
    preSession: pre,
    postSession: post,
    overallGain,
    cefrProgression: {
      pre: preCefr,
      post: postCefr,
      levelsGained,
      improved: levelsGained > 0,
    },
    dimensionGains,
    phaseGains,
    strongestGrowth,
    weakestGrowth,
    trajectory,
  };
}

function buildPhaseGains(preSession: AssessmentSession, postSession: AssessmentSession): PhaseGain[] {
  const phaseTypes = ['reading', 'writing', 'listening', 'conversation'];
  return phaseTypes.map(phaseType => {
    const prePhase = preSession.phaseResults.find(pr => pr.phaseId.includes(phaseType));
    const postPhase = postSession.phaseResults.find(pr => pr.phaseId.includes(phaseType));

    const preScore = prePhase?.totalScore ?? prePhase?.score ?? 0;
    const postScore = postPhase?.totalScore ?? postPhase?.score ?? 0;
    const preMax = prePhase?.maxScore ?? prePhase?.maxPoints ?? 0;
    const postMax = postPhase?.maxScore ?? postPhase?.maxPoints ?? 0;
    const max = Math.max(preMax, postMax) || 1;

    return {
      phaseId: phaseType,
      phaseName: phaseType.charAt(0).toUpperCase() + phaseType.slice(1),
      phaseType,
      preScore,
      postScore,
      maxScore: max,
      gain: computeLearningGain(preScore, postScore, max),
    };
  });
}

// ─── Aggregate Analytics ────────────────────────────────────────────────────

/**
 * Compute aggregate assessment analytics for a world.
 * Groups sessions by player, finds pre/post pairs, and computes
 * learning gains across the cohort.
 */
export function computeAssessmentAnalytics(
  sessions: AssessmentSession[],
  worldId: string,
): AssessmentAnalyticsSummary {
  // Group completed sessions by player
  const byPlayer = new Map<string, AssessmentSession[]>();
  for (const s of sessions) {
    const status = s.status;
    if (status !== 'complete' && status !== 'completed') continue;
    if (!byPlayer.has(s.playerId)) byPlayer.set(s.playerId, []);
    byPlayer.get(s.playerId)!.push(s);
  }

  const comparisons: PrePostComparison[] = [];
  const preCefrDist: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0 };
  const postCefrDist: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0 };
  let cefrImproved = 0;

  byPlayer.forEach((playerSessions) => {
    const pre = findPreSession(playerSessions);
    const post = findPostSession(playerSessions);
    if (!pre || !post) return;

    const periodic = playerSessions.filter(
      (s: AssessmentSession) => s.assessmentType === 'periodic' && s.completedAt
    );

    const comparison = buildPrePostComparison(pre, post, periodic);
    comparisons.push(comparison);

    preCefrDist[comparison.cefrProgression.pre] = (preCefrDist[comparison.cefrProgression.pre] ?? 0) + 1;
    postCefrDist[comparison.cefrProgression.post] = (postCefrDist[comparison.cefrProgression.post] ?? 0) + 1;

    if (comparison.cefrProgression.improved) cefrImproved++;
  });

  // Aggregate gains
  const normalizedGains = comparisons
    .map(c => c.overallGain.normalizedGain)
    .filter((g): g is number => g !== null);
  const effectSizes = comparisons
    .map(c => c.overallGain.effectSize)
    .filter((e): e is number => e !== null);

  // Score statistics
  const preScores = comparisons.map(c => c.preSession.totalScore);
  const postScores = comparisons.map(c => c.postSession.totalScore);

  // Aggregate dimension gains
  const aggDimensionGains = aggregateDimensionGains(comparisons);
  const aggPhaseGains = aggregatePhaseGains(comparisons);

  return {
    worldId,
    totalAssessedPlayers: byPlayer.size,
    playersWithPrePost: comparisons.length,
    avgNormalizedGain: normalizedGains.length > 0 ? mean(normalizedGains) : null,
    avgEffectSize: effectSizes.length > 0 ? mean(effectSizes) : null,
    preCefrDistribution: preCefrDist,
    postCefrDistribution: postCefrDist,
    cefrImprovementRate: comparisons.length > 0 ? cefrImproved / comparisons.length : 0,
    dimensionGains: aggDimensionGains,
    phaseGains: aggPhaseGains,
    scoreStats: {
      preAvg: mean(preScores),
      postAvg: mean(postScores),
      preMedian: median(preScores),
      postMedian: median(postScores),
      preStdDev: stdDev(preScores),
      postStdDev: stdDev(postScores),
    },
    playerComparisons: comparisons,
    generatedAt: Date.now(),
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function findPreSession(sessions: AssessmentSession[]): AssessmentSession | undefined {
  return sessions.find(s =>
    s.assessmentType === 'arrival' || s.assessmentType === 'arrival_encounter'
  );
}

function findPostSession(sessions: AssessmentSession[]): AssessmentSession | undefined {
  return sessions.find(s =>
    s.assessmentType === 'departure' || s.assessmentType === 'departure_encounter'
  );
}

function aggregateDimensionGains(comparisons: PrePostComparison[]): DimensionGain[] {
  if (comparisons.length === 0) return [];

  return DIMENSION_KEYS.map(dim => {
    const dimGains = comparisons
      .map(c => c.dimensionGains.find(d => d.dimension === dim))
      .filter((d): d is DimensionGain => d !== undefined);

    const avgPre = mean(dimGains.map(d => d.preScore));
    const avgPost = mean(dimGains.map(d => d.postScore));
    const maxScore = dimGains[0]?.maxScore ?? 5;

    return {
      dimension: dim,
      preScore: round2(avgPre),
      postScore: round2(avgPost),
      maxScore,
      gain: computeLearningGain(avgPre, avgPost, maxScore),
    };
  });
}

function aggregatePhaseGains(comparisons: PrePostComparison[]): PhaseGain[] {
  if (comparisons.length === 0) return [];

  const phaseTypes = ['reading', 'writing', 'listening', 'conversation'];
  return phaseTypes.map(phaseType => {
    const phaseData = comparisons
      .map(c => c.phaseGains.find(p => p.phaseType === phaseType))
      .filter((p): p is PhaseGain => p !== undefined);

    const avgPre = mean(phaseData.map(p => p.preScore));
    const avgPost = mean(phaseData.map(p => p.postScore));
    const maxScore = phaseData.length > 0 ? Math.max(...phaseData.map(p => p.maxScore)) : 1;

    return {
      phaseId: phaseType,
      phaseName: phaseType.charAt(0).toUpperCase() + phaseType.slice(1),
      phaseType,
      preScore: round2(avgPre),
      postScore: round2(avgPost),
      maxScore,
      gain: computeLearningGain(avgPre, avgPost, maxScore),
    };
  });
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const sqDiffs = values.map(v => (v - avg) ** 2);
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / (values.length - 1));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
