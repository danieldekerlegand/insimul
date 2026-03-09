extends Node
## Rule Enforcer — autoloaded singleton.

var rules: Array[Dictionary] = []
var _prolog_content: String = ""
var has_prolog_kb: bool = false

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

## Check if an action is allowed, consulting Prolog KB when available.
## Mirrors RuleEnforcer.canPerformActionAsync from the Babylon.js source.
func can_perform_action(action_id: String, action_type: String, context: String) -> bool:
	if has_prolog_kb:
		print("[Insimul] Consulting Prolog KB for action %s" % action_id)
		# TODO: Integrate Prolog evaluation for rules with prologContent
	var violations := evaluate_rules(context)
	return violations.is_empty()

## Attach a Prolog knowledge base string for logic-based rule evaluation.
func set_prolog_knowledge_base(prolog_content: String) -> void:
	_prolog_content = prolog_content
	has_prolog_kb = not prolog_content.is_empty()
	print("[Insimul] Prolog KB %s (%d chars)" % ["attached" if has_prolog_kb else "cleared", prolog_content.length()])
