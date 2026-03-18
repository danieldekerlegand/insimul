import type { Express } from "express";
import { storage } from '../db/storage';
import { AuthService } from "../services/auth-service";
import { canAccessWorld, canEditWorld } from "../middleware/permissions";
import * as ReputationService from "../services/reputation-service";
import { exportPlaythrough, importPlaythrough, validatePortableSave } from "../services/playthrough-portable";

export function registerPlaythroughRoutes(app: Express) {

  // ===== PLAYTHROUGH ROUTES =====

  // Start a new playthrough
  app.post("/api/worlds/:worldId/playthroughs/start", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { worldId } = req.params;
      const { name, description } = req.body;

      // Check if user can access this world
      if (!(await canAccessWorld(payload.userId, worldId))) {
        return res.status(403).json({ message: "You don't have access to this world" });
      }

      // Get world to capture snapshot version
      const world = await storage.getWorld(worldId);
      if (!world) {
        return res.status(404).json({ message: "World not found" });
      }

      // Check for existing active playthrough
      const existing = await storage.getUserPlaythroughForWorld(payload.userId, worldId);
      if (existing) {
        // Return existing playthrough instead of creating a new one
        return res.json(existing);
      }

      // Create new playthrough
      const playthrough = await storage.createPlaythrough({
        userId: payload.userId,
        worldId,
        worldSnapshotVersion: world.version || 1,
        name: name || `${world.name} Playthrough`,
        description,
        status: 'active',
      });

      res.status(201).json(playthrough);
    } catch (error) {
      console.error("Start playthrough error:", error);
      res.status(500).json({ message: "Failed to start playthrough" });
    }
  });

  // Get all playthroughs for the current user (across all worlds)
  app.get("/api/playthroughs/my", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthroughs = await storage.getPlaythroughsByUser(payload.userId);

      // Enrich with world information
      const enrichedPlaythroughs = await Promise.all(
        playthroughs.map(async (playthrough) => {
          const world = await storage.getWorld(playthrough.worldId);
          return {
            ...playthrough,
            worldName: world?.name || 'Unknown World',
            worldVisibility: world?.visibility,
          };
        })
      );

      res.json(enrichedPlaythroughs);
    } catch (error) {
      console.error("Get user playthroughs error:", error);
      res.status(500).json({ message: "Failed to get playthroughs" });
    }
  });

  // Get user's playthroughs for a world
  app.get("/api/worlds/:worldId/playthroughs", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { worldId } = req.params;

      // Check if user can access this world
      if (!(await canAccessWorld(payload.userId, worldId))) {
        return res.status(403).json({ message: "You don't have access to this world" });
      }

      const playthroughs = await storage.getPlaythroughsByUser(payload.userId);
      const worldPlaythroughs = playthroughs.filter(p => p.worldId === worldId);

      res.json(worldPlaythroughs);
    } catch (error) {
      console.error("Get playthroughs error:", error);
      res.status(500).json({ message: "Failed to get playthroughs" });
    }
  });

  // Get a specific playthrough
  app.get("/api/playthroughs/:id", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership
      if (playthrough.userId !== payload.userId) {
        // Also allow world owner to view playthroughs
        const canEdit = await canEditWorld(payload.userId, playthrough.worldId);
        if (!canEdit) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      res.json(playthrough);
    } catch (error) {
      console.error("Get playthrough error:", error);
      res.status(500).json({ message: "Failed to get playthrough" });
    }
  });

  // Update a playthrough
  app.patch("/api/playthroughs/:id", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership
      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "You can only update your own playthroughs" });
      }

      const updated = await storage.updatePlaythrough(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update playthrough error:", error);
      res.status(500).json({ message: "Failed to update playthrough" });
    }
  });

  // Delete a playthrough
  app.delete("/api/playthroughs/:id", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership
      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "You can only delete your own playthroughs" });
      }

      await storage.deletePlaythrough(req.params.id);
      res.json({ message: "Playthrough deleted" });
    } catch (error) {
      console.error("Delete playthrough error:", error);
      res.status(500).json({ message: "Failed to delete playthrough" });
    }
  });

  // ===== PLAYTHROUGH DELTA ROUTES =====

  // Get deltas for a playthrough
  app.get("/api/playthroughs/:id/deltas", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership or world ownership
      if (playthrough.userId !== payload.userId) {
        const canEdit = await canEditWorld(payload.userId, playthrough.worldId);
        if (!canEdit) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const deltas = await storage.getDeltasByPlaythrough(req.params.id);
      res.json(deltas);
    } catch (error) {
      console.error("Get deltas error:", error);
      res.status(500).json({ message: "Failed to get deltas" });
    }
  });

  // Create a delta (record a change in playthrough)
  app.post("/api/playthroughs/:id/deltas", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership
      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const delta = await storage.createPlaythroughDelta({
        playthroughId: req.params.id,
        ...req.body,
      });

      res.status(201).json(delta);
    } catch (error) {
      console.error("Create delta error:", error);
      res.status(500).json({ message: "Failed to create delta" });
    }
  });

  // ===== PLAY TRACE ROUTES =====

  // Get play traces for a playthrough
  app.get("/api/playthroughs/:id/traces", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership or world ownership
      if (playthrough.userId !== payload.userId) {
        const canEdit = await canEditWorld(payload.userId, playthrough.worldId);
        if (!canEdit) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const traces = await storage.getTracesByPlaythrough(req.params.id);
      res.json(traces);
    } catch (error) {
      console.error("Get traces error:", error);
      res.status(500).json({ message: "Failed to get traces" });
    }
  });

  // Create a play trace (record a player action)
  app.post("/api/playthroughs/:id/traces", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership
      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const trace = await storage.createPlayTrace({
        playthroughId: req.params.id,
        userId: payload.userId,
        ...req.body,
      });

      // Update playthrough action count
      await storage.updatePlaythrough(req.params.id, {
        actionsCount: (playthrough.actionsCount || 0) + 1,
        lastPlayedAt: new Date(),
      });

      res.status(201).json(trace);
    } catch (error) {
      console.error("Create trace error:", error);
      res.status(500).json({ message: "Failed to create trace" });
    }
  });

  // ===== REPUTATION ROUTES =====

  // Get all reputations for a playthrough
  app.get("/api/playthroughs/:id/reputations", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership
      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const reputations = await ReputationService.getPlaythroughReputations(req.params.id);

      // Enrich with settlement names
      const enrichedReputations = await Promise.all(
        reputations.map(async (rep) => {
          let entityName = 'Unknown';
          if (rep.entityType === 'settlement') {
            const settlement = await storage.getSettlement(rep.entityId);
            entityName = settlement?.name || 'Unknown Settlement';
          }
          return {
            ...rep,
            entityName
          };
        })
      );

      res.json(enrichedReputations);
    } catch (error) {
      console.error("Get reputations error:", error);
      res.status(500).json({ message: "Failed to get reputations" });
    }
  });

  // Get reputation for a specific entity (settlement/faction)
  app.get("/api/playthroughs/:id/reputations/:entityType/:entityId", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership
      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { entityType, entityId } = req.params;
      const reputation = await ReputationService.getOrCreateReputation(
        req.params.id,
        payload.userId,
        entityType,
        entityId
      );

      res.json(reputation);
    } catch (error) {
      console.error("Get reputation error:", error);
      res.status(500).json({ message: "Failed to get reputation" });
    }
  });

  // Record a rule violation
  app.post("/api/playthroughs/:id/reputations/:entityType/:entityId/violate", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership
      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { entityType, entityId } = req.params;
      const { violationType, severity, ruleId, description } = req.body;

      if (!violationType || !severity) {
        return res.status(400).json({ message: "violationType and severity are required" });
      }

      const result = await ReputationService.recordViolation(
        req.params.id,
        payload.userId,
        entityType,
        entityId,
        {
          violationType,
          severity,
          ruleId,
          description
        }
      );

      res.json(result);
    } catch (error) {
      console.error("Record violation error:", error);
      res.status(500).json({ message: "Failed to record violation" });
    }
  });

  // Manually adjust reputation (for quests, rewards, etc.)
  app.post("/api/playthroughs/:id/reputations/:entityType/:entityId/adjust", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership
      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { entityType, entityId } = req.params;
      const { amount, reason } = req.body;

      if (typeof amount !== 'number' || !reason) {
        return res.status(400).json({ message: "amount and reason are required" });
      }

      const updated = await ReputationService.adjustReputation(
        req.params.id,
        payload.userId,
        entityType,
        entityId,
        { amount, reason }
      );

      res.json(updated);
    } catch (error) {
      console.error("Adjust reputation error:", error);
      res.status(500).json({ message: "Failed to adjust reputation" });
    }
  });

  // Check ban status
  app.get("/api/playthroughs/:id/reputations/:entityType/:entityId/ban-status", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership
      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { entityType, entityId } = req.params;
      const banStatus = await ReputationService.checkBanStatus(
        req.params.id,
        entityType,
        entityId
      );

      res.json(banStatus);
    } catch (error) {
      console.error("Check ban status error:", error);
      res.status(500).json({ message: "Failed to check ban status" });
    }
  });

  // Pay fines
  app.post("/api/playthroughs/:id/reputations/:entityType/:entityId/pay-fines", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      // Check ownership
      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { entityType, entityId } = req.params;
      const { amount } = req.body;

      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Valid payment amount is required" });
      }

      const updated = await ReputationService.payFines(
        req.params.id,
        entityType,
        entityId,
        amount
      );

      res.json(updated);
    } catch (error) {
      console.error("Pay fines error:", error);
      res.status(500).json({ message: "Failed to pay fines" });
    }
  });

  // ===== WORLD OWNER ANALYTICS =====

  // Get all playthroughs for a world (owner only)
  app.get("/api/worlds/:worldId/analytics/playthroughs", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { worldId } = req.params;

      // Check if user is the world owner
      if (!(await canEditWorld(payload.userId, worldId))) {
        return res.status(403).json({ message: "Only world owner can view analytics" });
      }

      const playthroughs = await storage.getPlaythroughsByWorld(worldId);
      res.json(playthroughs);
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  // Check world access (helper endpoint for UI)
  app.get("/api/worlds/:worldId/access", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      const payload = token ? AuthService.verifyToken(token) : null;

      const { worldId } = req.params;
      const world = await storage.getWorld(worldId);

      if (!world) {
        return res.status(404).json({ message: "World not found" });
      }

      const canAccess = await canAccessWorld(payload?.userId, worldId);
      const canEdit = payload ? await canEditWorld(payload.userId, worldId) : false;

      res.json({
        canAccess,
        canEdit,
        isOwner: payload ? world.ownerId === payload.userId : false,
        visibility: world.visibility,
        requiresAuth: world.requiresAuth,
      });
    } catch (error) {
      console.error("Check access error:", error);
      res.status(500).json({ message: "Failed to check access" });
    }
  });

  // ===== GAME STATE SAVE/LOAD =====

  // Save game state to a slot
  app.post("/api/worlds/:worldId/game-state", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { worldId } = req.params;
      const { playthroughId, slotIndex, state } = req.body;

      if (!playthroughId || slotIndex == null || !state) {
        return res.status(400).json({ message: "playthroughId, slotIndex, and state are required" });
      }

      if (slotIndex < 0 || slotIndex > 2) {
        return res.status(400).json({ message: "slotIndex must be 0, 1, or 2" });
      }

      // Verify playthrough ownership
      const playthrough = await storage.getPlaythrough(playthroughId);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }
      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "Not your playthrough" });
      }
      if (playthrough.worldId !== worldId) {
        return res.status(400).json({ message: "Playthrough does not belong to this world" });
      }

      // Store state in playthrough's saveData keyed by slot
      const saveData = (playthrough.saveData as Record<string, any>) || {};
      saveData[`slot_${slotIndex}`] = state;

      await storage.updatePlaythrough(playthroughId, {
        saveData,
        lastPlayedAt: new Date(),
      });

      res.json({ success: true, slotIndex, savedAt: state.savedAt });
    } catch (error) {
      console.error("Save game state error:", error);
      res.status(500).json({ message: "Failed to save game state" });
    }
  });

  // Load game state from a slot
  app.get("/api/worlds/:worldId/game-state", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { worldId } = req.params;
      const playthroughId = req.query.playthroughId as string;
      const slotIndex = parseInt(req.query.slotIndex as string, 10);

      if (!playthroughId || isNaN(slotIndex)) {
        return res.status(400).json({ message: "playthroughId and slotIndex query params required" });
      }

      // Verify playthrough ownership
      const playthrough = await storage.getPlaythrough(playthroughId);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }
      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "Not your playthrough" });
      }
      if (playthrough.worldId !== worldId) {
        return res.status(400).json({ message: "Playthrough does not belong to this world" });
      }

      const saveData = (playthrough.saveData as Record<string, any>) || {};
      const state = saveData[`slot_${slotIndex}`] || null;

      res.json({ state });
    } catch (error) {
      console.error("Load game state error:", error);
      res.status(500).json({ message: "Failed to load game state" });
    }
  });

  // ===== PORTABLE SAVE EXPORT/IMPORT =====

  // Export a playthrough as a portable save file
  app.get("/api/playthroughs/:id/export", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      if (playthrough.userId !== payload.userId) {
        return res.status(403).json({ message: "You can only export your own playthroughs" });
      }

      const includeTraces = req.query.includeTraces !== 'false';
      const portable = await exportPlaythrough(req.params.id, { includeTraces });

      const filename = `playthrough-${(playthrough.name || 'save').replace(/[^a-zA-Z0-9-_]/g, '_')}.json`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json');
      res.json(portable);
    } catch (error) {
      console.error("Export playthrough error:", error);
      res.status(500).json({ message: "Failed to export playthrough" });
    }
  });

  // Import a portable save file into a world
  app.post("/api/worlds/:worldId/playthroughs/import", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { worldId } = req.params;

      if (!(await canAccessWorld(payload.userId, worldId))) {
        return res.status(403).json({ message: "You don't have access to this world" });
      }

      const saveData = req.body;
      const validationError = validatePortableSave(saveData);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      const playthrough = await importPlaythrough(saveData, payload.userId, worldId);
      res.status(201).json(playthrough);
    } catch (error) {
      console.error("Import playthrough error:", error);
      res.status(500).json({ message: "Failed to import playthrough" });
    }
  });
}
