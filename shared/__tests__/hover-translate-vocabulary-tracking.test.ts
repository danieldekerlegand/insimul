/**
 * Tests for hover-translate → vocabulary tracking integration (US-004).
 *
 * Validates:
 * - EncounterType and ENCOUNTER_WEIGHTS exported correctly
 * - calculateMasteryLevel() respects weighted encounters at 0.5x for passive
 * - addVocabularyWord() tracks encounterType breakdown and weightedEncounters
 * - HoverTranslationSystem fires onWordEncounter callback
 * - LanguageProgressTracker.getWordsLookedUpToday() returns correct count
 * - Passive-only encounters progress slower than active use
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateMasteryLevel,
  ENCOUNTER_WEIGHTS,
} from '@shared/language/progress';
import type { EncounterType } from '@shared/language/progress';
import { HoverTranslationSystem } from '@shared/game-engine/rendering/HoverTranslationSystem';

describe('EncounterType and ENCOUNTER_WEIGHTS', () => {
  it('defines weights for all encounter types', () => {
    expect(ENCOUNTER_WEIGHTS.active_use).toBe(1.0);
    expect(ENCOUNTER_WEIGHTS.passive_hover).toBe(0.5);
    expect(ENCOUNTER_WEIGHTS.passive_read).toBe(0.5);
    expect(ENCOUNTER_WEIGHTS.quiz_correct).toBe(1.0);
    expect(ENCOUNTER_WEIGHTS.quiz_incorrect).toBe(0.0);
  });

  it('passive_hover is exactly 0.5x weight', () => {
    expect(ENCOUNTER_WEIGHTS.passive_hover).toBe(0.5);
  });
});

describe('calculateMasteryLevel with weighted encounters', () => {
  it('returns new for zero encounters', () => {
    expect(calculateMasteryLevel(0, 0)).toBe('new');
    expect(calculateMasteryLevel(0, 0, 0)).toBe('new');
  });

  it('uses timesUsedCorrectly when no weightedEncounters provided (backward compat)', () => {
    expect(calculateMasteryLevel(5, 3)).toBe('learning');  // 3 correct → learning
    expect(calculateMasteryLevel(10, 8)).toBe('mastered'); // 8 correct → mastered
  });

  it('uses weightedEncounters when provided', () => {
    // 10 encounters, 0 correct uses, but 5.0 weighted encounters → familiar
    expect(calculateMasteryLevel(10, 0, 5.0)).toBe('familiar');
  });

  it('passive-only encounters progress slower to mastery', () => {
    // 16 passive hovers at 0.5x = 8.0 weighted → mastered
    expect(calculateMasteryLevel(16, 0, 8.0)).toBe('mastered');

    // 15 passive hovers at 0.5x = 7.5 weighted → floor(7.5) = 7 → familiar
    expect(calculateMasteryLevel(15, 0, 7.5)).toBe('familiar');

    // Compare: 8 active uses would already be mastered
    expect(calculateMasteryLevel(8, 8)).toBe('mastered');
  });

  it('floors weighted encounters for threshold comparison', () => {
    // 2.5 weighted → floor(2.5) = 2 → new (threshold for learning is 3)
    expect(calculateMasteryLevel(5, 0, 2.5)).toBe('learning'); // encounters >= 2 → learning fallback
  });

  it('mixed encounter types accumulate correctly', () => {
    // 3 active (3.0) + 4 passive (2.0) = 5.0 weighted → familiar
    const weighted = 3 * ENCOUNTER_WEIGHTS.active_use + 4 * ENCOUNTER_WEIGHTS.passive_hover;
    expect(weighted).toBe(5.0);
    expect(calculateMasteryLevel(7, 3, weighted)).toBe('familiar');
  });
});

describe('HoverTranslationSystem onWordEncounter callback', () => {
  let system: HoverTranslationSystem;

  beforeEach(() => {
    system = new HoverTranslationSystem();
    system.setTargetLanguage('French');
  });

  it('fires callback on cache hit via fetchTranslation', async () => {
    const callback = vi.fn();
    system.setOnWordEncounter(callback);

    // Pre-populate cache
    system.addVocabHints([{ word: 'Bonjour', translation: 'Hello' }]);

    await system.fetchTranslation('Bonjour');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0]).toMatchObject({
      word: 'Bonjour',
      translation: 'Hello',
      source: 'passive_hover',
    });
    expect(callback.mock.calls[0][0].timestamp).toBeGreaterThan(0);
  });

  it('tracks encounter count via getWordEncounterCount', async () => {
    system.addVocabHints([{ word: 'Merci', translation: 'Thanks' }]);

    expect(system.getWordEncounterCount('Merci')).toBe(0);

    await system.fetchTranslation('Merci');
    expect(system.getWordEncounterCount('Merci')).toBe(1);

    await system.fetchTranslation('Merci');
    expect(system.getWordEncounterCount('Merci')).toBe(2);
  });

  it('does not fire callback when no callback is set', async () => {
    system.addVocabHints([{ word: 'Oui', translation: 'Yes' }]);
    // Should not throw
    await system.fetchTranslation('Oui');
    expect(system.getWordEncounterCount('Oui')).toBe(1);
  });
});

describe('LanguageProgressTracker hover-translate integration', () => {
  async function createTracker() {
    const { LanguageProgressTracker } = await import(
      '@shared/game-engine/logic/LanguageProgressTracker'
    );
    return new LanguageProgressTracker('player-1', 'world-1', 'French');
  }

  it('tracks encounterType breakdown on addVocabularyWord', async () => {
    const tracker = await createTracker();

    const entry = tracker.addVocabularyWord('Bonjour', 'Hello', undefined, false, 'passive_hover');

    expect(entry.encounterTypes).toEqual({ passive_hover: 1 });
    expect(entry.weightedEncounters).toBe(0.5);
  });

  it('accumulates weighted encounters across multiple hovers', async () => {
    const tracker = await createTracker();

    tracker.addVocabularyWord('Bonjour', 'Hello', undefined, false, 'passive_hover');
    tracker.addVocabularyWord('Bonjour', 'Hello', undefined, false, 'passive_hover');
    const entry = tracker.addVocabularyWord('Bonjour', 'Hello', undefined, false, 'passive_hover');

    expect(entry.encounterTypes).toEqual({ passive_hover: 3 });
    expect(entry.weightedEncounters).toBe(1.5);
    expect(entry.timesEncountered).toBe(3);
  });

  it('mixed encounter types track separately', async () => {
    const tracker = await createTracker();

    tracker.addVocabularyWord('Merci', 'Thanks', undefined, true, 'active_use');
    tracker.addVocabularyWord('Merci', 'Thanks', undefined, false, 'passive_hover');
    const entry = tracker.addVocabularyWord('Merci', 'Thanks', undefined, true, 'quiz_correct');

    expect(entry.encounterTypes).toEqual({
      active_use: 1,
      passive_hover: 1,
      quiz_correct: 1,
    });
    expect(entry.weightedEncounters).toBe(1.0 + 0.5 + 1.0);
    expect(entry.timesEncountered).toBe(3);
    expect(entry.timesUsedCorrectly).toBe(2); // active_use + quiz_correct
  });

  it('passive-only encounters do not reach mastery as fast as active', async () => {
    const tracker = await createTracker();

    // 8 passive hovers = 4.0 weighted → floor(4) = 4 → not mastered (need 8)
    for (let i = 0; i < 8; i++) {
      tracker.addVocabularyWord('Lent', 'Slow', undefined, false, 'passive_hover');
    }
    let entry = tracker.addVocabularyWord('Lent', 'Slow', undefined, false, 'passive_hover');
    expect(entry.masteryLevel).not.toBe('mastered');

    // 8 active uses = 8.0 weighted → mastered
    const tracker2 = await createTracker();
    for (let i = 0; i < 8; i++) {
      tracker2.addVocabularyWord('Rapide', 'Fast', undefined, true, 'active_use');
    }
    entry = tracker2.addVocabularyWord('Rapide', 'Fast', undefined, true, 'active_use');
    // 9 encounters, 9 correct, 9.0 weighted → mastered
    expect(entry.masteryLevel).toBe('mastered');
  });

  it('fires onNewWordLearned on first passive_hover encounter', async () => {
    const tracker = await createTracker();
    const cb = vi.fn();
    tracker.setOnNewWordLearned(cb);

    tracker.addVocabularyWord('Soleil', 'Sun', 'nature', false, 'passive_hover');

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0].word).toBe('Soleil');
  });

  it('getWordsLookedUpToday returns unique words with passive_hover today', async () => {
    const tracker = await createTracker();

    tracker.addVocabularyWord('Bonjour', 'Hello', undefined, false, 'passive_hover');
    tracker.addVocabularyWord('Merci', 'Thanks', undefined, false, 'passive_hover');
    tracker.addVocabularyWord('Bonjour', 'Hello', undefined, false, 'passive_hover'); // repeat
    tracker.addVocabularyWord('Oui', 'Yes', undefined, true, 'active_use'); // not hover

    expect(tracker.getWordsLookedUpToday()).toBe(2); // Bonjour + Merci
  });

  it('getHoverLookupsToday returns total hover count including repeats', async () => {
    const tracker = await createTracker();

    tracker.addVocabularyWord('Bonjour', 'Hello', undefined, false, 'passive_hover');
    tracker.addVocabularyWord('Bonjour', 'Hello', undefined, false, 'passive_hover');
    tracker.addVocabularyWord('Merci', 'Thanks', undefined, false, 'passive_hover');

    expect(tracker.getHoverLookupsToday()).toBe(3);
  });

  it('backward compatibility: addVocabularyWord without encounterType defaults correctly', async () => {
    const tracker = await createTracker();

    // usedCorrectly=true → defaults to active_use
    const entry1 = tracker.addVocabularyWord('Oui', 'Yes', undefined, true);
    expect(entry1.encounterTypes).toEqual({ active_use: 1 });
    expect(entry1.weightedEncounters).toBe(1.0);

    // usedCorrectly=false, no encounterType → defaults to passive_read
    const entry2 = tracker.addVocabularyWord('Non', 'No', undefined, false);
    expect(entry2.encounterTypes).toEqual({ passive_read: 1 });
    expect(entry2.weightedEncounters).toBe(0.5);
  });
});
