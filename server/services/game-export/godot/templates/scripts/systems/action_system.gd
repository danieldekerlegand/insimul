extends Node
## Action System — autoloaded singleton.

var actions: Array[Dictionary] = []

func load_from_data(world_data: Dictionary) -> void:
	var systems: Dictionary = world_data.get("systems", {})
	actions.append_array(systems.get("actions", []))
	actions.append_array(systems.get("baseActions", []))
	print("[Insimul] ActionSystem loaded %d actions" % actions.size())

func get_action(action_id: String) -> Dictionary:
	for a in actions:
		if a.get("id", "") == action_id:
			return a
	return {}

func execute_action(action_id: String, source: Node, target: Node = null) -> bool:
	var action := get_action(action_id)
	if action.is_empty() or not action.get("isActive", true):
		return false
	# TODO: Check prerequisites, apply effects
	print("[Insimul] Executing action: %s" % action.get("name", action_id))
	return true
