extends Node3D
## Procedural building generator.
## Add to the "world_generator" group.
##
## When buildings have a modelAssetKey, the matching bundled GLTF/GLB is loaded
## at runtime via load(). Otherwise a procedural BoxMesh is used as fallback.

@export var base_color := Color({{BASE_COLOR_R}}, {{BASE_COLOR_G}}, {{BASE_COLOR_B}})
@export var roof_color := Color({{ROOF_COLOR_R}}, {{ROOF_COLOR_G}}, {{ROOF_COLOR_B}})

func _ready() -> void:
	add_to_group("world_generator")

func generate_from_data(world_data: Dictionary) -> void:
	var entities: Dictionary = world_data.get("entities", {})
	var buildings: Array = entities.get("buildings", [])
	var loaded_count := 0
	var procedural_count := 0
	for bld in buildings:
		var pos_dict: Dictionary = bld.get("position", {})
		var pos := Vector3(pos_dict.get("x", 0), pos_dict.get("y", 0), pos_dict.get("z", 0))
		var rot: float = bld.get("rotation", 0.0)
		var model_key: String = bld.get("modelAssetKey", "")

		if model_key != "":
			var scene := load("res://" + model_key) as PackedScene
			if scene:
				var node := scene.instantiate()
				node.name = "Building_%s" % bld.get("id", "unknown")
				add_child(node)
				node.global_position = pos
				node.rotation.y = deg_to_rad(rot)
				loaded_count += 1
				continue

		# Fallback: procedural BoxMesh
		var spec: Dictionary = bld.get("spec", {})
		_generate_building_procedural(
			pos, rot,
			spec.get("floors", 2),
			spec.get("width", 10.0),
			spec.get("depth", 10.0),
			spec.get("buildingRole", "residential"),
		)
		procedural_count += 1

	print("[Insimul] BuildingGenerator: %d from assets, %d procedural" % [loaded_count, procedural_count])

func _generate_building_procedural(pos: Vector3, rot: float, floors: int, width: float, depth: float, role: String) -> void:
	var floor_height := 3.0
	var total_height := floors * floor_height

	# Sample terrain height at corners for foundation adaptation
	var foundation_height := _compute_foundation(pos, rot, width, depth)
	var base_y: float = pos.y + foundation_height

	# Base
	var building := MeshInstance3D.new()
	building.mesh = BoxMesh.new()
	(building.mesh as BoxMesh).size = Vector3(width, total_height, depth)
	building.position = Vector3(pos.x, base_y + total_height / 2.0, pos.z)
	building.rotation.y = deg_to_rad(rot)
	building.name = "Building_%s" % role

	var mat := StandardMaterial3D.new()
	mat.albedo_color = base_color
	building.material_override = mat

	# Collision
	var body := StaticBody3D.new()
	var col := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(width, total_height, depth)
	col.shape = shape
	body.add_child(col)
	building.add_child(body)

	# Foundation geometry (fill gap between terrain and building base)
	if foundation_height > 0.3:
		_add_foundation(building, width, depth, total_height, foundation_height)

	# Roof
	var roof := MeshInstance3D.new()
	roof.mesh = BoxMesh.new()
	(roof.mesh as BoxMesh).size = Vector3(width + 1, 1, depth + 1)
	roof.position = Vector3(0, total_height / 2.0 + 0.5, 0)
	var roof_mat := StandardMaterial3D.new()
	roof_mat.albedo_color = roof_color
	roof.material_override = roof_mat
	building.add_child(roof)

	add_child(building)

## Sample terrain at building corners and return the height delta needed.
func _compute_foundation(pos: Vector3, rot: float, width: float, depth: float) -> float:
	var terrain: Node = _find_terrain()
	if terrain == null or not terrain.has_method("sample_height"):
		return 0.0

	var cos_r: float = cos(deg_to_rad(rot))
	var sin_r: float = sin(deg_to_rad(rot))
	var hw: float = width / 2.0
	var hd: float = depth / 2.0

	# Sample 4 corners + center
	var corners := [
		Vector2(-hw, -hd), Vector2(hw, -hd),
		Vector2(-hw, hd), Vector2(hw, hd), Vector2(0, 0),
	]

	var max_h: float = pos.y
	for c in corners:
		var wx: float = pos.x + cos_r * c.x - sin_r * c.y
		var wz: float = pos.z + sin_r * c.x + cos_r * c.y
		var h: float = terrain.sample_height(wx, wz)
		max_h = maxf(max_h, h)

	return maxf(0.0, max_h - pos.y)

## Add foundation mesh to fill the gap under a building.
func _add_foundation(building: MeshInstance3D, width: float, depth: float,
		total_height: float, fnd_height: float) -> void:
	var fnd_mat := StandardMaterial3D.new()
	fnd_mat.albedo_color = Color(0.45, 0.42, 0.38)  # Stone gray

	if fnd_height <= 1.0:
		# Short foundation: solid stone perimeter wall
		var fnd := MeshInstance3D.new()
		var fnd_box := BoxMesh.new()
		fnd_box.size = Vector3(width + 0.2, fnd_height, depth + 0.2)
		fnd.mesh = fnd_box
		fnd.position.y = -(total_height / 2.0) - fnd_height / 2.0
		fnd.material_override = fnd_mat
		fnd.name = "Foundation"
		building.add_child(fnd)
	elif fnd_height <= 2.5:
		# Medium foundation: stilted posts with cross-beams
		var post_positions := [
			Vector2(-width/2.0 + 0.3, -depth/2.0 + 0.3),
			Vector2(width/2.0 - 0.3, -depth/2.0 + 0.3),
			Vector2(-width/2.0 + 0.3, depth/2.0 - 0.3),
			Vector2(width/2.0 - 0.3, depth/2.0 - 0.3),
		]
		# Add center posts for wide buildings
		if width > 8.0:
			post_positions.append(Vector2(0, -depth/2.0 + 0.3))
			post_positions.append(Vector2(0, depth/2.0 - 0.3))

		var post_mat := StandardMaterial3D.new()
		post_mat.albedo_color = Color(0.35, 0.22, 0.12)  # Wood brown

		for pp in post_positions:
			var post := MeshInstance3D.new()
			var cyl := CylinderMesh.new()
			cyl.top_radius = 0.15
			cyl.bottom_radius = 0.15
			cyl.height = fnd_height
			cyl.radial_segments = 6
			post.mesh = cyl
			post.position = Vector3(pp.x, -(total_height / 2.0) - fnd_height / 2.0, pp.y)
			post.material_override = post_mat
			post.name = "StiltPost"
			building.add_child(post)

		# Cross-beams connecting posts
		var beam := MeshInstance3D.new()
		var beam_box := BoxMesh.new()
		beam_box.size = Vector3(width - 0.4, 0.15, 0.15)
		beam.mesh = beam_box
		beam.position.y = -(total_height / 2.0) - fnd_height * 0.4
		beam.material_override = post_mat
		beam.name = "CrossBeam"
		building.add_child(beam)
	else:
		# Tall foundation: terraced retaining wall
		var wall_count: int = ceili(fnd_height / 1.2)
		var wall_height: float = fnd_height / float(wall_count)
		for i in range(wall_count):
			var shrink: float = 1.0 - float(i) * 0.08
			var wall := MeshInstance3D.new()
			var wall_box := BoxMesh.new()
			wall_box.size = Vector3(
				(width + 0.4) * shrink,
				wall_height,
				(depth + 0.4) * shrink
			)
			wall.mesh = wall_box
			wall.position.y = -(total_height / 2.0) - fnd_height + wall_height * (float(i) + 0.5)
			wall.material_override = fnd_mat
			wall.name = "RetainingWall_%d" % i
			building.add_child(wall)

func _find_terrain() -> Node:
	for gen in get_tree().get_nodes_in_group("world_generator"):
		if gen.has_method("sample_height"):
			return gen
	return null
