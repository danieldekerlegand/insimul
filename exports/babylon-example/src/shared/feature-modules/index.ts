/**
 * Feature Module System — Barrel Export
 *
 * Imports all module definitions and registers them in the central registry.
 * Import this file once at app startup to populate the registry.
 */

// Core types & registry
export * from './types';
export * from './registry';
export * from './genre-bundles';

// Module definitions
import { KNOWLEDGE_ACQUISITION_MODULE } from './knowledge-acquisition';
import { PROFICIENCY_MODULE } from './proficiency';
import { PATTERN_RECOGNITION_MODULE } from './pattern-recognition';
import { GAMIFICATION_MODULE } from './gamification';
import { SKILL_TREE_MODULE } from './skill-tree';
import { ADAPTIVE_DIFFICULTY_MODULE } from './adaptive-difficulty';
import { ASSESSMENT_MODULE } from './assessment';
import { PERFORMANCE_SCORING_MODULE } from './performance-scoring';
import { VOICE_MODULE } from './voice';
import { WORLD_LORE_MODULE } from './world-lore';
import { CONVERSATION_ANALYTICS_MODULE } from './conversation-analytics';
import { ONBOARDING_MODULE } from './onboarding';
import { NPC_EXAMS_MODULE } from './npc-exams';

import { registerModule } from './registry';

// Register all modules
const ALL_MODULE_DEFINITIONS = [
  KNOWLEDGE_ACQUISITION_MODULE,
  PROFICIENCY_MODULE,
  PATTERN_RECOGNITION_MODULE,
  GAMIFICATION_MODULE,
  SKILL_TREE_MODULE,
  ADAPTIVE_DIFFICULTY_MODULE,
  ASSESSMENT_MODULE,
  PERFORMANCE_SCORING_MODULE,
  VOICE_MODULE,
  WORLD_LORE_MODULE,
  CONVERSATION_ANALYTICS_MODULE,
  ONBOARDING_MODULE,
  NPC_EXAMS_MODULE,
];

// Auto-register on import
for (const mod of ALL_MODULE_DEFINITIONS) {
  registerModule(mod);
}

// Re-export module constants for direct access
export {
  KNOWLEDGE_ACQUISITION_MODULE,
  PROFICIENCY_MODULE,
  PATTERN_RECOGNITION_MODULE,
  GAMIFICATION_MODULE,
  SKILL_TREE_MODULE,
  ADAPTIVE_DIFFICULTY_MODULE,
  ASSESSMENT_MODULE,
  PERFORMANCE_SCORING_MODULE,
  VOICE_MODULE,
  WORLD_LORE_MODULE,
  CONVERSATION_ANALYTICS_MODULE,
  ONBOARDING_MODULE,
  NPC_EXAMS_MODULE,
};

// Re-export module type namespaces
export * as KnowledgeAcquisition from './knowledge-acquisition/types';
export * as Proficiency from './proficiency/types';
export * as PatternRecognition from './pattern-recognition/types';
export * as Gamification from './gamification/types';
export * as SkillTree from './skill-tree/types';
export * as AdaptiveDifficulty from './adaptive-difficulty/types';
export * as Assessment from './assessment/types';
export * as PerformanceScoring from './performance-scoring/types';
export * as Voice from './voice/types';
export * as WorldLore from './world-lore/types';
export * as ConversationAnalytics from './conversation-analytics/types';
export * as Onboarding from './onboarding/types';
export * as NPCExams from './npc-exams/types';
