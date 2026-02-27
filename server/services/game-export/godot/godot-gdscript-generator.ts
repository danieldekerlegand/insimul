/**
 * Godot GDScript Generator
 *
 * Generates GDScript (.gd) files for the Godot 4.x project:
 * - Core (GameManager, DataLoader autoloads)
 * - Characters (PlayerController, NPCController)
 * - Systems (Action, Combat, Quest, Inventory, Crafting, Resource, Survival, Dialogue, Rule)
 * - World generators (WorldScale, Building, Road, Nature, Dungeon)
 * - UI (HUD, QuestTracker, GameMenu)
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './godot-project-generator';

// ─────────────────────────────────────────────
// Core
// ─────────────────────────────────────────────

function genCoreScripts(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'scripts/core';

  files.push({ path: `${base}/game_manager.gd`, content: `extends Node
## Central game manager — autoloaded singleton.
## Orchestrates data loading and world spawning.

signal world_loaded
signal world_spawned

var world_data: Dictionary = {}
var is_data_loaded := false

func _ready() -> void:
	load_world_data()
	if is_data_loaded:
		spawn_world()

func load_world_data() -> void:
	world_data = DataLoader.load_world_data()
	if world_data.is_empty():
		push_error("[Insimul] Failed to load world data")
		return
	is_data_loaded = true
	var meta: Dictionary = world_data.get("meta", {})
	print("[Insimul] Loaded world: %s (type: %s)" % [meta.get("worldName", "?"), meta.get("worldType", "?")])
	world_loaded.emit()

func spawn_world() -> void:
	print("[Insimul] Spawning world entities...")
	# Generators are expected as children of the main scene or found via groups
	for gen in get_tree().get_nodes_in_group("world_generator"):
		if gen.has_method("generate_from_data"):
			gen.generate_from_data(world_data)

	# Initialize systems
	ActionSystem.load_from_data(world_data)
	QuestSystem.load_from_data(world_data)
	CombatSystem.load_from_data(world_data)
	RuleEnforcer.load_from_data(world_data)
	InventorySystem.initialize()

	print("[Insimul] World spawning complete.")
	world_spawned.emit()
` });

  files.push({ path: `${base}/data_loader.gd`, content: `extends Node
## Static data loader — autoloaded singleton.
## Loads JSON data from res://data/.

const DATA_PATH := "res://data/"

func load_world_data() -> Dictionary:
	return _load_json("world_ir.json")

func load_characters() -> Array:
	return _load_json_array("characters.json")

func load_npcs() -> Array:
	return _load_json_array("npcs.json")

func load_actions() -> Array:
	return _load_json_array("actions.json")

func load_rules() -> Array:
	return _load_json_array("rules.json")

func load_quests() -> Array:
	return _load_json_array("quests.json")

func load_settlements() -> Array:
	return _load_json_array("settlements.json")

func load_buildings() -> Array:
	return _load_json_array("buildings.json")

func _load_json(filename: String) -> Dictionary:
	var path := DATA_PATH + filename
	if not FileAccess.file_exists(path):
		push_warning("[Insimul] File not found: %s" % path)
		return {}
	var file := FileAccess.open(path, FileAccess.READ)
	var json := JSON.new()
	var error := json.parse(file.get_as_text())
	if error != OK:
		push_error("[Insimul] JSON parse error in %s: %s" % [path, json.get_error_message()])
		return {}
	return json.data if json.data is Dictionary else {}

func _load_json_array(filename: String) -> Array:
	var path := DATA_PATH + filename
	if not FileAccess.file_exists(path):
		push_warning("[Insimul] File not found: %s" % path)
		return []
	var file := FileAccess.open(path, FileAccess.READ)
	var json := JSON.new()
	var error := json.parse(file.get_as_text())
	if error != OK:
		push_error("[Insimul] JSON parse error in %s: %s" % [path, json.get_error_message()])
		return []
	return json.data if json.data is Array else []
` });

  return files;
}

// ─────────────────────────────────────────────
// Characters
// ─────────────────────────────────────────────

function genCharacterScripts(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'scripts/characters';

  files.push({ path: `${base}/player_controller.gd`, content: `extends CharacterBody3D
## Third-person player controller.
## Attach to a CharacterBody3D with a CollisionShape3D child.

@export var move_speed := ${ir.player.speed}
@export var jump_height := ${ir.player.jumpHeight}
@export var gravity_mult := ${ir.player.gravity}
@export var rotation_speed := 10.0

@export var initial_health := ${ir.player.initialHealth}
@export var initial_energy := ${ir.player.initialEnergy}
@export var initial_gold := ${ir.player.initialGold}

var health: float
var max_health: float
var energy: float
var gold: int

@onready var camera_pivot: Node3D = $CameraPivot if has_node("CameraPivot") else null

func _ready() -> void:
	health = initial_health
	max_health = initial_health
	energy = initial_energy
	gold = initial_gold
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)

func _physics_process(delta: float) -> void:
	# Gravity
	if not is_on_floor():
		velocity.y -= ProjectSettings.get_setting("physics/3d/default_gravity") * gravity_mult * delta

	# Jump
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = sqrt(jump_height * 2.0 * ProjectSettings.get_setting("physics/3d/default_gravity") * gravity_mult)

	# Movement
	var input_dir := Input.get_vector("move_left", "move_right", "move_forward", "move_backward")
	var cam_basis := camera_pivot.global_transform.basis if camera_pivot else global_transform.basis
	var direction := (cam_basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()
	direction.y = 0

	if direction.length() > 0.1:
		velocity.x = direction.x * move_speed
		velocity.z = direction.z * move_speed
		var target_rot := atan2(direction.x, direction.z)
		rotation.y = lerp_angle(rotation.y, target_rot, rotation_speed * delta)
	else:
		velocity.x = move_toward(velocity.x, 0, move_speed * delta * 5.0)
		velocity.z = move_toward(velocity.z, 0, move_speed * delta * 5.0)

	move_and_slide()

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("attack"):
		_on_attack()
	elif event.is_action_pressed("interact"):
		_on_interact()
	elif event.is_action_pressed("menu"):
		Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED else Input.MOUSE_MODE_CAPTURED)

func _on_attack() -> void:
	# TODO: Trigger combat system
	print("[Insimul] Player Attack")

func _on_interact() -> void:
	# TODO: Raycast for interactable objects
	print("[Insimul] Player Interact")
` });

  files.push({ path: `${base}/npc_controller.gd`, content: `extends CharacterBody3D
## NPC controller with navigation and state machine.
## Requires a NavigationAgent3D child node.

enum NPCState { IDLE, PATROL, TALKING, FLEEING, PURSUING, ALERT }

@export var character_id := ""
@export var role := ""
@export var home_position := Vector3.ZERO
@export var patrol_radius := 20.0
@export var disposition := 50.0
@export var settlement_id := ""

var quest_ids: Array[String] = []
var current_state: NPCState = NPCState.IDLE

@onready var nav_agent: NavigationAgent3D = $NavigationAgent3D if has_node("NavigationAgent3D") else null

var _patrol_timer := 0.0
var _patrol_interval := 5.0

func init_from_data(data: Dictionary) -> void:
	character_id = data.get("characterId", "")
	role = data.get("role", "")
	var pos: Dictionary = data.get("homePosition", {})
	home_position = Vector3(pos.get("x", 0), pos.get("y", 0), pos.get("z", 0))
	patrol_radius = data.get("patrolRadius", 20.0)
	disposition = data.get("disposition", 50.0)
	settlement_id = data.get("settlementId", "")
	quest_ids.assign(data.get("questIds", []))
	global_position = home_position
	print("[Insimul] NPC %s initialized at %s (role: %s)" % [character_id, home_position, role])

func _physics_process(delta: float) -> void:
	match current_state:
		NPCState.IDLE:
			_update_idle(delta)
		NPCState.PATROL:
			_update_patrol(delta)
		NPCState.TALKING:
			pass
		NPCState.FLEEING:
			pass
		NPCState.PURSUING:
			pass
		NPCState.ALERT:
			pass

func _update_idle(delta: float) -> void:
	_patrol_timer += delta
	if _patrol_timer >= _patrol_interval:
		_patrol_timer = 0.0
		current_state = NPCState.PATROL
		var random_offset := Vector3(
			randf_range(-patrol_radius, patrol_radius),
			0,
			randf_range(-patrol_radius, patrol_radius)
		)
		var target := home_position + random_offset
		if nav_agent:
			nav_agent.target_position = target

func _update_patrol(_delta: float) -> void:
	if nav_agent == null:
		current_state = NPCState.IDLE
		return
	if nav_agent.is_navigation_finished():
		current_state = NPCState.IDLE
		return
	var next_pos := nav_agent.get_next_path_position()
	var direction := (next_pos - global_position).normalized()
	velocity = direction * 2.0
	move_and_slide()

func start_dialogue(initiator: Node3D) -> void:
	current_state = NPCState.TALKING
	velocity = Vector3.ZERO
	look_at(initiator.global_position, Vector3.UP)
	print("[Insimul] NPC %s starting dialogue" % character_id)

func end_dialogue() -> void:
	current_state = NPCState.IDLE
` });

  files.push({ path: `${base}/npc_spawner.gd`, content: `extends Node3D
## Spawns NPCs from world data.
## Add to the "world_generator" group so GameManager calls generate_from_data().

@export var npc_scene: PackedScene

func _ready() -> void:
	add_to_group("world_generator")

func generate_from_data(world_data: Dictionary) -> void:
	var entities: Dictionary = world_data.get("entities", {})
	var npcs: Array = entities.get("npcs", [])
	for npc_data in npcs:
		spawn_npc(npc_data)
	print("[Insimul] Spawned %d NPCs" % npcs.size())

func spawn_npc(data: Dictionary) -> void:
	var npc: CharacterBody3D
	if npc_scene:
		npc = npc_scene.instantiate() as CharacterBody3D
	else:
		# Fallback: create a simple capsule
		npc = CharacterBody3D.new()
		var mesh_inst := MeshInstance3D.new()
		mesh_inst.mesh = CapsuleMesh.new()
		npc.add_child(mesh_inst)
		var col := CollisionShape3D.new()
		col.shape = CapsuleShape3D.new()
		npc.add_child(col)
		var nav := NavigationAgent3D.new()
		npc.add_child(nav)

	var pos: Dictionary = data.get("homePosition", {})
	npc.global_position = Vector3(pos.get("x", 0), pos.get("y", 0), pos.get("z", 0))
	npc.name = "NPC_%s" % data.get("characterId", "unknown")
	add_child(npc)

	# Attach controller script
	var script := load("res://scripts/characters/npc_controller.gd")
	if script:
		npc.set_script(script)
		npc.init_from_data(data)
` });

  return files;
}

// ─────────────────────────────────────────────
// Systems
// ─────────────────────────────────────────────

function genSystemScripts(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'scripts/systems';
  const cs = ir.combat.settings;
  const genre = ir.meta.genreConfig;

  files.push({ path: `${base}/action_system.gd`, content: `extends Node
## Action System — autoloaded singleton.

var actions: Array[Dictionary] = []

func load_from_data(world_data: Dictionary) -> void:
	var systems: Dictionary = world_data.get("systems", {})
	actions.append_array(systems.get("actions", []))
	actions.append_array(systems.get("baseActions", []))
	print("[Insimul] ActionSystem loaded %d actions" % actions.size())

func get_action(action_id: String) -> Dictionary:
	for a in actions:
		if a.get("id", "") == action_id:
			return a
	return {}

func execute_action(action_id: String, source: Node, target: Node = null) -> bool:
	var action := get_action(action_id)
	if action.is_empty() or not action.get("isActive", true):
		return false
	# TODO: Check prerequisites, apply effects
	print("[Insimul] Executing action: %s" % action.get("name", action_id))
	return true
` });

  files.push({ path: `${base}/rule_enforcer.gd`, content: `extends Node
## Rule Enforcer — autoloaded singleton.

var rules: Array[Dictionary] = []

func load_from_data(world_data: Dictionary) -> void:
	var systems: Dictionary = world_data.get("systems", {})
	rules.append_array(systems.get("rules", []))
	rules.append_array(systems.get("baseRules", []))
	print("[Insimul] RuleEnforcer loaded %d rules" % rules.size())

func evaluate_rules(context: String) -> Array[Dictionary]:
	var applicable: Array[Dictionary] = []
	for rule in rules:
		if not rule.get("isActive", true):
			continue
		# TODO: Evaluate rule conditions against context
		applicable.append(rule)
	return applicable
` });

  files.push({ path: `${base}/combat_system.gd`, content: `extends Node
## Combat System — autoloaded singleton.

@export var combat_style := "${ir.combat.style}"
@export var base_damage := ${cs.baseDamage}
@export var critical_chance := ${cs.criticalChance}
@export var critical_multiplier := ${cs.criticalMultiplier}
@export var block_reduction := ${cs.blockReduction}
@export var dodge_chance := ${cs.dodgeChance}
@export var attack_cooldown := ${cs.attackCooldown / 1000.0}

var _last_attack_time := -999.0

func load_from_data(world_data: Dictionary) -> void:
	var combat: Dictionary = world_data.get("combat", {})
	combat_style = combat.get("style", combat_style)
	var settings: Dictionary = combat.get("settings", {})
	if not settings.is_empty():
		base_damage = settings.get("baseDamage", base_damage)
		critical_chance = settings.get("criticalChance", critical_chance)
		critical_multiplier = settings.get("criticalMultiplier", critical_multiplier)
		block_reduction = settings.get("blockReduction", block_reduction)
		dodge_chance = settings.get("dodgeChance", dodge_chance)
		attack_cooldown = settings.get("attackCooldown", attack_cooldown * 1000.0) / 1000.0
	print("[Insimul] CombatSystem loaded — style: %s, baseDamage: %.1f" % [combat_style, base_damage])

func calculate_damage(base_dmg: float, is_critical: bool) -> float:
	var dmg := base_dmg
	if is_critical:
		dmg *= critical_multiplier
	var variance := randf_range(-base_damage * 0.2, base_damage * 0.2)
	return maxf(1.0, dmg + variance)

func can_attack() -> bool:
	return Time.get_ticks_msec() / 1000.0 - _last_attack_time >= attack_cooldown

func register_attack() -> void:
	_last_attack_time = Time.get_ticks_msec() / 1000.0
` });

  files.push({ path: `${base}/quest_system.gd`, content: `extends Node
## Quest System — autoloaded singleton.

signal quest_accepted(quest_id: String)
signal quest_completed(quest_id: String)

var all_quests: Array[Dictionary] = []
var active_quest_ids: Array[String] = []
var completed_quest_ids: Array[String] = []

func load_from_data(world_data: Dictionary) -> void:
	var systems: Dictionary = world_data.get("systems", {})
	all_quests.assign(systems.get("quests", []))
	print("[Insimul] QuestSystem loaded %d quests" % all_quests.size())

func get_quest(quest_id: String) -> Dictionary:
	for q in all_quests:
		if q.get("id", "") == quest_id:
			return q
	return {}

func accept_quest(quest_id: String) -> bool:
	if quest_id in active_quest_ids:
		return false
	var quest := get_quest(quest_id)
	if quest.is_empty():
		return false
	active_quest_ids.append(quest_id)
	quest_accepted.emit(quest_id)
	print("[Insimul] Quest accepted: %s" % quest.get("title", quest_id))
	return true

func complete_quest(quest_id: String) -> bool:
	if quest_id not in active_quest_ids:
		return false
	active_quest_ids.erase(quest_id)
	completed_quest_ids.append(quest_id)
	quest_completed.emit(quest_id)
	print("[Insimul] Quest completed: %s" % quest_id)
	return true

func get_active_quests() -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	for q in all_quests:
		if q.get("id", "") in active_quest_ids:
			result.append(q)
	return result
` });

  files.push({ path: `${base}/inventory_system.gd`, content: `extends Node
## Inventory System — autoloaded singleton.

signal item_added(item_id: String, count: int)
signal item_removed(item_id: String, count: int)

var max_slots := 20
var _slots: Array[Dictionary] = []  # [{item_id: String, count: int}]

func initialize() -> void:
	_slots.clear()
	print("[Insimul] InventorySystem initialized (max slots: %d)" % max_slots)

func add_item(item_id: String, count: int = 1) -> bool:
	for slot in _slots:
		if slot.get("item_id", "") == item_id:
			slot["count"] = slot.get("count", 0) + count
			item_added.emit(item_id, count)
			return true
	if _slots.size() >= max_slots:
		return false
	_slots.append({"item_id": item_id, "count": count})
	item_added.emit(item_id, count)
	return true

func remove_item(item_id: String, count: int = 1) -> bool:
	for i in range(_slots.size()):
		if _slots[i].get("item_id", "") == item_id:
			var current: int = _slots[i].get("count", 0)
			if current < count:
				return false
			_slots[i]["count"] = current - count
			if _slots[i]["count"] <= 0:
				_slots.remove_at(i)
			item_removed.emit(item_id, count)
			return true
	return false

func get_item_count(item_id: String) -> int:
	for slot in _slots:
		if slot.get("item_id", "") == item_id:
			return slot.get("count", 0)
	return 0

func get_all_items() -> Array[Dictionary]:
	return _slots.duplicate()
` });

  files.push({ path: `${base}/dialogue_system.gd`, content: `extends Node
## Dialogue System — autoloaded singleton.

signal dialogue_started(npc_id: String)
signal dialogue_ended

var is_in_dialogue := false
var current_npc_id := ""

func start_dialogue(npc_character_id: String) -> void:
	is_in_dialogue = true
	current_npc_id = npc_character_id
	dialogue_started.emit(npc_character_id)
	print("[Insimul] Dialogue started with NPC: %s" % npc_character_id)

func end_dialogue() -> void:
	var npc_id := current_npc_id
	is_in_dialogue = false
	current_npc_id = ""
	dialogue_ended.emit()
	print("[Insimul] Dialogue ended with NPC: %s" % npc_id)
` });

  // Conditional systems
  if (genre.features.crafting) {
    files.push({ path: `${base}/crafting_system.gd`, content: `extends Node
## Crafting System

var recipes: Array[Dictionary] = []

func can_craft(recipe_id: String) -> bool:
	for recipe in recipes:
		if recipe.get("id", "") == recipe_id:
			var inputs: Array = recipe.get("inputItemIds", [])
			var counts: Array = recipe.get("inputCounts", [])
			for i in range(inputs.size()):
				if InventorySystem.get_item_count(inputs[i]) < counts[i]:
					return false
			return true
	return false

func craft(recipe_id: String) -> bool:
	if not can_craft(recipe_id):
		return false
	for recipe in recipes:
		if recipe.get("id", "") == recipe_id:
			var inputs: Array = recipe.get("inputItemIds", [])
			var counts: Array = recipe.get("inputCounts", [])
			for i in range(inputs.size()):
				InventorySystem.remove_item(inputs[i], counts[i])
			InventorySystem.add_item(recipe.get("outputItemId", ""), recipe.get("outputCount", 1))
			print("[Insimul] Crafted: %s" % recipe.get("name", recipe_id))
			return true
	return false
` });
  }

  if (genre.features.resources) {
    files.push({ path: `${base}/resource_system.gd`, content: `extends Node
## Resource System

var definitions: Array[Dictionary] = []

func load_from_data(world_data: Dictionary) -> void:
	var resources: Dictionary = world_data.get("resources", {})
	definitions.assign(resources.get("definitions", []))
	print("[Insimul] ResourceSystem loaded %d resource types" % definitions.size())

func gather_resource(resource_id: String) -> bool:
	for def in definitions:
		if def.get("id", "") == resource_id:
			InventorySystem.add_item(resource_id, 1)
			print("[Insimul] Gathered: %s" % def.get("name", resource_id))
			return true
	return false
` });
  }

  if (ir.survival != null) {
    files.push({ path: `${base}/survival_system.gd`, content: `extends Node
## Survival System

var needs: Array[Dictionary] = []  # [{id, name, value, max_value, decay_rate, critical_threshold, damage_rate}]

func load_from_data(world_data: Dictionary) -> void:
	var survival: Dictionary = world_data.get("survival", {})
	var need_defs: Array = survival.get("needs", [])
	for nd in need_defs:
		needs.append({
			"id": nd.get("id", ""),
			"name": nd.get("name", ""),
			"value": nd.get("startValue", 100.0),
			"max_value": nd.get("maxValue", 100.0),
			"decay_rate": nd.get("decayRate", 0.0),
			"critical_threshold": nd.get("criticalThreshold", 20.0),
			"damage_rate": nd.get("damageRate", 0.0),
		})
	print("[Insimul] SurvivalSystem loaded %d needs" % needs.size())

func _process(delta: float) -> void:
	for need in needs:
		var decay: float = need.get("decay_rate", 0.0)
		if decay > 0:
			need["value"] = clampf(need.get("value", 0.0) - decay * delta, 0.0, need.get("max_value", 100.0))

func get_need_value(need_id: String) -> float:
	for need in needs:
		if need.get("id", "") == need_id:
			return need.get("value", 0.0)
	return 0.0

func modify_need(need_id: String, delta_val: float) -> void:
	for need in needs:
		if need.get("id", "") == need_id:
			need["value"] = clampf(need.get("value", 0.0) + delta_val, 0.0, need.get("max_value", 100.0))
			return
` });
  }

  return files;
}

// ─────────────────────────────────────────────
// World Generators
// ─────────────────────────────────────────────

function genWorldScripts(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'scripts/world';
  const theme = ir.theme.visualTheme;

  files.push({ path: `${base}/world_scale_manager.gd`, content: `extends Node3D
## Manages world terrain and scale.
## Add to the "world_generator" group.

@export var terrain_size := ${ir.geography.terrainSize}
@export var ground_color := Color(${theme.groundColor.r}, ${theme.groundColor.g}, ${theme.groundColor.b})
@export var sky_color := Color(${theme.skyColor.r}, ${theme.skyColor.g}, ${theme.skyColor.b})

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
` });

  files.push({ path: `${base}/building_generator.gd`, content: `extends Node3D
## Procedural building generator.
## Add to the "world_generator" group.

@export var base_color := Color(${theme.settlementBaseColor.r}, ${theme.settlementBaseColor.g}, ${theme.settlementBaseColor.b})
@export var roof_color := Color(${theme.settlementRoofColor.r}, ${theme.settlementRoofColor.g}, ${theme.settlementRoofColor.b})

func _ready() -> void:
	add_to_group("world_generator")

func generate_from_data(world_data: Dictionary) -> void:
	var entities: Dictionary = world_data.get("entities", {})
	var buildings: Array = entities.get("buildings", [])
	for bld in buildings:
		var pos: Dictionary = bld.get("position", {})
		var spec: Dictionary = bld.get("spec", {})
		_generate_building(
			Vector3(pos.get("x", 0), pos.get("y", 0), pos.get("z", 0)),
			bld.get("rotation", 0.0),
			spec.get("floors", 2),
			spec.get("width", 10.0),
			spec.get("depth", 10.0),
			spec.get("buildingRole", "residential"),
		)
	print("[Insimul] Generated %d buildings" % buildings.size())

func _generate_building(pos: Vector3, rot: float, floors: int, width: float, depth: float, role: String) -> void:
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
` });

  files.push({ path: `${base}/road_generator.gd`, content: `extends Node3D
## Road generator.
## Add to the "world_generator" group.

@export var road_color := Color(${theme.roadColor.r}, ${theme.roadColor.g}, ${theme.roadColor.b})
@export var road_width := ${theme.roadRadius * 2}

func _ready() -> void:
	add_to_group("world_generator")

func generate_from_data(world_data: Dictionary) -> void:
	# TODO: Generate mesh-based roads from WorldIR road data
	print("[Insimul] RoadGenerator — stub (implement mesh roads)")
` });

  files.push({ path: `${base}/nature_generator.gd`, content: `extends Node3D
## Procedural nature/vegetation generator.
## Add to the "world_generator" group.

func _ready() -> void:
	add_to_group("world_generator")

func generate_from_data(world_data: Dictionary) -> void:
	var meta: Dictionary = world_data.get("meta", {})
	var geo: Dictionary = world_data.get("geography", {})
	# TODO: Scatter vegetation using random positions
	print("[Insimul] ProceduralNatureGenerator — terrain: %d, seed: %s" % [geo.get("terrainSize", 100), meta.get("seed", "")])
` });

  files.push({ path: `${base}/dungeon_generator.gd`, content: `extends Node3D
## Procedural dungeon generator.

func generate_dungeon(seed_str: String, floor_count: int, rooms_per_floor: int) -> void:
	# TODO: Generate dungeon rooms and corridors procedurally
	print("[Insimul] ProceduralDungeonGenerator — %d floors, %d rooms (seed: %s)" % [floor_count, rooms_per_floor, seed_str])
` });

  return files;
}

// ─────────────────────────────────────────────
// UI Scripts
// ─────────────────────────────────────────────

function genUIScripts(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'scripts/ui';

  files.push({ path: `${base}/hud.gd`, content: `extends CanvasLayer
## HUD manager — shows health, energy, gold.

@onready var health_bar: ProgressBar = $HealthBar if has_node("HealthBar") else null
@onready var health_label: Label = $HealthLabel if has_node("HealthLabel") else null
@onready var gold_label: Label = $GoldLabel if has_node("GoldLabel") else null

var _player: CharacterBody3D

func _ready() -> void:
	# Find player
	await get_tree().process_frame
	_player = get_tree().get_first_node_in_group("player") as CharacterBody3D

func _process(_delta: float) -> void:
	if _player == null:
		return
	if health_bar and _player.has_method("get"):
		health_bar.max_value = _player.get("max_health") if _player.get("max_health") else 100.0
		health_bar.value = _player.get("health") if _player.get("health") else 100.0
	if health_label and _player.get("health") != null:
		health_label.text = "%d / %d" % [ceili(_player.health), ceili(_player.max_health)]
	if gold_label and _player.get("gold") != null:
		gold_label.text = str(_player.gold)
` });

  files.push({ path: `${base}/quest_tracker_ui.gd`, content: `extends Control
## Quest tracker panel — shows active quests.

@onready var quest_list: RichTextLabel = $QuestList if has_node("QuestList") else null

func _process(_delta: float) -> void:
	if quest_list == null:
		return
	var active := QuestSystem.get_active_quests()
	if active.is_empty():
		quest_list.text = "No active quests"
		return
	var text := ""
	for q in active:
		text += "[b]%s[/b]\\n  %s\\n" % [q.get("title", "?"), q.get("description", "")]
	quest_list.text = text
` });

  files.push({ path: `${base}/game_menu.gd`, content: `extends CanvasLayer
## Game menu (Esc to toggle).

@onready var menu_panel: Control = $MenuPanel if has_node("MenuPanel") else null

var _is_open := false

func _ready() -> void:
	if menu_panel:
		menu_panel.visible = false

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("menu"):
		toggle_menu()

func toggle_menu() -> void:
	_is_open = not _is_open
	if menu_panel:
		menu_panel.visible = _is_open
	get_tree().paused = _is_open
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE if _is_open else Input.MOUSE_MODE_CAPTURED)

func resume_game() -> void:
	toggle_menu()

func quit_game() -> void:
	get_tree().quit()
` });

  return files;
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateGDScriptFiles(ir: WorldIR): GeneratedFile[] {
  return [
    ...genCoreScripts(ir),
    ...genCharacterScripts(ir),
    ...genSystemScripts(ir),
    ...genWorldScripts(ir),
    ...genUIScripts(ir),
  ];
}
