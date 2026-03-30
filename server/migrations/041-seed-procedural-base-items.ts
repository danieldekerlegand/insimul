#!/usr/bin/env tsx
/**
 * Migration 041: Seed base items for all procedurally generated game elements.
 *
 * Every visual element in the game world gets a base item entry so it's
 * identifiable in the Prolog knowledge base and game logic systems.
 *
 * Usage: npx tsx server/migrations/041-seed-procedural-base-items.ts [--dry-run]
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dryRun = process.argv.includes('--dry-run');

interface BaseItem {
  name: string;
  itemType: string;
  category: string;
  baseType?: string;
  description: string;
  isBase: true;
  possessable: boolean;
  objectRole?: string;
  tags: string[];
  weight?: number;
  value?: number;
}

const PROCEDURAL_BASE_ITEMS: BaseItem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // INFRASTRUCTURE — Roads, paths, sidewalks
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Road', itemType: 'environmental', category: 'infrastructure', baseType: 'road', description: 'A paved or dirt road connecting locations', isBase: true, possessable: false, objectRole: 'road', tags: ['infrastructure', 'road', 'permanent'] },
  { name: 'Sidewalk', itemType: 'environmental', category: 'infrastructure', baseType: 'sidewalk', description: 'A paved walkway along a road', isBase: true, possessable: false, objectRole: 'sidewalk', tags: ['infrastructure', 'road', 'permanent'] },
  { name: 'Crosswalk', itemType: 'environmental', category: 'infrastructure', baseType: 'crosswalk', description: 'A marked pedestrian crossing', isBase: true, possessable: false, objectRole: 'crosswalk', tags: ['infrastructure', 'road', 'permanent'] },
  { name: 'Center Line', itemType: 'environmental', category: 'infrastructure', baseType: 'road_marking', description: 'A dashed center line on a road', isBase: true, possessable: false, objectRole: 'center_line', tags: ['infrastructure', 'road', 'marking'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // INFRASTRUCTURE — Street furniture
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Street Sign', itemType: 'environmental', category: 'infrastructure', baseType: 'sign', description: 'A sign displaying a street name', isBase: true, possessable: false, objectRole: 'street_sign', tags: ['infrastructure', 'sign', 'permanent'] },
  { name: 'Street Lamp', itemType: 'environmental', category: 'infrastructure', baseType: 'lamp', description: 'A lamp post illuminating the street', isBase: true, possessable: false, objectRole: 'street_lamp', tags: ['infrastructure', 'light', 'permanent'] },
  { name: 'Hanging Lantern', itemType: 'environmental', category: 'infrastructure', baseType: 'lamp', description: 'A lantern suspended from an arm on a post', isBase: true, possessable: false, objectRole: 'hanging_lantern', tags: ['infrastructure', 'light', 'permanent'] },
  { name: 'Settlement Sign', itemType: 'environmental', category: 'infrastructure', baseType: 'sign', description: 'A sign marking the entrance to a settlement', isBase: true, possessable: false, objectRole: 'settlement_sign', tags: ['infrastructure', 'sign', 'permanent', 'landmark'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // STRUCTURES — Buildings and components
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Residential Building', itemType: 'environmental', category: 'structure', baseType: 'building', description: 'A house or dwelling for residents', isBase: true, possessable: false, objectRole: 'building_residence', tags: ['structure', 'building', 'residence', 'permanent'] },
  { name: 'Commercial Building', itemType: 'environmental', category: 'structure', baseType: 'building', description: 'A business establishment', isBase: true, possessable: false, objectRole: 'building_business', tags: ['structure', 'building', 'business', 'permanent'] },
  { name: 'Public Building', itemType: 'environmental', category: 'structure', baseType: 'building', description: 'A civic or public building', isBase: true, possessable: false, objectRole: 'building_public', tags: ['structure', 'building', 'public', 'permanent'] },
  { name: 'Door', itemType: 'environmental', category: 'structure', baseType: 'door', description: 'An entrance to a building', isBase: true, possessable: false, objectRole: 'door', tags: ['structure', 'interactive', 'permanent'] },
  { name: 'Wall', itemType: 'environmental', category: 'structure', baseType: 'wall', description: 'A structural wall', isBase: true, possessable: false, objectRole: 'wall', tags: ['structure', 'permanent'] },
  { name: 'Roof', itemType: 'environmental', category: 'structure', baseType: 'roof', description: 'A building roof', isBase: true, possessable: false, objectRole: 'roof', tags: ['structure', 'permanent'] },
  { name: 'Foundation', itemType: 'environmental', category: 'structure', baseType: 'foundation', description: 'A building foundation', isBase: true, possessable: false, objectRole: 'foundation', tags: ['structure', 'permanent'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // TOWN SQUARE — Landmarks and features
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Fountain', itemType: 'environmental', category: 'decoration', baseType: 'fountain', description: 'A stone fountain with flowing water', isBase: true, possessable: false, objectRole: 'fountain', tags: ['decoration', 'landmark', 'water', 'permanent'] },
  { name: 'Flagpole', itemType: 'environmental', category: 'decoration', baseType: 'flagpole', description: 'A tall pole for displaying flags', isBase: true, possessable: false, objectRole: 'flagpole', tags: ['decoration', 'landmark', 'permanent'] },
  { name: 'Pedestal', itemType: 'environmental', category: 'decoration', baseType: 'pedestal', description: 'A stone pedestal for statues or displays', isBase: true, possessable: false, objectRole: 'pedestal', tags: ['decoration', 'landmark', 'permanent'] },
  { name: 'Notice Board', itemType: 'environmental', category: 'decoration', baseType: 'notice_board', description: 'A community notice board for posting announcements', isBase: true, possessable: false, objectRole: 'notice_board', tags: ['decoration', 'landmark', 'interactive', 'permanent'] },
  { name: 'Well', itemType: 'environmental', category: 'decoration', baseType: 'well', description: 'A stone well for drawing water', isBase: true, possessable: false, objectRole: 'well', tags: ['decoration', 'landmark', 'water', 'permanent'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // OUTDOOR FURNITURE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Park Bench', itemType: 'furniture', category: 'furniture', baseType: 'bench', description: 'A wooden bench for sitting', isBase: true, possessable: false, objectRole: 'bench', tags: ['furniture', 'seating', 'outdoor', 'permanent'] },
  { name: 'Picnic Table', itemType: 'furniture', category: 'furniture', baseType: 'table', description: 'A wooden table with attached benches', isBase: true, possessable: false, objectRole: 'picnic_table', tags: ['furniture', 'table', 'seating', 'outdoor'] },
  { name: 'Outdoor Chair', itemType: 'furniture', category: 'furniture', baseType: 'chair', description: 'A simple outdoor chair', isBase: true, possessable: false, objectRole: 'outdoor_chair', tags: ['furniture', 'seating', 'outdoor'] },
  { name: 'Outdoor Table', itemType: 'furniture', category: 'furniture', baseType: 'table', description: 'A small round outdoor table', isBase: true, possessable: false, objectRole: 'outdoor_table', tags: ['furniture', 'table', 'outdoor'] },
  { name: 'Planter', itemType: 'furniture', category: 'decoration', baseType: 'planter', description: 'A decorative planter with a bush', isBase: true, possessable: false, objectRole: 'planter', tags: ['decoration', 'nature', 'outdoor'] },
  { name: 'Water Trough', itemType: 'furniture', category: 'furniture', baseType: 'trough', description: 'A stone water trough for animals', isBase: true, possessable: false, objectRole: 'water_trough', tags: ['furniture', 'water', 'outdoor'] },
  { name: 'Signpost', itemType: 'environmental', category: 'infrastructure', baseType: 'sign', description: 'A wooden directional signpost', isBase: true, possessable: false, objectRole: 'signpost', tags: ['infrastructure', 'sign', 'outdoor'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARKET & COMMERCE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Market Stall', itemType: 'furniture', category: 'furniture', baseType: 'stall', description: 'A wooden market stall with shelves and awning', isBase: true, possessable: false, objectRole: 'market_stall', tags: ['furniture', 'commerce', 'outdoor'] },
  { name: 'Food Stall', itemType: 'furniture', category: 'furniture', baseType: 'stall', description: 'A food vendor stall with counter and awning', isBase: true, possessable: false, objectRole: 'food_stall', tags: ['furniture', 'commerce', 'food', 'outdoor'] },
  { name: 'Flower Cart', itemType: 'furniture', category: 'furniture', baseType: 'cart', description: 'A wheeled cart displaying flowers and plants', isBase: true, possessable: false, objectRole: 'flower_cart', tags: ['furniture', 'commerce', 'nature', 'outdoor'] },
  { name: 'Weapon Rack', itemType: 'furniture', category: 'furniture', baseType: 'rack', description: 'A wooden rack displaying weapons', isBase: true, possessable: false, objectRole: 'weapon_rack', tags: ['furniture', 'commerce', 'weapons', 'outdoor'] },
  { name: 'Terminal', itemType: 'furniture', category: 'equipment', baseType: 'terminal', description: 'An electronic information terminal', isBase: true, possessable: false, objectRole: 'terminal', tags: ['equipment', 'interactive', 'technology'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTAINERS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Barrel', itemType: 'container', category: 'container', baseType: 'barrel', description: 'A wooden storage barrel', isBase: true, possessable: false, objectRole: 'barrel', tags: ['container', 'storage', 'wood'], isContainer: true } as any,
  { name: 'Crate', itemType: 'container', category: 'container', baseType: 'crate', description: 'A wooden storage crate', isBase: true, possessable: false, objectRole: 'crate', tags: ['container', 'storage', 'wood'], isContainer: true } as any,

  // ═══════════════════════════════════════════════════════════════════════════
  // NATURE — Trees
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Oak Tree', itemType: 'environmental', category: 'nature', baseType: 'tree', description: 'A broad-canopy oak tree', isBase: true, possessable: false, objectRole: 'tree_oak', tags: ['nature', 'tree', 'deciduous', 'permanent'] },
  { name: 'Pine Tree', itemType: 'environmental', category: 'nature', baseType: 'tree', description: 'A tall coniferous pine tree', isBase: true, possessable: false, objectRole: 'tree_pine', tags: ['nature', 'tree', 'conifer', 'permanent'] },
  { name: 'Palm Tree', itemType: 'environmental', category: 'nature', baseType: 'tree', description: 'A tropical palm tree', isBase: true, possessable: false, objectRole: 'tree_palm', tags: ['nature', 'tree', 'tropical', 'permanent'] },
  { name: 'Dead Tree', itemType: 'environmental', category: 'nature', baseType: 'tree', description: 'A dead, leafless tree', isBase: true, possessable: false, objectRole: 'tree_dead', tags: ['nature', 'tree', 'dead', 'permanent'] },
  { name: 'Park Tree', itemType: 'environmental', category: 'nature', baseType: 'tree', description: 'A decorative tree in a park or garden', isBase: true, possessable: false, objectRole: 'tree_park', tags: ['nature', 'tree', 'park', 'permanent'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // NATURE — Ground cover and features
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bush', itemType: 'environmental', category: 'nature', baseType: 'bush', description: 'A leafy bush or shrub', isBase: true, possessable: false, objectRole: 'bush', tags: ['nature', 'vegetation', 'permanent'] },
  { name: 'Grass Patch', itemType: 'environmental', category: 'nature', baseType: 'grass', description: 'A patch of grass blades', isBase: true, possessable: false, objectRole: 'grass', tags: ['nature', 'vegetation', 'ground_cover'] },
  { name: 'Flower', itemType: 'environmental', category: 'nature', baseType: 'flower', description: 'A wildflower with stem and petals', isBase: true, possessable: true, objectRole: 'flower', tags: ['nature', 'vegetation', 'collectible'], weight: 0.1, value: 1 },
  { name: 'Rock', itemType: 'environmental', category: 'nature', baseType: 'rock', description: 'A natural rock or stone', isBase: true, possessable: false, objectRole: 'rock', tags: ['nature', 'geological', 'permanent'] },
  { name: 'Boulder', itemType: 'environmental', category: 'nature', baseType: 'boulder', description: 'A large boulder', isBase: true, possessable: false, objectRole: 'boulder', tags: ['nature', 'geological', 'permanent'] },
  { name: 'Lake', itemType: 'environmental', category: 'nature', baseType: 'water', description: 'A body of still water', isBase: true, possessable: false, objectRole: 'lake', tags: ['nature', 'water', 'permanent'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // NATURE — Geological
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Stone Pillar', itemType: 'environmental', category: 'nature', baseType: 'pillar', description: 'A natural stone pillar formation', isBase: true, possessable: false, objectRole: 'pillar', tags: ['nature', 'geological', 'permanent'] },
  { name: 'Crystal Formation', itemType: 'environmental', category: 'nature', baseType: 'crystal', description: 'A cluster of glowing crystals', isBase: true, possessable: false, objectRole: 'crystal', tags: ['nature', 'geological', 'magical', 'permanent'] },
  { name: 'Standing Stone', itemType: 'environmental', category: 'nature', baseType: 'standing_stone', description: 'An ancient standing stone monolith', isBase: true, possessable: false, objectRole: 'standing_stone', tags: ['nature', 'landmark', 'ancient', 'permanent'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // CEMETERY
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Gravestone', itemType: 'environmental', category: 'cemetery', baseType: 'gravestone', description: 'A stone marker for a grave with inscription', isBase: true, possessable: false, objectRole: 'gravestone', tags: ['cemetery', 'memorial', 'permanent'] },
  { name: 'Grave Base', itemType: 'environmental', category: 'cemetery', baseType: 'grave_base', description: 'A stone slab base beneath a gravestone', isBase: true, possessable: false, objectRole: 'grave_base', tags: ['cemetery', 'memorial', 'permanent'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // WILDERNESS — Camp and exploration
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Camp Tent', itemType: 'environmental', category: 'structure', baseType: 'tent', description: 'A simple canvas tent for camping', isBase: true, possessable: false, objectRole: 'tent', tags: ['structure', 'shelter', 'camp', 'wilderness'] },
  { name: 'Bedroll', itemType: 'furniture', category: 'furniture', baseType: 'bedroll', description: 'A roll of cloth for sleeping outdoors', isBase: true, possessable: true, objectRole: 'bedroll', tags: ['furniture', 'camp', 'wilderness'], weight: 3, value: 5 },
  { name: 'Campfire', itemType: 'environmental', category: 'decoration', baseType: 'campfire', description: 'A ring of stones with burning embers', isBase: true, possessable: false, objectRole: 'campfire', tags: ['decoration', 'light', 'heat', 'camp', 'wilderness'] },
  { name: 'Campfire Log', itemType: 'environmental', category: 'nature', baseType: 'log', description: 'A log placed near a campfire for seating', isBase: true, possessable: false, objectRole: 'campfire_log', tags: ['nature', 'camp', 'seating'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // WILDERNESS — Ruins and ancient sites
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ruined Wall', itemType: 'environmental', category: 'structure', baseType: 'ruins', description: 'A crumbling stone wall from an ancient structure', isBase: true, possessable: false, objectRole: 'ruins_wall', tags: ['structure', 'ruins', 'ancient', 'permanent'] },
  { name: 'Rubble', itemType: 'environmental', category: 'decoration', baseType: 'rubble', description: 'A pile of stone rubble from collapsed structures', isBase: true, possessable: false, objectRole: 'rubble', tags: ['decoration', 'ruins', 'permanent'] },
  { name: 'Shrine Base', itemType: 'environmental', category: 'decoration', baseType: 'shrine', description: 'A stone altar or shrine base', isBase: true, possessable: false, objectRole: 'shrine', tags: ['decoration', 'landmark', 'ancient', 'interactive'] },
  { name: 'Shrine Orb', itemType: 'environmental', category: 'decoration', baseType: 'orb', description: 'A glowing orb atop a shrine', isBase: true, possessable: false, objectRole: 'shrine_orb', tags: ['decoration', 'magical', 'ancient'] },
  { name: 'Ancient Ruins', itemType: 'environmental', category: 'structure', baseType: 'ruins', description: 'Layered stone ruins of an ancient structure', isBase: true, possessable: false, objectRole: 'ruins_structure', tags: ['structure', 'ruins', 'ancient', 'permanent', 'landmark'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // GROUND SURFACES
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Town Square Ground', itemType: 'environmental', category: 'infrastructure', baseType: 'ground', description: 'A paved or cobblestone town square surface', isBase: true, possessable: false, objectRole: 'ground_town_square', tags: ['infrastructure', 'ground', 'permanent'] },
  { name: 'Park Ground', itemType: 'environmental', category: 'nature', baseType: 'ground', description: 'A grassy park surface', isBase: true, possessable: false, objectRole: 'ground_park', tags: ['nature', 'ground', 'permanent'] },
];

async function run() {
  const mongoUrl = process.env.MONGO_URL!;
  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db!;

  console.log(dryRun ? '🔍 DRY RUN\n' : '📦 SEEDING\n');
  console.log(`${PROCEDURAL_BASE_ITEMS.length} procedural base items to seed\n`);

  // Check which already exist (by name + isBase)
  const existingNames = new Set(
    (await db.collection('items').find({ isBase: true }, { projection: { name: 1 } }).toArray())
      .map(i => i.name)
  );

  const toInsert = PROCEDURAL_BASE_ITEMS.filter(item => !existingNames.has(item.name));
  const alreadyExist = PROCEDURAL_BASE_ITEMS.length - toInsert.length;

  console.log(`Already exist: ${alreadyExist}`);
  console.log(`New to insert: ${toInsert.length}`);

  if (toInsert.length > 0 && !dryRun) {
    const result = await db.collection('items').insertMany(
      toInsert.map(item => ({
        ...item,
        worldId: null,
        value: item.value ?? 0,
        sellValue: 0,
        weight: item.weight ?? 0,
        tradeable: false,
        stackable: false,
        maxStack: 1,
        worldType: null,
        visualAssetId: null,
        material: null,
        rarity: 'common',
        effects: null,
        lootWeight: 0,
        isBase: true,
        metadata: {},
        craftingRecipe: null,
        questRelevance: [],
        loreText: null,
        languageLearningData: null,
        relatedTruthIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    console.log(`\n✅ Inserted ${result.insertedCount} base items`);
  } else if (toInsert.length > 0) {
    console.log('\nWould insert:');
    for (const item of toInsert) {
      console.log(`  ${item.name} (${item.category}/${item.itemType})`);
    }
  } else {
    console.log('\n✅ All items already exist');
  }

  // Final count
  const total = await db.collection('items').countDocuments({ isBase: true });
  console.log(`\nTotal base items: ${total}`);

  await mongoose.disconnect();
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
