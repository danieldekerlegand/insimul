/**
 * Tests for shared/assessment-types.ts (player panel helpers)
 * and shared/assessment/assessment-types.ts (type definitions)
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
  type CEFRLevel as PanelCEFRLevel,
  type DimensionScore,
  type PlayerAssessmentData,
} from '../assessment-types';
import type {
  AssessmentType,
  PhaseType,
  TaskType,
  CEFRLevel,
  AssessmentStatus,
  ScoringMethod,
  ScoringDimension,
  AssessmentTask,
  AssessmentPhase,
  AssessmentDefinition,
  RecordingReference,
  AutomatedMetrics,
  TaskResult,
  PhaseResult,
  AssessmentSession,
} from '../assessment/assessment-types';

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
    const levels: PanelCEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

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

describe('Assessment Type Definitions', () => {
  describe('AssessmentType', () => {
    it('accepts valid assessment types', () => {
      const types: AssessmentType[] = ['arrival', 'departure', 'periodic'];
      expect(types).toHaveLength(3);
    });
  });

  describe('PhaseType', () => {
    it('accepts all four phase types', () => {
      const phases: PhaseType[] = ['conversational', 'listening', 'writing', 'visual'];
      expect(phases).toHaveLength(4);
    });
  });

  describe('TaskType', () => {
    it('accepts all task types', () => {
      const tasks: TaskType[] = [
        'conversation_tier',
        'follow_directions',
        'info_extraction',
        'form_completion',
        'brief_message',
        'sign_reading',
        'object_identification',
      ];
      expect(tasks).toHaveLength(7);
    });
  });

  describe('CEFRLevel', () => {
    it('accepts A1 through B2 levels', () => {
      const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
      expect(levels).toHaveLength(4);
    });
  });

  describe('AssessmentStatus', () => {
    it('covers all state machine states', () => {
      const statuses: AssessmentStatus[] = [
        'idle', 'initializing', 'phase_active',
        'phase_transitioning', 'scoring', 'complete',
      ];
      expect(statuses).toHaveLength(6);
    });
  });

  describe('ScoringDimension', () => {
    it('can create a scoring dimension', () => {
      const dim: ScoringDimension = {
        id: 'vocabulary',
        name: 'Vocabulary',
        description: 'Range and accuracy of vocabulary use',
        minScore: 1,
        maxScore: 5,
      };
      expect(dim.id).toBe('vocabulary');
      expect(dim.maxScore).toBeGreaterThan(dim.minScore);
    });
  });

  describe('AssessmentTask', () => {
    it('can create a conversation tier task', () => {
      const task: AssessmentTask = {
        id: 'conv_tier1',
        type: 'conversation_tier',
        prompt: 'Greet the player in {{targetLanguage}}',
        maxPoints: 5,
        scoringMethod: 'llm',
        timeLimitSeconds: 120,
      };
      expect(task.type).toBe('conversation_tier');
      expect(task.maxPoints).toBe(5);
    });

    it('can create a multiple choice task with options', () => {
      const task: AssessmentTask = {
        id: 'sign_1',
        type: 'sign_reading',
        prompt: 'What does this sign say?',
        maxPoints: 1,
        scoringMethod: 'multiple_choice',
        options: ['Exit', 'Entrance', 'Closed'],
        expectedAnswer: 'Exit',
      };
      expect(task.options).toHaveLength(3);
      expect(task.expectedAnswer).toBe('Exit');
    });
  });

  describe('AssessmentPhase', () => {
    it('can create a phase with tasks summing to maxPoints', () => {
      const phase: AssessmentPhase = {
        id: 'phase_1_conversational',
        type: 'conversational',
        name: 'Conversational Assessment',
        description: 'NPC conversation across 5 tiers',
        tasks: [
          { id: 't1', type: 'conversation_tier', prompt: 'Tier 1', maxPoints: 5, scoringMethod: 'llm' },
          { id: 't2', type: 'conversation_tier', prompt: 'Tier 2', maxPoints: 5, scoringMethod: 'llm' },
        ],
        maxPoints: 10,
        timeLimitSeconds: 600,
        scoringDimensions: ['vocabulary', 'grammar'],
      };
      const taskSum = phase.tasks.reduce((s, t) => s + t.maxPoints, 0);
      expect(taskSum).toBe(phase.maxPoints);
    });
  });

  describe('AssessmentDefinition', () => {
    it('can create a full assessment definition', () => {
      const def: AssessmentDefinition = {
        id: 'arrival_encounter',
        type: 'arrival',
        name: 'Arrival Encounter',
        description: 'Pre-test administered on arrival to the city',
        targetLanguage: '{{targetLanguage}}',
        phases: [
          {
            id: 'p1', type: 'conversational', name: 'Conversation',
            description: 'Talk with NPC', tasks: [], maxPoints: 25,
          },
          {
            id: 'p2', type: 'listening', name: 'Listening',
            description: 'Follow directions', tasks: [], maxPoints: 7,
          },
          {
            id: 'p3', type: 'writing', name: 'Writing',
            description: 'Written tasks', tasks: [], maxPoints: 11,
          },
          {
            id: 'p4', type: 'visual', name: 'Visual',
            description: 'Visual recognition', tasks: [], maxPoints: 10,
          },
        ],
        totalMaxPoints: 53,
        scoringDimensions: [
          { id: 'vocab', name: 'Vocabulary', description: 'Vocab range', minScore: 1, maxScore: 5 },
        ],
        estimatedMinutes: 20,
      };
      expect(def.totalMaxPoints).toBe(53);
      expect(def.phases).toHaveLength(4);
    });
  });

  describe('RecordingReference', () => {
    it('can create a recording reference', () => {
      const rec: RecordingReference = {
        storageKey: 'recordings/session-123/phase-1.webm',
        mimeType: 'audio/webm',
        durationSeconds: 180,
        phaseId: 'phase_1',
        taskId: 'conv_tier1',
        recordedAt: '2026-03-13T10:00:00Z',
      };
      expect(rec.mimeType).toBe('audio/webm');
      expect(rec.phaseId).toBe('phase_1');
    });
  });

  describe('AutomatedMetrics', () => {
    it('can create automated metrics', () => {
      const metrics: AutomatedMetrics = {
        wpm: 45.2,
        ttr: 0.72,
        mlu: 6.3,
        avgLatencyMs: 2500,
        repairs: 3,
        codeSwitchingCount: 1,
      };
      expect(metrics.wpm).toBeGreaterThan(0);
      expect(metrics.ttr).toBeGreaterThan(0);
      expect(metrics.ttr).toBeLessThanOrEqual(1);
    });
  });

  describe('TaskResult', () => {
    it('can create a task result with rationale', () => {
      const result: TaskResult = {
        taskId: 'conv_tier1',
        score: 4,
        maxPoints: 5,
        playerResponse: 'Bonjour, je suis un touriste.',
        rationale: 'Good greeting with minor article error',
      };
      expect(result.score).toBeLessThanOrEqual(result.maxPoints);
    });
  });

  describe('PhaseResult', () => {
    it('can create a phase result with dimension scores and metrics', () => {
      const result: PhaseResult = {
        phaseId: 'phase_1_conversational',
        score: 20,
        maxPoints: 25,
        taskResults: [
          { taskId: 't1', score: 4, maxPoints: 5 },
          { taskId: 't2', score: 5, maxPoints: 5 },
          { taskId: 't3', score: 3, maxPoints: 5 },
          { taskId: 't4', score: 4, maxPoints: 5 },
          { taskId: 't5', score: 4, maxPoints: 5 },
        ],
        dimensionScores: { vocabulary: 4, grammar: 3, fluency: 4, pragmatics: 4, pronunciation: 5 },
        automatedMetrics: {
          wpm: 52, ttr: 0.68, mlu: 7.1,
          avgLatencyMs: 2100, repairs: 2, codeSwitchingCount: 0,
        },
        transcript: 'NPC: Bonjour!\nPlayer: Bonjour, comment allez-vous?',
        startedAt: '2026-03-13T10:00:00Z',
        completedAt: '2026-03-13T10:08:30Z',
      };
      const taskSum = result.taskResults.reduce((s, t) => s + t.score, 0);
      expect(taskSum).toBe(result.score);
    });
  });

  describe('AssessmentSession', () => {
    it('can create a complete assessment session', () => {
      const session: AssessmentSession = {
        id: 'session-abc-123',
        playerId: 'player-1',
        worldId: 'world-1',
        assessmentDefinitionId: 'arrival_encounter',
        assessmentType: 'arrival',
        targetLanguage: 'French',
        status: 'complete',
        phaseResults: [
          { phaseId: 'p1', score: 20, maxPoints: 25, taskResults: [] },
          { phaseId: 'p2', score: 5, maxPoints: 7, taskResults: [] },
          { phaseId: 'p3', score: 8, maxPoints: 11, taskResults: [] },
          { phaseId: 'p4', score: 7, maxPoints: 10, taskResults: [] },
        ],
        totalScore: 40,
        totalMaxPoints: 53,
        cefrLevel: 'A2',
        dimensionScores: { vocabulary: 4, grammar: 3, fluency: 4, pragmatics: 3, pronunciation: 4 },
        automatedMetrics: {
          wpm: 48, ttr: 0.70, mlu: 6.8,
          avgLatencyMs: 2300, repairs: 5, codeSwitchingCount: 2,
        },
        createdAt: '2026-03-13T09:55:00Z',
        startedAt: '2026-03-13T10:00:00Z',
        completedAt: '2026-03-13T10:22:00Z',
      };
      expect(session.status).toBe('complete');
      expect(session.totalScore).toBe(40);
      expect(session.cefrLevel).toBe('A2');
      expect(session.phaseResults).toHaveLength(4);
      const phaseSum = session.phaseResults.reduce((s, p) => s + p.score, 0);
      expect(phaseSum).toBe(session.totalScore);
    });

    it('can create an in-progress session with partial results', () => {
      const session: AssessmentSession = {
        id: 'session-def-456',
        playerId: 'player-2',
        worldId: 'world-1',
        assessmentDefinitionId: 'arrival_encounter',
        assessmentType: 'arrival',
        targetLanguage: 'Spanish',
        status: 'phase_active',
        phaseResults: [
          { phaseId: 'p1', score: 18, maxPoints: 25, taskResults: [] },
        ],
        totalMaxPoints: 53,
        createdAt: '2026-03-13T14:00:00Z',
        startedAt: '2026-03-13T14:01:00Z',
      };
      expect(session.status).toBe('phase_active');
      expect(session.totalScore).toBeUndefined();
      expect(session.cefrLevel).toBeUndefined();
      expect(session.completedAt).toBeUndefined();
    });
  });
});
