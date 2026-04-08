/**
 * Backfill Prolog content for all Actions and Quests in the database.
 *
 * This script regenerates the `content` field (Prolog source) for every
 * action and quest that is missing it.
 *
 * Usage: npx tsx server/scripts/backfill-prolog-content.ts
 *        npx tsx server/scripts/backfill-prolog-content.ts --force   # regenerate ALL, not just missing
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { convertActionToProlog } from '../../shared/prolog/action-converter.js';
import { convertQuestToProlog } from '../../shared/prolog/quest-converter.js';
import { hydrateActionFromProlog } from '../../shared/prolog/action-hydrator.js';
import { hydrateQuestFromProlog } from '../../shared/prolog/quest-hydrator.js';

dotenv.config();

const FORCE_REGENERATE = process.argv.includes('--force');

async function backfillPrologContent() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';

  try {
    if (FORCE_REGENERATE) console.log('⚡ FORCE mode: regenerating ALL Prolog content\n');
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
      if (action.content && !FORCE_REGENERATE) {
        actionsSkipped++;
        continue;
      }
      try {
        // Hydrate fields from existing content before re-converting
        hydrateActionFromProlog(action);
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
      if (quest.content && !FORCE_REGENERATE) {
        questsSkipped++;
        continue;
      }
      try {
        // Hydrate fields from existing content before re-converting
        hydrateQuestFromProlog(quest);
        const cleanQuest = { ...quest };
        // Remove chain references from assessment quests (US-009: assessments are self-contained)
        if (cleanQuest.tags?.includes('assessment') || cleanQuest.questType === 'assessment') {
          delete cleanQuest.questChainId;
          delete cleanQuest.questChainOrder;
        }
        // Fix 'unassigned' placeholder — use 'player'
        if (cleanQuest.assignedTo === 'unassigned') {
          cleanQuest.assignedTo = 'player';
        }
        // Derive locationName from objectives if not set on the quest
        if (!cleanQuest.locationName && !cleanQuest.locationId) {
          const objectives = cleanQuest.objectives || [];
          for (const obj of objectives) {
            const locName = obj.locationName || obj.target || obj.location;
            if (locName && (obj.type === 'visit_location' || obj.type === 'discover_location')) {
              cleanQuest.locationName = locName;
              break;
            }
          }
          // Fall back to customData or settlement name from world
          if (!cleanQuest.locationName && cleanQuest.customData?.locationName) {
            cleanQuest.locationName = cleanQuest.customData.locationName;
          }
        }
        const result = convertQuestToProlog(cleanQuest as any);
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
