/**
 * Action-to-Animation Map
 *
 * Canonical mapping from base action names to Quaternius animation clips.
 * Used by:
 *   - PlayerActionSystem (in-game animation playback during physical actions)
 *   - AdminRulesActionsHub (animation preview in the Actions editor)
 *   - Export pipelines (embedding animation metadata in game exports)
 *
 * Each entry maps an action name (matching the Ensemble/Prolog base action names)
 * to a primary animation clip, fallback clip, category, and whether it loops.
 */

import { ANIMATION_CATALOG, type AnimationCategory } from './animation-registry';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ActionAnimationEntry {
  /** Base action name (e.g. 'fish', 'chop_tree', 'greet') */
  actionName: string;
  /** Display name for the UI */
  displayName: string;
  /** Primary Quaternius animation clip name */
  animationClip: string;
  /** Fallback animation if the primary is unavailable */
  animationFallback: string;
  /** Whether the animation should loop during the action */
  loop: boolean;
  /** Animation category for grouping in the UI */
  category: ActionAnimationCategory;
}

export type ActionAnimationCategory =
  | 'physical'
  | 'conversational'
  | 'observational'
  | 'automatic'
  | 'inventory'
  | 'combat'
  | 'social'
  | 'language';

// ── Action-to-Animation Map ─────────────────────────────────────────────────

export const ACTION_ANIMATION_MAP: Record<string, ActionAnimationEntry> = {
  // ── Physical / Resource Actions ──────────────────────────────────────────
  fish: {
    actionName: 'fish',
    displayName: 'Fish',
    animationClip: 'Farm_Harvest',
    animationFallback: 'Interact',
    loop: true,
    category: 'physical',
  },
  mine_rock: {
    actionName: 'mine_rock',
    displayName: 'Mine Rock',
    animationClip: 'TreeChopping_Loop',
    animationFallback: 'Interact',
    loop: true,
    category: 'physical',
  },
  chop_tree: {
    actionName: 'chop_tree',
    displayName: 'Chop Tree',
    animationClip: 'TreeChopping_Loop',
    animationFallback: 'Interact',
    loop: true,
    category: 'physical',
  },
  gather_herb: {
    actionName: 'gather_herb',
    displayName: 'Gather Herb',
    animationClip: 'Farm_Harvest',
    animationFallback: 'Interact',
    loop: false,
    category: 'physical',
  },
  farm_plant: {
    actionName: 'farm_plant',
    displayName: 'Plant Seeds',
    animationClip: 'Farm_PlantSeed',
    animationFallback: 'Interact',
    loop: false,
    category: 'physical',
  },
  farm_water: {
    actionName: 'farm_water',
    displayName: 'Water Crops',
    animationClip: 'Farm_Watering',
    animationFallback: 'Interact',
    loop: true,
    category: 'physical',
  },
  farm_harvest: {
    actionName: 'farm_harvest',
    displayName: 'Harvest Crops',
    animationClip: 'Farm_Harvest',
    animationFallback: 'Interact',
    loop: false,
    category: 'physical',
  },

  // ── Work / Crafting Actions ─────────────────────────────────────────────
  cook: {
    actionName: 'cook',
    displayName: 'Cook',
    animationClip: 'Interact',
    animationFallback: 'Idle_Talking_Loop',
    loop: true,
    category: 'physical',
  },
  craft_item: {
    actionName: 'craft_item',
    displayName: 'Craft Item',
    animationClip: 'Fixing_Kneeling',
    animationFallback: 'Interact',
    loop: true,
    category: 'physical',
  },
  clean: {
    actionName: 'clean',
    displayName: 'Sweep',
    animationClip: 'Farm_Watering',
    animationFallback: 'Interact',
    loop: true,
    category: 'physical',
  },
  paint: {
    actionName: 'paint',
    displayName: 'Paint',
    animationClip: 'Interact',
    animationFallback: 'Idle_Talking_Loop',
    loop: true,
    category: 'physical',
  },

  // ── Interaction / Exploration Actions ────────────────────────────────────
  read_sign: {
    actionName: 'read_sign',
    displayName: 'Read Sign',
    animationClip: 'Sitting_Idle_Loop',
    animationFallback: 'Idle',
    loop: false,
    category: 'physical',
  },
  read_text: {
    actionName: 'read_text',
    displayName: 'Read Text',
    animationClip: 'Sitting_Idle_Loop',
    animationFallback: 'Idle',
    loop: true,
    category: 'physical',
  },
  pray: {
    actionName: 'pray',
    displayName: 'Pray',
    animationClip: 'Fixing_Kneeling',
    animationFallback: 'Idle',
    loop: true,
    category: 'physical',
  },
  open_container: {
    actionName: 'open_container',
    displayName: 'Open Container',
    animationClip: 'Chest_Open',
    animationFallback: 'Interact',
    loop: false,
    category: 'physical',
  },
  pick_up_item: {
    actionName: 'pick_up_item',
    displayName: 'Pick Up',
    animationClip: 'PickUp_Table',
    animationFallback: 'Interact',
    loop: false,
    category: 'physical',
  },
  throw_item: {
    actionName: 'throw_item',
    displayName: 'Throw',
    animationClip: 'OverhandThrow',
    animationFallback: 'Interact',
    loop: false,
    category: 'physical',
  },

  // ── Social / Conversational Actions ─────────────────────────────────────
  greet: {
    actionName: 'greet',
    displayName: 'Greet / Wave',
    animationClip: 'Wave',
    animationFallback: 'Idle',
    loop: false,
    category: 'social',
  },
  talk_to_npc: {
    actionName: 'talk_to_npc',
    displayName: 'Talk',
    animationClip: 'Idle_Talking_Loop',
    animationFallback: 'Idle',
    loop: true,
    category: 'conversational',
  },
  ask_for_directions: {
    actionName: 'ask_for_directions',
    displayName: 'Ask Directions',
    animationClip: 'Idle_Talking_Loop',
    animationFallback: 'Idle',
    loop: true,
    category: 'conversational',
  },
  introduce_self: {
    actionName: 'introduce_self',
    displayName: 'Introduce Self',
    animationClip: 'Wave',
    animationFallback: 'Idle_Talking_Loop',
    loop: false,
    category: 'conversational',
  },
  compliment_npc: {
    actionName: 'compliment_npc',
    displayName: 'Compliment',
    animationClip: 'Yes',
    animationFallback: 'Idle_Talking_Loop',
    loop: false,
    category: 'conversational',
  },
  give_gift: {
    actionName: 'give_gift',
    displayName: 'Give Gift',
    animationClip: 'Interact',
    animationFallback: 'Idle',
    loop: false,
    category: 'social',
  },

  // ── Inventory Actions ───────────────────────────────────────────────────
  buy_item: {
    actionName: 'buy_item',
    displayName: 'Buy Item',
    animationClip: 'Interact',
    animationFallback: 'Idle',
    loop: false,
    category: 'inventory',
  },
  sell_item: {
    actionName: 'sell_item',
    displayName: 'Sell Item',
    animationClip: 'Interact',
    animationFallback: 'Idle',
    loop: false,
    category: 'inventory',
  },
  consume: {
    actionName: 'consume',
    displayName: 'Consume',
    animationClip: 'Consume',
    animationFallback: 'Idle',
    loop: false,
    category: 'inventory',
  },
  equip_item: {
    actionName: 'equip_item',
    displayName: 'Equip Item',
    animationClip: 'Interact',
    animationFallback: 'Idle',
    loop: false,
    category: 'inventory',
  },
  drop_item: {
    actionName: 'drop_item',
    displayName: 'Drop Item',
    animationClip: 'OverhandThrow',
    animationFallback: 'Interact',
    loop: false,
    category: 'inventory',
  },
  use_item: {
    actionName: 'use_item',
    displayName: 'Use Item',
    animationClip: 'Interact',
    animationFallback: 'Idle',
    loop: false,
    category: 'inventory',
  },

  // ── Observational Actions ───────────────────────────────────────────────
  eavesdrop: {
    actionName: 'eavesdrop',
    displayName: 'Eavesdrop',
    animationClip: 'Crouch_Idle_Loop',
    animationFallback: 'Idle',
    loop: true,
    category: 'observational',
  },
  observe_activity: {
    actionName: 'observe_activity',
    displayName: 'Observe',
    animationClip: 'Idle_FoldArms_Loop',
    animationFallback: 'Idle',
    loop: true,
    category: 'observational',
  },

  // ── Language Learning Actions ───────────────────────────────────────────
  listen_and_repeat: {
    actionName: 'listen_and_repeat',
    displayName: 'Listen & Repeat',
    animationClip: 'Idle_Talking_Loop',
    animationFallback: 'Idle',
    loop: false,
    category: 'language',
  },
  point_and_name: {
    actionName: 'point_and_name',
    displayName: 'Point & Name',
    animationClip: 'Interact',
    animationFallback: 'Idle',
    loop: false,
    category: 'language',
  },
  order_food: {
    actionName: 'order_food',
    displayName: 'Order Food',
    animationClip: 'Idle_Talking_Loop',
    animationFallback: 'Idle',
    loop: false,
    category: 'language',
  },
  haggle_price: {
    actionName: 'haggle_price',
    displayName: 'Haggle Price',
    animationClip: 'Idle_Talking_Loop',
    animationFallback: 'Idle',
    loop: true,
    category: 'language',
  },

  // ── Combat Actions ──────────────────────────────────────────────────────
  attack_enemy: {
    actionName: 'attack_enemy',
    displayName: 'Attack',
    animationClip: 'Sword_Attack',
    animationFallback: 'Punch_Right',
    loop: false,
    category: 'combat',
  },
  block: {
    actionName: 'block',
    displayName: 'Block',
    animationClip: 'Sword_Block',
    animationFallback: 'Idle_Shield_Loop',
    loop: true,
    category: 'combat',
  },
  dodge: {
    actionName: 'dodge',
    displayName: 'Dodge',
    animationClip: 'Roll',
    animationFallback: 'Run',
    loop: false,
    category: 'combat',
  },

  // ── Automatic / Passive Actions ─────────────────────────────────────────
  sleep: {
    actionName: 'sleep',
    displayName: 'Sleep',
    animationClip: 'LayToIdle',
    animationFallback: 'Idle',
    loop: false,
    category: 'automatic',
  },
  rest: {
    actionName: 'rest',
    displayName: 'Rest',
    animationClip: 'Sitting_Idle_Loop',
    animationFallback: 'Idle',
    loop: true,
    category: 'automatic',
  },
  sit: {
    actionName: 'sit',
    displayName: 'Sit Down',
    animationClip: 'Sitting_Enter',
    animationFallback: 'Sitting_Idle_Loop',
    loop: false,
    category: 'automatic',
  },
  dance: {
    actionName: 'dance',
    displayName: 'Dance',
    animationClip: 'Dance_Loop',
    animationFallback: 'Idle',
    loop: true,
    category: 'social',
  },
  travel_to_location: {
    actionName: 'travel_to_location',
    displayName: 'Travel',
    animationClip: 'Walk_Loop',
    animationFallback: 'Walk',
    loop: true,
    category: 'automatic',
  },
};

// ── Lookup Helpers ────────────────────────────────────────────────────────

/**
 * Get the animation entry for a base action name.
 * Falls back to a generic 'Interact' animation if the action is unknown.
 */
export function getAnimationForAction(actionName: string): ActionAnimationEntry {
  const normalized = actionName.toLowerCase().replace(/[\s-]/g, '_');
  return ACTION_ANIMATION_MAP[normalized] ?? {
    actionName: normalized,
    displayName: actionName,
    animationClip: 'Interact',
    animationFallback: 'Idle',
    loop: false,
    category: 'physical' as ActionAnimationCategory,
  };
}

/**
 * Get the animation clip name for a base action name.
 * Validates against the animation catalog and falls back if the clip doesn't exist.
 */
export function resolveAnimationClip(actionName: string): string {
  const entry = getAnimationForAction(actionName);
  if (ANIMATION_CATALOG[entry.animationClip]) {
    return entry.animationClip;
  }
  if (ANIMATION_CATALOG[entry.animationFallback]) {
    return entry.animationFallback;
  }
  return 'Idle';
}

/**
 * Get all action animation entries grouped by category.
 */
export function getActionAnimationsByCategory(): Map<ActionAnimationCategory, ActionAnimationEntry[]> {
  const groups = new Map<ActionAnimationCategory, ActionAnimationEntry[]>();
  for (const entry of Object.values(ACTION_ANIMATION_MAP)) {
    if (!groups.has(entry.category)) {
      groups.set(entry.category, []);
    }
    groups.get(entry.category)!.push(entry);
  }
  return groups;
}

/**
 * Check if a given animation clip name exists in the Quaternius catalog.
 */
export function isValidAnimationClip(clipName: string): boolean {
  return clipName in ANIMATION_CATALOG;
}
