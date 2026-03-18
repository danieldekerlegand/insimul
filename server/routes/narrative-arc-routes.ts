/**
 * Narrative Arc API Routes
 *
 * Endpoints for creating, querying, and progressing main quest narrative arcs.
 */

import { Router, type Request, type Response } from 'express';
import { narrativeArcManager } from '../services/narrative-arc-manager.js';
import { listNarrativeArcTemplates } from '../services/narrative-arc-templates.js';

export function createNarrativeArcRoutes(): Router {
  const router = Router();

  /**
   * GET /api/narrative-arcs/templates
   * List available narrative arc templates.
   */
  router.get('/narrative-arcs/templates', (_req: Request, res: Response) => {
    const templates = listNarrativeArcTemplates();
    res.json(templates);
  });

  /**
   * POST /api/worlds/:worldId/narrative-arc
   * Create a new narrative arc for a player in a world.
   * Body: { templateId, targetLanguage, assignedTo, assignedToCharacterId? }
   */
  router.post(
    '/worlds/:worldId/narrative-arc',
    async (req: Request, res: Response) => {
      try {
        const { worldId } = req.params;
        const { templateId, targetLanguage, assignedTo, assignedToCharacterId } =
          req.body;

        if (!templateId || !targetLanguage || !assignedTo) {
          return res.status(400).json({
            error: 'Missing required fields: templateId, targetLanguage, assignedTo',
          });
        }

        const arc = await narrativeArcManager.createArc(
          templateId,
          worldId,
          targetLanguage,
          assignedTo,
          assignedToCharacterId,
        );

        if (!arc) {
          return res.status(409).json({
            error:
              'Could not create arc. Template not found or player already has an active arc.',
          });
        }

        res.status(201).json(arc);
      } catch (err: any) {
        console.error('[NarrativeArc] Error creating arc:', err);
        res.status(500).json({ error: err.message });
      }
    },
  );

  /**
   * GET /api/worlds/:worldId/narrative-arc/:playerName
   * Get the narrative arc for a player.
   */
  router.get(
    '/worlds/:worldId/narrative-arc/:playerName',
    async (req: Request, res: Response) => {
      try {
        const { worldId, playerName } = req.params;
        const arc = await narrativeArcManager.getArcForPlayer(
          worldId,
          playerName,
        );

        if (!arc) {
          return res.status(404).json({ error: 'No narrative arc found' });
        }

        res.json(arc);
      } catch (err: any) {
        console.error('[NarrativeArc] Error fetching arc:', err);
        res.status(500).json({ error: err.message });
      }
    },
  );

  /**
   * POST /api/worlds/:worldId/narrative-arc/:playerName/refresh
   * Refresh arc progress after quest completion.
   * Body: { playerCefrLevel? }
   */
  router.post(
    '/worlds/:worldId/narrative-arc/:playerName/refresh',
    async (req: Request, res: Response) => {
      try {
        const { worldId, playerName } = req.params;
        const { playerCefrLevel } = req.body || {};

        const arc = await narrativeArcManager.refreshArcProgress(
          worldId,
          playerName,
          playerCefrLevel,
        );

        if (!arc) {
          return res.status(404).json({ error: 'No narrative arc found' });
        }

        res.json(arc);
      } catch (err: any) {
        console.error('[NarrativeArc] Error refreshing arc:', err);
        res.status(500).json({ error: err.message });
      }
    },
  );

  /**
   * GET /api/worlds/:worldId/narrative-arc/:playerName/current-chapter
   * Get the current chapter's quests.
   */
  router.get(
    '/worlds/:worldId/narrative-arc/:playerName/current-chapter',
    async (req: Request, res: Response) => {
      try {
        const { worldId, playerName } = req.params;
        const result = await narrativeArcManager.getCurrentChapterQuests(
          worldId,
          playerName,
        );

        if (!result.chapter) {
          return res.status(404).json({ error: 'No active chapter found' });
        }

        res.json(result);
      } catch (err: any) {
        console.error('[NarrativeArc] Error getting chapter:', err);
        res.status(500).json({ error: err.message });
      }
    },
  );

  /**
   * GET /api/worlds/:worldId/narrative-arc/:playerName/quests
   * Get all main quest subquests for a player.
   */
  router.get(
    '/worlds/:worldId/narrative-arc/:playerName/quests',
    async (req: Request, res: Response) => {
      try {
        const { worldId, playerName } = req.params;
        const quests = await narrativeArcManager.getMainQuestSubQuests(
          worldId,
          playerName,
        );
        res.json(quests);
      } catch (err: any) {
        console.error('[NarrativeArc] Error fetching quests:', err);
        res.status(500).json({ error: err.message });
      }
    },
  );

  /**
   * DELETE /api/worlds/:worldId/narrative-arc/:playerName
   * Delete a player's narrative arc and all associated quests.
   */
  router.delete(
    '/worlds/:worldId/narrative-arc/:playerName',
    async (req: Request, res: Response) => {
      try {
        const { worldId, playerName } = req.params;
        const deleted = await narrativeArcManager.deleteArc(worldId, playerName);

        if (!deleted) {
          return res.status(404).json({ error: 'No narrative arc found' });
        }

        res.json({ success: true });
      } catch (err: any) {
        console.error('[NarrativeArc] Error deleting arc:', err);
        res.status(500).json({ error: err.message });
      }
    },
  );

  return router;
}
