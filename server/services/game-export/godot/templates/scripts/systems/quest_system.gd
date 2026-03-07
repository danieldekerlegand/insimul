extends Node
## Quest System — autoloaded singleton.

signal quest_accepted(quest_id: String)
signal quest_completed(quest_id: String)

var all_quests: Array[Dictionary] = []
var active_quest_ids: Array[String] = []
var completed_quest_ids: Array[String] = []

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

func get_active_quests() -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	for q in all_quests:
		if q.get("id", "") in active_quest_ids:
			result.append(q)
	return result
