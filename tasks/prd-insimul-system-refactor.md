# PRD: Insimul System Refactor — Content Editors, History Engine, Game Completion, Telemetry & Exports

## Introduction

Insimul is a procedural narrative game engine combining Talk of the Town (historical town simulation), Ensemble (social AI), Kismet (narrative rules), Prolog reasoning, and Babylon.js 3D gameplay — with export to Godot, Unity, and Unreal. This PRD covers a comprehensive, multi-phase refactor touching every layer of the system: content editors, data structures, historical simulation, in-game features, evaluation telemetry, and external exports.

The immediate product goal is completing the first major Insimul game — a language-learning RPG (LLVR) — while keeping the engine flexible for all 14 supported genres. The refactor is driven by six key insights from system analysis:

1. **Truth/history is the weakest link** — all truths exist at timestep 0; no historical generation exists
2. **Prolog KB feels disconnected** — it's a second-class tab used only for syncing/exporting static data
3. **TotT's two-phase simulation is unported** — the core 140-year lo-fi/hi-fi compression is missing
4. **Game features are 80% complete** — romance, puzzles, NPC volition, and ambient conversations need finishing
5. **Telemetry is absent** — no persistent language progress, no evaluation metrics, no export-to-server pipeline
6. **Content editors work in isolation** — rules, actions, quests, items, and truths don't show their interconnections

## Goals

- Unify truth/history, Prolog KB, and simulations into a single "World Intelligence" tab with sub-views
- Implement configurable timestep granularity (default: 1 year for history, 1 day for gameplay)
- Port TotT's two-phase historical simulation with tiered LLM enrichment
- Make truth a cross-cutting concern visible in every content editor
- Complete all player activity systems (romance, puzzles, NPC volition, ambient conversations)
- Build persistent telemetry aligned with the LLVR evaluation plan (ACTFL, SUS, SSQ, WER)
- Add REST batch telemetry to exported games with local fallback
- Standardize Insimul content syntax for rules, actions, quests, and game logic
- Interleave game feature development with corresponding telemetry instrumentation

---

## Roadmap Overview

| Phase | Name | Scope | Dependencies |
|-------|------|-------|-------------|
| **1** | Content Editor & Data Structure Refactor | Schema, editors, truth integration | None |
| **2** | World Intelligence Tab | Merge KB + Simulations + Truth + History | Phase 1 |
| **3** | Historical Simulation Engine | TotT two-phase, tiered LLM enrichment | Phase 2 |
| **4** | In-Game Feature Completion | Romance, puzzles, volition, conversations | Phase 1 |
| **5** | Telemetry & Evaluation Data | Persistent metrics, evaluation instruments | Phase 1 |
| **6** | Export Telemetry Pipeline | REST batch upload, local fallback | Phase 5 |

---

## Phase 1: Content Editor & Data Structure Refactor

### US-1.01: Add Configurable Timestep System to World Schema
**Description:** As a world creator, I want to define what a "timestep" means in my world (year, day, hour, minute) so that time has concrete meaning in history and gameplay.

**Acceptance Criteria:**
- [ ] Add `timestepUnit` field to world schema: `"year" | "day" | "hour" | "minute" | "custom"` (default: `"year"`)
- [ ] Add `gameplayTimestepUnit` field to world schema (default: `"day"`) — separate from historical timestep
- [ ] Add `customTimestepLabel` and `customTimestepDurationMs` fields for custom units
- [ ] Add `historyStartYear` and `historyEndYear` fields to world schema (e.g., 1839-1979)
- [ ] Add `currentGameYear` field derived from `historyEndYear` + gameplay timesteps
- [ ] Update world creation modal to include timestep configuration section
- [ ] Update WorldManagementTab settings dialog with timestep editing
- [ ] Migrate existing worlds to default values (`timestepUnit: "year"`, `gameplayTimestepUnit: "day"`)
- [ ] Typecheck passes

### US-1.02: Add Truth Cross-Reference Badges to All Content Editors
**Description:** As a world creator, I want to see which truths are related to each rule, action, quest, item, grammar, and language so that I understand how content interconnects.

**Acceptance Criteria:**
- [ ] Add `relatedTruthIds` field to rules, actions, quests, items, grammars, and languages schemas
- [ ] In RulesHub detail panel, show a "Related Truths" section listing truths that reference the rule or are created by the rule
- [ ] In ActionsHub detail panel, show a "Truth Effects" section showing what truths the action creates/modifies
- [ ] In QuestsHub detail panel, show a "Truth Requirements" section (truths needed) and "Truth Rewards" (truths granted on completion)
- [ ] In ItemsHub detail panel, show "Lore Truths" section linking item to world truths
- [ ] In GrammarsHub detail panel, show truths that use the grammar for narrative generation
- [ ] In LanguagesHub detail panel, show truths about the language's cultural/historical context
- [ ] Each badge is clickable, navigating to the truth in the World Intelligence tab
- [ ] Truths auto-link via bidirectional references: when a truth mentions a rule/action/quest/item by ID, the link is created automatically
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-1.03: Standardize Insimul Content Syntax for Rules
**Description:** As a developer, I need a canonical Prolog content format for rules so that all rules are machine-parseable and consistently structured.

**Acceptance Criteria:**
- [ ] Document the canonical rule format: metadata predicates (`rule_type/2`, `rule_priority/2`, `rule_likelihood/2`, `rule_category/2`, `rule_active/1`, `rule_source/2`), condition clause (`rule_applies/3`), effect clause (`rule_effect/2`)
- [ ] Add `rule_truth_requires/2` predicate — truths that must exist for the rule to fire
- [ ] Add `rule_truth_creates/3` predicate — truths created when the rule fires (with timestep offset)
- [ ] Add `rule_truth_modifies/3` predicate — truths modified when the rule fires
- [ ] Create a validation function `validateRuleContent(content: string): ValidationResult` that checks for required predicates
- [ ] Add validation feedback in RulesHub editor (green/yellow/red status indicator)
- [ ] Ensure all 1,274 base Ensemble rules pass validation (fix any that don't)
- [ ] Write unit tests for rule content validation
- [ ] Typecheck passes

### US-1.04: Standardize Insimul Content Syntax for Actions
**Description:** As a developer, I need a canonical Prolog content format for actions so that all actions are machine-parseable and consistently structured.

**Acceptance Criteria:**
- [ ] Document the canonical action format: `action/4` (id, name, type, energyCost), `can_perform/2` or `can_perform/3`, `action_effect/2`, `action_duration/2`, `action_difficulty/2`
- [ ] Add `action_truth_requires/2` — truths that must exist for the action to be available
- [ ] Add `action_truth_creates/3` — truths created when the action executes
- [ ] Add `action_narrative/2` — Tracery template for narrative description of the action
- [ ] Create `validateActionContent(content: string): ValidationResult`
- [ ] Add validation feedback in ActionsHub editor
- [ ] Ensure all 1,274 base Ensemble actions pass validation
- [ ] Write unit tests for action content validation
- [ ] Typecheck passes

### US-1.05: Standardize Insimul Content Syntax for Quests
**Description:** As a developer, I need a canonical Prolog content format for quests with objective definitions, completion conditions, and reward specifications.

**Acceptance Criteria:**
- [ ] Document the canonical quest format: `quest/3` (id, title, type), `quest_objective/4` (questId, objType, target, required), `quest_reward/3` (questId, rewardType, amount), `quest_prerequisite/2`, `quest_location/2`
- [ ] Add `quest_truth_requires/2` — world truths needed to accept the quest
- [ ] Add `quest_truth_creates/3` — truths created on quest completion (with timestep)
- [ ] Add `quest_stage/3` — multi-stage quest support in Prolog
- [ ] Add `quest_language_objective/4` — language-learning-specific objectives (vocab target, grammar accuracy, immersion %)
- [ ] Create `validateQuestContent(content: string): ValidationResult`
- [ ] Add validation feedback in QuestsHub editor
- [ ] Write unit tests for quest content validation
- [ ] Typecheck passes

### US-1.06: Add History Entry Type to Truth System
**Description:** As a world creator, I want a "history" entry type for truths so that I can record historical events that happened before the current game time, distinguished from backstory, traits, and secrets.

**Acceptance Criteria:**
- [ ] Add `"history"` to the `entryType` enum alongside existing types (event, backstory, relationship, achievement, milestone, prophecy, plan)
- [ ] Add `historicalEra` field to truth schema (e.g., "founding", "civil_war", "industrial", "modern") — optional, for grouping
- [ ] Add `historicalSignificance` field: `"world" | "country" | "state" | "settlement" | "family" | "personal"` — scope of the event's impact
- [ ] Add `causesTruthIds` and `causedByTruthIds` fields for causal chains between historical events
- [ ] Update TruthTab to show history entries with causal chain visualization (arrows between related events)
- [ ] History entries appear in the timeline sorted by timestep with era grouping
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-1.07: Enhance Item Schema for Quest & Crafting Integration
**Description:** As a game designer, I want items to explicitly define their quest roles, crafting recipes, and truth connections so that the item system drives emergent gameplay.

**Acceptance Criteria:**
- [ ] Add `craftingRecipe` field to item schema: `{ ingredients: [{itemId, quantity}], craftTime, requiredLevel, requiredStation }` (nullable)
- [ ] Add `questRelevance` field: array of `{ questId, role: "objective" | "reward" | "tool" | "key" }` — auto-populated from quest definitions
- [ ] Add `loreText` field for in-game item description (separate from editor `description`)
- [ ] Add `languageLearningData` field: `{ targetWord, targetLanguage, pronunciation, category }` — for vocabulary items in language-learning games
- [ ] Update ItemsHub to show quest relevance and crafting recipe in detail panel
- [ ] Items with `languageLearningData` show pronunciation and category in detail panel
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-1.08: Enhance Grammar System with Truth & History Templates
**Description:** As a world creator, I want grammars that can reference truths and historical events so that procedurally generated text reflects the world's actual history.

**Acceptance Criteria:**
- [ ] Add `truthBindings` field to grammar schema: array of `{ placeholder, truthQuery }` — maps Tracery placeholders to Prolog truth queries
- [ ] Add `contextType` field: `"narrative" | "dialogue" | "history" | "item_description" | "quest_description" | "ambient"` — categorizes grammar usage
- [ ] Update grammar expansion engine to resolve truth bindings before Tracery expansion
- [ ] Add pre-built grammar templates for history narration (e.g., "In {year}, {character} {event_verb} in {settlement}")
- [ ] Update GrammarsHub to show truth bindings editor and context type selector
- [ ] Add grammar test console mode that resolves truth bindings from a selected world
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-1.09: Add Language-Truth Integration for Cultural Context
**Description:** As a language-learning game designer, I want languages to have associated cultural truths so that language learning is embedded in cultural context.

**Acceptance Criteria:**
- [ ] Add `culturalTruthIds` field to worldLanguages schema — links to truths about the language's culture
- [ ] Add `historicalTruthIds` field — links to truths about the language's historical evolution
- [ ] Add `idiomsAndProverbs` field: array of `{ phrase, meaning, culturalContext, difficulty }` — culturally-grounded vocabulary
- [ ] Update LanguagesHub to show linked cultural and historical truths
- [ ] Add "Cultural Context" sub-panel in LanguagesHub showing related truths
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

## Phase 2: World Intelligence Tab

### US-2.01: Create World Intelligence Tab Shell with Sub-View Navigation
**Description:** As a world creator, I want a unified "World Intelligence" tab that combines the Prolog Knowledge Base, Simulations, and Truth/History management into a single powerful interface.

**Acceptance Criteria:**
- [ ] Create `WorldIntelligenceTab.tsx` component with sub-view navigation: History, Knowledge Base, Simulations, Truth Manager
- [ ] Replace the existing PrologKnowledgeBase, Simulations, and TruthTab entries in the main tab bar with the single "World Intelligence" tab
- [ ] Sub-views accessible via horizontal tab bar within the World Intelligence tab
- [ ] Each sub-view preserves the full functionality of its predecessor
- [ ] URL routing supports deep-linking to sub-views (e.g., `?tab=intelligence&view=history`)
- [ ] Tab shows aggregate badge counts: total truths, total KB facts, active simulations
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-2.02: Build History Sub-View with Timeline Visualization
**Description:** As a world creator, I want a rich history timeline showing all world events across the full historical span, grouped by era, with filtering by scope and entity.

**Acceptance Criteria:**
- [ ] History sub-view shows a horizontal scrollable timeline from `historyStartYear` to present game time
- [ ] Events displayed as nodes on the timeline, color-coded by `historicalSignificance` (world=red, country=blue, settlement=green, family=orange, personal=gray)
- [ ] Era grouping with collapsible sections (e.g., "Founding Era 1839-1860", "Civil War 1861-1865")
- [ ] Filter bar: by entity type (character, settlement, country), by entry type, by era, by significance level
- [ ] Search box for full-text search across truth titles and content
- [ ] Tiered view toggle: "Headlines" (importance 7+), "Notable" (4-6), "All" (1+) — default to "Notable"
- [ ] Smart clustering in "All" tier: group similar events in the same year (e.g., "12 children born in 1892") with expand-on-click
- [ ] Click any event to expand details, showing causal chains (caused by / leads to)
- [ ] "Add Event" button opens a form pre-filled with the clicked timestep
- [ ] Timeline supports zoom (decade view, year view, month view for gameplay timesteps)
- [ ] Mini-map at bottom showing full timeline with viewport indicator
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-2.03: Build Knowledge Base Sub-View with Enhanced Query Interface
**Description:** As a world creator, I want the Knowledge Base view to show all Prolog facts organized by category with a powerful query interface that suggests queries based on content.

**Acceptance Criteria:**
- [ ] Migrate existing PrologKnowledgeBase.tsx functionality into KB sub-view
- [ ] Add category grouping for facts: Characters, Locations, Rules, Actions, Items, Truths, Relationships, History
- [ ] Show fact count per category with expand/collapse
- [ ] Query builder UI: dropdown for predicate selection, auto-complete for known entity IDs
- [ ] Query history panel (last 20 queries with re-run button)
- [ ] "Suggested Queries" section that generates relevant queries based on selected entity in any editor
- [ ] Query results show formatted tables with column headers from predicate arity
- [ ] Export query results as CSV or JSON
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-2.04: Build Simulations Sub-View with History Generation Controls
**Description:** As a world creator, I want to run simulations that generate historical events, with controls for lo-fi (fast historical) and hi-fi (detailed gameplay) modes.

**Acceptance Criteria:**
- [ ] Migrate existing simulation creation/configuration/timeline UI into Simulations sub-view
- [ ] Add simulation mode selector: "Historical (Lo-Fi)" and "Gameplay (Hi-Fi)"
- [ ] Historical mode: configurable `startYear`, `endYear`, `samplingRate` (% of timesteps simulated, default 3.6% matching TotT)
- [ ] Gameplay mode: full-fidelity simulation with all systems active
- [ ] Add "Event Types" checkboxes to control which events can fire (births, deaths, marriages, divorces, business openings/closings, wars, migrations, natural disasters)
- [ ] Add "LLM Enrichment" toggle with tier selector: None, Minor Events Only, Major Events Only, All Events
- [ ] Progress bar showing simulation advancement with ETA
- [ ] Live event feed showing generated events as they occur
- [ ] Results summary: events by type, characters affected, truth entries created
- [ ] "Accept Results" button that commits generated truths to the world
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-2.05: Build Truth Manager Sub-View with Cross-Reference Panel
**Description:** As a world creator, I want a truth management view that shows all truths with their connections to rules, actions, quests, items, and other truths.

**Acceptance Criteria:**
- [ ] Migrate existing TruthTab functionality into Truth Manager sub-view
- [ ] Add cross-reference panel: when a truth is selected, show all entities that reference it (rules that require it, actions that create it, quests that depend on it, items linked to it)
- [ ] Add "Orphan Truths" filter — truths not referenced by any entity
- [ ] Add "Truth Graph" visualization — node graph showing truth-to-truth causal chains and entity connections
- [ ] Add bulk operations: tag multiple truths, change entry type, set era, delete batch
- [ ] Add "Truth Consistency Check" button that validates all truth references resolve to existing entities
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-2.06: Add Truth Context Panel to All Content Editors
**Description:** As a world creator, I want a collapsible truth context panel available in every content editor that shows truths relevant to whatever I'm editing.

**Acceptance Criteria:**
- [ ] Create reusable `TruthContextPanel.tsx` component that accepts an entity type and ID
- [ ] Panel shows: truths that reference the entity, truths the entity creates/requires, truth timeline for the entity
- [ ] Panel is collapsible (collapsed by default to save space)
- [ ] Integrate into RulesHub, ActionsHub, QuestsHub, ItemsHub, GrammarsHub, LanguagesHub detail panels
- [ ] Panel includes "Create Related Truth" button that pre-fills entity references
- [ ] Panel includes quick-search for finding truths to link
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

## Phase 3: Historical Simulation Engine

### US-3.01: Port TotT Two-Phase Simulation Architecture
**Description:** As a developer, I need the core two-phase simulation loop (lo-fi historical compression + hi-fi gameplay detail) so that worlds can generate 140+ years of history efficiently.

**Acceptance Criteria:**
- [ ] Create `server/engines/historical-simulation.ts` implementing `HistoricalSimulationEngine`
- [ ] Lo-fi mode: iterate from `historyStartYear` to `historyEndYear`, sampling `samplingRate`% of timesteps
- [ ] Each sampled lo-fi timestep runs: birth checks (if pregnant), death checks (age 68+), marriage attempts, divorce checks, business openings/closings, retirement checks, job seeking
- [ ] Non-sampled timesteps only advance time and check pregnancies/deaths
- [ ] Hi-fi mode: full simulation with all TotT systems active (routines, socializing, observation, knowledge decay, mental model deterioration)
- [ ] Engine emits events through a simulation event bus for real-time UI feedback
- [ ] Each event creates a truth entry with appropriate timestep and entry type
- [ ] Support for pause/resume/cancel during long historical simulations
- [ ] Performance target: 140 years of lo-fi simulation completes in < 30 seconds
- [ ] Seeded PRNG for all random decisions; seed stored in simulation config
- [ ] "Allow Variation" toggle (default: ON). When OFF: seed locked, all decisions deterministic
- [ ] Write integration tests for lo-fi and hi-fi modes
- [ ] Write determinism test: same seed + config produces identical event sequence when variation is OFF
- [ ] Typecheck passes

### US-3.02: Implement Era-Appropriate Event Probability Models
**Description:** As a developer, I need historically-plausible probability models so that births, deaths, marriages, and business events occur at realistic rates across different eras.

**Acceptance Criteria:**
- [ ] Create `server/engines/historical-probability.ts` with era-specific rate tables
- [ ] Birth rates: configurable per era (e.g., higher pre-1900, declining post-1960)
- [ ] Death rates: age-dependent with era modifier (higher infant mortality pre-1900, longer life expectancy post-1950)
- [ ] Marriage rates: age-dependent with cultural modifier
- [ ] Business advent/demise: industry-appropriate years (e.g., blacksmith viable 1839-1920, auto mechanic post-1910)
- [ ] Support for user-defined custom eras with custom rates
- [ ] World-type-aware defaults (medieval-fantasy has different rates than modern-realistic)
- [ ] Rates exposed in World Intelligence → Simulations sub-view as editable tables
- [ ] Write unit tests verifying rate distributions
- [ ] Typecheck passes

### US-3.03: Implement Tiered LLM Enrichment for Historical Events
**Description:** As a world creator, I want procedurally generated events enriched by LLM narration at configurable tiers so that history feels alive without excessive API costs.

**Acceptance Criteria:**
- [ ] Define event tiers: Tier 1 (minor — births, job changes, moves: pure procedural), Tier 2 (moderate — marriages, deaths, business events: short LLM description), Tier 3 (major — wars, disasters, cultural shifts: full LLM narrative)
- [ ] Tier assignment based on `historicalSignificance` field
- [ ] Tier 1 events: generate narrative from Tracery grammars only (zero LLM calls)
- [ ] Tier 2 events: batch 10-20 events per LLM call, requesting 1-2 sentence descriptions each
- [ ] Tier 3 events: individual LLM calls with full world context, requesting 1-2 paragraph narratives
- [ ] User can configure tier thresholds in simulation settings (e.g., "treat all family events as Tier 2")
- [ ] LLM batch requests include era context, settlement context, and involved character summaries
- [ ] Estimated API cost displayed before simulation starts
- [ ] Generated narratives stored in truth `content` field
- [ ] LLM provider abstraction: `LLMProvider` interface with `generateBatch()` and `generate()` methods; only Gemini implemented initially
- [ ] In deterministic mode (Allow Variation OFF): LLM calls use `temperature: 0`
- [ ] Typecheck passes

### US-3.04: Implement Building & Business Lifecycle System
**Description:** As a developer, I need the full building/business lifecycle so that settlements grow and change organically over historical time.

**Acceptance Criteria:**
- [ ] Implement business founding: TotT-style advent year checks per business type
- [ ] Implement business closure: TotT-style demise year checks, economic decline, owner death/retirement
- [ ] When businesses close, employees get laid off (triggers job-seeking behavior)
- [ ] Implement building construction: when a business is founded, it commissions building construction on a vacant lot
- [ ] Implement building demolition: old, unused buildings can be demolished, lot returns to vacant
- [ ] Track `formerBuildingIds` on lots (currently defined but never populated)
- [ ] Building renovation: existing buildings can change business type without demolition
- [ ] Business succession: when owner retires/dies, employees or family may take over
- [ ] Write integration tests for business lifecycle across 50-year simulation spans
- [ ] Typecheck passes

### US-3.05: Implement Genealogy-Driven History Generation
**Description:** As a world creator, I want the historical simulation to generate multi-generational family trees with realistic genealogical events so that every character has a rich family history.

**Acceptance Criteria:**
- [ ] Start with founder generation (PersonExNihilo): create initial settlers at `historyStartYear`
- [ ] Marriage: compatible characters marry based on age, personality, existing relationships (TotT model)
- [ ] Reproduction: married couples conceive with fertility rates (270-day gestation)
- [ ] Birth: child inherits traits from parents (personality, appearance via genetics system)
- [ ] Naming: children named using family naming patterns (name system) or cultural corpora
- [ ] Death: age-dependent with era modifiers; triggers inheritance, grief, family restructuring
- [ ] Divorce: probability based on relationship charge/spark deterioration
- [ ] Each genealogical event creates a truth entry with `entryType: "history"` and appropriate `historicalSignificance: "family"` or `"personal"`
- [ ] Family tree visualization using [family-chart](https://github.com/donatso/family-chart) library integrated into History sub-view as "Family Tree" mode toggle
- [ ] family-chart nodes show: name, birth/death years, occupation; click navigates to character truth timeline
- [ ] Pan/zoom and collapsible branches for large genealogies
- [ ] Write tests verifying 4+ generations emerge from 140-year simulation
- [ ] Typecheck passes

### US-3.06: Add History Import/Export and Manual Editing
**Description:** As a world creator, I want to import, export, and manually edit historical events so that I can curate generated history or bring in external timelines.

**Acceptance Criteria:**
- [ ] Export history as JSON (array of truth entries with full metadata)
- [ ] Export history as Prolog KB (facts for each historical event)
- [ ] Export history as narrative text (chronological prose generated from truths)
- [ ] Import history from JSON (validate schema, resolve entity references)
- [ ] Import history from CSV (columns: year, title, description, significance, characters, location)
- [ ] Manual history editor: form for creating/editing individual events with full metadata
- [ ] Bulk edit: select multiple events, change era/significance/tags
- [ ] Undo support for history modifications (last 10 operations)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

## Phase 4: In-Game Feature Completion

### US-4.01: Implement NPC Volition System (Ensemble)
**Description:** As a player, I want NPCs to autonomously pursue social goals based on their personality so that the game world feels alive with emergent behavior.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/VolitionSystem.ts` implementing Ensemble's volition calculation
- [ ] Each NPC evaluates available social actions and scores them using personality weights and relationship state
- [ ] Volition score = sum of (rule_likelihood * personality_match * relationship_modifier) for all applicable volition rules
- [ ] NPCs autonomously initiate social actions when their volition score exceeds a threshold
- [ ] Actions include: approach character, start conversation, offer gift, challenge to competition, express affection, avoid character
- [ ] Volition recalculated every N gameplay timesteps (configurable, default: every 10 steps)
- [ ] NPCs pursue multiple simultaneous goals with priority ordering
- [ ] Volition decisions create ambient world events visible to the player
- [ ] Integration with GamePrologEngine: volition rules are Prolog-evaluated
- [ ] Write unit tests for volition scoring with known personality/relationship inputs
- [ ] Typecheck passes

### US-4.02: Implement Romance System
**Description:** As a player, I want to develop romantic relationships with NPCs through dialogue, gifts, and shared experiences so that romance is a meaningful gameplay mechanic.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/RomanceSystem.ts`
- [ ] Romance stages: `none → attracted → flirting → dating → committed → engaged → married` (matching TotT's relationship progression)
- [ ] Spark system: romantic interest builds through positive interactions, decays without contact
- [ ] Add romance-specific dialogue actions: compliment, flirt, confess feelings, propose, give gift
- [ ] Romance actions available in BabylonDialogueActions when relationship meets stage threshold
- [ ] NPC acceptance/rejection based on their personality, existing relationships, and player reputation
- [ ] Romance events create truths (e.g., "Player began dating Marie on Day 15")
- [ ] Emit events: `romance_stage_changed(npcId, fromStage, toStage)`, `romance_action(npcId, actionType, accepted)`
- [ ] GamePrologEngine handles romance events → asserts relationship facts
- [ ] Romance quest objectives: "Reach dating stage with character X", "Give gift to crush"
- [ ] NPC jealousy system: other NPCs with romantic interest react to player's romances
- [ ] Typecheck passes

### US-4.03: Implement Puzzle System
**Description:** As a player, I want to encounter and solve puzzles during quests so that gameplay has intellectual challenge beyond combat and conversation.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/PuzzleSystem.ts` with puzzle type registry
- [ ] Puzzle types: riddle (NPC asks question, player types answer), combination lock (sequence of interactions), environmental (interact with objects in correct order), translation puzzle (translate phrase to progress), word puzzle (unscramble/complete target-language words)
- [ ] Each puzzle type has: setup data, validation logic, hint system (3 progressive hints), timeout (optional)
- [ ] Puzzles can be embedded in quests via `quest_objective(QuestId, solve_puzzle, PuzzleId, 1)`
- [ ] Puzzle UI: modal overlay with puzzle-type-specific interface
- [ ] Emit `puzzle_solved(puzzleId, puzzleType, hintsUsed, timeSpent)` and `puzzle_failed(puzzleId, puzzleType, attempts)`
- [ ] Language-learning puzzles: translation challenge, vocabulary matching, grammar fill-in-the-blank
- [ ] Puzzle difficulty scales with player level / language proficiency
- [ ] Add 5+ puzzle templates per type for procedural generation
- [ ] Write unit tests for puzzle validation logic per type
- [ ] Typecheck passes

### US-4.04: Implement Probabilistic Action Selection from Personality
**Description:** As a developer, I need NPCs to choose actions based on weighted personality scores so that different NPCs behave distinctly and unpredictably.

**Acceptance Criteria:**
- [ ] Create `softmaxActionSelection(actions, personality, temperature)` function
- [ ] Each action has personality propensity tags (e.g., "aggressive" favored by low agreeableness)
- [ ] Action weights computed from: base likelihood * personality match * situational modifiers
- [ ] Softmax with configurable temperature (0.1 = nearly deterministic, 2.0 = highly random)
- [ ] Default temperature: 0.7 (moderate personality influence with some unpredictability)
- [ ] Integrate with VolitionSystem for NPC autonomous action choice
- [ ] Integrate with ActionManager for contextual action ordering (most-likely first in UI)
- [ ] Prolog predicate `action_personality_weight/3` maps actions to Big Five factors
- [ ] Write unit tests verifying personality influence on action distribution
- [ ] Typecheck passes

### US-4.05: Complete NPC Ambient Conversation System
**Description:** As a player, I want to overhear contextually rich NPC conversations that reflect their personalities, relationships, and world events so that the world feels alive.

**Acceptance Criteria:**
- [ ] NPCAmbientConversationManager generates conversation text using Tracery + world context
- [ ] Conversation topics selected by Prolog: `prefers_topic(NPC, Topic)`, `conflict_style(NPC, Style)`
- [ ] Conversations reference recent world events (truths from current and recent timesteps)
- [ ] Conversations reflect NPC relationships (friends gossip positively, rivals gossip negatively)
- [ ] In language-learning games: ambient conversations use target language proportional to NPC's bilingual ratio
- [ ] Player can "eavesdrop" — clicking nearby conversation opens subtitled view
- [ ] Eavesdropping on target-language conversations grants passive vocabulary exposure (tracked)
- [ ] Emit `conversation_overheard(npcId1, npcId2, topic, languageUsed)` event
- [ ] Quest objective type: `listen_to_conversation(npcId, topic)` — "Overhear the baker discussing the festival"
- [ ] Typecheck passes

### US-4.06: Implement Duration-Based State Expiration
**Description:** As a developer, I need temporary character states (grieving, excited, angry, injured) to auto-expire after a duration so that emotional and physical states feel realistic.

**Acceptance Criteria:**
- [ ] Add `temporaryStates` array to character runtime state: `{ stateType, startTimestep, duration, intensity }`
- [ ] State types: grieving (30 days), excited (3 days), angry (1 day), injured (7 days), lovesick (14 days), suspicious (5 days), grateful (7 days)
- [ ] States expire when `currentTimestep >= startTimestep + duration`
- [ ] Expired states removed during timestep advancement
- [ ] Active states modify NPC behavior: grieving reduces sociability, angry increases aggression, etc.
- [ ] Prolog predicates: `has_state(Character, State)`, `state_intensity(Character, State, Intensity)`, `state_remaining(Character, State, Steps)`
- [ ] State creation triggers truth entry: "Character became grieving after loss of spouse"
- [ ] State expiration triggers truth entry: "Character recovered from grief"
- [ ] Write unit tests for state lifecycle
- [ ] Typecheck passes

### US-4.07: Add Utterance-Based Quest Objectives for Language Learning
**Description:** As a language learner playing the game, I want quests that require me to speak specific phrases in the target language so that I practice production, not just comprehension.

**Acceptance Criteria:**
- [ ] Add quest objective type: `speak_phrase(targetPhrase, targetLanguage, acceptableVariants[])`
- [ ] Chat panel detects when player types a phrase matching the target (fuzzy matching with configurable threshold)
- [ ] Partial credit: "close enough" phrases marked as partial completion with feedback
- [ ] NPC responds naturally to the attempt, providing correction if incorrect
- [ ] Quest tracker shows the target phrase with pronunciation guide
- [ ] Emit `utterance_attempted(questId, targetPhrase, actualPhrase, matchScore)` event
- [ ] Integration with pronunciation scoring: `scorePronunciation()` evaluates accuracy
- [ ] Add 10+ utterance quest templates for common language-learning scenarios (greetings, ordering food, asking directions, expressing emotions, negotiating prices)
- [ ] Typecheck passes

### US-4.08: Expand Player Activity Types and Standardize Event Taxonomy
**Description:** As a developer, I need a comprehensive, standardized taxonomy of player activities so that all game systems consistently emit, track, and respond to player actions.

**Acceptance Criteria:**
- [ ] Define canonical activity taxonomy in `shared/game-engine/activity-types.ts`:
  - Conversation: `talk_to_npc`, `conversation_turn`, `utterance_attempt`, `eavesdrop`
  - Combat: `attack`, `defend`, `dodge`, `use_ability`, `defeat_enemy`, `flee`
  - Items: `collect`, `craft`, `equip`, `use`, `drop`, `give`, `buy`, `sell`, `steal`
  - Exploration: `visit_location`, `discover_location`, `enter_building`, `enter_settlement`
  - Social: `compliment`, `flirt`, `threaten`, `bribe`, `persuade`, `trade`
  - Romance: `romance_action`, `gift`, `date`, `propose`
  - Puzzle: `puzzle_attempt`, `puzzle_solve`, `puzzle_fail`
  - Language: `vocabulary_use`, `grammar_attempt`, `translation`, `pronunciation`
  - Quest: `quest_accept`, `quest_complete`, `quest_fail`, `quest_abandon`
- [ ] Each activity type has: `category`, `verb`, `requiresTarget`, `emitsEvent`, `prologPredicate`, `telemetryFields`
- [ ] Update GameEventBus to use canonical activity types
- [ ] Update GamePrologEngine event handlers to use canonical predicates
- [ ] Backward-compatible with existing event types (aliases)
- [ ] Write documentation for the full activity taxonomy
- [ ] Typecheck passes

---

## Phase 5: Telemetry & Evaluation Data

### US-5.01: Create Persistent Language Progress Storage
**Description:** As a developer, I need server-side storage for language learning progress so that player progress persists across sessions and is available for evaluation analysis.

**Acceptance Criteria:**
- [ ] Add MongoDB collections: `languageProgress`, `vocabularyEntries`, `grammarPatterns`, `conversationRecords`, `languageAssessments`
- [ ] `languageProgress`: playerId, worldId, targetLanguage, overallFluency, totalConversations, totalWordsLearned, streakDays, xp, level, achievements[], dailyChallenges[]
- [ ] `vocabularyEntries`: playerId, worldId, word, meaning, category, timesEncountered, timesUsedCorrectly, masteryLevel, lastEncountered, context
- [ ] `grammarPatterns`: playerId, worldId, pattern, correctUsages, incorrectUsages, examples[], masteryLevel
- [ ] `conversationRecords`: playerId, worldId, characterId, turns, wordsUsed[], targetLanguagePercentage, fluencyGained, grammarErrors[], timestamp, duration
- [ ] `languageAssessments`: playerId, worldId, assessmentType (vocabulary, grammar, pronunciation, listening, pragmatic, cultural), score, maxScore, details, timestamp
- [ ] Add API endpoints: `POST /api/language-progress/sync` (batch upsert from client), `GET /api/language-progress/:playerId/:worldId` (full progress)
- [ ] Client-side LanguageProgressTracker syncs to server every 60 seconds and on session end
- [ ] Typecheck passes

### US-5.02: Implement Evaluation Instrument Endpoints
**Description:** As a researcher, I need API endpoints for recording evaluation instrument responses (ACTFL, SUS, SSQ, IPQ) so that study data is captured systematically.

**Acceptance Criteria:**
- [ ] Add `evaluationResponses` MongoDB collection: participantId, studyId, instrumentType, targetLanguage, responses[], score, timestamp, sessionId
- [ ] Add `targetLanguage` field to all evaluation records for multi-language study support
- [ ] Instrument types: `"actfl_opi"` (oral proficiency), `"sus"` (System Usability Scale), `"ssq"` (Simulator Sickness), `"ipq"` (Igroup Presence), `"engagement"` (custom engagement rating), `"grammar_judgment"`, `"gap_fill"`, `"vocabulary_productive"`, `"vocabulary_receptive"`, `"listening_comprehension"`, `"discourse_completion"`, `"cultural_knowledge"`
- [ ] Language-specific test items: each proficiency instrument has per-language item banks
- [ ] `POST /api/evaluation/:studyId/response` — submit instrument response
- [ ] `GET /api/evaluation/:studyId/responses` — retrieve all responses (researcher auth required)
- [ ] `GET /api/evaluation/:studyId/summary` — aggregate scores by instrument type
- [ ] SUS scoring: auto-calculate SUS score (0-100) from 10-item responses
- [ ] SSQ scoring: auto-calculate nausea, oculomotor, disorientation sub-scores
- [ ] Data export: `GET /api/evaluation/:studyId/export?format=csv` for statistical analysis
- [ ] Export supports filtering by target language for within-language and cross-language analysis
- [ ] Researcher dashboard groups participants by target language with per-language and aggregate views
- [ ] Typecheck passes

### US-5.03: Implement Technical Performance Telemetry
**Description:** As a researcher, I need to collect speech recognition WER, dialogue generation quality, system response latency, and error rates so that technical performance can be evaluated.

**Acceptance Criteria:**
- [ ] Add `technicalTelemetry` MongoDB collection: sessionId, playerId, worldId, metricType, value, metadata, timestamp
- [ ] Metric types: `"speech_wer"` (Word Error Rate per utterance), `"dialogue_latency_ms"` (time from player input to NPC response), `"dialogue_quality"` (player rating 1-5 after each response), `"render_fps"` (periodic frame rate samples), `"error"` (type, message, stack, severity), `"vr_session_type"` (VR vs desktop), `"vr_comfort_settings"` (comfort mode, vignette, etc.), `"vr_ssq_indicators"` (session duration in VR, comfort setting changes, pause frequency)
- [ ] Client-side telemetry collector: captures latency on every chat interaction
- [ ] Optional "Rate this response" button after NPC dialogue (1-5 stars) for dialogue quality
- [ ] Error logging: all client errors captured with context (action being performed, game state)
- [ ] FPS sampling: capture every 30 seconds during gameplay
- [ ] `POST /api/telemetry/batch` — batch upload telemetry events (array of events)
- [ ] `GET /api/telemetry/:sessionId/summary` — per-session technical summary
- [ ] Aggregate endpoint: `GET /api/telemetry/aggregate?studyId=X` — WER distribution, latency percentiles, error rates
- [ ] Typecheck passes

### US-5.04: Implement Engagement & Motivation Logging
**Description:** As a researcher, I need detailed engagement metrics so that session completion rates, time-on-task, and motivation indicators can be analyzed.

**Acceptance Criteria:**
- [ ] Add `engagementEvents` MongoDB collection: sessionId, playerId, eventType, timestamp, metadata
- [ ] Event types: `session_start`, `session_end`, `session_pause`, `session_resume`, `quest_started`, `quest_completed`, `quest_abandoned`, `area_explored`, `npc_conversation_started`, `npc_conversation_ended`, `menu_opened`, `menu_closed`, `idle_detected` (no input for 60s), `frustration_signal` (rapid repeated actions or ESC presses)
- [ ] Auto-detect session boundaries: start on game load, end on close/navigate away, pause on tab blur
- [ ] Calculate per-session metrics: total active time, idle time, actions per minute, quest completion rate
- [ ] `POST /api/engagement/event` — single event submission (for real-time tracking)
- [ ] `POST /api/engagement/batch` — batch submission (for offline sync)
- [ ] `GET /api/engagement/sessions?playerId=X&studyId=Y` — session history with computed metrics
- [ ] Dashboard endpoint: `GET /api/engagement/dashboard?studyId=X` — aggregate engagement metrics (avg session length, completion rate, actions/min distribution)
- [ ] Success criteria tracking: auto-flag if session completion drops below 70%
- [ ] Typecheck passes

### US-5.05: Build Researcher Dashboard UI
**Description:** As a researcher, I want a dashboard showing aggregated evaluation metrics across all participants so that I can monitor study progress and identify issues in real-time.

**Acceptance Criteria:**
- [ ] Create `ResearcherDashboard.tsx` page (accessible via `/research/:studyId`)
- [ ] Authentication: requires researcher role
- [ ] Overview panel: participant count, sessions completed, average session duration, overall completion rate
- [ ] Language progress panel: average fluency gain, vocabulary learned distribution, grammar accuracy trends
- [ ] Technical panel: WER distribution histogram, latency percentile chart (p50, p95, p99), error rate over time
- [ ] Engagement panel: session completion funnel, time-on-task distribution, frustration signal frequency
- [ ] Language cohort view: group participants by target language, show per-language and cross-language metrics
- [ ] Per-participant drill-down: click participant to see individual progress, session history, assessment scores
- [ ] Export all data: CSV download per metric category, combined Excel workbook, filterable by target language
- [ ] Auto-refresh every 30 seconds during active study sessions
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-5.06: Implement Pre/Post/Delayed Test Framework
**Description:** As a researcher, I need to administer language proficiency tests at three time points (pre-test, post-test, delayed post-test) so that learning gains and retention can be measured.

**Acceptance Criteria:**
- [ ] Create `AssessmentManager.ts` service for test administration
- [ ] Test types: vocabulary (productive: translate L1→L2; receptive: select meaning from options), grammar (grammaticality judgment: is this sentence correct?; gap-fill: complete the sentence), listening comprehension (play audio, answer questions), cultural knowledge (multiple choice about target culture)
- [ ] Each test has: test items (20-40 per type), scoring rubric, time limit (optional)
- [ ] Test items are language-specific and difficulty-stratified
- [ ] Three administration windows: `pre` (before first session), `post` (after last session), `delayed` (3 weeks after)
- [ ] Results stored in `languageAssessments` collection with `testWindow` field
- [ ] Auto-generate parallel test forms (different items, same difficulty) to avoid practice effects
- [ ] `GET /api/assessment/:participantId/schedule` — shows which tests are due
- [ ] `POST /api/assessment/:participantId/submit` — submit test responses with auto-scoring
- [ ] Typecheck passes

---

## Phase 6: Export Telemetry Pipeline

### US-6.01: Add Telemetry Client Library for Exported Games
**Description:** As a developer, I need a standalone telemetry client library that exported games can include to send playthrough data back to the Insimul server.

**Acceptance Criteria:**
- [ ] Create `shared/telemetry/telemetry-client.ts` — platform-agnostic telemetry client
- [ ] Configuration: `{ serverUrl, apiKey, worldId, playerId, batchSize, flushIntervalMs, maxRetries }`
- [ ] Queue-based: events queued locally, flushed in batches every `flushIntervalMs` (default: 120000ms / 2 minutes)
- [ ] Retry with exponential backoff: 1s, 2s, 4s, 8s, max 3 retries per batch
- [ ] Local persistence: if all retries fail, store batch in IndexedDB/localStorage (web) or file (native)
- [ ] On next successful connection, drain local store first
- [ ] Event types match canonical activity taxonomy from US-4.08
- [ ] API: `telemetryClient.track(eventType, data)`, `telemetryClient.flush()`, `telemetryClient.getLocalQueueSize()`
- [ ] Max local queue size: 10,000 events (oldest dropped if exceeded)
- [ ] Write unit tests for queue, retry, and local persistence logic
- [ ] Typecheck passes

### US-6.02: Add Telemetry Server Endpoints for External Games
**Description:** As a developer, I need server endpoints that accept telemetry from exported games with API key authentication so that playthrough data from distributed builds is collected.

**Acceptance Criteria:**
- [ ] Add `apiKeys` MongoDB collection: key, worldId, ownerId, permissions[], createdAt, expiresAt, isActive
- [ ] `POST /api/external/telemetry/batch` — accepts batch of telemetry events with API key in header
- [ ] API key validation: check key exists, is active, not expired, has `telemetry:write` permission
- [ ] Rate limiting: 100 requests/minute per API key
- [ ] Event validation: reject malformed events, accept partial batches (log rejected events)
- [ ] `GET /api/external/telemetry/status` — health check for telemetry endpoint (no auth required)
- [ ] `POST /api/worlds/:worldId/api-keys` — generate API key for a world (owner auth required)
- [ ] `DELETE /api/worlds/:worldId/api-keys/:keyId` — revoke API key
- [ ] Write integration tests for batch upload with valid/invalid/expired keys
- [ ] Typecheck passes

### US-6.03: Integrate Telemetry Client into Babylon.js Export
**Description:** As a game creator, I want Babylon.js exported games to automatically include telemetry so that player data flows back to Insimul without additional configuration.

**Acceptance Criteria:**
- [ ] Babylon export pipeline includes telemetry-client.ts in the exported bundle
- [ ] Export configuration dialog includes: "Enable Telemetry" toggle, Server URL field (pre-filled with current server), API Key selector (from world's keys)
- [ ] Exported game initializes telemetry client on load with configured settings
- [ ] All GameEventBus events auto-forwarded to telemetry client
- [ ] Language progress data included in telemetry batches
- [ ] Telemetry indicator in exported game: small icon showing connected/queued/offline status
- [ ] Player consent: on first launch, exported game shows consent dialog before enabling telemetry
- [ ] Typecheck passes

### US-6.04: Integrate Telemetry Client into Godot Export
**Description:** As a game creator, I want Godot exported games to include telemetry through GDScript integration.

**Acceptance Criteria:**
- [ ] Create `telemetry_client.gd` GDScript implementation of the telemetry protocol
- [ ] Uses Godot's HTTPRequest node for batch uploads
- [ ] Local queue persisted via `user://telemetry_queue.json`
- [ ] Godot export pipeline includes `telemetry_client.gd` and autoload configuration
- [ ] Export settings include telemetry configuration (server URL, API key)
- [ ] All game events routed through telemetry client
- [ ] Typecheck passes (TypeScript pipeline)

### US-6.05: Integrate Telemetry Client into Unity Export
**Description:** As a game creator, I want Unity exported games to include telemetry through C# integration.

**Acceptance Criteria:**
- [ ] Create `TelemetryClient.cs` C# implementation of the telemetry protocol
- [ ] Uses UnityWebRequest for batch uploads
- [ ] Local queue persisted via `Application.persistentDataPath/telemetry_queue.json`
- [ ] Unity export pipeline includes TelemetryClient script and prefab
- [ ] Export settings include telemetry configuration
- [ ] All game events routed through telemetry client
- [ ] Typecheck passes (TypeScript pipeline)

### US-6.06: Integrate Telemetry Client into Unreal Export
**Description:** As a game creator, I want Unreal exported games to include telemetry through C++ integration.

**Acceptance Criteria:**
- [ ] Create `TelemetryClient.h/.cpp` C++ implementation of the telemetry protocol
- [ ] Uses Unreal's FHttpModule for batch uploads
- [ ] Local queue persisted via `FPaths::ProjectSavedDir()/TelemetryQueue.json`
- [ ] Unreal export pipeline includes TelemetryClient source and plugin descriptor
- [ ] Export settings include telemetry configuration
- [ ] All game events routed through telemetry client
- [ ] Typecheck passes (TypeScript pipeline)

### US-6.07: Build Telemetry Monitoring Dashboard
**Description:** As a game creator, I want a dashboard showing telemetry data from all exported game instances so that I can monitor player behavior across distributed builds.

**Acceptance Criteria:**
- [ ] Create `TelemetryDashboard.tsx` component within World Intelligence tab
- [ ] Accessible via new "Telemetry" sub-view in World Intelligence
- [ ] Overview: total connected clients, events received (last hour/day/week), data volume
- [ ] Player activity timeline: aggregated events over time (hourly buckets)
- [ ] Event type distribution: pie chart of activity categories
- [ ] Error panel: recent errors from exported games
- [ ] Per-player drill-down: session history, event timeline, language progress
- [ ] API key management: create/revoke keys, view usage statistics
- [ ] Auto-refresh every 60 seconds
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

## Functional Requirements

### Content Editors
- FR-1: All content editors (rules, actions, quests, items, grammars, languages) show truth cross-reference badges
- FR-2: Every content type supports a `content` field containing canonical Prolog syntax
- FR-3: Content validation functions exist for rules, actions, and quests with real-time editor feedback
- FR-4: Items support crafting recipes, quest relevance tracking, and language-learning metadata
- FR-5: Grammars support truth bindings for context-aware text generation

### World Intelligence
- FR-6: World Intelligence tab provides unified access to History, Knowledge Base, Simulations, and Truth Manager
- FR-7: History sub-view shows scrollable timeline with era grouping, filtering, and causal chain visualization
- FR-8: Knowledge Base sub-view provides category-grouped facts, query builder, and suggested queries
- FR-9: Simulations sub-view supports lo-fi (historical) and hi-fi (gameplay) simulation modes
- FR-10: Truth Manager shows cross-references to all entity types and orphan detection
- FR-11: Truth Context Panel is available in every content editor

### Historical Simulation
- FR-12: Two-phase simulation: lo-fi historical compression (3.6% sampling default) + hi-fi gameplay
- FR-13: Era-appropriate probability models for births, deaths, marriages, business events
- FR-14: Tiered LLM enrichment: procedural (Tier 1), batched LLM (Tier 2), full LLM (Tier 3)
- FR-15: Multi-generational genealogy with genetic trait inheritance
- FR-16: Building/business lifecycle with founding, closure, succession, and demolition

### In-Game Systems
- FR-17: NPC volition system drives autonomous social behavior from personality
- FR-18: Romance system with 7 stages, spark mechanics, jealousy, and romance-specific actions
- FR-19: Puzzle system with 5+ types including language-specific puzzles
- FR-20: Softmax action selection from personality propensity weights
- FR-21: NPC ambient conversations reference world events, use target language proportionally
- FR-22: Temporary character states auto-expire after configured durations
- FR-23: Utterance-based quest objectives require specific target-language phrases
- FR-24: Canonical activity taxonomy standardizes all player events

### Telemetry & Evaluation
- FR-25: Server-side persistent storage for language progress, vocabulary, grammar, conversation records
- FR-26: Evaluation instrument endpoints for ACTFL, SUS, SSQ, IPQ, and all proficiency tests
- FR-27: Technical telemetry: WER, dialogue latency, FPS, error rates
- FR-28: Engagement logging with session boundaries, idle detection, frustration signals
- FR-29: Researcher dashboard with aggregate metrics, per-participant drill-down, and data export
- FR-30: Pre/post/delayed test framework with parallel test forms

### Export Telemetry
- FR-31: Standalone telemetry client library with queue, retry, and local persistence
- FR-32: Server endpoints for external telemetry with API key authentication and rate limiting
- FR-33: Telemetry integration in all 4 export pipelines (Babylon, Godot, Unity, Unreal)
- FR-34: Player consent flow in exported games before telemetry activation
- FR-35: Telemetry monitoring dashboard in World Intelligence tab

---

## Non-Goals (Out of Scope)

- **Real-time multiplayer** — Insimul remains single-player with server-side analytics
- **Voice/speech-to-text integration** — WER tracking uses text input comparison, not live audio (can be added later)
- **Mobile app export** — Focus on desktop/web (Babylon), Godot, Unity, Unreal only
- **AI-generated 3D assets** — Procedural generation uses existing asset collections, not AI image generation
- **Full NLG replacement** — Tracery + Gemini hybrid remains; no custom NLG engine
- **Multiplayer game exports** — Exported games are single-player
- **Automated ACTFL scoring** — Oral proficiency interviews require human raters; system only records data
- **A/B testing framework** — Study arms configured manually, not via automated A/B system

---

## Design Considerations

### World Intelligence Tab Layout
- Left panel: sub-view navigation (History, Knowledge Base, Simulations, Truth Manager, Telemetry)
- Center: main content area for selected sub-view
- Right: context panel (entity details, cross-references, quick actions)
- Bottom: query console (persistent across sub-views for Prolog queries)

### History Timeline UI
- Inspired by timeline visualization tools (TimelineJS, Vis.js Timeline)
- Horizontal scroll with zoom levels: century → decade → year → month → day
- Color-coded event nodes with significance-based sizing (world events larger than personal events)
- Causal chain arrows drawn between linked events
- Era bands as background color regions
- **Tiered view with smart clustering:** Three tiers — "Headlines" (importance 7+), "Notable" (4-6), "All" (1+). The "All" tier uses smart clustering to group similar events (e.g., "12 children born in 1892") to handle 50,000+ entries

### Genealogy Visualization
- Uses [family-chart](https://github.com/donatso/family-chart) library for interactive family tree rendering
- Integrated within the History sub-view as a "Family Tree" mode toggle
- Pan/zoom, collapsible branches, customizable node rendering (show name, birth/death years, occupation)
- Click node to navigate to character's truth timeline

### Historical Simulation Determinism
- Seeded PRNG used for all procedural decisions (births, deaths, marriages, business events)
- "Allow Variation" toggle: ON by default (non-deterministic for creative use), OFF for study reproducibility
- When deterministic: seed locked, LLM calls use `temperature: 0`, all random decisions reproducible
- Seed displayed in simulation config and exportable for reproduction

### Truth Integration Pattern
- Every entity detail panel gets a collapsible "Truth Context" section at the bottom
- Badge format: `🔗 3 truths` — clickable to expand
- Cross-references are bidirectional and auto-maintained

### Telemetry Data Flow
```
Exported Game → Local Queue (IndexedDB/File)
                    ↓ (every 2 min)
              REST Batch Upload
                    ↓
          Insimul Server /api/external/telemetry/batch
                    ↓
           MongoDB (telemetry collections)
                    ↓
          Researcher Dashboard / Export CSV
```

---

## Technical Considerations

### Database Schema Additions
- 8 new MongoDB collections: `languageProgress`, `vocabularyEntries`, `grammarPatterns`, `conversationRecords`, `languageAssessments`, `evaluationResponses`, `technicalTelemetry`, `engagementEvents`, `apiKeys`
- Index strategy: all collections indexed on `(playerId, worldId)` and `(sessionId)` for query performance
- TTL indexes on `technicalTelemetry` (90 days) and `engagementEvents` (180 days) to manage storage

### Backward Compatibility
- Existing worlds default to `timestepUnit: "year"`, `gameplayTimestepUnit: "day"`
- Existing truths remain at timestep 0 (interpreted as "present at world creation")
- Existing Prolog content validated but not rejected if it doesn't match canonical format (warnings only)
- Tab URL routing preserves old `/truth` and `/kb` routes as redirects to World Intelligence sub-views

### Performance Constraints
- Lo-fi 140-year simulation: < 30 seconds for a settlement of 200 starting characters
- LLM batching: max 20 events per batch call to stay under context limits
- Telemetry batch upload: max 500 events per request, max 100KB payload
- History timeline: virtualized rendering for worlds with 10,000+ truth entries
- KB fact display: paginated (100 facts per page) with category-level counts pre-computed

### Migration Strategy
- Schema additions are additive (new fields, new collections) — no destructive changes
- Migration scripts for: timestep fields on worlds, truth cross-reference fields, language progress collections
- Backup verification before each migration phase

---

## Success Metrics

- **Content Editor:** Truth cross-references visible in 100% of content editors; validation covers 100% of base rules/actions
- **History:** Worlds can generate 140+ years of history in < 60 seconds including LLM enrichment for major events
- **Game Completeness:** All 10 player activity types (talk, fight, collect, craft, visit, listen, puzzle, romance, speak, quest) functional with event emission
- **Telemetry Coverage:** 100% of canonical activity types tracked; language progress synced within 60 seconds
- **Evaluation Alignment:** All 14 measures from evaluation-plan.pdf have corresponding data collection endpoints
- **Export Telemetry:** Exported Babylon games successfully batch-upload telemetry with < 1% data loss
- **Study Readiness:** System supports full Study 1 (pilot) workflow: participant onboarding → 30-min session → data export

---

## Resolved Design Decisions

1. **Truth visualization at scale:** Tiered view ("Headlines" importance 7+, "Notable" 4-6, "All" 1+) combined with smart clustering for the "All" tier (e.g., "12 children born in 1892" instead of 12 individual entries). This handles 50,000+ entries gracefully while keeping major events prominent.

2. **Multi-language evaluation support:** Fully multi-language — participants studying different target languages can be in the same study, grouped by target language with cross-language comparison available in the researcher dashboard. Test items are language-specific; analysis done within-language with optional cross-language reporting.

3. **Offline assessment:** Online-only — simpler implementation, timestamps guaranteed, auto-scored. All pre/post/delayed tests administered through the web interface with reliable server connection required.

4. **LLM provider flexibility:** Provider-agnostic interface implemented but only Gemini initially — abstraction layer supports future addition of OpenAI, Anthropic, and local models (Ollama/LMStudio) without architectural changes. Cost estimation deferred until multiple providers are available.

5. **VR telemetry:** Basic VR telemetry only — session type (VR vs desktop), comfort settings used, and SSQ-relevant metrics (session duration in VR, comfort setting changes, pause frequency). No controller/head position tracking for now.

6. **Genealogy visualization:** Use [family-chart](https://github.com/donatso/family-chart) library for the family tree view in the History sub-view. This provides a polished, interactive genealogy UI out of the box with pan/zoom, collapsible branches, and customizable node rendering. Integrate within the editor for 2D genealogy views.

7. **Historical simulation determinism:** Deterministic by default (same seed + config = identical history) with an "Allow Variation" toggle that is **ON by default** for non-study use. When toggled off (deterministic mode), the seed is locked and all random decisions use seeded PRNG. Study configurations should set "Allow Variation" to OFF for reproducibility. LLM-enriched events (Tiers 2-3) include a `temperature: 0` override in deterministic mode for maximum reproducibility.
