extends CharacterBody3D
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
var _anim_controller: Node = null

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
	_anim_controller = _find_anim_controller()
	print("[Insimul] NPC %s initialized at %s (role: %s)" % [character_id, home_position, role])

func _find_anim_controller() -> Node:
	for child in get_children():
		if child.has_method("set_speed"):
			return child
	return null

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
	if _anim_controller:
		_anim_controller.set_speed(0.0)
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
	if _anim_controller:
		_anim_controller.set_speed(velocity.length())
	move_and_slide()

func start_dialogue(initiator: Node3D) -> void:
	current_state = NPCState.TALKING
	velocity = Vector3.ZERO
	look_at(initiator.global_position, Vector3.UP)
	if _anim_controller:
		_anim_controller.set_talking(true)
	print("[Insimul] NPC %s starting dialogue" % character_id)

func end_dialogue() -> void:
	if _anim_controller:
		_anim_controller.set_talking(false)
	current_state = NPCState.IDLE
