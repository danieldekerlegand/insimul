extends Node
## Action System -- autoloaded singleton.
## Manages available actions and their execution with item/gold effect support.

signal gold_effect(amount: int)
signal item_effect(item_id: String, quantity: int)

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

## Execute an action and return a result dictionary.
## Result: {success: bool, message: String, energy_used: int, effects: Array[Dictionary]}
func execute_action(action_id: String, source: Node, target: Node = null) -> Dictionary:
	var action := get_action(action_id)
	if action.is_empty() or not action.get("isActive", true):
		return {"success": false, "message": "Action unavailable", "energy_used": 0, "effects": []}

	var effects: Array[Dictionary] = []

	# Process effects from action definition
	for effect in action.get("effects", []):
		var category: String = effect.get("category", "")
		var effect_data := {
			"type": category,
			"target": "player" if effect.get("first", "") == "initiator" else (target.name if target else ""),
			"value": effect.get("value", 0),
			"description": "%s %s %s" % [effect.get("type", ""), effect.get("operator", ""), str(effect.get("value", 0))]
		}

		if category == "item":
			effect_data["item_id"] = effect.get("type", "")
			effect_data["quantity"] = int(effect.get("value", 1))
			item_effect.emit(effect_data["item_id"], effect_data["quantity"])
		elif category == "gold":
			gold_effect.emit(int(effect.get("value", 0)))

		effects.append(effect_data)

	print("[Insimul] Executing action: %s (%d effects)" % [action.get("name", action_id), effects.size()])
	return {"success": true, "message": "Executed: %s" % action.get("name", action_id), "energy_used": action.get("energyCost", 0), "effects": effects}
