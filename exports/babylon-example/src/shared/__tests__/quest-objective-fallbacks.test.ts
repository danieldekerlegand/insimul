import { describe, it, expect } from 'vitest';
import {
  detectUncompletableObjective,
  detectUncompletableObjectives,
  generateFallbackObjective,
  applyObjectiveFallbacks,
  getFallbacksForType,
  type WorldState,
} from '../quest-objective-fallbacks';

function makeWorldState(overrides: Partial<WorldState> = {}): WorldState {
  return {
    availableNpcs: ['baker', 'merchant', 'teacher'],
    availableLocations: ['market', 'school', 'plaza'],
    availableItems: ['bread', 'book', 'coin'],
    ...overrides,
  };
}

function makeObjective(overrides: Record<string, any> = {}) {
  return {
    id: 'obj-1',
    questId: 'quest-1',
    type: 'talk_to_npc',
    description: 'Talk to the baker',
    completed: false,
    npcId: 'baker',
    ...overrides,
  };
}

describe('Quest Objective Fallback System', () => {
  // ── Detection ─────────────────────────────────────────────────────────

  describe('detectUncompletableObjective', () => {
    it('returns null when the NPC is available', () => {
      const obj = makeObjective({ npcId: 'baker' });
      const result = detectUncompletableObjective(obj, makeWorldState());
      expect(result).toBeNull();
    });

    it('detects missing NPC', () => {
      const obj = makeObjective({ npcId: 'blacksmith' });
      const result = detectUncompletableObjective(obj, makeWorldState());
      expect(result).not.toBeNull();
      expect(result!.reason).toBe('npc_missing');
      expect(result!.missingTarget).toBe('blacksmith');
    });

    it('detects missing NPC by npcName', () => {
      const obj = makeObjective({ npcId: undefined, npcName: 'wizard', type: 'talk_to_npc' });
      const result = detectUncompletableObjective(obj, makeWorldState());
      expect(result).not.toBeNull();
      expect(result!.reason).toBe('npc_missing');
      expect(result!.missingTarget).toBe('wizard');
    });

    it('detects missing NPC via target field', () => {
      const obj = makeObjective({ npcId: undefined, target: 'wizard', type: 'listen_and_repeat' });
      const result = detectUncompletableObjective(obj, makeWorldState());
      expect(result).not.toBeNull();
      expect(result!.reason).toBe('npc_missing');
    });

    it('detects unavailable location', () => {
      const obj = makeObjective({ type: 'visit_location', npcId: undefined, locationName: 'dungeon' });
      const result = detectUncompletableObjective(obj, makeWorldState());
      expect(result).not.toBeNull();
      expect(result!.reason).toBe('location_unavailable');
      expect(result!.missingTarget).toBe('dungeon');
    });

    it('returns null when location is available', () => {
      const obj = makeObjective({ type: 'visit_location', npcId: undefined, locationName: 'market' });
      const result = detectUncompletableObjective(obj, makeWorldState());
      expect(result).toBeNull();
    });

    it('detects unavailable item', () => {
      const obj = makeObjective({ type: 'collect_item', npcId: undefined, itemName: 'sword' });
      const result = detectUncompletableObjective(obj, makeWorldState());
      expect(result).not.toBeNull();
      expect(result!.reason).toBe('item_unavailable');
      expect(result!.missingTarget).toBe('sword');
    });

    it('returns null when item is available', () => {
      const obj = makeObjective({ type: 'collect_item', npcId: undefined, itemName: 'bread' });
      const result = detectUncompletableObjective(obj, makeWorldState());
      expect(result).toBeNull();
    });

    it('returns null for objective types with no target requirement', () => {
      const obj = makeObjective({ type: 'use_vocabulary', npcId: undefined });
      const result = detectUncompletableObjective(obj, makeWorldState());
      expect(result).toBeNull();
    });

    it('returns null for already-unknown objective types', () => {
      const obj = makeObjective({ type: 'unknown_type', npcId: undefined });
      const result = detectUncompletableObjective(obj, makeWorldState());
      expect(result).toBeNull();
    });

    it('matching is case-insensitive', () => {
      const obj = makeObjective({ npcId: 'Baker' });
      const result = detectUncompletableObjective(obj, makeWorldState());
      expect(result).toBeNull();
    });

    it('returns null when NPC target is not specified', () => {
      const obj = makeObjective({ type: 'talk_to_npc', npcId: undefined, npcName: undefined, target: undefined });
      const result = detectUncompletableObjective(obj, makeWorldState());
      expect(result).toBeNull();
    });
  });

  // ── Batch detection ───────────────────────────────────────────────────

  describe('detectUncompletableObjectives', () => {
    it('returns empty array when all objectives are completable', () => {
      const objectives = [
        makeObjective({ id: 'obj-1', npcId: 'baker' }),
        makeObjective({ id: 'obj-2', type: 'visit_location', npcId: undefined, locationName: 'market' }),
      ];
      const result = detectUncompletableObjectives(objectives, makeWorldState());
      expect(result).toHaveLength(0);
    });

    it('detects multiple uncompletable objectives', () => {
      const objectives = [
        makeObjective({ id: 'obj-1', npcId: 'ghost' }),
        makeObjective({ id: 'obj-2', type: 'visit_location', npcId: undefined, locationName: 'dungeon' }),
      ];
      const result = detectUncompletableObjectives(objectives, makeWorldState());
      expect(result).toHaveLength(2);
      expect(result[0].reason).toBe('npc_missing');
      expect(result[1].reason).toBe('location_unavailable');
    });

    it('skips completed objectives', () => {
      const objectives = [
        makeObjective({ id: 'obj-1', npcId: 'ghost', completed: true }),
        makeObjective({ id: 'obj-2', npcId: 'wizard' }),
      ];
      const result = detectUncompletableObjectives(objectives, makeWorldState());
      expect(result).toHaveLength(1);
      expect(result[0].objectiveId).toBe('obj-2');
    });

    it('detects broken dependency chains', () => {
      const objectives = [
        makeObjective({ id: 'obj-1', npcId: 'ghost' }),
        makeObjective({ id: 'obj-2', type: 'use_vocabulary', npcId: undefined, dependsOn: ['obj-1'] }),
      ];
      const result = detectUncompletableObjectives(objectives, makeWorldState());
      expect(result).toHaveLength(2);
      expect(result[0].reason).toBe('npc_missing');
      expect(result[1].reason).toBe('dependency_unresolvable');
    });

    it('does not flag dependency as broken when prerequisite is completable', () => {
      const objectives = [
        makeObjective({ id: 'obj-1', npcId: 'baker' }),
        makeObjective({ id: 'obj-2', type: 'use_vocabulary', npcId: undefined, dependsOn: ['obj-1'] }),
      ];
      const result = detectUncompletableObjectives(objectives, makeWorldState());
      expect(result).toHaveLength(0);
    });
  });

  // ── Fallback generation ───────────────────────────────────────────────

  describe('getFallbacksForType', () => {
    it('returns defined fallbacks for known types', () => {
      const fallbacks = getFallbacksForType('talk_to_npc');
      expect(fallbacks.length).toBeGreaterThan(0);
      expect(fallbacks[0].type).toBe('complete_conversation');
    });

    it('returns universal fallback for unknown types', () => {
      const fallbacks = getFallbacksForType('some_unknown_type');
      expect(fallbacks).toHaveLength(1);
      expect(fallbacks[0].type).toBe('complete_conversation');
    });

    it('returns fallbacks for all NPC-dependent types', () => {
      const npcTypes = ['talk_to_npc', 'listen_and_repeat', 'ask_for_directions', 'order_food',
        'haggle_price', 'introduce_self', 'build_friendship', 'give_gift', 'escort_npc',
        'deliver_item', 'listening_comprehension', 'teach_vocabulary', 'teach_phrase'];
      for (const type of npcTypes) {
        const fallbacks = getFallbacksForType(type);
        expect(fallbacks.length).toBeGreaterThan(0);
      }
    });

    it('returns fallbacks for location-dependent types', () => {
      for (const type of ['visit_location', 'discover_location', 'navigate_language']) {
        const fallbacks = getFallbacksForType(type);
        expect(fallbacks.length).toBeGreaterThan(0);
      }
    });

    it('returns fallbacks for item-dependent types', () => {
      for (const type of ['collect_item', 'craft_item', 'examine_object', 'read_sign', 'point_and_name', 'find_text', 'read_text', 'collect_text']) {
        const fallbacks = getFallbacksForType(type);
        expect(fallbacks.length).toBeGreaterThan(0);
      }
    });
  });

  describe('generateFallbackObjective', () => {
    it('generates a fallback with correct type and description', () => {
      const original = makeObjective({ id: 'obj-1', questId: 'quest-1', npcId: 'ghost' });
      const fallback = generateFallbackObjective(original, 'npc_missing', 'ghost');
      expect(fallback.id).toBe('obj-1');
      expect(fallback.questId).toBe('quest-1');
      expect(fallback.type).toBe('complete_conversation');
      expect(fallback.completed).toBe(false);
      expect(fallback.replacedObjectiveId).toBe('obj-1');
      expect(fallback.fallbackReason).toContain('ghost');
    });

    it('preserves order field', () => {
      const original = makeObjective({ order: 2 });
      const fallback = generateFallbackObjective(original, 'npc_missing');
      expect(fallback.order).toBe(2);
    });

    it('clears dependsOn when reason is dependency_unresolvable', () => {
      const original = makeObjective({ dependsOn: ['obj-0'] });
      const fallback = generateFallbackObjective(original, 'dependency_unresolvable');
      expect(fallback.dependsOn).toBeUndefined();
    });

    it('preserves dependsOn when reason is not dependency_unresolvable', () => {
      const original = makeObjective({ dependsOn: ['obj-0'] });
      const fallback = generateFallbackObjective(original, 'npc_missing', 'ghost');
      expect(fallback.dependsOn).toEqual(['obj-0']);
    });

    it('generates meaningful fallback reason for each reason type', () => {
      expect(generateFallbackObjective(makeObjective(), 'npc_missing', 'Bob').fallbackReason).toContain('Bob');
      expect(generateFallbackObjective(makeObjective(), 'location_unavailable', 'cave').fallbackReason).toContain('cave');
      expect(generateFallbackObjective(makeObjective(), 'item_unavailable', 'sword').fallbackReason).toContain('sword');
      expect(generateFallbackObjective(makeObjective(), 'dependency_unresolvable').fallbackReason).toContain('preceding objective');
    });
  });

  // ── Full pipeline ─────────────────────────────────────────────────────

  describe('applyObjectiveFallbacks', () => {
    it('returns unchanged objectives when all are completable', () => {
      const objectives = [
        makeObjective({ id: 'obj-1', npcId: 'baker' }),
        makeObjective({ id: 'obj-2', type: 'use_vocabulary', npcId: undefined }),
      ];
      const result = applyObjectiveFallbacks(objectives, makeWorldState());
      expect(result.applied).toHaveLength(0);
      expect(result.objectives).toEqual(objectives);
    });

    it('replaces uncompletable objectives with fallbacks', () => {
      const objectives = [
        makeObjective({ id: 'obj-1', npcId: 'ghost' }),
        makeObjective({ id: 'obj-2', type: 'use_vocabulary', npcId: undefined }),
      ];
      const result = applyObjectiveFallbacks(objectives, makeWorldState());
      expect(result.applied).toHaveLength(1);
      expect(result.applied[0].originalType).toBe('talk_to_npc');
      expect(result.applied[0].fallbackType).toBe('complete_conversation');
      expect(result.applied[0].reason).toBe('npc_missing');
      expect(result.objectives[0].type).toBe('complete_conversation');
      expect(result.objectives[1].type).toBe('use_vocabulary');
    });

    it('handles multiple fallbacks in one quest', () => {
      const objectives = [
        makeObjective({ id: 'obj-1', npcId: 'ghost' }),
        makeObjective({ id: 'obj-2', type: 'visit_location', npcId: undefined, locationName: 'dungeon' }),
        makeObjective({ id: 'obj-3', type: 'use_vocabulary', npcId: undefined }),
      ];
      const result = applyObjectiveFallbacks(objectives, makeWorldState());
      expect(result.applied).toHaveLength(2);
      expect(result.objectives[0].type).toBe('complete_conversation');
      expect(result.objectives[1].type).toBe('discover_location');
      expect(result.objectives[2].type).toBe('use_vocabulary');
    });

    it('does not replace completed objectives even if target is missing', () => {
      const objectives = [
        makeObjective({ id: 'obj-1', npcId: 'ghost', completed: true }),
      ];
      const result = applyObjectiveFallbacks(objectives, makeWorldState());
      expect(result.applied).toHaveLength(0);
      expect(result.objectives[0].type).toBe('talk_to_npc');
    });

    it('resolves broken dependency chains', () => {
      const objectives = [
        makeObjective({ id: 'obj-1', npcId: 'ghost' }),
        makeObjective({ id: 'obj-2', type: 'use_vocabulary', npcId: undefined, dependsOn: ['obj-1'] }),
      ];
      const result = applyObjectiveFallbacks(objectives, makeWorldState());
      expect(result.applied).toHaveLength(2);
      // The dependent objective should have its dependsOn cleared
      const dependentFallback = result.objectives[1];
      expect(dependentFallback.dependsOn).toBeUndefined();
    });

    it('returns applied log with correct details', () => {
      const objectives = [
        makeObjective({ id: 'obj-1', type: 'collect_item', npcId: undefined, itemName: 'sword' }),
      ];
      const result = applyObjectiveFallbacks(objectives, makeWorldState());
      expect(result.applied).toHaveLength(1);
      expect(result.applied[0]).toEqual({
        originalObjectiveId: 'obj-1',
        originalType: 'collect_item',
        fallbackType: 'collect_vocabulary',
        reason: 'item_unavailable',
        missingTarget: 'sword',
      });
    });
  });
});
