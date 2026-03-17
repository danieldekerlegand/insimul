/**
 * Tests for the Departure Encounter post-test definition.
 *
 * Validates structure, scoring totals, template resolution,
 * and phase/task integrity of DEPARTURE_ENCOUNTER.
 */
import { describe, it, expect } from 'vitest';
import {
  DEPARTURE_ENCOUNTER,
  resolveTemplate,
  resolveAssessment,
} from '../../shared/assessment/departure-encounter';

describe('DEPARTURE_ENCOUNTER', () => {
  // ── Structure ───────────────────────────────────────────────────────────

  it('has the correct id and type', () => {
    expect(DEPARTURE_ENCOUNTER.id).toBe('departure_encounter');
    expect(DEPARTURE_ENCOUNTER.type).toBe('departure_encounter');
  });

  it('has exactly 4 phases', () => {
    expect(DEPARTURE_ENCOUNTER.phases).toHaveLength(4);
  });

  it('phases are in the correct order', () => {
    const types = DEPARTURE_ENCOUNTER.phases.map(p => p.type);
    expect(types).toEqual(['reading', 'writing', 'listening', 'conversation']);
  });

  it('all phase IDs are unique', () => {
    const ids = DEPARTURE_ENCOUNTER.phases.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all task IDs are unique across all phases', () => {
    const ids = DEPARTURE_ENCOUNTER.phases.flatMap(p => p.tasks.map(t => t.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all phase IDs start with departure_', () => {
    for (const phase of DEPARTURE_ENCOUNTER.phases) {
      expect(phase.id).toMatch(/^departure_/);
    }
  });

  it('all task IDs start with departure_', () => {
    const ids = DEPARTURE_ENCOUNTER.phases.flatMap(p => p.tasks.map(t => t.id));
    for (const id of ids) {
      expect(id).toMatch(/^departure_/);
    }
  });

  // ── Scoring ─────────────────────────────────────────────────────────────

  it('totalMaxPoints equals 53', () => {
    expect(DEPARTURE_ENCOUNTER.totalMaxPoints).toBe(53);
  });

  it('sum of phase maxScores equals totalMaxPoints', () => {
    const sum = DEPARTURE_ENCOUNTER.phases.reduce((acc, p) => acc + (p.maxScore ?? 0), 0);
    expect(sum).toBe(DEPARTURE_ENCOUNTER.totalMaxPoints);
  });

  it('each phase maxScore equals the sum of its task maxScores', () => {
    for (const phase of DEPARTURE_ENCOUNTER.phases) {
      const taskSum = phase.tasks.reduce((acc, t) => acc + (t.maxScore ?? 0), 0);
      expect(taskSum).toBe(phase.maxScore);
    }
  });

  // ── Per-phase point values ──────────────────────────────────────────────

  it('reading phase is 15 points', () => {
    const phase = DEPARTURE_ENCOUNTER.phases.find(p => p.type === 'reading')!;
    expect(phase.maxScore).toBe(15);
  });

  it('listening phase is 13 points', () => {
    const phase = DEPARTURE_ENCOUNTER.phases.find(p => p.type === 'listening')!;
    expect(phase.maxScore).toBe(13);
  });

  it('writing phase is 15 points', () => {
    const phase = DEPARTURE_ENCOUNTER.phases.find(p => p.type === 'writing')!;
    expect(phase.maxScore).toBe(15);
  });

  it('conversation phase is 10 points', () => {
    const phase = DEPARTURE_ENCOUNTER.phases.find(p => p.type === 'conversation')!;
    expect(phase.maxScore).toBe(10);
  });

  // ── Scoring dimensions ─────────────────────────────────────────────────

  it('reading task has 3 scoring dimensions summing to 15', () => {
    const task = DEPARTURE_ENCOUNTER.phases[0].tasks[0];
    expect(task.scoringDimensions).toBeDefined();
    expect(task.scoringDimensions).toHaveLength(3);
    const dimSum = task.scoringDimensions!.reduce((acc, d) => acc + d.maxScore, 0);
    expect(dimSum).toBe(15);
  });

  it('writing task has 3 scoring dimensions summing to 15', () => {
    const writePhase = DEPARTURE_ENCOUNTER.phases.find(p => p.type === 'writing')!;
    const writeTask = writePhase.tasks.find(t => t.id === 'departure_writing_response')!;
    expect(writeTask.scoringDimensions).toBeDefined();
    expect(writeTask.scoringDimensions).toHaveLength(3);
    const dimSum = writeTask.scoringDimensions!.reduce((acc, d) => acc + d.maxScore, 0);
    expect(dimSum).toBe(15);
  });

  // ── Template strings ───────────────────────────────────────────────────

  it('description contains {{targetLanguage}} and {{cityName}} placeholders', () => {
    expect(DEPARTURE_ENCOUNTER.description).toContain('{{targetLanguage}}');
    expect(DEPARTURE_ENCOUNTER.description).toContain('{{cityName}}');
  });

  it('every phase description contains at least one template variable', () => {
    for (const phase of DEPARTURE_ENCOUNTER.phases) {
      const hasTemplate =
        phase.description.includes('{{targetLanguage}}') ||
        phase.description.includes('{{cityName}}');
      expect(hasTemplate).toBe(true);
    }
  });

  it('every task prompt contains at least one template variable', () => {
    for (const phase of DEPARTURE_ENCOUNTER.phases) {
      for (const task of phase.tasks) {
        const hasTemplate =
          task.prompt.includes('{{targetLanguage}}') ||
          task.prompt.includes('{{cityName}}');
        expect(hasTemplate).toBe(true);
      }
    }
  });

  // ── Parallel structure with Arrival ─────────────────────────────────────

  it('has the same phase types and point distribution as arrival', () => {
    // Departure must mirror arrival: reading=15, writing=15, listening=13, conversation=10
    const expected = [
      { type: 'reading', maxScore: 15 },
      { type: 'writing', maxScore: 15 },
      { type: 'listening', maxScore: 13 },
      { type: 'conversation', maxScore: 10 },
    ];
    const actual = DEPARTURE_ENCOUNTER.phases.map(p => ({ type: p.type, maxScore: p.maxScore }));
    expect(actual).toEqual(expected);
  });

  it('has the same task count per phase as arrival', () => {
    // Arrival: reading=1, writing=1, listening=1, conversation=1
    const expected = [1, 1, 1, 1];
    const actual = DEPARTURE_ENCOUNTER.phases.map(p => p.tasks.length);
    expect(actual).toEqual(expected);
  });
});

describe('resolveAssessment with DEPARTURE_ENCOUNTER', () => {
  const vars = { targetLanguage: 'French', cityName: 'Lyon' };

  it('resolves description', () => {
    const resolved = resolveAssessment(DEPARTURE_ENCOUNTER, vars);
    expect(resolved.description).toContain('French');
    expect(resolved.description).toContain('Lyon');
    expect(resolved.description).not.toContain('{{');
  });

  it('resolves all phase descriptions', () => {
    const resolved = resolveAssessment(DEPARTURE_ENCOUNTER, vars);
    for (const phase of resolved.phases) {
      expect(phase.description).not.toContain('{{');
    }
  });

  it('resolves all task prompts', () => {
    const resolved = resolveAssessment(DEPARTURE_ENCOUNTER, vars);
    for (const phase of resolved.phases) {
      for (const task of phase.tasks) {
        expect(task.prompt).not.toContain('{{');
      }
    }
  });

  it('does not mutate the original definition', () => {
    resolveAssessment(DEPARTURE_ENCOUNTER, vars);
    expect(DEPARTURE_ENCOUNTER.description).toContain('{{targetLanguage}}');
  });

  it('preserves scoring and structure', () => {
    const resolved = resolveAssessment(DEPARTURE_ENCOUNTER, vars);
    expect(resolved.totalMaxPoints).toBe(53);
    expect(resolved.phases).toHaveLength(4);
    expect(resolved.id).toBe('departure_encounter');
  });
});
