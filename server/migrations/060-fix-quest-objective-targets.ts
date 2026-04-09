#!/usr/bin/env tsx
/**
 * Migration 060: Fix Quest Objective Targets
 *
 * Replaces empty/unknown/generic objective targets with specific world entities:
 * 1. Empty NPC refs (talk_to('', 1)) → specific named NPCs
 * 2. Unknown items (collect(unknown, 1)) → real items from the world
 * 3. Generic reads (read_text(any)) → specific text references
 * 4. Empty deliver targets → specific item + NPC pairs
 * 5. Legacy quest_chain/quest_chain_order predicates → removed
 * 6. Fixes objective locations to match the new targets
 *
 * Usage:
 *   npx tsx server/migrations/060-fix-quest-objective-targets.ts --dry-run
 *   npx tsx server/migrations/060-fix-quest-objective-targets.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URL || 'mongodb://localhost:27017/insimul';
const DRY_RUN = process.argv.includes('--dry-run');

// ── NPC Pool — notable NPCs for quest binding ────────────────────────────

const NOTABLE_NPCS = {
  // Guild masters
  marchands: 'Gauthier Bergeron',
  artisans: 'Nestor Sonnier',
  conteurs: 'Hortense Bergeron',
  explorateurs: 'Firmin Robichaux',
  diplomates: 'Hilaire Bégnaud',
  // Shops & services
  merchant: 'Étienne Moreau',
  innkeeper: 'Pierre Renard',
  bartender: 'Laurent Broussard',
  baker: 'Ursule Chénier',
  grocery: 'Arsène Cormier',
  restaurant: 'Timothée Cormier',
  // Education
  teacher: 'Zélie Cormier',
  professor: 'Jacques Duval',
  school: 'Catherine Sonnier',
  // Farm
  farmer: 'Ferdinand Aucoin',
};

// ── Item Pool — real items for crafting/collecting quests ─────────────────

const ITEMS = {
  // Craftable / artisan items
  crafted_tool: 'Brass Pan',
  crafted_item: 'Carved Wooden Elephant',
  herb: 'Herbs',
  potion: 'Potion',
  food: 'Baguette',
  recipe_ingredient: 'Small Bottle',
  // Collectible / exploration
  collectible: 'Star',
  document: 'Book3 Open',
  treasure: 'Coin Pile',
  gift: 'Ceramic Vase',
  key: 'Key Metal',
  // Materials
  material: 'Rope',
  wood: 'Tree Stump',
  ore: 'Boulder',
  // Trade goods
  trade_good: 'Brass Lamp',
  supply: 'Metal Jerrycan',
  purchase: 'Chalice',
};

// ── Main quest narrative texts ───────────────────────────────────────────

const NARRATIVE_TEXTS = {
  notice: 'Missing Writer Notice',
  journal_1: "Writer's First Journal",
  journal_2: "Writer's Second Journal",
  journal_3: "Writer's Third Journal",
  hidden_manuscript: 'Hidden Manuscript',
  secret_letter: 'Secret Letter',
  final_confession: 'Final Confession',
};

// ── Quest-specific objective fixes ───────────────────────────────────────
// Format: questId → { objIndex: replacement goal string, locIndex?: replacement location }

interface ObjFix {
  goal: string;
  location: string;
}

function buildFixes(): Record<string, Record<number, ObjFix>> {
  return {
    // ── Main quest chain (narrative) ────────────────────────────────────

    the_notice_board: {
      0: { goal: `read_text('${NARRATIVE_TEXTS.notice}')`, location: `location('Notice Board')` },
    },

    the_writer_s_home: {
      1: { goal: `collect('${NARRATIVE_TEXTS.journal_1}', 1)`, location: `location('writer_home')` },
      2: { goal: `read_text('${NARRATIVE_TEXTS.journal_1}')`, location: `location('writer_home')` },
    },

    the_hidden_writings: {
      0: { goal: `collect('${NARRATIVE_TEXTS.journal_2}', 1)`, location: `settlement` },
      1: { goal: `collect('${NARRATIVE_TEXTS.hidden_manuscript}', 1)`, location: `settlement` },
      2: { goal: `collect('${NARRATIVE_TEXTS.secret_letter}', 1)`, location: `settlement` },
      3: { goal: `read_text('${NARRATIVE_TEXTS.journal_2}')`, location: `any_text_location` },
    },

    the_secret_location: {
      2: { goal: `collect('${NARRATIVE_TEXTS.journal_3}', 1)`, location: `location('secret_location')` },
      3: { goal: `read_text('${NARRATIVE_TEXTS.journal_3}')`, location: `location('secret_location')` },
    },

    // ── Chapter quests (empty NPC talk_to) ──────────────────────────────

    chapter_1_assignment_abroad: {
      1: { goal: `talk_to('${NOTABLE_NPCS.innkeeper}', 1)`, location: `npc('${NOTABLE_NPCS.innkeeper}')` },
    },

    chapter_2_following_the_trail: {
      1: { goal: `talk_to('${NOTABLE_NPCS.bartender}', 1)`, location: `npc('${NOTABLE_NPCS.bartender}')` },
      2: { goal: `talk_to('${NOTABLE_NPCS.baker}', 1)`, location: `npc('${NOTABLE_NPCS.baker}')` },
    },

    chapter_3_the_inner_circle: {
      0: { goal: `talk_to('${NOTABLE_NPCS.conteurs}', 1)`, location: `npc('${NOTABLE_NPCS.conteurs}')` },
      1: { goal: `talk_to('${NOTABLE_NPCS.professor}', 1)`, location: `npc('${NOTABLE_NPCS.professor}')` },
      2: { goal: `talk_to('${NOTABLE_NPCS.marchands}', 1)`, location: `npc('${NOTABLE_NPCS.marchands}')` },
    },

    chapter_4_hidden_messages: {
      1: { goal: `talk_to('${NOTABLE_NPCS.teacher}', 1)`, location: `npc('${NOTABLE_NPCS.teacher}')` },
      2: { goal: `talk_to('${NOTABLE_NPCS.artisans}', 1)`, location: `npc('${NOTABLE_NPCS.artisans}')` },
    },

    chapter_5_the_truth_emerges: {
      0: { goal: `talk_to('${NOTABLE_NPCS.explorateurs}', 1)`, location: `npc('${NOTABLE_NPCS.explorateurs}')` },
      1: { goal: `talk_to('${NOTABLE_NPCS.diplomates}', 1)`, location: `npc('${NOTABLE_NPCS.diplomates}')` },
    },

    chapter_6_the_final_chapter: {
      0: { goal: `talk_to('${NOTABLE_NPCS.conteurs}', 1)`, location: `npc('${NOTABLE_NPCS.conteurs}')` },
      1: { goal: `talk_to('${NOTABLE_NPCS.innkeeper}', 1)`, location: `npc('${NOTABLE_NPCS.innkeeper}')` },
    },

    // ── Seed quests: unknown items ──────────────────────────────────────

    a_thoughtful_gift: {
      0: { goal: `collect('${ITEMS.gift}', 1)`, location: `any_merchant` },
    },

    scavenger_hunt_collector: {
      0: { goal: `collect('${ITEMS.collectible}', 1)`, location: `settlement` },
    },

    gather_supplies: {
      0: { goal: `collect('${ITEMS.supply}', 1)`, location: `any_merchant` },
    },

    special_delivery: {
      0: { goal: `collect('${ITEMS.trade_good}', 1)`, location: `any_merchant` },
      1: { goal: `deliver('${ITEMS.trade_good}', '${NOTABLE_NPCS.merchant}')`, location: `npc('${NOTABLE_NPCS.merchant}')` },
    },

    first_craft: {
      0: { goal: `craft_item('${ITEMS.crafted_tool}', 1)`, location: `any_crafting_station` },
    },

    secret_recipe: {
      0: { goal: `collect('${ITEMS.recipe_ingredient}', 1)`, location: `any_merchant` },
    },

    // ── Guild artisans quests ───────────────────────────────────────────

    gathering_materials: {
      0: { goal: `collect('${ITEMS.material}', 1)`, location: `settlement` },
    },

    first_creation: {
      0: { goal: `craft_item('${ITEMS.crafted_item}', 1)`, location: `any_crafting_station` },
    },

    follow_the_instructions: {
      1: { goal: `craft_item('${ITEMS.crafted_tool}', 1)`, location: `any_crafting_station` },
    },

    urgent_delivery: {
      0: { goal: `deliver('${ITEMS.crafted_tool}', '${NOTABLE_NPCS.restaurant}')`, location: `npc('${NOTABLE_NPCS.restaurant}')` },
    },

    masterwork: {
      0: { goal: `collect('${ITEMS.material}', 1)`, location: `settlement` },
      1: { goal: `craft_item('${ITEMS.crafted_item}', 1)`, location: `any_crafting_station` },
    },

    // ── Exploration/treasure quests ─────────────────────────────────────

    treasure_hunt: {
      1: { goal: `collect('${ITEMS.treasure}', 1)`, location: `settlement` },
    },

    the_big_purchase: {
      2: { goal: `collect('${ITEMS.purchase}', 1)`, location: `any_merchant` },
    },

    // ── Guild conteurs quests ──────────────────────────────────────────

    the_little_book: {
      0: { goal: `read_text('${NARRATIVE_TEXTS.journal_1}')`, location: `any_text_location` },
    },
  };
}

// ── Migration logic ──────────────────────────────────────────────────────

function escapeProlog(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function main() {
  console.log(`\n=== Migration 060: Fix Quest Objective Targets ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db!;
  const coll = db.collection('quests');
  const allQuests = await coll.find({}).toArray();

  const fixes = buildFixes();
  let objsFixed = 0;
  let chainsRemoved = 0;
  let questsUpdated = 0;

  for (const q of allQuests) {
    if (!q.content) continue;
    const id = q.content.match(/quest\(\s*(\w+)/)?.[1];
    if (!id) continue;

    let content = q.content;
    let changed = false;

    // ── Apply objective fixes ──────────────────────────────────────────
    const questFixes = fixes[id];
    if (questFixes) {
      for (const [idxStr, fix] of Object.entries(questFixes)) {
        const idx = parseInt(idxStr);

        // Replace the objective goal
        const objPattern = new RegExp(
          `quest_objective\\(\\s*${id}\\s*,\\s*${idx}\\s*,\\s*(.*)\\)\\s*\\.`,
        );
        const objMatch = content.match(objPattern);
        if (objMatch) {
          content = content.replace(objPattern, `quest_objective(${id}, ${idx}, ${fix.goal}).`);
          changed = true;
          objsFixed++;
        }

        // Replace the objective location
        const locPattern = new RegExp(
          `quest_objective_location\\(\\s*${id}\\s*,\\s*${idx}\\s*,\\s*(.*)\\)\\s*\\.`,
        );
        if (content.match(locPattern)) {
          content = content.replace(locPattern, `quest_objective_location(${id}, ${idx}, ${fix.location}).`);
        }
      }
    }

    // ── Remove legacy quest_chain predicates ────────────────────────────
    const beforeChain = content;
    content = content.replace(/quest_chain\(\s*\w+\s*,\s*\w+\s*\)\.\n?/g, '');
    content = content.replace(/quest_chain_order\(\s*\w+\s*,\s*\d+\s*\)\.\n?/g, '');
    if (content !== beforeChain) {
      chainsRemoved++;
      changed = true;
    }

    // ── Clean up multiple blank lines ───────────────────────────────────
    content = content.replace(/\n{3,}/g, '\n\n');

    // ── Write changes ──────────────────────────────────────────────────
    if (changed) {
      questsUpdated++;
      if (!DRY_RUN) {
        await coll.updateOne({ _id: q._id }, { $set: { content } });
      }
      if (questFixes) {
        const fixCount = Object.keys(questFixes).length;
        console.log(`  ${id}: ${fixCount} objective(s) fixed`);
      }
      if (content !== beforeChain && !questFixes) {
        console.log(`  ${id}: chain predicates removed`);
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Objectives fixed: ${objsFixed}`);
  console.log(`Chain predicates removed: ${chainsRemoved}`);
  console.log(`Quests updated: ${questsUpdated}${DRY_RUN ? ' (dry run)' : ''}`);

  // Verify: count remaining issues
  if (!DRY_RUN) {
    const updated = await coll.find({}).project({ content: 1 }).toArray();
    let emptyNpc = 0, unknownItem = 0, genericRead = 0, chains = 0;
    for (const q of updated) {
      if (!q.content) continue;
      const objs = [...q.content.matchAll(/quest_objective\(\s*\w+\s*,\s*\d+\s*,\s*(.*)\)\s*\./g)];
      for (const m of objs) {
        const goal = m[1];
        if (/talk_to\(\s*''\s*,/.test(goal)) emptyNpc++;
        if (/\bunknown\b/.test(goal)) unknownItem++;
        if (goal === 'read_text(any)') genericRead++;
      }
      if (q.content.includes('quest_chain(')) chains++;
    }
    console.log(`\nRemaining issues:`);
    console.log(`  Empty NPC refs: ${emptyNpc}`);
    console.log(`  Unknown items: ${unknownItem}`);
    console.log(`  Generic reads: ${genericRead}`);
    console.log(`  Legacy chains: ${chains}`);
  }

  console.log(`\n=== Done ===\n`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
