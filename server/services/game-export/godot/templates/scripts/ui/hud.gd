extends CanvasLayer
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
