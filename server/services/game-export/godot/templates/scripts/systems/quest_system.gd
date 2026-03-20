extends Node
## Quest System — autoloaded singleton.
## Ported from Insimul's Babylon.js QuestObjectManager.

signal quest_accepted(quest_id: String)
signal quest_completed(quest_id: String)
signal objective_completed(quest_id: String, objective_id: String)
signal story_tts(story_text: String, npc_id: String)

## Scavenger hunt categories for vocabulary rotation.
const SCAVENGER_CATEGORIES: Array[String] = [
	"food", "colors", "animals", "clothing", "household",
	"nature", "body", "professions", "transportation", "weather"
]

var all_quests: Array[Dictionary] = []
var active_quest_ids: Array[String] = []
var completed_quest_ids: Array[String] = []
var objectives: Array[Dictionary] = []
var _game_time: float = 0.0

## Optional callback to test whether a world XZ point is inside a building footprint.
## Signature: func(x: float, z: float) -> bool
var _point_in_building_check: Callable = Callable()


func _process(delta: float) -> void:
	_game_time += delta


func load_from_data(world_data: Dictionary) -> void:
	var systems: Dictionary = world_data.get("systems", {})
	all_quests.assign(systems.get("quests", []))
	print("[Insimul] QuestSystem loaded %d quests" % all_quests.size())


func get_quest(quest_id: String) -> Dictionary:
	for q in all_quests:
		if q.get("id", "") == quest_id:
			return q
	return {}


func accept_quest(quest_id: String) -> bool:
	if quest_id in active_quest_ids:
		return false
	var quest := get_quest(quest_id)
	if quest.is_empty():
		return false
	active_quest_ids.append(quest_id)
	quest_accepted.emit(quest_id)
	print("[Insimul] Quest accepted: %s" % quest.get("title", quest_id))
	return true


func complete_quest(quest_id: String) -> bool:
	if quest_id not in active_quest_ids:
		return false
	active_quest_ids.erase(quest_id)
	completed_quest_ids.append(quest_id)
	quest_completed.emit(quest_id)
	print("[Insimul] Quest completed: %s" % quest_id)
	return true


func complete_objective(quest_id: String, objective_id: String) -> bool:
	for obj in objectives:
		if obj.get("quest_id") == quest_id and obj.get("id") == objective_id:
			if obj.get("completed", false):
				return false
			obj["completed"] = true
			objective_completed.emit(quest_id, objective_id)
			print("[Insimul] Objective completed: %s/%s" % [quest_id, objective_id])
			return true
	return false


## Check timed objectives and return descriptions of any that expired.
func check_timed_objectives() -> Array[String]:
	var expired: Array[String] = []
	for obj in objectives:
		if obj.get("completed", false):
			continue
		var limit: float = obj.get("time_limit_seconds", 0.0)
		var started: float = obj.get("started_at", -1.0)
		if limit <= 0.0 or started < 0.0:
			continue

		var elapsed := _game_time - started
		if elapsed > limit:
			obj["completed"] = true
			expired.append("Time expired: %s" % obj.get("description", ""))
			print("[Insimul] Timed objective expired: %s" % obj.get("id", ""))
	return expired


## Get remaining seconds for a timed objective, or -1 if untimed.
func get_objective_time_remaining(objective_id: String) -> float:
	for obj in objectives:
		if obj.get("id") == objective_id:
			var limit: float = obj.get("time_limit_seconds", 0.0)
			var started: float = obj.get("started_at", -1.0)
			if limit > 0.0 and started >= 0.0:
				var elapsed := _game_time - started
				return maxf(0.0, limit - elapsed)
	return -1.0


## Request a GPS-style waypoint hint. Returns English hint text or empty string.
func request_navigation_hint(quest_id: String = "") -> String:
	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		var obj_type: String = obj.get("type", "")
		if obj_type != "navigate_language" and obj_type != "follow_directions":
			continue

		obj["hints_requested"] = obj.get("hints_requested", 0) + 1
		obj["show_waypoint"] = true
		print("[Insimul] Navigation hint #%d for %s" % [obj["hints_requested"], obj.get("id", "")])
		return obj.get("description", "")
	return ""


## Get next scavenger hunt category (round-robin).
static func get_next_scavenger_category(last_category_index: int) -> String:
	var next := (last_category_index + 1) % SCAVENGER_CATEGORIES.size()
	return SCAVENGER_CATEGORIES[next]


## Track vocabulary usage for use_vocabulary / collect_vocabulary objectives.
func track_vocabulary_usage(word: String, quest_id: String = "") -> void:
	var lower_word := word.to_lower()

	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		var obj_type: String = obj.get("type", "")
		if obj_type != "use_vocabulary" and obj_type != "collect_vocabulary":
			continue

		# If targetWords specified, only count matching words
		var target_words: Array = obj.get("target_words", [])
		if target_words.size() > 0 and lower_word not in target_words:
			continue

		# Don't double-count the same word
		var words_used: Array = obj.get("words_used", [])
		if lower_word in words_used:
			continue

		words_used.append(lower_word)
		obj["words_used"] = words_used
		obj["current_count"] = obj.get("current_count", 0) + 1

		var required: int = obj.get("required_count", 10)
		if obj["current_count"] >= required:
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Conversation-only objective types that progress on each conversation turn.
const CONVERSATION_ONLY_TYPES: Array[String] = [
	"complete_conversation", "order_food", "haggle_price",
	"listen_and_repeat", "ask_for_directions", "describe_scene",
	"write_response", "build_friendship"
]

## Track a conversation turn for conversation-only objectives.
func track_conversation_turn(keywords: Array[String] = [], quest_id: String = "") -> void:
	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") not in CONVERSATION_ONLY_TYPES:
			continue

		# Every conversation turn counts as progress
		obj["current_count"] = obj.get("current_count", 0) + 1

		var required: int = obj.get("required_count", 5)
		if obj["current_count"] >= required:
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track a pronunciation attempt for pronunciation_check objectives.
## score: pronunciation accuracy score (0-100)
func track_pronunciation_attempt(passed: bool, score: float = 0.0, quest_id: String = "") -> void:
	if not passed:
		return

	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") != "pronunciation_check":
			continue

		obj["current_count"] = obj.get("current_count", 0) + 1

		var required: int = obj.get("required_count", 3)
		if obj["current_count"] >= required:
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track a writing submission for write_response / describe_scene objectives.
func track_writing_submission(text: String, word_count: int, quest_id: String = "") -> void:
	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		var obj_type: String = obj.get("type", "")
		if obj_type != "write_response" and obj_type != "describe_scene":
			continue

		obj["current_count"] = obj.get("current_count", 0) + 1

		# Reject submissions below minimum word count
		var min_words: int = obj.get("min_word_count", 0)
		if min_words > 0 and word_count < min_words:
			continue

		var required: int = obj.get("required_count", 1)
		if obj["current_count"] >= required:
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track item delivery to an NPC for deliver_item objectives.
func track_item_delivery(npc_id: String, player_item_names: Array, quest_id: String = "") -> void:
	var normalized_items: Array = []
	for item_name in player_item_names:
		normalized_items.append(item_name.to_lower())

	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") != "deliver_item":
			continue
		var obj_npc: String = obj.get("npc_id", "")
		if not obj_npc.is_empty() and obj_npc != npc_id:
			continue
		var obj_item: String = obj.get("item_name", "").to_lower()
		if not obj_item.is_empty() and normalized_items.has(obj_item):
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track a gift given to an NPC for give_gift objectives.
func track_gift_given(npc_id: String, item_name: String, quest_id: String = "") -> void:
	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") != "give_gift":
			continue
		var obj_npc: String = obj.get("npc_id", "")
		if not obj_npc.is_empty() and obj_npc != npc_id:
			continue
		complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track an enemy defeat for defeat_enemies objectives.
func track_enemy_defeated(enemy_type: String, quest_id: String = "") -> void:
	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") != "defeat_enemies":
			continue

		obj["current_count"] = obj.get("current_count", 0) + 1
		var required: int = obj.get("required_count", 1)
		if obj["current_count"] >= required:
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track escort NPC arrival for escort_npc objectives.
func track_escort_arrival(npc_id: String, reached: bool, quest_id: String = "") -> void:
	if not reached:
		return
	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") != "escort_npc":
			continue
		complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track topic-based NPC conversation turns for objectives like
## ask_for_directions, order_food, haggle_price, introduce_self, build_friendship.
func track_npc_conversation_turn(npc_id: String, topic_tag: String = "", quest_id: String = "") -> void:
	var TAG_TO_TYPES: Dictionary = {
		"directions": ["ask_for_directions"],
		"order": ["order_food"],
		"haggle": ["haggle_price"],
		"introduction": ["introduce_self"],
		"friendship": ["build_friendship"],
	}
	var target_types: Array[String] = []
	if not topic_tag.is_empty() and TAG_TO_TYPES.has(topic_tag):
		target_types = TAG_TO_TYPES[topic_tag]
	else:
		target_types = ["ask_for_directions", "order_food", "haggle_price", "introduce_self", "build_friendship"]

	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") not in target_types:
			continue
		if not obj.get("npc_id", "").is_empty() and obj.get("npc_id") != npc_id:
			continue

		obj["current_count"] = obj.get("current_count", 0) + 1
		var required: int = obj.get("required_count", 1)
		if obj["current_count"] >= required:
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track NPC-initiated conversation acceptance for conversation_initiation objectives.
func track_conversation_initiation(npc_id: String, accepted: bool, quest_id: String = "") -> void:
	if not accepted:
		return

	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") != "conversation_initiation":
			continue
		if not obj.get("npc_id", "").is_empty() and obj.get("npc_id") != npc_id:
			continue

		obj["current_count"] = obj.get("current_count", 0) + 1
		var required: int = obj.get("required_count", 1)
		if obj["current_count"] >= required:
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track teaching a vocabulary word to an NPC for teach_vocabulary objectives.
func track_teach_word(npc_id: String, word: String, quest_id: String = "") -> void:
	var lower_word: String = word.to_lower()
	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") != "teach_vocabulary":
			continue
		if not obj.get("npc_id", "").is_empty() and obj.get("npc_id") != npc_id:
			continue

		var words_taught: Array = obj.get("words_taught", [])
		if lower_word in words_taught:
			continue
		words_taught.append(lower_word)
		obj["words_taught"] = words_taught
		obj["current_count"] = obj.get("current_count", 0) + 1

		var required: int = obj.get("required_count", 3)
		if obj["current_count"] >= required:
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track teaching a phrase to an NPC for teach_phrase objectives.
func track_teach_phrase(npc_id: String, phrase: String, quest_id: String = "") -> void:
	var lower_phrase: String = phrase.to_lower()
	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") != "teach_phrase":
			continue
		if not obj.get("npc_id", "").is_empty() and obj.get("npc_id") != npc_id:
			continue

		var phrases_taught: Array = obj.get("phrases_taught", [])
		if lower_phrase in phrases_taught:
			continue
		phrases_taught.append(lower_phrase)
		obj["phrases_taught"] = phrases_taught
		obj["current_count"] = obj.get("current_count", 0) + 1

		var required: int = obj.get("required_count", 1)
		if obj["current_count"] >= required:
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track food ordering at a merchant for order_food objectives.
func track_food_ordered(item_name: String, merchant_id: String, business_type: String, quest_id: String = "") -> void:
	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") != "order_food":
			continue

		obj["current_count"] = obj.get("current_count", 0) + 1

		var required: int = obj.get("required_count", 1)
		if obj["current_count"] >= required:
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track price haggling in target language for haggle_price objectives.
func track_price_haggled(item_name: String, merchant_id: String, typed_word: String, quest_id: String = "") -> void:
	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") != "haggle_price":
			continue

		obj["current_count"] = obj.get("current_count", 0) + 1

		var required: int = obj.get("required_count", 1)
		if obj["current_count"] >= required:
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Check if player is near a direction/navigation waypoint.
## Call this from _physics_process with the player's position.
func check_direction_proximity(player_pos: Vector3) -> void:
	for obj in objectives:
		if obj.get("completed", false):
			continue
		var obj_type: String = obj.get("type", "")

		if obj_type == "follow_directions":
			var steps: Array = obj.get("direction_steps", [])
			var step_idx: int = obj.get("steps_completed", 0)
			if step_idx >= steps.size():
				continue
			var step: Dictionary = steps[step_idx]
			var target: Dictionary = step.get("target_position", {})
			if target.is_empty():
				continue
			var target_vec := Vector3(target.get("x", 0.0), player_pos.y, target.get("z", 0.0))
			var radius: float = obj.get("step_radius", 6.0)
			if player_pos.distance_to(target_vec) <= radius:
				obj["steps_completed"] = step_idx + 1
				var steps_required: int = obj.get("steps_required", steps.size())
				EventBus.emit_event({
					"type": "direction_step_completed",
					"quest_id": obj.get("quest_id", ""),
					"objective_id": obj.get("id", ""),
					"step_index": step_idx,
					"steps_completed": obj["steps_completed"],
					"steps_required": steps_required,
				})
				if obj["steps_completed"] >= steps_required:
					complete_objective(obj.get("quest_id", ""), obj.get("id", ""))

		elif obj_type == "navigate_language":
			var waypoints: Array = obj.get("navigation_waypoints", [])
			var wp_idx: int = obj.get("waypoints_reached", 0)
			if wp_idx >= waypoints.size():
				continue
			var wp: Dictionary = waypoints[wp_idx]
			var target: Dictionary = wp.get("target_position", {})
			if target.is_empty():
				continue
			var target_vec := Vector3(target.get("x", 0.0), player_pos.y, target.get("z", 0.0))
			var radius: float = obj.get("step_radius", 6.0)
			if player_pos.distance_to(target_vec) <= radius:
				obj["waypoints_reached"] = wp_idx + 1
				obj["steps_completed"] = obj["waypoints_reached"]
				EventBus.emit_event({
					"type": "direction_step_completed",
					"quest_id": obj.get("quest_id", ""),
					"objective_id": obj.get("id", ""),
					"step_index": wp_idx,
					"steps_completed": obj["waypoints_reached"],
					"steps_required": waypoints.size(),
				})
				if obj["waypoints_reached"] >= waypoints.size():
					complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Register a building-check callback so spawned items avoid building interiors.
func set_point_in_building_check(check: Callable) -> void:
	_point_in_building_check = check


## Generate spread-out item positions that avoid building interiors.
func generate_item_positions(count: int) -> Array[Vector3]:
	var positions: Array[Vector3] = []
	var radius := 30.0

	for i in range(count):
		var x := 0.0
		var z := 0.0
		for attempt in range(8):
			var angle := (PI * 2.0 * i) / count + randf_range(0.0, 0.5)
			var dist := 10.0 + randf_range(0.0, radius)
			x = cos(angle) * dist
			z = sin(angle) * dist
			if not _point_in_building_check.is_valid() or not _point_in_building_check.call(x, z):
				break
		positions.append(Vector3(x, 0.5, z))
	return positions


## Generate a single location position that avoids building interiors.
func generate_location_position() -> Vector3:
	for attempt in range(8):
		var angle := randf_range(0.0, PI * 2.0)
		var dist := 20.0 + randf_range(0.0, 20.0)
		var x := cos(angle) * dist
		var z := sin(angle) * dist
		if not _point_in_building_check.is_valid() or not _point_in_building_check.call(x, z):
			return Vector3(x, 0.0, z)
	# Fallback — push farther out
	var angle := randf_range(0.0, PI * 2.0)
	var dist := 40.0 + randf_range(0.0, 10.0)
	return Vector3(cos(angle) * dist, 0.0, sin(angle) * dist)


## Attach debug metadata to a quest marker node (used for hover tooltips).
## Replaces floating 3D text labels with lightweight metadata.
static func set_marker_debug_label(marker: Node3D, label: String) -> void:
	if marker == null:
		return
	marker.set_meta("debug_label", label)


## Get world positions of uncollected quest items for minimap markers.
func get_collectible_item_positions() -> Array[Vector3]:
	var positions: Array[Vector3] = []
	for obj in objectives:
		if obj.get("completed", false):
			continue
		var obj_type: String = obj.get("type", "")
		if obj_type != "collect_item" and obj_type != "identify_object" and obj_type != "find_vocabulary_items":
			continue
		var remaining: int = maxi(1, obj.get("required_count", 1) - obj.get("current_count", 0))
		positions.append_array(generate_item_positions(remaining))
	return positions


func get_active_quests() -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	for q in all_quests:
		if q.get("id", "") in active_quest_ids:
			result.append(q)
	return result
