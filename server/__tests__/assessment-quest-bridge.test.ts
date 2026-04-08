/**
 * Tests for the Assessment Quest Bridge
 *
 * Validates departure assessment quest creation, phase completion tracking,
 * eligibility checks, and report card generation with improvement deltas.
 */
import { describe, it, expect } from 'vitest';
import type { AssessmentSession } from '../../shared/assessment/assessment-types';
import type { Quest } from '../../shared/schema';
import {
  createDepartureAssessmentQuest,
  markPhaseCompleted,
  isDepartureEligible,
  generateReportCard,
  generateReportCardFromOverlays,
  extractOverlayAssessmentData,
  DEPARTURE_QUEST_THRESHOLD,
} from '../../shared/quests/assessment-quest-bridge.js';
import type { AssessmentPhaseResult, AssessmentCompletionResult } from '../../shared/assessment/assessment-types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<AssessmentSession> = {}): AssessmentSession {
  return {
    id: 'session-1',
    playerId: 'player-1',
    worldId: 'world-1',
    assessmentType: 'arrival',
    phaseResults: [],
    totalMaxPoints: 53,
    totalScore: 0,
    cefrLevel: 'A1',
    dimensionScores: {},
    ...overrides,
  };
}

function makeQuestLike(overrides: Partial<Quest> = {}): Quest {
  const base = createDepartureAssessmentQuest({
    worldId: 'world-1',
    playerName: 'TestPlayer',
    targetLanguage: 'French',
  });
  return { id: 'quest-1', ...base, ...overrides } as unknown as Quest;
}

// ── createDepartureAssessmentQuest ───────────────────────────────────────────

describe('createDepartureAssessmentQuest', () => {
  const quest = createDepartureAssessmentQuest({
    worldId: 'w-1',
    playerName: 'Alice',
    playerCharacterId: 'char-1',
    targetLanguage: 'French',
  });

  it('sets correct quest metadata', () => {
    expect(quest.worldId).toBe('w-1');
    expect(quest.assignedTo).toBe('Alice');
    expect(quest.assignedToCharacterId).toBe('char-1');
    expect(quest.questType).toBe('assessment');
    expect(quest.difficulty).toBe('intermediate');
    expect(quest.targetLanguage).toBe('French');
    expect(quest.status).toBe('active');
  });

  it('has 4 objectives matching departure encounter phases', () => {
    const objectives = quest.objectives as any[];
    expect(objectives).toHaveLength(4);
    const phaseTypes = objectives.map((o: any) => o.phaseType);
    expect(phaseTypes).toEqual(['reading', 'writing', 'listening', 'conversation']);
  });

  it('objectives start incomplete', () => {
    const objectives = quest.objectives as any[];
    for (const obj of objectives) {
      expect(obj.completed).toBe(false);
      expect(obj.progress).toBe(0);
    }
  });

  it('includes assessment tags', () => {
    expect(quest.tags).toContain('assessment');
    expect(quest.tags).toContain('departure');
    expect(quest.tags).toContain('non-skippable');
  });

  it('has report_card reward type', () => {
    expect((quest.rewards as any)?.type).toBe('report_card');
  });

  it('description mentions target language', () => {
    expect(quest.description).toContain('French');
  });

  it('completion criteria references the departure encounter', () => {
    expect((quest.completionCriteria as any)?.assessmentDefinitionId).toBe('departure_encounter');
  });
});

// ── markPhaseCompleted ───────────────────────────────────────────────────────

describe('markPhaseCompleted', () => {
  it('marks the matching phase objective as completed', () => {
    const quest = makeQuestLike();
    const result = markPhaseCompleted(quest, 'departure_reading', 12);
    expect(result).not.toBeNull();
    const readingObj = result!.objectives.find((o: any) => o.objectiveId === 'departure_reading');
    expect(readingObj.completed).toBe(true);
    expect(readingObj.score).toBe(12);
  });

  it('does not mark other objectives', () => {
    const quest = makeQuestLike();
    const result = markPhaseCompleted(quest, 'departure_reading', 12);
    const others = result!.objectives.filter((o: any) => o.objectiveId !== 'departure_reading');
    for (const obj of others) {
      expect(obj.completed).toBe(false);
    }
  });

  it('returns null for unknown phase ID', () => {
    const quest = makeQuestLike();
    expect(markPhaseCompleted(quest, 'nonexistent_phase', 5)).toBeNull();
  });

  it('reports allComplete=false when only some phases done', () => {
    const quest = makeQuestLike();
    const result = markPhaseCompleted(quest, 'departure_reading', 15);
    expect(result!.allComplete).toBe(false);
    expect(result!.progress.phasesCompleted).toBe(1);
  });

  it('reports allComplete=true when all phases are done', () => {
    let quest = makeQuestLike();
    const phaseIds = ['departure_reading', 'departure_writing', 'departure_listening', 'departure_conversation'];
    let result: any;
    for (const phaseId of phaseIds) {
      result = markPhaseCompleted(quest, phaseId, 10);
      // Simulate updating quest objectives for next iteration
      quest = makeQuestLike({ objectives: result!.objectives });
    }
    expect(result!.allComplete).toBe(true);
    expect(result!.progress.phasesCompleted).toBe(4);
  });
});

// ── isDepartureEligible ──────────────────────────────────────────────────────

describe('isDepartureEligible', () => {
  it('returns false when below threshold', () => {
    expect(isDepartureEligible(0)).toBe(false);
    expect(isDepartureEligible(DEPARTURE_QUEST_THRESHOLD - 1)).toBe(false);
  });

  it('returns true at threshold', () => {
    expect(isDepartureEligible(DEPARTURE_QUEST_THRESHOLD)).toBe(true);
  });

  it('returns true above threshold', () => {
    expect(isDepartureEligible(DEPARTURE_QUEST_THRESHOLD + 5)).toBe(true);
  });
});

// ── generateReportCard ───────────────────────────────────────────────────────

describe('generateReportCard', () => {
  const arrivalSession = makeSession({
    id: 'arrival-1',
    assessmentType: 'arrival',
    totalScore: 20,
    cefrLevel: 'A1',
    phaseResults: [
      { phaseId: 'arrival_reading', totalScore: 5, taskResults: [] },
      { phaseId: 'arrival_writing', totalScore: 5, taskResults: [] },
      { phaseId: 'arrival_listening', totalScore: 5, taskResults: [] },
      { phaseId: 'arrival_conversation', totalScore: 5, taskResults: [] },
    ],
    dimensionScores: {
      comprehension: 2,
      fluency: 1,
      vocabulary: 2,
      grammar: 1,
      pronunciation: 1,
    },
    completedAt: '2026-01-01T00:00:00Z',
  });

  const departureSession = makeSession({
    id: 'departure-1',
    assessmentType: 'departure',
    totalScore: 40,
    cefrLevel: 'B1',
    phaseResults: [
      { phaseId: 'departure_reading', totalScore: 12, taskResults: [] },
      { phaseId: 'departure_writing', totalScore: 10, taskResults: [] },
      { phaseId: 'departure_listening', totalScore: 10, taskResults: [] },
      { phaseId: 'departure_conversation', totalScore: 8, taskResults: [] },
    ],
    dimensionScores: {
      comprehension: 4,
      fluency: 3,
      vocabulary: 4,
      grammar: 3,
      pronunciation: 3,
    },
    completedAt: '2026-03-01T00:00:00Z',
  });

  const periodicSessions = [
    makeSession({
      id: 'periodic-1',
      assessmentType: 'periodic',
      totalScore: 15,
      totalMaxPoints: 25,
      cefrLevel: 'A2',
      completedAt: '2026-02-01T00:00:00Z',
    }),
    makeSession({
      id: 'periodic-2',
      assessmentType: 'periodic',
      totalScore: 18,
      totalMaxPoints: 25,
      cefrLevel: 'B1',
      completedAt: '2026-02-15T00:00:00Z',
    }),
  ];

  const report = generateReportCard({
    playerId: 'player-1',
    worldId: 'world-1',
    arrivalSession,
    departureSession,
    periodicSessions,
  });

  it('includes session IDs', () => {
    expect(report.arrivalSessionId).toBe('arrival-1');
    expect(report.departureSessionId).toBe('departure-1');
  });

  it('shows CEFR improvement', () => {
    expect(report.arrivalCefrLevel).toBe('A1');
    expect(report.departureCefrLevel).toBe('B1');
    expect(report.cefrImproved).toBe(true);
  });

  it('computes total score delta', () => {
    expect(report.arrivalTotalScore).toBe(20);
    expect(report.departureTotalScore).toBe(40);
    expect(report.totalDelta).toBe(20);
    expect(report.maxScore).toBe(53);
  });

  it('computes per-phase deltas', () => {
    expect(report.phaseDeltas).toHaveLength(4);

    const reading = report.phaseDeltas.find((d) => d.phaseType === 'reading')!;
    expect(reading.beforeScore).toBe(5);
    expect(reading.afterScore).toBe(12);
    expect(reading.delta).toBe(7);
    expect(reading.maxScore).toBe(15);

    const conversation = report.phaseDeltas.find((d) => d.phaseType === 'conversation')!;
    expect(conversation.beforeScore).toBe(5);
    expect(conversation.afterScore).toBe(8);
    expect(conversation.delta).toBe(3);
  });

  it('computes per-dimension deltas', () => {
    expect(report.dimensionDeltas).toHaveLength(5);

    const vocab = report.dimensionDeltas.find((d) => d.dimension === 'vocabulary')!;
    expect(vocab.before).toBe(2);
    expect(vocab.after).toBe(4);
    expect(vocab.delta).toBe(2);

    const fluency = report.dimensionDeltas.find((d) => d.dimension === 'fluency')!;
    expect(fluency.before).toBe(1);
    expect(fluency.after).toBe(3);
    expect(fluency.delta).toBe(2);
  });

  it('includes periodic snapshots sorted by time', () => {
    expect(report.periodicSnapshots).toHaveLength(2);
    expect(report.periodicSnapshots[0].sessionId).toBe('periodic-1');
    expect(report.periodicSnapshots[1].sessionId).toBe('periodic-2');
  });

  it('cefrImproved is false when levels are the same', () => {
    const sameLevel = generateReportCard({
      playerId: 'player-1',
      worldId: 'world-1',
      arrivalSession: makeSession({ cefrLevel: 'A2', totalScore: 20 }),
      departureSession: makeSession({ cefrLevel: 'A2', totalScore: 25 }),
      periodicSessions: [],
    });
    expect(sameLevel.cefrImproved).toBe(false);
  });

  it('handles missing dimension scores gracefully', () => {
    const report = generateReportCard({
      playerId: 'player-1',
      worldId: 'world-1',
      arrivalSession: makeSession({ dimensionScores: undefined }),
      departureSession: makeSession({
        dimensionScores: { vocabulary: 3 },
        totalScore: 30,
        cefrLevel: 'A2',
      }),
      periodicSessions: [],
    });
    const vocab = report.dimensionDeltas.find((d) => d.dimension === 'vocabulary')!;
    expect(vocab.before).toBe(0);
    expect(vocab.after).toBe(3);
    expect(vocab.delta).toBe(3);
  });

  it('handles sessions with numeric completedAt timestamps', () => {
    const report = generateReportCard({
      playerId: 'player-1',
      worldId: 'world-1',
      arrivalSession,
      departureSession,
      periodicSessions: [
        makeSession({
          id: 'p-num',
          totalScore: 12,
          totalMaxPoints: 25,
          cefrLevel: 'A2',
          completedAt: 1706745600000,
        }),
      ],
    });
    expect(report.periodicSnapshots).toHaveLength(1);
    expect(report.periodicSnapshots[0].completedAt).toBe(1706745600000);
  });
});

// ── extractOverlayAssessmentData ────────────────────────────────────────────

describe('extractOverlayAssessmentData', () => {
  it('extracts data from quest with phaseResults and assessmentResult', () => {
    const quest = {
      id: 'quest-arrival',
      phaseResults: [
        { phaseId: 'reading', score: 10, maxScore: 15, taskResults: [], dimensionScores: {}, completedAt: '2026-01-01' },
      ] as AssessmentPhaseResult[],
      assessmentResult: {
        totalScore: 30, maxScore: 53, cefrLevel: 'A2' as const,
        dimensionScores: { comprehension: 3 }, completedAt: '2026-01-01',
      } as AssessmentCompletionResult,
    };
    const result = extractOverlayAssessmentData(quest);
    expect(result).not.toBeNull();
    expect(result!.questId).toBe('quest-arrival');
    expect(result!.phaseResults).toHaveLength(1);
    expect(result!.assessmentResult.cefrLevel).toBe('A2');
  });

  it('returns null when phaseResults is missing', () => {
    const quest = {
      id: 'quest-1',
      assessmentResult: { totalScore: 10, maxScore: 53, cefrLevel: 'A1' as const, dimensionScores: {}, completedAt: '2026-01-01' },
    };
    expect(extractOverlayAssessmentData(quest)).toBeNull();
  });

  it('returns null when assessmentResult is missing', () => {
    const quest = {
      id: 'quest-1',
      phaseResults: [{ phaseId: 'reading', score: 5, maxScore: 15, taskResults: [], dimensionScores: {}, completedAt: '2026-01-01' }],
    };
    expect(extractOverlayAssessmentData(quest)).toBeNull();
  });

  it('returns null when both are missing', () => {
    expect(extractOverlayAssessmentData({ id: 'quest-1' })).toBeNull();
  });
});

// ── generateReportCardFromOverlays ──────────────────────────────────────────

describe('generateReportCardFromOverlays', () => {
  const arrivalPhaseResults: AssessmentPhaseResult[] = [
    { phaseId: 'arrival_reading', score: 5, maxScore: 15, taskResults: [], dimensionScores: {}, completedAt: '2026-01-01T00:00:00Z' },
    { phaseId: 'arrival_writing', score: 5, maxScore: 13, taskResults: [], dimensionScores: {}, completedAt: '2026-01-01T00:00:00Z' },
    { phaseId: 'arrival_listening', score: 5, maxScore: 10, taskResults: [], dimensionScores: {}, completedAt: '2026-01-01T00:00:00Z' },
    { phaseId: 'arrival_conversation', score: 5, maxScore: 15, taskResults: [], dimensionScores: {}, completedAt: '2026-01-01T00:00:00Z' },
  ];

  const departurePhaseResults: AssessmentPhaseResult[] = [
    { phaseId: 'departure_reading', score: 12, maxScore: 15, taskResults: [], dimensionScores: {}, completedAt: '2026-03-01T00:00:00Z' },
    { phaseId: 'departure_writing', score: 10, maxScore: 13, taskResults: [], dimensionScores: {}, completedAt: '2026-03-01T00:00:00Z' },
    { phaseId: 'departure_listening', score: 10, maxScore: 10, taskResults: [], dimensionScores: {}, completedAt: '2026-03-01T00:00:00Z' },
    { phaseId: 'departure_conversation', score: 8, maxScore: 15, taskResults: [], dimensionScores: {}, completedAt: '2026-03-01T00:00:00Z' },
  ];

  const arrivalData = {
    questId: 'arrival-quest-1',
    phaseResults: arrivalPhaseResults,
    assessmentResult: {
      totalScore: 20,
      maxScore: 53,
      cefrLevel: 'A1' as const,
      dimensionScores: { comprehension: 2, fluency: 1, vocabulary: 2, grammar: 1, pronunciation: 1 },
      completedAt: '2026-01-01T00:00:00Z',
    },
  };

  const departureData = {
    questId: 'departure-quest-1',
    phaseResults: departurePhaseResults,
    assessmentResult: {
      totalScore: 40,
      maxScore: 53,
      cefrLevel: 'B1' as const,
      dimensionScores: { comprehension: 4, fluency: 3, vocabulary: 4, grammar: 3, pronunciation: 3 },
      completedAt: '2026-03-01T00:00:00Z',
    },
  };

  const report = generateReportCardFromOverlays({
    playerId: 'player-1',
    worldId: 'world-1',
    arrivalData,
    departureData,
  });

  it('includes quest IDs as session IDs', () => {
    expect(report.arrivalSessionId).toBe('arrival-quest-1');
    expect(report.departureSessionId).toBe('departure-quest-1');
  });

  it('shows CEFR improvement', () => {
    expect(report.arrivalCefrLevel).toBe('A1');
    expect(report.departureCefrLevel).toBe('B1');
    expect(report.cefrImproved).toBe(true);
  });

  it('computes total score delta', () => {
    expect(report.arrivalTotalScore).toBe(20);
    expect(report.departureTotalScore).toBe(40);
    expect(report.totalDelta).toBe(20);
    expect(report.maxScore).toBe(53);
  });

  it('computes per-phase deltas from overlay data', () => {
    expect(report.phaseDeltas).toHaveLength(4);

    const reading = report.phaseDeltas.find((d) => d.phaseType === 'reading')!;
    expect(reading.beforeScore).toBe(5);
    expect(reading.afterScore).toBe(12);
    expect(reading.delta).toBe(7);

    const conversation = report.phaseDeltas.find((d) => d.phaseType === 'conversation')!;
    expect(conversation.beforeScore).toBe(5);
    expect(conversation.afterScore).toBe(8);
    expect(conversation.delta).toBe(3);
  });

  it('computes per-dimension deltas from overlay data', () => {
    expect(report.dimensionDeltas).toHaveLength(5);

    const vocab = report.dimensionDeltas.find((d) => d.dimension === 'vocabulary')!;
    expect(vocab.before).toBe(2);
    expect(vocab.after).toBe(4);
    expect(vocab.delta).toBe(2);

    const fluency = report.dimensionDeltas.find((d) => d.dimension === 'fluency')!;
    expect(fluency.before).toBe(1);
    expect(fluency.after).toBe(3);
    expect(fluency.delta).toBe(2);
  });

  it('includes periodic snapshots from overlay data', () => {
    const reportWithPeriodic = generateReportCardFromOverlays({
      playerId: 'player-1',
      worldId: 'world-1',
      arrivalData,
      departureData,
      periodicData: [
        {
          questId: 'periodic-quest-1',
          phaseResults: [],
          assessmentResult: {
            totalScore: 15, maxScore: 25, cefrLevel: 'A2',
            dimensionScores: {}, completedAt: '2026-02-01T00:00:00Z',
          },
        },
        {
          questId: 'periodic-quest-2',
          phaseResults: [],
          assessmentResult: {
            totalScore: 18, maxScore: 25, cefrLevel: 'B1',
            dimensionScores: {}, completedAt: '2026-02-15T00:00:00Z',
          },
        },
      ],
    });
    expect(reportWithPeriodic.periodicSnapshots).toHaveLength(2);
    expect(reportWithPeriodic.periodicSnapshots[0].sessionId).toBe('periodic-quest-1');
    expect(reportWithPeriodic.periodicSnapshots[1].sessionId).toBe('periodic-quest-2');
  });

  it('cefrImproved is false when levels are the same', () => {
    const sameLevel = generateReportCardFromOverlays({
      playerId: 'player-1',
      worldId: 'world-1',
      arrivalData: {
        ...arrivalData,
        assessmentResult: { ...arrivalData.assessmentResult, cefrLevel: 'A2' },
      },
      departureData: {
        ...departureData,
        assessmentResult: { ...departureData.assessmentResult, cefrLevel: 'A2' },
      },
    });
    expect(sameLevel.cefrImproved).toBe(false);
  });

  it('handles missing dimension scores gracefully', () => {
    const report = generateReportCardFromOverlays({
      playerId: 'player-1',
      worldId: 'world-1',
      arrivalData: {
        ...arrivalData,
        assessmentResult: { ...arrivalData.assessmentResult, dimensionScores: {} },
      },
      departureData: {
        ...departureData,
        assessmentResult: { ...departureData.assessmentResult, dimensionScores: { vocabulary: 3 } },
      },
    });
    const vocab = report.dimensionDeltas.find((d) => d.dimension === 'vocabulary')!;
    expect(vocab.before).toBe(0);
    expect(vocab.after).toBe(3);
    expect(vocab.delta).toBe(3);
  });
});
