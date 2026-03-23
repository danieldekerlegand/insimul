/**
 * Asset-to-Item Mapper
 *
 * Converts visual assets into base item definitions.
 * This is the core of the "asset-first" item generation strategy:
 * instead of defining items abstractly and mapping them to assets,
 * we derive items directly from the assets we have.
 */

export interface BaseItemDefinition {
  name: string;
  description: string;
  itemType: string;
  icon: string;
  value: number;
  sellValue: number;
  weight: number;
  tradeable: boolean;
  stackable: boolean;
  maxStack: number;
  worldType: null; // all asset-derived items are universal
  objectRole: string;
  visualAssetId: string;
  category: string;
  material: string | null;
  baseType: string;
  rarity: string;
  effects: Record<string, number> | null;
  lootWeight: number;
  tags: string[];
  isBase: true;
  possessable: boolean;
}

interface VisualAssetInput {
  _id: any;
  name: string;
  tags: string[];
  filePath: string;
  assetType: string;
}

// --- Category detection rules (ordered by priority) ---

interface CategoryRule {
  category: string;
  itemType: string;
  tags: string[];        // any of these tags triggers this rule
  namePatterns?: RegExp[]; // fallback: match on asset name
  excludeTags?: string[]; // don't match if these tags present
}

const CATEGORY_RULES: CategoryRule[] = [
  // Weapons (check specific types before generic)
  { category: 'ranged_weapon', itemType: 'weapon', tags: ['gun', 'pistol', 'rifle', 'revolver', 'shotgun', 'firearm', 'bow', 'crossbow'] },
  { category: 'melee_weapon', itemType: 'weapon', tags: ['sword', 'dagger', 'mace', 'axe', 'spear', 'halberd', 'staff', 'club', 'katana', 'saber', 'blade', 'knife'], excludeTags: ['tool', 'cooking'] },
  { category: 'melee_weapon', itemType: 'weapon', tags: ['weapon', 'quest_weapon'] },
  { category: 'ammunition', itemType: 'ammunition', tags: ['ammunition', 'arrow', 'quiver'] },

  // Armor & shields
  { category: 'shield', itemType: 'armor', tags: ['shield'] },
  { category: 'armor', itemType: 'armor', tags: ['armor', 'helmet', 'chainmail', 'boots', 'gloves'] },

  // Food & drink
  { category: 'food', itemType: 'consumable', tags: ['food', 'bread', 'fruit', 'meat', 'loaf', 'plate', 'apple', 'cake', 'wedge', 'bowl'] },
  { category: 'drink', itemType: 'consumable', tags: ['drink', 'goblet', 'mug', 'wine', 'tableware'], excludeTags: ['container'] },
  { category: 'potion', itemType: 'consumable', tags: ['potion', 'vial'] },
  { category: 'medical', itemType: 'consumable', tags: ['medpack', 'syringe', 'consumable'] },

  // Tools
  { category: 'tool', itemType: 'tool', tags: ['tool', 'tools', 'pickaxe', 'shovel', 'saw', 'hammer', 'blowtorch', 'screwdriver', 'wrench', 'mortar', 'pan', 'cooking', 'pot'], excludeTags: ['weapon'] },

  // Furniture (non-possessable)
  { category: 'furniture', itemType: 'furniture', tags: ['furniture', 'furniture_bed', 'furniture_chair', 'furniture_table', 'furniture_cabinet', 'furniture_shelf', 'furniture_stool', 'chair', 'table', 'bed', 'shelf', 'cabinet', 'commode', 'drawer', 'couch', 'ottoman', 'bench', 'desk', 'seating'] },

  // Containers
  { category: 'container', itemType: 'container', tags: ['container', 'containers', 'chest', 'crate', 'barrel', 'bucket', 'basket', 'box', 'storage', 'storage_alt', 'quest_chest', 'barrel_fire', 'sack', 'bag', 'toolbox', 'backpack'] },

  // Light sources
  { category: 'light_source', itemType: 'tool', tags: ['lamp', 'lamp_table', 'lantern', 'candle', 'candleholder', 'torch', 'chandelier'] },

  // Jewelry & valuables
  { category: 'jewelry', itemType: 'accessory', tags: ['jewelry', 'ring', 'necklace', 'amulet', 'crown', 'royal', 'pendant'] },
  { category: 'collectible', itemType: 'collectible', tags: ['gemstone', 'crystal', 'gem', 'collectible', 'gold', 'coin'] },

  // Keys
  { category: 'key', itemType: 'key', tags: ['key', 'keycard'] },

  // Documents
  { category: 'document', itemType: 'document', tags: ['book', 'books', 'scroll', 'document', 'paper', 'bookstand'] },

  // Materials
  { category: 'raw_material', itemType: 'material', tags: ['material', 'wire', 'cable', 'wood', 'bark', 'ingot', 'ore'] },

  // Electronics / tech
  { category: 'equipment', itemType: 'equipment', tags: ['electronics', 'boombox', 'datapad', 'computer', 'energy', 'core', 'battery'] },

  // Decorative items that could be collectibles
  { category: 'decoration', itemType: 'decoration', tags: ['decoration', 'vase', 'vases', 'statue', 'painting', 'frame', 'ornament', 'decorative', 'boardgame', 'lighting'] },

  // Catch-all for quest objects
  { category: 'collectible', itemType: 'collectible', tags: ['quest', 'object'] },

  // Misc small props (lighter, clock, etc.)
  { category: 'collectible', itemType: 'collectible', tags: ['lighter', 'clock', 'fire', 'alarm'] },
];

// --- Category defaults ---

interface CategoryDefaults {
  value: number;
  sellValue: number;
  weight: number;
  stackable: boolean;
  maxStack: number;
  possessable: boolean;
  lootWeight: number;
  rarity: string;
  icon: string;
  effects: Record<string, number> | null;
}

const CATEGORY_DEFAULTS: Record<string, CategoryDefaults> = {
  melee_weapon:   { value: 20, sellValue: 10, weight: 3,    stackable: false, maxStack: 1,  possessable: true,  lootWeight: 15, rarity: 'common', icon: '⚔️', effects: null },
  ranged_weapon:  { value: 30, sellValue: 15, weight: 2,    stackable: false, maxStack: 1,  possessable: true,  lootWeight: 10, rarity: 'common', icon: '🏹', effects: null },
  ammunition:     { value: 2,  sellValue: 1,  weight: 0.1,  stackable: true,  maxStack: 50, possessable: true,  lootWeight: 25, rarity: 'common', icon: '➡️', effects: null },
  shield:         { value: 18, sellValue: 9,  weight: 4,    stackable: false, maxStack: 1,  possessable: true,  lootWeight: 10, rarity: 'common', icon: '🛡️', effects: null },
  armor:          { value: 25, sellValue: 12, weight: 5,    stackable: false, maxStack: 1,  possessable: true,  lootWeight: 10, rarity: 'common', icon: '🪖', effects: null },
  food:           { value: 3,  sellValue: 1,  weight: 0.5,  stackable: true,  maxStack: 20, possessable: true,  lootWeight: 30, rarity: 'common', icon: '🍖', effects: { energy: 15 } },
  drink:          { value: 5,  sellValue: 2,  weight: 1,    stackable: true,  maxStack: 10, possessable: true,  lootWeight: 25, rarity: 'common', icon: '🍺', effects: { energy: 10 } },
  potion:         { value: 10, sellValue: 5,  weight: 0.5,  stackable: true,  maxStack: 10, possessable: true,  lootWeight: 15, rarity: 'uncommon', icon: '🧪', effects: { health: 20 } },
  medical:        { value: 15, sellValue: 7,  weight: 0.5,  stackable: true,  maxStack: 10, possessable: true,  lootWeight: 15, rarity: 'common', icon: '💊', effects: { health: 15 } },
  tool:           { value: 12, sellValue: 6,  weight: 2,    stackable: false, maxStack: 1,  possessable: true,  lootWeight: 20, rarity: 'common', icon: '🔧', effects: null },
  furniture:      { value: 15, sellValue: 7,  weight: 10,   stackable: false, maxStack: 1,  possessable: false, lootWeight: 0,  rarity: 'common', icon: '🪑', effects: null },
  container:      { value: 10, sellValue: 5,  weight: 5,    stackable: false, maxStack: 1,  possessable: false, lootWeight: 0,  rarity: 'common', icon: '📦', effects: null },
  light_source:   { value: 8,  sellValue: 4,  weight: 1,    stackable: false, maxStack: 1,  possessable: true,  lootWeight: 15, rarity: 'common', icon: '🔦', effects: null },
  jewelry:        { value: 50, sellValue: 25, weight: 0.2,  stackable: false, maxStack: 1,  possessable: true,  lootWeight: 5,  rarity: 'rare',   icon: '💍', effects: null },
  collectible:    { value: 8,  sellValue: 4,  weight: 0.5,  stackable: true,  maxStack: 20, possessable: true,  lootWeight: 20, rarity: 'uncommon', icon: '💎', effects: null },
  key:            { value: 5,  sellValue: 0,  weight: 0.1,  stackable: false, maxStack: 1,  possessable: true,  lootWeight: 5,  rarity: 'uncommon', icon: '🔑', effects: null },
  document:       { value: 2,  sellValue: 1,  weight: 0.1,  stackable: true,  maxStack: 20, possessable: true,  lootWeight: 10, rarity: 'common', icon: '📜', effects: null },
  raw_material:   { value: 2,  sellValue: 1,  weight: 1,    stackable: true,  maxStack: 50, possessable: true,  lootWeight: 25, rarity: 'common', icon: '🪵', effects: null },
  equipment:      { value: 15, sellValue: 7,  weight: 1,    stackable: false, maxStack: 1,  possessable: true,  lootWeight: 10, rarity: 'common', icon: '⚙️', effects: null },
  decoration:     { value: 8,  sellValue: 4,  weight: 1,    stackable: false, maxStack: 1,  possessable: false, lootWeight: 0,  rarity: 'common', icon: '🏺', effects: null },
};

// --- Skip rules ---

const SKIP_NAME_PATTERNS = [
  /^street_lamp/i,
  /^utility_box/i,
  /^rock_/i,
  /^boulder_/i,
  /^shrub_/i,
  /^fern_/i,
  /^tree_/i,
  /^tree_stump/i,
  /^stone_\d/i, // stone_01, stone_02 (nature rocks, not materials)
  /^bark_debris/i,
  /^celandine/i, // wild plant
  /^quest_marker$/i,
];

const SKIP_TAGS = new Set([
  'building-component',
  'character-component',
  'weapon-component',
  'nature',
  'shrub',
  'bush',
  'rock',
  'rocks',
  'rock_large',
  'stump',
  'landscape',
  'terrain',
  'vehicle',
  'car',
  'train',
  'transport',
  'surveillance',
  'cctv',
  'infrastructure',
  'road',
  'road barrier',
  'traffic barrier',
  'scaffolding',
  'construction',
  'drainage',
  'pipes',
  'plumbing',
  'hvac',
  'aircon',
  'ventilation',
  'gate',
  'fencing',
  'barrier',
  'security shutter',
  'garage door',
  'shutter door',
  'warehouse door',
  'roller garage door',
]);

// Tags that indicate an environmental prop, not an item — but only if no item-category tag is also present
const ENVIRONMENTAL_TAGS = new Set([
  'ground cover',
  'formation',
  'boulder',
  'boulders',
  'geological',
  'regolith',
  'lunar',
  'cliff',
  'shore',
  'coastal',
]);

function shouldSkipAsset(asset: VisualAssetInput): boolean {
  const name = extractBaseName(asset.name);
  const tags = new Set((asset.tags || []).map(t => t.toLowerCase()));

  // Skip by tag
  for (const tag of tags) {
    if (SKIP_TAGS.has(tag)) return true;
  }

  // Skip by name pattern
  for (const pattern of SKIP_NAME_PATTERNS) {
    if (pattern.test(name)) return true;
  }

  // Skip purely environmental assets (but not if they also have an item tag)
  const hasEnvTag = [...tags].some(t => ENVIRONMENTAL_TAGS.has(t));
  if (hasEnvTag) {
    const hasItemTag = CATEGORY_RULES.some(rule => rule.tags.some(t => tags.has(t)));
    if (!hasItemTag) return true;
  }

  return false;
}

// --- Name derivation ---

function extractBaseName(assetName: string): string {
  // Remove parenthetical suffixes like "(weapon)", "(food)", "(scifi)"
  return assetName.replace(/\s*\(.*?\)\s*$/, '').trim();
}

function humanizeName(assetName: string): string {
  let name = extractBaseName(assetName);

  // Convert snake_case and camelCase to spaces
  name = name
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2');

  // Remove trailing numbers like " 01", " 02", " 1"
  name = name.replace(/\s+\d{1,2}$/, '');

  // Title case
  name = name
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return name;
}

// --- Object role derivation ---

// Specific role tags (most specific first)
const ROLE_TAGS = [
  'dagger', 'mace', 'sword', 'axe', 'spear', 'halberd', 'staff', 'katana', 'saber', 'blade', 'knife',
  'pistol', 'rifle', 'revolver', 'shotgun', 'bow', 'crossbow',
  'shield', 'helmet', 'chainmail', 'boots', 'gloves', 'armor',
  'potion', 'syringe', 'medpack',
  'key', 'keycard',
  'ring', 'necklace', 'amulet', 'crown', 'gemstone', 'crystal',
  'pickaxe', 'shovel', 'saw', 'hammer', 'blowtorch', 'screwdriver', 'wrench',
  'lantern', 'candle', 'candleholder', 'torch', 'chandelier', 'lamp',
  'chest', 'crate', 'barrel', 'bucket', 'basket', 'box', 'toolbox', 'sack',
  'chair', 'table', 'bed', 'shelf', 'cabinet', 'commode', 'drawer', 'bench', 'desk', 'stool',
  'book', 'books', 'scroll', 'bookstand',
  'bottle', 'goblet', 'mug', 'jug', 'jar',
  'bread', 'loaf', 'fruit', 'apple', 'meat', 'plate', 'bowl', 'cake', 'wedge',
  'ingot', 'ore', 'wood', 'wire',
  'vase', 'statue', 'painting',
  'boombox', 'datapad', 'computer', 'battery', 'energy',
  'arrow', 'quiver',
  'saddle', 'backpack', 'pouch', 'bag',
  'dynamite', 'grenade',
  'rod', 'rope',
];

function deriveObjectRole(asset: VisualAssetInput): string {
  const tags = (asset.tags || []).map(t => t.toLowerCase());
  const baseName = extractBaseName(asset.name).toLowerCase();

  // Check tags for specific roles
  for (const role of ROLE_TAGS) {
    if (tags.includes(role)) return role;
  }

  // Fallback: check name for role keywords
  for (const role of ROLE_TAGS) {
    if (baseName.includes(role)) return role;
  }

  // Use the last tag as a generic role (often the most specific tag)
  const lastTag = tags[tags.length - 1];
  if (lastTag && !['base', 'objects', 'model', 'cc0', 'quaternius', 'polyhaven'].includes(lastTag)) {
    return lastTag.replace(/\s+/g, '_');
  }

  // Final fallback: use sanitized base name
  return baseName.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// --- Material derivation ---

const MATERIAL_TAGS: Record<string, string> = {
  'wood': 'wood', 'wooden': 'wood', 'bark': 'wood',
  'iron': 'iron', 'steel': 'steel', 'metal': 'metal',
  'brass': 'brass', 'copper': 'copper', 'gold': 'gold',
  'stone': 'stone', 'marble': 'marble', 'sandstone': 'stone',
  'glass': 'glass', 'crystal': 'crystal',
  'leather': 'leather', 'fabric': 'cloth', 'cloth': 'cloth',
  'clay': 'clay', 'ceramic': 'clay', 'terracotta': 'clay',
  'plastic': 'plastic',
};

function deriveMaterial(asset: VisualAssetInput): string | null {
  const tags = (asset.tags || []).map(t => t.toLowerCase());
  const name = extractBaseName(asset.name).toLowerCase();

  for (const [keyword, material] of Object.entries(MATERIAL_TAGS)) {
    if (tags.includes(keyword) || name.includes(keyword)) return material;
  }
  return null;
}

// --- Main mapper function ---

function detectCategory(asset: VisualAssetInput): { category: string; itemType: string } | null {
  const tags = new Set((asset.tags || []).map(t => t.toLowerCase()));
  const name = extractBaseName(asset.name).toLowerCase();

  for (const rule of CATEGORY_RULES) {
    // Check exclude tags
    if (rule.excludeTags && rule.excludeTags.some(t => tags.has(t))) continue;

    // Check if any rule tag matches
    if (rule.tags.some(t => tags.has(t))) {
      return { category: rule.category, itemType: rule.itemType };
    }

    // Check name patterns
    if (rule.namePatterns) {
      for (const pattern of rule.namePatterns) {
        if (pattern.test(name)) return { category: rule.category, itemType: rule.itemType };
      }
    }
  }

  // Name-based fallback for assets with generic tags like "prop"
  const nameRules: [RegExp, string, string][] = [
    [/bucket/i, 'container', 'container'],
    [/barrel/i, 'container', 'container'],
    [/chest/i, 'container', 'container'],
    [/crate/i, 'container', 'container'],
    [/bottle/i, 'drink', 'consumable'],
    [/lamp|lantern/i, 'light_source', 'tool'],
    [/sword|dagger|axe|mace|blade/i, 'melee_weapon', 'weapon'],
    [/gun|pistol|rifle|revolver/i, 'ranged_weapon', 'weapon'],
    [/chair|table|bed|shelf|stool|bench|desk|cabinet/i, 'furniture', 'furniture'],
    [/book|scroll/i, 'document', 'document'],
    [/key/i, 'key', 'key'],
    [/potion/i, 'potion', 'consumable'],
    [/crown|ring|necklace|amulet/i, 'jewelry', 'accessory'],
    [/gem|crystal/i, 'collectible', 'collectible'],
    [/backpack|saddle|matchbox/i, 'collectible', 'collectible'],
    [/clock/i, 'decoration', 'decoration'],
    // Quaternius fantasy/rpg/survival items with generic tags
    [/anvil|cauldron|dummy|whetstone|weaponstand|peg.?rack/i, 'tool', 'tool'],
    [/banner|cage|stall/i, 'decoration', 'decoration'],
    [/candle|candlestick|chandelier|torch|bonfire|lantern/i, 'light_source', 'tool'],
    [/rope|chain/i, 'raw_material', 'material'],
    [/coin|star|snowflake|heart|mineral|bone|skull|fishbone/i, 'collectible', 'collectible'],
    [/shield/i, 'shield', 'armor'],
    [/chalice|goblet|mug/i, 'drink', 'consumable'],
    [/pot\b|pan\b|cauldron/i, 'tool', 'tool'],
    [/bag|pouch|sack/i, 'container', 'container'],
    [/vase/i, 'decoration', 'decoration'],
    [/carrot|chicken/i, 'food', 'consumable'],
    [/bandage|firstaid|medkit/i, 'medical', 'consumable'],
    [/can\b|gascan|trashcan|propane/i, 'container', 'container'],
    [/compass|radio|phone/i, 'equipment', 'equipment'],
    [/shovel/i, 'tool', 'tool'],
    [/tent|raft/i, 'equipment', 'equipment'],
    [/match\b/i, 'tool', 'tool'],
    [/woodlog|log\b/i, 'raw_material', 'material'],
    [/beartrap|mine\b/i, 'tool', 'tool'],
    [/parchment|rollofpaper/i, 'document', 'document'],
    [/dart/i, 'ranged_weapon', 'weapon'],
    [/hammer/i, 'melee_weapon', 'weapon'],
    [/staff/i, 'melee_weapon', 'weapon'],
    [/armor/i, 'armor', 'armor'],
    [/bow/i, 'ranged_weapon', 'weapon'],
    [/padlock/i, 'key', 'key'],
    [/ammo/i, 'ammunition', 'ammunition'],
    [/locker|shelves/i, 'furniture', 'furniture'],
    [/satellite|access.?point/i, 'equipment', 'equipment'],
    [/wrench|sledgehammer|crowbar|bolt.?cutter|ratchet/i, 'tool', 'tool'],
    [/glove/i, 'armor', 'armor'],
    [/knife/i, 'melee_weapon', 'weapon'],
    [/battery/i, 'equipment', 'equipment'],
    [/heater|stove|fireplace/i, 'furniture', 'furniture'],
    [/gamepad|football|baseball/i, 'collectible', 'collectible'],
  ];

  for (const [pattern, cat, iType] of nameRules) {
    if (pattern.test(name)) return { category: cat, itemType: iType };
  }

  return null;
}

export function mapAssetToBaseItem(asset: VisualAssetInput): BaseItemDefinition | null {
  // Skip environmental/infrastructure assets
  if (shouldSkipAsset(asset)) return null;

  // Detect category
  const detected = detectCategory(asset);
  if (!detected) return null; // Can't categorize = skip

  const { category, itemType } = detected;
  const defaults = CATEGORY_DEFAULTS[category];
  if (!defaults) return null;

  const name = humanizeName(asset.name);
  const objectRole = deriveObjectRole(asset);
  const material = deriveMaterial(asset);

  return {
    name,
    description: `${name} — a ${category.replace(/_/g, ' ')}.`,
    itemType,
    icon: defaults.icon,
    value: defaults.value,
    sellValue: defaults.sellValue,
    weight: defaults.weight,
    tradeable: true,
    stackable: defaults.stackable,
    maxStack: defaults.maxStack,
    worldType: null,
    objectRole,
    visualAssetId: asset._id.toString(),
    category,
    material,
    baseType: objectRole,
    rarity: defaults.rarity,
    effects: defaults.effects,
    lootWeight: defaults.lootWeight,
    tags: [category, itemType, ...(material ? [material] : [])],
    isBase: true,
    possessable: defaults.possessable,
  };
}

export { humanizeName, deriveObjectRole, detectCategory, shouldSkipAsset, extractBaseName };
