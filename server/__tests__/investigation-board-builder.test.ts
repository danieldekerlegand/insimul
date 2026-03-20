import { describe, it, expect } from 'vitest';
import { buildInvestigationBoard } from '../services/investigation-board-builder';
import {
  MAIN_QUEST_CHAPTERS,
  createInitialMainQuestState,
  addCaseNote,
  type MainQuestState,
  type ChapterProgress,
  type MainQuestChapter,
} from '../../shared/quest/main-quest-chapters';
import { meetsChapterCefrRequirement, getChapterCompletionPercent } from '../../shared/quest/main-quest-chapters';

function makeChapterEntries(state: MainQuestState) {
  return MAIN_QUEST_CHAPTERS.map(chapter => {
    const progress = state.chapters.find(cp => cp.chapterId === chapter.id) ?? {
      chapterId: chapter.id,
      status: 'locked' as const,
      objectiveProgress: {},
    };
    return {
      chapter,
      progress,
      completionPercent: getChapterCompletionPercent(chapter, progress),
      cefrMet: meetsChapterCefrRequirement('A1', chapter),
    };
  });
}

describe('buildInvestigationBoard', () => {
  it('returns valid investigation board data for initial state', () => {
    const state = createInitialMainQuestState();
    const chapters = makeChapterEntries(state);
    const board = buildInvestigationBoard(state, chapters);

    expect(board.writerName).toBe('The Missing Writer');
    expect(board.timeline).toHaveLength(6);
    expect(board.evidenceCollected).toBe(0);
    expect(board.keyNPCsMet).toHaveLength(0);
    expect(board.cluesFound).toBe(0);
  });

  it('timeline shows active chapter as in-progress', () => {
    const state = createInitialMainQuestState();
    const chapters = makeChapterEntries(state);
    const board = buildInvestigationBoard(state, chapters);

    // Chapter 1 should be in progress
    expect(board.timeline[0].completed).toBe(false);
    expect(board.timeline[0].detail).toContain('In progress');
    expect(board.timeline[0].label).toContain('Ch. 1');
  });

  it('timeline shows completed chapter correctly', () => {
    const state = createInitialMainQuestState();
    state.chapters[0].status = 'completed';
    state.chapters[0].completedAt = '2026-03-15T10:00:00Z';
    state.chapters[0].objectiveProgress = { ch1_greetings: 2, ch1_conversations: 3 };

    const chapters = makeChapterEntries(state);
    const board = buildInvestigationBoard(state, chapters);

    expect(board.timeline[0].completed).toBe(true);
    expect(board.timeline[0].detail).toContain('Completed');
  });

  it('counts clues from objective progress', () => {
    const state = createInitialMainQuestState();
    state.chapters[0].objectiveProgress = { ch1_greetings: 1, ch1_conversations: 2 };

    const chapters = makeChapterEntries(state);
    const board = buildInvestigationBoard(state, chapters);

    expect(board.cluesFound).toBe(3); // 1 + 2
  });

  it('caps clue count at required count', () => {
    const state = createInitialMainQuestState();
    // Over-complete objectives
    state.chapters[0].objectiveProgress = { ch1_greetings: 10, ch1_conversations: 10 };

    const chapters = makeChapterEntries(state);
    const board = buildInvestigationBoard(state, chapters);

    // Should cap at 2 + 3 = 5
    expect(board.cluesFound).toBe(5);
  });

  it('counts evidence from case notes', () => {
    const state = createInitialMainQuestState();
    addCaseNote(state, { day: 1, text: 'Found a document', category: 'text_found', chapterId: 'ch1_arrival' });
    addCaseNote(state, { day: 2, text: 'Found a clue', category: 'clue', chapterId: 'ch1_arrival' });
    addCaseNote(state, { day: 3, text: 'Talked to someone', category: 'npc_interview', chapterId: 'ch1_arrival' });

    const chapters = makeChapterEntries(state);
    const board = buildInvestigationBoard(state, chapters);

    // text_found + clue = 2 evidence
    expect(board.evidenceCollected).toBe(2);
  });

  it('extracts key NPCs from interview notes', () => {
    const state = createInitialMainQuestState();
    addCaseNote(state, { day: 1, text: 'Spoke with Maria about the writer', category: 'npc_interview', chapterId: 'ch1_arrival' });
    addCaseNote(state, { day: 2, text: 'Talked to Jean about the manuscript', category: 'npc_interview', chapterId: 'ch1_arrival' });

    const chapters = makeChapterEntries(state);
    const board = buildInvestigationBoard(state, chapters);

    expect(board.keyNPCsMet).toHaveLength(2);
    // Most recent first (notes are prepended)
    expect(board.keyNPCsMet[0].name).toBe('Jean');
    expect(board.keyNPCsMet[1].name).toBe('Maria');
  });

  it('limits key NPCs to 10', () => {
    const state = createInitialMainQuestState();
    for (let i = 0; i < 15; i++) {
      addCaseNote(state, {
        day: i + 1,
        text: `Met Person${i}`,
        category: 'npc_interview',
        chapterId: 'ch1_arrival',
      });
    }

    const chapters = makeChapterEntries(state);
    const board = buildInvestigationBoard(state, chapters);

    expect(board.keyNPCsMet.length).toBeLessThanOrEqual(10);
  });

  it('handles state with no case notes gracefully', () => {
    const state: MainQuestState = {
      currentChapterId: 'ch1_arrival',
      chapters: MAIN_QUEST_CHAPTERS.map(ch => ({
        chapterId: ch.id,
        status: 'locked' as const,
        objectiveProgress: {},
      })),
      totalXPEarned: 0,
      narrativeBeatsDelivered: [],
      // no caseNotes
    };

    const chapters = makeChapterEntries(state);
    const board = buildInvestigationBoard(state, chapters);

    expect(board.evidenceCollected).toBe(0);
    expect(board.keyNPCsMet).toHaveLength(0);
  });
});
