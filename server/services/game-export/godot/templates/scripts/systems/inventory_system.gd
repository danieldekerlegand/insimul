extends Node
## Inventory System -- autoloaded singleton.
## Manages player inventory with item stacks, gold, equipment slots, and mercantile support.

signal item_added(item_id: String, count: int)
signal item_removed(item_id: String, count: int)
signal item_dropped(item: Dictionary)
signal item_used(item: Dictionary)
signal item_equipped(item: Dictionary, slot: String)
signal item_unequipped(item: Dictionary, slot: String)
signal gold_changed(new_gold: int)

## Item types matching Insimul's shared ItemType enum.
enum ItemType { QUEST, COLLECTIBLE, KEY, CONSUMABLE, WEAPON, ARMOR, FOOD, DRINK, MATERIAL, TOOL }

## Equipment slot types.
enum EquipSlot { NONE, WEAPON, ARMOR, ACCESSORY }

var max_slots := 20
var player_gold := 100

## Each slot: {item_id, name, description, type, count, value, sell_value, weight, tradeable, quest_id, equipped, equip_slot, effects}
var _slots: Array[Dictionary] = []

## Equipped items by slot name
var _equipped_slots: Dictionary = {}

func initialize() -> void:
	_slots.clear()
	_equipped_slots.clear()
	player_gold = 100
	print("[Insimul] InventorySystem initialized (max slots: %d, gold: %d)" % [max_slots, player_gold])

# --- Item Management ---

func add_item(item: Dictionary) -> bool:
	var item_id: String = item.get("item_id", "")
	var count: int = item.get("count", 1)
	for slot in _slots:
		if slot.get("item_id", "") == item_id:
			slot["count"] = slot.get("count", 0) + count
			item_added.emit(item_id, count)
			return true
	if _slots.size() >= max_slots:
		return false
	_slots.append(item)
	item_added.emit(item_id, count)
	return true

func add_item_by_id(item_id: String, count: int = 1) -> bool:
	return add_item({"item_id": item_id, "name": item_id, "count": count, "type": ItemType.COLLECTIBLE, "tradeable": true})

func remove_item(item_id: String, count: int = 1) -> bool:
	for i in range(_slots.size()):
		if _slots[i].get("item_id", "") == item_id:
			var current: int = _slots[i].get("count", 0)
			if current < count:
				return false
			_slots[i]["count"] = current - count
			if _slots[i]["count"] <= 0:
				_slots.remove_at(i)
			item_removed.emit(item_id, count)
			return true
	return false

func drop_item(item_id: String) -> bool:
	for slot in _slots:
		if slot.get("item_id", "") == item_id:
			if slot.get("type", ItemType.COLLECTIBLE) == ItemType.QUEST:
				return false  # Cannot drop quest items
			if slot.get("equipped", false):
				return false  # Cannot drop equipped items
			var copy := slot.duplicate()
			remove_item(item_id, 1)
			item_dropped.emit(copy)
			return true
	return false

func use_item(item_id: String) -> bool:
	for slot in _slots:
		if slot.get("item_id", "") == item_id:
			var item_type = slot.get("type", ItemType.COLLECTIBLE)

			# Quest and key items: emit event without consuming
			if item_type == ItemType.QUEST or item_type == ItemType.KEY:
				item_used.emit(slot.duplicate())
				return true

			# Consumable, food, drink: apply effects and consume
			if item_type in [ItemType.CONSUMABLE, ItemType.FOOD, ItemType.DRINK]:
				var copy := slot.duplicate()
				remove_item(item_id, 1)
				item_used.emit(copy)
				return true

	return false

func get_item_count(item_id: String) -> int:
	for slot in _slots:
		if slot.get("item_id", "") == item_id:
			return slot.get("count", 0)
	return 0

func has_item(item_id: String) -> bool:
	return get_item_count(item_id) > 0

func get_all_items() -> Array[Dictionary]:
	return _slots.duplicate()

# --- Equipment Management ---

func _get_slot_for_type(item_type: int) -> String:
	match item_type:
		ItemType.WEAPON: return "weapon"
		ItemType.ARMOR: return "armor"
		ItemType.TOOL: return "accessory"
		_: return ""

func equip_item(item_id: String) -> bool:
	for slot in _slots:
		if slot.get("item_id", "") == item_id:
			var equip_slot: String = slot.get("equip_slot", "")
			if equip_slot.is_empty():
				equip_slot = _get_slot_for_type(slot.get("type", ItemType.COLLECTIBLE))
			if equip_slot.is_empty():
				return false

			# Unequip any existing item in the slot
			unequip_slot(equip_slot)

			slot["equipped"] = true
			_equipped_slots[equip_slot] = item_id
			item_equipped.emit(slot.duplicate(), equip_slot)
			print("[Insimul] Equipped: %s in slot %s" % [slot.get("name", item_id), equip_slot])
			return true
	return false

func unequip_slot(slot_name: String) -> bool:
	if not _equipped_slots.has(slot_name):
		return false
	var item_id: String = _equipped_slots[slot_name]
	for slot in _slots:
		if slot.get("item_id", "") == item_id:
			slot["equipped"] = false
			item_unequipped.emit(slot.duplicate(), slot_name)
			print("[Insimul] Unequipped: %s from slot %s" % [slot.get("name", item_id), slot_name])
			break
	_equipped_slots.erase(slot_name)
	return true

func get_equipped_item(slot_name: String) -> Dictionary:
	if not _equipped_slots.has(slot_name):
		return {}
	var item_id: String = _equipped_slots[slot_name]
	for slot in _slots:
		if slot.get("item_id", "") == item_id:
			return slot
	return {}

func has_equipped_in_slot(slot_name: String) -> bool:
	return _equipped_slots.has(slot_name)

# --- Gold Management ---

func get_gold() -> int:
	return player_gold

func set_gold(amount: int) -> void:
	player_gold = max(0, amount)
	gold_changed.emit(player_gold)

func add_gold(amount: int) -> void:
	player_gold += amount
	gold_changed.emit(player_gold)
	print("[Insimul] AddGold: +%d (total: %d)" % [amount, player_gold])

func remove_gold(amount: int) -> bool:
	if player_gold < amount:
		return false
	player_gold -= amount
	gold_changed.emit(player_gold)
	print("[Insimul] RemoveGold: -%d (total: %d)" % [amount, player_gold])
	return true
