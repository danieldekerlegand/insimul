import { describe, it, expect, beforeEach } from 'vitest';
import { TTSCache } from '../services/tts-cache';

describe('TTSCache', () => {
  let cache: TTSCache;

  beforeEach(() => {
    cache = new TTSCache(3, 1024);
  });

  describe('makeKey', () => {
    it('creates a deterministic key from parameters', () => {
      const key = TTSCache.makeKey('hello', 'Kore', 'female', 'MP3');
      expect(key).toBe('MP3:Kore:female:neutral:hello');
    });

    it('creates different keys for different parameters', () => {
      const k1 = TTSCache.makeKey('hello', 'Kore', 'female', 'MP3');
      const k2 = TTSCache.makeKey('hello', 'Charon', 'male', 'MP3');
      const k3 = TTSCache.makeKey('hello', 'Kore', 'female', 'WAV');
      expect(k1).not.toBe(k2);
      expect(k1).not.toBe(k3);
    });

    it('includes emotional tone in cache key', () => {
      const k1 = TTSCache.makeKey('hello', 'Kore', 'female', 'MP3', 'happy');
      const k2 = TTSCache.makeKey('hello', 'Kore', 'female', 'MP3', 'sad');
      const k3 = TTSCache.makeKey('hello', 'Kore', 'female', 'MP3');
      expect(k1).toBe('MP3:Kore:female:happy:hello');
      expect(k2).toBe('MP3:Kore:female:sad:hello');
      expect(k3).toBe('MP3:Kore:female:neutral:hello');
      expect(k1).not.toBe(k2);
      expect(k1).not.toBe(k3);
    });
  });

  describe('get/set', () => {
    it('returns undefined for missing keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('stores and retrieves a buffer', () => {
      const buf = Buffer.from('audio-data');
      cache.set('key1', buf);
      expect(cache.get('key1')).toBe(buf);
      expect(cache.size).toBe(1);
    });

    it('tracks byte size', () => {
      const buf = Buffer.from('12345');
      cache.set('key1', buf);
      expect(cache.bytes).toBe(5);
    });

    it('overwrites existing entry with same key', () => {
      const buf1 = Buffer.from('old');
      const buf2 = Buffer.from('new-data');
      cache.set('key1', buf1);
      cache.set('key1', buf2);
      expect(cache.get('key1')).toBe(buf2);
      expect(cache.size).toBe(1);
      expect(cache.bytes).toBe(buf2.length);
    });
  });

  describe('LRU eviction by entry count', () => {
    it('evicts the least recently used entry when maxEntries is exceeded', () => {
      cache.set('a', Buffer.from('1'));
      cache.set('b', Buffer.from('2'));
      cache.set('c', Buffer.from('3'));
      // Cache is full (3 entries). Adding a 4th should evict 'a'.
      cache.set('d', Buffer.from('4'));

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeDefined();
      expect(cache.get('d')).toBeDefined();
      expect(cache.size).toBe(3);
    });

    it('accessing an entry makes it most recently used', () => {
      cache.set('a', Buffer.from('1'));
      cache.set('b', Buffer.from('2'));
      cache.set('c', Buffer.from('3'));

      // Access 'a' to make it recently used
      cache.get('a');

      // Adding 'd' should now evict 'b' (least recently used)
      cache.set('d', Buffer.from('4'));

      expect(cache.get('a')).toBeDefined();
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBeDefined();
      expect(cache.get('d')).toBeDefined();
    });
  });

  describe('LRU eviction by byte limit', () => {
    it('evicts entries to stay within maxTotalBytes', () => {
      // maxTotalBytes = 1024
      const bigBuf = Buffer.alloc(400, 'x');
      cache.set('a', bigBuf);
      cache.set('b', bigBuf);
      // 800 bytes used. Adding another 400 = 1200 > 1024, should evict 'a'
      cache.set('c', bigBuf);

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeDefined();
      expect(cache.get('c')).toBeDefined();
      expect(cache.bytes).toBe(800);
    });
  });

  describe('clear', () => {
    it('removes all entries and resets byte count', () => {
      cache.set('a', Buffer.from('data'));
      cache.set('b', Buffer.from('more'));
      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.bytes).toBe(0);
      expect(cache.get('a')).toBeUndefined();
    });
  });

  describe('default constructor', () => {
    it('uses sensible defaults', () => {
      const defaultCache = new TTSCache();
      // Should not throw with defaults
      defaultCache.set('test', Buffer.from('data'));
      expect(defaultCache.get('test')).toBeDefined();
    });
  });
});
