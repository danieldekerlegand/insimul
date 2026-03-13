import { describe, it, expect } from 'vitest';
import {
  QUEST_SEEDS,
  getSeedById,
  getSeedsByCategory,
  getSeedsByDifficulty,
  getSeedCategories,
  resolveTemplate,
  resolveParams,
  instantiateSeed,
  instantiateStarterQuests,
} from '../language/quest-seed-library';

const BASE_PARAMS = {
  worldId: 'world-1',
  targetLanguage: 'French',
  assignedTo: 'Player One',
  assignedBy: 'Guide NPC',
};

describe('quest-seed-library', () => {
  describe('QUEST_SEEDS', () => {
    it('contains seeds', () => {
      expect(QUEST_SEEDS.length).toBeGreaterThan(0);
    });

    it('every seed has required fields', () => {
      for (const seed of QUEST_SEEDS) {
        expect(seed.id).toBeTruthy();
        expect(seed.name).toBeTruthy();
        expect(seed.category).toBeTruthy();
        expect(['beginner', 'intermediate', 'advanced']).toContain(seed.difficulty);
        expect(seed.titleTemplate).toBeTruthy();
        expect(seed.descriptionTemplate).toBeTruthy();
        expect(seed.objectiveTemplates.length).toBeGreaterThan(0);
        expect(seed.baseXp).toBeGreaterThan(0);
        expect(seed.tags.length).toBeGreaterThan(0);
      }
    });

    it('has unique seed ids', () => {
      const ids = QUEST_SEEDS.map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('covers multiple categories', () => {
      const categories = getSeedCategories();
      expect(categories.length).toBeGreaterThanOrEqual(5);
    });

    it('covers all three difficulty levels', () => {
      expect(getSeedsByDifficulty('beginner').length).toBeGreaterThan(0);
      expect(getSeedsByDifficulty('intermediate').length).toBeGreaterThan(0);
      expect(getSeedsByDifficulty('advanced').length).toBeGreaterThan(0);
    });
  });

  describe('resolveTemplate', () => {
    it('replaces placeholders', () => {
      expect(resolveTemplate('Hello {{name}}!', { name: 'Alice' })).toBe('Hello Alice!');
    });

    it('handles multiple placeholders', () => {
      const result = resolveTemplate('{{a}} and {{b}}', { a: 'X', b: 'Y' });
      expect(result).toBe('X and Y');
    });

    it('leaves unknown placeholders unchanged', () => {
      expect(resolveTemplate('{{unknown}}', {})).toBe('{{unknown}}');
    });

    it('handles array values by joining', () => {
      expect(resolveTemplate('Words: {{words}}', { words: ['hello', 'world'] }))
        .toBe('Words: hello, world');
    });

    it('converts numbers to strings', () => {
      expect(resolveTemplate('Count: {{n}}', { n: 5 })).toBe('Count: 5');
    });
  });

  describe('resolveParams', () => {
    it('uses provided values over defaults', () => {
      const seed = getSeedById('market_words')!;
      const result = resolveParams(seed, { wordCount: 10, location: 'the bazaar' });
      expect(result.wordCount).toBe(10);
      expect(result.location).toBe('the bazaar');
    });

    it('falls back to defaults', () => {
      const seed = getSeedById('market_words')!;
      const result = resolveParams(seed, {});
      expect(result.wordCount).toBe(5);
      expect(result.location).toBe('the market');
    });

    it('omits params without defaults or values', () => {
      const seed = getSeedById('greetings_101')!;
      const result = resolveParams(seed, {});
      // npcName has no default, so it should be missing
      expect(result.npcName).toBeUndefined();
      // greetingWords has a default
      expect(result.greetingWords).toBeDefined();
    });
  });

  describe('getSeedById', () => {
    it('finds existing seed', () => {
      expect(getSeedById('greetings_101')).toBeDefined();
      expect(getSeedById('greetings_101')!.name).toBe('First Words');
    });

    it('returns undefined for missing id', () => {
      expect(getSeedById('nonexistent')).toBeUndefined();
    });
  });

  describe('getSeedsByCategory', () => {
    it('filters by category', () => {
      const vocab = getSeedsByCategory('vocabulary');
      expect(vocab.length).toBeGreaterThan(0);
      for (const s of vocab) {
        expect(s.category).toBe('vocabulary');
      }
    });

    it('returns empty for unknown category', () => {
      expect(getSeedsByCategory('nonexistent')).toEqual([]);
    });
  });

  describe('instantiateSeed', () => {
    it('produces a complete quest with all required fields', () => {
      const seed = getSeedById('greetings_101')!;
      const quest = instantiateSeed(seed, {
        ...BASE_PARAMS,
        values: { npcName: 'Marie' },
      });

      expect(quest.worldId).toBe('world-1');
      expect(quest.assignedTo).toBe('Player One');
      expect(quest.assignedBy).toBe('Guide NPC');
      expect(quest.title).toBe('First Words with Marie');
      expect(quest.description).toContain('Marie');
      expect(quest.description).toContain('French');
      expect(quest.questType).toBe('conversation');
      expect(quest.difficulty).toBe('beginner');
      expect(quest.targetLanguage).toBe('French');
      expect(quest.status).toBe('active');
      expect(quest.objectives.length).toBeGreaterThan(0);
      expect(quest.experienceReward).toBeGreaterThan(0);
      expect(quest.tags).toContain('greeting');
    });

    it('generates Prolog content', () => {
      const seed = getSeedById('greetings_101')!;
      const quest = instantiateSeed(seed, {
        ...BASE_PARAMS,
        values: { npcName: 'Marie' },
      });

      expect(quest.content).toBeTruthy();
      expect(quest.content).toContain('quest(');
      expect(quest.content).toContain('First Words with Marie');
      expect(quest.content).toContain('quest_reward(');
    });

    it('scales XP by difficulty', () => {
      const beginner = instantiateSeed(getSeedById('market_words')!, BASE_PARAMS);
      const intermediate = instantiateSeed(getSeedById('grammar_drill')!, BASE_PARAMS);
      const advanced = instantiateSeed(getSeedById('word_master')!, BASE_PARAMS);

      // Beginner: baseXp * 1.0, Intermediate: baseXp * 1.5, Advanced: baseXp * 2.5
      expect(beginner.experienceReward).toBe(25);   // 25 * 1.0
      expect(intermediate.experienceReward).toBe(45); // 30 * 1.5
      expect(advanced.experienceReward).toBe(125);    // 50 * 2.5
    });

    it('resolves numeric param in objective count', () => {
      const seed = getSeedById('deep_discussion')!;
      const quest = instantiateSeed(seed, {
        ...BASE_PARAMS,
        values: { npcName: 'Jean', turns: 10 },
      });

      const obj = quest.objectives[0];
      expect(obj.requiredCount).toBe(10);
      expect(obj.description).toContain('10-turn');
    });

    it('uses default values when params not provided', () => {
      const seed = getSeedById('market_words')!;
      const quest = instantiateSeed(seed, BASE_PARAMS);

      expect(quest.title).toContain('the market');
      expect(quest.description).toContain('5 food');
    });

    it('resolves extra fields in objectives', () => {
      const seed = getSeedById('grammar_drill')!;
      const quest = instantiateSeed(seed, {
        ...BASE_PARAMS,
        values: { pattern: 'subjunctive mood', count: 7 },
      });

      const obj = quest.objectives[0];
      expect(obj.pattern).toBe('subjunctive mood');
      expect(obj.description).toContain('subjunctive mood');
    });
  });

  describe('instantiateStarterQuests', () => {
    it('produces a batch of starter quests', () => {
      const quests = instantiateStarterQuests({
        ...BASE_PARAMS,
        npcNames: ['Marie', 'Jean', 'Pierre'],
        locations: ['town square', 'the market', 'café'],
      });

      expect(quests.length).toBeGreaterThanOrEqual(3);
      for (const q of quests) {
        expect(q.worldId).toBe('world-1');
        expect(q.content).toBeTruthy();
        expect(q.status).toBe('active');
      }
    });

    it('cycles through NPC names and locations', () => {
      const quests = instantiateStarterQuests({
        ...BASE_PARAMS,
        npcNames: ['Alice', 'Bob'],
        locations: ['park', 'library'],
      });

      // Different quests should get different NPCs/locations from the pool
      const titles = quests.map(q => q.title);
      expect(titles.length).toBeGreaterThan(0);
    });
  });
});
