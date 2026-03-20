import { describe, it, expect } from 'vitest';
import {
  MAIN_QUEST_CHAPTERS,
  meetsChapterCefrRequirement,
  createInitialMainQuestState,
  getChapterCompletionPercent,
  isChapterComplete,
  getChapterById,
  getWriterName,
  getWriterNamesForLanguage,
  resolveNarrativeText,
  getResolvedChapter,
  WRITER_PLACEHOLDER,
  type ChapterProgress,
} from '../quest/main-quest-chapters';

describe('MAIN_QUEST_CHAPTERS', () => {
  it('has 6 chapters', () => {
    expect(MAIN_QUEST_CHAPTERS).toHaveLength(6);
  });

  it('chapters are numbered sequentially', () => {
    MAIN_QUEST_CHAPTERS.forEach((ch, i) => {
      expect(ch.number).toBe(i + 1);
    });
  });

  it('each chapter has required fields', () => {
    for (const ch of MAIN_QUEST_CHAPTERS) {
      expect(ch.id).toBeTruthy();
      expect(ch.title).toBeTruthy();
      expect(ch.description).toBeTruthy();
      expect(ch.requiredCefrLevel).toMatch(/^[AB][12]$/);
      expect(ch.objectives.length).toBeGreaterThan(0);
      expect(ch.completionBonusXP).toBeGreaterThan(0);
      expect(ch.introNarrative).toBeTruthy();
      expect(ch.outroNarrative).toBeTruthy();
    }
  });

  it('each chapter has 4-6 objectives', () => {
    for (const ch of MAIN_QUEST_CHAPTERS) {
      expect(ch.objectives.length).toBeGreaterThanOrEqual(4);
      expect(ch.objectives.length).toBeLessThanOrEqual(6);
    }
  });

  it('CEFR requirements increase monotonically', () => {
    const cefrOrder = ['A1', 'A2', 'B1', 'B2'];
    let prevIndex = 0;
    for (const ch of MAIN_QUEST_CHAPTERS) {
      const idx = cefrOrder.indexOf(ch.requiredCefrLevel);
      expect(idx).toBeGreaterThanOrEqual(prevIndex);
      prevIndex = idx;
    }
  });

  it('each objective has required fields', () => {
    for (const ch of MAIN_QUEST_CHAPTERS) {
      for (const obj of ch.objectives) {
        expect(obj.id).toBeTruthy();
        expect(obj.title).toBeTruthy();
        expect(obj.questType).toBeTruthy();
        expect(obj.requiredCount).toBeGreaterThan(0);
      }
    }
  });

  it('uses the Missing Writer narrative theme', () => {
    expect(MAIN_QUEST_CHAPTERS[0].id).toBe('ch1_assignment_abroad');
    expect(MAIN_QUEST_CHAPTERS[0].title).toBe('Assignment Abroad');
    expect(MAIN_QUEST_CHAPTERS[5].id).toBe('ch6_the_final_chapter');
    expect(MAIN_QUEST_CHAPTERS[5].title).toBe('The Final Chapter');
  });

  it('narrative text contains writer placeholder', () => {
    // At least some chapters should reference {WRITER}
    const chaptersWithWriter = MAIN_QUEST_CHAPTERS.filter(
      ch => ch.introNarrative.includes(WRITER_PLACEHOLDER) ||
            ch.outroNarrative.includes(WRITER_PLACEHOLDER) ||
            ch.description.includes(WRITER_PLACEHOLDER),
    );
    expect(chaptersWithWriter.length).toBeGreaterThan(0);
  });

  it('mixes quest types across chapters', () => {
    const allTypes = new Set<string>();
    for (const ch of MAIN_QUEST_CHAPTERS) {
      for (const obj of ch.objectives) {
        allTypes.add(obj.questType);
      }
    }
    expect(allTypes.has('vocabulary')).toBe(true);
    expect(allTypes.has('conversation')).toBe(true);
    expect(allTypes.has('grammar')).toBe(true);
  });
});

describe('meetsChapterCefrRequirement', () => {
  const ch1 = MAIN_QUEST_CHAPTERS[0]; // requires A1
  const ch3 = MAIN_QUEST_CHAPTERS[2]; // requires A2
  const ch5 = MAIN_QUEST_CHAPTERS[4]; // requires B1

  it('A1 meets A1 requirement', () => {
    expect(meetsChapterCefrRequirement('A1', ch1)).toBe(true);
  });

  it('null CEFR meets A1 requirement (default)', () => {
    expect(meetsChapterCefrRequirement(null, ch1)).toBe(true);
  });

  it('null CEFR does not meet A2 requirement', () => {
    expect(meetsChapterCefrRequirement(null, ch3)).toBe(false);
  });

  it('A1 does not meet A2 requirement', () => {
    expect(meetsChapterCefrRequirement('A1', ch3)).toBe(false);
  });

  it('A2 meets A2 requirement', () => {
    expect(meetsChapterCefrRequirement('A2', ch3)).toBe(true);
  });

  it('B2 meets B1 requirement', () => {
    expect(meetsChapterCefrRequirement('B2', ch5)).toBe(true);
  });

  it('A2 does not meet B1 requirement', () => {
    expect(meetsChapterCefrRequirement('A2', ch5)).toBe(false);
  });
});

describe('createInitialMainQuestState', () => {
  it('starts with chapter 1 active', () => {
    const state = createInitialMainQuestState();
    expect(state.currentChapterId).toBe('ch1_assignment_abroad');
    expect(state.totalXPEarned).toBe(0);
  });

  it('first chapter is active, rest are locked', () => {
    const state = createInitialMainQuestState();
    expect(state.chapters[0].status).toBe('active');
    for (let i = 1; i < state.chapters.length; i++) {
      expect(state.chapters[i].status).toBe('locked');
    }
  });

  it('initializes objective progress to 0', () => {
    const state = createInitialMainQuestState();
    for (const cp of state.chapters) {
      const chapter = getChapterById(cp.chapterId);
      if (chapter) {
        for (const obj of chapter.objectives) {
          expect(cp.objectiveProgress[obj.id]).toBe(0);
        }
      }
    }
  });
});

describe('getChapterCompletionPercent', () => {
  const chapter = MAIN_QUEST_CHAPTERS[0]; // ch1: 2 vocab + 3 conversation + 2 collect_text = 7 total

  it('returns 0 for no progress', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 0, ch1_ask_around: 0, ch1_collect_texts: 0 },
    };
    expect(getChapterCompletionPercent(chapter, progress)).toBe(0);
  });

  it('returns partial progress correctly', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 1, ch1_ask_around: 1, ch1_collect_texts: 0 },
    };
    // 2 out of 7 = 29%
    expect(getChapterCompletionPercent(chapter, progress)).toBe(29);
  });

  it('returns 100 for full completion', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 2, ch1_ask_around: 3, ch1_collect_texts: 2 },
    };
    expect(getChapterCompletionPercent(chapter, progress)).toBe(100);
  });

  it('caps progress at required count', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 10, ch1_ask_around: 10, ch1_collect_texts: 10 },
    };
    expect(getChapterCompletionPercent(chapter, progress)).toBe(100);
  });
});

describe('isChapterComplete', () => {
  const chapter = MAIN_QUEST_CHAPTERS[0];

  it('returns false when objectives not met', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 1, ch1_ask_around: 3, ch1_collect_texts: 2 },
    };
    expect(isChapterComplete(chapter, progress)).toBe(false);
  });

  it('returns false when collect_text objective not met', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 2, ch1_ask_around: 3, ch1_collect_texts: 0 },
    };
    expect(isChapterComplete(chapter, progress)).toBe(false);
  });

  it('returns true when all objectives met', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 2, ch1_ask_around: 3, ch1_collect_texts: 2 },
    };
    expect(isChapterComplete(chapter, progress)).toBe(true);
  });

  it('returns true when objectives exceed requirements', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 5, ch1_ask_around: 10, ch1_collect_texts: 10 },
    };
    expect(isChapterComplete(chapter, progress)).toBe(true);
  });
});

describe('getChapterById', () => {
  it('finds existing chapter', () => {
    const ch = getChapterById('ch1_assignment_abroad');
    expect(ch).toBeDefined();
    expect(ch!.title).toBe('Assignment Abroad');
  });

  it('returns undefined for nonexistent chapter', () => {
    expect(getChapterById('nonexistent')).toBeUndefined();
  });
});

describe('getWriterName', () => {
  it('returns a French name for French language', () => {
    const name = getWriterName('french', 'test-world-123');
    expect(name.firstName).toBeTruthy();
    expect(name.lastName).toBeTruthy();
    expect(name.fullName).toBeTruthy();
    expect(name.fullName).toContain(name.firstName);
  });

  it('returns deterministic result for same worldId', () => {
    const name1 = getWriterName('french', 'world-abc');
    const name2 = getWriterName('french', 'world-abc');
    expect(name1.fullName).toBe(name2.fullName);
  });

  it('may return different results for different worldIds', () => {
    // With enough different IDs, we should get at least 2 distinct names
    const names = new Set<string>();
    for (let i = 0; i < 20; i++) {
      names.add(getWriterName('french', `world-${i}`).fullName);
    }
    expect(names.size).toBeGreaterThan(1);
  });

  it('returns a Spanish name for Spanish language', () => {
    const name = getWriterName('spanish', 'test-world');
    expect(name.fullName).toBeTruthy();
  });

  it('returns fallback name for unknown language', () => {
    const name = getWriterName('klingon', 'test-world');
    expect(name.fullName).toBeTruthy();
  });

  it('is case insensitive', () => {
    const name1 = getWriterName('French', 'test-world');
    const name2 = getWriterName('french', 'test-world');
    expect(name1.fullName).toBe(name2.fullName);
  });
});

describe('getWriterNamesForLanguage', () => {
  it('returns pool of names for known language', () => {
    const names = getWriterNamesForLanguage('french');
    expect(names.length).toBeGreaterThanOrEqual(2);
  });

  it('returns fallback pool for unknown language', () => {
    const names = getWriterNamesForLanguage('esperanto');
    expect(names.length).toBeGreaterThan(0);
  });
});

describe('resolveNarrativeText', () => {
  it('replaces {WRITER} with full name', () => {
    const name = { firstName: 'Émile', lastName: 'Beaumont', fullName: 'Émile Beaumont' };
    const text = 'The writer {WRITER} vanished.';
    expect(resolveNarrativeText(text, name)).toBe('The writer Émile Beaumont vanished.');
  });

  it('replaces multiple occurrences', () => {
    const name = { firstName: 'Émile', lastName: 'Beaumont', fullName: 'Émile Beaumont' };
    const text = '{WRITER} said "{WRITER} will return."';
    expect(resolveNarrativeText(text, name)).toBe('Émile Beaumont said "Émile Beaumont will return."');
  });

  it('returns text unchanged when no placeholder', () => {
    const name = { firstName: 'Émile', lastName: 'Beaumont', fullName: 'Émile Beaumont' };
    const text = 'No placeholder here.';
    expect(resolveNarrativeText(text, name)).toBe('No placeholder here.');
  });
});

describe('getResolvedChapter', () => {
  it('resolves all narrative fields', () => {
    const name = { firstName: 'Émile', lastName: 'Beaumont', fullName: 'Émile Beaumont' };
    const chapter = MAIN_QUEST_CHAPTERS[0];
    const resolved = getResolvedChapter(chapter, name);

    expect(resolved.description).not.toContain('{WRITER}');
    expect(resolved.introNarrative).not.toContain('{WRITER}');
    expect(resolved.outroNarrative).not.toContain('{WRITER}');
    // Original should be unchanged
    expect(chapter.introNarrative).toContain('{WRITER}');
  });
});
