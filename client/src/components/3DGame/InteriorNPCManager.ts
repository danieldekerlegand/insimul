/**
 * InteriorNPCManager
 *
 * Manages NPC presence inside building interiors when the player enters.
 * Queries which NPCs should be present (employees, owner, visitors),
 * positions them at role-appropriate furniture, and drives occupation activities.
 */

import { Vector3, Mesh } from '@babylonjs/core';
import type { InteriorLayout } from './BuildingInteriorGenerator';
import type { AnimationState } from './NPCAnimationController';

/** NPC data needed for interior placement */
export interface InteriorNPCData {
  id: string;
  mesh: Mesh;
  characterData?: any;
  /** Role of this NPC in the building: employee, owner, visitor */
  role: 'employee' | 'owner' | 'visitor';
}

/** Positioned NPC inside an interior */
export interface PlacedInteriorNPC {
  npcId: string;
  mesh: Mesh;
  role: 'employee' | 'owner' | 'visitor';
  /** Position within interior */
  interiorPosition: Vector3;
  /** Saved overworld position to restore on exit */
  savedPosition: Vector3;
  /** Saved visibility state */
  wasEnabled: boolean;
  /** Current animation state */
  animationState: AnimationState;
  /** Character data reference */
  characterData?: any;
}

/** Building metadata from BabylonGame.buildingData */
export interface BuildingMetadata {
  buildingId?: string;
  buildingType?: string;
  businessType?: string;
  businessName?: string;
  ownerId?: string | null;
  employees?: Array<string | { id: string }>;
  occupants?: Array<string | { id: string }>;
  residenceId?: string;
  businessId?: string;
}

/** Furniture role assignments for NPC positioning */
interface FurnitureRole {
  name: string;
  /** Offset from interior position */
  offset: Vector3;
  /** Which NPC roles can use this furniture */
  forRoles: Array<'employee' | 'owner' | 'visitor'>;
  /** Animation to play at this position */
  animation: AnimationState;
}

/** Callbacks for InteriorNPCManager events */
export interface InteriorNPCCallbacks {
  /** Called when NPC animation should change */
  onAnimationChange?: (npcId: string, state: AnimationState) => void;
  /** Called when NPC should face a direction */
  onFaceDirection?: (npcId: string, targetPosition: Vector3) => void;
  /** Called to show a greeting toast/chat bubble */
  onNPCGreeting?: (npcId: string, greeting: string) => void;
  /** Called to get the current game hour (0-23) */
  getGameHour?: () => number;
}

/** Max NPCs to place in an interior for performance */
const MAX_INTERIOR_NPCS = 6;

/**
 * Maps business types to furniture role positions within interiors.
 * Offsets are relative to interior center (position).
 */
const BUSINESS_FURNITURE_ROLES: Record<string, FurnitureRole[]> = {
  Bakery: [
    { name: 'counter', offset: new Vector3(0, 0, 2), forRoles: ['owner', 'employee'], animation: 'work' },
    { name: 'display', offset: new Vector3(-2, 0, 0), forRoles: ['employee'], animation: 'idle' },
    { name: 'table', offset: new Vector3(2, 0, -2), forRoles: ['visitor'], animation: 'sit' },
  ],
  Bar: [
    { name: 'bar', offset: new Vector3(0, 0, 2.5), forRoles: ['owner', 'employee'], animation: 'work' },
    { name: 'stool1', offset: new Vector3(-2, 0, 1), forRoles: ['visitor'], animation: 'sit' },
    { name: 'stool2', offset: new Vector3(2, 0, 1), forRoles: ['visitor'], animation: 'sit' },
    { name: 'table', offset: new Vector3(-3, 0, -2), forRoles: ['visitor'], animation: 'sit' },
  ],
  Restaurant: [
    { name: 'kitchen', offset: new Vector3(0, 0, 3), forRoles: ['owner', 'employee'], animation: 'work' },
    { name: 'table1', offset: new Vector3(-2, 0, -1), forRoles: ['visitor'], animation: 'sit' },
    { name: 'table2', offset: new Vector3(2, 0, -1), forRoles: ['visitor'], animation: 'sit' },
    { name: 'serving', offset: new Vector3(0, 0, 0), forRoles: ['employee'], animation: 'walk' },
  ],
  Shop: [
    { name: 'counter', offset: new Vector3(0, 0, 2), forRoles: ['owner', 'employee'], animation: 'idle' },
    { name: 'shelf1', offset: new Vector3(-3, 0, 0), forRoles: ['employee'], animation: 'work' },
    { name: 'browsing', offset: new Vector3(2, 0, -1), forRoles: ['visitor'], animation: 'idle' },
  ],
  GroceryStore: [
    { name: 'counter', offset: new Vector3(0, 0, 2), forRoles: ['owner', 'employee'], animation: 'idle' },
    { name: 'aisle', offset: new Vector3(-2, 0, 0), forRoles: ['visitor'], animation: 'walk' },
    { name: 'shelf', offset: new Vector3(2, 0, 1), forRoles: ['employee'], animation: 'work' },
  ],
  Hospital: [
    { name: 'desk', offset: new Vector3(0, 0, 2), forRoles: ['owner', 'employee'], animation: 'work' },
    { name: 'bed1', offset: new Vector3(-3, 0, -1), forRoles: ['visitor'], animation: 'idle' },
    { name: 'bed2', offset: new Vector3(3, 0, -1), forRoles: ['visitor'], animation: 'idle' },
  ],
  Church: [
    { name: 'altar', offset: new Vector3(0, 0, 3), forRoles: ['owner', 'employee'], animation: 'talk' },
    { name: 'pew1', offset: new Vector3(-2, 0, -1), forRoles: ['visitor'], animation: 'sit' },
    { name: 'pew2', offset: new Vector3(2, 0, -1), forRoles: ['visitor'], animation: 'sit' },
  ],
  School: [
    { name: 'desk', offset: new Vector3(0, 0, 3), forRoles: ['owner', 'employee'], animation: 'talk' },
    { name: 'seat1', offset: new Vector3(-2, 0, -1), forRoles: ['visitor'], animation: 'sit' },
    { name: 'seat2', offset: new Vector3(2, 0, -1), forRoles: ['visitor'], animation: 'sit' },
  ],
};

/** Default furniture roles for unknown business types */
const DEFAULT_FURNITURE_ROLES: FurnitureRole[] = [
  { name: 'center', offset: new Vector3(0, 0, 1), forRoles: ['owner', 'employee'], animation: 'idle' },
  { name: 'corner', offset: new Vector3(-2, 0, -2), forRoles: ['visitor'], animation: 'idle' },
];

/** Residence furniture roles */
const RESIDENCE_FURNITURE_ROLES: FurnitureRole[] = [
  { name: 'chair', offset: new Vector3(0, 0, 0), forRoles: ['owner', 'visitor'], animation: 'sit' },
  { name: 'table', offset: new Vector3(-1.5, 0, 1), forRoles: ['visitor'], animation: 'idle' },
  { name: 'bed', offset: new Vector3(2, 0, 2), forRoles: ['owner'], animation: 'idle' },
];

/** Greeting templates by business type */
const BUSINESS_GREETINGS: Record<string, string[]> = {
  Bakery: ['Welcome! Fresh bread today.', 'What can I get you?', 'Everything is freshly baked!'],
  Bar: ['What\'ll it be?', 'Welcome, take a seat!', 'Thirsty? We\'ve got plenty.'],
  Restaurant: ['Welcome! Table for one?', 'Come in, come in!', 'Today\'s special is excellent.'],
  Shop: ['Welcome to my shop!', 'Looking for anything special?', 'Browse as long as you like.'],
  GroceryStore: ['Welcome! Need anything?', 'Fresh produce today!', 'Let me know if you need help.'],
  Hospital: ['How can I help you?', 'Please, take a seat.'],
  Church: ['Welcome, traveler.', 'Peace be with you.'],
  School: ['Welcome to class!', 'Please find a seat.'],
};

const DEFAULT_GREETINGS = ['Hello there.', 'Welcome.', 'Can I help you?'];

export class InteriorNPCManager {
  private callbacks: InteriorNPCCallbacks;

  // Currently placed interior NPCs
  private placedNPCs: Map<string, PlacedInteriorNPC> = new Map();
  private activeBuildingId: string | null = null;
  private activeInterior: InteriorLayout | null = null;

  constructor(callbacks: InteriorNPCCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Called when player enters a building. Determines which NPCs should appear
   * inside and positions them at role-appropriate furniture.
   *
   * @param buildingId The building being entered
   * @param interior The interior layout
   * @param metadata Building metadata with employees/occupants
   * @param allNPCs Map of all NPC instances (from BabylonGame.npcMeshes)
   * @param playerCharacterId The player's character ID (to compute relationship priority)
   */
  populateInterior(
    buildingId: string,
    interior: InteriorLayout,
    metadata: BuildingMetadata,
    allNPCs: Map<string, { mesh: Mesh; characterData?: any }>,
    playerCharacterId?: string
  ): PlacedInteriorNPC[] {
    // Clean up any previous interior NPCs
    this.clearInterior();

    this.activeBuildingId = buildingId;
    this.activeInterior = interior;

    // Determine which NPCs should be inside
    const candidates = this.findCandidateNPCs(metadata, allNPCs, playerCharacterId);

    // Cap at MAX_INTERIOR_NPCS
    const npcsToPlace = candidates.slice(0, MAX_INTERIOR_NPCS);

    // Get furniture roles for this building type
    const furnitureRoles = this.getFurnitureRoles(interior.buildingType, metadata.businessType);

    // Place each NPC at an appropriate position
    const placed: PlacedInteriorNPC[] = [];
    const usedFurniture = new Set<number>();

    for (const npc of npcsToPlace) {
      // Find best furniture role for this NPC
      const furnitureIdx = this.findFurnitureForRole(furnitureRoles, npc.role, usedFurniture);
      const furniture = furnitureIdx >= 0 ? furnitureRoles[furnitureIdx] : null;

      if (furnitureIdx >= 0) usedFurniture.add(furnitureIdx);

      // Calculate position within interior
      const offset = furniture?.offset ?? new Vector3(
        (Math.random() - 0.5) * (interior.width * 0.6),
        0,
        (Math.random() - 0.5) * (interior.depth * 0.6)
      );
      const interiorPos = new Vector3(
        interior.position.x + offset.x,
        interior.position.y + 0.1,
        interior.position.z + offset.z
      );

      const animState = furniture?.animation ?? 'idle';

      // Save NPC state and teleport to interior
      const savedPos = npc.mesh.position.clone();
      const wasEnabled = npc.mesh.isEnabled();

      npc.mesh.position = interiorPos.clone();
      npc.mesh.setEnabled(true);

      const placedNpc: PlacedInteriorNPC = {
        npcId: npc.id,
        mesh: npc.mesh,
        role: npc.role,
        interiorPosition: interiorPos,
        savedPosition: savedPos,
        wasEnabled,
        animationState: animState,
        characterData: npc.characterData,
      };

      this.placedNPCs.set(npc.id, placedNpc);
      placed.push(placedNpc);

      // Set animation
      this.callbacks.onAnimationChange?.(npc.id, animState);

      // Face toward door (player entry point)
      this.callbacks.onFaceDirection?.(npc.id, interior.doorPosition);
    }

    // Trigger greetings after a short delay
    this.triggerGreetings(metadata.businessType, interior.buildingType);

    return placed;
  }

  /**
   * Clear all interior NPCs and restore them to overworld positions.
   */
  clearInterior(): void {
    const entries = Array.from(this.placedNPCs.values());
    for (const npc of entries) {
      // Restore overworld position
      npc.mesh.position = npc.savedPosition.clone();
      npc.mesh.setEnabled(npc.wasEnabled);

      // Reset to idle animation
      this.callbacks.onAnimationChange?.(npc.npcId, 'idle');
    }

    this.placedNPCs.clear();
    this.activeBuildingId = null;
    this.activeInterior = null;
  }

  /**
   * Get the list of NPCs currently placed in an interior.
   */
  getPlacedNPCs(): PlacedInteriorNPC[] {
    return Array.from(this.placedNPCs.values());
  }

  /**
   * Check if a specific NPC is currently inside an interior.
   */
  isNPCInside(npcId: string): boolean {
    return this.placedNPCs.has(npcId);
  }

  /**
   * Get the active building ID.
   */
  getActiveBuildingId(): string | null {
    return this.activeBuildingId;
  }

  /**
   * Get how many NPCs are currently placed.
   */
  getPlacedCount(): number {
    return this.placedNPCs.size;
  }

  /**
   * Get a specific placed NPC.
   */
  getPlacedNPC(npcId: string): PlacedInteriorNPC | undefined {
    return this.placedNPCs.get(npcId);
  }

  /**
   * Find candidate NPCs for the interior based on building metadata.
   * Priority: employees first, then owner, then visitors by relationship.
   */
  private findCandidateNPCs(
    metadata: BuildingMetadata,
    allNPCs: Map<string, { mesh: Mesh; characterData?: any }>,
    playerCharacterId?: string
  ): InteriorNPCData[] {
    const candidates: InteriorNPCData[] = [];
    const addedIds = new Set<string>();
    const gameHour = this.callbacks.getGameHour?.() ?? 12;

    // Check if within business hours (roughly 7-20)
    const isBusinessHours = gameHour >= 7 && gameHour <= 20;

    // Add owner
    if (metadata.ownerId && allNPCs.has(metadata.ownerId)) {
      const npc = allNPCs.get(metadata.ownerId)!;
      if (isBusinessHours || metadata.buildingType === 'residence') {
        candidates.push({ id: metadata.ownerId, mesh: npc.mesh, characterData: npc.characterData, role: 'owner' });
        addedIds.add(metadata.ownerId);
      }
    }

    // Add employees (during business hours)
    if (metadata.employees && isBusinessHours) {
      for (const emp of metadata.employees) {
        const empId = typeof emp === 'string' ? emp : emp.id;
        if (addedIds.has(empId) || !allNPCs.has(empId)) continue;
        const npc = allNPCs.get(empId)!;
        candidates.push({ id: empId, mesh: npc.mesh, characterData: npc.characterData, role: 'employee' });
        addedIds.add(empId);
      }
    }

    // Add occupants for residences
    if (metadata.occupants) {
      for (const occ of metadata.occupants) {
        const occId = typeof occ === 'string' ? occ : occ.id;
        if (addedIds.has(occId) || !allNPCs.has(occId)) continue;
        const npc = allNPCs.get(occId)!;
        candidates.push({ id: occId, mesh: npc.mesh, characterData: npc.characterData, role: 'owner' });
        addedIds.add(occId);
      }
    }

    // Add visitors: other NPCs who might be at this location
    // Prioritize by relationship strength with player
    if (metadata.buildingType === 'business' && isBusinessHours) {
      const visitors: Array<{ id: string; mesh: Mesh; characterData?: any; relationshipScore: number }> = [];
      const entries = Array.from(allNPCs.entries());
      for (const [npcId, npc] of entries) {
        if (addedIds.has(npcId)) continue;
        if (candidates.length + visitors.length >= MAX_INTERIOR_NPCS) break;

        // Check if NPC has a relationship with player (higher = priority visitor)
        let relScore = 0;
        if (playerCharacterId && npc.characterData?.relationships) {
          const rel = npc.characterData.relationships[playerCharacterId];
          if (rel) relScore = rel.strength ?? 0;
        }

        // Only add a few visitors (randomized based on NPC personality)
        const extroversion = npc.characterData?.personality?.extroversion ?? 0.5;
        if (Math.random() < extroversion * 0.15) {
          visitors.push({ id: npcId, mesh: npc.mesh, characterData: npc.characterData, relationshipScore: relScore });
        }
      }

      // Sort visitors by relationship (highest first)
      visitors.sort((a, b) => b.relationshipScore - a.relationshipScore);

      for (const v of visitors) {
        if (candidates.length >= MAX_INTERIOR_NPCS) break;
        candidates.push({ id: v.id, mesh: v.mesh, characterData: v.characterData, role: 'visitor' });
        addedIds.add(v.id);
      }
    }

    return candidates;
  }

  /**
   * Get furniture role positions for a building type.
   */
  private getFurnitureRoles(buildingType: string, businessType?: string): FurnitureRole[] {
    if (buildingType === 'residence') return RESIDENCE_FURNITURE_ROLES;
    if (businessType && BUSINESS_FURNITURE_ROLES[businessType]) {
      return BUSINESS_FURNITURE_ROLES[businessType];
    }
    return DEFAULT_FURNITURE_ROLES;
  }

  /**
   * Find the best available furniture position for an NPC role.
   */
  private findFurnitureForRole(
    roles: FurnitureRole[],
    npcRole: 'employee' | 'owner' | 'visitor',
    usedIndices: Set<number>
  ): number {
    // First try: exact role match on unused furniture
    for (let i = 0; i < roles.length; i++) {
      if (usedIndices.has(i)) continue;
      if (roles[i].forRoles.includes(npcRole)) return i;
    }
    // Fallback: any unused furniture
    for (let i = 0; i < roles.length; i++) {
      if (!usedIndices.has(i)) return i;
    }
    return -1;
  }

  /**
   * Trigger greeting from the first employee/owner NPC.
   */
  private triggerGreetings(businessType?: string, buildingType?: string): void {
    if (!this.callbacks.onNPCGreeting) return;

    // Find the first employee or owner to greet
    const entries = Array.from(this.placedNPCs.values());
    const greeter = entries.find(n => n.role === 'owner' || n.role === 'employee');
    if (!greeter) return;

    const greetings = (businessType && BUSINESS_GREETINGS[businessType])
      ? BUSINESS_GREETINGS[businessType]
      : (buildingType === 'residence' ? ['Make yourself at home.', 'Welcome to my home.'] : DEFAULT_GREETINGS);

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    this.callbacks.onNPCGreeting(greeter.npcId, greeting);
  }

  /**
   * Clean up all resources.
   */
  dispose(): void {
    this.clearInterior();
  }
}
