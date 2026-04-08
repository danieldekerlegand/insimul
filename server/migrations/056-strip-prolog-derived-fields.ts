#!/usr/bin/env tsx
/**
 * Migration 056: Strip Prolog-Derived Fields from Quests and Actions
 *
 * Now that Prolog `content` is the single source of truth and the hydrators
 * populate all derived fields on read, we can remove the duplicate fields
 * from the MongoDB documents to reduce storage and eliminate drift.
 *
 * QUESTS — removes 25 fields derivable from Prolog content:
 *   title, description, questType, difficulty, targetLanguage,
 *   assignedTo, assignedBy, objectives, completionCriteria,
 *   experienceReward, moneyReward, rewards, itemRewards, skillRewards,
 *   unlocks, prerequisiteQuestIds, tags, questChainId, questChainOrder,
 *   parentQuestId, locationName, failureConditions, stages, currentStageId,
 *   conversationOnly
 *
 * ACTIONS — removes 15 fields derivable from Prolog content:
 *   actionType, category, energyCost, difficulty, duration,
 *   targetType, requiresTarget, range, cooldown, emitsEvent,
 *   gameActivityVerb, completesObjectiveType, parentAction,
 *   verbPast, verbPresent
 *
 * Safety:
 *   - Only removes fields from documents that HAVE a non-empty `content` field
 *   - Documents without content are left untouched (they'd lose data)
 *   - Use --dry-run to preview changes without modifying the database
 *
 * Usage:
 *   npx tsx server/migrations/056-strip-prolog-derived-fields.ts
 *   npx tsx server/migrations/056-strip-prolog-derived-fields.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URL || 'mongodb://localhost:27017/insimul';
const DRY_RUN = process.argv.includes('--dry-run');

// Fields to remove from quests (all derivable from Prolog content)
const QUEST_FIELDS_TO_REMOVE = [
  'title',
  'description',
  'questType',
  'difficulty',
  'targetLanguage',
  'assignedTo',
  'assignedBy',
  'objectives',
  'completionCriteria',
  'experienceReward',
  'moneyReward',
  'rewards',
  'itemRewards',
  'skillRewards',
  'unlocks',
  'prerequisiteQuestIds',
  'tags',
  'questChainId',
  'questChainOrder',
  'parentQuestId',
  'locationName',
  'failureConditions',
  'stages',
  'currentStageId',
  'conversationOnly',
  'guildId',
  'guildTier',
];

// Fields to remove from actions (all derivable from Prolog content)
const ACTION_FIELDS_TO_REMOVE = [
  'actionType',
  'category',
  'energyCost',
  'difficulty',
  'duration',
  'targetType',
  'requiresTarget',
  'range',
  'cooldown',
  'emitsEvent',
  'gameActivityVerb',
  'completesObjectiveType',
  'parentAction',
  'verbPast',
  'verbPresent',
];

// Fields to also strip when they hold null or default values (schema clutter)
const QUEST_NULL_FIELDS_TO_STRIP = [
  'assignedToCharacterId', 'assignedByCharacterId',
  'locationId', 'locationPosition',
  'titleTranslation', 'descriptionTranslation', 'objectivesTranslation',
  'cefrLevel', 'difficultyStars', 'estimatedMinutes',
  'gameType', 'conversationContext',
  'attemptCount', 'maxAttempts',
  'abandonedAt', 'failedAt', 'failureReason', 'abandonReason',
  'recurrencePattern', 'recurrenceResetAt',
  'completionCount', 'lastCompletedAt', 'sourceQuestId', 'streakCount',
  'narrativeChapterId', 'relatedTruthIds',
  'assignedAt', 'completedAt', 'expiresAt',
  'progress', 'customData',
];

const ACTION_NULL_FIELDS_TO_STRIP = [
  'sourceFormat', 'isAvailable',
  'narrativeTemplates', 'tags', 'relatedTruthIds', 'customData',
];

async function main() {
  console.log(`\n=== Migration 056: Strip Prolog-Derived + Null Fields ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db!;

  // ── Quests ──────────────────────────────────────────────────────────────
  const questsCollection = db.collection('quests');
  const totalQuests = await questsCollection.countDocuments();
  const questsWithContent = await questsCollection.countDocuments({
    content: { $ne: null, $exists: true, $type: 'string' },
  });

  console.log(`Total quests: ${totalQuests}, with Prolog content: ${questsWithContent}`);

  // Step 1: Strip Prolog-derived fields from quests that have content
  const questUnset: Record<string, 1> = {};
  for (const field of QUEST_FIELDS_TO_REMOVE) {
    questUnset[field] = 1;
  }

  if (!DRY_RUN && questsWithContent > 0) {
    const result = await questsCollection.updateMany(
      { content: { $ne: null, $exists: true, $type: 'string' } },
      { $unset: questUnset },
    );
    console.log(`  ✓ Stripped ${QUEST_FIELDS_TO_REMOVE.length} Prolog-derived fields from ${result.modifiedCount} quests`);
  } else {
    console.log(`  Would strip ${QUEST_FIELDS_TO_REMOVE.length} Prolog-derived fields from ${questsWithContent} quests`);
  }

  // Step 2: Strip null/default fields from ALL quests
  let questNullStripped = 0;
  if (!DRY_RUN) {
    const allQuests = await questsCollection.find({}).toArray();
    for (const quest of allQuests) {
      const fieldsToRemove: Record<string, 1> = {};
      for (const field of QUEST_NULL_FIELDS_TO_STRIP) {
        const val = (quest as any)[field];
        if (val === null || val === undefined) {
          fieldsToRemove[field] = 1;
        } else if (Array.isArray(val) && val.length === 0) {
          fieldsToRemove[field] = 1;
        } else if (typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Date) && Object.keys(val).length === 0) {
          fieldsToRemove[field] = 1;
        }
      }
      // Strip default values
      if ((quest as any).gameType === 'language-learning') fieldsToRemove['gameType'] = 1;
      if ((quest as any).attemptCount === 1) fieldsToRemove['attemptCount'] = 1;
      if ((quest as any).maxAttempts === 3) fieldsToRemove['maxAttempts'] = 1;
      if ((quest as any).completionCount === 0) fieldsToRemove['completionCount'] = 1;
      if ((quest as any).streakCount === 0) fieldsToRemove['streakCount'] = 1;

      if (Object.keys(fieldsToRemove).length > 0) {
        await questsCollection.updateOne({ _id: quest._id }, { $unset: fieldsToRemove });
        questNullStripped++;
      }
    }
    console.log(`  ✓ Stripped null/default fields from ${questNullStripped} quests`);
  } else {
    console.log(`  Would strip null/default fields from up to ${totalQuests} quests`);
  }

  // ── Actions ─────────────────────────────────────────────────────────────
  const actionsCollection = db.collection('actions');
  const totalActions = await actionsCollection.countDocuments();
  const actionsWithContent = await actionsCollection.countDocuments({
    content: { $ne: null, $exists: true, $type: 'string' },
  });

  console.log(`\nTotal actions: ${totalActions}, with Prolog content: ${actionsWithContent}`);

  // Step 1: Strip Prolog-derived fields from actions that have content
  const actionUnset: Record<string, 1> = {};
  for (const field of ACTION_FIELDS_TO_REMOVE) {
    actionUnset[field] = 1;
  }

  if (!DRY_RUN && actionsWithContent > 0) {
    const result = await actionsCollection.updateMany(
      { content: { $ne: null, $exists: true, $type: 'string' } },
      { $unset: actionUnset },
    );
    console.log(`  ✓ Stripped ${ACTION_FIELDS_TO_REMOVE.length} Prolog-derived fields from ${result.modifiedCount} actions`);
  } else {
    console.log(`  Would strip ${ACTION_FIELDS_TO_REMOVE.length} Prolog-derived fields from ${actionsWithContent} actions`);
  }

  // Step 2: Strip null/default fields from ALL actions
  let actionNullStripped = 0;
  if (!DRY_RUN) {
    const allActions = await actionsCollection.find({}).toArray();
    for (const action of allActions) {
      const fieldsToRemove: Record<string, 1> = {};
      for (const field of ACTION_NULL_FIELDS_TO_STRIP) {
        const val = (action as any)[field];
        if (val === null || val === undefined) {
          fieldsToRemove[field] = 1;
        } else if (Array.isArray(val) && val.length === 0) {
          fieldsToRemove[field] = 1;
        } else if (typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Date) && Object.keys(val).length === 0) {
          fieldsToRemove[field] = 1;
        }
      }
      // Strip defaults
      if ((action as any).sourceFormat === 'prolog') fieldsToRemove['sourceFormat'] = 1;
      if ((action as any).isAvailable === true) fieldsToRemove['isAvailable'] = 1;

      if (Object.keys(fieldsToRemove).length > 0) {
        await actionsCollection.updateOne({ _id: action._id }, { $unset: fieldsToRemove });
        actionNullStripped++;
      }
    }
    console.log(`  ✓ Stripped null/default fields from ${actionNullStripped} actions`);
  } else {
    console.log(`  Would strip null/default fields from up to ${totalActions} actions`);
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log(`\n=== Done ===\n`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
