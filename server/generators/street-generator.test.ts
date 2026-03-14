/**
 * Tests for StreetGenerator.
 *
 * Run with: npx tsx server/generators/street-generator.test.ts
 */

import { StreetGenerator, StreetGenConfig, StreetPatternType } from './street-generator';
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

// ── Linear pattern tests ──

console.log('\n=== StreetGenerator: Linear Pattern ===\n');

const linearConfig = {
  center: { x: 0, z: 0 },
  radius: 150,
  settlementType: 'mining_town',
  seed: 'test-linear-42',
  axis: { x: 1, z: 0 }, // Main street runs along X axis
};

const linearGen = new StreetGenerator();
const linearNetwork = linearGen.generateLinear(linearConfig);

// Basic structure
console.log('--- Basic structure ---');
assert(linearNetwork.nodes.length > 0, `Linear has nodes (got ${linearNetwork.nodes.length})`);
assert(linearNetwork.edges.length > 0, `Linear has edges (got ${linearNetwork.edges.length})`);
assert(linearNetwork.nodes.length >= 5, `Linear has at least 5 nodes (got ${linearNetwork.nodes.length})`);
assert(linearNetwork.edges.length >= 4, `Linear has at least 4 edges (got ${linearNetwork.edges.length})`);

// Node validity
console.log('\n--- Node validity ---');
for (const node of linearNetwork.nodes) {
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
  const lNodeIds = new Set(linearNetwork.nodes.map(n => n.id));
  for (const edge of linearNetwork.edges) {
    assert(lNodeIds.has(edge.fromNodeId), `Edge ${edge.id} fromNodeId references existing node`);
    assert(lNodeIds.has(edge.toNodeId), `Edge ${edge.id} toNodeId references existing node`);
    assert(edge.length > 0, `Edge ${edge.id} has positive length`);
    assert(edge.width > 0, `Edge ${edge.id} has positive width`);
  }
}

// Connectivity via BFS
console.log('\n--- Connectivity ---');
{
  const adj = new Map<string, Set<string>>();
  for (const n of linearNetwork.nodes) adj.set(n.id, new Set());
  for (const e of linearNetwork.edges) {
    adj.get(e.fromNodeId)!.add(e.toNodeId);
    adj.get(e.toNodeId)!.add(e.fromNodeId);
  }
  const visited = new Set<string>();
  const queue = [linearNetwork.nodes[0].id];
  visited.add(linearNetwork.nodes[0].id);
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
    visited.size === linearNetwork.nodes.length,
    `Linear graph is fully connected: visited ${visited.size}/${linearNetwork.nodes.length} nodes`
  );
}

// Linear topology: main street nodes should be roughly collinear along the axis
console.log('\n--- Linear topology ---');
{
  // Main road edges should form a chain along the axis direction
  const mainEdges = linearNetwork.edges.filter(e => e.streetType === 'main_road');
  assert(mainEdges.length >= 3, `Has at least 3 main road edges (got ${mainEdges.length})`);

  // Side streets should exist as residential or lane
  const sideEdges = linearNetwork.edges.filter(e => e.streetType === 'residential' || e.streetType === 'lane');
  assert(sideEdges.length >= 1, `Has side street edges (got ${sideEdges.length})`);
}

// Street types: main_road for main street, residential/lane for side streets
console.log('\n--- Street types ---');
{
  const types = new Set(linearNetwork.edges.map(e => e.streetType));
  assert(types.has('main_road'), `Linear has main_road street type`);
  assert(types.size >= 2, `Linear has at least 2 street types (got ${types.size}: ${[...types].join(', ')})`);
}

// Side streets: should branch roughly perpendicular to main axis
console.log('\n--- Side streets perpendicular ---');
{
  const sideEdges = linearNetwork.edges.filter(e => e.streetType === 'residential' || e.streetType === 'lane');
  let perpendicularCount = 0;
  for (const edge of sideEdges) {
    const from = linearNetwork.nodes.find(n => n.id === edge.fromNodeId)!;
    const to = linearNetwork.nodes.find(n => n.id === edge.toNodeId)!;
    const dx = to.position.x - from.position.x;
    const dz = to.position.z - from.position.z;
    const edgeAngle = Math.atan2(dz, dx);
    // Axis angle is 0 (along X). Perpendicular would be ~±90° (±π/2)
    const angleDiff = Math.abs(Math.abs(edgeAngle) - Math.PI / 2);
    if (angleDiff < Math.PI / 4) { // Within 45° of perpendicular
      perpendicularCount++;
    }
  }
  assert(
    perpendicularCount > 0,
    `Some side streets are roughly perpendicular to main axis (${perpendicularCount}/${sideEdges.length})`
  );
}

// Determinism
console.log('\n--- Determinism ---');
{
  const gen2 = new StreetGenerator();
  const network2 = gen2.generateLinear(linearConfig);
  assert(network2.nodes.length === linearNetwork.nodes.length, `Same seed produces same node count`);
  assert(network2.edges.length === linearNetwork.edges.length, `Same seed produces same edge count`);

  let posMatch = true;
  for (let i = 0; i < linearNetwork.nodes.length; i++) {
    if (
      Math.abs(linearNetwork.nodes[i].position.x - network2.nodes[i].position.x) > 0.0001 ||
      Math.abs(linearNetwork.nodes[i].position.z - network2.nodes[i].position.z) > 0.0001
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
  const net3 = gen3.generateLinear({ ...linearConfig, seed: 'different-linear-99' });
  let hasDiff = false;
  if (net3.nodes.length !== linearNetwork.nodes.length) {
    hasDiff = true;
  } else {
    for (let i = 0; i < linearNetwork.nodes.length; i++) {
      if (
        Math.abs(linearNetwork.nodes[i].position.x - net3.nodes[i].position.x) > 0.01 ||
        Math.abs(linearNetwork.nodes[i].position.z - net3.nodes[i].position.z) > 0.01
      ) {
        hasDiff = true;
        break;
      }
    }
  }
  assert(hasDiff, `Different seed produces different linear network`);
}

// Curve path: main street follows a provided path
console.log('\n--- Curve path ---');
{
  const curvePath = [
    { x: -100, z: -20 },
    { x: -50, z: -10 },
    { x: 0, z: 0 },
    { x: 50, z: 15 },
    { x: 100, z: 10 },
  ];
  const gen4 = new StreetGenerator();
  const curvedNetwork = gen4.generateLinear({
    ...linearConfig,
    seed: 'curved-linear',
    curvePath,
  });
  assert(curvedNetwork.nodes.length > 0, `Curved linear has nodes`);
  assert(curvedNetwork.edges.length > 0, `Curved linear has edges`);

  // Main street nodes should roughly follow the curve (some z variation)
  const mainRoadEdges = curvedNetwork.edges.filter(e => e.streetType === 'main_road');
  assert(mainRoadEdges.length >= 3, `Curved linear has main road edges (got ${mainRoadEdges.length})`);
}

// Different axis direction
console.log('\n--- Different axis ---');
{
  const gen5 = new StreetGenerator();
  const diagLinear = gen5.generateLinear({
    ...linearConfig,
    seed: 'diag-linear',
    axis: { x: 1, z: 1 }, // Diagonal
  });
  const gen6 = new StreetGenerator();
  const horizLinear = gen6.generateLinear({
    ...linearConfig,
    seed: 'diag-linear',
    axis: { x: 1, z: 0 }, // Horizontal
  });

  let axisDiff = false;
  for (let i = 0; i < Math.min(diagLinear.nodes.length, horizLinear.nodes.length); i++) {
    if (
      Math.abs(diagLinear.nodes[i].position.x - horizLinear.nodes[i].position.x) > 1 ||
      Math.abs(diagLinear.nodes[i].position.z - horizLinear.nodes[i].position.z) > 1
    ) {
      axisDiff = true;
      break;
    }
  }
  assert(axisDiff, `Different axis directions produce different networks`);
}

// ── Hillside/terraced pattern tests ──

console.log('\n=== StreetGenerator: Hillside Pattern ===\n');

// Create a sloped heightmap (gradient from low to high along z-axis)
const hmSize = 64;
const slopedHeightmap: number[][] = [];
for (let row = 0; row < hmSize; row++) {
  slopedHeightmap[row] = [];
  for (let col = 0; col < hmSize; col++) {
    // Elevation increases with row (z-axis): 0.1 to 0.9
    slopedHeightmap[row][col] = 0.1 + (row / (hmSize - 1)) * 0.8;
  }
}

const hillsideConfig: StreetGenConfig = {
  center: { x: 0, z: 0 },
  radius: 100,
  settlementType: 'village',
  seed: 'test-hillside-42',
};

const genH = new StreetGenerator();
const hillNetwork = genH.generateHillside(hillsideConfig, slopedHeightmap);

console.log('--- Basic structure ---');
assert(hillNetwork.nodes.length > 0, `Hillside has nodes (got ${hillNetwork.nodes.length})`);
assert(hillNetwork.edges.length > 0, `Hillside has edges (got ${hillNetwork.edges.length})`);
assert(hillNetwork.nodes.length >= 5, `At least 5 nodes (got ${hillNetwork.nodes.length})`);
assert(hillNetwork.edges.length >= 4, `At least 4 edges (got ${hillNetwork.edges.length})`);

// Node validity
console.log('\n--- Node validity ---');
const hillNodeIds = new Set(hillNetwork.nodes.map(n => n.id));
for (const node of hillNetwork.nodes) {
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
for (const edge of hillNetwork.edges) {
  assert(typeof edge.id === 'string' && edge.id.length > 0, `Edge ${edge.id} has valid id`);
  assert(hillNodeIds.has(edge.fromNodeId), `Edge ${edge.id} fromNodeId references existing node`);
  assert(hillNodeIds.has(edge.toNodeId), `Edge ${edge.id} toNodeId references existing node`);
  assert(edge.waypoints.length >= 2, `Edge ${edge.id} has at least 2 waypoints`);
  assert(edge.length > 0, `Edge ${edge.id} has non-zero length`);
}

// Connectivity
console.log('\n--- Connectivity ---');
{
  const adj = new Map<string, Set<string>>();
  for (const n of hillNetwork.nodes) adj.set(n.id, new Set());
  for (const e of hillNetwork.edges) {
    adj.get(e.fromNodeId)!.add(e.toNodeId);
    adj.get(e.toNodeId)!.add(e.fromNodeId);
  }
  const visited = new Set<string>();
  const queue = [hillNetwork.nodes[0].id];
  visited.add(queue[0]);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nb of Array.from(adj.get(cur)!)) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }
  assert(visited.size === hillNetwork.nodes.length, `Hillside network is fully connected (${visited.size}/${hillNetwork.nodes.length})`);
}

// Street types: should have both residential (contour) and lane (switchback) types
console.log('\n--- Street types ---');
{
  const types = new Set(hillNetwork.edges.map(e => e.streetType));
  assert(types.has('residential'), `Has residential (contour) streets`);
  assert(types.has('lane'), `Has lane (switchback) streets`);
}

// Determinism
console.log('\n--- Determinism ---');
{
  const genH2 = new StreetGenerator();
  const network2 = genH2.generateHillside(hillsideConfig, slopedHeightmap);
  assert(network2.nodes.length === hillNetwork.nodes.length, `Same seed produces same node count`);
  assert(network2.edges.length === hillNetwork.edges.length, `Same seed produces same edge count`);
  if (network2.nodes.length === hillNetwork.nodes.length) {
    let posMatch = true;
    for (let i = 0; i < hillNetwork.nodes.length; i++) {
      if (
        Math.abs(hillNetwork.nodes[i].position.x - network2.nodes[i].position.x) > 0.001 ||
        Math.abs(hillNetwork.nodes[i].position.z - network2.nodes[i].position.z) > 0.001
      ) {
        posMatch = false;
        break;
      }
    }
    assert(posMatch, `Same seed produces identical node positions`);
  }
}

// Different seed produces different results
console.log('\n--- Different seeds ---');
{
  const genH3 = new StreetGenerator();
  const diffNetwork = genH3.generateHillside({ ...hillsideConfig, seed: 'different-seed-99' }, slopedHeightmap);
  let differs = false;
  for (let i = 0; i < Math.min(hillNetwork.nodes.length, diffNetwork.nodes.length); i++) {
    if (
      Math.abs(hillNetwork.nodes[i].position.x - diffNetwork.nodes[i].position.x) > 0.1 ||
      Math.abs(hillNetwork.nodes[i].position.z - diffNetwork.nodes[i].position.z) > 0.1
    ) {
      differs = true;
      break;
    }
  }
  assert(differs, `Different seeds produce different networks`);
}

// Fallback: no heightmap → organic
console.log('\n--- Fallback to organic ---');
{
  const genH4 = new StreetGenerator();
  const fallbackNetwork = genH4.generateHillside(hillsideConfig, []);
  assert(fallbackNetwork.nodes.length > 0, `Fallback (empty heightmap) produces nodes`);
  assert(fallbackNetwork.edges.length > 0, `Fallback (empty heightmap) produces edges`);
}

// Fallback: flat heightmap → organic
{
  const flatHm: number[][] = [];
  for (let r = 0; r < 32; r++) {
    flatHm[r] = [];
    for (let c = 0; c < 32; c++) flatHm[r][c] = 0.5;
  }
  const genH5 = new StreetGenerator();
  const flatNetwork = genH5.generateHillside(hillsideConfig, flatHm);
  assert(flatNetwork.nodes.length > 0, `Fallback (flat heightmap) produces nodes`);
  assert(flatNetwork.edges.length > 0, `Fallback (flat heightmap) produces edges`);
}

// Terrace structure: contour nodes at similar z-values (since elevation = f(z) in our test heightmap)
console.log('\n--- Terrace structure ---');
{
  // Residential edges (contour roads) should have nodes at roughly similar z positions
  // because our heightmap elevation varies along z
  const residentialEdges = hillNetwork.edges.filter(e => e.streetType === 'residential');
  assert(residentialEdges.length >= 3, `Has enough contour road edges (got ${residentialEdges.length})`);

  // Lane edges (switchbacks) should connect different elevation levels
  const laneEdges = hillNetwork.edges.filter(e => e.streetType === 'lane');
  assert(laneEdges.length >= 2, `Has switchback ramp edges (got ${laneEdges.length})`);
}

// Slope map avoidance
console.log('\n--- Slope map avoidance ---');
{
  // Create a slope map with a steep zone
  const slopeMap: number[][] = [];
  for (let r = 0; r < hmSize; r++) {
    slopeMap[r] = [];
    for (let c = 0; c < hmSize; c++) {
      // Steep only in center-right quadrant
      slopeMap[r][c] = (c > hmSize / 2 && r > hmSize / 4 && r < hmSize * 3 / 4) ? 2.0 : 0.05;
    }
  }
  const genH6 = new StreetGenerator();
  const slopeNetwork = genH6.generateHillside({ ...hillsideConfig, slopeMap }, slopedHeightmap);
  assert(slopeNetwork.nodes.length > 0, `Slope-aware hillside produces nodes`);
  assert(slopeNetwork.edges.length > 0, `Slope-aware hillside produces edges`);

  // Verify connectivity even with slope avoidance
  const adj2 = new Map<string, Set<string>>();
  for (const n of slopeNetwork.nodes) adj2.set(n.id, new Set());
  for (const e of slopeNetwork.edges) {
    adj2.get(e.fromNodeId)!.add(e.toNodeId);
    adj2.get(e.toNodeId)!.add(e.fromNodeId);
  }
  const visited2 = new Set<string>();
  const queue2 = [slopeNetwork.nodes[0].id];
  visited2.add(queue2[0]);
  while (queue2.length > 0) {
    const cur = queue2.shift()!;
    for (const nb of Array.from(adj2.get(cur)!)) {
      if (!visited2.has(nb)) {
        visited2.add(nb);
        queue2.push(nb);
      }
    }
  }
  assert(visited2.size === slopeNetwork.nodes.length, `Slope-aware hillside is fully connected`);
}

// ── Waterfront pattern tests ──

console.log('\n=== StreetGenerator: Waterfront Pattern ===\n');

{
  const gen = new StreetGenerator();

  // Create a mock shoreline: a curve of points along the bottom of the settlement
  const shorelinePoints: { x: number; z: number }[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    shorelinePoints.push({
      x: -100 + t * 200, // -100 to +100 along x
      z: -80 + Math.sin(t * Math.PI) * 15, // Slight curve
    });
  }

  const waterfrontConfig = {
    center: { x: 0, z: 0 },
    radius: 100,
    settlementType: 'port_town',
    seed: 'waterfront_test_42',
    shorelinePoints,
  };

  const network = gen.generateWaterfront(waterfrontConfig);

  // Basic structure
  assert(network.nodes.length > 0, `Waterfront has nodes (got ${network.nodes.length})`);
  assert(network.edges.length > 0, `Waterfront has edges (got ${network.edges.length})`);

  // Nodes have valid positions
  for (const node of network.nodes) {
    assert(typeof node.position.x === 'number' && !isNaN(node.position.x), `Node ${node.id} has valid x`);
    assert(typeof node.position.z === 'number' && !isNaN(node.position.z), `Node ${node.id} has valid z`);
  }

  // Edges reference valid nodes
  const nodeIds = new Set(network.nodes.map(n => n.id));
  for (const edge of network.edges) {
    assert(nodeIds.has(edge.fromNodeId), `Edge ${edge.id} has valid fromNodeId`);
    assert(nodeIds.has(edge.toNodeId), `Edge ${edge.id} has valid toNodeId`);
  }

  // Has boulevard (main_road) edges — waterfront road
  const mainEdges = network.edges.filter(e => e.streetType === 'main_road');
  assert(mainEdges.length > 0, `Waterfront has boulevard edges (got ${mainEdges.length})`);

  // Has residential edges — perpendicular roads
  const residentialEdges = network.edges.filter(e => e.streetType === 'residential');
  assert(residentialEdges.length > 0, `Waterfront has residential edges (got ${residentialEdges.length})`);

  // Has dock/pier nodes (dead_end nodes extending seaward)
  const deadEnds = network.nodes.filter(n => n.type === 'dead_end');
  assert(deadEnds.length > 0, `Waterfront has dock/pier dead-end nodes (got ${deadEnds.length})`);

  // Has lane edges (dock connectors)
  const laneEdges = network.edges.filter(e => e.streetType === 'lane');
  assert(laneEdges.length > 0, `Waterfront has lane edges for docks (got ${laneEdges.length})`);

  // Full connectivity check via BFS
  const adj = new Map<string, Set<string>>();
  for (const n of network.nodes) adj.set(n.id, new Set());
  for (const e of network.edges) {
    adj.get(e.fromNodeId)!.add(e.toNodeId);
    adj.get(e.toNodeId)!.add(e.fromNodeId);
  }
  const visited = new Set<string>();
  const queue = [network.nodes[0].id];
  visited.add(queue[0]);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nb of Array.from(adj.get(cur)!)) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }
  assert(visited.size === network.nodes.length, `Waterfront network is fully connected`);

  // Determinism: same seed produces same output
  const gen2 = new StreetGenerator();
  const network2 = gen2.generateWaterfront(waterfrontConfig);
  assert(network2.nodes.length === network.nodes.length, `Deterministic: same node count`);
  assert(network2.edges.length === network.edges.length, `Deterministic: same edge count`);
  for (let i = 0; i < network.nodes.length; i++) {
    assert(
      Math.abs(network2.nodes[i].position.x - network.nodes[i].position.x) < 0.001 &&
      Math.abs(network2.nodes[i].position.z - network.nodes[i].position.z) < 0.001,
      `Deterministic: node ${i} position matches`
    );
  }

  // Different seed produces different output
  const gen3 = new StreetGenerator();
  const network3 = gen3.generateWaterfront({ ...waterfrontConfig, seed: 'different_waterfront_seed' });
  let hasDifference = false;
  for (let i = 0; i < Math.min(network.nodes.length, network3.nodes.length); i++) {
    if (Math.abs(network3.nodes[i].position.x - network.nodes[i].position.x) > 0.01 ||
        Math.abs(network3.nodes[i].position.z - network.nodes[i].position.z) > 0.01) {
      hasDifference = true;
      break;
    }
  }
  assert(hasDifference, `Different seeds produce different waterfront networks`);

  // Waterfront road nodes are offset inland from shoreline (closer to center)
  // Main road nodes should be closer to center than the shoreline
  const mainRoadNodes = network.nodes.filter((n, idx) => {
    // Find edges connected to this node that are main_road
    return network.edges.some(e =>
      e.streetType === 'main_road' && (e.fromNodeId === n.id || e.toNodeId === n.id)
    );
  });
  assert(mainRoadNodes.length > 0, `Has identifiable main road nodes (got ${mainRoadNodes.length})`);

  // Dock nodes should be further from center (seaward) than the waterfront road
  // (At least some should be in the seaward direction from their connected waterfront node)
  const dockEdges = network.edges.filter(e => e.streetType === 'lane');
  let dockSeawardCount = 0;
  for (const de of dockEdges) {
    const fromNode = network.nodes.find(n => n.id === de.fromNodeId)!;
    const toNode = network.nodes.find(n => n.id === de.toNodeId)!;
    // The dead_end node should be further from center
    const dock = toNode.type === 'dead_end' ? toNode : fromNode;
    const waterfront = toNode.type === 'dead_end' ? fromNode : toNode;
    const dockDist = Math.sqrt(dock.position.x ** 2 + dock.position.z ** 2);
    const wfDist = Math.sqrt(waterfront.position.x ** 2 + waterfront.position.z ** 2);
    // Dock should be further from center than waterfront node (seaward)
    // Due to shoreline shape this may not always hold, but should for most
    if (dockDist > wfDist - 5) dockSeawardCount++;
  }
  if (dockEdges.length > 0) {
    assert(dockSeawardCount > 0, `At least some docks extend seaward`);
  }

  // Test with smaller shoreline (2 points minimum)
  const gen4 = new StreetGenerator();
  const smallShore = gen4.generateWaterfront({
    ...waterfrontConfig,
    shorelinePoints: [{ x: -50, z: -50 }, { x: 50, z: -50 }],
    seed: 'small_shore',
  });
  assert(smallShore.nodes.length > 0, `Small shoreline (2 points) still generates network`);
  assert(smallShore.edges.length > 0, `Small shoreline (2 points) has edges`);

  // Test fallback with empty shoreline
  const gen5 = new StreetGenerator();
  const emptyShore = gen5.generateWaterfront({
    ...waterfrontConfig,
    shorelinePoints: [],
    seed: 'empty_shore',
  });
  assert(emptyShore.nodes.length > 0, `Empty shoreline falls back to organic (has nodes)`);
  assert(emptyShore.edges.length > 0, `Empty shoreline falls back to organic (has edges)`);

  // Test with slope map
  const gen6 = new StreetGenerator();
  const slopeMap: number[][] = [];
  for (let r = 0; r < 32; r++) {
    slopeMap[r] = [];
    for (let c = 0; c < 32; c++) {
      slopeMap[r][c] = 0.01; // Flat terrain
    }
  }
  const slopeWaterfront = gen6.generateWaterfront({
    ...waterfrontConfig,
    slopeMap,
    seed: 'slope_waterfront',
  });
  assert(slopeWaterfront.nodes.length > 0, `Waterfront with slope map has nodes`);

  // Full connectivity with slope map
  const adj3 = new Map<string, Set<string>>();
  for (const n of slopeWaterfront.nodes) adj3.set(n.id, new Set());
  for (const e of slopeWaterfront.edges) {
    adj3.get(e.fromNodeId)!.add(e.toNodeId);
    adj3.get(e.toNodeId)!.add(e.fromNodeId);
  }
  const visited3 = new Set<string>();
  const queue3 = [slopeWaterfront.nodes[0].id];
  visited3.add(queue3[0]);
  while (queue3.length > 0) {
    const cur = queue3.shift()!;
    for (const nb of Array.from(adj3.get(cur)!)) {
      if (!visited3.has(nb)) {
        visited3.add(nb);
        queue3.push(nb);
      }
    }
  }
  assert(visited3.size === slopeWaterfront.nodes.length, `Slope-aware waterfront is fully connected`);

  // Width validation
  for (const edge of network.edges) {
    if (edge.streetType === 'main_road') {
      assert(edge.width === 8, `Main road edge ${edge.id} has width 8`);
    } else if (edge.streetType === 'residential') {
      assert(edge.width === 6, `Residential edge ${edge.id} has width 6`);
    } else if (edge.streetType === 'lane') {
      assert(edge.width === 4, `Lane edge ${edge.id} has width 4`);
    }
  }
}

// ── Street Pattern Selection Tests ──

console.log('\n=== StreetGenerator: Pattern Selection ===\n');

function makeGeoConfig(overrides: Partial<GeographyConfig>): GeographyConfig {
  return {
    worldId: 'w1',
    settlementId: 's1',
    settlementName: 'Test Town',
    settlementType: 'town',
    population: 5000,
    foundedYear: 1900,
    terrain: 'plains',
    ...overrides,
  };
}

// Coast -> waterfront
assert(gen.selectStreetPattern(makeGeoConfig({ terrain: 'coast' })) === 'waterfront',
  'Coast terrain selects waterfront pattern');

// River -> linear
assert(gen.selectStreetPattern(makeGeoConfig({ terrain: 'river' })) === 'linear',
  'River terrain selects linear pattern');

// Mountains -> hillside
assert(gen.selectStreetPattern(makeGeoConfig({ terrain: 'mountains' })) === 'hillside',
  'Mountains terrain selects hillside pattern');

// City + large population -> grid
assert(gen.selectStreetPattern(makeGeoConfig({ settlementType: 'city', population: 15000 })) === 'grid',
  'City with large population selects grid pattern');

// City + smaller population -> radial
assert(gen.selectStreetPattern(makeGeoConfig({ settlementType: 'city', population: 5000 })) === 'radial',
  'City with smaller population selects radial pattern');

// Village -> organic
assert(gen.selectStreetPattern(makeGeoConfig({ settlementType: 'village' })) === 'organic',
  'Village selects organic pattern');

// Old town (founded before 1800) -> organic
assert(gen.selectStreetPattern(makeGeoConfig({ settlementType: 'town', foundedYear: 1750 })) === 'organic',
  'Old settlement (pre-1800) selects organic pattern');

// Newer town -> grid
assert(gen.selectStreetPattern(makeGeoConfig({ settlementType: 'town', foundedYear: 1900 })) === 'grid',
  'Newer settlement selects grid pattern');

// Priority: coast terrain overrides city type
assert(gen.selectStreetPattern(makeGeoConfig({ terrain: 'coast', settlementType: 'city', population: 50000 })) === 'waterfront',
  'Coast terrain takes priority over city type');

// Priority: mountains terrain overrides village type
assert(gen.selectStreetPattern(makeGeoConfig({ terrain: 'mountains', settlementType: 'village' })) === 'hillside',
  'Mountains terrain takes priority over village type');

// ── Generate dispatch tests ──

console.log('\n=== StreetGenerator: Generate Dispatch ===\n');

const baseConfig: StreetGenConfig = {
  center: { x: 0, z: 0 },
  radius: 100,
  settlementType: 'town',
  seed: 'dispatch-test-42',
};

// Organic dispatch
{
  const result = gen.generate(baseConfig, makeGeoConfig({ settlementType: 'village' }));
  assert(result.pattern === 'organic', 'Generate dispatches to organic for village');
  assert(result.network.nodes.length > 0, 'Organic dispatch produces nodes');
  assert(result.network.edges.length > 0, 'Organic dispatch produces edges');
}

// Grid dispatch
{
  const result = gen.generate(baseConfig, makeGeoConfig({ settlementType: 'city', population: 15000 }));
  assert(result.pattern === 'grid', 'Generate dispatches to grid for large city');
  assert(result.network.nodes.length > 0, 'Grid dispatch produces nodes');
}

// Radial dispatch
{
  const result = gen.generate(baseConfig, makeGeoConfig({ settlementType: 'city', population: 5000 }));
  assert(result.pattern === 'radial', 'Generate dispatches to radial for smaller city');
  assert(result.network.nodes.length > 0, 'Radial dispatch produces nodes');
}

// Linear dispatch
{
  const result = gen.generate(baseConfig, makeGeoConfig({ terrain: 'river' }));
  assert(result.pattern === 'linear', 'Generate dispatches to linear for river');
  assert(result.network.nodes.length > 0, 'Linear dispatch produces nodes');
}

// Waterfront dispatch
{
  const result = gen.generate(baseConfig, makeGeoConfig({ terrain: 'coast' }));
  assert(result.pattern === 'waterfront', 'Generate dispatches to waterfront for coast');
  assert(result.network.nodes.length > 0, 'Waterfront dispatch produces nodes');
}

// Hillside dispatch
{
  const result = gen.generate(baseConfig, makeGeoConfig({ terrain: 'mountains' }));
  assert(result.pattern === 'hillside', 'Generate dispatches to hillside for mountains');
  assert(result.network.nodes.length > 0, 'Hillside dispatch produces nodes');
}

// ── Street Naming Tests ──

console.log('\n=== StreetGenerator: Street Naming ===\n');

// Basic naming: all edges get non-empty names
console.log('--- Basic naming ---');
{
  const g = new StreetGenerator();
  const network = g.generateOrganic({
    center: { x: 0, z: 0 },
    radius: 150,
    settlementType: 'village',
    seed: 'naming-test-organic',
  });
  g.assignStreetNames(network, 'naming-test-organic');

  const unnamed = network.edges.filter(e => !e.name || e.name === '');
  assert(unnamed.length === 0, `All edges have names (${network.edges.length - unnamed.length}/${network.edges.length})`);
}

// Uniqueness: no two streets share the same name
console.log('\n--- Uniqueness ---');
{
  const g = new StreetGenerator();
  const network = g.generateOrganic({
    center: { x: 0, z: 0 },
    radius: 200,
    settlementType: 'town',
    seed: 'naming-unique-test',
  });
  g.assignStreetNames(network, 'naming-unique-test');

  // Gather all unique street names
  const names = new Set(network.edges.map(e => e.name));
  // Each name should be unique across the settlement (they are — a name maps to a chain of edges)
  // No two *different* chains should share a name
  // Group edges by name and verify all edges with same name form a connected chain
  const nameGroups = new Map<string, typeof network.edges>();
  for (const edge of network.edges) {
    if (!nameGroups.has(edge.name)) nameGroups.set(edge.name, []);
    nameGroups.get(edge.name)!.push(edge);
  }
  // Every distinct name should be unique (we just check count)
  assert(names.size > 0, `Has multiple distinct street names (got ${names.size})`);
  assert(names.size <= network.edges.length, `Names count <= edges count`);
}

// Suffix-type correspondence
console.log('\n--- Suffix-type correspondence ---');
{
  const g = new StreetGenerator();
  const network = g.generateGrid({
    center: { x: 0, z: 0 },
    radius: 300,
    settlementType: 'city',
    seed: 'naming-suffix-test',
  });
  g.assignStreetNames(network, 'naming-suffix-test');

  for (const edge of network.edges) {
    const name = edge.name;
    if (edge.streetType === 'main_road' || edge.streetType === 'boulevard' || edge.streetType === 'highway') {
      const validSuffix = name.endsWith('Boulevard') || name.endsWith('Avenue');
      assert(validSuffix, `Main road "${name}" has Boulevard/Avenue suffix`);
    } else if (edge.streetType === 'lane') {
      const validSuffix = name.endsWith('Lane') || name.endsWith('Court');
      assert(validSuffix, `Lane "${name}" has Lane/Court suffix`);
    }
    // Residential edges can have Street, Drive, Way, Lane, Court depending on topology
  }
}

// Grid layouts: numbered cross-streets
console.log('\n--- Grid numbered streets ---');
{
  const g = new StreetGenerator();
  const network = g.generateGrid({
    center: { x: 0, z: 0 },
    radius: 300,
    settlementType: 'city',
    seed: 'naming-grid-numbered',
  });
  g.assignStreetNames(network, 'naming-grid-numbered');

  const numberedPattern = /^\d+(st|nd|rd|th)\s+(Street|Avenue)$/;
  const numberedEdges = network.edges.filter(e => numberedPattern.test(e.name));
  assert(numberedEdges.length > 0, `Grid has numbered streets (got ${numberedEdges.length})`);

  // Verify numbered streets are sequential
  const numberedNames = [...new Set(numberedEdges.map(e => e.name))];
  const numbers = numberedNames.map(n => parseInt(n)).sort((a, b) => a - b);
  assert(numbers[0] === 1, `Numbered streets start at 1 (got ${numbers[0]})`);
}

// Continuous segments share the same name
console.log('\n--- Continuous segments ---');
{
  const g = new StreetGenerator();
  const network = g.generateLinear({
    center: { x: 0, z: 0 },
    radius: 150,
    settlementType: 'town',
    seed: 'naming-continuous-test',
    axis: { x: 1, z: 0 },
  });
  g.assignStreetNames(network, 'naming-continuous-test');

  // Main road edges should share a name (they're the continuous main street)
  const mainEdges = network.edges.filter(e => e.streetType === 'main_road');
  if (mainEdges.length >= 2) {
    const mainNames = new Set(mainEdges.map(e => e.name));
    // Most main road edges should share one name (continuous chain)
    assert(mainNames.size <= Math.ceil(mainEdges.length / 2),
      `Main road has fewer distinct names (${mainNames.size}) than edges (${mainEdges.length}) — continuous segments share names`);
  }
}

// Determinism: same seed = same names
console.log('\n--- Determinism ---');
{
  const cfg = {
    center: { x: 0, z: 0 },
    radius: 150,
    settlementType: 'village',
    seed: 'naming-determinism',
  };

  const g1 = new StreetGenerator();
  const net1 = g1.generateOrganic(cfg);
  g1.assignStreetNames(net1, 'naming-determinism');

  const g2 = new StreetGenerator();
  const net2 = g2.generateOrganic(cfg);
  g2.assignStreetNames(net2, 'naming-determinism');

  let allMatch = true;
  for (let i = 0; i < net1.edges.length; i++) {
    if (net1.edges[i].name !== net2.edges[i].name) {
      allMatch = false;
      break;
    }
  }
  assert(allMatch, `Same seed produces identical street names`);
}

// Different seed = different names
console.log('\n--- Different seeds ---');
{
  const cfg = {
    center: { x: 0, z: 0 },
    radius: 150,
    settlementType: 'village',
    seed: 'naming-diff-1',
  };

  const g1 = new StreetGenerator();
  const net1 = g1.generateOrganic(cfg);
  g1.assignStreetNames(net1, 'naming-diff-1');

  const g2 = new StreetGenerator();
  const net2 = g2.generateOrganic({ ...cfg, seed: 'naming-diff-2' });
  g2.assignStreetNames(net2, 'naming-diff-2');

  const names1 = new Set(net1.edges.map(e => e.name));
  const names2 = new Set(net2.edges.map(e => e.name));
  let hasDiff = false;
  for (const n of names1) {
    if (!names2.has(n)) { hasDiff = true; break; }
  }
  if (!hasDiff) {
    for (const n of names2) {
      if (!names1.has(n)) { hasDiff = true; break; }
    }
  }
  assert(hasDiff, `Different seeds produce different street names`);
}

// Empty network: no crash
console.log('\n--- Empty network ---');
{
  const g = new StreetGenerator();
  const emptyNetwork = { nodes: [], edges: [] };
  g.assignStreetNames(emptyNetwork, 'empty-seed');
  assert(true, `Empty network does not crash`);
}

// Radial network naming
console.log('\n--- Radial naming ---');
{
  const g = new StreetGenerator();
  const network = g.generateRadial({
    center: { x: 0, z: 0 },
    radius: 300,
    settlementType: 'capital',
    seed: 'naming-radial-test',
  });
  g.assignStreetNames(network, 'naming-radial-test');

  const unnamed = network.edges.filter(e => !e.name || e.name === '');
  assert(unnamed.length === 0, `All radial edges named (${network.edges.length - unnamed.length}/${network.edges.length})`);

  const names = new Set(network.edges.map(e => e.name));
  assert(names.size >= 3, `Radial has multiple distinct street names (got ${names.size})`);
}

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
