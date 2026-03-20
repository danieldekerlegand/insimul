/**
 * Mercantile Service — manages player gold and item pricing.
 *
 * Gold is persisted as a truth record with entryType 'gold_balance'.
 * Supports both base-world and playthrough-scoped storage via the
 * PlaythroughOverlay system.
 */

import { storage } from '../db/storage';
import * as PlaythroughOverlay from './playthrough-overlay';
import type { Truth } from '@shared/schema';

const DEFAULT_STARTING_GOLD = 100;
const DEFAULT_SELL_MULTIPLIER = 0.6;

// ── Gold Balance Helpers ────────────────────────────────────────────────────

/**
 * Find the gold_balance truth for an entity, checking playthrough overlay if provided.
 */
async function findGoldTruth(
  worldId: string,
  entityId: string,
  playthroughId?: string,
): Promise<(Truth & { customData?: any }) | undefined> {
  const truths = playthroughId
    ? await PlaythroughOverlay.getTruthsWithOverlay(worldId, playthroughId)
    : await storage.getTruthsByWorld(worldId);
  return truths.find(
    (t: any) => t.entryType === 'gold_balance' && t.characterId === entityId,
  ) as (Truth & { customData?: any }) | undefined;
}

/**
 * Get the current gold balance for an entity (player or NPC).
 * Returns DEFAULT_STARTING_GOLD if no gold truth exists yet.
 */
export async function getGold(
  worldId: string,
  entityId: string,
  playthroughId?: string,
): Promise<number> {
  const truth = await findGoldTruth(worldId, entityId, playthroughId);
  if (!truth) return DEFAULT_STARTING_GOLD;
  const data = typeof truth.customData === 'string'
    ? JSON.parse(truth.customData)
    : (truth.customData || {});
  return data.amount ?? DEFAULT_STARTING_GOLD;
}

/**
 * Set the gold balance for an entity. Creates the truth if it doesn't exist.
 */
export async function setGold(
  worldId: string,
  entityId: string,
  amount: number,
  playthroughId?: string,
  timestep: number = 0,
): Promise<number> {
  const clamped = Math.max(0, Math.floor(amount));
  const truth = await findGoldTruth(worldId, entityId, playthroughId);

  if (truth) {
    const updates = { customData: { amount: clamped, updatedAt: Date.now() } };
    if (playthroughId) {
      await PlaythroughOverlay.updateTruthInPlaythrough(playthroughId, truth.id, updates, timestep);
    } else {
      await storage.updateTruth(truth.id, updates as any);
    }
  } else {
    const truthData = {
      worldId,
      characterId: entityId,
      title: `Gold Balance: ${entityId}`,
      content: `Gold balance for entity ${entityId}`,
      entryType: 'gold_balance',
      importance: 1,
      isPublic: false,
      timestep,
      tags: ['gold', 'mercantile', 'balance'],
      customData: { amount: clamped, updatedAt: Date.now() },
    };
    if (playthroughId) {
      await PlaythroughOverlay.createTruthInPlaythrough(playthroughId, truthData, timestep);
    } else {
      await storage.createTruth(truthData);
    }
  }

  return clamped;
}

/**
 * Adjust gold by a delta (positive = add, negative = subtract).
 * Returns the new balance, or null if insufficient funds.
 */
export async function adjustGold(
  worldId: string,
  entityId: string,
  delta: number,
  playthroughId?: string,
  timestep: number = 0,
): Promise<{ newBalance: number } | { error: 'insufficient_funds'; available: number }> {
  const current = await getGold(worldId, entityId, playthroughId);
  const newAmount = current + delta;
  if (newAmount < 0) {
    return { error: 'insufficient_funds', available: current };
  }
  const balance = await setGold(worldId, entityId, newAmount, playthroughId, timestep);
  return { newBalance: balance };
}

// ── Item Pricing ────────────────────────────────────────────────────────────

/**
 * Calculate the buy price for an item, applying merchant multipliers.
 */
export function calculateBuyPrice(
  baseValue: number,
  buyMultiplier: number = 1.0,
): number {
  return Math.max(1, Math.floor(baseValue * buyMultiplier));
}

/**
 * Calculate the sell price for an item, using sellValue if available,
 * otherwise falling back to value * sellMultiplier.
 */
export function calculateSellPrice(
  baseValue: number,
  sellValue?: number,
  sellMultiplier: number = DEFAULT_SELL_MULTIPLIER,
): number {
  if (sellValue && sellValue > 0) return sellValue;
  return Math.max(1, Math.floor(baseValue * sellMultiplier));
}

// ── Transaction Validation ──────────────────────────────────────────────────

export interface TransactionValidation {
  valid: boolean;
  error?: string;
  totalCost: number;
  buyerGold: number;
  sellerGold: number;
}

/**
 * Validate a buy/sell transaction between two entities.
 */
export async function validateTransaction(
  worldId: string,
  buyerId: string,
  sellerId: string,
  totalPrice: number,
  playthroughId?: string,
): Promise<TransactionValidation> {
  const [buyerGold, sellerGold] = await Promise.all([
    getGold(worldId, buyerId, playthroughId),
    getGold(worldId, sellerId, playthroughId),
  ]);

  if (totalPrice > buyerGold) {
    return {
      valid: false,
      error: `Insufficient gold. Need ${totalPrice}, have ${buyerGold}.`,
      totalCost: totalPrice,
      buyerGold,
      sellerGold,
    };
  }

  return { valid: true, totalCost: totalPrice, buyerGold, sellerGold };
}

/**
 * Execute gold transfer between buyer and seller.
 * Returns new balances or an error.
 */
export async function executeGoldTransfer(
  worldId: string,
  buyerId: string,
  sellerId: string,
  amount: number,
  playthroughId?: string,
  timestep: number = 0,
): Promise<{ buyerGold: number; sellerGold: number } | { error: string }> {
  const validation = await validateTransaction(worldId, buyerId, sellerId, amount, playthroughId);
  if (!validation.valid) {
    return { error: validation.error! };
  }

  const buyerResult = await adjustGold(worldId, buyerId, -amount, playthroughId, timestep);
  if ('error' in buyerResult) {
    return { error: `Buyer has insufficient gold.` };
  }

  const sellerResult = await adjustGold(worldId, sellerId, amount, playthroughId, timestep);
  if ('error' in sellerResult) {
    // Rollback buyer deduction
    await adjustGold(worldId, buyerId, amount, playthroughId, timestep);
    return { error: `Failed to credit seller.` };
  }

  return { buyerGold: buyerResult.newBalance, sellerGold: sellerResult.newBalance };
}
