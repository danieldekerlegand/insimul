/**
 * Assessment Types for Player-Facing RPG Progress Panel
 *
 * Defines the 5 assessment dimensions, CEFR levels,
 * and data shapes consumed by PlayerAssessmentPanel.
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const CEFR_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
};

export const CEFR_COLORS: Record<CEFRLevel, string> = {
  A1: '#e74c3c',
  A2: '#e67e22',
  B1: '#f1c40f',
  B2: '#2ecc71',
  C1: '#3498db',
  C2: '#9b59b6',
};

export const ASSESSMENT_DIMENSIONS = [
  'vocabulary',
  'grammar',
  'pronunciation',
  'listening',
  'communication',
] as const;

export type AssessmentDimension = (typeof ASSESSMENT_DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<AssessmentDimension, string> = {
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  pronunciation: 'Pronunciation',
  listening: 'Listening',
  communication: 'Communication',
};

export const DIMENSION_ICONS: Record<AssessmentDimension, string> = {
  vocabulary: '📖',
  grammar: '📝',
  pronunciation: '🗣️',
  listening: '👂',
  communication: '💬',
};

/** Score 1-5 for a single dimension */
export interface DimensionScore {
  dimension: AssessmentDimension;
  score: number; // 1-5
  previousScore?: number; // 1-5, from last assessment
}

/** Full assessment snapshot for the panel */
export interface PlayerAssessmentData {
  cefrLevel: CEFRLevel;
  dimensionScores: DimensionScore[];
  assessedAt: number; // timestamp
  nextAssessmentLevel?: number; // player level that triggers next assessment
}

/** Score color mapping (1-5 scale) */
export function getScoreColor(score: number): string {
  if (score <= 1) return '#e74c3c';
  if (score <= 2) return '#e67e22';
  if (score <= 3) return '#f1c40f';
  if (score <= 4) return '#2ecc71';
  return '#27ae60';
}

/** Improvement arrow character */
export function getImprovementArrow(current: number, previous?: number): string {
  if (previous === undefined) return '';
  if (current > previous) return '▲';
  if (current < previous) return '▼';
  return '▸';
}

/** Improvement arrow color */
export function getImprovementColor(current: number, previous?: number): string {
  if (previous === undefined) return 'rgba(150,150,150,0.6)';
  if (current > previous) return '#2ecc71';
  if (current < previous) return '#e74c3c';
  return 'rgba(200,200,200,0.6)';
}
