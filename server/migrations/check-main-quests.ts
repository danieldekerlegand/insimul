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
  const quests = await db.collection('quests').find({
    $or: [{ questType: 'main_quest' }, { tags: 'main_quest' }]
  }).toArray();
  console.log('Main quest records:', quests.length);
  for (const q of quests) {
    console.log(`  ${q.title} | tags: ${(q.tags || []).join(', ')} | status: ${q.status}`);
  }
  await mongoose.disconnect();
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
