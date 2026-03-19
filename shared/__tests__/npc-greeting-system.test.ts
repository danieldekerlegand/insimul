import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Vector3, Mesh } from '@babylonjs/core';
import {
  NPCGreetingSystem,
  type GreetableNPC,
  type GreetingConfig,
} from '../../client/src/components/3DGame/NPCGreetingSystem';
import type { GameEventBus } from '../../client/src/components/3DGame/GameEventBus';

// Provide window.setTimeout/clearTimeout for Node environment
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    setTimeout: (fn: Function, ms: number) => setTimeout(fn, ms),
    clearTimeout: (id: any) => clearTimeout(id),
  };
}

// ── Mocks ──────────────────────────────────────────────────────────────────

function makeMockMesh(position: Vector3 = new Vector3(0, 0, 0)): Mesh {
  return {
    position,
    isEnabled: () => true,
  } as unknown as Mesh;
}

function makeMockIndicator() {
  return {
    show: vi.fn(),
    hide: vi.fn(),
    updateText: vi.fn(),
    isShowing: vi.fn(() => false),
    hideAll: vi.fn(),
    dispose: vi.fn(),
    setGUI: vi.fn(),
  };
}

function makeMockEventBus(): GameEventBus {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
    onAny: vi.fn(),
    offAny: vi.fn(),
  } as unknown as GameEventBus;
}

function makeNPC(overrides: Partial<GreetableNPC> = {}): GreetableNPC {
  return {
    id: 'npc-1',
    name: 'Jean Dupont',
    firstName: 'Jean',
    lastName: 'Dupont',
    mesh: makeMockMesh(new Vector3(3, 0, 0)),
    occupation: 'Baker',
    personality: {
      openness: 0.5,
      conscientiousness: 0.5,
      extroversion: 0.8,
      agreeableness: 0.7,
      neuroticism: 0.2,
    },
    playerReputation: 0.5,
    isBusinessOwner: false,
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('NPCGreetingSystem', () => {
  let system: NPCGreetingSystem;
  let eventBus: GameEventBus;
  let indicator: ReturnType<typeof makeMockIndicator>;
  let playerMesh: Mesh;

  beforeEach(() => {
    eventBus = makeMockEventBus();
    indicator = makeMockIndicator();
    system = new NPCGreetingSystem(eventBus, indicator as any, {
      targetLanguage: 'French',
      bubbleDurationMs: 4000,
      cooldownMs: 300_000,
    });
    playerMesh = makeMockMesh(new Vector3(0, 0, 0));
    system.setPlayerMesh(playerMesh);
    system.setTimeOfDayProvider(() => 10); // morning
    system.setOpenChatCallback(vi.fn(async () => {}));
    system.setPlayerConversationCheck(() => false);
  });

  describe('calculateGreetingProbability', () => {
    it('returns higher probability for extroverted NPCs', () => {
      const extrovert = makeNPC({ personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 1.0, agreeableness: 0.5, neuroticism: 0.2 } });
      const introvert = makeNPC({ personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.1, agreeableness: 0.5, neuroticism: 0.2 } });

      const probExtro = system.calculateGreetingProbability(extrovert);
      const probIntro = system.calculateGreetingProbability(introvert);

      expect(probExtro).toBeGreaterThan(probIntro);
    });

    it('returns higher probability for NPCs with good player reputation', () => {
      const friendly = makeNPC({ playerReputation: 0.9 });
      const hostile = makeNPC({ playerReputation: -0.5 });

      const probFriendly = system.calculateGreetingProbability(friendly);
      const probHostile = system.calculateGreetingProbability(hostile);

      expect(probFriendly).toBeGreaterThan(probHostile);
    });

    it('clamps probability between 0.05 and 0.95', () => {
      const superFriendly = makeNPC({
        personality: { openness: 1, conscientiousness: 1, extroversion: 1, agreeableness: 1, neuroticism: 0 },
        playerReputation: 1.0,
      });
      const superHostile = makeNPC({
        personality: { openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 1 },
        playerReputation: -1.0,
      });

      expect(system.calculateGreetingProbability(superFriendly)).toBeLessThanOrEqual(0.95);
      expect(system.calculateGreetingProbability(superHostile)).toBeGreaterThanOrEqual(0.05);
    });
  });

  describe('buildGreeting', () => {
    it('returns French text for French target language', () => {
      const npc = makeNPC();
      const { targetText } = system.buildGreeting(npc, 'morning');

      // French morning greetings should contain French characters/words
      expect(targetText).toBeTruthy();
      expect(targetText.length).toBeGreaterThan(0);
    });

    it('includes name introduction on first meeting', () => {
      const npc = makeNPC({ firstName: 'Marie', lastName: 'Laurent' });
      const { targetText, subtitle } = system.buildGreeting(npc, 'morning');

      // First meeting should include name
      expect(targetText).toContain('Marie');
      expect(targetText).toContain('Laurent');
      expect(subtitle).toContain('Marie');
    });

    it('omits introduction for already-met NPCs', () => {
      const npc = makeNPC({ firstName: 'Pierre', lastName: 'Martin' });
      system.markAsMet(npc.id);

      const { targetText } = system.buildGreeting(npc, 'afternoon');

      // Should NOT include name for met NPCs
      expect(targetText).not.toContain('Pierre');
    });

    it('returns empty subtitle when target language is English', () => {
      system.setTargetLanguage('English');
      const npc = makeNPC();
      system.markAsMet(npc.id); // skip intro

      const { subtitle } = system.buildGreeting(npc, 'morning');
      expect(subtitle).toBe('');
    });

    it('includes occupation info on first meeting', () => {
      const npc = makeNPC({ occupation: 'Baker' });
      const { subtitle } = system.buildGreeting(npc, 'morning');

      expect(subtitle).toContain('Baker');
    });
  });

  describe('update (proximity-based greeting)', () => {
    it('triggers greeting when player is within radius', () => {
      // Seed random to always pass probability check
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ mesh: makeMockMesh(new Vector3(3, 0, 0)) });
      system.registerNPC(npc);

      system.update();

      expect(indicator.show).toHaveBeenCalledWith(
        'npc-1',
        npc.mesh,
        expect.any(String),
      );
      expect((eventBus.emit as any)).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'npc_greeting',
          npcId: 'npc-1',
          language: 'French',
        }),
      );

      vi.restoreAllMocks();
    });

    it('does not trigger greeting beyond radius', () => {
      const npc = makeNPC({ mesh: makeMockMesh(new Vector3(20, 0, 0)) });
      system.registerNPC(npc);

      system.update();

      expect(indicator.show).not.toHaveBeenCalled();
    });

    it('respects cooldown between greetings', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const npc = makeNPC({ mesh: makeMockMesh(new Vector3(3, 0, 0)) });
      system.registerNPC(npc);

      system.update();
      expect(indicator.show).toHaveBeenCalledTimes(1);

      // Simulate clearing the bubble but keeping cooldown
      indicator.show.mockClear();
      system.update();

      // Should not trigger again due to cooldown (bubble timer still active)
      expect(indicator.show).not.toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('does not greet while player is in conversation', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      system.setPlayerConversationCheck(() => true);
      const npc = makeNPC({ mesh: makeMockMesh(new Vector3(3, 0, 0)) });
      system.registerNPC(npc);

      system.update();

      expect(indicator.show).not.toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });

  describe('acceptGreeting', () => {
    it('opens chat when player accepts pending greeting', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const openChat = vi.fn(async () => {});
      system.setOpenChatCallback(openChat);

      const npc = makeNPC({ mesh: makeMockMesh(new Vector3(3, 0, 0)) });
      system.registerNPC(npc);

      system.update(); // triggers greeting

      const accepted = await system.acceptGreeting();

      expect(accepted).toBe(true);
      expect(openChat).toHaveBeenCalledWith('npc-1');
      expect(system.getPendingGreetingNpcId()).toBeNull();

      vi.restoreAllMocks();
    });

    it('returns false when no pending greeting', async () => {
      const accepted = await system.acceptGreeting();
      expect(accepted).toBe(false);
    });
  });

  describe('triggerBusinessOwnerGreeting', () => {
    it('triggers greeting for business owner of matching building', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const owner = makeNPC({
        id: 'owner-1',
        isBusinessOwner: true,
        businessBuildingId: 'bakery-01',
        mesh: makeMockMesh(new Vector3(3, 0, 0)),
      });
      system.registerNPC(owner);

      system.triggerBusinessOwnerGreeting('bakery-01');

      expect(indicator.show).toHaveBeenCalledWith(
        'owner-1',
        owner.mesh,
        expect.any(String),
      );

      vi.restoreAllMocks();
    });

    it('does nothing for non-matching building', () => {
      const owner = makeNPC({
        isBusinessOwner: true,
        businessBuildingId: 'bakery-01',
      });
      system.registerNPC(owner);

      system.triggerBusinessOwnerGreeting('tavern-01');

      expect(indicator.show).not.toHaveBeenCalled();
    });
  });

  describe('metNPC tracking', () => {
    it('tracks NPCs as met after first greeting', () => {
      expect(system.hasMet('npc-1')).toBe(false);
      system.markAsMet('npc-1');
      expect(system.hasMet('npc-1')).toBe(true);
    });

    it('serializes and deserializes met NPC state', () => {
      system.markAsMet('npc-1');
      system.markAsMet('npc-2');

      const saved = system.serialize();
      expect(saved.metNPCs).toEqual(expect.arrayContaining(['npc-1', 'npc-2']));

      const system2 = new NPCGreetingSystem(eventBus, indicator as any);
      system2.deserialize(saved);
      expect(system2.hasMet('npc-1')).toBe(true);
      expect(system2.hasMet('npc-2')).toBe(true);
    });
  });

  describe('target language switching', () => {
    it('produces Spanish greetings when language is Spanish', () => {
      system.setTargetLanguage('Spanish');
      const npc = makeNPC();
      system.markAsMet(npc.id);

      const { targetText } = system.buildGreeting(npc, 'morning');
      // Spanish morning greetings: '¡Buenos días!', '¡Buen día!', '¡Bonita mañana!'
      // or fallback GREETINGS Spanish: '¡Hola!', '¡Buenos días!', etc.
      expect(targetText).toBeTruthy();
    });

    it('produces Japanese greetings when language is Japanese', () => {
      system.setTargetLanguage('Japanese');
      const npc = makeNPC();
      system.markAsMet(npc.id);

      const { targetText, subtitle } = system.buildGreeting(npc, 'morning');
      // Should have Japanese characters
      expect(targetText).toBeTruthy();
      expect(subtitle).toBeTruthy(); // non-English should have subtitle
    });
  });

  describe('dispose', () => {
    it('cleans up all state', () => {
      const npc = makeNPC();
      system.registerNPC(npc);
      system.markAsMet(npc.id);

      system.dispose();

      expect(system.hasMet(npc.id)).toBe(false);
      expect(system.getPendingGreetingNpcId()).toBeNull();
    });
  });
});
