/**
 * Tests for PhysicalActionRadialMenu feature
 *
 * Tests PlayerActionSystem.checkAvailability() logic and menu integration behavior.
 * The Babylon.js GUI rendering is not testable without a full engine, so we test
 * the data flow and availability logic.
 *
 * Run with: npx tsx client/src/components/3DGame/__tests__/PhysicalActionRadialMenu.test.ts
 */

import {
  PlayerActionSystem,
  ACTION_DEFINITIONS,
  BUSINESS_ACTION_HOTSPOTS,
  type PlayerActionCallbacks,
  type PhysicalActionType,
} from '../PlayerActionSystem';

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeCallbacks(overrides: Partial<PlayerActionCallbacks> = {}): PlayerActionCallbacks {
  return {
    showToast: () => {},
    setMovementLocked: () => {},
    getPlayerEnergy: () => 50,
    setPlayerEnergy: () => {},
    addInventoryItem: () => {},
    hasInventoryItem: () => true,
    getCurrentBuildingId: () => null,
    getCurrentBusinessType: () => null,
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

console.log('\nPhysicalActionRadialMenu Feature Tests\n');

// 1. checkAvailability returns all requested actions
console.log('1. checkAvailability returns definitions for valid action types');
{
  const sys = new PlayerActionSystem(makeCallbacks());
  const result = sys.checkAvailability(['cooking', 'reading', 'crafting']);
  assert(result.length === 3, 'returns 3 action entries');
  assert(result[0].definition.type === 'cooking', 'first is cooking');
  assert(result[1].definition.type === 'reading', 'second is reading');
  assert(result[2].definition.type === 'crafting', 'third is crafting');
}

// 2. All actions performable when energy is sufficient and tools present
console.log('\n2. Actions are performable with sufficient energy and tools');
{
  const sys = new PlayerActionSystem(makeCallbacks({ getPlayerEnergy: () => 100 }));
  const result = sys.checkAvailability(['cooking', 'reading']);
  assert(result.every(r => r.canPerform), 'all actions can be performed');
  assert(result.every(r => r.reason === undefined), 'no reasons given');
}

// 3. Low energy disables actions
console.log('\n3. Low energy disables actions that cost more');
{
  const sys = new PlayerActionSystem(makeCallbacks({ getPlayerEnergy: () => 2 }));
  const result = sys.checkAvailability(['cooking', 'reading', 'mining']);

  const cooking = result.find(r => r.definition.type === 'cooking')!;
  const reading = result.find(r => r.definition.type === 'reading')!;
  const mining = result.find(r => r.definition.type === 'mining')!;

  assert(!cooking.canPerform, 'cooking disabled (costs 4, have 2)');
  assert(cooking.reason === 'Low energy', 'cooking reason is Low energy');
  assert(reading.canPerform, 'reading enabled (costs 1, have 2)');
  assert(!mining.canPerform, 'mining disabled (costs 8, have 2)');
}

// 4. Missing tool disables action
console.log('\n4. Missing required tool disables action');
{
  const sys = new PlayerActionSystem(
    makeCallbacks({
      getPlayerEnergy: () => 100,
      hasInventoryItem: (item: string) => item !== 'pickaxe',
    }),
  );
  const result = sys.checkAvailability(['mining', 'cooking']);

  const mining = result.find(r => r.definition.type === 'mining')!;
  const cooking = result.find(r => r.definition.type === 'cooking')!;

  assert(!mining.canPerform, 'mining disabled without pickaxe');
  assert(mining.reason === 'Need pickaxe', 'reason mentions tool');
  assert(cooking.canPerform, 'cooking enabled (no tool required)');
}

// 5. Busy state disables all actions
console.log('\n5. Busy state (already performing action) disables all');
{
  const sys = new PlayerActionSystem(makeCallbacks({ getPlayerEnergy: () => 100 }));
  // Start an action to make system busy
  sys.startAction(ACTION_DEFINITIONS.reading);

  const result = sys.checkAvailability(['cooking', 'reading']);
  assert(result.every(r => !r.canPerform), 'all disabled while busy');
  assert(result.every(r => r.reason === 'Busy'), 'all show Busy reason');

  sys.cancelAction();
}

// 6. Deduplicates action types
console.log('\n6. Deduplicates repeated action types');
{
  const sys = new PlayerActionSystem(makeCallbacks());
  const result = sys.checkAvailability(['cooking', 'cooking', 'cooking']);
  assert(result.length === 1, 'returns only 1 entry for duplicated type');
}

// 7. Single action scenario (skip menu, perform directly)
console.log('\n7. Single available action should be directly performable');
{
  const toasts: string[] = [];
  const sys = new PlayerActionSystem(
    makeCallbacks({
      getPlayerEnergy: () => 100,
      showToast: (opts) => toasts.push(opts.title),
    }),
  );

  const result = sys.checkAvailability(['reading']);
  assert(result.length === 1, 'exactly one action');
  assert(result[0].canPerform, 'it can be performed');

  // Simulate: if only one and canPerform, startAction directly
  const started = sys.startAction(result[0].definition);
  assert(started, 'action started successfully');
  assert(sys.isPerformingAction, 'system is now performing');

  sys.cancelAction();
}

// 8. Action definitions are complete
console.log('\n8. All 10 action definitions have required fields');
{
  const allTypes: PhysicalActionType[] = [
    'fishing', 'mining', 'harvesting', 'cooking', 'crafting',
    'painting', 'reading', 'praying', 'sweeping', 'chopping',
  ];
  for (const type of allTypes) {
    const def = ACTION_DEFINITIONS[type];
    assert(!!def, `${type} definition exists`);
    assert(def.displayName.length > 0, `${type} has displayName`);
    assert(def.duration > 0, `${type} has positive duration`);
    assert(def.energyCost >= 0, `${type} has non-negative energyCost`);
  }
}

// 9. Business hotspot mapping works
console.log('\n9. Business hotspot mapping returns correct actions');
{
  const restaurantHotspots = PlayerActionSystem.getHotspotsForBusiness('restaurant');
  assert(restaurantHotspots.length > 0, 'restaurant has hotspots');
  assert(restaurantHotspots[0].actionType === 'cooking', 'restaurant maps to cooking');

  const libraryHotspots = PlayerActionSystem.getHotspotsForBusiness('library');
  assert(libraryHotspots.length > 0, 'library has hotspots');
  assert(libraryHotspots[0].actionType === 'reading', 'library maps to reading');

  const unknownHotspots = PlayerActionSystem.getHotspotsForBusiness('spaceship');
  assert(unknownHotspots.length === 0, 'unknown business has no hotspots');
}

// 10. checkAvailability with empty array
console.log('\n10. checkAvailability with empty array returns empty');
{
  const sys = new PlayerActionSystem(makeCallbacks());
  const result = sys.checkAvailability([]);
  assert(result.length === 0, 'returns empty array');
}

// 11. Tool-required actions show tool info in definition
console.log('\n11. Tool-requiring actions have requiredTool set');
{
  assert(ACTION_DEFINITIONS.fishing.requiredTool === 'fishing_rod', 'fishing needs fishing_rod');
  assert(ACTION_DEFINITIONS.mining.requiredTool === 'pickaxe', 'mining needs pickaxe');
  assert(ACTION_DEFINITIONS.chopping.requiredTool === 'axe', 'chopping needs axe');
  assert(ACTION_DEFINITIONS.cooking.requiredTool === undefined, 'cooking has no tool requirement');
}

// 12. Keyboard number key range (1-8 supported)
console.log('\n12. Menu supports up to 8 actions');
{
  const allTypes: PhysicalActionType[] = [
    'fishing', 'mining', 'harvesting', 'cooking', 'crafting',
    'painting', 'reading', 'praying',
  ];
  const sys = new PlayerActionSystem(makeCallbacks({ getPlayerEnergy: () => 100 }));
  const result = sys.checkAvailability(allTypes);
  assert(result.length === 8, 'returns 8 actions');
  assert(result.length <= 8, 'within keyboard shortcut range 1-8');
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
