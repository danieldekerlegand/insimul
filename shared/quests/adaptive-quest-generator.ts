/**
 * Adaptive Quest Generator
 *
 * Selects quest categories and templates based on a player's learning profile.
 * Targets weak skills, reinforces recent failures, explores untried categories,
 * and balances challenge with confidence-building.
 */

import {
  type LearningProfile,
  type QuestCategory,
  type SkillDimension,
  SKILL_TO_CATEGORIES,
} from '../language/learning-profile.js';
import {
  QUEST_TEMPLATES,
  type QuestTemplate,
} from '../language/quest-templates.js';
import {
  assignQuests,
  type WorldContext,
  type AssignmentOptions,
  type AssignedQuest,
} from './quest-assignment-engine.js';
import type { LanguageProgress } from '../language/progress.js';
import {
  generateErrorCorrectionQuests,
  computeErrorCorrectionWeight,
} from './error-correction-quest-generator.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdaptiveQuestOptions {
  count?: number;
  playerName: string;
  playerCharacterId?: string;
  excludeTemplateIds?: string[];
  /** Language progress data for error correction quest generation. */
  languageProgress?: LanguageProgress;
}

export interface CategoryWeight {
  category: string;
  weight: number;
  reason: string;
}

// ─── Category Weighting ──────────────────────────────────────────────────────

/**
 * Compute weighted category scores from a learning profile.
 * Higher weight = more likely to be selected for next quest.
 */
export function computeCategoryWeights(profile: LearningProfile): CategoryWeight[] {
  const weights = new Map<string, { weight: number; reasons: string[] }>();

  function addWeight(category: string, w: number, reason: string) {
    const existing = weights.get(category) ?? { weight: 0, reasons: [] };
    existing.weight += w;
    existing.reasons.push(reason);
    weights.set(category, existing);
  }

  // 1. Target weak skills → boost categories that train them
  for (const skill of profile.weakSkills) {
    const categories = SKILL_TO_CATEGORIES[skill];
    for (const cat of categories) {
      addWeight(cat, 3, `trains weak skill: ${skill}`);
    }
  }

  // 2. Boost weak categories (low success rate)
  for (const cat of profile.weakCategories) {
    addWeight(cat, 4, 'low success rate — needs practice');
  }

  // 3. Encourage exploration of untried categories
  for (const cat of profile.unexploredCategories) {
    addWeight(cat, 2, 'unexplored category');
  }

  // 4. Target weak grammar patterns via grammar/conversation quests
  if (profile.proficiency.weakGrammarPatterns.length > 0) {
    addWeight('grammar', 3, 'has weak grammar patterns');
    addWeight('conversation', 1, 'practice grammar in conversation');
  }

  // 5. Slightly reduce weight for strong categories (avoid over-testing)
  for (const cat of profile.strongCategories) {
    addWeight(cat, -1, 'already strong — reduce emphasis');
  }

  // 6. Error correction weight (if language progress data is available)
  // This is applied externally via applyErrorCorrectionWeight()

  // 7. Baseline weight for all categories so nothing is zero
  const allCategoryList = Array.from(new Set(
    Array.from(weights.keys()).concat(Object.values(SKILL_TO_CATEGORIES).flat()),
  ));
  for (const cat of allCategoryList) {
    if (!weights.has(cat)) {
      addWeight(cat, 1, 'baseline');
    }
  }

  // Normalize: ensure minimum weight of 0
  const result: CategoryWeight[] = [];
  for (const [category, { weight, reasons }] of Array.from(weights.entries())) {
    result.push({
      category,
      weight: Math.max(0, weight),
      reason: reasons.join('; '),
    });
  }

  return result.sort((a, b) => b.weight - a.weight);
}

// ─── Weighted Selection ──────────────────────────────────────────────────────

/**
 * Select N categories using weighted random sampling (no replacement).
 */
export function selectWeightedCategories(
  weights: CategoryWeight[],
  count: number,
): string[] {
  const positive = weights.filter(w => w.weight > 0);
  if (positive.length === 0) return [];

  const selected: string[] = [];
  const remaining = [...positive];

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, w) => sum + w.weight, 0);
    let roll = Math.random() * totalWeight;

    let chosenIdx = 0;
    for (let j = 0; j < remaining.length; j++) {
      roll -= remaining[j].weight;
      if (roll <= 0) {
        chosenIdx = j;
        break;
      }
    }

    selected.push(remaining[chosenIdx].category);
    remaining.splice(chosenIdx, 1);
  }

  return selected;
}

// ─── Difficulty Selection ────────────────────────────────────────────────────

/**
 * Determine the best difficulty for a quest given the learning profile and category.
 * Uses recent category performance to adjust up/down from the base proficiency level.
 */
export function selectDifficulty(
  profile: LearningProfile,
  category: string,
  index: number,
): string {
  const baseFluency = profile.proficiency.overallFluency;
  let baseDifficulty: string;
  if (baseFluency < 30) baseDifficulty = 'beginner';
  else if (baseFluency < 60) baseDifficulty = 'intermediate';
  else baseDifficulty = 'advanced';

  // Check category-specific performance
  const catPerf = profile.categoryPerformance.find(cp => cp.category === category);

  if (catPerf && catPerf.attempted >= 2) {
    if (catPerf.successRate < 0.4) {
      // Struggling in this category — drop difficulty by one tier
      baseDifficulty = dropDifficulty(baseDifficulty);
    } else if (catPerf.successRate >= 0.9 && catPerf.attempted >= 3) {
      // Excelling — raise difficulty by one tier
      baseDifficulty = raiseDifficulty(baseDifficulty);
    }
  }

  // Every 3rd quest is a confidence builder (one tier below)
  if (index % 3 === 0 && baseDifficulty !== 'beginner') {
    baseDifficulty = dropDifficulty(baseDifficulty);
  }

  return baseDifficulty;
}

function dropDifficulty(d: string): string {
  if (d === 'advanced') return 'intermediate';
  if (d === 'intermediate') return 'beginner';
  return 'beginner';
}

function raiseDifficulty(d: string): string {
  if (d === 'beginner') return 'intermediate';
  if (d === 'intermediate') return 'advanced';
  return 'advanced';
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Generate adaptive quests using the player's learning profile.
 * Wraps the existing quest assignment engine with intelligent category
 * and difficulty selection.
 */
export function generateAdaptiveQuests(
  ctx: WorldContext,
  profile: LearningProfile,
  options: AdaptiveQuestOptions,
): AssignedQuest[] {
  const count = options.count ?? 3;

  // Generate error correction quests if language progress is available
  const allQuests: AssignedQuest[] = [];
  const usedTemplateIds = new Set(options.excludeTemplateIds ?? []);

  if (options.languageProgress) {
    const errorWeight = computeErrorCorrectionWeight(options.languageProgress);
    if (errorWeight > 0) {
      // Reserve up to 1 slot for error correction quests (more if heavy errors)
      const errorSlots = errorWeight >= 4 ? 2 : 1;
      const errorQuests = generateErrorCorrectionQuests(ctx, options.languageProgress, {
        maxQuests: Math.min(errorSlots, count),
      });
      for (const eq of errorQuests) {
        allQuests.push(eq);
        usedTemplateIds.add(eq.templateId);
      }
    }
  }

  const remainingCount = count - allQuests.length;
  if (remainingCount <= 0) return allQuests;

  // Compute category weights from learning profile
  const weights = computeCategoryWeights(profile);

  // Select categories for each quest slot
  const selectedCategories = selectWeightedCategories(weights, remainingCount);

  // Generate quests one at a time with per-quest difficulty adjustment
  for (let i = 0; i < selectedCategories.length; i++) {
    const category = selectedCategories[i];
    const difficulty = selectDifficulty(profile, category, i);

    // Find templates matching category + difficulty
    let matching = QUEST_TEMPLATES.filter(
      t => t.category === category && t.difficulty === difficulty && !usedTemplateIds.has(t.id),
    );

    // Fallback: match category only
    if (matching.length === 0) {
      matching = QUEST_TEMPLATES.filter(
        t => t.category === category && !usedTemplateIds.has(t.id),
      );
    }

    // Fallback: any difficulty matching category pattern
    if (matching.length === 0) {
      matching = QUEST_TEMPLATES.filter(t => !usedTemplateIds.has(t.id));
    }

    if (matching.length === 0) continue;

    // Use the assignment engine for this single quest with the preferred category
    const quests = assignQuests(ctx, {
      playerName: options.playerName,
      playerCharacterId: options.playerCharacterId,
      proficiency: profile.proficiency,
      count: 1,
      preferredCategories: [category],
      excludeTemplateIds: Array.from(usedTemplateIds),
    });

    if (quests.length > 0) {
      allQuests.push(quests[0]);
      usedTemplateIds.add(quests[0].templateId);
    }
  }

  // If we didn't get enough quests, fill remaining with the base engine
  if (allQuests.length < count) {
    const remaining = assignQuests(ctx, {
      playerName: options.playerName,
      playerCharacterId: options.playerCharacterId,
      proficiency: profile.proficiency,
      count: count - allQuests.length,
      excludeTemplateIds: Array.from(usedTemplateIds),
    });
    allQuests.push(...remaining);
  }

  return allQuests;
}
