/**
 * Tests for CEFR integration with existing systems:
 * - cefr-mapping functions
 * - buildPlayerProficiencySection with cefrLevel override
 * - ContentGatingManager with CEFR-based gates
 * - LanguageProgress CEFR fields
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  mapScoreToCEFR,
  mapScoreToLevel,
  getCEFRDescription,
  cefrToFluencyTier,
  type CEFRLevel,
} from '../assessment/cefr-mapping';
import { buildPlayerProficiencySection, type PlayerProficiency } from '../language-utils';
import { ContentGatingManager } from '../../client/src/components/3DGame/ContentGatingManager';
import type { LanguageProgress } from '../language-progress';

// ── CEFR Mapping ──

describe('mapScoreToCEFR', () => {
  it('maps low scores to A1', () => {
    expect(mapScoreToCEFR(0)).toBe('A1');
    expect(mapScoreToCEFR(10)).toBe('A1');
    expect(mapScoreToCEFR(17)).toBe('A1');
  });

  it('maps scores 18-29 to A2', () => {
    expect(mapScoreToCEFR(18)).toBe('A2');
    expect(mapScoreToCEFR(25)).toBe('A2');
    expect(mapScoreToCEFR(29)).toBe('A2');
  });

  it('maps scores 30-41 to B1', () => {
    expect(mapScoreToCEFR(30)).toBe('B1');
    expect(mapScoreToCEFR(35)).toBe('B1');
    expect(mapScoreToCEFR(41)).toBe('B1');
  });

  it('maps scores 42+ to B2', () => {
    expect(mapScoreToCEFR(42)).toBe('B2');
    expect(mapScoreToCEFR(53)).toBe('B2');
  });
});

describe('mapScoreToLevel', () => {
  it('maps using custom thresholds', () => {
    const thresholds = [
      { level: 'gold', minScore: 80 },
      { level: 'silver', minScore: 50 },
      { level: 'bronze', minScore: 0 },
    ];
    expect(mapScoreToLevel(90, thresholds)).toBe('gold');
    expect(mapScoreToLevel(60, thresholds)).toBe('silver');
    expect(mapScoreToLevel(10, thresholds)).toBe('bronze');
  });
});

describe('getCEFRDescription', () => {
  it('returns description for each level', () => {
    expect(getCEFRDescription('A1')).toContain('Beginner');
    expect(getCEFRDescription('B2')).toContain('Upper Intermediate');
  });
});

describe('cefrToFluencyTier', () => {
  it('maps CEFR levels to fluency ranges', () => {
    expect(cefrToFluencyTier('A1').effective).toBe(10);
    expect(cefrToFluencyTier('A2').effective).toBe(30);
    expect(cefrToFluencyTier('B1').effective).toBe(50);
    expect(cefrToFluencyTier('B2').effective).toBe(70);
  });
});

// ── buildPlayerProficiencySection with CEFR ──

describe('buildPlayerProficiencySection with cefrLevel', () => {
  const baseProficiency: PlayerProficiency = {
    overallFluency: 15,
    vocabularyCount: 50,
    masteredWordCount: 10,
    weakGrammarPatterns: [],
    strongGrammarPatterns: [],
    conversationCount: 5,
  };

  it('uses fluency-based tier when no cefrLevel provided', () => {
    const result = buildPlayerProficiencySection(baseProficiency, 'French');
    expect(result).toContain('BEGINNER');
  });

  it('overrides to intermediate tier when cefrLevel is B1', () => {
    const result = buildPlayerProficiencySection(baseProficiency, 'French', null, 'B1');
    expect(result).toContain('INTERMEDIATE');
  });

  it('overrides to advanced tier when cefrLevel is B2', () => {
    const result = buildPlayerProficiencySection(baseProficiency, 'French', null, 'B2');
    expect(result).toContain('ADVANCED');
  });

  it('overrides to elementary tier when cefrLevel is A2', () => {
    const result = buildPlayerProficiencySection(baseProficiency, 'French', null, 'A2');
    expect(result).toContain('ELEMENTARY');
  });

  it('keeps beginner tier when cefrLevel is A1', () => {
    const result = buildPlayerProficiencySection(baseProficiency, 'French', null, 'A1');
    expect(result).toContain('BEGINNER');
  });

  it('still applies occupation modifier on top of CEFR tier', () => {
    // A teacher (−15 modifier) with B1 CEFR: effective = 50 − 15 = 35, which is elementary (20-40)
    const result = buildPlayerProficiencySection(baseProficiency, 'French', 'teacher', 'B1');
    expect(result).toContain('ELEMENTARY');
  });
});

// ── ContentGatingManager with CEFR ──

describe('ContentGatingManager CEFR gates', () => {
  let manager: ContentGatingManager;

  beforeEach(() => {
    manager = new ContentGatingManager();
  });

  it('does not unlock CEFR gates without cefrLevel', () => {
    manager.updatePlayerProgress({
      fluency: 100,
      level: 20,
      wordsMastered: 500,
      questsCompleted: 50,
    });
    expect(manager.isUnlocked('unlock_debate_quests')).toBe(false);
    expect(manager.isUnlocked('unlock_professional_npcs')).toBe(false);
  });

  it('unlocks A2 gate when player has A2', () => {
    manager.updatePlayerProgress({
      fluency: 0,
      level: 1,
      wordsMastered: 0,
      questsCompleted: 0,
      cefrLevel: 'A2',
    });
    expect(manager.isUnlocked('unlock_professional_npcs')).toBe(true);
    expect(manager.isUnlocked('unlock_debate_quests')).toBe(false);
  });

  it('unlocks B1 gates when player has B1', () => {
    manager.updatePlayerProgress({
      fluency: 0,
      level: 1,
      wordsMastered: 0,
      questsCompleted: 0,
      cefrLevel: 'B1',
    });
    expect(manager.isUnlocked('unlock_professional_npcs')).toBe(true);
    expect(manager.isUnlocked('unlock_debate_quests')).toBe(true);
    expect(manager.isUnlocked('unlock_university_district')).toBe(true);
  });

  it('unlocks both CEFR and fluency gates simultaneously', () => {
    const newlyUnlocked = manager.updatePlayerProgress({
      fluency: 30,
      level: 5,
      wordsMastered: 0,
      questsCompleted: 0,
      cefrLevel: 'A2',
    });
    // Fluency 30 unlocks: unlock_town (20), unlock_scholars (30), unlock_translation_quests (30), unlock_cultural_quests (30)
    // CEFR A2 unlocks: unlock_professional_npcs
    expect(manager.isUnlocked('unlock_town')).toBe(true);
    expect(manager.isUnlocked('unlock_professional_npcs')).toBe(true);
    expect(newlyUnlocked.length).toBeGreaterThanOrEqual(2);
  });

  it('returns newly unlocked gates only', () => {
    manager.updatePlayerProgress({
      fluency: 0, level: 1, wordsMastered: 0, questsCompleted: 0, cefrLevel: 'A2',
    });
    const second = manager.updatePlayerProgress({
      fluency: 0, level: 1, wordsMastered: 0, questsCompleted: 0, cefrLevel: 'B1',
    });
    // Professional NPCs already unlocked, so only debate/university should be new
    expect(second.find(g => g.id === 'unlock_professional_npcs')).toBeUndefined();
    expect(second.find(g => g.id === 'unlock_debate_quests')).toBeDefined();
  });
});

// ── LanguageProgress type shape ──

describe('LanguageProgress CEFR fields', () => {
  it('accepts cefrLevel and assessmentDimensions', () => {
    const progress: LanguageProgress = {
      playerId: 'p1',
      worldId: 'w1',
      language: 'French',
      overallFluency: 45,
      cefrLevel: 'B1',
      assessmentDimensions: {
        comprehension: 4,
        fluency: 3,
        vocabulary: 3,
        grammar: 2,
        pronunciation: 3,
      },
      lastAssessmentAt: Date.now(),
      vocabulary: [],
      grammarPatterns: [],
      conversations: [],
      totalConversations: 10,
      totalWordsLearned: 100,
      totalCorrectUsages: 80,
      streakDays: 5,
      lastActivityTimestamp: Date.now(),
    };
    expect(progress.cefrLevel).toBe('B1');
    expect(progress.assessmentDimensions?.comprehension).toBe(4);
    expect(progress.lastAssessmentAt).toBeDefined();
  });

  it('works without optional CEFR fields (backward compatible)', () => {
    const progress: LanguageProgress = {
      playerId: 'p2',
      worldId: 'w2',
      language: 'Spanish',
      overallFluency: 20,
      vocabulary: [],
      grammarPatterns: [],
      conversations: [],
      totalConversations: 0,
      totalWordsLearned: 0,
      totalCorrectUsages: 0,
      streakDays: 0,
      lastActivityTimestamp: 0,
    };
    expect(progress.cefrLevel).toBeUndefined();
    expect(progress.assessmentDimensions).toBeUndefined();
  });
});
