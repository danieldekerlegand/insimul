#!/usr/bin/env tsx
/**
 * Migrate French Louisiana Backup to Current Schema
 *
 * Transforms backup JSON files to match the current Mongoose schema, including:
 *
 * COLLECTION RENAMES:
 *   - assetcollections → templates
 *   - visualassets → assets
 *   - worldlanguages → languages
 *
 * COLLECTION MERGES:
 *   - lots + businesses + residences → locations
 *     (businesses/residences become embedded `building` objects on their lot)
 *
 * FIELD MIGRATIONS per collection (see individual functions below)
 *
 * Usage:
 *   npx tsx data/backups/migrate-french-louisiana.ts
 *   npx tsx data/backups/migrate-french-louisiana.ts --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source is the partially-migrated output from the first pass (field-level only)
const SRC_DIR = path.join(__dirname, 'French Louisiana (migrated)');
const OUT_DIR = path.join(__dirname, 'French Louisiana');
const dryRun = process.argv.includes('--dry-run');

function readCollection(name: string): any[] {
  const filePath = path.join(SRC_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeCollection(name: string, data: any[]) {
  const filePath = path.join(OUT_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ─── Merge lots + businesses + residences → locations ────────────────────────

function mergeToLocations(
  lots: any[],
  businesses: any[],
  residences: any[]
): any[] {
  // Index businesses and residences by their lotId for quick lookup
  const businessByLot = new Map<string, any>();
  for (const biz of businesses) {
    if (biz.lotId) businessByLot.set(biz.lotId, biz);
  }
  const residenceByLot = new Map<string, any>();
  for (const res of residences) {
    if (res.lotId) residenceByLot.set(res.lotId, res);
  }

  return lots.map(lot => {
    const lotId = lot._id;
    const biz = businessByLot.get(lotId);
    const res = residenceByLot.get(lotId);

    // Build the embedded building object
    let building: any = null;
    if (biz) {
      building = {
        buildingCategory: 'business',
        name: biz.name,
        businessType: biz.businessType,
        ownerId: biz.ownerId ?? null,
        founderId: biz.founderId ?? null,
        foundedYear: biz.foundedYear ?? null,
        closedYear: biz.closedYear ?? null,
        isOutOfBusiness: biz.isOutOfBusiness ?? false,
        vacancies: biz.vacancies ?? [],
        businessData: {},
      };
    } else if (res) {
      building = {
        buildingCategory: 'residence',
        residenceType: res.residenceType ?? 'house',
        ownerIds: res.ownerIds ?? [],
        residentIds: res.residentIds ?? [],
      };
    }

    // Remove old lot fields that don't exist in LocationSchema
    const {
      buildingId, buildingType, neighboringLotIds, distanceFromDowntown,
      formerBuildingIds, ...lotFields
    } = lot;

    return {
      ...lotFields,
      // New LocationSchema fields
      lotType: 'buildable',
      blockCol: null,
      blockRow: null,
      lotIndex: null,
      streetId: null,
      side: 'left',
      building,
      formerBuildings: formerBuildingIds?.length
        ? formerBuildingIds.map((id: string) => ({ _id: id }))
        : [],
      // Geographic feature fields (null for regular lots)
      featureCategory: null,
      featureType: null,
      subType: null,
      name: null,
      description: null,
      position: null,
      radius: null,
      waterLevel: null,
      bounds: null,
      depth: null,
      width: null,
      flowDirection: null,
      flowSpeed: null,
      shorelinePoints: [],
      biome: null,
      isNavigable: null,
      isDrinkable: null,
      modelAssetKey: null,
      color: null,
      transparency: null,
      // Inventory fields
      items: {},
      containers: {},
      furniture: {},
    };
  });
}

// ─── WorldLanguage → Language migration ──────────────────────────────────────
// The new schema has many more fields than the old one

function migrateWorldLanguage(doc: any): any {
  return {
    _id: doc._id,
    worldId: doc.worldId,
    scopeType: doc.scopeType ?? 'world',
    scopeId: doc.scopeId ?? doc.worldId,
    name: doc.name,
    description: doc.description ?? null,
    kind: doc.kind ?? 'real',
    realCode: doc.realCode ?? null,
    isPrimary: doc.isPrimary ?? false,
    isLearningTarget: doc.isLearningTarget ?? false,
    parentLanguageId: doc.parentLanguageId ?? null,
    influenceLanguageIds: doc.influenceLanguageIds ?? [],
    realInfluenceCodes: doc.realInfluenceCodes ?? [],
    config: doc.config ?? null,
    features: doc.features ?? null,
    phonemes: doc.phonemes ?? null,
    grammar: doc.grammar ?? null,
    writingSystem: doc.writingSystem ?? null,
    culturalContext: doc.culturalContext ?? null,
    phoneticInventory: doc.phoneticInventory ?? null,
    sampleWords: doc.sampleWords ?? null,
    sampleTexts: doc.sampleTexts ?? null,
    etymology: doc.etymology ?? null,
    dialectVariations: doc.dialectVariations ?? null,
    learningModules: doc.learningModules ?? null,
    relatedTruthIds: doc.relatedTruthIds ?? [],
    culturalTruthIds: doc.culturalTruthIds ?? [],
    historicalTruthIds: doc.historicalTruthIds ?? [],
    idiomsAndProverbs: doc.idiomsAndProverbs ?? [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ─── AssetCollection → Template migration ────────────────────────────────────

function migrateTemplate(doc: any): any {
  // Already has field-level migration from first pass, just pass through
  return doc;
}

// ─── VisualAsset → Asset migration ───────────────────────────────────────────

function migrateAsset(doc: any): any {
  return doc;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
  console.log('============================================================');
  console.log('  Migrate French Louisiana Backup to Current Schema');
  console.log('  (Collection renames + merges)');
  console.log('============================================================\n');

  if (dryRun) {
    console.log('  *** DRY RUN — no files will be written ***\n');
  }

  if (!dryRun) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  let totalDocs = 0;

  // ── Collections that pass through with same name ──────────────────────
  const PASSTHROUGH = [
    'actions', 'rules', 'quests', 'characters', 'worlds',
    'countries', 'states', 'settlements', 'items', 'truths',
    'grammars', 'users',
  ];

  for (const name of PASSTHROUGH) {
    const docs = readCollection(name);
    if (docs.length === 0) {
      console.log(`  ⏭  ${name}: empty or missing, skipping`);
      continue;
    }
    totalDocs += docs.length;
    if (!dryRun) writeCollection(name, docs);
    console.log(`  ✅ ${name} → ${name}: ${docs.length} docs (passthrough)`);
  }

  // ── Renamed collections ───────────────────────────────────────────────

  // assetcollections → templates
  const assetCollections = readCollection('assetcollections');
  if (assetCollections.length > 0) {
    const migrated = assetCollections.map(migrateTemplate);
    totalDocs += migrated.length;
    if (!dryRun) writeCollection('templates', migrated);
    console.log(`  ✅ assetcollections → templates: ${migrated.length} docs`);
  }

  // visualassets → assets
  const visualAssets = readCollection('visualassets');
  if (visualAssets.length > 0) {
    const migrated = visualAssets.map(migrateAsset);
    totalDocs += migrated.length;
    if (!dryRun) writeCollection('assets', migrated);
    console.log(`  ✅ visualassets → assets: ${migrated.length} docs`);
  }

  // worldlanguages → languages
  const worldLanguages = readCollection('worldlanguages');
  if (worldLanguages.length > 0) {
    const migrated = worldLanguages.map(migrateWorldLanguage);
    totalDocs += migrated.length;
    if (!dryRun) writeCollection('languages', migrated);
    console.log(`  ✅ worldlanguages → languages: ${migrated.length} docs`);
  }

  // ── Merged collections: lots + businesses + residences → locations ────

  const lots = readCollection('lots');
  const businesses = readCollection('businesses');
  const residences = readCollection('residences');

  if (lots.length > 0) {
    const locations = mergeToLocations(lots, businesses, residences);
    totalDocs += locations.length;
    if (!dryRun) writeCollection('locations', locations);
    console.log(`  ✅ lots(${lots.length}) + businesses(${businesses.length}) + residences(${residences.length}) → locations: ${locations.length} docs`);
  }

  console.log('\n============================================================');
  console.log(`  Total: ${totalDocs} documents`);
  if (!dryRun) {
    console.log(`  Output: ${OUT_DIR}`);
    console.log('\n  Old files NOT written (merged/renamed):');
    console.log('    - lots.json, businesses.json, residences.json');
    console.log('    - assetcollections.json, visualassets.json, worldlanguages.json');
  }
  console.log('============================================================');
}

main();
