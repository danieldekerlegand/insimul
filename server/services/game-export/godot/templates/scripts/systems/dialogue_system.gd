extends Node
## Dialogue System — autoloaded singleton.

signal dialogue_started(npc_id: String)
signal dialogue_ended

var is_in_dialogue := false
var current_npc_id := ""

func start_dialogue(npc_character_id: String) -> void:
	is_in_dialogue = true
	current_npc_id = npc_character_id
	dialogue_started.emit(npc_character_id)
	print("[Insimul] Dialogue started with NPC: %s" % npc_character_id)

func end_dialogue() -> void:
	var npc_id := current_npc_id
	is_in_dialogue = false
	current_npc_id = ""
	dialogue_ended.emit()
	print("[Insimul] Dialogue ended with NPC: %s" % npc_id)
