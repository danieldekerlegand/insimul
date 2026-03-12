/**
 * Game Export API Routes
 *
 * Endpoints for generating Intermediate Representation (IR) documents
 * and triggering engine-specific exports.
 */

import type { Express } from 'express';
import { generateWorldIR } from '../services/game-export/ir-generator';
import type { TargetEngine } from '@shared/game-engine/asset-pipeline';
import { buildWorldAssetManifest } from '../services/game-export/asset-resolver';
import { exportUnrealProject } from '../services/game-export/unreal/unreal-exporter';
import { exportUnityProject } from '../services/game-export/unity/unity-exporter';
import { exportGodotProject } from '../services/game-export/godot/godot-exporter';
import { exportBabylonProject, exportBabylonProjectAsZip as packageBabylonExport } from '../services/game-export/babylon/babylon-exporter-new';
import type { ExportTelemetryConfig } from '../services/game-export/telemetry-config';

export function registerExportRoutes(app: Express): void {

  /**
   * POST /api/worlds/:worldId/export/ir
   *
   * Generate and return the full Intermediate Representation for a world.
   * This is the primary endpoint consumed by engine-specific exporters.
   */
  app.post('/api/worlds/:worldId/export/ir', async (req, res) => {
    try {
      const { worldId } = req.params;
      console.log(`[Export] Generating IR for world ${worldId}...`);

      const startTime = Date.now();
      const engine = (req.body.engine || 'babylon') as TargetEngine;
      const ir = await generateWorldIR(worldId, engine);
      const elapsed = Date.now() - startTime;

      console.log(`[Export] IR generated for world ${worldId} (engine: ${engine}) in ${elapsed}ms`);
      console.log(`[Export]   ${ir.geography.settlements.length} settlements, ${ir.entities.characters.length} characters, ${ir.entities.buildings.length} buildings, ${ir.entities.roads.length} roads`);
      console.log(`[Export]   ${ir.systems.rules.length} rules, ${ir.systems.actions.length} actions, ${ir.systems.quests.length} quests`);

      res.json({
        success: true,
        generationTimeMs: elapsed,
        ir,
      });
    } catch (error: any) {
      console.error('[Export] IR generation failed:', error);
      res.status(error.message?.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message || 'IR generation failed',
      });
    }
  });

  /**
   * GET /api/worlds/:worldId/export/ir
   *
   * Same as POST but via GET for convenience (e.g. browser download).
   */
  app.get('/api/worlds/:worldId/export/ir', async (req, res) => {
    try {
      const { worldId } = req.params;
      const engine = (req.query.engine as TargetEngine) || 'babylon';
      const ir = await generateWorldIR(worldId, engine);

      // Set content-disposition for download
      const filename = `${ir.meta.worldName.replace(/[^a-zA-Z0-9_-]/g, '_')}_ir.json`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json');
      res.json(ir);
    } catch (error: any) {
      res.status(error.message?.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message || 'IR generation failed',
      });
    }
  });

  /**
   * GET /api/worlds/:worldId/export/ir/summary
   *
   * Returns a lightweight summary of the IR (counts, sizes) without the full data.
   * Useful for preview/estimation before committing to a full export.
   */
  app.get('/api/worlds/:worldId/export/ir/summary', async (req, res) => {
    try {
      const { worldId } = req.params;
      const engine = (req.query.engine as TargetEngine) || 'babylon';
      const startTime = Date.now();
      const ir = await generateWorldIR(worldId, engine);
      const elapsed = Date.now() - startTime;

      const irJson = JSON.stringify(ir);
      const sizeBytes = Buffer.byteLength(irJson, 'utf8');

      res.json({
        success: true,
        generationTimeMs: elapsed,
        summary: {
          worldName: ir.meta.worldName,
          worldType: ir.meta.worldType,
          genreId: ir.meta.genreConfig.id,
          terrainSize: ir.geography.terrainSize,
          exportVersion: ir.meta.exportVersion,
          counts: {
            countries: ir.geography.countries.length,
            states: ir.geography.states.length,
            settlements: ir.geography.settlements.length,
            characters: ir.entities.characters.length,
            npcs: ir.entities.npcs.length,
            buildings: ir.entities.buildings.length,
            businesses: ir.entities.businesses.length,
            roads: ir.entities.roads.length,
            rules: ir.systems.rules.length,
            baseRules: ir.systems.baseRules.length,
            actions: ir.systems.actions.length,
            baseActions: ir.systems.baseActions.length,
            quests: ir.systems.quests.length,
            truths: ir.systems.truths.length,
            grammars: ir.systems.grammars.length,
            languages: ir.systems.languages.length,
            textures: ir.assets.textures.length,
            models: ir.assets.models.length,
            audio: ir.assets.audio.length,
          },
          irSizeBytes: sizeBytes,
          irSizeKB: Math.round(sizeBytes / 1024),
        },
      });
    } catch (error: any) {
      res.status(error.message?.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message || 'IR summary failed',
      });
    }
  });

  /**
   * POST /api/worlds/:worldId/export/:engine
   *
   * Engine-specific project export.
   * - Unreal: generates a full UE5 project (C++, DataTables, configs) as ZIP
   * - Unity/Godot: placeholder (returns IR with engine-specific asset resolution)
   */
  app.post('/api/worlds/:worldId/export/:engine', async (req, res) => {
    // Increase timeout for export operations (5 minutes)
    req.setTimeout(300000);

    try {
      const { worldId, engine } = req.params;
      const supportedEngines = ['babylon', 'unreal', 'unity', 'godot'];

      if (!supportedEngines.includes(engine)) {
        return res.status(400).json({
          success: false,
          error: `Unsupported engine: ${engine}. Supported: ${supportedEngines.join(', ')}`,
        });
      }

      // ── Resolve telemetry config if provided ──
      let telemetryConfig: ExportTelemetryConfig | undefined;
      if (req.body.telemetry?.enabled) {
        const { serverUrl, apiKeyId } = req.body.telemetry;
        let resolvedApiKey = '';

        // Look up the actual API key from the ID
        if (apiKeyId) {
          try {
            const { storage } = await import(/* webpackIgnore: true */ '../db/storage.js' as any);
            const keys = await storage.getApiKeysByWorld(worldId);
            const found = keys.find((k: any) => k.id === apiKeyId);
            if (found?.key) {
              resolvedApiKey = found.key;
            }
          } catch (err) {
            console.warn('[Export] Failed to resolve telemetry API key:', err);
          }
        }

        telemetryConfig = {
          enabled: true,
          serverUrl: serverUrl || `${req.protocol}://${req.get('host')}`,
          apiKey: resolvedApiKey,
          batchSize: 25,
          flushIntervalMs: 30_000,
        };
        console.log(`[Export] Telemetry enabled for export (serverUrl: ${telemetryConfig.serverUrl})`);
      }

      // ── Babylon.js: IR JSON bundle as ZIP ──
      if (engine === 'babylon') {
        const format = req.body.format || req.query.format || 'zip';
        const mode = req.body.mode || req.query.mode || 'web';
        
        if (mode !== 'web' && mode !== 'electron') {
          return res.status(400).json({
            success: false,
            error: `Invalid mode: ${mode}. Supported: web, electron`,
          });
        }

        console.log(`[Export] Generating Babylon.js ${mode} project for world ${worldId}...`);
        const zipBuffer = await exportBabylonProject(worldId, { mode, telemetry: telemetryConfig });

        // Get world IR for filename
        const ir = await generateWorldIR(worldId);
        const filename = `${ir.meta.worldName.replace(/\s+/g, '_')}_Babylon_${mode}.zip`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Length', zipBuffer.length.toString());
        return res.send(zipBuffer);
      }

      // ── Unreal: full project export ──
      if (engine === 'unreal') {
        const format = req.body.format || req.query.format || 'zip';

        console.log(`[Export] Generating Unreal project for world ${worldId}...`);
        const result = await exportUnrealProject(worldId, { telemetry: telemetryConfig });

        console.log(`[Export] Unreal project generated: ${result.stats.totalFiles} files, ${result.stats.cppFiles} C++, ${result.stats.dataFiles} data, ${Math.round(result.stats.totalSizeBytes / 1024)}KB in ${result.stats.generationTimeMs}ms`);

        if (format === 'zip' && result.zipBuffer) {
          const filename = `${result.projectName}.zip`;
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Length', result.zipBuffer.length.toString());
          return res.send(result.zipBuffer);
        }

        // JSON format: return file listing + stats (no binary ZIP)
        return res.json({
          success: true,
          engine: 'unreal',
          status: 'project_generated',
          projectName: result.projectName,
          stats: result.stats,
          files: result.files.map(f => ({
            path: f.path,
            sizeBytes: Buffer.byteLength(f.content, 'utf8'),
          })),
          message: result.zipBuffer
            ? 'Project generated. Use format=zip to download as ZIP.'
            : 'Project generated. Install "archiver" npm package to enable ZIP download.',
        });
      }

      // ── Unity: full project export ──
      if (engine === 'unity') {
        const format = req.body.format || req.query.format || 'zip';

        console.log(`[Export] Generating Unity project for world ${worldId}...`);
        const result = await exportUnityProject(worldId, { telemetry: telemetryConfig });

        console.log(`[Export] Unity project generated: ${result.stats.totalFiles} files, ${result.stats.csharpFiles} C#, ${result.stats.dataFiles} data, ${Math.round(result.stats.totalSizeBytes / 1024)}KB in ${result.stats.generationTimeMs}ms`);

        if (format === 'zip' && result.zipBuffer) {
          const filename = `${result.projectName}.zip`;
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Length', result.zipBuffer.length.toString());
          return res.send(result.zipBuffer);
        }

        return res.json({
          success: true,
          engine: 'unity',
          status: 'project_generated',
          projectName: result.projectName,
          stats: result.stats,
          files: result.files.map(f => ({
            path: f.path,
            sizeBytes: Buffer.byteLength(f.content, 'utf8'),
          })),
          message: result.zipBuffer
            ? 'Project generated. Use format=zip to download as ZIP.'
            : 'Project generated. Install "archiver" npm package to enable ZIP download.',
        });
      }

      // ── Godot: full project export ──
      if (engine === 'godot') {
        const format = req.body.format || req.query.format || 'zip';

        console.log(`[Export] Generating Godot project for world ${worldId}...`);
        const result = await exportGodotProject(worldId, { telemetry: telemetryConfig });

        console.log(`[Export] Godot project generated: ${result.stats.totalFiles} files, ${result.stats.gdscriptFiles} GDScript, ${result.stats.dataFiles} data, ${Math.round(result.stats.totalSizeBytes / 1024)}KB in ${result.stats.generationTimeMs}ms`);

        if (format === 'zip' && result.zipBuffer) {
          const filename = `${result.projectName}.zip`;
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Length', result.zipBuffer.length.toString());
          return res.send(result.zipBuffer);
        }

        return res.json({
          success: true,
          engine: 'godot',
          status: 'project_generated',
          projectName: result.projectName,
          stats: result.stats,
          files: result.files.map(f => ({
            path: f.path,
            sizeBytes: Buffer.byteLength(f.content, 'utf8'),
          })),
          message: result.zipBuffer
            ? 'Project generated. Use format=zip to download as ZIP.'
            : 'Project generated. Install "archiver" npm package to enable ZIP download.',
        });
      }

      // Fallback (should not reach here)
      res.status(400).json({ success: false, error: `Unhandled engine: ${engine}` });
    } catch (error: any) {
      console.error(`[Export] ${req.params.engine} export failed:`, error);
      res.status(error.message?.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message || 'Export failed',
      });
    }
  });

  /**
   * GET /api/worlds/:worldId/export/:engine/download
   *
   * Direct browser download endpoint — opens in a new tab to trigger native download.
   */
  app.get('/api/worlds/:worldId/export/:engine/download', async (req, res) => {
    // Increase timeout for export operations (5 minutes)
    req.setTimeout(300000);
    
    try {
      const { worldId, engine } = req.params;
      const supportedEngines = ['babylon', 'unreal', 'unity', 'godot'];

      if (!supportedEngines.includes(engine)) {
        return res.status(400).json({ error: `Unsupported engine: ${engine}` });
      }

      if (engine === 'babylon') {
        const mode = req.query.mode || 'web';
        
        if (mode !== 'web' && mode !== 'electron') {
          return res.status(400).json({ error: `Invalid mode: ${mode}. Supported: web, electron` });
        }
        
        const zipBuffer = await packageBabylonExport(worldId, { mode });
        if (!zipBuffer) return res.status(500).json({ error: 'ZIP generation failed' });
        
        // Get world IR for filename
        const ir = await generateWorldIR(worldId);
        const filename = `${ir.meta.worldName.replace(/\s+/g, '_')}_Babylon_${mode}.zip`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Length', zipBuffer.length.toString());
        return res.send(zipBuffer);
      }

      if (engine === 'unreal') {
        const result = await exportUnrealProject(worldId);
        if (!result.zipBuffer) return res.status(500).json({ error: 'ZIP generation failed' });
        res.setHeader('Content-Disposition', `attachment; filename="${result.projectName}.zip"`);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Length', result.zipBuffer.length.toString());
        return res.send(result.zipBuffer);
      }

      if (engine === 'unity') {
        const result = await exportUnityProject(worldId);
        if (!result.zipBuffer) return res.status(500).json({ error: 'ZIP generation failed' });
        res.setHeader('Content-Disposition', `attachment; filename="${result.projectName}.zip"`);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Length', result.zipBuffer.length.toString());
        return res.send(result.zipBuffer);
      }

      if (engine === 'godot') {
        const result = await exportGodotProject(worldId);
        if (!result.zipBuffer) return res.status(500).json({ error: 'ZIP generation failed' });
        res.setHeader('Content-Disposition', `attachment; filename="${result.projectName}.zip"`);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Length', result.zipBuffer.length.toString());
        return res.send(result.zipBuffer);
      }

      res.status(400).json({ error: `Unhandled engine: ${engine}` });
    } catch (error: any) {
      console.error(`[Export] ${req.params.engine} download failed:`, error);
      res.status(500).json({ error: error.message || 'Export failed' });
    }
  });

  /**
   * GET /api/worlds/:worldId/export/asset-manifest
   *
   * Returns the resolved asset manifest for a given engine.
   * Shows which assets are engine-overrides, babylon-fallbacks, or procedural.
   */
  app.get('/api/worlds/:worldId/export/asset-manifest', async (req, res) => {
    try {
      const { worldId } = req.params;
      const engine = (req.query.engine as TargetEngine) || 'babylon';

      const { manifest, snapshot } = await buildWorldAssetManifest(worldId, engine);

      res.json({
        success: true,
        engine,
        hasCollection: !!snapshot,
        manifest,
      });
    } catch (error: any) {
      res.status(error.message?.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message || 'Asset manifest generation failed',
      });
    }
  });
}
