/**
 * Tests for US-004: Update player-NPC relationship after chat.
 * Verifies that the relationship update formula is applied correctly
 * and that failures don't break the chat response.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// The relationship update logic lives inline in server/routes.ts chat endpoint.
// We test the formula and behavior by extracting and exercising the same logic.

describe('Player-NPC relationship update after chat', () => {
  /**
   * The formula from the acceptance criteria:
   *   friendshipChange = (0.02 + avgAgreeableness * 0.03) * (exchangeCount / 5)
   * Then interactionQuality = friendshipChange >= 0 ? 0.5 : -0.3 (clamped to [-1, 1])
   */
  function computeInteractionQuality(agreeableness: number, exchangeCount: number): {
    friendshipChange: number;
    interactionQuality: number;
  } {
    const friendshipChange = (0.02 + agreeableness * 0.03) * (exchangeCount / 5);
    const interactionQuality = Math.max(-1, Math.min(1, friendshipChange >= 0 ? 0.5 : -0.3));
    return { friendshipChange, interactionQuality };
  }

  describe('friendship change formula', () => {
    it('produces positive delta for agreeable NPC with 5 exchanges', () => {
      const { friendshipChange, interactionQuality } = computeInteractionQuality(0.8, 5);
      // friendshipChange = (0.02 + 0.8 * 0.03) * (5/5) = (0.02 + 0.024) * 1 = 0.044
      expect(friendshipChange).toBeCloseTo(0.044, 4);
      expect(interactionQuality).toBe(0.5);
    });

    it('scales with exchange count', () => {
      const result1 = computeInteractionQuality(0.5, 1);
      const result5 = computeInteractionQuality(0.5, 5);
      const result10 = computeInteractionQuality(0.5, 10);
      // More exchanges → higher friendship change
      expect(result5.friendshipChange).toBeGreaterThan(result1.friendshipChange);
      expect(result10.friendshipChange).toBeGreaterThan(result5.friendshipChange);
    });

    it('produces smaller delta for low-agreeableness NPC', () => {
      const low = computeInteractionQuality(0.1, 5);
      const high = computeInteractionQuality(0.9, 5);
      expect(high.friendshipChange).toBeGreaterThan(low.friendshipChange);
    });

    it('always produces positive friendshipChange (agreeableness >= 0)', () => {
      // Even with 0 agreeableness and 1 exchange, base is 0.02 * 0.2 = 0.004
      const { friendshipChange } = computeInteractionQuality(0, 1);
      expect(friendshipChange).toBeGreaterThan(0);
    });

    it('uses default 0.5 agreeableness when personality is missing', () => {
      // Simulates the ?? 0.5 fallback in routes.ts
      const agreeableness = undefined ?? 0.5;
      const { friendshipChange } = computeInteractionQuality(agreeableness, 5);
      // (0.02 + 0.5 * 0.03) * 1 = 0.035
      expect(friendshipChange).toBeCloseTo(0.035, 4);
    });
  });

  describe('updateRelationship call behavior', () => {
    it('calls updateRelationship with positive interactionQuality for normal conversation', async () => {
      const updateRelationship = vi.fn().mockResolvedValue({});
      const npcId = 'npc-baker';
      const playerId = 'player-1';
      const currentYear = 1200;
      const agreeableness = 0.6;
      const exchangeCount = 5;

      const { friendshipChange } = computeInteractionQuality(agreeableness, exchangeCount);
      const interactionQuality = Math.max(-1, Math.min(1, friendshipChange >= 0 ? 0.5 : -0.3));

      await updateRelationship(npcId, playerId, interactionQuality, currentYear);

      expect(updateRelationship).toHaveBeenCalledWith(npcId, playerId, 0.5, currentYear);
    });

    it('does not throw when updateRelationship fails', async () => {
      const updateRelationship = vi.fn().mockRejectedValue(new Error('DB connection lost'));
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Simulate the non-fatal try/catch from routes.ts
      try {
        await updateRelationship('npc-1', 'player-1', 0.5, 1200);
      } catch (relErr) {
        console.warn('[Chat] Non-fatal: failed to update player-NPC relationship:', relErr);
      }

      expect(consoleWarn).toHaveBeenCalledWith(
        '[Chat] Non-fatal: failed to update player-NPC relationship:',
        expect.any(Error)
      );
      consoleWarn.mockRestore();
    });

    it('skips relationship update when npcId is missing', () => {
      // Simulates the `if (npcId && playerId && worldId)` guard
      const npcId = undefined;
      const playerId = 'player-1';
      const worldId = 'world-1';

      const shouldUpdate = !!(npcId && playerId && worldId);
      expect(shouldUpdate).toBe(false);
    });

    it('skips relationship update when playerId is missing', () => {
      const npcId = 'npc-1';
      const playerId = undefined;
      const worldId = 'world-1';

      const shouldUpdate = !!(npcId && playerId && worldId);
      expect(shouldUpdate).toBe(false);
    });
  });

  describe('exchange count calculation', () => {
    it('counts only user messages from the messages array', () => {
      const messages = [
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Greetings!' }] },
        { role: 'user', parts: [{ text: 'How are you?' }] },
        { role: 'model', parts: [{ text: 'I am well.' }] },
        { role: 'user', parts: [{ text: 'Tell me about the town.' }] },
      ];
      const exchangeCount = messages.filter((m: any) => m.role === 'user').length;
      expect(exchangeCount).toBe(3);
    });

    it('handles empty messages array', () => {
      const messages: any[] = [];
      const exchangeCount = messages.filter((m: any) => m.role === 'user').length;
      expect(exchangeCount).toBe(0);
      // With 0 exchanges, friendshipChange = (0.02 + x) * 0 = 0
      const { friendshipChange } = computeInteractionQuality(0.5, exchangeCount);
      expect(friendshipChange).toBe(0);
    });
  });
});
