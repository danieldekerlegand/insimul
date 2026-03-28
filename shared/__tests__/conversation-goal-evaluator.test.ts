/**
 * Tests for ConversationGoalEvaluator
 */

import { describe, it, expect, vi } from 'vitest';
import {
  ConversationGoalEvaluator,
  type ConversationTranscript,
  type AIEvaluateCallback,
} from '../game-engine/logic/ConversationGoalEvaluator';

function makeTranscript(exchanges: Array<{ speaker: 'player' | 'npc'; text: string }>): ConversationTranscript {
  return { npcId: 'npc-1', npcName: 'Marie', exchanges };
}

describe('ConversationGoalEvaluator', () => {
  describe('keyword fallback mode', () => {
    it('returns goalMet=true when >= 50% of keywords are found', () => {
      const evaluator = new ConversationGoalEvaluator();
      const transcript = makeTranscript([
        { speaker: 'player', text: 'Have you seen the missing writer?' },
        { speaker: 'npc', text: 'The writer disappeared last Tuesday near the river.' },
      ]);

      const result = evaluator.evaluateWithKeywords(
        'Player: Have you seen the missing writer?\nMarie: The writer disappeared last Tuesday near the river.',
        ['writer', 'disappeared', 'Tuesday', 'river'],
      );

      expect(result.goalMet).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it('returns goalMet=false when < 50% of keywords are found', () => {
      const evaluator = new ConversationGoalEvaluator();
      const result = evaluator.evaluateWithKeywords(
        'Player: Hello!\nMarie: Good morning.',
        ['writer', 'disappeared', 'Tuesday', 'river'],
      );

      expect(result.goalMet).toBe(false);
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('returns goalMet=false with empty keywords', () => {
      const evaluator = new ConversationGoalEvaluator();
      const result = evaluator.evaluateWithKeywords('Some text', []);
      expect(result.goalMet).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('extracts relevant sentence as extractedInfo', () => {
      const evaluator = new ConversationGoalEvaluator();
      const result = evaluator.evaluateWithKeywords(
        'The weather is nice. The writer was last seen at the library. It is a beautiful day.',
        ['writer', 'library'],
      );

      expect(result.goalMet).toBe(true);
      expect(result.extractedInfo).toContain('writer');
    });

    it('keyword matching is case-insensitive', () => {
      const evaluator = new ConversationGoalEvaluator();
      const result = evaluator.evaluateWithKeywords(
        'The WRITER was here.',
        ['writer'],
      );

      expect(result.goalMet).toBe(true);
      expect(result.confidence).toBe(1);
    });
  });

  describe('AI evaluation mode', () => {
    it('uses AI callback when set', async () => {
      const evaluator = new ConversationGoalEvaluator();
      const mockAI: AIEvaluateCallback = vi.fn().mockResolvedValue({
        goalMet: true,
        confidence: 0.95,
        extractedInfo: 'The writer is named Jean-Pierre',
      });

      evaluator.setAIEvaluator(mockAI);

      const transcript = makeTranscript([
        { speaker: 'player', text: "What's the writer's name?" },
        { speaker: 'npc', text: 'His name is Jean-Pierre.' },
      ]);

      const result = await evaluator.evaluate(
        transcript,
        "Learn the writer's name",
        ['writer', 'name'],
      );

      expect(mockAI).toHaveBeenCalledOnce();
      expect(result.goalMet).toBe(true);
      expect(result.confidence).toBe(0.95);
      expect(result.extractedInfo).toBe('The writer is named Jean-Pierre');
    });

    it('falls back to keywords when AI fails', async () => {
      const evaluator = new ConversationGoalEvaluator();
      const failingAI: AIEvaluateCallback = vi.fn().mockRejectedValue(new Error('API timeout'));

      evaluator.setAIEvaluator(failingAI);

      const transcript = makeTranscript([
        { speaker: 'player', text: 'Tell me about the writer.' },
        { speaker: 'npc', text: 'The writer went to the library.' },
      ]);

      const result = await evaluator.evaluate(
        transcript,
        'Learn about the writer',
        ['writer', 'library'],
      );

      expect(failingAI).toHaveBeenCalledOnce();
      expect(result.goalMet).toBe(true); // keyword fallback succeeded
    });

    it('falls back to keywords when no AI is set', async () => {
      const evaluator = new ConversationGoalEvaluator();

      const transcript = makeTranscript([
        { speaker: 'player', text: 'Where is the manuscript?' },
        { speaker: 'npc', text: 'The manuscript is hidden in the cellar.' },
      ]);

      const result = await evaluator.evaluate(
        transcript,
        'Find the manuscript location',
        ['manuscript', 'cellar'],
      );

      expect(result.goalMet).toBe(true);
    });
  });
});
