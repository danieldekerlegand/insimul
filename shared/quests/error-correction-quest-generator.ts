/**
 * Error Correction Quest Generator
 *
 * Analyzes a player's language progress to identify common mistakes
 * (high-error grammar patterns, frequently misused vocabulary) and
 * generates targeted remediation quests. Integrates with the adaptive
 * quest generator via category weighting and direct quest creation.
 */

import type { LanguageProgress, GrammarPattern, VocabularyEntry } from '../language/progress.js';
import type { QuestTemplate } from '../language/quest-templates.js';
import type { AssignedQuest, WorldContext } from './quest-assignment-engine.js';

// ─── Types ───────────────────────────────────────────────────────────────────

/** A detected error pattern from the player's history. */
export interface ErrorPattern {
  /** Unique key for deduplication. */
  key: string;
  /** 'grammar' or 'vocabulary' */
  type: 'grammar' | 'vocabulary';
  /** The grammar pattern name or vocabulary word. */
  target: string;
  /** Total incorrect uses. */
  errorCount: number;
  /** Total correct uses. */
  correctCount: number;
  /** Error rate 0-1 (errors / total). */
  errorRate: number;
  /** Explanations collected from past feedback. */
  explanations: string[];
  /** Example incorrect usages. */
  examples: string[];
  /** Severity score (higher = more urgent to remediate). */
  severity: number;
}

/** Options for error pattern analysis. */
export interface ErrorAnalysisOptions {
  /** Minimum total uses (correct + incorrect) to consider a pattern. Default 2. */
  minTotalUses?: number;
  /** Minimum error rate to flag a pattern. Default 0.3. */
  minErrorRate?: number;
  /** Maximum patterns to return. Default 10. */
  maxPatterns?: number;
}

/** An error correction quest ready for assignment. */
export interface ErrorCorrectionQuest extends AssignedQuest {
  /** The error pattern this quest targets. */
  errorPattern: ErrorPattern;
  /** Quest type marker. */
  questCategory: 'error_correction';
}

// ─── Error Pattern Analysis ──────────────────────────────────────────────────

/**
 * Analyze a player's language progress to find common error patterns.
 * Returns patterns sorted by severity (most urgent first).
 */
export function analyzeErrorPatterns(
  progress: LanguageProgress,
  options: ErrorAnalysisOptions = {},
): ErrorPattern[] {
  const {
    minTotalUses = 2,
    minErrorRate = 0.3,
    maxPatterns = 10,
  } = options;

  const patterns: ErrorPattern[] = [];

  // Analyze grammar patterns
  for (const gp of progress.grammarPatterns) {
    const total = gp.timesUsedCorrectly + gp.timesUsedIncorrectly;
    if (total < minTotalUses) continue;

    const errorRate = gp.timesUsedIncorrectly / total;
    if (errorRate < minErrorRate) continue;

    patterns.push({
      key: `grammar:${gp.pattern}`,
      type: 'grammar',
      target: gp.pattern,
      errorCount: gp.timesUsedIncorrectly,
      correctCount: gp.timesUsedCorrectly,
      errorRate,
      explanations: gp.explanations ?? [],
      examples: gp.examples ?? [],
      severity: computeSeverity(errorRate, gp.timesUsedIncorrectly, total),
    });
  }

  // Analyze vocabulary
  for (const entry of progress.vocabulary) {
    const total = entry.timesUsedCorrectly + entry.timesUsedIncorrectly;
    if (total < minTotalUses) continue;

    const errorRate = entry.timesUsedIncorrectly / total;
    if (errorRate < minErrorRate) continue;

    patterns.push({
      key: `vocabulary:${entry.word}`,
      type: 'vocabulary',
      target: entry.word,
      errorCount: entry.timesUsedIncorrectly,
      correctCount: entry.timesUsedCorrectly,
      errorRate,
      explanations: [],
      examples: entry.context ? [entry.context] : [],
      severity: computeSeverity(errorRate, entry.timesUsedIncorrectly, total),
    });
  }

  // Sort by severity descending, take top N
  patterns.sort((a, b) => b.severity - a.severity);
  return patterns.slice(0, maxPatterns);
}

/**
 * Compute a severity score for an error pattern.
 * Combines error rate with absolute error count and recency weight.
 */
function computeSeverity(errorRate: number, errorCount: number, totalUses: number): number {
  // Base: error rate (0-1) scaled to 0-50
  const rateScore = errorRate * 50;
  // Volume: log-scaled error count (more errors = more urgent), max ~25
  const volumeScore = Math.min(25, Math.log2(errorCount + 1) * 8);
  // Confidence: more data points = more confident the error is real
  const confidenceScore = Math.min(25, Math.log2(totalUses + 1) * 6);

  return rateScore + volumeScore + confidenceScore;
}

// ─── Quest Generation ────────────────────────────────────────────────────────

/** Error correction quest template definitions. */
export const ERROR_CORRECTION_TEMPLATES: QuestTemplate[] = [
  {
    id: 'grammar_correction_drill',
    name: 'Grammar Correction Drill',
    category: 'error_correction',
    description: 'Practice the "{{pattern}}" pattern you\'ve been struggling with by using it correctly in conversation.',
    difficulty: 'beginner',
    objectiveTemplates: [
      {
        type: 'practice_grammar',
        descriptionTemplate: 'Use the "{{pattern}}" pattern correctly {{count}} times in conversation',
        requiredCount: 3,
      },
    ],
    rewardScale: { xp: 20, fluency: 3 },
    parameters: [
      { name: 'pattern', type: 'grammar_pattern', description: 'Grammar pattern to practice' },
      { name: 'count', type: 'number', description: 'Correct uses required' },
    ],
  },
  {
    id: 'grammar_correction_conversation',
    name: 'Grammar Review Chat',
    category: 'error_correction',
    description: 'Have a conversation with {{npcName}} focusing on the "{{pattern}}" pattern. The NPC will gently correct mistakes.',
    difficulty: 'intermediate',
    objectiveTemplates: [
      {
        type: 'complete_conversation',
        descriptionTemplate: 'Have a conversation with {{npcName}} practicing "{{pattern}}"',
        requiredCount: 1,
      },
      {
        type: 'practice_grammar',
        descriptionTemplate: 'Use "{{pattern}}" correctly at least {{count}} times',
        requiredCount: 5,
      },
    ],
    rewardScale: { xp: 30, fluency: 4 },
    parameters: [
      { name: 'npcName', type: 'npc', description: 'NPC to practice with' },
      { name: 'pattern', type: 'grammar_pattern', description: 'Grammar pattern to correct' },
      { name: 'count', type: 'number', description: 'Correct uses required' },
    ],
  },
  {
    id: 'vocabulary_correction_practice',
    name: 'Word Correction Practice',
    category: 'error_correction',
    description: 'You\'ve been mixing up some words. Practice using {{wordList}} correctly in context.',
    difficulty: 'beginner',
    objectiveTemplates: [
      {
        type: 'use_vocabulary',
        descriptionTemplate: 'Use the words {{wordList}} correctly in conversation',
        requiredCount: 3,
      },
    ],
    rewardScale: { xp: 20, fluency: 3 },
    parameters: [
      { name: 'wordList', type: 'vocabulary_set', description: 'Words to practice' },
    ],
  },
  {
    id: 'vocabulary_correction_conversation',
    name: 'Word Review Chat',
    category: 'error_correction',
    description: 'Chat with {{npcName}} and practice using tricky words you\'ve been getting wrong.',
    difficulty: 'intermediate',
    objectiveTemplates: [
      {
        type: 'complete_conversation',
        descriptionTemplate: 'Have a conversation with {{npcName}} using problem vocabulary',
        requiredCount: 1,
      },
      {
        type: 'use_vocabulary',
        descriptionTemplate: 'Use {{count}} previously-missed words correctly',
        requiredCount: 4,
      },
    ],
    rewardScale: { xp: 30, fluency: 4 },
    parameters: [
      { name: 'npcName', type: 'npc', description: 'NPC to practice with' },
      { name: 'count', type: 'number', description: 'Words to use correctly' },
    ],
  },
  {
    id: 'mixed_error_review',
    name: 'Error Review Session',
    category: 'error_correction',
    description: 'A comprehensive review session targeting your most common mistakes in grammar and vocabulary.',
    difficulty: 'intermediate',
    objectiveTemplates: [
      {
        type: 'complete_conversation',
        descriptionTemplate: 'Complete a review conversation practicing problem areas',
        requiredCount: 1,
      },
      {
        type: 'practice_grammar',
        descriptionTemplate: 'Use problem grammar patterns correctly {{grammarCount}} times',
        requiredCount: 3,
      },
      {
        type: 'use_vocabulary',
        descriptionTemplate: 'Use {{vocabCount}} problem vocabulary words correctly',
        requiredCount: 3,
      },
    ],
    rewardScale: { xp: 40, fluency: 5 },
    parameters: [
      { name: 'grammarCount', type: 'number', description: 'Grammar corrections needed' },
      { name: 'vocabCount', type: 'number', description: 'Vocabulary corrections needed' },
    ],
  },
];

/**
 * Generate error correction quests from a player's error patterns.
 * Returns quests targeting the most severe error patterns.
 */
export function generateErrorCorrectionQuests(
  ctx: WorldContext,
  progress: LanguageProgress,
  options: {
    maxQuests?: number;
    analysisOptions?: ErrorAnalysisOptions;
  } = {},
): ErrorCorrectionQuest[] {
  const { maxQuests = 2, analysisOptions } = options;
  const errorPatterns = analyzeErrorPatterns(progress, analysisOptions);

  if (errorPatterns.length === 0) return [];

  const quests: ErrorCorrectionQuest[] = [];
  const usedPatternKeys = new Set<string>();

  // Group patterns by type
  const grammarPatterns = errorPatterns.filter(p => p.type === 'grammar');
  const vocabPatterns = errorPatterns.filter(p => p.type === 'vocabulary');

  // Generate mixed review quest if both types have errors
  if (grammarPatterns.length > 0 && vocabPatterns.length > 0 && maxQuests >= 2) {
    const quest = buildMixedReviewQuest(ctx, grammarPatterns, vocabPatterns);
    if (quest) {
      quests.push(quest);
      grammarPatterns.slice(0, 2).forEach(p => usedPatternKeys.add(p.key));
      vocabPatterns.slice(0, 2).forEach(p => usedPatternKeys.add(p.key));
    }
  }

  // Generate individual correction quests for remaining patterns
  for (const pattern of errorPatterns) {
    if (quests.length >= maxQuests) break;
    if (usedPatternKeys.has(pattern.key)) continue;

    const quest = buildCorrectionQuest(ctx, pattern);
    if (quest) {
      quests.push(quest);
      usedPatternKeys.add(pattern.key);
    }
  }

  return quests;
}

/**
 * Build a correction quest for a single error pattern.
 */
function buildCorrectionQuest(
  ctx: WorldContext,
  pattern: ErrorPattern,
): ErrorCorrectionQuest | null {
  const npc = pickRandomNpc(ctx);

  if (pattern.type === 'grammar') {
    // Choose template based on whether we have an NPC
    const templateId = npc ? 'grammar_correction_conversation' : 'grammar_correction_drill';
    const template = ERROR_CORRECTION_TEMPLATES.find(t => t.id === templateId)!;
    const count = pattern.errorRate > 0.6 ? 3 : 5;

    const filledParameters: Record<string, string | number> = {
      pattern: pattern.target,
      count,
    };
    if (npc) {
      filledParameters.npcName = `${npc.firstName} ${npc.lastName ?? ''}`.trim();
    }

    return {
      templateId: template.id,
      filledParameters,
      errorPattern: pattern,
      questCategory: 'error_correction',
      title: `Review: ${pattern.target}`,
      description: fillTemplate(template.description, filledParameters),
      difficulty: pattern.errorRate > 0.6 ? 'beginner' : 'intermediate',
      objectives: template.objectiveTemplates.map(ot => ({
        type: ot.type,
        description: fillTemplate(ot.descriptionTemplate, filledParameters),
        required: ot.requiredCount,
        grammarFocus: pattern.target,
        grammarPatterns: [pattern.target],
        requiredAccuracy: 60,
        requiredCorrectUses: count,
      })),
      rewardScale: template.rewardScale,
      questType: 'error_correction',
    };
  }

  // Vocabulary correction
  const templateId = npc ? 'vocabulary_correction_conversation' : 'vocabulary_correction_practice';
  const template = ERROR_CORRECTION_TEMPLATES.find(t => t.id === templateId)!;

  const filledParameters: Record<string, string | number> = {
    wordList: pattern.target,
    count: 3,
  };
  if (npc) {
    filledParameters.npcName = `${npc.firstName} ${npc.lastName ?? ''}`.trim();
  }

  return {
    templateId: template.id,
    filledParameters,
    errorPattern: pattern,
    questCategory: 'error_correction',
    title: `Review: "${pattern.target}"`,
    description: fillTemplate(template.description, filledParameters),
    difficulty: pattern.errorRate > 0.6 ? 'beginner' : 'intermediate',
    objectives: template.objectiveTemplates.map(ot => ({
      type: ot.type,
      description: fillTemplate(ot.descriptionTemplate, filledParameters),
      required: ot.requiredCount,
      vocabularyWords: [pattern.target],
    })),
    rewardScale: template.rewardScale,
    questType: 'error_correction',
  };
}

/**
 * Build a mixed review quest targeting both grammar and vocabulary errors.
 */
function buildMixedReviewQuest(
  ctx: WorldContext,
  grammarPatterns: ErrorPattern[],
  vocabPatterns: ErrorPattern[],
): ErrorCorrectionQuest | null {
  const template = ERROR_CORRECTION_TEMPLATES.find(t => t.id === 'mixed_error_review')!;
  const topGrammar = grammarPatterns[0];
  const topVocab = vocabPatterns[0];

  const filledParameters: Record<string, string | number> = {
    grammarCount: 3,
    vocabCount: 3,
  };

  // Combine the top errors into one summary pattern for tracking
  const combinedPattern: ErrorPattern = {
    key: 'mixed_review',
    type: 'grammar',
    target: `${topGrammar.target}, ${topVocab.target}`,
    errorCount: topGrammar.errorCount + topVocab.errorCount,
    correctCount: topGrammar.correctCount + topVocab.correctCount,
    errorRate: (topGrammar.errorRate + topVocab.errorRate) / 2,
    explanations: [...topGrammar.explanations, ...topVocab.explanations],
    examples: [...topGrammar.examples, ...topVocab.examples],
    severity: Math.max(topGrammar.severity, topVocab.severity),
  };

  const vocabWords = vocabPatterns.slice(0, 3).map(p => p.target);
  const grammarTargets = grammarPatterns.slice(0, 2).map(p => p.target);

  return {
    templateId: template.id,
    filledParameters,
    errorPattern: combinedPattern,
    questCategory: 'error_correction',
    title: 'Error Review Session',
    description: template.description,
    difficulty: 'intermediate',
    objectives: [
      {
        type: 'complete_conversation',
        description: 'Complete a review conversation practicing problem areas',
        required: 1,
      },
      {
        type: 'practice_grammar',
        description: `Use ${grammarTargets.join(', ')} correctly 3 times`,
        required: 3,
        grammarFocus: grammarTargets[0],
        grammarPatterns: grammarTargets,
        requiredAccuracy: 60,
        requiredCorrectUses: 3,
      },
      {
        type: 'use_vocabulary',
        description: `Use ${vocabWords.join(', ')} correctly`,
        required: vocabWords.length,
        vocabularyWords: vocabWords,
      },
    ],
    rewardScale: template.rewardScale,
    questType: 'error_correction',
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Pick a random active NPC from the world context. */
function pickRandomNpc(ctx: WorldContext): WorldContext['characters'][0] | null {
  const npcs = ctx.characters.filter(c => c.status === 'active');
  if (npcs.length === 0) return null;
  return npcs[Math.floor(Math.random() * npcs.length)];
}

/** Fill {{param}} placeholders in a template string. */
function fillTemplate(template: string, params: Record<string, string | number>): string {
  let result = template;
  for (const [key, val] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
  }
  return result;
}

/**
 * Compute a category weight boost for error_correction based on error density.
 * Returns 0 if there are no significant errors, up to 5 for heavy errors.
 */
export function computeErrorCorrectionWeight(progress: LanguageProgress): number {
  const patterns = analyzeErrorPatterns(progress, { minTotalUses: 2, minErrorRate: 0.3, maxPatterns: 5 });
  if (patterns.length === 0) return 0;

  // Average severity of top patterns, normalized to 0-5
  const avgSeverity = patterns.reduce((sum, p) => sum + p.severity, 0) / patterns.length;
  return Math.min(5, Math.round(avgSeverity / 20));
}
