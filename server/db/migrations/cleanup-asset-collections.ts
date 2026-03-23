/**
 * Migration: Clean up asset collections
 *
 * 1. Rename "French Louisiana" collections → "Creole Colonial" (name + worldType)
 * 2. Delete the generic "Historical" asset collection (redundant with historical-ancient)
 * 3. Delete the "Western Frontier" asset collection (redundant with wild-west)
 *
 * Usage:
 *   npx tsx server/db/migrations/cleanup-asset-collections.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import mongoose, { Schema } from 'mongoose';

const AssetCollectionSchema = new Schema({}, { strict: false });
const AssetCollectionModel = mongoose.model('AssetCollection', AssetCollectionSchema, 'assetcollections');

async function run() {
  const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/insimul';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);

  // ── 1. Rename French Louisiana → Creole Colonial ──────────────────────────
  const frenchLouisianaDocs = await AssetCollectionModel.find({
    $or: [
      { name: /french.*louisiana/i },
      { worldType: 'french-louisiana' },
      { worldType: 'historical-french-colonial' },
    ],
  });

  for (const doc of frenchLouisianaDocs) {
    const data = doc.toObject() as any;
    console.log(`Renaming "${data.name}" (worldType: ${data.worldType}) → "Creole Colonial"`);

    await AssetCollectionModel.updateOne(
      { _id: doc._id },
      {
        $set: {
          name: data.name.replace(/french\s*louisiana/i, 'Creole Colonial'),
          worldType: 'creole-colonial',
        },
      },
    );
    console.log(`  ✓ Renamed to Creole Colonial`);
  }

  if (frenchLouisianaDocs.length === 0) {
    console.log('No French Louisiana collections found to rename.');
  }

  // ── 2. Delete generic "Historical" asset collection ────────────────────────
  // Match collections named exactly "Historical" or with worldType "historical"
  // but NOT historical-ancient, historical-medieval, etc.
  const historicalDocs = await AssetCollectionModel.find({
    $or: [
      { name: /^Historical$/i },
      { name: /^Historical\s+(Base|Default|Collection)$/i },
      { worldType: 'historical' },
    ],
  });

  for (const doc of historicalDocs) {
    const data = doc.toObject() as any;
    // Safety: don't delete if the worldType is a specific historical subtype
    if (data.worldType && data.worldType.startsWith('historical-')) {
      console.log(`  Skipping "${data.name}" (worldType: ${data.worldType}) — specific historical subtype`);
      continue;
    }
    console.log(`Deleting "${data.name}" (worldType: ${data.worldType})`);
    await AssetCollectionModel.deleteOne({ _id: doc._id });
    console.log(`  ✓ Deleted`);
  }

  if (historicalDocs.length === 0) {
    console.log('No generic "Historical" collections found to delete.');
  }

  // ── 3. Delete "Western Frontier" asset collection ──────────────────────────
  const westernDocs = await AssetCollectionModel.find({
    $or: [
      { name: /western\s*frontier/i },
      { worldType: 'western-frontier' },
    ],
  });

  for (const doc of westernDocs) {
    const data = doc.toObject() as any;
    console.log(`Deleting "${data.name}" (worldType: ${data.worldType})`);
    await AssetCollectionModel.deleteOne({ _id: doc._id });
    console.log(`  ✓ Deleted`);
  }

  if (westernDocs.length === 0) {
    console.log('No "Western Frontier" collections found to delete.');
  }

  console.log('\nDone.');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
