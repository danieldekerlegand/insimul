/**
 * Language Progress Types
 *
 * Defines vocabulary tracking, fluency progression, and language learning
 * progress data structures used across client and server.
 */

export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered';

export interface VocabularyEntry {
  word: string;
  language: string;
  meaning: string;
  category?: string;            // e.g. 'greetings', 'food', 'numbers', 'verbs'
  timesEncountered: number;
  timesUsedCorrectly: number;
  timesUsedIncorrectly: number;
  lastEncountered: number;      // timestamp
  masteryLevel: MasteryLevel;
  context?: string;             // sentence where word was last encountered
}

export interface GrammarPattern {
  id: string;
  pattern: string;              // e.g. "subject-verb agreement", "past tense"
  language: string;
  timesUsedCorrectly: number;
  timesUsedIncorrectly: number;
  mastered: boolean;
  examples: string[];
}

export interface ConversationRecord {
  id: string;
  characterId: string;
  characterName: string;
  timestamp: number;
  turns: number;
  wordsUsed: string[];
  targetLanguagePercentage: number;  // 0-100
  fluencyGained: number;
}

export interface LanguageProgress {
  playerId: string;
  worldId: string;
  language: string;
  overallFluency: number;           // 0-100
  vocabulary: VocabularyEntry[];
  grammarPatterns: GrammarPattern[];
  conversations: ConversationRecord[];
  totalConversations: number;
  totalWordsLearned: number;
  totalCorrectUsages: number;
  streakDays: number;
  lastActivityTimestamp: number;
}

export interface VocabularyUsage {
  word: string;
  meaning: string;
  usedCorrectly: boolean;
  category?: string;
}

export interface FluencyGainResult {
  previousFluency: number;
  newFluency: number;
  gain: number;
  wordsLearned: number;
  wordsReinforced: number;
  bonuses: string[];
}

/**
 * Calculate mastery level based on encounter and usage counts
 */
export function calculateMasteryLevel(
  timesEncountered: number,
  timesUsedCorrectly: number
): MasteryLevel {
  if (timesUsedCorrectly >= 10 && timesEncountered >= 15) return 'mastered';
  if (timesUsedCorrectly >= 5 && timesEncountered >= 8) return 'familiar';
  if (timesEncountered >= 2) return 'learning';
  return 'new';
}

/**
 * Calculate fluency gain from a conversation
 */
export function calculateFluencyGain(
  currentFluency: number,
  vocabularyUsed: number,
  grammarCorrect: boolean,
  conversationLength: number,
  targetLanguagePercentage: number
): FluencyGainResult {
  const bonuses: string[] = [];
  let gain = 0;

  // Base gain from conversation
  const baseGain = 0.5;
  gain += baseGain;

  // Vocabulary usage bonus
  const vocabBonus = Math.min(vocabularyUsed * 0.2, 2.0);
  gain += vocabBonus;
  if (vocabularyUsed >= 5) bonuses.push('Vocab variety bonus!');

  // Grammar correctness bonus
  if (grammarCorrect) {
    gain += 0.3;
    bonuses.push('Grammar bonus!');
  }

  // Conversation length bonus (capped)
  const lengthBonus = Math.min(conversationLength * 0.05, 0.5);
  gain += lengthBonus;
  if (conversationLength >= 10) bonuses.push('Long conversation bonus!');

  // Target language usage bonus
  if (targetLanguagePercentage >= 80) {
    gain += 0.5;
    bonuses.push('Full immersion bonus!');
  } else if (targetLanguagePercentage >= 50) {
    gain += 0.2;
    bonuses.push('Good language mix!');
  }

  // Diminishing returns at higher fluency
  const multiplier = 1 - (currentFluency / 100) * 0.5;
  gain = gain * multiplier;

  // Clamp
  gain = Math.max(0.1, Math.min(gain, 3.0));

  const newFluency = Math.min(100, currentFluency + gain);

  return {
    previousFluency: currentFluency,
    newFluency,
    gain,
    wordsLearned: 0,    // set by caller
    wordsReinforced: 0,  // set by caller
    bonuses,
  };
}
