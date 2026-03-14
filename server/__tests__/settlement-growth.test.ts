/**
 * Tests for Settlement Growth Engine (US-063)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  SettlementGrowthEngine,
  getTierForPopulation,
  getTierIndex,
  TIER_THRESHOLDS,
  TIER_INFRASTRUCTURE,
  createSettlementGrowthEngine,
  type SettlementTier,
} from '../engines/settlement-growth';
import { SeededRNG } from '../engines/historical-simulation';

describe('Settlement Growth Engine', () => {
  let rng: SeededRNG;

  beforeEach(() => {
    rng = new SeededRNG(42);
  });

  // -----------------------------------------------------------------------
  // getTierForPopulation
  // -----------------------------------------------------------------------
  describe('getTierForPopulation', () => {
    it('returns hamlet for population < 50', () => {
      expect(getTierForPopulation(0)).toBe('hamlet');
      expect(getTierForPopulation(25)).toBe('hamlet');
      expect(getTierForPopulation(49)).toBe('hamlet');
    });

    it('returns village for population 50-199', () => {
      expect(getTierForPopulation(50)).toBe('village');
      expect(getTierForPopulation(100)).toBe('village');
      expect(getTierForPopulation(199)).toBe('village');
    });

    it('returns town for population 200-999', () => {
      expect(getTierForPopulation(200)).toBe('town');
      expect(getTierForPopulation(500)).toBe('town');
      expect(getTierForPopulation(999)).toBe('town');
    });

    it('returns city for population 1000-4999', () => {
      expect(getTierForPopulation(1000)).toBe('city');
      expect(getTierForPopulation(3000)).toBe('city');
      expect(getTierForPopulation(4999)).toBe('city');
    });

    it('returns metropolis for population >= 5000', () => {
      expect(getTierForPopulation(5000)).toBe('metropolis');
      expect(getTierForPopulation(50000)).toBe('metropolis');
    });

    it('supports custom thresholds', () => {
      const custom = { ...TIER_THRESHOLDS, town: 500 };
      expect(getTierForPopulation(300, custom)).toBe('village');
      expect(getTierForPopulation(500, custom)).toBe('town');
    });
  });

  // -----------------------------------------------------------------------
  // getTierIndex
  // -----------------------------------------------------------------------
  describe('getTierIndex', () => {
    it('returns ordered indices', () => {
      expect(getTierIndex('hamlet')).toBe(0);
      expect(getTierIndex('village')).toBe(1);
      expect(getTierIndex('town')).toBe(2);
      expect(getTierIndex('city')).toBe(3);
      expect(getTierIndex('metropolis')).toBe(4);
    });
  });

  // -----------------------------------------------------------------------
  // Engine initialization
  // -----------------------------------------------------------------------
  describe('initialization', () => {
    it('sets correct initial tier based on population', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 300,
      });
      expect(engine.getTier()).toBe('town');
      expect(engine.getPopulation()).toBe(300);
    });

    it('starts with one default district', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 100,
      });
      const districts = engine.getDistricts();
      expect(districts).toHaveLength(1);
      expect(districts[0].name).toBe('Town Center');
      expect(districts[0].type).toBe('mixed');
    });

    it('uses factory function', () => {
      const engine = createSettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 50,
      });
      expect(engine.getTier()).toBe('village');
    });
  });

  // -----------------------------------------------------------------------
  // Tier changes
  // -----------------------------------------------------------------------
  describe('tier changes', () => {
    it('emits tier_change event on growth', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 45,
      });
      expect(engine.getTier()).toBe('hamlet');

      const events = engine.update(55, 0, 1850, 6, 15, 10, rng);

      expect(engine.getTier()).toBe('village');
      const tierEvent = events.find(e => e.type === 'tier_change');
      expect(tierEvent).toBeDefined();
      expect(tierEvent!.metadata.oldTier).toBe('hamlet');
      expect(tierEvent!.metadata.newTier).toBe('village');
      expect(tierEvent!.metadata.direction).toBe('growth');
    });

    it('emits tier_change event on decline', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 55,
      });
      expect(engine.getTier()).toBe('village');

      const events = engine.update(40, 0, 1850, 6, 15, 10, rng);

      expect(engine.getTier()).toBe('hamlet');
      const tierEvent = events.find(e => e.type === 'tier_change');
      expect(tierEvent).toBeDefined();
      expect(tierEvent!.metadata.direction).toBe('decline');
    });

    it('creates a new district on tier growth', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 190,
      });
      expect(engine.getDistricts()).toHaveLength(1);

      const events = engine.update(210, 5, 1900, 3, 15, 20, rng);

      expect(engine.getDistricts().length).toBeGreaterThan(1);
      const districtEvent = events.find(e => e.type === 'new_district');
      expect(districtEvent).toBeDefined();
    });

    it('does not create district on decline', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 210,
      });

      const events = engine.update(190, 0, 1900, 3, 15, 20, rng);

      const districtEvent = events.find(e => e.type === 'new_district');
      expect(districtEvent).toBeUndefined();
    });

    it('does not emit event when tier stays the same', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 300,
      });

      const events = engine.update(400, 5, 1900, 3, 15, 20, rng);

      const tierEvent = events.find(e => e.type === 'tier_change');
      expect(tierEvent).toBeUndefined();
    });

    it('updates infrastructure level on tier change', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 190,
      });
      expect(engine.getState().infrastructureLevel).toBe(TIER_INFRASTRUCTURE.village.infrastructureLevel);

      engine.update(210, 5, 1900, 3, 15, 20, rng);
      expect(engine.getState().infrastructureLevel).toBe(TIER_INFRASTRUCTURE.town.infrastructureLevel);
    });
  });

  // -----------------------------------------------------------------------
  // Population milestones
  // -----------------------------------------------------------------------
  describe('population milestones', () => {
    it('emits population_milestone when crossing threshold', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 90,
      });

      const events = engine.update(105, 2, 1880, 6, 15, 10, rng);

      const milestone = events.find(e => e.type === 'population_milestone');
      expect(milestone).toBeDefined();
      expect(milestone!.metadata.milestone).toBe(100);
    });

    it('does not re-trigger the same milestone', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 90,
      });

      engine.update(105, 2, 1880, 6, 15, 10, rng);
      // Drop below and rise above again
      engine.update(95, 2, 1881, 6, 15, 12, rng);
      const events = engine.update(105, 2, 1882, 6, 15, 14, rng);

      const milestones = events.filter(e => e.type === 'population_milestone');
      expect(milestones).toHaveLength(0);
    });

    it('triggers multiple milestones if population jumps', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 90,
      });

      const events = engine.update(310, 5, 1880, 6, 15, 10, rng);

      const milestones = events.filter(e => e.type === 'population_milestone');
      // Should trigger 100, 200, 300
      expect(milestones).toHaveLength(3);
      const values = milestones.map(m => m.metadata.milestone);
      expect(values).toContain(100);
      expect(values).toContain(200);
      expect(values).toContain(300);
    });

    it('does not trigger milestones on population decrease', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 300,
      });

      const events = engine.update(250, 5, 1880, 6, 15, 10, rng);

      const milestones = events.filter(e => e.type === 'population_milestone');
      expect(milestones).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // Growth rate calculation
  // -----------------------------------------------------------------------
  describe('growth rate', () => {
    it('returns 0 with insufficient history', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 200,
      });
      expect(engine.getGrowthRate()).toBe(0);
    });

    it('calculates positive growth rate', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 100,
      });

      // Simulate 10 years of growth
      for (let year = 1850; year <= 1860; year++) {
        const pop = 100 + (year - 1850) * 10; // Linear growth: 100 -> 200
        engine.update(pop, 0, year, 6, 15, (year - 1850) * 2, rng);
        engine.recordSnapshot(year);
      }

      const rate = engine.getGrowthRate(10);
      expect(rate).toBeGreaterThan(0);
      // CAGR of 100 -> 200 over 10 years ≈ 7.2%
      expect(rate).toBeCloseTo(0.072, 1);
    });

    it('calculates negative growth rate', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 200,
      });

      for (let year = 1850; year <= 1860; year++) {
        const pop = 200 - (year - 1850) * 10; // 200 -> 100
        engine.update(pop, 0, year, 6, 15, (year - 1850) * 2, rng);
        engine.recordSnapshot(year);
      }

      const rate = engine.getGrowthRate(10);
      expect(rate).toBeLessThan(0);
    });
  });

  // -----------------------------------------------------------------------
  // Serialization
  // -----------------------------------------------------------------------
  describe('serialization', () => {
    it('round-trips through serialize/deserialize', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 300,
      });

      engine.update(350, 8, 1900, 6, 15, 20, rng);
      engine.recordSnapshot(1900);

      const serialized = engine.serialize();

      const engine2 = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 0,
      });
      engine2.deserialize(serialized);

      expect(engine2.getTier()).toBe(engine.getTier());
      expect(engine2.getPopulation()).toBe(engine.getPopulation());
      expect(engine2.getDistricts()).toEqual(engine.getDistricts());
      expect(engine2.getState().populationHistory).toEqual(engine.getState().populationHistory);
    });
  });

  // -----------------------------------------------------------------------
  // TIER_INFRASTRUCTURE constants
  // -----------------------------------------------------------------------
  describe('tier infrastructure', () => {
    it('has increasing capacity for each tier', () => {
      const tiers: SettlementTier[] = ['hamlet', 'village', 'town', 'city', 'metropolis'];
      for (let i = 1; i < tiers.length; i++) {
        const prev = TIER_INFRASTRUCTURE[tiers[i - 1]];
        const curr = TIER_INFRASTRUCTURE[tiers[i]];
        expect(curr.maxDistricts).toBeGreaterThan(prev.maxDistricts);
        expect(curr.infrastructureLevel).toBeGreaterThan(prev.infrastructureLevel);
        expect(curr.maxLandmarks).toBeGreaterThan(prev.maxLandmarks);
      }
    });
  });

  // -----------------------------------------------------------------------
  // Multi-tier jump
  // -----------------------------------------------------------------------
  describe('multi-tier jump', () => {
    it('handles jumping multiple tiers at once', () => {
      const engine = new SettlementGrowthEngine({
        settlementId: 's1',
        initialPopulation: 30,
      });
      expect(engine.getTier()).toBe('hamlet');

      const events = engine.update(1500, 10, 1900, 6, 15, 20, rng);

      expect(engine.getTier()).toBe('city');
      const tierEvent = events.find(e => e.type === 'tier_change');
      expect(tierEvent).toBeDefined();
      expect(tierEvent!.metadata.oldTier).toBe('hamlet');
      expect(tierEvent!.metadata.newTier).toBe('city');
    });
  });
});
