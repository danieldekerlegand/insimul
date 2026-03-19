import { describe, it, expect } from 'vitest';
import {
  worldTypeToGenre,
  normalizeGender,
  deriveBodyType,
  selectNPCModel,
  resolveNPCModelFromCharacter,
  getModelManifest,
} from '../NPCModelManifest';

describe('worldTypeToGenre', () => {
  it('maps fantasy world types', () => {
    expect(worldTypeToGenre('medieval-fantasy')).toBe('fantasy');
    expect(worldTypeToGenre('dark-fantasy')).toBe('fantasy');
    expect(worldTypeToGenre('Fantasy Realm')).toBe('fantasy');
  });

  it('maps sci-fi world types', () => {
    expect(worldTypeToGenre('cyberpunk')).toBe('scifi');
    expect(worldTypeToGenre('sci-fi')).toBe('scifi');
    expect(worldTypeToGenre('space-opera')).toBe('scifi');
    expect(worldTypeToGenre('post-apocalyptic')).toBe('scifi');
  });

  it('maps modern world types', () => {
    expect(worldTypeToGenre('modern')).toBe('modern');
    expect(worldTypeToGenre('urban-noir')).toBe('modern');
    expect(worldTypeToGenre('contemporary')).toBe('modern');
  });

  it('defaults to generic for unknown types', () => {
    expect(worldTypeToGenre('unknown')).toBe('generic');
    expect(worldTypeToGenre(undefined)).toBe('generic');
    expect(worldTypeToGenre('')).toBe('generic');
  });
});

describe('normalizeGender', () => {
  it('normalizes male variants', () => {
    expect(normalizeGender('male')).toBe('male');
    expect(normalizeGender('Male')).toBe('male');
    expect(normalizeGender('m')).toBe('male');
  });

  it('normalizes female variants', () => {
    expect(normalizeGender('female')).toBe('female');
    expect(normalizeGender('Female')).toBe('female');
    expect(normalizeGender('f')).toBe('female');
  });

  it('defaults to nonbinary for other/missing', () => {
    expect(normalizeGender('other')).toBe('nonbinary');
    expect(normalizeGender('nonbinary')).toBe('nonbinary');
    expect(normalizeGender(undefined)).toBe('nonbinary');
    expect(normalizeGender('')).toBe('nonbinary');
  });
});

describe('deriveBodyType', () => {
  it('detects athletic from traits', () => {
    expect(deriveBodyType(['muscular', 'tall'])).toBe('athletic');
    expect(deriveBodyType(['strong build'])).toBe('athletic');
  });

  it('detects athletic from occupation', () => {
    expect(deriveBodyType([], 'Town Guard')).toBe('athletic');
    expect(deriveBodyType([], 'blacksmith')).toBe('athletic');
    expect(deriveBodyType([], 'warrior')).toBe('athletic');
  });

  it('detects heavy from traits', () => {
    expect(deriveBodyType(['stout', 'broad'])).toBe('heavy');
    expect(deriveBodyType(['portly figure'])).toBe('heavy');
  });

  it('detects heavy from occupation', () => {
    expect(deriveBodyType([], 'innkeeper')).toBe('heavy');
    expect(deriveBodyType([], 'cook')).toBe('heavy');
  });

  it('detects slim from traits', () => {
    expect(deriveBodyType(['thin', 'pale'])).toBe('slim');
    expect(deriveBodyType(['slender frame'])).toBe('slim');
  });

  it('detects slim from occupation', () => {
    expect(deriveBodyType([], 'scholar')).toBe('slim');
    expect(deriveBodyType([], 'mage')).toBe('slim');
  });

  it('defaults to average', () => {
    expect(deriveBodyType([])).toBe('average');
    expect(deriveBodyType(undefined, undefined)).toBe('average');
    expect(deriveBodyType(['friendly', 'wise'], 'farmer')).toBe('average');
  });
});

describe('selectNPCModel', () => {
  it('returns role-specific model when available', () => {
    const model = selectNPCModel('male', 'athletic', 'guard', 'fantasy');
    expect(model.role).toBe('guard');
    expect(model.genre).toBe('fantasy');
    expect(model.gender).toBe('male');
  });

  it('returns exact body type match when no role model', () => {
    const model = selectNPCModel('female', 'slim', 'civilian', 'fantasy');
    expect(model.gender).toBe('female');
    expect(model.bodyType).toBe('slim');
    expect(model.genre).toBe('fantasy');
    expect(model.role).toBeNull();
  });

  it('falls back to same genre+gender when body type unavailable', () => {
    // nonbinary only has average and athletic in the manifest
    const model = selectNPCModel('nonbinary', 'heavy', 'civilian', 'fantasy');
    expect(model.gender).toBe('nonbinary');
    expect(model.genre).toBe('fantasy');
    expect(model.role).toBeNull();
  });

  it('falls back to generic genre when genre unavailable', () => {
    // Generic has male/female models
    const model = selectNPCModel('male', 'average', 'civilian', 'generic');
    expect(model.genre).toBe('generic');
    expect(model.gender).toBe('male');
  });

  it('always returns a valid model entry', () => {
    // Even with unusual combinations
    const model = selectNPCModel('nonbinary', 'heavy', 'questgiver', 'generic');
    expect(model).toBeDefined();
    expect(model.path).toBeTruthy();
  });
});

describe('resolveNPCModelFromCharacter', () => {
  it('resolves model for a male warrior in fantasy world', () => {
    const result = resolveNPCModelFromCharacter(
      { gender: 'male', physicalTraits: ['muscular'], occupation: 'warrior' },
      'guard',
      'medieval-fantasy'
    );
    expect(result.rootUrl).toContain('fantasy');
    expect(result.file).toMatch(/\.glb$/);
    expect(result.cacheKey).toContain('fantasy');
    expect(result.cacheKey).toContain('male');
  });

  it('resolves model for a female scholar in modern world', () => {
    const result = resolveNPCModelFromCharacter(
      { gender: 'female', physicalTraits: ['slender'], occupation: 'scholar' },
      'civilian',
      'modern'
    );
    expect(result.rootUrl).toContain('modern');
    expect(result.file).toMatch(/\.glb$/);
    expect(result.cacheKey).toContain('female');
    expect(result.cacheKey).toContain('slim');
  });

  it('resolves model with missing character data gracefully', () => {
    const result = resolveNPCModelFromCharacter({}, 'civilian', undefined);
    expect(result.file).toMatch(/\.glb$/);
    expect(result.rootUrl).toBeTruthy();
    expect(result.cacheKey).toBeTruthy();
  });

  it('splits path into rootUrl and file correctly', () => {
    const result = resolveNPCModelFromCharacter(
      { gender: 'male' },
      'civilian',
      'cyberpunk'
    );
    expect(result.rootUrl).toMatch(/\/$/); // ends with /
    expect(result.file).not.toContain('/'); // no slashes in filename
    expect(result.rootUrl + result.file).toMatch(/^\/assets\/characters\/.+\.glb$/);
  });
});

describe('getModelManifest', () => {
  it('contains models for all three genre categories plus generic', () => {
    const manifest = getModelManifest();
    const genres = new Set(manifest.map(m => m.genre));
    expect(genres).toContain('fantasy');
    expect(genres).toContain('scifi');
    expect(genres).toContain('modern');
    expect(genres).toContain('generic');
  });

  it('has both male and female models for each genre', () => {
    const manifest = getModelManifest();
    for (const genre of ['fantasy', 'scifi', 'modern'] as const) {
      const genreModels = manifest.filter(m => m.genre === genre);
      const genders = new Set(genreModels.map(m => m.gender));
      expect(genders).toContain('male');
      expect(genders).toContain('female');
    }
  });

  it('has multiple body types per gender per genre', () => {
    const manifest = getModelManifest();
    for (const genre of ['fantasy', 'scifi', 'modern'] as const) {
      for (const gender of ['male', 'female'] as const) {
        const models = manifest.filter(
          m => m.genre === genre && m.gender === gender && m.role === null
        );
        const bodyTypes = new Set(models.map(m => m.bodyType));
        expect(bodyTypes.size).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('all model paths end with .glb', () => {
    const manifest = getModelManifest();
    for (const entry of manifest) {
      expect(entry.path).toMatch(/\.glb$/);
    }
  });
});
