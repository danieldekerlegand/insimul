import { describe, it, expect } from 'vitest';
import {
  assignNPCLanguageMode,
  buildLanguageModeDirective,
  getNPCLanguageBehavior,
  getHintBehavior,
  shouldShowVocabHint,
  isWordMastered,
  isQuestAppropriateForLevel,
  filterQuestsByCEFR,
  checkCEFRAdvancement,
  cefrToVocabularyRange,
  getQuestPoolSizes,
  getCEFRTextComplexity,
  type NPCLanguageMode,
  type CEFRProgressSnapshot,
} from '../language/cefr-adaptation';

// ── NPC Language Mode ────────────────────────────────────────────────────────

describe('assignNPCLanguageMode', () => {
  it('assigns bilingual or simplified at A1 (60/40 split)', () => {
    // Test many NPC IDs to verify distribution stays within bounds
    const modes = Array.from({ length: 100 }, (_, i) =>
      assignNPCLanguageMode('A1', `npc_${i}`),
    );
    const bilingual = modes.filter(m => m === 'bilingual').length;
    const simplified = modes.filter(m => m === 'simplified').length;
    const natural = modes.filter(m => m === 'natural').length;

    expect(natural).toBe(0); // No natural at A1
    expect(bilingual + simplified).toBe(100);
    expect(bilingual).toBeGreaterThan(0);
    expect(simplified).toBeGreaterThan(0);
  });

  it('assigns 100% natural at B2', () => {
    const modes = Array.from({ length: 50 }, (_, i) =>
      assignNPCLanguageMode('B2', `npc_${i}`),
    );
    expect(modes.every(m => m === 'natural')).toBe(true);
  });

  it('is deterministic — same NPC ID always gets same mode', () => {
    const mode1 = assignNPCLanguageMode('A1', 'npc_test_42');
    const mode2 = assignNPCLanguageMode('A1', 'npc_test_42');
    expect(mode1).toBe(mode2);
  });

  it('includes bilingual NPCs at B1 (10%)', () => {
    const modes = Array.from({ length: 200 }, (_, i) =>
      assignNPCLanguageMode('B1', `npc_b1_${i}`),
    );
    const bilingual = modes.filter(m => m === 'bilingual').length;
    expect(bilingual).toBeGreaterThan(0);
    expect(bilingual).toBeLessThan(50); // Should be roughly 10%
  });
});

describe('buildLanguageModeDirective', () => {
  it('builds bilingual directive with language mixing instructions', () => {
    const directive = buildLanguageModeDirective('bilingual', 'French', 'English');
    expect(directive).toContain('BILINGUAL');
    expect(directive).toContain('English');
    expect(directive).toContain('French');
    expect(directive).toContain('Mix');
  });

  it('builds simplified directive with simple language instructions', () => {
    const directive = buildLanguageModeDirective('simplified', 'Spanish');
    expect(directive).toContain('SIMPLIFIED');
    expect(directive).toContain('simple');
    expect(directive).toContain('Spanish');
  });

  it('builds natural directive', () => {
    const directive = buildLanguageModeDirective('natural', 'German');
    expect(directive).toContain('NATURAL');
    expect(directive).toContain('German');
    expect(directive).toContain('natural pace');
  });
});

describe('getNPCLanguageBehavior', () => {
  it('returns a complete behavior object', () => {
    const behavior = getNPCLanguageBehavior('A1', 'npc_42', 'French');
    expect(behavior.languageMode).toBeDefined();
    expect(behavior.promptDirective).toBeTruthy();
    expect(['bilingual', 'simplified', 'natural']).toContain(behavior.languageMode);
  });
});

// ── Hint Behavior ────────────────────────────────────────────────────────────

describe('getHintBehavior', () => {
  it('returns inline translations and translate button at A1', () => {
    const config = getHintBehavior('A1');
    expect(config.translationMode).toBe('inline');
    expect(config.showTranslateButton).toBe(true);
    expect(config.translateButtonProminence).toBe(2);
    expect(config.newWordHintFrequency).toBe(1);
  });

  it('returns inline translations with less prominent button at A2', () => {
    const config = getHintBehavior('A2');
    expect(config.translationMode).toBe('inline');
    expect(config.showTranslateButton).toBe(true);
    expect(config.translateButtonProminence).toBe(1);
    expect(config.newWordHintFrequency).toBe(3);
  });

  it('returns hover translations and no translate button at B1', () => {
    const config = getHintBehavior('B1');
    expect(config.translationMode).toBe('hover');
    expect(config.showTranslateButton).toBe(false);
    expect(config.advancedVocabOnly).toBe(true);
  });

  it('returns click translations at B2', () => {
    const config = getHintBehavior('B2');
    expect(config.translationMode).toBe('click');
    expect(config.showTranslateButton).toBe(false);
    expect(config.advancedVocabOnly).toBe(true);
  });
});

describe('shouldShowVocabHint', () => {
  it('shows hint for every new word at A1', () => {
    expect(shouldShowVocabHint('A1', 0)).toBe(true);
    expect(shouldShowVocabHint('A1', 1)).toBe(true);
    expect(shouldShowVocabHint('A1', 5)).toBe(true);
  });

  it('shows hint for every 3rd word at A2', () => {
    expect(shouldShowVocabHint('A2', 0)).toBe(true);
    expect(shouldShowVocabHint('A2', 1)).toBe(false);
    expect(shouldShowVocabHint('A2', 2)).toBe(false);
    expect(shouldShowVocabHint('A2', 3)).toBe(true);
  });

  it('only shows hint for advanced vocab at B1', () => {
    expect(shouldShowVocabHint('B1', 0, 'beginner')).toBe(false);
    expect(shouldShowVocabHint('B1', 0, 'intermediate')).toBe(false);
    expect(shouldShowVocabHint('B1', 0, 'advanced')).toBe(true);
  });

  it('never shows hint for mastered words', () => {
    expect(shouldShowVocabHint('A1', 0, 'beginner', true)).toBe(false);
    expect(shouldShowVocabHint('A2', 0, 'beginner', true)).toBe(false);
  });
});

describe('isWordMastered', () => {
  it('requires 5+ encounters and 1+ correct usage', () => {
    expect(isWordMastered(4, 1)).toBe(false);
    expect(isWordMastered(5, 0)).toBe(false);
    expect(isWordMastered(5, 1)).toBe(true);
    expect(isWordMastered(10, 3)).toBe(true);
  });
});

// ── Quest Filtering ──────────────────────────────────────────────────────────

describe('isQuestAppropriateForLevel', () => {
  it('allows quests at same level', () => {
    expect(isQuestAppropriateForLevel('A1', 'A1')).toBe(true);
    expect(isQuestAppropriateForLevel('B2', 'B2')).toBe(true);
  });

  it('allows quests one level above', () => {
    expect(isQuestAppropriateForLevel('A2', 'A1')).toBe(true);
    expect(isQuestAppropriateForLevel('B1', 'A2')).toBe(true);
  });

  it('allows quests one level below', () => {
    expect(isQuestAppropriateForLevel('A1', 'A2')).toBe(true);
  });

  it('rejects quests two or more levels above', () => {
    expect(isQuestAppropriateForLevel('B1', 'A1')).toBe(false);
    expect(isQuestAppropriateForLevel('B2', 'A1')).toBe(false);
  });
});

describe('filterQuestsByCEFR', () => {
  const quests = [
    { id: 1, cefrLevel: 'A1' },
    { id: 2, cefrLevel: 'A2' },
    { id: 3, cefrLevel: 'B1' },
    { id: 4, cefrLevel: 'B2' },
    { id: 5, cefrLevel: null }, // untagged
  ];

  it('A1 player sees A1, A2 quests and untagged', () => {
    const filtered = filterQuestsByCEFR(quests, 'A1');
    expect(filtered.map(q => q.id)).toEqual(expect.arrayContaining([1, 2, 5]));
    expect(filtered.find(q => q.id === 3)).toBeUndefined();
  });

  it('B1 player sees A2, B1, B2 quests and untagged', () => {
    const filtered = filterQuestsByCEFR(quests, 'B1');
    expect(filtered.map(q => q.id)).toEqual(expect.arrayContaining([2, 3, 4, 5]));
    expect(filtered.find(q => q.id === 1)).toBeUndefined();
  });

  it('sorts by proximity to player level', () => {
    const filtered = filterQuestsByCEFR(quests, 'A2');
    // A2 (at-level) should come before A1 and B1
    const cefrFiltered = filtered.filter(q => q.cefrLevel);
    expect(cefrFiltered[0].cefrLevel).toBe('A2');
  });
});

// ── CEFR Advancement ─────────────────────────────────────────────────────────

describe('checkCEFRAdvancement', () => {
  it('does not advance when thresholds not met', () => {
    const snapshot: CEFRProgressSnapshot = {
      currentLevel: 'A1',
      wordsLearned: 20,
      wordsMastered: 5,
      conversationsCompleted: 1,
      textsRead: 0,
      grammarPatternsRecognized: 2,
    };
    const result = checkCEFRAdvancement(snapshot);
    expect(result.shouldAdvance).toBe(false);
    expect(result.nextLevel).toBe('A2');
    expect(result.progress).toBeLessThan(1);
  });

  it('advances from A1 to A2 when all thresholds met', () => {
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

  it('requires texts read for A2→B1', () => {
    const snapshot: CEFRProgressSnapshot = {
      currentLevel: 'A2',
      wordsLearned: 200,
      wordsMastered: 50,
      conversationsCompleted: 15,
      textsRead: 2, // Needs 5
      grammarPatternsRecognized: 10,
    };
    const result = checkCEFRAdvancement(snapshot);
    expect(result.shouldAdvance).toBe(false);
    expect(result.metrics.textsProgress).toBeLessThan(1);
  });

  it('advances from A2→B1 when all thresholds met', () => {
    const snapshot: CEFRProgressSnapshot = {
      currentLevel: 'A2',
      wordsLearned: 150,
      wordsMastered: 50,
      conversationsCompleted: 10,
      textsRead: 5,
      grammarPatternsRecognized: 10,
    };
    const result = checkCEFRAdvancement(snapshot);
    expect(result.shouldAdvance).toBe(true);
    expect(result.nextLevel).toBe('B1');
  });

  it('does not advance beyond B2', () => {
    const snapshot: CEFRProgressSnapshot = {
      currentLevel: 'B2',
      wordsLearned: 500,
      wordsMastered: 200,
      conversationsCompleted: 50,
      textsRead: 30,
      grammarPatternsRecognized: 20,
    };
    const result = checkCEFRAdvancement(snapshot);
    expect(result.shouldAdvance).toBe(false);
    expect(result.nextLevel).toBeNull();
    expect(result.progress).toBe(1);
  });

  it('reports individual metric progress', () => {
    const snapshot: CEFRProgressSnapshot = {
      currentLevel: 'A1',
      wordsLearned: 25, // 50% of 50
      wordsMastered: 0,
      conversationsCompleted: 1, // 33% of 3
      textsRead: 0,
      grammarPatternsRecognized: 0,
    };
    const result = checkCEFRAdvancement(snapshot);
    expect(result.metrics.wordsProgress).toBeCloseTo(0.5);
    expect(result.metrics.conversationsProgress).toBeCloseTo(0.333, 2);
    expect(result.metrics.textsProgress).toBe(1); // A1→A2 requires 0 texts
  });
});

// ── Vocabulary Range ─────────────────────────────────────────────────────────

describe('cefrToVocabularyRange', () => {
  it('maps A1 to top 200 words', () => {
    expect(cefrToVocabularyRange('A1')).toEqual({ min: 1, max: 200 });
  });

  it('maps A2 to 201-500', () => {
    expect(cefrToVocabularyRange('A2')).toEqual({ min: 201, max: 500 });
  });

  it('maps B1 to 501-1500', () => {
    expect(cefrToVocabularyRange('B1')).toEqual({ min: 501, max: 1500 });
  });

  it('maps B2 to 1501+', () => {
    const range = cefrToVocabularyRange('B2');
    expect(range.min).toBe(1501);
    expect(range.max).toBe(Infinity);
  });
});

// ── Quest Pool Sizes ─────────────────────────────────────────────────────────

describe('getQuestPoolSizes', () => {
  it('returns 80 total quests across all levels', () => {
    const sizes = getQuestPoolSizes();
    const total = sizes.A1 + sizes.A2 + sizes.B1 + sizes.B2;
    expect(total).toBe(80);
    expect(sizes.A1).toBe(30);
    expect(sizes.B2).toBe(10);
  });
});

// ── Text Complexity ──────────────────────────────────────────────────────────

describe('getCEFRTextComplexity', () => {
  it('A1 uses true/false questions with short sentences', () => {
    const config = getCEFRTextComplexity('A1');
    expect(config.comprehensionQuestionType).toBe('true_false');
    expect(config.maxSentenceWords).toBe(8);
    expect(config.vocabularyTier).toBe('basic');
  });

  it('B2 uses analytical questions with complex sentences', () => {
    const config = getCEFRTextComplexity('B2');
    expect(config.comprehensionQuestionType).toBe('analytical');
    expect(config.maxSentenceWords).toBe(30);
    expect(config.vocabularyTier).toBe('advanced');
  });

  it('increases complexity from A1 to B2', () => {
    const a1 = getCEFRTextComplexity('A1');
    const a2 = getCEFRTextComplexity('A2');
    const b1 = getCEFRTextComplexity('B1');
    const b2 = getCEFRTextComplexity('B2');

    expect(a1.maxSentenceWords).toBeLessThan(a2.maxSentenceWords);
    expect(a2.maxSentenceWords).toBeLessThan(b1.maxSentenceWords);
    expect(b1.maxSentenceWords).toBeLessThan(b2.maxSentenceWords);
  });
});
