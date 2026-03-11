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
- [x] Adaptive difficulty scaling based on player fluency
- [x] Fluency HUD or progress visualization in-game
- [ ] Grammar feedback pipeline end-to-end testing
- [ ] VR vocabulary labels fully registered to world objects
- [x] Structured language exercises beyond conversation (quest templates, vocabulary corpus, notice board)
- [x] Player-facing skill tree or progression UI
- [x] Quest generation accounting for player's current proficiency
- [x] NPC difficulty scaled to player level
- [x] Streak system with daily challenge streak bonuses
- [ ] Learning modules (schema exists but unused)
- [x] World creation/editing migrated from `targetLanguage` to WorldLanguage with `isLearningTarget`
- [ ] @babylonjs/gui ScrollViewer/StackPanel not rendering (possible version conflict)

---

## Phase 1: Adaptive NPC Dialogue

**Goal:** NPCs dynamically adjust their language complexity to match the player's current proficiency. Lower-fluency players hear more English; higher-fluency players hear more target language.

### 1.1 Player Proficiency Signal

**Files:** `LanguageProgressTracker.ts`, `BabylonChatPanel.ts`

The tracker already computes `overallFluency` (0-100). Make this available globally:

- [x] Expose `getProgress(): LanguageProgress` on the tracker (already exists)
- [x] In `BabylonChatPanel`, before building the system prompt for each message, read the player's current fluency and vocabulary stats
- [x] Define and pass a `PlayerProficiency` object into the prompt builder:
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

- [x] Add `buildPlayerProficiencySection(proficiency: PlayerProficiency)` function
- [x] Implement Beginner (0-20) prompt tier — 80-90% English, 1-2 new words, warmest encouragement
- [x] Implement Elementary (20-40) prompt tier — 30-40% target language, short sentences, gentle corrections
- [x] Implement Intermediate (40-60) prompt tier — 50-70% target language, complex sentences, idiomatic expressions
- [x] Implement Advanced (60-80) prompt tier — 80-95% target language, idioms, humor, cultural references
- [x] Implement Near-native (80-100) prompt tier — 100% target language, full complexity, slang
- [x] Inject player's weak grammar patterns so NPC focuses corrections there
- [x] Avoid re-teaching mastered patterns
- [x] Wire `buildPlayerProficiencySection` into `buildLanguageAwareSystemPrompt`

### 1.3 NPC Difficulty Scaling (Level Scaling)

**Files:** `BabylonGame.ts` (NPC AI loop), `shared/language-utils.ts`

- [x] Assign each NPC a `languageDifficulty` tier based on the player's current fluency
- [x] Scale NPC language difficulty to ±15 of player fluency based on occupation
- [x] Map NPC occupation to a difficulty modifier:
  - [x] Teacher/Innkeeper/Shopkeeper: -15 (more patient, simpler language)
  - [x] Guard/Farmer/Artisan: +0 (neutral)
  - [x] Scholar/Noble/Merchant: +15 (more complex, less accommodation)
- [x] Store computed `effectiveDifficulty` on each NPC's character data for prompt builder

### 1.4 NPC Behavioral Adaptations

- [x] Beginner NPCs speak slowly (shorter sentences in prompt, gesture descriptions)
- [x] Beginner NPCs use more gesture animations (body language descriptions in prompt)
- [x] Advanced NPCs speak at natural speed, may playfully challenge the player
- [x] Patience system: low-difficulty NPCs wait longer for player responses; high-difficulty NPCs may walk away
- [x] Hint system: if the player is silent for >10 seconds, beginner-tier NPCs offer a hint in English

---

## Phase 2: Player Proficiency Visualization

**Goal:** Show the player their language progress in-game through HUD elements, menus, and visual feedback.

### 2.1 Fluency HUD

**File:** `BabylonGUIManager.ts`

- [x] Add persistent fluency bar (thin progress bar, 0-100%) at the top of the screen
- [x] Add fluency level label — "Beginner", "Elementary", "Intermediate", "Advanced", "Fluent"
- [x] Add XP animation — "+0.5 Fluency" floating text when fluency increases after a conversation
- [x] Only display when `gameType === 'language-learning'`

### 2.2 Vocabulary Bank UI

**File:** New `client/src/components/3DGame/BabylonVocabularyPanel.ts`

- [x] Create in-game panel opened with hotkey (e.g., `V`)
- [x] Word grid with columns: Target Word | English | Mastery | Times Used
- [x] Color-coded mastery: Red (new), Yellow (learning), Green (familiar), Gold (mastered)
- [x] Category filter tabs: Greetings, Numbers, Food, Family, Nature, Actions, Colors, Time, General
- [x] Sort options: by mastery level, alphabetical, most recent, most used
- [x] Total stats: "47 words learned, 12 mastered, 89% grammar accuracy"
- [x] Click a word to hear its pronunciation (TTS via speaker button + /api/tts)

### 2.3 Grammar Progress Panel

- [x] Grammar patterns tab in vocabulary panel with accuracy percentages
- [x] Example corrections from NPCs (from `GrammarPattern.exampleUses`)
- [x] Pattern explanations extracted from grammar feedback
- [x] Weak patterns highlighted with a "Practice this!" label

### 2.4 Conversation History

- [x] Store recent conversations with NPCs (extend `LanguageProgress.conversations`)
- [x] Show NPC name, date, duration, fluency gained per conversation
- [x] Show key vocabulary introduced in each conversation
- [x] Show grammar patterns practiced (grammar accuracy % per conversation)
- [x] Option to "replay" key phrases (TTS available via speakWord/textToSpeech)

### 2.5 Skill Tree

- [x] Design visual progression tree with 5 tiers
- [x] Tier 1 (0-20): "First Words" — learn 10 basic words, complete 3 conversations
- [x] Tier 2 (20-40): "Simple Sentences" — use 5 grammar patterns, master 20 words
- [x] Tier 3 (40-60): "Getting Conversational" — sustain 10-turn conversations, 50% target language usage
- [x] Tier 4 (60-80): "Fluent Speaker" — master 100 words, 80% grammar accuracy
- [x] Tier 5 (80-100): "Near Native" — hold full conversations without English, use idioms
- [x] Each tier unlocks new areas, NPCs, or quest types (via ContentGatingManager)

---

## Phase 3: Structured Language Exercises

**Goal:** Go beyond free-form conversation to offer structured, gamified exercises embedded in the RPG world.

### 3.1 Visual Vocabulary (Nouns and Adjectives)

**Quest type:** `visual_vocabulary_noun`

- [x] NPC gives quest: "Bring me the red apple from the market"
- [x] Player identifies and collects the correct object from labeled objects
- [x] Extend `VRVocabularyLabels` to support clickable/interactive labels
- [x] Add `visual_vocabulary` quest category and `identify_object` objective type
- [x] Quest generator includes visual vocabulary in generation prompt
- [x] Variant: "Find something blue in this room" — find_by_description quest template

### 3.2 Visual Vocabulary (Verbs and Adverbs)

**Quest type:** `visual_vocabulary_verb`

- [ ] NPC gives quest: "Find the person who is dancing slowly"
- [ ] NPCs perform visible actions (walking, talking, eating, dancing)
- [ ] Player identifies the NPC performing the correct verb + adverb combination
- [ ] Add more NPC animation types (eating, reading, waving, sitting)

### 3.3 Listening Comprehension

**Quest type:** `listening_comprehension`

- [x] NPC tells a short story in the target language via TTS (onStoryTTS callback)
- [x] Player goes to another NPC and answers comprehension questions
- [x] Quest generator creates story snippet + 3 comprehension questions
- [x] Difficulty scales: beginner = English questions; advanced = all target-language
- [x] AI evaluates whether player's answer demonstrates comprehension

### 3.4 Follow Instructions

**Quest type:** `follow_instructions`

- [x] Add `follow_instructions` quest category and `follow_directions` objective type
- [x] Beginner: "Go to the market" (one step, with English hint)
- [x] Intermediate: "Go to the market, buy fish, bring it to the restaurant" (multi-step)
- [x] Advanced: multi-step with conditions and time constraints (timeLimitSeconds, checkTimedObjectives)
- [x] Player parses instructions and completes the sequence

### 3.5 Translation Challenges

**Quest type:** `translation_challenge`

- [x] NPC presents a phrase in English; player types it in the target language (or vice versa)
- [x] AI evaluates translation for accuracy, grammar, and nuance
- [x] Difficulty scales by phrase complexity
- [x] Streak bonuses: 5 correct in a row = bonus XP (via translation_streak in QuestPostConditionValidator)

### 3.6 Navigate by Language

**Quest type:** `navigate_language`

- [x] NPC gives directions in the target language ("Turn left at the fountain...")
- [x] Player physically navigates the 3D world following directions
- [x] Arrival at correct location completes the objective
- [x] GPS-style waypoints only appear if the player asks for help (requestNavigationHint)

### 3.7 Time-Based Activities

**Quest type:** `time_activity`

- [x] Quest templates: time_appointment and daily_schedule in language-quest-templates.ts
- [ ] In-game time system integration (requires game clock)
- [x] Time vocabulary via vocabulary corpus (numbers, time categories)

### 3.8 Vocabulary Scavenger Hunt

**Quest type:** `vocabulary_hunt`

- [x] Add `scavenger_hunt` quest category and `find_vocabulary_items` objective type
- [x] Must find matching objects in the 3D world and "collect" them (click/interact)
- [x] Objects use VR vocabulary labels
- [x] Categories rotate: 10 categories cycle via getNextScavengerCategory()

---

## Phase 4: Quest Generation and Difficulty

**Goal:** Dynamically generate quests that match the player's current proficiency and target their weak areas.

### 4.1 Proficiency-Aware Quest Generation

**Files:** `server/services/quest-generator.ts`, `shared/quest-types/language-learning.ts`

- [x] Include player proficiency data in the quest generation prompt
- [x] Target player's weak grammar patterns and under-used vocabulary
- [x] Use vocabulary the player already knows where possible
- [x] Introduce an appropriate number of new words for their level
- [x] Mix 1-2 below-level quests (confidence) with 1 at-level quest (growth)

### 4.2 Quest Difficulty Tiers Aligned to Proficiency

- [x] Beginner (0-20 fluency): 10-20% target language, 1-3 new words, simple objectives
- [x] Elementary (20-40): 20-40% target language, 3-5 new words, multi-step objectives
- [x] Intermediate (40-60): 40-60% target language, 5-8 new words, complex objectives
- [x] Advanced (60-80): 60-80% target language, 8-12 new words, nuanced objectives
- [x] Expert (80-100): 80-100% target language, 12+ new words, full immersion objectives

### 4.3 Quest Post-Conditions

- [x] Conversation quests: minimum turns, target-language usage %, specific vocabulary, grammar accuracy
- [x] Vocabulary quests: correctly identify N objects, use N new words, achieve "learning" mastery
- [x] Grammar quests: receive feedback on specific pattern, demonstrate correct usage N times, accuracy threshold
- [x] Navigation quests: arrive at correct location within time limit, bonus for no English hints

### 4.4 Dynamic Quest Board

- [x] NPCs offer quests based on player's current weak areas
- [x] Prioritize quests targeting weak grammar/vocabulary
- [x] Vary quest types (time since last quest of each type)
- [x] Consider player's conversation history with each NPC (continuity)
- [x] Match quest difficulty to player's overall fluency

---

## Phase 5: Feedback and Analysis

**Goal:** Provide rich, immediate feedback on every player interaction to accelerate learning.

### 5.1 Real-Time Grammar Feedback

**Files:** `BabylonChatPanel.ts`, `LanguageProgressTracker.ts`

- [x] Inline highlighting: color-coded grammar feedback messages (green=correct, amber=corrections, orange=focus)
- [x] Correction toast: "Tip: 'je suis alle' -> 'je suis allé(e)' (past participle agreement)"
- [x] Pattern tracking: after 3 errors of same type, show "Grammar Focus" popup with rule explanation

### 5.2 Pronunciation Feedback (TTS + STT)

- [x] Detect browser speech recognition support (MediaRecorder + getUserMedia in BabylonChatPanel)
- [x] Allow player to speak instead of typing (mic button in chat panel)
- [x] STT transcription of player speech (via /api/stt → Gemini audio understanding)
- [x] Compare transcription to expected phrase (scorePronunciation in pronunciation-scoring.ts)
- [x] Score pronunciation accuracy (word-level Levenshtein matching, 0-100%)
- [x] Show feedback: word-level corrections with close/missed/exact results

### 5.3 Conversation Quality Scoring

- [x] After each conversation, show a summary card with:
  - [x] Fluency gained
  - [x] New words learned (listed)
  - [x] Grammar accuracy percentage
  - [x] Target language usage percentage
  - [x] Star rating (1-5, composite score)

### 5.4 Spaced Repetition Integration

- [x] Track when each word was last used (via `lastEncountered` on VocabularyEntry)
- [x] Flag words not used in N conversations for review (`getWordsDueForReview()`)
- [x] Review word retrieval for NPC dialogue injection (`getReviewWordsForNPC()`)
- [ ] Quest generator creates review quests targeting stale vocabulary *(deferred)*
- [x] Vocabulary bank shows "Due for review" badge on words + "Due" sort mode

---

## Phase 6: Immersive World Features

**Goal:** Make the 3D world itself a language-learning environment.

### 6.1 Bilingual Signage

**File:** `client/src/components/3DGame/BuildingSignManager.ts`

- [x] Buildings have signs in the target language
- [x] Beginner mode: "Boulangerie (Bakery)" — English subtitle
- [x] Intermediate mode: "Boulangerie" — no subtitle
- [x] Advanced mode: "Boulangerie artisanale - Pain frais tous les jours" — full target-language detail
- [x] Clicking a sign adds its vocabulary to the player's word bank

### 6.2 Environmental Audio

- [x] Ambient audio snippets in the target language (market chatter, radio broadcasts, announcements)
- [x] Frequency increases with player proficiency (10% at beginner → 40% at advanced)
- [x] Subtitles available (toggleable, shown via toast system)

### 6.3 Interactive Objects

- [x] All interactable objects labeled in the target language (extend VR vocabulary labels)
- [x] Hovering over an object shows its name in the target language
- [x] Clicking plays TTS pronunciation (via VRVocabularyLabels.onLabelClicked → speakWord)
- [x] First interaction with a new word adds it to the vocabulary bank

### 6.4 Cultural Events

- [x] Periodic in-game events tied to the target language's culture (festivals, holidays, ceremonies)
- [x] NPCs discussion hints during events (dialogue hints available via `getEventDialogueHints()`)
- [x] Cultural vocabulary from events (French: Bastille Day, Music Festival, Market Day; Spanish: Fiesta, Mercado)
- [x] Example: French world "La Fête Nationale" event with cultural vocabulary and NPC dialogue hints

### 6.5 Newspaper / Notice Board

- [x] Notice board panel (N key) with short articles in the target language
- [x] Articles get harder as player proficiency increases (beginner/intermediate/advanced filter)
- [x] Clicking vocabulary words adds them to the vocabulary bank
- [x] Comprehension questions earn bonus XP via gamification tracker

---

## Phase 7: Gamification and Rewards

**Goal:** Make language learning addictive through RPG progression mechanics.

### 7.1 Experience and Leveling

- [x] XP earned from conversations, quests, vocabulary mastery, grammar accuracy
- [x] Level up thresholds correspond to fluency tiers (Level 1-5 = Beginner, 6-10 = Elementary, etc.)
- [x] Level-up animations and rewards
- [x] Each level unlocks new areas of the world or new NPCs to talk to (via ContentGatingManager)

### 7.2 Achievement System

- [x] "First Words" — learn your first 10 words
- [x] "Chatterbox" — complete 25 conversations
- [x] "Grammar Guru" — achieve 90% accuracy on 5 grammar patterns
- [x] "Cultural Explorer" — complete 5 cultural quests
- [x] "Polyglot" — reach intermediate fluency
- [x] "Bookworm" — read 10 notice board articles
- [x] "Navigator" — complete 5 navigation quests without English hints
- [x] "Streak Master" — maintain a 7-day learning streak

### 7.3 Daily Challenges

- [x] One new challenge per day: "Use 5 food-related words today" or "Have a conversation using only the target language"
- [x] Streak bonuses: consecutive daily completions multiply XP (1.0x base, +0.1x per day, max 2.0x)
- [x] Reset at midnight in-game time

### 7.4 Unlockable Content

- [x] New settlements: unlock new towns/cities at fluency milestones
- [x] New NPC types: scholars and nobles only appear after reaching intermediate
- [x] New quest types: translation and cultural quests unlock at intermediate; navigation and time quests at advanced
- [x] Cosmetic rewards: character outfits earned from language level milestones

### 7.5 Leaderboards (Optional / Multiplayer)

- [ ] Weekly fluency gain leaderboard
- [ ] Most words mastered leaderboard
- [ ] Fastest quest completion leaderboard

---

## Phase 8: Content Generation Pipeline

**Goal:** Ensure all generated content (NPCs, quests, world descriptions, items) respects the target language.

### 8.1 Bilingual Name Generation

**File:** `shared/bilingual-name-generation.ts`

- [x] Settlement name components per language (French, Spanish, German, Italian, Japanese)
- [x] LLM prompt builders for bilingual settlement and NPC name generation
- [x] Business/shop name translations for 20 business types across 4 languages
- [ ] Item names with target-language variants *(deferred — requires item system integration)*

### 8.2 Character Language Profile Generation

**File:** `shared/character-language-profile.ts`

- [x] Assign each character a primary language (target language for most NPCs)
- [x] Assign English fluency level (none/basic/moderate/fluent/native)
- [x] Assign difficulty tier based on occupation and personality
- [x] Assign vocabulary specialization (baker = food words; scholar = academic words) — 15 occupations mapped
- [x] Store as structured fields with `buildLanguageProfilePrompt()` for reliable prompt construction

### 8.3 Quest Template Library

**File:** `shared/language-quest-templates.ts`

- [x] Pre-author quest templates for each exercise type, parameterized by:
  - [x] Target vocabulary set (via category parameter)
  - [x] Grammar patterns to practice
  - [x] Difficulty level (beginner/intermediate/advanced)
  - [x] Location in the world (via location parameter)
  - [x] NPC assignment (via npc parameter)
- [x] 14 quest templates covering all categories
- [x] AI narrative flavor prompt builder (`buildQuestNarrativePrompt()`)

### 8.4 Vocabulary Corpus per WorldLanguage

**File:** `shared/language-vocabulary-corpus.ts`

- [x] 350+ vocabulary entries organized by 20 categories
- [x] Categories: greetings, numbers, food, family, body, emotions, actions, colors, time, places, professions, nature, weather, transportation, clothing, household, animals, shopping, directions, social
- [x] Each word has: English form, part of speech, difficulty tier, category
- [x] LLM translation prompt builder (`buildTranslationPrompt()`) for world creation
- [ ] Pronunciation guide per word *(populated via LLM at translation time)*

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
| P1 | 9.1-9.3 (Language settings migration) | Medium | High — removes broken targetLanguage path |
| P3 | 10.1-10.4 (@babylonjs/gui refactor) | Large | Nice to have — better UI rendering |

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

---

## Phase 9: Language Settings Migration

**Goal:** Migrate world creation and editing away from `targetLanguage` to use the unified `WorldLanguage` system with `isLearningTarget` flag.

### 9.1 World Creation Dialog Language Settings

**File:** `client/src/components/WorldCreateDialog.tsx`

- [x] Remove `targetLanguage` field from world creation form
- [x] Allow world creators to configure languages via WorldLanguage records with `isLearningTarget` flag
- [x] Ensure language-learning game type worlds prompt for learning target language selection through world languages

### 9.2 World Editing Language Settings

- [x] Remove any `targetLanguage` references from world editing UI
- [x] Ensure world language management (add/edit/delete WorldLanguage records) is the canonical way to set learning targets
- [x] Validate that at least one WorldLanguage has `isLearningTarget=true` for language-learning game type worlds

### 9.3 Server-Side Migration

- [x] Remove `targetLanguage` from generation config processing in `server/routes.ts`
- [x] Ensure all language-learning features read from WorldLanguage records, not from a flat `targetLanguage` field
- [x] Backward compatibility: if legacy `targetLanguage` exists, auto-create a WorldLanguage record with `isLearningTarget=true`

---

## Phase 10: @babylonjs/gui UI Refactor

**Goal:** Replace the current manual Rectangle-based UI layout with proper @babylonjs/gui widgets (ScrollViewer, StackPanel, etc.) for a polished, native-feeling game UI.

### 10.1 Investigate ScrollViewer/StackPanel Rendering Issues

- [ ] Check for version conflicts between `@babylonjs/core`, `@babylonjs/gui`, and `babylonjs` packages
- [ ] Verify that `@babylonjs/gui` and `babylonjs` aren't both loaded (dual-package conflict)
- [ ] Create minimal reproduction: ScrollViewer + StackPanel + TextBlocks in isolation
- [ ] Test with explicit sizing (no `adaptHeightToChildren`) to rule out layout calculation bugs
- [ ] Check if `AdvancedDynamicTexture.CreateFullscreenUI` vs `CreateForMesh` affects ScrollViewer

### 10.2 Chat Panel Refactor

**File:** `client/src/components/3DGame/BabylonChatPanel.ts`

- [ ] Replace Rectangle-based message area with working ScrollViewer + StackPanel
- [ ] Auto-scroll to bottom on new messages
- [ ] Proper text wrapping and dynamic height per message
- [ ] Smooth scroll animation

### 10.3 GUI Manager Refactor

**File:** `client/src/components/3DGame/BabylonGUIManager.ts`

- [ ] Audit all manual Rectangle layouts for ScrollViewer/StackPanel opportunities
- [ ] Refactor inventory, quest log, and other panels to use proper GUI widgets
- [ ] Consistent styling system (colors, fonts, spacing) across all panels

### 10.4 Export Template Compatibility

- [ ] Verify ScrollViewer/StackPanel work in exported Babylon.js standalone builds
- [ ] Test GUI widgets in Godot/Unity/Unreal export pipelines
- [ ] Document any @babylonjs/gui features that break exportability
