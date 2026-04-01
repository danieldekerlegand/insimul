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

  // TODO: All assessment lifecycle methods should be folded into the quest/Prolog system.
  // Language assessments are special quests: quest_language(assessment_type, language).
  // Results stored as Prolog facts instead of separate assessment API calls.
  // Recording references can be stored as: recording(PlayerID, SessionID, PhaseID, BlobURL).

  /** Create a new assessment session — stubbed pending Prolog integration. */
  async createSession(params: CreateSessionParams): Promise<AssessmentSession> {
    console.warn('[RecordingIntegration] createSession stubbed — TODO: integrate via quest_language Prolog predicates');
    return { id: `stub-${Date.now()}`, ...params } as any;
  }

  /** Persist a phase result — stubbed pending Prolog integration. */
  async persistPhaseResult(sessionId: string, result: PhaseResult): Promise<AssessmentSession> {
    console.warn('[RecordingIntegration] persistPhaseResult stubbed — TODO: store as Prolog fact');
    return { id: sessionId } as any;
  }

  /** Add a recording reference — stubbed pending Prolog integration. */
  async addRecording(sessionId: string, recording: RecordingReference): Promise<AssessmentSession> {
    console.warn('[RecordingIntegration] addRecording stubbed — TODO: store as Prolog fact');
    return { id: sessionId } as any;
  }

  /** Mark the session as complete — stubbed pending Prolog integration. */
  async completeSession(
    sessionId: string,
    totalScore: number,
    maxScore: number,
    cefrLevel: CEFRLevel,
  ): Promise<AssessmentSession> {
    console.warn('[RecordingIntegration] completeSession stubbed — TODO: store as Prolog fact');
    return { id: sessionId, totalScore, maxScore, cefrLevel } as any;
  }

  /** Fetch a session by ID — stubbed pending Prolog integration. */
  async getSession(sessionId: string): Promise<AssessmentSession | null> {
    console.warn('[RecordingIntegration] getSession stubbed — TODO: query Prolog facts');
    return null;
  }

  /** Fetch all sessions for a player — stubbed pending Prolog integration. */
  async getPlayerSessions(playerId: string): Promise<AssessmentSession[]> {
    console.warn('[RecordingIntegration] getPlayerSessions stubbed — TODO: query Prolog facts');
    return [];
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
