/**
 * Godot Scene Generator
 *
 * Generates .tscn scene files in Godot's text-based scene format.
 * Creates the root scene with DirectionalLight3D, Camera3D,
 * Player, all world generator nodes, and full UI hierarchy.
 *
 * Also generates a JSON scene descriptor for runtime data loading.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './godot-project-generator';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ExtResource {
  id: number;
  path: string;
  type: string;
}

// ─────────────────────────────────────────────
// .tscn generation
// ─────────────────────────────────────────────

function generateMainTscn(ir: WorldIR): string {
  const theme = ir.theme.visualTheme;
  const rawSp = ir.player.startPosition;
  const terrainSize = ir.geography?.terrainSize ?? 512;
  const half = terrainSize / 2;
  const sp = {
    x: Math.max(-half, Math.min(half, rawSp.x)),
    y: rawSp.y,
    z: Math.max(-half, Math.min(half, rawSp.z)),
  };

  // Build external resources list dynamically
  const extResources: ExtResource[] = [
    { id: 1, path: 'res://scripts/core/game_manager.gd', type: 'Script' },
    { id: 2, path: 'res://scripts/characters/player_controller.gd', type: 'Script' },
    { id: 3, path: 'res://scripts/world/world_scale_manager.gd', type: 'Script' },
    { id: 4, path: 'res://scripts/world/building_generator.gd', type: 'Script' },
    { id: 5, path: 'res://scripts/world/road_generator.gd', type: 'Script' },
    { id: 6, path: 'res://scripts/world/nature_generator.gd', type: 'Script' },
    { id: 7, path: 'res://scripts/characters/npc_spawner.gd', type: 'Script' },
    { id: 8, path: 'res://scripts/ui/hud.gd', type: 'Script' },
    { id: 9, path: 'res://scripts/world/water_generator.gd', type: 'Script' },
    { id: 10, path: 'res://scripts/world/terrain_generator.gd', type: 'Script' },
    { id: 11, path: 'res://scripts/ui/world_map.gd', type: 'Script' },
    { id: 12, path: 'res://scripts/ui/inventory_ui.gd', type: 'Script' },
    { id: 13, path: 'res://scripts/ui/quest_journal_ui.gd', type: 'Script' },
    { id: 14, path: 'res://scripts/ui/game_menu.gd', type: 'Script' },
    { id: 15, path: 'res://scripts/ui/dialogue_panel.gd', type: 'Script' },
    { id: 16, path: 'res://scripts/ui/quest_tracker_ui.gd', type: 'Script' },
    { id: 17, path: 'res://scripts/ui/chat_panel.gd', type: 'Script' },
    { id: 19, path: 'res://scripts/world/day_night_cycle.gd', type: 'Script' },
    { id: 20, path: 'res://scripts/world/item_spawner.gd', type: 'Script' },
    { id: 21, path: 'res://scripts/world/weather_system.gd', type: 'Script' },
    { id: 22, path: 'res://scripts/world/animal_system.gd', type: 'Script' },
    // New parity scripts
    { id: 23, path: 'res://scripts/world/terrain_foundation_renderer.gd', type: 'Script' },
    { id: 24, path: 'res://scripts/world/settlement_scene_manager.gd', type: 'Script' },
    { id: 25, path: 'res://scripts/world/chunk_manager.gd', type: 'Script' },
    { id: 26, path: 'res://scripts/world/town_square_generator.gd', type: 'Script' },
    { id: 27, path: 'res://scripts/world/building_placement_system.gd', type: 'Script' },
    { id: 28, path: 'res://scripts/world/building_sign_manager.gd', type: 'Script' },
    { id: 29, path: 'res://scripts/world/building_collision_system.gd', type: 'Script' },
    { id: 30, path: 'res://scripts/world/interior_scene_manager.gd', type: 'Script' },
    { id: 31, path: 'res://scripts/world/outdoor_furniture_generator.gd', type: 'Script' },
    { id: 32, path: 'res://scripts/world/container_spawn_system.gd', type: 'Script' },
    { id: 33, path: 'res://scripts/world/exterior_item_manager.gd', type: 'Script' },
    // Parity part 2 — character and system scripts
    { id: 34, path: 'res://scripts/characters/camera_manager.gd', type: 'Script' },
    { id: 35, path: 'res://scripts/characters/npc_greeting_system.gd', type: 'Script' },
    { id: 36, path: 'res://scripts/characters/npc_simulation_lod.gd', type: 'Script' },
    { id: 37, path: 'res://scripts/characters/npc_activity_label_system.gd', type: 'Script' },
    { id: 38, path: 'res://scripts/characters/ambient_conversation_system.gd', type: 'Script' },
    { id: 39, path: 'res://scripts/systems/reputation_manager.gd', type: 'Script' },
    { id: 40, path: 'res://scripts/systems/exploration_discovery_system.gd', type: 'Script' },
    { id: 41, path: 'res://scripts/systems/quest_completion_manager.gd', type: 'Script' },
    { id: 42, path: 'res://scripts/ui/action_quick_bar.gd', type: 'Script' },
  ];

  const showMinimap = ir.ui?.showMinimap ?? false;
  if (showMinimap) {
    extResources.push({ id: 18, path: 'res://scripts/ui/minimap.gd', type: 'Script' });
  }

  // Sub-resources: CapsuleMesh, CapsuleShape3D, Environment = 3
  const subResourceCount = 3;
  let tscn = `[gd_scene load_steps=${extResources.length + subResourceCount} format=3]\n\n`;

  // External resources
  for (const res of extResources) {
    tscn += `[ext_resource type="${res.type}" path="${res.path}" id="${res.id}"]\n`;
  }

  // Sub-resources (capsule mesh for player, collision shape, environment)
  tscn += `\n[sub_resource type="CapsuleMesh" id="sub_1"]\n`;
  tscn += `\n[sub_resource type="CapsuleShape3D" id="sub_2"]\n`;
  tscn += `\n[sub_resource type="Environment" id="sub_3"]\n`;
  tscn += `background_mode = 1\n`;
  tscn += `background_color = Color(${theme.skyColor.r}, ${theme.skyColor.g}, ${theme.skyColor.b}, 1)\n`;
  tscn += `ambient_light_color = Color(${theme.skyColor.r}, ${theme.skyColor.g}, ${theme.skyColor.b}, 1)\n`;
  tscn += `ambient_light_energy = 0.5\n`;

  // Root node
  tscn += `\n[node name="Main" type="Node3D"]\n`;

  // WorldEnvironment
  tscn += `\n[node name="WorldEnvironment" type="WorldEnvironment" parent="."]\n`;
  tscn += `environment = SubResource("sub_3")\n`;

  // DirectionalLight3D
  tscn += `\n[node name="DirectionalLight3D" type="DirectionalLight3D" parent="."]\n`;
  tscn += `transform = Transform3D(1, 0, 0, 0, 0.866, 0.5, 0, -0.5, 0.866, 0, 20, 0)\n`;
  tscn += `shadow_enabled = true\n`;

  // Player (CharacterBody3D)
  tscn += `\n[node name="Player" type="CharacterBody3D" parent="." groups=["player"]]\n`;
  tscn += `transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, ${sp.x}, ${sp.y + 1}, ${sp.z})\n`;
  tscn += `script = ExtResource("2")\n`;

  tscn += `\n[node name="MeshInstance3D" type="MeshInstance3D" parent="Player"]\n`;
  tscn += `mesh = SubResource("sub_1")\n`;

  tscn += `\n[node name="CollisionShape3D" type="CollisionShape3D" parent="Player"]\n`;
  tscn += `shape = SubResource("sub_2")\n`;

  // Camera pivot
  tscn += `\n[node name="CameraPivot" type="Node3D" parent="Player"]\n`;
  tscn += `transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1.5, 0)\n`;

  tscn += `\n[node name="Camera3D" type="Camera3D" parent="Player/CameraPivot"]\n`;
  tscn += `transform = Transform3D(1, 0, 0, 0, 0.95, 0.3, 0, -0.3, 0.95, 0, 2, 5)\n`;

  // World generators
  tscn += `\n[node name="WorldScaleManager" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("3")\n`;

  tscn += `\n[node name="TerrainGenerator" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("10")\n`;

  tscn += `\n[node name="BuildingGenerator" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("4")\n`;

  tscn += `\n[node name="RoadGenerator" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("5")\n`;

  tscn += `\n[node name="NatureGenerator" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("6")\n`;

  tscn += `\n[node name="WaterGenerator" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("9")\n`;

  // Terrain foundation renderer (before buildings)
  tscn += `\n[node name="TerrainFoundationRenderer" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("23")\n`;

  // Settlement scene manager
  tscn += `\n[node name="SettlementSceneManager" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("24")\n`;

  // Chunk manager
  tscn += `\n[node name="ChunkManager" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("25")\n`;

  // Town square generator
  tscn += `\n[node name="TownSquareGenerator" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("26")\n`;

  // Building placement system
  tscn += `\n[node name="BuildingPlacementSystem" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("27")\n`;

  // Building sign manager
  tscn += `\n[node name="BuildingSignManager" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("28")\n`;

  // Building collision system
  tscn += `\n[node name="BuildingCollisionSystem" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("29")\n`;

  // Interior scene manager
  tscn += `\n[node name="InteriorSceneManager" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("30")\n`;

  // Outdoor furniture generator
  tscn += `\n[node name="OutdoorFurnitureGenerator" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("31")\n`;

  // Container spawn system
  tscn += `\n[node name="ContainerSpawnSystem" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("32")\n`;

  // Exterior item manager
  tscn += `\n[node name="ExteriorItemManager" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("33")\n`;

  // NPC spawner
  tscn += `\n[node name="NPCSpawner" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("7")\n`;

  // Day/night cycle
  tscn += `\n[node name="DayNightCycle" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("19")\n`;

  // Item spawner
  tscn += `\n[node name="ItemSpawner" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("20")\n`;

  // Weather system
  tscn += `\n[node name="WeatherSystem" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("21")\n`;

  // Animal system
  tscn += `\n[node name="AnimalSystem" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("22")\n`;

  // Parity part 2 — character and system nodes
  tscn += `\n[node name="CameraManager" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("34")\n`;

  tscn += `\n[node name="NPCGreetingSystem" type="Node" parent="."]\n`;
  tscn += `script = ExtResource("35")\n`;

  tscn += `\n[node name="NPCSimulationLOD" type="Node" parent="."]\n`;
  tscn += `script = ExtResource("36")\n`;

  tscn += `\n[node name="NPCActivityLabelSystem" type="Node" parent="."]\n`;
  tscn += `script = ExtResource("37")\n`;

  tscn += `\n[node name="AmbientConversationSystem" type="Node" parent="."]\n`;
  tscn += `script = ExtResource("38")\n`;

  tscn += `\n[node name="ReputationManager" type="Node" parent="."]\n`;
  tscn += `script = ExtResource("39")\n`;

  tscn += `\n[node name="ExplorationDiscoverySystem" type="Node" parent="."]\n`;
  tscn += `script = ExtResource("40")\n`;

  tscn += `\n[node name="QuestCompletionManager" type="Node" parent="."]\n`;
  tscn += `script = ExtResource("41")\n`;

  // ─── UI Layer ───────────────────────────────

  // HUD (always-visible overlay)
  tscn += `\n[node name="HUD" type="CanvasLayer" parent="."]\n`;
  tscn += `script = ExtResource("8")\n`;

  // Quest tracker (child of HUD, always visible)
  tscn += `\n[node name="QuestTracker" type="Control" parent="HUD"]\n`;
  tscn += `anchors_preset = 1\n`;
  tscn += `anchor_left = 1.0\n`;
  tscn += `anchor_right = 1.0\n`;
  tscn += `offset_left = -300.0\n`;
  tscn += `offset_bottom = 200.0\n`;
  tscn += `grow_horizontal = 0\n`;
  tscn += `script = ExtResource("16")\n`;

  // Minimap (conditional, child of HUD)
  if (showMinimap) {
    tscn += `\n[node name="Minimap" type="Control" parent="HUD"]\n`;
    tscn += `anchors_preset = 15\n`;
    tscn += `anchor_right = 1.0\n`;
    tscn += `anchor_bottom = 1.0\n`;
    tscn += `grow_horizontal = 2\n`;
    tscn += `grow_vertical = 2\n`;
    tscn += `script = ExtResource("18")\n`;
  }

  // World map (full-screen overlay, toggled with M key, pauses game)
  tscn += `\n[node name="WorldMap" type="CanvasLayer" parent="."]\n`;
  tscn += `layer = 10\n`;
  tscn += `process_mode = 3\n`;
  tscn += `visible = false\n`;
  tscn += `script = ExtResource("11")\n`;

  // Inventory UI (full-screen panel, toggled with Tab key, hidden by default)
  tscn += `\n[node name="InventoryUI" type="CanvasLayer" parent="."]\n`;
  tscn += `layer = 10\n`;
  tscn += `process_mode = 3\n`;
  tscn += `visible = false\n`;

  tscn += `\n[node name="Panel" type="PanelContainer" parent="InventoryUI"]\n`;
  tscn += `anchors_preset = 15\n`;
  tscn += `anchor_right = 1.0\n`;
  tscn += `anchor_bottom = 1.0\n`;
  tscn += `grow_horizontal = 2\n`;
  tscn += `grow_vertical = 2\n`;
  tscn += `script = ExtResource("12")\n`;

  // Quest journal (full-screen overlay, toggled with J key, hidden by default)
  tscn += `\n[node name="QuestJournal" type="CanvasLayer" parent="."]\n`;
  tscn += `layer = 10\n`;
  tscn += `process_mode = 3\n`;
  tscn += `visible = false\n`;
  tscn += `script = ExtResource("13")\n`;

  // Game menu (Esc overlay, hidden by default)
  tscn += `\n[node name="GameMenu" type="CanvasLayer" parent="."]\n`;
  tscn += `layer = 20\n`;
  tscn += `process_mode = 3\n`;
  tscn += `visible = false\n`;
  tscn += `script = ExtResource("14")\n`;

  tscn += `\n[node name="MenuPanel" type="PanelContainer" parent="GameMenu"]\n`;
  tscn += `anchors_preset = 8\n`;
  tscn += `anchor_left = 0.5\n`;
  tscn += `anchor_top = 0.5\n`;
  tscn += `anchor_right = 0.5\n`;
  tscn += `anchor_bottom = 0.5\n`;
  tscn += `offset_left = -200.0\n`;
  tscn += `offset_top = -150.0\n`;
  tscn += `offset_right = 200.0\n`;
  tscn += `offset_bottom = 150.0\n`;
  tscn += `visible = false\n`;

  tscn += `\n[node name="VBoxContainer" type="VBoxContainer" parent="GameMenu/MenuPanel"]\n`;
  tscn += `layout_mode = 2\n`;
  tscn += `theme_override_constants/separation = 12\n`;

  tscn += `\n[node name="ResumeButton" type="Button" parent="GameMenu/MenuPanel/VBoxContainer"]\n`;
  tscn += `layout_mode = 2\n`;
  tscn += `text = "Resume"\n`;

  tscn += `\n[node name="SettingsButton" type="Button" parent="GameMenu/MenuPanel/VBoxContainer"]\n`;
  tscn += `layout_mode = 2\n`;
  tscn += `text = "Settings"\n`;

  tscn += `\n[node name="QuitButton" type="Button" parent="GameMenu/MenuPanel/VBoxContainer"]\n`;
  tscn += `layout_mode = 2\n`;
  tscn += `text = "Quit to Menu"\n`;

  // Dialogue panel (bottom-of-screen dialogue, hidden by default)
  tscn += `\n[node name="DialoguePanel" type="CanvasLayer" parent="."]\n`;
  tscn += `layer = 15\n`;
  tscn += `process_mode = 3\n`;
  tscn += `visible = false\n`;
  tscn += `script = ExtResource("15")\n`;

  // Chat panel (NPC chat, hidden by default)
  tscn += `\n[node name="ChatPanel" type="CanvasLayer" parent="."]\n`;
  tscn += `layer = 15\n`;
  tscn += `process_mode = 3\n`;
  tscn += `visible = false\n`;

  tscn += `\n[node name="Panel" type="PanelContainer" parent="ChatPanel"]\n`;
  tscn += `anchors_preset = 7\n`;
  tscn += `anchor_left = 0.5\n`;
  tscn += `anchor_top = 1.0\n`;
  tscn += `anchor_right = 0.5\n`;
  tscn += `anchor_bottom = 1.0\n`;
  tscn += `offset_left = -300.0\n`;
  tscn += `offset_top = -250.0\n`;
  tscn += `offset_right = 300.0\n`;
  tscn += `grow_horizontal = 2\n`;
  tscn += `grow_vertical = 0\n`;
  tscn += `script = ExtResource("17")\n`;

  // Action quick bar (HUD hotbar)
  tscn += `\n[node name="ActionQuickBar" type="CanvasLayer" parent="."]\n`;
  tscn += `layer = 3\n`;
  tscn += `script = ExtResource("42")\n`;

  return tscn;
}

// ─────────────────────────────────────────────
// Main menu .tscn generation
// ─────────────────────────────────────────────

function generateMainMenuTscn(ir: WorldIR): string {
  const title = ir.ui?.menuConfig?.mainMenu?.title || ir.meta.worldName;
  const skyColor = ir.theme.visualTheme.skyColor;

  const extResources = [
    { id: 1, path: 'res://scripts/ui/main_menu.gd', type: 'Script' },
  ];

  // Sub-resources: font size for title + button panel stylebox
  const subResourceCount = 2;
  const loadSteps = extResources.length + subResourceCount;

  let tscn = `[gd_scene load_steps=${loadSteps} format=3]\n\n`;

  for (const res of extResources) {
    tscn += `[ext_resource type="${res.type}" path="${res.path}" id="${res.id}"]\n`;
  }

  // Title font size override
  tscn += `\n[sub_resource type="LabelSettings" id="sub_1"]\n`;
  tscn += `font_size = 64\n`;

  // Panel stylebox for button container background
  tscn += `\n[sub_resource type="StyleBoxFlat" id="sub_2"]\n`;
  tscn += `bg_color = Color(0, 0, 0, 0.4)\n`;
  tscn += `corner_radius_top_left = 8\n`;
  tscn += `corner_radius_top_right = 8\n`;
  tscn += `corner_radius_bottom_right = 8\n`;
  tscn += `corner_radius_bottom_left = 8\n`;
  tscn += `content_margin_left = 40.0\n`;
  tscn += `content_margin_top = 20.0\n`;
  tscn += `content_margin_right = 40.0\n`;
  tscn += `content_margin_bottom = 20.0\n`;

  // Root Control node — full-screen
  tscn += `\n[node name="MainMenu" type="Control"]\n`;
  tscn += `layout_mode = 3\n`;
  tscn += `anchors_preset = 15\n`;
  tscn += `anchor_right = 1.0\n`;
  tscn += `anchor_bottom = 1.0\n`;
  tscn += `grow_horizontal = 2\n`;
  tscn += `grow_vertical = 2\n`;
  tscn += `script = ExtResource("1")\n`;

  // Background ColorRect
  tscn += `\n[node name="Background" type="ColorRect" parent="."]\n`;
  tscn += `layout_mode = 1\n`;
  tscn += `anchors_preset = 15\n`;
  tscn += `anchor_right = 1.0\n`;
  tscn += `anchor_bottom = 1.0\n`;
  tscn += `color = Color(${skyColor.r * 0.3}, ${skyColor.g * 0.3}, ${skyColor.b * 0.3}, 1)\n`;

  // VBoxContainer — centered layout
  tscn += `\n[node name="VBoxContainer" type="VBoxContainer" parent="."]\n`;
  tscn += `layout_mode = 1\n`;
  tscn += `anchors_preset = 8\n`;
  tscn += `anchor_left = 0.5\n`;
  tscn += `anchor_top = 0.5\n`;
  tscn += `anchor_right = 0.5\n`;
  tscn += `anchor_bottom = 0.5\n`;
  tscn += `offset_left = -200.0\n`;
  tscn += `offset_top = -200.0\n`;
  tscn += `offset_right = 200.0\n`;
  tscn += `offset_bottom = 200.0\n`;
  tscn += `grow_horizontal = 2\n`;
  tscn += `grow_vertical = 2\n`;
  tscn += `theme_override_constants/separation = 30\n`;
  tscn += `alignment = 1\n`;

  // Title label
  tscn += `\n[node name="TitleLabel" type="Label" parent="VBoxContainer"]\n`;
  tscn += `layout_mode = 2\n`;
  tscn += `text = "${escTscnString(title)}"\n`;
  tscn += `label_settings = SubResource("sub_1")\n`;
  tscn += `horizontal_alignment = 1\n`;

  // Button container with panel background
  tscn += `\n[node name="ButtonContainer" type="VBoxContainer" parent="VBoxContainer"]\n`;
  tscn += `layout_mode = 2\n`;
  tscn += `theme_override_constants/separation = 12\n`;

  // Buttons
  tscn += `\n[node name="NewGameButton" type="Button" parent="VBoxContainer/ButtonContainer"]\n`;
  tscn += `layout_mode = 2\n`;
  tscn += `custom_minimum_size = Vector2(250, 50)\n`;
  tscn += `text = "New Game"\n`;

  tscn += `\n[node name="SettingsButton" type="Button" parent="VBoxContainer/ButtonContainer"]\n`;
  tscn += `layout_mode = 2\n`;
  tscn += `custom_minimum_size = Vector2(250, 50)\n`;
  tscn += `text = "Settings"\n`;

  tscn += `\n[node name="QuitButton" type="Button" parent="VBoxContainer/ButtonContainer"]\n`;
  tscn += `layout_mode = 2\n`;
  tscn += `custom_minimum_size = Vector2(250, 50)\n`;
  tscn += `text = "Quit"\n`;

  // Settings panel (hidden by default)
  tscn += `\n[node name="SettingsPanel" type="PanelContainer" parent="."]\n`;
  tscn += `visible = false\n`;
  tscn += `layout_mode = 1\n`;
  tscn += `anchors_preset = 8\n`;
  tscn += `anchor_left = 0.5\n`;
  tscn += `anchor_top = 0.5\n`;
  tscn += `anchor_right = 0.5\n`;
  tscn += `anchor_bottom = 0.5\n`;
  tscn += `offset_left = -250.0\n`;
  tscn += `offset_top = -150.0\n`;
  tscn += `offset_right = 250.0\n`;
  tscn += `offset_bottom = 150.0\n`;
  tscn += `theme_override_styles/panel = SubResource("sub_2")\n`;

  tscn += `\n[node name="SettingsLabel" type="Label" parent="SettingsPanel"]\n`;
  tscn += `layout_mode = 2\n`;
  tscn += `text = "Settings (coming soon)"\n`;
  tscn += `horizontal_alignment = 1\n`;
  tscn += `vertical_alignment = 1\n`;

  return tscn;
}

/** Escape string for .tscn text values */
function escTscnString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// ─────────────────────────────────────────────
// Scene descriptor JSON (runtime data)
// ─────────────────────────────────────────────

function generateSceneDescriptor(ir: WorldIR): object {
  const v = ir.theme.visualTheme;

  return {
    version: 1,
    worldName: ir.meta.worldName,
    seed: ir.meta.seed,

    terrain: {
      size: ir.geography.terrainSize,
      heightmap: ir.geography.heightmap ?? null,
      slopeMap: ir.geography.slopeMap ?? null,
      terrainFeatures: ir.geography.terrainFeatures,
      groundColor: [v.groundColor.r, v.groundColor.g, v.groundColor.b],
    },

    lighting: {
      ambientColor: ir.theme.ambientLighting.color,
      ambientIntensity: ir.theme.ambientLighting.intensity,
      directionalDirection: ir.theme.directionalLight.direction,
      directionalIntensity: ir.theme.directionalLight.intensity,
      skyColor: [v.skyColor.r, v.skyColor.g, v.skyColor.b],
      fogEnabled: !!ir.theme.fog,
      fogDensity: ir.theme.fog?.density || 0,
    },

    playerStart: ir.player.startPosition,

    settlements: ir.geography.settlements.map(s => ({
      id: s.id,
      name: s.name,
      type: s.settlementType,
      position: s.position,
      radius: s.radius,
      population: s.population,
    })),

    buildings: ir.entities.buildings.map(b => ({
      id: b.id,
      settlementId: b.settlementId,
      position: b.position,
      rotation: b.rotation,
      role: b.spec.buildingRole,
      floors: b.spec.floors,
      width: b.spec.width,
      depth: b.spec.depth,
      modelAssetKey: b.modelAssetKey,
    })),

    npcs: ir.entities.npcs.map(n => ({
      characterId: n.characterId,
      role: n.role,
      position: n.homePosition,
      patrolRadius: n.patrolRadius,
      disposition: n.disposition,
      settlementId: n.settlementId,
    })),

    roads: ir.entities.roads.map(r => ({
      fromId: r.fromId,
      toId: r.toId,
      width: r.width,
      waypoints: r.waypoints,
    })),

    waterFeatures: ir.geography.waterFeatures.map(w => ({
      id: w.id,
      name: w.name,
      type: w.type,
      subType: w.subType,
      position: w.position,
      waterLevel: w.waterLevel,
      bounds: w.bounds,
      depth: w.depth,
      width: w.width,
      flowDirection: w.flowDirection,
      flowSpeed: w.flowSpeed,
      shorelinePoints: w.shorelinePoints,
      color: w.color,
      transparency: w.transparency,
    })),

    lots: ir.geography.settlements.flatMap(s =>
      s.lots.map(lot => ({
        id: lot.id,
        settlementId: s.id,
        address: lot.address,
        position: lot.position,
        buildingType: lot.buildingType,
        buildingId: lot.buildingId,
      })),
    ),
  };
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateSceneFiles(ir: WorldIR): GeneratedFile[] {
  return [
    {
      path: 'scenes/main_menu.tscn',
      content: generateMainMenuTscn(ir),
    },
    {
      path: 'scenes/main.tscn',
      content: generateMainTscn(ir),
    },
    {
      path: 'data/scene_descriptor.json',
      content: JSON.stringify(generateSceneDescriptor(ir), null, 2),
    },
  ];
}
