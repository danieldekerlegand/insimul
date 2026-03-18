/**
 * Tests for audio-level pronunciation scoring integration with NPC exams.
 *
 * Covers:
 * - scorePronunciationQuestion mapping from AudioPronunciationResult to NpcExamQuestionResult
 * - Pronunciation-specific fields on NpcExamQuestion
 * - Score scaling from 0-100 to question maxPoints
 * - Grade and fluency passthrough
 */
import { describe, it, expect } from 'vitest';
import {
  scorePronunciationQuestion,
  type NpcExamQuestion,
} from '../assessment/npc-exam-types';

function makeQuestion(overrides: Partial<NpcExamQuestion> = {}): NpcExamQuestion {
  return {
    id: 'q-1',
    prompt: 'Say "bonjour le monde"',
    expectedAnswer: 'bonjour le monde',
    maxPoints: 10,
    isPronunciation: true,
    expectedPhrase: 'bonjour le monde',
    languageHint: 'French',
    ...overrides,
  };
}

function makeAudioResult(overrides: Partial<{
  overallScore: number;
  spokenPhrase: string;
  feedback: string;
  audioWordScores: Array<{ word: string; confidence: number; pronunciationScore: number; issue?: string }>;
  fluencyScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  scoringMethod: 'audio' | 'text-fallback';
}> = {}) {
  return {
    overallScore: 85,
    spokenPhrase: 'bonjour le monde',
    feedback: 'Good pronunciation!',
    audioWordScores: [
      { word: 'bonjour', confidence: 0.95, pronunciationScore: 90 },
      { word: 'le', confidence: 1.0, pronunciationScore: 100 },
      { word: 'monde', confidence: 0.8, pronunciationScore: 70 },
    ],
    fluencyScore: 82,
    grade: 'B' as const,
    scoringMethod: 'audio' as const,
    ...overrides,
  };
}

describe('scorePronunciationQuestion', () => {
  it('maps overallScore to question maxPoints proportionally', () => {
    const q = makeQuestion({ maxPoints: 10 });
    const result = scorePronunciationQuestion(q, makeAudioResult({ overallScore: 80 }));
    expect(result.score).toBe(8); // 80% of 10
    expect(result.maxPoints).toBe(10);
  });

  it('marks correct when score >= 70', () => {
    const q = makeQuestion();
    const result = scorePronunciationQuestion(q, makeAudioResult({ overallScore: 70 }));
    expect(result.correct).toBe(true);
  });

  it('marks incorrect when score < 70', () => {
    const q = makeQuestion();
    const result = scorePronunciationQuestion(q, makeAudioResult({ overallScore: 69 }));
    expect(result.correct).toBe(false);
  });

  it('gives full points for perfect pronunciation', () => {
    const q = makeQuestion({ maxPoints: 5 });
    const result = scorePronunciationQuestion(q, makeAudioResult({ overallScore: 100 }));
    expect(result.score).toBe(5);
    expect(result.correct).toBe(true);
  });

  it('gives zero points for zero score', () => {
    const q = makeQuestion({ maxPoints: 10 });
    const result = scorePronunciationQuestion(q, makeAudioResult({ overallScore: 0 }));
    expect(result.score).toBe(0);
    expect(result.correct).toBe(false);
  });

  it('carries pronunciationData with audioWordScores', () => {
    const q = makeQuestion();
    const audioResult = makeAudioResult();
    const result = scorePronunciationQuestion(q, audioResult);

    expect(result.pronunciationData).toBeDefined();
    expect(result.pronunciationData!.audioWordScores).toHaveLength(3);
    expect(result.pronunciationData!.audioWordScores[0].word).toBe('bonjour');
    expect(result.pronunciationData!.audioWordScores[0].confidence).toBe(0.95);
    expect(result.pronunciationData!.audioWordScores[2].issue).toBeUndefined();
  });

  it('carries fluencyScore and grade', () => {
    const q = makeQuestion();
    const result = scorePronunciationQuestion(q, makeAudioResult({
      fluencyScore: 92,
      grade: 'A',
    }));

    expect(result.pronunciationData!.fluencyScore).toBe(92);
    expect(result.pronunciationData!.grade).toBe('A');
  });

  it('carries scoringMethod', () => {
    const q = makeQuestion();
    const result = scorePronunciationQuestion(q, makeAudioResult({
      scoringMethod: 'text-fallback',
    }));
    expect(result.pronunciationData!.scoringMethod).toBe('text-fallback');
  });

  it('preserves feedback as rationale', () => {
    const q = makeQuestion();
    const result = scorePronunciationQuestion(q, makeAudioResult({
      feedback: 'Watch the vowel in "monde"',
    }));
    expect(result.rationale).toBe('Watch the vowel in "monde"');
  });

  it('preserves spoken phrase as playerAnswer', () => {
    const q = makeQuestion();
    const result = scorePronunciationQuestion(q, makeAudioResult({
      spokenPhrase: 'bonjourr le mond',
    }));
    expect(result.playerAnswer).toBe('bonjourr le mond');
  });

  it('carries word-level issues when present', () => {
    const q = makeQuestion();
    const result = scorePronunciationQuestion(q, makeAudioResult({
      audioWordScores: [
        { word: 'bonjour', confidence: 0.7, pronunciationScore: 50, issue: 'vowel substitution' },
        { word: 'le', confidence: 0.9, pronunciationScore: 80 },
        { word: 'monde', confidence: 0.6, pronunciationScore: 40, issue: 'stress misplaced' },
      ],
    }));

    expect(result.pronunciationData!.audioWordScores[0].issue).toBe('vowel substitution');
    expect(result.pronunciationData!.audioWordScores[1].issue).toBeUndefined();
    expect(result.pronunciationData!.audioWordScores[2].issue).toBe('stress misplaced');
  });

  it('rounds score to nearest integer', () => {
    const q = makeQuestion({ maxPoints: 3 });
    // 85% of 3 = 2.55 → rounds to 3
    const result = scorePronunciationQuestion(q, makeAudioResult({ overallScore: 85 }));
    expect(result.score).toBe(3);
  });
});

describe('NpcExamQuestion pronunciation fields', () => {
  it('supports isPronunciation flag', () => {
    const q: NpcExamQuestion = {
      id: 'q-1',
      prompt: 'Say "hello"',
      expectedAnswer: 'hello',
      maxPoints: 5,
      isPronunciation: true,
      expectedPhrase: 'hello',
      languageHint: 'English',
    };
    expect(q.isPronunciation).toBe(true);
    expect(q.expectedPhrase).toBe('hello');
    expect(q.languageHint).toBe('English');
  });

  it('pronunciation fields are optional', () => {
    const q: NpcExamQuestion = {
      id: 'q-2',
      prompt: 'Translate "hello"',
      expectedAnswer: 'bonjour',
      maxPoints: 5,
    };
    expect(q.isPronunciation).toBeUndefined();
    expect(q.expectedPhrase).toBeUndefined();
  });
});
