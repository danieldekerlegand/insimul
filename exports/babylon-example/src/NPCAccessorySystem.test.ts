/**
 * Tests for NPC Accessory & Occupation-Visual System
 *
 * Tests the occupation → accessory set mapping logic (pure functions,
 * no Babylon.js Scene dependency).
 *
 * Run with: npx tsx client/src/components/3DGame/NPCAccessorySystem.test.ts
 */

import { getAccessorySetForOccupation } from './NPCAccessorySystem';

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

// ---------- getAccessorySetForOccupation ----------

console.log('\n=== getAccessorySetForOccupation ===\n');

// Guard-type occupations
{
  const set = getAccessorySetForOccupation('Town Guard');
  assert(set.category === 'Guard', 'Town Guard → Guard category');
  assert(set.accessories.length === 2, 'Guard has 2 accessories (helmet + sword)');
  assert(
    set.accessories.some((a) => a.id === 'guard_helmet'),
    'Guard has helmet accessory',
  );
  assert(
    set.accessories.some((a) => a.id === 'sword'),
    'Guard has sword accessory',
  );
}

{
  const set = getAccessorySetForOccupation('Knight of the Realm');
  assert(set.category === 'Guard', 'Knight → Guard category');
}

{
  const set = getAccessorySetForOccupation('Police Officer');
  assert(set.category === 'Guard', 'Police Officer → Guard category');
}

// Merchant-type occupations
{
  const set = getAccessorySetForOccupation('Merchant');
  assert(set.category === 'Merchant', 'Merchant → Merchant category');
  assert(
    set.accessories.some((a) => a.id === 'merchant_satchel'),
    'Merchant has satchel',
  );
}

{
  const set = getAccessorySetForOccupation('Shopkeeper');
  assert(set.category === 'Merchant', 'Shopkeeper → Merchant category');
}

// Cook-type occupations
{
  const set = getAccessorySetForOccupation('Baker');
  assert(set.category === 'Cook', 'Baker → Cook category');
  assert(
    set.accessories.some((a) => a.id === 'chef_hat'),
    'Baker has chef hat',
  );
  assert(
    set.accessories.some((a) => a.id === 'apron'),
    'Baker has apron',
  );
}

{
  const set = getAccessorySetForOccupation('Head Chef');
  assert(set.category === 'Cook', 'Head Chef → Cook category');
}

// Blacksmith-type
{
  const set = getAccessorySetForOccupation('Blacksmith');
  assert(set.category === 'Smith', 'Blacksmith → Smith category');
  assert(
    set.accessories.some((a) => a.id === 'hammer'),
    'Blacksmith has hammer',
  );
  assert(
    set.accessories.some((a) => a.id === 'apron'),
    'Blacksmith has apron',
  );
}

// Healer-type
{
  const set = getAccessorySetForOccupation('Doctor');
  assert(set.category === 'Healer', 'Doctor → Healer category');
  assert(
    set.accessories.some((a) => a.id === 'medical_bag'),
    'Doctor has medical bag',
  );
}

// Scholar-type
{
  const set = getAccessorySetForOccupation('Teacher');
  assert(set.category === 'Scholar', 'Teacher → Scholar category');
  assert(
    set.accessories.some((a) => a.id === 'book'),
    'Teacher has book',
  );
}

{
  const set = getAccessorySetForOccupation('Librarian');
  assert(set.category === 'Scholar', 'Librarian → Scholar category');
}

// Clergy-type
{
  const set = getAccessorySetForOccupation('Priest');
  assert(set.category === 'Clergy', 'Priest → Clergy category');
  assert(
    set.accessories.some((a) => a.id === 'holy_symbol'),
    'Priest has holy symbol',
  );
}

// Farmer-type
{
  const set = getAccessorySetForOccupation('Farmer');
  assert(set.category === 'Farmer', 'Farmer → Farmer category');
  assert(
    set.accessories.some((a) => a.id === 'farming_hoe'),
    'Farmer has farming hoe',
  );
}

// Miner-type
{
  const set = getAccessorySetForOccupation('Miner');
  assert(set.category === 'Miner', 'Miner → Miner category');
  assert(
    set.accessories.some((a) => a.id === 'pickaxe_handle'),
    'Miner has pickaxe',
  );
}

// Builder-type
{
  const set = getAccessorySetForOccupation('Carpenter');
  assert(set.category === 'Builder', 'Carpenter → Builder category');
}

// Barkeep-type
{
  const set = getAccessorySetForOccupation('Bartender');
  assert(set.category === 'Barkeep', 'Bartender → Barkeep category');
  assert(
    set.accessories.some((a) => a.id === 'apron'),
    'Bartender has apron',
  );
}

// Official-type
{
  const set = getAccessorySetForOccupation('Lawyer');
  assert(set.category === 'Official', 'Lawyer → Official category');
  assert(
    set.accessories.some((a) => a.id === 'scroll'),
    'Lawyer has scroll',
  );
}

{
  const set = getAccessorySetForOccupation('Mayor');
  assert(set.category === 'Official', 'Mayor → Official category');
}

// Traveler-type
{
  const set = getAccessorySetForOccupation('Adventurer');
  assert(set.category === 'Traveler', 'Adventurer → Traveler category');
  assert(
    set.accessories.some((a) => a.id === 'backpack'),
    'Adventurer has backpack',
  );
}

// Default/unknown occupation
{
  const set = getAccessorySetForOccupation('Jeweler');
  assert(set.category === 'Civilian', 'Unknown occupation → Civilian category');
  assert(set.accessories.length === 0, 'Civilian has no accessories');
}

{
  const set = getAccessorySetForOccupation('');
  assert(set.category === 'Civilian', 'Empty occupation → Civilian category');
}

// Case insensitivity
{
  const set = getAccessorySetForOccupation('TOWN GUARD');
  assert(set.category === 'Guard', 'Case insensitive: TOWN GUARD → Guard');
}

{
  const set = getAccessorySetForOccupation('bAkEr');
  assert(set.category === 'Cook', 'Case insensitive: bAkEr → Cook');
}

// Partial match (keyword embedded in longer occupation name)
{
  const set = getAccessorySetForOccupation('Royal Palace Guard Captain');
  assert(set.category === 'Guard', 'Partial match: Royal Palace Guard Captain → Guard');
}

{
  const set = getAccessorySetForOccupation('Traveling Merchant of Silks');
  assert(set.category === 'Merchant', 'Partial match: Traveling Merchant of Silks → Merchant');
}

// Accessory attachment points are valid
{
  const validPoints = new Set(['head', 'rightHand', 'back', 'waist']);
  const allSets = [
    'Guard', 'Merchant', 'Baker', 'Blacksmith', 'Doctor',
    'Teacher', 'Priest', 'Farmer', 'Miner', 'Carpenter',
    'Bartender', 'Lawyer', 'Adventurer',
  ];
  let allValid = true;
  for (const occ of allSets) {
    const set = getAccessorySetForOccupation(occ);
    for (const acc of set.accessories) {
      if (!validPoints.has(acc.attachPoint)) {
        allValid = false;
        console.error(`  Invalid attach point "${acc.attachPoint}" on ${acc.id}`);
      }
    }
  }
  assert(allValid, 'All accessories have valid attachment points');
}

// Label colors are non-zero (visible)
{
  const occupations = [
    'Guard', 'Merchant', 'Baker', 'Blacksmith', 'Doctor',
    'Teacher', 'Priest', 'Farmer', 'Miner', 'Carpenter',
    'Bartender', 'Lawyer', 'Adventurer', 'Unknown',
  ];
  let allVisible = true;
  for (const occ of occupations) {
    const set = getAccessorySetForOccupation(occ);
    const sum = set.labelColor.r + set.labelColor.g + set.labelColor.b;
    if (sum < 0.1) {
      allVisible = false;
      console.error(`  Label color too dark for "${occ}" (sum=${sum})`);
    }
  }
  assert(allVisible, 'All label colors are visible (non-black)');
}

// ---------- Summary ----------

console.log(`\n=== ${passed + failed} tests: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
