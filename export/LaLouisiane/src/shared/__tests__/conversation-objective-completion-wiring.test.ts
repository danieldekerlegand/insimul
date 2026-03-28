/**
 * Tests for conversation-only quest objective completion wiring.
 *
 * Verifies that all conversation-only objective types have proper completion
 * paths through the QuestCompletionEngine, including topic-based objectives
 * (ask_for_directions, order_food, haggle_price, introduce_self, build_friendship)
 * and other conversation objectives (write_response, describe_scene, teach_vocabulary,
 * teach_phrase).
 */
import { describe, it, expect, vi } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
} from '../../client/src/components/3DGame/QuestCompletionEngine';
import {
  CONVERSATION_ONLY_OBJECTIVE_TYPES,
} from '../quest-objective-types';

function makeEngine(quest: CompletionQuest) {
  const engine = new QuestCompletionEngine();
  engine.addQuest(quest);
  return engine;
}

function makeQuest(objectiveType: string, overrides: Record<string, any> = {}): CompletionQuest {
  return {
    id: 'quest-1',
    objectives: [
      {
        id: 'obj-1',
        questId: 'quest-1',
        type: objectiveType,
        description: `Test ${objectiveType} objective`,
        completed: false,
        requiredCount: 1,
        currentCount: 0,
        ...overrides,
      },
    ],
  };
}

// ── Topic-based conversation objectives via trackNpcConversationTurn ──

describe('trackNpcConversationTurn — topic-based objectives', () => {
  const topicObjectives: Array<{ type: string; topicTag: string }> = [
    { type: 'ask_for_directions', topicTag: 'directions' },
    { type: 'order_food', topicTag: 'order' },
    { type: 'haggle_price', topicTag: 'haggle' },
    { type: 'introduce_self', topicTag: 'introduction' },
    { type: 'build_friendship', topicTag: 'friendship' },
  ];

  it.each(topicObjectives)(
    'completes $type objective with topicTag=$topicTag',
    ({ type, topicTag }) => {
      const onComplete = vi.fn();
      const engine = makeEngine(makeQuest(type, { npcId: 'npc-1' }));
      engine.setOnObjectiveCompleted(onComplete);

      engine.trackNpcConversationTurn('npc-1', topicTag);

      expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
  );

  it.each(topicObjectives)(
    'completes $type objective without topicTag (matches all topic types)',
    ({ type }) => {
      const onComplete = vi.fn();
      const engine = makeEngine(makeQuest(type, { npcId: 'npc-1' }));
      engine.setOnObjectiveCompleted(onComplete);

      engine.trackNpcConversationTurn('npc-1', undefined);

      expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
    },
  );

  it('does not complete for wrong NPC', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('order_food', { npcId: 'npc-chef' }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackNpcConversationTurn('npc-other', 'order');

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('completes for any NPC when npcId is not set', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('haggle_price'));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackNpcConversationTurn('npc-anyone', 'haggle');

    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('requires multiple turns when requiredCount > 1', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('build_friendship', { requiredCount: 3 }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackNpcConversationTurn('npc-1', 'friendship');
    expect(onComplete).not.toHaveBeenCalled();

    engine.trackNpcConversationTurn('npc-1', 'friendship');
    expect(onComplete).not.toHaveBeenCalled();

    engine.trackNpcConversationTurn('npc-1', 'friendship');
    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('does not match wrong topic tag', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('order_food'));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackNpcConversationTurn('npc-1', 'directions');

    expect(onComplete).not.toHaveBeenCalled();
  });
});

// ── trackEvent dispatches to trackNpcConversationTurn ──

describe('trackEvent — npc_conversation_turn', () => {
  it('dispatches to trackNpcConversationTurn', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('ask_for_directions'));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackEvent({
      type: 'npc_conversation_turn',
      npcId: 'npc-1',
      topicTag: 'directions',
    });

    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
  });
});

// ── Writing submission objectives ──

describe('trackWritingSubmission', () => {
  it('completes write_response objective', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('write_response'));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackWritingSubmission('This is my written response in the target language', 9);

    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('completes describe_scene objective', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('describe_scene'));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackWritingSubmission('The village has a fountain in the center', 8);

    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('does not complete when word count is below minimum', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('write_response', { minWordCount: 10 }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackWritingSubmission('Too short', 2);

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('requires multiple submissions when requiredCount > 1', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('write_response', { requiredCount: 2 }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackWritingSubmission('First response', 2);
    expect(onComplete).not.toHaveBeenCalled();

    engine.trackWritingSubmission('Second response', 2);
    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
  });
});

// ── Teaching objectives ──

describe('trackTeachWord', () => {
  it('completes teach_vocabulary objective', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('teach_vocabulary', { requiredCount: 2 }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackTeachWord('npc-1', 'bonjour');
    expect(onComplete).not.toHaveBeenCalled();

    engine.trackTeachWord('npc-1', 'merci');
    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('does not double-count the same word', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('teach_vocabulary', { requiredCount: 2 }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackTeachWord('npc-1', 'bonjour');
    engine.trackTeachWord('npc-1', 'bonjour');

    expect(onComplete).not.toHaveBeenCalled();
    expect(engine.getQuests()[0].objectives![0].currentCount).toBe(1);
  });

  it('does not complete for wrong NPC', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('teach_vocabulary', { npcId: 'npc-learner', requiredCount: 1 }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackTeachWord('npc-other', 'bonjour');

    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('trackTeachPhrase', () => {
  it('completes teach_phrase objective', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('teach_phrase', { requiredCount: 1 }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackTeachPhrase('npc-1', 'comment allez-vous');

    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('does not double-count the same phrase', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('teach_phrase', { requiredCount: 2 }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackTeachPhrase('npc-1', 'bonjour');
    engine.trackTeachPhrase('npc-1', 'bonjour');

    expect(onComplete).not.toHaveBeenCalled();
  });
});

// ── Conversation initiation objectives ──

describe('trackConversationInitiation', () => {
  it('completes when NPC conversation is accepted', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('conversation_initiation', { npcId: 'npc-1' }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackConversationInitiation('npc-1', true);

    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('does not complete when conversation is rejected', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest('conversation_initiation', { npcId: 'npc-1' }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackConversationInitiation('npc-1', false);

    expect(onComplete).not.toHaveBeenCalled();
  });
});

// ── Completeness check: all conversation-only types have engine handlers ──

describe('conversation-only objective coverage', () => {
  // Map each conversation-only type to the event/method that completes it
  const completionMap: Record<string, () => void> = {
    talk_to_npc: () => {
      const engine = makeEngine(makeQuest('talk_to_npc', { npcId: 'npc-1' }));
      engine.trackNPCConversation('npc-1');
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    complete_conversation: () => {
      const engine = makeEngine(makeQuest('complete_conversation', { requiredCount: 1 }));
      engine.trackConversationTurn(['hello']);
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    use_vocabulary: () => {
      const engine = makeEngine(makeQuest('use_vocabulary', { requiredCount: 1 }));
      engine.trackVocabularyUsage('bonjour');
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    listening_comprehension: () => {
      const engine = makeEngine(makeQuest('listening_comprehension', { requiredCount: 1 }));
      engine.trackListeningAnswer(true);
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    pronunciation_check: () => {
      const engine = makeEngine(makeQuest('pronunciation_check', { requiredCount: 1 }));
      engine.trackPronunciationAttempt(true, undefined, 90);
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    translation_challenge: () => {
      const engine = makeEngine(makeQuest('translation_challenge', { requiredCount: 1 }));
      engine.trackTranslationAttempt(true);
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    listen_and_repeat: () => {
      const engine = makeEngine(makeQuest('listen_and_repeat', { requiredCount: 1 }));
      engine.trackPronunciationAttempt(true, undefined, 85);
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    ask_for_directions: () => {
      const engine = makeEngine(makeQuest('ask_for_directions'));
      engine.trackNpcConversationTurn('npc-1', 'directions');
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    order_food: () => {
      const engine = makeEngine(makeQuest('order_food'));
      engine.trackNpcConversationTurn('npc-1', 'order');
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    haggle_price: () => {
      const engine = makeEngine(makeQuest('haggle_price'));
      engine.trackNpcConversationTurn('npc-1', 'haggle');
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    introduce_self: () => {
      const engine = makeEngine(makeQuest('introduce_self'));
      engine.trackNpcConversationTurn('npc-1', 'introduction');
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    describe_scene: () => {
      const engine = makeEngine(makeQuest('describe_scene'));
      engine.trackWritingSubmission('The village is beautiful with flowers', 6);
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    write_response: () => {
      const engine = makeEngine(makeQuest('write_response'));
      engine.trackWritingSubmission('My response in the target language', 6);
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
    build_friendship: () => {
      const engine = makeEngine(makeQuest('build_friendship'));
      engine.trackNpcConversationTurn('npc-1', 'friendship');
      expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
    },
  };

  for (const type of CONVERSATION_ONLY_OBJECTIVE_TYPES) {
    it(`${type} has a completion path`, () => {
      const handler = completionMap[type];
      expect(handler).toBeDefined();
      handler();
    });
  }
});
