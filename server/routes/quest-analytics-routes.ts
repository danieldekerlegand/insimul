import type { Express } from "express";
import { storage } from '../db/storage';
import {
  computeQuestAnalytics,
  computeLearningOutcomes,
  computeObjectiveAnalytics,
} from '../../shared/quests/quest-analytics.js';
import {
  auditQuestCompletability,
  type WorldContext,
} from '@shared/quest-completability-audit';
import type { GameAction } from '@shared/quest-feasibility-validator';

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

  // Run quest completability audit for a world
  app.get("/api/worlds/:worldId/analytics/quest-completability", async (req, res) => {
    try {
      const { worldId } = req.params;

      // Fetch all data in parallel
      const [quests, characters, items, actions, businesses, settlements] = await Promise.all([
        storage.getQuestsByWorld(worldId),
        storage.getCharactersByWorld(worldId),
        storage.getItemsByWorld(worldId),
        storage.getActionsByWorld(worldId),
        storage.getBusinessesByWorld(worldId),
        storage.getSettlementsByWorld(worldId),
      ]);

      // Build world context
      const npcNames = new Set(characters.map((c: any) => c.name as string).filter(Boolean));
      const npcCharacterIds = new Set(characters.map((c: any) => String(c.id)).filter(Boolean));
      const itemNames = new Set(items.map((i: any) => i.name as string).filter(Boolean));
      const locationNames = new Set<string>();
      for (const b of businesses) {
        if (b.name) locationNames.add(b.name as string);
      }
      for (const s of settlements) {
        if (s.name) locationNames.add(s.name as string);
      }
      const questIds = new Set(quests.map(q => String(q.id)));

      const worldContext: WorldContext = {
        npcNames,
        npcCharacterIds,
        itemNames,
        locationNames,
        questIds,
      };

      const gameActions: GameAction[] = actions.map((a: any) => ({
        name: a.name ?? '',
        actionType: a.actionType ?? '',
        category: a.category ?? undefined,
        targetType: a.targetType ?? undefined,
        isActive: a.isActive ?? true,
        tags: a.tags ?? [],
      }));

      const report = auditQuestCompletability(worldId, quests as any, worldContext, gameActions);
      res.json(report);
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
