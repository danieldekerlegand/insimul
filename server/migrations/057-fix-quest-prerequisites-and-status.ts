#!/usr/bin/env tsx
/**
 * Migration 057: Fix Quest Prerequisites and Initial Status
 *
 * Problems fixed:
 * 1. All quests have status 'available' or 'active' from the start
 *    → Chain quests should be 'unavailable' until their predecessor is complete
 *    → Only the first quest in each chain + the Arrival Assessment should be active
 *
 * 2. No quest_prerequisite links between chain members
 *    → Derives prerequisites from quest_chain + quest_chain_order
 *
 * 3. Guild tier quests are all available
 *    → tier_1 quests should be available, tier_2/3 should be unavailable
 *
 * This modifies the Prolog `content` field and the `status` field.
 *
 * Usage:
 *   npx tsx server/migrations/057-fix-quest-prerequisites-and-status.ts --dry-run
 *   npx tsx server/migrations/057-fix-quest-prerequisites-and-status.ts
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

async function main() {
  console.log(`\n=== Migration 057: Fix Quest Prerequisites & Status ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db!;
  const questsCollection = db.collection('quests');

  const allQuests = await questsCollection.find({}).toArray();
  console.log(`Found ${allQuests.length} quests\n`);

  // ── Step 1: Build chain index ──────────────────────────────────────────
  // Map chainId → sorted list of { questId, dbId, order, content }
  interface ChainMember { questId: string; dbId: any; order: number; content: string }
  const chains = new Map<string, ChainMember[]>();
  const questContentById = new Map<string, { dbId: any; content: string }>();

  for (const q of allQuests) {
    if (!q.content) continue;
    const idMatch = q.content.match(/quest\(\s*(\w+)/);
    if (!idMatch) continue;
    const questId = idMatch[1];
    questContentById.set(questId, { dbId: q._id, content: q.content });

    const chainMatch = q.content.match(/quest_chain\(\s*\w+\s*,\s*(\w+)\s*\)/);
    const orderMatch = q.content.match(/quest_chain_order\(\s*\w+\s*,\s*(\d+)\s*\)/);
    if (chainMatch) {
      const chainId = chainMatch[1];
      const order = orderMatch ? parseInt(orderMatch[1]) : 0;
      if (!chains.has(chainId)) chains.set(chainId, []);
      chains.get(chainId)!.push({ questId, dbId: q._id, order, content: q.content });
    }
  }

  console.log(`Found ${chains.size} quest chains:`);
  for (const [chainId, members] of chains) {
    members.sort((a, b) => a.order - b.order);
    console.log(`  ${chainId}: ${members.map(m => m.questId + '(' + m.order + ')').join(' → ')}`);
  }

  // ── Step 2: Set prerequisites for chain quests ─────────────────────────
  let prereqsAdded = 0;
  for (const [chainId, members] of chains) {
    for (let i = 1; i < members.length; i++) {
      const prev = members[i - 1];
      const curr = members[i];

      // Check if prerequisite already exists
      const hasPrereq = curr.content.includes(`quest_prerequisite(${curr.questId}, ${prev.questId})`);
      if (hasPrereq) continue;

      // Replace 'none' prerequisite with the previous quest in the chain
      let newContent = curr.content.replace(
        new RegExp(`quest_prerequisite\\(${curr.questId},\\s*none\\)\\.`),
        `quest_prerequisite(${curr.questId}, ${prev.questId}).`
      );

      // If no 'none' prerequisite was found, insert one before quest_reward
      if (newContent === curr.content) {
        const insertPoint = newContent.indexOf('quest_reward(');
        if (insertPoint > 0) {
          newContent = newContent.slice(0, insertPoint) +
            `quest_prerequisite(${curr.questId}, ${prev.questId}).\n\n` +
            newContent.slice(insertPoint);
        }
      }

      // Also update quest_available rule to check prerequisite
      newContent = newContent.replace(
        new RegExp(`quest_available\\(Player, ${curr.questId}\\) :-\\n\\s*quest\\(${curr.questId}, _, _, _, \\w+\\)\\.`),
        `quest_available(Player, ${curr.questId}) :-\n    quest(${curr.questId}, _, _, _, _),\n    quest_status(Player, ${prev.questId}, completed).`
      );

      if (newContent !== curr.content) {
        curr.content = newContent;
        prereqsAdded++;
        if (!DRY_RUN) {
          await questsCollection.updateOne({ _id: curr.dbId }, { $set: { content: newContent } });
        }
        console.log(`  ✓ ${curr.questId} now requires ${prev.questId}`);
      }
    }
  }
  console.log(`\nPrerequisites added: ${prereqsAdded}`);

  // ── Step 3: Fix status — only first-in-chain + assessment = active ────
  let statusFixed = 0;
  const firstInChain = new Set<string>();
  for (const [, members] of chains) {
    if (members.length > 0) firstInChain.add(members[0].questId);
  }

  for (const q of allQuests) {
    if (!q.content) continue;
    const idMatch = q.content.match(/quest\(\s*(\w+)/);
    if (!idMatch) continue;
    const questId = idMatch[1];

    const isAssessment = q.content.includes('quest_tag(') && q.content.includes(', assessment)');
    const isFirstInChain = firstInChain.has(questId);
    const hasPrereq = q.content.includes('quest_prerequisite(') && !q.content.includes(', none).');
    const isTier0 = q.content.includes(', tier_0)');

    // Determine correct initial status
    let correctStatus: string;
    if (isAssessment && q.content.includes(', arrival)')) {
      correctStatus = 'active'; // Arrival assessment starts active
    } else if (isAssessment) {
      correctStatus = 'unavailable'; // Departure assessment unlocks later
    } else if (isFirstInChain || isTier0) {
      correctStatus = 'available'; // First quest in chain or tier 0 guild quest
    } else if (hasPrereq) {
      correctStatus = 'unavailable'; // Has prerequisites, must unlock
    } else {
      correctStatus = 'available'; // Standalone quest, available from start
    }

    // Check current status in content
    const statusMatch = q.content.match(/quest\(\s*\w+\s*,\s*'[^']*'\s*,\s*\w+\s*,\s*\w+\s*,\s*(\w+)\s*\)/);
    const currentStatus = statusMatch?.[1] || q.status || 'unavailable';

    if (currentStatus !== correctStatus) {
      let newContent = q.content.replace(
        /quest\((\s*\w+\s*,\s*'[^']*'\s*,\s*\w+\s*,\s*\w+\s*,\s*)\w+(\s*\))/,
        `quest($1${correctStatus}$2)`
      );

      if (newContent !== q.content) {
        statusFixed++;
        if (!DRY_RUN) {
          await questsCollection.updateOne({ _id: q._id }, {
            $set: { content: newContent, status: correctStatus }
          });
        }
        console.log(`  ${questId}: ${currentStatus} → ${correctStatus}`);
      }
    }
  }
  console.log(`\nStatus fixed: ${statusFixed}`);

  // ── Step 4: Fix guild quest tiers ──────────────────────────────────────
  let guildFixed = 0;
  for (const q of allQuests) {
    if (!q.content) continue;
    const isTier2 = q.content.includes(', tier_2)');
    const isTier3 = q.content.includes(', tier_3)');

    if (!isTier2 && !isTier3) continue;

    const statusMatch = q.content.match(/quest\(\s*\w+\s*,\s*'[^']*'\s*,\s*\w+\s*,\s*\w+\s*,\s*(\w+)\s*\)/);
    const currentStatus = statusMatch?.[1] || '';

    if (currentStatus === 'available' || currentStatus === 'active') {
      let newContent = q.content.replace(
        /quest\((\s*\w+\s*,\s*'[^']*'\s*,\s*\w+\s*,\s*\w+\s*,\s*)\w+(\s*\))/,
        `quest($1unavailable$2)`
      );
      if (newContent !== q.content) {
        guildFixed++;
        if (!DRY_RUN) {
          await questsCollection.updateOne({ _id: q._id }, {
            $set: { content: newContent, status: 'unavailable' }
          });
        }
        const idMatch = q.content.match(/quest\(\s*(\w+)/);
        console.log(`  Guild quest ${idMatch?.[1]}: ${currentStatus} → unavailable`);
      }
    }
  }
  console.log(`\nGuild tier 2/3 quests locked: ${guildFixed}`);

  console.log(`\n=== Done ===\n`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
