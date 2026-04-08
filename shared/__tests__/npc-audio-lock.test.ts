import { describe, it, expect, beforeEach } from 'vitest';
import { NpcAudioLock } from '../game-engine/rendering/NpcAudioLock';

describe('NpcAudioLock', () => {
  let lock: NpcAudioLock;

  beforeEach(() => {
    lock = new NpcAudioLock();
  });

  it('starts unlocked', () => {
    expect(lock.isLocked()).toBe(false);
    expect(lock.currentOwner).toBeNull();
  });

  it('acquire succeeds when unlocked', () => {
    expect(lock.acquire('greeting-npc1')).toBe(true);
    expect(lock.isLocked()).toBe(true);
    expect(lock.currentOwner).toBe('greeting-npc1');
  });

  it('acquire fails when already locked', () => {
    lock.acquire('greeting-npc1');
    expect(lock.acquire('ambient')).toBe(false);
    expect(lock.currentOwner).toBe('greeting-npc1');
  });

  it('release frees the lock when owner matches', () => {
    lock.acquire('greeting-npc1');
    lock.release('greeting-npc1');
    expect(lock.isLocked()).toBe(false);
    expect(lock.currentOwner).toBeNull();
  });

  it('release does nothing when owner does not match', () => {
    lock.acquire('greeting-npc1');
    lock.release('ambient');
    expect(lock.isLocked()).toBe(true);
    expect(lock.currentOwner).toBe('greeting-npc1');
  });

  it('forceRelease unconditionally releases the lock', () => {
    lock.acquire('ambient');
    lock.forceRelease();
    expect(lock.isLocked()).toBe(false);
    expect(lock.currentOwner).toBeNull();
  });

  it('allows re-acquire after release', () => {
    lock.acquire('greeting-npc1');
    lock.release('greeting-npc1');
    expect(lock.acquire('ambient')).toBe(true);
    expect(lock.currentOwner).toBe('ambient');
  });

  it('allows re-acquire after forceRelease', () => {
    lock.acquire('greeting-npc1');
    lock.forceRelease();
    expect(lock.acquire('greeting-npc2')).toBe(true);
    expect(lock.currentOwner).toBe('greeting-npc2');
  });

  it('forceRelease is safe when already unlocked', () => {
    lock.forceRelease();
    expect(lock.isLocked()).toBe(false);
  });

  it('release is safe when already unlocked', () => {
    lock.release('nobody');
    expect(lock.isLocked()).toBe(false);
  });
});
