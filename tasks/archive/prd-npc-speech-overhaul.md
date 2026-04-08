# PRD: NPC Speech & Ambient Conversation Overhaul

## Introduction

The game currently has four separate systems for NPC-to-player greetings (passive greetings, callouts, walking interrupts, NPC approach) and a separate ambient NPC-to-NPC conversation system with an eavesdrop mechanic. This overhaul unifies the greeting systems into a single LLM-powered dialogue generator with TTS playback, and replaces the eavesdrop mechanic with proximity-based ambient conversations that the player simply overhears via TTS as they walk by.

**Key principle:** No LLM or TTS resources are spent on NPCs the player can't hear. Only one greeting or one ambient conversation plays audio at a time.

## Goals

- Unify passive greetings, callouts, walking interrupts, and NPC approach into a single NPC greeting system
- Generate greeting dialogue via LLM in the target language and play it via TTS (no speech bubbles for these)
- Enforce one-at-a-time greeting audio — never a barrage of simultaneous greetings
- Replace the eavesdrop mechanic with proximity-triggered ambient NPC-NPC conversations
- Stream ambient NPC-NPC conversations via LLM and play both sides via TTS (no speech bubbles)
- Only generate/play conversations when the player is within range (8m); end immediately when player leaves
- Zero LLM calls for out-of-range NPCs

## User Stories

### US-001: Unified NPC Greeting Trigger
**Description:** As a player, I want nearby NPCs to occasionally greet me with a single spoken line so the world feels alive without being overwhelming.

**Acceptance Criteria:**
- [ ] A single proximity check system replaces NPCGreetingSystem, the callout system, walking interrupt system, and NPC approach system
- [ ] Only one NPC can be actively greeting the player at a time (global lock)
- [ ] Greeting triggers when player is within 8m of an idle NPC
- [ ] Base probability is personality-driven: extroversion scales chance up, neuroticism scales down
- [ ] Per-NPC cooldown of 3 minutes; global cooldown of 15 seconds between any greeting
- [ ] Quest-bearing NPCs have higher probability (+25%)
- [ ] Greetings do not trigger while the player is in an active conversation
- [ ] Typecheck passes

### US-002: LLM Greeting Generation
**Description:** As a player, I want NPC greetings to be contextual and in the target language so they feel natural and support language learning.

**Acceptance Criteria:**
- [ ] When a greeting triggers, a short LLM call generates a single sentence in the target language
- [ ] The prompt includes: NPC name, personality, occupation, time of day, weather, and relationship to player
- [ ] The prompt instructs the LLM to produce exactly one short spoken greeting (1-2 sentences max)
- [ ] Fallback: if LLM fails or times out (3s), use a pre-built target-language template greeting (from existing greeting templates)
- [ ] The greeting text is stored for potential vocabulary tracking
- [ ] Typecheck passes

### US-003: TTS Playback for Greetings
**Description:** As a player, I want to hear NPC greetings spoken aloud with a voice matching the NPC's gender and the target language.

**Acceptance Criteria:**
- [ ] Generated greeting text is sent to TTS with the NPC's gender and the world's target language
- [ ] Audio plays via the existing StreamingAudioPlayer infrastructure
- [ ] No speech bubble is shown — audio only
- [ ] If TTS fails, the greeting is silently skipped (no fallback to bubble)
- [ ] Audio is spatially positioned at the NPC's location (uses existing StreamingAudioPlayer `npcPosition` option)
- [ ] Typecheck passes

### US-004: Proximity-Based Ambient NPC Conversations
**Description:** As a player walking through town, I want to overhear nearby NPCs having real conversations so the world feels lived-in.

**Acceptance Criteria:**
- [ ] When two idle NPCs are within 8m of each other AND the player is within 8m of them, a conversation may start
- [ ] No conversation is initiated if the player is out of range — zero LLM calls for distant NPCs
- [ ] Maximum 1 ambient conversation active at a time
- [ ] Conversation does not start while a greeting is actively playing (and vice versa — shared audio lock)
- [ ] NPCs face each other and play talk/listen animations (reuse existing ambient conversation animation logic)
- [ ] Typecheck passes

### US-005: Streamed Ambient Conversation with TTS
**Description:** As a player near conversing NPCs, I want to hear their dialogue played aloud with distinct voices.

**Acceptance Criteria:**
- [ ] Conversation is generated via the existing `initiateConversation` NPC-NPC engine with streaming enabled
- [ ] Each exchange is played via TTS with the speaking NPC's gender and the target language
- [ ] Exchanges are played sequentially — NPC1 speaks, then NPC2 responds, alternating
- [ ] No speech bubbles are shown — audio only
- [ ] Conversation length is 3-5 exchanges (configurable via options passed to `initiateConversation`)
- [ ] Typecheck passes

### US-006: Conversation Ends on Player Leave
**Description:** As a player, when I walk away from conversing NPCs, the conversation should stop to save resources.

**Acceptance Criteria:**
- [ ] Each frame tick checks player distance to active ambient conversation participants
- [ ] If player moves beyond 12m from both NPCs, the conversation is cancelled immediately
- [ ] Any in-progress LLM stream is aborted
- [ ] Any queued TTS audio is stopped
- [ ] NPCs return to idle animation
- [ ] A per-pair cooldown of 2 minutes is set to prevent immediate re-trigger
- [ ] Typecheck passes

### US-007: Remove Eavesdrop Mechanic
**Description:** As a developer, I want to remove the eavesdrop system since ambient conversations now play automatically.

**Acceptance Criteria:**
- [ ] The `activateEavesdrop` / `endEavesdrop` flow is removed from NPCAmbientConversationManager
- [ ] The "Press Y to eavesdrop" toast and `👂 ...` bubble indicators are removed
- [ ] The F-key / Y-key eavesdrop bindings are removed from BabylonGame
- [ ] The eavesdrop-related events are removed from GameEventBus
- [ ] Existing ambient visual pairing (NPCs facing each other, talk/listen animations) is preserved for the new system
- [ ] Typecheck passes

### US-008: Remove Old Greeting Systems
**Description:** As a developer, I want to remove the redundant greeting systems that have been replaced by the unified system.

**Acceptance Criteria:**
- [ ] NPCGreetingSystem passive greeting logic is replaced by the unified system
- [ ] NPCInitiatedConversationController callout, walking interrupt, and approach systems are replaced
- [ ] Old greeting text templates (English-only phrases like "Hey there! Got a moment?") are removed
- [ ] Toast-based greeting prompts ("[G] Respond", "[G] Stop and chat") are removed
- [ ] BabylonGame integration points are updated to use the new unified system
- [ ] No dead code remains from the old systems
- [ ] Typecheck passes

### US-009: Audio Lock — One Sound at a Time
**Description:** As a player, I want to only hear one NPC audio source at a time so the soundscape isn't chaotic.

**Acceptance Criteria:**
- [ ] A shared audio lock prevents simultaneous greeting + ambient conversation audio
- [ ] If a greeting is playing and an ambient conversation wants to start, the conversation waits
- [ ] If an ambient conversation is playing and a greeting wants to trigger, the greeting is suppressed
- [ ] The lock is released when the current audio finishes or is cancelled
- [ ] Player-initiated conversations (chat panel) take priority and cancel any active greeting/ambient audio
- [ ] Typecheck passes

## Functional Requirements

- FR-1: A unified `NPCProximitySpeechSystem` replaces the four existing greeting systems
- FR-2: Greeting triggers evaluate once per second for NPCs within 8m of the player
- FR-3: Only one greeting may be active at a time (global lock with 15s cooldown)
- FR-4: Per-NPC greeting cooldown is 3 minutes
- FR-5: Greeting probability is personality-driven: `base * (0.5 + extroversion * 0.5) * (1 - neuroticism * 0.3)`
- FR-6: Quest-bearing NPCs get a +25% probability bonus
- FR-7: Greetings are generated by a short LLM call with a 3-second timeout and template fallback
- FR-8: Greeting audio is played via TTS with gender-matched voice in the target language
- FR-9: Ambient NPC-NPC conversations only initiate when the player is within 8m of a viable NPC pair
- FR-10: Ambient conversations use the existing `initiateConversation` engine with `onLineReady` streaming
- FR-11: Each ambient conversation exchange is played via TTS sequentially (one NPC at a time)
- FR-12: Ambient conversations are cancelled when the player moves beyond 12m from both participants
- FR-13: The eavesdrop mechanic (F/Y key, toast prompt, 👂 indicator) is fully removed
- FR-14: A shared `NpcAudioLock` prevents overlapping greeting and ambient conversation audio
- FR-15: Player-initiated conversations (opening chat panel) immediately cancel any active NPC audio and acquire the lock

## Non-Goals

- No changes to the player-initiated conversation system (chat panel, SSE/WS bridges)
- No changes to NPC-to-NPC conversation content/topics — reuse existing engine
- No lip-sync for overheard ambient conversations (only for direct player-NPC chat)
- No UI settings for greeting frequency (hardcoded for now, can be added later)
- No subtitle/caption system for ambient conversations (audio-only per requirements)

## Technical Considerations

- **TTS pipeline:** Reuse `InsimulClient` TTS infrastructure or call the server TTS endpoint directly. The server's `gemini-tts-provider.ts` supports `synthesize(text, voiceProfile, options)` which returns an async iterable of audio chunks.
- **Voice profiles:** Use `assignVoiceProfile({ gender })` from `tts-provider.ts` to get a voice matching the NPC's gender. Pass `languageCode` from the world's target language.
- **LLM for greetings:** Use a lightweight call (FLASH model tier) with a tight `maxTokens` (50) and low temperature for fast, short responses.
- **Streaming ambient conversations:** The existing `initiateConversation` engine supports `onLineReady` callbacks for incremental line delivery — wire each line to TTS sequentially.
- **Audio lock:** A simple class with `acquire() -> boolean`, `release()`, `isLocked() -> boolean`, and `owner -> string` for debugging. Lives in the game engine rendering layer.
- **Spatial audio:** `StreamingAudioPlayer` already supports `npcPosition` for distance-based volume attenuation.
- **Abort handling:** Use `AbortController` for both the LLM greeting call and the ambient conversation stream so they can be cancelled instantly on player leave.

## Success Metrics

- Only one NPC audio source plays at any given time
- Zero LLM calls occur for NPCs beyond 8m from the player
- Ambient conversations stop within 1 frame of the player leaving the 12m range
- Greeting generation + TTS playback starts within 3 seconds of trigger (or falls back to template)
- No regression in frame rate from the proximity checks (< 1ms per tick)

## NPC Dialogue Initiation (US-011 — US-013)

Currently, when the player opens conversation with an NPC, the chat panel is silent until the player speaks first. This feels unnatural. Instead, the NPC should always speak first with a contextual opening line.

### US-011: NPC opens conversation with contextual greeting
When the chat panel opens, an LLM call generates an opening line. The prompt includes location context (shop, park, street), personality, occupation, time of day, and relationship. The NPC ends with a question or engagement hook. Falls back to a template greeting on failure.

### US-012: Auto-speak NPC opening line via TTS
The opening line from US-011 plays via TTS automatically as it appears in the chat panel. Uses the same TTS pipeline as regular responses. Non-blocking — the player can start typing while audio plays.

### US-013: Continue from proximity greeting if recent
If the NPC greeted the player via the proximity system (US-003) within the last 30 seconds, the opening prompt includes that greeting as context so the NPC naturally continues from it rather than re-greeting. The greeting text is prepended to conversation history.

## Open Questions

- Should ambient conversation exchanges have a brief pause between speakers (e.g., 500ms silence) for natural pacing?
- Should NPCs who greet the player be more likely to initiate a full conversation later (relationship boost)?
