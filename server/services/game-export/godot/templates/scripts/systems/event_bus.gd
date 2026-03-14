extends Node
class_name EventBus
## EventBus — autoloaded singleton.
## Centralized typed event system that bridges player actions to quest tracking
## and Prolog fact assertion. All game actions (combat, items, dialogue, etc.)
## emit events through this bus, which subscribers consume to update state.
##
## Mirrors GameEventBus.ts from the Babylon.js source.

## All 37 event type constants.
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
const EVENT_UTTERANCE_EVALUATED := "utterance_evaluated"
const EVENT_UTTERANCE_QUEST_PROGRESS := "utterance_quest_progress"
const EVENT_UTTERANCE_QUEST_COMPLETED := "utterance_quest_completed"
const EVENT_AMBIENT_CONVERSATION_STARTED := "ambient_conversation_started"
const EVENT_AMBIENT_CONVERSATION_ENDED := "ambient_conversation_ended"
const EVENT_VOCABULARY_OVERHEARD := "vocabulary_overheard"
const EVENT_STATE_CREATED_TRUTH := "state_created_truth"
const EVENT_STATE_EXPIRED_TRUTH := "state_expired_truth"
const EVENT_ROMANCE_ACTION := "romance_action"
const EVENT_ROMANCE_STAGE_CHANGED := "romance_stage_changed"
const EVENT_NPC_VOLITION_ACTION := "npc_volition_action"
const EVENT_PUZZLE_FAILED := "puzzle_failed"
const EVENT_QUEST_FAILED := "quest_failed"
const EVENT_QUEST_ABANDONED := "quest_abandoned"
const EVENT_CONVERSATION_OVERHEARD := "conversation_overheard"
const EVENT_CREATE_TRUTH := "create_truth"
# Assessment / onboarding events
const EVENT_ASSESSMENT_STARTED := "assessment_started"
const EVENT_ASSESSMENT_PHASE_STARTED := "assessment_phase_started"
const EVENT_ASSESSMENT_PHASE_COMPLETED := "assessment_phase_completed"
const EVENT_ASSESSMENT_TIER_CHANGE := "assessment_tier_change"
const EVENT_ASSESSMENT_COMPLETED := "assessment_completed"
const EVENT_ONBOARDING_STEP_STARTED := "onboarding_step_started"
const EVENT_ONBOARDING_STEP_COMPLETED := "onboarding_step_completed"
const EVENT_ONBOARDING_COMPLETED := "onboarding_completed"
const EVENT_PERIODIC_ASSESSMENT_TRIGGERED := "periodic_assessment_triggered"
const EVENT_ASSESSMENT_CONVERSATION_COMPLETED := "assessment_conversation_completed"
# Visual vocabulary quest events
const EVENT_VISUAL_VOCAB_PROMPTED := "visual_vocab_prompted"
const EVENT_VISUAL_VOCAB_ANSWERED := "visual_vocab_answered"
# Follow directions quest events
const EVENT_DIRECTION_STEP_COMPLETED := "direction_step_completed"
# Pronunciation quest events
const EVENT_PRONUNCIATION_ASSESSMENT_DATA := "pronunciation_assessment_data"
# Achievement events
const EVENT_ACHIEVEMENT_UNLOCKED := "achievement_unlocked"

## Valid event types for validation.
const VALID_EVENT_TYPES: Array[String] = [
	EVENT_ITEM_COLLECTED, EVENT_ENEMY_DEFEATED, EVENT_LOCATION_VISITED,
	EVENT_NPC_TALKED, EVENT_ITEM_DELIVERED, EVENT_VOCABULARY_USED,
	EVENT_CONVERSATION_TURN, EVENT_QUEST_ACCEPTED, EVENT_QUEST_COMPLETED,
	EVENT_COMBAT_ACTION, EVENT_REPUTATION_CHANGED, EVENT_ITEM_CRAFTED,
	EVENT_LOCATION_DISCOVERED, EVENT_SETTLEMENT_ENTERED, EVENT_PUZZLE_SOLVED,
	EVENT_ITEM_REMOVED, EVENT_ITEM_USED, EVENT_ITEM_DROPPED,
	EVENT_ITEM_EQUIPPED, EVENT_ITEM_UNEQUIPPED,
	EVENT_UTTERANCE_EVALUATED, EVENT_UTTERANCE_QUEST_PROGRESS,
	EVENT_UTTERANCE_QUEST_COMPLETED, EVENT_AMBIENT_CONVERSATION_STARTED,
	EVENT_AMBIENT_CONVERSATION_ENDED, EVENT_VOCABULARY_OVERHEARD,
	EVENT_STATE_CREATED_TRUTH, EVENT_STATE_EXPIRED_TRUTH,
	EVENT_ROMANCE_ACTION, EVENT_ROMANCE_STAGE_CHANGED,
	EVENT_NPC_VOLITION_ACTION, EVENT_PUZZLE_FAILED,
	EVENT_QUEST_FAILED, EVENT_QUEST_ABANDONED,
	EVENT_CONVERSATION_OVERHEARD, EVENT_CREATE_TRUTH,
	EVENT_ASSESSMENT_STARTED, EVENT_ASSESSMENT_PHASE_STARTED,
	EVENT_ASSESSMENT_PHASE_COMPLETED, EVENT_ASSESSMENT_TIER_CHANGE,
	EVENT_ASSESSMENT_COMPLETED, EVENT_ONBOARDING_STEP_STARTED,
	EVENT_ONBOARDING_STEP_COMPLETED, EVENT_ONBOARDING_COMPLETED,
	EVENT_PERIODIC_ASSESSMENT_TRIGGERED,
	EVENT_ASSESSMENT_CONVERSATION_COMPLETED,
	EVENT_VISUAL_VOCAB_PROMPTED,
	EVENT_VISUAL_VOCAB_ANSWERED,
	EVENT_DIRECTION_STEP_COMPLETED,
	EVENT_PRONUNCIATION_ASSESSMENT_DATA,
	EVENT_ACHIEVEMENT_UNLOCKED,
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
##   utterance_evaluated: {type, objective_id, input, score, passed, feedback}
##   utterance_quest_progress: {type, quest_id, objective_id, current, required, percentage}
##   utterance_quest_completed: {type, quest_id, objective_id, final_score, xp_awarded, pronunciation_bonus_xp?}
##   ambient_conversation_started: {type, conversation_id, participants, location_id, topic}
##   ambient_conversation_ended: {type, conversation_id, participants, duration_ms, vocabulary_count}
##   vocabulary_overheard: {type, word, translation, language, context, conversation_id, speaker_npc_id}
##   state_created_truth: {type, character_id, state_type, cause, title, content, entry_type}
##   state_expired_truth: {type, character_id, state_type, cause, title, content, entry_type}
##   romance_action:      {type, npc_id, npc_name, action_type, accepted, stage_change?}
##   romance_stage_changed: {type, npc_id, npc_name, from_stage, to_stage}
##   npc_volition_action: {type, npc_id, action_id, target_id, score}
##   puzzle_failed:       {type, puzzle_id, puzzle_type, attempts}
##   quest_failed:        {type, quest_id}
##   quest_abandoned:     {type, quest_id}
##   conversation_overheard: {type, npc_id_1, npc_id_2, topic, language_used}
##   create_truth:        {type, character_id, title, content, entry_type, category?}
##   assessment_started:  {type, session_id, instrument_id, phase, participant_id, assessment_type?, player_id?}
##   assessment_phase_started: {type, session_id, instrument_id, phase, phase_id?, phase_index?}
##   assessment_phase_completed: {type, session_id, instrument_id, phase, score, subscale_scores?, phase_id?, max_score?}
##   assessment_tier_change: {type, participant_id, instrument_id, from_tier, to_tier, score}
##   assessment_completed: {type, session_id, instrument_id, total_score, gain_score?, total_max_score?, cefr_level?}
##   onboarding_step_started: {type, step_id, step_index, total_steps}
##   onboarding_step_completed: {type, step_id, step_index, total_steps, duration_ms}
##   onboarding_completed: {type, total_steps, total_duration_ms}
##   periodic_assessment_triggered: {type, level, tier}
##   assessment_conversation_completed: {type, npc_id}
##   visual_vocab_prompted: {type, target_id, quest_id, objective_id, is_activity}
##   visual_vocab_answered: {type, target_id, quest_id, passed, score, player_answer}
##   direction_step_completed: {type, quest_id, objective_id, step_index, steps_completed, steps_required}
##   pronunciation_assessment_data: {type, quest_id, average_score, sample_count}
##   achievement_unlocked: {type, achievement_id, achievement_name, description, icon}
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
