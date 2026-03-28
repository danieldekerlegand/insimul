import { describe, it, expect, beforeEach } from 'vitest';
import {
  CEFRLevelSelector,
  buildCEFROptions,
} from '../game-engine/rendering/CEFRLevelSelector';

describe('buildCEFROptions', () => {
  it('returns 4 CEFR level options', () => {
    const options = buildCEFROptions('French');
    expect(options).toHaveLength(4);
  });

  it('includes all CEFR levels A1-B2', () => {
    const options = buildCEFROptions('French');
    const levels = options.map(o => o.level);
    expect(levels).toEqual(['A1', 'A2', 'B1', 'B2']);
  });

  it('includes target language in descriptions', () => {
    const options = buildCEFROptions('Spanish');
    for (const option of options) {
      expect(option.description).toContain('Spanish');
    }
  });

  it('has labels for each option', () => {
    const options = buildCEFROptions('French');
    for (const option of options) {
      expect(option.label.length).toBeGreaterThan(0);
    }
  });
});

describe('CEFRLevelSelector', () => {
  let selector: CEFRLevelSelector;

  beforeEach(() => {
    selector = new CEFRLevelSelector('French');
  });

  it('shouldShowSelector returns true initially', () => {
    expect(selector.shouldShowSelector()).toBe(true);
  });

  it('getOptions returns CEFR options', () => {
    const options = selector.getOptions();
    expect(options).toHaveLength(4);
  });

  it('selectPlacementTest records take_test choice', () => {
    const result = selector.selectPlacementTest();
    expect(result.choice).toBe('take_test');
    expect(result.selectedLevel).toBeUndefined();
  });

  it('selectPlacementTest marks selector as shown', () => {
    selector.selectPlacementTest();
    expect(selector.shouldShowSelector()).toBe(false);
  });

  it('selectLevel records select_level choice with level', () => {
    const result = selector.selectLevel('B1');
    expect(result.choice).toBe('select_level');
    expect(result.selectedLevel).toBe('B1');
  });

  it('selectLevel marks selector as shown', () => {
    selector.selectLevel('A2');
    expect(selector.shouldShowSelector()).toBe(false);
  });

  it('didSkipAssessment returns true for select_level', () => {
    selector.selectLevel('A1');
    expect(selector.didSkipAssessment()).toBe(true);
  });

  it('didSkipAssessment returns false for take_test', () => {
    selector.selectPlacementTest();
    expect(selector.didSkipAssessment()).toBe(false);
  });

  it('getSelectedLevel returns the chosen level', () => {
    selector.selectLevel('B2');
    expect(selector.getSelectedLevel()).toBe('B2');
  });

  it('getSelectedLevel returns undefined for placement test', () => {
    selector.selectPlacementTest();
    expect(selector.getSelectedLevel()).toBeUndefined();
  });

  it('getResult returns undefined before selection', () => {
    expect(selector.getResult()).toBeUndefined();
  });

  describe('levelToScores', () => {
    it('returns valid scores for each level', () => {
      const levels = ['A1', 'A2', 'B1', 'B2'] as const;
      for (const level of levels) {
        const scores = CEFRLevelSelector.levelToScores(level);
        expect(scores.totalScore).toBeGreaterThan(0);
        expect(scores.totalMaxScore).toBe(53);
        expect(scores.totalScore).toBeLessThanOrEqual(scores.totalMaxScore);
      }
    });

    it('scores increase with level', () => {
      const a1 = CEFRLevelSelector.levelToScores('A1');
      const a2 = CEFRLevelSelector.levelToScores('A2');
      const b1 = CEFRLevelSelector.levelToScores('B1');
      const b2 = CEFRLevelSelector.levelToScores('B2');
      expect(a1.totalScore).toBeLessThan(a2.totalScore);
      expect(a2.totalScore).toBeLessThan(b1.totalScore);
      expect(b1.totalScore).toBeLessThan(b2.totalScore);
    });
  });

  describe('state persistence', () => {
    it('getState returns current state', () => {
      selector.selectLevel('B1');
      const state = selector.getState();
      expect(state.selectorShown).toBe(true);
      expect(state.result?.choice).toBe('select_level');
      expect(state.result?.selectedLevel).toBe('B1');
    });

    it('restoreState restores prior selection', () => {
      const newSelector = new CEFRLevelSelector('French');
      newSelector.restoreState({
        selectorShown: true,
        result: { choice: 'select_level', selectedLevel: 'A2' },
      });
      expect(newSelector.shouldShowSelector()).toBe(false);
      expect(newSelector.getSelectedLevel()).toBe('A2');
      expect(newSelector.didSkipAssessment()).toBe(true);
    });

    it('restoreState handles empty state', () => {
      selector.restoreState({});
      expect(selector.shouldShowSelector()).toBe(true);
    });
  });

  describe('resetForRetake', () => {
    it('resets selector to allow retaking assessment', () => {
      selector.selectLevel('A1');
      expect(selector.shouldShowSelector()).toBe(false);

      selector.resetForRetake();
      expect(selector.shouldShowSelector()).toBe(true);
      expect(selector.getResult()).toBeUndefined();
      expect(selector.getSelectedLevel()).toBeUndefined();
    });
  });
});
