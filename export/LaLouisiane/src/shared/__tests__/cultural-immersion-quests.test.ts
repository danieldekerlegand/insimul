import { describe, it, expect } from 'vitest';
import {
  QUEST_TEMPLATES,
  getTemplatesByCategory,
} from '../language/quest-templates';
import {
  QUEST_SEEDS,
  getSeedById,
  getSeedsByCategory,
  instantiateSeed,
} from '../language/quest-seed-library';

const BASE_PARAMS = {
  worldId: 'world-1',
  targetLanguage: 'French',
  assignedTo: 'Player One',
  assignedBy: 'Guide NPC',
};

describe('cultural immersion quests', () => {
  describe('quest templates', () => {
    const culturalTemplates = getTemplatesByCategory('cultural');

    it('has at least 6 cultural templates', () => {
      expect(culturalTemplates.length).toBeGreaterThanOrEqual(6);
    });

    it('includes all 5 new immersion templates plus the original', () => {
      const ids = culturalTemplates.map((t) => t.id);
      expect(ids).toContain('cultural_exploration');
      expect(ids).toContain('festival_day');
      expect(ids).toContain('recipe_quest');
      expect(ids).toContain('cultural_exchange');
      expect(ids).toContain('proverb_hunter');
      expect(ids).toContain('traditional_craft');
    });

    it('covers beginner, intermediate, and advanced difficulties', () => {
      const difficulties = new Set(culturalTemplates.map((t) => t.difficulty));
      expect(difficulties.has('beginner')).toBe(true);
      expect(difficulties.has('intermediate')).toBe(true);
      expect(difficulties.has('advanced')).toBe(true);
    });

    it('festival_day is beginner difficulty with celebration vocabulary', () => {
      const t = culturalTemplates.find((t) => t.id === 'festival_day')!;
      expect(t.difficulty).toBe('beginner');
      expect(t.objectiveTemplates.some((o) => o.type === 'collect_vocabulary')).toBe(true);
      expect(t.objectiveTemplates.some((o) => o.type === 'visit_location')).toBe(true);
    });

    it('recipe_quest uses follow_directions for cooking instructions', () => {
      const t = culturalTemplates.find((t) => t.id === 'recipe_quest')!;
      expect(t.difficulty).toBe('intermediate');
      expect(t.objectiveTemplates.some((o) => o.type === 'follow_directions')).toBe(true);
      expect(t.objectiveTemplates.some((o) => o.type === 'use_vocabulary')).toBe(true);
    });

    it('proverb_hunter requires listening_comprehension and talking to NPCs', () => {
      const t = culturalTemplates.find((t) => t.id === 'proverb_hunter')!;
      expect(t.difficulty).toBe('advanced');
      expect(t.objectiveTemplates.some((o) => o.type === 'talk_to_npc')).toBe(true);
      expect(t.objectiveTemplates.some((o) => o.type === 'listening_comprehension')).toBe(true);
    });

    it('traditional_craft requires identifying objects at a location', () => {
      const t = culturalTemplates.find((t) => t.id === 'traditional_craft')!;
      expect(t.difficulty).toBe('advanced');
      expect(t.objectiveTemplates.some((o) => o.type === 'identify_object')).toBe(true);
      expect(t.objectiveTemplates.some((o) => o.type === 'visit_location')).toBe(true);
    });

    it('every cultural template has valid structure', () => {
      for (const t of culturalTemplates) {
        expect(t.id).toBeTruthy();
        expect(t.name).toBeTruthy();
        expect(t.category).toBe('cultural');
        expect(t.objectiveTemplates.length).toBeGreaterThan(0);
        expect(t.rewardScale.xp).toBeGreaterThan(0);
        expect(t.rewardScale.fluency).toBeGreaterThan(0);
        expect(t.parameters.length).toBeGreaterThan(0);
      }
    });
  });

  describe('quest seeds', () => {
    const culturalSeeds = getSeedsByCategory('cultural');

    it('has at least 7 cultural seeds', () => {
      expect(culturalSeeds.length).toBeGreaterThanOrEqual(7);
    });

    it('includes all new immersion seeds', () => {
      const ids = culturalSeeds.map((s) => s.id);
      expect(ids).toContain('festival_day');
      expect(ids).toContain('recipe_quest');
      expect(ids).toContain('cultural_exchange');
      expect(ids).toContain('proverb_hunter');
      expect(ids).toContain('traditional_craft');
    });

    it('has unique ids across all seeds', () => {
      const ids = QUEST_SEEDS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('festival_day seed instantiates correctly', () => {
      const seed = getSeedById('festival_day')!;
      const quest = instantiateSeed(seed, {
        ...BASE_PARAMS,
        values: { location: 'the village square', festivalName: 'Bastille Day' },
      });

      expect(quest.title).toBe('Festival Day: Bastille Day');
      expect(quest.description).toContain('Bastille Day');
      expect(quest.description).toContain('French');
      expect(quest.questType).toBe('cultural');
      expect(quest.difficulty).toBe('beginner');
      expect(quest.objectives.length).toBe(3);
      expect(quest.experienceReward).toBe(25); // 25 * 1.0 beginner
      expect(quest.tags).toContain('cultural');
      expect(quest.tags).toContain('festival');
      expect(quest.content).toContain('quest(');
    });

    it('recipe_quest seed instantiates with cooking objectives', () => {
      const seed = getSeedById('recipe_quest')!;
      const quest = instantiateSeed(seed, {
        ...BASE_PARAMS,
        values: { npcName: 'Chef Pierre', dishName: 'crêpes' },
      });

      expect(quest.title).toBe('The Recipe: crêpes');
      expect(quest.description).toContain('Chef Pierre');
      expect(quest.objectives.some((o: any) => o.type === 'follow_directions')).toBe(true);
      expect(quest.objectives.some((o: any) => o.type === 'use_vocabulary')).toBe(true);
      expect(quest.experienceReward).toBe(60); // 40 * 1.5 intermediate
    });

    it('cultural_exchange seed instantiates with conversation focus', () => {
      const seed = getSeedById('cultural_exchange')!;
      const quest = instantiateSeed(seed, {
        ...BASE_PARAMS,
        values: { npcName: 'Marie' },
      });

      expect(quest.title).toContain('Marie');
      expect(quest.description).toContain('formal and informal');
      expect(quest.objectives.some((o: any) => o.type === 'complete_conversation')).toBe(true);
      expect(quest.objectives.some((o: any) => o.type === 'use_vocabulary')).toBe(true);
    });

    it('proverb_hunter seed is advanced difficulty with higher XP', () => {
      const seed = getSeedById('proverb_hunter')!;
      const quest = instantiateSeed(seed, BASE_PARAMS);

      expect(quest.difficulty).toBe('advanced');
      expect(quest.experienceReward).toBe(138); // 55 * 2.5 = 137.5 → 138
      expect(quest.objectives.some((o: any) => o.type === 'listening_comprehension')).toBe(true);
      expect(quest.tags).toContain('proverbs');
      expect(quest.tags).toContain('idioms');
    });

    it('traditional_craft seed requires visiting workshop and identifying objects', () => {
      const seed = getSeedById('traditional_craft')!;
      const quest = instantiateSeed(seed, {
        ...BASE_PARAMS,
        values: { npcName: 'Artisan Jacques', craftName: 'pottery' },
      });

      expect(quest.title).toBe('The Art of pottery');
      expect(quest.difficulty).toBe('advanced');
      expect(quest.objectives.some((o: any) => o.type === 'visit_location')).toBe(true);
      expect(quest.objectives.some((o: any) => o.type === 'identify_object')).toBe(true);
      expect(quest.objectives.length).toBe(4);
    });

    it('all cultural seeds produce valid Prolog content', () => {
      for (const seed of culturalSeeds) {
        const quest = instantiateSeed(seed, {
          ...BASE_PARAMS,
          values: { npcName: 'TestNPC', location: 'test place' },
        });
        expect(quest.content).toBeTruthy();
        expect(quest.content).toContain('quest(');
      }
    });
  });
});
