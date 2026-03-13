# NPC Chat Improvement Roadmap

## Current Issues Summary

After a thorough audit of the NPC chat pipeline, these are the root causes of the reported issues:

### Issue 1: NPCs speak English in French language-learning worlds
**Root cause:** The Prolog-first routing intercept (`routes.ts:5508-5548`) matches greetings like "hello", "hi", "bonjour" against an English-only keyword list and returns Prolog-generated responses that ignore the world language context entirely. Additionally, the `buildLanguageAwareSystemPrompt()` relies on character truths having language fluency entries — if NPCs aren't generated with French fluency truths, `extractLanguageFluencies()` defaults to English (line 301 of `language-utils.ts`). The NPC then follows the system prompt instruction to "speak English by default" and, per line 424, actively apologizes for not knowing the target language.

### Issue 2: NPC audibly speaks grammar feedback markers
**Root cause:** Multiple TTS entry points receive unstripped Gemini responses:
- **Server-side** (`routes.ts:5642`): When `returnAudio=true`, the raw Gemini `response` (containing `**GRAMMAR_FEEDBACK** ... **END_GRAMMAR**`) is passed directly to `textToSpeech()` without stripping.
- **BabylonChatPanel** (line ~1465): The direct audio response path uses `response.text` raw from Gemini without calling `parseGrammarFeedback()`.
- The React `CharacterChatDialog.tsx` strips correctly on both text and voice paths (lines 586-591, 654-659), but the Babylon 3D game panel has a code path that doesn't.

### Issue 3: Mic button — "Recording..." appears before ding, words lost
**Root cause:** `startRecording()` sets UI state to "Recording..." immediately (`setIsRecording(true)` / input shows "🎤 Recording...") before `getUserMedia()` finishes initializing. There is no explicit "ready" audio cue — the ding sound (if any) comes from the browser's permission dialog completing, not from app code. Audio chunks collected before `MediaRecorder.start()` fires are lost.

### Issue 4: Slow transcription and response times
**Root cause:** The pipeline is fully sequential with no parallelism:
1. Record audio → stop → create blob (~0ms)
2. Upload blob to `/api/stt` → Gemini STT transcription (~2-4s)
3. Display transcript → send to `/api/gemini/chat` → Gemini LLM response (~2-5s)
4. Send response text to `/api/tts` → Google Cloud TTS (~1-2s)
5. Download + play audio (~0.5s)

**Total: 6-12 seconds** of sequential waiting between user finishing speech and hearing the NPC respond.

### Issue 5: Phantom transcriptions (random words when user says nothing)
**Root cause:** Gemini STT (`tts-stt.ts:114-127`) sends audio with the prompt "Generate a transcript of this audio." When the audio is silence or ambient noise, Gemini hallucinates words rather than returning empty. There is no voice activity detection (VAD), minimum audio energy check, or silence detection before sending to STT.

### Issue 6: TTS language detection is a French-only heuristic
**Root cause:** `tts-stt.ts:24` uses a regex for French accented characters to decide language — this fails for all other languages (Spanish, German, Japanese, etc.) and sends the wrong `languageCode` to Google Cloud TTS, producing English pronunciation of foreign words.

---

## Roadmap

### Phase 1: Critical Bug Fixes (Immediate)

#### 1.1 Fix grammar feedback TTS leak
**Files:** `server/routes.ts`, `client/src/components/3DGame/BabylonChatPanel.ts`
- **Server** (`routes.ts:5637-5649`): Strip `**GRAMMAR_FEEDBACK**...**END_GRAMMAR**` and `**QUEST_ASSIGN**...**END_QUEST**` from `response` before passing to `textToSpeech()` when `returnAudio=true`.
- **BabylonChatPanel** (~line 1448-1465): Add the same `parseGrammarFeedback()` + `parseAndCreateQuest()` cleanup before calling `textToSpeech(response.text)`.
- **Validation:** Play audio response in a language-learning game and verify no markers are audible.

#### 1.2 Fix NPC language in language-learning worlds
**Files:** `server/routes.ts`, `shared/language-utils.ts`, NPC generation code
- **Prolog router bypass** (`routes.ts:5508-5548`): Skip Prolog-first routing entirely when the world is a language-learning game (check `gameType`), or extend the Prolog router to be language-aware.
- **Default fluency fallback** (`language-utils.ts:300-303`): When a world has a primary real language (e.g., French) and a character has no language truths, default to the world's primary language instead of English.
- **NPC generation**: Ensure that when NPCs are created in a language-learning world, they are given fluency truths matching the world's primary real language (e.g., "French Language: 100/100 fluency").
- **Validation:** Create a French language-learning world, talk to an NPC, verify they greet and respond in French.

#### 1.3 Fix TTS language detection
**Files:** `server/services/tts-stt.ts`
- Replace the French-only heuristic (line 24) with a proper approach: accept an optional `languageCode` parameter in `textToSpeech()` and pass it through from the caller. The caller already knows the target language from `worldLangContext`.
- Update all callers of `textToSpeech()` and `/api/tts` to pass the correct BCP-47 language code using `getLanguageBCP47()`.
- **Fallback:** If no language code provided, use a lightweight language detection library (e.g., `franc` or `cld3-asm`) instead of a regex.

#### 1.4 Add silence/VAD detection before STT
**Files:** `client/src/components/CharacterChatDialog.tsx`, `client/src/components/3DGame/BabylonChatPanel.ts`
- After recording stops, analyze the audio blob's RMS energy level before sending to STT.
- If the audio energy is below a threshold (silence/noise), skip the STT call and show "No speech detected."
- This eliminates phantom transcriptions from Gemini hallucinating on silent audio.
- Consider using the Web Audio API `AnalyserNode` during recording to calculate real-time volume levels.

### Phase 2: Latency Reduction (High Priority)

#### 2.1 Parallel STT + response pipeline
**Files:** `server/routes.ts`, client chat components
- **Server-side combined endpoint:** Add a new `/api/gemini/voice-chat` endpoint that accepts audio directly, performs STT + LLM + TTS in a single server round-trip instead of 3 separate client→server calls.
- Pipeline: `audio → STT → LLM response → TTS → return {transcript, responseText, audioBlob}` all server-side.
- This eliminates 2 network round-trips and reduces total latency by ~40%.

#### 2.2 Streaming LLM responses
**Files:** `server/routes.ts`, client chat components
- Implement the `stream: true` parameter that's already stubbed in the Gemini chat endpoint.
- Stream text tokens to the client via SSE (Server-Sent Events) so the user sees the NPC's response appearing in real-time instead of waiting for the complete response.
- Start TTS on the first complete sentence while later sentences are still generating.

#### 2.3 Sentence-level TTS pipelining
**Files:** `server/services/tts-stt.ts`, client chat components
- Split the NPC response into sentences.
- Generate TTS for sentence 1 while the user reads it; play sentence 1 audio while generating sentence 2 TTS.
- The BabylonChatPanel already has an `audioQueue` mechanism (lines 99-100) — extend it to support this pipeline.
- **Target:** First sentence audio plays within 1-2 seconds of response start, vs. current 6-12 seconds for full response.

#### 2.4 Fix mic recording readiness
**Files:** `client/src/components/CharacterChatDialog.tsx`, `client/src/components/3DGame/BabylonChatPanel.ts`
- Move UI state change ("Recording...") to AFTER `getUserMedia()` resolves AND `MediaRecorder.start()` is called.
- Add an audible "ready" beep/ding when recording actually begins (play a short audio file).
- Show a "Requesting microphone..." state during the permission/setup phase.
- This prevents users from speaking before the microphone is actually capturing.

### Phase 3: Performance Optimization (Medium Priority)

#### 3.1 Client-side STT with Web Speech API
**Files:** Client chat components
- Use the browser's `SpeechRecognition` / `webkitSpeechRecognition` API for real-time transcription as a fast primary path.
- Benefits: instant transcription (no network round-trip), built-in VAD (auto-detects speech start/end), supports multiple languages.
- Fall back to Gemini STT only if browser STT is unavailable or returns low-confidence results.
- **Latency improvement:** Eliminates the 2-4 second STT round-trip entirely for most browsers.

#### 3.2 TTS caching
**Files:** `server/services/tts-stt.ts`, `server/routes.ts`
- Cache TTS results by (text, voice, language) hash in memory (LRU cache) and optionally on disk.
- Common phrases like greetings, farewells, and short responses will be served from cache instantly.
- Set a reasonable cache size limit (e.g., 100MB / 500 entries).

#### 3.3 Precompute NPC greeting audio
**Files:** Server NPC generation, client chat init
- When a chat dialog opens, the NPC greeting is generated client-side. Pre-generate the greeting TTS audio while the dialog animation plays, so audio is ready immediately.
- For frequently-visited NPCs, cache their greeting audio in the client.

#### 3.4 Use Gemini's native multi-modal voice (if available)
**Files:** `server/services/tts-stt.ts`, `server/routes.ts`
- Google's Gemini 2.5 supports native audio input/output in a single API call. If the model supports it, send audio in and get audio + text out in one call.
- This collapses STT → LLM → TTS into a single API call.
- The `audioInput` path in `routes.ts:5572-5588` already partially supports this — extend it to request audio output as well.

### Phase 4: Advanced Features (Lower Priority)

#### 4.1 Real-time voice streaming (Conv.ai-style)
**Files:** New WebSocket infrastructure, client audio pipeline
- Implement WebSocket-based voice chat for near-real-time conversation.
- Architecture: client streams audio chunks via WebSocket → server performs streaming STT → streams text to LLM → streams TTS audio back → client plays audio in real-time.
- Reference: `docs/API.md` contains a Conv.ai API spec that was analyzed — their approach uses gRPC streaming for low-latency voice.
- This is the gold standard for NPC voice chat but requires significant infrastructure.

#### 4.2 Voice Activity Detection (VAD) during recording
**Files:** Client audio pipeline
- Use a client-side VAD model (e.g., Silero VAD via ONNX.js, or WebRTC's built-in VAD) to:
  - Auto-start recording when speech is detected (push-to-talk becomes optional).
  - Auto-stop recording after a configurable silence duration (e.g., 1.5 seconds).
  - Trim leading/trailing silence before sending to STT (faster transcription, fewer hallucinations).

#### 4.3 Pronunciation scoring with audio comparison
**Files:** `shared/pronunciation-scoring.ts`, client audio pipeline
- Current pronunciation scoring uses Levenshtein distance on text only.
- Enhance with audio-level comparison: send both the TTS reference audio and the player's recording to a pronunciation assessment API.
- Google Cloud Speech-to-Text has pronunciation assessment features; alternatively use phoneme-level comparison.

#### 4.4 Conversation context caching
**Files:** `server/routes.ts`, new caching layer
- Cache the Gemini chat session context server-side so that subsequent messages in the same conversation don't re-send the full history.
- Use Gemini's context caching API if available, or maintain server-side chat session objects with TTL.
- Reduces token usage and latency for multi-turn conversations.

---

## Priority Matrix

| Phase | Item | Impact | Effort | Priority |
|-------|------|--------|--------|----------|
| 1 | 1.1 Grammar feedback TTS leak | Critical | Small | P0 |
| 1 | 1.2 NPC language in learning worlds | Critical | Medium | P0 |
| 1 | 1.3 TTS language detection | High | Small | P0 |
| 1 | 1.4 Silence/VAD before STT | High | Small | P1 |
| 2 | 2.1 Combined voice-chat endpoint | High | Medium | P1 |
| 2 | 2.2 Streaming LLM responses | High | Medium | P1 |
| 2 | 2.3 Sentence-level TTS pipeline | High | Medium | P1 |
| 2 | 2.4 Fix mic recording readiness | Medium | Small | P1 |
| 3 | 3.1 Browser STT (Web Speech API) | High | Medium | P2 |
| 3 | 3.2 TTS caching | Medium | Small | P2 |
| 3 | 3.3 Precompute greeting audio | Low | Small | P2 |
| 3 | 3.4 Gemini native multi-modal | High | Medium | P2 |
| 4 | 4.1 WebSocket voice streaming | Very High | Large | P3 |
| 4 | 4.2 Client-side VAD | Medium | Medium | P3 |
| 4 | 4.3 Audio pronunciation scoring | Medium | Large | P3 |
| 4 | 4.4 Conversation context caching | Medium | Medium | P3 |

## Expected Latency Improvements

| Scenario | Current | After Phase 1-2 | After Phase 3 | After Phase 4 |
|----------|---------|-----------------|---------------|---------------|
| Text chat (type → response) | 3-6s | 2-4s (streaming) | 2-4s | 2-4s |
| Voice chat (speak → hear response) | 6-12s | 3-5s (combined endpoint + sentence pipeline) | 1-3s (browser STT) | <1s (WebSocket streaming) |
| First audio playback | 6-12s | 2-3s (first sentence) | 1-2s | <0.5s |

## Key Files Reference

| File | Role |
|------|------|
| `shared/language-utils.ts` | System prompt builder, fluency extraction, greeting generation |
| `shared/language-progress.ts` | Grammar feedback parsing (`parseGrammarFeedbackBlock`) |
| `server/services/tts-stt.ts` | Google Cloud TTS + Gemini STT wrappers |
| `server/routes.ts:5432-5656` | TTS, STT, and Gemini chat endpoints |
| `client/src/components/CharacterChatDialog.tsx` | React chat dialog (text + voice) |
| `client/src/components/3DGame/BabylonChatPanel.ts` | Babylon.js in-game chat panel |
| `docs/API.md` | Conv.ai API spec (reference for Phase 4) |
