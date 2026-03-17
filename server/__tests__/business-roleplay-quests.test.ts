/**
 * Tests for business role-play scenario quest generation.
 *
 * Covers:
 * - Business role-play seed definitions (structure, valid objective types)
 * - Seed lookup helpers (by business type, multi-business)
 * - Quest generator (single-business, multi-business, filtering)
 * - Instantiated quest structure (Prolog content, tags, objectives)
 */

import { describe, it, expect } from 'vitest';
import {
  BUSINESS_ROLEPLAY_SEEDS,
  BUSINESS_TYPE_TO_SEEDS,
  getBusinessRoleplaySeeds,
  getSeedsForBusinessType,
  getMultiBusinessSeeds,
} from '../../shared/language/business-roleplay-seeds';
import { instantiateSeed } from '../../shared/language/quest-seed-library';
import { VALID_OBJECTIVE_TYPES } from '../../shared/quest-objective-types';
import { generateBusinessRoleplayQuests, type BusinessInfo } from '../services/business-roleplay-quest-generator';
import type { Character, World } from '../../shared/schema';

// ── Test Fixtures ────────────────────────────────────────────────────────────

const MOCK_WORLD: World = {
  id: 'world-1',
  name: 'Test World',
  targetLanguage: 'French',
  nativeLanguage: 'English',
  theme: 'historical',
  era: 'pre_industrial',
  status: 'active',
} as World;

const MOCK_CHARACTERS: Character[] = [
  {
    id: 'char-1',
    worldId: 'world-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    status: 'active',
  } as Character,
  {
    id: 'char-2',
    worldId: 'world-1',
    firstName: 'Marie',
    lastName: 'Laurent',
    status: 'active',
  } as Character,
  {
    id: 'char-3',
    worldId: 'world-1',
    firstName: 'Pierre',
    lastName: 'Moreau',
    status: 'active',
  } as Character,
];

const MOCK_BUSINESSES: BusinessInfo[] = [
  { id: 'biz-1', name: 'Chez Jean', businessType: 'restaurant', ownerId: 'char-1' },
  { id: 'biz-2', name: "Laurent's Bakery", businessType: 'bakery', ownerId: 'char-2' },
  { id: 'biz-3', name: "Moreau's Forge", businessType: 'blacksmith', ownerId: 'char-3' },
  { id: 'biz-4', name: 'Town Bank', businessType: 'bank', ownerId: 'char-1' },
];

// ── Seed Definition Tests ────────────────────────────────────────────────────

describe('BUSINESS_ROLEPLAY_SEEDS', () => {
  it('should have unique IDs', () => {
    const ids = BUSINESS_ROLEPLAY_SEEDS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should all have category business_roleplay', () => {
    for (const seed of BUSINESS_ROLEPLAY_SEEDS) {
      expect(seed.category).toBe('business_roleplay');
    }
  });

  it('should only use valid objective types', () => {
    // Some objective types in seeds use legacy types that get normalized,
    // but the core types should be in the valid set
    const validTypes = VALID_OBJECTIVE_TYPES;
    for (const seed of BUSINESS_ROLEPLAY_SEEDS) {
      for (const obj of seed.objectiveTemplates) {
        expect(validTypes.has(obj.type)).toBe(true);
      }
    }
  });

  it('should have positive baseXp', () => {
    for (const seed of BUSINESS_ROLEPLAY_SEEDS) {
      expect(seed.baseXp).toBeGreaterThan(0);
    }
  });

  it('should have at least one tag including business_roleplay', () => {
    for (const seed of BUSINESS_ROLEPLAY_SEEDS) {
      expect(seed.tags).toContain('business_roleplay');
    }
  });

  it('should have valid difficulty levels', () => {
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    for (const seed of BUSINESS_ROLEPLAY_SEEDS) {
      expect(validDifficulties).toContain(seed.difficulty);
    }
  });
});

// ── Lookup Helper Tests ──────────────────────────────────────────────────────

describe('Seed lookup helpers', () => {
  it('getBusinessRoleplaySeeds returns all seeds', () => {
    const seeds = getBusinessRoleplaySeeds();
    expect(seeds.length).toBe(BUSINESS_ROLEPLAY_SEEDS.length);
  });

  it('getSeedsForBusinessType returns correct seeds for restaurant', () => {
    const seeds = getSeedsForBusinessType('restaurant');
    expect(seeds.length).toBeGreaterThan(0);
    expect(seeds.some(s => s.id === 'restaurant_patron')).toBe(true);
  });

  it('getSeedsForBusinessType returns correct seeds for bakery', () => {
    const seeds = getSeedsForBusinessType('bakery');
    expect(seeds.some(s => s.id === 'bakery_customer')).toBe(true);
  });

  it('getSeedsForBusinessType returns empty array for unknown type', () => {
    const seeds = getSeedsForBusinessType('nonexistent_business');
    expect(seeds).toEqual([]);
  });

  it('getMultiBusinessSeeds returns multi-business scenarios', () => {
    const seeds = getMultiBusinessSeeds();
    expect(seeds.length).toBeGreaterThan(0);
    const ids = seeds.map(s => s.id);
    expect(ids).toContain('business_tour');
    expect(ids).toContain('shopping_list');
    expect(ids).toContain('supply_chain_delivery');
    expect(ids).toContain('business_dispute');
  });

  it('BUSINESS_TYPE_TO_SEEDS maps all expected business types', () => {
    const expectedTypes = [
      'restaurant', 'bakery', 'doctor_office', 'general_store',
      'grocery', 'inn', 'tavern', 'blacksmith', 'tailor', 'bank',
    ];
    for (const bt of expectedTypes) {
      expect(BUSINESS_TYPE_TO_SEEDS[bt]).toBeDefined();
      expect(BUSINESS_TYPE_TO_SEEDS[bt].length).toBeGreaterThan(0);
    }
  });
});

// ── Seed Instantiation Tests ─────────────────────────────────────────────────

describe('Seed instantiation', () => {
  it('instantiates restaurant_patron with correct values', () => {
    const seed = BUSINESS_ROLEPLAY_SEEDS.find(s => s.id === 'restaurant_patron')!;
    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'French',
      assignedTo: 'Player',
      assignedBy: 'Jean Dupont',
      values: {
        businessName: 'Chez Jean',
        npcName: 'Jean Dupont',
        location: 'Chez Jean',
      },
    });

    expect(quest.title).toBe('Dining at Chez Jean');
    expect(quest.description).toContain('Chez Jean');
    expect(quest.description).toContain('French');
    expect(quest.description).toContain('Jean Dupont');
    expect(quest.questType).toBe('business_roleplay');
    expect(quest.difficulty).toBe('beginner');
    expect(quest.status).toBe('active');
    expect(quest.objectives.length).toBe(3);
    expect(quest.experienceReward).toBeGreaterThan(0);
    expect(quest.content).toBeTruthy();
    expect(quest.content).toContain('quest(');
  });

  it('instantiates doctor_visit with intermediate difficulty', () => {
    const seed = BUSINESS_ROLEPLAY_SEEDS.find(s => s.id === 'doctor_visit')!;
    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'Spanish',
      assignedTo: 'Player',
      values: {
        businessName: 'Clinica Central',
        npcName: 'Dr. Garcia',
        location: 'Clinica Central',
      },
    });

    expect(quest.difficulty).toBe('intermediate');
    expect(quest.experienceReward).toBe(60); // 40 * 1.5
    expect(quest.description).toContain('Spanish');
  });

  it('instantiates bank_transaction with advanced difficulty', () => {
    const seed = BUSINESS_ROLEPLAY_SEEDS.find(s => s.id === 'bank_transaction')!;
    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'French',
      assignedTo: 'Player',
      values: {
        businessName: 'Town Bank',
        npcName: 'Banker',
        location: 'Town Bank',
      },
    });

    expect(quest.difficulty).toBe('advanced');
    expect(quest.experienceReward).toBe(138); // 55 * 2.5 = 137.5 → rounded
  });

  it('generates valid Prolog content for all seeds', () => {
    for (const seed of BUSINESS_ROLEPLAY_SEEDS) {
      const quest = instantiateSeed(seed, {
        worldId: 'world-1',
        targetLanguage: 'French',
        assignedTo: 'Player',
        values: {
          businessName: 'Test Business',
          npcName: 'Test NPC',
          location: 'Test Location',
          senderNpc: 'NPC A',
          receiverNpc: 'NPC B',
          senderBusiness: 'Business A',
          receiverBusiness: 'Business B',
          npcA: 'NPC A',
          npcB: 'NPC B',
          businessA: 'Business A',
          businessB: 'Business B',
        },
      });

      expect(quest.content).toBeTruthy();
      expect(quest.content).toContain('quest(');
      expect(quest.content).toContain('quest_objective(');
    }
  });
});

// ── Generator Tests ──────────────────────────────────────────────────────────

describe('generateBusinessRoleplayQuests', () => {
  it('generates quests for businesses in the world', () => {
    const quests = generateBusinessRoleplayQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
    });

    expect(quests.length).toBeGreaterThan(0);
    // Should have quests for restaurant, bakery, blacksmith, bank
    const tags = quests.flatMap(q => q.tags);
    expect(tags).toContain('business:restaurant');
    expect(tags).toContain('business:bakery');
    expect(tags).toContain('business:blacksmith');
    expect(tags).toContain('business:bank');
  });

  it('uses real business names and owner names', () => {
    const quests = generateBusinessRoleplayQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
    });

    const restaurantQuest = quests.find(q => q.tags.includes('business:restaurant'));
    expect(restaurantQuest).toBeDefined();
    expect(restaurantQuest!.title).toContain('Chez Jean');
    expect(restaurantQuest!.description).toContain('Jean Dupont');
  });

  it('generates multi-business quests when enough businesses exist', () => {
    const quests = generateBusinessRoleplayQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
    });

    const multiBizQuests = quests.filter(q => q.tags.includes('multi_business'));
    expect(multiBizQuests.length).toBeGreaterThan(0);
  });

  it('respects businessTypeFilter', () => {
    const quests = generateBusinessRoleplayQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
      businessTypeFilter: ['restaurant'],
    });

    // Should have restaurant quests + multi-business quests
    const singleBizQuests = quests.filter(q => !q.tags.includes('multi_business'));
    for (const q of singleBizQuests) {
      expect(q.tags).toContain('business:restaurant');
    }
  });

  it('respects difficulty filter', () => {
    const quests = generateBusinessRoleplayQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
      difficulty: 'beginner',
    });

    for (const q of quests) {
      expect(q.difficulty).toBe('beginner');
    }
  });

  it('respects maxQuests limit', () => {
    const quests = generateBusinessRoleplayQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
      maxQuests: 2,
    });

    expect(quests.length).toBeLessThanOrEqual(2);
  });

  it('returns empty array when no businesses exist', () => {
    const quests = generateBusinessRoleplayQuests({
      world: MOCK_WORLD,
      businesses: [],
      characters: MOCK_CHARACTERS,
    });

    expect(quests).toEqual([]);
  });

  it('skips out-of-business businesses', () => {
    const closedBusiness: BusinessInfo = {
      id: 'biz-closed',
      name: 'Closed Shop',
      businessType: 'restaurant',
      ownerId: 'char-1',
      isOutOfBusiness: true,
    };

    const quests = generateBusinessRoleplayQuests({
      world: MOCK_WORLD,
      businesses: [closedBusiness],
      characters: MOCK_CHARACTERS,
    });

    expect(quests).toEqual([]);
  });

  it('all generated quests have valid structure', () => {
    const quests = generateBusinessRoleplayQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
    });

    for (const q of quests) {
      expect(q.worldId).toBe('world-1');
      expect(q.assignedTo).toBe('Player');
      expect(q.targetLanguage).toBe('French');
      expect(q.title).toBeTruthy();
      expect(q.description).toBeTruthy();
      expect(q.questType).toBe('business_roleplay');
      expect(q.objectives.length).toBeGreaterThan(0);
      expect(q.experienceReward).toBeGreaterThan(0);
      expect(q.content).toBeTruthy();
      expect(q.tags).toContain('business_roleplay');
      expect(q.status).toBe('active');
    }
  });

  it('uses custom assignedTo', () => {
    const quests = generateBusinessRoleplayQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES.slice(0, 1),
      characters: MOCK_CHARACTERS,
      assignedTo: 'TestPlayer',
    });

    for (const q of quests) {
      expect(q.assignedTo).toBe('TestPlayer');
    }
  });
});
