/**
 * Tests for conversation quality scoring — automated metrics for quest objectives.
 */
import { describe, it, expect } from 'vitest';
import {
  tokenize,
  computeQualityGrade,
  scoreVocabularyDiversity,
  scoreResponseLength,
  scoreTargetLanguageUsage,
  scoreEngagement,
  scoreConversationFlow,
  scoreConversationQuality,
  meetsQualityThreshold,
  type ConversationTurn,
} from '../assessment/conversation-quality-scoring.js';

// ── tokenize ────────────────────────────────────────────────────────────────

describe('tokenize', () => {
  it('lowercases and splits on whitespace', () => {
    expect(tokenize('Hello World')).toEqual(['hello', 'world']);
  });

  it('strips punctuation but keeps Unicode letters', () => {
    expect(tokenize('Bonjour, le monde!')).toEqual(['bonjour', 'le', 'monde']);
  });

  it('handles accented characters', () => {
    expect(tokenize('café résumé')).toEqual(['café', 'résumé']);
  });

  it('returns empty array for empty string', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('handles hyphens and apostrophes', () => {
    expect(tokenize("aujourd'hui bien-être")).toEqual(["aujourd'hui", 'bien-être']);
  });
});

// ── computeQualityGrade ─────────────────────────────────────────────────────

describe('computeQualityGrade', () => {
  it('returns A for 90+', () => expect(computeQualityGrade(95)).toBe('A'));
  it('returns A for exactly 90', () => expect(computeQualityGrade(90)).toBe('A'));
  it('returns B for 70-89', () => expect(computeQualityGrade(75)).toBe('B'));
  it('returns C for 50-69', () => expect(computeQualityGrade(55)).toBe('C'));
  it('returns D for 30-49', () => expect(computeQualityGrade(35)).toBe('D'));
  it('returns F for <30', () => expect(computeQualityGrade(10)).toBe('F'));
});

// ── scoreVocabularyDiversity ────────────────────────────────────────────────

describe('scoreVocabularyDiversity', () => {
  it('returns 0 for empty array', () => {
    expect(scoreVocabularyDiversity([])).toBe(0);
  });

  it('returns 100 for all unique words (high TTR)', () => {
    // 5 unique out of 5 = TTR 1.0 → max score
    const words = ['je', 'suis', 'très', 'content', 'maintenant'];
    expect(scoreVocabularyDiversity(words)).toBe(100);
  });

  it('returns low score for very repetitive words', () => {
    // 1 unique out of 10 = TTR 0.1 → below floor
    const words = Array(10).fill('oui');
    expect(scoreVocabularyDiversity(words)).toBe(0);
  });

  it('returns intermediate score for moderate diversity', () => {
    // 5 unique out of 10 = TTR 0.5 → (0.5-0.3)/0.5 * 100 = 40
    const words = ['bonjour', 'le', 'monde', 'est', 'beau', 'bonjour', 'le', 'monde', 'est', 'beau'];
    const score = scoreVocabularyDiversity(words);
    expect(score).toBe(40);
  });
});

// ── scoreResponseLength ─────────────────────────────────────────────────────

describe('scoreResponseLength', () => {
  it('returns 0 for no turns', () => {
    expect(scoreResponseLength([])).toBe(0);
  });

  it('returns 20 for single-word responses', () => {
    expect(scoreResponseLength(['oui', 'non', 'bonjour'])).toBe(20);
  });

  it('returns 100 for long responses (6+ words)', () => {
    const turns = ['je suis allé au marché hier matin'];
    expect(scoreResponseLength(turns)).toBe(100);
  });

  it('returns intermediate for medium responses', () => {
    // Average 3 words → 20 + (2/5)*80 = 52
    const turns = ['je suis content', 'oui merci beaucoup'];
    const score = scoreResponseLength(turns);
    expect(score).toBeGreaterThan(40);
    expect(score).toBeLessThan(70);
  });
});

// ── scoreTargetLanguageUsage ────────────────────────────────────────────────

describe('scoreTargetLanguageUsage', () => {
  it('returns 0 for no words', () => {
    expect(scoreTargetLanguageUsage([])).toBe(0);
  });

  it('returns 100 when no vocabulary list provided', () => {
    expect(scoreTargetLanguageUsage(['hello', 'world'])).toBe(100);
  });

  it('returns 100 when all words are target language', () => {
    const vocab = new Set(['bonjour', 'monde']);
    expect(scoreTargetLanguageUsage(['bonjour', 'monde'], vocab)).toBe(100);
  });

  it('returns 50 when half words are target language', () => {
    const vocab = new Set(['bonjour']);
    expect(scoreTargetLanguageUsage(['bonjour', 'hello'], vocab)).toBe(50);
  });

  it('returns 0 when no target language words used', () => {
    const vocab = new Set(['bonjour', 'monde']);
    expect(scoreTargetLanguageUsage(['hello', 'world'], vocab)).toBe(0);
  });
});

// ── scoreEngagement ─────────────────────────────────────────────────────────

describe('scoreEngagement', () => {
  it('returns 0 for no turns', () => {
    expect(scoreEngagement(0)).toBe(0);
  });

  it('returns 20 for 1 turn', () => {
    expect(scoreEngagement(1)).toBe(20);
  });

  it('returns 100 for 5+ turns', () => {
    expect(scoreEngagement(5)).toBe(100);
    expect(scoreEngagement(10)).toBe(100);
  });

  it('returns intermediate for 3 turns', () => {
    // 20 + (2/4)*80 = 60
    expect(scoreEngagement(3)).toBe(60);
  });
});

// ── scoreConversationFlow ───────────────────────────────────────────────────

describe('scoreConversationFlow', () => {
  it('returns 0 for empty conversation', () => {
    expect(scoreConversationFlow([])).toBe(0);
  });

  it('returns 50 for single turn', () => {
    expect(scoreConversationFlow([{ role: 'player', text: 'hello' }])).toBe(50);
  });

  it('scores higher for balanced turn-taking', () => {
    const balanced: ConversationTurn[] = [
      { role: 'npc', text: 'Bonjour!' },
      { role: 'player', text: 'Bonjour, comment ça va?' },
      { role: 'npc', text: 'Très bien, merci.' },
      { role: 'player', text: 'Je suis content.' },
    ];
    const score = scoreConversationFlow(balanced);
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it('scores lower for one-sided conversation', () => {
    const oneSided: ConversationTurn[] = [
      { role: 'player', text: 'hello' },
      { role: 'player', text: 'anyone there?' },
      { role: 'player', text: 'hello??' },
      { role: 'npc', text: 'Hi!' },
    ];
    const score = scoreConversationFlow(oneSided);
    expect(score).toBeLessThan(80);
  });

  it('factors in responsiveness when timestamps present', () => {
    const now = Date.now();
    const fast: ConversationTurn[] = [
      { role: 'npc', text: 'Bonjour!', timestamp: now },
      { role: 'player', text: 'Bonjour!', timestamp: now + 2000 },
    ];
    const slow: ConversationTurn[] = [
      { role: 'npc', text: 'Bonjour!', timestamp: now },
      { role: 'player', text: 'Bonjour!', timestamp: now + 60000 },
    ];
    expect(scoreConversationFlow(fast)).toBeGreaterThan(scoreConversationFlow(slow));
  });
});

// ── scoreConversationQuality (integration) ──────────────────────────────────

describe('scoreConversationQuality', () => {
  it('returns zero scores for empty transcript', () => {
    const result = scoreConversationQuality([]);
    expect(result.overall).toBe(0);
    expect(result.grade).toBe('F');
    expect(result.playerTurnCount).toBe(0);
    expect(result.totalPlayerWords).toBe(0);
    expect(result.uniquePlayerWords).toBe(0);
  });

  it('scores a minimal conversation', () => {
    const turns: ConversationTurn[] = [
      { role: 'npc', text: 'Bonjour!' },
      { role: 'player', text: 'Bonjour' },
    ];
    const result = scoreConversationQuality(turns);
    expect(result.overall).toBeGreaterThan(0);
    expect(result.playerTurnCount).toBe(1);
    expect(result.totalPlayerWords).toBe(1);
  });

  it('scores a rich conversation highly', () => {
    const turns: ConversationTurn[] = [
      { role: 'npc', text: 'Bonjour, comment allez-vous?' },
      { role: 'player', text: 'Bonjour, je vais très bien merci' },
      { role: 'npc', text: 'Qu\'est-ce que vous faites aujourd\'hui?' },
      { role: 'player', text: 'Aujourd\'hui je visite le marché pour acheter des fruits' },
      { role: 'npc', text: 'C\'est magnifique! Quel est votre fruit préféré?' },
      { role: 'player', text: 'J\'adore les pommes et les oranges du marché local' },
      { role: 'npc', text: 'Excellent choix! Bonne journée!' },
      { role: 'player', text: 'Merci beaucoup, à bientôt et bonne journée aussi' },
      { role: 'npc', text: 'Au revoir!' },
      { role: 'player', text: 'Au revoir, à la prochaine fois' },
    ];
    const result = scoreConversationQuality(turns);
    expect(result.overall).toBeGreaterThanOrEqual(70);
    expect(result.grade).toBe('A') || expect(result.grade).toBe('B');
    expect(result.playerTurnCount).toBe(5);
  });

  it('uses target vocabulary when provided', () => {
    const turns: ConversationTurn[] = [
      { role: 'npc', text: 'What is hello in French?' },
      { role: 'player', text: 'bonjour monde' },
    ];
    const frenchVocab = new Set(['bonjour', 'monde']);
    const withVocab = scoreConversationQuality(turns, frenchVocab);

    const noMatchVocab = new Set(['hola', 'mundo']);
    const noMatch = scoreConversationQuality(turns, noMatchVocab);

    expect(withVocab.dimensions.targetLanguageUsage).toBeGreaterThan(
      noMatch.dimensions.targetLanguageUsage,
    );
  });

  it('returns all dimension scores between 0 and 100', () => {
    const turns: ConversationTurn[] = [
      { role: 'npc', text: 'Hello' },
      { role: 'player', text: 'Hi there friend' },
    ];
    const result = scoreConversationQuality(turns);
    for (const value of Object.values(result.dimensions)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });
});

// ── meetsQualityThreshold ───────────────────────────────────────────────────

describe('meetsQualityThreshold', () => {
  const makeScore = (overall: number, dims?: Partial<ConversationTurn>): any => ({
    overall,
    grade: computeQualityGrade(overall),
    dimensions: {
      vocabularyDiversity: 60,
      responseLength: 60,
      targetLanguageUsage: 80,
      engagement: 70,
      conversationFlow: 65,
      ...dims,
    },
    playerTurnCount: 3,
    totalPlayerWords: 15,
    uniquePlayerWords: 10,
  });

  it('passes when overall meets threshold', () => {
    expect(meetsQualityThreshold(makeScore(60), 50)).toBe(true);
  });

  it('fails when overall below threshold', () => {
    expect(meetsQualityThreshold(makeScore(40), 50)).toBe(false);
  });

  it('uses default threshold of 50', () => {
    expect(meetsQualityThreshold(makeScore(50))).toBe(true);
    expect(meetsQualityThreshold(makeScore(49))).toBe(false);
  });

  it('checks dimension minimums when provided', () => {
    const score = makeScore(80);
    expect(meetsQualityThreshold(score, 50, { vocabularyDiversity: 50 })).toBe(true);
    expect(meetsQualityThreshold(score, 50, { vocabularyDiversity: 90 })).toBe(false);
  });
});
