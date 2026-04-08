#!/usr/bin/env tsx
/**
 * Migration 055: Drop the playtraces collection
 *
 * The playtraces collection was a separate MongoDB collection used to store
 * player action traces outside the save file document. This data was never
 * surfaced to users and the entire PlayTrace analytics pipeline has been removed.
 * Player activity is now tracked within the save file's currentState.
 *
 * Also cleans up any 'play_trace' entries in the truths collection that were
 * created by the old storage layer.
 *
 * Usage: npx tsx server/migrations/055-drop-playtraces-collection.ts [--dry-run]
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
  const uri = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) {
    console.error('No MONGO_URL, MONGODB_URI, or DATABASE_URL found in environment');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  console.log(`Connected to MongoDB${dryRun ? ' (DRY RUN)' : ''}`);

  // 1. Drop the playtraces collection
  const collections = await db.listCollections({ name: 'playtraces' }).toArray();
  if (collections.length > 0) {
    const count = await db.collection('playtraces').countDocuments();
    console.log(`Found playtraces collection with ${count} documents`);
    if (!dryRun) {
      await db.collection('playtraces').drop();
      console.log('Dropped playtraces collection');
    } else {
      console.log('[DRY RUN] Would drop playtraces collection');
    }
  } else {
    console.log('playtraces collection does not exist — nothing to drop');
  }

  // 2. Remove play_trace entries from the truths collection
  const truthsColl = db.collection('truths');
  const traceCount = await truthsColl.countDocuments({ entryType: 'play_trace' });
  if (traceCount > 0) {
    console.log(`Found ${traceCount} play_trace entries in truths collection`);
    if (!dryRun) {
      const result = await truthsColl.deleteMany({ entryType: 'play_trace' });
      console.log(`Deleted ${result.deletedCount} play_trace entries from truths`);
    } else {
      console.log(`[DRY RUN] Would delete ${traceCount} play_trace entries from truths`);
    }
  } else {
    console.log('No play_trace entries in truths collection');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
