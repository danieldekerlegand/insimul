/**
 * Tests for greeting-audio-cache
 *
 * Run with: npx tsx client/src/lib/greeting-audio-cache.test.ts
 */

import {
  getCachedGreetingAudio,
  setCachedGreetingAudio,
  clearGreetingAudioCache,
  fetchGreetingAudio,
} from './greeting-audio-cache';

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

function makeBlob(content: string): Blob {
  return new Blob([content], { type: 'audio/mp3' });
}

// --- Tests ---

console.log('GreetingAudioCache tests:');

// Test 1: cache miss returns null
clearGreetingAudioCache();
assert(getCachedGreetingAudio('char1', 'Hello!') === null, 'cache miss returns null');

// Test 2: cache hit returns blob when greeting matches
const blob1 = makeBlob('audio-data-1');
setCachedGreetingAudio('char1', 'Hello!', blob1);
assert(getCachedGreetingAudio('char1', 'Hello!') === blob1, 'cache hit returns stored blob');

// Test 3: cache miss when greeting text differs
assert(getCachedGreetingAudio('char1', 'Bonjour!') === null, 'different greeting text returns null');

// Test 4: overwriting cache entry
const blob2 = makeBlob('audio-data-2');
setCachedGreetingAudio('char1', 'Bonjour!', blob2);
assert(getCachedGreetingAudio('char1', 'Bonjour!') === blob2, 'overwritten entry returns new blob');
assert(getCachedGreetingAudio('char1', 'Hello!') === null, 'old greeting no longer matches');

// Test 5: multiple characters
const blob3 = makeBlob('audio-data-3');
setCachedGreetingAudio('char2', 'Hi there!', blob3);
assert(getCachedGreetingAudio('char2', 'Hi there!') === blob3, 'separate character has own cache');
assert(getCachedGreetingAudio('char1', 'Bonjour!') === blob2, 'other character cache unaffected');

// Test 6: clearGreetingAudioCache clears everything
clearGreetingAudioCache();
assert(getCachedGreetingAudio('char1', 'Bonjour!') === null, 'cache cleared for char1');
assert(getCachedGreetingAudio('char2', 'Hi there!') === null, 'cache cleared for char2');

// Test 7: eviction when cache exceeds MAX_CACHE_SIZE (20)
clearGreetingAudioCache();
for (let i = 0; i < 20; i++) {
  setCachedGreetingAudio(`evict-${i}`, `greeting-${i}`, makeBlob(`data-${i}`));
}
// All 20 should be present
assert(getCachedGreetingAudio('evict-0', 'greeting-0') !== null, '20 entries fit in cache');
assert(getCachedGreetingAudio('evict-19', 'greeting-19') !== null, 'last of 20 entries present');

// Adding 21st should evict the oldest (evict-0)
setCachedGreetingAudio('evict-20', 'greeting-20', makeBlob('data-20'));
assert(getCachedGreetingAudio('evict-0', 'greeting-0') === null, 'oldest entry evicted at capacity');
assert(getCachedGreetingAudio('evict-20', 'greeting-20') !== null, 'new entry added after eviction');
assert(getCachedGreetingAudio('evict-1', 'greeting-1') !== null, 'second-oldest entry still present');

// Test 8: fetchGreetingAudio with mock fetch
clearGreetingAudioCache();
console.log('\nfetchGreetingAudio tests:');

// Mock global fetch
const originalFetch = globalThis.fetch;

// Successful fetch
globalThis.fetch = (async () => ({
  ok: true,
  blob: async () => makeBlob('fetched-audio'),
})) as any;

const fetched = await fetchGreetingAudio('fetch-char', 'Hello!', 'Kore', 'female');
assert(fetched !== null, 'fetchGreetingAudio returns blob on success');
assert(fetched instanceof Blob, 'returned value is a Blob');

// Second call should use cache (fetch should not be called again)
let fetchCalled = false;
globalThis.fetch = (async () => {
  fetchCalled = true;
  return { ok: true, blob: async () => makeBlob('should-not-use') };
}) as any;

const cached = await fetchGreetingAudio('fetch-char', 'Hello!', 'Kore', 'female');
assert(!fetchCalled, 'second call uses cache, does not call fetch');
assert(cached !== null, 'cached result returned');

// Failed fetch returns null
globalThis.fetch = (async () => ({ ok: false })) as any;
const failedResult = await fetchGreetingAudio('fail-char', 'Hola!', 'Charon', 'male');
assert(failedResult === null, 'failed fetch returns null');

// Network error returns null
globalThis.fetch = (async () => { throw new Error('Network error'); }) as any;
const errorResult = await fetchGreetingAudio('error-char', 'Ciao!', 'Kore', 'female');
assert(errorResult === null, 'network error returns null');

// Restore original fetch
globalThis.fetch = originalFetch;

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
