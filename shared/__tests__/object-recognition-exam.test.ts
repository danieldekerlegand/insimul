import { describe, it, expect } from 'vitest';
import {
  levenshteinDistance,
  scoreObjectAnswer,
  getBusinessVocabulary,
  selectExamObjects,
  buildObjectRecognitionExam,
  scoreObjectRecognitionExam,
  BUSINESS_VOCABULARIES,
  GENERIC_VOCABULARY,
  CLOSE_MATCH_THRESHOLD,
} from '../assessment/object-recognition-exam';
import type { ObjectVocabularyItem } from '../assessment/npc-exam-types';

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('bread', 'bread')).toBe(0);
  });

  it('returns the length of the other string when one is empty', () => {
    expect(levenshteinDistance('', 'hello')).toBe(5);
    expect(levenshteinDistance('hello', '')).toBe(5);
  });

  it('returns 0 for two empty strings', () => {
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('calculates single character difference', () => {
    expect(levenshteinDistance('bread', 'bead')).toBe(1);
  });

  it('calculates substitution distance', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1);
  });

  it('calculates insertion distance', () => {
    expect(levenshteinDistance('pan', 'pain')).toBe(1);
  });

  it('calculates larger distances', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
  });

  it('is symmetric', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(levenshteinDistance('xyz', 'abc'));
  });
});

describe('scoreObjectAnswer', () => {
  const maxPoints = 2;

  it('gives full points for exact match', () => {
    const result = scoreObjectAnswer('bread', 'bread', maxPoints);
    expect(result.score).toBe(maxPoints);
    expect(result.matchType).toBe('exact');
    expect(result.distance).toBe(0);
  });

  it('is case-insensitive', () => {
    const result = scoreObjectAnswer('Bread', 'bread', maxPoints);
    expect(result.score).toBe(maxPoints);
    expect(result.matchType).toBe('exact');
  });

  it('trims whitespace', () => {
    const result = scoreObjectAnswer('  bread  ', 'bread', maxPoints);
    expect(result.score).toBe(maxPoints);
    expect(result.matchType).toBe('exact');
  });

  it('gives partial points for close match (distance <= 2)', () => {
    // "berad" is distance 2 from "bread" (transposition-like)
    const result = scoreObjectAnswer('bred', 'bread', maxPoints);
    expect(result.matchType).toBe('close');
    expect(result.score).toBe(Math.ceil(maxPoints / 2));
    expect(result.distance).toBeLessThanOrEqual(CLOSE_MATCH_THRESHOLD);
  });

  it('gives 0 for wrong answer', () => {
    const result = scoreObjectAnswer('chair', 'bread', maxPoints);
    expect(result.score).toBe(0);
    expect(result.matchType).toBe('wrong');
  });

  it('gives 0 for empty answer', () => {
    const result = scoreObjectAnswer('', 'bread', maxPoints);
    expect(result.score).toBe(0);
    expect(result.matchType).toBe('wrong');
  });

  it('works with 3 max points', () => {
    const result = scoreObjectAnswer('bred', 'bread', 3);
    expect(result.matchType).toBe('close');
    expect(result.score).toBe(2); // ceil(3/2) = 2
    expect(result.maxScore).toBe(3);
  });
});

describe('getBusinessVocabulary', () => {
  it('returns vocabulary for known business types', () => {
    const vocab = getBusinessVocabulary('bakery');
    expect(vocab.businessType).toBe('bakery');
    expect(vocab.objects.length).toBeGreaterThan(0);
  });

  it('returns generic vocabulary for unknown types', () => {
    const vocab = getBusinessVocabulary('spaceship');
    expect(vocab).toBe(GENERIC_VOCABULARY);
  });

  it('returns generic vocabulary when no type given', () => {
    const vocab = getBusinessVocabulary(undefined);
    expect(vocab).toBe(GENERIC_VOCABULARY);
  });

  it('is case-insensitive', () => {
    const vocab = getBusinessVocabulary('BAKERY');
    expect(vocab.businessType).toBe('bakery');
  });

  it('maps aliases to the same vocabulary', () => {
    const forge = getBusinessVocabulary('forge');
    const workshop = getBusinessVocabulary('workshop');
    const blacksmith = getBusinessVocabulary('blacksmith');
    expect(forge.objects).toEqual(blacksmith.objects);
    expect(workshop.objects).toEqual(blacksmith.objects);
  });
});

describe('selectExamObjects', () => {
  it('returns the requested number of objects', () => {
    const vocab = getBusinessVocabulary('bakery');
    const selected = selectExamObjects(vocab, 3);
    expect(selected).toHaveLength(3);
  });

  it('does not exceed available objects', () => {
    const smallVocab = {
      businessType: 'test',
      objects: [
        { key: 'a', englishName: 'A', category: 'furniture' as const },
        { key: 'b', englishName: 'B', category: 'furniture' as const },
      ],
    };
    const selected = selectExamObjects(smallVocab, 5);
    expect(selected).toHaveLength(2);
  });

  it('returns unique objects', () => {
    const vocab = getBusinessVocabulary('restaurant');
    const selected = selectExamObjects(vocab, 5);
    const keys = selected.map((o) => o.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('buildObjectRecognitionExam', () => {
  it('creates a valid assessment definition for A1', () => {
    const { definition, selectedObjects } = buildObjectRecognitionExam(
      'bakery', 'A1', 'French', 'Marie',
    );
    expect(definition.id).toContain('npc_obj_recog_bakery');
    expect(definition.type).toBe('periodic');
    expect(definition.phases).toHaveLength(1);
    expect(selectedObjects).toHaveLength(3); // A1 = 3 questions
    expect(definition.phases[0].tasks).toHaveLength(3);
    expect(definition.totalMaxPoints).toBe(6); // 3 * 2 points
  });

  it('creates more questions for higher CEFR levels', () => {
    const a1 = buildObjectRecognitionExam('shop', 'A1', 'Spanish', 'Carlos');
    const b1 = buildObjectRecognitionExam('shop', 'B1', 'Spanish', 'Carlos');
    expect(b1.selectedObjects.length).toBeGreaterThan(a1.selectedObjects.length);
  });

  it('uses higher points per question for B1/B2', () => {
    const a1 = buildObjectRecognitionExam('shop', 'A1', 'Spanish', 'Carlos');
    const b2 = buildObjectRecognitionExam('shop', 'B2', 'Spanish', 'Carlos');
    const a1PointsPerQ = a1.definition.totalMaxPoints / a1.selectedObjects.length;
    const b2PointsPerQ = b2.definition.totalMaxPoints / b2.selectedObjects.length;
    expect(b2PointsPerQ).toBeGreaterThan(a1PointsPerQ);
  });

  it('falls back to generic vocabulary for unknown business type', () => {
    const { definition } = buildObjectRecognitionExam(
      'alien_base', 'A1', 'French', 'Jean',
    );
    expect(definition.id).toContain('npc_obj_recog_alien_base');
    expect(definition.phases[0].tasks.length).toBeGreaterThan(0);
  });

  it('includes NPC name in task prompts', () => {
    const { definition } = buildObjectRecognitionExam(
      'bakery', 'A1', 'French', 'Marie',
    );
    expect(definition.phases[0].tasks[0].prompt).toContain('Marie');
  });

  it('includes target language in description', () => {
    const { definition } = buildObjectRecognitionExam(
      'bakery', 'A1', 'French', 'Marie',
    );
    expect(definition.description).toContain('French');
  });
});

describe('scoreObjectRecognitionExam', () => {
  const objects: ObjectVocabularyItem[] = [
    { key: 'bread', englishName: 'bread', category: 'food' },
    { key: 'oven', englishName: 'oven', category: 'equipment' },
    { key: 'flour', englishName: 'flour', category: 'food' },
  ];

  it('scores all correct answers', () => {
    const { results, totalScore, totalMaxScore } = scoreObjectRecognitionExam(
      objects,
      ['pain', 'four', 'farine'],
      ['pain', 'four', 'farine'],
      'A1',
    );
    expect(results).toHaveLength(3);
    expect(totalScore).toBe(totalMaxScore);
    expect(results.every((r) => r.matchType === 'exact')).toBe(true);
  });

  it('scores all wrong answers as 0', () => {
    const { results, totalScore } = scoreObjectRecognitionExam(
      objects,
      ['xyz', 'abc', 'def'],
      ['pain', 'four', 'farine'],
      'A1',
    );
    expect(totalScore).toBe(0);
    expect(results.every((r) => r.matchType === 'wrong')).toBe(true);
  });

  it('scores a mix of correct, close, and wrong', () => {
    const { results, totalScore } = scoreObjectRecognitionExam(
      objects,
      ['pain', 'fur', 'xyz'],  // exact, close (1 off from 'four'), wrong
      ['pain', 'four', 'farine'],
      'A1',
    );
    expect(results[0].matchType).toBe('exact');
    expect(results[1].matchType).toBe('close');
    expect(results[2].matchType).toBe('wrong');
    expect(totalScore).toBe(2 + 1 + 0); // full + half + 0
  });

  it('sets objectKey on each result', () => {
    const { results } = scoreObjectRecognitionExam(
      objects,
      ['pain', 'four', 'farine'],
      ['pain', 'four', 'farine'],
      'A1',
    );
    expect(results[0].objectKey).toBe('bread');
    expect(results[1].objectKey).toBe('oven');
    expect(results[2].objectKey).toBe('flour');
  });

  it('handles missing player answers gracefully', () => {
    const { results } = scoreObjectRecognitionExam(
      objects,
      ['pain'], // only 1 answer for 3 objects
      ['pain', 'four', 'farine'],
      'A1',
    );
    expect(results).toHaveLength(3);
    expect(results[0].matchType).toBe('exact');
    expect(results[1].score).toBe(0); // empty string = wrong
    expect(results[2].score).toBe(0);
  });
});

describe('BUSINESS_VOCABULARIES', () => {
  it('has vocabularies for all expected business types', () => {
    const expectedTypes = [
      'bakery', 'restaurant', 'blacksmith', 'shop', 'bar',
      'tavern', 'grocery', 'hospital', 'school',
    ];
    for (const type of expectedTypes) {
      expect(BUSINESS_VOCABULARIES[type]).toBeDefined();
      expect(BUSINESS_VOCABULARIES[type].objects.length).toBeGreaterThan(0);
    }
  });

  it('all objects have required fields', () => {
    for (const [, vocab] of Object.entries(BUSINESS_VOCABULARIES)) {
      for (const obj of vocab.objects) {
        expect(obj.key).toBeTruthy();
        expect(obj.englishName).toBeTruthy();
        expect(obj.category).toBeTruthy();
      }
    }
  });
});
