# LLM Calls During Gameplay: Complete Reference

This document catalogs every LLM call that occurs during Insimul gameplay, how prompts are constructed, when calls occur, and what happens with the results.

---

## Table of Contents

1. [Player-NPC Chat](#1-player-npc-chat)
2. [NPC-NPC Conversations](#2-npc-npc-conversations)
3. [Post-Conversation Analysis](#3-post-conversation-analysis)
4. [Conversation History Compression](#4-conversation-history-compression)
5. [Quest Generation](#5-quest-generation)
6. [Assessment & Evaluation](#6-assessment--evaluation)
7. [Translation](#7-translation)
8. [Text & Content Generation](#8-text--content-generation)
9. [Name Generation](#9-name-generation)
10. [Native Audio (Voice I/O)](#10-native-audio-voice-io)
11. [Image Generation](#11-image-generation)
12. [Architecture Issues & Gaps](#12-architecture-issues--gaps)

---

## 1. Player-NPC Chat

Player-NPC chat has **two parallel system prompt builders** and **four LLM call paths**. This is the most complex and most critical system.

### 1A. System Prompt Construction

There are **two independent prompt builders** that construct the NPC system prompt. Which one is used depends on the transport path.

#### Server-Side: `buildSystemPrompt()` in `context-manager.ts:524`

Used by: SSE path (`/api/conversation/stream`), WS path (`/ws/conversation`)

Built from database lookups of character, world, settlement, relationships, and player progress. Sections in order:

| # | Section | Conditional? | Example |
|---|---------|-------------|---------|
| 1 | Identity | Always | `You are Léopold Laveau, a character in the world of Grand-Pré.` |
| 2 | Gender/Birth | If populated | `Gender: male. Born: year 1870.` |
| 3 | Personality (Big Five) | Always | `Personality (Big Five): moderately open, highly conscientious, introverted, agreeable, low neuroticism.` |
| 4 | Occupation & workplace | If has job | `Occupation: Farmer at Laveau Farm. Workplace context: ...` |
| 5 | Settlement | If has settlement | `You live in the village of Grand-Pré. About Grand-Pré: ...` |
| 6 | Location/time/weather | Always | `Current location: Town Square. Time: late night. Weather: clear skies.` |
| 7 | Season | If available | `Season: spring.` |
| 8 | Family | If has family | `Family: Marie Laveau (wife), Pierre Laveau (son).` |
| 9 | Romantic status | Always | `Romantic status: married.` |
| 10 | Friends | If has friends | `Friends: Jean, Pierre.` |
| 11 | Enemies | If has enemies | `Rivals/enemies: Claude.` |
| 12 | Emotional state | Always | `Current mood: content.` |
| 13 | World context | Always | `World: Grand-Pré, 1880. Setting: historical. Languages spoken: French, English.` |
| 14 | World description | If populated | Truncated to 200 chars |
| 15 | Relationship with player | Always | `Relationship with player: stranger (trust: 0.0).` |
| 16 | Romance stage | If not 'none' | `Romance stage: ...` |
| 17 | Previous topics | If any | `Previously discussed: weather, farming.` |
| 18 | MVT/Prolog context | If Prolog facts provided | Game state facts from Prolog KB |
| 19 | **LANGUAGE LEARNING MODE** | **If world has target language** | See below |
| 20 | Vocab/grammar review | If review words or weak patterns | See `buildVocabGrammarPrompt()` below |
| 21 | Quest awareness (own quests) | If NPC assigned quests | `Quests you gave the player: "Find the herbs" (in progress).` |
| 22 | Quest awareness (other) | If <=3 other active quests | `You've heard the player is working on: ...` |
| 23 | Player progress | Always | New/experienced/well-known messaging |
| 24 | Weather hint | If storm/rain | `The weather is ... — you might comment on it.` |
| 25 | Main quest NPC role | If isMainQuestNPC | Special role + chapter hints |
| 26 | Behavioral instruction | Always | `Stay in character. Respond as Léopold would...` |

**Language Learning Mode block (section 19):**
```
LANGUAGE LEARNING MODE:
Target language: French (fr).
Player proficiency: beginner.
Known vocabulary: bonjour, merci, oui, non, ...
Incorporate the target language naturally. For a beginner learner, adjust complexity accordingly.
CRITICAL: Your ENTIRE response is read aloud by TTS. Respond with ONLY natural spoken dialogue — no English translations, no glosses, no parenthetical hints, no vocabulary blocks, no structured data, no markup of any kind.
```

**`buildVocabGrammarPrompt()` (section 20)** — from `shared/language/npc-conversation-prompts.ts:107`:
```
VOCABULARY & GRAMMAR REVIEW:
The player is learning French at beginner level.

Words due for review: "bonjour" (hello, learning), "merci" (thank you, familiar).
Try to naturally use 2-3 of these words in your responses.

For newer words ("bonjour"): use them in context and pause briefly.
For familiar words ("merci"): use them naturally without drawing attention.

Grammar patterns the player struggles with: "verb conjugation" (45% accuracy).
Model correct usage of these patterns in your speech. If the player makes an error, gently correct in character.
```

#### Client-Side: `buildLanguageAwareSystemPrompt()` in `shared/language/utils.ts:808`

Used by: BabylonChatPanel's `systemPromptBuilder` callback (passed to InsimulClient). **Currently the server ignores this prompt on the SSE path** — the server builds its own via `buildContext()`.

Sections in order:

| # | Section | Builder Function | Conditional? |
|---|---------|-----------------|-------------|
| 1 | Character identity | Inline | Always |
| 2 | Language skills | `buildLanguageSection()` | Always (lists fluencies from truths) |
| 3 | World language context | `buildWorldLanguageSection()` | If worldContext provided |
| 4 | Grammar feedback section | `buildGrammarFeedbackSection()` | If language learning + non-English target |
| 5 | Player proficiency | `buildPlayerProficiencySection()` | If language learning + proficiency data |
| 6 | NPC language mode | `buildLanguageModeDirective()` | If language learning + CEFR level |
| 7 | Character truths | Inline | If truths array has items |
| 8 | World truths | Inline | If world truths exist |
| 9 | Personality traits | Inline | If personality object exists |
| 10 | Relationships | Inline | If relationship IDs exist |
| 11 | Quest system declaration | Inline | Always |
| 12 | **CRITICAL LANGUAGE RULE** | Inline | If language learning + non-English target |

**Key differences from server-side builder:**
- Uses character truths from game state (not DB lookups)
- Has CEFR-aware NPC language mode directives (bilingual/simplified/natural)
- Has vocabulary frequency constraints (`buildFrequencyDirective()`)
- Has a CRITICAL LANGUAGE RULE at the very end for maximum LLM attention
- Does NOT include: settlement context, emotional state, weather hints, detailed relationship labels, conversation history compression

**Post-build augmentations** applied in `BabylonChatPanel.buildSystemPrompt()`:
- Player improvement acknowledgment (if CEFR advanced)
- Player inventory context
- Quest offering context (for quest-giving NPCs)
- Active quest context (for ongoing quests)
- Quest guidance prompt (for quest objectives)
- System prompt augmentation hooks
- Dynamic scaffolding directives (from difficulty monitor)
- Relationship manager context

### 1B. LLM Call Paths

#### Path 1: WebSocket Bridge
- **File:** `server/services/conversation/ws-bridge.ts:192`
- **Call:** `llmProvider.streamCompletion(text, session.conversationContext!, { languageCode, conversationHistory })`
- **Trigger:** Player sends text via WebSocket connection
- **Model:** Configured provider (default Gemini PRO)
- **Config:** Uses provider defaults (temperature ~0.8, max tokens ~1024)
- **System prompt source:** `session.conversationContext.systemPrompt` — built by server's `buildContext()` → `buildSystemPrompt()`
- **Result:** Token-by-token streaming → text SSE events + per-sentence TTS synthesis + viseme generation
- **Currently broken:** WebSocket fails in dev (Vite doesn't proxy `/ws/conversation`), always falls back to SSE

#### Path 2: HTTP Bridge (SSE Streaming)
- **File:** `server/services/conversation/http-bridge.ts:230`
- **Call:** `llmProvider.streamCompletion(text, session.conversationContext!, { languageCode, conversationHistory })`
- **Trigger:** Fallback when WebSocket unavailable, or direct POST to `/api/conversation/stream`
- **Model:** Configured provider (default Gemini PRO)
- **System prompt source:** `session.conversationContext.systemPrompt` — built by server's `buildContext()` → `buildSystemPrompt()`. **The client's `systemPrompt` field in the request body is ignored.**
- **Result:** Same as WS — streaming text + TTS + marker block extraction (GRAMMAR_FEEDBACK, QUEST_ASSIGN, VOCAB_HINTS, EVAL)

#### Path 3: Direct Gemini Streaming
- **File:** `server/routes.ts:7311`
- **Call:** `ai.models.generateContentStream({ model: GEMINI_MODELS.PRO, contents, config })`
- **Trigger:** POST `/api/gemini/chat` with `stream: true`
- **Model:** `GEMINI_MODELS.PRO`
- **Config:** Temperature from request (default 0.7), max tokens from request, thinking level MEDIUM
- **System prompt source:** `systemPrompt` from request body (client-built)
- **Special:** Prolog-first routing for greetings/farewells (confidence >= 0.6 skips LLM). Conversation cache lookup. History compression if >20 messages.
- **Result:** SSE streaming + per-sentence TTS + grammar feedback extraction + conversation cache update

#### Path 4: Direct Gemini Non-Streaming
- **File:** `server/routes.ts:7417`
- **Call:** `ai.models.generateContent({ model: GEMINI_MODELS.PRO, contents, config })`
- **Trigger:** POST `/api/gemini/chat` without `stream: true`
- **Model:** `GEMINI_MODELS.PRO`
- **Config:** Same as streaming path
- **Result:** Full response at once, then optional TTS synthesis

#### Path 5: Voice Chat
- **File:** `server/routes.ts:7047`
- **Call:** `ai.models.generateContent()`
- **Trigger:** POST `/api/voice-chat` (voice transcript input)
- **Model:** `GEMINI_MODELS.PRO`
- **Config:** Temperature/max tokens from request, thinking level LOW
- **Special:** Audio input transcription → text response → optional TTS
- **Result:** JSON response with text, audio, grammar feedback

### 1C. Prolog-First Routing

Before calling the LLM, paths 3-5 check if Prolog can answer:

- **File:** `server/services/prolog-llm-router.ts`
- **Trigger:** Every player message to an NPC
- **Logic:** Classifies utterance as greeting/farewell/trade query. If Prolog confidence >= 0.6, returns Prolog-generated response without LLM call.
- **Coverage:** Very limited — only simple greetings and farewells. Most messages fall through to LLM.

---

## 2. NPC-NPC Conversations

### System Prompt: `buildNpcNpcSystemPrompt()` in `npc-conversation-engine.ts:329`

```
You are simulating a conversation between two NPCs in Grand-Pré.
Léopold Laveau (Farmer) and Marie Thibodaux (Baker).
Léopold: openness 0.6, conscientiousness 0.8, extroversion 0.3, agreeableness 0.7, neuroticism 0.2
Marie: openness 0.5, conscientiousness 0.7, extroversion 0.6, agreeableness 0.8, neuroticism 0.3
They are friendly acquaintances. Topic: weather.
Environment: Late night. Season: spring.
They speak French and English. Use this language naturally in dialogue.
Write exactly 5 exchanges (10 lines total), alternating speakers.
Format each line as: "Léopold: text" or "Marie: text"
Keep it natural, brief, and in-character based on their personalities and current environment.
Léopold speaks first.
```

### LLM Call

- **File:** `npc-conversation-engine.ts:598`
- **Call:** `llm.streamCompletion("Begin the conversation about ${topic}.", context, { temperature: 0.8, maxTokens: 1024 })`
- **Trigger:** `POST /api/worlds/:worldId/npc-npc-conversation` or automatic simulation tick
- **Model:** Configured provider (Gemini PRO)
- **Result:** Full response parsed by `parseLlmConversation()` into speaker/text pairs. Relationship delta calculated (friendship +-0.02-0.05, trust at 0.5x). Falls back to template conversations if LLM fails or produces <2 exchanges.
- **Rate limit:** Max 3 concurrent NPC-NPC conversations per world

### Topic Selection

Topics selected by `selectTopics()` with personality-weighted random selection:
- Candidates: greeting, weather, work, gossip, food, family, local_events, hobby, complaint, philosophy, romance, rivalry
- Weights influenced by: shared occupation (work x1.5), openness (gossip + philosophy), agreeableness (food), extroversion (events), relationship strength (romance/rivalry gated)

### Exchange Count

Formula: `5.5 + (avgExtroversion * 2.5)`, clamped to [3, 8]. Extroverts produce longer conversations.

---

## 3. Post-Conversation Analysis

Three separate LLM calls run **after** each player-NPC chat exchange:

### 3A. Metadata Extraction

- **File:** `server/routes.ts:7110` and `http-bridge.ts:586` (fallback)
- **Call:** `ai.models.generateContent({ model: GEMINI_MODELS.FLASH, ... })`
- **Trigger:** Background call after each NPC response (`POST /api/conversation/metadata`)
- **Model:** `GEMINI_MODELS.FLASH` (fast, cheap)
- **Config:** Temperature 0.1 (near-deterministic), max tokens 1024
- **Prompt:** `buildMetadataExtractionPrompt()` from `shared/language/utils.ts:634`

**Prompt structure:**
```
You are a language learning analysis engine. Analyze this conversation exchange in French.

Player said: "bonjour comment ça va"
NPC replied: "Bonjour ? C'est le milieu de la nuit..."

Respond with ONLY valid JSON:
{
  "vocabHints": [{ "word": "...", "translation": "...", "context": "..." }],
  "grammarFeedback": {
    "status": "correct" | "corrected" | "no_target_language",
    "errors": [{ "pattern": "...", "incorrect": "...", "corrected": "...", "explanation": "..." }]
  },
  "eval": { "vocabulary": 1-5, "grammar": 1-5, "fluency": 1-5, "comprehension": 1-5, "taskCompletion": 1-5 }
}
```

**Result:** JSON parsed for vocabulary hints (3-5 words), grammar corrections, and EVAL dimension scores (1-5 per dimension). Stored in language progress tracking.

### 3B. Conversation Goal Evaluation

- **File:** `http-bridge.ts:624`
- **Call:** `ai.models.generateContent({ model: GEMINI_MODELS.FLASH, ... })`
- **Trigger:** After each exchange, if player has active quest objectives involving conversation
- **Model:** `GEMINI_MODELS.FLASH`
- **Config:** Temperature 0.0 (deterministic), max tokens 300
- **Prompt:** `buildConversationGoalPrompt()` from `http-bridge.ts:401`

**Prompt structure:**
```
You are evaluating whether a player's conversation exchange accomplished any quest objectives.

PLAYER SAID: "..."
NPC RESPONDED: "..."

ACTIVE QUEST OBJECTIVES TO EVALUATE:
1. [obj-1] (talk_to_npc): "Talk to the baker about bread"
2. [obj-2] (use_vocabulary): "Use 3 food-related words"

Return JSON array: [{ "objectiveId", "questId", "goalMet": bool, "confidence": 0-1, "extractedInfo" }]
Only set goalMet=true if confidence >= 0.7.
```

**Result:** JSON array of objective evaluations. Objectives with goalMet=true and confidence >= 0.7 are marked as progressed/completed.

### 3C. Quest Trigger Analysis

- **File:** `http-bridge.ts:368-400` (inline in streaming pipeline)
- **Trigger:** After response stored, checks if conversation triggered any quest state changes
- **Not a separate LLM call** — uses the conversation goal evaluation result from 3B

---

## 4. Conversation History Compression

- **File:** `server/services/conversation/conversation-compression.ts:142`
- **Call:** `ai.models.generateContent({ model: GEMINI_MODELS.FLASH, ... })`
- **Trigger:** Automatically when conversation history exceeds 20 messages
- **Model:** `GEMINI_MODELS.FLASH`
- **System instruction:** `"You are a conversation summarizer. Produce a concise summary... Keep the summary under 200 words."`
- **Prompt:** `"Summarize this conversation:\n\n${transcript}"`
- **Result:** Summary text replaces older messages. Recent 10 messages kept intact. On failure, falls back to synthetic marker + truncation (no silent discard after our fix).

---

## 5. Quest Generation

### Generic Quest Generation

- **File:** `shared/quests/quest-generator.ts:75`
- **Call:** `llm.generate({ prompt, systemPrompt })` (via provider interface)
- **Trigger:** World generation, player request, automatic replenishment
- **Model:** Configured provider (default Gemini PRO)
- **Prompt:** Each quest type has its own `generationPrompt()` method that builds a prompt from world context, player proficiency, target language, and quest-type-specific parameters
- **Result:** JSON quest object with title, description, objectives, rewards. Validated and bound to world entities.

### Specialized Quest Generators

All in `shared/quests/`, each calling `callLLM()`:

| Generator | Trigger | Special Prompt Features |
|-----------|---------|----------------------|
| `grammar-quest-generator.ts` | Weak grammar patterns detected | Targets specific grammar rules |
| `reading-quest-generator.ts` | Periodic / world gen | CEFR-scaled reading passages |
| `shopping-quest-generator.ts` | Near shops | Business-specific vocabulary |
| `crafting-quest-generator.ts` | Near workshops | Material/tool vocabulary |
| `multi-npc-quest-generator.ts` | Multiple NPCs available | Multi-step NPC interactions |
| `error-correction-quest-generator.ts` | Grammar errors accumulated | Targets player's weak patterns |
| `fetch-quest-generator.ts` | General | Location/item vocabulary |
| `business-roleplay-quest-generator.ts` | Near businesses | Occupation-specific dialogue |
| `number-practice-quest-generator.ts` | Low number proficiency | Quantity/price vocabulary |
| `weather-time-quest-generator.ts` | General | Time/weather expressions |
| `mystery-quest-generator.ts` | Story progression | Uses Prolog for clue validation |
| `main-quest-generator.ts` | Story milestones | Chapter-based narrative arcs |
| `adaptive-quest-generator.ts` | Player performance data | Difficulty auto-scaling |
| `comprehensive-quest-generator.ts` | Complex scenarios | Multi-part with diverse objectives |

---

## 6. Assessment & Evaluation

### Content Generation

- **File:** `routes/assessment-scoring.ts:39`
- **Trigger:** Assessment phase needs reading passages, listening prompts, or writing prompts
- **Model:** `GEMINI_MODELS.FLASH`
- **Prompt:** `buildContentGenerationPrompt()` with phase type, language, CEFR template
- **Result:** Reading passages, comprehension questions, writing prompts

### Phase Scoring

- **File:** `routes/assessment-scoring.ts:82`
- **Trigger:** Player completes an assessment phase
- **Model:** `GEMINI_MODELS.FLASH`
- **Prompt:** `buildScoringPrompt()` with answers, expected answers, rubric
- **Result:** Per-question scores, detailed feedback, dimension scores

### NPC Exam Generation

- **File:** `routes/npc-exam-routes.ts:59`
- **Trigger:** Teacher NPC initiates exam, or every 5 quests, or after 30 min gameplay
- **Model:** `GEMINI_MODELS.FLASH`
- **Prompt:** `buildExamGenerationPrompt()` with template, target language, difficulty
- **Result:** Array of exam questions with expected answers

---

## 7. Translation

### Hover-to-Translate (Single Word)

- **File:** `http-bridge.ts:691`
- **Trigger:** Player hovers over a word in-game
- **Model:** `GEMINI_MODELS.FLASH`
- **Config:** Temperature 0.1, max tokens 100, thinking MINIMAL
- **Prompt:** `"Translate the following French word to English. Return ONLY valid JSON.\n\nWord: \"bonjour\""`
- **Result:** `{ "word": "bonjour", "translation": "hello", "partOfSpeech": "interjection", "context": "..." }`
- **Caching:** Results cached in `wordTranslationCache` per world. Cache checked first; LLM only called on miss.

### Batch Translation (World Generation)

- **File:** `server/services/world-translation-generator.ts`
- **Trigger:** World creation (final step)
- **Model:** Via `batchTranslateItems()` pattern
- **Prompt:** Batches of 50 items translated via LLM
- **Result:** Translations stored in `wordTranslationCache`

### UI Translation Generation

- **File:** `server/services/ui-translation-generator.ts`
- **Trigger:** `POST /api/worlds/:worldId/ui-translations/generate`
- **Model:** Configured provider
- **Prompt:** Takes `en/common.json`, generates target language JSON
- **Result:** Full i18n resource file for target language

---

## 8. Text & Content Generation

### Reading Materials

- **File:** `server/services/text-generator.ts:199`
- **Trigger:** Procedural content generation for books, journals, letters, flyers, recipes
- **System prompt:** `"You are a language-learning content creator"`
- **Prompt:** Category + CEFR level + target language + theme/clue text
- **Result:** JSON with title, pages, vocabulary highlights, comprehension questions. Max 2 retries on JSON parse failure.

### Grammar Generation

- **File:** `server/services/grammar-generator.ts:56`
- **Trigger:** Name/procedural generation needs new Tracery grammars
- **Prompt:** Natural language description → Tracery JSON format
- **Result:** Validated Tracery grammar structure

---

## 9. Name Generation

- **File:** `server/generators/name-generator.ts` (lines 287, 361, 607, 675, 824, 1206)
- **6 distinct LLM call sites** for: settlement names, character names, character names with context, business names, street names, etc.
- **Trigger:** World/settlement/character generation (LLM is fallback when Tracery grammar-based generation fails)
- **Model:** `GEMINI_MODELS.PRO`
- **Prompt:** Context includes world type, settlement type, character gender, era, cultural setting
- **Result:** Generated name string

---

## 10. Native Audio (Voice I/O)

### Audio Chat (Audio In → Text + Audio Out)

- **File:** `server/services/gemini-native-audio.ts:90,119`
- **Two sequential calls:**
  1. `generateContent()` with `responseModalities: ['TEXT']` — extracts text response
  2. `generateContent()` with `responseModalities: ['AUDIO']` + voice config — generates audio
- **Model:** `GEMINI_MODELS.LIVE`
- **Trigger:** `POST /api/gemini/native-audio-chat`

### Text Chat with Audio Response

- **File:** `server/services/gemini-native-audio.ts:205`
- **Trigger:** `POST /api/gemini/native-text-to-audio-chat`
- **Model:** `GEMINI_MODELS.LIVE`

---

## 11. Image Generation

- **File:** `server/services/assets/image-generation.ts:112`
- **Trigger:** Visual asset generation for characters/buildings/maps
- **Model:** `GEMINI_MODELS.PRO`
- **Purpose:** Enhanced prompt generation (actual image generation deferred to external services)

---

## 12. Architecture Issues & Gaps

### Critical: Two Prompt Builders, Server Ignores Client

The SSE fallback path (`/api/conversation/stream`) always builds its own system prompt via `buildContext()` in `context-manager.ts`. The client's `buildLanguageAwareSystemPrompt()` output is passed in the request body as `systemPrompt` but **never used**. This means:

- The client's CEFR-aware language mode directives are ignored
- The client's vocabulary frequency constraints are ignored
- The client's dynamic scaffolding directives are ignored
- The client's "CRITICAL LANGUAGE RULE" enforcement is ignored
- The client's quest system declaration format is ignored

The **server-side builder does have a LANGUAGE LEARNING MODE section**, but it depends on `languageLearning` data being present in the context, which requires the world to have a target language AND the player progress to include learned vocabulary.

### Server-Side Language Learning Detection

The server's `buildContext()` at `context-manager.ts:395` detects language learning via:
```typescript
const languageLearning = world.targetLanguage && world.targetLanguage !== 'English'
  ? { targetLanguage: world.targetLanguage, targetLanguageCode: ..., playerProficiency: ..., learnedVocabulary: ... }
  : null;
```

If this is null (e.g., world.targetLanguage not set or is 'English'), the entire LANGUAGE LEARNING MODE section is skipped. The ~481-token prompt the user saw with "Directives: none detected" likely means this condition evaluated to null.

### Client vs Server Prompt Differences

| Feature | Server (`context-manager.ts`) | Client (`utils.ts`) |
|---------|-------------------------------|---------------------|
| Character identity | Full (name, gender, birth year) | Brief (name, age, gender, occupation) |
| Personality | Big Five summary | Raw trait key-value pairs |
| Relationships | Labeled (close friend, stranger, etc.) | ID counts only |
| Emotional state | Yes | No |
| Settlement context | Yes (type, description) | No |
| Weather hints | Yes | No |
| Language learning mode | Yes (if detected) | Yes (with stronger enforcement) |
| CEFR language mode | No | Yes (bilingual/simplified/natural) |
| Vocabulary frequency | No | Yes (A1: top 200, etc.) |
| Scaffolding directives | No | Yes (from difficulty monitor) |
| Quest system format | No | Yes (QUEST_ASSIGN block format) |
| Critical language rule | No | Yes (final reinforcement) |
| Character truths | No (uses DB data) | Yes (from game state) |
| Player proficiency detail | Basic (level string) | Detailed (fluency, vocab count, patterns) |

### Summary of All LLM Calls

| Category | Call Count | Models Used | When |
|----------|-----------|-------------|------|
| Player-NPC Chat | 5 paths | PRO | On each player message |
| NPC-NPC Chat | 1 | PRO | Simulation tick / API call |
| Metadata Extraction | 2 (primary + fallback) | FLASH | After each NPC response |
| Goal Evaluation | 1 | FLASH | After each exchange (if quests active) |
| History Compression | 1 | FLASH | When history > 20 messages |
| Quest Generation | 14+ generators | PRO/FLASH | World gen / replenishment |
| Assessment Content | 1 | FLASH | Assessment phase start |
| Assessment Scoring | 1 | FLASH | Assessment phase end |
| NPC Exam | 1 | FLASH | Teacher NPC / periodic |
| Word Translation | 1 | FLASH | Hover-to-translate |
| Text Generation | 1+ | Configured | Content creation |
| Grammar Generation | 1+ | Configured | Tracery grammar creation |
| Name Generation | 6 | PRO | World gen (fallback) |
| Native Audio | 2 | LIVE | Voice I/O endpoints |
| Image Generation | 1 | PRO | Asset generation |
| **Total distinct call sites** | **~50** | | |

### Dev Console Logging Tags

All chat-related LLM calls now log to `console.debug` with these tags:

| Tag | Location | What it logs |
|-----|----------|-------------|
| `[LLM:ClientPrompt]` | `BabylonChatPanel.ts` | Client-built system prompt (full text) |
| `[LLM:Context]` | `context-manager.ts` | Server-built system prompt (full text) |
| `[LLM:PlayerNPC:SSE]` | `http-bridge.ts` | SSE path: prompt + message + history + response |
| `[LLM:PlayerNPC:WS]` | `ws-bridge.ts` | WS path: prompt + message + history + response |
| `[LLM:NPC-NPC]` | `npc-conversation-engine.ts` | NPC-NPC: prompt + topic + response |
