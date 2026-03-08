# Prolog Integration Analysis: Complete System Audit

> Date: 2026-03-07
> Scope: Full-stack analysis of Prolog predicate usage across authoring platform, Babylon.js game, and exported game engines

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Prolog Infrastructure](#2-current-prolog-infrastructure)
3. [Server-Side Prolog Integration](#3-server-side-prolog-integration)
4. [Client-Side Prolog UI](#4-client-side-prolog-ui)
5. [Predicate Coverage Audit](#5-predicate-coverage-audit)
6. [Rules System & Prolog](#6-rules-system--prolog)
7. [Actions System & Prolog](#7-actions-system--prolog)
8. [Quests System & Prolog](#8-quests-system--prolog)
9. [Truths System & Prolog](#9-truths-system--prolog)
10. [Babylon.js Game Engine & Prolog](#10-babylonjs-game-engine--prolog)
11. [Game Exports & Prolog](#11-game-exports--prolog)
12. [TotT Social Simulation & Prolog](#12-tott-social-simulation--prolog)
13. [AI/LLM Integration Points](#13-aillm-integration-points)
14. [Gap Analysis](#14-gap-analysis)
15. [Summary of Findings](#15-summary-of-findings)

---

## 1. Executive Summary

Insimul has a functional Prolog integration built around SWI-Prolog that synchronizes world data (characters, relationships, locations, businesses, knowledge/beliefs) into a `.pl` knowledge base file. The system provides 9 REST API endpoints, a React UI component, and auto-sync before simulation execution. However, **Prolog is currently used almost exclusively as a server-side query tool** — its predicates do not flow into the Babylon.js game engine, the exported games, or the real-time gameplay loop. The game engine uses a separate, JavaScript-based `RuleEnforcer` and `ActionManager` with JSON condition/effect objects that have no connection to Prolog predicates.

**Key finding:** There is a significant architectural gap between the Prolog knowledge base (server-side, SWI-Prolog via CLI) and the game runtime (client-side, JavaScript/TypeScript). Rules, quests, actions, and truths are all defined and stored as JSON structures with ad-hoc condition types, not as Prolog predicates. The Prolog system is an "overlay" that mirrors database state but does not drive gameplay decisions.

---

## 2. Current Prolog Infrastructure

### 2.1 Engine & Runtime

| Component | Details |
|-----------|---------|
| **Prolog Engine** | SWI-Prolog 8.x+ (external dependency, not bundled) |
| **Execution Model** | Shell out via `execSync('swipl -q -f "{tempFile}"')` |
| **Knowledge Base Files** | `knowledge_base_{worldId}.pl` (one per world, stored at project root) |
| **Availability Check** | `swipl --version` command |

**Files:**
- `server/engines/prolog/prolog-engine.ts` — Availability checker (19 lines)
- `server/engines/prolog/prolog-manager.ts` — CRUD operations, query execution, syntax validation (338 lines)
- `server/engines/prolog/prolog-sync.ts` — Database-to-Prolog synchronization (494 lines)

### 2.2 Execution Characteristics

- **Synchronous**: Uses `execSync`, blocks the Node.js event loop during queries
- **File-based**: Writes `.pl` files to disk, reads results from stdout
- **Stateless per query**: Each query spawns a new `swipl` process
- **No persistent Prolog session**: No socket/IPC connection to a running Prolog engine

### 2.3 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/prolog/facts` | GET | Retrieve all facts |
| `/api/prolog/facts` | POST | Add a single fact |
| `/api/prolog/rules` | POST | Add a Prolog rule |
| `/api/prolog/query` | POST | Execute a Prolog query |
| `/api/prolog/clear` | POST | Clear knowledge base |
| `/api/prolog/save` | POST | Save to `.pl` file |
| `/api/prolog/load` | POST | Load from `.pl` file |
| `/api/prolog/export` | GET | Download `.pl` file |
| `/api/prolog/import` | POST | Import from string |
| `/api/prolog/sync` | POST | Sync world data from DB |

All endpoints accept `worldId` parameter for per-world isolation.

---

## 3. Server-Side Prolog Integration

### 3.1 PrologSyncService (`prolog-sync.ts`)

Converts Insimul entities into Prolog facts via 7 sync phases:

**Phase 1 — Characters:**
```prolog
person(john_smith_abc123).
first_name(john_smith_abc123, 'John').
last_name(john_smith_abc123, 'Smith').
gender(john_smith_abc123, male).
birth_year(john_smith_abc123, 1990).
age(john_smith_abc123, 35).
alive(john_smith_abc123).
occupation(john_smith_abc123, blacksmith).
at_location(john_smith_abc123, castle).
```

**Phase 2 — Relationships:**
```prolog
married_to(john_smith_abc123, jane_doe_def456).
spouse_of(john_smith_abc123, jane_doe_def456).
parent_of(john_smith_abc123, mary_smith_ghi789).
child_of(mary_smith_ghi789, john_smith_abc123).
friend_of(john_smith_abc123, bob_jones_jkl012).
```

**Phase 3 — Locations:**
```prolog
settlement(village_square_abc).
settlement_name(village_square_abc, 'Village Square').
settlement_type(village_square_abc, village).
population(village_square_abc, 200).
```

**Phase 4 — Businesses:**
```prolog
business(smithy_abc).
owns(john_smith_abc123, smithy_abc).
business_owner(smithy_abc, john_smith_abc123).
business_type(smithy_abc, blacksmith).
```

**Phase 5 — Items:**
```prolog
has_item(john_smith_abc123, sword_abc).
item_name(sword_abc, 'Iron Sword').
item_type(sword_abc, weapon).
item_value(sword_abc, 50).
```

**Phase 6 — Knowledge & Beliefs:**
```prolog
has_mental_model(john_smith_abc123, jane_doe_def456).
mental_model_confidence(john_smith_abc123, jane_doe_def456, 0.8).
knows(john_smith_abc123, 'secret_passage').
knows_value(john_smith_abc123, 'favorite_color', 'blue').
believes(john_smith_abc123, 'the_king_is_just', 0.9).
evidence(john_smith_abc123, 'the_king_is_just', testimony, 0.7, 1500).
```

**Phase 7 — Auto-Generated Helper Rules:**
```prolog
sibling_of(X, Y) :- parent_of(Z, X), parent_of(Z, Y), X \= Y.
grandparent_of(X, Z) :- parent_of(X, Y), parent_of(Y, Z).
ancestor_of(X, Y) :- parent_of(X, Y).
ancestor_of(X, Y) :- parent_of(X, Z), ancestor_of(Z, Y).
unmarried(X) :- person(X), \+ married_to(X, _).
adult(X) :- person(X), age(X, A), A >= 18.
child(X) :- person(X), age(X, A), A < 18.
same_location(X, Y) :- at_location(X, L), at_location(Y, L), X \= Y.
can_share_knowledge(X, Y) :- same_location(X, Y), has_mental_model(X, Y).
strong_belief(X, B) :- believes(X, B, C), C >= 0.7.
weak_belief(X, B) :- believes(X, B, C), C < 0.4.
can_overhear(X, Y) :- same_location(X, Y), X \= Y.
```

### 3.2 Unified Simulation Engine (`unified-engine.ts`)

- Calls `syncWorldToProlog()` during `initializeContext()`
- Caches sync status in `prologSynced: Set<string>` to avoid redundant syncs
- Converts Insimul rule format to Prolog for condition evaluation
- Auto-syncs before each simulation execution

### 3.3 Atom Sanitization

All entity names are converted to valid Prolog atoms:
```typescript
sanitizeAtom(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    .replace(/^([0-9])/, '_$1').replace(/_+/g, '_');
}
```

This means the Prolog knowledge base uses sanitized names with MongoDB ObjectId suffixes, not the original entity IDs — creating a naming translation layer that must be maintained.

---

## 4. Client-Side Prolog UI

### 4.1 PrologKnowledgeBase Component (`PrologKnowledgeBase.tsx`)

A 536-line React component providing:
- **Fact/Rule Input**: Text fields to add individual facts or rules
- **Query Execution**: Input field + execute button, results displayed in a panel
- **Sync Button**: "Sync from DB" triggers `/api/prolog/sync`
- **Fact Browser**: Lists all facts with Rule/Fact badges, filtering
- **Export/Import**: Download `.pl` file or import from text
- **Documentation**: Accordion with query examples and predicate reference

**Current Limitations:**
- Purely a management/debugging tool — not integrated into the authoring workflow
- Cannot define rules/quests/actions as Prolog predicates
- No visual predicate builder
- No connection to game preview or testing

---

## 5. Predicate Coverage Audit

### 5.1 Core Predicates (`server/schema/core-predicates.json`)

The system defines a canonical set of predicates organized by category:

| Category | Predicates | Coverage |
|----------|-----------|----------|
| **Entity Types** | `Character/1`, `Person/1`, `Noble/1` | Synced via PrologSyncService |
| **Properties** | `age/2`, `gender/2`, `occupation/2`, `has_status/2`, `wealth/2` | Partially synced (wealth not synced) |
| **States** | `alive/1`, `dead/1`, `fertile/1` | `alive` synced, others not |
| **Events** | `dies/1`, `meets/2` | Not synced — no event predicates generated |
| **Relationships** | `parent_of/2`, `sibling_of/2`, `married/2`, `friendship/3`, `rivalry/3`, `in_love/2` | Partially synced (friendship/rivalry arity mismatch) |
| **Location** | `at_location/2`, `owns/2` | Synced |
| **Utility** | `random_chance/1` | Not synced — no utility predicates |

### 5.2 Predicate Discovery Service (`predicate-discovery.ts`)

- Auto-discovers predicates from rule content (scans for `predicate_name(args)` patterns)
- Maintains `discovered-predicates.json` alongside `core-predicates.json`
- Tracks: usage count, confidence level, examples, discovery sources

### 5.3 Predicate Validator (`predicate-validator.ts`)

- **Permissive mode (default)**: Never blocks, provides suggestions
- **Strict mode**: Validates against known schema
- Levenshtein distance for spell checking
- Arity mismatch warnings

### 5.4 What's NOT Represented as Predicates

The following game concepts exist in the system but have **no Prolog predicate representation**:

| Concept | Current Storage | Prolog Gap |
|---------|----------------|------------|
| **Rule conditions** | JSON `{type, property, operator, value}` | Not Prolog predicates |
| **Rule effects** | JSON `{type, action, value, message}` | Not Prolog predicates |
| **Action prerequisites** | JSON arrays | Not Prolog predicates |
| **Action effects** | JSON `ActionEffect[]` | Not Prolog predicates |
| **Quest objectives** | JSON arrays | Not Prolog predicates |
| **Quest completion criteria** | JSON objects | Not Prolog predicates |
| **Quest prerequisites** | `prerequisiteQuestIds[]` | Not Prolog predicates |
| **Country laws** | JSON arrays | Not Prolog predicates |
| **Country alliances/enemies** | String arrays | Not Prolog predicates |
| **Character skills** | `Record<string, number>` | Not Prolog predicates |
| **Character personality** | Big Five numbers | Not Prolog predicates |
| **Economic data** | Various JSON fields | Not Prolog predicates |
| **Combat stats** | TypeScript interfaces | Not Prolog predicates |
| **Survival needs** | TypeScript interfaces | Not Prolog predicates |

---

## 6. Rules System & Prolog

### 6.1 Rule Storage (Database Schema)

Rules are stored in the `rules` table with:
```typescript
{
  id, worldId, name, description,
  content: string,              // Rule code in Insimul format
  sourceFormat: 'insimul' | 'ensemble' | 'kismet' | 'tott',
  ruleType: 'trigger' | 'volition' | 'trait' | 'default' | 'pattern',
  priority: number,
  likelihood: number,
  isActive: boolean,
  conditions: any[],            // JSON condition objects
  effects: any[],               // JSON effect objects
  parsedContent: any,           // Parsed rule structure
  category, tags, dependencies
}
```

### 6.2 Rule Conditions (JSON Format — NOT Prolog)

The `RuleCondition` interface uses a proprietary JSON format:
```typescript
interface RuleCondition {
  type: 'location' | 'zone' | 'action' | 'energy' | 'proximity' | 'tag';
  property?: string;
  operator?: '>' | '>=' | '<' | '<=' | '==';
  value?: any;
  action?: string;
  location?: 'settlement' | 'wilderness';
  zone?: 'safe' | 'settlement' | 'combat' | 'wilderness';
}
```

These are **not Prolog predicates**. They are evaluated by JavaScript switch statements in `RuleEnforcer.evaluateCondition()`.

### 6.3 Rule Effects (JSON Format — NOT Prolog)

```typescript
interface RuleEffect {
  type: 'restrict' | 'prevent' | 'block';
  action?: string;
  value?: any;
  message?: string;
}
```

These are also **not Prolog predicates**. They are pattern-matched by `RuleEnforcer.findRestriction()`.

### 6.4 Prolog-to-Rule Conversion

The unified engine has some logic to convert Insimul rule `content` (a text-based format) to Prolog for condition evaluation during simulation. However, the `conditions` and `effects` JSON arrays — which are what the game engine actually uses — remain separate from this conversion.

### 6.5 Gap: Rules Are Dual-Tracked

Rules exist in two incompatible representations:
1. **Insimul text format** (in `content` field) — can be converted to Prolog for simulation
2. **JSON conditions/effects** (in `conditions`/`effects` fields) — used by the game engine's `RuleEnforcer`

These two representations are **not kept in sync**. A rule's Prolog conversion may express different logic than its JSON conditions/effects.

---

## 7. Actions System & Prolog

### 7.1 Action Storage

Actions are stored with:
```typescript
{
  id, worldId, name, description,
  actionType: 'social' | 'physical' | 'mental' | 'economic' | 'magical' | 'political',
  duration, difficulty, energyCost,
  prerequisites: any[],         // JSON prerequisite objects
  effects: any[],               // JSON ActionEffect objects
  sideEffects: any[],
  targetType: 'self' | 'other' | 'location' | 'object' | 'none',
  requiresTarget: boolean,
  range, cooldown,
  triggerConditions: any[],
  verbPast, verbPresent,
  narrativeTemplates: string[],
  customData, tags
}
```

### 7.2 Action Execution in Game (NO Prolog)

The game-side action system (`BabylonDialogueActions.ts`, action execution logic in `BabylonGame.ts`) processes actions entirely in JavaScript:

1. Check `isAvailable` flag
2. Check `energyCost` against player energy
3. Check `cooldown` timer
4. Evaluate `prerequisites` (JSON objects, not Prolog)
5. Apply `effects` (typed as `ActionEffect[]` with types: relationship, attribute, status, event, item, knowledge, gold)
6. Generate narrative text from `narrativeTemplates`

**No Prolog involvement whatsoever in action execution.**

### 7.3 Action Prerequisites

Prerequisites are stored as generic JSON arrays. There is no standard structure, no Prolog predicate form, and no formal evaluation engine. The authoring UI allows defining them, but the game engine does minimal prerequisite checking.

### 7.4 Gap: Actions Have No Predicate Representation

Actions' prerequisites, effects, and trigger conditions could be naturally expressed as Prolog:
```prolog
% Current: JSON { "type": "energy", "operator": ">=", "value": 10 }
% Could be:
can_perform(Action, Actor) :- energy(Actor, E), E >= 10.

% Current: JSON { "type": "relationship", "target": "npc", "value": 20 }
% Could be:
effect(greet, Actor, Target) :-
  friendship(Actor, Target, F),
  NewF is F + 20,
  assert(friendship(Actor, Target, NewF)).
```

---

## 8. Quests System & Prolog

### 8.1 Quest Storage

Quests are stored with:
```typescript
{
  id, worldId, title, description,
  questType: 'conversation' | 'translation' | 'vocabulary' | 'grammar' | 'cultural',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  assignedTo, assignedBy, assignedByCharacterId,
  objectives: any[],                    // JSON objective objects
  completionCriteria: Record<string, any>,
  prerequisiteQuestIds: string[],
  questChainId, questChainOrder,
  experienceReward, rewards, itemRewards, skillRewards, unlocks,
  failureConditions, status, tags
}
```

### 8.2 Quest Tracking in Game (NO Prolog)

Quest tracking components:
- `BabylonQuestTracker.ts` — Quest list UI and progress display
- `QuestWaypointManager.ts` — Navigation markers
- `QuestIndicatorManager.ts` — NPC quest markers (!, ?)
- `QuestObjectManager.ts` — Physical quest objects in world

All quest logic is imperative JavaScript. Objective completion, prerequisite checking, and reward granting are all done through direct property comparisons.

### 8.3 Quest Generation (AI, NOT Prolog)

`server/services/quest-generator.ts` generates quests using **Gemini LLM**, not Prolog reasoning:
- `generateQuestForType()` — AI-generated quest from type-specific prompt
- `generateQuestFromDialogue()` — AI-generated quest from conversation context
- `generateQuestsForWorld()` — Batch AI generation

### 8.4 Gap: Quest Logic Is Entirely Imperative

Quest preconditions, objectives, and completion criteria are perfect candidates for Prolog:
```prolog
% Quest availability
quest_available(fetch_herbs, Player) :-
  completed_quest(Player, meet_herbalist),
  skill_level(Player, herbalism, L), L >= 2,
  \+ completed_quest(Player, fetch_herbs).

% Objective completion
objective_complete(fetch_herbs, obj1, Player) :-
  has_item(Player, moonflower, Qty), Qty >= 5.

% Quest completion
quest_complete(fetch_herbs, Player) :-
  objective_complete(fetch_herbs, obj1, Player),
  objective_complete(fetch_herbs, obj2, Player).
```

---

## 9. Truths System & Prolog

### 9.1 Truth Storage

Truths represent world facts, events, and history:
```typescript
{
  id, worldId, characterId,
  title, content,
  entryType: 'event' | 'backstory' | 'relationship' | 'achievement' | 'milestone' | 'prophecy' | 'plan',
  timestep, timeYear, timeSeason, timeDescription,
  relatedCharacterIds, relatedLocationIds,
  tags, importance, isPublic,
  source: 'imported_ensemble' | 'user_created' | 'simulation_generated'
}
```

### 9.2 Truth Generation (During Simulation)

The unified engine creates truths from:
- `createTruthFromNarrative()` — Narrative text becomes Truth entry
- `createTruthFromEvent()` — Simulation events become Truths
- `createTruthsForEvents()` — Bulk event truth creation

### 9.3 Gap: Truths Are Unstructured Text, Not Predicates

Truths are stored as free-text `content` strings with metadata. They are not queryable as Prolog facts. A truth like "John married Jane in 1520" is stored as a text string, not as:
```prolog
married(john, jane, 1520).
event(marriage, john, jane, 1520).
```

The `isPublic` field could map to Prolog visibility:
```prolog
public_truth(TruthId).
private_truth(TruthId, KnownBy).
knows_truth(Character, TruthId) :- public_truth(TruthId).
knows_truth(Character, TruthId) :- private_truth(TruthId, Character).
```

---

## 10. Babylon.js Game Engine & Prolog

### 10.1 Current Architecture

The Babylon.js game (`client/src/components/3DGame/`) has **zero Prolog integration**. All game logic is imperative JavaScript/TypeScript:

| System | File | Logic Type |
|--------|------|-----------|
| **Rule Enforcement** | `RuleEnforcer.ts` | JavaScript switch/case on JSON conditions |
| **Action Execution** | `BabylonDialogueActions.ts`, `BabylonGame.ts` | Direct property checks |
| **Quest Tracking** | `BabylonQuestTracker.ts` | Imperative progress tracking |
| **NPC AI** | `BabylonGame.ts` (NPC loop) | State machine (idle/flee/pursue/alert) |
| **Combat** | `CombatSystem.ts` etc. | Direct damage calculations |
| **Survival** | `SurvivalNeedsSystem.ts` | Decay rate calculations |
| **Crafting** | `CraftingSystem.ts` | Ingredient checking |
| **Economy** | `BabylonMercantile.ts` | Price calculations |

### 10.2 RuleEnforcer Deep Dive

`RuleEnforcer.ts` (395 lines) is the closest thing to a logic engine in the game:

- Receives rules as JSON objects (not Prolog)
- Evaluates conditions via `evaluateCondition()` switch statement:
  - `location` — checks `inSettlement` boolean
  - `zone` — checks player position against settlement zones
  - `action` — string comparison on action type/id
  - `energy` — numeric comparison on player energy
  - `proximity` — checks `nearNPC` boolean
  - `tag` — stub (always returns true)
- Finds restriction effects via `findRestriction()` — looks for `restrict`/`prevent`/`block` effect types
- Records violations with severity levels

**Critical observation:** The `RuleEnforcer` is essentially a toy logic engine. It can only check 6 hard-coded condition types with simple comparisons. It cannot express:
- Character relationships (e.g., "only friends can trade")
- World state queries (e.g., "if it's nighttime and raining")
- Multi-entity conditions (e.g., "if two NPCs are in the same location")
- Derived facts (e.g., "if the player is an ancestor of the NPC")
- Negation (e.g., "if no guards are nearby")

A Prolog-based rule engine would handle all of these naturally.

### 10.3 NPC Behavior

NPC behavior is a simple state machine with 5 states. NPC decisions are **not** driven by rules, knowledge, or Prolog reasoning. NPCs:
- Wander randomly within patrol radius
- Flee when attacked
- Pursue threats (guards)
- Return home when state expires
- Initiate ambient conversations via `NPCAmbientConversationManager.ts` (proximity + cooldown)

There is no connection between NPC personality/knowledge and behavior. An NPC who "knows" a secret via the Prolog knowledge base cannot act on that knowledge in the game.

### 10.4 Data Loading

`DataSource.ts` provides two implementations:
- `ApiDataSource` — Loads from REST API (Insimul web app)
- `FileDataSource` — Loads from static JSON files (exported games)

Neither loads Prolog knowledge bases. Both load rules/actions/quests as JSON.

---

## 11. Game Exports & Prolog

### 11.1 Intermediate Representation (IR)

The `WorldIR` (`shared/game-engine/ir-types.ts`) is the canonical export format. Its `SystemsIR` includes:
```typescript
interface SystemsIR {
  rules: RuleIR[];
  baseRules: RuleIR[];
  actions: ActionIR[];
  baseActions: ActionIR[];
  quests: QuestIR[];
  truths: TruthIR[];
  grammars: GrammarIR[];
  languages: LanguageIR[];
}
```

**No Prolog knowledge base is included in the IR.** The IR stores rules/actions/quests as JSON structures, not as Prolog predicates.

### 11.2 Babylon.js Export

The Babylon exporter (`server/services/game-export/babylon/`) generates:
- `rules.json` — World rules + base rules as JSON
- `actions.json` — World actions + base actions as JSON
- `quests.json` — Quest definitions as JSON
- No `.pl` file exported
- No Prolog engine bundled

### 11.3 Godot Export

GDScript code generated for rule/action/quest systems — all imperative, no Prolog.

### 11.4 Unity Export

C# MonoBehaviours generated — all imperative, no Prolog.

### 11.5 Unreal Export

C++ classes generated — all imperative, no Prolog.

### 11.6 Gap: Exports Completely Bypass Prolog

Every exported game discards the entire Prolog knowledge base. World logic that could be computed via Prolog reasoning is either:
- Lost entirely (derived relationships, belief propagation)
- Baked into static JSON (flattened facts)
- Reimplemented as imperative code per engine

---

## 12. TotT Social Simulation & Prolog

### 12.1 Talk of the Town Systems

The `server/extensions/tott/` directory contains 25 specialized social simulation modules. These implement complex world simulation logic **entirely in TypeScript**, with no Prolog involvement:

| System | Prolog Alternative |
|--------|--------------------|
| `hiring-system.ts` — Candidate matching | `qualified_for(Person, Job) :- skill(Person, S), requires_skill(Job, S).` |
| `social-dynamics-system.ts` — Relationship updates | `will_befriend(X, Y) :- same_location(X, Y), personality_compatible(X, Y).` |
| `knowledge-system.ts` — Mental models, beliefs | Already has Prolog sync, but computation is in TypeScript |
| `economics-system.ts` — Wealth, trade | `can_afford(Person, Item) :- wealth(Person, W), price(Item, P), W >= P.` |
| `lifecycle-system.ts` — Birth, death, marriage | `can_marry(X, Y) :- adult(X), adult(Y), unmarried(X), unmarried(Y), \+ sibling_of(X, Y).` |
| `personality-behavior-system.ts` — Behavior selection | `prefers_action(Person, Action) :- personality_trait(Person, T, V), trait_influences(T, Action, Weight).` |
| `autonomous-behavior-system.ts` — Volition | `best_action(Person, Action) :- prefers_action(Person, Action), can_perform(Action, Person).` |
| `drama-recognition-system.ts` — Drama detection | `is_dramatic(Event) :- involves(Event, X), involves(Event, Y), rivalry(X, Y, R), R > 70.` |
| `conversation-system.ts` — Dialogue simulation | `topic_relevant(Topic, X, Y) :- knows(X, Topic), knows(Y, Topic).` |

All of these systems perform complex reasoning that Prolog excels at, but they do it through imperative TypeScript with nested loops and conditional branches.

---

## 13. AI/LLM Integration Points

### 13.1 Current LLM Usage

| Feature | LLM Used | Could Prolog Replace? |
|---------|----------|----------------------|
| Rule generation | Gemini | Partially — Prolog can evaluate but not creatively generate |
| Rule editing | Gemini | Partially — syntax transformation possible without LLM |
| Quest generation | Gemini | Partially — Prolog can determine feasible quests from world state |
| Character interaction | Gemini | No — natural language generation requires LLM |
| Language generation | Gemini | No — linguistic creativity requires LLM |
| Grammar generation | Gemini | Partially — template expansion is rule-based |
| Portrait generation | Gemini/DALL-E | No — image generation is not logic |
| Name generation | Gemini | Partially — name rules could be Prolog-based |

### 13.2 Prolog as LLM Cost Reducer

Many LLM calls currently determine "what should happen" based on world state. Prolog could handle the deterministic parts:
- **"Which quests can this character give?"** — Prolog query, not LLM
- **"What actions are available?"** — Prolog prerequisite checking, not LLM
- **"What does this NPC know about?"** — Prolog knowledge base, not LLM
- **"What events should trigger?"** — Prolog rule matching, not LLM
- **"Who is eligible to marry?"** — Prolog genealogy check, not LLM

The LLM can then focus on **content generation** (dialogue text, descriptions, narrative) while Prolog handles **logical determination** (what, who, when, why).

---

## 14. Gap Analysis

### 14.1 Critical Gaps

| # | Gap | Impact | Severity |
|---|-----|--------|----------|
| 1 | **No client-side Prolog engine** | Game cannot reason about world state at runtime | Critical |
| 2 | **Rules use JSON conditions, not predicates** | Game rules are limited to 6 hard-coded condition types | Critical |
| 3 | **Actions have no predicate prerequisites** | No formal prerequisite evaluation | High |
| 4 | **Quests have no predicate conditions** | Quest availability cannot be computed from world state | High |
| 5 | **Truths are unstructured text** | World history cannot be queried as logical facts | High |
| 6 | **Exports exclude Prolog** | Exported games lose all logical reasoning capability | Critical |
| 7 | **NPC behavior ignores knowledge base** | NPCs cannot act on what they "know" | High |
| 8 | **TotT systems don't use Prolog** | Complex social simulation duplicates Prolog's strengths | Medium |
| 9 | **Sync is one-directional** | Game state changes don't update Prolog knowledge base | High |
| 10 | **SWI-Prolog is external dependency** | Cannot run in browser or bundled in exports | Critical |

### 14.2 Architectural Disconnects

```
CURRENT ARCHITECTURE:

  [MongoDB] ──sync──▶ [SWI-Prolog .pl file] ──query──▶ [Simulation Results]
                                                              │
      │                                                       ▼
      │                                              [Truths in DB]
      ▼
  [REST API] ──JSON──▶ [React Client] ──JSON──▶ [Babylon.js Game]
                                                       │
                                                       ▼
                                              [RuleEnforcer (JS)]
                                              [ActionManager (JS)]
                                              [QuestTracker (JS)]
                                              [NPC State Machine (JS)]

  DISCONNECTED:
  - Prolog knowledge ⇏ Game Engine
  - Game state changes ⇏ Prolog
  - Exported games ⇏ Prolog

DESIRED ARCHITECTURE:

  [MongoDB] ──sync──▶ [Prolog KB (portable)] ──▶ [Game Engine (all platforms)]
      ▲                      ▲                          │
      │                      │                          ▼
      └──────────────────────┴──────────── [Prolog queries drive ALL gameplay]
```

---

## 15. Summary of Findings

### What Works Well
1. PrologSyncService covers characters, relationships, locations, businesses, knowledge/beliefs
2. Auto-generated helper rules provide useful derived relationships
3. Predicate discovery and validation systems are sophisticated
4. API endpoints provide full CRUD for knowledge base management
5. Phase 6 knowledge/belief predicates are well-designed

### What's Missing
1. **No portable Prolog engine** — SWI-Prolog cannot run in browsers or be bundled
2. **Rules/Actions/Quests defined as JSON, not predicates** — The authoring workflow doesn't produce Prolog
3. **Game engine has zero Prolog integration** — All runtime logic is imperative JavaScript
4. **Exports discard Prolog entirely** — No `.pl` files, no Prolog engine, no predicate evaluation
5. **One-way sync only** — Game state changes don't propagate back to Prolog
6. **NPC AI is disconnected** — Knowledge base doesn't influence NPC behavior
7. **World simulation is TypeScript, not Prolog** — TotT systems could be Prolog-driven
8. **No predicate-based authoring** — Users define conditions/effects as JSON forms, not logical predicates

### Core Insight

The current Prolog integration is a **read-only mirror** of database state that is consulted only during server-side simulation steps. It does not participate in the game experience. To fulfill the vision of Prolog-driven gameplay, the system needs:

1. A **portable Prolog engine** (JavaScript-based) that runs in browsers and exported games
2. A **unified predicate representation** where rules, actions, quests, and truths are all expressed as Prolog
3. **Bidirectional sync** between game state and knowledge base
4. **Client-side query capability** so the game engine can reason about world state in real-time
