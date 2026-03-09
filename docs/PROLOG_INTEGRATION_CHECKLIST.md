# Prolog Integration Checklist

Tracks progress on integrating Prolog reasoning throughout Insimul's editor, game engine, and exports.

---

## Phase 0: Foundation Fixes

- [x] Fix base rules API route ordering (`/api/rules/base` before `/api/rules/:id`)
- [x] Seed base rules migration (714 base rules in DB)
- [x] Base rules visible in RulesHub UI (World Rules + Base Rules tree)
- [x] Base rules categorization — `POST /api/rules/base/categorize` auto-categorizes via keyword matching
- [ ] Clean up duplicate/overlapping base rules (684 pre-existing + 30 seeded)

## Phase 1: Portable Prolog Engine (tau-prolog)

- [x] Add tau-prolog dependency (`npm install tau-prolog`)
- [x] Create `shared/prolog/tau-engine.ts` — portable Prolog engine wrapper
- [x] Implement fact assertion/retraction API
- [x] Implement query execution API
- [x] Create test suite validating tau-prolog (43 tests, all passing)
- [x] Integrate tau-prolog into client bundle (replaces need for SWI-Prolog on client)
  - [x] `shared/prolog/tau-engine.ts` imported by both client and server
  - [x] `GamePrologEngine` uses tau-prolog directly in browser
- [x] Keep SWI-Prolog as server-side option for heavy simulation workloads
  - [x] `server/engines/prolog/prolog-manager.ts` still available for SWI-Prolog
  - [x] tau-prolog used as primary engine; SWI-Prolog as fallback

## Phase 2: Predicate-First Data Model

- [x] Core predicates schema (`server/schema/core-predicates.json`)
- [x] Predicate discovery tool (`server/engines/predicate-discovery.ts`)
- [x] Predicate validator with spell-checking (`server/engines/predicate-validator.ts`)
- [x] Auto-generate Prolog predicates when editor entities are created/updated:
  - [x] Characters → `person/1`, `age/2`, `gender/2`, `occupation/2`, etc.
  - [x] Relationships → `married_to/2`, `parent_of/2`, `friend_of/2`, etc.
  - [x] Locations/Settlements → `settlement/1`, `settlement_type/2`, `population/2`
  - [x] Businesses → `business/1`, `owns/2`, `business_type/2`
  - [x] Items → `has_item/2`, `item_name/2`, `item_type/2`, `item_value/2`
- [x] Auto-sync service (`server/engines/prolog/prolog-auto-sync.ts`) with route hooks
- [x] Tau-prolog query/stats/export API endpoints (`/api/prolog/tau/*`)
- [x] Auto-sync on first query if world not yet loaded
- [x] Remove need for "Sync from DB" button — predicates stay in sync automatically
  - [x] `prologAutoSync.ensureInitialized()` runs on first query per world
  - [x] Route hooks sync on entity create/update/delete
- [x] Two-way sync: Prolog state changes reflected back to database
  - [x] `syncPrologToDatabase()` detects changes in `married_to`, `dead`, `occupation`, `wealth`, `friend_of`, `enemy_of`
  - [x] `startBidirectionalSync()` / `stopBidirectionalSync()` for periodic sync (30s default)
  - [x] `POST /api/prolog/tau/sync-back/:worldId` endpoint for manual trigger

## Phase 3: Rules as Prolog

- [x] Add `prologContent` field to rules schema (Drizzle + MongoDB + Zod)
- [x] Rule-to-Prolog converter (`shared/prolog/rule-converter.ts`)
  - [x] Ensemble format conditions → Prolog goals (predicates, negation, comparisons)
  - [x] Insimul DSL → Prolog (when/then blocks parsed)
  - [x] JSON conditions/effects → Prolog predicates
  - [x] Batch conversion with shared dynamic declarations
- [x] Auto-convert on rule create/update in API routes
- [x] Prolog syntax validation via tau-prolog (`validatePrologSyntax`)
- [x] RulesHub UI: Source/Prolog toggle to view auto-generated Prolog content
- [x] Full rule detail fetch on selection (loads content + prologContent)
- [ ] Rules editor: option to author rules directly as Prolog (sourceFormat: 'prolog')
- [ ] Rules editor: predicate autocomplete from core-predicates schema
- [x] Base rules: batch convert 714 existing base rules to add prologContent
  - [x] `POST /api/rules/base/convert-all` endpoint runs `convertRuleToProlog` on all base rules
- [x] RuleEnforcer can evaluate Prolog conditions (via tau-prolog)
  - [x] `evaluateRuleViaProlog()` queries `rule_applies/3`
  - [x] `canPerformActionAsync()` checks Prolog first, falls back to JS

## Phase 4: Actions as Prolog

- [x] Add `prologContent` field to actions schema (Drizzle + MongoDB + Zod)
- [x] Action-to-Prolog converter (`shared/prolog/action-converter.ts`)
  - [x] Prerequisites → Prolog goals (attribute, trait, relationship, network, status, event, location, energy, intent)
  - [x] Effects → Prolog terms (relationship, attribute, status, event, item, knowledge, gold, dialogue, network)
  - [x] Generates `action/4`, `can_perform/2`, `can_perform/3`, prerequisite/effect predicates
- [x] Auto-convert on action create/update in API routes
- [x] ActionsHub UI: Source/Prolog toggle to view auto-generated Prolog content
- [ ] Actions editor: predicate-based prerequisite builder
- [x] Game engine evaluates action prerequisites via Prolog query
  - [x] `RuleEnforcer.canPerformActionAsync()` calls `GamePrologEngine.canPerformAction()`
  - [x] `BabylonGame.filterActionsByProlog()` filters dialogue actions through Prolog
- [x] Action execution updates Prolog knowledge base
  - [x] `GamePrologEngine.recordPlayerAction()` asserts player actions as Prolog facts

## Phase 5: Quests as Prolog

- [x] Add `prologContent` field to quests schema (Drizzle + MongoDB + Zod)
- [x] Quest-to-Prolog converter (`shared/prolog/quest-converter.ts`)
  - [x] Quest objectives → Prolog goals (collect, talk, visit, defeat, deliver, learn, craft, etc.)
  - [x] Completion criteria → Prolog terms (vocabulary_usage, conversation_turns, grammar, etc.)
  - [x] Prerequisites → `quest_prerequisite/2` linking quest chains
  - [x] Rewards → `quest_reward/3`, `quest_item_reward/3`, `quest_skill_reward/3`, `quest_unlock/3`
  - [x] Generates `quest_available/2`, `quest_complete/2` rules
- [x] Auto-convert on quest create/update in API routes
- [x] Auto-convert on AI-generated quests (`/api/worlds/:worldId/quests/generate`)
- [x] Added GET `/api/quests/:id` endpoint for full quest detail fetch
- [x] QuestsHub UI: Source/Prolog toggle to view auto-generated Prolog content
- [x] Quest tracker evaluates progress via Prolog
  - [x] `BabylonQuestTracker.evaluateQuestCompletion()` via `GamePrologEngine.isQuestComplete()`
  - [x] `BabylonQuestTracker.isQuestAvailable()` via `GamePrologEngine.isQuestAvailable()`
  - [x] Progress calculation triggers async Prolog completion check
- [x] Quest state changes update knowledge base
  - [x] `handleQuestObjectiveCompleted()` asserts `quest_collected`, `quest_visited`, `quest_completed`
  - [x] `handlePerformAction()` records action effects as Prolog facts (`has_item`, `player_action`)

## Phase 6: Knowledge & Beliefs (Truths)

- [x] Spec written (`docs/PHASE6_PROLOG_KNOWLEDGE_SPEC.md`)
- [x] Server-side sync of knowledge/beliefs to Prolog facts
- [x] Evidence predicates synced to Prolog (`evidence/6` from belief evidence arrays)
- [x] Knowledge predicates added to core-predicates.json (`knows/3`, `knows_value/4`, `believes/4`, `evidence/6`, `has_mental_model/2`, `mental_model_confidence/3`)
- [x] `knows`, `believes`, `mental_model` predicates usable in rule conditions (rule-converter)
- [x] `knows`, `believes`, `mental_model` predicates usable in action prerequisites (action-converter)
- [x] Knowledge/belief effect types in rule-converter (`learn_fact`, `learn_value`, `add_belief`, `share_knowledge`)
- [x] Knowledge/belief effect types in action-converter (`learn_fact`, `learn_value`, `add_belief`, `share_knowledge`)
- [x] Knowledge propagation rules in auto-sync helpers (`should_propagate`, `trusted_source`, `mutual_knowledge`, etc.)
- [x] Belief confidence levels affect NPC decision-making
  - [x] `prologBelieves()` returns confidence values from Prolog `believes/4`
  - [x] Knowledge system `knowsFact()` checks Prolog `knows/3` first
- [x] Mental models: NPCs reason about what others know/believe
  - [x] `prologKnows()` and `prologBelieves()` query Prolog knowledge predicates
  - [x] `addKnownFact()` syncs facts to Prolog KB for cross-system reasoning
- [x] Knowledge propagation executed automatically during simulation
  - [x] `propagateKnowledge()` checks `prologShouldPropagate()` to gate knowledge sharing
  - [x] `socialize()` records conversation facts in Prolog for knowledge propagation rules

## Phase 7: Babylon.js Game Engine Integration

- [x] `GamePrologEngine.ts` — client-side Prolog engine for Babylon.js game runtime
  - [x] Loads knowledge base from server export or bundled `.pl` file
  - [x] Initializes character, settlement, rule, action, quest facts on game start
  - [x] `canPerformAction()` evaluates Prolog prerequisites
  - [x] `isQuestAvailable()` / `isQuestComplete()` via Prolog queries
  - [x] `evaluateCondition()` for arbitrary Prolog goal evaluation
  - [x] Real-time `updateGameState()` asserts/retracts dynamic facts (energy, location, nearby NPCs)
  - [x] `assertFact()` / `retractFact()` for game state changes
- [x] `DataSource.ts` loads `.pl` content via `loadPrologContent()` (API + file sources)
- [x] `RuleEnforcer.ts` enhanced with optional Prolog integration
  - [x] `setPrologEngine()` to attach Prolog engine
  - [x] `canPerformActionAsync()` checks Prolog prerequisites then falls back to JS rules
  - [x] `evaluateRuleViaProlog()` for rules with `prologContent`
- [x] Wire `GamePrologEngine` into `BabylonGame.ts` initialization flow
  - [x] Import and instantiate `GamePrologEngine` in `initializeSystems()`
  - [x] Wire into `RuleEnforcer` via `setPrologEngine()`
  - [x] Load Prolog content and initialize engine in `loadWorldData()`
  - [x] Real-time game state sync to Prolog every 500ms (energy, position, nearby NPCs)
  - [x] Dispose Prolog engine in `disposeSystems()`
- [x] `BabylonDialogueActions.ts` checks Prolog prerequisites before showing actions
  - [x] `filterActionsByProlog()` filters actions through `canPerformAction()` async
  - [x] Actions shown immediately, then re-filtered via Prolog (non-blocking)
- [x] `BabylonQuestTracker.ts` evaluates quest goals via Prolog
  - [x] `setPrologEngine()` method to attach Prolog engine
  - [x] `evaluateQuestCompletion()` via Prolog `isQuestComplete()`
  - [x] `isQuestAvailable()` via Prolog query
  - [x] Progress calculation triggers Prolog completion check
- [ ] Prolog minimap overlay (show knowledge/belief state of selected NPC)

## Phase 8: NPC Intelligence via Prolog

- [x] Spec written (`docs/PHASE8_PROLOG_LIFECYCLE_SPEC.md`)
- [x] NPC Reasoning module (`shared/prolog/npc-reasoning.ts`)
  - [x] Lifecycle rules: romance, marriage, reproduction, education, coming of age, death, inheritance
  - [x] Extended family rules: grandmother, aunt, uncle, cousin, in-laws
  - [x] Decision-making rules: socialize/solitude, action preferences, conflict resolution style
  - [x] Social reasoning rules: befriending, knowledge sharing, gossip, secrecy, family obligation
  - [x] Emotional state rules: grieving, lonely, fulfilled, stressed
  - [x] Memory rules: first meeting, positive/negative interactions
  - [x] Dynamic declarations for all lifecycle and social predicates
  - [x] Helper functions: `getPersonalityFacts`, `getRelationshipFacts`, `getEmotionalStateFacts`
- [x] NPC reasoning rules loaded into server-side tau-prolog (auto-sync)
- [x] `GamePrologEngine` NPC intelligence queries:
  - [x] `whoShouldTalkTo()` — personality-based conversation partner selection
  - [x] `getPreferredTopics()` — personality-driven topic preferences
  - [x] `getConflictStyle()` — conflict resolution based on agreeableness/extroversion
  - [x] `wantsToSocialize()` — social desire evaluation
  - [x] `isGrieving()` — checks for deceased family members
  - [x] `isFirstMeeting()` — no mental model exists
  - [x] `whoToAvoid()` — enemy avoidance
  - [x] `isWillingToShare()` — knowledge sharing willingness
  - [x] `updateNPCPersonality()`, `updateNPCEmotionalState()`, `updateNPCRelationship()`
  - [x] `recordPlayerAction()` — remembers player actions as Prolog facts
- [x] Wire NPC queries into BabylonGame.ts NPC AI loop
  - [x] Prolog engine wired into `NPCAmbientConversationManager` via `setPrologEngine()`
  - [x] Game state updates pushed to Prolog every 500ms (nearby NPCs, player state)
- [x] NPCAmbientConversationManager uses Prolog for topic selection
  - [x] `setPrologEngine()` method added
  - [x] Personality-based conversation partner selection via `wantsToSocialize()`, `whoShouldTalkTo()`, `whoToAvoid()`
  - [x] Falls back to proximity-based selection when Prolog unavailable
- [x] NPC daily schedules driven by Prolog rules (occupation, relationships)
  - [x] `schedule/4` rules: work, school, socialize, grieve schedules by time of day
  - [x] `expected_location/2`, `expected_activity/2` query predicates
  - [x] `getScheduleFacts()` helper for asserting `time_of_day/1`

## Phase 9: Game Export Integration

- [x] `knowledgeBase` field added to `SystemsIR` (WorldIR intermediate representation)
- [x] `prologContent` field added to `RuleIR`, `ActionIR`, `QuestIR` in ir-types.ts
- [x] IR generator builds combined knowledge base from:
  - [x] NPC reasoning rules (lifecycle, social, emotional, decision-making)
  - [x] Character facts (person, age, gender, occupation)
  - [x] Rule prologContent from all world rules
  - [x] Action prologContent from all world actions
  - [x] Quest prologContent from all world quests
- [x] Babylon.js export: `public/data/knowledge-base.pl` included in ZIP
- [x] Godot export: `data/knowledge_base.pl` included in ZIP
- [x] Unity export: `Assets/Resources/Data/KnowledgeBase.pl` included in ZIP
- [x] Unreal export: `Content/Data/KnowledgeBase.pl` included in ZIP
- [x] Export validation checks Prolog consistency
  - [x] `shared/prolog/export-validator.ts` — syntax check, duplicate detection, missing data warnings
  - [x] Wired into `ir-generator.ts` — validates knowledge base during export, logs warnings
- [ ] Engine-specific Prolog interpreters (GDScript, C#, C++) for non-Babylon exports

## Phase 10: TotT Social Simulation Migration

- [x] Identify TotT systems that benefit most from Prolog conversion
- [x] `shared/prolog/tott-predicates.ts` — comprehensive TotT Prolog rules module
  - [x] Hiring system (10 rules): `qualified_for/2`, `candidate_score/3`, `can_be_hired/1`, `has_vacancy/2`, `can_promote/1`
  - [x] Social dynamics (16 rules): `compatible/2`, `will_befriend/2`, `should_socialize/1`, `salient_to/2`, `trustworthy/2`
  - [x] Economics (14 rules): `can_afford/2`, `is_wealthy/1`, `can_trade/4`, `upward_mobility/1`, `oversupplied/2`
  - [x] Lifecycle (18 rules): `can_marry/2`, `can_conceive/1`, death risk levels, `school_age/1`, `primary_heir/2`
  - [x] Dynamic declarations for all TotT predicates
  - [x] Helper queries: `all_candidates/2`, `all_vacancies/2`, `potential_couples/2`
- [x] TotT predicates loaded into server-side tau-prolog (prolog-auto-sync.ts)
- [x] TotT predicates loaded into client-side GamePrologEngine
- [x] TotT predicates included in game export knowledge base (ir-generator.ts)
- [x] `prolog-queries.ts` helper module for TotT ↔ Prolog integration
  - [x] Hiring queries: `prologQualifiedForJob`, `prologCandidateScore`, `prologCanBeHired`
  - [x] Social queries: `prologCompatibility`, `prologShouldSocialize`, `prologWillBefriend`
  - [x] Economics queries: `prologCanAfford`, `prologIsWealthy`
  - [x] Lifecycle queries: `prologCanMarry`, `prologCanConceive`, `prologDeathRisk`, `prologIsSchoolAge`
  - [x] Knowledge queries: `prologKnows`, `prologBelieves`, `prologShouldPropagate`
  - [x] Fact management: `prologAssertFact`, `prologRetractFact`
- [x] `hiring-system.ts` queries Prolog for candidate evaluation
  - [x] `evaluateCandidate()` augmented with Prolog qualification and score blending (30/70)
  - [x] `findCandidates()` augmented with `prologCanBeHired()` filter
  - [x] `fillVacancy()` syncs occupation fact to Prolog KB
- [x] `social-dynamics-system.ts` queries Prolog for compatibility
  - [x] `shouldSocializeAsync()` tries Prolog first, falls back to TS
  - [x] `socialize()` records `had_conversation`, `positive_interaction`, `negative_interaction` facts
- [x] `economics-system.ts` queries Prolog for affordability
  - [x] `canAffordAsync()` — Prolog-augmented affordability check
  - [x] `isWealthyAsync()` — Prolog-augmented wealth classification
- [x] `lifecycle-system.ts` queries Prolog for eligibility checks
  - [x] `proposeMarriage()` checks `prologCanMarry()` first
  - [x] `checkPregnancyEligibility()` checks `prologCanConceive()` first
  - [x] `calculateDeathProbabilityAsync()` uses Prolog death risk levels
  - [x] `marry()` syncs `married_to` facts to Prolog
  - [x] `die()` syncs `dead` fact to Prolog
- [x] `knowledge-system.ts` → Prolog integration complete
  - [x] `knowsFact()` checks Prolog `knows/3` first
  - [x] `propagateKnowledge()` checks `prologShouldPropagate()` before sharing
  - [x] `addKnownFact()` syncs to Prolog knowledge base
- [x] Remaining TotT modules evaluated and migrated as appropriate
  - [x] `education-system.ts` — `prologIsSchoolAge`, `prologEducationEligible` for enrollment
  - [x] `business-system.ts` — `prologCanFoundBusiness`, `prologBusinessOwner`, asserts `owns` facts
  - [x] `grieving-system.ts` — asserts/retracts `grieving` facts, checks via `prologGrieving`
  - [x] `routine-system.ts` — `prologRoutine` for schedule-based locations
  - [x] `sexuality-system.ts` — `prologHasAttraction` for compatibility
  - [x] `drama-recognition-system.ts` — `prologDramaticTension` for narrative detection
  - [x] `personality-behavior-system.ts` — `prologShouldSocialize` for behavior gating

## Phase 11: Authoring UI Integration

- [x] `PredicatePalette` component (`client/src/components/prolog/PredicatePalette.tsx`)
  - [x] Loads predicates from `GET /api/prolog/predicates` (core-predicates.json)
  - [x] Searchable by name, description, category
  - [x] Grouped by category with expandable tree
  - [x] Tooltip with args, types, and examples
  - [x] Click to insert predicate template into editor / copy to clipboard
- [x] Predicate palette integrated into RulesHub, ActionsHub, QuestsHub right panel
  - [x] Tabbed right panel: Details | Predicates | Query
  - [x] Insert into rule editor on click (appends to content being edited)
- [x] `PrologQueryTester` component (`client/src/components/prolog/PrologQueryTester.tsx`)
  - [x] Live query tester against world's tau-prolog knowledge base
  - [x] Query history with result display
  - [x] Example queries for quick testing
  - [x] Integrated into RulesHub, ActionsHub, QuestsHub right panel
- [x] `PredicateUsageAnalytics` component (`client/src/components/prolog/PredicateUsageAnalytics.tsx`)
  - [x] Analyzes predicate usage across rules, actions, quests
  - [x] Shows usage bars, breakdown by entity type, sort by usage/name
  - [x] Identifies unused predicates
- [x] `PredicateRelationshipGraph` component (`client/src/components/prolog/PredicateRelationshipGraph.tsx`)
  - [x] SVG-based circular graph of predicate co-occurrences
  - [x] Click to highlight connections, zoom controls
  - [x] Color-coded by category with legend
- [x] `PrologSyntaxHighlight` component (`client/src/components/prolog/PrologSyntaxHighlight.tsx`)
  - [x] Token-based syntax highlighting for Prolog code
  - [x] Keywords, variables, predicates, numbers, strings, comments, operators
  - [x] Integrated into RulesHub, ActionsHub, QuestsHub Prolog views
- [x] `GET /api/prolog/predicates` endpoint serving core-predicates.json
- [ ] Drag-and-drop predicate composer (visual block editor)
- [ ] Predicate autocomplete in textarea editors (inline suggestions)

## Phase 12: Simulation & Testing

- [x] Server-side API endpoints:
  - [x] `POST /api/prolog/tau/scenario-test` — run test scenarios with setup/teardown and expectations
  - [x] `POST /api/prolog/tau/what-if` — temporarily assert facts, query, then retract
  - [x] `POST /api/prolog/tau/consistency-check` — find contradictions, inconsistencies, missing data
  - [x] `GET /api/prolog/tau/coverage/:worldId` — predicate coverage across rules/actions/quests
- [x] `PrologScenarioTester` component (`client/src/components/prolog/PrologScenarioTester.tsx`)
  - [x] Define test scenarios with name, setup facts, query, and expected result
  - [x] Run all tests, see pass/fail results with progress bar
  - [x] Test history with pass rates
  - [x] Default scenarios (people exist, adults >= 18, no self-marriage)
- [x] `PrologWhatIfQuery` component (`client/src/components/prolog/PrologWhatIfQuery.tsx`)
  - [x] Add hypothetical facts temporarily
  - [x] Run queries against modified knowledge base
  - [x] Quick scenario templates (new character, marriage eligibility, all adults)
  - [x] Results history
- [x] `PrologConsistencyChecker` component (`client/src/components/prolog/PrologConsistencyChecker.tsx`)
  - [x] 8 consistency checks: alive+dead, self-marriage, self-parent, negative age, missing age/gender, asymmetric marriage, dead with occupation
  - [x] Issue categorization: contradictions, inconsistencies, missing data, invalid values
  - [x] Knowledge base stats display
- [x] `PrologCoverageReport` component (`client/src/components/prolog/PrologCoverageReport.tsx`)
  - [x] Coverage percentage with progress bar
  - [x] Covered vs uncovered predicate toggle
  - [x] Breakdown by rules/actions/quests
- [x] `PrologSimulationPanel` component — tabbed panel combining all testing tools
  - [x] Tabs: Tests, What-If, Check, Coverage, Analytics, Graph
  - [x] Integrated into Prolog tab on home page (below PrologKnowledgeBase)
- [ ] Time-travel debugging: step through Prolog state changes
- [ ] Simulation comparison: run same scenario with/without specific rules

## Phase 13: Advanced Features

- [x] `shared/prolog/advanced-predicates.ts` — comprehensive advanced Prolog rules module
  - [x] Resource constraints (14 rules): `resource_balance/3`, `has_deficit/2`, `can_sustain/1`, `optimal_trade/4`, `location_wealth/2`, `production_blocked/2`
  - [x] Probabilistic reasoning (10 rules): `likely_action/3`, `socialize_probability/2`, `risk_probability/2`, `conflict_probability/3`, `trust_probability/3`, `best_action/2`, mood modifiers
  - [x] Abductive reasoning / mystery (12 rules): `suspect_for/2`, `prime_suspect/2`, `infer_motive/3` (jealousy/revenge/greed/power), `evidence_weight/3`, `clue_leads_to/2`, `valid_accusation/3`, `red_herring/2`
  - [x] Meta-predicates / governance (12 rules): `law_applies/2`, `violates_law/2`, `council_majority/2`, `has_authority_over/2`, `tax_owed/2`, `citizen_rights/2`, `citizen_duties/2`
  - [x] Procedural content generation (14 rules): `matches_archetype/2` (6 archetypes), `needs_quest/3` (5 quest types), `potential_conflict/3`, `event_candidate/3`, `dialogue_topic/4`
  - [x] LLM cost reduction (12 rules): `answerable_by_prolog/2`, `template_dialogue/3`, `prolog_decidable/2`, `query_complexity/2`
- [x] Advanced predicates loaded into server-side tau-prolog (prolog-auto-sync.ts)
- [x] Advanced predicates loaded into client-side GamePrologEngine
- [x] Advanced predicates included in game export knowledge base (ir-generator.ts)
- [x] `PrologLLMRouter` service (`server/services/prolog-llm-router.ts`)
  - [x] Routes queries through Prolog before falling back to AI
  - [x] Handles: character_info, relationship, greeting, farewell, trade_offer, should_socialize, can_marry, quest_available
  - [x] Template-based responses for simple dialogue (greetings, farewells, trade offers)
  - [x] Returns confidence score and source (prolog/template/ai_needed)
- [x] `POST /api/prolog/tau/smart-query` endpoint — Prolog-first query routing
- [x] `GET /api/prolog/tau/smart-query/types` endpoint — list available query types
- [x] Wire PrologLLMRouter into game chat endpoint to reduce Gemini API calls
  - [x] `POST /api/gemini/chat` tries Prolog-first routing for greetings, farewells, trade inquiries
  - [x] Detects query type from user message keywords
  - [x] Returns Prolog/template answer with optional TTS if confidence >= 0.6
  - [x] Falls through to Gemini if Prolog can't handle the query
- [x] Resource constraints integrated into economics-system.ts
  - [x] `canAffordAsync()` and `isWealthyAsync()` use Prolog resource predicates
- [x] Extend mystery quest generator to use abductive reasoning rules
  - [x] `server/services/mystery-quest-generator.ts` — queries suspects, motives, clues, red herrings via Prolog
  - [x] `POST /api/worlds/:worldId/quests/generate-mystery` endpoint
- [x] Governance rules integrated into political simulation
  - [x] `prologViolatesLaw`, `prologHasAuthority`, `prologTaxOwed`, `prologCitizenRights` query helpers
  - [x] `collectTax()` in economics-system uses `prologTaxOwed`
  - [x] Authority checks in `socialize()` affect interaction quality

---

## Current Status (Updated 2026-03-08)

**All 14 phases (0–13) substantially complete.** Only a handful of aspirational UI/tooling items remain.

### What works today:
- **Portable Prolog engine** (`shared/prolog/tau-engine.ts`) — pure JS, no SWI-Prolog dependency for client or server
- **Auto-sync** (`prolog-auto-sync.ts`) — characters, relationships, locations, businesses, items, knowledge/beliefs all synced to tau-prolog on first query
- **Two-way sync** — Prolog → DB sync for marriages, deaths, occupations, wealth, friendships, enemies; periodic (30s) or manual trigger
- **Rules, Actions, Quests as Prolog** — `prologContent` auto-generated on create/update via converters; batch conversion endpoint for base rules; viewable in UI with syntax highlighting
- **Knowledge & Beliefs** — `knows/3`, `believes/4`, `evidence/6`, mental models, knowledge propagation rules
- **NPC Intelligence** — personality-driven social reasoning, lifecycle rules, emotional states, conflict resolution, conversation partner selection, daily schedules (100+ Prolog rules)
- **TotT Social Simulation** — 12 of 16 implementable modules integrated: hiring, social dynamics, economics, lifecycle, knowledge, education, business, grieving, routine, sexuality, drama recognition, personality-behavior
- **Advanced Features** — resource constraints, probabilistic reasoning, mystery quest generator (abductive reasoning), governance/political simulation, procedural content generation, LLM cost reduction
- **Client-side Prolog** (`GamePrologEngine.ts`) — loads all rule modules, supports real-time fact assertion/retraction, action/quest evaluation
- **RuleEnforcer Prolog integration** — optional Prolog evaluation with JS fallback
- **Game exports** — Prolog knowledge base bundled in Babylon.js, Godot, Unity, Unreal exports with validation
- **Authoring UI** — predicate palette, query tester, syntax highlighting, usage analytics, relationship graph in Rules/Actions/Quests editors
- **Simulation & Testing** — scenario tester, what-if queries, consistency checker (8 checks), coverage reports, all in a tabbed panel on the Prolog tab
- **Prolog-LLM Router** — routes queries through Prolog before Gemini API; 8 query types with template responses
- **25+ API endpoints** for Prolog query, sync, sync-back, testing, smart-query, predicates, coverage, consistency, mystery quests, batch conversion, categorization

### Remaining items (aspirational/UI):
- Clean up duplicate/overlapping base rules
- Rules editor: direct Prolog authoring mode
- Rules/Actions editor: predicate autocomplete
- Actions editor: predicate-based prerequisite builder
- Drag-and-drop predicate composer (visual block editor)
- Time-travel debugging, simulation comparison
- Engine-specific Prolog interpreters for non-Babylon exports (GDScript, C#, C++)
- Prolog minimap overlay
