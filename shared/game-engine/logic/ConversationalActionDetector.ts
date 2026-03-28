/**
 * Conversational Action Detector
 *
 * Detects specific conversational action patterns from player messages during
 * NPC dialogue. These actions map to quest objective completion criteria,
 * enabling quests to require specific conversational behaviors (asking about
 * topics, using target language, answering questions, etc.).
 *
 * Separated from BabylonChatPanel to keep pattern matching logic testable
 * and decoupled from UI concerns.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type ConversationalActionType =
  | 'asked_about_topic'
  | 'used_target_language'
  | 'answered_question'
  | 'requested_information'
  | 'made_introduction';

export interface ConversationalAction {
  action: ConversationalActionType;
  /** Topic slug for asked_about_topic (e.g. 'missing_writer', 'local_history') */
  topic?: string;
  /** NPC being spoken to */
  npcId: string;
  /** Quest ID if determinable from context */
  questId?: string;
}

export interface DetectorContext {
  npcId: string;
  /** The NPC's last message (to detect if player is answering a question) */
  npcMessage: string;
  /** The player's message */
  playerMessage: string;
  /** Target language code (e.g. 'fr', 'es') */
  targetLanguage?: string;
  /** Active quest IDs with their topic keywords */
  questTopics?: Array<{ questId: string; keywords: string[] }>;
}

/** Per-NPC conversation turn counter state */
export interface NpcConversationTurnState {
  npcId: string;
  totalTurns: number;
  meaningfulTurns: number;
}

// ── Topic keyword dictionaries ───────────────────────────────────────────────

const INFORMATION_REQUEST_PATTERNS = [
  /where\s+(is|are|can|do)/i,
  /how\s+(do|can|does|to)/i,
  /can\s+you\s+(tell|show|help|direct)/i,
  /could\s+you\s+(tell|show|help|direct)/i,
  /do\s+you\s+know\s+(where|how|what|who)/i,
  /what\s+(is|are|does)/i,
  /who\s+(is|are|knows)/i,
  /which\s+way/i,
  /point\s+me/i,
  /looking\s+for/i,
  /need\s+(to\s+find|help|directions)/i,
];

const INTRODUCTION_PATTERNS = [
  /\bmy\s+name\s+is\b/i,
  /\bi\s*(?:am|'m)\s+[A-Z]/,
  /\bcall\s+me\b/i,
  /\bje\s+m'appelle\b/i,    // French
  /\bme\s+llamo\b/i,        // Spanish
  /\bich\s+hei[sß]e\b/i,    // German
  /\bnice\s+to\s+meet\b/i,
  /\bpleased\s+to\s+meet\b/i,
  /\benchanté/i,             // French
  /\bmucho\s+gusto\b/i,     // Spanish
];

const QUESTION_INDICATORS = [
  /\?\s*$/,
  /^(who|what|where|when|why|how|which|do|does|did|is|are|was|were|can|could|will|would|shall|should|have|has|had)\b/i,
];

// Common target-language word patterns (French-focused but extensible)
const TARGET_LANGUAGE_INDICATORS: Record<string, RegExp[]> = {
  fr: [
    /\b(je|tu|il|elle|nous|vous|ils|elles)\b/i,
    /\b(le|la|les|un|une|des)\b/i,
    /\b(est|suis|sont|avez|avons|ont|fait)\b/i,
    /\b(oui|non|merci|bonjour|salut|au revoir|s'il vous plaît|pardon)\b/i,
    /[àâäéèêëïîôùûüÿçœæ]/,
  ],
  es: [
    /\b(yo|tú|él|ella|nosotros|ustedes|ellos|ellas)\b/i,
    /\b(el|la|los|las|un|una|unos|unas)\b/i,
    /\b(es|soy|son|tiene|tienen|hace|hacen)\b/i,
    /\b(sí|no|gracias|hola|adiós|por favor|perdón)\b/i,
    /[áéíóúñ¿¡ü]/,
  ],
};

// ── Detector ─────────────────────────────────────────────────────────────────

export class ConversationalActionDetector {
  private npcTurnCounts = new Map<string, NpcConversationTurnState>();

  /**
   * Detect all conversational actions from a single exchange.
   * Returns zero or more actions detected from the player's message.
   */
  detect(ctx: DetectorContext): ConversationalAction[] {
    const actions: ConversationalAction[] = [];
    const { playerMessage, npcMessage, npcId, targetLanguage, questTopics } = ctx;

    // 1. asked_about_topic — player message contains quest-relevant keywords
    if (questTopics) {
      for (const qt of questTopics) {
        if (this.matchesTopic(playerMessage, qt.keywords)) {
          actions.push({
            action: 'asked_about_topic',
            topic: qt.keywords[0], // use first keyword as topic slug
            npcId,
            questId: qt.questId,
          });
        }
      }
    }

    // 2. used_target_language — player wrote in the target language
    if (targetLanguage && this.isTargetLanguage(playerMessage, targetLanguage)) {
      actions.push({ action: 'used_target_language', npcId });
    }

    // 3. answered_question — player responded to NPC's question
    if (this.isAnsweringQuestion(npcMessage, playerMessage)) {
      actions.push({ action: 'answered_question', npcId });
    }

    // 4. requested_information — player asked for directions/help
    if (this.isRequestingInformation(playerMessage)) {
      actions.push({ action: 'requested_information', npcId });
    }

    // 5. made_introduction — player introduced themselves
    if (this.isIntroduction(playerMessage)) {
      actions.push({ action: 'made_introduction', npcId });
    }

    return actions;
  }

  /**
   * Record a conversation turn and return updated state for the NPC.
   * A turn is "meaningful" if the player message has > 5 words in the
   * target language.
   */
  recordTurn(
    npcId: string,
    playerMessage: string,
    targetLanguage?: string,
  ): NpcConversationTurnState {
    let state = this.npcTurnCounts.get(npcId);
    if (!state) {
      state = { npcId, totalTurns: 0, meaningfulTurns: 0 };
      this.npcTurnCounts.set(npcId, state);
    }

    state.totalTurns++;

    const words = playerMessage.trim().split(/\s+/).filter(w => w.length > 0);
    const isMeaningful = words.length > 5 &&
      (!targetLanguage || this.isTargetLanguage(playerMessage, targetLanguage));
    if (isMeaningful) {
      state.meaningfulTurns++;
    }

    return { ...state };
  }

  /** Get conversation turn state for an NPC. */
  getTurnState(npcId: string): NpcConversationTurnState | undefined {
    const state = this.npcTurnCounts.get(npcId);
    return state ? { ...state } : undefined;
  }

  /** Reset turn counts (e.g. on new playthrough). */
  resetTurnCounts(): void {
    this.npcTurnCounts.clear();
  }

  // ── Private detection methods ──────────────────────────────────────────

  private matchesTopic(message: string, keywords: string[]): boolean {
    const lowerMsg = message.toLowerCase();
    const words = new Set(
      lowerMsg.replace(/[^\wà-ÿ\s]/gi, '').split(/\s+/),
    );
    let matchCount = 0;
    for (const kw of keywords) {
      if (words.has(kw.toLowerCase()) || lowerMsg.includes(kw.toLowerCase())) {
        matchCount++;
      }
    }
    // Require at least 1 keyword match for topic detection
    return matchCount >= 1;
  }

  private isTargetLanguage(message: string, langCode: string): boolean {
    const patterns = TARGET_LANGUAGE_INDICATORS[langCode];
    if (!patterns) {
      // Fallback: check for accented characters common in non-English
      return /[à-ÿÀ-ŸœŒæÆçÇñÑ¿¡]/.test(message);
    }
    let matchCount = 0;
    for (const pattern of patterns) {
      if (pattern.test(message)) matchCount++;
    }
    // Require at least 2 indicator matches to confirm target language
    return matchCount >= 2;
  }

  private isAnsweringQuestion(npcMessage: string, playerMessage: string): boolean {
    // NPC asked a question if their message ends with ? or starts with question word
    const npcAskedQuestion = QUESTION_INDICATORS.some(p => p.test(npcMessage));
    if (!npcAskedQuestion) return false;

    // Player's response should be substantive (more than just a single word)
    const words = playerMessage.trim().split(/\s+/);
    return words.length >= 2;
  }

  private isRequestingInformation(message: string): boolean {
    return INFORMATION_REQUEST_PATTERNS.some(p => p.test(message));
  }

  private isIntroduction(message: string): boolean {
    return INTRODUCTION_PATTERNS.some(p => p.test(message));
  }
}
