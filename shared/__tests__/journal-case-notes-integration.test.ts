/**
 * Integration tests: Journal and case notes update with main quest progress.
 *
 * Verifies:
 * 1. Case notes are generated when main quest objectives complete
 * 2. ClueStore chapter gating syncs with journal state
 * 3. ClueStore serialization round-trips through save/load
 * 4. clue_discovered events fire toast notifications
 * 5. Eavesdrop conversations feed into ClueStore
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClueStore, type ClueStoreState } from '../game-engine/logic/ClueStore';
import { GameEventBus } from '../game-engine/logic/GameEventBus';
import {
  addCaseNote,
  createInitialMainQuestState,
  type MainQuestState,
  type CaseNote,
} from '../quest/main-quest-chapters';

describe('Journal & Case Notes Integration', () => {
  let eventBus: GameEventBus;
  let clueStore: ClueStore;

  beforeEach(() => {
    eventBus = new GameEventBus();
    clueStore = new ClueStore(eventBus, 12);
  });

  // ── Case Notes from Main Quest Progress ───────────────────────────────────

  describe('case notes generation on quest progress', () => {
    it('addCaseNote appends a note with auto-generated id and timestamp', () => {
      const state = createInitialMainQuestState();
      state.caseNotes = [];

      const note = addCaseNote(state, {
        day: 3,
        text: 'Completed: Visit the Newspaper Office.',
        category: 'location_visited',
        chapterId: 'ch1_assignment_abroad',
      });

      expect(note).toBeDefined();
      expect(note.id).toBeTruthy();
      expect(note.createdAt).toBeTruthy();
      expect(note.day).toBe(3);
      expect(note.text).toContain('Newspaper Office');
      expect(note.category).toBe('location_visited');
      expect(note.chapterId).toBe('ch1_assignment_abroad');
    });

    it('addCaseNote puts newest notes first (unshift)', () => {
      const state = createInitialMainQuestState();
      state.caseNotes = [];

      addCaseNote(state, {
        day: 1,
        text: 'First note',
        category: 'clue',
        chapterId: 'ch1_assignment_abroad',
      });
      addCaseNote(state, {
        day: 2,
        text: 'Second note',
        category: 'npc_interview',
        chapterId: 'ch1_assignment_abroad',
      });

      expect(state.caseNotes!.length).toBe(2);
      expect(state.caseNotes![0].text).toBe('Second note');
      expect(state.caseNotes![1].text).toBe('First note');
    });

    it('generates case notes for all 5 categories', () => {
      const state = createInitialMainQuestState();
      state.caseNotes = [];

      const categories: CaseNote['category'][] = [
        'clue', 'npc_interview', 'text_found', 'location_visited', 'chapter_event',
      ];

      for (const cat of categories) {
        addCaseNote(state, {
          day: 1,
          text: `Note for ${cat}`,
          category: cat,
          chapterId: 'ch1_assignment_abroad',
        });
      }

      expect(state.caseNotes!.length).toBe(5);
      const savedCategories = state.caseNotes!.map(n => n.category);
      for (const cat of categories) {
        expect(savedCategories).toContain(cat);
      }
    });
  });

  // ── ClueStore Chapter Gating ──────────────────────────────────────────────

  describe('ClueStore chapter gating', () => {
    it('allows clues from unlocked chapters', () => {
      clueStore.setAllowedChapters(['ch1_assignment_abroad', 'ch2_following_the_trail']);

      const added = clueStore.addClue({
        text: 'Found a note in the office',
        category: 'written_evidence',
        source: 'Newspaper Office',
        tags: ['writer', 'office'],
        chapterId: 'ch1_assignment_abroad',
      });

      expect(added).toBe(true);
      expect(clueStore.getClueCount()).toBe(1);
    });

    it('rejects clues from locked chapters', () => {
      clueStore.setAllowedChapters(['ch1_assignment_abroad']);

      const added = clueStore.addClue({
        text: 'Secret found in ch3',
        category: 'physical_evidence',
        source: 'Secret Room',
        tags: ['secret'],
        chapterId: 'ch3_the_inner_circle',
      });

      expect(added).toBe(false);
      expect(clueStore.getClueCount()).toBe(0);
    });

    it('allows clues with no chapterId regardless of gating', () => {
      clueStore.setAllowedChapters(['ch1_assignment_abroad']);

      const added = clueStore.addClue({
        text: 'A general observation',
        category: 'witness_testimony',
        source: 'Random NPC',
        tags: ['writer'],
        chapterId: null,
      });

      expect(added).toBe(true);
    });

    it('allows all clues when no chapters are set', () => {
      // No setAllowedChapters call — empty set
      const added = clueStore.addClue({
        text: 'Any chapter clue',
        category: 'witness_testimony',
        source: 'NPC',
        tags: [],
        chapterId: 'ch5_the_truth_emerges',
      });

      expect(added).toBe(true);
    });
  });

  // ── ClueStore Serialization (save/load) ───────────────────────────────────

  describe('ClueStore serialization round-trip', () => {
    it('serialize captures all state including chapter gating', () => {
      clueStore.setAllowedChapters(['ch1_assignment_abroad', 'ch2_following_the_trail']);
      clueStore.addClue({
        text: 'Test clue',
        category: 'witness_testimony',
        source: 'NPC',
        tags: ['writer'],
        chapterId: 'ch1_assignment_abroad',
      });
      clueStore.toggleFollowedUp(clueStore.getClues()[0].id);

      const state = clueStore.serialize();

      expect(state.clues.length).toBe(1);
      expect(state.clues[0].followedUp).toBe(true);
      expect(state.totalClueCount).toBe(12);
      expect(state.allowedChapterIds).toContain('ch1_assignment_abroad');
      expect(state.allowedChapterIds).toContain('ch2_following_the_trail');
    });

    it('restore recovers clues and chapter gating', () => {
      const savedState: ClueStoreState = {
        clues: [
          {
            id: 'clue_test',
            text: 'A saved clue',
            category: 'written_evidence',
            source: 'Book',
            discoveredAt: new Date().toISOString(),
            followedUp: true,
            tags: ['manuscript'],
            chapterId: 'ch1_assignment_abroad',
          },
        ],
        totalClueCount: 15,
        allowedChapterIds: ['ch1_assignment_abroad'],
      };

      const newStore = new ClueStore(eventBus, 5);
      newStore.restore(savedState);

      expect(newStore.getClueCount()).toBe(1);
      expect(newStore.getTotalClueCount()).toBe(15);
      expect(newStore.getClues()[0].followedUp).toBe(true);
      expect(newStore.getClues()[0].text).toBe('A saved clue');
    });

    it('restored store respects chapter gating', () => {
      const savedState: ClueStoreState = {
        clues: [],
        totalClueCount: 12,
        allowedChapterIds: ['ch1_assignment_abroad'],
      };

      clueStore.restore(savedState);

      // Allowed chapter
      const added1 = clueStore.addClue({
        text: 'Ch1 clue',
        category: 'witness_testimony',
        source: 'NPC',
        tags: [],
        chapterId: 'ch1_assignment_abroad',
      });
      expect(added1).toBe(true);

      // Locked chapter
      const added2 = clueStore.addClue({
        text: 'Ch3 clue',
        category: 'physical_evidence',
        source: 'Secret',
        tags: [],
        chapterId: 'ch3_the_inner_circle',
      });
      expect(added2).toBe(false);
    });
  });

  // ── clue_discovered event triggers ────────────────────────────────────────

  describe('clue_discovered event emission', () => {
    it('emits clue_discovered with correct counts', () => {
      const handler = vi.fn();
      eventBus.on('clue_discovered', handler);

      clueStore.addClue({
        text: 'First clue',
        category: 'witness_testimony',
        source: 'NPC1',
        tags: ['writer'],
        chapterId: null,
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'clue_discovered',
          clueCount: 1,
          totalClueCount: 12,
        }),
      );
    });

    it('does not emit for duplicate clues', () => {
      const handler = vi.fn();
      eventBus.on('clue_discovered', handler);

      const clue = {
        text: 'Same clue',
        category: 'written_evidence' as const,
        source: 'Book',
        tags: [],
        chapterId: null,
      };

      clueStore.addClue(clue);
      clueStore.addClue(clue);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('does not emit for gated clues', () => {
      const handler = vi.fn();
      eventBus.on('clue_discovered', handler);
      clueStore.setAllowedChapters(['ch1_assignment_abroad']);

      clueStore.addClue({
        text: 'Future clue',
        category: 'physical_evidence',
        source: 'Hidden',
        tags: [],
        chapterId: 'ch5_the_truth_emerges',
      });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ── Eavesdrop → ClueStore ─────────────────────────────────────────────────

  describe('eavesdrop clue discovery', () => {
    it('addEavesdropClue creates testimony when topic is investigation-relevant', () => {
      const added = clueStore.addEavesdropClue(
        'Pierre', 'Marie',
        'The missing writer left a manuscript',
      );

      expect(added).toBe(true);
      const clues = clueStore.getClues();
      expect(clues[0].category).toBe('witness_testimony');
      expect(clues[0].source).toContain('Pierre');
      expect(clues[0].source).toContain('Marie');
      expect(clues[0].tags).toContain('pierre');
      expect(clues[0].tags).toContain('marie');
    });

    it('addEavesdropClue rejects irrelevant topics', () => {
      const added = clueStore.addEavesdropClue(
        'Pierre', 'Marie',
        'The weather is nice today',
      );

      expect(added).toBe(false);
      expect(clueStore.getClueCount()).toBe(0);
    });

    it('addEavesdropClue uses custom content when provided', () => {
      const added = clueStore.addEavesdropClue(
        'Pierre', 'Marie',
        'writer secret',
        'Pierre whispered about the writer to Marie',
      );

      expect(added).toBe(true);
      expect(clueStore.getClues()[0].text).toBe('Pierre whispered about the writer to Marie');
    });
  });

  // ── ClueStore getCluesByChapter ───────────────────────────────────────────

  describe('getCluesByChapter', () => {
    it('filters clues by chapter ID', () => {
      clueStore.addClue({
        text: 'Ch1 clue', category: 'witness_testimony', source: 'A',
        tags: [], chapterId: 'ch1_assignment_abroad',
      });
      clueStore.addClue({
        text: 'Ch2 clue', category: 'written_evidence', source: 'B',
        tags: [], chapterId: 'ch2_following_the_trail',
      });
      clueStore.addClue({
        text: 'Ch1 clue 2', category: 'physical_evidence', source: 'C',
        tags: [], chapterId: 'ch1_assignment_abroad',
      });

      const ch1Clues = clueStore.getCluesByChapter('ch1_assignment_abroad');
      expect(ch1Clues.length).toBe(2);
      expect(ch1Clues.every(c => c.chapterId === 'ch1_assignment_abroad')).toBe(true);
    });
  });

  // ── Connections between clues ─────────────────────────────────────────────

  describe('clue connections for investigation board', () => {
    it('detects connections between clues sharing tags', () => {
      clueStore.addClue({
        text: 'NPC mentioned the writer', category: 'witness_testimony',
        source: 'Pierre', tags: ['writer', 'library'], chapterId: null,
      });
      clueStore.addClue({
        text: 'Found manuscript at library', category: 'written_evidence',
        source: 'Library', tags: ['manuscript', 'library'], chapterId: null,
      });
      clueStore.addClue({
        text: 'Photo of park bench', category: 'photo_evidence',
        source: 'Park', tags: ['park'], chapterId: null,
      });

      const connections = clueStore.getConnections();
      // Pierre-Library clues share 'library' tag
      expect(connections.length).toBe(1);
    });
  });
});
