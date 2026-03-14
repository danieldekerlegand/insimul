/**
 * Tests for address-generator.ts — spatially coherent address assignment.
 *
 * Run with: npx tsx server/generators/address-generator.test.ts
 */

import { assignAddresses, Vec2 } from './address-generator';
import { generateLotsAlongStreets, LotPosition } from './lot-generator';
import { StreetGenerator } from './street-generator';
import type { StreetNetwork, StreetEdge, StreetNode } from '../../shared/game-engine/types';
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

function getAddressedLot(lot: LotPosition): { houseNumber: number; streetName: string; address: string } {
  const a = lot as LotPosition & { houseNumber?: number; streetName?: string; address?: string };
  return {
    houseNumber: a.houseNumber ?? 0,
    streetName: a.streetName ?? '',
    address: a.address ?? '',
  };
}

// ── Build test networks ──

const gen = new StreetGenerator();
const streetConfig = {
  center: { x: 200, z: 200 },
  radius: 150,
  settlementType: 'town' as const,
  seed: 'address-test-42',
};
const center: Vec2 = { x: 200, z: 200 };

// ═══════════════════════════════════════════════
//  Test Suite 1: Simple linear street
// ═══════════════════════════════════════════════

console.log('\n═══ Test Suite 1: Simple linear street ═══');

{
  // Build a simple linear network with one street
  const nodes: StreetNode[] = [
    { id: 'n0', position: { x: 200, z: 200 }, elevation: 0, type: 'intersection' },
    { id: 'n1', position: { x: 300, z: 200 }, elevation: 0, type: 'intersection' },
  ];
  const edges: StreetEdge[] = [
    {
      id: 'e0',
      name: 'Main Street',
      fromNodeId: 'n0',
      toNodeId: 'n1',
      streetType: 'main_road',
      width: 8,
      waypoints: [
        { x: 200, y: 0, z: 200 },
        { x: 300, y: 0, z: 200 },
      ],
      length: 100,
      condition: 1,
      traffic: 0.5,
      sidewalks: true,
      hasStreetLights: true,
    },
  ];
  const network: StreetNetwork = { nodes, edges };
  const geoConfig = makeGeoConfig({ population: 40 });
  const lots = generateLotsAlongStreets(network, geoConfig);

  assert(lots.length > 0, 'Simple street generates lots');

  assignAddresses(lots, network, center);

  const addressed = lots.map(getAddressedLot);

  assert(addressed.every(a => a.houseNumber > 0), 'All lots get positive house numbers');
  assert(addressed.every(a => a.streetName === 'Main Street'), 'All lots assigned to Main Street');
  assert(addressed.every(a => a.address.includes('Main Street')), 'All addresses include street name');

  // Left side should be odd, right side should be even
  const leftLots = lots.filter(l => {
    const a = getAddressedLot(l);
    // Determine directed side — for this simple case, lot.side maps directly
    return l.side === 'left';
  });
  const rightLots = lots.filter(l => l.side === 'right');

  // Note: directed side may differ from physical side depending on edge orientation
  // We check overall: each side should have consistent parity
  if (leftLots.length > 0) {
    const leftNumbers = leftLots.map(l => getAddressedLot(l).houseNumber);
    const leftParity = leftNumbers[0] % 2;
    assert(
      leftNumbers.every(n => n % 2 === leftParity),
      `Left lots have consistent parity (all ${leftParity === 1 ? 'odd' : 'even'})`,
    );
  }
  if (rightLots.length > 0) {
    const rightNumbers = rightLots.map(l => getAddressedLot(l).houseNumber);
    const rightParity = rightNumbers[0] % 2;
    assert(
      rightNumbers.every(n => n % 2 === rightParity),
      `Right lots have consistent parity (all ${rightParity === 1 ? 'odd' : 'even'})`,
    );
  }
}

// ═══════════════════════════════════════════════
//  Test Suite 2: Odd/Even sides
// ═══════════════════════════════════════════════

console.log('\n═══ Test Suite 2: Odd/Even side verification ═══');

{
  // Edge oriented away from center (from close to far)
  const nodes: StreetNode[] = [
    { id: 'n0', position: { x: 100, z: 100 }, elevation: 0, type: 'intersection' },
    { id: 'n1', position: { x: 300, z: 100 }, elevation: 0, type: 'dead_end' },
  ];
  const edges: StreetEdge[] = [
    {
      id: 'e0',
      name: 'Oak Avenue',
      fromNodeId: 'n0',
      toNodeId: 'n1',
      streetType: 'residential',
      width: 6,
      waypoints: [
        { x: 100, y: 0, z: 100 },
        { x: 300, y: 0, z: 100 },
      ],
      length: 200,
      condition: 1,
      traffic: 0.3,
      sidewalks: true,
      hasStreetLights: false,
    },
  ];
  const network: StreetNetwork = { nodes, edges };
  // Center is at origin to ensure n0 is closer
  const testCenter: Vec2 = { x: 0, z: 0 };

  const geoConfig = makeGeoConfig({ population: 80 });
  const lots = generateLotsAlongStreets(network, geoConfig);
  assignAddresses(lots, network, testCenter);

  // With center at origin, n0 is closer. Direction away from center = from→to.
  // Left side in travel direction (from→to) = left side.
  // Left = odd, right = even.
  const leftLots = lots.filter(l => l.side === 'left').map(l => getAddressedLot(l));
  const rightLots = lots.filter(l => l.side === 'right').map(l => getAddressedLot(l));

  if (leftLots.length > 0) {
    assert(leftLots.every(a => a.houseNumber % 2 === 1), 'Left side (away from center) gets odd numbers');
  }
  if (rightLots.length > 0) {
    assert(rightLots.every(a => a.houseNumber % 2 === 0), 'Right side (away from center) gets even numbers');
  }
}

// ═══════════════════════════════════════════════
//  Test Suite 3: Monotonic increase
// ═══════════════════════════════════════════════

console.log('\n═══ Test Suite 3: Monotonic increase away from center ═══');

{
  const nodes: StreetNode[] = [
    { id: 'n0', position: { x: 0, z: 0 }, elevation: 0, type: 'intersection' },
    { id: 'n1', position: { x: 500, z: 0 }, elevation: 0, type: 'dead_end' },
  ];
  const edges: StreetEdge[] = [
    {
      id: 'e0',
      name: 'Long Road',
      fromNodeId: 'n0',
      toNodeId: 'n1',
      streetType: 'main_road',
      width: 8,
      waypoints: [
        { x: 0, y: 0, z: 0 },
        { x: 500, y: 0, z: 0 },
      ],
      length: 500,
      condition: 1,
      traffic: 0.5,
      sidewalks: true,
      hasStreetLights: true,
    },
  ];
  const network: StreetNetwork = { nodes, edges };
  const testCenter: Vec2 = { x: 0, z: 0 };
  const geoConfig = makeGeoConfig({ population: 200 });
  const lots = generateLotsAlongStreets(network, geoConfig);
  assignAddresses(lots, network, testCenter);

  // Sort lots by distance along street and check each side is monotonic
  const leftLots = lots.filter(l => l.side === 'left')
    .sort((a, b) => a.distanceAlongStreet - b.distanceAlongStreet)
    .map(l => getAddressedLot(l));

  const rightLots = lots.filter(l => l.side === 'right')
    .sort((a, b) => a.distanceAlongStreet - b.distanceAlongStreet)
    .map(l => getAddressedLot(l));

  if (leftLots.length > 1) {
    let monotonic = true;
    for (let i = 1; i < leftLots.length; i++) {
      if (leftLots[i].houseNumber <= leftLots[i - 1].houseNumber) {
        monotonic = false;
        break;
      }
    }
    assert(monotonic, 'Left side numbers increase monotonically away from center');
  }

  if (rightLots.length > 1) {
    let monotonic = true;
    for (let i = 1; i < rightLots.length; i++) {
      if (rightLots[i].houseNumber <= rightLots[i - 1].houseNumber) {
        monotonic = false;
        break;
      }
    }
    assert(monotonic, 'Right side numbers increase monotonically away from center');
  }
}

// ═══════════════════════════════════════════════
//  Test Suite 4: No duplicate addresses within settlement
// ═══════════════════════════════════════════════

console.log('\n═══ Test Suite 4: No duplicate addresses ═══');

{
  const gridNetwork = gen.generateGrid({
    ...streetConfig,
    gridSize: 6,
  });
  gen.assignStreetNames(gridNetwork, 'addr-test-grid');

  const geoConfig = makeGeoConfig({ population: 300 });
  const lots = generateLotsAlongStreets(gridNetwork, geoConfig);
  assignAddresses(lots, gridNetwork, center);

  const addresses = lots.map(l => getAddressedLot(l).address).filter(a => a.length > 0);
  const uniqueAddresses = new Set(addresses);

  assert(addresses.length > 0, `Grid layout generates addressed lots (${addresses.length})`);
  assert(uniqueAddresses.size === addresses.length, `No duplicate addresses (${uniqueAddresses.size} unique out of ${addresses.length})`);
}

// ═══════════════════════════════════════════════
//  Test Suite 5: Grid block-based numbering
// ═══════════════════════════════════════════════

console.log('\n═══ Test Suite 5: Grid block-based numbering ═══');

{
  const gridNetwork = gen.generateGrid({
    ...streetConfig,
    gridSize: 8,
  });
  gen.assignStreetNames(gridNetwork, 'addr-test-blocks');

  const geoConfig = makeGeoConfig({ population: 500 });
  const lots = generateLotsAlongStreets(gridNetwork, geoConfig);
  assignAddresses(lots, gridNetwork, center);

  const addressed = lots.map(l => getAddressedLot(l));
  const withNumbers = addressed.filter(a => a.houseNumber > 0);

  assert(withNumbers.length === lots.length, 'All lots in grid get house numbers');

  // In block-based numbering, numbers should generally be >= 100
  const blockNumbered = withNumbers.filter(a => a.houseNumber >= 100);
  // At least some lots should have block-based numbers
  assert(blockNumbered.length > 0, `Some lots have block-based numbers (${blockNumbered.length})`);
}

// ═══════════════════════════════════════════════
//  Test Suite 6: Full address format
// ═══════════════════════════════════════════════

console.log('\n═══ Test Suite 6: Full address format ═══');

{
  const nodes: StreetNode[] = [
    { id: 'n0', position: { x: 200, z: 200 }, elevation: 0, type: 'intersection' },
    { id: 'n1', position: { x: 350, z: 200 }, elevation: 0, type: 'dead_end' },
  ];
  const edges: StreetEdge[] = [
    {
      id: 'e0',
      name: 'Elm Drive',
      fromNodeId: 'n0',
      toNodeId: 'n1',
      streetType: 'residential',
      width: 6,
      waypoints: [
        { x: 200, y: 0, z: 200 },
        { x: 350, y: 0, z: 200 },
      ],
      length: 150,
      condition: 1,
      traffic: 0.3,
      sidewalks: true,
      hasStreetLights: false,
    },
  ];
  const network: StreetNetwork = { nodes, edges };
  const geoConfig = makeGeoConfig({ population: 40 });
  const lots = generateLotsAlongStreets(network, geoConfig);
  assignAddresses(lots, network, center);

  const addressed = lots.map(l => getAddressedLot(l));
  for (const a of addressed) {
    assert(
      a.address === `${a.houseNumber} ${a.streetName}`,
      `Address "${a.address}" = houseNumber + streetName`,
    );
  }
  assert(
    addressed.every(a => /^\d+ .+$/.test(a.address)),
    'All addresses match format "number streetName"',
  );
}

// ═══════════════════════════════════════════════
//  Test Suite 7: Corner lots get higher-priority street
// ═══════════════════════════════════════════════

console.log('\n═══ Test Suite 7: Corner lots prefer higher-priority street ═══');

{
  // T-intersection: main road + residential side street
  const nodes: StreetNode[] = [
    { id: 'n0', position: { x: 100, z: 200 }, elevation: 0, type: 'intersection' },
    { id: 'n1', position: { x: 200, z: 200 }, elevation: 0, type: 'intersection' },
    { id: 'n2', position: { x: 300, z: 200 }, elevation: 0, type: 'intersection' },
    { id: 'n3', position: { x: 200, z: 300 }, elevation: 0, type: 'dead_end' },
  ];
  const edges: StreetEdge[] = [
    {
      id: 'e0',
      name: 'Grand Boulevard',
      fromNodeId: 'n0',
      toNodeId: 'n1',
      streetType: 'boulevard',
      width: 10,
      waypoints: [
        { x: 100, y: 0, z: 200 },
        { x: 200, y: 0, z: 200 },
      ],
      length: 100,
      condition: 1,
      traffic: 0.8,
      sidewalks: true,
      hasStreetLights: true,
    },
    {
      id: 'e1',
      name: 'Grand Boulevard',
      fromNodeId: 'n1',
      toNodeId: 'n2',
      streetType: 'boulevard',
      width: 10,
      waypoints: [
        { x: 200, y: 0, z: 200 },
        { x: 300, y: 0, z: 200 },
      ],
      length: 100,
      condition: 1,
      traffic: 0.8,
      sidewalks: true,
      hasStreetLights: true,
    },
    {
      id: 'e2',
      name: 'Quiet Lane',
      fromNodeId: 'n1',
      toNodeId: 'n3',
      streetType: 'lane',
      width: 4,
      waypoints: [
        { x: 200, y: 0, z: 200 },
        { x: 200, y: 0, z: 300 },
      ],
      length: 100,
      condition: 1,
      traffic: 0.1,
      sidewalks: false,
      hasStreetLights: false,
    },
  ];
  const network: StreetNetwork = { nodes, edges };
  const geoConfig = makeGeoConfig({ population: 80 });
  const lots = generateLotsAlongStreets(network, geoConfig);
  assignAddresses(lots, network, { x: 200, z: 200 });

  // Lots on the lane that are very close to the intersection node (n1)
  // should get reassigned to Grand Boulevard if they qualify as corner lots
  const laneLots = lots.filter(l => l.streetEdgeId === 'e2');
  if (laneLots.length > 0) {
    const nearIntersection = laneLots.filter(l => l.distanceAlongStreet < 10);
    const addressed = nearIntersection.map(l => getAddressedLot(l));
    // Corner lots near intersection should prefer boulevard
    const onBoulevard = addressed.filter(a => a.streetName === 'Grand Boulevard');
    if (nearIntersection.length > 0) {
      assert(
        onBoulevard.length > 0 || nearIntersection.length === 0,
        `Corner lots near intersection reassigned to higher-priority street (${onBoulevard.length}/${nearIntersection.length})`,
      );
    } else {
      assert(true, 'No lots close enough to intersection for corner reassignment');
    }
  } else {
    assert(true, 'No lane lots generated (low density expected)');
  }
}

// ═══════════════════════════════════════════════
//  Test Suite 8: Organic layout
// ═══════════════════════════════════════════════

console.log('\n═══ Test Suite 8: Organic layout addressing ═══');

{
  const organicNetwork = gen.generateOrganic({
    ...streetConfig,
    seed: 'addr-organic-test',
  });
  gen.assignStreetNames(organicNetwork, 'addr-organic-test');

  const geoConfig = makeGeoConfig({ population: 200 });
  const lots = generateLotsAlongStreets(organicNetwork, geoConfig);
  assignAddresses(lots, organicNetwork, center);

  const addressed = lots.map(l => getAddressedLot(l));
  const withAddresses = addressed.filter(a => a.address.length > 0);

  assert(withAddresses.length === lots.length, `All organic lots get addresses (${withAddresses.length}/${lots.length})`);

  // No duplicates
  const uniqueAddresses = new Set(withAddresses.map(a => a.address));
  assert(uniqueAddresses.size === withAddresses.length, `No duplicate addresses in organic layout (${uniqueAddresses.size}/${withAddresses.length})`);

  // All positive house numbers
  assert(withAddresses.every(a => a.houseNumber > 0), 'All organic lots have positive house numbers');
}

// ═══════════════════════════════════════════════
//  Test Suite 9: Empty inputs
// ═══════════════════════════════════════════════

console.log('\n═══ Test Suite 9: Edge cases ═══');

{
  // Empty lots
  assignAddresses([], { nodes: [], edges: [] }, center);
  assert(true, 'Empty lots + empty network does not throw');

  // Lots with no network
  const dummyLot: LotPosition = {
    position: { x: 100, y: 0, z: 100 },
    facingAngle: 0,
    width: 12,
    depth: 16,
    side: 'left',
    distanceAlongStreet: 5,
    streetEdgeId: 'nonexistent',
  };
  assignAddresses([dummyLot], { nodes: [], edges: [] }, center);
  assert(true, 'Lots with empty network does not throw');
}

// ═══════════════════════════════════════════════
//  Test Suite 10: Distance-proportional gaps
// ═══════════════════════════════════════════════

console.log('\n═══ Test Suite 10: Distance-proportional number gaps ═══');

{
  const nodes: StreetNode[] = [
    { id: 'n0', position: { x: 0, z: 0 }, elevation: 0, type: 'intersection' },
    { id: 'n1', position: { x: 1000, z: 0 }, elevation: 0, type: 'dead_end' },
  ];
  const edges: StreetEdge[] = [
    {
      id: 'e0',
      name: 'Wide Street',
      fromNodeId: 'n0',
      toNodeId: 'n1',
      streetType: 'main_road',
      width: 8,
      waypoints: [
        { x: 0, y: 0, z: 0 },
        { x: 1000, y: 0, z: 0 },
      ],
      length: 1000,
      condition: 1,
      traffic: 0.5,
      sidewalks: true,
      hasStreetLights: true,
    },
  ];
  const network: StreetNetwork = { nodes, edges };
  const geoConfig = makeGeoConfig({ population: 400, settlementType: 'city' });
  const lots = generateLotsAlongStreets(network, geoConfig);
  assignAddresses(lots, network, { x: 0, z: 0 });

  // Get left-side lots sorted by distance
  const leftLots = lots.filter(l => l.side === 'left')
    .sort((a, b) => a.distanceAlongStreet - b.distanceAlongStreet);

  if (leftLots.length >= 3) {
    const nums = leftLots.map(l => getAddressedLot(l).houseNumber);
    // Numbers should have gaps (not all consecutive odd)
    const hasGaps = nums.some((n, i) => i > 0 && (n - nums[i - 1]) > 2);
    assert(hasGaps || nums.length <= 2, 'Number gaps exist (proportional to physical distance)');
  } else {
    assert(true, 'Not enough lots for gap test');
  }
}

// ═══════════════════════════════════════════════

console.log(`\n═══ Results: ${passed} passed, ${failed} failed ═══`);
if (failed > 0) process.exit(1);
