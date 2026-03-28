/**
 * Client-side cache for precomputed NPC greeting audio.
 * Keyed by character ID — avoids redundant TTS calls for frequently-visited NPCs.
 */

interface CachedGreetingAudio {
  blob: Blob;
  greeting: string; // The text that was synthesized — invalidate if greeting changes
}

const MAX_CACHE_SIZE = 20;
const cache = new Map<string, CachedGreetingAudio>();

/**
 * Get cached greeting audio for a character, if the greeting text matches.
 */
export function getCachedGreetingAudio(characterId: string, greeting: string): Blob | null {
  const entry = cache.get(characterId);
  if (entry && entry.greeting === greeting) {
    return entry.blob;
  }
  return null;
}

/**
 * Store greeting audio in the cache for a character.
 */
export function setCachedGreetingAudio(characterId: string, greeting: string, blob: Blob): void {
  // Evict oldest entry if at capacity
  if (cache.size >= MAX_CACHE_SIZE && !cache.has(characterId)) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
  cache.set(characterId, { blob, greeting });
}

/**
 * Fetch TTS audio for a greeting, using cache when available.
 * Returns the audio blob or null if TTS fails.
 */
export async function fetchGreetingAudio(
  characterId: string,
  greeting: string,
  voice: string,
  gender: string,
): Promise<Blob | null> {
  // Check cache first
  const cached = getCachedGreetingAudio(characterId, greeting);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: greeting, voice, gender }),
    });

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    setCachedGreetingAudio(characterId, greeting, blob);
    return blob;
  } catch (error) {
    console.warn('[GreetingAudioCache] TTS fetch failed:', error);
    return null;
  }
}

/**
 * Clear the entire greeting audio cache.
 */
export function clearGreetingAudioCache(): void {
  cache.clear();
}
