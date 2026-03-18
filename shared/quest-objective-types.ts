/**
 * Canonical Quest Objective Types
 *
 * This module defines the ONLY objective types that are achievable within the
 * game's mechanics. Every quest objective MUST use one of these types.
 *
 * Each type maps to a handler in the game client:
 *   - QuestObjectManager (most types)
 *   - UtteranceQuestSystem (pronunciation)
 *   - VisualVocabularyDetector (identify_object)
 *   - VocabularyCollectionSystem (collect_vocabulary)
 */

// ── Canonical objective types ────────────────────────────────────────────────

export interface ObjectiveTypeInfo {
  /** Machine-readable type key used in objective.type */
  type: string;
  /** Human description for LLM prompt context */
  description: string;
  /** What the player physically does in the game */
  playerAction: string;
  /** Whether this type requires a target entity (NPC, item, location) */
  requiresTarget: 'npc' | 'item' | 'location' | 'none';
  /** Whether this type supports a requiredCount > 1 */
  countable: boolean;
}

export const ACHIEVABLE_OBJECTIVE_TYPES: ObjectiveTypeInfo[] = [
  // ── Movement / Exploration ───────────────────────────────────────────────
  {
    type: 'visit_location',
    description: 'Go to a specific location in the game world',
    playerAction: 'Walk to a location marker',
    requiresTarget: 'location',
    countable: false,
  },
  {
    type: 'discover_location',
    description: 'Discover a new location by entering its area',
    playerAction: 'Walk into a new area for the first time',
    requiresTarget: 'location',
    countable: false,
  },

  // ── NPC Interaction ──────────────────────────────────────────────────────
  {
    type: 'talk_to_npc',
    description: 'Talk to a specific NPC character',
    playerAction: 'Press G near an NPC to start a conversation',
    requiresTarget: 'npc',
    countable: true,
  },
  {
    type: 'complete_conversation',
    description: 'Complete a multi-turn conversation (with keyword usage or turn count)',
    playerAction: 'Have a sustained back-and-forth dialogue with NPCs',
    requiresTarget: 'none',
    countable: true,
  },

  // ── Vocabulary & Language ────────────────────────────────────────────────
  {
    type: 'use_vocabulary',
    description: 'Use specific target-language words in conversation',
    playerAction: 'Type or speak target-language words during NPC dialogue',
    requiresTarget: 'none',
    countable: true,
  },
  {
    type: 'collect_vocabulary',
    description: 'Collect vocabulary words by interacting with labeled world objects',
    playerAction: 'Walk near objects with vocabulary labels to add words to vocabulary bank',
    requiresTarget: 'none',
    countable: true,
  },
  {
    type: 'identify_object',
    description: 'Identify an object by typing its name in the target language',
    playerAction: 'Click an object and type its target-language name',
    requiresTarget: 'none',
    countable: true,
  },

  // ── Items & Inventory ────────────────────────────────────────────────────
  {
    type: 'collect_item',
    description: 'Pick up or collect a specific item in the world',
    playerAction: 'Walk to an item and pick it up',
    requiresTarget: 'item',
    countable: true,
  },
  {
    type: 'deliver_item',
    description: 'Bring a specific item to a specific NPC',
    playerAction: 'Talk to target NPC while holding the quest item',
    requiresTarget: 'npc',
    countable: false,
  },

  // ── Combat ───────────────────────────────────────────────────────────────
  {
    type: 'defeat_enemies',
    description: 'Defeat enemies in combat',
    playerAction: 'Fight and defeat enemies using F key',
    requiresTarget: 'none',
    countable: true,
  },

  // ── Crafting ─────────────────────────────────────────────────────────────
  {
    type: 'craft_item',
    description: 'Craft a specific item using the crafting system',
    playerAction: 'Gather materials and craft the item at a crafting station',
    requiresTarget: 'item',
    countable: true,
  },

  // ── Escort & Arrival ─────────────────────────────────────────────────────
  {
    type: 'escort_npc',
    description: 'Escort an NPC safely to a destination',
    playerAction: 'Walk alongside an NPC to guide them to a location',
    requiresTarget: 'npc',
    countable: false,
  },

  // ── Social / Relationships ──────────────────────────────────────────────
  {
    type: 'build_friendship',
    description: 'Build a friendship with an NPC through repeated conversations',
    playerAction: 'Have multiple conversations with the same NPC to build rapport',
    requiresTarget: 'npc',
    countable: true,
  },
  {
    type: 'give_gift',
    description: 'Give a gift item to an NPC to strengthen a relationship',
    playerAction: 'Collect an item and present it to an NPC during conversation',
    requiresTarget: 'npc',
    countable: false,
  },

  // ── Reputation ───────────────────────────────────────────────────────────
  {
    type: 'gain_reputation',
    description: 'Gain reputation with a faction through positive actions',
    playerAction: 'Complete tasks and interactions that improve faction standing',
    requiresTarget: 'none',
    countable: false,
  },

  // ── Listening & Comprehension ────────────────────────────────────────────
  {
    type: 'listening_comprehension',
    description: 'Listen to an NPC story and answer comprehension questions',
    playerAction: 'Trigger NPC story, listen, then answer questions about it',
    requiresTarget: 'npc',
    countable: true,
  },

  // ── Translation ──────────────────────────────────────────────────────────
  {
    type: 'translation_challenge',
    description: 'Translate phrases between English and the target language',
    playerAction: 'Type translations of prompted phrases',
    requiresTarget: 'none',
    countable: true,
  },

  // ── Navigation (language-based) ──────────────────────────────────────────
  {
    type: 'navigate_language',
    description: 'Follow directions given in the target language to reach waypoints',
    playerAction: 'Read/listen to target-language directions and walk to each waypoint',
    requiresTarget: 'location',
    countable: false,
  },
  {
    type: 'follow_directions',
    description: 'Follow step-by-step directions in the target language',
    playerAction: 'Interpret target-language instructions and follow them physically',
    requiresTarget: 'none',
    countable: true,
  },

  // ── Pronunciation ────────────────────────────────────────────────────────
  {
    type: 'pronunciation_check',
    description: 'Pronounce phrases aloud and get accuracy feedback',
    playerAction: 'Press R to record voice and pronounce target-language phrases',
    requiresTarget: 'none',
    countable: true,
  },

  // ── Language Learning Actions ──────────────────────────────────────────
  {
    type: 'examine_object',
    description: 'Inspect a world object to see its name in the target language',
    playerAction: 'Press X near an object or click it to examine and learn its name',
    requiresTarget: 'item',
    countable: true,
  },
  {
    type: 'read_sign',
    description: 'Read text on signs, menus, or books written in the target language',
    playerAction: 'Approach a sign or readable surface and press X to read it',
    requiresTarget: 'item',
    countable: true,
  },
  {
    type: 'write_response',
    description: 'Compose written text in the target language in response to a prompt',
    playerAction: 'Type a written response in the target language when prompted',
    requiresTarget: 'none',
    countable: true,
  },
  {
    type: 'listen_and_repeat',
    description: 'Listen to an NPC phrase and repeat it back via speech',
    playerAction: 'Listen to the NPC, then press R to record and repeat the phrase',
    requiresTarget: 'npc',
    countable: true,
  },
  {
    type: 'point_and_name',
    description: 'Point at an object and name it in the target language',
    playerAction: 'Click an object and type or speak its target-language name',
    requiresTarget: 'item',
    countable: true,
  },
  {
    type: 'ask_for_directions',
    description: 'Ask an NPC for directions using the target language',
    playerAction: 'Talk to an NPC and request directions in the target language',
    requiresTarget: 'npc',
    countable: true,
  },
  {
    type: 'order_food',
    description: 'Order food or drinks at a restaurant or market in the target language',
    playerAction: 'Talk to a vendor NPC and order items in the target language',
    requiresTarget: 'npc',
    countable: true,
  },
  {
    type: 'haggle_price',
    description: 'Negotiate a price with a merchant in the target language',
    playerAction: 'Talk to a merchant NPC and negotiate the price in the target language',
    requiresTarget: 'npc',
    countable: true,
  },
  {
    type: 'introduce_self',
    description: 'Introduce yourself to an NPC in the target language',
    playerAction: 'Talk to an NPC and introduce yourself in the target language',
    requiresTarget: 'npc',
    countable: false,
  },
  {
    type: 'describe_scene',
    description: 'Describe what you see in the current location in the target language',
    playerAction: 'Type or speak a description of the scene in the target language',
    requiresTarget: 'none',
    countable: true,
  },

  // ── Teaching (player teaches NPC) ────────────────────────────────────────
  {
    type: 'teach_vocabulary',
    description: 'Teach vocabulary words to an NPC by using them in conversation and confirming the NPC learned them',
    playerAction: 'Talk to an NPC learner and use target-language words until the NPC demonstrates understanding',
    requiresTarget: 'npc',
    countable: true,
  },
  {
    type: 'teach_phrase',
    description: 'Teach a phrase or sentence to an NPC by modeling it and having the NPC repeat it',
    playerAction: 'Talk to an NPC learner, model a phrase, and confirm they can repeat it',
    requiresTarget: 'npc',
    countable: true,
  },
];

// ── Lookup set for fast validation ───────────────────────────────────────────

export const VALID_OBJECTIVE_TYPES = new Set(
  ACHIEVABLE_OBJECTIVE_TYPES.map(t => t.type),
);

// ── Normalization map ────────────────────────────────────────────────────────
// Maps common AI-generated or legacy objective type strings to canonical types.

const NORMALIZATION_MAP: Record<string, string> = {
  // AI tends to generate these
  'talk_to': 'talk_to_npc',
  'talk': 'talk_to_npc',
  'speak_to': 'talk_to_npc',
  'speak_with': 'talk_to_npc',
  'converse': 'talk_to_npc',
  'converse_with': 'talk_to_npc',
  'interview': 'talk_to_npc',
  'greet': 'talk_to_npc',
  'meet': 'talk_to_npc',
  'ask': 'talk_to_npc',

  'reach_location': 'visit_location',
  'go_to': 'visit_location',
  'travel_to': 'visit_location',
  'find_location': 'visit_location',
  'explore': 'discover_location',
  'explore_area': 'discover_location',
  'discover': 'discover_location',
  'investigate': 'visit_location',
  'investigate_location': 'visit_location',
  'search_area': 'visit_location',

  'collect': 'collect_item',
  'gather': 'collect_item',
  'pick_up': 'collect_item',
  'find_item': 'collect_item',
  'obtain': 'collect_item',
  'acquire': 'collect_item',
  'buy_item': 'collect_item',
  'purchase': 'collect_item',
  'purchase_item': 'collect_item',
  'shop': 'collect_item',
  'shop_for': 'collect_item',
  'buy_from': 'collect_item',
  'collect_items': 'collect_item',

  'deliver': 'deliver_item',
  'bring_item': 'deliver_item',
  'give_item': 'deliver_item',
  'hand_over': 'deliver_item',

  'kill': 'defeat_enemies',
  'defeat': 'defeat_enemies',
  'fight': 'defeat_enemies',
  'combat': 'defeat_enemies',
  'slay': 'defeat_enemies',
  'eliminate': 'defeat_enemies',

  'craft': 'craft_item',
  'create_item': 'craft_item',
  'build': 'craft_item',

  'escort': 'escort_npc',
  'protect': 'escort_npc',
  'accompany': 'escort_npc',
  'guard': 'escort_npc',

  'befriend': 'build_friendship',
  'befriend_npc': 'build_friendship',
  'make_friend': 'build_friendship',
  'friendship': 'build_friendship',
  'build_rapport': 'build_friendship',
  'bond_with': 'build_friendship',
  'socialize': 'build_friendship',

  'gift': 'give_gift',
  'present_gift': 'give_gift',
  'give_present': 'give_gift',
  'gift_item': 'give_gift',
  'offer_gift': 'give_gift',

  'reputation': 'gain_reputation',
  'improve_standing': 'gain_reputation',

  'listen': 'listening_comprehension',
  'comprehension': 'listening_comprehension',
  'listen_to_story': 'listening_comprehension',
  'answer_questions': 'listening_comprehension',

  'translate': 'translation_challenge',
  'translation': 'translation_challenge',

  'navigate': 'navigate_language',
  'follow_path': 'follow_directions',
  'follow_route': 'follow_directions',

  'pronounce': 'pronunciation_check',
  'speak_aloud': 'pronunciation_check',
  'read_aloud': 'pronunciation_check',

  'use_words': 'use_vocabulary',
  'vocabulary_usage': 'use_vocabulary',
  'practice_vocabulary': 'use_vocabulary',
  'use_word': 'use_vocabulary',

  'identify': 'identify_object',
  'name_object': 'identify_object',
  'label_object': 'identify_object',

  'learn_vocabulary': 'collect_vocabulary',
  'collect_words': 'collect_vocabulary',
  'find_words': 'collect_vocabulary',

  // Business scavenger hunt aliases
  'visit_business': 'visit_location',
  'enter_business': 'visit_location',
  'enter_shop': 'visit_location',
  'visit_shop': 'visit_location',
  'identify_business_item': 'identify_object',
  'name_item': 'identify_object',
  'name_business_item': 'identify_object',
  'find_item_in_business': 'identify_object',
  'get_clue': 'talk_to_npc',
  'get_clue_from_owner': 'talk_to_npc',
  'ask_owner': 'talk_to_npc',
  'collect_business_item': 'collect_item',

  // Language learning action aliases
  'examine': 'examine_object',
  'inspect_object': 'examine_object',
  'inspect': 'examine_object',
  'read': 'read_sign',
  'read_text': 'read_sign',
  'read_menu': 'read_sign',
  'write': 'write_response',
  'compose': 'write_response',
  'repeat': 'listen_and_repeat',
  'repeat_phrase': 'listen_and_repeat',
  'name': 'point_and_name',
  'label': 'point_and_name',
  'ask_directions': 'ask_for_directions',
  'get_directions': 'ask_for_directions',
  'order': 'order_food',
  'order_at_restaurant': 'order_food',
  'haggle': 'haggle_price',
  'negotiate': 'haggle_price',
  'negotiate_price': 'haggle_price',
  'introduce': 'introduce_self',
  'introduction': 'introduce_self',
  'describe': 'describe_scene',
  'describe_surroundings': 'describe_scene',

  // Storytelling / narrative quest aliases
  'tell_story': 'complete_conversation',
  'retell_story': 'complete_conversation',
  'narrate': 'complete_conversation',
  'storytelling': 'complete_conversation',
  'collaborative_story': 'complete_conversation',
  'retell': 'complete_conversation',

  // Legacy template types that need normalization
  'learn_new_words': 'collect_vocabulary',
  'find_vocabulary_items': 'identify_object',
  'use_vocabulary_category': 'use_vocabulary',
  'master_words': 'use_vocabulary',
  'sustained_conversation': 'complete_conversation',
  'practice_grammar': 'use_vocabulary',

  // SRS / spaced repetition review variations
  'review_vocabulary': 'use_vocabulary',
  'vocabulary_review': 'use_vocabulary',
  'srs_review': 'use_vocabulary',
  'spaced_repetition': 'use_vocabulary',
  'review_words': 'use_vocabulary',
  'practice_words': 'use_vocabulary',
  'reinforce_vocabulary': 'use_vocabulary',
  'recall_vocabulary': 'use_vocabulary',

  // Teaching-back objective aliases
  'teach_word': 'teach_vocabulary',
  'teach_words': 'teach_vocabulary',
  'teach_npc_vocabulary': 'teach_vocabulary',
  'teach_npc_words': 'teach_vocabulary',
  'teach_npc': 'teach_vocabulary',
  'tutor_vocabulary': 'teach_vocabulary',
  'teach_sentence': 'teach_phrase',
  'teach_npc_phrase': 'teach_phrase',
  'teach_expression': 'teach_phrase',
  'model_phrase': 'teach_phrase',
  'tutor_phrase': 'teach_phrase',

  // Grammar-focused objective aliases (map to canonical types)
  'grammar_pattern': 'use_vocabulary',
  'grammar_practice': 'use_vocabulary',
  'grammar_drill': 'use_vocabulary',
  'conjugation': 'use_vocabulary',
  'conjugate': 'use_vocabulary',
  'grammar_conversation': 'complete_conversation',
  'grammar_focus': 'complete_conversation',
};

/**
 * Normalize an objective type to its canonical form.
 * Returns the canonical type if found, or null if the type is unrecognizable.
 */
export function normalizeObjectiveType(type: string): string | null {
  if (!type) return null;

  const cleaned = type.toLowerCase().trim();

  // Already canonical
  if (VALID_OBJECTIVE_TYPES.has(cleaned)) return cleaned;

  // Try normalization map
  if (NORMALIZATION_MAP[cleaned]) return NORMALIZATION_MAP[cleaned];

  // Try with underscores replaced by spaces and vice versa
  const withUnderscores = cleaned.replace(/\s+/g, '_');
  if (VALID_OBJECTIVE_TYPES.has(withUnderscores)) return withUnderscores;
  if (NORMALIZATION_MAP[withUnderscores]) return NORMALIZATION_MAP[withUnderscores];

  return null;
}

/**
 * Validate and normalize an array of quest objectives in-place.
 * - Normalizes known types to canonical forms
 * - Removes objectives with unrecognizable types
 * Returns the filtered array of valid objectives.
 */
export function validateAndNormalizeObjectives(
  objectives: Array<{ type: string; [key: string]: any }>,
): Array<{ type: string; [key: string]: any }> {
  return objectives
    .map(obj => {
      const normalized = normalizeObjectiveType(obj.type);
      if (!normalized) {
        console.warn(
          `[QuestObjectiveTypes] Dropping unachievable objective type: "${obj.type}"`,
        );
        return null;
      }
      return { ...obj, type: normalized };
    })
    .filter((obj): obj is NonNullable<typeof obj> => obj !== null);
}

// ── LLM prompt helper ────────────────────────────────────────────────────────

/**
 * Build the objective type constraint block for AI quest generation prompts.
 * This tells the LLM exactly which objective types it can use.
 */
export function buildObjectiveTypePrompt(): string {
  const lines = ACHIEVABLE_OBJECTIVE_TYPES.map(
    t => `  - "${t.type}": ${t.description} (player: ${t.playerAction})`,
  );

  return `IMPORTANT: Quest objectives MUST use ONLY these achievable objective types.
The game can only track and complete objectives of these specific types.
Do NOT invent new objective types — use only the types listed below.

ALLOWED OBJECTIVE TYPES:
${lines.join('\n')}

Each objective must have:
- "type": one of the allowed types above (exact string match)
- "description": human-readable description of what the player should do
- "target": the NPC name, item name, or location name (if applicable)
- "required": number of times to complete (default 1)`;
}
