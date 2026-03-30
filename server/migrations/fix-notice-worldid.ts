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
  const result = await db.collection('gametexts').updateMany(
    { worldId: null },
    { $set: { worldId: '69c7f646ffaa372a57a04123' } }
  );
  console.log('Updated', result.modifiedCount, 'texts with worldId');
  await mongoose.disconnect();
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
