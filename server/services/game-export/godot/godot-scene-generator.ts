/**
 * Godot Scene Generator
 *
 * Generates a main .tscn scene file in Godot's text-based scene format.
 * This creates the root scene with DirectionalLight3D, Camera3D,
 * Player, and all world generator nodes wired up.
 *
 * Also generates a JSON scene descriptor for runtime data loading
 * (similar to the Unreal/Unity approach).
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './godot-project-generator';

// ─────────────────────────────────────────────
// .tscn generation
// ─────────────────────────────────────────────

function generateMainTscn(ir: WorldIR): string {
  const theme = ir.theme.visualTheme;
  const sp = ir.player.startPosition;

  // Count external resources (scripts)
  const extResources = [
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
  ];

  const showMinimap = ir.ui?.showMinimap ?? false;
  if (showMinimap) {
    extResources.push({ id: 12, path: 'res://scripts/ui/minimap.gd', type: 'Script' });
  }

  let tscn = `[gd_scene load_steps=${extResources.length + 3} format=3]\n\n`;

  // External resources
  for (const res of extResources) {
    tscn += `[ext_resource type="${res.type}" path="${res.path}" id="${res.id}"]\n`;
  }

  // Sub-resources (capsule mesh for player, collision shape)
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

  // Water generator
  tscn += `\n[node name="WaterGenerator" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("9")\n`;

  // NPC spawner
  tscn += `\n[node name="NPCSpawner" type="Node3D" parent="."]\n`;
  tscn += `script = ExtResource("7")\n`;

  // HUD
  tscn += `\n[node name="HUD" type="CanvasLayer" parent="."]\n`;
  tscn += `script = ExtResource("8")\n`;

  // World map (full-screen overlay, toggled with M key)
  tscn += `\n[node name="WorldMap" type="CanvasLayer" parent="."]\n`;
  tscn += `process_mode = 3\n`;
  tscn += `script = ExtResource("11")\n`;

  // Minimap (conditional)
  if (showMinimap) {
    tscn += `\n[node name="Minimap" type="Control" parent="HUD"]\n`;
    tscn += `anchors_preset = 15\n`;
    tscn += `anchor_right = 1.0\n`;
    tscn += `anchor_bottom = 1.0\n`;
    tscn += `grow_horizontal = 2\n`;
    tscn += `grow_vertical = 2\n`;
    tscn += `script = ExtResource("12")\n`;
  }

  return tscn;
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
      path: 'scenes/main.tscn',
      content: generateMainTscn(ir),
    },
    {
      path: 'data/scene_descriptor.json',
      content: JSON.stringify(generateSceneDescriptor(ir), null, 2),
    },
  ];
}
