import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageProgressTracker } from '../LanguageProgressTracker';
import type { WorldLanguageContext } from '@shared/language/language-utils';

function makeContext(sampleWords: Record<string, string>): WorldLanguageContext {
  return {
    targetLanguage: 'Testlang',
    primaryLanguage: {
      id: 'lang1',
      name: 'Testlang',
      description: 'A test language',
      sampleWords,
      grammarRules: [],
    } as any,
    playerProficiency: {
      overallFluency: 0,
      vocabularyCount: 0,
      masteredWordCount: 0,
      weakGrammarPatterns: [],
      strongGrammarPatterns: [],
      conversationCount: 0,
    },
    reviewWords: [],
  };
}

describe('LanguageProgressTracker', () => {
  let tracker: LanguageProgressTracker;

  beforeEach(() => {
    tracker = new LanguageProgressTracker('player1', 'world1', 'Testlang');
    tracker.setWorldLanguageContext(
      makeContext({
        hello: 'kali',
        water: 'akwa',
        friend: 'amiku',
        tree: 'arbo',
      }),
    );
    tracker.startConversation('npc1', 'Merchant');
  });

  describe('analyzeNPCResponse', () => {
    it('captures words from NPC response', () => {
      const newWords = tracker.analyzeNPCResponse('Welcome! kali, traveler.');
      expect(newWords).toHaveLength(1);
      expect(newWords[0].word).toBe('kali');
      expect(newWords[0].meaning).toBe('hello');
    });

    it('captures words case-insensitively', () => {
      const newWords = tracker.analyzeNPCResponse('Welcome! Kali, traveler.');
      expect(newWords).toHaveLength(1);
      expect(newWords[0].word).toBe('kali');
    });

    it('captures multiple words in one response', () => {
      const newWords = tracker.analyzeNPCResponse('kali! Would you like some akwa?');
      expect(newWords).toHaveLength(2);
      const words = newWords.map(w => w.word).sort();
      expect(words).toEqual(['akwa', 'kali']);
    });

    it('does not match partial words (word boundary detection)', () => {
      const newWords = tracker.analyzeNPCResponse('The kalibration is complete.');
      expect(newWords).toHaveLength(0);
    });

    it('captures words at the start of text', () => {
      const newWords = tracker.analyzeNPCResponse('kali traveler!');
      expect(newWords).toHaveLength(1);
      expect(newWords[0].word).toBe('kali');
    });

    it('captures words at the end of text', () => {
      const newWords = tracker.analyzeNPCResponse('Welcome kali');
      expect(newWords).toHaveLength(1);
      expect(newWords[0].word).toBe('kali');
    });

    it('captures words followed by punctuation', () => {
      const newWords = tracker.analyzeNPCResponse('Say kali!');
      expect(newWords).toHaveLength(1);
      expect(newWords[0].word).toBe('kali');
    });

    it('captures words in parentheses', () => {
      const newWords = tracker.analyzeNPCResponse('Greeting (kali) to you');
      expect(newWords).toHaveLength(1);
      expect(newWords[0].word).toBe('kali');
    });

    it('increments encounter count for already-known words', () => {
      tracker.analyzeNPCResponse('kali traveler');
      const secondResult = tracker.analyzeNPCResponse('kali again!');
      // Second time, the word is already known so it gets updated, not returned as new
      expect(secondResult).toHaveLength(0);
      const vocab = tracker.getVocabulary();
      const kali = vocab.find(v => v.word === 'kali');
      expect(kali?.timesEncountered).toBe(2);
    });

    it('returns empty for response with no target language words', () => {
      const newWords = tracker.analyzeNPCResponse('Welcome to our village, traveler.');
      expect(newWords).toHaveLength(0);
    });
  });

  describe('analyzePlayerMessage', () => {
    it('captures words from player message', () => {
      // First learn the word from NPC
      tracker.analyzeNPCResponse('kali traveler');
      const usages = tracker.analyzePlayerMessage('kali amiku!');
      // kali is already learned, amiku is new via sampleWords
      expect(usages.length).toBeGreaterThanOrEqual(1);
      const words = usages.map(u => u.word);
      expect(words).toContain('kali');
    });

    it('matches case-insensitively', () => {
      const usages = tracker.analyzePlayerMessage('KALI!');
      expect(usages).toHaveLength(1);
      expect(usages[0].word).toBe('kali');
    });

    it('does not match partial words', () => {
      const usages = tracker.analyzePlayerMessage('The kalibration failed');
      expect(usages).toHaveLength(0);
    });

    it('captures words next to punctuation', () => {
      const usages = tracker.analyzePlayerMessage('kali, akwa!');
      expect(usages).toHaveLength(2);
    });

    it('tracks words used in conversation record', () => {
      tracker.analyzePlayerMessage('kali amiku');
      const result = tracker.endConversation();
      expect(result).not.toBeNull();
      expect(result!.wordsLearned).toBeGreaterThanOrEqual(0);
    });
  });

  describe('word boundary edge cases', () => {
    it('handles word surrounded by quotes', () => {
      const newWords = tracker.analyzeNPCResponse('She said "kali" to me');
      expect(newWords).toHaveLength(1);
    });

    it('handles word with comma after', () => {
      const newWords = tracker.analyzeNPCResponse('kali, friend');
      expect(newWords).toHaveLength(1);
      expect(newWords[0].word).toBe('kali');
    });

    it('handles word with period after', () => {
      const newWords = tracker.analyzeNPCResponse('Good kali.');
      expect(newWords).toHaveLength(1);
    });

    it('handles word with semicolon after', () => {
      const newWords = tracker.analyzeNPCResponse('Say kali; it means hello');
      expect(newWords).toHaveLength(1);
    });

    it('handles single-word response', () => {
      const newWords = tracker.analyzeNPCResponse('kali');
      expect(newWords).toHaveLength(1);
    });
  });

  describe('conversation lifecycle', () => {
    it('tracks new words learned during conversation', () => {
      tracker.analyzeNPCResponse('kali traveler, have some akwa');
      const result = tracker.endConversation();
      expect(result).not.toBeNull();
      expect(result!.wordsLearned).toBe(2);
      expect(result!.newWordsList).toHaveLength(2);
    });

    it('tracks reinforced words from player usage', () => {
      // Learn words first
      tracker.analyzeNPCResponse('kali amiku');
      // Player uses them
      tracker.analyzePlayerMessage('kali!');
      const result = tracker.endConversation();
      expect(result).not.toBeNull();
      expect(result!.wordsReinforced).toBe(1);
    });

    it('accumulates vocabulary across conversations', () => {
      tracker.analyzeNPCResponse('kali traveler');
      tracker.endConversation();

      tracker.startConversation('npc2', 'Healer');
      tracker.analyzeNPCResponse('have some akwa');
      tracker.endConversation();

      expect(tracker.getTotalWordsLearned()).toBe(2);
      expect(tracker.getVocabulary()).toHaveLength(2);
    });
  });
});
