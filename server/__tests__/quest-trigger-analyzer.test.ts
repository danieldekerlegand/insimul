import { describe, it, expect } from 'vitest';
import {
  levenshteinDistance,
  detectVocabularyUsage,
  detectGrammarPattern,
  detectTopicRelevance,
  analyzeConversation,
} from '../services/conversation/quest-trigger-analyzer.js';
import type { ActiveQuest, AnalysisContext } from '../services/conversation/quest-trigger-analyzer.js';

// ── levenshteinDistance ─────────────────────────────────────────────────

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
  });

  it('returns length of other string when one is empty', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3);
    expect(levenshteinDistance('abc', '')).toBe(3);
  });

  it('returns 1 for single character difference', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1);
    expect(levenshteinDistance('cat', 'cats')).toBe(1);
    expect(levenshteinDistance('cats', 'cat')).toBe(1);
  });

  it('returns 2 for two character differences', () => {
    expect(levenshteinDistance('kitten', 'sitten')).toBe(1);
    expect(levenshteinDistance('bonjour', 'bonjoar')).toBe(1);
  });

  it('handles completely different strings', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(3);
  });
});

// ── detectVocabularyUsage ───────────────────────────────────────────────

describe('detectVocabularyUsage', () => {
  it('returns empty array when no target words', () => {
    expect(detectVocabularyUsage('hello world', [])).toEqual([]);
  });

  it('detects exact word matches', () => {
    const result = detectVocabularyUsage('I want to say bonjour today', ['bonjour']);
    expect(result).toEqual(['bonjour']);
  });

  it('detects multiple word matches', () => {
    const result = detectVocabularyUsage(
      'bonjour, comment allez-vous?',
      ['bonjour', 'merci', 'comment'],
    );
    expect(result).toContain('bonjour');
    expect(result).toContain('comment');
    expect(result).not.toContain('merci');
  });

  it('is case insensitive', () => {
    const result = detectVocabularyUsage('BONJOUR everyone', ['bonjour']);
    expect(result).toEqual(['bonjour']);
  });

  it('uses fuzzy matching for words >= 4 chars', () => {
    // "bonjoar" is distance 1 from "bonjour"
    const result = detectVocabularyUsage('bonjoar everyone', ['bonjour']);
    expect(result).toEqual(['bonjour']);
  });

  it('does not fuzzy match short words', () => {
    // "cat" vs "bat" is distance 1, but too short for fuzzy
    const result = detectVocabularyUsage('I have a bat', ['cat']);
    expect(result).toEqual([]);
  });

  it('rejects fuzzy matches with distance > 2', () => {
    // "bonjour" vs "goodbye" — distance is too high
    const result = detectVocabularyUsage('goodbye everyone', ['bonjour']);
    expect(result).toEqual([]);
  });

  it('handles punctuation in message', () => {
    const result = detectVocabularyUsage('¡Hola! ¿Cómo estás?', ['hola', 'estás']);
    expect(result).toContain('hola');
  });
});

// ── detectGrammarPattern ────────────────────────────────────────────────

describe('detectGrammarPattern', () => {
  it('returns false for empty pattern', () => {
    expect(detectGrammarPattern('hello', '')).toBe(false);
  });

  it('matches regex patterns', () => {
    // French passé composé: j'ai + past participle
    expect(detectGrammarPattern("j'ai mangé le pain", "j'ai\\s+\\w+é")).toBe(true);
  });

  it('is case insensitive', () => {
    expect(detectGrammarPattern('Je suis content', 'je suis')).toBe(true);
  });

  it('falls back to substring match on invalid regex', () => {
    expect(detectGrammarPattern('hello world [test', '[test')).toBe(true);
  });

  it('returns false when pattern does not match', () => {
    expect(detectGrammarPattern('hello world', 'bonjour')).toBe(false);
  });
});

// ── detectTopicRelevance ────────────────────────────────────────────────

describe('detectTopicRelevance', () => {
  const quest: ActiveQuest = {
    id: 'q1',
    title: 'Market Shopping Adventure',
    questType: 'vocabulary',
    objectives: [],
    tags: ['food', 'market', 'shopping'],
  };

  it('detects overlap with quest tags', () => {
    expect(detectTopicRelevance('I went to the market', quest)).toBe(true);
  });

  it('detects overlap with quest title words', () => {
    expect(detectTopicRelevance('What an adventure!', quest)).toBe(true);
  });

  it('returns false when no overlap', () => {
    expect(detectTopicRelevance('The weather is nice', quest)).toBe(false);
  });

  it('returns false for empty message', () => {
    expect(detectTopicRelevance('', quest)).toBe(false);
  });
});

// ── analyzeConversation ─────────────────────────────────────────────────

describe('analyzeConversation', () => {
  it('returns empty triggers for no active quests', () => {
    const result = analyzeConversation({
      playerMessage: 'bonjour',
      conversationTurnCount: 1,
      activeQuests: [],
    });
    expect(result.triggers).toEqual([]);
    expect(result.markerContent).toBe('');
  });

  it('detects vocabulary usage triggers', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Learn Greetings',
      questType: 'vocabulary',
      objectives: [
        {
          id: 'obj1',
          type: 'use_vocabulary',
          targetWords: ['bonjour', 'merci', 'au revoir'],
          requiredCount: 3,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'bonjour, merci beaucoup!',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].objectiveId).toBe('obj1');
    expect(result.triggers[0].newCount).toBe(2);
    expect(result.triggers[0].completed).toBe(false);
    expect(result.markerContent).toContain('obj1');
    expect(result.markerContent).toContain('2/3');
  });

  it('detects talk_to_npc triggers', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Talk to Baker',
      questType: 'conversation',
      objectives: [
        {
          id: 'obj1',
          type: 'talk_to_npc',
          target: 'baker',
          requiredCount: 1,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'Hello baker!',
      npcCharacterId: 'baker-pierre',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].completed).toBe(true);
  });

  it('detects complete_conversation triggers', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Have a Conversation',
      questType: 'conversation',
      objectives: [
        {
          id: 'obj1',
          type: 'complete_conversation',
          requiredCount: 3,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'This is my third message',
      conversationTurnCount: 3,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].completed).toBe(true);
  });

  it('does not trigger for incomplete conversation turns', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Have a Conversation',
      questType: 'conversation',
      objectives: [
        {
          id: 'obj1',
          type: 'complete_conversation',
          requiredCount: 5,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'First message',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(0);
  });

  it('detects grammar pattern triggers', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Practice Past Tense',
      questType: 'grammar',
      objectives: [
        {
          id: 'obj1',
          type: 'grammar_practice',
          grammarPattern: "j'ai\\s+\\w+é",
          requiredCount: 2,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: "Hier, j'ai mangé du pain",
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].trigger).toBe('matched grammar pattern');
  });

  it('skips completed objectives', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Learn Greetings',
      questType: 'vocabulary',
      objectives: [
        {
          id: 'obj1',
          type: 'use_vocabulary',
          targetWords: ['bonjour'],
          requiredCount: 1,
          currentCount: 1,
          completed: true,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'bonjour!',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(0);
  });

  it('skips non-active quests', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Learn Greetings',
      questType: 'vocabulary',
      status: 'completed',
      objectives: [
        {
          id: 'obj1',
          type: 'use_vocabulary',
          targetWords: ['bonjour'],
          requiredCount: 1,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'bonjour!',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(0);
  });

  it('handles multiple quests with multiple objectives', () => {
    const quests: ActiveQuest[] = [
      {
        id: 'q1',
        title: 'Learn Greetings',
        questType: 'vocabulary',
        objectives: [
          {
            id: 'obj1',
            type: 'use_vocabulary',
            targetWords: ['bonjour'],
            requiredCount: 1,
            currentCount: 0,
          },
        ],
      },
      {
        id: 'q2',
        title: 'Talk to Baker',
        questType: 'conversation',
        objectives: [
          {
            id: 'obj2',
            type: 'talk_to_npc',
            target: 'baker',
            requiredCount: 1,
            currentCount: 0,
          },
        ],
      },
    ];

    const result = analyzeConversation({
      playerMessage: 'bonjour baker!',
      npcCharacterId: 'baker-pierre',
      conversationTurnCount: 1,
      activeQuests: quests,
    });

    expect(result.triggers).toHaveLength(2);
    expect(result.triggers.map(t => t.questId)).toContain('q1');
    expect(result.triggers.map(t => t.questId)).toContain('q2');
  });

  it('caps newCount at requiredCount', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Learn Words',
      questType: 'vocabulary',
      objectives: [
        {
          id: 'obj1',
          type: 'use_vocabulary',
          targetWords: ['bonjour', 'merci', 'salut'],
          requiredCount: 2,
          currentCount: 1,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'bonjour, merci, salut!',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(1);
    // 1 (current) + 3 (matched) = 4, but capped at 2
    expect(result.triggers[0].newCount).toBe(2);
    expect(result.triggers[0].completed).toBe(true);
  });

  it('detects translation_challenge triggers via vocabulary', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Translate Foods',
      questType: 'translation',
      objectives: [
        {
          id: 'obj1',
          type: 'translation_challenge',
          targetWords: ['pain', 'fromage'],
          requiredCount: 2,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'le pain et le fromage',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].newCount).toBe(2);
    expect(result.triggers[0].completed).toBe(true);
  });

  it('detects listening_comprehension via topic relevance', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Bakery Story',
      questType: 'conversation',
      tags: ['bakery', 'bread'],
      objectives: [
        {
          id: 'obj1',
          type: 'listening_comprehension',
          requiredCount: 1,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'The bakery makes fresh bread every morning',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].trigger).toBe('responded to comprehension topic');
  });

  it('formats marker content correctly', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Learn Greetings',
      questType: 'vocabulary',
      objectives: [
        {
          id: 'obj1',
          type: 'use_vocabulary',
          targetWords: ['bonjour'],
          requiredCount: 3,
          currentCount: 1,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'bonjour!',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.markerContent).toBe(
      "ObjectiveId: obj1, Progress: 2/3, Trigger: 'used words: bonjour'",
    );
  });

  // ── Conversation-only objective type triggers ─────────────────────────

  it('detects order_food trigger on non-empty message', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Order at Café',
      questType: 'conversation',
      objectives: [
        {
          id: 'obj1',
          type: 'order_food',
          requiredCount: 1,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'Je voudrais un café, s\'il vous plaît',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].objectiveType).toBe('order_food');
    expect(result.triggers[0].completed).toBe(true);
  });

  it('detects haggle_price trigger', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Market Bargaining',
      questType: 'conversation',
      objectives: [
        {
          id: 'obj1',
          type: 'haggle_price',
          requiredCount: 2,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'C\'est trop cher, je vous offre cinq euros',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].newCount).toBe(1);
    expect(result.triggers[0].completed).toBe(false);
  });

  it('detects introduce_self trigger with introduction pattern', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Meet the Neighbors',
      questType: 'conversation',
      objectives: [
        {
          id: 'obj1',
          type: 'introduce_self',
          requiredCount: 1,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'Je m\'appelle Pierre, enchanté!',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].completed).toBe(true);
  });

  it('detects introduce_self with English pattern', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Introductions',
      questType: 'conversation',
      objectives: [
        {
          id: 'obj1',
          type: 'introduce_self',
          requiredCount: 1,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'My name is Daniel',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].completed).toBe(true);
  });

  it('does not trigger introduce_self without introduction pattern', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Introductions',
      questType: 'conversation',
      objectives: [
        {
          id: 'obj1',
          type: 'introduce_self',
          requiredCount: 1,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'The weather is nice today',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(0);
  });

  it('does not trigger conversation-only types on empty message', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Order Food',
      questType: 'conversation',
      objectives: [
        {
          id: 'obj1',
          type: 'order_food',
          requiredCount: 1,
          currentCount: 0,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: '   ',
      conversationTurnCount: 1,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(0);
  });

  it('tracks build_friendship progress over multiple turns', () => {
    const quest: ActiveQuest = {
      id: 'q1',
      title: 'Befriend the Baker',
      questType: 'conversation',
      objectives: [
        {
          id: 'obj1',
          type: 'build_friendship',
          requiredCount: 3,
          currentCount: 1,
        },
      ],
    };

    const result = analyzeConversation({
      playerMessage: 'Tell me about your baking secrets!',
      conversationTurnCount: 2,
      activeQuests: [quest],
    });

    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].newCount).toBe(2);
    expect(result.triggers[0].completed).toBe(false);
  });
});
