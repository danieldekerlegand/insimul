import { describe, it, expect } from 'vitest';
import {
  addCaseNote,
  createInitialMainQuestState,
  MAIN_QUEST_CHAPTERS,
  getChapterCompletionPercent,
  type MainQuestState,
  type CaseNote,
  type InvestigationBoardData,
} from '../quest/main-quest-chapters';

describe('addCaseNote', () => {
  it('adds a case note to an empty state', () => {
    const state = createInitialMainQuestState();
    expect(state.caseNotes).toBeUndefined();

    const note = addCaseNote(state, {
      day: 1,
      text: 'Arrived in town. The editor mentioned a missing writer.',
      category: 'chapter_event',
      chapterId: 'ch1_arrival',
    });

    expect(state.caseNotes).toHaveLength(1);
    expect(note.id).toMatch(/^note_/);
    expect(note.createdAt).toBeTruthy();
    expect(note.text).toContain('missing writer');
    expect(note.category).toBe('chapter_event');
    expect(note.day).toBe(1);
    expect(note.chapterId).toBe('ch1_arrival');
  });

  it('prepends new notes (newest first)', () => {
    const state = createInitialMainQuestState();

    addCaseNote(state, {
      day: 1,
      text: 'First note',
      category: 'clue',
      chapterId: 'ch1_arrival',
    });
    addCaseNote(state, {
      day: 2,
      text: 'Second note',
      category: 'npc_interview',
      chapterId: 'ch1_arrival',
    });

    expect(state.caseNotes).toHaveLength(2);
    expect(state.caseNotes![0].text).toBe('Second note');
    expect(state.caseNotes![1].text).toBe('First note');
  });

  it('generates unique IDs for each note', () => {
    const state = createInitialMainQuestState();

    const note1 = addCaseNote(state, {
      day: 1,
      text: 'Note 1',
      category: 'clue',
      chapterId: 'ch1_arrival',
    });
    const note2 = addCaseNote(state, {
      day: 1,
      text: 'Note 2',
      category: 'clue',
      chapterId: 'ch1_arrival',
    });

    expect(note1.id).not.toBe(note2.id);
  });

  it('initializes caseNotes array if undefined', () => {
    const state: MainQuestState = {
      currentChapterId: 'ch1_arrival',
      chapters: [],
      totalXPEarned: 0,
      narrativeBeatsDelivered: [],
      // caseNotes deliberately omitted
    };

    addCaseNote(state, {
      day: 1,
      text: 'Test note',
      category: 'location_visited',
      chapterId: 'ch1_arrival',
    });

    expect(state.caseNotes).toBeDefined();
    expect(state.caseNotes).toHaveLength(1);
  });
});

describe('CaseNote categories', () => {
  it('supports all five category types', () => {
    const state = createInitialMainQuestState();
    const categories: CaseNote['category'][] = [
      'clue',
      'npc_interview',
      'text_found',
      'location_visited',
      'chapter_event',
    ];

    for (const cat of categories) {
      addCaseNote(state, {
        day: 1,
        text: `Note for ${cat}`,
        category: cat,
        chapterId: 'ch1_arrival',
      });
    }

    expect(state.caseNotes).toHaveLength(5);
    const storedCategories = state.caseNotes!.map(n => n.category);
    for (const cat of categories) {
      expect(storedCategories).toContain(cat);
    }
  });
});
