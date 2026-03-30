#!/usr/bin/env tsx
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URL!);
  const db = mongoose.connection.db!;

  const pts = await db.collection('playthroughs').find({}).toArray();
  console.log(`Playthroughs in DB: ${pts.length}`);
  for (const pt of pts) {
    console.log(`  ${pt._id} — ${pt.name || '(unnamed)'} — worldId: ${pt.worldId}`);
  }

  const truthPtIds = await db.collection('truths').distinct('playthroughId', { playthroughId: { $ne: null } });
  console.log(`\nDistinct playthroughIds in truths: ${truthPtIds.length}`);
  const ptIdSet = new Set(pts.map(p => p._id.toString()));
  for (const ptId of truthPtIds) {
    const exists = ptIdSet.has(String(ptId));
    const count = await db.collection('truths').countDocuments({ playthroughId: ptId });
    console.log(`  ${ptId} — ${count} truths — playthrough ${exists ? 'EXISTS' : 'MISSING'}`);
  }

  await mongoose.disconnect();
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
