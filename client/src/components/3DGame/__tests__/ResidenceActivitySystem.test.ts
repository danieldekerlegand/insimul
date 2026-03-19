import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ResidenceActivitySystem,
  applyPersonalityDuration,
  getResidenceProfile,
  type ResidenceActivityCallbacks,
  type ResidencePersonality,
} from '../ResidenceActivitySystem';

// ---------- Helpers ----------

const DEFAULT_PERSONALITY: ResidencePersonality = {
  openness: 0.5,
  conscientiousness: 0.5,
  extroversion: 0.5,
  neuroticism: 0.5,
};

const MS_PER_GAME_HOUR = 60_000; // 1 real minute = 1 game hour

function makeCallbacks(): ResidenceActivityCallbacks & Record<string, any> {
  return {
    onAnimationChange: vi.fn(),
    onOccasionStart: vi.fn(),
    onOccasionEnd: vi.fn(),
  };
}

// ---------- Tests ----------

describe('ResidenceActivitySystem', () => {
  let system: ResidenceActivitySystem;
  let callbacks: ReturnType<typeof makeCallbacks>;

  beforeEach(() => {
    callbacks = makeCallbacks();
    system = new ResidenceActivitySystem(callbacks);
  });

  describe('startOccasion / endOccasion', () => {
    it('registers an NPC and fires onAnimationChange + onOccasionStart', () => {
      system.startOccasion('npc-1', 'sleeping', DEFAULT_PERSONALITY);

      expect(system.isAtHome('npc-1')).toBe(true);
      expect(callbacks.onAnimationChange).toHaveBeenCalledWith('npc-1', 'sleep');
      expect(callbacks.onOccasionStart).toHaveBeenCalledWith('npc-1', 'sleeping');
    });

    it('endOccasion removes NPC and fires onOccasionEnd', () => {
      system.startOccasion('npc-1', 'eating', DEFAULT_PERSONALITY);
      system.endOccasion('npc-1');

      expect(system.isAtHome('npc-1')).toBe(false);
      expect(callbacks.onOccasionEnd).toHaveBeenCalledWith('npc-1', 'eating');
    });

    it('endOccasion is safe for unregistered NPC', () => {
      expect(() => system.endOccasion('npc-unknown')).not.toThrow();
    });
  });

  describe('occasion profiles', () => {
    it('sleeping starts with sleep animation', () => {
      system.startOccasion('npc-1', 'sleeping');
      expect(callbacks.onAnimationChange).toHaveBeenCalledWith('npc-1', 'sleep');
    });

    it('eating starts with sit animation', () => {
      system.startOccasion('npc-1', 'eating');
      expect(callbacks.onAnimationChange).toHaveBeenCalledWith('npc-1', 'sit');
    });

    it('relaxing starts with sit animation', () => {
      system.startOccasion('npc-1', 'relaxing');
      expect(callbacks.onAnimationChange).toHaveBeenCalledWith('npc-1', 'sit');
    });
  });

  describe('query methods', () => {
    it('getResidenceState returns current state', () => {
      system.startOccasion('npc-1', 'relaxing', DEFAULT_PERSONALITY);
      const state = system.getResidenceState('npc-1');

      expect(state).toBeDefined();
      expect(state!.occasion).toBe('relaxing');
      expect(state!.npcId).toBe('npc-1');
    });

    it('getActivityDescription returns label', () => {
      system.startOccasion('npc-1', 'sleeping');
      const desc = system.getActivityDescription('npc-1');
      expect(desc).toBe('sleeping soundly');
    });

    it('getCurrentOccasion returns the occasion string', () => {
      system.startOccasion('npc-1', 'eating');
      expect(system.getCurrentOccasion('npc-1')).toBe('eating');
    });

    it('getCurrentOccasion returns null for unregistered NPC', () => {
      expect(system.getCurrentOccasion('npc-unknown')).toBeNull();
    });

    it('getActiveResidents returns all tracked NPC IDs', () => {
      system.startOccasion('npc-1', 'sleeping');
      system.startOccasion('npc-2', 'eating');
      expect(system.getActiveResidents().sort()).toEqual(['npc-1', 'npc-2']);
    });
  });

  describe('update and activity transitions', () => {
    it('transitions to next activity when duration expires', () => {
      system.startOccasion('npc-1', 'eating', DEFAULT_PERSONALITY);
      callbacks.onAnimationChange.mockClear();

      // Advance enough game time to expire even the longest possible eating activity
      // Max eating duration with personality modifier 1.5x: 10 * 1.5 = 15 min
      // 15 game-minutes = 15/60 * MS_PER_GAME_HOUR = 15000ms
      system.update(20_000, MS_PER_GAME_HOUR);

      // Should have transitioned to the next activity (eat)
      expect(callbacks.onAnimationChange).toHaveBeenCalled();
    });

    it('does not transition before duration expires', () => {
      system.startOccasion('npc-1', 'sleeping', DEFAULT_PERSONALITY);
      callbacks.onAnimationChange.mockClear();

      // Advance only 1 game-minute (sleeping lasts 60-120 min base)
      system.update(1_000, MS_PER_GAME_HOUR);

      expect(callbacks.onAnimationChange).not.toHaveBeenCalled();
    });

    it('cycles through activities in order', () => {
      system.startOccasion('npc-1', 'eating', DEFAULT_PERSONALITY);
      const animations: string[] = [];
      callbacks.onAnimationChange.mockImplementation((_id: string, anim: string) => {
        animations.push(anim);
      });

      // Eating profile: sit(5-10) → eat(15-40) → sit(5-15) → sit(5-10) → ...
      // Force enough time to cycle through all three
      for (let i = 0; i < 10; i++) {
        system.update(60_000, MS_PER_GAME_HOUR); // +60 game minutes each
      }

      // Should have seen multiple transitions
      expect(animations.length).toBeGreaterThanOrEqual(3);
      // Should contain 'eat' at some point (second activity in eating profile)
      expect(animations).toContain('eat');
    });
  });

  describe('dispose', () => {
    it('clears all state', () => {
      system.startOccasion('npc-1', 'sleeping');
      system.startOccasion('npc-2', 'eating');
      system.dispose();

      expect(system.isAtHome('npc-1')).toBe(false);
      expect(system.isAtHome('npc-2')).toBe(false);
      expect(system.getActiveResidents()).toEqual([]);
    });
  });
});

describe('applyPersonalityDuration', () => {
  it('returns base duration for neutral personality', () => {
    const result = applyPersonalityDuration(60, 'sleeping', DEFAULT_PERSONALITY);
    expect(result).toBe(60);
  });

  it('high neuroticism increases sleeping duration', () => {
    const neurotic: ResidencePersonality = { ...DEFAULT_PERSONALITY, neuroticism: 1.0 };
    const result = applyPersonalityDuration(60, 'sleeping', neurotic);
    expect(result).toBeGreaterThan(60);
  });

  it('high conscientiousness decreases eating duration', () => {
    const conscientious: ResidencePersonality = { ...DEFAULT_PERSONALITY, conscientiousness: 1.0 };
    const result = applyPersonalityDuration(60, 'eating', conscientious);
    expect(result).toBeLessThan(60);
  });

  it('high extroversion decreases relaxing duration', () => {
    const extrovert: ResidencePersonality = { ...DEFAULT_PERSONALITY, extroversion: 1.0 };
    const result = applyPersonalityDuration(60, 'relaxing', extrovert);
    expect(result).toBeLessThan(60);
  });

  it('clamps modifier to [0.5, 1.5] range', () => {
    const extreme: ResidencePersonality = {
      openness: 1.0,
      conscientiousness: 0.0,
      extroversion: 0.0,
      neuroticism: 1.0,
    };
    const result = applyPersonalityDuration(100, 'sleeping', extreme);
    // Max modifier is 1.5 → 150
    expect(result).toBeLessThanOrEqual(150);
    expect(result).toBeGreaterThanOrEqual(50);
  });

  it('returns base duration for unknown occasion', () => {
    const result = applyPersonalityDuration(60, 'unknown', DEFAULT_PERSONALITY);
    expect(result).toBe(60);
  });
});

describe('getResidenceProfile', () => {
  it('returns sleeping profile', () => {
    const profile = getResidenceProfile('sleeping');
    expect(profile.activities.length).toBeGreaterThan(0);
    expect(profile.activities[0].animation).toBe('sleep');
  });

  it('returns eating profile', () => {
    const profile = getResidenceProfile('eating');
    expect(profile.activities.length).toBe(3);
    expect(profile.activities[1].animation).toBe('eat');
  });

  it('returns relaxing profile for unknown occasion', () => {
    const profile = getResidenceProfile('dancing');
    expect(profile.activities[0].animation).toBe('sit');
  });
});
