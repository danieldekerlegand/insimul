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

    // --- Build character ID → name and role → name lookups ---
    const charactersCollection = db.collection('characters');
    const allCharacters = await charactersCollection.find({}).project({ firstName: 1, lastName: 1, occupation: 1 }).toArray();
    const charIdToName = new Map<string, string>();
    const roleToName = new Map<string, string>(); // occupation/role → first matching character name
    for (const c of allCharacters) {
      const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
      if (name) {
        charIdToName.set(c._id.toString(), name);
        // Map occupations to character names (first match wins)
        if (c.occupation) {
          const occ = c.occupation.toLowerCase();
          if (!roleToName.has(occ)) roleToName.set(occ, name);
          // Also map simplified versions: "Owner (Restaurant)" → "restaurant_owner"
          const ownerMatch = c.occupation.match(/Owner\s*\((\w+)\)/);
          if (ownerMatch) {
            const simplified = ownerMatch[1].toLowerCase() + '_owner';
            if (!roleToName.has(simplified)) roleToName.set(simplified, name);
            if (!roleToName.has(ownerMatch[1].toLowerCase())) roleToName.set(ownerMatch[1].toLowerCase(), name);
          }
        }
      }
    }
    // Add common role aliases
    if (roleToName.has('cashier')) roleToName.set('clerk', roleToName.get('cashier')!);
    if (roleToName.has('merchant')) { if (!roleToName.has('clerk')) roleToName.set('clerk', roleToName.get('merchant')!); }
    if (roleToName.has('bartender')) roleToName.set('barkeep', roleToName.get('bartender')!);
    // Assign narrative roles (witness_*) to distinct NPCs
    const nonOwnerChars = allCharacters
      .filter(c => c.occupation && !c.occupation.startsWith('Owner') && !c.occupation.startsWith('Retired') && c.firstName)
      .map(c => [c.firstName, c.lastName].filter(Boolean).join(' '));
    const shuffled = nonOwnerChars.sort(() => Math.random() - 0.5);
    if (shuffled[0]) roleToName.set('witness_neighbor', shuffled[0]);
    if (shuffled[1]) roleToName.set('witness_colleague', shuffled[1]);
    if (shuffled[2]) roleToName.set('witness_friend', shuffled[2]);
    console.log(`\nLoaded ${charIdToName.size} character names, ${roleToName.size} role mappings`);

    // --- Quests ---
    const questsCollection = db.collection('quests');
    const quests = await questsCollection.find({}).toArray();
    let questsConverted = 0;
    let questsSkipped = 0;
    let questsErrors: string[] = [];
    let idsResolved = 0;

    console.log(`Found ${quests.length} quests`);

    for (const quest of quests) {
      if (quest.content && !FORCE_REGENERATE) {
        questsSkipped++;
        continue;
      }
      try {
        // Hydrate fields from existing content before re-converting
        hydrateQuestFromProlog(quest);
        const cleanQuest = { ...quest };

        // Resolve MongoDB ObjectIds to human-readable names in objectives
        if (cleanQuest.objectives) {
          cleanQuest.objectives = cleanQuest.objectives.map((obj: any) => {
            const resolved = { ...obj };
            // Resolve NPC IDs
            for (const field of ['npcId', 'npc', 'target', 'targetNpcId', 'to']) {
              if (resolved[field] && /^[0-9a-f]{24}$/i.test(resolved[field])) {
                const name = charIdToName.get(resolved[field]);
                if (name) {
                  resolved[field] = name;
                  idsResolved++;
                }
              }
            }
            // Also resolve npcName if missing
            if (!resolved.npcName && resolved.npcId && charIdToName.has(resolved.npcId)) {
              resolved.npcName = charIdToName.get(resolved.npcId);
            }
            // Resolve role-based references (e.g., 'clerk' → 'Philibert Sonnier')
            for (const field of ['npcId', 'npc', 'target']) {
              const val = resolved[field];
              if (val && typeof val === 'string' && !/^[0-9a-f]{24}$/i.test(val) && !val.includes(' ')) {
                // Looks like a role/occupation name, not a proper name
                const roleName = roleToName.get(val.toLowerCase());
                if (roleName) {
                  resolved[field] = roleName;
                  if (!resolved.npcName) resolved.npcName = roleName;
                  idsResolved++;
                }
              }
            }
            return resolved;
          });
        }
        // Resolve assignedByCharacterId
        if (cleanQuest.assignedByCharacterId && /^[0-9a-f]{24}$/i.test(cleanQuest.assignedByCharacterId)) {
          const name = charIdToName.get(cleanQuest.assignedByCharacterId);
          if (name && !cleanQuest.assignedBy) {
            cleanQuest.assignedBy = name;
          }
        }

        // Also resolve any ObjectIds remaining in the description/target fields
        if (cleanQuest.description && /[0-9a-f]{24}/i.test(cleanQuest.description)) {
          cleanQuest.description = cleanQuest.description.replace(/\b([0-9a-f]{24})\b/gi, (id: string) => charIdToName.get(id) || id);
        }
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

    console.log(`Quests: ${questsConverted} converted, ${questsSkipped} skipped, ${questsErrors.length} errors, ${idsResolved} IDs resolved to names`);
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
