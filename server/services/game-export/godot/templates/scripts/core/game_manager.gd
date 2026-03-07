extends Node
## Central game manager — autoloaded singleton.
## Orchestrates data loading and world spawning.

signal world_loaded
signal world_spawned

var world_data: Dictionary = {}
var is_data_loaded := false

func _ready() -> void:
	load_world_data()
	if is_data_loaded:
		spawn_world()

func load_world_data() -> void:
	world_data = DataLoader.load_world_data()
	if world_data.is_empty():
		push_error("[Insimul] Failed to load world data")
		return
	is_data_loaded = true
	var meta: Dictionary = world_data.get("meta", {})
	print("[Insimul] Loaded world: %s (type: %s)" % [meta.get("worldName", "?"), meta.get("worldType", "?")])
	world_loaded.emit()

func spawn_world() -> void:
	print("[Insimul] Spawning world entities...")
	# Generators are expected as children of the main scene or found via groups
	for gen in get_tree().get_nodes_in_group("world_generator"):
		if gen.has_method("generate_from_data"):
			gen.generate_from_data(world_data)

	# Initialize systems
	ActionSystem.load_from_data(world_data)
	QuestSystem.load_from_data(world_data)
	CombatSystem.load_from_data(world_data)
	RuleEnforcer.load_from_data(world_data)
	InventorySystem.initialize()

	print("[Insimul] World spawning complete.")
	world_spawned.emit()
