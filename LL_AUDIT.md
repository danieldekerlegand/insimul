# Language-Learning Feature Abstraction Audit

> **Goal:** Identify all features currently specific to the `language-learning` game type and define a path to abstract them into generic, composable modules that any genre can adopt. A game genre becomes a default "bundle" of feature modules; players can add/remove modules at will and create multiple games from the same world data.

---

## Current State

The platform already has a genre system (`shared/game-genres/`) with 15 game types and a `GenreFeatures` flag set (`inventory`, `crafting`, `combat`, `building`, etc.). However, language-learning features are **not** wired into this system — they're conditionally activated via `gameType === 'language-learning'` checks scattered throughout the codebase. This audit catalogs those features and proposes generic abstractions.

---

## Feature Inventory

### 1. Knowledge Acquisition System (currently: Vocabulary Tracking)

**Current implementation:** Tracks vocabulary words with mastery levels (new → learning → familiar → mastered), spaced repetition intervals, and quiz triggers.

| File | Role |
|------|------|
| `shared/language/progress.ts` | `VocabularyEntry` type, mastery levels |
| `shared/language/vocabulary-review.ts` | Spaced repetition intervals, quiz triggering |
| `shared/language/vocabulary-corpus.ts` | Word classification and banking |
| `client/src/components/3DGame/VocabularyCollectionSystem.ts` | In-game collection UI |
| `client/src/components/3DGame/BabylonVocabularyPanel.ts` | Vocabulary panel UI |
| `client/src/components/3DGame/VisualVocabularyDetector.ts` | Object identification by name |
| `client/src/components/3DGame/VRVocabularyLabels.ts` | VR labels on objects |
| MongoDB collection: `vocabularyentries` | Storage |

**Generic abstraction: `KnowledgeAcquisitionModule`**
- [ ] Rename concept from "vocabulary" to "knowledge entries" — any discrete learnable unit (words, recipes, lore fragments, species, spells, tech blueprints)
- [ ] Keep mastery levels but make them configurable (e.g., survival: unknown → discovered → practiced → mastered)
- [ ] Keep spaced repetition as an opt-in review strategy (useful for educational games, lore-heavy RPGs)
- [ ] Abstract `VocabularyCollectionSystem` → `KnowledgeCollectionSystem` that renders entries based on a pluggable schema (word+translation, recipe+ingredients, lore+context)
- [ ] Abstract `VisualVocabularyDetector` → `ObjectIdentificationSystem` — usable for species scanning (survival), evidence tagging (mystery), resource identification (strategy)
- [ ] Add to `GenreFeatures`: `knowledgeAcquisition: boolean`

---

### 2. Skill Proficiency System (currently: Language Proficiency / CEFR)

**Current implementation:** Tracks proficiency across 5 dimensions (vocabulary, grammar, pronunciation, listening, communication) using CEFR levels (A1–B2). Drives adaptive difficulty.

| File | Role |
|------|------|
| `shared/assessment-types.ts` | CEFR levels, 5-dimension scoring |
| `shared/language/progress.ts` | `LanguageProgress` aggregation |
| `shared/language/speech-complexity.ts` | Adaptive difficulty by proficiency |
| `client/src/components/3DGame/LanguageProgressTracker.ts` | Progress display |
| MongoDB collection: `languageprogress` | Storage |

**Generic abstraction: `ProficiencyModule`**
- [ ] Replace CEFR with a generic tier system (Novice → Apprentice → Journeyman → Expert → Master) that genres can relabel
- [ ] Replace fixed 5 dimensions with configurable dimension sets:
  - Language-learning: vocabulary, grammar, pronunciation, listening, communication
  - RPG: melee, ranged, magic, stealth, diplomacy
  - Survival: foraging, crafting, navigation, combat, shelter
  - Strategy: economics, military, diplomacy, technology, espionage
- [ ] Keep adaptive difficulty engine but parameterize it on proficiency dimensions rather than hardcoding speech complexity
- [ ] Abstract `LanguageProgressTracker` → `ProficiencyTracker` with pluggable dimension renderers
- [ ] Add to `GenreFeatures`: `proficiencyTracking: boolean`

---

### 3. Pattern Recognition System (currently: Grammar Pattern Tracking)

**Current implementation:** Tracks grammar patterns the player encounters and uses, with usage counts and examples. Provides pedagogical corrections.

| File | Role |
|------|------|
| `shared/language/progress.ts` | `GrammarPattern`, `GrammarFeedback` types |
| `client/src/components/3DGame/QuestLanguageFeedbackPanel.ts` | Feedback display |
| MongoDB collection: `grammarpatterns` | Storage |

**Generic abstraction: `PatternRecognitionModule`**
- [ ] Rename "grammar patterns" to "patterns" — any recurring structure the player learns to recognize (grammar rules, combat combos, crafting sequences, musical phrases, code patterns)
- [ ] Keep usage tracking and example collection
- [ ] Abstract feedback system: instead of grammar corrections, provide contextual coaching for any pattern type
- [ ] Add to `GenreFeatures`: `patternRecognition: boolean`

---

### 4. Assessment Framework (currently: Language Assessment / ACTFL OPI)

**Current implementation:** Multi-phase assessment sessions (pre/post/delayed) with multiple instrument types (ACTFL OPI, SUS, SSQ, IPQ). Likert scales, open-ended questions, subscale scoring.

| File | Role |
|------|------|
| `server/services/assessment-framework.ts` | Instrument definitions, scoring |
| `server/routes/assessment-routes.ts` | Assessment CRUD endpoints |
| `client/src/components/3DGame/AssessmentEngine.ts` | In-game assessment driver |
| `client/src/components/3DGame/AssessmentProgressUI.ts` | Progress display |
| `client/src/components/3DGame/AssessmentInstructionOverlay.ts` | Instruction overlay |
| `client/src/components/3DGame/PlayerAssessmentPanel.ts` | Results panel |
| `client/src/components/PlayerAssessmentDetail.tsx` | Detail view |
| MongoDB collection: `languageassessments` | Storage |

**Generic abstraction: `AssessmentModule`**
- [ ] Already mostly generic (SUS, SSQ, IPQ are not language-specific). Main work: decouple ACTFL OPI as one instrument among many
- [ ] Define instrument registry: genres register their own assessment instruments (combat proficiency test for RPG, building efficiency test for city-builder, etc.)
- [ ] Keep multi-phase structure (pre/post/delayed) — useful for any game measuring player growth
- [ ] Rename collection: `languageassessments` → `assessments`
- [ ] Add to `GenreFeatures`: `assessment: boolean`

---

### 5. NPC Examination System (currently: NPC Language Exams)

**Current implementation:** NPCs administer exams (object recognition, listening comprehension) adapted to CEFR level.

| File | Role |
|------|------|
| `server/services/npc-exam-engine.ts` | Exam generation and scoring |
| `server/routes/npc-exam-routes.ts` | Exam endpoints |

**Generic abstraction: `NPCExamModule`**
- [ ] Generalize exam types beyond language: NPCs could quiz on lore (RPG), survival skills, strategy concepts, puzzle mechanics
- [ ] Replace CEFR adaptation with proficiency-tier adaptation (from ProficiencyModule)
- [ ] Keep LLM-based generation — just parameterize the prompt with genre context
- [ ] Add to `GenreFeatures`: `npcExams: boolean`

---

### 6. Performance Scoring System (currently: Pronunciation Scoring)

**Current implementation:** Audio-level pronunciation scoring via Gemini API with phonetic similarity fallback. Per-word scoring, fluency grades, issue detection.

| File | Role |
|------|------|
| `shared/language/pronunciation-scoring.ts` | Scoring logic, grade assignment |
| `server/services/pronunciation-scorer.ts` | Gemini audio analysis |
| `shared/language/phonetic-similarity.ts` | Phonetic encoding, similarity |

**Generic abstraction: `PerformanceScoringModule`**
- [ ] Abstract as "performance analysis" — comparing player output against expected output
  - Language: pronunciation vs. expected speech
  - Music game: played notes vs. sheet music
  - Combat training: executed combo vs. expected sequence
  - Cooking sim: recipe execution vs. recipe steps
- [ ] Keep audio analysis capability but make it one "analyzer" among many (audio, input sequence, timing, etc.)
- [ ] Keep grading system (A/B/C/D or configurable tiers)
- [ ] Add to `GenreFeatures`: `performanceScoring: boolean`

---

### 7. Speech & Voice System (currently: Speech Recognition + TTS)

**Current implementation:** Web Speech API for STT, Gemini for TTS, voice WebSocket for streaming, VAD (voice activity detection).

| File | Role |
|------|------|
| `client/src/lib/speech-recognition.ts` | Web Speech API wrapper |
| `client/src/hooks/use-speech-recognition.ts` | React hook for STT |
| `server/services/voice-websocket.ts` | Voice streaming |
| `server/services/gemini-native-audio.ts` | TTS via Gemini |
| `client/src/lib/audio-utils.ts` | Audio utilities |
| `client/src/lib/use-voice-websocket.ts` | Voice WebSocket hook |

**Generic abstraction: `VoiceModule`**
- [ ] Already fairly generic. Main change: decouple from language-learning assumptions (e.g., "language hint" for recognition)
- [ ] Make voice input an alternative input method for any genre (voice commands for RTS, voice chat for multiplayer, verbal spellcasting for RPG)
- [ ] Keep TTS for NPC dialogue in any genre
- [ ] Add to `GenreFeatures`: `voiceInteraction: boolean`

---

### 8. XP & Gamification System (currently: Language Gamification)

**Current implementation:** 20-level progression with CEFR-mapped tiers, XP rewards for language activities, achievements, daily challenges.

| File | Role |
|------|------|
| `shared/language/gamification.ts` | Levels, XP thresholds, achievements, daily challenges |
| `client/src/components/3DGame/LanguageGamificationTracker.ts` | Gamification UI |

**Generic abstraction: `GamificationModule`**
- [ ] Level/XP system is inherently generic — just need to decouple reward definitions from language activities
- [ ] Define reward sources as pluggable: each module registers its own XP-granting events
  - Language: conversation, vocabulary mastery, grammar mastery
  - RPG: combat victory, quest completion, exploration
  - Survival: day survived, shelter built, creature tamed
- [ ] Keep achievement framework but make conditions module-driven (each module declares achievable milestones)
- [ ] Keep daily challenge framework with genre-appropriate challenges
- [ ] Rename tiers from CEFR-based to generic (or let genres set their own tier names)
- [ ] Abstract `LanguageGamificationTracker` → `GamificationTracker`
- [ ] Note: `experience` flag already exists in `GenreFeatures` — wire this module to that flag

---

### 9. Skill Tree System (currently: Language Skill Tree)

**Current implementation:** 4-tier skill tree with nodes like "Greetings", "Word Hunter", "Grammar Basics", unlocked by conditions (words learned, conversations had, fluency reached).

| File | Role |
|------|------|
| `shared/language/language-skill-tree.ts` | Skill tree definition, condition types |
| `client/src/components/3DGame/BabylonSkillTreePanel.ts` | Skill tree UI |

**Generic abstraction: `SkillTreeModule`**
- [ ] Tree structure is generic — just need pluggable node definitions and condition types per genre
- [ ] Condition types become module-driven: `KnowledgeAcquisitionModule` provides "entries_learned", `ProficiencyModule` provides "dimension_reached", etc.
- [ ] Each genre defines its own tree layout and node names
- [ ] Note: `skills` flag already exists in `GenreFeatures` — wire this module to that flag

---

### 10. Adaptive Difficulty System (currently: Speech Complexity)

**Current implementation:** 5 complexity levels (beginner → near-native) controlling sentence length, new words per message, grammar corrections, target language ratio, idiom usage, encouragement level.

| File | Role |
|------|------|
| `shared/language/speech-complexity.ts` | Complexity levels and adaptive parameters |

**Generic abstraction: `AdaptiveDifficultyModule`**
- [ ] Replace speech-specific parameters with a generic parameter schema that modules can extend
  - Base parameters: complexity tier, challenge intensity, hint frequency, assistance level
  - Language module adds: sentence length, new words, grammar corrections, L2 ratio
  - Combat module adds: enemy count, enemy tier, heal availability, time pressure
  - Puzzle module adds: hint count, time limit, solution complexity
- [ ] Keep the 5-tier structure (or make tiers configurable)
- [ ] Drive adaptation from `ProficiencyModule` scores
- [ ] Add to `GenreFeatures`: `adaptiveDifficulty: boolean`

---

### 11. World Language System (currently: Language Definitions)

**Current implementation:** Rich linguistic definitions per world (phonemes, grammar rules, writing systems, cultural context). Languages are generated or user-defined.

| File | Role |
|------|------|
| `shared/language/types.ts` | `WorldLanguage` type with full linguistic model |
| `server/services/language-service.ts` | Language CRUD, generation, chat |
| `server/services/item-translation.ts` | Item name translation |
| `client/src/components/languages/LanguagesHub.tsx` | Language management UI |
| MongoDB collections: `worldlanguages`, `languagechatmessages` | Storage |

**Generic abstraction: `WorldLoreModule`**
- [ ] Languages are a specific type of world lore. Abstract into a generic world lore system:
  - Language-learning: languages with full linguistic models
  - RPG: magic systems, faction lore, creature bestiaries
  - Survival: biome ecosystems, species databases
  - Strategy: civilization histories, technology trees
- [ ] Keep `WorldLanguage` as a specialization of `WorldLoreEntry`
- [ ] Language chat → Lore exploration chat (ask an NPC about any lore topic)
- [ ] Item translation → Item lore annotation (any genre-specific metadata on items)
- [ ] Add to `GenreFeatures`: `worldLore: boolean`

---

### 12. Conversation Intelligence System (currently: Conversation Records + Fluency Tracking)

**Current implementation:** Records conversations with target-language percentage, fluency gain, topic tracking. Drives XP and quest progress.

| File | Role |
|------|------|
| `shared/language/progress.ts` | `ConversationRecord` type |
| `server/extensions/tott/conversation-system.ts` | Conversation engine (partially generic) |
| MongoDB collection: `conversationrecords` | Storage |

**Generic abstraction: `ConversationAnalyticsModule`**
- [ ] Track conversation metrics per genre:
  - Language: L2 percentage, fluency gain
  - RPG: persuasion success, lore discovered, relationship change
  - Mystery: clues gathered, contradictions noted
  - Social sim: gossip spread, influence gained
- [ ] Keep conversation recording for any genre that has dialogue
- [ ] Drive quest objectives from conversation analytics
- [ ] Note: `dialogue` flag already exists in `GenreFeatures` — wire analytics to that flag

---

### 13. Onboarding System (currently: Language-Learning Onboarding)

**Current implementation:** 10-step onboarding interleaving tutorials with assessment phases, language-learning specific (arrival cinematic → movement → reading assessment → chat tutorial → writing assessment, etc.).

| File | Role |
|------|------|
| `shared/onboarding/language-onboarding.ts` | Step definitions |

**Generic abstraction: `OnboardingModule`**
- [ ] Define onboarding as a sequence of steps with pluggable step types
- [ ] Each module contributes onboarding steps:
  - Core: movement tutorial, UI tutorial, camera tutorial
  - Language module: reading assessment, writing assessment, speech practice
  - Combat module: combat tutorial, weapon selection
  - Crafting module: first craft tutorial
  - Building module: placement tutorial
- [ ] Genre defines default onboarding sequence by composing module steps
- [ ] Player can skip/revisit steps

---

### 14. Quest Types (currently: Language-Learning Quest Categories)

**Current implementation:** 13 language-specific quest categories (conversation, vocabulary, grammar, translation, cultural, visual_vocabulary, etc.) with language-specific objective and reward types.

| File | Role |
|------|------|
| `shared/quest-types/language-learning.ts` | Quest category and objective definitions |

**Generic abstraction:** Already partially done — `shared/quest-types/` has 8 genre-specific quest type files.
- [ ] Main remaining work: make quest objectives reference generic module concepts instead of hardcoded language terms
  - `use_vocabulary` → `apply_knowledge` (from `KnowledgeAcquisitionModule`)
  - `practice_grammar` → `demonstrate_pattern` (from `PatternRecognitionModule`)
  - `fluency` reward → `proficiency_gain` reward (from `ProficiencyModule`)
- [ ] Allow genres to mix quest types (RPG with language quests, survival with puzzle quests)

---

## Architecture: Feature Module System

### Proposed Module Interface

```typescript
interface FeatureModule {
  id: string;
  name: string;
  description: string;

  // What this module depends on
  dependencies: string[];  // other module IDs

  // What this module contributes
  genreFeatureFlags: string[];           // flags it registers in GenreFeatures
  questObjectiveTypes: string[];         // quest objective types it provides
  questRewardTypes: string[];            // quest reward types it provides
  proficiencyDimensions?: string[];      // dimensions it adds to ProficiencyModule
  knowledgeEntrySchema?: object;         // schema for knowledge entries it tracks
  xpEventTypes?: string[];              // XP-granting events it emits
  skillTreeConditionTypes?: string[];    // skill tree condition types it provides
  onboardingSteps?: OnboardingStep[];    // onboarding steps it contributes
  adaptiveDifficultyParams?: object;     // difficulty parameters it adds

  // Lifecycle hooks
  initialize(world: World): Promise<void>;
  onPlayerJoin(player: Player): Promise<void>;
  onTick(deltaMs: number): void;
}
```

### Proposed Genre Bundle Format

```typescript
interface GenreBundle {
  id: string;
  name: string;
  description: string;

  // Existing genre config
  genreConfig: GenreConfig;

  // Modules included by default
  defaultModules: string[];

  // Modules that can be optionally added
  compatibleModules: string[];

  // Module-specific default configurations
  moduleConfigs: Record<string, object>;
}
```

### Example Bundles

**Language-Learning Bundle:**
```
defaultModules: [
  'knowledge-acquisition',    // vocabulary tracking
  'proficiency',              // CEFR-based proficiency
  'pattern-recognition',      // grammar patterns
  'performance-scoring',      // pronunciation scoring
  'voice',                    // speech I/O
  'gamification',             // XP/levels
  'skill-tree',               // language skill tree
  'adaptive-difficulty',      // speech complexity
  'world-lore',               // world languages
  'conversation-analytics',   // fluency tracking
  'assessment',               // ACTFL OPI, etc.
  'npc-exams',                // oral exams
  'onboarding',               // language onboarding
]
```

**RPG Bundle:**
```
defaultModules: [
  'knowledge-acquisition',    // lore/bestiary collection
  'proficiency',              // combat/magic/stealth skills
  'gamification',             // XP/levels
  'skill-tree',               // ability trees
  'adaptive-difficulty',      // enemy scaling
  'world-lore',               // faction/magic lore
  'conversation-analytics',   // persuasion/relationship tracking
  'onboarding',               // combat tutorial
]
```

**Survival Bundle:**
```
defaultModules: [
  'knowledge-acquisition',    // species/resource discovery
  'proficiency',              // survival skills
  'gamification',             // XP/levels
  'adaptive-difficulty',      // environmental scaling
  'world-lore',               // biome/ecosystem data
  'onboarding',               // survival basics tutorial
]
```

---

## Implementation Phases

### Phase 1: Define the Module Interface & Registry
- [ ] Create `shared/feature-modules/types.ts` with `FeatureModule` interface
- [ ] Create `shared/feature-modules/registry.ts` — central module registry
- [ ] Create `shared/feature-modules/genre-bundles.ts` — genre → module mapping
- [ ] Extend `GenreFeatures` with new flags for each module
- [ ] Add `enabledModules: string[]` to world schema (player-customizable)

### Phase 2: Extract Knowledge Acquisition Module
- [ ] Create `shared/feature-modules/knowledge-acquisition/` with generic types
- [ ] Refactor `VocabularyEntry` → `KnowledgeEntry` with pluggable schema
- [ ] Refactor `VocabularyCollectionSystem` → `KnowledgeCollectionSystem`
- [ ] Refactor `VisualVocabularyDetector` → `ObjectIdentificationSystem`
- [ ] Language-learning registers its vocabulary-specific schema
- [ ] Rename MongoDB collection: `vocabularyentries` → `knowledgeentries` (with migration)

### Phase 3: Extract Proficiency Module
- [ ] Create `shared/feature-modules/proficiency/` with generic types
- [ ] Replace hardcoded CEFR with configurable tier system
- [ ] Replace hardcoded 5 dimensions with per-genre dimension sets
- [ ] Refactor `LanguageProgressTracker` → `ProficiencyTracker`
- [ ] Language-learning registers CEFR tiers and its 5 dimensions
- [ ] Rename MongoDB collection: `languageprogress` → `proficiencyprogress`

### Phase 4: Extract Gamification & Skill Tree Modules
- [ ] Create `shared/feature-modules/gamification/` — decouple XP sources from language activities
- [ ] Create `shared/feature-modules/skill-tree/` — pluggable tree definitions
- [ ] Refactor `LanguageGamificationTracker` → `GamificationTracker`
- [ ] Wire to existing `experience` and `skills` flags in `GenreFeatures`

### Phase 5: Extract Assessment & Scoring Modules
- [ ] Create `shared/feature-modules/assessment/` — instrument registry
- [ ] Create `shared/feature-modules/performance-scoring/` — pluggable analyzers
- [ ] Decouple ACTFL OPI as one registered instrument
- [ ] Generalize `npc-exam-engine` to work with any proficiency dimensions
- [ ] Rename MongoDB collection: `languageassessments` → `assessments`

### Phase 6: Extract Adaptive Difficulty & Conversation Analytics
- [ ] Create `shared/feature-modules/adaptive-difficulty/` — parameterized by modules
- [ ] Create `shared/feature-modules/conversation-analytics/` — genre-specific metrics
- [ ] Refactor speech complexity into one difficulty parameter set among many

### Phase 7: Extract World Lore & Voice Modules
- [ ] Create `shared/feature-modules/world-lore/` — generic lore entries
- [ ] Create `shared/feature-modules/voice/` — decouple from language assumptions
- [ ] Language-specific lore type (WorldLanguage) becomes one lore specialization

### Phase 8: Onboarding & Quest Integration
- [ ] Create `shared/feature-modules/onboarding/` — composable step sequences
- [ ] Refactor quest objective/reward types to reference modules generically
- [ ] Allow cross-genre quest type mixing

### Phase 9: UI & Player Customization
- [ ] Add module picker to world creation UI (alongside game type selection)
- [ ] Add module toggle to in-game settings (add/remove modules on existing worlds)
- [ ] Support multiple game instances per world (same world data, different module sets)

---

## Migration Strategy

Each phase should:
1. Create the generic module alongside the existing code (no breaking changes)
2. Have the language-learning code delegate to the generic module
3. Add a database migration to rename/restructure collections
4. Update API endpoints (keep old routes as aliases during transition)
5. Update client components to use generic module APIs

This ensures language-learning continues to work identically while the abstraction layer grows beneath it.

---

## Files to Update (Summary)

| Current File | Action |
|---|---|
| `shared/game-genres/types.ts` | Add new feature flags |
| `shared/schema.ts` | Add `enabledModules` to worlds |
| `shared/language/progress.ts` | Refactor to generic types |
| `shared/language/gamification.ts` | Extract to module |
| `shared/language/language-skill-tree.ts` | Extract to module |
| `shared/language/vocabulary-review.ts` | Extract to module |
| `shared/language/speech-complexity.ts` | Extract to module |
| `shared/language/pronunciation-scoring.ts` | Extract to module |
| `shared/assessment-types.ts` | Generalize tiers |
| `shared/onboarding/language-onboarding.ts` | Extract to module |
| `shared/quest-types/language-learning.ts` | Generalize objectives |
| `server/db/mongo-storage.ts` | Rename collections |
| `server/routes.ts` | Generalize endpoints |
| `server/services/assessment-framework.ts` | Instrument registry |
| `server/services/npc-exam-engine.ts` | Genre-parameterize |
| `server/services/language-service.ts` | Move under world-lore module |
| `server/services/item-translation.ts` | Generalize to item annotation |
| `client/src/components/3DGame/LanguageGamificationTracker.ts` | Rename + generalize |
| `client/src/components/3DGame/LanguageProgressTracker.ts` | Rename + generalize |
| `client/src/components/3DGame/VocabularyCollectionSystem.ts` | Rename + generalize |
| `client/src/components/3DGame/BabylonVocabularyPanel.ts` | Rename + generalize |
| `client/src/components/3DGame/BabylonSkillTreePanel.ts` | Generalize |
| `client/src/components/3DGame/QuestLanguageFeedbackPanel.ts` | Generalize |
| `client/src/components/3DGame/VisualVocabularyDetector.ts` | Rename + generalize |