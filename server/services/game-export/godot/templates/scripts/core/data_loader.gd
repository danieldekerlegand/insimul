extends Node
## Static data loader — autoloaded singleton.
## Loads JSON data from res://data/.
## Mirrors the FileDataSource from the Babylon.js DataSource.ts.

const DATA_PATH := "res://data/"

## Cached world IR data (loaded lazily).
var _world_ir: Dictionary = {}
var _world_ir_loaded: bool = false

## Cached geography data (extracted from world_ir or geography.json).
var _geography: Dictionary = {}

# ── Core loaders (match DataSource interface) ──────────────────

func load_world() -> Dictionary:
	_ensure_world_ir()
	var meta: Dictionary = _world_ir.get("meta", {})
	if not meta.has("name") and meta.has("worldName"):
		meta["name"] = meta["worldName"]
	return meta

func load_world_data() -> Dictionary:
	return _load_json("world_ir.json")

func load_characters() -> Array:
	return _load_json_array("characters.json")

func load_npcs() -> Array:
	return _load_json_array("npcs.json")

func load_actions() -> Array:
	return _load_json_array("actions.json")

func load_base_actions() -> Array:
	_ensure_world_ir()
	var systems: Dictionary = _world_ir.get("systems", {})
	return systems.get("actions", [])

func load_rules() -> Array:
	return _load_json_array("rules.json")

func load_base_rules() -> Array:
	_ensure_world_ir()
	var systems: Dictionary = _world_ir.get("systems", {})
	return systems.get("rules", [])

func load_quests() -> Array:
	return _load_json_array("quests.json")

func load_settlements() -> Array:
	_ensure_geography()
	var settlements: Array = _geography.get("settlements", [])
	if settlements.size() > 0:
		return settlements
	return _load_json_array("settlements.json")

func load_buildings() -> Array:
	return _load_json_array("buildings.json")

func load_asset_manifest() -> Dictionary:
	return _load_json("asset-manifest.json")

func load_countries() -> Array:
	_ensure_geography()
	return _geography.get("countries", [])

func load_states() -> Array:
	_ensure_geography()
	return _geography.get("states", [])

func load_base_resources() -> Dictionary:
	_ensure_world_ir()
	var systems: Dictionary = _world_ir.get("systems", {})
	return systems.get("resources", {})

func load_assets() -> Array:
	var manifest: Dictionary = load_asset_manifest()
	var assets_arr: Array = manifest.get("assets", [])
	return assets_arr

func load_config_3d() -> Dictionary:
	return _load_json("3d_config.json")

# ── Array loaders ───────────────────────────────────────────────

func load_items() -> Array:
	return _load_json_array("items.json")

## Alias matching DataSource.loadWorldItems().
func load_world_items() -> Array:
	return load_items()

func load_loot_tables() -> Array:
	return _load_json_array("loot_tables.json")

func load_truths() -> Array:
	_ensure_world_ir()
	var truths: Array = _world_ir.get("truths", [])
	if truths.size() > 0:
		return truths
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

# ── Single-entity loaders ──────────────────────────────────────

## Load a single character by id. Scans characters.json.
func load_character(character_id: String) -> Dictionary:
	var chars: Array = load_characters()
	for ch in chars:
		if str(ch.get("id", "")) == character_id:
			return ch
	return {}

# ── Settlement sub-data ────────────────────────────────────────

## Load businesses for a specific settlement.
func load_settlement_businesses(settlement_id: String) -> Array:
	_ensure_geography()
	var settlements: Array = _geography.get("settlements", [])
	for s in settlements:
		if str(s.get("id", "")) == settlement_id:
			return s.get("businesses", [])
	return []

## Load lots for a specific settlement.
func load_settlement_lots(settlement_id: String) -> Array:
	_ensure_geography()
	var settlements: Array = _geography.get("settlements", [])
	for s in settlements:
		if str(s.get("id", "")) == settlement_id:
			return s.get("lots", [])
	return []

## Load residences for a specific settlement.
func load_settlement_residences(settlement_id: String) -> Array:
	_ensure_geography()
	var settlements: Array = _geography.get("settlements", [])
	for s in settlements:
		if str(s.get("id", "")) == settlement_id:
			return s.get("residences", [])
	return []

# ── Inventory / transfer helpers ──────────────────────────────

## Get inventory for an entity. In exported games, returns a stub.
func get_entity_inventory(entity_id: String) -> Dictionary:
	return {"entityId": entity_id, "items": [], "gold": 0}

## Transfer an item between entities. In exported games, logs and returns success.
## [param transfer] Dictionary with: from_entity_id, to_entity_id, item_id,
##   item_name, item_description, item_type, quantity, transaction_type, total_price
## transaction_type: "buy", "sell", "steal", "discard", "give", "quest_reward"
func transfer_item(transfer: Dictionary) -> Dictionary:
	print("[Insimul] Item transferred: %s" % str(transfer))
	var result := transfer.duplicate()
	result["success"] = true
	result["timestamp"] = Time.get_unix_time_from_system()
	return result

## Get merchant inventory. In exported games, returns null.
func get_merchant_inventory(merchant_id: String) -> Dictionary:
	return {}

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
## Checks knowledge-base.pl first, then falls back to knowledge_base.pl.
func load_prolog_knowledge_base() -> String:
	var content: String = _load_text("knowledge-base.pl")
	if content.is_empty():
		content = _load_text("knowledge_base.pl")
	return content

## Alias matching DataSource.loadPrologContent().
func load_prolog_content() -> String:
	return load_prolog_knowledge_base()

## Load geography data (heightmap, terrain features). Returns empty dict if not found.
func load_geography() -> Dictionary:
	return _load_json("geography.json")

# ── Internal caching ──────────────────────────────────────────

func _ensure_world_ir() -> void:
	if _world_ir_loaded:
		return
	_world_ir = _load_json("world_ir.json")
	_world_ir_loaded = true

func _ensure_geography() -> void:
	_ensure_world_ir()
	if _geography.is_empty():
		# Try world_ir geography first, then standalone geography.json
		if _world_ir.has("geography"):
			_geography = _world_ir["geography"]
		else:
			_geography = _load_json("geography.json")

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
