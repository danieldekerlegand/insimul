/**
 * Tests for item event bridges in BabylonGame.ts
 *
 * Verifies that item_used, item_equipped, item_dropped, item_purchased, and
 * item_crafted events emitted on GameEventBus are forwarded to
 * QuestCompletionEngine.handleGameEvent() so that use_item, equip_item,
 * drop_item, buy_item, and craft_item quest objectives can complete.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../game-engine/logic/QuestCompletionEngine';
import { GameEventBus } from '../game-engine/logic/GameEventBus';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjective(
  overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string },
): CompletionObjective {
  return {
    description: 'test objective',
    completed: false,
    ...overrides,
  };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

/**
 * Simulates the event bridge pattern used in BabylonGame.ts:
 * eventBus.on(eventType) → engine.handleGameEvent(event)
 */
function wireItemEventBridges(eventBus: GameEventBus, engine: QuestCompletionEngine) {
  eventBus.on('item_used', (event: any) => {
    engine.handleGameEvent({ type: 'item_used', itemName: event.itemName, itemId: event.itemId });
  });
  eventBus.on('item_equipped', (event: any) => {
    engine.handleGameEvent({ type: 'item_equipped', itemName: event.itemName, itemId: event.itemId, slot: event.slot });
  });
  eventBus.on('item_dropped', (event: any) => {
    engine.handleGameEvent({ type: 'item_dropped', itemName: event.itemName, itemId: event.itemId });
  });
  eventBus.on('item_purchased', (event: any) => {
    engine.handleGameEvent({ type: 'item_purchased', itemName: event.itemName, itemId: event.itemId, merchantId: event.merchantId });
  });
  eventBus.on('item_crafted', (event: any) => {
    engine.handleGameEvent({ type: 'item_crafted', itemName: event.itemName, itemId: event.itemId });
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Item Event Bridges → Quest Completion', () => {
  let engine: QuestCompletionEngine;
  let eventBus: GameEventBus;
  let objectiveCompletedSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
    eventBus = new GameEventBus();
    objectiveCompletedSpy = vi.fn();
    engine.setOnObjectiveCompleted(objectiveCompletedSpy);
    wireItemEventBridges(eventBus, engine);
  });

  // ── use_item ─────────────────────────────────────────────────────────────

  describe('item_used → use_item objective', () => {
    it('completes use_item objective when item_used event fires', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'use_item',
        itemName: 'healing_potion',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      eventBus.emit({ type: 'item_used', itemId: 'hp1', itemName: 'healing_potion' });

      expect(obj.completed).toBe(true);
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
    });

    it('completes use_item with case-insensitive partial match', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'use_item',
        itemName: 'potion',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      eventBus.emit({ type: 'item_used', itemId: 'hp1', itemName: 'Healing Potion' });

      expect(obj.completed).toBe(true);
    });

    it('tracks quantity for use_item objectives', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'use_item',
        itemName: 'bread',
        requiredCount: 3,
        currentCount: 0,
      } as any);
      engine.addQuest(makeQuest('q1', [obj]));

      eventBus.emit({ type: 'item_used', itemId: 'b1', itemName: 'bread' });
      expect(obj.completed).toBe(false);
      expect((obj as any).currentCount).toBe(1);

      eventBus.emit({ type: 'item_used', itemId: 'b2', itemName: 'bread' });
      expect(obj.completed).toBe(false);

      eventBus.emit({ type: 'item_used', itemId: 'b3', itemName: 'bread' });
      expect(obj.completed).toBe(true);
    });
  });

  // ── equip_item ───────────────────────────────────────────────────────────

  describe('item_equipped → equip_item objective', () => {
    it('completes equip_item objective when item_equipped event fires', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'equip_item',
        itemName: 'iron_sword',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      eventBus.emit({ type: 'item_equipped', itemId: 'sw1', itemName: 'iron_sword', slot: 'weapon' });

      expect(obj.completed).toBe(true);
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
    });
  });

  // ── drop_item ────────────────────────────────────────────────────────────

  describe('item_dropped → drop_item objective', () => {
    it('completes drop_item objective when item_dropped event fires', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'drop_item',
        itemName: 'old_boots',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      eventBus.emit({ type: 'item_dropped', itemId: 'b1', itemName: 'old_boots', quantity: 1 });

      expect(obj.completed).toBe(true);
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
    });
  });

  // ── buy_item ─────────────────────────────────────────────────────────────

  describe('item_purchased → buy_item objective', () => {
    it('completes buy_item objective when item_purchased event fires', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'buy_item',
        itemName: 'bread',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      eventBus.emit({
        type: 'item_purchased',
        itemId: 'br1',
        itemName: 'fresh bread',
        quantity: 1,
        totalPrice: 5,
        merchantId: 'baker1',
      });

      expect(obj.completed).toBe(true);
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
    });

    it('tracks quantity for buy_item objectives', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'buy_item',
        itemName: 'fish',
        requiredCount: 2,
        currentCount: 0,
      } as any);
      engine.addQuest(makeQuest('q1', [obj]));

      eventBus.emit({ type: 'item_purchased', itemId: 'f1', itemName: 'fish', quantity: 1, totalPrice: 3 });
      expect(obj.completed).toBe(false);

      eventBus.emit({ type: 'item_purchased', itemId: 'f2', itemName: 'fish', quantity: 1, totalPrice: 3 });
      expect(obj.completed).toBe(true);
    });
  });

  // ── craft_item (via handleGameEvent) ─────────────────────────────────────

  describe('item_crafted → craft_item objective (generic matcher)', () => {
    it('completes craft_item objective when item_crafted event fires via generic matcher', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'craft_item',
        itemName: 'wooden_bowl',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      eventBus.emit({ type: 'item_crafted', itemId: 'wb1', itemName: 'wooden_bowl', quantity: 1 });

      expect(obj.completed).toBe(true);
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
    });
  });

  // ── Edge cases ───────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('does not complete objective when item name does not match', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'use_item',
        itemName: 'healing_potion',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      eventBus.emit({ type: 'item_used', itemId: 'x1', itemName: 'mana_potion' });

      expect(obj.completed).toBe(false);
    });

    it('does not complete already-completed objectives', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'equip_item',
        itemName: 'sword',
      });
      obj.completed = true;
      engine.addQuest(makeQuest('q1', [obj]));

      eventBus.emit({ type: 'item_equipped', itemId: 'sw1', itemName: 'sword', slot: 'weapon' });

      expect(objectiveCompletedSpy).not.toHaveBeenCalled();
    });

    it('completes use_item without itemName filter (any item use counts)', () => {
      const obj = makeObjective({
        id: 'o1',
        questId: 'q1',
        type: 'use_item',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      eventBus.emit({ type: 'item_used', itemId: 'x1', itemName: 'anything' });

      expect(obj.completed).toBe(true);
    });
  });
});
