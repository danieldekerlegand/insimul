# PRD: Language Pre-Test, Tutorial & Onboarding System

## Introduction

Add a comprehensive pre-test/tutorial/onboarding system to Insimul that assesses a player's language proficiency through an in-game "Arrival Encounter" with a guide NPC. The player experiences this as the game's opening sequence — not as a test — while the system silently scores 5 competency dimensions across 4 assessment phases (conversation, listening, writing, visual recognition) mapped to CEFR levels. The system adjusts game difficulty based on results, retests periodically on level-up, and provides analytics dashboards for both admins and players.

This work also generalizes language-specific code (skill trees, quest templates) into genre-agnostic frameworks, reorganizes the `shared/` directory structure, and builds the scaffolding for future game genre onboarding (RPG, FPS, survival, etc.).

Based on the dissertation evaluation plan at `/dissertation/evaluation/comprehensive/main-study/`.

## Goals

- Implement a 4-phase in-game language assessment (Arrival Encounter) that doubles as the game's intro/tutorial
- Score players across 5 dimensions (Oral Fluency, Pronunciation, Grammar Accuracy, Vocabulary Range, Pragmatic Competence) using hybrid LLM + algorithmic scoring
- Map assessment scores to CEFR levels (A1-B2) and use them to calibrate game difficulty
- Store speech recordings and transcripts for researcher evaluation
- Support periodic retesting at level-up tier boundaries (levels 5, 10, 15, 20)
- Create a parallel post-test (Departure Encounter) with equivalent structure
- Build admin analytics dashboards with system-wide views and per-player drill-down
- Build player-facing RPG-style progress views (in-game Babylon.js panel)
- Generalize `language-skill-tree.ts` into a generic skill tree framework
- Reorganize `shared/` into semantic subdirectories with barrel re-exports for backward compatibility
- Design the onboarding framework so future game genres (RPG, FPS, survival) can reuse the scaffolding

## User Stories

### US-001: Generic Skill Tree Framework
**Description:** As a developer, I want a generic skill tree abstraction so that language learning, RPG, and other game genres can all use parameterized skill trees without duplicating logic.

**Acceptance Criteria:**
- [ ] Create `shared/skill-tree/generic-skill-tree.ts` with `SkillNode<TConditionType>`, `SkillTier<TConditionType>`, `SkillTreeState<TConditionType>`, and `updateSkillProgress<TConditionType>(state, statsMap)` where `TConditionType` is a string union
- [ ] The generic `updateSkillProgress` accepts a `Record<TConditionType, number>` stats map and evaluates thresholds
- [ ] Create `shared/skill-tree/language-skill-tree.ts` that defines `LanguageSkillConditionType` union and re-exports `LANGUAGE_SKILL_TIERS` (the existing 5-tier data from `shared/language-skill-tree.ts`)
- [ ] Create `shared/skill-tree/index.ts` barrel file exporting both generic and language-specific types
- [ ] Existing `shared/language-skill-tree.ts` is replaced by an import/re-export from the new location for backward compatibility
- [ ] All existing imports of `language-skill-tree` continue to work
- [ ] Typecheck passes

### US-002: Reorganize shared/ Directory Structure
**Description:** As a developer, I want the shared directory organized into semantic subdirectories so that language, assessment, onboarding, and skill-tree code is easy to find and extend.

**Acceptance Criteria:**
- [ ] Create directory structure: `shared/language/`, `shared/assessment/`, `shared/onboarding/`, `shared/skill-tree/`
- [ ] Move existing language files into `shared/language/`: `language-progress.ts` -> `language/progress.ts`, `language-gamification.ts` -> `language/gamification.ts`, `language-quest-templates.ts` -> `language/quest-templates.ts`, `language-utils.ts` -> `language/utils.ts`, `language-vocabulary-corpus.ts` -> `language/vocabulary-corpus.ts`, `language.ts` -> `language/types.ts`, `pronunciation-scoring.ts` -> `language/pronunciation-scoring.ts`, `character-language-profile.ts` -> `language/character-profile.ts`, `bilingual-name-generation.ts` -> `language/bilingual-names.ts`
- [ ] Create barrel `index.ts` files in each new directory that re-export all public types and functions
- [ ] Create backward-compatible re-export files at old paths (e.g., `shared/language-progress.ts` re-exports from `shared/language/progress.ts`)
- [ ] All existing imports across client and server continue to resolve without changes
- [ ] Typecheck passes

### US-003: Assessment Type Definitions
**Description:** As a developer, I need shared assessment type definitions so that client, server, and analytics code all use the same data structures for assessment sessions, phases, tasks, and scoring.

**Acceptance Criteria:**
- [ ] Create `shared/assessment/assessment-types.ts` with these types:
  - `AssessmentDefinition` (id, name, phases, totalMaxScore, cefrMapping)
  - `AssessmentPhase` (id, name, type: 'conversational' | 'listening' | 'writing' | 'visual' | 'custom', tasks, maxScore, durationMinutes)
  - `AssessmentTask` (id, type, prompt, scoringDimensions, maxScore)
  - `ScoringDimension` (id, name, scale: [min, max], weight)
  - `AssessmentSession` (id, definitionId, playerId, worldId, playthroughId, assessmentType: 'pre' | 'post' | 'periodic', status: 'in_progress' | 'completed' | 'abandoned', startedAt, completedAt, phaseResults, totalScore, maxScore, cefrLevel, metadata)
  - `PhaseResult` (phaseId, taskResults, score, maxScore, automatedMetrics)
  - `TaskResult` (taskId, responses, dimensionScores: Record<string, number>, rawScore)
  - `AutomatedMetrics` (speechRateWPM, lexicalDiversityTTR, meanLengthOfUtterance, responseLatencyMs, highestSustainedTier, repairRequests, grammarErrorRate, codeSwitchingInstances)
  - `RecordingReference` (id, phaseId, taskId, audioUrl, transcriptText, timestamp, durationMs)
- [ ] Create `shared/assessment/index.ts` barrel file
- [ ] Typecheck passes

### US-004: CEFR Score Mapping
**Description:** As a developer, I need a function that maps raw assessment scores (/53) to CEFR levels so that the system can classify player proficiency after each assessment.

**Acceptance Criteria:**
- [ ] Create `shared/assessment/cefr-mapping.ts` with:
  - `CEFRLevel` type: 'A1' | 'A2' | 'B1' | 'B1+' | 'B2'
  - `mapScoreToCEFR(totalScore: number, maxScore: number): CEFRLevel` — maps the /53 score to CEFR using the dissertation rubric thresholds
  - `mapScoreToLevel<T>(score: number, maxScore: number, levelMap: Array<{ threshold: number; level: T }>): T` — generic version for non-CEFR use cases
  - `getCEFRDescription(level: CEFRLevel): string` — returns human-readable description
  - Score thresholds: A1 (0-10), A2 (11-21), B1 (22-32), B1+ (33-42), B2 (43-53)
- [ ] Unit-testable pure functions
- [ ] Typecheck passes

### US-005: Arrival Encounter Pre-Test Definition
**Description:** As a developer, I need the "Arrival Encounter" pre-test fully defined as data so the assessment engine can execute it phase by phase.

**Acceptance Criteria:**
- [ ] Create `shared/assessment/arrival-encounter.ts` exporting `ARRIVAL_ENCOUNTER: AssessmentDefinition` containing:
  - Phase 1: Conversational Exchange (8-10 min, /25) with 5 scoring dimensions (Oral Fluency, Pronunciation, Grammar Accuracy, Vocabulary Range, Pragmatic Competence) each scored 1-5, and 3 conversational tiers (A1-A2, A2-B1, B1-B2) with specific prompts per tier
  - Phase 2: Listening Comprehension (3-4 min, /7) with Task 2A: Following Directions (/4) and Task 2B: Information Extraction (/3)
  - Phase 3: Writing (3-4 min, /11) with Task 3A: Form Completion (/5) and Task 3B: Brief Message (/6)
  - Phase 4: Visual Recognition (2-3 min, /10) with Task 4A: Sign/Label Reading (/5) and Task 4B: Object Identification (/5)
  - Total max score: 53
- [ ] Each phase includes task definitions with prompts, scoring rubrics, and duration constraints
- [ ] Tier escalation rules for Phase 1 are defined as data (not logic): tier thresholds, rephrase triggers, advancement criteria
- [ ] Typecheck passes

### US-006: Departure Encounter Post-Test Definition
**Description:** As a developer, I need the parallel "Departure Encounter" post-test defined with different scenarios but equivalent structure and scoring.

**Acceptance Criteria:**
- [ ] Create `shared/assessment/departure-encounter.ts` exporting `DEPARTURE_ENCOUNTER: AssessmentDefinition` with:
  - Phase 1: Farewell conversation (different prompts: recounting experiences, giving recommendations, problem-solving, opinions, hypotheticals)
  - Phase 2: Listening (narrative comprehension + transactional listening)
  - Phase 3: Writing (departure form + review/postcard)
  - Phase 4: Visual Recognition (departure environment signs + objects)
- [ ] Same scoring structure (5 dimensions x 1-5 for Phase 1, same point totals per phase)
- [ ] Same total max score: 53
- [ ] Typecheck passes

### US-007: Generic Onboarding Framework Types
**Description:** As a developer, I need a genre-agnostic onboarding framework so that language learning, RPG, FPS, and other genres can define their own intro/tutorial sequences using the same scaffolding.

**Acceptance Criteria:**
- [ ] Create `shared/onboarding/onboarding-types.ts` with:
  - `OnboardingDefinition` (id, name, genre, steps, assessmentId?)
  - `OnboardingStep` (id, type: 'narrative' | 'movement_tutorial' | 'interaction_tutorial' | 'assessment_phase' | 'ui_tutorial' | 'combat_tutorial' | 'custom', config: Record<string, any>, completionCriteria, optional: boolean, durationEstimate?)
  - `OnboardingState` (definitionId, currentStepIndex, completed, stepStates: Record<string, StepState>, startedAt, completedAt)
  - `StepState` (stepId, status: 'pending' | 'active' | 'completed' | 'skipped', data?)
- [ ] Create `shared/onboarding/index.ts` barrel file
- [ ] Types are genre-agnostic — no language-learning specifics in the generic types
- [ ] Typecheck passes

### US-008: Language Learning Onboarding Definition
**Description:** As a developer, I need the language-learning onboarding sequence defined as data, weaving assessment phases with tutorial steps so the player experiences a natural intro to the game.

**Acceptance Criteria:**
- [ ] Create `shared/onboarding/language-onboarding.ts` exporting `LANGUAGE_LEARNING_ONBOARDING: OnboardingDefinition` with steps:
  1. `narrative`: Guide NPC approaches player, introduces the world setting
  2. `movement_tutorial`: Brief movement/camera controls walkthrough
  3. `assessment_phase`: Phase 1 - Conversational Exchange with guide NPC
  4. `movement_tutorial`: Walk to a destination (doubles as Phase 2A listening/directions task)
  5. `assessment_phase`: Phase 2B - Information Extraction
  6. `interaction_tutorial`: How to interact with objects/UI
  7. `assessment_phase`: Phase 3 - Writing tasks (form + message)
  8. `ui_tutorial`: Quick overview of vocabulary panel, quest tracker, skill tree
  9. `assessment_phase`: Phase 4 - Visual Recognition
  10. `narrative`: Guide NPC summarizes, gives first quest, game begins
- [ ] Each step references the corresponding assessment phase/task by ID
- [ ] Typecheck passes

### US-009: Assessment MongoDB Schema and CRUD
**Description:** As a developer, I need assessment sessions persisted in MongoDB so that assessment data survives across sessions and is queryable for analytics.

**Acceptance Criteria:**
- [ ] Add `AssessmentSessionSchema` to `server/db/mongo-storage.ts` with fields matching `AssessmentSession` type from US-003, plus `recordings: RecordingReference[]` for storing audio/transcript references
- [ ] Add compound index on `{ playerId: 1, worldId: 1, assessmentType: 1 }`
- [ ] Add CRUD methods to MongoStorage class:
  - `createAssessmentSession(session)` — creates a new session
  - `getAssessmentSession(id)` — retrieves by ID
  - `updateAssessmentPhaseResult(sessionId, phaseResult)` — appends/updates a phase result
  - `completeAssessmentSession(sessionId, totalScore, cefrLevel)` — finalizes session
  - `getPlayerAssessments(playerId, worldId?)` — returns all sessions for a player
  - `getWorldAssessmentSummary(worldId)` — aggregation: score distributions, CEFR breakdown, mean automated metrics
  - `addAssessmentRecording(sessionId, recording)` — stores audio/transcript reference
- [ ] Typecheck passes

### US-010: Assessment API Routes
**Description:** As a developer, I need REST API endpoints for assessment lifecycle management so the game client and admin dashboards can create, update, and query assessments.

**Acceptance Criteria:**
- [ ] Create `server/routes/assessment-routes.ts` (or add to routes.ts) with endpoints:
  - `POST /api/assessments` — Create new assessment session (body: playerId, worldId, playthroughId, definitionId, assessmentType)
  - `GET /api/assessments/:sessionId` — Get assessment session with all results
  - `PUT /api/assessments/:sessionId/phases/:phaseId` — Submit phase results (body: PhaseResult)
  - `PUT /api/assessments/:sessionId/recordings` — Add recording/transcript reference
  - `PUT /api/assessments/:sessionId/complete` — Finalize: compute total score, map to CEFR, mark completed
  - `GET /api/assessments/player/:playerId` — List all assessments for a player (query: worldId?, assessmentType?)
  - `GET /api/assessments/world/:worldId/summary` — Aggregate stats for admin dashboard
  - `GET /api/assessments/:sessionId/recordings` — List recording references for researcher access
- [ ] All endpoints validate required fields and return appropriate error responses
- [ ] Assessment completion endpoint calls `mapScoreToCEFR()` and stores the result
- [ ] Typecheck passes

### US-011: GameEventBus Assessment Events
**Description:** As a developer, I need assessment-related events in the GameEventBus so that all game systems can react to assessment lifecycle changes.

**Acceptance Criteria:**
- [ ] Add new event types to `GameEventBus.ts` `GameEvent` union:
  - `{ type: 'assessment_started'; sessionId: string; assessmentType: string; definitionId: string }`
  - `{ type: 'assessment_phase_started'; sessionId: string; phaseId: string; phaseType: string }`
  - `{ type: 'assessment_phase_completed'; sessionId: string; phaseId: string; score: number; maxScore: number }`
  - `{ type: 'assessment_tier_change'; sessionId: string; fromTier: number; toTier: number; direction: 'up' | 'down' }`
  - `{ type: 'assessment_completed'; sessionId: string; totalScore: number; cefrLevel: string }`
  - `{ type: 'onboarding_step_started'; stepId: string; stepType: string }`
  - `{ type: 'onboarding_step_completed'; stepId: string }`
  - `{ type: 'onboarding_completed'; definitionId: string }`
- [ ] Events are properly typed in the discriminated union
- [ ] Typecheck passes

### US-012: Assessment Engine State Machine
**Description:** As a developer, I need a client-side assessment engine that manages the full assessment lifecycle — spawning the guide NPC, progressing through phases, collecting scores, and computing results.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/assessment/AssessmentEngine.ts` with:
  - State machine: `idle -> initializing -> phase_active -> phase_transitioning -> scoring -> complete`
  - Constructor accepts `AssessmentDefinition`, `DataSource`, `GameEventBus`, reference to `BabylonGame`
  - `start()` — spawns/designates guide NPC, emits `assessment_started`, begins first phase
  - `advancePhase()` — transitions to next phase, emits phase events
  - `submitPhaseResult(phaseId, result)` — stores result, calls server API to persist
  - `complete()` — computes total score, calls `mapScoreToCEFR()`, emits `assessment_completed`, persists to server
  - `getState()` — returns current state, active phase, running scores
  - Tracks `AutomatedMetrics` in real-time (word count, response timestamps for latency computation)
  - Manages recording references (stores audio URLs and transcript text per phase)
- [ ] Engine does not depend on Babylon.js directly — receives callbacks/interfaces for UI integration
- [ ] Typecheck passes

### US-013: Assessment Conversation Controller (Phase 1)
**Description:** As a developer, I need a controller for the conversational assessment phase that manages 3-tier escalation, parses LLM scoring blocks, and tracks automated speech metrics, while storing transcripts for researcher review.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/assessment/AssessmentConversationController.ts` with:
  - Builds assessment-specific system prompt extending `buildLanguageAwareSystemPrompt()` with:
    - 3-tier escalation rules (Tier 1: A1-A2, Tier 2: A2-B1, Tier 3: B1-B2) with specific prompt sequences from the Arrival Encounter definition
    - `**ASSESSMENT_EVAL**` structured block instructions (same pattern as `**GRAMMAR_FEEDBACK**`)
    - Adaptive behavior rules: rephrase if struggling, advance if handling easily
  - `parseAssessmentEvalBlock(response: string)` — extracts dimension scores (oralFluency, pronunciation, grammarAccuracy, vocabularyRange, pragmaticCompetence) from NPC response, returns parsed scores + cleaned response
  - Tier tracking: starts at Tier 1, advances after 3+ successful exchanges at a tier, drops back if player struggles
  - Timer management: 8-10 minute window, graceful wrap-up when time is near
  - Automated metrics collection during conversation:
    - Speech rate: words per minute from player utterances
    - Lexical diversity: type-token ratio across all player turns
    - Mean length of utterance: average words per player turn
    - Response latency: time from NPC message completion to player response
    - Repair requests: count of clarification/repetition requests
    - Code-switching: count of L1 fallback instances
  - Stores full conversation transcript (all player and NPC turns with timestamps) as `RecordingReference`
  - Audio recording references stored if STT is active
- [ ] Integrates with existing `BabylonChatPanel` for message send/receive
- [ ] Integrates with existing `LanguageProgressTracker` for vocabulary/grammar tracking during assessment
- [ ] Final Phase 1 score computed as sum of 5 dimension averages across all eval blocks
- [ ] Typecheck passes

### US-014: Assessment Listening Task Handler (Phase 2)
**Description:** As a developer, I need handlers for the listening comprehension phase: Task 2A (following directions via navigation) and Task 2B (information extraction via selection).

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/assessment/AssessmentListeningTask.ts` with:
  - Task 2A: Following Directions
    - NPC gives multi-step directions to a location
    - Uses `CharacterController` position tracking and `GameEventBus` `location_visited` events
    - Scores: correct destination reached (1 pt), directional steps followed correctly (0-3 pts)
    - Notes whether player asked for repetition (not penalized, recorded for metrics)
  - Task 2B: Information Extraction
    - NPC describes 3 options with varying details
    - Presents in-game UI with 3 selection choices (reuse existing UI patterns)
    - 3 questions: simple detail (1 pt), comparative (1 pt), inferential (1 pt)
  - Stores NPC audio/transcript for researcher review
  - Total Phase 2 score: /7
- [ ] Emits appropriate GameEventBus events for phase progress
- [ ] Typecheck passes

### US-015: Assessment Writing Task Handler (Phase 3)
**Description:** As a developer, I need handlers for the writing assessment phase: Task 3A (form completion) and Task 3B (brief message).

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/assessment/AssessmentWritingTask.ts` with:
  - Task 3A: Form Completion
    - Presents in-game form UI with fields: Nationality (1 pt), Reason for visit (1 pt), Length of stay (1 pt), Special requests (2 pts)
    - Name field included but not scored (control item)
    - Scoring: LLM evaluates each response for comprehensibility and correctness in target language
  - Task 3B: Brief Message
    - Presents compose UI with contextual prompt (e.g., "Write a note to your friend...")
    - Player writes 2-4 sentences in target language
    - Scoring via LLM: Task completion (0-2), Vocabulary (0-2), Grammar (0-2)
  - All player writing stored as transcript for researcher review
  - Total Phase 3 score: /11
- [ ] Typecheck passes

### US-016: Assessment Visual Recognition Task Handler (Phase 4)
**Description:** As a developer, I need handlers for the visual recognition phase: Task 4A (sign/label reading) and Task 4B (object identification).

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/assessment/AssessmentVisualTask.ts` with:
  - Task 4A: Sign/Label Reading
    - Presents 5 target-language signs/labels in the environment (leverages `BuildingSignManager`)
    - For each, player selects correct meaning from 3 options (thought-bubble choices)
    - Score: 1 pt each, total /5
  - Task 4B: Object Identification
    - NPC points to 5 objects, asks "What is this?" in target language
    - Player responds verbally (STT captured) or selects from labeled options
    - Uses `scorePronunciation()` for verbal responses if STT active
    - Score: 1 pt each, total /5
  - Total Phase 4 score: /10
- [ ] Signs/labels and objects are configurable per target language (not hardcoded to French)
- [ ] Typecheck passes

### US-017: Assessment UI Overlay
**Description:** As a player, I want to see subtle progress indicators during the assessment so I know how far along I am without breaking immersion.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/assessment/AssessmentUI.ts` (Babylon.js GUI) with:
  - Minimal phase progress indicator (e.g., "Step 2 of 4" or 4 dots)
  - Timer display for timed phases (conversation, writing)
  - Transition screens between phases with brief flavor text (e.g., "Let's head to the hotel...")
  - Results summary panel at assessment completion showing:
    - Overall score as a percentage
    - CEFR level with description
    - 5-dimension radar chart or bar display for Phase 1 scores
    - "Your adventure begins!" call to action
  - Uses `@babylonjs/gui` consistent with existing panels (BabylonSkillTreePanel, BabylonQuestTracker)
- [ ] Does not block gameplay during transitions
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-018: Onboarding Manager
**Description:** As a developer, I need an onboarding manager that orchestrates the step-by-step onboarding sequence, interleaving tutorial steps with assessment phases.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/onboarding/OnboardingManager.ts` with:
  - Constructor accepts `OnboardingDefinition`, `AssessmentEngine`, `BabylonGame` reference, `GameEventBus`
  - `start()` — begins the onboarding sequence from step 0
  - `advanceStep()` — progresses to next step, handles step type dispatch:
    - `narrative`: triggers NPC dialogue sequence
    - `movement_tutorial`: shows movement controls overlay, waits for player to demonstrate
    - `interaction_tutorial`: highlights interactable objects, waits for player action
    - `assessment_phase`: delegates to `AssessmentEngine` for the corresponding phase
    - `ui_tutorial`: shows tooltip/highlight on UI element, waits for dismissal
  - `skipStep()` — marks optional steps as skipped
  - `complete()` — finalizes onboarding, emits `onboarding_completed`, stores completion in playthrough saveData
  - `getState()` — returns `OnboardingState` with current step and progress
- [ ] Persists onboarding state to playthrough `saveData` so it survives page refresh
- [ ] Emits `onboarding_step_started` and `onboarding_step_completed` events
- [ ] Typecheck passes

### US-019: BabylonGame Integration - First Playthrough Detection
**Description:** As a player starting a new game, I want to be automatically guided through the onboarding/assessment sequence, and on subsequent plays the game starts normally.

**Acceptance Criteria:**
- [ ] Modify `BabylonGame.ts` `init()` to check if this is the player's first playthrough (no completed assessment in playthrough saveData)
- [ ] If first playthrough: instantiate `OnboardingManager` with `LANGUAGE_LEARNING_ONBOARDING` definition and `AssessmentEngine` with `ARRIVAL_ENCOUNTER`, then call `onboardingManager.start()` before entering the main game loop
- [ ] If not first playthrough: skip onboarding, start game loop normally
- [ ] On onboarding completion: store `{ onboardingComplete: true, assessmentSessionId, cefrLevel, assessmentComplete: true }` in playthrough saveData
- [ ] Assessment CEFR level is used to set initial `effectiveFluency` in `LanguageProgressTracker`
- [ ] Guide NPC spawns near player spawn point during onboarding
- [ ] Typecheck passes

### US-020: Periodic Retesting on Level-Up
**Description:** As a player leveling up at tier boundaries, I want to be reassessed so the game can track my improvement and adjust difficulty.

**Acceptance Criteria:**
- [ ] Modify `LanguageGamificationTracker.ts` to check for tier boundary level-ups (levels 5, 10, 15, 20)
- [ ] At tier boundary: check if enough time has passed since last assessment (minimum 1 hour of gameplay)
- [ ] If due for reassessment: trigger an abbreviated assessment (Phase 1 conversational only, /25, 5-minute version with faster tier escalation)
- [ ] Create `shared/assessment/periodic-encounter.ts` with abbreviated definition
- [ ] Store periodic assessment results alongside pre/post assessments with `assessmentType: 'periodic'`
- [ ] Update player's CEFR level if it has changed
- [ ] Emit `assessment_completed` event with updated CEFR level
- [ ] Typecheck passes

### US-021: Integrate Assessment CEFR with Existing Systems
**Description:** As a developer, I want the assessment CEFR level to feed into existing difficulty adaptation, content gating, and NPC prompt generation systems.

**Acceptance Criteria:**
- [ ] Modify `buildPlayerProficiencySection()` in `shared/language/utils.ts` to accept optional `cefrLevel` parameter that overrides/supplements the `effectiveFluency` calculation
- [ ] Modify `ContentGatingManager.ts` to use CEFR level as an additional gating criterion alongside fluency score
- [ ] Assessment dimension scores (Oral Fluency, Pronunciation, Grammar, Vocabulary, Pragmatic) stored in `LanguageProgress` and used to identify specific weak areas for NPC prompt focus
- [ ] Typecheck passes

### US-022: Admin Assessment Dashboard
**Description:** As an admin/researcher, I want a dashboard showing system-wide assessment data with the ability to drill down into individual players.

**Acceptance Criteria:**
- [ ] Create `client/src/components/analytics/AssessmentDashboard.tsx` with:
  - Score distribution histogram (pre-test vs. post-test overlay)
  - CEFR level distribution pie/bar chart
  - Per-phase score breakdown (stacked bar chart showing Phase 1-4 contributions)
  - Automated metrics averages table (WPM, TTR, MLU, latency, grammar error rate, code-switching)
  - Filterable by: world, target language, date range, assessment type (pre/post/periodic)
  - Summary stat cards: total assessments, mean score, mean improvement (pre-to-post)
- [ ] Data loaded from `GET /api/assessments/world/:worldId/summary` endpoint
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-023: Player Assessment Detail View (Admin)
**Description:** As an admin/researcher, I want to drill down into an individual player's assessment history to see longitudinal progress and access recordings/transcripts.

**Acceptance Criteria:**
- [ ] Create `client/src/components/analytics/PlayerAssessmentDetail.tsx` with:
  - Longitudinal assessment score chart (line graph: pre -> periodic assessments -> post over time)
  - Per-dimension radar chart showing the 5 Phase 1 dimensions for each assessment
  - Phase-by-phase score breakdown table with expandable task details
  - Automated metrics comparison table (pre vs. post with delta)
  - Link to recordings/transcripts for each assessment session
  - Comparison to cohort average (overlay on charts)
- [ ] Data loaded from `GET /api/assessments/player/:playerId` endpoint
- [ ] Accessible from AssessmentDashboard by clicking a player row
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-024: Player-Facing RPG Progress Panel (In-Game)
**Description:** As a player, I want to see my language assessment results as an RPG-style character sheet in-game so I understand my strengths and areas for improvement.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/assessment/AssessmentResultsPanel.ts` (Babylon.js GUI) with:
  - "Language Stats" section: 5 dimensions displayed as RPG stat bars (like STR, DEX, WIS):
    - Oral Fluency, Pronunciation, Grammar Accuracy, Vocabulary Range, Pragmatic Competence
    - Each bar scaled 1-5, color-coded by level
  - CEFR level displayed as a "rank" badge (e.g., shield icon with "A2" or "B1")
  - If player has multiple assessments: show improvement arrows (up/down/same) next to each stat
  - Historical mini-chart showing overall score trend
  - "Next assessment in: Level X" indicator
  - Accessible from game menu or hotkey
- [ ] Integrates with existing `BabylonGUIManager` panel system
- [ ] Uses `@babylonjs/gui` consistent with `BabylonSkillTreePanel`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-025: Recording and Transcript Storage
**Description:** As a researcher, I want speech recordings and full conversation transcripts persisted for each assessment so I can perform manual evaluation and qualitative analysis.

**Acceptance Criteria:**
- [ ] During assessment Phase 1, all player speech audio (if STT is active) is captured and stored with a reference URL
- [ ] Full conversation transcript (all player and NPC turns with timestamps) is stored as part of the assessment session
- [ ] Phase 2 listening task NPC audio/transcript is stored
- [ ] Phase 3 writing task player text responses are stored verbatim
- [ ] Recordings and transcripts accessible via `GET /api/assessments/:sessionId/recordings` endpoint
- [ ] Admin UI (US-023) links to these recordings
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Create generic `SkillNode<TConditionType>` and `SkillTier<TConditionType>` types parameterized by condition type string union
- FR-2: Create generic `updateSkillProgress<TConditionType>(state, statsMap)` that evaluates thresholds from a `Record<TConditionType, number>` stats map
- FR-3: Re-implement language skill tree using generic framework with `LanguageSkillConditionType` union
- FR-4: Reorganize `shared/` into `language/`, `assessment/`, `onboarding/`, `skill-tree/` subdirectories with barrel re-exports
- FR-5: Maintain backward compatibility via re-export files at old import paths
- FR-6: Define `AssessmentDefinition`, `AssessmentSession`, `PhaseResult`, `TaskResult`, `AutomatedMetrics`, `RecordingReference` shared types
- FR-7: Implement CEFR score mapping with configurable thresholds and a generic `mapScoreToLevel` function
- FR-8: Define Arrival Encounter (pre-test) with 4 phases, 53 total points, 5 conversational scoring dimensions
- FR-9: Define Departure Encounter (post-test) as parallel form with different scenarios, same structure/scoring
- FR-10: Define generic `OnboardingDefinition` and `OnboardingStep` types supporting narrative, tutorial, assessment, and custom step types
- FR-11: Define language-learning onboarding sequence weaving 10 steps of tutorial + assessment
- FR-12: Create `AssessmentSessionSchema` in MongoDB with compound index on playerId + worldId + assessmentType
- FR-13: Implement 8 assessment CRUD methods on MongoStorage including aggregation for admin summary
- FR-14: Create 8 REST API endpoints for assessment lifecycle (create, update phases, add recordings, complete, query by player, query by world, get recordings)
- FR-15: Add 8 assessment/onboarding event types to GameEventBus discriminated union
- FR-16: Implement `AssessmentEngine` state machine managing phase progression, scoring, and server persistence
- FR-17: Implement `AssessmentConversationController` with 3-tier escalation, `**ASSESSMENT_EVAL**` block parsing, and 6 automated metrics
- FR-18: Store full conversation transcripts and audio references for researcher access
- FR-19: Implement Phase 2 listening handler with navigation tracking (2A) and selection UI (2B)
- FR-20: Implement Phase 3 writing handler with form UI (3A) and compose UI (3B) with LLM scoring
- FR-21: Implement Phase 4 visual handler with sign reading (4A) and object identification (4B)
- FR-22: Create assessment progress UI overlay with phase indicators, timers, transitions, and results panel
- FR-23: Implement `OnboardingManager` orchestrating step-by-step progression with state persistence
- FR-24: Modify `BabylonGame.init()` to detect first playthrough and launch onboarding/assessment
- FR-25: Trigger abbreviated periodic assessments at level-up tier boundaries (5, 10, 15, 20) with minimum gameplay time check
- FR-26: Feed CEFR level into `buildPlayerProficiencySection()`, `ContentGatingManager`, and `LanguageProgressTracker`
- FR-27: Create admin `AssessmentDashboard` with score distributions, CEFR breakdown, phase breakdown, automated metrics, and filters
- FR-28: Create admin `PlayerAssessmentDetail` with longitudinal charts, radar charts, recording links, and cohort comparison
- FR-29: Create in-game `AssessmentResultsPanel` with RPG-style stat bars, CEFR badge, improvement tracking, and assessment countdown

## Non-Goals

- **Implementing onboarding for non-language genres** (RPG, FPS, survival) — only the generic scaffolding is built; no actual RPG/FPS onboarding definitions
- **Real-time audio streaming to server** — audio is stored client-side or via existing STT pipeline, not streamed live
- **Human-in-the-loop scoring during gameplay** — LLM + algorithmic scoring is immediate; researcher review is post-hoc
- **Automated NLP analysis on client** — no heavy NLP libraries; scoring uses LLM (via existing Gemini API) and simple string metrics (WPM, TTR, Levenshtein)
- **Modifying existing quest templates or gamification logic** — this work adds new assessment/onboarding systems alongside existing ones
- **Building a standalone assessment tool** — assessments are integrated into the game, not a separate app
- **Multi-language support for the assessment UI itself** — the UI chrome is in English; only the assessment content is in the target language
- **Refactoring `server/routes.ts` monolith** — new routes are added as a separate module but the existing monolith is not split
- **Moving client `3DGame/` files into subdirectories** — only new files are placed in `assessment/` and `onboarding/` subdirs; existing files stay in place

## Design Considerations

- Assessment UI should use the same `@babylonjs/gui` patterns as existing panels (`BabylonSkillTreePanel`, `BabylonQuestTracker`, `BabylonVocabularyPanel`)
- Phase transition screens should feel narrative, not clinical — use flavor text matching the world setting
- The guide NPC should feel like a character, not a test proctor — warm, encouraging, adapts to player's comfort
- Admin dashboard should use the same React component library and styling as existing `ResearcherDashboard.tsx` and `TelemetryMonitorDashboard.tsx`
- RPG progress panel should visually resemble a character sheet: stat bars, badges, progression indicators

## Technical Considerations

- **Existing assessment infrastructure**: `server/services/assessment-framework.ts` already defines ACTFL/SUS/SSQ/IPQ instruments with scoring — the new system complements rather than replaces this (those instruments measure different things)
- **Existing MongoDB collections**: `LanguageAssessment` and `EvaluationResponse` collections exist but are designed for research instruments, not in-game assessments — the new `AssessmentSession` collection is purpose-built for the game assessment flow
- **LLM scoring dependency**: Phase 1 conversational scoring depends on the NPC's LLM (Gemini) embedding `**ASSESSMENT_EVAL**` blocks — if the LLM fails to include the block, fall back to automated metrics only
- **`**GRAMMAR_FEEDBACK**` pattern**: The `parseGrammarFeedbackBlock()` function in `shared/language/progress.ts` is the proven pattern for extracting structured data from LLM responses — `parseAssessmentEvalBlock()` follows the same approach
- **Backward compatibility**: All `shared/` moves use barrel re-exports so zero import changes are needed in existing code
- **BabylonGame.init() insertion point**: The onboarding check goes after `loadNPCs()` and before `startGameLoop()` — the guide NPC must be loaded before onboarding can begin
- **Playthrough saveData**: Already a flexible JSON field — adding `onboardingComplete`, `assessmentSessionId`, `cefrLevel` requires no schema migration
- **Periodic assessment timing**: Uses `LanguageGamificationTracker.onLevelUp()` callback which already fires at level boundaries
- **Recording storage**: Audio files should be stored as blobs or references to object storage (implementation detail for US-025); transcripts are stored inline in the assessment session document

## Success Metrics

- Players complete the full Arrival Encounter assessment in 15-20 minutes without perceiving it as a "test"
- CEFR level assignment matches researcher manual evaluation in 80%+ of cases
- Assessment scores show statistically significant correlation with researcher-scored proficiency
- Admin dashboard loads assessment summary for a world in under 2 seconds
- Player-facing RPG panel renders assessment results in under 1 second
- All automated metrics (WPM, TTR, MLU, latency, grammar error rate, code-switching) are computed accurately for 95%+ of assessment sessions
- Full conversation transcripts and recordings are available for 100% of completed assessments
- Periodic retesting triggers correctly at all tier boundaries without disrupting gameplay
- Generic skill tree framework compiles and functions identically to the original language-specific implementation
- Zero breaking changes from `shared/` reorganization (all existing imports continue to work)

## Open Questions

- Should the abbreviated periodic assessment (US-020) include any phases beyond conversation, or is Phase 1 alone sufficient for tracking progress?
- For Phase 4 visual recognition, should signs/labels be dynamically generated based on the world's target language, or should we maintain curated sign sets per language?
- Should the guide NPC persist in the world after onboarding (as a recurring character the player can revisit), or disappear after the intro?
- For the admin dashboard, should we integrate with the existing `ResearcherDashboard.tsx` (extend it with assessment tabs) or create a separate standalone dashboard component?
- What is the minimum viable audio recording quality/format for researcher review — WAV, MP3, WebM? Should we compress before storage?
- Should the post-test (Departure Encounter) trigger automatically at a specific game milestone, or should it be manually triggered by a researcher/admin?
