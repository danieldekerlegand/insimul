#!/usr/bin/env tsx
/**
 * Migration 054: Fix guild quest status and assign guild master NPCs
 *
 * Fixes two issues with guild-seed quests from migration 048:
 * 1. All quests were created with status 'available' — only Tier 0 should be
 *    'available'; higher tiers should be 'unavailable' until the player
 *    receives them from the guild master.
 * 2. No quests had assignedByCharacterId set — guild master NPCs were never
 *    linked to guild quests.
 *
 * Usage:
 *   npx tsx server/migrations/054-fix-guild-quest-status-and-masters.ts
 *   npx tsx server/migrations/054-fix-guild-quest-status-and-masters.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DRY_RUN = process.argv.includes('--dry-run');

const GUILD_MASTER_OCCUPATIONS: Record<string, string> = {
  marchands: 'Merchant',
  artisans: 'Blacksmith',
  conteurs: 'Librarian',
  explorateurs: 'Cartographer',
  diplomates: 'Diplomat',
};

async function run() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL || process.env.DATABASE_URL;
  if (!mongoUrl) { console.error('MONGO_URL not set'); process.exit(1); }

  await mongoose.connect(mongoUrl);
  const Quests = mongoose.connection.collection('quests');
  const Characters = mongoose.connection.collection('characters');
  const Worlds = mongoose.connection.collection('worlds');

  console.log(`\nMigration 054: Fix guild quest status and assign masters${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  const worlds = await Worlds.find({}).toArray();
  let totalStatusFixed = 0;
  let totalMastersAssigned = 0;

  for (const world of worlds) {
    const worldId = world.id || world._id?.toString();
    if (!worldId) continue;

    // Get all guild-seed quests for this world
    const guildQuests = await Quests.find({ worldId, tags: 'guild-seed' }).toArray();
    if (guildQuests.length === 0) continue;

    // Get characters for guild master lookup
    const characters = await Characters.find({ worldId }).toArray();

    // Build guild master map: guildId → { name, id }
    const guildMasters: Record<string, { name: string; id: string }> = {};
    for (const [guildId, occupation] of Object.entries(GUILD_MASTER_OCCUPATIONS)) {
      const occLower = occupation.toLowerCase();
      const match = characters.find((c: any) =>
        c.occupation && c.occupation.toLowerCase() === occLower
      );
      if (match) {
        const name = match.name || [match.firstName, match.lastName].filter(Boolean).join(' ') || 'Guild Master';
        guildMasters[guildId] = { name, id: (match.id || match._id?.toString()) as string };
      }
    }

    let statusFixed = 0;
    let mastersAssigned = 0;

    for (const quest of guildQuests) {
      const updates: Record<string, any> = {};
      const guildId = quest.guildId as string;
      const guildTier = quest.guildTier as number;

      // Fix 1: Set non-tier-0 quests that are still 'available' (never started) to 'unavailable'
      if (guildTier > 0 && quest.status === 'available') {
        // Only fix if the quest hasn't been interacted with
        const objectives = (quest.objectives || []) as any[];
        const hasProgress = objectives.some((o: any) => (o.currentCount || 0) > 0 || o.completed);
        if (!hasProgress) {
          updates.status = 'unavailable';
          statusFixed++;
        }
      }

      // Fix 2: Assign guild master NPC if not already set
      if (!quest.assignedByCharacterId && guildId && guildMasters[guildId]) {
        const master = guildMasters[guildId];
        updates.assignedBy = master.name;
        updates.assignedByCharacterId = master.id;
        mastersAssigned++;
      }

      if (Object.keys(updates).length > 0 && !DRY_RUN) {
        await Quests.updateOne({ _id: quest._id }, { $set: updates });
      }
    }

    if (statusFixed > 0 || mastersAssigned > 0) {
      console.log(`  ${world.name}: ${statusFixed} status fixes, ${mastersAssigned} masters assigned`);
      const masterList = Object.entries(guildMasters).map(([g, m]) => `${g}=${m.name}`).join(', ');
      if (mastersAssigned > 0) console.log(`    Guild masters: ${masterList}`);
    }

    totalStatusFixed += statusFixed;
    totalMastersAssigned += mastersAssigned;
  }

  console.log(`\nTotal: ${totalStatusFixed} status fixes, ${totalMastersAssigned} masters assigned`);

  await mongoose.disconnect();
  console.log('Done!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
