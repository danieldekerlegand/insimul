# Insimul → Native Game Engine Export Roadmap

> **Goal:** Allow users to export their Insimul worlds as fully-functional native game projects for Unreal Engine, Unity, and Godot — while keeping the Babylon.js browser game as the canonical source of truth.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Phase 0 — Codify the Babylon.js Game Abstraction Layer](#2-phase-0--codify-the-babylonjs-game-abstraction-layer)
3. [Phase 1 — Intermediate Representation (IR)](#3-phase-1--intermediate-representation-ir)
4. [Phase 2 — Asset Pipeline](#4-phase-2--asset-pipeline)
5. [Phase 3 — Unreal Engine Export](#5-phase-3--unreal-engine-export)
6. [Phase 4 — Unity Export](#6-phase-4--unity-export)
7. [Phase 5 — Godot Export](#7-phase-5--godot-export)
8. [Phase 6 — Live Sync & Re-Export](#8-phase-6--live-sync--re-export)
9. [Cross-Cutting Concerns](#9-cross-cutting-concerns)
10. [Appendix — Babylon.js Component Inventory](#10-appendix--babylonjs-component-inventory)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Insimul Web Application                  │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │ World Data   │   │ Asset        │   │ Babylon.js      │  │
│  │ (MongoDB)    │──▶│ Collections  │──▶│ 3D Game         │  │
│  │              │   │              │   │ (Source of Truth)│  │
│  └──────┬───────┘   └──────┬───────┘   └────────┬────────┘  │
│         │                  │                    │           │
│         ▼                  ▼                    ▼           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          Intermediate Representation (IR)            │    │
│  │   Engine-agnostic JSON describing the full game      │    │
│  └───────┬──────────────┬──────────────┬───────────┘    │
│          │              │              │                │
│          ▼              ▼              ▼                │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │  Unreal    │ │  Unity     │ │  Godot     │          │
│  │  Exporter  │ │  Exporter  │ │  Exporter  │          │
│  └────────────┘ └────────────┘ └────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

- **Babylon.js is canonical.** Every game mechanic, procedural algorithm, and data structure is defined first in the Babylon.js game. Native exports reproduce that behavior.
- **Intermediate Representation (IR).** An engine-agnostic JSON/data format sits between Babylon.js and the native exporters. Each exporter reads the IR and generates engine-specific project files.
- **Asset Collections are per-engine.** The existing `AssetCollection` schema already stores model/texture references. We extend it with per-engine asset overrides so that native exports can use higher-fidelity assets.
- **Incremental re-export.** When the user modifies their world in Insimul, they can re-export; only the delta is regenerated.

---

## 2. Phase 0 — Codify the Babylon.js Game Abstraction Layer

> Before we can export, we need to formalize what the Babylon.js game *is* in engine-agnostic terms.

### 0.1 Define System Contracts (Interfaces)

Extract engine-agnostic interfaces from every game system in `client/src/components/3DGame/`. Each system becomes a contract that native engines must implement.

| Current Babylon.js File | Abstraction to Extract |
|---|---|
| `BabylonGame.ts` | `IGameLifecycle` — init, dispose, game loop, status |
| `CharacterController.ts` | `ICharacterController` — movement, animation, physics |
| `CameraManager.ts` | `ICameraSystem` — modes (1st/3rd person, isometric, etc.) |
| `ProceduralBuildingGenerator.ts` | `IBuildingGenerator` — building specs, styles, placement |
| `ProceduralNatureGenerator.ts` | `INatureGenerator` — biome-driven foliage/terrain |
| `ProceduralDungeonGenerator.ts` | `IDungeonGenerator` — room/corridor/chest placement |
| `RoadGenerator.ts` | `IRoadGenerator` — paths between settlements |
| `WorldScaleManager.ts` | `IWorldScaleManager` — country/state/settlement layout |
| `BuildingInteriorGenerator.ts` | `IInteriorGenerator` — interior room layouts |
| `TextureManager.ts` | `ITextureProvider` — texture loading and application |
| `AudioManager.ts` | `IAudioSystem` — SFX, ambient, music |
| `ActionManager.ts` | `IActionSystem` — action execution, cooldowns, effects |
| `RuleEnforcer.ts` | `IRuleEnforcer` — condition checking, violation tracking |
| `CombatSystem.ts` | `ICombatSystem` — melee/ranged/turn-based/fighting |
| `RangedCombatSystem.ts` | (extends `ICombatSystem`) |
| `FightingCombatSystem.ts` | (extends `ICombatSystem`) |
| `TurnBasedCombatSystem.ts` | (extends `ICombatSystem`) |
| `ResourceSystem.ts` | `IResourceSystem` — resource nodes, gathering |
| `CraftingSystem.ts` | `ICraftingSystem` — recipes, crafting |
| `SurvivalNeedsSystem.ts` | `ISurvivalSystem` — hunger, thirst, stamina |
| `BuildingPlacementSystem.ts` | `IBuildingPlacement` — player-driven construction |
| `BabylonInventory.ts` | `IInventorySystem` — items, stacking, equipment |
| `QuestObjectManager.ts` | `IQuestObjectSystem` — quest item spawning |
| `QuestIndicatorManager.ts` | `IQuestIndicators` — markers, waypoints |
| `QuestWaypointManager.ts` | (extends `IQuestIndicators`) |
| `BabylonMinimap.ts` | `IMinimapSystem` — overhead map display |
| `BabylonChatPanel.ts` | `IChatSystem` — NPC dialogue |
| `BabylonRadialMenu.ts` | `IRadialMenu` — contextual action UI |
| `BabylonRulesPanel.ts` | `IRulesDisplay` — in-game rule reference |
| `BabylonQuestTracker.ts` | `IQuestTracker` — active quest HUD |
| `BabylonGUIManager.ts` | `IHUDSystem` — health bars, status, toasts |
| `GenreUIManager.ts` | `IGenreUI` — genre-specific UI layouts |
| `CombatUI.ts` | `ICombatUI` — combat HUD elements |
| `HealthBar.ts` | `IHealthDisplay` — per-entity health bar |
| `RunManager.ts` | `IRunManager` — simulation tick management |
| `NPCTalkingIndicator.ts` | `INPCIndicators` — speech bubbles, interaction cues |
| `NPCAmbientConversationManager.ts` | `IAmbientConversations` — NPC-NPC dialogue |
| `BuildingInfoDisplay.ts` | `IBuildingInfoUI` — building tooltip/panel |
| `GameMenuSystem.ts` | `IGameMenu` — pause, settings, save/load |
| `LanguageProgressTracker.ts` | `ILanguageProgress` — conlang learning UI |
| `VRManager.ts` + VR* | `IVRSystem` — VR mode (Unreal/Unity only) |

### 0.2 Create Shared Type Definitions

Move these to `shared/game-engine/types.ts` (engine-agnostic):

- [ ] `BuildingSpec`, `BuildingStyle` → from `ProceduralBuildingGenerator.ts`
- [ ] `BiomeStyle`, `NatureConfig` → from `ProceduralNatureGenerator.ts`
- [ ] `ScaledSettlement`, `ScaledCountry`, `ScaledState` → from `WorldScaleManager.ts`
- [ ] `NPCInstance`, `NPCState`, `NPCRole`, `NPCDisplayInfo` → from `BabylonGame.ts`
- [ ] `WorldVisualTheme` → from `BabylonGame.ts`
- [ ] `Action`, `ActionState`, `ActionContext`, `ActionResult`, `ActionEffect` → from `types/actions.ts`
- [ ] `Rule`, `RuleCondition`, `RuleEffect`, `RuleViolation`, `GameContext` → from `RuleEnforcer.ts`
- [ ] `GenreConfig`, `GenreFeatures` → already in `shared/game-genres/types.ts` ✓
- [ ] `CameraMode`, `CombatStyle`, `MovementStyle` → already in `shared/game-genres/types.ts` ✓
- [ ] `InteriorLayout` → from `BuildingInteriorGenerator.ts`
- [ ] `InventoryItem` → from `BabylonInventory.ts`
- [ ] `DamageResult`, `CombatStyle` (combat) → from `CombatSystem.ts`

### 0.3 Formalize the Procedural Generation Pipeline

Document and parameterize every procedural algorithm so that native engines can reproduce identical output given the same seed:

- [ ] **Settlement layout algorithm** — how buildings are placed around a center point
- [ ] **Road network algorithm** — how roads connect settlements
- [ ] **Nature placement algorithm** — tree/rock/foliage distribution per biome
- [ ] **Dungeon generation algorithm** — room graph, corridor routing, loot placement
- [ ] **Building generation algorithm** — floor count, dimensions, window/chimney/balcony
- [ ] **Interior generation algorithm** — room subdivision, furniture placement
- [ ] **NPC placement algorithm** — spawn positions, home positions, patrol routes
- [ ] **Terrain generation** — heightmap generation and terrain features

---

## 3. Phase 1 — Intermediate Representation (IR)

> A single JSON document (or set of documents) that fully describes an exported game.

### 1.1 World IR Schema

```typescript
interface WorldIR {
  // Metadata
  meta: {
    insimulVersion: string;
    worldId: string;
    worldName: string;
    worldDescription: string;
    worldType: string;         // medieval-fantasy, cyberpunk, etc.
    genreConfig: GenreConfig;  // from shared/game-genres
    exportTimestamp: string;
    exportVersion: number;     // for incremental re-export
  };

  // Geography
  geography: {
    terrainSize: number;
    heightmap?: number[][];          // optional heightmap data
    countries: CountryIR[];
    states: StateIR[];
    settlements: SettlementIR[];
  };

  // Entities
  entities: {
    characters: CharacterIR[];
    npcs: NPCIR[];                   // subset of characters used as NPCs
    buildings: BuildingIR[];
    roads: RoadIR[];
    natureObjects: NatureObjectIR[];
    dungeons: DungeonIR[];
    questObjects: QuestObjectIR[];
  };

  // Game Systems
  systems: {
    rules: RuleIR[];
    baseRules: RuleIR[];
    actions: ActionIR[];
    baseActions: ActionIR[];
    quests: QuestIR[];
    truths: TruthIR[];
    grammars: GrammarIR[];
    languages: LanguageIR[];
  };

  // Visual Theme
  theme: {
    visualTheme: WorldVisualTheme;
    skybox?: string;
    ambientLighting: { color: [number, number, number]; intensity: number };
    directionalLight: { direction: [number, number, number]; intensity: number };
    fog?: { mode: string; density: number; color: [number, number, number] };
  };

  // Assets
  assets: {
    collectionId: string;
    textures: AssetReference[];
    models: AssetReference[];
    audio: AssetReference[];
    animations: AnimationReference[];
  };

  // Player Configuration
  player: {
    startPosition: [number, number, number];
    modelAsset: string;
    initialEnergy: number;
    initialGold: number;
    initialHealth: number;
    speed: number;
    jumpHeight: number;
    gravity: number;
  };

  // UI Configuration
  ui: {
    showMinimap: boolean;
    showHealthBar: boolean;
    showStaminaBar: boolean;
    showAmmoCounter: boolean;
    showCompass: boolean;
    genreLayout: string;       // action_rpg, fps, rts, etc.
  };
}
```

### 1.2 Sub-IR Types

- [ ] `SettlementIR` — position, radius, buildings, roads, population, type
- [ ] `BuildingIR` — position, rotation, spec (type, floors, dimensions, style), occupants, interior layout
- [ ] `CharacterIR` — all character fields + genealogy + social attributes + relationships
- [ ] `NPCIR` — character reference + role, home position, patrol, disposition, quest associations
- [ ] `RoadIR` — waypoints, width, material
- [ ] `NatureObjectIR` — type (tree/rock/bush), position, scale, biome
- [ ] `DungeonIR` — rooms, corridors, spawns, loot tables
- [ ] `RuleIR` — conditions, effects, priority, category (engine-agnostic representation)
- [ ] `ActionIR` — all action fields + UI config
- [ ] `QuestIR` — objectives, rewards, giver NPC, stages
- [ ] `TruthIR` — truth system entries
- [ ] `GrammarIR` — grammar rules for procedural text generation
- [ ] `LanguageIR` — conlang definitions and vocabulary
- [ ] `AssetReference` — { id, role, babylonPath, unrealPath?, unityPath?, godotPath? }
- [ ] `AnimationReference` — { name, type, assetRef, frameRange }

### 1.3 IR Generator (Server-Side)

Create `server/services/game-export/ir-generator.ts`:

- [ ] `generateWorldIR(worldId: string): Promise<WorldIR>` — fetches all data and builds the IR
- [ ] Runs the same procedural algorithms (settlement layout, road network, nature placement) deterministically to produce the exact positions used by Babylon.js
- [ ] Serializes to JSON (portable) or MessagePack (efficient)

### 1.4 API Endpoint

- [ ] `POST /api/worlds/:worldId/export/ir` — generate and return the IR
- [ ] `POST /api/worlds/:worldId/export/:engine` — generate engine-specific project (unreal/unity/godot)
- [ ] `GET /api/worlds/:worldId/export/status/:jobId` — poll export job status

---

## 4. Phase 2 — Asset Pipeline

### 2.1 Extend Asset Collection Schema

Add per-engine asset overrides to the `assetCollections` table:

```typescript
// New fields on AssetCollection
unrealAssets: {
  buildingModels: Record<string, string>;  // role → .uasset or .fbx path
  natureModels: Record<string, string>;
  characterModels: Record<string, string>;
  objectModels: Record<string, string>;
  playerModels: Record<string, string>;
  textures: Record<string, string>;        // role → .uasset path
  materials: Record<string, string>;       // Unreal material references
  audio: Record<string, string>;
};

unityAssets: {
  buildingPrefabs: Record<string, string>;  // role → .prefab path
  naturePrefabs: Record<string, string>;
  characterPrefabs: Record<string, string>;
  objectPrefabs: Record<string, string>;
  playerPrefabs: Record<string, string>;
  textures: Record<string, string>;
  materials: Record<string, string>;
  audio: Record<string, string>;
};

godotAssets: {
  buildingScenes: Record<string, string>;  // role → .tscn path
  natureScenes: Record<string, string>;
  characterScenes: Record<string, string>;
  objectScenes: Record<string, string>;
  playerScenes: Record<string, string>;
  textures: Record<string, string>;
  materials: Record<string, string>;
  audio: Record<string, string>;
};
```

### 2.2 Asset Conversion Pipeline

- [ ] **GLTF/GLB → FBX** converter (for Unreal import compatibility)
- [ ] **GLTF/GLB → Unity-ready** (Unity supports GLTF natively via plugin, or convert to FBX)
- [ ] **GLTF/GLB → Godot .glb** (Godot supports GLB natively ✓)
- [ ] **.babylon → GLTF/GLB** converter (for assets only available in .babylon format)
- [ ] **Texture conversion** — ensure PBR textures map correctly across engines
- [ ] **Animation retargeting** — map Babylon.js skeleton animations to engine-specific rigs

### 2.3 Asset Fallback Strategy

```
For each asset role (e.g., "smallResidence"):
  1. Check engine-specific override (unrealAssets.buildingModels.smallResidence)
  2. Fall back to Babylon.js asset (buildingModels.smallResidence)  
  3. Fall back to procedural generation (generate geometry at export time)
```

---

## 5. Phase 3 — Unreal Engine Export (Primary Target)

### 3.1 Project Structure

Generate a complete Unreal Engine 5 project:

```
InsimulExport_<WorldName>/
├── InsimulExport.uproject
├── Config/
│   └── DefaultGame.ini
│   └── DefaultEngine.ini
│   └── DefaultInput.ini
├── Content/
│   ├── Maps/
│   │   └── MainWorld.umap           ← generated level
│   ├── Blueprints/
│   │   ├── BP_InsimulGameMode.uasset
│   │   ├── BP_PlayerCharacter.uasset
│   │   ├── BP_NPCCharacter.uasset
│   │   ├── BP_BuildingBase.uasset
│   │   ├── BP_QuestObject.uasset
│   │   └── Systems/
│   │       ├── BP_ActionSystem.uasset
│   │       ├── BP_CombatSystem.uasset
│   │       ├── BP_QuestSystem.uasset
│   │       ├── BP_RuleEnforcer.uasset
│   │       ├── BP_InventorySystem.uasset
│   │       ├── BP_CraftingSystem.uasset
│   │       ├── BP_DialogueSystem.uasset
│   │       └── BP_SurvivalSystem.uasset
│   ├── Data/
│   │   ├── DT_Characters.uasset     ← DataTable from IR
│   │   ├── DT_Actions.uasset
│   │   ├── DT_Rules.uasset
│   │   ├── DT_Quests.uasset
│   │   ├── DT_Settlements.uasset
│   │   └── DT_Grammars.uasset
│   ├── Assets/
│   │   ├── Models/
│   │   ├── Textures/
│   │   ├── Materials/
│   │   └── Audio/
│   └── UI/
│       ├── WBP_HUD.uasset
│       ├── WBP_Minimap.uasset
│       ├── WBP_Inventory.uasset
│       ├── WBP_QuestTracker.uasset
│       ├── WBP_DialoguePanel.uasset
│       └── WBP_GameMenu.uasset
├── Source/
│   └── InsimulExport/
│       ├── InsimulExport.Build.cs
│       ├── Core/
│       │   ├── InsimulGameMode.h/cpp
│       │   ├── InsimulPlayerController.h/cpp
│       │   └── InsimulGameInstance.h/cpp
│       ├── Characters/
│       │   ├── PlayerCharacter.h/cpp
│       │   └── NPCCharacter.h/cpp
│       ├── Systems/
│       │   ├── ActionSystem.h/cpp
│       │   ├── CombatSystem.h/cpp
│       │   ├── RuleEnforcer.h/cpp
│       │   ├── QuestSystem.h/cpp
│       │   ├── InventorySystem.h/cpp
│       │   ├── CraftingSystem.h/cpp
│       │   ├── ResourceSystem.h/cpp
│       │   ├── SurvivalNeedsSystem.h/cpp
│       │   └── DialogueSystem.h/cpp
│       ├── World/
│       │   ├── ProceduralBuildingGenerator.h/cpp
│       │   ├── ProceduralNatureGenerator.h/cpp
│       │   ├── ProceduralDungeonGenerator.h/cpp
│       │   ├── RoadGenerator.h/cpp
│       │   └── WorldScaleManager.h/cpp
│       └── Data/
│           ├── CharacterData.h
│           ├── ActionData.h
│           ├── RuleData.h
│           └── QuestData.h
└── Plugins/
    └── InsimulRuntime/              ← optional: shared runtime plugin
```

### 3.2 Unreal Export — Component Mapping

#### 3.2.1 Core Game Loop

| Babylon.js | Unreal Equivalent |
|---|---|
| `BabylonGame.init()` | `AInsimulGameMode::InitGame()` |
| `BabylonGame.dispose()` | `AInsimulGameMode::EndPlay()` |
| `scene.onBeforeRenderObservable` | `Tick()` function |
| `Engine` / `Scene` | `UWorld` / `UGameInstance` |

#### 3.2.2 Player & Camera

| Babylon.js | Unreal Equivalent |
|---|---|
| `CharacterController` | `ACharacter` + `UCharacterMovementComponent` |
| `CameraManager` (3rd person) | `USpringArmComponent` + `UCameraComponent` |
| `CameraManager` (1st person) | `UCameraComponent` attached to head socket |
| `CameraManager` (isometric) | Fixed `UCameraComponent` with ortho projection |
| Player mesh/skeleton | `USkeletalMeshComponent` with animation blueprint |
| WASD input | Enhanced Input System (`UInputAction`, `UInputMappingContext`) |

#### 3.2.3 NPCs

| Babylon.js | Unreal Equivalent |
|---|---|
| `NPCInstance` | `ANPCCharacter` (extends `ACharacter`) |
| NPC state machine (idle/fleeing/pursuing/alert) | `UBehaviorTree` + `UBlackboardComponent` |
| NPC patrol/home position | `AAIController` with `MoveTo` tasks |
| NPC dialogue | `UDialogueSubsystem` (custom) |
| NPC talking indicator | `UWidgetComponent` above head |
| Ambient conversations | `UAmbientConversationManager` (subsystem) |

#### 3.2.4 World Generation

| Babylon.js | Unreal Equivalent |
|---|---|
| `ProceduralBuildingGenerator` | `AProceduralBuildingGenerator` spawning `ABuilding` actors |
| `ProceduralNatureGenerator` | `AProceduralNatureGenerator` + `UInstancedStaticMeshComponent` for foliage |
| `ProceduralDungeonGenerator` | `AProceduralDungeonGenerator` spawning room/corridor actors |
| `RoadGenerator` | `ARoadGenerator` using spline meshes (`USplineMeshComponent`) |
| `WorldScaleManager` | `UWorldScaleSubsystem` computing layouts |
| Heightmap terrain | `ALandscapeProxy` or procedural `AVolume` mesh |
| Building interiors | Sub-levels or streaming volumes |

#### 3.2.5 Combat

| Babylon.js | Unreal Equivalent |
|---|---|
| `CombatSystem` (melee) | `UCombatComponent` with `UAnimMontage` attacks + `USphereComponent` hit detection |
| `RangedCombatSystem` | Projectile actors (`AProjectile`) + `UProjectileMovementComponent` |
| `FightingCombatSystem` | Combo state machine + hitbox/hurtbox system |
| `TurnBasedCombatSystem` | `ATurnBasedCombatManager` actor with turn queue |
| `HealthBar` | `UWidgetComponent` with `UProgressBar` |
| `CombatUI` | UMG widget blueprint |

#### 3.2.6 UI

| Babylon.js | Unreal Equivalent |
|---|---|
| `BabylonGUIManager` | `AHUD` class + `UUserWidget` blueprints |
| `BabylonMinimap` | `UMinimapWidget` with render target camera |
| `BabylonInventory` | `UInventoryWidget` + `UInventoryComponent` |
| `BabylonQuestTracker` | `UQuestTrackerWidget` |
| `BabylonChatPanel` | `UDialogueWidget` |
| `BabylonRadialMenu` | `URadialMenuWidget` |
| `BabylonRulesPanel` | `URulesPanelWidget` |
| `GenreUIManager` | Genre-specific widget switching |
| `GameMenuSystem` | `UGameMenuWidget` (pause menu) |

#### 3.2.7 Systems

| Babylon.js | Unreal Equivalent |
|---|---|
| `ActionManager` | `UActionSubsystem` (GameInstance subsystem) |
| `RuleEnforcer` | `URuleEnforcerSubsystem` |
| `ResourceSystem` | `UResourceSubsystem` + resource node actors |
| `CraftingSystem` | `UCraftingSubsystem` |
| `SurvivalNeedsSystem` | `USurvivalComponent` on player |
| `BuildingPlacementSystem` | `UBuildingPlacementComponent` with ghost preview |
| `RunManager` | `USimulationSubsystem` |
| `TextureManager` | Handled at import time (Unreal materials) |
| `AudioManager` | `UAudioComponent` + `USoundCue` / `MetaSounds` |

### 3.3 Unreal Export Checklist

#### Infrastructure
- [ ] Create `server/services/game-export/unreal/` directory
- [ ] `UnrealProjectGenerator.ts` — generates `.uproject`, `Build.cs`, config files
- [ ] `UnrealLevelGenerator.ts` — generates the main level with all actors placed
- [ ] `UnrealDataTableGenerator.ts` — converts IR data → Unreal DataTable CSVs/JSON
- [ ] `UnrealBlueprintGenerator.ts` — generates blueprint JSON for game systems
- [ ] `UnrealCppGenerator.ts` — generates C++ source files for core systems

#### World & Terrain
- [ ] Generate landscape/terrain from heightmap or flat plane
- [ ] Place settlement actors at IR-computed positions
- [ ] Generate roads as spline meshes between settlements
- [ ] Place nature actors (instanced static meshes) per biome config
- [ ] Generate zone boundary volumes

#### Characters
- [ ] Generate player character Blueprint with movement, camera, input
- [ ] Generate NPC character Blueprint with AI controller + behavior tree
- [ ] Place NPC actors at IR home positions
- [ ] Wire up NPC dialogue triggers (overlap volumes)
- [ ] Generate animation Blueprint (idle, walk, run, attack states)

#### Game Systems
- [ ] Port `ActionManager` logic to C++ `UActionSubsystem`
- [ ] Port `RuleEnforcer` logic to C++ `URuleEnforcerSubsystem`
- [ ] Port `CombatSystem` variants to C++ with anim montage hooks
- [ ] Port `QuestSystem` with objective tracking
- [ ] Port `InventorySystem` with item data
- [ ] Port `CraftingSystem` with recipe data
- [ ] Port `ResourceSystem` with resource node actors
- [ ] Port `SurvivalNeedsSystem` (if genre requires it)
- [ ] Port `RunManager` simulation tick logic

#### UI
- [ ] Generate HUD widget blueprint
- [ ] Generate minimap with render-target camera
- [ ] Generate inventory UI
- [ ] Generate quest tracker UI
- [ ] Generate dialogue/chat panel
- [ ] Generate radial action menu
- [ ] Generate combat UI
- [ ] Generate game menu (pause/settings)
- [ ] Genre-specific UI layout switching

#### Data
- [ ] Export characters as DataTable
- [ ] Export actions as DataTable
- [ ] Export rules as DataTable
- [ ] Export quests as DataTable
- [ ] Export settlements as DataTable
- [ ] Export grammars as DataTable (for procedural text)
- [ ] Export languages as DataTable (for conlang features)

#### Assets
- [ ] Convert GLTF/GLB models → FBX for Unreal import
- [ ] Convert textures to Unreal-compatible formats
- [ ] Generate Unreal materials from texture assignments
- [ ] Convert audio files to compatible formats
- [ ] Map asset collection entries to Unreal content paths

#### Packaging
- [ ] Generate `.uproject` file with correct engine version target
- [ ] Generate `DefaultInput.ini` with keybindings
- [ ] Generate `DefaultGame.ini` with game settings
- [ ] Package as downloadable ZIP
- [ ] Include README with setup instructions

---

## 6. Phase 4 — Unity Export

### 4.1 Project Structure

```
InsimulExport_<WorldName>/
├── Assets/
│   ├── Scenes/
│   │   └── MainWorld.unity
│   ├── Scripts/
│   │   ├── Core/
│   │   │   ├── InsimulGameManager.cs
│   │   │   └── InsimulDataLoader.cs
│   │   ├── Characters/
│   │   │   ├── PlayerController.cs
│   │   │   └── NPCController.cs
│   │   ├── Systems/
│   │   │   ├── ActionSystem.cs
│   │   │   ├── CombatSystem.cs
│   │   │   ├── RuleEnforcer.cs
│   │   │   ├── QuestSystem.cs
│   │   │   ├── InventorySystem.cs
│   │   │   ├── CraftingSystem.cs
│   │   │   ├── ResourceSystem.cs
│   │   │   ├── SurvivalNeedsSystem.cs
│   │   │   └── DialogueSystem.cs
│   │   ├── World/
│   │   │   ├── ProceduralBuildingGenerator.cs
│   │   │   ├── ProceduralNatureGenerator.cs
│   │   │   ├── ProceduralDungeonGenerator.cs
│   │   │   ├── RoadGenerator.cs
│   │   │   └── WorldScaleManager.cs
│   │   └── UI/
│   │       ├── HUDManager.cs
│   │       ├── MinimapController.cs
│   │       ├── InventoryUI.cs
│   │       ├── QuestTrackerUI.cs
│   │       ├── DialogueUI.cs
│   │       └── GameMenuUI.cs
│   ├── Prefabs/
│   │   ├── Player.prefab
│   │   ├── NPC.prefab
│   │   ├── Buildings/
│   │   └── Nature/
│   ├── Resources/
│   │   ├── Data/
│   │   │   ├── characters.json
│   │   │   ├── actions.json
│   │   │   ├── rules.json
│   │   │   ├── quests.json
│   │   │   └── settlements.json
│   │   ├── Models/
│   │   ├── Textures/
│   │   ├── Materials/
│   │   └── Audio/
│   └── UI/
│       ├── HUD.prefab
│       ├── Minimap.prefab
│       └── Menus/
├── Packages/
│   └── manifest.json
└── ProjectSettings/
    ├── InputManager.asset
    └── ProjectSettings.asset
```

### 4.2 Unity-Specific Considerations

- **C# scripting** — all systems ported as MonoBehaviour/ScriptableObject
- **NavMesh** for NPC pathfinding (vs Babylon.js manual raycasting)
- **Unity UI (Canvas)** or **UI Toolkit** for HUD
- **ScriptableObjects** for data (actions, rules, quests)
- **Addressable Assets** for model/texture loading
- **Cinemachine** for camera system (virtual cameras per mode)
- **Input System** (new) for input mapping
- **ProBuilder** or mesh generation API for procedural buildings

---

## 7. Phase 5 — Godot Export

### 5.1 Project Structure

```
InsimulExport_<WorldName>/
├── project.godot
├── scenes/
│   └── main_world.tscn
├── scripts/
│   ├── core/
│   │   ├── game_manager.gd
│   │   └── data_loader.gd
│   ├── characters/
│   │   ├── player_controller.gd
│   │   └── npc_controller.gd
│   ├── systems/
│   │   ├── action_system.gd
│   │   ├── combat_system.gd
│   │   ├── rule_enforcer.gd
│   │   ├── quest_system.gd
│   │   ├── inventory_system.gd
│   │   ├── crafting_system.gd
│   │   ├── resource_system.gd
│   │   ├── survival_needs.gd
│   │   └── dialogue_system.gd
│   ├── world/
│   │   ├── building_generator.gd
│   │   ├── nature_generator.gd
│   │   ├── dungeon_generator.gd
│   │   ├── road_generator.gd
│   │   └── world_scale.gd
│   └── ui/
│       ├── hud.gd
│       ├── minimap.gd
│       ├── inventory_ui.gd
│       ├── quest_tracker.gd
│       ├── dialogue_panel.gd
│       └── game_menu.gd
├── resources/
│   ├── data/
│   │   ├── characters.json
│   │   ├── actions.json
│   │   ├── rules.json
│   │   └── quests.json
│   ├── models/
│   ├── textures/
│   ├── materials/
│   └── audio/
├── scenes/
│   ├── player.tscn
│   ├── npc.tscn
│   ├── buildings/
│   └── ui/
│       ├── hud.tscn
│       ├── minimap.tscn
│       └── menus/
└── addons/
    └── insimul_runtime/             ← optional GDExtension
```

### 5.2 Godot-Specific Considerations

- **GDScript** (primary) or **C#** (optional via .NET) for scripting
- **NavigationServer3D** for NPC pathfinding
- **GLB import natively supported** ✓
- **Control nodes** for UI (Godot's built-in UI system)
- **AnimationPlayer** / **AnimationTree** for character animations
- **MultiMeshInstance3D** for instanced foliage
- **CSGMesh3D** or **ArrayMesh** for procedural geometry
- **Terrain3D plugin** or custom heightmap mesh for terrain

---

## 8. Phase 6 — Live Sync & Re-Export

### 6.1 Version Tracking

- [ ] Track `world.version` in the IR metadata
- [ ] On re-export, compare previous IR with current IR to compute delta
- [ ] Generate only changed files (modified characters, new buildings, etc.)

### 6.2 Insimul Connect Plugin (Future)

An optional plugin for each engine that connects directly to the Insimul API:

- **Live preview** — see world changes in real-time within the native editor
- **Data sync** — pull character/rule/quest changes without full re-export
- **Asset hot-swap** — update textures/models in-engine when changed in Insimul
- **Playthrough sync** — send native game playthroughs back to Insimul for analytics

### 6.3 Collaborative Workflow

```
Designer (Insimul) ──export──▶ Developer (Unreal/Unity/Godot)
                                      │
                                      ▼
                              Custom engine-specific
                              polish & optimization
                                      │
                    ◀──feedback──      │
                                      ▼
Designer iterates ──re-export──▶ Merge with custom work
```

---

## 9. Cross-Cutting Concerns

### 9.1 Deterministic Procedural Generation

All procedural algorithms must produce **identical results** given the same seed and world data, regardless of which engine runs them. This requires:

- [ ] Seeded PRNG (same algorithm across JS, C++, C#, GDScript)
- [ ] Documented algorithm specs for each procedural system
- [ ] Test harness that verifies output consistency across implementations

### 9.2 Rule System Portability

The Insimul rule system supports multiple formats (Insimul, Ensemble, Kismet, ToTT). For native exports:

- [ ] Convert all rules to a unified evaluated form in the IR
- [ ] Native engines implement a rule evaluator that processes the IR conditions/effects
- [ ] Complex Prolog-based rules may need a lightweight Prolog interpreter or pre-compilation to decision trees

### 9.3 Conlang / Language System

The language learning features require:

- [ ] Export vocabulary, grammar rules, and phonology data
- [ ] Port the grammar evaluation engine to each native language
- [ ] UI for in-game language learning (word labels, quizzes, dialogue translation)

### 9.4 Testing Strategy

- [ ] **IR validation** — JSON Schema validation for the IR
- [ ] **Visual regression** — screenshot comparison between Babylon.js and native exports
- [ ] **Behavioral parity** — automated test for NPC AI, combat, quests producing same outcomes
- [ ] **Asset integrity** — verify all referenced assets exist and load in target engine

### 9.5 Export UI

Add a new section to the World Home dashboard:

- [ ] "Export to Engine" card in the Data section
- [ ] Engine selection (Unreal / Unity / Godot) with version picker
- [ ] Export options (include procedural generation source? bake everything? asset quality?)
- [ ] Progress indicator for export job
- [ ] Download link for generated project ZIP

---

## 10. Appendix — Babylon.js Component Inventory

### A. Core (3 files)
| File | Lines | Purpose |
|---|---|---|
| `BabylonGame.ts` | ~5400 | Main game class, orchestrates all systems |
| `BabylonWorld.tsx` | ~200 | React wrapper, mounts/unmounts BabylonGame |
| `RunManager.ts` | ~100 | Simulation tick management |

### B. Player & NPCs (4 files)
| File | Purpose |
|---|---|
| `CharacterController.ts` | Player movement, animation, physics |
| `NPCTalkingIndicator.ts` | Speech bubble/indicator above NPCs |
| `NPCAmbientConversationManager.ts` | NPC-to-NPC dialogue system |
| `DebugLabelUtils.ts` | Debug text labels above entities |

### C. World Generation (7 files)
| File | Purpose |
|---|---|
| `ProceduralBuildingGenerator.ts` | Building geometry from business/residence types |
| `ProceduralNatureGenerator.ts` | Trees, rocks, foliage by biome |
| `ProceduralDungeonGenerator.ts` | Dungeon rooms, corridors, loot |
| `RoadGenerator.ts` | Road paths between settlements |
| `WorldScaleManager.ts` | Country/state/settlement geographic layout |
| `BuildingInteriorGenerator.ts` | Interior room subdivision & furniture |
| `TextureManager.ts` | AI-generated texture loading & application |

### D. Combat (6 files)
| File | Purpose |
|---|---|
| `CombatSystem.ts` | Core melee combat |
| `RangedCombatSystem.ts` | Projectile-based combat |
| `FightingCombatSystem.ts` | Fighting game-style combos |
| `TurnBasedCombatSystem.ts` | Turn-based combat |
| `HealthBar.ts` | Per-entity health display |
| `CombatUI.ts` | Combat HUD elements |

### E. Game Systems (7 files)
| File | Purpose |
|---|---|
| `actions/ActionManager.ts` | Action execution, cooldowns, effects |
| `RuleEnforcer.ts` | Rule condition checking, violations |
| `ResourceSystem.ts` | Gatherable resource nodes |
| `CraftingSystem.ts` | Item crafting recipes |
| `SurvivalNeedsSystem.ts` | Hunger, thirst, stamina |
| `BuildingPlacementSystem.ts` | Player building construction |
| `LanguageProgressTracker.ts` | Conlang learning progress |

### F. Quests (3 files)
| File | Purpose |
|---|---|
| `QuestObjectManager.ts` | Quest item/object spawning |
| `QuestIndicatorManager.ts` | Quest markers & indicators |
| `QuestWaypointManager.ts` | Quest navigation waypoints |

### G. UI (8 files)
| File | Purpose |
|---|---|
| `BabylonGUIManager.ts` | Master HUD orchestrator |
| `BabylonMinimap.ts` | Overhead minimap |
| `BabylonInventory.ts` | Inventory display |
| `BabylonQuestTracker.ts` | Quest objective tracker |
| `BabylonChatPanel.ts` | NPC dialogue panel |
| `BabylonRadialMenu.ts` | Contextual action wheel |
| `BabylonRulesPanel.ts` | In-game rule reference |
| `GenreUIManager.ts` | Genre-specific UI layout switching |

### H. Camera & Audio (2 files)
| File | Purpose |
|---|---|
| `CameraManager.ts` | Camera mode switching (1st/3rd/iso/etc.) |
| `AudioManager.ts` | Sound effects, ambient audio, music |

### I. VR (8 files)
| File | Purpose |
|---|---|
| `VRManager.ts` | WebXR session management |
| `VRUIPanel.ts` + `VRHandMenu.ts` | VR floating UI panels |
| `VRInteractionManager.ts` | VR grab/point/teleport |
| `VRHUDManager.ts` | VR heads-up display |
| `VRCombatAdapter.ts` | VR combat input mapping |
| `VRChatPanel.ts` | VR dialogue interface |
| `VRVocabularyLabels.ts` | VR word labels in 3D space |
| `VRHandTrackingManager.ts` | Hand tracking input |
| `VRAccessibilityManager.ts` | VR accessibility features |

### J. Menu & Info (3 files)
| File | Purpose |
|---|---|
| `GameMenuSystem.ts` | Pause menu, settings |
| `BuildingInfoDisplay.ts` | Building tooltip/info panel |
| `actions/ActionRadialMenu.tsx` | React-based action menu |
| `actions/DialogueActions.tsx` | React dialogue action UI |

### K. Data Types (1 file)
| File | Purpose |
|---|---|
| `types/actions.ts` | Action, ActionState, ActionContext, ActionResult, ActionEffect, ActionUIConfig |

---

## Priority Order

| Priority | Phase | Effort | Impact |
|---|---|---|---|
| 🔴 P0 | Phase 0 — Codify abstractions | Medium | Foundation for everything |
| 🔴 P0 | Phase 1 — IR schema & generator | High | Enables all exporters |
| 🟡 P1 | Phase 2 — Asset pipeline | Medium | Required for visual fidelity |
| 🟢 P2 | Phase 3 — Unreal export | Very High | Primary target engine |
| 🔵 P3 | Phase 4 — Unity export | High | Second target engine |
| 🔵 P3 | Phase 5 — Godot export | High | Third target engine |
| ⚪ P4 | Phase 6 — Live sync | Very High | Long-term vision |

---

## Next Steps

1. **Start with Phase 0.2** — Move shared types to `shared/game-engine/types.ts`
2. **Build the IR schema** — Define TypeScript interfaces for `WorldIR` and all sub-types
3. **Build the IR generator** — Server-side service that serializes a world to IR
4. **Prototype Unreal export** — Start with a minimal export: terrain + buildings + player character
5. **Iterate** — Add systems one at a time (combat → quests → dialogue → etc.)
