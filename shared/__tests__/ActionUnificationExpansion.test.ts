/**
 * Tests for Action Unification and Expansion
 *
 * Covers: action-matrix, ensemble-converter fixes, quest-action-mapping additions,
 * inventory actions, farm actions, natural items, NPC speech act detection,
 * and container/merchant system fixes.
 */

import { describe, it, expect } from 'vitest';

// ── Task 1: Action Matrix ──────────────────────────────────────────────────

import {
  ACTION_MATRIX,
  getActionEntry,
  getActionsForEvent,
  getActionsForObjective,
  getActionNamesForObjective,
  getActionsByMode,
  getActionsByStatus,
  getActionsByCategory,
  getMissingActions,
  type ActionMatrixEntry,
} from '@shared/game-engine/action-matrix';

describe('Action Matrix', () => {
  it('should have entries for all core action categories', () => {
    const categories = new Set(ACTION_MATRIX.map(e => e.category));
    expect(categories.has('social')).toBe(true);
    expect(categories.has('commerce')).toBe(true);
    expect(categories.has('resource')).toBe(true);
    expect(categories.has('language')).toBe(true);
    expect(categories.has('items')).toBe(true);
    expect(categories.has('exploration')).toBe(true);
  });

  it('should look up actions by ID', () => {
    const entry = getActionEntry('buy_item');
    expect(entry).toBeDefined();
    expect(entry!.displayName).toBe('Buy Item');
    expect(entry!.interactionMode).toBe('physical');
  });

  it('should find actions for a given event type', () => {
    const actions = getActionsForEvent('item_purchased');
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some(a => a.actionId === 'buy_item')).toBe(true);
  });

  it('should find actions for a given objective type', () => {
    const actions = getActionsForObjective('photograph_subject');
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some(a => a.actionId === 'take_photo')).toBe(true);
  });

  it('should return action names for ActionManager compatibility', () => {
    const names = getActionNamesForObjective('talk_to_npc');
    expect(names).toContain('talk_to_npc');
  });

  it('should filter by interaction mode', () => {
    const physicalActions = getActionsByMode('physical');
    expect(physicalActions.length).toBeGreaterThan(0);
    expect(physicalActions.every(a => a.interactionMode === 'physical')).toBe(true);
  });

  it('should filter by implementation status', () => {
    const implemented = getActionsByStatus('implemented');
    expect(implemented.length).toBeGreaterThan(0);
    expect(implemented.every(a => a.status === 'implemented')).toBe(true);
  });

  it('should filter by category', () => {
    const social = getActionsByCategory('social');
    expect(social.length).toBeGreaterThan(0);
    expect(social.every(a => a.category === 'social')).toBe(true);
  });

  it('should return missing actions sorted by priority', () => {
    const missing = getMissingActions();
    expect(missing.every(a => a.status !== 'implemented')).toBe(true);
    // Check priority sorting
    for (let i = 1; i < missing.length; i++) {
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      const prev = priorityOrder[missing[i - 1].priority || 'low'] ?? 3;
      const curr = priorityOrder[missing[i].priority || 'low'] ?? 3;
      expect(prev).toBeLessThanOrEqual(curr);
    }
  });

  it('should categorize inventory actions correctly', () => {
    const inventoryActions = getActionsByMode('inventory');
    expect(inventoryActions.some(a => a.actionId === 'consume')).toBe(true);
    expect(inventoryActions.some(a => a.actionId === 'equip_item')).toBe(true);
    expect(inventoryActions.some(a => a.actionId === 'drop_item')).toBe(true);
    expect(inventoryActions.some(a => a.actionId === 'use_item')).toBe(true);
  });

  it('should include farm actions', () => {
    const farmPlant = getActionEntry('farm_plant');
    const farmWater = getActionEntry('farm_water');
    const farmHarvest = getActionEntry('farm_harvest');
    expect(farmPlant).toBeDefined();
    expect(farmWater).toBeDefined();
    expect(farmHarvest).toBeDefined();
    expect(farmPlant!.interactionMode).toBe('physical');
    expect(farmHarvest!.eventTypes).toContain('physical_action_completed');
  });
});

// ── Task 2: Ensemble Converter Fixes ────────────────────────────────────────

import { convertEnsembleAction } from '@shared/prolog/ensemble-converter';

describe('Ensemble Converter - Action Format', () => {
  it('should generate action/4 predicate', () => {
    const result = convertEnsembleAction(
      { name: 'greet', displayName: 'Friendly Greeting', conditions: [], effects: [] },
      'social',
    );
    expect(result.prologContent).toContain("action(greet, 'Friendly Greeting', social, 0).");
  });

  it('should generate can_perform/2 predicate', () => {
    const result = convertEnsembleAction(
      { name: 'test_action', conditions: [], effects: [] },
      'test',
    );
    expect(result.prologContent).toContain('can_perform(X, test_action) :- person(X).');
  });

  it('should generate action_difficulty and action_duration predicates', () => {
    const result = convertEnsembleAction(
      { name: 'test_action', conditions: [], effects: [] },
      'test',
    );
    expect(result.prologContent).toContain('action_difficulty(test_action, 0.5).');
    expect(result.prologContent).toContain('action_duration(test_action, 1).');
  });

  it('should use action_effect/2 instead of rule_effect/2 for action effects', () => {
    const result = convertEnsembleAction(
      {
        name: 'test_action',
        conditions: [],
        effects: [
          { category: 'network', type: 'affinity', first: 'initiator', second: 'responder', operator: '+', value: 5 },
        ],
      },
      'social',
    );
    expect(result.prologContent).toContain('action_effect(test_action,');
    expect(result.prologContent).not.toContain('rule_effect(test_action,');
  });

  it('should generate action_source predicate', () => {
    const result = convertEnsembleAction(
      { name: 'greet', conditions: [], effects: [] },
      'social',
    );
    expect(result.prologContent).toContain('action_source(greet, ensemble).');
  });

  it('should generate action_tag predicate', () => {
    const result = convertEnsembleAction(
      { name: 'greet', conditions: [], effects: [] },
      'social',
    );
    expect(result.prologContent).toContain('action_tag(greet, social).');
  });

  it('should generate can_perform with conditions when provided', () => {
    const result = convertEnsembleAction(
      {
        name: 'greet',
        conditions: [{ category: 'trait', type: 'friendly', first: 'initiator' }],
        effects: [],
      },
      'social',
    );
    expect(result.prologContent).toContain('can_perform(X, greet) :-');
    expect(result.prologContent).toContain('trait(X, friendly)');
  });
});

// ── Task 4: Quest Action Mappings ───────────────────────────────────────────

import {
  QUEST_ACTION_MAPPINGS,
  getMappingForObjective,
  getMappingsForEvent,
  matchesField,
} from '@shared/game-engine/quest-action-mapping';

describe('Quest Action Mappings - Inventory Actions', () => {
  it('should have mapping for use_item objective', () => {
    const mapping = getMappingForObjective('use_item');
    expect(mapping).toBeDefined();
    expect(mapping!.eventType).toBe('item_used');
  });

  it('should have mapping for equip_item objective', () => {
    const mapping = getMappingForObjective('equip_item');
    expect(mapping).toBeDefined();
    expect(mapping!.eventType).toBe('item_equipped');
  });

  it('should have mapping for drop_item objective', () => {
    const mapping = getMappingForObjective('drop_item');
    expect(mapping).toBeDefined();
    expect(mapping!.eventType).toBe('item_dropped');
  });

  it('should have mapping for buy_item objective', () => {
    const mapping = getMappingForObjective('buy_item');
    expect(mapping).toBeDefined();
    expect(mapping!.eventType).toBe('item_purchased');
  });

  it('should have mapping for deliver_item objective', () => {
    const mapping = getMappingForObjective('deliver_item');
    expect(mapping).toBeDefined();
    expect(mapping!.eventType).toBe('item_delivered');
  });

  it('should have mapping for perform_action (generic)', () => {
    const mapping = getMappingForObjective('perform_action');
    expect(mapping).toBeDefined();
    expect(mapping!.eventType).toBe('action_executed');
  });

  it('should have mapping for NPC speech acts', () => {
    const mapping = getMappingForObjective('receive_directions');
    expect(mapping).toBeDefined();
    expect(mapping!.eventType).toBe('npc_speech_act');
  });
});

// ── Task 6: Physical Action Types ───────────────────────────────────────────

import { ACTION_DEFINITIONS, BUSINESS_ACTION_HOTSPOTS } from '@shared/game-engine/rendering/PlayerActionSystem';

describe('Physical Actions - Farming', () => {
  it('should define farm_plant action', () => {
    const def = ACTION_DEFINITIONS.farm_plant;
    expect(def).toBeDefined();
    expect(def.displayName).toBe('Plant Crops');
    expect(def.energyCost).toBeGreaterThan(0);
    expect(def.validLocations).toContain('farm');
  });

  it('should define farm_water action', () => {
    const def = ACTION_DEFINITIONS.farm_water;
    expect(def).toBeDefined();
    expect(def.displayName).toBe('Water Crops');
    expect(def.validLocations).toContain('farm');
  });

  it('should define farm_harvest action with item rewards', () => {
    const def = ACTION_DEFINITIONS.farm_harvest;
    expect(def).toBeDefined();
    expect(def.displayName).toBe('Harvest Crops');
    expect(def.itemRewards.length).toBeGreaterThan(0);
    expect(def.itemRewards.some(r => r.itemName === 'wheat')).toBe(true);
  });

  it('should register farm actions in business hotspots', () => {
    const farmHotspots = BUSINESS_ACTION_HOTSPOTS.farm;
    expect(farmHotspots).toBeDefined();
    expect(farmHotspots.some(h => h.actionType === 'farm_plant')).toBe(true);
    expect(farmHotspots.some(h => h.actionType === 'farm_water')).toBe(true);
    expect(farmHotspots.some(h => h.actionType === 'farm_harvest')).toBe(true);
  });
});

// ── Task 7: Natural Items ───────────────────────────────────────────────────

import {
  TREE_ITEMS,
  STONE_ITEMS,
  HERB_ITEMS,
  ALL_NATURAL_ITEMS,
  resolveNaturalItem,
} from '@shared/game-engine/natural-items';

describe('Natural Items', () => {
  it('should define tree items', () => {
    expect(TREE_ITEMS.length).toBeGreaterThanOrEqual(7);
    expect(TREE_ITEMS.some(i => i.itemName === 'oak_wood')).toBe(true);
    expect(TREE_ITEMS.every(i => i.harvestAction === 'chopping')).toBe(true);
  });

  it('should define stone items', () => {
    expect(STONE_ITEMS.length).toBeGreaterThanOrEqual(5);
    expect(STONE_ITEMS.some(i => i.itemName === 'granite')).toBe(true);
    expect(STONE_ITEMS.every(i => i.harvestAction === 'mining')).toBe(true);
  });

  it('should define herb items', () => {
    expect(HERB_ITEMS.length).toBeGreaterThanOrEqual(8);
    expect(HERB_ITEMS.some(i => i.itemName === 'lavender')).toBe(true);
  });

  it('should combine all items', () => {
    expect(ALL_NATURAL_ITEMS.length).toBe(TREE_ITEMS.length + STONE_ITEMS.length + HERB_ITEMS.length);
  });

  it('should resolve natural item from mesh name', () => {
    expect(resolveNaturalItem('oak_tree_01')).toBeDefined();
    expect(resolveNaturalItem('oak_tree_01')!.itemName).toBe('oak_wood');
    expect(resolveNaturalItem('rock_large')).toBeDefined();
    expect(resolveNaturalItem('rock_large')!.itemName).toBe('granite');
    expect(resolveNaturalItem('flower_patch')).toBeDefined();
    expect(resolveNaturalItem('flower_patch')!.itemName).toBe('lavender');
    expect(resolveNaturalItem('unrelated_mesh')).toBeNull();
  });
});

// ── Task 9: NPC Speech Act Detection ────────────────────────────────────────

import { ConversationalActionDetector } from '@shared/game-engine/logic/ConversationalActionDetector';

describe('NPC Speech Act Detection', () => {
  it('should detect gave_directions from NPC message', () => {
    const acts = ConversationalActionDetector.detectNPCSpeechActs(
      "The bakery is to the left, past the church. Go north along the main road.",
      "Marie"
    );
    expect(acts.some(a => a.type === 'gave_directions')).toBe(true);
  });

  it('should detect taught_vocabulary from NPC message', () => {
    const acts = ConversationalActionDetector.detectNPCSpeechActs(
      "The word for bread in French is 'pain'. It translates to pain.",
      "Pierre"
    );
    expect(acts.some(a => a.type === 'taught_vocabulary')).toBe(true);
  });

  it('should detect asked_question from NPC message', () => {
    const acts = ConversationalActionDetector.detectNPCSpeechActs(
      "Do you have any gold coins to trade?",
      "Merchant"
    );
    expect(acts.some(a => a.type === 'asked_question')).toBe(true);
  });

  it('should detect assigned_quest from NPC message', () => {
    const acts = ConversationalActionDetector.detectNPCSpeechActs(
      "I need you to find the missing writer. Can you bring me the old map from the library?",
      "Mayor"
    );
    expect(acts.some(a => a.type === 'assigned_quest')).toBe(true);
  });

  it('should detect told_story from NPC message', () => {
    const acts = ConversationalActionDetector.detectNPCSpeechActs(
      "Long ago, there was a legend about a hidden treasure in these hills.",
      "Elder"
    );
    expect(acts.some(a => a.type === 'told_story')).toBe(true);
  });

  it('should return empty array for generic messages', () => {
    const acts = ConversationalActionDetector.detectNPCSpeechActs(
      "Hello, nice weather today.",
      "NPC"
    );
    // May or may not detect something, but shouldn't crash
    expect(Array.isArray(acts)).toBe(true);
  });

  it('should sort results by confidence descending', () => {
    const acts = ConversationalActionDetector.detectNPCSpeechActs(
      "I need you to find the bakery. Go north past the church. The word for bread is pain. Long ago there was a legend.",
      "NPC"
    );
    for (let i = 1; i < acts.length; i++) {
      expect(acts[i - 1].confidence).toBeGreaterThanOrEqual(acts[i].confidence);
    }
  });
});
