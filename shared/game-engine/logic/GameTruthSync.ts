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
  /** Current player location for retract-before-assert. */
  private currentLocation: string | null = null;
  /** Current player location type. */
  private currentLocationType: string | null = null;
  /** Current health (current, max). */
  private currentHealth: { current: number; max: number } = { current: 100, max: 100 };
  /** Current energy (current, max). */
  private currentEnergy: { current: number; max: number } = { current: 100, max: 100 };
  /** Current time of day (hour). */
  private currentHour: number | null = null;
  /** Current day number. */
  private currentDay: number | null = null;
  /** Known vocabulary categories per language. */
  private knownVocabulary = new Map<string, Set<string>>();
  /** Current CEFR language levels: lang → level. */
  private languageLevels = new Map<string, string>();

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
      // ── Location sync ──
      case 'location_visited':
        await this.handleLocationVisited(event);
        break;
      case 'settlement_entered':
        await this.handleSettlementEntered(event);
        break;
      // ── Time sync ──
      case 'hour_changed':
        await this.handleHourChanged(event);
        break;
      case 'day_changed':
        await this.handleDayChanged(event);
        break;
      // ── Energy deduction from actions ──
      case 'action_executed':
        await this.handleActionExecuted(event);
        break;
      // ── Language & vocabulary sync ──
      case 'vocabulary_used':
        await this.handleVocabularyUsed(event);
        break;
      case 'assessment_completed':
        await this.handleAssessmentCompleted(event);
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

  // ── Location Handlers ────────────────────────────────────────────────────

  private async handleLocationVisited(event: { locationId: string; locationName: string }): Promise<void> {
    const locId = sanitize(event.locationId);
    await this.setLocation(locId);

    // Assert location_discovered so it persists across visits
    await this.engine.assertFact(`location_discovered(${locId})`);
  }

  private async handleSettlementEntered(event: { settlementId: string; settlementName: string }): Promise<void> {
    const locId = sanitize(event.settlementId);
    await this.setLocation(locId);
    // Settlements are always "town" type
    await this.setLocationType('town');
  }

  private async setLocation(locationId: string): Promise<void> {
    // Retract old at_location
    if (this.currentLocation) {
      try {
        await this.engine.retractFact(`at_location(player, ${this.currentLocation})`);
      } catch { /* may not exist */ }
    }
    await this.engine.assertFact(`at_location(player, ${locationId})`);
    this.currentLocation = locationId;
  }

  /** Set or update the player's current location type (forest, mine, water, town, etc.). */
  async setLocationType(locationType: string): Promise<void> {
    const locType = sanitize(locationType);
    if (this.currentLocationType) {
      try {
        await this.engine.retractFact(`at_location_type(player, ${this.currentLocationType})`);
      } catch { /* may not exist */ }
    }
    await this.engine.assertFact(`at_location_type(player, ${locType})`);
    this.currentLocationType = locType;
  }

  /** Initialize player location (call during game setup). */
  async initializeLocation(locationId: string, locationType?: string): Promise<void> {
    await this.setLocation(sanitize(locationId));
    if (locationType) {
      await this.setLocationType(locationType);
    }
  }

  // ── Health & Energy Handlers ────────────────────────────────────────────

  /** Initialize player health (call during game setup). */
  async initializeHealth(current: number, max: number): Promise<void> {
    this.currentHealth = { current, max };
    await this.engine.assertFact(`health(player, ${current}, ${max})`);
  }

  /** Modify player health by a delta (positive = heal, negative = damage). */
  async modifyHealth(delta: number): Promise<void> {
    const { current: oldCurrent, max } = this.currentHealth;
    const newCurrent = Math.max(0, Math.min(max, oldCurrent + delta));

    try {
      await this.engine.retractFact(`health(player, ${oldCurrent}, ${max})`);
    } catch { /* may not exist */ }

    await this.engine.assertFact(`health(player, ${newCurrent}, ${max})`);
    this.currentHealth = { current: newCurrent, max };
  }

  /** Initialize player energy (call during game setup). */
  async initializeEnergy(current: number, max: number): Promise<void> {
    this.currentEnergy = { current, max };
    await this.engine.assertFact(`energy(player, ${current}, ${max})`);
  }

  /** Modify player energy by a delta (positive = restore, negative = cost). */
  async modifyEnergy(delta: number): Promise<void> {
    const { current: oldCurrent, max } = this.currentEnergy;
    const newCurrent = Math.max(0, Math.min(max, oldCurrent + delta));

    try {
      await this.engine.retractFact(`energy(player, ${oldCurrent}, ${max})`);
    } catch { /* may not exist */ }

    await this.engine.assertFact(`energy(player, ${newCurrent}, ${max})`);
    this.currentEnergy = { current: newCurrent, max };
  }

  private async handleActionExecuted(event: { energyCost?: number }): Promise<void> {
    if (event.energyCost && event.energyCost > 0) {
      await this.modifyEnergy(-event.energyCost);
    }
  }

  // ── Time Handlers ───────────────────────────────────────────────────────

  private async handleHourChanged(event: { hour: number; day: number }): Promise<void> {
    // Retract old time_of_day
    if (this.currentHour !== null) {
      try {
        await this.engine.retractFact(`time_of_day(${this.currentHour})`);
      } catch { /* may not exist */ }
    }
    await this.engine.assertFact(`time_of_day(${event.hour})`);
    this.currentHour = event.hour;
  }

  private async handleDayChanged(event: { day: number; timestep: number }): Promise<void> {
    // Retract old day_number
    if (this.currentDay !== null) {
      try {
        await this.engine.retractFact(`day_number(${this.currentDay})`);
      } catch { /* may not exist */ }
    }
    await this.engine.assertFact(`day_number(${event.day})`);
    this.currentDay = event.day;
  }

  /** Initialize time tracking (call during game setup). */
  async initializeTime(hour: number, day: number): Promise<void> {
    this.currentHour = hour;
    this.currentDay = day;
    await this.engine.assertFact(`time_of_day(${hour})`);
    await this.engine.assertFact(`day_number(${day})`);
  }

  // ── Vocabulary & Language Handlers ──────────────────────────────────────

  private async handleVocabularyUsed(event: { word: string; correct: boolean }): Promise<void> {
    if (!event.correct) return; // Only track correctly used vocabulary

    // Derive category from the word (default to 'general')
    const category = 'general';
    // Assert for all known languages the player speaks
    const langs = Array.from(this.languageLevels.keys());
    for (const lang of langs) {
      if (!this.knownVocabulary.has(lang)) {
        this.knownVocabulary.set(lang, new Set());
      }
      const vocabSet = this.knownVocabulary.get(lang)!;
      if (!vocabSet.has(category)) {
        vocabSet.add(category);
        await this.engine.assertFact(`knows_vocabulary(player, ${lang}, ${category})`);
      }
    }
  }

  private async handleAssessmentCompleted(event: { cefrLevel?: string }): Promise<void> {
    if (!event.cefrLevel) return;

    const newLevel = sanitize(event.cefrLevel);

    // Update all tracked languages to the new CEFR level
    // (Assessment is typically for the target language — update the first non-primary language)
    const entries = Array.from(this.languageLevels.entries());
    for (const [lang, oldLevel] of entries) {
      // Skip primary language (typically the first one set, or 'english')
      if (lang === 'english') continue;

      try {
        await this.engine.retractFact(`speaks_language(player, ${lang}, ${oldLevel})`);
      } catch { /* may not exist */ }
      await this.engine.assertFact(`speaks_language(player, ${lang}, ${newLevel})`);
      this.languageLevels.set(lang, newLevel);
      break; // Only update the target language
    }
  }

  /** Initialize a language the player speaks (call during game setup for each language). */
  async initializeLanguage(language: string, cefrLevel: string): Promise<void> {
    const lang = sanitize(language);
    const level = sanitize(cefrLevel);
    this.languageLevels.set(lang, level);
    await this.engine.assertFact(`speaks_language(player, ${lang}, ${level})`);
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
    this.currentLocation = null;
    this.currentLocationType = null;
    this.currentHealth = { current: 100, max: 100 };
    this.currentEnergy = { current: 100, max: 100 };
    this.currentHour = null;
    this.currentDay = null;
    this.knownVocabulary.clear();
    this.languageLevels.clear();
  }
}
