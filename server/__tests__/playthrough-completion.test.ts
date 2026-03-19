/**
 * Tests for the Playthrough Completion Service.
 *
 * Validates:
 * - Journey summary generation from play traces
 * - Learning report card (CEFR comparison)
 * - Completion flow (status update, trace recording)
 * - Edge cases (empty traces, already completed, etc.)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock storage before importing service
vi.mock('../db/storage', () => ({
  storage: {
    getPlaythrough: vi.fn(),
    getTracesByPlaythrough: vi.fn(),
    updatePlaythrough: vi.fn(),
    createPlayTrace: vi.fn(),
    getTruthsByWorld: vi.fn().mockResolvedValue([]),
  },
}));

import {
  generateJourneySummary,
  generateLearningReportCard,
  completePlaythrough,
  type JourneySummary,
} from '../services/playthrough-completion';
import { storage } from '../db/storage';
import type { Playthrough, PlayTrace } from '@shared/schema';

const mockStorage = storage as any;

// ── Helpers ──────────────────────────────────────────────────────────────────

function makePlaythrough(overrides: Partial<Playthrough> = {}): Playthrough {
  return {
    id: 'pt-1',
    userId: 'user-1',
    worldId: 'world-1',
    worldSnapshotVersion: 1,
    name: 'Test Playthrough',
    description: null,
    notes: null,
    status: 'active',
    currentTimestep: 42,
    playtime: 3600,
    actionsCount: 150,
    decisionsCount: 10,
    startedAt: new Date('2026-01-01'),
    lastPlayedAt: new Date('2026-03-01'),
    completedAt: null,
    playerCharacterId: 'char-1',
    saveData: {},
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-03-01'),
    ...overrides,
  };
}

function makeTrace(overrides: Partial<PlayTrace> = {}): PlayTrace {
  return {
    id: `trace-${Math.random().toString(36).slice(2, 8)}`,
    playthroughId: 'pt-1',
    userId: 'user-1',
    actionType: 'move',
    actionName: null,
    actionData: {},
    timestep: 1,
    characterId: null,
    targetId: null,
    targetType: null,
    locationId: null,
    outcome: null,
    outcomeData: {},
    stateChanges: [],
    narrativeText: null,
    durationMs: null,
    timestamp: new Date('2026-02-01'),
    createdAt: new Date('2026-02-01'),
    ...overrides,
  };
}

// ── generateJourneySummary ───────────────────────────────────────────────────

describe('generateJourneySummary', () => {
  it('returns correct playtime and action counts from playthrough', async () => {
    const pt = makePlaythrough({ playtime: 7200, actionsCount: 300, decisionsCount: 25 });
    const summary = await generateJourneySummary(pt, []);

    expect(summary.playtime).toBe(7200);
    expect(summary.actionsCount).toBe(300);
    expect(summary.decisionsCount).toBe(25);
  });

  it('counts quests completed and failed', async () => {
    const traces = [
      makeTrace({ actionType: 'quest_completed' }),
      makeTrace({ actionType: 'quest_completed' }),
      makeTrace({ actionType: 'quest_failed' }),
      makeTrace({ actionType: 'move' }),
    ];

    const summary = await generateJourneySummary(makePlaythrough(), traces);
    expect(summary.questsCompleted).toBe(2);
    expect(summary.questsFailed).toBe(1);
  });

  it('counts unique NPCs interacted and finds favorite', async () => {
    const traces = [
      makeTrace({ actionType: 'npc_talked', targetId: 'npc-1', actionData: { npcName: 'Alice' } }),
      makeTrace({ actionType: 'npc_talked', targetId: 'npc-1', actionData: { npcName: 'Alice' } }),
      makeTrace({ actionType: 'npc_talked', targetId: 'npc-1', actionData: { npcName: 'Alice' } }),
      makeTrace({ actionType: 'dialogue', targetId: 'npc-2', actionData: { npcName: 'Bob' } }),
    ];

    const summary = await generateJourneySummary(makePlaythrough(), traces);
    expect(summary.npcsInteracted).toBe(2);
    expect(summary.favoriteNpc).toEqual({
      id: 'npc-1',
      name: 'Alice',
      interactionCount: 3,
    });
  });

  it('counts unique locations visited and finds most visited', async () => {
    const traces = [
      makeTrace({ actionType: 'location_visited', targetId: 'loc-1', actionData: { locationName: 'Market' } }),
      makeTrace({ actionType: 'location_visited', targetId: 'loc-1', actionData: { locationName: 'Market' } }),
      makeTrace({ actionType: 'settlement_entered', targetId: 'loc-2', actionData: { locationName: 'Harbor' } }),
    ];

    const summary = await generateJourneySummary(makePlaythrough(), traces);
    expect(summary.locationsVisited).toBe(2);
    expect(summary.mostVisitedLocation).toEqual({
      id: 'loc-1',
      name: 'Market',
      visitCount: 2,
    });
  });

  it('counts unique vocabulary words learned', async () => {
    const traces = [
      makeTrace({ actionType: 'vocabulary_used', actionData: { word: 'bonjour' } }),
      makeTrace({ actionType: 'vocabulary_used', actionData: { word: 'bonjour' } }), // duplicate
      makeTrace({ actionType: 'object_examined', actionData: { targetWord: 'maison' } }),
      makeTrace({ actionType: 'object_named', actionData: { targetWord: 'arbre' } }),
    ];

    const summary = await generateJourneySummary(makePlaythrough(), traces);
    expect(summary.vocabularyLearned).toBe(3);
  });

  it('counts achievements', async () => {
    const traces = [
      makeTrace({ actionType: 'achievement_unlocked' }),
      makeTrace({ actionType: 'achievement_unlocked' }),
    ];

    const summary = await generateJourneySummary(makePlaythrough(), traces);
    expect(summary.achievementsEarned).toBe(2);
  });

  it('returns null for favoriteNpc/mostVisitedLocation when no relevant traces', async () => {
    const summary = await generateJourneySummary(makePlaythrough(), []);
    expect(summary.favoriteNpc).toBeNull();
    expect(summary.mostVisitedLocation).toBeNull();
  });

  it('has valid ISO date strings', async () => {
    const summary = await generateJourneySummary(makePlaythrough(), []);
    expect(() => new Date(summary.startedAt)).not.toThrow();
    expect(() => new Date(summary.completedAt)).not.toThrow();
  });
});

// ── generateLearningReportCard ───────────────────────────────────────────────

describe('generateLearningReportCard', () => {
  it('extracts start and end CEFR levels from assessment traces', async () => {
    const traces = [
      makeTrace({
        actionType: 'assessment_completed',
        actionData: { cefrLevel: 'A1' },
        timestamp: new Date('2026-01-15'),
      }),
      makeTrace({
        actionType: 'assessment_completed',
        actionData: { cefrLevel: 'B1' },
        timestamp: new Date('2026-03-01'),
      }),
    ];

    const report = await generateLearningReportCard(makePlaythrough(), traces);
    expect(report.startCefrLevel).toBe('A1');
    expect(report.endCefrLevel).toBe('B1');
    expect(report.improvementLevels).toBe(2);
  });

  it('returns null levels when no assessment traces', async () => {
    const report = await generateLearningReportCard(makePlaythrough(), []);
    expect(report.startCefrLevel).toBeNull();
    expect(report.endCefrLevel).toBeNull();
    expect(report.improvementLevels).toBe(0);
  });

  it('handles single assessment (same start/end)', async () => {
    const traces = [
      makeTrace({
        actionType: 'assessment_completed',
        actionData: { cefrLevel: 'A2' },
        timestamp: new Date('2026-02-01'),
      }),
    ];

    const report = await generateLearningReportCard(makePlaythrough(), traces);
    expect(report.startCefrLevel).toBe('A2');
    expect(report.endCefrLevel).toBe('A2');
    expect(report.improvementLevels).toBe(0);
  });

  it('clamps improvement to 0 if end is lower than start', async () => {
    const traces = [
      makeTrace({
        actionType: 'assessment_completed',
        actionData: { cefrLevel: 'B1' },
        timestamp: new Date('2026-01-15'),
      }),
      makeTrace({
        actionType: 'assessment_completed',
        actionData: { cefrLevel: 'A1' },
        timestamp: new Date('2026-03-01'),
      }),
    ];

    const report = await generateLearningReportCard(makePlaythrough(), traces);
    expect(report.improvementLevels).toBe(0);
  });
});

// ── completePlaythrough ──────────────────────────────────────────────────────

describe('completePlaythrough', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws if playthrough not found', async () => {
    mockStorage.getPlaythrough.mockResolvedValue(undefined);

    await expect(completePlaythrough('pt-missing', 'user-1'))
      .rejects.toThrow('Playthrough not found');
  });

  it('throws if not the owner', async () => {
    mockStorage.getPlaythrough.mockResolvedValue(
      makePlaythrough({ userId: 'other-user' }),
    );

    await expect(completePlaythrough('pt-1', 'user-1'))
      .rejects.toThrow('Not your playthrough');
  });

  it('throws if already completed', async () => {
    mockStorage.getPlaythrough.mockResolvedValue(
      makePlaythrough({ status: 'completed' }),
    );

    await expect(completePlaythrough('pt-1', 'user-1'))
      .rejects.toThrow('Playthrough already completed');
  });

  it('completes successfully and returns summary + report card', async () => {
    mockStorage.getPlaythrough.mockResolvedValue(makePlaythrough());
    mockStorage.getTracesByPlaythrough.mockResolvedValue([
      makeTrace({ actionType: 'quest_completed' }),
      makeTrace({ actionType: 'npc_talked', targetId: 'npc-1', actionData: { npcName: 'Alice' } }),
    ]);
    mockStorage.updatePlaythrough.mockResolvedValue(makePlaythrough({ status: 'completed' }));
    mockStorage.createPlayTrace.mockResolvedValue(makeTrace({ actionType: 'playthrough_completed' }));

    const result = await completePlaythrough('pt-1', 'user-1');

    expect(result.summary.questsCompleted).toBe(1);
    expect(result.summary.npcsInteracted).toBe(1);
    expect(result.completionBonusXP).toBe(500);
    expect(result.reportCard).toBeDefined();

    expect(mockStorage.updatePlaythrough).toHaveBeenCalledWith('pt-1', {
      status: 'completed',
      completedAt: expect.any(Date),
    });

    expect(mockStorage.createPlayTrace).toHaveBeenCalledWith(
      expect.objectContaining({
        playthroughId: 'pt-1',
        actionType: 'playthrough_completed',
      }),
    );
  });
});
