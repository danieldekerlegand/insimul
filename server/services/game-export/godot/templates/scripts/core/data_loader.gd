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

## Load base quests. Per-playthrough state (status, progress) should be
## overlaid at runtime from save game state (see save_game_state/load_game_state).
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

	# Add virtual asset entries for MongoDB asset IDs found in the IR's assetIdToPath map.
	# This allows world3DConfig texture IDs (which are MongoDB ObjectIDs) to match
	# assets in the worldAssets list.
	_ensure_world_ir()
	var meta: Dictionary = _world_ir.get("meta", {})
	var id_map: Dictionary = meta.get("assetIdToPath", {})
	if id_map.size() > 0:
		var existing_ids := {}
		for a in assets_arr:
			existing_ids[str(a.get("id", ""))] = true
		for mongo_id in id_map:
			if existing_ids.has(mongo_id):
				continue
			var file_path: String = str(id_map[mongo_id])
			var ext: String = file_path.get_extension().to_lower()
			var is_texture: bool = ext in ["png", "jpg", "jpeg"]
			var asset_type: String = "texture_wall" if is_texture else "model"
			var mime: String
			if is_texture:
				mime = "image/jpeg" if ext == "jpg" else ("image/%s" % ext)
			else:
				mime = "model/gltf-binary"
			assets_arr.append({
				"id": mongo_id,
				"name": mongo_id,
				"assetType": asset_type,
				"filePath": file_path if file_path.begins_with(".") else ("./" + file_path),
				"fileName": file_path.get_file(),
				"fileSize": 0,
				"mimeType": mime,
			})
	return assets_arr

func load_config_3d() -> Dictionary:
	var config: Dictionary = _load_json("3d_config.json")

	# Merge world3DConfig from IR — this has the full asset collection settings
	# including procedural building presets, texture IDs, and type overrides.
	# Texture IDs are MongoDB ObjectIDs which the asset ID-to-path map resolves.
	_ensure_world_ir()
	var meta: Dictionary = _world_ir.get("meta", {})
	var ir_config: Dictionary = meta.get("world3DConfig", {})
	if ir_config.size() > 0:
		# Procedural building config (style presets with colors, textures, architecture)
		if ir_config.has("proceduralBuildings"):
			config["proceduralBuildings"] = ir_config["proceduralBuildings"]
		# Per-building-type overrides (e.g., Restaurant -> colonial_warm preset)
		if ir_config.has("buildingTypeOverrides"):
			config["buildingTypeOverrides"] = ir_config["buildingTypeOverrides"]
		# Global texture IDs (fall back to manifest-derived if not present)
		if ir_config.has("wallTextureId"):
			config["wallTextureId"] = ir_config["wallTextureId"]
		if ir_config.has("roofTextureId"):
			config["roofTextureId"] = ir_config["roofTextureId"]
		# Model scaling overrides
		if ir_config.has("modelScaling"):
			config["modelScaling"] = ir_config["modelScaling"]
		# Audio assets config
		if ir_config.has("audioAssets"):
			config["audioAssets"] = ir_config["audioAssets"]
	return config

# ── Array loaders ───────────────────────────────────────────────

func load_items() -> Array:
	return _load_json_array("items.json")

## Alias matching DataSource.loadWorldItems().
func load_world_items() -> Array:
	return load_items()

func load_loot_tables() -> Array:
	return _load_json_array("loot_tables.json")

## Mirrors Container from types.ts.
func load_containers() -> Array:
	return _load_json_array("containers.json")

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

func load_water_features() -> Array:
	return _load_json_array("water_features.json")

func load_lots() -> Array:
	return _load_json_array("lots.json")

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
## Falls back to deriving from buildings data if settlement has no businesses.
func load_settlement_businesses(settlement_id: String) -> Array:
	_ensure_geography()
	var settlements: Array = _geography.get("settlements", [])
	for s in settlements:
		if str(s.get("id", "")) == settlement_id:
			var businesses: Array = s.get("businesses", [])
			if businesses.size() > 0:
				return businesses
	# Fall back to deriving from buildings data
	var all_buildings: Array = load_buildings()
	var result: Array = []
	for b in all_buildings:
		if str(b.get("settlementId", "")) == settlement_id and b.get("businessId", "") != "":
			var spec: Dictionary = b.get("spec", {})
			var occupants: Array = b.get("occupantIds", [])
			var owner_id = occupants[0] if occupants.size() > 0 else null
			var employees: Array = occupants.slice(1) if occupants.size() > 1 else []
			result.append({
				"id": b.get("businessId", b.get("id", "")),
				"settlementId": b.get("settlementId", ""),
				"businessType": spec.get("buildingRole", "Shop"),
				"name": spec.get("buildingRole", "Business"),
				"ownerId": owner_id,
				"employees": employees,
				"lotId": b.get("lotId", ""),
				"position": b.get("position", {}),
			})
	return result

## Load lots for a specific settlement.
func load_settlement_lots(settlement_id: String) -> Array:
	_ensure_geography()
	var settlements: Array = _geography.get("settlements", [])
	for s in settlements:
		if str(s.get("id", "")) == settlement_id:
			return s.get("lots", [])
	return []

## Load residences for a specific settlement.
## Falls back to deriving from buildings data if settlement has no residences.
func load_settlement_residences(settlement_id: String) -> Array:
	_ensure_geography()
	var settlements: Array = _geography.get("settlements", [])
	for s in settlements:
		if str(s.get("id", "")) == settlement_id:
			var residences: Array = s.get("residences", [])
			if residences.size() > 0:
				return residences
	# Fall back to deriving from buildings data
	var all_buildings: Array = load_buildings()
	var result: Array = []
	for b in all_buildings:
		if str(b.get("settlementId", "")) == settlement_id and b.get("residenceId", "") != "":
			var spec: Dictionary = b.get("spec", {})
			result.append({
				"id": b.get("residenceId", b.get("id", "")),
				"settlementId": b.get("settlementId", ""),
				"residenceType": spec.get("buildingRole", "House"),
				"name": spec.get("buildingRole", "Residence"),
				"occupantIds": b.get("occupantIds", []),
				"lotId": b.get("lotId", ""),
				"position": b.get("position", {}),
			})
	return result

# ── Local state management ────────────────────────────────────
# Inventories, quest progress, merchant stock, and fines are tracked
# in-memory and persisted via save_game_state/load_game_state.
# This mirrors the LocalGameState class from DataSource.ts.
#
# TODO: Implement full local state tracking with dictionaries for
# _inventories, _quest_updates, _merchant_caches, _fines_paid.

var _inventories: Dictionary = {}
var _quest_updates: Dictionary = {}
var _merchant_caches: Dictionary = {}
var _fines_paid: Dictionary = {}
var _playthrough_id: String = ""

## Get inventory for an entity from local state.
func get_entity_inventory(entity_id: String) -> Dictionary:
	if _inventories.has(entity_id):
		var inv: Dictionary = _inventories[entity_id]
		return {"entityId": entity_id, "items": inv.get("items", []), "gold": inv.get("gold", 0)}
	return {"entityId": entity_id, "items": [], "gold": 0}

## Transfer an item between entities. Updates local inventory state.
## Supports buy/sell/steal/give/discard/quest_reward transaction types.
func transfer_item(transfer: Dictionary) -> Dictionary:
	var qty: int = transfer.get("quantity", 1)
	var price: int = transfer.get("total_price", 0)
	var from_id: String = transfer.get("from_entity_id", "")
	var to_id: String = transfer.get("to_entity_id", "")

	# Remove from source
	if not from_id.is_empty() and _inventories.has(from_id):
		var from_inv: Dictionary = _inventories[from_id]
		var items: Array = from_inv.get("items", [])
		for i in range(items.size()):
			if str(items[i].get("id", "")) == transfer.get("item_id", ""):
				var cur_qty: int = items[i].get("quantity", 1)
				if cur_qty <= qty:
					items.remove_at(i)
				else:
					items[i]["quantity"] = cur_qty - qty
				break
		if transfer.get("transaction_type", "") == "sell" and price > 0:
			from_inv["gold"] = from_inv.get("gold", 0) + price

	# Add to destination
	if not to_id.is_empty():
		if not _inventories.has(to_id):
			_inventories[to_id] = {"items": [], "gold": 0}
		var to_inv: Dictionary = _inventories[to_id]
		var to_items: Array = to_inv.get("items", [])
		var found := false
		for item in to_items:
			if str(item.get("id", "")) == transfer.get("item_id", ""):
				item["quantity"] = item.get("quantity", 1) + qty
				found = true
				break
		if not found:
			to_items.append({
				"id": transfer.get("item_id", ""),
				"name": transfer.get("item_name", ""),
				"type": transfer.get("item_type", "misc"),
				"quantity": qty,
			})
		if transfer.get("transaction_type", "") == "buy" and price > 0:
			to_inv["gold"] = to_inv.get("gold", 0) - price

	var result := transfer.duplicate()
	result["success"] = true
	result["timestamp"] = Time.get_unix_time_from_system()
	return result

## Get merchant inventory. Generates stock based on NPC occupation if not cached.
func get_merchant_inventory(merchant_id: String) -> Dictionary:
	if _merchant_caches.has(merchant_id):
		return _merchant_caches[merchant_id]
	# TODO: Look up NPC from characters/npcs, check occupation, generate stock
	return {}

## Update quest progress locally. Merged into quest data on load_quests.
func update_quest(quest_id: String, update_data: Dictionary) -> void:
	if not _quest_updates.has(quest_id):
		_quest_updates[quest_id] = {}
	_quest_updates[quest_id].merge(update_data, true)

## Mark a quest as completed locally.
func complete_quest(quest_id: String) -> Dictionary:
	var now_iso := Time.get_datetime_string_from_system(true)
	update_quest(quest_id, {"status": "completed", "completedAt": now_iso})
	print("[Insimul] complete_quest(%s)" % quest_id)
	return {"success": true, "questId": quest_id}

## Get quest guidance context for an NPC. Scans active quests for objectives
## targeting this NPC and returns a system prompt addition.
func get_npc_quest_guidance(npc_id: String) -> Dictionary:
	var quests: Array = load_quests()
	var hints: Array = []
	for q in quests:
		var status: String = q.get("status", "")
		if _quest_updates.has(str(q.get("id", ""))):
			status = _quest_updates[str(q.get("id", ""))].get("status", status)
		if status != "active" and status != "in_progress":
			continue
		var objectives: Array = q.get("objectives", [])
		for obj in objectives:
			if str(obj.get("targetNpcId", "")) == npc_id or str(obj.get("npcId", "")) == npc_id:
				var desc: String = obj.get("description", obj.get("title", "Talk to this NPC"))
				hints.append("Quest \"%s\": %s" % [q.get("title", ""), desc])
	if hints.size() == 0:
		return {"hasGuidance": false}
	return {
		"hasGuidance": true,
		"systemPromptAddition": "The player has active quest objectives involving you:\n" + "\n".join(hints),
	}

## Get main quest journal data built from local main quest data.
func get_main_quest_journal(player_id: String, cefr_level: String = "") -> Dictionary:
	var quests: Array = load_quests()
	var chapters: Array = []
	for q in quests:
		if q.get("questType", "") != "main_quest":
			continue
		var q_id: String = str(q.get("id", ""))
		var status: String = q.get("status", "locked")
		if _quest_updates.has(q_id):
			status = _quest_updates[q_id].get("status", status)
		chapters.append({
			"id": q_id,
			"title": q.get("title", ""),
			"description": q.get("description", ""),
			"order": q.get("questChainOrder", 0),
			"status": status,
			"objectives": q.get("objectives", []),
		})
	var current_id = chapters[0].get("id") if chapters.size() > 0 else null
	return {
		"state": {"currentChapterId": current_id, "totalXPEarned": 0, "caseNotes": []},
		"chapters": chapters,
		"playerCefrLevel": cefr_level if not cefr_level.is_empty() else null,
		"investigationBoard": null,
	}

## Try to unlock the next CEFR-gated main quest chapter.
func try_unlock_main_quest(player_id: String, cefr_level: String) -> void:
	var quests: Array = load_quests()
	var main_quests: Array = []
	for q in quests:
		if q.get("questType", "") == "main_quest":
			main_quests.append(q)
	main_quests.sort_custom(func(a, b): return a.get("questChainOrder", 0) < b.get("questChainOrder", 0))
	for q in main_quests:
		var q_id: String = str(q.get("id", ""))
		var status: String = q.get("status", "locked")
		if _quest_updates.has(q_id):
			status = _quest_updates[q_id].get("status", status)
		if status == "locked" and q.has("cefrRequirement"):
			if cefr_level >= str(q.get("cefrRequirement", "")):
				update_quest(q_id, {"status": "active"})
				print("[Insimul] try_unlock_main_quest: unlocked %s" % q_id)
				break

## Record a main quest completion. In exported mode, just acknowledges the completion.
func record_main_quest_completion(player_id: String, quest_type: String, _cefr_level: String = "") -> Dictionary:
	print("[Insimul] record_main_quest_completion(%s, %s)" % [player_id, quest_type])
	return {"result": {"questType": quest_type, "recorded": true}}

## Pay fines for a settlement. Clears accumulated fines.
func pay_fines(settlement_id: String) -> Dictionary:
	var amount: int = _fines_paid.get(settlement_id, 0)
	_fines_paid[settlement_id] = 0
	return {"success": true, "finesPaid": amount}

## List existing playthroughs from the persistent index file.
func list_playthroughs() -> Array:
	return _load_playthroughs_index()

## Start a new playthrough with a unique local ID.
## Generates an ID like "local-1679500000-a3f2b1", persists to index, and sets _playthrough_id.
func start_playthrough(playthrough_name: String) -> Dictionary:
	var timestamp := int(Time.get_unix_time_from_system())
	var random_hex := "%06x" % (randi() & 0xFFFFFF)
	var new_id := "local-%d-%s" % [timestamp, random_hex]
	_playthrough_id = new_id

	var now_iso := Time.get_datetime_string_from_system(true)
	var entry := {
		"id": new_id,
		"name": playthrough_name,
		"status": "active",
		"createdAt": now_iso,
		"lastPlayedAt": now_iso,
		"playtime": 0,
	}

	var index := _load_playthroughs_index()
	index.append(entry)
	_save_playthroughs_index(index)

	print("[Insimul] start_playthrough: created %s (%s)" % [new_id, playthrough_name])
	return entry

## Look up a specific playthrough by ID from the index.
func get_playthrough(playthrough_id: String) -> Dictionary:
	var index := _load_playthroughs_index()
	for entry in index:
		if str(entry.get("id", "")) == playthrough_id:
			return entry
	return {}

## Update playthrough metadata. Merges provided fields into the existing entry.
## Returns true on success.
func update_playthrough(playthrough_id: String, updates: Dictionary) -> bool:
	var index := _load_playthroughs_index()
	var found := false
	for entry in index:
		if str(entry.get("id", "")) == playthrough_id:
			for key in updates:
				entry[key] = updates[key]
			entry["lastPlayedAt"] = Time.get_datetime_string_from_system(true)
			found = true
			break
	if not found:
		return false
	_save_playthroughs_index(index)
	return true

## Delete a playthrough and all associated save data.
## Returns true on success.
func delete_playthrough(playthrough_id: String) -> bool:
	# Remove save slot files
	for i in range(10):
		var save_path := "user://insimul_save_%s_%d.json" % [playthrough_id, i]
		if FileAccess.file_exists(save_path):
			DirAccess.remove_absolute(save_path)
	# Remove quest progress
	var quest_path := "user://insimul_quest_progress_%s.json" % playthrough_id
	if FileAccess.file_exists(quest_path):
		DirAccess.remove_absolute(quest_path)
	# Remove from index
	var index := _load_playthroughs_index()
	var filtered := []
	for entry in index:
		if str(entry.get("id", "")) != playthrough_id:
			filtered.append(entry)
	_save_playthroughs_index(filtered)
	print("[Insimul] delete_playthrough: removed %s" % playthrough_id)
	return true

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

# ── Save / Load ───────────────────────────────────────────────

## Save game state dictionary to a numbered slot (0-2), scoped per playthrough.
## Writes to user://insimul_save_<playthrough_id>_<slot_index>.json.
## Also updates the lastPlayedAt timestamp in the playthroughs index.
func save_game_state(slot_index: int, game_state: Dictionary, playthrough_id: String = "") -> bool:
	if slot_index < 0 or slot_index > 2:
		push_warning("[Insimul] save_game_state: invalid slot %d (must be 0-2)" % slot_index)
		return false
	var pt_id := playthrough_id if not playthrough_id.is_empty() else _playthrough_id
	if pt_id.is_empty():
		push_warning("[Insimul] save_game_state: no playthrough_id set")
		return false
	var save_path := "user://insimul_save_%s_%d.json" % [pt_id, slot_index]
	var json := JSON.stringify(game_state)
	var file := FileAccess.open(save_path, FileAccess.WRITE)
	if file == null:
		push_error("[Insimul] save_game_state: could not open %s for writing" % save_path)
		return false
	file.store_string(json)
	_update_last_played(pt_id)
	print("[Insimul] save_game_state: saved to slot %d (playthrough %s)" % [slot_index, pt_id])
	return true

## Load game state dictionary from a numbered slot (0-2), scoped per playthrough.
## Returns empty dictionary if no save exists.
func load_game_state(slot_index: int, playthrough_id: String = "") -> Dictionary:
	if slot_index < 0 or slot_index > 2:
		push_warning("[Insimul] load_game_state: invalid slot %d (must be 0-2)" % slot_index)
		return {}
	var pt_id := playthrough_id if not playthrough_id.is_empty() else _playthrough_id
	if pt_id.is_empty():
		push_warning("[Insimul] load_game_state: no playthrough_id set")
		return {}
	var save_path := "user://insimul_save_%s_%d.json" % [pt_id, slot_index]
	if not FileAccess.file_exists(save_path):
		return {}
	var file := FileAccess.open(save_path, FileAccess.READ)
	if file == null:
		return {}
	var json := JSON.new()
	var error := json.parse(file.get_as_text())
	if error != OK:
		push_error("[Insimul] load_game_state: JSON parse error in slot %d" % slot_index)
		return {}
	print("[Insimul] load_game_state: loaded slot %d (playthrough %s)" % [slot_index, pt_id])
	return json.data if json.data is Dictionary else {}

## Delete game state from a numbered slot (0-2), scoped per playthrough.
## Returns true if the file was deleted or did not exist.
func delete_game_state(slot_index: int, playthrough_id: String = "") -> bool:
	if slot_index < 0 or slot_index > 2:
		push_warning("[Insimul] delete_game_state: invalid slot %d (must be 0-2)" % slot_index)
		return false
	var pt_id := playthrough_id if not playthrough_id.is_empty() else _playthrough_id
	if pt_id.is_empty():
		push_warning("[Insimul] delete_game_state: no playthrough_id set")
		return false
	var save_path := "user://insimul_save_%s_%d.json" % [pt_id, slot_index]
	if FileAccess.file_exists(save_path):
		DirAccess.remove_absolute(save_path)
	print("[Insimul] delete_game_state: deleted slot %d (playthrough %s)" % [slot_index, pt_id])
	return true

## Save quest progress dictionary to a dedicated file, scoped per playthrough.
## Returns true on success.
func save_quest_progress(quest_progress: Dictionary, playthrough_id: String = "") -> bool:
	var pt_id := playthrough_id if not playthrough_id.is_empty() else _playthrough_id
	if pt_id.is_empty():
		push_warning("[Insimul] save_quest_progress: no playthrough_id set")
		return false
	var save_path := "user://insimul_quest_progress_%s.json" % pt_id
	var json := JSON.stringify(quest_progress)
	var file := FileAccess.open(save_path, FileAccess.WRITE)
	if file == null:
		push_error("[Insimul] save_quest_progress: could not open %s for writing" % save_path)
		return false
	file.store_string(json)
	print("[Insimul] save_quest_progress: saved (playthrough %s)" % pt_id)
	return true

## Load quest progress dictionary from the dedicated file, scoped per playthrough.
## Returns empty dictionary if no quest progress has been saved.
func load_quest_progress(playthrough_id: String = "") -> Dictionary:
	var pt_id := playthrough_id if not playthrough_id.is_empty() else _playthrough_id
	if pt_id.is_empty():
		push_warning("[Insimul] load_quest_progress: no playthrough_id set")
		return {}
	var save_path := "user://insimul_quest_progress_%s.json" % pt_id
	if not FileAccess.file_exists(save_path):
		return {}
	var file := FileAccess.open(save_path, FileAccess.READ)
	if file == null:
		return {}
	var json := JSON.new()
	var error := json.parse(file.get_as_text())
	if error != OK:
		push_error("[Insimul] load_quest_progress: JSON parse error")
		return {}
	print("[Insimul] load_quest_progress: loaded (playthrough %s)" % pt_id)
	return json.data if json.data is Dictionary else {}

# ── Playthrough relationships ─────────────────────────────────

## Load playthrough relationship overlays (empty in exported mode).
func load_playthrough_relationships() -> Array:
	return []  # No server in exported mode

## Update a playthrough relationship (no-op in exported mode).
func update_playthrough_relationship(_from_id: String, _to_id: String, _type: String, _strength: float) -> bool:
	return false  # No server in exported mode

## Get all reputations for the current playthrough (empty in exported mode).
func get_reputations() -> Array:
	return []  # No server in exported mode

# ── Playthroughs index helpers ─────────────────────────────────

const PLAYTHROUGHS_INDEX_PATH := "user://insimul_playthroughs.json"

## Load the playthroughs index from disk. Returns an Array of playthrough entries.
func _load_playthroughs_index() -> Array:
	if not FileAccess.file_exists(PLAYTHROUGHS_INDEX_PATH):
		return []
	var file := FileAccess.open(PLAYTHROUGHS_INDEX_PATH, FileAccess.READ)
	if file == null:
		return []
	var json := JSON.new()
	var error := json.parse(file.get_as_text())
	if error != OK:
		push_error("[Insimul] _load_playthroughs_index: JSON parse error")
		return []
	return json.data if json.data is Array else []

## Save the playthroughs index array to disk.
func _save_playthroughs_index(index: Array) -> void:
	var json := JSON.stringify(index)
	var file := FileAccess.open(PLAYTHROUGHS_INDEX_PATH, FileAccess.WRITE)
	if file == null:
		push_error("[Insimul] _save_playthroughs_index: could not open %s for writing" % PLAYTHROUGHS_INDEX_PATH)
		return
	file.store_string(json)

## Update the lastPlayedAt timestamp for a playthrough in the index.
func _update_last_played(pt_id: String) -> void:
	var index := _load_playthroughs_index()
	var now_iso := Time.get_datetime_string_from_system(true)
	for entry in index:
		if str(entry.get("id", "")) == pt_id:
			entry["lastPlayedAt"] = now_iso
			break
	_save_playthroughs_index(index)

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
