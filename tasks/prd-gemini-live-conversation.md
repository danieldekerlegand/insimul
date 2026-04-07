# PRD: Gemini Live Conversation Pipeline

## Introduction

The current NPC conversation pipeline uses three serial LLM calls: text generation (Gemini Flash), sentence accumulation, and per-sentence TTS (Gemini TTS). This produces 5-8 seconds of latency before the player hears the first audio, inconsistent voice quality across sentences, and a rigid request-response interaction model that doesn't support natural conversational flow like interruptions or overlapping speech.

The Gemini Live API (`ai.live.connect()`) provides persistent bidirectional WebSocket sessions that accept audio input and stream interleaved audio + text output in a single connection. This eliminates STT, sentence splitting, and TTS as separate steps — reducing time-to-first-audio to ~500ms while maintaining text output for UI display, quest tracking, and language analysis.

This PRD replaces the serial pipeline with a Gemini Live session architecture where the audio pipeline runs at maximum speed and all side-effects (metadata extraction, quest evaluation, vocabulary tracking) happen in parallel without blocking audio delivery.

## Goals

- Reduce time-to-first-audio from ~5-8s to <1s
- Eliminate voice inconsistency across sentences (single continuous voice output)
- Enable natural conversational flow (player can interrupt, NPC responds immediately)
- Maintain text output for UI display, quest tracking, and language learning analysis
- Run all side-effect analysis (vocab, grammar, quest evaluation) in parallel without blocking audio
- Preserve fallback to SSE text+TTS pipeline when Live API is unavailable

## User Stories

### US-001: Create Gemini Live Session Manager
**Description:** As a developer, I need a server-side manager that creates and maintains persistent Gemini Live sessions so that NPC conversations use bidirectional audio streaming.

**Acceptance Criteria:**
- [ ] Create `server/services/conversation/live/live-session-manager.ts` with a `LiveSessionManager` class
- [ ] `createSession(config)` method: calls `ai.live.connect()` with `responseModalities: ['AUDIO', 'TEXT']`, system prompt, voice config, and language code. Returns a `LiveConversationSession` wrapper
- [ ] `getSession(sessionId)` method: retrieves an active session by ID
- [ ] `endSession(sessionId)` method: calls `session.close()` and cleans up
- [ ] Sessions auto-expire after 5 minutes of inactivity (configurable)
- [ ] Maximum 10 concurrent Live sessions per server (configurable, to manage API quotas)
- [ ] System prompt sent via `session.sendClientContent()` at session creation, formatted as the NPC character prompt
- [ ] Voice configuration set via `speechConfig.voiceConfig` using the NPC's assigned voice profile (Kore/Charon/etc.) and `speechConfig.languageCode` from world target language
- [ ] Add test: create a session, verify it connects and receives the `onopen` callback
- [ ] Typecheck passes

**Notes:**
- The Live API model is `gemini-2.5-flash-native-audio-latest` (confirmed available via `ai.models.list()`)
- `LiveConnectConfig` supports `responseModalities`, `speechConfig`, `systemInstruction`, and `realtimeInputConfig`
- Each session is a persistent WebSocket connection — more expensive than batch API calls. Limit concurrent sessions.

### US-002: Implement LiveConversationSession wrapper
**Description:** As a developer, I need a wrapper around the raw Gemini Live session that handles audio/text routing, turn management, and event dispatching so that the WS bridge can use it without knowing Live API internals.

**Acceptance Criteria:**
- [ ] Create `LiveConversationSession` class in the same file or `live-conversation-session.ts`
- [ ] Constructor accepts the raw `Session` from `ai.live.connect()` and a callbacks object
- [ ] `sendAudio(data: Uint8Array, mimeType: string)` method: calls `session.sendRealtimeInput({ audio: { data: base64, mimeType } })`
- [ ] `sendText(text: string)` method: calls `session.sendClientContent({ turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true })`
- [ ] `onmessage` handler parses `LiveServerMessage` and dispatches:
  - Audio parts → `callbacks.onAudioChunk(data, mimeType, durationMs)`
  - Text parts → `callbacks.onTextChunk(text, isFinal)`
  - `turnComplete` → `callbacks.onTurnComplete(fullText)`
  - `interrupted` → `callbacks.onInterrupted()`
  - Input/output transcription → `callbacks.onTranscription(text, type)`
- [ ] Track accumulated text across parts for `onTurnComplete`
- [ ] Handle `generationComplete` to signal full response is done
- [ ] Add test: mock a Live session, send text, verify callbacks fire with correct data
- [ ] Typecheck passes

**Notes:**
- The `onmessage` callback receives `LiveServerMessage` with `serverContent.modelTurn.parts[]` containing interleaved text and audio `Part` objects.
- Audio parts have `inlineData.data` (base64) and `inlineData.mimeType` (typically `audio/L16;codec=pcm;rate=24000`).
- Text parts have `text` field directly on the Part.

### US-003: Wire Live sessions into WebSocket bridge
**Description:** As a developer, I need the WS bridge to use Live sessions for conversations when available, falling back to the existing text+TTS pipeline when not.

**Acceptance Criteria:**
- [ ] In `ws-bridge.ts`, when `handleTextInput()` is called, check if a Live session exists for this conversation (keyed by `sessionId`)
- [ ] If Live session exists: send the player's text via `liveSession.sendText(text)`. Audio and text responses flow back through the session's callbacks → WS JSON/binary events to client
- [ ] If Live session does NOT exist: fall back to the existing `llmProvider.streamCompletion()` + TTS pipeline (current behavior)
- [ ] Add a new WS message type `startLiveSession` that the client sends to request a Live session. Handler creates the session via `LiveSessionManager.createSession()` with the NPC's system prompt, voice, and language
- [ ] Add a new WS message type `audioInput` for streaming mic audio from the client. Handler calls `liveSession.sendAudio(data, mimeType)` to relay audio to the Live session
- [ ] Map Live session callbacks to WS events:
  - `onAudioChunk` → binary WS frame + `audio_meta` JSON
  - `onTextChunk` → `{ type: 'text', text, isFinal }` JSON
  - `onTurnComplete` → `{ type: 'done' }` JSON + store in history
  - `onInterrupted` → `{ type: 'interrupted' }` JSON
  - `onTranscription` → `{ type: 'transcript', text }` JSON
- [ ] On conversation close (`endSession`), tear down the Live session
- [ ] Add test: send `startLiveSession` message, then `textInput`, verify audio+text events come back
- [ ] Typecheck passes

**Notes:**
- The existing `handleTextInput()` flow (lines 79-254 in ws-bridge.ts) should remain as the fallback. The Live session is an alternative path selected when the client requests it.
- Text input via `sendText` should also work with Live sessions (for typed chat, not just voice).
- The `audioInput` message carries raw PCM or webm audio from the client's microphone.

### US-004: Add client-side Live session support to InsimulClient
**Description:** As a developer, I need the InsimulClient to support Live sessions so that the BabylonChatPanel can stream mic audio and receive streaming audio+text responses.

**Acceptance Criteria:**
- [ ] Add a `startLiveSession()` method to `ServerChatProvider` that sends a `startLiveSession` WS message with characterId, worldId, systemPrompt, voiceName, languageCode
- [ ] Add a `sendAudioChunk(data: Uint8Array)` method that sends raw audio via the WS binary frame
- [ ] Update `sendText()` to detect if a Live session is active and use the `textInput` path (which now routes through the Live session on the server)
- [ ] Handle new WS event types from the server: `transcript` (input transcription), `interrupted`
- [ ] Wire `onAudioChunk` callback to the existing `StreamingAudioPlayer` for seamless playback
- [ ] Expose `startLiveSession()` and `sendAudioChunk()` on the `InsimulClient` public API
- [ ] Add test: call `startLiveSession()`, verify WS message sent with correct parameters
- [ ] Typecheck passes

**Notes:**
- The client already has `StreamingAudioPlayer` for PCM playback and `HandsFreeController` for mic capture. The Live session connects these two directly through the server.
- The `ServerTTSProvider` (no-op marker) remains correct — TTS comes from the Live session, not a separate provider.

### US-005: Integrate Live session into BabylonChatPanel
**Description:** As a player, I need the chat panel to use Live sessions for voice conversation so that NPC responses are immediate and natural-sounding.

**Acceptance Criteria:**
- [ ] In `BabylonChatPanel.initConversationClient()`, after InsimulClient is ready, call `insimulClient.startLiveSession()` with the NPC's system prompt, voice profile, and target language
- [ ] When hands-free mode is active, stream mic audio chunks directly to `insimulClient.sendAudioChunk()` instead of waiting for browser STT to produce a transcript
- [ ] When the player types text, send it via `insimulClient.sendText()` which routes through the Live session
- [ ] Display text chunks in the chat UI as they arrive (same as current streaming text display)
- [ ] Play audio chunks via `StreamingAudioPlayer` as they arrive (same as current audio playback)
- [ ] On `interrupted` event, stop current audio playback and show visual indicator
- [ ] On `transcript` event (input transcription), display the player's transcribed speech in the chat
- [ ] On conversation close (`hide()`), signal the server to end the Live session
- [ ] Fall back to the existing text+TTS pipeline if Live session creation fails
- [ ] Add test: verify `startLiveSession` is called during `initConversationClient` when in voice mode
- [ ] Typecheck passes

**Notes:**
- The `HandsFreeController` currently captures audio, runs browser STT, and sends the transcript as text. With Live sessions, it should capture audio and stream raw PCM directly — the server's Live session handles STT natively.
- Typed text input should still work alongside voice input in the same Live session.

### US-006: Implement parallel side-channel for language analysis
**Description:** As a developer, I need language learning analysis (vocabulary, grammar, quest evaluation) to run in parallel with the Live audio pipeline so that side-effects don't block audio delivery.

**Acceptance Criteria:**
- [ ] In the `LiveConversationSession` `onTurnComplete` callback, fork the accumulated text to a non-blocking side-channel
- [ ] The side-channel runs three tasks concurrently (fire-and-forget, don't await):
  1. **Metadata extraction**: call `buildMetadataExtractionPrompt()` + Gemini Flash to extract vocab hints and grammar feedback
  2. **Quest goal evaluation**: call `buildConversationGoalPrompt()` + Gemini Flash to evaluate quest objectives
  3. **Language progress tracking**: local computation (no LLM) — update fluency, vocabulary encounters, CEFR check
- [ ] Side-channel results are sent to the client as separate WS events (`vocab_hints`, `grammar_feedback`, `eval`, `quest_progress`) — same event types as the current pipeline
- [ ] If any side-channel task fails, log the error but don't affect the conversation
- [ ] Add test: mock a turn complete event, verify all three side-channel tasks are triggered
- [ ] Typecheck passes

**Notes:**
- The current pipeline runs metadata extraction AFTER the full response is delivered (blocking the SSE stream). The side-channel approach decouples them entirely.
- The side-channel uses `GEMINI_MODELS.FLASH` (fast, cheap) for analysis — separate from the Live session's model.
- Quest progress and vocabulary tracking can start processing as soon as `onTurnComplete` fires.

### US-007: Add Live session support to SSE fallback path
**Description:** As a developer, I need the SSE conversation endpoint to also support Live sessions for clients that can't use WebSockets, by proxying the Live session's audio as base64 SSE events.

**Acceptance Criteria:**
- [ ] In `http-bridge.ts`, add an option to use a Live session instead of text+TTS when `useLiveSession: true` is in the request body
- [ ] Create a Live session with the client's system prompt, voice, and language
- [ ] Send the player's text via `liveSession.sendText(text)`
- [ ] Stream audio chunks as base64 SSE events (same format as current `{ type: 'audio', data, encoding, sampleRate, durationMs }`)
- [ ] Stream text chunks as text SSE events (same format as current `{ type: 'text', text, isFinal }`)
- [ ] Close the Live session after `turnComplete` and all audio is delivered
- [ ] Fall back to text+TTS pipeline if Live session creation fails
- [ ] Typecheck passes

**Notes:**
- This is a lower priority than the WS path (US-003) since SSE is the fallback transport. But it ensures Live session benefits are available even when WS is unavailable.
- The SSE path creates a new Live session per request (not persistent), since SSE doesn't support continuous bidirectional communication. This is less efficient but still faster than text+TTS because it eliminates sentence splitting.

### US-008: Automated tests for Live conversation pipeline
**Description:** As a developer, I need integration tests covering the Live session lifecycle to prevent regressions.

**Acceptance Criteria:**
- [ ] Test: create Live session → send text → receive audio+text → end session
- [ ] Test: create Live session → send audio → receive audio+text with input transcription
- [ ] Test: Live session unavailable → falls back to text+TTS pipeline
- [ ] Test: side-channel fires metadata extraction and quest evaluation in parallel
- [ ] Test: session auto-expires after inactivity timeout
- [ ] Test: concurrent session limit enforced (11th session rejected when max=10)
- [ ] All tests pass
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Gemini Live sessions must provide bidirectional audio streaming with text+audio response modalities
- FR-2: System prompts (NPC character, language directives) must be injected at Live session creation
- FR-3: Voice profile and language code must be configured per-session based on NPC gender and world target language
- FR-4: Text input must work alongside audio input in the same Live session
- FR-5: All language learning side-effects (vocabulary, grammar, quest eval) must run in parallel without blocking audio delivery
- FR-6: Fallback to text+TTS pipeline must be automatic and transparent when Live API is unavailable
- FR-7: Live sessions must auto-expire after configurable inactivity timeout
- FR-8: Client must support both voice (streaming audio) and typed (text) input to Live sessions

## Non-Goals

- No changes to the Gemini Flash text generation for non-conversation use cases (quest generation, name generation, etc.)
- No changes to the assessment pipeline (assessments use their own scoring flow)
- No video/image input support via the Live API (audio and text only)
- No multi-speaker voice configuration (single NPC voice per session)
- No persistent Live sessions across page reloads (sessions are ephemeral)

## Technical Considerations

- **Model**: `gemini-2.5-flash-native-audio-latest` confirmed available. Alternative: `gemini-3.1-flash-live-preview`. Test both for voice quality and latency.
- **API quotas**: Live sessions maintain persistent WebSocket connections to Google. Each open session consumes quota continuously. Cap at 10 concurrent sessions and implement aggressive cleanup.
- **Audio format**: Live API outputs PCM 24kHz mono (`audio/L16;codec=pcm;rate=24000`). Client's `StreamingAudioPlayer` already handles this format.
- **Client audio capture**: `HandsFreeController` currently uses browser `MediaRecorder` → webm blobs → STT. For Live sessions, it needs to output raw PCM chunks. `AudioWorklet` or `ScriptProcessorNode` can capture PCM from the mic at 16kHz.
- **Interruption handling**: The Live API supports `START_OF_ACTIVITY_INTERRUPTS` mode where the player speaking stops the NPC mid-sentence. This is natural for conversation but needs UI handling (stop audio, show indicator).
- **System prompt size**: Live sessions have a system instruction limit. The current NPC prompts are ~2000-4000 tokens. Verify this fits within the Live API's `systemInstruction` limit.
- **Fallback strategy**: If `ai.live.connect()` throws (quota exceeded, model unavailable, network error), catch and fall back to the existing text+TTS pipeline transparently. The client should not need to know which pipeline is active.

## Success Metrics

- Time-to-first-audio < 1 second (from player finishing speech to hearing NPC response)
- Voice consistency: single continuous voice per NPC (no sentence-boundary artifacts)
- Side-channel analysis completes within 3 seconds of turn end (non-blocking)
- Fallback to text+TTS pipeline works automatically with < 2 second additional delay
- No increase in conversation error rate vs current pipeline

## Open Questions

- Does the Live API support the same voice names as the TTS model (Kore, Charon, Aoede, Puck)?
- What is the system instruction token limit for Live sessions?
- Can we send the system prompt as `systemInstruction` in `LiveConnectConfig` or must it go through `sendClientContent`?
- Should the client support switching between voice and text input mid-conversation in a Live session?
- What happens to the Live session if the player is silent for an extended period (e.g., reading quest text)? Does the session time out on Google's side?
