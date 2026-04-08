# PRD: NPC Building Occupancy & Schedule-Driven Movement

## Introduction

NPCs in the Babylon.js game world have correct data associations to residences and workplaces, but they never actually appear inside buildings during gameplay. The game already has substantial infrastructure — `NPCScheduleSystem` (personality-driven goal selection), `ScheduleExecutor` (time-based routine management), `InteriorNPCManager` (interior NPC positioning), `BuildingEntrySystem` (player building entry), and `GameTimeManager` (in-game clock with events) — but these systems are not fully connected. NPCs remain outdoors at all times regardless of their schedule state.

This PRD addresses wiring these existing systems together so that NPCs move between their homes, workplaces, and outdoor locations based on time of day, and are visible inside building interiors when the player enters.

## Goals

- NPCs follow a three-state daily routine: home (night), work (day), socializing/wandering (evening)
- NPC meshes are hidden from the overworld when they are "inside" a building
- NPCs are visible inside building interiors when the player enters the building they occupy
- Players can enter buildings and interact with NPCs inside them
- Schedule transitions use the existing `GameTimeManager` day-night cycle and time events
- Personality traits (Big Five) influence schedule timing and location preferences (leveraging existing `NPCScheduleSystem` logic)

## User Stories

### US-001: NPC Overworld Visibility Tied to Schedule State
**Description:** As a player, I want NPCs to disappear from the overworld when they are inside a building so that the world feels realistic and NPCs aren't always standing outside.

**Acceptance Criteria:**
- [ ] When an NPC's current schedule goal is `go_to_building` or `idle_at_building`, the NPC mesh is hidden from the overworld after reaching the building door
- [ ] NPC mesh reappears at the building door position when their schedule transitions to an outdoor goal (`wander_sidewalk`, travel to another building, etc.)
- [ ] A brief walk-to-door animation/movement precedes disappearing (NPC doesn't just pop out of existence)
- [ ] Typecheck/lint passes

### US-002: NPCs Start at Correct Locations on Game Load
**Description:** As a player, I want NPCs to already be in the right place when the game loads — at home if it's nighttime, at work if it's business hours — rather than all spawning outdoors.

**Acceptance Criteria:**
- [ ] On game load, the current game hour is checked against each NPC's schedule
- [ ] NPCs whose schedule says they should be inside a building are spawned hidden (mesh invisible) and registered as occupants of that building
- [ ] NPCs whose schedule says they should be outdoors are spawned at an appropriate outdoor position (near their current goal building or wandering)
- [ ] Night-time loads (20:00–06:00) result in most NPCs being hidden inside their residences
- [ ] Daytime loads result in employed NPCs being hidden inside their workplaces
- [ ] Typecheck/lint passes

### US-003: Interior NPC Rendering When Player Enters Building
**Description:** As a player, I want to see NPCs inside a building when I enter it, positioned at contextually appropriate locations (behind counters, at tables, in beds, etc.).

**Acceptance Criteria:**
- [ ] When the player enters a building, all NPCs currently registered as occupants of that building are rendered inside the interior
- [ ] Business NPCs (owner/employees) are positioned at work stations using existing `InteriorNPCManager` furniture role assignments
- [ ] Patron/visitor NPCs are positioned at appropriate customer locations (tables, browsing spots)
- [ ] Residence occupants are positioned at home furniture (chairs, beds at night)
- [ ] NPC interaction prompts (`[G]: Talk to [Name]`) work inside building interiors
- [ ] Typecheck/lint passes

### US-004: NPC Schedule Transitions During Gameplay
**Description:** As a player, I want to see NPCs naturally transition between locations throughout the game day — leaving home in the morning, arriving at work, going out in the evening, and returning home at night.

**Acceptance Criteria:**
- [ ] `ScheduleExecutor` responds to `hour_changed` events from `GameTimeManager` and triggers NPC goal transitions
- [ ] Morning transition (06:00–08:00): NPCs exit residences (mesh appears at door), walk to workplace or social destination
- [ ] Evening transition (17:00–20:00): Employed NPCs leave workplaces, walk to social venues or wander
- [ ] Night transition (20:00–23:00): NPCs walk home, enter residence (mesh disappears at door)
- [ ] Personality traits influence transition timing (e.g., conscientious NPCs leave earlier, extroverts stay out later) — leveraging existing `NPCScheduleSystem.pickNextGoal()` personality weights
- [ ] Typecheck/lint passes

### US-005: Building Occupancy Registry
**Description:** As a developer, I need a centralized registry tracking which NPCs are currently inside which buildings, so that interior rendering, schedule queries, and interaction systems can all reference a single source of truth.

**Acceptance Criteria:**
- [ ] New `BuildingOccupancyRegistry` (or extension of existing system) provides: `enter(npcId, buildingId)`, `exit(npcId)`, `getOccupants(buildingId): string[]`, `getBuildingForNpc(npcId): string | null`
- [ ] Registry is updated by `ScheduleExecutor` when NPCs enter/exit buildings
- [ ] Registry is initialized on game load based on current schedule state (US-002)
- [ ] `InteriorNPCManager` reads from this registry when the player enters a building
- [ ] Registry emits events (`npc_entered_building`, `npc_exited_building`) for other systems to react to
- [ ] Typecheck/lint passes

### US-006: NPC Door Entry/Exit Animations
**Description:** As a player, I want to see NPCs walk up to a building door and visually enter/exit rather than popping in and out of existence.

**Acceptance Criteria:**
- [ ] When an NPC's path leads to a building, the NPC walks to the door position (using existing sidewalk pathfinding to nearest door point)
- [ ] At the door, NPC pauses briefly (0.5–1.0 seconds), then mesh fades out or is hidden
- [ ] When exiting, NPC mesh appears at the door, pauses briefly, then begins walking to next goal
- [ ] Door position is read from existing `buildingData` metadata (front face center + offset)
- [ ] Typecheck/lint passes

### US-007: Player Interaction with NPCs Inside Buildings
**Description:** As a player, I want to approach and talk to NPCs inside buildings the same way I do outdoors.

**Acceptance Criteria:**
- [ ] NPCs inside building interiors are registered with the `NPCInteractionPrompt` system
- [ ] Center-screen ray picking detects interior NPCs within interaction range (12m or less given interior scale)
- [ ] `[G]: Talk to [Name]` prompt appears when looking at an interior NPC
- [ ] Initiating conversation with an interior NPC opens the same chat/dialogue system as outdoor interactions
- [ ] Typecheck/lint passes

### US-008: Business Operating Hours Enforcement
**Description:** As a player, I want businesses to have realistic operating hours — NPCs should only be working during open hours, and the business interior should reflect whether it's open or closed.

**Acceptance Criteria:**
- [ ] Operating hours from `InteriorNPCManager` (e.g., Bakery 6–18, Bar 16–2, School 8–16) are enforced by the schedule system
- [ ] Employee NPCs only go to their workplace during operating hours
- [ ] Patron NPCs only visit businesses during operating hours
- [ ] When the player enters a closed business, no employee/patron NPCs are present (or only a night-shift worker if applicable)
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-1: The `BuildingOccupancyRegistry` must maintain a bidirectional mapping of NPC ↔ building, queryable by either key
- FR-2: NPC mesh visibility (`isVisible`, `setEnabled`) must be toggled when entering/exiting buildings — not destroyed/recreated
- FR-3: On game load, NPC initial positions must be computed from `GameTimeManager.getState().hour` crossed with their schedule
- FR-4: `ScheduleExecutor` must subscribe to `hour_changed` and `time_of_day_changed` events to trigger schedule re-evaluation
- FR-5: Interior NPC positions must use existing `InteriorNPCManager` furniture role assignments (counter, table, bed, etc.)
- FR-6: The occupancy registry must cap business occupancy at existing limits (6 NPCs max per interior, 4 patrons max)
- FR-7: NPC pathfinding to building doors must use existing `NPCScheduleSystem.findSidewalkPath()` with the door position as the destination
- FR-8: The system must handle edge cases: NPC's residence/workplace has no lot position (skip or assign fallback), player inside building when NPC enters/exits (update interior in real-time)

## Non-Goals

- No new NPC AI decision-making — leverage existing `NPCScheduleSystem` personality-driven goal selection
- No new pathfinding algorithm — use existing A* sidewalk pathfinding
- No multi-floor interiors or staircase navigation
- No NPC-to-NPC interactions inside buildings (ambient conversations inside are out of scope)
- No building door lock/unlock mechanics
- No player housing or player-owned building management
- No NPC sleeping animations or detailed home activities beyond positioning

## Technical Considerations

- **Existing systems to leverage:**
  - `NPCScheduleSystem` (shared/game-engine/rendering/NPCScheduleSystem.ts) — goal selection, personality weights, pathfinding
  - `ScheduleExecutor` (shared/game-engine/rendering/ScheduleExecutor.ts) — time-event bridging, per-NPC routine state
  - `InteriorNPCManager` (shared/game-engine/rendering/InteriorNPCManager.ts) — interior positioning, furniture roles, operating hours
  - `BuildingEntrySystem` (shared/game-engine/rendering/BuildingEntrySystem.ts) — player enter/exit, fade transitions
  - `GameTimeManager` (shared/game-engine/logic/GameTimeManager.ts) — fractional hours, time events
  - `buildingData` Map on `BabylonGame` — building positions, metadata, door locations
  - `populateBusinessesWithNPCs()` / `BusinessPopulationManager` — existing customer assignment (may need refactoring to use occupancy registry instead)

- **Performance:** With potentially 50+ NPCs per settlement, mesh visibility toggling must be lightweight. Use `mesh.setEnabled(false)` rather than disposing/recreating meshes.

- **Deterministic seeding:** The existing `daySeed()` system in `NPCScheduleSystem` ensures consistent daily schedules. The occupancy system must respect this so NPCs don't change plans on reload.

- **Interior sync:** When a player is inside a building and an NPC enters/exits per their schedule, the interior scene must update in real-time (add/remove NPC from the interior).

## Success Metrics

- On any game load, >80% of NPCs are in contextually appropriate locations (home at night, work during day, social in evening)
- NPCs are never seen standing idle outdoors during hours when they should be inside a building
- Player can enter any residence or business and find the expected occupants inside
- Schedule transitions happen smoothly with no NPC teleporting or popping

## Open Questions

- Should there be a visual indicator on building exteriors showing occupancy (e.g., lights on/off, smoke from chimney)?
- How should the system handle NPCs whose residence or workplace building was not generated (no lot position)?
- Should NPCs react to the player entering their home (greeting, surprise, etc.)?
- What happens when the player is following an NPC and the NPC enters a building — auto-prompt to enter?
