/**
 * Assessment Analytics Routes
 *
 * Endpoints for detailed pre/post assessment comparisons and learning gains.
 */

import type { Express } from 'express';
import type { IStorage } from '../db/storage';
import {
  buildPrePostComparison,
  computeAssessmentAnalytics,
} from '../services/assessment-analytics';

export function registerAssessmentAnalyticsRoutes(app: Express, storage: IStorage) {

  // GET /api/worlds/:worldId/analytics/assessments — aggregate assessment analytics
  app.get('/api/worlds/:worldId/analytics/assessments', async (req, res) => {
    try {
      const { worldId } = req.params;
      const allSessions = await storage.getWorldAssessmentSessions(worldId);
      const analytics = computeAssessmentAnalytics(allSessions, worldId);
      res.json(analytics);
    } catch (error: any) {
      console.error('Assessment analytics error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/worlds/:worldId/analytics/assessments/player/:playerId — player pre/post comparison
  app.get('/api/worlds/:worldId/analytics/assessments/player/:playerId', async (req, res) => {
    try {
      const { worldId, playerId } = req.params;
      const sessions = await storage.getPlayerAssessments(playerId, worldId);

      const completedSessions = sessions.filter(
        s => s.status === 'complete' || s.status === 'completed'
      );

      const preSession = completedSessions.find(
        s => s.assessmentType === 'arrival' || s.assessmentType === 'arrival_encounter'
      );
      const postSession = completedSessions.find(
        s => s.assessmentType === 'departure' || s.assessmentType === 'departure_encounter'
      );

      if (!preSession) {
        return res.status(404).json({ message: 'No pre-test (arrival) assessment found for this player' });
      }

      if (!postSession) {
        return res.status(404).json({
          message: 'No post-test (departure) assessment found — only pre-test available',
          preSession: {
            sessionId: preSession.id,
            totalScore: preSession.totalScore ?? 0,
            maxScore: preSession.totalMaxPoints,
            cefrLevel: preSession.cefrLevel,
          },
        });
      }

      const periodic = completedSessions.filter(
        s => s.assessmentType === 'periodic'
      );

      const comparison = buildPrePostComparison(preSession, postSession, periodic);
      res.json(comparison);
    } catch (error: any) {
      console.error('Player assessment analytics error:', error);
      res.status(500).json({ message: error.message });
    }
  });
}
