#!/usr/bin/env tsx
/**
 * Migration 058: Fix chain prerequisites and quest status (robust version)
 *
 * Directly patches quest Prolog content to:
 * 1. Link chain quests with proper quest_prerequisite facts
 * 2. Set non-first chain quests to 'unavailable'
 * 3. Set quests that have prerequisites to 'unavailable'
 * 4. Fix any malformed quest/5 facts (double parens, etc.)
 *
 * Usage:
 *   npx tsx server/migrations/058-fix-chain-prereqs-and-status.ts --dry-run
 *   npx tsx server/migrations/058-fix-chain-prereqs-and-status.ts
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
  console.log(`\n=== Migration 058: Fix Chain Prerequisites & Status ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db!;
  const coll = db.collection('quests');
  const allQuests = await coll.find({}).toArray();

  // ── Parse all quest content ────────────────────────────────────────────
  interface QuestInfo {
    dbId: any;
    questId: string;
    chainId: string | null;
    chainOrder: number;
    tags: string[];
    prereqs: string[];
    status: string;
    content: string;
  }

  const questMap = new Map<string, QuestInfo>();
  const chains = new Map<string, QuestInfo[]>();

  for (const q of allQuests) {
    if (!q.content || typeof q.content !== 'string') continue;

    const idM = q.content.match(/quest\(\s*(\w+)/);
    if (!idM) continue;

    const questId = idM[1];
    const chainM = q.content.match(/quest_chain\(\s*\w+\s*,\s*(\w+)\s*\)/);
    const orderM = q.content.match(/quest_chain_order\(\s*\w+\s*,\s*(\d+)\s*\)/);
    const tagMs = [...q.content.matchAll(/quest_tag\(\s*\w+\s*,\s*(\w+)\s*\)/g)];
    const prereqMs = [...q.content.matchAll(/quest_prerequisite\(\s*\w+\s*,\s*(\w+)\s*\)/g)];
    // Extract status — handle malformed facts like `available)).`
    const statusM = q.content.match(/quest\(\s*\w+\s*,\s*(?:'(?:[^'\\]|\\.)*'|[^,]+)\s*,\s*\w+\s*,\s*\w+\s*,\s*(\w+)\s*\)/);

    const info: QuestInfo = {
      dbId: q._id,
      questId,
      chainId: chainM?.[1] || null,
      chainOrder: orderM ? parseInt(orderM[1]) : 0,
      tags: tagMs.map(m => m[1]),
      prereqs: prereqMs.map(m => m[1]).filter(p => p !== 'none'),
      status: statusM?.[1] || q.status || 'available',
      content: q.content,
    };

    questMap.set(questId, info);
    if (info.chainId) {
      if (!chains.has(info.chainId)) chains.set(info.chainId, []);
      chains.get(info.chainId)!.push(info);
    }
  }

  // Sort chain members by order
  for (const members of chains.values()) {
    members.sort((a, b) => a.chainOrder - b.chainOrder);
  }

  console.log(`Parsed ${questMap.size} quests, ${chains.size} chains\n`);

  // ── Step 1: Fix malformed quest/5 facts ────────────────────────────────
  let syntaxFixed = 0;
  for (const info of questMap.values()) {
    // Fix double closing parens: `available)).` → `available).`
    const fixed = info.content.replace(
      /quest\((\s*\w+\s*,\s*(?:'(?:[^'\\]|\\.)*'|[^,]+)\s*,\s*\w+\s*,\s*\w+\s*,\s*\w+\s*)\)\)\./,
      'quest($1).'
    );
    if (fixed !== info.content) {
      info.content = fixed;
      syntaxFixed++;
      console.log(`  Fixed syntax: ${info.questId}`);
    }
  }

  // ── Step 2: Set prerequisites from chain ordering ──────────────────────
  let prereqsSet = 0;
  for (const [chainId, members] of chains) {
    console.log(`\nChain: ${chainId}`);
    for (let i = 0; i < members.length; i++) {
      const curr = members[i];
      if (i === 0) {
        console.log(`  ${curr.questId} (order ${curr.chainOrder}) — first in chain`);
        continue;
      }
      const prev = members[i - 1];

      // Skip if already has this prerequisite
      if (curr.prereqs.includes(prev.questId)) {
        console.log(`  ${curr.questId} (order ${curr.chainOrder}) — already requires ${prev.questId}`);
        continue;
      }

      // Replace `quest_prerequisite(X, none).` with correct prerequisite
      let newContent = curr.content.replace(
        new RegExp(`quest_prerequisite\\(\\s*${curr.questId}\\s*,\\s*none\\s*\\)\\.`),
        `quest_prerequisite(${curr.questId}, ${prev.questId}).`
      );

      // If no 'none' was found (shouldn't happen), append the prerequisite
      if (newContent === curr.content) {
        // Insert before first quest_reward or quest_available
        const insertBefore = newContent.search(/quest_reward\(|quest_available\(/);
        if (insertBefore > 0) {
          newContent = newContent.slice(0, insertBefore) +
            `quest_prerequisite(${curr.questId}, ${prev.questId}).\n\n` +
            newContent.slice(insertBefore);
        }
      }

      // Update quest_available rule to require predecessor completion
      newContent = newContent.replace(
        new RegExp(`quest_available\\(Player,\\s*${curr.questId}\\)\\s*:-[\\s\\S]*?\\.`, 'm'),
        `quest_available(Player, ${curr.questId}) :-\n    quest(${curr.questId}, _, _, _, _),\n    quest_status(Player, ${prev.questId}, completed).`
      );

      curr.content = newContent;
      curr.prereqs = [prev.questId];
      prereqsSet++;
      console.log(`  ${curr.questId} (order ${curr.chainOrder}) → requires ${prev.questId}`);
    }
  }

  // ── Step 3: Set correct status ─────────────────────────────────────────
  let statusChanged = 0;
  const firstInChain = new Set<string>();
  for (const members of chains.values()) {
    if (members.length > 0) firstInChain.add(members[0].questId);
  }

  for (const info of questMap.values()) {
    const isArrivalAssessment = info.tags.includes('assessment') && info.tags.includes('arrival');
    const isFirstInChain = firstInChain.has(info.questId);
    const hasRealPrereqs = info.prereqs.length > 0;
    const isTier0 = info.tags.includes('tier_0');
    const isTier1 = info.tags.includes('tier_1');
    const isTier2 = info.tags.includes('tier_2');
    const isTier3 = info.tags.includes('tier_3');

    let correctStatus: string;
    if (isArrivalAssessment) {
      correctStatus = 'active';
    } else if (hasRealPrereqs || isTier2 || isTier3) {
      correctStatus = 'unavailable';
    } else if (isFirstInChain || isTier0 || isTier1) {
      correctStatus = 'available';
    } else {
      correctStatus = 'available'; // standalone quests
    }

    if (info.status !== correctStatus) {
      // Update status in the quest/5 fact
      info.content = info.content.replace(
        /quest\((\s*\w+\s*,\s*(?:'(?:[^'\\]|\\.)*'|[^,]+)\s*,\s*\w+\s*,\s*\w+\s*,\s*)\w+(\s*\))/,
        `quest($1${correctStatus}$2)`
      );
      info.status = correctStatus;
      statusChanged++;
    }
  }

  // ── Step 4: Write changes ──────────────────────────────────────────────
  let written = 0;
  for (const info of questMap.values()) {
    const orig = allQuests.find(q => q._id.equals(info.dbId));
    if (orig && orig.content !== info.content) {
      written++;
      if (!DRY_RUN) {
        await coll.updateOne({ _id: info.dbId }, {
          $set: { content: info.content, status: info.status }
        });
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Syntax fixed: ${syntaxFixed}`);
  console.log(`Prerequisites set: ${prereqsSet}`);
  console.log(`Status changed: ${statusChanged}`);
  console.log(`Documents written: ${written}${DRY_RUN ? ' (dry run)' : ''}`);
  console.log();

  // Print final status counts
  const counts: Record<string, number> = {};
  for (const info of questMap.values()) {
    counts[info.status] = (counts[info.status] || 0) + 1;
  }
  console.log('Final status distribution:', counts);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
