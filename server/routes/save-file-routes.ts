/**
 * Save File API Routes
 *
 * CRUD endpoints for the unified save file system.
 * Each save file is a self-contained game state document that includes
 * an embedded world snapshot, current game state, compressed conversations,
 * and an append-only playtrace log.
 */

import type { Express } from 'express';
import { storage } from '../db/storage.js';
import { generateWorldSnapshot, createInitialGameState } from '../services/snapshot-generator.js';
import type { SaveFile } from '../../shared/save-file.js';

export function registerSaveFileRoutes(app: Express) {

  // Generate a world snapshot (for debugging/inspection, or client-side save creation)
  app.get('/api/worlds/:worldId/snapshot', async (req, res) => {
    try {
      const snapshot = await generateWorldSnapshot(req.params.worldId);
      res.json(snapshot);
    } catch (error) {
      console.error('Failed to generate world snapshot:', error);
      res.status(500).json({ error: 'Failed to generate world snapshot', details: (error as Error).message });
    }
  });

  // Start a new game — generates snapshot from DB and creates a save file in one step
  app.post('/api/worlds/:worldId/saves/new-game', async (req, res) => {
    try {
      const userId = (req as any).userId || 'anonymous';
      const { slotIndex, name } = req.body;

      const worldSnapshot = await generateWorldSnapshot(req.params.worldId);
      console.log(`[new-game] Snapshot ready: ${worldSnapshot.characters.length} chars, ${worldSnapshot.lots.length} lots, ${worldSnapshot.quests.length} quests`);
      const snapshotSize = JSON.stringify(worldSnapshot).length;
      console.log(`[new-game] Snapshot size: ${(snapshotSize / 1024).toFixed(0)} KB`);
      const currentState = createInitialGameState();

      console.log('[new-game] Saving to database...');
      const save = await storage.createSaveFile({
        userId,
        worldId: req.params.worldId,
        slotIndex: slotIndex ?? 0,
        name: name || `${worldSnapshot.world.name} - New Game`,
        version: 1,
        status: 'active',
        totalPlaytime: 0,
        saveCount: 0,
        worldSnapshot,
        currentState,
        conversations: [],
      });

      // Store the initial playtrace in the separate collection
      await storage.appendPlaytraces(save.id, [{
        timestamp: new Date().toISOString(),
        action: 'game_started',
        description: 'New game started',
        details: { worldName: worldSnapshot.world.name },
      }]);

      // Return save ID + summary (not the full snapshot, which could be huge)
      res.status(201).json({
        id: save.id,
        slotIndex: save.slotIndex,
        name: save.name,
        worldName: worldSnapshot.world.name,
        characterCount: worldSnapshot.characters.length,
        settlementCount: worldSnapshot.settlements.length,
        lotCount: worldSnapshot.lots.length,
        questCount: worldSnapshot.quests.length,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Save slot already in use' });
      }
      console.error('Failed to start new game:', error);
      res.status(500).json({ error: 'Failed to start new game', details: error.message });
    }
  });

  // List save files for a user + world
  app.get('/api/worlds/:worldId/saves', async (req, res) => {
    try {
      const userId = (req as any).userId || 'anonymous';
      const saves = await storage.getSaveFilesByUser(userId, req.params.worldId);
      // Return metadata only (not the full worldSnapshot)
      const summaries = saves.map((s: any) => ({
        id: s.id,
        slotIndex: s.slotIndex,
        name: s.name,
        status: s.status,
        totalPlaytime: s.totalPlaytime,
        saveCount: s.saveCount,
        createdAt: s.createdAt,
        lastSavedAt: s.lastSavedAt,
        worldName: s.worldSnapshot?.world?.name,
        playtraceCount: s.playtraces?.length || 0,
        conversationCount: s.conversations?.length || 0,
      }));
      res.json(summaries);
    } catch (error) {
      console.error('Failed to list save files:', error);
      res.status(500).json({ error: 'Failed to list save files' });
    }
  });

  // Get a save file by ID (full document)
  app.get('/api/saves/:saveId', async (req, res) => {
    try {
      const save = await storage.getSaveFile(req.params.saveId);
      if (!save) return res.status(404).json({ error: 'Save file not found' });
      res.json(save);
    } catch (error) {
      console.error('Failed to load save file:', error);
      res.status(500).json({ error: 'Failed to load save file' });
    }
  });

  // Get a save file by slot
  app.get('/api/worlds/:worldId/saves/slot/:slotIndex', async (req, res) => {
    try {
      const userId = (req as any).userId || 'anonymous';
      const slotIndex = parseInt(req.params.slotIndex);
      const save = await storage.getSaveFileBySlot(userId, req.params.worldId, slotIndex);
      if (!save) return res.status(404).json({ error: 'No save in this slot' });
      res.json(save);
    } catch (error) {
      console.error('Failed to load save file:', error);
      res.status(500).json({ error: 'Failed to load save file' });
    }
  });

  // Create a new save file (start new game)
  app.post('/api/worlds/:worldId/saves', async (req, res) => {
    try {
      const userId = (req as any).userId || 'anonymous';
      const { slotIndex, name, worldSnapshot, currentState } = req.body;

      if (!worldSnapshot) {
        return res.status(400).json({ error: 'worldSnapshot is required' });
      }

      const save = await storage.createSaveFile({
        userId,
        worldId: req.params.worldId,
        slotIndex: slotIndex ?? 0,
        name: name || 'Save Game',
        version: 1,
        status: 'active',
        totalPlaytime: 0,
        saveCount: 0,
        worldSnapshot,
        currentState: currentState || {},
        conversations: [],
        playtraces: [],
      });

      res.status(201).json({ id: save.id, slotIndex: save.slotIndex });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Save slot already in use' });
      }
      console.error('Failed to create save file:', error);
      res.status(500).json({ error: 'Failed to create save file' });
    }
  });

  // Update save file (save game)
  app.put('/api/saves/:saveId', async (req, res) => {
    try {
      const { currentState, conversations, totalPlaytime } = req.body;
      const updates: any = {};
      if (currentState !== undefined) updates.currentState = currentState;
      if (conversations !== undefined) updates.conversations = conversations;
      if (totalPlaytime !== undefined) updates.totalPlaytime = totalPlaytime;

      const save = await storage.updateSaveFile(req.params.saveId, updates);
      if (!save) return res.status(404).json({ error: 'Save file not found' });
      res.json({ id: save.id, lastSavedAt: save.lastSavedAt, saveCount: save.saveCount });
    } catch (error) {
      console.error('Failed to save game:', error);
      res.status(500).json({ error: 'Failed to save game' });
    }
  });

  // Append playtraces (separate endpoint so traces can be batched without overwriting state)
  app.post('/api/saves/:saveId/playtraces', async (req, res) => {
    try {
      const { traces } = req.body;
      if (!Array.isArray(traces) || traces.length === 0) {
        return res.status(400).json({ error: 'traces array is required' });
      }
      const ok = await storage.appendPlaytraces(req.params.saveId, traces);
      if (!ok) return res.status(404).json({ error: 'Save file not found' });
      res.json({ appended: traces.length });
    } catch (error) {
      console.error('Failed to append playtraces:', error);
      res.status(500).json({ error: 'Failed to append playtraces' });
    }
  });

  // Delete a save file
  app.delete('/api/saves/:saveId', async (req, res) => {
    try {
      const ok = await storage.deleteSaveFile(req.params.saveId);
      if (!ok) return res.status(404).json({ error: 'Save file not found' });
      res.json({ deleted: true });
    } catch (error) {
      console.error('Failed to delete save file:', error);
      res.status(500).json({ error: 'Failed to delete save file' });
    }
  });
}
