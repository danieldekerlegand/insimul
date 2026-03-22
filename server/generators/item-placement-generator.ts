/**
 * Item Placement Generator
 *
 * Places base items into contextually appropriate world locations (businesses,
 * residences, and exterior locations) during procedural generation. Each
 * business type gets items that make sense for its trade, residences get
 * common household goods, and exterior locations (vacant lots, streets) get
 * collectible and natural items for collection quests.
 *
 * Items are instantiated as world-specific records with placement stored in
 * the item's `metadata` field ({ businessId, residenceId, lotId, position }).
 */

import { storage } from '../db/storage';
import type { Item, Business, Residence, InsertItem, Settlement, Lot } from '../../shared/schema';

// ── Business-type → item tag/type mapping ────────────────────────────────────

export interface ItemRuleSet {
  /** Item tags to match (OR logic — any tag matches) */
  tags: string[];
  /** Item types to match (OR logic) */
  itemTypes: string[];
  /** Min / max items to place */
  min: number;
  max: number;
}

/** Which item tags and types are appropriate for each business type. */
export const BUSINESS_ITEM_RULES: Record<string, ItemRuleSet> = {
  // Food & drink
  Bakery:          { tags: ['food', 'ingredient', 'baked'],               itemTypes: ['food'],                           min: 4, max: 10 },
  Restaurant:      { tags: ['food', 'drink', 'tableware'],                itemTypes: ['food', 'drink'],                  min: 5, max: 12 },
  Bar:             { tags: ['drink', 'tableware'],                        itemTypes: ['drink'],                          min: 4, max: 10 },
  GroceryStore:    { tags: ['food', 'drink', 'ingredient'],               itemTypes: ['food', 'drink', 'material'],      min: 6, max: 14 },
  Brewery:         { tags: ['drink', 'container', 'ingredient'],          itemTypes: ['drink'],                          min: 3, max: 8 },
  Butcher:         { tags: ['food', 'meat', 'tool'],                      itemTypes: ['food', 'tool'],                   min: 3, max: 8 },
  FishMarket:      { tags: ['food', 'fishing'],                           itemTypes: ['food', 'tool'],                   min: 3, max: 8 },

  // Retail & trade
  Shop:            { tags: ['tool', 'material', 'crafting', 'goods'],     itemTypes: ['tool', 'material', 'collectible'], min: 5, max: 12 },
  JewelryStore:    { tags: ['jewelry', 'treasure', 'gem'],                itemTypes: ['collectible'],                    min: 3, max: 8 },
  BookStore:       { tags: ['book', 'scroll', 'paper', 'writing'],        itemTypes: ['collectible', 'tool'],            min: 4, max: 10 },
  HerbShop:        { tags: ['herb', 'potion', 'ingredient', 'healing'],   itemTypes: ['consumable', 'material'],         min: 3, max: 8 },
  PawnShop:        { tags: ['tool', 'collectible', 'treasure', 'goods'],  itemTypes: ['tool', 'collectible', 'weapon'],  min: 4, max: 10 },
  Tailor:          { tags: ['cloth', 'fabric', 'clothing', 'thread'],     itemTypes: ['armor', 'material'],              min: 3, max: 8 },

  // Crafts & industry
  Blacksmith:      { tags: ['metal', 'weapon', 'tool', 'crafting'],       itemTypes: ['weapon', 'tool', 'material'],     min: 4, max: 10 },
  Carpenter:       { tags: ['wood', 'tool', 'crafting', 'furniture'],     itemTypes: ['tool', 'material'],               min: 3, max: 8 },
  Farm:            { tags: ['food', 'ingredient', 'tool', 'seed'],        itemTypes: ['food', 'tool'],                   min: 4, max: 10 },
  Factory:         { tags: ['material', 'crafting', 'tool'],              itemTypes: ['material', 'tool'],               min: 4, max: 10 },
  Warehouse:       { tags: ['container', 'material', 'tool', 'goods'],    itemTypes: ['material', 'tool', 'collectible'], min: 5, max: 12 },

  // Services
  Pharmacy:        { tags: ['healing', 'consumable', 'potion'],           itemTypes: ['consumable'],                     min: 3, max: 8 },
  Hospital:        { tags: ['healing', 'consumable', 'medical'],          itemTypes: ['consumable', 'tool'],             min: 4, max: 10 },
  Clinic:          { tags: ['healing', 'consumable', 'medical'],          itemTypes: ['consumable'],                     min: 3, max: 6 },
  Barbershop:      { tags: ['tool', 'grooming'],                          itemTypes: ['tool'],                           min: 2, max: 4 },
  Bathhouse:       { tags: ['consumable', 'grooming', 'light'],           itemTypes: ['consumable'],                     min: 2, max: 5 },
  Hotel:           { tags: ['food', 'drink', 'furniture', 'light'],       itemTypes: ['food', 'drink'],                  min: 3, max: 8 },
  DentalOffice:    { tags: ['medical', 'tool'],                           itemTypes: ['tool', 'consumable'],             min: 2, max: 5 },
  OptometryOffice: { tags: ['medical', 'tool'],                           itemTypes: ['tool'],                           min: 2, max: 4 },

  // Civic & education
  Church:          { tags: ['collectible', 'book', 'light', 'religious'], itemTypes: ['collectible'],                    min: 2, max: 6 },
  School:          { tags: ['book', 'writing', 'tool'],                   itemTypes: ['collectible', 'tool'],            min: 3, max: 7 },
  University:      { tags: ['book', 'writing', 'scroll', 'tool'],         itemTypes: ['collectible', 'tool'],            min: 4, max: 8 },
  Bank:            { tags: ['treasure', 'currency', 'ledger'],            itemTypes: ['collectible'],                    min: 2, max: 5 },
  TownHall:        { tags: ['book', 'writing', 'official'],               itemTypes: ['collectible', 'tool'],            min: 2, max: 5 },

  // Maritime
  Harbor:          { tags: ['tool', 'rope', 'fishing', 'container'],      itemTypes: ['tool', 'material'],               min: 3, max: 8 },
  Boatyard:        { tags: ['tool', 'wood', 'rope', 'crafting'],          itemTypes: ['tool', 'material'],               min: 3, max: 8 },
  CustomsHouse:    { tags: ['book', 'writing', 'goods'],                  itemTypes: ['collectible', 'tool'],            min: 2, max: 5 },
  Lighthouse:      { tags: ['light', 'tool'],                             itemTypes: ['tool'],                           min: 1, max: 3 },

  // Other
  Stables:         { tags: ['food', 'tool', 'rope', 'animal'],           itemTypes: ['food', 'tool'],                   min: 3, max: 6 },
  Mortuary:        { tags: ['collectible', 'book', 'tool'],               itemTypes: ['collectible', 'tool'],            min: 1, max: 3 },
  LawFirm:         { tags: ['book', 'writing', 'paper'],                  itemTypes: ['collectible', 'tool'],            min: 2, max: 5 },
  InsuranceOffice: { tags: ['book', 'writing', 'paper'],                  itemTypes: ['collectible', 'tool'],            min: 2, max: 4 },
  RealEstateOffice:{ tags: ['book', 'writing', 'paper'],                  itemTypes: ['collectible', 'tool'],            min: 2, max: 4 },
  PoliceStation:   { tags: ['weapon', 'tool', 'key'],                     itemTypes: ['weapon', 'tool', 'key'],          min: 2, max: 5 },
  FireStation:     { tags: ['tool', 'container'],                         itemTypes: ['tool'],                           min: 2, max: 5 },
  Daycare:         { tags: ['food', 'collectible', 'toy'],                itemTypes: ['food', 'collectible'],            min: 2, max: 5 },
};

/** Fallback for business types not explicitly mapped. */
const DEFAULT_BUSINESS_RULES: ItemRuleSet = { tags: ['tool', 'collectible'], itemTypes: ['tool', 'collectible'], min: 2, max: 5 };

/** Residence item rules — common household items. */
export const RESIDENCE_ITEM_RULES: ItemRuleSet = {
  tags: ['food', 'drink', 'tool', 'furniture', 'light', 'book', 'tableware', 'clothing'],
  itemTypes: ['food', 'drink', 'tool', 'collectible'],
  min: 3,
  max: 8,
};

/** Exterior item rules — items found outdoors on vacant lots. */
export const EXTERIOR_ITEM_RULES: ItemRuleSet = {
  tags: ['collectible', 'material', 'tool', 'food', 'ingredient'],
  itemTypes: ['collectible', 'material', 'tool', 'food'],
  min: 1,
  max: 3,
};

/** Business-type → exterior item rules for items placed outside the building. */
export const BUSINESS_EXTERIOR_RULES: Record<string, ItemRuleSet> = {
  Bakery:       { tags: ['container', 'ingredient'],          itemTypes: ['material'],       min: 1, max: 2 },
  Restaurant:   { tags: ['container'],                        itemTypes: ['material'],       min: 1, max: 2 },
  Bar:          { tags: ['container', 'drink'],               itemTypes: ['drink'],          min: 1, max: 3 },
  Brewery:      { tags: ['container', 'drink'],               itemTypes: ['drink'],          min: 1, max: 3 },
  Blacksmith:   { tags: ['metal', 'material', 'tool'],        itemTypes: ['material'],       min: 1, max: 3 },
  Farm:         { tags: ['food', 'tool', 'seed'],             itemTypes: ['food', 'tool'],   min: 1, max: 3 },
  Warehouse:    { tags: ['container', 'material'],            itemTypes: ['material'],       min: 2, max: 4 },
  Shop:         { tags: ['container', 'goods'],               itemTypes: ['material'],       min: 1, max: 2 },
  Harbor:       { tags: ['rope', 'container', 'tool'],        itemTypes: ['tool', 'material'], min: 1, max: 3 },
  Boatyard:     { tags: ['wood', 'rope', 'tool'],             itemTypes: ['material', 'tool'], min: 1, max: 3 },
  Stables:      { tags: ['food', 'tool'],                     itemTypes: ['food', 'tool'],   min: 1, max: 2 },
  Carpenter:    { tags: ['wood', 'material'],                 itemTypes: ['material'],       min: 1, max: 2 },
  Factory:      { tags: ['material', 'container'],            itemTypes: ['material'],       min: 1, max: 3 },
};

// ── Filtering helpers ────────────────────────────────────────────────────────

/** Returns true if the item matches at least one tag or type in the rules. */
export function itemMatchesRules(
  item: Item,
  rules: { tags: string[]; itemTypes: string[] },
): boolean {
  const itemTags = (item.tags as string[]) || [];
  const tagMatch = rules.tags.some(t => itemTags.includes(t));
  const typeMatch = rules.itemTypes.includes(item.itemType);
  return tagMatch || typeMatch;
}

/** Filter base items to those matching a world type (or universal). */
export function filterByWorldType(items: Item[], worldType: string | undefined): Item[] {
  if (!worldType) return items;
  return items.filter(i => !i.worldType || i.worldType === worldType);
}

// ── Deterministic-ish random helpers ─────────────────────────────────────────

/** Pick `count` random items from an array (Fisher-Yates partial shuffle). */
export function pickRandom<T>(arr: T[], count: number): T[] {
  if (arr.length === 0 || count <= 0) return [];
  const copy = [...arr];
  const n = Math.min(count, copy.length);
  for (let i = copy.length - 1; i > copy.length - n - 1 && i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(copy.length - n);
}

/** Random int in [min, max]. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Core placement logic ─────────────────────────────────────────────────────

export interface ItemPlacementResult {
  totalPlaced: number;
  businessItems: number;
  residenceItems: number;
  exteriorItems: number;
}

/**
 * Select which base items should go into a single location.
 * Pure function — does not touch the database.
 */
export function selectItemsForLocation(
  baseItems: Item[],
  rules: { tags: string[]; itemTypes: string[]; min: number; max: number },
  worldType?: string,
): Item[] {
  const eligible = filterByWorldType(baseItems, worldType).filter(i => itemMatchesRules(i, rules));
  if (eligible.length === 0) return [];
  const count = randInt(rules.min, Math.min(rules.max, eligible.length));
  return pickRandom(eligible, count);
}

/**
 * Place base items into businesses, residences, and exterior locations for a world.
 * Creates world-specific item instances in the database with location metadata.
 */
export async function placeItemsInWorld(
  worldId: string,
  worldType?: string,
): Promise<ItemPlacementResult> {
  // Fetch base items and locations
  const baseItems = await storage.getBaseItems(worldType);
  const businesses = await storage.getBusinessesByWorld(worldId);
  const settlements = await storage.getSettlementsByWorld(worldId);
  const residences: Residence[] = [];
  const allLots: Lot[] = [];
  for (const s of settlements) {
    const settResidences = await storage.getResidencesBySettlement(s.id);
    residences.push(...settResidences);
    const settLots = await storage.getLotsBySettlement(s.id);
    allLots.push(...settLots);
  }

  let businessItems = 0;
  let residenceItems = 0;
  let exteriorItems = 0;

  // Place items in businesses
  const activeBusinesses = businesses.filter((b: Business) => !b.isOutOfBusiness);
  for (const biz of activeBusinesses) {
    const rules = BUSINESS_ITEM_RULES[biz.businessType] || DEFAULT_BUSINESS_RULES;
    const selected = selectItemsForLocation(baseItems, rules, worldType);

    for (const baseItem of selected) {
      await storage.createItem(makeWorldItem(baseItem, worldId, { businessId: biz.id, lotId: biz.lotId || undefined }));
      businessItems++;
    }
  }

  // Place items in residences
  for (const res of residences) {
    const selected = selectItemsForLocation(baseItems, RESIDENCE_ITEM_RULES, worldType);

    for (const baseItem of selected) {
      await storage.createItem(makeWorldItem(baseItem, worldId, { residenceId: res.id, lotId: res.lotId }));
      residenceItems++;
    }
  }

  // Place exterior items on vacant lots
  const vacantLots = getExteriorLots(allLots);
  for (const lot of vacantLots) {
    const selected = selectItemsForLocation(baseItems, EXTERIOR_ITEM_RULES, worldType);

    for (const baseItem of selected) {
      const position = generateExteriorPosition(lot);
      await storage.createItem(makeWorldItem(baseItem, worldId, { lotId: lot.id, position }));
      exteriorItems++;
    }
  }

  // Place exterior items near occupied buildings (crates, barrels, tools, produce)
  const bizByLot = new Map<string, Business>();
  for (const biz of activeBusinesses) {
    if (biz.lotId) bizByLot.set(biz.lotId, biz);
  }
  for (const lot of allLots) {
    const biz = bizByLot.get(lot.id);
    if (!biz) continue;
    const rules = BUSINESS_EXTERIOR_RULES[biz.businessType];
    if (!rules) continue;
    const selected = selectItemsForLocation(baseItems, rules, worldType);
    for (const baseItem of selected) {
      const position = generateExteriorPosition(lot);
      await storage.createItem(makeWorldItem(baseItem, worldId, { lotId: lot.id, businessId: biz.id, position }));
      exteriorItems++;
    }
  }

  return {
    totalPlaced: businessItems + residenceItems + exteriorItems,
    businessItems,
    residenceItems,
    exteriorItems,
  };
}

// ── Exterior placement helpers ───────────────────────────────────────────────

/**
 * Filter lots to those that are exterior (vacant — no building).
 * These are suitable locations for outdoor collectible items.
 */
export function getExteriorLots(lots: Lot[]): Lot[] {
  return lots.filter(lot =>
    lot.buildingType === 'vacant' || !lot.buildingType
  );
}

/**
 * Generate a world-space position near a lot for an exterior item spawn.
 * Adds small random jitter within the lot bounds so items don't stack.
 */
export function generateExteriorPosition(lot: Lot): { x: number; z: number } {
  const baseX = lot.positionX ?? 0;
  const baseZ = lot.positionZ ?? 0;
  const halfWidth = (lot.lotWidth ?? 12) / 2;
  const halfDepth = (lot.lotDepth ?? 16) / 2;
  // Random position within the lot bounds
  const x = baseX + (Math.random() * 2 - 1) * halfWidth;
  const z = baseZ + (Math.random() * 2 - 1) * halfDepth;
  return { x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100 };
}

// ── Item building ───────────────────────────────────────────────────────────

/** Build an InsertItem from a base template, bound to a world and location. */
function makeWorldItem(
  base: Item,
  worldId: string,
  location: { businessId?: string; residenceId?: string; lotId?: string; position?: { x: number; z: number } },
): InsertItem {
  return {
    worldId,
    name: base.name,
    description: base.description,
    itemType: base.itemType,
    icon: base.icon,
    value: base.value,
    sellValue: base.sellValue,
    weight: base.weight,
    tradeable: base.tradeable,
    stackable: base.stackable,
    maxStack: base.maxStack,
    worldType: base.worldType,
    objectRole: base.objectRole,
    category: base.category,
    material: base.material,
    baseType: base.baseType,
    rarity: base.rarity,
    effects: base.effects,
    lootWeight: base.lootWeight,
    tags: base.tags as string[],
    possessable: base.possessable,
    isBase: false,
    metadata: {
      baseItemId: base.id,
      ...location,
    },
    loreText: base.loreText,
    languageLearningData: base.languageLearningData,
  };
}
