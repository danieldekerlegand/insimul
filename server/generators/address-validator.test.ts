/**
 * Tests for address-validator.ts — post-generation address validation and auto-fix.
 *
 * Run with: npx tsx server/generators/address-validator.test.ts
 */

import { validateAddresses, ValidationResult } from './address-validator';
import type { LotPosition } from './lot-generator';
import type { StreetNetwork, StreetEdge, StreetNode } from '../../shared/game-engine/types';

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

function makeLot(overrides: Partial<LotPosition & { houseNumber?: number; streetName?: string; address?: string }> = {}): LotPosition {
  return {
    position: { x: 100, y: 0, z: 100 },
    facingAngle: 0,
    width: 12,
    depth: 16,
    side: 'left' as const,
    distanceAlongStreet: 10,
    streetEdgeId: 'edge-1',
    ...overrides,
  };
}

function makeEdge(overrides: Partial<StreetEdge> = {}): StreetEdge {
  return {
    id: 'edge-1',
    fromNodeId: 'node-1',
    toNodeId: 'node-2',
    streetType: 'residential',
    width: 3,
    waypoints: [
      { x: 50, y: 0, z: 100 },
      { x: 150, y: 0, z: 100 },
    ],
    length: 100,
    name: 'Oak Ave',
    ...overrides,
  };
}

function makeNetwork(edges: StreetEdge[] = [], nodes: StreetNode[] = []): StreetNetwork {
  return {
    nodes: nodes.length > 0 ? nodes : [
      { id: 'node-1', position: { x: 50, y: 0, z: 100 }, connections: ['edge-1'] },
      { id: 'node-2', position: { x: 150, y: 0, z: 100 }, connections: ['edge-1'] },
    ],
    edges: edges.length > 0 ? edges : [makeEdge()],
  };
}

type AddressedLot = LotPosition & { houseNumber?: number; streetName?: string; address?: string };

// ══════════════════════════════════════════════════════
// Test 1: Valid lots produce valid result with no errors
// ══════════════════════════════════════════════════════
console.log('\nTest 1: Valid lots with no issues');
{
  const lots: AddressedLot[] = [
    { ...makeLot({ streetEdgeId: 'edge-1', distanceAlongStreet: 10, side: 'left' }), houseNumber: 1, streetName: 'Oak Ave', address: '1 Oak Ave' },
    { ...makeLot({ streetEdgeId: 'edge-1', distanceAlongStreet: 30, side: 'left' }), houseNumber: 3, streetName: 'Oak Ave', address: '3 Oak Ave' },
    { ...makeLot({ streetEdgeId: 'edge-1', distanceAlongStreet: 20, side: 'right' }), houseNumber: 2, streetName: 'Oak Ave', address: '2 Oak Ave' },
  ];
  const network = makeNetwork();
  const result = validateAddresses(lots, network);
  assert(result.valid === true, 'Result is valid');
  assert(result.errors.length === 0, 'No errors');
  assert(result.warnings.length === 0, 'No warnings');
  assert(result.fixesApplied.length === 0, 'No fixes applied');
}

// ══════════════════════════════════════════════════════
// Test 2: Empty lots returns valid
// ══════════════════════════════════════════════════════
console.log('\nTest 2: Empty lots');
{
  const result = validateAddresses([], makeNetwork());
  assert(result.valid === true, 'Empty lots is valid');
}

// ══════════════════════════════════════════════════════
// Test 3: Invalid street edge reference
// ══════════════════════════════════════════════════════
console.log('\nTest 3: Invalid street edge reference');
{
  const lots: AddressedLot[] = [
    { ...makeLot({ streetEdgeId: 'nonexistent-edge' }), houseNumber: 1, streetName: 'Oak Ave', address: '1 Oak Ave' },
  ];
  const network = makeNetwork();
  const result = validateAddresses(lots, network);
  assert(result.valid === false, 'Result is invalid');
  assert(result.errors.length === 1, 'One error');
  assert(result.errors[0].includes('nonexistent-edge'), 'Error mentions the bad edge ID');
}

// ══════════════════════════════════════════════════════
// Test 4: Duplicate addresses auto-fixed
// ══════════════════════════════════════════════════════
console.log('\nTest 4: Duplicate addresses auto-fixed');
{
  const lots: AddressedLot[] = [
    { ...makeLot({ distanceAlongStreet: 10 }), houseNumber: 5, streetName: 'Oak Ave', address: '5 Oak Ave' },
    { ...makeLot({ distanceAlongStreet: 20 }), houseNumber: 5, streetName: 'Oak Ave', address: '5 Oak Ave' },
    { ...makeLot({ distanceAlongStreet: 30 }), houseNumber: 5, streetName: 'Oak Ave', address: '5 Oak Ave' },
  ];
  const network = makeNetwork();
  const result = validateAddresses(lots, network);
  assert(result.valid === true, 'Result is valid (duplicates auto-fixed)');
  assert(result.fixesApplied.length === 2, 'Two fixes applied');
  assert(lots[0].address === '5 Oak Ave', 'First lot keeps original address');
  assert(lots[1].address === '5A Oak Ave', 'Second lot gets suffix A');
  assert(lots[2].address === '5B Oak Ave', 'Third lot gets suffix B');

  // All addresses now unique
  const addresses = lots.map(l => l.address);
  const unique = new Set(addresses);
  assert(unique.size === addresses.length, 'All addresses unique after fix');
}

// ══════════════════════════════════════════════════════
// Test 5: Street name doesn't exist in network
// ══════════════════════════════════════════════════════
console.log('\nTest 5: Street name not in network');
{
  const lots: AddressedLot[] = [
    { ...makeLot({ streetEdgeId: 'edge-1' }), houseNumber: 1, streetName: 'Phantom St', address: '1 Phantom St' },
  ];
  const edge = makeEdge({ name: 'Oak Ave' });
  const network = makeNetwork([edge]);
  const result = validateAddresses(lots, network);
  assert(result.valid === false, 'Result is invalid');
  assert(result.errors.some(e => e.includes('Phantom St')), 'Error mentions mismatched street name');
}

// ══════════════════════════════════════════════════════
// Test 6: Corner lot reassigned to different street is OK
// ══════════════════════════════════════════════════════
console.log('\nTest 6: Corner lot on reassigned street (valid)');
{
  const edge1 = makeEdge({ id: 'edge-1', name: 'Oak Ave' });
  const edge2 = makeEdge({ id: 'edge-2', name: 'Elm St', fromNodeId: 'node-2', toNodeId: 'node-3' });
  const nodes: StreetNode[] = [
    { id: 'node-1', position: { x: 50, y: 0, z: 100 }, connections: ['edge-1'] },
    { id: 'node-2', position: { x: 150, y: 0, z: 100 }, connections: ['edge-1', 'edge-2'] },
    { id: 'node-3', position: { x: 150, y: 0, z: 200 }, connections: ['edge-2'] },
  ];
  // Lot on edge-1 but assigned to Elm St (corner reassignment)
  const lots: AddressedLot[] = [
    { ...makeLot({ streetEdgeId: 'edge-1' }), houseNumber: 1, streetName: 'Elm St', address: '1 Elm St' },
  ];
  const network = makeNetwork([edge1, edge2], nodes);
  const result = validateAddresses(lots, network);
  assert(result.valid === true, 'Corner lot reassignment is valid');
  assert(result.errors.length === 0, 'No errors for valid corner reassignment');
}

// ══════════════════════════════════════════════════════
// Test 7: Non-monotonic house numbers produce warning
// ══════════════════════════════════════════════════════
console.log('\nTest 7: Non-monotonic house numbers');
{
  const lots: AddressedLot[] = [
    { ...makeLot({ distanceAlongStreet: 10, side: 'left' }), houseNumber: 5, streetName: 'Oak Ave', address: '5 Oak Ave' },
    { ...makeLot({ distanceAlongStreet: 30, side: 'left' }), houseNumber: 3, streetName: 'Oak Ave', address: '3 Oak Ave' },
    { ...makeLot({ distanceAlongStreet: 50, side: 'left' }), houseNumber: 7, streetName: 'Oak Ave', address: '7 Oak Ave' },
  ];
  const network = makeNetwork();
  const result = validateAddresses(lots, network);
  assert(result.valid === true, 'Non-monotonic is a warning, not an error');
  assert(result.warnings.length === 1, 'One warning for non-monotonic numbers');
  assert(result.warnings[0].includes('Non-monotonic'), 'Warning mentions non-monotonic');
  assert(result.warnings[0].includes('#5') && result.warnings[0].includes('#3'), 'Warning shows the out-of-order numbers');
}

// ══════════════════════════════════════════════════════
// Test 8: Lots without addresses are gracefully skipped
// ══════════════════════════════════════════════════════
console.log('\nTest 8: Lots without addresses');
{
  const lots = [makeLot()]; // No address fields set
  const network = makeNetwork();
  const result = validateAddresses(lots, network);
  assert(result.valid === true, 'Lots without addresses pass validation');
  assert(result.errors.length === 0, 'No errors for unaddressed lots');
}

// ══════════════════════════════════════════════════════
// Test 9: Multiple errors and warnings combined
// ══════════════════════════════════════════════════════
console.log('\nTest 9: Multiple issues combined');
{
  const lots: AddressedLot[] = [
    { ...makeLot({ streetEdgeId: 'bad-edge' }), houseNumber: 1, streetName: 'Oak Ave', address: '1 Oak Ave' },
    { ...makeLot({ distanceAlongStreet: 10, side: 'left' }), houseNumber: 5, streetName: 'Oak Ave', address: '5 Oak Ave' },
    { ...makeLot({ distanceAlongStreet: 30, side: 'left' }), houseNumber: 5, streetName: 'Oak Ave', address: '5 Oak Ave' },
    { ...makeLot({ distanceAlongStreet: 50, side: 'left' }), houseNumber: 3, streetName: 'Oak Ave', address: '3 Oak Ave' },
  ];
  const network = makeNetwork();
  const result = validateAddresses(lots, network);
  assert(result.valid === false, 'Invalid due to bad edge reference');
  assert(result.errors.length >= 1, 'At least one error');
  assert(result.fixesApplied.length >= 1, 'At least one duplicate fix applied');
  assert(result.warnings.length >= 1, 'At least one monotonicity warning');
}

// ══════════════════════════════════════════════════════
// Test 10: Duplicate fix with collision avoidance
// ══════════════════════════════════════════════════════
console.log('\nTest 10: Duplicate fix avoids creating new collisions');
{
  const lots: AddressedLot[] = [
    { ...makeLot({ distanceAlongStreet: 10 }), houseNumber: 5, streetName: 'Oak Ave', address: '5 Oak Ave' },
    { ...makeLot({ distanceAlongStreet: 20 }), houseNumber: 5, streetName: 'Oak Ave', address: '5 Oak Ave' },
    // Lot already has the address that would be the first suffix attempt
    { ...makeLot({ distanceAlongStreet: 30 }), houseNumber: undefined, streetName: 'Oak Ave', address: '5A Oak Ave' },
  ];
  const network = makeNetwork();
  const result = validateAddresses(lots, network);
  assert(result.fixesApplied.length >= 1, 'Fix applied');
  // The duplicate should get 5B since 5A already exists
  assert(lots[1].address === '5B Oak Ave', 'Skips 5A (already taken) and uses 5B');
}

// ══════════════════════════════════════════════════════
// Summary
// ══════════════════════════════════════════════════════
console.log(`\n${'═'.repeat(50)}`);
console.log(`Address Validator Tests: ${passed} passed, ${failed} failed out of ${passed + failed}`);
if (failed > 0) process.exit(1);
