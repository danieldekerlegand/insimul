/**
 * Tests for quest objective minimap marker fallback logic.
 *
 * Verifies that extractObjectiveMarkers() uses quest-level locationPosition
 * as a fallback when individual objectives lack their own position data,
 * ensuring every incomplete objective produces a minimap marker.
 */

import { describe, it, expect } from 'vitest';

// ── Re-implement extraction logic (pure data, no Babylon deps) ──────────────

function getObjectiveMarkerColor(objectiveType: string): string {
  switch (objectiveType) {
    case 'visit_location':
    case 'discover_location':
    case 'navigate_language':
    case 'follow_directions':
      return '#00BCD4';
    case 'talk_to_npc':
    case 'complete_conversation':
    case 'conversation_initiation':
    case 'build_friendship':
    case 'give_gift':
    case 'listen_and_repeat':
    case 'ask_for_directions':
    case 'listening_comprehension':
    case 'introduce_self':
    case 'teach_vocabulary':
    case 'teach_phrase':
      return '#4CAF50';
    case 'collect_item':
    case 'deliver_item':
    case 'identify_object':
    case 'collect_vocabulary':
    case 'examine_object':
    case 'read_sign':
    case 'point_and_name':
      return '#FFD700';
    case 'order_food':
    case 'haggle_price':
    case 'gain_reputation':
      return '#FF9800';
    case 'defeat_enemies':
      return '#F44336';
    case 'craft_item':
      return '#009688';
    case 'escort_npc':
      return '#9C27B0';
    default:
      return '#E040FB';
  }
}

type MarkerShape = 'diamond' | 'circle';

function getObjectiveMarkerShape(objectiveType: string): MarkerShape {
  switch (objectiveType) {
    case 'visit_location':
    case 'discover_location':
    case 'navigate_language':
    case 'follow_directions':
      return 'diamond';
    default:
      return 'circle';
  }
}

interface QuestObjective {
  type: string;
  description: string;
  completed: boolean;
  current?: number;
  required?: number;
  position?: { x: number; y: number; z: number };
  locationPosition?: { x: number; y: number; z: number };
  locationName?: string;
}

interface Quest {
  id: string;
  title: string;
  status: string;
  objectives?: QuestObjective[];
  locationPosition?: { x: number; y: number; z: number };
  [key: string]: any;
}

interface QuestObjectiveMarker {
  id: string;
  questId: string;
  questTitle: string;
  objectiveType: string;
  objectiveDescription: string;
  position: { x: number; z: number };
  color: string;
  shape: MarkerShape;
}

/**
 * Mirrors the updated extractObjectiveMarkers from QuestMinimapMarkers.ts
 * with the quest-level fallback position logic.
 */
function extractObjectiveMarkers(quests: Quest[]): QuestObjectiveMarker[] {
  const markers: QuestObjectiveMarker[] = [];

  for (const quest of quests) {
    if (quest.status !== 'active') continue;
    if (!quest.objectives || quest.objectives.length === 0) continue;

    const questPos = quest.locationPosition;

    for (let i = 0; i < quest.objectives.length; i++) {
      const obj = quest.objectives[i];
      if (obj.completed) continue;

      const pos = obj.locationPosition ?? obj.position ?? questPos;
      if (!pos) continue;

      markers.push({
        id: `${quest.id}_obj_${i}`,
        questId: quest.id,
        questTitle: quest.title,
        objectiveType: obj.type,
        objectiveDescription: obj.description,
        position: { x: pos.x, z: pos.z },
        color: getObjectiveMarkerColor(obj.type),
        shape: getObjectiveMarkerShape(obj.type),
      });
    }
  }

  return markers;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('extractObjectiveMarkers — quest-level fallback', () => {
  it('uses quest-level locationPosition when objective has no position', () => {
    const quests: Quest[] = [{
      id: 'q1', title: 'Talk Quest', status: 'active',
      locationPosition: { x: 50, y: 0, z: 75 },
      objectives: [{
        type: 'talk_to_npc', description: 'Talk to Bob',
        completed: false,
        // No locationPosition or position on objective
      }],
    }];
    const markers = extractObjectiveMarkers(quests);
    expect(markers).toHaveLength(1);
    expect(markers[0].position).toEqual({ x: 50, z: 75 });
    expect(markers[0].color).toBe('#4CAF50');
  });

  it('prefers objective locationPosition over quest-level fallback', () => {
    const quests: Quest[] = [{
      id: 'q1', title: 'Mixed Quest', status: 'active',
      locationPosition: { x: 50, y: 0, z: 75 },
      objectives: [{
        type: 'visit_location', description: 'Visit market',
        completed: false,
        locationPosition: { x: 100, y: 5, z: 200 },
      }],
    }];
    const markers = extractObjectiveMarkers(quests);
    expect(markers).toHaveLength(1);
    expect(markers[0].position).toEqual({ x: 100, z: 200 });
  });

  it('prefers objective position over quest-level fallback', () => {
    const quests: Quest[] = [{
      id: 'q1', title: 'Item Quest', status: 'active',
      locationPosition: { x: 50, y: 0, z: 75 },
      objectives: [{
        type: 'collect_item', description: 'Pick up gem',
        completed: false,
        position: { x: 30, y: 0, z: 40 },
      }],
    }];
    const markers = extractObjectiveMarkers(quests);
    expect(markers).toHaveLength(1);
    expect(markers[0].position).toEqual({ x: 30, z: 40 });
  });

  it('all incomplete objectives get markers when quest has locationPosition', () => {
    const quests: Quest[] = [{
      id: 'q1', title: 'Multi Step', status: 'active',
      locationPosition: { x: 10, y: 0, z: 20 },
      objectives: [
        { type: 'talk_to_npc', description: 'Talk', completed: false },
        { type: 'use_vocabulary', description: 'Use words', completed: false },
        { type: 'collect_item', description: 'Collect', completed: true },
      ],
    }];
    const markers = extractObjectiveMarkers(quests);
    expect(markers).toHaveLength(2);
    expect(markers[0].objectiveType).toBe('talk_to_npc');
    expect(markers[1].objectiveType).toBe('use_vocabulary');
    // Both use the quest-level fallback
    expect(markers[0].position).toEqual({ x: 10, z: 20 });
    expect(markers[1].position).toEqual({ x: 10, z: 20 });
  });

  it('no markers when quest has no position at any level', () => {
    const quests: Quest[] = [{
      id: 'q1', title: 'No Position', status: 'active',
      objectives: [{
        type: 'pronunciation_check', description: 'Pronounce words',
        completed: false,
      }],
    }];
    const markers = extractObjectiveMarkers(quests);
    expect(markers).toHaveLength(0);
  });

  it('mixed: some objectives have own position, some use fallback', () => {
    const quests: Quest[] = [{
      id: 'q1', title: 'Composite', status: 'active',
      locationPosition: { x: 5, y: 0, z: 10 },
      objectives: [
        { type: 'visit_location', description: 'Visit market', completed: false,
          locationPosition: { x: 100, y: 0, z: 200 } },
        { type: 'talk_to_npc', description: 'Talk to merchant', completed: false },
        { type: 'collect_vocabulary', description: 'Learn words', completed: false },
      ],
    }];
    const markers = extractObjectiveMarkers(quests);
    expect(markers).toHaveLength(3);
    expect(markers[0].position).toEqual({ x: 100, z: 200 }); // own position
    expect(markers[1].position).toEqual({ x: 5, z: 10 }); // fallback
    expect(markers[2].position).toEqual({ x: 5, z: 10 }); // fallback
  });
});
