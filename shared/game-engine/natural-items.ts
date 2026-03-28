/**
 * Natural Items Registry
 *
 * Defines items produced by interacting with natural world elements:
 * trees, rocks, herbs, and other harvestable resources.
 *
 * Used by ProceduralNatureGenerator to tag meshes with item metadata,
 * and by PlayerActionSystem to determine rewards.
 */

export interface NaturalItemDef {
  /** Item name produced when harvested. */
  itemName: string;
  /** Display name. */
  displayName: string;
  /** Item type for inventory. */
  itemType: 'material' | 'food' | 'consumable' | 'tool';
  /** Base value in gold. */
  baseValue: number;
  /** Rarity tier. */
  rarity: 'common' | 'uncommon' | 'rare';
  /** Which action harvests this item. */
  harvestAction: string;
  /** Category for organization. */
  category: 'wood' | 'stone' | 'herb' | 'mineral' | 'food';
}

// ── Tree Items ──────────────────────────────────────────────────────────────

export const TREE_ITEMS: NaturalItemDef[] = [
  { itemName: 'oak_wood', displayName: 'Oak Wood', itemType: 'material', baseValue: 3, rarity: 'common', harvestAction: 'chopping', category: 'wood' },
  { itemName: 'pine_wood', displayName: 'Pine Wood', itemType: 'material', baseValue: 2, rarity: 'common', harvestAction: 'chopping', category: 'wood' },
  { itemName: 'birch_wood', displayName: 'Birch Wood', itemType: 'material', baseValue: 3, rarity: 'common', harvestAction: 'chopping', category: 'wood' },
  { itemName: 'willow_branch', displayName: 'Willow Branch', itemType: 'material', baseValue: 4, rarity: 'uncommon', harvestAction: 'chopping', category: 'wood' },
  { itemName: 'palm_frond', displayName: 'Palm Frond', itemType: 'material', baseValue: 2, rarity: 'common', harvestAction: 'chopping', category: 'wood' },
  { itemName: 'maple_wood', displayName: 'Maple Wood', itemType: 'material', baseValue: 4, rarity: 'uncommon', harvestAction: 'chopping', category: 'wood' },
  { itemName: 'cypress_wood', displayName: 'Cypress Wood', itemType: 'material', baseValue: 5, rarity: 'uncommon', harvestAction: 'chopping', category: 'wood' },
];

// ── Stone/Mineral Items ─────────────────────────────────────────────────────

export const STONE_ITEMS: NaturalItemDef[] = [
  { itemName: 'granite', displayName: 'Granite', itemType: 'material', baseValue: 2, rarity: 'common', harvestAction: 'mining', category: 'stone' },
  { itemName: 'limestone', displayName: 'Limestone', itemType: 'material', baseValue: 2, rarity: 'common', harvestAction: 'mining', category: 'stone' },
  { itemName: 'sandstone', displayName: 'Sandstone', itemType: 'material', baseValue: 2, rarity: 'common', harvestAction: 'mining', category: 'stone' },
  { itemName: 'quartz', displayName: 'Quartz', itemType: 'material', baseValue: 8, rarity: 'uncommon', harvestAction: 'mining', category: 'mineral' },
  { itemName: 'flint', displayName: 'Flint', itemType: 'material', baseValue: 3, rarity: 'common', harvestAction: 'mining', category: 'stone' },
];

// ── Herb/Vegetation Items ───────────────────────────────────────────────────

export const HERB_ITEMS: NaturalItemDef[] = [
  { itemName: 'lavender', displayName: 'Lavender', itemType: 'consumable', baseValue: 4, rarity: 'common', harvestAction: 'herbalism', category: 'herb' },
  { itemName: 'rosemary', displayName: 'Rosemary', itemType: 'consumable', baseValue: 3, rarity: 'common', harvestAction: 'herbalism', category: 'herb' },
  { itemName: 'thyme', displayName: 'Thyme', itemType: 'consumable', baseValue: 3, rarity: 'common', harvestAction: 'herbalism', category: 'herb' },
  { itemName: 'sage', displayName: 'Sage', itemType: 'consumable', baseValue: 4, rarity: 'common', harvestAction: 'herbalism', category: 'herb' },
  { itemName: 'chamomile', displayName: 'Chamomile', itemType: 'consumable', baseValue: 5, rarity: 'uncommon', harvestAction: 'herbalism', category: 'herb' },
  { itemName: 'wild_mushroom', displayName: 'Wild Mushroom', itemType: 'food', baseValue: 3, rarity: 'common', harvestAction: 'herbalism', category: 'food' },
  { itemName: 'dandelion', displayName: 'Dandelion', itemType: 'consumable', baseValue: 1, rarity: 'common', harvestAction: 'herbalism', category: 'herb' },
  { itemName: 'clover', displayName: 'Clover', itemType: 'consumable', baseValue: 1, rarity: 'common', harvestAction: 'herbalism', category: 'herb' },
];

// ── All Natural Items ───────────────────────────────────────────────────────

export const ALL_NATURAL_ITEMS: NaturalItemDef[] = [
  ...TREE_ITEMS,
  ...STONE_ITEMS,
  ...HERB_ITEMS,
];

// ── Mesh Name → Item Type Mapping ───────────────────────────────────────────

/** Maps mesh name keywords to the natural item type they should produce. */
export const MESH_TO_NATURAL_ITEM: Record<string, NaturalItemDef> = {};

// Trees
for (const item of TREE_ITEMS) {
  const key = item.itemName.replace('_wood', '').replace('_branch', '').replace('_frond', '');
  MESH_TO_NATURAL_ITEM[key] = item;
}

// Default tree mapping for generic "tree" meshes
MESH_TO_NATURAL_ITEM['tree'] = TREE_ITEMS[0]; // oak_wood
MESH_TO_NATURAL_ITEM['dead_tree'] = TREE_ITEMS[0]; // oak_wood

// Rocks
MESH_TO_NATURAL_ITEM['rock'] = STONE_ITEMS[0]; // granite
MESH_TO_NATURAL_ITEM['stone'] = STONE_ITEMS[0];
MESH_TO_NATURAL_ITEM['boulder'] = STONE_ITEMS[1]; // limestone
MESH_TO_NATURAL_ITEM['crystal'] = STONE_ITEMS[3]; // quartz

// Herbs (flowers/plants)
MESH_TO_NATURAL_ITEM['flower'] = HERB_ITEMS[0]; // lavender
MESH_TO_NATURAL_ITEM['herb'] = HERB_ITEMS[1]; // rosemary
MESH_TO_NATURAL_ITEM['mushroom'] = HERB_ITEMS[5]; // wild_mushroom
MESH_TO_NATURAL_ITEM['bush'] = HERB_ITEMS[7]; // clover
MESH_TO_NATURAL_ITEM['shrub'] = HERB_ITEMS[6]; // dandelion

/**
 * Resolve the natural item for a given mesh name.
 * Checks if the mesh name contains any known natural item keyword.
 */
export function resolveNaturalItem(meshName: string): NaturalItemDef | null {
  const lower = meshName.toLowerCase();
  for (const [keyword, item] of Object.entries(MESH_TO_NATURAL_ITEM)) {
    if (lower.includes(keyword)) {
      return item;
    }
  }
  return null;
}
