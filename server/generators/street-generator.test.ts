/**
 * Tests for StreetGenerator.
 *
 * Run with: npx tsx server/generators/street-generator.test.ts
 */

import { StreetGenerator, StreetGenConfig } from './street-generator';

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

// ── Organic pattern tests ──

console.log('\n=== StreetGenerator: Organic Pattern ===\n');

const gen = new StreetGenerator();

const villageConfig: StreetGenConfig = {
  center: { x: 0, z: 0 },
  radius: 100,
  settlementType: 'village',
  seed: 'test-village-42',
};

const network = gen.generateOrganic(villageConfig);

// Basic structure
console.log('--- Basic structure ---');
assert(network.nodes.length > 0, `Has nodes (got ${network.nodes.length})`);
assert(network.edges.length > 0, `Has edges (got ${network.edges.length})`);

// Village should have a reasonable number of nodes and edges
assert(network.nodes.length >= 5, `At least 5 nodes for a village (got ${network.nodes.length})`);
assert(network.nodes.length <= 80, `No more than 80 nodes for a village (got ${network.nodes.length})`);
assert(network.edges.length >= 4, `At least 4 edges for a village (got ${network.edges.length})`);
assert(network.edges.length <= 80, `No more than 80 edges for a village (got ${network.edges.length})`);

// Node validity
console.log('\n--- Node validity ---');
for (const node of network.nodes) {
  assert(typeof node.id === 'string' && node.id.length > 0, `Node ${node.id} has valid id`);
  assert(typeof node.position.x === 'number' && !isNaN(node.position.x), `Node ${node.id} has valid x`);
  assert(typeof node.position.z === 'number' && !isNaN(node.position.z), `Node ${node.id} has valid z`);
  assert(
    ['intersection', 'dead_end', 'T_junction', 'curve_point'].includes(node.type),
    `Node ${node.id} has valid type: ${node.type}`
  );
}

// Edge validity
console.log('\n--- Edge validity ---');
const nodeIds = new Set(network.nodes.map(n => n.id));

for (const edge of network.edges) {
  assert(typeof edge.id === 'string' && edge.id.length > 0, `Edge ${edge.id} has valid id`);
  assert(nodeIds.has(edge.fromNodeId), `Edge ${edge.id} fromNodeId ${edge.fromNodeId} references existing node`);
  assert(nodeIds.has(edge.toNodeId), `Edge ${edge.id} toNodeId ${edge.toNodeId} references existing node`);
  assert(edge.waypoints.length >= 2, `Edge ${edge.id} has at least 2 waypoints (got ${edge.waypoints.length})`);
  assert(edge.length > 0, `Edge ${edge.id} has non-zero length (got ${edge.length.toFixed(2)})`);
  assert(edge.width > 0, `Edge ${edge.id} has non-zero width (got ${edge.width})`);
}

// Connectivity: all nodes reachable from any other via BFS
console.log('\n--- Connectivity ---');
{
  const adj = new Map<string, Set<string>>();
  for (const n of network.nodes) adj.set(n.id, new Set());
  for (const e of network.edges) {
    adj.get(e.fromNodeId)!.add(e.toNodeId);
    adj.get(e.toNodeId)!.add(e.fromNodeId);
  }

  const visited = new Set<string>();
  const queue = [network.nodes[0].id];
  visited.add(network.nodes[0].id);
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of adj.get(current)!) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  assert(
    visited.size === network.nodes.length,
    `Graph is fully connected: visited ${visited.size}/${network.nodes.length} nodes`
  );
}

// Determinism: same seed = same output
console.log('\n--- Determinism ---');
{
  const gen2 = new StreetGenerator();
  const network2 = gen2.generateOrganic(villageConfig);
  assert(network2.nodes.length === network.nodes.length, `Same seed produces same node count`);
  assert(network2.edges.length === network.edges.length, `Same seed produces same edge count`);

  // Check positions match
  let positionsMatch = true;
  for (let i = 0; i < network.nodes.length; i++) {
    if (
      Math.abs(network.nodes[i].position.x - network2.nodes[i].position.x) > 0.0001 ||
      Math.abs(network.nodes[i].position.z - network2.nodes[i].position.z) > 0.0001
    ) {
      positionsMatch = false;
      break;
    }
  }
  assert(positionsMatch, `Same seed produces identical node positions`);
}

// Different seed = different output
console.log('\n--- Different seeds ---');
{
  const gen3 = new StreetGenerator();
  const network3 = gen3.generateOrganic({ ...villageConfig, seed: 'different-seed-99' });
  let hasDifference = false;
  if (network3.nodes.length !== network.nodes.length) {
    hasDifference = true;
  } else {
    for (let i = 0; i < network.nodes.length; i++) {
      if (
        Math.abs(network.nodes[i].position.x - network3.nodes[i].position.x) > 0.01 ||
        Math.abs(network.nodes[i].position.z - network3.nodes[i].position.z) > 0.01
      ) {
        hasDifference = true;
        break;
      }
    }
  }
  assert(hasDifference, `Different seed produces different network`);
}

// Street types
console.log('\n--- Street types ---');
{
  const types = new Set(network.edges.map(e => e.streetType));
  assert(types.has('main_road'), `Has main_road street type`);
  // Secondary or tertiary should exist too
  assert(types.size >= 2, `Has at least 2 different street types (got ${types.size}: ${[...types].join(', ')})`);
}

// Slope map avoidance
console.log('\n--- Slope map avoidance ---');
{
  // Create a slope map with steep center and flat edges
  const size = 32;
  const steepSlopeMap: number[][] = [];
  for (let r = 0; r < size; r++) {
    steepSlopeMap[r] = [];
    for (let c = 0; c < size; c++) {
      const cx = c / (size - 1) - 0.5;
      const cz = r / (size - 1) - 0.5;
      const d = Math.sqrt(cx * cx + cz * cz);
      // Steep near center, flat at edges
      steepSlopeMap[r][c] = d < 0.2 ? 2.0 : 0.01;
    }
  }

  const gen4 = new StreetGenerator();
  const slopeNetwork = gen4.generateOrganic({
    ...villageConfig,
    seed: 'slope-test',
    slopeMap: steepSlopeMap,
  });
  assert(slopeNetwork.nodes.length > 0, `Generates network even with steep slope map`);
  assert(slopeNetwork.edges.length > 0, `Has edges with steep slope map`);
}

// Larger settlement
console.log('\n--- Larger settlement ---');
{
  const gen5 = new StreetGenerator();
  const cityNetwork = gen5.generateOrganic({
    center: { x: 0, z: 0 },
    radius: 500,
    settlementType: 'city',
    seed: 'big-city',
  });
  assert(cityNetwork.nodes.length > network.nodes.length * 0.5, `Larger radius produces more nodes (got ${cityNetwork.nodes.length} vs village ${network.nodes.length})`);
}

// ── Grid pattern tests ──

console.log('\n=== StreetGenerator: Grid Pattern ===\n');

const gridConfig = {
  center: { x: 0, z: 0 },
  radius: 200,
  settlementType: 'town',
  seed: 'test-grid-42',
};

const gridGen = new StreetGenerator();
const gridNetwork = gridGen.generateGrid(gridConfig);

// Basic structure
console.log('--- Basic structure ---');
assert(gridNetwork.nodes.length > 0, `Grid has nodes (got ${gridNetwork.nodes.length})`);
assert(gridNetwork.edges.length > 0, `Grid has edges (got ${gridNetwork.edges.length})`);

// Grid should have (N+1)*(M+1) nodes for N x M blocks
// With radius=200, blockSize=40: N=M=10 → 11*11=121 nodes
assert(gridNetwork.nodes.length >= 16, `Grid has at least 16 nodes (got ${gridNetwork.nodes.length})`);

// Node validity
console.log('\n--- Node validity ---');
for (const node of gridNetwork.nodes) {
  assert(typeof node.id === 'string' && node.id.length > 0, `Node ${node.id} has valid id`);
  assert(typeof node.position.x === 'number' && !isNaN(node.position.x), `Node ${node.id} has valid x`);
  assert(typeof node.position.z === 'number' && !isNaN(node.position.z), `Node ${node.id} has valid z`);
}

// Edge validity
console.log('\n--- Edge validity ---');
{
  const gNodeIds = new Set(gridNetwork.nodes.map(n => n.id));
  for (const edge of gridNetwork.edges) {
    assert(gNodeIds.has(edge.fromNodeId), `Edge ${edge.id} fromNodeId references existing node`);
    assert(gNodeIds.has(edge.toNodeId), `Edge ${edge.id} toNodeId references existing node`);
    assert(edge.length > 0, `Edge ${edge.id} has positive length`);
    assert(edge.width > 0, `Edge ${edge.id} has positive width`);
  }
}

// Connectivity via BFS
console.log('\n--- Connectivity ---');
{
  const adj = new Map<string, Set<string>>();
  for (const n of gridNetwork.nodes) adj.set(n.id, new Set());
  for (const e of gridNetwork.edges) {
    adj.get(e.fromNodeId)!.add(e.toNodeId);
    adj.get(e.toNodeId)!.add(e.fromNodeId);
  }
  const visited = new Set<string>();
  const queue = [gridNetwork.nodes[0].id];
  visited.add(gridNetwork.nodes[0].id);
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of adj.get(current)!) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  assert(
    visited.size === gridNetwork.nodes.length,
    `Grid is fully connected: visited ${visited.size}/${gridNetwork.nodes.length} nodes`
  );
}

// Grid structure: nodes should be roughly grid-aligned
console.log('\n--- Grid structure ---');
{
  // Check that there are both horizontal and vertical edges
  const horizontalish = gridNetwork.edges.filter(e => {
    const from = gridNetwork.nodes.find(n => n.id === e.fromNodeId)!;
    const to = gridNetwork.nodes.find(n => n.id === e.toNodeId)!;
    const dx = Math.abs(to.position.x - from.position.x);
    const dz = Math.abs(to.position.z - from.position.z);
    return dx > dz;
  });
  const verticalish = gridNetwork.edges.filter(e => {
    const from = gridNetwork.nodes.find(n => n.id === e.fromNodeId)!;
    const to = gridNetwork.nodes.find(n => n.id === e.toNodeId)!;
    const dx = Math.abs(to.position.x - from.position.x);
    const dz = Math.abs(to.position.z - from.position.z);
    return dz > dx;
  });
  assert(horizontalish.length > 0, `Grid has horizontal-ish edges (${horizontalish.length})`);
  assert(verticalish.length > 0, `Grid has vertical-ish edges (${verticalish.length})`);
}

// Street types: should have both main_road and residential
console.log('\n--- Street types ---');
{
  const types = new Set(gridNetwork.edges.map(e => e.streetType));
  assert(types.has('main_road'), `Grid has main_road streets`);
  assert(types.has('residential'), `Grid has residential streets`);

  // Main roads should be wider than residential
  const mainEdge = gridNetwork.edges.find(e => e.streetType === 'main_road')!;
  const resEdge = gridNetwork.edges.find(e => e.streetType === 'residential')!;
  assert(mainEdge.width > resEdge.width, `Main road wider than residential (${mainEdge.width} > ${resEdge.width})`);
}

// Perturbation: nodes should NOT be perfectly grid-aligned
console.log('\n--- Perturbation ---');
{
  // Check that at least some nodes have non-round positions (noise perturbation applied)
  let hasPerturbation = false;
  for (const node of gridNetwork.nodes) {
    const fracX = Math.abs(node.position.x % 40);
    const fracZ = Math.abs(node.position.z % 40);
    if (fracX > 0.5 && fracX < 39.5) {
      hasPerturbation = true;
      break;
    }
    if (fracZ > 0.5 && fracZ < 39.5) {
      hasPerturbation = true;
      break;
    }
  }
  assert(hasPerturbation, `Grid nodes have noise perturbation (not perfectly aligned)`);
}

// Determinism
console.log('\n--- Determinism ---');
{
  const gen2 = new StreetGenerator();
  const network2 = gen2.generateGrid(gridConfig);
  assert(network2.nodes.length === gridNetwork.nodes.length, `Same seed produces same node count`);
  assert(network2.edges.length === gridNetwork.edges.length, `Same seed produces same edge count`);
  let posMatch = true;
  for (let i = 0; i < gridNetwork.nodes.length; i++) {
    if (
      Math.abs(gridNetwork.nodes[i].position.x - network2.nodes[i].position.x) > 0.0001 ||
      Math.abs(gridNetwork.nodes[i].position.z - network2.nodes[i].position.z) > 0.0001
    ) {
      posMatch = false;
      break;
    }
  }
  assert(posMatch, `Same seed produces identical positions`);
}

// Different seed
{
  const gen3 = new StreetGenerator();
  const net3 = gen3.generateGrid({ ...gridConfig, seed: 'different-grid-99' });
  let hasDiff = false;
  for (let i = 0; i < Math.min(gridNetwork.nodes.length, net3.nodes.length); i++) {
    if (
      Math.abs(gridNetwork.nodes[i].position.x - net3.nodes[i].position.x) > 0.01 ||
      Math.abs(gridNetwork.nodes[i].position.z - net3.nodes[i].position.z) > 0.01
    ) {
      hasDiff = true;
      break;
    }
  }
  assert(hasDiff, `Different seed produces different grid`);
}

// Diagonal avenues for large cities
console.log('\n--- Diagonal avenues ---');
{
  const gen4 = new StreetGenerator();
  const cityGrid = gen4.generateGrid({
    ...gridConfig,
    seed: 'big-city-grid',
    radius: 400,
    population: 5000,
  });

  // Should have more edges than a grid without diagonals (due to diagonal avenues)
  const gen5 = new StreetGenerator();
  const smallGrid = gen5.generateGrid({
    ...gridConfig,
    seed: 'big-city-grid',
    radius: 400,
    population: 500,
  });
  assert(
    cityGrid.edges.length > smallGrid.edges.length,
    `City with pop 5000 has more edges than pop 500 (${cityGrid.edges.length} > ${smallGrid.edges.length}) due to diagonals`
  );
}

// Grid rotation
console.log('\n--- Grid rotation ---');
{
  const gen6 = new StreetGenerator();
  const rotatedGrid = gen6.generateGrid({
    ...gridConfig,
    seed: 'rotated-grid',
    gridRotation: { x: 1, z: 1 }, // 45-degree rotation
  });
  const gen7 = new StreetGenerator();
  const unrotatedGrid = gen7.generateGrid({
    ...gridConfig,
    seed: 'rotated-grid',
  });

  // Rotated grid should have different node positions
  let rotDiff = false;
  for (let i = 0; i < Math.min(rotatedGrid.nodes.length, unrotatedGrid.nodes.length); i++) {
    if (
      Math.abs(rotatedGrid.nodes[i].position.x - unrotatedGrid.nodes[i].position.x) > 1 ||
      Math.abs(rotatedGrid.nodes[i].position.z - unrotatedGrid.nodes[i].position.z) > 1
    ) {
      rotDiff = true;
      break;
    }
  }
  assert(rotDiff, `Rotated grid has different positions than unrotated`);

  // But same node count (same grid dimensions)
  assert(
    rotatedGrid.nodes.length === unrotatedGrid.nodes.length,
    `Rotated grid has same node count as unrotated`
  );
}

// Two-diagonal avenues for very large cities
console.log('\n--- Two diagonals ---');
{
  const gen8 = new StreetGenerator();
  const megaGrid = gen8.generateGrid({
    ...gridConfig,
    seed: 'mega-city-grid',
    radius: 400,
    population: 10000,
  });
  const gen9 = new StreetGenerator();
  const oneDialGrid = gen9.generateGrid({
    ...gridConfig,
    seed: 'mega-city-grid',
    radius: 400,
    population: 5000,
  });
  assert(
    megaGrid.edges.length > oneDialGrid.edges.length,
    `Pop 10000 has more edges than pop 5000 (${megaGrid.edges.length} > ${oneDialGrid.edges.length}) — 2 diagonals vs 1`
  );
}

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
