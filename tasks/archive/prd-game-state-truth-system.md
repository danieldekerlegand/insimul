# PRD: Game State Truth System

## Introduction

Define a comprehensive Game State Truth System where **Prolog is the ultimate arbiter of truth** for all gameplay state. MongoDB persists data long-term, JavaScript provides procedural generation helpers, and LLMs generate freeform content — but Prolog predicates determine what actors can do, what effects actions have, and what state the game world is in at any moment.

Currently, 133 base actions exist with Prolog content, but none have meaningful prerequisites or effects. The `can_perform` rules only check energy. Equipment, skills, location, language level, and other game-mechanically relevant state are tracked in JavaScript runtime objects (EquipmentManager, CombatSystem, inventory maps) but are invisible to Prolog. This feature bridges that gap by:

1. Defining a canonical set of **gameplay state predicates** that cover all mechanically relevant state
2. Adding **real-time truth sync** between runtime systems and a local embedded Prolog instance
3. Defining **action prerequisites and effects** as proper Prolog rules for all 133 actions
4. Creating **character templates** that define starting truths per archetype
5. Extending the **creator tool** to manage templates and test action feasibility live

## Goals

- Every gameplay-relevant state is representable as a Prolog predicate
- Actions have meaningful `can_perform` prerequisites and `action_effect` postconditions
- Prolog state syncs in real-time with runtime systems (equipment, inventory, location, combat)
- Prolog is local/embedded (tau-prolog), tied to game saves — not remote API calls
- Cloud saves back up local state, not the other way around
- NPCs and players share a common truth predicate base, with NPCs having additional predicates (occupation, schedule, dialogue state)
- Both player and NPC truths are dynamic — truths are asserted/retracted as the game progresses
- World creators can choose per-world whether players get a fixed character, selectable archetypes, or custom creation
- Existing truth editor UI is extended (not replaced) to support gameplay state predicates

## User Stories

### US-001: Define canonical gameplay state predicates
**Description:** As a developer, I need a definitive predicate schema for all gameplay-relevant state so that every system speaks the same Prolog vocabulary.

**Acceptance Criteria:**
- [ ] New file `shared/prolog/gameplay-predicates.ts` defines all gameplay state predicates with name, arity, description, and sync direction (runtime->prolog, prolog->runtime, bidirectional)
- [ ] Predicates cover: equipment, inventory, skills, CEFR level, vocabulary, health, energy, location, traits, abilities, status effects, quest state, relationships, time, weather
- [ ] Each predicate has a TypeScript type mapping (what runtime data it corresponds to)
- [ ] Predicate schema is exported for use by sync, converter, and validator systems
- [ ] Typecheck passes

**Predicate categories to define:**

Player/Character State:
```prolog
has_item(Actor, ItemName, Quantity).          % inventory
has_equipped(Actor, Slot, ItemId).            % equipment slots
has_skill(Actor, SkillName, Level).           % skill levels
has_trait(Actor, TraitName).                  % permanent traits
has_status(Actor, StatusName, ExpiresAt).     % temporary status effects
has_ability(Actor, AbilityName).              % unlocked abilities
health(Actor, Current, Max).                  % health points
energy(Actor, Current, Max).                  % energy/stamina
at_location(Actor, LocationId).              % current position
at_location_type(Actor, LocType).            % location category (water, mine, forest, etc.)
near(Actor, Target, Distance).               % proximity check
speaks_language(Actor, Language, CefrLevel).  % language proficiency
knows_vocabulary(Actor, Language, Category).  % vocabulary categories learned
gold(Actor, Amount).                         % currency
level(Actor, Level).                         % character level
xp(Actor, Current, Required).               % experience points
```

NPC-Specific:
```prolog
npc_occupation(NpcId, Occupation).           % current job
npc_schedule(NpcId, Hour, Activity, Location). % daily schedule
npc_dialogue_state(NpcId, State).            % conversation progress
npc_disposition(NpcId, TowardId, Value).     % how NPC feels about someone
npc_will_trade(NpcId).                       % merchant availability
npc_quest_available(NpcId, QuestId).         % quests this NPC can give
```

World State:
```prolog
time_of_day(Hour).                           % current hour (0-23)
day_number(Day).                             % current day
weather(Condition).                          % current weather
location_accessible(LocationId).             % can player reach this?
location_discovered(LocationId).             % has player found this?
quest_active(Actor, QuestId).                % quest in progress
quest_completed(Actor, QuestId).             % quest finished
quest_failed(Actor, QuestId).                % quest failed
```

### US-002: Add action prerequisites for all 133 actions
**Description:** As a game designer, I want every action to have meaningful Prolog prerequisites so that players can only perform actions they're equipped and qualified for.

**Acceptance Criteria:**
- [ ] Update `convertActionToProlog()` in `shared/prolog/action-converter.ts` to accept structured prerequisite definitions
- [ ] Define prerequisites data structure in a new file `shared/prolog/action-prerequisites.ts` mapping each action to its required predicates
- [ ] Prerequisites are categorized by action type:
  - Combat actions: require appropriate weapon/shield equipped
  - Resource actions: require tools and location type
  - Language actions: require minimum CEFR level or vocabulary
  - Commerce actions: require proximity to merchant, sufficient gold
  - Movement actions: energy check only
  - Social/conversational: require proximity to NPC
  - Animation-only: no additional prerequisites (inherit from parent)
- [ ] Re-run converter to regenerate all action content with prerequisites
- [ ] Migration updates all 133 base actions in DB
- [ ] Validator passes with 0 errors and fewer warnings
- [ ] Typecheck passes

**Example prerequisites by category:**

```prolog
% Combat — sword_attack
can_perform(Actor, sword_attack, Target) :-
    action(sword_attack, _, _, EnergyCost),
    energy(Actor, E, _), E >= EnergyCost,
    has_equipped(Actor, weapon, WeaponId),
    item_type(WeaponId, sword),
    near(Actor, Target, 3),
    alive(Target).

% Resource — fish
can_perform(Actor, fish) :-
    action(fish, _, _, EnergyCost),
    energy(Actor, E, _), E >= EnergyCost,
    at_location_type(Actor, water),
    has_item(Actor, fishing_rod, _).

% Language — haggle_price
can_perform(Actor, haggle_price, Target) :-
    action(haggle_price, _, _, EnergyCost),
    energy(Actor, E, _), E >= EnergyCost,
    near(Actor, Target, 5),
    npc_will_trade(Target),
    speaks_language(Actor, Lang, Level),
    cefr_gte(Level, a2).

% Commerce — buy_item
can_perform(Actor, buy_item, Target) :-
    action(buy_item, _, _, EnergyCost),
    energy(Actor, E, _), E >= EnergyCost,
    near(Actor, Target, 5),
    npc_will_trade(Target),
    gold(Actor, G), G > 0.
```

### US-003: Add action effects for all 133 actions
**Description:** As a game designer, I want every player-triggerable action to define its effects as Prolog predicates so the game state updates consistently.

**Acceptance Criteria:**
- [ ] Define effects data structure in `shared/prolog/action-effects.ts` mapping each action to its postconditions
- [ ] Effects use assert/retract patterns on gameplay state predicates
- [ ] Update `convertActionToProlog()` to emit `action_effect/2` predicates
- [ ] Effects categorized:
  - Resource gathering: `assert(has_item(...))`, `retract(energy(...))`, `assert(energy(...))`
  - Combat: `retract(health(Target, ...))`, XP gain
  - Commerce: gold transfer, item transfer
  - Social: relationship changes, reputation
  - Language: vocabulary acquisition, CEFR progress
  - Movement: location change
- [ ] Migration updates all action content in DB
- [ ] Typecheck passes

**Example effects:**

```prolog
% fish effects
action_effect(fish, assert(has_item(Actor, fish, 1))).
action_effect(fish, modify(energy, Actor, -15)).
action_effect(fish, modify(xp, Actor, 15)).
action_effect(fish, modify(skill, Actor, fishing, 1)).

% buy_item effects
action_effect(buy_item, transfer_item(Merchant, Actor, Item)).
action_effect(buy_item, modify(gold, Actor, -Cost)).
action_effect(buy_item, modify(gold, Merchant, Cost)).

% greet effects
action_effect(greet, modify(disposition, Target, Actor, 5)).
action_effect(greet, assert(met(Actor, Target))).
```

### US-004: Real-time Prolog truth sync
**Description:** As a developer, I need runtime game systems to automatically assert/retract Prolog facts when game state changes, so Prolog always reflects current reality.

**Acceptance Criteria:**
- [ ] New class `GameTruthSync` in `shared/game-engine/logic/GameTruthSync.ts`
- [ ] Subscribes to GameEventBus for all state-changing events
- [ ] Syncs to local embedded tau-prolog instance (NOT remote API)
- [ ] Equipment changes: `equip_item` event -> `assert(has_equipped(...))`, `retract` previous
- [ ] Inventory changes: `item_collected`/`item_dropped` -> `assert/retract(has_item(...))`
- [ ] Location changes: player movement -> `retract(at_location(...))`, `assert(at_location(...))`
- [ ] Health/energy: damage/rest -> update `health/3`, `energy/3`
- [ ] Time: `hour_changed` -> `retract(time_of_day(_))`, `assert(time_of_day(NewHour))`
- [ ] Vocabulary: `vocabulary_used` -> potentially `assert(knows_vocabulary(...))`
- [ ] CEFR level: assessment events -> update `speaks_language/3`
- [ ] State is saved with game save and restored on load
- [ ] Prolog state persists across scene transitions within a session
- [ ] Cloud saves serialize the full Prolog fact base as backup
- [ ] Typecheck passes

### US-005: Character template system
**Description:** As a world creator, I want to define character archetypes with starting truths so players begin the game with appropriate equipment, skills, and abilities.

**Acceptance Criteria:**
- [ ] New schema table `character_templates` with fields: id, worldId, name, description, startingTruths (jsonb array of predicate objects), isDefault, tags
- [ ] Starting truths are structured as `{ predicate: string, args: any[] }` objects that map to Prolog assertions
- [ ] World configuration field `characterCreationMode`: 'fixed' | 'archetype_select' | 'custom_create'
- [ ] When mode is 'fixed': single default template auto-applied
- [ ] When mode is 'archetype_select': player picks from available templates at game start
- [ ] When mode is 'custom_create': player customizes starting truths within creator-defined bounds
- [ ] Templates can define: starting items, equipped items, skills, traits, abilities, CEFR level, gold, health/energy maximums
- [ ] Migration seeds default templates (e.g., "Explorer", "Scholar", "Trader") with language-learning-appropriate starting states
- [ ] Typecheck passes

**Example template:**

```json
{
  "name": "Scholar",
  "description": "A studious traveler with linguistic aptitude",
  "startingTruths": [
    { "predicate": "has_item", "args": ["$player", "notebook", 1] },
    { "predicate": "has_item", "args": ["$player", "quill", 1] },
    { "predicate": "has_item", "args": ["$player", "dictionary", 1] },
    { "predicate": "has_equipped", "args": ["$player", "accessory", "reading_glasses"] },
    { "predicate": "has_skill", "args": ["$player", "reading", 3] },
    { "predicate": "has_skill", "args": ["$player", "writing", 2] },
    { "predicate": "speaks_language", "args": ["$player", "english", "b1"] },
    { "predicate": "speaks_language", "args": ["$player", "french", "a1"] },
    { "predicate": "has_trait", "args": ["$player", "bookworm"] },
    { "predicate": "has_ability", "args": ["$player", "speed_reading"] },
    { "predicate": "gold", "args": ["$player", 50] },
    { "predicate": "health", "args": ["$player", 80, 80] },
    { "predicate": "energy", "args": ["$player", 120, 120] }
  ]
}
```

### US-006: Creator tool — character template editor
**Description:** As a world creator, I want a visual editor for character templates so I can define starting game state without writing Prolog by hand.

**Acceptance Criteria:**
- [ ] New tab or section in existing character/world editor for "Character Templates"
- [ ] Reuses existing truth editor patterns (TruthTab, TruthContextPanel)
- [ ] Form-based predicate builder: dropdown for predicate name, typed inputs for arguments
- [ ] Predicate dropdowns populated from `gameplay-predicates.ts` schema
- [ ] Preview panel shows the Prolog facts that will be asserted at game start
- [ ] CRUD for templates (create, edit, duplicate, delete)
- [ ] Per-template "Test" button that initializes a temporary Prolog session with the template's truths and shows which actions would be available
- [ ] Validation: warns if template is missing critical predicates (e.g., no health, no energy)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-007: Creator tool — action feasibility tester
**Description:** As a world creator, I want to simulate "can this character perform action X?" against a character template so I can verify my game design works before publishing.

**Acceptance Criteria:**
- [ ] Panel within character template editor or standalone tool
- [ ] Select a character template, see all 133 actions with pass/fail status
- [ ] Color-coded: green = can_perform succeeds, red = fails (shows which prerequisite failed), gray = animation-only (no prerequisites)
- [ ] Click an action to see detailed prerequisite evaluation trace
- [ ] "What's missing?" helper: for failed actions, suggests which truths to add to the template
- [ ] Can modify template truths and re-test without saving
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-008: NPC truth initialization and dynamics
**Description:** As a developer, I need NPCs to have their own dynamic truths so the Prolog engine can reason about NPC behavior (volition, schedule, trading).

**Acceptance Criteria:**
- [ ] NPC truths initialized from character DB fields at game start: occupation, skills, location, relationships, personality traits
- [ ] NPC-specific predicates (`npc_occupation`, `npc_schedule`, `npc_will_trade`, `npc_quest_available`) asserted from DB data
- [ ] NPCs dynamically gain/lose truths during gameplay (e.g., merchant runs out of stock, NPC changes location on schedule)
- [ ] Schedule system asserts `npc_schedule/4` facts from character schedules
- [ ] Volition system uses NPC truths to decide autonomous actions
- [ ] GameTruthSync handles NPC state changes alongside player state
- [ ] Typecheck passes

### US-009: Fix converter whitespace and re-generate
**Description:** As a developer, I want clean Prolog output from the action converter with consistent formatting.

**Acceptance Criteria:**
- [ ] Remove extra blank lines before `% Can Actor perform this action?` comment (single blank line only)
- [ ] Remove trailing blank lines after prerequisite/effect blocks when they're empty
- [ ] Re-run migration to update all 133 actions
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Define a canonical set of ~30 gameplay state predicates covering player state, NPC state, and world state
- FR-2: Every action's `can_perform` rule must check mechanically relevant prerequisites beyond just energy
- FR-3: Every player-triggerable action must define `action_effect/2` predicates describing state changes
- FR-4: Animation-only actions inherit prerequisites from their parent action or have no prerequisites
- FR-5: GameTruthSync must assert/retract facts in real-time as runtime state changes, using local embedded tau-prolog
- FR-6: Prolog fact base must be serializable to/from game saves
- FR-7: Character templates store starting truths as structured predicate objects
- FR-8: World configuration determines character creation mode (fixed, archetype select, custom)
- FR-9: Creator tool provides visual predicate builder populated from the canonical predicate schema
- FR-10: Action feasibility tester evaluates all actions against a template and shows pass/fail with traces
- FR-11: NPC truths are initialized from DB and updated dynamically during gameplay
- FR-12: CEFR language level is a truth that gates language-learning action difficulty
- FR-13: Helper predicates (`cefr_gte/2`, `is_weapon_type/2`, etc.) are included in the base Prolog KB
- FR-14: All Prolog content in the DB must pass the content validator with 0 errors

## Non-Goals

- No remote Prolog server or API-based Prolog queries — all Prolog is local/embedded
- No procedural generation of prerequisites/effects via LLM — these are hand-authored game design
- No multiplayer truth synchronization between players
- No migration of existing runtime systems away from JavaScript — Prolog supplements, it doesn't replace EquipmentManager/CombatSystem/etc.
- No changes to the MongoDB schema for truths themselves — we use the existing truth table and add gameplay state predicates alongside narrative truths
- No visual Prolog code editor — predicates are built via form UI, not by typing Prolog syntax

## Technical Considerations

- **tau-prolog** is the Prolog engine (pure JS, runs in browser and Node.js)
- GamePrologEngine already subscribes to GameEventBus and asserts facts — GameTruthSync extends this pattern
- The existing `predicate-schema.ts` maps MongoDB fields to Prolog facts — gameplay predicates follow the same pattern
- Action converter (`action-converter.ts`) already generates `can_perform` rules — we add structured prerequisite/effect inputs
- Character templates are a new DB collection but follow existing patterns (isBase, worldId)
- Game saves must include a serialized Prolog fact snapshot alongside JSON state
- Performance: tau-prolog handles ~5000 facts comfortably; 133 actions + ~50 NPC truths + ~30 world state facts is well within budget

## Success Metrics

- All 133 actions pass the content validator with 0 errors, 0 warnings
- Action feasibility tester shows meaningful pass/fail for each action against default templates
- A "Scholar" template can perform language actions but not combat; a "Warrior" can fight but not haggle at high CEFR levels
- Prolog can answer "what actions can this character perform right now?" in <50ms
- World creators can define a character template and test action feasibility without writing code

## Resolved Design Decisions

### Skill Levels: Integer Tiers (1-10)
Integer tiers are simpler to manage in Prolog comparisons (`has_skill(Actor, fishing, Level), Level >= 3`) and we can always add named aliases later via a lookup predicate (`skill_tier_name(3, journeyman)`).

### Minimum Viable Template (MVT)
All characters — player and NPC — must have a minimum set of truths to be valid for game logic. The MVT includes:
- `health(Actor, Current, Max)` — required for combat/survival
- `energy(Actor, Current, Max)` — required for action gating
- `speaks_language(Actor, Language, CefrLevel)` — at least one language
- `gold(Actor, Amount)` — currency (can be 0)
- `at_location(Actor, LocationId)` — current position
- `has_item(Actor, ...)` — starting inventory (can be empty)
- `has_skill(Actor, ...)` — starting skills (can be empty)
- `occupation(Actor, Occupation)` — what they do (player can be "traveler")
- `age(Actor, Age)` — affects some game logic

The MVT should also be translated to a **prompt engineering context block** that is always provided to the LLM during NPC conversations. This ensures the LLM knows the character's current state (equipped items, CEFR level, gold, health, etc.) and can reference it naturally in dialogue.

### CEFR Progression: Assessment-Driven (Boss Fights)
CEFR level changes **only** through formal assessments — mirroring real-life proficiency testing. Assessments function as "boss fights" in the language-learning game structure:
- Quest completion and XP unlock the **ability to take** an assessment (like reaching a boss door)
- The assessment itself determines whether the level changes
- This may warrant restructuring the current assessment system to better fit a quest/progression gate model — making assessments more reusable across different game genres and simplifying level design

### NPC Truth Visibility: Internal + Contextual UI
NPC truths are **internal to Prolog** by default — not shown raw to players. However:
- Truths that correspond to in-game UI are reflected there (merchant inventory in shop panel, NPC name/occupation in dialogue header)
- A **debug mode** exposes all NPC truths for development/testing
- The game never shows "npc_disposition(merchant_01, player, 75)" — it shows the UI consequence (e.g., better prices, friendlier dialogue)

### Location Predicates: Named Locations + Generic Types
Two layers of location predicates:

**Named locations** with coordinates — for specific gameplay-relevant places:
```prolog
named_location(fishing_spot_01, 'Pierre''s Fishing Hole').
location_coords(fishing_spot_01, 120.0, 65.0).
location_of_building(bakery_01, lot_123).
location_of_business(bakery_01, business_456).
```

**Generic location types** — for broad gameplay rules that apply regardless of which specific location:
```prolog
at_location_type(Actor, water).     % enables fishing
at_location_type(Actor, forest).    % enables gathering herbs
at_location_type(Actor, lava).      % instant death — doesn't matter which lava
at_location_type(Actor, indoors).   % affects weather exposure
```

All buildings (businesses and residences) should have location predicates defined. Other named locations are defined as needed for quest design and gameplay mechanics. The location type is derived from terrain/building data and asserted when the player enters the area.

## Open Questions

- **MVT prompt integration:** The MVT context block should be integrated into the existing chat prompt pipeline (not a separate system). Need to audit the current conversation prompting strategy to determine what character/game state is already being sent to the LLM, then extend it with the Prolog-derived MVT context.
- **Assessment "boss fights":** Deferred to a follow-up feature. CEFR remains assessment-driven, but the restructuring of assessments as quest-gated boss fights will be designed separately.
- **Character templates:** No enforced max — rule of thumb is 3-6 per world for archetype selection UI.
