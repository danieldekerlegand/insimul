extends CanvasLayer
## Dialogue Panel — polished RPG/educational dialogue interface.
## Bottom-of-screen panel with NPC portrait, typewriter text, response buttons,
## and optional language learning mode.

signal dialogue_closed
signal gesture_performed(gesture_id: String)
signal quest_assigned(quest_data: Dictionary)
signal quest_branched(quest_id: String, choice_id: String, target_stage_id: String)
signal action_selected(action_id: String)
signal vocabulary_used(word: String)
signal conversation_turn(keywords: Array)
signal npc_conversation_started(npc_id: String)
signal npc_speech_update(text: String)
signal quest_turned_in(quest_id: String, rewards: Dictionary)
signal fluency_gain(fluency: float, gain: float)
signal conversation_summary(result: Dictionary)
signal dialogue_rating(message_index: int, rating: int)
signal chat_exchange(npc_id: String, player_message: String, npc_response: String)
signal talk_requested
signal npc_conversation_turn(npc_id: String, topic_tag: String)
signal writing_submitted(text: String, word_count: int)
signal listen_and_repeat(result: Dictionary)
signal conversational_action(actions: Array, turn_state: Dictionary)
signal new_word_learned(entry: Dictionary)
signal word_mastered(entry: Dictionary)
signal grammar_feedback(feedback: Dictionary)

const TYPEWRITER_SPEED := 30.0  # characters per second
const MAX_RESPONSE_BUTTONS := 4

var _current_character_id := ""
var _is_open := false
var _is_typing := false
var _is_recording := false
var _is_listening_mode := false
var _target_language: String = ""
var _ai_provider := "server"
var _playthrough_id := ""
var _typewriter_elapsed := 0.0
var _typewriter_full_text := ""
var _typewriter_visible_chars := 0
var _pending_responses: Array = []
var _language_mode := false
var _gesture_container: HBoxContainer
var _inventory_items: Array = []
var _player_gold := 0

# Root UI nodes
var _panel: PanelContainer
var _portrait_rect: ColorRect
var _portrait_label: Label
var _npc_name_label: Label
var _dialogue_text: RichTextLabel
var _response_container: VBoxContainer
var _close_button: Button
var _lang_target_label: RichTextLabel
var _lang_translation_label: Label
var _lang_listen_button: Button
var _lang_container: VBoxContainer

func _ready() -> void:
	layer = 100
	_build_ui()
	visible = false

func _process(delta: float) -> void:
	if not _is_typing:
		return
	_typewriter_elapsed += delta
	var target_chars := int(_typewriter_elapsed * TYPEWRITER_SPEED)
	if target_chars > _typewriter_full_text.length():
		target_chars = _typewriter_full_text.length()
	if target_chars != _typewriter_visible_chars:
		_typewriter_visible_chars = target_chars
		_dialogue_text.text = _typewriter_full_text.substr(0, _typewriter_visible_chars)
		if _typewriter_visible_chars >= _typewriter_full_text.length():
			_finish_typing()

func _unhandled_input(event: InputEvent) -> void:
	if not _is_open:
		return
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_ESCAPE:
			close_dialogue()
			get_viewport().set_input_as_handled()

func perform_gesture(gesture_id: String) -> void:
	gesture_performed.emit(gesture_id)

func open_dialogue(character_id: String) -> void:
	_current_character_id = character_id
	_is_open = true
	visible = true
	_clear_responses()
	_dialogue_text.text = ""
	if _gesture_container:
		_gesture_container.visible = true

	# Load NPC context from AIService
	var ai := get_node_or_null("/root/AIService")
	if ai:
		var ctx: Dictionary = ai.get_context(character_id)
		if not ctx.is_empty():
			var npc_name: String = ctx.get("characterName", character_id)
			_npc_name_label.text = npc_name
			_set_portrait(npc_name)
			var greeting: String = ctx.get("greeting", "")
			if greeting != "":
				_start_typewriter(greeting)
		else:
			_npc_name_label.text = character_id
			_set_portrait(character_id)
	else:
		_npc_name_label.text = character_id
		_set_portrait(character_id)

	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)

func close_dialogue() -> void:
	_is_open = false
	_is_typing = false
	_current_character_id = ""
	visible = false
	_clear_responses()
	if _gesture_container:
		_gesture_container.visible = false
	dialogue_closed.emit()
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)

func show_npc_text(text: String) -> void:
	_clear_responses()
	_start_typewriter(text)

func show_responses(responses: Array) -> void:
	_pending_responses = responses
	if not _is_typing:
		_display_responses()

func show_language_content(target_text: String, translation: String) -> void:
	_language_mode = true
	_lang_container.visible = true
	_lang_target_label.text = "[b]%s[/b]" % target_text
	_lang_translation_label.text = translation

func hide_language_content() -> void:
	_language_mode = false
	_lang_container.visible = false

func is_open() -> bool:
	return _is_open

func is_recording() -> bool:
	return _is_recording

func is_listening_mode() -> bool:
	return _is_listening_mode

## Set the AI provider for dialogue (e.g. "server", "local").
func set_ai_provider(provider: String) -> void:
	_ai_provider = provider

func get_ai_provider() -> String:
	return _ai_provider

## Set the playthrough ID for conversation context.
func set_playthrough_id(id: String) -> void:
	_playthrough_id = id

## Set the target language for language-learning dialogue.
func set_target_language(lang: String) -> void:
	_target_language = lang

## Set player inventory context for NPC dialogue awareness.
func set_player_inventory_context(items: Array, gold: int) -> void:
	_inventory_items = items
	_player_gold = gold

## Add a system message to the dialogue panel.
func add_system_message(text: String) -> void:
	_clear_responses()
	_dialogue_text.text = "[color=#aaaacc][i]%s[/i][/color]" % text

## Add an NPC message externally.
func add_npc_message(text: String) -> void:
	_start_typewriter(text)

## Enter listening mode for voice-based conversation.
func enter_listening_mode() -> void:
	_is_listening_mode = true

## Exit listening mode.
func exit_listening_mode() -> void:
	_is_listening_mode = false

## Start push-to-talk voice recording.
func start_push_to_talk() -> void:
	_is_recording = true

## Stop push-to-talk voice recording.
func stop_push_to_talk() -> void:
	_is_recording = false

## Set eavesdrop mode (observe NPC conversations without participating).
func set_eavesdrop_mode(enabled: bool) -> void:
	pass

## Set quest topics for contextual dialogue.
func set_quest_topics(topics: Array) -> void:
	pass

## Set dialogue actions available to the player.
func set_dialogue_actions(actions: Array, player_energy: float) -> void:
	show_responses(actions)

## Update dialogue actions with current player energy.
func update_dialogue_actions(player_energy: float) -> void:
	pass

## Set quest offering context for NPC dialogue.
func set_quest_offering_context(context) -> void:
	pass

## Set active quest context from this NPC.
func set_active_quest_from_npc(context) -> void:
	pass

## Set quest guidance prompt for directed conversation.
func set_quest_guidance_prompt(prompt) -> void:
	pass

## Trigger quest guidance greeting from NPC.
func trigger_quest_guidance_greeting() -> void:
	pass

## Clean up resources.
func dispose() -> void:
	close_dialogue()

# ─── Typewriter ───────────────────────────────────────

func _start_typewriter(text: String) -> void:
	_typewriter_full_text = text
	_typewriter_visible_chars = 0
	_typewriter_elapsed = 0.0
	_dialogue_text.text = ""
	_is_typing = true
	_clear_responses()

func _finish_typing() -> void:
	_is_typing = false
	_dialogue_text.text = _typewriter_full_text
	if _pending_responses.size() > 0:
		_display_responses()

func _skip_typewriter() -> void:
	if _is_typing:
		_is_typing = false
		_dialogue_text.text = _typewriter_full_text
		_typewriter_visible_chars = _typewriter_full_text.length()
		if _pending_responses.size() > 0:
			_display_responses()

# ─── Responses ────────────────────────────────────────

func _display_responses() -> void:
	_clear_responses()
	var count := mini(_pending_responses.size(), MAX_RESPONSE_BUTTONS)
	for i in range(count):
		var action: Dictionary = _pending_responses[i]
		var btn := Button.new()
		var btn_name: String = action.get("name", action.get("id", "Option %d" % (i + 1)))
		var energy_cost: float = action.get("energyCost", 0.0)
		if energy_cost > 0.0:
			btn.text = "%s (%d energy)" % [btn_name, int(energy_cost)]
		else:
			btn.text = btn_name
		btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		btn.custom_minimum_size = Vector2(0, 36)

		var btn_style := StyleBoxFlat.new()
		btn_style.bg_color = Color(0.2, 0.25, 0.35, 0.9)
		btn_style.set_corner_radius_all(4)
		btn_style.set_content_margin_all(6)
		btn.add_theme_stylebox_override("normal", btn_style)

		var hover_style := StyleBoxFlat.new()
		hover_style.bg_color = Color(0.3, 0.35, 0.5, 0.95)
		hover_style.set_corner_radius_all(4)
		hover_style.set_content_margin_all(6)
		btn.add_theme_stylebox_override("hover", hover_style)

		var action_id: String = action.get("id", "")
		btn.pressed.connect(_on_response_pressed.bind(action_id))
		_response_container.add_child(btn)

	# Always add a goodbye/close button
	var goodbye := Button.new()
	goodbye.text = "Goodbye"
	goodbye.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	goodbye.custom_minimum_size = Vector2(0, 36)

	var goodbye_style := StyleBoxFlat.new()
	goodbye_style.bg_color = Color(0.4, 0.2, 0.2, 0.9)
	goodbye_style.set_corner_radius_all(4)
	goodbye_style.set_content_margin_all(6)
	goodbye.add_theme_stylebox_override("normal", goodbye_style)

	var goodbye_hover := StyleBoxFlat.new()
	goodbye_hover.bg_color = Color(0.5, 0.3, 0.3, 0.95)
	goodbye_hover.set_corner_radius_all(4)
	goodbye_hover.set_content_margin_all(6)
	goodbye.add_theme_stylebox_override("hover", goodbye_hover)

	goodbye.pressed.connect(close_dialogue)
	_response_container.add_child(goodbye)

func _on_response_pressed(action_id: String) -> void:
	if _is_typing:
		_skip_typewriter()
		return
	var ds := get_node_or_null("/root/DialogueSystem")
	if ds and ds.has_method("select_action"):
		ds.select_action(action_id)

func _clear_responses() -> void:
	for child in _response_container.get_children():
		child.queue_free()

# ─── Portrait ─────────────────────────────────────────

func _set_portrait(npc_name: String) -> void:
	var initial := npc_name.substr(0, 1).to_upper() if npc_name.length() > 0 else "?"
	_portrait_label.text = initial
	# Derive color from name hash for consistent NPC colors
	var h := npc_name.hash()
	var hue := absf(float(h % 360)) / 360.0
	_portrait_rect.color = Color.from_hsv(hue, 0.4, 0.5)

# ─── Language learning ────────────────────────────────

func _on_listen_pressed() -> void:
	var ds := get_node_or_null("/root/DialogueSystem")
	if ds and ds.has_signal("audio_requested"):
		ds.emit_signal("audio_requested", _current_character_id, _typewriter_full_text)

# ─── Build UI ─────────────────────────────────────────

func _build_ui() -> void:
	# Main panel — anchored to bottom of screen
	_panel = PanelContainer.new()
	_panel.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	_panel.anchor_top = 0.65
	_panel.anchor_bottom = 1.0
	_panel.anchor_left = 0.05
	_panel.anchor_right = 0.95
	_panel.offset_top = 0
	_panel.offset_bottom = -10
	_panel.offset_left = 0
	_panel.offset_right = 0

	var panel_style := StyleBoxFlat.new()
	panel_style.bg_color = Color(0.08, 0.08, 0.12, 0.95)
	panel_style.set_corner_radius_all(10)
	panel_style.set_content_margin_all(12)
	panel_style.border_color = Color(0.3, 0.3, 0.4, 0.6)
	panel_style.set_border_width_all(2)
	_panel.add_theme_stylebox_override("panel", panel_style)
	add_child(_panel)

	var main_hbox := HBoxContainer.new()
	main_hbox.add_theme_constant_override("separation", 12)
	_panel.add_child(main_hbox)

	# ── Left column: portrait + name ──
	var left_vbox := VBoxContainer.new()
	left_vbox.custom_minimum_size = Vector2(120, 0)
	left_vbox.add_theme_constant_override("separation", 6)
	main_hbox.add_child(left_vbox)

	# Portrait placeholder
	_portrait_rect = ColorRect.new()
	_portrait_rect.custom_minimum_size = Vector2(80, 80)
	_portrait_rect.color = Color(0.3, 0.3, 0.5)
	_portrait_rect.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	left_vbox.add_child(_portrait_rect)

	# Initial letter on portrait
	_portrait_label = Label.new()
	_portrait_label.text = "?"
	_portrait_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_portrait_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_portrait_label.add_theme_font_size_override("font_size", 36)
	_portrait_label.add_theme_color_override("font_color", Color(1, 1, 1, 0.9))
	_portrait_label.set_anchors_preset(Control.PRESET_FULL_RECT)
	_portrait_rect.add_child(_portrait_label)

	# NPC name
	_npc_name_label = Label.new()
	_npc_name_label.text = "NPC"
	_npc_name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_npc_name_label.add_theme_font_size_override("font_size", 16)
	_npc_name_label.add_theme_color_override("font_color", Color(0.9, 0.85, 0.7))
	left_vbox.add_child(_npc_name_label)

	# Close button under portrait
	_close_button = Button.new()
	_close_button.text = "X"
	_close_button.custom_minimum_size = Vector2(30, 30)
	_close_button.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	_close_button.pressed.connect(close_dialogue)
	left_vbox.add_child(_close_button)

	# ── Center column: dialogue text + language ──
	var center_vbox := VBoxContainer.new()
	center_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	center_vbox.add_theme_constant_override("separation", 6)
	main_hbox.add_child(center_vbox)

	_dialogue_text = RichTextLabel.new()
	_dialogue_text.bbcode_enabled = true
	_dialogue_text.fit_content = false
	_dialogue_text.scroll_active = true
	_dialogue_text.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_dialogue_text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_dialogue_text.add_theme_font_size_override("normal_font_size", 16)
	_dialogue_text.add_theme_color_override("default_color", Color(0.9, 0.9, 0.9))
	center_vbox.add_child(_dialogue_text)

	# Language learning sub-panel (hidden by default)
	_lang_container = VBoxContainer.new()
	_lang_container.visible = false
	_lang_container.add_theme_constant_override("separation", 2)
	center_vbox.add_child(_lang_container)

	_lang_target_label = RichTextLabel.new()
	_lang_target_label.bbcode_enabled = true
	_lang_target_label.fit_content = true
	_lang_target_label.scroll_active = false
	_lang_target_label.add_theme_font_size_override("normal_font_size", 20)
	_lang_target_label.add_theme_color_override("default_color", Color(1.0, 0.95, 0.7))
	_lang_container.add_child(_lang_target_label)

	_lang_translation_label = Label.new()
	_lang_translation_label.text = ""
	_lang_translation_label.add_theme_font_size_override("font_size", 13)
	_lang_translation_label.add_theme_color_override("font_color", Color(0.6, 0.6, 0.7))
	_lang_container.add_child(_lang_translation_label)

	var lang_btn_row := HBoxContainer.new()
	_lang_container.add_child(lang_btn_row)

	_lang_listen_button = Button.new()
	_lang_listen_button.text = "Listen"
	_lang_listen_button.custom_minimum_size = Vector2(80, 30)
	_lang_listen_button.pressed.connect(_on_listen_pressed)
	lang_btn_row.add_child(_lang_listen_button)

	# ── Right column: response buttons ──
	_response_container = VBoxContainer.new()
	_response_container.custom_minimum_size = Vector2(200, 0)
	_response_container.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_response_container.add_theme_constant_override("separation", 6)
	main_hbox.add_child(_response_container)

	# ── Gesture panel (non-verbal actions during conversation) ──
	_gesture_container = HBoxContainer.new()
	_gesture_container.visible = false
	_gesture_container.add_theme_constant_override("separation", 4)
	_gesture_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	center_vbox.add_child(_gesture_container)

	for gesture_id in ["wave", "nod", "bow", "shrug"]:
		var btn := Button.new()
		btn.text = gesture_id.capitalize()
		btn.custom_minimum_size = Vector2(60, 28)
		btn.pressed.connect(perform_gesture.bind(gesture_id))
		_gesture_container.add_child(btn)
