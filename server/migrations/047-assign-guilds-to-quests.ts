#!/usr/bin/env tsx
/**
 * Migration 047: Assign guild IDs and tiers to existing quests
 *
 * Auto-categorizes quests into language learning guilds based on their
 * questType, content keywords, and objective types. Skips:
 *   - Main quest chain quests (have questChainId)
 *   - Radiant/dynamic quests (have conversationContext — one-off NPC quests)
 *   - Quests that already have a guildId (idempotent)
 *
 * After initial assignment, runs a rebalancing pass to redistribute quests
 * from overrepresented guilds (Diplomates, Explorateurs) to underrepresented
 * ones (Marchands, Conteurs, Artisans) based on content analysis.
 *
 * Usage:
 *   npx tsx server/migrations/047-assign-guilds-to-quests.ts
 *   npx tsx server/migrations/047-assign-guilds-to-quests.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import {
  getGuildForQuestType,
  getGuildTierForCefrLevel,
  GUILD_DEFINITIONS,
  type GuildId,
} from '../../shared/guild-definitions.js';

const DRY_RUN = process.argv.includes('--dry-run');

// ── Skip patterns ────────────────────────────────────────────────────────────

/** Quest types that belong to the main quest and should never be guild-assigned */
const MAIN_QUEST_TYPES = ['main_quest', 'main'];

function shouldSkipQuest(quest: any): { skip: boolean; reason?: string } {
  // Main quest chain
  if (quest.questChainId) return { skip: true, reason: 'has questChainId (chain quest)' };
  if (MAIN_QUEST_TYPES.includes(quest.questType || '')) return { skip: true, reason: 'main quest type' };

  // Radiant/dynamic quests (generated at runtime from NPC conversation)
  if (quest.conversationContext) return { skip: true, reason: 'radiant quest (has conversationContext)' };

  // Tags that indicate non-guild quests
  const tags: string[] = quest.tags || [];
  if (tags.includes('main-quest')) return { skip: true, reason: 'tagged main-quest' };

  // Assessment quests (Arrival/Departure) are part of the main quest chain
  if (quest.questType === 'assessment') return { skip: true, reason: 'assessment quest' };

  return { skip: false };
}

// ── Content-aware guild inference ─────────────────────────────────────────────

/** Keywords that strongly indicate a specific guild, checked against title + description + objectives */
const GUILD_KEYWORDS: Record<GuildId, RegExp> = {
  marchands: /\b(shop|buy|sell|price|market|merchant|money|coin|gold|barter|haggle|trade|order|food|menu|meal|pay|cost|bargain|number|count|amount|change|receipt|currency)\b/i,
  artisans: /\b(craft|forge|build|repair|tool|material|wood|iron|smith|hammer|anvil|sew|weave|pottery|carve|construct|recipe|ingredient|create|make|assemble|workshop)\b/i,
  conteurs: /\b(read|book|story|write|grammar|translat|letter|poem|tale|narrative|library|text|document|scroll|literature|chapter|author|vocabulary|word|sentence|spell|conjugat|verb|noun|adjective)\b/i,
  explorateurs: /\b(explore|find|discover|map|travel|direction|navigate|north|south|east|west|compass|path|road|photo|picture|where|locate|search|hidden|treasure|hunt|scaveng|wander)\b/i,
  diplomates: /\b(greet|introduce|formal|polite|respect|diplomat|embassy|negotiate|ceremony|etiquette|protocol|speech|toast|honorific|cultural|tradition|custom|festival|ritual)\b/i,
};

function inferGuildFromContent(quest: any): GuildId | null {
  const title = (quest.title || '').toLowerCase();
  const desc = (quest.description || '').toLowerCase();
  const objText = (quest.objectives || []).map((o: any) => `${o.description || ''} ${o.type || ''}`).join(' ').toLowerCase();
  const text = `${title} ${desc} ${objText}`;

  // Score each guild by keyword matches
  const scores: Record<string, number> = {};
  for (const [guildId, pattern] of Object.entries(GUILD_KEYWORDS)) {
    const matches = text.match(new RegExp(pattern, 'gi'));
    scores[guildId] = matches ? matches.length : 0;
  }

  // Also check objective types for stronger signals
  for (const obj of (quest.objectives || [])) {
    const objType = (obj.type || '').toLowerCase();
    if (['collect_item', 'deliver_item', 'craft_item'].includes(objType)) scores.artisans = (scores.artisans || 0) + 3;
    if (['buy_item', 'sell_item', 'order_food', 'haggle_price'].includes(objType)) scores.marchands = (scores.marchands || 0) + 3;
    if (['read_text', 'find_text', 'translation_challenge', 'write_response'].includes(objType)) scores.conteurs = (scores.conteurs || 0) + 3;
    if (['visit_location', 'discover_location', 'photograph_subject', 'follow_directions'].includes(objType)) scores.explorateurs = (scores.explorateurs || 0) + 3;
    if (['talk_to_npc', 'introduce_self', 'complete_conversation'].includes(objType)) scores.diplomates = (scores.diplomates || 0) + 2;
  }

  // Find highest scoring guild
  const sorted = Object.entries(scores).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) return sorted[0][0] as GuildId;

  return null; // truly unclassifiable
}

// ── Main migration ───────────────────────────────────────────────────────────

async function run() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) { console.error('MONGO_URL not set'); process.exit(1); }

  await mongoose.connect(mongoUrl);
  const Quests = mongoose.connection.collection('quests');

  console.log(`\n🏰 Migration 047: Assign guilds to quests${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  // Reset existing guild assignments so we can re-run cleanly
  if (!DRY_RUN) {
    await Quests.updateMany(
      { guildId: { $exists: true, $ne: null } },
      { $unset: { guildId: '', guildTier: '' } },
    );
    console.log('Cleared existing guild assignments for fresh categorization.\n');
  }

  const quests = await Quests.find({}).toArray();
  console.log(`Total quests: ${quests.length}`);

  const stats: Record<string, number> = {};
  let skippedMain = 0;
  let skippedRadiant = 0;
  let assigned = 0;
  let unassigned = 0;

  for (const quest of quests) {
    const skipResult = shouldSkipQuest(quest);
    if (skipResult.skip) {
      if (skipResult.reason?.includes('radiant') || skipResult.reason?.includes('conversationContext')) {
        skippedRadiant++;
      } else {
        skippedMain++;
      }
      continue;
    }

    // Already completed quests: still assign guild for tracking, but skip 'available' status
    const questType = quest.questType || '';

    // Step 1: Try direct questType mapping
    let guildId: GuildId | null = getGuildForQuestType(questType);

    // Step 2: If questType maps to a broad category (conversation, vocabulary), use content analysis
    if (!guildId || guildId === 'diplomates' || guildId === 'marchands') {
      const contentGuild = inferGuildFromContent(quest);
      if (contentGuild) {
        // Content analysis overrides only if the direct mapping was a broad default
        if (!guildId) {
          guildId = contentGuild;
        } else if (guildId === 'diplomates' && contentGuild !== 'diplomates') {
          // Redistribute away from overrepresented diplomates
          guildId = contentGuild;
        }
      }
    }

    if (!guildId) {
      // Last resort: assign to least-populated guild
      guildId = getLeastPopulatedGuild(stats);
    }

    const tier = getGuildTierForCefrLevel(quest.cefrLevel);
    stats[guildId] = (stats[guildId] || 0) + 1;

    if (!DRY_RUN) {
      await Quests.updateOne({ _id: quest._id }, {
        $set: { guildId, guildTier: tier },
      });
    }
    assigned++;
  }

  console.log(`\nResults:`);
  console.log(`  Assigned to guilds: ${assigned}`);
  console.log(`  Skipped (main quest): ${skippedMain}`);
  console.log(`  Skipped (radiant/dynamic): ${skippedRadiant}`);
  console.log(`\nGuild distribution:`);
  for (const [guildId, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
    const def = GUILD_DEFINITIONS[guildId as keyof typeof GUILD_DEFINITIONS];
    console.log(`  ${def?.icon || '?'} ${def?.nameFr || guildId}: ${count} quests`);
  }

  // Check balance
  const values = Object.values(stats);
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max > min * 3) {
    console.log(`\n⚠️  Distribution is uneven (${max} max vs ${min} min). Consider generating more quests for underrepresented guilds.`);
  } else {
    console.log(`\n✅ Distribution looks balanced.`);
  }

  await mongoose.disconnect();
  console.log('\nDone!');
}

function getLeastPopulatedGuild(stats: Record<string, number>): GuildId {
  const guildIds: GuildId[] = ['marchands', 'artisans', 'conteurs', 'explorateurs', 'diplomates'];
  let minGuild = guildIds[0];
  let minCount = stats[minGuild] || 0;
  for (const id of guildIds) {
    const count = stats[id] || 0;
    if (count < minCount) {
      minCount = count;
      minGuild = id;
    }
  }
  return minGuild;
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
