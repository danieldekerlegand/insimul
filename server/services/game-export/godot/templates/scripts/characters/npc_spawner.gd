extends Node3D
## Spawns NPCs from world data.
## Add to the "world_generator" group so GameManager calls generate_from_data().
##
## Reads asset-manifest.json at startup to find the bundled character GLB/GLTF.
## Falls back to a capsule mesh if no character asset is available.

var _npc_scene: PackedScene = null

func _ready() -> void:
	add_to_group("world_generator")
	_load_npc_scene_from_manifest()

func _load_npc_scene_from_manifest() -> void:
	var manifest_path := "res://data/asset-manifest.json"
	if not FileAccess.file_exists(manifest_path):
		push_warning("[Insimul] NPCSpawner: asset-manifest.json not found — using capsule fallback")
		return
	var file := FileAccess.open(manifest_path, FileAccess.READ)
	if not file:
		return
	var json := JSON.new()
	if json.parse(file.get_as_text()) != OK:
		push_warning("[Insimul] NPCSpawner: failed to parse asset-manifest.json")
		return
	var manifest: Dictionary = json.data if json.data is Dictionary else {}
	var assets: Array = manifest.get("assets", [])
	for entry in assets:
		if entry.get("category", "") != "character":
			continue
		var role: String = entry.get("role", "")
		# Prefer an explicit NPC role; skip player-only roles
		if role == "player_default" or role == "player_texture":
			continue
		var export_path: String = entry.get("exportPath", "")
		if export_path == "":
			continue
		var scene := load("res://" + export_path) as PackedScene
		if scene:
			_npc_scene = scene
			print("[Insimul] NPCSpawner: loaded NPC model — %s" % export_path)
			return
	push_warning("[Insimul] NPCSpawner: no usable character asset in manifest — using capsule fallback")

func generate_from_data(world_data: Dictionary) -> void:
	var entities: Dictionary = world_data.get("entities", {})
	var npcs: Array = entities.get("npcs", [])
	for npc_data in npcs:
		_spawn_npc(npc_data)
	print("[Insimul] NPCSpawner: spawned %d NPCs" % npcs.size())

func _spawn_npc(data: Dictionary) -> void:
	var npc := CharacterBody3D.new()

	if _npc_scene:
		# GLTF scenes instantiate as a Node3D hierarchy; add as visual child
		var model := _npc_scene.instantiate()
		npc.add_child(model)
	else:
		# Fallback: capsule mesh
		var mesh_inst := MeshInstance3D.new()
		mesh_inst.mesh = CapsuleMesh.new()
		npc.add_child(mesh_inst)

	var col := CollisionShape3D.new()
	col.shape = CapsuleShape3D.new()
	npc.add_child(col)

	var nav := NavigationAgent3D.new()
	npc.add_child(nav)

	var pos: Dictionary = data.get("homePosition", {})
	npc.global_position = Vector3(pos.get("x", 0), pos.get("y", 0), pos.get("z", 0))
	npc.name = "NPC_%s" % data.get("characterId", "unknown")
	add_child(npc)

	var script := load("res://scripts/characters/npc_controller.gd")
	if script:
		npc.set_script(script)
		npc.init_from_data(data)
