import type { Express } from 'express';
import { exportResearchData, researchDataToCsv } from '../services/research-export';

export function registerResearchExportRoutes(app: Express): void {
  /**
   * POST /api/worlds/:worldId/research/export
   *
   * Export anonymized research data for a world.
   * Body options:
   *   format: "json" | "csv" (default: "json")
   *   includeCharacters: boolean (default: true)
   *   includeTraces: boolean (default: true)
   *   includeDeltas: boolean (default: false)
   *   includeReputations: boolean (default: true)
   */
  app.post('/api/worlds/:worldId/research/export', async (req, res) => {
    try {
      const { worldId } = req.params;
      const {
        format = 'json',
        includeCharacters,
        includeTraces,
        includeDeltas,
        includeReputations,
      } = req.body;

      if (format !== 'json' && format !== 'csv') {
        return res.status(400).json({
          success: false,
          error: `Unsupported format: ${format}. Supported: json, csv`,
        });
      }

      const result = await exportResearchData({
        worldId,
        format,
        includeCharacters,
        includeTraces,
        includeDeltas,
        includeReputations,
      });

      if (format === 'csv') {
        const csvData = researchDataToCsv(result.data);
        res.setHeader('Content-Type', 'application/json');
        return res.json({
          success: true,
          exportedAt: result.exportedAt,
          anonymizationSalt: result.anonymizationSalt,
          worldId: result.worldId,
          csvFiles: csvData,
        });
      }

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('[ResearchExport] Export failed:', error);
      res.status(error.message?.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message || 'Research export failed',
      });
    }
  });

  /**
   * GET /api/worlds/:worldId/research/export/download
   *
   * Download anonymized research data as a JSON file.
   */
  app.get('/api/worlds/:worldId/research/export/download', async (req, res) => {
    try {
      const { worldId } = req.params;
      const format = (req.query.format as string) || 'json';

      if (format !== 'json' && format !== 'csv') {
        return res.status(400).json({
          success: false,
          error: `Unsupported format: ${format}. Supported: json, csv`,
        });
      }

      const result = await exportResearchData({
        worldId,
        format: format as 'json' | 'csv',
        includeCharacters: req.query.includeCharacters !== 'false',
        includeTraces: req.query.includeTraces !== 'false',
        includeDeltas: req.query.includeDeltas === 'true',
        includeReputations: req.query.includeReputations !== 'false',
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `research_export_${timestamp}.json`;

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json');
      res.json(result);
    } catch (error: any) {
      console.error('[ResearchExport] Download failed:', error);
      res.status(error.message?.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message || 'Research export download failed',
      });
    }
  });
}
