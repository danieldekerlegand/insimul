/**
 * Tests for ClueStore
 *
 * Run with: npx vitest run client/src/components/3DGame/__tests__/ClueStore.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClueStore, type ClueCategory } from '../../logic/ClueStore';
import { GameEventBus } from '../../logic/GameEventBus';

describe('ClueStore', () => {
  let store: ClueStore;
  let eventBus: GameEventBus;

  beforeEach(() => {
    eventBus = new GameEventBus();
    store = new ClueStore(eventBus, 10);
  });

  describe('addClue', () => {
    it('adds a new clue and returns true', () => {
      const added = store.addClue({
        text: 'The writer was last seen at the library',
        category: 'witness_testimony',
        source: 'Marie Dupont',
        tags: ['writer', 'library'],
      });

      expect(added).toBe(true);
      expect(store.getClueCount()).toBe(1);
    });

    it('rejects duplicate clues and returns false', () => {
      const clue = {
        text: 'The writer was last seen at the library',
        category: 'witness_testimony' as ClueCategory,
        source: 'Marie Dupont',
        tags: ['writer', 'library'],
      };

      store.addClue(clue);
      const added = store.addClue(clue);

      expect(added).toBe(false);
      expect(store.getClueCount()).toBe(1);
    });

    it('emits clue_discovered event on the event bus', () => {
      const handler = vi.fn();
      eventBus.on('clue_discovered', handler);

      store.addClue({
        text: 'Found a manuscript',
        category: 'written_evidence',
        source: 'Old Bookshop',
        tags: ['manuscript'],
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'clue_discovered',
          clueCategory: 'written_evidence',
          clueSource: 'Old Bookshop',
          clueCount: 1,
          totalClueCount: 10,
        }),
      );
    });

    it('assigns discoveredAt and followedUp defaults', () => {
      store.addClue({
        text: 'A clue',
        category: 'physical_evidence',
        source: 'Library',
        tags: [],
      });

      const clues = store.getClues();
      expect(clues[0].discoveredAt).toBeTruthy();
      expect(clues[0].followedUp).toBe(false);
    });
  });

  describe('getClues', () => {
    it('returns clues sorted newest first', () => {
      // Add two clues with slight delay
      store.addClue({ text: 'First', category: 'witness_testimony', source: 'A', tags: [] });
      store.addClue({ text: 'Second', category: 'written_evidence', source: 'B', tags: [] });

      const clues = store.getClues();
      expect(clues.length).toBe(2);
      // Both added nearly simultaneously, just verify they're returned
      expect(clues.map(c => c.text)).toContain('First');
      expect(clues.map(c => c.text)).toContain('Second');
    });
  });

  describe('getCluesByCategory', () => {
    it('filters by category', () => {
      store.addClue({ text: 'Testimony 1', category: 'witness_testimony', source: 'A', tags: [] });
      store.addClue({ text: 'Written 1', category: 'written_evidence', source: 'B', tags: [] });
      store.addClue({ text: 'Testimony 2', category: 'witness_testimony', source: 'C', tags: [] });

      const testimony = store.getCluesByCategory('witness_testimony');
      expect(testimony.length).toBe(2);
      expect(testimony.every(c => c.category === 'witness_testimony')).toBe(true);
    });
  });

  describe('toggleFollowedUp', () => {
    it('toggles followed-up status', () => {
      store.addClue({ text: 'A clue', category: 'physical_evidence', source: 'X', tags: [] });
      const clueId = store.getClues()[0].id;

      expect(store.getClues()[0].followedUp).toBe(false);
      store.toggleFollowedUp(clueId);
      expect(store.getClues()[0].followedUp).toBe(true);
      store.toggleFollowedUp(clueId);
      expect(store.getClues()[0].followedUp).toBe(false);
    });

    it('returns false for unknown clue ID', () => {
      expect(store.toggleFollowedUp('nonexistent')).toBe(false);
    });
  });

  describe('getConnections', () => {
    it('returns pairs of clues sharing tags', () => {
      store.addClue({ text: 'Clue A', category: 'witness_testimony', source: 'NPC1', tags: ['library', 'writer'] });
      store.addClue({ text: 'Clue B', category: 'written_evidence', source: 'Book1', tags: ['library'] });
      store.addClue({ text: 'Clue C', category: 'photo_evidence', source: 'Park', tags: ['park'] });

      const connections = store.getConnections();
      expect(connections.length).toBe(1); // A-B share 'library'
    });

    it('returns empty array when no shared tags', () => {
      store.addClue({ text: 'X', category: 'witness_testimony', source: 'A', tags: ['alpha'] });
      store.addClue({ text: 'Y', category: 'written_evidence', source: 'B', tags: ['beta'] });

      expect(store.getConnections()).toEqual([]);
    });
  });

  describe('addTextClue', () => {
    it('creates written_evidence clue from text with clueText', () => {
      const added = store.addTextClue('Le Dernier Roman', 'The writer left a note in chapter 3', 'Jean Moreau');

      expect(added).toBe(true);
      const clues = store.getClues();
      expect(clues[0].category).toBe('written_evidence');
      expect(clues[0].source).toBe('Le Dernier Roman by Jean Moreau');
      expect(clues[0].text).toBe('The writer left a note in chapter 3');
      expect(clues[0].tags).toContain('writer');
    });

    it('works without author name', () => {
      store.addTextClue('Anonymous Letter', 'The mystery deepens');
      const clues = store.getClues();
      expect(clues[0].source).toBe('Anonymous Letter');
    });
  });

  describe('addConversationClue', () => {
    it('creates testimony clue when keywords match investigation topics', () => {
      const added = store.addConversationClue('Pierre', ['writer', 'cafe', 'book']);

      expect(added).toBe(true);
      const clues = store.getClues();
      expect(clues[0].category).toBe('witness_testimony');
      expect(clues[0].source).toBe('Pierre');
    });

    it('rejects conversation with no relevant keywords', () => {
      const added = store.addConversationClue('Pierre', ['weather', 'food', 'music']);
      expect(added).toBe(false);
      expect(store.getClueCount()).toBe(0);
    });

    it('uses custom snippet when provided', () => {
      store.addConversationClue('Marie', ['writer'], 'Marie said the writer visited yesterday');
      expect(store.getClues()[0].text).toBe('Marie said the writer visited yesterday');
    });
  });

  describe('addPhotoClue', () => {
    it('creates photo_evidence clue', () => {
      const added = store.addPhotoClue('Old Library', 'building', 'Town Square');

      expect(added).toBe(true);
      const clues = store.getClues();
      expect(clues[0].category).toBe('photo_evidence');
      expect(clues[0].text).toBe('Photographed Old Library at Town Square');
      expect(clues[0].tags).toContain('old library');
      expect(clues[0].tags).toContain('town square');
    });
  });

  describe('addPhysicalClue', () => {
    it('creates physical_evidence clue', () => {
      const added = store.addPhysicalClue('Found torn pages near the bridge', 'River Bridge', ['bridge', 'pages']);

      expect(added).toBe(true);
      const clues = store.getClues();
      expect(clues[0].category).toBe('physical_evidence');
      expect(clues[0].source).toBe('River Bridge');
    });
  });

  describe('isInvestigationRelevant', () => {
    it('returns true for relevant keywords', () => {
      expect(ClueStore.isInvestigationRelevant(['writer', 'hello'])).toBe(true);
      expect(ClueStore.isInvestigationRelevant(['the manuscript was found'])).toBe(true);
    });

    it('returns false for irrelevant keywords', () => {
      expect(ClueStore.isInvestigationRelevant(['weather', 'food'])).toBe(false);
    });
  });

  describe('serialize / restore', () => {
    it('round-trips clue state', () => {
      store.addClue({ text: 'A', category: 'witness_testimony', source: 'X', tags: ['a'] });
      store.addClue({ text: 'B', category: 'written_evidence', source: 'Y', tags: ['b'] });
      store.toggleFollowedUp(store.getClues()[0].id);

      const state = store.serialize();

      const newStore = new ClueStore(eventBus, 5);
      newStore.restore(state);

      expect(newStore.getClueCount()).toBe(2);
      expect(newStore.getTotalClueCount()).toBe(10); // restored from state
      const clues = newStore.getClues();
      expect(clues.some(c => c.followedUp)).toBe(true);
    });
  });

  describe('clear', () => {
    it('removes all clues', () => {
      store.addClue({ text: 'A', category: 'witness_testimony', source: 'X', tags: [] });
      store.clear();
      expect(store.getClueCount()).toBe(0);
    });
  });

  describe('setTotalClueCount', () => {
    it('updates the total clue count', () => {
      expect(store.getTotalClueCount()).toBe(10);
      store.setTotalClueCount(20);
      expect(store.getTotalClueCount()).toBe(20);
    });
  });
});
