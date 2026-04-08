import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Vector3 } from '@babylonjs/core';
import { NpcAudioLock } from '../game-engine/rendering/NpcAudioLock';
import { NPCProximitySpeechSystem } from '../game-engine/rendering/NPCProximitySpeechSystem';
import type { ProximityNPC } from '../game-engine/rendering/NPCProximitySpeechSystem';

// Mock generateAndSpeakGreeting
vi.mock('../game-engine/rendering/NpcGreetingTTS', () => ({
  generateAndSpeakGreeting: vi.fn().mockResolvedValue({ text: 'Bonjour!', usedFallback: false }),
}));

import { generateAndSpeakGreeting } from '../game-engine/rendering/NpcGreetingTTS';
const mockGreeting = vi.mocked(generateAndSpeakGreeting);

function makeMockMesh(position: Vector3): any {
  return { position };
}

function makeNPC(id: string, overrides?: Partial<ProximityNPC>): ProximityNPC {
  return {
    id,
    name: `NPC ${id}`,
    mesh: makeMockMesh(new Vector3(0, 0, 0)),
    personality: {
      openness: 0.5,
      conscientiousness: 0.5,
      extroversion: 0.8,
      agreeableness: 0.5,
      neuroticism: 0.2,
    },
    ...overrides,
  };
}

describe('NPCProximitySpeechSystem', () => {
  let lock: NpcAudioLock;
  let system: NPCProximitySpeechSystem;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    lock = new NpcAudioLock();
    system = new NPCProximitySpeechSystem(lock, {
      baseProbability: 1.0, // deterministic for tests
      globalCooldownMs: 0,
      perNpcCooldownMs: 0,
      evalIntervalMs: 1000,
    });
    // Player at origin
    system.setPlayerMesh(makeMockMesh(new Vector3(0, 0, 0)));
  });

  it('does not evaluate before the interval elapses', () => {
    const npc = makeNPC('a');
    system.registerNPC(npc);
    system.update(500); // 500ms, below 1000ms threshold
    expect(mockGreeting).not.toHaveBeenCalled();
  });

  it('evaluates and triggers greeting when interval elapses', () => {
    const npc = makeNPC('a', { mesh: makeMockMesh(new Vector3(3, 0, 0)) });
    system.registerNPC(npc);
    system.update(1000);
    expect(mockGreeting).toHaveBeenCalledTimes(1);
    expect(mockGreeting).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a', name: 'NPC a' }),
      expect.objectContaining({ targetLanguage: 'French' }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('does not trigger for NPCs outside greeting radius (8m)', () => {
    const npc = makeNPC('far', { mesh: makeMockMesh(new Vector3(20, 0, 0)) });
    system.registerNPC(npc);
    system.update(1000);
    expect(mockGreeting).not.toHaveBeenCalled();
  });

  it('skips if player is in conversation', () => {
    const npc = makeNPC('a');
    system.registerNPC(npc);
    system.setPlayerConversationCheck(() => true);
    system.update(1000);
    expect(mockGreeting).not.toHaveBeenCalled();
  });

  it('skips if audio lock is already held', () => {
    lock.acquire('ambient');
    const npc = makeNPC('a');
    system.registerNPC(npc);
    system.update(1000);
    expect(mockGreeting).not.toHaveBeenCalled();
  });

  it('acquires audio lock before greeting and releases after', async () => {
    const npc = makeNPC('a');
    system.registerNPC(npc);
    system.update(1000);
    // Lock should be acquired
    expect(lock.isLocked()).toBe(true);
    expect(lock.currentOwner).toBe('greeting-a');
    // Wait for the async greeting to finish
    await vi.waitFor(() => {
      expect(lock.isLocked()).toBe(false);
    });
  });

  it('only triggers one greeting per evaluation tick', () => {
    const npc1 = makeNPC('a', { mesh: makeMockMesh(new Vector3(1, 0, 0)) });
    const npc2 = makeNPC('b', { mesh: makeMockMesh(new Vector3(2, 0, 0)) });
    system.registerNPC(npc1);
    system.registerNPC(npc2);
    system.update(1000);
    expect(mockGreeting).toHaveBeenCalledTimes(1);
  });

  it('respects per-NPC cooldown', async () => {
    const system2 = new NPCProximitySpeechSystem(lock, {
      baseProbability: 1.0,
      globalCooldownMs: 0,
      perNpcCooldownMs: 60_000,
      evalIntervalMs: 1000,
    });
    system2.setPlayerMesh(makeMockMesh(new Vector3(0, 0, 0)));

    const npc = makeNPC('a');
    system2.registerNPC(npc);

    system2.update(1000);
    expect(mockGreeting).toHaveBeenCalledTimes(1);

    // Wait for greeting to complete so lock releases
    await vi.waitFor(() => expect(lock.isLocked()).toBe(false));

    // Second evaluation should be blocked by per-NPC cooldown
    system2.update(1000);
    expect(mockGreeting).toHaveBeenCalledTimes(1);
  });

  it('respects global cooldown', async () => {
    const system2 = new NPCProximitySpeechSystem(lock, {
      baseProbability: 1.0,
      globalCooldownMs: 60_000,
      perNpcCooldownMs: 0,
      evalIntervalMs: 1000,
    });
    system2.setPlayerMesh(makeMockMesh(new Vector3(0, 0, 0)));

    const npc1 = makeNPC('a');
    const npc2 = makeNPC('b', { mesh: makeMockMesh(new Vector3(2, 0, 0)) });
    system2.registerNPC(npc1);
    system2.registerNPC(npc2);

    system2.update(1000);
    expect(mockGreeting).toHaveBeenCalledTimes(1);

    // Wait for lock release
    await vi.waitFor(() => expect(lock.isLocked()).toBe(false));

    // Second NPC should be blocked by global cooldown
    system2.update(1000);
    expect(mockGreeting).toHaveBeenCalledTimes(1);
  });

  it('personality-driven probability: low extroversion reduces chance', () => {
    // Use a system with low base probability to make the personality effect testable
    const system2 = new NPCProximitySpeechSystem(lock, {
      baseProbability: 0.1,
      globalCooldownMs: 0,
      perNpcCooldownMs: 0,
      evalIntervalMs: 1000,
    });
    system2.setPlayerMesh(makeMockMesh(new Vector3(0, 0, 0)));

    // Very introverted NPC
    const npc = makeNPC('shy', {
      personality: {
        openness: 0.5,
        conscientiousness: 0.5,
        extroversion: 0.0, // very low
        agreeableness: 0.5,
        neuroticism: 0.0,
      },
    });

    // Calculate expected probability: 0.1 * (0.5 + 0 * 0.5) * (1 - 0 * 0.3) = 0.05
    // With Math.random() mocked to return 0.06, the greeting should NOT fire
    vi.spyOn(Math, 'random').mockReturnValue(0.06);
    system2.registerNPC(npc);
    system2.update(1000);
    expect(mockGreeting).not.toHaveBeenCalled();
  });

  it('quest-bearing NPC gets +25% probability bonus', () => {
    const system2 = new NPCProximitySpeechSystem(lock, {
      baseProbability: 0.1,
      globalCooldownMs: 0,
      perNpcCooldownMs: 0,
      evalIntervalMs: 1000,
    });
    system2.setPlayerMesh(makeMockMesh(new Vector3(0, 0, 0)));
    system2.setQuestBearerCheck((id) => id === 'quest-npc');

    const npc = makeNPC('quest-npc', {
      personality: {
        openness: 0.5,
        conscientiousness: 0.5,
        extroversion: 1.0,
        agreeableness: 0.5,
        neuroticism: 0.0,
      },
    });

    // Base: 0.1 * (0.5 + 1.0 * 0.5) * (1 - 0 * 0.3) = 0.1
    // With quest bonus: 0.1 * 1.25 = 0.125
    // random returns 0.11 → should fire (0.11 < 0.125)
    vi.spyOn(Math, 'random').mockReturnValue(0.11);
    system2.registerNPC(npc);
    system2.update(1000);
    expect(mockGreeting).toHaveBeenCalledTimes(1);
  });

  it('cancelActiveGreeting aborts and releases lock', () => {
    // Use a greeting that hangs indefinitely so the lock stays held
    mockGreeting.mockImplementationOnce(() => new Promise(() => {})); // never resolves
    const npc = makeNPC('a');
    system.registerNPC(npc);
    system.update(1000);
    expect(lock.isLocked()).toBe(true);

    system.cancelActiveGreeting();
    expect(lock.isLocked()).toBe(false);
  });

  it('unregisterNPC removes NPC and clears cooldowns', async () => {
    const npc = makeNPC('a');
    system.registerNPC(npc);
    system.update(1000);
    await vi.waitFor(() => expect(lock.isLocked()).toBe(false));

    system.unregisterNPC('a');
    // Triggering again should do nothing — NPC is gone
    mockGreeting.mockClear();
    system.update(1000);
    expect(mockGreeting).not.toHaveBeenCalled();
  });

  it('does not trigger without player mesh', () => {
    const system2 = new NPCProximitySpeechSystem(lock, {
      baseProbability: 1.0,
      globalCooldownMs: 0,
      perNpcCooldownMs: 0,
      evalIntervalMs: 1000,
    });
    // No player mesh set
    const npc = makeNPC('a');
    system2.registerNPC(npc);
    system2.update(1000);
    expect(mockGreeting).not.toHaveBeenCalled();
  });

  it('getRecentGreeting returns null when no greeting has occurred', () => {
    expect(system.getRecentGreeting('a')).toBeNull();
  });

  it('getRecentGreeting returns greeting data after a greeting fires', async () => {
    const npc = makeNPC('a');
    system.registerNPC(npc);
    system.update(1000);
    await vi.waitFor(() => expect(lock.isLocked()).toBe(false));

    const recent = system.getRecentGreeting('a');
    expect(recent).not.toBeNull();
    expect(recent!.text).toBe('Bonjour!');
    expect(recent!.timestamp).toBeGreaterThan(0);
  });

  it('getRecentGreeting returns null when greeting is older than withinMs', async () => {
    const npc = makeNPC('a');
    system.registerNPC(npc);
    system.update(1000);
    await vi.waitFor(() => expect(lock.isLocked()).toBe(false));

    // Request with 0ms window — should be expired
    expect(system.getRecentGreeting('a', 0)).toBeNull();
  });

  it('dispose cleans up all state', () => {
    const npc = makeNPC('a');
    system.registerNPC(npc);
    system.update(1000);

    system.dispose();
    mockGreeting.mockClear();

    // Set up fresh player mesh and try to evaluate — should do nothing
    system.setPlayerMesh(makeMockMesh(new Vector3(0, 0, 0)));
    system.update(1000);
    expect(mockGreeting).not.toHaveBeenCalled();
  });
});
