/**
 * Quest Analytics & Learning Outcome Service
 *
 * Computes analytics from quest data: completion rates, difficulty breakdowns,
 * learning outcome summaries, and skill progression timelines.
 */

import type { Quest } from '@shared/schema';
import type {
  QuestAnalyticsSummary,
  QuestTypeBreakdown,
  DifficultyBreakdown,
  CefrBreakdown,
  LearningOutcomeSummary,
  CategoryLearningProgress,
  ProgressionPoint,
  ObjectiveAnalytics,
} from '@shared/analytics/quest-analytics-types';
import type { SkillDimension, SkillProfile } from '@shared/language/learning-profile';
import { SKILL_TO_CATEGORIES } from '@shared/language/learning-profile';
import type { CEFRLevel } from '@shared/language/cefr';

const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

function cefrRank(level: string | null | undefined): number {
  if (!level) return -1;
  const idx = CEFR_ORDER.indexOf(level as CEFRLevel);
  return idx >= 0 ? idx : -1;
}

function isFinished(q: Quest): boolean {
  return q.status === 'completed' || q.status === 'failed' || q.status === 'abandoned';
}

// ─── Quest Analytics ─────────────────────────────────────────────────────────

export function computeQuestAnalytics(quests: Quest[]): QuestAnalyticsSummary {
  const completed = quests.filter(q => q.status === 'completed');
  const failed = quests.filter(q => q.status === 'failed');
  const abandoned = quests.filter(q => q.status === 'abandoned');
  const active = quests.filter(q => q.status === 'active');
  const finished = quests.filter(isFinished);

  // Average completion time
  const completionTimes = completed
    .filter(q => q.assignedAt && q.completedAt)
    .map(q => new Date(q.completedAt!).getTime() - new Date(q.assignedAt!).getTime())
    .filter(t => t > 0);

  const avgCompletionTimeMs = completionTimes.length > 0
    ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
    : null;

  // Average attempts
  const totalAttempts = quests.reduce((sum, q) => sum + (q.attemptCount ?? 1), 0);
  const avgAttempts = quests.length > 0 ? totalAttempts / quests.length : 0;

  return {
    totalQuests: quests.length,
    completed: completed.length,
    failed: failed.length,
    abandoned: abandoned.length,
    active: active.length,
    completionRate: finished.length > 0 ? completed.length / finished.length : 0,
    avgAttempts,
    avgCompletionTimeMs,
    byQuestType: computeQuestTypeBreakdown(quests),
    byDifficulty: computeDifficultyBreakdown(quests),
    byCefrLevel: computeCefrBreakdown(quests),
  };
}

function computeQuestTypeBreakdown(quests: Quest[]): QuestTypeBreakdown[] {
  const groups = new Map<string, Quest[]>();
  for (const q of quests) {
    const type = q.questType || 'unknown';
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type)!.push(q);
  }

  return Array.from(groups.entries()).map(([questType, group]) => {
    const comp = group.filter(q => q.status === 'completed').length;
    const fail = group.filter(q => q.status === 'failed').length;
    const aband = group.filter(q => q.status === 'abandoned').length;
    const finished = comp + fail + aband;
    const totalAttempts = group.reduce((sum, q) => sum + (q.attemptCount ?? 1), 0);
    return {
      questType,
      total: group.length,
      completed: comp,
      failed: fail,
      abandoned: aband,
      completionRate: finished > 0 ? comp / finished : 0,
      avgAttempts: group.length > 0 ? totalAttempts / group.length : 0,
    };
  });
}

function computeDifficultyBreakdown(quests: Quest[]): DifficultyBreakdown[] {
  const groups = new Map<string, Quest[]>();
  for (const q of quests) {
    const diff = q.difficulty || 'unknown';
    if (!groups.has(diff)) groups.set(diff, []);
    groups.get(diff)!.push(q);
  }

  return Array.from(groups.entries()).map(([difficulty, group]) => {
    const comp = group.filter(q => q.status === 'completed').length;
    const fail = group.filter(q => q.status === 'failed').length;
    const finished = comp + fail + group.filter(q => q.status === 'abandoned').length;
    return {
      difficulty,
      total: group.length,
      completed: comp,
      failed: fail,
      completionRate: finished > 0 ? comp / finished : 0,
    };
  });
}

function computeCefrBreakdown(quests: Quest[]): CefrBreakdown[] {
  const groups = new Map<string, Quest[]>();
  for (const q of quests) {
    const level = q.cefrLevel || 'unset';
    if (!groups.has(level)) groups.set(level, []);
    groups.get(level)!.push(q);
  }

  return Array.from(groups.entries()).map(([cefrLevel, group]) => {
    const comp = group.filter(q => q.status === 'completed').length;
    const fail = group.filter(q => q.status === 'failed').length;
    const finished = comp + fail + group.filter(q => q.status === 'abandoned').length;
    return {
      cefrLevel,
      total: group.length,
      completed: comp,
      failed: fail,
      completionRate: finished > 0 ? comp / finished : 0,
    };
  });
}

// ─── Learning Outcomes ───────────────────────────────────────────────────────

export function computeLearningOutcomes(
  quests: Quest[],
  playerName: string,
  worldId: string,
  playthroughId?: string,
): LearningOutcomeSummary {
  const playerQuests = quests.filter(q => q.assignedTo === playerName);
  const completed = playerQuests.filter(q => q.status === 'completed');
  const finished = playerQuests.filter(isFinished);

  const totalXpEarned = completed.reduce((sum, q) => sum + (q.experienceReward ?? 0), 0);

  // Highest CEFR completed
  let highestCefrCompleted: CEFRLevel | null = null;
  for (const q of completed) {
    if (q.cefrLevel && cefrRank(q.cefrLevel) > cefrRank(highestCefrCompleted)) {
      highestCefrCompleted = q.cefrLevel as CEFRLevel;
    }
  }

  // Current CEFR: highest CEFR from recent completed quests (last 10)
  const recentCompleted = [...completed]
    .sort((a, b) => {
      const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 10);

  let currentCefrLevel: CEFRLevel | null = null;
  for (const q of recentCompleted) {
    if (q.cefrLevel && cefrRank(q.cefrLevel) > cefrRank(currentCefrLevel)) {
      currentCefrLevel = q.cefrLevel as CEFRLevel;
    }
  }

  const categoryProgress = computeCategoryProgress(playerQuests);
  const skillScores = computeSkillScoresFromQuests(categoryProgress);
  const progressionTimeline = buildProgressionTimeline(playerQuests);

  // Identify strengths and areas for improvement
  const strengths = categoryProgress
    .filter(cp => cp.questsAttempted >= 2 && cp.successRate >= 0.8)
    .map(cp => cp.category);

  const areasForImprovement = categoryProgress
    .filter(cp => cp.questsAttempted >= 2 && cp.successRate < 0.5)
    .map(cp => cp.category);

  return {
    playerName,
    worldId,
    playthroughId,
    totalXpEarned,
    questsCompleted: completed.length,
    questsAttempted: finished.length,
    successRate: finished.length > 0 ? completed.length / finished.length : 0,
    currentCefrLevel,
    highestCefrCompleted,
    skillScores,
    categoryProgress,
    progressionTimeline,
    strengths,
    areasForImprovement,
  };
}

function computeCategoryProgress(quests: Quest[]): CategoryLearningProgress[] {
  const groups = new Map<string, Quest[]>();
  for (const q of quests) {
    const cat = q.questType || 'unknown';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(q);
  }

  // Build reverse map: category -> skills it trains
  const categoryToSkills = new Map<string, SkillDimension[]>();
  for (const [skill, categories] of Object.entries(SKILL_TO_CATEGORIES)) {
    for (const cat of categories) {
      if (!categoryToSkills.has(cat)) categoryToSkills.set(cat, []);
      categoryToSkills.get(cat)!.push(skill as SkillDimension);
    }
  }

  return Array.from(groups.entries()).map(([category, group]) => {
    const comp = group.filter(q => q.status === 'completed').length;
    const finished = group.filter(isFinished).length;

    // Average objective completion
    let totalObjRate = 0;
    let questsWithObjectives = 0;
    for (const q of group) {
      const objectives = q.objectives as Array<{ completed?: boolean }> | null;
      if (objectives && objectives.length > 0) {
        const completedObjs = objectives.filter(o => o.completed).length;
        totalObjRate += completedObjs / objectives.length;
        questsWithObjectives++;
      }
    }

    const successRate = finished > 0 ? comp / finished : 0;
    // Mastery: weighted combination of success rate and volume (log scale)
    const volumeScore = Math.min(1, Math.log2(comp + 1) / 4); // caps at ~16 completions
    const mastery = successRate * 0.7 + volumeScore * 0.3;

    return {
      category,
      questsCompleted: comp,
      questsAttempted: finished,
      successRate,
      avgObjectiveCompletion: questsWithObjectives > 0 ? totalObjRate / questsWithObjectives : 0,
      trainedSkills: categoryToSkills.get(category) ?? [],
      mastery,
    };
  });
}

function computeSkillScoresFromQuests(categoryProgress: CategoryLearningProgress[]): SkillProfile {
  const profile: SkillProfile = {
    comprehension: 0.5,
    fluency: 0.5,
    vocabulary: 0.5,
    grammar: 0.5,
    pronunciation: 0.5,
  };

  // For each skill dimension, average the mastery of its contributing categories
  for (const [skill, categories] of Object.entries(SKILL_TO_CATEGORIES)) {
    const relevantCategories = categoryProgress.filter(cp =>
      categories.includes(cp.category as any)
    );

    if (relevantCategories.length > 0) {
      const avgMastery = relevantCategories.reduce((sum, cp) => sum + cp.mastery, 0) / relevantCategories.length;
      profile[skill as SkillDimension] = avgMastery;
    }
  }

  return profile;
}

function buildProgressionTimeline(quests: Quest[]): ProgressionPoint[] {
  const finishedQuests = quests
    .filter(isFinished)
    .filter(q => q.completedAt || q.failedAt || q.abandonedAt)
    .sort((a, b) => {
      const ta = getFinishTime(a);
      const tb = getFinishTime(b);
      return ta - tb;
    });

  let cumulativeXp = 0;
  return finishedQuests.map(q => {
    const xp = q.status === 'completed' ? (q.experienceReward ?? 0) : 0;
    cumulativeXp += xp;
    return {
      timestamp: getFinishTime(q),
      questId: q.id,
      questType: q.questType,
      success: q.status === 'completed',
      xpEarned: xp,
      cumulativeXp,
      cefrLevel: q.cefrLevel ?? undefined,
    };
  });
}

function getFinishTime(q: Quest): number {
  if (q.completedAt) return new Date(q.completedAt).getTime();
  if (q.failedAt) return new Date(q.failedAt).getTime();
  if (q.abandonedAt) return new Date(q.abandonedAt).getTime();
  return 0;
}

// ─── Objective Analytics ─────────────────────────────────────────────────────

export function computeObjectiveAnalytics(quests: Quest[]): ObjectiveAnalytics {
  const objectiveStats = new Map<string, { completed: number; total: number }>();
  let totalObjectives = 0;
  let questsWithObjectives = 0;
  let totalCompletedObjectives = 0;

  for (const q of quests) {
    const objectives = q.objectives as Array<{ type?: string; completed?: boolean }> | null;
    if (!objectives || objectives.length === 0) continue;
    questsWithObjectives++;
    totalObjectives += objectives.length;

    for (const obj of objectives) {
      const type = obj.type || 'unknown';
      if (!objectiveStats.has(type)) objectiveStats.set(type, { completed: 0, total: 0 });
      const stats = objectiveStats.get(type)!;
      stats.total++;
      if (obj.completed) {
        stats.completed++;
        totalCompletedObjectives++;
      }
    }
  }

  const entries = Array.from(objectiveStats.entries());

  const topCompletedTypes = entries
    .map(([type, s]) => ({ type, count: s.completed }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const hardestObjectiveTypes = entries
    .filter(([, s]) => s.total >= 3) // need minimum sample
    .map(([type, s]) => ({
      type,
      completionRate: s.total > 0 ? s.completed / s.total : 0,
      total: s.total,
    }))
    .sort((a, b) => a.completionRate - b.completionRate)
    .slice(0, 10);

  return {
    topCompletedTypes,
    hardestObjectiveTypes,
    avgObjectivesPerQuest: questsWithObjectives > 0 ? totalObjectives / questsWithObjectives : 0,
    overallObjectiveCompletionRate: totalObjectives > 0 ? totalCompletedObjectives / totalObjectives : 0,
  };
}
