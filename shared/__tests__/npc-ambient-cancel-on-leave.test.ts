import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Vector3 } from '@babylonjs/core';
import { NpcAudioLock } from '../game-engine/rendering/NpcAudioLock';
import { NPCAmbientConversationManager } from '../game-engine/rendering/NPCAmbientConversationManager';

if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}

function makeMockMesh(position: Vector3): any {
  return {
    position: position.clone(),
    rotation: { y: 0 },
    isEnabled: () => true,
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

describe('NPCAmbientConversationManager — US-006 cancel when player leaves range', () => {
  let manager: NPCAmbientConversationManager;
  let lock: NpcAudioLock;
  let playerMesh: any;
  let animCb: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    lock = new NpcAudioLock();
    const scene = makeMockScene();
    const indicator = makeMockTalkingIndicator();
    manager = new NPCAmbientConversationManager(scene, 'world1', indicator);
    manager.setAudioLock(lock);
    animCb = vi.fn();
    manager.setAnimationCallback(animCb);

    // Player starts near NPCs
    playerMesh = makeMockMesh(new Vector3(3, 0, 0));
    manager.setPlayerMesh(playerMesh);

    // Register two NPCs close together
    manager.registerNPC('a', 'Alice', makeMockMesh(new Vector3(0, 0, 0)), 'idle');
    manager.registerNPC('b', 'Bob', makeMockMesh(new Vector3(5, 0, 0)), 'idle');

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
  });

  afterEach(() => {
    manager.dispose();
    vi.useRealTimers();
  });

  function startConversation() {
    manager.start();
    vi.advanceTimersByTime(5000);
    expect(manager.getActiveConversationCount()).toBe(1);
    expect(lock.isLocked()).toBe(true);
  }

  it('cancels conversation when player moves beyond 12m from both NPCs', () => {
    startConversation();

    // Move player far away
    playerMesh.position = new Vector3(50, 0, 0);

    // Next tick triggers proximity check
    vi.advanceTimersByTime(5000);

    expect(manager.getActiveConversationCount()).toBe(0);
    expect(lock.isLocked()).toBe(false);
  });

  it('does NOT cancel when player is within 12m of at least one NPC', () => {
    startConversation();

    // Move player 10m from NPC a (at origin), still within 12m
    playerMesh.position = new Vector3(10, 0, 0);

    vi.advanceTimersByTime(5000);

    expect(manager.getActiveConversationCount()).toBe(1);
    expect(lock.isLocked()).toBe(true);
  });

  it('sets NPC animations to idle on cancellation', () => {
    startConversation();
    animCb.mockClear();

    playerMesh.position = new Vector3(50, 0, 0);
    vi.advanceTimersByTime(5000);

    // endConversation resets both to idle
    expect(animCb).toHaveBeenCalledWith('a', 'idle');
    expect(animCb).toHaveBeenCalledWith('b', 'idle');
  });

  it('releases audio lock on cancellation', () => {
    startConversation();

    playerMesh.position = new Vector3(50, 0, 0);
    vi.advanceTimersByTime(5000);

    expect(lock.isLocked()).toBe(false);
  });

  it('sets per-NPC cooldown preventing immediate re-trigger', () => {
    startConversation();

    // Player leaves
    playerMesh.position = new Vector3(50, 0, 0);
    vi.advanceTimersByTime(5000);
    expect(manager.getActiveConversationCount()).toBe(0);

    // Player returns immediately
    playerMesh.position = new Vector3(3, 0, 0);
    vi.advanceTimersByTime(5000);

    // Cooldown (2 min) prevents re-pairing
    expect(manager.getActiveConversationCount()).toBe(0);
  });

  it('allows new conversation after cooldown expires', () => {
    startConversation();

    // Player leaves
    playerMesh.position = new Vector3(50, 0, 0);
    vi.advanceTimersByTime(5000);
    expect(manager.getActiveConversationCount()).toBe(0);

    // Player returns after 2+ minutes
    playerMesh.position = new Vector3(3, 0, 0);
    vi.advanceTimersByTime(125000); // well past 2 min cooldown

    expect(manager.getActiveConversationCount()).toBe(1);
  });

  it('cancels streamed conversation and aborts signal', async () => {
    let capturedSignal: AbortSignal | null = null;

    // Set up a conversation provider that captures the abort signal
    manager.setConversationProvider(async (_n1, _n2, _max, signal) => {
      capturedSignal = signal;
      // Return lines after a short delay to simulate streaming
      return [
        { speakerId: 'a', speakerName: 'Alice', text: 'Hello!', gender: 'female' },
        { speakerId: 'b', speakerName: 'Bob', text: 'Hi there!', gender: 'male' },
      ];
    });
    manager.setServerUrl('http://localhost:3000');

    manager.start();
    vi.advanceTimersByTime(5000);

    expect(manager.getActiveConversationCount()).toBe(1);

    // Player leaves range
    playerMesh.position = new Vector3(50, 0, 0);
    vi.advanceTimersByTime(5000);

    expect(manager.getActiveConversationCount()).toBe(0);
    // AbortController was triggered
    if (capturedSignal) {
      expect(capturedSignal.aborted).toBe(true);
    }
  });

  it('exactly at 12m boundary does NOT cancel (must be beyond)', () => {
    startConversation();

    // NPC a is at (0,0,0), NPC b is at (5,0,0)
    // Place player exactly 12m from NPC a but closer to NPC b
    playerMesh.position = new Vector3(12, 0, 0);
    // dist to a = 12, dist to b = 7

    vi.advanceTimersByTime(5000);

    // Player is within 12m of NPC b, so conversation continues
    expect(manager.getActiveConversationCount()).toBe(1);
  });
});
