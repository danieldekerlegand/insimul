/**
 * Asset Collection Templates
 *
 * Pre-built asset collection templates for common world types.
 * Each template defines the Polyhaven asset IDs and collection slot mappings
 * needed to fully populate a world type's asset collection.
 */

export interface TemplateAssetEntry {
  polyhavenId: string;
  slotCategory: 'buildingModels' | 'natureModels' | 'characterModels' | 'objectModels' | 'questObjectModels';
  slotKey: string;
  assetType: string;
  name: string;
  description?: string;
}

export interface CollectionTemplate {
  name: string;
  description: string;
  worldType: string;
  collectionType: string;
  tags: string[];
  assets: TemplateAssetEntry[];
}

/**
 * Medieval Fantasy template — Gothic furniture, wooden props, lanterns
 * All IDs verified against Polyhaven API
 */
const medievalFantasy: CollectionTemplate = {
  name: 'Medieval Fantasy',
  description: 'Complete medieval fantasy asset pack with Gothic furniture, wooden props, lanterns, and nature elements',
  worldType: 'medieval-fantasy',
  collectionType: 'complete_theme',
  tags: ['medieval', 'fantasy', 'rpg'],
  assets: [
    // Nature
    { polyhavenId: 'tree_small_02', slotCategory: 'natureModels', slotKey: 'tree_deciduous', assetType: 'model_nature', name: 'Small Tree', description: 'Small deciduous tree with dense canopy' },
    { polyhavenId: 'boulder_01', slotCategory: 'natureModels', slotKey: 'rock_large', assetType: 'model_nature', name: 'Boulder', description: 'Weathered boulder with lichen' },
    { polyhavenId: 'tree_stump_01', slotCategory: 'natureModels', slotKey: 'tree_stump', assetType: 'model_nature', name: 'Tree Stump', description: 'Decayed tree stump with roots' },
    // Furniture / Interior
    { polyhavenId: 'GothicBed_01', slotCategory: 'objectModels', slotKey: 'bed', assetType: 'model_prop', name: 'Gothic Bed', description: 'Vintage Gothic four-poster bed' },
    { polyhavenId: 'GothicCabinet_01', slotCategory: 'objectModels', slotKey: 'cabinet', assetType: 'model_prop', name: 'Gothic Cabinet', description: 'Ornate Gothic wooden cabinet' },
    { polyhavenId: 'GothicCommode_01', slotCategory: 'objectModels', slotKey: 'commode', assetType: 'model_prop', name: 'Gothic Commode', description: 'Gothic commode with drawers' },
    { polyhavenId: 'GreenChair_01', slotCategory: 'objectModels', slotKey: 'chair', assetType: 'model_prop', name: 'Gothic Chair', description: 'Vintage Gothic upholstered chair' },
    { polyhavenId: 'WoodenTable_01', slotCategory: 'objectModels', slotKey: 'table', assetType: 'model_prop', name: 'Wooden Table', description: 'Vintage wooden table' },
    { polyhavenId: 'Shelf_01', slotCategory: 'objectModels', slotKey: 'shelf', assetType: 'model_prop', name: 'Wooden Shelf', description: 'Weathered wooden bookshelf' },
    // Props
    { polyhavenId: 'wine_barrel_01', slotCategory: 'objectModels', slotKey: 'barrel', assetType: 'model_prop', name: 'Wine Barrel', description: 'Worn oak wine barrel' },
    { polyhavenId: 'wooden_crate_01', slotCategory: 'objectModels', slotKey: 'crate', assetType: 'model_prop', name: 'Wooden Crate', description: 'Vintage wooden crate with rope handles' },
    { polyhavenId: 'Lantern_01', slotCategory: 'objectModels', slotKey: 'lantern', assetType: 'model_prop', name: 'Lantern', description: 'Antique brass hurricane lantern' },
    { polyhavenId: 'Chandelier_01', slotCategory: 'objectModels', slotKey: 'chandelier', assetType: 'model_prop', name: 'Chandelier', description: 'Ornate vintage brass chandelier' },
    { polyhavenId: 'brass_goblets', slotCategory: 'objectModels', slotKey: 'goblet', assetType: 'model_prop', name: 'Brass Goblets', description: 'Ornate brass goblets' },
    { polyhavenId: 'brass_candleholders', slotCategory: 'objectModels', slotKey: 'candleholder', assetType: 'model_prop', name: 'Brass Candleholders', description: 'Ornate brass candleholders' },
    { polyhavenId: 'book_encyclopedia_set_01', slotCategory: 'objectModels', slotKey: 'books', assetType: 'model_prop', name: 'Encyclopedia Set', description: 'Vintage leather-bound books' },
    // Quest
    { polyhavenId: 'treasure_chest', slotCategory: 'questObjectModels', slotKey: 'chest', assetType: 'model_prop', name: 'Treasure Chest', description: 'Worn wooden treasure chest' },
    { polyhavenId: 'antique_estoc', slotCategory: 'questObjectModels', slotKey: 'sword', assetType: 'model_prop', name: 'Antique Estoc', description: 'Historic thrusting sword' },
  ],
};

/**
 * Cyberpunk template — urban/industrial props, street furniture
 * All IDs verified against Polyhaven API
 */
const cyberpunk: CollectionTemplate = {
  name: 'Cyberpunk',
  description: 'Cyberpunk asset pack with urban street props, industrial elements, and utility infrastructure',
  worldType: 'cyberpunk',
  collectionType: 'complete_theme',
  tags: ['cyberpunk', 'sci-fi', 'neon', 'future'],
  assets: [
    { polyhavenId: 'street_lamp_01', slotCategory: 'objectModels', slotKey: 'lamp', assetType: 'model_prop', name: 'Street Lamp', description: 'Ornate cast-iron street lamp' },
    { polyhavenId: 'utility_box_01', slotCategory: 'objectModels', slotKey: 'utility_box', assetType: 'model_prop', name: 'Utility Box', description: 'Industrial urban utility box' },
    { polyhavenId: 'utility_box_02', slotCategory: 'objectModels', slotKey: 'utility_box_2', assetType: 'model_prop', name: 'Utility Box 02', description: 'Green electrical utility box' },
    { polyhavenId: 'barrel_stove', slotCategory: 'objectModels', slotKey: 'barrel_fire', assetType: 'model_prop', name: 'Barrel Stove', description: 'Rusted barrel stove' },
    { polyhavenId: 'Barrel_01', slotCategory: 'objectModels', slotKey: 'barrel', assetType: 'model_prop', name: 'Oil Barrel', description: 'Red metal oil drum' },
    { polyhavenId: 'barrel_03', slotCategory: 'objectModels', slotKey: 'barrel_blue', assetType: 'model_prop', name: 'Blue Barrel', description: 'Weathered blue steel barrel' },
    { polyhavenId: 'boombox', slotCategory: 'objectModels', slotKey: 'boombox', assetType: 'model_prop', name: 'Boombox', description: 'Vintage 80s portable boombox' },
    { polyhavenId: 'water_manhole_cover', slotCategory: 'objectModels', slotKey: 'manhole', assetType: 'model_prop', name: 'Manhole Cover', description: 'Cast-iron manhole cover' },
  ],
};

/**
 * Historical / Ancient template — brass vessels, classical props
 * All IDs verified against Polyhaven API
 */
const historical: CollectionTemplate = {
  name: 'Historical Ancient',
  description: 'Historical asset pack with classical props, brass vessels, and period furniture',
  worldType: 'historical-ancient',
  collectionType: 'complete_theme',
  tags: ['historical', 'ancient', 'classical', 'roman', 'greek'],
  assets: [
    { polyhavenId: 'brass_vase_01', slotCategory: 'objectModels', slotKey: 'vase', assetType: 'model_prop', name: 'Brass Vase', description: 'Antique brass vase' },
    { polyhavenId: 'brass_pot_01', slotCategory: 'objectModels', slotKey: 'pot', assetType: 'model_prop', name: 'Brass Pot', description: 'Aged brass cooking pot' },
    { polyhavenId: 'brass_pan_01', slotCategory: 'objectModels', slotKey: 'pan', assetType: 'model_prop', name: 'Brass Pan', description: 'Worn brass pan' },
    { polyhavenId: 'brass_goblets', slotCategory: 'objectModels', slotKey: 'goblet', assetType: 'model_prop', name: 'Brass Goblets', description: 'Ornate brass goblets' },
    { polyhavenId: 'antique_ceramic_vase_01', slotCategory: 'objectModels', slotKey: 'ceramic_vase', assetType: 'model_prop', name: 'Ceramic Vase', description: 'Antique ceramic vase with floral pattern' },
    { polyhavenId: 'stone_fire_pit', slotCategory: 'objectModels', slotKey: 'fire_pit', assetType: 'model_prop', name: 'Stone Fire Pit', description: 'Rustic stone fire pit' },
    { polyhavenId: 'wooden_bucket_01', slotCategory: 'objectModels', slotKey: 'bucket', assetType: 'model_prop', name: 'Wooden Bucket', description: 'Worn wooden bucket' },
    { polyhavenId: 'wine_barrel_01', slotCategory: 'objectModels', slotKey: 'barrel', assetType: 'model_prop', name: 'Wine Barrel', description: 'Oak wine barrel' },
  ],
};

/**
 * Post-Apocalyptic template — rusted industrial, damaged props, survival gear
 * All IDs verified against Polyhaven API
 */
const postApocalyptic: CollectionTemplate = {
  name: 'Post-Apocalyptic',
  description: 'Post-apocalyptic asset pack with rusted industrial debris, survival tools, and damaged props',
  worldType: 'post-apocalyptic',
  collectionType: 'complete_theme',
  tags: ['post-apocalyptic', 'wasteland', 'ruin', 'survival'],
  assets: [
    { polyhavenId: 'barrel_stove', slotCategory: 'objectModels', slotKey: 'barrel_fire', assetType: 'model_prop', name: 'Barrel Stove', description: 'Heavily rusted barrel stove' },
    { polyhavenId: 'Barrel_01', slotCategory: 'objectModels', slotKey: 'barrel', assetType: 'model_prop', name: 'Oil Barrel', description: 'Explosive red oil drum' },
    { polyhavenId: 'barrel_03', slotCategory: 'objectModels', slotKey: 'barrel_blue', assetType: 'model_prop', name: 'Fuel Barrel', description: 'Weathered blue fuel barrel' },
    { polyhavenId: 'utility_box_02', slotCategory: 'objectModels', slotKey: 'utility_box', assetType: 'model_prop', name: 'Utility Box', description: 'Weathered electrical utility box' },
    { polyhavenId: 'wooden_axe', slotCategory: 'objectModels', slotKey: 'axe', assetType: 'model_prop', name: 'Wooden Axe', description: 'Weathered survival axe' },
    { polyhavenId: 'tree_stump_01', slotCategory: 'natureModels', slotKey: 'tree_stump', assetType: 'model_nature', name: 'Tree Stump', description: 'Decayed tree stump' },
    { polyhavenId: 'wooden_crate_02', slotCategory: 'objectModels', slotKey: 'crate', assetType: 'model_prop', name: 'Wooden Crate', description: 'Worn wooden crate' },
    { polyhavenId: 'street_lamp_02', slotCategory: 'objectModels', slotKey: 'lamp', assetType: 'model_prop', name: 'Wall Lamp', description: 'Victorian wall-mounted street lamp' },
  ],
};

/**
 * Western / Frontier template — saloon furniture, rustic props
 * All IDs verified against Polyhaven API
 */
const western: CollectionTemplate = {
  name: 'Western Frontier',
  description: 'Wild West asset pack with saloon furniture, rustic props, and frontier gear',
  worldType: 'western-frontier',
  collectionType: 'complete_theme',
  tags: ['western', 'frontier', 'cowboy', 'desert'],
  assets: [
    { polyhavenId: 'bar_chair_round_01', slotCategory: 'objectModels', slotKey: 'bar_stool', assetType: 'model_prop', name: 'Bar Stool', description: 'Vintage wooden bar stool' },
    { polyhavenId: 'Rockingchair_01', slotCategory: 'objectModels', slotKey: 'chair', assetType: 'model_prop', name: 'Rocking Chair', description: 'Solid wood vintage rocking chair' },
    { polyhavenId: 'wooden_table_02', slotCategory: 'objectModels', slotKey: 'table', assetType: 'model_prop', name: 'Wooden Table', description: 'Simple worn wooden table' },
    { polyhavenId: 'wine_barrel_01', slotCategory: 'objectModels', slotKey: 'barrel', assetType: 'model_prop', name: 'Whiskey Barrel', description: 'Oak barrel for whiskey' },
    { polyhavenId: 'wooden_crate_01', slotCategory: 'objectModels', slotKey: 'crate', assetType: 'model_prop', name: 'Supply Crate', description: 'Vintage wooden supply crate' },
    { polyhavenId: 'Lantern_01', slotCategory: 'objectModels', slotKey: 'lantern', assetType: 'model_prop', name: 'Hurricane Lantern', description: 'Brass hurricane lantern' },
    { polyhavenId: 'wooden_axe', slotCategory: 'objectModels', slotKey: 'axe', assetType: 'model_prop', name: 'Axe', description: 'Weathered wooden-handled axe' },
    { polyhavenId: 'CashRegister_01', slotCategory: 'objectModels', slotKey: 'register', assetType: 'model_prop', name: 'Cash Register', description: 'Vintage cash register for general store' },
  ],
};

/**
 * Tropical / Pirate template — maritime props, treasure, wooden elements
 * All IDs verified against Polyhaven API
 */
const tropical: CollectionTemplate = {
  name: 'Tropical Pirate',
  description: 'Tropical pirate asset pack with maritime props, treasure, and colonial wooden elements',
  worldType: 'tropical-pirate',
  collectionType: 'complete_theme',
  tags: ['tropical', 'pirate', 'island', 'caribbean'],
  assets: [
    { polyhavenId: 'treasure_chest', slotCategory: 'questObjectModels', slotKey: 'chest', assetType: 'model_prop', name: 'Treasure Chest', description: 'Worn wooden treasure chest with iron straps' },
    { polyhavenId: 'wooden_barrels_01', slotCategory: 'objectModels', slotKey: 'barrels', assetType: 'model_prop', name: 'Wooden Barrels', description: 'Weathered wooden barrels and staves' },
    { polyhavenId: 'wooden_bucket_01', slotCategory: 'objectModels', slotKey: 'bucket', assetType: 'model_prop', name: 'Wooden Bucket', description: 'Rustic wooden bucket with metal bands' },
    { polyhavenId: 'wooden_crate_02', slotCategory: 'objectModels', slotKey: 'crate', assetType: 'model_prop', name: 'Cargo Crate', description: 'Vintage colonial wooden crate' },
    { polyhavenId: 'wooden_lantern_01', slotCategory: 'objectModels', slotKey: 'lantern', assetType: 'model_prop', name: 'Wooden Lantern', description: 'Colonial maritime wooden lantern' },
    { polyhavenId: 'wooden_handle_saber', slotCategory: 'objectModels', slotKey: 'saber', assetType: 'model_prop', name: 'Saber', description: 'Pirate-era wooden-handle saber' },
    { polyhavenId: 'antique_katana_01', slotCategory: 'questObjectModels', slotKey: 'sword', assetType: 'model_prop', name: 'Antique Katana', description: 'Ornate Japanese katana' },
    { polyhavenId: 'brass_goblets', slotCategory: 'objectModels', slotKey: 'goblet', assetType: 'model_prop', name: 'Brass Goblets', description: 'Pirate captain brass goblets' },
  ],
};

/**
 * Steampunk template — Victorian brass, clockwork, industrial-vintage
 * All IDs verified against Polyhaven API
 */
const steampunk: CollectionTemplate = {
  name: 'Steampunk',
  description: 'Steampunk asset pack with Victorian brass props, clockwork elements, and industrial-vintage decor',
  worldType: 'steampunk',
  collectionType: 'complete_theme',
  tags: ['steampunk', 'victorian', 'brass', 'clockwork'],
  assets: [
    { polyhavenId: 'vintage_grandfather_clock_01', slotCategory: 'objectModels', slotKey: 'clock', assetType: 'model_prop', name: 'Grandfather Clock', description: 'Ornate vintage wooden grandfather clock' },
    { polyhavenId: 'street_lamp_01', slotCategory: 'objectModels', slotKey: 'lamp', assetType: 'model_prop', name: 'Gas Street Lamp', description: 'Ornate cast-iron gas street lamp' },
    { polyhavenId: 'vintage_oil_lamp', slotCategory: 'objectModels', slotKey: 'oil_lamp', assetType: 'model_prop', name: 'Oil Lamp', description: 'Ornate Victorian oil lamp' },
    { polyhavenId: 'brass_candleholders', slotCategory: 'objectModels', slotKey: 'candleholder', assetType: 'model_prop', name: 'Brass Candleholders', description: 'Ornate brass candleholders' },
    { polyhavenId: 'ClassicConsole_01', slotCategory: 'objectModels', slotKey: 'table', assetType: 'model_prop', name: 'Console Table', description: 'Carved Victorian Gothic console table' },
    { polyhavenId: 'ArmChair_01', slotCategory: 'objectModels', slotKey: 'chair', assetType: 'model_prop', name: 'Armchair', description: 'Vintage Victorian armchair' },
    { polyhavenId: 'tea_set_01', slotCategory: 'objectModels', slotKey: 'tea_set', assetType: 'model_prop', name: 'Tea Set', description: 'Antique Victorian tea set' },
    { polyhavenId: 'vintage_wooden_drawer_01', slotCategory: 'objectModels', slotKey: 'drawer', assetType: 'model_prop', name: 'Filing Cabinet', description: 'Vintage wooden filing drawer' },
    { polyhavenId: 'book_encyclopedia_set_01', slotCategory: 'objectModels', slotKey: 'books', assetType: 'model_prop', name: 'Encyclopedia Set', description: 'Vintage leather-bound encyclopedia volumes' },
    { polyhavenId: 'brass_blowtorch', slotCategory: 'objectModels', slotKey: 'blowtorch', assetType: 'model_prop', name: 'Brass Blowtorch', description: 'Brass workshop blowtorch' },
  ],
};

/** All available templates keyed by world type */
export const COLLECTION_TEMPLATES: Record<string, CollectionTemplate> = {
  'medieval-fantasy': medievalFantasy,
  'cyberpunk': cyberpunk,
  'historical-ancient': historical,
  'post-apocalyptic': postApocalyptic,
  'western-frontier': western,
  'tropical-pirate': tropical,
  'steampunk': steampunk,
};

/**
 * Get a template by world type (supports partial matching)
 */
export function getTemplateForWorldType(worldType: string): CollectionTemplate | null {
  // Exact match first
  if (COLLECTION_TEMPLATES[worldType]) {
    return COLLECTION_TEMPLATES[worldType];
  }

  // Partial match — check if worldType contains any template key
  const lower = worldType.toLowerCase();
  for (const [key, template] of Object.entries(COLLECTION_TEMPLATES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return template;
    }
    // Also check individual words
    const keyWords = key.split('-');
    if (keyWords.some(word => lower.includes(word))) {
      return template;
    }
  }

  // Default to medieval-fantasy as a reasonable fallback
  return COLLECTION_TEMPLATES['medieval-fantasy'];
}

/**
 * List all available template names and world types
 */
export function listTemplates(): Array<{ worldType: string; name: string; assetCount: number }> {
  return Object.entries(COLLECTION_TEMPLATES).map(([worldType, template]) => ({
    worldType,
    name: template.name,
    assetCount: template.assets.length,
  }));
}
