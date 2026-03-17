import { describe, it, expect } from 'vitest';
import {
  validateQuestFeasibility,
  findMatchingActions,
  type QuestObjective,
  type GameAction,
  type WorldContext,
} from '../quest-feasibility-validator';

// ── Test fixtures ───────────────────────────────────────────────────────────

const SOCIAL_ACTION: GameAction = {
  name: 'Talk',
  actionType: 'social',
  category: 'conversation',
  isActive: true,
  tags: ['conversation', 'dialogue'],
};

const PHYSICAL_ACTION: GameAction = {
  name: 'Move',
  actionType: 'physical',
  category: 'movement',
  isActive: true,
  tags: ['movement', 'travel'],
};

const COMBAT_ACTION: GameAction = {
  name: 'Attack',
  actionType: 'physical',
  category: 'combat',
  isActive: true,
  tags: ['combat', 'fight'],
};

const CRAFTING_ACTION: GameAction = {
  name: 'Craft',
  actionType: 'physical',
  category: 'crafting',
  isActive: true,
  tags: ['craft'],
};

const LANGUAGE_ACTION: GameAction = {
  name: 'Practice Language',
  actionType: 'language',
  category: 'language',
  isActive: true,
  tags: ['language', 'vocabulary'],
};

const INVENTORY_ACTION: GameAction = {
  name: 'Pick Up',
  actionType: 'physical',
  category: 'inventory',
  isActive: true,
  tags: ['collect', 'item'],
};

const INACTIVE_ACTION: GameAction = {
  name: 'Disabled Talk',
  actionType: 'social',
  category: 'conversation',
  isActive: false,
  tags: ['conversation'],
};

const ALL_ACTIONS: GameAction[] = [
  SOCIAL_ACTION,
  PHYSICAL_ACTION,
  COMBAT_ACTION,
  CRAFTING_ACTION,
  LANGUAGE_ACTION,
  INVENTORY_ACTION,
];

const WORLD_CONTEXT: WorldContext = {
  npcs: ['Elder Kira', 'Trader Bob'],
  items: ['Healing Herb', 'Iron Sword'],
  locations: ['Village Square', 'Forest Clearing'],
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe('quest-feasibility-validator', () => {
  describe('validateQuestFeasibility', () => {
    it('returns infeasible for empty objectives', () => {
      const result = validateQuestFeasibility([], ALL_ACTIONS);
      expect(result.feasible).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].severity).toBe('error');
      expect(result.issues[0].message).toContain('no objectives');
    });

    it('validates a fully feasible quest', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc', target: 'Elder Kira' },
        { type: 'visit_location', target: 'Village Square' },
        { type: 'collect_item', target: 'Healing Herb' },
      ];
      const result = validateQuestFeasibility(objectives, ALL_ACTIONS, WORLD_CONTEXT);
      expect(result.feasible).toBe(true);
      expect(result.issues.filter(i => i.severity === 'error')).toHaveLength(0);
      expect(result.validCount).toBe(3);
      expect(result.totalCount).toBe(3);
    });

    it('rejects unknown objective types', () => {
      const objectives: QuestObjective[] = [
        { type: 'fly_to_moon' },
      ];
      const result = validateQuestFeasibility(objectives, ALL_ACTIONS);
      expect(result.feasible).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].severity).toBe('error');
      expect(result.issues[0].message).toContain('Unknown objective type');
    });

    it('normalizes objective types before checking', () => {
      const objectives: QuestObjective[] = [
        { type: 'speak_to' }, // normalizes to talk_to_npc
      ];
      const result = validateQuestFeasibility(objectives, ALL_ACTIONS);
      expect(result.feasible).toBe(true);
      expect(result.validCount).toBe(1);
    });

    it('detects missing actions for objective type', () => {
      const objectives: QuestObjective[] = [
        { type: 'defeat_enemies' },
      ];
      // Only social and movement actions — no combat
      const limitedActions: GameAction[] = [SOCIAL_ACTION, PHYSICAL_ACTION];
      const result = validateQuestFeasibility(objectives, limitedActions);
      expect(result.feasible).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].severity).toBe('error');
      expect(result.issues[0].message).toContain('No available actions');
    });

    it('ignores inactive actions', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc' },
      ];
      const result = validateQuestFeasibility(objectives, [INACTIVE_ACTION]);
      expect(result.feasible).toBe(false);
      expect(result.issues.some(i =>
        i.severity === 'error' && i.message.includes('No available actions'),
      )).toBe(true);
    });

    it('warns about non-countable objectives with count > 1', () => {
      const objectives: QuestObjective[] = [
        { type: 'visit_location', required: 5 },
      ];
      const result = validateQuestFeasibility(objectives, ALL_ACTIONS);
      expect(result.feasible).toBe(true);
      expect(result.issues.some(i =>
        i.severity === 'warning' && i.message.includes('not countable'),
      )).toBe(true);
    });

    it('warns when NPC target not found in world', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc', target: 'Ghost NPC' },
      ];
      const result = validateQuestFeasibility(objectives, ALL_ACTIONS, WORLD_CONTEXT);
      expect(result.feasible).toBe(true); // warnings don't block feasibility
      expect(result.issues.some(i =>
        i.severity === 'warning' && i.message.includes('Target NPC'),
      )).toBe(true);
    });

    it('warns when item target not found in world', () => {
      const objectives: QuestObjective[] = [
        { type: 'collect_item', target: 'Mystic Orb' },
      ];
      const result = validateQuestFeasibility(objectives, ALL_ACTIONS, WORLD_CONTEXT);
      expect(result.feasible).toBe(true);
      expect(result.issues.some(i =>
        i.severity === 'warning' && i.message.includes('Target item'),
      )).toBe(true);
    });

    it('warns when location target not found in world', () => {
      const objectives: QuestObjective[] = [
        { type: 'visit_location', target: 'Unknown Cave' },
      ];
      const result = validateQuestFeasibility(objectives, ALL_ACTIONS, WORLD_CONTEXT);
      expect(result.feasible).toBe(true);
      expect(result.issues.some(i =>
        i.severity === 'warning' && i.message.includes('Target location'),
      )).toBe(true);
    });

    it('skips target validation when world context has no entries', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc', target: 'Ghost NPC' },
      ];
      const result = validateQuestFeasibility(objectives, ALL_ACTIONS, { npcs: [] });
      expect(result.feasible).toBe(true);
      expect(result.issues.filter(i => i.message.includes('Target NPC'))).toHaveLength(0);
    });

    it('handles mixed valid and invalid objectives', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc' },           // valid
        { type: 'teleport_home' },          // unknown type
        { type: 'defeat_enemies' },         // valid
      ];
      const result = validateQuestFeasibility(objectives, ALL_ACTIONS);
      expect(result.feasible).toBe(false);
      expect(result.validCount).toBe(2);
      expect(result.totalCount).toBe(3);
    });

    it('validates language-specific objectives against language actions', () => {
      const objectives: QuestObjective[] = [
        { type: 'use_vocabulary', required: 3 },
        { type: 'translation_challenge', required: 2 },
        { type: 'pronunciation_check', required: 1 },
      ];
      const result = validateQuestFeasibility(objectives, [LANGUAGE_ACTION]);
      expect(result.feasible).toBe(true);
      expect(result.validCount).toBe(3);
    });

    it('fails language objectives when no language actions available', () => {
      const objectives: QuestObjective[] = [
        { type: 'translation_challenge' },
      ];
      const result = validateQuestFeasibility(objectives, [PHYSICAL_ACTION, COMBAT_ACTION]);
      expect(result.feasible).toBe(false);
    });

    it('handles case-insensitive target matching', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc', target: 'elder kira' },
      ];
      const result = validateQuestFeasibility(objectives, ALL_ACTIONS, WORLD_CONTEXT);
      expect(result.issues.filter(i => i.message.includes('Target NPC'))).toHaveLength(0);
    });

    it('supports requiredCount as alternative to required', () => {
      const objectives: QuestObjective[] = [
        { type: 'visit_location', requiredCount: 3 },
      ];
      const result = validateQuestFeasibility(objectives, ALL_ACTIONS);
      expect(result.issues.some(i => i.message.includes('not countable'))).toBe(true);
    });
  });

  describe('findMatchingActions', () => {
    it('finds actions by actionType', () => {
      const matches = findMatchingActions('talk_to_npc', ALL_ACTIONS);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some(a => a.name === 'Talk')).toBe(true);
    });

    it('finds actions by category', () => {
      const matches = findMatchingActions('defeat_enemies', ALL_ACTIONS);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some(a => a.name === 'Attack')).toBe(true);
    });

    it('finds actions by tags', () => {
      const tagAction: GameAction = {
        name: 'Vocabulary Drill',
        actionType: 'custom',
        category: 'custom',
        tags: ['vocabulary', 'language'],
        isActive: true,
      };
      const matches = findMatchingActions('use_vocabulary', [tagAction]);
      expect(matches).toHaveLength(1);
    });

    it('excludes inactive actions', () => {
      const matches = findMatchingActions('talk_to_npc', [INACTIVE_ACTION]);
      expect(matches).toHaveLength(0);
    });

    it('returns empty for unknown objective type', () => {
      const matches = findMatchingActions('nonexistent_type', ALL_ACTIONS);
      expect(matches).toHaveLength(0);
    });

    it('matches crafting objectives to crafting actions', () => {
      const matches = findMatchingActions('craft_item', ALL_ACTIONS);
      expect(matches.some(a => a.name === 'Craft')).toBe(true);
    });

    it('matches collect_item to inventory actions', () => {
      const matches = findMatchingActions('collect_item', ALL_ACTIONS);
      expect(matches.some(a => a.name === 'Pick Up')).toBe(true);
    });
  });
});
