#!/usr/bin/env tsx
/**
 * Migration 048: Seed guild quests for underrepresented guilds
 *
 * Creates purpose-built quests for each guild to ensure every guild
 * has enough quests for a proper 4-tier tree (~15 quests per guild).
 * Quests are created per-world, assigned to the appropriate guild,
 * and linked with prerequisiteQuestIds for tree progression.
 *
 * Idempotent: skips worlds that already have guild-seeded quests
 * (detected by tag 'guild-seed').
 *
 * Usage:
 *   npx tsx server/migrations/048-seed-guild-quests.ts
 *   npx tsx server/migrations/048-seed-guild-quests.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DRY_RUN = process.argv.includes('--dry-run');

// ── Guild Quest Templates ────────────────────────────────────────────────────

interface QuestTemplate {
  titleFr: string;
  titleEn: string;
  description: string;
  questType: string;
  guildTier: number;
  cefrLevel: string;
  difficulty: string;
  experienceReward: number;
  objectives: Array<{ type: string; description: string; requiredCount?: number }>;
}

const GUILD_QUEST_TEMPLATES: Record<string, QuestTemplate[]> = {
  marchands: [
    // Tier 0: Join
    { titleFr: "Bienvenue au Marché", titleEn: "Welcome to the Market", description: "Visit the Merchants Guild hall and introduce yourself to the guild master.", questType: 'vocabulary', guildTier: 0, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 50, objectives: [{ type: 'visit_location', description: 'Visit the Merchants Guild' }, { type: 'talk_to_npc', description: 'Introduce yourself to the guild master' }] },
    // Tier 1: Starter
    { titleFr: "Les Chiffres du Commerce", titleEn: "Numbers of Commerce", description: "Learn to count and use numbers when shopping at the market.", questType: 'number-practice', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 75, objectives: [{ type: 'use_vocabulary', description: 'Use number words in conversation', requiredCount: 5 }] },
    { titleFr: "Commander un Repas", titleEn: "Order a Meal", description: "Visit a restaurant and order a meal entirely in the target language.", questType: 'shopping', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 100, objectives: [{ type: 'order_food', description: 'Order food at a restaurant' }, { type: 'use_vocabulary', description: 'Name 3 food items', requiredCount: 3 }] },
    { titleFr: "Faire les Courses", titleEn: "Go Shopping", description: "Buy three items from different shops, asking for each by name.", questType: 'shopping', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 100, objectives: [{ type: 'buy_item', description: 'Purchase items from shops', requiredCount: 3 }] },
    // Tier 2: Intermediate
    { titleFr: "Le Marchandage", titleEn: "Haggling", description: "Negotiate prices with merchants using polite bargaining phrases.", questType: 'business-roleplay', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 150, objectives: [{ type: 'haggle_price', description: 'Successfully haggle with a merchant' }, { type: 'use_vocabulary', description: 'Use bargaining phrases', requiredCount: 4 }] },
    { titleFr: "Inventaire de la Boutique", titleEn: "Shop Inventory", description: "Help a shopkeeper count and name all items in their store.", questType: 'number-practice', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 150, objectives: [{ type: 'use_vocabulary', description: 'Name shop items', requiredCount: 10 }, { type: 'talk_to_npc', description: 'Report inventory to shopkeeper' }] },
    { titleFr: "Recette Secrète", titleEn: "Secret Recipe", description: "Gather ingredients from different vendors, asking for each in the target language.", questType: 'shopping', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 175, objectives: [{ type: 'collect_item', description: 'Collect recipe ingredients', requiredCount: 4 }, { type: 'use_vocabulary', description: 'Request ingredients by name', requiredCount: 4 }] },
    // Tier 3: Advanced
    { titleFr: "Le Grand Marché", titleEn: "The Grand Market", description: "Organize a market day: negotiate with vendors, set prices, and serve customers.", questType: 'business-roleplay', guildTier: 3, cefrLevel: 'B1', difficulty: 'advanced', experienceReward: 250, objectives: [{ type: 'talk_to_npc', description: 'Negotiate with 3 vendors', requiredCount: 3 }, { type: 'haggle_price', description: 'Set fair prices for goods', requiredCount: 2 }] },
    { titleFr: "Maître des Échanges", titleEn: "Master Trader", description: "Complete a complex multi-step trade route, buying low and selling high across the settlement.", questType: 'business-roleplay', guildTier: 3, cefrLevel: 'B2', difficulty: 'advanced', experienceReward: 300, objectives: [{ type: 'buy_item', description: 'Buy trade goods', requiredCount: 3 }, { type: 'sell_item', description: 'Sell for profit', requiredCount: 3 }] },
  ],

  artisans: [
    // Tier 0: Join
    { titleFr: "L'Apprenti Artisan", titleEn: "The Apprentice Artisan", description: "Visit the Artisans Guild hall and meet the master craftsman.", questType: 'crafting', guildTier: 0, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 50, objectives: [{ type: 'visit_location', description: 'Visit the Artisans Guild' }, { type: 'talk_to_npc', description: 'Meet the guild master' }] },
    // Tier 1
    { titleFr: "Connaître ses Outils", titleEn: "Know Your Tools", description: "Learn the names of common tools by examining them at the workshop.", questType: 'crafting', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 75, objectives: [{ type: 'examine_object', description: 'Examine workshop tools', requiredCount: 5 }, { type: 'point_and_name', description: 'Name each tool in target language', requiredCount: 5 }] },
    { titleFr: "Collecte de Matériaux", titleEn: "Gathering Materials", description: "Collect crafting materials from around the settlement.", questType: 'collection', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 100, objectives: [{ type: 'collect_item', description: 'Gather crafting materials', requiredCount: 4 }] },
    { titleFr: "Première Création", titleEn: "First Creation", description: "Craft your first item using the workshop tools.", questType: 'crafting', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 100, objectives: [{ type: 'craft_item', description: 'Craft an item at the workshop' }] },
    // Tier 2
    { titleFr: "Suivre les Instructions", titleEn: "Follow the Instructions", description: "A master craftsman gives you verbal instructions to follow. Listen carefully and complete each step.", questType: 'crafting', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 150, objectives: [{ type: 'talk_to_npc', description: 'Listen to crafting instructions' }, { type: 'craft_item', description: 'Follow instructions to craft', requiredCount: 2 }] },
    { titleFr: "Livraison Urgente", titleEn: "Urgent Delivery", description: "Deliver crafted goods to customers around the settlement, describing each item.", questType: 'delivery', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 150, objectives: [{ type: 'deliver_item', description: 'Deliver items to customers', requiredCount: 3 }] },
    { titleFr: "L'Herboriste", titleEn: "The Herbalist", description: "Gather herbs and learn their names in the target language.", questType: 'herbalism', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 175, objectives: [{ type: 'physical_action', description: 'Gather herbs' }, { type: 'use_vocabulary', description: 'Name each herb', requiredCount: 4 }] },
    // Tier 3
    { titleFr: "Chef-d'Œuvre", titleEn: "Masterwork", description: "Create a masterwork item by gathering rare materials and following complex instructions from the guild master.", questType: 'crafting', guildTier: 3, cefrLevel: 'B1', difficulty: 'advanced', experienceReward: 250, objectives: [{ type: 'collect_item', description: 'Gather rare materials', requiredCount: 3 }, { type: 'craft_item', description: 'Craft the masterwork' }, { type: 'talk_to_npc', description: 'Present to guild master' }] },
    { titleFr: "L'Enseignant", titleEn: "The Teacher", description: "Teach a new apprentice how to craft, explaining each step in the target language.", questType: 'crafting', guildTier: 3, cefrLevel: 'B2', difficulty: 'advanced', experienceReward: 300, objectives: [{ type: 'talk_to_npc', description: 'Teach crafting to an apprentice' }, { type: 'use_vocabulary', description: 'Explain crafting vocabulary', requiredCount: 8 }] },
  ],

  conteurs: [
    // Tier 0: Join
    { titleFr: "La Porte de la Bibliothèque", titleEn: "The Library Door", description: "Visit the Storytellers Guild hall and speak with the head librarian.", questType: 'reading', guildTier: 0, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 50, objectives: [{ type: 'visit_location', description: 'Visit the Storytellers Guild' }, { type: 'talk_to_npc', description: 'Meet the librarian' }] },
    // Tier 1
    { titleFr: "Premiers Mots", titleEn: "First Words", description: "Read simple signs around the settlement and learn basic vocabulary.", questType: 'reading', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 75, objectives: [{ type: 'read_sign', description: 'Read signs around town', requiredCount: 5 }] },
    { titleFr: "Le Petit Livre", titleEn: "The Little Book", description: "Find and read a beginner-level book, then answer comprehension questions.", questType: 'reading', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 100, objectives: [{ type: 'read_text', description: 'Read a short story' }, { type: 'comprehension_quiz', description: 'Answer questions about the story', requiredCount: 3 }] },
    { titleFr: "Les Mots Croisés", titleEn: "Word Puzzles", description: "Complete vocabulary exercises with the guild scholar.", questType: 'grammar', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 100, objectives: [{ type: 'use_vocabulary', description: 'Complete vocabulary challenges', requiredCount: 8 }] },
    // Tier 2
    { titleFr: "Le Conte du Village", titleEn: "The Village Tale", description: "Listen to a storyteller's tale and retell it in your own words.", questType: 'reading', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 150, objectives: [{ type: 'talk_to_npc', description: 'Listen to the storyteller' }, { type: 'write_response', description: 'Retell the story in writing' }] },
    { titleFr: "Correction d'Épreuves", titleEn: "Proofreading", description: "Find and correct grammatical errors in a document.", questType: 'error_correction', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 150, objectives: [{ type: 'translation_challenge', description: 'Identify and fix errors', requiredCount: 5 }] },
    { titleFr: "Traduction du Manuscrit", titleEn: "Manuscript Translation", description: "Translate a short manuscript passage between languages.", questType: 'translation', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 175, objectives: [{ type: 'write_response', description: 'Translate the passage' }, { type: 'talk_to_npc', description: 'Review translation with scholar' }] },
    // Tier 3
    { titleFr: "L'Auteur", titleEn: "The Author", description: "Write an original short story in the target language and present it to the guild.", questType: 'grammar', guildTier: 3, cefrLevel: 'B1', difficulty: 'advanced', experienceReward: 250, objectives: [{ type: 'write_response', description: 'Write an original story' }, { type: 'talk_to_npc', description: 'Present to the guild', requiredCount: 2 }] },
    { titleFr: "Le Grand Débat", titleEn: "The Great Debate", description: "Participate in a formal debate, arguing a position using advanced grammar and vocabulary.", questType: 'grammar', guildTier: 3, cefrLevel: 'B2', difficulty: 'advanced', experienceReward: 300, objectives: [{ type: 'complete_conversation', description: 'Debate with an opponent' }, { type: 'use_vocabulary', description: 'Use advanced vocabulary', requiredCount: 10 }] },
  ],

  explorateurs: [
    // Tier 0: Join
    { titleFr: "Le Premier Pas", titleEn: "The First Step", description: "Visit the Explorers Guild hall and receive your first map.", questType: 'exploration', guildTier: 0, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 50, objectives: [{ type: 'visit_location', description: 'Visit the Explorers Guild' }, { type: 'talk_to_npc', description: 'Receive your explorer map' }] },
    // Tier 1
    { titleFr: "Tour du Village", titleEn: "Village Tour", description: "Visit key locations around the settlement and learn their names.", questType: 'exploration', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 75, objectives: [{ type: 'visit_location', description: 'Visit settlement landmarks', requiredCount: 4 }] },
    { titleFr: "Demander son Chemin", titleEn: "Ask for Directions", description: "Ask NPCs for directions to different locations using the target language.", questType: 'navigation', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 100, objectives: [{ type: 'ask_for_directions', description: 'Ask NPCs for directions', requiredCount: 3 }] },
    { titleFr: "Capturer la Beauté", titleEn: "Capture the Beauty", description: "Take photos of interesting locations and describe them.", questType: 'photography', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 100, objectives: [{ type: 'photograph_subject', description: 'Photograph locations', requiredCount: 3 }] },
    // Tier 2
    { titleFr: "Chasse au Trésor", titleEn: "Treasure Hunt", description: "Follow a series of clues written in the target language to find a hidden treasure.", questType: 'scavenger_hunt', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 150, objectives: [{ type: 'follow_directions', description: 'Follow written clues', requiredCount: 4 }, { type: 'collect_item', description: 'Find the treasure' }] },
    { titleFr: "Le Cartographe", titleEn: "The Cartographer", description: "Map unexplored areas by describing what you see to the guild cartographer.", questType: 'exploration', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 175, objectives: [{ type: 'discover_location', description: 'Discover new locations', requiredCount: 3 }, { type: 'describe_scene', description: 'Describe what you find' }] },
    // Tier 3
    { titleFr: "L'Expédition", titleEn: "The Expedition", description: "Lead an expedition, giving directions to your team and documenting discoveries.", questType: 'exploration', guildTier: 3, cefrLevel: 'B1', difficulty: 'advanced', experienceReward: 250, objectives: [{ type: 'follow_directions', description: 'Navigate a complex route', requiredCount: 5 }, { type: 'describe_scene', description: 'Document your discoveries', requiredCount: 3 }] },
    { titleFr: "Le Guide Touristique", titleEn: "The Tour Guide", description: "Lead a tour for visitors, describing the history and culture of each location in the target language.", questType: 'exploration', guildTier: 3, cefrLevel: 'B2', difficulty: 'advanced', experienceReward: 300, objectives: [{ type: 'talk_to_npc', description: 'Guide tourists', requiredCount: 4 }, { type: 'describe_scene', description: 'Describe locations in detail', requiredCount: 4 }] },
  ],

  diplomates: [
    // Tier 0: Join
    { titleFr: "L'Art de la Rencontre", titleEn: "The Art of Meeting", description: "Visit the Diplomats Guild hall and learn proper introductions.", questType: 'conversation', guildTier: 0, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 50, objectives: [{ type: 'visit_location', description: 'Visit the Diplomats Guild' }, { type: 'introduce_self', description: 'Introduce yourself formally' }] },
    // Tier 1
    { titleFr: "Salutations", titleEn: "Greetings", description: "Greet 5 different NPCs using appropriate formal and informal greetings.", questType: 'conversation', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 75, objectives: [{ type: 'talk_to_npc', description: 'Greet NPCs appropriately', requiredCount: 5 }] },
    { titleFr: "Se Présenter", titleEn: "Introduce Yourself", description: "Have conversations where you introduce yourself, stating your name, origin, and interests.", questType: 'conversation', guildTier: 1, cefrLevel: 'A1', difficulty: 'beginner', experienceReward: 100, objectives: [{ type: 'introduce_self', description: 'Make introductions', requiredCount: 3 }] },
    // Tier 2
    { titleFr: "Le Médiateur", titleEn: "The Mediator", description: "Help resolve a disagreement between two NPCs using diplomatic language.", questType: 'social', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 150, objectives: [{ type: 'talk_to_npc', description: 'Listen to both sides', requiredCount: 2 }, { type: 'complete_conversation', description: 'Propose a resolution' }] },
    { titleFr: "Coutumes Locales", titleEn: "Local Customs", description: "Learn about local cultural traditions by speaking with elders.", questType: 'cultural', guildTier: 2, cefrLevel: 'A2', difficulty: 'intermediate', experienceReward: 175, objectives: [{ type: 'talk_to_npc', description: 'Interview elders about customs', requiredCount: 3 }, { type: 'use_vocabulary', description: 'Use cultural vocabulary', requiredCount: 5 }] },
    // Tier 3
    { titleFr: "L'Ambassadeur", titleEn: "The Ambassador", description: "Represent your guild at a formal gathering, using advanced diplomatic language and cultural knowledge.", questType: 'social', guildTier: 3, cefrLevel: 'B1', difficulty: 'advanced', experienceReward: 250, objectives: [{ type: 'complete_conversation', description: 'Formal diplomatic exchanges', requiredCount: 3 }, { type: 'use_vocabulary', description: 'Use formal register', requiredCount: 8 }] },
    { titleFr: "Le Sommet", titleEn: "The Summit", description: "Organize and host a cultural summit, mediating between different perspectives entirely in the target language.", questType: 'social', guildTier: 3, cefrLevel: 'B2', difficulty: 'advanced', experienceReward: 300, objectives: [{ type: 'talk_to_npc', description: 'Negotiate with delegates', requiredCount: 5 }, { type: 'complete_conversation', description: 'Reach consensus' }] },
  ],
};

// ── Migration ────────────────────────────────────────────────────────────────

async function run() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL || process.env.DATABASE_URL;
  if (!mongoUrl) { console.error('MONGO_URL not set'); process.exit(1); }

  await mongoose.connect(mongoUrl);
  const Quests = mongoose.connection.collection('quests');
  const Worlds = mongoose.connection.collection('worlds');

  console.log(`\n🏰 Migration 048: Seed guild quests${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  const worlds = await Worlds.find({}).toArray();
  console.log(`Found ${worlds.length} worlds`);

  let totalCreated = 0;

  for (const world of worlds) {
    const worldId = world.id || world._id?.toString();
    if (!worldId) continue;

    // Check if this world already has guild-seeded quests
    const existingSeeds = await Quests.countDocuments({ worldId, tags: 'guild-seed' });
    if (existingSeeds > 0) {
      console.log(`  ${world.name}: already has ${existingSeeds} guild-seed quests, skipping`);
      continue;
    }

    const targetLanguage = world.targetLanguage || 'French';
    let worldCreated = 0;

    // Count existing guild quests per guild to know what's needed
    const existingCounts: Record<string, number> = {};
    for (const guildId of Object.keys(GUILD_QUEST_TEMPLATES)) {
      existingCounts[guildId] = await Quests.countDocuments({ worldId, guildId });
    }

    for (const [guildId, templates] of Object.entries(GUILD_QUEST_TEMPLATES)) {
      // Only seed quests that don't already exist for this guild
      const existing = existingCounts[guildId] || 0;
      if (existing >= 12) {
        console.log(`  ${guildId}: already has ${existing} quests, skipping seed`);
        continue;
      }

      // Create quests from templates, linking prerequisites within tiers
      const createdIds: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [] };

      for (const template of templates) {
        const questId = uuidv4();

        // Prerequisites: Tier N requires completion of Tier N-1 quests (and the join quest)
        const prerequisiteQuestIds: string[] = [];
        if (template.guildTier > 0) {
          const prevTier = template.guildTier - 1;
          prerequisiteQuestIds.push(...createdIds[prevTier]);
        }

        const quest = {
          id: questId,
          worldId,
          title: template.titleEn,
          description: template.description,
          questType: template.questType,
          difficulty: template.difficulty,
          cefrLevel: template.cefrLevel,
          targetLanguage,
          guildId,
          guildTier: template.guildTier,
          status: template.guildTier === 0 ? 'available' : 'unavailable',
          objectives: template.objectives.map((obj, i) => ({
            id: `${questId}_obj_${i}`,
            type: obj.type,
            description: obj.description,
            requiredCount: obj.requiredCount || 1,
            currentCount: 0,
            completed: false,
            order: i,
          })),
          prerequisiteQuestIds,
          experienceReward: template.experienceReward,
          moneyReward: 0,
          tags: ['guild-seed', `guild:${guildId}`, `tier:${template.guildTier}`],
          assignedTo: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (!DRY_RUN) {
          await Quests.insertOne(quest);
        }

        createdIds[template.guildTier].push(questId);
        worldCreated++;
      }
    }

    console.log(`  ${world.name}: created ${worldCreated} guild-seed quests`);
    totalCreated += worldCreated;
  }

  console.log(`\nTotal created: ${totalCreated} quests across ${worlds.length} worlds`);

  // Show final distribution
  if (!DRY_RUN && worlds.length > 0) {
    const worldId = worlds[0].id || worlds[0]._id?.toString();
    console.log(`\nFinal distribution for "${worlds[0].name}":`);
    for (const guildId of Object.keys(GUILD_QUEST_TEMPLATES)) {
      const count = await Quests.countDocuments({ worldId, guildId });
      const icon = { marchands: '🏪', artisans: '🔨', conteurs: '📖', explorateurs: '🧭', diplomates: '🤝' }[guildId] || '?';
      console.log(`  ${icon} ${guildId}: ${count} quests`);
    }
  }

  await mongoose.disconnect();
  console.log('\nDone!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
