#!/usr/bin/env tsx
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
dotenv.config({ path: path.resolve(dirname(fileURLToPath(import.meta.url)), '../../.env') });

import { storage } from '../db/storage.js';
import { mongoQuestStorage } from '../db/mongo-quest-storage.js';
import { MAIN_QUEST_CHAPTERS } from '../../shared/quest/main-quest-chapters.js';
import { createMainQuestRecord } from '../../shared/quests/main-quest-records.js';

async function run() {
  const worldId = '69c7f646ffaa372a57a04123';

  // Load narrative for context
  const truths = await storage.getTruthsByWorld(worldId);
  const narrativeTruth = truths.find((t: any) => t.entryType === 'world_narrative');
  let narrative: any = null;
  if (narrativeTruth?.content) {
    try { narrative = JSON.parse(narrativeTruth.content); } catch {}
  }

  const settlements = await storage.getSettlementsByWorld(worldId);
  const resolveVars = (text: string | undefined) => {
    if (!text) return text;
    return text
      .replace(/\{\{writer_name\|([^}]*)\}\}/g, (_, fb) => narrative?.writerName || fb)
      .replace(/\{\{settlement_name\|([^}]*)\}\}/g, (_, fb) => settlements[0]?.name || fb)
      .replace(/\{WRITER\}/g, narrative?.writerName || 'the writer')
      .replace(/\{SETTLEMENT\}/g, settlements[0]?.name || 'the settlement');
  };

  let created = 0;
  for (const chapter of MAIN_QUEST_CHAPTERS) {
    const narrativeCtx = narrative?.chapters?.find((ch: any) => ch.chapterId === chapter.id);
    try {
      await createMainQuestRecord(
        mongoQuestStorage, worldId, 'Player', chapter, 'French',
        narrativeCtx ? {
          introNarrative: resolveVars(narrativeCtx.introNarrative),
          outroNarrative: resolveVars(narrativeCtx.outroNarrative),
          mysteryDetails: resolveVars(narrativeCtx.mysteryDetails),
          clueDescriptions: narrativeCtx.clueDescriptions?.map((c: any) => ({
            ...c, text: resolveVars(c.text),
          })),
        } : undefined,
      );
      created++;
      console.log(`✓ ${chapter.title}`);
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.code === 11000) {
        console.log(`  (exists) ${chapter.title}`);
      } else {
        console.log(`✗ ${chapter.title}: ${e.message}`);
      }
    }
  }
  console.log(`\nCreated ${created} main quest chapters`);
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
