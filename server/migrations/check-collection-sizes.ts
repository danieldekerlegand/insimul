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
  const collections = await db.listCollections().toArray();
  const results: Array<{ name: string; count: number; sizeMB: string }> = [];
  for (const col of collections.sort((a, b) => a.name.localeCompare(b.name))) {
    const count = await db.collection(col.name).countDocuments();
    results.push({ name: col.name, count, sizeMB: '?' });
  }
  console.log('Collection               Count    Size(MB)');
  console.log('─'.repeat(50));
  for (const r of results) {
    console.log(`${r.name.padEnd(25)} ${String(r.count).padStart(6)}    ${r.sizeMB.padStart(7)}`);
  }
  // Check truths by entryType
  console.log('\nTruths by entryType:');
  const truthTypes = await db.collection('truths').aggregate([
    { $group: { _id: '$entryType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  for (const t of truthTypes) {
    console.log(`  ${(t._id || 'null').padEnd(25)} ${t.count}`);
  }
  // Check indexes on truths
  const truthIndexes = await db.collection('truths').indexes();
  console.log('\nTruths indexes:');
  for (const idx of truthIndexes) {
    console.log(`  ${JSON.stringify(idx.key)}`);
  }
  await mongoose.disconnect();
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
