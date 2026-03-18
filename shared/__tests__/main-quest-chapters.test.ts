import { describe, it, expect } from 'vitest';
import {
  MAIN_QUEST_CHAPTERS,
  meetsChapterCefrRequirement,
  createInitialMainQuestState,
  getChapterCompletionPercent,
  isChapterComplete,
  getChapterById,
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
    expect(state.currentChapterId).toBe('ch1_arrival');
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
  const chapter = MAIN_QUEST_CHAPTERS[0]; // ch1: 2 vocab + 3 conversation = 5 total

  it('returns 0 for no progress', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 0, ch1_conversations: 0 },
    };
    expect(getChapterCompletionPercent(chapter, progress)).toBe(0);
  });

  it('returns partial progress correctly', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 1, ch1_conversations: 1 },
    };
    // 2 out of 5 = 40%
    expect(getChapterCompletionPercent(chapter, progress)).toBe(40);
  });

  it('returns 100 for full completion', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 2, ch1_conversations: 3 },
    };
    expect(getChapterCompletionPercent(chapter, progress)).toBe(100);
  });

  it('caps progress at required count', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 10, ch1_conversations: 10 },
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
      objectiveProgress: { ch1_greetings: 1, ch1_conversations: 3 },
    };
    expect(isChapterComplete(chapter, progress)).toBe(false);
  });

  it('returns true when all objectives met', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 2, ch1_conversations: 3 },
    };
    expect(isChapterComplete(chapter, progress)).toBe(true);
  });

  it('returns true when objectives exceed requirements', () => {
    const progress: ChapterProgress = {
      chapterId: chapter.id,
      status: 'active',
      objectiveProgress: { ch1_greetings: 5, ch1_conversations: 10 },
    };
    expect(isChapterComplete(chapter, progress)).toBe(true);
  });
});

describe('getChapterById', () => {
  it('finds existing chapter', () => {
    const ch = getChapterById('ch1_arrival');
    expect(ch).toBeDefined();
    expect(ch!.title).toBe('Arrival');
  });

  it('returns undefined for nonexistent chapter', () => {
    expect(getChapterById('nonexistent')).toBeUndefined();
  });
});
