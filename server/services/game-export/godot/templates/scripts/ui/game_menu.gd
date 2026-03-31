extends CanvasLayer
## Game menu (Esc to toggle).
## Mirrors BabylonGame's GameMenuSystem with tabs for Character, Journal,
## Quests, Inventory, Crafting, Map, Photos, Vocabulary, Skills, Notices,
## Contacts, Notifications, and System.

signal menu_opened
signal menu_closed

## Available menu tabs matching GameMenuSystem.ts MenuTab type.
enum MenuTab {
	CHARACTER, REST, JOURNAL, CLUES, QUESTS, INVENTORY, CRAFTING,
	MAP, PHOTOS, VOCABULARY, SKILLS, NOTICES, CONTACTS, NOTIFICATIONS, SYSTEM
}

@onready var menu_panel: Control = $MenuPanel if has_node("MenuPanel") else null

var _is_open := false
var _active_tab: int = MenuTab.SYSTEM
var _target_language := ""

## Guild quest progress data — set via set_guild_quest_data()
var _guild_quest_data: Array[Dictionary] = []
## Narrative history entries for Story So Far — set via set_narrative_history()
var _narrative_history: Array[Dictionary] = []
## Clue chapter groups for chapter-organized clue rendering — set via set_chapter_clue_groups()
## Each entry: { chapterId, chapterTitle, chapterNumber, clueIds }
var _chapter_clue_groups: Array[Dictionary] = []
## Save slot data
var _save_slots: Array[Dictionary] = []

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
	if _is_open:
		menu_opened.emit()
	else:
		menu_closed.emit()

## Open the menu to a specific tab.
func open(tab: int = MenuTab.SYSTEM) -> void:
	_active_tab = tab
	if not _is_open:
		toggle_menu()

## Close the menu.
func close() -> void:
	if _is_open:
		toggle_menu()

func resume_game() -> void:
	toggle_menu()

## Set the target language for language-learning features.
func set_target_language(language: String) -> void:
	_target_language = language

## Update time display data.
func update_time(time_string: String, day: int, time_of_day: String) -> void:
	pass

## Quick-save the current game state.
func quick_save() -> void:
	pass

## Quick-load the last saved game state.
func quick_load() -> void:
	pass

## Set narrative history entries for the Story So Far section.
## Each entry: { chapterId, chapterNumber, title, introNarrative, outroNarrative, mysteryDetails }
func set_narrative_history(history: Array[Dictionary]) -> void:
	_narrative_history = history

## Set guild quest progress data.
## Each entry: { guildId, guildTier, status }
func set_guild_quest_data(data: Array[Dictionary]) -> void:
	_guild_quest_data = data

## Set chapter clue groups for chapter-organized clue rendering in the journal.
## Each entry: { chapterId, chapterTitle, chapterNumber, clueIds }
func set_chapter_clue_groups(groups: Array[Dictionary]) -> void:
	_chapter_clue_groups = groups

func show_journal() -> void:
	# Journal/Story So Far — placeholder for full journal UI
	# In the Babylon.js source, this opens tabs for:
	# Character, Quest Journal (with Story So Far), Clues, Inventory,
	# Vocabulary, Notices/Library, Guild Skill Trees, and System.
	print("[GameMenu] Journal: %d narrative entries, %d guild quests" % [_narrative_history.size(), _guild_quest_data.size()])
	_active_tab = "journal"

func quit_game() -> void:
	get_tree().quit()
