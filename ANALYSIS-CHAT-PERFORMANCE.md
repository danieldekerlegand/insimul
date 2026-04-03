# Chat System & Performance Analysis

## How Player/NPC and NPC/NPC Conversations Work

### Overview

Insimul uses a dual-path conversation system: a **WebSocket bridge** (primary) that proxies to a gRPC pipeline for LLM streaming + TTS + viseme generation, and an **HTTP SSE fallback** for environments where WebSocket isn't available. NPC-NPC conversations use a separate engine with topic selection, personality-driven dialogue, and rate limiting.

---

## 1. Architecture

### Two WebSocket Servers

| Server | Location | Purpose |
|--------|----------|---------|
| Conversation Bridge | `server/services/conversation/ws-bridge.ts` | Proxies JSON messages to gRPC pipeline (LLM streaming, TTS, visemes) |
| Voice Chat | `server/services/conversation/voice-websocket.ts` at `/ws/voice` | Multi-peer voice rooms, audio relay, jitter buffer |

### Proto Schema (`proto/conversation.proto`)

```
ConversationRequest: oneof(TextInput, AudioChunkInput, SystemCommand)
ConversationResponse: oneof(TextChunk, AudioChunkOutput, FacialData, ActionTrigger, Meta)
Audio: PCM, OPUS, MP3
States: STARTED, ACTIVE, PAUSED, ENDED
```

### Key API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/conversations/start` | Initiate player-NPC conversation |
| `POST /api/conversations/:id/continue` | Get next NPC utterance |
| `POST /api/conversations/:id/end` | End conversation |
| `POST /api/worlds/:worldId/npc-npc-conversation` | Generate ambient NPC-NPC chat |
| `POST /api/gemini/chat` | SSE fallback for streaming |

---

## 2. Player-NPC Conversation Flow

### Client Side (`CharacterChatDialog.tsx`)

```
1. User types message
2. sendMessageStreaming(message, onChunk)
3. Try: InsimulClient.sendText() via WebSocket
4. Fallback: HTTP SSE to /api/gemini/chat
```

### Server Side (WebSocket Path)

```
1. ws-bridge receives text message
2. getSession() or createSession()
3. buildContext(characterId, worldId) → FullConversationContext
   - Character: personality (Big Five), occupation, family, relationships
   - World: name, type, era, languages, cultural setting
   - Environment: weather, time of day, season
   - Quest awareness: active quests NPC knows about
   - Player progress: reputation, relationship with NPC
   - Language learning: vocabulary for review, weak grammar patterns
   (capped at ~4000 tokens)
4. GeminiStreamingProvider.streamCompletion(text, context)
   - temperature: 0.8, maxTokens: 1024
5. Tokens stream in real-time → WebSocket → client UI
6. SentenceAccumulator detects complete sentences
7. If TTS enabled:
   - cleanForTTS() strips markers, markdown
   - TTS synthesis per sentence
   - Viseme generation from audio
   - Audio + visemes sent as binary WebSocket messages
8. History capped at 20 messages
```

### System Prompt Construction

`buildLanguageAwareSystemPrompt()` includes:
- Character personality, occupation, relationships
- Language mode directives (bilingual/simplified/natural based on CEFR)
- Grammar feedback instructions
- Player proficiency data (vocabulary, weak patterns)
- Target language ratio

---

## 3. NPC-NPC Conversation System

### Engine (`server/services/conversation/npc-conversation-engine.ts`)

### Topic Selection

Topics weighted by personality and relationship:

| Topic | Base Weight | Modifiers |
|-------|------------|-----------|
| daily_greeting | 1.0 | Always available |
| weather | 1.0 | +0.5 if notable weather |
| work | 1.0 | +0.5 if same occupation |
| gossip | 0.6-1.1 | Scales with openness |
| family | 0-1.0 | Requires relationship >0.2 |
| romance | 0-1.0 | Requires relationship >0.4 |
| complaint | 0.4-1.0 | Scales with neuroticism |
| philosophy | 0-1.0 | Requires openness >0.5 |

### Generation Flow

```
1. selectTopics() → weighted random pick
2. buildNpcNpcSystemPrompt() with both NPC personalities, relationship, environment
3. Acquire rate limit slot (max 3 concurrent per world)
4. LLM streamCompletion() → accumulate full response (NOT per-token UI)
5. parseLlmConversation() → extract exchanges
6. calculateRelationshipDelta() → friendship, trust, romance changes
7. Persist relationship changes to DB
8. Release rate limit slot
9. Return NpcConversationResult
```

### Visual Display (Godot)

The ambient conversation system (`ambient_conversation_system.gd`):
- Checks proximity every 5 seconds
- NPCs within 5.0 units have 30% chance to start talking
- Shows `Label3D` speech bubbles (yellow text, 90% opacity)
- Each line visible for 3.5 seconds, up to 4 exchanges
- Maximum 4 concurrent visible conversations
- Activity labels show "Socializing" state

---

## 4. Performance Bottlenecks

### Current Metrics Tracked (`conversation-metrics.ts`)

| Metric | Description |
|--------|-------------|
| `llm_first_token` | Time to first token from LLM |
| `llm_total` | Total LLM streaming time |
| `tts_first_chunk` | Time to first audio chunk |
| `tts_total` | Total TTS synthesis time |
| `viseme` | Viseme generation time |
| `context` | Context building time |
| `end_to_end` | Full pipeline latency |

### Identified Bottlenecks

| Bottleneck | Impact | Severity |
|-----------|--------|----------|
| **LLM cold start / first token** | 1-4+ seconds before any text appears | HIGH |
| **Context building** | Rebuilds full context each turn (world, character, quests, language) | MEDIUM |
| **TTS per-sentence** | Each sentence requires a separate TTS API call | MEDIUM |
| **NPC-NPC: full accumulation** | Entire response collected before parsing — no per-line streaming | HIGH |
| **No conversation pre-generation** | NPC-NPC conversations generated on-demand only | HIGH |
| **Viseme generation** | Degrades to simplified (5 shapes) under high latency (>4s p95) | LOW |
| **Session history growth** | 20-message cap, but context still grows with each turn | LOW |

### Adaptive Quality

When p95 latency exceeds 4000ms:
- Viseme quality drops from "full" (15 shapes) to "simplified" (5 shapes)
- No other automatic degradation currently implemented

---

## 5. NPC-Initiated Conversation

### Current State: MINIMAL

- **Godot only**: Ambient conversation system has proximity triggers (NPC-to-NPC)
- **No NPC-to-player initiation**: NPCs never approach or greet the player
- **No greeting system**: Player must always initiate
- **No interrupt system**: Player can't be interrupted while walking
- **No eavesdropping UI**: Player can't overhear NPC-NPC conversations in real-time

### What's Missing

1. **NPC greeting triggers** — When player enters proximity, NPC should sometimes call out
2. **NPC approach behavior** — NPCs should occasionally walk toward the player
3. **Eavesdropping UI** — When near chatting NPCs, player should see their dialogue in real-time
4. **Context-aware initiation** — NPCs with quests or relevant info should be more likely to initiate
5. **Personality-driven frequency** — Extroverted NPCs initiate more; introverts wait for player

---

## 6. Recommendations

### A. Reduce First-Response Latency

| Approach | Expected Impact | Effort |
|----------|----------------|--------|
| **Pre-warm LLM context** — When player approaches NPC (proximity trigger), pre-build the context and warm the LLM with a system prompt before the player types | -1-2s first token | Medium |
| **Greeting cache** — Pre-generate 3-5 contextual greetings per NPC at session start, serve instantly on first interaction | Instant first response | Low |
| **Streaming sentence display** — Show first sentence immediately, TTS in parallel | -2-3s perceived latency | Low (already partially done) |
| **Smaller context** — Profile context tokens; trim world/environment sections for follow-up turns | -0.5s per turn | Low |

### B. NPC-Initiated Conversations

| Feature | Implementation |
|---------|---------------|
| **Proximity greetings** | When player enters 8m radius, 20% chance NPC calls out with pre-cached greeting. Extrovert NPCs: 40%. Cooldown: 60s per NPC |
| **Quest-bearer approach** | NPCs with quests walk toward player, speech bubble "!" appears. Trigger: player within 15m + NPC has undelivered quest |
| **Context-aware callouts** | If NPC has relationship with player (>0.3) or shared history, higher initiation chance. Use pre-generated lines based on relationship |
| **Walking interrupts** | Brief callouts while player walks by. Never force a full conversation — just a greeting or one-liner. Player can choose to engage or keep walking |

### C. Improve NPC-NPC Conversations

| Improvement | Details |
|-------------|---------|
| **Pre-generate conversation pool** | At world load, generate 10-20 NPC-NPC conversations asynchronously. Serve from cache when ambient system triggers |
| **Per-line streaming** | Instead of accumulating full response, parse and display lines as they stream. Each line becomes a speech bubble with 3.5s display |
| **Eavesdropping** | When player is within 10m of chatting NPCs, stream their conversation to a side panel. Lines appear in real-time as they're generated |
| **Background generation** | Use a worker queue to continuously generate NPC-NPC conversations during idle time. Store in a pool of 50+ ready conversations |
| **Template fallback** | If LLM is slow, immediately show a template conversation, then replace with LLM version when ready |

### D. Architecture Improvements

| Improvement | Details |
|-------------|---------|
| **Connection pooling** | Reuse LLM connections across conversations instead of per-request |
| **Response caching** | Cache LLM responses for identical context+message pairs (rare but helpful for common greetings) |
| **Speculative generation** | When player is near an NPC, speculatively generate a greeting + first response to likely opening messages |
| **Tiered LLM routing** | Use faster/smaller model for greetings and simple exchanges; full model for quest-related or complex conversations |
| **Batch NPC-NPC** | Generate multiple NPC-NPC conversations in a single LLM call (multi-pair prompt) |

---

## 7. Key Files

| Component | Path |
|-----------|------|
| Proto Schema | `proto/conversation.proto` |
| WebSocket Bridge | `server/services/conversation/ws-bridge.ts` |
| Voice WebSocket | `server/services/conversation/voice-websocket.ts` |
| HTTP Bridge | `server/services/conversation/http-bridge.ts` |
| gRPC Server | `server/services/conversation/grpc-server.ts` |
| Context Manager | `server/services/conversation/context-manager.ts` |
| NPC-NPC Engine | `server/services/conversation/npc-conversation-engine.ts` |
| Streaming Chat | `server/services/conversation/streaming-chat.ts` |
| Gemini Provider | `server/services/conversation/providers/gemini-provider.ts` |
| Metrics | `server/services/conversation/conversation-metrics.ts` |
| Context Cache | `server/services/conversation/conversation-context-cache.ts` |
| Chat UI | `client/src/components/CharacterChatDialog.tsx` |
| TotT Conversation | `server/extensions/tott/conversation-system.ts` |
| Language Prompts | `shared/language/npc-conversation-prompts.ts` |
| Godot Ambient | `server/services/game-export/godot/templates/.../ambient_conversation_system.gd` |
