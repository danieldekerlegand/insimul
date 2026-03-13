/**
 * Tests for shared/assessment-types.ts
 *
 * Covers score color mapping, improvement arrows, CEFR constants,
 * and dimension definitions.
 */
import { describe, it, expect } from 'vitest';
import {
  ASSESSMENT_DIMENSIONS,
  CEFR_COLORS,
  CEFR_DESCRIPTIONS,
  DIMENSION_ICONS,
  DIMENSION_LABELS,
  getImprovementArrow,
  getImprovementColor,
  getScoreColor,
  type CEFRLevel,
  type DimensionScore,
  type PlayerAssessmentData,
} from '../assessment-types';

describe('Assessment Types', () => {
  describe('ASSESSMENT_DIMENSIONS', () => {
    it('has exactly 5 dimensions', () => {
      expect(ASSESSMENT_DIMENSIONS).toHaveLength(5);
    });

    it('contains vocabulary, grammar, pronunciation, listening, communication', () => {
      expect(ASSESSMENT_DIMENSIONS).toContain('vocabulary');
      expect(ASSESSMENT_DIMENSIONS).toContain('grammar');
      expect(ASSESSMENT_DIMENSIONS).toContain('pronunciation');
      expect(ASSESSMENT_DIMENSIONS).toContain('listening');
      expect(ASSESSMENT_DIMENSIONS).toContain('communication');
    });

    it('has labels for all dimensions', () => {
      for (const dim of ASSESSMENT_DIMENSIONS) {
        expect(DIMENSION_LABELS[dim]).toBeDefined();
        expect(typeof DIMENSION_LABELS[dim]).toBe('string');
      }
    });

    it('has icons for all dimensions', () => {
      for (const dim of ASSESSMENT_DIMENSIONS) {
        expect(DIMENSION_ICONS[dim]).toBeDefined();
      }
    });
  });

  describe('CEFR constants', () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

    it('has descriptions for all CEFR levels', () => {
      for (const level of levels) {
        expect(CEFR_DESCRIPTIONS[level]).toBeDefined();
        expect(typeof CEFR_DESCRIPTIONS[level]).toBe('string');
      }
    });

    it('has colors for all CEFR levels', () => {
      for (const level of levels) {
        expect(CEFR_COLORS[level]).toMatch(/^#[0-9a-f]{6}$/);
      }
    });
  });

  describe('getScoreColor', () => {
    it('returns red for score 1', () => {
      expect(getScoreColor(1)).toBe('#e74c3c');
    });

    it('returns orange for score 2', () => {
      expect(getScoreColor(2)).toBe('#e67e22');
    });

    it('returns yellow for score 3', () => {
      expect(getScoreColor(3)).toBe('#f1c40f');
    });

    it('returns green for score 4', () => {
      expect(getScoreColor(4)).toBe('#2ecc71');
    });

    it('returns dark green for score 5', () => {
      expect(getScoreColor(5)).toBe('#27ae60');
    });
  });

  describe('getImprovementArrow', () => {
    it('returns up arrow when score improved', () => {
      expect(getImprovementArrow(4, 3)).toBe('▲');
    });

    it('returns down arrow when score decreased', () => {
      expect(getImprovementArrow(2, 4)).toBe('▼');
    });

    it('returns right arrow when score unchanged', () => {
      expect(getImprovementArrow(3, 3)).toBe('▸');
    });

    it('returns empty string when no previous score', () => {
      expect(getImprovementArrow(3, undefined)).toBe('');
    });
  });

  describe('getImprovementColor', () => {
    it('returns green for improvement', () => {
      expect(getImprovementColor(4, 3)).toBe('#2ecc71');
    });

    it('returns red for decrease', () => {
      expect(getImprovementColor(2, 4)).toBe('#e74c3c');
    });

    it('returns gray for no change', () => {
      expect(getImprovementColor(3, 3)).toContain('rgba');
    });

    it('returns gray for no previous', () => {
      expect(getImprovementColor(3, undefined)).toContain('rgba');
    });
  });

  describe('PlayerAssessmentData type', () => {
    it('can construct a valid PlayerAssessmentData object', () => {
      const data: PlayerAssessmentData = {
        cefrLevel: 'B1',
        dimensionScores: [
          { dimension: 'vocabulary', score: 4, previousScore: 3 },
          { dimension: 'grammar', score: 3 },
          { dimension: 'pronunciation', score: 2, previousScore: 2 },
          { dimension: 'listening', score: 4, previousScore: 5 },
          { dimension: 'communication', score: 3, previousScore: 1 },
        ],
        assessedAt: Date.now(),
        nextAssessmentLevel: 10,
      };

      expect(data.cefrLevel).toBe('B1');
      expect(data.dimensionScores).toHaveLength(5);
      expect(data.nextAssessmentLevel).toBe(10);
    });

    it('allows optional previousScore on DimensionScore', () => {
      const score: DimensionScore = {
        dimension: 'vocabulary',
        score: 3,
      };
      expect(score.previousScore).toBeUndefined();
    });
  });
});
