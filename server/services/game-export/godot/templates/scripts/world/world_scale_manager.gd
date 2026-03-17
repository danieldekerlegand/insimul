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

const SPAWN_CLEAR_RADIUS := 15.0

const POP_SCALE := {
	"tiny": {"min": 0, "max": 50, "radius": 20.0},
	"small": {"min": 51, "max": 200, "radius": 35.0},
	"medium": {"min": 201, "max": 1000, "radius": 55.0},
	"large": {"min": 1001, "max": 5000, "radius": 80.0},
	"huge": {"min": 5001, "max": 999999, "radius": 120.0},
}

static func get_settlement_radius(population: int) -> float:
	if population <= 50: return 20.0
	if population <= 200: return 35.0
	if population <= 1000: return 55.0
	if population <= 5000: return 80.0
	return 120.0

static func get_settlement_tier(population: int) -> String:
	if population < 100: return "hamlet"
	if population < 500: return "village"
	if population < 2000: return "town"
	if population < 10000: return "city"
	return "metropolis"

static func generate_lot_positions(settlement_position: Vector3, settlement_radius: float, lot_count: int, street_names: PackedStringArray = PackedStringArray()) -> Array[Vector3]:
	var positions: Array[Vector3] = []
	if lot_count <= 0:
		return positions

	var cols := ceili(sqrt(float(lot_count)))
	var rows := ceili(float(lot_count) / cols)
	var lot_spacing := 20.0
	var grid_width := (cols - 1) * lot_spacing
	var grid_height := (rows - 1) * lot_spacing

	var rng := RandomNumberGenerator.new()
	rng.seed = hash(settlement_position)

	for i in range(lot_count):
		var row := i / cols
		var col := i % cols

		var base_x := settlement_position.x - grid_width / 2.0 + col * lot_spacing
		var base_z := settlement_position.z - grid_height / 2.0 + row * lot_spacing

		var jitter_x := (rng.randf() - 0.5) * 4.0
		var jitter_z := (rng.randf() - 0.5) * 4.0

		var lot_x := base_x + jitter_x
		var lot_z := base_z + jitter_z

		# Push lots outside spawn clear radius
		var dx := lot_x - settlement_position.x
		var dz := lot_z - settlement_position.z
		var dist := sqrt(dx * dx + dz * dz)
		if dist < SPAWN_CLEAR_RADIUS:
			var angle: float
			if dist > 0.001:
				angle = atan2(dz, dx)
			else:
				angle = i * PI * 0.618
			lot_x = settlement_position.x + cos(angle) * SPAWN_CLEAR_RADIUS
			lot_z = settlement_position.z + sin(angle) * SPAWN_CLEAR_RADIUS

		positions.append(Vector3(lot_x, 0.0, lot_z))

	return positions

## Distribute settlements within territory bounds, using 25% margin and
## center-placement for single settlements.
static func distribute_settlements(
	bounds_min: Vector3, bounds_max: Vector3, bounds_center: Vector3,
	settlement_count: int, radii: Array[float], world_seed: int
) -> Array[Vector3]:
	var positions: Array[Vector3] = []
	if settlement_count <= 0:
		return positions

	var bounds_w := bounds_max.x - bounds_min.x
	var bounds_h := bounds_max.z - bounds_min.z

	# Reserve 25% of the world radius as margin on each side so buildings
	# never approach the terrain edge (which shows as void/water on the minimap).
	var margin := minf(bounds_w, bounds_h) * 0.25
	var safe_min_x := bounds_min.x + margin
	var safe_max_x := bounds_max.x - margin
	var safe_min_z := bounds_min.z + margin
	var safe_max_z := bounds_max.z - margin

	var rng := RandomNumberGenerator.new()
	rng.seed = world_seed

	for index in range(settlement_count):
		var radius: float = radii[index] if index < radii.size() else 20.0
		var position: Vector3

		if settlement_count == 1:
			# Single settlement: place exactly at world center
			position = bounds_center
		else:
			var attempts := 0
			var max_attempts := 50
			var placed := false
			position = Vector3.ZERO

			while attempts < max_attempts:
				var x := safe_min_x + rng.randf() * maxf(safe_max_x - safe_min_x, 1.0)
				var z := safe_min_z + rng.randf() * maxf(safe_max_z - safe_min_z, 1.0)
				position = Vector3(x, 0.0, z)

				# Check if too close to other settlements
				var too_close := false
				for j in range(positions.size()):
					var d := position.distance_to(positions[j])
					var other_radius: float = radii[j] if j < radii.size() else 20.0
					if d < (radius + other_radius + 10.0):
						too_close = true
						break

				if not too_close:
					placed = true
					break
				attempts += 1

			# If couldn't find good position, use grid fallback centered in the safe zone
			if not placed:
				var cols := ceili(sqrt(float(settlement_count)))
				var row := index / cols
				var col := index % cols

				var cell_width := (safe_max_x - safe_min_x) / cols
				var cell_height := (safe_max_z - safe_min_z) / ceili(float(settlement_count) / cols)

				position = Vector3(
					safe_min_x + col * cell_width + cell_width / 2.0,
					0.0,
					safe_min_z + row * cell_height + cell_height / 2.0
				)

		positions.append(position)

	return positions

## Generate a full street-aligned layout for a settlement.
## Returns lot positions, facing angles, and street metadata.
## existing_street_points can be used to align with a pre-existing street network.
static func generate_street_aligned_settlement(settlement_position: Vector3, settlement_radius: float, lot_count: int, biz_count: int = 0, street_names: PackedStringArray = PackedStringArray(), existing_street_points: Array[Vector3] = []) -> Dictionary:
	# TODO: Implement street-aligned placement (main street + side streets).
	# For now, falls back to grid+jitter via generate_lot_positions.
	push_warning("[Insimul] generate_street_aligned_settlement not yet implemented in export template")
	return {"streets": [], "lots": []}

## Calculate recommended world size based on entity counts.
## Minimum 1024 so that a single town's server-generated street grid
## (mapSize 500-1000) fits comfortably within the world with margin.
static func calculate_optimal_world_size(country_count: int, state_count: int, settlement_count: int) -> int:
	var max_entities := maxf(country_count, maxf(state_count / 2.0, settlement_count / 5.0))
	if max_entities <= 4.0: return 1024
	if max_entities <= 9.0: return 1536
	if max_entities <= 16.0: return 2048
	if max_entities <= 25.0: return 2560
	return 3072
