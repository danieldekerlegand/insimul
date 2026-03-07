extends Node
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

func load_asset_manifest() -> Dictionary:
	return _load_json("asset-manifest.json")

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
