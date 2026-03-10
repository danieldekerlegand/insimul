# Language Learning Game Roadmap

Comprehensive plan for making Insimul a full-featured language-learning virtual RPG (LLVR) platform. Covers adaptive NPC dialogue, player proficiency tracking, quest generation, vocabulary/grammar exercises, and immersive language acquisition mechanics.

## Current State

**What exists:**
- [x] `LanguageProgressTracker` — tracks vocabulary mastery, grammar patterns, conversation history, and overall fluency (0-100)
- [x] `WorldLanguage` records with `isLearningTarget` flag — unified language system (real + constructed)
- [x] Language-aware NPC system prompts — `buildLanguageAwareSystemPrompt()` adapts NPC speech to character fluency levels
- [x] Grammar feedback parsing — NPCs embed structured `**GRAMMAR_FEEDBACK**` blocks, parsed by the tracker
- [x] 10 language-learning quest objective types — `use_vocabulary`, `complete_conversation`, `practice_grammar`, etc.
- [x] VR vocabulary labels — 3D floating labels with mastery-based color coding
- [x] Conlang support — constructed languages with phonology, grammar rules, sample words injected into prompts

**What's missing or partially wired:**
- [ ] Adaptive difficulty scaling based on player fluency
- [ ] Fluency HUD or progress visualization in-game
- [ ] Grammar feedback pipeline end-to-end testing
- [ ] VR vocabulary labels fully registered to world objects
- [ ] Structured language exercises beyond conversation
- [ ] Player-facing skill tree or progression UI
- [ ] Quest generation accounting for player's current proficiency
- [ ] NPC difficulty scaled to player level
- [ ] Streak system (defined but never updated)
- [ ] Learning modules (schema exists but unused)

---

## Phase 1: Adaptive NPC Dialogue

**Goal:** NPCs dynamically adjust their language complexity to match the player's current proficiency. Lower-fluency players hear more English; higher-fluency players hear more target language.

### 1.1 Player Proficiency Signal

**Files:** `LanguageProgressTracker.ts`, `BabylonChatPanel.ts`

The tracker already computes `overallFluency` (0-100). Make this available globally:

- [ ] Expose `getProgress(): LanguageProgress` on the tracker (already exists)
- [ ] In `BabylonChatPanel`, before building the system prompt for each message, read the player's current fluency and vocabulary stats
- [ ] Define and pass a `PlayerProficiency` object into the prompt builder:
  ```typescript
  interface PlayerProficiency {
    overallFluency: number;        // 0-100
    vocabularyCount: number;       // words encountered
    masteredWordCount: number;     // words mastered
    weakGrammarPatterns: string[]; // patterns with <50% accuracy
    strongGrammarPatterns: string[]; // patterns with >80% accuracy
    conversationCount: number;     // total conversations held
  }
  ```

### 1.2 Proficiency-Aware Prompt Engineering

**File:** `shared/language-utils.ts`

- [ ] Add `buildPlayerProficiencySection(proficiency: PlayerProficiency)` function
- [ ] Implement Beginner (0-20) prompt tier — 80-90% English, 1-2 new words, warmest encouragement
- [ ] Implement Elementary (20-40) prompt tier — 30-40% target language, short sentences, gentle corrections
- [ ] Implement Intermediate (40-60) prompt tier — 50-70% target language, complex sentences, idiomatic expressions
- [ ] Implement Advanced (60-80) prompt tier — 80-95% target language, idioms, humor, cultural references
- [ ] Implement Near-native (80-100) prompt tier — 100% target language, full complexity, slang
- [ ] Inject player's weak grammar patterns so NPC focuses corrections there
- [ ] Avoid re-teaching mastered patterns
- [ ] Wire `buildPlayerProficiencySection` into `buildLanguageAwareSystemPrompt`

### 1.3 NPC Difficulty Scaling (Level Scaling)

**Files:** `BabylonGame.ts` (NPC AI loop), `shared/language-utils.ts`

- [ ] Assign each NPC a `languageDifficulty` tier based on the player's current fluency
- [ ] Scale NPC language difficulty to ±10 of player fluency within hearing radius
- [ ] Map NPC occupation to a difficulty modifier:
  - [ ] Teacher/Innkeeper/Shopkeeper: -15 (more patient, simpler language)
  - [ ] Guard/Farmer/Artisan: +0 (neutral)
  - [ ] Scholar/Noble/Merchant: +15 (more complex, less accommodation)
- [ ] Store computed `effectiveDifficulty` on each NPC's character data for prompt builder

### 1.4 NPC Behavioral Adaptations

- [ ] Beginner NPCs speak slowly (longer TTS pauses between sentences)
- [ ] Beginner NPCs use more gesture animations (body sway) and repeat key phrases
- [ ] Advanced NPCs speak at natural speed, may interrupt or challenge the player
- [ ] Patience system: low-difficulty NPCs wait longer for player responses; high-difficulty NPCs may walk away
- [ ] Hint system: if the player is silent for >10 seconds, beginner-tier NPCs offer a hint in English

---

## Phase 2: Player Proficiency Visualization

**Goal:** Show the player their language progress in-game through HUD elements, menus, and visual feedback.

### 2.1 Fluency HUD

**File:** `BabylonGUIManager.ts`

- [ ] Add persistent fluency bar (thin progress bar, 0-100%) at the top of the screen
- [ ] Add fluency level label — "Beginner", "Elementary", "Intermediate", "Advanced", "Fluent"
- [ ] Add XP animation — "+0.5 Fluency" floating text when fluency increases after a conversation
- [ ] Only display when `gameType === 'language-learning'`

### 2.2 Vocabulary Bank UI

**File:** New `client/src/components/3DGame/BabylonVocabularyPanel.ts`

- [ ] Create in-game panel opened with hotkey (e.g., `V`)
- [ ] Word grid with columns: Target Word | English | Mastery | Times Used
- [ ] Color-coded mastery: Red (new), Yellow (learning), Green (familiar), Gold (mastered)
- [ ] Category filter tabs: Greetings, Numbers, Food, Family, Nature, Actions, Colors, Time, General
- [ ] Sort options: by mastery level, alphabetical, most recent, most used
- [ ] Total stats: "47 words learned, 12 mastered, 89% grammar accuracy"
- [ ] Click a word to hear its pronunciation (TTS)

### 2.3 Grammar Progress Panel

- [ ] Grammar patterns tab in vocabulary panel with accuracy percentages
- [ ] Example corrections from NPCs (from `GrammarPattern.exampleUses`)
- [ ] Pattern explanations extracted from grammar feedback
- [ ] Weak patterns highlighted with a "Practice this!" label

### 2.4 Conversation History

- [ ] Store recent conversations with NPCs (extend `LanguageProgress.conversations`)
- [ ] Show NPC name, date, duration, fluency gained per conversation
- [ ] Show key vocabulary introduced in each conversation
- [ ] Show grammar patterns practiced
- [ ] Option to "replay" key phrases (TTS)

### 2.5 Skill Tree

- [ ] Design visual progression tree with 5 tiers
- [ ] Tier 1 (0-20): "First Words" — learn 10 basic words, complete 3 conversations
- [ ] Tier 2 (20-40): "Simple Sentences" — use 5 grammar patterns, master 20 words
- [ ] Tier 3 (40-60): "Getting Conversational" — sustain 10-turn conversations, 50% target language usage
- [ ] Tier 4 (60-80): "Fluent Speaker" — master 100 words, 80% grammar accuracy
- [ ] Tier 5 (80-100): "Near Native" — hold full conversations without English, use idioms
- [ ] Each tier unlocks new areas, NPCs, or quest types

---

## Phase 3: Structured Language Exercises

**Goal:** Go beyond free-form conversation to offer structured, gamified exercises embedded in the RPG world.

### 3.1 Visual Vocabulary (Nouns and Adjectives)

**Quest type:** `visual_vocabulary_noun`

- [ ] NPC gives quest: "Bring me the red apple from the market"
- [ ] Player identifies and collects the correct object from labeled objects
- [ ] Extend `VRVocabularyLabels` to support clickable/interactive labels
- [ ] Add `visual_vocabulary` quest objective type
- [ ] Quest generator picks random nouns + adjectives from WorldLanguage sample words
- [ ] Variant: "Find something blue in this room" — player clicks correct object

### 3.2 Visual Vocabulary (Verbs and Adverbs)

**Quest type:** `visual_vocabulary_verb`

- [ ] NPC gives quest: "Find the person who is dancing slowly"
- [ ] NPCs perform visible actions (walking, talking, eating, dancing)
- [ ] Player identifies the NPC performing the correct verb + adverb combination
- [ ] Add more NPC animation types (eating, reading, waving, sitting)

### 3.3 Listening Comprehension

**Quest type:** `listening_comprehension`

- [ ] NPC tells a short story in the target language via TTS
- [ ] Player goes to another NPC and answers comprehension questions
- [ ] Quest generator creates story snippet + 3 comprehension questions
- [ ] Difficulty scales: beginner = English questions; advanced = all target-language
- [ ] AI evaluates whether player's answer demonstrates comprehension

### 3.4 Follow Instructions

**Quest type:** `follow_instructions`

- [ ] NPC gives instructions entirely in the target language
- [ ] Beginner: "Go to the market" (one step, with English hint)
- [ ] Intermediate: "Go to the market, buy fish, bring it to the restaurant" (multi-step)
- [ ] Advanced: multi-step with conditions and time constraints
- [ ] Player parses instructions and completes the sequence

### 3.5 Translation Challenges

**Quest type:** `translation_challenge`

- [ ] NPC presents a phrase in English; player types it in the target language (or vice versa)
- [ ] AI evaluates translation for accuracy, grammar, and nuance
- [ ] Difficulty scales by phrase complexity
- [ ] Streak bonuses: 5 correct in a row = bonus XP

### 3.6 Navigate by Language

**Quest type:** `navigate_language`

- [ ] NPC gives directions in the target language ("Turn left at the fountain...")
- [ ] Player physically navigates the 3D world following directions
- [ ] Arrival at correct location completes the objective
- [ ] GPS-style waypoints only appear if the player asks for help (English fallback)

### 3.7 Time-Based Activities

**Quest type:** `time_activity`

- [ ] NPC says: "Meet me at the plaza at three o'clock" (in target language)
- [ ] Player understands the time reference and arrives at the correct in-game time
- [ ] Teaches numbers, time vocabulary, and cultural time conventions

### 3.8 Vocabulary Scavenger Hunt

**Quest type:** `vocabulary_hunt`

- [ ] Player receives a list of 5-10 words in the target language
- [ ] Must find matching objects in the 3D world and "collect" them (click/interact)
- [ ] Objects use VR vocabulary labels
- [ ] Categories rotate: food words, building words, color words, etc.

---

## Phase 4: Quest Generation and Difficulty

**Goal:** Dynamically generate quests that match the player's current proficiency and target their weak areas.

### 4.1 Proficiency-Aware Quest Generation

**Files:** `server/services/quest-generator.ts`, `shared/quest-types/language-learning.ts`

- [ ] Include player proficiency data in the quest generation prompt
- [ ] Target player's weak grammar patterns and under-used vocabulary
- [ ] Use vocabulary the player already knows where possible
- [ ] Introduce an appropriate number of new words for their level
- [ ] Mix 1-2 below-level quests (confidence) with 1 at-level quest (growth)

### 4.2 Quest Difficulty Tiers Aligned to Proficiency

- [ ] Beginner (0-20 fluency): 10-20% target language, 1-3 new words, simple objectives
- [ ] Elementary (20-40): 20-40% target language, 3-5 new words, multi-step objectives
- [ ] Intermediate (40-60): 40-60% target language, 5-8 new words, complex objectives
- [ ] Advanced (60-80): 60-80% target language, 8-12 new words, nuanced objectives
- [ ] Expert (80-100): 80-100% target language, 12+ new words, full immersion objectives

### 4.3 Quest Post-Conditions

- [ ] Conversation quests: minimum turns, target-language usage %, specific vocabulary, grammar accuracy
- [ ] Vocabulary quests: correctly identify N objects, use N new words, achieve "learning" mastery
- [ ] Grammar quests: receive feedback on specific pattern, demonstrate correct usage N times, accuracy threshold
- [ ] Navigation quests: arrive at correct location within time limit, bonus for no English hints

### 4.4 Dynamic Quest Board

- [ ] NPCs offer quests based on player's current weak areas
- [ ] Prioritize quests targeting weak grammar/vocabulary
- [ ] Vary quest types (time since last quest of each type)
- [ ] Consider player's conversation history with each NPC (continuity)
- [ ] Match quest difficulty to player's overall fluency

---

## Phase 5: Feedback and Analysis

**Goal:** Provide rich, immediate feedback on every player interaction to accelerate learning.

### 5.1 Real-Time Grammar Feedback

**Files:** `BabylonChatPanel.ts`, `LanguageProgressTracker.ts`

- [ ] Inline highlighting: highlight grammar errors in player's own text (red underline) with hover tooltips
- [ ] Correction toast: "Tip: 'je suis alle' -> 'je suis allé(e)' (past participle agreement)"
- [ ] Pattern tracking: after 3 errors of same type, show "Grammar Focus" popup with rule explanation

### 5.2 Pronunciation Feedback (TTS + STT)

- [ ] Detect browser speech recognition support (`webkitSpeechRecognition`)
- [ ] Allow player to speak instead of typing
- [ ] STT transcription of player speech
- [ ] Compare transcription to expected phrase
- [ ] Score pronunciation accuracy (word-level matching)
- [ ] Show feedback: "You said 'bone-joor', try 'bohn-ZHOOR'"

### 5.3 Conversation Quality Scoring

- [ ] After each conversation, show a summary card with:
  - [ ] Fluency gained
  - [ ] New words learned (listed)
  - [ ] Grammar accuracy percentage
  - [ ] Target language usage percentage
  - [ ] Star rating (1-5, composite score)

### 5.4 Spaced Repetition Integration

- [ ] Track when each word was last used
- [ ] Flag words not used in N conversations for review
- [ ] NPCs proactively use "review words" in their dialogue
- [ ] Quest generator creates review quests targeting stale vocabulary
- [ ] Vocabulary bank shows "Due for review" badge on words

---

## Phase 6: Immersive World Features

**Goal:** Make the 3D world itself a language-learning environment.

### 6.1 Bilingual Signage

**File:** `ProceduralBuildingGenerator.ts` or new `SignGenerator.ts`

- [ ] Buildings have signs in the target language
- [ ] Beginner mode: "Boulangerie (Bakery)" — English subtitle
- [ ] Intermediate mode: "Boulangerie" — no subtitle
- [ ] Advanced mode: "Boulangerie artisanale - Pain frais tous les jours" — full target-language detail
- [ ] Clicking a sign adds its vocabulary to the player's word bank

### 6.2 Environmental Audio

- [ ] Ambient audio snippets in the target language (market chatter, radio broadcasts, announcements)
- [ ] Volume/frequency increases with player proficiency
- [ ] Subtitles available (toggleable)

### 6.3 Interactive Objects

- [ ] All interactable objects labeled in the target language (extend VR vocabulary labels)
- [ ] Hovering over an object shows its name in the target language
- [ ] Clicking plays TTS pronunciation
- [ ] First interaction with a new word adds it to the vocabulary bank

### 6.4 Cultural Events

- [ ] Periodic in-game events tied to the target language's culture (festivals, holidays, ceremonies)
- [ ] NPCs discuss the event in the target language
- [ ] Special quests during events teach cultural vocabulary and customs
- [ ] Example: French world "Bastille Day" event with themed decorations and NPCs

### 6.5 Newspaper / Notice Board

- [ ] Notice board in each settlement with short articles in the target language
- [ ] Articles get harder as player proficiency increases
- [ ] Clicking a word in the article looks it up and adds to vocabulary bank
- [ ] Comprehension questions earn bonus XP

---

## Phase 7: Gamification and Rewards

**Goal:** Make language learning addictive through RPG progression mechanics.

### 7.1 Experience and Leveling

- [ ] XP earned from conversations, quests, vocabulary mastery, grammar accuracy
- [ ] Level up thresholds correspond to fluency tiers (Level 1-5 = Beginner, 6-10 = Elementary, etc.)
- [ ] Level-up animations and rewards
- [ ] Each level unlocks new areas of the world or new NPCs to talk to

### 7.2 Achievement System

- [ ] "First Words" — learn your first 10 words
- [ ] "Chatterbox" — complete 25 conversations
- [ ] "Grammar Guru" — achieve 90% accuracy on 5 grammar patterns
- [ ] "Cultural Explorer" — complete 5 cultural quests
- [ ] "Polyglot" — reach intermediate fluency
- [ ] "Bookworm" — read 10 notice board articles
- [ ] "Navigator" — complete 5 navigation quests without English hints
- [ ] "Streak Master" — maintain a 7-day learning streak

### 7.3 Daily Challenges

- [ ] One new challenge per day: "Use 5 food-related words today" or "Have a conversation using only the target language"
- [ ] Streak bonuses: consecutive daily completions multiply XP
- [ ] Reset at midnight in-game time

### 7.4 Unlockable Content

- [ ] New settlements: unlock new towns/cities at fluency milestones
- [ ] New NPC types: scholars and nobles only appear after reaching intermediate
- [ ] New quest types: translation and cultural quests unlock at intermediate; navigation and time quests at advanced
- [ ] Cosmetic rewards: character outfits, home decorations earned from language achievements

### 7.5 Leaderboards (Optional / Multiplayer)

- [ ] Weekly fluency gain leaderboard
- [ ] Most words mastered leaderboard
- [ ] Fastest quest completion leaderboard

---

## Phase 8: Content Generation Pipeline

**Goal:** Ensure all generated content (NPCs, quests, world descriptions, items) respects the target language.

### 8.1 Bilingual Name Generation

- [ ] Settlement names generated in the target language (with English translation stored)
- [ ] NPC names appropriate to the target language's culture
- [ ] Building/shop names in the target language
- [ ] Item names with target-language variants

### 8.2 Character Language Profile Generation

- [ ] Assign each character a primary language (target language for most NPCs)
- [ ] Assign English fluency (varies: some bilingual, some monolingual)
- [ ] Assign difficulty tier based on occupation and personality
- [ ] Assign vocabulary specialization (baker = food words; scholar = academic words)
- [ ] Store as structured fields (not just truths) for reliable prompt construction

### 8.3 Quest Template Library

- [ ] Pre-author quest templates for each exercise type, parameterized by:
  - [ ] Target vocabulary set (from WorldLanguage sample words)
  - [ ] Grammar patterns to practice
  - [ ] Difficulty level
  - [ ] Location in the world
  - [ ] NPC assignment
- [ ] AI fills in narrative flavor around templates

### 8.4 Vocabulary Corpus per WorldLanguage

- [ ] Extend `WorldLanguage.sampleWords` from 30 words to 500+ words
- [ ] Organize by category: greetings, numbers (1-100), food, family, body, emotions, actions, colors, time, places, professions, nature, weather, transportation, clothing, household, animals
- [ ] Each word has: target form, English translation, part of speech, difficulty tier, pronunciation guide
- [ ] Generate at world creation time (offline + LLM enrichment)
- [ ] Store in the WorldLanguage record

---

## Implementation Priority

| Priority | Phase | Effort | Impact |
|----------|-------|--------|--------|
| P0 | 1.1-1.2 (Proficiency-aware prompts) | Medium | Critical — makes NPC dialogue actually adaptive |
| P0 | 2.1 (Fluency HUD) | Small | Critical — player needs to see their progress |
| P0 | 4.1-4.2 (Proficiency-aware quest gen) | Medium | Critical — quests must match player level |
| P1 | 1.3-1.4 (NPC difficulty scaling) | Medium | High — makes the world feel responsive |
| P1 | 3.1, 3.4, 3.8 (Visual vocab, follow instructions, scavenger hunt) | Large | High — structured exercises beyond conversation |
| P1 | 5.1, 5.3 (Grammar feedback, conversation scoring) | Medium | High — immediate feedback accelerates learning |
| P2 | 2.2-2.3 (Vocabulary bank, grammar panel) | Medium | Medium — detailed progress tracking UI |
| P2 | 3.3, 3.5, 3.6 (Listening, translation, navigation) | Large | Medium — variety of exercise types |
| P2 | 6.1, 6.3 (Bilingual signage, interactive objects) | Medium | Medium — immersive world |
| P2 | 7.1-7.3 (XP, achievements, daily challenges) | Medium | Medium — gamification loop |
| P3 | 2.4-2.5 (Conversation history, skill tree) | Medium | Nice to have |
| P3 | 5.2, 5.4 (Pronunciation, spaced repetition) | Large | Nice to have |
| P3 | 6.2, 6.4, 6.5 (Audio, events, newspaper) | Large | Nice to have |
| P3 | 8.1-8.4 (Content pipeline) | Large | Long-term quality |

---

## Key Files Reference

| Area | File |
|------|------|
| Player proficiency tracking | `client/src/components/3DGame/LanguageProgressTracker.ts` |
| Fluency calculation | `shared/language-progress.ts` |
| NPC prompt engineering | `shared/language-utils.ts` |
| In-game NPC chat | `client/src/components/3DGame/BabylonChatPanel.ts` |
| Editor NPC chat | `client/src/components/CharacterChatDialog.tsx` |
| Quest types | `shared/quest-types/language-learning.ts` |
| Quest generation | `server/services/quest-generator.ts` |
| VR vocabulary labels | `client/src/components/3DGame/VRVocabularyLabels.ts` |
| GUI manager | `client/src/components/3DGame/BabylonGUIManager.ts` |
| World language records | `shared/language.ts` |
| Language utilities | `shared/language-utils.ts` |
| Language service | `server/services/language-service.ts` |
| World creation | `client/src/components/WorldCreateDialog.tsx` |
| Generation pipeline | `server/routes.ts` (lines 4204+) |
| Game config by genre | `shared/game-genres/index.ts` |
| NPC AI behavior loop | `client/src/components/3DGame/BabylonGame.ts` (lines 4739+) |
