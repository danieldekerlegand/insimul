/**
 * Grammar Quest Generator
 *
 * Generates targeted quests from a player's weakest grammar patterns.
 * Three quest types:
 *   1. Grammar Drill — conversation with teacher NPC focusing on the pattern
 *   2. Correction Challenge — read a passage with intentional errors, find/fix them
 *   3. Writing Practice — write sentences using the pattern, scored by LLM
 *
 * Integrates with the grammar weakness analyzer to select patterns and
 * tracks quest effectiveness by comparing error rates before/after.
 */

import type { LanguageProgress } from '../language/progress';
import type { CEFRLevel } from '../assessment/cefr-mapping';
import {
  analyzeGrammarWeaknesses,
  createErrorRateSnapshot,
  type GrammarWeakness,
  type ErrorRateSnapshot,
} from '../language/grammar-weakness-analyzer';

// ─── Types ──────────────────────────────────────────────────────────────────

/** The three grammar quest archetypes */
export type GrammarQuestType = 'grammar_drill' | 'correction_challenge' | 'writing_practice';

/** A generated grammar remediation quest */
export interface GrammarRemediationQuest {
  /** Unique quest identifier */
  id: string;
  /** Quest type */
  questType: GrammarQuestType;
  /** Human-readable title */
  title: string;
  /** Quest description */
  description: string;
  /** The grammar pattern being targeted */
  targetPattern: string;
  /** Difficulty based on error severity */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** CEFR level alignment */
  cefrLevel?: CEFRLevel;
  /** Structured objectives */
  objectives: GrammarQuestObjective[];
  /** Completion criteria */
  completionCriteria: GrammarQuestCompletionCriteria;
  /** XP reward */
  experienceReward: number;
  /** Fluency reward */
  fluencyReward: number;
  /** Error rate snapshot at quest creation time for effectiveness tracking */
  preQuestSnapshot: ErrorRateSnapshot;
  /** Tags for filtering/searching */
  tags: string[];
  /** The weakness data that generated this quest */
  sourceWeakness: GrammarWeakness;
  /** NPC system prompt additions for this quest */
  npcPromptAdditions: string;
}

/** An objective within a grammar quest */
export interface GrammarQuestObjective {
  type: string;
  description: string;
  required: number;
  grammarFocus: string;
  grammarPatterns: string[];
  requiredAccuracy?: number;
  requiredCorrectUses?: number;
}

/** Completion criteria for grammar quests */
export interface GrammarQuestCompletionCriteria {
  type: 'grammar_accuracy';
  requiredAccuracy: number;
  requiredCorrectUses: number;
  targetPattern: string;
}

/** Options for grammar quest generation */
export interface GrammarQuestGenerationOptions {
  /** Maximum quests to generate. Default 1 */
  maxQuests?: number;
  /** CEFR level for difficulty calibration */
  cefrLevel?: CEFRLevel;
  /** Target language name */
  targetLanguage?: string;
  /** Patterns that already have active quests (skip these) */
  activeQuestPatterns?: string[];
  /** NPC name to use for conversation quests */
  npcName?: string;
}

/** Result of grammar quest effectiveness measurement */
export interface QuestEffectivenessResult {
  pattern: string;
  questType: GrammarQuestType;
  beforeErrorRate: number;
  afterErrorRate: number;
  improvement: number;
  effective: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────

/** Minimum improvement (error rate decrease) to consider a quest effective */
const EFFECTIVENESS_THRESHOLD = 0.05;

// ─── Quest Generation ───────────────────────────────────────────────────────

/**
 * Generate grammar remediation quests from a player's weak patterns.
 * Only generates quests for patterns that don't already have active quests.
 */
export function generateGrammarQuests(
  progress: LanguageProgress,
  options: GrammarQuestGenerationOptions = {},
): GrammarRemediationQuest[] {
  const {
    maxQuests = 1,
    cefrLevel,
    targetLanguage = 'the target language',
    activeQuestPatterns = [],
    npcName,
  } = options;

  const analysis = analyzeGrammarWeaknesses(progress);
  if (analysis.weaknesses.length === 0) return [];

  // Filter out patterns that already have active quests
  const activeSet = new Set(activeQuestPatterns.map(p => p.toLowerCase()));
  const available = analysis.weaknesses.filter(
    w => !activeSet.has(w.pattern.toLowerCase()),
  );

  if (available.length === 0) return [];

  const snapshot = createErrorRateSnapshot(progress);
  const quests: GrammarRemediationQuest[] = [];

  for (const weakness of available) {
    if (quests.length >= maxQuests) break;

    const questType = selectQuestType(weakness, cefrLevel);
    const quest = buildGrammarQuest(
      weakness,
      questType,
      snapshot,
      cefrLevel,
      targetLanguage,
      npcName,
    );
    quests.push(quest);
  }

  return quests;
}

/**
 * Select the best quest type for a given weakness and player level.
 * - High error rate (>70%) → Grammar Drill (structured, guided)
 * - Moderate error rate (50-70%) → Correction Challenge (recognition practice)
 * - Any level with enough attempts → Writing Practice (production practice)
 */
function selectQuestType(
  weakness: GrammarWeakness,
  cefrLevel?: CEFRLevel,
): GrammarQuestType {
  // Beginners get drills for high error rates
  if (weakness.errorRate > 0.7 || cefrLevel === 'A1') {
    return 'grammar_drill';
  }

  // Alternate between correction challenge and writing practice
  // Use pattern name hash for deterministic selection
  const hash = simpleHash(weakness.pattern);
  if (weakness.errorRate > 0.6 || hash % 2 === 0) {
    return 'correction_challenge';
  }

  return 'writing_practice';
}

/**
 * Build a complete grammar quest from a weakness and quest type.
 */
function buildGrammarQuest(
  weakness: GrammarWeakness,
  questType: GrammarQuestType,
  snapshot: ErrorRateSnapshot,
  cefrLevel?: CEFRLevel,
  targetLanguage: string = 'the target language',
  npcName?: string,
): GrammarRemediationQuest {
  const difficulty = weakness.errorRate > 0.7 ? 'beginner' : weakness.errorRate > 0.55 ? 'intermediate' : 'advanced';
  const correctUsesNeeded = difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 5 : 7;
  const accuracyNeeded = difficulty === 'beginner' ? 50 : 60;
  const speakerName = npcName || 'a local teacher';

  switch (questType) {
    case 'grammar_drill':
      return {
        id: `grammar_drill_${weakness.pattern.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
        questType: 'grammar_drill',
        title: `Grammar Drill: ${capitalize(weakness.pattern)}`,
        description:
          `Practice "${weakness.pattern}" with ${speakerName}. ` +
          `They will guide you through exercises and correct your mistakes in real-time.`,
        targetPattern: weakness.pattern,
        difficulty,
        cefrLevel,
        objectives: [
          {
            type: 'complete_conversation',
            description: `Have a practice conversation with ${speakerName} focusing on "${weakness.pattern}"`,
            required: 1,
            grammarFocus: weakness.pattern,
            grammarPatterns: [weakness.pattern],
          },
          {
            type: 'practice_grammar',
            description: `Use "${weakness.pattern}" correctly ${correctUsesNeeded} times`,
            required: correctUsesNeeded,
            grammarFocus: weakness.pattern,
            grammarPatterns: [weakness.pattern],
            requiredAccuracy: accuracyNeeded,
            requiredCorrectUses: correctUsesNeeded,
          },
        ],
        completionCriteria: {
          type: 'grammar_accuracy',
          requiredAccuracy: accuracyNeeded,
          requiredCorrectUses: correctUsesNeeded,
          targetPattern: weakness.pattern,
        },
        experienceReward: 25,
        fluencyReward: 3,
        preQuestSnapshot: snapshot,
        tags: ['grammar', 'drill', weakness.pattern.toLowerCase(), 'remediation'],
        sourceWeakness: weakness,
        npcPromptAdditions: buildDrillNpcPrompt(weakness, targetLanguage),
      };

    case 'correction_challenge':
      return {
        id: `correction_challenge_${weakness.pattern.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
        questType: 'correction_challenge',
        title: `Correction Challenge: ${capitalize(weakness.pattern)}`,
        description:
          `Read a short passage in ${targetLanguage} that contains intentional "${weakness.pattern}" errors. ` +
          `Find and correct them to prove your understanding.`,
        targetPattern: weakness.pattern,
        difficulty,
        cefrLevel,
        objectives: [
          {
            type: 'practice_grammar',
            description: `Identify and correct "${weakness.pattern}" errors in the passage`,
            required: correctUsesNeeded,
            grammarFocus: weakness.pattern,
            grammarPatterns: [weakness.pattern],
            requiredAccuracy: accuracyNeeded,
            requiredCorrectUses: correctUsesNeeded,
          },
          {
            type: 'practice_grammar',
            description: `Write ${Math.max(2, correctUsesNeeded - 1)} correct sentences using "${weakness.pattern}"`,
            required: Math.max(2, correctUsesNeeded - 1),
            grammarFocus: weakness.pattern,
            grammarPatterns: [weakness.pattern],
            requiredCorrectUses: Math.max(2, correctUsesNeeded - 1),
          },
        ],
        completionCriteria: {
          type: 'grammar_accuracy',
          requiredAccuracy: accuracyNeeded,
          requiredCorrectUses: correctUsesNeeded,
          targetPattern: weakness.pattern,
        },
        experienceReward: 30,
        fluencyReward: 4,
        preQuestSnapshot: snapshot,
        tags: ['grammar', 'correction', weakness.pattern.toLowerCase(), 'remediation'],
        sourceWeakness: weakness,
        npcPromptAdditions: buildCorrectionNpcPrompt(weakness, targetLanguage),
      };

    case 'writing_practice':
      return {
        id: `writing_practice_${weakness.pattern.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
        questType: 'writing_practice',
        title: `Writing Practice: ${capitalize(weakness.pattern)}`,
        description:
          `Write sentences in ${targetLanguage} using "${weakness.pattern}" correctly. ` +
          `${capitalize(speakerName)} will review and score your writing.`,
        targetPattern: weakness.pattern,
        difficulty,
        cefrLevel,
        objectives: [
          {
            type: 'practice_grammar',
            description: `Write ${correctUsesNeeded} sentences using "${weakness.pattern}" correctly`,
            required: correctUsesNeeded,
            grammarFocus: weakness.pattern,
            grammarPatterns: [weakness.pattern],
            requiredAccuracy: accuracyNeeded + 10,
            requiredCorrectUses: correctUsesNeeded,
          },
        ],
        completionCriteria: {
          type: 'grammar_accuracy',
          requiredAccuracy: accuracyNeeded + 10,
          requiredCorrectUses: correctUsesNeeded,
          targetPattern: weakness.pattern,
        },
        experienceReward: 35,
        fluencyReward: 5,
        preQuestSnapshot: snapshot,
        tags: ['grammar', 'writing', weakness.pattern.toLowerCase(), 'remediation'],
        sourceWeakness: weakness,
        npcPromptAdditions: buildWritingNpcPrompt(weakness, targetLanguage),
      };
  }
}

// ─── NPC Prompt Builders ────────────────────────────────────────────────────

function buildDrillNpcPrompt(weakness: GrammarWeakness, targetLanguage: string): string {
  const explanations = weakness.explanations.slice(0, 2).join(' ');
  return (
    `[GRAMMAR DRILL MODE]\n` +
    `You are conducting a grammar drill focusing on "${weakness.pattern}" in ${targetLanguage}.\n` +
    `The player has an error rate of ${Math.round(weakness.errorRate * 100)}% with this pattern.\n` +
    (explanations ? `Common mistakes: ${explanations}\n` : '') +
    `Guide them through progressively harder exercises:\n` +
    `1. Start with simple fill-in-the-blank examples\n` +
    `2. Move to sentence completion\n` +
    `3. End with free-form conversation using the pattern\n` +
    `Correct mistakes gently and explain WHY the correct form is needed.\n` +
    `Celebrate correct usage enthusiastically.\n`
  );
}

function buildCorrectionNpcPrompt(weakness: GrammarWeakness, targetLanguage: string): string {
  return (
    `[CORRECTION CHALLENGE MODE]\n` +
    `Present the player with a short passage (3-5 sentences) in ${targetLanguage} that contains ` +
    `2-3 intentional errors involving "${weakness.pattern}".\n` +
    `Ask the player to find and correct the errors.\n` +
    `After they attempt corrections, confirm which they got right and explain any they missed.\n` +
    `Then ask them to write their own correct sentences using "${weakness.pattern}".\n` +
    `Keep the overall tone encouraging and conversational.\n`
  );
}

function buildWritingNpcPrompt(weakness: GrammarWeakness, targetLanguage: string): string {
  return (
    `[WRITING PRACTICE MODE]\n` +
    `Ask the player to write sentences in ${targetLanguage} using "${weakness.pattern}".\n` +
    `Provide a topic or context to make the writing natural (e.g., describe yesterday, plan for tomorrow).\n` +
    `After each sentence, evaluate the grammar:\n` +
    `- If correct: acknowledge and suggest a slightly harder variation\n` +
    `- If incorrect: show the corrected version and explain the rule\n` +
    `Require at least ${weakness.errorRate > 0.7 ? '3' : '5'} correctly-formed sentences.\n` +
    `The player's error rate with this pattern is ${Math.round(weakness.errorRate * 100)}%.\n`
  );
}

// ─── Effectiveness Tracking ─────────────────────────────────────────────────

/**
 * Measure the effectiveness of a completed grammar quest.
 * Compares the error rate before and after the quest.
 */
export function measureQuestEffectiveness(
  quest: GrammarRemediationQuest,
  currentProgress: LanguageProgress,
): QuestEffectivenessResult {
  const currentSnapshot = createErrorRateSnapshot(currentProgress);
  const pattern = quest.targetPattern;
  const beforeRate = quest.preQuestSnapshot.rates[pattern] ?? quest.sourceWeakness.errorRate;
  const afterRate = currentSnapshot.rates[pattern] ?? beforeRate;

  const improvement = beforeRate - afterRate;
  return {
    pattern,
    questType: quest.questType,
    beforeErrorRate: beforeRate,
    afterErrorRate: afterRate,
    improvement,
    effective: improvement >= EFFECTIVENESS_THRESHOLD,
  };
}

/**
 * Check if a grammar quest should be generated after a conversation.
 * Returns true if there are weak patterns without active remediation quests.
 */
export function shouldGenerateGrammarQuest(
  progress: LanguageProgress,
  activeQuestPatterns: string[] = [],
): boolean {
  const analysis = analyzeGrammarWeaknesses(progress);
  if (analysis.weaknesses.length === 0) return false;

  const activeSet = new Set(activeQuestPatterns.map(p => p.toLowerCase()));
  return analysis.weaknesses.some(
    w => !activeSet.has(w.pattern.toLowerCase()),
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function simpleHash(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
