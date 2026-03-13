/**
 * Recording Integration Service
 *
 * Wires phase handler results through the AssessmentEngine to the server API.
 * Handles:
 * 1. Creating assessment sessions on the server
 * 2. Persisting phase results (with transcripts and recordings) after each phase
 * 3. Pushing individual recordings to the server
 * 4. Completing sessions with final scores
 */

import type {
  AssessmentSession,
  AssessmentType,
  CEFRLevel,
  PhaseResult,
  RecordingReference,
} from '../../shared/assessment/assessment-types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RecordingIntegrationConfig {
  /** Base URL for the API (default: '' for same-origin) */
  baseUrl?: string;
}

export interface CreateSessionParams {
  playerId: string;
  worldId: string;
  assessmentType: AssessmentType;
  assessmentDefinitionId: string;
  targetLanguage: string;
  totalMaxPoints: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class RecordingIntegrationService {
  private readonly _baseUrl: string;

  constructor(config: RecordingIntegrationConfig = {}) {
    this._baseUrl = config.baseUrl ?? '';
  }

  /** Create a new assessment session on the server. */
  async createSession(params: CreateSessionParams): Promise<AssessmentSession> {
    const res = await fetch(`${this._baseUrl}/api/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error(`Failed to create assessment session: ${res.status}`);
    }
    return res.json();
  }

  /** Persist a phase result (including transcript and recordings) to the server. */
  async persistPhaseResult(sessionId: string, result: PhaseResult): Promise<AssessmentSession> {
    const res = await fetch(`${this._baseUrl}/api/assessments/${sessionId}/phases/${result.phaseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
    if (!res.ok) {
      throw new Error(`Failed to persist phase result: ${res.status}`);
    }
    return res.json();
  }

  /** Add a recording reference to the session. */
  async addRecording(sessionId: string, recording: RecordingReference): Promise<AssessmentSession> {
    const res = await fetch(`${this._baseUrl}/api/assessments/${sessionId}/recordings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recording),
    });
    if (!res.ok) {
      throw new Error(`Failed to add recording: ${res.status}`);
    }
    return res.json();
  }

  /** Mark the session as complete with final scores. */
  async completeSession(
    sessionId: string,
    totalScore: number,
    maxScore: number,
    cefrLevel: CEFRLevel,
  ): Promise<AssessmentSession> {
    const res = await fetch(`${this._baseUrl}/api/assessments/${sessionId}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalScore, maxScore, cefrLevel }),
    });
    if (!res.ok) {
      throw new Error(`Failed to complete session: ${res.status}`);
    }
    return res.json();
  }

  /** Fetch a session by ID. */
  async getSession(sessionId: string): Promise<AssessmentSession | null> {
    const res = await fetch(`${this._baseUrl}/api/assessments/${sessionId}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Failed to fetch session: ${res.status}`);
    }
    return res.json();
  }

  /** Fetch all sessions for a player. */
  async getPlayerSessions(playerId: string): Promise<AssessmentSession[]> {
    const res = await fetch(`${this._baseUrl}/api/assessments/player/${playerId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch player sessions: ${res.status}`);
    }
    return res.json();
  }

  /**
   * Full integration flow: persist a phase result and push all its recordings.
   * This is the main method phase handlers should call after completing a phase.
   */
  async persistPhaseWithRecordings(
    sessionId: string,
    result: PhaseResult,
  ): Promise<void> {
    // First, persist the phase result (includes transcript)
    await this.persistPhaseResult(sessionId, result);

    // Then push each recording reference individually for indexing
    if (result.recordings) {
      for (const recording of result.recordings) {
        await this.addRecording(sessionId, recording);
      }
    }
  }
}
