/**
 * Quest Analytics & Learning Outcome Types
 *
 * Shared types for quest performance analytics and learning outcome tracking.
 * Used by both server (computation) and client (display).
 */

import type { CEFRLevel } from '../assessment/cefr-mapping';
import type { SkillDimension, QuestCategory, SkillProfile } from '../language/learning-profile';

// ─── Quest Analytics ─────────────────────────────────────────────────────────

/** Summary analytics for all quests in a world/playthrough scope. */
export interface QuestAnalyticsSummary {
  /** Total quests created */
  totalQuests: number;
  /** Quests completed successfully */
  completed: number;
  /** Quests failed */
  failed: number;
  /** Quests abandoned */
  abandoned: number;
  /** Quests still active */
  active: number;
  /** Overall completion rate (completed / finished) */
  completionRate: number;
  /** Average attempts per quest */
  avgAttempts: number;
  /** Average time to complete (ms), null if no completed quests with timing */
  avgCompletionTimeMs: number | null;
  /** Breakdown by quest type */
  byQuestType: QuestTypeBreakdown[];
  /** Breakdown by difficulty */
  byDifficulty: DifficultyBreakdown[];
  /** Breakdown by CEFR level */
  byCefrLevel: CefrBreakdown[];
}

/** Per-quest-type analytics. */
export interface QuestTypeBreakdown {
  questType: string;
  total: number;
  completed: number;
  failed: number;
  abandoned: number;
  completionRate: number;
  avgAttempts: number;
}

/** Per-difficulty analytics. */
export interface DifficultyBreakdown {
  difficulty: string;
  total: number;
  completed: number;
  failed: number;
  completionRate: number;
}

/** Per-CEFR-level analytics. */
export interface CefrBreakdown {
  cefrLevel: string;
  total: number;
  completed: number;
  failed: number;
  completionRate: number;
}

// ─── Learning Outcomes ───────────────────────────────────────────────────────

/** Tracks a player's learning outcomes over time within a playthrough. */
export interface LearningOutcomeSummary {
  /** Player identifier */
  playerName: string;
  /** World scope */
  worldId: string;
  /** Playthrough scope (if applicable) */
  playthroughId?: string;
  /** Total XP earned from quests */
  totalXpEarned: number;
  /** Total quests completed */
  questsCompleted: number;
  /** Total quests attempted (completed + failed + abandoned) */
  questsAttempted: number;
  /** Overall success rate */
  successRate: number;
  /** Current CEFR level (from quest difficulty progression) */
  currentCefrLevel: CEFRLevel | null;
  /** Highest CEFR level achieved in completed quests */
  highestCefrCompleted: CEFRLevel | null;
  /** Skill dimension scores derived from quest performance */
  skillScores: SkillProfile;
  /** Per-category learning progress */
  categoryProgress: CategoryLearningProgress[];
  /** Skill progression over time (ordered chronologically) */
  progressionTimeline: ProgressionPoint[];
  /** Identified strengths */
  strengths: string[];
  /** Areas needing improvement */
  areasForImprovement: string[];
}

/** Learning progress for a specific quest category. */
export interface CategoryLearningProgress {
  category: string;
  questsCompleted: number;
  questsAttempted: number;
  successRate: number;
  avgObjectiveCompletion: number;
  /** Related skill dimensions this category trains */
  trainedSkills: SkillDimension[];
  /** Mastery indicator: 0-1 based on success rate and volume */
  mastery: number;
}

/** A point in the player's learning progression timeline. */
export interface ProgressionPoint {
  /** Timestamp of the event */
  timestamp: number;
  /** Quest ID that triggered this point */
  questId: string;
  /** Quest type/category */
  questType: string;
  /** Whether the quest was completed successfully */
  success: boolean;
  /** XP earned */
  xpEarned: number;
  /** Cumulative XP at this point */
  cumulativeXp: number;
  /** CEFR level of the quest */
  cefrLevel?: string;
}

// ─── Objective Analytics ─────────────────────────────────────────────────────

/** Analytics for objective completion patterns. */
export interface ObjectiveAnalytics {
  /** Most commonly completed objective types */
  topCompletedTypes: { type: string; count: number }[];
  /** Objective types with lowest completion rates */
  hardestObjectiveTypes: { type: string; completionRate: number; total: number }[];
  /** Average objectives per quest */
  avgObjectivesPerQuest: number;
  /** Overall objective completion rate */
  overallObjectiveCompletionRate: number;
}
