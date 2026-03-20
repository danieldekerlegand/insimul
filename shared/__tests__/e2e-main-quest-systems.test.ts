/**
 * End-to-end validation of main quest, library texts, language progress,
 * vocabulary review, and asset scaling systems.
 *
 * These tests validate the integration points between systems:
 *  - Main quest chapter progression with CEFR gating
 *  - Language progress tracking (vocabulary mastery, grammar, fluency)
 *  - Vocabulary review / spaced repetition
 *  - Quest seed instantiation feeding into main quest objectives
 *  - Asset scale hint data integrity
 */

import { describe, it, expect } from 'vitest';

// ── Main Quest ──────────────────────────────────────────────────────────────
import {
  MAIN_QUEST_CHAPTERS,
  createInitialMainQuestState,
  meetsChapterCefrRequirement,
  getChapterCompletionPercent,
  isChapterComplete,
  getChapterById,
  narrativeBeatId,
  type MainQuestState,
  type ChapterProgress,
} from '../quest/main-quest-chapters';

// ── Language Progress ───────────────────────────────────────────────────────
import {
  calculateMasteryLevel,
  calculateFluencyGain,
  parseGrammarFeedbackBlock,
  stripSystemMarkers,
  type VocabularyEntry,
  type GrammarPattern,
  type LanguageProgress,
} from '../language/progress';

// ── Vocabulary Review ───────────────────────────────────────────────────────
import {
  isWordDueForReview,
  getWordsDueForReview,
  selectWordsForReview,
  processReviewResult,
  getMasteryForCorrectCount,
  shouldTriggerReviewQuiz,
  shouldShowTargetLanguageOnly,
  timeUntilReview,
  getReviewDueLabel,
} from '../language/vocabulary-review';

// ── Vocabulary Corpus ───────────────────────────────────────────────────────
import {
  VOCABULARY_CORPUS,
  type VocabularyCorpusEntry,
} from '../language/vocabulary-corpus';

// ── Quest Seed Library ──────────────────────────────────────────────────────
import {
  QUEST_SEEDS,
  getSeedById,
  getSeedsByCategory,
  instantiateSeed,
  instantiateStarterQuests,
} from '../language/quest-seed-library';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeVocabEntry(overrides: Partial<VocabularyEntry> = {}): VocabularyEntry {
  return {
    word: 'bonjour',
    language: 'French',
    meaning: 'hello',
    category: 'greetings',
    timesEncountered: 0,
    timesUsedCorrectly: 0,
    timesUsedIncorrectly: 0,
    lastEncountered: Date.now(),
    masteryLevel: 'new',
    ...overrides,
  };
}

function makeGrammarPattern(overrides: Partial<GrammarPattern> = {}): GrammarPattern {
  return {
    id: 'article_usage',
    pattern: 'article usage',
    language: 'French',
    timesUsedCorrectly: 0,
    timesUsedIncorrectly: 0,
    mastered: false,
    examples: [],
    explanations: [],
    ...overrides,
  };
}

function makeLanguageProgress(overrides: Partial<LanguageProgress> = {}): LanguageProgress {
  return {
    playerId: 'player_1',
    worldId: 'world_1',
    language: 'French',
    overallFluency: 0,
    vocabulary: [],
    grammarPatterns: [],
    conversations: [],
    totalConversations: 0,
    totalWordsLearned: 0,
    totalCorrectUsages: 0,
    streakDays: 0,
    lastActivityTimestamp: Date.now(),
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. MAIN QUEST CHAPTER STRUCTURE & PROGRESSION
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Main quest chapter structure', () => {
  it('all 6 chapters have monotonically increasing CEFR requirements', () => {
    const cefrOrder = ['A1', 'A2', 'B1', 'B2'];
    let prevRank = 0;
    for (const ch of MAIN_QUEST_CHAPTERS) {
      const rank = cefrOrder.indexOf(ch.requiredCefrLevel);
      expect(rank).toBeGreaterThanOrEqual(prevRank);
      prevRank = rank;
    }
  });

  it('every chapter has intro and outro narratives', () => {
    for (const ch of MAIN_QUEST_CHAPTERS) {
      expect(ch.introNarrative.length).toBeGreaterThan(20);
      expect(ch.outroNarrative.length).toBeGreaterThan(20);
    }
  });

  it('every objective references a valid quest type', () => {
    const validTypes = ['vocabulary', 'conversation', 'grammar', 'fetch', 'teaching'];
    for (const ch of MAIN_QUEST_CHAPTERS) {
      for (const obj of ch.objectives) {
        expect(validTypes).toContain(obj.questType);
      }
    }
  });

  it('total bonus XP across all chapters sums correctly', () => {
    const total = MAIN_QUEST_CHAPTERS.reduce((sum, ch) => sum + ch.completionBonusXP, 0);
    expect(total).toBe(300 + 500 + 750 + 1000 + 1500 + 2000);
  });

  it('chapter IDs are unique and retrievable', () => {
    const ids = MAIN_QUEST_CHAPTERS.map(ch => ch.id);
    expect(new Set(ids).size).toBe(6);
    for (const id of ids) {
      expect(getChapterById(id)).toBeDefined();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. FULL MAIN QUEST PLAYTHROUGH SIMULATION
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Simulated main quest playthrough', () => {
  it('simulates completing chapters 1-2 (A1 level) with objective tracking', () => {
    const state = createInitialMainQuestState();

    // Chapter 1 starts active
    expect(state.currentChapterId).toBe('ch1_arrival');
    expect(state.chapters[0].status).toBe('active');

    const ch1 = MAIN_QUEST_CHAPTERS[0];

    // Simulate completing ch1 objectives: 2 vocabulary + 3 conversation
    state.chapters[0].objectiveProgress['ch1_greetings'] = 2;
    state.chapters[0].objectiveProgress['ch1_conversations'] = 3;

    expect(isChapterComplete(ch1, state.chapters[0])).toBe(true);
    expect(getChapterCompletionPercent(ch1, state.chapters[0])).toBe(100);

    // Advance to ch2
    state.chapters[0].status = 'completed';
    state.chapters[1].status = 'active';
    state.currentChapterId = 'ch2_settling_in';
    state.totalXPEarned += ch1.completionBonusXP;

    expect(state.totalXPEarned).toBe(300);

    // Ch2: 2 vocab + 2 conversation + 2 grammar
    const ch2 = MAIN_QUEST_CHAPTERS[1];
    state.chapters[1].objectiveProgress['ch2_navigation'] = 2;
    state.chapters[1].objectiveProgress['ch2_shopping'] = 2;
    state.chapters[1].objectiveProgress['ch2_grammar'] = 2;

    expect(isChapterComplete(ch2, state.chapters[1])).toBe(true);
    expect(getChapterCompletionPercent(ch2, state.chapters[1])).toBe(100);

    state.chapters[1].status = 'completed';
    state.totalXPEarned += ch2.completionBonusXP;
    expect(state.totalXPEarned).toBe(800); // 300 + 500
  });

  it('CEFR gating blocks chapter 3 for A1 players', () => {
    const ch3 = MAIN_QUEST_CHAPTERS[2]; // requires A2
    expect(meetsChapterCefrRequirement('A1', ch3)).toBe(false);
    expect(meetsChapterCefrRequirement('A2', ch3)).toBe(true);
    expect(meetsChapterCefrRequirement('B1', ch3)).toBe(true);
  });

  it('partial objective progress yields correct percentages', () => {
    const ch3 = MAIN_QUEST_CHAPTERS[2];
    // ch3: 5 conversation + 4 vocabulary + 3 fetch = 12 total
    const progress: ChapterProgress = {
      chapterId: ch3.id,
      status: 'active',
      objectiveProgress: {
        ch3_deep_conversations: 2, // of 5
        ch3_vocabulary: 1,         // of 4
        ch3_quests_for_npcs: 0,    // of 3
      },
    };

    const pct = getChapterCompletionPercent(ch3, progress);
    // 3 of 12 = 25%
    expect(pct).toBe(25);
    expect(isChapterComplete(ch3, progress)).toBe(false);
  });

  it('narrative beat IDs are deterministic', () => {
    const id1 = narrativeBeatId('chapter_intro', 'ch1_arrival');
    const id2 = narrativeBeatId('chapter_intro', 'ch1_arrival');
    expect(id1).toBe(id2);
    expect(id1).toBe('chapter_intro:ch1_arrival');
  });

  it('completing all 6 chapters yields expected total XP', () => {
    let totalXP = 0;
    for (const ch of MAIN_QUEST_CHAPTERS) {
      totalXP += ch.completionBonusXP;
    }
    expect(totalXP).toBe(6050);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. LANGUAGE PROGRESS: VOCABULARY MASTERY LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Vocabulary mastery lifecycle', () => {
  it('tracks a word from new → learning → familiar → mastered', () => {
    expect(calculateMasteryLevel(0, 0)).toBe('new');
    expect(calculateMasteryLevel(1, 0)).toBe('new');
    expect(calculateMasteryLevel(2, 0)).toBe('learning');
    expect(calculateMasteryLevel(8, 5)).toBe('familiar');
    expect(calculateMasteryLevel(15, 10)).toBe('mastered');
  });

  it('mastery requires both encounters AND correct uses', () => {
    // High encounters but no correct uses = learning
    expect(calculateMasteryLevel(20, 0)).toBe('learning');
    // High correct uses but low encounters = learning (encounters gate)
    expect(calculateMasteryLevel(3, 10)).toBe('learning');
  });

  it('vocabulary review scheduling respects mastery-based intervals', () => {
    const now = Date.now();

    // New word seen just now — not due yet
    const newWord = makeVocabEntry({ masteryLevel: 'new', lastEncountered: now });
    expect(isWordDueForReview(newWord, now)).toBe(false);

    // New word seen 6 minutes ago — due (5 min interval)
    const oldNewWord = makeVocabEntry({
      masteryLevel: 'new',
      lastEncountered: now - 6 * 60 * 1000,
    });
    expect(isWordDueForReview(oldNewWord, now)).toBe(true);

    // Mastered word seen 23 hours ago — not due (24 hour interval)
    const masteredWord = makeVocabEntry({
      masteryLevel: 'mastered',
      lastEncountered: now - 23 * 60 * 60 * 1000,
    });
    expect(isWordDueForReview(masteredWord, now)).toBe(false);

    // Mastered word seen 25 hours ago — due
    const oldMastered = makeVocabEntry({
      masteryLevel: 'mastered',
      lastEncountered: now - 25 * 60 * 60 * 1000,
    });
    expect(isWordDueForReview(oldMastered, now)).toBe(true);
  });

  it('processReviewResult upgrades mastery through correct answers', () => {
    const entry = makeVocabEntry({ timesEncountered: 0, timesUsedCorrectly: 0 });

    // Simulate 8 correct reviews
    for (let i = 0; i < 8; i++) {
      processReviewResult(entry, true);
    }

    expect(entry.timesUsedCorrectly).toBe(8);
    expect(entry.timesEncountered).toBe(8);
    expect(entry.masteryLevel).toBe('mastered'); // 8 correct = mastered threshold
  });

  it('processReviewResult tracks incorrect answers without demoting', () => {
    const entry = makeVocabEntry({
      timesEncountered: 10,
      timesUsedCorrectly: 6,
      masteryLevel: 'familiar',
    });

    const result = processReviewResult(entry, false);
    expect(result.correct).toBe(false);
    expect(entry.timesUsedIncorrectly).toBe(1);
    // Mastery stays at familiar (6 correct still meets threshold)
    expect(entry.masteryLevel).toBe('familiar');
  });

  it('selectWordsForReview prioritizes non-mastered due words sorted by oldest first', () => {
    const now = Date.now();
    const vocab: VocabularyEntry[] = [
      makeVocabEntry({ word: 'ancien', masteryLevel: 'mastered', lastEncountered: now - 25 * 60 * 60 * 1000 }),
      makeVocabEntry({ word: 'nouveau', masteryLevel: 'new', lastEncountered: now - 10 * 60 * 1000 }),
      makeVocabEntry({ word: 'petit', masteryLevel: 'learning', lastEncountered: now - 60 * 60 * 1000 }),
    ];

    const selected = selectWordsForReview(vocab, 2, now);
    expect(selected).toHaveLength(2);
    // Non-mastered words sorted by oldest lastEncountered first
    // 'petit' (learning, 1hr ago) is older than 'nouveau' (new, 10min ago)
    expect(selected[0].word).toBe('petit');
    expect(selected[1].word).toBe('nouveau');
  });

  it('mastered words show target language only', () => {
    const mastered = makeVocabEntry({ masteryLevel: 'mastered' });
    const learning = makeVocabEntry({ masteryLevel: 'learning' });
    expect(shouldShowTargetLanguageOnly(mastered)).toBe(true);
    expect(shouldShowTargetLanguageOnly(learning)).toBe(false);
  });

  it('review due labels are human-readable', () => {
    const now = Date.now();
    const due = makeVocabEntry({ masteryLevel: 'new', lastEncountered: now - 10 * 60 * 1000 });
    expect(getReviewDueLabel(due, now)).toBe('Due now');

    const soon = makeVocabEntry({ masteryLevel: 'learning', lastEncountered: now });
    const label = getReviewDueLabel(soon, now);
    expect(label).toMatch(/Due in \d+m/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. LANGUAGE PROGRESS: FLUENCY CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Fluency gain calculation', () => {
  it('base conversation yields minimum 0.1 gain', () => {
    const result = calculateFluencyGain(95, 0, 0, 1, 0);
    expect(result.gain).toBeGreaterThanOrEqual(0.1);
    expect(result.newFluency).toBeGreaterThan(result.previousFluency);
  });

  it('immersion bonus applies at 80%+ target language', () => {
    const withImmersion = calculateFluencyGain(0, 0, 0, 1, 85);
    const without = calculateFluencyGain(0, 0, 0, 1, 30);
    expect(withImmersion.gain).toBeGreaterThan(without.gain);
    expect(withImmersion.bonuses).toContain('Full immersion bonus!');
  });

  it('vocabulary variety bonus kicks in at 5+ words', () => {
    const result = calculateFluencyGain(0, 6, 0.5, 5, 50);
    expect(result.bonuses).toContain('Vocab variety bonus!');
  });

  it('grammar score of 0.9+ gives excellent bonus', () => {
    const result = calculateFluencyGain(0, 0, 0.95, 1, 0);
    expect(result.bonuses).toContain('Excellent grammar!');
  });

  it('diminishing returns reduce gain at higher fluency', () => {
    const lowFluency = calculateFluencyGain(10, 5, 0.8, 5, 70);
    const highFluency = calculateFluencyGain(80, 5, 0.8, 5, 70);
    expect(lowFluency.gain).toBeGreaterThan(highFluency.gain);
  });

  it('fluency never exceeds 100', () => {
    const result = calculateFluencyGain(99, 10, 1.0, 20, 100);
    expect(result.newFluency).toBeLessThanOrEqual(100);
  });

  it('gain is clamped between 0.1 and 3.0', () => {
    const minimal = calculateFluencyGain(99, 0, 0, 0, 0);
    expect(minimal.gain).toBeGreaterThanOrEqual(0.1);

    const maximal = calculateFluencyGain(0, 20, 1.0, 50, 100);
    expect(maximal.gain).toBeLessThanOrEqual(3.0);
  });

  it('backward-compatible boolean grammar score works', () => {
    const withTrue = calculateFluencyGain(0, 0, true, 1, 0);
    const withFalse = calculateFluencyGain(0, 0, false, 1, 0);
    expect(withTrue.grammarScore).toBe(1.0);
    expect(withFalse.grammarScore).toBe(0.0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. GRAMMAR FEEDBACK PARSING
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Grammar feedback parsing from NPC responses', () => {
  it('parses a complete grammar feedback block with errors', () => {
    const response = `Bonjour! Très bien! **GRAMMAR_FEEDBACK**\nStatus: correct\nErrors: 1\nPattern: article_usage | Incorrect: "le pomme" | Corrected: "la pomme" | Explanation: Apple is feminine in French\n**END_GRAMMAR**`;

    const { feedback, cleanedResponse } = parseGrammarFeedbackBlock(response);

    expect(feedback).not.toBeNull();
    expect(feedback!.status).toBe('correct');
    expect(feedback!.errors).toHaveLength(1);
    expect(feedback!.errors[0].pattern).toBe('article_usage');
    expect(feedback!.errors[0].incorrect).toBe('le pomme');
    expect(feedback!.errors[0].corrected).toBe('la pomme');
    expect(feedback!.errors[0].explanation).toBe('Apple is feminine in French');
    expect(cleanedResponse).toBe('Bonjour! Très bien!');
  });

  it('returns null feedback for responses without grammar blocks', () => {
    const response = 'Bonjour, comment allez-vous?';
    const { feedback, cleanedResponse } = parseGrammarFeedbackBlock(response);
    expect(feedback).toBeNull();
    expect(cleanedResponse).toBe(response);
  });

  it('stripSystemMarkers removes all marker types', () => {
    const text = `Hello **GRAMMAR_FEEDBACK** stuff **END_GRAMMAR** world **QUEST_ASSIGN** data **END_QUEST** end`;
    const clean = stripSystemMarkers(text);
    expect(clean).toBe('Hello  world  end');
  });

  it('stripSystemMarkers handles partial/incomplete blocks', () => {
    const partial = `Hello **GRAMMAR_FEEDBACK** still streaming...`;
    const clean = stripSystemMarkers(partial);
    expect(clean).toBe('Hello');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. VOCABULARY CORPUS INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Vocabulary corpus data integrity', () => {
  it('corpus covers all 20 declared categories', () => {
    const categories = Object.keys(VOCABULARY_CORPUS);
    expect(categories.length).toBe(20);
  });

  it('every category has at least 5 entries', () => {
    for (const [cat, entries] of Object.entries(VOCABULARY_CORPUS)) {
      expect(entries.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('every entry has valid structure', () => {
    const validPOS = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'number'];
    const validDifficulty = ['beginner', 'intermediate', 'advanced'];

    for (const [cat, entries] of Object.entries(VOCABULARY_CORPUS)) {
      for (const entry of entries) {
        expect(entry.english).toBeTruthy();
        expect(validPOS).toContain(entry.partOfSpeech);
        expect(validDifficulty).toContain(entry.difficulty);
        expect(entry.category).toBe(cat);
      }
    }
  });

  it('greetings category has beginner-level entries for A1 quests', () => {
    const beginnerGreetings = VOCABULARY_CORPUS.greetings.filter(
      e => e.difficulty === 'beginner',
    );
    expect(beginnerGreetings.length).toBeGreaterThanOrEqual(5);
    // Essential greetings for Ch1 must exist
    const words = beginnerGreetings.map(e => e.english);
    expect(words).toContain('hello');
    expect(words).toContain('goodbye');
    expect(words).toContain('thank you');
  });

  it('total corpus has 200+ entries for comprehensive tracking', () => {
    const total = Object.values(VOCABULARY_CORPUS).reduce(
      (sum, entries) => sum + entries.length,
      0,
    );
    expect(total).toBeGreaterThanOrEqual(200);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. QUEST SEEDS → MAIN QUEST INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Quest seeds integrate with main quest objectives', () => {
  const BASE_PARAMS = {
    worldId: 'world_1',
    targetLanguage: 'French',
    assignedTo: 'Player One',
    assignedBy: 'Guide NPC',
  };

  it('quest seed categories cover all main quest objective types', () => {
    const mainQuestTypes = new Set<string>();
    for (const ch of MAIN_QUEST_CHAPTERS) {
      for (const obj of ch.objectives) {
        mainQuestTypes.add(obj.questType);
      }
    }
    // vocabulary, conversation, grammar, fetch, teaching
    expect(mainQuestTypes.size).toBeGreaterThanOrEqual(4);

    // Verify seeds exist for the core types
    const seedCategories = new Set(QUEST_SEEDS.map(s => s.questType));
    expect(seedCategories.has('conversation')).toBe(true);
    expect(seedCategories.has('vocabulary')).toBe(true);
  });

  it('instantiated quest has matching questType for main quest tracking', () => {
    const vocabSeed = getSeedById('market_words')!;
    const quest = instantiateSeed(vocabSeed, BASE_PARAMS);

    expect(quest.questType).toBe('vocabulary');
    expect(quest.status).toBe('active');
    expect(quest.experienceReward).toBeGreaterThan(0);
  });

  it('starter quests provide enough variety for ch1 objectives', () => {
    const quests = instantiateStarterQuests({
      ...BASE_PARAMS,
      npcNames: ['Marie', 'Jean', 'Pierre'],
      locations: ['town square', 'the market', 'café'],
    });

    // Should have at least 3 quests
    expect(quests.length).toBeGreaterThanOrEqual(3);

    // Should include both conversation and vocabulary types
    const types = new Set(quests.map(q => q.questType));
    expect(types.size).toBeGreaterThanOrEqual(2);
  });

  it('quest Prolog content is generated for all seeds', () => {
    const conversationSeeds = getSeedsByCategory('conversation');
    for (const seed of conversationSeeds) {
      const quest = instantiateSeed(seed, {
        ...BASE_PARAMS,
        values: { npcName: 'TestNPC', turns: 5 },
      });
      expect(quest.content).toBeTruthy();
      expect(quest.content).toContain('quest(');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. CROSS-SYSTEM: LANGUAGE PROGRESS → MAIN QUEST CEFR GATING
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Language progress drives main quest CEFR gating', () => {
  it('simulates A1→A2 level up unlocking chapter 3', () => {
    const state = createInitialMainQuestState();

    // Complete ch1 and ch2 at A1
    state.chapters[0].status = 'completed';
    state.chapters[1].status = 'completed';
    state.currentChapterId = null;
    state.chapters[2].status = 'available'; // ch3 waiting for A2

    const ch3 = getChapterById('ch3_making_friends')!;

    // At A1, ch3 is locked
    expect(meetsChapterCefrRequirement('A1', ch3)).toBe(false);

    // At A2, ch3 unlocks
    expect(meetsChapterCefrRequirement('A2', ch3)).toBe(true);

    // Simulate unlock
    state.chapters[2].status = 'active';
    state.currentChapterId = 'ch3_making_friends';

    expect(state.currentChapterId).toBe('ch3_making_friends');
  });

  it('fluency progress creates a plausible learning trajectory', () => {
    let fluency = 0;

    // Simulate 20 conversations with increasing skill
    for (let i = 0; i < 20; i++) {
      const vocabUsed = Math.min(i + 1, 10);
      const grammarScore = Math.min(0.5 + i * 0.025, 1.0);
      const turns = 3 + Math.floor(i / 2);
      const targetLangPct = Math.min(30 + i * 3, 90);

      const result = calculateFluencyGain(fluency, vocabUsed, grammarScore, turns, targetLangPct);
      fluency = result.newFluency;
    }

    // After 20 good conversations, fluency should be meaningful but not 100
    expect(fluency).toBeGreaterThan(15);
    expect(fluency).toBeLessThan(100);
  });

  it('vocabulary mastery map covers beginner through advanced', () => {
    const entries: VocabularyEntry[] = [
      makeVocabEntry({ word: 'bonjour', timesEncountered: 20, timesUsedCorrectly: 12, masteryLevel: 'mastered' }),
      makeVocabEntry({ word: 'merci', timesEncountered: 10, timesUsedCorrectly: 6, masteryLevel: 'familiar' }),
      makeVocabEntry({ word: 'peut-être', timesEncountered: 3, timesUsedCorrectly: 1, masteryLevel: 'learning' }),
      makeVocabEntry({ word: 'néanmoins', timesEncountered: 0, timesUsedCorrectly: 0, masteryLevel: 'new' }),
    ];

    const mastered = entries.filter(e => e.masteryLevel === 'mastered');
    const newWords = entries.filter(e => e.masteryLevel === 'new');
    expect(mastered).toHaveLength(1);
    expect(newWords).toHaveLength(1);

    // Verify mastery calculation is consistent
    for (const entry of entries) {
      const calculated = calculateMasteryLevel(entry.timesEncountered, entry.timesUsedCorrectly);
      expect(calculated).toBe(entry.masteryLevel);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. CROSS-SYSTEM: GRAMMAR FEEDBACK → LANGUAGE PROGRESS TRACKING
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Grammar feedback flows into language progress', () => {
  it('NPC response with grammar feedback updates pattern tracking', () => {
    const npcResponse = `Oui, c'est correct! **GRAMMAR_FEEDBACK**\nStatus: corrected\nErrors: 2\nPattern: gender_agreement | Incorrect: "le table" | Corrected: "la table" | Explanation: Table is feminine\nPattern: verb_conjugation | Incorrect: "je suis mangé" | Corrected: "j'ai mangé" | Explanation: Manger uses avoir in passé composé\n**END_GRAMMAR**`;

    const { feedback, cleanedResponse } = parseGrammarFeedbackBlock(npcResponse);

    expect(feedback).not.toBeNull();
    expect(feedback!.errors).toHaveLength(2);
    expect(cleanedResponse).toBe("Oui, c'est correct!");

    // Simulate updating grammar patterns from feedback
    const patterns: GrammarPattern[] = [];
    for (const error of feedback!.errors) {
      const existing = patterns.find(p => p.pattern === error.pattern);
      if (existing) {
        existing.timesUsedIncorrectly++;
        existing.examples.push(error.incorrect);
        existing.explanations.push(error.explanation);
      } else {
        patterns.push(makeGrammarPattern({
          id: error.pattern,
          pattern: error.pattern,
          timesUsedIncorrectly: 1,
          examples: [error.incorrect],
          explanations: [error.explanation],
        }));
      }
    }

    expect(patterns).toHaveLength(2);
    expect(patterns[0].pattern).toBe('gender_agreement');
    expect(patterns[1].pattern).toBe('verb_conjugation');
  });

  it('grammar pattern mastery tracks accuracy over time', () => {
    const pattern = makeGrammarPattern({
      timesUsedCorrectly: 9,
      timesUsedIncorrectly: 1,
    });

    const accuracy = pattern.timesUsedCorrectly /
      (pattern.timesUsedCorrectly + pattern.timesUsedIncorrectly);
    expect(accuracy).toBe(0.9);

    // Mastery at 10+ correct and 80%+ accuracy
    pattern.timesUsedCorrectly = 10;
    const finalAccuracy = pattern.timesUsedCorrectly /
      (pattern.timesUsedCorrectly + pattern.timesUsedIncorrectly);
    expect(finalAccuracy).toBeGreaterThanOrEqual(0.8);
    pattern.mastered = finalAccuracy >= 0.8 && pattern.timesUsedCorrectly >= 10;
    expect(pattern.mastered).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. ASSET SCALING DATA INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Asset scale hint data integrity', () => {
  // Extracted from migration 008 — validate the math and ranges
  const SCALE_DATA = [
    { name: 'Medieval House 1', rawHeight: 909.9, targetHeight: 8, scaleHint: 0.0088 },
    { name: 'Medieval House 3', rawHeight: 1009.0, targetHeight: 7, scaleHint: 0.0069 },
    { name: 'Medieval House - Generic', rawHeight: 78.7, targetHeight: 9, scaleHint: 0.1143 },
    { name: 'Medieval Tavern', rawHeight: 0.6, targetHeight: 5, scaleHint: 8.0 },
    { name: 'Medieval Food Stall', rawHeight: 10.2, targetHeight: 4, scaleHint: 0.392 },
    { name: "The Blacksmith's", rawHeight: 10.2, targetHeight: 7, scaleHint: 0.686 },
    { name: 'Medieval Gothic Church', rawHeight: 20.8, targetHeight: 18, scaleHint: 0.865 },
    { name: 'Town Hall', rawHeight: 426.2, targetHeight: 8, scaleHint: 0.0188 },
    { name: 'Medieval Mill', rawHeight: 1592.6, targetHeight: 12, scaleHint: 0.0075 },
    { name: 'Watermill', rawHeight: 22.8, targetHeight: 8, scaleHint: 0.351 },
    { name: 'Old Sawmill', rawHeight: 369.4, targetHeight: 6, scaleHint: 0.0162 },
    { name: 'Medieval Barrack', rawHeight: 100.8, targetHeight: 7, scaleHint: 0.0694 },
    { name: 'Mine Shaft Kit', rawHeight: 419.1, targetHeight: 5, scaleHint: 0.0119 },
  ];

  it('all scale hints follow the formula: scaleHint ≈ targetHeight / rawHeight', () => {
    for (const entry of SCALE_DATA) {
      const computed = entry.targetHeight / entry.rawHeight;
      // Allow 5% tolerance for rounding
      const ratio = entry.scaleHint / computed;
      expect(ratio).toBeGreaterThan(0.95);
      expect(ratio).toBeLessThan(1.05);
    }
  });

  it('all target heights are in realistic building range (4-18m)', () => {
    for (const entry of SCALE_DATA) {
      expect(entry.targetHeight).toBeGreaterThanOrEqual(4);
      expect(entry.targetHeight).toBeLessThanOrEqual(18);
    }
  });

  it('all scale hints are positive non-zero', () => {
    for (const entry of SCALE_DATA) {
      expect(entry.scaleHint).toBeGreaterThan(0);
    }
  });

  it('scaled buildings are proportioned relative to player height (1.77m)', () => {
    const playerHeight = 1.77;
    for (const entry of SCALE_DATA) {
      const scaledHeight = entry.rawHeight * entry.scaleHint;
      const heightInPlayerUnits = scaledHeight / playerHeight;
      // Buildings should be at least 2x player height
      expect(heightInPlayerUnits).toBeGreaterThan(2);
      // And no more than ~10x (18m church / 1.77m ≈ 10.2)
      expect(heightInPlayerUnits).toBeLessThan(11);
    }
  });

  it('has entries for all 13 Sketchfab building assets', () => {
    expect(SCALE_DATA).toHaveLength(13);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. FULL PLAYER SESSION SIMULATION
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Full player session — quest + vocabulary + fluency', () => {
  it('simulates a play session: greet NPC → learn words → complete quest → gain fluency', () => {
    // 1. Start with fresh language progress
    const progress = makeLanguageProgress();

    // 2. Player has a conversation — NPC uses target language
    const npcResponse = `Bonjour! Comment allez-vous? **GRAMMAR_FEEDBACK** Status: correct Errors: 0 **END_GRAMMAR**`;
    const { feedback, cleanedResponse } = parseGrammarFeedbackBlock(npcResponse);
    expect(cleanedResponse).toBe('Bonjour! Comment allez-vous?');
    expect(feedback!.status).toBe('correct');

    // 3. Track vocabulary from conversation
    const wordsLearned = ['bonjour', 'comment', 'allez', 'vous'];
    for (const word of wordsLearned) {
      progress.vocabulary.push(makeVocabEntry({
        word,
        meaning: word, // simplified
        timesEncountered: 1,
        masteryLevel: 'new',
      }));
    }
    progress.totalWordsLearned = wordsLearned.length;

    // 4. Calculate fluency gain from conversation
    const fluencyResult = calculateFluencyGain(
      progress.overallFluency,
      wordsLearned.length, // vocab used
      1.0,                 // perfect grammar
      3,                   // 3 turns
      60,                  // 60% target language
    );
    progress.overallFluency = fluencyResult.newFluency;
    expect(progress.overallFluency).toBeGreaterThan(0);

    // 5. Track conversation record
    progress.totalConversations++;
    expect(progress.totalConversations).toBe(1);

    // 6. This conversation counts toward ch1 objectives
    const state = createInitialMainQuestState();
    expect(state.chapters[0].status).toBe('active');

    // Record a conversation quest completion
    state.chapters[0].objectiveProgress['ch1_conversations'] = 1;
    const ch1 = MAIN_QUEST_CHAPTERS[0];
    const pct = getChapterCompletionPercent(ch1, state.chapters[0]);
    expect(pct).toBe(20); // 1 of 5 total objectives

    // 7. Verify vocabulary is ready for review later
    const now = Date.now() + 10 * 60 * 1000; // 10 min later
    const dueWords = getWordsDueForReview(progress.vocabulary, now);
    expect(dueWords.length).toBe(4); // All new words due after 5 min
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. REVIEW QUIZ TRIGGERS & MASTERY UPGRADE PATH
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Spaced repetition review flow', () => {
  it('getMasteryForCorrectCount matches thresholds: 0/3/5/8', () => {
    expect(getMasteryForCorrectCount(0)).toBe('new');
    expect(getMasteryForCorrectCount(2)).toBe('new');
    expect(getMasteryForCorrectCount(3)).toBe('learning');
    expect(getMasteryForCorrectCount(4)).toBe('learning');
    expect(getMasteryForCorrectCount(5)).toBe('familiar');
    expect(getMasteryForCorrectCount(7)).toBe('familiar');
    expect(getMasteryForCorrectCount(8)).toBe('mastered');
    expect(getMasteryForCorrectCount(20)).toBe('mastered');
  });

  it('review quiz trigger is probabilistic', () => {
    const newWord = makeVocabEntry({ masteryLevel: 'new' });
    // Deterministic checks: roll below 0.25 triggers, above doesn't
    expect(shouldTriggerReviewQuiz(newWord, 0.1)).toBe(true);
    expect(shouldTriggerReviewQuiz(newWord, 0.3)).toBe(false);

    // Mastered words have lower trigger chance (10%)
    const mastered = makeVocabEntry({ masteryLevel: 'mastered' });
    expect(shouldTriggerReviewQuiz(mastered, 0.05)).toBe(true);
    expect(shouldTriggerReviewQuiz(mastered, 0.15)).toBe(false);
  });

  it('timeUntilReview returns 0 for overdue words', () => {
    const now = Date.now();
    const overdue = makeVocabEntry({
      masteryLevel: 'new',
      lastEncountered: now - 60 * 60 * 1000, // 1 hour ago (5 min interval)
    });
    expect(timeUntilReview(overdue, now)).toBe(0);
  });

  it('timeUntilReview returns positive ms for not-yet-due words', () => {
    const now = Date.now();
    const fresh = makeVocabEntry({
      masteryLevel: 'learning',
      lastEncountered: now, // just now (30 min interval)
    });
    const remaining = timeUntilReview(fresh, now);
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(30 * 60 * 1000);
  });
});
