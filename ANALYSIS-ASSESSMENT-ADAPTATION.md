# Language Assessment & Adaptive Difficulty Analysis

## How the Game Evaluates and Adapts to Player Language Ability

### Overview

Insimul implements a multi-phase assessment system that assigns a CEFR level (A1-B2), then uses that level to adapt NPC speech, quest difficulty, text complexity, vocabulary presentation, and hint frequency. The foundation is solid but several feedback loops are incomplete.

---

## 1. Initial Assessment

### Arrival Assessment (`shared/assessment/arrival-encounter.ts`)

**Total: 53 points across 5 phases:**

| Phase | Type | Points | Details |
|-------|------|--------|---------|
| 1 | Reading Comprehension | 15 | 5-sentence passage + 3 questions |
| 2 | Writing | 15 | 2 writing prompts about arriving |
| 3 | Listening | 13 | Audio passage + 3 questions |
| 4 | Initiate Conversation | 0 | Gate/trigger |
| 5 | Conversation | 10 | 6-12 exchange guided conversation |

### CEFR Assignment (`shared/assessment/cefr-mapping.ts`)

| Score % | CEFR Level |
|---------|------------|
| 0-24%   | A1 (Beginner) |
| 25-49%  | A2 (Elementary) |
| 50-74%  | B1 (Intermediate) |
| 75-100% | B2 (Upper-Intermediate) |

**Note: C1/C2 are NOT assessed.** The system caps at B2.

### NPC Evaluation During Assessment

The LLM is instructed to append EVAL blocks scoring 5 dimensions (1-5 scale):
- Vocabulary, Grammar, Fluency, Comprehension, Task Completion

---

## 2. Player Progress Tracking

### Language Progress (`shared/language/progress.ts`)

```typescript
interface LanguageProgress {
  overallFluency: number           // 0-100
  cefrLevel?: CEFRLevel
  vocabulary: VocabularyEntry[]    // word, encounters, correct uses, mastery
  grammarPatterns: GrammarPattern[] // pattern, correct/incorrect counts
  conversations: ConversationRecord[]
  totalWordsLearned, totalCorrectUsages, streakDays
}
```

### Vocabulary Mastery Levels

| Level | Criteria |
|-------|----------|
| new | <2 encounters |
| learning | 2-7 encounters |
| familiar | 5+ encounters + 5+ correct uses |
| mastered | 15+ encounters + 10+ correct uses |

### Fluency Gain Per Conversation

`calculateFluencyGain()` considers:
- Base: 0.15 x conversation length
- Vocabulary bonus: 0.2 x words used (max 2.0)
- Grammar bonus: 0-0.3 depending on correctness
- Target language % bonus: 0.2-0.5 for 50-80%+ usage
- Diminishing returns at high fluency
- Clamped: 0.1-3.0 per conversation, soft cap at 100

---

## 3. How CEFR Level Affects Gameplay

### NPC Language Behavior

| CEFR | English % | Sentence Length | New Words/Msg | Idioms/Slang |
|------|-----------|-----------------|---------------|-------------|
| A1 | 80-90% | 5-7 words | 1-2 | Never |
| A2 | 50-70% | 8-12 words | 2-4 | Never |
| B1 | 30-50% | 15-20 words | 3-5 | Some idioms |
| B2 | 5-20% | Natural | 3-5 | Full slang |

### Hint/Translation Scaffolding

| Level | Translation Mode | Translate Button | Hint Frequency |
|-------|-----------------|-----------------|----------------|
| A1 | Inline | Prominent | Every word |
| A2 | Inline | Subtle | Every 3rd |
| B1 | Hover-only | None | Advanced vocab only |
| B2 | Click-only | None | Advanced vocab only |

### Text Complexity Parameters

| CEFR | Sentence Length | Paragraphs | Vocab | Question Type |
|------|----------------|------------|-------|--------------|
| A1 | 8 words | 2 | basic | true/false |
| A2 | 12 words | 3 | common | simple factual |
| B1 | 20 words | 5 | varied | inferential |
| B2 | 30 words | 8 | advanced | analytical |

### Quest Filtering

`filterQuestsByCEFR()` allows quests at player level +/- 1:
- A2 player sees A1, A2, B1 quests
- Sorted: at-level first, then +1 (stretch), then -1

### Vocabulary Frequency Ranges

| CEFR | Word Frequency Rank |
|------|-------------------|
| A1 | 1-200 (most common) |
| A2 | 201-500 |
| B1 | 501-1500 |
| B2 | 1501+ |

### Conversation Exam Adaptation

| CEFR | Difficulty | Passage Length | TTS Speed | Replays |
|------|-----------|----------------|-----------|---------|
| A1 | beginner | 2 sentences | 0.7x | 2 |
| A2 | beginner | 4 sentences | 0.85x | 1 |
| B1 | intermediate | 5 sentences | 1.0x | 1 |
| B2 | advanced | 6 sentences | 1.0x | 0 |

---

## 4. Re-Assessment & Continuous Evaluation

### Periodic Assessments (`shared/assessment/periodic-encounter.ts`)

- Triggered at quest completion milestones: levels 5, 10, 15, 20
- Conversation-only, 5 minutes, 25 points
- 5 scoring dimensions
- 60-minute cooldown between assessments

### Real-Time Tracking During Gameplay

- **Vocabulary**: NPC introduces word -> `timesEncountered++`; player uses correctly -> `timesUsedCorrectly++`
- **Grammar**: GRAMMAR_FEEDBACK blocks parsed from NPC responses; pattern usage tracked
- **Fluency**: Calculated after each conversation ends

### CEFR Advancement Thresholds (`checkCEFRAdvancement()`)

| Transition | Words Learned | Conversations | Texts Read |
|-----------|---------------|---------------|------------|
| A1 -> A2 | 50 | 3 | 0 |
| A2 -> B1 | 150 | 10 | 5 |
| B1 -> B2 | 300 | 25 | 15 |

### Departure Assessment

Full re-assessment mirroring the arrival assessment, with a report card comparing pre/post scores across all phases and dimensions.

---

## 5. Assessment Pipeline

```
ARRIVAL ASSESSMENT
    |
    v
[Reading, Writing, Listening, Conversation]
    |
    v
NPC EVAL blocks + LLM scoring -> mapScoreToCEFR() -> A1-B2
    |
    v
AssessmentSession stored + LanguageProgress.cefrLevel updated
    |
    v
GAMEPLAY (adaptive content based on CEFR)
    |
    v
Real-time vocab/grammar tracking per conversation
    |
    v
Fluency gain calculated after each conversation
    |
    v
PERIODIC MINI-ASSESSMENT (every 5-10 levels)
    |
    v
DEPARTURE ASSESSMENT -> Report Card
```

---

## 6. Critical Gaps

### A. No Auto-Level-Up
`checkCEFRAdvancement()` is computed but **never called** to auto-promote. CEFR only changes via explicit assessment. A player could reach 100 fluency and still be labeled A1.

### B. C1/C2 Not Supported
Assessment caps at B2. No TIER_INSTRUCTIONS, no exam content, no NPC behavior rules for C1/C2.

### C. Vocabulary Frequency Not Enforced
`cefrToVocabularyRange()` maps levels to frequency ranks, but actual content generation doesn't filter by frequency. The LLM isn't told "only use the 200 most common words."

### D. Grammar Tracking Not Actionable
Patterns tracked but no analysis of "what does this player struggle with?" No error-correction quests generated from tracked weak patterns.

### E. EVAL Scores Not Aggregated
NPC EVAL blocks produce per-conversation dimension scores, but these aren't accumulated into long-term progress tracking.

### F. No Dynamic Mid-Conversation Scaffolding
Tier instructions say "if player struggles, simplify" but no mechanism to detect struggle mid-conversation and trigger mode switching.

### G. Periodic Assessment Not Fully Wired
Structure exists; integration with game event system is missing. No actual trigger fires at level milestones.

### H. NPC Language Mode Locked Per Session
Mode assigned at conversation start; not re-evaluated if player's fluency changes mid-conversation.

### I. Mastery Threshold Inconsistency
`LanguageProgressTracker`: 5 encounters + 1 use = familiar, 15 + 10 = mastered
`cefr-adaptation.ts`: 5 encounters + 1 use = mastered. Different definitions.

---

## 7. Recommended Improvements (Priority Order)

1. **Wire auto-level-up**: Call `checkCEFRAdvancement()` after conversations; promote with UI celebration
2. **Dynamic scaffolding**: Track error rate per turn; switch NPC mode if player struggles
3. **Vocabulary frequency enforcement**: Include frequency rank in LLM prompts
4. **Error-correction quests**: Generate quests targeting weak grammar patterns
5. **Wire periodic assessments**: Hook level-up events to assessment triggers
6. **C1/C2 support**: Extend thresholds, add tier instructions, update exam content
7. **Aggregate EVAL scores**: Track dimension scores over time for progress reports
8. **Mid-conversation mode switching**: Re-evaluate NPC language mode if fluency changes
9. **Unified progress schema**: Add `cefrLevel` directly to `playerProgress` table
10. **Gradual immersion curve**: At B2+, start transitioning UI elements (quest panel, inventory labels) to target language
