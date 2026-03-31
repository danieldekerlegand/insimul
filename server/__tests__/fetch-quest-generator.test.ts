import { describe, it, expect } from 'vitest';
import {
  generateFetchQuests,
  getFetchQuestTemplateCount,
  getFetchQuestsByDifficulty,
  getFetchItemCategories,
  getFetchVocabularyCategories,
  type FetchQuestOptions,
} from '../../shared/quests/fetch-quest-generator.js';
import type { Character, Settlement, World } from '../../shared/schema';

// ── Test fixtures ────────────────────────────────────────────────────────────

const MOCK_WORLD: World = {
  id: 'world-1',
  name: 'Test World',
  targetLanguage: 'French',
  description: 'A test world',
  worldType: 'village',
  userId: 'user-1',
} as World;

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: `char-${Math.random().toString(36).slice(2, 8)}`,
    firstName: 'Jean',
    lastName: 'Dupont',
    status: 'active',
    worldId: 'world-1',
    ...overrides,
  } as Character;
}

function makeSettlement(overrides: Partial<Settlement> = {}): Settlement {
  return {
    id: `settle-${Math.random().toString(36).slice(2, 8)}`,
    name: 'Test Village',
    worldId: 'world-1',
    ...overrides,
  } as Settlement;
}

const SAMPLE_CHARACTERS: Character[] = [
  makeCharacter({ id: 'char-1', firstName: 'Marie', lastName: 'Boulanger' }),
  makeCharacter({ id: 'char-2', firstName: 'Pierre', lastName: 'Marchand' }),
  makeCharacter({ id: 'char-3', firstName: 'Luc', lastName: 'Cuisinier' }),
  makeCharacter({ id: 'char-4', firstName: 'Anne', lastName: 'Dupont' }),
];

const SAMPLE_SETTLEMENTS: Settlement[] = [
  makeSettlement({ id: 's-1', name: 'Town Square' }),
  makeSettlement({ id: 's-2', name: 'Market District' }),
  makeSettlement({ id: 's-3', name: 'Harbor' }),
  makeSettlement({ id: 's-4', name: 'Garden Quarter' }),
];

// ── Tests ────────────────────────────────────────────────────────────────────

describe('fetch-quest-generator', () => {
  describe('generateFetchQuests', () => {
    it('generates quests with characters and settlements', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
      });

      expect(quests.length).toBeGreaterThan(0);
    });

    it('generates at least 30 quest templates', () => {
      const count = getFetchQuestTemplateCount();
      expect(count).toBeGreaterThanOrEqual(30);
    });

    it('all quests have required fields', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
      });

      for (const quest of quests) {
        expect(quest.worldId).toBe('world-1');
        expect(quest.title).toBeTruthy();
        expect(quest.description).toBeTruthy();
        expect(quest.questType).toBeTruthy();
        expect(quest.difficulty).toBeTruthy();
        expect(quest.targetLanguage).toBe('French');
        expect(quest.assignedTo).toBe('Player');
        expect(quest.status).toBe('available');
        expect(quest.objectives).toBeDefined();
        expect((quest.objectives as any[]).length).toBeGreaterThan(0);
        expect(quest.experienceReward).toBeGreaterThan(0);
        expect(quest.tags).toBeDefined();
        expect(quest.tags!.length).toBeGreaterThan(0);
      }
    });

    it('tags all quests with fetch', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
      });

      for (const quest of quests) {
        expect(quest.tags).toContain('fetch');
      }
    });

    it('generates quests across all three difficulty levels', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
      });

      const difficulties = new Set(quests.map(q => q.difficulty));
      expect(difficulties.has('beginner')).toBe(true);
      expect(difficulties.has('intermediate')).toBe(true);
      expect(difficulties.has('advanced')).toBe(true);
    });

    it('beginner quests have lower XP than advanced', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
      });

      const beginnerXp = quests.filter(q => q.difficulty === 'beginner').map(q => q.experienceReward!);
      const advancedXp = quests.filter(q => q.difficulty === 'advanced').map(q => q.experienceReward!);

      const avgBeginner = beginnerXp.reduce((a, b) => a + b, 0) / beginnerXp.length;
      const avgAdvanced = advancedXp.reduce((a, b) => a + b, 0) / advancedXp.length;

      expect(avgAdvanced).toBeGreaterThan(avgBeginner);
    });

    it('filters by difficulty when specified', () => {
      const beginnerQuests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
        difficulty: 'beginner',
      });

      for (const quest of beginnerQuests) {
        expect(quest.difficulty).toBe('beginner');
      }
      expect(beginnerQuests.length).toBeGreaterThan(0);
    });

    it('respects maxQuests option', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
        maxQuests: 3,
      });

      expect(quests.length).toBeLessThanOrEqual(3);
    });

    it('works with custom assignedTo', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
        assignedTo: 'Custom Player',
      });

      for (const quest of quests) {
        expect(quest.assignedTo).toBe('Custom Player');
      }
    });

    it('works with empty characters array', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: [],
        settlements: SAMPLE_SETTLEMENTS,
      });

      expect(quests.length).toBeGreaterThan(0);
      for (const quest of quests) {
        expect(quest.title).toBeTruthy();
        expect(quest.objectives).toBeDefined();
      }
    });

    it('works with empty settlements array (uses defaults)', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: [],
      });

      expect(quests.length).toBeGreaterThan(0);
    });

    it('objectives use valid objective types', () => {
      const VALID_TYPES = new Set([
        'visit_location', 'discover_location', 'talk_to_npc', 'complete_conversation',
        'use_vocabulary', 'collect_vocabulary', 'identify_object', 'collect_item',
        'deliver_item', 'defeat_enemies', 'craft_item', 'escort_npc',
        'build_friendship', 'give_gift', 'gain_reputation', 'listening_comprehension',
        'translation_challenge', 'navigate_language', 'follow_directions',
        'pronunciation_check', 'examine_object', 'read_sign', 'write_response',
        'listen_and_repeat', 'point_and_name', 'ask_for_directions', 'order_food',
        'haggle_price', 'introduce_self', 'describe_scene',
      ]);

      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
      });

      for (const quest of quests) {
        for (const objective of quest.objectives as any[]) {
          expect(VALID_TYPES.has(objective.type)).toBe(true);
        }
      }
    });

    it('includes collect_item or deliver_item objectives in every quest', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
      });

      for (const quest of quests) {
        const objectives = quest.objectives as any[];
        const hasFetchObjective = objectives.some(
          o => o.type === 'collect_item' || o.type === 'deliver_item' || o.type === 'give_gift' || o.type === 'craft_item'
        );
        expect(hasFetchObjective).toBe(true);
      }
    });

    it('includes language-learning objectives in quests', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
      });

      const languageObjectiveTypes = new Set([
        'use_vocabulary', 'collect_vocabulary', 'identify_object', 'read_sign',
        'examine_object', 'point_and_name', 'complete_conversation', 'describe_scene',
        'haggle_price',
      ]);

      const questsWithLangObjectives = quests.filter(q =>
        (q.objectives as any[]).some(o => languageObjectiveTypes.has(o.type))
      );

      // At least 80% of quests should have a language learning objective
      expect(questsWithLangObjectives.length / quests.length).toBeGreaterThanOrEqual(0.8);
    });

    it('generates Prolog content for quests', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
      });

      for (const quest of quests) {
        expect((quest as any).content).toBeTruthy();
        expect((quest as any).content).toContain('quest(');
      }
    });

    it('uses NPC names in quest descriptions when available', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
      });

      const allText = quests.map(q => `${q.title} ${q.description} ${JSON.stringify(q.objectives)}`).join(' ');
      const hasNpcName = SAMPLE_CHARACTERS.some(c =>
        allText.includes(c.firstName!) || allText.includes(`${c.firstName} ${c.lastName}`)
      );
      expect(hasNpcName).toBe(true);
    });

    it('includes quest chain metadata for chain templates', () => {
      const quests = generateFetchQuests({
        world: MOCK_WORLD,
        characters: SAMPLE_CHARACTERS,
        settlements: SAMPLE_SETTLEMENTS,
      });

      const chainQuests = quests.filter(q => (q as any).questChainId);
      expect(chainQuests.length).toBeGreaterThanOrEqual(2);

      // Chain quests should have matching chain IDs in pairs
      const chainIds = new Set(chainQuests.map(q => (q as any).questChainId));
      for (const chainId of chainIds) {
        const chainGroup = chainQuests.filter(q => (q as any).questChainId === chainId);
        expect(chainGroup.length).toBe(2);
        const orders = chainGroup.map(q => (q as any).questChainOrder).sort();
        expect(orders).toEqual([0, 1]);
      }
    });
  });

  describe('getFetchQuestsByDifficulty', () => {
    it('returns templates grouped by difficulty', () => {
      const byDifficulty = getFetchQuestsByDifficulty();
      expect(byDifficulty.beginner.length).toBeGreaterThan(0);
      expect(byDifficulty.intermediate.length).toBeGreaterThan(0);
      expect(byDifficulty.advanced.length).toBeGreaterThan(0);
    });

    it('beginner has at least 10 templates', () => {
      const byDifficulty = getFetchQuestsByDifficulty();
      expect(byDifficulty.beginner.length).toBeGreaterThanOrEqual(10);
    });

    it('intermediate has at least 10 templates', () => {
      const byDifficulty = getFetchQuestsByDifficulty();
      expect(byDifficulty.intermediate.length).toBeGreaterThanOrEqual(10);
    });

    it('advanced has at least 10 templates', () => {
      const byDifficulty = getFetchQuestsByDifficulty();
      expect(byDifficulty.advanced.length).toBeGreaterThanOrEqual(10);
    });

    it('all template IDs are unique', () => {
      const byDifficulty = getFetchQuestsByDifficulty();
      const allIds = [...byDifficulty.beginner, ...byDifficulty.intermediate, ...byDifficulty.advanced];
      expect(new Set(allIds).size).toBe(allIds.length);
    });
  });

  describe('getFetchItemCategories', () => {
    it('returns item categories', () => {
      const categories = getFetchItemCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('food');
      expect(categories).toContain('tools');
      expect(categories).toContain('clothing');
    });
  });

  describe('getFetchVocabularyCategories', () => {
    it('returns vocabulary categories for known item types', () => {
      const vocab = getFetchVocabularyCategories('food');
      expect(vocab).toContain('food');
      expect(vocab).toContain('shopping');
    });

    it('returns default for unknown categories', () => {
      const vocab = getFetchVocabularyCategories('unknown');
      expect(vocab).toEqual(['shopping']);
    });
  });
});
