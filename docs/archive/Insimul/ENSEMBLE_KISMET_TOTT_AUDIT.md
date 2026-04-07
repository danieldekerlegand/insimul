# Insimul Engine Integration Audit

**Date:** 2026-03-09
**Source engines:** Talk of the Town (Python), Ensemble (JS/C#), Kismet (Python)

---

## Executive Summary

Insimul has achieved **strong integration of Talk of the Town** (most systems fully ported), **partial integration of Ensemble** (social state and events ported, but the core volition/action-grammar system is missing), and **selective integration of Kismet** (replaced by Prolog, but several Kismet-specific mechanics have no Prolog equivalent yet).

The Prolog integration itself is **mature and production-ready** (273/291 checklist items complete across 14 phases), but it does not yet cover the major engine-level gaps (volition, softmax selection, action grammar) that would make the simulation truly emergent.

The biggest gaps are:
1. **Ensemble's volition system** — the engine that makes NPCs autonomously decide what to do
2. **Kismet's probabilistic action selection** — softmax-weighted decision-making
3. **TotT's two-phase simulation** — lo-fi historical simulation vs hi-fi present-day detail
4. **Action grammar hierarchy** — Ensemble's start→non-terminal→terminal action trees
5. **Location-based role casting** — Kismet's dynamic role assignment at locations

---

## Feature-by-Feature Cross-Reference

### TALK OF THE TOWN

| TotT Feature | Insimul Status | Notes |
|---|---|---|
| **Quadtree lot generation** | MISSING | Insimul uses grid-based generation, not TotT's quadtree decomposition with loci/samples |
| **Street naming/numbering** | PARTIAL | Streets generated with names but no directional naming system (N/S/E/W) or block numbering |
| **Lot parcel system** | JUST FIXED | Lot records now persist to MongoDB (was stub until this session) |
| **A\* pathfinding between lots** | MISSING | No distance calculation or pathfinding between lots |
| **Downtown identification** | MISSING | TotT identifies downtown by tertiary population density |
| **Building construction events** | COMPLETE | building-commission-system.ts handles construction timeline |
| **Demolition/renovation cycle** | MISSING | TotT demolishes buildings to make way for new ones; lots track `formerBuildingIds` (schema exists, logic doesn't) |
| **Building lot history** | PARTIAL | `formerBuildingIds` field exists on lots but no code populates it over time |
| **60+ business types** | PARTIAL | ~20 business types defined; TotT has 60+ with advent/demise years |
| **Business services model** | MISSING | TotT businesses provide specific services (haircut, medicine, etc.) that drive errand behavior |
| **Business naming conventions** | MISSING | TotT generates names like "Johnson's Bakery" based on owner surname + type |
| **PersonExNihilo (settlers)** | COMPLETE | genealogy-generator creates founding characters |
| **Extended family computation** | PARTIAL | Parent/child/spouse tracked; TotT computes full extended family (great-grandparents, cousins, aunts, nephews, etc.) |
| **Adoption system** | COMPLETE | sexuality-system.ts handles adoption |
| **Name inheritance (named_for)** | MISSING | TotT tracks who a person is named after |
| **Charge/spark/trust relationships** | COMPLETE | social-dynamics-system.ts |
| **Relationship succession** | MISSING | TotT relationships evolve types (acquaintance→friend→romance); new type inherits charge/compatibility |
| **Meeting tracking** | COMPLETE | First/last meeting location and date tracked |
| **Daily routine decisions** | COMPLETE | routine-system.ts with decide_where_to_go |
| **Errand system (service needs)** | MISSING | TotT characters run errands based on service needs + distance |
| **Sick days / days off** | MISSING | TotT routine includes random sick days, personality-affected leisure |
| **100+ occupation types** | PARTIAL | Hiring system supports many types but not TotT's full 100+ |
| **Occupation succession tracking** | PARTIAL | Hiring tracks predecessor but not full succession chain |
| **Supplemental/favor positions** | MISSING | TotT has positions that auto-refill or are favors |
| **12 evidence types** | COMPLETE | knowledge-system.ts (observation, hearsay, testimony, etc.) |
| **BusinessMentalModel** | MISSING | TotT has separate mental models for businesses and dwellings |
| **Belief challenger system** | MISSING | TotT tracks alternative beliefs when contradicting evidence exists |
| **Feature strength/confidence** | COMPLETE | knowledge-system.ts belief facets have confidence scores |
| **Salience system** | COMPLETE | social-dynamics-system.ts |
| **Two-phase simulation (lo-fi/hi-fi)** | MISSING | TotT simulates 1839-1979 at low fidelity (~3.6 timesteps/year), then final week at full detail |
| **Timestep probability** | MISSING | TotT's `chance_of_a_timestep_being_simulated` for historical compression |
| **Drama recognition** | COMPLETE | drama-recognition-system.ts (love triangles, rivalries, affairs, etc.) |
| **Face/appearance inheritance** | COMPLETE | appearance-system.ts with genetic inheritance |
| **Big Five personality** | COMPLETE | personality-behavior-system.ts |
| **Conversation frames** | PARTIAL | conversation-system.ts has dialogue but not TotT's frame-based planning |
| **NLG (DialogueGenerator/ThoughtGenerator)** | REPLACED | Insimul uses Tracery + Gemini LLM instead of TotT's productionist |
| **Artifact knowledge transmission** | COMPLETE | artifact-system.ts |
| **Gravestone/wedding ring artifacts** | PARTIAL | Artifact system exists but specific artifact types not all implemented |
| **Name ethnicity/corpora** | MISSING | TotT has ethnicity-aware name generation with corpora |

### ENSEMBLE

| Ensemble Feature | Insimul Status | Notes |
|---|---|---|
| **Social record (time-indexed predicates)** | REPLACED | Insimul uses truths table + character attributes instead of Ensemble's predicate array |
| **Schema categories (traits/networks/relationships/statuses/bonds)** | PARTIAL | Character attributes are hardcoded in Drizzle schema; not dynamically definable like Ensemble's schema.json |
| **Trigger rules (reactive IF→THEN)** | COMPLETE | Rules with conditions/effects + event-system triggers |
| **Volition rules (NPC goal scoring)** | MISSING | This is a MAJOR GAP. Ensemble's core: NPCs evaluate all possible goals, score them by weight, pursue highest. Insimul NPCs don't have autonomous goal formation. |
| **Volition calculation (weight ranking)** | MISSING | `calculateVolition(cast)` computes per-character goal priorities. No equivalent in Insimul. |
| **isAccepted() (response scoring)** | MISSING | Whether a target character accepts/rejects an initiative based on their own volition scores |
| **Action grammar (start→non-terminal→terminal)** | MISSING | Ensemble's three-tier action hierarchy allows complex multi-step social interactions. Insimul actions are flat. |
| **Intent predicates** | MISSING | Actions tied to volitions via intent category/type matching |
| **Influence rules (action weight modification)** | MISSING | Context-dependent weight adjustments on action selection |
| **Accept/reject effects** | MISSING | Different outcomes based on whether target accepts or rejects action |
| **Character on/off stage** | MISSING | Ensemble can temporarily remove characters from simulation without deletion |
| **Directed vs reciprocal vs undirected relationships** | PARTIAL | Insimul has relationships but doesn't formally categorize directionality |
| **Duration-based state expiration** | MISSING | Ensemble statuses auto-expire after N turns. Insimul has no temporal state management. |
| **Social record history queries** | PARTIAL | Can query truths by time but not with Ensemble's turnsAgoBetween precision |
| **Rule character binding (wildcard matching)** | PARTIAL | Rules reference characters but lack Ensemble's recursive `matchUniqueBindings` |
| **JSON authoring format** | REPLACED | Insimul uses database + UI editor instead of Ensemble's 6-file JSON format |
| **ruleToEnglish() debugging** | MISSING | Ensemble can render any rule as human-readable English |
| **Predicate operators (+, -, =, <, >)** | PARTIAL | Rule effects modify attributes but not with Ensemble's operator generality |

### KISMET

| Kismet Feature | Insimul Status | Notes |
|---|---|---|
| **Kismet language syntax** | REPLACED | Insimul uses Prolog instead of Kismet's custom syntax. This was an intentional design decision. |
| **Traits with propensities (valence weights)** | MISSING | Kismet traits carry `+++`/`---` weights toward action tags. Insimul personality affects behavior but not through a propensity/tag matching system. |
| **Propensity tag matching** | MISSING | Actions have tags; traits have weighted preferences for those tags. Core Kismet decision mechanic. |
| **Conditional propensities** | MISSING | `+++(romance if Self likes Other)` — propensities gated on conditions |
| **Softmax action selection** | MISSING | `P(A_i) = e^(weight/T) / sum`. Kismet's probabilistic selection based on accumulated weights. Insimul has no stochastic action selection. |
| **Action cost/budget system** | MISSING | Characters have action points per turn; actions consume points |
| **Action visibility mechanics** | PARTIAL | autonomous-behavior-system has observation but not Kismet's graduated visibility levels |
| **Action extension (inheritance)** | MISSING | `flirt extends mingle` inherits all parent properties |
| **Response actions (+/- reactions)** | MISSING | Target character can accept or reject, each with different effects |
| **Knowledge operators (did/received/saw/heard/knows)** | COMPLETE | knowledge-system.ts implements all evidence types |
| **Roles (location-based)** | MISSING | Kismet roles are context-sensitive capabilities granted at locations (bartender at bar, student at school) |
| **Role casting (initialization/each_turn)** | MISSING | Locations dynamically cast characters into roles each turn |
| **Location tags** | MISSING | Locations have semantic tags (hospitality_establishment, drinking) that actions can require |
| **Location constraints in actions** | MISSING | `location (Char1, Char2)` — require co-location for action |
| **Patterns (multi-character conditions)** | PARTIAL | Prolog can match patterns but no dedicated pattern syntax like Kismet's |
| **Temporal patterns (action sequences)** | MISSING | `RevengeSeeker received [mean] ...[5-10] RevengeSeeker did [mean]` — match action sequences over time windows |
| **Tracery integration** | COMPLETE | Insimul uses Tracery throughout |
| **KismetSequence (simulation orchestration)** | MISSING | Load/initialize/simulate/checkpoint control language |
| **KismetInitialization (world gen scripting)** | REPLACED | Insimul uses WorldGenerator + UI instead |
| **ASP/Clingo solver** | REPLACED | tau-prolog replaces Clingo. Prolog is less natural for constraint optimization but handles rule evaluation well. |

---

## Prolog Integration Status

### What's Working (Production-Ready)

| Area | Status | Details |
|---|---|---|
| **tau-prolog engine** | COMPLETE | Pure JS, runs on both client and server. Primary engine. |
| **SWI-Prolog fallback** | COMPLETE | Server-side only, requires `swipl` CLI. Optional fallback. |
| **Character sync** | COMPLETE | person/1, age/2, gender/2, occupation/2, at_location/2, alive/1, dead/1, names |
| **Relationship sync** | COMPLETE | married_to/2, parent_of/2, child_of/2, friend_of/2 + computed sibling/grandparent/ancestor |
| **Settlement sync** | PARTIAL | settlement/1, settlement_name/2, settlement_type/2, population/2. Missing: economy, governance, internal structure. |
| **Business sync** | PARTIAL | business/1, business_name/2, business_type/2, owns/2. Missing: employees, finances, inventory. |
| **Item sync** | PARTIAL | has_item/3, item_name/2, item_type/2, item_value/2. Missing: item location, condition. |
| **Knowledge & beliefs** | COMPLETE | knows/3, knows_value/4, believes/4, evidence/6, mental models (Phase 6) |
| **Rules → Prolog** | COMPLETE | Auto-converts via rule-converter.ts. 30+ condition types, 20+ effect types. Stored as `rule_applies/3`, `rule_effect/4`. |
| **Actions → Prolog** | COMPLETE | Auto-converts via action-converter.ts. 10 prerequisite types, 10 effect types. Stored as `action/4`, `can_perform/2`. |
| **Quests → Prolog** | COMPLETE | Auto-converts via quest-converter.ts. 10+ objective types. Stored as `quest/5`, `quest_available/2`, `quest_complete/2`. |
| **Game runtime (client)** | COMPLETE | GamePrologEngine wired into BabylonGame, RuleEnforcer, QuestTracker, NPC conversations. 500ms state sync. |
| **NPC intelligence rules** | COMPLETE | 100+ lifecycle/social/emotional Prolog rules (Phase 8) |
| **TotT ↔ Prolog bridge** | COMPLETE | 32 query helpers in prolog-queries.ts: hiring, social, economics, lifecycle, knowledge, governance |
| **LLM cost reduction** | COMPLETE | PrologLLMRouter handles 8 query types (character_info, relationship, greeting, etc.) before falling back to Gemini |
| **Game exports** | COMPLETE | All 4 engines (Babylon, Godot, Unity, Unreal) get bundled knowledge-base.pl |
| **Authoring UI** | COMPLETE | Predicate palette, query tester, analytics, graph visualization, syntax highlighting |
| **Testing tools** | COMPLETE | Scenario tester, what-if queries, consistency checker, coverage reports |
| **Advanced features** | COMPLETE | Resource constraints, probabilistic reasoning, abductive reasoning/mysteries, governance, PCG (Phase 13) |
| **Core predicates** | COMPLETE | 100+ predicates in core-predicates.json. Permissive schema allows custom predicates freely. |

### Prolog Integration Limitations

| Limitation | Impact | Details |
|---|---|---|
| **No backfill on existing data** | HIGH | All 752 rules, 524 actions, 7 quests had `prologContent: null`. Batch endpoints now exist (`/api/worlds/:worldId/prolog/convert-all`) but have not been run on existing worlds yet. |
| **No Prolog preview for entities** | MEDIUM | Settlements, characters, and businesses are synced at runtime but have no stored `prologContent` field — no way to preview their Prolog representation in the editor UI. |
| **Sync-back limited to 6 predicates** | MEDIUM | Only `married_to`, `dead`, `occupation`, `wealth`, `friend_of`, `enemy_of` sync from Prolog back to MongoDB. Other Prolog changes are ephemeral. |
| **Age uses real-world year** | LOW | `new Date().getFullYear()` used for age calculation; no support for custom in-game year/calendar. |
| **Character atom sanitization** | LOW | Names with apostrophes or special chars may produce unexpected atom IDs (`firstname_lastname_dbid` format). |
| **No CLP(FD) constraint solving** | LOW | tau-prolog only loads `lists` module. Advanced constraint predicates use heuristic approximations instead of real constraint solving. |
| **No query timeout** | LOW | tau-prolog has no built-in timeout; infinite loops in user-written rules could hang. |
| **Max 1000 query results** | LOW | Hardcoded in TauPrologEngine. Sufficient for most use cases but could miss results in very large KBs. |
| **No direct Prolog authoring** | LOW | Rules/actions can only be authored as JSON and auto-converted; no way to write raw Prolog in the editors yet. |
| **No engine-specific Prolog interpreters** | LOW | Godot/Unity/Unreal exports bundle .pl files but those engines can't execute Prolog natively. Need JS wrapper or transpilation. |
| **No duplicate detection across conversions** | LOW | Rule, action, and quest converters may produce overlapping predicates (e.g., multiple `person/1` facts). No deduplication. |
| **Mental model thresholds hardcoded** | LOW | Strong belief >= 0.7, weak belief < 0.4, knows_well >= 0.6 — not configurable per world. |

---

## Priority Gap Analysis

### CRITICAL (Core simulation quality)

1. **Volition System** — Without Ensemble's volition, NPCs don't autonomously form goals. They react to events and follow routines but don't proactively pursue social objectives (befriend someone, start a romance, seek revenge). This is the single biggest missing piece for emergent narrative.

2. **Probabilistic Action Selection** — Without Kismet's softmax selection weighted by personality propensities, NPC behavior is either random or deterministic. The personality system exists but doesn't drive action choice through weighted probabilities.

3. **Two-Phase Historical Simulation** — TotT's lo-fi/hi-fi distinction is what makes 140 years of town history computationally feasible. Without it, Insimul can only generate a snapshot, not a rich layered history.

### HIGH (Feature completeness)

4. **Action Grammar Hierarchy** — Ensemble's start→non-terminal→terminal trees allow complex social interactions (approach→compliment→accept/reject→friendship_change). Insimul's flat actions can't model multi-step social exchanges.

5. **Propensity/Tag System** — The bridge between personality and action selection. Traits should carry weighted preferences for action categories. This is how personality drives behavior in both Kismet and Ensemble.

6. **Location Roles & Constraints** — Kismet's role system ties available actions to locations. A character at a tavern can be a bartender or patron; at a church, a priest or worshipper. Actions require specific roles/locations.

7. **Demolition/Renovation Cycle** — TotT's building lifecycle where lots change over time. The `formerBuildingIds` field exists but nothing drives the cycle.

8. **Duration-Based State Expiration** — Temporary statuses (angry for 3 turns, injured for 10 turns) are fundamental to both Ensemble and Kismet but missing in Insimul.

### MEDIUM (Polish and depth)

9. **Business Services Model** — Drives the errand system: characters need haircuts, medicine, food → visit businesses that provide those services.

10. **Relationship Type Evolution** — Acquaintance→friend→romance progression with charge/compatibility inheritance.

11. **Response/Accept-Reject Mechanics** — Social interactions should have two sides: initiator proposes, target accepts or rejects based on their own disposition.

12. **Extended Family Computation** — Computing cousins, aunts, uncles, great-grandparents from the existing parent/child/spouse graph.

13. **Name Inheritance & Ethnicity** — Richer naming that tracks who someone is named after and uses ethnicity-appropriate name corpora.

14. **Temporal Pattern Matching** — Recognizing "A wronged B, then 5-10 turns later B retaliated" enables revenge plots, grudges, escalating conflicts.

### LOW (Nice to have)

15. **Quadtree Lot Generation** — More organic town layouts vs grid
16. **A\* Pathfinding** — Distance-aware location decisions
17. **Downtown Identification** — Auto-identify commercial center
18. **Conversation Frames** — TotT's planning-based dialogue (Insimul uses LLM instead)
19. **ruleToEnglish() Debugging** — Human-readable rule rendering
20. **KismetSequence Orchestration** — Scripted simulation control

---

## Stale / Removable Code

Based on the audit, these areas appear to be **dead or redundant**:

1. **`server/db.ts` (Drizzle/Neon PostgreSQL)** — Optional PostgreSQL path that's never used in production. All data goes through MongoDB. The Drizzle schema in `shared/schema.ts` serves as type definitions but the actual `db.ts` connection is dead weight.

2. **`BabylonMinimap.ts`** — The original minimap class exists alongside `BabylonGUIManager.updateMinimap()`. The GUIManager version is what's actually used. The standalone `BabylonMinimap` class appears unused.

3. **`BabylonGame-patch.ts`** — Has TypeScript errors referencing nonexistent properties. Appears to be an abandoned partial refactor.

4. **SQL migration files** — Already deleted this session. Were PostgreSQL artifacts.

5. **`003-quest-system-enhancement.ts`** migration — References both MongoDB and PostgreSQL, but the quest schema is now directly in `mongo-storage.ts`.

---

## Implementation Roadmap

> Check off items as they are completed. Each section includes its source engine(s) and estimated scope.

### Phase A: Volition & Autonomous NPC Goals
*Source: Ensemble | Priority: CRITICAL | Scope: Large*

- [ ] **A1. Define volition predicate schema** — `volition(CharId, TargetId, ActionCategory, Weight)` in Prolog
- [ ] **A2. Volition scoring rules** — Prolog rules that compute weight from personality traits, relationship state, mood, recent events
- [ ] **A3. Personality → volition mapping** — Big Five traits produce base weights toward action categories (openness → explore, agreeableness → befriend, etc.)
- [ ] **A4. Relationship → volition modifiers** — Charge/spark/trust values modify weights (high charge toward romance, low trust toward avoidance)
- [ ] **A5. Situational context modifiers** — Location, time of day, recent events adjust weights
- [ ] **A6. `calculateVolition/2` Prolog predicate** — For each NPC, collect all volition weights, rank by score, return ordered goal list
- [ ] **A7. Goal pursuit loop in unified-engine** — Each simulation tick, NPCs query their top volition and attempt the corresponding action
- [ ] **A8. isAccepted/2 response scoring** — Target character evaluates their own volition toward the initiator to decide accept/reject
- [ ] **A9. Volition decay and refresh** — Goals that are repeatedly blocked lose weight; new situations refresh the volition pool
- [ ] **A10. Volition debugging UI** — Show each NPC's ranked goals in the editor/game inspector
- [ ] **A11. Wire volition into TotT routine-system** — `decide_where_to_go` should consult volition for goal-directed movement

### Phase B: Probabilistic Action Selection
*Source: Kismet | Priority: CRITICAL | Scope: Medium*

- [ ] **B1. Add `tags` field to Action schema** — Array of semantic tags (e.g., `romance`, `aggression`, `hospitality`, `commerce`)
- [ ] **B2. Add `propensities` field to personality traits** — Map of tag → weight (e.g., `{romance: 0.8, aggression: -0.3}`)
- [ ] **B3. Propensity → Prolog facts** — `trait_propensity(TraitName, Tag, Weight)` asserted per character
- [ ] **B4. Action tag → Prolog facts** — `action_tag(ActionId, Tag)` asserted per action
- [ ] **B5. Conditional propensities** — `propensity_condition(TraitName, Tag, Weight, Condition)` — weight only applies when Condition is true
- [ ] **B6. Weight accumulation predicate** — `action_weight(CharId, ActionId, TotalWeight)` sums propensity weights across all matching tags
- [ ] **B7. Softmax selection** — `select_action(CharId, AvailableActions, SelectedAction)` using `P(A_i) = e^(weight/T) / sum`
- [ ] **B8. Temperature parameter** — Per-character or global temperature `T` that controls randomness (high T = more random, low T = more deterministic)
- [ ] **B9. Wire into NPC decision loop** — Replace current random/deterministic selection with softmax-weighted choice
- [ ] **B10. Personality → behavior verification** — Test that different Big Five profiles produce noticeably different action distributions

### Phase C: Two-Phase Historical Simulation
*Source: Talk of the Town | Priority: CRITICAL | Scope: Large*

- [ ] **C1. Define lo-fi timestep schema** — What gets simulated per historical timestep (births, deaths, marriages, business openings/closings, building construction/demolition)
- [ ] **C2. `chance_of_a_timestep_being_simulated` parameter** — Configurable probability per year that a timestep fires (~3.6 per year for TotT's 140-year span)
- [ ] **C3. Lo-fi population dynamics** — Birth/death rates based on population size, era, and random variation
- [ ] **C4. Lo-fi business lifecycle** — Businesses open/close based on population needs, era-appropriate types (advent/demise years from TotT's 60+ types)
- [ ] **C5. Lo-fi building lifecycle** — Construction and demolition driven by population growth, lot availability, and business needs
- [ ] **C6. Lo-fi relationship formation** — Marriages, friendships, and enmities form at historical rates without full social simulation
- [ ] **C7. Lo-fi occupation tracking** — Characters get hired/fired/retired at appropriate rates
- [ ] **C8. Historical event generation** — Major events (fires, floods, economic booms/busts) that shape town development
- [ ] **C9. Transition to hi-fi mode** — Switch from lo-fi to full detail simulation for the final period (configurable: last week, month, or year)
- [ ] **C10. Historical record persistence** — Store compressed history so the game/editor can reference "what happened in 1920"
- [ ] **C11. WorldGenerator integration** — Wire lo-fi simulation into the Create New World pipeline after initial geography generation
- [ ] **C12. Prolog historical facts** — Assert key historical facts (founder, founding year, major events) into the knowledge base

### Phase D: Action Grammar & Multi-Step Interactions
*Source: Ensemble | Priority: HIGH | Scope: Medium*

- [ ] **D1. Add `parentActionId` field to Action schema** — Enables action tree hierarchy
- [ ] **D2. Define action hierarchy levels** — `start` (initiator decides), `non-terminal` (intermediate steps), `terminal` (final outcome with effects)
- [ ] **D3. Action tree traversal predicate** — `action_child(ParentId, ChildId, Branch)` where Branch is `accept` or `reject`
- [ ] **D4. Accept/reject branching** — Terminal actions split into accept-effects and reject-effects based on target response
- [ ] **D5. Intent predicates** — `action_intent(ActionId, IntentCategory, IntentType)` linking actions to volition categories
- [ ] **D6. Influence rules** — `influence(Context, ActionId, WeightModifier)` — context-dependent weight adjustments
- [ ] **D7. Multi-step execution engine** — When an NPC starts a `start` action, the engine walks the tree through non-terminals to a terminal
- [ ] **D8. Action converter update** — Extend action-converter.ts to handle parent/child hierarchy and accept/reject branches in Prolog output
- [ ] **D9. UI for action trees** — Visual editor showing parent→child action hierarchy with branching

### Phase E: Propensity/Tag System (Personality → Behavior Bridge)
*Source: Kismet + Ensemble | Priority: HIGH | Scope: Medium*

> Note: Overlaps with Phase B. Phase B covers the selection mechanics; Phase E covers the deeper personality modeling.

- [ ] **E1. Map Big Five to action propensities** — Research-based mapping (e.g., high extraversion → +approach, +socialize, -solitude)
- [ ] **E2. Mood → propensity modifiers** — Angry characters get +aggression, sad characters get -socialize, happy get +generosity
- [ ] **E3. Experience-based propensity learning** — Characters who have positive outcomes from an action type develop stronger propensities toward it
- [ ] **E4. Cultural/setting propensity defaults** — World settings can define baseline propensities (e.g., medieval world: higher aggression baseline)
- [ ] **E5. Propensity visualization** — Show a character's propensity profile in the editor with personality trait contributions

### Phase F: Location Roles & Constraints
*Source: Kismet | Priority: HIGH | Scope: Medium*

- [ ] **F1. Add `roles` field to Building/Settlement schema** — Array of role definitions (e.g., `{role: 'bartender', maxCount: 1, requirements: ['occupation:innkeeper']}`)
- [ ] **F2. Add `tags` field to Building/Settlement schema** — Semantic location tags (e.g., `hospitality_establishment`, `place_of_worship`, `market`)
- [ ] **F3. Role casting per timestep** — `cast_role(LocationId, CharacterId, RoleName)` asserted each tick based on who's present and qualified
- [ ] **F4. Role-gated actions** — `action_requires_role(ActionId, RoleName)` — actions only available to characters in specific roles
- [ ] **F5. Location-gated actions** — `action_requires_location_tag(ActionId, Tag)` — actions only available at locations with specific tags
- [ ] **F6. Co-location constraints** — `requires_colocation(ActionId, true)` — action requires initiator and target at same location
- [ ] **F7. Role casting initialization** — When a character enters a location, automatically consider them for available roles
- [ ] **F8. Prolog role predicates** — `has_role(CharId, RoleName, LocationId)`, `available_role(LocationId, RoleName)`

### Phase G: Duration-Based State Expiration
*Source: Ensemble + Kismet | Priority: HIGH | Scope: Small*

- [ ] **G1. Add `expiresAt` field to character statuses** — Tick number or timestamp when the status should be removed
- [ ] **G2. Add `duration` field to action effects** — How many ticks the effect lasts (null = permanent)
- [ ] **G3. Status expiration tick** — Each simulation tick, scan for expired statuses and remove them
- [ ] **G4. Prolog temporal predicates** — `status_until(CharId, Status, ExpirationTick)`, `has_active_status(CharId, Status)` checks tick
- [ ] **G5. Common duration presets** — `momentary` (1 tick), `short` (3 ticks), `medium` (10 ticks), `long` (50 ticks), `permanent`
- [ ] **G6. Duration stacking rules** — What happens when a status is reapplied before expiration (refresh, stack, ignore)

### Phase H: Building Lifecycle (Demolition/Renovation)
*Source: Talk of the Town | Priority: HIGH | Scope: Medium*

- [ ] **H1. Demolition trigger rules** — Conditions that mark a building for demolition (disrepair, population decline, rezoning)
- [ ] **H2. Demolition event** — Remove building, update lot's `formerBuildingIds`, mark lot as vacant
- [ ] **H3. Renovation trigger rules** — Conditions that trigger building renovation (new owner, business change, wealth increase)
- [ ] **H4. Construction on vacant lots** — New buildings commissioned on vacant lots when population/business demand exceeds supply
- [ ] **H5. Building condition degradation** — Buildings deteriorate over time without maintenance
- [ ] **H6. Wire into simulation loop** — Building lifecycle runs each hi-fi tick
- [ ] **H7. Prolog building predicates** — `lot_vacant(LotId)`, `building_condition(BuildingId, Condition)`, `should_demolish(BuildingId)`

### Phase I: Business Services & Errands
*Source: Talk of the Town | Priority: MEDIUM | Scope: Medium*

- [ ] **I1. Define service types** — `haircut`, `medicine`, `food`, `drink`, `clothing`, `tools`, `banking`, `legal`, `spiritual`, etc.
- [ ] **I2. Add `services` field to Business schema** — Array of service types the business provides
- [ ] **I3. Character service needs** — Periodic needs generated based on personality, occupation, health (e.g., everyone needs food; only some need legal services)
- [ ] **I4. Errand planning** — Characters plan errands to visit businesses that provide needed services, preferring closer/cheaper/higher-quality
- [ ] **I5. Service satisfaction** — Visiting a business satisfies the service need for a duration
- [ ] **I6. Wire into routine-system** — Errands integrated into daily routine decisions
- [ ] **I7. Prolog service predicates** — `provides_service(BusinessId, ServiceType)`, `needs_service(CharId, ServiceType)`, `best_provider(CharId, ServiceType, BusinessId)`

### Phase J: Relationship Type Evolution
*Source: Talk of the Town + Ensemble | Priority: MEDIUM | Scope: Small*

- [ ] **J1. Define relationship type progression** — `stranger → acquaintance → friend → close_friend`, `acquaintance → romantic_interest → partner → spouse`
- [ ] **J2. Threshold-based type transitions** — Charge/spark/trust thresholds that trigger type upgrades or downgrades
- [ ] **J3. Type inheritance on transition** — When a relationship type changes, carry forward charge/compatibility values
- [ ] **J4. Prolog relationship evolution** — `relationship_type(Char1, Char2, Type)`, `can_evolve_to(Type, NextType, Conditions)`
- [ ] **J5. Relationship decay** — Relationships without interaction slowly lose charge and may downgrade

### Phase K: Accept/Reject Social Mechanics
*Source: Ensemble + Kismet | Priority: MEDIUM | Scope: Medium*

- [ ] **K1. Response evaluation predicate** — `will_accept(TargetId, InitiatorId, ActionId)` based on target's volition, relationship, and mood
- [ ] **K2. Accept effects vs reject effects** — Each social action defines separate outcomes for acceptance and rejection
- [ ] **K3. Rejection consequences** — Failed social advances affect relationship charge, initiator mood, and future volition
- [ ] **K4. Acceptance consequences** — Successful social advances strengthen relationship, improve mood, reinforce volition
- [ ] **K5. Visibility of rejection** — Other characters who witness a rejection may update their mental models

### Phase L: Extended Family & Naming
*Source: Talk of the Town | Priority: MEDIUM | Scope: Small*

- [ ] **L1. Extended family computation** — Prolog rules for cousin/1, aunt/uncle, niece/nephew, great-grandparent from existing parent/child/spouse graph
- [ ] **L2. `named_for` tracking** — Record who a character is named after (typically a family member)
- [ ] **L3. Ethnicity-aware name corpora** — Name generation draws from ethnicity-appropriate lists
- [ ] **L4. Family reunion/recognition** — Characters who meet unknown relatives can discover the connection

### Phase M: Temporal Pattern Matching
*Source: Kismet | Priority: MEDIUM | Scope: Medium*

- [ ] **M1. Action history ring buffer** — Store last N actions per character as Prolog facts: `did(CharId, ActionType, TargetId, Tick)`
- [ ] **M2. Temporal pattern predicates** — `action_sequence(CharId, [Pattern], WindowMin, WindowMax)` matches action sequences over time windows
- [ ] **M3. Revenge/grudge detection** — `received_wrong(CharId, WrongdoerId, Tick)` + `retaliated(CharId, WrongdoerId, Tick2)` where Tick2 - Tick within window
- [ ] **M4. Escalation patterns** — Detect escalating conflict (mean → meaner → violent) over time
- [ ] **M5. Wire into drama-recognition-system** — Temporal patterns feed into existing drama detection

### Phase N: Prolog Authoring & Tooling (Aspirational)
*Source: Internal | Priority: LOW | Scope: Varied*

- [ ] **N1. Direct Prolog authoring mode** — Rules/actions editor allows writing raw Prolog with validation
- [ ] **N2. Predicate autocomplete** — Inline suggestions from core-predicates.json in editor textareas
- [ ] **N3. Drag-and-drop visual predicate composer** — Build Prolog rules visually
- [ ] **N4. Time-travel debugging** — Step through Prolog state changes tick by tick
- [ ] **N5. Simulation comparison** — Run same scenario with/without specific rules, compare outcomes
- [ ] **N6. Engine-specific Prolog interpreters** — GDScript/C#/C++ Prolog interpreters for Godot/Unity/Unreal exports
- [ ] **N7. Prolog minimap overlay** — Visualize knowledge/belief state on the minimap
- [ ] **N8. Base rules deduplication** — Detect and merge overlapping rules from the 714 base rules

### Phase O: Miscellaneous Engine Gaps
*Source: Various | Priority: LOW | Scope: Varied*

- [ ] **O1. Quadtree lot generation** — More organic town layouts replacing the current grid-based system
- [ ] **O2. A\* pathfinding between lots** — Distance-aware location decisions
- [ ] **O3. Downtown identification** — Auto-identify commercial center by population/business density
- [ ] **O4. Character on/off stage** — Temporarily remove characters from simulation without deletion
- [ ] **O5. Action cost/budget system** — Characters have action points per turn; actions consume points
- [ ] **O6. Action visibility levels** — Graduated visibility (private, whisper, nearby, public) per action
- [ ] **O7. Action extension/inheritance** — `flirt extends mingle` inherits all parent properties
- [ ] **O8. BusinessMentalModel** — Separate mental models for businesses and dwellings
- [ ] **O9. Belief challenger system** — Track alternative beliefs when contradicting evidence exists
- [ ] **O10. Supplemental/favor positions** — Occupation positions that auto-refill or are favors
- [ ] **O11. Sick days / days off** — Random sick days and personality-affected leisure in routines
- [ ] **O12. Business naming conventions** — Owner surname + business type naming (e.g., "Johnson's Bakery")

---

## Recommended Implementation Order

Based on dependency analysis and impact:

| Order | Phase | Dependencies | Rationale |
|---|---|---|---|
| 1 | **A: Volition** | None | Foundational — all autonomous NPC behavior depends on this |
| 2 | **B: Softmax Selection** | None (but pairs with A) | Wires personality into action choice; makes volition probabilistic instead of deterministic |
| 3 | **E: Propensity/Tag System** | B | Deepens the personality → behavior bridge established by softmax |
| 4 | **G: Duration States** | None | Small scope, high value — unlocks temporal dynamics for many other features |
| 5 | **D: Action Grammar** | A (volition drives which actions to attempt) | Multi-step interactions require goal-directed NPCs to be meaningful |
| 6 | **K: Accept/Reject** | A, D | Social response mechanics need volition (for scoring) and action grammar (for branching) |
| 7 | **F: Location Roles** | None | Can be built independently; enriches action context |
| 8 | **J: Relationship Evolution** | G (uses duration for decay) | Builds on existing relationship system with progressive type changes |
| 9 | **C: Two-Phase Simulation** | H (building lifecycle needed for lo-fi) | Large scope; implement after core NPC behavior is working |
| 10 | **H: Building Lifecycle** | None | Can start before C but most valuable as part of it |
| 11 | **I: Business Services** | H (businesses need lifecycle) | Drives errand behavior and daily routine variety |
| 12 | **M: Temporal Patterns** | G (needs tick-based history) | Enables revenge, grudge, and escalation narratives |
| 13 | **L: Extended Family** | None | Small scope; mostly Prolog rule additions |
| 14 | **N: Prolog Tooling** | All above stable | Polish and authoring improvements |
| 15 | **O: Miscellaneous** | Various | Fill in remaining gaps as needed |
