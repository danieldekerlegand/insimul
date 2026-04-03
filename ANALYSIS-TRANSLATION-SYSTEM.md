# Translation System Analysis

## How Translation Works Throughout the Game

### Overview

Insimul implements a CEFR-driven translation system that adapts NPC speech, game texts, vocabulary hints, and content presentation based on the player's proficiency level. Translation is primarily handled through **real-time LLM generation** for conversations and **pre-stored bilingual content** for game texts.

---

## 1. NPC Conversation Translation

### Language Mode System

Each NPC is assigned a **language mode** based on the player's CEFR level, using deterministic hashing per NPC (`assignNPCLanguageMode()` in `shared/language/cefr-adaptation.ts`):

| CEFR | Bilingual | Simplified | Natural |
|------|-----------|------------|---------|
| A1   | 60%       | 40%        | 0%      |
| A2   | 30%       | 70%        | 0%      |
| B1   | 10%       | 0%         | 90%     |
| B2   | 0%        | 0%         | 100%    |

**Mode behaviors:**
- **Bilingual**: Mix English and target language, say key words in both, gradually increase target language as conversation progresses
- **Simplified**: Simple target language only, 5-7 words max, offer translations in brackets
- **Natural**: Entire conversation in target language at natural pace, idioms allowed

### System Prompt Construction

`buildLanguageAwareSystemPrompt()` dynamically builds prompts that include:
- Character language fluencies from game truths
- Player proficiency data (vocabulary count, mastered words, weak/strong grammar patterns)
- NPC language mode directives
- Grammar feedback instructions (embedded in dialogue, not structured markers)

### Speech Complexity Adaptation (`shared/language/speech-complexity.ts`)

| Fluency   | Max Words/Sentence | Vocab Tier | New Words/Msg | Target Lang % | Idioms | Slang |
|-----------|--------------------|------------|---------------|---------------|--------|-------|
| 0-20      | 7                  | basic      | 0-1           | 60%           | No     | No    |
| 80+       | 30                 | native     | 3-5           | 100%          | Yes    | Yes   |

### Translation is NOT Stored

All conversation translations are LLM-generated in real-time via the streaming pipeline. There is no pre-stored translation database for NPC dialogue.

---

## 2. Game Texts (Books, Journals, Signs)

### Schema Structure

```
pages: Array<{ content: string; contentTranslation: string }>
title: string (target language)
titleTranslation: string (English)
vocabularyHighlights: Array<{ word, translation, partOfSpeech }>
comprehensionQuestions: Array<{ question, questionTranslation, options[], correctIndex }>
cefrLevel: 'A1' | 'A2' | 'B1' | 'B2'
```

### Display (`DocumentReadingPanel.ts`)

- Full translation toggle: switches between target language and English
- Word-level hover translations
- Comprehension quiz after reading (questions in both languages)
- XP rewards scaled by CEFR: A1=10, A2=15, B1=25, B2=40

---

## 3. UI/Menu Translation

**Status: NO internationalization framework exists.**

- No react-intl, i18next, or similar
- All UI text (buttons, menus, settings, notifications) is hardcoded in English
- No gradual language transition for menus
- Game *content* (NPC dialogue, texts, quests) IS in the target language; the *chrome* is not

---

## 4. Quest Translation

- Quests have `title` and `description` in the target language
- **No separate translation fields** (unlike GameText which has `titleTranslation`)
- Quest objectives are NOT separately translated
- When NPCs assign quests, they re-narrate in their language mode

---

## 5. Hover-to-Translate System (`HoverTranslationSystem.ts`)

Per-CEFR configuration:

| Level | Display      | Button     | Frequency       |
|-------|-------------|------------|-----------------|
| A1    | Inline      | Prominent  | Every new word  |
| A2    | Inline      | Subtle     | Every 3rd word  |
| B1    | Hover-only  | None       | Advanced only   |
| B2    | Click-only  | None       | Advanced only   |

Tracks word encounters and mastery (5+ encounters + correct uses).

---

## 6. Translation Service

### Word Translation API (`POST /api/conversation/translate-word`)
- On-demand for hover-to-translate
- Falls back to Gemini if gRPC unavailable
- **NOT cached** — each request goes to LLM

### Item Translation (`server/services/item-translation.ts`)
- Batch translates item names/descriptions via LLM
- Results stored in item `translations` field
- Run during world generation

---

## 7. What IS Translated

- NPC dialogue (LLM-generated at runtime)
- Game texts (both languages stored)
- Vocabulary highlights (stored with translations)
- Comprehension questions (both language versions)
- Item names (batch-translated at generation)
- Grammar feedback (embedded in NPC dialogue)

## 8. What is NOT Translated

- UI/menu text (buttons, settings, notifications)
- System messages and errors
- Achievement descriptions
- Daily challenge descriptions
- Toast notifications
- Loading screen text
- Quest titles/descriptions (no `titleTranslation` field)

---

## 9. Gaps and Recommendations

### Critical Gaps

1. **No UI internationalization** — Need react-intl or i18next for gradual menu language transition
2. **No translation caching** — Every hover-translate request hits the LLM
3. **Quest descriptions lack translation fields** — Should mirror GameText's bilingual structure
4. **No gradual UI language transition** — Menus could progressively switch to target language as CEFR advances
5. **Word translation not persistent** — Looked-up words should be stored for vocabulary tracking

### Recommended Improvements

1. **Add i18n framework** with CEFR-aware locale switching (menus gradually change language)
2. **Cache word translations** in a per-world dictionary table
3. **Add `titleTranslation`/`descriptionTranslation`** to quest schema
4. **Pre-generate common translations** during world creation rather than on-the-fly
5. **Connect hover-translate to vocabulary tracker** — every word lookup should count as an encounter
