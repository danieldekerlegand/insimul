/**
 * Tests for C1/C2 CEFR Level Support (US-010)
 *
 * Verifies that C1 and C2 levels are properly supported across
 * all CEFR-dependent systems: mapping, adaptation, vocabulary,
 * quests, hints, advancement, and text complexity.
 */
import { describe, it, expect } from 'vitest';

import {
  CEFR_THRESHOLDS,
  mapScoreToCEFR,
  cefrToFluencyTier,
  getCEFRDescription,
} from '../assessment/cefr-mapping';

import type { CEFRLevel } from '../assessment/assessment-types';

import {
  assignNPCLanguageMode,
  buildLanguageModeDirective,
  getNPCLanguageBehavior,
  getHintBehavior,
  isQuestAppropriateForLevel,
  filterQuestsByCEFR,
  CEFR_ADVANCEMENT_THRESHOLDS,
  checkCEFRAdvancement,
  cefrToVocabularyRange,
  getQuestPoolSizes,
  getCEFRTextComplexity,
} from '../language/cefr-adaptation';

import {
  getFrequencyRange,
  isWordInFrequencyRange,
  validateVocabularyFrequency,
  buildFrequencyDirective,
  buildVocabularyRangeSummary,
} from '../language/vocabulary-frequency';

import {
  cefrLevelLabel,
  getPlayerQuestAlignment,
  filterTextsByCEFR,
} from '../quest-difficulty';

// ── Score Mapping ─────────────────────────────────────────────────────────────

describe('CEFR Score Mapping — C1/C2', () => {
  it('CEFR_THRESHOLDS includes C1 at 85% and C2 at 95%', () => {
    const c1 = CEFR_THRESHOLDS.find(t => t.level === 'C1');
    const c2 = CEFR_THRESHOLDS.find(t => t.level === 'C2');
    expect(c1).toBeDefined();
    expect(c1!.min).toBe(85);
    expect(c2).toBeDefined();
    expect(c2!.min).toBe(95);
  });

  it('mapScoreToCEFR returns C1 for score 85-94%', () => {
    expect(mapScoreToCEFR(85, 100).level).toBe('C1');
    expect(mapScoreToCEFR(94, 100).level).toBe('C1');
  });

  it('mapScoreToCEFR returns C2 for score 95-100%', () => {
    expect(mapScoreToCEFR(95, 100).level).toBe('C2');
    expect(mapScoreToCEFR(100, 100).level).toBe('C2');
  });

  it('mapScoreToCEFR still returns B2 for 75-84%', () => {
    expect(mapScoreToCEFR(75, 100).level).toBe('B2');
    expect(mapScoreToCEFR(84, 100).level).toBe('B2');
  });

  it('getCEFRDescription returns non-empty for C1/C2', () => {
    expect(getCEFRDescription('C1')).toBeTruthy();
    expect(getCEFRDescription('C2')).toBeTruthy();
  });

  it('cefrToFluencyTier returns values for C1/C2', () => {
    const c1 = cefrToFluencyTier('C1');
    const c2 = cefrToFluencyTier('C2');
    expect(c1.effective).toBeGreaterThan(cefrToFluencyTier('B2').effective);
    expect(c2.effective).toBeGreaterThan(c1.effective);
  });
});

// ── NPC Language Behavior ─────────────────────────────────────────────────────

describe('NPC Language Behavior — C1/C2', () => {
  it('C1/C2 NPCs always use natural mode', () => {
    // Test multiple NPC IDs to ensure distribution is always natural
    for (const npcId of ['npc_001', 'npc_002', 'npc_003', 'npc_100']) {
      expect(assignNPCLanguageMode('C1', npcId)).toBe('natural');
      expect(assignNPCLanguageMode('C2', npcId)).toBe('natural');
    }
  });

  it('getNPCLanguageBehavior returns valid behavior for C1/C2', () => {
    const c1 = getNPCLanguageBehavior('C1', 'npc_001', 'French');
    const c2 = getNPCLanguageBehavior('C2', 'npc_001', 'French');
    expect(c1.languageMode).toBe('natural');
    expect(c2.languageMode).toBe('natural');
    expect(c1.promptDirective).toContain('NATURAL');
    expect(c2.promptDirective).toContain('NATURAL');
  });

  it('buildLanguageModeDirective includes frequency directive for C1/C2', () => {
    const c1 = buildLanguageModeDirective('natural', 'French', 'English', 'C1');
    const c2 = buildLanguageModeDirective('natural', 'French', 'English', 'C2');
    expect(c1).toContain('NATURAL');
    expect(c2).toContain('NATURAL');
  });
});

// ── Hint Behavior ─────────────────────────────────────────────────────────────

describe('Hint Behavior — C1/C2', () => {
  it('C1 returns click mode with no hints', () => {
    const config = getHintBehavior('C1');
    expect(config.translationMode).toBe('click');
    expect(config.showTranslateButton).toBe(false);
    expect(config.newWordHintFrequency).toBe(0);
  });

  it('C2 returns click mode with no hints', () => {
    const config = getHintBehavior('C2');
    expect(config.translationMode).toBe('click');
    expect(config.showTranslateButton).toBe(false);
    expect(config.newWordHintFrequency).toBe(0);
  });
});

// ── CEFR Advancement ──────────────────────────────────────────────────────────

describe('CEFR Advancement — C1/C2', () => {
  it('B2→C1 threshold exists with correct values', () => {
    const threshold = CEFR_ADVANCEMENT_THRESHOLDS['B2→C1'];
    expect(threshold).toBeDefined();
    expect(threshold.wordsLearned).toBe(500);
    expect(threshold.conversationsCompleted).toBe(50);
    expect(threshold.textsRead).toBe(30);
  });

  it('C1→C2 threshold exists with correct values', () => {
    const threshold = CEFR_ADVANCEMENT_THRESHOLDS['C1→C2'];
    expect(threshold).toBeDefined();
    expect(threshold.wordsLearned).toBe(800);
    expect(threshold.conversationsCompleted).toBe(100);
    expect(threshold.textsRead).toBe(50);
  });

  it('checkCEFRAdvancement advances B2→C1 when thresholds met', () => {
    const result = checkCEFRAdvancement({
      currentLevel: 'B2',
      wordsLearned: 500,
      wordsMastered: 200,
      conversationsCompleted: 50,
      textsRead: 30,
      grammarPatternsRecognized: 20,
    });
    expect(result.shouldAdvance).toBe(true);
    expect(result.nextLevel).toBe('C1');
  });

  it('checkCEFRAdvancement advances C1→C2 when thresholds met', () => {
    const result = checkCEFRAdvancement({
      currentLevel: 'C1',
      wordsLearned: 800,
      wordsMastered: 400,
      conversationsCompleted: 100,
      textsRead: 50,
      grammarPatternsRecognized: 40,
    });
    expect(result.shouldAdvance).toBe(true);
    expect(result.nextLevel).toBe('C2');
  });

  it('checkCEFRAdvancement returns no advance at C2 (max level)', () => {
    const result = checkCEFRAdvancement({
      currentLevel: 'C2',
      wordsLearned: 1000,
      wordsMastered: 500,
      conversationsCompleted: 200,
      textsRead: 100,
      grammarPatternsRecognized: 50,
    });
    expect(result.shouldAdvance).toBe(false);
    expect(result.nextLevel).toBeNull();
    expect(result.progress).toBe(1.0);
  });

  it('checkCEFRAdvancement reports partial progress for B2→C1', () => {
    const result = checkCEFRAdvancement({
      currentLevel: 'B2',
      wordsLearned: 250, // half of 500
      wordsMastered: 100,
      conversationsCompleted: 25, // half of 50
      textsRead: 15, // half of 30
      grammarPatternsRecognized: 10,
    });
    expect(result.shouldAdvance).toBe(false);
    expect(result.nextLevel).toBe('C1');
    expect(result.progress).toBeCloseTo(0.5, 1);
  });
});

// ── Quest Filtering ───────────────────────────────────────────────────────────

describe('Quest CEFR Filtering — C1/C2', () => {
  it('C1 quest is appropriate for C1 and C2 players', () => {
    expect(isQuestAppropriateForLevel('C1', 'C1')).toBe(true);
    expect(isQuestAppropriateForLevel('C1', 'C2')).toBe(true);
  });

  it('C2 quest is appropriate for C1 and C2 players', () => {
    expect(isQuestAppropriateForLevel('C2', 'C1')).toBe(true);
    expect(isQuestAppropriateForLevel('C2', 'C2')).toBe(true);
  });

  it('C2 quest is NOT appropriate for B1 player (too far above)', () => {
    expect(isQuestAppropriateForLevel('C2', 'B1')).toBe(false);
  });

  it('filterQuestsByCEFR includes C1/C2 quests for C1 player', () => {
    const quests = [
      { id: 1, cefrLevel: 'B2' },
      { id: 2, cefrLevel: 'C1' },
      { id: 3, cefrLevel: 'C2' },
      { id: 4, cefrLevel: 'A1' },
    ];
    const filtered = filterQuestsByCEFR(quests, 'C1');
    const ids = filtered.map(q => q.id);
    expect(ids).toContain(2); // at level
    expect(ids).toContain(1); // one below
    expect(ids).toContain(3); // one above
    expect(ids).not.toContain(4); // too far below
  });

  it('getQuestPoolSizes includes C1 and C2', () => {
    const sizes = getQuestPoolSizes();
    expect(sizes.C1).toBeDefined();
    expect(sizes.C1).toBeGreaterThan(0);
    expect(sizes.C2).toBeDefined();
    expect(sizes.C2).toBeGreaterThan(0);
  });
});

// ── Vocabulary & Text Complexity ──────────────────────────────────────────────

describe('Vocabulary & Text Complexity — C1/C2', () => {
  it('cefrToVocabularyRange returns unrestricted for C1/C2', () => {
    expect(cefrToVocabularyRange('C1').max).toBe(Infinity);
    expect(cefrToVocabularyRange('C2').max).toBe(Infinity);
  });

  it('getCEFRTextComplexity returns higher parameters for C1/C2', () => {
    const b2 = getCEFRTextComplexity('B2');
    const c1 = getCEFRTextComplexity('C1');
    const c2 = getCEFRTextComplexity('C2');
    expect(c1.maxSentenceWords).toBeGreaterThan(b2.maxSentenceWords);
    expect(c2.maxSentenceWords).toBeGreaterThan(c1.maxSentenceWords);
    expect(c1.vocabularyTier).toBe('sophisticated');
    expect(c2.vocabularyTier).toBe('native');
  });

  it('getFrequencyRange returns unrestricted for C1/C2', () => {
    const c1 = getFrequencyRange('C1');
    const c2 = getFrequencyRange('C2');
    expect(c1.max).toBe(Infinity);
    expect(c2.max).toBe(Infinity);
    expect(c1.label).toContain('unrestricted');
    expect(c2.label).toContain('unrestricted');
  });

  it('isWordInFrequencyRange returns true for any word at C1/C2', () => {
    expect(isWordInFrequencyRange('anything', 'C1', 'French')).toBe(true);
    expect(isWordInFrequencyRange('anything', 'C2', 'French')).toBe(true);
  });

  it('validateVocabularyFrequency returns valid for C1/C2', () => {
    const c1 = validateVocabularyFrequency('n\'importe quel mot', 'C1', 'French');
    const c2 = validateVocabularyFrequency('n\'importe quel mot', 'C2', 'French');
    expect(c1.valid).toBe(true);
    expect(c2.valid).toBe(true);
  });

  it('buildVocabularyRangeSummary includes unrestricted for C1/C2', () => {
    expect(buildVocabularyRangeSummary('C1')).toContain('unrestricted');
    expect(buildVocabularyRangeSummary('C2')).toContain('unrestricted');
  });
});

// ── Quest Difficulty Labels ───────────────────────────────────────────────────

describe('Quest Difficulty — C1/C2', () => {
  it('cefrLevelLabel returns correct labels for C1/C2', () => {
    expect(cefrLevelLabel('C1')).toBe('C1 Advanced');
    expect(cefrLevelLabel('C2')).toBe('C2 Mastery');
  });

  it('getPlayerQuestAlignment works with C1/C2', () => {
    expect(getPlayerQuestAlignment('C2', 'C2')).toBe('at_level');
    expect(getPlayerQuestAlignment('C2', 'C1')).toBe('above');
    expect(getPlayerQuestAlignment('C1', 'C2')).toBe('below');
  });

  it('filterTextsByCEFR includes C1/C2 texts for advanced players', () => {
    const texts = [
      { id: 1, cefrLevel: 'A1' },
      { id: 2, cefrLevel: 'B2' },
      { id: 3, cefrLevel: 'C1' },
      { id: 4, cefrLevel: 'C2' },
    ];
    const c2Filtered = filterTextsByCEFR(texts, 'C2');
    expect(c2Filtered).toHaveLength(4); // all levels at or below C2

    const c1Filtered = filterTextsByCEFR(texts, 'C1');
    expect(c1Filtered).toHaveLength(3); // up to C1, not C2
  });
});

// ── Full Level Coverage ───────────────────────────────────────────────────────

describe('Full CEFR Level Coverage', () => {
  const allLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  it('all 6 levels have score thresholds', () => {
    for (const level of allLevels) {
      const threshold = CEFR_THRESHOLDS.find(t => t.level === level);
      expect(threshold).toBeDefined();
    }
  });

  it('all 6 levels have hint behavior', () => {
    for (const level of allLevels) {
      const config = getHintBehavior(level);
      expect(config).toBeDefined();
      expect(config.translationMode).toBeDefined();
    }
  });

  it('all 6 levels have text complexity', () => {
    for (const level of allLevels) {
      const complexity = getCEFRTextComplexity(level);
      expect(complexity).toBeDefined();
      expect(complexity.maxSentenceWords).toBeGreaterThan(0);
    }
  });

  it('all 6 levels have vocabulary ranges', () => {
    for (const level of allLevels) {
      const range = cefrToVocabularyRange(level);
      expect(range).toBeDefined();
      expect(range.min).toBeGreaterThanOrEqual(1);
    }
  });

  it('all 6 levels have frequency ranges', () => {
    for (const level of allLevels) {
      const range = getFrequencyRange(level);
      expect(range).toBeDefined();
      expect(range.label).toBeTruthy();
    }
  });

  it('all 6 levels have quest pool sizes', () => {
    const sizes = getQuestPoolSizes();
    for (const level of allLevels) {
      expect(sizes[level]).toBeDefined();
      expect(sizes[level]).toBeGreaterThan(0);
    }
  });

  it('all 5 advancement transitions exist (A1→A2 through C1→C2)', () => {
    const transitions = ['A1→A2', 'A2→B1', 'B1→B2', 'B2→C1', 'C1→C2'];
    for (const key of transitions) {
      expect(CEFR_ADVANCEMENT_THRESHOLDS[key]).toBeDefined();
    }
  });
});
