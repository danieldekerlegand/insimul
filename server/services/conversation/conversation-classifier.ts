/**
 * Conversation Classifier for Tiered LLM Routing
 *
 * Classifies conversation turns as FAST or FULL to determine which model
 * tier to use. FAST tier uses a lighter, faster model for simple exchanges;
 * FULL tier uses the primary model for complex conversations.
 */

// ── Types ─────────────────────────────────────────────────────────────

export type ModelTier = 'fast' | 'full';

export interface ClassificationInput {
  /** The user's message text */
  message: string;
  /** Turn number in the conversation (1 = first) */
  turnNumber: number;
  /** Whether this conversation involves an active quest */
  isQuestConversation?: boolean;
  /** Whether this is an NPC-NPC ambient conversation */
  isNpcToNpc?: boolean;
  /** Player's CEFR level */
  cefrLevel?: string;
  /** System prompt (used to detect quest-bearing NPCs) */
  systemPrompt?: string;
}

export interface ClassificationResult {
  tier: ModelTier;
  reason: string;
}

// ── Patterns ──────────────────────────────────────────────────────────

/** Simple greeting patterns (case-insensitive) */
const GREETING_PATTERNS = /^(hi|hello|hey|bonjour|salut|bonsoir|coucou|yo|hola|howdy|sup|what'?s up|good (morning|afternoon|evening|day))[\s!?.]*$/i;

/** Simple farewell patterns */
const FAREWELL_PATTERNS = /^(bye|goodbye|au revoir|adieu|see (you|ya)|later|ciao|bonne (nuit|journée)|à bientôt|à plus)[\s!?.]*$/i;

/** Simple social patterns (very short, formulaic responses) */
const SIMPLE_SOCIAL_PATTERNS = /^(yes|no|ok|okay|sure|thanks|thank you|merci|please|s'il vous plaît|oui|non|d'accord|bien sûr|how are you|comment allez-vous|comment ça va|ça va|who are you|what do you do|where am I|tell me about yourself)[\s!?.]*$/i;

/** Quest-related keywords in user messages */
const QUEST_KEYWORDS = /\b(quest|mission|task|objective|help me|need help|looking for|cherche|aide|besoin|find|retrieve|deliver|defeat|solve|puzzle|clue|reward|item|artifact)\b/i;

/** Complex language indicators for B1+ */
const COMPLEX_LANGUAGE_INDICATORS = /\b(explain|describe|why|because|however|although|therefore|nevertheless|furthermore|moreover|conditional|subjunctive|hypothesis)\b/i;

// ── Classifier ────────────────────────────────────────────────────────

/**
 * Classify a conversation turn to determine which model tier to use.
 *
 * FAST tier (lighter model, lower maxTokens):
 *  - Greetings and farewells
 *  - Simple social exchanges
 *  - NPC-NPC ambient conversations (unless quest-relevant)
 *  - Non-quest follow-ups with short messages
 *
 * FULL tier (primary model):
 *  - Quest conversations
 *  - B1+ complex language exchanges
 *  - Long or complex user messages
 *  - First turns with quest-bearing NPCs
 */
export function classifyConversation(input: ClassificationInput): ClassificationResult {
  const { message, turnNumber, isQuestConversation, isNpcToNpc, cefrLevel, systemPrompt } = input;
  const trimmed = message.trim();

  // Quest conversations always use FULL tier
  if (isQuestConversation) {
    return { tier: 'full', reason: 'quest_conversation' };
  }

  // Check system prompt for quest-related NPC indicators
  if (systemPrompt && hasQuestIndicators(systemPrompt)) {
    return { tier: 'full', reason: 'quest_bearing_npc' };
  }

  // NPC-NPC ambient conversations default to FAST unless quest-relevant
  if (isNpcToNpc) {
    return { tier: 'fast', reason: 'npc_to_npc_ambient' };
  }

  // B1+ with complex language patterns → FULL
  if (cefrLevel && isAdvancedCefrLevel(cefrLevel) && COMPLEX_LANGUAGE_INDICATORS.test(trimmed)) {
    return { tier: 'full', reason: 'complex_language_b1_plus' };
  }

  // Simple greetings → FAST
  if (GREETING_PATTERNS.test(trimmed)) {
    return { tier: 'fast', reason: 'greeting' };
  }

  // Simple farewells → FAST
  if (FAREWELL_PATTERNS.test(trimmed)) {
    return { tier: 'fast', reason: 'farewell' };
  }

  // Simple social exchanges → FAST
  if (SIMPLE_SOCIAL_PATTERNS.test(trimmed)) {
    return { tier: 'fast', reason: 'simple_social' };
  }

  // Quest keywords in user message → FULL
  if (QUEST_KEYWORDS.test(trimmed)) {
    return { tier: 'full', reason: 'quest_keywords_detected' };
  }

  // Short follow-up messages (turn 2+, < 50 chars, no complex patterns, no questions) → FAST
  const hasQuestion = trimmed.includes('?') || /\b(quel|quelle|quels|quelles|qui|que|quoi|où|comment|pourquoi|combien|quand|est-ce que)\b/i.test(trimmed);
  if (turnNumber >= 2 && trimmed.length < 50 && !COMPLEX_LANGUAGE_INDICATORS.test(trimmed) && !hasQuestion) {
    return { tier: 'fast', reason: 'short_followup' };
  }

  // Long messages (> 200 chars) → FULL (likely complex)
  if (trimmed.length > 200) {
    return { tier: 'full', reason: 'long_message' };
  }

  // Default: FULL for safety (don't degrade quality unexpectedly)
  return { tier: 'full', reason: 'default' };
}

// ── Helpers ───────────────────────────────────────────────────────────

/** Check if a CEFR level is B1 or above */
function isAdvancedCefrLevel(level: string): boolean {
  const upper = level.toUpperCase();
  return upper === 'B1' || upper === 'B2' || upper === 'C1' || upper === 'C2';
}

/** Check if system prompt contains quest-related NPC indicators */
function hasQuestIndicators(systemPrompt: string): boolean {
  return /\b(quest[- ]?giver|quest[- ]?bearer|active quest|current objective|mission objective)\b/i.test(systemPrompt);
}
