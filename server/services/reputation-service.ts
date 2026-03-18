import { storage } from "../db/storage";
import type { Reputation, InsertReputation } from "@shared/schema";

/**
 * Reputation Service
 * Handles all reputation/karma business logic for the game.
 * All reputations are playthrough-scoped — different playthroughs maintain independent reputation.
 */

export interface ViolationData {
  violationType: string;
  severity: 'minor' | 'moderate' | 'severe';
  ruleId?: string;
  description?: string;
}

export interface ReputationAdjustment {
  amount: number;
  reason: string;
}

export interface ViolationResponse {
  previousScore: number;
  newScore: number;
  previousStanding: string;
  newStanding: string;
  violationCount: number;
  penaltyApplied: 'warning' | 'fine' | 'combat' | 'banishment';
  penaltyAmount?: number;
  message: string;
  isBanned: boolean;
}

/**
 * Calculate standing text based on reputation score
 */
export function calculateStanding(score: number): string {
  if (score >= 51) return 'revered';
  if (score >= 1) return 'friendly';
  if (score >= -49) return 'neutral';
  if (score >= -99) return 'unfriendly';
  return 'hostile';
}

function getSeverityPenalty(severity: 'minor' | 'moderate' | 'severe'): number {
  switch (severity) {
    case 'minor': return -5;
    case 'moderate': return -10;
    case 'severe': return -25;
    default: return -5;
  }
}

function getPenaltyLevel(violationCount: number): number {
  return Math.min(violationCount, 4);
}

/**
 * Get or create reputation record for a playthrough + entity
 */
export async function getOrCreateReputation(
  playthroughId: string,
  userId: string,
  entityType: string,
  entityId: string
): Promise<Reputation> {
  const existing = await storage.getReputationForEntity(playthroughId, entityType, entityId);
  if (existing) return existing;

  return await storage.createReputation({
    playthroughId,
    userId,
    entityType,
    entityId,
    score: 0,
    standing: 'neutral',
    violationCount: 0,
    warningCount: 0,
    violationHistory: [],
    isBanned: false,
    totalFinesPaid: 0,
    outstandingFines: 0,
    hasDiscounts: false,
    hasSpecialAccess: false,
    tags: []
  });
}

/**
 * Get all reputations for a playthrough
 */
export async function getPlaythroughReputations(playthroughId: string): Promise<Reputation[]> {
  return await storage.getReputationsByPlaythrough(playthroughId);
}

/**
 * Record a rule violation and apply graduated enforcement
 */
export async function recordViolation(
  playthroughId: string,
  userId: string,
  entityType: string,
  entityId: string,
  violation: ViolationData
): Promise<ViolationResponse> {
  const reputation = await getOrCreateReputation(playthroughId, userId, entityType, entityId);

  const previousScore = reputation.score;
  const previousStanding = reputation.standing ?? 'neutral';

  const currentViolationCount = reputation.violationCount ?? 0;
  const currentWarningCount = reputation.warningCount ?? 0;
  const newViolationCount = currentViolationCount + 1;
  const newWarningCount = currentWarningCount + (violation.severity === 'minor' ? 1 : 0);

  const penaltyLevel = getPenaltyLevel(newViolationCount);
  const severityPenalty = getSeverityPenalty(violation.severity);
  let reputationChange = severityPenalty;
  let penaltyAmount = 0;
  let isBanned = false;
  let banExpiry: Date | null = null;

  let penaltyApplied: 'warning' | 'fine' | 'combat' | 'banishment';
  let message: string;

  switch (penaltyLevel) {
    case 1:
      penaltyApplied = 'warning';
      reputationChange = -5;
      message = `Warning issued for ${violation.violationType}. First offense.`;
      break;
    case 2:
      penaltyApplied = 'fine';
      reputationChange = -10;
      penaltyAmount = 50;
      message = `Fine imposed: 50 gold for ${violation.violationType}. Second offense.`;
      break;
    case 3:
      penaltyApplied = 'combat';
      reputationChange = -25;
      message = `Guards alerted! ${violation.violationType} detected. Third offense.`;
      break;
    case 4:
    default:
      penaltyApplied = 'banishment';
      reputationChange = -50;
      isBanned = true;
      banExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      message = `BANISHED from this location for ${violation.violationType}. You may return in 24 hours.`;
      break;
  }

  const newScore = Math.max(-100, Math.min(100, previousScore + reputationChange));
  const newStanding = calculateStanding(newScore);

  const violationRecord = {
    type: violation.violationType,
    severity: violation.severity,
    timestamp: new Date().toISOString(),
    penaltyApplied
  };

  const history = reputation.violationHistory ?? [];
  const updatedHistory = [...history, violationRecord];
  const currentOutstandingFines = reputation.outstandingFines ?? 0;

  await storage.updateReputation(reputation.id, {
    score: newScore,
    standing: newStanding,
    violationCount: newViolationCount,
    warningCount: newWarningCount,
    lastViolation: new Date(),
    violationHistory: updatedHistory,
    isBanned,
    banExpiry,
    outstandingFines: currentOutstandingFines + penaltyAmount,
  });

  return {
    previousScore,
    newScore,
    previousStanding,
    newStanding,
    violationCount: newViolationCount,
    penaltyApplied,
    penaltyAmount: penaltyAmount > 0 ? penaltyAmount : undefined,
    message,
    isBanned
  };
}

/**
 * Manually adjust reputation (for quests, rewards, etc.)
 */
export async function adjustReputation(
  playthroughId: string,
  userId: string,
  entityType: string,
  entityId: string,
  adjustment: ReputationAdjustment
): Promise<Reputation> {
  const reputation = await getOrCreateReputation(playthroughId, userId, entityType, entityId);

  const newScore = Math.max(-100, Math.min(100, reputation.score + adjustment.amount));
  const newStanding = calculateStanding(newScore);

  let isBanned = !!reputation.isBanned;
  let banExpiry = reputation.banExpiry ?? null;

  if (newScore > -50 && reputation.isBanned) {
    isBanned = false;
    banExpiry = null;
  }

  const updated = await storage.updateReputation(reputation.id, {
    score: newScore,
    standing: newStanding,
    isBanned,
    banExpiry,
  });

  return updated!;
}

/**
 * Check if player is banned from an entity
 */
export async function checkBanStatus(
  playthroughId: string,
  entityType: string,
  entityId: string
): Promise<{ isBanned: boolean; banExpiry: Date | null; reason?: string }> {
  const reputation = await storage.getReputationForEntity(playthroughId, entityType, entityId);

  if (!reputation) {
    return { isBanned: false, banExpiry: null };
  }

  if (reputation.isBanned && reputation.banExpiry) {
    const now = new Date();
    if (now > reputation.banExpiry) {
      await storage.updateReputation(reputation.id, {
        isBanned: false,
        banExpiry: null,
      });
      return { isBanned: false, banExpiry: null };
    }
  }

  const isBanned = !!reputation.isBanned;
  return {
    isBanned,
    banExpiry: reputation.banExpiry ?? null,
    reason: isBanned ? 'Multiple rule violations' : undefined
  };
}

/**
 * Pay outstanding fines
 */
export async function payFines(
  playthroughId: string,
  entityType: string,
  entityId: string,
  amount: number
): Promise<Reputation> {
  const reputation = await storage.getReputationForEntity(playthroughId, entityType, entityId);

  if (!reputation) {
    throw new Error('No reputation record found');
  }

  const currentOutstandingFines = reputation.outstandingFines ?? 0;
  const currentTotalFinesPaid = reputation.totalFinesPaid ?? 0;
  const amountPaid = Math.min(amount, currentOutstandingFines);

  const updated = await storage.updateReputation(reputation.id, {
    totalFinesPaid: currentTotalFinesPaid + amountPaid,
    outstandingFines: currentOutstandingFines - amountPaid,
  });

  return updated!;
}
