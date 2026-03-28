/**
 * Tests for NPC town boundary confinement.
 *
 * Verifies that NPCs are confined to their settlement zones:
 * - Wander targets are constrained within settlement boundaries
 * - Out-of-bounds positions are clamped to the boundary edge
 * - Boundary checks work correctly for various positions
 */

// ---------- Minimal Vector3 mock ----------
class Vec3 {
  constructor(public x: number, public y: number, public z: number) {}
  clone() { return new Vec3(this.x, this.y, this.z); }
  static Distance(a: Vec3, b: Vec3): number {
    const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

let passed = 0;
let failed = 0;
function assert(condition: boolean, message: string) {
  if (condition) { passed++; console.log(`  ✓ ${message}`); }
  else { failed++; console.error(`  ✗ ${message}`); }
}

// ---------- Extract the boundary logic under test ----------

interface SettlementZone {
  center: Vec3;
  radius: number;
  settlementId: string;
}

function isWithinBounds(zone: SettlementZone | undefined, position: Vec3): boolean {
  if (!zone) return true;
  const dx = position.x - zone.center.x;
  const dz = position.z - zone.center.z;
  return (dx * dx + dz * dz) <= zone.radius * zone.radius;
}

function clampToSettlementBounds(zone: SettlementZone | undefined, position: Vec3): Vec3 {
  if (!zone) return position.clone();
  const dx = position.x - zone.center.x;
  const dz = position.z - zone.center.z;
  const distSq = dx * dx + dz * dz;
  if (distSq <= zone.radius * zone.radius) return position.clone();
  const dist = Math.sqrt(distSq);
  const margin = Math.min(2.0, zone.radius * 0.05);
  const scale = (zone.radius - margin) / dist;
  return new Vec3(
    zone.center.x + dx * scale,
    position.y,
    zone.center.z + dz * scale
  );
}

function filterSidewalkNodesInBounds(nodes: Vec3[], zone: SettlementZone): Vec3[] {
  const rSq = zone.radius * zone.radius;
  return nodes.filter(node => {
    const dx = node.x - zone.center.x;
    const dz = node.z - zone.center.z;
    return dx * dx + dz * dz <= rSq;
  });
}

// ---------- Tests ----------

console.log('NPC Town Boundary Confinement Tests\n');

// --- isWithinBounds ---
console.log('isWithinBounds:');
{
  const zone: SettlementZone = {
    center: new Vec3(0, 0, 0),
    radius: 50,
    settlementId: 'town1',
  };

  assert(isWithinBounds(zone, new Vec3(0, 0, 0)), 'Center is within bounds');
  assert(isWithinBounds(zone, new Vec3(25, 0, 25)), 'Point inside boundary is within bounds');
  assert(isWithinBounds(zone, new Vec3(50, 0, 0)), 'Point on boundary edge is within bounds');
  assert(!isWithinBounds(zone, new Vec3(51, 0, 0)), 'Point outside boundary is not within bounds');
  assert(!isWithinBounds(zone, new Vec3(100, 0, 100)), 'Far point is not within bounds');
  assert(isWithinBounds(undefined, new Vec3(999, 0, 999)), 'No zone = always within bounds');
}

// --- isWithinBounds with offset center ---
console.log('\nisWithinBounds with offset center:');
{
  const zone: SettlementZone = {
    center: new Vec3(100, 0, 200),
    radius: 30,
    settlementId: 'town2',
  };

  assert(isWithinBounds(zone, new Vec3(100, 0, 200)), 'Center of offset zone is within bounds');
  assert(isWithinBounds(zone, new Vec3(120, 0, 210)), 'Point inside offset zone is within bounds');
  assert(!isWithinBounds(zone, new Vec3(0, 0, 0)), 'Origin is outside offset zone');
  assert(!isWithinBounds(zone, new Vec3(131, 0, 200)), 'Point just outside offset zone');
}

// --- clampToSettlementBounds ---
console.log('\nclampToSettlementBounds:');
{
  const zone: SettlementZone = {
    center: new Vec3(0, 0, 0),
    radius: 50,
    settlementId: 'town1',
  };

  // Inside point should be returned as-is
  const inside = clampToSettlementBounds(zone, new Vec3(10, 5, 10));
  assert(inside.x === 10 && inside.y === 5 && inside.z === 10, 'Inside point is unchanged');

  // Outside point should be clamped to boundary edge
  const outside = clampToSettlementBounds(zone, new Vec3(100, 0, 0));
  const clampedDist = Math.sqrt(outside.x * outside.x + outside.z * outside.z);
  assert(clampedDist < 50, 'Clamped point is inside boundary');
  assert(clampedDist > 45, 'Clamped point is near boundary edge');
  assert(outside.x > 0 && Math.abs(outside.z) < 0.01, 'Clamped point preserves direction');

  // No zone = position unchanged
  const noZone = clampToSettlementBounds(undefined, new Vec3(999, 0, 999));
  assert(noZone.x === 999 && noZone.z === 999, 'No zone returns position unchanged');
}

// --- clampToSettlementBounds diagonal ---
console.log('\nclampToSettlementBounds diagonal:');
{
  const zone: SettlementZone = {
    center: new Vec3(50, 0, 50),
    radius: 40,
    settlementId: 'town3',
  };

  // Point far northeast
  const far = clampToSettlementBounds(zone, new Vec3(150, 0, 150));
  const distFromCenter = Math.sqrt(
    (far.x - 50) * (far.x - 50) + (far.z - 50) * (far.z - 50)
  );
  assert(distFromCenter < 40, 'Diagonal clamped point is inside boundary');
  assert(distFromCenter > 35, 'Diagonal clamped point is near boundary edge');
  // Direction should be northeast (positive dx, positive dz)
  assert(far.x > 50 && far.z > 50, 'Diagonal clamped point preserves direction');
}

// --- clampToSettlementBounds preserves y ---
console.log('\nclampToSettlementBounds preserves y:');
{
  const zone: SettlementZone = {
    center: new Vec3(0, 0, 0),
    radius: 20,
    settlementId: 'town1',
  };

  const result = clampToSettlementBounds(zone, new Vec3(100, 7.5, 0));
  assert(result.y === 7.5, 'Y coordinate is preserved during clamping');
}

// --- filterSidewalkNodesInBounds ---
console.log('\nfilterSidewalkNodesInBounds:');
{
  const zone: SettlementZone = {
    center: new Vec3(0, 0, 0),
    radius: 50,
    settlementId: 'town1',
  };

  const nodes: Vec3[] = [
    new Vec3(10, 0, 10),   // inside
    new Vec3(30, 0, 30),   // inside (dist ~42.4)
    new Vec3(100, 0, 0),   // outside
    new Vec3(0, 0, 49),    // inside
    new Vec3(-60, 0, -60), // outside (dist ~84.9)
    new Vec3(-35, 0, 35),  // inside (dist ~49.5)
  ];

  const filtered = filterSidewalkNodesInBounds(nodes, zone);
  assert(filtered.length === 4, `4 of 6 nodes should be within bounds (got ${filtered.length})`);

  // Verify the correct nodes are included
  const filteredXs = filtered.map(n => n.x);
  assert(filteredXs.includes(10), 'Node at (10,0,10) is included');
  assert(filteredXs.includes(30), 'Node at (30,0,30) is included');
  assert(!filteredXs.includes(100), 'Node at (100,0,0) is excluded');
  assert(filteredXs.includes(0), 'Node at (0,0,49) is included');
  assert(!filteredXs.includes(-60), 'Node at (-60,0,-60) is excluded');
}

// --- filterSidewalkNodesInBounds empty result ---
console.log('\nfilterSidewalkNodesInBounds edge cases:');
{
  const zone: SettlementZone = {
    center: new Vec3(0, 0, 0),
    radius: 5,
    settlementId: 'tiny',
  };

  const farNodes = [new Vec3(100, 0, 100), new Vec3(-100, 0, -100)];
  const filtered = filterSidewalkNodesInBounds(farNodes, zone);
  assert(filtered.length === 0, 'No nodes within tiny zone');

  const emptyFiltered = filterSidewalkNodesInBounds([], zone);
  assert(emptyFiltered.length === 0, 'Empty node list returns empty result');
}

// --- Small radius margin in clamping ---
console.log('\nClamping margin behavior:');
{
  const zone: SettlementZone = {
    center: new Vec3(0, 0, 0),
    radius: 100,
    settlementId: 'large',
  };

  // Outside at distance 200 along x-axis
  const clamped = clampToSettlementBounds(zone, new Vec3(200, 0, 0));
  // Margin = min(2.0, 100 * 0.05) = min(2.0, 5.0) = 2.0
  // Expected x ≈ (100 - 2) = 98
  assert(Math.abs(clamped.x - 98) < 0.1, `Clamped to radius minus margin (got ${clamped.x.toFixed(2)})`);
}

// --- Small zone margin cap ---
console.log('\nSmall zone margin cap:');
{
  const zone: SettlementZone = {
    center: new Vec3(0, 0, 0),
    radius: 10,
    settlementId: 'small',
  };

  const clamped = clampToSettlementBounds(zone, new Vec3(50, 0, 0));
  // Margin = min(2.0, 10 * 0.05) = min(2.0, 0.5) = 0.5
  // Expected x ≈ 9.5
  assert(Math.abs(clamped.x - 9.5) < 0.1, `Small zone clamps to radius minus 0.5 (got ${clamped.x.toFixed(2)})`);
}

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
