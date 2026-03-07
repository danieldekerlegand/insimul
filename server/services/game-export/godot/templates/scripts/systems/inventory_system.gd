extends Node
## Inventory System -- autoloaded singleton.
## Manages player inventory with item stacks, gold, and mercantile support.

signal item_added(item_id: String, count: int)
signal item_removed(item_id: String, count: int)
signal item_dropped(item: Dictionary)
signal item_used(item: Dictionary)
signal gold_changed(new_gold: int)

## Item types matching Insimul's shared ItemType enum.
enum ItemType { QUEST, COLLECTIBLE, KEY, CONSUMABLE, WEAPON, ARMOR, FOOD, DRINK, MATERIAL, TOOL }

var max_slots := 20
var player_gold := 100

## Each slot: {item_id, name, description, type, count, value, sell_value, weight, tradeable, quest_id}
var _slots: Array[Dictionary] = []

func initialize() -> void:
	_slots.clear()
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
			var copy := slot.duplicate()
			remove_item(item_id, 1)
			item_dropped.emit(copy)
			return true
	return false

func use_item(item_id: String) -> bool:
	for slot in _slots:
		if slot.get("item_id", "") == item_id:
			if slot.get("type", ItemType.COLLECTIBLE) != ItemType.CONSUMABLE:
				return false
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
