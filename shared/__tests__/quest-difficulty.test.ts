import { describe, it, expect } from 'vitest';
import {
  difficultyToCEFR,
  computeDifficultyStars,
  estimateCompletionMinutes,
  getQuestDifficultyInfo,
  getPlayerQuestAlignment,
  isQuestRecommended,
  getAlignmentColor,
  cefrLevelLabel,
} from '../quest-difficulty';

describe('difficultyToCEFR', () => {
  it('maps beginner to A1 with few objectives', () => {
    expect(difficultyToCEFR('beginner', 1)).toBe('A1');
    expect(difficultyToCEFR('beginner', 3)).toBe('A1');
  });

  it('maps beginner to A2 with many objectives', () => {
    expect(difficultyToCEFR('beginner', 4)).toBe('A2');
  });

  it('maps intermediate to A2/B1', () => {
    expect(difficultyToCEFR('intermediate', 2)).toBe('A2');
    expect(difficultyToCEFR('intermediate', 5)).toBe('B1');
  });

  it('maps advanced to B1/B2', () => {
    expect(difficultyToCEFR('advanced', 1)).toBe('B1');
    expect(difficultyToCEFR('advanced', 4)).toBe('B2');
  });

  it('defaults unknown difficulty to A1', () => {
    expect(difficultyToCEFR('unknown')).toBe('A1');
  });
});

describe('computeDifficultyStars', () => {
  it('returns 1 star for beginner with 1 objective', () => {
    expect(computeDifficultyStars('beginner', 1)).toBe(1);
  });

  it('returns 2 stars for beginner with 4+ objectives', () => {
    expect(computeDifficultyStars('beginner', 4)).toBe(2);
  });

  it('returns 3 stars for intermediate with few objectives', () => {
    expect(computeDifficultyStars('intermediate', 2)).toBe(3);
  });

  it('returns 4 stars for intermediate with many objectives', () => {
    expect(computeDifficultyStars('intermediate', 4)).toBe(4);
  });

  it('returns 4-5 stars for advanced', () => {
    expect(computeDifficultyStars('advanced', 1)).toBe(4);
    expect(computeDifficultyStars('advanced', 4)).toBe(5);
  });

  it('clamps to max 5 stars', () => {
    expect(computeDifficultyStars('advanced', 10)).toBe(5);
  });
});

describe('estimateCompletionMinutes', () => {
  it('returns base time for 1 objective', () => {
    expect(estimateCompletionMinutes('beginner', 1)).toBe(5);
    expect(estimateCompletionMinutes('intermediate', 1)).toBe(10);
    expect(estimateCompletionMinutes('advanced', 1)).toBe(15);
  });

  it('adds 3 minutes per additional objective', () => {
    expect(estimateCompletionMinutes('beginner', 3)).toBe(11);
    expect(estimateCompletionMinutes('intermediate', 4)).toBe(19);
  });
});

describe('getQuestDifficultyInfo', () => {
  it('returns complete difficulty info', () => {
    const info = getQuestDifficultyInfo('intermediate', 'conversation', 3);
    expect(info.cefrLevel).toBe('A2');
    expect(info.stars).toBe(3);
    expect(info.estimatedMinutes).toBe(16);
    expect(info.skillsFocused).toEqual(['speaking', 'listening']);
  });

  it('returns general skills for unknown category', () => {
    const info = getQuestDifficultyInfo('beginner', 'unknown_cat', 1);
    expect(info.skillsFocused).toEqual(['general']);
  });
});

describe('getPlayerQuestAlignment', () => {
  it('returns at_level when quest matches player', () => {
    expect(getPlayerQuestAlignment('A2', 'A2')).toBe('at_level');
  });

  it('returns below when quest is below player', () => {
    expect(getPlayerQuestAlignment('A1', 'A2')).toBe('below');
  });

  it('returns above when quest is one level above', () => {
    expect(getPlayerQuestAlignment('B1', 'A2')).toBe('above');
  });

  it('returns far_above when quest is 2+ levels above', () => {
    expect(getPlayerQuestAlignment('B2', 'A1')).toBe('far_above');
  });
});

describe('isQuestRecommended', () => {
  it('recommends quests at player level', () => {
    expect(isQuestRecommended('A2', 'A2')).toBe(true);
  });

  it('recommends quests one level above', () => {
    expect(isQuestRecommended('B1', 'A2')).toBe(true);
  });

  it('recommends quests one level below', () => {
    expect(isQuestRecommended('A1', 'A2')).toBe(true);
  });

  it('does not recommend quests 2+ levels away', () => {
    expect(isQuestRecommended('B2', 'A1')).toBe(false);
  });
});

describe('getAlignmentColor', () => {
  it('returns green for at_level and below', () => {
    expect(getAlignmentColor('at_level')).toBe('green');
    expect(getAlignmentColor('below')).toBe('green');
  });

  it('returns yellow for above', () => {
    expect(getAlignmentColor('above')).toBe('yellow');
  });

  it('returns red for far_above', () => {
    expect(getAlignmentColor('far_above')).toBe('red');
  });
});

describe('cefrLevelLabel', () => {
  it('returns human-readable labels', () => {
    expect(cefrLevelLabel('A1')).toBe('A1 Beginner');
    expect(cefrLevelLabel('A2')).toBe('A2 Elementary');
    expect(cefrLevelLabel('B1')).toBe('B1 Intermediate');
    expect(cefrLevelLabel('B2')).toBe('B2 Upper-Intermediate');
  });
});
