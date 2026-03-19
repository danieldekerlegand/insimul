/**
 * Tests for RelationshipManager
 *
 * Verifies event-driven relationship tracking, tier transitions,
 * gameplay effects, and conversation context generation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEventBus } from '../GameEventBus';
import { RelationshipManager } from '../RelationshipManager';
import type { DataSource } from '../DataSource';

function createMockDataSource(): DataSource {
  return {
    questOverlay: null,
    loadWorld: vi.fn().mockResolvedValue({}),
    loadCharacters: vi.fn().mockResolvedValue([]),
    loadActions: vi.fn().mockResolvedValue([]),
    loadBaseActions: vi.fn().mockResolvedValue([]),
    loadQuests: vi.fn().mockResolvedValue([]),
    loadSettlements: vi.fn().mockResolvedValue([]),
    loadRules: vi.fn().mockResolvedValue([]),
    loadBaseRules: vi.fn().mockResolvedValue([]),
    loadCountries: vi.fn().mockResolvedValue([]),
    loadStates: vi.fn().mockResolvedValue([]),
    loadBaseResources: vi.fn().mockResolvedValue({}),
    loadAssets: vi.fn().mockResolvedValue([]),
    loadConfig3D: vi.fn().mockResolvedValue({}),
    loadTruths: vi.fn().mockResolvedValue([]),
    loadCharacter: vi.fn().mockResolvedValue(null),
    startPlaythrough: vi.fn().mockResolvedValue(null),
    updateQuest: vi.fn().mockResolvedValue(undefined),
    loadSettlementBusinesses: vi.fn().mockResolvedValue([]),
    loadSettlementLots: vi.fn().mockResolvedValue([]),
    loadSettlementResidences: vi.fn().mockResolvedValue([]),
    payFines: vi.fn().mockResolvedValue(null),
    getEntityInventory: vi.fn().mockResolvedValue({ items: [], gold: 0 }),
    transferItem: vi.fn().mockResolvedValue({ success: true }),
    getMerchantInventory: vi.fn().mockResolvedValue(null),
    loadPrologContent: vi.fn().mockResolvedValue(null),
    loadWorldItems: vi.fn().mockResolvedValue([]),
    saveGameState: vi.fn().mockResolvedValue(undefined),
    loadGameState: vi.fn().mockResolvedValue(null),
    saveQuestProgress: vi.fn().mockResolvedValue(undefined),
    loadQuestProgress: vi.fn().mockResolvedValue(null),
    loadGeography: vi.fn().mockResolvedValue(null),
    loadPlaythroughRelationships: vi.fn().mockResolvedValue([]),
    updatePlaythroughRelationship: vi.fn().mockResolvedValue({ success: true }),
  };
}

const mockCharacters = [
  { id: 'npc1', firstName: 'Alice', lastName: 'Smith' },
  { id: 'npc2', firstName: 'Bob', lastName: 'Jones' },
  { id: 'npc3', name: 'Charlie the Merchant' },
];

describe('RelationshipManager', () => {
  let eventBus: GameEventBus;
  let dataSource: DataSource;
  let manager: RelationshipManager;

  beforeEach(async () => {
    eventBus = new GameEventBus();
    dataSource = createMockDataSource();
    manager = new RelationshipManager({
      playthroughId: 'pt-1',
      playerCharacterId: 'player',
      eventBus,
      dataSource,
    });
    await manager.initialize(mockCharacters);
  });

  describe('initialization', () => {
    it('should load existing relationships from server', async () => {
      const ds = createMockDataSource();
      (ds.loadPlaythroughRelationships as any).mockResolvedValue([
        { fromCharacterId: 'player', toCharacterId: 'npc1', type: 'friendship', strength: 0.5, lastModified: Date.now() },
      ]);

      const mgr = new RelationshipManager({
        playthroughId: 'pt-2',
        playerCharacterId: 'player',
        eventBus: new GameEventBus(),
        dataSource: ds,
      });
      await mgr.initialize(mockCharacters);

      expect(mgr.getStrength('npc1')).toBe(0.5);
      expect(mgr.getTierLabel('npc1')).toBe('Friend');
    });

    it('should return 0 strength for unknown NPCs', () => {
      expect(manager.getStrength('unknown_npc')).toBe(0);
    });
  });

  describe('event-driven relationship changes', () => {
    it('should increase relationship on npc_talked', () => {
      eventBus.emit({ type: 'npc_talked', npcId: 'npc1', npcName: 'Alice Smith', turnCount: 3 });
      expect(manager.getStrength('npc1')).toBeGreaterThan(0);
    });

    it('should increase relationship on quest_completed', () => {
      eventBus.emit({ type: 'quest_completed', questId: 'q1', assignedByNpcId: 'npc2' });
      expect(manager.getStrength('npc2')).toBe(0.1);
    });

    it('should decrease relationship on quest_failed', () => {
      eventBus.emit({ type: 'quest_failed', questId: 'q1', assignedByNpcId: 'npc2' });
      expect(manager.getStrength('npc2')).toBe(-0.05);
    });

    it('should increase relationship on item_delivered', () => {
      eventBus.emit({ type: 'item_delivered', npcId: 'npc1', itemId: 'item1', itemName: 'Potion' });
      expect(manager.getStrength('npc1')).toBeGreaterThan(0);
    });

    it('should increase relationship when NPC conversation accepted', () => {
      eventBus.emit({ type: 'npc_initiated_conversation', npcId: 'npc1', npcName: 'Alice', accepted: true });
      expect(manager.getStrength('npc1')).toBeGreaterThan(0);
    });

    it('should slightly decrease relationship when NPC conversation rejected', () => {
      eventBus.emit({ type: 'npc_initiated_conversation', npcId: 'npc1', npcName: 'Alice', accepted: false });
      expect(manager.getStrength('npc1')).toBeLessThan(0);
    });

    it('should accumulate changes across multiple events', () => {
      eventBus.emit({ type: 'npc_talked', npcId: 'npc1', npcName: 'Alice', turnCount: 3 });
      eventBus.emit({ type: 'npc_talked', npcId: 'npc1', npcName: 'Alice', turnCount: 3 });
      eventBus.emit({ type: 'quest_completed', questId: 'q1', assignedByNpcId: 'npc1' });
      expect(manager.getStrength('npc1')).toBe(0.02 + 0.02 + 0.1);
    });

    it('should clamp strength to [-1, 1]', () => {
      // Force many positive events
      for (let i = 0; i < 100; i++) {
        manager.modifyRelationship('npc1', 0.1, 'test');
      }
      expect(manager.getStrength('npc1')).toBe(1.0);

      // Force many negative events
      for (let i = 0; i < 200; i++) {
        manager.modifyRelationship('npc1', -0.1, 'test');
      }
      expect(manager.getStrength('npc1')).toBe(-1.0);
    });
  });

  describe('npc_relationship_changed event emission', () => {
    it('should emit npc_relationship_changed on modifyRelationship', () => {
      const handler = vi.fn();
      eventBus.on('npc_relationship_changed', handler);

      manager.modifyRelationship('npc1', 0.1, 'test');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        type: 'npc_relationship_changed',
        npcId: 'npc1',
        previousStrength: 0,
        newStrength: 0.1,
        cause: 'test',
        delta: 0.1,
      }));
    });

    it('should include tier change info in event', () => {
      const handler = vi.fn();
      eventBus.on('npc_relationship_changed', handler);

      // Move from stranger to friend
      manager.modifyRelationship('npc1', 0.5, 'gift');

      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        previousTier: 'stranger',
        newTier: 'friend',
      }));
    });
  });

  describe('tier notifications', () => {
    it('should call onNotification when tier changes', () => {
      const onNotification = vi.fn();
      const mgr = new RelationshipManager({
        playthroughId: 'pt-1',
        playerCharacterId: 'player',
        eventBus,
        dataSource,
        onNotification,
      });
      // Don't await initialize — we just need event subscription manually
      mgr.modifyRelationship('npc1', 0.5, 'quest', 'Alice');

      expect(onNotification).toHaveBeenCalledWith(
        expect.stringContaining('Alice'),
        'success',
      );
    });

    it('should not notify when tier stays the same', () => {
      const onNotification = vi.fn();
      const mgr = new RelationshipManager({
        playthroughId: 'pt-1',
        playerCharacterId: 'player',
        eventBus,
        dataSource,
        onNotification,
      });
      // Small change within stranger tier
      mgr.modifyRelationship('npc1', 0.02, 'conversation', 'Alice');

      expect(onNotification).not.toHaveBeenCalled();
    });
  });

  describe('gameplay effects', () => {
    it('should return correct price multiplier', () => {
      expect(manager.getPriceMultiplier('npc1')).toBe(1.0); // stranger

      manager.modifyRelationship('npc1', 0.5, 'test');
      expect(manager.getPriceMultiplier('npc1')).toBe(0.9); // friend

      manager.modifyRelationship('npc1', -1.5, 'test'); // enemy
      expect(manager.getPriceMultiplier('npc1')).toBeGreaterThan(1.0);
    });

    it('should report quest offering availability', () => {
      expect(manager.canOfferQuests('npc1')).toBe(true); // stranger can offer

      manager.modifyRelationship('npc1', -0.8, 'test');
      expect(manager.canOfferQuests('npc1')).toBe(false); // enemy cannot
    });

    it('should report secret sharing availability', () => {
      expect(manager.canShareSecrets('npc1')).toBe(false); // stranger cannot

      manager.modifyRelationship('npc1', 0.5, 'test');
      expect(manager.canShareSecrets('npc1')).toBe(true); // friend can
    });
  });

  describe('conversation context', () => {
    it('should return null for strangers', () => {
      expect(manager.getConversationContext('npc1')).toBeNull();
    });

    it('should return context string for non-strangers', () => {
      manager.modifyRelationship('npc1', 0.5, 'test');
      const context = manager.getConversationContext('npc1');
      expect(context).toContain('RELATIONSHIP CONTEXT');
      expect(context).toContain('Friend');
    });

    it('should return hostile context for enemies', () => {
      manager.modifyRelationship('npc1', -0.8, 'test');
      const context = manager.getConversationContext('npc1');
      expect(context).toContain('Enemy');
      expect(context).toContain('dislike');
    });
  });

  describe('getAllRelationships', () => {
    it('should return all tracked relationships', () => {
      manager.modifyRelationship('npc1', 0.1, 'test');
      manager.modifyRelationship('npc2', 0.2, 'test');

      const all = manager.getAllRelationships();
      expect(all).toHaveLength(2);
      expect(all.map(r => r.npcId).sort()).toEqual(['npc1', 'npc2']);
    });
  });

  describe('dispose', () => {
    it('should unsubscribe from all events', () => {
      manager.dispose();

      // Events after dispose should not affect relationships
      eventBus.emit({ type: 'npc_talked', npcId: 'npc1', npcName: 'Alice', turnCount: 3 });
      expect(manager.getStrength('npc1')).toBe(0);
    });
  });
});
