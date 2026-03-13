extends Node
## Prolog Engine — autoloaded singleton.
## Client-side Prolog runtime stub for exported games.
## Mirrors GamePrologEngine.ts from the Babylon.js source.
##
## Since Godot has no native Prolog runtime, this provides a string-based
## knowledge base with basic fact lookup.  Full Prolog unification is NOT
## performed — actions are allowed unless a matching "cannot_perform" fact
## exists, and quest/rule queries do simple substring matching against the KB.
##
## Supports event bus subscription, NPC intelligence queries, item taxonomy,
## personality/emotional state updates, and relationship tracking.

signal quest_completed(quest_id: String)

## Raw Prolog source text loaded from the server export.
var _kb_content: String = ""

## Dynamic facts asserted at runtime (inventory, game-state, events).
var _facts: Array[String] = []

## Whether initialize() has been called successfully.
var _initialized: bool = false

## IDs of quests currently being tracked for auto-completion.
var _active_quest_ids: Array[String] = []

# ---------------------------------------------------------------------------
# Initialization
# ---------------------------------------------------------------------------

## Load the knowledge base from exported game data.
## [param data] should contain a "content" key with the .pl text and
## optionally "characters", "settlements", "rules", "actions", "quests".
func initialize(data: Dictionary) -> void:
	_facts.clear()
	_kb_content = ""

	# Pre-generated Prolog content from the server export pipeline
	if data.has("content"):
		_kb_content = str(data["content"])

	# Assert character facts
	var characters: Array = data.get("characters", [])
	for ch in characters:
		var char_id: String = _sanitize(
			"%s_%s_%s" % [ch.get("firstName", ""), ch.get("lastName", ""), ch.get("id", "")]
		)
		_assert_internal("person(%s)" % char_id)
		if ch.has("firstName"):
			var full_name: String = "%s %s" % [ch.get("firstName", ""), ch.get("lastName", "")]
			_assert_internal("name(%s, '%s')" % [char_id, _escape(full_name.strip_edges())])
		if ch.has("age"):
			_assert_internal("age(%s, %s)" % [char_id, str(ch["age"])])
		if ch.has("occupation"):
			_assert_internal("occupation(%s, %s)" % [char_id, _sanitize(str(ch["occupation"]))])
		if ch.has("gender"):
			_assert_internal("gender(%s, %s)" % [char_id, _sanitize(str(ch["gender"]))])
		# Personality traits
		if ch.has("personality"):
			var p: Dictionary = ch["personality"]
			for trait_name in p:
				_assert_internal("personality(%s, %s, %s)" % [char_id, _sanitize(str(trait_name)), str(p[trait_name])])
		# Emotional state
		if ch.has("mood"):
			_assert_internal("mood(%s, %s)" % [char_id, _sanitize(str(ch["mood"]))])
		if ch.has("energy"):
			_assert_internal("energy(%s, %s)" % [char_id, str(ch["energy"])])

	# Assert settlement facts
	var settlements: Array = data.get("settlements", [])
	for s in settlements:
		var s_id: String = _sanitize(str(s.get("name", s.get("id", ""))))
		_assert_internal("settlement(%s)" % s_id)
		if s.has("type"):
			_assert_internal("settlement_type(%s, %s)" % [s_id, _sanitize(str(s["type"]))])

	# Append rule / action / quest Prolog content into the KB string
	for rule in data.get("rules", []):
		if rule.has("content") and not str(rule["content"]).is_empty():
			_kb_content += "\n" + str(rule["content"])
	for action in data.get("actions", []):
		if action.has("content") and not str(action["content"]).is_empty():
			_kb_content += "\n" + str(action["content"])
	for quest in data.get("quests", []):
		if quest.has("content") and not str(quest["content"]).is_empty():
			_kb_content += "\n" + str(quest["content"])

	_initialized = true
	print("[Insimul] PrologEngine initialized — KB %d chars, %d facts" % [_kb_content.length(), _facts.size()])


## Sync existing inventory items into the knowledge base.
func initialize_inventory(items: Array) -> void:
	if not _initialized:
		return
	for item in items:
		var item_name: String = _sanitize(str(item.get("name", item.get("id", ""))))
		_assert_internal("has(player, %s)" % item_name)
		if item.has("type") and not str(item["type"]).is_empty():
			_assert_internal("item_type(%s, %s)" % [item_name, _sanitize(str(item["type"]))])
		if item.has("value") and int(item["value"]) > 0:
			_assert_internal("item_value(%s, %d)" % [item_name, int(item["value"])])
	print("[Insimul] PrologEngine inventory: %d items" % items.size())


## Initialize world item definitions into the knowledge base (taxonomy, IS-A chains).
## Call at game start with all world items so Prolog knows about every item type.
func initialize_world_items(items: Array) -> void:
	if not _initialized:
		return
	for item in items:
		var item_name: String = _sanitize(str(item.get("name", item.get("id", ""))))
		if item.has("itemType") and not str(item["itemType"]).is_empty():
			_assert_internal("item_type(%s, %s)" % [item_name, _sanitize(str(item["itemType"]))])
		if item.has("value") and int(item["value"]) > 0:
			_assert_internal("item_value(%s, %d)" % [item_name, int(item["value"])])
		_assert_item_taxonomy(item_name, item)
	print("[Insimul] PrologEngine world items: %d definitions" % items.size())


## Load built-in IS-A reasoning rules so Prolog can reason hierarchically about items.
func load_item_reasoning_rules() -> void:
	if not _initialized:
		return
	var rules := """
% IS-A reasoning: an item is-a its category
item_is_a(Item, Category) :- item_category(Item, Category).
% IS-A reasoning: an item is-a its base type
item_is_a(Item, BaseType) :- item_base_type(Item, BaseType).
% IS-A reasoning: an item is-a its item type
item_is_a(Item, Type) :- item_type(Item, Type).

% Check if player has any item of a given category/type
has_item_of_type(Player, Type) :- has(Player, Item), item_is_a(Item, Type).

% Check if player has at least N of an item
has_at_least(Player, Item, N) :- has_item(Player, Item, Qty), Qty >= N.
"""
	_kb_content += "\n" + rules
	print("[Insimul] PrologEngine loaded item reasoning rules")


# ---------------------------------------------------------------------------
# Game-state updates
# ---------------------------------------------------------------------------

## Update dynamic player state facts.  Call on each significant state change.
func update_game_state(state: Dictionary) -> void:
	if not _initialized:
		return
	var player_id: String = _sanitize(str(state.get("playerCharacterId", "player")))

	# Retract stale dynamic facts
	_retract_pattern("energy(%s" % player_id)
	_retract_pattern("at_location(%s" % player_id)
	_retract_pattern("nearby_npc(%s" % player_id)

	# Assert current values
	_assert_internal("energy(%s, %s)" % [player_id, str(state.get("playerEnergy", 100))])

	var settlement: String = str(state.get("currentSettlement", ""))
	if not settlement.is_empty():
		_assert_internal("at_location(%s, %s)" % [player_id, _sanitize(settlement)])

	var nearby: Array = state.get("nearbyNPCs", [])
	for npc_id in nearby:
		_assert_internal("nearby_npc(%s, %s)" % [player_id, _sanitize(str(npc_id))])

# ---------------------------------------------------------------------------
# Action / quest queries
# ---------------------------------------------------------------------------

## Check if an action is allowed.  Returns a Dictionary {allowed: bool, reason: String}.
## Action is blocked if the KB contains a matching "cannot_perform" fact.
func can_perform_action(action_id: String, actor_id: String, target_id: String = "") -> Dictionary:
	if not _initialized:
		return {"allowed": true, "reason": ""}
	var action_atom: String = _sanitize(action_id)
	var actor_atom: String = _sanitize(actor_id)

	# Check for explicit prohibition facts
	var pattern: String
	if target_id.is_empty():
		pattern = "cannot_perform(%s, %s)" % [actor_atom, action_atom]
	else:
		pattern = "cannot_perform(%s, %s, %s)" % [actor_atom, action_atom, _sanitize(target_id)]

	if _has_fact(pattern):
		return {"allowed": false, "reason": "Prerequisites not met for action: %s" % action_id}

	# Also check the KB text for cannot_perform clauses
	if _kb_content.contains(pattern):
		return {"allowed": false, "reason": "Prerequisites not met for action: %s" % action_id}

	return {"allowed": true, "reason": ""}


## Check if a quest is available to the player.
func is_quest_available(quest_id: String, player_id: String) -> bool:
	if not _initialized:
		return true
	var q_atom: String = _sanitize(quest_id)
	var p_atom: String = _sanitize(player_id)
	# Blocked if we find a "quest_unavailable" fact
	if _has_fact("quest_unavailable(%s, %s)" % [p_atom, q_atom]):
		return false
	# Check KB text for quest_available predicate
	if _kb_content.contains("quest_available(%s, %s)" % [p_atom, q_atom]):
		return true
	# Default: available
	return true


## Check if a quest is complete for the player.
func is_quest_complete(quest_id: String, player_id: String) -> bool:
	if not _initialized:
		return false
	var q_atom: String = _sanitize(quest_id)
	var p_atom: String = _sanitize(player_id)
	return _has_fact("quest_complete(%s, %s)" % [p_atom, q_atom]) or \
		   _has_fact("quest_completed(%s, %s)" % [p_atom, q_atom])


## Check if a specific quest stage is complete.
func is_stage_complete(quest_id: String, stage_id: String, player_id: String) -> bool:
	if not _initialized:
		return false
	var q_atom: String = _sanitize(quest_id)
	var s_atom: String = _sanitize(stage_id)
	var p_atom: String = _sanitize(player_id)
	return _has_fact("stage_complete(%s, %s, %s)" % [p_atom, q_atom, s_atom])


## Evaluate a Prolog goal condition. Returns true if satisfied.
## Uses simple substring matching against KB and fact store.
func evaluate_condition(prolog_goal: String) -> bool:
	if not _initialized:
		return true
	var clean: String = prolog_goal.strip_edges().trim_suffix(".")
	if _has_fact(clean):
		return true
	if _kb_content.contains(clean):
		return true
	return false


## Return rule names that apply to the given actor.
## Performs a simple substring search in the KB for "rule_applies(RuleName, <actor>".
func get_applicable_rules(actor_id: String) -> Array[String]:
	var result: Array[String] = []
	if not _initialized:
		return result
	var actor_atom: String = _sanitize(actor_id)
	var search: String = "rule_applies("
	var actor_suffix: String = ", %s" % actor_atom
	for line in _kb_content.split("\n"):
		var trimmed: String = line.strip_edges()
		if trimmed.begins_with(search) and trimmed.contains(actor_suffix):
			# Extract the rule name (first argument)
			var inner: String = trimmed.substr(search.length())
			var comma_pos: int = inner.find(",")
			if comma_pos > 0:
				result.append(inner.substr(0, comma_pos).strip_edges())
	return result


## Get engine stats for debugging.
func get_stats() -> Dictionary:
	return {"fact_count": _facts.size(), "rule_count": _kb_content.split("\n").size()}

# ---------------------------------------------------------------------------
# Fact management
# ---------------------------------------------------------------------------

## Assert a new fact into the dynamic fact store.
func assert_fact(fact: String) -> void:
	if not _initialized:
		return
	_assert_internal(fact)
	_reevaluate_quests()


## Retract a fact from the dynamic fact store.
func retract_fact(fact: String) -> void:
	if not _initialized:
		return
	var clean: String = fact.strip_edges().trim_suffix(".")
	_facts.erase(clean)
	_reevaluate_quests()


## Run a query against the knowledge base.
## Returns an array of dictionaries with variable bindings.
## NOTE: This stub only supports ground-fact lookup — no unification.
func query(goal: String) -> Array[Dictionary]:
	var results: Array[Dictionary] = []
	if not _initialized:
		return results
	var clean_goal: String = goal.strip_edges().trim_suffix(".")
	if _has_fact(clean_goal):
		results.append({"result": true, "goal": clean_goal})
	if _kb_content.contains(clean_goal):
		results.append({"result": true, "goal": clean_goal, "source": "kb"})
	return results


## Export the full knowledge base as a Prolog text string.
func export_knowledge_base() -> String:
	var output: String = _kb_content + "\n"
	for fact in _facts:
		output += fact + ".\n"
	return output

# ---------------------------------------------------------------------------
# NPC intelligence queries
# ---------------------------------------------------------------------------

## Determine which NPCs the given NPC should talk to.
func who_should_talk_to(npc_id: String) -> Array[String]:
	if not _initialized:
		return []
	var npc_atom: String = _sanitize(npc_id)
	return _collect_second_arg("should_talk_to", npc_atom)


## Check if an NPC wants to socialize.
func wants_to_socialize(npc_id: String) -> bool:
	if not _initialized:
		return false
	var npc_atom: String = _sanitize(npc_id)
	return _has_fact("wants_to_socialize(%s)" % npc_atom) or \
		   _kb_content.contains("wants_to_socialize(%s)" % npc_atom)


## Check if this is a first meeting (no mental model exists).
func is_first_meeting(npc_id: String, player_id: String) -> bool:
	if not _initialized:
		return true
	var npc_atom: String = _sanitize(npc_id)
	var player_atom: String = _sanitize(player_id)
	# First meeting if there is no has_mental_model fact
	return not _has_fact("has_mental_model(%s, %s)" % [npc_atom, player_atom])


## Get preferred dialogue topics for an NPC.
func get_preferred_topics(npc_id: String) -> Array[String]:
	if not _initialized:
		return []
	var npc_atom: String = _sanitize(npc_id)
	return _collect_second_arg("prefers_topic", npc_atom)


## Get an NPC's conflict resolution style.
func get_conflict_style(npc_id: String) -> String:
	if not _initialized:
		return ""
	var npc_atom: String = _sanitize(npc_id)
	var results: Array[String] = _collect_second_arg("conflict_style", npc_atom)
	return results[0] if results.size() > 0 else ""


## Check if an NPC is grieving.
func is_grieving(npc_id: String) -> bool:
	if not _initialized:
		return false
	var npc_atom: String = _sanitize(npc_id)
	return _has_fact("is_grieving(%s)" % npc_atom) or \
		   _kb_content.contains("is_grieving(%s)" % npc_atom)


## Get NPCs that should be avoided by a given NPC.
func who_to_avoid(npc_id: String) -> Array[String]:
	if not _initialized:
		return []
	var npc_atom: String = _sanitize(npc_id)
	return _collect_second_arg("should_avoid", npc_atom)


## Check if an NPC is willing to share knowledge with another.
func is_willing_to_share(npc_id: String, target_id: String) -> bool:
	if not _initialized:
		return true
	var npc_atom: String = _sanitize(npc_id)
	var target_atom: String = _sanitize(target_id)
	return _has_fact("willing_to_share(%s, %s)" % [npc_atom, target_atom]) or \
		   _kb_content.contains("willing_to_share(%s, %s)" % [npc_atom, target_atom])


## Evaluate volition rules for an NPC. Returns scored actions sorted by score descending.
## Stub: scans volition_score facts.
func evaluate_volition_rules(npc_id: String) -> Array[Dictionary]:
	var results: Array[Dictionary] = []
	if not _initialized:
		return results
	var npc_atom: String = _sanitize(npc_id)
	var prefix: String = "volition_score(%s, " % npc_atom
	for fact in _facts:
		if fact.begins_with(prefix):
			# Parse volition_score(npcId, action, target, score)
			var inner: String = fact.substr(prefix.length())
			var end: int = inner.find(")")
			if end > 0:
				var parts: PackedStringArray = inner.substr(0, end).split(",")
				if parts.size() >= 3:
					results.append({
						"action_id": parts[0].strip_edges(),
						"target_id": parts[1].strip_edges(),
						"score": float(parts[2].strip_edges())
					})
	# Sort by score descending
	results.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return float(a.get("score", 0)) > float(b.get("score", 0)))
	return results


## Get the current romance stage between the player and an NPC.
## Returns empty string if no romance stage exists.
func get_romance_stage(npc_id: String) -> String:
	if not _initialized:
		return ""
	var npc_atom: String = _sanitize(npc_id)
	var prefix: String = "romance_stage(player, %s, " % npc_atom
	for fact in _facts:
		if fact.begins_with(prefix):
			var inner: String = fact.substr(prefix.length())
			var end: int = inner.find(")")
			if end > 0:
				return inner.substr(0, end).strip_edges()
	return ""


## Check if a romance action can be performed with an NPC.
## Returns true by default if no romance rules are loaded.
func can_perform_romance_action(npc_id: String, action_type: String) -> bool:
	if not _initialized:
		return true
	var npc_atom: String = _sanitize(npc_id)
	var action_atom: String = _sanitize(action_type)
	var pattern: String = "can_romance_action(player, %s, %s)" % [npc_atom, action_atom]
	# If no romance rules loaded, allow by default (graceful degradation)
	var has_rules: bool = false
	for fact in _facts:
		if fact.begins_with("can_romance_action("):
			has_rules = true
			break
	if not has_rules:
		return true
	return _has_fact(pattern)


## Update NPC personality facts. Retracts old personality facts, asserts new ones.
func update_npc_personality(npc_id: String, personality: Dictionary) -> void:
	if not _initialized:
		return
	var id: String = _sanitize(npc_id)
	_retract_pattern("personality(%s" % id)
	for trait_name in personality:
		_assert_internal("personality(%s, %s, %s)" % [id, _sanitize(str(trait_name)), str(personality[trait_name])])


## Update NPC emotional state.
func update_npc_emotional_state(npc_id: String, state: Dictionary) -> void:
	if not _initialized:
		return
	var id: String = _sanitize(npc_id)
	_retract_pattern("mood(%s" % id)
	_retract_pattern("stress_level(%s" % id)
	_retract_pattern("social_desire(%s" % id)
	_retract_pattern("energy(%s" % id)
	if state.has("mood"):
		_assert_internal("mood(%s, %s)" % [id, _sanitize(str(state["mood"]))])
	if state.has("stressLevel"):
		_assert_internal("stress_level(%s, %s)" % [id, str(state["stressLevel"])])
	if state.has("socialDesire"):
		_assert_internal("social_desire(%s, %s)" % [id, str(state["socialDesire"])])
	if state.has("energy"):
		_assert_internal("energy(%s, %s)" % [id, str(state["energy"])])


## Update NPC relationship facts.
func update_npc_relationship(npc1_id: String, npc2_id: String, relationship: Dictionary) -> void:
	if not _initialized:
		return
	var id1: String = _sanitize(npc1_id)
	var id2: String = _sanitize(npc2_id)
	_retract_pattern("relationship_charge(%s, %s" % [id1, id2])
	_retract_pattern("relationship_trust(%s, %s" % [id1, id2])
	_retract_pattern("conversation_count(%s, %s" % [id1, id2])
	_retract_pattern("friends(%s, %s" % [id1, id2])
	_retract_pattern("enemies(%s, %s" % [id1, id2])
	if relationship.has("charge"):
		_assert_internal("relationship_charge(%s, %s, %s)" % [id1, id2, str(relationship["charge"])])
	if relationship.has("trust"):
		_assert_internal("relationship_trust(%s, %s, %s)" % [id1, id2, str(relationship["trust"])])
	if relationship.has("conversationCount"):
		_assert_internal("conversation_count(%s, %s, %s)" % [id1, id2, str(relationship["conversationCount"])])
	if relationship.get("isFriend", false):
		_assert_internal("friends(%s, %s)" % [id1, id2])
	if relationship.get("isEnemy", false):
		_assert_internal("enemies(%s, %s)" % [id1, id2])


## Record that the player performed an action on an NPC.
func record_player_action(player_id: String, npc_id: String, action_name: String) -> void:
	if not _initialized:
		return
	var p_id: String = _sanitize(player_id)
	var n_id: String = _sanitize(npc_id)
	var action: String = _sanitize(action_name)
	_assert_internal("player_action(%s, %s, %s)" % [p_id, n_id, action])

# ---------------------------------------------------------------------------
# Event bus integration
# ---------------------------------------------------------------------------

## Reference to connected event bus.
var _event_bus: Node = null
var _event_bus_handler: Callable = Callable()


## Subscribe to an EventBus, asserting Prolog facts for each game event.
func subscribe_to_event_bus(event_bus: Node) -> void:
	# Disconnect previous bus if any
	if _event_bus != null and _event_bus_handler.is_valid():
		if _event_bus.has_method("disconnect_any"):
			_event_bus.disconnect_any(_event_bus_handler)
	_event_bus = event_bus
	_event_bus_handler = _handle_game_event
	if event_bus.has_method("connect_any"):
		event_bus.connect_any(_event_bus_handler)


## Handle a game event by asserting the corresponding Prolog facts.
func _handle_game_event(event: Dictionary) -> void:
	if not _initialized:
		return
	var event_type: String = event.get("type", "")
	match event_type:
		"item_collected":
			var name: String = _sanitize(str(event.get("item_name", "")))
			_assert_internal("collected(player, %s, %s)" % [name, str(event.get("quantity", 1))])
			_assert_internal("has(player, %s)" % name)
			_update_item_quantity(name, int(event.get("quantity", 1)))
			if event.has("taxonomy"):
				_assert_item_taxonomy(name, event["taxonomy"])
		"enemy_defeated":
			_assert_internal("defeated(player, %s)" % _sanitize(str(event.get("enemy_type", ""))))
		"location_visited":
			_assert_internal("visited(player, %s)" % _sanitize(str(event.get("location_id", ""))))
		"npc_talked":
			_assert_internal("talked_to(player, %s, %s)" % [_sanitize(str(event.get("npc_id", ""))), str(event.get("turn_count", 0))])
		"item_delivered":
			_assert_internal("delivered(player, %s, %s)" % [_sanitize(str(event.get("npc_id", ""))), _sanitize(str(event.get("item_name", "")))])
		"vocabulary_used":
			var correct_val: int = 1 if event.get("correct", false) else 0
			_assert_internal("vocab_used(player, %s, %s)" % [_sanitize(str(event.get("word", ""))), str(correct_val)])
		"item_crafted":
			var name: String = _sanitize(str(event.get("item_name", "")))
			_assert_internal("crafted(player, %s, %s)" % [name, str(event.get("quantity", 1))])
			_assert_internal("has(player, %s)" % name)
			_update_item_quantity(name, int(event.get("quantity", 1)))
			if event.has("taxonomy"):
				_assert_item_taxonomy(name, event["taxonomy"])
		"location_discovered":
			_assert_internal("discovered(player, %s)" % _sanitize(str(event.get("location_id", ""))))
		"settlement_entered":
			_assert_internal("visited(player, %s)" % _sanitize(str(event.get("settlement_id", ""))))
		"reputation_changed":
			_assert_internal("reputation_change(player, %s, %s)" % [_sanitize(str(event.get("faction_id", ""))), str(event.get("delta", 0))])
		"quest_accepted":
			_assert_internal("quest_active(player, %s)" % _sanitize(str(event.get("quest_id", ""))))
		"quest_completed":
			_assert_internal("quest_completed(player, %s)" % _sanitize(str(event.get("quest_id", ""))))
		"puzzle_solved":
			_assert_internal("puzzle_solved(player, %s)" % _sanitize(str(event.get("puzzle_id", ""))))
		"item_removed", "item_dropped":
			var name: String = _sanitize(str(event.get("item_name", "")))
			var qty: int = int(event.get("quantity", 1))
			_update_item_quantity(name, -qty)
			if _get_item_quantity(name) <= 0:
				_retract_pattern("has(player, %s)" % name)
		"item_used":
			var name: String = _sanitize(str(event.get("item_name", "")))
			_update_item_quantity(name, -1)
			if _get_item_quantity(name) <= 0:
				_retract_pattern("has(player, %s)" % name)
		"item_equipped":
			_assert_internal("equipped(player, %s, %s)" % [_sanitize(str(event.get("item_name", ""))), _sanitize(str(event.get("slot", "")))])
		"item_unequipped":
			var equip_fact: String = "equipped(player, %s, %s)" % [_sanitize(str(event.get("item_name", ""))), _sanitize(str(event.get("slot", "")))]
			_facts.erase(equip_fact)
		"romance_action":
			var npc_id: String = _sanitize(str(event.get("npc_id", "")))
			var action_type: String = _sanitize(str(event.get("action_type", "")))
			var status: String = "accepted" if event.get("accepted", false) else "rejected"
			_assert_internal("romance_action(player, %s, %s, %s)" % [npc_id, action_type, status])
			# Emit create_truth event for accepted actions
			if event.get("accepted", false) and _event_bus != null and _event_bus.has_method("emit_event"):
				_event_bus.emit_event({
					"type": "state_created_truth",
					"character_id": "player",
					"title": "Romance: %s with %s" % [str(event.get("action_type", "")), str(event.get("npc_name", ""))],
					"content": "Player performed %s on %s" % [str(event.get("action_type", "")), str(event.get("npc_name", ""))],
					"entry_type": "romance"
				})
		"romance_stage_changed":
			var npc_id: String = _sanitize(str(event.get("npc_id", "")))
			var from_stage: String = _sanitize(str(event.get("from_stage", "")))
			var to_stage: String = _sanitize(str(event.get("to_stage", "")))
			_retract_pattern("romance_stage(player, %s" % npc_id)
			_assert_internal("romance_stage(player, %s, %s)" % [npc_id, to_stage])
			_assert_internal("romance_history(player, %s, %s, %s)" % [npc_id, from_stage, to_stage])
			# Emit create_truth event
			if _event_bus != null and _event_bus.has_method("emit_event"):
				_event_bus.emit_event({
					"type": "state_created_truth",
					"character_id": "player",
					"title": "Romance stage: %s -> %s with %s" % [str(event.get("from_stage", "")), str(event.get("to_stage", "")), str(event.get("npc_name", ""))],
					"content": "Romance stage changed from %s to %s" % [str(event.get("from_stage", "")), str(event.get("to_stage", ""))],
					"entry_type": "romance"
				})
		"npc_volition_action":
			_assert_internal("volition_acted(%s, %s, %s)" % [_sanitize(str(event.get("npc_id", ""))), _sanitize(str(event.get("action_id", ""))), _sanitize(str(event.get("target_id", "")))])
		"conversation_overheard":
			_assert_internal("overheard_conversation(player, %s, %s, %s)" % [_sanitize(str(event.get("npc_id_1", ""))), _sanitize(str(event.get("npc_id_2", ""))), _sanitize(str(event.get("topic", "")))])
		"state_created_truth":
			_assert_internal("has_state(%s, %s)" % [_sanitize(str(event.get("character_id", ""))), _sanitize(str(event.get("state_type", "")))])
		"state_expired_truth":
			_retract_pattern("has_state(%s, %s" % [_sanitize(str(event.get("character_id", ""))), _sanitize(str(event.get("state_type", "")))])
		"puzzle_failed":
			_assert_internal("puzzle_failed(player, %s, %s)" % [_sanitize(str(event.get("puzzle_id", ""))), str(event.get("attempts", 0))])
		"quest_failed":
			_assert_internal("quest_failed(player, %s)" % _sanitize(str(event.get("quest_id", ""))))
		"quest_abandoned":
			var qid: String = _sanitize(str(event.get("quest_id", "")))
			_assert_internal("quest_abandoned(player, %s)" % qid)
			_retract_pattern("quest_active(player, %s" % qid)
		"direction_step_completed":
			var dqid: String = _sanitize(str(event.get("quest_id", "")))
			_retract_pattern("quest_progress(player, %s" % dqid)
			_assert_internal("quest_progress(player, %s, %s)" % [dqid, str(event.get("steps_completed", 0))])
			_assert_internal("direction_step_done(player, %s, %s)" % [dqid, str(event.get("step_index", 0))])
		_:
			return  # No re-evaluation for unhandled events
	_reevaluate_quests()


# ---------------------------------------------------------------------------
# Quest tracking
# ---------------------------------------------------------------------------

## Register active quest IDs for automatic re-evaluation.
func set_active_quests(quest_ids: Array[String]) -> void:
	_active_quest_ids = quest_ids


## Re-evaluate all active quests; emit quest_completed for any now complete.
func _reevaluate_quests() -> void:
	var newly_completed: Array[String] = []
	for qid in _active_quest_ids:
		if is_quest_complete(qid, "player"):
			newly_completed.append(qid)
	for qid in newly_completed:
		_active_quest_ids.erase(qid)
		quest_completed.emit(qid)

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------

## Clear all state, disconnect event bus, and mark the engine as uninitialized.
func dispose() -> void:
	if _event_bus != null and _event_bus_handler.is_valid():
		if _event_bus.has_method("disconnect_any"):
			_event_bus.disconnect_any(_event_bus_handler)
	_event_bus = null
	_kb_content = ""
	_facts.clear()
	_active_quest_ids.clear()
	_item_quantities.clear()
	_initialized = false
	print("[Insimul] PrologEngine disposed")

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

func _assert_internal(fact: String) -> void:
	var clean: String = fact.strip_edges().trim_suffix(".")
	if clean not in _facts:
		_facts.append(clean)


func _has_fact(fact: String) -> bool:
	var clean: String = fact.strip_edges().trim_suffix(".")
	return clean in _facts


## Remove all facts whose text starts with the given prefix.
func _retract_pattern(prefix: String) -> void:
	var to_remove: Array[String] = []
	for fact in _facts:
		if fact.begins_with(prefix):
			to_remove.append(fact)
	for fact in to_remove:
		_facts.erase(fact)


## Collect the second argument from facts matching "predicate(first_arg, X)".
func _collect_second_arg(predicate: String, first_arg: String) -> Array[String]:
	var results: Array[String] = []
	var prefix: String = "%s(%s, " % [predicate, first_arg]
	for fact in _facts:
		if fact.begins_with(prefix):
			var inner: String = fact.substr(prefix.length())
			var end: int = inner.find(")")
			if end > 0:
				results.append(inner.substr(0, end).strip_edges())
	return results


## Sanitize a string into a valid Prolog atom (lowercase, underscores only).
func _sanitize(text: String) -> String:
	var result: String = text.to_lower()
	var regex := RegEx.new()
	regex.compile("[^a-z0-9_]")
	result = regex.sub(result, "_", true)
	# Prefix leading digit with underscore
	if not result.is_empty() and result[0].is_valid_int():
		result = "_" + result
	# Collapse and trim trailing underscores
	while result.contains("__"):
		result = result.replace("__", "_")
	result = result.trim_suffix("_")
	return result


## Escape single quotes for Prolog string literals.
func _escape(text: String) -> String:
	return text.replace("\\", "\\\\").replace("'", "\\'")


# ---------------------------------------------------------------------------
# Item quantity tracking
# ---------------------------------------------------------------------------

## Per-item quantities for has_item/3 accuracy.
var _item_quantities: Dictionary = {}

func _get_item_quantity(item_name: String) -> int:
	return int(_item_quantities.get(item_name, 0))

func _update_item_quantity(item_name: String, delta: int) -> void:
	var old_qty: int = _get_item_quantity(item_name)
	var new_qty: int = max(0, old_qty + delta)
	_item_quantities[item_name] = new_qty
	# Retract old has_item/3 fact
	_retract_pattern("has_item(player, %s" % item_name)
	# Assert new quantity if positive
	if new_qty > 0:
		_assert_internal("has_item(player, %s, %d)" % [item_name, new_qty])

## Assert taxonomy facts for an item (category, material, base_type, rarity, IS-A chain).
func _assert_item_taxonomy(item_name: String, taxonomy: Dictionary) -> void:
	if taxonomy.has("category") and not str(taxonomy["category"]).is_empty():
		_assert_internal("item_category(%s, %s)" % [item_name, _sanitize(str(taxonomy["category"]))])
		_assert_internal("item_is_a(%s, %s)" % [item_name, _sanitize(str(taxonomy["category"]))])
	if taxonomy.has("material") and not str(taxonomy["material"]).is_empty():
		_assert_internal("item_material(%s, %s)" % [item_name, _sanitize(str(taxonomy["material"]))])
	if taxonomy.has("base_type") and not str(taxonomy["base_type"]).is_empty():
		_assert_internal("item_base_type(%s, %s)" % [item_name, _sanitize(str(taxonomy["base_type"]))])
		_assert_internal("item_is_a(%s, %s)" % [item_name, _sanitize(str(taxonomy["base_type"]))])
	elif taxonomy.has("baseType") and not str(taxonomy["baseType"]).is_empty():
		_assert_internal("item_base_type(%s, %s)" % [item_name, _sanitize(str(taxonomy["baseType"]))])
		_assert_internal("item_is_a(%s, %s)" % [item_name, _sanitize(str(taxonomy["baseType"]))])
	if taxonomy.has("rarity") and not str(taxonomy["rarity"]).is_empty():
		_assert_internal("item_rarity(%s, %s)" % [item_name, _sanitize(str(taxonomy["rarity"]))])
	if taxonomy.has("item_type") and not str(taxonomy["item_type"]).is_empty():
		_assert_internal("item_is_a(%s, %s)" % [item_name, _sanitize(str(taxonomy["item_type"]))])
	elif taxonomy.has("itemType") and not str(taxonomy["itemType"]).is_empty():
		_assert_internal("item_is_a(%s, %s)" % [item_name, _sanitize(str(taxonomy["itemType"]))])
