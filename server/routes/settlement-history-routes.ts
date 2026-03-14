/**
 * Settlement History Routes (US-066)
 *
 * Provides endpoints for tracking and querying settlement changes
 * over simulation time.
 */

import { Router, type Request, type Response } from 'express';

export function createSettlementHistoryRoutes(storage: any): Router {
  const router = Router();

  // GET /api/settlements/:settlementId/history — get history for a settlement
  router.get('/settlements/:settlementId/history', async (req: Request, res: Response) => {
    try {
      const { settlementId } = req.params;
      const { eventType, category, significance, minYear, maxYear } = req.query;

      let events = await storage.getSettlementHistoryBySettlement(settlementId);

      if (eventType) {
        events = events.filter((e: any) => e.eventType === eventType);
      }
      if (category) {
        events = events.filter((e: any) => e.category === category);
      }
      if (significance) {
        events = events.filter((e: any) => e.significance === significance);
      }
      if (minYear) {
        const min = parseInt(minYear as string, 10);
        events = events.filter((e: any) => e.year != null && e.year >= min);
      }
      if (maxYear) {
        const max = parseInt(maxYear as string, 10);
        events = events.filter((e: any) => e.year != null && e.year <= max);
      }

      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/worlds/:worldId/settlement-history — get all settlement history for a world
  router.get('/worlds/:worldId/settlement-history', async (req: Request, res: Response) => {
    try {
      const { worldId } = req.params;
      const { settlementId, eventType, category } = req.query;

      let events = await storage.getSettlementHistoryByWorld(worldId);

      if (settlementId) {
        events = events.filter((e: any) => e.settlementId === settlementId);
      }
      if (eventType) {
        events = events.filter((e: any) => e.eventType === eventType);
      }
      if (category) {
        events = events.filter((e: any) => e.category === category);
      }

      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/settlements/:settlementId/history/summary — aggregated history stats
  router.get('/settlements/:settlementId/history/summary', async (req: Request, res: Response) => {
    try {
      const { settlementId } = req.params;
      const events = await storage.getSettlementHistoryBySettlement(settlementId);

      const byCategory: Record<string, number> = {};
      const byEventType: Record<string, number> = {};
      const bySignificance: Record<string, number> = {};
      let minYear: number | null = null;
      let maxYear: number | null = null;

      for (const event of events) {
        byCategory[event.category] = (byCategory[event.category] || 0) + 1;
        byEventType[event.eventType] = (byEventType[event.eventType] || 0) + 1;
        bySignificance[event.significance || 'minor'] = (bySignificance[event.significance || 'minor'] || 0) + 1;
        if (event.year != null) {
          if (minYear === null || event.year < minYear) minYear = event.year;
          if (maxYear === null || event.year > maxYear) maxYear = event.year;
        }
      }

      res.json({
        totalEvents: events.length,
        minYear,
        maxYear,
        byCategory,
        byEventType,
        bySignificance,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/settlements/:settlementId/history — record a history event
  router.post('/settlements/:settlementId/history', async (req: Request, res: Response) => {
    try {
      const { settlementId } = req.params;
      const { worldId, eventType, category, year, timestep, description, previousValue, newValue, significance, relatedCharacterIds, tags } = req.body;

      if (!worldId || !eventType || !category || !description) {
        return res.status(400).json({ error: 'Missing required fields: worldId, eventType, category, description' });
      }

      const event = await storage.createSettlementHistoryEvent({
        worldId,
        settlementId,
        eventType,
        category,
        year: year ?? null,
        timestep: timestep ?? null,
        description,
        previousValue: previousValue ?? null,
        newValue: newValue ?? null,
        significance: significance ?? 'minor',
        relatedCharacterIds: relatedCharacterIds ?? [],
        tags: tags ?? [],
      });

      res.status(201).json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/settlement-history/:id — delete a history event
  router.delete('/settlement-history/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSettlementHistoryEvent(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Settlement history event not found' });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
