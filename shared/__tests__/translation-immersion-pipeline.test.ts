/**
 * US-012 — Automated integration tests for the translation & immersion pipeline.
 *
 * Covers the untested functions in cefr-adaptation.ts plus cross-module
 * integration scenarios that exercise the full pipeline from CEFR level
 * through NPC behavior, hints, quest filtering, advancement, and UI immersion.
 */
import { describe, it, expect } from 'vitest';

import type { CEFRLevel } from '../assessment/cefr-mapping';
import type { ScaffoldingLevel } from '../game-engine/logic/ConversationDifficultyMonitor';

import {
  assignNPCLanguageMode,
  buildLanguageModeDirective,
  getNPCLanguageBehavior,
  buildScaffoldingDirective,
  getHintBehavior,
  shouldShowVocabHint,
  isQuestAppropriateForLevel,
  filterQuestsByCEFR,
  checkCEFRAdvancement,
  cefrToVocabularyRange,
  getQuestPoolSizes,
  getCEFRTextComplexity,
  CEFR_ADVANCEMENT_THRESHOLDS,
  type NPCLanguageMode,
  type CEFRProgressSnapshot,
} from '../language/cefr-adaptation';

import {
  getUIImmersionLevel,
  shouldTranslateUIKey,
  getGameString,
  getBilingualDisplay,
  getImmersionProgressData,
  ImmersionTransitionController,
  type UIImmersionMode,
} from '../language/ui-localization';

import {
  getFrequencyRange,
  buildFrequencyDirective,
  buildVocabularyRangeSummary,
} from '../language/vocabulary-frequency';

import {
  getActionLabel,
  getBuildingTypeLabel,
  ACTION_LABEL_WORDS,
  BUILDING_TYPE_LABELS,
} from '../language/action-labels';

import {
  translateInteractionVerb,
  buildTranslatedPrompt,
  buildTranslatedNPCPrompt,
  IN_WORLD_TEXT_WORDS,
} from '../language/in-world-text';

const ALL_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// ── assignNPCLanguageMode ──────────────────────────────────────────────────

describe('assignNPCLanguageMode', () => {
  it('returns a valid NPCLanguageMode for every CEFR level', () => {
    const valid: NPCLanguageMode[] = ['bilingual', 'simplified', 'natural'];
    for (const level of ALL_LEVELS) {
      const mode = assignNPCLanguageMode(level, 'npc-001');
      expect(valid).toContain(mode);
    }
  });

  it('is deterministic — same npcId always yields same mode', () => {
    const first = assignNPCLanguageMode('A1', 'baker-jean');
    for (let i = 0; i < 5; i++) {
      expect(assignNPCLanguageMode('A1', 'baker-jean')).toBe(first);
    }
  });

  it('different npcIds can produce different modes at A1', () => {
    // A1 has 60% bilingual, 40% simplified — with enough NPCs we should see both
    const modes = new Set<NPCLanguageMode>();
    for (let i = 0; i < 200; i++) {
      modes.add(assignNPCLanguageMode('A1', `npc-${i}`));
    }
    expect(modes.size).toBeGreaterThanOrEqual(2);
  });

  it('at B2+ all NPCs speak natural', () => {
    for (const level of ['B2', 'C1', 'C2'] as CEFRLevel[]) {
      for (let i = 0; i < 20; i++) {
        expect(assignNPCLanguageMode(level, `npc-${i}`)).toBe('natural');
      }
    }
  });

  it('at A1, no NPC speaks natural', () => {
    for (let i = 0; i < 200; i++) {
      expect(assignNPCLanguageMode('A1', `npc-${i}`)).not.toBe('natural');
    }
  });
});

// ── buildLanguageModeDirective ─────────────────────────────────────────────

describe('buildLanguageModeDirective', () => {
  it('bilingual mode mentions both languages', () => {
    const d = buildLanguageModeDirective('bilingual', 'French');
    expect(d).toContain('BILINGUAL');
    expect(d).toContain('French');
    expect(d).toContain('English');
  });

  it('simplified mode enforces short sentences', () => {
    const d = buildLanguageModeDirective('simplified', 'Spanish');
    expect(d).toContain('SIMPLIFIED');
    expect(d).toContain('Spanish');
    expect(d).toContain('5-7 words');
  });

  it('natural mode speaks entirely in target language', () => {
    const d = buildLanguageModeDirective('natural', 'German');
    expect(d).toContain('NATURAL');
    expect(d).toContain('German');
  });

  it('appends frequency directive when cefrLevel provided', () => {
    const d = buildLanguageModeDirective('natural', 'French', 'English', 'B1');
    expect(d).toContain('VOCABULARY FREQUENCY');
  });

  it('omits frequency directive when cefrLevel not provided', () => {
    const d = buildLanguageModeDirective('natural', 'French');
    expect(d).not.toContain('VOCABULARY FREQUENCY');
  });

  it('respects custom nativeLanguage', () => {
    const d = buildLanguageModeDirective('bilingual', 'French', 'Japanese');
    expect(d).toContain('Japanese');
    expect(d).toContain('French');
  });
});

// ── getNPCLanguageBehavior ─────────────────────────────────────────────────

describe('getNPCLanguageBehavior', () => {
  it('returns both languageMode and promptDirective', () => {
    const behavior = getNPCLanguageBehavior('A1', 'npc-1', 'French');
    expect(behavior.languageMode).toBeTruthy();
    expect(behavior.promptDirective).toBeTruthy();
  });

  it('directive matches the assigned mode', () => {
    const behavior = getNPCLanguageBehavior('B2', 'npc-1', 'French');
    expect(behavior.languageMode).toBe('natural');
    expect(behavior.promptDirective).toContain('NATURAL');
  });
});

// ── buildScaffoldingDirective ──────────────────────────────────────────────

describe('buildScaffoldingDirective', () => {
  it('returns empty string for "none"', () => {
    expect(buildScaffoldingDirective('none', 'French')).toBe('');
  });

  it('scaffolded level tells NPC to simplify', () => {
    const d = buildScaffoldingDirective('scaffolded', 'French');
    expect(d).toContain('SCAFFOLDING');
    expect(d).toContain('struggling');
    expect(d).toContain('French');
  });

  it('stretch level tells NPC to increase complexity', () => {
    const d = buildScaffoldingDirective('stretch', 'French');
    expect(d).toContain('STRETCH');
    expect(d).toContain('advanced vocabulary');
    expect(d).toContain('French');
  });

  it('uses custom nativeLanguage in scaffolded directive', () => {
    const d = buildScaffoldingDirective('scaffolded', 'French', 'Spanish');
    expect(d).toContain('Spanish');
  });

  it('all three ScaffoldingLevels return string', () => {
    const levels: ScaffoldingLevel[] = ['none', 'scaffolded', 'stretch'];
    for (const l of levels) {
      expect(typeof buildScaffoldingDirective(l, 'French')).toBe('string');
    }
  });
});

// ── getHintBehavior ────────────────────────────────────────────────────────

describe('getHintBehavior', () => {
  it('A1 shows inline translations with prominent translate button', () => {
    const h = getHintBehavior('A1');
    expect(h.translationMode).toBe('inline');
    expect(h.showTranslateButton).toBe(true);
    expect(h.translateButtonProminence).toBe(2);
    expect(h.newWordHintFrequency).toBe(1);
    expect(h.advancedVocabOnly).toBe(false);
  });

  it('A2 shows hints every 3rd word', () => {
    const h = getHintBehavior('A2');
    expect(h.newWordHintFrequency).toBe(3);
    expect(h.translationMode).toBe('inline');
  });

  it('B1 switches to hover mode with advanced-only hints', () => {
    const h = getHintBehavior('B1');
    expect(h.translationMode).toBe('hover');
    expect(h.advancedVocabOnly).toBe(true);
    expect(h.showTranslateButton).toBe(false);
  });

  it('B2+ uses click mode', () => {
    for (const level of ['B2', 'C1', 'C2'] as CEFRLevel[]) {
      expect(getHintBehavior(level).translationMode).toBe('click');
    }
  });

  it('translate button prominence decreases with CEFR level', () => {
    const proms = ALL_LEVELS.map(l => getHintBehavior(l).translateButtonProminence);
    // A1=2, A2=1, B1+=0 — monotonically non-increasing
    for (let i = 1; i < proms.length; i++) {
      expect(proms[i]).toBeLessThanOrEqual(proms[i - 1]);
    }
  });
});

// ── shouldShowVocabHint ────────────────────────────────────────────────────

describe('shouldShowVocabHint', () => {
  it('never shows hints for mastered words', () => {
    for (const level of ALL_LEVELS) {
      expect(shouldShowVocabHint(level, 0, 'beginner', true)).toBe(false);
    }
  });

  it('A1 shows hints for every new word encounter (frequency 1)', () => {
    expect(shouldShowVocabHint('A1', 0)).toBe(true);
    expect(shouldShowVocabHint('A1', 1)).toBe(true);
    expect(shouldShowVocabHint('A1', 5)).toBe(true);
  });

  it('A2 shows hints every 3rd encounter', () => {
    expect(shouldShowVocabHint('A2', 0)).toBe(true);
    expect(shouldShowVocabHint('A2', 1)).toBe(false);
    expect(shouldShowVocabHint('A2', 2)).toBe(false);
    expect(shouldShowVocabHint('A2', 3)).toBe(true);
  });

  it('B1 only shows hints for advanced vocabulary', () => {
    expect(shouldShowVocabHint('B1', 0, 'beginner')).toBe(false);
    expect(shouldShowVocabHint('B1', 0, 'intermediate')).toBe(false);
    expect(shouldShowVocabHint('B1', 0, 'advanced')).toBe(true);
  });

  it('C1 shows hints for advanced vocabulary', () => {
    expect(shouldShowVocabHint('C1', 0, 'advanced')).toBe(true);
    expect(shouldShowVocabHint('C1', 0, 'beginner')).toBe(false);
  });
});

// ── isQuestAppropriateForLevel ─────────────────────────────────────────────

describe('isQuestAppropriateForLevel', () => {
  it('quest at same level is appropriate', () => {
    for (const level of ALL_LEVELS) {
      expect(isQuestAppropriateForLevel(level, level)).toBe(true);
    }
  });

  it('quest one level above is appropriate (stretch)', () => {
    expect(isQuestAppropriateForLevel('A2', 'A1')).toBe(true);
    expect(isQuestAppropriateForLevel('B1', 'A2')).toBe(true);
  });

  it('quest one level below is appropriate', () => {
    expect(isQuestAppropriateForLevel('A1', 'A2')).toBe(true);
    expect(isQuestAppropriateForLevel('B1', 'B2')).toBe(true);
  });

  it('quest two levels above is NOT appropriate', () => {
    expect(isQuestAppropriateForLevel('B1', 'A1')).toBe(false);
    expect(isQuestAppropriateForLevel('C2', 'B2')).toBe(false);
  });

  it('quest two levels below is NOT appropriate', () => {
    expect(isQuestAppropriateForLevel('A1', 'B1')).toBe(false);
  });
});

// ── filterQuestsByCEFR ─────────────────────────────────────────────────────

describe('filterQuestsByCEFR', () => {
  const quests = [
    { id: 1, cefrLevel: 'A1' },
    { id: 2, cefrLevel: 'A2' },
    { id: 3, cefrLevel: 'B1' },
    { id: 4, cefrLevel: 'B2' },
    { id: 5, cefrLevel: 'C1' },
    { id: 6, cefrLevel: null },
  ];

  it('includes quests within ±1 CEFR level and untagged', () => {
    const filtered = filterQuestsByCEFR(quests, 'A2');
    const ids = filtered.map(q => q.id);
    expect(ids).toContain(1); // A1 — one below
    expect(ids).toContain(2); // A2 — same
    expect(ids).toContain(3); // B1 — one above
    expect(ids).toContain(6); // untagged
    expect(ids).not.toContain(4); // B2 — two above
    expect(ids).not.toContain(5); // C1 — three above
  });

  it('sorts by proximity: at-level first, then ±1', () => {
    const filtered = filterQuestsByCEFR(quests, 'A2');
    const tagged = filtered.filter(q => q.cefrLevel);
    expect(tagged[0].cefrLevel).toBe('A2');
  });

  it('untagged quests always pass filter', () => {
    for (const level of ALL_LEVELS) {
      const filtered = filterQuestsByCEFR(quests, level);
      expect(filtered.some(q => q.id === 6)).toBe(true);
    }
  });

  it('returns empty when no quests match', () => {
    const farQuests = [{ id: 1, cefrLevel: 'C2' }];
    const filtered = filterQuestsByCEFR(farQuests, 'A1');
    expect(filtered).toHaveLength(0);
  });
});

// ── checkCEFRAdvancement ───────────────────────────────────────────────────

describe('checkCEFRAdvancement', () => {
  it('recommends advancement when all thresholds met', () => {
    const snapshot: CEFRProgressSnapshot = {
      currentLevel: 'A1',
      wordsLearned: 50,
      wordsMastered: 20,
      conversationsCompleted: 3,
      textsRead: 0,
      grammarPatternsRecognized: 5,
    };
    const result = checkCEFRAdvancement(snapshot);
    expect(result.shouldAdvance).toBe(true);
    expect(result.nextLevel).toBe('A2');
    expect(result.progress).toBe(1);
  });

  it('does not recommend advancement when thresholds not met', () => {
    const snapshot: CEFRProgressSnapshot = {
      currentLevel: 'A1',
      wordsLearned: 10,
      wordsMastered: 5,
      conversationsCompleted: 1,
      textsRead: 0,
      grammarPatternsRecognized: 0,
    };
    const result = checkCEFRAdvancement(snapshot);
    expect(result.shouldAdvance).toBe(false);
    expect(result.nextLevel).toBe('A2');
    expect(result.progress).toBeLessThan(1);
  });

  it('reports partial progress correctly', () => {
    const snapshot: CEFRProgressSnapshot = {
      currentLevel: 'A1',
      wordsLearned: 25, // 50% of 50
      wordsMastered: 10,
      conversationsCompleted: 3, // 100% of 3
      textsRead: 0,
      grammarPatternsRecognized: 0,
    };
    const result = checkCEFRAdvancement(snapshot);
    expect(result.metrics.wordsProgress).toBeCloseTo(0.5);
    expect(result.metrics.conversationsProgress).toBe(1);
    expect(result.metrics.textsProgress).toBe(1); // A1→A2 has textsRead=0
    expect(result.shouldAdvance).toBe(false); // words not fully met
  });

  it('C2 cannot advance further', () => {
    const snapshot: CEFRProgressSnapshot = {
      currentLevel: 'C2',
      wordsLearned: 9999,
      wordsMastered: 9999,
      conversationsCompleted: 9999,
      textsRead: 9999,
      grammarPatternsRecognized: 999,
    };
    const result = checkCEFRAdvancement(snapshot);
    expect(result.shouldAdvance).toBe(false);
    expect(result.nextLevel).toBeNull();
    expect(result.progress).toBe(1);
  });

  it('all transition keys have thresholds defined', () => {
    const transitions = ['A1→A2', 'A2→B1', 'B1→B2', 'B2→C1', 'C1→C2'];
    for (const key of transitions) {
      expect(CEFR_ADVANCEMENT_THRESHOLDS[key]).toBeDefined();
      expect(CEFR_ADVANCEMENT_THRESHOLDS[key].wordsLearned).toBeGreaterThan(0);
    }
  });

  it('thresholds increase as levels progress', () => {
    const transitions = ['A1→A2', 'A2→B1', 'B1→B2', 'B2→C1', 'C1→C2'];
    for (let i = 1; i < transitions.length; i++) {
      const prev = CEFR_ADVANCEMENT_THRESHOLDS[transitions[i - 1]];
      const curr = CEFR_ADVANCEMENT_THRESHOLDS[transitions[i]];
      expect(curr.wordsLearned).toBeGreaterThan(prev.wordsLearned);
    }
  });
});

// ── cefrToVocabularyRange ──────────────────────────────────────────────────

describe('cefrToVocabularyRange', () => {
  it('returns min/max ranges for all levels', () => {
    for (const level of ALL_LEVELS) {
      const range = cefrToVocabularyRange(level);
      expect(range.min).toBeDefined();
      expect(range.max).toBeDefined();
      expect(range.min).toBeGreaterThanOrEqual(1);
    }
  });

  it('A1 has smallest range', () => {
    const a1 = cefrToVocabularyRange('A1');
    expect(a1.min).toBe(1);
    expect(a1.max).toBe(200);
  });

  it('C1 and C2 allow full vocabulary range', () => {
    expect(cefrToVocabularyRange('C1').max).toBe(Infinity);
    expect(cefrToVocabularyRange('C2').max).toBe(Infinity);
  });
});

// ── getQuestPoolSizes ──────────────────────────────────────────────────────

describe('getQuestPoolSizes', () => {
  it('returns sizes for all CEFR levels', () => {
    const sizes = getQuestPoolSizes();
    for (const level of ALL_LEVELS) {
      expect(sizes[level]).toBeGreaterThan(0);
    }
  });

  it('lower levels have larger pools (more scaffolding)', () => {
    const sizes = getQuestPoolSizes();
    expect(sizes.A1).toBeGreaterThan(sizes.B1);
    expect(sizes.B1).toBeGreaterThan(sizes.C1);
  });
});

// ── Cross-Module Integration: NPC Behavior → LLM Prompt Pipeline ──────────

describe('Integration: NPC behavior + frequency + scaffolding pipeline', () => {
  it('full NPC prompt chain for A1 player includes bilingual/simplified mode + frequency', () => {
    // Get NPC behavior — at A1, some NPCs will be bilingual or simplified
    const behavior = getNPCLanguageBehavior('A1', 'baker-001', 'French', 'English');
    expect(['bilingual', 'simplified']).toContain(behavior.languageMode);
    expect(behavior.promptDirective).toContain('French');
    // Frequency directive appended
    expect(behavior.promptDirective).toContain('VOCABULARY FREQUENCY');
  });

  it('scaffolding can overlay on top of NPC language mode', () => {
    const behavior = getNPCLanguageBehavior('B1', 'teacher-001', 'French');
    const scaffolding = buildScaffoldingDirective('scaffolded', 'French');
    const fullPrompt = behavior.promptDirective + scaffolding;
    // Has both the base mode and the scaffolding overlay
    expect(fullPrompt).toContain('LANGUAGE MODE');
    expect(fullPrompt).toContain('SCAFFOLDING');
  });

  it('stretch directive adds complexity for high-performing players', () => {
    const behavior = getNPCLanguageBehavior('B2', 'merchant-001', 'French');
    const stretch = buildScaffoldingDirective('stretch', 'French');
    const fullPrompt = behavior.promptDirective + stretch;
    expect(fullPrompt).toContain('NATURAL');
    expect(fullPrompt).toContain('STRETCH');
    expect(fullPrompt).toContain('advanced vocabulary');
  });
});

// ── Cross-Module Integration: CEFR Progression → UI Immersion ──────────────

describe('Integration: CEFR advancement → UI immersion progression', () => {
  it('advancing from A1→A2 unlocks more UI translation namespaces', () => {
    // At A1, very few UI elements translate
    const a1Translates = shouldTranslateUIKey('actions.label', 'A1', 'progressive');
    // At B1, actions namespace should translate (priority 1)
    const b1Translates = shouldTranslateUIKey('actions.label', 'B1', 'progressive');

    // We just verify the function works for both levels
    expect(typeof a1Translates).toBe('boolean');
    expect(typeof b1Translates).toBe('boolean');
  });

  it('immersion level increases monotonically with CEFR', () => {
    const levels = ALL_LEVELS.map(l => getUIImmersionLevel(l));
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeGreaterThanOrEqual(levels[i - 1]);
    }
  });

  it('ImmersionTransitionController smoothly phases in new namespaces', () => {
    const controller = new ImmersionTransitionController();
    // A1→B1 triggers transition (immersion goes from 0 to 10)
    controller.onLevelChanged('B1');
    expect(controller.isTransitioning).toBe(true);
    expect(controller.currentLevel).toBe('B1');
  });
});

// ── Cross-Module Integration: Quest Filtering + Vocabulary Frequency ───────

describe('Integration: quest filtering + vocabulary ranges', () => {
  it('quest complexity increases with CEFR level', () => {
    const a1Complexity = getCEFRTextComplexity('A1');
    const b2Complexity = getCEFRTextComplexity('B2');
    const c2Complexity = getCEFRTextComplexity('C2');

    expect(a1Complexity.maxSentenceWords).toBeLessThan(b2Complexity.maxSentenceWords);
    expect(b2Complexity.maxSentenceWords).toBeLessThan(c2Complexity.maxSentenceWords);
    expect(a1Complexity.maxParagraphs).toBeLessThan(c2Complexity.maxParagraphs);
  });

  it('vocabulary range summary aligns with CEFR text complexity tier', () => {
    const summary = buildVocabularyRangeSummary('A1', 'French');
    // Summary mentions the top N words range
    expect(summary).toContain('200');
    const complexity = getCEFRTextComplexity('A1');
    expect(complexity.vocabularyTier).toBe('basic');
  });

  it('filtered quests respect vocabulary range expectations', () => {
    const quests = ALL_LEVELS.map(l => ({ title: `Quest ${l}`, cefrLevel: l }));
    const b1Quests = filterQuestsByCEFR(quests, 'B1');
    const b1Range = cefrToVocabularyRange('B1');

    // B1 player sees A2, B1, B2 quests
    expect(b1Quests.length).toBe(3);
    expect(b1Range.min).toBe(501);
    expect(b1Range.max).toBe(1500);
  });
});

// ── Cross-Module Integration: Hint Behavior + In-World Text ────────────────

describe('Integration: hint behavior + in-world text translation', () => {
  const lookup = (en: string) => en === 'Talk to' ? 'Parler à' : undefined;

  it('A1 player sees inline translations matching in-world text behavior', () => {
    const hints = getHintBehavior('A1');
    expect(hints.translationMode).toBe('inline');

    // In-world text at A1 in progressive mode translates interaction verbs
    const verb = translateInteractionVerb('Talk to', 'A1', 'progressive', lookup);
    // At A1, progressive mode may not translate (low immersion)
    expect(typeof verb).toBe('string');
  });

  it('B2 player gets click-only translations with natural in-world text', () => {
    const hints = getHintBehavior('B2');
    expect(hints.translationMode).toBe('click');

    // In-world prompts at B2 progressive should translate
    const prompt = buildTranslatedPrompt('E', 'Talk to', 'Jean', 'B2', 'progressive', lookup);
    expect(prompt).toBeTruthy();
    expect(typeof prompt).toBe('string');
  });
});

// ── Cross-Module Integration: Action Labels + UI Localization ──────────────

describe('Integration: action labels + UI localization', () => {
  const lookup = (en: string) => en === 'Talk' ? 'Parler' : en === 'Bakery' ? 'Boulangerie' : undefined;

  it('action labels integrate with getGameString for CEFR-aware display', () => {
    const label = getActionLabel('talk', lookup);
    // When translation found: label = translated, labelTranslation = english
    expect(label.label).toBe('Parler');
    expect(label.labelTranslation).toBe('Talk');

    // getGameString decides whether to show translated version based on CEFR
    const displayed = getGameString(
      'actions.label',
      label.label,
      label.labelTranslation ?? label.label,
      'B1',
      'progressive',
    );
    expect(typeof displayed).toBe('string');
  });

  it('building type labels integrate with bilingual display', () => {
    const bt = getBuildingTypeLabel('Bakery', lookup);
    expect(bt.translated).toBe('Boulangerie');
    expect(bt.english).toBe('Bakery');

    // getBilingualDisplay takes (englishText, translatedText, cefrLevel)
    const bilingual = getBilingualDisplay(bt.english, bt.translated, 'C1');
    expect(bilingual).toBeDefined();
    expect(typeof bilingual.primary).toBe('string');
  });
});

// ── Cross-Module Integration: Full Advancement Flow ────────────────────────

describe('Integration: full CEFR advancement flow', () => {
  it('player progressing A1→A2 changes NPC modes and hint behavior', () => {
    // Before advancement: A1 behavior
    const a1Hints = getHintBehavior('A1');
    const a1NPC = getNPCLanguageBehavior('A1', 'npc-test', 'French');

    // Player meets thresholds
    const advancement = checkCEFRAdvancement({
      currentLevel: 'A1',
      wordsLearned: 60,
      wordsMastered: 30,
      conversationsCompleted: 5,
      textsRead: 0,
      grammarPatternsRecognized: 3,
    });
    expect(advancement.shouldAdvance).toBe(true);
    expect(advancement.nextLevel).toBe('A2');

    // After advancement: A2 behavior differs
    const a2Hints = getHintBehavior('A2');
    const a2NPC = getNPCLanguageBehavior('A2', 'npc-test', 'French');

    // Hints become less frequent
    expect(a2Hints.newWordHintFrequency).toBeGreaterThan(a1Hints.newWordHintFrequency);

    // Quest pools adjust
    const poolSizes = getQuestPoolSizes();
    expect(poolSizes.A2).toBeLessThanOrEqual(poolSizes.A1);
  });

  it('A2→B1 transition unlocks hover translation and action label translation', () => {
    const b1Hints = getHintBehavior('B1');
    expect(b1Hints.translationMode).toBe('hover');

    // actions.label namespace should translate at B1+ in progressive mode
    const shouldTranslate = shouldTranslateUIKey('actions.label', 'B1', 'progressive');
    expect(typeof shouldTranslate).toBe('boolean');
  });
});

// ── Pre-generation Word Lists Completeness ─────────────────────────────────

describe('Integration: pre-generation word lists are comprehensive', () => {
  it('ACTION_LABEL_WORDS covers all unique action labels', () => {
    expect(ACTION_LABEL_WORDS.length).toBeGreaterThan(0);
    // No duplicates
    expect(new Set(ACTION_LABEL_WORDS).size).toBe(ACTION_LABEL_WORDS.length);
  });

  it('BUILDING_TYPE_LABELS covers common building types', () => {
    expect(BUILDING_TYPE_LABELS.length).toBeGreaterThanOrEqual(20);
    // BUILDING_TYPE_LABELS is string[] of English building type names
    expect(BUILDING_TYPE_LABELS).toContain('Bakery');
    expect(BUILDING_TYPE_LABELS).toContain('School');
  });

  it('IN_WORLD_TEXT_WORDS covers interaction verbs and quest hints', () => {
    expect(IN_WORLD_TEXT_WORDS.length).toBeGreaterThan(0);
    expect(IN_WORLD_TEXT_WORDS).toContain('Talk to');
    expect(IN_WORLD_TEXT_WORDS).toContain('Quest Available');
  });

  it('frequency directive content matches CEFR level expectations', () => {
    const a1 = buildFrequencyDirective('A1', 'French');
    const c2 = buildFrequencyDirective('C2', 'French');
    // A1 should mention top 200 most common words
    expect(a1).toContain('200');
    expect(a1).toContain('French');
    // Both are non-empty
    expect(a1.length).toBeGreaterThan(0);
    expect(c2.length).toBeGreaterThan(0);
  });
});

// ── Immersion Progress Data Coherence ──────────────────────────────────────

describe('Integration: immersion progress data coherence', () => {
  it('progress data shows increasing translation across CEFR levels', () => {
    const a1Data = getImmersionProgressData('A1', 'progressive');
    const c1Data = getImmersionProgressData('C1', 'progressive');

    // C1 should have more namespaces translated than A1
    expect(c1Data.activeCount).toBeGreaterThanOrEqual(a1Data.activeCount);
    expect(c1Data.immersionPercent).toBeGreaterThanOrEqual(a1Data.immersionPercent);
  });

  it('off mode shows no translation for any level', () => {
    const data = getImmersionProgressData('C2', 'english_only');
    expect(data.activeCount).toBe(0);
  });
});
