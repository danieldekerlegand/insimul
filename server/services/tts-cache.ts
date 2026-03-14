/**
 * LRU Cache for TTS audio responses.
 * Caches generated audio buffers keyed by text+voice+gender+encoding
 * to avoid redundant API calls for repeated phrases.
 */

interface CacheEntry {
  buffer: Buffer;
  size: number;
}

export class TTSCache {
  private cache = new Map<string, CacheEntry>();
  private maxEntries: number;
  private maxTotalBytes: number;
  private totalBytes = 0;

  constructor(maxEntries = 200, maxTotalBytes = 50 * 1024 * 1024) {
    this.maxEntries = maxEntries;
    this.maxTotalBytes = maxTotalBytes;
  }

  static makeKey(text: string, voice: string, gender: string, encoding: string, emotionalTone?: string): string {
    const tone = emotionalTone || 'neutral';
    return `${encoding}:${voice}:${gender}:${tone}:${text}`;
  }

  get(key: string): Buffer | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Move to end (most recently used) by re-inserting
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.buffer;
  }

  set(key: string, buffer: Buffer): void {
    const size = buffer.length;

    // If already cached, remove old entry first
    if (this.cache.has(key)) {
      const old = this.cache.get(key)!;
      this.totalBytes -= old.size;
      this.cache.delete(key);
    }

    // Evict LRU entries until we have room
    while (
      this.cache.size >= this.maxEntries ||
      this.totalBytes + size > this.maxTotalBytes
    ) {
      if (this.cache.size === 0) break;
      const firstKey = this.cache.keys().next().value!;
      const evicted = this.cache.get(firstKey)!;
      this.totalBytes -= evicted.size;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, { buffer, size });
    this.totalBytes += size;
  }

  get size(): number {
    return this.cache.size;
  }

  get bytes(): number {
    return this.totalBytes;
  }

  clear(): void {
    this.cache.clear();
    this.totalBytes = 0;
  }
}

// Singleton cache instance
export const ttsCache = new TTSCache();
