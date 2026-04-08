# PRD: Action-Activity Unification

## Introduction

The game currently has two disconnected systems for mapping player activities to game effects:

1. **Actions** (138 base actions in the database) — have Prolog definitions with effects, prerequisites, and hierarchy. Stored in the `actions` table with `content` (Prolog source).
2. **Activity Taxonomy** (95 verbs in `activity-types.ts`) — hardcoded mapping from activity verbs to game event names and Prolog predicates. Never imported or used until now.

These two systems overlap but don't align: 76 actions have no activity verb, 42 activity verbs have no action, and naming is inconsistent (`buy_item` vs `buy`, `compliment_npc` vs `compliment`).

This refactor makes **actions the source of truth** for the activity-event-Prolog pipeline. Each action declares what game event triggers it and what Prolog effects fire when it executes. The activity taxonomy becomes derived from action data at runtime.

## Goals

- Every action has an `emitsEvent` field declaring the game event that triggers it
- Every action has Prolog effects (`action_effect/2`) that fire when the event occurs
- The activity taxonomy is generated from action data, not maintained as a separate file
- New actions automatically integrate into the event→Prolog pipeline without code changes
- Actions without event mappings produce a validation warning in the editor
- Consistent naming: actions and activity verbs use the same names

## User Stories

### US-001: Add emitsEvent and gameActivityVerb fields to action schema
**Description:** As a developer, each action needs to declare what game event triggers it so the pipeline can route events to action effects automatically.

**Acceptance Criteria:**
- [ ] Add `emitsEvent` text column to the actions schema (nullable — some actions like animations don't map to events)
- [ ] Add `gameActivityVerb` text column to the actions schema (the canonical activity name for this action)
- [ ] Both fields are included in the Prolog content generation (`action_emits_event/2`, `action_activity/2`)
- [ ] Typecheck passes

### US-002: Populate emitsEvent for all 138 base actions
**Description:** As a developer, every base action that maps to a game event needs its `emitsEvent` field set.

**Acceptance Criteria:**
- [ ] Map each action to its corresponding game event using the existing `activity-types.ts` and `LEGACY_EVENT_ALIASES` as reference
- [ ] Social actions (compliment_npc, greet, apologize, etc.) → event that triggers their effects
- [ ] Physical actions (fish, mine_rock, cook, etc.) → `physical_action_completed` with actionType
- [ ] Combat actions (attack_enemy, sword_attack, etc.) → `combat_action` or `enemy_defeated`
- [ ] Item actions (collect_item, craft_item, buy_item) → corresponding item events
- [ ] Animation-only actions (idle, walk, dance, clap, etc.) → `emitsEvent: null` (no game state change)
- [ ] Write a migration script to update all base actions in the database
- [ ] Typecheck passes

### US-003: Generate activity taxonomy from action data at runtime
**Description:** As a developer, the activity-event mapping should be derived from action data rather than maintained as a separate hardcoded file.

**Acceptance Criteria:**
- [ ] Add `buildActivityTaxonomyFromActions(actions: Action[])` function that generates the event→action mapping from loaded action data
- [ ] `GamePrologEngine.deriveActionId()` uses the generated taxonomy instead of hardcoded lookups
- [ ] The generated mapping covers all event→action routes that the current hardcoded taxonomy covers
- [ ] `activity-types.ts` is either deprecated or converted to a thin wrapper that calls the generated taxonomy
- [ ] Typecheck passes

### US-004: Validate actions at creation/edit time
**Description:** As a world creator, when I create or edit an action in the editor, the system should warn me if the action has no event mapping or no effects.

**Acceptance Criteria:**
- [ ] When saving an action in the editor, validate that `emitsEvent` is set (warn if null for non-animation actions)
- [ ] Validate that `action_effect/2` predicates exist in the Prolog content (warn if missing)
- [ ] Display validation warnings in the editor UI (not blocking — creator can still save)
- [ ] Base actions that are animation-only (idle, walk, etc.) are exempt from the warning
- [ ] Typecheck passes

### US-005: Unify naming — reconcile action names with activity verbs
**Description:** As a developer, action names and activity verbs should use consistent naming so the mapping is 1:1.

**Acceptance Criteria:**
- [ ] Resolve naming conflicts: either rename actions to match verbs or vice versa (e.g., `buy_item` → keep as `buy_item`, activity verb `buy` becomes an alias)
- [ ] Add an `aliases` field to actions for backward compatibility (e.g., `buy_item` has alias `buy`)
- [ ] `deriveActionId()` resolves aliases when looking up actions
- [ ] Document the canonical name for each action in the action definition
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Each action in the database has an `emitsEvent` field declaring its trigger event
- FR-2: `GamePrologEngine.deriveActionId()` resolves events to actions via the action data, not hardcoded switches
- FR-3: Action effects fire when the mapped event occurs, updating Prolog state
- FR-4: New actions with `emitsEvent` set are automatically routed through the effect pipeline
- FR-5: The editor warns when an action has no event mapping or no effects
- FR-6: Animation-only actions (`emitsEvent: null`) are excluded from the pipeline

## Non-Goals

- Not changing the Prolog action format (action/4, action_effect/2, can_perform/3 remain as-is)
- Not removing `action-effects.ts` (it provides the effect definitions; they just need to be baked into action records)
- Not changing how events are emitted from BabylonGame (the GameEventBus remains the event source)
- Not changing the QuestCompletionEngine's event handling (it continues to receive events independently)

## Technical Considerations

- **Migration size:** 138 actions need `emitsEvent` populated. A migration script can derive most mappings from `activity-types.ts` and `LEGACY_EVENT_ALIASES`.
- **Runtime generation:** Building the taxonomy from action data means loading actions before the Prolog engine initializes. Actions are already loaded during `GamePrologEngine.initialize()`, so this is feasible.
- **Backward compatibility:** Old action data without `emitsEvent` should still work — the system falls back to the current hardcoded mapping until migration runs.
- **Performance:** The generated taxonomy is a simple Map lookup — no performance concern.

## Open Questions

- Should `emitsEvent` be stored in the Prolog content (as a predicate) or as a denormalized DB column? Both have tradeoffs — Prolog keeps it with the action logic, DB column enables queries.
- Should animation-only actions be separated into a different type (e.g., `actionCategory: 'animation'`) to exclude them from validation?
- Should the `action-effects.ts` file be merged into the action records in the database, or kept as a code-level catalog that gets applied during Prolog generation?
