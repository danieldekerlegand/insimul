/**
 * Unreal Project Generator
 *
 * Generates the UE5 project scaffolding: .uproject file, Build.cs,
 * Config INI files, and README.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface GeneratedFile {
  path: string;    // Relative path within export directory
  content: string; // File content
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function sanitiseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '');
}

// ─────────────────────────────────────────────
// .uproject
// ─────────────────────────────────────────────

function generateUProject(moduleName: string): string {
  return JSON.stringify({
    FileVersion: 3,
    EngineAssociation: '5.5',
    Category: '',
    Description: '',
    Modules: [
      {
        Name: moduleName,
        Type: 'Runtime',
        LoadingPhase: 'Default',
        AdditionalDependencies: ['Engine', 'CoreUObject'],
      },
    ],
    Plugins: [
      { Name: 'EnhancedInput', Enabled: true },
    ],
  }, null, 2);
}

// ─────────────────────────────────────────────
// Build.cs
// ─────────────────────────────────────────────

function generateBuildCs(moduleName: string): string {
  return `using UnrealBuildTool;

public class ${moduleName} : ModuleRules
{
    public ${moduleName}(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new string[]
        {
            "Core",
            "CoreUObject",
            "Engine",
            "InputCore",
            "EnhancedInput",
            "UMG",
            "Slate",
            "SlateCore",
            "NavigationSystem",
            "AIModule",
            "GameplayTasks",
            "Json",
            "JsonUtilities"
        });

        PrivateDependencyModuleNames.AddRange(new string[]
        {
            "ProceduralMeshComponent"
        });
    }
}
`;
}

// ─────────────────────────────────────────────
// Target files
// ─────────────────────────────────────────────

function generateTargetCs(moduleName: string): string {
  return `using UnrealBuildTool;
using System.Collections.Generic;

public class ${moduleName}Target : TargetRules
{
    public ${moduleName}Target(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_5;
        ExtraModuleNames.Add("${moduleName}");
    }
}
`;
}

function generateEditorTargetCs(moduleName: string): string {
  return `using UnrealBuildTool;
using System.Collections.Generic;

public class ${moduleName}EditorTarget : TargetRules
{
    public ${moduleName}EditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_5;
        ExtraModuleNames.Add("${moduleName}");
    }
}
`;
}

// ─────────────────────────────────────────────
// Module entry point
// ─────────────────────────────────────────────

function generateModuleH(moduleName: string): string {
  return `#pragma once

#include "CoreMinimal.h"

DECLARE_LOG_CATEGORY_EXTERN(Log${moduleName}, Log, All);
`;
}

function generateModuleCpp(moduleName: string): string {
  return `#include "${moduleName}.h"
#include "Modules/ModuleManager.h"

IMPLEMENT_PRIMARY_GAME_MODULE(FDefaultGameModuleImpl, ${moduleName}, "${moduleName}");
DEFINE_LOG_CATEGORY(Log${moduleName});
`;
}

// ─────────────────────────────────────────────
// Config INI files
// ─────────────────────────────────────────────

function generateDefaultGameIni(ir: WorldIR): string {
  return `[/Script/Engine.GameSession]
MaxPlayers=1

[Insimul]
WorldName=${ir.meta.worldName}
WorldType=${ir.meta.worldType}
GenreId=${ir.meta.genreConfig.id}
Seed=${ir.meta.seed}
TerrainSize=${ir.geography.terrainSize}
`;
}

function generateDefaultEngineIni(): string {
  return `[/Script/EngineSettings.GameMapsAndModes]
EditorStartupMap=/Game/Maps/MainWorld
GameDefaultMap=/Game/Maps/MainWorld
GlobalDefaultGameMode=/Script/InsimulExport.InsimulGameMode

[/Script/Engine.RendererSettings]
r.DefaultFeature.AutoExposure.Method=2

[/Script/Engine.Engine]
+ActiveGameNameRedirects=(OldGameName="TP_ThirdPerson",NewGameName="/Script/InsimulExport")

[/Script/AIModule.AISystem]
bEnableDebugDraw=true

[/Script/NavigationSystem.NavigationSystemV1]
bAutoCreateNavigationData=True
bAllowClientSideNavigation=True

[/Script/NavigationSystem.RecastNavMesh]
RuntimeGeneration=Dynamic
`;
}

function generateDefaultInputIni(ir: WorldIR): string {
  const genre = ir.meta.genreConfig;
  return `[/Script/Engine.InputSettings]
+ActionMappings=(ActionName="Jump",bShift=False,bCtrl=False,bAlt=False,bCmd=False,Key=SpaceBar)
+ActionMappings=(ActionName="Interact",bShift=False,bCtrl=False,bAlt=False,bCmd=False,Key=E)
+ActionMappings=(ActionName="Inventory",bShift=False,bCtrl=False,bAlt=False,bCmd=False,Key=I)
+ActionMappings=(ActionName="QuestLog",bShift=False,bCtrl=False,bAlt=False,bCmd=False,Key=J)
+ActionMappings=(ActionName="Map",bShift=False,bCtrl=False,bAlt=False,bCmd=False,Key=M)
+ActionMappings=(ActionName="Pause",bShift=False,bCtrl=False,bAlt=False,bCmd=False,Key=Escape)
+ActionMappings=(ActionName="Attack",bShift=False,bCtrl=False,bAlt=False,bCmd=False,Key=LeftMouseButton)
+ActionMappings=(ActionName="Block",bShift=False,bCtrl=False,bAlt=False,bCmd=False,Key=RightMouseButton)
+ActionMappings=(ActionName="Sprint",bShift=True,bCtrl=False,bAlt=False,bCmd=False,Key=LeftShift)
+AxisMappings=(AxisName="MoveForward",Scale=1.000000,Key=W)
+AxisMappings=(AxisName="MoveForward",Scale=-1.000000,Key=S)
+AxisMappings=(AxisName="MoveRight",Scale=1.000000,Key=D)
+AxisMappings=(AxisName="MoveRight",Scale=-1.000000,Key=A)
+AxisMappings=(AxisName="LookUp",Scale=-1.000000,Key=MouseY)
+AxisMappings=(AxisName="Turn",Scale=1.000000,Key=MouseX)

[/Script/EnhancedInput.EnhancedInputDeveloperSettings]
bEnableWorldSubsystem=True
`;
}

// ─────────────────────────────────────────────
// README
// ─────────────────────────────────────────────

function generateReadme(ir: WorldIR, moduleName: string): string {
  const g = ir.meta.genreConfig;
  return `# ${ir.meta.worldName} — Unreal Engine Export

Generated by Insimul v${ir.meta.insimulVersion} on ${ir.meta.exportTimestamp}

## Quick Start

### Automated Setup (Recommended)

**Mac/Linux:**
\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

**Windows:**
\`\`\`cmd
setup.bat
\`\`\`

This will:
1. Build all C++ modules
2. Generate the MainWorld.umap level file
3. Prepare the project for opening in Unreal Editor

Then:
- Open \`${moduleName}.uproject\` in Unreal Editor
- Open \`Content/Maps/MainWorld\`
- Press Play to test

### Manual Setup

1. **Requirements**: Unreal Engine 5.4+ (source or launcher build)
2. Build C++ modules: \`/path/to/UE5/Engine/Build/BatchFiles/RunUBT.sh ${moduleName}Editor Mac Development -project=$(pwd)/${moduleName}.uproject\`
3. Generate map: \`/path/to/UE5/Engine/Binaries/Mac/UnrealEditor-Cmd $(pwd)/${moduleName}.uproject -run=CreateLevel -unattended -nosplash -nopause\`
4. Open \`${moduleName}.uproject\` in Unreal Editor
5. Open \`Content/Maps/MainWorld\`
6. Press Play to test

## World Info

| Property | Value |
|---|---|
| World Name | ${ir.meta.worldName} |
| World Type | ${ir.meta.worldType || 'default'} |
| Genre | ${g.name} (${g.id}) |
| Terrain Size | ${ir.geography.terrainSize}×${ir.geography.terrainSize} |
| Countries | ${ir.geography.countries.length} |
| States | ${ir.geography.states.length} |
| Settlements | ${ir.geography.settlements.length} |
| Characters | ${ir.entities.characters.length} |
| NPCs | ${ir.entities.npcs.length} |
| Buildings | ${ir.entities.buildings.length} |
| Roads | ${ir.entities.roads.length} |
| Rules | ${ir.systems.rules.length} |
| Actions | ${ir.systems.actions.length} |
| Quests | ${ir.systems.quests.length} |

## Project Structure

\`\`\`
Source/${moduleName}/
├── Core/              Game mode, player controller, game instance
├── Characters/        Player + NPC characters
├── Systems/           Action, combat, quest, inventory, crafting, etc.
├── World/             Procedural generators (buildings, nature, roads, dungeons)
└── Data/              UStruct definitions for DataTable import
\`\`\`

\`\`\`
Content/
├── Maps/              Main world map
├── Data/              DataTable JSON files (characters, actions, rules, quests, etc.)
├── Assets/            Models, textures, materials, audio
└── UI/                Widget blueprints (create manually or via editor)
\`\`\`

## Data Loading

The game loads IR data from \`Content/Data/WorldIR.json\` at runtime via
\`UInsimulGameInstance::LoadWorldData()\`. DataTables in \`Content/Data/\`
can also be imported into the editor for use in Blueprints.

## Notes

- Binary assets (.uasset, .umap) must be created in the Unreal Editor
- The C++ source provides all system logic; you can extend via Blueprints
- NPC AI uses Behavior Trees — create them in the editor and assign to NPCCharacter
- UI Widgets are referenced by class path but must be created as UMG Blueprints
`;
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateProjectFiles(ir: WorldIR): GeneratedFile[] {
  const worldSafe = sanitiseName(ir.meta.worldName) || 'InsimulWorld';
  const moduleName = `InsimulExport`;
  const projectName = `InsimulExport_${worldSafe}`;

  return [
    { path: `${moduleName}.uproject`, content: generateUProject(moduleName) },
    { path: `Source/${moduleName}.Target.cs`, content: generateTargetCs(moduleName) },
    { path: `Source/${moduleName}Editor.Target.cs`, content: generateEditorTargetCs(moduleName) },
    { path: `Source/${moduleName}/${moduleName}.Build.cs`, content: generateBuildCs(moduleName) },
    { path: `Source/${moduleName}/${moduleName}.h`, content: generateModuleH(moduleName) },
    { path: `Source/${moduleName}/${moduleName}.cpp`, content: generateModuleCpp(moduleName) },
    { path: 'Config/DefaultEngine.ini', content: generateDefaultEngineIni() },
    { path: 'Config/DefaultGame.ini', content: generateDefaultGameIni(ir) },
    { path: 'Config/DefaultInput.ini', content: generateDefaultInputIni(ir) },
    { path: 'README.md', content: generateReadme(ir, moduleName) },
    { path: 'setup.sh', content: generateSetupScriptMac(moduleName, projectName) },
    { path: 'setup.bat', content: generateSetupScriptWindows(moduleName, projectName) },
  ];
}

function generateSetupScriptMac(moduleName: string, projectName: string): string {
  return `#!/bin/bash
set -e

echo "========================================"
echo "Insimul UE5 Project Setup"
echo "========================================"

# Detect UE5 installation
UE_ENGINE_DIR="${'$'}{UE_ENGINE_DIR:-/Users/Shared/Epic Games/UE_5.5}"
if [ ! -d "$UE_ENGINE_DIR" ]; then
    UE_ENGINE_DIR="/Users/Shared/Epic Games/UE_5.4"
fi

if [ ! -d "$UE_ENGINE_DIR" ]; then
    echo "ERROR: Could not find UE5 installation"
    echo "Set UE_ENGINE_DIR environment variable to your UE5 install path"
    exit 1
fi

echo "Using UE5: $UE_ENGINE_DIR"
PROJECT_PATH="$(pwd)/${moduleName}.uproject"

# Step 1: Build C++ modules
echo ""
echo "Step 1/2: Building C++ modules..."
"$UE_ENGINE_DIR/Engine/Build/BatchFiles/RunUBT.sh" ${moduleName}Editor Mac Development "-project=$PROJECT_PATH"

# Step 2: Run CreateLevel commandlet to generate MainWorld.umap
echo ""
echo "Step 2/2: Generating MainWorld.umap..."
"$UE_ENGINE_DIR/Engine/Binaries/Mac/UnrealEditor-Cmd" "$PROJECT_PATH" -run=CreateLevel -unattended -nosplash -nopause

echo ""
echo "========================================"
echo "Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Open ${moduleName}.uproject in Unreal Editor"
echo "  2. Open Content/Maps/MainWorld"
echo "  3. Press Play to test the game"
echo ""
`;
}

function generateSetupScriptWindows(moduleName: string, projectName: string): string {
  return `@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Insimul UE5 Project Setup
echo ========================================

:: Detect UE5 installation
if not defined UE_ENGINE_DIR (
    if exist "C:\\Program Files\\Epic Games\\UE_5.5" (
        set "UE_ENGINE_DIR=C:\\Program Files\\Epic Games\\UE_5.5"
    ) else if exist "C:\\Program Files\\Epic Games\\UE_5.4" (
        set "UE_ENGINE_DIR=C:\\Program Files\\Epic Games\\UE_5.4"
    ) else (
        echo ERROR: Could not find UE5 installation
        echo Set UE_ENGINE_DIR environment variable to your UE5 install path
        exit /b 1
    )
)

echo Using UE5: %UE_ENGINE_DIR%
set "PROJECT_PATH=%CD%\\${moduleName}.uproject"

:: Step 1: Build C++ modules
echo.
echo Step 1/2: Building C++ modules...
"%UE_ENGINE_DIR%\\Engine\\Build\\BatchFiles\\RunUBT.bat" ${moduleName}Editor Win64 Development "-project=%PROJECT_PATH%"
if errorlevel 1 exit /b 1

:: Step 2: Run CreateLevel commandlet
echo.
echo Step 2/2: Generating MainWorld.umap...
"%UE_ENGINE_DIR%\\Engine\\Binaries\\Win64\\UnrealEditor-Cmd.exe" "%PROJECT_PATH%" -run=CreateLevel -unattended -nosplash -nopause
if errorlevel 1 exit /b 1

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo   1. Open ${moduleName}.uproject in Unreal Editor
echo   2. Open Content/Maps/MainWorld
echo   3. Press Play to test the game
echo.
pause
`;
}
