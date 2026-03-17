import { describe, it, expect } from 'vitest';
import {
  ACHIEVABLE_OBJECTIVE_TYPES,
  VALID_OBJECTIVE_TYPES,
  normalizeObjectiveType,
  validateAndNormalizeObjectives,
} from '../quest-objective-types';
import { QUEST_TEMPLATES, getTemplatesByCategory } from '../language/quest-templates';
import {
  QUEST_SEEDS,
  getSeedsByCategory,
  getSeedById,
  instantiateSeed,
} from '../language/quest-seed-library';
import { languageLearningQuestType } from '../quest-types/language-learning';
import { rpgQuestType } from '../quest-types/rpg';

describe('Social Relationship Quests', () => {
  describe('Objective Types', () => {
    it('includes build_friendship as a canonical objective type', () => {
      const type = ACHIEVABLE_OBJECTIVE_TYPES.find(t => t.type === 'build_friendship');
      expect(type).toBeDefined();
      expect(type!.requiresTarget).toBe('npc');
      expect(type!.countable).toBe(true);
    });

    it('includes give_gift as a canonical objective type', () => {
      const type = ACHIEVABLE_OBJECTIVE_TYPES.find(t => t.type === 'give_gift');
      expect(type).toBeDefined();
      expect(type!.requiresTarget).toBe('npc');
      expect(type!.countable).toBe(false);
    });

    it('validates build_friendship and give_gift as valid types', () => {
      expect(VALID_OBJECTIVE_TYPES.has('build_friendship')).toBe(true);
      expect(VALID_OBJECTIVE_TYPES.has('give_gift')).toBe(true);
    });
  });

  describe('Normalization', () => {
    it('normalizes friendship-related aliases to build_friendship', () => {
      expect(normalizeObjectiveType('befriend')).toBe('build_friendship');
      expect(normalizeObjectiveType('make_friend')).toBe('build_friendship');
      expect(normalizeObjectiveType('build_rapport')).toBe('build_friendship');
      expect(normalizeObjectiveType('socialize')).toBe('build_friendship');
      expect(normalizeObjectiveType('befriend_npc')).toBe('build_friendship');
      expect(normalizeObjectiveType('bond_with')).toBe('build_friendship');
      expect(normalizeObjectiveType('friendship')).toBe('build_friendship');
    });

    it('normalizes gift-related aliases to give_gift', () => {
      expect(normalizeObjectiveType('gift')).toBe('give_gift');
      expect(normalizeObjectiveType('present_gift')).toBe('give_gift');
      expect(normalizeObjectiveType('give_present')).toBe('give_gift');
      expect(normalizeObjectiveType('gift_item')).toBe('give_gift');
      expect(normalizeObjectiveType('offer_gift')).toBe('give_gift');
    });

    it('passes build_friendship and give_gift through unchanged', () => {
      expect(normalizeObjectiveType('build_friendship')).toBe('build_friendship');
      expect(normalizeObjectiveType('give_gift')).toBe('give_gift');
    });

    it('validates and normalizes social objectives in arrays', () => {
      const objectives = [
        { type: 'befriend', description: 'Make a friend' },
        { type: 'gift', description: 'Give a gift' },
        { type: 'build_friendship', description: 'Already canonical' },
      ];
      const result = validateAndNormalizeObjectives(objectives);
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('build_friendship');
      expect(result[1].type).toBe('give_gift');
      expect(result[2].type).toBe('build_friendship');
    });
  });

  describe('Quest Templates', () => {
    it('includes social category templates', () => {
      const socialTemplates = getTemplatesByCategory('social');
      expect(socialTemplates.length).toBeGreaterThanOrEqual(5);
    });

    it('has make_a_friend template with build_friendship objective', () => {
      const template = QUEST_TEMPLATES.find(t => t.id === 'make_a_friend');
      expect(template).toBeDefined();
      expect(template!.category).toBe('social');
      expect(template!.objectiveTemplates.some(o => o.type === 'build_friendship')).toBe(true);
    });

    it('has gift_of_friendship template with give_gift objective', () => {
      const template = QUEST_TEMPLATES.find(t => t.id === 'gift_of_friendship');
      expect(template).toBeDefined();
      expect(template!.category).toBe('social');
      expect(template!.objectiveTemplates.some(o => o.type === 'give_gift')).toBe(true);
    });

    it('has community_builder template', () => {
      const template = QUEST_TEMPLATES.find(t => t.id === 'community_builder');
      expect(template).toBeDefined();
      expect(template!.category).toBe('social');
    });

    it('has language_exchange template with build_friendship + conversation objectives', () => {
      const template = QUEST_TEMPLATES.find(t => t.id === 'language_exchange');
      expect(template).toBeDefined();
      expect(template!.category).toBe('social');
      expect(template!.objectiveTemplates.some(o => o.type === 'build_friendship')).toBe(true);
      expect(template!.objectiveTemplates.some(o => o.type === 'complete_conversation')).toBe(true);
    });

    it('has the_helpful_stranger template combining delivery and friendship', () => {
      const template = QUEST_TEMPLATES.find(t => t.id === 'the_helpful_stranger');
      expect(template).toBeDefined();
      expect(template!.category).toBe('social');
      expect(template!.objectiveTemplates.some(o => o.type === 'deliver_item')).toBe(true);
      expect(template!.objectiveTemplates.some(o => o.type === 'build_friendship')).toBe(true);
    });

    it('all social templates have unique ids', () => {
      const socialTemplates = getTemplatesByCategory('social');
      const ids = socialTemplates.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('Quest Seed Library', () => {
    it('includes social category seeds', () => {
      const socialSeeds = getSeedsByCategory('social');
      expect(socialSeeds.length).toBeGreaterThanOrEqual(4);
    });

    it('has make_a_friend seed with build_friendship objective', () => {
      const seed = getSeedById('make_a_friend');
      expect(seed).toBeDefined();
      expect(seed!.category).toBe('social');
      expect(seed!.objectiveTemplates.some(o => o.type === 'build_friendship')).toBe(true);
    });

    it('has gift_giving seed with give_gift objective', () => {
      const seed = getSeedById('gift_giving');
      expect(seed).toBeDefined();
      expect(seed!.category).toBe('social');
      expect(seed!.objectiveTemplates.some(o => o.type === 'give_gift')).toBe(true);
    });

    it('can instantiate make_a_friend seed into a complete quest', () => {
      const seed = getSeedById('make_a_friend')!;
      const quest = instantiateSeed(seed, {
        worldId: 'world-1',
        targetLanguage: 'French',
        assignedTo: 'Player',
        values: { npcName: 'Marie' },
      });

      expect(quest.title).toContain('Marie');
      expect(quest.questType).toBe('social');
      expect(quest.objectives.length).toBeGreaterThan(0);
      expect(quest.objectives[0].type).toBe('build_friendship');
      expect(quest.experienceReward).toBeGreaterThan(0);
      expect(quest.content).toBeTruthy();
      expect(quest.content).toContain('quest(');
      expect(quest.tags).toContain('social');
    });

    it('can instantiate gift_giving seed into a complete quest', () => {
      const seed = getSeedById('gift_giving')!;
      const quest = instantiateSeed(seed, {
        worldId: 'world-1',
        targetLanguage: 'Spanish',
        assignedTo: 'Player',
        values: { npcName: 'Carlos' },
      });

      expect(quest.title).toContain('Carlos');
      expect(quest.questType).toBe('social');
      expect(quest.objectives.some(o => o.type === 'collect_item')).toBe(true);
      expect(quest.objectives.some(o => o.type === 'give_gift')).toBe(true);
      expect(quest.content).toBeTruthy();
    });

    it('can instantiate language_partner seed (advanced social quest)', () => {
      const seed = getSeedById('language_partner')!;
      const quest = instantiateSeed(seed, {
        worldId: 'world-1',
        targetLanguage: 'Chitimacha',
        assignedTo: 'Player',
        values: { npcName: 'Elder Jean' },
      });

      expect(quest.difficulty).toBe('advanced');
      expect(quest.objectives.length).toBe(3);
      expect(quest.objectives.some(o => o.type === 'build_friendship')).toBe(true);
      expect(quest.objectives.some(o => o.type === 'complete_conversation')).toBe(true);
      expect(quest.objectives.some(o => o.type === 'use_vocabulary')).toBe(true);
    });

    it('all social seeds have unique ids', () => {
      const socialSeeds = getSeedsByCategory('social');
      const ids = socialSeeds.map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all social seeds have required fields', () => {
      const socialSeeds = getSeedsByCategory('social');
      for (const seed of socialSeeds) {
        expect(seed.id).toBeTruthy();
        expect(seed.name).toBeTruthy();
        expect(seed.category).toBe('social');
        expect(['beginner', 'intermediate', 'advanced']).toContain(seed.difficulty);
        expect(seed.objectiveTemplates.length).toBeGreaterThan(0);
        expect(seed.baseXp).toBeGreaterThan(0);
        expect(seed.tags).toContain('social');
      }
    });
  });

  describe('Quest Type Definitions', () => {
    it('language-learning type includes social category', () => {
      const socialCategory = languageLearningQuestType.questCategories.find(c => c.id === 'social');
      expect(socialCategory).toBeDefined();
      expect(socialCategory!.name).toBe('Social');
    });

    it('language-learning type includes build_friendship objective type', () => {
      const objType = languageLearningQuestType.objectiveTypes.find(o => o.id === 'build_friendship');
      expect(objType).toBeDefined();
      expect(objType!.name).toBe('Build Friendship');
    });

    it('language-learning type includes give_gift objective type', () => {
      const objType = languageLearningQuestType.objectiveTypes.find(o => o.id === 'give_gift');
      expect(objType).toBeDefined();
      expect(objType!.name).toBe('Give Gift');
    });

    it('rpg type includes build_friendship objective type', () => {
      const objType = rpgQuestType.objectiveTypes.find(o => o.id === 'build_friendship');
      expect(objType).toBeDefined();
    });

    it('rpg type includes give_gift objective type', () => {
      const objType = rpgQuestType.objectiveTypes.find(o => o.id === 'give_gift');
      expect(objType).toBeDefined();
    });

    it('build_friendship completion check works correctly', () => {
      const objType = languageLearningQuestType.objectiveTypes.find(o => o.id === 'build_friendship')!;
      expect(objType.completionCheck({ friendshipInteractions: 0, required: 3 })).toBe(false);
      expect(objType.completionCheck({ friendshipInteractions: 2, required: 3 })).toBe(false);
      expect(objType.completionCheck({ friendshipInteractions: 3, required: 3 })).toBe(true);
      expect(objType.completionCheck({ friendshipInteractions: 5, required: 3 })).toBe(true);
    });

    it('give_gift completion check works correctly', () => {
      const objType = languageLearningQuestType.objectiveTypes.find(o => o.id === 'give_gift')!;
      expect(objType.completionCheck({ giftGiven: false })).toBe(false);
      expect(objType.completionCheck({ giftGiven: true })).toBe(true);
      expect(objType.completionCheck({})).toBe(false);
    });
  });
});
