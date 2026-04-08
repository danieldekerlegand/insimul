#!/usr/bin/env tsx
/**
 * Migration 059: Prolog-Based Quest Gating, Locations & Assessment Objectives
 *
 * Fixes three categories of quest data issues by rewriting Prolog content:
 *
 * 1. GATING: quest_available/2 rules + quest_prerequisite/2 facts
 *    - Main quest chapters: linear chain, ch1 requires arrival assessment
 *    - Guild quests: tiered within each guild (tier N requires tier N-1)
 *    - Chain quests: predecessor must be completed
 *    - Seed quests: CEFR-gated by difficulty (beginner=A1, intermediate=A2, advanced=B1)
 *    - Status set to 'unavailable' for gated quests
 *
 * 2. LOCATIONS: quest_location/2 — map quests to appropriate settlement locations
 *    - Guild quests → guild building
 *    - Commerce quests → marketplace
 *    - Exploration quests → settlement
 *    - Main quest chapters → settlement (procedural locations for narrative quests)
 *
 * 3. ASSESSMENT OBJECTIVES: Fix arrival/departure to have per-phase objectives
 *    - Arrival: reading, writing, listening, conversation (4 objectives)
 *    - Departure: reading, writing, listening, conversation (4 objectives)
 *
 * Usage:
 *   npx tsx server/migrations/059-prolog-quest-gating.ts --dry-run
 *   npx tsx server/migrations/059-prolog-quest-gating.ts
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

// ── Guild → Location mapping ─────────────────────────────────────────────
const GUILD_LOCATIONS: Record<string, string> = {
  guild_marchands: "Bergeron's La Guilde des Marchands",
  guild_artisans: "Sonnier's La Guilde des Artisans",
  guild_conteurs: "Bergeron's La Guilde des Conteurs",
  guild_explorateurs: "Robichaux's La Guilde des Explorateurs",
  guild_diplomates: "Bégnaud's La Guilde des Diplomates",
};

// ── Quest type → location strategy ───────────────────────────────────────
function inferLocation(tags: string[], questType: string, _settlement: string): string {
  // Guild quests → guild building
  for (const [guild, loc] of Object.entries(GUILD_LOCATIONS)) {
    if (tags.includes(guild)) return loc;
  }
  // Commerce quests → marketplace
  if (tags.includes('commerce') || tags.includes('market') || tags.includes('food')) {
    return "Bergeron's La Guilde des Marchands";
  }
  // Reading/storytelling → library/conteurs
  if (tags.includes('reading') || tags.includes('storytelling')) {
    return "Bergeron's La Guilde des Conteurs";
  }
  // Navigation/exploration → explorateurs or settlement
  if (tags.includes('navigation') || tags.includes('directions') || tags.includes('exploration')) {
    return "Robichaux's La Guilde des Explorateurs";
  }
  // Social/conversation → diplomates
  if (tags.includes('social') && !tags.includes('seed')) {
    return "Bégnaud's La Guilde des Diplomates";
  }
  // Generic seed quests — use settlement
  if (questType === 'conversation' || questType === 'social') return 'any_npc';
  if (questType === 'exploration') return _settlement;
  return 'anywhere';
}

// ── Assessment objective builder ─────────────────────────────────────────
function buildAssessmentObjectives(prefix: 'arrival' | 'departure', questId: string): string {
  const phases = [
    { id: `${prefix}_reading`, type: 'reading', desc: 'Complete the reading comprehension exercise', trigger: 'reading_completed' },
    { id: `${prefix}_writing`, type: 'writing', desc: 'Complete the writing assessment', trigger: 'writing_submitted' },
    { id: `${prefix}_listening`, type: 'listening', desc: 'Complete the listening comprehension exercise', trigger: 'listening_completed' },
    { id: `${prefix}_conversation`, type: 'conversation', desc: 'Complete the conversation assessment', trigger: 'conversation_assessment_completed' },
  ];

  const lines: string[] = [];
  phases.forEach((p, i) => {
    lines.push(`quest_objective(${questId}, ${i}, assessment_phase('${p.id}', '${p.trigger}')).`);
    lines.push(`quest_objective_location(${questId}, ${i}, anywhere).`);
  });
  return lines.join('\n');
}

// ── Content rewriter ─────────────────────────────────────────────────────
function rewriteContent(
  content: string,
  questId: string,
  opts: {
    prereqs: string[];
    extraConditions: string[];
    status: string;
    location?: string;
    newObjectives?: string;
  },
): string {
  let c = content;

  // Fix double-paren syntax errors
  c = c.replace(/quest\((\s*\w+\s*,\s*(?:'(?:[^'\\]|\\.)*'|[^,)]+)\s*,\s*\w+\s*,\s*\w+\s*,\s*\w+\s*)\)\)\./g, 'quest($1).');

  // Update status in quest/5 fact
  c = c.replace(
    /quest\((\s*\w+\s*,\s*(?:'(?:[^'\\]|\\.)*'|[^,)]+)\s*,\s*\w+\s*,\s*\w+\s*,\s*)\w+(\s*\)\.)/,
    `quest($1${opts.status}$2)`
  );

  // Update quest_location
  if (opts.location) {
    const locAtom = opts.location.includes("'") || opts.location.includes(' ')
      ? `'${opts.location.replace(/'/g, "\\'")}'`
      : opts.location;
    c = c.replace(
      /quest_location\(\s*\w+\s*,\s*(?:'(?:[^'\\]|\\.)*'|\w+)\s*\)\./,
      `quest_location(${questId}, ${locAtom}).`
    );
  }

  // Replace objectives if new ones provided
  if (opts.newObjectives) {
    c = c.replace(/quest_objective\(\s*\w+\s*,\s*\d+\s*,\s*.*?\)\.\n?/g, '');
    c = c.replace(/quest_objective_location\(\s*\w+\s*,\s*\d+\s*,\s*.*?\)\.\n?/g, '');
    // Insert new objectives before quest_completion or quest_prerequisite
    const insertPoint = c.search(/quest_completion\(|quest_prerequisite\(/);
    if (insertPoint > 0) {
      c = c.slice(0, insertPoint) + opts.newObjectives + '\n\n' + c.slice(insertPoint);
    }
  }

  // Replace all quest_prerequisite facts
  c = c.replace(/quest_prerequisite\(\s*\w+\s*,\s*\w+\s*\)\.\n?/g, '');
  const prereqFacts = opts.prereqs.length > 0
    ? opts.prereqs.map(p => `quest_prerequisite(${questId}, ${p}).`).join('\n')
    : `quest_prerequisite(${questId}, none).`;

  // Remove existing quest_available rule
  c = c.replace(
    /% Can Player take this quest\?\n?quest_available\(Player,\s*\w+\)\s*:-[\s\S]*?\.\n?/m,
    ''
  );
  c = c.replace(
    /quest_available\(Player,\s*\w+\)\s*:-[\s\S]*?\.\n?/m,
    ''
  );

  // Build availability conditions
  const conditions = [`quest(${questId}, _, _, _, _)`];
  for (const p of opts.prereqs) {
    conditions.push(`quest_status(Player, ${p}, completed)`);
  }
  conditions.push(...opts.extraConditions);

  // Build the new block
  const newBlock = [
    prereqFacts,
    '',
    '% Can Player take this quest?',
    `quest_available(Player, ${questId}) :-`,
    `    ${conditions.join(',\n    ')}.`,
    '',
  ].join('\n');

  // Insert before quest_complete
  const insertPoint = c.indexOf('% Check if quest is complete');
  if (insertPoint > 0) {
    c = c.slice(0, insertPoint) + newBlock + c.slice(insertPoint);
  } else {
    c = c.trimEnd() + '\n\n' + newBlock;
  }

  // Clean up
  c = c.replace(/\n{3,}/g, '\n\n');
  return c;
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== Migration 059: Quest Gating + Locations + Assessment Objectives ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db!;
  const coll = db.collection('quests');
  const allQuests = await coll.find({}).toArray();

  // Get settlement name
  const settlement = await db.collection('settlements').findOne({});
  const settlementName = settlement?.name || 'Grand-Pre';
  console.log(`Settlement: ${settlementName}\n`);

  // ── Parse quests ─────────────────────────────────────────────────────
  interface QInfo {
    dbId: any;
    questId: string;
    tags: string[];
    difficulty: string;
    questType: string;
    chainId: string | null;
    chainOrder: number;
    content: string;
    guild: string | null;
    tier: number | null;
  }

  const quests: QInfo[] = [];
  const chains = new Map<string, QInfo[]>();
  const guilds = new Map<string, Map<number, QInfo[]>>();

  for (const q of allQuests) {
    if (!q.content) continue;
    const questId = q.content.match(/quest\(\s*(\w+)/)?.[1];
    if (!questId) continue;

    const tags = [...q.content.matchAll(/quest_tag\(\s*\w+\s*,\s*(\w+)\s*\)/g)].map(m => m[1]);
    const diffM = q.content.match(/quest\(\s*\w+\s*,\s*(?:'(?:[^'\\]|\\.)*'|[^,)]+)\s*,\s*\w+\s*,\s*(\w+)\s*,/);
    const difficulty = diffM?.[1] || 'beginner';
    const typeM = q.content.match(/quest\(\s*\w+\s*,\s*(?:'(?:[^'\\]|\\.)*'|[^,)]+)\s*,\s*(\w+)\s*,/);
    const questType = typeM?.[1] || 'conversation';
    const chainId = q.content.match(/quest_chain\(\s*\w+\s*,\s*(\w+)\s*\)/)?.[1] || null;
    const chainOrder = parseInt(q.content.match(/quest_chain_order\(\s*\w+\s*,\s*(\d+)/)?.[1] || '0');
    const guild = tags.find(t => t.startsWith('guild_') && !t.includes('seed')) || null;
    const tierTag = tags.find(t => /^tier_\d+$/.test(t));
    const tier = tierTag ? parseInt(tierTag.replace('tier_', '')) : null;

    const info: QInfo = { dbId: q._id, questId, tags, difficulty, questType, chainId, chainOrder, content: q.content, guild, tier };
    quests.push(info);

    if (chainId) {
      if (!chains.has(chainId)) chains.set(chainId, []);
      chains.get(chainId)!.push(info);
    }
    if (guild && tier !== null) {
      if (!guilds.has(guild)) guilds.set(guild, new Map());
      const tiers = guilds.get(guild)!;
      if (!tiers.has(tier)) tiers.set(tier, []);
      tiers.get(tier)!.push(info);
    }
  }

  for (const members of chains.values()) members.sort((a, b) => a.chainOrder - b.chainOrder);

  // Identify main quest chapters
  const chapterQuests = quests
    .filter(q => q.tags.includes('main_quest') && q.tags.some(t => /^chapter_\d+$/.test(t)))
    .sort((a, b) => {
      const aNum = parseInt(a.tags.find(t => /^chapter_\d+$/.test(t))!.replace('chapter_', ''));
      const bNum = parseInt(b.tags.find(t => /^chapter_\d+$/.test(t))!.replace('chapter_', ''));
      return aNum - bNum;
    });

  const firstInChain = new Set<string>();
  for (const members of chains.values()) {
    if (members.length > 0) firstInChain.add(members[0].questId);
  }

  console.log(`Parsed ${quests.length} quests, ${chains.size} chains, ${guilds.size} guilds`);
  console.log(`Main chapters: ${chapterQuests.map(q => q.questId).join(' → ')}\n`);

  // ── Apply gating + locations + objectives ────────────────────────────
  let updated = 0;

  for (const q of quests) {
    const isArrivalAssessment = q.tags.includes('assessment') && q.tags.includes('arrival');
    const isDepartureAssessment = q.tags.includes('assessment') && q.tags.includes('departure');
    const isMainChapter = chapterQuests.includes(q);
    const isChainMember = !!q.chainId;
    const isGuildQuest = q.guild !== null && q.tier !== null;

    let prereqs: string[] = [];
    let extraConditions: string[] = [];
    let status = 'available';
    let newObjectives: string | undefined;

    // ── Gating ─────────────────────────────────────────────────────────

    if (isArrivalAssessment) {
      status = 'active';
      // Fix objectives to have per-phase entries
      newObjectives = buildAssessmentObjectives('arrival', q.questId);
    } else if (isDepartureAssessment) {
      status = 'unavailable';
      newObjectives = buildAssessmentObjectives('departure', q.questId);
    } else if (isMainChapter) {
      const idx = chapterQuests.indexOf(q);
      if (idx === 0) {
        const arrival = quests.find(q2 => q2.tags.includes('assessment') && q2.tags.includes('arrival'));
        if (arrival) { prereqs = [arrival.questId]; status = 'unavailable'; }
      } else {
        prereqs = [chapterQuests[idx - 1].questId];
        status = 'unavailable';
      }
    } else if (isChainMember) {
      const members = chains.get(q.chainId!)!;
      const idx = members.indexOf(q);
      if (idx > 0) {
        prereqs = [members[idx - 1].questId];
        status = 'unavailable';
      }
    } else if (isGuildQuest) {
      if (q.tier! > 0) {
        const prevTierQuests = guilds.get(q.guild!)?.get(q.tier! - 1) || [];
        if (prevTierQuests.length > 0) {
          prereqs = [prevTierQuests[0].questId];
          status = 'unavailable';
        }
      }
    } else if (q.tags.includes('seed')) {
      if (q.difficulty === 'intermediate') {
        extraConditions.push('player_meets_cefr(Player, a2)');
        status = 'unavailable';
      } else if (q.difficulty === 'advanced') {
        extraConditions.push('player_meets_cefr(Player, b1)');
        status = 'unavailable';
      }
    }

    // ── Location ───────────────────────────────────────────────────────
    // Only override if currently 'anywhere'
    const currentLoc = q.content.match(/quest_location\(\s*\w+\s*,\s*(\w+)\s*\)/)?.[1];
    let location: string | undefined;
    if (currentLoc === 'anywhere') {
      const inferred = inferLocation(q.tags, q.questType, settlementName);
      if (inferred !== 'anywhere') {
        location = inferred;
      }
    }

    // ── Rewrite content ────────────────────────────────────────────────
    const newContent = rewriteContent(q.content, q.questId, {
      prereqs, extraConditions, status, location, newObjectives,
    });

    if (newContent !== q.content) {
      updated++;
      if (!DRY_RUN) {
        await coll.updateOne({ _id: q.dbId }, { $set: { content: newContent, status } });
      }
      const changes: string[] = [];
      if (prereqs.length) changes.push(`prereqs=${prereqs.join(',')}`);
      if (extraConditions.length) changes.push(`cefr=${extraConditions.join(',')}`);
      if (location) changes.push(`loc=${location}`);
      if (newObjectives) changes.push('objectives=rebuilt');
      console.log(`  ${q.questId}: ${status} [${changes.join(', ') || 'status only'}]`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────
  if (!DRY_RUN) {
    const dbCounts: Record<string, number> = {};
    const final = await coll.find({}).project({ status: 1 }).toArray();
    for (const q of final) { dbCounts[q.status || 'unknown'] = (dbCounts[q.status || 'unknown'] || 0) + 1; }
    console.log(`\nFinal status distribution:`, dbCounts);
  }

  console.log(`\nUpdated: ${updated} quests${DRY_RUN ? ' (dry run)' : ''}`);
  console.log(`=== Done ===\n`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
