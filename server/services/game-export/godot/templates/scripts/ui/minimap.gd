extends Control
## Minimap — top-right overhead camera view with POI markers.
##
## Uses a SubViewport + Camera3D for a live top-down render of the world.
## Tracks the player position and displays points of interest (quest markers,
## NPCs, buildings) as colored dots overlaid on the viewport.

const MINIMAP_SIZE := 180
const MINIMAP_MARGIN := 12
const CAMERA_HEIGHT := 60.0
const POI_RADIUS := 4.0

var _player: CharacterBody3D
var _camera: Camera3D
var _viewport: SubViewport
var _viewport_container: SubViewportContainer
var _border: Panel
var _player_marker: ColorRect
var _poi_markers: Dictionary = {}  # id -> { node: ColorRect, world_pos: Vector3 }
var _visible := true

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_build_ui()
	await get_tree().process_frame
	_player = get_tree().get_first_node_in_group("player") as CharacterBody3D

func _build_ui() -> void:
	# Border panel
	_border = Panel.new()
	_border.custom_minimum_size = Vector2(MINIMAP_SIZE + 4, MINIMAP_SIZE + 4)
	_border.size = Vector2(MINIMAP_SIZE + 4, MINIMAP_SIZE + 4)
	_border.position = Vector2(
		get_viewport().get_visible_rect().size.x - MINIMAP_SIZE - MINIMAP_MARGIN - 4,
		MINIMAP_MARGIN
	)
	_border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_border)

	# SubViewportContainer
	_viewport_container = SubViewportContainer.new()
	_viewport_container.size = Vector2(MINIMAP_SIZE, MINIMAP_SIZE)
	_viewport_container.position = Vector2(2, 2)
	_viewport_container.stretch = true
	_viewport_container.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_border.add_child(_viewport_container)

	# SubViewport
	_viewport = SubViewport.new()
	_viewport.size = Vector2i(MINIMAP_SIZE, MINIMAP_SIZE)
	_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	_viewport.transparent_bg = false
	_viewport_container.add_child(_viewport)

	# Top-down camera
	_camera = Camera3D.new()
	_camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	_camera.size = 80.0
	_camera.rotation_degrees = Vector3(-90, 0, 0)
	_camera.position = Vector3(0, CAMERA_HEIGHT, 0)
	_viewport.add_child(_camera)

	# Player marker (centered dot)
	_player_marker = ColorRect.new()
	_player_marker.color = Color(0.2, 0.8, 1.0)
	_player_marker.size = Vector2(6, 6)
	_player_marker.position = Vector2(MINIMAP_SIZE / 2.0 - 3, MINIMAP_SIZE / 2.0 - 3)
	_player_marker.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_border.add_child(_player_marker)

func _process(_delta: float) -> void:
	if _player == null or _camera == null:
		return
	# Follow player
	_camera.global_position = Vector3(
		_player.global_position.x,
		CAMERA_HEIGHT,
		_player.global_position.z
	)
	# Update POI marker screen positions
	_update_poi_positions()

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_M:
		set_minimap_visible(not _visible)

func add_poi(id: String, world_pos: Vector3, type: String, label: String = "") -> void:
	if _poi_markers.has(id):
		remove_poi(id)
	var marker := ColorRect.new()
	marker.size = Vector2(POI_RADIUS * 2, POI_RADIUS * 2)
	marker.mouse_filter = Control.MOUSE_FILTER_IGNORE
	match type:
		"quest":
			marker.color = Color(1.0, 0.85, 0.0)
		"npc":
			marker.color = Color(0.3, 1.0, 0.3)
		"building":
			marker.color = Color(0.7, 0.7, 0.7)
		_:
			marker.color = Color(1.0, 1.0, 1.0)
	_border.add_child(marker)
	_poi_markers[id] = { "node": marker, "world_pos": world_pos }

func remove_poi(id: String) -> void:
	if not _poi_markers.has(id):
		return
	var entry: Dictionary = _poi_markers[id]
	var node: ColorRect = entry["node"]
	node.queue_free()
	_poi_markers.erase(id)

func set_minimap_visible(show: bool) -> void:
	_visible = show
	_border.visible = show

func _update_poi_positions() -> void:
	if _player == null:
		return
	var half := MINIMAP_SIZE / 2.0
	var cam_size: float = _camera.size
	for id in _poi_markers:
		var entry: Dictionary = _poi_markers[id]
		var node: ColorRect = entry["node"]
		var world_pos: Vector3 = entry["world_pos"]
		var dx: float = world_pos.x - _player.global_position.x
		var dz: float = world_pos.z - _player.global_position.z
		var px: float = half + (dx / cam_size) * MINIMAP_SIZE - POI_RADIUS
		var pz: float = half + (dz / cam_size) * MINIMAP_SIZE - POI_RADIUS
		# Clamp to minimap bounds
		px = clampf(px, 0, MINIMAP_SIZE - POI_RADIUS * 2)
		pz = clampf(pz, 0, MINIMAP_SIZE - POI_RADIUS * 2)
		node.position = Vector2(px + 2, pz + 2)  # +2 for border offset
