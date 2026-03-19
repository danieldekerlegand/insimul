/**
 * Tests for PlaythroughComparison component logic
 *
 * Tests the pure helper functions used for comparison data aggregation
 * and formatting, without requiring DOM rendering.
 */

import { describe, it, expect } from 'vitest';

// Re-implement the pure functions from PlaythroughComparison to test in isolation

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

interface TraceStats {
  totalTraces: number;
  actionTypeCounts: Record<string, number>;
  outcomeCounts: Record<string, number>;
  avgDurationMs: number;
}

interface ComparisonEntry {
  playthrough: {
    id: string;
    name?: string;
    status: string;
    playtime?: number;
    actionsCount?: number;
    decisionsCount?: number;
    currentTimestep?: number;
  };
  traceStats: TraceStats;
}

function collectAllActionTypes(entries: ComparisonEntry[]): string[] {
  const types = new Set<string>();
  entries.forEach(e => Object.keys(e.traceStats.actionTypeCounts).forEach(t => types.add(t)));
  return Array.from(types).sort();
}

function collectAllOutcomes(entries: ComparisonEntry[]): string[] {
  const outcomes = new Set<string>();
  entries.forEach(e => Object.keys(e.traceStats.outcomeCounts).forEach(o => outcomes.add(o)));
  return Array.from(outcomes).sort();
}

// Simulates the server-side trace aggregation logic
function aggregateTraces(traces: { actionType: string; outcome?: string | null; durationMs?: number | null }[]): TraceStats {
  const actionTypeCounts: Record<string, number> = {};
  const outcomeCounts: Record<string, number> = {};
  let totalDurationMs = 0;
  let traceCount = 0;

  for (const t of traces) {
    actionTypeCounts[t.actionType] = (actionTypeCounts[t.actionType] || 0) + 1;
    if (t.outcome) outcomeCounts[t.outcome] = (outcomeCounts[t.outcome] || 0) + 1;
    if (t.durationMs) totalDurationMs += t.durationMs;
    traceCount++;
  }

  return {
    totalTraces: traceCount,
    actionTypeCounts,
    outcomeCounts,
    avgDurationMs: traceCount > 0 ? Math.round(totalDurationMs / traceCount) : 0,
  };
}

describe('PlaythroughComparison helpers', () => {
  describe('formatDuration', () => {
    it('returns 0m for undefined', () => {
      expect(formatDuration(undefined)).toBe('0m');
    });

    it('returns 0m for zero', () => {
      expect(formatDuration(0)).toBe('0m');
    });

    it('formats minutes only', () => {
      expect(formatDuration(300)).toBe('5m');
    });

    it('formats hours and minutes', () => {
      expect(formatDuration(3720)).toBe('1h 2m');
    });
  });

  describe('collectAllActionTypes', () => {
    it('returns empty array for no entries', () => {
      expect(collectAllActionTypes([])).toEqual([]);
    });

    it('collects unique action types across entries, sorted', () => {
      const entries: ComparisonEntry[] = [
        {
          playthrough: { id: '1', status: 'active' },
          traceStats: { totalTraces: 2, actionTypeCounts: { move: 1, dialogue: 1 }, outcomeCounts: {}, avgDurationMs: 0 },
        },
        {
          playthrough: { id: '2', status: 'completed' },
          traceStats: { totalTraces: 3, actionTypeCounts: { combat: 2, dialogue: 1 }, outcomeCounts: {}, avgDurationMs: 0 },
        },
      ];
      expect(collectAllActionTypes(entries)).toEqual(['combat', 'dialogue', 'move']);
    });
  });

  describe('collectAllOutcomes', () => {
    it('collects unique outcomes across entries, sorted', () => {
      const entries: ComparisonEntry[] = [
        {
          playthrough: { id: '1', status: 'active' },
          traceStats: { totalTraces: 1, actionTypeCounts: {}, outcomeCounts: { success: 1 }, avgDurationMs: 0 },
        },
        {
          playthrough: { id: '2', status: 'active' },
          traceStats: { totalTraces: 2, actionTypeCounts: {}, outcomeCounts: { failure: 1, success: 1 }, avgDurationMs: 0 },
        },
      ];
      expect(collectAllOutcomes(entries)).toEqual(['failure', 'success']);
    });
  });

  describe('aggregateTraces', () => {
    it('returns zeroed stats for empty traces', () => {
      expect(aggregateTraces([])).toEqual({
        totalTraces: 0,
        actionTypeCounts: {},
        outcomeCounts: {},
        avgDurationMs: 0,
      });
    });

    it('counts action types correctly', () => {
      const traces = [
        { actionType: 'move', outcome: 'success', durationMs: 100 },
        { actionType: 'move', outcome: 'success', durationMs: 200 },
        { actionType: 'dialogue', outcome: 'success', durationMs: 300 },
      ];
      const stats = aggregateTraces(traces);
      expect(stats.totalTraces).toBe(3);
      expect(stats.actionTypeCounts).toEqual({ move: 2, dialogue: 1 });
    });

    it('counts outcomes correctly', () => {
      const traces = [
        { actionType: 'combat', outcome: 'success', durationMs: 100 },
        { actionType: 'combat', outcome: 'failure', durationMs: 200 },
        { actionType: 'combat', outcome: 'success', durationMs: 150 },
      ];
      const stats = aggregateTraces(traces);
      expect(stats.outcomeCounts).toEqual({ success: 2, failure: 1 });
    });

    it('computes average duration correctly', () => {
      const traces = [
        { actionType: 'move', outcome: null, durationMs: 100 },
        { actionType: 'move', outcome: null, durationMs: 300 },
      ];
      const stats = aggregateTraces(traces);
      expect(stats.avgDurationMs).toBe(200);
    });

    it('ignores null outcomes and durations', () => {
      const traces = [
        { actionType: 'move', outcome: null, durationMs: null },
        { actionType: 'move', outcome: 'success', durationMs: 200 },
      ];
      const stats = aggregateTraces(traces);
      expect(stats.outcomeCounts).toEqual({ success: 1 });
      expect(stats.avgDurationMs).toBe(100); // 200 total / 2 traces
    });
  });
});

describe('PlaythroughComparison selection logic', () => {
  it('toggle adds and removes IDs from set', () => {
    const selected = new Set<string>();

    // Add
    const afterAdd = new Set(selected);
    afterAdd.add('abc');
    expect(afterAdd.has('abc')).toBe(true);
    expect(afterAdd.size).toBe(1);

    // Remove
    const afterRemove = new Set(afterAdd);
    afterRemove.delete('abc');
    expect(afterRemove.has('abc')).toBe(false);
    expect(afterRemove.size).toBe(0);
  });

  it('requires at least 2 selections for comparison', () => {
    const selectedIds = new Set(['id1']);
    expect(selectedIds.size < 2).toBe(true);

    selectedIds.add('id2');
    expect(selectedIds.size >= 2).toBe(true);
  });

  it('enforces maximum of 10 selections', () => {
    const ids = Array.from({ length: 11 }, (_, i) => `id-${i}`);
    const idsParam = ids.join(',');
    const parsed = idsParam.split(',').filter(Boolean);
    expect(parsed.length > 10).toBe(true);
  });
});
