/**
 * NPC Exam Type Definitions
 *
 * Lightweight wrappers around the existing assessment infrastructure
 * for NPC-administered exams during gameplay. NPC exams are shorter
 * and more focused than full assessments (1-2 phases vs 4).
 */

import type {
  AssessmentDefinition,
  AssessmentResult,
  CEFRLevel,
  TaskResult,
} from './assessment-types';

/** Types of NPC-administered exams */
export type NpcExamType = 'object_recognition' | 'reading' | 'writing' | 'listening';

/** How the exam was triggered */
export type NpcExamTrigger = 'quest_milestone' | 'time_based' | 'player_request' | 'npc_initiated';

/** An NPC exam is a lightweight wrapper around an AssessmentDefinition */
export interface NpcExam {
  id: string;
  type: NpcExamType;
  /** The NPC administering the exam */
  npcId: string;
  npcName: string;
  /** Business context (if inside a business) */
  businessType?: string;
  businessName?: string;
  /** The underlying assessment definition */
  definition: AssessmentDefinition;
  /** What triggered this exam */
  trigger: NpcExamTrigger;
  /** Player's current CEFR level (determines difficulty) */
  cefrLevel: CEFRLevel;
  /** Target language for the exam */
  targetLanguage: string;
}

/** Result of a single object recognition question */
export interface ObjectRecognitionResult {
  /** The object that was shown */
  objectKey: string;
  /** Expected answer in target language */
  expectedAnswer: string;
  /** What the player typed */
  playerAnswer: string;
  /** Score: 0 (wrong), partial, or full */
  score: number;
  maxScore: number;
  /** How the match was classified */
  matchType: 'exact' | 'close' | 'wrong';
  /** Levenshtein distance (for close matches) */
  distance?: number;
}

/** Complete result of an NPC exam */
export interface NpcExamResult {
  examId: string;
  examType: NpcExamType;
  npcId: string;
  /** Per-object results (for object_recognition) */
  objectResults?: ObjectRecognitionResult[];
  /** The underlying assessment result */
  assessmentResult: AssessmentResult;
}

/** A vocabulary item for object recognition */
export interface ObjectVocabularyItem {
  /** Internal key (e.g., 'bread', 'oven') */
  key: string;
  /** Display name in English (fallback) */
  englishName: string;
  /** Category within the business */
  category: 'furniture' | 'tool' | 'food' | 'container' | 'decoration' | 'equipment';
}

/** Vocabulary set for a specific business type */
export interface BusinessVocabulary {
  businessType: string;
  objects: ObjectVocabularyItem[];
}
