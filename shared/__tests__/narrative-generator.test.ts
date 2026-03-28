import { describe, it, expect } from 'vitest';
import { generateNarrative, type NarrativeGeneratorInput } from '../narrative/narrative-generator';

const BASE_INPUT: NarrativeGeneratorInput = {
  worldId: 'test-world-123',
  targetLanguage: 'french',
  writerName: { firstName: 'Emile', lastName: 'Beaumont', fullName: 'Emile Beaumont' },
  settlementNames: ['Bayou Blanc', 'Petit Marais'],
  npcNames: ['Jean Dupont', 'Marie Leclair'],
};

describe('generateNarrative', () => {
  it('returns a complete NarrativeIR structure', () => {
    const result = generateNarrative(BASE_INPUT);
    expect(result.writerName).toBe('Emile Beaumont');
    expect(result.writerFirstName).toBe('Emile');
    expect(result.writerLastName).toBe('Beaumont');
    expect(result.writerBackstory).toBeTruthy();
    expect(result.disappearanceReason).toBeTruthy();
    expect(result.finalRevelation).toBeTruthy();
    expect(result.chapters).toHaveLength(6);
    expect(result.redHerrings).toHaveLength(3);
  });

  it('resolves {WRITER} placeholders in narrative text', () => {
    const result = generateNarrative(BASE_INPUT);
    expect(result.writerBackstory).toContain('Emile Beaumont');
    expect(result.writerBackstory).not.toContain('{WRITER}');
    expect(result.disappearanceReason).not.toContain('{WRITER}');
    expect(result.finalRevelation).not.toContain('{WRITER}');
    for (const ch of result.chapters) {
      expect(ch.introNarrative).not.toContain('{WRITER}');
      expect(ch.outroNarrative).not.toContain('{WRITER}');
    }
  });

  it('each chapter has intro/outro narratives and mystery details', () => {
    const result = generateNarrative(BASE_INPUT);
    for (const ch of result.chapters) {
      expect(ch.chapterId).toBeTruthy();
      expect(ch.chapterNumber).toBeGreaterThanOrEqual(1);
      expect(ch.chapterNumber).toBeLessThanOrEqual(6);
      expect(ch.title).toBeTruthy();
      expect(ch.introNarrative).toBeTruthy();
      expect(ch.outroNarrative).toBeTruthy();
      expect(ch.mysteryDetails).toBeTruthy();
      expect(ch.clueDescriptions.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('each clue has an id, text, and at least one reference', () => {
    const result = generateNarrative(BASE_INPUT);
    for (const ch of result.chapters) {
      for (const clue of ch.clueDescriptions) {
        expect(clue.clueId).toBeTruthy();
        expect(clue.text).toBeTruthy();
        expect(clue.locationId || clue.npcRole).toBeTruthy();
      }
    }
  });

  it('red herrings have description and source', () => {
    const result = generateNarrative(BASE_INPUT);
    for (const rh of result.redHerrings) {
      expect(rh.description).toBeTruthy();
      expect(rh.source).toBeTruthy();
    }
  });

  it('produces deterministic output for same worldId', () => {
    const result1 = generateNarrative(BASE_INPUT);
    const result2 = generateNarrative(BASE_INPUT);
    expect(result1.writerBackstory).toBe(result2.writerBackstory);
    expect(result1.disappearanceReason).toBe(result2.disappearanceReason);
    expect(result1.finalRevelation).toBe(result2.finalRevelation);
    expect(result1.chapters[0].mysteryDetails).toBe(result2.chapters[0].mysteryDetails);
  });

  it('produces different output for different worldIds', () => {
    const result1 = generateNarrative(BASE_INPUT);
    const result2 = generateNarrative({ ...BASE_INPUT, worldId: 'different-world-456' });
    // At least some field should differ (backstory or revelation)
    const differs = result1.writerBackstory !== result2.writerBackstory
      || result1.disappearanceReason !== result2.disappearanceReason
      || result1.finalRevelation !== result2.finalRevelation;
    expect(differs).toBe(true);
  });

  it('resolves {SETTLEMENT} placeholders', () => {
    const result = generateNarrative(BASE_INPUT);
    // Check that mystery details don't contain unresolved placeholders
    for (const ch of result.chapters) {
      expect(ch.mysteryDetails).not.toContain('{SETTLEMENT}');
    }
  });
});
