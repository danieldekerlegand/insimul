extends CanvasLayer
## HUD manager — shows health, energy, gold, and survival bars.

@onready var health_bar: ProgressBar = $HealthBar if has_node("HealthBar") else null
@onready var health_label: Label = $HealthLabel if has_node("HealthLabel") else null
@onready var gold_label: Label = $GoldLabel if has_node("GoldLabel") else null

var _player: CharacterBody3D
var _survival_system: Node = null
var _survival_bars: Dictionary = {}  # need_id -> {bar: ProgressBar, label: Label, container: HBoxContainer}
var _survival_container: VBoxContainer = null

const NEED_ICONS: Dictionary = {
	"hunger": "Hunger",
	"thirst": "Thirst",
	"temperature": "Temp",
	"stamina": "Stamina",
	"sleep": "Rest",
}

const NEED_COLORS: Dictionary = {
	"hunger": Color(0.85, 0.55, 0.2),
	"thirst": Color(0.3, 0.6, 0.9),
	"temperature": Color(0.9, 0.4, 0.3),
	"stamina": Color(0.9, 0.85, 0.2),
	"sleep": Color(0.5, 0.4, 0.8),
}

func _ready() -> void:
	await get_tree().process_frame
	_player = get_tree().get_first_node_in_group("player") as CharacterBody3D
	_survival_system = get_node_or_null("/root/SurvivalSystem")
	if _survival_system:
		_setup_survival_bars()
		if _survival_system.has_signal("need_warning"):
			_survival_system.need_warning.connect(_on_need_warning)
		if _survival_system.has_signal("need_critical"):
			_survival_system.need_critical.connect(_on_need_critical)
		if _survival_system.has_signal("need_restored"):
			_survival_system.need_restored.connect(_on_need_restored)

func _setup_survival_bars() -> void:
	_survival_container = VBoxContainer.new()
	_survival_container.name = "SurvivalBars"
	_survival_container.anchor_left = 0.0
	_survival_container.anchor_top = 0.0
	_survival_container.offset_left = 10.0
	_survival_container.offset_top = 60.0
	_survival_container.add_theme_constant_override("separation", 4)
	add_child(_survival_container)

	var all_needs: Array = _survival_system.get_all_needs()
	for need in all_needs:
		var nid: String = need.get("id", "")
		_add_survival_bar(nid, need.get("max_value", 100.0), need.get("value", 100.0))

func _add_survival_bar(need_id: String, max_val: float, current_val: float) -> void:
	var row: HBoxContainer = HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)

	var label: Label = Label.new()
	label.text = NEED_ICONS.get(need_id, need_id)
	label.custom_minimum_size = Vector2(60, 0)
	label.add_theme_font_size_override("font_size", 12)
	row.add_child(label)

	var bar: ProgressBar = ProgressBar.new()
	bar.max_value = max_val
	bar.value = current_val
	bar.custom_minimum_size = Vector2(120, 16)
	bar.show_percentage = false
	var style := StyleBoxFlat.new()
	style.bg_color = NEED_COLORS.get(need_id, Color(0.5, 0.5, 0.5))
	style.corner_radius_top_left = 3
	style.corner_radius_top_right = 3
	style.corner_radius_bottom_left = 3
	style.corner_radius_bottom_right = 3
	bar.add_theme_stylebox_override("fill", style)
	row.add_child(bar)

	_survival_container.add_child(row)
	_survival_bars[need_id] = {"bar": bar, "label": label, "container": row}

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

	_update_survival_bars()

func _update_survival_bars() -> void:
	if _survival_system == null:
		return
	for need_id in _survival_bars:
		var entry: Dictionary = _survival_bars[need_id]
		var bar: ProgressBar = entry.get("bar")
		if bar:
			bar.value = _survival_system.get_need_value(need_id)

func _on_need_warning(need_id: String, _value: float) -> void:
	_flash_bar(need_id, Color.YELLOW)

func _on_need_critical(need_id: String, _value: float) -> void:
	_flash_bar(need_id, Color.RED)

func _on_need_restored(need_id: String, _value: float) -> void:
	_reset_bar_color(need_id)

func _flash_bar(need_id: String, color: Color) -> void:
	if not _survival_bars.has(need_id):
		return
	var entry: Dictionary = _survival_bars[need_id]
	var bar: ProgressBar = entry.get("bar")
	if bar:
		var style := StyleBoxFlat.new()
		style.bg_color = color
		style.corner_radius_top_left = 3
		style.corner_radius_top_right = 3
		style.corner_radius_bottom_left = 3
		style.corner_radius_bottom_right = 3
		bar.add_theme_stylebox_override("fill", style)

func _reset_bar_color(need_id: String) -> void:
	if not _survival_bars.has(need_id):
		return
	var entry: Dictionary = _survival_bars[need_id]
	var bar: ProgressBar = entry.get("bar")
	if bar:
		var style := StyleBoxFlat.new()
		style.bg_color = NEED_COLORS.get(need_id, Color(0.5, 0.5, 0.5))
		style.corner_radius_top_left = 3
		style.corner_radius_top_right = 3
		style.corner_radius_bottom_left = 3
		style.corner_radius_bottom_right = 3
		bar.add_theme_stylebox_override("fill", style)
