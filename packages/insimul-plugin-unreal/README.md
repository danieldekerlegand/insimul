# Insimul Unreal Engine Plugin

Connect any NPC in your Unreal Engine project to the Insimul AI conversation service with streaming text, voice, and lip sync.

## Requirements

- Unreal Engine 5.3+
- C++ project (or Blueprints-only with plugin enabled)

## Installation

1. Copy the `insimul-plugin-unreal` folder into your project's `Plugins/` directory:
   ```
   YourProject/
     Plugins/
       insimul-plugin-unreal/
         Insimul.uplugin
         Source/
   ```
2. Regenerate project files (right-click `.uproject` → Generate Visual Studio/Xcode project files)
3. Build your project

## Configuration

Add your Insimul server settings to `Config/DefaultGame.ini`:

```ini
[/Script/Insimul.InsimulSubsystem]
ServerUrl=https://your-insimul-server.com
ApiKey=your-api-key-here
WorldId=your-world-id
LanguageCode=en
```

Or set them at runtime via Blueprint or C++:

```cpp
UInsimulSubsystem* Insimul = GetGameInstance()->GetSubsystem<UInsimulSubsystem>();
FInsimulConfig Config;
Config.ServerUrl = TEXT("https://your-insimul-server.com");
Config.ApiKey = TEXT("your-api-key");
Config.WorldId = TEXT("your-world-id");
Insimul->SetConfig(Config);
```

## Quick Start

### 1. Add Components to an NPC Actor

Add these components to any NPC Blueprint or C++ Actor:

| Component | Purpose |
|-----------|---------|
| `InsimulChatbotComponent` | Manages conversation lifecycle and streams text/audio/viseme responses |
| `InsimulAudioStreamer` | Plays back TTS audio chunks through an AudioComponent |
| `InsimulFaceSync` | Applies viseme data to SkeletalMesh morph targets for lip sync |

For the player character, optionally add:

| Component | Purpose |
|-----------|---------|
| `InsimulAudioCaptureComponent` | Captures microphone input for voice conversations |

### 2. Set the Character ID

In the Details panel of `InsimulChatbotComponent`, set the **Character ID** to the Insimul character this NPC represents.

### 3. Start a Conversation (Blueprint)

1. Call `StartConversation` on the `InsimulChatbotComponent`
2. Call `SendText` with the player's message
3. Bind to the `OnTextChunk` event to display streaming text
4. Bind to the `OnAudioChunk` event → forward chunks to `InsimulAudioStreamer.EnqueueChunk`
5. Bind to the `OnFacialData` event → forward to `InsimulFaceSync.ApplyVisemes`
6. Call `EndConversation` when done

### 4. Start a Conversation (C++)

```cpp
// In your interaction logic:
UInsimulChatbotComponent* Chat = NPC->FindComponentByClass<UInsimulChatbotComponent>();
Chat->CharacterId = TEXT("npc-baker-001");

// Bind events
Chat->OnTextChunk.AddDynamic(this, &AMyPlayerController::OnNPCTextReceived);
Chat->OnAudioChunk.AddDynamic(this, &AMyPlayerController::OnNPCAudioReceived);
Chat->OnFacialData.AddDynamic(this, &AMyPlayerController::OnNPCFacialData);

// Start and send
Chat->StartConversation();
Chat->SendText(TEXT("Hello, what bread do you have today?"));
```

## Components Reference

### UInsimulSubsystem

`UGameInstanceSubsystem` — automatically created, persists across level loads. Manages the shared HTTP client and server configuration.

**Key Functions:**
- `SetConfig(FInsimulConfig)` — Update server connection settings
- `GetHttpClient()` — Access the shared HTTP transport client
- `CreateSessionId()` — Generate a unique conversation session ID

### UInsimulChatbotComponent

`UActorComponent` — attach to any NPC for AI conversation.

**Properties (Details Panel):**
- `CharacterId` — Insimul character ID for this NPC
- `LanguageCode` — Language override (empty = use default)

**Blueprint Functions:**
- `StartConversation(SessionId)` — Start or resume a conversation
- `SendText(Text)` — Send player text input
- `SendAudio(AudioData)` — Send recorded audio input
- `EndConversation()` — End and clean up

**Blueprint Events:**
- `OnTextChunk` — Streaming text tokens
- `OnAudioChunk` — TTS audio chunks
- `OnFacialData` — Viseme data for lip sync
- `OnActionTrigger` — Server-triggered game actions
- `OnTranscript` — STT transcription result
- `OnStateChange` — Conversation state changes
- `OnError` — Error messages

### UInsimulAudioStreamer

`UActorComponent` — streaming TTS playback via AudioComponent.

**Properties:**
- `PreBufferChunks` — Chunks to buffer before playback starts (default: 3)
- `VolumeMultiplier` — Speech volume (default: 1.0)
- `bSpatialAudio` — Enable 3D spatial audio (default: true)
- `MaxAudibleDistance` — Max hearing distance in world units

**Functions:**
- `EnqueueChunk(AudioChunk)` — Add audio chunk to playback queue
- `StopPlayback()` — Stop and clear queue

### UInsimulFaceSync

`UActorComponent` — applies viseme data to SkeletalMesh morph targets.

**Properties:**
- `BlendSpeed` — Interpolation speed (default: 12.0)
- `TargetMeshComponentName` — Specific mesh to target (empty = auto-find)
- `VisemeToMorphTarget` — Map of viseme names → morph target names

**Functions:**
- `ApplyVisemes(FacialData)` — Apply viseme weights
- `ResetVisemes()` — Reset all morph targets to zero

Supports the 15 Oculus OVR visemes: `sil`, `PP`, `FF`, `TH`, `DD`, `kk`, `CH`, `SS`, `nn`, `RR`, `aa`, `E`, `ih`, `oh`, `ou`.

### UInsimulAudioCaptureComponent

`UActorComponent` — microphone capture for voice input.

**Functions:**
- `StartCapture()` — Begin recording from default microphone
- `StopCapture()` — Stop recording and return audio buffer
- `IsCapturing()` — Check recording state

## Architecture

The plugin uses HTTP/SSE transport (not native gRPC) for maximum compatibility. The flow is:

```
Player Input → InsimulChatbotComponent → HTTP POST → Insimul Server
                                                         ↓
InsimulFaceSync ← InsimulAudioStreamer ← SSE Stream ← Server Response
```

All HTTP requests run asynchronously via UE's HTTP module — no game thread blocking.

## License

Copyright Insimul. All Rights Reserved.
