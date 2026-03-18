import { describe, it, expect } from 'vitest';
import { customerServiceQuestType } from '../quest-types/customer-service';
import {
  QUEST_TYPE_REGISTRY,
  getQuestTypeById,
  getQuestTypeForWorld,
  hasQuestType,
} from '../quest-types/index';
import { getTemplatesByCategory } from '../language/quest-templates';
import {
  getSeedsByCategory,
  getSeedById,
  instantiateSeed,
} from '../language/quest-seed-library';
import { normalizeObjectiveType } from '../quest-objective-types';

describe('customer-service quest type definition', () => {
  it('is registered in the quest type registry', () => {
    expect(hasQuestType('customer-service')).toBe(true);
    expect(QUEST_TYPE_REGISTRY['customer-service']).toBe(customerServiceQuestType);
  });

  it('can be looked up by ID', () => {
    const def = getQuestTypeById('customer-service');
    expect(def).toBeDefined();
    expect(def!.id).toBe('customer-service');
    expect(def!.name).toBe('Customer Service');
  });

  it('has all five quest categories', () => {
    const categories = customerServiceQuestType.questCategories;
    expect(categories).toHaveLength(5);
    const ids = categories.map(c => c.id);
    expect(ids).toContain('make_return');
    expect(ids).toContain('file_complaint');
    expect(ids).toContain('make_reservation');
    expect(ids).toContain('ask_recommendations');
    expect(ids).toContain('urgent_request');
  });

  it('has all six objective types', () => {
    const objectives = customerServiceQuestType.objectiveTypes;
    expect(objectives).toHaveLength(6);
    const ids = objectives.map(o => o.id);
    expect(ids).toContain('request_refund');
    expect(ids).toContain('explain_problem');
    expect(ids).toContain('negotiate_resolution');
    expect(ids).toContain('reserve_slot');
    expect(ids).toContain('describe_preference');
    expect(ids).toContain('express_urgency');
  });

  it('includes experience, fluency, and reputation reward types', () => {
    expect(customerServiceQuestType.rewardTypes).toContain('experience');
    expect(customerServiceQuestType.rewardTypes).toContain('fluency');
    expect(customerServiceQuestType.rewardTypes).toContain('reputation');
  });

  it('has four difficulty levels with increasing XP', () => {
    const scaling = customerServiceQuestType.difficultyScaling;
    expect(scaling.beginner.xp).toBeLessThan(scaling.intermediate.xp as number);
    expect(scaling.intermediate.xp).toBeLessThan(scaling.advanced.xp as number);
    expect(scaling.advanced.xp).toBeLessThan(scaling.expert.xp as number);
  });

  it('has CEFR levels in difficulty scaling', () => {
    const scaling = customerServiceQuestType.difficultyScaling;
    expect(scaling.beginner.cefrLevel).toBe('A1');
    expect(scaling.intermediate.cefrLevel).toBe('A2');
    expect(scaling.advanced.cefrLevel).toBe('B1');
    expect(scaling.expert.cefrLevel).toBe('B2');
  });

  it('generates a prompt mentioning the world and target language', () => {
    const prompt = customerServiceQuestType.generationPrompt({
      id: 'w1',
      name: 'Test Village',
      targetLanguage: 'French',
    });
    expect(prompt).toContain('Test Village');
    expect(prompt).toContain('French');
    expect(prompt).toContain('make_return');
    expect(prompt).toContain('file_complaint');
    expect(prompt).toContain('make_reservation');
  });
});

describe('customer-service objective tracking', () => {
  it('request_refund checks refundRequested flag', () => {
    const obj = customerServiceQuestType.objectiveTypes.find(o => o.id === 'request_refund')!;
    expect(obj.completionCheck({ refundRequested: false })).toBe(false);
    expect(obj.completionCheck({ refundRequested: true })).toBe(true);
  });

  it('explain_problem checks problemExplained flag', () => {
    const obj = customerServiceQuestType.objectiveTypes.find(o => o.id === 'explain_problem')!;
    expect(obj.completionCheck({ problemExplained: false })).toBe(false);
    expect(obj.completionCheck({ problemExplained: true })).toBe(true);
  });

  it('reserve_slot checks reservationMade flag', () => {
    const obj = customerServiceQuestType.objectiveTypes.find(o => o.id === 'reserve_slot')!;
    expect(obj.completionCheck({ reservationMade: false })).toBe(false);
    expect(obj.completionCheck({ reservationMade: true })).toBe(true);
  });

  it('express_urgency checks urgencyExpressed flag', () => {
    const obj = customerServiceQuestType.objectiveTypes.find(o => o.id === 'express_urgency')!;
    expect(obj.completionCheck({ urgencyExpressed: false })).toBe(false);
    expect(obj.completionCheck({ urgencyExpressed: true })).toBe(true);
  });
});

describe('customer-service world type inference', () => {
  it('returns customer-service for hospitality world type', () => {
    const def = getQuestTypeForWorld({ id: 'w1', name: 'Inn', worldType: 'hospitality' });
    expect(def.id).toBe('customer-service');
  });

  it('returns customer-service for "customer service" world type', () => {
    const def = getQuestTypeForWorld({ id: 'w1', name: 'Shop', worldType: 'customer service' });
    expect(def.id).toBe('customer-service');
  });

  it('returns customer-service when gameType is explicitly set', () => {
    const def = getQuestTypeForWorld({ id: 'w1', name: 'Town', gameType: 'customer-service' });
    expect(def.id).toBe('customer-service');
  });
});

describe('customer-service quest templates', () => {
  it('includes customer_service category templates', () => {
    const templates = getTemplatesByCategory('customer_service');
    expect(templates.length).toBeGreaterThanOrEqual(5);
  });

  it('customer_service templates have valid structure', () => {
    const templates = getTemplatesByCategory('customer_service');
    for (const template of templates) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.category).toBe('customer_service');
      expect(template.objectiveTemplates.length).toBeGreaterThan(0);
      expect(template.rewardScale.xp).toBeGreaterThan(0);
      expect(template.rewardScale.fluency).toBeGreaterThan(0);
    }
  });

  it('covers multiple difficulties', () => {
    const templates = getTemplatesByCategory('customer_service');
    const difficulties = new Set(templates.map(t => t.difficulty));
    expect(difficulties.has('beginner')).toBe(true);
    expect(difficulties.has('intermediate')).toBe(true);
    expect(difficulties.has('advanced')).toBe(true);
  });

  it('make_return template exists and is beginner', () => {
    const templates = getTemplatesByCategory('customer_service');
    const returnTemplate = templates.find(t => t.id === 'make_return');
    expect(returnTemplate).toBeDefined();
    expect(returnTemplate!.difficulty).toBe('beginner');
    expect(returnTemplate!.objectiveTemplates.some(o => o.type === 'visit_location')).toBe(true);
    expect(returnTemplate!.objectiveTemplates.some(o => o.type === 'complete_conversation')).toBe(true);
  });

  it('urgent_request template is advanced difficulty', () => {
    const templates = getTemplatesByCategory('customer_service');
    const urgentTemplate = templates.find(t => t.id === 'urgent_request');
    expect(urgentTemplate).toBeDefined();
    expect(urgentTemplate!.difficulty).toBe('advanced');
  });
});

describe('customer-service quest seeds', () => {
  it('includes customer_service category seeds', () => {
    const seeds = getSeedsByCategory('customer_service');
    expect(seeds.length).toBeGreaterThanOrEqual(5);
  });

  it('customer_service seeds have unique ids', () => {
    const seeds = getSeedsByCategory('customer_service');
    const ids = seeds.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all customer_service seeds have business tag', () => {
    const seeds = getSeedsByCategory('customer_service');
    for (const seed of seeds) {
      expect(seed.tags).toContain('business');
    }
  });

  it('customer_return seed can be instantiated', () => {
    const seed = getSeedById('customer_return')!;
    expect(seed).toBeDefined();

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'French',
      assignedTo: 'Player',
      values: { businessName: "Pierre's Bakery", ownerName: 'Pierre', itemName: 'bread' },
    });

    expect(quest.title).toContain("Pierre's Bakery");
    expect(quest.title).toContain('bread');
    expect(quest.description).toContain('French');
    expect(quest.content).toContain('quest(');
  });

  it('customer_reservation seed produces conversation objective', () => {
    const seed = getSeedById('customer_reservation')!;
    expect(seed).toBeDefined();

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'French',
      assignedTo: 'Player',
      values: { businessName: 'Le Bistro', ownerName: 'Marie' },
    });

    expect(quest.title).toContain('Le Bistro');
    const hasConversation = quest.objectives.some((o: any) => o.type === 'complete_conversation');
    expect(hasConversation).toBe(true);
  });

  it('customer_urgent seed is advanced difficulty', () => {
    const seed = getSeedById('customer_urgent')!;
    expect(seed).toBeDefined();
    expect(seed.difficulty).toBe('advanced');
  });
});

describe('customer-service normalization aliases', () => {
  it('normalizes request_refund to complete_conversation', () => {
    expect(normalizeObjectiveType('request_refund')).toBe('complete_conversation');
  });

  it('normalizes explain_problem to complete_conversation', () => {
    expect(normalizeObjectiveType('explain_problem')).toBe('complete_conversation');
  });

  it('normalizes negotiate_resolution to complete_conversation', () => {
    expect(normalizeObjectiveType('negotiate_resolution')).toBe('complete_conversation');
  });

  it('normalizes reserve_slot to complete_conversation', () => {
    expect(normalizeObjectiveType('reserve_slot')).toBe('complete_conversation');
  });

  it('normalizes describe_preference to complete_conversation', () => {
    expect(normalizeObjectiveType('describe_preference')).toBe('complete_conversation');
  });

  it('normalizes express_urgency to complete_conversation', () => {
    expect(normalizeObjectiveType('express_urgency')).toBe('complete_conversation');
  });

  it('normalizes make_return to complete_conversation', () => {
    expect(normalizeObjectiveType('make_return')).toBe('complete_conversation');
  });

  it('normalizes file_complaint to complete_conversation', () => {
    expect(normalizeObjectiveType('file_complaint')).toBe('complete_conversation');
  });

  it('normalizes book_table to complete_conversation', () => {
    expect(normalizeObjectiveType('book_table')).toBe('complete_conversation');
  });

  it('normalizes book_room to complete_conversation', () => {
    expect(normalizeObjectiveType('book_room')).toBe('complete_conversation');
  });
});
