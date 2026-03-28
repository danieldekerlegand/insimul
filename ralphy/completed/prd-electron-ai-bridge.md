# PRD: Electron IPC AI Bridge for Exported Games

## Introduction

When users export an Insimul game as an Electron desktop app with the "Local AI" option, the exported game has `aiConfig.apiMode: "local"` but no actual AI runtime. All conversation, TTS, and STT calls try to `fetch()` API endpoints that don't exist in the export, so NPC conversations, voice chat, and speech recognition silently fail.

The local AI stack (node-llama-cpp for LLM, Piper for TTS, whisper.cpp for STT) already works server-side in Insimul's Express backend. This PRD wires the same stack into Electron's main process so the renderer can call it via IPC instead of HTTP — getting native GPU acceleration (Metal/CUDA) and avoiding WASM performance limitations.

## Goals

- Enable fully offline NPC conversations in exported Electron games using a bundled LLM (Phi-4-mini Q4)
- Provide local text-to-speech for NPC dialogue audio using bundled Piper voice models
- Provide local speech-to-text for player voice input using bundled Whisper model
- Maintain the same conversation quality and callback interface as the server-side AI
- GPU auto-detection (Metal on macOS, CUDA on Linux/Windows, CPU fallback)
- Single model loads once at startup, stays in memory for the session
- Transparent fallback: if local AI fails to load, the game still runs (conversations unavailable)

## User Stories

### US-001: Electron Main Process AI Service Module
**Description:** As a developer, I need a self-contained AI service module that runs in Electron's main process, loads the bundled GGUF/Piper/Whisper models, and exposes IPC handlers for the renderer.

**Acceptance Criteria:**
- [x] Create `electron/ai-service.js` (or `.ts` compiled to JS) that exports an `initAIService(app)` function
- [x] On startup, reads `dist/data/ai_config.json` to determine if `apiMode === 'local'`
- [x] When local, loads node-llama-cpp with the GGUF model from the path in `ai_config.json` (default: `ai/models/phi-4-mini-q4.gguf` relative to app root)
- [x] GPU auto-detection: attempts Metal (macOS) or CUDA (Linux/Windows), falls back to CPU
- [x] Model loads once and stays in memory — subsequent IPC calls reuse it
- [x] Registers IPC handlers: `ai:generate`, `ai:generate-stream`, `ai:tts`, `ai:stt`, `ai:status`
- [x] If model loading fails, logs the error and sets `aiAvailable = false` (game continues without AI)
- [x] Concurrent request queuing — node-llama-cpp is single-threaded per model, so requests are serialized
- [x] `electron/main.js` calls `initAIService(app)` during app startup
- [x] Typecheck passes

### US-002: Piper TTS Integration in Main Process
**Description:** As a developer, I need the AI service to provide text-to-speech using Piper so NPC dialogue can be spoken aloud.

**Acceptance Criteria:**
- [x] Piper voice model loaded from `ai/models/voices/` directory relative to app root
- [x] `ai:tts` IPC handler accepts `{ text: string, voice?: string, speed?: number }` and returns `ArrayBuffer` (WAV or MP3)
- [x] Maps voice names (Kore, Charon, Aoede, Puck) to Piper voice model files
- [x] Gender selection (male/female/neutral) via voice model selection
- [x] Returns audio within ~500ms for a typical NPC sentence (real-time or faster on modern hardware)
- [x] Graceful failure: returns null if Piper is not available, caller falls back to text-only
- [x] Typecheck passes

### US-003: Whisper STT Integration in Main Process
**Description:** As a developer, I need the AI service to provide speech-to-text using whisper.cpp so players can speak to NPCs.

**Acceptance Criteria:**
- [x] Whisper model loaded from `ai/models/whisper-base.bin` (or path from `ai_config.json`)
- [x] `ai:stt` IPC handler accepts `ArrayBuffer` (WebM/WAV audio from recorder) and returns `{ text: string, language?: string }`
- [x] Converts input audio to 16kHz WAV internally if needed
- [x] Language hint support (BCP-47 codes) matching existing STT interface
- [x] Auto-language detection when no hint provided
- [x] Returns transcription within ~2 seconds for a typical player utterance
- [x] Graceful failure: returns empty string if Whisper is not available
- [x] Typecheck passes

### US-004: Electron Preload Bridge
**Description:** As a developer, I need the Electron preload script to expose AI capabilities to the renderer process securely via contextBridge.

**Acceptance Criteria:**
- [x] `electron/preload.js` exposes `window.electronAPI.aiAvailable` (boolean, set after model load)
- [x] Exposes `window.electronAPI.aiGenerate(prompt, options)` → `Promise<string>`
- [x] Exposes `window.electronAPI.aiGenerateStream(prompt, options, onChunk)` → registers an IPC listener that calls `onChunk(token)` for each token, returns `Promise<string>` with full text
- [x] Exposes `window.electronAPI.aiTTS(text, voice, speed)` → `Promise<ArrayBuffer | null>`
- [x] Exposes `window.electronAPI.aiSTT(audioBuffer, languageHint)` → `Promise<{ text: string }>`
- [x] Exposes `window.electronAPI.aiStatus()` → `Promise<{ loaded: boolean, modelName: string, gpuLayers: number, gpuType: string }>`
- [x] All IPC calls use `contextBridge.exposeInMainWorld` (no `nodeIntegration`)
- [x] Typecheck passes

### US-005: Renderer-side LocalAIClient
**Description:** As a developer, I need a client-side module that abstracts local AI calls so game code doesn't need to know about Electron IPC details.

**Acceptance Criteria:**
- [x] Create `src/LocalAIClient.ts` with methods: `generate(prompt, systemPrompt?, options?)`, `generateStream(prompt, systemPrompt?, options?, onToken?)`, `textToSpeech(text, voice?)`, `speechToText(audioBlob)`
- [x] Static `isAvailable()` method that checks `window.electronAPI?.aiAvailable === true`
- [x] `generateStream` calls `window.electronAPI.aiGenerateStream` and invokes `onToken` callback for each token received
- [x] `generate` is a convenience wrapper that accumulates all tokens from `generateStream`
- [x] `textToSpeech` returns an `AudioBuffer` or `Blob` ready for `StreamingAudioPlayer`
- [x] `speechToText` converts the browser `Blob` to `ArrayBuffer` and sends via IPC
- [x] If not in Electron or AI not available, all methods throw a clear error (callers should check `isAvailable()` first)
- [x] Typecheck passes

### US-006: Wire ConversationClient to LocalAIClient
**Description:** As a player, I want to have conversations with NPCs using the local AI so the game works fully offline.

**Acceptance Criteria:**
- [x] `ConversationClient` constructor accepts optional `localAI?: LocalAIClient`
- [x] `sendText()`: when local AI available, builds a system prompt from NPC personality/context and calls `localAI.generateStream()` with `onToken` mapped to `onTextChunk` callback
- [x] `sendText()`: on completion, calls `localAI.textToSpeech()` for audio and emits `onAudioChunk`
- [x] `sendAudio()`: when local AI available, calls `localAI.speechToText()` first, then routes the transcribed text through `sendText()` logic
- [x] State transitions (thinking → speaking → idle) match the existing HTTP SSE flow
- [x] `onComplete` callback fires with full accumulated text
- [x] Existing HTTP SSE path preserved as fallback when `localAI` is null/unavailable
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-007: Wire NPC-NPC Conversations to LocalAIClient
**Description:** As a player, I want to see NPCs talking to each other using local AI so the world feels alive even offline.

**Acceptance Criteria:**
- [x] In `BabylonGame.ts`, the `onStartConversation(npc1Id, npc2Id, topic)` callback checks `LocalAIClient.isAvailable()`
- [x] When available, builds a system prompt describing both NPCs (name, personality traits, occupation, relationship) from loaded character data
- [x] Generates 2-4 exchange pairs via `localAI.generate()` with a structured output prompt requesting JSON
- [x] Parses the LLM response into `ConversationResult` shape: `{ exchanges, relationshipDelta, topic, languageUsed }`
- [x] Falls back to returning `null` if local AI is not available or generation fails
- [x] NPC conversations feel natural and reflect personality (not generic filler)
- [x] Typecheck passes

### US-008: AI Loading UI
**Description:** As a player, I want to see that the AI is loading on startup so I know conversations will be available.

**Acceptance Criteria:**
- [x] During `BabylonGame.init()`, after engine initialization, check `LocalAIClient.isAvailable()` and show "Loading AI model..." in the loading screen
- [x] Query `window.electronAPI.aiStatus()` and display model name and GPU type (e.g., "AI: Phi-4-mini (Metal)")
- [x] If AI not available, show brief "AI: Offline — conversations unavailable" toast after load
- [x] If AI loaded successfully, show brief "AI: Ready" toast
- [x] Loading screen progress bar accounts for AI initialization step
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-009: AI Model Bundling Verification
**Description:** As a developer, I need to verify the export pipeline correctly bundles AI models when the user selects "Local AI".

**Acceptance Criteria:**
- [x] When `aiProvider: 'local'` is selected in the export dialog, the export ZIP includes: GGUF model file (~2GB), Piper voice model(s) (~50-100MB each), Whisper model (~150MB)
- [x] `ai_config.json` in the export has `localModelPath` pointing to the correct relative path (e.g., `ai/models/phi-4-mini-q4.gguf`)
- [x] Model files are placed in `public/ai/models/` (web) or bundled alongside `dist/` (Electron)
- [x] Export dialog shows estimated size increase when "Local AI" is selected
- [x] Export succeeds and models are loadable by the Electron AI service
- [x] Typecheck passes

## Functional Requirements

- FR-1: The Electron main process must load node-llama-cpp, Piper TTS, and whisper.cpp STT when `ai_config.json` specifies `apiMode: "local"`
- FR-2: GPU acceleration must be auto-detected (Metal on macOS, CUDA on Linux/Windows) with CPU fallback
- FR-3: The LLM model must load once at startup and persist in memory for the session lifetime
- FR-4: IPC handlers must be registered for `ai:generate`, `ai:generate-stream`, `ai:tts`, `ai:stt`, `ai:status`
- FR-5: Token-by-token streaming must be supported via IPC events for typewriter text display
- FR-6: The preload script must expose AI capabilities via `contextBridge` (no `nodeIntegration`)
- FR-7: `LocalAIClient.ts` must provide a clean async API matching the shape of the existing HTTP conversation flow
- FR-8: `ConversationClient` must transparently route through local AI when available, HTTP when not
- FR-9: NPC-NPC conversations must use local LLM with personality-aware prompts when available
- FR-10: TTS must return audio compatible with the existing `StreamingAudioPlayer`
- FR-11: STT must accept WebM/WAV audio blobs from the browser's MediaRecorder
- FR-12: If any AI component fails to load, the game must continue running with AI features gracefully disabled
- FR-13: The loading screen must show AI initialization status

## Non-Goals

- No WASM-based inference in the browser renderer (too slow for conversational AI)
- No model downloading at runtime — models must be pre-bundled in the export
- No model selection UI in the exported game (model is chosen at export time)
- No fine-tuning or model training in the exported game
- No multi-model support (one LLM, one TTS voice set, one STT model per export)
- No server-side AI proxy from the Electron app (it's fully local or nothing)

## Technical Considerations

- **Existing code to reuse:** `server/services/ai/providers/local/local-ai-provider.ts`, `server/services/ai/providers/local/piper-tts-provider.ts`, `server/services/ai/providers/local/whisper-stt-provider.ts` contain the core integration logic — adapt these for the Electron main process context
- **node-llama-cpp native addon:** Electron's Node.js version must match the native addon build. Use `electron-rebuild` or prebuild binaries
- **IPC streaming pattern:** For token-by-token streaming, the main process sends `ai:stream-token` events via `webContents.send()`, and the preload script forwards them to a callback registered by the renderer
- **Memory budget:** Phi-4-mini Q4 (~2GB) + Piper (~100MB) + Whisper base (~150MB) ≈ 2.3GB in the main process, separate from renderer memory
- **Concurrent requests:** node-llama-cpp is single-threaded per model instance — implement a simple request queue in the AI service
- **System prompt construction:** NPC personality data (Big Five traits, occupation, relationships, dialogue context) is available in `characters.json` and `dialogue_contexts.json` — the `LocalAIClient` should build system prompts from this data

## Success Metrics

- NPC text conversations respond within 3 seconds on modern hardware (M1+ Mac, RTX 3060+ PC)
- TTS audio for a typical NPC sentence ready within 500ms
- STT transcription of a player utterance completes within 2 seconds
- Exported game with local AI loads in under 30 seconds (including model load)
- Zero `fetch()` errors in the Electron dev console when running with local AI
- Full player→NPC→player conversation loop works end-to-end offline

## Open Questions

- Should the AI service pre-warm the LLM with a dummy prompt at startup to reduce first-response latency?
- What is the maximum context window to use for NPC conversations? (Phi-4-mini supports 16k but more context = slower)
- Should NPC-NPC conversation results be cached to avoid re-generating the same conversation?
- How should the export handle platforms where GPU acceleration is unavailable and CPU inference is too slow (>10s per response)?
