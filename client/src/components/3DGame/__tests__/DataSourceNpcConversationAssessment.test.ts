/**
 * Tests for NPC conversation and assessment methods on DataSource.
 * Pure-logic tests — no Babylon.js or file I/O needed.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileDataSource, ApiDataSource, type NpcConversationResult } from '../DataSource';

// In-memory storage mock
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
}

describe('FileDataSource — NPC conversation and assessment methods', () => {
  let storage: MemoryStorage;
  let ds: FileDataSource;

  beforeEach(() => {
    storage = new MemoryStorage();
    // FileDataSource tries to load world data files; suppress errors
    ds = new FileDataSource(storage);
  });

  describe('startNpcNpcConversation', () => {
    it('returns null (no AI server in exported mode)', async () => {
      const result = await ds.startNpcNpcConversation('world1', 'npc1', 'npc2', 'weather');
      expect(result).toBeNull();
    });
  });

  describe('createAssessmentSession', () => {
    it('creates a session and stores it in localStorage', async () => {
      const session = await ds.createAssessmentSession({
        playerId: 'player1',
        worldId: 'world1',
        assessmentType: 'npc_exam',
        totalMaxPoints: 100,
      });

      expect(session.id).toMatch(/^local-assessment-/);
      expect(session.playerId).toBe('player1');
      expect(session.worldId).toBe('world1');
      expect(session.assessmentType).toBe('npc_exam');
      expect(session.status).toBe('in_progress');

      // Verify persisted
      const stored = JSON.parse(storage.getItem('insimul_assessments_world1') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(session.id);
    });

    it('appends to existing sessions', async () => {
      await ds.createAssessmentSession({ playerId: 'p1', worldId: 'w1', assessmentType: 'a' });
      await ds.createAssessmentSession({ playerId: 'p1', worldId: 'w1', assessmentType: 'b' });

      const stored = JSON.parse(storage.getItem('insimul_assessments_w1') || '[]');
      expect(stored).toHaveLength(2);
    });
  });

  describe('submitAssessmentPhase', () => {
    it('stores phase data keyed by session ID', async () => {
      const result = await ds.submitAssessmentPhase('session-1', 'phase-1', {
        score: 85,
        maxScore: 100,
      });

      expect(result.sessionId).toBe('session-1');
      expect(result.phaseId).toBe('phase-1');
      expect(result.score).toBe(85);
      expect(result.submittedAt).toBeDefined();

      const stored = JSON.parse(storage.getItem('insimul_assessment_phases_session-1') || '[]');
      expect(stored).toHaveLength(1);
    });

    it('appends multiple phases', async () => {
      await ds.submitAssessmentPhase('session-1', 'phase-1', { score: 80 });
      await ds.submitAssessmentPhase('session-1', 'phase-2', { score: 90 });

      const stored = JSON.parse(storage.getItem('insimul_assessment_phases_session-1') || '[]');
      expect(stored).toHaveLength(2);
    });
  });

  describe('completeAssessment', () => {
    it('stores completion record', async () => {
      const result = await ds.completeAssessment('session-1', {
        totalScore: 85,
        maxScore: 100,
        cefrLevel: 'B1',
      });

      expect(result.sessionId).toBe('session-1');
      expect(result.status).toBe('complete');
      expect(result.totalScore).toBe(85);
      expect(result.cefrLevel).toBe('B1');

      const stored = JSON.parse(storage.getItem('insimul_assessment_complete_session-1') || 'null');
      expect(stored.status).toBe('complete');
    });
  });

  describe('getPlayerAssessments', () => {
    it('returns empty array when no assessments exist', async () => {
      const result = await ds.getPlayerAssessments('player1', 'world1');
      expect(result).toEqual([]);
    });

    it('returns stored assessments for the world', async () => {
      await ds.createAssessmentSession({ playerId: 'p1', worldId: 'w1', assessmentType: 'arrival' });
      await ds.createAssessmentSession({ playerId: 'p1', worldId: 'w1', assessmentType: 'npc_exam' });

      const result = await ds.getPlayerAssessments('p1', 'w1');
      expect(result).toHaveLength(2);
      expect(result[0].assessmentType).toBe('arrival');
      expect(result[1].assessmentType).toBe('npc_exam');
    });
  });
});

describe('ApiDataSource — NPC conversation and assessment methods', () => {
  let ds: ApiDataSource;

  beforeEach(() => {
    ds = new ApiDataSource('test-token', '');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('startNpcNpcConversation', () => {
    it('posts to npc-npc-conversation endpoint and returns result', async () => {
      const mockResponse: NpcConversationResult = {
        exchanges: [{ speakerId: 'npc1', speakerName: 'Alice', text: 'Hello!' }],
        relationshipDelta: { friendshipChange: 1, trustChange: 0, romanceSpark: 0 },
        topic: 'greeting',
        languageUsed: 'English',
      };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ds.startNpcNpcConversation('world1', 'npc1', 'npc2', 'greeting');

      expect(fetch).toHaveBeenCalledWith(
        '/api/worlds/world1/npc-npc-conversation',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ npc1Id: 'npc1', npc2Id: 'npc2', topic: 'greeting' }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('returns null on failure', async () => {
      (fetch as any).mockResolvedValue({ ok: false });
      const result = await ds.startNpcNpcConversation('world1', 'npc1', 'npc2');
      expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));
      const result = await ds.startNpcNpcConversation('world1', 'npc1', 'npc2');
      expect(result).toBeNull();
    });
  });

  describe('createAssessmentSession', () => {
    it('posts to assessments endpoint', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'session-1' }),
      });

      const result = await ds.createAssessmentSession({
        playerId: 'player1',
        worldId: 'world1',
        assessmentType: 'npc_exam',
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/assessments',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.id).toBe('session-1');
    });

    it('throws on failure', async () => {
      (fetch as any).mockResolvedValue({ ok: false, status: 500 });
      await expect(ds.createAssessmentSession({
        playerId: 'p1', worldId: 'w1', assessmentType: 'a',
      })).rejects.toThrow('Failed to create assessment session: 500');
    });
  });

  describe('submitAssessmentPhase', () => {
    it('puts to the phase endpoint', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      await ds.submitAssessmentPhase('session-1', 'phase-1', { score: 80 });

      expect(fetch).toHaveBeenCalledWith(
        '/api/assessments/session-1/phases/phase-1',
        expect.objectContaining({ method: 'PUT' }),
      );
    });

    it('throws on failure', async () => {
      (fetch as any).mockResolvedValue({ ok: false, status: 404 });
      await expect(ds.submitAssessmentPhase('s1', 'p1', {}))
        .rejects.toThrow('Failed to submit assessment phase: 404');
    });
  });

  describe('completeAssessment', () => {
    it('puts to the complete endpoint', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'complete' }),
      });

      const result = await ds.completeAssessment('session-1', { totalScore: 85, cefrLevel: 'B1' });

      expect(fetch).toHaveBeenCalledWith(
        '/api/assessments/session-1/complete',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ totalScore: 85, cefrLevel: 'B1' }),
        }),
      );
      expect(result.status).toBe('complete');
    });
  });

  describe('getPlayerAssessments', () => {
    it('fetches assessments for player and world', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [{ id: 's1', assessmentType: 'arrival' }],
      });

      const result = await ds.getPlayerAssessments('player1', 'world1');

      expect(fetch).toHaveBeenCalledWith(
        '/api/assessments/player/player1?worldId=world1',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        }),
      );
      expect(result).toHaveLength(1);
    });

    it('returns empty array on failure', async () => {
      (fetch as any).mockResolvedValue({ ok: false });
      const result = await ds.getPlayerAssessments('p1', 'w1');
      expect(result).toEqual([]);
    });
  });
});

