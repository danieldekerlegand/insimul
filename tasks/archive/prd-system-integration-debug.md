# PRD: System Integration Fixes & Debug Console

## Introduction

A comprehensive codebase audit revealed that 65 user stories across 4 pipelines (Translation & Immersion, Assessment & Adaptation, Chat Performance, Game State Truth System) are marked complete, but critical **wiring between systems is missing**. Modules exist in isolation — functions are written, exported, and unit-tested, but never called from the systems that need them. Core feedback loops (assessment -> CEFR -> adaptation, vocabulary tracking -> mastery -> advancement, grammar analysis -> remediation) are broken.

This PRD addresses the highest-priority integration gaps and adds a unified debug console to make ongoing diagnosis of these interconnected systems tractable.

## Goals

- Wire disconnected feedback loops so CEFR progression, vocabulary tracking, and language adaptation actually function end-to-end during gameplay
- Ensure Prolog and MongoDB maintain consistent quest state bidirectionally
- Provide developers with a unified in-game debug console showing Prolog state changes, LLM prompt/response summaries, and language performance results in real time
- Ensure every fix includes its own test to prevent regression

## User Stories

---

### Group A: Core Feedback Loop Wiring

---

### US-001: Wire CEFR auto-advancement into gameplay hooks
**Description:** As a player, I need my CEFR level to advance automatically when I meet progression thresholds so that game difficulty adapts to my growing proficiency without requiring a formal re-assessment.

**Acceptance Criteria:**
- [ ] Call `checkCEFRAdvancement()` from `LanguageProgressTracker` after each conversation completion (when fluency gain is applied)
- [ ] Call `checkCEFRAdvancement()` after quest completion (in the quest completion handler in `server/routes.ts`)
- [ ] When advancement triggers, emit a `CEFR_ADVANCED` event that the UI can listen for
- [ ] Increment `textsRead` counter when reading comprehension tasks complete (currently stuck at 0 in `LanguageProgressTracker`)
- [ ] Add test: simulate a player at A2 with sufficient words/conversations/texts, verify `checkCEFRAdvancement()` returns advancement to B1
- [ ] Add test: verify `textsRead` increments on reading task completion
- [ ] Typecheck passes

**Notes:**
- `checkCEFRAdvancement()` is in `shared/language/cefr-adaptation.ts:306-370`. Logic is correct but never invoked.
- `_textsRead` is initialized to 0 in `LanguageProgressTracker` and never incremented.
- Advancement thresholds: A1->A2 (50 words, 3 convos, 0 texts), A2->B1 (150 words, 10 convos, 5 texts), etc.

---

### US-002: Connect hover-translate lookups to vocabulary progress tracking
**Description:** As a player, I need my hover-translate word lookups to count as vocabulary encounters so that passive exposure contributes to my word mastery and CEFR advancement.

**Acceptance Criteria:**
- [ ] In `BabylonGame.ts` (or wherever `HoverTranslationSystem` is instantiated), call `setOnWordEncounter()` with a callback that routes to `LanguageProgressTracker.recordVocabularyEncounter()`
- [ ] Ensure the callback passes `source: 'passive_hover'` and `weight: 0.5` as defined in `shared/language/progress.ts`
- [ ] Verify that `HoverTranslationSystem.recordWordEncounter()` fires the callback with word, translation, and encounter metadata
- [ ] Add test: simulate a hover lookup, verify `LanguageProgressTracker` receives a `passive_hover` encounter with 0.5x weight
- [ ] Add test: verify 2 passive_hover encounters equal 1 weighted encounter in mastery calculation
- [ ] Typecheck passes

**Notes:**
- `HoverTranslationSystem` has `setOnWordEncounter()` callback (line 66) but it's never connected.
- `recordWordEncounter()` computes `shouldShowVocabHint()` but the boolean is unused — no UI acts on it. Out of scope for this story but worth noting.

---

### US-003: Wire `useGameTranslation` hook into UI components
**Description:** As a player at B1+, I need action prompts and building labels to appear in my target language so that the UI immersion system actually functions.

**Acceptance Criteria:**
- [ ] Replace at least 5 hardcoded English action prompt strings (e.g., "Talk to", "Enter", "Pick Up", "Examine", "Fish") with `useGameTranslation()` or `getGameString()` calls in the Babylon.js interaction rendering code
- [ ] Replace building label rendering to use `buildBilingualBuildingPrompt()` from `shared/language/in-world-text.ts`
- [ ] Verify that at CEFR A1-A2 the UI shows English (0% immersion), and at B2+ shows target language
- [ ] Call `shouldTranslateUIKey()` from `shared/language/ui-localization.ts` to gate translations per namespace
- [ ] Add test: mock CEFR level at A1, verify action prompts return English; mock at B2, verify they return target language
- [ ] Add test: verify `shouldTranslateUIKey('actions.talk', 'B2')` returns true and `shouldTranslateUIKey('actions.talk', 'A1')` returns false
- [ ] Typecheck passes

**Notes:**
- `useGameTranslation()` hook exists in `client/src/i18n/useGameTranslation.ts` but has zero usage in any component.
- `translateInteractionVerb()` and `buildBilingualBuildingPrompt()` in `shared/language/in-world-text.ts` are complete but never called from 3D game code.
- Start with action prompts (highest-priority namespace). Building labels are secondary but should be included if straightforward.

---

### US-004: Update player-NPC relationship after chat
**Description:** As a player, I need my relationship with NPCs to improve when I have positive conversations so that repeated interactions feel meaningful and NPCs react differently over time.

**Acceptance Criteria:**
- [ ] After a successful player-NPC chat response in the chat endpoint (`server/routes.ts:7137-7460`), calculate a relationship delta using the same formula as NPC-NPC conversations: `friendshipChange = 0.02 + (avgAgreeableness * 0.03) * (exchangeCount / 5)`
- [ ] Call `updateRelationship(npcId, playerId, interactionQuality, year)` with the computed delta
- [ ] Make the update non-fatal — if it fails, log a warning but still return the chat response
- [ ] Add test: simulate a 5-exchange conversation with an agreeable NPC, verify relationship delta is positive and `updateRelationship` is called
- [ ] Add test: verify relationship update failure doesn't break the chat response
- [ ] Typecheck passes

**Notes:**
- NPC-NPC conversations already update relationships at `routes.ts:3796-3803`. Player-NPC conversations do not.
- The `npc-conversation-engine.ts` has the formula at lines 621-624.

---

### US-005: Wire NPC language mode and vocabulary frequency into conversation prompts
**Description:** As a player, I need NPCs to speak at my CEFR-appropriate level — using simplified language at A1-A2 and natural language at B2+ — so that conversations are comprehensible and pedagogically appropriate.

**Acceptance Criteria:**
- [ ] In `buildLanguageAwareSystemPrompt()` (`shared/language/utils.ts`), call `assignNPCLanguageMode(npcId, cefrLevel)` from `shared/language/cefr-adaptation.ts` and include the result in the system prompt
- [ ] Append the output of `buildLanguageModeDirective(mode)` to the NPC system prompt (e.g., "Speak in simplified mode: 5-7 word sentences, high-frequency vocabulary only, provide translations in brackets")
- [ ] Append the output of `buildFrequencyDirective(cefrLevel)` from `shared/language/vocabulary-frequency.ts` to constrain vocabulary rank (e.g., "Use only words ranked 1-200 in frequency" for A1)
- [ ] Add test: build a system prompt for an A1 player, verify it contains "simplified" mode directive and frequency constraint "1-200"
- [ ] Add test: build a system prompt for a B2 player, verify it contains "natural" mode directive and no restrictive frequency constraint
- [ ] Typecheck passes

**Notes:**
- `assignNPCLanguageMode()` is in `cefr-adaptation.ts:43-54` — deterministic hashing ensures consistent mode per NPC.
- `buildLanguageModeDirective()` is in `cefr-adaptation.ts:60-96` with bilingual/simplified/natural modes.
- `buildFrequencyDirective()` is in `vocabulary-frequency.ts` with A1=1-200, A2=201-500, B1=501-1500 ranges.
- None of these are currently called from the conversation system prompt builder.

---

### Group B: Prolog-MongoDB Quest State Consistency

---

### US-006: Add quest sync to Prolog auto-sync
**Description:** As a developer, I need quest state changes (creation, status updates, completion) to be reflected in the Prolog knowledge base so that Prolog rules can reason about current quest state.

**Acceptance Criteria:**
- [ ] Add `onQuestChanged(worldId, quest)` method to `prolog-auto-sync.ts` that retracts old quest facts and asserts new ones (`quest/4`, `quest_assigned_to/2`, `quest_objective/3`, `quest_status/2`)
- [ ] Add `onQuestDeleted(worldId, questId)` method that retracts all facts for that quest
- [ ] Call `onQuestChanged()` from the quest creation, update, and completion endpoints in `server/routes.ts`
- [ ] Add quest predicates (`quest_status`, `quest_objective_complete`, `quest_completed`, `quest_failed`) to `SYNC_BACK_PREDICATES` array at `prolog-auto-sync.ts:176-183`
- [ ] Add test: create a quest, verify Prolog KB contains `quest(questId, title, type, status)` fact
- [ ] Add test: complete a quest via endpoint, verify Prolog KB updated to `quest_status(questId, completed)`
- [ ] Add test: verify sync-back detects a `quest_completed` fact added by Prolog rules and writes it to MongoDB
- [ ] Typecheck passes

**Notes:**
- Currently no `onQuestChanged()` or `onQuestDeleted()` exists. The entire quest lifecycle is invisible to Prolog.
- `SYNC_BACK_PREDICATES` only covers `married_to`, `dead`, `occupation`, `wealth`, `friend_of`, `enemy_of`.

---

### US-007: Implement missing `syncAchievementsToProlog()`
**Description:** As a developer, I need the achievements sync method to actually exist so that the world-to-Prolog sync pipeline doesn't silently skip achievements.

**Acceptance Criteria:**
- [ ] Implement `syncAchievementsToProlog(worldId)` in `server/engines/prolog/prolog-sync.ts` — fetch all achievements for the world, convert to `achievement(id, name, type, unlocked)` facts, assert into engine
- [ ] Verify it's called successfully during `syncWorldToProlog()` (line 41 already calls it but the method doesn't exist)
- [ ] Add test: create 3 achievements (2 unlocked, 1 locked), sync to Prolog, query `achievement/4` and verify 3 results with correct unlock status
- [ ] Typecheck passes

**Notes:**
- `prolog-sync.ts:41` calls `await this.syncAchievementsToProlog(worldId)` but the method is undefined. This is a runtime error that would throw on first world sync.

---

### Group C: Assessment & Adaptation Wiring

---

### US-008: Wire periodic assessment triggers at quest milestones
**Description:** As a player, I need periodic language assessments to fire at quest milestones so that my CEFR level is re-evaluated based on demonstrated ability, not just passive metrics.

**Acceptance Criteria:**
- [ ] After quest completion (in the quest completion handler), check if the player's quest count has reached a milestone (5, 10, 15, 20) as defined in `shared/assessment/periodic-encounter.ts:17`
- [ ] Respect the 60-minute cooldown (`PERIODIC_ASSESSMENT_COOLDOWN_MS`) — skip if last assessment was too recent
- [ ] When triggered, emit a `PERIODIC_ASSESSMENT_DUE` event with the assessment definition so the client can present the assessment UI
- [ ] Store the trigger timestamp to enforce cooldown
- [ ] Add test: simulate completing quest #5, verify `PERIODIC_ASSESSMENT_DUE` event fires with correct assessment definition
- [ ] Add test: simulate completing quest #6 within 60 minutes of last assessment, verify event does NOT fire
- [ ] Typecheck passes

**Notes:**
- `periodic-encounter.ts` has the full structure (25-point conversation assessment, 5 dimensions). It's just never triggered.
- The `buildPeriodicAssessmentGrammarContext()` function targets weak patterns — make sure this context is included in the emitted assessment definition.

---

### US-009: Fix silent conversation history compression failure
**Description:** As a developer, I need conversation history compression to handle failures gracefully so that long conversations don't silently lose context.

**Acceptance Criteria:**
- [ ] In `conversation-compression.ts:48`, when Gemini summarization returns null or throws, instead of discarding older messages, fall back to keeping the first message (system prompt context) + a synthetic "[Earlier conversation summarized: {n} messages about {topics}]" marker + the last 10 messages
- [ ] Extract topic hints from the discarded messages (simple keyword extraction from the last 5 of the older messages) for the synthetic marker
- [ ] Log a warning when fallback is used: `[ConversationCompression] Summarization failed, using truncation fallback`
- [ ] Add test: mock Gemini summarization to return null, verify fallback produces a synthetic marker and retains last 10 messages
- [ ] Add test: verify the synthetic marker contains a message count and at least one topic keyword
- [ ] Typecheck passes

**Notes:**
- Current behavior at `conversation-compression.ts:48`: if `summarizeMessages()` returns null, older messages are simply dropped. This silently destroys conversation context.

---

### US-010: Wire EVAL dimension score aggregation
**Description:** As a developer, I need NPC EVAL dimension scores (vocabulary, grammar, fluency, comprehension, task completion) to be aggregated over time so that the system can track long-term learning trends and inform adaptation.

**Acceptance Criteria:**
- [ ] After each conversation that produces EVAL scores (parsed from `**EVAL**` blocks), call `computeAverageDimensionScores()` from `shared/language/progress.ts` and store the running averages in `LanguageProgress.dimensionScores`
- [ ] Call `computeDimensionTrend()` to compute per-dimension trends (improving/stable/declining) and store alongside averages
- [ ] Include aggregated dimension scores in the context passed to `buildPeriodicAssessmentGrammarContext()` so periodic assessments can target weak dimensions
- [ ] Add test: simulate 5 conversations with EVAL scores, verify averages computed correctly across all 5 dimensions
- [ ] Add test: simulate improving vocabulary scores over 5 conversations, verify trend is "improving"
- [ ] Typecheck passes

**Notes:**
- `DimensionScoreEntry[]` is defined in `progress.ts:96-101`. `computeAverageDimensionScores()` and `computeDimensionTrend()` exist but are never called.

---

### Group D: Debug Console

---

### US-011: Extend PrologDebugger into unified debug console with tab system
**Description:** As a developer, I need the existing Prolog debug panel extended into a multi-tab debug console so that I can monitor Prolog state, LLM interactions, and language performance from one place.

**Acceptance Criteria:**
- [ ] Add a tab bar to the existing `PrologDebugger.ts` panel (`shared/game-engine/rendering/PrologDebugger.ts:194-314`) with three tabs: "Prolog", "LLM", "Language"
- [ ] The existing Prolog KB inspector content (query input, output area, quick-action buttons) becomes the "Prolog" tab content
- [ ] "LLM" and "Language" tabs show empty placeholder content with "No events yet" message initially (populated in subsequent stories)
- [ ] Maintain the existing green-on-black terminal aesthetic across all tabs
- [ ] Tab switching preserves scroll position and content in inactive tabs
- [ ] Panel title changes from "Prolog Debugger" to "Debug Console" with the active tab name
- [ ] The debug toggle in `BabylonGame.ts:handleToggleDebug()` continues to show/hide the unified console
- [ ] Add test: verify tab switching works and preserves content state across tabs
- [ ] Typecheck passes

**Notes:**
- Keep the existing `PrologDebugger` API surface stable — callers should not need to change.
- Panel is positioned bottom-right, 320px wide. Consider whether tabs need the panel wider; if so, expand to 420px.

---

### US-012: Add collapsible log entry component for debug console
**Description:** As a developer, I need a reusable collapsible log entry component so that debug events show a one-liner summary by default with expandable detail.

**Acceptance Criteria:**
- [ ] Create a `DebugLogEntry` rendering utility (in `PrologDebugger.ts` or a new `DebugConsoleEntries.ts` alongside it) that renders:
  - **Collapsed (default):** Single line with timestamp, category icon/tag, and summary text (e.g., `12:04:03 [Prolog] asserted: quest_status(q1, completed)`)
  - **Expanded (on click):** Multi-line detail area below the summary with monospace pre-formatted content
- [ ] Entries are color-coded by category: Prolog (#0f0 green), LLM (#0af cyan), Language (#fa0 amber), Error (#f44 red)
- [ ] Each tab maintains a scrollable list of up to 200 entries (oldest evicted when exceeded)
- [ ] Auto-scroll to newest entry unless user has scrolled up (scroll-lock behavior)
- [ ] Add test: create 5 entries, verify they render with correct colors and expand/collapse toggles work
- [ ] Typecheck passes

**Notes:**
- Babylon.js GUI `TextBlock` elements don't natively support click-to-expand. Consider using a `StackPanel` of `Rectangle` containers where each entry is a container that toggles height between 1-line and multi-line on pointer event.
- Alternative: use an HTML overlay `<div>` (like the debug hover tooltips at `DebugLabelUtils.ts:153-216`) for richer interaction. Choose whichever approach is more maintainable.

---

### US-013: Log Prolog state changes to debug console
**Description:** As a developer, I need Prolog fact assertions, retractions, and query results to appear as collapsible log entries in the Prolog tab so that I can trace game state changes in real time.

**Acceptance Criteria:**
- [ ] Hook into `GamePrologEngine`'s `assertFact()`, `retractFact()`, and `query()` methods to emit debug events
- [ ] Each event creates a `DebugLogEntry` in the Prolog tab:
  - **Assert:** collapsed = `[+] quest_status(q1, completed)`, expanded = full fact text + source (e.g., "from quest completion handler")
  - **Retract:** collapsed = `[-] quest_status(q1, active)`, expanded = full fact text + reason
  - **Query:** collapsed = `[?] objective_complete(player, q1, 0) -> true`, expanded = full query + all bindings + execution time
- [ ] Log the **unabridged** version of every event to `console.debug('[PrologDebug]', ...)` for dev console inspection
- [ ] Events only generated when debug mode is active (check `isDebugLabelsEnabled()`)
- [ ] Add test: assert a fact with debug enabled, verify a log entry appears in the Prolog tab with correct format
- [ ] Add test: run a query, verify the entry shows the result and execution time
- [ ] Typecheck passes

**Notes:**
- Existing `GamePrologEngine` methods at lines 970-973 delegate to tau-prolog without any logging. Wrap them.
- Keep the performance overhead near-zero when debug is off — gate all logging behind the debug check.

---

### US-014: Log LLM prompt/response summaries to debug console
**Description:** As a developer, I need condensed LLM prompt and response summaries in the LLM tab so that I can diagnose conversation prompting issues, verify CEFR-appropriate language mode directives, and catch response parsing failures.

**Acceptance Criteria:**
- [ ] Hook into the client-side chat flow (where the SSE response is received) to capture:
  - System prompt summary: first 80 chars + `...` + last 40 chars, total token estimate (chars/4), and key directives detected (language mode, CEFR level, frequency constraint)
  - User message: full text (truncated to 120 chars in collapsed view)
  - Response summary: first 80 chars + `...`, total token estimate, latency (time to first token, total time)
  - Parsed markers: list any `GRAMMAR_FEEDBACK`, `QUEST_ASSIGN`, `VOCAB_HINTS` blocks detected (or "none")
- [ ] Each chat exchange creates one collapsible `DebugLogEntry` in the LLM tab:
  - **Collapsed:** `[Chat] NPC_NAME: "response preview..." (est. 312 tok, 1.2s)`
  - **Expanded:** System prompt summary, full user message, full response, parsed markers, latency breakdown
- [ ] Log the **unabridged** system prompt, user message, and full response to `console.debug('[LLMDebug]', ...)` for dev console
- [ ] Also log Prolog-first routing decisions: `[Route] "hello" -> Prolog (confidence: 0.8)` or `[Route] "tell me about..." -> LLM (Prolog confidence: 0.3)`
- [ ] Events only generated when debug mode is active
- [ ] Add test: simulate a chat exchange, verify LLM tab entry contains NPC name, token estimate, and latency
- [ ] Add test: simulate a response with `GRAMMAR_FEEDBACK` marker, verify it appears in the expanded detail
- [ ] Typecheck passes

**Notes:**
- The client already receives SSE events with sentence chunks. Accumulate the full response before creating the log entry.
- Token estimation: `Math.ceil(text.length / 4)` is a rough but sufficient approximation for debugging.
- For Prolog-first routing: the client may not have visibility into this. If routing happens server-side only, include a `debugInfo` field in the SSE response when debug mode is signaled (or defer to the server streaming placeholder in US-016).

---

### US-015: Log language performance results to debug console
**Description:** As a developer, I need language performance review results (EVAL scores, grammar feedback, vocabulary encounters, CEFR checks) in the Language tab so that I can verify the assessment-adaptation pipeline is working.

**Acceptance Criteria:**
- [ ] After each conversation, if EVAL dimension scores were parsed, create a `DebugLogEntry` in the Language tab:
  - **Collapsed:** `[EVAL] vocab:4 gram:3 flu:4 comp:5 task:4 (avg: 4.0)`
  - **Expanded:** Per-dimension scores, trend vs last 5 conversations, current CEFR level, advancement progress %
- [ ] After grammar feedback is extracted, log it:
  - **Collapsed:** `[Grammar] 2 corrections: verb conjugation, article agreement`
  - **Expanded:** Full correction text, pattern names, current error rates for those patterns
- [ ] After vocabulary encounters are recorded, log a batch summary:
  - **Collapsed:** `[Vocab] +3 words (2 passive_hover, 1 active_use), 47 total mastered`
  - **Expanded:** Word list with mastery levels, encounter types, weighted counts
- [ ] After CEFR advancement check, log the result:
  - **Collapsed:** `[CEFR] A2 -> B1 ADVANCED!` or `[CEFR] A2: 67% ready (words: 80%, convos: 60%, texts: 40%)`
  - **Expanded:** Per-metric progress breakdown with thresholds
- [ ] Log all unabridged details to `console.debug('[LangDebug]', ...)`
- [ ] Events only generated when debug mode is active
- [ ] Add test: simulate a conversation with EVAL scores, verify Language tab entry shows correct dimension averages
- [ ] Add test: simulate CEFR advancement, verify the entry shows "ADVANCED" with old and new levels
- [ ] Typecheck passes

---

### US-016: Add server-side debug streaming placeholder
**Description:** As a developer, I need a placeholder for future server-side debug event streaming so that the architecture supports it without implementing the full WebSocket channel now.

**Acceptance Criteria:**
- [ ] Create a `DebugEventBus` interface in `shared/game-engine/types/` (or similar shared location) with:
  - `emit(event: DebugEvent)` — fires a debug event
  - `subscribe(callback: (event: DebugEvent) => void)` — registers a listener
  - `DebugEvent` type: `{ timestamp: number, category: 'prolog' | 'llm' | 'language', level: 'info' | 'warn' | 'error', summary: string, detail: string, source: 'client' | 'server' }`
- [ ] Implement a `ClientDebugEventBus` that stores events in memory and notifies the debug console tabs
- [ ] Refactor US-013, US-014, US-015 log entries to go through `ClientDebugEventBus.emit()` instead of directly creating UI entries
- [ ] Add a `// TODO: ServerDebugEventBus will connect via WebSocket to stream server-side events` comment with the planned approach
- [ ] Add test: emit 3 events through `ClientDebugEventBus`, verify all 3 are received by a subscriber
- [ ] Typecheck passes

**Notes:**
- This is scaffolding for v2. The server WebSocket channel is out of scope. The goal is to ensure the debug console architecture can accept events from both client and server sources without refactoring.

---

## Functional Requirements

- FR-1: `checkCEFRAdvancement()` must be called after every conversation completion and quest completion
- FR-2: Hover-translate lookups must create `passive_hover` vocabulary encounters with 0.5x weight
- FR-3: At least 5 action prompts and building labels must use the i18n translation pipeline gated by CEFR level
- FR-4: Player-NPC chat must update relationship strength using the same formula as NPC-NPC conversations
- FR-5: NPC system prompts must include CEFR-appropriate language mode directives and vocabulary frequency constraints
- FR-6: Quest creation, update, and completion must sync state to the Prolog knowledge base
- FR-7: Quest predicates must be included in bidirectional sync-back from Prolog to MongoDB
- FR-8: `syncAchievementsToProlog()` must be implemented so world-to-Prolog sync doesn't error
- FR-9: Periodic assessments must trigger at quest milestones 5/10/15/20 with 60-minute cooldown
- FR-10: Conversation history compression must fall back to truncation with a synthetic context marker on failure, never silently discard messages
- FR-11: EVAL dimension scores must be aggregated into running averages and trends after each conversation
- FR-12: Debug console must show collapsible log entries for Prolog state changes, LLM interactions, and language performance when debug mode is active
- FR-13: All debug events must also log unabridged content to `console.debug()` for dev console inspection
- FR-14: Debug events must have zero performance overhead when debug mode is off

## Non-Goals

- No server-side WebSocket debug streaming in this iteration (placeholder only)
- No new assessment content for C1/C2 (noted as Tier 3)
- No error-correction quest generation from grammar weaknesses (Tier 3)
- No mastery threshold unification across files (Tier 3)
- No sentence boundary detection fixes for non-English (Tier 3)
- No transactional wrapper for quest completion pipeline (Tier 3)
- No UI for immersion settings panel (Tier 3)
- No Ensemble volition integration into dialogue (out of scope)

## Technical Considerations

- **Existing debug infrastructure:** `PrologDebugger.ts` (green-on-black terminal, bottom-right), `QuestDebugOverlay.ts` (Ctrl+Shift+D), `DebugLabelUtils.ts` (mesh labels + hover tooltips). Debug toggle is in `GameMenuSystem.ts:3685` and `BabylonGame.ts:15179-15216`.
- **Performance gating:** All debug logging must check `isDebugLabelsEnabled()` before doing any work. No string formatting, no object allocation when debug is off.
- **Prolog rebuild cost:** `tau-engine.ts:437-449` does a full KB rebuild on every `assertFact()`. The quest sync story (US-006) should batch assertions where possible to minimize rebuilds.
- **Panel rendering:** The existing PrologDebugger uses Babylon.js GUI (`Rectangle`, `TextBlock`, `InputText`, `ScrollViewer`). The tab system should use the same primitives. If click-to-expand is too complex in Babylon GUI, an HTML overlay (like the hover tooltips) is acceptable.
- **Event bus architecture:** The `DebugEventBus` (US-016) should be a simple pub-sub. Keep it synchronous and in-memory. No persistence, no serialization overhead.

## Success Metrics

- CEFR level advances automatically during gameplay without requiring manual re-assessment
- NPC dialogue demonstrably differs between A1 and B2 players (verifiable via debug console LLM tab)
- Quest state changes appear in both MongoDB and Prolog KB within the same request cycle
- Debug console shows live events during gameplay with <1ms overhead when collapsed
- All 16 stories include passing tests; no regressions in existing test suite

## Open Questions

- Should the debug console panel be resizable/draggable, or fixed position and size?
- Should LLM debug entries include the full system prompt in expanded view, or cap at a character limit (e.g., 2000 chars)?
- For Prolog-first routing debug (US-014), if routing is server-only, should we add a `debugInfo` field to the SSE response or defer entirely to the server streaming story?
- Should the debug console support text search/filter across entries?
