extends Node3D
class_name ProceduralBuildingGenerator

@export var base_color := Color({{BASE_COLOR_R}}, {{BASE_COLOR_G}}, {{BASE_COLOR_B}})
@export var roof_color := Color({{ROOF_COLOR_R}}, {{ROOF_COLOR_G}}, {{ROOF_COLOR_B}})
@export var lod_cull_distance := 150.0

var _material_cache := {}


func _get_shared_material(key: String, color: Color) -> StandardMaterial3D:
	if _material_cache.has(key):
		return _material_cache[key]
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	_material_cache[key] = mat
	return mat


func generate_building(pos: Vector3, rotation_y: float, floors: int,
		width: float, depth: float, role: String) -> void:
	var floor_height := 3.0
	var total_height := floors * floor_height

	# Base building
	var building := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(width, total_height, depth)
	building.mesh = box
	building.name = "Building_%s" % role
	building.position = pos + Vector3.UP * total_height / 2.0
	building.rotation.y = rotation_y
	building.material_override = _get_shared_material("wall", base_color)
	add_child(building)

	# Collision
	var body := StaticBody3D.new()
	var col := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = box.size
	col.shape = shape
	body.add_child(col)
	building.add_child(body)

	# Roof
	var roof := MeshInstance3D.new()
	var roof_box := BoxMesh.new()
	roof_box.size = Vector3(width + 1.0, 1.0, depth + 1.0)
	roof.mesh = roof_box
	roof.name = "Roof"
	roof.position = Vector3(0, total_height / 2.0 + 0.5, 0)
	roof.material_override = _get_shared_material("roof", roof_color)
	building.add_child(roof)

	# LOD: add VisibilityNotifier to cull at distance
	var notifier := VisibleOnScreenNotifier3D.new()
	notifier.aabb = AABB(Vector3(-width / 2, 0, -depth / 2), Vector3(width, total_height + 1.0, depth))
	building.add_child(notifier)

	# Freeze transforms — buildings are static geometry
	building.set_notify_transform(false)
