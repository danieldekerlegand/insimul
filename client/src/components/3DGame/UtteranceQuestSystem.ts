/**
 * UtteranceQuestSystem — Manages quest objectives that require the player to
 * speak or type phrases in a target language.
 *
 * Objective types:
 *   speak_phrase         — Player must say/type a specific phrase
 *   use_vocabulary       — Player must use specific vocabulary words in conversation
 *   translate_phrase     — Player must provide a translation for a given phrase
 *   pronunciation_check  — Player must pronounce a word (evaluated by score)
 *   conversation_goal    — Player must achieve a conversational goal (e.g., "order food")
 *
 * Integrates with GameEventBus via:
 *   utterance_evaluated        — fired after each input evaluation
 *   utterance_quest_progress   — fired when objective progress changes
 *   utterance_quest_completed  — fired when an objective is fully completed
 */

import type { GameEventBus } from './GameEventBus';
import { scorePronunciation, type PronunciationResult, type WordResult } from '@shared/language/pronunciation-scoring';

// ── Types ───────────────────────────────────────────────────────────────────

export type UtteranceObjectiveType =
  | 'speak_phrase'
  | 'use_vocabulary'
  | 'collect_vocabulary'
  | 'translate_phrase'
  | 'pronunciation_check'
  | 'conversation_goal'
  | 'listen_to_conversation'
  | 'romance_stage_reach'
  | 'romance_gift';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'native';

export interface UtteranceHint {
  text: string;
  /** Penalty applied to the final score when this hint is revealed (0-1). */
  scorePenalty: number;
}

/**
 * A single accepted phrase/word for matching.
 * Multiple accepted forms allow for dialect or synonym variation.
 */
export interface AcceptedUtterance {
  text: string;
  /** Optional phonetic representation for pronunciation checks. */
  phonetic?: string;
}

export interface UtteranceObjectiveDefinition {
  id: string;
  questId: string;
  type: UtteranceObjectiveType;
  /** Human-readable instruction shown to the player. */
  prompt: string;
  /** The target language code (e.g., "es", "fr", "ja"). */
  targetLanguage: string;
  /** Accepted answers/phrases. */
  acceptedUtterances: AcceptedUtterance[];
  /** For use_vocabulary: the set of words the player must use. */
  requiredVocabulary?: string[];
  /** For conversation_goal: keywords or phrases that indicate goal completion. */
  goalKeywords?: string[];
  /** For collect_vocabulary: the vocabulary category to collect from (e.g. 'food', 'colors'). */
  targetCategory?: string;
  /** How many times the objective must be completed (default 1). */
  requiredCount: number;
  difficulty: DifficultyLevel;
  /** Progressive hints, revealed one at a time. */
  hints: UtteranceHint[];
  /** XP awarded on completion. */
  xpReward: number;
  /** Optional time limit in seconds. */
  timeLimit?: number;
  /** Max attempts before the objective fails (0 = unlimited). */
  maxAttempts: number;
}

export interface UtteranceObjectiveProgress {
  definition: UtteranceObjectiveDefinition;
  /** How many successful completions so far. */
  currentCount: number;
  /** Total attempts made. */
  attempts: number;
  /** Number of hints revealed so far. */
  hintsRevealed: number;
  /** Accumulated score across successful attempts (used for averaging). */
  totalScore: number;
  /** Timestamp (ms) when this objective was started. */
  startTime: number;
  /** Whether the objective is completed. */
  completed: boolean;
  /** Whether the objective has been failed (max attempts exceeded). */
  failed: boolean;
  /** For use_vocabulary: tracks which words have been used. */
  vocabularyUsed?: Set<string>;
  /** For collect_vocabulary: tracks words collected with their category. */
  collectedWords?: Set<string>;
  /** Accumulated pronunciation scores for bonus XP calculation. */
  pronunciationScores?: number[];
}

export interface EvaluationResult {
  passed: boolean;
  score: number;
  feedback: string;
  /** Best-matching accepted utterance (if any). */
  bestMatch?: string;
  /** Levenshtein distance to the best match. */
  distance?: number;
  /** NPC correction/response dialogue for incorrect attempts. */
  npcResponse?: string;
  /** Per-word pronunciation feedback (green=good, yellow=acceptable, red=needs work). */
  wordFeedback?: Array<{
    word: string;
    status: 'good' | 'acceptable' | 'needs_work' | 'missed';
    similarity: number;
  }>;
  /** Whether this was a pronunciation retry (score < 60%, not penalized). */
  isPronunciationRetry?: boolean;
  /** Pronunciation bonus XP multiplier (0-0.25) for conversation quests. */
  pronunciationBonusXpMultiplier?: number;
}

/**
 * NPC personality style for correction responses.
 */
export type CorrectionStyle = 'encouraging' | 'strict' | 'humorous' | 'patient' | 'scholarly';

interface CorrectionContext {
  npcName: string;
  style: CorrectionStyle;
  targetLanguage: string;
}

// ── Pronunciation feedback helpers ──────────────────────────────────────────

/**
 * Convert WordResult[] from pronunciation scoring into color-coded feedback.
 * green (good) = similarity >= 0.9, yellow (acceptable) = >= 0.6, red (needs_work) = < 0.6
 */
function wordResultsToFeedback(
  wordResults: WordResult[],
): EvaluationResult['wordFeedback'] {
  return wordResults
    .filter(w => w.match !== 'extra')
    .map(w => ({
      word: w.expected,
      status: w.match === 'missed' ? 'missed' as const
        : w.similarity >= 0.9 ? 'good' as const
        : w.similarity >= 0.6 ? 'acceptable' as const
        : 'needs_work' as const,
      similarity: w.similarity,
    }));
}

// ── Difficulty configuration ────────────────────────────────────────────────

interface DifficultyConfig {
  /** Maximum Levenshtein distance (as fraction of target length) for a pass. */
  maxDistanceRatio: number;
  /** Minimum score (0-100) to count as a successful attempt. */
  passThreshold: number;
  /** Whether to ignore accents/diacritics during matching. */
  ignoreAccents: boolean;
  /** Whether to ignore punctuation during matching. */
  ignorePunctuation: boolean;
}

const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  beginner: {
    maxDistanceRatio: 0.4,
    passThreshold: 40,
    ignoreAccents: true,
    ignorePunctuation: true,
  },
  intermediate: {
    maxDistanceRatio: 0.25,
    passThreshold: 55,
    ignoreAccents: true,
    ignorePunctuation: false,
  },
  advanced: {
    maxDistanceRatio: 0.15,
    passThreshold: 70,
    ignoreAccents: false,
    ignorePunctuation: false,
  },
  native: {
    maxDistanceRatio: 0.08,
    passThreshold: 85,
    ignoreAccents: false,
    ignorePunctuation: false,
  },
};

// ── System ──────────────────────────────────────────────────────────────────

export class UtteranceQuestSystem {
  private objectives: Map<string, UtteranceObjectiveDefinition> = new Map();
  private progress: Map<string, UtteranceObjectiveProgress> = new Map();
  private eventBus: GameEventBus | null;
  private correctionContext: CorrectionContext | null = null;

  constructor(eventBus?: GameEventBus) {
    this.eventBus = eventBus ?? null;
  }

  /** Set the NPC context for generating correction responses during dialogue. */
  setCorrectionContext(context: CorrectionContext): void {
    this.correctionContext = context;
  }

  /** Clear the correction context (e.g., when dialogue ends). */
  clearCorrectionContext(): void {
    this.correctionContext = null;
  }

  // ── Registration ────────────────────────────────────────────────────────

  /** Register a single utterance objective. */
  registerObjective(objective: UtteranceObjectiveDefinition): void {
    this.objectives.set(objective.id, objective);
  }

  /** Register multiple objectives at once. */
  registerObjectives(objectives: UtteranceObjectiveDefinition[]): void {
    for (const obj of objectives) {
      this.registerObjective(obj);
    }
  }

  /** Unregister an objective and its progress. */
  removeObjective(objectiveId: string): void {
    this.objectives.delete(objectiveId);
    this.progress.delete(objectiveId);
  }

  // ── Activation ──────────────────────────────────────────────────────────

  /** Activate an objective so it begins tracking progress. Returns null if not found. */
  activateObjective(objectiveId: string): UtteranceObjectiveProgress | null {
    const def = this.objectives.get(objectiveId);
    if (!def) return null;

    if (this.progress.has(objectiveId)) {
      return this.progress.get(objectiveId)!;
    }

    const prog: UtteranceObjectiveProgress = {
      definition: def,
      currentCount: 0,
      attempts: 0,
      hintsRevealed: 0,
      totalScore: 0,
      startTime: Date.now(),
      completed: false,
      failed: false,
      vocabularyUsed: def.type === 'use_vocabulary' ? new Set<string>() : undefined,
      collectedWords: def.type === 'collect_vocabulary' ? new Set<string>() : undefined,
      pronunciationScores: [],
    };

    this.progress.set(objectiveId, prog);
    return prog;
  }

  // ── Input evaluation ────────────────────────────────────────────────────

  /**
   * Evaluate player input against an active objective.
   * This is the main entry point for submitting utterances.
   */
  evaluateInput(objectiveId: string, input: string): EvaluationResult {
    const prog = this.progress.get(objectiveId);
    if (!prog) {
      return { passed: false, score: 0, feedback: 'Objective not active.' };
    }

    if (prog.completed) {
      return { passed: false, score: 0, feedback: 'Objective already completed.' };
    }

    if (prog.failed) {
      return { passed: false, score: 0, feedback: 'Objective has been failed.' };
    }

    // Check time limit
    if (prog.definition.timeLimit) {
      const elapsed = (Date.now() - prog.startTime) / 1000;
      if (elapsed > prog.definition.timeLimit) {
        prog.failed = true;
        return { passed: false, score: 0, feedback: 'Time expired.' };
      }
    }

    const def = prog.definition;
    const config = DIFFICULTY_CONFIGS[def.difficulty];
    let result: EvaluationResult;

    switch (def.type) {
      case 'speak_phrase':
        result = this.evaluateSpeakPhrase(input, def, config);
        break;
      case 'use_vocabulary':
        result = this.evaluateUseVocabulary(input, def, config, prog);
        break;
      case 'collect_vocabulary':
        result = this.evaluateCollectVocabulary(input, def, prog);
        break;
      case 'translate_phrase':
        result = this.evaluateTranslatePhrase(input, def, config);
        break;
      case 'pronunciation_check':
        result = this.evaluatePronunciation(input, def, config);
        break;
      case 'conversation_goal':
        result = this.evaluateConversationGoal(input, def, config);
        break;
      case 'listen_to_conversation':
        // Evaluated via event, not text input. Input here is the topic overheard.
        result = this.evaluateListenToConversation(input, def);
        break;
      case 'romance_stage_reach':
        // Evaluated via event. Input here is the current romance stage.
        result = this.evaluateRomanceStageReach(input, def);
        break;
      case 'romance_gift':
        // Evaluated via event. Input here is "gift_given:{npcId}".
        result = { passed: input.startsWith('gift_given:'), score: input.startsWith('gift_given:') ? 100 : 0, feedback: input.startsWith('gift_given:') ? 'Gift delivered!' : 'Give a gift to complete this objective.' };
        break;
      default:
        result = { passed: false, score: 0, feedback: 'Unknown objective type.' };
    }

    // Pronunciation retries (score < 60%) don't count against attempts
    if (!result.isPronunciationRetry) {
      prog.attempts++;
    }

    // Track pronunciation scores for bonus XP on conversation quests
    if (result.wordFeedback && prog.pronunciationScores) {
      prog.pronunciationScores.push(result.score);
    }

    // Generate NPC correction response for incorrect attempts
    if (!result.passed && this.correctionContext) {
      result.npcResponse = this.generateCorrectionResponse(
        input, def, result, this.correctionContext
      );
    } else if (result.passed && this.correctionContext) {
      result.npcResponse = this.generatePraiseResponse(
        result.score, this.correctionContext
      );
    }

    // Apply hint penalty
    if (result.passed && prog.hintsRevealed > 0) {
      let totalPenalty = 0;
      for (let i = 0; i < prog.hintsRevealed; i++) {
        if (i < def.hints.length) {
          totalPenalty += def.hints[i].scorePenalty;
        }
      }
      result.score = Math.max(0, result.score * (1 - totalPenalty));
    }

    // Emit evaluation event
    this.eventBus?.emit({
      type: 'utterance_evaluated',
      objectiveId,
      input,
      score: Math.round(result.score),
      passed: result.passed,
      feedback: result.feedback,
    });

    // Update progress on success
    if (result.passed) {
      prog.currentCount++;
      prog.totalScore += result.score;

      const percentage = Math.round((prog.currentCount / def.requiredCount) * 100);

      this.eventBus?.emit({
        type: 'utterance_quest_progress',
        questId: def.questId,
        objectiveId,
        current: prog.currentCount,
        required: def.requiredCount,
        percentage: Math.min(100, percentage),
      });

      // Check completion
      if (prog.currentCount >= def.requiredCount) {
        prog.completed = true;
        const finalScore = Math.round(prog.totalScore / prog.currentCount);

        // Calculate pronunciation bonus XP (up to 25%) for conversation quests
        const bonusMultiplier = this.calculatePronunciationBonusXp(prog);
        const bonusXp = Math.round(def.xpReward * bonusMultiplier);
        const totalXp = def.xpReward + bonusXp;

        if (bonusMultiplier > 0) {
          result.pronunciationBonusXpMultiplier = bonusMultiplier;
        }

        this.eventBus?.emit({
          type: 'utterance_quest_completed',
          questId: def.questId,
          objectiveId,
          finalScore,
          xpAwarded: totalXp,
          pronunciationBonusXp: bonusXp,
        });

        // Emit pronunciation assessment data for periodic assessments
        if (prog.pronunciationScores && prog.pronunciationScores.length > 0) {
          const avgPronunciation = Math.round(
            prog.pronunciationScores.reduce((a, b) => a + b, 0) / prog.pronunciationScores.length
          );
          this.eventBus?.emit({
            type: 'pronunciation_assessment_data',
            questId: def.questId,
            averageScore: avgPronunciation,
            sampleCount: prog.pronunciationScores.length,
          });
        }
      }
    }

    // Check max attempts failure
    if (!result.passed && def.maxAttempts > 0 && prog.attempts >= def.maxAttempts) {
      prog.failed = true;
      result.feedback += ' No more attempts remaining.';
    }

    return result;
  }

  // ── Evaluation strategies ─────────────────────────────────────────────

  private evaluateSpeakPhrase(
    input: string,
    def: UtteranceObjectiveDefinition,
    config: DifficultyConfig,
  ): EvaluationResult {
    // Use shared pronunciation scoring for word-level feedback
    let bestResult: PronunciationResult | null = null;
    let bestMatch = '';
    let bestDistance = Infinity;

    for (const accepted of def.acceptedUtterances) {
      const result = scorePronunciation(accepted.text, input);
      // Also compute distance for backward compatibility
      const normalizedInput = this.normalize(input, config);
      const normalizedTarget = this.normalize(accepted.text, config);
      const distance = this.levenshtein(normalizedInput, normalizedTarget);

      if (!bestResult || result.overallScore > bestResult.overallScore) {
        bestResult = result;
        bestMatch = accepted.text;
        bestDistance = distance;
      }
    }

    if (!bestResult) {
      return { passed: false, score: 0, feedback: 'No target phrase to compare.' };
    }

    const score = bestResult.overallScore;
    const wordFeedback = wordResultsToFeedback(bestResult.wordResults);
    const passed = score >= config.passThreshold;

    let feedback: string;
    if (passed) {
      feedback = score >= 90 ? 'Excellent!' : score >= 70 ? 'Good job!' : 'Acceptable. Keep practicing!';
    } else {
      feedback = score >= 30 ? 'Close, but not quite. Try again.' : 'That doesn\'t seem right. Check the prompt and try again.';
    }

    return { passed, score, feedback, bestMatch, distance: bestDistance, wordFeedback };
  }

  private evaluateUseVocabulary(
    input: string,
    def: UtteranceObjectiveDefinition,
    config: DifficultyConfig,
    prog: UtteranceObjectiveProgress,
  ): EvaluationResult {
    if (!def.requiredVocabulary || def.requiredVocabulary.length === 0) {
      return { passed: false, score: 0, feedback: 'No required vocabulary defined.' };
    }

    const normalizedInput = this.normalize(input, config);
    const inputWords = normalizedInput.split(/\s+/);
    const newlyUsed: string[] = [];

    for (const vocabWord of def.requiredVocabulary) {
      const normalizedVocab = this.normalize(vocabWord, config);
      if (prog.vocabularyUsed?.has(normalizedVocab)) continue;

      // Check if any input word fuzzy-matches this vocab word
      const matched = inputWords.some(w => {
        if (w === normalizedVocab) return true;
        const maxDist = Math.max(1, Math.ceil(normalizedVocab.length * config.maxDistanceRatio));
        return this.levenshtein(w, normalizedVocab) <= maxDist;
      });

      if (matched) {
        prog.vocabularyUsed?.add(normalizedVocab);
        newlyUsed.push(vocabWord);
      }
    }

    const totalRequired = def.requiredVocabulary.length;
    const totalUsed = prog.vocabularyUsed?.size ?? 0;
    const score = Math.round((totalUsed / totalRequired) * 100);
    const passed = newlyUsed.length > 0;

    let feedback: string;
    if (newlyUsed.length > 0) {
      feedback = `Used: ${newlyUsed.join(', ')}. ${totalUsed}/${totalRequired} vocabulary words found.`;
    } else {
      feedback = `No new vocabulary words detected. ${totalUsed}/${totalRequired} found so far.`;
    }

    return { passed, score, feedback };
  }

  /**
   * Evaluate a "collect_vocabulary" objective.
   * Input format: "word:category" (e.g. "manzana:food").
   * Tracks unique words collected in the target category.
   */
  private evaluateCollectVocabulary(
    input: string,
    def: UtteranceObjectiveDefinition,
    prog: UtteranceObjectiveProgress,
  ): EvaluationResult {
    // Parse "word:category" format
    const colonIdx = input.indexOf(':');
    if (colonIdx === -1) {
      return { passed: false, score: 0, feedback: 'Invalid format. Expected "word:category".' };
    }

    const word = input.substring(0, colonIdx).trim().toLowerCase();
    const category = input.substring(colonIdx + 1).trim().toLowerCase();

    if (!word) {
      return { passed: false, score: 0, feedback: 'No word provided.' };
    }

    // Check category matches if targetCategory is specified
    if (def.targetCategory && category !== def.targetCategory.toLowerCase()) {
      return {
        passed: false,
        score: 0,
        feedback: `Word "${word}" is not in the "${def.targetCategory}" category.`,
      };
    }

    // Check if already collected
    if (prog.collectedWords?.has(word)) {
      return {
        passed: false,
        score: 0,
        feedback: `"${word}" already collected. Find a new word!`,
      };
    }

    // Collect the word
    prog.collectedWords?.add(word);
    const collected = prog.collectedWords?.size ?? 0;
    const required = def.requiredCount;
    const score = Math.round((collected / required) * 100);

    return {
      passed: true,
      score,
      feedback: `Collected "${word}"! ${collected}/${required} words found.`,
    };
  }

  private evaluateTranslatePhrase(
    input: string,
    def: UtteranceObjectiveDefinition,
    config: DifficultyConfig,
  ): EvaluationResult {
    // Translation uses the same fuzzy matching as speak_phrase
    return this.evaluateSpeakPhrase(input, def, config);
  }

  private evaluatePronunciation(
    input: string,
    def: UtteranceObjectiveDefinition,
    config: DifficultyConfig,
  ): EvaluationResult {
    // Use shared pronunciation scoring for word-level feedback
    let bestResult: PronunciationResult | null = null;
    let bestMatch = '';

    for (const accepted of def.acceptedUtterances) {
      const target = accepted.text;
      const result = scorePronunciation(target, input);

      if (!bestResult || result.overallScore > bestResult.overallScore) {
        bestResult = result;
        bestMatch = target;
      }
    }

    if (!bestResult) {
      return { passed: false, score: 0, feedback: 'No target phrase to compare.' };
    }

    const score = bestResult.overallScore;
    const wordFeedback = wordResultsToFeedback(bestResult.wordResults);

    // Retry logic: score < 60% prompts retry without penalty
    if (score < 60) {
      return {
        passed: false,
        score,
        feedback: `Try saying it again: "${bestMatch}". ${bestResult.feedback}`,
        bestMatch,
        wordFeedback,
        isPronunciationRetry: true,
      };
    }

    const passed = score >= config.passThreshold;
    let feedback: string;
    if (passed) {
      feedback = score >= 95 ? 'Perfect pronunciation!' : score >= 80 ? 'Good pronunciation.' : 'Understandable pronunciation.';
    } else {
      feedback = `Pronunciation needs work. Try to match: "${bestMatch}"`;
    }

    return { passed, score, feedback, bestMatch, wordFeedback };
  }

  private evaluateConversationGoal(
    input: string,
    def: UtteranceObjectiveDefinition,
    config: DifficultyConfig,
  ): EvaluationResult {
    if (!def.goalKeywords || def.goalKeywords.length === 0) {
      return { passed: false, score: 0, feedback: 'No conversation goal keywords defined.' };
    }

    const normalizedInput = this.normalize(input, config);
    const inputWords = normalizedInput.split(/\s+/);
    let keywordsFound = 0;

    for (const keyword of def.goalKeywords) {
      const normalizedKeyword = this.normalize(keyword, config);
      const keywordTokens = normalizedKeyword.split(/\s+/);

      // For multi-word keywords, check if they appear as a subsequence
      if (keywordTokens.length > 1) {
        if (normalizedInput.includes(normalizedKeyword)) {
          keywordsFound++;
          continue;
        }
        // Fuzzy: check if all tokens appear in input
        const allPresent = keywordTokens.every(token =>
          inputWords.some(w => {
            const maxDist = Math.max(1, Math.ceil(token.length * config.maxDistanceRatio));
            return this.levenshtein(w, token) <= maxDist;
          })
        );
        if (allPresent) keywordsFound++;
      } else {
        // Single-word keyword
        const found = inputWords.some(w => {
          if (w === normalizedKeyword) return true;
          const maxDist = Math.max(1, Math.ceil(normalizedKeyword.length * config.maxDistanceRatio));
          return this.levenshtein(w, normalizedKeyword) <= maxDist;
        });
        if (found) keywordsFound++;
      }
    }

    const score = Math.round((keywordsFound / def.goalKeywords.length) * 100);
    const passed = score >= config.passThreshold;

    let feedback: string;
    if (passed) {
      feedback = score >= 90 ? 'Conversation goal achieved perfectly!' : 'Conversation goal met.';
    } else {
      feedback = `Conversation goal partially met (${keywordsFound}/${def.goalKeywords.length} key elements). Keep going.`;
    }

    return { passed, score, feedback };
  }

  // ── Pronunciation bonus ──────────────────────────────────────────────

  /**
   * Calculate pronunciation bonus XP multiplier (0 to 0.25).
   * For conversation quests, excellent pronunciation awards up to 25% bonus XP.
   */
  private calculatePronunciationBonusXp(prog: UtteranceObjectiveProgress): number {
    const scores = prog.pronunciationScores;
    if (!scores || scores.length === 0) return 0;

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Scale: 90+ = 25% bonus, 70-89 = 10-24% bonus, below 70 = no bonus
    if (avgScore >= 90) return 0.25;
    if (avgScore >= 70) return Math.round(((avgScore - 70) / 20) * 0.15 * 100) / 100 + 0.10;
    return 0;
  }

  // ── Hints ─────────────────────────────────────────────────────────────

  /** Reveal the next hint for an active objective. Returns null if no more hints. */
  getNextHint(objectiveId: string): UtteranceHint | null {
    const prog = this.progress.get(objectiveId);
    if (!prog) return null;

    const hints = prog.definition.hints;
    if (prog.hintsRevealed >= hints.length) return null;

    const hint = hints[prog.hintsRevealed];
    prog.hintsRevealed++;
    return hint;
  }

  /** Get all hints revealed so far for an objective. */
  getRevealedHints(objectiveId: string): UtteranceHint[] {
    const prog = this.progress.get(objectiveId);
    if (!prog) return [];
    return prog.definition.hints.slice(0, prog.hintsRevealed);
  }

  /** Get the number of remaining unrevealed hints. */
  getRemainingHintCount(objectiveId: string): number {
    const prog = this.progress.get(objectiveId);
    if (!prog) return 0;
    return Math.max(0, prog.definition.hints.length - prog.hintsRevealed);
  }

  // ── Queries ───────────────────────────────────────────────────────────

  /** Get progress for a specific objective. */
  getProgress(objectiveId: string): UtteranceObjectiveProgress | null {
    return this.progress.get(objectiveId) ?? null;
  }

  /** Get all active (non-completed, non-failed) objectives. */
  getActiveObjectives(): UtteranceObjectiveProgress[] {
    return Array.from(this.progress.values()).filter(p => !p.completed && !p.failed);
  }

  /** Get all completed objectives. */
  getCompletedObjectives(): UtteranceObjectiveProgress[] {
    return Array.from(this.progress.values()).filter(p => p.completed);
  }

  /** Get all objectives for a specific quest. */
  getObjectivesForQuest(questId: string): UtteranceObjectiveProgress[] {
    return Array.from(this.progress.values()).filter(p => p.definition.questId === questId);
  }

  /** Check if all objectives for a quest are completed. */
  isQuestComplete(questId: string): boolean {
    const questObjectives = this.getObjectivesForQuest(questId);
    if (questObjectives.length === 0) return false;
    return questObjectives.every(p => p.completed);
  }

  /** Get the average score across all completed objectives for a quest. */
  getQuestAverageScore(questId: string): number {
    const completed = this.getObjectivesForQuest(questId).filter(p => p.completed);
    if (completed.length === 0) return 0;
    const totalAvg = completed.reduce((sum, p) => {
      return sum + (p.currentCount > 0 ? p.totalScore / p.currentCount : 0);
    }, 0);
    return Math.round(totalAvg / completed.length);
  }

  /** Get a registered objective definition by ID. */
  getObjectiveDefinition(objectiveId: string): UtteranceObjectiveDefinition | null {
    return this.objectives.get(objectiveId) ?? null;
  }

  /** Get all registered objective definitions. */
  getAllDefinitions(): UtteranceObjectiveDefinition[] {
    return Array.from(this.objectives.values());
  }

  // ── Reset / Cleanup ───────────────────────────────────────────────────

  /** Reset progress for a specific objective (allows retry). */
  resetObjective(objectiveId: string): void {
    const def = this.objectives.get(objectiveId);
    if (!def) return;
    this.progress.delete(objectiveId);
  }

  /** Remove all objectives and progress. */
  dispose(): void {
    this.objectives.clear();
    this.progress.clear();
  }

  // ── Serialization ─────────────────────────────────────────────────────

  /** Serialize system state for save/load. */
  serialize(): UtteranceQuestSaveData {
    const progressEntries: Array<[string, SerializedProgress]> = [];

    for (const [id, prog] of Array.from(this.progress.entries())) {
      progressEntries.push([id, {
        definitionId: prog.definition.id,
        currentCount: prog.currentCount,
        attempts: prog.attempts,
        hintsRevealed: prog.hintsRevealed,
        totalScore: prog.totalScore,
        startTime: prog.startTime,
        completed: prog.completed,
        failed: prog.failed,
        vocabularyUsed: prog.vocabularyUsed ? Array.from(prog.vocabularyUsed) : undefined,
        collectedWords: prog.collectedWords ? Array.from(prog.collectedWords) : undefined,
        pronunciationScores: prog.pronunciationScores,
      }]);
    }

    return {
      objectives: Array.from(this.objectives.entries()).map(([id, def]) => [id, def]),
      progress: progressEntries,
    };
  }

  /** Restore system state from saved data. */
  deserialize(data: UtteranceQuestSaveData): void {
    this.objectives.clear();
    this.progress.clear();

    for (const [id, def] of data.objectives) {
      this.objectives.set(id, def);
    }

    for (const [id, saved] of data.progress) {
      const def = this.objectives.get(saved.definitionId);
      if (!def) continue;

      this.progress.set(id, {
        definition: def,
        currentCount: saved.currentCount,
        attempts: saved.attempts,
        hintsRevealed: saved.hintsRevealed,
        totalScore: saved.totalScore,
        startTime: saved.startTime,
        completed: saved.completed,
        failed: saved.failed,
        vocabularyUsed: saved.vocabularyUsed ? new Set(saved.vocabularyUsed) : undefined,
        collectedWords: saved.collectedWords ? new Set(saved.collectedWords) : undefined,
        pronunciationScores: saved.pronunciationScores ?? [],
      });
    }
  }

  // ── NPC Correction / Praise Responses ────────────────────────────────

  private generateCorrectionResponse(
    input: string,
    def: UtteranceObjectiveDefinition,
    result: EvaluationResult,
    ctx: CorrectionContext,
  ): string {
    const { npcName, style } = ctx;
    const correctAnswer = result.bestMatch || (def.acceptedUtterances[0]?.text ?? '');
    const score = result.score;

    // Select templates based on correction style
    const templates = CORRECTION_TEMPLATES[style];

    if (score >= 30 && correctAnswer) {
      // Close attempt — provide gentle correction
      const template = templates.close[Math.floor(Math.random() * templates.close.length)];
      return template
        .replace('{npc}', npcName)
        .replace('{correct}', correctAnswer)
        .replace('{input}', input);
    } else if (correctAnswer) {
      // Far off — provide the correct form
      const template = templates.far[Math.floor(Math.random() * templates.far.length)];
      return template
        .replace('{npc}', npcName)
        .replace('{correct}', correctAnswer)
        .replace('{input}', input);
    } else {
      // No correct answer to show
      const template = templates.generic[Math.floor(Math.random() * templates.generic.length)];
      return template.replace('{npc}', npcName);
    }
  }

  private generatePraiseResponse(
    score: number,
    ctx: CorrectionContext,
  ): string {
    const { npcName, style } = ctx;
    const templates = PRAISE_TEMPLATES[style];

    if (score >= 90) {
      return templates.excellent[Math.floor(Math.random() * templates.excellent.length)]
        .replace('{npc}', npcName);
    } else if (score >= 70) {
      return templates.good[Math.floor(Math.random() * templates.good.length)]
        .replace('{npc}', npcName);
    } else {
      return templates.okay[Math.floor(Math.random() * templates.okay.length)]
        .replace('{npc}', npcName);
    }
  }

  // ── Text processing utilities ─────────────────────────────────────────

  /** Normalize text for comparison based on difficulty config. */
  private normalize(text: string, config: DifficultyConfig): string {
    let result = text.trim().toLowerCase();

    if (config.ignorePunctuation) {
      result = result.replace(/[.,!?;:'"()\-\u2014\u2013\u00ab\u00bb\u201c\u201d\u2018\u2019]/g, '');
    }

    if (config.ignoreAccents) {
      result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // Collapse multiple spaces
    result = result.replace(/\s+/g, ' ').trim();

    return result;
  }

  /** Convert Levenshtein distance to a 0-100 score. */
  private distanceToScore(distance: number, targetLength: number): number {
    if (targetLength === 0) return distance === 0 ? 100 : 0;
    const ratio = distance / targetLength;
    return Math.max(0, Math.round((1 - ratio) * 100));
  }

  /**
   * Levenshtein distance between two strings.
   * Uses a standard dynamic-programming approach.
   */
  private levenshtein(a: string, b: string): number {
    const aLen = a.length;
    const bLen = b.length;

    if (aLen === 0) return bLen;
    if (bLen === 0) return aLen;

    // Use two-row optimization for space efficiency
    let prevRow: number[] = [];
    let currRow: number[] = [];

    for (let j = 0; j <= bLen; j++) {
      prevRow[j] = j;
    }

    for (let i = 1; i <= aLen; i++) {
      currRow[0] = i;
      for (let j = 1; j <= bLen; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        currRow[j] = Math.min(
          prevRow[j] + 1,       // deletion
          currRow[j - 1] + 1,   // insertion
          prevRow[j - 1] + cost, // substitution
        );
      }
      const tmp = prevRow;
      prevRow = currRow;
      currRow = tmp;
    }

    return prevRow[bLen];
  }

  // ── Event-Driven Objective Evaluators ──────────────────────────────────────

  /**
   * Evaluate a "listen_to_conversation" objective.
   * Input is the topic string from a conversation_overheard event.
   */
  private evaluateListenToConversation(
    topic: string,
    def: UtteranceObjectiveDefinition,
  ): EvaluationResult {
    // Goal keywords represent the topics the player needs to overhear
    if (!def.goalKeywords || def.goalKeywords.length === 0) {
      return { passed: true, score: 100, feedback: 'Conversation overheard!' };
    }

    const normalizedTopic = topic.toLowerCase().trim();
    const matched = def.goalKeywords.some(kw => normalizedTopic.includes(kw.toLowerCase()));

    if (matched) {
      return { passed: true, score: 100, feedback: 'You overheard the right conversation!' };
    }
    return { passed: false, score: 0, feedback: 'Keep listening for the right topic.' };
  }

  /**
   * Evaluate a "romance_stage_reach" objective.
   * Input is the current romance stage string (e.g., "dating", "committed").
   */
  private evaluateRomanceStageReach(
    currentStage: string,
    def: UtteranceObjectiveDefinition,
  ): EvaluationResult {
    // acceptedUtterances contains the target stage(s)
    const targetStages = def.acceptedUtterances.map(u => u.text.toLowerCase());
    const stageOrder = ['none', 'attracted', 'flirting', 'dating', 'committed', 'engaged', 'married'];
    const currentIdx = stageOrder.indexOf(currentStage.toLowerCase());
    const targetIdx = Math.max(...targetStages.map(s => stageOrder.indexOf(s)));

    if (currentIdx >= targetIdx && targetIdx >= 0) {
      return { passed: true, score: 100, feedback: `You've reached the ${currentStage} stage!` };
    }

    const progress = targetIdx > 0 ? Math.round((currentIdx / targetIdx) * 100) : 0;
    return { passed: false, score: progress, feedback: `Current stage: ${currentStage}. Keep building the relationship!` };
  }
}

// ── Serialization types ─────────────────────────────────────────────────────

interface SerializedProgress {
  definitionId: string;
  currentCount: number;
  attempts: number;
  hintsRevealed: number;
  totalScore: number;
  startTime: number;
  completed: boolean;
  failed: boolean;
  vocabularyUsed?: string[];
  collectedWords?: string[];
  pronunciationScores?: number[];
}

export interface UtteranceQuestSaveData {
  objectives: Array<[string, UtteranceObjectiveDefinition]>;
  progress: Array<[string, SerializedProgress]>;
}

// ── Utterance Quest Templates ───────────────────────────────────────────────

/**
 * Pre-built utterance quest templates for common language-learning scenarios.
 * Use `createFromTemplate(templateId, overrides)` to instantiate.
 */
export type UtteranceQuestTemplate = Omit<UtteranceObjectiveDefinition, 'id' | 'questId' | 'xpReward' | 'maxAttempts'> & {
  xpReward?: number;
  maxAttempts?: number;
};

// ── NPC Correction Response Templates ──────────────────────────────────────

const CORRECTION_TEMPLATES: Record<CorrectionStyle, { close: string[]; far: string[]; generic: string[] }> = {
  encouraging: {
    close: [
      '"{npc} smiles warmly" Almost! You said "{input}" — try "{correct}" instead. You\'re so close!',
      '"{npc} nods encouragingly" Good try! The right way to say it is "{correct}". Keep it up!',
      '"{npc} tilts their head" Not quite, but I can see what you meant. It should be "{correct}".',
    ],
    far: [
      '"{npc} smiles patiently" That\'s not quite right, but don\'t worry! The word you\'re looking for is "{correct}".',
      '"{npc} gestures kindly" Let me help — you want to say "{correct}". Try again!',
    ],
    generic: [
      '"{npc} gives a reassuring look" Not quite, but you\'re learning! Try again.',
      '"{npc} encourages you" Keep trying, you\'ll get it!',
    ],
  },
  strict: {
    close: [
      '"{npc} shakes their head" No. It\'s "{correct}", not "{input}". Pay attention to the details.',
      '"{npc} corrects you firmly" Close, but incorrect. The proper form is "{correct}".',
    ],
    far: [
      '"{npc} frowns" That is wrong. The correct answer is "{correct}". Study harder.',
      '"{npc} crosses their arms" Incorrect. You need to say "{correct}". Practice more.',
    ],
    generic: [
      '"{npc} looks unimpressed" That\'s not right. Try again, and think carefully this time.',
      '"{npc} taps their foot" Incorrect. Focus and try once more.',
    ],
  },
  humorous: {
    close: [
      '"{npc} chuckles" Ha! Close, but you just said something funny. It\'s "{correct}", not "{input}"!',
      '"{npc} grins" Almost! But what you said means... well, never mind. Try "{correct}".',
    ],
    far: [
      '"{npc} laughs" Oh my! That\'s... creative, but the word is "{correct}". Let me teach you!',
      '"{npc} wipes a tear of laughter" You just asked for a dancing goat! It\'s "{correct}".',
    ],
    generic: [
      '"{npc} smirks" Nice try, but not quite! Want to give it another shot?',
      '"{npc} laughs good-naturedly" That was entertaining, but let\'s try again!',
    ],
  },
  patient: {
    close: [
      '"{npc} speaks slowly" You\'re very close. Listen carefully: "{correct}". Can you hear the difference?',
      '"{npc} repeats gently" Almost right. Let me say it again: "{correct}". The key part is slightly different.',
    ],
    far: [
      '"{npc} pauses thoughtfully" Let me show you step by step. The phrase is "{correct}". Try saying it with me.',
      '"{npc} sits down beside you" No rush. The word is "{correct}". Take your time and try again.',
    ],
    generic: [
      '"{npc} waits patiently" That wasn\'t quite right, but learning takes time. Shall we try again?',
      '"{npc} gives a gentle nod" Not yet, but you\'re on the right path. Let\'s keep going.',
    ],
  },
  scholarly: {
    close: [
      '"{npc} adjusts their glasses" Interesting attempt. Linguistically, the correct form is "{correct}" — note the morphological difference from "{input}".',
      '"{npc} strokes their chin" Close! "{correct}" follows the conjugation pattern of this verb class. Your "{input}" was off by the suffix.',
    ],
    far: [
      '"{npc} consults a book" The etymologically correct form is "{correct}". This derives from the root that means...',
      '"{npc} points to a chart" The proper term is "{correct}". In this language family, the phonemic structure requires...',
    ],
    generic: [
      '"{npc} looks scholarly" Not quite. Consider the grammatical rules we discussed. Try once more.',
      '"{npc} taps the textbook" Review the pattern and attempt it again.',
    ],
  },
};

const PRAISE_TEMPLATES: Record<CorrectionStyle, { excellent: string[]; good: string[]; okay: string[] }> = {
  encouraging: {
    excellent: ['"{npc} beams with pride" Perfect! You said it beautifully!', '"{npc} claps" Wonderful! That was flawless!'],
    good: ['"{npc} smiles" Very good! You\'re making great progress!', '"{npc} nods approvingly" Nice work! Keep it up!'],
    okay: ['"{npc} gives a thumbs up" That works! You\'re getting there!', '"{npc} nods" Good enough to be understood. Keep practicing!'],
  },
  strict: {
    excellent: ['"{npc} gives a rare nod of approval" Correct. Well done.', '"{npc} looks satisfied" Precisely right.'],
    good: ['"{npc} nods curtly" Acceptable. Your pronunciation could still improve.', '"{npc}" Adequate. Continue practicing.'],
    okay: ['"{npc} sighs" It will do. But strive for perfection.', '"{npc}" Barely passable. Do better next time.'],
  },
  humorous: {
    excellent: ['"{npc} does a little dance" You nailed it! I\'m out of a job!', '"{npc} gasps" Wait, did you just say that perfectly?!'],
    good: ['"{npc} grins" Hey, that was pretty good! Maybe you\'ll be fluent by next century.', '"{npc} applauds" Not bad at all!'],
    okay: ['"{npc} shrugs with a smile" Close enough! At least nobody will run away screaming.', '"{npc} winks" That\'ll do!'],
  },
  patient: {
    excellent: ['"{npc} smiles warmly" Beautiful. You\'ve been practicing, haven\'t you?', '"{npc} nods slowly" Perfect. I\'m very proud of you.'],
    good: ['"{npc} looks pleased" Very good. You\'re making steady progress.', '"{npc} smiles" Well done. Each time it gets easier.'],
    okay: ['"{npc} nods gently" That\'s coming along nicely. Keep at it.', '"{npc}" You\'re improving. Every attempt counts.'],
  },
  scholarly: {
    excellent: ['"{npc} marks their notes" Exemplary. Your phonemic accuracy is remarkable.', '"{npc} nods" Textbook perfect. You have an ear for this.'],
    good: ['"{npc} scribbles a note" Good command of the morphology. Minor improvements possible.', '"{npc}" Solid performance. Your grasp of the syntax is evident.'],
    okay: ['"{npc} adjusts their glasses" Functionally correct. The prosody needs refinement.', '"{npc}" Understandable. Work on the tonal patterns.'],
  },
};

export const UTTERANCE_QUEST_TEMPLATES: Record<string, UtteranceQuestTemplate> = {
  greet_stranger: {
    type: 'speak_phrase',
    prompt: 'Greet the person you just met.',
    targetLanguage: '',
    acceptedUtterances: [
      { text: 'hello' }, { text: 'hi' }, { text: 'good morning' }, { text: 'good afternoon' },
    ],
    requiredCount: 1,
    difficulty: 'beginner',
    hints: [
      { text: 'Try a simple greeting like "hello"', scorePenalty: 0.1 },
    ],
  },
  say_goodbye: {
    type: 'speak_phrase',
    prompt: 'Say goodbye to the NPC.',
    targetLanguage: '',
    acceptedUtterances: [
      { text: 'goodbye' }, { text: 'bye' }, { text: 'see you later' }, { text: 'farewell' },
    ],
    requiredCount: 1,
    difficulty: 'beginner',
    hints: [
      { text: 'A simple "goodbye" will do', scorePenalty: 0.1 },
    ],
  },
  order_food: {
    type: 'conversation_goal',
    prompt: 'Order a meal at the tavern.',
    targetLanguage: '',
    acceptedUtterances: [],
    goalKeywords: ['order', 'food', 'eat', 'meal', 'hungry', 'menu', 'bread', 'soup', 'drink'],
    requiredCount: 1,
    difficulty: 'beginner',
    hints: [
      { text: 'Ask about what food is available', scorePenalty: 0.1 },
      { text: 'Use words like "food", "eat", or "meal"', scorePenalty: 0.15 },
    ],
  },
  ask_directions: {
    type: 'conversation_goal',
    prompt: 'Ask for directions to a location.',
    targetLanguage: '',
    acceptedUtterances: [],
    goalKeywords: ['where', 'direction', 'find', 'how do I get', 'location', 'way to', 'path'],
    requiredCount: 1,
    difficulty: 'beginner',
    hints: [
      { text: 'Use question words like "where" or "how"', scorePenalty: 0.1 },
    ],
  },
  express_gratitude: {
    type: 'speak_phrase',
    prompt: 'Thank someone for their help.',
    targetLanguage: '',
    acceptedUtterances: [
      { text: 'thank you' }, { text: 'thanks' }, { text: 'I appreciate it' }, { text: 'grateful' },
    ],
    requiredCount: 1,
    difficulty: 'beginner',
    hints: [
      { text: 'Express your thanks', scorePenalty: 0.1 },
    ],
  },
  express_emotions: {
    type: 'use_vocabulary',
    prompt: 'Express how you feel using emotion words.',
    targetLanguage: '',
    acceptedUtterances: [],
    requiredVocabulary: ['happy', 'sad', 'angry', 'excited', 'worried', 'grateful'],
    requiredCount: 3,
    difficulty: 'intermediate',
    hints: [
      { text: 'Use words like "happy", "sad", or "excited"', scorePenalty: 0.1 },
    ],
  },
  negotiate_price: {
    type: 'conversation_goal',
    prompt: 'Negotiate a better price with the merchant.',
    targetLanguage: '',
    acceptedUtterances: [],
    goalKeywords: ['price', 'cost', 'cheaper', 'discount', 'afford', 'deal', 'lower', 'bargain', 'too much'],
    requiredCount: 1,
    difficulty: 'intermediate',
    hints: [
      { text: 'Talk about the price being too high', scorePenalty: 0.1 },
      { text: 'Ask for a discount or better deal', scorePenalty: 0.15 },
    ],
  },
  introduce_yourself: {
    type: 'conversation_goal',
    prompt: 'Introduce yourself to the NPC.',
    targetLanguage: '',
    acceptedUtterances: [],
    goalKeywords: ['my name', 'I am', 'call me', 'introduce', 'nice to meet'],
    requiredCount: 1,
    difficulty: 'beginner',
    hints: [
      { text: 'Tell them your name', scorePenalty: 0.1 },
    ],
  },
  describe_weather: {
    type: 'use_vocabulary',
    prompt: 'Describe the weather using target language words.',
    targetLanguage: '',
    acceptedUtterances: [],
    requiredVocabulary: ['sun', 'rain', 'cold', 'hot', 'wind', 'cloud', 'snow', 'warm'],
    requiredCount: 2,
    difficulty: 'beginner',
    hints: [
      { text: 'Use weather words like "sun", "rain", "cold"', scorePenalty: 0.1 },
    ],
  },
  translate_sign: {
    type: 'translate_phrase',
    prompt: 'Translate the text on the sign.',
    targetLanguage: '',
    acceptedUtterances: [{ text: '' }], // Filled dynamically
    requiredCount: 1,
    difficulty: 'intermediate',
    hints: [
      { text: 'Look carefully at each word', scorePenalty: 0.1 },
      { text: 'Try to identify cognates', scorePenalty: 0.15 },
    ],
  },
  eavesdrop_festival: {
    type: 'listen_to_conversation',
    prompt: 'Overhear the villagers discussing the upcoming festival.',
    targetLanguage: '',
    acceptedUtterances: [],
    goalKeywords: ['festival', 'celebration', 'feast', 'holiday', 'gathering'],
    requiredCount: 1,
    difficulty: 'beginner',
    hints: [
      { text: 'Walk near NPCs who are talking', scorePenalty: 0.1 },
    ],
  },
  word_explorer_nouns: {
    type: 'collect_vocabulary',
    prompt: 'Explore the area and collect 5 noun words for your vocabulary bank.',
    targetLanguage: '',
    acceptedUtterances: [],
    targetCategory: 'food',
    requiredCount: 5,
    difficulty: 'beginner',
    hints: [
      { text: 'Interact with objects around you to learn their names', scorePenalty: 0.1 },
      { text: 'Try clicking on items in shops or homes', scorePenalty: 0.15 },
    ],
  },
  color_hunter: {
    type: 'collect_vocabulary',
    prompt: 'Find 3 objects and learn their color words in the target language.',
    targetLanguage: '',
    acceptedUtterances: [],
    targetCategory: 'colors',
    requiredCount: 3,
    difficulty: 'beginner',
    hints: [
      { text: 'Look for colorful objects in the environment', scorePenalty: 0.1 },
      { text: 'Flowers, clothing, and market stalls have many colors', scorePenalty: 0.15 },
    ],
  },
  action_spotter: {
    type: 'collect_vocabulary',
    prompt: 'Observe 3 NPCs and learn the verbs for what they are doing.',
    targetLanguage: '',
    acceptedUtterances: [],
    targetCategory: 'actions',
    requiredCount: 3,
    difficulty: 'beginner',
    hints: [
      { text: 'Watch what NPCs are doing and ask about the action words', scorePenalty: 0.1 },
      { text: 'Visit the market, workshop, or tavern to see NPCs in action', scorePenalty: 0.15 },
    ],
  },
  pronunciation_challenge: {
    type: 'pronunciation_check',
    prompt: 'Pronounce the phrase correctly. You need at least 70% accuracy.',
    targetLanguage: '',
    acceptedUtterances: [{ text: '' }], // Filled dynamically with target phrases
    requiredCount: 5,
    difficulty: 'intermediate',
    hints: [
      { text: 'Listen to the phrase first, then try to repeat it', scorePenalty: 0.1 },
      { text: 'Focus on the vowel sounds', scorePenalty: 0.15 },
    ],
  },
  romance_first_date: {
    type: 'romance_stage_reach',
    prompt: 'Reach the dating stage with your love interest.',
    targetLanguage: '',
    acceptedUtterances: [{ text: 'dating' }],
    requiredCount: 1,
    difficulty: 'intermediate',
    hints: [
      { text: 'Start with compliments and friendly conversation', scorePenalty: 0.1 },
      { text: 'Progress through flirting before asking on a date', scorePenalty: 0.15 },
    ],
  },
};
