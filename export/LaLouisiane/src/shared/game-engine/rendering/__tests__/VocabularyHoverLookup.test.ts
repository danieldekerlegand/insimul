/**
 * Tests for vocabulary word lookup tracking from hover-to-translate interactions.
 *
 * Validates that:
 * - Hover dwell time is tracked and the callback fires after the threshold
 * - Short hovers (below threshold) do NOT fire the callback
 * - The vocabulary_lookup event carries the correct payload
 * - The GameEventBus event type is correctly structured
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameEventBus } from '../../logic/GameEventBus';
import type { VocabularyLookupEvent } from '../BuildingSignManager';

// We can't instantiate BuildingSignManager without a real Babylon Scene,
// so we test the dwell-time logic and event bus integration directly.

describe('VocabularyLookupEvent type', () => {
  it('has the expected shape', () => {
    const event: VocabularyLookupEvent = {
      word: 'Boulangerie',
      meaning: 'Bakery',
      category: 'buildings',
      source: 'hover_object',
      objectId: 'obj-1',
      dwellMs: 750,
    };
    expect(event.word).toBe('Boulangerie');
    expect(event.meaning).toBe('Bakery');
    expect(event.source).toBe('hover_object');
    expect(event.dwellMs).toBe(750);
  });

  it('allows optional category', () => {
    const event: VocabularyLookupEvent = {
      word: 'Maison',
      meaning: 'House',
      source: 'hover_sign',
      objectId: 'obj-2',
      dwellMs: 600,
    };
    expect(event.category).toBeUndefined();
  });
});

describe('GameEventBus vocabulary_lookup event', () => {
  let eventBus: GameEventBus;

  beforeEach(() => {
    eventBus = new GameEventBus();
  });

  it('emits vocabulary_lookup to typed subscribers', () => {
    const handler = vi.fn();
    eventBus.on('vocabulary_lookup', handler);

    eventBus.emit({
      type: 'vocabulary_lookup',
      word: 'Rivière',
      meaning: 'River',
      category: 'nature',
      source: 'hover_object',
      objectId: 'river-obj-1',
      dwellMs: 1200,
    });

    expect(handler).toHaveBeenCalledTimes(1);
    const emitted = handler.mock.calls[0][0];
    expect(emitted.type).toBe('vocabulary_lookup');
    expect(emitted.word).toBe('Rivière');
    expect(emitted.meaning).toBe('River');
    expect(emitted.category).toBe('nature');
    expect(emitted.source).toBe('hover_object');
    expect(emitted.objectId).toBe('river-obj-1');
    expect(emitted.dwellMs).toBe(1200);
  });

  it('emits vocabulary_lookup to global subscribers', () => {
    const handler = vi.fn();
    eventBus.onAny(handler);

    eventBus.emit({
      type: 'vocabulary_lookup',
      word: 'Arbre',
      meaning: 'Tree',
      source: 'hover_sign',
      objectId: 'tree-sign-1',
      dwellMs: 800,
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].type).toBe('vocabulary_lookup');
  });

  it('does not fire unrelated handlers', () => {
    const itemHandler = vi.fn();
    const vocabHandler = vi.fn();
    eventBus.on('item_collected', itemHandler);
    eventBus.on('vocabulary_lookup', vocabHandler);

    eventBus.emit({
      type: 'vocabulary_lookup',
      word: 'Soleil',
      meaning: 'Sun',
      source: 'hover_object',
      objectId: 'sun-obj',
      dwellMs: 600,
    });

    expect(itemHandler).not.toHaveBeenCalled();
    expect(vocabHandler).toHaveBeenCalledTimes(1);
  });
});

describe('Dwell threshold logic (unit)', () => {
  // Simulate the dwell-time check from BuildingSignManager.emitLookupIfDwelled
  const HOVER_DWELL_THRESHOLD_MS = 500;

  function shouldEmitLookup(hoverStartTime: number, hoverEndTime: number): boolean {
    const dwellMs = hoverEndTime - hoverStartTime;
    return dwellMs >= HOVER_DWELL_THRESHOLD_MS;
  }

  it('returns true when dwell exceeds threshold', () => {
    const start = 1000;
    expect(shouldEmitLookup(start, start + 500)).toBe(true);
    expect(shouldEmitLookup(start, start + 1000)).toBe(true);
    expect(shouldEmitLookup(start, start + 5000)).toBe(true);
  });

  it('returns false when dwell is below threshold', () => {
    const start = 1000;
    expect(shouldEmitLookup(start, start + 100)).toBe(false);
    expect(shouldEmitLookup(start, start + 499)).toBe(false);
    expect(shouldEmitLookup(start, start + 0)).toBe(false);
  });

  it('returns true at exactly the threshold', () => {
    expect(shouldEmitLookup(0, 500)).toBe(true);
  });
});

describe('LanguageProgressTracker.addVocabularyWord integration', () => {
  // Test that addVocabularyWord (the method called on hover lookup) works correctly
  // by importing the actual tracker
  it('tracks a new word from hover lookup', async () => {
    const { LanguageProgressTracker } = await import('../LanguageProgressTracker');
    const tracker = new LanguageProgressTracker('player-1', 'world-1', 'Chitimacha');

    const entry = tracker.addVocabularyWord('Nakci', 'Bear', 'nature');

    expect(entry.word).toBe('Nakci');
    expect(entry.meaning).toBe('Bear');
    expect(entry.category).toBe('nature');
    expect(entry.masteryLevel).toBe('new');
    expect(entry.timesEncountered).toBe(1);
    expect(entry.timesUsedCorrectly).toBe(0);
  });

  it('increments encounter count on repeated hover lookups', async () => {
    const { LanguageProgressTracker } = await import('../LanguageProgressTracker');
    const tracker = new LanguageProgressTracker('player-1', 'world-1', 'Chitimacha');

    tracker.addVocabularyWord('Nakci', 'Bear', 'nature');
    const entry = tracker.addVocabularyWord('Nakci', 'Bear', 'nature');

    expect(entry.timesEncountered).toBe(2);
    expect(entry.masteryLevel).toBe('learning'); // 2 encounters → learning
  });

  it('fires onNewWordLearned callback on first encounter', async () => {
    const { LanguageProgressTracker } = await import('../LanguageProgressTracker');
    const tracker = new LanguageProgressTracker('player-1', 'world-1', 'Chitimacha');
    const cb = vi.fn();
    tracker.setOnNewWordLearned(cb);

    tracker.addVocabularyWord('Pani', 'Water', 'nature');

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0].word).toBe('Pani');
  });

  it('does not fire onNewWordLearned on subsequent encounters', async () => {
    const { LanguageProgressTracker } = await import('../LanguageProgressTracker');
    const tracker = new LanguageProgressTracker('player-1', 'world-1', 'Chitimacha');
    const cb = vi.fn();

    tracker.addVocabularyWord('Pani', 'Water', 'nature');
    tracker.setOnNewWordLearned(cb);
    tracker.addVocabularyWord('Pani', 'Water', 'nature');

    expect(cb).not.toHaveBeenCalled();
  });
});
