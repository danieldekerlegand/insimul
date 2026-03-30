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
  const items = await db.collection('items').find({ isBase: true }).limit(3).toArray();
  console.log(JSON.stringify(items.map(i => ({
    name: i.name, itemType: i.itemType, category: i.category, baseType: i.baseType,
    isBase: i.isBase, possessable: i.possessable, objectRole: i.objectRole, tags: i.tags,
    worldType: i.worldType
  })), null, 2));
  const count = await db.collection('items').countDocuments({ isBase: true });
  console.log('\nTotal base items:', count);

  // Check categories and types used
  const categories = await db.collection('items').distinct('category', { isBase: true });
  const itemTypes = await db.collection('items').distinct('itemType', { isBase: true });
  console.log('Categories:', categories);
  console.log('ItemTypes:', itemTypes);
  await mongoose.disconnect();
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
