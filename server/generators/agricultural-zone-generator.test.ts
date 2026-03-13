/**
 * Tests for agricultural-zone-generator.ts
 */

import {
  AgriculturalZoneGenerator,
  AgriculturalZone,
  AgriculturalZoneConfig,
} from './agricultural-zone-generator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

function makeConfig(overrides: Partial<AgriculturalZoneConfig> = {}): AgriculturalZoneConfig {
  return {
    settlementType: 'town',
    terrain: 'plains',
    foundedYear: 1850,
    mapSize: 1000,
    centerX: 500,
    centerY: 500,
    seed: 42,
    ...overrides,
  };
}

const gen = new AgriculturalZoneGenerator();

// --- Basic generation ---
console.log('\n=== Basic Generation ===');

{
  const zones = gen.generate(makeConfig());
  assert(zones.length > 0, 'generates zones for a plains town');
  assert(
    zones.some(z => z.type === 'farmland'),
    'includes farmland zones',
  );
  assert(
    zones.some(z => z.type === 'orchard'),
    'includes orchard zones',
  );
  assert(
    zones.some(z => z.type === 'pasture'),
    'includes pasture zones',
  );
}

// --- Deterministic with seed ---
console.log('\n=== Determinism ===');

{
  const a = gen.generate(makeConfig({ seed: 99 }));
  const b = gen.generate(makeConfig({ seed: 99 }));
  assert(a.length === b.length, 'same seed produces same zone count');
  assert(
    a.every((z, i) => z.x === b[i].x && z.y === b[i].y),
    'same seed produces same positions',
  );
}

// --- Terrain suitability ---
console.log('\n=== Terrain Suitability ===');

{
  const mountainZones = gen.generate(makeConfig({ terrain: 'mountains' }));
  const farmlandCount = mountainZones.filter(z => z.type === 'farmland').length;
  assert(farmlandCount === 0, 'mountains produce no farmland');

  const pastureCount = mountainZones.filter(z => z.type === 'pasture').length;
  assert(pastureCount > 0, 'mountains still produce some pasture');
}

{
  const desertZones = gen.generate(makeConfig({ terrain: 'desert' }));
  const plainsZones = gen.generate(makeConfig({ terrain: 'plains' }));
  assert(
    desertZones.length < plainsZones.length,
    'desert produces fewer zones than plains',
  );
}

// --- Settlement scaling ---
console.log('\n=== Settlement Scaling ===');

{
  const villageZones = gen.generate(makeConfig({ settlementType: 'village' }));
  const cityZones = gen.generate(makeConfig({ settlementType: 'city' }));
  assert(
    cityZones.length > villageZones.length,
    'cities produce more agricultural zones than villages',
  );
}

// --- Zone properties ---
console.log('\n=== Zone Properties ===');

{
  const zones = gen.generate(makeConfig());
  for (const zone of zones) {
    assert(zone.id.startsWith('agri-'), `zone ${zone.id} has proper id prefix`);
    assert(zone.name.length > 0, `zone ${zone.id} has a name`);
    assert(zone.width > 0, `zone ${zone.id} has positive width`);
    assert(zone.height > 0, `zone ${zone.id} has positive height`);
    assert(
      zone.properties.soilQuality >= 0 && zone.properties.soilQuality <= 100,
      `zone ${zone.id} soil quality in range`,
    );
    assert(
      zone.properties.yield >= 0 && zone.properties.yield <= 100,
      `zone ${zone.id} yield in range`,
    );
    assert(
      zone.properties.established >= 1850,
      `zone ${zone.id} established after founding year`,
    );
  }
}

// --- Farmland has crops ---
console.log('\n=== Crop/Livestock Assignment ===');

{
  const zones = gen.generate(makeConfig());
  const farmlands = zones.filter(z => z.type === 'farmland');
  for (const f of farmlands) {
    assert(!!f.properties.crop, `farmland ${f.id} has a crop assigned`);
  }

  const orchards = zones.filter(z => z.type === 'orchard');
  for (const o of orchards) {
    assert(!!o.properties.crop, `orchard ${o.id} has a crop assigned`);
  }

  const pastures = zones.filter(z => z.type === 'pasture');
  for (const p of pastures) {
    assert(!!p.properties.livestock, `pasture ${p.id} has livestock assigned`);
  }
}

// --- Zones placed outside settlement ---
console.log('\n=== Zone Placement ===');

{
  const config = makeConfig({ mapSize: 1000, centerX: 500, centerY: 500 });
  const zones = gen.generate(config);
  const outerRadius = config.mapSize * 0.6;

  for (const zone of zones) {
    const dx = zone.x - config.centerX;
    const dy = zone.y - config.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    assert(
      dist >= outerRadius * 0.95, // small tolerance for rounding
      `zone ${zone.id} placed outside settlement (dist=${dist.toFixed(0)} >= ${(outerRadius * 0.95).toFixed(0)})`,
    );
  }
}

// --- River terrain irrigates ---
console.log('\n=== Irrigation ===');

{
  const zones = gen.generate(makeConfig({ terrain: 'river' }));
  assert(
    zones.every(z => z.properties.irrigated),
    'all river terrain zones are irrigated',
  );
}

// --- Summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
