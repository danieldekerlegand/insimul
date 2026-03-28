/**
 * Tests for NatureLODConfig — centralized LOD distance configuration.
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_LOD_PROFILE,
  getLODProfileForBiome,
  createLODStats,
  type NatureLODProfile,
  type NatureObjectType,
} from '../../logic/NatureLODConfig';

describe('NatureLODConfig', () => {
  describe('DEFAULT_LOD_PROFILE', () => {
    it('has expected distance values for all nature types', () => {
      expect(DEFAULT_LOD_PROFILE.tree).toEqual({ lodProxy: 50, lodCull: 120 });
      expect(DEFAULT_LOD_PROFILE.rock).toEqual({ lodProxy: 40, lodCull: 80 });
      expect(DEFAULT_LOD_PROFILE.shrub).toEqual({ lodProxy: 0, lodCull: 60 });
      expect(DEFAULT_LOD_PROFILE.grass).toEqual({ lodProxy: 0, lodCull: 30 });
      expect(DEFAULT_LOD_PROFILE.flower).toEqual({ lodProxy: 0, lodCull: 40 });
      expect(DEFAULT_LOD_PROFILE.lake).toEqual({ lodProxy: 0, lodCull: 150 });
      expect(DEFAULT_LOD_PROFILE.geological).toEqual({ lodProxy: 50, lodCull: 100 });
    });

    it('covers all 7 nature object types', () => {
      const keys = Object.keys(DEFAULT_LOD_PROFILE);
      expect(keys).toHaveLength(7);
      expect(keys).toContain('tree');
      expect(keys).toContain('rock');
      expect(keys).toContain('shrub');
      expect(keys).toContain('grass');
      expect(keys).toContain('flower');
      expect(keys).toContain('lake');
      expect(keys).toContain('geological');
    });

    it('all cull distances are positive', () => {
      for (const key of Object.keys(DEFAULT_LOD_PROFILE) as NatureObjectType[]) {
        expect(DEFAULT_LOD_PROFILE[key].lodCull).toBeGreaterThan(0);
      }
    });

    it('proxy distances are always less than cull distances when non-zero', () => {
      for (const key of Object.keys(DEFAULT_LOD_PROFILE) as NatureObjectType[]) {
        const { lodProxy, lodCull } = DEFAULT_LOD_PROFILE[key];
        if (lodProxy > 0) {
          expect(lodProxy).toBeLessThan(lodCull);
        }
      }
    });
  });

  describe('getLODProfileForBiome', () => {
    it('returns unmodified profile for unknown biome', () => {
      const profile = getLODProfileForBiome('alien_world');
      expect(profile.tree.lodCull).toBe(DEFAULT_LOD_PROFILE.tree.lodCull);
      expect(profile.rock.lodCull).toBe(DEFAULT_LOD_PROFILE.rock.lodCull);
    });

    it('forest biome reduces distances (multiplier 0.8)', () => {
      const profile = getLODProfileForBiome('forest');
      expect(profile.tree.lodCull).toBe(Math.round(120 * 0.8));
      expect(profile.tree.lodProxy).toBe(Math.round(50 * 0.8));
      expect(profile.rock.lodCull).toBe(Math.round(80 * 0.8));
      expect(profile.grass.lodCull).toBe(Math.round(30 * 0.8));
    });

    it('desert biome increases distances (multiplier 1.3)', () => {
      const profile = getLODProfileForBiome('desert');
      expect(profile.tree.lodCull).toBe(Math.round(120 * 1.3));
      expect(profile.rock.lodCull).toBe(Math.round(80 * 1.3));
      expect(profile.lake.lodCull).toBe(Math.round(150 * 1.3));
    });

    it('plains biome increases distances (multiplier 1.2)', () => {
      const profile = getLODProfileForBiome('plains');
      expect(profile.tree.lodCull).toBe(Math.round(120 * 1.2));
    });

    it('preserves zero proxy distances regardless of multiplier', () => {
      const profile = getLODProfileForBiome('desert');
      // Shrub, grass, flower, lake have lodProxy = 0 in defaults
      expect(profile.shrub.lodProxy).toBe(0);
      expect(profile.grass.lodProxy).toBe(0);
      expect(profile.flower.lodProxy).toBe(0);
      expect(profile.lake.lodProxy).toBe(0);
    });

    it('is case-insensitive for biome name', () => {
      const upper = getLODProfileForBiome('Forest');
      const lower = getLODProfileForBiome('forest');
      expect(upper.tree.lodCull).toBe(lower.tree.lodCull);
    });

    it('accepts a custom base profile', () => {
      const custom: NatureLODProfile = {
        tree: { lodProxy: 100, lodCull: 200 },
        rock: { lodProxy: 0, lodCull: 100 },
        shrub: { lodProxy: 0, lodCull: 50 },
        grass: { lodProxy: 0, lodCull: 20 },
        flower: { lodProxy: 0, lodCull: 30 },
        lake: { lodProxy: 0, lodCull: 200 },
        geological: { lodProxy: 0, lodCull: 120 },
      };
      const profile = getLODProfileForBiome('forest', custom);
      expect(profile.tree.lodCull).toBe(Math.round(200 * 0.8));
      expect(profile.tree.lodProxy).toBe(Math.round(100 * 0.8));
    });
  });

  describe('createLODStats', () => {
    it('generates stats for all types', () => {
      const counts: Record<NatureObjectType, number> = {
        tree: 50, rock: 30, shrub: 20, grass: 0, flower: 0, lake: 5, geological: 10,
      };
      const stats = createLODStats(counts, DEFAULT_LOD_PROFILE);
      expect(stats).toHaveLength(7);

      const treeStat = stats.find(s => s.type === 'tree')!;
      expect(treeStat.totalMeshes).toBe(50);
      expect(treeStat.withProxy).toBe(50); // tree has lodProxy > 0
      expect(treeStat.cullOnly).toBe(0);

      const grassStat = stats.find(s => s.type === 'grass')!;
      expect(grassStat.totalMeshes).toBe(0);
      expect(grassStat.withProxy).toBe(0); // grass has lodProxy = 0
      expect(grassStat.cullOnly).toBe(0);

      const shrubStat = stats.find(s => s.type === 'shrub')!;
      expect(shrubStat.totalMeshes).toBe(20);
      expect(shrubStat.withProxy).toBe(0); // shrub has lodProxy = 0
      expect(shrubStat.cullOnly).toBe(20);
    });

    it('handles zero mesh counts', () => {
      const counts: Record<NatureObjectType, number> = {
        tree: 0, rock: 0, shrub: 0, grass: 0, flower: 0, lake: 0, geological: 0,
      };
      const stats = createLODStats(counts, DEFAULT_LOD_PROFILE);
      for (const s of stats) {
        expect(s.totalMeshes).toBe(0);
        expect(s.withProxy).toBe(0);
        expect(s.cullOnly).toBe(0);
      }
    });
  });
});
