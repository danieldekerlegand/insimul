extends Node
## Survival System

var needs: Array[Dictionary] = []  # [{id, name, value, max_value, decay_rate, critical_threshold, warning_threshold, damage_rate}]
var damage_enabled: bool = true
var global_damage_multiplier: float = 1.0

signal need_warning(need_id: String, value: float)
signal need_critical(need_id: String, value: float)
signal damage_from_need(need_id: String, damage: float)

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
			"warning_threshold": nd.get("warningThreshold", 30.0),
			"damage_rate": nd.get("damageRate", 0.0),
			"was_critical": false,
			"was_warning": false,
		})
	var dmg_config: Dictionary = survival.get("damageConfig", {})
	damage_enabled = dmg_config.get("enabled", true)
	global_damage_multiplier = dmg_config.get("globalDamageMultiplier", 1.0)
	print("[Insimul] SurvivalSystem loaded %d needs" % needs.size())

func _process(delta: float) -> void:
	for need in needs:
		var decay: float = need.get("decay_rate", 0.0)
		if decay > 0:
			need["value"] = clampf(need.get("value", 0.0) - decay * delta, 0.0, need.get("max_value", 100.0))

		var val: float = need.get("value", 0.0)
		var crit: float = need.get("critical_threshold", 20.0)
		var warn: float = need.get("warning_threshold", 30.0)
		var is_critical: bool = val <= crit
		var is_warning: bool = val <= warn and not is_critical

		if is_critical and not need.get("was_critical", false):
			need_critical.emit(need.get("id", ""), val)
		elif is_warning and not need.get("was_warning", false):
			need_warning.emit(need.get("id", ""), val)

		need["was_critical"] = is_critical
		need["was_warning"] = is_warning

		if damage_enabled and val <= 0.0:
			var dmg_rate: float = need.get("damage_rate", 0.0)
			if dmg_rate > 0.0:
				var damage: float = dmg_rate * global_damage_multiplier * delta
				damage_from_need.emit(need.get("id", ""), damage)

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
