extends CanvasLayer
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
