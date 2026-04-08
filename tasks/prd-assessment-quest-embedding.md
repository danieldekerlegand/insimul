# PRD: Assessment-as-Quest Embedding

## Introduction

The game's assessment system (arrival, departure, periodic) currently operates as a separate subsystem with its own MongoDB collection (`AssessmentSession`), dedicated API endpoints, and hardcoded encounter definitions. Although assessments are already wrapped as quests (`questType: 'assessment'`), the actual content (passages, questions, scoring rubrics) and player results (answers, scores) bypass the quest/save system and write directly to the world database.

This redesign embeds all assessment data — definitions, generated content, and player results — inside the quest itself. Assessment content is generated at world creation time and baked into the quest template. Player progress is stored in the quest overlay (save file), not a separate collection. The existing assessment UI (reading/writing/listening modals, conversation phase) is preserved.

## Goals

- Embed assessment definitions (phases, tasks, scoring rubrics, content templates) in the quest's `customData` field
- Generate assessment content (passages, questions, writing prompts) at world creation time and store in the quest template
- Store all player results (answers, scores, phase completion, transcripts) in the quest overlay (save file)
- Eliminate gameplay writes to the `AssessmentSession` MongoDB collection
- Unify arrival, departure, and periodic assessments under the same quest-embedded pattern
- Preserve the existing assessment UI components unchanged
- Keep read-only assessment endpoints for admin/analytics (updated to read from playthrough data)

## User Stories

### US-001: Embed assessment definition in quest customData
**Description:** As a developer, I need assessment phase/task/scoring definitions stored in the quest's `customData` field so the game client can read them without the hardcoded encounter files.

**Acceptance Criteria:**
- [ ] Define an `AssessmentQuestData` type that contains: `phases[]` (each with `id`, `type`, `name`, `tasks[]`, `maxScore`, `scoringDimensions[]`), `totalMaxPoints`, `assessmentType`, and `estimatedMinutes`
- [ ] The type matches the shape of existing `AssessmentDefinition` so the UI can consume it without changes
- [ ] Each task within a phase includes: `id`, `type`, `prompt`, `maxPoints`, `scoringMethod`, `scoringDimensions[]`, and `contentTemplate`
- [ ] Add `customData.assessment: AssessmentQuestData` to the quest schema documentation
- [ ] Typecheck passes

### US-002: Generate assessment content at world creation time
**Description:** As a developer, I need reading passages, comprehension questions, and writing prompts generated and baked into the quest template when the world is created, so they're ready when the player starts.

**Acceptance Criteria:**
- [ ] During world quest seeding (in `quest-chain-templates.ts` or `quest-seed-generator.ts`), call the LLM content generator for each assessment phase's tasks
- [ ] Generated content (passages, questions with answer options, writing prompts) is stored in `customData.assessment.phases[].tasks[].passage`, `.questions[]`, `.writingPrompts[]`
- [ ] Content templates (`{{targetLanguage}}`, `{{cityName}}`) are resolved using world data before generation
- [ ] If LLM generation fails, fall back to the hardcoded encounter file content (arrival-encounter.ts, etc.)
- [ ] Arrival, departure, and periodic assessment quests all have content pre-generated
- [ ] Typecheck passes

### US-003: Read assessment data from quest in game client
**Description:** As a player, when I start an assessment, the game should read phase/task definitions from the quest's `customData` instead of the hardcoded encounter files.

**Acceptance Criteria:**
- [ ] The assessment UI reads `quest.customData.assessment` for phase definitions and pre-generated content
- [ ] If `customData.assessment` is missing (legacy quests), fall back to the encounter definition files
- [ ] The `AssessmentModalConfig` passed to the UI contains the same fields as before (passage, questions, writingPrompts, etc.)
- [ ] Reading, writing, and listening phase modals display correctly with quest-embedded content
- [ ] Conversation phase still triggers NPC interaction as before
- [ ] Typecheck passes

### US-004: Store player answers and scores in quest overlay
**Description:** As a player, when I complete assessment phases, my answers and scores should be saved in the quest overlay (save file) instead of the AssessmentSession collection.

**Acceptance Criteria:**
- [ ] When a phase is completed, the player's answers, score, and dimension scores are stored via `questOverlay.updateQuest(questId, { phaseResults: [...] })`
- [ ] Phase results include: `phaseId`, `score`, `maxScore`, `taskResults[]` (each with `taskId`, `playerAnswer`, `score`, `maxPoints`), `dimensionScores`, `completedAt`
- [ ] The quest overlay's `overrides` map stores the full `phaseResults` array alongside the quest status
- [ ] No `POST /api/assessments/:sessionId/phases/:phaseId` calls are made during gameplay
- [ ] Results persist across save/load cycles
- [ ] Typecheck passes

### US-005: Complete assessment via quest overlay
**Description:** As a player, when I finish all assessment phases, the quest should be marked complete with final CEFR scoring — all stored in the save file.

**Acceptance Criteria:**
- [ ] When all phase objectives are marked complete, `questOverlay.updateQuest(questId, { status: 'completed', assessmentResult: {...} })` is called
- [ ] `assessmentResult` includes: `totalScore`, `maxScore`, `cefrLevel`, `dimensionScores`, `completedAt`
- [ ] CEFR level is computed client-side using `shared/assessment/cefr-mapping.ts` (existing logic)
- [ ] No `PUT /api/assessments/:sessionId/complete` calls are made during gameplay
- [ ] The player's CEFR level is updated in the save state (`currentState.player.cefrLevel`)
- [ ] Typecheck passes

### US-006: Departure and periodic assessments as quest-embedded
**Description:** As a developer, departure and periodic assessments should follow the same quest-embedded pattern as the arrival assessment.

**Acceptance Criteria:**
- [ ] Departure assessment quest is created with `customData.assessment` containing all 4 phases and pre-generated content
- [ ] Periodic assessment quests are created with `customData.assessment` containing the conversational phase and pre-generated content
- [ ] Departure quest is triggered when 10 quests are completed (existing logic), with content already baked in
- [ ] Periodic quests are triggered at level milestones (5, 10, 15, 20) with content already baked in
- [ ] Report card generation (`LearningReportCard`) reads arrival and departure results from quest overlays instead of AssessmentSession
- [ ] Typecheck passes

### US-007: Update admin assessment endpoints to read from playthrough
**Description:** As an admin, I want assessment analytics endpoints to read from playthrough data instead of the legacy AssessmentSession collection.

**Acceptance Criteria:**
- [ ] `GET /api/assessments/player/:playerId` reads assessment results from playthrough quest data (quest overlay)
- [ ] `GET /api/assessments/world/:worldId/summary` aggregates assessment results from all playthroughs
- [ ] `GET /api/assessments/:sessionId/transcripts` reads from quest overlay phase results
- [ ] Write endpoints (`POST /api/assessments`, `PUT /api/assessments/:sessionId/phases/:phaseId`, `PUT /api/assessments/:sessionId/complete`) are removed or return 410 Gone
- [ ] Read endpoints return data in the same format as before for backward compatibility
- [ ] Typecheck passes

### US-008: Per-phase quest objectives with concrete completion triggers
**Description:** As a player, I need the Arrival Assessment quest to have separate objectives for each assessment phase (reading, writing, listening, speaking) so I can see my progress and the system knows exactly when I'm done.

**Acceptance Criteria:**
- [ ] The Arrival Assessment quest is created with 4 objectives: `obj_reading` (Complete reading comprehension), `obj_writing` (Complete writing assessment), `obj_listening` (Complete listening comprehension), `obj_speaking` (Complete conversation assessment)
- [ ] Each objective has a `completionTrigger` field that specifies the event name that marks it complete (e.g., `reading_phase_submitted`, `writing_phase_submitted`, `listening_phase_submitted`, `conversation_phase_completed`)
- [ ] When the assessment UI submits a phase, the corresponding objective is marked `completed: true` in the quest overlay
- [ ] The quest is marked `status: 'completed'` only when ALL 4 objectives are complete
- [ ] Quest progress percentage is calculated as `(completedObjectives / totalObjectives) * 100`
- [ ] The Prolog content for the quest uses per-objective completion checks, not a generic `Progress >= 100`
- [ ] Departure and periodic assessments similarly have per-phase objectives
- [ ] Typecheck passes

### US-009: Remove quest chain dependency from assessments
**Description:** As a developer, assessment quests should be self-contained — no `quest_chain` references to external chain IDs since all assessment data is embedded in `customData`.

**Acceptance Criteria:**
- [ ] The Arrival Assessment quest is created without a `quest_chain` or `chainTemplateId` reference
- [ ] Assessment quest Prolog content does not include `quest_chain/2` or `quest_chain_order/2` predicates
- [ ] The `completionCriteria` field uses `{ type: 'all_objectives' }` (check all objectives complete) instead of `{ assessmentDefinitionId: 'arrival_encounter' }`
- [ ] Assessment quests still have appropriate tags (`assessment`, `arrival`, `main-quest`, `narrative`) for identification
- [ ] Departure and periodic assessment quests are similarly self-contained
- [ ] Typecheck passes

### US-010: Score analysis and CEFR calibration from assessment results
**Description:** As a player, after completing the arrival assessment, my scores should be analyzed to determine my CEFR level and calibrate the game's language difficulty.

**Acceptance Criteria:**
- [ ] After all phase objectives are complete, the system computes per-dimension scores (comprehension, vocabulary, grammar, fluency) from the stored `phaseResults`
- [ ] Total score is mapped to a CEFR level using the existing `mapScoreToCEFR()` function from `shared/assessment/cefr-mapping.ts`
- [ ] The computed CEFR level is stored in the quest overlay's `assessmentResult.cefrLevel` AND in `currentState.player.cefrLevel` (save state)
- [ ] The game's language difficulty systems read from `currentState.player.cefrLevel` on load, adjusting: NPC prompt language mode (simplified/bilingual/natural), vocabulary frequency constraints, and quest difficulty gating
- [ ] If the player scores A1, NPCs use SIMPLIFIED mode; A2-B1 use BILINGUAL; B2+ use NATURAL
- [ ] The assessment result is visible in the player's journal/quest log
- [ ] Typecheck passes

### US-011: Remove gameplay writes to AssessmentSession collection
**Description:** As a developer, I want to ensure the game client never writes to the AssessmentSession MongoDB collection during gameplay.

**Acceptance Criteria:**
- [ ] No `POST /api/assessments` calls from the game client during gameplay
- [ ] No `PUT /api/assessments/:sessionId/phases/:phaseId` calls from the game client
- [ ] No `PUT /api/assessments/:sessionId/complete` calls from the game client
- [ ] No `PUT /api/assessments/:sessionId/recordings` calls from the game client
- [ ] All assessment data flows through the quest overlay → save file pipeline
- [ ] The `AssessmentSession` collection can remain for historical data but receives no new writes from gameplay
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Define `AssessmentQuestData` type mirroring `AssessmentDefinition` shape for quest `customData`
- FR-2: At world creation, generate LLM content for all assessment phases and embed in quest `customData.assessment`
- FR-3: Fall back to hardcoded encounter files if `customData.assessment` is missing (backward compat)
- FR-4: Assessment UI reads phase/task data from `quest.customData.assessment` instead of encounter imports
- FR-5: Player answers and phase scores stored in quest overlay via `updateQuest(questId, { phaseResults })`
- FR-6: Assessment completion stored in quest overlay via `updateQuest(questId, { status: 'completed', assessmentResult })`
- FR-7: CEFR level computed client-side from total score using existing `cefr-mapping.ts`
- FR-8: Report card compares arrival vs departure results from quest overlays, not AssessmentSession
- FR-9: Departure and periodic assessment quests created with pre-generated content at appropriate triggers
- FR-10: Admin read endpoints updated to query playthrough quest data
- FR-11: Gameplay write endpoints for assessments removed or return 410
- FR-12: No AssessmentSession collection writes during gameplay
- FR-13: Reading progress (articles read, quiz answers, comprehension scores) persisted in GameSaveState
- FR-14: NPC contact list (met status, conversation count, first-met timestamp) persisted in GameSaveState
- FR-15: Conversation history (recent 50 records with turn count, words used, language stats) persisted in GameSaveState
- FR-16: Known NPC details (facts learned during conversation) persisted in GameSaveState

## Game State Persistence (US-013 — US-016)

The game menu displays data that players expect to persist across save/load cycles, but several categories are currently lost on reload.

### US-013: Persist reading progress in game save
When the player reads articles in the Library/Notices tab and answers comprehension questions, that progress is lost on reload. Add a `readingProgress` field to `GameSaveState` tracking which articles were read, quiz answers, and comprehension scores. Wire `getReadingProgress()` and `restoreReadingProgress()` into the save/load system.

### US-014: Persist NPC contact list and met status
The Contacts tab shows NPCs the player has met, but this resets on reload. Add a `contacts` field to `GameSaveState` tracking which NPCs were met, when, conversation count, and disposition. Wire into the greeting system's `hasMet`/`markAsMet` and the save/load system.

### US-015: Persist conversation history
Past NPC conversations are tracked by the LanguageProgressTracker but not included in the save snapshot. Add a `conversations` field (capped at 50 records) to `GameSaveState` so conversation count, words used, and language stats persist.

### US-016: Persist known NPC details
Facts learned about NPCs during conversation (extracted by the background metadata LLM call) are ephemeral. Add a `npcKnownDetails` field to `GameSaveState` so the Contacts tab shows previously-learned facts after reload. Cap at 20 facts per NPC.

## Quest Completability Fixes (US-017 — US-021)

Analysis of all 116 quests in the test world revealed that while every objective type now has a mapped event handler, several practical issues prevent players from actually completing certain quests.

### US-017: Resolve quest objective placeholders to actual entity IDs
Many quest objectives contain unresolved placeholders like `{npc}`, `{location}`, `{targetLanguage}`. These must be resolved to actual character names, location names, and the world's target language during quest generation. Without resolution, objectives like "Talk to {npc}" give the player no actionable information, and `npcId` matching fails because the objective has a placeholder instead of a real ID.

### US-018: Wire restaurant food ordering into quest completion
Quests like "Lunch Order" and "Dinner Party" have `order_food` objectives, but the `food_ordered` event may not actually fire during gameplay. Verify food businesses exist in the world, that their merchants have food inventories, and that the ordering interaction emits the expected event.

### US-019: Wire merchant haggling into quest completion
Quests like "Bargain Hunter" and "Haggling" have `haggle_price` objectives, but the `price_haggled` event requires the conversation system to detect bargaining intent (price words, negotiation phrases). Verify this detection exists or add keyword matching for price/number words in merchant conversations.

### US-020: Wire navigation waypoint system into quest completion
Quests like "Follow the Leader" and "Direction Master" have `follow_directions` objectives requiring the player to reach waypoints. The `direction_step_completed` event needs a waypoint system that places visible markers and triggers events on proximity. Check if QuestWaypointManager provides this or if it needs to be added.

### US-021: Make chapter meta-objectives trackable with clear progress indicators
Chapter quests (Chapter 1–6) use meta-objective types (`vocabulary`, `conversation`, `grammar`, `collect_text`) that increment on any relevant activity. Players need to see progress counters and understand what counts toward each objective. The quest tracker HUD should show "2/5 vocabulary activities" rather than an opaque progress bar.

## Non-Goals

- Not changing the assessment UI components (reading/writing/listening modals remain as-is)
- Not changing the CEFR scoring algorithm or dimension definitions
- Not removing the hardcoded encounter files (kept as fallback templates)
- Not migrating historical AssessmentSession data to the new format
- Not adding new assessment types or phases
- Not changing how the conversation phase works with NPCs

## Technical Considerations

- **Quest customData size:** Assessment content (passages, questions) may add ~5-10KB per quest. This is within acceptable limits for MongoDB document fields and save file size.
- **Content generation at world creation:** LLM calls for passages/questions should be batched and cached. If generation fails, the encounter file provides fallback content.
- **Backward compatibility:** Quests created before this change won't have `customData.assessment`. The UI must check for its presence and fall back to encounter files.
- **Save file round-trip:** `questOverlay.serialize()` already captures arbitrary override fields. Adding `phaseResults` and `assessmentResult` to quest overrides requires no overlay changes.
- **Report card generation:** Currently reads from two `AssessmentSession` records (arrival + departure). Must be updated to read from two quest overlays instead, matching results by `questType` and `assessmentType`.

## Success Metrics

- Zero writes to `AssessmentSession` collection during gameplay
- Assessment results survive save/load cycles via quest overlay
- Assessment UI displays correctly with quest-embedded content
- Report card correctly compares arrival vs departure from quest overlay data
- No regression in CEFR scoring accuracy

## Open Questions

- Should we pre-generate content for periodic assessments at world creation, or create them dynamically at milestone triggers? (Pre-generation is simpler but creates quests the player may never reach.)
- Should the listening phase audio be stored as a URL reference in customData, or generated on-demand via TTS when the player starts the phase?
- How should the report card handle the case where a player loads a save from before the departure assessment — should it regenerate from quest overlay data?
