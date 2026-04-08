/**
 * Assessment Content Builder (Shared)
 *
 * Converts an AssessmentDefinition (e.g., ARRIVAL_ENCOUNTER) into an
 * AssessmentQuestData object suitable for embedding in quest customData.
 * Optionally merges in pre-generated LLM content (passages, questions, prompts).
 */

import type {
  AssessmentDefinition,
  AssessmentQuestData,
  AssessmentQuestPhase,
  AssessmentQuestTask,
  AssessmentQuestion,
  ScoringDimension,
  PhaseType,
} from './assessment-types.js';

// ── Types for generated content ─────────────────────────────────────────────

/** Generated content for a single phase (from LLM or fallback) */
export interface GeneratedPhaseContent {
  phaseId: string;
  passage?: string;
  questions?: AssessmentQuestion[];
  writingPrompts?: string[];
}

// ── Builder ─────────────────────────────────────────────────────────────────

/**
 * Convert an AssessmentDefinition into AssessmentQuestData, optionally
 * merging in pre-generated content for each phase.
 *
 * @param definition  The encounter definition (e.g., ARRIVAL_ENCOUNTER after resolveAssessment)
 * @param generatedContent  Optional array of generated content per phase (from LLM)
 */
export function buildAssessmentQuestData(
  definition: AssessmentDefinition,
  generatedContent?: GeneratedPhaseContent[],
): AssessmentQuestData {
  const contentByPhase = new Map<string, GeneratedPhaseContent>();
  if (generatedContent) {
    for (const gc of generatedContent) {
      contentByPhase.set(gc.phaseId, gc);
    }
  }

  const phases: AssessmentQuestPhase[] = definition.phases.map(phase => {
    const content = contentByPhase.get(phase.id);
    const phaseType = phase.type as PhaseType;

    const tasks: AssessmentQuestTask[] = phase.tasks.map(task => {
      const questTask: AssessmentQuestTask = {
        id: task.id,
        type: task.type ?? 'reading_comprehension',
        prompt: task.prompt,
        maxPoints: task.maxPoints ?? task.maxScore ?? 0,
        scoringMethod: task.scoringMethod ?? 'llm',
        scoringDimensions: normalizeScoringDimensions(task.scoringDimensions),
        contentTemplate: task.contentTemplate,
      };

      // Merge generated content for reading/listening phases
      if ((phaseType === 'reading' || phaseType === 'listening') && content) {
        questTask.passage = content.passage;
        questTask.questions = content.questions;
      }

      // Merge generated content for writing phases
      if (phaseType === 'writing' && content) {
        questTask.writingPrompts = content.writingPrompts;
      }

      // Conversation phases keep their questConfig
      if (task.questConfig) {
        questTask.questConfig = task.questConfig;
      }

      return questTask;
    });

    return {
      id: phase.id,
      type: phaseType,
      name: phase.name,
      tasks,
      maxScore: phase.maxPoints ?? phase.maxScore ?? 0,
      scoringDimensions: normalizeScoringDimensions(phase.scoringDimensions),
    };
  });

  return {
    assessmentType: definition.type === 'arrival_encounter' ? 'arrival'
      : definition.type === 'departure_encounter' ? 'departure'
      : definition.type as 'arrival' | 'departure' | 'periodic',
    totalMaxPoints: definition.totalMaxPoints,
    estimatedMinutes: definition.estimatedMinutes ?? 30,
    phases,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeScoringDimensions(
  dims?: string[] | ScoringDimension[],
): ScoringDimension[] {
  if (!dims || dims.length === 0) return [];
  if (typeof dims[0] === 'string') {
    return (dims as string[]).map(d => ({
      id: d,
      name: d,
      description: '',
      maxScore: 5,
    }));
  }
  return dims as ScoringDimension[];
}
