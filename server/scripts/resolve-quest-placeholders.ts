#!/usr/bin/env tsx
/**
 * Resolve Quest Placeholder Entities
 *
 * Binds {npc}, {npc_0}, {location}, {location_0}, {destination}, {settlement},
 * {targetLanguage}, etc. in quest objectives to actual world entities.
 *
 * Usage:
 *   npx tsx server/scripts/resolve-quest-placeholders.ts
 *   npx tsx server/scripts/resolve-quest-placeholders.ts --dry-run
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const DRY_RUN = process.argv.includes('--dry-run');
const WORLD_ID = process.argv.find(a => a.startsWith('--world='))?.split('=')[1]
  || '69cbbc6b7dbae7be5f935995';

interface Character {
  _id: any;
  id: string;
  firstName: string;
  lastName: string;
  occupation?: string;
  gender?: string;
}

interface Business {
  _id: any;
  id: string;
  name: string;
  businessType: string;
  ownerId?: string;
}

async function main() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL || '';
  if (!mongoUrl) { console.error('No MONGO_URL'); process.exit(1); }

  console.log(`\n=== Resolve Quest Placeholders ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db!;

  // Load world data
  const world = await db.collection('worlds').findOne({ _id: new mongoose.Types.ObjectId(WORLD_ID) });
  if (!world) { console.error('World not found:', WORLD_ID); process.exit(1); }
  const targetLanguage = world.targetLanguage || 'French';
  const worldName = world.name || 'World';

  // Load characters (alive, with names)
  const characters: Character[] = (await db.collection('characters')
    .find({ worldId: WORLD_ID })
    .toArray())
    .map(c => ({ ...c, id: c._id.toString() })) as any;

  // Load settlements
  const settlements = await db.collection('settlements')
    .find({ worldId: WORLD_ID }).toArray();
  const settlementName = settlements[0]?.name || 'Town';
  const settlementId = settlements[0]?._id?.toString() || '';

  // Load businesses via API (lots are complex to query directly)
  let businesses: Business[] = [];
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiUrl}/api/worlds/${WORLD_ID}/businesses`);
    if (res.ok) {
      const data = await res.json() as any[];
      businesses = data.map(b => ({
        _id: b.id,
        id: b.id,
        name: b.name || b.businessType || 'Business',
        businessType: b.businessType || '',
        ownerId: b.ownerId || null,
      }));
    }
  } catch (e) {
    console.warn('Could not fetch businesses from API — will use NPC-based locations only');
  }
  console.log(`Loaded ${businesses.length} businesses: ${businesses.map(b => b.name + ' [' + b.businessType + ']').join(', ')}`);

  // Build location list from businesses + settlement
  const locations = [
    settlementName,
    ...businesses.map(b => b.name),
  ];

  // Filter NPCs by useful roles
  const npcPool = characters.filter(c =>
    c.firstName && c.lastName && c.occupation && c.occupation !== 'none'
  );
  const allNpcs = characters.filter(c => c.firstName && c.lastName);

  // Specific role lookups
  const findNpcByOccupation = (occ: string) =>
    npcPool.find(c => c.occupation?.toLowerCase().includes(occ.toLowerCase()));
  const findNpcByBusinessType = (bType: string) => {
    const biz = businesses.find(b => b.businessType === bType);
    return biz?.ownerId ? characters.find(c => c.id === biz.ownerId) : null;
  };

  // Shuffled pools for random assignment
  let npcIdx = 0;
  const shuffled = [...npcPool].sort(() => Math.random() - 0.5);
  const nextNpc = () => shuffled[npcIdx++ % shuffled.length];

  let locIdx = 0;
  const shuffledLocs = [...locations].sort(() => Math.random() - 0.5);
  const nextLocation = () => shuffledLocs[locIdx++ % shuffledLocs.length];

  // Load quests
  const quests = await db.collection('quests').find({ worldId: WORLD_ID }).toArray();
  console.log(`Found ${quests.length} quests, ${npcPool.length} NPCs with occupations, ${locations.length} locations\n`);

  let updated = 0;

  for (const quest of quests) {
    const objectives = quest.objectives || [];
    const description = quest.description || '';
    let changed = false;
    const resolvedNpcs: Character[] = [];

    // Smart NPC selection based on quest context
    const getContextualNpc = (questTitle: string, index: number): Character => {
      // Guild quests → guild owners
      if (questTitle.includes('Market') || questTitle.includes('Shopping'))
        return findNpcByBusinessType('GuildMarchands') || findNpcByBusinessType('GroceryStore') || nextNpc();
      if (questTitle.includes('Artisan') || questTitle.includes('Craft'))
        return findNpcByBusinessType('GuildArtisans') || nextNpc();
      if (questTitle.includes('Library') || questTitle.includes('Story') || questTitle.includes('Book'))
        return findNpcByBusinessType('GuildConteurs') || nextNpc();
      if (questTitle.includes('Explorer') || questTitle.includes('Tour'))
        return findNpcByBusinessType('GuildExplorateurs') || nextNpc();
      if (questTitle.includes('Diplomat') || questTitle.includes('Meeting') || questTitle.includes('Ambassador'))
        return findNpcByBusinessType('GuildDiplomates') || nextNpc();
      if (questTitle.includes('Meal') || questTitle.includes('Food') || questTitle.includes('Dinner'))
        return findNpcByBusinessType('Restaurant') || nextNpc();
      if (questTitle.includes('Delivery'))
        return findNpcByBusinessType('GroceryStore') || nextNpc();
      // Use unique NPCs for multi-NPC quests
      if (resolvedNpcs.length > 0) {
        const remaining = shuffled.filter(n => !resolvedNpcs.includes(n));
        if (remaining.length > 0) return remaining[index % remaining.length];
      }
      return nextNpc();
    };

    const getContextualLocation = (questTitle: string, index: number): string => {
      if (questTitle.includes('Market') || questTitle.includes('Shopping'))
        return businesses.find(b => b.businessType === 'GroceryStore')?.name || nextLocation();
      if (questTitle.includes('Library') || questTitle.includes('Book'))
        return businesses.find(b => b.businessType === 'GuildConteurs')?.name || nextLocation();
      if (questTitle.includes('Artisan') || questTitle.includes('Craft'))
        return businesses.find(b => b.businessType === 'GuildArtisans')?.name || nextLocation();
      if (questTitle.includes('Explorer'))
        return businesses.find(b => b.businessType === 'GuildExplorateurs')?.name || nextLocation();
      if (questTitle.includes('Diplomat') || questTitle.includes('Meeting'))
        return businesses.find(b => b.businessType === 'GuildDiplomates')?.name || nextLocation();
      if (questTitle.includes('Meal') || questTitle.includes('Restaurant'))
        return businesses.find(b => b.businessType === 'Restaurant')?.name || nextLocation();
      return nextLocation();
    };

    for (let i = 0; i < objectives.length; i++) {
      const obj = objectives[i];
      const type = obj.type || '';

      // Resolve NPC placeholders
      if (type === 'talk_to_npc' || type === 'introduce_self' || type === 'give_gift' ||
          type === 'deliver_item' || type === 'build_friendship') {
        const target = obj.target || obj.npcId || obj.npc || '';
        if (!target || target.includes('{')) {
          const npc = getContextualNpc(quest.title, i);
          const npcName = `${npc.firstName} ${npc.lastName}`;
          obj.target = npcName;
          obj.npcId = npc.id;
          obj.npcName = npcName;
          resolvedNpcs.push(npc);
          // Update description
          if (obj.description) {
            obj.description = obj.description
              .replace(/\{npc(?:_\d+)?\}/g, npcName)
              .replace(/\{targetLanguage\}/g, targetLanguage);
          }
          changed = true;
        }
      }

      if (type === 'complete_conversation' || type === 'sustained_conversation') {
        if (!obj.npcId && !obj.npc) {
          const npc = getContextualNpc(quest.title, i);
          obj.npcId = npc.id;
          obj.npcName = `${npc.firstName} ${npc.lastName}`;
          resolvedNpcs.push(npc);
          changed = true;
        }
      }

      if (type === 'order_food') {
        if (!obj.merchantId && !obj.target) {
          const restaurant = businesses.find(b => b.businessType === 'Restaurant');
          if (restaurant) {
            obj.merchantId = restaurant.id;
            obj.target = restaurant.name;
            changed = true;
          }
        }
      }

      if (type === 'haggle_price') {
        if (!obj.merchantId && !obj.target) {
          const merchant = businesses.find(b => b.businessType === 'GroceryStore' || b.businessType === 'GuildMarchands');
          if (merchant) {
            obj.merchantId = merchant.id;
            obj.target = merchant.name;
            changed = true;
          }
        }
      }

      // Resolve location placeholders
      if (type === 'visit_location' || type === 'discover_location') {
        const loc = obj.locationName || obj.location || obj.target || '';
        if (!loc || loc.includes('{')) {
          const resolvedLoc = getContextualLocation(quest.title, i);
          obj.locationName = resolvedLoc;
          obj.target = resolvedLoc;
          if (obj.description) {
            obj.description = obj.description
              .replace(/\{location(?:_\d+)?\}/g, resolvedLoc)
              .replace(/\{destination\}/g, resolvedLoc);
          }
          changed = true;
        }
      }

      // Resolve gain_reputation target
      if (type === 'gain_reputation') {
        if (!obj.target && !obj.settlement) {
          obj.target = settlementName;
          obj.settlement = settlementId;
          changed = true;
        }
      }

      // Resolve {targetLanguage} in all descriptions
      if (obj.description && obj.description.includes('{targetLanguage}')) {
        obj.description = obj.description.replace(/\{targetLanguage\}/g, targetLanguage);
        changed = true;
      }
    }

    // Also resolve placeholders in quest-level description
    let newDescription = description;
    if (description.includes('{targetLanguage}')) {
      newDescription = description.replace(/\{targetLanguage\}/g, targetLanguage);
      changed = true;
    }
    if (description.includes('{settlement}') || description.includes('{city}')) {
      newDescription = newDescription
        .replace(/\{settlement\}/g, settlementName)
        .replace(/\{city\}/g, settlementName);
      changed = true;
    }

    // Also set quest-level locationName from first location objective
    let questLocationName = quest.locationName;
    if (!questLocationName) {
      const locObj = objectives.find((o: any) =>
        (o.type === 'visit_location' || o.type === 'discover_location') && o.locationName
      );
      if (locObj) {
        questLocationName = locObj.locationName;
        changed = true;
      }
    }

    if (changed) {
      const updateFields: any = { objectives, updatedAt: new Date() };
      if (newDescription !== description) updateFields.description = newDescription;
      if (questLocationName && questLocationName !== quest.locationName) {
        updateFields.locationName = questLocationName;
      }

      if (!DRY_RUN) {
        await db.collection('quests').updateOne(
          { _id: quest._id },
          { $set: updateFields }
        );
      }
      console.log(`  ✓ ${quest.title}`);
      for (const obj of objectives) {
        if (obj.npcName || obj.locationName || obj.merchantId) {
          const binding = obj.npcName ? `NPC: ${obj.npcName}` :
            obj.locationName ? `Location: ${obj.locationName}` :
            obj.merchantId ? `Merchant: ${obj.target}` : '';
          console.log(`      ${obj.type} → ${binding}`);
        }
      }
      updated++;
    }
  }

  console.log(`\n=== Done: ${updated} quests updated ===\n`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Script failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
