/**
 * Live Side-Channel Tests
 *
 * Tests the parallel language analysis side-channel that runs after each
 * Live session turn. Mocks Gemini API for metadata extraction and goal
 * evaluation; tests quest trigger analysis with real local logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runSideChannel } from '../services/conversation/live/live-side-channel.js';
import type { SideChannelContext, SideChannelCallbacks } from '../services/conversation/live/live-side-channel.js';

// ── Mock Gemini SDK ──────────────────────────────────────────────────

const mockGenerateContent = vi.fn();

vi.mock('../config/gemini.js', () => ({
  getGenAI: () => ({
    models: {
      generateContent: (...args: any[]) => mockGenerateContent(...args),
    },
  }),
  GEMINI_MODELS: {
    LIVE: 'gemini-3.1-flash-live-preview',
    PRO: 'gemini-2.5-pro',
    FLASH: 'gemini-2.5-flash',
    FLASH_LITE: 'gemini-2.5-flash-lite',
    SPEECH: 'gemini-2.5-flash-preview-tts',
  },
}));

// ── Mock metadata extraction prompt builder ──────────────────────────

vi.mock('../../shared/language/utils.js', () => ({
  buildMetadataExtractionPrompt: vi.fn(
    (targetLanguage: string, playerMessage: string, npcResponse: string, options: any) =>
      `Extract metadata for ${targetLanguage}: "${playerMessage}" / "${npcResponse}"`,
  ),
}));

// ── Helpers ──────────────────────────────────────────────────────────

function makeContext(overrides?: Partial<SideChannelContext>): SideChannelContext {
  return {
    targetLanguage: 'French',
    playerProficiency: 'beginner',
    activeQuests: [],
    activeObjectives: [],
    npcCharacterId: 'npc-pierre',
    conversationTurnCount: 1,
    ...overrides,
  };
}

function makeCallbacks(overrides?: Partial<SideChannelCallbacks>): SideChannelCallbacks {
  return {
    onVocabHints: vi.fn(),
    onGrammarFeedback: vi.fn(),
    onEval: vi.fn(),
    onQuestProgress: vi.fn(),
    onGoalEvaluation: vi.fn(),
    ...overrides,
  };
}

/** Wait for all microtasks + macrotasks to settle */
function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 50));
}

// ── Tests ────────────────────────────────────────────────────────────

describe('Live Side-Channel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('runSideChannel', () => {
    it('triggers all three tasks concurrently', async () => {
      const vocabHints = [{ word: 'bonjour', translation: 'hello', context: 'greeting' }];
      const grammarFeedback = { status: 'correct', errors: [] };
      const evalScores = { vocabulary: 4, grammar: 3, fluency: 3, comprehension: 4, taskCompletion: 3 };

      // Mock metadata extraction response
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ vocabHints, grammarFeedback, eval: evalScores }),
      });

      const ctx = makeContext({
        activeQuests: [{
          id: 'q1',
          title: 'Greetings Quest',
          questType: 'grammar_drill',
          objectives: [{
            id: 'obj1',
            type: 'use_vocabulary',
            targetWords: ['bonjour'],
            requiredCount: 1,
            currentCount: 0,
          }],
        }],
        activeObjectives: [{
          questId: 'q1',
          objectiveId: 'obj1',
          objectiveType: 'use_vocabulary',
          description: 'Use the word bonjour',
        }],
      });

      const cb = makeCallbacks();

      runSideChannel('bonjour Pierre', 'Bonjour! Comment allez-vous?', ctx, cb);
      await flushPromises();

      // Task 1: Metadata extraction callbacks
      expect(cb.onVocabHints).toHaveBeenCalledWith(vocabHints);
      expect(cb.onGrammarFeedback).toHaveBeenCalledWith(grammarFeedback);
      expect(cb.onEval).toHaveBeenCalledWith(evalScores);

      // Task 3: Local quest trigger analysis
      expect(cb.onQuestProgress).toHaveBeenCalled();
      const [triggers] = (cb.onQuestProgress as any).mock.calls[0];
      expect(triggers).toHaveLength(1);
      expect(triggers[0].questId).toBe('q1');
      expect(triggers[0].objectiveId).toBe('obj1');

      // Task 2: Goal evaluation (uses same mock — called twice: metadata + goal eval)
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it('sends vocab_hints only when hints are non-empty', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ vocabHints: [], grammarFeedback: { status: 'no_target_language', errors: [] } }),
      });

      const cb = makeCallbacks();
      runSideChannel('hello', 'Hi there!', makeContext(), cb);
      await flushPromises();

      expect(cb.onVocabHints).not.toHaveBeenCalled();
    });

    it('skips metadata extraction when no targetLanguage', async () => {
      const cb = makeCallbacks();
      runSideChannel('hello', 'Hi!', makeContext({ targetLanguage: '' }), cb);
      await flushPromises();

      expect(mockGenerateContent).not.toHaveBeenCalled();
      expect(cb.onVocabHints).not.toHaveBeenCalled();
    });

    it('skips goal evaluation when no activeObjectives', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ vocabHints: [], grammarFeedback: { status: 'correct', errors: [] } }),
      });

      const cb = makeCallbacks();
      runSideChannel('bonjour', 'Salut!', makeContext({ activeObjectives: [] }), cb);
      await flushPromises();

      // Only metadata extraction call, not goal eval
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(cb.onGoalEvaluation).not.toHaveBeenCalled();
    });

    it('skips quest progress tracking when no activeQuests', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ vocabHints: [], grammarFeedback: { status: 'correct', errors: [] } }),
      });

      const cb = makeCallbacks();
      runSideChannel('bonjour', 'Salut!', makeContext({ activeQuests: [] }), cb);
      await flushPromises();

      expect(cb.onQuestProgress).not.toHaveBeenCalled();
    });

    it('does not throw when metadata extraction fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API error'));

      const cb = makeCallbacks();
      // Should not throw
      runSideChannel('test', 'response', makeContext(), cb);
      await flushPromises();

      expect(cb.onVocabHints).not.toHaveBeenCalled();
      expect(cb.onGrammarFeedback).not.toHaveBeenCalled();
    });

    it('does not throw when goal evaluation fails', async () => {
      // First call (metadata) succeeds, second call (goal eval) fails
      mockGenerateContent
        .mockResolvedValueOnce({
          text: JSON.stringify({ vocabHints: [], grammarFeedback: { status: 'correct', errors: [] } }),
        })
        .mockRejectedValueOnce(new Error('Goal eval API error'));

      const cb = makeCallbacks();
      runSideChannel('bonjour', 'Salut!', makeContext({
        activeObjectives: [{ questId: 'q1', objectiveId: 'obj1', objectiveType: 'talk_to_npc', description: 'Talk to Pierre' }],
      }), cb);
      await flushPromises();

      expect(cb.onGoalEvaluation).not.toHaveBeenCalled();
    });

    it('handles malformed JSON from metadata extraction', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'not valid json {{{' });

      const cb = makeCallbacks();
      runSideChannel('test', 'response', makeContext(), cb);
      await flushPromises();

      expect(cb.onVocabHints).not.toHaveBeenCalled();
      expect(cb.onGrammarFeedback).not.toHaveBeenCalled();
    });

    it('handles malformed JSON from goal evaluation', async () => {
      mockGenerateContent
        .mockResolvedValueOnce({
          text: JSON.stringify({ vocabHints: [], grammarFeedback: { status: 'correct', errors: [] } }),
        })
        .mockResolvedValueOnce({ text: 'broken json' });

      const cb = makeCallbacks();
      runSideChannel('bonjour', 'Salut!', makeContext({
        activeObjectives: [{ questId: 'q1', objectiveId: 'obj1', objectiveType: 'talk_to_npc', description: 'Talk to Pierre' }],
      }), cb);
      await flushPromises();

      expect(cb.onGoalEvaluation).not.toHaveBeenCalled();
    });

    it('passes eval scores only when includeEval callback is present', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          vocabHints: [{ word: 'merci', translation: 'thanks', context: 'gratitude' }],
          grammarFeedback: { status: 'correct', errors: [] },
        }),
      });

      // No onEval callback
      const cb = makeCallbacks({ onEval: undefined });
      runSideChannel('merci', 'De rien!', makeContext(), cb);
      await flushPromises();

      expect(cb.onVocabHints).toHaveBeenCalled();
    });

    it('runs local quest analysis for multiple objective types', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ vocabHints: [], grammarFeedback: { status: 'correct', errors: [] } }),
      });

      const ctx = makeContext({
        activeQuests: [{
          id: 'q1',
          title: 'Multi-objective Quest',
          questType: 'grammar_drill',
          objectives: [
            { id: 'obj1', type: 'use_vocabulary', targetWords: ['bonjour', 'merci'], requiredCount: 2, currentCount: 0 },
            { id: 'obj2', type: 'talk_to_npc', target: 'npc-pierre', requiredCount: 1, currentCount: 0 },
          ],
        }],
      });

      const cb = makeCallbacks();
      runSideChannel('bonjour et merci Pierre', 'De rien!', ctx, cb);
      await flushPromises();

      expect(cb.onQuestProgress).toHaveBeenCalled();
      const [triggers] = (cb.onQuestProgress as any).mock.calls[0];
      expect(triggers.length).toBeGreaterThanOrEqual(2);
    });

    it('strips markdown code fences from LLM JSON response', async () => {
      mockGenerateContent.mockResolvedValue({
        text: '```json\n{"vocabHints": [{"word": "chat", "translation": "cat", "context": "animals"}], "grammarFeedback": {"status": "correct", "errors": []}}\n```',
      });

      const cb = makeCallbacks();
      runSideChannel('le chat', 'Oui, le chat est mignon!', makeContext(), cb);
      await flushPromises();

      expect(cb.onVocabHints).toHaveBeenCalledWith([{ word: 'chat', translation: 'cat', context: 'animals' }]);
    });

    it('passes goal evaluations with goalMet=true to callback', async () => {
      const evaluations = [
        { objectiveId: 'obj1', questId: 'q1', goalMet: true, confidence: 0.9, extractedInfo: 'Player greeted Pierre' },
      ];

      mockGenerateContent
        .mockResolvedValueOnce({
          text: JSON.stringify({ vocabHints: [], grammarFeedback: { status: 'correct', errors: [] } }),
        })
        .mockResolvedValueOnce({
          text: JSON.stringify(evaluations),
        });

      const cb = makeCallbacks();
      runSideChannel('bonjour Pierre', 'Bonjour! Bienvenue!', makeContext({
        activeObjectives: [{ questId: 'q1', objectiveId: 'obj1', objectiveType: 'talk_to_npc', description: 'Talk to Pierre' }],
      }), cb);
      await flushPromises();

      expect(cb.onGoalEvaluation).toHaveBeenCalledWith(evaluations);
    });
  });
});
