export {
  type AssessmentType,
  type PhaseType,
  type AssessmentPhaseType,
  type TaskType,
  type CEFRLevel,
  type CefrLevel,
  type AssessmentStatus,
  type ScoringMethod,
  type ScoringDimension,
  type AssessmentDimensionScores,
  type AssessmentQuestion,
  type ContentTemplate,
  type ConversationQuestConfig,
  type AssessmentTask,
  type AssessmentPhase,
  type AssessmentDefinition,
  type RecordingReference,
  type TranscriptEntry,
  type AutomatedMetrics,
  type TaskResult,
  type PhaseResult,
  type AssessmentResult,
  type AssessmentSession,
} from './assessment-types';

export {
  type CEFRResult,
  type CefrThreshold,
  CEFR_THRESHOLDS,
  mapScoreToCEFR,
  mapScoreToLevel,
  getCEFRDescription,
  cefrToFluencyTier,
} from './cefr-mapping';

export {
  ARRIVAL_ENCOUNTER,
  resolveTemplate,
  resolveAssessment,
} from './arrival-encounter';

export { DEPARTURE_ENCOUNTER } from './departure-encounter';

export * from './periodic-encounter';

export {
  buildNPCExamEncounter,
  buildReadingExamPhase,
  buildWritingExamPhase,
  shouldTriggerNPCExam,
  NPC_EXAM_QUEST_INTERVAL,
  NPC_EXAM_TIME_INTERVAL_MS,
  type NPCExamType,
  type BusinessContext,
} from './npc-exam-encounter';
