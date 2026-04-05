/**
 * Language-Learning Module Configurations
 *
 * Registers language-learning-specific configurations for each generic module.
 * Import this file when setting up a language-learning world to get the
 * correct module behaviors (CEFR tiers, 5 proficiency dimensions,
 * vocabulary-specific knowledge schema, etc.).
 *
 * This file does NOT modify any existing language-learning code — it only
 * defines the configurations that the generic modules use when the
 * language-learning genre bundle is active.
 */

import type { KnowledgeAcquisitionConfig } from './knowledge-acquisition/types';
import { MASTERY_THRESHOLDS } from '../language/vocabulary-constants';
import type { ProficiencyConfig, ProficiencyTier, ProficiencyDimension } from './proficiency/types';
import type { PatternRecognitionConfig } from './pattern-recognition/types';
import type { GamificationConfig } from './gamification/types';
import type { AdaptiveDifficultyConfig, DifficultyTier } from './adaptive-difficulty/types';
import type { AssessmentConfig } from './assessment/types';
import type { NPCExamConfig } from './npc-exams/types';
import type { OnboardingConfig } from './onboarding/types';
import type { WorldLoreConfig } from './world-lore/types';
import type { VoiceConfig } from './voice/types';

// ---------------------------------------------------------------------------
// Knowledge Acquisition — vocabulary tracking
// ---------------------------------------------------------------------------

export const LANGUAGE_KNOWLEDGE_CONFIG: KnowledgeAcquisitionConfig = {
  entryLabel: 'Vocabulary Word',
  entryLabelPlural: 'Vocabulary Words',
  masteryLabels: ['New', 'Learning', 'Familiar', 'Mastered'],
  masteryThresholds: MASTERY_THRESHOLDS,
  spacedRepetitionEnabled: true,
  reviewTriggerChance: 0.25,
};

// ---------------------------------------------------------------------------
// Proficiency — CEFR-based, 5 dimensions
// ---------------------------------------------------------------------------

export const CEFR_TIERS: ProficiencyTier[] = [
  { id: 'A1', label: 'Beginner', color: '#e74c3c', minScore: 0 },
  { id: 'A2', label: 'Elementary', color: '#e67e22', minScore: 25 },
  { id: 'B1', label: 'Intermediate', color: '#f1c40f', minScore: 50 },
  { id: 'B2', label: 'Upper Intermediate', color: '#2ecc71', minScore: 75 },
];

export const LANGUAGE_DIMENSIONS: ProficiencyDimension[] = [
  { id: 'vocabulary', label: 'Vocabulary', icon: '📖' },
  { id: 'grammar', label: 'Grammar', icon: '📝' },
  { id: 'pronunciation', label: 'Pronunciation', icon: '🗣️' },
  { id: 'listening', label: 'Listening', icon: '👂' },
  { id: 'communication', label: 'Communication', icon: '💬' },
];

export const LANGUAGE_PROFICIENCY_CONFIG: ProficiencyConfig = {
  tiers: CEFR_TIERS,
  dimensions: LANGUAGE_DIMENSIONS,
  scoreScale: 5,
};

// ---------------------------------------------------------------------------
// Pattern Recognition — grammar patterns
// ---------------------------------------------------------------------------

export const LANGUAGE_PATTERN_CONFIG: PatternRecognitionConfig = {
  patternLabel: 'Grammar Rule',
  patternLabelPlural: 'Grammar Rules',
  masteryThreshold: 5,
};

// ---------------------------------------------------------------------------
// Gamification — CEFR-mapped level tiers
// ---------------------------------------------------------------------------

export const LANGUAGE_GAMIFICATION_CONFIG: GamificationConfig = {
  tierLabels: ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Near-native'],
};

// ---------------------------------------------------------------------------
// Adaptive Difficulty — speech complexity tiers
// ---------------------------------------------------------------------------

export const LANGUAGE_DIFFICULTY_TIERS: DifficultyTier[] = [
  { id: 'beginner', label: 'Beginner', minScore: 0 },
  { id: 'elementary', label: 'Elementary', minScore: 20 },
  { id: 'intermediate', label: 'Intermediate', minScore: 40 },
  { id: 'advanced', label: 'Advanced', minScore: 60 },
  { id: 'near-native', label: 'Near-native', minScore: 80 },
];

export const LANGUAGE_ADAPTIVE_DIFFICULTY_CONFIG: AdaptiveDifficultyConfig = {
  tiers: LANGUAGE_DIFFICULTY_TIERS,
};

// ---------------------------------------------------------------------------
// Assessment — ACTFL OPI + standard instruments
// ---------------------------------------------------------------------------

export const LANGUAGE_ASSESSMENT_CONFIG: AssessmentConfig = {
  enabledInstruments: ['actfl-opi', 'sus', 'ssq', 'ipq'],
  phases: ['pre', 'post', 'delayed'],
};

// ---------------------------------------------------------------------------
// NPC Exams
// ---------------------------------------------------------------------------

export const LANGUAGE_NPC_EXAM_CONFIG: NPCExamConfig = {
  examTypes: ['identification', 'comprehension', 'recall'],
  passThreshold: 70,
  adaptToTier: true,
};

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export const LANGUAGE_ONBOARDING_CONFIG: OnboardingConfig = {
  mandatory: true,
  allowRevisit: true,
};

// ---------------------------------------------------------------------------
// World Lore — languages as lore entries
// ---------------------------------------------------------------------------

export const LANGUAGE_WORLD_LORE_CONFIG: WorldLoreConfig = {
  loreTypes: ['language'],
  entryLabel: 'Language',
  entryLabelPlural: 'Languages',
};

// ---------------------------------------------------------------------------
// Voice
// ---------------------------------------------------------------------------

export const LANGUAGE_VOICE_CONFIG: VoiceConfig = {
  sttDefault: true,
  ttsDefault: true,
};

// ---------------------------------------------------------------------------
// Aggregate: all configs keyed by module ID
// ---------------------------------------------------------------------------

export const LANGUAGE_LEARNING_MODULE_CONFIGS: Record<string, unknown> = {
  'knowledge-acquisition': LANGUAGE_KNOWLEDGE_CONFIG,
  'proficiency': LANGUAGE_PROFICIENCY_CONFIG,
  'pattern-recognition': LANGUAGE_PATTERN_CONFIG,
  'gamification': LANGUAGE_GAMIFICATION_CONFIG,
  'adaptive-difficulty': LANGUAGE_ADAPTIVE_DIFFICULTY_CONFIG,
  'assessment': LANGUAGE_ASSESSMENT_CONFIG,
  'npc-exams': LANGUAGE_NPC_EXAM_CONFIG,
  'onboarding': LANGUAGE_ONBOARDING_CONFIG,
  'world-lore': LANGUAGE_WORLD_LORE_CONFIG,
  'voice': LANGUAGE_VOICE_CONFIG,
};
