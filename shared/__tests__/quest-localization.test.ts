import { describe, it, expect } from 'vitest';
import {
  getLocalizedQuestText,
  getLocalizedObjectives,
} from '../language/quest-localization';

describe('getLocalizedQuestText', () => {
  const quest = {
    targetText: 'Trouver le boulanger',
    englishText: 'Find the baker',
  };

  it('shows English primary at A1', () => {
    const result = getLocalizedQuestText(quest, 'A1');
    expect(result.primary).toBe('Find the baker');
    expect(result.secondary).toBe('Trouver le boulanger');
    expect(result.showHoverTranslation).toBe(false);
  });

  it('shows bilingual at A2', () => {
    const result = getLocalizedQuestText(quest, 'A2');
    expect(result.primary).toContain('Trouver le boulanger');
    expect(result.primary).toContain('Find the baker');
  });

  it('shows target language with hover at B1', () => {
    const result = getLocalizedQuestText(quest, 'B1');
    expect(result.primary).toBe('Trouver le boulanger');
    expect(result.showHoverTranslation).toBe(true);
    expect(result.showToggleButton).toBe(true);
  });

  it('shows target language only at B2', () => {
    const result = getLocalizedQuestText(quest, 'B2');
    expect(result.primary).toBe('Trouver le boulanger');
    expect(result.showHoverTranslation).toBe(false);
    expect(result.showToggleButton).toBe(false);
  });

  it('falls back to target text when translation is null', () => {
    const noTranslation = { targetText: 'Trouver le boulanger', englishText: null };
    const result = getLocalizedQuestText(noTranslation, 'A1');
    expect(result.primary).toBe('Trouver le boulanger');
    expect(result.secondary).toBeUndefined();
  });
});

describe('getLocalizedObjectives', () => {
  it('returns parallel localized objectives', () => {
    const objectives = ['Parler au boulanger', 'Acheter du pain'];
    const translations = ['Talk to the baker', 'Buy some bread'];

    const results = getLocalizedObjectives(objectives, translations, 'A1');
    expect(results).toHaveLength(2);
    expect(results[0].primary).toBe('Talk to the baker');
    expect(results[0].secondary).toBe('Parler au boulanger');
    expect(results[1].primary).toBe('Buy some bread');
  });

  it('handles null translations array', () => {
    const objectives = ['Parler au boulanger'];
    const results = getLocalizedObjectives(objectives, null, 'A1');
    expect(results).toHaveLength(1);
    expect(results[0].primary).toBe('Parler au boulanger');
  });

  it('handles mismatched array lengths gracefully', () => {
    const objectives = ['Parler au boulanger', 'Acheter du pain'];
    const translations = ['Talk to the baker'];

    const results = getLocalizedObjectives(objectives, translations, 'A1');
    expect(results).toHaveLength(2);
    expect(results[0].primary).toBe('Talk to the baker');
    // Second objective has no translation
    expect(results[1].primary).toBe('Acheter du pain');
  });
});
