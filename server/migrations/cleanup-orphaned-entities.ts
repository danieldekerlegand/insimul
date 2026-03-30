#!/usr/bin/env tsx
/**
 * Cleanup orphaned businesses, residences, lots, occupations, and characters
 * whose parent settlement no longer exists in the database.
 *
 * Usage: npx tsx server/migrations/cleanup-orphaned-entities.ts [--dry-run]
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dryRun = process.argv.includes('--dry-run');

async function run() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!mongoUrl) {
    console.error('No MONGODB_URI or DATABASE_URL env var found');
    process.exit(1);
  }

  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db!;

  console.log(dryRun ? '🔍 DRY RUN — no deletions will be performed\n' : '🗑️  LIVE RUN — orphaned entities will be deleted\n');

  // Get all valid settlement IDs
  const settlements = await db.collection('settlements').find({}, { projection: { _id: 1 } }).toArray();
  const validSettlementIds = new Set(settlements.map(s => s._id.toString()));
  console.log(`Found ${validSettlementIds.size} existing settlements\n`);

  // Get all valid world IDs
  const worlds = await db.collection('worlds').find({}, { projection: { _id: 1 } }).toArray();
  const validWorldIds = new Set(worlds.map(w => w._id.toString()));
  console.log(`Found ${validWorldIds.size} existing worlds\n`);

  // Collections to check for orphaned settlementId
  const settlementChildCollections = [
    { name: 'businesses', field: 'settlementId' },
    { name: 'residences', field: 'settlementId' },
    { name: 'lots', field: 'settlementId' },
    { name: 'publicbuildings', field: 'settlementId' },
    { name: 'settlementhistoryevents', field: 'settlementId' },
    { name: 'waterfeatures', field: 'settlementId' },
  ];

  let totalOrphaned = 0;

  for (const { name, field } of settlementChildCollections) {
    const collection = db.collection(name);
    const allDocs = await collection.find({ [field]: { $exists: true, $ne: null } }, { projection: { _id: 1, [field]: 1 } }).toArray();
    const orphaned = allDocs.filter(doc => !validSettlementIds.has(String(doc[field])));

    if (orphaned.length > 0) {
      console.log(`${name}: ${orphaned.length} orphaned (of ${allDocs.length} total)`);
      if (!dryRun) {
        const ids = orphaned.map(d => d._id);
        const result = await collection.deleteMany({ _id: { $in: ids } });
        console.log(`  → Deleted ${result.deletedCount}`);
      }
      totalOrphaned += orphaned.length;
    } else {
      console.log(`${name}: 0 orphaned (of ${allDocs.length} total)`);
    }
  }

  // Characters: orphaned if currentLocation doesn't match any settlement, state, country, or world
  const states = await db.collection('states').find({}, { projection: { _id: 1 } }).toArray();
  const countries = await db.collection('countries').find({}, { projection: { _id: 1 } }).toArray();
  const validLocationIds = new Set([
    ...Array.from(validSettlementIds),
    ...Array.from(validWorldIds),
    ...states.map(s => s._id.toString()),
    ...countries.map(c => c._id.toString()),
  ]);

  const characters = await db.collection('characters').find(
    { currentLocation: { $exists: true, $ne: null } },
    { projection: { _id: 1, currentLocation: 1, firstName: 1, lastName: 1 } }
  ).toArray();
  const orphanedChars = characters.filter(c => !validLocationIds.has(String(c.currentLocation)));

  if (orphanedChars.length > 0) {
    console.log(`characters: ${orphanedChars.length} orphaned (of ${characters.length} total)`);
    if (!dryRun) {
      const ids = orphanedChars.map(c => c._id);
      const result = await db.collection('characters').deleteMany({ _id: { $in: ids } });
      console.log(`  → Deleted ${result.deletedCount}`);
    }
    totalOrphaned += orphanedChars.length;
  } else {
    console.log(`characters: 0 orphaned (of ${characters.length} total)`);
  }

  // Occupations: orphaned if businessId doesn't match any existing business
  const businessDocs = await db.collection('businesses').find({}, { projection: { _id: 1 } }).toArray();
  const validBusinessIds = new Set(businessDocs.map(b => b._id.toString()));

  const occupations = await db.collection('occupations').find(
    { businessId: { $exists: true, $ne: null } },
    { projection: { _id: 1, businessId: 1 } }
  ).toArray();
  const orphanedOccupations = occupations.filter(o => !validBusinessIds.has(String(o.businessId)));

  if (orphanedOccupations.length > 0) {
    console.log(`occupations: ${orphanedOccupations.length} orphaned (of ${occupations.length} total)`);
    if (!dryRun) {
      const ids = orphanedOccupations.map(o => o._id);
      const result = await db.collection('occupations').deleteMany({ _id: { $in: ids } });
      console.log(`  → Deleted ${result.deletedCount}`);
    }
    totalOrphaned += orphanedOccupations.length;
  } else {
    console.log(`occupations: 0 orphaned (of ${occupations.length} total)`);
  }

  // Containers: orphaned if worldId doesn't match any existing world
  const containers = await db.collection('containers').find(
    { worldId: { $exists: true, $ne: null } },
    { projection: { _id: 1, worldId: 1 } }
  ).toArray();
  const orphanedContainers = containers.filter(c => !validWorldIds.has(String(c.worldId)));

  if (orphanedContainers.length > 0) {
    console.log(`containers: ${orphanedContainers.length} orphaned (of ${containers.length} total)`);
    if (!dryRun) {
      const ids = orphanedContainers.map(c => c._id);
      const result = await db.collection('containers').deleteMany({ _id: { $in: ids } });
      console.log(`  → Deleted ${result.deletedCount}`);
    }
    totalOrphaned += orphanedContainers.length;
  } else {
    console.log(`containers: 0 orphaned (of ${containers.length} total)`);
  }

  // Truths: orphaned if characterId references a character that no longer exists
  const characterDocs = await db.collection('characters').find({}, { projection: { _id: 1 } }).toArray();
  const validCharacterIds = new Set(characterDocs.map(c => c._id.toString()));

  const truthsWithChar = await db.collection('truths').find(
    { characterId: { $exists: true, $ne: null } },
    { projection: { _id: 1, characterId: 1, title: 1 } }
  ).toArray();
  const orphanedTruths = truthsWithChar.filter(t => !validCharacterIds.has(String(t.characterId)));

  if (orphanedTruths.length > 0) {
    console.log(`truths (orphaned by character): ${orphanedTruths.length} orphaned (of ${truthsWithChar.length} with characterId)`);
    if (!dryRun) {
      const ids = orphanedTruths.map(t => t._id);
      const result = await db.collection('truths').deleteMany({ _id: { $in: ids } });
      console.log(`  → Deleted ${result.deletedCount}`);
    }
    totalOrphaned += orphanedTruths.length;
  } else {
    console.log(`truths (orphaned by character): 0 orphaned (of ${truthsWithChar.length} with characterId)`);
  }

  // Truths: orphaned if worldId references a world that no longer exists
  const truthsWithWorld = await db.collection('truths').find(
    { worldId: { $exists: true, $ne: null } },
    { projection: { _id: 1, worldId: 1 } }
  ).toArray();
  const orphanedWorldTruths = truthsWithWorld.filter(t => !validWorldIds.has(String(t.worldId)));

  if (orphanedWorldTruths.length > 0) {
    console.log(`truths (orphaned by world): ${orphanedWorldTruths.length} orphaned (of ${truthsWithWorld.length} with worldId)`);
    if (!dryRun) {
      const ids = orphanedWorldTruths.map(t => t._id);
      const result = await db.collection('truths').deleteMany({ _id: { $in: ids } });
      console.log(`  → Deleted ${result.deletedCount}`);
    }
    totalOrphaned += orphanedWorldTruths.length;
  } else {
    console.log(`truths (orphaned by world): 0 orphaned (of ${truthsWithWorld.length} with worldId)`);
  }

  // Truths: orphaned if playthroughId references a playthrough that no longer exists
  const playthroughDocs = await db.collection('playthroughs').find({}, { projection: { _id: 1 } }).toArray();
  const validPlaythroughIds = new Set(playthroughDocs.map(p => p._id.toString()));

  const truthsWithPlaythrough = await db.collection('truths').find(
    { playthroughId: { $exists: true, $ne: null } },
    { projection: { _id: 1, playthroughId: 1 } }
  ).toArray();
  const orphanedPtTruths = truthsWithPlaythrough.filter(t => !validPlaythroughIds.has(String(t.playthroughId)));

  if (orphanedPtTruths.length > 0) {
    console.log(`truths (orphaned by playthrough): ${orphanedPtTruths.length} orphaned (of ${truthsWithPlaythrough.length} with playthroughId)`);
    if (!dryRun) {
      const ids = orphanedPtTruths.map(t => t._id);
      const result = await db.collection('truths').deleteMany({ _id: { $in: ids } });
      console.log(`  → Deleted ${result.deletedCount}`);
    }
    totalOrphaned += orphanedPtTruths.length;
  } else {
    console.log(`truths (orphaned by playthrough): 0 orphaned (of ${truthsWithPlaythrough.length} with playthroughId)`);
  }

  console.log(`\n${dryRun ? '🔍 Would delete' : '✅ Deleted'} ${totalOrphaned} total orphaned entities`);

  await mongoose.disconnect();
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
