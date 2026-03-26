import { describe, it, expect } from 'vitest';
import {
  ANIMATION_CATALOG,
  ALL_MODEL_IDS,
  getAvailableAnimations,
  getModelsWithAnimation,
  getAnimationsByCategory,
  getAnimationSummary,
  type AnimationCategory,
} from '../game-engine/animation-registry';

describe('ANIMATION_CATALOG', () => {
  it('contains all 109 unique animations from Quaternius models', () => {
    expect(Object.keys(ANIMATION_CATALOG).length).toBe(109);
  });

  it('every entry has required fields', () => {
    for (const [key, entry] of Object.entries(ANIMATION_CATALOG)) {
      expect(entry.name).toBe(key);
      expect(typeof entry.description).toBe('string');
      expect(entry.description.length).toBeGreaterThan(0);
      expect(typeof entry.duration).toBe('number');
      expect(typeof entry.loop).toBe('boolean');
      expect(typeof entry.category).toBe('string');
    }
  });

  it('all categories are valid', () => {
    const validCategories: AnimationCategory[] = [
      'locomotion', 'social', 'work', 'leisure', 'combat',
      'emote', 'activity', 'pose', 'ranged', 'magic',
    ];
    for (const entry of Object.values(ANIMATION_CATALOG)) {
      expect(validCategories).toContain(entry.category);
    }
  });
});

describe('ALL_MODEL_IDS', () => {
  it('contains 20 models (18 characters + 2 anim packs)', () => {
    expect(ALL_MODEL_IDS.length).toBe(20);
  });

  it('includes both animation packs', () => {
    expect(ALL_MODEL_IDS).toContain('anim_ual1_standard');
    expect(ALL_MODEL_IDS).toContain('anim2_ual2_standard');
  });
});

describe('getAvailableAnimations', () => {
  it('returns 24 animations for character models', () => {
    expect(getAvailableAnimations('char_female_adventurer')).toHaveLength(24);
    expect(getAvailableAnimations('char_male_worker')).toHaveLength(24);
  });

  it('returns 45 animations for UAL1 pack', () => {
    expect(getAvailableAnimations('anim_ual1_standard')).toHaveLength(45);
  });

  it('returns 43 animations for UAL2 pack', () => {
    expect(getAvailableAnimations('anim2_ual2_standard')).toHaveLength(43);
  });

  it('returns empty array for unknown model', () => {
    expect(getAvailableAnimations('nonexistent_model')).toEqual([]);
  });

  it('returns a new array each call (no mutation risk)', () => {
    const a = getAvailableAnimations('char_male_casual');
    const b = getAvailableAnimations('char_male_casual');
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });

  it('all returned animations exist in the catalog', () => {
    for (const modelId of ALL_MODEL_IDS) {
      const anims = getAvailableAnimations(modelId);
      for (const name of anims) {
        expect(ANIMATION_CATALOG).toHaveProperty(name);
      }
    }
  });
});

describe('getModelsWithAnimation', () => {
  it('Walk is available on all 18 character models', () => {
    const models = getModelsWithAnimation('Walk');
    expect(models.length).toBe(18);
    expect(models).toContain('char_female_adventurer');
    expect(models).toContain('char_male_worker');
  });

  it('Dance_Loop is only in anim_ual1_standard', () => {
    expect(getModelsWithAnimation('Dance_Loop')).toEqual(['anim_ual1_standard']);
  });

  it('Farm_Harvest is only in anim2_ual2_standard', () => {
    expect(getModelsWithAnimation('Farm_Harvest')).toEqual(['anim2_ual2_standard']);
  });

  it('A_TPose is in both anim packs', () => {
    const models = getModelsWithAnimation('A_TPose');
    expect(models).toContain('anim_ual1_standard');
    expect(models).toContain('anim2_ual2_standard');
    expect(models).toHaveLength(2);
  });

  it('returns empty array for nonexistent animation', () => {
    expect(getModelsWithAnimation('Nonexistent')).toEqual([]);
  });
});

describe('getAnimationsByCategory', () => {
  it('returns locomotion animations', () => {
    const locomotion = getAnimationsByCategory('locomotion');
    expect(locomotion.length).toBeGreaterThan(10);
    expect(locomotion.map(a => a.name)).toContain('Walk');
    expect(locomotion.map(a => a.name)).toContain('Run');
    expect(locomotion.map(a => a.name)).toContain('Sprint_Loop');
  });

  it('returns combat animations', () => {
    const combat = getAnimationsByCategory('combat');
    expect(combat.length).toBeGreaterThan(15);
    expect(combat.map(a => a.name)).toContain('Sword_Slash');
    expect(combat.map(a => a.name)).toContain('Death');
  });

  it('returns empty for unused category', () => {
    // 'emote' has no animations in current catalog
    const emote = getAnimationsByCategory('emote');
    expect(emote).toEqual([]);
  });
});

describe('getAnimationSummary', () => {
  it('returns correct total', () => {
    const summary = getAnimationSummary();
    expect(summary.totalUniqueAnimations).toBe(109);
  });

  it('category counts sum to total', () => {
    const summary = getAnimationSummary();
    const sum = Object.values(summary.categoryCounts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(summary.totalUniqueAnimations);
  });

  it('richest models are sorted descending', () => {
    const summary = getAnimationSummary();
    for (let i = 1; i < summary.richestModels.length; i++) {
      expect(summary.richestModels[i - 1].count).toBeGreaterThanOrEqual(
        summary.richestModels[i].count
      );
    }
  });

  it('richest model is anim_ual1_standard with 45', () => {
    const summary = getAnimationSummary();
    expect(summary.richestModels[0].modelId).toBe('anim_ual1_standard');
    expect(summary.richestModels[0].count).toBe(45);
  });
});
