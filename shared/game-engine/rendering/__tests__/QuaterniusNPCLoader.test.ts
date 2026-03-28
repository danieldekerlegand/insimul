import { describe, it, expect } from 'vitest';
import {
  selectQuaterniusConfig,
  normalizeToQuaterniusGender,
  buildCacheKey,
} from '../QuaterniusNPCLoader';

describe('normalizeToQuaterniusGender', () => {
  it('normalizes female variants', () => {
    expect(normalizeToQuaterniusGender('female')).toBe('female');
    expect(normalizeToQuaterniusGender('Female')).toBe('female');
    expect(normalizeToQuaterniusGender('f')).toBe('female');
  });

  it('defaults to male for male input', () => {
    expect(normalizeToQuaterniusGender('male')).toBe('male');
    expect(normalizeToQuaterniusGender('Male')).toBe('male');
  });

  it('defaults to male for unknown/missing gender', () => {
    expect(normalizeToQuaterniusGender('nonbinary')).toBe('male');
    expect(normalizeToQuaterniusGender('other')).toBe('male');
    expect(normalizeToQuaterniusGender(undefined)).toBe('male');
    expect(normalizeToQuaterniusGender('')).toBe('male');
  });
});

describe('selectQuaterniusConfig', () => {
  it('returns a valid config for male civilian', () => {
    const config = selectQuaterniusConfig('char-001', 'male', 'civilian');
    expect(config.body).toBeDefined();
    expect(config.body.gender).toBe('male');
    expect(config.outfit).toBeDefined();
    expect(config.outfit.gender).toBe('male');
    expect(config.outfit.part).toBe('full');
  });

  it('returns a valid config for female guard', () => {
    const config = selectQuaterniusConfig('char-002', 'female', 'guard');
    expect(config.body.gender).toBe('female');
    expect(config.outfit.gender).toBe('female');
    expect(config.outfit.part).toBe('full');
    expect(config.outfit.outfitSet).toBe('ranger');
  });

  it('assigns ranger outfit to guards', () => {
    const config = selectQuaterniusConfig('guard-001', 'male', 'guard');
    expect(config.outfit.outfitSet).toBe('ranger');
  });

  it('assigns peasant outfit to civilians', () => {
    const config = selectQuaterniusConfig('civ-001', 'male', 'civilian');
    expect(config.outfit.outfitSet).toBe('peasant');
  });

  it('assigns peasant outfit to merchants', () => {
    const config = selectQuaterniusConfig('merch-001', 'female', 'merchant');
    expect(config.outfit.outfitSet).toBe('peasant');
  });

  it('is deterministic — same ID always gets same config', () => {
    const config1 = selectQuaterniusConfig('stable-id', 'male', 'civilian');
    const config2 = selectQuaterniusConfig('stable-id', 'male', 'civilian');
    expect(config1.body.id).toBe(config2.body.id);
    expect(config1.outfit.id).toBe(config2.outfit.id);
    if (config1.hair) {
      expect(config1.hair.id).toBe(config2.hair!.id);
    } else {
      expect(config2.hair).toBeNull();
    }
  });

  it('produces variety — different IDs get different configs', () => {
    const configs = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const config = selectQuaterniusConfig(`npc-${i}`, 'male', 'civilian');
      configs.add(config.body.id + '|' + (config.hair?.id || 'none'));
    }
    // With 20 NPCs we should see at least some variety
    expect(configs.size).toBeGreaterThan(1);
  });

  it('can produce configs with no hair (bald)', () => {
    // Test many IDs — some should produce null hair
    let foundBald = false;
    for (let i = 0; i < 100; i++) {
      const config = selectQuaterniusConfig(`bald-test-${i}`, 'male', 'civilian');
      if (config.hair === null) {
        foundBald = true;
        break;
      }
    }
    expect(foundBald).toBe(true);
  });

  it('hair has correct gender affinity', () => {
    for (let i = 0; i < 50; i++) {
      const config = selectQuaterniusConfig(`hair-test-${i}`, 'female', 'civilian');
      if (config.hair) {
        // Hair should be either unisex (null affinity) or match the NPC gender
        expect(
          config.hair.genderAffinity === null || config.hair.genderAffinity === 'female',
        ).toBe(true);
      }
    }
  });

  it('selects only rigged hair', () => {
    for (let i = 0; i < 50; i++) {
      const config = selectQuaterniusConfig(`rigged-test-${i}`, 'male', 'guard');
      if (config.hair) {
        expect(config.hair.rigged).toBe(true);
      }
    }
  });
});

describe('buildCacheKey', () => {
  it('includes body and outfit IDs', () => {
    const config = selectQuaterniusConfig('test-id', 'male', 'civilian');
    const key = buildCacheKey(config);
    expect(key).toContain('quat_');
    expect(key).toContain(config.body.id);
    expect(key).toContain(config.outfit.id);
  });

  it('includes hair ID when present', () => {
    // Find a config with hair
    let configWithHair = selectQuaterniusConfig('with-hair-0', 'male', 'civilian');
    for (let i = 1; !configWithHair.hair && i < 100; i++) {
      configWithHair = selectQuaterniusConfig(`with-hair-${i}`, 'male', 'civilian');
    }
    if (configWithHair.hair) {
      const key = buildCacheKey(configWithHair);
      expect(key).toContain(configWithHair.hair.id);
    }
  });

  it('is deterministic', () => {
    const config = selectQuaterniusConfig('cache-test', 'female', 'guard');
    const key1 = buildCacheKey(config);
    const key2 = buildCacheKey(config);
    expect(key1).toBe(key2);
  });

  it('different configs produce different keys', () => {
    const config1 = selectQuaterniusConfig('key-a', 'male', 'guard');
    const config2 = selectQuaterniusConfig('key-b', 'female', 'civilian');
    // configs are likely different (different gender/role), so keys should differ
    if (config1.body.id !== config2.body.id || config1.outfit.id !== config2.outfit.id) {
      expect(buildCacheKey(config1)).not.toBe(buildCacheKey(config2));
    }
  });
});
