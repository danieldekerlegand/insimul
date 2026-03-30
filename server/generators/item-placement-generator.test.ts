/**
 * Tests for item-placement-generator.ts — contextual item placement.
 *
 * Run with: npx tsx server/generators/item-placement-generator.test.ts
 */

import {
  BUSINESS_ITEM_RULES,
  RESIDENCE_ITEM_RULES,
  itemMatchesRules,
  filterByWorldType,
  selectItemsForLocation,
  pickRandom,
  randInt,
} from './item-placement-generator';
import type { Item } from '../../shared/schema';

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

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    worldId: null,
    name: 'Test Item',
    description: 'A test item',
    itemType: 'food',
    icon: '🍞',
    value: 5,
    sellValue: 3,
    weight: 1,
    tradeable: true,
    stackable: true,
    maxStack: 20,
    worldType: null,
    objectRole: null,
    category: null,
    material: null,
    baseType: null,
    rarity: 'common',
    effects: null,
    lootWeight: 10,
    tags: ['food', 'loot:common'],
    isBase: true,
    possessable: true,
    metadata: {},
    craftingRecipe: null,
    questRelevance: [],
    loreText: null,
    translations: null,
    relatedTruthIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Item;
}

// ── Tests ──

console.log('\n═══ itemMatchesRules ═══');

{
  const breadItem = makeItem({ itemType: 'food', tags: ['food', 'loot:common'] });
  assert(
    itemMatchesRules(breadItem, BUSINESS_ITEM_RULES.Bakery),
    'Bread matches Bakery rules by tag "food"',
  );
}

{
  const swordItem = makeItem({ itemType: 'weapon', tags: ['weapon', 'melee'] });
  assert(
    !itemMatchesRules(swordItem, BUSINESS_ITEM_RULES.Bakery),
    'Sword does NOT match Bakery rules',
  );
}

{
  const potionItem = makeItem({ itemType: 'consumable', tags: ['consumable', 'healing'] });
  assert(
    itemMatchesRules(potionItem, BUSINESS_ITEM_RULES.Pharmacy),
    'Potion matches Pharmacy rules by tag "healing"',
  );
}

{
  const toolItem = makeItem({ itemType: 'tool', tags: ['tool'] });
  assert(
    itemMatchesRules(toolItem, RESIDENCE_ITEM_RULES),
    'Tool matches residence rules by tag "tool"',
  );
}

{
  const weaponItem = makeItem({ itemType: 'weapon', tags: ['weapon', 'ranged'] });
  assert(
    !itemMatchesRules(weaponItem, RESIDENCE_ITEM_RULES),
    'Weapon does NOT match residence rules',
  );
}

{
  const drinkItem = makeItem({ itemType: 'drink', tags: ['drink'] });
  assert(
    itemMatchesRules(drinkItem, BUSINESS_ITEM_RULES.Bar),
    'Drink matches Bar rules',
  );
  assert(
    itemMatchesRules(drinkItem, BUSINESS_ITEM_RULES.Restaurant),
    'Drink matches Restaurant rules',
  );
}

console.log('\n═══ filterByWorldType ═══');

{
  const items = [
    makeItem({ id: '1', worldType: 'medieval-fantasy' }),
    makeItem({ id: '2', worldType: 'cyberpunk' }),
    makeItem({ id: '3', worldType: null }),
  ];
  const filtered = filterByWorldType(items, 'medieval-fantasy');
  assert(filtered.length === 2, 'Filters to medieval-fantasy + universal items');
  assert(
    filtered.some(i => i.id === '1') && filtered.some(i => i.id === '3'),
    'Includes matching worldType and null worldType',
  );
}

{
  const items = [
    makeItem({ id: '1', worldType: 'cyberpunk' }),
    makeItem({ id: '2', worldType: 'western' }),
  ];
  const filtered = filterByWorldType(items, undefined);
  assert(filtered.length === 2, 'No worldType filter returns all items');
}

console.log('\n═══ pickRandom ═══');

{
  const arr = [1, 2, 3, 4, 5];
  const picked = pickRandom(arr, 3);
  assert(picked.length === 3, 'Picks requested number of items');
  assert(new Set(picked).size === 3, 'All picked items are unique');
  assert(picked.every(v => arr.includes(v)), 'All picked items come from source array');
}

{
  assert(pickRandom([], 5).length === 0, 'Returns empty for empty input');
  assert(pickRandom([1, 2], 0).length === 0, 'Returns empty for count 0');
  assert(pickRandom([1, 2], 5).length === 2, 'Caps at array length');
}

console.log('\n═══ randInt ═══');

{
  const results = new Set<number>();
  for (let i = 0; i < 100; i++) {
    const val = randInt(2, 5);
    results.add(val);
    assert(val >= 2 && val <= 5, `randInt(2,5) = ${val} is in range`);
  }
  assert(results.size > 1, 'randInt produces varied output');
}

console.log('\n═══ selectItemsForLocation ═══');

{
  const items = [
    makeItem({ id: '1', name: 'Bread', itemType: 'food', tags: ['food'], worldType: 'medieval-fantasy' }),
    makeItem({ id: '2', name: 'Cheese', itemType: 'food', tags: ['food'], worldType: null }),
    makeItem({ id: '3', name: 'Sword', itemType: 'weapon', tags: ['weapon'], worldType: 'medieval-fantasy' }),
    makeItem({ id: '4', name: 'Synth-Bar', itemType: 'food', tags: ['food'], worldType: 'cyberpunk' }),
    makeItem({ id: '5', name: 'Meat Pie', itemType: 'food', tags: ['food'], worldType: 'medieval-fantasy' }),
    makeItem({ id: '6', name: 'Egg', itemType: 'food', tags: ['food', 'ingredient'], worldType: null }),
  ];
  const selected = selectItemsForLocation(items, BUSINESS_ITEM_RULES.Bakery, 'medieval-fantasy');
  assert(selected.length >= BUSINESS_ITEM_RULES.Bakery.min, `Selected at least ${BUSINESS_ITEM_RULES.Bakery.min} items for bakery`);
  assert(
    selected.every(i => i.itemType === 'food'),
    'All selected items are food (match bakery rules)',
  );
  assert(
    selected.every(i => i.worldType === 'medieval-fantasy' || i.worldType === null),
    'No cyberpunk items selected for medieval-fantasy world',
  );
}

{
  const items = [
    makeItem({ id: '1', itemType: 'armor', tags: ['armor'] }),
  ];
  const selected = selectItemsForLocation(items, BUSINESS_ITEM_RULES.Bakery, undefined);
  assert(selected.length === 0, 'Returns empty when no items match rules');
}

console.log('\n═══ BUSINESS_ITEM_RULES coverage ═══');

{
  const expectedTypes = [
    'Bakery', 'Restaurant', 'Bar', 'GroceryStore', 'Shop',
    'Pharmacy', 'Hospital', 'JewelryStore', 'Farm', 'Factory',
    'Brewery', 'Church', 'School', 'University', 'Bank',
    'Warehouse', 'FishMarket', 'Hotel',
  ];
  for (const bt of expectedTypes) {
    const rules = BUSINESS_ITEM_RULES[bt];
    assert(rules !== undefined, `Business type "${bt}" has placement rules`);
    if (rules) {
      assert(rules.min > 0, `${bt} has min > 0`);
      assert(rules.max >= rules.min, `${bt} max >= min`);
      assert(rules.tags.length > 0, `${bt} has at least one tag`);
      assert(rules.itemTypes.length > 0, `${bt} has at least one itemType`);
    }
  }
}

console.log('\n═══ RESIDENCE_ITEM_RULES ═══');

{
  assert(RESIDENCE_ITEM_RULES.min > 0, 'Residence has min > 0');
  assert(RESIDENCE_ITEM_RULES.max >= RESIDENCE_ITEM_RULES.min, 'Residence max >= min');
  assert(RESIDENCE_ITEM_RULES.tags.length > 0, 'Residence has tags');
  assert(RESIDENCE_ITEM_RULES.itemTypes.length > 0, 'Residence has itemTypes');
}

// ── Summary ──

console.log(`\n${'═'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
