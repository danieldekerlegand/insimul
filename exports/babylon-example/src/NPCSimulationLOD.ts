/**
 * NPC Simulation LOD (Level of Detail) System
 *
 * Centralizes distance-based LOD management for NPC simulation to maintain
 * 60fps with 50+ NPCs. Provides:
 *
 * - LOD tiers: Near (<30m), Medium (30-100m), Far (>100m), Off-screen
 * - Staggered updates across 10-frame windows
 * - Object pooling for NPC mesh instances
 * - Animation instancing (shared evaluation across same-animation NPCs)
 * - Frame budget monitoring with automatic quality reduction
 */

import { Vector3, Mesh, Scene } from '@babylonjs/core';

// --- LOD Tier Definitions ---

export type LODTier = 'near' | 'medium' | 'far' | 'offscreen';

/** Distance thresholds for LOD tiers */
export const LOD_DISTANCES = {
  /** Near: full animation, pathfinding, lip sync */
  NEAR_MAX: 30,
  /** Medium: simplified walk/idle only */
  MEDIUM_MAX: 100,
  /** Far: position-only, teleport to schedule location */
  // > 100 = far
  /** Off-screen: position update on schedule transition only */
  OFFSCREEN_CHECK_MS: 5000,
} as const;

/** Per-tier update configuration */
const TIER_CONFIG: Record<LODTier, {
  /** Movement controller update interval in ms (0 = every frame) */
  movementUpdateMs: number;
  /** Animation enabled */
  animationEnabled: boolean;
  /** Full pathfinding enabled */
  pathfindingEnabled: boolean;
  /** Lip sync enabled */
  lipSyncEnabled: boolean;
  /** Mesh visible */
  meshVisible: boolean;
  /** Collision enabled */
  collisionEnabled: boolean;
  /** Animation blending (crossfade) enabled */
  blendingEnabled: boolean;
}> = {
  near: {
    movementUpdateMs: 0,
    animationEnabled: true,
    pathfindingEnabled: true,
    lipSyncEnabled: true,
    meshVisible: true,
    collisionEnabled: true,
    blendingEnabled: true,
  },
  medium: {
    movementUpdateMs: 100,
    animationEnabled: true,
    pathfindingEnabled: false,
    lipSyncEnabled: false,
    meshVisible: true,
    collisionEnabled: false,
    blendingEnabled: false,
  },
  far: {
    movementUpdateMs: 500,
    animationEnabled: false,
    pathfindingEnabled: false,
    lipSyncEnabled: false,
    meshVisible: false,
    collisionEnabled: false,
    blendingEnabled: false,
  },
  offscreen: {
    movementUpdateMs: -1, // Only update on schedule transition
    animationEnabled: false,
    pathfindingEnabled: false,
    lipSyncEnabled: false,
    meshVisible: false,
    collisionEnabled: false,
    blendingEnabled: false,
  },
};

// --- NPC Registration ---

export interface LODNPCEntry {
  npcId: string;
  mesh: Mesh;
  /** Billboard LOD mesh (cheap quad shown at medium distance) */
  billboard?: Mesh | null;
  /** Current LOD tier */
  tier: LODTier;
  /** Distance to player (updated each evaluation) */
  distance: number;
  /** Last time this NPC's movement was updated */
  lastMovementUpdate: number;
  /** Last time this NPC's tier was evaluated */
  lastTierEval: number;
  /** Current animation name (for instancing dedup) */
  currentAnimation: string;
  /** Whether this NPC is in a conversation (exempt from LOD degradation) */
  inConversation: boolean;
  /** Schedule target position — used for far-tier teleporting */
  scheduleTarget: Vector3 | null;
}

// --- Object Pool ---

export interface MeshPoolEntry {
  mesh: Mesh;
  skeletonType: string;
  inUse: boolean;
}

// --- Animation Instance Group ---

interface AnimationInstanceGroup {
  /** Animation name */
  animationName: string;
  /** NPC IDs sharing this animation evaluation */
  npcIds: Set<string>;
  /** Last evaluation frame */
  lastEvalFrame: number;
}

// --- Frame Budget Monitor ---

export interface FrameBudgetStats {
  /** Rolling average frame time in ms (last 60 frames) */
  avgFrameTimeMs: number;
  /** Whether quality reduction is active */
  qualityReduced: boolean;
  /** Current NPC update frequency multiplier (1.0 = normal, 2.0 = half speed) */
  updateFrequencyMultiplier: number;
  /** Number of NPCs per tier */
  tierCounts: Record<LODTier, number>;
}

// --- Main Class ---

export class NPCSimulationLOD {
  private scene: Scene;

  /** All registered NPCs */
  private npcs: Map<string, LODNPCEntry> = new Map();

  /** Object pool for reusable mesh instances */
  private meshPool: MeshPoolEntry[] = [];

  /** Animation instance groups (shared evaluation) */
  private animationGroups: Map<string, AnimationInstanceGroup> = new Map();

  /** Frame budget monitoring */
  private frameTimes: number[] = [];
  private static readonly FRAME_HISTORY = 60;
  private static readonly TARGET_FRAME_MS = 16.67; // 60fps
  private static readonly QUALITY_REDUCE_THRESHOLD = 18; // ~55fps
  private static readonly QUALITY_RESTORE_THRESHOLD = 15; // ~67fps

  /** Stagger slot for distributing evaluations across frames */
  private frameCounter = 0;
  private static readonly STAGGER_WINDOW = 10;

  /** Quality reduction state */
  private _qualityReduced = false;
  private _updateFrequencyMultiplier = 1.0;

  /** Player position cache (set externally each frame) */
  private playerPosition: Vector3 | null = null;

  /** Maximum visible NPC count (object pooling target) */
  private static readonly MAX_POOLED_MESHES = 50;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  // ---- Public API ----

  /**
   * Register an NPC for LOD management.
   */
  registerNPC(
    npcId: string,
    mesh: Mesh,
    billboard?: Mesh | null
  ): void {
    this.npcs.set(npcId, {
      npcId,
      mesh,
      billboard: billboard ?? null,
      tier: 'near',
      distance: 0,
      lastMovementUpdate: 0,
      lastTierEval: 0,
      currentAnimation: 'idle',
      inConversation: false,
      scheduleTarget: null,
    });
  }

  /**
   * Unregister an NPC.
   */
  unregisterNPC(npcId: string): void {
    const entry = this.npcs.get(npcId);
    if (entry) {
      // Remove from animation instance groups
      this.removeFromAnimationGroup(npcId, entry.currentAnimation);
      this.npcs.delete(npcId);
    }
  }

  /**
   * Set the player position for distance calculations. Call each frame.
   */
  setPlayerPosition(position: Vector3): void {
    this.playerPosition = position;
  }

  /**
   * Mark an NPC as in conversation (exempt from LOD degradation).
   */
  setInConversation(npcId: string, inConversation: boolean): void {
    const entry = this.npcs.get(npcId);
    if (entry) {
      entry.inConversation = inConversation;
      if (inConversation) {
        // Force near tier during conversation
        this.applyTierChange(entry, 'near');
      }
    }
  }

  /**
   * Set the schedule target position for far-tier teleporting.
   */
  setScheduleTarget(npcId: string, target: Vector3 | null): void {
    const entry = this.npcs.get(npcId);
    if (entry) {
      entry.scheduleTarget = target;
    }
  }

  /**
   * Notify that an NPC changed its animation (for instancing).
   */
  setNPCAnimation(npcId: string, animationName: string): void {
    const entry = this.npcs.get(npcId);
    if (!entry) return;

    const oldAnim = entry.currentAnimation;
    if (oldAnim === animationName) return;

    this.removeFromAnimationGroup(npcId, oldAnim);
    entry.currentAnimation = animationName;
    this.addToAnimationGroup(npcId, animationName);
  }

  /**
   * Main update — call once per frame from the game loop.
   * Evaluates LOD tiers for staggered NPCs, applies tier changes,
   * and monitors frame budget.
   *
   * @returns Set of NPC IDs that should receive movement updates this frame
   */
  update(deltaTimeMs: number): Set<string> {
    const now = performance.now();
    this.frameCounter++;

    // Track frame time for budget monitoring
    this.frameTimes.push(deltaTimeMs);
    if (this.frameTimes.length > NPCSimulationLOD.FRAME_HISTORY) {
      this.frameTimes.shift();
    }
    this.updateFrameBudget();

    const updateSet = new Set<string>();

    if (!this.playerPosition) {
      // No player position — can't compute distances, update all near
      this.npcs.forEach((entry) => {
        if (entry.tier === 'near') updateSet.add(entry.npcId);
      });
      return updateSet;
    }

    const playerPos = this.playerPosition;
    const staggerSlot = this.frameCounter % NPCSimulationLOD.STAGGER_WINDOW;
    const freqMult = this._updateFrequencyMultiplier;

    let npcIndex = 0;
    const entries = Array.from(this.npcs.values());

    for (const entry of entries) {
      const slotMatch = (npcIndex % NPCSimulationLOD.STAGGER_WINDOW) === staggerSlot;
      npcIndex++;

      // Compute distance
      if (entry.mesh && entry.mesh.position) {
        entry.distance = Vector3.Distance(playerPos, entry.mesh.position);
      } else {
        entry.distance = Infinity;
      }

      // Evaluate tier (staggered — only this slot's NPCs re-evaluate each frame)
      if (slotMatch || entry.inConversation) {
        const newTier = this.computeTier(entry);
        if (newTier !== entry.tier) {
          this.applyTierChange(entry, newTier);
        }
        entry.lastTierEval = now;
      }

      // Determine if this NPC should receive a movement update this frame
      const config = TIER_CONFIG[entry.tier];
      if (config.movementUpdateMs < 0) {
        // Off-screen: only update on schedule transition (managed externally)
        continue;
      }

      if (config.movementUpdateMs === 0) {
        // Near: update every frame
        updateSet.add(entry.npcId);
      } else {
        // Medium/Far: throttled updates
        const interval = config.movementUpdateMs * freqMult;
        if (now - entry.lastMovementUpdate >= interval) {
          entry.lastMovementUpdate = now;
          updateSet.add(entry.npcId);
        }
      }
    }

    return updateSet;
  }

  /**
   * Get the LOD tier for an NPC.
   */
  getTier(npcId: string): LODTier | null {
    return this.npcs.get(npcId)?.tier ?? null;
  }

  /**
   * Get tier configuration for a given tier.
   */
  getTierConfig(tier: LODTier): typeof TIER_CONFIG[LODTier] {
    return TIER_CONFIG[tier];
  }

  /**
   * Get the distance to an NPC (last computed).
   */
  getDistance(npcId: string): number {
    return this.npcs.get(npcId)?.distance ?? Infinity;
  }

  /**
   * Check if an NPC should have pathfinding this frame.
   */
  shouldPathfind(npcId: string): boolean {
    const entry = this.npcs.get(npcId);
    if (!entry) return false;
    return TIER_CONFIG[entry.tier].pathfindingEnabled;
  }

  /**
   * Check if an NPC should have lip sync this frame.
   */
  shouldLipSync(npcId: string): boolean {
    const entry = this.npcs.get(npcId);
    if (!entry) return false;
    return TIER_CONFIG[entry.tier].lipSyncEnabled;
  }

  /**
   * Check if an NPC should have animation this frame.
   */
  shouldAnimate(npcId: string): boolean {
    const entry = this.npcs.get(npcId);
    if (!entry) return false;
    return TIER_CONFIG[entry.tier].animationEnabled;
  }

  /**
   * Get current frame budget stats.
   */
  getStats(): FrameBudgetStats {
    const tierCounts: Record<LODTier, number> = { near: 0, medium: 0, far: 0, offscreen: 0 };
    this.npcs.forEach((entry) => {
      tierCounts[entry.tier]++;
    });

    return {
      avgFrameTimeMs: this.getAverageFrameTime(),
      qualityReduced: this._qualityReduced,
      updateFrequencyMultiplier: this._updateFrequencyMultiplier,
      tierCounts,
    };
  }

  /**
   * Get all registered NPC entries (for debug visualization).
   */
  getAllEntries(): LODNPCEntry[] {
    return Array.from(this.npcs.values());
  }

  // ---- Object Pooling ----

  /**
   * Acquire a mesh from the pool for an NPC entering the player area.
   */
  acquireMesh(skeletonType: string): Mesh | null {
    const available = this.meshPool.find(
      (e) => !e.inUse && e.skeletonType === skeletonType
    );
    if (available) {
      available.inUse = true;
      available.mesh.setEnabled(true);
      return available.mesh;
    }
    return null;
  }

  /**
   * Release a mesh back to the pool when NPC leaves player area.
   */
  releaseMesh(mesh: Mesh): void {
    const poolEntry = this.meshPool.find((e) => e.mesh === mesh);
    if (poolEntry) {
      poolEntry.inUse = false;
      poolEntry.mesh.setEnabled(false);
      poolEntry.mesh.position.set(0, -1000, 0); // Move off-screen
    }
  }

  /**
   * Add a mesh to the pool for future reuse.
   */
  addToPool(mesh: Mesh, skeletonType: string): void {
    if (this.meshPool.length >= NPCSimulationLOD.MAX_POOLED_MESHES) return;
    this.meshPool.push({ mesh, skeletonType, inUse: false });
    mesh.setEnabled(false);
    mesh.position.set(0, -1000, 0);
  }

  /**
   * Get pool usage statistics.
   */
  getPoolStats(): { total: number; inUse: number; available: number } {
    const inUse = this.meshPool.filter((e) => e.inUse).length;
    return {
      total: this.meshPool.length,
      inUse,
      available: this.meshPool.length - inUse,
    };
  }

  // ---- Animation Instancing ----

  /**
   * Get all NPCs sharing the same animation (for shared evaluation).
   * Returns the NPC IDs that can share a single animation evaluation.
   */
  getAnimationInstanceGroup(animationName: string): string[] {
    const group = this.animationGroups.get(animationName);
    if (!group) return [];
    return Array.from(group.npcIds);
  }

  /**
   * Check if this NPC is the leader for its animation group
   * (the one that should actually evaluate the animation).
   * Other NPCs in the group can copy the result.
   */
  isAnimationLeader(npcId: string): boolean {
    const entry = this.npcs.get(npcId);
    if (!entry) return false;

    const group = this.animationGroups.get(entry.currentAnimation);
    if (!group || group.npcIds.size === 0) return true;

    // First NPC in the set is the leader
    const firstId = group.npcIds.values().next().value;
    return firstId === npcId;
  }

  // ---- Cleanup ----

  /**
   * Dispose all resources.
   */
  dispose(): void {
    this.npcs.clear();
    this.meshPool.forEach((e) => {
      // Don't dispose meshes — they're owned by BabylonGame
      e.inUse = false;
    });
    this.meshPool = [];
    this.animationGroups.clear();
    this.frameTimes = [];
  }

  // ---- Internal Methods ----

  /**
   * Compute the appropriate LOD tier for an NPC based on distance.
   */
  private computeTier(entry: LODNPCEntry): LODTier {
    // Conversation NPCs always get near tier
    if (entry.inConversation) return 'near';

    const dist = entry.distance;

    if (dist <= LOD_DISTANCES.NEAR_MAX) return 'near';
    if (dist <= LOD_DISTANCES.MEDIUM_MAX) return 'medium';

    // Check if NPC is on-screen via camera frustum
    if (this.isOnScreen(entry.mesh)) return 'far';

    return 'offscreen';
  }

  /**
   * Check if a mesh is within the camera's view frustum.
   */
  private isOnScreen(mesh: Mesh): boolean {
    if (!mesh || !this.scene.activeCamera) return false;
    return this.scene.activeCamera.isInFrustum(mesh);
  }

  /**
   * Apply visual and behavioral changes when an NPC's LOD tier changes.
   */
  private applyTierChange(entry: LODNPCEntry, newTier: LODTier): void {
    const oldTier = entry.tier;
    entry.tier = newTier;
    const config = TIER_CONFIG[newTier];

    // Mesh visibility
    if (entry.mesh) {
      if (config.meshVisible) {
        if (!entry.mesh.isEnabled()) entry.mesh.setEnabled(true);
      } else {
        if (entry.mesh.isEnabled()) entry.mesh.setEnabled(false);
      }
    }

    // Billboard management
    if (entry.billboard) {
      if (newTier === 'medium' || newTier === 'far') {
        // Show billboard for medium (mesh is visible but simplified) — actually only for far
        if (newTier === 'far') {
          if (entry.mesh) {
            entry.billboard.position.copyFrom(entry.mesh.position);
            entry.billboard.position.y += 1.2;
          }
          if (!entry.billboard.isEnabled()) entry.billboard.setEnabled(true);
        } else {
          // Medium: show mesh, hide billboard
          if (entry.billboard.isEnabled()) entry.billboard.setEnabled(false);
        }
      } else {
        if (entry.billboard.isEnabled()) entry.billboard.setEnabled(false);
      }
    }

    // Collision
    if (entry.mesh) {
      entry.mesh.checkCollisions = config.collisionEnabled;
    }

    // Far tier: teleport to schedule target
    if (newTier === 'far' && entry.scheduleTarget && entry.mesh) {
      entry.mesh.position.copyFrom(entry.scheduleTarget);
    }

    // Off-screen: teleport to schedule target immediately
    if (newTier === 'offscreen' && entry.scheduleTarget && entry.mesh) {
      entry.mesh.position.copyFrom(entry.scheduleTarget);
    }
  }

  /**
   * Update frame budget monitoring and adjust quality if needed.
   */
  private updateFrameBudget(): void {
    const avg = this.getAverageFrameTime();

    if (!this._qualityReduced && avg > NPCSimulationLOD.QUALITY_REDUCE_THRESHOLD) {
      // Frame time too high — reduce NPC update frequency
      this._qualityReduced = true;
      this._updateFrequencyMultiplier = 2.0;
    } else if (this._qualityReduced && avg < NPCSimulationLOD.QUALITY_RESTORE_THRESHOLD) {
      // Performance recovered — restore normal quality
      this._qualityReduced = false;
      this._updateFrequencyMultiplier = 1.0;
    }
  }

  /**
   * Get rolling average frame time.
   */
  private getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    let sum = 0;
    for (const t of this.frameTimes) {
      sum += t;
    }
    return sum / this.frameTimes.length;
  }

  // ---- Animation Instancing Helpers ----

  private addToAnimationGroup(npcId: string, animationName: string): void {
    let group = this.animationGroups.get(animationName);
    if (!group) {
      group = {
        animationName,
        npcIds: new Set<string>(),
        lastEvalFrame: 0,
      };
      this.animationGroups.set(animationName, group);
    }
    group.npcIds.add(npcId);
  }

  private removeFromAnimationGroup(npcId: string, animationName: string): void {
    const group = this.animationGroups.get(animationName);
    if (!group) return;
    group.npcIds.delete(npcId);
    if (group.npcIds.size === 0) {
      this.animationGroups.delete(animationName);
    }
  }
}
