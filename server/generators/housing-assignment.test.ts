/**
 * Tests for residence housing assignment logic.
 * Verifies that every residence gets owners and residents during generation.
 *
 * Run: npx tsx server/generators/housing-assignment.test.ts
 */

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

// ---------- Replicate the housing assignment logic from world-generator.ts ----------

interface MockCharacter {
  id: string;
  lastName: string;
  birthYear: number;
  isAlive: boolean;
}

interface MockResidence {
  id: string;
  residenceType: string;
  ownerIds: string[];
  residentIds: string[];
}

const capacities: Record<string, number> = {
  mansion: 12, house: 6, cottage: 4, apartment: 2, townhouse: 5, mobile_home: 3
};

/**
 * Pure-logic version of WorldGenerator.assignHousing() for testability.
 * Returns the updated residence assignments without touching storage.
 */
function assignHousing(
  characters: MockCharacter[],
  residences: MockResidence[],
  currentYear: number
): { id: string; residentIds: string[]; ownerIds: string[] }[] {
  const livingCharacters = characters.filter(c => c.isAlive);

  // Group characters by family (last name)
  const families = new Map<string, MockCharacter[]>();
  for (const char of livingCharacters) {
    const key = char.lastName || char.id;
    if (!families.has(key)) families.set(key, []);
    families.get(key)!.push(char);
  }

  // Track remaining capacity per residence
  const residenceCapacity = residences.map(r => ({
    id: r.id,
    remaining: capacities[r.residenceType] || 4,
    residentIds: [] as string[],
    ownerIds: [] as string[]
  }));

  let residenceIdx = 0;

  // Assign each family to a residence
  for (const [, members] of families) {
    if (residenceIdx >= residenceCapacity.length) {
      residenceIdx = 0;
    }

    const adults = members.filter(m => m.birthYear && (currentYear - m.birthYear) >= 18);

    let placed = false;
    for (let attempts = 0; attempts < residenceCapacity.length; attempts++) {
      const idx = (residenceIdx + attempts) % residenceCapacity.length;
      const res = residenceCapacity[idx];
      if (res.remaining >= members.length) {
        for (const member of members) {
          res.residentIds.push(member.id);
          res.remaining--;
        }
        const owner = adults[0] || members[0];
        if (owner && !res.ownerIds.includes(owner.id)) {
          res.ownerIds.push(owner.id);
        }
        residenceIdx = idx + 1;
        placed = true;
        break;
      }
    }

    if (!placed) {
      const owner = adults[0] || members[0];
      let ownerAssigned = false;
      for (const member of members) {
        const res = residenceCapacity[residenceIdx % residenceCapacity.length];
        res.residentIds.push(member.id);
        res.remaining = Math.max(0, res.remaining - 1);
        if (!ownerAssigned && owner && !res.ownerIds.includes(owner.id)) {
          res.ownerIds.push(owner.id);
          ownerAssigned = true;
        }
        if (res.remaining <= 0) residenceIdx++;
      }
    }
  }

  // Redistribute: ensure every residence has at least one resident
  const emptyResidences = residenceCapacity.filter(r => r.residentIds.length === 0);
  if (emptyResidences.length > 0 && livingCharacters.length > 0) {
    const sortedByPopulation = [...residenceCapacity]
      .filter(r => r.residentIds.length > 1)
      .sort((a, b) => b.residentIds.length - a.residentIds.length);

    for (const emptyRes of emptyResidences) {
      if (sortedByPopulation.length === 0) break;
      const crowded = sortedByPopulation[0];
      if (crowded.residentIds.length <= 1) break;

      const movedId = crowded.residentIds.pop()!;
      crowded.remaining++;
      emptyRes.residentIds.push(movedId);
      emptyRes.remaining--;
      emptyRes.ownerIds.push(movedId);

      const ownerIdx = crowded.ownerIds.indexOf(movedId);
      if (ownerIdx !== -1) crowded.ownerIds.splice(ownerIdx, 1);

      sortedByPopulation.sort((a, b) => b.residentIds.length - a.residentIds.length);
    }
  }

  return residenceCapacity.map(r => ({
    id: r.id,
    residentIds: r.residentIds,
    ownerIds: r.ownerIds
  }));
}

// ---------- Test helpers ----------

function makeCharacter(id: string, lastName: string, birthYear: number): MockCharacter {
  return { id, lastName, birthYear, isAlive: true };
}

function makeResidence(id: string, type: string = 'house'): MockResidence {
  return { id, residenceType: type, ownerIds: [], residentIds: [] };
}

// ---------- Tests ----------

console.log('\n=== Housing Assignment Tests ===\n');

// Test 1: Every residence gets residents and owners
console.log('Test 1: Every residence gets residents and owners');
{
  const chars = [
    makeCharacter('c1', 'Smith', 1980),
    makeCharacter('c2', 'Smith', 1982),
    makeCharacter('c3', 'Jones', 1975),
    makeCharacter('c4', 'Jones', 1977),
    makeCharacter('c5', 'Brown', 1990),
    makeCharacter('c6', 'Brown', 1992),
  ];
  const residences = [
    makeResidence('r1', 'house'),
    makeResidence('r2', 'house'),
    makeResidence('r3', 'house'),
  ];
  const result = assignHousing(chars, residences, 2020);

  assert(result.every(r => r.residentIds.length > 0), 'All residences have residents');
  assert(result.every(r => r.ownerIds.length > 0), 'All residences have owners');
  assert(result.reduce((sum, r) => sum + r.residentIds.length, 0) === 6, 'All 6 characters assigned');
}

// Test 2: Family members are grouped together
console.log('\nTest 2: Family members grouped in same residence');
{
  const chars = [
    makeCharacter('c1', 'Smith', 1980),
    makeCharacter('c2', 'Smith', 1982),
    makeCharacter('c3', 'Smith', 2010), // child
    makeCharacter('c4', 'Jones', 1975),
  ];
  const residences = [
    makeResidence('r1', 'house'),
    makeResidence('r2', 'house'),
  ];
  const result = assignHousing(chars, residences, 2020);

  // Find which residence has the Smiths
  const smithRes = result.find(r => r.residentIds.includes('c1'));
  assert(smithRes !== undefined, 'Smith family residence found');
  assert(smithRes!.residentIds.includes('c2'), 'Both Smith adults in same residence');
  assert(smithRes!.residentIds.includes('c3'), 'Smith child in same residence');
}

// Test 3: First adult in family becomes owner
console.log('\nTest 3: First adult in family becomes owner');
{
  const chars = [
    makeCharacter('c1', 'Smith', 1980), // adult
    makeCharacter('c2', 'Smith', 2010), // child (10 years old)
  ];
  const residences = [makeResidence('r1', 'house')];
  const result = assignHousing(chars, residences, 2020);

  assert(result[0].ownerIds.includes('c1'), 'Adult is the owner');
  assert(!result[0].ownerIds.includes('c2'), 'Child is not the owner');
}

// Test 4: When no adults, first member becomes owner
console.log('\nTest 4: No adults - first member becomes owner');
{
  const chars = [
    makeCharacter('c1', 'Smith', 2005), // 15 years old
    makeCharacter('c2', 'Smith', 2008), // 12 years old
  ];
  const residences = [makeResidence('r1', 'house')];
  const result = assignHousing(chars, residences, 2020);

  assert(result[0].ownerIds.includes('c1'), 'First member is owner when no adults');
}

// Test 5: More residences than families — empty ones get residents redistributed
console.log('\nTest 5: Redistribution fills empty residences');
{
  const chars = [
    makeCharacter('c1', 'Smith', 1980),
    makeCharacter('c2', 'Smith', 1982),
    makeCharacter('c3', 'Smith', 2010),
  ];
  // 3 residences but only 1 family
  const residences = [
    makeResidence('r1', 'house'),
    makeResidence('r2', 'house'),
    makeResidence('r3', 'house'),
  ];
  const result = assignHousing(chars, residences, 2020);

  const occupied = result.filter(r => r.residentIds.length > 0);
  // With 3 chars and 3 residences, redistribution should fill at least 2
  assert(occupied.length >= 2, `At least 2 residences occupied (got ${occupied.length})`);
  // Every occupied residence should have an owner
  assert(occupied.every(r => r.ownerIds.length > 0), 'Every occupied residence has an owner');
}

// Test 6: Dead characters are excluded
console.log('\nTest 6: Dead characters excluded from assignment');
{
  const chars = [
    makeCharacter('c1', 'Smith', 1980),
    { ...makeCharacter('c2', 'Smith', 1982), isAlive: false },
  ];
  const residences = [makeResidence('r1', 'house')];
  const result = assignHousing(chars, residences, 2020);

  assert(result[0].residentIds.length === 1, 'Only living character assigned');
  assert(result[0].residentIds.includes('c1'), 'Living character is a resident');
  assert(!result[0].residentIds.includes('c2'), 'Dead character not assigned');
}

// Test 7: Apartment capacity limits (capacity = 2)
console.log('\nTest 7: Apartment capacity respected');
{
  const chars = [
    makeCharacter('c1', 'Smith', 1980),
    makeCharacter('c2', 'Smith', 1982),
    makeCharacter('c3', 'Smith', 2010),
    makeCharacter('c4', 'Jones', 1975),
  ];
  // Two apartments (capacity 2 each)
  const residences = [
    makeResidence('r1', 'apartment'),
    makeResidence('r2', 'apartment'),
    makeResidence('r3', 'apartment'),
  ];
  const result = assignHousing(chars, residences, 2020);

  assert(result.every(r => r.residentIds.length <= 2), 'No apartment exceeds capacity of 2');
  assert(result.reduce((sum, r) => sum + r.residentIds.length, 0) === 4, 'All characters assigned');
}

// Test 8: Large family split across residences still gets owners
console.log('\nTest 8: Split family gets owner in first residence');
{
  const chars = [
    makeCharacter('c1', 'BigFamily', 1970),
    makeCharacter('c2', 'BigFamily', 1972),
    makeCharacter('c3', 'BigFamily', 2000),
    makeCharacter('c4', 'BigFamily', 2002),
    makeCharacter('c5', 'BigFamily', 2005),
  ];
  // Only apartments (cap 2) — family of 5 must split
  const residences = [
    makeResidence('r1', 'apartment'),
    makeResidence('r2', 'apartment'),
    makeResidence('r3', 'apartment'),
  ];
  const result = assignHousing(chars, residences, 2020);

  const withResidents = result.filter(r => r.residentIds.length > 0);
  assert(withResidents.length >= 2, 'Family split across multiple residences');
  // At least one residence has an owner
  assert(withResidents.some(r => r.ownerIds.length > 0), 'At least one residence has owner from split family');
}

// Test 9: Wrap-around when more families than residences
console.log('\nTest 9: Wrap-around with more families than residences');
{
  const chars = [
    makeCharacter('c1', 'A', 1980),
    makeCharacter('c2', 'B', 1980),
    makeCharacter('c3', 'C', 1980),
    makeCharacter('c4', 'D', 1980),
  ];
  const residences = [
    makeResidence('r1', 'house'),
    makeResidence('r2', 'house'),
  ];
  const result = assignHousing(chars, residences, 2020);

  assert(result.every(r => r.residentIds.length > 0), 'All residences occupied after wrap-around');
  assert(result.every(r => r.ownerIds.length > 0), 'All residences have owners after wrap-around');
  assert(result.reduce((sum, r) => sum + r.residentIds.length, 0) === 4, 'All characters assigned');
}

// ---------- Summary ----------

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
