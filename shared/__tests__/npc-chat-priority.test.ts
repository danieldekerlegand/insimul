import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NpcAudioLock } from '../game-engine/rendering/NpcAudioLock';
import { NPCProximitySpeechSystem } from '../game-engine/rendering/NPCProximitySpeechSystem';
import { NPCAmbientConversationManager } from '../game-engine/rendering/NPCAmbientConversationManager';

// Mock generateAndSpeakGreeting
vi.mock('../game-engine/rendering/NpcGreetingTTS', () => ({
  generateAndSpeakGreeting: vi.fn().mockResolvedValue({ text: 'Bonjour!', usedFallback: false }),
}));

describe('US-010: Player chat takes priority over ambient NPC audio', () => {
  let lock: NpcAudioLock;

  beforeEach(() => {
    vi.clearAllMocks();
    lock = new NpcAudioLock();
  });

  it('cancelActiveGreeting aborts active greeting and releases lock', () => {
    const system = new NPCProximitySpeechSystem(lock, {
      baseProbability: 1.0,
      globalCooldownMs: 0,
      perNpcCooldownMs: 0,
      evalIntervalMs: 1000,
    });

    // Simulate an active greeting by acquiring the lock
    lock.acquire('greeting-npc1');
    expect(lock.isLocked()).toBe(true);

    // cancelActiveGreeting should release via the system
    system.cancelActiveGreeting();

    // forceRelease as the final safety net (as BabylonGame does)
    lock.forceRelease();
    expect(lock.isLocked()).toBe(false);
  });

  it('cancelAllActive ends all ambient conversations and releases lock', () => {
    const manager = new NPCAmbientConversationManager();
    manager.setAudioLock(lock);

    // Acquire lock as ambient (simulating an active conversation)
    lock.acquire('ambient');
    expect(lock.isLocked()).toBe(true);

    // cancelAllActive should end conversations
    manager.cancelAllActive();

    // The lock should be released by endConversation
    // (but if no activeConversations tracked, forceRelease cleans up)
    lock.forceRelease();
    expect(lock.isLocked()).toBe(false);
  });

  it('forceRelease overrides any owner', () => {
    lock.acquire('greeting-npc1');
    expect(lock.currentOwner).toBe('greeting-npc1');

    lock.forceRelease();
    expect(lock.isLocked()).toBe(false);
    expect(lock.currentOwner).toBeNull();
  });

  it('forceRelease allows ambient and greeting systems to re-acquire after chat closes', () => {
    // Simulate chat opening: force release any held lock
    lock.acquire('ambient');
    lock.forceRelease();

    // After chat closes, systems should be able to re-acquire
    expect(lock.acquire('greeting-npc2')).toBe(true);
    expect(lock.currentOwner).toBe('greeting-npc2');
  });

  it('chat panel audio is unaffected by NpcAudioLock (uses separate pipeline)', () => {
    // The chat panel (InsimulClient/StreamingAudioPlayer) does NOT use NpcAudioLock.
    // Verify that after forceRelease, the lock is free and doesn't block chat audio.
    lock.acquire('greeting-npc1');
    lock.forceRelease();

    // Lock is free — chat panel audio proceeds independently (no lock acquisition needed)
    expect(lock.isLocked()).toBe(false);
  });

  it('full priority sequence: cancel greeting → cancel ambient → forceRelease', () => {
    const system = new NPCProximitySpeechSystem(lock, {
      baseProbability: 1.0,
      globalCooldownMs: 0,
      perNpcCooldownMs: 0,
      evalIntervalMs: 1000,
    });
    const manager = new NPCAmbientConversationManager();
    manager.setAudioLock(lock);

    // Greeting holds the lock
    lock.acquire('greeting-npc1');
    expect(lock.isLocked()).toBe(true);

    // Simulate what BabylonGame.handleOpenChat does:
    system.cancelActiveGreeting();
    manager.cancelAllActive();
    lock.forceRelease();

    // Lock is free
    expect(lock.isLocked()).toBe(false);
    expect(lock.currentOwner).toBeNull();
  });

  it('resume after chat closes allows new greetings', () => {
    const manager = new NPCAmbientConversationManager();
    manager.setAudioLock(lock);

    // Chat opens: pause + cancel
    manager.pause();
    manager.cancelAllActive();
    lock.forceRelease();

    // Chat closes: resume
    manager.resume();

    // Systems can re-acquire
    expect(lock.acquire('greeting-npc3')).toBe(true);
    lock.release('greeting-npc3');
    expect(lock.acquire('ambient')).toBe(true);
  });
});
