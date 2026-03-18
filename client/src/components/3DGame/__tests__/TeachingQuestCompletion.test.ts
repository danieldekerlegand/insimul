import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../QuestCompletionEngine';

function makeTeachVocabQuest(overrides: Partial<CompletionObjective> = {}): CompletionQuest {
  return {
    id: 'quest-teach-vocab',
    objectives: [
      {
        id: 'obj-teach-words',
        questId: 'quest-teach-vocab',
        type: 'teach_vocabulary',
        description: 'Teach 3 words to the newcomer',
        npcId: 'npc-learner',
        requiredCount: 3,
        completed: false,
        ...overrides,
      },
    ],
  };
}

function makeTeachPhraseQuest(overrides: Partial<CompletionObjective> = {}): CompletionQuest {
  return {
    id: 'quest-teach-phrase',
    objectives: [
      {
        id: 'obj-teach-phrases',
        questId: 'quest-teach-phrase',
        type: 'teach_phrase',
        description: 'Teach 2 phrases to the newcomer',
        npcId: 'npc-learner',
        requiredCount: 2,
        completed: false,
        ...overrides,
      },
    ],
  };
}

function makeCombinedTeachingQuest(): CompletionQuest {
  return {
    id: 'quest-combined',
    objectives: [
      {
        id: 'obj-vocab',
        questId: 'quest-combined',
        type: 'teach_vocabulary',
        description: 'Teach 2 words',
        npcId: 'npc-student',
        requiredCount: 2,
        completed: false,
      },
      {
        id: 'obj-phrase',
        questId: 'quest-combined',
        type: 'teach_phrase',
        description: 'Teach 1 phrase',
        npcId: 'npc-student',
        requiredCount: 1,
        completed: false,
      },
    ],
  };
}

describe('QuestCompletionEngine - teaching tracking', () => {
  let engine: QuestCompletionEngine;
  let onObjectiveCompleted: ReturnType<typeof vi.fn>;
  let onQuestCompleted: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
    onObjectiveCompleted = vi.fn();
    onQuestCompleted = vi.fn();
    engine.setOnObjectiveCompleted(onObjectiveCompleted);
    engine.setOnQuestCompleted(onQuestCompleted);
  });

  // ── teach_vocabulary ────────────────────────────────────────────────────

  describe('trackTeachWord', () => {
    it('tracks words taught and completes objective when count reached', () => {
      engine.addQuest(makeTeachVocabQuest());

      engine.trackEvent({ type: 'teach_word', npcId: 'npc-learner', word: 'hello' });
      expect(onObjectiveCompleted).not.toHaveBeenCalled();

      engine.trackEvent({ type: 'teach_word', npcId: 'npc-learner', word: 'goodbye' });
      expect(onObjectiveCompleted).not.toHaveBeenCalled();

      engine.trackEvent({ type: 'teach_word', npcId: 'npc-learner', word: 'thanks' });
      expect(onObjectiveCompleted).toHaveBeenCalledWith('quest-teach-vocab', 'obj-teach-words');
      expect(onQuestCompleted).toHaveBeenCalledWith('quest-teach-vocab');
    });

    it('deduplicates words (case-insensitive)', () => {
      engine.addQuest(makeTeachVocabQuest());

      engine.trackEvent({ type: 'teach_word', npcId: 'npc-learner', word: 'Hello' });
      engine.trackEvent({ type: 'teach_word', npcId: 'npc-learner', word: 'hello' });
      engine.trackEvent({ type: 'teach_word', npcId: 'npc-learner', word: 'HELLO' });

      // Only 1 unique word taught
      expect(onObjectiveCompleted).not.toHaveBeenCalled();
    });

    it('ignores events for wrong NPC', () => {
      engine.addQuest(makeTeachVocabQuest());

      engine.trackEvent({ type: 'teach_word', npcId: 'wrong-npc', word: 'hello' });
      engine.trackEvent({ type: 'teach_word', npcId: 'wrong-npc', word: 'goodbye' });
      engine.trackEvent({ type: 'teach_word', npcId: 'wrong-npc', word: 'thanks' });

      expect(onObjectiveCompleted).not.toHaveBeenCalled();
    });

    it('accepts any NPC when npcId is not set on objective', () => {
      engine.addQuest(makeTeachVocabQuest({ npcId: undefined }));

      engine.trackEvent({ type: 'teach_word', npcId: 'any-npc', word: 'a' });
      engine.trackEvent({ type: 'teach_word', npcId: 'any-npc', word: 'b' });
      engine.trackEvent({ type: 'teach_word', npcId: 'any-npc', word: 'c' });

      expect(onObjectiveCompleted).toHaveBeenCalledWith('quest-teach-vocab', 'obj-teach-words');
    });
  });

  // ── teach_phrase ────────────────────────────────────────────────────────

  describe('trackTeachPhrase', () => {
    it('tracks phrases taught and completes objective when count reached', () => {
      engine.addQuest(makeTeachPhraseQuest());

      engine.trackEvent({ type: 'teach_phrase_to_npc', npcId: 'npc-learner', phrase: 'Good morning' });
      expect(onObjectiveCompleted).not.toHaveBeenCalled();

      engine.trackEvent({ type: 'teach_phrase_to_npc', npcId: 'npc-learner', phrase: 'How are you?' });
      expect(onObjectiveCompleted).toHaveBeenCalledWith('quest-teach-phrase', 'obj-teach-phrases');
      expect(onQuestCompleted).toHaveBeenCalledWith('quest-teach-phrase');
    });

    it('deduplicates phrases (case-insensitive)', () => {
      engine.addQuest(makeTeachPhraseQuest());

      engine.trackEvent({ type: 'teach_phrase_to_npc', npcId: 'npc-learner', phrase: 'Good morning' });
      engine.trackEvent({ type: 'teach_phrase_to_npc', npcId: 'npc-learner', phrase: 'good morning' });

      // Only 1 unique phrase
      expect(onObjectiveCompleted).not.toHaveBeenCalled();
    });

    it('ignores events for wrong NPC', () => {
      engine.addQuest(makeTeachPhraseQuest());

      engine.trackEvent({ type: 'teach_phrase_to_npc', npcId: 'wrong-npc', phrase: 'Hello' });
      engine.trackEvent({ type: 'teach_phrase_to_npc', npcId: 'wrong-npc', phrase: 'Goodbye' });

      expect(onObjectiveCompleted).not.toHaveBeenCalled();
    });
  });

  // ── Combined teaching quest ────────────────────────────────────────────

  describe('combined teaching quest', () => {
    it('completes quest when all teaching objectives are met', () => {
      engine.addQuest(makeCombinedTeachingQuest());

      // Teach vocabulary
      engine.trackEvent({ type: 'teach_word', npcId: 'npc-student', word: 'left' });
      engine.trackEvent({ type: 'teach_word', npcId: 'npc-student', word: 'right' });
      expect(onObjectiveCompleted).toHaveBeenCalledWith('quest-combined', 'obj-vocab');
      expect(onQuestCompleted).not.toHaveBeenCalled();

      // Teach phrase
      engine.trackEvent({ type: 'teach_phrase_to_npc', npcId: 'npc-student', phrase: 'Turn left at the fountain' });
      expect(onObjectiveCompleted).toHaveBeenCalledWith('quest-combined', 'obj-phrase');
      expect(onQuestCompleted).toHaveBeenCalledWith('quest-combined');
    });

    it('does not complete quest until all objectives are done', () => {
      engine.addQuest(makeCombinedTeachingQuest());

      // Only teach vocabulary, not phrase
      engine.trackEvent({ type: 'teach_word', npcId: 'npc-student', word: 'left' });
      engine.trackEvent({ type: 'teach_word', npcId: 'npc-student', word: 'right' });

      expect(onObjectiveCompleted).toHaveBeenCalledTimes(1);
      expect(onQuestCompleted).not.toHaveBeenCalled();
    });
  });

  // ── Quest scoping ─────────────────────────────────────────────────────

  describe('quest scoping', () => {
    it('scopes teach events to specific quest when questId is provided', () => {
      const quest1 = makeTeachVocabQuest();
      const quest2: CompletionQuest = {
        id: 'quest-teach-vocab-2',
        objectives: [{
          id: 'obj-teach-words-2',
          questId: 'quest-teach-vocab-2',
          type: 'teach_vocabulary',
          description: 'Teach 2 words',
          npcId: 'npc-learner',
          requiredCount: 2,
          completed: false,
        }],
      };
      engine.addQuest(quest1);
      engine.addQuest(quest2);

      // Scoped to quest2
      engine.trackEvent({ type: 'teach_word', npcId: 'npc-learner', word: 'a', questId: 'quest-teach-vocab-2' });
      engine.trackEvent({ type: 'teach_word', npcId: 'npc-learner', word: 'b', questId: 'quest-teach-vocab-2' });

      expect(onObjectiveCompleted).toHaveBeenCalledWith('quest-teach-vocab-2', 'obj-teach-words-2');
      // quest1 should NOT be completed
      expect(onQuestCompleted).toHaveBeenCalledTimes(1);
      expect(onQuestCompleted).toHaveBeenCalledWith('quest-teach-vocab-2');
    });
  });
});
