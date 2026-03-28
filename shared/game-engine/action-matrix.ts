/**
 * Action Matrix
 *
 * Comprehensive mapping of every base action to its game implementation status,
 * GameEventBus event type, quest objective type, interaction mode, and category.
 *
 * This is the single source of truth for how actions connect across:
 *   - Prolog definitions (88 base Ensemble actions)
 *   - GameEventBus events
 *   - Quest objective types
 *   - In-game execution code
 */

import type { GameEventType } from './logic/GameEventBus';

// ── Types ────────────────────────────────────────────────────────────────────

/** How the player triggers this action in-game. */
export type ActionInteractionMode =
  | 'physical'         // Requires player to press a key near a target (buy_item, chop_tree, fish)
  | 'conversational'   // Detected from dialogue (ask_for_directions, compliment_npc)
  | 'observational'    // Detected from watching/listening (eavesdrop, observe_activity)
  | 'automatic'        // Triggered by game state (sleep, rest, travel_to_location)
  | 'inventory';       // Triggered from inventory UI (equip_item, consume, drop_item)

/** Whether the action has in-game execution code. */
export type ActionImplementationStatus =
  | 'implemented'      // Full implementation with game code
  | 'partial'          // Prolog definition exists, limited or no game code
  | 'missing';         // Not defined anywhere

/** Priority level for missing action implementation. */
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';

export interface ActionMatrixEntry {
  /** The canonical action name (matches Prolog action atom). */
  actionId: string;
  /** Human-readable display name. */
  displayName: string;
  /** Action category (social, combat, items, exploration, language, etc.). */
  category: string;
  /** How the player triggers this action. */
  interactionMode: ActionInteractionMode;
  /** GameEventBus event types this action emits or should emit. */
  eventTypes: GameEventType[];
  /** Quest objective types this action can satisfy. */
  objectiveTypes: string[];
  /** Implementation status. */
  status: ActionImplementationStatus;
  /** Priority for implementation if missing/partial. */
  priority?: ActionPriority;
  /** Whether this action requires a specific target. */
  requiresTarget: boolean;
  /** Target type if required. */
  targetType?: 'npc' | 'item' | 'location' | 'object' | 'container' | 'building';
}

// ── Action Matrix ────────────────────────────────────────────────────────────

export const ACTION_MATRIX: ActionMatrixEntry[] = [
  // ─── PHYSICAL ACTIONS (requires player to press a key near a target) ────────

  {
    actionId: 'buy_item',
    displayName: 'Buy Item',
    category: 'commerce',
    interactionMode: 'physical',
    eventTypes: ['item_purchased'],
    objectiveTypes: ['collect_item'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'sell_item',
    displayName: 'Sell Item',
    category: 'commerce',
    interactionMode: 'physical',
    eventTypes: ['item_purchased'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'give_gift',
    displayName: 'Give Gift',
    category: 'social',
    interactionMode: 'physical',
    eventTypes: ['gift_given'],
    objectiveTypes: ['give_gift', 'deliver_item'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'fish',
    displayName: 'Fish',
    category: 'resource',
    interactionMode: 'physical',
    eventTypes: ['physical_action_completed'],
    objectiveTypes: ['physical_action'],
    status: 'implemented',
    requiresTarget: false,
  },
  {
    actionId: 'mine_rock',
    displayName: 'Mine Rock',
    category: 'resource',
    interactionMode: 'physical',
    eventTypes: ['physical_action_completed'],
    objectiveTypes: ['physical_action'],
    status: 'implemented',
    requiresTarget: false,
  },
  {
    actionId: 'chop_tree',
    displayName: 'Chop Tree',
    category: 'resource',
    interactionMode: 'physical',
    eventTypes: ['physical_action_completed'],
    objectiveTypes: ['physical_action'],
    status: 'partial',
    priority: 'high',
    requiresTarget: true,
    targetType: 'object',
  },
  {
    actionId: 'gather_herb',
    displayName: 'Gather Herb',
    category: 'resource',
    interactionMode: 'physical',
    eventTypes: ['physical_action_completed'],
    objectiveTypes: ['physical_action', 'collect_item'],
    status: 'implemented',
    requiresTarget: false,
  },
  {
    actionId: 'cook',
    displayName: 'Cook',
    category: 'resource',
    interactionMode: 'physical',
    eventTypes: ['physical_action_completed', 'item_crafted'],
    objectiveTypes: ['craft_item', 'physical_action'],
    status: 'implemented',
    requiresTarget: false,
  },
  {
    actionId: 'craft_item',
    displayName: 'Craft Item',
    category: 'resource',
    interactionMode: 'physical',
    eventTypes: ['item_crafted'],
    objectiveTypes: ['craft_item'],
    status: 'partial',
    priority: 'high',
    requiresTarget: false,
  },
  {
    actionId: 'farm_plant',
    displayName: 'Plant Crops',
    category: 'resource',
    interactionMode: 'physical',
    eventTypes: ['physical_action_completed'],
    objectiveTypes: ['physical_action'],
    status: 'partial',
    priority: 'high',
    requiresTarget: true,
    targetType: 'object',
  },
  {
    actionId: 'farm_water',
    displayName: 'Water Crops',
    category: 'resource',
    interactionMode: 'physical',
    eventTypes: ['physical_action_completed'],
    objectiveTypes: ['physical_action'],
    status: 'partial',
    priority: 'high',
    requiresTarget: true,
    targetType: 'object',
  },
  {
    actionId: 'farm_harvest',
    displayName: 'Harvest Crops',
    category: 'resource',
    interactionMode: 'physical',
    eventTypes: ['physical_action_completed', 'item_collected'],
    objectiveTypes: ['physical_action', 'collect_item'],
    status: 'partial',
    priority: 'high',
    requiresTarget: true,
    targetType: 'object',
  },
  {
    actionId: 'open_container',
    displayName: 'Open Container',
    category: 'exploration',
    interactionMode: 'physical',
    eventTypes: ['container_opened'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'container',
  },
  {
    actionId: 'take_photo',
    displayName: 'Take Photo',
    category: 'exploration',
    interactionMode: 'physical',
    eventTypes: ['photo_taken'],
    objectiveTypes: ['photograph_subject', 'photograph_activity'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'object',
  },
  {
    actionId: 'read_sign',
    displayName: 'Read Sign',
    category: 'language',
    interactionMode: 'physical',
    eventTypes: ['sign_read'],
    objectiveTypes: ['read_sign'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'object',
  },
  {
    actionId: 'examine_object',
    displayName: 'Examine Object',
    category: 'language',
    interactionMode: 'physical',
    eventTypes: ['object_examined'],
    objectiveTypes: ['examine_object', 'collect_vocabulary'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'object',
  },
  {
    actionId: 'point_and_name',
    displayName: 'Point and Name',
    category: 'language',
    interactionMode: 'physical',
    eventTypes: ['object_named'],
    objectiveTypes: ['point_and_name', 'identify_object'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'object',
  },
  {
    actionId: 'enter_building',
    displayName: 'Enter Building',
    category: 'exploration',
    interactionMode: 'physical',
    eventTypes: ['location_visited'],
    objectiveTypes: ['visit_location'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'building',
  },
  {
    actionId: 'attack_enemy',
    displayName: 'Attack Enemy',
    category: 'combat',
    interactionMode: 'physical',
    eventTypes: ['combat_action', 'enemy_defeated'],
    objectiveTypes: ['defeat_enemies'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'steal',
    displayName: 'Steal',
    category: 'social',
    interactionMode: 'physical',
    eventTypes: ['item_collected'],
    objectiveTypes: ['collect_item'],
    status: 'partial',
    priority: 'low',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'paint',
    displayName: 'Paint',
    category: 'resource',
    interactionMode: 'physical',
    eventTypes: ['physical_action_completed'],
    objectiveTypes: ['physical_action'],
    status: 'implemented',
    requiresTarget: false,
  },
  {
    actionId: 'sweep',
    displayName: 'Sweep',
    category: 'resource',
    interactionMode: 'physical',
    eventTypes: ['physical_action_completed'],
    objectiveTypes: ['physical_action'],
    status: 'implemented',
    requiresTarget: false,
  },
  {
    actionId: 'pray',
    displayName: 'Pray',
    category: 'social',
    interactionMode: 'physical',
    eventTypes: ['physical_action_completed'],
    objectiveTypes: ['physical_action'],
    status: 'implemented',
    requiresTarget: false,
  },

  // ─── CONVERSATIONAL ACTIONS (detected from dialogue) ────────────────────────

  {
    actionId: 'talk_to_npc',
    displayName: 'Talk to NPC',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['npc_talked'],
    objectiveTypes: ['talk_to_npc', 'complete_conversation', 'conversation_initiation'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'ask_for_directions',
    displayName: 'Ask for Directions',
    category: 'language',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action'],
    objectiveTypes: ['ask_for_directions', 'navigate_language', 'follow_directions'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'introduce_self',
    displayName: 'Introduce Yourself',
    category: 'language',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action'],
    objectiveTypes: ['introduce_self'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'order_food',
    displayName: 'Order Food',
    category: 'language',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action', 'food_ordered'],
    objectiveTypes: ['order_food'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'haggle_price',
    displayName: 'Haggle Price',
    category: 'language',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action', 'price_haggled'],
    objectiveTypes: ['haggle_price'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'describe_scene',
    displayName: 'Describe Scene',
    category: 'language',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action'],
    objectiveTypes: ['describe_scene'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'compliment_npc',
    displayName: 'Compliment',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action', 'npc_relationship_changed'],
    objectiveTypes: ['build_friendship', 'gain_reputation'],
    status: 'partial',
    priority: 'medium',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'insult_npc',
    displayName: 'Insult',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action', 'npc_relationship_changed'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'low',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'threaten',
    displayName: 'Threaten',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action', 'npc_relationship_changed'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'low',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'flirt',
    displayName: 'Flirt',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action', 'romance_action'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'low',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'persuade',
    displayName: 'Persuade',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'medium',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'bribe',
    displayName: 'Bribe',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'low',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'gossip',
    displayName: 'Gossip',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'low',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'confess',
    displayName: 'Confess',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'low',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'apologize',
    displayName: 'Apologize',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action', 'npc_relationship_changed'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'low',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'comfort',
    displayName: 'Comfort',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action', 'npc_relationship_changed'],
    objectiveTypes: ['build_friendship'],
    status: 'partial',
    priority: 'low',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'argue',
    displayName: 'Argue',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action', 'npc_relationship_changed'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'low',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'teach_vocabulary',
    displayName: 'Teach Vocabulary',
    category: 'language',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action', 'vocabulary_used'],
    objectiveTypes: ['teach_vocabulary', 'teach_phrase'],
    status: 'partial',
    priority: 'medium',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'listen_and_repeat',
    displayName: 'Listen and Repeat',
    category: 'language',
    interactionMode: 'conversational',
    eventTypes: ['utterance_evaluated'],
    objectiveTypes: ['listen_and_repeat', 'pronunciation_check'],
    status: 'partial',
    priority: 'medium',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'write_response',
    displayName: 'Write Response',
    category: 'language',
    interactionMode: 'conversational',
    eventTypes: ['writing_submitted'],
    objectiveTypes: ['write_response', 'translation_challenge'],
    status: 'implemented',
    requiresTarget: false,
  },
  {
    actionId: 'answer_question',
    displayName: 'Answer Question',
    category: 'language',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action', 'questions_answered'],
    objectiveTypes: ['comprehension_quiz', 'listening_comprehension'],
    status: 'implemented',
    requiresTarget: false,
  },
  {
    actionId: 'request_quest',
    displayName: 'Request Quest',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['quest_accepted'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },

  // ─── OBSERVATIONAL ACTIONS (detected from watching/listening) ───────────────

  {
    actionId: 'eavesdrop',
    displayName: 'Eavesdrop',
    category: 'social',
    interactionMode: 'observational',
    eventTypes: ['conversation_overheard', 'vocabulary_overheard'],
    objectiveTypes: ['observe_activity'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'observe_activity',
    displayName: 'Observe Activity',
    category: 'exploration',
    interactionMode: 'observational',
    eventTypes: ['conversational_action'],
    objectiveTypes: ['observe_activity'],
    status: 'partial',
    priority: 'medium',
    requiresTarget: true,
    targetType: 'npc',
  },

  // ─── AUTOMATIC ACTIONS (triggered by game state) ───────────────────────────

  {
    actionId: 'travel_to_location',
    displayName: 'Travel to Location',
    category: 'exploration',
    interactionMode: 'automatic',
    eventTypes: ['location_visited', 'location_discovered'],
    objectiveTypes: ['visit_location', 'discover_location'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'location',
  },
  {
    actionId: 'sleep',
    displayName: 'Sleep',
    category: 'survival',
    interactionMode: 'automatic',
    eventTypes: ['furniture_slept'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: false,
  },
  {
    actionId: 'rest',
    displayName: 'Rest',
    category: 'survival',
    interactionMode: 'automatic',
    eventTypes: ['furniture_sat'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: false,
  },
  {
    actionId: 'sit',
    displayName: 'Sit Down',
    category: 'social',
    interactionMode: 'automatic',
    eventTypes: ['furniture_sat'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: false,
  },
  {
    actionId: 'work',
    displayName: 'Work',
    category: 'social',
    interactionMode: 'automatic',
    eventTypes: ['furniture_worked'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'building',
  },
  {
    actionId: 'escort_npc',
    displayName: 'Escort NPC',
    category: 'social',
    interactionMode: 'automatic',
    eventTypes: ['escort_started', 'escort_completed'],
    objectiveTypes: ['escort_npc'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },

  // ─── INVENTORY ACTIONS (triggered from inventory UI) ───────────────────────

  {
    actionId: 'consume',
    displayName: 'Consume',
    category: 'items',
    interactionMode: 'inventory',
    eventTypes: ['item_used'],
    objectiveTypes: ['collect_item'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'item',
  },
  {
    actionId: 'use_item',
    displayName: 'Use Item',
    category: 'items',
    interactionMode: 'inventory',
    eventTypes: ['item_used'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'item',
  },
  {
    actionId: 'equip_item',
    displayName: 'Equip Item',
    category: 'items',
    interactionMode: 'inventory',
    eventTypes: ['item_equipped'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'item',
  },
  {
    actionId: 'drop_item',
    displayName: 'Drop Item',
    category: 'items',
    interactionMode: 'inventory',
    eventTypes: ['item_dropped'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'item',
  },
  {
    actionId: 'collect_item',
    displayName: 'Collect Item',
    category: 'items',
    interactionMode: 'physical',
    eventTypes: ['item_collected'],
    objectiveTypes: ['collect_item', 'collect_text'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'item',
  },

  // ─── ENSEMBLE SOCIAL ACTIONS (Prolog-only, need game wiring) ───────────────

  {
    actionId: 'greet',
    displayName: 'Greet',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['npc_greeting', 'conversational_action'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'medium',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'joke',
    displayName: 'Tell Joke',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'low',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'share_story',
    displayName: 'Share Story',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'low',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'ask_about',
    displayName: 'Ask About',
    category: 'social',
    interactionMode: 'conversational',
    eventTypes: ['conversational_action'],
    objectiveTypes: [],
    status: 'partial',
    priority: 'medium',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'trade',
    displayName: 'Trade',
    category: 'commerce',
    interactionMode: 'physical',
    eventTypes: ['item_purchased'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'npc',
  },
  {
    actionId: 'read_book',
    displayName: 'Read Book',
    category: 'language',
    interactionMode: 'physical',
    eventTypes: ['reading_completed', 'text_collected'],
    objectiveTypes: ['read_text', 'find_text'],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'item',
  },
  {
    actionId: 'investigate',
    displayName: 'Investigate',
    category: 'exploration',
    interactionMode: 'physical',
    eventTypes: ['investigation_completed', 'clue_discovered'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'object',
  },
  {
    actionId: 'mount_vehicle',
    displayName: 'Mount Vehicle',
    category: 'exploration',
    interactionMode: 'physical',
    eventTypes: ['vehicle_mounted'],
    objectiveTypes: [],
    status: 'implemented',
    requiresTarget: true,
    targetType: 'object',
  },
];

// ── Indexes ──────────────────────────────────────────────────────────────────

/** Action ID → matrix entry. */
const actionIndex = new Map<string, ActionMatrixEntry>();
for (const entry of ACTION_MATRIX) {
  actionIndex.set(entry.actionId, entry);
}

/** Event type → list of actions that emit it. */
const eventToActionsIndex = new Map<GameEventType, ActionMatrixEntry[]>();
for (const entry of ACTION_MATRIX) {
  for (const eventType of entry.eventTypes) {
    const list = eventToActionsIndex.get(eventType) || [];
    list.push(entry);
    eventToActionsIndex.set(eventType, list);
  }
}

/** Objective type → list of actions that satisfy it. */
const objectiveToActionsIndex = new Map<string, ActionMatrixEntry[]>();
for (const entry of ACTION_MATRIX) {
  for (const objType of entry.objectiveTypes) {
    const list = objectiveToActionsIndex.get(objType) || [];
    list.push(entry);
    objectiveToActionsIndex.set(objType, list);
  }
}

// ── Lookup Functions ─────────────────────────────────────────────────────────

/** Get the matrix entry for a given action ID. */
export function getActionEntry(actionId: string): ActionMatrixEntry | undefined {
  return actionIndex.get(actionId);
}

/** Get all actions that emit a given event type. */
export function getActionsForEvent(eventType: GameEventType): ActionMatrixEntry[] {
  return eventToActionsIndex.get(eventType) || [];
}

/** Get all actions that can satisfy a given quest objective type. */
export function getActionsForObjective(objectiveType: string): ActionMatrixEntry[] {
  return objectiveToActionsIndex.get(objectiveType) || [];
}

/** Get action names that satisfy a given objective type (for ActionManager compatibility). */
export function getActionNamesForObjective(objectiveType: string): string[] {
  return getActionsForObjective(objectiveType).map(e => e.actionId);
}

/** Get all actions by interaction mode. */
export function getActionsByMode(mode: ActionInteractionMode): ActionMatrixEntry[] {
  return ACTION_MATRIX.filter(e => e.interactionMode === mode);
}

/** Get all actions by implementation status. */
export function getActionsByStatus(status: ActionImplementationStatus): ActionMatrixEntry[] {
  return ACTION_MATRIX.filter(e => e.status === status);
}

/** Get all actions by category. */
export function getActionsByCategory(category: string): ActionMatrixEntry[] {
  return ACTION_MATRIX.filter(e => e.category === category);
}

/** Get all missing or partial actions sorted by priority. */
export function getMissingActions(): ActionMatrixEntry[] {
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return ACTION_MATRIX
    .filter(e => e.status !== 'implemented')
    .sort((a, b) => (priorityOrder[a.priority || 'low'] ?? 3) - (priorityOrder[b.priority || 'low'] ?? 3));
}
