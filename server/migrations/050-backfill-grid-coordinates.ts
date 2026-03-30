#!/usr/bin/env tsx
/**
 * Migration 050: Backfill grid coordinates for worlds, countries, and settlements
 *
 * Computes gridWidth/gridHeight for existing worlds from mapWidth/mapDepth,
 * grid placement for countries from position/territoryRadius,
 * and countryGridX/countryGridY for settlements from worldPositionX/Z.
 *
 * Idempotent: skips records that already have grid data.
 *
 * Usage:
 *   npx tsx server/migrations/050-backfill-grid-coordinates.ts
 *   npx tsx server/migrations/050-backfill-grid-coordinates.ts --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import {
  worldDimensionsToGrid,
  deriveWorldDimensions,
  countryGeometryToGrid,
  settlementPositionToCountryGrid,
  countryInternalGridSize,
  deriveCountryGeometry,
  deriveSettlementWorldPosition,
  WORLD_CELL_SIZE,
} from '../../shared/grid-constants.js';

const DRY_RUN = process.argv.includes('--dry-run');

async function run() {
  const mongoUrl = process.env.MONGO_URL || process.env.DATABASE_URL;
  if (!mongoUrl) {
    console.error('MONGO_URL or DATABASE_URL not set');
    process.exit(1);
  }

  await mongoose.connect(mongoUrl);
  console.log('Connected to MongoDB');
  if (DRY_RUN) console.log('*** DRY RUN — no writes ***\n');

  const db = mongoose.connection.db!;
  const worldsColl = db.collection('worlds');
  const countriesColl = db.collection('countries');
  const settlementsColl = db.collection('settlements');

  // ── Step 1: Backfill worlds ──────────────────────────────────────────────
  console.log('=== Worlds ===');
  const worlds = await worldsColl.find({
    gridWidth: { $exists: false },
    mapWidth: { $exists: true, $ne: null },
    mapDepth: { $exists: true, $ne: null },
  }).toArray();

  console.log(`Found ${worlds.length} worlds needing grid backfill`);

  for (const world of worlds) {
    const { gridWidth, gridHeight } = worldDimensionsToGrid(world.mapWidth, world.mapDepth);
    // Recompute mapWidth/mapDepth from grid for consistency (rounding may change values)
    const dims = deriveWorldDimensions(gridWidth, gridHeight);
    console.log(`  World "${world.name}" (${world._id}): ${world.mapWidth}×${world.mapDepth} → ${gridWidth}×${gridHeight} grid (${dims.mapWidth}×${dims.mapDepth})`);
    if (!DRY_RUN) {
      await worldsColl.updateOne({ _id: world._id }, {
        $set: { gridWidth, gridHeight, mapWidth: dims.mapWidth, mapDepth: dims.mapDepth, mapCenter: dims.mapCenter, updatedAt: new Date() },
      });
    }
  }

  // Also handle worlds with no mapWidth/mapDepth — give them a default 3×3 grid
  const worldsNoMap = await worldsColl.find({
    gridWidth: { $exists: false },
    $or: [{ mapWidth: { $exists: false } }, { mapWidth: null }],
  }).toArray();

  console.log(`Found ${worldsNoMap.length} worlds with no map dimensions — defaulting to 3×3`);
  for (const world of worldsNoMap) {
    console.log(`  World "${world.name}" (${world._id}): no map dims → 3×3 grid`);
    if (!DRY_RUN) {
      await worldsColl.updateOne({ _id: world._id }, {
        $set: {
          gridWidth: 3,
          gridHeight: 3,
          mapWidth: 3 * WORLD_CELL_SIZE,
          mapDepth: 3 * WORLD_CELL_SIZE,
          mapCenter: { x: 0, z: 0 },
          updatedAt: new Date(),
        },
      });
    }
  }

  // ── Step 2: Backfill countries ────────────────────────────────────────────
  console.log('\n=== Countries ===');
  const countries = await countriesColl.find({
    gridX: { $exists: false },
  }).toArray();

  console.log(`Found ${countries.length} countries needing grid backfill`);

  // Group by world for context
  const worldMap = new Map<string, any>();
  for (const world of await worldsColl.find({}).toArray()) {
    worldMap.set(world._id.toString(), world);
  }

  // Track placed countries per world to avoid overlaps
  const placedByWorld = new Map<string, Array<{ gridX: number; gridY: number; gridWidth: number; gridHeight: number }>>();

  for (const country of countries) {
    const world = worldMap.get(country.worldId);
    const wGridW = world?.gridWidth ?? 3;
    const wGridH = world?.gridHeight ?? 3;

    let grid: { gridX: number; gridY: number; gridWidth: number; gridHeight: number };

    if (country.position && country.territoryRadius) {
      grid = countryGeometryToGrid(wGridW, wGridH, country.position, country.territoryRadius);
    } else {
      // No position data — place at first available slot
      grid = { gridX: 0, gridY: 0, gridWidth: 1, gridHeight: 1 };
    }

    // Ensure no overlap with already-placed countries in this world
    const placed = placedByWorld.get(country.worldId) || [];
    const overlaps = (g: typeof grid) => placed.some(p =>
      g.gridX < p.gridX + p.gridWidth && g.gridX + g.gridWidth > p.gridX &&
      g.gridY < p.gridY + p.gridHeight && g.gridY + g.gridHeight > p.gridY
    );

    if (overlaps(grid)) {
      // Find first non-overlapping 1×1 slot
      let found = false;
      for (let y = 0; y < wGridH && !found; y++) {
        for (let x = 0; x < wGridW && !found; x++) {
          const candidate = { gridX: x, gridY: y, gridWidth: 1, gridHeight: 1 };
          if (!overlaps(candidate)) {
            grid = candidate;
            found = true;
          }
        }
      }
    }

    placed.push(grid);
    placedByWorld.set(country.worldId, placed);

    // Derive geographic fields from new grid placement
    const geo = deriveCountryGeometry(wGridW, wGridH, grid.gridX, grid.gridY, grid.gridWidth, grid.gridHeight);

    console.log(`  Country "${country.name}" (${country._id}): → grid ${grid.gridWidth}×${grid.gridHeight} at (${grid.gridX},${grid.gridY})`);
    if (!DRY_RUN) {
      await countriesColl.updateOne({ _id: country._id }, {
        $set: {
          gridX: grid.gridX,
          gridY: grid.gridY,
          gridWidth: grid.gridWidth,
          gridHeight: grid.gridHeight,
          position: geo.position,
          territoryPolygon: geo.territoryPolygon,
          territoryRadius: geo.territoryRadius,
          updatedAt: new Date(),
        },
      });
    }
  }

  // ── Step 3: Backfill settlements ──────────────────────────────────────────
  console.log('\n=== Settlements ===');
  const settlements = await settlementsColl.find({
    countryGridX: { $exists: false },
  }).toArray();

  console.log(`Found ${settlements.length} settlements needing grid backfill`);

  // Load all countries (with updated grid data)
  const allCountries = await countriesColl.find({}).toArray();
  const countryMap = new Map<string, any>();
  for (const c of allCountries) countryMap.set(c._id.toString(), c);

  // Track occupied cells per country
  const occupiedByCountry = new Map<string, Set<string>>();

  for (const settlement of settlements) {
    const country = countryMap.get(settlement.countryId);
    if (!country || country.gridWidth == null) {
      console.log(`  Settlement "${settlement.name}" (${settlement._id}): skipping — no country grid`);
      continue;
    }

    const { countryGridCols, countryGridRows } = countryInternalGridSize(country.gridWidth, country.gridHeight);
    let cellX: number, cellY: number;

    if (settlement.worldPositionX != null && settlement.worldPositionZ != null && country.position) {
      const result = settlementPositionToCountryGrid(
        country.position, countryGridCols, countryGridRows,
        settlement.worldPositionX, settlement.worldPositionZ,
      );
      cellX = result.countryGridX;
      cellY = result.countryGridY;
    } else {
      cellX = 0;
      cellY = 0;
    }

    // Ensure no duplicate occupation
    const occupied = occupiedByCountry.get(settlement.countryId) || new Set();
    const cellKey = `${cellX},${cellY}`;
    if (occupied.has(cellKey)) {
      // Find next available cell
      let found = false;
      for (let y = 0; y < countryGridRows && !found; y++) {
        for (let x = 0; x < countryGridCols && !found; x++) {
          if (!occupied.has(`${x},${y}`)) {
            cellX = x;
            cellY = y;
            found = true;
          }
        }
      }
    }
    occupied.add(`${cellX},${cellY}`);
    occupiedByCountry.set(settlement.countryId, occupied);

    // Recompute world position from grid cell
    const newPos = deriveSettlementWorldPosition(
      country.position, countryGridCols, countryGridRows, cellX, cellY,
    );

    console.log(`  Settlement "${settlement.name}" (${settlement._id}): → cell (${cellX},${cellY}), pos (${newPos.worldPositionX.toFixed(0)}, ${newPos.worldPositionZ.toFixed(0)})`);
    if (!DRY_RUN) {
      await settlementsColl.updateOne({ _id: settlement._id }, {
        $set: {
          countryGridX: cellX,
          countryGridY: cellY,
          worldPositionX: newPos.worldPositionX,
          worldPositionZ: newPos.worldPositionZ,
          updatedAt: new Date(),
        },
      });
    }
  }

  console.log('\n✅ Migration complete');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
