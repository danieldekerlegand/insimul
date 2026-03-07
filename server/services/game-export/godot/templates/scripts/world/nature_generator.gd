extends Node3D
## Procedural nature/vegetation generator.
## Add to the "world_generator" group.

func _ready() -> void:
	add_to_group("world_generator")

func generate_from_data(world_data: Dictionary) -> void:
	var meta: Dictionary = world_data.get("meta", {})
	var geo: Dictionary = world_data.get("geography", {})
	# TODO: Scatter vegetation using random positions
	print("[Insimul] ProceduralNatureGenerator — terrain: %d, seed: %s" % [geo.get("terrainSize", 100), meta.get("seed", "")])
