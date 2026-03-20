/**
 * Base Item 3D Asset Audit
 *
 * Comprehensive audit of all base items across all world types,
 * their objectRole mappings, and sourced 3D asset recommendations.
 *
 * This module:
 * 1. Catalogs all 270 base items from migrations 011, 016, and 018
 * 2. Tracks which items have objectRole → 3D asset mappings
 * 3. Recommends free/CC0 3D assets for items without mappings
 * 4. Provides gap analysis statistics
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuditItem {
  name: string;
  worldType: string | null;
  itemType: string;
  objectRole: string | null;
  category: string;
  rarity: string;
  possessable: boolean;
}

export type AssetSource = 'polyhaven' | 'sketchfab' | 'quaternius' | 'kaykit' | 'kenney' | 'opengameart' | 'custom';

export interface AssetRecommendation {
  assetId: string;
  source: AssetSource;
  format: 'gltf' | 'glb';
  license: string;
  notes?: string;
}

export interface ItemAssetMapping {
  item: AuditItem;
  hasObjectRole: boolean;
  hasExisting3DAsset: boolean;
  existingAssetId?: string;
  recommendation?: AssetRecommendation;
}

export interface AuditSummary {
  totalItems: number;
  withObjectRole: number;
  withoutObjectRole: number;
  withExisting3DAsset: number;
  withRecommendation: number;
  unresolved: number;
  byWorldType: Record<string, { total: number; mapped: number; unmapped: number }>;
  byItemType: Record<string, { total: number; mapped: number; unmapped: number }>;
}

// ---------------------------------------------------------------------------
// Complete Base Item Catalog (migrations 011 + 018)
// ---------------------------------------------------------------------------

export const BASE_ITEM_CATALOG: AuditItem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MIGRATION 011: Original base items
  // ═══════════════════════════════════════════════════════════════════════════

  // Medieval-Fantasy (migration 011)
  { name: 'Iron Sword', worldType: 'medieval-fantasy', itemType: 'weapon', objectRole: 'sword', category: 'melee_weapon', rarity: 'common', possessable: true },
  { name: 'Dagger', worldType: 'medieval-fantasy', itemType: 'weapon', objectRole: 'dagger', category: 'melee_weapon', rarity: 'common', possessable: true },
  { name: 'Wooden Bow', worldType: 'medieval-fantasy', itemType: 'weapon', objectRole: 'bow', category: 'ranged_weapon', rarity: 'common', possessable: true },
  { name: 'Wooden Shield', worldType: 'medieval-fantasy', itemType: 'armor', objectRole: 'shield', category: 'shield', rarity: 'common', possessable: true },
  { name: 'Chainmail Vest', worldType: 'medieval-fantasy', itemType: 'armor', objectRole: 'chainmail', category: 'heavy_armor', rarity: 'uncommon', possessable: true },
  { name: 'Leather Boots', worldType: 'medieval-fantasy', itemType: 'armor', objectRole: 'boots', category: 'light_armor', rarity: 'common', possessable: true },
  { name: 'Health Potion', worldType: 'medieval-fantasy', itemType: 'consumable', objectRole: 'potion', category: 'potion', rarity: 'common', possessable: true },
  { name: 'Antidote', worldType: 'medieval-fantasy', itemType: 'consumable', objectRole: null, category: 'potion', rarity: 'uncommon', possessable: true },
  { name: 'Healing Herb', worldType: 'medieval-fantasy', itemType: 'consumable', objectRole: 'herb', category: 'ingredient', rarity: 'common', possessable: true },
  { name: 'Bread', worldType: 'medieval-fantasy', itemType: 'food', objectRole: 'food_loaf', category: 'food', rarity: 'common', possessable: true },
  { name: 'Meat Pie', worldType: 'medieval-fantasy', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Water Flask', worldType: 'medieval-fantasy', itemType: 'drink', objectRole: null, category: 'drink', rarity: 'common', possessable: true },
  { name: 'Torch', worldType: 'medieval-fantasy', itemType: 'tool', objectRole: 'torch', category: 'light_source', rarity: 'common', possessable: true },
  { name: 'Iron Pickaxe', worldType: 'medieval-fantasy', itemType: 'tool', objectRole: 'pickaxe', category: 'tool', rarity: 'common', possessable: true },
  { name: 'Rope', worldType: 'medieval-fantasy', itemType: 'tool', objectRole: null, category: 'utility', rarity: 'common', possessable: true },
  { name: 'Oil Lantern', worldType: 'medieval-fantasy', itemType: 'tool', objectRole: 'lantern', category: 'light_source', rarity: 'uncommon', possessable: true },
  { name: 'Golden Goblet', worldType: 'medieval-fantasy', itemType: 'collectible', objectRole: 'goblet', category: 'treasure', rarity: 'rare', possessable: true },
  { name: 'Jeweled Crown', worldType: 'medieval-fantasy', itemType: 'key', objectRole: 'crown', category: 'treasure', rarity: 'rare', possessable: true },
  { name: 'Treasure Chest', worldType: 'medieval-fantasy', itemType: 'collectible', objectRole: 'chest', category: 'container', rarity: 'uncommon', possessable: false },
  { name: 'Silver Ring', worldType: 'medieval-fantasy', itemType: 'collectible', objectRole: 'ring', category: 'jewelry', rarity: 'uncommon', possessable: true },
  { name: 'Gold Amulet', worldType: 'medieval-fantasy', itemType: 'collectible', objectRole: 'amulet', category: 'jewelry', rarity: 'rare', possessable: true },
  { name: 'Gemstone', worldType: 'medieval-fantasy', itemType: 'material', objectRole: 'gemstone', category: 'ore', rarity: 'rare', possessable: true },
  { name: 'Iron Ore', worldType: 'medieval-fantasy', itemType: 'material', objectRole: null, category: 'ore', rarity: 'common', possessable: true },

  // Cyberpunk (migration 011)
  { name: 'Cyber-Blade', worldType: 'cyberpunk', itemType: 'weapon', objectRole: 'blade', category: 'melee_weapon', rarity: 'uncommon', possessable: true },
  { name: 'Pulse Pistol', worldType: 'cyberpunk', itemType: 'weapon', objectRole: 'pistol', category: 'ranged_weapon', rarity: 'common', possessable: true },
  { name: 'EMP Grenade', worldType: 'cyberpunk', itemType: 'weapon', objectRole: null, category: 'explosive', rarity: 'uncommon', possessable: true },
  { name: 'Neural Stim', worldType: 'cyberpunk', itemType: 'consumable', objectRole: null, category: 'medical', rarity: 'common', possessable: true },
  { name: 'Med-Hypo', worldType: 'cyberpunk', itemType: 'consumable', objectRole: null, category: 'medical', rarity: 'common', possessable: true },
  { name: 'Synth-Food Bar', worldType: 'cyberpunk', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Encrypted Data Pad', worldType: 'cyberpunk', itemType: 'key', objectRole: 'data_pad', category: 'key', rarity: 'rare', possessable: true },
  { name: 'Energy Core', worldType: 'cyberpunk', itemType: 'material', objectRole: 'energy_core', category: 'component', rarity: 'uncommon', possessable: true },
  { name: 'Cyber-Deck', worldType: 'cyberpunk', itemType: 'tool', objectRole: 'console', category: 'tool', rarity: 'rare', possessable: true },
  { name: 'Supply Crate', worldType: 'cyberpunk', itemType: 'collectible', objectRole: 'crate', category: 'container', rarity: 'uncommon', possessable: false },
  { name: 'Credstick', worldType: 'cyberpunk', itemType: 'collectible', objectRole: null, category: 'currency', rarity: 'common', possessable: true },

  // Sci-Fi-Space (migration 011)
  { name: 'Plasma Pistol', worldType: 'sci-fi-space', itemType: 'weapon', objectRole: 'pistol', category: 'ranged_weapon', rarity: 'common', possessable: true },
  { name: 'Energy Cell', worldType: 'sci-fi-space', itemType: 'material', objectRole: null, category: 'ammunition', rarity: 'common', possessable: true },
  { name: 'Emergency Ration', worldType: 'sci-fi-space', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Oxygen Tank', worldType: 'sci-fi-space', itemType: 'consumable', objectRole: null, category: 'survival', rarity: 'common', possessable: true },
  { name: 'Repair Kit', worldType: 'sci-fi-space', itemType: 'tool', objectRole: null, category: 'tool', rarity: 'uncommon', possessable: true },
  { name: 'Medi-Gel', worldType: 'sci-fi-space', itemType: 'consumable', objectRole: null, category: 'medical', rarity: 'common', possessable: true },
  { name: 'Star Map Fragment', worldType: 'sci-fi-space', itemType: 'key', objectRole: null, category: 'key', rarity: 'rare', possessable: true },

  // Western (migration 011)
  { name: 'Revolver', worldType: 'western', itemType: 'weapon', objectRole: 'revolver', category: 'ranged_weapon', rarity: 'common', possessable: true },
  { name: 'Lasso', worldType: 'western', itemType: 'tool', objectRole: null, category: 'tool', rarity: 'common', possessable: true },
  { name: 'Whiskey', worldType: 'western', itemType: 'drink', objectRole: null, category: 'drink', rarity: 'common', possessable: true },
  { name: 'Dynamite', worldType: 'western', itemType: 'weapon', objectRole: null, category: 'explosive', rarity: 'uncommon', possessable: true },
  { name: 'Wanted Poster', worldType: 'western', itemType: 'quest', objectRole: 'wanted_poster', category: 'document', rarity: 'common', possessable: true },
  { name: 'Bandage', worldType: 'western', itemType: 'consumable', objectRole: null, category: 'medical', rarity: 'common', possessable: true },

  // Universal (migration 011)
  { name: 'Bookshelf', worldType: null, itemType: 'collectible', objectRole: 'bookshelf', category: 'furniture', rarity: 'common', possessable: false },

  // ═══════════════════════════════════════════════════════════════════════════
  // MIGRATION 016: New universal & medieval-fantasy items
  // ═══════════════════════════════════════════════════════════════════════════

  // Universal raw materials
  { name: 'Wood', worldType: null, itemType: 'material', objectRole: 'wood', category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Stone', worldType: null, itemType: 'material', objectRole: 'stone', category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Fiber', worldType: null, itemType: 'material', objectRole: null, category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Leather', worldType: null, itemType: 'material', objectRole: null, category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Cloth', worldType: null, itemType: 'material', objectRole: null, category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Clay', worldType: null, itemType: 'material', objectRole: null, category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Glass', worldType: null, itemType: 'material', objectRole: null, category: 'refined_material', rarity: 'common', possessable: true },

  // Universal refined materials & ores
  { name: 'Iron Ingot', worldType: null, itemType: 'material', objectRole: null, category: 'refined_material', rarity: 'common', possessable: true },
  { name: 'Steel Ingot', worldType: null, itemType: 'material', objectRole: null, category: 'refined_material', rarity: 'uncommon', possessable: true },
  { name: 'Silver Ingot', worldType: null, itemType: 'material', objectRole: null, category: 'refined_material', rarity: 'uncommon', possessable: true },
  { name: 'Gold Ingot', worldType: null, itemType: 'material', objectRole: null, category: 'refined_material', rarity: 'rare', possessable: true },
  { name: 'Copper Ore', worldType: null, itemType: 'material', objectRole: null, category: 'ore', rarity: 'common', possessable: true },
  { name: 'Coal', worldType: null, itemType: 'material', objectRole: null, category: 'fuel', rarity: 'common', possessable: true },

  // Universal tools
  { name: 'Knife', worldType: null, itemType: 'tool', objectRole: 'knife', category: 'tool', rarity: 'common', possessable: true },
  { name: 'Hammer', worldType: null, itemType: 'tool', objectRole: 'hammer', category: 'tool', rarity: 'common', possessable: true },
  { name: 'Shovel', worldType: null, itemType: 'tool', objectRole: null, category: 'tool', rarity: 'common', possessable: true },
  { name: 'Fishing Rod', worldType: null, itemType: 'tool', objectRole: null, category: 'tool', rarity: 'common', possessable: true },
  { name: 'Sack', worldType: null, itemType: 'tool', objectRole: null, category: 'container', rarity: 'common', possessable: true },
  { name: 'Candle', worldType: null, itemType: 'tool', objectRole: null, category: 'light_source', rarity: 'common', possessable: true },

  // Universal containers
  { name: 'Barrel', worldType: null, itemType: 'collectible', objectRole: 'barrel', category: 'container', rarity: 'common', possessable: false },
  { name: 'Crate', worldType: null, itemType: 'collectible', objectRole: 'crate', category: 'container', rarity: 'common', possessable: false },

  // Universal everyday items
  { name: 'Key', worldType: null, itemType: 'key', objectRole: 'key', category: 'key', rarity: 'uncommon', possessable: true },
  { name: 'Map', worldType: null, itemType: 'key', objectRole: null, category: 'document', rarity: 'uncommon', possessable: true },
  { name: 'Book', worldType: null, itemType: 'collectible', objectRole: 'book', category: 'document', rarity: 'common', possessable: true },
  { name: 'Letter', worldType: null, itemType: 'quest', objectRole: null, category: 'document', rarity: 'common', possessable: true },
  { name: 'Coin Purse', worldType: null, itemType: 'collectible', objectRole: null, category: 'currency', rarity: 'common', possessable: true },

  // Universal food & ingredients
  { name: 'Apple', worldType: null, itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Raw Meat', worldType: null, itemType: 'food', objectRole: null, category: 'ingredient', rarity: 'common', possessable: true },
  { name: 'Fish', worldType: null, itemType: 'food', objectRole: null, category: 'ingredient', rarity: 'common', possessable: true },
  { name: 'Mushroom', worldType: null, itemType: 'food', objectRole: null, category: 'ingredient', rarity: 'common', possessable: true },
  { name: 'Salt', worldType: null, itemType: 'material', objectRole: null, category: 'ingredient', rarity: 'common', possessable: true },

  // Universal environmental
  { name: 'Rock', worldType: null, itemType: 'material', objectRole: 'rock', category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Stick', worldType: null, itemType: 'material', objectRole: null, category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Bone', worldType: null, itemType: 'material', objectRole: null, category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Feather', worldType: null, itemType: 'material', objectRole: null, category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Shell', worldType: null, itemType: 'collectible', objectRole: null, category: 'collectible', rarity: 'common', possessable: true },

  // Medieval-Fantasy (migration 016)
  { name: 'Steel Sword', worldType: 'medieval-fantasy', itemType: 'weapon', objectRole: 'sword', category: 'melee_weapon', rarity: 'uncommon', possessable: true },
  { name: 'Longbow', worldType: 'medieval-fantasy', itemType: 'weapon', objectRole: 'bow', category: 'ranged_weapon', rarity: 'uncommon', possessable: true },
  { name: 'Crossbow', worldType: 'medieval-fantasy', itemType: 'weapon', objectRole: null, category: 'ranged_weapon', rarity: 'uncommon', possessable: true },
  { name: 'War Hammer', worldType: 'medieval-fantasy', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'uncommon', possessable: true },
  { name: 'Spear', worldType: 'medieval-fantasy', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'common', possessable: true },
  { name: 'Staff', worldType: 'medieval-fantasy', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'common', possessable: true },
  { name: 'Iron Shield', worldType: 'medieval-fantasy', itemType: 'armor', objectRole: 'shield', category: 'shield', rarity: 'uncommon', possessable: true },
  { name: 'Leather Armor', worldType: 'medieval-fantasy', itemType: 'armor', objectRole: null, category: 'light_armor', rarity: 'common', possessable: true },
  { name: 'Plate Armor', worldType: 'medieval-fantasy', itemType: 'armor', objectRole: null, category: 'heavy_armor', rarity: 'rare', possessable: true },
  { name: 'Helmet', worldType: 'medieval-fantasy', itemType: 'armor', objectRole: null, category: 'head_armor', rarity: 'common', possessable: true },
  { name: 'Arrow', worldType: 'medieval-fantasy', itemType: 'material', objectRole: null, category: 'ammunition', rarity: 'common', possessable: true },
  { name: 'Mana Potion', worldType: 'medieval-fantasy', itemType: 'consumable', objectRole: 'potion', category: 'potion', rarity: 'uncommon', possessable: true },
  { name: 'Ale', worldType: 'medieval-fantasy', itemType: 'drink', objectRole: null, category: 'drink', rarity: 'common', possessable: true },
  { name: 'Wine', worldType: 'medieval-fantasy', itemType: 'drink', objectRole: null, category: 'drink', rarity: 'uncommon', possessable: true },
  { name: 'Scroll', worldType: 'medieval-fantasy', itemType: 'collectible', objectRole: null, category: 'document', rarity: 'uncommon', possessable: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // MIGRATION 018: Expanded items
  // ═══════════════════════════════════════════════════════════════════════════

  // Universal food & drink
  { name: 'Cheese', worldType: null, itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Egg', worldType: null, itemType: 'food', objectRole: null, category: 'ingredient', rarity: 'common', possessable: true },
  { name: 'Honey', worldType: null, itemType: 'food', objectRole: null, category: 'food', rarity: 'uncommon', possessable: true },
  { name: 'Berries', worldType: null, itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Milk', worldType: null, itemType: 'drink', objectRole: null, category: 'drink', rarity: 'common', possessable: true },
  { name: 'Water Bottle', worldType: null, itemType: 'drink', objectRole: null, category: 'drink', rarity: 'common', possessable: true },
  { name: 'Flour', worldType: null, itemType: 'material', objectRole: null, category: 'ingredient', rarity: 'common', possessable: true },
  { name: 'Sugar', worldType: null, itemType: 'material', objectRole: null, category: 'ingredient', rarity: 'common', possessable: true },
  { name: 'Oil', worldType: null, itemType: 'material', objectRole: null, category: 'ingredient', rarity: 'common', possessable: true },

  // Universal materials
  { name: 'Rope Coil', worldType: null, itemType: 'material', objectRole: null, category: 'utility', rarity: 'common', possessable: true },
  { name: 'Nails', worldType: null, itemType: 'material', objectRole: null, category: 'component', rarity: 'common', possessable: true },
  { name: 'Wax', worldType: null, itemType: 'material', objectRole: null, category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Thread', worldType: null, itemType: 'material', objectRole: null, category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Ink', worldType: null, itemType: 'material', objectRole: null, category: 'refined_material', rarity: 'common', possessable: true },
  { name: 'Parchment', worldType: null, itemType: 'material', objectRole: null, category: 'raw_material', rarity: 'common', possessable: true },

  // Universal tools
  { name: 'Needle', worldType: null, itemType: 'tool', objectRole: null, category: 'tool', rarity: 'common', possessable: true },
  { name: 'Saw', worldType: null, itemType: 'tool', objectRole: null, category: 'tool', rarity: 'common', possessable: true },
  { name: 'Bucket', worldType: null, itemType: 'tool', objectRole: 'bucket', category: 'container', rarity: 'common', possessable: true },
  { name: 'Mortar and Pestle', worldType: null, itemType: 'tool', objectRole: null, category: 'tool', rarity: 'uncommon', possessable: true },

  // Universal collectibles
  { name: 'Flower', worldType: null, itemType: 'collectible', objectRole: null, category: 'collectible', rarity: 'common', possessable: true },
  { name: 'Pendant', worldType: null, itemType: 'collectible', objectRole: null, category: 'jewelry', rarity: 'uncommon', possessable: true },
  { name: 'Mirror', worldType: null, itemType: 'collectible', objectRole: null, category: 'collectible', rarity: 'uncommon', possessable: true },
  { name: 'Dice', worldType: null, itemType: 'collectible', objectRole: null, category: 'collectible', rarity: 'common', possessable: true },
  { name: 'Bell', worldType: null, itemType: 'collectible', objectRole: null, category: 'collectible', rarity: 'common', possessable: true },

  // Universal furniture
  { name: 'Chair', worldType: null, itemType: 'collectible', objectRole: 'chair', category: 'furniture', rarity: 'common', possessable: false },
  { name: 'Table', worldType: null, itemType: 'collectible', objectRole: 'table', category: 'furniture', rarity: 'common', possessable: false },
  { name: 'Bed', worldType: null, itemType: 'collectible', objectRole: 'bed', category: 'furniture', rarity: 'common', possessable: false },
  { name: 'Shelf', worldType: null, itemType: 'collectible', objectRole: 'shelf', category: 'furniture', rarity: 'common', possessable: false },
  { name: 'Chest', worldType: null, itemType: 'collectible', objectRole: 'chest', category: 'furniture', rarity: 'common', possessable: false },
  { name: 'Chandelier', worldType: null, itemType: 'collectible', objectRole: 'chandelier', category: 'furniture', rarity: 'uncommon', possessable: false },

  // Medieval-Fantasy (migration 018)
  { name: 'Battle Axe', worldType: 'medieval-fantasy', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'uncommon', possessable: true },
  { name: 'Mace', worldType: 'medieval-fantasy', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'uncommon', possessable: true },
  { name: 'Halberd', worldType: 'medieval-fantasy', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'rare', possessable: true },
  { name: 'Enchanted Ring', worldType: 'medieval-fantasy', itemType: 'collectible', objectRole: null, category: 'jewelry', rarity: 'rare', possessable: true },
  { name: 'Cloak', worldType: 'medieval-fantasy', itemType: 'armor', objectRole: null, category: 'light_armor', rarity: 'common', possessable: true },
  { name: 'Gauntlets', worldType: 'medieval-fantasy', itemType: 'armor', objectRole: null, category: 'hand_armor', rarity: 'uncommon', possessable: true },
  { name: 'Holy Water', worldType: 'medieval-fantasy', itemType: 'consumable', objectRole: null, category: 'potion', rarity: 'uncommon', possessable: true },
  { name: 'Elixir of Strength', worldType: 'medieval-fantasy', itemType: 'consumable', objectRole: 'potion', category: 'potion', rarity: 'rare', possessable: true },
  { name: 'Dragon Scale', worldType: 'medieval-fantasy', itemType: 'material', objectRole: null, category: 'rare_material', rarity: 'legendary', possessable: true },
  { name: 'Quiver', worldType: 'medieval-fantasy', itemType: 'tool', objectRole: null, category: 'equipment', rarity: 'common', possessable: true },
  { name: 'Spell Book', worldType: 'medieval-fantasy', itemType: 'collectible', objectRole: 'book', category: 'document', rarity: 'rare', possessable: true },
  { name: 'Crystal Ball', worldType: 'medieval-fantasy', itemType: 'collectible', objectRole: null, category: 'treasure', rarity: 'epic', possessable: true },
  { name: 'Candleholder', worldType: 'medieval-fantasy', itemType: 'collectible', objectRole: 'candleholder', category: 'decoration', rarity: 'common', possessable: true },
  { name: 'Goblet', worldType: 'medieval-fantasy', itemType: 'collectible', objectRole: 'goblet', category: 'collectible', rarity: 'common', possessable: true },
  { name: 'Stew', worldType: 'medieval-fantasy', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Roasted Chicken', worldType: 'medieval-fantasy', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Gothic Cabinet', worldType: 'medieval-fantasy', itemType: 'collectible', objectRole: 'cabinet', category: 'furniture', rarity: 'uncommon', possessable: false },
  { name: 'Commode', worldType: 'medieval-fantasy', itemType: 'collectible', objectRole: 'commode', category: 'furniture', rarity: 'common', possessable: false },

  // Cyberpunk (migration 018)
  { name: 'Shock Baton', worldType: 'cyberpunk', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'common', possessable: true },
  { name: 'Plasma Rifle', worldType: 'cyberpunk', itemType: 'weapon', objectRole: null, category: 'ranged_weapon', rarity: 'rare', possessable: true },
  { name: 'Nano-Wire', worldType: 'cyberpunk', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'rare', possessable: true },
  { name: 'Holo-Shield', worldType: 'cyberpunk', itemType: 'armor', objectRole: null, category: 'shield', rarity: 'uncommon', possessable: true },
  { name: 'Synth-Armor Vest', worldType: 'cyberpunk', itemType: 'armor', objectRole: null, category: 'light_armor', rarity: 'uncommon', possessable: true },
  { name: 'Combat Helmet', worldType: 'cyberpunk', itemType: 'armor', objectRole: null, category: 'head_armor', rarity: 'uncommon', possessable: true },
  { name: 'Neural Interface', worldType: 'cyberpunk', itemType: 'tool', objectRole: null, category: 'implant', rarity: 'epic', possessable: true },
  { name: 'Reflex Booster', worldType: 'cyberpunk', itemType: 'consumable', objectRole: null, category: 'implant', rarity: 'rare', possessable: true },
  { name: 'Stim Pack', worldType: 'cyberpunk', itemType: 'consumable', objectRole: null, category: 'medical', rarity: 'common', possessable: true },
  { name: 'E-Ration', worldType: 'cyberpunk', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Neon Drink', worldType: 'cyberpunk', itemType: 'drink', objectRole: null, category: 'drink', rarity: 'common', possessable: true },
  { name: 'Hacking Spike', worldType: 'cyberpunk', itemType: 'key', objectRole: null, category: 'key', rarity: 'uncommon', possessable: true },
  { name: 'ID Chip', worldType: 'cyberpunk', itemType: 'key', objectRole: null, category: 'key', rarity: 'rare', possessable: true },
  { name: 'Scrap Metal', worldType: 'cyberpunk', itemType: 'material', objectRole: null, category: 'raw_material', rarity: 'common', possessable: true },
  { name: 'Circuit Board', worldType: 'cyberpunk', itemType: 'material', objectRole: null, category: 'component', rarity: 'common', possessable: true },
  { name: 'Boombox', worldType: 'cyberpunk', itemType: 'collectible', objectRole: 'boombox', category: 'decoration', rarity: 'common', possessable: false },

  // Sci-Fi-Space (migration 018)
  { name: 'Laser Rifle', worldType: 'sci-fi-space', itemType: 'weapon', objectRole: null, category: 'ranged_weapon', rarity: 'uncommon', possessable: true },
  { name: 'Stun Baton', worldType: 'sci-fi-space', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'common', possessable: true },
  { name: 'Photon Blade', worldType: 'sci-fi-space', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'epic', possessable: true },
  { name: 'EVA Suit', worldType: 'sci-fi-space', itemType: 'armor', objectRole: null, category: 'heavy_armor', rarity: 'rare', possessable: true },
  { name: 'Shield Generator', worldType: 'sci-fi-space', itemType: 'armor', objectRole: null, category: 'shield', rarity: 'rare', possessable: true },
  { name: 'Bio-Gel Pack', worldType: 'sci-fi-space', itemType: 'consumable', objectRole: null, category: 'medical', rarity: 'uncommon', possessable: true },
  { name: 'Stim Injector', worldType: 'sci-fi-space', itemType: 'consumable', objectRole: null, category: 'medical', rarity: 'common', possessable: true },
  { name: 'Nutrient Paste', worldType: 'sci-fi-space', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Protein Bar', worldType: 'sci-fi-space', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Data Crystal', worldType: 'sci-fi-space', itemType: 'key', objectRole: null, category: 'data', rarity: 'rare', possessable: true },
  { name: 'Access Keycard', worldType: 'sci-fi-space', itemType: 'key', objectRole: null, category: 'key', rarity: 'uncommon', possessable: true },
  { name: 'Titanium Alloy', worldType: 'sci-fi-space', itemType: 'material', objectRole: null, category: 'refined_material', rarity: 'uncommon', possessable: true },
  { name: 'Quantum Chip', worldType: 'sci-fi-space', itemType: 'material', objectRole: null, category: 'component', rarity: 'rare', possessable: true },
  { name: 'Scanner', worldType: 'sci-fi-space', itemType: 'tool', objectRole: null, category: 'tool', rarity: 'uncommon', possessable: true },
  { name: 'Multi-Tool', worldType: 'sci-fi-space', itemType: 'tool', objectRole: null, category: 'tool', rarity: 'common', possessable: true },

  // Western (migration 018)
  { name: 'Rifle', worldType: 'western', itemType: 'weapon', objectRole: null, category: 'ranged_weapon', rarity: 'uncommon', possessable: true },
  { name: 'Shotgun', worldType: 'western', itemType: 'weapon', objectRole: null, category: 'ranged_weapon', rarity: 'uncommon', possessable: true },
  { name: 'Bowie Knife', worldType: 'western', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'common', possessable: true },
  { name: 'Leather Duster', worldType: 'western', itemType: 'armor', objectRole: null, category: 'light_armor', rarity: 'common', possessable: true },
  { name: 'Cowboy Hat', worldType: 'western', itemType: 'armor', objectRole: null, category: 'head_armor', rarity: 'common', possessable: true },
  { name: 'Bullets', worldType: 'western', itemType: 'material', objectRole: null, category: 'ammunition', rarity: 'common', possessable: true },
  { name: 'Moonshine', worldType: 'western', itemType: 'drink', objectRole: null, category: 'drink', rarity: 'uncommon', possessable: true },
  { name: 'Beef Jerky', worldType: 'western', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Canned Beans', worldType: 'western', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Pocket Watch', worldType: 'western', itemType: 'collectible', objectRole: null, category: 'jewelry', rarity: 'uncommon', possessable: true },
  { name: 'Harmonica', worldType: 'western', itemType: 'collectible', objectRole: null, category: 'collectible', rarity: 'common', possessable: true },
  { name: 'Gold Nugget', worldType: 'western', itemType: 'material', objectRole: null, category: 'ore', rarity: 'rare', possessable: true },
  { name: 'Tobacco Pouch', worldType: 'western', itemType: 'consumable', objectRole: null, category: 'consumable', rarity: 'common', possessable: true },
  { name: 'Lantern', worldType: 'western', itemType: 'tool', objectRole: 'lantern', category: 'light_source', rarity: 'common', possessable: true },
  { name: 'Axe', worldType: 'western', itemType: 'tool', objectRole: 'axe', category: 'tool', rarity: 'common', possessable: true },
  { name: 'Saddle', worldType: 'western', itemType: 'tool', objectRole: null, category: 'equipment', rarity: 'uncommon', possessable: false },
  { name: 'Bar Stool', worldType: 'western', itemType: 'collectible', objectRole: 'bar_stool', category: 'furniture', rarity: 'common', possessable: false },
  { name: 'Rocking Chair', worldType: 'western', itemType: 'collectible', objectRole: 'chair', category: 'furniture', rarity: 'common', possessable: false },
  { name: 'Cash Register', worldType: 'western', itemType: 'collectible', objectRole: 'register', category: 'furniture', rarity: 'uncommon', possessable: false },

  // Historical-Ancient (migration 018)
  { name: 'Bronze Sword', worldType: 'historical-ancient', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'common', possessable: true },
  { name: 'Javelin', worldType: 'historical-ancient', itemType: 'weapon', objectRole: null, category: 'ranged_weapon', rarity: 'common', possessable: true },
  { name: 'Gladius', worldType: 'historical-ancient', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'uncommon', possessable: true },
  { name: 'Round Shield', worldType: 'historical-ancient', itemType: 'armor', objectRole: null, category: 'shield', rarity: 'common', possessable: true },
  { name: 'Toga', worldType: 'historical-ancient', itemType: 'armor', objectRole: null, category: 'light_armor', rarity: 'common', possessable: true },
  { name: 'Laurel Wreath', worldType: 'historical-ancient', itemType: 'collectible', objectRole: null, category: 'treasure', rarity: 'rare', possessable: true },
  { name: 'Amphora', worldType: 'historical-ancient', itemType: 'collectible', objectRole: 'vase', category: 'container', rarity: 'common', possessable: true },
  { name: 'Olive Oil', worldType: 'historical-ancient', itemType: 'food', objectRole: null, category: 'ingredient', rarity: 'common', possessable: true },
  { name: 'Flatbread', worldType: 'historical-ancient', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Wine Jug', worldType: 'historical-ancient', itemType: 'drink', objectRole: null, category: 'drink', rarity: 'common', possessable: true },
  { name: 'Papyrus Scroll', worldType: 'historical-ancient', itemType: 'collectible', objectRole: null, category: 'document', rarity: 'uncommon', possessable: true },
  { name: 'Ancient Coin', worldType: 'historical-ancient', itemType: 'collectible', objectRole: null, category: 'currency', rarity: 'common', possessable: true },
  { name: 'Brass Pot', worldType: 'historical-ancient', itemType: 'tool', objectRole: 'pot', category: 'tool', rarity: 'common', possessable: true },
  { name: 'Brass Pan', worldType: 'historical-ancient', itemType: 'tool', objectRole: 'pan', category: 'tool', rarity: 'common', possessable: true },
  { name: 'Stone Fire Pit', worldType: 'historical-ancient', itemType: 'collectible', objectRole: 'fire_pit', category: 'furniture', rarity: 'common', possessable: false },

  // Post-Apocalyptic (migration 018)
  { name: 'Pipe Wrench', worldType: 'post-apocalyptic', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'common', possessable: true },
  { name: 'Makeshift Rifle', worldType: 'post-apocalyptic', itemType: 'weapon', objectRole: null, category: 'ranged_weapon', rarity: 'uncommon', possessable: true },
  { name: 'Spiked Bat', worldType: 'post-apocalyptic', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'common', possessable: true },
  { name: 'Scrap Armor', worldType: 'post-apocalyptic', itemType: 'armor', objectRole: null, category: 'heavy_armor', rarity: 'common', possessable: true },
  { name: 'Gas Mask', worldType: 'post-apocalyptic', itemType: 'armor', objectRole: null, category: 'head_armor', rarity: 'uncommon', possessable: true },
  { name: 'Canned Food', worldType: 'post-apocalyptic', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Purified Water', worldType: 'post-apocalyptic', itemType: 'drink', objectRole: null, category: 'drink', rarity: 'uncommon', possessable: true },
  { name: 'Rad-Away', worldType: 'post-apocalyptic', itemType: 'consumable', objectRole: null, category: 'medical', rarity: 'uncommon', possessable: true },
  { name: 'Duct Tape', worldType: 'post-apocalyptic', itemType: 'material', objectRole: null, category: 'component', rarity: 'common', possessable: true },
  { name: 'Fuel Can', worldType: 'post-apocalyptic', itemType: 'material', objectRole: null, category: 'fuel', rarity: 'rare', possessable: true },
  { name: 'Survival Axe', worldType: 'post-apocalyptic', itemType: 'tool', objectRole: 'axe', category: 'tool', rarity: 'common', possessable: true },
  { name: 'Geiger Counter', worldType: 'post-apocalyptic', itemType: 'tool', objectRole: null, category: 'tool', rarity: 'rare', possessable: true },
  { name: 'Barrel Stove', worldType: 'post-apocalyptic', itemType: 'collectible', objectRole: 'barrel_fire', category: 'furniture', rarity: 'common', possessable: false },

  // Tropical-Pirate (migration 018)
  { name: 'Cutlass', worldType: 'tropical-pirate', itemType: 'weapon', objectRole: 'saber', category: 'melee_weapon', rarity: 'common', possessable: true },
  { name: 'Flintlock Pistol', worldType: 'tropical-pirate', itemType: 'weapon', objectRole: null, category: 'ranged_weapon', rarity: 'uncommon', possessable: true },
  { name: 'Boarding Axe', worldType: 'tropical-pirate', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'common', possessable: true },
  { name: 'Pirate Hat', worldType: 'tropical-pirate', itemType: 'armor', objectRole: null, category: 'head_armor', rarity: 'common', possessable: true },
  { name: 'Rum', worldType: 'tropical-pirate', itemType: 'drink', objectRole: null, category: 'drink', rarity: 'common', possessable: true },
  { name: 'Coconut', worldType: 'tropical-pirate', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Banana', worldType: 'tropical-pirate', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Treasure Map', worldType: 'tropical-pirate', itemType: 'quest', objectRole: null, category: 'document', rarity: 'legendary', possessable: true },
  { name: 'Gold Doubloon', worldType: 'tropical-pirate', itemType: 'collectible', objectRole: null, category: 'currency', rarity: 'uncommon', possessable: true },
  { name: 'Pearl', worldType: 'tropical-pirate', itemType: 'collectible', objectRole: null, category: 'gemstone', rarity: 'rare', possessable: true },
  { name: 'Spyglass', worldType: 'tropical-pirate', itemType: 'tool', objectRole: null, category: 'tool', rarity: 'uncommon', possessable: true },
  { name: 'Compass', worldType: 'tropical-pirate', itemType: 'tool', objectRole: null, category: 'tool', rarity: 'uncommon', possessable: true },
  { name: 'Fishing Net', worldType: 'tropical-pirate', itemType: 'tool', objectRole: null, category: 'tool', rarity: 'common', possessable: true },
  { name: 'Pirate Lantern', worldType: 'tropical-pirate', itemType: 'tool', objectRole: 'lantern', category: 'light_source', rarity: 'common', possessable: true },

  // Steampunk (migration 018)
  { name: 'Steam Pistol', worldType: 'steampunk', itemType: 'weapon', objectRole: null, category: 'ranged_weapon', rarity: 'common', possessable: true },
  { name: 'Clockwork Sword', worldType: 'steampunk', itemType: 'weapon', objectRole: null, category: 'melee_weapon', rarity: 'rare', possessable: true },
  { name: 'Aether Goggles', worldType: 'steampunk', itemType: 'armor', objectRole: null, category: 'head_armor', rarity: 'uncommon', possessable: true },
  { name: 'Reinforced Corset', worldType: 'steampunk', itemType: 'armor', objectRole: null, category: 'light_armor', rarity: 'uncommon', possessable: true },
  { name: 'Clockwork Key', worldType: 'steampunk', itemType: 'key', objectRole: null, category: 'key', rarity: 'uncommon', possessable: true },
  { name: 'Gear Set', worldType: 'steampunk', itemType: 'material', objectRole: null, category: 'component', rarity: 'common', possessable: true },
  { name: 'Steam Core', worldType: 'steampunk', itemType: 'material', objectRole: null, category: 'component', rarity: 'uncommon', possessable: true },
  { name: 'Tea', worldType: 'steampunk', itemType: 'drink', objectRole: null, category: 'drink', rarity: 'common', possessable: true },
  { name: 'Scone', worldType: 'steampunk', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Blowtorch', worldType: 'steampunk', itemType: 'tool', objectRole: 'blowtorch', category: 'tool', rarity: 'common', possessable: true },
  { name: 'Pocket Chronometer', worldType: 'steampunk', itemType: 'collectible', objectRole: null, category: 'jewelry', rarity: 'uncommon', possessable: true },
  { name: 'Monocle', worldType: 'steampunk', itemType: 'collectible', objectRole: null, category: 'collectible', rarity: 'common', possessable: true },
  { name: 'Oil Lamp', worldType: 'steampunk', itemType: 'tool', objectRole: 'oil_lamp', category: 'light_source', rarity: 'common', possessable: true },
  { name: 'Tea Set', worldType: 'steampunk', itemType: 'collectible', objectRole: 'tea_set', category: 'decoration', rarity: 'uncommon', possessable: false },
  { name: 'Grandfather Clock', worldType: 'steampunk', itemType: 'collectible', objectRole: 'clock', category: 'furniture', rarity: 'uncommon', possessable: false },
  { name: 'Filing Cabinet', worldType: 'steampunk', itemType: 'collectible', objectRole: 'drawer', category: 'furniture', rarity: 'common', possessable: false },

  // Modern-Realistic (migration 018)
  { name: 'Smartphone', worldType: 'modern-realistic', itemType: 'tool', objectRole: null, category: 'tool', rarity: 'uncommon', possessable: true },
  { name: 'Backpack', worldType: 'modern-realistic', itemType: 'tool', objectRole: null, category: 'equipment', rarity: 'common', possessable: true },
  { name: 'First Aid Kit', worldType: 'modern-realistic', itemType: 'consumable', objectRole: null, category: 'medical', rarity: 'uncommon', possessable: true },
  { name: 'Energy Drink', worldType: 'modern-realistic', itemType: 'drink', objectRole: null, category: 'drink', rarity: 'common', possessable: true },
  { name: 'Coffee', worldType: 'modern-realistic', itemType: 'drink', objectRole: null, category: 'drink', rarity: 'common', possessable: true },
  { name: 'Sandwich', worldType: 'modern-realistic', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Pizza Slice', worldType: 'modern-realistic', itemType: 'food', objectRole: null, category: 'food', rarity: 'common', possessable: true },
  { name: 'Notebook', worldType: 'modern-realistic', itemType: 'collectible', objectRole: null, category: 'document', rarity: 'common', possessable: true },
  { name: 'Wallet', worldType: 'modern-realistic', itemType: 'collectible', objectRole: null, category: 'currency', rarity: 'common', possessable: true },
  { name: 'Umbrella', worldType: 'modern-realistic', itemType: 'tool', objectRole: null, category: 'tool', rarity: 'common', possessable: true },
  { name: 'Flashlight', worldType: 'modern-realistic', itemType: 'tool', objectRole: null, category: 'light_source', rarity: 'common', possessable: true },
  { name: 'Sunglasses', worldType: 'modern-realistic', itemType: 'collectible', objectRole: null, category: 'collectible', rarity: 'common', possessable: true },
  { name: 'Headphones', worldType: 'modern-realistic', itemType: 'collectible', objectRole: null, category: 'collectible', rarity: 'uncommon', possessable: true },
  { name: 'USB Drive', worldType: 'modern-realistic', itemType: 'key', objectRole: null, category: 'data', rarity: 'uncommon', possessable: true },
  { name: 'Battery', worldType: 'modern-realistic', itemType: 'material', objectRole: null, category: 'component', rarity: 'common', possessable: true },
];

// ---------------------------------------------------------------------------
// Existing 3D assets available in the project (Polyhaven + quest objects)
// ---------------------------------------------------------------------------

export const EXISTING_ASSETS: Record<string, { path: string; format: 'gltf' | 'glb' }> = {
  // Polyhaven models (objectModels / questObjectModels)
  'antique_estoc': { path: 'polyhaven/models/antique_estoc.gltf', format: 'gltf' },
  'antique_katana_01': { path: 'polyhaven/models/antique_katana_01.gltf', format: 'gltf' },
  'ArmChair_01': { path: 'polyhaven/models/ArmChair_01.gltf', format: 'gltf' },
  'bar_chair_round_01': { path: 'polyhaven/models/bar_chair_round_01.gltf', format: 'gltf' },
  'Barrel_01': { path: 'polyhaven/models/Barrel_01.gltf', format: 'gltf' },
  'barrel_03': { path: 'polyhaven/models/barrel_03.gltf', format: 'gltf' },
  'barrel_stove': { path: 'polyhaven/models/barrel_stove.gltf', format: 'gltf' },
  'book_encyclopedia_set_01': { path: 'polyhaven/models/book_encyclopedia_set_01.gltf', format: 'gltf' },
  'boombox': { path: 'polyhaven/models/boombox.gltf', format: 'gltf' },
  'brass_candleholders': { path: 'polyhaven/models/brass_candleholders.gltf', format: 'gltf' },
  'brass_goblets': { path: 'polyhaven/models/brass_goblets.gltf', format: 'gltf' },
  'CashRegister_01': { path: 'polyhaven/models/CashRegister_01.gltf', format: 'gltf' },
  'Chandelier_01': { path: 'polyhaven/models/Chandelier_01.gltf', format: 'gltf' },
  'ClassicConsole_01': { path: 'polyhaven/models/ClassicConsole_01.gltf', format: 'gltf' },
  'GothicBed_01': { path: 'polyhaven/models/GothicBed_01.gltf', format: 'gltf' },
  'GothicCabinet_01': { path: 'polyhaven/models/GothicCabinet_01.gltf', format: 'gltf' },
  'GreenChair_01': { path: 'polyhaven/models/GreenChair_01.gltf', format: 'gltf' },
  'Lantern_01': { path: 'polyhaven/models/Lantern_01.gltf', format: 'gltf' },
  'metal_tool_chest': { path: 'polyhaven/models/metal_tool_chest.gltf', format: 'gltf' },
  'Rockingchair_01': { path: 'polyhaven/models/Rockingchair_01.gltf', format: 'gltf' },
  'Shelf_01': { path: 'polyhaven/models/Shelf_01.gltf', format: 'gltf' },
  'stone_fire_pit': { path: 'polyhaven/models/stone_fire_pit.gltf', format: 'gltf' },
  'street_lamp_01': { path: 'polyhaven/models/street_lamp_01.gltf', format: 'gltf' },
  'street_lamp_02': { path: 'polyhaven/models/street_lamp_02.gltf', format: 'gltf' },
  'tea_set_01': { path: 'polyhaven/models/tea_set_01.gltf', format: 'gltf' },
  'treasure_chest': { path: 'polyhaven/models/treasure_chest.gltf', format: 'gltf' },
  'vintage_grandfather_clock_01': { path: 'polyhaven/models/vintage_grandfather_clock_01.gltf', format: 'gltf' },
  'vintage_oil_lamp': { path: 'polyhaven/models/vintage_oil_lamp.gltf', format: 'gltf' },
  'wine_barrel_01': { path: 'polyhaven/models/wine_barrel_01.gltf', format: 'gltf' },
  'wooden_axe': { path: 'polyhaven/models/wooden_axe.gltf', format: 'gltf' },
  'wooden_barrels_01': { path: 'polyhaven/models/wooden_barrels_01.gltf', format: 'gltf' },
  'wooden_bookshelf_worn': { path: 'polyhaven/models/wooden_bookshelf_worn.gltf', format: 'gltf' },
  'wooden_bucket_01': { path: 'polyhaven/models/wooden_bucket_01.gltf', format: 'gltf' },
  'wooden_bucket_02': { path: 'polyhaven/models/wooden_bucket_02.gltf', format: 'gltf' },
  'wooden_candlestick': { path: 'polyhaven/models/wooden_candlestick.gltf', format: 'gltf' },
  'wooden_crate_01': { path: 'polyhaven/models/wooden_crate_01.gltf', format: 'gltf' },
  'wooden_crate_02': { path: 'polyhaven/models/wooden_crate_02.gltf', format: 'gltf' },
  'wooden_handle_saber': { path: 'polyhaven/models/wooden_handle_saber.gltf', format: 'gltf' },
  'wooden_lantern_01': { path: 'polyhaven/models/wooden_lantern_01.gltf', format: 'gltf' },
  'wooden_stool_01': { path: 'polyhaven/models/wooden_stool_01.gltf', format: 'gltf' },
  'wooden_table_02': { path: 'polyhaven/models/wooden_table_02.gltf', format: 'gltf' },
  'WoodenTable_01': { path: 'polyhaven/models/WoodenTable_01.gltf', format: 'gltf' },
  'brass_blowtorch': { path: 'polyhaven/models/brass_blowtorch.gltf', format: 'gltf' },
  'vintage_wooden_drawer_01': { path: 'polyhaven/models/vintage_wooden_drawer_01.gltf', format: 'gltf' },
  'painted_wooden_cabinet': { path: 'polyhaven/models/painted_wooden_cabinet.gltf', format: 'gltf' },
  'vintage_cabinet_01': { path: 'polyhaven/models/vintage_cabinet_01.gltf', format: 'gltf' },
  // Quest objects
  'chest_glb': { path: 'quest-objects/chest.glb', format: 'glb' },
  'collectible_gem': { path: 'quest-objects/collectible_gem.glb', format: 'glb' },
  'water_bottle': { path: 'quest-objects/water_bottle.glb', format: 'glb' },
  'quest_marker': { path: 'quest-objects/quest_marker.glb', format: 'glb' },
  'avocado_collectible': { path: 'quest-objects/avocado_collectible.glb', format: 'glb' },
  'brass_lamp': { path: 'quest-objects/brass_lamp.gltf', format: 'gltf' },
  'lantern_marker': { path: 'quest-objects/lantern_marker.gltf', format: 'gltf' },
};

// ---------------------------------------------------------------------------
// objectRole → existing asset ID mapping (from asset-collection-templates)
// ---------------------------------------------------------------------------

export const OBJECT_ROLE_TO_ASSET: Record<string, string> = {
  // ─── Weapons ────────────────────────────────────────────────────────────
  sword: 'antique_estoc',
  dagger: 'antique_katana_01',
  saber: 'wooden_handle_saber',
  axe: 'wooden_axe',
  hammer: 'wooden_axe',
  mace: 'wooden_axe',
  spear: 'antique_estoc',
  staff: 'wooden_axe',
  bow: 'wooden_axe', // placeholder
  pickaxe: 'wooden_axe',
  blade: 'antique_estoc',
  pistol: 'street_lamp_01', // placeholder — no pistol model yet
  revolver: 'street_lamp_01', // placeholder
  rifle: 'street_lamp_01', // placeholder
  baton: 'wooden_axe',
  grenade: 'brass_goblets', // placeholder
  wire_coil: 'wooden_bucket_01', // placeholder
  dynamite: 'wooden_crate_02', // placeholder

  // ─── Armor & Equipment ──────────────────────────────────────────────────
  shield: 'wooden_crate_01', // placeholder
  helmet: 'metal_tool_chest', // placeholder
  armor_piece: 'metal_tool_chest', // placeholder — body armor, vests, gauntlets displayed as prop
  chainmail: 'metal_tool_chest', // placeholder
  boots: 'wooden_stool_01', // placeholder
  quiver: 'wooden_bucket_02',
  saddle: 'wooden_stool_01', // placeholder

  // ─── Furniture ──────────────────────────────────────────────────────────
  bed: 'GothicBed_01',
  cabinet: 'GothicCabinet_01',
  commode: 'GothicCabinet_01',
  chair: 'GreenChair_01',
  table: 'WoodenTable_01',
  shelf: 'Shelf_01',
  bookshelf: 'wooden_bookshelf_worn',
  bar_stool: 'bar_chair_round_01',
  register: 'CashRegister_01',
  clock: 'vintage_grandfather_clock_01',
  drawer: 'vintage_wooden_drawer_01',
  fire_pit: 'stone_fire_pit',
  barrel_fire: 'barrel_stove',

  // ─── Containers ─────────────────────────────────────────────────────────
  barrel: 'wine_barrel_01',
  crate: 'wooden_crate_01',
  chest: 'treasure_chest',
  bucket: 'wooden_bucket_01',
  sack: 'wooden_bucket_01',
  vase: 'wooden_bucket_02',

  // ─── Lighting ───────────────────────────────────────────────────────────
  lantern: 'Lantern_01',
  lamp: 'street_lamp_01',
  chandelier: 'Chandelier_01',
  torch: 'Lantern_01',
  oil_lamp: 'vintage_oil_lamp',
  candle: 'wooden_candlestick',

  // ─── Food & Drink ──────────────────────────────────────────────────────
  food_loaf: 'wooden_bucket_01',
  food_plate: 'brass_goblets',
  food_bowl: 'brass_goblets',
  food_wedge: 'wooden_bucket_01',
  food_small: 'wooden_bucket_01',
  food_bar: 'wooden_crate_02',
  bottle: 'brass_goblets',
  jar: 'wooden_bucket_02',
  goblet: 'brass_goblets',
  drink_can: 'brass_goblets',
  can: 'wooden_crate_02',
  potion: 'water_bottle',
  herb: 'avocado_collectible',

  // ─── Natural Resources ─────────────────────────────────────────────────
  wood: 'wooden_crate_01', // placeholder — log/wood bundle
  stone: 'wooden_crate_02', // placeholder — stone chunk
  rock: 'wooden_crate_02', // placeholder — rock chunk
  knife: 'antique_katana_01', // placeholder — small blade

  // ─── Materials & Crafting ──────────────────────────────────────────────
  ore_chunk: 'boulder_01',
  ingot: 'wooden_bucket_01',
  plank: 'wooden_stool_01',
  spool: 'wooden_bucket_01',
  rope: 'wooden_bucket_01',
  inkwell: 'brass_goblets',
  small_block: 'wooden_bucket_01',

  // ─── Tools ──────────────────────────────────────────────────────────────
  mortar: 'wooden_bucket_02',
  saw: 'wooden_axe',
  shovel: 'wooden_axe',
  rod: 'wooden_axe',
  toolbox: 'metal_tool_chest',
  tank: 'Barrel_01',
  battery: 'utility_box_01',

  // ─── Books & Documents ─────────────────────────────────────────────────
  book: 'book_encyclopedia_set_01',
  books: 'book_encyclopedia_set_01',
  scroll: 'book_encyclopedia_set_01',
  wanted_poster: 'book_encyclopedia_set_01', // placeholder
  card: 'book_encyclopedia_set_01',

  // ─── Jewelry & Collectibles ────────────────────────────────────────────
  ring: 'collectible_gem',
  amulet: 'collectible_gem',
  gemstone: 'collectible_gem',
  crown: 'brass_goblets', // placeholder
  bell: 'brass_candleholders',
  candleholder: 'brass_candleholders',
  key: 'brass_candleholders',
  small_prop: 'brass_candleholders',
  small_box: 'wooden_crate_02',
  small_tool: 'brass_candleholders',
  pouch: 'wooden_bucket_01',
  plant: 'potted_plant_02',
  tableware: 'brass_goblets',

  // ─── Electronics & Tech ────────────────────────────────────────────────
  boombox: 'boombox',
  console: 'ClassicConsole_01',
  data_pad: 'ClassicConsole_01',
  energy_core: 'Barrel_01',
  syringe: 'brass_candleholders',
  med_pack: 'metal_tool_chest',

  // ─── Misc Polyhaven ─────────────────────────────────────────────────────
  pot: 'wooden_bucket_01',
  pan: 'wooden_bucket_01',
  tea_set: 'tea_set_01',
  blowtorch: 'brass_blowtorch',
};

// ---------------------------------------------------------------------------
// 3D Asset Recommendations for items WITHOUT objectRole
// Sourced from free/CC0 asset libraries
// ---------------------------------------------------------------------------

export const ASSET_RECOMMENDATIONS: Record<string, AssetRecommendation> = {
  // Food items — recommend generic food/container models
  'Bread': { assetId: 'food_bread_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Quaternius food pack — bread loaf' },
  'Meat Pie': { assetId: 'food_pie_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Quaternius food pack — pie' },
  'Cheese': { assetId: 'food_cheese_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Quaternius food pack — cheese wedge' },
  'Egg': { assetId: 'food_egg_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Quaternius food pack — egg' },
  'Honey': { assetId: 'food_jar_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Generic jar model' },
  'Berries': { assetId: 'food_berries_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Quaternius food pack — fruit bowl' },
  'Stew': { assetId: 'food_bowl_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Bowl model' },
  'Roasted Chicken': { assetId: 'food_chicken_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Quaternius food pack — cooked chicken' },
  'Coconut': { assetId: 'food_coconut_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Tropical fruit' },
  'Banana': { assetId: 'food_banana_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Tropical fruit' },
  'Flatbread': { assetId: 'food_bread_flat_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Flat bread model' },
  'Olive Oil': { assetId: 'food_bottle_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Oil bottle' },
  'Scone': { assetId: 'food_pastry_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Pastry model' },
  'Beef Jerky': { assetId: 'food_meat_dried_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Dried meat strip' },
  'Canned Beans': { assetId: 'food_can_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Canned food' },
  'Canned Food': { assetId: 'food_can_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Canned food' },
  'Synth-Food Bar': { assetId: 'food_bar_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Food bar' },
  'E-Ration': { assetId: 'food_ration_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Ration pack' },
  'Emergency Ration': { assetId: 'food_can_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Canned ration' },
  'Nutrient Paste': { assetId: 'food_tube_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Tube/paste container' },
  'Protein Bar': { assetId: 'food_bar_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Food bar' },
  'Sandwich': { assetId: 'food_sandwich_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Sandwich' },
  'Pizza Slice': { assetId: 'food_pizza_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Pizza slice' },

  // Drinks
  'Water Flask': { assetId: 'water_bottle', source: 'custom', format: 'glb', license: 'CC0', notes: 'Existing quest-objects/water_bottle.glb' },
  'Water Bottle': { assetId: 'water_bottle', source: 'custom', format: 'glb', license: 'CC0', notes: 'Existing quest-objects/water_bottle.glb' },
  'Milk': { assetId: 'drink_bottle_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Bottle model' },
  'Whiskey': { assetId: 'drink_bottle_02', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Liquor bottle' },
  'Moonshine': { assetId: 'drink_jug_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Jug model' },
  'Rum': { assetId: 'drink_bottle_03', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Dark rum bottle' },
  'Wine Jug': { assetId: 'drink_jug_02', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Clay wine jug' },
  'Neon Drink': { assetId: 'drink_can_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Drink can' },
  'Tea': { assetId: 'drink_cup_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Tea cup' },
  'Purified Water': { assetId: 'water_bottle', source: 'custom', format: 'glb', license: 'CC0', notes: 'Water bottle' },
  'Energy Drink': { assetId: 'drink_can_02', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Energy drink can' },
  'Coffee': { assetId: 'drink_cup_02', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Coffee cup' },

  // Migration 016 universal items
  'Fiber': { assetId: 'material_fiber_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Plant fiber bundle' },
  'Leather': { assetId: 'material_leather_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Leather hide' },
  'Cloth': { assetId: 'material_cloth_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Cloth bolt' },
  'Clay': { assetId: 'material_clay_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Clay lump' },
  'Glass': { assetId: 'material_glass_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Glass sheet' },
  'Iron Ingot': { assetId: 'material_ingot_iron_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Iron ingot bar' },
  'Steel Ingot': { assetId: 'material_ingot_steel_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Steel ingot bar' },
  'Silver Ingot': { assetId: 'material_ingot_silver_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Silver ingot bar' },
  'Gold Ingot': { assetId: 'material_ingot_gold_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Gold ingot bar' },
  'Copper Ore': { assetId: 'material_ore_copper_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Copper ore chunk' },
  'Coal': { assetId: 'material_coal_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Coal lump' },
  'Shovel': { assetId: 'tool_shovel_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Metal shovel' },
  'Fishing Rod': { assetId: 'tool_fishing_rod_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Fishing pole' },
  'Sack': { assetId: 'prop_sack_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Cloth sack' },
  'Candle': { assetId: 'wooden_candlestick', source: 'polyhaven', format: 'gltf', license: 'CC0', notes: 'Reuse existing candle model' },
  'Map': { assetId: 'prop_map_03', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Folded map' },
  'Letter': { assetId: 'prop_letter_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Sealed letter' },
  'Coin Purse': { assetId: 'prop_purse_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Leather coin purse' },
  'Apple': { assetId: 'food_apple_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Red apple' },
  'Raw Meat': { assetId: 'food_meat_raw_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Raw meat cut' },
  'Fish': { assetId: 'food_fish_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Fresh fish' },
  'Mushroom': { assetId: 'food_mushroom_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Wild mushroom' },
  'Salt': { assetId: 'material_salt_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Salt pouch' },
  'Stick': { assetId: 'material_stick_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Wooden stick' },
  'Bone': { assetId: 'material_bone_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Animal bone' },
  'Feather': { assetId: 'material_feather_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Bird feather' },
  'Shell': { assetId: 'prop_shell_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Sea shell' },
  'Crossbow': { assetId: 'weapon_crossbow_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Crossbow model' },
  'War Hammer': { assetId: 'weapon_hammer_war_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'War hammer' },
  'Spear': { assetId: 'weapon_spear_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Iron-tipped spear' },
  'Staff': { assetId: 'weapon_staff_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Wooden staff' },
  'Leather Armor': { assetId: 'armor_leather_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'Plate Armor': { assetId: 'armor_plate_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'Helmet': { assetId: 'armor_helmet_iron_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'Arrow': { assetId: 'material_arrow_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Arrow bundle' },
  'Ale': { assetId: 'drink_mug_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Ale mug' },
  'Wine': { assetId: 'drink_wine_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Wine bottle' },
  'Scroll': { assetId: 'prop_scroll_02', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Rolled scroll' },

  // Weapons (no existing 3D model)
  'Battle Axe': { assetId: 'weapon_axe_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Quaternius weapon pack — battle axe' },
  'Mace': { assetId: 'weapon_mace_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Quaternius weapon pack — mace' },
  'Halberd': { assetId: 'weapon_halberd_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Quaternius weapon pack — halberd/polearm' },
  'EMP Grenade': { assetId: 'weapon_grenade_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Grenade model' },
  'Shock Baton': { assetId: 'weapon_baton_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Baton/club model' },
  'Plasma Rifle': { assetId: 'weapon_rifle_scifi_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Sci-fi rifle' },
  'Nano-Wire': { assetId: 'weapon_wire_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Thin wire coil model' },
  'Laser Rifle': { assetId: 'weapon_rifle_laser_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Laser rifle' },
  'Stun Baton': { assetId: 'weapon_baton_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Baton model' },
  'Photon Blade': { assetId: 'weapon_sword_energy_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Energy sword' },
  'Dynamite': { assetId: 'weapon_dynamite_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Dynamite stick' },
  'Rifle': { assetId: 'weapon_rifle_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Lever-action rifle' },
  'Shotgun': { assetId: 'weapon_shotgun_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Double-barrel shotgun' },
  'Bowie Knife': { assetId: 'weapon_knife_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Large knife' },
  'Pipe Wrench': { assetId: 'tool_wrench_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Wrench model' },
  'Makeshift Rifle': { assetId: 'weapon_rifle_makeshift_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Rusty/improvised rifle' },
  'Spiked Bat': { assetId: 'weapon_bat_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Bat/club model' },
  'Flintlock Pistol': { assetId: 'weapon_pistol_old_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Old-style pistol' },
  'Boarding Axe': { assetId: 'wooden_axe', source: 'polyhaven', format: 'gltf', license: 'CC0', notes: 'Reuse existing wooden_axe model' },
  'Bronze Sword': { assetId: 'antique_estoc', source: 'polyhaven', format: 'gltf', license: 'CC0', notes: 'Reuse existing sword model' },
  'Javelin': { assetId: 'weapon_spear_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Spear/javelin model' },
  'Gladius': { assetId: 'antique_estoc', source: 'polyhaven', format: 'gltf', license: 'CC0', notes: 'Reuse existing sword model' },
  'Steam Pistol': { assetId: 'weapon_pistol_steam_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Steampunk pistol' },
  'Clockwork Sword': { assetId: 'antique_estoc', source: 'polyhaven', format: 'gltf', license: 'CC0', notes: 'Reuse existing sword model' },

  // Armor (typically not rendered as world props, but as character attachments)
  'Cloak': { assetId: 'armor_cloak_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment — low priority for world prop' },
  'Gauntlets': { assetId: 'armor_gauntlets_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'Holo-Shield': { assetId: 'armor_shield_energy_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Energy shield effect' },
  'Synth-Armor Vest': { assetId: 'armor_vest_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'Combat Helmet': { assetId: 'armor_helmet_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'EVA Suit': { assetId: 'armor_suit_space_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Space suit character model' },
  'Shield Generator': { assetId: 'prop_generator_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Small device prop' },
  'Leather Duster': { assetId: 'armor_coat_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'Cowboy Hat': { assetId: 'armor_hat_cowboy_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'Scrap Armor': { assetId: 'armor_scrap_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'Gas Mask': { assetId: 'armor_mask_gas_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'Pirate Hat': { assetId: 'armor_hat_pirate_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'Round Shield': { assetId: 'armor_shield_round_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Round shield prop' },
  'Toga': { assetId: 'armor_toga_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'Aether Goggles': { assetId: 'armor_goggles_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },
  'Reinforced Corset': { assetId: 'armor_corset_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Character attachment' },

  // Consumables / Medical
  'Antidote': { assetId: 'potion_vial_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Small vial model' },
  'Holy Water': { assetId: 'potion_vial_02', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Glowing vial' },
  'Neural Stim': { assetId: 'medical_syringe_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Syringe/injector' },
  'Med-Hypo': { assetId: 'medical_hypo_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Auto-injector' },
  'Reflex Booster': { assetId: 'medical_implant_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Small implant device' },
  'Stim Pack': { assetId: 'medical_pack_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Medical pack' },
  'Bandage': { assetId: 'medical_bandage_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Bandage roll' },
  'Bio-Gel Pack': { assetId: 'medical_gel_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Gel container' },
  'Stim Injector': { assetId: 'medical_syringe_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Syringe/injector' },
  'Rad-Away': { assetId: 'medical_iv_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'IV bag model' },
  'Medi-Gel': { assetId: 'medical_gel_02', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Gel tube' },
  'Tobacco Pouch': { assetId: 'prop_pouch_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Leather pouch' },
  'First Aid Kit': { assetId: 'medical_kit_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'First aid kit box' },

  // Tools
  'Rope': { assetId: 'tool_rope_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Rope coil model' },
  'Rope Coil': { assetId: 'tool_rope_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Rope coil model' },
  'Needle': { assetId: 'tool_needle_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Sewing needle' },
  'Saw': { assetId: 'tool_saw_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Hand saw' },
  'Mortar and Pestle': { assetId: 'tool_mortar_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Mortar and pestle set' },
  'Quiver': { assetId: 'equipment_quiver_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Arrow quiver' },
  'Repair Kit': { assetId: 'tool_kit_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Repair tool box' },
  'Lasso': { assetId: 'tool_lasso_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Coiled rope lasso' },
  'Saddle': { assetId: 'equipment_saddle_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Horse saddle' },
  'Scanner': { assetId: 'tool_scanner_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Handheld scanner device' },
  'Multi-Tool': { assetId: 'tool_multi_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Multi-tool' },
  'Neural Interface': { assetId: 'tech_implant_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Cortical implant prop' },
  'Cyber-Deck': { assetId: 'tech_deck_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Portable hacking device' },
  'Geiger Counter': { assetId: 'tool_geiger_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Radiation detector' },
  'Spyglass': { assetId: 'tool_telescope_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Brass telescope' },
  'Compass': { assetId: 'tool_compass_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Brass compass' },
  'Fishing Net': { assetId: 'tool_net_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Fishing net' },
  'Smartphone': { assetId: 'tech_phone_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Smartphone model' },
  'Backpack': { assetId: 'equipment_backpack_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Canvas backpack' },
  'Umbrella': { assetId: 'prop_umbrella_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Umbrella' },
  'Flashlight': { assetId: 'tool_flashlight_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'LED flashlight' },

  // Materials
  'Iron Ore': { assetId: 'material_ore_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Ore chunk model' },
  'Flour': { assetId: 'material_sack_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Flour sack' },
  'Sugar': { assetId: 'material_jar_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Sugar jar' },
  'Oil': { assetId: 'material_bottle_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Oil bottle' },
  'Nails': { assetId: 'material_nails_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Pouch of nails' },
  'Wax': { assetId: 'material_block_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Wax block' },
  'Thread': { assetId: 'material_spool_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Thread spool' },
  'Ink': { assetId: 'material_inkwell_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Ink bottle' },
  'Parchment': { assetId: 'material_scroll_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Rolled parchment' },
  'Dragon Scale': { assetId: 'material_scale_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Shimmering scale prop' },
  'Energy Cell': { assetId: 'material_cell_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Battery/energy cell' },
  'Scrap Metal': { assetId: 'material_scrap_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Scrap pile' },
  'Circuit Board': { assetId: 'material_circuit_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Circuit board' },
  'Titanium Alloy': { assetId: 'material_alloy_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Metal ingot' },
  'Quantum Chip': { assetId: 'material_chip_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Microchip model' },
  'Bullets': { assetId: 'material_ammo_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Ammo box' },
  'Gold Nugget': { assetId: 'material_nugget_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Gold nugget' },
  'Duct Tape': { assetId: 'material_tape_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Tape roll' },
  'Fuel Can': { assetId: 'Barrel_01', source: 'polyhaven', format: 'gltf', license: 'CC0', notes: 'Reuse existing barrel model' },
  'Gear Set': { assetId: 'material_gears_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Assorted gears' },
  'Steam Core': { assetId: 'material_core_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Pressurized canister' },
  'Battery': { assetId: 'material_battery_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Battery pack' },

  // Collectibles
  'Credstick': { assetId: 'prop_card_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Card/stick model' },
  'Enchanted Ring': { assetId: 'collectible_gem', source: 'custom', format: 'glb', license: 'CC0', notes: 'Reuse existing gem model' },
  'Crystal Ball': { assetId: 'collectible_gem', source: 'custom', format: 'glb', license: 'CC0', notes: 'Reuse existing gem with scaling' },
  'Flower': { assetId: 'nature_flower_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Flower model' },
  'Pendant': { assetId: 'collectible_gem', source: 'custom', format: 'glb', license: 'CC0', notes: 'Gem model variant' },
  'Mirror': { assetId: 'prop_mirror_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Hand mirror' },
  'Dice': { assetId: 'prop_dice_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Pair of dice' },
  'Bell': { assetId: 'prop_bell_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Small bell' },
  'Pocket Watch': { assetId: 'prop_watch_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Pocket watch' },
  'Harmonica': { assetId: 'prop_harmonica_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Harmonica' },
  'Pocket Chronometer': { assetId: 'prop_watch_02', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Brass timepiece' },
  'Monocle': { assetId: 'prop_monocle_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Monocle prop' },
  'Laurel Wreath': { assetId: 'prop_wreath_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Laurel wreath crown' },
  'Papyrus Scroll': { assetId: 'prop_scroll_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Papyrus scroll' },
  'Ancient Coin': { assetId: 'prop_coin_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Ancient coin' },
  'Gold Doubloon': { assetId: 'prop_coin_02', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Gold coin' },
  'Pearl': { assetId: 'collectible_gem', source: 'custom', format: 'glb', license: 'CC0', notes: 'Reuse gem with white material' },
  'Notebook': { assetId: 'prop_book_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Book/notebook' },
  'Wallet': { assetId: 'prop_wallet_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Leather wallet' },
  'Sunglasses': { assetId: 'prop_glasses_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Sunglasses' },
  'Headphones': { assetId: 'prop_headphones_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Over-ear headphones' },

  // Keys / Quest items
  'Star Map Fragment': { assetId: 'prop_map_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Map fragment' },
  'Hacking Spike': { assetId: 'tech_spike_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'USB-like device' },
  'ID Chip': { assetId: 'tech_chip_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'ID card/chip' },
  'Data Crystal': { assetId: 'collectible_gem', source: 'custom', format: 'glb', license: 'CC0', notes: 'Crystal prop' },
  'Access Keycard': { assetId: 'tech_keycard_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Keycard' },
  'Clockwork Key': { assetId: 'prop_key_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Ornate key' },
  'Treasure Map': { assetId: 'prop_map_02', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Rolled map with X' },
  'USB Drive': { assetId: 'tech_usb_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'USB flash drive' },
  'Oxygen Tank': { assetId: 'prop_tank_01', source: 'quaternius', format: 'glb', license: 'CC0', notes: 'Portable oxygen tank' },
};

// ---------------------------------------------------------------------------
// Audit Functions
// ---------------------------------------------------------------------------

/**
 * Build the full item-to-asset mapping for every base item
 */
export function buildItemAssetMappings(): ItemAssetMapping[] {
  return BASE_ITEM_CATALOG.map((item) => {
    const hasObjectRole = item.objectRole !== null;
    const existingAssetId = hasObjectRole ? OBJECT_ROLE_TO_ASSET[item.objectRole!] : undefined;
    const hasExisting3DAsset = existingAssetId !== undefined && existingAssetId in EXISTING_ASSETS;
    const recommendation = ASSET_RECOMMENDATIONS[item.name];

    return {
      item,
      hasObjectRole,
      hasExisting3DAsset,
      existingAssetId: hasExisting3DAsset ? existingAssetId : undefined,
      recommendation,
    };
  });
}

/**
 * Generate summary statistics from the audit
 */
export function generateAuditSummary(mappings?: ItemAssetMapping[]): AuditSummary {
  const items = mappings ?? buildItemAssetMappings();

  const byWorldType: Record<string, { total: number; mapped: number; unmapped: number }> = {};
  const byItemType: Record<string, { total: number; mapped: number; unmapped: number }> = {};

  let withObjectRole = 0;
  let withExisting3DAsset = 0;
  let withRecommendation = 0;
  let unresolved = 0;

  for (const m of items) {
    const wt = m.item.worldType ?? 'universal';
    const it = m.item.itemType;

    if (!byWorldType[wt]) byWorldType[wt] = { total: 0, mapped: 0, unmapped: 0 };
    if (!byItemType[it]) byItemType[it] = { total: 0, mapped: 0, unmapped: 0 };

    byWorldType[wt].total++;
    byItemType[it].total++;

    if (m.hasObjectRole) {
      withObjectRole++;
    }

    const hasSomeAsset = m.hasExisting3DAsset || m.recommendation !== undefined;
    if (m.hasExisting3DAsset) {
      withExisting3DAsset++;
      byWorldType[wt].mapped++;
      byItemType[it].mapped++;
    } else if (m.recommendation) {
      withRecommendation++;
      byWorldType[wt].mapped++;
      byItemType[it].mapped++;
    } else {
      unresolved++;
      byWorldType[wt].unmapped++;
      byItemType[it].unmapped++;
    }
  }

  return {
    totalItems: items.length,
    withObjectRole,
    withoutObjectRole: items.length - withObjectRole,
    withExisting3DAsset,
    withRecommendation,
    unresolved,
    byWorldType,
    byItemType,
  };
}

/**
 * Get items that still need 3D asset sourcing
 */
export function getUnresolvedItems(mappings?: ItemAssetMapping[]): ItemAssetMapping[] {
  const items = mappings ?? buildItemAssetMappings();
  return items.filter((m) => !m.hasExisting3DAsset && !m.recommendation);
}

/**
 * Get items grouped by world type
 */
export function getItemsByWorldType(mappings?: ItemAssetMapping[]): Record<string, ItemAssetMapping[]> {
  const items = mappings ?? buildItemAssetMappings();
  const grouped: Record<string, ItemAssetMapping[]> = {};
  for (const m of items) {
    const wt = m.item.worldType ?? 'universal';
    if (!grouped[wt]) grouped[wt] = [];
    grouped[wt].push(m);
  }
  return grouped;
}
