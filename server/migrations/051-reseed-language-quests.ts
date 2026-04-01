#!/usr/bin/env tsx
/**
 * Migration 051: Reseed Language Learning Quests
 *
 * Restores the full set of language learning quests from the JSON seed files
 * in data/seed/language/. Seeds guild quests (42), seed quests (50), and
 * quest chain templates (20 quests across 4 chains).
 *
 * Idempotent: skips quests that already exist (matched by title + worldId).
 * Generates Prolog content for each quest via convertQuestToProlog().
 *
 * Usage:
 *   npx tsx server/migrations/051-reseed-language-quests.ts
 *   npx tsx server/migrations/051-reseed-language-quests.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URL = process.env.MONGODB_URL || process.env.MONGO_URL || process.env.DATABASE_URL || '';
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(`\n=== Migration 051: Reseed Language Learning Quests ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  if (!MONGO_URL) {
    console.error('No MONGO_URL found in environment');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB\n');

  const { storage } = await import('../db/storage.js');
  const { convertQuestToProlog } = await import('../../shared/prolog/quest-converter.js');

  const worlds = await storage.getWorlds();
  console.log(`Found ${worlds.length} worlds\n`);

  // Load seed data from JSON files
  const dataDir = path.resolve(__dirname, '../../data/seed/language');

  const guildData = JSON.parse(readFileSync(path.join(dataDir, 'guild-quests.json'), 'utf-8'));
  const seedData = JSON.parse(readFileSync(path.join(dataDir, 'seed-quests.json'), 'utf-8'));
  const chainData = JSON.parse(readFileSync(path.join(dataDir, 'quest-chains.json'), 'utf-8'));

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const world of worlds) {
    const worldId = world.id;
    const targetLanguage = world.targetLanguage || 'French';
    console.log(`\n--- World: "${world.name}" (${worldId}) ---`);

    // Get existing quest titles for dedup
    const existingQuests = await storage.getQuestsByWorld(worldId);
    const existingTitles = new Set(existingQuests.map((q: any) => q.title));
    let worldCreated = 0;
    let worldSkipped = 0;

    // ── Seed quests (50) ────────────────────────────────────────────────
    console.log('  Seeding base quests...');
    for (const quest of seedData.quests) {
      if (existingTitles.has(quest.title)) {
        worldSkipped++;
        continue;
      }

      const questData: any = {
        worldId,
        assignedTo: 'player',
        title: quest.title,
        description: quest.description,
        questType: quest.questType,
        difficulty: quest.difficulty || 'beginner',
        targetLanguage,
        gameType: 'language-learning',
        status: 'active',
        experienceReward: quest.experienceReward || 20,
        objectives: quest.objectives,
        tags: quest.tags || ['seed'],
      };

      // Generate Prolog content
      try {
        const result = convertQuestToProlog(questData);
        if (result.prologContent) questData.content = result.prologContent;
      } catch {}

      if (!DRY_RUN) {
        await storage.createQuest(questData);
      }
      worldCreated++;
      existingTitles.add(quest.title);
    }
    console.log(`    Base quests: ${worldCreated} created, ${worldSkipped} skipped`);

    // ── Guild quests (42) ───────────────────────────────────────────────
    const guildCreatedBefore = worldCreated;
    const guildSkippedBefore = worldSkipped;
    console.log('  Seeding guild quests...');
    for (const [guildId, guild] of Object.entries(guildData.guilds) as any[]) {
      for (const quest of guild.quests) {
        const title = quest.titleEn;
        if (existingTitles.has(title)) {
          worldSkipped++;
          continue;
        }

        const questData: any = {
          worldId,
          assignedTo: 'player',
          title,
          description: quest.description,
          questType: quest.questType,
          difficulty: quest.difficulty || 'beginner',
          cefrLevel: quest.cefrLevel || 'A1',
          targetLanguage,
          gameType: 'language-learning',
          status: 'active',
          experienceReward: quest.experienceReward || 50,
          objectives: (quest.objectives || []).map((obj: any, i: number) => ({
            id: `obj_${i}`,
            type: obj.type,
            description: obj.description,
            completed: false,
            current: 0,
            required: obj.requiredCount || 1,
          })),
          tags: ['guild-seed', `guild:${guildId}`, `tier:${quest.guildTier}`],
          conversationContext: JSON.stringify({
            titleFr: quest.titleFr,
            guild: guildId,
            guildTier: quest.guildTier,
          }),
        };

        // Generate Prolog content
        try {
          const result = convertQuestToProlog(questData);
          if (result.prologContent) questData.content = result.prologContent;
        } catch {}

        if (!DRY_RUN) {
          await storage.createQuest(questData);
        }
        worldCreated++;
        existingTitles.add(title);
      }
    }
    const guildCreated = worldCreated - guildCreatedBefore;
    const guildSkipped = worldSkipped - guildSkippedBefore;
    console.log(`    Guild quests: ${guildCreated} created, ${guildSkipped} skipped`);

    // ── Quest chains (4 chains, 20 quests) ──────────────────────────────
    const chainCreatedBefore = worldCreated;
    const chainSkippedBefore = worldSkipped;
    console.log('  Seeding quest chains...');
    for (const [chainId, chain] of Object.entries(chainData.chains) as any[]) {
      const chainIdStr = `chain_${chainId}_${Date.now()}`;

      for (let i = 0; i < chain.quests.length; i++) {
        const quest = chain.quests[i];
        if (existingTitles.has(quest.title)) {
          worldSkipped++;
          continue;
        }

        const questData: any = {
          worldId,
          assignedTo: 'player',
          title: quest.title,
          description: quest.description,
          questType: quest.questType,
          difficulty: quest.difficulty || 'beginner',
          targetLanguage,
          gameType: 'language-learning',
          status: i === 0 ? 'active' : 'pending',
          experienceReward: quest.experienceReward || 50,
          questChainId: chainIdStr,
          questChainOrder: i,
          objectives: (quest.objectives || []).map((obj: any, j: number) => ({
            id: `obj_${j}`,
            type: obj.type,
            description: obj.description,
            completed: false,
            current: 0,
            required: obj.required || obj.requiredCount || 1,
          })),
          tags: [
            'chain',
            `chain:${chainId}`,
            ...(quest.tags || []),
            ...(quest.narrativeChapterId ? [`chapter:${quest.narrativeChapterId}`] : []),
          ],
        };

        // Generate Prolog content
        try {
          const result = convertQuestToProlog(questData);
          if (result.prologContent) questData.content = result.prologContent;
        } catch {}

        if (!DRY_RUN) {
          await storage.createQuest(questData);
        }
        worldCreated++;
        existingTitles.add(quest.title);
      }
    }
    const chainCreated = worldCreated - chainCreatedBefore;
    const chainSkipped = worldSkipped - chainSkippedBefore;
    console.log(`    Chain quests: ${chainCreated} created, ${chainSkipped} skipped`);

    totalCreated += worldCreated;
    totalSkipped += worldSkipped;
    console.log(`  World total: ${worldCreated} created, ${worldSkipped} skipped`);
  }

  console.log(`\n=== Done: ${totalCreated} created, ${totalSkipped} skipped ===\n`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
