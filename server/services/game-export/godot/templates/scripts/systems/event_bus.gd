extends Node
class_name EventBus
## EventBus — autoloaded singleton.
## Centralized typed event system that bridges player actions to quest tracking
## and Prolog fact assertion. All game actions (combat, items, dialogue, etc.)
## emit events through this bus, which subscribers consume to update state.
##
## Mirrors GameEventBus.ts from the Babylon.js source.

## All 20 event type constants.
const EVENT_ITEM_COLLECTED := "item_collected"
const EVENT_ENEMY_DEFEATED := "enemy_defeated"
const EVENT_LOCATION_VISITED := "location_visited"
const EVENT_NPC_TALKED := "npc_talked"
const EVENT_ITEM_DELIVERED := "item_delivered"
const EVENT_VOCABULARY_USED := "vocabulary_used"
const EVENT_CONVERSATION_TURN := "conversation_turn"
const EVENT_QUEST_ACCEPTED := "quest_accepted"
const EVENT_QUEST_COMPLETED := "quest_completed"
const EVENT_COMBAT_ACTION := "combat_action"
const EVENT_REPUTATION_CHANGED := "reputation_changed"
const EVENT_ITEM_CRAFTED := "item_crafted"
const EVENT_LOCATION_DISCOVERED := "location_discovered"
const EVENT_SETTLEMENT_ENTERED := "settlement_entered"
const EVENT_PUZZLE_SOLVED := "puzzle_solved"
const EVENT_ITEM_REMOVED := "item_removed"
const EVENT_ITEM_USED := "item_used"
const EVENT_ITEM_DROPPED := "item_dropped"
const EVENT_ITEM_EQUIPPED := "item_equipped"
const EVENT_ITEM_UNEQUIPPED := "item_unequipped"

## Valid event types for validation.
const VALID_EVENT_TYPES: Array[String] = [
	EVENT_ITEM_COLLECTED, EVENT_ENEMY_DEFEATED, EVENT_LOCATION_VISITED,
	EVENT_NPC_TALKED, EVENT_ITEM_DELIVERED, EVENT_VOCABULARY_USED,
	EVENT_CONVERSATION_TURN, EVENT_QUEST_ACCEPTED, EVENT_QUEST_COMPLETED,
	EVENT_COMBAT_ACTION, EVENT_REPUTATION_CHANGED, EVENT_ITEM_CRAFTED,
	EVENT_LOCATION_DISCOVERED, EVENT_SETTLEMENT_ENTERED, EVENT_PUZZLE_SOLVED,
	EVENT_ITEM_REMOVED, EVENT_ITEM_USED, EVENT_ITEM_DROPPED,
	EVENT_ITEM_EQUIPPED, EVENT_ITEM_UNEQUIPPED,
]

## Handlers keyed by event type. Each value is an Array of Callables.
var _handlers: Dictionary = {}

## Global handlers that receive all events.
var _global_handlers: Array[Callable] = []


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

## Emit an event to all registered handlers.
## [param event] Dictionary with at least a "type" key.
## Expected payload shapes per type:
##   item_collected:      {type, item_id, item_name, quantity, taxonomy?}
##   enemy_defeated:      {type, entity_id, enemy_type}
##   location_visited:    {type, location_id, location_name}
##   npc_talked:          {type, npc_id, npc_name, turn_count}
##   item_delivered:      {type, npc_id, item_id, item_name}
##   vocabulary_used:     {type, word, correct}
##   conversation_turn:   {type, npc_id, keywords}
##   quest_accepted:      {type, quest_id, quest_title}
##   quest_completed:     {type, quest_id}
##   combat_action:       {type, action_type, target_id}
##   reputation_changed:  {type, faction_id, delta}
##   item_crafted:        {type, item_id, item_name, quantity, taxonomy?}
##   location_discovered: {type, location_id, location_name}
##   settlement_entered:  {type, settlement_id, settlement_name}
##   puzzle_solved:       {type, puzzle_id}
##   item_removed:        {type, item_id, item_name, quantity}
##   item_used:           {type, item_id, item_name}
##   item_dropped:        {type, item_id, item_name, quantity}
##   item_equipped:       {type, item_id, item_name, slot}
##   item_unequipped:     {type, item_id, item_name, slot}
##
## taxonomy (optional Dictionary): {category, material, base_type, rarity, item_type}
func emit_event(event: Dictionary) -> void:
	var event_type: String = event.get("type", "")
	if event_type.is_empty():
		push_error("[EventBus] Cannot emit event without a 'type' key.")
		return

	# Type-specific handlers
	if _handlers.has(event_type):
		var handlers: Array = _handlers[event_type]
		for handler: Callable in handlers:
			_safe_call(handler, event, event_type)

	# Global handlers
	for handler: Callable in _global_handlers:
		_safe_call(handler, event, "global")


## Subscribe to a specific event type. Returns the callable for later disconnect.
func connect_event(event_type: String, handler: Callable) -> Callable:
	if not _handlers.has(event_type):
		_handlers[event_type] = [] as Array[Callable]
	var handler_list: Array = _handlers[event_type]
	if handler not in handler_list:
		handler_list.append(handler)
	return handler


## Subscribe to all events. Returns the callable for later disconnect.
func connect_any(handler: Callable) -> Callable:
	if handler not in _global_handlers:
		_global_handlers.append(handler)
	return handler


## Disconnect a handler from a specific event type.
func disconnect_event(event_type: String, handler: Callable) -> void:
	if _handlers.has(event_type):
		var handler_list: Array = _handlers[event_type]
		handler_list.erase(handler)


## Disconnect a global handler.
func disconnect_any(handler: Callable) -> void:
	_global_handlers.erase(handler)


## Remove all handlers and reset state.
func dispose() -> void:
	_handlers.clear()
	_global_handlers.clear()
	print("[Insimul] EventBus disposed")


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

## Safely invoke a handler, catching errors.
func _safe_call(handler: Callable, event: Dictionary, context: String) -> void:
	if not handler.is_valid():
		push_error("[EventBus] Invalid handler in context '%s', skipping." % context)
		return
	handler.call(event)
