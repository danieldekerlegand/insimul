/**
 * Quest Minimap Markers
 *
 * Derives minimap marker data from quest objective data. Each incomplete
 * objective with a known position produces a marker color-coded by
 * objective type.
 */

import type { Quest, QuestObjective } from './BabylonQuestTracker';

// ── Objective-type color categories ─────────────────────────────────────────

/** Color mapping for objective types on the minimap/fullscreen map. */
export function getObjectiveMarkerColor(objectiveType: string): string {
  switch (objectiveType) {
    // Location / exploration — cyan
    case 'visit_location':
    case 'discover_location':
    case 'navigate_language':
    case 'follow_directions':
      return '#00BCD4';

    // NPC interaction — green
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

    // Item collection — gold
    case 'collect_item':
    case 'deliver_item':
    case 'identify_object':
    case 'collect_vocabulary':
    case 'examine_object':
    case 'read_sign':
    case 'point_and_name':
      return '#FFD700';

    // Commercial / social — orange
    case 'order_food':
    case 'haggle_price':
    case 'gain_reputation':
      return '#FF9800';

    // Combat — red
    case 'defeat_enemies':
      return '#F44336';

    // Crafting — teal
    case 'craft_item':
      return '#009688';

    // Escort — purple
    case 'escort_npc':
      return '#9C27B0';

    // Default — magenta (legacy quest marker color)
    default:
      return '#E040FB';
  }
}

/** Shape hint for rendering: 'diamond' for location, 'circle' for others. */
export type MarkerShape = 'diamond' | 'circle';

export function getObjectiveMarkerShape(objectiveType: string): MarkerShape {
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

// ── Marker extraction ───────────────────────────────────────────────────────

export interface QuestObjectiveMarker {
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
 * Extract minimap markers from all active quests' incomplete objectives.
 * Every incomplete objective produces a marker. Position resolution order:
 *   1. objective.locationPosition
 *   2. objective.position
 *   3. quest-level locationPosition (fallback so every objective gets a marker)
 */
export function extractObjectiveMarkers(quests: Quest[]): QuestObjectiveMarker[] {
  const markers: QuestObjectiveMarker[] = [];

  for (const quest of quests) {
    if (quest.status !== 'active') continue;
    if (!quest.objectives || quest.objectives.length === 0) continue;

    // Quest-level fallback position
    const questPos = (quest as any).locationPosition as { x: number; y?: number; z: number } | undefined;

    for (let i = 0; i < quest.objectives.length; i++) {
      const obj = quest.objectives[i];
      if (obj.completed) continue;

      // Prefer objective-level position, fall back to quest-level position
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
