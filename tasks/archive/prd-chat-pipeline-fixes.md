# PRD: Chat Pipeline Fixes — Unimplemented Performance Features

## Introduction

A cross-reference audit of the completed Chat Performance pipeline (17 stories, all "passes: true") and Game State Truth System pipeline (21 stories) against the actual codebase revealed that several features were either built on the wrong endpoint path, never actually implemented, or are English-only despite the game being a language-learning system.

The core issue: the Chat Performance work appears to have targeted `server/routes.ts` endpoints (`/api/gemini/chat`) that the game **does not use for in-game conversation**. The game's InsimulClient uses the SSE path (`/api/conversation/stream` via `http-bridge.ts`) and WS path (`/ws/conversation` via `ws-bridge.ts`). Features wired into `routes.ts` — context caching, Prolog-first routing, conversation compression — are unreachable from the game.

This PRD wires these features into the correct paths, implements the features that were never built, and ensures fallback templates support the target language.

**Prerequisite:** This PRD should run AFTER `ralph/prompt-architecture-fix` is merged, since several stories depend on the unified prompt pipeline.

## Goals

- Wire ConversationContextCache into the SSE and WS conversation paths
- Wire Prolog-first routing into the SSE and WS paths for greeting/farewell short-circuiting
- Add target-language support to NPC-NPC fallback templates and Prolog greeting templates
- Send Prolog MVT context from client to server on every conversation turn
- Add tiered model routing so simple messages use FLASH and complex messages use PRO

## User Stories

### US-001: Wire ConversationContextCache into SSE and WS conversation paths
**Description:** As a developer, I need the ConversationContextCache to be used in the SSE and WS conversation paths so that server-side conversation state persists across turns without the client re-sending full history.

**Acceptance Criteria:**
- [ ] In `http-bridge.ts`, import `ConversationContextCache` from `conversation-context-cache.ts` and create a module-level singleton instance
- [ ] After building context in `streamTextResponse()`, cache the system prompt + conversation history using `ConversationContextCache.set()` with key `chat:{worldId}:{characterId}:{sessionId}`
- [ ] On subsequent turns, check the cache before calling `buildContext()` — if cache hit and system prompt unchanged, reuse the cached context
- [ ] Do the same in `ws-bridge.ts` `handleTextInput()` — import, cache, and check before `buildContext()`
- [ ] Append new messages to the cache via `ConversationContextCache.append()` after each exchange
- [ ] Log cache hit/miss: `[ConversationBridge] Context cache HIT for {key}` vs `MISS`
- [ ] Add test: send two consecutive messages, verify `buildContext()` is only called once (cache hit on second)
- [ ] Typecheck passes

**Notes:**
- `ConversationContextCache` already exists at `server/services/conversation/conversation-context-cache.ts` with full LRU, TTL (30 min), and append APIs. It's wired into `routes.ts:7245` for the `/api/gemini/chat` path but not into `http-bridge.ts` or `ws-bridge.ts`.
- The existing session history in both bridges (`addToHistory()`) is a simpler mechanism. The cache adds LRU eviction, TTL, and formatted context preservation.

### US-002: Wire Prolog-first routing into SSE and WS paths
**Description:** As a developer, I need the Prolog-first router to intercept greetings and farewells on the SSE and WS paths so that common utterances get instant responses without LLM calls.

**Acceptance Criteria:**
- [ ] In `http-bridge.ts` `streamTextResponse()`, before the LLM streaming call, call `prologLLMRouter.tryPrologFirst(worldId, 'greeting', { speakerId: characterId })` to classify the user message
- [ ] If the message looks like a greeting/farewell (simple heuristic: check for "hello", "hi", "bonjour", "salut", "goodbye", "au revoir", etc.), route through Prolog
- [ ] If Prolog returns `answered: true` with confidence >= 0.6, send the Prolog response as the full reply (via SSE text events) and skip the LLM call entirely
- [ ] Do the same in `ws-bridge.ts` `handleTextInput()` — route greeting/farewell through Prolog before LLM
- [ ] Ensure the Prolog-routed response still triggers TTS synthesis (same voice, same language)
- [ ] Log routing decisions: `[ConversationBridge] Prolog-first: "bonjour" -> answered (confidence: 0.7)` or `-> fell through to LLM`
- [ ] Add test: send "bonjour" via SSE path, verify Prolog template returned without LLM call
- [ ] Add test: send a complex message, verify it falls through to LLM
- [ ] Typecheck passes

**Notes:**
- `PrologLLMRouter` exists at `server/services/prolog-llm-router.ts` and is already wired into `routes.ts:7159-7198` for the `/api/gemini/chat` path. It's NOT imported in `http-bridge.ts` or `ws-bridge.ts`.
- The router handles `greeting`, `farewell`, `trade`, `character_info`, `relationship` query types.
- Important: Prolog greeting templates are currently English-only (US-004 addresses this).

### US-003: Send Prolog MVT context from client to server
**Description:** As a developer, I need the client to send Prolog game state facts to the server on each conversation turn so that NPC system prompts include current game world context from the Prolog knowledge base.

**Acceptance Criteria:**
- [ ] In `BabylonChatPanel.ts`, when calling `sendMessageViaGrpc()`, collect current Prolog facts from `GamePrologEngine` (if available) and pass them through the InsimulClient
- [ ] Extend `SendTextOptions` in the InsimulClient (`packages/typescript/src/client.ts`) to accept an optional `prologFacts` field: `Array<{ predicate: string; args: Array<string | number> }>`
- [ ] In `server-chat-provider.ts` `sendTextSSE()`, include `prologFacts` in the request body when provided
- [ ] In `server-chat-provider.ts` `sendTextWS()`, include `prologFacts` in the `textInput` JSON message when provided
- [ ] Verify the server's `streamTextResponse()` in `http-bridge.ts` already reads `prologFacts` from the request (it does at line 445) and passes it to `buildContext()` (it does at line 115)
- [ ] Add test: send a message with prologFacts containing `[{ predicate: "at_location", args: ["player", "market"] }]`, verify the server system prompt includes MVT context
- [ ] Typecheck passes

**Notes:**
- The server already accepts `prologFacts` in the request body (`http-bridge.ts:445`) and passes them to `buildContext()` which generates MVT context (`context-manager.ts:427-429`). The only gap is the client never sends them.
- The Game State Truth System US-021 was marked complete but the client-to-server wiring was never built.
- Keep the prologFacts payload small — cap at 50 facts to avoid bloating the request.

### US-004: Add target-language support to Prolog greeting templates
**Description:** As a developer, I need Prolog-first greeting and farewell templates to respond in the world's target language so that short-circuited responses match the language immersion experience.

**Acceptance Criteria:**
- [ ] In `prolog-llm-router.ts`, add target-language greeting templates alongside the English ones. At minimum: French, Spanish, German
- [ ] Add a `targetLanguage` parameter to `tryPrologFirst()` — when provided and matching a supported language, use the target-language templates
- [ ] French greetings: "Bonjour, voyageur.", "Bienvenue!", "Salut!", "Bonjour, comment allez-vous?"
- [ ] French farewells: "Au revoir, bon voyage.", "A bientot!", "Bonne route!", "A la prochaine."
- [ ] Pass `targetLanguage` from the SSE/WS bridge callers (derived from world data or languageCode parameter)
- [ ] Add test: call `tryPrologFirst()` with `targetLanguage: 'French'` and `queryType: 'greeting'`, verify response is in French
- [ ] Add test: call without `targetLanguage`, verify response is in English (backwards compatible)
- [ ] Typecheck passes

**Notes:**
- Current templates at `prolog-llm-router.ts:30-50` are all English: "Good day, traveler.", "Well met!", etc.
- The greeting templates should feel natural and match the game's era/setting. Avoid modern slang.

### US-005: Add target-language support to NPC-NPC fallback templates
**Description:** As a developer, I need NPC-NPC fallback conversation templates to support the target language so that when the LLM is unavailable, fallback conversations still match the language immersion.

**Acceptance Criteria:**
- [ ] In `npc-conversation-engine.ts`, add French fallback templates alongside the English `FALLBACK_TEMPLATES` array (same 4 topics: greeting, work, gossip, weather)
- [ ] In `generateFallbackConversation()`, accept a `targetLanguage` parameter — when provided and matching a supported language, use the target-language templates
- [ ] Pass `targetLanguage` from `initiateConversation()` based on the world's language context
- [ ] Add at least 4 French conversation templates (greeting, work, gossip, weather) with 4 exchanges each
- [ ] Add test: generate fallback conversation with `targetLanguage: 'French'`, verify all exchanges are in French
- [ ] Add test: generate without `targetLanguage`, verify English templates used
- [ ] Typecheck passes

**Notes:**
- Current templates at `npc-conversation-engine.ts:92-129` are hardcoded English only.
- These are used when the LLM fails or is unavailable — they're the safety net.

### US-006: Add tiered model routing for conversation
**Description:** As a developer, I need simple messages (greetings, short replies, follow-ups) to route to the FLASH model and complex messages (long questions, narrative responses, quest dialogue) to route to the PRO model, reducing latency and cost for simple exchanges.

**Acceptance Criteria:**
- [ ] Create a `classifyMessageComplexity(text: string, historyLength: number): 'simple' | 'complex'` function in `http-bridge.ts` (or a shared utility)
- [ ] Classification heuristic: 'simple' if message is <15 words AND history has >2 exchanges (established context) AND no question marks or quest-related keywords; 'complex' otherwise
- [ ] In `streamTextResponse()`, select the model tier based on classification: 'simple' uses FLASH, 'complex' uses PRO
- [ ] Pass the model selection to `llmProvider.streamCompletion()` via options (may need to extend the provider interface to accept a model override)
- [ ] Do the same in `ws-bridge.ts` `handleTextInput()`
- [ ] Log the routing decision: `[ConversationBridge] Message complexity: simple -> FLASH` or `complex -> PRO`
- [ ] Add test: classify "bonjour" with 3 history messages as 'simple'
- [ ] Add test: classify "Can you tell me about the history of this village and what happened during the war?" as 'complex'
- [ ] Typecheck passes

**Notes:**
- Currently `GeminiStreamingProvider` at `gemini-provider.ts:20` hardcodes `GEMINI_MODELS.PRO`. The provider needs to accept a model override per call, or the bridge selects the provider instance.
- FLASH model is `gemini-3.1-flash-lite-preview` (fast, cheap). PRO is `gemini-3.1-pro-preview` (capable, slower).
- Start conservative: default to PRO, only route to FLASH when highly confident the message is simple.

### US-007: Add conversation history compression to SSE and WS paths
**Description:** As a developer, I need conversation history compression on the SSE and WS paths so that long conversations don't exceed the context window.

**Acceptance Criteria:**
- [ ] In `http-bridge.ts` `streamTextResponse()`, after adding the user message to history, check if `session.history.length > 20`; if so, call `compressConversationHistory()` from `conversation-compression.ts` on the older messages
- [ ] Replace the compressed messages in the session history with the summary + recent messages
- [ ] Do the same in `ws-bridge.ts` `handleTextInput()`
- [ ] Ensure the compression uses the fallback logic (synthetic marker on failure) added in the system-integration-debug PRD
- [ ] Log compression: `[ConversationBridge] Compressed history: ${oldLength} -> ${newLength} messages`
- [ ] Add test: simulate a session with 25 messages, verify compression triggers and history is reduced
- [ ] Typecheck passes

**Notes:**
- `compressConversationHistory()` exists at `conversation-compression.ts:127-150` and is wired into `routes.ts:7267-7268` but NOT into `http-bridge.ts` or `ws-bridge.ts`.
- The current bridges have a simpler truncation: `if (session.history.length > 20) session.history = session.history.slice(-20)` (ws-bridge line 72, http-bridge similar). This discards old messages without summarization.

### US-008: Add player-NPC relationship updates to SSE and WS paths
**Description:** As a player, I need my relationship with NPCs to improve after positive conversations on the SSE/WS paths so that repeated interactions feel meaningful.

**Acceptance Criteria:**
- [ ] In `http-bridge.ts`, after the LLM streaming completes and the response is stored in history, compute a relationship delta using the same formula as `routes.ts`: `friendshipChange = 0.02 + (avgAgreeableness * 0.03) * (exchangeCount / 5)`
- [ ] Fetch the NPC character's agreeableness from the session's conversationContext or via a lightweight DB lookup
- [ ] Call `updateRelationship(characterId, session.playerId, interactionQuality, currentYear)` with the computed delta
- [ ] Make the update non-fatal — if it fails, log a warning but do not break the SSE response
- [ ] Do the same in `ws-bridge.ts` `handleTextInput()` after the LLM response and TTS complete
- [ ] Log the update: `[ConversationBridge] Relationship updated: {characterId} += {delta}`
- [ ] Add test: simulate a 5-exchange conversation, verify `updateRelationship` is called with a positive delta
- [ ] Add test: verify relationship update failure does not break the SSE stream
- [ ] Typecheck passes

**Notes:**
- `routes.ts` has this at lines 7390-7403 (streaming) and 7447-7460 (non-streaming). `http-bridge.ts` and `ws-bridge.ts` have zero relationship update logic.
- The system-integration-debug PRD US-004 was marked complete but was likely implemented on `routes.ts` rather than on the SSE/WS paths the game uses.

### US-009: Add empty LLM response detection to SSE and WS paths
**Description:** As a developer, I need the SSE and WS paths to detect empty or null LLM responses and return a meaningful error so that the client doesn't silently show nothing.

**Acceptance Criteria:**
- [ ] In `http-bridge.ts`, after the LLM streaming loop completes, check if `fullResponse` is empty or whitespace-only
- [ ] If empty, send an SSE error event: `{ type: 'error', message: 'NPC response was empty. This may be due to safety filters or a temporary issue.' }`
- [ ] Also send a fallback text event with a natural in-character message: `{ type: 'text', text: '*pauses and looks confused* ... Pardon, I lost my train of thought.', isFinal: true }`
- [ ] Do the same in `ws-bridge.ts` `handleTextInput()` — check `fullResponse` after streaming, send error + fallback via WS JSON
- [ ] Log the empty response: `[ConversationBridge] WARNING: Empty LLM response for session {sessionId}`
- [ ] Add test: mock LLM provider to return empty stream, verify error event and fallback text are sent
- [ ] Typecheck passes

**Notes:**
- `routes.ts` checks for empty responses at lines 7425-7429 and returns 500. `http-bridge.ts` and `ws-bridge.ts` have no empty response check — an empty LLM response silently produces no text events.

## Functional Requirements

- FR-1: ConversationContextCache must be used for context lookups on both SSE and WS conversation paths
- FR-2: Prolog-first routing must intercept greetings/farewells on SSE and WS paths before LLM call
- FR-3: Prolog greeting/farewell templates must respond in the world's target language when applicable
- FR-4: NPC-NPC fallback templates must support the target language (at minimum French)
- FR-5: Client must send Prolog game state facts in every conversation request body
- FR-6: Simple messages must route to FLASH model; complex messages to PRO
- FR-7: Conversation history compression must trigger when history exceeds 20 messages on SSE and WS paths
- FR-8: Player-NPC relationship must be updated after every conversation on SSE and WS paths using the same formula as `/api/gemini/chat`
- FR-9: Empty LLM responses must be detected and produce a fallback response instead of silent nothing

## Non-Goals

- No pre-warming of LLM context on player proximity (deferred — requires significant game engine integration with distance tracking and speculative API calls)
- No pre-generation of NPC-NPC conversation pools (deferred — requires background job scheduling and storage)
- No speculative generation of likely opening messages (deferred — requires player behavior prediction)
- No changes to the `/api/gemini/chat` path in `routes.ts` (these features already work there)

## Technical Considerations

- **Prerequisite:** The `ralph/prompt-architecture-fix` PRD must be merged first. US-001 and US-002 here depend on the SSE/WS paths using the correct system prompt.
- **Provider interface:** US-006 (tiered routing) may require extending `IStreamingLLMProvider.streamCompletion()` to accept a model override. Check if the provider supports this or if a second provider instance is needed.
- **Prolog router imports:** The `PrologLLMRouter` at `server/services/prolog-llm-router.ts` imports `prologAutoSync` which requires the Prolog engine to be initialized for the world. Ensure the engine is available when the SSE/WS paths call it — if not, fail gracefully and fall through to LLM.
- **Template language coverage:** Start with French only for US-004 and US-005. Additional languages can be added later with the same pattern.
- **Compression cost:** Conversation compression calls `GEMINI_MODELS.FLASH` for summarization. This adds ~200-500ms latency on the turn that triggers compression. This is acceptable since it only happens every ~20 turns.

## Success Metrics

- Context cache hit rate >80% on second+ messages in a conversation (logged via `[ConversationBridge] Context cache HIT`)
- Prolog-first routing handles >90% of greeting/farewell messages without LLM calls
- NPC-NPC fallback conversations are in the target language when LLM is unavailable
- FLASH model used for >30% of conversation messages, reducing average latency
- Long conversations (20+ turns) maintain context without truncation loss

## Open Questions

- Should the tiered routing classification be purely heuristic, or should we train a lightweight classifier?
- Should the Prolog greeting templates be personality-aware (friendly vs hostile NPCs)?
- For conversation compression, should the summary be stored persistently (MongoDB) or stay in-memory only?
