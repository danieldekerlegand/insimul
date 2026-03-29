/**
 * Game Truth Sync
 *
 * Bridges game events to canonical Prolog gameplay predicates (from
 * gameplay-predicates.ts). Subscribes to GameEventBus events and
 * asserts/retracts the corresponding has_item/3, has_equipped/3,
 * health/3, energy/3, at_location/2, etc. facts in real-time.
 *
 * Unlike GamePrologEngine (which tracks quest-centric predicates like
 * has(), collected(), equipped()), GameTruthSync maintains the canonical
 * gameplay-state predicates that action prerequisites reference.
 */

import type { TauPrologEngine } from '@shared/prolog/tau-engine';
import type { GameEventBus, GameEvent } from './GameEventBus';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Sanitize a string for use as a Prolog atom (lowercase, underscores). */
function sanitize(str: string): string {
  if (!str) return 'unknown';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// ─── GameTruthSync ──────────────────────────────────────────────────────────

export class GameTruthSync {
  private engine: TauPrologEngine;
  private eventBus: GameEventBus;
  private unsubscribe: (() => void) | null = null;

  /** Track item quantities for has_item/3 updates. */
  private itemQuantities = new Map<string, number>();
  /** Track currently equipped items by slot for retract-before-assert. */
  private equippedSlots = new Map<string, string>();

  constructor(eventBus: GameEventBus, engine: TauPrologEngine) {
    this.eventBus = eventBus;
    this.engine = engine;
    this.subscribe();
  }

  // ── Event Subscriptions ─────────────────────────────────────────────────

  private subscribe(): void {
    this.unsubscribe = this.eventBus.onAny((event: GameEvent) => {
      this.handleEvent(event).catch(this.logError);
    });
  }

  private async handleEvent(event: GameEvent): Promise<void> {
    switch (event.type) {
      case 'item_equipped':
        await this.handleEquipped(event);
        break;
      case 'item_unequipped':
        await this.handleUnequipped(event);
        break;
      case 'item_collected':
        await this.handleItemCollected(event);
        break;
      case 'item_dropped':
        await this.handleItemDropped(event);
        break;
      case 'item_purchased':
        await this.handleItemPurchased(event);
        break;
      case 'item_crafted':
        await this.handleItemCrafted(event);
        break;
    }
  }

  // ── Equipment Handlers ──────────────────────────────────────────────────

  private async handleEquipped(event: { itemId: string; itemName: string; slot: string }): Promise<void> {
    const slot = sanitize(event.slot);
    const itemId = sanitize(event.itemId);

    // Retract previous item in this slot (if any)
    const prev = this.equippedSlots.get(slot);
    if (prev) {
      try {
        await this.engine.retractFact(`has_equipped(player, ${slot}, ${prev})`);
      } catch { /* may not exist */ }
    }

    // Assert new equipped item
    await this.engine.assertFact(`has_equipped(player, ${slot}, ${itemId})`);
    this.equippedSlots.set(slot, itemId);
  }

  private async handleUnequipped(event: { itemId: string; itemName: string; slot: string }): Promise<void> {
    const slot = sanitize(event.slot);
    const itemId = sanitize(event.itemId);

    try {
      await this.engine.retractFact(`has_equipped(player, ${slot}, ${itemId})`);
    } catch { /* may not exist */ }
    this.equippedSlots.delete(slot);
  }

  // ── Inventory Handlers ──────────────────────────────────────────────────

  private async handleItemCollected(event: { itemId: string; itemName: string; quantity: number }): Promise<void> {
    await this.addItem(sanitize(event.itemName), event.quantity);
  }

  private async handleItemDropped(event: { itemId: string; itemName: string; quantity: number }): Promise<void> {
    await this.removeItem(sanitize(event.itemName), event.quantity);
  }

  private async handleItemPurchased(event: { itemId: string; itemName: string; quantity: number; totalPrice: number }): Promise<void> {
    // Add the purchased item
    await this.addItem(sanitize(event.itemName), event.quantity);

    // Deduct gold: retract old, assert new
    await this.modifyGold(-event.totalPrice);
  }

  private async handleItemCrafted(event: { itemId: string; itemName: string; quantity: number }): Promise<void> {
    await this.addItem(sanitize(event.itemName), event.quantity);
  }

  // ── Item Quantity Helpers ───────────────────────────────────────────────

  private async addItem(itemName: string, quantity: number): Promise<void> {
    const oldQty = this.itemQuantities.get(itemName) || 0;
    const newQty = oldQty + quantity;

    // Retract old has_item if it existed
    if (oldQty > 0) {
      try {
        await this.engine.retractFact(`has_item(player, ${itemName}, ${oldQty})`);
      } catch { /* may not exist */ }
    }

    // Assert updated quantity
    await this.engine.assertFact(`has_item(player, ${itemName}, ${newQty})`);
    this.itemQuantities.set(itemName, newQty);
  }

  private async removeItem(itemName: string, quantity: number): Promise<void> {
    const oldQty = this.itemQuantities.get(itemName) || 0;
    const newQty = Math.max(0, oldQty - quantity);

    // Retract old fact
    if (oldQty > 0) {
      try {
        await this.engine.retractFact(`has_item(player, ${itemName}, ${oldQty})`);
      } catch { /* may not exist */ }
    }

    // Assert new quantity (or remove entirely if 0)
    if (newQty > 0) {
      await this.engine.assertFact(`has_item(player, ${itemName}, ${newQty})`);
    }
    this.itemQuantities.set(itemName, newQty);
  }

  // ── Gold Helper ─────────────────────────────────────────────────────────

  /** Current gold amount tracked locally. */
  private currentGold: number = 0;

  /** Initialize gold tracking (call during game setup). */
  async initializeGold(amount: number): Promise<void> {
    this.currentGold = amount;
    await this.engine.assertFact(`gold(player, ${amount})`);
  }

  private async modifyGold(delta: number): Promise<void> {
    const oldGold = this.currentGold;
    const newGold = Math.max(0, oldGold + delta);

    try {
      await this.engine.retractFact(`gold(player, ${oldGold})`);
    } catch { /* may not exist */ }

    await this.engine.assertFact(`gold(player, ${newGold})`);
    this.currentGold = newGold;
  }

  // ── Error Logging ───────────────────────────────────────────────────────

  private logError = (e: unknown): void => {
    console.warn('[GameTruthSync] Error handling event:', e);
  };

  // ── Cleanup ─────────────────────────────────────────────────────────────

  dispose(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.itemQuantities.clear();
    this.equippedSlots.clear();
  }
}
