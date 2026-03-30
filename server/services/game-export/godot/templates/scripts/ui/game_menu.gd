extends CanvasLayer
## Game menu (Esc to toggle).
## Mirrors BabylonGame's GameMenuSystem with tabs for Character, Journal,
## Inventory, Vocabulary, Guild Skill Trees, Notices, and Settings.

@onready var menu_panel: Control = $MenuPanel if has_node("MenuPanel") else null

var _is_open := false
var _active_tab := "main"

## Guild quest progress data — set via set_guild_quest_data()
var _guild_quest_data: Array[Dictionary] = []
## Narrative history entries for Story So Far — set via set_narrative_history()
var _narrative_history: Array[Dictionary] = []

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

## Set narrative history entries for the Story So Far section.
## Each entry: { chapterId, chapterNumber, title, introNarrative, outroNarrative, mysteryDetails }
func set_narrative_history(history: Array[Dictionary]) -> void:
	_narrative_history = history

## Set guild quest progress data.
## Each entry: { guildId, guildTier, status }
func set_guild_quest_data(data: Array[Dictionary]) -> void:
	_guild_quest_data = data

func show_journal() -> void:
	# Journal/Story So Far — placeholder for full journal UI
	# In the Babylon.js source, this opens tabs for:
	# Character, Quest Journal (with Story So Far), Clues, Inventory,
	# Vocabulary, Notices/Library, Guild Skill Trees, and System.
	print("[GameMenu] Journal: %d narrative entries, %d guild quests" % [_narrative_history.size(), _guild_quest_data.size()])
	_active_tab = "journal"

func quit_game() -> void:
	get_tree().quit()
