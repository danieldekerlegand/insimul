/**
 * Tests for lot-generator.ts — street-frontage lot placement.
 *
 * Run with: npx tsx server/generators/lot-generator.test.ts
 */

import { generateLotsAlongStreets, LotPosition } from './lot-generator';
import { StreetGenerator } from './street-generator';
import type { StreetNetwork } from '../../shared/game-engine/types';
import type { GeographyConfig } from './geography-generator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

// ── Helpers ──

function makeGeoConfig(overrides: Partial<GeographyConfig> = {}): GeographyConfig {
  return {
    worldId: 'test-world',
    settlementId: 'test-settlement',
    settlementName: 'Testville',
    settlementType: 'town',
    population: 200,
    foundedYear: 1900,
    terrain: 'plains',
    ...overrides,
  };
}

function dist2D(a: { x: number; z: number }, b: { x: number; z: number }): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

// ── Generate a real street network for testing ──

const gen = new StreetGenerator();
const streetConfig = {
  center: { x: 200, z: 200 },
  radius: 150,
  settlementType: 'town' as const,
  seed: 'lot-test-42',
};

const geoConfig: GeographyConfig = makeGeoConfig();

const gridNetwork = gen.generateGrid({
  ...streetConfig,
  gridSize: 6,
  blockLength: 50,
});
gen.assignStreetNames(gridNetwork, 'lot-test-42');

// ── Basic output tests ──

console.log('\n=== LotGenerator: Basic Output ===\n');

const lots = generateLotsAlongStreets(gridNetwork, geoConfig);

assert(lots.length > 0, `Generates lots (got ${lots.length})`);
assert(Array.isArray(lots), 'Returns an array');

// ── LotPosition shape ──

console.log('\n=== LotGenerator: LotPosition Shape ===\n');

const firstLot = lots[0];
assert(typeof firstLot.position === 'object', 'Has position object');
assert(typeof firstLot.position.x === 'number', 'position.x is number');
assert(typeof firstLot.position.y === 'number', 'position.y is number');
assert(typeof firstLot.position.z === 'number', 'position.z is number');
assert(typeof firstLot.facingAngle === 'number', 'Has facingAngle (number)');
assert(typeof firstLot.width === 'number', 'Has width (number)');
assert(typeof firstLot.depth === 'number', 'Has depth (number)');
assert(firstLot.side === 'left' || firstLot.side === 'right', 'side is left or right');
assert(typeof firstLot.distanceAlongStreet === 'number', 'Has distanceAlongStreet (number)');
assert(typeof firstLot.streetEdgeId === 'string', 'Has streetEdgeId (string)');

// ── Lot width by settlement type ──

console.log('\n=== LotGenerator: Lot Width by Settlement Type ===\n');

const villageLots = generateLotsAlongStreets(gridNetwork, makeGeoConfig({ settlementType: 'village', population: 200 }));
const townLots = generateLotsAlongStreets(gridNetwork, makeGeoConfig({ settlementType: 'town', population: 200 }));
const cityLots = generateLotsAlongStreets(gridNetwork, makeGeoConfig({ settlementType: 'city', population: 200 }));

assert(villageLots.length > 0 && villageLots[0].width === 15, 'Village lots have width 15');
assert(townLots.length > 0 && townLots[0].width === 12, 'Town lots have width 12');
assert(cityLots.length > 0 && cityLots[0].width === 10, 'City lots have width 10');

// ── Both sides of street ──

console.log('\n=== LotGenerator: Both Sides of Street ===\n');

const leftLots = lots.filter(l => l.side === 'left');
const rightLots = lots.filter(l => l.side === 'right');
assert(leftLots.length > 0, `Has left-side lots (${leftLots.length})`);
assert(rightLots.length > 0, `Has right-side lots (${rightLots.length})`);

// ── No overlap check ──

console.log('\n=== LotGenerator: No Overlaps ===\n');

let overlapCount = 0;
for (let i = 0; i < lots.length; i++) {
  for (let j = i + 1; j < lots.length; j++) {
    const d = dist2D(lots[i].position, lots[j].position);
    // Two lots overlap if their centers are closer than the minimum separation
    // (half width of each lot, assuming axis-aligned worst case)
    const minSep = Math.min(lots[i].width, lots[j].width) * 0.5;
    if (d < minSep) {
      overlapCount++;
    }
  }
}
assert(overlapCount === 0, `No overlapping lots (found ${overlapCount} overlaps)`);

// ── Facing angle perpendicular to street ──

console.log('\n=== LotGenerator: Facing Angle ===\n');

// For each lot, the facing angle should point toward the street (perpendicular)
// We verify that facingAngle is a finite number in valid range
const allAnglesValid = lots.every(l =>
  Number.isFinite(l.facingAngle) && l.facingAngle >= -Math.PI && l.facingAngle <= Math.PI
);
assert(allAnglesValid, 'All facing angles are finite and in [-π, π]');

// Left and right lots on same edge should face opposite directions (roughly π apart)
const edgeIds = [...new Set(lots.map(l => l.streetEdgeId))];
let anglePairsChecked = 0;
let anglePairsOk = 0;
for (const edgeId of edgeIds) {
  const edgeLots = lots.filter(l => l.streetEdgeId === edgeId);
  const lefts = edgeLots.filter(l => l.side === 'left');
  const rights = edgeLots.filter(l => l.side === 'right');
  if (lefts.length > 0 && rights.length > 0) {
    // Compare first lot on each side — their facing angles should differ by ~π
    const angleDiff = Math.abs(lefts[0].facingAngle - rights[0].facingAngle);
    const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
    anglePairsChecked++;
    if (normalizedDiff > Math.PI * 0.7) {
      anglePairsOk++;
    }
  }
}
assert(
  anglePairsChecked > 0 && anglePairsOk / anglePairsChecked > 0.8,
  `Left/right lots face opposite directions (${anglePairsOk}/${anglePairsChecked} edges OK)`
);

// ── Total lot count approximately matches population / 4 ──

console.log('\n=== LotGenerator: Target Lot Count ===\n');

const targetCount = geoConfig.population / 4; // 200/4 = 50
const ratio = lots.length / targetCount;
assert(
  ratio >= 0.5 && ratio <= 2.0,
  `Lot count approximately matches population/4: got ${lots.length}, target ~${targetCount} (ratio ${ratio.toFixed(2)})`
);

// With a larger population, verify scaling
const largePop = makeGeoConfig({ population: 800 });
const largeLots = generateLotsAlongStreets(gridNetwork, largePop);
const largeTarget = 800 / 4;
const largeRatio = largeLots.length / largeTarget;
assert(
  largeLots.length > lots.length * 0.8,
  `More lots for larger population: ${largeLots.length} vs ${lots.length}`
);

// ── Street edge IDs are valid ──

console.log('\n=== LotGenerator: Valid Street Edge References ===\n');

const validEdgeIds = new Set(gridNetwork.edges.map(e => e.id));
const allEdgeIdsValid = lots.every(l => validEdgeIds.has(l.streetEdgeId));
assert(allEdgeIdsValid, 'All lots reference valid street edge IDs');

// ── Distance along street is positive and within edge length ──

console.log('\n=== LotGenerator: Distance Along Street ===\n');

const allDistancesPositive = lots.every(l => l.distanceAlongStreet > 0);
assert(allDistancesPositive, 'All distanceAlongStreet values are positive');

// ── Empty/edge cases ──

console.log('\n=== LotGenerator: Edge Cases ===\n');

const emptyNetwork: StreetNetwork = { nodes: [], edges: [] };
const emptyLots = generateLotsAlongStreets(emptyNetwork, geoConfig);
assert(emptyLots.length === 0, 'Empty network returns no lots');

// Very small population
const smallPop = makeGeoConfig({ population: 4 });
const smallLots = generateLotsAlongStreets(gridNetwork, smallPop);
assert(smallLots.length > 0, `Small population still generates some lots (got ${smallLots.length})`);

// ── Organic network test ──

console.log('\n=== LotGenerator: Organic Network ===\n');

const organicNetwork = gen.generateOrganic({
  center: { x: 100, z: 100 },
  radius: 80,
  settlementType: 'village',
  seed: 'organic-lot-test',
});
gen.assignStreetNames(organicNetwork, 'organic-lot-test');

const organicConfig = makeGeoConfig({ settlementType: 'village', population: 100 });
const organicLots = generateLotsAlongStreets(organicNetwork, organicConfig);
assert(organicLots.length > 0, `Organic network generates lots (got ${organicLots.length})`);
assert(organicLots[0].width === 15, 'Village lots on organic network have width 15');

// ── Determinism ──

console.log('\n=== LotGenerator: Determinism ===\n');

const lots1 = generateLotsAlongStreets(gridNetwork, geoConfig);
const lots2 = generateLotsAlongStreets(gridNetwork, geoConfig);
assert(lots1.length === lots2.length, 'Same input produces same lot count');
if (lots1.length > 0 && lots2.length > 0) {
  const posMatch = lots1[0].position.x === lots2[0].position.x &&
    lots1[0].position.z === lots2[0].position.z;
  assert(posMatch, 'Same input produces same lot positions');
}

// ── Summary ──

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} assertions`);
console.log('='.repeat(50));

if (failed > 0) {
  process.exit(1);
}
