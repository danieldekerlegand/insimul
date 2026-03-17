/**
 * Merchant Inventory Auto-Generation Service
 *
 * Generates NPC merchant inventories based on business type.
 * Each merchant gets 8-15 items matching their business, with
 * personality-influenced pricing and language-aware item names.
 */

import type { BusinessType, Item, InsertItem, Business, Character } from '@shared/schema';
import type { ShopItem, MerchantInventory, ItemType } from '@shared/game-engine/types';

// ── Storage Interface (for DI/testing) ─────────────────────────────────────

export interface MerchantInventoryStorage {
  getBusinessesByWorld(worldId: string): Promise<Business[]>;
  getCharacter(id: string): Promise<Character | undefined>;
  getItemsByWorld(worldId: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  getWorldLanguagesByWorld(worldId: string): Promise<Array<{ name: string; isLearningTarget?: boolean }>>;
  updateBusiness?(id: string, data: any): Promise<any>;
}

export interface TranslateItemFn {
  (items: Array<{ id: string; name: string; category?: string; description?: string }>, targetLanguage: string): Promise<Array<{ id: string; targetWord: string; pronunciation: string; category: string }>>;
}

// ── Item Templates per Business Type ───────────────────────────────────────

interface ItemTemplate {
  name: string;
  description: string;
  itemType: ItemType;
  category: string;
  basePrice: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon?: string;
  stackable?: boolean;
  effects?: Record<string, number>;
  /** Name in target language (keyed by language code) */
  translations?: Record<string, string>;
}

const RARITY_PRICE_MULTIPLIERS: Record<string, number> = {
  common: 1,
  uncommon: 3,
  rare: 10,
  epic: 50,
  legendary: 200,
};

/**
 * Item catalog per business type. Each business type maps to a pool of
 * possible items; 8-15 are randomly selected per merchant.
 */
const BUSINESS_ITEM_CATALOG: Record<string, ItemTemplate[]> = {
  Bakery: [
    { name: 'Bread Loaf', description: 'A fresh loaf of bread', itemType: 'food', category: 'baked_goods', basePrice: 5, rarity: 'common', icon: '🍞', effects: { health: 5 } },
    { name: 'Meat Pie', description: 'A hearty meat pie', itemType: 'food', category: 'baked_goods', basePrice: 12, rarity: 'common', icon: '🥧', effects: { health: 15 } },
    { name: 'Sweet Roll', description: 'A sugar-glazed pastry', itemType: 'food', category: 'baked_goods', basePrice: 8, rarity: 'common', icon: '🧁', effects: { health: 8, energy: 5 } },
    { name: 'Baguette', description: 'A long crusty baguette', itemType: 'food', category: 'baked_goods', basePrice: 6, rarity: 'common', icon: '🥖', effects: { health: 6 } },
    { name: 'Fruit Tart', description: 'A tart with seasonal fruits', itemType: 'food', category: 'baked_goods', basePrice: 15, rarity: 'uncommon', icon: '🥮', effects: { health: 12, energy: 8 } },
    { name: 'Honey Cake', description: 'Cake sweetened with wild honey', itemType: 'food', category: 'baked_goods', basePrice: 20, rarity: 'uncommon', icon: '🍰', effects: { health: 20, energy: 10 } },
    { name: 'Seed Bread', description: 'Dense bread with mixed seeds', itemType: 'food', category: 'baked_goods', basePrice: 7, rarity: 'common', icon: '🍞', effects: { health: 7 } },
    { name: 'Cheese Pastry', description: 'Flaky pastry filled with cheese', itemType: 'food', category: 'baked_goods', basePrice: 10, rarity: 'common', icon: '🧀', effects: { health: 10 } },
    { name: 'Cinnamon Roll', description: 'Warm roll with cinnamon swirl', itemType: 'food', category: 'baked_goods', basePrice: 9, rarity: 'common', icon: '🧁', effects: { health: 8, energy: 4 } },
    { name: 'Wedding Cake Slice', description: 'A luxurious decorated cake', itemType: 'food', category: 'baked_goods', basePrice: 50, rarity: 'rare', icon: '🎂', effects: { health: 30, energy: 20 } },
    { name: 'Sourdough Starter', description: 'A living yeast culture for baking', itemType: 'material', category: 'ingredient', basePrice: 25, rarity: 'uncommon', icon: '🫙' },
    { name: 'Flour Sack', description: 'A sack of milled flour', itemType: 'material', category: 'ingredient', basePrice: 15, rarity: 'common', icon: '🌾' },
  ],

  Bar: [
    { name: 'Ale', description: 'A mug of hearty ale', itemType: 'drink', category: 'alcohol', basePrice: 5, rarity: 'common', icon: '🍺', effects: { energy: 5 } },
    { name: 'Wine', description: 'A goblet of red wine', itemType: 'drink', category: 'alcohol', basePrice: 12, rarity: 'common', icon: '🍷', effects: { energy: 8 } },
    { name: 'Mead', description: 'Sweet honey mead', itemType: 'drink', category: 'alcohol', basePrice: 10, rarity: 'common', icon: '🍯', effects: { energy: 10 } },
    { name: 'Spirits', description: 'Strong distilled spirits', itemType: 'drink', category: 'alcohol', basePrice: 18, rarity: 'uncommon', icon: '🥃', effects: { energy: 15 } },
    { name: 'Cider', description: 'Crisp apple cider', itemType: 'drink', category: 'alcohol', basePrice: 7, rarity: 'common', icon: '🍎', effects: { energy: 6 } },
    { name: 'Stew', description: 'A bowl of thick tavern stew', itemType: 'food', category: 'cooked', basePrice: 8, rarity: 'common', icon: '🍲', effects: { health: 15 } },
    { name: 'Roasted Meat', description: 'Spit-roasted meat', itemType: 'food', category: 'cooked', basePrice: 15, rarity: 'common', icon: '🍖', effects: { health: 20 } },
    { name: 'Bread and Cheese', description: 'Simple tavern fare', itemType: 'food', category: 'cooked', basePrice: 4, rarity: 'common', icon: '🧀', effects: { health: 8 } },
    { name: 'Aged Wine', description: 'A rare vintage wine', itemType: 'drink', category: 'alcohol', basePrice: 80, rarity: 'rare', icon: '🍷', effects: { energy: 25 } },
    { name: 'Dwarven Stout', description: 'An incredibly strong dark beer', itemType: 'drink', category: 'alcohol', basePrice: 25, rarity: 'uncommon', icon: '🍺', effects: { energy: 20 } },
    { name: 'Pickled Eggs', description: 'Bar snack pickled eggs', itemType: 'food', category: 'preserved', basePrice: 3, rarity: 'common', icon: '🥚', effects: { health: 5 } },
  ],

  Restaurant: [
    { name: 'Grilled Fish', description: 'Fresh fish grilled to perfection', itemType: 'food', category: 'cooked', basePrice: 18, rarity: 'common', icon: '🐟', effects: { health: 20, energy: 5 } },
    { name: 'Roast Chicken', description: 'A whole roasted chicken', itemType: 'food', category: 'cooked', basePrice: 22, rarity: 'common', icon: '🍗', effects: { health: 25 } },
    { name: 'Vegetable Soup', description: 'A warming vegetable soup', itemType: 'food', category: 'cooked', basePrice: 8, rarity: 'common', icon: '🍲', effects: { health: 12 } },
    { name: 'Fruit Platter', description: 'A selection of seasonal fruits', itemType: 'food', category: 'raw', basePrice: 10, rarity: 'common', icon: '🍇', effects: { health: 10, energy: 5 } },
    { name: 'Lamb Steak', description: 'Tender lamb cooked rare', itemType: 'food', category: 'cooked', basePrice: 30, rarity: 'uncommon', icon: '🥩', effects: { health: 30 } },
    { name: 'Honey-Glazed Ham', description: 'Slow-roasted ham with honey glaze', itemType: 'food', category: 'cooked', basePrice: 25, rarity: 'uncommon', icon: '🍖', effects: { health: 25, energy: 10 } },
    { name: 'Fresh Salad', description: 'Crisp greens with vinaigrette', itemType: 'food', category: 'raw', basePrice: 6, rarity: 'common', icon: '🥗', effects: { health: 8 } },
    { name: 'Dessert Wine', description: 'Sweet after-dinner wine', itemType: 'drink', category: 'alcohol', basePrice: 15, rarity: 'common', icon: '🍷', effects: { energy: 10 } },
    { name: 'Tea', description: 'A cup of herbal tea', itemType: 'drink', category: 'beverage', basePrice: 3, rarity: 'common', icon: '🍵', effects: { energy: 5 } },
    { name: 'Chef\'s Special', description: 'Today\'s special — a masterpiece', itemType: 'food', category: 'cooked', basePrice: 60, rarity: 'rare', icon: '🍽️', effects: { health: 50, energy: 20 } },
  ],

  Shop: [
    { name: 'Rope', description: 'A coil of sturdy rope', itemType: 'tool', category: 'utility', basePrice: 10, rarity: 'common', icon: '🪢' },
    { name: 'Lantern', description: 'An oil lantern', itemType: 'tool', category: 'utility', basePrice: 15, rarity: 'common', icon: '🏮' },
    { name: 'Backpack', description: 'A leather travel backpack', itemType: 'tool', category: 'utility', basePrice: 25, rarity: 'common', icon: '🎒' },
    { name: 'Candles', description: 'A bundle of tallow candles', itemType: 'tool', category: 'utility', basePrice: 5, rarity: 'common', icon: '🕯️', stackable: true },
    { name: 'Map', description: 'A map of the local area', itemType: 'tool', category: 'utility', basePrice: 20, rarity: 'uncommon', icon: '🗺️' },
    { name: 'Tinderbox', description: 'Flint and steel for fire-starting', itemType: 'tool', category: 'utility', basePrice: 8, rarity: 'common', icon: '🔥' },
    { name: 'Soap', description: 'A bar of lye soap', itemType: 'consumable', category: 'toiletry', basePrice: 3, rarity: 'common', icon: '🧼' },
    { name: 'Cooking Pot', description: 'A cast iron cooking pot', itemType: 'tool', category: 'kitchen', basePrice: 18, rarity: 'common', icon: '🍳' },
    { name: 'Sewing Kit', description: 'Needles, thread, and scissors', itemType: 'tool', category: 'craft', basePrice: 12, rarity: 'common', icon: '🧵' },
    { name: 'Blanket', description: 'A warm wool blanket', itemType: 'tool', category: 'utility', basePrice: 14, rarity: 'common', icon: '🛏️' },
    { name: 'Lock and Key', description: 'A sturdy lock with matching key', itemType: 'tool', category: 'utility', basePrice: 30, rarity: 'uncommon', icon: '🔒' },
    { name: 'Writing Set', description: 'Ink, quill, and parchment', itemType: 'tool', category: 'utility', basePrice: 22, rarity: 'uncommon', icon: '✒️' },
  ],

  GroceryStore: [
    { name: 'Apples', description: 'A basket of fresh apples', itemType: 'food', category: 'produce', basePrice: 4, rarity: 'common', icon: '🍎', stackable: true, effects: { health: 5 } },
    { name: 'Cheese Wheel', description: 'A wheel of aged cheese', itemType: 'food', category: 'dairy', basePrice: 12, rarity: 'common', icon: '🧀', effects: { health: 10 } },
    { name: 'Eggs', description: 'A dozen fresh eggs', itemType: 'food', category: 'dairy', basePrice: 6, rarity: 'common', icon: '🥚', stackable: true, effects: { health: 5 } },
    { name: 'Salted Meat', description: 'Preserved salted meat', itemType: 'food', category: 'preserved', basePrice: 15, rarity: 'common', icon: '🥩', effects: { health: 15 } },
    { name: 'Vegetables', description: 'Assorted fresh vegetables', itemType: 'food', category: 'produce', basePrice: 5, rarity: 'common', icon: '🥕', stackable: true, effects: { health: 6 } },
    { name: 'Dried Herbs', description: 'A bundle of dried cooking herbs', itemType: 'material', category: 'ingredient', basePrice: 8, rarity: 'common', icon: '🌿' },
    { name: 'Honey Jar', description: 'A jar of golden honey', itemType: 'food', category: 'sweetener', basePrice: 10, rarity: 'common', icon: '🍯', effects: { health: 8 } },
    { name: 'Milk Jug', description: 'Fresh milk from local farms', itemType: 'drink', category: 'dairy', basePrice: 4, rarity: 'common', icon: '🥛', effects: { health: 5 } },
    { name: 'Salt', description: 'A sack of coarse salt', itemType: 'material', category: 'ingredient', basePrice: 6, rarity: 'common', icon: '🧂', stackable: true },
    { name: 'Smoked Fish', description: 'Smoked and preserved fish', itemType: 'food', category: 'preserved', basePrice: 12, rarity: 'common', icon: '🐟', effects: { health: 12 } },
    { name: 'Sugar', description: 'Refined cane sugar', itemType: 'material', category: 'ingredient', basePrice: 10, rarity: 'uncommon', icon: '🍬', stackable: true },
    { name: 'Olive Oil', description: 'Pressed olive oil', itemType: 'material', category: 'ingredient', basePrice: 14, rarity: 'uncommon', icon: '🫒' },
  ],

  Pharmacy: [
    { name: 'Health Potion', description: 'Restores a moderate amount of health', itemType: 'consumable', category: 'potion', basePrice: 25, rarity: 'common', icon: '🧪', effects: { health: 30 } },
    { name: 'Energy Tonic', description: 'Revitalizing herbal tonic', itemType: 'consumable', category: 'potion', basePrice: 20, rarity: 'common', icon: '⚗️', effects: { energy: 25 } },
    { name: 'Antidote', description: 'Cures common poisons', itemType: 'consumable', category: 'potion', basePrice: 30, rarity: 'uncommon', icon: '💊', effects: { health: 10 } },
    { name: 'Bandages', description: 'Linen bandages for wounds', itemType: 'consumable', category: 'medical', basePrice: 8, rarity: 'common', icon: '🩹', stackable: true, effects: { health: 10 } },
    { name: 'Sleeping Draught', description: 'Induces a restful sleep', itemType: 'consumable', category: 'potion', basePrice: 15, rarity: 'common', icon: '💤', effects: { energy: 30 } },
    { name: 'Dried Lavender', description: 'Calming aromatic herb', itemType: 'material', category: 'herb', basePrice: 5, rarity: 'common', icon: '💜' },
    { name: 'Ginseng Root', description: 'Powerful restorative root', itemType: 'material', category: 'herb', basePrice: 18, rarity: 'uncommon', icon: '🌱' },
    { name: 'Fever Reducer', description: 'Herbal fever remedy', itemType: 'consumable', category: 'medicine', basePrice: 12, rarity: 'common', icon: '🌡️', effects: { health: 15 } },
    { name: 'Elixir of Vitality', description: 'A powerful restorative elixir', itemType: 'consumable', category: 'potion', basePrice: 100, rarity: 'rare', icon: '✨', effects: { health: 50, energy: 50 } },
    { name: 'Sage Bundle', description: 'A bundle of dried sage', itemType: 'material', category: 'herb', basePrice: 6, rarity: 'common', icon: '🌿' },
    { name: 'Mortar and Pestle', description: 'For grinding herbs', itemType: 'tool', category: 'craft', basePrice: 20, rarity: 'common', icon: '⚱️' },
  ],

  JewelryStore: [
    { name: 'Silver Ring', description: 'A simple silver ring', itemType: 'armor', category: 'jewelry', basePrice: 50, rarity: 'common', icon: '💍' },
    { name: 'Gold Necklace', description: 'A delicate gold chain necklace', itemType: 'armor', category: 'jewelry', basePrice: 120, rarity: 'uncommon', icon: '📿' },
    { name: 'Emerald Pendant', description: 'A pendant set with a green emerald', itemType: 'armor', category: 'jewelry', basePrice: 300, rarity: 'rare', icon: '💎' },
    { name: 'Diamond Earrings', description: 'Sparkling diamond earrings', itemType: 'armor', category: 'jewelry', basePrice: 500, rarity: 'epic', icon: '💠' },
    { name: 'Ruby Brooch', description: 'A golden brooch with a red ruby', itemType: 'armor', category: 'jewelry', basePrice: 250, rarity: 'rare', icon: '🔴' },
    { name: 'Pearl Bracelet', description: 'A bracelet of lustrous pearls', itemType: 'armor', category: 'jewelry', basePrice: 180, rarity: 'uncommon', icon: '⚪' },
    { name: 'Silver Chain', description: 'A plain silver chain', itemType: 'armor', category: 'jewelry', basePrice: 35, rarity: 'common', icon: '⛓️' },
    { name: 'Sapphire Ring', description: 'A ring set with a deep blue sapphire', itemType: 'armor', category: 'jewelry', basePrice: 400, rarity: 'rare', icon: '🔵' },
    { name: 'Onyx Amulet', description: 'An amulet carved from black onyx', itemType: 'armor', category: 'jewelry', basePrice: 200, rarity: 'uncommon', icon: '⚫' },
    { name: 'Crown of the Ancient King', description: 'A legendary crown of immense power', itemType: 'armor', category: 'jewelry', basePrice: 2000, rarity: 'legendary', icon: '👑' },
  ],

  Brewery: [
    { name: 'Light Ale', description: 'A refreshing light ale', itemType: 'drink', category: 'alcohol', basePrice: 4, rarity: 'common', icon: '🍺', effects: { energy: 4 } },
    { name: 'Dark Stout', description: 'A rich dark stout', itemType: 'drink', category: 'alcohol', basePrice: 8, rarity: 'common', icon: '🍺', effects: { energy: 8 } },
    { name: 'Wheat Beer', description: 'A cloudy wheat beer', itemType: 'drink', category: 'alcohol', basePrice: 6, rarity: 'common', icon: '🍺', effects: { energy: 6 } },
    { name: 'Barrel of Ale', description: 'A full barrel of ale — trade goods', itemType: 'drink', category: 'bulk', basePrice: 40, rarity: 'common', icon: '🪣', stackable: true },
    { name: 'Hops', description: 'Dried hops for brewing', itemType: 'material', category: 'ingredient', basePrice: 5, rarity: 'common', icon: '🌿', stackable: true },
    { name: 'Yeast Culture', description: 'Active yeast for fermentation', itemType: 'material', category: 'ingredient', basePrice: 10, rarity: 'common', icon: '🫙' },
    { name: 'Malt Extract', description: 'Concentrated malt for brewing', itemType: 'material', category: 'ingredient', basePrice: 12, rarity: 'common', icon: '🌾' },
    { name: 'Specialty Porter', description: 'A carefully crafted porter', itemType: 'drink', category: 'alcohol', basePrice: 15, rarity: 'uncommon', icon: '🍺', effects: { energy: 12 } },
    { name: 'Vintage Reserve', description: 'A rare aged brew', itemType: 'drink', category: 'alcohol', basePrice: 60, rarity: 'rare', icon: '🍺', effects: { energy: 25 } },
    { name: 'Empty Bottles', description: 'Clean glass bottles', itemType: 'material', category: 'container', basePrice: 3, rarity: 'common', icon: '🍾', stackable: true },
  ],

  Farm: [
    { name: 'Wheat Bundle', description: 'Freshly harvested wheat', itemType: 'material', category: 'crop', basePrice: 4, rarity: 'common', icon: '🌾', stackable: true },
    { name: 'Fresh Milk', description: 'Straight from the cow', itemType: 'drink', category: 'dairy', basePrice: 3, rarity: 'common', icon: '🥛', effects: { health: 4 } },
    { name: 'Chicken', description: 'A live chicken', itemType: 'food', category: 'livestock', basePrice: 15, rarity: 'common', icon: '🐔' },
    { name: 'Corn', description: 'Ears of sweet corn', itemType: 'food', category: 'produce', basePrice: 3, rarity: 'common', icon: '🌽', stackable: true, effects: { health: 4 } },
    { name: 'Potatoes', description: 'A sack of potatoes', itemType: 'food', category: 'produce', basePrice: 5, rarity: 'common', icon: '🥔', stackable: true, effects: { health: 5 } },
    { name: 'Wool', description: 'Raw sheep wool', itemType: 'material', category: 'fiber', basePrice: 8, rarity: 'common', icon: '🐑', stackable: true },
    { name: 'Hay Bale', description: 'A bale of dried hay', itemType: 'material', category: 'feed', basePrice: 6, rarity: 'common', icon: '🌾', stackable: true },
    { name: 'Seeds', description: 'Assorted crop seeds', itemType: 'material', category: 'crop', basePrice: 5, rarity: 'common', icon: '🌱', stackable: true },
    { name: 'Leather Hide', description: 'Tanned leather hide', itemType: 'material', category: 'leather', basePrice: 20, rarity: 'uncommon', icon: '🟫' },
    { name: 'Prize Stallion', description: 'A magnificent horse', itemType: 'tool', category: 'mount', basePrice: 300, rarity: 'rare', icon: '🐎' },
  ],
};

// Map additional business types to closest catalog
const BUSINESS_TYPE_ALIASES: Record<string, string> = {
  Restaurant: 'Restaurant',
  Hotel: 'Restaurant',   // hotels serve food
  Hospital: 'Pharmacy',
  Church: 'Shop',        // general goods
  School: 'Shop',
  TownHall: 'Shop',
  Factory: 'Shop',
  Bank: 'Shop',
  LawFirm: 'Shop',
  PoliceStation: 'Shop',
  FireStation: 'Shop',
  Daycare: 'GroceryStore',
  DentalOffice: 'Pharmacy',
  OptometryOffice: 'Pharmacy',
  Mortuary: 'Shop',
  RealEstateOffice: 'Shop',
  InsuranceOffice: 'Shop',
  TattoParlor: 'Shop',
  University: 'Shop',
  ApartmentComplex: 'Shop',
  Generic: 'Shop',
};

// ── Core Functions ─────────────────────────────────────────────────────────

/**
 * Select N random items from a catalog pool.
 */
function selectRandomItems(pool: ItemTemplate[], count: number): ItemTemplate[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length));
}

/**
 * Apply ±20% price variation, influenced by merchant personality.
 * Agreeable merchants have lower prices.
 */
function applyPriceVariation(basePrice: number, agreeableness: number): number {
  // Agreeableness 0-1: 1 = lower prices (up to -20%), 0 = higher prices (up to +20%)
  const personalityMod = 1.0 + (0.2 - agreeableness * 0.4);
  // Random ±10% on top
  const randomMod = 0.9 + Math.random() * 0.2;
  return Math.max(1, Math.round(basePrice * personalityMod * randomMod));
}

/**
 * Calculate gold reserve based on business size/type.
 */
function calculateGoldReserve(businessType: string): number {
  const baseGold: Record<string, number> = {
    JewelryStore: 1000,
    Bank: 1000,
    Shop: 500,
    Restaurant: 400,
    Bar: 350,
    Bakery: 300,
    GroceryStore: 350,
    Pharmacy: 600,
    Brewery: 400,
    Farm: 300,
  };
  const base = baseGold[businessType] || 400;
  // ±25% random variation
  return Math.round(base * (0.75 + Math.random() * 0.5));
}

/**
 * Get item catalog for a business type.
 */
export function getItemCatalogForBusiness(businessType: string): ItemTemplate[] {
  if (BUSINESS_ITEM_CATALOG[businessType]) {
    return BUSINESS_ITEM_CATALOG[businessType];
  }
  const alias = BUSINESS_TYPE_ALIASES[businessType];
  if (alias && BUSINESS_ITEM_CATALOG[alias]) {
    return BUSINESS_ITEM_CATALOG[alias];
  }
  return BUSINESS_ITEM_CATALOG['Shop']; // ultimate fallback
}

/**
 * Generate a MerchantInventory for a single business.
 */
export function generateMerchantInventory(
  business: { id: string; name: string; businessType: string },
  merchantPersonality: { agreeableness: number },
  targetLanguage?: string
): MerchantInventory {
  const catalog = getItemCatalogForBusiness(business.businessType);
  const itemCount = 8 + Math.floor(Math.random() * 8); // 8-15
  const selected = selectRandomItems(catalog, itemCount);

  const shopItems: ShopItem[] = selected.map((template, i) => {
    const buyPrice = applyPriceVariation(
      template.basePrice * RARITY_PRICE_MULTIPLIERS[template.rarity],
      merchantPersonality.agreeableness
    );
    const sellPrice = Math.max(1, Math.round(buyPrice * 0.5));

    const displayName = (targetLanguage && template.translations?.[targetLanguage])
      ? template.translations[targetLanguage]
      : template.name;

    return {
      id: `${business.id}_item_${i}`,
      name: displayName,
      description: template.description,
      type: template.itemType,
      quantity: 1,
      icon: template.icon,
      category: template.category,
      rarity: template.rarity,
      effects: template.effects,
      tradeable: true,
      stackable: template.stackable,
      buyPrice,
      sellPrice,
      stock: template.stackable ? 5 + Math.floor(Math.random() * 10) : 1 + Math.floor(Math.random() * 3),
      maxStock: template.stackable ? 20 : 5,
      restockRate: 1, // restock 1 per day
    };
  });

  return {
    merchantId: business.id,
    merchantName: business.name,
    items: shopItems,
    goldReserve: calculateGoldReserve(business.businessType),
    buyMultiplier: 1.0,
    sellMultiplier: 0.5 + merchantPersonality.agreeableness * 0.1, // agreeable merchants pay more when buying from player
  };
}

/**
 * Generate inventories for all merchant businesses in a world.
 */
export async function generateWorldMerchantInventories(
  worldId: string,
  storage: MerchantInventoryStorage
): Promise<MerchantInventory[]> {
  const businesses = await storage.getBusinessesByWorld(worldId);
  const languages = await storage.getWorldLanguagesByWorld(worldId);
  const targetLanguage = languages.find(l => l.isLearningTarget)?.name;

  const merchantTypes = new Set([
    'Bakery', 'Bar', 'Restaurant', 'Shop', 'GroceryStore', 'Pharmacy',
    'JewelryStore', 'Brewery', 'Farm', 'Hotel',
  ]);

  const inventories: MerchantInventory[] = [];

  for (const biz of businesses) {
    // Only generate for merchant-type businesses
    if (!merchantTypes.has(biz.businessType) && !BUSINESS_TYPE_ALIASES[biz.businessType]) {
      continue;
    }

    // Get merchant personality (owner or first employee)
    let agreeableness = 0.5; // default
    if (biz.ownerId) {
      const owner = await storage.getCharacter(biz.ownerId);
      if (owner?.personality) {
        agreeableness = (owner.personality as any).agreeableness ?? 0.5;
      }
    }

    const inventory = generateMerchantInventory(
      { id: biz.id, name: biz.name, businessType: biz.businessType },
      { agreeableness },
      targetLanguage
    );

    inventories.push(inventory);
  }

  return inventories;
}

/**
 * Restock a merchant's inventory (daily refresh).
 * Restores stock toward maxStock at the restockRate.
 */
export function restockInventory(inventory: MerchantInventory): MerchantInventory {
  const updated: ShopItem[] = inventory.items.map(item => ({
    ...item,
    stock: Math.min(item.maxStock, item.stock + (item.restockRate || 1)),
  }));

  return {
    ...inventory,
    items: updated,
  };
}

/**
 * Get the accepted item types for a business (for sell validation).
 */
export function getAcceptedItemTypes(businessType: string): Set<string> {
  const catalog = getItemCatalogForBusiness(businessType);
  const types = new Set<string>();
  for (const item of catalog) {
    types.add(item.itemType);
  }
  return types;
}

/**
 * Collect all unique item names across all business catalogs.
 * Returns a deduplicated list with synthetic IDs for translation.
 */
export function collectUniqueCatalogItems(): Array<{ id: string; name: string; category: string; description: string }> {
  const seen = new Set<string>();
  const items: Array<{ id: string; name: string; category: string; description: string }> = [];

  for (const [, templates] of Object.entries(BUSINESS_ITEM_CATALOG)) {
    for (const t of templates) {
      if (!seen.has(t.name)) {
        seen.add(t.name);
        items.push({ id: t.name, name: t.name, category: t.category, description: t.description });
      }
    }
  }

  return items;
}

/**
 * Generate inventories for all businesses in a world and persist them
 * with target-language translations in each business's businessData.
 */
export async function generateAndPersistWorldInventories(
  worldId: string,
  storage: MerchantInventoryStorage,
  targetLanguage: string | null,
  translateFn?: TranslateItemFn,
): Promise<{ inventoryCount: number; translatedCount: number }> {
  const businesses = await storage.getBusinessesByWorld(worldId);

  const merchantTypes = new Set([
    'Bakery', 'Bar', 'Restaurant', 'Shop', 'GroceryStore', 'Pharmacy',
    'JewelryStore', 'Brewery', 'Farm', 'Hotel',
  ]);

  // Build translation map if target language is set
  let translationMap: Map<string, { targetWord: string; pronunciation: string }> | undefined;
  if (targetLanguage && translateFn) {
    const uniqueItems = collectUniqueCatalogItems();
    const translations = await translateFn(uniqueItems, targetLanguage);
    translationMap = new Map();
    for (const t of translations) {
      translationMap.set(t.id, { targetWord: t.targetWord, pronunciation: t.pronunciation });
    }
  }

  let inventoryCount = 0;
  let translatedCount = 0;

  for (const biz of businesses) {
    if (!merchantTypes.has(biz.businessType) && !BUSINESS_TYPE_ALIASES[biz.businessType]) {
      continue;
    }

    let agreeableness = 0.5;
    if (biz.ownerId) {
      const owner = await storage.getCharacter(biz.ownerId);
      if (owner?.personality) {
        agreeableness = (owner.personality as any).agreeableness ?? 0.5;
      }
    }

    const inventory = generateMerchantInventory(
      { id: biz.id, name: biz.name, businessType: biz.businessType },
      { agreeableness },
    );

    // Apply translations to items
    if (translationMap && targetLanguage) {
      for (const item of inventory.items) {
        const translation = translationMap.get(item.name);
        if (translation) {
          item.languageLearningData = {
            targetWord: translation.targetWord,
            targetLanguage,
            pronunciation: translation.pronunciation,
            category: item.category || 'general',
          };
          translatedCount++;
        }
      }
    }

    // Persist inventory in businessData
    if (storage.updateBusiness) {
      const existingData = (biz as any).businessData || {};
      await storage.updateBusiness(biz.id, {
        businessData: { ...existingData, inventory },
      });
    }

    inventoryCount++;
  }

  return { inventoryCount, translatedCount };
}
