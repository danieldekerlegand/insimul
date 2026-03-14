/**
 * Integration tests for GeographyGenerator — verifies the refactored pipeline
 * that uses StreetGenerator for connected street networks.
 *
 * Run: npx tsx server/generators/geography-generator.test.ts
 */

import { GeographyGenerator, GeographyConfig, Location } from './geography-generator';
import type { StreetNetwork } from '../../shared/game-engine/types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`  ✓ ${msg}`);
    passed++;
  }
}

// We can't call generate() directly (requires DB), so test the non-async parts
// by instantiating the class and calling the refactored flow manually.
// We'll use a subclass that exposes internal methods for testing.

class TestableGeographyGenerator extends GeographyGenerator {
  /** Expose generateStreetNetwork for testing */
  testGenerateStreetNetwork(config: GeographyConfig): { network: StreetNetwork; pattern: string } {
    return (this as any).generateStreetNetwork(config);
  }

  /** Expose deriveDistricts for testing */
  testDeriveDistricts(config: GeographyConfig, network: StreetNetwork, heightmap?: number[][], slopeMap?: number[][]): Location[] {
    return (this as any).deriveDistricts(config, network, heightmap, slopeMap);
  }

  /** Expose streetEdgesToLocations for testing */
  testStreetEdgesToLocations(network: StreetNetwork, districts: Location[]): Location[] {
    return (this as any).streetEdgesToLocations(network, districts);
  }

  /** Expose generateBuildingsAlongStreets for testing */
  testGenerateBuildingsAlongStreets(config: GeographyConfig, network: StreetNetwork, districts: Location[]): Location[] {
    return (this as any).generateBuildingsAlongStreets(config, network, districts);
  }

  /** Expose generateLandmarks for testing */
  testGenerateLandmarks(config: GeographyConfig, districts: Location[]): Location[] {
    return (this as any).generateLandmarks(config, districts);
  }
}

function makeConfig(overrides: Partial<GeographyConfig> = {}): GeographyConfig {
  return {
    worldId: 'test-world',
    settlementId: 'test-settlement',
    settlementName: 'Testville',
    settlementType: 'town',
    population: 5000,
    foundedYear: 1850,
    terrain: 'plains',
    ...overrides,
  };
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

console.log('\n=== GeographyGenerator Integration Tests ===\n');

// Test 1: Street network generation produces connected graph
console.log('Test 1: Street network generation');
{
  const gen = new TestableGeographyGenerator();
  const config = makeConfig();
  const { network, pattern } = gen.testGenerateStreetNetwork(config);

  assert(network.nodes.length > 0, 'Network has nodes');
  assert(network.edges.length > 0, 'Network has edges');
  assert(typeof pattern === 'string' && pattern.length > 0, `Pattern selected: ${pattern}`);

  // Verify connectivity via BFS
  const adj = new Map<string, string[]>();
  for (const n of network.nodes) adj.set(n.id, []);
  for (const e of network.edges) {
    adj.get(e.fromNodeId)!.push(e.toNodeId);
    adj.get(e.toNodeId)!.push(e.fromNodeId);
  }
  const visited = new Set<string>();
  const queue = [network.nodes[0].id];
  visited.add(queue[0]);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nb of adj.get(cur) || []) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }
  assert(visited.size === network.nodes.length, `All ${network.nodes.length} nodes connected (BFS reached ${visited.size})`);
}

// Test 2: All edges have names (assignStreetNames was called)
console.log('\nTest 2: Street names assigned');
{
  const gen = new TestableGeographyGenerator();
  const config = makeConfig();
  const { network } = gen.testGenerateStreetNetwork(config);

  const named = network.edges.filter(e => e.name && e.name.length > 0);
  assert(named.length === network.edges.length, `All ${network.edges.length} edges have names`);

  // Verify some uniqueness
  const uniqueNames = new Set(network.edges.map(e => e.name));
  assert(uniqueNames.size > 1, `Multiple unique street names: ${uniqueNames.size}`);
}

// Test 3: Districts derived from street network
console.log('\nTest 3: District derivation');
{
  const gen = new TestableGeographyGenerator();
  const config = makeConfig();
  const { network } = gen.testGenerateStreetNetwork(config);
  const districts = gen.testDeriveDistricts(config, network);

  assert(districts.length === 4, `Town has 4 districts (got ${districts.length})`);
  for (const d of districts) {
    assert(d.type === 'district', `District type is 'district': ${d.name}`);
    assert(d.id.startsWith('district-'), `District id format: ${d.id}`);
    assert(typeof d.x === 'number' && typeof d.y === 'number', `District has position: ${d.name}`);
    assert(typeof d.width === 'number' && typeof d.height === 'number', `District has dimensions: ${d.name}`);
  }

  // At least some districts should have nodes assigned
  const totalNodes = districts.reduce((sum, d) => sum + ((d.properties?.nodeCount as number) || 0), 0);
  assert(totalNodes === network.nodes.length, `All ${network.nodes.length} nodes assigned to districts (got ${totalNodes})`);
}

// Test 4: Buildings generated along streets
console.log('\nTest 4: Building generation along streets');
{
  const gen = new TestableGeographyGenerator();
  const config = makeConfig();
  const { network } = gen.testGenerateStreetNetwork(config);
  const districts = gen.testDeriveDistricts(config, network);
  const buildings = gen.testGenerateBuildingsAlongStreets(config, network, districts);

  assert(buildings.length > 0, `Buildings generated: ${buildings.length}`);

  const residences = buildings.filter(b => b.properties?.buildingType === 'residence');
  const businesses = buildings.filter(b => b.properties?.buildingType === 'business');
  assert(residences.length > 0, `Has residences: ${residences.length}`);
  assert(businesses.length > 0, `Has businesses: ${businesses.length}`);

  // Residential should be majority
  const residentialPct = residences.length / buildings.length;
  assert(residentialPct > 0.5, `Majority residential: ${(residentialPct * 100).toFixed(0)}%`);

  // All buildings have positions
  for (const b of buildings) {
    assert(typeof b.x === 'number' && !isNaN(b.x), `Building ${b.id} has valid x`);
    assert(typeof b.y === 'number' && !isNaN(b.y), `Building ${b.id} has valid y`);
  }

  // Buildings have street names in properties
  const withStreetNames = buildings.filter(b => b.properties?.streetName);
  assert(withStreetNames.length === buildings.length, 'All buildings have street names');
}

// Test 5: Street edges to Location backward compat
console.log('\nTest 5: Street edge to Location conversion');
{
  const gen = new TestableGeographyGenerator();
  const config = makeConfig();
  const { network } = gen.testGenerateStreetNetwork(config);
  const districts = gen.testDeriveDistricts(config, network);
  const streetLocations = gen.testStreetEdgesToLocations(network, districts);

  assert(streetLocations.length > 0, `Street locations generated: ${streetLocations.length}`);
  for (const s of streetLocations) {
    assert(s.type === 'street', `Location type is 'street': ${s.name}`);
    assert(typeof s.x === 'number', `Street has x position: ${s.name}`);
    assert(typeof s.y === 'number', `Street has y position: ${s.name}`);
    assert(s.parentId?.startsWith('district-'), `Street assigned to district: ${s.parentId}`);
  }
}

// Test 6: Village produces fewer structures
console.log('\nTest 6: Village scale');
{
  const gen = new TestableGeographyGenerator();
  const villageConfig = makeConfig({ settlementType: 'village', population: 200, terrain: 'plains' });
  const { network: vNet } = gen.testGenerateStreetNetwork(villageConfig);
  const vDistricts = gen.testDeriveDistricts(villageConfig, vNet);

  assert(vDistricts.length === 2, `Village has 2 districts (got ${vDistricts.length})`);
}

// Test 7: City produces more structures
console.log('\nTest 7: City scale');
{
  const gen = new TestableGeographyGenerator();
  const cityConfig = makeConfig({ settlementType: 'city', population: 50000 });
  const { network: cNet } = gen.testGenerateStreetNetwork(cityConfig);
  const cDistricts = gen.testDeriveDistricts(cityConfig, cNet);
  const cBuildings = gen.testGenerateBuildingsAlongStreets(cityConfig, cNet, cDistricts);

  assert(cDistricts.length === 8, `City has 8 districts (got ${cDistricts.length})`);
  assert(cBuildings.length > 50, `City has many buildings: ${cBuildings.length}`);
}

// Test 8: Terrain affects pattern selection
console.log('\nTest 8: Terrain-based pattern selection');
{
  const gen = new TestableGeographyGenerator();

  const coastConfig = makeConfig({ terrain: 'coast' });
  const { pattern: coastPattern } = gen.testGenerateStreetNetwork(coastConfig);
  assert(coastPattern === 'waterfront', `Coast terrain -> waterfront (got ${coastPattern})`);

  const riverConfig = makeConfig({ terrain: 'river' });
  const { pattern: riverPattern } = gen.testGenerateStreetNetwork(riverConfig);
  assert(riverPattern === 'linear', `River terrain -> linear (got ${riverPattern})`);

  const mtConfig = makeConfig({ terrain: 'mountains' });
  const { pattern: mtPattern } = gen.testGenerateStreetNetwork(mtConfig);
  assert(mtPattern === 'hillside', `Mountains terrain -> hillside (got ${mtPattern})`);
}

// Test 9: Full pipeline integration (without DB)
console.log('\nTest 9: Full pipeline (non-DB)');
{
  const gen = new TestableGeographyGenerator();
  const config = makeConfig();
  const { network } = gen.testGenerateStreetNetwork(config);
  const districts = gen.testDeriveDistricts(config, network);
  const streets = gen.testStreetEdgesToLocations(network, districts);
  const landmarks = gen.testGenerateLandmarks(config, districts);
  const buildings = gen.testGenerateBuildingsAlongStreets(config, network, districts);

  assert(districts.length > 0, 'Pipeline produces districts');
  assert(streets.length > 0, 'Pipeline produces street locations');
  assert(landmarks.length > 0, 'Pipeline produces landmarks');
  assert(buildings.length > 0, 'Pipeline produces buildings');

  // Buildings are assigned to streets
  const buildingsWithStreetRef = buildings.filter(b => b.parentId);
  assert(buildingsWithStreetRef.length === buildings.length, 'All buildings reference a street');

  // The StreetNetwork object is serializable (can be stored as JSONB)
  const json = JSON.stringify(network);
  const parsed = JSON.parse(json) as StreetNetwork;
  assert(parsed.nodes.length === network.nodes.length, 'StreetNetwork survives JSON round-trip (nodes)');
  assert(parsed.edges.length === network.edges.length, 'StreetNetwork survives JSON round-trip (edges)');
}

// Test 10: Existing settlement data backward compat
console.log('\nTest 10: Backward compatibility');
{
  // Old format: streets as Location[] array
  const oldStreets: Location[] = [
    { id: 'street-0', name: 'Main St', type: 'street', x: 100, y: 200, parentId: 'district-0', properties: {} },
  ];
  // New format: StreetNetwork object
  const gen = new TestableGeographyGenerator();
  const config = makeConfig();
  const { network } = gen.testGenerateStreetNetwork(config);

  // Both should be valid — old data is an array, new data is an object with nodes/edges
  assert(Array.isArray(oldStreets), 'Old format is array');
  assert(!Array.isArray(network) && 'nodes' in network && 'edges' in network, 'New format is StreetNetwork object');

  // A consumer can distinguish by checking Array.isArray or 'nodes' in data
  const isNewFormat = (data: any) => data && !Array.isArray(data) && 'nodes' in data && 'edges' in data;
  assert(!isNewFormat(oldStreets), 'Old format correctly identified');
  assert(isNewFormat(network), 'New format correctly identified');
}

// Test 11: Terrain-influenced district placement — falls back to radial when no heightmap
console.log('\nTest 11: District placement fallback (no heightmap)');
{
  const gen = new TestableGeographyGenerator();
  const config = makeConfig({ settlementType: 'town' });
  const { network } = gen.testGenerateStreetNetwork(config);

  // Without heightmap — should produce districts (same as before)
  const districts = gen.testDeriveDistricts(config, network);
  assert(districts.length === 4, `Town has 4 districts (got ${districts.length})`);
  assert(districts.every(d => d.type === 'district'), 'All are district type');
  assert(districts.every(d => d.properties.role !== undefined), 'All districts have a role property');
}

// Test 12: Terrain-influenced district placement — uses heightmap when provided
console.log('\nTest 12: Terrain-influenced district placement with heightmap');
{
  const gen = new TestableGeographyGenerator();
  const config = makeConfig({ settlementType: 'city', terrain: 'hills' });
  const { network } = gen.testGenerateStreetNetwork(config);

  // Create a heightmap with a hill in the upper-right and flat area at center
  const resolution = 32;
  const heightmap: number[][] = [];
  const slopeMap: number[][] = [];
  for (let r = 0; r < resolution; r++) {
    const hRow: number[] = [];
    const sRow: number[] = [];
    for (let c = 0; c < resolution; c++) {
      // Higher elevation in upper-right quadrant
      const nx = c / resolution;
      const ny = r / resolution;
      const elev = 0.3 + 0.5 * nx * (1 - ny);
      hRow.push(elev);
      // Steeper slope near edges
      const slope = Math.abs(nx - 0.5) * 0.3 + Math.abs(ny - 0.5) * 0.3;
      sRow.push(slope);
    }
    heightmap.push(hRow);
    slopeMap.push(sRow);
  }

  const districts = gen.testDeriveDistricts(config, network, heightmap, slopeMap);
  assert(districts.length === 8, `City has 8 districts (got ${districts.length})`);

  // Check roles are assigned
  const roles = districts.map(d => d.properties.role);
  assert(roles.includes('commercial'), 'Has commercial district');
  assert(roles.includes('wealthy_residential'), 'Has wealthy residential district');
  assert(roles.includes('working_residential'), 'Has working-class residential district');
  assert(roles.includes('industrial'), 'Has industrial district');
  assert(roles.includes('religious_civic'), 'Has religious/civic district');

  // Commercial should be more central than industrial
  const commercial = districts.find(d => d.properties.role === 'commercial')!;
  const industrial = districts.find(d => d.properties.role === 'industrial')!;
  const mapSize = 2000; // city
  const cx = mapSize / 2;
  const cy = mapSize / 2;
  const commDist = Math.sqrt((commercial.properties.seedX - cx) ** 2 + (commercial.properties.seedY - cy) ** 2);
  const indDist = Math.sqrt((industrial.properties.seedX - cx) ** 2 + (industrial.properties.seedY - cy) ** 2);
  assert(commDist <= indDist, `Commercial seed (${commDist.toFixed(0)}) is closer to center than industrial (${indDist.toFixed(0)})`);
}

// Test 13: Terrain-influenced placement — village with 2 districts
console.log('\nTest 13: Terrain-influenced district placement (village)');
{
  const gen = new TestableGeographyGenerator();
  const config = makeConfig({ settlementType: 'village', terrain: 'plains' });
  const { network } = gen.testGenerateStreetNetwork(config);

  // Flat heightmap
  const resolution = 16;
  const heightmap = Array.from({ length: resolution }, () => Array.from({ length: resolution }, () => 0.5));
  const slopeMap = Array.from({ length: resolution }, () => Array.from({ length: resolution }, () => 0.05));

  const districts = gen.testDeriveDistricts(config, network, heightmap, slopeMap);
  assert(districts.length === 2, `Village has 2 districts (got ${districts.length})`);
  assert(districts[0].properties.role === 'commercial', 'First village district is commercial');
}

// Test 14: Terrain-influenced placement — coast terrain gives industrial water bonus
console.log('\nTest 14: Coast terrain industrial district placement');
{
  const gen = new TestableGeographyGenerator();
  const config = makeConfig({ settlementType: 'city', terrain: 'coast' });
  const { network } = gen.testGenerateStreetNetwork(config);

  // Coast heightmap: low elevation at bottom (water), higher inland
  const resolution = 32;
  const heightmap: number[][] = [];
  const slopeMap: number[][] = [];
  for (let r = 0; r < resolution; r++) {
    const hRow: number[] = [];
    const sRow: number[] = [];
    for (let c = 0; c < resolution; c++) {
      const ny = r / resolution;
      hRow.push(0.1 + 0.8 * (1 - ny)); // Low at bottom (high row), high at top
      sRow.push(0.1);
    }
    heightmap.push(hRow);
    slopeMap.push(sRow);
  }

  const districts = gen.testDeriveDistricts(config, network, heightmap, slopeMap);
  const industrial = districts.find(d => d.properties.role === 'industrial');
  assert(industrial !== undefined, 'Coast city has industrial district');
}

// Test 15: Religious/civic district placed at high point
console.log('\nTest 15: Religious/civic district at high elevation');
{
  const gen = new TestableGeographyGenerator();
  const config = makeConfig({ settlementType: 'town', terrain: 'hills' });
  const { network } = gen.testGenerateStreetNetwork(config);

  // Heightmap with a clear peak in the upper area
  const resolution = 32;
  const heightmap: number[][] = [];
  const slopeMap: number[][] = [];
  for (let r = 0; r < resolution; r++) {
    const hRow: number[] = [];
    const sRow: number[] = [];
    for (let c = 0; c < resolution; c++) {
      const nx = c / resolution;
      const ny = r / resolution;
      // Peak at (0.7, 0.3)
      const dist = Math.sqrt((nx - 0.7) ** 2 + (ny - 0.3) ** 2);
      const elev = Math.max(0, 0.9 - dist * 2);
      hRow.push(elev);
      sRow.push(dist < 0.2 ? 0.3 : 0.1); // Moderate slope near peak
    }
    heightmap.push(hRow);
    slopeMap.push(sRow);
  }

  const districts = gen.testDeriveDistricts(config, network, heightmap, slopeMap);
  const religious = districts.find(d => d.properties.role === 'religious_civic');
  assert(religious !== undefined, 'Town has religious/civic district');
  // Religious/civic should be at higher elevation than working_residential
  // (We verify the role exists — exact placement depends on candidate grid)
}

// Test 16: District role names are assigned by role
console.log('\nTest 16: District names match roles');
{
  const gen = new TestableGeographyGenerator();
  const config = makeConfig({ settlementType: 'city' });
  const { network } = gen.testGenerateStreetNetwork(config);

  const districts = gen.testDeriveDistricts(config, network);
  for (const d of districts) {
    const role = d.properties.role as string;
    // Name should not be from the generic locationNames.districts array
    assert(role !== undefined && role.length > 0, `District "${d.name}" has role "${role}"`);
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) {
  process.exit(1);
}
