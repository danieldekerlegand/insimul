import { describe, it, expect } from 'vitest';
import { QUEST_TEMPLATES, getTemplatesByCategory } from '../language/quest-templates';
import {
  QUEST_SEEDS,
  getSeedsByCategory,
  getSeedById,
  instantiateSeed,
} from '../language/quest-seed-library';
import { normalizeObjectiveType } from '../quest-objective-types';

describe('shopping quest templates', () => {
  it('includes shopping category templates', () => {
    const shopping = getTemplatesByCategory('shopping');
    expect(shopping.length).toBeGreaterThanOrEqual(5);
  });

  it('shopping templates have valid structure', () => {
    const shopping = getTemplatesByCategory('shopping');
    for (const template of shopping) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.category).toBe('shopping');
      expect(template.objectiveTemplates.length).toBeGreaterThan(0);
      expect(template.rewardScale.xp).toBeGreaterThan(0);
      expect(template.rewardScale.fluency).toBeGreaterThan(0);
    }
  });

  it('shopping templates cover multiple difficulties', () => {
    const shopping = getTemplatesByCategory('shopping');
    const difficulties = new Set(shopping.map(t => t.difficulty));
    expect(difficulties.has('beginner')).toBe(true);
    expect(difficulties.has('intermediate')).toBe(true);
  });

  it('shop_vocabulary template exists and is beginner', () => {
    const template = QUEST_TEMPLATES.find(t => t.id === 'shop_vocabulary');
    expect(template).toBeDefined();
    expect(template!.difficulty).toBe('beginner');
    expect(template!.objectiveTemplates.some(o => o.type === 'visit_location')).toBe(true);
    expect(template!.objectiveTemplates.some(o => o.type === 'collect_vocabulary')).toBe(true);
  });

  it('price_haggling template exists and is intermediate', () => {
    const template = QUEST_TEMPLATES.find(t => t.id === 'price_haggling');
    expect(template).toBeDefined();
    expect(template!.difficulty).toBe('intermediate');
    expect(template!.objectiveTemplates.some(o => o.type === 'use_vocabulary')).toBe(true);
  });
});

describe('shopping quest seeds', () => {
  it('includes shopping category seeds', () => {
    const shopping = getSeedsByCategory('shopping');
    expect(shopping.length).toBeGreaterThanOrEqual(5);
  });

  it('shopping seeds have unique ids', () => {
    const shopping = getSeedsByCategory('shopping');
    const ids = shopping.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all shopping seeds have business tag', () => {
    const shopping = getSeedsByCategory('shopping');
    for (const seed of shopping) {
      expect(seed.tags).toContain('business');
    }
  });

  it('shop_basics seed can be instantiated', () => {
    const seed = getSeedById('shop_basics')!;
    expect(seed).toBeDefined();

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'French',
      assignedTo: 'Player',
      values: { businessName: "Marie's Bakery", businessType: 'Bakery' },
    });

    expect(quest.title).toBe("Shopping at Marie's Bakery");
    expect(quest.description).toContain("Marie's Bakery");
    expect(quest.description).toContain('French');
    expect(quest.content).toContain('quest(');
  });

  it('bakery_order seed produces conversation objective', () => {
    const seed = getSeedById('bakery_order')!;
    expect(seed).toBeDefined();

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'French',
      assignedTo: 'Player',
      values: { businessName: 'Le Pain', ownerName: 'Jean' },
    });

    expect(quest.title).toContain('Le Pain');
    const hasConversation = quest.objectives.some((o: any) => o.type === 'complete_conversation');
    expect(hasConversation).toBe(true);
  });

  it('shopping_errands seed is delivery type', () => {
    const seed = getSeedById('shopping_errands')!;
    expect(seed).toBeDefined();
    expect(seed.questType).toBe('delivery');

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'French',
      assignedTo: 'Player',
      values: { npcName: 'Pierre' },
    });

    expect(quest.questType).toBe('delivery');
    const hasDelivery = quest.objectives.some((o: any) => o.type === 'deliver_item');
    expect(hasDelivery).toBe(true);
  });
});

describe('shopping normalization entries', () => {
  it('normalizes purchase_item to collect_item', () => {
    expect(normalizeObjectiveType('purchase_item')).toBe('collect_item');
  });

  it('normalizes shop to collect_item', () => {
    expect(normalizeObjectiveType('shop')).toBe('collect_item');
  });

  it('normalizes shop_for to collect_item', () => {
    expect(normalizeObjectiveType('shop_for')).toBe('collect_item');
  });

  it('normalizes buy_from to collect_item', () => {
    expect(normalizeObjectiveType('buy_from')).toBe('collect_item');
  });

  it('existing purchase normalization still works', () => {
    expect(normalizeObjectiveType('purchase')).toBe('collect_item');
    expect(normalizeObjectiveType('buy_item')).toBe('collect_item');
  });
});
