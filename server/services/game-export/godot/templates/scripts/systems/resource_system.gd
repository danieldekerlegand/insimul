extends Node
## Resource System

var definitions: Array[Dictionary] = []

func load_from_data(world_data: Dictionary) -> void:
	var resources: Dictionary = world_data.get("resources", {})
	definitions.assign(resources.get("definitions", []))
	print("[Insimul] ResourceSystem loaded %d resource types" % definitions.size())

func gather_resource(resource_id: String) -> bool:
	for def in definitions:
		if def.get("id", "") == resource_id:
			InventorySystem.add_item(resource_id, 1)
			print("[Insimul] Gathered: %s" % def.get("name", resource_id))
			return true
	return false
