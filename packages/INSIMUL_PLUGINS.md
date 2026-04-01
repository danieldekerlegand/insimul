# Insimul Plugins & SDKs

This directory contains the official Insimul conversation plugins for all supported platforms. Each plugin provides the same core functionality — streaming NPC conversations with configurable providers for Chat (LLM), TTS, and STT — adapted to the conventions of each engine.

## Packages

| Package | Engine | Language | Path |
| --- | --- | --- | --- |
| `@insimul/typescript` | Web (Babylon.js, React, any JS/TS) | TypeScript | `typescript/` |
| `@insimul/unreal` | Unreal Engine 5 | C++ | `unreal/` |
| `@insimul/unity` | Unity | C# | `unity/` |
| `@insimul/godot` | Godot 4 | GDScript | `godot/` |

## Provider Architecture

All plugins share the same provider model. Creators pick a provider for each subsystem independently:

### Chat Providers (where LLM inference runs)

| Provider | JS SDK | Electron | Unity | Unreal |
| --- | --- | --- | --- | --- |
| **Server** | WebSocket + SSE to Insimul server (Gemini LLM) | WebSocket + SSE to Insimul server | HTTP + SSE to Insimul server | WebSocket + REST to Insimul server |
| **Browser** | WebLLM (WebGPU, in-browser) | — | — | — |
| **Local** | — | node-llama-cpp via Electron IPC | LLMUnity (llama.cpp native bindings) | llama.cpp subprocess or Ollama HTTP |

### TTS Providers (where speech audio is synthesized)

| Provider | JS SDK | Electron | Unity | Unreal |
| --- | --- | --- | --- | --- |
| **Server** | Audio streams inline with chat response | Audio streams inline with chat response | Audio streams inline with chat response | Audio streams inline with chat response |
| **Browser** | Kokoro WASM (tts.rocks) + Web Speech API fallback | — | — | — |
| **Local** | — | Piper via `electronAPI.aiTTS` | Sherpa-ONNX (Piper/VITS ONNX models) | Runtime Text To Speech plugin (Piper/Kokoro ONNX) |
| **None** | Disabled | Disabled | Disabled | Disabled |

### STT Providers (where player voice is transcribed)

| Provider | JS SDK | Electron | Unity | Unreal |
| --- | --- | --- | --- | --- |
| **Server** | Audio uploaded to server for transcription | Audio uploaded to server for transcription | Audio uploaded to server for transcription | Audio uploaded to server for transcription |
| **Browser** | Web Speech API (`webkitSpeechRecognition`) | — | — | — |
| **Local** | — | Whisper via `electronAPI.aiSTT` | Sherpa-ONNX (Zipformer/Whisper ONNX models) | Not yet implemented |
| **None** | Disabled | Disabled | Disabled | Disabled |

## Full Platform Comparison

| | JS SDK (Web) | JS SDK (Electron) | Unity | Unreal |
| --- | --- | --- | --- | --- |
| **In-process LLM** | WebLLM (WebGPU) | node-llama-cpp via IPC | LLMUnity (llama.cpp native) | Subprocess llama.cpp (via `LocalModelPath`) |
| **External server** | N/A | N/A | Ollama/llama.cpp HTTP (fallback) | Ollama/llama.cpp HTTP (via `LocalLLMServerURL`) |
| **No server needed** | Yes | Yes | Yes (with LLMUnity) | Yes (with GGUF model file) |
| **Local TTS** | Kokoro WASM | Piper via `electronAPI.aiTTS` | Sherpa-ONNX (Piper ONNX) | Runtime TTS plugin (Piper ONNX) |
| **Local STT** | Web Speech API | Whisper via `electronAPI.aiSTT` | Sherpa-ONNX (Zipformer) | Not yet implemented |
| **Provider config** | `chat: 'browser'` | `chat: 'local'` | `chatProvider: Local` | `ChatProvider: Local` |
| **TTS config** | `tts: 'browser'` | `tts: 'local'` | `ttsProvider: Local` | `TTSProvider: Local` |
| **STT config** | `stt: 'browser'` | `stt: 'local'` | `sttProvider: Local` | `STTProvider: Local` |
| **Model format** | MLC-compiled (WebGPU) | GGUF | GGUF | GGUF |
| **Model location** | IndexedDB (auto-cached) | Bundled in app | `StreamingAssets/` | `Content/InsimulModels/` |
| **Voice models** | Kokoro (82MB, 100+ voices) | Piper ONNX | Piper/VITS ONNX | Piper/Kokoro ONNX |

## Configuration

### JS SDK (`@insimul/typescript`)

```typescript
import { InsimulClient } from '@insimul/typescript';

// Server mode (web game with Insimul server)
const client = new InsimulClient({
  chat: 'server', tts: 'server', stt: 'server',
  serverUrl: 'http://localhost:8080',
  worldId: 'my-world',
});

// Browser mode (standalone web, no server)
const client = new InsimulClient({
  chat: 'browser', tts: 'browser', stt: 'none',
  llmModel: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
});

// Electron mode (desktop export)
const client = new InsimulClient({
  chat: 'local', tts: 'local', stt: 'local',
});

// Auto-detect (Electron → local, WebGPU → browser, else → server)
const client = new InsimulClient();

// Common API
client.on({ onTextChunk, onAudioChunk, onFacialData, onComplete });
client.setCharacter(npcId, worldId);
await client.sendText("Hello!");
```

### Unreal Plugin

In `Config/DefaultGame.ini`:

```ini
[/Script/InsimulRuntime.InsimulSettings]
; Provider selection
ChatProvider=Server          ; Server or Local
TTSProvider=Server           ; Server, Local, or None
STTProvider=None             ; Server, Local, or None

; Server settings
ServerURL=http://localhost:8080
DefaultWorldID=default-world
bPreferWebSocket=true

; Local LLM settings (when ChatProvider=Local)
LocalModelPath=InsimulModels/mistral-7b.Q4_K_M.gguf    ; In-process (no server needed)
LocalLLMServerURL=http://localhost:11434/api/generate    ; External server (fallback)
LocalLLMModel=mistral
WorldDataPath=InsimulData/world_export.json
MaxTokens=256
Temperature=0.7

; Common
LanguageCode=en
```

Or configure in **Project Settings > Plugins > Insimul**.

### Unity Plugin

On the `InsimulManager` component in the Inspector:

| Field | Options | Default |
| --- | --- | --- |
| Chat Provider | Server, Local | Server |
| TTS Provider | Server, Local, None | Server |
| STT Provider | Server, Local, None | None |
| Server URL | string | `http://localhost:8080` |
| World ID | string | `default-world` |
| Local LLM Server URL | string | `http://localhost:11434/api/generate` |
| Local LLM Model | string | `mistral` |
| World Data Path | string (relative to StreamingAssets) | `InsimulData/world_export.json` |
| Max Tokens | 32–2048 | 256 |
| Temperature | 0.0–2.0 | 0.7 |
| Language Code | string | `en` |

For in-process LLM (no external server): install [LLMUnity](https://github.com/undreamai/LLMUnity) and drag an `LLMCharacter` component onto the `InsimulLocalProvider`'s `llmCharacter` field. The plugin detects it automatically.

For local TTS/STT: install [Sherpa-ONNX](https://openupm.com/packages/com.ponyudev.sherpa-onnx/) via OpenUPM and place model files in `StreamingAssets/InsimulModels/tts/` and `StreamingAssets/InsimulModels/stt/`.

### Godot Plugin

On the `InsimulClient` autoload node (added automatically when plugin is enabled):

| Field | Options | Default |
| --- | --- | --- |
| Chat Provider | Server, Local | Server |
| TTS Provider | Server, Local, None | Server |
| STT Provider | Server, Local, None | None |
| Server URL | string | `http://localhost:8080` |
| World ID | string | `default-world` |
| Local LLM Server URL | string | `http://localhost:11434/api/generate` |
| Local LLM Model | string | `mistral` |
| World Data Path | file path (res://) | `res://insimul_data/world_export.json` |
| Max Tokens | 32–2048 | 256 |
| Temperature | 0.0–2.0 | 0.7 |
| Language Code | string | `en` |

For in-process LLM (no external server): install [GDLlama](https://github.com/xarillian/GDLlama) from the Asset Library and assign the GDLlama node to the `InsimulLocalProvider`'s `gdllama_node` field. The plugin detects it automatically.

Place world export JSON at `res://insimul_data/world_export.json`.

## World Data Export

All plugins can load exported Insimul world data for offline/local mode. Export from a running server:

```bash
curl http://localhost:8080/api/conversation/export/YOUR_WORLD_ID > world_export.json
```

The JSON contains:
- `worldName`, `worldId` — metadata
- `characters[]` — name, gender, occupation, Big Five personality traits
- `dialogueContexts[]` — per-character system prompt, greeting, voice, knowledge (truths)

Place the file where your engine expects it:
- **JS SDK**: anywhere accessible via `fetch()` or `fs.readFile()`
- **Unreal**: `Content/InsimulData/world_export.json`
- **Unity**: `StreamingAssets/InsimulData/world_export.json`
- **Godot**: `res://insimul_data/world_export.json`

## Server Communication

When using server providers, all plugins communicate with the same Insimul server endpoints:

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/ws/conversation` | WebSocket | Primary streaming (text + audio + visemes) |
| `/api/conversation/stream` | POST (SSE) | Text input with streaming response |
| `/api/conversation/stream-audio` | POST (SSE) | Audio input (STT + LLM + TTS pipeline) |
| `/api/conversation/end` | POST | End session |
| `/api/conversation/health` | GET | Health check |
| `/api/conversation/export/{worldId}` | GET | Export world data for offline mode |
| `/api/worlds/{worldId}/characters` | GET | Fetch characters for spawner |

## Common Data Types

All plugins share equivalent data types for conversation events:

| Event | JS SDK Type | Unity Type | Unreal Type |
| --- | --- | --- | --- |
| Text chunk | `onTextChunk(text, isFinal)` | `InsimulTextChunk` | `FInsimulUtterance` |
| Audio chunk | `onAudioChunk(chunk)` | `InsimulAudioChunk` | `OnAudioChunkReceived` delegate |
| Facial data | `onFacialData(data)` | `InsimulFacialData` | `FInsimulFacialData` |
| Action trigger | `onActionTrigger(action)` | `InsimulActionTrigger` | `FInsimulActionTrigger` |
| Metadata | `onMetadata(type, content)` | `InsimulMetadataEvent` | — |
| Transcript | `onTranscript(text, isFinal)` | `InsimulTranscriptEvent` | — |
| Error | `onError(error)` | `InsimulErrorEvent` | — |

## Lip Sync

All plugins support viseme-based lip sync using the OVR 15-viseme standard:

`sil, PP, FF, TH, DD, kk, CH, SS, nn, RR, aa, E, ih, oh, ou`

- **JS SDK**: Visemes delivered via `onFacialData` callback
- **Unity**: `InsimulLipSync` component applies visemes to SkinnedMeshRenderer blend shapes
- **Unreal**: `InsimulFaceSync` component applies visemes to SkeletalMeshComponent morph targets

Both engine plugins support configurable viseme-to-blend-shape mapping, smooth interpolation with adjustable blend speed, and automatic fade-out when viseme data stops.
