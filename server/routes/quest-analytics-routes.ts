import type { Express } from "express";
import { storage } from '../db/storage';
import {
  computeQuestAnalytics,
  computeLearningOutcomes,
  computeObjectiveAnalytics,
} from '../services/quest-analytics';

export function registerQuestAnalyticsRoutes(app: Express) {

  // ===== QUEST ANALYTICS =====

  // Get quest analytics summary for a world
  app.get("/api/worlds/:worldId/analytics/quests", async (req, res) => {
    try {
      const { worldId } = req.params;
      const quests = await storage.getQuestsByWorld(worldId);
      const analytics = computeQuestAnalytics(quests);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get objective-level analytics for a world
  app.get("/api/worlds/:worldId/analytics/objectives", async (req, res) => {
    try {
      const { worldId } = req.params;
      const quests = await storage.getQuestsByWorld(worldId);
      const analytics = computeObjectiveAnalytics(quests);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get learning outcome summary for a player in a world
  app.get("/api/worlds/:worldId/analytics/learning-outcomes/:playerName", async (req, res) => {
    try {
      const { worldId, playerName } = req.params;
      const { playthroughId } = req.query;
      const quests = await storage.getQuestsByWorld(worldId);
      const outcomes = computeLearningOutcomes(
        quests,
        playerName,
        worldId,
        playthroughId as string | undefined,
      );
      res.json(outcomes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
