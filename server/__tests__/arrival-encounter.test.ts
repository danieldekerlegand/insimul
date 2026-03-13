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
  type AssessmentDefinition,
  type AssessmentPhase,
} from '../../shared/assessment/arrival-encounter';

describe('ARRIVAL_ENCOUNTER', () => {
  // ── Structure ───────────────────────────────────────────────────────────

  it('has the correct id and testPhase', () => {
    expect(ARRIVAL_ENCOUNTER.id).toBe('arrival_encounter');
    expect(ARRIVAL_ENCOUNTER.testPhase).toBe('pre');
  });

  it('has exactly 4 phases', () => {
    expect(ARRIVAL_ENCOUNTER.phases).toHaveLength(4);
  });

  it('phases are in the correct order', () => {
    const types = ARRIVAL_ENCOUNTER.phases.map(p => p.type);
    expect(types).toEqual(['conversational', 'listening', 'writing', 'visual']);
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

  it('totalMaxScore equals 53', () => {
    expect(ARRIVAL_ENCOUNTER.totalMaxScore).toBe(53);
  });

  it('sum of phase maxScores equals totalMaxScore', () => {
    const sum = ARRIVAL_ENCOUNTER.phases.reduce((acc, p) => acc + p.maxScore, 0);
    expect(sum).toBe(ARRIVAL_ENCOUNTER.totalMaxScore);
  });

  it('each phase maxScore equals the sum of its task maxScores', () => {
    for (const phase of ARRIVAL_ENCOUNTER.phases) {
      const taskSum = phase.tasks.reduce((acc, t) => acc + t.maxScore, 0);
      expect(taskSum).toBe(phase.maxScore);
    }
  });

  // ── Per-phase point values ──────────────────────────────────────────────

  it('conversational phase is 25 points', () => {
    const phase = ARRIVAL_ENCOUNTER.phases.find(p => p.type === 'conversational')!;
    expect(phase.maxScore).toBe(25);
  });

  it('listening phase is 7 points', () => {
    const phase = ARRIVAL_ENCOUNTER.phases.find(p => p.type === 'listening')!;
    expect(phase.maxScore).toBe(7);
  });

  it('writing phase is 11 points', () => {
    const phase = ARRIVAL_ENCOUNTER.phases.find(p => p.type === 'writing')!;
    expect(phase.maxScore).toBe(11);
  });

  it('visual phase is 10 points', () => {
    const phase = ARRIVAL_ENCOUNTER.phases.find(p => p.type === 'visual')!;
    expect(phase.maxScore).toBe(10);
  });

  // ── Scoring dimensions ─────────────────────────────────────────────────

  it('conversational task has 5 scoring dimensions summing to 25', () => {
    const task = ARRIVAL_ENCOUNTER.phases[0].tasks[0];
    expect(task.scoringDimensions).toBeDefined();
    expect(task.scoringDimensions).toHaveLength(5);
    const dimSum = task.scoringDimensions!.reduce((acc, d) => acc + d.maxScore, 0);
    expect(dimSum).toBe(25);
  });

  it('writing message task has 3 scoring dimensions summing to 6', () => {
    const writePhase = ARRIVAL_ENCOUNTER.phases.find(p => p.type === 'writing')!;
    const msgTask = writePhase.tasks.find(t => t.id === 'arrival_write_message')!;
    expect(msgTask.scoringDimensions).toBeDefined();
    expect(msgTask.scoringDimensions).toHaveLength(3);
    const dimSum = msgTask.scoringDimensions!.reduce((acc, d) => acc + d.maxScore, 0);
    expect(dimSum).toBe(6);
  });

  // ── Template strings ───────────────────────────────────────────────────

  it('description contains {{targetLanguage}} and {{cityName}} placeholders', () => {
    expect(ARRIVAL_ENCOUNTER.description).toContain('{{targetLanguage}}');
    expect(ARRIVAL_ENCOUNTER.description).toContain('{{cityName}}');
  });

  it('every phase instruction contains at least one template variable', () => {
    for (const phase of ARRIVAL_ENCOUNTER.phases) {
      const hasTemplate =
        phase.instructions.includes('{{targetLanguage}}') ||
        phase.instructions.includes('{{cityName}}');
      expect(hasTemplate).toBe(true);
    }
  });

  it('every task instruction contains at least one template variable', () => {
    for (const phase of ARRIVAL_ENCOUNTER.phases) {
      for (const task of phase.tasks) {
        const hasTemplate =
          task.instructions.includes('{{targetLanguage}}') ||
          task.instructions.includes('{{cityName}}');
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

  it('resolves all phase instructions', () => {
    const resolved = resolveAssessment(ARRIVAL_ENCOUNTER, vars);
    for (const phase of resolved.phases) {
      expect(phase.instructions).not.toContain('{{');
    }
  });

  it('resolves all task instructions', () => {
    const resolved = resolveAssessment(ARRIVAL_ENCOUNTER, vars);
    for (const phase of resolved.phases) {
      for (const task of phase.tasks) {
        expect(task.instructions).not.toContain('{{');
      }
    }
  });

  it('does not mutate the original definition', () => {
    resolveAssessment(ARRIVAL_ENCOUNTER, vars);
    expect(ARRIVAL_ENCOUNTER.description).toContain('{{targetLanguage}}');
  });

  it('preserves scoring and structure', () => {
    const resolved = resolveAssessment(ARRIVAL_ENCOUNTER, vars);
    expect(resolved.totalMaxScore).toBe(53);
    expect(resolved.phases).toHaveLength(4);
    expect(resolved.id).toBe('arrival_encounter');
  });
});
