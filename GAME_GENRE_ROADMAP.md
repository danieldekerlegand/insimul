# Game Genre System Roadmap

## Executive Summary

This document analyzes how different game genres (RPG, FPS, platformer, strategy, etc.) are currently implemented in Insimul and outlines a roadmap for making the 3D test game truly adapt its mechanics based on the selected game type.

**Key Insight:** Rather than completely redesigning the 3D implementation for each genre, we can leverage **camera perspective tricks** and **movement constraints** to achieve genre-appropriate gameplay while reusing the existing 3D models and infrastructure.

---

## Camera-Centric Approach

### Existing Camera Infrastructure

The `CameraManager.ts` already provides three camera modes:

| Mode | Radius | Angle | Use Case |
|------|--------|-------|----------|
| `first_person` | 0.1 | Eye-level | FPS, Horror |
| `third_person` | 10 | 60° behind | RPG, Action, Adventure |
| `isometric` | 25 | 45° | Strategy, RPG (classic) |

The `CharacterController.ts` supports two movement schemes:

| Mode | Behavior | Use Case |
|------|----------|----------|
| Mode 0 | Camera-relative (WASD moves relative to camera facing) | FPS, Third-person |
| Mode 1 | World-space (WASD moves in cardinal directions) | Isometric, Top-down, Strategy |

### New Camera Modes Needed

Only **3 additional camera modes** are needed to cover all 15 game genres:

1. **`side_scroll`** - Camera locked perpendicular to XZ plane, movement constrained to 2D
2. **`top_down`** - Camera directly above (90°), true bird's-eye view
3. **`fighting`** - Fixed side camera, locked to arena bounds

### Genre-to-Camera Mapping

| Genre | Camera Mode | Movement Mode | 2D Constraint | Additional Systems |
|-------|-------------|---------------|---------------|-------------------|
| `rpg` | third_person | 0 | No | ✅ Ready |
| `action` | third_person | 0 | No | Combat timing |
| `fighting` | side_scroll/fighting | 0 | **Yes (XY)** | Combo system |
| `platformer` | side_scroll | 0 | **Yes (XY)** | Jump physics |
| `strategy` | top_down/isometric | 1 | No | Unit selection |
| `survival` | third_person | 0 | No | Crafting, needs |
| `shooter` | first_person | 0 | No | Ranged combat |
| `sandbox` | third_person | 0 | No | Building |
| `city-building` | top_down | 1 | No | Placement grid |
| `simulation` | third_person/isometric | 0/1 | No | Systems UI |
| `puzzle` | isometric/first_person | 1/0 | Optional | Interaction |
| `language-learning` | third_person | 0 | No | ✅ Ready |
| `educational` | third_person | 0 | No | ✅ Ready |
| `adventure` | third_person | 0 | No | ✅ Ready |
| `roguelike` | top_down/isometric | 1 | No | Permadeath, procedural |

### 2D Plane Constraint Implementation

For side-scrollers and fighting games, we constrain movement to a 2D plane while keeping 3D visuals:

```typescript
// In CharacterController - add movement constraint
private _movementPlane: 'free' | 'xy' | 'xz' = 'free';

public setMovementPlane(plane: 'free' | 'xy' | 'xz'): void {
  this._movementPlane = plane;
}

// In movement calculation
if (this._movementPlane === 'xy') {
  moveVector.z = 0; // Lock Z-axis for side-scroller
} else if (this._movementPlane === 'xz') {
  moveVector.y = 0; // Lock Y-axis (already done by gravity)
}
```

### Camera Mode Configs (Proposed)

```typescript
const CAMERA_CONFIGS: Record<CameraMode, CameraModeConfig> = {
  // ... existing modes ...
  
  side_scroll: {
    mode: 'side_scroll',
    radius: 15,
    beta: Math.PI / 2,      // 90° - directly to side
    alpha: Math.PI / 2,     // Fixed alpha (no rotation)
    fov: 0.7,
    lowerRadiusLimit: 10,
    upperRadiusLimit: 30,
    lowerBetaLimit: Math.PI / 2 - 0.01,
    upperBetaLimit: Math.PI / 2 + 0.01,
    controllerMode: 0,
    playerVisible: true,
    wheelPrecision: 10,
    lockAlpha: true,        // NEW: prevent camera rotation
    movementPlane: 'xy'     // NEW: constrain to 2D
  },
  
  top_down: {
    mode: 'top_down',
    radius: 30,
    beta: 0.01,             // Nearly 0 - directly above
    fov: 0.5,
    lowerRadiusLimit: 20,
    upperRadiusLimit: 60,
    lowerBetaLimit: 0.01,
    upperBetaLimit: 0.1,
    controllerMode: 1,
    playerVisible: true,
    wheelPrecision: 8,
    movementPlane: 'free'
  },
  
  fighting: {
    mode: 'fighting',
    radius: 12,
    beta: Math.PI / 2.2,    // Slightly elevated
    alpha: Math.PI / 2,     // Side view
    fov: 0.8,
    lowerRadiusLimit: 8,
    upperRadiusLimit: 20,
    lowerBetaLimit: Math.PI / 3,
    upperBetaLimit: Math.PI / 2,
    controllerMode: 0,
    playerVisible: true,
    wheelPrecision: 15,
    lockAlpha: true,
    movementPlane: 'xy',
    lockToArena: true       // NEW: keep both fighters in frame
  }
};
```

---

## Current State Analysis

### Game Types Definition

**Location:** `client/src/components/WorldCreateDialog.tsx`

15 game types are available for world creation:

| Game Type | Description | Quest Type | Mechanics Implemented |
|-----------|-------------|------------|----------------------|
| `rpg` | Character progression, quests, story | ✅ `rpg` | ✅ Combat, quests, inventory |
| `action` | Fast-paced combat and reflexes | ✅ `rpg` | ✅ Melee/hybrid combat |
| `fighting` | One-on-one combat | ✅ `rpg` | ✅ FightingCombatSystem, combos, special meter |
| `platformer` | Jumping and navigating levels | ✅ `platformer` | ✅ Side-scroll camera, 2D constraint |
| `strategy` | Tactical decision-making | ✅ `strategy` | ✅ Top-down camera, resources, building |
| `survival` | Resource gathering, crafting | ✅ `survival` | ✅ SurvivalNeeds, crafting, resources |
| `shooter` | Ranged combat, precision | ✅ `shooter` | ✅ RangedCombatSystem, FPS camera |
| `sandbox` | Open-world exploration | ✅ `rpg` | ✅ Building, open world |
| `city-building` | Urban planning | ✅ `strategy` | ✅ Top-down, building placement |
| `simulation` | Realistic systems | ✅ `rpg` | ✅ Rules, resources |
| `puzzle` | Logic challenges | ✅ `puzzle` | ✅ Puzzle quest type, interactions |
| `language-learning` | Vocabulary, grammar | ✅ `language-learning` | ✅ Dialogue, vocabulary tracking |
| `educational` | Learning experiences | ✅ `language-learning` | ✅ Dialogue system |
| `adventure` | Exploration, narrative | ✅ `rpg` | ✅ Exploration, quests |
| `roguelike` | Procedural, permadeath | ✅ `rpg` | ✅ RunManager, ProceduralDungeon |

### Quest Type Registry

**Location:** `shared/quest-types/index.ts`

**7 quest types** are fully implemented:

1. **`language-learning`** (`shared/quest-types/language-learning.ts`)
   - Categories: conversation, vocabulary, grammar, translation, cultural
   - Objectives: use_vocabulary, complete_conversation, practice_grammar, collect_item, visit_location, talk_to_npc, use_vocabulary_category, sustained_conversation, master_words, learn_new_words

2. **`rpg`** (`shared/quest-types/rpg.ts`)
   - Categories: combat, collection, exploration, escort, delivery, crafting, social
   - Objectives: defeat_enemies, collect_items, reach_location, discover_location, talk_to_npc, escort_npc, deliver_item, craft_item, gain_reputation

3. **`strategy`** (`shared/quest-types/strategy.ts`)
   - Categories: conquest, defense, economy, diplomacy, research

4. **`survival`** (`shared/quest-types/survival.ts`)
   - Categories: gathering, crafting, building, hunting, exploration

5. **`platformer`** (`shared/quest-types/platformer.ts`)
   - Categories: collection, speedrun, exploration, combat, puzzle

6. **`puzzle`** (`shared/quest-types/puzzle.ts`)
   - Categories: logic, spatial, sequence, physics, mystery

7. **`shooter`** (`shared/quest-types/shooter.ts`)
   - Categories: elimination, survival, objective, escort, defense

### 3D Game Systems

**Location:** `client/src/components/3DGame/`

| System | File | Genre Relevance |
|--------|------|-----------------|
| Combat (Melee) | `CombatSystem.ts` | RPG, Action |
| Combat (Ranged) | `RangedCombatSystem.ts` | Shooter, hybrid genres |
| Combat (Fighting) | `FightingCombatSystem.ts` | Fighting |
| Combat (Turn-Based) | `TurnBasedCombatSystem.ts` | RPG (turn-based variant) |
| Combat UI | `CombatUI.ts` | RPG, Action |
| Genre UI | `GenreUIManager.ts` | All genres (6 HUD layouts) |
| Inventory | `BabylonInventory.ts` | RPG, Survival, Adventure |
| Quest Tracking | `BabylonQuestTracker.ts` | All genres |
| Quest Objects | `QuestObjectManager.ts` | All genres |
| Character Control | `CharacterController.ts` | All genres (2D constraint support) |
| Camera | `CameraManager.ts` | All genres (6 modes incl. side_scroll, top_down, fighting) |
| Dialogue | `BabylonChatPanel.ts` | RPG, Adventure, Language-Learning |
| Resources | `ResourceSystem.ts` | Survival, Strategy, Sandbox |
| Crafting | `CraftingSystem.ts` | Survival, RPG |
| Building | `BuildingPlacementSystem.ts` | Strategy, Sandbox, City-Building |
| Survival Needs | `SurvivalNeedsSystem.ts` | Survival |
| Roguelike Runs | `RunManager.ts` | Roguelike |
| Procedural Dungeons | `ProceduralDungeonGenerator.ts` | Roguelike |
| Rules | `RuleEnforcer.ts` | Simulation, Strategy |
| VR | `VRManager.ts` | All genres (optional) |

### Critical Gap Analysis — ✅ ALL RESOLVED

~~The 3D test game does not differentiate mechanics based on game type:~~

1. ✅ **Game Type Awareness**: `BabylonGame.ts` reads `GenreConfig` via `getGenreConfig()` and calls `setCameraModeForGameType()`, `initCombatVariantForGameType()`, `initGenreUI()`, `initGenreFeatures()`
2. ✅ **Genre-Specific Combat**: Melee, Ranged, Fighting, and Turn-Based combat systems created and wired
3. ✅ **Genre-Specific Controls**: FPS camera, side-scroll constraint, top-down mode, fighting camera
4. ✅ **Quest System Expanded**: 7 quest types covering all major genres
5. ✅ **Genre-Specific UI**: 6 HUD layouts (fps, rts, platformer, fighting, puzzle, action_rpg)

---

## Gap Details

### Missing Genre Mechanics

#### Shooter (`shooter`) ✅ IMPLEMENTED
- ✅ First-person camera mode
- ✅ `RangedCombatSystem.ts` with projectile physics
- ✅ Weapon types, ammo management
- ✅ Hit detection with raycasting
- ✅ FPS HUD layout

#### Platformer (`platformer`) ✅ IMPLEMENTED
- ✅ Side-scroll camera mode
- ✅ 2D movement constraint (XY plane)
- ✅ Platformer HUD layout
- ✅ Platformer quest type

#### Strategy (`strategy`) ✅ IMPLEMENTED
- ✅ Isometric + top-down camera modes
- ✅ World-space movement (Mode 1)
- ✅ `ResourceSystem.ts` for resource management
- ✅ `BuildingPlacementSystem.ts` for structure placement
- ✅ RTS HUD layout

#### Survival (`survival`) ✅ IMPLEMENTED
- ✅ `SurvivalNeedsSystem.ts` (hunger, thirst, temperature, energy)
- ✅ `CraftingSystem.ts` (recipe-based)
- ✅ `ResourceSystem.ts` (gathering, storage)
- ✅ Survival quest type

#### Fighting (`fighting`) ✅ IMPLEMENTED
- ✅ `FightingCombatSystem.ts` with combo system
- ✅ Block/parry mechanics
- ✅ Special moves with meter
- ✅ Fighting camera mode
- ✅ Fighting HUD layout

#### Puzzle (`puzzle`) ✅ IMPLEMENTED
- ✅ Puzzle quest type with 8 objective types
- ✅ 5 categories (logic, spatial, sequence, physics, mystery)
- ✅ Puzzle HUD layout

#### Roguelike (`roguelike`) ✅ IMPLEMENTED
- ✅ `RunManager.ts` with permadeath
- ✅ Run-based meta-progression (7 permanent upgrades)
- ✅ `ProceduralDungeonGenerator.ts` (MST corridors, 7 room types)
- ✅ 4 run modifiers

---

## Roadmap

### Phase 1: Genre Detection & Configuration System ✅ COMPLETED

**Goal:** Create infrastructure for genre-aware game behavior.

**Status:** Implemented in `shared/game-genres/types.ts` and `shared/game-genres/index.ts`

#### 1.1 Create Genre Configuration System

**New File:** `shared/game-genres/types.ts`

```typescript
export interface GenreConfig {
  id: string;
  name: string;
  cameraMode: 'third-person' | 'first-person' | 'top-down' | 'isometric' | 'side-scroll';
  controlScheme: 'wasd-mouse' | 'point-click' | 'controller' | 'touch';
  combatStyle: 'melee' | 'ranged' | 'hybrid' | 'none' | 'turn-based';
  movementStyle: 'free' | 'grid' | 'platformer' | 'vehicle';
  uiLayout: 'action-rpg' | 'fps' | 'rts' | 'platformer' | 'puzzle' | 'minimal';
  features: {
    inventory: boolean;
    crafting: boolean;
    dialogue: boolean;
    combat: boolean;
    building: boolean;
    resources: boolean;
    permadeath: boolean;
  };
  questTypes: string[];
  difficultyLevels: string[];
}
```

#### 1.2 Create Genre Registry

**New File:** `shared/game-genres/index.ts`

```typescript
export const GENRE_REGISTRY: Record<string, GenreConfig> = {
  'rpg': { /* ... */ },
  'shooter': { /* ... */ },
  'platformer': { /* ... */ },
  // etc.
};

export function getGenreConfig(gameType: string): GenreConfig;
```

#### 1.3 Integrate with BabylonGame

**File:** `client/src/components/3DGame/BabylonGame.ts`

- Load genre config on initialization
- Pass config to subsystems
- Conditionally initialize systems based on genre

---

### Phase 2: Camera & Control Systems ✅ COMPLETED

**Goal:** Implement genre-appropriate cameras and controls.

**Status:** Implemented in `CameraManager.ts` and `CharacterController.ts`. Added `side_scroll`, `top_down`, and `fighting` camera modes with 2D movement plane constraints.

#### 2.1 Camera Mode System

**File:** `client/src/components/3DGame/CameraManager.ts`

Add support for:
- First-person camera (Shooter, Horror)
- Top-down camera (Strategy, City-Building)
- Isometric camera (Strategy, RPG)
- Side-scrolling camera (Platformer)
- Fighting game camera (Fighting)

#### 2.2 Control Scheme System

**File:** `client/src/components/3DGame/CharacterController.ts`

Add support for:
- FPS controls (mouse look, WASD)
- Platformer controls (precise jumping, wall-jump)
- Strategy controls (unit selection, camera pan)
- Fighting controls (combo inputs)

---

### Phase 3: Combat System Variants ✅ COMPLETED

**Goal:** Implement genre-specific combat mechanics.

**Status:** Extended `CombatSystem.ts` with combat style config. Created `RangedCombatSystem.ts`, `FightingCombatSystem.ts`, and `TurnBasedCombatSystem.ts`. Connected to genre config in `BabylonGame.ts`.

#### 3.1 Ranged Combat System

**New File:** `client/src/components/3DGame/RangedCombatSystem.ts`

- Projectile spawning and physics
- Weapon types (pistol, rifle, shotgun, bow)
- Ammo management
- Aim assist options
- Hit detection with raycasting

#### 3.2 Fighting Game Combat

**New File:** `client/src/components/3DGame/FightingCombatSystem.ts`

- Combo system with input buffering
- Block/parry mechanics
- Special moves with meter
- Juggle physics
- Frame data system

#### 3.3 Turn-Based Combat

**New File:** `client/src/components/3DGame/TurnBasedCombatSystem.ts`

- Turn order management
- Action queue
- Status effects
- Party management
- Enemy AI turns

---

### Phase 4: Genre-Specific Quest Types ✅ COMPLETED

**Goal:** Create quest types for each major genre.

**Status:** Created quest types for strategy, survival, platformer, puzzle, and shooter. All registered in `shared/quest-types/index.ts` with world type inference. Quest type registry expanded from 2 to 7 types.

#### 4.1 Strategy Quest Type

**New File:** `shared/quest-types/strategy.ts`

Categories: conquest, defense, economy, diplomacy, research
Objectives: capture_territory, defend_position, gather_resources, build_structure, research_tech

#### 4.2 Survival Quest Type

**New File:** `shared/quest-types/survival.ts`

Categories: gathering, crafting, building, hunting, exploration
Objectives: survive_days, craft_items, build_shelter, hunt_animals, find_resources

#### 4.3 Platformer Quest Type

**New File:** `shared/quest-types/platformer.ts`

Categories: collection, speedrun, exploration, combat, puzzle
Objectives: collect_coins, reach_goal, find_secrets, defeat_boss, solve_puzzle

#### 4.4 Puzzle Quest Type

**New File:** `shared/quest-types/puzzle.ts`

Categories: logic, spatial, sequence, physics, mystery
Objectives: solve_puzzle, unlock_door, activate_mechanism, find_clues, complete_pattern

#### 4.5 Shooter Quest Type

**New File:** `shared/quest-types/shooter.ts`

Categories: elimination, survival, objective, escort, defense
Objectives: eliminate_targets, survive_waves, capture_point, escort_vip, defend_position

---

### Phase 5: Genre-Specific UI ✅ COMPLETED

**Goal:** Create HUD layouts appropriate for each genre.

**Status:** Created `GenreUIManager.ts` with 6 HUD layouts (fps, rts, platformer, fighting, puzzle, action_rpg). Connected to `BabylonGame.ts` via genre config with auto-wiring of combat system callbacks.

#### 5.1 FPS HUD

- Crosshair
- Ammo counter
- Weapon wheel
- Health/armor bars
- Minimap (optional)

#### 5.2 Strategy HUD

- Resource bars
- Unit selection panel
- Build menu
- Minimap (required)
- Tech tree button

#### 5.3 Platformer HUD

- Lives counter
- Collectibles counter
- Timer (optional)
- Minimal health display

#### 5.4 Fighting HUD

- Health bars (top of screen)
- Special meter
- Round counter
- Combo counter
- Timer

---

### Phase 6: Advanced Genre Features ✅ COMPLETED

**Goal:** Implement deep genre-specific systems.

**Status:** Created `ResourceSystem.ts`, `CraftingSystem.ts`, `BuildingPlacementSystem.ts`, and `SurvivalNeedsSystem.ts`. Connected to `BabylonGame.ts` via `initGenreFeatures()` which reads genre config feature flags.

#### 6.1 Survival Systems

**New Files:**
- `SurvivalNeedsSystem.ts` - Hunger, thirst, temperature
- `CraftingSystem.ts` - Recipe-based crafting
- `BaseBuildingSystem.ts` - Structure placement

#### 6.2 Strategy Systems

**New Files:**
- `UnitSystem.ts` - Unit spawning, movement, commands
- `ResourceSystem.ts` - Resource gathering, storage
- `BuildingSystem.ts` - Structure placement, upgrades
- `FogOfWarSystem.ts` - Vision and fog

#### 6.3 Roguelike Systems ✅ COMPLETED

**New Files:**
- `RunManager.ts` - Run state, permadeath, meta-progression, permanent upgrades, run modifiers
- `ProceduralDungeonGenerator.ts` - Room-based generation with corridors, enemy/loot/trap spawning, 3D mesh building

---

## Implementation Priority

### High Priority (Core Differentiation)
1. ✅ Genre configuration system
2. ✅ Camera mode switching
3. ✅ Quest type expansion (strategy, survival, shooter)
4. ✅ FPS/shooter combat system

### Medium Priority (Popular Genres)
5. ✅ Platformer physics and controls
6. ✅ Survival needs and crafting
7. ✅ Strategy unit/building systems
8. ✅ Genre-specific UI layouts

### Low Priority (Niche Genres)
9. ✅ Fighting game combat
10. ✅ Turn-based combat
11. ✅ Roguelike permadeath
12. ✅ Puzzle mechanics

---

## Testing Strategy

### Per-Genre Test Worlds

Create template worlds for each genre:
- `test-rpg-world` - Medieval fantasy RPG
- `test-shooter-world` - Sci-fi shooter
- `test-platformer-world` - Colorful platformer
- `test-strategy-world` - Military strategy
- `test-survival-world` - Post-apocalyptic survival

### Verification Checklist

For each genre, verify:
- [ ] Correct camera mode activates
- [ ] Appropriate control scheme
- [ ] Genre-specific UI displays
- [ ] Quest types match genre
- [ ] Combat system matches genre
- [ ] NPCs behave appropriately

---

## Success Metrics

1. **Genre Differentiation**: Each of the 15 game types should feel distinct
2. **Quest Relevance**: Quests should use objectives appropriate to the genre
3. **Mechanic Depth**: Core mechanics for top 5 genres should be fully playable
4. **User Feedback**: Players should recognize the genre from gameplay alone

---

## File Structure (Proposed)

```
shared/
├── game-genres/
│   ├── index.ts           # Genre registry
│   ├── types.ts           # GenreConfig interface
│   ├── rpg.ts             # RPG config
│   ├── shooter.ts         # Shooter config
│   ├── platformer.ts      # Platformer config
│   ├── strategy.ts        # Strategy config
│   ├── survival.ts        # Survival config
│   └── ...
├── quest-types/
│   ├── strategy.ts        # NEW
│   ├── survival.ts        # NEW
│   ├── platformer.ts      # NEW
│   ├── puzzle.ts          # NEW
│   └── shooter.ts         # NEW

client/src/components/3DGame/
├── combat/
│   ├── MeleeCombatSystem.ts      # Existing, renamed
│   ├── RangedCombatSystem.ts     # NEW
│   ├── FightingCombatSystem.ts   # NEW
│   └── TurnBasedCombatSystem.ts  # NEW
├── genre-systems/
│   ├── SurvivalNeedsSystem.ts    # NEW
│   ├── CraftingSystem.ts         # NEW
│   ├── UnitSystem.ts             # NEW
│   ├── BuildingPlacementSystem.ts# NEW
│   └── PlatformerPhysics.ts      # NEW
├── ui/
│   ├── FpsHUD.ts                 # NEW
│   ├── StrategyHUD.ts            # NEW
│   ├── PlatformerHUD.ts          # NEW
│   └── FightingHUD.ts            # NEW
```

---

*Last Updated: February 2026*
