extends Node
## Static data loader — autoloaded singleton.
## Loads JSON data from res://data/.

const DATA_PATH := "res://data/"

# ── Existing loaders ────────────────────────────────────────────

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

# ── Array loaders ───────────────────────────────────────────────

func load_items() -> Array:
	return _load_json_array("items.json")

func load_loot_tables() -> Array:
	return _load_json_array("loot_tables.json")

func load_truths() -> Array:
	return _load_json_array("truths.json")

func load_grammars() -> Array:
	return _load_json_array("grammars.json")

func load_businesses() -> Array:
	return _load_json_array("businesses.json")

func load_roads() -> Array:
	return _load_json_array("roads.json")

func load_dialogue_contexts() -> Array:
	return _load_json_array("dialogue_contexts.json")

func load_resources() -> Array:
	return _load_json_array("resources.json")

# ── Single-object loaders ──────────────────────────────────────

func load_theme() -> Dictionary:
	return _load_json("theme.json")

func load_player_config() -> Dictionary:
	return _load_json("player.json")

func load_combat_config() -> Dictionary:
	return _load_json("combat.json")

func load_ui_config() -> Dictionary:
	return _load_json("ui.json")

func load_ai_config() -> Dictionary:
	return _load_json("ai_config.json")

func load_survival_config() -> Dictionary:
	return _load_json("survival.json")

# ── Text file loaders ──────────────────────────────────────────

## Load the Prolog knowledge base as a raw string. Returns "" if not found.
func load_prolog_knowledge_base() -> String:
	return _load_text("knowledge_base.pl")

# ── Internal helpers ───────────────────────────────────────────

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

func _load_text(filename: String) -> String:
	var path := DATA_PATH + filename
	if not FileAccess.file_exists(path):
		push_warning("[Insimul] Text file not found: %s" % path)
		return ""
	var file := FileAccess.open(path, FileAccess.READ)
	return file.get_as_text()
