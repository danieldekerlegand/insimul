extends Node3D
class_name ProceduralBuildingGenerator

@export var base_color := Color({{BASE_COLOR_R}}, {{BASE_COLOR_G}}, {{BASE_COLOR_B}})
@export var roof_color := Color({{ROOF_COLOR_R}}, {{ROOF_COLOR_G}}, {{ROOF_COLOR_B}})
@export var lod_cull_distance := 150.0

var _material_cache := {}

## Role-based model prototypes registered via register_role_model.
var _role_model_prototypes: Dictionary = {}

## Optional wall texture override for procedural buildings.
var _wall_texture: Texture2D = null

## Optional roof texture override for procedural buildings.
var _roof_texture: Texture2D = null

## Style presets matching the Babylon.js source engine.
const STYLE_PRESETS := {
	"medieval_wood": {
		"name": "Medieval Wood",
		"base_color": Color(0.55, 0.35, 0.2),
		"roof_color": Color(0.3, 0.2, 0.15),
		"window_color": Color(0.9, 0.9, 0.7),
		"door_color": Color(0.4, 0.25, 0.15),
		"material_type": "wood",
		"architecture_style": "medieval"
	},
	"medieval_stone": {
		"name": "Medieval Stone",
		"base_color": Color(0.6, 0.6, 0.55),
		"roof_color": Color(0.35, 0.2, 0.15),
		"window_color": Color(0.7, 0.8, 0.9),
		"door_color": Color(0.3, 0.2, 0.1),
		"material_type": "stone",
		"architecture_style": "medieval"
	},
	"modern_concrete": {
		"name": "Modern Concrete",
		"base_color": Color(0.7, 0.7, 0.7),
		"roof_color": Color(0.3, 0.3, 0.3),
		"window_color": Color(0.6, 0.7, 0.8),
		"door_color": Color(0.5, 0.5, 0.5),
		"material_type": "brick",
		"architecture_style": "modern"
	},
	"futuristic_metal": {
		"name": "Futuristic Metal",
		"base_color": Color(0.6, 0.65, 0.7),
		"roof_color": Color(0.2, 0.25, 0.3),
		"window_color": Color(0.5, 0.7, 0.9),
		"door_color": Color(0.3, 0.4, 0.5),
		"material_type": "metal",
		"architecture_style": "futuristic"
	},
	"rustic_cottage": {
		"name": "Rustic Cottage",
		"base_color": Color(0.7, 0.5, 0.3),
		"roof_color": Color(0.5, 0.35, 0.2),
		"window_color": Color(0.8, 0.85, 0.7),
		"door_color": Color(0.5, 0.3, 0.2),
		"material_type": "wood",
		"architecture_style": "rustic"
	}
}

## Zone-based scale multipliers for building dimensions.
## Commercial buildings are taller and wider; residential is the baseline.
const ZONE_SCALE := {
	"commercial":  { "floors": 1.3, "width": 1.15, "depth": 1.1 },
	"residential": { "floors": 1.0, "width": 1.0,  "depth": 1.0 }
}

## Default building dimensions indexed by business type.
const BUILDING_TYPES := {
	# Businesses
	"Bakery":           { "floors": 2, "width": 12, "depth": 10, "has_chimney": true,  "has_balcony": false },
	"Restaurant":       { "floors": 2, "width": 15, "depth": 12, "has_chimney": false, "has_balcony": false },
	"Tavern":           { "floors": 2, "width": 14, "depth": 14, "has_chimney": false, "has_balcony": true  },
	"Inn":              { "floors": 3, "width": 16, "depth": 14, "has_chimney": false, "has_balcony": true  },
	"Market":           { "floors": 1, "width": 20, "depth": 15, "has_chimney": false, "has_balcony": false },
	"Shop":             { "floors": 2, "width": 10, "depth": 8,  "has_chimney": false, "has_balcony": false },
	"Blacksmith":       { "floors": 1, "width": 12, "depth": 10, "has_chimney": true,  "has_balcony": false },
	"LawFirm":          { "floors": 3, "width": 12, "depth": 10, "has_chimney": false, "has_balcony": false },
	"Bank":             { "floors": 2, "width": 14, "depth": 12, "has_chimney": false, "has_balcony": false },
	"Hospital":         { "floors": 3, "width": 20, "depth": 18, "has_chimney": false, "has_balcony": false },
	"School":           { "floors": 2, "width": 18, "depth": 16, "has_chimney": false, "has_balcony": false },
	"Church":           { "floors": 1, "width": 16, "depth": 24, "has_chimney": false, "has_balcony": false },
	"Theater":          { "floors": 2, "width": 18, "depth": 20, "has_chimney": false, "has_balcony": false },
	"Library":          { "floors": 3, "width": 16, "depth": 14, "has_chimney": false, "has_balcony": false },
	"ApartmentComplex": { "floors": 5, "width": 18, "depth": 16, "has_chimney": false, "has_balcony": true  },
	"Windmill":         { "floors": 3, "width": 10, "depth": 10, "has_chimney": false, "has_balcony": false },
	"Watermill":        { "floors": 2, "width": 14, "depth": 12, "has_chimney": false, "has_balcony": false },
	"Lumbermill":       { "floors": 1, "width": 16, "depth": 12, "has_chimney": true,  "has_balcony": false },
	"Barracks":         { "floors": 2, "width": 18, "depth": 14, "has_chimney": false, "has_balcony": false },
	"Mine":             { "floors": 1, "width": 12, "depth": 10, "has_chimney": false, "has_balcony": false },
	# Residences
	"residence_small":   { "floors": 1, "width": 8,  "depth": 8,  "has_chimney": false, "has_balcony": false },
	"residence_medium":  { "floors": 2, "width": 10, "depth": 10, "has_chimney": true,  "has_balcony": false },
	"residence_large":   { "floors": 2, "width": 14, "depth": 12, "has_chimney": true,  "has_balcony": true  },
	"residence_mansion": { "floors": 3, "width": 20, "depth": 18, "has_chimney": true,  "has_balcony": true  }
}


## Register a prefab scene for a building role. Matching roles instance this
## scene instead of generating procedural geometry.
func register_role_model(role: String, scene: PackedScene) -> void:
	if role.is_empty() or scene == null:
		return
	_role_model_prototypes[role] = scene
	print("[Insimul] Registered role model: %s" % role)


## Override wall texture for procedural buildings.
func set_wall_texture(texture: Texture2D) -> void:
	_wall_texture = texture


## Override roof texture for procedural buildings.
func set_roof_texture(texture: Texture2D) -> void:
	_roof_texture = texture


## Return an appropriate style preset key for the given world type and terrain.
static func get_style_for_world(world_type: String, terrain: String) -> Dictionary:
	var wt := world_type.to_lower()
	var tr := terrain.to_lower()

	if wt.contains("medieval") or wt.contains("fantasy"):
		if tr.contains("forest") or tr.contains("rural"):
			return STYLE_PRESETS["medieval_wood"]
		return STYLE_PRESETS["medieval_stone"]
	if wt.contains("cyberpunk") or wt.contains("sci-fi") or wt.contains("futuristic"):
		return STYLE_PRESETS["futuristic_metal"]
	if wt.contains("modern"):
		return STYLE_PRESETS["modern_concrete"]
	if tr.contains("rural") or tr.contains("village"):
		return STYLE_PRESETS["rustic_cottage"]

	return STYLE_PRESETS["medieval_wood"]


func _get_shared_material(key: String, color: Color) -> StandardMaterial3D:
	if _material_cache.has(key):
		return _material_cache[key]
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	_material_cache[key] = mat
	return mat


func generate_building(pos: Vector3, rotation_y: float, floors: int,
		width: float, depth: float, role: String,
		foundation: Dictionary = {}) -> void:

	# Create terrain-adaptive foundation: raise building to sit on highest corner
	var fnd_type: String = foundation.get("type", "flat")
	var fnd_height: float = foundation.get("foundation_height", 0.0)
	if fnd_type != "flat" and fnd_height > 0.0:
		var base_elev: float = foundation.get("base_elevation", 0.0)
		var top_y := base_elev + fnd_height
		pos.y = top_y
		print("[Insimul] Foundation type=%s height=%.1f, raised to Y=%.1f" % [fnd_type, fnd_height, top_y])

	# Check for a registered role model first.
	# Uses full scene instantiation (not MultiMesh) for RTT/minimap compatibility.
	if _role_model_prototypes.has(role):
		var scene: PackedScene = _role_model_prototypes[role]
		if scene != null:
			var instance := scene.instantiate()
			instance.name = "Building_%s" % role
			instance.position = pos
			instance.rotation.y = rotation_y
			add_child(instance)
			print("[Insimul] Placed role model for %s" % role)
			return

	# Procedural fallback
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

	# Apply wall texture override or shared color material
	if _wall_texture != null:
		var wall_mat := _get_shared_material("wall_tex", Color.WHITE)
		wall_mat.albedo_texture = _wall_texture
		building.material_override = wall_mat
	else:
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

	# Determine style-aware roof height
	var peaked_roof_height := 3.0
	var actual_roof_height: float
	# TODO: pass architecture_style from world data for proper selection
	var arch_style := "medieval"
	if arch_style == "modern" or arch_style == "futuristic":
		actual_roof_height = 0.5
	else:
		actual_roof_height = peaked_roof_height

	# Roof — positioned flush on top of building walls
	var roof := MeshInstance3D.new()
	var roof_box := BoxMesh.new()
	roof_box.size = Vector3(width + 1.0, actual_roof_height, depth + 1.0)
	roof.mesh = roof_box
	roof.name = "Roof"
	roof.position = Vector3(0, total_height / 2.0 + actual_roof_height / 2.0, 0)

	# Apply roof texture override or shared color material
	if _roof_texture != null:
		var roof_mat := _get_shared_material("roof_tex", Color.WHITE)
		roof_mat.albedo_texture = _roof_texture
		roof.material_override = roof_mat
	else:
		roof.material_override = _get_shared_material("roof", roof_color)
	building.add_child(roof)

	# Door with frame, panel, and handle
	_add_door(building, width, depth, floors, total_height)

	# LOD: add VisibilityNotifier to cull at distance
	var notifier := VisibleOnScreenNotifier3D.new()
	notifier.aabb = AABB(Vector3(-width / 2, 0, -depth / 2), Vector3(width, total_height + 1.0, depth))
	building.add_child(notifier)

	# Propagate LOD cull distance to all child meshes so unmerged children
	# (e.g. door, roof) don't remain visible when the parent building is LOD-hidden.
	for child in building.get_children():
		if child is MeshInstance3D and child.visibility_range_end <= 0.0:
			child.visibility_range_end = lod_cull_distance

	# Freeze transforms — buildings are static geometry
	building.set_notify_transform(false)


## Add door with frame, panel, and handle to a building.
func _add_door(building: MeshInstance3D, width: float, depth: float,
		floors: int, total_height: float) -> void:
	var door_width := 1.2
	var door_height := 2.2
	var door_depth := 0.15
	var frame_thickness := 0.12
	var frame_depth := 0.18
	var front_z := depth / 2.0
	# Ground level in building's local space (building is centered vertically)
	var ground_y := -total_height / 2.0

	# Door frame material (darker than door color)
	var style := get_style_for_world("", "")
	var frame_color: Color = style.get("door_color", Color(0.4, 0.25, 0.15)) * 0.5
	var frame_mat := _get_shared_material("doorframe", frame_color)

	# Left frame post
	var left_post := MeshInstance3D.new()
	var left_box := BoxMesh.new()
	left_box.size = Vector3(frame_thickness, door_height + frame_thickness, frame_depth)
	left_post.mesh = left_box
	left_post.name = "DoorFrame_L"
	left_post.position = Vector3(-door_width / 2.0 - frame_thickness / 2.0,
		ground_y + (door_height + frame_thickness) / 2.0, front_z + frame_depth / 2.0)
	left_post.material_override = frame_mat
	building.add_child(left_post)

	# Right frame post
	var right_post := MeshInstance3D.new()
	var right_box := BoxMesh.new()
	right_box.size = Vector3(frame_thickness, door_height + frame_thickness, frame_depth)
	right_post.mesh = right_box
	right_post.name = "DoorFrame_R"
	right_post.position = Vector3(door_width / 2.0 + frame_thickness / 2.0,
		ground_y + (door_height + frame_thickness) / 2.0, front_z + frame_depth / 2.0)
	right_post.material_override = frame_mat
	building.add_child(right_post)

	# Top frame (lintel)
	var lintel := MeshInstance3D.new()
	var lintel_box := BoxMesh.new()
	lintel_box.size = Vector3(door_width + frame_thickness * 2.0, frame_thickness, frame_depth)
	lintel.mesh = lintel_box
	lintel.name = "DoorFrame_T"
	lintel.position = Vector3(0, ground_y + door_height + frame_thickness / 2.0,
		front_z + frame_depth / 2.0)
	lintel.material_override = frame_mat
	building.add_child(lintel)

	# Door panel
	var door_color: Color = style.get("door_color", Color(0.4, 0.25, 0.15))
	var door_mat := _get_shared_material("door", door_color)
	var door := MeshInstance3D.new()
	var door_box := BoxMesh.new()
	door_box.size = Vector3(door_width, door_height, door_depth)
	door.mesh = door_box
	door.name = "Door"
	door.position = Vector3(0, ground_y + door_height / 2.0, front_z + door_depth / 2.0)
	door.material_override = door_mat
	building.add_child(door)

	# Door handle (metallic brass)
	var handle_mat := _get_shared_material("door_handle", Color(0.7, 0.65, 0.4))
	var handle := MeshInstance3D.new()
	var handle_box := BoxMesh.new()
	handle_box.size = Vector3(0.06, 0.2, 0.06)
	handle.mesh = handle_box
	handle.name = "DoorHandle"
	handle.position = Vector3(door_width / 2.0 - 0.2, ground_y + 1.0,
		front_z + door_depth + 0.03)
	handle.material_override = handle_mat
	building.add_child(handle)
