/**
 * Assessment API Routes
 *
 * CRUD endpoints for assessment sessions: create, fetch, update phases,
 * add recordings, complete, and query by player/world.
 */

import { Router, type Request, type Response } from 'express';

export function createAssessmentRoutes(storage: any): Router {
  const router = Router();

  // POST /api/assessments — create a new assessment session
  router.post('/assessments', async (req: Request, res: Response) => {
    try {
      const { playerId, worldId, assessmentType } = req.body;

      if (!playerId || !worldId || !assessmentType) {
        return res.status(400).json({ message: 'Missing required fields: playerId, worldId, assessmentType' });
      }

      const session = await storage.createAssessmentSession({
        playerId,
        worldId,
        assessmentType,
        status: 'in_progress',
        phases: [],
        recordings: [],
        startedAt: new Date(),
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

      const session = await storage.updateAssessmentPhaseResult(sessionId, phaseId, result);

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

      const session = await storage.completeAssessmentSession(sessionId, totalScore, maxScore, cefrLevel);

      if (!session) {
        return res.status(404).json({ message: 'Assessment session not found' });
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
      const sessions = await storage.getPlayerAssessments(playerId);
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

  return router;
}
