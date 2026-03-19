import type { Express } from "express";
import { storage } from '../db/storage';
import { AuthService } from "../services/auth-service";
import { canAccessWorld, canEditWorld } from "../middleware/permissions";
import * as ReputationService from "../services/reputation-service";
import { accumulateMetrics, isDecisionAction, getMetricsSnapshot } from "../services/playthrough-metrics";
import { exportPlaythrough, importPlaythrough, validatePortableSave } from "../services/playthrough-portable";
import { checkSnapshotCompatibility } from "@shared/world-snapshot-version";
import { computeCrossPlaythroughAnalytics } from "../services/playthrough-analytics";
import {
  bumpVersionWithAlerts,
  getActiveAlertsForUser,
  dismissAlertsForPlaythrough,
} from "../services/version-alert-service";
import { completePlaythrough } from "../services/playthrough-completion";
import {
  setRelationship,
  getRelationshipStrength,
  getCharacterRelationships,
  modifyRelationship,
} from "../extensions/tott/relationship-utils";

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

  // Complete a playthrough — generates journey summary and updates status
  app.post("/api/playthroughs/:id/complete", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const result = await completePlaythrough(req.params.id, payload.userId);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Playthrough not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Not your playthrough') {
        return res.status(403).json({ message: error.message });
      }
      if (error.message === 'Playthrough already completed') {
        return res.status(409).json({ message: error.message });
      }
      console.error("Complete playthrough error:", error);
      res.status(500).json({ message: "Failed to complete playthrough" });
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

  // Compact deltas for a playthrough (merge redundant deltas per entity)
  app.post("/api/playthroughs/:id/deltas/compact", async (req, res) => {
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
        return res.status(403).json({ message: "Access denied" });
      }

      const result = await storage.compactDeltasByPlaythrough(req.params.id);
      res.json(result);
    } catch (error) {
      console.error("Compact deltas error:", error);
      res.status(500).json({ message: "Failed to compact deltas" });
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

      // Update playthrough action count and decisions count
      const deltas: { actions: number; decisions: number } = {
        actions: 1,
        decisions: isDecisionAction(req.body.actionType) ? 1 : 0,
      };
      await accumulateMetrics(req.params.id, deltas);

      res.status(201).json(trace);
    } catch (error) {
      console.error("Create trace error:", error);
      res.status(500).json({ message: "Failed to create trace" });
    }
  });

  // Batch create play traces (for efficient client-side batching)
  app.post("/api/playthroughs/:id/traces/batch", async (req, res) => {
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
        return res.status(403).json({ message: "Access denied" });
      }

      const { traces } = req.body;
      if (!Array.isArray(traces) || traces.length === 0) {
        return res.status(400).json({ message: "traces array is required" });
      }

      if (traces.length > 500) {
        return res.status(400).json({ message: "Maximum 500 traces per batch" });
      }

      const created = await Promise.all(
        traces.map((trace: any) =>
          storage.createPlayTrace({
            playthroughId: req.params.id,
            userId: payload.userId,
            actionType: trace.actionType,
            actionName: trace.actionName,
            actionData: trace.actionData,
            timestep: trace.timestep ?? 0,
            characterId: trace.characterId,
            targetId: trace.targetId,
            targetType: trace.targetType,
            locationId: trace.locationId,
            outcome: trace.outcome,
            outcomeData: trace.outcomeData,
            durationMs: trace.durationMs,
            timestamp: trace.timestamp ? new Date(trace.timestamp) : new Date(),
          })
        )
      );

      // Update playthrough action count
      await storage.updatePlaythrough(req.params.id, {
        actionsCount: (playthrough.actionsCount || 0) + created.length,
        lastPlayedAt: new Date(),
      });

      res.status(201).json({ inserted: created.length });
    } catch (error) {
      console.error("Batch create traces error:", error);
      res.status(500).json({ message: "Failed to create traces" });
    }
  });

  // ===== PLAYTHROUGH METRICS =====

  // Sync accumulated metrics (playtime, actions, decisions) from the client
  app.post("/api/playthroughs/:id/metrics", async (req, res) => {
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
        return res.status(403).json({ message: "Access denied" });
      }

      const { playtimeSeconds, actions, decisions } = req.body;

      // Validate inputs are non-negative numbers if provided
      if (playtimeSeconds !== undefined && (typeof playtimeSeconds !== 'number' || playtimeSeconds < 0)) {
        return res.status(400).json({ message: "playtimeSeconds must be a non-negative number" });
      }
      if (actions !== undefined && (typeof actions !== 'number' || actions < 0)) {
        return res.status(400).json({ message: "actions must be a non-negative number" });
      }
      if (decisions !== undefined && (typeof decisions !== 'number' || decisions < 0)) {
        return res.status(400).json({ message: "decisions must be a non-negative number" });
      }

      const updated = await accumulateMetrics(req.params.id, {
        playtimeSeconds,
        actions,
        decisions,
      });

      res.json({ metrics: getMetricsSnapshot(updated || playthrough) });
    } catch (error) {
      console.error("Sync metrics error:", error);
      res.status(500).json({ message: "Failed to sync metrics" });
    }
  });

  // Get current metrics snapshot for a playthrough
  app.get("/api/playthroughs/:id/metrics", async (req, res) => {
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
        const canEdit = await canEditWorld(payload.userId, playthrough.worldId);
        if (!canEdit) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      res.json({ metrics: getMetricsSnapshot(playthrough) });
    } catch (error) {
      console.error("Get metrics error:", error);
      res.status(500).json({ message: "Failed to get metrics" });
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

  // Get aggregated cross-playthrough analytics for a world (owner only)
  app.get("/api/worlds/:worldId/analytics/playthroughs/summary", async (req, res) => {
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

      if (!(await canEditWorld(payload.userId, worldId))) {
        return res.status(403).json({ message: "Only world owner can view analytics" });
      }

      const playthroughs = await storage.getPlaythroughsByWorld(worldId);
      const analytics = computeCrossPlaythroughAnalytics(playthroughs);
      res.json(analytics);
    } catch (error) {
      console.error("Get cross-playthrough analytics error:", error);
      res.status(500).json({ message: "Failed to get cross-playthrough analytics" });
    }
  });

  // Get detailed journey analytics for a specific playthrough (owner only)
  app.get("/api/worlds/:worldId/analytics/playthroughs/:playthroughId/journey", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { worldId, playthroughId } = req.params;

      if (!(await canEditWorld(payload.userId, worldId))) {
        return res.status(403).json({ message: "Only world owner can view analytics" });
      }

      const playthrough = await storage.getPlaythrough(playthroughId);
      if (!playthrough || playthrough.worldId !== worldId) {
        return res.status(404).json({ message: "Playthrough not found" });
      }

      const [traces, deltas, reputations] = await Promise.all([
        storage.getTracesByPlaythrough(playthroughId),
        storage.getDeltasByPlaythrough(playthroughId),
        storage.getReputationsByPlaythrough(playthroughId),
      ]);

      // Action type breakdown
      const actionBreakdown: Record<string, number> = {};
      const outcomeBreakdown: Record<string, number> = {};
      const locationVisits: Record<string, number> = {};
      const timelineEvents: Array<{
        id: string;
        timestep: number;
        actionType: string;
        actionName: string | null;
        outcome: string | null;
        locationId: string | null;
        targetType: string | null;
        narrativeText: string | null;
        durationMs: number | null;
        timestamp: string | Date | null;
      }> = [];

      for (const trace of traces) {
        // Action breakdown
        const aType = trace.actionType || 'unknown';
        actionBreakdown[aType] = (actionBreakdown[aType] || 0) + 1;

        // Outcome breakdown
        const outcome = trace.outcome || 'unknown';
        outcomeBreakdown[outcome] = (outcomeBreakdown[outcome] || 0) + 1;

        // Location visits
        if (trace.locationId) {
          locationVisits[trace.locationId] = (locationVisits[trace.locationId] || 0) + 1;
        }

        // Timeline events
        timelineEvents.push({
          id: trace.id,
          timestep: trace.timestep,
          actionType: trace.actionType,
          actionName: trace.actionName,
          outcome: trace.outcome,
          locationId: trace.locationId,
          targetType: trace.targetType,
          narrativeText: trace.narrativeText,
          durationMs: trace.durationMs,
          timestamp: trace.timestamp,
        });
      }

      // Delta summary by entity type
      const deltaBreakdown: Record<string, { creates: number; updates: number; deletes: number }> = {};
      for (const delta of deltas) {
        if (!deltaBreakdown[delta.entityType]) {
          deltaBreakdown[delta.entityType] = { creates: 0, updates: 0, deletes: 0 };
        }
        const op = delta.operation as 'create' | 'update' | 'delete';
        if (op === 'create') deltaBreakdown[delta.entityType].creates++;
        else if (op === 'update') deltaBreakdown[delta.entityType].updates++;
        else if (op === 'delete') deltaBreakdown[delta.entityType].deletes++;
      }

      // Average action duration
      const durations = traces.filter(t => t.durationMs != null).map(t => t.durationMs!);
      const avgDurationMs = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null;

      // Actions per timestep for engagement chart
      const actionsPerTimestep: Record<number, number> = {};
      for (const trace of traces) {
        actionsPerTimestep[trace.timestep] = (actionsPerTimestep[trace.timestep] || 0) + 1;
      }

      res.json({
        playthrough,
        summary: {
          totalTraces: traces.length,
          totalDeltas: deltas.length,
          totalReputations: reputations.length,
          avgDurationMs,
          uniqueLocations: Object.keys(locationVisits).length,
          uniqueActionTypes: Object.keys(actionBreakdown).length,
        },
        actionBreakdown,
        outcomeBreakdown,
        locationVisits,
        deltaBreakdown,
        actionsPerTimestep,
        reputations,
        timeline: timelineEvents,
      });
    } catch (error) {
      console.error("Get journey analytics error:", error);
      res.status(500).json({ message: "Failed to get journey analytics" });
    }
  });

  // Compare multiple playthroughs (owner only) — returns traces and stats for selected playthroughs
  app.get("/api/worlds/:worldId/analytics/compare", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const { worldId } = req.params;
      if (!(await canEditWorld(payload.userId, worldId))) {
        return res.status(403).json({ message: "Only world owner can compare playthroughs" });
      }

      const idsParam = req.query.ids;
      if (!idsParam || typeof idsParam !== 'string') {
        return res.status(400).json({ message: "ids query parameter required (comma-separated)" });
      }
      const ids = idsParam.split(',').filter(Boolean);
      if (ids.length < 2) {
        return res.status(400).json({ message: "At least 2 playthrough IDs required for comparison" });
      }
      if (ids.length > 10) {
        return res.status(400).json({ message: "Maximum 10 playthroughs can be compared at once" });
      }

      const results = await Promise.all(
        ids.map(async (id) => {
          const playthrough = await storage.getPlaythrough(id);
          if (!playthrough || playthrough.worldId !== worldId) return null;
          const traces = await storage.getTracesByPlaythrough(id);

          // Aggregate trace data by action type
          const actionTypeCounts: Record<string, number> = {};
          const outcomeCounts: Record<string, number> = {};
          let totalDurationMs = 0;
          let traceCount = 0;
          for (const t of traces) {
            actionTypeCounts[t.actionType] = (actionTypeCounts[t.actionType] || 0) + 1;
            if (t.outcome) outcomeCounts[t.outcome] = (outcomeCounts[t.outcome] || 0) + 1;
            if (t.durationMs) totalDurationMs += t.durationMs;
            traceCount++;
          }

          return {
            playthrough: {
              id: playthrough.id,
              userId: playthrough.userId,
              name: playthrough.name,
              status: playthrough.status,
              playtime: playthrough.playtime,
              actionsCount: playthrough.actionsCount,
              decisionsCount: playthrough.decisionsCount,
              currentTimestep: playthrough.currentTimestep,
              createdAt: playthrough.createdAt,
              lastPlayedAt: playthrough.lastPlayedAt,
              completedAt: playthrough.completedAt,
            },
            traceStats: {
              totalTraces: traceCount,
              actionTypeCounts,
              outcomeCounts,
              avgDurationMs: traceCount > 0 ? Math.round(totalDurationMs / traceCount) : 0,
            },
          };
        })
      );

      res.json(results.filter(Boolean));
    } catch (error) {
      console.error("Compare playthroughs error:", error);
      res.status(500).json({ message: "Failed to compare playthroughs" });
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

  // ===== PLAYTHROUGH RELATIONSHIP ROUTES =====

  // Get all relationships for a character within a playthrough (merged base + overlay)
  app.get("/api/playthroughs/:id/relationships/:characterId", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) return res.status(404).json({ message: "Playthrough not found" });
      if (playthrough.userId !== payload.userId) {
        const canEdit = await canEditWorld(payload.userId, playthrough.worldId);
        if (!canEdit) return res.status(403).json({ message: "Access denied" });
      }

      const relationships = await getCharacterRelationships(req.params.characterId, req.params.id);
      res.json(relationships);
    } catch (error) {
      console.error("Get playthrough relationships error:", error);
      res.status(500).json({ message: "Failed to get relationships" });
    }
  });

  // Get relationship strength between two characters within a playthrough
  app.get("/api/playthroughs/:id/relationships/:fromId/:toId", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) return res.status(404).json({ message: "Playthrough not found" });
      if (playthrough.userId !== payload.userId) {
        const canEdit = await canEditWorld(payload.userId, playthrough.worldId);
        if (!canEdit) return res.status(403).json({ message: "Access denied" });
      }

      const strength = await getRelationshipStrength(req.params.fromId, req.params.toId, req.params.id);
      res.json({ fromCharacterId: req.params.fromId, toCharacterId: req.params.toId, strength });
    } catch (error) {
      console.error("Get relationship strength error:", error);
      res.status(500).json({ message: "Failed to get relationship strength" });
    }
  });

  // Set a relationship within a playthrough (writes to overlay, not base world)
  app.put("/api/playthroughs/:id/relationships/:fromId/:toId", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) return res.status(404).json({ message: "Playthrough not found" });
      if (playthrough.userId !== payload.userId) return res.status(403).json({ message: "Access denied" });

      const { type, strength, reciprocal } = req.body;
      if (!type || typeof strength !== 'number') {
        return res.status(400).json({ message: "type and strength are required" });
      }

      await setRelationship(req.params.fromId, req.params.toId, type, strength, reciprocal, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Set playthrough relationship error:", error);
      res.status(500).json({ message: "Failed to set relationship" });
    }
  });

  // Modify a relationship within a playthrough (incremental change to overlay)
  app.post("/api/playthroughs/:id/relationships/:fromId/:toId/modify", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) return res.status(404).json({ message: "Playthrough not found" });
      if (playthrough.userId !== payload.userId) return res.status(403).json({ message: "Access denied" });

      const { change, cause } = req.body;
      if (typeof change !== 'number') {
        return res.status(400).json({ message: "change (number) is required" });
      }

      await modifyRelationship(req.params.fromId, req.params.toId, change, cause, req.params.id);
      const newStrength = await getRelationshipStrength(req.params.fromId, req.params.toId, req.params.id);
      res.json({ success: true, newStrength });
    } catch (error) {
      console.error("Modify playthrough relationship error:", error);
      res.status(500).json({ message: "Failed to modify relationship" });
    }
  });

  // Get all relationship overlays for a playthrough (raw overlay data)
  app.get("/api/playthroughs/:id/relationship-overlays", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) return res.status(404).json({ message: "Playthrough not found" });
      if (playthrough.userId !== payload.userId) {
        const canEdit = await canEditWorld(payload.userId, playthrough.worldId);
        if (!canEdit) return res.status(403).json({ message: "Access denied" });
      }

      const overlays = await storage.getPlaythroughRelationshipsByPlaythrough(req.params.id);
      res.json(overlays);
    } catch (error) {
      console.error("Get relationship overlays error:", error);
      res.status(500).json({ message: "Failed to get relationship overlays" });
    }
  });

  // ===== PLAYTHROUGH QUEST PROGRESS =====

  // Save quest progress for a playthrough (incremental, without full game-state save)
  app.put("/api/playthroughs/:id/quest-progress", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) return res.status(404).json({ message: "Playthrough not found" });
      if (playthrough.userId !== payload.userId) return res.status(403).json({ message: "Not your playthrough" });

      const { questProgress } = req.body;
      if (!questProgress || typeof questProgress !== 'object') {
        return res.status(400).json({ message: "questProgress object is required" });
      }

      // Merge quest progress into all existing save slots
      const saveData = (playthrough.saveData as Record<string, any>) || {};
      for (const key of Object.keys(saveData)) {
        if (key.startsWith('slot_') && saveData[key]) {
          saveData[key].questProgress = questProgress;
        }
      }

      await storage.updatePlaythrough(req.params.id, {
        saveData,
        lastPlayedAt: new Date(),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Save quest progress error:", error);
      res.status(500).json({ message: "Failed to save quest progress" });
    }
  });

  // Load quest progress for a playthrough (from most recent save slot)
  app.get("/api/playthroughs/:id/quest-progress", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) return res.status(404).json({ message: "Playthrough not found" });
      if (playthrough.userId !== payload.userId) return res.status(403).json({ message: "Not your playthrough" });

      const saveData = (playthrough.saveData as Record<string, any>) || {};

      // Find the most recently saved slot
      let latest: any = null;
      let latestTime = '';
      for (const key of Object.keys(saveData)) {
        if (key.startsWith('slot_') && saveData[key]?.questProgress) {
          const savedAt = saveData[key].savedAt || '';
          if (savedAt > latestTime) {
            latestTime = savedAt;
            latest = saveData[key].questProgress;
          }
        }
      }

      res.json({ questProgress: latest });
    } catch (error) {
      console.error("Load quest progress error:", error);
      res.status(500).json({ message: "Failed to load quest progress" });
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

      // Check save compatibility
      const world = await storage.getWorld(worldId);
      const compatibility = world
        ? checkSnapshotCompatibility(world.version ?? 1, playthrough.worldSnapshotVersion ?? 1)
        : null;

      if (compatibility && !compatibility.compatible) {
        return res.status(409).json({
          message: "Save is incompatible with current world version",
          compatibility,
        });
      }

      // Store state in playthrough's saveData keyed by slot
      const saveData = (playthrough.saveData as Record<string, any>) || {};
      saveData[`slot_${slotIndex}`] = {
        ...state,
        worldVersion: world?.version ?? 1,
        snapshotVersion: playthrough.worldSnapshotVersion ?? 1,
      };

      await storage.updatePlaythrough(playthroughId, {
        saveData,
        lastPlayedAt: new Date(),
      });

      const warning = compatibility?.status === 'behind' ? compatibility.message : undefined;
      res.json({ success: true, slotIndex, savedAt: state.savedAt, ...(warning && { warning }) });
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

  // ===== WORLD SNAPSHOT VERSIONING =====

  // Get world version info
  app.get("/api/worlds/:worldId/version", async (req, res) => {
    try {
      const { worldId } = req.params;
      const world = await storage.getWorld(worldId);
      if (!world) {
        return res.status(404).json({ message: "World not found" });
      }

      res.json({ worldId, version: world.version ?? 1 });
    } catch (error) {
      console.error("Get world version error:", error);
      res.status(500).json({ message: "Failed to get world version" });
    }
  });

  // Bump world version (owner only) — also generates alerts for active playthroughs
  app.post("/api/worlds/:worldId/version/bump", async (req, res) => {
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

      if (!(await canEditWorld(payload.userId, worldId))) {
        return res.status(403).json({ message: "You don't have permission to edit this world" });
      }

      const { entityType } = req.body || {};
      const result = await bumpVersionWithAlerts(worldId, entityType);
      res.json({ worldId, version: result.newVersion, alertsCreated: result.alertsCreated });
    } catch (error) {
      console.error("Bump world version error:", error);
      res.status(500).json({ message: "Failed to bump world version" });
    }
  });

  // Check save compatibility for a playthrough
  app.get("/api/playthroughs/:id/compatibility", async (req, res) => {
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
        const canEdit = await canEditWorld(payload.userId, playthrough.worldId);
        if (!canEdit) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const world = await storage.getWorld(playthrough.worldId);
      if (!world) {
        return res.status(404).json({ message: "World not found" });
      }

      const result = checkSnapshotCompatibility(
        world.version ?? 1,
        playthrough.worldSnapshotVersion ?? 1,
      );
      res.json(result);
    } catch (error) {
      console.error("Check compatibility error:", error);
      res.status(500).json({ message: "Failed to check compatibility" });
    }
  });

  // Update playthrough snapshot version to current world version
  app.post("/api/playthroughs/:id/sync-version", async (req, res) => {
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
        return res.status(403).json({ message: "You can only sync your own playthroughs" });
      }

      const world = await storage.getWorld(playthrough.worldId);
      if (!world) {
        return res.status(404).json({ message: "World not found" });
      }

      const worldVersion = world.version ?? 1;
      const compatibility = checkSnapshotCompatibility(
        worldVersion,
        playthrough.worldSnapshotVersion ?? 1,
      );

      if (!compatibility.compatible) {
        return res.status(409).json({
          message: compatibility.message,
          compatibility,
        });
      }

      const updated = await storage.updatePlaythrough(req.params.id, {
        worldSnapshotVersion: worldVersion,
      });

      // Auto-dismiss version alerts since the playthrough is now synced
      await dismissAlertsForPlaythrough(req.params.id);

      res.json({
        playthroughId: req.params.id,
        previousVersion: playthrough.worldSnapshotVersion,
        newVersion: worldVersion,
        playthrough: updated,
      });
    } catch (error) {
      console.error("Sync version error:", error);
      res.status(500).json({ message: "Failed to sync version" });
    }
  });

  // ===== VERSION ALERTS =====

  // Get undismissed version alerts for the current user
  app.get("/api/version-alerts", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const worldId = req.query.worldId as string | undefined;
      const alerts = await getActiveAlertsForUser(payload.userId, worldId);
      res.json(alerts);
    } catch (error) {
      console.error("Get version alerts error:", error);
      res.status(500).json({ message: "Failed to get version alerts" });
    }
  });

  // Get version alerts for a specific playthrough
  app.get("/api/playthroughs/:id/version-alerts", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) return res.status(404).json({ message: "Playthrough not found" });
      if (playthrough.userId !== payload.userId) {
        const canEdit = await canEditWorld(payload.userId, playthrough.worldId);
        if (!canEdit) return res.status(403).json({ message: "Access denied" });
      }

      const alerts = await storage.getVersionAlertsByPlaythrough(req.params.id);
      res.json(alerts);
    } catch (error) {
      console.error("Get playthrough version alerts error:", error);
      res.status(500).json({ message: "Failed to get version alerts" });
    }
  });

  // Dismiss a single version alert
  app.post("/api/version-alerts/:id/dismiss", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const alert = await storage.getVersionAlert(req.params.id);
      if (!alert) return res.status(404).json({ message: "Alert not found" });
      if (alert.userId !== payload.userId) return res.status(403).json({ message: "Access denied" });

      const dismissed = await storage.dismissVersionAlert(req.params.id);
      res.json(dismissed);
    } catch (error) {
      console.error("Dismiss version alert error:", error);
      res.status(500).json({ message: "Failed to dismiss alert" });
    }
  });

  // Dismiss all version alerts for a playthrough
  app.post("/api/playthroughs/:id/version-alerts/dismiss-all", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const playthrough = await storage.getPlaythrough(req.params.id);
      if (!playthrough) return res.status(404).json({ message: "Playthrough not found" });
      if (playthrough.userId !== payload.userId) return res.status(403).json({ message: "Access denied" });

      const count = await dismissAlertsForPlaythrough(req.params.id);
      res.json({ dismissed: count });
    } catch (error) {
      console.error("Dismiss all version alerts error:", error);
      res.status(500).json({ message: "Failed to dismiss alerts" });
    }
  });

  // Get version alerts for a world (owner only — for analytics)
  app.get("/api/worlds/:worldId/version-alerts", async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: "Authentication required" });
      const payload = AuthService.verifyToken(token);
      if (!payload) return res.status(401).json({ message: "Invalid token" });

      const { worldId } = req.params;
      if (!(await canEditWorld(payload.userId, worldId))) {
        return res.status(403).json({ message: "Only world owner can view world alerts" });
      }

      const alerts = await storage.getVersionAlertsByWorld(worldId);
      res.json(alerts);
    } catch (error) {
      console.error("Get world version alerts error:", error);
      res.status(500).json({ message: "Failed to get version alerts" });
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
