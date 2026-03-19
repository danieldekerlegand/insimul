import { describe, it, expect } from 'vitest';
import {
  hashString,
  collectMatchingModels,
  selectNPCModel,
} from '../NPCModelVariety';

describe('hashString', () => {
  it('returns a non-negative integer', () => {
    const h = hashString('test-character-id');
    expect(h).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(h)).toBe(true);
  });

  it('is deterministic', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
  });

  it('produces different values for different strings', () => {
    expect(hashString('char-1')).not.toBe(hashString('char-2'));
  });
});

describe('collectMatchingModels', () => {
  it('returns empty array when no models match', () => {
    const result = collectMatchingModels({}, 'civilian', 'male');
    expect(result).toEqual([]);
  });

  it('tier 1: prefers role_gender_N numbered variants', () => {
    const models = {
      civilian_male_0: 'asset-a',
      civilian_male_1: 'asset-b',
      civilian_male: 'asset-c',
      civilian: 'asset-d',
    };
    const result = collectMatchingModels(models, 'civilian', 'male');
    expect(result).toEqual(['asset-a', 'asset-b']);
  });

  it('tier 2: falls back to role_gender exact match', () => {
    const models = {
      civilian_male: 'asset-c',
      civilian: 'asset-d',
    };
    const result = collectMatchingModels(models, 'civilian', 'male');
    expect(result).toEqual(['asset-c']);
  });

  it('tier 3: falls back to role_N numbered variants', () => {
    const models = {
      civilian_0: 'asset-e',
      civilian_1: 'asset-f',
      civilian_2: 'asset-g',
      civilian: 'asset-d',
    };
    const result = collectMatchingModels(models, 'civilian', 'female');
    expect(result).toEqual(['asset-e', 'asset-f', 'asset-g']);
  });

  it('tier 4: falls back to role exact match', () => {
    const models = {
      civilian: 'asset-d',
      npcDefault: 'asset-fallback',
    };
    const result = collectMatchingModels(models, 'civilian', 'female');
    expect(result).toEqual(['asset-d']);
  });

  it('tier 5: falls back to npcDefault_gender', () => {
    const models = {
      npcDefault_male: 'asset-default-m',
      npcDefault: 'asset-default',
    };
    const result = collectMatchingModels(models, 'guard', 'male');
    expect(result).toEqual(['asset-default-m']);
  });

  it('tier 6: falls back to npcDefault', () => {
    const models = { npcDefault: 'asset-default' };
    const result = collectMatchingModels(models, 'merchant', 'female');
    expect(result).toEqual(['asset-default']);
  });

  it('handles "other" gender', () => {
    const models = {
      civilian_other: 'asset-other',
      civilian: 'asset-d',
    };
    const result = collectMatchingModels(models, 'civilian', 'other');
    expect(result).toEqual(['asset-other']);
  });
});

describe('selectNPCModel', () => {
  it('returns null when no models match', () => {
    expect(selectNPCModel({}, 'char-1', 'civilian', 'male')).toBeNull();
  });

  it('returns the only matching model when pool size is 1', () => {
    const models = { civilian: 'asset-only' };
    expect(selectNPCModel(models, 'char-1', 'civilian', 'male')).toBe('asset-only');
  });

  it('is deterministic for the same character ID', () => {
    const models = {
      guard_male_0: 'asset-a',
      guard_male_1: 'asset-b',
      guard_male_2: 'asset-c',
    };
    const result1 = selectNPCModel(models, 'npc-42', 'guard', 'male');
    const result2 = selectNPCModel(models, 'npc-42', 'guard', 'male');
    expect(result1).toBe(result2);
  });

  it('distributes different character IDs across the pool', () => {
    const models = {
      civilian_0: 'asset-a',
      civilian_1: 'asset-b',
      civilian_2: 'asset-c',
    };
    const selected = new Set<string>();
    // With enough different IDs, we should hit multiple assets
    for (let i = 0; i < 100; i++) {
      const result = selectNPCModel(models, `char-${i}`, 'civilian', 'male');
      if (result) selected.add(result);
    }
    // Should hit at least 2 out of 3 assets with 100 tries
    expect(selected.size).toBeGreaterThanOrEqual(2);
  });

  it('respects gender-specific models over generic ones', () => {
    const models = {
      guard_female: 'female-guard-asset',
      guard: 'generic-guard-asset',
    };
    expect(selectNPCModel(models, 'char-1', 'guard', 'female')).toBe('female-guard-asset');
  });
});
