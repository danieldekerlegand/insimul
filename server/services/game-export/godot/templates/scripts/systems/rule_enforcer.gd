extends Node
## Rule Enforcer — autoloaded singleton.

var rules: Array[Dictionary] = []

func load_from_data(world_data: Dictionary) -> void:
	var systems: Dictionary = world_data.get("systems", {})
	rules.append_array(systems.get("rules", []))
	rules.append_array(systems.get("baseRules", []))
	print("[Insimul] RuleEnforcer loaded %d rules" % rules.size())

func evaluate_rules(context: String) -> Array[Dictionary]:
	var applicable: Array[Dictionary] = []
	for rule in rules:
		if not rule.get("isActive", true):
			continue
		# TODO: Evaluate rule conditions against context
		applicable.append(rule)
	return applicable
