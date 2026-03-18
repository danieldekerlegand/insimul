/**
 * Tests for emergency / situational quest generation.
 *
 * Covers:
 * - Emergency seed definitions (structure, valid objective types)
 * - Time bonus computation
 * - Quest generator (all 4 scenarios, filtering, edge cases)
 * - Instantiated quest structure (Prolog content, tags, bonus metadata)
 */

import { describe, it, expect } from 'vitest';
import {
  EMERGENCY_QUEST_SEEDS,
  EMERGENCY_TIME_BONUS,
  getEmergencyQuestSeeds,
  getEmergencySeedById,
  computeTimeBonusXp,
} from '../../shared/language/emergency-quest-seeds';
import { instantiateSeed } from '../../shared/language/quest-seed-library';
import { VALID_OBJECTIVE_TYPES } from '../../shared/quest-objective-types';
import { generateEmergencyQuests, type BusinessInfo } from '../services/emergency-quest-generator';
import { computeSkillRewards } from '../../shared/language/quest-skill-rewards';
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
  { id: 'char-1', worldId: 'world-1', firstName: 'Jean', lastName: 'Dupont', status: 'active' } as Character,
  { id: 'char-2', worldId: 'world-1', firstName: 'Marie', lastName: 'Laurent', status: 'active' } as Character,
  { id: 'char-3', worldId: 'world-1', firstName: 'Pierre', lastName: 'Moreau', status: 'active' } as Character,
];

const MOCK_BUSINESSES: BusinessInfo[] = [
  { id: 'biz-1', name: 'Chez Jean', businessType: 'restaurant', ownerId: 'char-1' },
  { id: 'biz-2', name: "Laurent's Bakery", businessType: 'bakery', ownerId: 'char-2' },
  { id: 'biz-3', name: "Moreau's Clinic", businessType: 'doctor_office', ownerId: 'char-3' },
];

const MOCK_ITEMS = [
  { id: 'item-1', name: 'Silver Ring' },
  { id: 'item-2', name: 'Leather Satchel' },
];

// ── Seed Definition Tests ────────────────────────────────────────────────────

describe('EMERGENCY_QUEST_SEEDS', () => {
  it('should have unique IDs', () => {
    const ids = EMERGENCY_QUEST_SEEDS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have exactly 4 scenarios', () => {
    expect(EMERGENCY_QUEST_SEEDS.length).toBe(4);
    const ids = EMERGENCY_QUEST_SEEDS.map(s => s.id);
    expect(ids).toContain('lost_and_found');
    expect(ids).toContain('medical_emergency');
    expect(ids).toContain('wrong_order');
    expect(ids).toContain('rush_delivery');
  });

  it('should all have category emergency', () => {
    for (const seed of EMERGENCY_QUEST_SEEDS) {
      expect(seed.category).toBe('emergency');
    }
  });

  it('should all have questType emergency', () => {
    for (const seed of EMERGENCY_QUEST_SEEDS) {
      expect(seed.questType).toBe('emergency');
    }
  });

  it('should only use valid objective types', () => {
    const validTypes = VALID_OBJECTIVE_TYPES;
    for (const seed of EMERGENCY_QUEST_SEEDS) {
      for (const obj of seed.objectiveTemplates) {
        expect(validTypes.has(obj.type)).toBe(true);
      }
    }
  });

  it('should have positive baseXp', () => {
    for (const seed of EMERGENCY_QUEST_SEEDS) {
      expect(seed.baseXp).toBeGreaterThan(0);
    }
  });

  it('should include emergency and practical tags', () => {
    for (const seed of EMERGENCY_QUEST_SEEDS) {
      expect(seed.tags).toContain('emergency');
      expect(seed.tags).toContain('practical');
    }
  });

  it('should have valid difficulty levels', () => {
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    for (const seed of EMERGENCY_QUEST_SEEDS) {
      expect(validDifficulties).toContain(seed.difficulty);
    }
  });
});

// ── Lookup Helper Tests ──────────────────────────────────────────────────────

describe('Emergency seed lookup helpers', () => {
  it('getEmergencyQuestSeeds returns all seeds', () => {
    const seeds = getEmergencyQuestSeeds();
    expect(seeds.length).toBe(EMERGENCY_QUEST_SEEDS.length);
  });

  it('getEmergencySeedById returns correct seed', () => {
    const seed = getEmergencySeedById('lost_and_found');
    expect(seed).toBeDefined();
    expect(seed!.name).toBe('Lost and Found');
  });

  it('getEmergencySeedById returns undefined for unknown ID', () => {
    expect(getEmergencySeedById('nonexistent')).toBeUndefined();
  });
});

// ── Time Bonus Tests ─────────────────────────────────────────────────────────

describe('Time bonus configuration', () => {
  it('should have bonus config for all 4 seed IDs', () => {
    for (const seed of EMERGENCY_QUEST_SEEDS) {
      expect(EMERGENCY_TIME_BONUS[seed.id]).toBeDefined();
      expect(EMERGENCY_TIME_BONUS[seed.id].bonusWindowMinutes).toBeGreaterThan(0);
      expect(EMERGENCY_TIME_BONUS[seed.id].bonusMultiplier).toBeGreaterThan(1);
    }
  });
});

describe('computeTimeBonusXp', () => {
  it('awards bonus when completed within window', () => {
    const start = new Date('2026-03-18T10:00:00Z');
    const end = new Date('2026-03-18T10:04:00Z'); // 4 minutes — within 5 min window
    const result = computeTimeBonusXp('wrong_order', 30, start, end);

    expect(result.bonusEarned).toBe(true);
    expect(result.bonusXp).toBeGreaterThan(0);
    expect(result.totalXp).toBe(30 + result.bonusXp);
  });

  it('does not award bonus when completed after window', () => {
    const start = new Date('2026-03-18T10:00:00Z');
    const end = new Date('2026-03-18T10:20:00Z'); // 20 minutes — past any window
    const result = computeTimeBonusXp('wrong_order', 30, start, end);

    expect(result.bonusEarned).toBe(false);
    expect(result.bonusXp).toBe(0);
    expect(result.totalXp).toBe(30);
  });

  it('returns base XP for unknown seed ID', () => {
    const start = new Date('2026-03-18T10:00:00Z');
    const end = new Date('2026-03-18T10:01:00Z');
    const result = computeTimeBonusXp('nonexistent', 50, start, end);

    expect(result.bonusEarned).toBe(false);
    expect(result.totalXp).toBe(50);
  });

  it('awards bonus at exact window boundary', () => {
    const start = new Date('2026-03-18T10:00:00Z');
    const end = new Date('2026-03-18T10:07:00Z'); // exactly 7 min for medical_emergency
    const result = computeTimeBonusXp('medical_emergency', 45, start, end);

    expect(result.bonusEarned).toBe(true);
  });
});

// ── Seed Instantiation Tests ─────────────────────────────────────────────────

describe('Emergency seed instantiation', () => {
  it('instantiates lost_and_found with correct values', () => {
    const seed = getEmergencySeedById('lost_and_found')!;
    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'French',
      assignedTo: 'Player',
      values: {
        itemName: 'Silver Ring',
        ownerNpc: 'Jean Dupont',
        businessA: 'Chez Jean',
        shopkeeperA: 'Marie Laurent',
        businessB: "Laurent's Bakery",
        shopkeeperB: 'Pierre Moreau',
      },
    });

    expect(quest.title).toBe('Lost: Silver Ring');
    expect(quest.description).toContain('Silver Ring');
    expect(quest.description).toContain('Jean Dupont');
    expect(quest.description).toContain('French');
    expect(quest.questType).toBe('emergency');
    expect(quest.difficulty).toBe('beginner');
    expect(quest.status).toBe('active');
    expect(quest.objectives.length).toBe(6);
    expect(quest.experienceReward).toBeGreaterThan(0);
    expect(quest.content).toContain('quest(');
  });

  it('instantiates medical_emergency with intermediate difficulty', () => {
    const seed = getEmergencySeedById('medical_emergency')!;
    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'Spanish',
      assignedTo: 'Player',
      values: {
        patientNpc: 'Jean Dupont',
        healerNpc: 'Dr. Garcia',
        healerBusiness: 'Clinica Central',
        symptom: 'a high fever',
      },
    });

    expect(quest.difficulty).toBe('intermediate');
    expect(quest.experienceReward).toBe(68); // 45 * 1.5 = 67.5 → rounded
    expect(quest.description).toContain('Spanish');
    expect(quest.description).toContain('a high fever');
  });

  it('generates valid Prolog content for all seeds', () => {
    for (const seed of EMERGENCY_QUEST_SEEDS) {
      const quest = instantiateSeed(seed, {
        worldId: 'world-1',
        targetLanguage: 'French',
        assignedTo: 'Player',
        values: {
          itemName: 'Test Item',
          ownerNpc: 'NPC A',
          businessA: 'Business A',
          shopkeeperA: 'NPC B',
          businessB: 'Business B',
          shopkeeperB: 'NPC C',
          patientNpc: 'NPC A',
          healerNpc: 'NPC B',
          healerBusiness: 'Clinic',
          symptom: 'a headache',
          businessName: 'Shop',
          npcName: 'NPC A',
          wrongItem: 'wrong thing',
          correctItem: 'right thing',
          senderNpc: 'NPC A',
          senderBusiness: 'Business A',
          receiverNpc: 'NPC B',
          receiverBusiness: 'Business B',
          orderItem: 'supplies',
        },
      });

      expect(quest.content).toBeTruthy();
      expect(quest.content).toContain('quest(');
      expect(quest.content).toContain('quest_objective(');
    }
  });
});

// ── Generator Tests ──────────────────────────────────────────────────────────

describe('generateEmergencyQuests', () => {
  it('generates at least one quest with valid world data', () => {
    const quests = generateEmergencyQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
      items: MOCK_ITEMS,
    });

    expect(quests.length).toBeGreaterThan(0);
  });

  it('defaults to generating 1 quest (semi-random trigger)', () => {
    const quests = generateEmergencyQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
    });

    expect(quests.length).toBe(1);
  });

  it('respects maxQuests parameter', () => {
    const quests = generateEmergencyQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
      maxQuests: 4,
    });

    expect(quests.length).toBeLessThanOrEqual(4);
    expect(quests.length).toBeGreaterThan(0);
  });

  it('respects scenarioFilter', () => {
    const quests = generateEmergencyQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
      scenarioFilter: 'wrong_order',
      maxQuests: 10,
    });

    expect(quests.length).toBe(1);
    expect(quests[0].tags).toContain('emergency');
  });

  it('respects difficulty filter', () => {
    const quests = generateEmergencyQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
      difficulty: 'beginner',
      maxQuests: 10,
    });

    for (const q of quests) {
      expect(q.difficulty).toBe('beginner');
    }
  });

  it('returns empty array when no businesses exist', () => {
    const quests = generateEmergencyQuests({
      world: MOCK_WORLD,
      businesses: [],
      characters: MOCK_CHARACTERS,
    });

    expect(quests).toEqual([]);
  });

  it('returns empty array when no active characters exist', () => {
    const quests = generateEmergencyQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: [],
    });

    expect(quests).toEqual([]);
  });

  it('skips out-of-business businesses', () => {
    const closedBusinesses: BusinessInfo[] = [
      { id: 'biz-closed', name: 'Closed', businessType: 'restaurant', ownerId: 'char-1', isOutOfBusiness: true },
    ];

    const quests = generateEmergencyQuests({
      world: MOCK_WORLD,
      businesses: closedBusinesses,
      characters: MOCK_CHARACTERS,
    });

    expect(quests).toEqual([]);
  });

  it('all generated quests have valid structure', () => {
    const quests = generateEmergencyQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
      maxQuests: 4,
    });

    for (const q of quests) {
      expect(q.worldId).toBe('world-1');
      expect(q.assignedTo).toBe('Player');
      expect(q.targetLanguage).toBe('French');
      expect(q.title).toBeTruthy();
      expect(q.description).toBeTruthy();
      expect(q.questType).toBe('emergency');
      expect(q.objectives.length).toBeGreaterThan(0);
      expect(q.experienceReward).toBeGreaterThan(0);
      expect(q.content).toBeTruthy();
      expect(q.tags).toContain('emergency');
      expect(q.tags).toContain('situational');
      expect(q.tags).toContain('practical');
      expect(q.status).toBe('active');
    }
  });

  it('attaches time bonus metadata in rewards', () => {
    const quests = generateEmergencyQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
      maxQuests: 4,
    });

    for (const q of quests) {
      expect(q.rewards.timeBonus).toBeDefined();
      expect(q.rewards.timeBonus.bonusWindowMinutes).toBeGreaterThan(0);
      expect(q.rewards.timeBonus.bonusMultiplier).toBeGreaterThan(1);
      expect(q.rewards.timeBonus.bonusXp).toBeGreaterThan(0);
    }
  });

  it('uses custom assignedTo', () => {
    const quests = generateEmergencyQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
      assignedTo: 'TestPlayer',
    });

    for (const q of quests) {
      expect(q.assignedTo).toBe('TestPlayer');
    }
  });

  it('uses world items for lost_and_found when available', () => {
    const quests = generateEmergencyQuests({
      world: MOCK_WORLD,
      businesses: MOCK_BUSINESSES,
      characters: MOCK_CHARACTERS,
      items: MOCK_ITEMS,
      scenarioFilter: 'lost_and_found',
    });

    if (quests.length > 0) {
      const itemNames = MOCK_ITEMS.map(i => i.name);
      // The title contains the item name
      const usedItem = itemNames.some(name => quests[0].title.includes(name));
      expect(usedItem).toBe(true);
    }
  });
});

// ── Skill Rewards Integration ────────────────────────────────────────────────

describe('Emergency quest skill rewards', () => {
  it('computes skill rewards for emergency quest type', () => {
    const rewards = computeSkillRewards({
      questType: 'emergency',
      difficulty: 'beginner',
    });

    expect(rewards.length).toBeGreaterThan(0);
    const skillIds = rewards.map(r => r.skillId);
    expect(skillIds).toContain('speaking');
    expect(skillIds).toContain('vocabulary');
    expect(skillIds).toContain('listening');
  });

  it('scales rewards by difficulty', () => {
    const beginnerRewards = computeSkillRewards({ questType: 'emergency', difficulty: 'beginner' });
    const intermediateRewards = computeSkillRewards({ questType: 'emergency', difficulty: 'intermediate' });

    const beginnerTotal = beginnerRewards.reduce((sum, r) => sum + r.level, 0);
    const intermediateTotal = intermediateRewards.reduce((sum, r) => sum + r.level, 0);

    expect(intermediateTotal).toBeGreaterThan(beginnerTotal);
  });
});
