#!/usr/bin/env tsx
/**
 * Migration 049: Seed character backstory truths and deceased ancestors
 *
 * For every world:
 *   1. Creates backstory / trait / secret truths for each living character
 *      that doesn't already have any.
 *   2. Creates deceased parent and grandparent characters for living
 *      characters who are missing them, linking family IDs both ways.
 *
 * Idempotent: skips characters that already have backstory truths or
 * parent records.
 *
 * Usage:
 *   npx tsx server/migrations/049-seed-backstories-and-ancestors.ts
 *   npx tsx server/migrations/049-seed-backstories-and-ancestors.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
// @ts-ignore - uuid has no declaration file
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DRY_RUN = process.argv.includes('--dry-run');

// ── French first-name pools (period-appropriate) ─────────────────────────────

const MALE_FIRST_NAMES = [
  'Pierre', 'Jean', 'Jacques', 'Henri', 'Louis', 'François', 'Antoine',
  'Claude', 'Michel', 'René', 'Marcel', 'André', 'Émile', 'Gustave',
  'Léon', 'Alphonse', 'Théodore', 'Augustin', 'Bernard', 'Gaston',
  'Édouard', 'Albert', 'Charles', 'Paul', 'Georges', 'Joseph', 'Lucien',
  'Félix', 'Armand', 'Maurice', 'Raymond', 'Roger', 'Robert', 'Étienne',
];

const FEMALE_FIRST_NAMES = [
  'Marie', 'Jeanne', 'Marguerite', 'Catherine', 'Anne', 'Élise', 'Louise',
  'Madeleine', 'Suzanne', 'Thérèse', 'Claire', 'Hélène', 'Cécile',
  'Isabelle', 'Blanche', 'Berthe', 'Geneviève', 'Adèle', 'Colette',
  'Odette', 'Pauline', 'Simone', 'Renée', 'Germaine', 'Yvonne',
  'Denise', 'Jacqueline', 'Lucienne', 'Fernande', 'Henriette',
];

// ── Backstory templates ─────────────────────────────────────────────────────

interface BackstoryTemplate {
  title: string;
  contentTemplate: string; // {firstName}, {lastName}, {occupation} placeholders
  entryType: string;
  importance: number;
}

const TRAIT_TEMPLATES: BackstoryTemplate[] = [
  { title: 'Early riser', contentTemplate: '{firstName} has always risen before dawn, a habit inherited from years of hard work.', entryType: 'trait', importance: 4 },
  { title: 'Keen observer', contentTemplate: '{firstName} notices details others miss — a loose cobblestone, a changed expression, an unfamiliar scent on the wind.', entryType: 'trait', importance: 5 },
  { title: 'Stubborn streak', contentTemplate: 'Once {firstName} has made up their mind, few forces in the world can change it.', entryType: 'trait', importance: 5 },
  { title: 'Gentle hands', contentTemplate: '{firstName} has always had a gentle touch, whether mending a fence or comforting a child.', entryType: 'trait', importance: 4 },
  { title: 'Sharp tongue', contentTemplate: '{firstName} is known for a quick wit that can cut as deep as any blade.', entryType: 'trait', importance: 5 },
  { title: 'Quiet determination', contentTemplate: '{firstName} rarely boasts, but those who know them understand they never quit.', entryType: 'trait', importance: 5 },
  { title: 'Lover of stories', contentTemplate: '{firstName} collects tales the way others collect coins — always eager for one more.', entryType: 'trait', importance: 4 },
  { title: 'Superstitious nature', contentTemplate: '{firstName} never walks under ladders, always tosses salt over the left shoulder, and keeps a sprig of rosemary in every doorway.', entryType: 'trait', importance: 3 },
  { title: 'Natural leader', contentTemplate: 'When trouble strikes, people instinctively look to {firstName} for direction.', entryType: 'trait', importance: 6 },
  { title: 'Restless spirit', contentTemplate: '{firstName} has always felt the pull of distant horizons, even when duty keeps them rooted.', entryType: 'trait', importance: 5 },
  { title: 'Patient craftsperson', contentTemplate: '{firstName} approaches every task with meticulous patience, never rushing the final detail.', entryType: 'trait', importance: 4 },
  { title: 'Warm hospitality', contentTemplate: 'No guest leaves the {lastName} home without a full stomach and an open invitation to return.', entryType: 'trait', importance: 4 },
];

const SECRET_TEMPLATES: BackstoryTemplate[] = [
  { title: 'Hidden talent', contentTemplate: '{firstName} secretly writes poetry by candlelight, filling journals that no one else has ever read.', entryType: 'secret', importance: 5 },
  { title: 'Old debt', contentTemplate: '{firstName} owes a debt from long ago that still weighs on their conscience.', entryType: 'secret', importance: 6 },
  { title: 'Forbidden friendship', contentTemplate: '{firstName} maintains a secret correspondence with someone the community would not approve of.', entryType: 'secret', importance: 7 },
  { title: 'Lost love', contentTemplate: '{firstName} once loved someone deeply but the relationship ended in circumstances they never speak about.', entryType: 'secret', importance: 7 },
  { title: 'Hidden knowledge', contentTemplate: '{firstName} possesses knowledge about the settlement founding that contradicts the official story.', entryType: 'secret', importance: 8 },
  { title: 'Buried treasure', contentTemplate: '{firstName} knows the location of something valuable hidden near the settlement, but has never retrieved it.', entryType: 'secret', importance: 6 },
  { title: 'Past identity', contentTemplate: 'Before arriving here, {firstName} went by a different name and lived a very different life.', entryType: 'secret', importance: 8 },
  { title: 'Unsent letter', contentTemplate: '{firstName} keeps an unsent letter in a locked box — its contents could change everything.', entryType: 'secret', importance: 6 },
];

const BACKSTORY_TEMPLATES: BackstoryTemplate[] = [
  { title: 'Apprenticeship years', contentTemplate: '{firstName} spent their youth apprenticed to a demanding master, learning discipline along with their trade.', entryType: 'backstory', importance: 5 },
  { title: 'The great storm', contentTemplate: '{firstName} survived a terrible storm in their childhood that destroyed half the settlement and shaped who they became.', entryType: 'backstory', importance: 6 },
  { title: 'Family tradition', contentTemplate: 'The {lastName} family has practiced their craft for generations; {firstName} carries on a legacy stretching back to the settlement founding.', entryType: 'backstory', importance: 5 },
  { title: 'A journey taken', contentTemplate: 'As a young adult, {firstName} traveled far from home, returning with new ideas and a broader view of the world.', entryType: 'backstory', importance: 5 },
  { title: 'Childhood promise', contentTemplate: '{firstName} made a promise as a child that has quietly guided every major decision since.', entryType: 'backstory', importance: 6 },
  { title: 'Harvest miracle', contentTemplate: 'The year the harvest failed, it was {firstName} who found a way to keep the community fed through the lean months.', entryType: 'backstory', importance: 7 },
  { title: 'War survivor', contentTemplate: '{firstName} lived through a period of conflict that left scars — some visible, some not.', entryType: 'backstory', importance: 7 },
  { title: 'The mentor', contentTemplate: 'An elder once took {firstName} under their wing and taught them lessons no school could offer.', entryType: 'backstory', importance: 5 },
  { title: 'Founded from nothing', contentTemplate: '{firstName} arrived with nothing but determination and built their current life from the ground up.', entryType: 'backstory', importance: 6 },
  { title: 'Inherited burden', contentTemplate: 'After a parent died young, {firstName} had to grow up fast and take responsibility for the family.', entryType: 'backstory', importance: 7 },
];

// ── Death cause templates for ancestor truths ────────────────────────────────

const DEATH_CAUSES = [
  'old age, passing peacefully at home',
  'a winter fever that swept through the settlement',
  'an accident while working',
  'illness after a long decline',
  'complications from a harsh winter',
  'old age, surrounded by family',
  'a sudden illness in the autumn',
  'exhaustion after years of hard labor',
  'a fall during a storm',
  'natural causes after a long and full life',
];

// ── Occupation templates for ancestors ───────────────────────────────────────

const ANCESTOR_OCCUPATIONS = [
  'farmer', 'carpenter', 'blacksmith', 'weaver', 'baker', 'fisherman',
  'midwife', 'herbalist', 'mason', 'tanner', 'potter', 'shepherd',
  'innkeeper', 'cooper', 'miller', 'seamstress', 'woodcutter', 'merchant',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function fillTemplate(template: BackstoryTemplate, char: { firstName: string; lastName: string; occupation?: string }): { title: string; content: string; entryType: string; importance: number } {
  return {
    title: template.title,
    content: template.contentTemplate
      .replace(/\{firstName\}/g, char.firstName)
      .replace(/\{lastName\}/g, char.lastName)
      .replace(/\{occupation\}/g, char.occupation || 'work'),
    entryType: template.entryType,
    importance: template.importance,
  };
}

// ── Migration ────────────────────────────────────────────────────────────────

async function run() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL || process.env.DATABASE_URL;
  if (!mongoUrl) { console.error('MONGO_URL not set'); process.exit(1); }

  await mongoose.connect(mongoUrl);
  const Characters = mongoose.connection.collection('characters');
  const Truths = mongoose.connection.collection('truths');
  const Worlds = mongoose.connection.collection('worlds');
  const Settlements = mongoose.connection.collection('settlements');

  console.log(`\n🪦 Migration 049: Seed backstories & deceased ancestors${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  const worlds = await Worlds.find({}).toArray();
  console.log(`Found ${worlds.length} world(s)\n`);

  let totalTruths = 0;
  let totalAncestors = 0;

  for (const world of worlds) {
    const worldId = (world.id || world._id?.toString()) as string;
    if (!worldId) continue;

    console.log(`── World: ${world.name} ──`);

    // Get settlements for cemetery / location info
    const settlements = await Settlements.find({ worldId }).toArray();
    const settlementMap = new Map(settlements.map(s => [s.id || s._id?.toString(), s]));

    // Get all living characters
    const livingChars = await Characters.find({ worldId, isAlive: true }).toArray();
    console.log(`  Living characters: ${livingChars.length}`);

    if (livingChars.length === 0) continue;

    // Determine currentYear from world or most recent birthYear
    const currentYear = (world.currentYear as number) ||
      Math.max(...livingChars.map(c => (c.birthYear as number) || 0)) + 30;

    // ── Part 1: Backstory truths ──────────────────────────────────────────

    let truthCount = 0;
    for (const char of livingChars) {
      const charId = (char.id || char._id?.toString()) as string;

      // Idempotency: skip if character already has backstory truths
      const existingTruths = await Truths.countDocuments({
        worldId,
        characterId: charId,
        entryType: { $in: ['trait', 'secret', 'backstory', 'relationship'] },
      });
      if (existingTruths > 0) continue;

      // Pick 1 trait + 1 secret + 1 backstory
      const templates = [
        pick(TRAIT_TEMPLATES),
        pick(SECRET_TEMPLATES),
        pick(BACKSTORY_TEMPLATES),
      ];

      for (const tmpl of templates) {
        const truth = fillTemplate(tmpl, {
          firstName: char.firstName as string,
          lastName: char.lastName as string,
          occupation: char.occupation as string | undefined,
        });

        if (!DRY_RUN) {
          await Truths.insertOne({
            id: uuidv4(),
            worldId,
            characterId: charId,
            title: truth.title,
            content: truth.content,
            entryType: truth.entryType,
            importance: truth.importance,
            timestep: 0,
            isPublic: truth.entryType !== 'secret',
            source: 'migration_seed',
            tags: ['backstory-seed', 'migration-049'],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        truthCount++;
      }
    }

    console.log(`  📖 Created ${truthCount} backstory truths`);
    totalTruths += truthCount;

    // ── Part 2: Deceased ancestors ────────────────────────────────────────

    let ancestorCount = 0;

    for (const char of livingChars) {
      const charId = (char.id || char._id?.toString()) as string;
      const charLastName = char.lastName as string;
      const charBirthYear = (char.birthYear as number) || (currentYear - 30);
      const charLocation = (char.currentLocation as string) || settlements[0]?.id || settlements[0]?._id?.toString() || worldId;
      const existingParentIds = (char.parentIds as string[]) || [];

      // Skip if character already has parents
      if (existingParentIds.length >= 2) continue;

      // ── Create parents ──────────────────────────────────────────────

      const fatherBirthYear = charBirthYear - (22 + Math.floor(Math.random() * 12)); // 22-33 years older
      const motherBirthYear = charBirthYear - (20 + Math.floor(Math.random() * 10)); // 20-29 years older

      const fatherDeathYear = fatherBirthYear + 55 + Math.floor(Math.random() * 30); // died 55-84
      const motherDeathYear = motherBirthYear + 58 + Math.floor(Math.random() * 30); // died 58-87

      const fatherAlive = fatherDeathYear > currentYear;
      const motherAlive = motherDeathYear > currentYear;

      const fatherId = uuidv4();
      const motherId = uuidv4();

      // Mother's maiden name — pick a different last name from the settlement
      const otherLastNames = livingChars
        .map(c => c.lastName as string)
        .filter(ln => ln !== charLastName);
      const motherMaidenName = otherLastNames.length > 0 ? pick(otherLastNames) : 'Duval';

      const fatherDoc = {
        id: fatherId,
        worldId,
        firstName: pick(MALE_FIRST_NAMES),
        lastName: charLastName,
        gender: 'male',
        birthYear: fatherBirthYear,
        isAlive: fatherAlive,
        status: fatherAlive ? 'active' : 'deceased',
        occupation: pick(ANCESTOR_OCCUPATIONS),
        currentLocation: charLocation,
        personality: { openness: +(Math.random() * 0.8 + 0.1).toFixed(2), conscientiousness: +(Math.random() * 0.8 + 0.1).toFixed(2), extroversion: +(Math.random() * 0.8 + 0.1).toFixed(2), agreeableness: +(Math.random() * 0.8 + 0.1).toFixed(2), neuroticism: +(Math.random() * 0.8 + 0.1).toFixed(2) },
        spouseId: motherId,
        childIds: [charId],
        parentIds: [] as string[],
        immediateFamilyIds: [motherId, charId],
        extendedFamilyIds: [] as string[],
        coworkerIds: [] as string[],
        friendIds: [] as string[],
        neighborIds: [] as string[],
        relationships: {},
        socialAttributes: { generation: -1, ancestor: true },
        genealogyData: {},
        physicalTraits: {},
        mentalTraits: {},
        skills: {},
        memory: 0.5,
        mentalModels: {},
        thoughts: [] as any[],
        generationMethod: 'migration',
        generationConfig: { migration: '049-seed-backstories-and-ancestors' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const motherDoc = {
        id: motherId,
        worldId,
        firstName: pick(FEMALE_FIRST_NAMES),
        lastName: charLastName,
        maidenName: motherMaidenName,
        gender: 'female',
        birthYear: motherBirthYear,
        isAlive: motherAlive,
        status: motherAlive ? 'active' : 'deceased',
        occupation: pick(ANCESTOR_OCCUPATIONS),
        currentLocation: charLocation,
        personality: { openness: +(Math.random() * 0.8 + 0.1).toFixed(2), conscientiousness: +(Math.random() * 0.8 + 0.1).toFixed(2), extroversion: +(Math.random() * 0.8 + 0.1).toFixed(2), agreeableness: +(Math.random() * 0.8 + 0.1).toFixed(2), neuroticism: +(Math.random() * 0.8 + 0.1).toFixed(2) },
        spouseId: fatherId,
        childIds: [charId],
        parentIds: [] as string[],
        immediateFamilyIds: [fatherId, charId],
        extendedFamilyIds: [] as string[],
        coworkerIds: [] as string[],
        friendIds: [] as string[],
        neighborIds: [] as string[],
        relationships: {},
        socialAttributes: { generation: -1, ancestor: true },
        genealogyData: {},
        physicalTraits: {},
        mentalTraits: {},
        skills: {},
        memory: 0.5,
        mentalModels: {},
        thoughts: [] as any[],
        generationMethod: 'migration',
        generationConfig: { migration: '049-seed-backstories-and-ancestors' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!DRY_RUN) {
        await Characters.insertOne(fatherDoc);
        await Characters.insertOne(motherDoc);

        // Link child → parents
        await Characters.updateOne(
          { id: charId } as any,
          {
            $set: {
              parentIds: [fatherId, motherId],
              updatedAt: new Date(),
            },
            $addToSet: {
              immediateFamilyIds: { $each: [fatherId, motherId] },
            },
          },
        );
      }

      ancestorCount += 2;

      // Create death truths for deceased parents
      if (!fatherAlive && !DRY_RUN) {
        await Truths.insertOne({
          id: uuidv4(),
          worldId,
          characterId: fatherId,
          title: `Death of ${fatherDoc.firstName} ${charLastName}`,
          content: `${fatherDoc.firstName} ${charLastName}, a ${fatherDoc.occupation}, died in ${fatherDeathYear} from ${pick(DEATH_CAUSES)}. Survived by their child ${char.firstName}.`,
          entryType: 'event',
          importance: 7,
          timestep: 0,
          timeYear: fatherDeathYear,
          isPublic: true,
          source: 'migration_seed',
          tags: ['death', 'ancestor', 'migration-049'],
          relatedCharacterIds: [charId],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        totalTruths++;
      }

      if (!motherAlive && !DRY_RUN) {
        await Truths.insertOne({
          id: uuidv4(),
          worldId,
          characterId: motherId,
          title: `Death of ${motherDoc.firstName} ${charLastName}`,
          content: `${motherDoc.firstName} ${charLastName} (née ${motherMaidenName}), a ${motherDoc.occupation}, died in ${motherDeathYear} from ${pick(DEATH_CAUSES)}. Survived by their child ${char.firstName}.`,
          entryType: 'event',
          importance: 7,
          timestep: 0,
          timeYear: motherDeathYear,
          isPublic: true,
          source: 'migration_seed',
          tags: ['death', 'ancestor', 'migration-049'],
          relatedCharacterIds: [charId],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        totalTruths++;
      }

      // ── Create grandparents (paternal) ──────────────────────────────

      const pgfBirthYear = fatherBirthYear - (22 + Math.floor(Math.random() * 12));
      const pgmBirthYear = fatherBirthYear - (20 + Math.floor(Math.random() * 10));
      const pgfDeathYear = pgfBirthYear + 50 + Math.floor(Math.random() * 30);
      const pgmDeathYear = pgmBirthYear + 52 + Math.floor(Math.random() * 30);

      const pgfId = uuidv4();
      const pgmId = uuidv4();
      const pgmMaidenName = otherLastNames.length > 1
        ? pick(otherLastNames.filter(n => n !== motherMaidenName))
        : 'Moreau';

      const grandparentBase = {
        worldId,
        lastName: charLastName,
        isAlive: false,
        status: 'deceased' as const,
        currentLocation: charLocation,
        personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
        coworkerIds: [] as string[],
        friendIds: [] as string[],
        neighborIds: [] as string[],
        extendedFamilyIds: [] as string[],
        relationships: {},
        socialAttributes: { generation: -2, ancestor: true },
        genealogyData: {},
        physicalTraits: {},
        mentalTraits: {},
        skills: {},
        memory: 0.5,
        mentalModels: {},
        thoughts: [] as any[],
        generationMethod: 'migration',
        generationConfig: { migration: '049-seed-backstories-and-ancestors' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!DRY_RUN) {
        await Characters.insertOne({
          ...grandparentBase,
          id: pgfId,
          firstName: pick(MALE_FIRST_NAMES),
          gender: 'male',
          birthYear: pgfBirthYear,
          occupation: pick(ANCESTOR_OCCUPATIONS),
          spouseId: pgmId,
          childIds: [fatherId],
          parentIds: [],
          immediateFamilyIds: [pgmId, fatherId],
        });

        await Characters.insertOne({
          ...grandparentBase,
          id: pgmId,
          firstName: pick(FEMALE_FIRST_NAMES),
          lastName: charLastName,
          maidenName: pgmMaidenName,
          gender: 'female',
          birthYear: pgmBirthYear,
          occupation: pick(ANCESTOR_OCCUPATIONS),
          spouseId: pgfId,
          childIds: [fatherId],
          parentIds: [],
          immediateFamilyIds: [pgfId, fatherId],
        });

        // Link father → grandparents
        await Characters.updateOne(
          { id: fatherId } as any,
          {
            $set: { parentIds: [pgfId, pgmId], updatedAt: new Date() },
            $addToSet: { immediateFamilyIds: { $each: [pgfId, pgmId] } },
          },
        );

        // Add child as extended family of grandparents
        await Characters.updateOne(
          { id: pgfId } as any,
          { $addToSet: { extendedFamilyIds: charId } },
        );
        await Characters.updateOne(
          { id: pgmId } as any,
          { $addToSet: { extendedFamilyIds: charId } },
        );
      }

      ancestorCount += 2;

      // ── Create grandparents (maternal) ──────────────────────────────

      const mgfBirthYear = motherBirthYear - (22 + Math.floor(Math.random() * 12));
      const mgmBirthYear = motherBirthYear - (20 + Math.floor(Math.random() * 10));

      const mgfId = uuidv4();
      const mgmId = uuidv4();
      const mgmMaidenName = pick(['Lefèvre', 'Girard', 'Roux', 'Blanc', 'Lambert', 'Perrin']);

      if (!DRY_RUN) {
        await Characters.insertOne({
          ...grandparentBase,
          id: mgfId,
          firstName: pick(MALE_FIRST_NAMES),
          lastName: motherMaidenName, // maternal grandfather has mother's maiden name
          gender: 'male',
          birthYear: mgfBirthYear,
          occupation: pick(ANCESTOR_OCCUPATIONS),
          spouseId: mgmId,
          childIds: [motherId],
          parentIds: [],
          immediateFamilyIds: [mgmId, motherId],
        });

        await Characters.insertOne({
          ...grandparentBase,
          id: mgmId,
          firstName: pick(FEMALE_FIRST_NAMES),
          lastName: motherMaidenName,
          maidenName: mgmMaidenName,
          gender: 'female',
          birthYear: mgmBirthYear,
          occupation: pick(ANCESTOR_OCCUPATIONS),
          spouseId: mgfId,
          childIds: [motherId],
          parentIds: [],
          immediateFamilyIds: [mgfId, motherId],
        });

        // Link mother → grandparents
        await Characters.updateOne(
          { id: motherId } as any,
          {
            $set: { parentIds: [mgfId, mgmId], updatedAt: new Date() },
            $addToSet: { immediateFamilyIds: { $each: [mgfId, mgmId] } },
          },
        );

        // Add child as extended family of maternal grandparents
        await Characters.updateOne(
          { id: mgfId } as any,
          { $addToSet: { extendedFamilyIds: charId } },
        );
        await Characters.updateOne(
          { id: mgmId } as any,
          { $addToSet: { extendedFamilyIds: charId } },
        );
      }

      ancestorCount += 2;
    }

    // Update settlement deceasedCharacterIds
    if (!DRY_RUN) {
      const allDeceased = await Characters.find({ worldId, isAlive: false }).toArray();
      const deceasedIds = allDeceased.map(c => (c.id || c._id?.toString()) as string);

      for (const settlement of settlements) {
        const settId = settlement.id || settlement._id?.toString();
        await Settlements.updateOne(
          { id: settId } as any,
          { $set: { deceasedCharacterIds: deceasedIds, updatedAt: new Date() } },
        );
      }
    }

    console.log(`  🪦 Created ${ancestorCount} ancestor characters (parents + grandparents)`);
    totalAncestors += ancestorCount;
  }

  console.log(`\n✅ Total: ${totalTruths} truths, ${totalAncestors} ancestors across ${worlds.length} world(s)`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
