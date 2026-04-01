/**
 * Assessment Prolog Content Generator
 *
 * Generates comprehensive Prolog content for Arrival and Departure assessment
 * quests from their encounter definitions. Produces predicates for:
 *
 *   assessment_quest/4        — quest metadata (id, type, difficulty, max_score)
 *   assessment_phase/5        — phase definition (quest, phase_id, type, name, max_score)
 *   assessment_task/5         — task within a phase (quest, phase, task_id, type, max_score)
 *   scoring_dimension/5       — scoring rubric (quest, phase, dim_id, name, max_score)
 *   assessment_tag/2          — quest tags
 *   phase_order/3             — phase sequencing (quest, phase_id, index)
 *   assessment_objective/4    — quest objective (quest, index, phase_id, goal)
 *   assessment_complete/1     — completion rule
 *   phase_complete/2          — per-phase completion check
 *   departure_eligible/1      — departure eligibility rule
 */

import type { AssessmentDefinition } from '../assessment/assessment-types.js';

// ── Types ───────────────────────────────────────────────────────────────────

export interface AssessmentPrologConfig {
  /** The encounter definition (ARRIVAL_ENCOUNTER or DEPARTURE_ENCOUNTER) */
  encounter: AssessmentDefinition;
  /** Quest difficulty level */
  difficulty: string;
  /** Target language (optional, for language-specific predicates) */
  targetLanguage?: string;
  /** Tags to emit as assessment_tag facts */
  tags?: string[];
  /** Experience reward */
  experienceReward?: number;
  /** For departure: minimum completed quests required */
  departureThreshold?: number;
}

// ── Generator ───────────────────────────────────────────────────────────────

export function generateAssessmentPrologContent(config: AssessmentPrologConfig): string {
  const {
    encounter,
    difficulty,
    targetLanguage,
    tags = [],
    experienceReward = 0,
    departureThreshold,
  } = config;

  const questAtom = sanitizeAtom(encounter.id);
  const isArrival = encounter.type === 'arrival_encounter';
  const assessmentType = isArrival ? 'arrival' : 'departure';
  const lines: string[] = [];

  // ── Header ──────────────────────────────────────────────────────────────
  lines.push(`% ${encounter.name} — Prolog Knowledge Base`);
  lines.push(`% ${isArrival ? 'Pre-test baseline' : 'Post-test final'} assessment`);
  lines.push(`% Total: ${encounter.totalMaxPoints} points across ${encounter.phases.length} phases`);
  lines.push('');

  // ── Dynamic declarations ────────────────────────────────────────────────
  const dynamicPreds = [
    'assessment_quest/4', 'assessment_phase/5', 'assessment_task/5',
    'scoring_dimension/5', 'assessment_tag/2', 'phase_order/3',
    'assessment_objective/4', 'phase_score/3',
  ];
  if (experienceReward > 0) dynamicPreds.push('quest_reward/3');
  if (targetLanguage) dynamicPreds.push('assessment_language/2');
  if (departureThreshold != null) dynamicPreds.push('departure_eligible/1');

  for (const p of dynamicPreds) {
    lines.push(`:- dynamic(${p}).`);
  }
  lines.push('');

  // ── Core quest fact ─────────────────────────────────────────────────────
  lines.push(`% Core assessment quest metadata`);
  lines.push(`assessment_quest(${questAtom}, ${assessmentType}, ${sanitizeAtom(difficulty)}, ${encounter.totalMaxPoints}).`);

  if (targetLanguage) {
    lines.push(`assessment_language(${questAtom}, '${escapeString(targetLanguage)}').`);
  }

  if (experienceReward > 0) {
    lines.push(`quest_reward(${questAtom}, experience, ${experienceReward}).`);
  }
  lines.push('');

  // ── Tags ────────────────────────────────────────────────────────────────
  if (tags.length > 0) {
    lines.push(`% Tags`);
    for (const tag of tags) {
      lines.push(`assessment_tag(${questAtom}, ${sanitizeAtom(tag)}).`);
    }
    lines.push('');
  }

  // ── Phases ──────────────────────────────────────────────────────────────
  lines.push(`% Assessment phases`);
  for (let i = 0; i < encounter.phases.length; i++) {
    const phase = encounter.phases[i];
    const phaseAtom = sanitizeAtom(phase.id);
    const phaseType = sanitizeAtom(phase.type);

    lines.push(`assessment_phase(${questAtom}, ${phaseAtom}, ${phaseType}, '${escapeString(phase.name)}', ${phase.maxScore}).`);
    lines.push(`phase_order(${questAtom}, ${phaseAtom}, ${i}).`);
  }
  lines.push('');

  // ── Tasks and Scoring Dimensions ────────────────────────────────────────
  lines.push(`% Tasks and scoring dimensions`);
  for (const phase of encounter.phases) {
    const phaseAtom = sanitizeAtom(phase.id);

    for (const task of phase.tasks) {
      const taskAtom = sanitizeAtom(task.id);
      const taskType = sanitizeAtom(task.type || 'unknown');
      lines.push(`assessment_task(${questAtom}, ${phaseAtom}, ${taskAtom}, ${taskType}, ${task.maxScore}).`);

      // Scoring dimensions
      const dims = task.scoringDimensions || [];
      for (const dim of dims) {
        lines.push(`scoring_dimension(${questAtom}, ${phaseAtom}, ${sanitizeAtom(dim.id)}, '${escapeString(dim.name)}', ${dim.maxScore}).`);
      }
    }
  }
  lines.push('');

  // ── Objectives (one per phase) ──────────────────────────────────────────
  lines.push(`% Quest objectives — one per assessment phase`);
  for (let i = 0; i < encounter.phases.length; i++) {
    const phase = encounter.phases[i];
    const phaseAtom = sanitizeAtom(phase.id);
    lines.push(`assessment_objective(${questAtom}, ${i}, ${phaseAtom}, complete_phase(${phaseAtom})).`);
  }
  lines.push('');

  // ── Rules ───────────────────────────────────────────────────────────────
  lines.push(`% Phase completion: a phase is complete when its score has been recorded`);
  lines.push(`phase_complete(${questAtom}, PhaseId) :-`);
  lines.push(`    assessment_phase(${questAtom}, PhaseId, _, _, _),`);
  lines.push(`    phase_score(${questAtom}, PhaseId, _).`);
  lines.push('');

  lines.push(`% Assessment completion: all phases must be complete`);
  lines.push(`assessment_complete(${questAtom}) :-`);
  lines.push(`    \\+ (assessment_phase(${questAtom}, PhaseId, _, _, _), \\+ phase_complete(${questAtom}, PhaseId)).`);
  lines.push('');

  lines.push(`% Total score: sum of all phase scores`);
  lines.push(`assessment_total_score(${questAtom}, Total) :-`);
  lines.push(`    findall(S, phase_score(${questAtom}, _, S), Scores),`);
  lines.push(`    sum_list(Scores, Total).`);
  lines.push('');

  lines.push(`% Phase passed: score > 0`);
  lines.push(`phase_passed(${questAtom}, PhaseId) :-`);
  lines.push(`    phase_score(${questAtom}, PhaseId, Score),`);
  lines.push(`    Score > 0.`);
  lines.push('');

  // CEFR derivation rules — derive level from total score percentage
  const totalMax = encounter.totalMaxPoints || 53;
  lines.push(`% CEFR level derived from assessment score`);
  lines.push(`assessment_cefr(${questAtom}, b2) :-`);
  lines.push(`    assessment_total_score(${questAtom}, S), S * 100 / ${totalMax} >= 80.`);
  lines.push(`assessment_cefr(${questAtom}, b1) :-`);
  lines.push(`    assessment_total_score(${questAtom}, S), S * 100 / ${totalMax} >= 60,`);
  lines.push(`    \\+ assessment_cefr(${questAtom}, b2).`);
  lines.push(`assessment_cefr(${questAtom}, a2) :-`);
  lines.push(`    assessment_total_score(${questAtom}, S), S * 100 / ${totalMax} >= 40,`);
  lines.push(`    \\+ assessment_cefr(${questAtom}, b1).`);
  lines.push(`assessment_cefr(${questAtom}, a1) :-`);
  lines.push(`    assessment_complete(${questAtom}),`);
  lines.push(`    \\+ assessment_cefr(${questAtom}, a2).`);

  // ── Departure-specific eligibility rule ─────────────────────────────────
  if (departureThreshold != null) {
    lines.push('');
    lines.push(`% Departure eligibility: player must have completed at least ${departureThreshold} quests`);
    lines.push(`departure_eligible(Player) :-`);
    lines.push(`    findall(Q, quest_status(Player, Q, completed), Completed),`);
    lines.push(`    length(Completed, Count),`);
    lines.push(`    Count >= ${departureThreshold}.`);
  }

  return lines.join('\n');
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sanitizeAtom(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^([0-9])/, '_$1')
    .replace(/_+/g, '_')
    .replace(/_$/, '');
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
