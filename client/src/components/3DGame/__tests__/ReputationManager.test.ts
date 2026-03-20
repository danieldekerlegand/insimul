import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameEventBus } from '../GameEventBus';
import {
  ReputationManager,
  scoreToStanding,
  type ReputationRecord,
  type ReputationChangeEvent,
} from '../ReputationManager';

// Mock global fetch
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

function okJson(data: any) {
  return { ok: true, json: () => Promise.resolve(data) };
}

function makeRepRecord(overrides?: Partial<ReputationRecord>): ReputationRecord {
  return {
    entityType: 'settlement',
    entityId: 'settlement-1',
    entityName: 'Riverside',
    score: 0,
    standing: 'neutral',
    isBanned: false,
    banExpiry: null,
    violationCount: 0,
    outstandingFines: 0,
    hasDiscounts: false,
    hasSpecialAccess: false,
    ...overrides,
  };
}

describe('scoreToStanding', () => {
  it('returns correct standing for all score ranges', () => {
    expect(scoreToStanding(100)).toBe('revered');
    expect(scoreToStanding(51)).toBe('revered');
    expect(scoreToStanding(50)).toBe('friendly');
    expect(scoreToStanding(1)).toBe('friendly');
    expect(scoreToStanding(0)).toBe('neutral');
    expect(scoreToStanding(-49)).toBe('neutral');
    expect(scoreToStanding(-50)).toBe('unfriendly');
    expect(scoreToStanding(-99)).toBe('unfriendly');
    expect(scoreToStanding(-100)).toBe('hostile');
  });
});

describe('ReputationManager', () => {
  let eventBus: GameEventBus;
  let manager: ReputationManager;

  beforeEach(() => {
    fetchMock.mockReset();
    eventBus = new GameEventBus();
    manager = new ReputationManager('pt-1', 'token-abc', eventBus);
  });

  afterEach(() => {
    manager.dispose();
    eventBus.dispose();
  });

  describe('loadAll', () => {
    it('populates cache from server response', async () => {
      fetchMock.mockResolvedValueOnce(okJson([
        { entityType: 'settlement', entityId: 's1', entityName: 'Town A', score: 25, standing: 'friendly', isBanned: false, violationCount: 0, outstandingFines: 0 },
        { entityType: 'settlement', entityId: 's2', entityName: 'Town B', score: -60, standing: 'unfriendly', isBanned: false, violationCount: 2, outstandingFines: 50 },
      ]));

      await manager.loadAll();

      expect(manager.getAllReputations()).toHaveLength(2);
      expect(manager.getStanding('settlement', 's1')).toBe('friendly');
      expect(manager.getStanding('settlement', 's2')).toBe('unfriendly');
    });

    it('handles fetch failure gracefully', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false });
      await manager.loadAll();
      expect(manager.getAllReputations()).toHaveLength(0);
    });
  });

  describe('getReputation', () => {
    it('returns undefined for unknown entities', () => {
      expect(manager.getReputation('settlement', 'nonexistent')).toBeUndefined();
    });
  });

  describe('getStanding', () => {
    it('defaults to neutral for unknown entities', () => {
      expect(manager.getStanding('settlement', 'unknown')).toBe('neutral');
    });
  });

  describe('getPriceMultiplier', () => {
    it('returns 1.0 for neutral standing', () => {
      expect(manager.getPriceMultiplier('unknown')).toBe(1.0);
    });

    it('returns higher multiplier for unfriendly standing', async () => {
      fetchMock.mockResolvedValueOnce(okJson([
        { entityType: 'settlement', entityId: 's1', score: -60, standing: 'unfriendly' },
      ]));
      await manager.loadAll();
      expect(manager.getPriceMultiplier('s1')).toBe(1.3);
    });

    it('returns lower multiplier for friendly standing', async () => {
      fetchMock.mockResolvedValueOnce(okJson([
        { entityType: 'settlement', entityId: 's1', score: 30, standing: 'friendly' },
      ]));
      await manager.loadAll();
      expect(manager.getPriceMultiplier('s1')).toBe(0.9);
    });
  });

  describe('willNPCTalk', () => {
    it('returns true for neutral standing', () => {
      expect(manager.willNPCTalk('s1')).toBe(true);
    });

    it('returns false for hostile standing', async () => {
      fetchMock.mockResolvedValueOnce(okJson([
        { entityType: 'settlement', entityId: 's1', score: -100, standing: 'hostile' },
      ]));
      await manager.loadAll();
      expect(manager.willNPCTalk('s1')).toBe(false);
    });
  });

  describe('canReceiveQuests', () => {
    it('returns true for neutral and above', () => {
      expect(manager.canReceiveQuests('s1')).toBe(true);
    });

    it('returns false for unfriendly standing', async () => {
      fetchMock.mockResolvedValueOnce(okJson([
        { entityType: 'settlement', entityId: 's1', score: -60, standing: 'unfriendly' },
      ]));
      await manager.loadAll();
      expect(manager.canReceiveQuests('s1')).toBe(false);
    });
  });

  describe('isBanned', () => {
    it('returns false by default', () => {
      expect(manager.isBanned('s1')).toBe(false);
    });

    it('returns true when banned', async () => {
      fetchMock.mockResolvedValueOnce(okJson([
        { entityType: 'settlement', entityId: 's1', isBanned: true },
      ]));
      await manager.loadAll();
      expect(manager.isBanned('s1')).toBe(true);
    });
  });

  describe('getConversationContext', () => {
    it('returns null for neutral standing', () => {
      expect(manager.getConversationContext('unknown')).toBeNull();
    });

    it('returns hostile context for hostile standing', async () => {
      fetchMock.mockResolvedValueOnce(okJson([
        { entityType: 'settlement', entityId: 's1', entityName: 'Town', score: -100, standing: 'hostile' },
      ]));
      await manager.loadAll();
      const ctx = manager.getConversationContext('s1');
      expect(ctx).toContain('REPUTATION CONTEXT');
      expect(ctx).toContain('hostile');
    });

    it('returns friendly context for friendly standing', async () => {
      fetchMock.mockResolvedValueOnce(okJson([
        { entityType: 'settlement', entityId: 's1', entityName: 'Town', score: 30, standing: 'friendly' },
      ]));
      await manager.loadAll();
      const ctx = manager.getConversationContext('s1');
      expect(ctx).toContain('good reputation');
    });

    it('returns revered context for revered standing', async () => {
      fetchMock.mockResolvedValueOnce(okJson([
        { entityType: 'settlement', entityId: 's1', entityName: 'Town', score: 80, standing: 'revered' },
      ]));
      await manager.loadAll();
      const ctx = manager.getConversationContext('s1');
      expect(ctx).toContain('revered');
    });
  });

  describe('adjustReputation', () => {
    it('calls API and updates cache', async () => {
      fetchMock.mockResolvedValueOnce(okJson({
        entityType: 'settlement',
        entityId: 's1',
        score: 10,
        standing: 'friendly',
        isBanned: false,
        violationCount: 0,
        outstandingFines: 0,
      }));

      await manager.adjustReputation('settlement', 's1', 'Town', 10, 'quest completed');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/playthroughs/pt-1/reputations/settlement/s1/adjust',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ amount: 10, reason: 'quest completed' }),
        }),
      );
      expect(manager.getReputation('settlement', 's1')?.score).toBe(10);
    });

    it('notifies change listeners', async () => {
      fetchMock.mockResolvedValueOnce(okJson({
        entityType: 'settlement',
        entityId: 's1',
        score: 10,
        standing: 'friendly',
      }));

      const listener = vi.fn();
      manager.onReputationChange(listener);

      await manager.adjustReputation('settlement', 's1', 'Town', 10, 'helped NPC');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: 's1',
          delta: 10,
          reason: 'helped NPC',
        }),
      );
    });

    it('emits reputation_changed event on the bus', async () => {
      fetchMock.mockResolvedValueOnce(okJson({
        entityType: 'settlement',
        entityId: 's1',
        score: 10,
        standing: 'friendly',
      }));

      const handler = vi.fn();
      eventBus.on('reputation_changed', handler);

      await manager.adjustReputation('settlement', 's1', 'Town', 10, 'test');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'reputation_changed', factionId: 's1', delta: 10 }),
      );
    });
  });

  describe('event-driven reputation changes', () => {
    it('increases reputation on quest_completed when in a settlement', async () => {
      manager.setCurrentSettlement('s1', 'Town');

      fetchMock.mockResolvedValueOnce(okJson({
        entityType: 'settlement',
        entityId: 's1',
        score: 10,
        standing: 'friendly',
      }));

      eventBus.emit({ type: 'quest_completed', questId: 'q1' });

      // Wait for async handler
      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('/adjust'),
          expect.objectContaining({
            body: expect.stringContaining('"amount":10'),
          }),
        );
      });
    });

    it('decreases reputation on quest_failed when in a settlement', async () => {
      manager.setCurrentSettlement('s1', 'Town');

      fetchMock.mockResolvedValueOnce(okJson({
        entityType: 'settlement',
        entityId: 's1',
        score: -5,
        standing: 'neutral',
      }));

      eventBus.emit({ type: 'quest_failed', questId: 'q1' });

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('/adjust'),
          expect.objectContaining({
            body: expect.stringContaining('"amount":-5'),
          }),
        );
      });
    });

    it('does not adjust reputation when not in a settlement', () => {
      // No setCurrentSettlement called
      eventBus.emit({ type: 'quest_completed', questId: 'q1' });
      // fetch should not be called for adjustment
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('grants small reputation for NPC conversation with enough turns', async () => {
      manager.setCurrentSettlement('s1', 'Town');

      fetchMock.mockResolvedValueOnce(okJson({
        entityType: 'settlement',
        entityId: 's1',
        score: 2,
        standing: 'neutral',
      }));

      eventBus.emit({ type: 'npc_talked', npcId: 'npc-1', npcName: 'Bob', turnCount: 5 });

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('/adjust'),
          expect.objectContaining({
            body: expect.stringContaining('"amount":2'),
          }),
        );
      });
    });

    it('does not grant reputation for short conversations', () => {
      manager.setCurrentSettlement('s1', 'Town');
      eventBus.emit({ type: 'npc_talked', npcId: 'npc-1', npcName: 'Bob', turnCount: 1 });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('respects conversation cooldown per NPC', async () => {
      manager.setCurrentSettlement('s1', 'Town');

      fetchMock.mockResolvedValueOnce(okJson({
        entityType: 'settlement',
        entityId: 's1',
        score: 2,
        standing: 'neutral',
      }));

      // First conversation
      eventBus.emit({ type: 'npc_talked', npcId: 'npc-1', npcName: 'Bob', turnCount: 5 });

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      // Second conversation within cooldown — should NOT trigger
      eventBus.emit({ type: 'npc_talked', npcId: 'npc-1', npcName: 'Bob', turnCount: 5 });

      // Still only 1 call
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('serialize / restore', () => {
    it('round-trips cache state', async () => {
      fetchMock.mockResolvedValueOnce(okJson([
        { entityType: 'settlement', entityId: 's1', entityName: 'Town A', score: 30, standing: 'friendly', isBanned: false },
      ]));
      await manager.loadAll();

      const serialized = manager.serialize();
      expect(serialized).toHaveLength(1);

      // Create a fresh manager and restore
      const manager2 = new ReputationManager('pt-1', 'token-abc', eventBus);
      manager2.restore(serialized);

      expect(manager2.getStanding('settlement', 's1')).toBe('friendly');
      expect(manager2.getReputation('settlement', 's1')?.score).toBe(30);
      manager2.dispose();
    });
  });

  describe('recordTheft', () => {
    it('applies a -15 reputation adjustment', async () => {
      fetchMock.mockResolvedValueOnce(okJson({
        entityType: 'settlement',
        entityId: 's1',
        score: -15,
        standing: 'neutral',
      }));

      await manager.recordTheft('s1', 'Town');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/adjust'),
        expect.objectContaining({
          body: expect.stringContaining('"amount":-15'),
        }),
      );
    });
  });

  describe('item_purchased event', () => {
    it('grants +2 reputation when in a settlement', async () => {
      manager.setCurrentSettlement('s1', 'Town');

      fetchMock.mockResolvedValueOnce(okJson({
        entityType: 'settlement',
        entityId: 's1',
        score: 2,
        standing: 'neutral',
      }));

      eventBus.emit({ type: 'item_purchased', itemId: 'i1', itemName: 'Bread', quantity: 1, totalPrice: 10 });

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('/adjust'),
          expect.objectContaining({
            body: expect.stringContaining('"amount":2'),
          }),
        );
      });
    });

    it('does not grant reputation when not in a settlement', () => {
      eventBus.emit({ type: 'item_purchased', itemId: 'i1', itemName: 'Bread', quantity: 1, totalPrice: 10 });
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('gift_given event', () => {
    it('grants +3 reputation when in a settlement', async () => {
      manager.setCurrentSettlement('s1', 'Town');

      fetchMock.mockResolvedValueOnce(okJson({
        entityType: 'settlement',
        entityId: 's1',
        score: 3,
        standing: 'neutral',
      }));

      eventBus.emit({ type: 'gift_given', npcId: 'npc-1', npcName: 'Alice', itemName: 'Flowers' });

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('/adjust'),
          expect.objectContaining({
            body: expect.stringContaining('"amount":3'),
          }),
        );
      });
    });

    it('includes NPC name in reason', async () => {
      manager.setCurrentSettlement('s1', 'Town');

      fetchMock.mockResolvedValueOnce(okJson({
        entityType: 'settlement',
        entityId: 's1',
        score: 3,
        standing: 'neutral',
      }));

      eventBus.emit({ type: 'gift_given', npcId: 'npc-1', npcName: 'Alice', itemName: 'Flowers' });

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('/adjust'),
          expect.objectContaining({
            body: expect.stringContaining('Alice'),
          }),
        );
      });
    });
  });

  describe('settlement_entered event', () => {
    it('creates default neutral record for new settlement', () => {
      eventBus.emit({ type: 'settlement_entered', settlementId: 's-new', settlementName: 'New Town' });
      const rep = manager.getReputation('settlement', 's-new');
      expect(rep).toBeDefined();
      expect(rep?.standing).toBe('neutral');
      expect(rep?.score).toBe(0);
    });
  });

  describe('dispose', () => {
    it('clears cache and listeners', () => {
      manager.setCurrentSettlement('s1', 'Town');
      eventBus.emit({ type: 'settlement_entered', settlementId: 's1', settlementName: 'Town' });

      manager.dispose();
      expect(manager.getAllReputations()).toHaveLength(0);
    });
  });

  describe('listener unsubscribe', () => {
    it('stops notifying after unsubscribe', async () => {
      fetchMock.mockResolvedValue(okJson({
        entityType: 'settlement',
        entityId: 's1',
        score: 10,
        standing: 'friendly',
      }));

      const listener = vi.fn();
      const unsub = manager.onReputationChange(listener);

      await manager.adjustReputation('settlement', 's1', 'Town', 10, 'test');
      expect(listener).toHaveBeenCalledTimes(1);

      unsub();
      await manager.adjustReputation('settlement', 's1', 'Town', 5, 'test2');
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
