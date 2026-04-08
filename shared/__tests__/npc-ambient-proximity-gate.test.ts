import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Vector3 } from '@babylonjs/core';
import { NpcAudioLock } from '../game-engine/rendering/NpcAudioLock';
import { NPCAmbientConversationManager } from '../game-engine/rendering/NPCAmbientConversationManager';

// The manager uses window.setInterval/clearInterval which doesn't exist in Node
// Provide a shim so vi.useFakeTimers() intercepts them.
if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function makeMockMesh(position: Vector3): any {
  return {
    position: position.clone(),
    rotation: { y: 0 },
    isEnabled: () => true,
    subtract: position.subtract.bind(position),
  };
}

function makeMockScene(): any {
  return {};
}

function makeMockTalkingIndicator(): any {
  return {
    show: vi.fn(),
    hide: vi.fn(),
    updateText: vi.fn(),
    setGUI: vi.fn(),
  };
}

describe('NPCAmbientConversationManager — US-004 proximity gate & audio lock', () => {
  let manager: NPCAmbientConversationManager;
  let lock: NpcAudioLock;
  let scene: any;
  let indicator: any;

  beforeEach(() => {
    vi.useFakeTimers();
    lock = new NpcAudioLock();
    scene = makeMockScene();
    indicator = makeMockTalkingIndicator();
    manager = new NPCAmbientConversationManager(scene, 'world1', indicator);
    manager.setAudioLock(lock);
    manager.setAnimationCallback(vi.fn());
  });

  afterEach(() => {
    manager.dispose();
    vi.useRealTimers();
  });

  // ── Player proximity gate ──

  it('does not start conversations when player mesh is not set', () => {
    // Two NPCs close together, no player mesh
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle');
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(2, 0, 0)), 'idle');

    // Seed random to always pass the 50% check
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    manager.start();
    vi.advanceTimersByTime(5000);

    expect(manager.getActiveConversationCount()).toBe(0);
  });

  it('does not start conversations when player is too far from NPCs', () => {
    manager.setPlayerMesh(makeMockMesh(new Vector3(50, 0, 0))); // far away
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle');
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(2, 0, 0)), 'idle');

    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    manager.start();
    vi.advanceTimersByTime(5000);

    expect(manager.getActiveConversationCount()).toBe(0);
  });

  it('starts conversation when player is within 8m of both NPCs', () => {
    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle');
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle');

    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    manager.start();
    vi.advanceTimersByTime(5000);

    expect(manager.getActiveConversationCount()).toBe(1);
  });

  it('does not start if only one NPC is within player proximity', () => {
    manager.setPlayerMesh(makeMockMesh(new Vector3(0, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(3, 0, 0)), 'idle');    // within 8m
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(20, 0, 0)), 'idle');    // outside 8m of player
    // NPCs are also > 8m apart, so they wouldn't pair anyway, but the proximity gate filters first

    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    manager.start();
    vi.advanceTimersByTime(5000);

    expect(manager.getActiveConversationCount()).toBe(0);
  });

  // ── Audio lock integration ──

  it('does not start conversation when audio lock is held', () => {
    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle');
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle');

    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    // Another system holds the lock
    lock.acquire('greeting-npc1');

    manager.start();
    vi.advanceTimersByTime(5000);

    expect(manager.getActiveConversationCount()).toBe(0);
  });

  it('acquires audio lock with owner "ambient" when starting conversation', () => {
    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle');
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle');

    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    manager.start();
    vi.advanceTimersByTime(5000);

    expect(manager.getActiveConversationCount()).toBe(1);
    expect(lock.isLocked()).toBe(true);
    expect(lock.currentOwner).toBe('ambient');
  });

  it('releases audio lock when conversation ends', () => {
    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle');
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle');

    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    manager.start();
    vi.advanceTimersByTime(5000);

    expect(lock.isLocked()).toBe(true);

    // Advance past conversation duration (20s default) plus a tick for expiry check
    vi.advanceTimersByTime(25000);

    expect(manager.getActiveConversationCount()).toBe(0);
    expect(lock.isLocked()).toBe(false);
  });

  // ── Max 1 simultaneous conversation ──

  it('limits to 1 simultaneous conversation', () => {
    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle');
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle');
    manager.registerNPC('c', 'Carol', makeMockMesh(new Vector3(1, 0, 0)), 'idle');
    manager.registerNPC('d', 'Dave', makeMockMesh(new Vector3(4, 0, 0)), 'idle');

    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    manager.start();
    vi.advanceTimersByTime(5000);

    // Only 1 conversation even though multiple pairs available
    expect(manager.getActiveConversationCount()).toBe(1);
  });

  // ── Check interval ──

  it('uses 5-second check interval', () => {
    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle');
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle');

    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    manager.start();

    // After 4 seconds — no tick yet
    vi.advanceTimersByTime(4000);
    expect(manager.getActiveConversationCount()).toBe(0);

    // After 5 seconds — first tick
    vi.advanceTimersByTime(1000);
    expect(manager.getActiveConversationCount()).toBe(1);
  });

  // ── Animations preserved ──

  it('triggers talk/listen animations when conversation starts', () => {
    const animCb = vi.fn();
    manager.setAnimationCallback(animCb);
    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle');
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle');

    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    manager.start();
    vi.advanceTimersByTime(5000);

    // Should have set talk on speaker and idle on listener
    expect(animCb).toHaveBeenCalledWith(expect.any(String), 'talk');
    expect(animCb).toHaveBeenCalledWith(expect.any(String), 'idle');
  });

  // ── Lock released on stop ──

  it('releases audio lock when manager is stopped', () => {
    manager.setPlayerMesh(makeMockMesh(new Vector3(3, 0, 0)));
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle');
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle');

    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    manager.start();
    vi.advanceTimersByTime(5000);

    expect(lock.isLocked()).toBe(true);

    manager.stop();

    expect(lock.isLocked()).toBe(false);
    expect(manager.getActiveConversationCount()).toBe(0);
  });
});
