/**
 * Tests for the Arrival Encounter pre-test definition.
 *
 * Validates structure, scoring totals, template resolution,
 * and phase/task integrity of ARRIVAL_ENCOUNTER.
 */
import { describe, it, expect } from 'vitest';
import {
  ARRIVAL_ENCOUNTER,
  resolveTemplate,
  resolveAssessment,
} from '../../shared/assessment/arrival-encounter';
import type { AssessmentDefinition, AssessmentPhase } from '../../shared/assessment/assessment-types';

describe('ARRIVAL_ENCOUNTER', () => {
  // ── Structure ───────────────────────────────────────────────────────────

  it('has the correct id and type', () => {
    expect(ARRIVAL_ENCOUNTER.id).toBe('arrival_encounter');
    expect(ARRIVAL_ENCOUNTER.type).toBe('arrival_encounter');
  });

  it('has exactly 4 phases', () => {
    expect(ARRIVAL_ENCOUNTER.phases).toHaveLength(4);
  });

  it('phases are in the correct order', () => {
    const types = ARRIVAL_ENCOUNTER.phases.map(p => p.type);
    expect(types).toEqual(['reading', 'writing', 'listening', 'conversation']);
  });

  it('all phase IDs are unique', () => {
    const ids = ARRIVAL_ENCOUNTER.phases.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all task IDs are unique across all phases', () => {
    const ids = ARRIVAL_ENCOUNTER.phases.flatMap(p => p.tasks.map(t => t.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  // ── Scoring ─────────────────────────────────────────────────────────────

  it('totalMaxPoints equals 53', () => {
    expect(ARRIVAL_ENCOUNTER.totalMaxPoints).toBe(53);
  });

  it('sum of phase maxScores equals totalMaxPoints', () => {
    const sum = ARRIVAL_ENCOUNTER.phases.reduce((acc, p) => acc + (p.maxScore ?? 0), 0);
    expect(sum).toBe(ARRIVAL_ENCOUNTER.totalMaxPoints);
  });

  it('each phase maxScore equals the sum of its task maxScores', () => {
    for (const phase of ARRIVAL_ENCOUNTER.phases) {
      const taskSum = phase.tasks.reduce((acc, t) => acc + (t.maxScore ?? 0), 0);
      expect(taskSum).toBe(phase.maxScore);
    }
  });

  // ── Per-phase point values ──────────────────────────────────────────────

  it('reading phase is 15 points', () => {
    const phase = ARRIVAL_ENCOUNTER.phases.find(p => p.type === 'reading')!;
    expect(phase.maxScore).toBe(15);
  });

  it('listening phase is 13 points', () => {
    const phase = ARRIVAL_ENCOUNTER.phases.find(p => p.type === 'listening')!;
    expect(phase.maxScore).toBe(13);
  });

  it('writing phase is 15 points', () => {
    const phase = ARRIVAL_ENCOUNTER.phases.find(p => p.type === 'writing')!;
    expect(phase.maxScore).toBe(15);
  });

  it('conversation phase is 10 points', () => {
    const phase = ARRIVAL_ENCOUNTER.phases.find(p => p.type === 'conversation')!;
    expect(phase.maxScore).toBe(10);
  });

  // ── Scoring dimensions ─────────────────────────────────────────────────

  it('reading task has 3 scoring dimensions summing to 15', () => {
    const task = ARRIVAL_ENCOUNTER.phases[0].tasks[0];
    expect(task.scoringDimensions).toBeDefined();
    expect(task.scoringDimensions).toHaveLength(3);
    const dimSum = task.scoringDimensions!.reduce((acc, d) => acc + d.maxScore, 0);
    expect(dimSum).toBe(15);
  });

  it('writing task has 3 scoring dimensions summing to 15', () => {
    const writePhase = ARRIVAL_ENCOUNTER.phases.find(p => p.type === 'writing')!;
    const writeTask = writePhase.tasks.find(t => t.id === 'arrival_writing_response')!;
    expect(writeTask.scoringDimensions).toBeDefined();
    expect(writeTask.scoringDimensions).toHaveLength(3);
    const dimSum = writeTask.scoringDimensions!.reduce((acc, d) => acc + d.maxScore, 0);
    expect(dimSum).toBe(15);
  });

  // ── Template strings ───────────────────────────────────────────────────

  it('description contains {{targetLanguage}} and {{cityName}} placeholders', () => {
    expect(ARRIVAL_ENCOUNTER.description).toContain('{{targetLanguage}}');
    expect(ARRIVAL_ENCOUNTER.description).toContain('{{cityName}}');
  });

  it('every phase description contains at least one template variable', () => {
    for (const phase of ARRIVAL_ENCOUNTER.phases) {
      const hasTemplate =
        phase.description.includes('{{targetLanguage}}') ||
        phase.description.includes('{{cityName}}');
      expect(hasTemplate).toBe(true);
    }
  });

  it('every task prompt contains at least one template variable', () => {
    for (const phase of ARRIVAL_ENCOUNTER.phases) {
      for (const task of phase.tasks) {
        const hasTemplate =
          task.prompt.includes('{{targetLanguage}}') ||
          task.prompt.includes('{{cityName}}');
        expect(hasTemplate).toBe(true);
      }
    }
  });
});

describe('resolveTemplate', () => {
  it('replaces {{targetLanguage}} and {{cityName}}', () => {
    const result = resolveTemplate(
      'Welcome to {{cityName}}! Speak {{targetLanguage}} here.',
      { targetLanguage: 'Spanish', cityName: 'Barcelona' },
    );
    expect(result).toBe('Welcome to Barcelona! Speak Spanish here.');
  });

  it('replaces multiple occurrences', () => {
    const result = resolveTemplate(
      '{{cityName}} and {{cityName}}',
      { targetLanguage: 'French', cityName: 'Paris' },
    );
    expect(result).toBe('Paris and Paris');
  });

  it('returns text unchanged if no placeholders present', () => {
    const result = resolveTemplate('No placeholders', { targetLanguage: 'Korean', cityName: 'Seoul' });
    expect(result).toBe('No placeholders');
  });
});

describe('resolveAssessment', () => {
  const vars = { targetLanguage: 'Japanese', cityName: 'Tokyo' };

  it('resolves description', () => {
    const resolved = resolveAssessment(ARRIVAL_ENCOUNTER, vars);
    expect(resolved.description).toContain('Japanese');
    expect(resolved.description).toContain('Tokyo');
    expect(resolved.description).not.toContain('{{');
  });

  it('resolves all phase descriptions', () => {
    const resolved = resolveAssessment(ARRIVAL_ENCOUNTER, vars);
    for (const phase of resolved.phases) {
      expect(phase.description).not.toContain('{{');
    }
  });

  it('resolves all task prompts', () => {
    const resolved = resolveAssessment(ARRIVAL_ENCOUNTER, vars);
    for (const phase of resolved.phases) {
      for (const task of phase.tasks) {
        expect(task.prompt).not.toContain('{{');
      }
    }
  });

  it('does not mutate the original definition', () => {
    resolveAssessment(ARRIVAL_ENCOUNTER, vars);
    expect(ARRIVAL_ENCOUNTER.description).toContain('{{targetLanguage}}');
  });

  it('preserves scoring and structure', () => {
    const resolved = resolveAssessment(ARRIVAL_ENCOUNTER, vars);
    expect(resolved.totalMaxPoints).toBe(53);
    expect(resolved.phases).toHaveLength(4);
    expect(resolved.id).toBe('arrival_encounter');
  });
});
