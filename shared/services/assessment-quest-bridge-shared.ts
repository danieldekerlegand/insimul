/**
 * Assessment Quest Bridge (Shared)
 *
 * Client-importable bridge functions for wrapping the Arrival Assessment
 * into the quest tracking system. No server-only dependencies.
 */

import { ARRIVAL_ENCOUNTER, resolveTemplate } from '../assessment/arrival-encounter.js';
import type { AssessmentPhase, AssessmentQuestData } from '../assessment/assessment-types.js';
import { generateAssessmentPrologContent } from '../prolog/assessment-prolog-generator.js';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AssessmentQuestObjective {
  id: string;
  type: string;
  description: string;
  requiredCount: number;
  currentCount: number;
  completed: boolean;
  /** Links this objective to an assessment phase */
  assessmentPhaseId: string;
  /** Declarative event trigger that completes this objective */
  completionTrigger?: string;
  score?: number;
  maxScore?: number;
  /** Minimum word count for writing objectives */
  minWordCount?: number;
}

export interface AssessmentQuestConfig {
  worldId: string;
  playerId: string;
  playerCharacterId?: string;
  targetLanguage: string;
  cityName: string;
}

// ── Phase-to-objective mapping ───────────────────────────────────────────────

/** Maps assessment phase types to objective types and their completion triggers. */
export const PHASE_OBJECTIVE_CONFIG: Record<string, { type: string; completionTrigger: string; minWordCount?: number; requiredCount?: number }> = {
  arrival_reading:                { type: 'arrival_reading',                completionTrigger: 'reading_completed' },
  arrival_writing:                { type: 'arrival_writing',                completionTrigger: 'writing_submitted', minWordCount: 20 },
  arrival_listening:              { type: 'arrival_listening',              completionTrigger: 'listening_completed' },
  arrival_initiate_conversation:  { type: 'arrival_initiate_conversation',  completionTrigger: 'npc_talked' },
  arrival_conversation:           { type: 'arrival_conversation',           completionTrigger: 'conversation_assessment_completed', requiredCount: 3 },
};

function phaseToObjective(phase: AssessmentPhase, vars: { targetLanguage: string; cityName: string }): AssessmentQuestObjective {
  const config = PHASE_OBJECTIVE_CONFIG[phase.id];
  return {
    id: `obj_${phase.id}`,
    type: config?.type ?? phase.id,
    description: resolveTemplate(phase.description, vars),
    requiredCount: config?.requiredCount ?? 1,
    currentCount: 0,
    completed: false,
    assessmentPhaseId: phase.id,
    completionTrigger: config?.completionTrigger,
    minWordCount: config?.minWordCount,
  };
}

// ── Quest creation ───────────────────────────────────────────────────────────

/**
 * Build a quest data object that wraps the Arrival Assessment.
 * Returns a plain object suitable for POST /api/worlds/:worldId/quests.
 */
export function buildArrivalAssessmentQuest(
  config: AssessmentQuestConfig,
  assessmentData?: AssessmentQuestData,
): Record<string, any> {
  const vars = { targetLanguage: config.targetLanguage, cityName: config.cityName };

  const objectives = ARRIVAL_ENCOUNTER.phases.map(phase => phaseToObjective(phase, vars));
  const description = resolveTemplate(ARRIVAL_ENCOUNTER.description, vars);

  const quest: Record<string, any> = {
    worldId: config.worldId,
    assignedTo: config.playerId,
    assignedToCharacterId: config.playerCharacterId ?? null,
    assignedBy: null,
    assignedByCharacterId: null,
    title: 'Arrival Assessment',
    description,
    questType: 'assessment',
    difficulty: 'beginner',
    targetLanguage: config.targetLanguage,
    gameType: 'language-learning',
    objectives,
    progress: { percentComplete: 0 },
    status: 'active',
    experienceReward: 50,
    rewards: { xp: 50, fluency: 5, cefrAssessment: true },
    tags: ['assessment', 'arrival', 'onboarding', 'non-skippable', 'non-abandonable'],
    content: generateAssessmentPrologContent({
      encounter: ARRIVAL_ENCOUNTER,
      difficulty: 'beginner',
      targetLanguage: config.targetLanguage,
      tags: ['assessment', 'arrival', 'onboarding', 'non-skippable', 'non-abandonable'],
      experienceReward: 50,
    }),
  };

  // Embed pre-generated assessment content in customData if available
  if (assessmentData) {
    quest.customData = { assessment: assessmentData };
  }

  return quest;
}

// ── Phase completion → objective update ──────────────────────────────────────

/**
 * Given a quest's objectives array and a completed phase ID + score,
 * returns updated objectives with the matching phase marked complete.
 */
export function markPhaseObjectiveComplete(
  objectives: AssessmentQuestObjective[],
  phaseId: string,
  score: number,
  maxScore: number,
): { objectives: AssessmentQuestObjective[]; allComplete: boolean } {
  const updated = objectives.map(obj => {
    if (obj.assessmentPhaseId === phaseId && !obj.completed) {
      return {
        ...obj,
        currentCount: 1,
        completed: true,
        score,
        maxScore,
      };
    }
    return obj;
  });

  const allComplete = updated.every(obj => obj.completed);

  return { objectives: updated, allComplete };
}

/**
 * Compute overall progress percentage from objectives.
 */
export function computeProgress(objectives: AssessmentQuestObjective[]): number {
  if (objectives.length === 0) return 0;
  const completed = objectives.filter(o => o.completed).length;
  return Math.round((completed / objectives.length) * 100);
}

/**
 * Check if a quest is an arrival assessment quest by its tags.
 */
export function isArrivalAssessmentQuest(quest: { tags?: string[] | null }): boolean {
  const tags = quest.tags;
  if (!Array.isArray(tags)) return false;
  return tags.includes('assessment') && tags.includes('arrival');
}

/**
 * Get the assessment phase IDs in order from the ARRIVAL_ENCOUNTER definition.
 */
export function getArrivalPhaseIds(): string[] {
  return ARRIVAL_ENCOUNTER.phases.map(p => p.id);
}
