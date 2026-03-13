# PRD: Living World & Real-Time Conversation Engine

## Introduction

Insimul's 3D game has solid foundational systems — procedural world generation, character creation with occupations and personalities, ambient conversations, a volition system, building interiors, and a shop panel — but NPCs currently stand idle. They don't walk to work, don't navigate between locations, don't animate beyond the player character, and conversations with them lack the immediacy and naturalness required for a language-learning game.

This PRD addresses the full stack of work needed to bring the world to life: a custom gRPC bidirectional streaming conversation microservice for near-zero-latency dialogue, a full voice pipeline (STT/TTS/lip sync) across all platforms, autonomous NPC behavior driven by Talk of the Town's personality/relationship simulation, NPC pathfinding and animation, building entry with interior scenes, language-integrated commerce, and simultaneous plugin SDKs for Babylon.js, Unreal, Unity, and Godot so that any game built with or exported from Insimul gets these capabilities out of the box.

---

## Goals

- Achieve sub-500ms first-token latency for NPC conversation responses via gRPC bidirectional streaming
- NPCs speak in the correct language for their world/character, with grammar-appropriate dialogue
- NPCs autonomously follow daily routines: wake up, commute to work, perform job activities, socialize, go home, sleep
- NPCs hold natural conversations with each other and with the player, driven by personality, relationships, mood, and context
- Full voice pipeline: player speaks (STT) → NPC responds with voice (TTS) + lip sync, across all export targets
- Buildings have collision walls; players enter via doors with a loading-screen transition to interior scenes
- Language-learning-integrated commerce: purchasing goods requires target-language interaction
- Simultaneous plugin SDKs (JS, Unreal, Unity, Godot) that connect to the Insimul conversation service
- All new systems propagate to exported games automatically

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Insimul Server                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Conversation Microservice (gRPC)             │   │
│  │  ┌────────┐  ┌─────────┐  ┌──────┐  ┌───────────┐   │   │
│  │  │ Router │→ │ LLM     │→ │ TTS  │→ │ Audio     │   │   │
│  │  │        │  │ Provider│  │Engine│  │ Streamer  │   │   │
│  │  └────────┘  └─────────┘  └──────┘  └───────────┘   │   │
│  │  ┌────────┐  ┌─────────┐  ┌──────┐                  │   │
│  │  │ STT    │  │ Context │  │ NPC  │                  │   │
│  │  │ Engine │  │ Manager │  │Memory│                  │   │
│  │  └────────┘  └─────────┘  └──────┘                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────┐  ┌───────────────┐                    │
│  │  NPC Behavior    │  │  World State  │                    │
│  │  Simulation      │  │  Manager      │                    │
│  └──────────────────┘  └───────────────┘                    │
└─────────────────────────────────────────────────────────────┘
          │ gRPC (protobuf)          │ REST/WS
    ┌─────┴─────┬──────────┬─────────┴───┐
    │           │          │             │
┌───┴───┐  ┌───┴───┐  ┌───┴───┐  ┌──────┴──┐
│ JS/   │  │Unreal │  │ Unity │  │  Godot  │
│Babylon│  │Plugin │  │Plugin │  │  Plugin │
│ SDK   │  │       │  │       │  │         │
└───────┘  └───────┘  └───────┘  └─────────┘
```

---

## User Stories

### Phase 1: Conversation Microservice & Streaming

---

### US-001: gRPC Service Definition & Protobuf Schema
**Description:** As a developer, I need protobuf service definitions for the conversation microservice so that all clients (JS, Unreal, Unity, Godot) share a single contract.

**Acceptance Criteria:**
- [ ] Create `proto/conversation.proto` with service `InsimulConversation`
- [ ] Define `ConversationStream` RPC: bidirectional streaming (`stream ConversationRequest` ↔ `stream ConversationResponse`)
- [ ] `ConversationRequest` message supports: `oneof input { TextInput text = 1; AudioChunk audio = 2; SystemCommand command = 3; }`
- [ ] `TextInput` includes: `string text`, `string session_id`, `string character_id`, `string language_code`
- [ ] `AudioChunk` includes: `bytes data`, `string encoding` (opus/pcm), `int32 sample_rate`, `string session_id`, `string character_id`
- [ ] `ConversationResponse` message supports: `oneof output { TextChunk text = 1; AudioChunk audio = 2; FacialData facial = 3; ActionTrigger action = 4; ConversationMeta meta = 5; }`
- [ ] `TextChunk` includes: `string text`, `bool is_final`, `string language_code`, `string session_id`
- [ ] `AudioChunk` response includes: `bytes data`, `string encoding`, `int32 sample_rate`, `float duration_ms`
- [ ] `FacialData` includes: `repeated Viseme visemes`, `float timestamp`; `Viseme` has `string phoneme`, `float weight`, `float duration_ms`
- [ ] `ActionTrigger` includes: `string action_type`, `string target_id`, `map<string, string> parameters`
- [ ] `ConversationMeta` includes: `string session_id`, `ConversationState state` (enum: STARTED, ACTIVE, ENDED, ERROR), `repeated string active_topics`
- [ ] Define `NpcToNpcStream` RPC for autonomous NPC-NPC conversations
- [ ] Compile protobuf to TypeScript, C++ (Unreal), C# (Unity), GDScript stubs (Godot)
- [ ] Typecheck passes

---

### US-002: gRPC Server Implementation
**Description:** As a developer, I need a gRPC server that handles bidirectional conversation streams so that clients get sub-500ms first-token responses.

**Acceptance Criteria:**
- [ ] Create `server/services/conversation/grpc-server.ts` using `@grpc/grpc-js`
- [ ] Server listens on configurable port (default 50051), separate from Express HTTP server
- [ ] Implement `ConversationStream` handler: receives client audio/text, streams back text chunks + audio chunks + facial data
- [ ] Text response chunks stream as they arrive from LLM (token-by-token), not buffered until complete
- [ ] Audio chunks stream sentence-by-sentence (TTS generates audio per sentence boundary, streams immediately)
- [ ] Facial/viseme data streams alongside corresponding audio chunks
- [ ] Session management: create/resume/end conversation sessions with persistent context
- [ ] Concurrent session support: server handles 50+ simultaneous conversation streams
- [ ] Graceful stream termination on client disconnect
- [ ] Health check endpoint for monitoring
- [ ] Typecheck passes
- [ ] Unit test: mock LLM provider, verify streaming chunked responses arrive incrementally
- [ ] Latency test: first text token arrives within 500ms of request (with mock LLM)

---

### US-003: LLM Provider Interface & Gemini Implementation
**Description:** As a developer, I need a pluggable LLM provider interface so that the conversation service can use Gemini (default) or swap to other providers.

**Acceptance Criteria:**
- [ ] Create `server/services/conversation/providers/llm-provider.ts` with `ILLMProvider` interface
- [ ] Interface methods: `streamCompletion(prompt, context, options) → AsyncIterable<string>`, `getModelInfo() → ModelInfo`
- [ ] `options` includes: `temperature`, `maxTokens`, `languageCode`, `characterPersonality`, `conversationHistory`
- [ ] Create `server/services/conversation/providers/gemini-provider.ts` implementing `ILLMProvider`
- [ ] Gemini provider uses streaming API (`generateContentStream`) for token-by-token delivery
- [ ] Context window includes: character personality (Big Five), occupation, relationships, current emotional state, location, world lore, language requirements
- [ ] System prompt enforces target language for language-learning worlds (e.g., NPC responds in French with difficulty-appropriate vocabulary)
- [ ] System prompt includes character's knowledge, opinions, and conversation style derived from personality traits
- [ ] Provider registry: `registerProvider(name, factory)`, `getProvider(name) → ILLMProvider`
- [ ] Configuration via environment variables: `LLM_PROVIDER=gemini`, `GEMINI_API_KEY`, etc.
- [ ] Typecheck passes
- [ ] Unit test: Gemini provider streams tokens, provider registry resolves correctly

---

### US-004: Conversation Context Manager
**Description:** As a developer, I need a context manager that builds rich NPC conversation context from world state so that NPCs respond in-character with world-appropriate knowledge.

**Acceptance Criteria:**
- [ ] Create `server/services/conversation/context-manager.ts`
- [ ] `buildContext(characterId, playerId, worldId, sessionId)` returns full conversation context
- [ ] Context includes: character name, personality traits (Big Five values), occupation & workplace, family relationships, romantic status, friendships/enemies, current emotional state (from TemporaryStateSystem), current location, time of day
- [ ] Context includes world-level data: world name, era, language(s), cultural setting, recent world events (truths)
- [ ] Context includes conversation history: last 20 messages from this session, summary of previous sessions with this NPC
- [ ] Context includes relationship with player: friendship level, romance stage, trust level, previous conversation topics
- [ ] Context includes language-learning directives: target language, player proficiency level, vocabulary they've learned, grammar patterns to practice
- [ ] Context includes NPC's knowledge: what they know about other NPCs (mental models), gossip they've heard, events they've witnessed
- [ ] Context serializes to <4000 tokens to leave room for LLM generation
- [ ] Typecheck passes
- [ ] Unit test: context builder produces correct structure from mock world data

---

### US-005: NPC-to-NPC Conversation Engine
**Description:** As a developer, I need NPCs to hold autonomous conversations with each other so that the world feels alive and players can overhear contextual dialogue.

**Acceptance Criteria:**
- [ ] Create `server/services/conversation/npc-conversation-engine.ts`
- [ ] `initiateConversation(npc1Id, npc2Id, worldId, topic?)` starts an NPC-NPC conversation
- [ ] Topic selection driven by: shared location context, relationship history, personality compatibility, recent events, occupation overlap
- [ ] Conversation uses LLM with both NPC personalities in the system prompt (alternating speakers)
- [ ] Conversations run 3-8 exchanges based on personality (extroverts talk longer)
- [ ] NPCs speak in the world's language(s), not necessarily the player's language
- [ ] Conversation results update relationship values, exchange gossip/knowledge between NPCs
- [ ] Conversations emit events to GameEventBus: `ambient_conversation_started`, `ambient_conversation_ended`, individual dialogue lines
- [ ] If player is within overhearing range, conversation text streams to client with vocabulary highlighting
- [ ] NPC-NPC conversations respect personality: introverts initiate less, agreeable NPCs avoid conflict topics, neurotic NPCs bring up worries
- [ ] Rate limiting: max 3 concurrent NPC-NPC conversations per world to manage LLM costs
- [ ] Fallback to template-based conversations (existing AmbientConversationSystem) when LLM is unavailable or rate-limited
- [ ] Typecheck passes
- [ ] Unit test: conversation respects personality weights, topic selection, exchange count

---

### Phase 2: Voice Pipeline (STT / TTS / Lip Sync)

---

### US-006: Speech-to-Text Integration
**Description:** As a player, I want to speak to NPCs using my microphone so that conversation feels natural, especially for language-learning pronunciation practice.

**Acceptance Criteria:**
- [ ] Create `server/services/conversation/stt/stt-provider.ts` with `ISTTProvider` interface
- [ ] Interface: `streamTranscription(audioStream) → AsyncIterable<TranscriptionResult>`
- [ ] `TranscriptionResult` includes: `text`, `isFinal`, `confidence`, `languageDetected`, `wordTimestamps[]`
- [ ] Create Google Cloud Speech-to-Text provider (or Whisper provider) as default implementation
- [ ] Streaming transcription: partial results arrive as player speaks (not waiting for silence)
- [ ] Language detection: auto-detect player's language or use configured target language
- [ ] Pronunciation scoring: compare player utterance against expected pronunciation, return accuracy score
- [ ] Client-side audio capture: use MediaRecorder API (browser), platform audio APIs (Unreal/Unity/Godot)
- [ ] Audio encoding: Opus for streaming (low bandwidth), PCM fallback
- [ ] Push-to-talk and voice-activity-detection (VAD) modes
- [ ] Silence detection: auto-end recording after 2s of silence (configurable)
- [ ] Typecheck passes
- [ ] Integration test: record audio, stream to STT, receive transcription

---

### US-007: Text-to-Speech Integration
**Description:** As a player, I want NPCs to speak their dialogue aloud so that I can hear correct pronunciation and the world feels immersive.

**Acceptance Criteria:**
- [ ] Create `server/services/conversation/tts/tts-provider.ts` with `ITTSProvider` interface
- [ ] Interface: `synthesize(text, voice, options) → AsyncIterable<AudioChunk>`
- [ ] `options` includes: `languageCode`, `speakingRate`, `pitch`, `encoding` (opus/mp3/pcm)
- [ ] Create Google Cloud TTS provider (or alternative) as default implementation
- [ ] Streaming synthesis: audio chunks stream sentence-by-sentence as LLM text arrives (don't wait for full response)
- [ ] Sentence boundary detection: split LLM output at sentence boundaries (`.`, `!`, `?`, `;`) for TTS pipelining
- [ ] Voice assignment: each NPC gets a consistent voice based on character attributes (gender, age, personality)
- [ ] Voice variety: minimum 8 distinct voice profiles (4 male, 4 female) mapped by personality archetype
- [ ] Language-correct voices: TTS uses voices native to the world's language (French voice for French NPCs, etc.)
- [ ] Audio format: Opus encoding for streaming (low latency), MP3 for caching
- [ ] Audio caching: cache frequently-used phrases (greetings, merchant lines) to reduce TTS calls
- [ ] Volume normalization across different TTS voices
- [ ] Typecheck passes
- [ ] Integration test: text input produces streaming audio chunks

---

### US-008: Lip Sync & Viseme Generation
**Description:** As a player, I want NPC mouths to move when they speak so that conversations feel realistic.

**Acceptance Criteria:**
- [ ] Create `server/services/conversation/viseme/viseme-generator.ts`
- [ ] Generate viseme data from TTS audio or text input
- [ ] Support Oculus OVR viseme format (15 visemes: sil, PP, FF, TH, DD, kk, CH, SS, nn, RR, aa, E, ih, oh, ou)
- [ ] Viseme timing synchronized with audio chunk timestamps
- [ ] Stream viseme data alongside audio chunks in gRPC response
- [ ] Client-side `LipSyncController` in Babylon.js: apply viseme weights to character face mesh morph targets
- [ ] Graceful fallback: simple open/close mouth animation when full viseme data unavailable
- [ ] Configurable quality: full viseme (15 phonemes), simplified (5 basic mouth shapes), or disabled
- [ ] Typecheck passes
- [ ] Visual test: NPC mouth moves in sync with audio playback

---

### US-009: Client-Side Audio Playback System
**Description:** As a developer, I need a robust audio playback system that handles streaming audio chunks with minimal latency and correct ordering.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/StreamingAudioPlayer.ts`
- [ ] Receives audio chunks from gRPC stream, decodes, and queues for playback
- [ ] Uses Web Audio API (AudioContext, AudioBufferSourceNode) for low-latency playback
- [ ] Buffer management: pre-buffer 2-3 chunks before starting playback to prevent stuttering
- [ ] Seamless chunk concatenation: no audible gaps between audio chunks
- [ ] Spatial audio: NPC voice volume attenuates with distance from player
- [ ] Interrupt handling: stop current audio when new conversation starts or player walks away
- [ ] Audio ducking: reduce ambient/music volume during NPC speech
- [ ] Playback state events: `onStart`, `onChunkPlayed`, `onComplete` for UI synchronization
- [ ] Support for concurrent audio: multiple NPCs can speak simultaneously (ambient conversations)
- [ ] Typecheck passes
- [ ] Manual test: streaming audio plays smoothly without gaps or pops

---

### Phase 3: NPC Autonomous Behavior & Daily Life

---

### US-010: Navigation Mesh & Pathfinding System
**Description:** As a developer, I need a navigation mesh and pathfinding system so that NPCs can walk between locations in the world.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/NavigationSystem.ts`
- [ ] Generate navigation mesh from world terrain and building footprints at world load time
- [ ] NavMesh excludes: building interiors (solid walls), water bodies, impassable terrain, fence/wall obstacles
- [ ] NavMesh includes: roads, paths, open ground, building doorway entry points
- [ ] Implement A* pathfinding on the navigation mesh
- [ ] Path smoothing: remove unnecessary waypoints for natural-looking movement
- [ ] `findPath(startPos, endPos) → Vector3[]` returns waypoint array
- [ ] `getReachableLocations(fromPos, maxDistance) → Location[]` for NPC decision-making
- [ ] Dynamic obstacle avoidance: NPCs steer around other NPCs and the player
- [ ] Path invalidation: recalculate if obstacle appears on current path
- [ ] Performance: pathfinding for 50 NPCs completes within 16ms frame budget
- [ ] Debug visualization: toggle-able navmesh overlay and path lines
- [ ] Typecheck passes
- [ ] Unit test: pathfinding finds valid routes between known locations, avoids buildings

---

### US-011: NPC Movement Controller
**Description:** As a developer, I need NPCs to physically walk along paths so that their movement looks natural.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/NPCMovementController.ts`
- [ ] `moveTo(targetPosition, speed?, callback?)` initiates movement along pathfinding route
- [ ] Walking speed varies by urgency: stroll (1.5 m/s), walk (3 m/s), hurry (5 m/s)
- [ ] NPCs rotate to face movement direction with smooth turning (not snapping)
- [ ] Animation integration: play walk/run animation during movement, idle when stopped
- [ ] Arrival detection: trigger callback when NPC reaches destination (within 0.5m tolerance)
- [ ] Queue system: NPCs can queue movement commands (walk to bakery, then walk to counter)
- [ ] Interrupt support: new `moveTo` cancels current movement and reroutes
- [ ] Collision avoidance: NPCs don't walk through each other or through the player
- [ ] NPC stops and faces player when player initiates conversation
- [ ] Typecheck passes
- [ ] Visual test: NPCs walk naturally between buildings

---

### US-012: Daily Schedule Execution Engine
**Description:** As a developer, I need the existing routine system to drive actual NPC movement so that NPCs follow their daily schedules.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/ScheduleExecutor.ts`
- [ ] Reads NPC routine data (from routine-system.ts TimeBlocks) and converts to movement commands
- [ ] Time-of-day system: world has a configurable day/night cycle (default: 1 real minute = 1 game hour)
- [ ] Schedule phases: sleep (22:00-06:00), morning routine (06:00-07:00), commute to work (07:00-08:00), work (08:00-17:00), commute home (17:00-18:00), evening leisure (18:00-22:00)
- [ ] Personality-modified schedules: early risers (high conscientiousness) wake at 05:00, night owls (low conscientiousness) stay out until 23:00
- [ ] NPCs walk to correct location at each schedule transition (uses NPCMovementController)
- [ ] Work-shift awareness: day-shift NPCs work 08:00-17:00, night-shift NPCs work 20:00-05:00
- [ ] Weekend/rest-day variation: NPCs visit leisure locations (tavern, park, market) on rest days
- [ ] NPCs who work at the same location arrive and leave at similar times (coworker grouping)
- [ ] Interruption handling: if player talks to NPC during commute, NPC pauses schedule until conversation ends, then resumes
- [ ] Schedule catch-up: if NPC is late (from conversation interruption), skip to current phase rather than replaying all phases
- [ ] Typecheck passes
- [ ] Visual test: NPCs wake up, walk to work, work, walk home over a game day

---

### US-013: Occupation Activity System
**Description:** As a developer, I need NPCs to perform visible work activities at their job sites so that the world feels economically alive.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/OccupationActivitySystem.ts`
- [ ] Map occupation types to activity behaviors:
  - Baker: stand behind counter, knead dough animation, interact with oven
  - Bartender: stand behind bar, serve drinks, wipe counter
  - Blacksmith: stand at anvil, hammer animation, tend forge
  - Farmer: walk between crop rows, tend crops, carry harvest
  - Doctor/Nurse: stand in hospital, examine patients, write notes
  - Shopkeeper: stand behind counter, arrange goods, greet customers
  - Teacher: stand at front of classroom, gesture while teaching
  - Guard: patrol between waypoints, stand at post
  - Generic Worker: stand at workstation, idle work animation
- [ ] Activity cycle: NPCs rotate between 2-3 work activities (e.g., baker: knead → check oven → serve customer → knead)
- [ ] Activity duration: each activity lasts 30-120 game-minutes before switching
- [ ] Break behavior: NPCs take 1-2 breaks during work shift (sit, eat, chat with coworker)
- [ ] Customer interaction: shopkeeper NPCs can be interrupted by player for commerce
- [ ] Typecheck passes
- [ ] Visual test: baker NPC visibly works at bakery during work hours

---

### US-014: Jobsite Validation & Auto-Generation
**Description:** As a developer, I need the world generator to ensure every NPC with a job has a corresponding workplace building so that schedules don't break.

**Acceptance Criteria:**
- [ ] Create validation in world generation pipeline: after character creation, verify each NPC's `currentOccupationId` → `occupation.businessId` → `business.lotId` → lot has a building
- [ ] If an NPC has an occupation but no corresponding business exists, auto-generate the business and building
- [ ] Business-to-building-type mapping: Bakery → bakery building, LawFirm → office building, Restaurant → restaurant building, Hospital → hospital building, etc.
- [ ] Auto-generated buildings placed on available lots (or new lots created if none available)
- [ ] Validation report: log warnings for any NPC-occupation-business-building chain that's broken
- [ ] Expose validation endpoint: `GET /api/worlds/:worldId/validate/occupations` returns chain status
- [ ] Typecheck passes
- [ ] Unit test: world with 20 employed NPCs validates all chains; deliberately broken chain triggers auto-generation

---

### US-015: NPC Socialization Behavior
**Description:** As a developer, I need NPCs to autonomously socialize with each other based on personality and relationships so that the world has emergent social dynamics.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/NPCSocializationController.ts`
- [ ] NPCs at the same location evaluate socialization opportunities every 5 game-minutes
- [ ] Socialization probability based on: personality (extroversion), relationship (friends more likely), mood (happy → more social), time of day (evening → more social)
- [ ] When socializing: NPCs walk toward each other, face each other, play conversation animation
- [ ] Trigger NPC-NPC conversation (US-005) when socialization starts
- [ ] Conversation duration: 1-5 game-minutes based on personality match and relationship
- [ ] Post-conversation: relationship values update (friendship, trust, romance spark if applicable)
- [ ] Gossip propagation: information learned in conversation spreads to future conversations
- [ ] Personality-driven behavior: introverts seek quiet corners, extroverts gather in groups, agreeable NPCs approach strangers, neurotic NPCs avoid crowds
- [ ] Group conversations: 3-4 NPCs can form a conversation circle (less common, higher extroversion threshold)
- [ ] Typecheck passes
- [ ] Visual test: NPCs at tavern naturally pair up and converse during evening hours

---

### US-016: TotT-Style Dynamic Decision Making
**Description:** As a developer, I need NPCs to make dynamic decisions influenced by personality, relationships, and events rather than following rigid schedules.

**Acceptance Criteria:**
- [ ] Enhance `VolitionSystem.ts` with Ensemble-style action grammar hierarchy
- [ ] Action categories: `start` (high-level goals) → `non-terminal` (strategies) → `terminal` (concrete actions)
- [ ] Example hierarchy: `be_social` (start) → `find_friend` (non-terminal) → `walk_to_tavern` + `greet_friend` (terminal)
- [ ] Each terminal action has personality affinities (existing softmax system)
- [ ] Situational modifiers: weather (stay inside if raining), health (rest if injured/exhausted), emotional state (avoid social if angry), recent events (attend funeral if friend died)
- [ ] Schedule override: NPCs deviate from routine when high-priority volition fires (e.g., angry NPC confronts rival instead of going to work)
- [ ] Return-to-schedule: after volition-driven detour, NPC resumes normal schedule
- [ ] Event-driven reactions: NPC witnesses fight → fear state → flee or intervene based on personality
- [ ] Goal persistence: unfinished goals carry to next evaluation cycle (NPC who couldn't find friend tries again later)
- [ ] Typecheck passes
- [ ] Unit test: high-neuroticism NPC chooses different actions than low-neuroticism NPC given same situation

---

### Phase 4: Animation System

---

### US-017: NPC Animation Controller
**Description:** As a developer, I need an animation controller for NPCs so that they visually perform actions beyond walking.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/NPCAnimationController.ts`
- [ ] Manages animation state machine for each NPC mesh
- [ ] Animation states: idle, walk, run, talk, listen, work, sit, eat, drink, wave, bow, angry_gesture, laugh, cry, sleep, carry_item
- [ ] Smooth blending between animation states (crossfade over 0.2-0.5 seconds)
- [ ] Animation speed scaling: walk animation speed matches NPC movement speed
- [ ] Idle variation: NPCs don't all idle identically (weight-shift, look-around, stretch sub-animations on random timer)
- [ ] Directional facing: NPC faces conversation partner during dialogue
- [ ] Upper/lower body split: NPC can talk (upper body) while walking (lower body)
- [ ] Animation events: callback system for animation milestones (e.g., "hand reaches counter" for placing item)
- [ ] Typecheck passes

---

### US-018: Animation Asset Pipeline
**Description:** As a developer, I need a pipeline for loading and managing NPC animations so that characters have varied, natural movement.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/AnimationAssetManager.ts`
- [ ] Define animation manifest: JSON mapping animation names to asset paths and metadata
- [ ] Support Mixamo animation import (industry-standard free animation library)
- [ ] Animation retargeting: apply animations from standard skeleton to character meshes with different proportions
- [ ] Lazy loading: animations load on first use, not at world start (reduce initial load time)
- [ ] Animation sharing: same animation data shared across NPCs with same skeleton type
- [ ] Fallback animations: if specific animation missing, fall back to category default (e.g., missing "knead_dough" → use generic "work_standing")
- [ ] Minimum animation set for MVP:
  - Locomotion: idle, walk, run, turn_left, turn_right (existing)
  - Social: talk, listen, wave, bow, handshake, laugh, nod
  - Work: work_standing, work_sitting, carry, hammer, sweep, pour, write
  - Daily: sit, eat, drink, sleep, stretch, yawn
  - Emotional: angry_gesture, cry, celebrate, shrug, point
- [ ] Typecheck passes

---

### Phase 5: Buildings, Collision & Interiors

---

### US-019: Building Collision System
**Description:** As a player, I expect that I can't walk through building walls and must use doors to enter.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/BuildingCollisionSystem.ts`
- [ ] Generate collision meshes for all building walls (simplified box colliders, not visual mesh)
- [ ] Collision meshes generated at building creation time (ProceduralBuildingGenerator)
- [ ] Door openings: collision mesh has gaps at door positions (one door per building minimum)
- [ ] Player character blocked by wall colliders (Babylon.js physics or mesh intersection)
- [ ] NPC characters also blocked by wall colliders (prevent NPCs walking through buildings)
- [ ] Performance: collision uses simplified geometry (boxes), not full building mesh
- [ ] Fence/wall colliders for property boundaries where applicable
- [ ] Collision layer: buildings on dedicated collision group so raycasts can distinguish building hits
- [ ] Typecheck passes
- [ ] Visual test: player cannot walk through any building wall; can approach and enter via door

---

### US-020: Building Entry & Interior Loading
**Description:** As a player, I want to enter buildings through doors and see their interiors loaded as separate scenes.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/BuildingEntrySystem.ts`
- [ ] Door interaction: when player is within 2m of a building door, show "Enter [Building Name]" prompt
- [ ] Entry trigger: player presses interaction key (E) or clicks prompt to enter
- [ ] Loading transition: fade-to-black (0.5s) → load interior scene → fade-from-black (0.5s)
- [ ] Interior scene: uses existing `BuildingInteriorGenerator` to create room at offset Y position
- [ ] Player spawns at interior door position facing into the room
- [ ] Interior NPCs: spawn any NPCs whose schedule places them in this building at current time
- [ ] Interior NPCs positioned at appropriate locations (shopkeeper behind counter, bartender behind bar)
- [ ] Exit: door inside interior returns player to overworld at the building's exterior door position
- [ ] Camera transition: smooth camera repositioning during entry/exit
- [ ] UI indicator: show current building name in corner while inside
- [ ] Overworld state: freeze/pause NPC movement in overworld while player is in interior (performance)
- [ ] Typecheck passes
- [ ] Visual test: player walks to bakery door, presses E, sees loading fade, appears inside bakery with baker NPC

---

### US-021: Interior NPC Placement & Behavior
**Description:** As a developer, I need NPCs to be correctly placed and behaving inside buildings when the player enters.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/InteriorNPCManager.ts`
- [ ] When interior loads, query which NPCs should be present based on: occupation (employees during work hours), ownership (owner during business hours), routine (visitors based on schedule)
- [ ] Position NPCs at role-appropriate furniture: shopkeeper → behind counter, bartender → behind bar, patron → at table, resident → in living area
- [ ] NPCs inside buildings perform occupation activities (from US-013)
- [ ] Player can initiate conversation with interior NPCs (same chat system)
- [ ] Interior NPCs react to player entry: shopkeeper greets, bartender asks what you'd like, resident may be surprised
- [ ] NPC count per interior: cap at 6 NPCs for performance (prioritize employees, then visitors by relationship to player)
- [ ] Typecheck passes
- [ ] Visual test: entering tavern shows bartender behind bar and 2-3 patron NPCs at tables

---

### Phase 6: Commerce & Language-Integrated Trading

---

### US-022: Merchant NPC Binding & Inventory Generation
**Description:** As a developer, I need merchant NPCs to have auto-generated inventories based on their business type so that shops are stocked and functional.

**Acceptance Criteria:**
- [ ] Create `server/services/merchant-inventory.ts`
- [ ] Map business types to inventory categories:
  - Bakery: bread, pastries, flour, sugar (food items)
  - Blacksmith: tools, weapons, armor, metal ingots (weapon/tool/material items)
  - General Store: mixed consumables, tools, materials
  - Tavern/Inn: drinks, food, room rental (service)
  - Apothecary: potions, herbs, medicines (consumable items)
  - Clothier/Tailor: clothing, fabric (armor/material items)
  - Bookshop: books, scrolls (collectible items)
  - Market stall: fruits, vegetables, spices (food items)
- [ ] Auto-generate merchant inventory when world is created (8-15 items per merchant based on type)
- [ ] Item names and descriptions generated in world's language if language-learning world
- [ ] Price variation: ±20% from base price, influenced by merchant personality (agreeable → lower prices)
- [ ] Inventory refresh: merchants restock daily (game-time) with slight variation
- [ ] Merchant gold reserve: merchants have finite gold (200-1000 based on business size)
- [ ] Typecheck passes
- [ ] Unit test: bakery merchant gets food items, blacksmith gets weapons/tools

---

### US-023: Language-Integrated Purchase Flow
**Description:** As a player learning a language, I want purchasing items to require target-language interaction so that commerce reinforces vocabulary.

**Acceptance Criteria:**
- [ ] Enhance `BabylonShopPanel.ts` with language-learning mode
- [ ] When player approaches merchant, NPC greets in target language: "Bonjour! Qu'est-ce que vous désirez?"
- [ ] Item names displayed in target language with native-language tooltip on hover
- [ ] Purchase flow options:
  - **Beginner**: point-and-click purchase with vocabulary display ("You bought 'pain' (bread)")
  - **Intermediate**: player must type item name in target language to purchase (with fuzzy matching, accept minor spelling errors)
  - **Advanced**: full conversational purchase — player must ask for item in target language, negotiate if applicable
- [ ] Difficulty auto-scales based on player's tracked proficiency level
- [ ] Pronunciation practice: player can click item name to hear correct pronunciation (TTS)
- [ ] Vocabulary tracking: purchased items added to player's "learned vocabulary" list
- [ ] Price display: numbers shown in target language for intermediate+ (e.g., "vingt pièces d'or")
- [ ] Merchant responds in target language with contextual phrases ("Voilà!", "Merci!", "Vous n'avez pas assez d'or")
- [ ] Transaction summary in both languages for reinforcement
- [ ] Typecheck passes
- [ ] Visual test: player buys bread from French bakery using French vocabulary

---

### US-024: Basic Buy/Sell Transaction System
**Description:** As a player, I want to buy items from and sell items to merchant NPCs with a functional economy.

**Acceptance Criteria:**
- [ ] Enhance shop panel with proper transaction flow:
  - Player gold tracked and displayed
  - Merchant gold reserve tracked (merchants can run out of gold to buy player items)
  - Buy: player pays item price, item added to inventory, merchant gold increases
  - Sell: player receives sell price (50% of base by default), item removed from inventory, merchant gold decreases
- [ ] Sell price modifier: merchant personality affects sell multiplier (agreeable merchants pay more)
- [ ] Item rarity affects price: common (1x), uncommon (3x), rare (10x), epic (50x), legendary (200x)
- [ ] Quantity support: buy/sell multiple stackable items at once
- [ ] Transaction history: recent purchases/sales shown in panel
- [ ] Insufficient funds handling: gray out items player can't afford, show "not enough gold" message
- [ ] Merchant refuses items they don't deal in (blacksmith won't buy food)
- [ ] Typecheck passes
- [ ] Visual test: complete buy and sell transactions with gold updating correctly

---

### Phase 7: Plugin SDKs

---

### US-025: Insimul JavaScript/TypeScript SDK
**Description:** As a web game developer, I want a JS SDK that connects to the Insimul conversation service so I can add AI NPCs to any web game.

**Acceptance Criteria:**
- [ ] Create `packages/insimul-sdk-js/` as a standalone npm package
- [ ] `InsimulClient` class: connects to Insimul gRPC-Web endpoint (gRPC over HTTP/2 for browser compatibility)
- [ ] Methods: `startConversation(characterId, options)`, `sendText(text)`, `sendAudio(audioChunk)`, `endConversation()`
- [ ] Event callbacks: `onTextChunk(callback)`, `onAudioChunk(callback)`, `onVisemeData(callback)`, `onActionTrigger(callback)`, `onError(callback)`
- [ ] Session management: automatic session ID tracking, resume after disconnect
- [ ] Audio utilities: `startMicCapture()`, `stopMicCapture()` with Opus encoding
- [ ] Audio playback: `StreamingAudioPlayer` class for chunk-based playback (Web Audio API)
- [ ] Authentication: API key based auth with world ID scoping
- [ ] TypeScript types: full type definitions for all events and options
- [ ] Bundle size: < 50KB minified+gzipped (excluding protobuf runtime)
- [ ] Works in: Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] README with quickstart guide and code examples
- [ ] Typecheck passes
- [ ] Unit test: mock gRPC connection, verify event callbacks fire correctly
- [ ] Published to npm as `@insimul/sdk`

---

### US-026: Insimul Unreal Engine Plugin
**Description:** As an Unreal developer, I want a plugin that connects to the Insimul conversation service so I can add AI NPCs to my Unreal game.

**Acceptance Criteria:**
- [ ] Create `packages/insimul-plugin-unreal/` with standard UE plugin structure
- [ ] `UInsimulSubsystem` (GameInstanceSubsystem): manages connection to Insimul gRPC server
- [ ] `UInsimulChatbotComponent` (ActorComponent): attach to any NPC actor for conversation capability
- [ ] gRPC client: bidirectional streaming using UE's async task system (no main thread blocking)
- [ ] Audio capture: `UInsimulAudioCaptureComponent` wraps platform microphone APIs
- [ ] Audio playback: `UInsimulAudioStreamer` for streaming TTS playback via UAudioComponent
- [ ] Lip sync: `UInsimulFaceSync` applies viseme data to morph targets on skeletal mesh
- [ ] Blueprint support: all key functions exposed as BlueprintCallable/BlueprintAssignable
- [ ] Configuration: API key, server URL, character IDs configurable via editor details panel
- [ ] Multiplayer-ready: conversations are per-player, not global
- [ ] Supported UE versions: 5.3, 5.4, 5.5
- [ ] Platforms: Windows, macOS, Linux (desktop)
- [ ] README with setup guide
- [ ] Compiles without errors on target UE versions

---

### US-027: Insimul Unity Plugin
**Description:** As a Unity developer, I want a plugin that connects to the Insimul conversation service so I can add AI NPCs to my Unity game.

**Acceptance Criteria:**
- [ ] Create `packages/insimul-plugin-unity/` as a Unity Package Manager (UPM) package
- [ ] `InsimulManager` (MonoBehaviour singleton): manages gRPC connection and session state
- [ ] `InsimulNPC` (MonoBehaviour): attach to any GameObject for conversation capability
- [ ] gRPC client: uses grpc-dotnet or Google.Protobuf for C# streaming
- [ ] Audio capture: `InsimulMicrophone` wraps Unity's Microphone class with Opus encoding
- [ ] Audio playback: `InsimulAudioPlayer` streams TTS to AudioSource component
- [ ] Lip sync: `InsimulLipSync` applies viseme weights to SkinnedMeshRenderer blend shapes
- [ ] WebGL support: gRPC-Web transport for browser builds (no native gRPC in WebGL)
- [ ] Inspector UI: custom editor for configuring API key, server URL, character mappings
- [ ] Unity Events: `UnityEvent<string>` for onTextReceived, onConversationStarted, onConversationEnded
- [ ] Supported Unity versions: 2022.3 LTS, 2023.2+, 6+
- [ ] Platforms: Windows, macOS, Linux, WebGL, Android, iOS
- [ ] README with setup guide and sample scene
- [ ] Compiles without errors; passes Unity's package validation

---

### US-028: Insimul Godot Plugin
**Description:** As a Godot developer, I want a plugin that connects to the Insimul conversation service so I can add AI NPCs to my Godot game.

**Acceptance Criteria:**
- [ ] Create `packages/insimul-plugin-godot/` as a Godot addon (res://addons/insimul/)
- [ ] `InsimulClient` (Node): autoloaded singleton managing gRPC connection
- [ ] `InsimulNPC` (Node): attach as child of any CharacterBody3D for conversation capability
- [ ] gRPC client: use GDExtension or HTTP/2 long-polling for streaming (Godot lacks native gRPC)
- [ ] Alternative: WebSocket-based transport with server-side gRPC-to-WebSocket bridge
- [ ] Audio capture: wrap Godot's `AudioEffectCapture` for microphone input
- [ ] Audio playback: `InsimulAudioPlayer` streams TTS to `AudioStreamPlayer3D`
- [ ] Lip sync: `InsimulLipSync` applies viseme data to `BlendShape` on `MeshInstance3D`
- [ ] Signals: `text_received(text)`, `audio_chunk_received(data)`, `conversation_started()`, `conversation_ended()`
- [ ] Export variables: API key, server URL, character ID configurable in Godot Inspector
- [ ] Supported Godot versions: 4.2+
- [ ] GDScript API: all public methods callable from GDScript
- [ ] README with setup guide
- [ ] Plugin passes Godot's addon validation

---

### US-029: Export Pipeline Integration
**Description:** As a developer, I need the export pipeline to automatically include the appropriate Insimul plugin and configure it for the exported game.

**Acceptance Criteria:**
- [ ] Babylon.js exporter: bundle `@insimul/sdk` into exported project, configure with world's API key and character IDs
- [ ] Unreal exporter: include Insimul plugin in exported project's Plugins folder, pre-configure character mappings
- [ ] Unity exporter: include Insimul UPM package in exported project's Packages folder, pre-configure InsimulManager
- [ ] Godot exporter: include Insimul addon in exported project's addons folder, pre-configure autoload
- [ ] All exporters: embed character-to-NPC mapping (which game character → which Insimul character ID)
- [ ] All exporters: include conversation service URL configuration (configurable for self-hosted or cloud)
- [ ] Exported games connect to conversation service on startup and handle reconnection
- [ ] Typecheck passes
- [ ] Integration test: export Babylon.js project, verify Insimul SDK is included and configured

---

### Phase 8: Streaming Optimization & Performance

---

### US-030: Response Pipelining & Latency Optimization
**Description:** As a developer, I need the conversation pipeline to be optimized for minimal perceived latency so that conversations feel real-time.

**Acceptance Criteria:**
- [ ] Implement pipeline parallelism: while LLM generates sentence N+1, TTS synthesizes sentence N, and client plays sentence N-1
- [ ] Sentence boundary detection runs on streaming LLM output (don't wait for full response)
- [ ] First audio playback begins within 1 second of player finishing input (target: 800ms)
- [ ] Speculative execution: begin TTS for partial sentence if LLM pauses >200ms, discard if sentence changes
- [ ] Connection pooling: keep gRPC channels warm between conversations (no reconnect overhead)
- [ ] Client-side prediction: show typing indicator immediately on send, before server responds
- [ ] Audio pre-buffering: decode and buffer next audio chunk while current chunk plays
- [ ] Metrics collection: log p50/p95/p99 latencies for each pipeline stage (STT → LLM → TTS → playback)
- [ ] Adaptive quality: reduce TTS quality or skip visemes under high latency conditions
- [ ] Typecheck passes
- [ ] Performance test: measure end-to-end latency across 100 conversation turns

---

### US-031: NPC Simulation Performance Optimization
**Description:** As a developer, I need NPC simulation to scale to 50+ characters without frame drops.

**Acceptance Criteria:**
- [ ] LOD (Level of Detail) system for NPC behavior:
  - **Near** (< 30m from player): full animation, pathfinding, lip sync, detailed AI
  - **Medium** (30-100m): simplified animation (walk/idle only), pathfinding active, no lip sync
  - **Far** (> 100m): position-only updates (teleport to schedule location), no animation, no pathfinding
  - **Off-screen**: update position only on schedule transitions (every game-hour)
- [ ] Staggered updates: don't evaluate all NPCs on same frame; spread across 10-frame window
- [ ] Object pooling: reuse NPC mesh instances for characters entering/leaving player's area
- [ ] Animation instancing: share animation evaluation across NPCs playing same animation
- [ ] Pathfinding budget: limit to 5 pathfinding calculations per frame, queue remainder
- [ ] Frame budget monitoring: if frame time exceeds 16ms, reduce NPC update frequency
- [ ] Typecheck passes
- [ ] Performance test: 50 NPCs in world maintain 60fps on mid-range hardware

---

### Phase 9: World Persistence & State

---

### US-032: World State Serialization
**Description:** As a player, I want NPC positions, inventory states, and relationship changes to persist when I reload the game.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/WorldStateManager.ts`
- [ ] Save state includes: NPC positions, current schedule phase, inventory contents, relationship values, romance stages, emotional states, conversation history summaries, player inventory, player gold, player position
- [ ] Auto-save: world state saved every 5 minutes and on exit
- [ ] Save format: JSON serialized to server via API endpoint `POST /api/worlds/:worldId/game-state`
- [ ] Load: on game start, restore all NPC positions, inventories, and states from last save
- [ ] Save slots: support 3 save slots per world
- [ ] Save metadata: timestamp, player level, playtime, thumbnail screenshot
- [ ] Incremental saves: only transmit changed data (diff against last save)
- [ ] Typecheck passes
- [ ] Integration test: save state, reload, verify NPC positions and inventory match

---

### US-033: Conversation History & NPC Memory
**Description:** As a player, I want NPCs to remember our previous conversations so that relationships feel meaningful.

**Acceptance Criteria:**
- [ ] Create `server/services/conversation/npc-memory.ts`
- [ ] Store conversation summaries per NPC-player pair (not full transcripts — summarized to key points)
- [ ] Summary includes: topics discussed, promises made, questions asked, emotional tone, language used
- [ ] NPC references previous conversations naturally: "Last time you mentioned...", "Remember when we talked about..."
- [ ] Conversation count tracking: NPCs acknowledge familiarity ("Good to see you again" vs "I don't think we've met")
- [ ] Key fact extraction: if player shares information (name, origin, quest details), NPC remembers
- [ ] Memory decay: less important details fade over game-time (configurable retention period)
- [ ] Memory shared via gossip: if NPC A tells NPC B about player, NPC B has partial knowledge
- [ ] Memory influences behavior: NPC who had negative conversation with player is less friendly on next meeting
- [ ] Typecheck passes
- [ ] Integration test: converse with NPC, reload, converse again — NPC references previous conversation

---

## Functional Requirements

### Conversation Service
- FR-1: The system must provide a gRPC bidirectional streaming API for real-time conversation
- FR-2: Text responses must stream token-by-token from the LLM, not buffered
- FR-3: Audio responses must stream sentence-by-sentence, pipelined with LLM generation
- FR-4: The LLM provider must be pluggable (Gemini default, support for OpenAI, Anthropic, local models)
- FR-5: NPC conversation context must include personality, relationships, occupation, emotional state, and world knowledge
- FR-6: NPCs must speak in the correct language for language-learning worlds
- FR-7: NPCs must autonomously converse with each other based on personality and social dynamics
- FR-8: First audio playback must begin within 1 second of player input completion

### Voice Pipeline
- FR-9: Players must be able to speak via microphone with streaming STT transcription
- FR-10: NPCs must speak via TTS with per-character voice profiles
- FR-11: NPC lip movements must synchronize with audio output via viseme data
- FR-12: Audio must support spatial attenuation (volume decreases with distance)
- FR-13: Voice pipeline must work in exported games (Unreal, Unity, Godot) via platform-native audio APIs

### NPC Behavior
- FR-14: NPCs must follow daily schedules with physical movement between locations
- FR-15: NPCs must perform visible occupation-specific activities during work hours
- FR-16: NPC decisions must be influenced by personality traits, relationships, mood, and recent events
- FR-17: NPCs must navigate via pathfinding, not teleportation
- FR-18: NPCs must avoid walking through buildings, other NPCs, and the player
- FR-19: Every employed NPC must have a corresponding workplace building in the world

### Buildings & Interiors
- FR-20: Building walls must have collision geometry preventing walk-through
- FR-21: Players must enter buildings via doors with a loading-screen transition
- FR-22: Building interiors must be populated with appropriate NPCs based on time and occupation
- FR-23: Interior NPCs must be positioned at role-appropriate locations (shopkeeper behind counter, etc.)

### Commerce
- FR-24: Merchant NPCs must have auto-generated inventories matching their business type
- FR-25: Players must be able to buy and sell items with gold currency
- FR-26: In language-learning worlds, commerce interactions must use the target language at difficulty-appropriate levels
- FR-27: Item names and merchant dialogue must be in the world's language(s)

### Plugins
- FR-28: JavaScript SDK must connect via gRPC-Web and support streaming text, audio, and viseme callbacks
- FR-29: Unreal plugin must provide BlueprintCallable components for conversation, audio, and lip sync
- FR-30: Unity plugin must support both native builds and WebGL via gRPC-Web
- FR-31: Godot plugin must provide GDScript-accessible nodes with signals for conversation events
- FR-32: Export pipeline must automatically include and configure the appropriate plugin

### Performance
- FR-33: World must support 50+ NPCs at 60fps with LOD-based simulation scaling
- FR-34: Pathfinding for all NPCs must complete within frame budget (5 calculations per frame max)
- FR-35: World state must auto-save and restore across sessions

---

## Non-Goals (Out of Scope)

- **Multiplayer**: This PRD covers single-player experience only; multiplayer NPC interaction is deferred
- **Procedural voice cloning**: NPCs use pre-selected TTS voices, not AI-cloned custom voices
- **Full interior decoration**: Interiors use procedural furniture placement, not hand-designed rooms
- **Multi-floor building navigation**: Interiors are single-room; multi-story navigation is deferred
- **Player housing / decoration**: Players cannot customize building interiors
- **Dynamic weather system**: Weather doesn't affect NPC behavior in this phase (mentioned as modifier but not implemented)
- **Vehicle / mount transportation**: NPCs and players travel on foot only
- **Combat system overhaul**: Combat animations are listed but combat AI is not in scope
- **Mobile platform plugins**: iOS/Android native plugins deferred (Unity mobile builds may work via Unity plugin)
- **Offline mode**: Conversation service requires server connection; offline fallback is template-based only
- **Custom voice training**: No system for users to upload/train custom NPC voices
- **Seamless building interiors**: Loading-screen transition chosen; seamless entry deferred to future phase

---

## Design Considerations

### Conversation UX
- Chat panel should show streaming text as it arrives (typewriter effect)
- Audio playback should begin mid-sentence if text is still streaming (pipeline overlap)
- Player should see a visual indicator when NPC is "thinking" (typing dots) vs "speaking" (audio wave)
- Microphone button should clearly show recording state (pulsing red indicator)
- Language-learning mode should highlight new vocabulary in conversation text

### NPC Visual Behavior
- NPCs should look alive even when not interacting with player (idle animations, looking around)
- Walking NPCs should follow roads/paths, not cut through terrain
- NPCs at work should be visibly doing something (not standing idle at workplace)
- Conversation between NPCs should show both characters facing each other with gesture animations

### Building Entry
- Door should have a visible interaction prompt (floating "E" icon or text)
- Loading transition should be fast (<2 seconds) and visually clean (fade, not jarring cut)
- Interior should feel connected to exterior (same architectural style, window views optional)

### Commerce
- Shop panel should be inviting and clear, especially for language learners
- Item tooltips should show both languages in learning mode
- Transaction feedback should be satisfying (sound effect, gold animation)

---

## Technical Considerations

### gRPC in Browser
- Browsers don't support native gRPC (HTTP/2 with trailers). Must use **gRPC-Web** (via Envoy proxy or built-in `@grpc/grpc-web`)
- Alternative: implement WebSocket-based transport as fallback for environments where gRPC-Web proxy isn't available
- Server must support both native gRPC (for Unreal/Unity/Godot native builds) and gRPC-Web (for browser/WebGL)

### Protobuf Compilation
- Use `protoc` with plugins: `ts-proto` (TypeScript), `grpc_cpp_plugin` (Unreal/C++), `Grpc.Tools` (Unity/C#)
- Godot: generate GDScript stubs manually or use HTTP/JSON bridge (Godot has limited protobuf support)

### Navigation Mesh
- Babylon.js has `RecastJSPlugin` for navigation mesh generation — evaluate before building custom
- Alternative: use Detour/Recast WASM build for high-quality navmesh in browser
- NavMesh should be generated once at world load and cached

### Audio Encoding
- Opus is ideal for streaming (low latency, good compression) but needs decoder in browser (`opus-decoder` npm package)
- Fallback to PCM for simplicity during development, optimize to Opus for production
- Unreal/Unity/Godot have native Opus support or can use platform audio decoders

### TTS Cost Management
- TTS API calls are expensive at scale. Implement:
  - Phrase caching (common greetings, merchant lines)
  - Audio asset generation during world creation for predictable dialogue
  - Per-world TTS budget with fallback to text-only when exhausted
  - Quality tiers: high (neural TTS) for player conversations, standard for ambient NPC-NPC

### LLM Cost Management
- NPC-NPC conversations should use shorter context windows and lower-cost models
- Rate limit NPC-NPC conversations (max 3 concurrent per world)
- Template fallback when LLM is unavailable or rate-limited (existing AmbientConversationSystem)
- Player-NPC conversations get priority over NPC-NPC for API budget

### Existing Systems to Leverage
- `BabylonChatPanel.ts` — enhance with streaming, don't replace
- `AmbientConversationSystem.ts` — use as fallback for NPC-NPC when LLM unavailable
- `VolitionSystem.ts` — extend with action grammar hierarchy
- `TemporaryStateSystem.ts` — feed emotional state into conversation context
- `RomanceSystem.ts` — integrate romance stage into conversation context and available actions
- `routine-system.ts` — drive schedule executor, don't duplicate schedule data
- `ProceduralBuildingGenerator.ts` — add collision mesh generation
- `BuildingInteriorGenerator.ts` — enhance with NPC placement
- `BabylonShopPanel.ts` — enhance with language integration and merchant binding
- `AudioManager.ts` — integrate streaming audio player
- `autonomous-behavior-system.ts` — connect to client-side NPC controllers

---

## Success Metrics

- **Conversation latency**: p95 first-token < 500ms, p95 first-audio < 1000ms
- **NPC activity**: at any given time, >80% of NPCs are visibly doing something (not standing idle)
- **Pathfinding success**: >99% of NPC pathfinding requests find a valid route
- **Frame rate**: 60fps maintained with 50 NPCs on mid-range hardware (GTX 1060 / M1 equivalent)
- **Occupation coverage**: 100% of employed NPCs have valid workplace buildings
- **Plugin compatibility**: all 4 SDK plugins connect and stream successfully in their target environments
- **Language accuracy**: NPCs respond in correct target language >99% of the time in language-learning mode
- **Commerce completion**: players can complete a purchase in target language within 3 attempts (beginner mode)
- **Save/load fidelity**: world state survives save/load with 100% data integrity

---

## Open Questions

1. **TTS Provider**: Google Cloud TTS vs. ElevenLabs vs. Azure Cognitive Services? Each has different voice quality, language coverage, and pricing.
2. **STT Provider**: Google Cloud Speech vs. Whisper (self-hosted) vs. Deepgram? Whisper is free but adds server load; cloud services have per-minute costs.
3. **Opus in Browser**: Should we use `opus-decoder` WASM or fall back to MP3 for browser audio? MP3 is natively supported but higher latency.
4. **Godot gRPC**: Godot has poor native gRPC support. Should the Godot plugin use WebSocket transport with a server-side bridge, or a GDExtension wrapping a C++ gRPC client?
5. **NPC conversation cost budget**: What's the acceptable monthly LLM/TTS API cost per world? This drives rate limiting decisions for NPC-NPC conversations.
6. **Animation asset source**: Mixamo (free, Adobe account required) vs. purchased animation packs vs. procedural animation? Mixamo has the largest free library but licensing requires review.
7. **NavMesh library**: Babylon's built-in RecastJSPlugin vs. custom Recast WASM build vs. simpler grid-based pathfinding? RecastJS is easiest but may lack fine-grained control.
8. **Conversation moderation**: Should NPC responses be filtered for inappropriate content, or is the system prompt sufficient to keep NPCs in-character?
9. **Self-hosted vs. cloud deployment**: Should the conversation microservice be designed for self-hosting (users run their own server) or cloud-only (Insimul-hosted)?
10. **Save state storage**: Server-side (MongoDB) vs. client-side (IndexedDB/localStorage) vs. both? Server-side enables cross-device play but adds API calls.
