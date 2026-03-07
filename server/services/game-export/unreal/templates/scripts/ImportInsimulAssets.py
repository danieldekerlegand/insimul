"""
ImportInsimulAssets.py — Unreal Editor Python Script

Bulk-imports all GLB/GLTF files bundled in Content/assets/ into UE5 as Static Meshes.

Usage:
  File > Execute Python Script (browse to this file)
  — or —
  from the Output Log Python console: exec(open("Scripts/ImportInsimulAssets.py").read())

After import:
  1. For each building mesh, right-click > Create Blueprint Class, add a StaticMeshComponent.
  2. Open BP_InsimulGameMode > Class Defaults > Insimul Assets.
  3. Add entries to BuildingBlueprintMap: key = ModelAssetKey from DT_Buildings.json,
     value = the Blueprint class you just created.
  4. Optionally create a Blueprint subclass of ANPCCharacter with VisualMesh assigned,
     and set it as InsimulGameMode.NPCBlueprintClass.
"""

import os
import unreal

def import_insimul_assets():
    content_dir = unreal.Paths.project_content_dir()
    assets_dir = os.path.join(content_dir, "assets")

    if not os.path.exists(assets_dir):
        unreal.log_warning(f"[Insimul] Assets directory not found: {assets_dir}")
        unreal.log_warning("[Insimul] Make sure you opened the exported project folder (not a subfolder).")
        return

    tasks = []
    for root, dirs, files in os.walk(assets_dir):
        for filename in files:
            if not (filename.lower().endswith(".glb") or filename.lower().endswith(".gltf")):
                continue
            filepath = os.path.join(root, filename)
            rel_root = os.path.relpath(root, content_dir).replace("\\", "/")
            dest_path = f"/Game/{rel_root}"

            task = unreal.AssetImportTask()
            task.filename = filepath
            task.destination_path = dest_path
            task.automated = True
            task.replace_existing = False
            task.save = True
            tasks.append(task)
            unreal.log(f"[Insimul] Queued: {filename} -> {dest_path}")

    if not tasks:
        unreal.log_warning("[Insimul] No GLB/GLTF files found under Content/assets/")
        return

    asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
    asset_tools.import_asset_tasks(tasks)
    unreal.log(f"[Insimul] Done — {len(tasks)} asset(s) imported.")
    unreal.log("[Insimul] See Content/Data/ASSET_SETUP.md for next steps.")

import_insimul_assets()
