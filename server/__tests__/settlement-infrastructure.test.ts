import { describe, it, expect } from 'vitest';
import {
  SettlementInfrastructureEngine,
  createSettlementInfrastructureEngine,
  getAvailableInfrastructure,
  getNewlyUnlockedInfrastructure,
  getInfrastructureDefinition,
  computeInfrastructureLevel,
  INFRASTRUCTURE_DEFINITIONS,
  type SettlementTier,
  type InfrastructureState,
} from '../engines/settlement-infrastructure';

describe('SettlementInfrastructureEngine', () => {
  describe('getAvailableInfrastructure', () => {
    it('returns only hamlet-tier items for hamlet', () => {
      const items = getAvailableInfrastructure('hamlet');
      for (const item of items) {
        expect(item.minTier).toBe('hamlet');
      }
      expect(items.length).toBeGreaterThan(0);
    });

    it('returns hamlet + village items for village', () => {
      const items = getAvailableInfrastructure('village');
      const tiers = new Set(items.map(i => i.minTier));
      expect(tiers).toContain('hamlet');
      expect(tiers).toContain('village');
      expect(tiers).not.toContain('town');
    });

    it('returns all items for metropolis', () => {
      const items = getAvailableInfrastructure('metropolis');
      expect(items.length).toBe(INFRASTRUCTURE_DEFINITIONS.length);
    });
  });

  describe('getNewlyUnlockedInfrastructure', () => {
    it('returns only items with matching minTier', () => {
      const items = getNewlyUnlockedInfrastructure('town');
      for (const item of items) {
        expect(item.minTier).toBe('town');
      }
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('getInfrastructureDefinition', () => {
    it('returns definition for valid ID', () => {
      const def = getInfrastructureDefinition('well');
      expect(def).toBeDefined();
      expect(def!.name).toBe('Well');
      expect(def!.category).toBe('water');
    });

    it('returns undefined for invalid ID', () => {
      expect(getInfrastructureDefinition('nonexistent')).toBeUndefined();
    });
  });

  describe('computeInfrastructureLevel', () => {
    it('returns 1 for empty infrastructure', () => {
      expect(computeInfrastructureLevel([])).toBe(1);
    });

    it('averages built infrastructure levels', () => {
      const built = [
        { definitionId: 'well', builtYear: 0, level: 1 },
        { definitionId: 'dirt_path', builtYear: 0, level: 1 },
        { definitionId: 'meeting_hall', builtYear: 0, level: 1 },
      ];
      expect(computeInfrastructureLevel(built)).toBe(1);
    });

    it('rounds the average', () => {
      const built = [
        { definitionId: 'a', builtYear: 0, level: 3 },
        { definitionId: 'b', builtYear: 0, level: 4 },
      ];
      // average 3.5 rounds to 4
      expect(computeInfrastructureLevel(built)).toBe(4);
    });
  });

  describe('constructor', () => {
    it('builds initial hamlet infrastructure', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'hamlet');
      const built = engine.getBuilt();
      expect(built.length).toBeGreaterThan(0);

      // Should have water, transport, civic, commerce, sanitation for hamlet
      const defs = built.map(b => getInfrastructureDefinition(b.definitionId)!);
      const categories = new Set(defs.map(d => d.category));
      expect(categories).toContain('water');
      expect(categories).toContain('transport');
      expect(categories).toContain('civic');
      expect(categories).toContain('commerce');
      expect(categories).toContain('sanitation');
      // Defense starts at village, not hamlet
      expect(categories).not.toContain('defense');
    });

    it('builds initial village infrastructure with upgrades', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'village');
      const built = engine.getBuilt();

      // Should have cistern (village water) not well (hamlet water)
      expect(engine.hasInfrastructure('cistern')).toBe(true);
      expect(engine.hasInfrastructure('well')).toBe(false);

      // Should have defense now
      const defs = built.map(b => getInfrastructureDefinition(b.definitionId)!);
      const categories = new Set(defs.map(d => d.category));
      expect(categories).toContain('defense');
    });

    it('builds initial city infrastructure', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'city');
      // City should have level 4 water (waterworks)
      expect(engine.hasInfrastructure('waterworks')).toBe(true);
      expect(engine.hasInfrastructure('aqueduct')).toBe(false);
    });
  });

  describe('onTierChange', () => {
    it('returns no events when tier stays the same', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'hamlet');
      const events = engine.onTierChange('hamlet', 1800);
      expect(events).toHaveLength(0);
    });

    it('returns no events on decline', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'town');
      const events = engine.onTierChange('village', 1800);
      expect(events).toHaveLength(0);
    });

    it('emits events and builds infrastructure on growth', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'hamlet');
      const events = engine.onTierChange('village', 1800);

      expect(events.length).toBeGreaterThan(0);
      // Should have an infrastructure_unlocked event
      expect(events.some(e => e.type === 'infrastructure_unlocked')).toBe(true);

      // Should now have village-tier items
      expect(engine.hasInfrastructure('cistern')).toBe(true);
      expect(engine.hasInfrastructure('well')).toBe(false); // replaced
    });

    it('upgrades through multiple tiers', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'hamlet');

      engine.onTierChange('village', 1800);
      engine.onTierChange('town', 1850);
      engine.onTierChange('city', 1900);

      expect(engine.hasInfrastructure('waterworks')).toBe(true);
      expect(engine.hasInfrastructure('highway')).toBe(true);
      expect(engine.hasInfrastructure('city_hall')).toBe(true);
      expect(engine.hasInfrastructure('garrison')).toBe(true);
    });

    it('tracks builtYear correctly', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'hamlet');
      engine.onTierChange('village', 1850);

      const cistern = engine.getBuilt().find(b => b.definitionId === 'cistern');
      expect(cistern).toBeDefined();
      expect(cistern!.builtYear).toBe(1850);
    });

    it('emits upgrade events with correct metadata', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'hamlet');
      const events = engine.onTierChange('village', 1800);

      const upgradeEvents = events.filter(e => e.type === 'infrastructure_upgraded');
      expect(upgradeEvents.length).toBeGreaterThan(0);

      for (const event of upgradeEvents) {
        expect(event.metadata).toHaveProperty('oldInfrastructureId');
        expect(event.metadata).toHaveProperty('newInfrastructureId');
        expect(event.metadata).toHaveProperty('category');
      }
    });

    it('emits built events for new independent infrastructure', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'hamlet');
      const events = engine.onTierChange('village', 1800);

      const builtEvents = events.filter(e => e.type === 'infrastructure_built');
      // Watchtower and palisade are new at village tier (no replacesId pointing to hamlet items)
      expect(builtEvents.length).toBeGreaterThan(0);
    });
  });

  describe('getByCategory', () => {
    it('returns infrastructure filtered by category', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'town');
      const water = engine.getByCategory('water');
      expect(water.length).toBeGreaterThan(0);
      for (const item of water) {
        const def = getInfrastructureDefinition(item.definitionId)!;
        expect(def.category).toBe('water');
      }
    });
  });

  describe('getLevel', () => {
    it('increases as settlement grows', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'hamlet');
      const hamletLevel = engine.getLevel();

      engine.onTierChange('city', 1900);
      const cityLevel = engine.getLevel();

      expect(cityLevel).toBeGreaterThan(hamletLevel);
    });
  });

  describe('serialize / deserialize', () => {
    it('round-trips state correctly', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'town');
      engine.onTierChange('city', 1900);

      const serialized = engine.serialize();
      const engine2 = createSettlementInfrastructureEngine('s1', 'hamlet');
      engine2.deserialize(serialized);

      expect(engine2.getState()).toEqual(engine.getState());
      expect(engine2.getLevel()).toBe(engine.getLevel());
    });

    it('deserialize creates independent copy', () => {
      const engine = createSettlementInfrastructureEngine('s1', 'hamlet');
      const serialized = engine.serialize();

      const engine2 = createSettlementInfrastructureEngine('s2', 'hamlet');
      engine2.deserialize(serialized);

      // Mutate original — should not affect deserialized
      engine.onTierChange('village', 1800);
      expect(engine2.getState().tier).toBe('hamlet');
    });
  });

  describe('infrastructure definitions', () => {
    it('all definitions have unique IDs', () => {
      const ids = INFRASTRUCTURE_DEFINITIONS.map(d => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all replacesId references exist', () => {
      for (const def of INFRASTRUCTURE_DEFINITIONS) {
        if (def.replacesId) {
          const target = getInfrastructureDefinition(def.replacesId);
          expect(target).toBeDefined();
          expect(target!.category).toBe(def.category);
        }
      }
    });

    it('replacement targets have lower level', () => {
      for (const def of INFRASTRUCTURE_DEFINITIONS) {
        if (def.replacesId) {
          const target = getInfrastructureDefinition(def.replacesId)!;
          expect(def.level).toBeGreaterThan(target.level);
        }
      }
    });

    it('covers all six categories', () => {
      const categories = new Set(INFRASTRUCTURE_DEFINITIONS.map(d => d.category));
      expect(categories).toEqual(new Set(['water', 'transport', 'civic', 'commerce', 'defense', 'sanitation']));
    });
  });
});
