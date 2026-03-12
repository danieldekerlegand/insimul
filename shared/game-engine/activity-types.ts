/**
 * Canonical Activity Types Taxonomy for Insimul
 *
 * Every player action in the game system maps to one of these activity types.
 * Used by GameEventBus, GamePrologEngine, telemetry, and quest tracking.
 */

// ─── Core Types ─────────────────────────────────────────────────────────────

export type ActivityCategory =
  | 'conversation'
  | 'combat'
  | 'items'
  | 'exploration'
  | 'social'
  | 'romance'
  | 'puzzle'
  | 'language'
  | 'quest';

export type ActivityVerb =
  // Conversation
  | 'talk_to_npc'
  | 'conversation_turn'
  | 'utterance_attempt'
  | 'eavesdrop'
  // Combat
  | 'attack'
  | 'defend'
  | 'dodge'
  | 'use_ability'
  | 'defeat_enemy'
  | 'flee'
  // Items
  | 'collect'
  | 'craft'
  | 'equip'
  | 'use'
  | 'drop'
  | 'give'
  | 'buy'
  | 'sell'
  | 'steal'
  // Exploration
  | 'visit_location'
  | 'discover_location'
  | 'enter_building'
  | 'enter_settlement'
  // Social
  | 'compliment'
  | 'flirt'
  | 'threaten'
  | 'bribe'
  | 'persuade'
  | 'trade'
  // Romance
  | 'romance_action'
  | 'gift'
  | 'date'
  | 'propose'
  // Puzzle
  | 'puzzle_attempt'
  | 'puzzle_solve'
  | 'puzzle_fail'
  // Language
  | 'vocabulary_use'
  | 'grammar_attempt'
  | 'translation'
  | 'pronunciation'
  // Quest
  | 'quest_accept'
  | 'quest_complete'
  | 'quest_fail'
  | 'quest_abandon';

export interface ActivityDefinition {
  /** Category grouping */
  category: ActivityCategory;
  /** The activity verb (same as the key in ACTIVITY_TAXONOMY) */
  verb: ActivityVerb;
  /** Whether this activity requires a target entity */
  requiresTarget: boolean;
  /** The GameEventBus event name this activity emits */
  emitsEvent: string;
  /** The Prolog predicate asserted when this activity occurs */
  prologPredicate: string;
  /** Fields included in telemetry for this activity */
  telemetryFields: readonly string[];
}

// ─── Taxonomy ───────────────────────────────────────────────────────────────

/**
 * Canonical mapping from activity verb to its full definition.
 *
 * This is the single source of truth for all activity types in the system.
 * Every verb used by GameEventBus, Prolog, telemetry, and quest tracking
 * must have an entry here.
 */
export const ACTIVITY_TAXONOMY: Record<ActivityVerb, ActivityDefinition> = {

  // ── Conversation ────────────────────────────────────────────────────────

  talk_to_npc: {
    category: 'conversation',
    verb: 'talk_to_npc',
    requiresTarget: true,
    emitsEvent: 'npc_talked',
    prologPredicate: 'talked_to(player, NpcId)',
    telemetryFields: ['npcId', 'npcName', 'turnCount', 'duration'],
  },
  conversation_turn: {
    category: 'conversation',
    verb: 'conversation_turn',
    requiresTarget: true,
    emitsEvent: 'conversation_turn',
    prologPredicate: 'conversation_turn(player, NpcId)',
    telemetryFields: ['npcId', 'playerText', 'npcResponse', 'languageUsed'],
  },
  utterance_attempt: {
    category: 'conversation',
    verb: 'utterance_attempt',
    requiresTarget: false,
    emitsEvent: 'utterance_attempted',
    prologPredicate: 'utterance_attempted(player, Phrase)',
    telemetryFields: ['targetPhrase', 'actualPhrase', 'matchScore', 'questId'],
  },
  eavesdrop: {
    category: 'conversation',
    verb: 'eavesdrop',
    requiresTarget: true,
    emitsEvent: 'conversation_overheard',
    prologPredicate: 'overheard(player, Npc1, Npc2)',
    telemetryFields: ['npc1Id', 'npc2Id', 'topic', 'languageUsed'],
  },

  // ── Combat ──────────────────────────────────────────────────────────────

  attack: {
    category: 'combat',
    verb: 'attack',
    requiresTarget: true,
    emitsEvent: 'combat_action',
    prologPredicate: 'attacked(player, TargetId)',
    telemetryFields: ['targetId', 'damage', 'weaponUsed', 'isCrit'],
  },
  defend: {
    category: 'combat',
    verb: 'defend',
    requiresTarget: false,
    emitsEvent: 'combat_action',
    prologPredicate: 'defended(player)',
    telemetryFields: ['damageBlocked'],
  },
  dodge: {
    category: 'combat',
    verb: 'dodge',
    requiresTarget: false,
    emitsEvent: 'combat_action',
    prologPredicate: 'dodged(player)',
    telemetryFields: ['attackDodged'],
  },
  use_ability: {
    category: 'combat',
    verb: 'use_ability',
    requiresTarget: true,
    emitsEvent: 'combat_action',
    prologPredicate: 'used_ability(player, AbilityId)',
    telemetryFields: ['abilityId', 'targetId', 'damage', 'effect'],
  },
  defeat_enemy: {
    category: 'combat',
    verb: 'defeat_enemy',
    requiresTarget: true,
    emitsEvent: 'enemy_defeated',
    prologPredicate: 'defeated(player, EnemyId)',
    telemetryFields: ['enemyId', 'enemyType', 'xpGained'],
  },
  flee: {
    category: 'combat',
    verb: 'flee',
    requiresTarget: true,
    emitsEvent: 'combat_action',
    prologPredicate: 'fled(player, EnemyId)',
    telemetryFields: ['enemyId', 'healthRemaining'],
  },

  // ── Items ───────────────────────────────────────────────────────────────

  collect: {
    category: 'items',
    verb: 'collect',
    requiresTarget: true,
    emitsEvent: 'item_collected',
    prologPredicate: 'collected(player, ItemId)',
    telemetryFields: ['itemId', 'itemName', 'quantity', 'itemType', 'rarity'],
  },
  craft: {
    category: 'items',
    verb: 'craft',
    requiresTarget: false,
    emitsEvent: 'item_crafted',
    prologPredicate: 'crafted(player, ItemId)',
    telemetryFields: ['itemId', 'itemName', 'quantity', 'recipe', 'ingredientsUsed'],
  },
  equip: {
    category: 'items',
    verb: 'equip',
    requiresTarget: true,
    emitsEvent: 'item_equipped',
    prologPredicate: 'equipped(player, ItemId)',
    telemetryFields: ['itemId', 'itemName', 'slot'],
  },
  use: {
    category: 'items',
    verb: 'use',
    requiresTarget: true,
    emitsEvent: 'item_used',
    prologPredicate: 'used(player, ItemId)',
    telemetryFields: ['itemId', 'itemName', 'effect'],
  },
  drop: {
    category: 'items',
    verb: 'drop',
    requiresTarget: true,
    emitsEvent: 'item_dropped',
    prologPredicate: 'dropped(player, ItemId)',
    telemetryFields: ['itemId', 'itemName', 'quantity'],
  },
  give: {
    category: 'items',
    verb: 'give',
    requiresTarget: true,
    emitsEvent: 'item_delivered',
    prologPredicate: 'gave(player, ItemId, NpcId)',
    telemetryFields: ['itemId', 'itemName', 'recipientId', 'quantity'],
  },
  buy: {
    category: 'items',
    verb: 'buy',
    requiresTarget: true,
    emitsEvent: 'item_collected',
    prologPredicate: 'bought(player, ItemId)',
    telemetryFields: ['itemId', 'itemName', 'price', 'merchantId'],
  },
  sell: {
    category: 'items',
    verb: 'sell',
    requiresTarget: true,
    emitsEvent: 'item_removed',
    prologPredicate: 'sold(player, ItemId)',
    telemetryFields: ['itemId', 'itemName', 'price', 'merchantId'],
  },
  steal: {
    category: 'items',
    verb: 'steal',
    requiresTarget: true,
    emitsEvent: 'item_collected',
    prologPredicate: 'stole(player, ItemId, VictimId)',
    telemetryFields: ['itemId', 'itemName', 'victimId', 'detected'],
  },

  // ── Exploration ─────────────────────────────────────────────────────────

  visit_location: {
    category: 'exploration',
    verb: 'visit_location',
    requiresTarget: true,
    emitsEvent: 'location_visited',
    prologPredicate: 'visited(player, LocationId)',
    telemetryFields: ['locationId', 'locationName', 'locationType'],
  },
  discover_location: {
    category: 'exploration',
    verb: 'discover_location',
    requiresTarget: true,
    emitsEvent: 'location_discovered',
    prologPredicate: 'discovered(player, LocationId)',
    telemetryFields: ['locationId', 'locationName', 'locationType'],
  },
  enter_building: {
    category: 'exploration',
    verb: 'enter_building',
    requiresTarget: true,
    emitsEvent: 'location_visited',
    prologPredicate: 'entered_building(player, BuildingId)',
    telemetryFields: ['buildingId', 'buildingType', 'businessName'],
  },
  enter_settlement: {
    category: 'exploration',
    verb: 'enter_settlement',
    requiresTarget: true,
    emitsEvent: 'settlement_entered',
    prologPredicate: 'entered_settlement(player, SettlementId)',
    telemetryFields: ['settlementId', 'settlementName'],
  },

  // ── Social ──────────────────────────────────────────────────────────────

  compliment: {
    category: 'social',
    verb: 'compliment',
    requiresTarget: true,
    emitsEvent: 'reputation_changed',
    prologPredicate: 'complimented(player, NpcId)',
    telemetryFields: ['npcId', 'npcName', 'reputationChange'],
  },
  flirt: {
    category: 'social',
    verb: 'flirt',
    requiresTarget: true,
    emitsEvent: 'reputation_changed',
    prologPredicate: 'flirted(player, NpcId)',
    telemetryFields: ['npcId', 'npcName', 'reputationChange', 'success'],
  },
  threaten: {
    category: 'social',
    verb: 'threaten',
    requiresTarget: true,
    emitsEvent: 'reputation_changed',
    prologPredicate: 'threatened(player, NpcId)',
    telemetryFields: ['npcId', 'npcName', 'reputationChange'],
  },
  bribe: {
    category: 'social',
    verb: 'bribe',
    requiresTarget: true,
    emitsEvent: 'reputation_changed',
    prologPredicate: 'bribed(player, NpcId)',
    telemetryFields: ['npcId', 'npcName', 'amount', 'accepted'],
  },
  persuade: {
    category: 'social',
    verb: 'persuade',
    requiresTarget: true,
    emitsEvent: 'reputation_changed',
    prologPredicate: 'persuaded(player, NpcId)',
    telemetryFields: ['npcId', 'npcName', 'success', 'method'],
  },
  trade: {
    category: 'social',
    verb: 'trade',
    requiresTarget: true,
    emitsEvent: 'reputation_changed',
    prologPredicate: 'traded(player, NpcId)',
    telemetryFields: ['npcId', 'npcName', 'itemsGiven', 'itemsReceived'],
  },

  // ── Romance ─────────────────────────────────────────────────────────────

  romance_action: {
    category: 'romance',
    verb: 'romance_action',
    requiresTarget: true,
    emitsEvent: 'romance_action',
    prologPredicate: 'romance_action(player, NpcId, ActionType)',
    telemetryFields: ['npcId', 'npcName', 'actionType', 'accepted', 'stageChange'],
  },
  gift: {
    category: 'romance',
    verb: 'gift',
    requiresTarget: true,
    emitsEvent: 'romance_action',
    prologPredicate: 'gifted(player, NpcId, ItemId)',
    telemetryFields: ['npcId', 'npcName', 'itemId', 'itemName', 'appreciated'],
  },
  date: {
    category: 'romance',
    verb: 'date',
    requiresTarget: true,
    emitsEvent: 'romance_action',
    prologPredicate: 'dated(player, NpcId)',
    telemetryFields: ['npcId', 'npcName', 'locationId', 'success'],
  },
  propose: {
    category: 'romance',
    verb: 'propose',
    requiresTarget: true,
    emitsEvent: 'romance_stage_changed',
    prologPredicate: 'proposed(player, NpcId)',
    telemetryFields: ['npcId', 'npcName', 'accepted'],
  },

  // ── Puzzle ──────────────────────────────────────────────────────────────

  puzzle_attempt: {
    category: 'puzzle',
    verb: 'puzzle_attempt',
    requiresTarget: true,
    emitsEvent: 'puzzle_attempted',
    prologPredicate: 'puzzle_attempted(player, PuzzleId)',
    telemetryFields: ['puzzleId', 'puzzleType', 'attempt'],
  },
  puzzle_solve: {
    category: 'puzzle',
    verb: 'puzzle_solve',
    requiresTarget: true,
    emitsEvent: 'puzzle_solved',
    prologPredicate: 'puzzle_solved(player, PuzzleId)',
    telemetryFields: ['puzzleId', 'puzzleType', 'hintsUsed', 'timeSpent'],
  },
  puzzle_fail: {
    category: 'puzzle',
    verb: 'puzzle_fail',
    requiresTarget: true,
    emitsEvent: 'puzzle_failed',
    prologPredicate: 'puzzle_failed(player, PuzzleId)',
    telemetryFields: ['puzzleId', 'puzzleType', 'attempts'],
  },

  // ── Language ────────────────────────────────────────────────────────────

  vocabulary_use: {
    category: 'language',
    verb: 'vocabulary_use',
    requiresTarget: false,
    emitsEvent: 'vocabulary_used',
    prologPredicate: 'vocabulary_used(player, Word)',
    telemetryFields: ['word', 'meaning', 'category', 'correct', 'context'],
  },
  grammar_attempt: {
    category: 'language',
    verb: 'grammar_attempt',
    requiresTarget: false,
    emitsEvent: 'grammar_attempted',
    prologPredicate: 'grammar_attempted(player, Pattern)',
    telemetryFields: ['pattern', 'correct', 'incorrectForm', 'correctedForm'],
  },
  translation: {
    category: 'language',
    verb: 'translation',
    requiresTarget: false,
    emitsEvent: 'translation_attempted',
    prologPredicate: 'translation_attempted(player, Phrase)',
    telemetryFields: ['sourcePhrase', 'targetPhrase', 'playerTranslation', 'accuracy'],
  },
  pronunciation: {
    category: 'language',
    verb: 'pronunciation',
    requiresTarget: false,
    emitsEvent: 'pronunciation_attempted',
    prologPredicate: 'pronunciation_attempted(player, Word)',
    telemetryFields: ['word', 'score', 'feedback'],
  },

  // ── Quest ───────────────────────────────────────────────────────────────

  quest_accept: {
    category: 'quest',
    verb: 'quest_accept',
    requiresTarget: true,
    emitsEvent: 'quest_accepted',
    prologPredicate: 'quest_accepted(player, QuestId)',
    telemetryFields: ['questId', 'questTitle', 'questType', 'difficulty'],
  },
  quest_complete: {
    category: 'quest',
    verb: 'quest_complete',
    requiresTarget: true,
    emitsEvent: 'quest_completed',
    prologPredicate: 'quest_completed(player, QuestId)',
    telemetryFields: ['questId', 'questTitle', 'questType', 'xpReward', 'starRating', 'timeSpent'],
  },
  quest_fail: {
    category: 'quest',
    verb: 'quest_fail',
    requiresTarget: true,
    emitsEvent: 'quest_failed',
    prologPredicate: 'quest_failed(player, QuestId)',
    telemetryFields: ['questId', 'questTitle', 'reason'],
  },
  quest_abandon: {
    category: 'quest',
    verb: 'quest_abandon',
    requiresTarget: true,
    emitsEvent: 'quest_abandoned',
    prologPredicate: 'quest_abandoned(player, QuestId)',
    telemetryFields: ['questId', 'questTitle', 'reason', 'progressAtAbandonment'],
  },
} as const satisfies Record<ActivityVerb, ActivityDefinition>;

// ─── Helper Functions ───────────────────────────────────────────────────────

/** Get all activity definitions belonging to a category. */
export function getActivitiesByCategory(category: ActivityCategory): ActivityDefinition[] {
  return Object.values(ACTIVITY_TAXONOMY).filter(a => a.category === category);
}

/** Get the definition for a specific activity verb, or undefined if not found. */
export function getActivityDefinition(verb: string): ActivityDefinition | undefined {
  return (ACTIVITY_TAXONOMY as Record<string, ActivityDefinition>)[verb];
}

/** Check whether a string is a valid activity verb. */
export function isValidActivity(verb: string): verb is ActivityVerb {
  return verb in ACTIVITY_TAXONOMY;
}

/** Resolve an event name to its activity definition (for backward compat with GameEventBus). */
export function getActivityByEvent(eventName: string): ActivityDefinition | undefined {
  return Object.values(ACTIVITY_TAXONOMY).find(a => a.emitsEvent === eventName);
}

// ─── Backward Compatibility Aliases ─────────────────────────────────────────
// Maps old GameEventBus event names to canonical activity verbs.

export const LEGACY_EVENT_ALIASES: Readonly<Record<string, ActivityVerb>> = {
  'npc_talked': 'talk_to_npc',
  'item_collected': 'collect',
  'item_crafted': 'craft',
  'item_equipped': 'equip',
  'item_used': 'use',
  'item_dropped': 'drop',
  'item_delivered': 'give',
  'item_removed': 'sell',
  'enemy_defeated': 'defeat_enemy',
  'combat_action': 'attack',
  'location_visited': 'visit_location',
  'location_discovered': 'discover_location',
  'settlement_entered': 'enter_settlement',
  'reputation_changed': 'compliment',
  'puzzle_attempted': 'puzzle_attempt',
  'puzzle_solved': 'puzzle_solve',
  'puzzle_failed': 'puzzle_fail',
  'quest_accepted': 'quest_accept',
  'quest_completed': 'quest_complete',
  'quest_failed': 'quest_fail',
  'quest_abandoned': 'quest_abandon',
  'vocabulary_used': 'vocabulary_use',
  'grammar_attempted': 'grammar_attempt',
  'translation_attempted': 'translation',
  'pronunciation_attempted': 'pronunciation',
  'conversation_overheard': 'eavesdrop',
  'utterance_attempted': 'utterance_attempt',
  'romance_action': 'romance_action',
  'romance_stage_changed': 'propose',
};

// ─── Deprecated Aliases (backward compat) ───────────────────────────────────
// These re-export the old names so existing imports keep working.

/** @deprecated Use ActivityDefinition instead. */
export type ActivityTypeDefinition = ActivityDefinition;

/** @deprecated Use ACTIVITY_TAXONOMY instead. */
export const ACTIVITY_TYPE_MAP: Record<string, ActivityDefinition> = ACTIVITY_TAXONOMY;

/** @deprecated Use Object.values(ACTIVITY_TAXONOMY) instead. */
export const ALL_ACTIVITY_TYPES: ActivityDefinition[] = Object.values(ACTIVITY_TAXONOMY);
