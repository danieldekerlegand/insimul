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

  it('has the correct id and testPhase', () => {
    expect(DEPARTURE_ENCOUNTER.id).toBe('departure_encounter');
    expect(DEPARTURE_ENCOUNTER.testPhase).toBe('post');
  });

  it('has exactly 4 phases', () => {
    expect(DEPARTURE_ENCOUNTER.phases).toHaveLength(4);
  });

  it('phases are in the correct order', () => {
    const types = DEPARTURE_ENCOUNTER.phases.map(p => p.type);
    expect(types).toEqual(['conversational', 'listening', 'writing', 'visual']);
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

  it('totalMaxScore equals 53', () => {
    expect(DEPARTURE_ENCOUNTER.totalMaxScore).toBe(53);
  });

  it('sum of phase maxScores equals totalMaxScore', () => {
    const sum = DEPARTURE_ENCOUNTER.phases.reduce((acc, p) => acc + p.maxScore, 0);
    expect(sum).toBe(DEPARTURE_ENCOUNTER.totalMaxScore);
  });

  it('each phase maxScore equals the sum of its task maxScores', () => {
    for (const phase of DEPARTURE_ENCOUNTER.phases) {
      const taskSum = phase.tasks.reduce((acc, t) => acc + t.maxScore, 0);
      expect(taskSum).toBe(phase.maxScore);
    }
  });

  // ── Per-phase point values ──────────────────────────────────────────────

  it('conversational phase is 25 points', () => {
    const phase = DEPARTURE_ENCOUNTER.phases.find(p => p.type === 'conversational')!;
    expect(phase.maxScore).toBe(25);
  });

  it('listening phase is 7 points', () => {
    const phase = DEPARTURE_ENCOUNTER.phases.find(p => p.type === 'listening')!;
    expect(phase.maxScore).toBe(7);
  });

  it('writing phase is 11 points', () => {
    const phase = DEPARTURE_ENCOUNTER.phases.find(p => p.type === 'writing')!;
    expect(phase.maxScore).toBe(11);
  });

  it('visual phase is 10 points', () => {
    const phase = DEPARTURE_ENCOUNTER.phases.find(p => p.type === 'visual')!;
    expect(phase.maxScore).toBe(10);
  });

  // ── Scoring dimensions ─────────────────────────────────────────────────

  it('conversational task has 5 scoring dimensions summing to 25', () => {
    const task = DEPARTURE_ENCOUNTER.phases[0].tasks[0];
    expect(task.scoringDimensions).toBeDefined();
    expect(task.scoringDimensions).toHaveLength(5);
    const dimSum = task.scoringDimensions!.reduce((acc, d) => acc + d.maxScore, 0);
    expect(dimSum).toBe(25);
  });

  it('writing postcard task has 3 scoring dimensions summing to 6', () => {
    const writePhase = DEPARTURE_ENCOUNTER.phases.find(p => p.type === 'writing')!;
    const postcardTask = writePhase.tasks.find(t => t.id === 'departure_write_postcard')!;
    expect(postcardTask.scoringDimensions).toBeDefined();
    expect(postcardTask.scoringDimensions).toHaveLength(3);
    const dimSum = postcardTask.scoringDimensions!.reduce((acc, d) => acc + d.maxScore, 0);
    expect(dimSum).toBe(6);
  });

  // ── Template strings ───────────────────────────────────────────────────

  it('description contains {{targetLanguage}} and {{cityName}} placeholders', () => {
    expect(DEPARTURE_ENCOUNTER.description).toContain('{{targetLanguage}}');
    expect(DEPARTURE_ENCOUNTER.description).toContain('{{cityName}}');
  });

  it('every phase instruction contains at least one template variable', () => {
    for (const phase of DEPARTURE_ENCOUNTER.phases) {
      const hasTemplate =
        phase.instructions.includes('{{targetLanguage}}') ||
        phase.instructions.includes('{{cityName}}');
      expect(hasTemplate).toBe(true);
    }
  });

  it('every task instruction contains at least one template variable', () => {
    for (const phase of DEPARTURE_ENCOUNTER.phases) {
      for (const task of phase.tasks) {
        const hasTemplate =
          task.instructions.includes('{{targetLanguage}}') ||
          task.instructions.includes('{{cityName}}');
        expect(hasTemplate).toBe(true);
      }
    }
  });

  // ── Parallel structure with Arrival ─────────────────────────────────────

  it('has the same phase types and point distribution as arrival', () => {
    // Departure must mirror arrival: conversational=25, listening=7, writing=11, visual=10
    const expected = [
      { type: 'conversational', maxScore: 25 },
      { type: 'listening', maxScore: 7 },
      { type: 'writing', maxScore: 11 },
      { type: 'visual', maxScore: 10 },
    ];
    const actual = DEPARTURE_ENCOUNTER.phases.map(p => ({ type: p.type, maxScore: p.maxScore }));
    expect(actual).toEqual(expected);
  });

  it('has the same task count per phase as arrival', () => {
    // Arrival: conv=1, listening=2, writing=2, visual=2
    const expected = [1, 2, 2, 2];
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

  it('resolves all phase instructions', () => {
    const resolved = resolveAssessment(DEPARTURE_ENCOUNTER, vars);
    for (const phase of resolved.phases) {
      expect(phase.instructions).not.toContain('{{');
    }
  });

  it('resolves all task instructions', () => {
    const resolved = resolveAssessment(DEPARTURE_ENCOUNTER, vars);
    for (const phase of resolved.phases) {
      for (const task of phase.tasks) {
        expect(task.instructions).not.toContain('{{');
      }
    }
  });

  it('does not mutate the original definition', () => {
    resolveAssessment(DEPARTURE_ENCOUNTER, vars);
    expect(DEPARTURE_ENCOUNTER.description).toContain('{{targetLanguage}}');
  });

  it('preserves scoring and structure', () => {
    const resolved = resolveAssessment(DEPARTURE_ENCOUNTER, vars);
    expect(resolved.totalMaxScore).toBe(53);
    expect(resolved.phases).toHaveLength(4);
    expect(resolved.id).toBe('departure_encounter');
  });
});
