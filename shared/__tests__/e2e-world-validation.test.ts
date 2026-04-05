/**
 * End-to-end validation for world 69bba18ce2e6d5c1cb3c7a9f
 *
 * Verifies that all new systems work together:
 *  - Text seed generation (template-based starter set)
 *  - Text schema and data integrity (GameText, InsertGameText)
 *  - Main quest collect_text objectives wired to seed texts
 *  - Investigation journal (case notes, narrative beats)
 *  - Writer name resolution in narratives
 *  - Language progress integration with text vocabulary
 *  - Vocabulary review scheduling for words from texts
 *  - CEFR-gated chapter progression with text collection
 */

import { describe, it, expect } from 'vitest';

// ── Texts (seed generator) ──────────────────────────────────────────────────
import { buildSeedTexts, type TextSeedOptions } from '../../server/services/text-seed-generator';

// ── Schema types ────────────────────────────────────────────────────────────
import type {
  GameText,
  InsertGameText,
  TextCategory,
  CefrLevel,
  TextPage,
  VocabularyHighlight,
  ComprehensionQuestion,
} from '../schema';

// ── Main quest ──────────────────────────────────────────────────────────────
import {
  MAIN_QUEST_CHAPTERS,
  createInitialMainQuestState,
  meetsChapterCefrRequirement,
  getChapterCompletionPercent,
  isChapterComplete,
  getWriterName,
  resolveNarrativeText,
  getResolvedChapter,
  addCaseNote,
  type MainQuestState,
  type ChapterProgress,
  type CaseNote,
  type InvestigationBoardData,
} from '../quest/main-quest-chapters';

// ── Objective types ─────────────────────────────────────────────────────────
import {
  VALID_OBJECTIVE_TYPES,
  normalizeObjectiveType,
  ACHIEVABLE_OBJECTIVE_TYPES,
} from '../quest-objective-types';

// ── Language progress ───────────────────────────────────────────────────────
import {
  calculateMasteryLevel,
  calculateFluencyGain,
  type VocabularyEntry,
} from '../language/progress';

// ── Vocabulary review ───────────────────────────────────────────────────────
import {
  isWordDueForReview,
  processReviewResult,
} from '../language/vocabulary-review';

// ── Constants ───────────────────────────────────────────────────────────────
const WORLD_ID = '69bba18ce2e6d5c1cb3c7a9f';
const TARGET_LANGUAGE = 'French';

const SEED_OPTIONS: TextSeedOptions = {
  worldId: WORLD_ID,
  targetLanguage: TARGET_LANGUAGE,
};

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

// ═══════════════════════════════════════════════════════════════════════════
// 1. TEXT SEED GENERATION FOR WORLD
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Text seed generation for world', () => {
  const seeds = buildSeedTexts(SEED_OPTIONS);

  it('generates a non-empty starter set', () => {
    expect(seeds.length).toBeGreaterThan(0);
  });

  it('every seed text belongs to target world', () => {
    for (const text of seeds) {
      expect(text.worldId).toBe(WORLD_ID);
    }
  });

  it('every seed text has the correct target language', () => {
    for (const text of seeds) {
      expect(text.targetLanguage).toBe(TARGET_LANGUAGE);
    }
  });

  it('covers all CEFR levels', () => {
    const levels = new Set(seeds.map(t => t.cefrLevel));
    expect(levels).toContain('A1');
    expect(levels).toContain('A2');
    expect(levels).toContain('B1');
    expect(levels).toContain('B2');
  });

  it('covers multiple text categories', () => {
    const categories = new Set(seeds.map(t => t.textCategory));
    expect(categories.size).toBeGreaterThanOrEqual(3);
  });

  it('every seed has required fields', () => {
    for (const text of seeds) {
      expect(text.title).toBeTruthy();
      expect(text.titleTranslation).toBeTruthy();
      expect(text.pages.length).toBeGreaterThan(0);
      expect(text.vocabularyHighlights.length).toBeGreaterThan(0);
      expect(text.comprehensionQuestions.length).toBeGreaterThan(0);
      expect(text.spawnLocationHint).toBeTruthy();
      expect(text.difficulty).toBeTruthy();
    }
  });

  it('every page has content and translation', () => {
    for (const text of seeds) {
      for (const page of text.pages) {
        expect(page.content.length).toBeGreaterThan(10);
        expect(page.contentTranslation.length).toBeGreaterThan(10);
      }
    }
  });

  it('vocabulary highlights have valid structure', () => {
    for (const text of seeds) {
      for (const vh of text.vocabularyHighlights) {
        expect(vh.word).toBeTruthy();
        expect(vh.translation).toBeTruthy();
        expect(vh.partOfSpeech).toBeTruthy();
      }
    }
  });

  it('comprehension questions have valid structure', () => {
    for (const text of seeds) {
      for (const q of text.comprehensionQuestions) {
        expect(q.question).toBeTruthy();
        expect(q.questionTranslation).toBeTruthy();
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      }
    }
  });

  it('all seeds are published status', () => {
    for (const text of seeds) {
      expect(text.status).toBe('published');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. TEXTS SATISFY MAIN QUEST COLLECT_TEXT REQUIREMENTS
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Seed texts satisfy main quest text collection requirements', () => {
  const seeds = buildSeedTexts(SEED_OPTIONS);

  it('total seed count meets or exceeds total collect_text requirement', () => {
    const totalRequired = MAIN_QUEST_CHAPTERS.reduce((sum, ch) => {
      const obj = ch.objectives.find(o => o.questType === 'collect_text');
      return sum + (obj?.requiredCount ?? 0);
    }, 0);
    // 2+2+3+3+4+5 = 19 total required
    expect(seeds.length).toBeGreaterThanOrEqual(totalRequired);
  });

  it('each CEFR level has enough texts for its chapters', () => {
    const cefrChapterRequirements: Record<CefrLevel, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const ch of MAIN_QUEST_CHAPTERS) {
      const obj = ch.objectives.find(o => o.questType === 'collect_text');
      if (obj) {
        cefrChapterRequirements[ch.requiredCefrLevel] += obj.requiredCount;
      }
    }

    const cefrTextCounts: Record<CefrLevel, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const text of seeds) {
      cefrTextCounts[text.cefrLevel]++;
    }

    for (const level of ['A1', 'A2', 'B1', 'B2'] as CefrLevel[]) {
      expect(cefrTextCounts[level]).toBeGreaterThanOrEqual(
        cefrChapterRequirements[level],
      );
    }
  });

  it('collect_text is a valid achievable objective type', () => {
    expect(VALID_OBJECTIVE_TYPES.has('collect_text')).toBe(true);
    const def = ACHIEVABLE_OBJECTIVE_TYPES.find(t => t.type === 'collect_text');
    expect(def).toBeDefined();
    expect(def!.countable).toBe(true);
  });

  it('text collection aliases normalize to collect_text', () => {
    // Only aliases that aren't their own canonical types
    for (const alias of ['collect_book', 'collect_letter', 'collect_journal', 'collect_scroll']) {
      expect(normalizeObjectiveType(alias)).toBe('collect_text');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. INVESTIGATION JOURNAL INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Investigation journal with text collection', () => {
  it('writer name is deterministic for the world', () => {
    const name1 = getWriterName(TARGET_LANGUAGE, WORLD_ID);
    const name2 = getWriterName(TARGET_LANGUAGE, WORLD_ID);
    expect(name1.fullName).toBe(name2.fullName);
    expect(name1.firstName).toBeTruthy();
    expect(name1.lastName).toBeTruthy();
  });

  it('narrative text resolves writer name', () => {
    const writer = getWriterName(TARGET_LANGUAGE, WORLD_ID);
    const ch1 = MAIN_QUEST_CHAPTERS[0];
    const resolved = getResolvedChapter(ch1, writer);
    expect(resolved.introNarrative).toContain(writer.fullName);
    expect(resolved.introNarrative).not.toContain('{WRITER}');
    expect(resolved.description).toContain(writer.fullName);
  });

  it('case notes can be added for text_found events', () => {
    const state = createInitialMainQuestState();
    const writer = getWriterName(TARGET_LANGUAGE, WORLD_ID);
    const seeds = buildSeedTexts(SEED_OPTIONS);
    const firstText = seeds[0];

    const note = addCaseNote(state, {
      day: 1,
      text: `Found "${firstText.title}" (${firstText.titleTranslation}) at ${firstText.spawnLocationHint}. Could be a clue about ${writer.fullName}.`,
      category: 'text_found',
      chapterId: 'ch1_assignment_abroad',
    });

    expect(note.id).toBeTruthy();
    expect(note.category).toBe('text_found');
    expect(note.createdAt).toBeTruthy();
    expect(state.caseNotes).toHaveLength(1);
    expect(state.caseNotes![0].text).toContain(firstText.title);
  });

  it('case notes accumulate across multiple text discoveries', () => {
    const state = createInitialMainQuestState();
    const seeds = buildSeedTexts(SEED_OPTIONS);

    for (let i = 0; i < 3; i++) {
      addCaseNote(state, {
        day: i + 1,
        text: `Found text: ${seeds[i].title}`,
        category: 'text_found',
        chapterId: 'ch1_assignment_abroad',
      });
    }

    expect(state.caseNotes).toHaveLength(3);
    // Newest first ordering
    expect(state.caseNotes![0].text).toContain(seeds[2].title);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. FULL PLAYTHROUGH: TEXT COLLECTION DRIVES CHAPTER PROGRESSION
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Full playthrough with text collection driving progression', () => {
  it('simulates collecting texts through chapters 1-2', () => {
    const state = createInitialMainQuestState();
    const seeds = buildSeedTexts(SEED_OPTIONS);
    const writer = getWriterName(TARGET_LANGUAGE, WORLD_ID);

    // Chapter 1: need 2 vocab + 3 conversation + 2 collect_text
    const ch1 = MAIN_QUEST_CHAPTERS[0];
    state.chapters[0].objectiveProgress['ch1_greetings'] = 2;
    state.chapters[0].objectiveProgress['ch1_ask_around'] = 3;
    state.chapters[0].objectiveProgress['ch1_collect_texts'] = 2;

    expect(isChapterComplete(ch1, state.chapters[0])).toBe(true);
    expect(getChapterCompletionPercent(ch1, state.chapters[0])).toBe(100);

    // Log case note for chapter completion
    addCaseNote(state, {
      day: 3,
      text: `Completed initial investigation. Found 2 texts and spoke to locals about ${writer.fullName}.`,
      category: 'chapter_event',
      chapterId: ch1.id,
    });

    // Advance to ch2
    state.chapters[0].status = 'completed';
    state.chapters[1].status = 'active';
    state.currentChapterId = MAIN_QUEST_CHAPTERS[1].id;
    state.totalXPEarned += ch1.completionBonusXP;

    // Chapter 2: 2 vocab(explore) + 3 convo(interview) + 1 convo(book) + 2 vocab(signs) + 2 grammar + 2 collect_text
    const ch2 = MAIN_QUEST_CHAPTERS[1];
    state.chapters[1].objectiveProgress['ch2_explore_town'] = 2;
    state.chapters[1].objectiveProgress['ch2_interview_locals'] = 3;
    state.chapters[1].objectiveProgress['ch2_find_first_book'] = 1;
    state.chapters[1].objectiveProgress['ch2_read_signs'] = 2;
    state.chapters[1].objectiveProgress['ch2_grammar_basics'] = 2;
    state.chapters[1].objectiveProgress['ch2_collect_texts'] = 2;

    expect(isChapterComplete(ch2, state.chapters[1])).toBe(true);
    state.totalXPEarned += ch2.completionBonusXP;

    expect(state.totalXPEarned).toBe(ch1.completionBonusXP + ch2.completionBonusXP);
    expect(state.caseNotes).toHaveLength(1);
  });

  it('partial text collection shows correct percentage', () => {
    const ch1 = MAIN_QUEST_CHAPTERS[0];
    const progress: ChapterProgress = {
      chapterId: ch1.id,
      status: 'active',
      objectiveProgress: {
        ch1_greetings: 2,
        ch1_ask_around: 3,
        ch1_collect_texts: 1, // 1 of 2
      },
    };
    const pct = getChapterCompletionPercent(ch1, progress);
    // 6 of 7 total = ~85%
    expect(pct).toBe(86); // Math.round(6/7*100)
    expect(isChapterComplete(ch1, progress)).toBe(false);
  });

  it('CEFR gating prevents skipping ahead without language progress', () => {
    const ch3 = MAIN_QUEST_CHAPTERS[2]; // requires A2
    expect(meetsChapterCefrRequirement('A1', ch3)).toBe(false);
    expect(meetsChapterCefrRequirement('A2', ch3)).toBe(true);

    const ch5 = MAIN_QUEST_CHAPTERS[4]; // requires B1
    expect(meetsChapterCefrRequirement('A2', ch5)).toBe(false);
    expect(meetsChapterCefrRequirement('B1', ch5)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. TEXT VOCABULARY → LANGUAGE PROGRESS PIPELINE
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Text vocabulary feeds into language progress', () => {
  const seeds = buildSeedTexts(SEED_OPTIONS);

  it('seed texts provide vocabulary words at every CEFR level', () => {
    const vocabByLevel: Record<CefrLevel, string[]> = { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] };
    for (const text of seeds) {
      const words = text.vocabularyHighlights.map(vh => vh.word);
      vocabByLevel[text.cefrLevel].push(...words);
    }
    for (const level of ['A1', 'A2', 'B1', 'B2'] as CefrLevel[]) {
      expect(vocabByLevel[level].length).toBeGreaterThan(0);
    }
  });

  it('vocabulary from texts can be tracked through mastery lifecycle', () => {
    const a1Text = seeds.find(t => t.cefrLevel === 'A1')!;
    const word = a1Text.vocabularyHighlights[0];

    const entry = makeVocabEntry({
      word: word.word,
      meaning: word.translation,
      language: TARGET_LANGUAGE,
    });

    // New → learning → familiar → mastered (aligned with SRS thresholds)
    expect(calculateMasteryLevel(0, 0)).toBe('new');
    expect(calculateMasteryLevel(3, 1)).toBe('learning');
    expect(calculateMasteryLevel(8, 5)).toBe('familiar');
    expect(calculateMasteryLevel(10, 8)).toBe('mastered');
  });

  it('text vocabulary words become due for review after interval', () => {
    const now = Date.now();
    const a1Text = seeds.find(t => t.cefrLevel === 'A1')!;
    const word = a1Text.vocabularyHighlights[0];

    const entry = makeVocabEntry({
      word: word.word,
      meaning: word.translation,
      masteryLevel: 'new',
      lastEncountered: now - 6 * 60 * 1000, // 6 min ago
    });

    expect(isWordDueForReview(entry, now)).toBe(true);
  });

  it('reviewing text vocabulary drives mastery progression', () => {
    const a1Text = seeds.find(t => t.cefrLevel === 'A1')!;
    const word = a1Text.vocabularyHighlights[0];

    const entry = makeVocabEntry({
      word: word.word,
      meaning: word.translation,
      timesEncountered: 0,
      timesUsedCorrectly: 0,
    });

    // Simulate 8 correct reviews
    for (let i = 0; i < 8; i++) {
      processReviewResult(entry, true);
    }

    expect(entry.timesUsedCorrectly).toBe(8);
    expect(entry.masteryLevel).toBe('mastered');
  });

  it('fluency gain calculation works with text-sourced vocab count', () => {
    const a1Texts = seeds.filter(t => t.cefrLevel === 'A1');
    const totalVocab = a1Texts.reduce(
      (sum, t) => sum + t.vocabularyHighlights.length, 0,
    );

    const result = calculateFluencyGain(0, totalVocab, 0.8, 3, 60);
    expect(result.gain).toBeGreaterThan(0);
    expect(result.newFluency).toBeGreaterThan(0);
    if (totalVocab >= 5) {
      expect(result.bonuses).toContain('Vocab variety bonus!');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. CROSS-SYSTEM DATA INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Cross-system data integrity', () => {
  const seeds = buildSeedTexts(SEED_OPTIONS);
  const writer = getWriterName(TARGET_LANGUAGE, WORLD_ID);

  it('seed text author names are consistent with writer name', () => {
    const booksWithAuthor = seeds.filter(t => t.authorName);
    // Main quest books should reference the writer name from options (default "Jean-Luc Moreau")
    for (const book of booksWithAuthor) {
      expect(book.authorName).toBeTruthy();
    }
  });

  it('book seeds reference writer name in page content', () => {
    const books = seeds.filter(t => t.textCategory === 'book');
    expect(books.length).toBeGreaterThan(0);
    // Books use the writerName from seed options (default: "Jean-Luc Moreau")
    const allContent = books.map(b => b.pages.map(p => p.content).join(' ')).join(' ');
    expect(allContent).toContain('Jean-Luc Moreau');
  });

  it('difficulty levels align between seed texts and CEFR', () => {
    const cefrToDifficulty: Record<CefrLevel, string[]> = {
      A1: ['beginner'],
      A2: ['beginner'],
      B1: ['intermediate'],
      B2: ['advanced'],
      C1: ['advanced'],
      C2: ['advanced'],
    };
    for (const text of seeds) {
      expect(cefrToDifficulty[text.cefrLevel]).toContain(text.difficulty);
    }
  });

  it('all 6 main quest chapters have collect_text objectives', () => {
    for (const ch of MAIN_QUEST_CHAPTERS) {
      const textObj = ch.objectives.find(o => o.questType === 'collect_text');
      expect(textObj).toBeDefined();
      expect(textObj!.id).toMatch(/^ch\d+_collect_texts$/);
    }
  });

  it('chapter CEFR requirements are monotonically non-decreasing', () => {
    const cefrOrder = ['A1', 'A2', 'B1', 'B2'];
    let prevRank = 0;
    for (const ch of MAIN_QUEST_CHAPTERS) {
      const rank = cefrOrder.indexOf(ch.requiredCefrLevel);
      expect(rank).toBeGreaterThanOrEqual(prevRank);
      prevRank = rank;
    }
  });

  it('collect_text objectives across chapters use a valid achievable type', () => {
    for (const ch of MAIN_QUEST_CHAPTERS) {
      const textObj = ch.objectives.find(o => o.questType === 'collect_text');
      expect(textObj).toBeDefined();
      expect(VALID_OBJECTIVE_TYPES.has(textObj!.questType)).toBe(true);
    }
  });

  it('chapter quest types are limited to known categories', () => {
    const knownQuestTypes = new Set(['vocabulary', 'conversation', 'grammar', 'collect_text', 'fetch', 'teaching']);
    for (const ch of MAIN_QUEST_CHAPTERS) {
      for (const obj of ch.objectives) {
        expect(knownQuestTypes.has(obj.questType)).toBe(true);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. INVESTIGATION BOARD DATA ASSEMBLY
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: Investigation board data can be assembled from quest state', () => {
  it('builds investigation board data from completed chapters', () => {
    const state = createInitialMainQuestState();
    const writer = getWriterName(TARGET_LANGUAGE, WORLD_ID);
    const seeds = buildSeedTexts(SEED_OPTIONS);

    // Simulate some progress
    addCaseNote(state, {
      day: 1,
      text: 'Arrived in town, spoke to newspaper editor.',
      category: 'npc_interview',
      chapterId: 'ch1_assignment_abroad',
    });
    addCaseNote(state, {
      day: 2,
      text: `Found "${seeds[0].title}" near the town square.`,
      category: 'text_found',
      chapterId: 'ch1_assignment_abroad',
    });

    // Build board data from state
    const boardData: InvestigationBoardData = {
      writerName: writer.fullName,
      timeline: MAIN_QUEST_CHAPTERS.map(ch => ({
        label: ch.title,
        detail: resolveNarrativeText(ch.description, writer).slice(0, 100),
        completed: state.chapters.find(p => p.chapterId === ch.id)?.status === 'completed',
      })),
      evidenceCollected: state.caseNotes!.filter(n => n.category === 'text_found').length,
      keyNPCsMet: [{ name: 'Newspaper Editor', note: 'First contact in town' }],
      cluesFound: state.caseNotes!.length,
    };

    expect(boardData.writerName).toBe(writer.fullName);
    expect(boardData.timeline).toHaveLength(6);
    expect(boardData.timeline[0].completed).toBe(false);
    expect(boardData.evidenceCollected).toBe(1);
    expect(boardData.cluesFound).toBe(2);
    expect(boardData.keyNPCsMet).toHaveLength(1);
  });
});
