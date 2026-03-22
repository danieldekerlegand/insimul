# PRD: Local LLM Integration & AI Provider Abstraction

## Introduction

Insimul currently depends on Google Gemini for all AI capabilities (text generation, TTS, STT, image generation). This creates three limitations: requires internet, incurs API costs, and adds network latency. This feature abstracts the AI layer behind a unified provider interface, adds llama.cpp as a bundled local LLM backend (no external dependencies like Ollama), integrates Piper TTS and whisper.cpp for local voice, upgrades Gemini to 3.1, and enables game exports with a self-contained local AI stack (~2.5-3GB).

The Gemini integration is **not removed** — it remains the default cloud provider. The local provider is an additional option selected via environment variable.

## Goals

- Abstract all 20+ AI-consuming services behind a unified provider interface so adding new backends requires zero changes to service code
- Add a fully offline local AI stack: llama.cpp (text), Piper (TTS), whisper.cpp (STT)
- Upgrade Gemini from 2.5 to 3.1 (model IDs + new API features) before 2.0 retirement on June 1, 2026
- Enable game exports (Babylon, Godot, Unity, Unreal) to bundle the local AI stack as native plugins
- Provider selection via `AI_PROVIDER` environment variable (`gemini` | `local`), no UI

## User Stories

### US-001: Unified AI Provider Interface
**Description:** As a developer, I want a single provider interface that all AI services call through, so that swapping backends requires no changes to service code.

**Acceptance Criteria:**
- [ ] Create `server/services/ai/ai-provider.ts` with unified `IAIProvider` interface covering: `generate()`, `generateStream()`, `textToSpeech()`, `speechToText()`, `generateImage()`
- [ ] Create `server/services/ai/ai-provider-factory.ts` that reads `AI_PROVIDER` env var and returns the correct provider
- [ ] Create `server/services/ai/tts-provider.ts` with `ITTSProvider` interface: `synthesize(text, voice, options) → Buffer`
- [ ] Create `server/services/ai/stt-provider.ts` with `ISTTProvider` interface: `transcribe(audioBuffer, options) → string`
- [ ] Existing `ILLMProvider` (batch) and `IStreamingLLMProvider` (streaming) interfaces are consolidated into or composed within `IAIProvider`
- [ ] Provider is a singleton resolved at startup, injectable into all services
- [ ] Typecheck passes

### US-002: Gemini Provider Implementation
**Description:** As a developer, I want the existing Gemini integration wrapped in the new unified interface, so existing functionality is preserved with zero regression.

**Acceptance Criteria:**
- [ ] Create `server/services/ai/providers/gemini/gemini-ai-provider.ts` implementing `IAIProvider`
- [ ] Create `server/services/ai/providers/gemini/gemini-tts-provider.ts` implementing `ITTSProvider`
- [ ] Create `server/services/ai/providers/gemini/gemini-stt-provider.ts` implementing `ISTTProvider`
- [ ] Wraps existing logic from `server/config/gemini.ts`, `server/services/tts-stt.ts`, `server/services/gemini-native-audio.ts`
- [ ] All 20 files that currently import from `server/config/gemini.ts` are migrated to use the provider interface instead
- [ ] Existing fallback behavior (no API key → graceful degradation) is preserved
- [ ] All existing API endpoints produce identical responses
- [ ] Typecheck passes

### US-003: Gemini 3.1 Upgrade
**Description:** As a developer, I want to upgrade to Gemini 3.1 models and adopt new API features, so we use the latest capabilities before 2.0 models retire.

**Acceptance Criteria:**
- [ ] Update `GEMINI_MODELS.PRO` from `gemini-2.5-pro` to `gemini-3.1-pro-preview`
- [ ] Update `GEMINI_MODELS.FLASH` from `gemini-2.5-flash` to `gemini-3.1-flash-lite-preview`
- [ ] Update `GEMINI_MODELS.SPEECH` from `gemini-2.0-flash-exp` to appropriate 3.1 speech model
- [ ] Review and adopt any new Gemini 3.1 API features (improved tool use, extended context, new response modalities)
- [ ] Update `@google/generative-ai` and `@google/genai` npm packages to latest versions compatible with 3.1
- [ ] Verify TTS voice names (Kore, Charon, Aoede, Puck) still work with 3.1
- [ ] Test all 16+ services against 3.1 models — verify output quality hasn't regressed
- [ ] Update cost estimation in `llm-provider.ts` to reflect 3.1 pricing
- [ ] Typecheck passes

### US-004: llama.cpp Integration (Local Text Generation)
**Description:** As a developer, I want llama.cpp bundled directly into the Node.js server as a native addon, so local text generation works without external dependencies like Ollama.

**Acceptance Criteria:**
- [ ] Add `node-llama-cpp` npm package (Node.js bindings for llama.cpp)
- [ ] Create `server/services/ai/providers/local/local-ai-provider.ts` implementing `IAIProvider`
- [ ] Support model selection via `LOCAL_MODEL_PATH` env var (path to GGUF model file)
- [ ] Support `LOCAL_MODEL_NAME` env var for a default bundled model (e.g., `phi-4-mini-q4`)
- [ ] Implement `generate()` — single completion with system prompt, temperature, maxTokens
- [ ] Implement `generateStream()` — token-by-token streaming via AsyncIterable
- [ ] GPU auto-detection: use Metal (macOS), CUDA (Linux/Windows), or CPU fallback
- [ ] Model loading happens once at startup, stays in memory
- [ ] Concurrent request queuing (llama.cpp is single-threaded per model instance)
- [ ] All prompt formats that Gemini services use (system prompts, JSON output, etc.) work with local models
- [ ] Typecheck passes

### US-005: Piper TTS Integration (Local Text-to-Speech)
**Description:** As a developer, I want Piper TTS integrated for local speech synthesis, so NPC dialogue can be spoken offline.

**Acceptance Criteria:**
- [ ] Add `piper-tts` or equivalent Node.js binding, or bundle Piper binary + ONNX runtime
- [ ] Create `server/services/ai/providers/local/piper-tts-provider.ts` implementing `ITTSProvider`
- [ ] Support `PIPER_VOICES_DIR` env var pointing to directory of `.onnx` voice model files
- [ ] Map existing voice names (Kore, Charon, Aoede, Puck) to Piper voice equivalents
- [ ] Support gender selection (male, female, neutral) via voice model selection
- [ ] Output MP3 or WAV matching existing TTS interface
- [ ] Emotional tone modulation: map SSML prosody parameters to Piper's speed/pitch controls
- [ ] LRU cache integration (reuse existing `TTSCache`)
- [ ] Language support: at minimum English, French, Spanish, German (Piper has 30+ language models)
- [ ] Typecheck passes

### US-006: whisper.cpp Integration (Local Speech-to-Text)
**Description:** As a developer, I want whisper.cpp integrated for local speech recognition, so player voice input works offline.

**Acceptance Criteria:**
- [ ] Add `nodejs-whisper` or `whisper-node` npm package
- [ ] Create `server/services/ai/providers/local/whisper-stt-provider.ts` implementing `ISTTProvider`
- [ ] Support `WHISPER_MODEL_PATH` env var (path to Whisper GGML model file)
- [ ] Default to `whisper-base` model (~150MB, good accuracy/speed tradeoff)
- [ ] Accept audio input in webm, wav, mp3 formats (convert to 16kHz WAV internally if needed)
- [ ] Language hint support (BCP-47 codes) matching existing STT interface
- [ ] Auto-language detection when no hint provided
- [ ] Typecheck passes

### US-007: Local Native Audio Pipeline
**Description:** As a developer, I want a local equivalent of Gemini's native audio I/O (STT → LLM → TTS in one call), so the game's voice chat works offline.

**Acceptance Criteria:**
- [ ] Create `server/services/ai/providers/local/local-native-audio.ts`
- [ ] Implements the same `NativeAudioChatRequest/Response` interface as `gemini-native-audio.ts`
- [ ] Pipeline: whisper.cpp transcribe → llama.cpp generate → Piper synthesize
- [ ] Total pipeline latency < 2 seconds for a typical NPC dialogue turn on a modern machine (M1+ Mac, RTX 3060+ PC)
- [ ] Conversation history passed through to LLM step
- [ ] Emotional tone from request applied to Piper TTS step
- [ ] Typecheck passes

### US-008: Migrate All 16+ Services to Provider Interface
**Description:** As a developer, I want every AI-consuming service migrated to use the unified provider, so the `AI_PROVIDER` env var controls all AI calls system-wide.

**Acceptance Criteria:**
- [ ] `server/services/text-generator.ts` — uses provider `generate()`
- [ ] `server/services/quest-generator.ts` — uses provider `generate()`
- [ ] `server/services/grammar-generator.ts` — uses provider `generate()`
- [ ] `server/services/gemini-ai.ts` — uses provider `generate()`
- [ ] `server/services/character-interaction.ts` — uses provider `generate()`
- [ ] `server/services/streaming-chat.ts` — uses provider `generateStream()` + `textToSpeech()`
- [ ] `server/services/item-translation.ts` — uses provider `generate()`
- [ ] `server/services/language-service.ts` — uses provider `generate()`
- [ ] `server/services/pronunciation-scorer.ts` — uses provider `generate()` + `speechToText()`
- [ ] `server/services/tts-stt.ts` — replaced by provider `textToSpeech()` / `speechToText()`
- [ ] `server/services/llm-event-enrichment.ts` — uses provider `generate()`
- [ ] `server/services/conversation-compression.ts` — uses provider `generate()`
- [ ] `server/services/conversation/providers/gemini-provider.ts` — replaced by provider `generateStream()`
- [ ] `server/generators/name-generator.ts` — uses provider `generate()`
- [ ] `server/services/gemini-native-audio.ts` — replaced by provider native audio pipeline
- [ ] `server/services/image-generation.ts` — uses provider `generateImage()` (local fallback: skip or placeholder)
- [ ] `server/routes.ts` — all direct Gemini calls go through provider
- [ ] `server/routes/npc-exam-routes.ts` — uses provider
- [ ] `server/routes/assessment-scoring.ts` — uses provider
- [ ] `server/services/sketchfab-api.ts` — uses provider if applicable
- [ ] No file imports directly from `server/config/gemini.ts` except the Gemini provider implementation
- [ ] Typecheck passes

### US-009: Game Export — Bundle Local AI Stack
**Description:** As a developer, I want game exports to include the local AI stack (llama.cpp + model + Piper + Whisper), so exported games work fully offline.

**Acceptance Criteria:**
- [ ] Extend `server/services/game-export/plugin-bundler.ts` to include AI model files in export
- [ ] Create `server/services/game-export/ai-bundler.ts` for AI asset management
- [ ] Bundle GGUF model file (default: Phi-4-mini Q4, ~2GB) into export
- [ ] Bundle Piper voice models (~50-100MB per voice) into export
- [ ] Bundle Whisper model (base, ~150MB) into export
- [ ] **Babylon export**: Bundle llama.cpp WASM build + models in `assets/ai/` directory, integrate with Vite build
- [ ] **Godot export**: Generate GDNative plugin wrapper for llama.cpp, include model files in `res://ai/`
- [ ] **Unity export**: Generate C# wrapper using Unity's native plugin system, include models in `StreamingAssets/ai/`
- [ ] **Unreal export**: Generate C++ plugin wrapper, include models in `Content/AI/`
- [ ] `InsimulPluginConfig` extended with `aiProvider: 'local' | 'cloud'` and model paths
- [ ] Export size displayed to user before download (with AI models vs without)
- [ ] Option to export without AI models (for smaller downloads that require cloud connection)
- [ ] Typecheck passes

### US-010: Environment Variable Configuration
**Description:** As a developer, I want all AI provider settings controlled via environment variables, documented in `.env.example`.

**Acceptance Criteria:**
- [ ] `AI_PROVIDER` — `gemini` (default) | `local`
- [ ] `LOCAL_MODEL_PATH` — absolute path to GGUF model file
- [ ] `LOCAL_MODEL_NAME` — model name for auto-download/bundled model selection
- [ ] `LOCAL_GPU_LAYERS` — number of layers to offload to GPU (default: auto-detect)
- [ ] `LOCAL_CONTEXT_SIZE` — context window size in tokens (default: 4096)
- [ ] `PIPER_VOICES_DIR` — path to Piper voice model directory
- [ ] `WHISPER_MODEL_PATH` — path to Whisper GGML model file
- [ ] `WHISPER_MODEL_SIZE` — `tiny` | `base` | `small` | `medium` | `large` (default: `base`)
- [ ] All variables documented in `.env.example` with descriptions
- [ ] `logGeminiStatus()` expanded to `logAIStatus()` that reports active provider and loaded models
- [ ] Typecheck passes

## Functional Requirements

- FR-1: The system must support two AI providers: `gemini` (cloud) and `local` (llama.cpp + Piper + whisper.cpp), selected via `AI_PROVIDER` environment variable
- FR-2: All 20+ AI-consuming services must call through the unified `IAIProvider` interface — no direct Gemini SDK imports outside the Gemini provider implementation
- FR-3: The local provider must load the GGUF model into memory once at startup and serve all requests from the loaded model
- FR-4: The local TTS provider must map the existing voice names (Kore, Charon, Aoede, Puck) to Piper voice equivalents
- FR-5: The local STT provider must accept audio in webm, wav, and mp3 formats and return transcribed text
- FR-6: The local native audio pipeline must complete a full STT→LLM→TTS cycle in under 2 seconds on modern hardware
- FR-7: When `AI_PROVIDER=local` and no model is loaded, the system must fail gracefully with clear error messages (not crash)
- FR-8: Game exports must support an `aiBundle` option that includes llama.cpp native binaries, model files, Piper voices, and Whisper model
- FR-9: Gemini models must be updated to 3.1 (`gemini-3.1-pro-preview`, `gemini-3.1-flash-lite-preview`) with SDK packages updated
- FR-10: The `@google/generative-ai` and `@google/genai` packages must be updated to latest versions supporting Gemini 3.1
- FR-11: Image generation via local provider should return a placeholder or skip (no local image generation model in v1)
- FR-12: Existing fallback behaviors (e.g., quest generator returning hardcoded quest when no AI available) must continue to work regardless of provider

## Non-Goals

- No UI for provider selection (environment variable only)
- No fine-tuning or training of local models
- No local image generation (Gemini Imagen has no local equivalent in v1; local `generateImage()` returns graceful fallback)
- No model downloading/management UI (developer manages model files manually or via scripts)
- No simultaneous multi-provider routing (e.g., "use Gemini for quests but local for chat")
- No Ollama or other external server dependency — llama.cpp is bundled directly
- No removal of Gemini integration — it remains the default provider

## Technical Considerations

### Existing Architecture
- `server/services/llm-provider.ts` already defines `ILLMProvider` with `'local'` in the provider type union — this can be extended
- `server/services/conversation/providers/llm-provider.ts` defines `IStreamingLLMProvider` — needs to be composed into the unified interface
- `server/config/gemini.ts` is the centralized Gemini config — the Gemini provider wraps this
- `server/services/tts-cache.ts` provides LRU caching for TTS — both providers should use it

### Dependencies to Add
- `node-llama-cpp` — Node.js native bindings for llama.cpp (supports Metal, CUDA, CPU)
- `nodejs-whisper` or `whisper-node` — Node.js bindings for whisper.cpp
- `piper-tts` or `onnxruntime-node` + Piper ONNX models — local TTS
- Updated `@google/generative-ai` and `@google/genai` for Gemini 3.1

### Performance
- llama.cpp on M1 Mac: ~30-50 tokens/sec for 7-8B models (adequate for NPC dialogue)
- Piper TTS: real-time on CPU (faster than real-time on GPU)
- whisper.cpp base model: ~10x real-time on CPU

### Bundle Sizes
- Phi-4-mini Q4_K_M: ~2 GB
- Piper voice (1 voice): ~50-100 MB
- Whisper base: ~150 MB
- llama.cpp WASM: ~5 MB
- Total with 2 voices: ~2.5-3 GB

### File Structure
```
server/services/ai/
├── ai-provider.ts              # IAIProvider, ITTSProvider, ISTTProvider interfaces
├── ai-provider-factory.ts      # Factory: reads AI_PROVIDER env, returns provider
├── providers/
│   ├── gemini/
│   │   ├── gemini-ai-provider.ts
│   │   ├── gemini-tts-provider.ts
│   │   └── gemini-stt-provider.ts
│   └── local/
│       ├── local-ai-provider.ts      # llama.cpp wrapper
│       ├── piper-tts-provider.ts     # Piper TTS wrapper
│       ├── whisper-stt-provider.ts   # whisper.cpp wrapper
│       └── local-native-audio.ts     # STT→LLM→TTS pipeline
```

## Success Metrics

- All 20+ AI services work identically with both `AI_PROVIDER=gemini` and `AI_PROVIDER=local`
- Local provider produces coherent NPC dialogue, quest text, and translations (subjective quality check)
- Voice chat round-trip (STT→LLM→TTS) completes in < 2 seconds on M1 Mac
- Game exports with bundled AI stack run fully offline with no network calls
- Gemini 3.1 upgrade produces no regression in output quality across all services
- Zero direct Gemini SDK imports outside `server/services/ai/providers/gemini/`

## Open Questions

- Which Piper voices best match the existing Kore/Charon/Aoede/Puck voice character? Need to audition Piper voice models.
- Should the Babylon WASM export use llama.cpp's WASM build or a different inference engine (e.g., web-llm)?
- What is the minimum viable GGUF model for acceptable NPC dialogue quality? Need to test Phi-4-mini vs TinyLlama 1.1B vs SmolLM 1.7B.
- Does Gemini 3.1's speech model support the same voice names (Kore, Charon, etc.)? Need to verify against 3.1 API docs.
- For Chitimacha language support: can a local model handle endangered language content generation, or should that always route to Gemini?
