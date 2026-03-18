/**
 * Tests for multi-NPC quest scenarios across businesses.
 *
 * Covers:
 * - Scenario definitions (structure, valid objective types, NPC roles)
 * - Scenario lookup helpers
 * - NPC role resolution with real world data
 * - Multi-NPC quest generation (end-to-end)
 * - NPC quest guidance with participant roles
 */

import { describe, it, expect } from 'vitest';
import {
  MULTI_NPC_SCENARIOS,
  getMultiNpcScenarios,
  getScenariosForBusinessCount,
  getScenariosByDifficulty,
  getBusinessOwnerRoles,
  getRequiredRoleTypes,
  type QuestParticipant,
} from '../../shared/language/multi-npc-quest-scenarios';
import { VALID_OBJECTIVE_TYPES } from '../../shared/quest-objective-types';
import {
  generateMultiNpcQuests,
  resolveNpcRoles,
  type MultiNpcQuestOptions,
} from '../services/multi-npc-quest-generator';
import {
  findRelevantQuests,
  buildQuestGuidance,
  getQuestParticipants,
} from '../services/conversation/npc-quest-guidance';
import type { Character, World, Quest } from '../../shared/schema';
import type { BusinessInfo } from '../services/business-roleplay-quest-generator';

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
  { id: 'char-4', worldId: 'world-1', firstName: 'Sophie', lastName: 'Bernard', status: 'active' } as Character,
  { id: 'char-5', worldId: 'world-1', firstName: 'Jacques', lastName: 'Martin', status: 'active' } as Character,
];

const MOCK_BUSINESSES: BusinessInfo[] = [
  { id: 'biz-1', name: 'Chez Jean', businessType: 'restaurant', ownerId: 'char-1' },
  { id: 'biz-2', name: "Laurent's Bakery", businessType: 'bakery', ownerId: 'char-2' },
  { id: 'biz-3', name: "Moreau's Forge", businessType: 'blacksmith', ownerId: 'char-3' },
  { id: 'biz-4', name: 'Town Bank', businessType: 'bank', ownerId: 'char-4' },
];

// ── Scenario Definition Tests ────────────────────────────────────────────────

describe('MULTI_NPC_SCENARIOS', () => {
  it('should have unique IDs', () => {
    const ids = MULTI_NPC_SCENARIOS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have unique seed IDs', () => {
    const seedIds = MULTI_NPC_SCENARIOS.map(s => s.seed.id);
    expect(new Set(seedIds).size).toBe(seedIds.length);
  });

  it('should all have category business_roleplay', () => {
    for (const scenario of MULTI_NPC_SCENARIOS) {
      expect(scenario.category).toBe('business_roleplay');
      expect(scenario.seed.category).toBe('business_roleplay');
    }
  });

  it('should only use valid objective types', () => {
    for (const scenario of MULTI_NPC_SCENARIOS) {
      for (const obj of scenario.seed.objectiveTemplates) {
        expect(VALID_OBJECTIVE_TYPES.has(obj.type)).toBe(true);
      }
    }
  });

  it('should have positive baseXp', () => {
    for (const scenario of MULTI_NPC_SCENARIOS) {
      expect(scenario.seed.baseXp).toBeGreaterThan(0);
    }
  });

  it('should have at least 2 NPC roles each', () => {
    for (const scenario of MULTI_NPC_SCENARIOS) {
      expect(scenario.npcRoles.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have minBusinesses >= 2', () => {
    for (const scenario of MULTI_NPC_SCENARIOS) {
      expect(scenario.minBusinesses).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have all NPC role paramNames present in seed params', () => {
    for (const scenario of MULTI_NPC_SCENARIOS) {
      const seedParamNames = new Set(scenario.seed.params.map(p => p.name));
      for (const role of scenario.npcRoles) {
        expect(seedParamNames.has(role.paramName)).toBe(true);
        if (role.businessParamName) {
          expect(seedParamNames.has(role.businessParamName)).toBe(true);
        }
      }
    }
  });

  it('should have multi_npc tag in seed tags', () => {
    for (const scenario of MULTI_NPC_SCENARIOS) {
      expect(scenario.seed.tags).toContain('multi_npc');
    }
  });

  it('should have valid difficulty levels', () => {
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    for (const scenario of MULTI_NPC_SCENARIOS) {
      expect(validDifficulties).toContain(scenario.difficulty);
      expect(scenario.seed.difficulty).toBe(scenario.difficulty);
    }
  });
});

// ── Lookup Helper Tests ──────────────────────────────────────────────────────

describe('Scenario lookup helpers', () => {
  it('getMultiNpcScenarios returns all scenarios', () => {
    const scenarios = getMultiNpcScenarios();
    expect(scenarios.length).toBe(MULTI_NPC_SCENARIOS.length);
  });

  it('getScenariosForBusinessCount filters by business count', () => {
    const twoCount = getScenariosForBusinessCount(2);
    const threeCount = getScenariosForBusinessCount(3);

    // More businesses should unlock more (or equal) scenarios
    expect(threeCount.length).toBeGreaterThanOrEqual(twoCount.length);
    for (const s of twoCount) {
      expect(s.minBusinesses).toBeLessThanOrEqual(2);
    }
    for (const s of threeCount) {
      expect(s.minBusinesses).toBeLessThanOrEqual(3);
    }
  });

  it('getScenariosForBusinessCount returns empty for 0 businesses', () => {
    expect(getScenariosForBusinessCount(0)).toEqual([]);
    expect(getScenariosForBusinessCount(1)).toEqual([]);
  });

  it('getScenariosByDifficulty filters correctly', () => {
    const beginner = getScenariosByDifficulty('beginner');
    for (const s of beginner) {
      expect(s.difficulty).toBe('beginner');
    }

    const advanced = getScenariosByDifficulty('advanced');
    for (const s of advanced) {
      expect(s.difficulty).toBe('advanced');
    }
  });

  it('getBusinessOwnerRoles returns only owner roles', () => {
    for (const scenario of MULTI_NPC_SCENARIOS) {
      const ownerRoles = getBusinessOwnerRoles(scenario);
      for (const role of ownerRoles) {
        expect(role.requiresBusinessOwner).toBe(true);
      }
    }
  });

  it('getRequiredRoleTypes returns unique roles', () => {
    for (const scenario of MULTI_NPC_SCENARIOS) {
      const roles = getRequiredRoleTypes(scenario);
      expect(new Set(roles).size).toBe(roles.length);
    }
  });
});

// ── NPC Role Resolution Tests ────────────────────────────────────────────────

describe('resolveNpcRoles', () => {
  // Helper to get businesses with owners
  function getBusinessesWithOwners(businesses: BusinessInfo[], characters: Character[]) {
    return businesses
      .filter(b => !b.isOutOfBusiness)
      .map(b => ({
        business: b,
        owner: characters.find(c => c.id === b.ownerId && c.status === 'active')!,
      }))
      .filter(bwo => bwo.owner);
  }

  it('resolves roles for supply_chain_delivery with 2 businesses', () => {
    const scenario = MULTI_NPC_SCENARIOS.find(s => s.id === 'supply_chain_delivery')!;
    const bwo = getBusinessesWithOwners(MOCK_BUSINESSES, MOCK_CHARACTERS);

    const result = resolveNpcRoles(scenario, bwo, MOCK_CHARACTERS);
    expect(result).not.toBeNull();
    expect(result!.participants.length).toBe(2);
    expect(result!.participants[0].role).toBe('sender');
    expect(result!.participants[1].role).toBe('receiver');
    expect(result!.participants[0].businessId).toBeTruthy();
    expect(result!.participants[1].businessId).toBeTruthy();
    expect(result!.participants[0].businessId).not.toBe(result!.participants[1].businessId);
  });

  it('resolves roles for guided_business_tour (includes non-owner guide)', () => {
    const scenario = MULTI_NPC_SCENARIOS.find(s => s.id === 'guided_business_tour')!;
    const bwo = getBusinessesWithOwners(MOCK_BUSINESSES, MOCK_CHARACTERS);

    const result = resolveNpcRoles(scenario, bwo, MOCK_CHARACTERS);
    expect(result).not.toBeNull();
    expect(result!.participants.length).toBe(3);

    const guide = result!.participants.find(p => p.role === 'guide');
    expect(guide).toBeDefined();
    expect(guide!.businessId).toBeUndefined();

    const shopkeepers = result!.participants.filter(p => p.role === 'shopkeeper');
    expect(shopkeepers.length).toBe(2);
    expect(shopkeepers[0].businessId).toBeTruthy();
    expect(shopkeepers[1].businessId).toBeTruthy();
  });

  it('returns null when not enough businesses for trade_network', () => {
    const scenario = MULTI_NPC_SCENARIOS.find(s => s.id === 'trade_network')!;
    // Only 1 business
    const bwo = getBusinessesWithOwners(MOCK_BUSINESSES.slice(0, 1), MOCK_CHARACTERS);

    const result = resolveNpcRoles(scenario, bwo, MOCK_CHARACTERS);
    expect(result).toBeNull();
  });

  it('resolves roles for trade_network with 3+ businesses', () => {
    const scenario = MULTI_NPC_SCENARIOS.find(s => s.id === 'trade_network')!;
    const bwo = getBusinessesWithOwners(MOCK_BUSINESSES, MOCK_CHARACTERS);

    const result = resolveNpcRoles(scenario, bwo, MOCK_CHARACTERS);
    expect(result).not.toBeNull();
    expect(result!.participants.length).toBe(3);

    // All participants should have unique NPC IDs
    const npcIds = result!.participants.map(p => p.npcId);
    expect(new Set(npcIds).size).toBe(3);

    // All business-owning participants should have unique business IDs
    const bizIds = result!.participants.filter(p => p.businessId).map(p => p.businessId);
    expect(new Set(bizIds).size).toBe(3);
  });

  it('populates template values correctly', () => {
    const scenario = MULTI_NPC_SCENARIOS.find(s => s.id === 'business_dispute')!;
    const bwo = getBusinessesWithOwners(MOCK_BUSINESSES, MOCK_CHARACTERS);

    const result = resolveNpcRoles(scenario, bwo, MOCK_CHARACTERS);
    expect(result).not.toBeNull();

    // Should have values for npcA, npcB, businessA, businessB
    expect(result!.values.npcA).toBeTruthy();
    expect(result!.values.npcB).toBeTruthy();
    expect(result!.values.businessA).toBeTruthy();
    expect(result!.values.businessB).toBeTruthy();
    expect(result!.values.npcA).not.toBe(result!.values.npcB);
    expect(result!.values.businessA).not.toBe(result!.values.businessB);
  });

  it('assigns unique NPCs to each role (no NPC reuse)', () => {
    for (const scenario of MULTI_NPC_SCENARIOS) {
      if (scenario.minBusinesses > MOCK_BUSINESSES.length) continue;

      const bwo = getBusinessesWithOwners(MOCK_BUSINESSES, MOCK_CHARACTERS);
      const result = resolveNpcRoles(scenario, bwo, MOCK_CHARACTERS);
      if (!result) continue;

      const npcIds = result.participants.map(p => p.npcId);
      expect(new Set(npcIds).size).toBe(npcIds.length);
    }
  });
});

// ── Generator Tests ──────────────────────────────────────────────────────────

describe('generateMultiNpcQuests', () => {
  const defaultOptions: MultiNpcQuestOptions = {
    world: MOCK_WORLD,
    businesses: MOCK_BUSINESSES,
    characters: MOCK_CHARACTERS,
  };

  it('generates quests from eligible scenarios', () => {
    const quests = generateMultiNpcQuests(defaultOptions);
    expect(quests.length).toBeGreaterThan(0);
  });

  it('all generated quests have participants', () => {
    const quests = generateMultiNpcQuests(defaultOptions);
    for (const q of quests) {
      expect(q.participants.length).toBeGreaterThanOrEqual(2);
      expect(q.scenarioId).toBeTruthy();
    }
  });

  it('all generated quests have valid structure', () => {
    const quests = generateMultiNpcQuests(defaultOptions);
    for (const q of quests) {
      expect(q.worldId).toBe('world-1');
      expect(q.assignedTo).toBe('Player');
      expect(q.targetLanguage).toBe('French');
      expect(q.title).toBeTruthy();
      expect(q.description).toBeTruthy();
      expect(q.objectives.length).toBeGreaterThan(0);
      expect(q.experienceReward).toBeGreaterThan(0);
      expect(q.content).toBeTruthy();
      expect(q.tags).toContain('multi_npc');
      expect(q.tags).toContain('multi_business');
      expect(q.status).toBe('active');
    }
  });

  it('quest tags include scenario and business IDs', () => {
    const quests = generateMultiNpcQuests(defaultOptions);
    for (const q of quests) {
      expect(q.tags.some(t => t.startsWith('scenario:'))).toBe(true);
      expect(q.tags.some(t => t.startsWith('businessId:'))).toBe(true);
    }
  });

  it('quest descriptions contain NPC names (not template placeholders)', () => {
    const quests = generateMultiNpcQuests(defaultOptions);
    for (const q of quests) {
      expect(q.description).not.toContain('{{');
      expect(q.title).not.toContain('{{');
    }
  });

  it('respects difficulty filter', () => {
    const quests = generateMultiNpcQuests({ ...defaultOptions, difficulty: 'beginner' });
    for (const q of quests) {
      expect(q.difficulty).toBe('beginner');
    }
  });

  it('respects maxQuests limit', () => {
    const quests = generateMultiNpcQuests({ ...defaultOptions, maxQuests: 2 });
    expect(quests.length).toBeLessThanOrEqual(2);
  });

  it('respects scenarioIds filter', () => {
    const quests = generateMultiNpcQuests({
      ...defaultOptions,
      scenarioIds: ['supply_chain_delivery'],
    });

    expect(quests.length).toBe(1);
    expect(quests[0].scenarioId).toBe('supply_chain_delivery');
  });

  it('returns empty array when not enough businesses', () => {
    const quests = generateMultiNpcQuests({
      ...defaultOptions,
      businesses: MOCK_BUSINESSES.slice(0, 1),
    });
    expect(quests).toEqual([]);
  });

  it('returns empty array when no businesses', () => {
    const quests = generateMultiNpcQuests({ ...defaultOptions, businesses: [] });
    expect(quests).toEqual([]);
  });

  it('skips out-of-business businesses', () => {
    const closedBusinesses: BusinessInfo[] = [
      { id: 'biz-closed-1', name: 'Closed A', businessType: 'restaurant', ownerId: 'char-1', isOutOfBusiness: true },
      { id: 'biz-closed-2', name: 'Closed B', businessType: 'bakery', ownerId: 'char-2', isOutOfBusiness: true },
    ];

    const quests = generateMultiNpcQuests({ ...defaultOptions, businesses: closedBusinesses });
    expect(quests).toEqual([]);
  });

  it('uses custom assignedTo', () => {
    const quests = generateMultiNpcQuests({ ...defaultOptions, assignedTo: 'TestPlayer' });
    for (const q of quests) {
      expect(q.assignedTo).toBe('TestPlayer');
    }
  });
});

// ── NPC Quest Guidance with Participants Tests ───────────────────────────────

describe('NPC quest guidance with multi-NPC participants', () => {
  function makeMultiNpcQuest(participants: QuestParticipant[]): Quest {
    return {
      id: 'quest-multi-1',
      worldId: 'world-1',
      assignedTo: 'Player',
      assignedBy: participants[0]?.npcName ?? 'NPC',
      assignedByCharacterId: participants[0]?.npcId,
      title: 'Supply Chain Delivery',
      description: 'Deliver goods between businesses',
      questType: 'business_roleplay',
      difficulty: 'advanced',
      targetLanguage: 'French',
      status: 'active',
      objectives: [
        { type: 'visit_location', description: `Go to ${participants[0]?.businessName ?? 'Business A'}`, completed: false },
        { type: 'complete_conversation', description: `Confirm order with ${participants[0]?.npcName ?? 'NPC A'}`, completed: false, required: 3, current: 0 },
        { type: 'visit_location', description: `Deliver to ${participants[1]?.businessName ?? 'Business B'}`, completed: false },
        { type: 'complete_conversation', description: `Confirm delivery with ${participants[1]?.npcName ?? 'NPC B'}`, completed: false, required: 3, current: 0 },
      ],
      progress: {
        percentComplete: 0,
        participants,
      },
      tags: ['multi_npc', 'multi_business'],
    } as unknown as Quest;
  }

  it('getQuestParticipants extracts participants from progress', () => {
    const participants: QuestParticipant[] = [
      { role: 'sender', npcId: 'char-1', npcName: 'Jean Dupont', businessId: 'biz-1', businessName: 'Chez Jean' },
      { role: 'receiver', npcId: 'char-2', npcName: 'Marie Laurent', businessId: 'biz-2', businessName: "Laurent's Bakery" },
    ];

    const quest = makeMultiNpcQuest(participants);
    const extracted = getQuestParticipants(quest);
    expect(extracted).toEqual(participants);
  });

  it('getQuestParticipants returns empty for quests without participants', () => {
    const quest = {
      id: 'quest-1',
      status: 'active',
      progress: { percentComplete: 0 },
    } as unknown as Quest;

    expect(getQuestParticipants(quest)).toEqual([]);
  });

  it('findRelevantQuests detects participant role', () => {
    const participants: QuestParticipant[] = [
      { role: 'sender', npcId: 'char-1', npcName: 'Jean Dupont', businessId: 'biz-1', businessName: 'Chez Jean' },
      { role: 'receiver', npcId: 'char-2', npcName: 'Marie Laurent', businessId: 'biz-2', businessName: "Laurent's Bakery" },
    ];

    const quest = makeMultiNpcQuest(participants);

    // Check sender NPC
    const senderContexts = findRelevantQuests('char-1', 'Jean Dupont', [quest]);
    expect(senderContexts.length).toBe(1);
    // char-1 is both participant AND assignedByCharacterId, so quest_giver wins
    expect(senderContexts[0].participantRole).toBe('sender');

    // Check receiver NPC
    const receiverContexts = findRelevantQuests('char-2', 'Marie Laurent', [quest]);
    expect(receiverContexts.length).toBe(1);
    expect(receiverContexts[0].role).toBe('participant');
    expect(receiverContexts[0].participantRole).toBe('receiver');
  });

  it('findRelevantQuests matches NPC by description mention', () => {
    const participants: QuestParticipant[] = [
      { role: 'sender', npcId: 'char-1', npcName: 'Jean Dupont', businessId: 'biz-1', businessName: 'Chez Jean' },
      { role: 'receiver', npcId: 'char-2', npcName: 'Marie Laurent', businessId: 'biz-2', businessName: "Laurent's Bakery" },
    ];

    const quest = makeMultiNpcQuest(participants);
    const contexts = findRelevantQuests('char-2', 'Marie Laurent', [quest]);

    expect(contexts.length).toBe(1);
    // Should find objectives mentioning Marie Laurent
    expect(contexts[0].relevantObjectives.length).toBeGreaterThan(0);
  });

  it('buildQuestGuidance includes participant role guidance', () => {
    const participants: QuestParticipant[] = [
      { role: 'sender', npcId: 'char-1', npcName: 'Jean Dupont', businessId: 'biz-1', businessName: 'Chez Jean' },
      { role: 'receiver', npcId: 'char-2', npcName: 'Marie Laurent', businessId: 'biz-2', businessName: "Laurent's Bakery" },
    ];

    const quest = makeMultiNpcQuest(participants);

    // Get guidance for the receiver
    const contexts = findRelevantQuests('char-2', 'Marie Laurent', [quest]);
    const guidance = buildQuestGuidance(contexts);

    expect(guidance.hasGuidance).toBe(true);
    expect(guidance.systemPromptAddition).toContain('delivery');
    expect(guidance.systemPromptAddition).toContain('NPC-GUIDED CONVERSATION MODE');
  });

  it('handles quests with no participants gracefully', () => {
    const quest = {
      id: 'quest-1',
      worldId: 'world-1',
      assignedTo: 'Player',
      assignedBy: 'Jean Dupont',
      assignedByCharacterId: 'char-1',
      title: 'Simple Quest',
      description: 'A simple quest',
      status: 'active',
      objectives: [
        { type: 'talk_to_npc', description: 'Talk to Jean Dupont', target: 'Jean Dupont', completed: false },
      ],
      progress: { percentComplete: 0 },
      tags: [],
    } as unknown as Quest;

    const contexts = findRelevantQuests('char-1', 'Jean Dupont', [quest]);
    expect(contexts.length).toBe(1);
    expect(contexts[0].role).toBe('quest_giver');
    expect(contexts[0].participantRole).toBeUndefined();
  });
});
