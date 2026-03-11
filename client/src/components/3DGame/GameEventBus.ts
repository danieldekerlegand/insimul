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
  | { type: 'item_unequipped'; itemId: string; itemName: string; slot: string };

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
