import { describe, it, expect } from 'vitest';
import { businessScavengerHuntQuestType } from '../quest-types/business-scavenger-hunt';
import {
  QUEST_TYPE_REGISTRY,
  getQuestTypeForWorld,
  getQuestTypeById,
  hasQuestType,
} from '../quest-types/index';
import { normalizeObjectiveType } from '../quest-objective-types';

describe('business-scavenger-hunt quest type', () => {
  describe('definition', () => {
    it('has correct id and name', () => {
      expect(businessScavengerHuntQuestType.id).toBe('business-scavenger-hunt');
      expect(businessScavengerHuntQuestType.name).toBe('Business Scavenger Hunt');
    });

    it('has quest categories', () => {
      const ids = businessScavengerHuntQuestType.questCategories.map(c => c.id);
      expect(ids).toContain('item_hunt');
      expect(ids).toContain('shop_tour');
      expect(ids).toContain('clue_trail');
      expect(ids).toContain('timed_hunt');
    });

    it('every category has required fields', () => {
      for (const cat of businessScavengerHuntQuestType.questCategories) {
        expect(cat.id).toBeTruthy();
        expect(cat.name).toBeTruthy();
        expect(cat.icon).toBeTruthy();
        expect(cat.description).toBeTruthy();
      }
    });

    it('has objective types with tracking and completion logic', () => {
      expect(businessScavengerHuntQuestType.objectiveTypes.length).toBeGreaterThan(0);
      for (const obj of businessScavengerHuntQuestType.objectiveTypes) {
        expect(obj.id).toBeTruthy();
        expect(obj.name).toBeTruthy();
        expect(typeof obj.trackingLogic).toBe('function');
        expect(typeof obj.completionCheck).toBe('function');
      }
    });

    it('has reward types including fluency', () => {
      expect(businessScavengerHuntQuestType.rewardTypes).toContain('experience');
      expect(businessScavengerHuntQuestType.rewardTypes).toContain('fluency');
    });

    it('has CEFR-scaled difficulty levels', () => {
      const { difficultyScaling } = businessScavengerHuntQuestType;
      expect(difficultyScaling.beginner.cefrLevel).toBe('A1');
      expect(difficultyScaling.intermediate.cefrLevel).toBe('A2');
      expect(difficultyScaling.advanced.cefrLevel).toBe('B1');
      expect(difficultyScaling.expert.cefrLevel).toBe('B2');
    });

    it('scales item count with difficulty', () => {
      const { difficultyScaling } = businessScavengerHuntQuestType;
      expect(difficultyScaling.beginner.itemCount).toBeLessThan(
        difficultyScaling.intermediate.itemCount as number,
      );
      expect(difficultyScaling.intermediate.itemCount).toBeLessThan(
        difficultyScaling.advanced.itemCount as number,
      );
      expect(difficultyScaling.advanced.itemCount).toBeLessThan(
        difficultyScaling.expert.itemCount as number,
      );
    });
  });

  describe('objective completion checks', () => {
    const getObjective = (id: string) =>
      businessScavengerHuntQuestType.objectiveTypes.find(o => o.id === id)!;

    it('visit_business completes when visited', () => {
      const obj = getObjective('visit_business');
      expect(obj.completionCheck({ businessVisited: false })).toBe(false);
      expect(obj.completionCheck({ businessVisited: true })).toBe(true);
    });

    it('identify_business_item completes when count met', () => {
      const obj = getObjective('identify_business_item');
      expect(obj.completionCheck({ itemsIdentified: 0, itemsRequired: 3 })).toBe(false);
      expect(obj.completionCheck({ itemsIdentified: 2, itemsRequired: 3 })).toBe(false);
      expect(obj.completionCheck({ itemsIdentified: 3, itemsRequired: 3 })).toBe(true);
      expect(obj.completionCheck({ itemsIdentified: 5, itemsRequired: 3 })).toBe(true);
    });

    it('collect_business_item completes when count met', () => {
      const obj = getObjective('collect_business_item');
      expect(obj.completionCheck({ collected: 0, required: 2 })).toBe(false);
      expect(obj.completionCheck({ collected: 2, required: 2 })).toBe(true);
    });

    it('get_clue_from_owner completes when clue received', () => {
      const obj = getObjective('get_clue_from_owner');
      expect(obj.completionCheck({ clueReceived: false })).toBe(false);
      expect(obj.completionCheck({ clueReceived: true })).toBe(true);
    });
  });

  describe('generation prompt', () => {
    it('includes world name and target language', () => {
      const prompt = businessScavengerHuntQuestType.generationPrompt({
        id: 'w1',
        name: 'French Village',
        targetLanguage: 'French',
      });
      expect(prompt).toContain('French Village');
      expect(prompt).toContain('French');
    });

    it('includes CEFR scaling instructions', () => {
      const prompt = businessScavengerHuntQuestType.generationPrompt({
        id: 'w1',
        name: 'Test',
      });
      expect(prompt).toContain('A1');
      expect(prompt).toContain('A2');
      expect(prompt).toContain('B1');
      expect(prompt).toContain('B2');
    });

    it('specifies allowed objective types', () => {
      const prompt = businessScavengerHuntQuestType.generationPrompt({
        id: 'w1',
        name: 'Test',
      });
      expect(prompt).toContain('visit_location');
      expect(prompt).toContain('identify_object');
      expect(prompt).toContain('talk_to_npc');
      expect(prompt).toContain('collect_item');
    });
  });

  describe('registry integration', () => {
    it('is registered in QUEST_TYPE_REGISTRY', () => {
      expect(QUEST_TYPE_REGISTRY['business-scavenger-hunt']).toBe(
        businessScavengerHuntQuestType,
      );
    });

    it('is found by getQuestTypeById', () => {
      expect(getQuestTypeById('business-scavenger-hunt')).toBe(
        businessScavengerHuntQuestType,
      );
    });

    it('hasQuestType returns true', () => {
      expect(hasQuestType('business-scavenger-hunt')).toBe(true);
    });

    it('maps business world types', () => {
      expect(getQuestTypeForWorld({ id: '1', name: 'T', worldType: 'business district' }))
        .toBe(businessScavengerHuntQuestType);
      expect(getQuestTypeForWorld({ id: '1', name: 'T', worldType: 'commerce town' }))
        .toBe(businessScavengerHuntQuestType);
      expect(getQuestTypeForWorld({ id: '1', name: 'T', worldType: 'market village' }))
        .toBe(businessScavengerHuntQuestType);
      expect(getQuestTypeForWorld({ id: '1', name: 'T', worldType: 'shopping center' }))
        .toBe(businessScavengerHuntQuestType);
    });

    it('maps explicit gameType', () => {
      expect(
        getQuestTypeForWorld({ id: '1', name: 'T', gameType: 'business-scavenger-hunt' }),
      ).toBe(businessScavengerHuntQuestType);
    });
  });

  describe('objective type normalization', () => {
    it('normalizes visit_business to visit_location', () => {
      expect(normalizeObjectiveType('visit_business')).toBe('visit_location');
    });

    it('normalizes enter_business to visit_location', () => {
      expect(normalizeObjectiveType('enter_business')).toBe('visit_location');
    });

    it('normalizes enter_shop to visit_location', () => {
      expect(normalizeObjectiveType('enter_shop')).toBe('visit_location');
    });

    it('normalizes identify_business_item to identify_object', () => {
      expect(normalizeObjectiveType('identify_business_item')).toBe('identify_object');
    });

    it('normalizes name_item to identify_object', () => {
      expect(normalizeObjectiveType('name_item')).toBe('identify_object');
    });

    it('normalizes point_and_name to identify_object', () => {
      expect(normalizeObjectiveType('point_and_name')).toBe('identify_object');
    });

    it('normalizes examine_object to identify_object', () => {
      expect(normalizeObjectiveType('examine_object')).toBe('identify_object');
    });

    it('normalizes get_clue_from_owner to talk_to_npc', () => {
      expect(normalizeObjectiveType('get_clue_from_owner')).toBe('talk_to_npc');
    });

    it('normalizes collect_business_item to collect_item', () => {
      expect(normalizeObjectiveType('collect_business_item')).toBe('collect_item');
    });
  });
});
