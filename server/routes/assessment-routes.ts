/**
 * Assessment API Routes
 *
 * CRUD endpoints for assessment sessions: create, fetch, update phases,
 * add recordings, complete, and query by player/world.
 * Includes transcript retrieval endpoints for admin detail views.
 */

import { Router, type Request, type Response } from 'express';
import type { IStorage } from '../db/storage';

export function createAssessmentRoutes(storage: IStorage): Router {
  const router = Router();

  // POST /api/assessments — create a new assessment session
  router.post('/assessments', async (req: Request, res: Response) => {
    try {
      const { playerId, worldId, playthroughId, assessmentType, assessmentDefinitionId, targetLanguage, totalMaxPoints } = req.body;

      if (!playerId || !worldId || !assessmentType) {
        return res.status(400).json({ message: 'Missing required fields: playerId, worldId, assessmentType' });
      }

      const session = await storage.createAssessmentSession({
        playerId,
        worldId,
        ...(playthroughId ? { playthroughId } : {}),
        assessmentDefinitionId: assessmentDefinitionId || assessmentType,
        assessmentType,
        targetLanguage: targetLanguage || 'unknown',
        status: 'initializing',
        phaseResults: [],
        totalMaxPoints: totalMaxPoints || 0,
        recordings: [],
        createdAt: new Date().toISOString(),
      });

      res.status(201).json(session);
    } catch (error) {
      console.error('Create assessment session error:', error);
      res.status(500).json({ message: 'Failed to create assessment session' });
    }
  });

  // GET /api/assessments/:sessionId — fetch a session
  router.get('/assessments/:sessionId', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getAssessmentSession(sessionId);

      if (!session) {
        return res.status(404).json({ message: 'Assessment session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Get assessment session error:', error);
      res.status(500).json({ message: 'Failed to get assessment session' });
    }
  });

  // PUT /api/assessments/:sessionId/phases/:phaseId — update phase result
  router.put('/assessments/:sessionId/phases/:phaseId', async (req: Request, res: Response) => {
    try {
      const { sessionId, phaseId } = req.params;
      const result = req.body;

      if (!result || Object.keys(result).length === 0) {
        return res.status(400).json({ message: 'Missing phase result data' });
      }

      // Ensure phaseId from URL matches body
      result.phaseId = phaseId;

      const session = await storage.updateAssessmentPhaseResult(sessionId, result);

      if (!session) {
        return res.status(404).json({ message: 'Assessment session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Update assessment phase error:', error);
      res.status(500).json({ message: 'Failed to update assessment phase' });
    }
  });

  // PUT /api/assessments/:sessionId/recordings — add recording reference
  router.put('/assessments/:sessionId/recordings', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const recording = req.body;

      if (!recording || !recording.phaseId) {
        return res.status(400).json({ message: 'Missing required field: phaseId' });
      }

      const session = await storage.addAssessmentRecording(sessionId, recording);

      if (!session) {
        return res.status(404).json({ message: 'Assessment session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Add assessment recording error:', error);
      res.status(500).json({ message: 'Failed to add assessment recording' });
    }
  });

  // PUT /api/assessments/:sessionId/complete — mark session complete
  router.put('/assessments/:sessionId/complete', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { totalScore, maxScore, cefrLevel } = req.body || {};

      const session = await storage.completeAssessmentSession(
        sessionId,
        totalScore ?? 0,
        maxScore ?? 0,
        cefrLevel ?? 'A1',
      );

      if (!session) {
        return res.status(404).json({ message: 'Assessment session not found' });
      }

      // Mirror cefrLevel to playerProgress for direct server-side queries
      if (cefrLevel && session.playerId && session.worldId) {
        const playerProg = await storage.getPlayerProgressByUser(
          session.playerId, session.worldId, (session as any).playthroughId,
        );
        if (playerProg) {
          await storage.updatePlayerProgress(playerProg.id, { cefrLevel } as any).catch(err =>
            console.warn('[Assessment] Failed to mirror cefrLevel to playerProgress:', err)
          );
        }
      }

      res.json(session);
    } catch (error) {
      console.error('Complete assessment session error:', error);
      res.status(500).json({ message: 'Failed to complete assessment session' });
    }
  });

  // GET /api/assessments/player/:playerId — get all player assessments
  router.get('/assessments/player/:playerId', async (req: Request, res: Response) => {
    try {
      const { playerId } = req.params;
      const { worldId, playthroughId } = req.query;
      const sessions = await storage.getPlayerAssessments(playerId, worldId as string | undefined, undefined, playthroughId as string | undefined);
      res.json(sessions);
    } catch (error) {
      console.error('Get player assessments error:', error);
      res.status(500).json({ message: 'Failed to get player assessments' });
    }
  });

  // GET /api/assessments/world/:worldId/summary — get world summary statistics
  router.get('/assessments/world/:worldId/summary', async (req: Request, res: Response) => {
    try {
      const { worldId } = req.params;
      const summary = await storage.getWorldAssessmentSummary(worldId);
      res.json(summary);
    } catch (error) {
      console.error('Get world assessment summary error:', error);
      res.status(500).json({ message: 'Failed to get world assessment summary' });
    }
  });

  // GET /api/assessments/:sessionId/transcripts — get all transcripts for a session
  router.get('/assessments/:sessionId/transcripts', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getAssessmentSession(sessionId);

      if (!session) {
        return res.status(404).json({ message: 'Assessment session not found' });
      }

      // Extract transcripts from all phase results
      const transcripts = session.phaseResults
        .filter(pr => pr.transcript && (typeof pr.transcript === 'string' ? pr.transcript.length > 0 : pr.transcript.length > 0))
        .map(pr => ({
          phaseId: pr.phaseId,
          entries: pr.transcript,
          startedAt: pr.startedAt,
          completedAt: pr.completedAt,
        }));

      res.json({ sessionId, transcripts });
    } catch (error) {
      console.error('Get assessment transcripts error:', error);
      res.status(500).json({ message: 'Failed to get assessment transcripts' });
    }
  });

  // GET /api/assessments/:sessionId/recordings-list — get all recordings for a session
  router.get('/assessments/:sessionId/recordings-list', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getAssessmentSession(sessionId);

      if (!session) {
        return res.status(404).json({ message: 'Assessment session not found' });
      }

      // Collect recordings from session-level and phase-level
      const sessionRecordings = session.recordings || [];
      const phaseRecordings = session.phaseResults
        .flatMap(pr => (pr.recordings || []).map(r => ({ ...r, _fromPhase: pr.phaseId })));

      res.json({
        sessionId,
        recordings: sessionRecordings,
        phaseRecordings,
      });
    } catch (error) {
      console.error('Get assessment recordings error:', error);
      res.status(500).json({ message: 'Failed to get assessment recordings' });
    }
  });

  return router;
}
