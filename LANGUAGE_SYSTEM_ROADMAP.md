# Language System Roadmap

## Executive Summary

This document analyzes how languages (both real-world languages and constructed languages/conlangs) are implemented in Insimul and outlines a roadmap for making the language system fully functional across the world editor and 3D test game.

---

## Current State Analysis

### Language System Architecture

#### Type Definitions

**Location:** `shared/language.ts`

Comprehensive type system including:

- **`WorldLanguage`** - Main language entity with:
  - Scope (world, country, state, settlement)
  - Kind (real or constructed)
  - Features, phonemes, grammar rules
  - Writing system, cultural context
  - Sample words and texts
  - Learning modules

- **`ConlangConfig`** - Configuration for generating constructed languages:
  - Base language influences
  - Emphasis (phonology, grammar, vocabulary)
  - Complexity level
  - Purpose (artistic, auxiliary, experimental, fictional)

- **`LanguageFeatures`** - Linguistic properties:
  - Word order (SOV, SVO, VSO, etc.)
  - Gender, case, tones
  - Morphological type (agglutinative, fusional, isolating)

#### Language Service

**Location:** `server/services/language-service.ts`

Features:
- ✅ Offline conlang generation (deterministic)
- ✅ LLM-enhanced generation (optional)
- ✅ Sample word generation from phonemes
- ✅ Grammar rule generation
- ✅ Language chat system
- ✅ CRUD operations for languages

#### Language UI

**Location:** `client/src/components/LanguagesTab.tsx`

Features:
- ✅ Language creation dialog
- ✅ Base language selection
- ✅ Conlang configuration
- ✅ Scope selection (world/country/state/settlement)
- ✅ Language listing and management

---

### Character Dialogue Language Support

#### Editor Implementation

**Location:** `client/src/components/CharacterChatDialog.tsx`

| Feature | Status | Notes |
|---------|--------|-------|
| Language fluency detection | ✅ Working | Dynamic extraction via `extractLanguageFluencies()` |
| Multi-language greeting | ✅ Working | 35+ languages via `buildGreeting()` |
| Fluency-based greeting | ✅ Working | Different greetings by skill |
| Language in system prompt | ✅ Working | Via `buildLanguageAwareSystemPrompt()` |
| All languages supported | ✅ Working | Shared `language-utils.ts` |
| Conlang support | ✅ Working | `buildConlangContext()` injects vocabulary/grammar |
| World targetLanguage | ✅ Working | Fetches `WorldLanguageContext` on open |
| Code-switching | ✅ Working | Multilingual characters mix languages naturally |
| Dynamic TTS language | ✅ Working | BCP47 codes via `getLanguageBCP47()` |

#### 3D Game Implementation

**Location:** `client/src/components/3DGame/BabylonChatPanel.ts`

| Feature | Status | Notes |
|---------|--------|-------|
| Language fluency detection | ✅ Working | Shared `language-utils.ts` |
| Multi-language greeting | ✅ Working | 35+ languages via `buildGreeting()` |
| Fluency-based greeting | ✅ Working | Different greetings by skill |
| Language in system prompt | ✅ Working | Via `buildLanguageAwareSystemPrompt()` |
| All languages supported | ✅ Working | Shared `language-utils.ts` |
| Conlang support | ✅ Working | `buildConlangContext()` injects vocabulary/grammar |
| World targetLanguage | ✅ Working | Fetches `WorldLanguageContext` on open |
| Code-switching | ✅ Working | Multilingual characters mix languages naturally |
| Dynamic TTS language | ✅ Working | BCP47 codes via `getLanguageBCP47()` |
| Vocabulary tracking | ✅ Working | `LanguageProgressTracker` analyzes messages |
| Fluency progression | ✅ Working | Calculated on conversation end |

---

### Critical Gap Analysis — ✅ ALL RESOLVED

#### 1. ~~Hardcoded French/English Only~~ → FIXED

Replaced with dynamic `extractLanguageFluencies()` in shared `language-utils.ts`. Supports 35+ languages with greetings, introductions, and BCP47 TTS codes.

#### 2. ~~Conlang System Disconnected~~ → FIXED

- ✅ Conlangs can be created with phonemes, grammar, sample words
- ✅ `buildConlangContext()` injects vocabulary/grammar into system prompts
- ✅ `buildConlangGreeting()` generates greetings from conlang sample words
- ✅ Learning exercises via language-learning quest objectives

#### 3. ~~targetLanguage Not Used in Dialogue~~ → FIXED

- ✅ Used in quest generation prompts
- ✅ `WorldLanguageContext` fetched and passed to `buildLanguageAwareSystemPrompt()`
- ✅ Characters adapt behavior to world's target language

#### 4. ~~No Language Learning Integration~~ → FIXED

- ✅ `LanguageProgressTracker` tracks vocabulary per conversation
- ✅ Mastery levels: new → learning → familiar → mastered
- ✅ Fluency gain calculated with bonuses on conversation end
- ❌ No grammar correction feedback (future enhancement)

---

## Detailed Gap Analysis

### Real Language Support

| Language | Support Level | Notes |
|----------|---------------|-------|
| English | ✅ Full | Default language |
| French | ✅ Full | Fluency-aware dialogue, TTS |
| Spanish | ✅ Full | Greetings, introductions, BCP47 |
| German | ✅ Full | Greetings, introductions, BCP47 |
| Italian | ✅ Full | Greetings, introductions, BCP47 |
| Japanese | ✅ Full | Greetings, introductions, BCP47 |
| Chinese | ✅ Full | Greetings, introductions, BCP47 |
| Arabic | ✅ Full | Greetings, introductions, BCP47 |
| 25+ others | ✅ Full | All supported via `language-utils.ts` |

### Conlang Features

| Feature | Created | Used in Dialogue |
|---------|---------|------------------|
| Phoneme inventory | ✅ Yes | ✅ Yes |
| Grammar rules | ✅ Yes | ✅ Yes |
| Sample words | ✅ Yes | ✅ Yes |
| Sample texts | ✅ Yes | ✅ Yes |
| Writing system | ✅ Yes | ✅ Yes |
| Learning modules | ✅ Yes | ✅ Yes |

---

## Roadmap

### Phase 1: Dynamic Language Detection ✅ COMPLETED

**Goal:** Support all real languages in the LANGUAGES array.

**Status:** Created `shared/language-utils.ts` with `extractLanguageFluencies()`, `buildGreeting()`, `buildLanguageAwareSystemPrompt()`, `getLanguageBCP47()`, and greetings/introductions for 35+ languages. Refactored both `CharacterChatDialog.tsx` and `BabylonChatPanel.ts` to use shared utilities, removing all hardcoded French/English logic.

#### 1.1 Refactor Language Fluency Extraction

**Files:** `CharacterChatDialog.tsx`, `BabylonChatPanel.ts`

Replace hardcoded French/English detection with dynamic system:

```typescript
interface LanguageFluency {
  language: string;
  fluency: number;
  isNative: boolean;
}

function extractLanguageFluencies(truths: Truth[]): LanguageFluency[] {
  const presentTruths = truths.filter(t => t.timestep === 0);
  const languageTruths = presentTruths.filter(t => 
    t.entryType === 'language' || 
    t.content?.includes('fluency')
  );
  
  return languageTruths.map(truth => {
    // Parse language name and fluency from truth
    const languageMatch = truth.title?.match(/(\w+) Language/) ||
                          truth.content?.match(/fluency in (\w+)/);
    const fluencyMatch = truth.content?.match(/(\d+)\/100/);
    
    return {
      language: languageMatch?.[1] || 'English',
      fluency: parseInt(fluencyMatch?.[1] || '0'),
      isNative: (truth.sourceData?.value || 0) >= 90
    };
  });
}
```

#### 1.2 Build Language-Aware System Prompt

Support any language pair in dialogue:

```typescript
function buildLanguageSection(fluencies: LanguageFluency[], targetLanguage: string): string {
  const sorted = fluencies.sort((a, b) => b.fluency - a.fluency);
  const native = sorted[0];
  
  let prompt = `LANGUAGE SKILLS:\n`;
  sorted.forEach(f => {
    const level = f.fluency >= 90 ? 'native' :
                  f.fluency >= 70 ? 'fluent' :
                  f.fluency >= 50 ? 'conversational' :
                  f.fluency >= 30 ? 'basic' : 'beginner';
    prompt += `- ${f.language}: ${f.fluency}/100 (${level})\n`;
  });
  
  prompt += `\nBEHAVIOR:\n`;
  prompt += `1. Speak ${native.language} by default.\n`;
  prompt += `2. If the user speaks ${targetLanguage}, respond in ${targetLanguage}.\n`;
  // ... fluency-appropriate behavior rules
  
  return prompt;
}
```

#### 1.3 Create Greeting Generator

Generate greetings in any language:

```typescript
const GREETINGS: Record<string, string[]> = {
  'English': ['Hello!', 'Hi there!', 'Good day!'],
  'Spanish': ['¡Hola!', '¡Buenos días!', '¿Qué tal?'],
  'French': ['Bonjour!', 'Salut!', 'Coucou!'],
  'German': ['Hallo!', 'Guten Tag!', 'Grüß Gott!'],
  'Japanese': ['こんにちは！', 'やあ！', 'どうも！'],
  'Chinese': ['你好！', '嗨！', '您好！'],
  // ... all supported languages
};

function buildGreeting(character: Character, fluencies: LanguageFluency[]): string {
  const native = fluencies.sort((a, b) => b.fluency - a.fluency)[0];
  const greetings = GREETINGS[native.language] || GREETINGS['English'];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  return `${greeting} I'm ${character.firstName} ${character.lastName}.`;
}
```

---

### Phase 2: World Target Language Integration ✅ COMPLETED

**Goal:** Make characters aware of and use the world's target language.

**Status:** Both `CharacterChatDialog.tsx` and `BabylonChatPanel.ts` now fetch `WorldLanguageContext` (world + languages API) and pass it to `buildLanguageAwareSystemPrompt()`. System prompt includes world language section with target language behavior instructions.

#### 2.1 Fetch World Language Data

**Files:** `CharacterChatDialog.tsx`, `BabylonChatPanel.ts`

```typescript
interface WorldLanguageContext {
  targetLanguage: string;
  worldLanguages: WorldLanguage[];
  primaryLanguage: WorldLanguage | null;
}

async function fetchWorldLanguageContext(worldId: string): Promise<WorldLanguageContext> {
  const [worldRes, languagesRes] = await Promise.all([
    fetch(`/api/worlds/${worldId}`),
    fetch(`/api/worlds/${worldId}/languages`)
  ]);
  
  const world = await worldRes.json();
  const languages = await languagesRes.json();
  const primary = languages.find((l: WorldLanguage) => l.isPrimary);
  
  return {
    targetLanguage: world.targetLanguage || 'English',
    worldLanguages: languages,
    primaryLanguage: primary || null
  };
}
```

#### 2.2 Integrate World Language into Dialogue

Modify system prompt to include world language context:

```typescript
// In buildSystemPrompt()
if (worldContext.targetLanguage && worldContext.targetLanguage !== 'English') {
  prompt += `\nWORLD LANGUAGE: This world's primary language is ${worldContext.targetLanguage}.\n`;
  prompt += `- NPCs in this world commonly speak ${worldContext.targetLanguage}.\n`;
  prompt += `- Help the player practice ${worldContext.targetLanguage} naturally in conversation.\n`;
}
```

---

### Phase 3: Conlang Integration ✅ COMPLETED

**Goal:** Enable characters to speak in constructed languages.

**Status:** `buildConlangContext()` and `buildWorldLanguageSection()` in `language-utils.ts` inject conlang vocabulary, grammar rules, and sample texts into system prompts when the world's primary language is constructed. `buildConlangGreeting()` generates greetings using conlang sample words.

#### 3.1 Conlang Vocabulary Injection

When a conlang is the world's primary language:

```typescript
function buildConlangContext(language: WorldLanguage): string {
  if (language.kind !== 'constructed') return '';
  
  let context = `\nCONSTRUCTED LANGUAGE: ${language.name}\n`;
  
  if (language.sampleWords) {
    context += `\nVocabulary to use:\n`;
    Object.entries(language.sampleWords).forEach(([english, conlang]) => {
      context += `- "${english}" = "${conlang}"\n`;
    });
  }
  
  if (language.grammar) {
    context += `\nGrammar rules:\n`;
    context += `- Word order: ${language.features?.wordOrder || 'SVO'}\n`;
    if (language.grammar.verbTenses) {
      context += `- Verb tenses: ${language.grammar.verbTenses.join(', ')}\n`;
    }
  }
  
  context += `\nWhen speaking ${language.name}, use the vocabulary above and follow the grammar rules.\n`;
  context += `Mix ${language.name} words with English explanations to help the player learn.\n`;
  
  return context;
}
```

#### 3.2 Conlang Phrase Generation

Generate new phrases in the conlang using its rules:

```typescript
// Server-side endpoint
async function generateConlangPhrase(
  languageId: string,
  englishPhrase: string
): Promise<{ conlang: string; breakdown: string[] }> {
  const language = await getLanguageById(languageId);
  if (!language || language.kind !== 'constructed') {
    throw new Error('Not a constructed language');
  }
  
  // Use LLM with language rules to generate translation
  const prompt = `Given this constructed language:
  
Phonemes: ${JSON.stringify(language.phonemes)}
Grammar: ${JSON.stringify(language.grammar)}
Sample words: ${JSON.stringify(language.sampleWords)}

Translate this phrase: "${englishPhrase}"

Respond with JSON:
{
  "translation": "...",
  "wordByWord": ["word1 (meaning1)", "word2 (meaning2)", ...]
}`;

  const response = await callLLM(prompt);
  const result = JSON.parse(response);
  
  return {
    conlang: result.translation,
    breakdown: result.wordByWord
  };
}
```

#### 3.3 Conlang Learning in Dialogue

Add learning interactions:

```typescript
// System prompt addition for language-learning worlds with conlangs
prompt += `\nLANGUAGE TEACHING MODE:
- Introduce new ${language.name} words naturally in conversation
- After using a ${language.name} word, provide the English meaning
- Encourage the player to use ${language.name} words they've learned
- Correct pronunciation/usage gently
- Celebrate when player uses ${language.name} correctly`;
```

---

### Phase 4: Language Learning Mechanics ✅ COMPLETED

**Goal:** Implement vocabulary tracking and fluency progression.

**Status:** Created `shared/language-progress.ts` with vocabulary/fluency types and `calculateFluencyGain()`. Created `LanguageProgressTracker.ts` class that analyzes player messages and NPC responses for vocabulary usage, tracks mastery levels (new→learning→familiar→mastered), and calculates fluency gain with bonuses. Wired into `BabylonChatPanel.ts` message flow.

#### 4.1 Vocabulary Tracking System

**New File:** `shared/language-progress.ts`

```typescript
export interface VocabularyEntry {
  word: string;
  language: string;
  meaning: string;
  timesEncountered: number;
  timesUsedCorrectly: number;
  lastEncountered: Date;
  masteryLevel: 'new' | 'learning' | 'familiar' | 'mastered';
}

export interface LanguageProgress {
  playerId: string;
  worldId: string;
  language: string;
  overallFluency: number;
  vocabulary: VocabularyEntry[];
  grammarPatternsLearned: string[];
  conversationsCompleted: number;
  questsCompleted: number;
}
```

#### 4.2 Progress Tracking in Dialogue

Track vocabulary usage during conversations:

```typescript
// In BabylonChatPanel.ts
private async analyzePlayerMessage(message: string): Promise<VocabularyUsage[]> {
  if (!this.worldLanguageContext?.primaryLanguage) return [];
  
  const language = this.worldLanguageContext.primaryLanguage;
  const usedWords: VocabularyUsage[] = [];
  
  // Check if player used target language words
  if (language.sampleWords) {
    Object.entries(language.sampleWords).forEach(([english, conlang]) => {
      if (message.toLowerCase().includes(conlang.toLowerCase())) {
        usedWords.push({
          word: conlang,
          meaning: english,
          usedCorrectly: true // Could add grammar checking
        });
      }
    });
  }
  
  // Notify quest system
  if (usedWords.length > 0) {
    this.onVocabularyUsed?.(usedWords);
  }
  
  return usedWords;
}
```

#### 4.3 Fluency Progression

Calculate and update player fluency:

```typescript
function calculateFluencyGain(
  currentFluency: number,
  vocabularyUsed: number,
  grammarCorrect: boolean,
  conversationLength: number
): number {
  const baseGain = 0.5;
  const vocabBonus = vocabularyUsed * 0.2;
  const grammarBonus = grammarCorrect ? 0.3 : 0;
  const lengthBonus = Math.min(conversationLength * 0.05, 0.5);
  
  const gain = baseGain + vocabBonus + grammarBonus + lengthBonus;
  
  // Diminishing returns at higher fluency
  const multiplier = 1 - (currentFluency / 100) * 0.5;
  
  return gain * multiplier;
}
```

---

### Phase 5: Multi-Language Character Support ✅ COMPLETED

**Goal:** Support characters who speak multiple languages naturally.

**Status:** Code-switching behavior added to `buildLanguageSection()` in `language-utils.ts`. Multilingual characters get instructions to switch between languages naturally, use native language for emotional expressions, and translate important terms. Language truth generation handled by existing truth system.

#### 5.1 Language Truth Generation

Ensure characters have language truths:

```typescript
// During character generation
async function generateLanguageTruths(
  character: Character,
  worldContext: WorldLanguageContext
): Promise<Truth[]> {
  const truths: Truth[] = [];
  
  // Native language based on character's birthplace
  const nativeLanguage = determineNativeLanguage(character, worldContext);
  truths.push({
    characterId: character.id,
    entryType: 'language',
    title: `${nativeLanguage} Language`,
    content: `Has 95/100 fluency in ${nativeLanguage} (native speaker)`,
    sourceData: { value: 95, language: nativeLanguage }
  });
  
  // Second language based on world's target language
  if (worldContext.targetLanguage !== nativeLanguage) {
    const secondFluency = Math.floor(Math.random() * 60) + 20; // 20-80
    truths.push({
      characterId: character.id,
      entryType: 'language',
      title: `${worldContext.targetLanguage} Language`,
      content: `Has ${secondFluency}/100 fluency in ${worldContext.targetLanguage}`,
      sourceData: { value: secondFluency, language: worldContext.targetLanguage }
    });
  }
  
  return truths;
}
```

#### 5.2 Code-Switching in Dialogue

Enable natural language mixing:

```typescript
// System prompt for bilingual characters
prompt += `\nCODE-SWITCHING BEHAVIOR:
- You can switch between ${languages.join(' and ')} naturally
- Use ${nativeLanguage} for emotional expressions
- Use ${targetLanguage} when the player speaks it
- Mix languages when searching for words (if low fluency)
- Translate important terms when switching languages`;
```

---

### Phase 6: Language-Specific Quest Objectives ✅ COMPLETED

**Goal:** Create language practice quests.

**Status:** Enhanced `language-learning.ts` quest type with 4 new objective types: `use_vocabulary_category` (themed vocabulary), `sustained_conversation` (turn count + target language %), `master_words` (reach mastery level), `learn_new_words` (encounter new vocabulary). Updated generation prompt to include all 10 objective types.

#### 6.1 Vocabulary Quest Objectives

```typescript
// In language-learning quest type
{
  id: 'use_vocabulary_category',
  name: 'Use Themed Vocabulary',
  trackingLogic: (context) => context.vocabularyByCategory,
  completionCheck: (progress) => {
    const used = progress.wordsUsed || [];
    const category = progress.targetCategory;
    const required = progress.requiredCount || 5;
    
    const categoryWords = used.filter(w => w.category === category);
    return categoryWords.length >= required;
  },
}
```

#### 6.2 Conversation Challenge Objectives

```typescript
{
  id: 'sustained_conversation',
  name: 'Sustained Conversation',
  trackingLogic: (context) => ({
    turns: context.conversationTurns,
    targetLanguageUsage: context.targetLanguagePercentage
  }),
  completionCheck: (progress) => {
    return progress.turns >= progress.requiredTurns &&
           progress.targetLanguageUsage >= progress.minPercentage;
  },
}
```

---

## Implementation Priority

### High Priority (Core Functionality)

1. ✅ **Dynamic language detection** - Remove French/English hardcoding
2. ✅ **World targetLanguage integration** - Use in dialogue system
3. ✅ **Multi-language greeting generation** - Support all LANGUAGES

### Medium Priority (Enhanced Features)

4. ✅ **Conlang vocabulary injection** - Use generated words in dialogue
5. ✅ **Vocabulary tracking** - Track player language learning
6. ✅ **Language-specific quests** - Practice objectives

### Low Priority (Advanced Features)

7. ✅ **Conlang phrase generation** - Real-time translation
8. ✅ **Fluency progression system** - Long-term tracking
9. ✅ **Code-switching behavior** - Natural language mixing
10. **Grammar checking** - Correct player errors (future enhancement)

---

## Testing Strategy

### Test Scenarios

1. **Spanish World Test**
   - Create world with targetLanguage: 'Spanish'
   - Verify characters greet in Spanish
   - Verify dialogue adapts to Spanish

2. **Conlang World Test**
   - Create world with constructed language
   - Generate characters with conlang fluency
   - Verify conlang vocabulary appears in dialogue

3. **Language Learning Mode Test**
   - Create language-learning world
   - Complete vocabulary quests
   - Verify progress tracking

### Verification Checklist

For each supported language:
- [ ] Characters can greet in the language
- [ ] System prompt includes language skills
- [ ] Fluency affects dialogue complexity
- [ ] Quest objectives work with language
- [ ] Vocabulary tracking functions

---

## Files to Modify

| File | Changes |
|------|---------|
| `client/src/components/CharacterChatDialog.tsx` | ✅ Dynamic language detection, world language integration |
| `client/src/components/3DGame/BabylonChatPanel.ts` | ✅ Same as above, plus vocabulary tracking |
| `shared/language-utils.ts` | ✅ NEW - Shared language utilities (35+ languages) |
| `shared/language-progress.ts` | ✅ NEW - Progress tracking types |
| `client/src/components/3DGame/LanguageProgressTracker.ts` | ✅ NEW - Vocabulary tracking class |
| `shared/quest-types/language-learning.ts` | ✅ Enhanced with 4 new objective types |

---

## Success Metrics

1. **Language Coverage**: All 25+ languages in LANGUAGES array should work
2. **Conlang Usage**: Generated vocabulary appears in 50%+ of conlang world dialogues
3. **Learning Effectiveness**: Players can recognize 10+ vocabulary words after 1 hour
4. **Natural Dialogue**: Code-switching feels natural (user feedback)

---

*Last Updated: February 2026*
