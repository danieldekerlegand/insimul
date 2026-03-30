# Testing Checklist — Ralphy 3/28/2026 Sprint

Use this checklist to manually verify all features implemented across the 8 Ralphy tasklists. Check off each item as you confirm it works.

---

## Untested Items

### 0. Action Unification and Expansion

- [ ] **Merchant System**: Verify merchants have "merchant" role, populated inventory (10-20 items), "Press E to Trade" prompt, and purchase event emission
- [ ] **Inventory Actions**: Verify consume/use_item/equip_item/drop_item actions all emit `action_executed` events, are tracked by QuestCompletionEngine, and show HUD notifications
- [ ] **Farming & Nature Actions**: Verify farm hotspots appear, plant/water/harvest cycle works, chop_tree works, all emit events + XP, and nature Base Items (7 trees, 5 stones, 8 herbs) exist with spawn points and tagged meshes
- [ ] **Conversational Action Detection**: Verify NPC speech acts are classified (keyword offline + LLM online), `npc_action_detected` events wire to QuestCompletionEngine, and eavesdropped conversations are also analyzed
- [ ] **World Population**: Merchants have 10-20 items appropriate to their business
- [ ] **Crafting System**: Verify Crafting tab in Game Menu shows recipes grouped by category with ingredients/availability, 15-20 starter recipes generated, crafting produces items, and recipes discoverable via text documents
- [ ] **Listen & Repeat**: Verify "Listen & Repeat" button appears in conversations, TTS/STT work, pronunciation is scored with XP, quest objectives track it, and it works in both active and eavesdrop modes

### 1. Main Quest Narrative

- [ ] **World Data Audit**: Verify main quest entities cross-referenced against exported data, `main_quest_locations` exists in WorldIR, and hidden locations have actual geometry
- [ ] **Journal & Case Notes**: Verify CaseNotes auto-generate on objective completion with proper categories, clues auto-created from documents/conversations/locations/photos, and Investigation Board updates in real-time
- [ ] **End-to-End Main Quest**: Verify world generator creates all required entities, CEFR gating works, and full 6-chapter main quest is completable from arrival through ending cutscene

### 2. Intro & Tutorial

- [ ] **Tutorial Quest**: Verify "tutorial" questType exists, teaches all controls (WASD/mouse/E/I/J), has HUD hints + highlighted UI, includes assessment phases, plays intro cutscene first, is tracked and non-abandonable
- [ ] **Contextual Control Hints**: Verify `ContextualHintSystem.ts` shows non-intrusive auto-dismissing popups on first encounters (NPC, building, items, etc.), bilingual for beginners, never repeating
- [ ] **CEFR Level Selection**: Verify placement test or level select choice is offered (A1-B2), selecting skips assessment but keeps tutorial, and "Retake Assessment" is in Game Menu settings

### 3. Action Awareness & Quest Wiring

- [ ] **Conversation-Based Quest Completion**: Verify "conversation_goal" field exists on objectives, AI evaluates transcripts (with keyword fallback offline), and confidence > 0.7 required to complete
- [ ] **Eavesdrop Wiring**: Verify "eavesdrop" objective type works, overheard events match quest topics, witness clues auto-created, ambient topics generated, UI shows transcript with vocab, and XP awarded
- [ ] **Rewards -> Vocabulary/Skills**: Verify quest completion marks vocabulary as practiced, auto-adds from texts/conversations, creates knowledge entries, unlocks skill tree by chapter, and shows summary panel
- [ ] **Physical Action Hotspots**: Verify fishing/herb/cooking hotspots appear at appropriate locations with visible indicators, radial menu interaction produces items + XP + objectives + vocabulary
- [ ] **Watch/Observe Action**: Verify standing near working NPC 5+ seconds triggers "Observing..." UI with progress ring, shows activity in target language, adds vocabulary, and observe_activity quests work

### 4. Text Documents

- [X] **3D World Placement**: Verify documents appear at type-appropriate furniture (books on shelves, letters on desks, etc.) with glow effect, Press E opens reading panel, `text_collected` event emitted, and collected state tracked
- [X] **Reading Panel**: Verify `DocumentReadingPanel.ts` shows content with hover-translate, multi-page nav, translation toggle, comprehension quiz (4 choices), CEFR-scaled XP, clue notifications, and vocabulary tracking
- [X] **Main Quest & Notice Board Integration**: Verify writer's journal entries (6+, one per chapter) advance main quest, letters give clues, notices connect to notice board, recipes unlock cooking, and `find_text`/`read_text` objectives reference document IDs

### 6. Game Completeness Testing

- [ ] **Quest Completability Validator**: Verify `shared/quest-feasibility-validator.ts` takes WorldIR, validates all referenced entities, returns feasible/infeasible/warnings, and unit tests pass
- [ ] **Dependency Graph Validator**: Verify dependency graph detects cycles, unreachable quests, broken main quest chain, CEFR coverage gaps, and terminal quest completion trigger
- [ ] **Export Validation**: Verify pre-export runs both validators, shows warnings in dialog, blocks on critical failures, and writes `validation-report.json` to export
- [ ] **Automated Playability Tests**: Verify `tests/game-playability.test.ts` loads WorldIR, simulates quest completion including full 6-chapter chain, and tests edge cases (NPC death, sold items, stalled CEFR)
- [ ] **In-Game Debug Tools**: Verify Ctrl+Shift+D toggles debug overlay showing quest/event/CEFR data, "Complete Objective" and "Warp" buttons work, disabled in prod, enabled with `--debug` flag
- [ ] **World Health Dashboard**: Verify "World Health" card in editor shows green/yellow/red metrics for quests/NPCs/buildings/documents/CEFR, with drill-down, "Run Full Validation", "Fix Issues", and export blocking on red

### 7. Geographic Coordinate System

- [X] **Country Territory Generation**: Verify mapWidth/mapDepth computed from scale, country positions assigned, non-overlapping Voronoi territories generated with terrain-influenced borders, and centroid/radius persisted
- [X] **Settlement Placement**: Verify terrain-appropriate placement, worldPositionX/Z and radius persisted, minimum distance enforced, and inter-settlement roads generated
- [X] **State Subdivision**: Verify country territory subdivided into non-overlapping Voronoi state boundaries with settlements inside and state position at centroid
- [X] **Street Network Unification**: Verify adapter converts StreetGenerator to StreetNetwork format preserving waypoints/name/width/direction, compatible with placeLots(), and unit tests pass
- [ ] **Terrain-Aware Pattern Selection**: Verify terrain maps to correct street pattern (coast->waterfront, river->linear, mountains->hillside, village->organic, city->radial, default->grid) and pattern stored on settlement
- [X] **Non-Grid Lot Placement**: Verify all 5 non-grid patterns (linear, waterfront, organic, radial, hillside) produce valid LotPlacement[] with park/town square, and unit tests confirm lot count scaling
- [X] **Society Preview Map**: Verify world view shows countries with territory borders, country view shows settlements at real positions with roads, camera frames from entity bounds, and zoom transitions are smooth

---

## Tested Items (Passed)

### 0. Action Unification and Expansion

#### Action Matrix & Prolog Fixes
- [X] `shared/game-engine/action-matrix.ts` exists and maps all 88 base actions to event, objective type, and interaction mode
- [X] All 88 base actions categorized into PHYSICAL, CONVERSATIONAL, OBSERVATIONAL, AUTOMATIC, or INVENTORY
- [X] Each action marked as EXISTS_IN_GAME, PARTIAL, or MISSING
- [X] Prolog metadata extractor correctly parses all 88 base actions (no format errors)
- [X] Required predicates generated: `action/4`, `can_perform/2`, `action_effect/2`, `action_duration/2`, `action_difficulty/2`
- [X] Batch convert endpoint (`POST /api/worlds/:worldId/prolog/convert-all`) works for actions

#### Merchant System
- [X] Business owner characters appear in NPC list in exported games
- [X] Business types filtered by settlement tier (hamlets don't get factories, etc.)

#### Container System
- [X] Containers spawn in the 3D world (outdoor containers visible)
- [X] Container data included in world exports
- [X] FileDataSource returns real container data (not empty stubs)
- [X] Containers have role-appropriate items (3-8 items each)
- [X] Press E to open containers

#### Action Notifications & Activity Log
- [X] `action_executed` events capture who/what/target/result
- [X] Toast notifications appear color-coded: green=success, blue=learning, yellow=commerce, orange=combat
- [X] Activity Log accessible in Game Menu
- [X] Activity Log shows last 50 events
- [X] Activity Log is filterable by category

#### World Population
- [X] populated with weighted loot tables by building type
- [X] Loose items placed in world (books on shelves, tools on workbenches)
- [X] Item respawn: containers refill after 1 in-game day
- [X] Item respawn: merchants restock after 2 in-game days

#### Animation Previews
- [X] Quaternius animation catalog maps animations to base actions
- [X] 3D preview panel in Actions editor shows animation on loop
- [X] Correct animation plays during physical action execution in-game

### 1. Main Quest Narrative

#### Narrative Generation
- [X] `shared/narrative/narrative-generator.ts` exists
- [X] Generates: writer character, 12+ clue descriptions, chapter details, red herrings, final revelation
- [X] Uses AI provider with template-based fallback
- [X] Generated narrative stored in MongoDB
- [X] Narrative references actual settlement/NPC/building names from the world

#### Narrative Editor
- [X] "Narrative" tab visible in world editor
- [X] Shows chapter summaries, key characters, mystery arc, clue list, revelation
- [X] Elements are editable
- [X] "Regenerate Narrative" button works
- [X] Validation flags missing entity references
- [X] `GET /api/worlds/:worldId/narrative` returns data
- [X] `PUT /api/worlds/:worldId/narrative` saves edits

#### Cutscene System
- [X] Cutscene renders on game first load
- [X] Cutscene triggers on chapter completion
- [X] Cutscene triggers on new chapter start
- [X] Cutscene triggers on game completion
- [X] Dark background, fade-in/out text, character portraits work
- [X] Multi-page navigation works
- [X] Cutscenes are skippable
- [X] Cutscenes replayable from Game Menu journal tab

### 2. Intro & Tutorial

#### Game Intro Sequence
- [X] Multi-page narrative intro displays before player can move
- [X] Intro mentions: settlement name, why player is here, missing writer incident, player's goal
- [X] Intro generated from world narrative data
- [X] Skippable for returning players
- [X] Smooth transition into tutorial quest

### 3. Action Awareness & Quest Wiring

#### Objective Type Audit
- [X] All 45 ACHIEVABLE_OBJECTIVE_TYPES have triggering GameEventBus events
- [X] All 45 have QuestCompletionEngine handlers
- [X] All 45 have gameplay action emitters
- [X] Automated tests exist for objective wiring

### 4. Text Documents

#### Document Generation
- [X] `server/services/text-document-generator.ts` exists
- [X] Per settlement generates: 2-3 notice board postings, 1-2 letters, 1-2 recipe cards, 1 journal entry with clue
- [X] Each document has: title, body in target language, translation, CEFR difficulty, vocabulary with definitions
- [X] Optional comprehension question generated
- [X] Main quest documents have `clueText` populated
- [X] Documents stored in "documents" MongoDB collection
- [X] Documents included in WorldIR export

#### Documents Editor
- [X] "Documents" section visible in world editor Data tab
- [X] Documents grouped by type with counts
- [X] Each shows: title, type icon, CEFR badge, word count, location, clue indicator
- [X] Expanding a document shows: full text, translation, vocabulary, comprehension question
- [X] "Generate Documents" button works
- [X] Manual editing works
- [X] Custom document creation works
- [X] "Assign Location" picker works
- [X] CRUD API endpoints functional

### 5. Skill Level Adaptation (All Passed)

#### NPC Language Behavior
- [X] A1: 60% bilingual, 40% simplified NPC speech
- [X] A2: 30% bilingual, 70% simplified NPC speech
- [X] B1: 10% bilingual, 90% natural target language
- [X] B2: 100% natural target language
- [X] "languageMode" field exists in NPC dialogue contexts
- [X] `buildLanguageAwareSystemPrompt()` uses algorithmic CEFR rules

#### Hint & Tooltip Scaling
- [X] A1/A2: auto-show translations for unknown words (inline subtitles)
- [X] B1: hover-only translations
- [X] B2: click-only translations
- [X] A1: full "Translate" button in chat panel; A2: less prominent; B1+: none
- [X] Vocabulary hint cards: A1 every new word, A2 every 3rd, B1+ advanced only
- [X] "Mastered" word tracking (seen 5+ times, used correctly once)

#### Quest & Text Complexity
- [X] Quests tagged with target CEFR level
- [X] Quest prioritization: at or slightly above player level
- [X] Quest descriptions use appropriate CEFR vocabulary
- [X] Text documents filtered by CEFR level
- [X] Higher-level documents spawn as player advances
- [X] Comprehension quiz scaling: A1 true/false -> B2 inferential questions
- [X] `recommendedCefrLevel` field exists on quest data

#### Progressive Difficulty
- [X] Metrics tracked: words learned, words mastered, grammar patterns, conversations, texts read
- [X] Auto-upgrade A1->A2: 50 words + 3 conversations
- [X] Auto-upgrade A2->B1: 150 words + 10 conversations + 5 texts
- [X] Auto-upgrade B1->B2: 300 words + 25 conversations + 15 texts
- [X] Periodic assessment to confirm upgrade
- [X] Celebration notification on level-up
- [X] Game Menu shows CEFR level with progress bar toward next level

#### CEFR-Aware Quest Generation
- [X] Quest pools generated: 30+ A1, 25+ A2, 15+ B1, 10+ B2
- [X] Each quest specifies target vocabulary from frequency-ranked word lists
- [X] A1 uses 200 most common words; A2 201-500; B1 501-1500; B2 1500+
- [X] Quest descriptions and NPC dialogue match quest's CEFR level

### 7. Geographic Coordinate System

#### Client-Side Rendering
- [X] StreetAlignedPlacement.ts works for non-grid waypoints (curved, diagonal)
- [X] BabylonGame.ts lot offset computation works for non-axis-aligned streets
- [X] Town square/park placement renders correctly for all patterns
- [X] Society preview map renders correctly for all patterns

#### SVG Preview Consistency
- [X] SettlementDialog.tsx SVG preview matches server-side selectStreetPattern() rules
- [X] Lot count displayed matches server output
- [X] Visual comparison: SVG vs in-game matches for all 6 patterns
- [X] Sync-reference comments added

#### 3D Game Engine Coordinates
- [X] BabylonGame.ts reads worldPositionX/worldPositionZ from settlement data
- [X] Uses DB settlement radius
- [X] Renders inter-settlement roads
- [X] Terrain sized from mapWidth/mapDepth
- [X] Player spawn consistent with world coordinate system
- [X] NPC zone centers consistent with world coordinate system

#### Settlement Footprints at Country Zoom
- [X] SVG layout generation extracted into `shared/settlement-layout-svg.ts`
- [X] Miniature SVG footprints render as DynamicTextures at country zoom
- [X] Streets shown as lines, buildings as small rectangles
- [X] Footprints hidden at world zoom
- [X] Footprints visible at country zoom
- [X] Replaced by full 3D at settlement zoom

#### World Scale Configuration
- [X] WorldScale config in world creation UI with presets: compact, standard, expansive
- [X] Compact: spacing 300-500
- [X] Standard: spacing 500-1000
- [X] Expansive: spacing 1000-2000
- [X] Custom overrides available
- [X] Stored in generationConfig
- [X] Used during world generation

---

## Quick Smoke Test Path

For a fast end-to-end validation, run through this minimal path:

1. [X] Create a new world in the editor
2. [X] Verify World Health dashboard shows green metrics
3. [X] Check Narrative tab has generated content
4. [X] Check Documents tab has generated documents per settlement
5. [X] Verify quest pools exist at multiple CEFR levels
6. [ ] Export world, load game, verify intro cutscene + tutorial + CEFR selection all work
7. [ ] Walk around (layout matches pattern), enter building (documents on furniture), interact with document (reading panel + quiz)
8. [ ] Talk to NPC (CEFR-adapted language), find merchant (trade UI), open container (appropriate items)
9. [ ] Use action quick bar (1-4), complete a quest objective (rewards panel), eavesdrop on NPCs (transcript + vocab)
10. [ ] Open debug overlay (Ctrl+Shift+D), progress through Ch1 main quest (cutscene triggers), verify CEFR progress bar updates
