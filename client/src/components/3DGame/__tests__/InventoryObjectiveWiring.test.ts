/**
 * Tests for inventory ↔ quest objective wiring.
 *
 * Verifies that collect_item, deliver_item, and give_gift objectives
 * integrate correctly with inventory operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../QuestCompletionEngine';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjective(
  overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string }
): CompletionObjective {
  return { description: 'test', completed: false, ...overrides };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

/** Minimal inventory mock for integration testing */
function createMockInventory(items: Array<{ id: string; name: string; type: string }>) {
  const itemMap = new Map(items.map(i => [i.id, { ...i, quantity: 1 }]));
  return {
    getAllItems: () => Array.from(itemMap.values()),
    removeItem: vi.fn((id: string, _qty: number) => { itemMap.delete(id); }),
    addItem: vi.fn((item: any) => { itemMap.set(item.id, item); }),
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Inventory ↔ Quest Objective Wiring', () => {
  let engine: QuestCompletionEngine;
  let objectiveCompletedSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
    objectiveCompletedSpy = vi.fn();
    engine.setOnObjectiveCompleted(objectiveCompletedSpy);
  });

  // ── collect_item ───────────────────────────────────────────────────────

  describe('collect_item → inventory', () => {
    it('completes when collected item name matches objective', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'collect_item', itemName: 'Ruby',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      // Simulate: player picks up item → addItem to inventory → trackCollectedItemByName
      const inventory = createMockInventory([]);
      inventory.addItem({ id: 'ruby-1', name: 'Ruby', type: 'collectible' });
      engine.trackCollectedItemByName('Ruby');

      expect(obj.completed).toBe(true);
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
    });

    it('is case-insensitive', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'collect_item', itemName: 'Magic Scroll',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackCollectedItemByName('magic scroll');
      expect(obj.completed).toBe(true);
    });

    it('checkInventoryObjectives completes collect_item for items already in inventory', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'collect_item', itemName: 'Sword',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      // Player already has the item
      engine.checkInventoryObjectives(['sword', 'shield']);
      expect(obj.completed).toBe(true);
    });
  });

  // ── deliver_item ───────────────────────────────────────────────────────

  describe('deliver_item → inventory removal', () => {
    it('completes and marks delivered when NPC + item match', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'deliver_item',
        npcId: 'npc-baker', itemName: 'Flour Bag',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const inventory = createMockInventory([
        { id: 'flour-1', name: 'Flour Bag', type: 'quest' },
      ]);

      // Simulate the checkDeliverItemObjectives flow:
      // 1. Get player item names
      const playerItemNames = inventory.getAllItems().map(i => i.name);
      // 2. Find matching objectives before tracking
      const quests = engine.getQuests();
      const deliverableItemIds: string[] = [];
      for (const quest of quests) {
        for (const o of quest.objectives || []) {
          if (o.type !== 'deliver_item' || o.completed) continue;
          if (o.npcId && o.npcId !== 'npc-baker') continue;
          if (o.itemName) {
            const match = inventory.getAllItems().find(
              i => i.name.toLowerCase() === o.itemName!.toLowerCase()
            );
            if (match) deliverableItemIds.push(match.id);
          }
        }
      }
      // 3. Track delivery
      engine.trackItemDelivery('npc-baker', playerItemNames);
      // 4. Remove items
      for (const id of deliverableItemIds) {
        inventory.removeItem(id, 1);
      }

      expect(obj.completed).toBe(true);
      expect(obj.delivered).toBe(true);
      expect(inventory.removeItem).toHaveBeenCalledWith('flour-1', 1);
    });

    it('does not remove items when NPC does not match', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'deliver_item',
        npcId: 'npc-baker', itemName: 'Flour Bag',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const inventory = createMockInventory([
        { id: 'flour-1', name: 'Flour Bag', type: 'quest' },
      ]);

      // Wrong NPC — should not match
      const quests = engine.getQuests();
      const deliverableItemIds: string[] = [];
      for (const quest of quests) {
        for (const o of quest.objectives || []) {
          if (o.type !== 'deliver_item' || o.completed) continue;
          if (o.npcId && o.npcId !== 'npc-smith') continue;
          if (o.itemName) {
            const match = inventory.getAllItems().find(
              i => i.name.toLowerCase() === o.itemName!.toLowerCase()
            );
            if (match) deliverableItemIds.push(match.id);
          }
        }
      }

      engine.trackItemDelivery('npc-smith', inventory.getAllItems().map(i => i.name));
      for (const id of deliverableItemIds) {
        inventory.removeItem(id, 1);
      }

      expect(obj.completed).toBe(false);
      expect(inventory.removeItem).not.toHaveBeenCalled();
    });

    it('handles multiple deliver_item objectives across quests', () => {
      const obj1 = makeObjective({
        id: 'o1', questId: 'q1', type: 'deliver_item',
        npcId: 'npc-baker', itemName: 'Flour Bag',
      });
      const obj2 = makeObjective({
        id: 'o2', questId: 'q2', type: 'deliver_item',
        npcId: 'npc-baker', itemName: 'Sugar',
      });
      engine.addQuest(makeQuest('q1', [obj1]));
      engine.addQuest(makeQuest('q2', [obj2]));

      const inventory = createMockInventory([
        { id: 'flour-1', name: 'Flour Bag', type: 'quest' },
        { id: 'sugar-1', name: 'Sugar', type: 'quest' },
      ]);

      engine.trackItemDelivery('npc-baker', inventory.getAllItems().map(i => i.name));

      expect(obj1.completed).toBe(true);
      expect(obj2.completed).toBe(true);
    });
  });

  // ── give_gift ──────────────────────────────────────────────────────────

  describe('give_gift → inventory removal', () => {
    it('completes objective and selects matching quest item', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'give_gift',
        npcId: 'npc-1', itemName: 'Bouquet',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const inventory = createMockInventory([
        { id: 'bouquet-1', name: 'Bouquet', type: 'collectible' },
        { id: 'sword-1', name: 'Sword', type: 'weapon' },
      ]);

      // Simulate findGiftItemForNpc: check give_gift objectives for item match
      let giftItem: { id: string; name: string; type: string } | null = null;
      const quests = engine.getQuests();
      for (const quest of quests) {
        for (const o of quest.objectives || []) {
          if (o.type !== 'give_gift' || o.completed) continue;
          if (o.npcId && o.npcId !== 'npc-1') continue;
          if (o.itemName) {
            const match = inventory.getAllItems().find(
              i => i.name.toLowerCase() === o.itemName!.toLowerCase()
            );
            if (match) { giftItem = match; break; }
          }
        }
        if (giftItem) break;
      }

      expect(giftItem).not.toBeNull();
      engine.trackGiftGiven('npc-1', giftItem!.name);
      inventory.removeItem(giftItem!.id, 1);

      expect(obj.completed).toBe(true);
      expect(inventory.removeItem).toHaveBeenCalledWith('bouquet-1', 1);
    });

    it('falls back to non-quest item when no objective item matches', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'give_gift',
        npcId: 'npc-1',
        // No itemName specified — any gift works
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const inventory = createMockInventory([
        { id: 'key-1', name: 'Dungeon Key', type: 'key' },
        { id: 'apple-1', name: 'Apple', type: 'consumable' },
      ]);

      // Simulate: no specific item match, fall back to first non-quest/key item
      const items = inventory.getAllItems();
      const fallback = items.find(i => i.type !== 'quest' && i.type !== 'key') || null;

      expect(fallback).not.toBeNull();
      expect(fallback!.name).toBe('Apple');

      engine.trackGiftGiven('npc-1', fallback!.name);
      inventory.removeItem(fallback!.id, 1);

      expect(obj.completed).toBe(true);
      expect(inventory.removeItem).toHaveBeenCalledWith('apple-1', 1);
    });

    it('still completes objective even without an item in inventory', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'give_gift',
        npcId: 'npc-1',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      // No items — still track with empty string
      engine.trackGiftGiven('npc-1', '');
      expect(obj.completed).toBe(true);
    });
  });

  // ── Mixed scenarios ────────────────────────────────────────────────────

  describe('mixed inventory objective scenarios', () => {
    it('collect then deliver workflow', () => {
      const collectObj = makeObjective({
        id: 'o1', questId: 'q1', type: 'collect_item', itemName: 'Package',
      });
      const deliverObj = makeObjective({
        id: 'o2', questId: 'q1', type: 'deliver_item',
        npcId: 'npc-postman', itemName: 'Package',
        dependsOn: ['o1'],
      });
      engine.addQuest(makeQuest('q1', [collectObj, deliverObj]));

      // Step 1: collect the item
      engine.trackCollectedItemByName('Package');
      expect(collectObj.completed).toBe(true);
      expect(deliverObj.completed).toBe(false);

      // Step 2: deliver to NPC (now unlocked since o1 is done)
      engine.trackItemDelivery('npc-postman', ['Package']);
      expect(deliverObj.completed).toBe(true);
      expect(deliverObj.delivered).toBe(true);
    });

    it('does not complete locked deliver_item before collect dependency', () => {
      const collectObj = makeObjective({
        id: 'o1', questId: 'q1', type: 'collect_item', itemName: 'Letter',
      });
      const deliverObj = makeObjective({
        id: 'o2', questId: 'q1', type: 'deliver_item',
        npcId: 'npc-1', itemName: 'Letter',
        dependsOn: ['o1'],
      });
      engine.addQuest(makeQuest('q1', [collectObj, deliverObj]));

      // Try to deliver before collecting — should be locked
      engine.trackItemDelivery('npc-1', ['Letter']);
      expect(deliverObj.completed).toBe(false);
    });
  });
});
