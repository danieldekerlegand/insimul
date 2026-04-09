/**
 * Quest Minimap Markers
 *
 * Derives minimap marker data from quest objective data. Each incomplete
 * objective with a known position produces a marker color-coded by
 * objective type.
 */

import type { Quest, QuestObjective } from '@shared/game-engine/system-contracts';

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
    case 'eavesdrop':
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

    // Language / education — blue
    case 'use_vocabulary':
    case 'pronunciation_check':
    case 'translation_challenge':
    case 'write_response':
    case 'describe_scene':
    case 'reading_completed':
    case 'listening_completed':
    case 'grammar_demonstrated':
    case 'answer_question':
      return '#2196F3';

    // Commercial / social — orange
    case 'order_food':
    case 'haggle_price':
    case 'gain_reputation':
      return '#FF9800';

    // Physical actions — amber
    case 'physical_action':
    case 'observe_activity':
    case 'farm_plant':
    case 'farm_water':
    case 'farm_harvest':
    case 'fish':
    case 'mine':
    case 'chop_tree':
    case 'gather_herb':
      return '#FFC107';

    // Combat — red
    case 'defeat_enemies':
      return '#F44336';

    // Crafting — teal
    case 'craft_item':
      return '#009688';

    // Escort — purple
    case 'escort_npc':
      return '#9C27B0';

    // Assessment phases — gold
    case 'complete_assessment':
    case 'arrival_reading':
    case 'arrival_writing':
    case 'arrival_listening':
    case 'arrival_initiate_conversation':
    case 'arrival_conversation':
    case 'departure_reading':
    case 'departure_writing':
    case 'departure_listening':
    case 'departure_conversation':
    case 'periodic_conversational':
      return '#FFD700';

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
 *   3. quest-level locationPosition
 *   4. dynamically resolved position (from DynamicQuestWaypointDirector)
 *
 * @param quests - All quests (only active quests with incomplete objectives produce markers)
 * @param resolvedPositions - Optional map of objectiveId → position from DynamicQuestWaypointDirector.
 *   Key format: `${questId}_${objectiveId}` matching the director's output.
 */
export function extractObjectiveMarkers(
  quests: Quest[],
  resolvedPositions?: Map<string, { x: number; z: number }>,
  /** Named locations that can be referenced by objective location atoms (e.g., notice_board → {x, z}) */
  namedLocations?: Map<string, { x: number; z: number }>,
): QuestObjectiveMarker[] {
  const markers: QuestObjectiveMarker[] = [];

  for (const quest of quests) {
    if (quest.status !== 'active') continue;
    if (!quest.objectives || quest.objectives.length === 0) continue;

    // Quest-level fallback position
    const questPos = (quest as any).locationPosition as { x: number; y?: number; z: number } | undefined;

    // Only show marker for the first incomplete objective (the current one)
    // This prevents cluttering the map with markers for future objectives
    let foundCurrent = false;
    for (let i = 0; i < quest.objectives.length; i++) {
      const obj = quest.objectives[i] as any;
      if (obj.completed) continue;
      if (foundCurrent) break; // only show one objective per quest
      foundCurrent = true;

      // Skip NPC-targeted objectives — these are shown via the NPC indicator system
      // to avoid duplicate markers on the same NPC
      const objLoc = obj.objectiveLocation || '';
      if (objLoc.startsWith('npc(') || objLoc === 'any_npc') continue;

      // Prefer objective-level position, fall back to quest-level, then dynamic resolution
      let pos = obj.locationPosition ?? obj.position ?? questPos;

      if (!pos && resolvedPositions) {
        const markerId = `${quest.id}_obj_${i}`;
        const dynPos = resolvedPositions.get(markerId);
        if (dynPos) {
          pos = { x: dynPos.x, y: 0, z: dynPos.z } as any;
        }
      }

      // Resolve named location atoms (e.g., notice_board, any_npc, settlement)
      // Also handles Prolog terms: location('Name'), npc('Name'), merchant('Name')
      if (!pos && namedLocations && obj.objectiveLocation) {
        let locKey = obj.objectiveLocation;
        // Extract name from Prolog term wrappers: location('Name') → Name
        const termMatch = locKey.match(/^(?:location|npc|merchant|settlement)\(\s*'?([^')]+)'?\s*\)$/);
        if (termMatch) locKey = termMatch[1];
        const namedPos = namedLocations.get(locKey);
        if (namedPos) {
          pos = { x: namedPos.x, y: 0, z: namedPos.z } as any;
        }
      }

      if (!pos) continue;

      markers.push({
        id: `${quest.id}_obj_${i}`,
        questId: quest.id,
        questTitle: (quest as any).title || (quest as any).name || quest.id,
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
