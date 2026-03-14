/**
 * Settlement Decline System (US-064)
 *
 * Detects population loss and applies physical decline effects:
 * - Building abandonment when occupancy drops
 * - Business closure cascades from unemployment
 * - Settlement type downgrade (city → town → village)
 * - Decline event history tracking
 */

import { storage } from '../../db/storage';
import type { Settlement, Business, Lot } from '@shared/schema';
import { demolishBuilding } from './building-commission-system.js';
import { prologAssertFact } from './prolog-queries.js';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type DeclinePhase = 'stable' | 'stagnating' | 'declining' | 'collapsing';

export type DeclineEventType =
  | 'population_drop'
  | 'business_closure'
  | 'building_abandoned'
  | 'settlement_downgrade'
  | 'mass_exodus';

export interface DeclineEvent {
  id: string;
  settlementId: string;
  type: DeclineEventType;
  year: number;
  description: string;
  details: Record<string, any>;
}

export interface DeclineMetrics {
  settlementId: string;
  currentPopulation: number;
  peakPopulation: number;
  populationChangeRate: number;
  vacantLotRatio: number;
  closedBusinessRatio: number;
  phase: DeclinePhase;
}

export interface DeclineAssessment {
  metrics: DeclineMetrics;
  events: DeclineEvent[];
  downgradeTo?: 'town' | 'village';
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Population thresholds for decline phases
  stagnatingThreshold: -0.05,   // 5% population loss
  decliningThreshold: -0.15,    // 15% population loss
  collapsingThreshold: -0.30,   // 30% population loss

  // Settlement type population minimums
  cityMinPopulation: 200,
  townMinPopulation: 50,

  // Business closure probability per decline phase
  businessClosureChance: {
    stable: 0,
    stagnating: 0.05,
    declining: 0.15,
    collapsing: 0.30,
  },

  // Building abandonment: vacant lot ratio thresholds
  abandonmentVacancyThreshold: 0.4, // 40% vacancy triggers abandonment cascade

  // Mass exodus threshold (fraction of population lost in one evaluation)
  massExodusThreshold: 0.20,
};

// In-memory decline history per settlement
const declineHistory = new Map<string, DeclineEvent[]>();
// Track peak population per settlement
const peakPopulations = new Map<string, number>();

// ============================================================================
// CORE EVALUATION
// ============================================================================

/**
 * Evaluate a settlement's decline status and apply effects.
 * Call this periodically during simulation (e.g., each year or timestep batch).
 */
export async function evaluateSettlementDecline(
  settlementId: string,
  currentYear: number
): Promise<DeclineAssessment> {
  const settlement = await storage.getSettlement(settlementId);
  if (!settlement) {
    throw new Error(`Settlement ${settlementId} not found`);
  }

  const metrics = await calculateDeclineMetrics(settlement);
  const events: DeclineEvent[] = [];

  // Track population drops
  if (metrics.populationChangeRate < CONFIG.stagnatingThreshold) {
    events.push(createDeclineEvent(
      settlementId,
      'population_drop',
      currentYear,
      `${settlement.name} lost ${Math.abs(Math.round(metrics.populationChangeRate * 100))}% of its peak population`,
      { rate: metrics.populationChangeRate, current: metrics.currentPopulation, peak: metrics.peakPopulation }
    ));
  }

  // Mass exodus detection
  if (metrics.populationChangeRate < -CONFIG.massExodusThreshold) {
    events.push(createDeclineEvent(
      settlementId,
      'mass_exodus',
      currentYear,
      `A mass exodus struck ${settlement.name} — over ${Math.abs(Math.round(metrics.populationChangeRate * 100))}% of residents have left`,
      { rate: metrics.populationChangeRate }
    ));
  }

  // Apply business closures based on decline phase
  const closureEvents = await applyBusinessClosures(settlement, metrics.phase, currentYear);
  events.push(...closureEvents);

  // Apply building abandonment
  const abandonmentEvents = await applyBuildingAbandonment(settlement, metrics, currentYear);
  events.push(...abandonmentEvents);

  // Check for settlement type downgrade
  const assessment: DeclineAssessment = { metrics, events };
  const downgrade = checkSettlementDowngrade(settlement, metrics.currentPopulation);
  if (downgrade) {
    assessment.downgradeTo = downgrade;
    await applySettlementDowngrade(settlement, downgrade, currentYear);
    events.push(createDeclineEvent(
      settlementId,
      'settlement_downgrade',
      currentYear,
      `${settlement.name} has been downgraded from ${settlement.settlementType} to ${downgrade}`,
      { from: settlement.settlementType, to: downgrade, population: metrics.currentPopulation }
    ));
  }

  // Persist events
  const history = declineHistory.get(settlementId) || [];
  history.push(...events);
  declineHistory.set(settlementId, history);

  // Assert decline facts to Prolog
  if (events.length > 0) {
    const prologId = settlementId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    await prologAssertFact(
      settlement.worldId,
      `settlement_decline(${prologId}, ${metrics.phase}, ${currentYear})`
    );
  }

  return assessment;
}

// ============================================================================
// METRICS CALCULATION
// ============================================================================

/**
 * Calculate decline metrics for a settlement.
 */
export async function calculateDeclineMetrics(
  settlement: Settlement
): Promise<DeclineMetrics> {
  const currentPopulation = settlement.population ?? 0;

  // Track peak population
  const previousPeak = peakPopulations.get(settlement.id) || currentPopulation;
  const peak = Math.max(previousPeak, currentPopulation);
  peakPopulations.set(settlement.id, peak);

  // Population change rate relative to peak
  const populationChangeRate = peak > 0
    ? (currentPopulation - peak) / peak
    : 0;

  // Calculate vacancy and closure ratios
  const lots = await storage.getLotsBySettlement(settlement.id);
  const businesses = await storage.getBusinessesBySettlement(settlement.id);

  const totalLots = lots.length;
  const vacantLots = lots.filter(l => l.buildingType === 'vacant' || !l.buildingId).length;
  const vacantLotRatio = totalLots > 0 ? vacantLots / totalLots : 0;

  const totalBusinesses = businesses.length;
  const closedBusinesses = businesses.filter(b => b.isOutOfBusiness).length;
  const closedBusinessRatio = totalBusinesses > 0 ? closedBusinesses / totalBusinesses : 0;

  const phase = determineDeclinePhase(populationChangeRate, vacantLotRatio, closedBusinessRatio);

  return {
    settlementId: settlement.id,
    currentPopulation,
    peakPopulation: peak,
    populationChangeRate,
    vacantLotRatio,
    closedBusinessRatio,
    phase,
  };
}

/**
 * Determine the decline phase from metrics.
 */
export function determineDeclinePhase(
  populationChangeRate: number,
  vacantLotRatio: number,
  closedBusinessRatio: number
): DeclinePhase {
  // Use worst-case signal
  if (
    populationChangeRate <= CONFIG.collapsingThreshold ||
    (vacantLotRatio >= 0.6 && closedBusinessRatio >= 0.5)
  ) {
    return 'collapsing';
  }
  if (
    populationChangeRate <= CONFIG.decliningThreshold ||
    (vacantLotRatio >= 0.4 && closedBusinessRatio >= 0.3)
  ) {
    return 'declining';
  }
  if (
    populationChangeRate <= CONFIG.stagnatingThreshold ||
    vacantLotRatio >= 0.25
  ) {
    return 'stagnating';
  }
  return 'stable';
}

// ============================================================================
// DECLINE EFFECTS
// ============================================================================

/**
 * Close businesses probabilistically based on decline phase.
 */
async function applyBusinessClosures(
  settlement: Settlement,
  phase: DeclinePhase,
  currentYear: number
): Promise<DeclineEvent[]> {
  const closureChance = CONFIG.businessClosureChance[phase];
  if (closureChance <= 0) return [];

  const businesses = await storage.getBusinessesBySettlement(settlement.id);
  const activeBusinesses = businesses.filter(b => !b.isOutOfBusiness);
  const events: DeclineEvent[] = [];

  for (const business of activeBusinesses) {
    if (Math.random() < closureChance) {
      await storage.updateBusiness(business.id, {
        isOutOfBusiness: true,
        closedYear: currentYear,
      });

      events.push(createDeclineEvent(
        settlement.id,
        'business_closure',
        currentYear,
        `${business.name} closed due to economic decline in ${settlement.name}`,
        { businessId: business.id, businessType: business.businessType }
      ));
    }
  }

  return events;
}

/**
 * Mark buildings as abandoned when vacancy is high.
 * Targets furthest-from-downtown lots first.
 */
async function applyBuildingAbandonment(
  settlement: Settlement,
  metrics: DeclineMetrics,
  currentYear: number
): Promise<DeclineEvent[]> {
  if (metrics.vacantLotRatio < CONFIG.abandonmentVacancyThreshold) return [];
  if (metrics.phase === 'stable') return [];

  const lots = await storage.getLotsBySettlement(settlement.id);
  const events: DeclineEvent[] = [];

  // Find occupied lots with closed businesses (prime abandonment targets)
  const abandonableLots = lots.filter(l =>
    l.buildingId && l.buildingType === 'business'
  );

  // Sort by distance from downtown (furthest first)
  abandonableLots.sort((a, b) =>
    (b.distanceFromDowntown ?? 0) - (a.distanceFromDowntown ?? 0)
  );

  // Abandon up to 1 building per evaluation to avoid catastrophic single-step loss
  const toAbandon = abandonableLots.slice(0, 1);

  for (const lot of toAbandon) {
    if (!lot.buildingId) continue;

    // Check if business on lot is closed
    const business = await storage.getBusiness(lot.buildingId);
    if (business && !business.isOutOfBusiness) continue;

    try {
      await demolishBuilding(settlement.worldId, lot.buildingId);
      events.push(createDeclineEvent(
        settlement.id,
        'building_abandoned',
        currentYear,
        `A building at ${lot.address} was abandoned and fell into disrepair`,
        { lotId: lot.id, buildingId: lot.buildingId, address: lot.address }
      ));
    } catch {
      // Building may already be demolished or lot in inconsistent state
    }
  }

  return events;
}

/**
 * Check if a settlement should be downgraded based on population.
 */
export function checkSettlementDowngrade(
  settlement: Settlement,
  currentPopulation: number
): 'town' | 'village' | null {
  if (settlement.settlementType === 'city' && currentPopulation < CONFIG.cityMinPopulation) {
    return 'town';
  }
  if (settlement.settlementType === 'town' && currentPopulation < CONFIG.townMinPopulation) {
    return 'village';
  }
  return null;
}

async function applySettlementDowngrade(
  settlement: Settlement,
  newType: 'town' | 'village',
  currentYear: number
): Promise<void> {
  await storage.updateSettlement(settlement.id, {
    settlementType: newType,
  });

  const prologId = settlement.id.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  await prologAssertFact(
    settlement.worldId,
    `settlement_downgraded(${prologId}, ${settlement.settlementType}, ${newType}, ${currentYear})`
  );
}

// ============================================================================
// HISTORY & QUERIES
// ============================================================================

/**
 * Get the decline history for a settlement.
 */
export function getDeclineHistory(settlementId: string): DeclineEvent[] {
  return declineHistory.get(settlementId) || [];
}

/**
 * Get all decline events across settlements in a world.
 */
export function getWorldDeclineHistory(worldId: string): DeclineEvent[] {
  // Flatten all settlement histories — caller filters by world
  const all: DeclineEvent[] = [];
  declineHistory.forEach(events => {
    all.push(...events);
  });
  return all.sort((a, b) => a.year - b.year);
}

/**
 * Seed/set the peak population for a settlement (useful for historical sim).
 */
export function setPeakPopulation(settlementId: string, peak: number): void {
  peakPopulations.set(settlementId, peak);
}

/**
 * Get current peak population tracking value.
 */
export function getPeakPopulation(settlementId: string): number {
  return peakPopulations.get(settlementId) || 0;
}

/**
 * Clear decline state (useful for testing).
 */
export function clearDeclineState(): void {
  declineHistory.clear();
  peakPopulations.clear();
}

// ============================================================================
// HELPERS
// ============================================================================

function createDeclineEvent(
  settlementId: string,
  type: DeclineEventType,
  year: number,
  description: string,
  details: Record<string, any>
): DeclineEvent {
  return {
    id: `decline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    settlementId,
    type,
    year,
    description,
    details,
  };
}
