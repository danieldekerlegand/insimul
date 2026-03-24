extends Node3D
## Road generator.
## Add to the "world_generator" group.
##
## Builds procedural ribbon meshes along waypoints for both street segments
## and inter-settlement roads. Each road gets a MeshInstance3D with collision.
##
## StreetNetwork data (from shared/game-engine/types.ts):
##   StreetNode:    { id: String, position: {x,y,z}, intersectionOf: Array[String] }
##   StreetSegment: { id: String, name: String, direction: String, nodeIds: Array[String],
##                    waypoints: Array[{ x: float, y: float, z: float }], width: float }
##   StreetNetwork: { nodes: Array[StreetNode], segments: Array[StreetSegment] }

@export var road_color := Color({{ROAD_COLOR_R}}, {{ROAD_COLOR_G}}, {{ROAD_COLOR_B}})
@export var road_width := {{ROAD_WIDTH}}
@export var road_elevation := 0.05

var _road_material: StandardMaterial3D

func _ready() -> void:
	add_to_group("world_generator")
	_road_material = StandardMaterial3D.new()
	_road_material.albedo_color = road_color
	_road_material.cull_mode = BaseMaterial3D.CULL_DISABLED

func generate_from_data(world_data: Dictionary) -> void:
	var street_count := 0
	var road_count := 0

	# Generate named streets from settlement street networks
	var geo: Dictionary = world_data.get("geography", {})
	var settlements: Array = geo.get("settlements", [])
	for settlement in settlements:
		var sn: Variant = settlement.get("streetNetwork", null)
		if sn == null or not (sn is Dictionary):
			continue
		var segments: Array = sn.get("segments", [])
		for seg in segments:
			var waypoints: Array = seg.get("waypoints", [])
			if waypoints.size() < 2:
				continue
			var w: float = seg.get("width", road_width)
			var points := _parse_waypoints(waypoints)
			_create_road_mesh("Street_%s_%s" % [seg.get("name", ""), seg.get("id", "")], points, w)
			street_count += 1
		# Generate intersection discs
		var nodes: Array = sn.get("nodes", [])
		for node in nodes:
			var intersection_of: Array = node.get("intersectionOf", [])
			if intersection_of.size() >= 2:
				var pos: Dictionary = node.get("position", {})
				_create_intersection_disc(
					Vector3(pos.get("x", 0.0), pos.get("y", 0.0) + road_elevation, pos.get("z", 0.0)),
					road_width * 0.75
				)

	# Generate inter-settlement roads
	var entities: Dictionary = world_data.get("entities", {})
	var roads: Array = entities.get("roads", [])
	for road in roads:
		var waypoints: Array = road.get("waypoints", [])
		if waypoints.size() < 2:
			continue
		var w: float = road.get("width", road_width)
		var points := _parse_waypoints(waypoints)
		_create_road_mesh("Road_%d" % road_count, points, w)
		road_count += 1

	print("[Insimul] Roads: %d street segments, %d inter-settlement roads" % [street_count, road_count])

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
		var points := _parse_waypoints(waypoints)
		# Apply terrain-following height
		for i in range(points.size()):
			points[i].y = sample_height.call(points[i].x, points[i].z) + road_elevation
		_create_road_mesh("Street_%s_%s" % [settlement_id, seg.get("id", "")], points, width)
	for node in nodes:
		var intersection_of: Array = node.get("intersectionOf", [])
		if intersection_of.size() >= 2:
			var pos: Dictionary = node.get("position", {})
			var x: float = pos.get("x", 0.0)
			var z: float = pos.get("z", 0.0)
			var y: float = sample_height.call(x, z) + road_elevation
			_create_intersection_disc(Vector3(x, y, z), road_width * 0.75)
	print("[Insimul] RoadGenerator — rendered %d streets for %s" % [segments.size(), settlement_id])

func _parse_waypoints(waypoints: Array) -> PackedVector3Array:
	var points := PackedVector3Array()
	points.resize(waypoints.size())
	for i in range(waypoints.size()):
		var wp: Dictionary = waypoints[i]
		points[i] = Vector3(
			wp.get("x", 0.0),
			wp.get("y", 0.0) + road_elevation,
			wp.get("z", 0.0)
		)
	return points

func _create_road_mesh(road_name: String, waypoints: PackedVector3Array, width: float) -> void:
	var mesh := _build_ribbon_mesh(waypoints, width)
	if mesh == null:
		return
	var mesh_inst := MeshInstance3D.new()
	mesh_inst.mesh = mesh
	mesh_inst.name = road_name
	mesh_inst.material_override = _road_material
	mesh_inst.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(mesh_inst)
	# Add static collision
	mesh_inst.create_trimesh_collision()

func _create_intersection_disc(center: Vector3, radius: float) -> void:
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = 0.02
	var mesh_inst := MeshInstance3D.new()
	mesh_inst.mesh = mesh
	mesh_inst.position = center
	mesh_inst.material_override = _road_material
	mesh_inst.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(mesh_inst)

## Builds a flat ribbon mesh along a polyline path.
## For each waypoint, two vertices are placed perpendicular to the path
## direction at +/- width/2. Triangles connect consecutive pairs.
static func _build_ribbon_mesh(waypoints: PackedVector3Array, width: float) -> ArrayMesh:
	var n := waypoints.size()
	if n < 2:
		return null

	var vertices := PackedVector3Array()
	var normals := PackedVector3Array()
	var uvs := PackedVector2Array()
	vertices.resize(n * 2)
	normals.resize(n * 2)
	uvs.resize(n * 2)

	var half_width := width * 0.5
	var cumulative_length := 0.0

	for i in range(n):
		# Compute tangent direction at this waypoint
		var forward: Vector3
		if i == 0:
			forward = (waypoints[1] - waypoints[0]).normalized()
		elif i == n - 1:
			forward = (waypoints[n - 1] - waypoints[n - 2]).normalized()
		else:
			forward = (waypoints[i + 1] - waypoints[i - 1]).normalized()

		# Fallback for zero-length tangent (duplicate points)
		if forward.length_squared() < 0.0001:
			forward = Vector3.FORWARD

		# Perpendicular in XZ plane (roads are flat ribbons)
		var right := Vector3(forward.z, 0.0, -forward.x).normalized()
		if right.length_squared() < 0.0001:
			right = Vector3.RIGHT

		vertices[i * 2]     = waypoints[i] - right * half_width
		vertices[i * 2 + 1] = waypoints[i] + right * half_width

		normals[i * 2]     = Vector3.UP
		normals[i * 2 + 1] = Vector3.UP

		# Accumulate length for UV tiling
		if i > 0:
			cumulative_length += waypoints[i].distance_to(waypoints[i - 1])

		var v_coord := cumulative_length / width
		uvs[i * 2]     = Vector2(0.0, v_coord)
		uvs[i * 2 + 1] = Vector2(1.0, v_coord)

	# Build triangle indices: two triangles per segment
	var segment_count := n - 1
	var indices := PackedInt32Array()
	indices.resize(segment_count * 6)
	for i in range(segment_count):
		var bl := i * 2
		var br := i * 2 + 1
		var tl := (i + 1) * 2
		var tr := (i + 1) * 2 + 1
		indices[i * 6]     = bl
		indices[i * 6 + 1] = tl
		indices[i * 6 + 2] = br
		indices[i * 6 + 3] = br
		indices[i * 6 + 4] = tl
		indices[i * 6 + 5] = tr

	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = vertices
	arrays[Mesh.ARRAY_NORMAL] = normals
	arrays[Mesh.ARRAY_TEX_UV] = uvs
	arrays[Mesh.ARRAY_INDEX]  = indices

	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	return mesh
