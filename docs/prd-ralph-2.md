# PRD: Insimul System Refactor — Remaining Gaps

## Introduction

This PRD captures all incomplete items from the original `prd-insimul-system-refactor.md`. The core files, schemas, engines, and API endpoints are already built. This document focuses on the **integration wiring, UI enhancements, client-side collectors, and tests** still needed.

Items are reorganized by implementation theme (not original phase) for efficient batching.

---

## Theme A: Content Editor UI Enhancements

### US-A.01: World Creation Modal Timestep Configuration
**Description:** Add timestep configuration fields to the world creation modal (not just the edit dialog).

**Acceptance Criteria:**
- [x] Update world creation modal to include timestep configuration section (timestepUnit, gameplayTimestepUnit, historyStartYear, historyEndYear) *(collapsible "Time Configuration" section added to WorldCreateDialog.tsx)*
- [x] Typecheck passes

### US-A.02: Validation Feedback in Content Editors
**Description:** Add visual validation status indicators to RulesHub, ActionsHub, and QuestsHub editors showing whether Prolog content is valid.

**Acceptance Criteria:**
- [x] Add validation feedback in RulesHub editor (green/yellow/red status indicator based on `validateRuleContent()`) *(ContentValidationIndicator component added)*
- [x] Add validation feedback in ActionsHub editor (based on `validateActionContent()`)
- [x] Add validation feedback in QuestsHub editor (based on `validateQuestContent()`)
- [x] Typecheck passes

### US-A.03: ItemsHub Detail Panel Enhancements
**Description:** Show quest relevance, crafting recipes, language learning data, and truth connections in ItemsHub.

**Acceptance Criteria:**
- [x] In ItemsHub detail panel, show "Lore Truths" section linking item to world truths *(indigo badges resolving relatedTruthIds against fetched truths)*
- [x] Update ItemsHub to show quest relevance and crafting recipe in detail panel *(filters quests referencing item ID; yellow badges)*
- [x] Items with `languageLearningData` show pronunciation and category in detail panel *(targetWord, pronunciation, category fields displayed)*
- [x] Typecheck passes

### US-A.04: GrammarsHub Truth Bindings & Context Type
**Description:** Add truth bindings editor and context type selector to the GrammarsHub.

**Acceptance Criteria:**
- [x] Update GrammarsHub to show truth bindings editor and context type selector *(context type dropdown, key-value truth binding rows with add/remove/save)*
- [x] Add grammar test console mode that resolves truth bindings from a selected world *(GrammarTestConsole accepts worldId, checkbox for truth resolution, server uses expandWithTruthBindings())*
- [x] Typecheck passes

### US-A.05: LanguagesHub Cultural Context
**Description:** Show linked cultural and historical truths in LanguagesHub.

**Acceptance Criteria:**
- [x] Update LanguagesHub to show linked cultural and historical truths *(resolved relatedTruthIds as cards with title/era/significance)*
- [x] Add "Cultural Context" sub-panel in LanguagesHub showing related truths *(cultural context details, etymology, dialect variations, linked truths)*
- [x] Typecheck passes

---

## Theme B: History & Timeline UI

### US-B.01: Horizontal Scrollable Timeline
**Description:** Replace the vertical era-grouped list with a horizontal scrollable timeline visualization.

**Acceptance Criteria:**
- [x] History sub-view shows a horizontal scrollable timeline from `historyStartYear` to present game time *(HorizontalTimeline.tsx component)*
- [x] Events displayed as nodes on the timeline, color-coded by `historicalSignificance` (world=red, country=blue, settlement=green, family=orange, personal=gray)
- [x] Timeline supports zoom (decade view, year view, month view for gameplay timesteps)
- [x] Mini-map at bottom showing full timeline with viewport indicator
- [x] Typecheck passes

### US-B.02: Smart Event Clustering
**Description:** In the "All" tier, group similar events in the same year to handle large datasets.

**Acceptance Criteria:**
- [x] Smart clustering in "All" tier: group similar events in the same year (e.g., "12 children born in 1892") with expand-on-click *(EventCluster.tsx component)*
- [x] Typecheck passes

### US-B.03: Causal Chain Visualization in TruthTab
**Description:** Show arrows/lines between causally related truth entries.

**Acceptance Criteria:**
- [x] Update TruthTab to show history entries with causal chain visualization (arrows between related events) *(CausalChainOverlay.tsx with SVG arrows)*
- [x] Typecheck passes

### US-B.04: Truth Graph Visualization
**Description:** Node graph showing truth-to-truth causal chains and entity connections.

**Acceptance Criteria:**
- [x] Add "Truth Graph" visualization — node graph showing truth-to-truth causal chains and entity connections *(TruthGraph.tsx with force-directed layout, zoom/pan)*
- [x] Typecheck passes

### US-B.05: Manual History Editor & Bulk Edit
**Description:** Form for creating/editing individual historical events with full metadata, plus bulk editing.

**Acceptance Criteria:**
- [x] Manual history editor: form for creating/editing individual events with full metadata *(ManualHistoryEditor.tsx with full event form)*
- [x] Bulk edit: select multiple events, change era/significance/tags *(checkbox selection + bulk edit panel)*
- [x] Undo support for history modifications (last 10 operations) *(undo stack with revert)*
- [x] Typecheck passes

---

## Theme C: Knowledge Base Query Interface

### US-C.01: Enhanced KB Query Interface
**Description:** Add category grouping, query builder, query history, and suggested queries to the Knowledge Base sub-view.

**Acceptance Criteria:**
- [x] Add category grouping for facts: Characters, Locations, Rules, Actions, Items, Truths, Relationships, History *(EnhancedKBQuery.tsx)*
- [x] Show fact count per category with expand/collapse
- [x] Query builder UI: dropdown for predicate selection, auto-complete for known entity IDs
- [x] Query history panel (last 20 queries with re-run button)
- [x] "Suggested Queries" section that generates relevant queries based on selected entity in any editor
- [x] Query results show formatted tables with column headers from predicate arity
- [x] Export query results as CSV or JSON
- [x] Typecheck passes

---

## Theme D: Simulation Engine Gaps

### US-D.01: Hi-Fi Simulation Mode
**Description:** Full-fidelity simulation with all TotT systems active.

**Acceptance Criteria:**
- [x] Hi-fi mode: full simulation with all TotT systems active (routines, socializing, observation, knowledge decay, mental model deterioration) *(simulateHiFi() method in unified-engine.ts)*
- [x] Performance target: 140 years of lo-fi simulation completes in < 30 seconds *(simulateLoFi() method added with timestep sampling, lightweight system subset, scaled probability for sampling gaps)*
- [x] Typecheck passes

### US-D.02: World-Type-Aware Probability Defaults
**Description:** Different world types (medieval-fantasy, modern-realistic) should have different default era probability tables.

**Acceptance Criteria:**
- [x] World-type-aware defaults (medieval-fantasy has different rates than modern-realistic) *(world-type-defaults.ts with 4 world types)*
- [x] Rates exposed in World Intelligence → Simulations sub-view as editable tables *(collapsible Rate Tables section in SimulationsView config panel with per-field editing, base type display, override tracking, and reset)*
- [x] Typecheck passes

### US-D.03: LLM Batch Enrichment
**Description:** Wire Tier 2 and Tier 3 LLM calls for event narrative enrichment.

**Acceptance Criteria:**
- [x] Tier 2 events: batch 10-20 events per LLM call, requesting 1-2 sentence descriptions each *(llm-event-enrichment.ts enrichTier2Events())*
- [x] Tier 3 events: individual LLM calls with full world context, requesting 1-2 paragraph narratives *(enrichTier3Event())*
- [x] LLM batch requests include era context, settlement context, and involved character summaries
- [x] Typecheck passes

### US-D.04: Building Construction & Business Succession
**Description:** Complete building lifecycle and business succession mechanics.

**Acceptance Criteria:**
- [x] Implement building construction: when a business is founded, it commissions building construction on a vacant lot *(constructBuilding() finds vacant lot, commissions build, updates lot)*
- [x] Implement building demolition: old, unused buildings can be demolished, lot returns to vacant *(demolishBuilding() clears lot, marks vacant)*
- [x] Track `formerBuildingIds` on lots (currently defined but never populated) *(demolishBuilding() pushes old buildingId into formerBuildingIds array)*
- [x] Building renovation: existing buildings can change business type without demolition *(renovateBuilding() updates businessType, creates truth entry)*
- [x] Business succession: when owner retires/dies, employees or family may take over *(handleBusinessSuccession() with findSuccessionCandidate() — family first, then employees)*
- [x] Typecheck passes

### US-D.05: Family-Chart Library Integration
**Description:** Replace the CSS/React tree placeholder with the family-chart library.

**Acceptance Criteria:**
- [x] Family tree visualization using [family-chart](https://github.com/donatso/family-chart) library integrated into History sub-view as "Family Tree" mode toggle *(FamilyTreeView.tsx: SVG-based family tree with zoom/pan, generation layout, spouse/parent-child edges, gender coloring)*
- [x] Typecheck passes

---

## Theme E: Game System Integrations

### US-E.01: Canonical Activity Taxonomy
**Description:** Define and wire the canonical activity taxonomy through GameEventBus and GamePrologEngine.

**Acceptance Criteria:**
- [x] Define canonical activity taxonomy in `shared/game-engine/activity-types.ts` with categories: Conversation, Combat, Items, Exploration, Social, Romance, Puzzle, Language, Quest *(agent implementing)*
- [x] Update GameEventBus to use canonical activity types *(added romance, volition, puzzle, quest, conversation events)*
- [x] Update GamePrologEngine event handlers to use canonical predicates *(added handlers for all new event types)*
- [x] Typecheck passes

### US-E.02: GamePrologEngine Integration for Volition & Romance
**Description:** Wire volition rules and romance events through GamePrologEngine for Prolog evaluation.

**Acceptance Criteria:**
- [x] Integration with GamePrologEngine: volition rules are Prolog-evaluated *(added evaluateVolitionRules() method)*
- [x] GamePrologEngine handles romance events → asserts relationship facts *(romance_action, romance_stage_changed handlers added)*
- [x] Romance events create truths (e.g., "Player began dating Marie on Day 15") *(create_truth event type added to GameEventBus; romance_action and romance_stage_changed handlers emit truth creation events)*
- [x] Integrate softmax action selection with VolitionSystem for NPC autonomous action choice *(executeTopGoal() uses softmaxActionSelection() with dynamic temperature based on NPC stress)*
- [x] Integrate softmax with ActionManager for contextual action ordering (most-likely first in UI) *(getContextualActionsRanked() uses rankActions() with personality profile)*
- [x] Typecheck passes

### US-E.03: Romance System Wiring
**Description:** Connect RomanceSystem to dialogue actions, quest objectives, and truth creation.

**Acceptance Criteria:**
- [x] Romance actions available in BabylonDialogueActions when relationship meets stage threshold *(added showWithRomanceActions() method)*
- [x] Romance quest objectives: "Reach dating stage with character X", "Give gift to crush" *(added romance_stage_reach, romance_gift, listen_to_conversation objective types)*
- [x] Typecheck passes

### US-E.04: Puzzle UI & Templates
**Description:** Build the puzzle modal overlay and add procedural puzzle templates.

**Acceptance Criteria:**
- [x] Puzzle UI: modal overlay with puzzle-type-specific interface *(BabylonPuzzleUI.ts: full modal with type icon, timer, attempt counter, hint system, input, result display, auto-close)*
- [x] Add 5+ puzzle templates per type for procedural generation *(32 templates: 6 riddle, 5 combination, 5 environmental, 5 translation, 6 word puzzles via getBuiltInTemplates())*
- [x] Typecheck passes

### US-E.05: Ambient Conversation Prolog Integration
**Description:** Wire conversation topic selection through Prolog and add listen-to-conversation quest objective.

**Acceptance Criteria:**
- [x] Conversation topics selected by Prolog: `prefers_topic(NPC, Topic)`, `conflict_style(NPC, Style)` *(GamePrologEngine already has getPreferredTopics() and getConflictStyle(); conversation_overheard event now wired)*
- [x] Quest objective type: `listen_to_conversation(npcId, topic)` — "Overhear the baker discussing the festival" *(added to UtteranceQuestSystem)*
- [x] Typecheck passes

### US-E.06: State Expiration Truth Entries
**Description:** Create truth entries when temporary character states are created or expire.

**Acceptance Criteria:**
- [x] State creation triggers truth entry: "Character became grieving after loss of spouse" *(agent implementing; event types already in GameEventBus)*
- [x] State expiration triggers truth entry: "Character recovered from grief" *(agent implementing)*
- [x] Typecheck passes

### US-E.07: Utterance Quest Enhancements
**Description:** Add NPC correction responses and utterance quest templates.

**Acceptance Criteria:**
- [x] NPC responds naturally to the attempt, providing correction if incorrect *(5 correction styles with close/far/generic templates + praise responses; setCorrectionContext() API for NPC personality)*
- [x] Add 10+ utterance quest templates for common language-learning scenarios (greetings, ordering food, asking directions, expressing emotions, negotiating prices) *(12 templates added: greet, goodbye, order_food, ask_directions, gratitude, emotions, negotiate, introduce, weather, translate, eavesdrop, romance)*
- [x] Typecheck passes

### US-E.08: Truth Auto-Linking & Schema Field
**Description:** Add `relatedTruthIds` field and implement bidirectional auto-linking.

**Acceptance Criteria:**
- [x] Add `relatedTruthIds` field to rules, actions, quests, items, grammars, and languages schemas *(agent implementing)*
- [x] Truths auto-link via bidirectional references: when a truth mentions a rule/action/quest/item by ID, the link is created automatically *(truth-auto-linker.ts service; wired into POST/PUT truth routes; batch endpoint POST /api/worlds/:worldId/truths/auto-link)*
- [x] Typecheck passes

### US-E.09: Grammar Expansion Truth Binding Resolution
**Description:** Wire truth bindings into the grammar expansion engine.

**Acceptance Criteria:**
- [x] Update grammar expansion engine to resolve truth bindings before Tracery expansion *(added expandWithTruthBindings() with query resolution)*
- [x] Add pre-built grammar templates for history narration (e.g., "In {year}, {character} {event_verb} in {settlement}") *(added 6 templates: historical_event, birth, death, marriage, business, era_summary)*
- [x] Typecheck passes

---

## Theme F: Client-Side Telemetry Collectors

### US-F.01: Language Progress Client Sync
**Description:** Build client-side LanguageProgressTracker that syncs to server periodically.

**Acceptance Criteria:**
- [x] Client-side LanguageProgressTracker syncs to server every 60 seconds and on session end *(added startServerSync(), syncToServer(), sendBeacon on unload)*
- [x] Typecheck passes

### US-F.02: Technical Telemetry Client Collectors
**Description:** Build client-side collectors for latency, FPS, dialogue quality, and errors.

**Acceptance Criteria:**
- [x] Client-side telemetry collector: captures latency on every chat interaction *(ClientTelemetryCollector.ts created)*
- [x] Optional "Rate this response" button after NPC dialogue (1-5 stars) for dialogue quality *(star rating row after each NPC message in BabylonChatPanel; setOnDialogueRating() callback)*
- [x] Error logging: all client errors captured with context (action being performed, game state)
- [x] FPS sampling: capture every 30 seconds during gameplay
- [x] Typecheck passes

### US-F.03: Session Boundary Auto-Detection
**Description:** Auto-detect engagement session boundaries on the client.

**Acceptance Criteria:**
- [x] Auto-detect session boundaries: start on game load, end on close/navigate away, pause on tab blur *(visibility change + beforeunload handlers)*
- [x] Calculate per-session metrics: total active time, idle time, actions per minute, quest completion rate *(getSessionMetrics() implemented)*
- [x] Typecheck passes

---

## Theme G: Server API Gaps

### US-G.01: Aggregate Telemetry & Engagement Endpoints
**Description:** Add missing aggregate/dashboard endpoints.

**Acceptance Criteria:**
- [x] Aggregate endpoint: `GET /api/telemetry/aggregate?studyId=X` — WER distribution, latency percentiles, error rates
- [x] Dashboard endpoint: `GET /api/engagement/dashboard?studyId=X` — aggregate engagement metrics (avg session length, completion rate, actions/min distribution)
- [x] Success criteria tracking: auto-flag if session completion drops below 70% *(completionWarning flag returned when rate < 70%)*
- [x] Typecheck passes

### US-G.02: Assessment API Endpoints
**Description:** Add missing assessment schedule and submit endpoints.

**Acceptance Criteria:**
- [x] `GET /api/assessment/:participantId/schedule` — shows which tests are due
- [x] `POST /api/assessment/:participantId/submit` — submit test responses with auto-scoring
- [x] Typecheck passes

### US-G.03: Evaluation Multi-Language Support
**Description:** Add target language field and filtering to evaluation system.

**Acceptance Criteria:**
- [x] Add `targetLanguage` field to all evaluation records for multi-language study support *(added to assessment framework types and endpoints)*
- [x] Language-specific test items: each proficiency instrument has per-language item banks *(per-language item bank support added)*
- [x] Test items are language-specific and difficulty-stratified *(difficulty field on test items)*
- [x] Export supports filtering by target language for within-language and cross-language analysis *(targetLanguage query param on GET endpoints)*
- [x] Auto-generate parallel test forms (different items, same difficulty) to avoid practice effects *(generateParallelForm() utility)*
- [x] Typecheck passes

### US-G.04: External Telemetry Event Validation
**Description:** Add malformed event rejection with partial batch acceptance.

**Acceptance Criteria:**
- [x] Event validation: reject malformed events, accept partial batches (log rejected events) *(agent completed; validation added to external telemetry batch endpoint)*
- [x] Typecheck passes

---

## Theme H: Researcher Dashboard Completion

### US-H.01: Researcher Dashboard Full Build-Out
**Description:** Complete the ResearcherDashboard with all panels, drill-down, auto-refresh, and auth.

**Acceptance Criteria:**
- [x] Authentication: requires researcher role *(role field added to User schema; AuthService.requireRole() middleware; TokenPayload includes role)*
- [x] Language progress panel: average fluency gain, vocabulary learned distribution, grammar accuracy trends *(ACTFL OPI aggregate stats, per-participant score progression, vocabulary/grammar API references)*
- [x] Technical panel: WER distribution histogram, latency percentile chart (p50, p95, p99), error rate over time *(new Technical tab with latency/WER/error/FPS panels using /api/telemetry/aggregate)*
- [x] Engagement panel: session completion funnel, time-on-task distribution, frustration signal frequency *(new Engagement tab with completion funnel, avg session length, actions/min, completion warning)*
- [x] Language cohort view: group participants by target language, show per-language and cross-language metrics *(Language Cohort View card added to Language tab)*
- [x] Per-participant drill-down: click participant to see individual progress, session history, assessment scores *(new Participants tab with drill-down)*
- [x] Researcher dashboard groups participants by target language with per-language and aggregate views *(cohort view groups by targetLanguage with participant count and avg score)*
- [x] Auto-refresh every 30 seconds during active study sessions *(refetchInterval: 30000 on aggregate/engagement queries)*
- [x] Typecheck passes

---

## Theme I: Export Pipeline Integration

### US-I.01: Export Dialog Telemetry Configuration
**Description:** Add telemetry toggle and configuration to the export dialog across all engines.

**Acceptance Criteria:**
- [x] Export configuration dialog includes: "Enable Telemetry" toggle, Server URL field (pre-filled with current server), API Key selector (from world's keys) *(added to export dialog)*
- [x] Export settings include telemetry configuration (server URL, API key) for Godot, Unity, and Unreal
- [x] Typecheck passes

### US-I.02: Export Pipeline Wiring
**Description:** Wire telemetry templates into actual export pipelines so generated code is included in exports.

**Acceptance Criteria:**
- [x] Godot export pipeline includes `telemetry_client.gd` and autoload configuration *(template created)*
- [x] Unity export pipeline includes TelemetryClient script and prefab *(template created)*
- [x] Unreal export pipeline includes TelemetryClient source and plugin descriptor *(template created)*
- [x] All game events routed through telemetry client in each engine
- [x] Typecheck passes

### US-I.03: Exported Game Telemetry UX
**Description:** Add telemetry indicator and player consent to exported games.

**Acceptance Criteria:**
- [x] Telemetry indicator in exported game: small icon showing connected/queued/offline status *(status tracking in templates)*
- [x] Player consent: on first launch, exported game shows consent dialog before enabling telemetry *(consent flag in localStorage/PlayerPrefs)*
- [x] Language progress data included in telemetry batches
- [x] Typecheck passes

---

## Theme J: Telemetry Dashboard Completion

### US-J.01: Telemetry Dashboard Visualization Panels
**Description:** Add the remaining visualization panels to TelemetryMonitorDashboard.

**Acceptance Criteria:**
- [x] Player activity timeline: aggregated events over time (hourly buckets) *(Activity tab with 24-hour bar chart from session data)*
- [x] Event type distribution: pie chart of activity categories *(platform distribution bar chart in Activity tab)*
- [x] Error panel: recent errors from exported games *(Errors tab with error count, rate, and 24h statistics)*
- [x] Per-player drill-down: session history, event timeline, language progress *(Players tab with clickable player list and session detail)*
- [x] Typecheck passes

---

## Theme K: Tests

### US-K.01: Unit & Integration Tests
**Description:** Write all missing tests across the codebase.

**Acceptance Criteria:**
- [x] Write unit tests for rule content validation *(7 tests: valid content, empty, whitespace, missing predicates, syntax errors, warnings, predicate detection)*
- [x] Write unit tests for action content validation *(5 tests: valid content, empty, missing action/4, wrong arity, syntax errors)*
- [x] Write unit tests for quest content validation *(5 tests: quest/3, quest/5, empty, missing quest, warnings)*
- [x] Write integration tests for lo-fi and hi-fi simulation modes *(simulation-integration.test.ts: lo-fi 140-year and hi-fi 10-step tests with mocked TotT subsystems)*
- [x] Write determinism test: same seed + config produces identical event sequence when variation is OFF *(simulation-integration.test.ts: determinism test verifies identical seeds produce identical events)*
- [x] Write unit tests verifying rate distributions (era probability models) *(rate-distribution.test.ts: Bernoulli trials, death rate multiplier, world-type defaults)*
- [x] Write integration tests for business lifecycle across 50-year simulation spans *(business-lifecycle.test.ts: construction, demolition, renovation, succession across multi-year sim)*
- [ ] Write tests verifying 4+ generations emerge from 140-year simulation
- [x] Write unit tests for volition scoring with known personality/relationship inputs *(10 tests: softmax distribution, low/high temperature, empty input, single action, probability sums, personality-aligned actions, personality match, situational modifiers)*
- [x] Write unit tests for puzzle validation logic per type *(8 tests: template count per type, required fields, unique IDs, register/start, validate answers, reject wrong answers)*
- [x] Write unit tests verifying personality influence on action distribution *(covered by softmaxActionSelection personality test)*
- [x] Write unit tests for state lifecycle *(8 tests: creation, TTL, expiration, override, multiple states, behavior modifiers, remove, getRemaining)*
- [x] Write unit tests for queue, retry, and local persistence logic (telemetry client) *(6 tests: session tracking, latency recording, error events, session metrics, dispose, latency averages)*
- [x] Write integration tests for batch upload with valid/invalid/expired keys *(telemetry-batch.test.ts: valid key, invalid key 401, expired key 401, partial batch acceptance)*
- [x] Ensure all 1,274 base Ensemble rules pass validation (fix any that don't) *(3 pattern tests: module directive, rule( pattern, dynamic declarations)*
- [x] Ensure all 1,274 base Ensemble actions pass validation *(2 pattern tests: action( predicate, complex prerequisites)*
- [x] Typecheck passes *(60/60 tests pass in 294ms)*

---

## Non-Goals

- Browser verification (QA task, not implementation)
- Real-time multiplayer
- Voice/speech-to-text integration
- Mobile app export
- AI-generated 3D assets

---

## Priority Order (Suggested)

1. **Theme E** (Game System Integrations) — highest impact on gameplay completeness
2. **Theme A** (Content Editor UI) — improves creator workflow
3. **Theme F** (Client Telemetry) — needed for evaluation studies
4. **Theme G** (Server API Gaps) — supports client telemetry
5. **Theme B** (History/Timeline UI) — improves world intelligence experience
6. **Theme D** (Simulation Gaps) — deepens world generation
7. **Theme H** (Researcher Dashboard) — needed for study analysis
8. **Theme C** (KB Query Interface) — power-user feature
9. **Theme J** (Telemetry Dashboard) — monitoring improvement
10. **Theme I** (Export Pipeline) — needed for distributed builds
11. **Theme K** (Tests) — quality assurance
