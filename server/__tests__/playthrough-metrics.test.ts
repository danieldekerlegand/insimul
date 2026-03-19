import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isDecisionAction, getMetricsSnapshot } from '../services/playthrough-metrics.js';

// Mock storage for accumulateMetrics tests
vi.mock('../db/storage', () => {
  let mockPlaythrough: Record<string, any> | null = null;

  return {
    storage: {
      getPlaythrough: vi.fn(async () => mockPlaythrough),
      updatePlaythrough: vi.fn(async (_id: string, updates: Record<string, any>) => {
        if (!mockPlaythrough) return undefined;
        mockPlaythrough = { ...mockPlaythrough, ...updates };
        return mockPlaythrough;
      }),
      __setMockPlaythrough: (pt: Record<string, any> | null) => {
        mockPlaythrough = pt;
      },
    },
  };
});

// Import after mock setup
const { accumulateMetrics } = await import('../services/playthrough-metrics.js');
const { storage } = await import('../db/storage.js');

describe('isDecisionAction', () => {
  it('returns true for decision action types', () => {
    expect(isDecisionAction('dialogue_choice')).toBe(true);
    expect(isDecisionAction('quest_accept')).toBe(true);
    expect(isDecisionAction('quest_reject')).toBe(true);
    expect(isDecisionAction('quest_abandon')).toBe(true);
    expect(isDecisionAction('quest_complete')).toBe(true);
    expect(isDecisionAction('faction_join')).toBe(true);
    expect(isDecisionAction('faction_leave')).toBe(true);
    expect(isDecisionAction('moral_choice')).toBe(true);
    expect(isDecisionAction('trade')).toBe(true);
    expect(isDecisionAction('gift')).toBe(true);
    expect(isDecisionAction('combat_initiate')).toBe(true);
    expect(isDecisionAction('relationship_change')).toBe(true);
    expect(isDecisionAction('language_choice')).toBe(true);
  });

  it('returns false for non-decision action types', () => {
    expect(isDecisionAction('move')).toBe(false);
    expect(isDecisionAction('interact')).toBe(false);
    expect(isDecisionAction('dialogue')).toBe(false);
    expect(isDecisionAction('')).toBe(false);
    expect(isDecisionAction('unknown_type')).toBe(false);
  });
});

describe('getMetricsSnapshot', () => {
  it('returns default values for empty playthrough', () => {
    const snapshot = getMetricsSnapshot({});
    expect(snapshot).toEqual({
      playtime: 0,
      actionsCount: 0,
      decisionsCount: 0,
      startedAt: null,
      lastPlayedAt: null,
    });
  });

  it('returns actual values from playthrough', () => {
    const now = new Date();
    const snapshot = getMetricsSnapshot({
      playtime: 3600,
      actionsCount: 42,
      decisionsCount: 7,
      startedAt: now,
      lastPlayedAt: now,
    });
    expect(snapshot).toEqual({
      playtime: 3600,
      actionsCount: 42,
      decisionsCount: 7,
      startedAt: now,
      lastPlayedAt: now,
    });
  });

  it('handles null values gracefully', () => {
    const snapshot = getMetricsSnapshot({
      playtime: null,
      actionsCount: null,
      decisionsCount: null,
      startedAt: null,
      lastPlayedAt: null,
    });
    expect(snapshot.playtime).toBe(0);
    expect(snapshot.actionsCount).toBe(0);
    expect(snapshot.decisionsCount).toBe(0);
  });
});

describe('accumulateMetrics', () => {
  const basePt = {
    id: 'pt-1',
    userId: 'user-1',
    worldId: 'world-1',
    playtime: 100,
    actionsCount: 10,
    decisionsCount: 3,
    lastPlayedAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    (storage as any).__setMockPlaythrough({ ...basePt });
    vi.clearAllMocks();
  });

  it('returns undefined for non-existent playthrough', async () => {
    (storage as any).__setMockPlaythrough(null);
    const result = await accumulateMetrics('nonexistent', { playtimeSeconds: 10 });
    expect(result).toBeUndefined();
  });

  it('accumulates playtime seconds', async () => {
    const result = await accumulateMetrics('pt-1', { playtimeSeconds: 60 });
    expect(result?.playtime).toBe(160);
  });

  it('accumulates actions count', async () => {
    const result = await accumulateMetrics('pt-1', { actions: 5 });
    expect(result?.actionsCount).toBe(15);
  });

  it('accumulates decisions count', async () => {
    const result = await accumulateMetrics('pt-1', { decisions: 2 });
    expect(result?.decisionsCount).toBe(5);
  });

  it('accumulates all metrics at once', async () => {
    const result = await accumulateMetrics('pt-1', {
      playtimeSeconds: 30,
      actions: 3,
      decisions: 1,
    });
    expect(result?.playtime).toBe(130);
    expect(result?.actionsCount).toBe(13);
    expect(result?.decisionsCount).toBe(4);
  });

  it('rounds fractional playtime seconds', async () => {
    const result = await accumulateMetrics('pt-1', { playtimeSeconds: 30.7 });
    expect(result?.playtime).toBe(131);
  });

  it('ignores zero deltas and returns playthrough unchanged', async () => {
    const result = await accumulateMetrics('pt-1', {
      playtimeSeconds: 0,
      actions: 0,
      decisions: 0,
    });
    // No update called, returns original playthrough
    expect(result?.playtime).toBe(100);
    expect(storage.updatePlaythrough).not.toHaveBeenCalled();
  });

  it('ignores negative deltas', async () => {
    const result = await accumulateMetrics('pt-1', {
      playtimeSeconds: -10,
      actions: -5,
      decisions: -1,
    });
    expect(result?.playtime).toBe(100);
    expect(storage.updatePlaythrough).not.toHaveBeenCalled();
  });

  it('handles playthrough with zero initial metrics', async () => {
    (storage as any).__setMockPlaythrough({
      ...basePt,
      playtime: 0,
      actionsCount: 0,
      decisionsCount: 0,
    });
    const result = await accumulateMetrics('pt-1', {
      playtimeSeconds: 10,
      actions: 1,
      decisions: 1,
    });
    expect(result?.playtime).toBe(10);
    expect(result?.actionsCount).toBe(1);
    expect(result?.decisionsCount).toBe(1);
  });
});
