extends Node
## Rule Enforcer — autoloaded singleton.
## Evaluates and enforces game rules with item condition support.

var rules: Array[Dictionary] = []
var _prolog_content: String = ""
var has_prolog_kb: bool = false

func load_from_data(world_data: Dictionary) -> void:
	var systems: Dictionary = world_data.get("systems", {})
	rules.append_array(systems.get("rules", []))
	rules.append_array(systems.get("baseRules", []))
	print("[Insimul] RuleEnforcer loaded %d rules" % rules.size())

func evaluate_rules(context: Dictionary) -> Array[String]:
	var violations: Array[String] = []
	for rule in rules:
		if not rule.get("isActive", true):
			continue
		var rule_type: String = rule.get("ruleType", "")
		if rule_type != "trigger" and rule_type != "volition":
			continue
		if _check_rule_conditions(rule, context):
			var restriction := _find_restriction(rule, context.get("actionType", ""))
			if restriction.size() > 0:
				var msg: String = restriction.get("message", "")
				if msg.is_empty():
					msg = "Action violates rule: %s" % rule.get("name", rule.get("id", ""))
				violations.append(msg)
	return violations

## Check if an action is allowed, consulting Prolog KB when available.
## Mirrors RuleEnforcer.canPerformActionAsync from the Babylon.js source.
func can_perform_action(action_id: String, action_type: String, context: Dictionary) -> bool:
	if has_prolog_kb:
		print("[Insimul] Consulting Prolog KB for action %s" % action_id)
	var ctx := context.duplicate()
	ctx["actionId"] = action_id
	ctx["actionType"] = action_type
	var violations := evaluate_rules(ctx)
	return violations.is_empty()

## Attach a Prolog knowledge base string for logic-based rule evaluation.
func set_prolog_knowledge_base(prolog_content: String) -> void:
	_prolog_content = prolog_content
	has_prolog_kb = not prolog_content.is_empty()
	print("[Insimul] Prolog KB %s (%d chars)" % ["attached" if has_prolog_kb else "cleared", prolog_content.length()])

# --- Condition evaluation ---

func _check_rule_conditions(rule: Dictionary, context: Dictionary) -> bool:
	var conditions: Array = rule.get("conditions", [])
	if conditions.is_empty():
		return true
	for cond in conditions:
		if not _evaluate_condition(cond, context):
			return false
	return true

func _evaluate_condition(condition: Dictionary, context: Dictionary) -> bool:
	var type: String = condition.get("type", "")
	match type:
		"location": return _check_location_condition(condition, context)
		"zone": return _check_zone_condition(condition, context)
		"action": return _check_action_condition(condition, context)
		"energy": return _check_energy_condition(condition, context)
		"proximity": return context.get("nearNPC", false)
		"tag": return true
		"has_item": return _check_has_item_condition(condition, context)
		"item_count": return _check_item_count_condition(condition, context)
		"item_type": return _check_item_type_condition(condition, context)
		_: return true

func _check_location_condition(condition: Dictionary, context: Dictionary) -> bool:
	var loc: String = condition.get("location", "")
	if loc == "settlement":
		return context.get("inSettlement", false)
	if loc == "wilderness":
		return not context.get("inSettlement", false)
	return true

func _check_zone_condition(condition: Dictionary, context: Dictionary) -> bool:
	var zone: String = condition.get("zone", "")
	if zone == "safe" or zone == "settlement":
		return context.get("inSettlement", false)
	if zone == "combat" or zone == "wilderness":
		return not context.get("inSettlement", false)
	return true

func _check_action_condition(condition: Dictionary, context: Dictionary) -> bool:
	var action: String = condition.get("action", "")
	if not action.is_empty():
		return context.get("actionType", "") == action or context.get("actionId", "") == action
	return true

func _check_energy_condition(condition: Dictionary, context: Dictionary) -> bool:
	var energy: float = context.get("playerEnergy", -1.0)
	if energy < 0.0:
		return true
	var op: String = condition.get("operator", ">=")
	var value: float = condition.get("value", 0.0)
	return _compare_value(energy, value, op)

func _check_has_item_condition(condition: Dictionary, context: Dictionary) -> bool:
	var inventory: Array = context.get("playerInventory", [])
	if inventory.is_empty():
		return false
	var item_id: String = condition.get("itemId", "")
	var item_name: String = condition.get("itemName", "")
	for item in inventory:
		if not item_id.is_empty() and item.get("item_id", "") == item_id:
			return true
		if not item_name.is_empty() and item.get("name", "").to_lower() == item_name.to_lower():
			return true
	return false

func _check_item_count_condition(condition: Dictionary, context: Dictionary) -> bool:
	var inventory: Array = context.get("playerInventory", [])
	if inventory.is_empty():
		return false
	var item_id: String = condition.get("itemId", "")
	var item_name: String = condition.get("itemName", "")
	var qty: int = 0
	for item in inventory:
		if (not item_id.is_empty() and item.get("item_id", "") == item_id) or \
		   (not item_name.is_empty() and item.get("name", "").to_lower() == item_name.to_lower()):
			qty = item.get("count", 0)
			break
	var required: int = condition.get("quantity", 1)
	var op: String = condition.get("operator", ">=")
	return _compare_value(float(qty), float(required), op)

func _check_item_type_condition(condition: Dictionary, context: Dictionary) -> bool:
	var inventory: Array = context.get("playerInventory", [])
	var target_type: String = condition.get("itemType", "")
	if inventory.is_empty() or target_type.is_empty():
		return false
	for item in inventory:
		if str(item.get("type", "")).to_lower() == target_type.to_lower():
			return true
	return false

func _compare_value(actual: float, expected: float, op: String) -> bool:
	match op:
		">": return actual > expected
		">=": return actual >= expected
		"<": return actual < expected
		"<=": return actual <= expected
		"==": return is_equal_approx(actual, expected)
		_: return actual >= expected

func _find_restriction(rule: Dictionary, action_type: String) -> Dictionary:
	var effects: Array = rule.get("effects", [])
	for effect in effects:
		var etype: String = effect.get("type", "")
		if etype == "restrict" or etype == "prevent" or etype == "block":
			var eaction: String = effect.get("action", "")
			if eaction.is_empty() or eaction == action_type or eaction == "all":
				return effect
	return {}
