/**
 * History Import/Export API Routes (US-3.06)
 *
 * Provides endpoints for exporting and importing world history data,
 * including truths, historical events, and genealogy data.
 * Supports JSON and CSV formats.
 */

import { Router, type Request, type Response } from 'express';

interface TruthRecord {
  id: string;
  worldId: string;
  characterId?: string;
  title: string;
  content: string;
  entryType: string;
  timestep: number;
  timestepDuration?: number;
  timeYear?: number;
  timeSeason?: string;
  timeDescription?: string;
  historicalEra?: string;
  historicalSignificance?: string;
  causesTruthIds?: string[];
  causedByTruthIds?: string[];
  relatedCharacterIds?: string[];
  relatedLocationIds?: string[];
  tags?: string[];
  importance?: number;
  isPublic?: boolean;
  source?: string;
  sourceData?: Record<string, unknown>;
}

interface HistoryExportData {
  version: string;
  exportedAt: string;
  worldId: string;
  metadata: {
    historyStartYear?: number;
    historyEndYear?: number;
    currentGameYear?: number;
    timestepUnit?: string;
    totalTruths: number;
    totalHistoricalEvents: number;
    eras: string[];
  };
  truths: TruthRecord[];
}

interface HistoryImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

const EXPORT_VERSION = '1.0.0';

export function createHistoryRoutes(storage: any): Router {
  const router = Router();

  // ============= EXPORT =============

  // GET /api/worlds/:worldId/history/export — export full history as JSON
  router.get('/worlds/:worldId/history/export', async (req: Request, res: Response) => {
    try {
      const { worldId } = req.params;
      const format = (req.query.format as string) ?? 'json';
      const eraFilter = req.query.era as string | undefined;
      const significanceFilter = req.query.significance as string | undefined;
      const minImportance = req.query.minImportance
        ? parseInt(req.query.minImportance as string, 10)
        : undefined;

      const [world, allTruths] = await Promise.all([
        storage.getWorld(worldId),
        storage.getTruthsByWorld(worldId),
      ]);

      if (!world) {
        return res.status(404).json({ error: 'World not found' });
      }

      // Filter truths
      let truths: TruthRecord[] = allTruths;

      if (eraFilter) {
        truths = truths.filter((t: TruthRecord) => t.historicalEra === eraFilter);
      }
      if (significanceFilter) {
        truths = truths.filter((t: TruthRecord) => t.historicalSignificance === significanceFilter);
      }
      if (minImportance != null) {
        truths = truths.filter((t: TruthRecord) => (t.importance ?? 5) >= minImportance);
      }

      const historicalTruths = truths.filter((t: TruthRecord) =>
        t.entryType === 'history' || t.entryType === 'event' || t.entryType === 'milestone' || t.historicalEra
      );

      const eras = new Set<string>();
      for (const t of truths) {
        if (t.historicalEra) eras.add(t.historicalEra);
      }

      if (format === 'prolog') {
        // Export as Prolog knowledge base
        const lines: string[] = [
          `% History KB for world ${worldId}`,
          `% Exported ${new Date().toISOString()}`,
          `% ${truths.length} truth entries`,
          '',
        ];

        for (const t of truths) {
          const safeTitle = t.title.replace(/'/g, "\\'");
          const safeContent = t.content.replace(/'/g, "\\'").replace(/\n/g, ' ');
          lines.push(`% ${t.title}`);
          lines.push(`historical_event('${t.id}', '${safeTitle}', '${t.entryType}', ${t.timeYear ?? 0}, ${t.importance ?? 5}).`);
          if (t.historicalEra) {
            lines.push(`event_era('${t.id}', '${t.historicalEra}').`);
          }
          if (t.historicalSignificance) {
            lines.push(`event_significance('${t.id}', '${t.historicalSignificance}').`);
          }
          for (const charId of t.relatedCharacterIds ?? []) {
            lines.push(`event_involves('${t.id}', '${charId}').`);
          }
          for (const causeId of t.causesTruthIds ?? []) {
            lines.push(`event_causes('${t.id}', '${causeId}').`);
          }
          lines.push(`event_content('${t.id}', '${safeContent}').`);
          lines.push('');
        }

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="history-${worldId}.pl"`);
        return res.send(lines.join('\n'));
      }

      if (format === 'narrative') {
        // Export as chronological narrative text
        const sorted = [...truths].sort((a, b) => (a.timeYear ?? a.timestep) - (b.timeYear ?? b.timestep));
        const paragraphs: string[] = [];
        let currentEra = '';

        for (const t of sorted) {
          if (t.historicalEra && t.historicalEra !== currentEra) {
            currentEra = t.historicalEra;
            const eraName = currentEra.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            paragraphs.push(`\n--- ${eraName} ---\n`);
          }
          const yearPrefix = t.timeYear ? `[${t.timeYear}] ` : '';
          paragraphs.push(`${yearPrefix}${t.title}: ${t.content}`);
        }

        const narrative = paragraphs.join('\n\n');
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="history-${worldId}.txt"`);
        return res.send(narrative);
      }

      if (format === 'csv') {
        const csvRows = [
          ['id', 'title', 'content', 'entryType', 'timeYear', 'timeSeason', 'historicalEra',
           'historicalSignificance', 'importance', 'tags', 'relatedCharacterIds', 'source'].join(','),
        ];

        for (const t of truths) {
          csvRows.push([
            escapeCsv(t.id),
            escapeCsv(t.title),
            escapeCsv(t.content),
            escapeCsv(t.entryType),
            t.timeYear?.toString() ?? '',
            escapeCsv(t.timeSeason ?? ''),
            escapeCsv(t.historicalEra ?? ''),
            escapeCsv(t.historicalSignificance ?? ''),
            (t.importance ?? 5).toString(),
            escapeCsv((t.tags ?? []).join(';')),
            escapeCsv((t.relatedCharacterIds ?? []).join(';')),
            escapeCsv(t.source ?? ''),
          ].join(','));
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="history-${worldId}.csv"`);
        return res.send(csvRows.join('\n'));
      }

      // JSON export
      const exportData: HistoryExportData = {
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        worldId,
        metadata: {
          historyStartYear: world.historyStartYear,
          historyEndYear: world.historyEndYear,
          currentGameYear: world.currentGameYear,
          timestepUnit: world.timestepUnit,
          totalTruths: truths.length,
          totalHistoricalEvents: historicalTruths.length,
          eras: Array.from(eras),
        },
        truths,
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="history-${worldId}.json"`);
      res.json(exportData);
    } catch (error: any) {
      console.error('History export error:', error);
      res.status(500).json({ error: error.message ?? 'Export failed' });
    }
  });

  // ============= IMPORT =============

  // POST /api/worlds/:worldId/history/import — import history from JSON
  router.post('/worlds/:worldId/history/import', async (req: Request, res: Response) => {
    try {
      const { worldId } = req.params;
      const mode = (req.query.mode as string) ?? 'merge'; // merge | replace | append
      const data = req.body as HistoryExportData;

      if (!data.version || !data.truths) {
        return res.status(400).json({ error: 'Invalid import format. Expected { version, truths: [...] }' });
      }

      const world = await storage.getWorld(worldId);
      if (!world) {
        return res.status(404).json({ error: 'World not found' });
      }

      const result: HistoryImportResult = { imported: 0, skipped: 0, errors: [] };

      // In replace mode, delete existing truths first
      if (mode === 'replace') {
        const existing: TruthRecord[] = await storage.getTruthsByWorld(worldId);
        for (const t of existing) {
          try {
            await storage.deleteTruth(t.id);
          } catch {
            // Ignore deletion errors
          }
        }
      }

      // Build set of existing truth titles for merge dedup
      let existingTitles = new Set<string>();
      if (mode === 'merge') {
        const existing: TruthRecord[] = await storage.getTruthsByWorld(worldId);
        existingTitles = new Set(existing.map((t: TruthRecord) => `${t.title}|${t.timeYear ?? ''}`));
      }

      // Mapping from old IDs to new IDs for causal chain fixup
      const idMap = new Map<string, string>();

      for (const truth of data.truths) {
        try {
          // In merge mode, skip duplicates by title+year
          const dedupKey = `${truth.title}|${truth.timeYear ?? ''}`;
          if (mode === 'merge' && existingTitles.has(dedupKey)) {
            result.skipped++;
            continue;
          }

          // Create truth with new worldId, let DB assign new ID
          const created = await storage.createTruth({
            worldId,
            characterId: truth.characterId,
            title: truth.title,
            content: truth.content,
            entryType: truth.entryType,
            timestep: truth.timestep ?? 0,
            timestepDuration: truth.timestepDuration,
            timeYear: truth.timeYear,
            timeSeason: truth.timeSeason,
            timeDescription: truth.timeDescription,
            historicalEra: truth.historicalEra,
            historicalSignificance: truth.historicalSignificance,
            causesTruthIds: [], // Fixed up in second pass
            causedByTruthIds: [],
            relatedCharacterIds: truth.relatedCharacterIds ?? [],
            relatedLocationIds: truth.relatedLocationIds ?? [],
            tags: truth.tags ?? [],
            importance: truth.importance ?? 5,
            isPublic: truth.isPublic ?? true,
            source: truth.source ?? 'imported',
            sourceData: truth.sourceData ?? {},
          });

          idMap.set(truth.id, created.id);
          result.imported++;
        } catch (err: any) {
          result.errors.push(`Failed to import "${truth.title}": ${err.message}`);
        }
      }

      // Second pass: fix up causal chain IDs
      for (const truth of data.truths) {
        const newId = idMap.get(truth.id);
        if (!newId) continue;

        const causesTruthIds = (truth.causesTruthIds ?? [])
          .map(oldId => idMap.get(oldId))
          .filter((id): id is string => id != null);
        const causedByTruthIds = (truth.causedByTruthIds ?? [])
          .map(oldId => idMap.get(oldId))
          .filter((id): id is string => id != null);

        if (causesTruthIds.length > 0 || causedByTruthIds.length > 0) {
          try {
            await storage.updateTruth(newId, { causesTruthIds, causedByTruthIds });
          } catch {
            // Non-fatal: causal links are nice-to-have
          }
        }
      }

      // Update world timeline metadata if provided
      if (data.metadata) {
        const updates: Record<string, unknown> = {};
        if (data.metadata.historyStartYear != null && !world.historyStartYear) {
          updates.historyStartYear = data.metadata.historyStartYear;
        }
        if (data.metadata.historyEndYear != null && !world.historyEndYear) {
          updates.historyEndYear = data.metadata.historyEndYear;
        }
        if (Object.keys(updates).length > 0) {
          try {
            await storage.updateWorld(worldId, updates);
          } catch {
            // Non-fatal
          }
        }
      }

      res.json({
        success: true,
        result,
        idMapping: Object.fromEntries(idMap),
      });
    } catch (error: any) {
      console.error('History import error:', error);
      res.status(500).json({ error: error.message ?? 'Import failed' });
    }
  });

  // ============= HISTORY SUMMARY =============

  // GET /api/worlds/:worldId/history/summary — get aggregated history stats
  router.get('/worlds/:worldId/history/summary', async (req: Request, res: Response) => {
    try {
      const { worldId } = req.params;
      const truths: TruthRecord[] = await storage.getTruthsByWorld(worldId);

      const historicalTruths = truths.filter((t: TruthRecord) =>
        t.entryType === 'history' || t.entryType === 'event' || t.entryType === 'milestone' || t.historicalEra
      );

      // Group by era
      const byEra: Record<string, number> = {};
      const bySignificance: Record<string, number> = {};
      const byEntryType: Record<string, number> = {};
      const years = new Set<number>();

      for (const t of historicalTruths) {
        if (t.historicalEra) {
          byEra[t.historicalEra] = (byEra[t.historicalEra] ?? 0) + 1;
        }
        if (t.historicalSignificance) {
          bySignificance[t.historicalSignificance] = (bySignificance[t.historicalSignificance] ?? 0) + 1;
        }
        byEntryType[t.entryType] = (byEntryType[t.entryType] ?? 0) + 1;
        if (t.timeYear != null) {
          years.add(t.timeYear);
        }
      }

      const yearArray = Array.from(years).sort((a, b) => a - b);

      // Count causal connections
      let causalConnections = 0;
      for (const t of historicalTruths) {
        causalConnections += (t.causesTruthIds?.length ?? 0);
      }

      res.json({
        totalTruths: truths.length,
        historicalEvents: historicalTruths.length,
        yearRange: yearArray.length > 0
          ? { start: yearArray[0], end: yearArray[yearArray.length - 1] }
          : null,
        byEra,
        bySignificance,
        byEntryType,
        causalConnections,
        uniqueYears: yearArray.length,
      });
    } catch (error: any) {
      console.error('History summary error:', error);
      res.status(500).json({ error: error.message ?? 'Failed to get summary' });
    }
  });

  return router;
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
