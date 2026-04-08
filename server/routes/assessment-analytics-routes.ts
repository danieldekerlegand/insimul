/**
 * Assessment Analytics Routes
 *
 * Endpoints for detailed pre/post assessment comparisons and learning gains.
 * Now sources data from quest overlays instead of legacy MongoDB collection.
 */

import type { Express } from 'express';
import type { IStorage } from '../db/storage';
import type { Quest } from '@shared/schema';
import { getEntitiesWithOverlay } from '../services/playthrough-overlay';
import {
  extractOverlayAssessmentData,
  generateReportCardFromOverlays,
} from '@shared/quests/assessment-quest-bridge';

function isAssessmentQuest(quest: Quest): boolean {
  return quest.questType === 'assessment';
}

function getAssessmentType(quest: Quest): string {
  const tags = (quest.tags as string[]) ?? [];
  if (tags.includes('arrival')) return 'arrival';
  if (tags.includes('departure')) return 'departure';
  if (tags.includes('periodic')) return 'periodic';
  return 'unknown';
}

export function registerAssessmentAnalyticsRoutes(app: Express, storage: IStorage) {

  // GET /api/worlds/:worldId/analytics/assessments — aggregate assessment analytics
  app.get('/api/worlds/:worldId/analytics/assessments', async (req, res) => {
    try {
      const { worldId } = req.params;
      const playthroughs = await storage.getPlaythroughsByWorld(worldId);
      const baseQuests = await storage.getQuestsByWorld(worldId);

      // Collect all completed assessment data across playthroughs
      const playerData = new Map<string, { arrival?: any; departure?: any; periodic: any[] }>();

      for (const pt of playthroughs) {
        const quests = await getEntitiesWithOverlay(baseQuests, pt.id, 'quest');
        for (const quest of quests) {
          if (!isAssessmentQuest(quest)) continue;
          const overlay = extractOverlayAssessmentData(quest);
          if (!overlay) continue;

          const playerId = quest.assignedTo ?? pt.userId;
          if (!playerData.has(playerId)) {
            playerData.set(playerId, { periodic: [] });
          }
          const pd = playerData.get(playerId)!;
          const type = getAssessmentType(quest);

          if (type === 'arrival') pd.arrival = { quest, overlay };
          else if (type === 'departure') pd.departure = { quest, overlay };
          else if (type === 'periodic') pd.periodic.push({ quest, overlay });
        }
      }

      // Build report cards for players with both arrival and departure
      const reports = [];
      let cefrImproved = 0;

      for (const [playerId, pd] of Array.from(playerData.entries())) {
        if (!pd.arrival || !pd.departure) continue;
        try {
          const report = generateReportCardFromOverlays({
            playerId,
            worldId,
            arrivalData: pd.arrival.overlay,
            departureData: pd.departure.overlay,
            periodicData: pd.periodic.map((p: any) => p.overlay),
          });
          reports.push(report);
          if (report.cefrImproved) cefrImproved++;
        } catch {
          // Skip malformed data
        }
      }

      res.json({
        worldId,
        totalAssessedPlayers: playerData.size,
        playersWithPrePost: reports.length,
        cefrImprovementRate: reports.length > 0 ? cefrImproved / reports.length : 0,
        playerComparisons: reports,
        generatedAt: Date.now(),
      });
    } catch (error: any) {
      console.error('Assessment analytics error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/worlds/:worldId/analytics/assessments/player/:playerId — player pre/post comparison
  app.get('/api/worlds/:worldId/analytics/assessments/player/:playerId', async (req, res) => {
    try {
      const { worldId, playerId } = req.params;
      const playthroughs = await storage.getPlaythroughsByWorld(worldId);
      const baseQuests = await storage.getQuestsByWorld(worldId);

      let arrivalOverlay: any = null;
      let departureOverlay: any = null;
      const periodicOverlays: any[] = [];

      for (const pt of playthroughs) {
        const quests = await getEntitiesWithOverlay(baseQuests, pt.id, 'quest');
        for (const quest of quests) {
          if (!isAssessmentQuest(quest)) continue;
          if (quest.assignedTo !== playerId && pt.userId !== playerId) continue;

          const overlay = extractOverlayAssessmentData(quest);
          if (!overlay) continue;

          const type = getAssessmentType(quest);
          if (type === 'arrival') arrivalOverlay = overlay;
          else if (type === 'departure') departureOverlay = overlay;
          else if (type === 'periodic') periodicOverlays.push(overlay);
        }
      }

      if (!arrivalOverlay) {
        return res.status(404).json({ message: 'No pre-test (arrival) assessment found for this player' });
      }

      if (!departureOverlay) {
        return res.status(404).json({
          message: 'No post-test (departure) assessment found — only pre-test available',
          preSession: {
            totalScore: arrivalOverlay.assessmentResult.totalScore,
            maxScore: arrivalOverlay.assessmentResult.maxScore,
            cefrLevel: arrivalOverlay.assessmentResult.cefrLevel,
          },
        });
      }

      const report = generateReportCardFromOverlays({
        playerId,
        worldId,
        arrivalData: arrivalOverlay,
        departureData: departureOverlay,
        periodicData: periodicOverlays,
      });

      res.json(report);
    } catch (error: any) {
      console.error('Player assessment analytics error:', error);
      res.status(500).json({ message: error.message });
    }
  });
}
