# Insimul Comprehensive Testing Checklist

> **Purpose**: Manual verification of every major feature in Insimul.
> Each item should be tested in a running game world. Mark with [x] when verified working, [!] for broken/partial, [~] for not yet testable.
> **Created**: 2026-03-18

---

## 1. WORLD & PROJECT MANAGEMENT

### 1.1 World CRUD
- [ ] Create a new world with name, description, and settings
- [ ] Edit world metadata (name, description, visibility)
- [ ] Delete a world
- [ ] List all worlds with correct visibility filtering
- [ ] View single world details with ownership info
- [ ] Update 3D game configuration for a world

### 1.2 World Generation
- [ ] World generates countries on creation
- [ ] Countries contain states/regions
- [ ] States contain settlements
- [ ] Settlements have lots/parcels
- [ ] Settlement types vary (city, town, village)
- [ ] Geographic hierarchy is navigable in UI (WorldBrowser)

---

## 2. GEOGRAPHY & TERRAIN

### 2.1 Terrain Generation (3D Game)
- [ ] Heightmap terrain renders correctly in Babylon.js
- [ ] Terrain has vertex coloring (grass, dirt, rock, sand)
- [ ] Terrain slopes and elevation changes are visible
- [ ] Terrain foundations render under buildings
- [ ] Chunk-based streaming loads/unloads terrain sections

### 2.2 Water Features
- [ ] **Coastline generation** (US-031) — coastal settlements show ocean/bay
- [ ] Lakes generate within terrain
- [ ] Rivers generate and flow between areas
- [ ] Water has wave/animation effects (WaterRenderer)
- [ ] Water features listed via API (`GET /api/worlds/:worldId/water-features`)
- [ ] Water features visible on minimap

### 2.3 Vegetation & Nature
- [ ] Trees placed procedurally based on terrain type
- [ ] Grass/ground cover renders on appropriate terrain
- [ ] Vegetation density varies by biome/zone
- [ ] LOD system reduces nature detail at distance
- [ ] Different biome types produce different vegetation

### 2.4 Roads & Streets
- [ ] Roads generate between settlements (MST algorithm)
- [ ] Intra-settlement streets render
- [ ] Street network uses Voronoi/grid patterns
- [ ] Buildings align to street networks
- [ ] Roads visible on minimap/fullscreen map

---

## 3. BUILDINGS & ARCHITECTURE

### 3.1 Procedural Building Generation
- [ ] Buildings generate with correct type (residential, commercial, etc.)
- [ ] Buildings have floors, windows, doors
- [ ] Building scale varies by zone (BuildingScaleByZone)
- [ ] Chimneys, balconies, and decorations appear where appropriate
- [ ] Building signs display business/residence names

### 3.2 Building Placement
- [ ] Buildings placed on terrain without floating/clipping
- [ ] Building collision detection prevents overlap
- [ ] Buildings align to street networks

### 3.3 Building Interiors
- [ ] Player can enter buildings (BuildingEntrySystem)
- [ ] Interior rooms generate procedurally
- [ ] Furniture and objects populate interiors
- [ ] NPCs appear inside buildings doing occupation-appropriate activities
- [ ] Player can exit buildings back to exterior

### 3.4 Building Info
- [ ] Hovering/approaching a building shows info display
- [ ] Business name, owner, and type visible
- [ ] Residence occupant information accessible

---

## 4. CHARACTER & PLAYER SYSTEMS

### 4.1 Player Movement
- [ ] WASD/arrow key movement works
- [ ] Player avatar renders correctly
- [ ] Gravity and physics apply (no floating)
- [ ] Slope limits prevent climbing steep terrain
- [ ] Step-over small obstacles works
- [ ] Camera follows player smoothly

### 4.2 Camera System
- [ ] Third-person camera (default) works
- [ ] First-person camera mode works
- [ ] Camera mode switching is smooth
- [ ] Camera doesn't clip through terrain/buildings
- [ ] Zoom in/out works

### 4.3 Character Creation
- [ ] Create new character with name and attributes
- [ ] Auto-generation option populates character details
- [ ] Character personality (Big Five) can be set
- [ ] Character skills and traits assignable
- [ ] Character appearance generates (portrait)

### 4.4 Character Attributes
- [ ] Health system works (HealthBar visible)
- [ ] Equipment slots function (weapon, armor, accessories)
- [ ] Inventory accessible (I key)
- [ ] Character stats affect gameplay

---

## 5. NPC SYSTEMS

### 5.1 NPC Population
- [ ] NPCs spawn in settlement
- [ ] NPCs have unique names, appearances, personalities
- [ ] NPC count appropriate for settlement size
- [ ] NPCs have assigned occupations
- [ ] NPCs have assigned residences

### 5.2 NPC Daily Schedules
- [ ] NPCs follow morning routine
- [ ] NPCs go to work during work hours
- [ ] NPCs take lunch breaks
- [ ] NPCs socialize in evenings
- [ ] NPCs go home and sleep at night
- [ ] NPC schedule varies by personality

### 5.3 NPC Movement & Pathfinding
- [ ] NPCs walk along streets/paths
- [ ] NPCs navigate to destinations (work, home, social)
- [ ] NPCs enter/exit buildings
- [ ] NPC animation transitions (idle→walk→idle) are smooth
- [ ] NPCs avoid collision with buildings
- [ ] NPC LOD system reduces updates for distant NPCs

### 5.4 NPC Conversations (Player-Initiated)
- [ ] Player can approach and talk to NPC
- [ ] Conversation UI (BabylonChatPanel) opens
- [ ] NPC responds with contextual dialogue
- [ ] Streaming text response with typewriter effect
- [ ] Audio TTS plays for NPC speech
- [ ] Lip sync/viseme animation works
- [ ] Conversation history is saved
- [ ] Conversation can be ended properly
- [ ] NPC remembers previous conversations (NPC memory)

### 5.5 NPC-Initiated Conversations
- [ ] NPCs proactively approach player
- [ ] Approach frequency affected by NPC extroversion
- [ ] Time of day affects approach likelihood
- [ ] NPC mood affects willingness to converse
- [ ] Player can accept or decline conversation

### 5.6 NPC-to-NPC Ambient Conversations
- [ ] NPCs converse with each other autonomously
- [ ] Speech bubbles/indicators show who is talking
- [ ] Player can eavesdrop on nearby NPC conversations
- [ ] Eavesdropped content contributes to knowledge acquisition (vocabulary in language-learning, lore in RPG, etc.)
- [ ] Conversation topic is contextually appropriate

### 5.7 NPC Occupation Activities
- [ ] NPCs perform work-specific activities (baking, forging, etc.)
- [ ] Work animations play at business locations
- [ ] NPCs are at their workplace during work hours

### 5.8 NPC Social Dynamics
- [ ] NPC relationships have charge/spark/trust values
- [ ] Relationships change over time from interactions
- [ ] Salience (who NPCs pay attention to) updates
- [ ] NPCs form opinions about each other
- [ ] Social summary accessible per NPC

---

## 6. QUEST SYSTEM

### 6.1 Quest Discovery
- [ ] Quest board (DynamicQuestBoard) shows available quests
- [ ] Notice board panel accessible in-game
- [ ] NPC quest givers offer quests
- [ ] Quest indicators show on NPCs/locations

### 6.2 Quest Tracking
- [ ] Quest tracker panel (BabylonQuestTracker) shows active quests
- [ ] Quest objectives listed with completion status
- [ ] Quest waypoints/markers guide player to objectives
- [ ] Quest progress updates in real-time

### 6.3 Quest Completion
- [ ] Quest objectives can be completed
- [ ] Quest auto-completion detection works
- [ ] Post-condition validation (Prolog) functions
- [ ] Completion overlay/notification appears
- [ ] Sound effects play on completion
- [ ] Rewards are granted

### 6.4 Quest Types
- [ ] Standard fetch/deliver quests work
- [ ] Knowledge-acquisition quests function (vocabulary quests in language-learning, lore quests in RPG, etc.)
- [ ] Business roleplay quests generate and complete
- [ ] Mystery quests generate with clues
- [ ] Performance-scoring quests evaluate player output (pronunciation in language-learning, combos in RPG, etc.)
- [ ] Puzzle quests present and validate puzzles
- [ ] Recurring quests regenerate on schedule
- [ ] Quest objectives use generic module references (`apply_knowledge`, `demonstrate_pattern`, `proficiency_gain`) not hardcoded language terms

### 6.5 Quest Chains
- [ ] Multi-stage quest chains generate
- [ ] Chain progression unlocks next quest
- [ ] Chain progress trackable per player
- [ ] Quest chain templates available

### 6.6 Quest Management
- [ ] Quests can be abandoned
- [ ] Quests can be failed (timeout, wrong answer)
- [ ] Quests can be retried after failure
- [ ] Quest hints available and helpful
- [ ] Quest feedback panel shows learning/performance progress (pattern recognition feedback in language-learning)

### 6.7 Real-Time Quest Events & Feedback
- [ ] Quest-relevant events fire on GameEventBus (visited_location, talked_to_npc, used_vocabulary, etc.)
- [ ] QuestCompletionEngine matches events against active quest objectives
- [ ] Progress updates immediately and emits quest:objective_progress event
- [ ] Inline pattern feedback displays during quest conversations (green/orange/red) — grammar corrections in language-learning
- [ ] Quest completion overlay includes performance summary (from relevant modules)

### 6.8 Quest Auto-Generation & Difficulty Scaling
- [ ] When active quests drop below threshold, new quests auto-generated
- [ ] Weak-area detection (from ProficiencyModule) prioritizes quest types player needs
- [ ] At least one quest of each major category always available
- [ ] Rolling average of recent quest quality tracked for difficulty adjustment
- [ ] High quality (>85%) increases difficulty; low quality (<50%) decreases
- [ ] Quest recommendation engine scores quests on learning gaps, variety, difficulty

### 6.9 Quest Celebrations & NPC Personality
- [ ] Celebration scaled by difficulty (confetti/chime → full screen)
- [ ] NPC congratulation in target language on completion
- [ ] NPC personality influences quest dialogue style (extroversion, agreeableness, etc.)
- [ ] Business NPC thanks player personally on business quest completion

### 6.10 Specialized Quest Actions
- [ ] Ask for directions: NPC responds with verbal directions using actual street network
- [ ] Introduce self: first NPC meeting prompts introduction, quality tracked by proficiency tier
- [ ] Order food: restaurant menu displays, player orders in target language (language-learning) or genre-appropriate interaction, NPC validates

### 6.11 Onboarding Quest Sequence
- [ ] Quest 0-6 teach core mechanics (response, examine, walk, enter shop, converse, purchase, assessment)
- [ ] Each quest has pop-up tutorial explaining relevant controls
- [ ] Onboarding mandatory for first play, skippable on replay

### 6.12 Business Interactions
- [ ] Business owner NPC greets player on entry (contextual to business type)
- [ ] Greeting complexity scales with proficiency tier
- [ ] Business reputation tracked per business (Stranger → Friend)
- [ ] Higher reputation unlocks harder/more rewarding quests from that business NPC

---

## 7. FEATURE MODULE SYSTEM

> The platform uses a composable feature module architecture (`shared/feature-modules/`). Each module is genre-agnostic and can be enabled/disabled per world. Language-learning is one "genre bundle" that enables a specific set of modules. Test both the generic module behavior AND the language-learning specialization.

### 7.1 Module Registry & Genre Bundles
- [ ] Feature module registry (`shared/feature-modules/registry.ts`) loads all modules
- [ ] Genre bundles (`shared/feature-modules/genre-bundles.ts`) map genres to default module sets
- [ ] `enabledModules` array on world schema controls which modules are active
- [ ] Language-learning bundle enables all 13 modules (knowledge-acquisition, proficiency, pattern-recognition, performance-scoring, voice, gamification, skill-tree, adaptive-difficulty, world-lore, conversation-analytics, assessment, npc-exams, onboarding)
- [ ] RPG/survival/strategy bundles enable appropriate module subsets
- [ ] New `GenreFeatures` flags work: `knowledgeAcquisition`, `proficiencyTracking`, `patternRecognition`, `performanceScoring`, `voiceInteraction`, `adaptiveDifficulty`, `assessment`, `npcExams`, `worldLore`

### 7.2 Knowledge Acquisition Module (formerly Vocabulary)
- [ ] Knowledge collection panel accessible (V key) — `KnowledgeCollectionSystem.ts`
- [ ] Knowledge entries collected from game interactions (not just vocabulary words — any learnable unit)
- [ ] Entry mastery tracked with configurable levels (new → learning → familiar → mastered, or genre-specific labels)
- [ ] Category filtering works
- [ ] Sort modes function
- [ ] Object identification system (`ObjectIdentificationSystem.ts`) highlights learnable objects in world
- [ ] Approaching tagged objects triggers knowledge quiz
- [ ] Multiple-choice quizzes work
- [ ] XP awarded for correct answers
- [ ] Mastery level increases with practice
- [ ] Point-and-identify action works for any knowledge type (vocabulary, species, resources, lore)
- [ ] **Language-learning specialization**: entries are vocabulary words with translation, pronunciation, example sentences
- [ ] Spaced repetition review intervals trigger for due entries (`vocabulary-review.ts`)
- [ ] MongoDB collection: `knowledgeentries` (migrated from `vocabularyentries`)

### 7.3 Proficiency Module (formerly Language Proficiency / CEFR)
- [ ] Proficiency tracker (`ProficiencyTracker`) displays current tier and dimension scores
- [ ] Generic tier system works (Novice → Apprentice → Journeyman → Expert → Master)
- [ ] Configurable dimension sets load per genre
- [ ] **Language-learning specialization**: dimensions are vocabulary, grammar, pronunciation, listening, communication; tiers map to CEFR (A1–B2)
- [ ] Adaptive difficulty driven by proficiency scores (not hardcoded to speech complexity)
- [ ] MongoDB collection: `proficiencyprogress` (migrated from `languageprogress`)

### 7.4 Pattern Recognition Module (formerly Grammar Patterns)
- [ ] Patterns tracked with usage counts and examples
- [ ] Contextual coaching feedback displayed for any pattern type
- [ ] **Language-learning specialization**: grammar patterns with corrections via `QuestLanguageFeedbackPanel`

### 7.5 Performance Scoring Module (formerly Pronunciation Scoring)
- [ ] Performance analysis compares player output against expected output
- [ ] Pluggable analyzers: audio analyzer, input sequence, timing
- [ ] Grading system (A/B/C/D or configurable tiers) works
- [ ] **Language-learning specialization**: pronunciation scoring via Gemini audio analysis
- [ ] Phonetic similarity scoring used instead of exact string matching
- [ ] Language-specific phonetic rules applied (silent letters, liaisons)
- [ ] Partial credit given for close phonemes
- [ ] Per-word pronunciation scores returned with timing and overall grade
- [ ] Fallback to text-based scoring if audio analysis fails
- [ ] Pronunciation feedback integrated with quest completion

### 7.6 Voice Module (formerly Speech Recognition + TTS)
- [ ] Voice input captures player speech (Web Speech API)
- [ ] TTS plays for NPC dialogue (Gemini)
- [ ] Voice WebSocket streaming works
- [ ] Voice input usable as alternative input for any genre (not just language-learning)
- [ ] **Language-learning specialization**: speech-to-text compared against target phrases
- [ ] Listen & repeat: NPC repeats last phrase slowly, player uses push-to-talk (R), feedback shows matched/missed words
- [ ] VAD: hands-free mode, auto-start/stop recording, visual volume indicator
- [ ] NPC greeting audio precomputed on chat open for instant playback

### 7.7 Gamification Module (formerly Language Gamification)
- [ ] XP awarded from pluggable event sources (each module registers its own XP-granting events)
- [ ] Level progression works (generic level/XP system)
- [ ] Daily challenges appear and complete (genre-appropriate challenges)
- [ ] Achievements unlock for milestones (conditions are module-driven)
- [ ] `GamificationTracker` (formerly `LanguageGamificationTracker`) displays progress accurately
- [ ] **Language-learning specialization**: XP for conversation, vocabulary mastery, grammar mastery
- [ ] Wired to existing `experience` flag in `GenreFeatures`

### 7.8 Skill Tree Module (formerly Language Skill Tree)
- [ ] Skill tree panel (BabylonSkillTreePanel) accessible
- [ ] Pluggable tree definitions load per genre
- [ ] Skill nodes show requirements (conditions from contributing modules)
- [ ] Skills unlock as proficiency increases
- [ ] **Language-learning specialization**: 5 tiers (First Words → Near Native), language-specific nodes
- [ ] Wired to existing `skills` flag in `GenreFeatures`

### 7.9 Adaptive Difficulty Module (formerly Speech Complexity)
- [ ] Generic parameter schema works with module-contributed parameters
- [ ] Base parameters: complexity tier, challenge intensity, hint frequency, assistance level
- [ ] 5-tier difficulty structure (or genre-configurable tiers)
- [ ] Adaptation driven by `ProficiencyModule` scores
- [ ] **Language-learning specialization**: sentence length, new words per message, grammar corrections, target language ratio, idiom usage, encouragement level
- [ ] NPCs adjust complexity based on player proficiency tier
- [ ] Low tier: simple sentences, repeats key words, mixes native language
- [ ] High tier: natural speech with complex structures, minimal native language

### 7.10 World Lore Module (formerly Language Definitions)
- [ ] Generic world lore entries support multiple specializations
- [ ] Lore exploration chat works (ask NPC about any lore topic)
- [ ] Item lore annotation works (genre-specific metadata on items)
- [ ] **Language-learning specialization**: `WorldLanguage` with phonemes, grammar rules, writing systems, cultural context
- [ ] Languages generate for worlds
- [ ] Language chat interface works

### 7.11 Conversation Analytics Module (formerly Conversation Records)
- [ ] Conversation metrics tracked per genre configuration
- [ ] Conversation recording works for any genre with dialogue
- [ ] Quest objectives driven from conversation analytics
- [ ] **Language-learning specialization**: target-language percentage, fluency gain, topic tracking
- [ ] Wired to existing `dialogue` flag in `GenreFeatures`

### 7.12 Onboarding Module (formerly Language-Learning Onboarding)
- [ ] Composable step sequences from contributing modules
- [ ] Core steps: movement tutorial, UI tutorial, camera tutorial
- [ ] Genre defines default onboarding sequence by composing module steps
- [ ] Player can skip/revisit steps
- [ ] **Language-learning specialization**: reading assessment, writing assessment, speech practice interleaved with tutorials

### 7.13 Content Gating
- [ ] New settlements unlock at higher proficiency
- [ ] New NPC types unlock at higher levels
- [ ] Quest types gate behind proficiency tier
- [ ] Content gating thresholds correct

### 7.14 Quest Streak System
- [ ] Consecutive quest completions tracked without failure/abandonment
- [ ] Streak multipliers apply (2→1.1x, 5→1.25x, 10→1.5x, 20→2.0x XP)
- [ ] Current streak displayed in quest log header with flame icon
- [ ] Streak persisted in proficiency progress across sessions
- [ ] Daily quests have separate streak counter
- [ ] Business-specific streak: visiting a business daily increases NPC rapport

### 7.15 XP Award Wiring
- [ ] XP_REWARDS correctly awarded for all activity types
- [ ] Level-up checks trigger after each XP award
- [ ] Level-up emits event, displays notification, persists to playerProgress
- [ ] Skill tree unlocks trigger on level-up
- [ ] Session XP counter maintained in playerSessions
- [ ] XP persists server-side and survives page refresh

### 7.16 Achievement Detection
- [ ] Achievement detection monitors GameEventBus events (npc_talked, object_examined, npc_exam_completed, etc.)
- [ ] Achievements unlock correctly for milestones (knowledge entries, conversations, patterns, quests, streaks, etc.)
- [ ] 50 XP awarded on achievement unlock
- [ ] achievement_unlocked event fires for notification system

---

## 8. ASSESSMENT & NPC EXAM MODULES

### 8.1 Assessment Module
- [ ] Assessment can be initiated (OnboardingLauncher or manually)
- [ ] Instrument registry: genres register their own assessment instruments
- [ ] Multi-phase assessment structure works (pre/post/delayed — useful for any game measuring player growth)
- [ ] Each phase presents appropriate content
- [ ] Instruction overlay shows before each phase
- [ ] Progress UI shows current phase
- [ ] **Language-learning specialization**: 4-phase assessment (reading, writing, listening, conversation) with ACTFL OPI as one registered instrument
- [ ] Non-language instruments (SUS, SSQ, IPQ) still function correctly
- [ ] MongoDB collection: `assessments` (migrated from `languageassessments`)

### 8.2 Assessment UI
- [ ] Assessment modal displays correctly
- [ ] Answer input works (text, multiple choice, Likert scales)
- [ ] Timer functions if applicable
- [ ] Assessment can be completed

### 8.3 Assessment Results
- [ ] Results panel shows proficiency tier (generic, not hardcoded to CEFR)
- [ ] Performance breakdown by proficiency dimensions (from ProficiencyModule)
- [ ] Results persist and are accessible later
- [ ] Player assessment panel shows history

### 8.4 NPC Exam Module
- [ ] NPC-initiated quiz system triggers for any genre (lore quizzes, survival skill tests, language exams)
- [ ] Questions adapt to player's proficiency tier (from ProficiencyModule, not hardcoded CEFR)
- [ ] LLM-based generation parameterized with genre context
- [ ] Answers scored correctly
- [ ] Results emitted via event bus
- [ ] **Language-learning specialization**: object recognition, listening comprehension exams adapted to CEFR level

---

## 9. COMBAT SYSTEMS

### 9.1 Basic Combat
- [ ] Combat can be initiated
- [ ] Health system tracks damage
- [ ] Attack actions work
- [ ] Critical hits calculate correctly
- [ ] Combat UI shows health bars and damage numbers

### 9.2 Melee Combat
- [ ] Melee attacks function (FightingCombatSystem)
- [ ] Melee range detection works
- [ ] Melee animations play

### 9.3 Ranged Combat
- [ ] Ranged attacks function (RangedCombatSystem)
- [ ] Projectiles travel correctly
- [ ] Range limits enforced

### 9.4 Turn-Based Combat
- [ ] Turn-based mode initiates
- [ ] Turns alternate correctly
- [ ] Turn-based UI shows action options

---

## 10. CRAFTING & RESOURCES

### 10.1 Resource System
- [ ] Resources exist in world (wood, stone, metal, water, food)
- [ ] Resources can be harvested/collected
- [ ] Resource consumption tracked
- [ ] Resources appear in inventory

### 10.2 Crafting System
- [ ] Crafting recipes available
- [ ] Ingredients consumed on craft
- [ ] Crafted items produced correctly
- [ ] Craft time applies where appropriate

### 10.3 Survival Needs
- [ ] Hunger/thirst/fatigue/warmth tracked
- [ ] Needs decrease over time
- [ ] Auto-consumption of food/water works
- [ ] Low needs affect gameplay (speed, health)

---

## 11. INVENTORY & EQUIPMENT

### 11.1 Inventory Management
- [ ] Inventory opens with I key
- [ ] Items display with icons and names
- [ ] Item filtering works
- [ ] Item sorting works
- [ ] Items can be used/consumed

### 11.2 Equipment
- [ ] Equipment slots (weapon, armor, accessories) function
- [ ] Equipping items changes stats
- [ ] Equipment visually represented (if applicable)

### 11.3 Shopping
- [ ] Shop panel (BabylonShopPanel) opens at merchants
- [ ] Items listed with prices
- [ ] Buying items works (currency deducted, item added)
- [ ] Selling items works (currency added, item removed)
- [ ] NPC merchants have appropriate inventory

---

## 12. SOCIAL & RELATIONSHIP SYSTEMS

### 12.1 Relationships
- [ ] Player-NPC relationships tracked
- [ ] Relationship values change from interactions
- [ ] Relationship types (friend, rival, romantic) function
- [ ] Relationship visible in character info

### 12.2 Romance System
- [ ] Romance stages progress (attracted → flirting → dating → committed)
- [ ] NPC personality affects romantic acceptance/rejection
- [ ] Spark mechanic influences romance
- [ ] Marriage possible at highest stage

### 12.3 Drama Recognition
- [ ] Love triangles detected and affect behavior
- [ ] Rivalries form and escalate
- [ ] Affairs detected with consequences
- [ ] Vendetta formation from betrayal

### 12.4 Knowledge System
- [ ] NPCs have mental models of other characters
- [ ] Knowledge propagates through social networks
- [ ] Beliefs can be added and tracked
- [ ] Evidence types (12 types) function
- [ ] Family knowledge initializes correctly
- [ ] Coworker knowledge initializes correctly

---

## 13. ECONOMY

### 13.1 Wealth & Currency
- [ ] Characters have wealth values
- [ ] Money can be added/subtracted
- [ ] Wealth transfers between characters work
- [ ] Wealth distribution stats accessible per world

### 13.2 Trading
- [ ] Trade execution works
- [ ] Trade history tracked
- [ ] Market prices queryable
- [ ] Price updates function

### 13.3 Loans
- [ ] Loans can be created
- [ ] Loan repayment works
- [ ] Interest calculation (if any) correct

### 13.4 Business Economics
- [ ] Businesses have revenue/expenses
- [ ] Salary payments to employees
- [ ] Business statistics accessible

---

## 14. BUSINESS SYSTEM

### 14.1 Business CRUD
- [ ] Businesses can be founded
- [ ] Business types are diverse and appropriate
- [ ] Businesses can be closed
- [ ] Ownership can be transferred
- [ ] Business summary accessible

### 14.2 Employment
- [ ] Job candidates found for businesses
- [ ] Hiring process works
- [ ] Employee list viewable
- [ ] Firing/quitting works
- [ ] Promotion system functions
- [ ] Occupation history tracked
- [ ] 60+ occupation types available

### 14.3 Business Lifecycle
- [ ] New businesses founded over time
- [ ] Businesses close when conditions met
- [ ] Business succession on owner death
- [ ] Building commission for new businesses

---

## 15. EVENTS & LIFECYCLE

### 15.1 Life Events
- [ ] Birth events generate
- [ ] Marriage events trigger
- [ ] Death events occur
- [ ] Aging progresses over simulation time
- [ ] Grieving system activates after death

### 15.2 Town Events
- [ ] Festivals generate and occur
- [ ] Markets happen on schedule
- [ ] Weddings trigger for married couples
- [ ] Funerals occur after deaths
- [ ] Community morale affected by events
- [ ] Disasters can occur

### 15.3 Cultural Events
- [ ] Cultural event manager triggers events
- [ ] Festivals/holidays/celebrations appropriate to world

### 15.4 Education
- [ ] School enrollment works
- [ ] Graduation events trigger

---

## 16. SIMULATION ENGINE

### 16.1 Unified Engine
- [ ] Simulation runs and advances time
- [ ] Ensemble/TotT/Kismet rules evaluated
- [ ] Simulation creates visible world changes
- [ ] Simulation configurable (speed, scope)

### 16.2 Historical Simulation
- [ ] History generation produces events
- [ ] Historical events enrichable with LLM
- [ ] History timeline viewable
- [ ] Settlement history events tracked

### 16.3 Settlement Growth & Decline
- [ ] Settlements grow in population over time
- [ ] New buildings constructed as population grows
- [ ] Settlement infrastructure develops (US-065)
- [ ] Settlement decline mechanics when population drops (US-064)
- [ ] Settlement growth mechanics add physical buildings/lots (US-063)
- [ ] Settlement history tracking records changes over time (US-066)
- [ ] Nature object LOD system reduces detail at distance (US-054)

### 16.4 Genealogy
- [ ] Family trees generate correctly
- [ ] Genealogy viewer shows family relationships
- [ ] Genetic inheritance of appearance traits
- [ ] Extended family relationships (if implemented)

---

## 17. PROLOG INTEGRATION

### 17.1 Prolog Engine (Client)
- [ ] tau-prolog loads and initializes in browser
- [ ] Game facts asserted from game events
- [ ] Prolog queries return correct results
- [ ] Quest completion validated via Prolog

### 17.2 Rule Enforcement
- [ ] RuleEnforcer evaluates rules on player actions
- [ ] Rule violations detected
- [ ] Reputation impact from violations

### 17.3 Prolog Sync (Server)
- [ ] MongoDB collections sync to Prolog KB
- [ ] Characters sync (personality, skills, family)
- [ ] Relationships sync
- [ ] Settlements, businesses sync
- [ ] Items sync
- [ ] Truths sync
- [ ] Languages sync

### 17.4 Rule/Action/Quest Conversion
- [ ] Rules convert to Prolog format
- [ ] Actions convert to Prolog format
- [ ] Quests convert to Prolog format
- [ ] Batch conversion endpoint works
- [ ] Metadata extraction from Prolog content works

---

## 18. RULES & GRAMMARS

### 18.1 Rule Management
- [ ] Rules CRUD works
- [ ] Rule validation catches syntax errors
- [ ] AI rule generation produces valid rules
- [ ] AI rule editing works
- [ ] Rule categorization functions
- [ ] Bulk delete works

### 18.2 Tracery Grammars
- [ ] Grammar CRUD works
- [ ] Tracery test console expands templates
- [ ] AI grammar generation works
- [ ] Grammar extension works
- [ ] Grammar-from-examples inference works
- [ ] Template grammars available

### 18.3 Name Generation
- [ ] Batch name generation works
- [ ] Single name generation works
- [ ] Cultural name grammars available
- [ ] Generated names are culturally appropriate

---

## 19. TRUTHS & NARRATIVE

### 19.1 Truth Management
- [ ] World truths CRUD works
- [ ] Character truths CRUD works
- [ ] Truth auto-linking connects related truths
- [ ] Truth cross-reference panel shows connections
- [ ] Truth context panel shows detail
- [ ] Bulk delete works

---

## 20. ITEMS & INVENTORY (Server)

### 20.1 Item Management
- [ ] Items CRUD works
- [ ] Base items available
- [ ] Items translatable to target language
- [ ] Entity inventory queryable
- [ ] Item transfer between entities works
- [ ] Bulk delete works

---

## 21. ASSET GENERATION & MANAGEMENT

### 21.1 Portrait Generation
- [ ] Character portrait generation works
- [ ] Portrait variants generate
- [ ] Batch portrait generation works
- [ ] Portraits display in game and UI

### 21.2 Building/Map Generation
- [ ] Business exterior generation works
- [ ] Settlement map generation works
- [ ] World map generation works
- [ ] Batch building generation works

### 21.3 Texture Generation
- [ ] Texture generation works
- [ ] Texture presets available
- [ ] Batch texture generation works
- [ ] Character texture generation works

### 21.4 Sprite Generation
- [ ] Character sprite generation works
- [ ] All sprite directions generate
- [ ] Sprites display in game

### 21.5 Asset Collections
- [ ] Asset collection CRUD works
- [ ] Collections populatable from templates
- [ ] Collection export works

### 21.6 External Asset Providers
- [ ] PolyHaven search works
- [ ] PolyHaven auto-select works
- [ ] PolyHaven download and register works
- [ ] Sketchfab search works
- [ ] Sketchfab model download works
- [ ] Freesound search works
- [ ] Freesound import works

### 21.7 Asset Processing
- [ ] Image upscaling works
- [ ] Image enhancement works
- [ ] Quality assessment works
- [ ] Asset comparison works
- [ ] Asset archive/restore works

---

## 22. MAP & NAVIGATION

### 22.1 Minimap
- [ ] Minimap renders in corner
- [ ] Player position shown on minimap
- [ ] NPCs visible on minimap
- [ ] Buildings/structures shown
- [ ] Quest markers visible
- [ ] Terrain renders on minimap
- [ ] Terrain coloring from heightmap (US-039)
- [ ] Street network lines visible (US-040)
- [ ] Building footprints at higher zoom (US-041)
- [ ] Minimap zoom and interaction (US-042)

### 22.2 Fullscreen Map
- [ ] Fullscreen map opens (M key)
- [ ] Overhead view of world
- [ ] Legend shows map symbols
- [ ] Player heading indicator works
- [ ] Zoom and pan functional
- [ ] Street layer visible
- [ ] Building footprints shown
- [ ] Full-screen 2D map overlay (US-043)
- [ ] Map-based quest navigation with target-language labels

### 22.3 World/Settlement Editor Maps
- [ ] World editor displays street networks within settlements (US-045)
- [ ] World editor displays rivers, lakes, and coastlines (US-046)
- [ ] World editor has layers toggle panel (US-047)
- [ ] Settlement editor has mini-map showing lot layout, addresses, streets (US-048)

### 22.4 Ambient Knowledge Labels (formerly Vocabulary Labels)
- [ ] Floating labels appear on objects during exploration (target-language in language-learning, species/resource names in survival, lore tags in RPG)
- [ ] Labels prioritize entries player needs for active quests
- [ ] Business storefronts display name in genre-appropriate labeling (target language for language-learning)
- [ ] Clicking floating label triggers mini-interaction (hear pronunciation, see example, view lore entry)
- [ ] Labels toggleable in settings (default on for low proficiency tiers)

---

## 23. PUZZLE SYSTEM

### 23.1 Puzzle Mechanics
- [ ] Riddle puzzles function
- [ ] Combination lock puzzles work
- [ ] Environmental puzzles solvable
- [ ] Translation challenge puzzles work
- [ ] Word puzzles function

### 23.2 Puzzle UI
- [ ] Puzzle modal displays correctly
- [ ] Answer input works
- [ ] Puzzle integrated with quests

---

## 24. TEMPORARY STATES

### 24.1 State System
- [ ] Temporary states apply (grieving, excited, angry, etc.)
- [ ] States have duration and auto-expire
- [ ] States modify behavior (sociability, aggression, etc.)
- [ ] State visual indicators show on characters

---

## 25. AUDIO

### 25.1 Sound Effects
- [ ] Footstep sounds play during movement
- [ ] Combat sounds play during fights
- [ ] UI sounds play on interactions
- [ ] Door/building entry sounds

### 25.2 Environmental Audio
- [ ] Ambient soundscapes play (wind, birds, water)
- [ ] Sound varies by location (forest, city, coast)
- [ ] Audio fades with distance

### 25.3 Speech Audio
- [ ] TTS plays for NPC dialogue
- [ ] Streaming audio plays without gaps
- [ ] Audio quality adequate

---

## 26. UI PANELS & MENUS

### 26.1 GUI Manager
- [ ] All panels open and close correctly
- [ ] Panels don't overlap incorrectly
- [ ] Panel scrolling works
- [ ] Keyboard shortcuts for panels work

### 26.2 Radial Menu
- [ ] Radial context menu opens on right-click/hotkey
- [ ] Menu options contextually appropriate
- [ ] Menu actions execute correctly

### 26.3 Game Menu
- [ ] Main menu accessible
- [ ] Pause menu works
- [ ] Settings accessible and functional

### 26.4 Onboarding
- [ ] New player onboarding flow triggers
- [ ] Assessment → results → game start pipeline works
- [ ] Onboarding can be completed

### 26.5 Dialogue System
- [ ] Dialogue choices display correctly
- [ ] Selecting a choice advances conversation
- [ ] Dialogue actions execute properly

### 26.6 Rules Panel
- [ ] Rules display in-game
- [ ] Rules panel scrollable and readable

---

## 27. VR SYSTEMS

### 27.1 VR Core
- [ ] WebXR session initiates
- [ ] VR controllers detected
- [ ] Teleportation locomotion works
- [ ] Snap turning works
- [ ] Haptic feedback triggers

### 27.2 VR UI
- [ ] VR HUD renders at comfortable position
- [ ] VR chat panel readable in VR
- [ ] VR hand menu accessible
- [ ] VR vocabulary labels visible in 3D

### 27.3 VR Accessibility
- [ ] Comfort settings adjustable
- [ ] Subtitles available in VR
- [ ] Haptic patterns for feedback
- [ ] Color adjustments for accessibility

### 27.4 VR Combat
- [ ] VR combat gestures recognized
- [ ] VR hand tracking works

---

## 28. EXPORT SYSTEM

### 28.1 Intermediate Representation
- [ ] IR generation includes all world data
- [ ] IR includes terrain, entities, NPCs, rules, quests
- [ ] IR includes languages, assets, UI config
- [ ] Street networks exported in IR (US-056)
- [ ] Water features exported in IR (US-057)
- [ ] Enhanced lot and building data with street placement (US-058)
- [ ] Babylon.js scene generator uses enhanced IR data (US-059)

### 28.2 Babylon.js Export
- [ ] Babylon.js project generates
- [ ] Code generation produces valid TypeScript
- [ ] Scene generation correct
- [ ] Exported project builds and runs

### 28.3 Godot Export
- [ ] Godot project generates
- [ ] GDScript generation valid
- [ ] Scene generation correct
- [ ] Exported project opens in Godot

### 28.4 Unity Export
- [ ] Unity project generates
- [ ] C# script generation valid
- [ ] Scene generation correct
- [ ] Exported project opens in Unity

### 28.5 Unreal Export
- [ ] Unreal project generates
- [ ] C++ code generation valid
- [ ] Level generation correct
- [ ] Exported project opens in Unreal

### 28.6 Asset Bundling
- [ ] Assets bundled correctly per export
- [ ] Textures, models, audio included
- [ ] Telemetry integration per engine

---

## 29. AUTHENTICATION & MULTIPLAYER

### 29.1 Auth
- [ ] User registration works
- [ ] User login works
- [ ] Token validation works
- [ ] Unauthorized access blocked

### 29.2 Playthroughs
- [ ] New playthrough can be created
- [ ] Playthrough tracks game session
- [ ] Playthrough analytics accessible
- [ ] Multiple playthroughs per user

---

## 30. ADMIN & MANAGEMENT UI

### 30.1 World Management
- [ ] World selection screen lists worlds
- [ ] World browser filters and sorts
- [ ] World create dialog works
- [ ] World details dialog shows info
- [ ] World settings dialog saves changes

### 30.2 Character Management UI
- [ ] Character browser table shows all characters
- [ ] Character create dialog works
- [ ] Character edit dialog saves changes
- [ ] Character chat dialog opens conversation
- [ ] Hierarchical character view works

### 30.3 Quest Management UI
- [ ] Quest create dialog works
- [ ] Quests tab lists all quests
- [ ] Quests hub navigation works

### 30.4 Rule Management UI
- [ ] Rule create dialog works
- [ ] Rule convert dialog (to Prolog) works
- [ ] Rule execution sequence view displays
- [ ] Hierarchical rules tab works

### 30.5 Grammar Management UI
- [ ] Grammar editor works
- [ ] Grammar test console expands templates
- [ ] Generate grammar dialog works
- [ ] Grammars tab and hub navigate correctly

### 30.6 Location Management UI
- [ ] Locations tab shows geography
- [ ] Hierarchical location view works

### 30.7 Language Management UI
- [ ] Languages tab lists languages
- [ ] Languages hub navigates correctly

### 30.8 Visualization
- [ ] Geography map renders
- [ ] Genealogy viewer shows family trees
- [ ] History timeline view works
- [ ] Simulation timeline view works

### 30.9 Asset Management UI
- [ ] Asset browser dialog works
- [ ] Asset collection manager works
- [ ] Bulk asset import dialog works
- [ ] Model preview renders 3D models
- [ ] PolyHaven browser works
- [ ] Sketchfab browser works
- [ ] Visual asset generator dialog works
- [ ] Sprite generator dialog works
- [ ] Image upscale dialog works
- [ ] Artifact gallery displays

### 30.10 Export UI
- [ ] Export dialog works
- [ ] Engine export dialog shows options
- [ ] Import dialog works

### 30.11 Admin & Research
- [ ] Admin panel accessible
- [ ] Researcher dashboard shows analytics
- [ ] Telemetry monitor dashboard works
- [ ] Job queue viewer shows background jobs
- [ ] Generation history viewer works

### 30.12 Prolog Management UI
- [ ] Prolog knowledge base browser works
- [ ] Predicate browser lists predicates
- [ ] Predicate autocomplete/search works
- [ ] Predicate documentation accessible

### 30.13 Truth Management UI
- [ ] Truth tab lists truths
- [ ] Truth context panel shows detail
- [ ] Truth cross-reference panel works

---

## 31. TELEMETRY & MONITORING

### 31.1 Client Telemetry
- [ ] Client telemetry collector records events
- [ ] Gameplay actions tracked
- [ ] Quest progress tracked
- [ ] Errors captured

### 31.2 Server Telemetry
- [ ] Telemetry endpoints receive data
- [ ] Analytics queryable
- [ ] Telemetry dashboard shows data

### 31.3 Run Management
- [ ] Run/session lifecycle tracked
- [ ] Playtime recorded
- [ ] Session events logged

---

## 32. PERFORMANCE & STABILITY

### 32.1 3D Performance
- [ ] Frame rate stable (>30 FPS) with full settlement
- [ ] Chunk loading doesn't cause hitches
- [ ] NPC LOD system reduces distant updates
- [ ] Vegetation LOD reduces at distance
- [ ] No memory leaks during extended play

### 32.2 API Performance
- [ ] World load time acceptable
- [ ] Character list pagination works
- [ ] Batch operations don't timeout
- [ ] Concurrent requests handled properly

### 32.3 Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Missing data handled gracefully (no crashes)
- [ ] Invalid input rejected with clear errors

---

## TESTING PRIORITY ORDER

### P0 — Core Gameplay Loop
1. World creation and loading (Sections 1, 2)
2. Player movement and camera (Section 4.1, 4.2)
3. NPC spawning and basic behavior (Section 5.1, 5.2, 5.3)
4. NPC conversation (Section 5.4)
5. Quest discovery and completion (Section 6)
6. Feature module registry and genre bundles (Section 7.1)
7. Knowledge acquisition and collection (Section 7.2)

### P1 — Extended Gameplay
8. Building interiors (Section 3.3)
9. Assessment & NPC exam modules (Section 8)
10. Performance scoring & voice modules (Section 7.5, 7.6)
11. Proficiency & adaptive difficulty modules (Section 7.3, 7.9)
12. Shopping/economy (Section 11.3, 13)
13. Combat (Section 9)
14. Crafting/resources (Section 10)

### P2 — Social Simulation
15. NPC schedules and routines (Section 5.2)
16. Social dynamics (Section 5.8, 12)
17. Business system (Section 14)
18. Events and lifecycle (Section 15)
19. Simulation engine (Section 16)

### P3 — Advanced Features
20. Prolog integration (Section 17)
21. Gamification, skill tree, pattern recognition modules (Section 7.7, 7.8, 7.4)
22. Puzzles (Section 23)
23. VR (Section 27)
24. Export (Section 28)
25. Asset generation (Section 21)

### P4 — Admin & Polish
26. Module picker UI in world creation (Phase 9 from LL_AUDIT — not yet implemented)
27. All admin UI (Section 30)
28. Telemetry (Section 31)
29. Performance (Section 32)
