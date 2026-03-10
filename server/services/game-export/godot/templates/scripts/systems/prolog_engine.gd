extends Node
## Prolog Engine — autoloaded singleton.
## Client-side Prolog runtime stub for exported games.
## Mirrors GamePrologEngine.ts from the Babylon.js source.
##
## Since Godot has no native Prolog runtime, this provides a string-based
## knowledge base with basic fact lookup.  Full Prolog unification is NOT
## performed — actions are allowed unless a matching "cannot_perform" fact
## exists, and quest/rule queries do simple substring matching against the KB.

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

## Check if an action is allowed.  Returns true unless the KB contains a
## matching "cannot_perform" fact for the actor+action pair.
func can_perform_action(action_id: String, actor_id: String, target_id: String = "") -> bool:
	if not _initialized:
		return true
	var action_atom: String = _sanitize(action_id)
	var actor_atom: String = _sanitize(actor_id)

	# Check for explicit prohibition facts
	var pattern: String
	if target_id.is_empty():
		pattern = "cannot_perform(%s, %s)" % [actor_atom, action_atom]
	else:
		pattern = "cannot_perform(%s, %s, %s)" % [actor_atom, action_atom, _sanitize(target_id)]

	if _has_fact(pattern):
		return false

	# Also check the KB text for cannot_perform clauses
	if _kb_content.contains(pattern):
		return false

	return true


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

## Clear all state and mark the engine as uninitialized.
func dispose() -> void:
	_kb_content = ""
	_facts.clear()
	_active_quest_ids.clear()
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
