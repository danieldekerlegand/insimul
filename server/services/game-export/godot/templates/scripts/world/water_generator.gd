extends Node3D
## Water feature generator.
## Reads water_features.json and creates visual water planes/meshes for each
## water body (lakes, rivers, ponds, oceans, streams, waterfalls, marshes, canals).
## Add to the "world_generator" group.

@export var default_water_color := Color({{WATER_COLOR_R}}, {{WATER_COLOR_G}}, {{WATER_COLOR_B}}, {{WATER_ALPHA}})

func _ready() -> void:
	add_to_group("world_generator")

func generate_from_data(world_data: Dictionary) -> void:
	var geo: Dictionary = world_data.get("geography", {})
	var features: Array = geo.get("waterFeatures", [])
	if features.is_empty():
		features = DataLoader.load_water_features()
	var asset_count := 0
	var procedural_count := 0
	for feature in features:
		var water_type: String = feature.get("type", "lake")
		var model_key: String = feature.get("modelAssetKey", "")
		if not model_key.is_empty():
			asset_count += 1
		else:
			_generate_procedural_water(feature, water_type)
			procedural_count += 1
	print("[Insimul] WaterGenerator: %d from assets, %d procedural" % [asset_count, procedural_count])

func _generate_procedural_water(feature: Dictionary, water_type: String) -> void:
	var pos: Dictionary = feature.get("position", {})
	var water_level: float = feature.get("waterLevel", 0.0)
	var bounds: Dictionary = feature.get("bounds", {})
	var color_data: Variant = feature.get("color", null)
	var transparency: float = feature.get("transparency", 0.3)

	var water_color := default_water_color
	if color_data is Dictionary:
		water_color = Color(
			color_data.get("r", default_water_color.r),
			color_data.get("g", default_water_color.g),
			color_data.get("b", default_water_color.b),
			1.0 - transparency
		)
	else:
		water_color.a = 1.0 - transparency

	match water_type:
		"lake", "pond", "ocean", "marsh":
			_create_still_water(feature, bounds, water_level, water_color)
		"river", "stream", "canal":
			_create_flowing_water(feature, bounds, water_level, water_color)
		"waterfall":
			_create_waterfall(feature, water_level, water_color)

func _create_still_water(feature: Dictionary, bounds: Dictionary, water_level: float, color: Color) -> void:
	var min_x: float = bounds.get("minX", 0.0)
	var max_x: float = bounds.get("maxX", 10.0)
	var min_z: float = bounds.get("minZ", 0.0)
	var max_z: float = bounds.get("maxZ", 10.0)
	var center_x: float = bounds.get("centerX", (min_x + max_x) / 2.0)
	var center_z: float = bounds.get("centerZ", (min_z + max_z) / 2.0)
	var size_x: float = max_x - min_x
	var size_z: float = max_z - min_z

	var mesh := PlaneMesh.new()
	mesh.size = Vector2(size_x, size_z)
	var mesh_inst := MeshInstance3D.new()
	mesh_inst.mesh = mesh
	mesh_inst.position = Vector3(center_x, water_level, center_z)

	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mesh_inst.material_override = mat

	mesh_inst.name = "Water_%s" % feature.get("id", "unknown")
	add_child(mesh_inst)

func _create_flowing_water(feature: Dictionary, bounds: Dictionary, water_level: float, color: Color) -> void:
	var shoreline: Array = feature.get("shorelinePoints", [])
	var width: float = feature.get("width", 4.0)
	if shoreline.size() < 2:
		_create_still_water(feature, bounds, water_level, color)
		return

	# Create a plane per segment between consecutive shoreline points
	for i in range(shoreline.size() - 1):
		var p0: Dictionary = shoreline[i]
		var p1: Dictionary = shoreline[i + 1]
		var start := Vector3(p0.get("x", 0.0), water_level, p0.get("z", 0.0))
		var end := Vector3(p1.get("x", 0.0), water_level, p1.get("z", 0.0))
		var mid := (start + end) / 2.0
		var seg_len := start.distance_to(end)
		if seg_len < 0.1:
			continue

		var mesh := PlaneMesh.new()
		mesh.size = Vector2(width, seg_len)
		var mesh_inst := MeshInstance3D.new()
		mesh_inst.mesh = mesh
		mesh_inst.position = mid

		# Rotate to align with segment direction
		var dir := (end - start).normalized()
		mesh_inst.rotation.y = atan2(dir.x, dir.z)

		var mat := StandardMaterial3D.new()
		mat.albedo_color = color
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		mat.cull_mode = BaseMaterial3D.CULL_DISABLED
		mesh_inst.material_override = mat

		mesh_inst.name = "Water_%s_seg%d" % [feature.get("id", "unknown"), i]
		add_child(mesh_inst)

func _create_waterfall(feature: Dictionary, water_level: float, color: Color) -> void:
	var pos: Dictionary = feature.get("position", {})
	var depth: float = feature.get("depth", 5.0)
	var width: float = feature.get("width", 3.0)
	var x: float = pos.get("x", 0.0)
	var z: float = pos.get("z", 0.0)

	# Vertical plane for the waterfall face
	var mesh := PlaneMesh.new()
	mesh.size = Vector2(width, depth)
	mesh.orientation = PlaneMesh.FACE_Z
	var mesh_inst := MeshInstance3D.new()
	mesh_inst.mesh = mesh
	mesh_inst.position = Vector3(x, water_level - depth / 2.0, z)

	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mesh_inst.material_override = mat

	mesh_inst.name = "Water_%s" % feature.get("id", "unknown")
	add_child(mesh_inst)
