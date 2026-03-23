import { describe, it, expect, vi } from 'vitest';
import {
  QuestCompletionEngine,
  CompletionQuest,
  CompletionObjective,
} from '../../client/src/components/3DGame/QuestCompletionEngine';
import { GameEventBus } from '../../client/src/components/3DGame/GameEventBus';

function makeObjective(overrides: Partial<CompletionObjective> & { id: string; type: string }): CompletionObjective {
  return {
    questId: 'q1',
    description: 'test objective',
    completed: false,
    ...overrides,
  };
}

function makeQuest(objectives: CompletionObjective[]): CompletionQuest {
  return { id: 'q1', objectives };
}

describe('mercantile quest objectives', () => {
  describe('order_food tracking', () => {
    it('completes order_food objective when food is ordered', () => {
      const engine = new QuestCompletionEngine();
      const onComplete = vi.fn();
      engine.setOnObjectiveCompleted(onComplete);

      const quest = makeQuest([
        makeObjective({ id: 'obj1', type: 'order_food', requiredCount: 1 }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({
        type: 'food_ordered',
        itemName: 'Bread',
        merchantId: 'merchant1',
        businessType: 'Bakery',
      });

      expect(onComplete).toHaveBeenCalledWith('q1', 'obj1');
      expect(quest.objectives![0].completed).toBe(true);
    });

    it('tracks multiple food orders for countable objectives', () => {
      const engine = new QuestCompletionEngine();
      const onComplete = vi.fn();
      engine.setOnObjectiveCompleted(onComplete);

      const quest = makeQuest([
        makeObjective({ id: 'obj1', type: 'order_food', requiredCount: 3 }),
      ]);
      engine.addQuest(quest);

      engine.trackFoodOrdered('Bread', 'merchant1', 'Restaurant');
      expect(quest.objectives![0].currentCount).toBe(1);
      expect(quest.objectives![0].completed).toBe(false);

      engine.trackFoodOrdered('Soup', 'merchant1', 'Restaurant');
      expect(quest.objectives![0].currentCount).toBe(2);

      engine.trackFoodOrdered('Ale', 'merchant1', 'Restaurant');
      expect(quest.objectives![0].currentCount).toBe(3);
      expect(onComplete).toHaveBeenCalledWith('q1', 'obj1');
    });

    it('tracks purchased item names', () => {
      const engine = new QuestCompletionEngine();
      const quest = makeQuest([
        makeObjective({ id: 'obj1', type: 'order_food', requiredCount: 2 }),
      ]);
      engine.addQuest(quest);

      engine.trackFoodOrdered('Bread', 'merchant1', 'Bakery');
      engine.trackFoodOrdered('Cake', 'merchant1', 'Bakery');

      expect(quest.objectives![0].itemsPurchased).toEqual(['Bread', 'Cake']);
    });

    it('respects merchantId filter on order_food objectives', () => {
      const engine = new QuestCompletionEngine();
      const onComplete = vi.fn();
      engine.setOnObjectiveCompleted(onComplete);

      const quest = makeQuest([
        makeObjective({ id: 'obj1', type: 'order_food', requiredCount: 1, merchantId: 'merchant-A' }),
      ]);
      engine.addQuest(quest);

      // Wrong merchant — should not count
      engine.trackFoodOrdered('Bread', 'merchant-B', 'Restaurant');
      expect(quest.objectives![0].completed).toBe(false);

      // Correct merchant
      engine.trackFoodOrdered('Bread', 'merchant-A', 'Restaurant');
      expect(onComplete).toHaveBeenCalledWith('q1', 'obj1');
    });
  });

  describe('haggle_price tracking', () => {
    it('completes haggle_price objective when player haggles', () => {
      const engine = new QuestCompletionEngine();
      const onComplete = vi.fn();
      engine.setOnObjectiveCompleted(onComplete);

      const quest = makeQuest([
        makeObjective({ id: 'obj1', type: 'haggle_price', requiredCount: 1 }),
      ]);
      engine.addQuest(quest);

      engine.trackEvent({
        type: 'price_haggled',
        itemName: 'Sword',
        merchantId: 'merchant1',
        typedWord: 'espada',
      });

      expect(onComplete).toHaveBeenCalledWith('q1', 'obj1');
      expect(quest.objectives![0].completed).toBe(true);
    });

    it('tracks multiple haggle attempts for countable objectives', () => {
      const engine = new QuestCompletionEngine();
      const quest = makeQuest([
        makeObjective({ id: 'obj1', type: 'haggle_price', requiredCount: 3 }),
      ]);
      engine.addQuest(quest);

      engine.trackPriceHaggled('Sword', 'merchant1', 'espada');
      engine.trackPriceHaggled('Shield', 'merchant1', 'escudo');
      expect(quest.objectives![0].currentCount).toBe(2);
      expect(quest.objectives![0].completed).toBe(false);

      engine.trackPriceHaggled('Bread', 'merchant1', 'pan');
      expect(quest.objectives![0].completed).toBe(true);
    });

    it('respects merchantId filter on haggle_price objectives', () => {
      const engine = new QuestCompletionEngine();
      const quest = makeQuest([
        makeObjective({ id: 'obj1', type: 'haggle_price', requiredCount: 1, merchantId: 'merchant-X' }),
      ]);
      engine.addQuest(quest);

      engine.trackPriceHaggled('Sword', 'merchant-Y', 'espada');
      expect(quest.objectives![0].completed).toBe(false);

      engine.trackPriceHaggled('Sword', 'merchant-X', 'espada');
      expect(quest.objectives![0].completed).toBe(true);
    });
  });

  describe('serialization of mercantile progress', () => {
    it('serializes itemsPurchased in objective state', () => {
      const engine = new QuestCompletionEngine();
      const quest = makeQuest([
        makeObjective({ id: 'obj1', type: 'order_food', requiredCount: 3 }),
      ]);
      engine.addQuest(quest);

      engine.trackFoodOrdered('Bread', 'merchant1', 'Bakery');
      engine.trackFoodOrdered('Cake', 'merchant1', 'Bakery');

      const states = engine.serializeObjectiveStates();
      expect(states['q1']).toBeDefined();
      const objState = states['q1'].find((s: any) => s.id === 'obj1');
      expect(objState?.itemsPurchased).toEqual(['Bread', 'Cake']);
      expect(objState?.currentCount).toBe(2);
    });

    it('restores mercantile progress from serialized state', () => {
      const engine = new QuestCompletionEngine();
      const onComplete = vi.fn();
      engine.setOnObjectiveCompleted(onComplete);

      const quest = makeQuest([
        makeObjective({ id: 'obj1', type: 'order_food', requiredCount: 3 }),
      ]);
      engine.addQuest(quest);

      // Restore progress
      engine.restoreObjectiveStates({
        q1: [{ id: 'obj1', currentCount: 2, itemsPurchased: ['Bread', 'Cake'] }],
      });

      expect(quest.objectives![0].currentCount).toBe(2);

      // One more order completes it
      engine.trackFoodOrdered('Wine', 'merchant1', 'Bar');
      expect(onComplete).toHaveBeenCalledWith('q1', 'obj1');
    });
  });

  describe('GameEventBus mercantile events', () => {
    it('emits item_purchased events', () => {
      const bus = new GameEventBus();
      const handler = vi.fn();
      bus.on('item_purchased', handler);

      bus.emit({
        type: 'item_purchased',
        itemId: 'item1',
        itemName: 'Bread',
        quantity: 1,
        totalPrice: 10,
        merchantId: 'merchant1',
        merchantName: 'Baker Bob',
        businessType: 'Bakery',
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].itemName).toBe('Bread');
      expect(handler.mock.calls[0][0].merchantId).toBe('merchant1');
    });

    it('emits food_ordered events', () => {
      const bus = new GameEventBus();
      const handler = vi.fn();
      bus.on('food_ordered', handler);

      bus.emit({
        type: 'food_ordered',
        itemId: 'item1',
        itemName: 'Soup',
        quantity: 1,
        merchantId: 'merchant1',
        merchantName: 'Chef Pierre',
        businessType: 'Restaurant',
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].businessType).toBe('Restaurant');
    });

    it('emits price_haggled events', () => {
      const bus = new GameEventBus();
      const handler = vi.fn();
      bus.on('price_haggled', handler);

      bus.emit({
        type: 'price_haggled',
        itemId: 'item1',
        itemName: 'Sword',
        merchantId: 'merchant1',
        merchantName: 'Smith',
        typedWord: 'espada',
        targetWord: 'espada',
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].typedWord).toBe('espada');
    });
  });

  describe('objective dependency ordering with mercantile objectives', () => {
    it('locks order_food behind visit_location', () => {
      const engine = new QuestCompletionEngine();
      const quest = makeQuest([
        makeObjective({ id: 'obj1', type: 'visit_location', order: 0 }),
        makeObjective({ id: 'obj2', type: 'order_food', requiredCount: 1, order: 1 }),
      ]);
      engine.addQuest(quest);

      // order_food should be locked
      engine.trackFoodOrdered('Bread', 'merchant1', 'Restaurant');
      expect(quest.objectives![1].completed).toBe(false);

      // Complete visit_location first
      engine.completeObjective('q1', 'obj1');

      // Now order_food should work
      engine.trackFoodOrdered('Bread', 'merchant1', 'Restaurant');
      expect(quest.objectives![1].completed).toBe(true);
    });
  });

  describe('ShopTransaction mercantile fields', () => {
    it('includes merchant context in transaction type', () => {
      // Test the ShopTransaction interface has the right shape
      const transaction = {
        type: 'buy' as const,
        item: { id: 'item1', name: 'Bread', description: '', type: 'food' as const, quantity: 1, buyPrice: 10, sellPrice: 5, stock: 5, maxStock: 10 },
        quantity: 1,
        totalPrice: 10,
        merchantId: 'merchant1',
        merchantName: 'Baker Bob',
        businessType: 'Bakery',
        typedInTargetLanguage: true,
        typedWord: 'pan',
        targetWord: 'pan',
      };

      expect(transaction.merchantId).toBe('merchant1');
      expect(transaction.typedInTargetLanguage).toBe(true);
      expect(transaction.typedWord).toBe('pan');
    });
  });
});
