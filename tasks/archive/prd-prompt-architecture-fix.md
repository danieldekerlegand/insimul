# PRD: Prompt Architecture Unification

## Introduction

A comprehensive LLM audit (see `docs/LLM_CALLS_DURING_GAMEPLAY.md`) revealed that the NPC chat system has two independent system prompt builders — a client-side builder (`buildLanguageAwareSystemPrompt()` in `shared/language/utils.ts`) and a server-side builder (`buildSystemPrompt()` in `server/services/conversation/context-manager.ts`). The SSE conversation path (`/api/conversation/stream`) **ignores the client-built prompt entirely** and always builds its own, which is missing critical language learning directives: CEFR-aware language modes, vocabulary frequency constraints, scaffolding directives, and critical language enforcement rules.

The result: NPCs respond in English-inflected French with no pedagogical adaptation, regardless of the player's CEFR level. The language immersion system is architecturally complete on the client side but dead on arrival because the server discards it.

This PRD unifies the prompt pipeline so that a single, authoritative prompt reaches the LLM with both the server's rich world context (settlement, weather, relationships, emotional state) and the client's language learning directives (CEFR modes, frequency constraints, scaffolding).

## Goals

- Ensure the LLM receives language learning directives on every conversation path (SSE, WS, direct Gemini)
- Unify the two prompt builders so there is one source of truth for the system prompt
- Preserve the server's rich character/world context that the client lacks
- Preserve the client's language learning directives that the server lacks
- Make NPC speech demonstrably adapt to player CEFR level (A1 gets simplified French; B2+ gets natural French)
- Fix the Vite dev proxy so WebSocket conversations work without SSE fallback

## User Stories

### US-001: Accept and use client-provided systemPrompt on SSE path
**Description:** As a developer, I need the `/api/conversation/stream` endpoint to use the client-provided system prompt when present so that language learning directives actually reach the LLM.

**Acceptance Criteria:**
- [ ] In `http-bridge.ts`, read `systemPrompt` from `req.body` and pass it through to `streamTextResponse()`
- [ ] In `streamTextResponse()`, if a `systemPrompt` string is provided AND the session needs a context rebuild, use it as the system prompt instead of calling `buildContext()`
- [ ] If `systemPrompt` is NOT provided (e.g., non-game clients), fall back to `buildContext()` as before
- [ ] Preserve the existing `characterName`, `worldContext`, and `characterGender` fields in `conversationContext` by extracting them from the `buildContext()` result or the session
- [ ] Add a log: `[ConversationBridge] Using client-provided system prompt (${systemPrompt.length} chars)` vs `[ConversationBridge] Using server-built system prompt`
- [ ] Add test: POST to `/api/conversation/stream` with a `systemPrompt` field, verify the LLM receives that prompt (not the server-built one)
- [ ] Add test: POST without `systemPrompt`, verify fallback to `buildContext()`
- [ ] Typecheck passes

**Notes:**
- The client already sends `systemPrompt` in the SSE request body (`server-chat-provider.ts:298`). The server just doesn't read it.
- `streamTextResponse()` signature needs a new optional `clientSystemPrompt?: string` parameter.
- The session caching logic (`needsRebuild` at line 109) should still work — if the client prompt is present, skip `buildContext()` entirely for this session turn.

### US-002: Accept and use client-provided systemPrompt on WS path
**Description:** As a developer, I need the WebSocket bridge to use a client-provided system prompt when present so that language learning directives reach the LLM via the WS transport.

**Acceptance Criteria:**
- [ ] In `ws-bridge.ts` `handleTextInput()`, read `systemPrompt` from the `msg` object (the client sends it as `textInput.systemPrompt` in the WS JSON message)
- [ ] If `systemPrompt` is provided and the session needs context rebuild, use it instead of calling `buildContext()`
- [ ] If not provided, fall back to `buildContext()` as before
- [ ] Add a log: `[WS-Bridge] Using client-provided system prompt (${systemPrompt.length} chars)` vs `[WS-Bridge] Using server-built system prompt`
- [ ] Update `server-chat-provider.ts` `sendTextWS()` to include `systemPrompt` in the `textInput` JSON message (it already sends characterId, worldId, text, languageCode — just add systemPrompt)
- [ ] Add test: send a WS `textInput` message with `systemPrompt`, verify the LLM receives it
- [ ] Typecheck passes

**Notes:**
- The WS message format at `server-chat-provider.ts:252-257` sends `{ textInput: { text, sessionId, characterId, worldId, languageCode } }`. Add `systemPrompt` to this object.
- `handleTextInput()` at `ws-bridge.ts:79` destructures msg — add `systemPrompt` to the destructure.

### US-003: Enrich server-side prompt with CEFR language mode directives
**Description:** As a developer, I need the server-side prompt builder to include CEFR-aware language mode directives as a fallback, so that even when the client prompt is unavailable the NPC still adapts to the player's level.

**Acceptance Criteria:**
- [ ] In `context-manager.ts` `buildSystemPrompt()`, when `languageLearning` is not null, call `assignNPCLanguageMode(characterId, cefrLevel)` from `shared/language/cefr-adaptation.ts` and include the result
- [ ] Append `buildLanguageModeDirective(mode)` output to the LANGUAGE LEARNING MODE section (e.g., "Speak in simplified mode: 5-7 word sentences, high-frequency vocabulary only")
- [ ] Append `buildFrequencyDirective(cefrLevel)` output to constrain vocabulary rank (e.g., "Use only words ranked 1-200 in frequency" for A1)
- [ ] Add the "CRITICAL LANGUAGE RULE" enforcement at the very end of the prompt: `"CRITICAL LANGUAGE RULE: Your ENTIRE response must be in ${targetLanguage}. Do NOT use English. Every word must be in ${targetLanguage}. This is non-negotiable."`
- [ ] Determine CEFR level from player progress data: map the `profLabel` (beginner/intermediate/advanced) to CEFR (A1-A2/B1-B2/C1-C2) or pass through if available from `gameState`
- [ ] Add test: build server prompt with `languageLearning` active and CEFR A1, verify prompt contains "simplified" directive and frequency constraint "1-200"
- [ ] Add test: build server prompt with `languageLearning` active and CEFR B2, verify prompt contains "natural" directive
- [ ] Typecheck passes

**Notes:**
- This makes the server-side prompt a robust fallback even without the client prompt. It also means non-game clients (Godot, Unity) that don't build their own prompt still get language adaptation.
- `assignNPCLanguageMode()` is in `cefr-adaptation.ts:43-54`. `buildLanguageModeDirective()` is in `cefr-adaptation.ts:60-96`. `buildFrequencyDirective()` is in `vocabulary-frequency.ts`.
- Need to determine or derive CEFR level. The server has `profLabel` (beginner/intermediate/advanced). Map: beginner → A1, intermediate → B1, advanced → B2. Or accept explicit CEFR from `gameState` if present.

### US-004: Fix language learning detection when world.targetLanguage is set but languages array lacks isLearningTarget
**Description:** As a developer, I need language learning detection to work reliably so that the LANGUAGE LEARNING MODE section is never skipped for language learning worlds.

**Acceptance Criteria:**
- [ ] In `context-manager.ts` `buildContext()` (around line 384), add a fallback: if `languages.find(l => l.isLearningTarget)` returns null, check `world.targetLanguage` — if it's set and not 'English', construct the `languageLearning` object using `world.targetLanguage` as the target
- [ ] Also check `world.gameType === 'language-learning'` as an additional signal
- [ ] Log a warning when the fallback is used: `[Context] No isLearningTarget in languages, falling back to world.targetLanguage: ${world.targetLanguage}`
- [ ] Add test: create context with `world.targetLanguage = 'French'` but no language with `isLearningTarget: true`, verify `languageLearning` is still populated
- [ ] Add test: create context with `world.targetLanguage = null`, verify `languageLearning` is null
- [ ] Typecheck passes

**Notes:**
- The current code at line 384 does `languages.find(l => l.isLearningTarget)` which fails if the world has `targetLanguage: 'French'` but the languages collection doesn't have `isLearningTarget: true` on the French entry. This is the most likely cause of the ~481-token prompt with no language directives.

### US-005: Send gameState context from client to server on SSE and WS paths
**Description:** As a developer, I need the client to send critical game state (CEFR level, player vocabulary, grammar patterns, active quests, Prolog facts) to the server so that the server-side prompt builder can use them even when building its own prompt.

**Acceptance Criteria:**
- [ ] In `server-chat-provider.ts` `sendTextSSE()`, add optional fields to the request body: `cefrLevel`, `playerVocabulary` (array of word objects with mastery), `playerGrammarPatterns` (array of pattern objects with accuracy), `activeQuests` (if not already sent)
- [ ] In `server-chat-provider.ts` `sendTextWS()`, add the same fields to the `textInput` JSON message
- [ ] In `BabylonChatPanel.ts`, when calling `insimulClient.sendText()`, pass the CEFR level and game state from `languageTracker` — this may require extending `SendTextOptions` in the InsimulClient
- [ ] In `http-bridge.ts`, read `cefrLevel`, `playerVocabulary`, `playerGrammarPatterns` from `req.body` and pass them to `buildContext()` via the `gameState` parameter
- [ ] In `ws-bridge.ts`, read the same fields from the `textInput` message and pass them to `buildContext()`
- [ ] Add test: POST to `/api/conversation/stream` with `cefrLevel: 'A1'` and `playerVocabulary`, verify the server prompt includes vocabulary review words
- [ ] Typecheck passes

**Notes:**
- Currently `buildContext()` accepts a `gameState` parameter (line 114: `buildContext(characterId, playerId, worldId, sessionId, undefined, { prologFacts })`) but only `prologFacts` is passed. It also supports `playerVocabulary`, `playerGrammarPatterns`, `playerProgress`, `activeQuests`.
- This is the belt-and-suspenders approach: even if US-001 makes the server use the client prompt, this ensures the server has the data to build a rich fallback.

### US-006: Add Vite WebSocket proxy for /ws/conversation
**Description:** As a developer, I need the Vite dev server to proxy WebSocket connections to the Express backend so that the WS transport works in development without falling back to SSE.

**Acceptance Criteria:**
- [ ] In `vite.config.ts`, add a proxy rule for `/ws/conversation` that forwards WebSocket connections to the Express backend (typically `http://localhost:8000`)
- [ ] The proxy must support WebSocket upgrade (`ws: true` in Vite proxy config)
- [ ] After the change, verify that `ws://localhost:8080/ws/conversation` successfully connects and the dev console no longer shows `WebSocket connection failed`
- [ ] Verify the InsimulClient logs `[ChatPanel] InsimulClient ready (chat=server, tts=server)` and the SSE fallback warning does NOT appear
- [ ] Add comment in vite.config.ts explaining why the WS proxy is needed
- [ ] Typecheck passes

**Notes:**
- Currently the client connects to `ws://localhost:8080/ws/conversation` (Vite dev port) but the WS bridge is on the Express server at port 8000. Vite doesn't proxy WebSocket by default.
- Vite proxy config example: `'/ws': { target: 'http://localhost:8000', ws: true }`
- The Express server registers the WS bridge at `server/index.ts:604-605`.

### US-007: Consolidate NPC-NPC prompt builder with language learning support
**Description:** As a developer, I need NPC-NPC conversations to include language learning directives so that overheard/eavesdropped NPC conversations are also in the target language.

**Acceptance Criteria:**
- [ ] In `npc-conversation-engine.ts` `buildNpcNpcSystemPrompt()`, add a `languageDirective` section: if the world has a target language, append `"LANGUAGE: This conversation must be entirely in ${targetLanguage}. Both NPCs are native speakers. Write all dialogue in ${targetLanguage} only — no English."` to the prompt
- [ ] Pass the world's target language through to `buildNpcNpcSystemPrompt()` — it already receives `worldLangs` (language names), check if target language can be identified from this
- [ ] Verify the generated NPC-NPC exchanges are in the target language when the world has one
- [ ] Add test: build NPC-NPC prompt with `worldLangs: ['French', 'English']` and world target language 'French', verify prompt contains French language directive
- [ ] Add test: build NPC-NPC prompt with no target language, verify no language directive added
- [ ] Typecheck passes

**Notes:**
- Currently NPC-NPC conversations say "They speak French and English. Use this language naturally in dialogue." — this is too vague for the LLM. It needs a stronger directive matching the player-NPC treatment.
- The `initiateConversation()` function at line 567 already extracts `worldLangs` from the languages collection. Need to also check which is the learning target.

### US-008: Add integration test verifying full prompt pipeline
**Description:** As a developer, I need an integration test that verifies the complete prompt pipeline — from client `buildLanguageAwareSystemPrompt()` through to the system prompt that reaches the LLM — to prevent future regressions.

**Acceptance Criteria:**
- [ ] Create a test that simulates a full player-NPC chat exchange via `/api/conversation/stream` with a `systemPrompt` provided, and verifies:
  - The LLM receives the client-provided system prompt (not the server's)
  - The prompt contains "LANGUAGE LEARNING MODE" or "CRITICAL LANGUAGE RULE"
  - The prompt contains a CEFR-appropriate language mode directive
- [ ] Create a test that simulates a chat exchange WITHOUT a client `systemPrompt`, and verifies:
  - The server builds its own prompt with LANGUAGE LEARNING MODE section (when world has target language)
  - The prompt contains CEFR language mode and frequency directives
- [ ] Create a test for NPC-NPC conversation verifying the prompt contains target language directive when applicable
- [ ] All tests pass
- [ ] Typecheck passes

## Functional Requirements

- FR-1: The `/api/conversation/stream` endpoint must accept and use a `systemPrompt` field from the request body when provided
- FR-2: The `/ws/conversation` bridge must accept and use a `systemPrompt` field from the `textInput` message when provided
- FR-3: When no client prompt is provided, the server must build a prompt that includes CEFR language mode directives, vocabulary frequency constraints, and a critical language rule
- FR-4: Language learning detection must work via `isLearningTarget` on language entries OR `world.targetLanguage` OR `world.gameType === 'language-learning'`
- FR-5: NPC-NPC conversations must include a target language directive when the world has a learning target language
- FR-6: The Vite dev proxy must forward WebSocket connections for `/ws/conversation` to the Express backend
- FR-7: The client must send CEFR level and game state to the server so the server fallback prompt is fully informed

## Non-Goals

- No changes to the client-side `buildLanguageAwareSystemPrompt()` function itself (it's already complete)
- No changes to the NPC personality/relationship sections of either prompt builder
- No prompt builder consolidation into a single function (the two builders serve different contexts — client has truths, server has DB. Unification would require a major refactor beyond scope)
- No changes to post-conversation analysis prompts (metadata extraction, goal evaluation)
- No changes to quest generation or assessment prompts

## Technical Considerations

- **Session caching:** The `needsRebuild` check in `streamTextResponse()` determines when to regenerate the prompt. When using the client prompt, we should still rebuild on character change but skip `buildContext()`.
- **Token budget:** The server prompt targets <4000 tokens. Adding language directives may push this higher. Monitor with the debug console logging already in place.
- **Backwards compatibility:** Non-game clients (Godot plugin, Unity plugin) that don't send `systemPrompt` must continue to work via the server fallback path. All changes must be additive.
- **WS proxy:** Vite's proxy config uses `server.proxy` in `vite.config.ts`. The WS upgrade is handled via `ws: true`. The Express server must be running on port 8000 for the proxy to work.

## Success Metrics

- NPC dialogue demonstrably differs between A1 and B2 players (verifiable via debug console `[LLM:PlayerNPC:SSE]` logs)
- The debug console LLM tab shows "Directives: language mode, frequency constraint, critical rule" instead of "Directives: none detected"
- WebSocket conversations work in dev without SSE fallback
- Language learning worlds always produce the LANGUAGE LEARNING MODE section in the server prompt (zero null detections)

## Open Questions

- Should the client prompt completely replace the server prompt, or should the server merge its unique sections (settlement, weather, emotional state) into the client prompt?
- Should we add a prompt versioning scheme so the server can detect stale client prompts?
- Should the `InsimulClient.sendText()` options be extended to accept game state, or should a separate `setGameState()` method be added?
