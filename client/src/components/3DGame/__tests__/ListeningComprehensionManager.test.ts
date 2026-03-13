import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ListeningComprehensionManager,
  type ComprehensionQuestion,
} from '../ListeningComprehensionManager';

describe('ListeningComprehensionManager', () => {
  let manager: ListeningComprehensionManager;

  const questions: ComprehensionQuestion[] = [
    { question: 'What color was the cat?', correctAnswer: 'black' },
    { question: 'Where did Maria go?', correctAnswer: 'the market' },
    { question: 'What did she buy?', correctAnswer: 'bread' },
  ];

  beforeEach(() => {
    manager = new ListeningComprehensionManager();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    manager.dispose();
  });

  describe('registerQuest / unregisterQuest', () => {
    it('should register a quest and retrieve its state', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions, 'Spanish');
      const state = manager.getQuestState('q1');
      expect(state).not.toBeNull();
      expect(state!.questId).toBe('q1');
      expect(state!.storyNpcId).toBe('npcA');
      expect(state!.answerNpcId).toBe('npcB');
      expect(state!.questions).toHaveLength(3);
      expect(state!.storyHeard).toBe(false);
      expect(state!.evaluated).toBe(false);
    });

    it('should return null for unregistered quest', () => {
      expect(manager.getQuestState('nonexistent')).toBeNull();
    });

    it('should unregister a quest', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      manager.unregisterQuest('q1');
      expect(manager.getQuestState('q1')).toBeNull();
    });
  });

  describe('findQuestForStoryNpc', () => {
    it('should find quest by story NPC ID', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      const found = manager.findQuestForStoryNpc('npcA');
      expect(found).not.toBeNull();
      expect(found!.questId).toBe('q1');
    });

    it('should return null if story already heard', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      // Simulate hearing the story
      manager.handleChatExchange('npcA', 'hello', 'Let me tell you a story about a black cat who went to the market.');
      expect(manager.findQuestForStoryNpc('npcA')).toBeNull();
    });

    it('should return null for unknown NPC', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      expect(manager.findQuestForStoryNpc('npcC')).toBeNull();
    });
  });

  describe('findQuestForAnswerNpc', () => {
    it('should not find quest before story is heard', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      expect(manager.findQuestForAnswerNpc('npcB')).toBeNull();
    });

    it('should find quest after story is heard', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      manager.handleChatExchange('npcA', 'hello', 'A black cat went to the market and bought bread.');
      const found = manager.findQuestForAnswerNpc('npcB');
      expect(found).not.toBeNull();
      expect(found!.questId).toBe('q1');
    });
  });

  describe('getPromptAugmentation', () => {
    it('should return story prompt for story NPC', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions, 'French');
      const aug = manager.getPromptAugmentation('npcA');
      expect(aug).not.toBeNull();
      expect(aug).toContain('LISTENING COMPREHENSION');
      expect(aug).toContain('French');
      expect(aug).toContain('short story');
    });

    it('should return answer prompt for answer NPC after story heard', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      manager.handleChatExchange('npcA', 'hello', 'A black cat went to the market and bought bread.');
      const aug = manager.getPromptAugmentation('npcB');
      expect(aug).not.toBeNull();
      expect(aug).toContain('COMPREHENSION CHECK');
      expect(aug).toContain('What color was the cat?');
      expect(aug).toContain('A black cat');
    });

    it('should return null for unrelated NPC', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      expect(manager.getPromptAugmentation('npcC')).toBeNull();
    });
  });

  describe('handleChatExchange — story capture', () => {
    it('should capture story text from story NPC response', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      manager.handleChatExchange('npcA', 'tell me a story', 'Once upon a time there was a black cat.');
      const state = manager.getQuestState('q1');
      expect(state!.storyText).toBe('Once upon a time there was a black cat.');
      expect(state!.storyHeard).toBe(true);
    });

    it('should not capture story from very short responses', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      manager.handleChatExchange('npcA', 'hello', 'Hi!');
      const state = manager.getQuestState('q1');
      expect(state!.storyHeard).toBe(false);
    });

    it('should not re-capture story once heard', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      manager.handleChatExchange('npcA', 'tell me', 'Once upon a time there was a black cat.');
      manager.handleChatExchange('npcA', 'more?', 'The end.');
      const state = manager.getQuestState('q1');
      // Story should not be appended after storyHeard is true
      expect(state!.storyText).toBe('Once upon a time there was a black cat.');
    });
  });

  describe('handleChatExchange — answer capture', () => {
    it('should capture player answers when talking to answer NPC', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      // First hear the story
      manager.handleChatExchange('npcA', 'tell me', 'A black cat went to the market and bought bread.');
      // Then answer questions
      manager.handleChatExchange('npcB', 'It was black', 'Good! Next question...');
      manager.handleChatExchange('npcB', 'She went to the market', 'Correct!');
      const state = manager.getQuestState('q1');
      expect(state!.playerAnswers).toHaveLength(2);
      expect(state!.playerAnswers[0]).toBe('It was black');
    });
  });

  describe('fallback evaluation', () => {
    it('should evaluate comprehension with keyword matching when API fails', async () => {
      // Mock fetch to fail
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      const onComplete = vi.fn();
      manager.setOnComplete(onComplete);
      manager.registerQuest('q1', 'npcA', 'npcB', questions);

      // Hear story
      manager.handleChatExchange('npcA', 'tell me', 'A black cat went to the market and bought bread.');

      // Answer all questions (triggering evaluation)
      manager.handleChatExchange('npcB', 'The cat was black', 'Good!');
      manager.handleChatExchange('npcB', 'She went to the market', 'Correct!');
      manager.handleChatExchange('npcB', 'She bought some bread', 'Well done!');

      // Wait for async evaluation
      await vi.waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      const [questId, score, storyText, passed] = onComplete.mock.calls[0];
      expect(questId).toBe('q1');
      expect(score).toBeGreaterThanOrEqual(60);
      expect(storyText).toContain('black cat');
      expect(passed).toBe(true);
    });

    it('should fail comprehension with wrong answers', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      const onComplete = vi.fn();
      manager.setOnComplete(onComplete);
      manager.registerQuest('q1', 'npcA', 'npcB', questions);

      manager.handleChatExchange('npcA', 'tell me', 'A black cat went to the market and bought bread.');
      manager.handleChatExchange('npcB', 'I dont know', 'Try again...');
      manager.handleChatExchange('npcB', 'Something else entirely', 'Not quite...');
      manager.handleChatExchange('npcB', 'No idea at all', 'Sorry...');

      await vi.waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      const [, score, , passed] = onComplete.mock.calls[0];
      expect(score).toBeLessThan(60);
      expect(passed).toBe(false);
    });
  });

  describe('Gemini evaluation', () => {
    it('should call API and use response score', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          score: 85,
          feedback: 'Great comprehension!',
          questionResults: [
            { question: 'What color was the cat?', correct: true, feedback: 'Correct!' },
            { question: 'Where did Maria go?', correct: true, feedback: 'Correct!' },
            { question: 'What did she buy?', correct: true, feedback: 'Correct!' },
          ],
        }),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      const onComplete = vi.fn();
      manager.setOnComplete(onComplete);
      manager.registerQuest('q1', 'npcA', 'npcB', questions, 'Spanish');

      manager.handleChatExchange('npcA', 'tell me', 'Un gato negro fue al mercado y compró pan.');
      manager.handleChatExchange('npcB', 'negro', 'Bien!');
      manager.handleChatExchange('npcB', 'al mercado', 'Correcto!');
      manager.handleChatExchange('npcB', 'pan', 'Excelente!');

      await vi.waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      // Verify API was called with correct data
      expect(fetch).toHaveBeenCalledWith(
        '/api/gemini/comprehension-evaluation',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('gato negro'),
        }),
      );

      const [questId, score, , passed] = onComplete.mock.calls[0];
      expect(questId).toBe('q1');
      expect(score).toBe(85);
      expect(passed).toBe(true);
    });
  });

  describe('isStoryHeard / isEvaluated / getScore', () => {
    it('should track story heard state', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      expect(manager.isStoryHeard('q1')).toBe(false);
      manager.handleChatExchange('npcA', 'hi', 'A black cat went to the market and bought bread.');
      expect(manager.isStoryHeard('q1')).toBe(true);
    });

    it('should return false for unknown quests', () => {
      expect(manager.isStoryHeard('unknown')).toBe(false);
      expect(manager.isEvaluated('unknown')).toBe(false);
      expect(manager.getScore('unknown')).toBeNull();
    });
  });

  describe('dispose', () => {
    it('should clear all state', () => {
      manager.registerQuest('q1', 'npcA', 'npcB', questions);
      manager.dispose();
      expect(manager.getQuestState('q1')).toBeNull();
    });
  });
});
