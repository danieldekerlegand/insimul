extends Node3D
## Procedural nature/vegetation generator.
## Reads foliage_layers.json and scatters vegetation instances using
## MultiMeshInstance3D for performance.  Falls back to individual
## MeshInstance3D nodes when a layer has few instances.
## Add to the "world_generator" group.

## Threshold: layers with more instances than this use MultiMesh batching.
const MULTIMESH_THRESHOLD := 16

## Color palette per foliage type (used for procedural fallback meshes).
const TYPE_COLORS := {
	"grass":    Color(0.3, 0.6, 0.2),
	"bush":     Color(0.2, 0.5, 0.15),
	"flower":   Color(0.8, 0.3, 0.5),
	"fern":     Color(0.15, 0.55, 0.2),
	"mushroom": Color(0.7, 0.55, 0.35),
	"vine":     Color(0.25, 0.6, 0.25),
}

func _ready() -> void:
	add_to_group("world_generator")

func generate_from_data(world_data: Dictionary) -> void:
	var geo: Dictionary = world_data.get("geography", {})
	var layers: Array = geo.get("foliageLayers", [])
	if layers.is_empty():
		layers = DataLoader.load_foliage_layers()

	var total_instances := 0
	for layer in layers:
		var instances: Array = layer.get("instances", [])
		if instances.is_empty():
			continue
		var foliage_type: String = layer.get("type", "grass")
		if instances.size() > MULTIMESH_THRESHOLD:
			_scatter_multimesh(layer, foliage_type, instances)
		else:
			_scatter_individual(layer, foliage_type, instances)
		total_instances += instances.size()

	print("[Insimul] NatureGenerator: %d layers, %d instances" % [layers.size(), total_instances])

## Scatter a layer using MultiMeshInstance3D for efficient batched rendering.
func _scatter_multimesh(layer: Dictionary, foliage_type: String, instances: Array) -> void:
	var mesh := _create_mesh_for_type(foliage_type)
	var multi_mesh := MultiMesh.new()
	multi_mesh.transform_format = MultiMesh.TRANSFORM_3D
	multi_mesh.mesh = mesh
	multi_mesh.instance_count = instances.size()

	for i in range(instances.size()):
		var inst: Dictionary = instances[i]
		var pos := Vector3(inst.get("x", 0.0), inst.get("y", 0.0), inst.get("z", 0.0))
		var rot: float = inst.get("rotation", 0.0)
		var sc: float = inst.get("scale", 1.0)
		var t := Transform3D()
		t = t.scaled(Vector3(sc, sc, sc))
		t = t.rotated(Vector3.UP, rot)
		t.origin = pos
		multi_mesh.set_instance_transform(i, t)

	var mmi := MultiMeshInstance3D.new()
	mmi.multimesh = multi_mesh
	mmi.name = "Foliage_%s_%s" % [foliage_type, layer.get("settlement_id", "world")]

	var mat := StandardMaterial3D.new()
	mat.albedo_color = TYPE_COLORS.get(foliage_type, Color(0.3, 0.6, 0.2))
	mmi.material_override = mat

	add_child(mmi)

## Scatter a small number of instances as individual MeshInstance3D nodes.
func _scatter_individual(layer: Dictionary, foliage_type: String, instances: Array) -> void:
	var mesh := _create_mesh_for_type(foliage_type)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = TYPE_COLORS.get(foliage_type, Color(0.3, 0.6, 0.2))

	for i in range(instances.size()):
		var inst: Dictionary = instances[i]
		var pos := Vector3(inst.get("x", 0.0), inst.get("y", 0.0), inst.get("z", 0.0))
		var rot: float = inst.get("rotation", 0.0)
		var sc: float = inst.get("scale", 1.0)

		var mi := MeshInstance3D.new()
		mi.mesh = mesh
		mi.material_override = mat
		mi.position = pos
		mi.rotation.y = rot
		mi.scale = Vector3(sc, sc, sc)
		mi.name = "Foliage_%s_%d" % [foliage_type, i]
		add_child(mi)

## Create a simple procedural mesh matching the foliage type.
func _create_mesh_for_type(foliage_type: String) -> Mesh:
	match foliage_type:
		"grass":
			var m := PlaneMesh.new()
			m.size = Vector2(0.4, 0.4)
			return m
		"bush":
			var m := SphereMesh.new()
			m.radius = 0.5
			m.height = 0.8
			return m
		"flower":
			var m := SphereMesh.new()
			m.radius = 0.15
			m.height = 0.5
			return m
		"fern":
			var m := PlaneMesh.new()
			m.size = Vector2(0.6, 0.6)
			return m
		"mushroom":
			var m := CylinderMesh.new()
			m.top_radius = 0.2
			m.bottom_radius = 0.05
			m.height = 0.3
			return m
		_:
			var m := SphereMesh.new()
			m.radius = 0.3
			m.height = 0.6
			return m
