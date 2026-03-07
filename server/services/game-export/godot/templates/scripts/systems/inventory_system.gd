extends Node
## Inventory System — autoloaded singleton.

signal item_added(item_id: String, count: int)
signal item_removed(item_id: String, count: int)

var max_slots := 20
var _slots: Array[Dictionary] = []  # [{item_id: String, count: int}]

func initialize() -> void:
	_slots.clear()
	print("[Insimul] InventorySystem initialized (max slots: %d)" % max_slots)

func add_item(item_id: String, count: int = 1) -> bool:
	for slot in _slots:
		if slot.get("item_id", "") == item_id:
			slot["count"] = slot.get("count", 0) + count
			item_added.emit(item_id, count)
			return true
	if _slots.size() >= max_slots:
		return false
	_slots.append({"item_id": item_id, "count": count})
	item_added.emit(item_id, count)
	return true

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

func get_item_count(item_id: String) -> int:
	for slot in _slots:
		if slot.get("item_id", "") == item_id:
			return slot.get("count", 0)
	return 0

func get_all_items() -> Array[Dictionary]:
	return _slots.duplicate()
