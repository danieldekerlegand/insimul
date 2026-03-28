/**
 * Quest Completability Validator
 *
 * Cross-validates that every canonical objective type defined in
 * quest-objective-types.ts has:
 * 1. An action mapping in quest-feasibility-validator.ts (can the world support it?)
 * 2. A completion handler in QuestCompletionEngine.ts (can the game detect it?)
 *
 * This module is used at build/test time to catch gaps where a new objective
 * type is added but the supporting infrastructure is missing.
 */

import { ACHIEVABLE_OBJECTIVE_TYPES, VALID_OBJECTIVE_TYPES } from './quest-objective-types';

// ── Types ───────────────────────────────────────────────────────────────────

export interface CompletabilityIssue {
  objectiveType: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface CompletabilityReport {
  valid: boolean;
  issues: CompletabilityIssue[];
  coveredTypes: string[];
  totalTypes: number;
}

// ── Completion handler registry ─────────────────────────────────────────────
// Maps each canonical objective type to the CompletionEvent type(s) that can
// advance it. This is the single source of truth for "which events complete
// which objectives" and must stay in sync with QuestCompletionEngine.trackEvent.

export const OBJECTIVE_COMPLETION_EVENT_MAP: Record<string, string[]> = {
  visit_location: ['location_visit'],
  discover_location: ['location_discovery'],
  talk_to_npc: ['npc_conversation'],
  complete_conversation: ['conversation_turn'],
  conversation_initiation: ['conversation_initiation'],
  use_vocabulary: ['vocabulary_usage'],
  collect_vocabulary: ['vocabulary_usage'],
  collect_text: ['text_collected'],
  identify_object: ['object_identified'],
  collect_item: ['collect_item_by_name', 'inventory_check'],
  deliver_item: ['item_delivery', 'arrival'],
  defeat_enemies: ['enemy_defeat'],
  craft_item: ['item_crafted'],
  escort_npc: ['arrival'],
  build_friendship: ['npc_conversation_turn'],
  give_gift: ['gift_given'],
  gain_reputation: ['reputation_gain'],
  listening_comprehension: ['listening_answer'],
  translation_challenge: ['translation_attempt'],
  navigate_language: ['navigation_waypoint'],
  follow_directions: ['direction_step_completed'],
  pronunciation_check: ['pronunciation_attempt'],
  examine_object: ['object_examined'],
  read_sign: ['sign_read'],
  write_response: ['writing_submitted'],
  listen_and_repeat: ['pronunciation_attempt'],
  point_and_name: ['object_pointed_and_named'],
  ask_for_directions: ['npc_conversation_turn'],
  order_food: ['npc_conversation_turn'],
  haggle_price: ['npc_conversation_turn'],
  introduce_self: ['npc_conversation_turn'],
  describe_scene: ['writing_submitted'],
  teach_vocabulary: ['teach_word'],
  teach_phrase: ['teach_phrase_to_npc'],
};

// ── Validator ───────────────────────────────────────────────────────────────

/**
 * Validate that every canonical objective type has both an action mapping
 * and a completion handler. Pass in the action map keys from the feasibility
 * validator to check coverage.
 */
export function validateCompletability(
  actionMapTypes: string[],
): CompletabilityReport {
  const issues: CompletabilityIssue[] = [];
  const coveredTypes: string[] = [];
  const actionMapSet = new Set(actionMapTypes);

  for (const typeInfo of ACHIEVABLE_OBJECTIVE_TYPES) {
    const t = typeInfo.type;
    let hasBothMappings = true;

    // Check action mapping
    if (!actionMapSet.has(t)) {
      issues.push({
        objectiveType: t,
        severity: 'error',
        message: `Objective type "${t}" has no action mapping in OBJECTIVE_ACTION_MAP — feasibility validator cannot check it`,
      });
      hasBothMappings = false;
    }

    // Check completion handler
    if (!OBJECTIVE_COMPLETION_EVENT_MAP[t]) {
      issues.push({
        objectiveType: t,
        severity: 'error',
        message: `Objective type "${t}" has no completion event mapping — QuestCompletionEngine cannot track it`,
      });
      hasBothMappings = false;
    }

    if (hasBothMappings) {
      coveredTypes.push(t);
    }
  }

  // Check for stale entries in completion map that reference non-existent types
  for (const t of Object.keys(OBJECTIVE_COMPLETION_EVENT_MAP)) {
    if (!VALID_OBJECTIVE_TYPES.has(t)) {
      issues.push({
        objectiveType: t,
        severity: 'warning',
        message: `Completion event mapping exists for "${t}" but it is not a canonical objective type`,
      });
    }
  }

  // Check for stale entries in action map
  for (const t of actionMapTypes) {
    if (!VALID_OBJECTIVE_TYPES.has(t)) {
      issues.push({
        objectiveType: t,
        severity: 'warning',
        message: `Action mapping exists for "${t}" but it is not a canonical objective type`,
      });
    }
  }

  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    coveredTypes,
    totalTypes: ACHIEVABLE_OBJECTIVE_TYPES.length,
  };
}
