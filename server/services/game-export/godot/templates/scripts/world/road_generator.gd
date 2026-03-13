extends Node3D
## Road generator.
## Add to the "world_generator" group.
##
## StreetNetwork data (from shared/game-engine/types.ts):
##   StreetNode:    { id: String, x: float, z: float, intersection_of: Array[String] }
##   StreetSegment: { id: String, name: String, direction: String, node_ids: Array[String],
##                    waypoints: Array[{ x: float, z: float }], width: float }
##   StreetNetwork: { nodes: Array[StreetNode], segments: Array[StreetSegment] }

@export var road_color := Color({{ROAD_COLOR_R}}, {{ROAD_COLOR_G}}, {{ROAD_COLOR_B}})
@export var road_width := {{ROAD_WIDTH}}
@export var sidewalk_color := Color(0.6, 0.58, 0.55)
@export var sidewalk_width := 0.6

func _ready() -> void:
	add_to_group("world_generator")

func generate_from_data(world_data: Dictionary) -> void:
	# TODO: Generate mesh-based roads from WorldIR road data
	print("[Insimul] RoadGenerator — stub (implement mesh roads)")

## Render a StreetNetwork within a settlement.
## street_network: Dictionary with "nodes" and "segments" arrays
## sample_height: Callable(x: float, z: float) -> float
func generate_settlement_streets(settlement_id: String, street_network: Dictionary, sample_height: Callable) -> void:
	var segments: Array = street_network.get("segments", [])
	var nodes: Array = street_network.get("nodes", [])
	for seg in segments:
		var waypoints: Array = seg.get("waypoints", [])
		var width: float = seg.get("width", road_width)
		if waypoints.size() < 2:
			continue
		# TODO: Create terrain-following mesh ribbon from waypoints
		# TODO: Create sidewalk ribbons offset from centerline
	for node in nodes:
		var intersection_of: Array = node.get("intersection_of", [])
		if intersection_of.size() >= 2:
			pass # TODO: Place intersection disc mesh
	print("[Insimul] RoadGenerator — rendered %d streets for %s" % [segments.size(), settlement_id])
