extends Node3D
## Manages world terrain and scale.
## Add to the "world_generator" group.

@export var terrain_size := {{TERRAIN_SIZE}}
@export var ground_color := Color({{GROUND_COLOR_R}}, {{GROUND_COLOR_G}}, {{GROUND_COLOR_B}})
@export var sky_color := Color({{SKY_COLOR_R}}, {{SKY_COLOR_G}}, {{SKY_COLOR_B}})

func _ready() -> void:
	add_to_group("world_generator")

func generate_from_data(world_data: Dictionary) -> void:
	var geo: Dictionary = world_data.get("geography", {})
	terrain_size = geo.get("terrainSize", terrain_size)
	print("[Insimul] WorldScaleManager initialized (terrain: %d)" % terrain_size)
	_generate_terrain()
	_setup_sky()

func _generate_terrain() -> void:
	var plane := MeshInstance3D.new()
	var mesh := PlaneMesh.new()
	mesh.size = Vector2(terrain_size, terrain_size)
	plane.mesh = mesh
	plane.name = "Terrain"

	var mat := StandardMaterial3D.new()
	mat.albedo_color = ground_color
	plane.material_override = mat

	# Add collision
	var body := StaticBody3D.new()
	var col := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(terrain_size, 0.1, terrain_size)
	col.shape = shape
	body.add_child(col)
	plane.add_child(body)

	add_child(plane)

func _setup_sky() -> void:
	var env := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = sky_color
	environment.ambient_light_color = sky_color
	environment.ambient_light_energy = 0.5
	env.environment = environment
	add_child(env)

static func get_settlement_radius(population: int) -> float:
	if population <= 50: return 20.0
	if population <= 200: return 35.0
	if population <= 1000: return 55.0
	if population <= 5000: return 80.0
	return 120.0
