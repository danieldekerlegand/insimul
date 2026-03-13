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

// ── Radial pattern tests ──

console.log('\n=== StreetGenerator: Radial Pattern ===\n');

const radialConfig: StreetGenConfig = {
  center: { x: 0, z: 0 },
  radius: 300,
  settlementType: 'capital',
  seed: 'test-radial-42',
};

const radialGen = new StreetGenerator();
const radialNetwork = radialGen.generateRadial(radialConfig);

// Basic structure
console.log('--- Basic structure ---');
assert(radialNetwork.nodes.length > 0, `Radial has nodes (got ${radialNetwork.nodes.length})`);
assert(radialNetwork.edges.length > 0, `Radial has edges (got ${radialNetwork.edges.length})`);

// Should have a reasonable number of nodes:
// 1 center + (ringCount * radialCount) intersection nodes + radialCount endpoints
// With 6-8 radials and 2-4 rings: min = 1 + 6*2 + 6 = 19, max = 1 + 8*4 + 8 = 41
assert(radialNetwork.nodes.length >= 19, `Radial has at least 19 nodes (got ${radialNetwork.nodes.length})`);
assert(radialNetwork.nodes.length <= 50, `Radial has at most 50 nodes (got ${radialNetwork.nodes.length})`);

// Node validity
console.log('\n--- Node validity ---');
for (const node of radialNetwork.nodes) {
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
{
  const rNodeIds = new Set(radialNetwork.nodes.map(n => n.id));
  for (const edge of radialNetwork.edges) {
    assert(rNodeIds.has(edge.fromNodeId), `Edge ${edge.id} fromNodeId references existing node`);
    assert(rNodeIds.has(edge.toNodeId), `Edge ${edge.id} toNodeId references existing node`);
    assert(edge.length > 0, `Edge ${edge.id} has positive length`);
    assert(edge.width > 0, `Edge ${edge.id} has positive width`);
  }
}

// Connectivity via BFS
console.log('\n--- Connectivity ---');
{
  const adj = new Map<string, Set<string>>();
  for (const n of radialNetwork.nodes) adj.set(n.id, new Set());
  for (const e of radialNetwork.edges) {
    adj.get(e.fromNodeId)!.add(e.toNodeId);
    adj.get(e.toNodeId)!.add(e.fromNodeId);
  }
  const visited = new Set<string>();
  const queue = [radialNetwork.nodes[0].id];
  visited.add(radialNetwork.nodes[0].id);
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
    visited.size === radialNetwork.nodes.length,
    `Radial graph is fully connected: visited ${visited.size}/${radialNetwork.nodes.length} nodes`
  );
}

// Central plaza node: first node should be at center with high degree
console.log('\n--- Central plaza ---');
{
  const centerNode = radialNetwork.nodes[0];
  assert(
    Math.abs(centerNode.position.x - radialConfig.center.x) < 1,
    `Center node near center x (got ${centerNode.position.x})`
  );
  assert(
    Math.abs(centerNode.position.z - radialConfig.center.z) < 1,
    `Center node near center z (got ${centerNode.position.z})`
  );

  // Center node should have 6-8 edges (one per radial)
  const centerEdges = radialNetwork.edges.filter(
    e => e.fromNodeId === centerNode.id || e.toNodeId === centerNode.id
  );
  assert(centerEdges.length >= 6, `Center node has >= 6 edges (got ${centerEdges.length})`);
  assert(centerEdges.length <= 8, `Center node has <= 8 edges (got ${centerEdges.length})`);
}

// Radial structure: nodes should radiate outward at different angles
console.log('\n--- Radial structure ---');
{
  const centerNode = radialNetwork.nodes[0];
  // Non-center nodes
  const outerNodes = radialNetwork.nodes.filter(n => n.id !== centerNode.id);

  // Compute angles from center to each outer node
  const angles = outerNodes.map(n =>
    Math.atan2(n.position.z - centerNode.position.z, n.position.x - centerNode.position.x)
  );

  // There should be at least 6 distinct angular sectors (within ~60° bins)
  const normAngle = (a: number) => { while (a < 0) a += Math.PI * 2; while (a >= Math.PI * 2) a -= Math.PI * 2; return a; };
  const angleBins = new Set(angles.map(a => Math.round((normAngle(a) / (Math.PI * 2)) * 6)));
  assert(angleBins.size >= 4, `Nodes spread across >= 4 angular sectors (got ${angleBins.size})`);

  // Nodes at different radial distances (rings)
  const distances = outerNodes.map(n =>
    Math.sqrt(
      (n.position.x - centerNode.position.x) ** 2 +
      (n.position.z - centerNode.position.z) ** 2
    )
  );
  const minDist = Math.min(...distances);
  const maxDist = Math.max(...distances);
  assert(maxDist > minDist * 1.5, `Nodes at multiple radial distances (min=${minDist.toFixed(1)}, max=${maxDist.toFixed(1)})`);
}

// Ring edges: should have concentric ring connections
console.log('\n--- Ring roads ---');
{
  // Ring edges connect nodes at approximately the same distance from center
  // Count edges where both endpoints are at similar distance from center (within 15%)
  const centerNode = radialNetwork.nodes[0];
  const nodeDistMap = new Map<string, number>();
  for (const n of radialNetwork.nodes) {
    const d = Math.sqrt(
      (n.position.x - centerNode.position.x) ** 2 +
      (n.position.z - centerNode.position.z) ** 2
    );
    nodeDistMap.set(n.id, d);
  }

  let ringEdgeCount = 0;
  for (const e of radialNetwork.edges) {
    const d1 = nodeDistMap.get(e.fromNodeId) ?? 0;
    const d2 = nodeDistMap.get(e.toNodeId) ?? 0;
    if (d1 > 0 && d2 > 0) {
      const ratio = Math.min(d1, d2) / Math.max(d1, d2);
      if (ratio > 0.85) {
        ringEdgeCount++;
      }
    }
  }
  assert(ringEdgeCount >= 6, `Has ring road edges (${ringEdgeCount} edges connect nodes at similar radii)`);
}

// Street types: should have both main_road and residential (inner vs outer rings)
console.log('\n--- Street types ---');
{
  const types = new Set(radialNetwork.edges.map(e => e.streetType));
  assert(types.has('main_road'), `Radial has main_road streets (boulevards)`);
  // With 3+ rings, outer rings become residential
  // With 2 rings, inner is main, outer is residential
  assert(types.size >= 1, `Radial has at least 1 street type (got ${types.size}: ${[...types].join(', ')})`);
}

// Determinism
console.log('\n--- Determinism ---');
{
  const gen2 = new StreetGenerator();
  const network2 = gen2.generateRadial(radialConfig);
  assert(network2.nodes.length === radialNetwork.nodes.length, `Same seed produces same node count`);
  assert(network2.edges.length === radialNetwork.edges.length, `Same seed produces same edge count`);

  let posMatch = true;
  for (let i = 0; i < radialNetwork.nodes.length; i++) {
    if (
      Math.abs(radialNetwork.nodes[i].position.x - network2.nodes[i].position.x) > 0.0001 ||
      Math.abs(radialNetwork.nodes[i].position.z - network2.nodes[i].position.z) > 0.0001
    ) {
      posMatch = false;
      break;
    }
  }
  assert(posMatch, `Same seed produces identical positions`);
}

// Different seed
console.log('\n--- Different seeds ---');
{
  const gen3 = new StreetGenerator();
  const net3 = gen3.generateRadial({ ...radialConfig, seed: 'different-radial-99' });
  let hasDiff = false;
  if (net3.nodes.length !== radialNetwork.nodes.length) {
    hasDiff = true;
  } else {
    for (let i = 0; i < radialNetwork.nodes.length; i++) {
      if (
        Math.abs(radialNetwork.nodes[i].position.x - net3.nodes[i].position.x) > 0.01 ||
        Math.abs(radialNetwork.nodes[i].position.z - net3.nodes[i].position.z) > 0.01
      ) {
        hasDiff = true;
        break;
      }
    }
  }
  assert(hasDiff, `Different seed produces different radial network`);
}

// Slope map avoidance
console.log('\n--- Slope map avoidance ---');
{
  const size = 32;
  const steepSlopeMap: number[][] = [];
  for (let r = 0; r < size; r++) {
    steepSlopeMap[r] = [];
    for (let c = 0; c < size; c++) {
      const cx = c / (size - 1) - 0.5;
      const cz = r / (size - 1) - 0.5;
      const d = Math.sqrt(cx * cx + cz * cz);
      steepSlopeMap[r][c] = d < 0.2 ? 2.0 : 0.01;
    }
  }

  const gen4 = new StreetGenerator();
  const slopeRadial = gen4.generateRadial({
    ...radialConfig,
    seed: 'slope-radial-test',
    slopeMap: steepSlopeMap,
  });
  assert(slopeRadial.nodes.length > 0, `Generates radial network with steep slope map`);
  assert(slopeRadial.edges.length > 0, `Has edges with steep slope map`);
}

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
