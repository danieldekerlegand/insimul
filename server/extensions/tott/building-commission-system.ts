/**
 * Building Commission System
 * 
 * Implements building construction requests, construction process, and completion.
 * Based on Talk of the Town's business.py construction events.
 * 
 * Features:
 * - Building commission requests (houses, businesses)
 * - Construction timeline tracking
 * - Architect/builder involvement
 * - Economic costs
 * - Completion events
 * - Dynamic town growth
 */

import { storage } from '../../db/storage';
import * as PlaythroughOverlay from '../../services/playthrough-overlay.js';
import type { Business, BusinessType, Lot, Character, InsertTruth } from '@shared/schema';
import { getPersonality } from './personality-behavior-system.js';
import { getBusinessEmployees, type OccupationData } from './hiring-system.js';
import { closeBusiness, transferOwnership } from './business-system.js';
import { prologAssertFact } from './prolog-queries.js';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export type BuildingType = 
  | 'house' 
  | 'apartment' 
  | 'business' 
  | 'restaurant' 
  | 'shop' 
  | 'office' 
  | 'factory'
  | 'farm';

export type ConstructionStatus = 
  | 'commissioned'      // Requested but not started
  | 'in_progress'       // Currently being built
  | 'completed'         // Finished
  | 'abandoned'         // Stopped before completion
  | 'delayed';          // Behind schedule

export interface BuildingCommission {
  id: string;
  type: BuildingType;
  commissionerId: string;       // Character who requested it
  commissionerName: string;
  
  // Construction details
  architectId: string | null;   // Architect designing it
  builderId: string | null;     // Primary builder
  contractorIds: string[];      // All workers involved
  
  // Location
  worldId: string;
  settlementId: string | null;
  lotId: string | null;         // Where it's being built
  address: string | null;
  
  // Timeline
  commissionedAt: number;       // Timestep commissioned
  constructionStarted: number | null;
  expectedCompletion: number | null;
  actualCompletion: number | null;
  
  // Status
  status: ConstructionStatus;
  progressPercentage: number;   // 0-100
  
  // Economics
  estimatedCost: number;
  actualCost: number;
  paidSoFar: number;
  
  // Description
  description: string;
  purpose: string | null;       // Why it's being built
}

export interface ConstructionEvent {
  commissionId: string;
  type: 'started' | 'milestone' | 'delayed' | 'completed' | 'abandoned';
  timestep: number;
  description: string;
  progressBefore: number;
  progressAfter: number;
}

// Construction durations (in timesteps/days)
const CONSTRUCTION_DURATIONS = {
  house: 180,          // ~6 months
  apartment: 365,      // ~1 year
  business: 120,       // ~4 months
  restaurant: 90,      // ~3 months
  shop: 60,            // ~2 months
  office: 150,         // ~5 months
  factory: 300,        // ~10 months
  farm: 90             // ~3 months (structures only)
};

// Construction costs (base amounts)
const CONSTRUCTION_COSTS = {
  house: 5000,
  apartment: 15000,
  business: 8000,
  restaurant: 6000,
  shop: 4000,
  office: 10000,
  factory: 20000,
  farm: 3000
};

// ============================================================================
// COMMISSIONING
// ============================================================================

/**
 * Commission a new building
 */
export async function commissionBuilding(
  commissionerId: string,
  buildingType: BuildingType,
  worldId: string,
  settlementId: string | null,
  purpose: string,
  currentTimestep: number
): Promise<BuildingCommission> {
  const commissioner = await storage.getCharacter(commissionerId);
  if (!commissioner) {
    throw new Error('Commissioner not found');
  }
  
  // Calculate costs (varies by type and random factors)
  const baseCost = CONSTRUCTION_COSTS[buildingType];
  const costVariation = 0.8 + (Math.random() * 0.4); // 80-120% of base
  const estimatedCost = Math.floor(baseCost * costVariation);
  
  // Calculate duration
  const baseDuration = CONSTRUCTION_DURATIONS[buildingType];
  const durationVariation = 0.9 + (Math.random() * 0.3); // 90-120% of base
  const duration = Math.floor(baseDuration * durationVariation);
  
  const commission: BuildingCommission = {
    id: generateCommissionId(),
    type: buildingType,
    commissionerId,
    commissionerName: commissioner.firstName,
    architectId: null,
    builderId: null,
    contractorIds: [],
    worldId,
    settlementId,
    lotId: null,
    address: null,
    commissionedAt: currentTimestep,
    constructionStarted: null,
    expectedCompletion: currentTimestep + duration,
    actualCompletion: null,
    status: 'commissioned',
    progressPercentage: 0,
    estimatedCost,
    actualCost: 0,
    paidSoFar: 0,
    description: `New ${buildingType} commissioned by ${commissioner.firstName}`,
    purpose
  };
  
  // Store commission
  await saveCommission(commission);
  
  console.log(`🏗️ ${commissioner.firstName} commissioned a ${buildingType} (est. ${estimatedCost} coins, ${duration} days)`);
  
  return commission;
}

/**
 * Assign architect to commission
 */
export async function assignArchitect(
  commissionId: string,
  architectId: string
): Promise<void> {
  const commission = await getCommission(commissionId);
  if (!commission) throw new Error('Commission not found');
  
  const architect = await storage.getCharacter(architectId);
  if (!architect) throw new Error('Architect not found');
  
  commission.architectId = architectId;
  
  await saveCommission(commission);
  
  console.log(`📐 ${architect.firstName} assigned as architect for ${commission.type}`);
}

/**
 * Assign builder/contractors to commission
 */
export async function assignBuilder(
  commissionId: string,
  builderId: string,
  contractorIds: string[] = []
): Promise<void> {
  const commission = await getCommission(commissionId);
  if (!commission) throw new Error('Commission not found');
  
  const builder = await storage.getCharacter(builderId);
  if (!builder) throw new Error('Builder not found');
  
  commission.builderId = builderId;
  commission.contractorIds = contractorIds;
  
  await saveCommission(commission);
  
  console.log(`🔨 ${builder.firstName} assigned as builder for ${commission.type} (${contractorIds.length} contractors)`);
}

// ============================================================================
// CONSTRUCTION PROCESS
// ============================================================================

/**
 * Start construction
 */
export async function startConstruction(
  commissionId: string,
  currentTimestep: number
): Promise<void> {
  const commission = await getCommission(commissionId);
  if (!commission) throw new Error('Commission not found');
  
  if (commission.status !== 'commissioned') {
    throw new Error('Commission must be in commissioned state to start');
  }
  
  commission.status = 'in_progress';
  commission.constructionStarted = currentTimestep;
  
  await saveCommission(commission);
  
  const event: ConstructionEvent = {
    commissionId,
    type: 'started',
    timestep: currentTimestep,
    description: `Construction of ${commission.type} has begun`,
    progressBefore: 0,
    progressAfter: 0
  };
  
  await saveConstructionEvent(event);
  
  console.log(`🏗️ Construction started: ${commission.description}`);
}

/**
 * Update construction progress (called during simulation timesteps)
 */
export async function updateConstructionProgress(
  commissionId: string,
  currentTimestep: number
): Promise<{
  progress: number;
  milestoneReached: boolean;
  completed: boolean;
  delayed: boolean;
}> {
  const commission = await getCommission(commissionId);
  if (!commission) {
    return { progress: 0, milestoneReached: false, completed: false, delayed: false };
  }
  
  if (commission.status !== 'in_progress') {
    return { progress: commission.progressPercentage, milestoneReached: false, completed: false, delayed: false };
  }
  
  // Calculate expected progress
  const timeElapsed = currentTimestep - (commission.constructionStarted || currentTimestep);
  const totalDuration = (commission.expectedCompletion || currentTimestep) - (commission.constructionStarted || currentTimestep);
  const expectedProgress = totalDuration > 0 ? (timeElapsed / totalDuration) * 100 : 0;
  
  // Calculate actual progress (affected by workers, weather, etc.)
  const progressRate = calculateProgressRate(commission);
  const progressIncrease = progressRate; // Per timestep
  
  const oldProgress = commission.progressPercentage;
  commission.progressPercentage = Math.min(100, commission.progressPercentage + progressIncrease);
  
  // Check for milestones (25%, 50%, 75%)
  const milestones = [25, 50, 75];
  let milestoneReached = false;
  
  for (const milestone of milestones) {
    if (oldProgress < milestone && commission.progressPercentage >= milestone) {
      milestoneReached = true;
      
      const event: ConstructionEvent = {
        commissionId,
        type: 'milestone',
        timestep: currentTimestep,
        description: `${milestone}% complete`,
        progressBefore: oldProgress,
        progressAfter: commission.progressPercentage
      };
      
      await saveConstructionEvent(event);
      console.log(`🏗️ ${commission.type}: ${milestone}% complete`);
    }
  }
  
  // Check for delays
  let delayed = false;
  if (commission.progressPercentage < expectedProgress - 10 && commission.status === 'in_progress') {
    delayed = true;
    commission.status = 'delayed';
    
    const event: ConstructionEvent = {
      commissionId,
      type: 'delayed',
      timestep: currentTimestep,
      description: 'Construction is behind schedule',
      progressBefore: oldProgress,
      progressAfter: commission.progressPercentage
    };
    
    await saveConstructionEvent(event);
    console.log(`⚠️ ${commission.type}: Construction delayed (${commission.progressPercentage.toFixed(1)}% vs expected ${expectedProgress.toFixed(1)}%)`);
  }
  
  // Check for completion
  let completed = false;
  if (commission.progressPercentage >= 100) {
    completed = true;
    await completeConstruction(commissionId, currentTimestep);
  }
  
  // Update actual cost
  commission.actualCost += progressIncrease * (commission.estimatedCost / 100);
  
  await saveCommission(commission);
  
  return {
    progress: commission.progressPercentage,
    milestoneReached,
    completed,
    delayed
  };
}

/**
 * Complete construction
 */
async function completeConstruction(
  commissionId: string,
  currentTimestep: number
): Promise<void> {
  const commission = await getCommission(commissionId);
  if (!commission) return;
  
  commission.status = 'completed';
  commission.actualCompletion = currentTimestep;
  commission.progressPercentage = 100;
  
  const event: ConstructionEvent = {
    commissionId,
    type: 'completed',
    timestep: currentTimestep,
    description: `${commission.type} construction completed!`,
    progressBefore: 99,
    progressAfter: 100
  };
  
  await saveConstructionEvent(event);
  await saveCommission(commission);
  
  console.log(`🎉 Construction complete: ${commission.description} (took ${currentTimestep - (commission.constructionStarted || currentTimestep)} days, cost ${Math.floor(commission.actualCost)} coins)`);
  
  // Create the actual building in the world
  await createBuilding(commission);
}

/**
 * Abandon construction
 */
export async function abandonConstruction(
  commissionId: string,
  reason: string,
  currentTimestep: number
): Promise<void> {
  const commission = await getCommission(commissionId);
  if (!commission) return;
  
  commission.status = 'abandoned';
  
  const event: ConstructionEvent = {
    commissionId,
    type: 'abandoned',
    timestep: currentTimestep,
    description: `Construction abandoned: ${reason}`,
    progressBefore: commission.progressPercentage,
    progressAfter: commission.progressPercentage
  };
  
  await saveConstructionEvent(event);
  await saveCommission(commission);
  
  console.log(`❌ Construction abandoned: ${commission.description} (${reason})`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate progress rate based on workers and conditions
 */
function calculateProgressRate(commission: BuildingCommission): number {
  // Base progress: complete in estimated time
  const baseDuration = CONSTRUCTION_DURATIONS[commission.type];
  let baseRate = 100 / baseDuration; // Percentage per day
  
  // Modifier based on number of workers
  const workerCount = commission.contractorIds.length + (commission.builderId ? 1 : 0);
  const workerModifier = Math.min(2.0, 0.5 + (workerCount * 0.15)); // 0.5x to 2.0x
  
  // Random daily variation (weather, issues, etc.)
  const dailyVariation = 0.8 + (Math.random() * 0.4); // 80-120%
  
  return baseRate * workerModifier * dailyVariation;
}

/**
 * Create actual building in world after completion
 */
async function createBuilding(commission: BuildingCommission): Promise<void> {
  const commissioner = await storage.getCharacter(commission.commissionerId);
  if (!commissioner) return;

  // Track on the commissioner's customData
  const customData = (commissioner as any).customData || {};
  const commissions = customData.completedBuildings as string[] || [];
  commissions.push(commission.id);

  await storage.updateCharacter(commission.commissionerId, {
    customData: {
      ...customData,
      completedBuildings: commissions
    }
  } as any);

  // Update the lot if one was assigned to this commission
  if (commission.lotId) {
    const lot = await storage.getLot(commission.lotId);
    if (lot) {
      const buildingType = commission.type === 'house' || commission.type === 'apartment'
        ? 'residence'
        : 'business';
      await storage.updateLot(commission.lotId, {
        buildingId: commission.id,
        buildingType
      });
    }
  }

  console.log(`Building ${commission.type} added to world for ${commissioner.firstName}`);
}

/**
 * Generate unique commission ID
 */
function generateCommissionId(): string {
  return `commission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

/**
 * Save commission to storage
 */
async function saveCommission(commission: BuildingCommission): Promise<void> {
  // Store in a global commissions collection (simplified)
  // In production, this would be a proper database table
  const worldData = await storage.getWorld(commission.worldId);
  if (!worldData) return;
  
  const customData = (worldData as any).customData || {};
  const commissions = customData.buildingCommissions as Record<string, BuildingCommission> || {};
  commissions[commission.id] = commission;
  
  await storage.updateWorld(commission.worldId, {
    customData: {
      ...customData,
      buildingCommissions: commissions
    }
  } as any);
}

/**
 * Get commission from storage
 */
async function getCommission(commissionId: string): Promise<BuildingCommission | null> {
  // This is a simplified version - would need to query across worlds
  // For now, assuming we have the commission ID and can find it
  
  // Placeholder: In real implementation, search through world data
  return null;
}

/**
 * Save construction event
 */
async function saveConstructionEvent(event: ConstructionEvent): Promise<void> {
  // Store construction history
  // Simplified - would store in a proper events table
  console.log(`📋 Construction event: ${event.description}`);
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all commissions in a world
 */
export async function getCommissionsByWorld(worldId: string): Promise<BuildingCommission[]> {
  const worldData = await storage.getWorld(worldId);
  if (!worldData) return [];
  
  const customData = (worldData as any).customData || {};
  const commissions = customData.buildingCommissions as Record<string, BuildingCommission> || {};
  
  return Object.values(commissions);
}

/**
 * Get active (in-progress) commissions
 */
export async function getActiveCommissions(worldId: string): Promise<BuildingCommission[]> {
  const all = await getCommissionsByWorld(worldId);
  return all.filter(c => c.status === 'in_progress' || c.status === 'commissioned');
}

/**
 * Get commissions by character
 */
export async function getCommissionsByCharacter(characterId: string): Promise<BuildingCommission[]> {
  const character = await storage.getCharacter(characterId);
  if (!character) return [];
  
  const all = await getCommissionsByWorld(character.worldId);
  return all.filter(c => 
    c.commissionerId === characterId || 
    c.architectId === characterId || 
    c.builderId === characterId ||
    c.contractorIds.includes(characterId)
  );
}

/**
 * Get construction events for commission
 */
export async function getConstructionEvents(commissionId: string): Promise<ConstructionEvent[]> {
  // Simplified - would query from events table
  return [];
}

// ============================================================================
// AUTONOMOUS COMMISSIONING
// ============================================================================

/**
 * Check if character should commission a building
 * Based on needs, wealth, and personality
 */
export async function checkBuildingNeed(
  characterId: string,
  currentTimestep: number
): Promise<{
  shouldCommission: boolean;
  buildingType: BuildingType | null;
  reason: string | null;
}> {
  const character = await storage.getCharacter(characterId);
  if (!character) {
    return { shouldCommission: false, buildingType: null, reason: null };
  }
  
  const customData = (character as any).customData || {};
  const wealth = customData.wealth as number || 0;
  
  // Need enough wealth to commission
  if (wealth < 2000) {
    return { shouldCommission: false, buildingType: null, reason: null };
  }
  
  const personality = getPersonality(character);
  
  // Check if already has a home
  const hasHome = customData.residenceId as string | undefined;
  
  if (!hasHome && wealth > 5000) {
    // Needs a house
    return {
      shouldCommission: true,
      buildingType: 'house',
      reason: 'needs a home'
    };
  }
  
  // Check if wants to start a business (high openness + conscientiousness)
  const entrepreneurial = personality.openness > 0.6 && personality.conscientiousness > 0.6;
  const hasOwnBusiness = customData.ownsBusiness as boolean | undefined;
  
  if (entrepreneurial && !hasOwnBusiness && wealth > 8000) {
    if (Math.random() < 0.1) { // 10% chance per check
      const businessTypes: BuildingType[] = ['business', 'shop', 'restaurant'];
      return {
        shouldCommission: true,
        buildingType: businessTypes[Math.floor(Math.random() * businessTypes.length)],
        reason: 'wants to start a business'
      };
    }
  }
  
  return { shouldCommission: false, buildingType: null, reason: null };
}

/**
 * Process all building commissions in world (called during timestep)
 */
export async function processAllConstructions(
  worldId: string,
  currentTimestep: number
): Promise<{
  updated: number;
  milestones: number;
  completed: number;
  delayed: number;
}> {
  const active = await getActiveCommissions(worldId);
  
  let updated = 0;
  let milestones = 0;
  let completedCount = 0;
  let delayedCount = 0;
  
  for (const commission of active) {
    if (commission.status === 'in_progress') {
      const result = await updateConstructionProgress(commission.id, currentTimestep);
      updated++;
      if (result.milestoneReached) milestones++;
      if (result.completed) completedCount++;
      if (result.delayed) delayedCount++;
    }
  }
  
  return { updated, milestones, completed: completedCount, delayed: delayedCount };
}

// ============================================================================
// DESCRIPTION
// ============================================================================

/**
 * Get construction status description
 */
export function getConstructionStatusDescription(commission: BuildingCommission): string {
  switch (commission.status) {
    case 'commissioned':
      return `Commissioned but not started (${commission.progressPercentage.toFixed(1)}%)`;
    case 'in_progress':
      return `Under construction (${commission.progressPercentage.toFixed(1)}% complete)`;
    case 'delayed':
      return `Behind schedule (${commission.progressPercentage.toFixed(1)}% complete)`;
    case 'completed':
      return `Completed`;
    case 'abandoned':
      return `Abandoned at ${commission.progressPercentage.toFixed(1)}%`;
    default:
      return 'Unknown status';
  }
}

/**
 * Get construction timeline description
 */
export function getTimelineDescription(commission: BuildingCommission, currentTimestep: number): string {
  const parts: string[] = [];
  
  parts.push(`Commissioned at timestep ${commission.commissionedAt}`);
  
  if (commission.constructionStarted) {
    const daysInProgress = currentTimestep - commission.constructionStarted;
    parts.push(`Started ${daysInProgress} days ago`);
  }
  
  if (commission.expectedCompletion && commission.status !== 'completed') {
    const daysRemaining = commission.expectedCompletion - currentTimestep;
    if (daysRemaining > 0) {
      parts.push(`Expected completion in ${daysRemaining} days`);
    } else {
      parts.push(`Overdue by ${Math.abs(daysRemaining)} days`);
    }
  }
  
  if (commission.actualCompletion) {
    const totalTime = commission.actualCompletion - commission.commissionedAt;
    parts.push(`Completed after ${totalTime} days`);
  }
  
  return parts.join('. ');
}

// ============================================================================
// BUILDING LIFECYCLE TYPES
// ============================================================================

export interface ConstructionResult {
  lot: Lot;
  business?: Business;
  buildingId: string;
}

export interface DemolitionResult {
  lot: Lot;
  formerBuildingId: string;
}

export interface RenovationResult {
  lot: Lot;
  business: Business;
  previousBusinessType: string;
}

export interface SuccessionResult {
  businessId: string;
  outcome: 'family_successor' | 'employee_successor' | 'business_closed';
  successorId?: string;
  successorName?: string;
  successorRelation?: string;
}

// ============================================================================
// BUILDING LIFECYCLE
// ============================================================================

/**
 * Construct a building on a vacant lot and optionally assign a business to it.
 *
 * This is called after a building commission completes (or directly when founding
 * a business that needs a physical location). It:
 *   1. Validates the lot exists and is vacant
 *   2. Creates a business record if a businessId is not already provided
 *   3. Updates the lot to mark it as occupied with the building reference
 *   4. Asserts Prolog facts for the new building
 */
export async function constructBuilding(
  worldId: string,
  lotId: string,
  businessId: string | null,
  buildingType: BuildingType | string
): Promise<ConstructionResult> {
  // Fetch the lot
  const lot = await storage.getLot(lotId);
  if (!lot) {
    throw new Error(`Lot ${lotId} not found`);
  }

  // Check lot is vacant
  if (lot.buildingId && lot.buildingType !== 'vacant') {
    throw new Error(
      `Lot ${lotId} is not vacant — currently occupied by building ${lot.buildingId} (${lot.buildingType})`
    );
  }

  // Determine what the lot will hold
  const isResidential = buildingType === 'house' || buildingType === 'apartment';
  const lotBuildingType = isResidential ? 'residence' : 'business';

  let business: Business | undefined;
  let buildingId: string;

  if (businessId) {
    // Link an existing business to this lot
    const existingBusiness = await storage.getBusiness(businessId);
    if (!existingBusiness) {
      throw new Error(`Business ${businessId} not found`);
    }
    business = existingBusiness;
    buildingId = businessId;

    // Update the business to reference this lot
    await storage.updateBusiness(businessId, { lotId });
  } else {
    // The buildingId is the lot itself for vacant-to-occupied transitions
    // without a specific business entity (e.g., residential construction)
    buildingId = lotId;
  }

  // Update lot to mark as occupied
  const updatedLot = await storage.updateLot(lotId, {
    buildingId,
    buildingType: lotBuildingType,
  });

  if (!updatedLot) {
    throw new Error(`Failed to update lot ${lotId}`);
  }

  console.log(
    `[building-lifecycle] Constructed ${buildingType} on lot ${lotId} (building: ${buildingId})`
  );

  // Assert Prolog fact
  const prologLotId = lotId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const prologBuildingId = buildingId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  await prologAssertFact(
    worldId,
    `building(${prologBuildingId}, ${buildingType}, ${prologLotId})`
  );

  return {
    lot: updatedLot,
    business,
    buildingId,
  };
}

/**
 * Demolish a building and return its lot to vacant status.
 *
 * If the building is a business, the business must already be closed
 * (isOutOfBusiness === true) before demolition. The demolished building ID
 * is appended to the lot's formerBuildingIds for historical tracking.
 */
export async function demolishBuilding(
  worldId: string,
  buildingId: string
): Promise<DemolitionResult> {
  // Find the lot that references this building
  const lot = await findLotByBuildingId(worldId, buildingId);
  if (!lot) {
    throw new Error(
      `No lot found with building ${buildingId} in world ${worldId}`
    );
  }

  // If it's a business, ensure it is closed
  if (lot.buildingType === 'business') {
    const business = await storage.getBusiness(buildingId);
    if (business && !business.isOutOfBusiness) {
      throw new Error(
        `Business ${business.name} (${buildingId}) is still active — close it before demolishing`
      );
    }

    // Clear the business's lot reference
    if (business) {
      await storage.updateBusiness(buildingId, { lotId: null } as any);
    }
  }

  // Track former building in lot history
  const formerBuildingIds = [...(lot.formerBuildingIds || []), buildingId];

  // Return lot to vacant
  const updatedLot = await storage.updateLot(lot.id, {
    buildingId: null,
    buildingType: 'vacant',
    formerBuildingIds,
  } as any);

  if (!updatedLot) {
    throw new Error(`Failed to update lot ${lot.id} during demolition`);
  }

  console.log(
    `[building-lifecycle] Demolished building ${buildingId} on lot ${lot.id} — lot is now vacant`
  );

  // Assert Prolog fact
  const prologBuildingId = buildingId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  await prologAssertFact(worldId, `demolished(${prologBuildingId})`);

  return {
    lot: updatedLot,
    formerBuildingId: buildingId,
  };
}

/**
 * Renovate an existing building to change its business type without demolition.
 *
 * This keeps the same lot and building ID but changes what kind of business
 * operates there (e.g., converting a bakery into a restaurant).
 */
export async function renovateBuilding(
  worldId: string,
  buildingId: string,
  newBusinessType: BusinessType
): Promise<RenovationResult> {
  // Fetch the business
  const business = await storage.getBusiness(buildingId);
  if (!business) {
    throw new Error(`Business ${buildingId} not found for renovation`);
  }

  if (business.isOutOfBusiness) {
    throw new Error(
      `Cannot renovate closed business ${business.name} — reopen or construct a new building instead`
    );
  }

  const previousBusinessType = business.businessType;

  // Update business type
  await storage.updateBusiness(buildingId, {
    businessType: newBusinessType,
  });

  // Find the lot for return value
  let lot: Lot | undefined;
  if (business.lotId) {
    lot = await storage.getLot(business.lotId);
  }
  if (!lot) {
    const foundLot = await findLotByBuildingId(worldId, buildingId);
    if (foundLot) lot = foundLot;
  }

  if (!lot) {
    throw new Error(`No lot found for business ${buildingId}`);
  }

  console.log(
    `[building-lifecycle] Renovated building ${buildingId}: ${previousBusinessType} -> ${newBusinessType}`
  );

  // Assert Prolog fact
  const prologBuildingId = buildingId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const prologNewType = (newBusinessType as string).toLowerCase().replace(/[^a-z0-9_]/g, '_');
  await prologAssertFact(
    worldId,
    `renovated(${prologBuildingId}, ${prologNewType})`
  );

  // Fetch updated business
  const updatedBusiness = await storage.getBusiness(buildingId);

  return {
    lot,
    business: updatedBusiness || business,
    previousBusinessType,
  };
}

/**
 * Handle business succession when an owner retires, dies, or otherwise departs.
 *
 * Succession priority:
 *   1. Family members (spouse first, then adult children by age)
 *   2. Employees by seniority (longest-serving first)
 *   3. If no successor is found, the business closes
 *
 * Each outcome generates a truth entry documenting the succession event.
 */
export async function handleBusinessSuccession(
  worldId: string,
  businessId: string,
  departingOwnerId: string,
  playthroughId?: string,
): Promise<SuccessionResult> {
  const business = await storage.getBusiness(businessId);
  if (!business) {
    throw new Error(`Business ${businessId} not found`);
  }

  if (business.isOutOfBusiness) {
    throw new Error(`Business ${business.name} is already closed`);
  }

  const departingOwner = await storage.getCharacter(departingOwnerId);
  if (!departingOwner) {
    throw new Error(`Departing owner ${departingOwnerId} not found`);
  }

  const currentYear = new Date().getFullYear();
  const ownerName = `${departingOwner.firstName} ${departingOwner.lastName}`;

  // ---- Step 1: Check family members ----
  const familySuccessor = await findFamilySuccessor(departingOwner, worldId);
  if (familySuccessor) {
    const successorName = `${familySuccessor.character.firstName} ${familySuccessor.character.lastName}`;

    await transferOwnership({
      businessId,
      newOwnerId: familySuccessor.character.id,
      transferReason: 'inheritance',
      currentYear,
      currentTimestep: 0,
    });

    await createSuccessionTruth(worldId, playthroughId, {
      businessName: business.name,
      departingOwnerName: ownerName,
      departingOwnerId,
      successorName,
      successorId: familySuccessor.character.id,
      relation: familySuccessor.relation,
      outcome: 'family_successor',
    });

    console.log(
      `[building-lifecycle] ${successorName} (${familySuccessor.relation}) inherits ${business.name} from ${ownerName}`
    );

    return {
      businessId,
      outcome: 'family_successor',
      successorId: familySuccessor.character.id,
      successorName,
      successorRelation: familySuccessor.relation,
    };
  }

  // ---- Step 2: Check employees by seniority ----
  const employeeSuccessor = await findEmployeeSuccessor(businessId, worldId);
  if (employeeSuccessor) {
    const successorName = `${employeeSuccessor.character.firstName} ${employeeSuccessor.character.lastName}`;

    await transferOwnership({
      businessId,
      newOwnerId: employeeSuccessor.character.id,
      transferReason: 'sale',
      currentYear,
      currentTimestep: 0,
    });

    await createSuccessionTruth(worldId, playthroughId, {
      businessName: business.name,
      departingOwnerName: ownerName,
      departingOwnerId,
      successorName,
      successorId: employeeSuccessor.character.id,
      relation: 'senior employee',
      outcome: 'employee_successor',
    });

    console.log(
      `[building-lifecycle] Employee ${successorName} takes over ${business.name} from ${ownerName}`
    );

    return {
      businessId,
      outcome: 'employee_successor',
      successorId: employeeSuccessor.character.id,
      successorName,
      successorRelation: 'senior employee',
    };
  }

  // ---- Step 3: No successor — close the business ----
  await closeBusiness({
    businessId,
    reason: 'retirement',
    currentYear,
    currentTimestep: 0,
    notifyEmployees: true,
  });

  await createSuccessionTruth(worldId, playthroughId, {
    businessName: business.name,
    departingOwnerName: ownerName,
    departingOwnerId,
    successorName: undefined,
    successorId: undefined,
    relation: undefined,
    outcome: 'business_closed',
  });

  console.log(
    `[building-lifecycle] ${business.name} closes — no successor found for ${ownerName}`
  );

  return {
    businessId,
    outcome: 'business_closed',
  };
}

// ============================================================================
// BUILDING LIFECYCLE HELPERS
// ============================================================================

/**
 * Find a lot that references a given building ID.
 * Searches across all settlements in the world.
 */
async function findLotByBuildingId(
  worldId: string,
  buildingId: string
): Promise<Lot | undefined> {
  const world = await storage.getWorld(worldId);
  if (!world) return undefined;

  const settlements = await storage.getSettlementsByWorld(worldId);
  for (const settlement of settlements) {
    const lots = await storage.getLotsBySettlement(settlement.id);
    const match = lots.find((l) => l.buildingId === buildingId);
    if (match) return match;
  }

  return undefined;
}

/**
 * Find a family successor for a departing owner.
 * Priority: spouse, then adult children sorted by age (oldest first).
 */
async function findFamilySuccessor(
  departingOwner: Character,
  worldId: string
): Promise<{ character: Character; relation: string } | null> {
  const relationships = departingOwner.relationships as Record<
    string,
    { type: string; [key: string]: any }
  > | null;

  if (!relationships) return null;

  const spouseIds: string[] = [];
  const childIds: string[] = [];

  for (const [charId, rel] of Object.entries(relationships)) {
    const relType = (rel.type || '').toLowerCase();
    if (relType === 'spouse' || relType === 'married') {
      spouseIds.push(charId);
    } else if (relType === 'child' || relType === 'son' || relType === 'daughter') {
      childIds.push(charId);
    }
  }

  // Try spouse first
  for (const spouseId of spouseIds) {
    const spouse = await storage.getCharacter(spouseId);
    if (spouse && spouse.status === 'active' && !spouse.retired) {
      return { character: spouse, relation: 'spouse' };
    }
  }

  // Then children (oldest first — lowest birthYear)
  const children: Character[] = [];
  for (const childId of childIds) {
    const child = await storage.getCharacter(childId);
    if (child && child.status === 'active' && !child.retired) {
      const age = (departingOwner.birthYear || 0) > 0 && (child.birthYear || 0) > 0
        ? new Date().getFullYear() - (child.birthYear || 0)
        : 25;
      if (age >= 18) {
        children.push(child);
      }
    }
  }

  children.sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0));

  if (children.length > 0) {
    return { character: children[0], relation: 'child' };
  }

  return null;
}

/**
 * Find the most senior employee to succeed as owner.
 */
async function findEmployeeSuccessor(
  businessId: string,
  worldId: string
): Promise<{ character: Character; occupation: OccupationData } | null> {
  const employees = await getBusinessEmployees(businessId, worldId);

  if (employees.length === 0) return null;

  const sorted = [...employees].sort(
    (a, b) => (a.occupation.startYear || 0) - (b.occupation.startYear || 0)
  );

  for (const emp of sorted) {
    if (emp.character.status === 'active' && !emp.character.retired) {
      return emp;
    }
  }

  return null;
}

/**
 * Create a truth entry documenting a business succession event.
 */
async function createSuccessionTruth(
  worldId: string,
  playthroughId: string | undefined,
  opts: {
    businessName: string;
    departingOwnerName: string;
    departingOwnerId: string;
    successorName?: string;
    successorId?: string;
    relation?: string;
    outcome: SuccessionResult['outcome'];
  }
): Promise<void> {
  let title: string;
  let content: string;
  const tags = ['business_succession', opts.outcome];

  switch (opts.outcome) {
    case 'family_successor':
      title = `${opts.successorName} Inherits ${opts.businessName}`;
      content = `${opts.departingOwnerName} departed as owner of ${opts.businessName}. Their ${opts.relation}, ${opts.successorName}, took over the business.`;
      break;
    case 'employee_successor':
      title = `${opts.successorName} Takes Over ${opts.businessName}`;
      content = `After ${opts.departingOwnerName} departed, long-time employee ${opts.successorName} assumed ownership of ${opts.businessName}.`;
      break;
    case 'business_closed':
      title = `${opts.businessName} Closes Its Doors`;
      content = `${opts.businessName} closed permanently after ${opts.departingOwnerName} departed with no suitable successor.`;
      break;
  }

  const relatedCharacterIds = [opts.departingOwnerId];
  if (opts.successorId) {
    relatedCharacterIds.push(opts.successorId);
  }

  const truth: InsertTruth = {
    worldId,
    title,
    content,
    entryType: 'event',
    timestep: 0,
    tags,
    relatedCharacterIds,
    importance: 6,
    isPublic: true,
    source: 'simulation_generated',
  };

  try {
    if (playthroughId) {
      await PlaythroughOverlay.createTruthInPlaythrough(playthroughId, truth as Record<string, any>, 0);
    } else {
      await storage.createTruth(truth);
    }
  } catch (error) {
    console.error('[building-lifecycle] Failed to create succession truth:', error);
  }
}
