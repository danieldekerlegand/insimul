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
  | { type: 'quest_accepted'; questId: string; questTitle: string; assignedByNpcId?: string; assignedByNpcName?: string }
  | { type: 'quest_completed'; questId: string; assignedByNpcId?: string }
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
  | { type: 'utterance_quest_completed'; questId: string; objectiveId: string; finalScore: number; xpAwarded: number; pronunciationBonusXp?: number }
  | { type: 'pronunciation_assessment_data'; questId: string; averageScore: number; sampleCount: number }
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
  | { type: 'quest_failed'; questId: string; assignedByNpcId?: string }
  | { type: 'quest_abandoned'; questId: string; assignedByNpcId?: string }
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
  | { type: 'onboarding_completed'; totalSteps: number; totalDurationMs: number }
  // Periodic assessment trigger (emitted when a level-up milestone requires a proficiency check)
  | { type: 'periodic_assessment_triggered'; level: number; tier: string }
  // Assessment conversation quest start (engine requests a waypoint on an NPC)
  | { type: 'assessment_conversation_quest_start'; phaseId: string; topics: string[]; minExchanges: number; maxExchanges: number }
  // Assessment conversation completed (player finished talking to NPC during assessment)
  | { type: 'assessment_conversation_completed'; npcId: string; score?: number }
  // Visual vocabulary events
  | { type: 'visual_vocab_prompted'; targetId: string; questId: string; objectiveId: string; isActivity: boolean }
  | { type: 'visual_vocab_answered'; targetId: string; questId: string; passed: boolean; score: number; playerAnswer: string }
  // Follow directions quest events
  | { type: 'direction_step_completed'; questId: string; objectiveId: string; stepIndex: number; stepsCompleted: number; stepsRequired: number }
  // Point-and-name vocabulary events
  | { type: 'object_named'; objectId: string; targetWord: string; category: string; correct: boolean; attempts: number }
  // Achievement events
  | { type: 'achievement_unlocked'; achievementId: string; achievementName: string; description: string; icon: string }
  // Quest notification & reminder events
  | { type: 'quest_reminder'; questId: string; questTitle: string; message: string; reminderType: 'idle' | 'proximity' | 'expiring' }
  | { type: 'quest_expired'; questId: string; questTitle: string }
  | { type: 'quest_milestone'; milestoneType: 'first_quest' | 'five_quests' | 'first_chain' | 'first_perfect'; label: string }
  | { type: 'daily_quests_reset' }
  // NPC exam events (reading/writing)
  | { type: 'npc_exam_requested'; npcId: string; npcName: string; examType: 'reading' | 'writing' | 'reading_writing'; businessContext?: string }
  // NPC exam events (listening comprehension)
  | { type: 'npc_exam_started'; examId: string; npcId: string; npcName: string; businessType: string; examType: 'listening_comprehension' }
  | { type: 'npc_exam_listening_ready'; examId: string; audioUrl?: string; passage: string; questions: Array<{ id: string; questionText: string; maxPoints: number }>; maxReplays: number }
  | { type: 'npc_exam_completed'; examId: string; npcId: string; score: number; maxScore: number; percentage: number; passed: boolean }
  // NPC-initiated conversation events
  | { type: 'npc_initiated_conversation'; npcId: string; npcName: string; accepted: boolean };

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
