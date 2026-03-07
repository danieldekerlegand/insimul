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

	# Base
	var building := MeshInstance3D.new()
	building.mesh = BoxMesh.new()
	(building.mesh as BoxMesh).size = Vector3(width, total_height, depth)
	building.position = pos + Vector3.UP * total_height / 2.0
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
