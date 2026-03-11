/**
 * Backfill Prolog content for all Actions and Quests in the database.
 *
 * This script regenerates the `content` field (Prolog source) for every
 * action and quest that is missing it.
 *
 * Usage: npx tsx server/scripts/backfill-prolog-content.ts
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { convertActionToProlog } from '../../shared/prolog/action-converter.js';
import { convertQuestToProlog } from '../../shared/prolog/quest-converter.js';

dotenv.config();

async function backfillPrologContent() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db!;

    // --- Actions ---
    const actionsCollection = db.collection('actions');
    const actions = await actionsCollection.find({}).toArray();
    let actionsConverted = 0;
    let actionsSkipped = 0;
    let actionsErrors: string[] = [];

    console.log(`Found ${actions.length} actions`);

    for (const action of actions) {
      if (action.content) {
        actionsSkipped++;
        continue;
      }
      try {
        const result = convertActionToProlog(action as any);
        if (result.prologContent) {
          await actionsCollection.updateOne(
            { _id: action._id },
            { $set: { content: result.prologContent }, $unset: { prologContent: '' } }
          );
          actionsConverted++;
        } else {
          actionsSkipped++;
        }
      } catch (err: any) {
        actionsErrors.push(`Action "${action.name}" (${action._id}): ${err.message || String(err)}`);
      }
    }

    console.log(`Actions: ${actionsConverted} converted, ${actionsSkipped} skipped, ${actionsErrors.length} errors`);
    if (actionsErrors.length > 0) {
      console.log('Action errors:', actionsErrors);
    }

    // Also clean up any leftover prologContent fields on actions that already have content
    const staleActions = await actionsCollection.updateMany(
      { content: { $ne: null }, prologContent: { $exists: true } },
      { $unset: { prologContent: '' } }
    );
    if (staleActions.modifiedCount > 0) {
      console.log(`Cleaned up ${staleActions.modifiedCount} stale prologContent fields on actions`);
    }

    // --- Quests ---
    const questsCollection = db.collection('quests');
    const quests = await questsCollection.find({}).toArray();
    let questsConverted = 0;
    let questsSkipped = 0;
    let questsErrors: string[] = [];

    console.log(`\nFound ${quests.length} quests`);

    for (const quest of quests) {
      if (quest.content) {
        questsSkipped++;
        continue;
      }
      try {
        const result = convertQuestToProlog(quest as any);
        if (result.prologContent) {
          await questsCollection.updateOne(
            { _id: quest._id },
            { $set: { content: result.prologContent } }
          );
          questsConverted++;
        } else {
          questsSkipped++;
        }
      } catch (err: any) {
        questsErrors.push(`Quest "${quest.title}" (${quest._id}): ${err.message || String(err)}`);
      }
    }

    console.log(`Quests: ${questsConverted} converted, ${questsSkipped} skipped, ${questsErrors.length} errors`);
    if (questsErrors.length > 0) {
      console.log('Quest errors:', questsErrors);
    }

    console.log('\nDone!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

backfillPrologContent();
