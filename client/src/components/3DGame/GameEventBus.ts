/**
 * Game Event Bus
 *
 * Centralized typed event system that bridges player actions to quest tracking
 * and Prolog fact assertion. All game actions (combat, items, dialogue, etc.)
 * emit events through this bus, which subscribers (GamePrologEngine,
 * QuestObjectManager) consume to update state.
 */

// ── Event Types ─────────────────────────────────────────────────────────────

/** Optional taxonomy fields carried on item events for Prolog assertion. */
export interface ItemTaxonomy {
  category?: string;
  material?: string;
  baseType?: string;
  rarity?: string;
  itemType?: string;
}

export type GameEvent =
  | { type: 'item_collected'; itemId: string; itemName: string; quantity: number; taxonomy?: ItemTaxonomy }
  | { type: 'enemy_defeated'; entityId: string; enemyType: string }
  | { type: 'location_visited'; locationId: string; locationName: string }
  | { type: 'npc_talked'; npcId: string; npcName: string; turnCount: number }
  | { type: 'item_delivered'; npcId: string; itemId: string; itemName: string }
  | { type: 'vocabulary_used'; word: string; correct: boolean }
  | { type: 'conversation_turn'; npcId: string; keywords: string[] }
  | { type: 'quest_accepted'; questId: string; questTitle: string }
  | { type: 'quest_completed'; questId: string }
  | { type: 'combat_action'; actionType: string; targetId: string }
  | { type: 'reputation_changed'; factionId: string; delta: number }
  | { type: 'item_crafted'; itemId: string; itemName: string; quantity: number; taxonomy?: ItemTaxonomy }
  | { type: 'location_discovered'; locationId: string; locationName: string }
  | { type: 'settlement_entered'; settlementId: string; settlementName: string }
  | { type: 'puzzle_solved'; puzzleId: string }
  | { type: 'item_removed'; itemId: string; itemName: string; quantity: number }
  | { type: 'item_used'; itemId: string; itemName: string }
  | { type: 'item_dropped'; itemId: string; itemName: string; quantity: number }
  | { type: 'item_equipped'; itemId: string; itemName: string; slot: string }
  | { type: 'item_unequipped'; itemId: string; itemName: string; slot: string }
  | { type: 'utterance_evaluated'; objectiveId: string; input: string; score: number; passed: boolean; feedback: string }
  | { type: 'utterance_quest_progress'; questId: string; objectiveId: string; current: number; required: number; percentage: number }
  | { type: 'utterance_quest_completed'; questId: string; objectiveId: string; finalScore: number; xpAwarded: number }
  | { type: 'ambient_conversation_started'; conversationId: string; participants: [string, string]; locationId: string; topic: string }
  | { type: 'ambient_conversation_ended'; conversationId: string; participants: [string, string]; durationMs: number; vocabularyCount: number }
  | { type: 'vocabulary_overheard'; word: string; translation: string; language: string; context: string; conversationId: string; speakerNpcId: string }
  | { type: 'state_created_truth'; characterId: string; stateType: string; cause: string; title: string; content: string; entryType: 'event' }
  | { type: 'state_expired_truth'; characterId: string; stateType: string; cause: string; title: string; content: string; entryType: 'event' }
  // Romance events
  | { type: 'romance_action'; npcId: string; npcName: string; actionType: string; accepted: boolean; stageChange?: string }
  | { type: 'romance_stage_changed'; npcId: string; npcName: string; fromStage: string; toStage: string }
  // Volition events
  | { type: 'npc_volition_action'; npcId: string; actionId: string; targetId: string; score: number }
  // Puzzle events
  | { type: 'puzzle_failed'; puzzleId: string; puzzleType: string; attempts: number }
  // Quest events
  | { type: 'quest_failed'; questId: string }
  | { type: 'quest_abandoned'; questId: string }
  // Conversation eavesdrop
  | { type: 'conversation_overheard'; npcId1: string; npcId2: string; topic: string; languageUsed: string }
  // Truth creation (emitted when game events should be recorded as world truths)
  | { type: 'create_truth'; characterId: string; title: string; content: string; entryType: 'event' | 'fact' | 'secret'; category?: string }
  // Assessment events
  | { type: 'assessment_started'; sessionId: string; instrumentId: string; phase: string; participantId: string; assessmentType?: string; playerId?: string }
  | { type: 'assessment_phase_started'; sessionId: string; instrumentId: string; phase: string; phaseId?: string; phaseIndex?: number }
  | { type: 'assessment_phase_completed'; sessionId: string; instrumentId: string; phase: string; score: number; subscaleScores?: Record<string, number>; phaseId?: string; maxScore?: number }
  | { type: 'assessment_tier_change'; participantId: string; instrumentId: string; fromTier: string; toTier: string; score: number }
  | { type: 'assessment_completed'; sessionId: string; instrumentId: string; totalScore: number; gainScore?: number; totalMaxScore?: number; cefrLevel?: string }
  // Onboarding events
  | { type: 'onboarding_step_started'; stepId: string; stepIndex: number; totalSteps: number }
  | { type: 'onboarding_step_completed'; stepId: string; stepIndex: number; totalSteps: number; durationMs: number }
  | { type: 'onboarding_completed'; totalSteps: number; totalDurationMs: number };

export type GameEventType = GameEvent['type'];

type EventHandler = (event: GameEvent) => void;
type TypedHandler<T extends GameEventType> = (event: Extract<GameEvent, { type: T }>) => void;

// ── Event Bus ───────────────────────────────────────────────────────────────

export class GameEventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private globalHandlers = new Set<EventHandler>();

  /**
   * Subscribe to a specific event type.
   * Returns an unsubscribe function.
   */
  on<T extends GameEventType>(type: T, handler: TypedHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    const wrappedHandler = handler as EventHandler;
    this.handlers.get(type)!.add(wrappedHandler);
    return () => this.handlers.get(type)?.delete(wrappedHandler);
  }

  /**
   * Subscribe to all events.
   * Returns an unsubscribe function.
   */
  onAny(handler: EventHandler): () => void {
    this.globalHandlers.add(handler);
    return () => this.globalHandlers.delete(handler);
  }

  /**
   * Emit an event to all registered handlers.
   */
  emit(event: GameEvent): void {
    // Type-specific handlers
    const typeHandlers = this.handlers.get(event.type);
    if (typeHandlers) {
      typeHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (e) {
          console.error(`[GameEventBus] Error in handler for ${event.type}:`, e);
        }
      });
    }

    // Global handlers
    this.globalHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (e) {
        console.error(`[GameEventBus] Error in global handler:`, e);
      }
    });
  }

  /**
   * Remove all handlers.
   */
  dispose(): void {
    this.handlers.clear();
    this.globalHandlers.clear();
  }
}
