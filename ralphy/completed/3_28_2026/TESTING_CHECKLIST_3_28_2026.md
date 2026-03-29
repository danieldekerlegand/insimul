# Testing Checklist — Ralphy 3/28/2026 Sprint

Use this checklist to manually verify all features implemented across the 8 Ralphy tasklists. Check off each item as you confirm it works.

---

## 0. Action Unification and Expansion

### Action Matrix & Prolog Fixes
- [ ] `shared/game-engine/action-matrix.ts` exists and maps all 88 base actions to event, objective type, and interaction mode
- [ ] All 88 base actions categorized into PHYSICAL, CONVERSATIONAL, OBSERVATIONAL, AUTOMATIC, or INVENTORY
- [ ] Each action marked as EXISTS_IN_GAME, PARTIAL, or MISSING
- [ ] Prolog metadata extractor correctly parses all 88 base actions (no format errors)
- [ ] Required predicates generated: `action/4`, `can_perform/2`, `action_effect/2`, `action_duration/2`, `action_difficulty/2`
- [ ] Batch convert endpoint (`POST /api/worlds/:worldId/prolog/convert-all`) works for actions

### Merchant System
- [ ] Business owner characters appear in NPC list in exported games
- [ ] Business owners have "merchant" role assigned
- [ ] Business types filtered by settlement tier (hamlets don't get factories, etc.)
- [ ] Merchants have populated inventory (10-20 items)
- [ ] "Press E to Trade" prompt appears when near a merchant
- [ ] Purchase events emitted on buying items

### Inventory Actions
- [ ] consume action works and emits `action_executed` event
- [ ] use_item action works and emits `action_executed` event
- [ ] equip_item action works and emits `action_executed` event
- [ ] drop_item action works and emits `action_executed` event
- [ ] Inventory actions tracked by QuestCompletionEngine (e.g., "Use 3 health potions")
- [ ] HUD notification shown on inventory action execution

### Container System
- [ ] Containers spawn in the 3D world (outdoor containers visible)
- [ ] Container data included in world exports
- [ ] FileDataSource returns real container data (not empty stubs)
- [ ] Containers have role-appropriate items (3-8 items each)
- [ ] Press E to open containers

### Farming & Nature Actions
- [ ] Farm hotspots appear at Farm buildings
- [ ] farm_plant action works (empty -> planted)
- [ ] farm_water action works (planted -> watered)
- [ ] farm_harvest action works (harvestable -> empty, produces item)
- [ ] chop_tree action works (energy cost, animation, item produced)
- [ ] All farming/chopping actions emit `action_executed` events and award XP
- [ ] Tree types (7 types) exist as Base Items
- [ ] Stone/mineral types (5 types) exist as Base Items
- [ ] Vegetation/herbs (8 types) exist as Base Items
- [ ] Herb and mineral spawn points appear in forests, gardens, near rocks
- [ ] Nature meshes tagged with Base Item type for harvesting

### Action Quick Menu
- [ ] ActionQuickBar visible at bottom of screen with 4 slots
- [ ] Keys 1-4 activate corresponding action slots
- [ ] Target selection mode activates for actions requiring a target
- [ ] Slots glow when near a valid target
- [ ] Bindings customizable via Game Menu drag-and-drop
- [ ] Action slot configuration persists in save state

### Conversational Action Detection
- [ ] NPC speech acts classified (gave_information, refused_request, taught_vocabulary, gave_directions, etc.)
- [ ] Keyword+pattern matching works for offline mode
- [ ] LLM classification works for online mode
- [ ] `npc_action_detected` events emitted and wired to QuestCompletionEngine
- [ ] Eavesdropped conversations also analyzed for speech acts

### Action Notifications & Activity Log
- [ ] `action_executed` events capture who/what/target/result
- [ ] Toast notifications appear color-coded: green=success, blue=learning, yellow=commerce, orange=combat
- [ ] Activity Log accessible in Game Menu
- [ ] Activity Log shows last 50 events
- [ ] Activity Log is filterable by category

### World Population
- [ ] Containers populated with weighted loot tables by building type
- [ ] Merchants have 10-20 items appropriate to their business
- [ ] Loose items placed in world (books on shelves, tools on workbenches)
- [ ] Item respawn: containers refill after 1 in-game day
- [ ] Item respawn: merchants restock after 2 in-game days

### Crafting System
- [ ] Crafting tab appears in Game Menu
- [ ] Recipes grouped by category (Food, Tools, Potions, Materials)
- [ ] Shows ingredients, availability, crafting station requirements
- [ ] 15-20 starter recipes generated during world generation
- [ ] Crafting produces items correctly
- [ ] Recipes discoverable via text documents

### Animation Previews
- [ ] Quaternius animation catalog maps animations to base actions
- [ ] 3D preview panel in Actions editor shows animation on loop
- [ ] Correct animation plays during physical action execution in-game

### Listen & Repeat
- [ ] "Listen & Repeat" button appears in NPC conversations when target language phrases shown
- [ ] TTS plays the phrase
- [ ] STT records player speech
- [ ] Pronunciation scored and feedback shown (Excellent/Good/Try again)
- [ ] XP awarded based on pronunciation score
- [ ] Quest objective tracking works for listen_and_repeat objectives
- [ ] Works in both active conversations and eavesdropping mode

---

## 1. Main Quest Narrative

### World Data Audit
- [ ] Main quest locations/items/NPCs/buildings cross-referenced against actual exported data
- [ ] `main_quest_locations` field exists in WorldIR
- [ ] Hidden locations have actual geometry (not translucent pillars)

### Narrative Generation
- [ ] `shared/narrative/narrative-generator.ts` exists
- [ ] Generates: writer character, 12+ clue descriptions, chapter details, red herrings, final revelation
- [ ] Uses AI provider with template-based fallback
- [ ] Generated narrative stored in MongoDB
- [ ] Narrative references actual settlement/NPC/building names from the world

### Narrative Editor
- [ ] "Narrative" tab visible in world editor
- [ ] Shows chapter summaries, key characters, mystery arc, clue list, revelation
- [ ] Elements are editable
- [ ] "Regenerate Narrative" button works
- [ ] Validation flags missing entity references
- [ ] `GET /api/worlds/:worldId/narrative` returns data
- [ ] `PUT /api/worlds/:worldId/narrative` saves edits

### Cutscene System
- [ ] Cutscene renders on game first load
- [ ] Cutscene triggers on chapter completion
- [ ] Cutscene triggers on new chapter start
- [ ] Cutscene triggers on game completion
- [ ] Dark background, fade-in/out text, character portraits work
- [ ] Multi-page navigation works
- [ ] Cutscenes are skippable
- [ ] Cutscenes replayable from Game Menu journal tab

### Journal & Case Notes
- [ ] CaseNotes auto-generated when main quest objectives complete
- [ ] CaseNote categories: clue, npc_interview, text_found, location_visited, chapter_event
- [ ] Clues auto-created from: text documents with clueText, conversations with investigation keywords, hidden locations, photos
- [ ] Investigation Board updates with real-time stats

### End-to-End Main Quest
- [ ] World generator creates: writer NPC, abandoned cabin, hidden locations, text documents, informed NPCs
- [ ] CEFR gating works for quest objectives
- [ ] Full 6-chapter main quest completable start to finish
- [ ] Arrival -> Chapter 1 -> ... -> Chapter 6 -> ending cutscene -> completion panel

---

## 2. Intro & Tutorial

### Tutorial Quest
- [ ] "tutorial" questType exists with special properties
- [ ] Persistent HUD hints shown during tutorial
- [ ] Highlighted UI elements guide the player
- [ ] Tutorial teaches: WASD movement, mouse look, E to interact, I for inventory, reading mechanics, J for quest log
- [ ] Assessment phases interleaved between tutorial objectives
- [ ] Game intro cutscene plays before tutorial
- [ ] Tooltip-style HUD overlays highlight UI elements
- [ ] Tutorial completion tracked per-playthrough
- [ ] Tutorial is non-abandonable

### Contextual Control Hints
- [ ] `ContextualHintSystem.ts` exists
- [ ] Hints appear as non-intrusive popups at bottom of screen
- [ ] Hints auto-dismiss after ~5 seconds
- [ ] Hints trigger on first encounter: NPC approach, building entrance, ground item, notice board, quest received, shop NPC, combat, text document, minimap, menu
- [ ] Bilingual hints shown for beginners
- [ ] Hints never repeat within same playthrough

### Game Intro Sequence
- [ ] Multi-page narrative intro displays before player can move
- [ ] Intro mentions: settlement name, why player is here, missing writer incident, player's goal
- [ ] Intro generated from world narrative data
- [ ] Skippable for returning players
- [ ] Smooth transition into tutorial quest

### CEFR Level Selection
- [ ] Choice offered: "Take placement test or select your level?"
- [ ] 4 level options: A1, A2, B1, B2 with descriptions
- [ ] Selecting a level skips assessment but keeps tutorial objectives
- [ ] "Retake Assessment" option available in Game Menu settings

---

## 3. Action Awareness & Quest Wiring

### Objective Type Audit
- [ ] All 45 ACHIEVABLE_OBJECTIVE_TYPES have triggering GameEventBus events
- [ ] All 45 have QuestCompletionEngine handlers
- [ ] All 45 have gameplay action emitters
- [ ] Automated tests exist for objective wiring

### Conversation-Based Quest Completion
- [ ] "conversation_goal" field exists on quest objectives
- [ ] AI evaluates transcript against conversation goal after conversation ends
- [ ] Keyword matching fallback works for offline/exported games
- [ ] Confidence threshold > 0.7 required to complete objective

### Eavesdrop Wiring
- [ ] "eavesdrop" objective type exists in ACHIEVABLE_OBJECTIVE_TYPES
- [ ] `conversation_overheard` events matched against active quest topics
- [ ] Witness testimony clues auto-created from eavesdropping
- [ ] Main-quest-relevant ambient NPC conversation topics generated
- [ ] Eavesdrop UI shows transcript with highlighted vocabulary
- [ ] XP awarded for eavesdropping

### Rewards -> Vocabulary/Skills
- [ ] Target vocabulary words marked "practiced" on quest completion
- [ ] Vocabulary auto-added from text collection and conversation quests
- [ ] Knowledge entries created for main quest discoveries
- [ ] Skill tree unlocks driven by chapter milestones (Ch1->Conversation, Ch2->Reading, etc.)
- [ ] Quest completion summary panel shows: XP, vocabulary, knowledge, skills

### Physical Action Hotspots
- [ ] Fishing spots near water
- [ ] Herb spots in forests
- [ ] Cooking stations in restaurants
- [ ] Visible indicators (particle effects/ground markers) on hotspots
- [ ] Radial menu appears on interaction
- [ ] Actions produce items, award XP, complete objectives, teach vocabulary
- [ ] Quests generated that use physical action hotspots

### Watch/Observe Action
- [ ] Standing near a working NPC for 5+ seconds emits `activity_observed` event
- [ ] "Observing..." UI with progress ring shown
- [ ] Activity name shown in target language with translation
- [ ] Vocabulary added from observation
- [ ] observe_activity quests exist and are completable
- [ ] Combinable with photography ("Photograph the farmer at work")

---

## 4. Text Documents

### Document Generation
- [ ] `server/services/text-document-generator.ts` exists
- [ ] Per settlement generates: 2-3 notice board postings, 1-2 letters, 1-2 recipe cards, 1 journal entry with clue
- [ ] Each document has: title, body in target language, translation, CEFR difficulty, vocabulary with definitions
- [ ] Optional comprehension question generated
- [ ] Main quest documents have `clueText` populated
- [ ] Documents stored in "documents" MongoDB collection
- [ ] Documents included in WorldIR export

### Documents Editor
- [ ] "Documents" section visible in world editor Data tab
- [ ] Documents grouped by type with counts
- [ ] Each shows: title, type icon, CEFR badge, word count, location, clue indicator
- [ ] Expanding a document shows: full text, translation, vocabulary, comprehension question
- [ ] "Generate Documents" button works
- [ ] Manual editing works
- [ ] Custom document creation works
- [ ] "Assign Location" picker works
- [ ] CRUD API endpoints functional

### 3D World Placement
- [ ] Books visible on shelves in buildings
- [ ] Letters visible on desks
- [ ] Flyers visible on walls
- [ ] Recipes visible in kitchens
- [ ] Journals in hidden locations
- [ ] Subtle glow/particle effect on interactable documents
- [ ] Press E opens reading panel
- [ ] `text_collected` event emitted on first find
- [ ] Interior documents appear on building entry
- [ ] Unassigned documents placed semi-randomly
- [ ] Collected documents tracked in save state

### Reading Panel
- [ ] `DocumentReadingPanel.ts` displays document content
- [ ] Hover-to-translate on individual words
- [ ] Multi-page navigation works
- [ ] "Translation" toggle shows full English translation
- [ ] Comprehension quiz appears after reading (4 multiple-choice options)
- [ ] XP scaled by CEFR level (A1=10, A2=15, B1=25, B2=40)
- [ ] "Clue Discovered!" notification for clue documents
- [ ] ClueStore entry created for clue documents
- [ ] Vocabulary added to player's list
- [ ] Document marked as "read"

### Main Quest & Notice Board Integration
- [ ] Missing writer's journal entries advance main quest (`collect_text` objectives)
- [ ] 6+ journal entries generated (one per chapter) revealing the mystery progressively
- [ ] Letters provide optional clues
- [ ] Notices connected to BabylonNoticeBoardPanel
- [ ] Recipes unlock cooking activities
- [ ] Books teach vocabulary categories
- [ ] `find_text` and `read_text` quest objectives reference specific document IDs

---

## 5. Skill Level Adaptation

### NPC Language Behavior
- [ ] A1: 60% bilingual, 40% simplified NPC speech
- [ ] A2: 30% bilingual, 70% simplified NPC speech
- [ ] B1: 10% bilingual, 90% natural target language
- [ ] B2: 100% natural target language
- [ ] "languageMode" field exists in NPC dialogue contexts
- [ ] `buildLanguageAwareSystemPrompt()` uses algorithmic CEFR rules

### Hint & Tooltip Scaling
- [ ] A1/A2: auto-show translations for unknown words (inline subtitles)
- [ ] B1: hover-only translations
- [ ] B2: click-only translations
- [ ] A1: full "Translate" button in chat panel; A2: less prominent; B1+: none
- [ ] Vocabulary hint cards: A1 every new word, A2 every 3rd, B1+ advanced only
- [ ] "Mastered" word tracking (seen 5+ times, used correctly once)

### Quest & Text Complexity
- [ ] Quests tagged with target CEFR level
- [ ] Quest prioritization: at or slightly above player level
- [ ] Quest descriptions use appropriate CEFR vocabulary
- [ ] Text documents filtered by CEFR level
- [ ] Higher-level documents spawn as player advances
- [ ] Comprehension quiz scaling: A1 true/false -> B2 inferential questions
- [ ] `recommendedCefrLevel` field exists on quest data

### Progressive Difficulty
- [ ] Metrics tracked: words learned, words mastered, grammar patterns, conversations, texts read
- [ ] Auto-upgrade A1->A2: 50 words + 3 conversations
- [ ] Auto-upgrade A2->B1: 150 words + 10 conversations + 5 texts
- [ ] Auto-upgrade B1->B2: 300 words + 25 conversations + 15 texts
- [ ] Periodic assessment to confirm upgrade
- [ ] Celebration notification on level-up
- [ ] Game Menu shows CEFR level with progress bar toward next level

### CEFR-Aware Quest Generation
- [ ] Quest pools generated: 30+ A1, 25+ A2, 15+ B1, 10+ B2
- [ ] Each quest specifies target vocabulary from frequency-ranked word lists
- [ ] A1 uses 200 most common words; A2 201-500; B1 501-1500; B2 1500+
- [ ] Quest descriptions and NPC dialogue match quest's CEFR level

---

## 6. Game Completeness Testing

### Quest Completability Validator
- [ ] `shared/quest-feasibility-validator.ts` exists
- [ ] Takes full WorldIR as input
- [ ] Validates referenced entities: NPCs, locations, items, documents, dialogue contexts, recipes, positions
- [ ] Returns `{ feasible, infeasible, warnings }` with specific reasons
- [ ] Unit tests with mock WorldIR pass

### Dependency Graph Validator
- [ ] Dependency graph built (nodes=quests, edges=prerequisites/chain order)
- [ ] Detects cycles in quest dependencies
- [ ] Detects unreachable quests
- [ ] Detects broken main quest chain
- [ ] Verifies enough quests at each CEFR level for progression
- [ ] Verifies terminal quest triggers game completion
- [ ] Visual dependency graph output (text or mermaid)

### Export Validation
- [ ] Pre-export validation runs feasibility + dependency validators
- [ ] Validates: NPC dialogue contexts, building positions/geometry, item existence, main quest chain, document content, settlement presence
- [ ] Warnings shown in export dialog
- [ ] Export blocked on critical failures (no main quest, no NPCs)
- [ ] `validation-report.json` written in exported game's `data/` directory

### Automated Playability Tests
- [ ] `tests/game-playability.test.ts` exists
- [ ] Tests load WorldIR and simulate quest completion
- [ ] Prerequisites simulation works
- [ ] Event emission triggers QuestCompletionEngine correctly
- [ ] Full 6-chapter main quest chain tested
- [ ] Edge cases tested: NPC death, sold items, stalled CEFR
- [ ] Playability report generated

### In-Game Debug Tools
- [ ] Debug overlay toggles with Ctrl+Shift+D
- [ ] Overlay shows: quest objectives, recent events, active chains, CEFR metrics
- [ ] "Complete Objective" debug button works
- [ ] "Warp to Quest Location" debug button works
- [ ] Quest event logging to console with full event data
- [ ] Validation panel runs feasibility validator against current game state
- [ ] Debug tools disabled in production builds
- [ ] Debug tools enabled in exports with `--debug` flag

### World Health Dashboard
- [ ] "World Health" card visible in Insimul editor
- [ ] Shows: quests (completable/total), main quest chain status, NPC/building/document coverage, CEFR distribution
- [ ] Green/yellow/red metric indicators
- [ ] Drill-down on click for each metric
- [ ] "Run Full Validation" button works
- [ ] "Fix Issues" button works for auto-fixable problems
- [ ] Export blocked if any red metrics exist

---

## 7. Geographic Coordinate System

### Country Territory Generation
- [ ] mapWidth/mapDepth computed from world scale and country count
- [ ] Country positions assigned
- [ ] Non-overlapping territoryPolygon generated via Voronoi partitioning
- [ ] Territory shapes influenced by terrain (rivers/mountains as borders)
- [ ] Centroid position and territoryRadius persisted to DB

### Settlement Placement
- [ ] Terrain-appropriate placement (river settlements near water, mountain at elevation, etc.)
- [ ] worldPositionX/worldPositionZ persisted for each settlement
- [ ] Settlement radius persisted (hamlet=50, village=80, town=150, city=250)
- [ ] Minimum distance enforced between settlements
- [ ] Inter-settlement roads generated

### State Subdivision
- [ ] Country territory subdivided into non-overlapping state boundaries (Voronoi)
- [ ] State settlements positioned within state boundary
- [ ] State position = centroid of boundary

### Street Network Unification
- [ ] Adapter converts StreetGenerator output to StreetNetwork format
- [ ] StreetEdge -> StreetSegment preserving waypoints, name, width, direction
- [ ] Compatible with geography-generator.ts and placeLots()
- [ ] Unit tests pass for round-trip fidelity per pattern type

### Terrain-Aware Pattern Selection
- [ ] coast -> waterfront pattern
- [ ] river -> linear pattern
- [ ] mountains -> hillside pattern
- [ ] village/pre-1800 -> organic pattern
- [ ] city < 10k -> radial pattern
- [ ] default -> grid pattern
- [ ] Terrain stored in StreetNetworkConfig
- [ ] Pattern type stored on settlement record

### Non-Grid Lot Placement
- [ ] Linear: rows along main street
- [ ] Waterfront: curved rows following shoreline
- [ ] Organic: scatter within irregular block polygons
- [ ] Radial: along radiating streets and concentric rings
- [ ] Hillside: terraced rows along contour streets
- [ ] All patterns produce LotPlacement[] with standard fields
- [ ] Park/town square identified per pattern
- [ ] Unit tests per pattern confirm lot count scaling

### Client-Side Rendering
- [ ] StreetAlignedPlacement.ts works for non-grid waypoints (curved, diagonal)
- [ ] BabylonGame.ts lot offset computation works for non-axis-aligned streets
- [ ] Town square/park placement renders correctly for all patterns
- [ ] Society preview map renders correctly for all patterns

### SVG Preview Consistency
- [ ] SettlementDialog.tsx SVG preview matches server-side selectStreetPattern() rules
- [ ] Lot count displayed matches server output
- [ ] Visual comparison: SVG vs in-game matches for all 6 patterns
- [ ] Sync-reference comments added

### Society Preview Map
- [ ] World view: countries at real positions with territoryPolygon borders
- [ ] Country view: territory polygon border with settlements at real positions
- [ ] Camera framing from actual entity bounds
- [ ] Inter-settlement roads visible
- [ ] Smooth zoom transitions

### 3D Game Engine Coordinates
- [ ] BabylonGame.ts reads worldPositionX/worldPositionZ from settlement data
- [ ] Uses DB settlement radius
- [ ] Renders inter-settlement roads
- [ ] Terrain sized from mapWidth/mapDepth
- [ ] Player spawn consistent with world coordinate system
- [ ] NPC zone centers consistent with world coordinate system

### Settlement Footprints at Country Zoom
- [ ] SVG layout generation extracted into `shared/settlement-layout-svg.ts`
- [ ] Miniature SVG footprints render as DynamicTextures at country zoom
- [ ] Streets shown as lines, buildings as small rectangles
- [ ] Footprints hidden at world zoom
- [ ] Footprints visible at country zoom
- [ ] Replaced by full 3D at settlement zoom

### World Scale Configuration
- [ ] WorldScale config in world creation UI with presets: compact, standard, expansive
- [ ] Compact: spacing 300-500
- [ ] Standard: spacing 500-1000
- [ ] Expansive: spacing 1000-2000
- [ ] Custom overrides available
- [ ] Stored in generationConfig
- [ ] Used during world generation

---

## Quick Smoke Test Path

For a fast end-to-end validation, run through this minimal path:

1. [ ] Create a new world in the editor
2. [ ] Verify World Health dashboard shows green metrics
3. [ ] Check Narrative tab has generated content
4. [ ] Check Documents tab has generated documents per settlement
5. [ ] Verify quest pools exist at multiple CEFR levels
6. [ ] Export the world (verify no critical validation failures)
7. [ ] Load exported game
8. [ ] Game intro cutscene plays
9. [ ] Tutorial quest begins and teaches controls
10. [ ] CEFR level selection/assessment works
11. [ ] Walk around — verify geographic layout matches chosen pattern
12. [ ] Enter a building — see documents on shelves/desks
13. [ ] Interact with a document — reading panel + comprehension quiz works
14. [ ] Talk to an NPC — language adapts to CEFR level
15. [ ] Find a merchant — trade UI works
16. [ ] Open a container — has appropriate items
17. [ ] Use action quick bar (keys 1-4) for a physical action
18. [ ] Complete a quest objective — rewards show vocabulary/XP/knowledge
19. [ ] Eavesdrop on NPCs — transcript + vocabulary shown
20. [ ] Open debug overlay (Ctrl+Shift+D) — verify quest/event data
21. [ ] Progress through Chapter 1 of main quest — cutscene triggers
22. [ ] Verify CEFR progress bar updates in Game Menu
