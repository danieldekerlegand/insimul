/**
 * Tests for gender-based NPC model selection logic.
 *
 * Run with: npx tsx client/src/components/3DGame/__tests__/NPCGenderModelSelection.test.ts
 *
 * These tests verify that resolveNPCModelUrl picks the correct gender-specific
 * model for civilian NPCs and that DataSource stores male/female models separately.
 */

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

// ---------------------------------------------------------------------------
// Replicate the model resolution logic from BabylonGame.resolveNPCModelUrl
// ---------------------------------------------------------------------------

type NPCRole = 'civilian' | 'guard' | 'merchant' | 'questgiver';

interface MockAsset {
  id: string;
  filePath: string;
}

function resolveNPCModelUrl(
  characterModels: Record<string, string>,
  worldAssets: MockAsset[],
  role: NPCRole,
  gender?: string,
): { rootUrl: string; file: string; cacheKey: string } | null {
  let roleSpecificId = characterModels[role];
  if (role === 'civilian' && gender) {
    const genderKey = gender === 'female' ? 'civilianFemale' : 'civilianMale';
    if (characterModels[genderKey]) {
      roleSpecificId = characterModels[genderKey];
    }
  }
  const defaultId = characterModels.npcDefault;
  const npcConfigId = roleSpecificId || defaultId;

  if (npcConfigId && worldAssets.length > 0) {
    const overrideAsset = worldAssets.find((a) => a.id === npcConfigId);
    if (overrideAsset && overrideAsset.filePath) {
      const cleanPath = overrideAsset.filePath.replace(/^\//, '');
      const lastSlash = cleanPath.lastIndexOf('/');
      const rootUrl = lastSlash >= 0 ? '/' + cleanPath.substring(0, lastSlash + 1) : '/';
      const file = lastSlash >= 0 ? cleanPath.substring(lastSlash + 1) : cleanPath;
      return { rootUrl, file, cacheKey: npcConfigId };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Replicate the DataSource character model building logic
// ---------------------------------------------------------------------------

function buildCharacterModels(roles: string[]): Record<string, string> {
  const characterModels: Record<string, string> = {};
  for (const role of roles) {
    characterModels[role] = role;
    if (role === 'npc_default') {
      if (!characterModels['npcDefault']) characterModels['npcDefault'] = 'npc_default';
      if (!characterModels['guard']) characterModels['guard'] = 'npc_default';
      if (!characterModels['merchant']) characterModels['merchant'] = 'npc_default';
      if (!characterModels['civilian']) characterModels['civilian'] = 'npc_default';
      if (!characterModels['questgiver']) characterModels['questgiver'] = 'npc_default';
    }
    if (role === 'npc_guard') characterModels['guard'] = 'npc_guard';
    if (role === 'npc_merchant') characterModels['merchant'] = 'npc_merchant';
    if (role === 'npc_civilian_male') {
      characterModels['civilianMale'] = role;
      if (!characterModels['civilian']) characterModels['civilian'] = role;
    }
    if (role === 'npc_civilian_female') {
      characterModels['civilianFemale'] = role;
      if (!characterModels['civilian']) characterModels['civilian'] = role;
    }
  }
  return characterModels;
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const worldAssets: MockAsset[] = [
  { id: 'npc_default', filePath: '/assets/characters/generic/npc_default.glb' },
  { id: 'npc_civilian_male', filePath: '/assets/characters/generic/npc_civilian_male.glb' },
  { id: 'npc_civilian_female', filePath: '/assets/characters/generic/npc_civilian_female.glb' },
  { id: 'npc_guard', filePath: '/assets/characters/generic/npc_guard.glb' },
  { id: 'npc_merchant', filePath: '/assets/characters/generic/npc_merchant.glb' },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

console.log('\n=== DataSource: buildCharacterModels ===');
{
  const models = buildCharacterModels([
    'npc_default',
    'npc_civilian_male',
    'npc_civilian_female',
    'npc_guard',
    'npc_merchant',
  ]);

  assert(models['civilianMale'] === 'npc_civilian_male', 'stores civilianMale model');
  assert(models['civilianFemale'] === 'npc_civilian_female', 'stores civilianFemale model');
  assert(models['guard'] === 'npc_guard', 'stores guard model');
  assert(models['merchant'] === 'npc_merchant', 'stores merchant model');
  assert(models['civilian'] !== undefined, 'civilian fallback is set');
}

console.log('\n=== resolveNPCModelUrl: gender-based civilian selection ===');
{
  const models = buildCharacterModels([
    'npc_default',
    'npc_civilian_male',
    'npc_civilian_female',
  ]);

  const maleResult = resolveNPCModelUrl(models, worldAssets, 'civilian', 'male');
  assert(maleResult !== null, 'male civilian resolves to a model');
  assert(maleResult!.file === 'npc_civilian_male.glb', 'male civilian uses male GLB');
  assert(maleResult!.cacheKey === 'npc_civilian_male', 'male civilian cache key is correct');

  const femaleResult = resolveNPCModelUrl(models, worldAssets, 'civilian', 'female');
  assert(femaleResult !== null, 'female civilian resolves to a model');
  assert(femaleResult!.file === 'npc_civilian_female.glb', 'female civilian uses female GLB');
  assert(femaleResult!.cacheKey === 'npc_civilian_female', 'female civilian cache key is correct');
}

console.log('\n=== resolveNPCModelUrl: no gender falls back to generic civilian ===');
{
  const models = buildCharacterModels([
    'npc_default',
    'npc_civilian_male',
    'npc_civilian_female',
  ]);

  const noGenderResult = resolveNPCModelUrl(models, worldAssets, 'civilian');
  assert(noGenderResult !== null, 'no-gender civilian resolves');
  // With npc_default present, 'civilian' key is set to 'npc_default' first
  assert(noGenderResult!.file === 'npc_default.glb', 'no-gender civilian uses generic civilian/default fallback');
}

console.log('\n=== resolveNPCModelUrl: non-civilian roles ignore gender ===');
{
  const models = buildCharacterModels([
    'npc_default',
    'npc_civilian_male',
    'npc_civilian_female',
    'npc_guard',
  ]);

  const guardResult = resolveNPCModelUrl(models, worldAssets, 'guard', 'female');
  assert(guardResult !== null, 'guard role resolves');
  assert(guardResult!.file === 'npc_guard.glb', 'guard role ignores gender and uses guard model');
}

console.log('\n=== resolveNPCModelUrl: "other" gender defaults to male model ===');
{
  const models = buildCharacterModels([
    'npc_default',
    'npc_civilian_male',
    'npc_civilian_female',
  ]);

  const otherResult = resolveNPCModelUrl(models, worldAssets, 'civilian', 'other');
  assert(otherResult !== null, 'other gender resolves');
  assert(otherResult!.file === 'npc_civilian_male.glb', 'other gender defaults to male model');
}

console.log('\n=== resolveNPCModelUrl: falls back to npcDefault when no civilian models ===');
{
  const models = buildCharacterModels(['npc_default']);

  const result = resolveNPCModelUrl(models, worldAssets, 'civilian', 'female');
  assert(result !== null, 'falls back to npcDefault');
  assert(result!.file === 'npc_default.glb', 'uses default model when no gender-specific civilian exists');
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
