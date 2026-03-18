/**
 * NPCScheduleSystem — Gives NPCs goal-directed behavior using street networks.
 *
 * NPCs follow a personality-driven daily schedule:
 *
 * Employed NPCs:
 *   - Morning (6-9): Leave home, go to work
 *   - Work hours (9-12): At work
 *   - Lunch break (12-13): Visit a random business for lunch
 *   - Afternoon work (13-17): Back to work
 *   - Evening social (17-20): Extroverts visit friends/businesses; introverts go home
 *   - Night (20-6): Go home, stay inside
 *
 * Unemployed NPCs:
 *   - Morning: Wander or visit shops
 *   - Midday: Visit a random business
 *   - Afternoon: Visit friend or wander
 *   - Evening: Go home
 *
 * Movement follows the street network sidewalks rather than random wandering.
 * NPCs "enter" buildings by walking to the door and becoming invisible,
 * then "exit" after their scheduled time expires.
 */

import { Vector3 } from '@babylonjs/core';
import type { StreetNetwork } from '../../../../shared/game-engine/types';

export interface NPCGoal {
  type: 'go_to_building' | 'wander_sidewalk' | 'idle_at_building' | 'visit_friend';
  buildingId?: string;
  targetPosition?: Vector3;
  doorPosition?: Vector3;
  /** Timestamp (ms) when this goal expires and the next one should be picked */
  expiresAt: number;
}

export interface NPCScheduleEntry {
  npcId: string;
  currentGoal: NPCGoal | null;
  /** Waypoints along the sidewalk to reach the goal */
  pathWaypoints: Vector3[];
  pathIndex: number;
  /** Whether the NPC is currently "inside" a building (hidden) */
  isInsideBuilding: boolean;
  insideBuildingId?: string;
  /** Associated building IDs */
  workBuildingId?: string;
  homeBuildingId?: string;
  /** Residences of friends/family this NPC can visit */
  friendBuildingIds?: string[];
  /** Personality modifiers that influence schedule choices */
  personality?: { extroversion?: number; conscientiousness?: number };
}

interface BuildingInfo {
  id: string;
  position: Vector3;
  buildingType: string;
  doorPosition: Vector3;
}

/**
 * Compute the door world position for a building given its center, rotation, and depth.
 */
function computeDoorPosition(position: Vector3, rotation: number, depth: number): Vector3 {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const doorLocalZ = depth / 2 + 0.5;
  return new Vector3(
    position.x + sin * doorLocalZ,
    position.y,
    position.z + cos * doorLocalZ
  );
}

export class NPCScheduleSystem {
  private schedules = new Map<string, NPCScheduleEntry>();
  private buildings = new Map<string, BuildingInfo>();
  private streetNetworks: StreetNetwork[] = [];
  /** All sidewalk waypoints (street centerline offset by halfWidth + 1) for path generation */
  private sidewalkNodes: Vector3[] = [];
  /** Adjacency: index → set of connected indices */
  private sidewalkGraph: Map<number, Set<number>> = new Map();

  /**
   * Register a street network for sidewalk pathfinding.
   */
  public addStreetNetwork(network: StreetNetwork, sampleHeight: (x: number, z: number) => number): void {
    this.streetNetworks.push(network);
    this.rebuildSidewalkGraph(sampleHeight);
  }

  /**
   * Register a building with its metadata.
   */
  public registerBuilding(
    id: string,
    position: Vector3,
    rotation: number,
    depth: number,
    buildingType: string
  ): void {
    this.buildings.set(id, {
      id,
      position: position.clone(),
      buildingType,
      doorPosition: computeDoorPosition(position, rotation, depth),
    });
  }

  /**
   * Register an NPC with their work and home building associations,
   * optional friend residences, and personality modifiers.
   */
  public registerNPC(
    npcId: string,
    workBuildingId?: string,
    homeBuildingId?: string,
    friendBuildingIds?: string[],
    personality?: { extroversion?: number; conscientiousness?: number }
  ): void {
    this.schedules.set(npcId, {
      npcId,
      currentGoal: null,
      pathWaypoints: [],
      pathIndex: 0,
      isInsideBuilding: false,
      workBuildingId,
      homeBuildingId,
      friendBuildingIds,
      personality,
    });
  }

  /**
   * Build a walkable graph from street network sidewalk waypoints.
   * Nodes are placed along the sidewalk (offset from street center).
   * Edges connect consecutive waypoints along each street + cross-connections at intersections.
   */
  private rebuildSidewalkGraph(sampleHeight: (x: number, z: number) => number): void {
    this.sidewalkNodes = [];
    this.sidewalkGraph = new Map();

    const nodeIndex = new Map<string, number>(); // "x:z" → index
    const getOrAddNode = (x: number, z: number): number => {
      // Snap to grid to merge nearby points
      const key = `${Math.round(x * 2) / 2}:${Math.round(z * 2) / 2}`;
      if (nodeIndex.has(key)) return nodeIndex.get(key)!;
      const idx = this.sidewalkNodes.length;
      const y = sampleHeight(x, z) + 0.35; // Match sidewalk height
      this.sidewalkNodes.push(new Vector3(x, y, z));
      nodeIndex.set(key, idx);
      this.sidewalkGraph.set(idx, new Set());
      return idx;
    };

    const addEdge = (a: number, b: number) => {
      this.sidewalkGraph.get(a)!.add(b);
      this.sidewalkGraph.get(b)!.add(a);
    };

    for (const network of this.streetNetworks) {
      for (const seg of network.segments) {
        if (seg.waypoints.length < 2) continue;
        const halfW = seg.width / 2;
        const sidewalkOffset = halfW + 1.0; // Center of sidewalk

        // Create nodes along both sides of the street
        let prevLeft = -1;
        let prevRight = -1;

        for (const wp of seg.waypoints) {
          // Compute perpendicular offset direction
          const wpIdx = seg.waypoints.indexOf(wp);
          let dx: number, dz: number;
          if (wpIdx === 0) {
            dx = seg.waypoints[1].x - wp.x;
            dz = seg.waypoints[1].z - wp.z;
          } else if (wpIdx === seg.waypoints.length - 1) {
            dx = wp.x - seg.waypoints[wpIdx - 1].x;
            dz = wp.z - seg.waypoints[wpIdx - 1].z;
          } else {
            dx = seg.waypoints[wpIdx + 1].x - seg.waypoints[wpIdx - 1].x;
            dz = seg.waypoints[wpIdx + 1].z - seg.waypoints[wpIdx - 1].z;
          }
          const len = Math.sqrt(dx * dx + dz * dz);
          if (len < 0.01) continue;
          const perpX = -dz / len;
          const perpZ = dx / len;

          const leftIdx = getOrAddNode(
            wp.x + perpX * sidewalkOffset,
            wp.z + perpZ * sidewalkOffset
          );
          const rightIdx = getOrAddNode(
            wp.x - perpX * sidewalkOffset,
            wp.z - perpZ * sidewalkOffset
          );

          // Connect consecutive nodes along each side
          if (prevLeft >= 0) addEdge(prevLeft, leftIdx);
          if (prevRight >= 0) addEdge(prevRight, rightIdx);

          // Connect left and right at each waypoint (crosswalk)
          addEdge(leftIdx, rightIdx);

          prevLeft = leftIdx;
          prevRight = rightIdx;
        }
      }
    }
  }

  /**
   * Find the nearest sidewalk node to a world position.
   */
  private findNearestSidewalkNode(pos: Vector3): number {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < this.sidewalkNodes.length; i++) {
      const n = this.sidewalkNodes[i];
      const dx = n.x - pos.x;
      const dz = n.z - pos.z;
      const dist = dx * dx + dz * dz;
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  /**
   * A* pathfinding on the sidewalk graph.
   * Returns a list of world-space waypoints from start to end.
   */
  public findSidewalkPath(from: Vector3, to: Vector3): Vector3[] {
    if (this.sidewalkNodes.length === 0) return [];

    const startIdx = this.findNearestSidewalkNode(from);
    const endIdx = this.findNearestSidewalkNode(to);
    if (startIdx < 0 || endIdx < 0) return [];
    if (startIdx === endIdx) return [this.sidewalkNodes[startIdx].clone()];

    // A* search
    const gScore = new Map<number, number>();
    const fScore = new Map<number, number>();
    const cameFrom = new Map<number, number>();
    const openSet = new Set<number>([startIdx]);

    gScore.set(startIdx, 0);
    fScore.set(startIdx, this.heuristic(startIdx, endIdx));

    while (openSet.size > 0) {
      // Find node in openSet with lowest fScore
      let current = -1;
      let currentF = Infinity;
      Array.from(openSet).forEach(idx => {
        const f = fScore.get(idx) ?? Infinity;
        if (f < currentF) { currentF = f; current = idx; }
      });
      if (current < 0) break;

      if (current === endIdx) {
        // Reconstruct path
        const path: Vector3[] = [];
        let node = endIdx;
        while (node !== startIdx) {
          path.unshift(this.sidewalkNodes[node].clone());
          node = cameFrom.get(node)!;
        }
        path.unshift(this.sidewalkNodes[startIdx].clone());
        return path;
      }

      openSet.delete(current);
      const neighbors = this.sidewalkGraph.get(current);
      if (!neighbors) continue;

      const currentG = gScore.get(current) ?? Infinity;
      for (const neighbor of Array.from(neighbors)) {
        const edgeCost = Vector3.Distance(
          this.sidewalkNodes[current],
          this.sidewalkNodes[neighbor]
        );
        const tentativeG = currentG + edgeCost;
        if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentativeG);
          fScore.set(neighbor, tentativeG + this.heuristic(neighbor, endIdx));
          openSet.add(neighbor);
        }
      }
    }

    // No path found — return direct waypoint
    return [to.clone()];
  }

  private heuristic(a: number, b: number): number {
    return Vector3.Distance(this.sidewalkNodes[a], this.sidewalkNodes[b]);
  }

  /**
   * Helper: create a go_to_building goal for a known building.
   */
  private makeBuildingGoal(buildingId: string, now: number, duration: number): NPCGoal {
    const bld = this.buildings.get(buildingId)!;
    return {
      type: 'go_to_building',
      buildingId,
      targetPosition: bld.position.clone(),
      doorPosition: bld.doorPosition.clone(),
      expiresAt: now + duration,
    };
  }

  /**
   * Helper: create a visit_friend goal for a friend's residence.
   */
  private makeFriendVisitGoal(buildingId: string, now: number, duration: number): NPCGoal {
    const bld = this.buildings.get(buildingId)!;
    return {
      type: 'visit_friend',
      buildingId,
      targetPosition: bld.position.clone(),
      doorPosition: bld.doorPosition.clone(),
      expiresAt: now + duration,
    };
  }

  /**
   * Helper: pick a random business building ID (excluding a given ID).
   */
  private pickRandomBusiness(excludeId?: string): string | null {
    const shops = Array.from(this.buildings.entries())
      .filter(([id, b]) => b.buildingType === 'business' && id !== excludeId)
      .map(([id]) => id);
    if (shops.length === 0) return null;
    return shops[Math.floor(Math.random() * shops.length)];
  }

  /**
   * Helper: pick a random valid friend building from the entry's friendBuildingIds.
   */
  private pickRandomFriend(entry: NPCScheduleEntry): string | null {
    const friends = (entry.friendBuildingIds ?? []).filter(id => this.buildings.has(id));
    if (friends.length === 0) return null;
    return friends[Math.floor(Math.random() * friends.length)];
  }

  /**
   * Helper: random integer in [min, max] inclusive.
   */
  private randRange(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  /**
   * Determine what goal an NPC should pursue based on time-of-day and personality.
   * Uses a simulated 24-hour day cycle (1 real minute = 1 game hour).
   *
   * Employed NPCs follow a structured work schedule with lunch breaks and
   * personality-driven evening behavior. Unemployed NPCs have a more relaxed
   * routine of wandering, shopping, and socializing.
   */
  public pickNextGoal(npcId: string, now: number): NPCGoal | null {
    const entry = this.schedules.get(npcId);
    if (!entry) return null;

    // Simulated hour: cycle through 24 hours every 24 minutes
    const gameHour = ((now / 60000) % 24);
    const extroversion = entry.personality?.extroversion ?? 0.5;
    const hasJob = !!(entry.workBuildingId && this.buildings.has(entry.workBuildingId));

    // --- Night (20-6): Everyone goes home ---
    if (gameHour >= 20 || gameHour < 6) {
      if (entry.homeBuildingId && this.buildings.has(entry.homeBuildingId)) {
        const duration = this.randRange(180000, 300000); // 3-5 minutes
        return this.makeBuildingGoal(entry.homeBuildingId, now, duration);
      }
      return { type: 'idle_at_building', expiresAt: now + 180000 };
    }

    // --- Employed NPC schedule ---
    if (hasJob) {
      if (gameHour >= 6 && gameHour < 9) {
        // Morning: leave home, go to work
        const duration = this.randRange(180000, 300000); // 3-5 minutes
        return this.makeBuildingGoal(entry.workBuildingId!, now, duration);
      } else if (gameHour >= 9 && gameHour < 12) {
        // Work hours: at work
        const duration = this.randRange(180000, 300000); // 3-5 minutes
        return this.makeBuildingGoal(entry.workBuildingId!, now, duration);
      } else if (gameHour >= 12 && gameHour < 13) {
        // Lunch break: visit a random business
        const shopId = this.pickRandomBusiness(entry.workBuildingId);
        if (shopId) {
          const duration = this.randRange(60000, 120000); // 1-2 minutes
          return this.makeBuildingGoal(shopId, now, duration);
        }
        // No shops available, wander
        return { type: 'wander_sidewalk', expiresAt: now + this.randRange(30000, 60000) };
      } else if (gameHour >= 13 && gameHour < 17) {
        // Afternoon work: back to work
        const duration = this.randRange(180000, 300000); // 3-5 minutes
        return this.makeBuildingGoal(entry.workBuildingId!, now, duration);
      } else if (gameHour >= 17 && gameHour < 20) {
        // Evening social: personality-driven
        if (extroversion > 0.5) {
          // Extroverted: visit friend's home or a business
          const friendId = this.pickRandomFriend(entry);
          if (friendId && Math.random() < 0.6) {
            const duration = this.randRange(120000, 180000); // 2-3 minutes
            return this.makeFriendVisitGoal(friendId, now, duration);
          }
          const shopId = this.pickRandomBusiness(entry.workBuildingId);
          if (shopId) {
            const duration = this.randRange(60000, 120000); // 1-2 minutes
            return this.makeBuildingGoal(shopId, now, duration);
          }
        }
        // Introverted or no social options: go home
        if (entry.homeBuildingId && this.buildings.has(entry.homeBuildingId)) {
          const duration = this.randRange(180000, 300000); // 3-5 minutes
          return this.makeBuildingGoal(entry.homeBuildingId, now, duration);
        }
      }
    } else {
      // --- Unemployed NPC schedule ---
      if (gameHour >= 6 && gameHour < 12) {
        // Morning: wander or visit shops
        const shopId = this.pickRandomBusiness();
        if (shopId && Math.random() < 0.5) {
          const duration = this.randRange(60000, 120000); // 1-2 minutes
          return this.makeBuildingGoal(shopId, now, duration);
        }
        return { type: 'wander_sidewalk', expiresAt: now + this.randRange(30000, 60000) };
      } else if (gameHour >= 12 && gameHour < 14) {
        // Midday: visit a random business
        const shopId = this.pickRandomBusiness();
        if (shopId) {
          const duration = this.randRange(60000, 120000); // 1-2 minutes
          return this.makeBuildingGoal(shopId, now, duration);
        }
        return { type: 'wander_sidewalk', expiresAt: now + this.randRange(30000, 60000) };
      } else if (gameHour >= 14 && gameHour < 17) {
        // Afternoon: visit friend or wander
        const friendId = this.pickRandomFriend(entry);
        if (friendId && Math.random() < 0.5) {
          const duration = this.randRange(120000, 180000); // 2-3 minutes
          return this.makeFriendVisitGoal(friendId, now, duration);
        }
        return { type: 'wander_sidewalk', expiresAt: now + this.randRange(30000, 60000) };
      } else if (gameHour >= 17 && gameHour < 20) {
        // Evening: go home
        if (entry.homeBuildingId && this.buildings.has(entry.homeBuildingId)) {
          const duration = this.randRange(180000, 300000); // 3-5 minutes
          return this.makeBuildingGoal(entry.homeBuildingId, now, duration);
        }
      }
    }

    // Fallback: wander along sidewalk
    return {
      type: 'wander_sidewalk',
      expiresAt: now + this.randRange(30000, 60000),
    };
  }

  /**
   * Pick a random sidewalk destination for wandering.
   */
  public getRandomSidewalkTarget(): Vector3 | null {
    if (this.sidewalkNodes.length === 0) return null;
    const idx = Math.floor(Math.random() * this.sidewalkNodes.length);
    return this.sidewalkNodes[idx].clone();
  }

  /**
   * Get the schedule entry for an NPC.
   */
  public getEntry(npcId: string): NPCScheduleEntry | undefined {
    return this.schedules.get(npcId);
  }

  /**
   * Check if the system has any street network data.
   */
  public hasStreetData(): boolean {
    return this.sidewalkNodes.length > 0;
  }

  /**
   * Get door position for a building.
   */
  public getBuildingDoor(buildingId: string): Vector3 | null {
    return this.buildings.get(buildingId)?.doorPosition.clone() ?? null;
  }

  /**
   * Returns a human-readable description of an NPC's current schedule state.
   */
  public getItinerary(npcId: string): string {
    const entry = this.schedules.get(npcId);
    if (!entry) return `NPC ${npcId}: not registered`;

    const parts: string[] = [];

    if (entry.workBuildingId) {
      parts.push(`Work: ${entry.workBuildingId}`);
    }
    if (entry.homeBuildingId) {
      parts.push(`Home: ${entry.homeBuildingId}`);
    }
    if (entry.friendBuildingIds && entry.friendBuildingIds.length > 0) {
      parts.push(`Friends: ${entry.friendBuildingIds.join(', ')}`);
    }

    if (entry.currentGoal) {
      const goal = entry.currentGoal;
      let goalDesc: string = goal.type;
      if (goal.buildingId) {
        // Annotate with context
        let context = '';
        if (goal.buildingId === entry.workBuildingId) context = ' (work)';
        else if (goal.buildingId === entry.homeBuildingId) context = ' (home)';
        else if (goal.type === 'visit_friend') context = ' (friend)';
        goalDesc = `${goal.type}${context}`;
      }
      parts.push(`Current: ${goalDesc}`);
    } else {
      parts.push('Current: none');
    }

    if (entry.isInsideBuilding && entry.insideBuildingId) {
      parts.push(`Inside: ${entry.insideBuildingId}`);
    }

    return parts.join(' | ');
  }
}
