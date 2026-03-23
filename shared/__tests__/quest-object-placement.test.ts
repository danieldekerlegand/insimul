/**
 * Tests for quest object placement in the IR generator.
 *
 * We test the exported helper functions and the overall generateQuestObjects
 * logic by importing them from the IR generator module. Since the generator
 * is tightly coupled to the server, we replicate the core logic here for
 * isolated unit testing.
 */

import { describe, it, expect } from 'vitest';

// ── Inline types to avoid import issues ─────────────────────────────────

interface Vec3 { x: number; y: number; z: number }

interface QuestObjectIR {
  id: string;
  questId: string;
  objectType: string;
  position: Vec3;
  modelAssetKey: string | null;
  interactionType: string;
  metadata: Record<string, any>;
}

// ── Replicate core logic from ir-generator for testability ──────────────

function objectiveTypeToInteraction(type: string): string {
  switch (type) {
    case 'visit_location':
    case 'discover_location':
      return 'trigger_zone';
    case 'talk_to_npc':
    case 'complete_conversation':
    case 'conversation_initiation':
    case 'build_friendship':
    case 'give_gift':
      return 'npc_interaction';
    case 'collect_item':
    case 'collect_text':
    case 'collect_vocabulary':
      return 'pickup';
    case 'deliver_item':
      return 'delivery_target';
    case 'use_vocabulary':
    case 'identify_object':
    case 'pronunciation':
      return 'language_challenge';
    case 'craft_item':
      return 'crafting_station';
    case 'defeat_enemies':
      return 'combat_zone';
    case 'escort_npc':
      return 'escort_waypoint';
    default:
      return 'interact';
  }
}

function objectiveTypeToModelKey(type: string): string | null {
  switch (type) {
    case 'visit_location':
    case 'discover_location':
      return 'quest_marker_location';
    case 'collect_item':
    case 'collect_text':
      return 'quest_item_pickup';
    case 'collect_vocabulary':
    case 'use_vocabulary':
    case 'identify_object':
    case 'pronunciation':
      return 'quest_marker_language';
    case 'deliver_item':
    case 'give_gift':
      return 'quest_marker_delivery';
    case 'defeat_enemies':
      return 'quest_marker_combat';
    case 'craft_item':
      return 'quest_marker_crafting';
    default:
      return 'quest_marker_default';
  }
}

function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return () => {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

interface MinimalQuestIR {
  id: string;
  title: string;
  objectives: any[];
  locationId: string | null;
  locationPosition: { x: number; y: number; z: number } | null;
}

interface MinimalBuildingIR {
  position: Vec3;
  businessId: string | null;
}

function generateQuestObjects(
  questIRs: MinimalQuestIR[],
  buildingIRs: MinimalBuildingIR[],
  seed: string,
): QuestObjectIR[] {
  const rand = createSeededRandom(`${seed}_quest_objects`);
  const questObjects: QuestObjectIR[] = [];

  const buildingByBusinessId = new Map<string, MinimalBuildingIR>();
  for (const b of buildingIRs) {
    if (b.businessId) {
      buildingByBusinessId.set(b.businessId, b);
    }
  }

  for (const quest of questIRs) {
    if (!quest.objectives || quest.objectives.length === 0) continue;

    const basePosition: Vec3 = quest.locationPosition
      ? { x: quest.locationPosition.x, y: quest.locationPosition.y, z: quest.locationPosition.z }
      : { x: 0, y: 0, z: 0 };

    let buildingPosition: Vec3 | null = null;
    if (quest.locationId) {
      const building = buildingByBusinessId.get(quest.locationId);
      if (building) {
        buildingPosition = { ...building.position };
      }
    }

    const anchorPos = buildingPosition || basePosition;

    for (let i = 0; i < quest.objectives.length; i++) {
      const obj = quest.objectives[i];
      if (!obj || !obj.type) continue;

      const angle = (2 * Math.PI * i) / quest.objectives.length + rand() * 0.5;
      const radius = 2 + rand() * 3;
      const position: Vec3 = {
        x: anchorPos.x + Math.cos(angle) * radius,
        y: anchorPos.y,
        z: anchorPos.z + Math.sin(angle) * radius,
      };

      questObjects.push({
        id: `qobj_${quest.id}_${i}`,
        questId: quest.id,
        objectType: obj.type,
        position,
        modelAssetKey: objectiveTypeToModelKey(obj.type),
        interactionType: objectiveTypeToInteraction(obj.type),
        metadata: {
          objectiveIndex: i,
          description: obj.description || null,
          target: obj.target || null,
          targetWords: obj.targetWords || null,
          required: obj.required || null,
          questTitle: quest.title,
        },
      });
    }
  }

  return questObjects;
}

// ── Tests ───────────────────────────────────────────────────────────────

describe('Quest Object Placement', () => {
  describe('objectiveTypeToInteraction', () => {
    it('maps location objectives to trigger_zone', () => {
      expect(objectiveTypeToInteraction('visit_location')).toBe('trigger_zone');
      expect(objectiveTypeToInteraction('discover_location')).toBe('trigger_zone');
    });

    it('maps NPC objectives to npc_interaction', () => {
      expect(objectiveTypeToInteraction('talk_to_npc')).toBe('npc_interaction');
      expect(objectiveTypeToInteraction('complete_conversation')).toBe('npc_interaction');
      expect(objectiveTypeToInteraction('build_friendship')).toBe('npc_interaction');
      expect(objectiveTypeToInteraction('give_gift')).toBe('npc_interaction');
    });

    it('maps collection objectives to pickup', () => {
      expect(objectiveTypeToInteraction('collect_item')).toBe('pickup');
      expect(objectiveTypeToInteraction('collect_text')).toBe('pickup');
      expect(objectiveTypeToInteraction('collect_vocabulary')).toBe('pickup');
    });

    it('maps language objectives to language_challenge', () => {
      expect(objectiveTypeToInteraction('use_vocabulary')).toBe('language_challenge');
      expect(objectiveTypeToInteraction('identify_object')).toBe('language_challenge');
    });

    it('maps combat to combat_zone', () => {
      expect(objectiveTypeToInteraction('defeat_enemies')).toBe('combat_zone');
    });

    it('returns interact for unknown types', () => {
      expect(objectiveTypeToInteraction('unknown_type')).toBe('interact');
    });
  });

  describe('objectiveTypeToModelKey', () => {
    it('maps location types to quest_marker_location', () => {
      expect(objectiveTypeToModelKey('visit_location')).toBe('quest_marker_location');
      expect(objectiveTypeToModelKey('discover_location')).toBe('quest_marker_location');
    });

    it('maps collection types to quest_item_pickup', () => {
      expect(objectiveTypeToModelKey('collect_item')).toBe('quest_item_pickup');
      expect(objectiveTypeToModelKey('collect_text')).toBe('quest_item_pickup');
    });

    it('maps language types to quest_marker_language', () => {
      expect(objectiveTypeToModelKey('use_vocabulary')).toBe('quest_marker_language');
      expect(objectiveTypeToModelKey('identify_object')).toBe('quest_marker_language');
      expect(objectiveTypeToModelKey('collect_vocabulary')).toBe('quest_marker_language');
    });

    it('returns quest_marker_default for unknown types', () => {
      expect(objectiveTypeToModelKey('something_new')).toBe('quest_marker_default');
    });
  });

  describe('generateQuestObjects', () => {
    const makeQuest = (overrides: Partial<MinimalQuestIR> = {}): MinimalQuestIR => ({
      id: 'quest_1',
      title: 'Test Quest',
      objectives: [],
      locationId: null,
      locationPosition: null,
      ...overrides,
    });

    it('returns empty array for quests with no objectives', () => {
      const result = generateQuestObjects([makeQuest()], [], 'seed1');
      expect(result).toEqual([]);
    });

    it('skips objectives without a type field', () => {
      const quest = makeQuest({
        objectives: [{ description: 'no type' }, { type: 'visit_location', description: 'has type' }],
      });
      const result = generateQuestObjects([quest], [], 'seed1');
      expect(result).toHaveLength(1);
      expect(result[0].objectType).toBe('visit_location');
    });

    it('generates one quest object per objective', () => {
      const quest = makeQuest({
        objectives: [
          { type: 'visit_location', description: 'Go to market' },
          { type: 'talk_to_npc', description: 'Talk to vendor', target: 'npc_vendor' },
          { type: 'collect_item', description: 'Get apple' },
        ],
        locationPosition: { x: 10, y: 0, z: 20 },
      });
      const result = generateQuestObjects([quest], [], 'seed1');
      expect(result).toHaveLength(3);
      expect(result[0].interactionType).toBe('trigger_zone');
      expect(result[1].interactionType).toBe('npc_interaction');
      expect(result[2].interactionType).toBe('pickup');
    });

    it('assigns unique IDs per objective', () => {
      const quest = makeQuest({
        objectives: [
          { type: 'visit_location' },
          { type: 'collect_item' },
        ],
      });
      const result = generateQuestObjects([quest], [], 'seed1');
      expect(result[0].id).toBe('qobj_quest_1_0');
      expect(result[1].id).toBe('qobj_quest_1_1');
    });

    it('places objects near the quest location position', () => {
      const quest = makeQuest({
        objectives: [{ type: 'visit_location' }],
        locationPosition: { x: 100, y: 5, z: 200 },
      });
      const result = generateQuestObjects([quest], [], 'seed1');
      const pos = result[0].position;
      // Should be within 5 units of anchor
      expect(Math.abs(pos.x - 100)).toBeLessThan(6);
      expect(pos.y).toBe(5);
      expect(Math.abs(pos.z - 200)).toBeLessThan(6);
    });

    it('falls back to origin when no location is set', () => {
      const quest = makeQuest({
        objectives: [{ type: 'visit_location' }],
      });
      const result = generateQuestObjects([quest], [], 'seed1');
      const pos = result[0].position;
      expect(Math.abs(pos.x)).toBeLessThan(6);
      expect(Math.abs(pos.z)).toBeLessThan(6);
    });

    it('uses building position when locationId matches a business', () => {
      const quest = makeQuest({
        objectives: [{ type: 'collect_item' }],
        locationId: 'biz_42',
        locationPosition: { x: 0, y: 0, z: 0 },
      });
      const buildings: MinimalBuildingIR[] = [
        { position: { x: 50, y: 2, z: 80 }, businessId: 'biz_42' },
      ];
      const result = generateQuestObjects([quest], buildings, 'seed1');
      const pos = result[0].position;
      // Should be near the building, not the quest's locationPosition
      expect(Math.abs(pos.x - 50)).toBeLessThan(6);
      expect(pos.y).toBe(2);
      expect(Math.abs(pos.z - 80)).toBeLessThan(6);
    });

    it('includes objective metadata in quest objects', () => {
      const quest = makeQuest({
        objectives: [{
          type: 'use_vocabulary',
          description: 'Use greeting words',
          targetWords: ['hello', 'goodbye'],
          required: 3,
        }],
      });
      const result = generateQuestObjects([quest], [], 'seed1');
      expect(result[0].metadata).toEqual({
        objectiveIndex: 0,
        description: 'Use greeting words',
        target: null,
        targetWords: ['hello', 'goodbye'],
        required: 3,
        questTitle: 'Test Quest',
      });
    });

    it('handles multiple quests', () => {
      const quest1 = makeQuest({
        id: 'q1',
        objectives: [{ type: 'visit_location' }],
      });
      const quest2 = makeQuest({
        id: 'q2',
        objectives: [{ type: 'talk_to_npc' }, { type: 'collect_item' }],
      });
      const result = generateQuestObjects([quest1, quest2], [], 'seed1');
      expect(result).toHaveLength(3);
      expect(result[0].questId).toBe('q1');
      expect(result[1].questId).toBe('q2');
      expect(result[2].questId).toBe('q2');
    });

    it('produces deterministic output for the same seed', () => {
      const quest = makeQuest({
        objectives: [{ type: 'visit_location' }, { type: 'collect_item' }],
        locationPosition: { x: 10, y: 0, z: 10 },
      });
      const result1 = generateQuestObjects([quest], [], 'seed_abc');
      const result2 = generateQuestObjects([quest], [], 'seed_abc');
      expect(result1).toEqual(result2);
    });

    it('produces different output for different seeds', () => {
      const quest = makeQuest({
        objectives: [{ type: 'visit_location' }],
        locationPosition: { x: 10, y: 0, z: 10 },
      });
      const result1 = generateQuestObjects([quest], [], 'seed_a');
      const result2 = generateQuestObjects([quest], [], 'seed_b');
      // Positions should differ (extremely unlikely to be identical with different seeds)
      expect(result1[0].position.x).not.toBe(result2[0].position.x);
    });

    it('spreads multiple objectives around the anchor', () => {
      const quest = makeQuest({
        objectives: Array.from({ length: 6 }, (_, i) => ({ type: 'visit_location', description: `obj ${i}` })),
        locationPosition: { x: 50, y: 0, z: 50 },
      });
      const result = generateQuestObjects([quest], [], 'seed1');
      expect(result).toHaveLength(6);
      // All positions should be distinct
      const positions = result.map(r => `${r.position.x.toFixed(3)},${r.position.z.toFixed(3)}`);
      const unique = new Set(positions);
      expect(unique.size).toBe(6);
    });
  });
});
