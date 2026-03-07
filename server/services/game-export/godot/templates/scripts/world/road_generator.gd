extends Node3D
## Road generator.
## Add to the "world_generator" group.

@export var road_color := Color({{ROAD_COLOR_R}}, {{ROAD_COLOR_G}}, {{ROAD_COLOR_B}})
@export var road_width := {{ROAD_WIDTH}}

func _ready() -> void:
	add_to_group("world_generator")

func generate_from_data(world_data: Dictionary) -> void:
	# TODO: Generate mesh-based roads from WorldIR road data
	print("[Insimul] RoadGenerator — stub (implement mesh roads)")
