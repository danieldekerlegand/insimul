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
  const mongoUrl = process.env.MONGO_URL!;
  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db!;

  const collections = await db.listCollections().toArray();
  const results: string[] = [];
  for (const col of collections.sort((a, b) => a.name.localeCompare(b.name))) {
    const count = await db.collection(col.name).countDocuments();
    results.push(`${col.name}: ${count}`);
  }
  console.log(results.join('\n'));
  console.log(`\nTotal: ${collections.length} collections`);
  await mongoose.disconnect();
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
