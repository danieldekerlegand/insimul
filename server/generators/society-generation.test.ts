/**
 * Tests for society settlement procedural generation improvements:
 * 1. NPC skill generation based on personality traits
 * 2. District-aware business/residence ratios
 *
 * Run: npx tsx server/generators/society-generation.test.ts
 */

import { GenealogyGenerator } from './genealogy-generator';
import { GeographyGenerator, type GeographyConfig, type Location, type DistrictRole } from './geography-generator';
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

// ─── Testable subclasses ────────────────────────────────────────────────────

class TestableGenealogyGenerator extends GenealogyGenerator {
  /** Expose generateSkills for testing */
  testGenerateSkills(
    personality: { openness: number; conscientiousness: number; extroversion: number; agreeableness: number; neuroticism: number },
    age: number
  ): Record<string, number> {
    return this.generateSkills(personality, age);
  }
}

class TestableGeographyGenerator extends GeographyGenerator {
  /** Expose shouldBeResidence for testing */
  testShouldBeResidence(streetType: string, index: number, districtRole?: DistrictRole): boolean {
    return (this as any).shouldBeResidence(streetType, index, districtRole);
  }

  /** Expose generateBuildingsAlongStreets for testing */
  testGenerateBuildingsAlongStreets(config: GeographyConfig, network: StreetNetwork, districts: Location[]): Location[] {
    return (this as any).generateBuildingsAlongStreets(config, network, districts);
  }

  /** Expose generateStreetNetwork for testing */
  testGenerateStreetNetwork(config: GeographyConfig): { network: StreetNetwork; pattern: string } {
    return (this as any).generateStreetNetwork(config);
  }

  /** Expose deriveDistricts for testing */
  testDeriveDistricts(config: GeographyConfig, network: StreetNetwork): Location[] {
    return (this as any).deriveDistricts(config, network);
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

// ─── Test Suite 1: NPC Skill Generation ─────────────────────────────────────

console.log('\n=== NPC Skill Generation Tests ===\n');

// Test 1: Skills are generated from personality
console.log('Test 1: Skills generated from personality');
{
  const gen = new TestableGenealogyGenerator();
  const personality = {
    openness: 0.8,
    conscientiousness: 0.6,
    extroversion: 0.4,
    agreeableness: 0.2,
    neuroticism: -0.5,
  };
  const skills = gen.testGenerateSkills(personality, 30);

  assert(Object.keys(skills).length > 0, 'Skills object is non-empty');
  assert(typeof skills === 'object', 'Skills is a Record');

  // All skill values should be between 0 and 1
  for (const [name, value] of Object.entries(skills)) {
    assert(value >= 0 && value <= 1, `Skill ${name} (${value}) is in 0-1 range`);
    assert(value > 0.1, `Skill ${name} (${value}) is above minimum threshold`);
  }
}

// Test 2: High openness → higher creativity skills
console.log('\nTest 2: High openness correlates with creativity');
{
  const gen = new TestableGenealogyGenerator();

  // Run multiple trials to account for randomness
  let highOpenCreativity = 0;
  let lowOpenCreativity = 0;
  const trials = 100;

  for (let i = 0; i < trials; i++) {
    const highOpen = gen.testGenerateSkills(
      { openness: 1.0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0 },
      35
    );
    const lowOpen = gen.testGenerateSkills(
      { openness: -1.0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0 },
      35
    );
    highOpenCreativity += highOpen.creativity || 0;
    lowOpenCreativity += lowOpen.creativity || 0;
  }

  assert(
    highOpenCreativity / trials > lowOpenCreativity / trials,
    `High openness avg creativity (${(highOpenCreativity / trials).toFixed(3)}) > low openness (${(lowOpenCreativity / trials).toFixed(3)})`
  );
}

// Test 3: Age affects skill levels
console.log('\nTest 3: Age affects skill levels');
{
  const gen = new TestableGenealogyGenerator();
  const personality = { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0 };

  // Run multiple trials
  let youngTotal = 0;
  let matureTotal = 0;
  const trials = 200;

  for (let i = 0; i < trials; i++) {
    const youngSkills = gen.testGenerateSkills(personality, 10);
    const matureSkills = gen.testGenerateSkills(personality, 40);
    youngTotal += Object.values(youngSkills).reduce((a, b) => a + b, 0);
    matureTotal += Object.values(matureSkills).reduce((a, b) => a + b, 0);
  }

  assert(
    matureTotal > youngTotal,
    `Mature characters have higher total skills (${(matureTotal / trials).toFixed(2)}) than young (${(youngTotal / trials).toFixed(2)})`
  );
}

// Test 4: Skills are clamped to valid range
console.log('\nTest 4: Extreme personality values produce valid skills');
{
  const gen = new TestableGenealogyGenerator();
  const extreme = { openness: 1, conscientiousness: 1, extroversion: 1, agreeableness: 1, neuroticism: -1 };
  const skills = gen.testGenerateSkills(extreme, 50);

  for (const [name, value] of Object.entries(skills)) {
    assert(value >= 0 && value <= 1, `Extreme skill ${name} (${value}) stays in 0-1 range`);
  }

  const extremeNeg = { openness: -1, conscientiousness: -1, extroversion: -1, agreeableness: -1, neuroticism: 1 };
  const skillsNeg = gen.testGenerateSkills(extremeNeg, 50);

  // With extreme negative personality, most skills should be low or absent
  const totalNeg = Object.values(skillsNeg).reduce((a, b) => a + b, 0);
  assert(totalNeg < Object.keys(skillsNeg).length, `Extreme negative personality produces lower skill totals (${totalNeg.toFixed(2)})`);
}

// ─── Test Suite 2: District-Aware Business/Residence Ratios ─────────────────

console.log('\n=== District-Aware Building Type Tests ===\n');

// Test 5: Commercial districts produce more businesses
console.log('Test 5: Commercial districts have more businesses');
{
  const gen = new TestableGeographyGenerator();
  let commercialResidences = 0;
  let residentialResidences = 0;
  const sampleSize = 200;

  for (let i = 0; i < sampleSize; i++) {
    if (gen.testShouldBeResidence('avenue', i, 'commercial')) commercialResidences++;
    if (gen.testShouldBeResidence('avenue', i, 'wealthy_residential')) residentialResidences++;
  }

  const commercialResRate = commercialResidences / sampleSize;
  const residentialResRate = residentialResidences / sampleSize;

  assert(
    commercialResRate < residentialResRate,
    `Commercial district residential rate (${commercialResRate.toFixed(2)}) < residential district (${residentialResRate.toFixed(2)})`
  );
  assert(commercialResRate < 0.4, `Commercial district is mostly businesses (${commercialResRate.toFixed(2)} < 0.4)`);
  assert(residentialResRate > 0.7, `Residential district is mostly homes (${residentialResRate.toFixed(2)} > 0.7)`);
}

// Test 6: Industrial districts produce mostly businesses
console.log('\nTest 6: Industrial districts are mostly businesses');
{
  const gen = new TestableGeographyGenerator();
  let industrialResidences = 0;
  const sampleSize = 200;

  for (let i = 0; i < sampleSize; i++) {
    if (gen.testShouldBeResidence('residential', i, 'industrial')) industrialResidences++;
  }

  const industrialResRate = industrialResidences / sampleSize;
  assert(industrialResRate < 0.3, `Industrial district residential rate is low (${industrialResRate.toFixed(2)} < 0.3)`);
}

// Test 7: Street type modifies district base rate
console.log('\nTest 7: Street type modifies district base rate');
{
  const gen = new TestableGeographyGenerator();
  let mainRoadRes = 0;
  let laneRes = 0;
  const sampleSize = 500;

  for (let i = 0; i < sampleSize; i++) {
    if (gen.testShouldBeResidence('main_road', i, 'general')) mainRoadRes++;
    if (gen.testShouldBeResidence('lane', i, 'general')) laneRes++;
  }

  assert(
    mainRoadRes < laneRes,
    `Main roads have fewer residences (${mainRoadRes}) than lanes (${laneRes}) in same district`
  );
}

// Test 8: Building generation uses district roles in practice
console.log('\nTest 8: Building generation integrates district roles');
{
  const geoGen = new TestableGeographyGenerator();
  const config = makeConfig();
  const { network } = geoGen.testGenerateStreetNetwork(config);
  const districts = geoGen.testDeriveDistricts(config, network);
  const buildings = geoGen.testGenerateBuildingsAlongStreets(config, network, districts);

  assert(buildings.length > 0, `Buildings were generated (${buildings.length})`);

  const residences = buildings.filter(b => b.properties?.buildingType === 'residence');
  const businesses = buildings.filter(b => b.properties?.buildingType === 'business');

  assert(residences.length > 0, `Has residential buildings (${residences.length})`);
  assert(businesses.length > 0, `Has business buildings (${businesses.length})`);

  // Check that districts with commercial role have more businesses
  const commercialDistrict = districts.find(d => d.properties?.role === 'commercial');
  if (commercialDistrict) {
    const commercialBuildings = buildings.filter(b => b.properties?.districtId === commercialDistrict.id);
    const commercialBusinesses = commercialBuildings.filter(b => b.properties?.buildingType === 'business');
    const commercialBusinessRate = commercialBuildings.length > 0
      ? commercialBusinesses.length / commercialBuildings.length
      : 0;
    assert(
      commercialBusinessRate > 0.3,
      `Commercial district has high business rate (${commercialBusinessRate.toFixed(2)})`
    );
  }
}

// Test 9: No district role falls back gracefully
console.log('\nTest 9: No district role defaults to general ratio');
{
  const gen = new TestableGeographyGenerator();
  let noRoleRes = 0;
  const sampleSize = 200;

  for (let i = 0; i < sampleSize; i++) {
    if (gen.testShouldBeResidence('residential', i, undefined)) noRoleRes++;
  }

  const rate = noRoleRes / sampleSize;
  assert(rate > 0.4 && rate < 0.95, `No-role district has moderate residential rate (${rate.toFixed(2)})`);
}

// ─── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
