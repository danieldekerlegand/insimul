/**
 * Assessment API Routes
 *
 * Read-only endpoints that source assessment data from quest overlays
 * in the playthrough save system.
 */

import { Router, type Request, type Response } from 'express';
import type { IStorage } from '../db/storage';
import type { Quest } from '@shared/schema';
import { getEntitiesWithOverlay } from '../services/playthrough-overlay';
import {
  extractOverlayAssessmentData,
  type QuestOverlayAssessmentData,
} from '@shared/quests/assessment-quest-bridge';

// ── Helpers ─────────────────────────────────────────────────────────────────

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

function overlayToSessionFormat(quest: Quest, overlay: QuestOverlayAssessmentData) {
  const assessmentType = getAssessmentType(quest);
  return {
    id: overlay.questId,
    playerId: quest.assignedTo ?? '',
    worldId: quest.worldId,
    assessmentType,
    targetLanguage: quest.targetLanguage ?? 'unknown',
    status: quest.status === 'completed' ? 'complete' : 'in_progress',
    phaseResults: overlay.phaseResults,
    totalScore: overlay.assessmentResult.totalScore,
    totalMaxPoints: overlay.assessmentResult.maxScore,
    cefrLevel: overlay.assessmentResult.cefrLevel,
    dimensionScores: overlay.assessmentResult.dimensionScores,
    completedAt: overlay.assessmentResult.completedAt,
    createdAt: (quest as any).createdAt ?? null,
  };
}

async function getAssessmentQuestsFromPlaythroughs(
  storage: IStorage,
  opts: { playerId?: string; worldId?: string; playthroughId?: string },
) {
  let playthroughs: Array<{ id: string; worldId: string; userId: string }>;

  if (opts.playthroughId) {
    const pt = await storage.getPlaythrough(opts.playthroughId);
    playthroughs = pt ? [pt] : [];
  } else if (opts.worldId && opts.playerId) {
    const pt = await storage.getUserPlaythroughForWorld(opts.playerId, opts.worldId);
    playthroughs = pt ? [pt] : [];
  } else if (opts.worldId) {
    playthroughs = await storage.getPlaythroughsByWorld(opts.worldId);
  } else if (opts.playerId) {
    playthroughs = await storage.getPlaythroughsByUser(opts.playerId);
  } else {
    playthroughs = [];
  }

  const results: Array<ReturnType<typeof overlayToSessionFormat>> = [];

  for (const pt of playthroughs) {
    const baseQuests = await storage.getQuestsByWorld(pt.worldId);
    const quests = await getEntitiesWithOverlay(baseQuests, pt.id, 'quest');

    for (const quest of quests) {
      if (!isAssessmentQuest(quest)) continue;
      const overlay = extractOverlayAssessmentData(quest);
      if (!overlay) continue;
      results.push(overlayToSessionFormat(quest, overlay));
    }
  }

  return results;
}

// ── Route factory ───────────────────────────────────────────────────────────

export function createAssessmentRoutes(storage: IStorage): Router {
  const router = Router();

  // GET /api/assessments/player/:playerId
  router.get('/assessments/player/:playerId', async (req: Request, res: Response) => {
    try {
      const { playerId } = req.params;
      const { worldId, playthroughId } = req.query;

      const sessions = await getAssessmentQuestsFromPlaythroughs(storage, {
        playerId,
        worldId: worldId as string | undefined,
        playthroughId: playthroughId as string | undefined,
      });

      res.json(sessions);
    } catch (error) {
      console.error('Get player assessments error:', error);
      res.status(500).json({ message: 'Failed to get player assessments' });
    }
  });

  // GET /api/assessments/world/:worldId/summary
  router.get('/assessments/world/:worldId/summary', async (req: Request, res: Response) => {
    try {
      const { worldId } = req.params;

      const sessions = await getAssessmentQuestsFromPlaythroughs(storage, { worldId });
      const completedSessions = sessions.filter(s => s.status === 'complete');

      const byType: Record<string, number> = {};
      const cefrDistribution: Record<string, number> = {};
      let totalScore = 0;

      for (const s of completedSessions) {
        byType[s.assessmentType] = (byType[s.assessmentType] ?? 0) + 1;
        if (s.cefrLevel) {
          cefrDistribution[s.cefrLevel] = (cefrDistribution[s.cefrLevel] ?? 0) + 1;
        }
        totalScore += s.totalScore ?? 0;
      }

      res.json({
        worldId,
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        byType,
        cefrDistribution,
        averageScore: completedSessions.length > 0
          ? totalScore / completedSessions.length
          : 0,
      });
    } catch (error) {
      console.error('Get world assessment summary error:', error);
      res.status(500).json({ message: 'Failed to get world assessment summary' });
    }
  });

  // GET /api/assessments/:sessionId/transcripts
  router.get('/assessments/:sessionId/transcripts', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const quest = await storage.getQuest(sessionId);
      if (!quest || !isAssessmentQuest(quest)) {
        return res.status(404).json({ message: 'Assessment quest not found' });
      }

      const overlay = extractOverlayAssessmentData(quest);
      if (!overlay) {
        return res.status(404).json({ message: 'No assessment data found for this quest' });
      }

      const transcripts = overlay.phaseResults
        .filter(pr => {
          const taskResults = pr.taskResults ?? [];
          return taskResults.some(tr => tr.playerAnswer) || (pr as any).transcript;
        })
        .map(pr => ({
          phaseId: pr.phaseId,
          entries: (pr as any).transcript ?? pr.taskResults.map((tr: any) => ({
            taskId: tr.taskId,
            playerAnswer: tr.playerAnswer,
            score: tr.score,
            maxPoints: tr.maxPoints,
          })),
          completedAt: pr.completedAt,
        }));

      res.json({ sessionId, transcripts });
    } catch (error) {
      console.error('Get assessment transcripts error:', error);
      res.status(500).json({ message: 'Failed to get assessment transcripts' });
    }
  });

  // GET /api/assessments/:sessionId
  router.get('/assessments/:sessionId', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const quest = await storage.getQuest(sessionId);
      if (!quest || !isAssessmentQuest(quest)) {
        return res.status(404).json({ message: 'Assessment quest not found' });
      }

      const overlay = extractOverlayAssessmentData(quest);
      if (!overlay) {
        return res.json({
          id: quest.id,
          playerId: quest.assignedTo ?? '',
          worldId: quest.worldId,
          assessmentType: getAssessmentType(quest),
          targetLanguage: quest.targetLanguage ?? 'unknown',
          status: quest.status === 'completed' ? 'complete' : 'in_progress',
          phaseResults: [],
          totalScore: 0,
          totalMaxPoints: 0,
          cefrLevel: null,
          dimensionScores: {},
          completedAt: null,
          createdAt: (quest as any).createdAt ?? null,
        });
      }

      res.json(overlayToSessionFormat(quest, overlay));
    } catch (error) {
      console.error('Get assessment session error:', error);
      res.status(500).json({ message: 'Failed to get assessment session' });
    }
  });

  return router;
}
