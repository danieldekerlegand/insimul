# Prolog Integration Checklist

Tracks progress on integrating Prolog reasoning throughout Insimul's editor, game engine, and exports.

---

## Phase 0: Foundation Fixes

- [x] Fix base rules API route ordering (`/api/rules/base` before `/api/rules/:id`)
- [x] Seed base rules migration (714 base rules in DB)
- [x] Base rules visible in RulesHub UI (World Rules + Base Rules tree)
- [ ] Base rules categorization — many existing base rules have `category: null`
- [ ] Clean up duplicate/overlapping base rules (684 pre-existing + 30 seeded)

## Phase 1: Portable Prolog Engine (tau-prolog)

- [x] Add tau-prolog dependency (`npm install tau-prolog`)
- [x] Create `shared/prolog/tau-engine.ts` — portable Prolog engine wrapper
- [x] Implement fact assertion/retraction API
- [x] Implement query execution API
- [x] Create test suite validating tau-prolog (43 tests, all passing)
- [ ] Integrate tau-prolog into client bundle (replaces need for SWI-Prolog on client)
- [ ] Keep SWI-Prolog as server-side option for heavy simulation workloads

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
- [ ] Remove need for "Sync from DB" button — predicates stay in sync automatically
- [ ] Two-way sync: Prolog state changes reflected back to database

## Phase 3: Rules as Prolog

- [ ] Add `prologContent` field to rules schema (alongside existing `content`)
- [ ] Auto-convert existing rule conditions/effects to Prolog predicates
- [ ] Rules editor: option to author rules directly as Prolog
- [ ] Rules editor: predicate autocomplete from core-predicates schema
- [ ] Validate Prolog syntax on save
- [ ] Base rules stored as Prolog (convert 714 existing base rules)
- [ ] RuleEnforcer can evaluate Prolog conditions (via tau-prolog)

## Phase 4: Actions as Prolog

- [ ] Action prerequisites stored as Prolog goals
- [ ] Action effects stored as Prolog assert/retract operations
- [ ] Actions editor: predicate-based prerequisite builder
- [ ] Game engine evaluates action prerequisites via Prolog query
- [ ] Action execution updates Prolog knowledge base

## Phase 5: Quests as Prolog

- [ ] Quest objectives expressed as Prolog goals
- [ ] Quest completion criteria as Prolog queries
- [ ] Quest prerequisites as Prolog conditions
- [ ] Quest tracker evaluates progress via Prolog
- [ ] Quest state changes update knowledge base

## Phase 6: Knowledge & Beliefs (Truths)

- [x] Spec written (`docs/PHASE6_PROLOG_KNOWLEDGE_SPEC.md`)
- [x] Server-side sync of knowledge/beliefs to Prolog facts
- [ ] `knows/2`, `believes/3` predicates usable in rules/actions/quests
- [ ] Knowledge propagation rules (NPCs share knowledge based on relationships)
- [ ] Belief confidence levels affect NPC decision-making
- [ ] Mental models: NPCs reason about what others know/believe
- [ ] Evidence-based belief updates

## Phase 7: Babylon.js Game Engine Integration

- [ ] Load Prolog knowledge base into tau-prolog on game start
- [ ] `DataSource.ts` loads `.pl` facts alongside JSON data
- [ ] `RuleEnforcer.ts` queries tau-prolog for condition evaluation
- [ ] `BabylonDialogueActions.ts` checks Prolog prerequisites
- [ ] `BabylonQuestTracker.ts` evaluates quest goals via Prolog
- [ ] Game state changes assert/retract facts in real-time
- [ ] Prolog minimap overlay (show knowledge/belief state of selected NPC)

## Phase 8: NPC Intelligence via Prolog

- [x] Spec written (`docs/PHASE8_PROLOG_LIFECYCLE_SPEC.md`)
- [ ] NPC decision-making queries Prolog knowledge base
- [ ] NPCs use knowledge to choose dialogue options
- [ ] NPCs form/break relationships based on Prolog reasoning
- [ ] NPC daily schedules driven by Prolog rules (occupation, relationships)
- [ ] Emotional state derived from Prolog facts (grieving, happy, angry)
- [ ] NPCs remember player actions as Prolog facts

## Phase 9: Game Export Integration

- [ ] Include `.pl` knowledge base file in Babylon.js exports
- [ ] Godot export: generate GDScript Prolog interpreter or fact tables
- [ ] Unity export: generate C# Prolog interpreter or fact tables
- [ ] Unreal export: generate C++ Prolog interpreter or fact tables
- [ ] WorldIR includes knowledge base data
- [ ] Export validation checks Prolog consistency

## Phase 10: TotT Social Simulation Migration

- [ ] Identify TotT systems that benefit most from Prolog conversion
- [ ] `hiring-system.ts` → `qualified_for/2`, `available_position/2`
- [ ] `social-dynamics-system.ts` → `will_befriend/2`, `compatibility/3`
- [ ] `economics-system.ts` → `can_afford/2`, `market_price/2`
- [ ] `lifecycle-system.ts` → `can_marry/2`, `of_age/1`
- [ ] `knowledge-system.ts` → already partially Prolog, complete migration
- [ ] Remaining TotT modules evaluated and migrated as appropriate

## Phase 11: Authoring UI Integration

- [ ] Predicate palette in rule/action/quest editors
- [ ] Drag-and-drop predicate composer
- [ ] Live Prolog query tester in editor sidebar
- [ ] Predicate usage analytics (which predicates are most/least used)
- [ ] Visual predicate relationship graph
- [ ] Prolog syntax highlighting in code editors

## Phase 12: Simulation & Testing

- [ ] Simulations page runs Prolog-based scenario tests
- [ ] "What-if" queries: test hypothetical world states
- [ ] Consistency checker: find contradictions in knowledge base
- [ ] Coverage report: which predicates are tested by quests/rules
- [ ] Time-travel debugging: step through Prolog state changes
- [ ] Simulation comparison: run same scenario with/without specific rules

## Phase 13: Advanced Features

- [ ] Constraint logic programming (CLP) for resource management
- [ ] Probabilistic reasoning for NPC decision uncertainty
- [ ] Abductive reasoning for mystery/detective quest generation
- [ ] Meta-predicates for rule-about-rules (governance systems)
- [ ] Prolog-powered procedural content generation
- [ ] LLM cost reduction: replace AI calls with Prolog reasoning where possible

---

## Current Status

**What works today:**
- Server-side SWI-Prolog knowledge base with full CRUD API
- Database → Prolog sync (characters, relationships, locations, businesses, items, knowledge)
- PrologKnowledgeBase UI component (query, browse, export/import)
- Base rules visible in RulesHub with enable/disable toggles
- Predicate discovery and validation tools

**What doesn't work:**
- Game engine uses zero Prolog (all imperative JavaScript)
- Rules/actions/quests stored as JSON, not Prolog predicates
- Exported games have no Prolog
- NPC AI ignores knowledge base
- "Sync from DB" required to populate Prolog (should be automatic)
- TotT social simulation modules are pure TypeScript

**Recommended order:** Phase 0 → 1 → 2 → 3 → 7 → 8 → 4 → 5 → 6 → 9 → 10 → 11 → 12 → 13
