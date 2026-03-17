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


## Track a conversation turn for complete_conversation objectives.
func track_conversation_turn(keywords: Array[String] = [], quest_id: String = "") -> void:
	for obj in objectives:
		if obj.get("completed", false):
			continue
		if not quest_id.is_empty() and obj.get("quest_id") != quest_id:
			continue
		if obj.get("type", "") != "complete_conversation":
			continue

		# Every conversation turn counts as progress
		obj["current_count"] = obj.get("current_count", 0) + 1

		var required: int = obj.get("required_count", 5)
		if obj["current_count"] >= required:
			complete_objective(obj.get("quest_id", ""), obj.get("id", ""))


## Track a pronunciation attempt for pronunciation_check objectives.
func track_pronunciation_attempt(passed: bool, quest_id: String = "") -> void:
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


func get_active_quests() -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	for q in all_quests:
		if q.get("id", "") in active_quest_ids:
			result.append(q)
	return result
