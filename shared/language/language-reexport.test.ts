/**
 * Tests for backward-compatible re-export files
 *
 * Verifies that imports from old paths (shared/language-*.ts) resolve
 * identically to imports from new paths (shared/language/*.ts).
 *
 * Run with: npx tsx shared/language/language-reexport.test.ts
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

async function runTests() {
  console.log('Language re-export backward compatibility tests\n');

  // Test 1: language-progress.ts re-exports from language/progress.ts
  console.log('Re-export: language-progress');
  const oldProgress = await import('../language-progress');
  const newProgress = await import('./progress');
  assert(typeof oldProgress.calculateMasteryLevel === 'function', 'calculateMasteryLevel exported from old path');
  assert(oldProgress.calculateMasteryLevel === newProgress.calculateMasteryLevel, 'calculateMasteryLevel matches new path');

  // Test 2: language-gamification.ts re-exports from language/gamification.ts
  console.log('Re-export: language-gamification');
  const oldGamification = await import('../language-gamification');
  const newGamification = await import('./gamification');
  const oldGamKeys = Object.keys(oldGamification).sort();
  const newGamKeys = Object.keys(newGamification).sort();
  assert(oldGamKeys.length > 0, 'gamification has exports from old path');
  assert(JSON.stringify(oldGamKeys) === JSON.stringify(newGamKeys), 'gamification exports match');

  // Test 3: language-quest-templates.ts re-exports from language/quest-templates.ts
  console.log('Re-export: language-quest-templates');
  const oldQuests = await import('../language-quest-templates');
  const newQuests = await import('./quest-templates');
  assert(Array.isArray(oldQuests.QUEST_TEMPLATES), 'QUEST_TEMPLATES exported from old path');
  assert(oldQuests.QUEST_TEMPLATES === newQuests.QUEST_TEMPLATES, 'QUEST_TEMPLATES is same reference');

  // Test 4: language-utils.ts re-exports from language/utils.ts
  console.log('Re-export: language-utils');
  const oldUtils = await import('../language-utils');
  const newUtils = await import('./utils');
  assert(typeof oldUtils.buildGreeting === 'function', 'buildGreeting exported from old path');
  assert(oldUtils.buildGreeting === newUtils.buildGreeting, 'buildGreeting is same reference');

  // Test 5: language-vocabulary-corpus.ts re-exports from language/vocabulary-corpus.ts
  console.log('Re-export: language-vocabulary-corpus');
  const oldVocab = await import('../language-vocabulary-corpus');
  const newVocab = await import('./vocabulary-corpus');
  const oldVocabKeys = Object.keys(oldVocab).sort();
  const newVocabKeys = Object.keys(newVocab).sort();
  assert(oldVocabKeys.length > 0, 'vocabulary-corpus has exports from old path');
  assert(JSON.stringify(oldVocabKeys) === JSON.stringify(newVocabKeys), 'vocabulary-corpus exports match');

  // Test 6: language.ts re-exports from language/types.ts
  // Note: types.ts only exports TypeScript types (no runtime values), so we verify
  // both modules resolve without error and have identical (empty) runtime keys
  console.log('Re-export: language (types)');
  const oldTypes = await import('../language');
  const newTypes = await import('./types');
  const oldTypeKeys = Object.keys(oldTypes).sort();
  const newTypeKeys = Object.keys(newTypes).sort();
  assert(JSON.stringify(oldTypeKeys) === JSON.stringify(newTypeKeys), 'language type exports match (type-only module)');

  // Test 7: pronunciation-scoring.ts re-exports from language/pronunciation-scoring.ts
  console.log('Re-export: pronunciation-scoring');
  const oldPron = await import('../pronunciation-scoring');
  const newPron = await import('./pronunciation-scoring');
  assert(typeof oldPron.scorePronunciation === 'function', 'scorePronunciation exported from old path');
  assert(oldPron.scorePronunciation === newPron.scorePronunciation, 'scorePronunciation is same reference');

  // Test 8: character-language-profile.ts re-exports from language/character-profile.ts
  console.log('Re-export: character-language-profile');
  const oldCharProfile = await import('../character-language-profile');
  const newCharProfile = await import('./character-profile');
  const oldCharKeys = Object.keys(oldCharProfile).sort();
  const newCharKeys = Object.keys(newCharProfile).sort();
  assert(oldCharKeys.length > 0, 'character-profile has exports from old path');
  assert(JSON.stringify(oldCharKeys) === JSON.stringify(newCharKeys), 'character-profile exports match');

  // Test 9: bilingual-name-generation.ts re-exports from language/bilingual-names.ts
  console.log('Re-export: bilingual-name-generation');
  const oldBilingual = await import('../bilingual-name-generation');
  const newBilingual = await import('./bilingual-names');
  assert(typeof oldBilingual.getBilingualBusinessName === 'function', 'getBilingualBusinessName exported from old path');
  assert(oldBilingual.getBilingualBusinessName === newBilingual.getBilingualBusinessName, 'getBilingualBusinessName is same reference');

  // Test 10: barrel index re-exports everything
  console.log('Barrel: language/index');
  const barrel = await import('./index');
  assert(typeof barrel.calculateMasteryLevel === 'function', 'barrel re-exports calculateMasteryLevel from progress');
  assert(typeof barrel.buildGreeting === 'function', 'barrel re-exports buildGreeting from utils');
  assert(Array.isArray(barrel.QUEST_TEMPLATES), 'barrel re-exports QUEST_TEMPLATES from quest-templates');
  assert(typeof barrel.scorePronunciation === 'function', 'barrel re-exports scorePronunciation');
  assert(typeof barrel.getBilingualBusinessName === 'function', 'barrel re-exports getBilingualBusinessName');

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
