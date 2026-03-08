# Prolog Deep Integration Roadmap

> Date: 2026-03-07
> Goal: Make Prolog predicates the universal language for rules, quests, actions, and truths throughout the entire Insimul system — from authoring to gameplay to exports

---

## Table of Contents

1. [Vision & Principles](#1-vision--principles)
2. [Phase 1: Portable Prolog Engine](#2-phase-1-portable-prolog-engine)
3. [Phase 2: Predicate-First Data Model](#3-phase-2-predicate-first-data-model)
4. [Phase 3: Rules as Prolog](#4-phase-3-rules-as-prolog)
5. [Phase 4: Actions as Prolog](#5-phase-4-actions-as-prolog)
6. [Phase 5: Quests as Prolog](#6-phase-5-quests-as-prolog)
7. [Phase 6: Truths as Prolog](#7-phase-6-truths-as-prolog)
8. [Phase 7: Babylon.js Game Engine Integration](#8-phase-7-babylonjs-game-engine-integration)
9. [Phase 8: NPC Intelligence via Prolog](#9-phase-8-npc-intelligence-via-prolog)
10. [Phase 9: Game Export Integration](#10-phase-9-game-export-integration)
11. [Phase 10: TotT Systems Migration](#11-phase-10-tott-systems-migration)
12. [Phase 11: Authoring UI Integration](#12-phase-11-authoring-ui-integration)
13. [Phase 12: LLM Cost Reduction](#13-phase-12-llm-cost-reduction)
14. [Phase 13: Advanced Prolog Features](#14-phase-13-advanced-prolog-features)
15. [Architecture Diagrams](#15-architecture-diagrams)
16. [Risk Assessment](#16-risk-assessment)
17. [Success Metrics](#17-success-metrics)

---

## 1. Vision & Principles

### Vision

Every meaningful rule, quest condition, action prerequisite, and world truth in Insimul should be expressible as a Prolog predicate. The Prolog knowledge base should be the **single source of truth** for game logic, consulted at runtime by all game engines (Babylon.js, Godot, Unity, Unreal) to drive world simulation, NPC behavior, quest availability, action gating, and narrative generation — all without requiring LLM calls for deterministic decisions.

### Design Principles

1. **Predicates are the canonical logic format.** JSON conditions/effects are derived views of underlying predicates, not the other way around.

2. **Portable Prolog runs everywhere.** A JavaScript-based Prolog engine (tau-prolog or similar) runs in browsers, Node.js, and is transpilable to GDScript/C#/C++ for exports.

3. **Authoring produces predicates.** The UI generates Prolog predicates behind visual editors; users can also write raw Prolog.

4. **Gameplay queries the knowledge base.** Every game decision that can be expressed as a logical query ("Can this NPC trade with the player?", "Is this quest available?", "What actions can the player perform here?") is answered by Prolog, not by imperative code.

5. **Metadata accompanies predicates.** Predicates carry associated metadata (UI labels, icons, narrative templates, difficulty ratings) that is useful for authoring and display but is not part of the logical computation.

6. **Bidirectional state sync.** Game state changes (quest completed, item acquired, NPC killed) assert new facts into the knowledge base in real time.

7. **Prolog reduces LLM costs.** Every deterministic decision moved to Prolog is an LLM call saved. LLMs focus on creative content generation; Prolog handles logical determination.

---

## 2. Phase 1: Portable Prolog Engine

### Objective
Replace SWI-Prolog (external CLI dependency) with a JavaScript-based Prolog engine that runs in browsers and Node.js.

### Tasks

#### 1.1 Evaluate JavaScript Prolog Engines

| Engine | ISO Compliance | Size | Browser | Node.js | Performance | License |
|--------|---------------|------|---------|---------|-------------|---------|
| **tau-prolog** | ISO Prolog subset | ~200KB | Yes | Yes | Good | BSD |
| **Jiprolog** | Full ISO | ~1MB | Yes | Yes | Moderate | LGPL |
| **yield-prolog** | Minimal | ~50KB | Yes | Yes | Fast (generator-based) | MIT |
| **SWI-Prolog WASM** | Full SWI | ~20MB | Yes (heavy) | No | Excellent | BSD |

**Recommendation:** Start with **tau-prolog** for its balance of ISO compliance, small size, and browser compatibility. It supports modules for lists, arithmetic, and I/O. If performance becomes an issue, evaluate SWI-Prolog WASM for server-side use while keeping tau-prolog for client/export.

#### 1.2 Create `PrologRuntime` Abstraction

```typescript
// shared/prolog/prolog-runtime.ts
interface PrologRuntime {
  // Knowledge base management
  assertFact(fact: string): void;
  assertRule(rule: string): void;
  retract(clause: string): void;
  abolish(functor: string, arity: number): void;

  // Querying
  query(goal: string): Promise<QueryResult[]>;
  queryOnce(goal: string): Promise<QueryResult | null>;
  queryAll(goal: string): Promise<QueryResult[]>;

  // Knowledge base I/O
  loadProgram(source: string): Promise<void>;
  exportProgram(): string;
  clear(): void;

  // Lifecycle
  initialize(): Promise<void>;
  dispose(): void;
}

interface QueryResult {
  success: boolean;
  bindings: Record<string, PrologValue>;
}

type PrologValue = string | number | PrologList | PrologCompound;
```

#### 1.3 Implement `TauPrologRuntime`

Wrap tau-prolog in the `PrologRuntime` interface:
- Handle module loading (lists, arithmetic)
- Manage session lifecycle
- Provide synchronous and async query modes
- Handle error translation (Prolog errors → TypeScript errors)
- Support result streaming for large query sets

#### 1.4 Implement `SWIPrologRuntime` (Backward Compatibility)

Wrap the existing `PrologManager` in the `PrologRuntime` interface to maintain backward compatibility during migration.

#### 1.5 Add to `package.json`

```json
{
  "dependencies": {
    "tau-prolog": "^0.3.4"
  }
}
```

#### 1.6 Integration Tests

- Port existing `comprehensive-prolog-tests.ts` to use `PrologRuntime` interface
- Test tau-prolog against SWI-Prolog for result parity
- Benchmark query performance (target: <5ms for typical gameplay queries)

### Deliverables
- `shared/prolog/prolog-runtime.ts` — Interface
- `shared/prolog/tau-prolog-runtime.ts` — Browser/export implementation
- `server/engines/prolog/swi-prolog-runtime.ts` — Server fallback
- `shared/prolog/runtime-factory.ts` — Factory for environment detection

---

## 3. Phase 2: Predicate-First Data Model

### Objective
Define a canonical predicate schema that all game concepts (rules, actions, quests, truths) are expressed in. This schema becomes the contract between the authoring system, the knowledge base, and the game engine.

### Tasks

#### 2.1 Extend Core Predicate Schema

Expand `server/schema/core-predicates.json` to cover all game concepts:

**World State Predicates:**
```prolog
% Time & Environment
current_time(WorldId, Year, Season, DayPart).
weather(WorldId, WeatherType).
is_nighttime(WorldId) :- current_time(WorldId, _, _, night).

% Geography
in_settlement(Entity, SettlementId).
in_country(Settlement, CountryId).
in_state(Settlement, StateId).
distance(LocationA, LocationB, Distance).
path_exists(LocationA, LocationB).
terrain_type(Location, TerrainType).

% Economy
price(ItemType, Settlement, Price).
supply(ItemType, Settlement, Quantity).
demand(ItemType, Settlement, Level).
tax_rate(Settlement, Rate).
```

**Character State Predicates:**
```prolog
% Attributes
health(Character, Value).
energy(Character, Value).
gold(Character, Value).
skill_level(Character, Skill, Level).
reputation(Character, Faction, Value).

% Personality (Big Five as predicates)
personality(Character, openness, Value).
personality(Character, conscientiousness, Value).
personality(Character, extroversion, Value).
personality(Character, agreeableness, Value).
personality(Character, neuroticism, Value).

% Derived traits
is_introverted(C) :- personality(C, extroversion, V), V < -0.3.
is_agreeable(C) :- personality(C, agreeableness, V), V > 0.3.
is_creative(C) :- personality(C, openness, V), V > 0.5.

% Status
has_status(Character, Status).
is_injured(C) :- health(C, H), H < 50.
is_exhausted(C) :- energy(C, E), E < 10.
is_wealthy(C) :- gold(C, G), G > 1000.
```

**Relationship Predicates (expanded):**
```prolog
% Core relationships
relationship(CharA, CharB, Type, Strength).
trusts(CharA, CharB, Level).
fears(CharA, CharB, Level).
respects(CharA, CharB, Level).
attraction(CharA, CharB, Level).

% Derived
is_ally(A, B) :- relationship(A, B, friend, S), S > 60.
is_enemy(A, B) :- relationship(A, B, rival, S), S > 60.
is_neutral(A, B) :- \+ relationship(A, B, _, _).
```

#### 2.2 Define Predicate Metadata Schema

Each predicate carries associated metadata for the authoring system:

```typescript
interface PredicateDefinition {
  // Prolog identity
  functor: string;          // e.g., "can_perform"
  arity: number;            // e.g., 2
  signature: string;        // e.g., "can_perform(+Action, +Actor)"

  // Logic
  type: 'fact' | 'rule' | 'query';
  body?: string;            // Rule body for derived predicates

  // Authoring metadata
  category: string;         // e.g., "action_system"
  displayName: string;      // e.g., "Can Perform Action"
  description: string;      // Human-readable explanation
  parameterLabels: string[];// e.g., ["Action", "Actor"]
  parameterTypes: string[]; // e.g., ["action_id", "character_id"]

  // Game metadata
  icon?: string;
  color?: string;
  narrativeTemplate?: string;  // e.g., "{Actor} performs {Action}"
}
```

#### 2.3 Create `PredicateRegistry`

A shared registry of all known predicates, loadable by both server and client:

```typescript
class PredicateRegistry {
  register(def: PredicateDefinition): void;
  get(functor: string, arity: number): PredicateDefinition | null;
  getByCategory(category: string): PredicateDefinition[];
  getAll(): PredicateDefinition[];
  validate(term: string): ValidationResult;
  suggest(partial: string): PredicateDefinition[];
}
```

### Deliverables
- `shared/prolog/predicate-schema.ts` — Predicate definitions and metadata
- `shared/prolog/predicate-registry.ts` — Registry implementation
- `shared/prolog/core-predicates.pl` — Core predicates as Prolog source
- Updated `core-predicates.json` with full coverage

---

## 4. Phase 3: Rules as Prolog

### Objective
Make Prolog the native representation for rule conditions and effects. JSON conditions/effects become a derived view for backward compatibility.

### Tasks

#### 3.1 Add Prolog Fields to Rule Schema

```typescript
// In shared/schema.ts, extend rule schema:
{
  // Existing fields...
  content: string,
  conditions: any[],
  effects: any[],

  // NEW: Prolog-native fields
  prologCondition: text('prolog_condition'),   // Prolog goal for condition
  prologEffects: text('prolog_effects'),       // Prolog assertions for effects
  prologSource: text('prolog_source'),         // Complete Prolog rule
}
```

#### 3.2 Define Rule Predicate Format

```prolog
% Rule: "No combat in settlements"
rule(no_combat_in_settlement, trigger, 8).  % name, type, priority

rule_condition(no_combat_in_settlement, Goal) :-
  Goal = (
    in_settlement(Player, _Settlement),
    attempting_action(Player, Action),
    action_type(Action, combat)
  ).

rule_effect(no_combat_in_settlement, Effect) :-
  Effect = block_action('Combat is not allowed in settlements').

% Rule: "Guards pursue criminals"
rule(guards_pursue_criminals, trigger, 7).

rule_condition(guards_pursue_criminals, Goal) :-
  Goal = (
    has_status(Person, criminal),
    same_location(Guard, Person),
    occupation(Guard, guard)
  ).

rule_effect(guards_pursue_criminals, Effect) :-
  Effect = (
    set_npc_state(Guard, pursuing, Person),
    add_narrative('The guard spots the criminal and gives chase!')
  ).
```

#### 3.3 Bidirectional Conversion

Create converters between JSON conditions and Prolog:

```typescript
// shared/prolog/rule-converter.ts
class RuleConverter {
  // JSON → Prolog
  conditionsToProlog(conditions: RuleCondition[]): string;
  effectsToProlog(effects: RuleEffect[]): string;

  // Prolog → JSON (for backward compatibility)
  prologToConditions(prolog: string): RuleCondition[];
  prologToEffects(prolog: string): RuleEffect[];
}
```

Example conversions:
```
JSON: { type: "location", location: "settlement" }
  → Prolog: in_settlement(Actor, _)

JSON: { type: "energy", operator: ">=", value: 10 }
  → Prolog: energy(Actor, E), E >= 10

JSON: { type: "action", action: "combat" }
  → Prolog: attempting_action(Actor, A), action_type(A, combat)

JSON: { type: "restrict", action: "combat", message: "No combat here" }
  → Prolog: block_action('No combat here')
```

#### 3.4 Migrate Existing Rules

Write a migration script that:
1. Reads all existing rules from the database
2. Converts `conditions` JSON to `prologCondition`
3. Converts `effects` JSON to `prologEffects`
4. Generates complete `prologSource`
5. Saves back to database
6. Validates round-trip conversion

#### 3.5 Update RulesHub UI

Modify `client/src/components/rules/RulesHub.tsx` to:
- Show Prolog representation alongside JSON view
- Allow editing rules in Prolog directly
- Provide visual predicate builder that generates Prolog
- Validate Prolog syntax in real time
- Show available predicates from `PredicateRegistry`

### Deliverables
- Schema migration for `prologCondition`, `prologEffects`, `prologSource` fields
- `shared/prolog/rule-converter.ts` — Bidirectional conversion
- Migration script for existing rules
- Updated RulesHub with Prolog editing

---

## 5. Phase 4: Actions as Prolog

### Objective
Express action prerequisites, effects, and trigger conditions as Prolog predicates.

### Tasks

#### 4.1 Add Prolog Fields to Action Schema

```typescript
{
  // Existing fields...
  prerequisites: any[],
  effects: any[],
  triggerConditions: any[],

  // NEW: Prolog-native fields
  prologPrerequisites: text('prolog_prerequisites'),
  prologEffects: text('prolog_effects'),
  prologTrigger: text('prolog_trigger'),
}
```

#### 4.2 Define Action Predicate Format

```prolog
% Action: "Trade with Merchant"
action(trade, economic).
action_name(trade, 'Trade with Merchant').
action_energy_cost(trade, 5).
action_cooldown(trade, 30).
action_requires_target(trade, true).
action_target_type(trade, npc).

% Prerequisites as Prolog
can_perform(trade, Actor) :-
  energy(Actor, E), E >= 5,
  near_npc(Actor, Target),
  occupation(Target, merchant),
  \+ has_status(Actor, banned_from_trading),
  relationship(Actor, Target, _, Trust), Trust > 20.

% Effects as Prolog
perform_effect(trade, Actor, Target) :-
  retract(gold(Actor, OldGold)),
  retract(gold(Target, OldTargetGold)),
  % ... trade logic
  assert(gold(Actor, NewGold)),
  assert(gold(Target, NewTargetGold)),
  assert(event(trade_completed, Actor, Target)).

% Trigger conditions (auto-trigger)
should_trigger(trade, Actor) :-
  near_npc(Actor, Target),
  occupation(Target, merchant),
  gold(Actor, G), G > 100,
  needs_item(Actor, ItemType),
  sells(Target, ItemType).
```

#### 4.3 Action Availability Query

The game engine queries Prolog for available actions:
```prolog
?- can_perform(Action, player), action_name(Action, Name).
% Returns all actions the player can currently perform
```

This replaces the current imperative prerequisite checking.

#### 4.4 Create `ActionConverter`

```typescript
class ActionConverter {
  prerequisitesToProlog(prereqs: any[]): string;
  effectsToProlog(effects: ActionEffect[]): string;
  triggerToProlog(triggers: any[]): string;

  prologToPrerequisites(prolog: string): any[];
  prologToEffects(prolog: string): ActionEffect[];
}
```

#### 4.5 Update ActionsHub UI

- Show Prolog prerequisites alongside form-based editor
- Allow raw Prolog editing for prerequisites
- Visual predicate builder for action conditions
- Test action prerequisites against current world state

### Deliverables
- Schema migration for action Prolog fields
- `shared/prolog/action-converter.ts`
- Updated ActionsHub with Prolog editing

---

## 6. Phase 5: Quests as Prolog

### Objective
Express quest availability, objectives, completion criteria, and failure conditions as Prolog predicates.

### Tasks

#### 5.1 Add Prolog Fields to Quest Schema

```typescript
{
  // Existing fields...
  objectives: any[],
  completionCriteria: any,
  prerequisiteQuestIds: string[],
  failureConditions: any,

  // NEW: Prolog-native fields
  prologAvailability: text('prolog_availability'),
  prologObjectives: text('prolog_objectives'),
  prologCompletion: text('prolog_completion'),
  prologFailure: text('prolog_failure'),
}
```

#### 5.2 Define Quest Predicate Format

```prolog
% Quest: "The Herbalist's Request"
quest(fetch_herbs, vocabulary, intermediate).
quest_title(fetch_herbs, 'The Herbalist\'s Request').
quest_giver(fetch_herbs, herbalist_npc).
quest_reward(fetch_herbs, experience, 100).
quest_reward(fetch_herbs, item, healing_potion).
quest_reward(fetch_herbs, gold, 50).

% Availability (prerequisites)
quest_available(fetch_herbs, Player) :-
  completed_quest(Player, meet_herbalist),
  skill_level(Player, herbalism, L), L >= 2,
  \+ completed_quest(Player, fetch_herbs),
  \+ active_quest(Player, fetch_herbs),
  is_alive(herbalist_npc).

% Objectives
quest_objective(fetch_herbs, obj1, 'Collect 5 Moonflowers').
quest_objective(fetch_herbs, obj2, 'Return to the Herbalist').

objective_complete(fetch_herbs, obj1, Player) :-
  has_item(Player, moonflower, Qty), Qty >= 5.

objective_complete(fetch_herbs, obj2, Player) :-
  objective_complete(fetch_herbs, obj1, Player),
  near_npc(Player, herbalist_npc).

% Overall completion
quest_complete(fetch_herbs, Player) :-
  objective_complete(fetch_herbs, obj1, Player),
  objective_complete(fetch_herbs, obj2, Player).

% Failure conditions
quest_failed(fetch_herbs, Player) :-
  \+ is_alive(herbalist_npc).

quest_failed(fetch_herbs, Player) :-
  active_quest(Player, fetch_herbs),
  quest_timer(fetch_herbs, Player, Timer),
  Timer > 7200.  % 2-hour time limit
```

#### 5.3 Quest Chain Logic in Prolog

```prolog
% Quest chain definition
quest_chain(herbalist_chain, [meet_herbalist, fetch_herbs, brew_potion, heal_village]).

next_quest_in_chain(Chain, Current, Next) :-
  quest_chain(Chain, Quests),
  append(_, [Current, Next | _], Quests).

chain_progress(Chain, Player, Progress) :-
  quest_chain(Chain, Quests),
  length(Quests, Total),
  findall(Q, (member(Q, Quests), completed_quest(Player, Q)), Completed),
  length(Completed, Done),
  Progress is Done / Total.
```

#### 5.4 Dynamic Quest Generation via Prolog

Instead of (or alongside) LLM generation, use Prolog to determine feasible quests:

```prolog
% Generate fetch quest from world state
feasible_quest(fetch_quest(Item, NPC, Location), Player) :-
  occupation(NPC, merchant),
  needs_item(NPC, Item),
  item_found_at(Item, Location),
  \+ same_location(Player, Location),
  can_travel_to(Player, Location).

% Generate escort quest from world state
feasible_quest(escort_quest(NPC, Destination), Player) :-
  wants_to_travel(NPC, Destination),
  \+ is_safe_route(NPC, Destination),
  reputation(Player, _, Rep), Rep > 50.
```

#### 5.5 Update QuestsHub UI

- Show Prolog availability conditions
- Allow editing quest prerequisites as Prolog
- Visual objective builder that generates Prolog
- Test quest availability against current world state

### Deliverables
- Schema migration for quest Prolog fields
- `shared/prolog/quest-converter.ts`
- Updated QuestsHub with Prolog editing

---

## 7. Phase 6: Truths as Prolog

### Objective
Make truths (world facts, events, history) queryable as Prolog assertions, not just free-text content.

### Tasks

#### 6.1 Add Predicate Fields to Truth Schema

```typescript
{
  // Existing fields...
  title: string,
  content: string,
  entryType: string,

  // NEW: Prolog-native fields
  prologFacts: text('prolog_facts'),     // Prolog assertions this truth represents
  prologQuery: text('prolog_query'),     // Query that would retrieve this truth
}
```

#### 6.2 Define Truth Predicate Format

```prolog
% Event truth: "John married Jane in 1520"
truth(truth_001, event).
event(marriage, john, jane, 1520).
married(john, jane).
married_year(john, jane, 1520).
witnessed(priest_peter, truth_001).

% Backstory truth: "The ancient sword was forged by elves"
truth(truth_002, backstory).
forged_by(ancient_sword, elves).
item_origin(ancient_sword, elven_forge).
item_age(ancient_sword, 500).

% Prophecy truth: "The chosen one will unite the kingdoms"
truth(truth_003, prophecy).
prophecy(unite_kingdoms, chosen_one).
prophecy_condition(unite_kingdoms, Chosen) :-
  has_status(Chosen, chosen_one),
  controls(Chosen, kingdom_north),
  controls(Chosen, kingdom_south).

% Secret truth (visibility)
truth_visibility(truth_004, private).
knows_truth(old_wizard, truth_004).
can_learn_truth(Player, truth_004) :-
  relationship(Player, old_wizard, friend, Trust),
  Trust > 80.
```

#### 6.3 Automatic Predicate Extraction from Truth Text

When a truth is created with free-text content, attempt to extract predicates:

```typescript
class TruthPredicateExtractor {
  // Pattern-based extraction
  extractFromText(content: string, metadata: TruthMetadata): string[];

  // LLM-assisted extraction (for complex narratives)
  extractWithLLM(content: string, predicateRegistry: PredicateRegistry): Promise<string[]>;
}
```

Example:
- Input: "King Arthur defeated the Dragon of Blackmoor in the Battle of Ashford"
- Output:
  ```prolog
  event(battle, king_arthur, dragon_of_blackmoor, battle_of_ashford).
  defeated(king_arthur, dragon_of_blackmoor).
  battle_location(battle_of_ashford, blackmoor).
  has_status(king_arthur, dragon_slayer).
  dead(dragon_of_blackmoor).
  ```

#### 6.4 Truth Visibility & Knowledge Propagation

```prolog
% Public truths are known by everyone
knows_truth(Anyone, TruthId) :- truth_visibility(TruthId, public).

% Private truths known only by witnesses
knows_truth(Person, TruthId) :-
  truth_visibility(TruthId, private),
  witnessed(Person, TruthId).

% Knowledge can spread
learns_truth(Person, TruthId) :-
  knows_truth(Teller, TruthId),
  same_location(Person, Teller),
  trusts(Person, Teller, Trust), Trust > 50,
  assert(knows_truth(Person, TruthId)).
```

### Deliverables
- Schema migration for truth Prolog fields
- `shared/prolog/truth-converter.ts`
- `shared/prolog/truth-extractor.ts` — Predicate extraction
- Updated truth creation flow

---

## 8. Phase 7: Babylon.js Game Engine Integration

### Objective
Embed a Prolog runtime in the Babylon.js game engine so all gameplay decisions are driven by Prolog queries.

### Tasks

#### 7.1 Create `GamePrologEngine`

```typescript
// client/src/components/3DGame/GamePrologEngine.ts
class GamePrologEngine {
  private runtime: PrologRuntime;

  constructor() {
    this.runtime = new TauPrologRuntime();
  }

  // Initialize from world data
  async initialize(worldData: WorldData, ir?: WorldIR): Promise<void>;

  // World state queries
  async canPerformAction(actionId: string, actorId: string): Promise<boolean>;
  async getAvailableActions(actorId: string): Promise<string[]>;
  async isQuestAvailable(questId: string, playerId: string): Promise<boolean>;
  async getAvailableQuests(playerId: string): Promise<string[]>;
  async checkRuleViolation(actionId: string, context: GameContext): Promise<RuleViolation | null>;
  async getApplicableRules(context: GameContext): Promise<string[]>;

  // NPC queries
  async getNPCDisposition(npcId: string, playerId: string): Promise<number>;
  async getNPCKnowledge(npcId: string): Promise<string[]>;
  async shouldNPCReact(npcId: string, event: string): Promise<boolean>;
  async selectNPCAction(npcId: string): Promise<string>;

  // State mutations
  async assertEvent(event: string): Promise<void>;
  async assertFact(fact: string): Promise<void>;
  async retractFact(fact: string): Promise<void>;

  // Bulk operations
  async queryAll(goal: string): Promise<QueryResult[]>;
}
```

#### 7.2 Replace `RuleEnforcer` with Prolog Queries

Current (imperative):
```typescript
// RuleEnforcer.ts — 395 lines of switch/case logic
canPerformAction(actionId, actionType, context) {
  for (const rule of activeRules) {
    if (rule.ruleType !== 'trigger' && rule.ruleType !== 'volition') continue;
    const applies = this.checkRuleConditions(rule, context);
    if (applies) {
      const restriction = this.findRestriction(rule, actionType);
      if (restriction) return { allowed: false, reason: restriction.message };
    }
  }
  return { allowed: true };
}
```

New (Prolog):
```typescript
// GamePrologEngine.ts — delegates to Prolog
async canPerformAction(actionId: string, actorId: string): Promise<{allowed: boolean; reason?: string}> {
  const results = await this.runtime.query(
    `rule_blocks(RuleName, ${actionId}, ${actorId}, Reason)`
  );
  if (results.length > 0) {
    return { allowed: false, reason: results[0].bindings.Reason };
  }
  return { allowed: true };
}
```

With the Prolog knowledge base containing:
```prolog
rule_blocks(RuleName, Action, Actor, Reason) :-
  rule(RuleName, trigger, _Priority),
  rule_condition(RuleName, Condition),
  call(Condition),
  rule_effect(RuleName, block_action(Reason)).
```

#### 7.3 Integrate with Action Execution

Replace imperative prerequisite checking:
```typescript
// Before: manual checks
if (action.energyCost && playerEnergy < action.energyCost) return false;
if (action.requiresTarget && !targetNPC) return false;

// After: Prolog query
const canDo = await prologEngine.canPerformAction(action.id, 'player');
```

#### 7.4 Integrate with Quest System

```typescript
// BabylonQuestTracker.ts
async getAvailableQuests(): Promise<Quest[]> {
  const questIds = await prologEngine.getAvailableQuests('player');
  return this.quests.filter(q => questIds.includes(q.id));
}

async checkObjectiveCompletion(questId: string): Promise<boolean[]> {
  const results = await prologEngine.queryAll(
    `quest_objective(${questId}, ObjId, _), objective_complete(${questId}, ObjId, player)`
  );
  // ...
}
```

#### 7.5 Bidirectional State Sync

When game state changes, update the Prolog knowledge base:
```typescript
// Player picks up item
prologEngine.assertFact(`has_item(player, ${itemId})`);
prologEngine.assertFact(`item_count(player, ${itemId}, ${count})`);

// NPC dies
prologEngine.retractFact(`alive(${npcId})`);
prologEngine.assertFact(`dead(${npcId})`);
prologEngine.assertFact(`event(death, ${npcId}, ${timestamp})`);

// Quest completed
prologEngine.assertFact(`completed_quest(player, ${questId})`);
prologEngine.retractFact(`active_quest(player, ${questId})`);
```

#### 7.6 Performance Considerations

- **Query caching**: Cache frequently-queried results (action availability, quest status)
- **Incremental updates**: Only re-query when relevant facts change
- **Frame budget**: Limit Prolog queries to 2ms per frame (batch across frames)
- **Lazy evaluation**: Query quest status only when quest UI is opened
- **Background loading**: Load knowledge base async during scene loading

### Deliverables
- `client/src/components/3DGame/GamePrologEngine.ts`
- Refactored `RuleEnforcer.ts` to use Prolog
- Integrated action/quest checking via Prolog
- Bidirectional state sync system
- Performance benchmarks and caching layer

---

## 9. Phase 8: NPC Intelligence via Prolog

### Objective
Make NPC behavior driven by their knowledge, beliefs, and relationships as represented in the Prolog knowledge base.

### Tasks

#### 8.1 NPC Decision Making

Replace the simple state machine with Prolog-driven decisions:

```prolog
% NPC decides what to do
npc_decision(NPC, Action) :-
  npc_goal(NPC, Goal),
  action_achieves(Action, Goal),
  can_perform(Action, NPC),
  \+ conflicting_goal(NPC, Action).

% NPC goals from personality and state
npc_goal(NPC, seek_food) :-
  energy(NPC, E), E < 30.

npc_goal(NPC, socialize) :-
  personality(NPC, extroversion, V), V > 0.3,
  energy(NPC, E), E > 50.

npc_goal(NPC, earn_money) :-
  gold(NPC, G), G < 10,
  occupation(NPC, _Occ).

npc_goal(NPC, pursue(Criminal)) :-
  occupation(NPC, guard),
  has_status(Criminal, criminal),
  same_location(NPC, Criminal).
```

#### 8.2 Knowledge-Based NPC Dialogue

NPCs should only discuss things they know:
```prolog
% NPC can discuss a topic
can_discuss(NPC, Topic) :-
  knows(NPC, Topic).

% NPC can give quest if conditions met
can_give_quest(NPC, QuestId) :-
  quest_giver(QuestId, NPC),
  is_alive(NPC),
  \+ quest_already_given(QuestId).

% NPC greeting based on relationship
npc_greeting(NPC, Player, 'Welcome, friend!') :-
  relationship(NPC, Player, friend, Trust), Trust > 70.

npc_greeting(NPC, Player, 'What do you want?') :-
  relationship(NPC, Player, _, Trust), Trust < 30.

npc_greeting(NPC, Player, 'Hello, stranger.') :-
  \+ relationship(NPC, Player, _, _).
```

#### 8.3 NPC Reactions to Events

```prolog
% NPC reacts to nearby events
npc_reacts_to(NPC, event(combat, Attacker, Victim)) :-
  same_location(NPC, Attacker),
  occupation(NPC, guard),
  assert(npc_state(NPC, pursuing, Attacker)).

npc_reacts_to(NPC, event(theft, Thief, Victim)) :-
  same_location(NPC, Thief),
  witnessed(NPC, event(theft, Thief, Victim)),
  assert(knows(NPC, criminal(Thief))),
  (occupation(NPC, guard) ->
    assert(npc_state(NPC, pursuing, Thief))
  ;
    assert(npc_state(NPC, fleeing, Thief))
  ).
```

#### 8.4 NPC Schedule Integration

```prolog
% NPC schedule as Prolog
schedule(blacksmith_john, morning, working, smithy).
schedule(blacksmith_john, afternoon, working, smithy).
schedule(blacksmith_john, evening, socializing, tavern).
schedule(blacksmith_john, night, sleeping, home).

current_activity(NPC, Activity, Location) :-
  current_time(_, _, _, DayPart),
  schedule(NPC, DayPart, Activity, Location).
```

### Deliverables
- Prolog-driven NPC decision engine
- Knowledge-based dialogue topic selection
- Event reaction system
- Schedule-based NPC behavior

---

## 10. Phase 9: Game Export Integration

### Objective
Include the Prolog knowledge base and a Prolog runtime in every exported game (Babylon.js, Godot, Unity, Unreal).

### Tasks

#### 9.1 Add Knowledge Base to IR

```typescript
// shared/game-engine/ir-types.ts
interface SystemsIR {
  // Existing...
  rules: RuleIR[];
  actions: ActionIR[];
  quests: QuestIR[];
  truths: TruthIR[];

  // NEW
  knowledgeBase: KnowledgeBaseIR;
}

interface KnowledgeBaseIR {
  /** Complete Prolog program (facts + rules) */
  program: string;
  /** Individual fact groups for selective loading */
  factGroups: {
    world: string;
    characters: string;
    relationships: string;
    locations: string;
    businesses: string;
    knowledge: string;
    rules: string;
    actions: string;
    quests: string;
    truths: string;
    helperRules: string;
  };
  /** Predicate registry for runtime validation */
  predicateRegistry: PredicateDefinition[];
}
```

#### 9.2 Export Knowledge Base

In `ir-generator.ts`, add knowledge base generation:
```typescript
async generateKnowledgeBase(worldId: string): Promise<KnowledgeBaseIR> {
  // Sync world to Prolog
  const syncService = new PrologSyncService();
  await syncService.syncWorld(worldId);

  // Also generate predicates for rules, actions, quests
  const rulePredicates = this.generateRulePredicates(worldRules);
  const actionPredicates = this.generateActionPredicates(worldActions);
  const questPredicates = this.generateQuestPredicates(worldQuests);
  const truthPredicates = this.generateTruthPredicates(worldTruths);

  // Combine into complete program
  return {
    program: [worldFacts, rulePredicates, actionPredicates, questPredicates, truthPredicates, helperRules].join('\n'),
    factGroups: { ... },
    predicateRegistry: this.registry.getAll()
  };
}
```

#### 9.3 Babylon.js Export

- Include `tau-prolog` in exported `package.json`
- Export `knowledge_base.pl` as data file
- Export `GamePrologEngine.ts` with game code
- `FileDataSource` loads knowledge base on init

#### 9.4 Godot Export

Generate a GDScript Prolog evaluator or bundle a Prolog library:

**Option A: GDScript Prolog Interpreter**
- Implement a minimal Prolog interpreter in GDScript
- Supports fact matching, unification, backtracking
- Loads `.pl` file at runtime

**Option B: GDNative/GDExtension**
- Compile tau-prolog or trealla to native via wasm2c
- Expose as GDExtension
- Full Prolog support

**Option C: Transpile to GDScript**
- Convert Prolog rules to equivalent GDScript functions
- Each predicate becomes a GDScript method
- Loses generality but gains performance

**Recommended:** Option A for correctness, with Option C as optimization for hot paths.

#### 9.5 Unity Export

**Option A: C# Prolog Interpreter**
- Use or port a C# Prolog library (e.g., C#Prolog, Prolog.NET)
- Load `.pl` file at runtime

**Option B: Transpile to C#**
- Convert predicates to C# LINQ queries
- Each rule becomes a method

#### 9.6 Unreal Export

**Option A: C++ Prolog Library**
- Embed SWI-Prolog C API
- Or use a lightweight C++ Prolog (e.g., ichiban-prolog compiled to C++)

**Option B: Blueprint Nodes**
- Generate Blueprint-compatible query nodes
- Each predicate becomes a Blueprint function

### Deliverables
- IR extension with `KnowledgeBaseIR`
- Updated exporters for all 4 engines
- Per-engine Prolog runtime strategy
- Integration tests for exported games

---

## 11. Phase 10: TotT Systems Migration

### Objective
Migrate the 25 TotT social simulation systems to use Prolog for their core logic, keeping TypeScript as orchestration.

### Tasks

#### 10.1 Identify Migration Candidates

| System | Prolog Suitability | Priority |
|--------|--------------------|----------|
| `hiring-system.ts` | High — candidate matching is unification | P1 |
| `social-dynamics-system.ts` | High — relationship rules | P1 |
| `knowledge-system.ts` | High — already has Prolog sync | P1 |
| `lifecycle-system.ts` | High — marriage/birth/death rules | P1 |
| `personality-behavior-system.ts` | High — trait-based decisions | P2 |
| `autonomous-behavior-system.ts` | High — volition selection | P2 |
| `economics-system.ts` | Medium — some numeric, some rule-based | P2 |
| `drama-recognition-system.ts` | High — pattern matching | P2 |
| `conversation-system.ts` | Medium — topic selection is Prolog, generation is LLM | P3 |
| `event-system.ts` | Medium — event triggering | P3 |
| `routine-system.ts` | Medium — schedule matching | P3 |
| `building-commission-system.ts` | Low — mostly CRUD | P4 |
| `town-events-system.ts` | Medium — event conditions | P3 |
| `appearance-system.ts` | Low — visual generation | P4 |
| `name-system.ts` | Low — name generation | P4 |

#### 10.2 Migration Pattern

For each system:
1. Express core decision logic as Prolog rules
2. Keep TypeScript for database I/O, API responses, and orchestration
3. Replace imperative condition checks with Prolog queries
4. Test against existing behavior

Example — `hiring-system.ts`:

**Before (TypeScript):**
```typescript
findCandidates(job: Job): Character[] {
  return characters.filter(c =>
    c.skills[job.requiredSkill] >= job.minLevel &&
    c.isAlive && !c.currentOccupation &&
    c.age >= 16
  );
}
```

**After (Prolog):**
```prolog
qualified_for(Person, Job) :-
  alive(Person),
  \+ occupation(Person, _),
  age(Person, Age), Age >= 16,
  job_requires_skill(Job, Skill, MinLevel),
  skill_level(Person, Skill, Level),
  Level >= MinLevel.
```

**TypeScript orchestration:**
```typescript
async findCandidates(jobId: string): Promise<Character[]> {
  const results = await prolog.queryAll(`qualified_for(Person, ${jobId})`);
  return results.map(r => this.getCharacter(r.bindings.Person));
}
```

### Deliverables
- Prolog rules for P1 systems (hiring, social dynamics, knowledge, lifecycle)
- Refactored TypeScript orchestration
- Regression tests ensuring behavioral equivalence

---

## 12. Phase 11: Authoring UI Integration

### Objective
Make the authoring UI produce Prolog predicates naturally, with visual editors that generate Prolog behind the scenes.

### Tasks

#### 11.1 Visual Predicate Builder Component

Create a React component for building Prolog predicates visually:

```tsx
<PredicateBuilder
  availablePredicates={registry.getAll()}
  onPredicateChange={(prolog: string) => ...}
  initialValue="can_perform(trade, Actor)"
/>
```

Features:
- Dropdown for predicate selection (from registry)
- Auto-complete for predicate names
- Variable binding visualization
- Conjunction (AND) / disjunction (OR) / negation (NOT) operators
- Nested predicate support
- Live Prolog syntax preview
- "Test against world" button

#### 11.2 Integrated Rule Editor

Enhance RulesHub with:
- Split view: Visual builder | Prolog code
- Synced editing (visual changes update Prolog, and vice versa)
- Syntax highlighting for Prolog
- Error markers with fix suggestions
- Predicate auto-complete (Ctrl+Space)

#### 11.3 Integrated Action Editor

Enhance ActionsHub with:
- Prerequisite builder using visual predicates
- Effect builder with predicate assertions
- "Test prerequisites" against current world state

#### 11.4 Integrated Quest Editor

Enhance QuestsHub with:
- Availability condition builder
- Objective completion builder
- "Simulate quest" to test all conditions

#### 11.5 Knowledge Base Explorer

Enhance PrologKnowledgeBase component:
- Graph visualization of relationships (nodes = entities, edges = predicates)
- Time-travel through simulation history
- "What if" query mode (temporarily assert facts and see consequences)
- Export knowledge base as documentation

### Deliverables
- `<PredicateBuilder>` React component
- Updated RulesHub, ActionsHub, QuestsHub
- Enhanced PrologKnowledgeBase with graph view

---

## 13. Phase 12: LLM Cost Reduction

### Objective
Systematically replace LLM calls with Prolog queries for deterministic decisions.

### Tasks

#### 12.1 Audit Current LLM Usage

For each LLM call:
1. Is the decision deterministic? → Move to Prolog
2. Does it require creativity? → Keep LLM, but constrain with Prolog context
3. Is it a hybrid? → Prolog determines "what", LLM generates "how"

#### 12.2 Replace Deterministic LLM Calls

| Current LLM Call | Prolog Replacement |
|------------------|--------------------|
| "What quest should this NPC give?" | `quest_available(QuestId, Player), quest_giver(QuestId, NPC)` |
| "What action should this NPC take?" | `best_action(NPC, Action)` |
| "Is this character eligible for promotion?" | `qualified_for_promotion(Char, Job)` |
| "Who should attend this event?" | `should_attend(Char, Event)` |
| "What topics can these NPCs discuss?" | `topic_relevant(Topic, NPC1, NPC2)` |

#### 12.3 Prolog-Constrained LLM Calls

For calls that need LLM creativity but can be constrained:

```typescript
// Before: LLM decides everything
const response = await gemini.generate("Generate a quest for the player in this medieval world");

// After: Prolog determines parameters, LLM generates content
const feasibleQuests = await prolog.queryAll('feasible_quest(Type, Player)');
const questParams = feasibleQuests[0]; // { type: fetch, item: herbs, npc: herbalist }

const response = await gemini.generate(
  `Generate quest dialogue for a ${questParams.type} quest where ${questParams.npc} asks ` +
  `the player to find ${questParams.item}. The NPC's personality is ${npcPersonality}.`
);
```

#### 12.4 Measure Cost Reduction

Track:
- Number of LLM calls before/after each migration
- Token usage before/after
- Response quality comparison
- Latency improvement (Prolog queries: <5ms vs LLM calls: 500ms-5s)

### Deliverables
- LLM usage audit document
- Migrated deterministic calls
- Prolog-constrained LLM call patterns
- Cost reduction metrics dashboard

---

## 14. Phase 13: Advanced Prolog Features

### Objective
Leverage advanced Prolog capabilities for sophisticated world simulation.

### Tasks

#### 13.1 Constraint Logic Programming (CLP)

Use CLP for economic simulation and resource optimization:
```prolog
:- use_module(library(clpfd)).

% Optimal trade route
optimal_trade(Merchant, Route, Profit) :-
  findall(Town, settlement(Town), Towns),
  permutation(Towns, Route),
  calculate_profit(Merchant, Route, Profit),
  Profit #> 0,
  labeling([max(Profit)], [Profit]).

% Resource allocation
allocate_workers(Settlement, Allocation) :-
  findall(Worker, (person(Worker), at_location(Worker, Settlement)), Workers),
  findall(Job, business_vacancy(Settlement, Job), Jobs),
  length(Workers, NW), length(Jobs, NJ),
  NW #>= NJ,
  ...
```

#### 13.2 Temporal Reasoning

```prolog
% Event ordering
before(EventA, EventB) :-
  event_time(EventA, TA),
  event_time(EventB, TB),
  TA < TB.

% Duration tracking
lasted(Event, Duration) :-
  event_start(Event, Start),
  event_end(Event, End),
  Duration is End - Start.

% Recurring events
next_occurrence(Festival, Year) :-
  festival_frequency(Festival, annual),
  current_time(_, CurrentYear, _, _),
  Year is CurrentYear + 1.
```

#### 13.3 Abductive Reasoning

NPCs can form hypotheses about unknown facts:
```prolog
% NPC reasons about missing person
hypothesize(NPC, dead(Person)) :-
  last_seen(Person, Location, Time),
  current_time(_, Now, _, _),
  Elapsed is Now - Time,
  Elapsed > 365,
  dangerous(Location).

hypothesize(NPC, fled(Person)) :-
  has_status(Person, wanted),
  \+ at_location(Person, _).
```

#### 13.4 Meta-Programming for Dynamic Rules

```prolog
% Rules that generate other rules
generate_trade_rule(Settlement) :-
  settlement_type(Settlement, port),
  assert((
    can_trade_overseas(Merchant, Settlement) :-
      at_location(Merchant, Settlement),
      occupation(Merchant, merchant),
      gold(Merchant, G), G > 100
  )).
```

### Deliverables
- CLP module for economics
- Temporal reasoning module
- Abductive reasoning for NPC hypotheses
- Meta-programming examples

---

## 15. Architecture Diagrams

### Target Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INSIMUL PLATFORM                             │
│                                                                     │
│  ┌──────────────┐    ┌─────────────────┐    ┌───────────────────┐  │
│  │  Authoring UI │    │  Prolog Runtime  │    │   Database (Mongo) │  │
│  │              │    │  (tau-prolog)    │    │                   │  │
│  │  Rules Hub   │◄──►│                 │◄──►│  Characters       │  │
│  │  Actions Hub │    │  ┌─────────────┐│    │  Rules            │  │
│  │  Quests Hub  │    │  │ Knowledge   ││    │  Actions          │  │
│  │  Truths Hub  │    │  │ Base (.pl)  ││    │  Quests           │  │
│  │  Predicate   │    │  │             ││    │  Truths           │  │
│  │  Builder     │    │  │ Facts       ││    │  Grammars         │  │
│  └──────┬───────┘    │  │ Rules       ││    │  Locations        │  │
│         │            │  │ Queries     ││    └───────────────────┘  │
│         │            │  └─────────────┘│                           │
│         │            └────────┬────────┘                           │
│         │                     │                                    │
│         ▼                     ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    GAME ENGINE LAYER                         │   │
│  │                                                             │   │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ GamePrologEngine │  │ Rule Engine   │  │ NPC AI       │  │   │
│  │  │ (tau-prolog)     │  │ (Prolog-based)│  │ (Prolog-     │  │   │
│  │  │                  │  │              │  │  driven)      │  │   │
│  │  │ - Query world    │  │ - Evaluate   │  │ - Decisions   │  │   │
│  │  │ - Assert facts   │  │   conditions │  │ - Knowledge   │  │   │
│  │  │ - Check rules    │  │ - Apply      │  │ - Reactions   │  │   │
│  │  │ - NPC reasoning  │  │   effects    │  │ - Dialogue    │  │   │
│  │  └────────┬─────────┘  └──────────────┘  └──────────────┘  │   │
│  │           │                                                 │   │
│  │  ┌────────▼─────────────────────────────────────────────┐   │   │
│  │  │              Babylon.js / Game Runtime                │   │   │
│  │  │                                                      │   │   │
│  │  │  Rendering │ Physics │ Audio │ Input │ UI │ Combat   │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    EXPORT PIPELINE                          │   │
│  │                                                             │   │
│  │  WorldIR + KnowledgeBaseIR                                  │   │
│  │       │                                                     │   │
│  │       ├──► Babylon.js Export (tau-prolog + .pl)             │   │
│  │       ├──► Godot Export (GDScript Prolog + .pl)             │   │
│  │       ├──► Unity Export (C# Prolog + .pl)                   │   │
│  │       └──► Unreal Export (C++ Prolog + .pl)                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
                    AUTHORING
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
       Rules Hub  Actions Hub  Quests Hub
            │          │          │
            ▼          ▼          ▼
    ┌───────────────────────────────────┐
    │   Visual Predicate Builder        │
    │   generates Prolog predicates     │
    └───────────────┬───────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────┐
    │   Database (JSON + Prolog fields) │
    │   rules.prologSource              │
    │   actions.prologPrerequisites     │
    │   quests.prologAvailability       │
    │   truths.prologFacts              │
    └───────────────┬───────────────────┘
                    │
         ┌──────────┼──────────┐
         ▼                     ▼
    ┌──────────┐         ┌──────────────┐
    │ Insimul  │         │ Export       │
    │ Web App  │         │ Pipeline    │
    └────┬─────┘         └──────┬───────┘
         │                      │
         ▼                      ▼
    ┌──────────┐         ┌──────────────┐
    │tau-prolog│         │ knowledge    │
    │(browser) │         │ _base.pl     │
    └────┬─────┘         │ + engine     │
         │               └──────┬───────┘
         ▼                      ▼
    ┌──────────┐         ┌──────────────┐
    │ Babylon  │         │ Exported     │
    │ Game     │         │ Game         │
    │          │         │ (any engine) │
    │ Queries: │         │              │
    │ ?-can_do │         │ Same queries │
    │ ?-quest  │         │ Same KB      │
    │ ?-npc_ai │         │ Same logic   │
    └──────────┘         └──────────────┘
```

---

## 16. Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **tau-prolog performance** | Medium | High | Benchmark early (Phase 1); fall back to WASM SWI-Prolog if needed; cache query results |
| **tau-prolog ISO gaps** | Low | Medium | Test all predicates early; implement missing builtins as needed |
| **Bundle size increase** | Low | Low | tau-prolog is ~200KB; tree-shake unused modules |
| **Migration breaks existing rules** | Medium | High | Keep JSON conditions as fallback; run both systems in parallel during migration |
| **GDScript/C#/C++ Prolog performance** | Medium | Medium | Transpile hot-path predicates to native code; keep Prolog for cold paths |
| **Complex Prolog debugging** | Medium | Medium | Build Prolog debugger into authoring UI; trace query execution |
| **User learning curve** | Medium | Low | Visual predicate builder hides Prolog syntax; advanced users can write raw Prolog |

### Migration Risks

| Risk | Mitigation |
|------|------------|
| **Existing rules break** | Bidirectional converters (Phase 3); keep JSON as secondary representation |
| **Database migration failures** | Run migrations in dry-run mode first; keep backups |
| **Performance regression** | Performance tests at each phase; cache aggressively |
| **Export compatibility** | Drift detection (already in place); integration tests for all 4 engines |

---

## 17. Success Metrics

### Phase 1 (Portable Engine)
- tau-prolog passes all existing Prolog tests
- Query latency <5ms for typical gameplay queries
- Bundle size increase <300KB

### Phase 2-6 (Predicate-First Data Model)
- 100% of rules have `prologSource` field populated
- 100% of actions have `prologPrerequisites` field populated
- 100% of quests have `prologAvailability` field populated
- Bidirectional conversion achieves 100% round-trip fidelity

### Phase 7 (Babylon.js Integration)
- `RuleEnforcer` fully replaced by Prolog queries
- All action availability checks via Prolog
- All quest availability checks via Prolog
- Frame time impact <2ms from Prolog queries

### Phase 8 (NPC Intelligence)
- NPC decisions driven by personality + knowledge predicates
- NPCs react to events based on knowledge base
- NPC dialogue topics filtered by `knows/2` predicates

### Phase 9 (Exports)
- All 4 export engines include knowledge base
- Exported games produce identical behavior to Insimul web preview
- Export drift detection covers Prolog-based decisions

### Phase 10 (TotT Migration)
- P1 TotT systems (hiring, social dynamics, knowledge, lifecycle) use Prolog
- Behavioral regression tests pass at 100%

### Phase 12 (LLM Cost Reduction)
- 50%+ reduction in LLM API calls for deterministic decisions
- Latency improvement: deterministic decisions <5ms (vs 500ms-5s for LLM)
- No quality regression in generated content

---

## Phase Sequencing Summary

```
Phase 1:  Portable Prolog Engine         ─── Foundation (no dependencies)
Phase 2:  Predicate-First Data Model     ─── Foundation (depends on Phase 1)
Phase 3:  Rules as Prolog                ─── Core (depends on Phase 2)
Phase 4:  Actions as Prolog              ─── Core (depends on Phase 2)
Phase 5:  Quests as Prolog               ─── Core (depends on Phase 2)
Phase 6:  Truths as Prolog               ─── Core (depends on Phase 2)
Phase 7:  Babylon.js Integration         ─── Game (depends on Phases 1, 3-6)
Phase 8:  NPC Intelligence               ─── Game (depends on Phase 7)
Phase 9:  Game Export Integration        ─── Export (depends on Phases 1, 7)
Phase 10: TotT Systems Migration         ─── Server (depends on Phases 1, 2)
Phase 11: Authoring UI Integration       ─── UI (depends on Phases 3-6)
Phase 12: LLM Cost Reduction             ─── Optimization (depends on Phases 7, 10)
Phase 13: Advanced Prolog Features       ─── Research (depends on Phase 7)
```

Phases 3-6 can be parallelized. Phases 7 and 10 can be parallelized. Phase 11 can begin as soon as any of 3-6 complete.
