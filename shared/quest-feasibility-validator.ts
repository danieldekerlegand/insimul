/**
 * Quest Feasibility Validator
 *
 * Validates that quest objectives can actually be completed given the available
 * game actions. This prevents quests from being assigned that reference
 * mechanics or action types the world doesn't support.
 */

import {
  ACHIEVABLE_OBJECTIVE_TYPES,
  VALID_OBJECTIVE_TYPES,
  normalizeObjectiveType,
  type ObjectiveTypeInfo,
} from './quest-objective-types';

// ── Types ───────────────────────────────────────────────────────────────────

export interface QuestObjective {
  type: string;
  description?: string;
  target?: string;
  required?: number;
  requiredCount?: number;
  [key: string]: any;
}

export interface GameAction {
  name: string;
  actionType: string; // social, physical, mental, economic, etc.
  category?: string; // conversation, combat, trade, crafting, etc.
  targetType?: string; // self, other, location, object, none
  isActive?: boolean;
  tags?: string[];
}

export interface WorldContext {
  /** Known NPC names in the world */
  npcs?: string[];
  /** Known item names in the world */
  items?: string[];
  /** Known location names in the world */
  locations?: string[];
}

export interface FeasibilityIssue {
  objectiveIndex: number;
  objectiveType: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface FeasibilityResult {
  feasible: boolean;
  issues: FeasibilityIssue[];
  /** Objectives that passed validation */
  validCount: number;
  /** Total objectives checked */
  totalCount: number;
}

// ── Objective-to-Action mapping ─────────────────────────────────────────────
// Maps each canonical objective type to the action types/categories that can
// fulfill it. An objective is feasible if at least one matching action exists.

interface ActionRequirement {
  /** Action types that can fulfill this objective (OR logic) */
  actionTypes?: string[];
  /** Action categories that can fulfill this objective (OR logic) */
  categories?: string[];
  /** Action tags that can fulfill this objective (OR logic) */
  tags?: string[];
}

const OBJECTIVE_ACTION_MAP: Record<string, ActionRequirement> = {
  visit_location: {
    actionTypes: ['physical', 'movement'],
    categories: ['movement', 'travel', 'navigation', 'exploration'],
    tags: ['movement', 'travel', 'location'],
  },
  discover_location: {
    actionTypes: ['physical', 'movement'],
    categories: ['movement', 'travel', 'navigation', 'exploration'],
    tags: ['movement', 'exploration', 'discover'],
  },
  talk_to_npc: {
    actionTypes: ['social'],
    categories: ['conversation', 'dialogue', 'social'],
    tags: ['conversation', 'dialogue', 'social', 'talk'],
  },
  complete_conversation: {
    actionTypes: ['social'],
    categories: ['conversation', 'dialogue', 'social'],
    tags: ['conversation', 'dialogue'],
  },
  use_vocabulary: {
    actionTypes: ['social', 'mental', 'language'],
    categories: ['conversation', 'dialogue', 'language', 'vocabulary'],
    tags: ['vocabulary', 'language', 'conversation'],
  },
  collect_vocabulary: {
    actionTypes: ['physical', 'mental', 'language'],
    categories: ['vocabulary', 'language', 'collection'],
    tags: ['vocabulary', 'collect', 'language'],
  },
  identify_object: {
    actionTypes: ['mental', 'language'],
    categories: ['vocabulary', 'language', 'identification'],
    tags: ['identify', 'vocabulary', 'language'],
  },
  collect_item: {
    actionTypes: ['physical'],
    categories: ['inventory', 'collection', 'gathering', 'trade'],
    tags: ['collect', 'item', 'pickup', 'inventory'],
  },
  deliver_item: {
    actionTypes: ['physical', 'social'],
    categories: ['inventory', 'delivery', 'trade'],
    tags: ['deliver', 'item', 'give'],
  },
  defeat_enemies: {
    categories: ['combat', 'fighting'],
    tags: ['combat', 'fight', 'attack'],
  },
  craft_item: {
    actionTypes: ['physical'],
    categories: ['crafting', 'creation'],
    tags: ['craft', 'create', 'build'],
  },
  escort_npc: {
    actionTypes: ['social', 'physical'],
    categories: ['escort', 'protection', 'social'],
    tags: ['escort', 'protect', 'accompany'],
  },
  gain_reputation: {
    actionTypes: ['social'],
    categories: ['reputation', 'social', 'faction'],
    tags: ['reputation', 'faction', 'standing'],
  },
  listening_comprehension: {
    actionTypes: ['social', 'mental', 'language'],
    categories: ['conversation', 'dialogue', 'language', 'comprehension'],
    tags: ['listen', 'comprehension', 'language'],
  },
  translation_challenge: {
    actionTypes: ['mental', 'language'],
    categories: ['language', 'translation'],
    tags: ['translate', 'language'],
  },
  navigate_language: {
    actionTypes: ['physical', 'mental', 'language'],
    categories: ['navigation', 'language', 'movement'],
    tags: ['navigate', 'language', 'directions'],
  },
  follow_directions: {
    actionTypes: ['physical', 'mental', 'language'],
    categories: ['navigation', 'language', 'movement'],
    tags: ['follow', 'directions', 'language'],
  },
  pronunciation_check: {
    actionTypes: ['mental', 'language'],
    categories: ['language', 'pronunciation', 'speech'],
    tags: ['pronounce', 'speech', 'language'],
  },
  conversation_initiation: {
    actionTypes: ['social'],
    categories: ['conversation', 'dialogue', 'social'],
    tags: ['conversation', 'dialogue', 'social', 'npc_initiated'],
  },
  examine_object: {
    actionTypes: ['mental', 'language'],
    categories: ['vocabulary', 'language', 'examination'],
    tags: ['examine', 'inspect', 'vocabulary', 'language'],
  },
  read_sign: {
    actionTypes: ['mental', 'language'],
    categories: ['vocabulary', 'language', 'reading'],
    tags: ['read', 'sign', 'language'],
  },
  write_response: {
    actionTypes: ['mental', 'language'],
    categories: ['language', 'writing', 'composition'],
    tags: ['write', 'compose', 'language'],
  },
  listen_and_repeat: {
    actionTypes: ['mental', 'language'],
    categories: ['language', 'pronunciation', 'speech', 'listening'],
    tags: ['listen', 'repeat', 'pronunciation', 'language'],
  },
  point_and_name: {
    actionTypes: ['mental', 'language'],
    categories: ['vocabulary', 'language', 'identification'],
    tags: ['point', 'name', 'vocabulary', 'language'],
  },
  ask_for_directions: {
    actionTypes: ['social', 'language'],
    categories: ['conversation', 'dialogue', 'language', 'navigation'],
    tags: ['directions', 'ask', 'language', 'conversation'],
  },
  order_food: {
    actionTypes: ['social', 'language'],
    categories: ['conversation', 'dialogue', 'language', 'trade'],
    tags: ['order', 'food', 'language', 'conversation'],
  },
  haggle_price: {
    actionTypes: ['social', 'language', 'economic'],
    categories: ['conversation', 'dialogue', 'language', 'trade', 'negotiation'],
    tags: ['haggle', 'negotiate', 'language', 'conversation'],
  },
  introduce_self: {
    actionTypes: ['social', 'language'],
    categories: ['conversation', 'dialogue', 'language', 'social'],
    tags: ['introduce', 'greeting', 'language', 'conversation'],
  },
  describe_scene: {
    actionTypes: ['mental', 'language'],
    categories: ['language', 'writing', 'composition', 'description'],
    tags: ['describe', 'scene', 'language', 'writing'],
  },
  teach_vocabulary: {
    actionTypes: ['social', 'language'],
    categories: ['conversation', 'dialogue', 'language', 'teaching'],
    tags: ['teach', 'vocabulary', 'language', 'conversation'],
  },
  teach_phrase: {
    actionTypes: ['social', 'language'],
    categories: ['conversation', 'dialogue', 'language', 'teaching'],
    tags: ['teach', 'phrase', 'language', 'conversation'],
  },
  build_friendship: {
    actionTypes: ['social'],
    categories: ['conversation', 'dialogue', 'social', 'relationship'],
    tags: ['friendship', 'social', 'conversation', 'rapport'],
  },
  give_gift: {
    actionTypes: ['social', 'physical'],
    categories: ['social', 'inventory', 'relationship'],
    tags: ['gift', 'give', 'social', 'item'],
  },
};

/** All objective types that have an action mapping defined. */
export const ACTION_MAPPED_OBJECTIVE_TYPES = Object.keys(OBJECTIVE_ACTION_MAP);

// ── Core validator ──────────────────────────────────────────────────────────

/**
 * Check if an action matches the requirements for an objective type.
 */
function actionMatchesRequirement(
  action: GameAction,
  requirement: ActionRequirement,
): boolean {
  const actionType = action.actionType?.toLowerCase();
  const category = action.category?.toLowerCase();
  const tags = (action.tags ?? []).map(t => t.toLowerCase());

  if (requirement.actionTypes?.some(t => t === actionType)) return true;
  if (requirement.categories?.some(c => c === category)) return true;
  if (requirement.tags?.some(t => tags.includes(t))) return true;

  return false;
}

/**
 * Find actions that can fulfill a given objective type.
 */
export function findMatchingActions(
  objectiveType: string,
  actions: GameAction[],
): GameAction[] {
  const requirement = OBJECTIVE_ACTION_MAP[objectiveType];
  if (!requirement) return [];

  const activeActions = actions.filter(a => a.isActive !== false);
  return activeActions.filter(a => actionMatchesRequirement(a, requirement));
}

/**
 * Validate that a quest's objectives are feasible given available actions
 * and (optionally) world context.
 */
export function validateQuestFeasibility(
  objectives: QuestObjective[],
  availableActions: GameAction[],
  worldContext?: WorldContext,
): FeasibilityResult {
  const issues: FeasibilityIssue[] = [];

  if (!objectives || objectives.length === 0) {
    return {
      feasible: false,
      issues: [{
        objectiveIndex: -1,
        objectiveType: '',
        severity: 'error',
        message: 'Quest has no objectives',
      }],
      validCount: 0,
      totalCount: 0,
    };
  }

  let validCount = 0;

  for (let i = 0; i < objectives.length; i++) {
    const obj = objectives[i];
    const rawType = obj.type;

    // 1. Normalize the objective type
    const normalized = normalizeObjectiveType(rawType);
    if (!normalized) {
      issues.push({
        objectiveIndex: i,
        objectiveType: rawType,
        severity: 'error',
        message: `Unknown objective type "${rawType}" — not achievable in-game`,
      });
      continue;
    }

    // 2. Check that matching actions exist
    const requirement = OBJECTIVE_ACTION_MAP[normalized];
    if (!requirement) {
      issues.push({
        objectiveIndex: i,
        objectiveType: normalized,
        severity: 'warning',
        message: `No action mapping defined for objective type "${normalized}"`,
      });
      validCount++;
      continue;
    }

    const matching = findMatchingActions(normalized, availableActions);
    if (matching.length === 0) {
      issues.push({
        objectiveIndex: i,
        objectiveType: normalized,
        severity: 'error',
        message: `No available actions can fulfill objective type "${normalized}" — need actionType in [${requirement.actionTypes?.join(', ')}] or category in [${requirement.categories?.join(', ')}]`,
      });
      continue;
    }

    // 3. Check target references against world context
    if (worldContext && obj.target) {
      const typeInfo = ACHIEVABLE_OBJECTIVE_TYPES.find(t => t.type === normalized);
      if (typeInfo) {
        const targetIssue = validateTarget(i, normalized, obj.target, typeInfo, worldContext);
        if (targetIssue) {
          issues.push(targetIssue);
          // Target warnings don't block feasibility
          if (targetIssue.severity === 'error') continue;
        }
      }
    }

    // 4. Check countable constraints
    const count = obj.required ?? obj.requiredCount ?? 1;
    const typeInfo = ACHIEVABLE_OBJECTIVE_TYPES.find(t => t.type === normalized);
    if (typeInfo && !typeInfo.countable && count > 1) {
      issues.push({
        objectiveIndex: i,
        objectiveType: normalized,
        severity: 'warning',
        message: `Objective type "${normalized}" is not countable but has required count ${count} — will be treated as 1`,
      });
    }

    validCount++;
  }

  return {
    feasible: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    validCount,
    totalCount: objectives.length,
  };
}

// ── Target validation ───────────────────────────────────────────────────────

function validateTarget(
  index: number,
  objectiveType: string,
  target: string,
  typeInfo: ObjectiveTypeInfo,
  ctx: WorldContext,
): FeasibilityIssue | null {
  const requiresTarget = typeInfo.requiresTarget;

  if (requiresTarget === 'npc' && ctx.npcs && ctx.npcs.length > 0) {
    const found = ctx.npcs.some(
      npc => npc.toLowerCase() === target.toLowerCase(),
    );
    if (!found) {
      return {
        objectiveIndex: index,
        objectiveType,
        severity: 'warning',
        message: `Target NPC "${target}" not found in world — quest may reference a non-existent character`,
      };
    }
  }

  if (requiresTarget === 'item' && ctx.items && ctx.items.length > 0) {
    const found = ctx.items.some(
      item => item.toLowerCase() === target.toLowerCase(),
    );
    if (!found) {
      return {
        objectiveIndex: index,
        objectiveType,
        severity: 'warning',
        message: `Target item "${target}" not found in world — quest may reference a non-existent item`,
      };
    }
  }

  if (requiresTarget === 'location' && ctx.locations && ctx.locations.length > 0) {
    const found = ctx.locations.some(
      loc => loc.toLowerCase() === target.toLowerCase(),
    );
    if (!found) {
      return {
        objectiveIndex: index,
        objectiveType,
        severity: 'warning',
        message: `Target location "${target}" not found in world — quest may reference a non-existent location`,
      };
    }
  }

  return null;
}
