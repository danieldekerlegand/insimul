/**
 * Tests for HerbalismSystem
 *
 * Validates plant harvest probability, skill progression, herb/plant detection,
 * basket bonuses, vocabulary data, respawn tracking, and quest objective helpers.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameEventBus } from '../GameEventBus';
import {
  HerbalismSystem,
  PLANT_TYPES,
  NOTHING_BASE_CHANCE,
  BASKET_BONUS,
  MAX_HERBALISM_SKILL,
  SKILL_XP_THRESHOLDS,
  HERBALISM_HOTSPOT_RADIUS,
  HERBABLE_LOCATION_TYPES,
  SKILL_HARVEST_BONUS_PER_LEVEL,
  HARVEST_ENERGY_COST,
  RESPAWN_COOLDOWN_DAYS,
  type HerbalismSystemCallbacks,
  type HerbalismSkillState,
} from '../HerbalismSystem';
import { ACTION_DEFINITIONS } from '../PlayerActionSystem';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createCallbacks(overrides: Partial<HerbalismSystemCallbacks> = {}): HerbalismSystemCallbacks {
  return {
    showToast: vi.fn(),
    addInventoryItem: vi.fn(),
    hasInventoryItem: vi.fn().mockReturnValue(false),
    ...overrides,
  };
}

function createSystem(callbackOverrides: Partial<HerbalismSystemCallbacks> = {}) {
  const eventBus = new GameEventBus();
  const callbacks = createCallbacks(callbackOverrides);
  const system = new HerbalismSystem(callbacks);
  system.setEventBus(eventBus);
  return { system, eventBus, callbacks };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('HerbalismSystem', () => {
  let origRandom: () => number;

  beforeEach(() => {
    origRandom = Math.random;
  });

  afterEach(() => {
    Math.random = origRandom;
  });

  describe('plant type definitions', () => {
    it('defines exactly 8 plant types', () => {
      expect(PLANT_TYPES).toHaveLength(8);
    });

    it('has all expected plant ids', () => {
      const ids = PLANT_TYPES.map(p => p.id);
      expect(ids).toContain('lavande');
      expect(ids).toContain('romarin');
      expect(ids).toContain('menthe');
      expect(ids).toContain('rose');
      expect(ids).toContain('thym');
      expect(ids).toContain('sauge');
      expect(ids).toContain('basilic');
      expect(ids).toContain('fleur_sauvage');
    });

    it('base chances sum to 95% (leaving 5% for nothing)', () => {
      const totalChance = PLANT_TYPES.reduce((sum, p) => sum + p.baseChance, 0);
      expect(totalChance + NOTHING_BASE_CHANCE).toBeCloseTo(1.0, 5);
    });

    it('each plant has French name, English name, and language data', () => {
      for (const plant of PLANT_TYPES) {
        expect(plant.nameFr).toBeTruthy();
        expect(plant.nameEn).toBeTruthy();
        expect(plant.languageData.targetWord).toBeTruthy();
        expect(plant.languageData.nativeWord).toBeTruthy();
        expect(plant.languageData.pronunciation).toBeTruthy();
        expect(plant.languageData.exampleSentence).toBeTruthy();
      }
    });

    it('has correct plant categories matching the distribution', () => {
      const categories = PLANT_TYPES.map(p => p.plantCategory);
      expect(categories.filter(c => c === 'common_herb')).toHaveLength(2);
      expect(categories.filter(c => c === 'medicinal_herb')).toHaveLength(2);
      expect(categories.filter(c => c === 'flower')).toHaveLength(2);
      expect(categories.filter(c => c === 'rare_herb')).toHaveLength(1);
      expect(categories.filter(c => c === 'poisonous_plant')).toHaveLength(1);
    });

    it('Lavande is common (20%), Basilic is legendary (5%)', () => {
      const lavande = PLANT_TYPES.find(p => p.id === 'lavande')!;
      expect(lavande.nameFr).toBe('Lavande');
      expect(lavande.baseChance).toBe(0.20);
      expect(lavande.rarity).toBe('common');

      const basilic = PLANT_TYPES.find(p => p.id === 'basilic')!;
      expect(basilic.nameFr).toBe('Basilic');
      expect(basilic.baseChance).toBe(0.05);
      expect(basilic.rarity).toBe('legendary');
    });

    it('all plants have category "plants" in language data', () => {
      for (const plant of PLANT_TYPES) {
        expect(plant.languageData.category).toBe('plants');
      }
    });
  });

  describe('rollHarvest', () => {
    it('returns nothing when roll falls in nothing bucket', () => {
      const { system } = createSystem();
      // Nothing bucket is 0 to 0.05
      Math.random = () => 0.01;
      const result = system.rollHarvest(false);
      expect(result.harvested).toBe(false);
      expect(result.plant).toBeNull();
    });

    it('returns basilic when roll falls in basilic bucket', () => {
      const { system } = createSystem();
      // After nothing (0.05), basilic is 0.05 to 0.10
      Math.random = () => 0.06;
      const result = system.rollHarvest(false);
      expect(result.harvested).toBe(true);
      expect(result.plant?.id).toBe('basilic');
    });

    it('returns sauge when roll falls in sauge bucket', () => {
      const { system } = createSystem();
      // After basilic (0.10), sauge is 0.10 to 0.20
      Math.random = () => 0.15;
      const result = system.rollHarvest(false);
      expect(result.harvested).toBe(true);
      expect(result.plant?.id).toBe('sauge');
    });

    it('returns a common herb for high rolls', () => {
      const { system } = createSystem();
      Math.random = () => 0.90;
      const result = system.rollHarvest(false);
      expect(result.harvested).toBe(true);
      expect(result.plant).not.toBeNull();
    });

    it('basket bonus increases rare plant chances', () => {
      const { system } = createSystem();
      let rareCountNoBasket = 0;
      let rareCountWithBasket = 0;
      const iterations = 10000;

      Math.random = origRandom;
      for (let i = 0; i < iterations; i++) {
        const r = system.rollHarvest(false);
        if (r.plant?.rarity === 'legendary' || r.plant?.rarity === 'rare') rareCountNoBasket++;
      }
      for (let i = 0; i < iterations; i++) {
        const r = system.rollHarvest(true);
        if (r.plant?.rarity === 'legendary' || r.plant?.rarity === 'rare') rareCountWithBasket++;
      }

      expect(rareCountWithBasket).toBeGreaterThan(rareCountNoBasket);
    });

    it('basket grants bonusItem flag', () => {
      const { system } = createSystem();
      Math.random = () => 0.90;
      const result = system.rollHarvest(true);
      expect(result.bonusItem).toBe(true);
    });

    it('no basket means no bonusItem', () => {
      const { system } = createSystem();
      Math.random = () => 0.90;
      const result = system.rollHarvest(false);
      expect(result.bonusItem).toBe(false);
    });

    it('never finds nothing when roll >= nothing chance', () => {
      const { system } = createSystem();
      Math.random = () => 0.06;
      const result = system.rollHarvest(false);
      expect(result.harvested).toBe(true);
      expect(result.plant).not.toBeNull();
    });
  });

  describe('resolveHarvest', () => {
    it('adds harvested plant to inventory', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.90; // common plant
      system.resolveHarvest('garden_1');
      expect(callbacks.addInventoryItem).toHaveBeenCalled();
    });

    it('adds extra item with basket bonus', () => {
      const hasItem = vi.fn().mockReturnValue(true);
      const { system, callbacks } = createSystem({ hasInventoryItem: hasItem });
      Math.random = () => 0.06; // basilic
      system.resolveHarvest('garden_1');
      // 1 base + 1 bonus = 2
      expect(callbacks.addInventoryItem).toHaveBeenCalledWith('basilic', 2);
    });

    it('shows vocabulary toast on harvest', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.06; // basilic
      system.resolveHarvest();
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Basilic'),
        }),
      );
    });

    it('shows "Nothing Found" toast when no plant found', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.01; // nothing
      system.resolveHarvest();
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nothing Found',
        }),
      );
    });

    it('does not add item to inventory when nothing found', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.01; // nothing
      system.resolveHarvest();
      expect(callbacks.addInventoryItem).not.toHaveBeenCalled();
    });

    it('checks for basket via hasInventoryItem', () => {
      const hasItem = vi.fn().mockReturnValue(false);
      const { system } = createSystem({ hasInventoryItem: hasItem });
      Math.random = () => 0.90;
      system.resolveHarvest();
      expect(hasItem).toHaveBeenCalledWith('basket');
    });

    it('emits item_collected event on successful harvest', () => {
      const { system, eventBus } = createSystem();
      const handler = vi.fn();
      eventBus.on('item_collected', handler);
      Math.random = () => 0.06; // basilic
      system.resolveHarvest('garden_1');
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'item_collected',
          itemId: 'basilic',
          quantity: 1,
        }),
      );
    });

    it('does not emit item_collected event on nothing', () => {
      const { system, eventBus } = createSystem();
      const handler = vi.fn();
      eventBus.on('item_collected', handler);
      Math.random = () => 0.01; // nothing
      system.resolveHarvest();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('herbalism skill progression', () => {
    it('starts at level 0 with 0 harvests', () => {
      const { system } = createSystem();
      const skill = system.getSkill();
      expect(skill.level).toBe(0);
      expect(skill.totalHarvests).toBe(0);
    });

    it('increments total harvests on successful harvest', () => {
      const { system } = createSystem();
      Math.random = () => 0.90;
      system.resolveHarvest();
      expect(system.getSkill().totalHarvests).toBe(1);
    });

    it('does not increment harvests on nothing', () => {
      const { system } = createSystem();
      Math.random = () => 0.01;
      system.resolveHarvest();
      expect(system.getSkill().totalHarvests).toBe(0);
    });

    it('levels up at correct thresholds', () => {
      const { system } = createSystem();
      Math.random = () => 0.90;

      // Level 1 at 3 harvests
      for (let i = 0; i < 3; i++) system.resolveHarvest();
      expect(system.getSkillLevel()).toBe(1);
    });

    it('shows level up toast', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.90;

      for (let i = 0; i < 3; i++) system.resolveHarvest();
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Herbalism Skill Up!',
        }),
      );
    });

    it('tracks harvest counts per plant type', () => {
      const { system } = createSystem();
      Math.random = () => 0.90; // common
      system.resolveHarvest();
      system.resolveHarvest();

      Math.random = () => 0.06; // basilic
      system.resolveHarvest();

      const skill = system.getSkill();
      expect(skill.harvestCounts['basilic']).toBe(1);
    });

    it('caps at MAX_HERBALISM_SKILL', () => {
      const { system } = createSystem();
      Math.random = () => 0.90;

      const state: HerbalismSkillState = {
        level: MAX_HERBALISM_SKILL,
        totalHarvests: 999,
        harvestCounts: {},
      };
      system.setSkillState(state);

      system.resolveHarvest();
      expect(system.getSkillLevel()).toBe(MAX_HERBALISM_SKILL);
    });

    it('skill improves harvest rates (reduces nothing chance)', () => {
      const { system } = createSystem();

      // At skill 0, roll 0.04 gives nothing
      Math.random = () => 0.04;
      const result0 = system.rollHarvest(false);
      expect(result0.harvested).toBe(false);

      // At skill 5, nothing chance is reduced by 5 * 0.02 = 0.10 -> effectively 0
      system.setSkillState({ level: 5, totalHarvests: 40, harvestCounts: {} });
      const result5 = system.rollHarvest(false);
      expect(result5.harvested).toBe(true);
    });

    it('setSkillState and getSkill round-trip correctly', () => {
      const { system } = createSystem();
      const state: HerbalismSkillState = {
        level: 3,
        totalHarvests: 20,
        harvestCounts: { lavande: 12, romarin: 8 },
      };
      system.setSkillState(state);
      const retrieved = system.getSkill();
      expect(retrieved.level).toBe(3);
      expect(retrieved.totalHarvests).toBe(20);
      expect(retrieved.harvestCounts['lavande']).toBe(12);
    });
  });

  describe('herb/plant mesh detection', () => {
    it('identifies herbal meshes by name prefix', () => {
      expect(HerbalismSystem.isHerbalMesh('herb_lavender_1')).toBe(true);
      expect(HerbalismSystem.isHerbalMesh('plant_rosemary')).toBe(true);
      expect(HerbalismSystem.isHerbalMesh('flower_rose_1')).toBe(true);
      expect(HerbalismSystem.isHerbalMesh('Herb_Mint')).toBe(true);
    });

    it('identifies herbal meshes by metadata locationType', () => {
      expect(HerbalismSystem.isHerbalMesh('some_mesh', { locationType: 'garden' })).toBe(true);
      expect(HerbalismSystem.isHerbalMesh('some_mesh', { locationType: 'forest' })).toBe(true);
      expect(HerbalismSystem.isHerbalMesh('some_mesh', { locationType: 'meadow' })).toBe(true);
    });

    it('identifies herbal meshes by buildingType metadata', () => {
      expect(HerbalismSystem.isHerbalMesh('building_1', { buildingType: 'herb_shop' })).toBe(true);
      expect(HerbalismSystem.isHerbalMesh('building_1', { buildingType: 'Herb_Shop' })).toBe(true);
    });

    it('rejects non-herbal meshes', () => {
      expect(HerbalismSystem.isHerbalMesh('building_house')).toBe(false);
      expect(HerbalismSystem.isHerbalMesh('rock_granite', {})).toBe(false);
      expect(HerbalismSystem.isHerbalMesh('water_river', { locationType: 'river' })).toBe(false);
    });

    it('identifies herbal meshes by type name in mesh name', () => {
      expect(HerbalismSystem.isHerbalMesh('village_garden_area')).toBe(true);
      expect(HerbalismSystem.isHerbalMesh('dark_forest_edge')).toBe(true);
      expect(HerbalismSystem.isHerbalMesh('wild_meadow')).toBe(true);
    });

    it('recognizes all herbable location types', () => {
      for (const type of HERBABLE_LOCATION_TYPES) {
        expect(HerbalismSystem.isHerbalMesh(`test_${type}_mesh`)).toBe(true);
      }
    });
  });

  describe('distance calculation', () => {
    it('returns 0 when player is within mesh radius', () => {
      const dist = HerbalismSystem.distanceToHerbalMesh(5, 5, 5, 5, 3);
      expect(dist).toBe(0);
    });

    it('returns positive distance when player is outside mesh radius', () => {
      const dist = HerbalismSystem.distanceToHerbalMesh(10, 0, 0, 0, 3);
      expect(dist).toBeCloseTo(7, 1);
    });

    it('returns 0 when player is exactly at mesh edge', () => {
      const dist = HerbalismSystem.distanceToHerbalMesh(3, 0, 0, 0, 3);
      expect(dist).toBe(0);
    });
  });

  describe('respawn tracking', () => {
    it('allows harvest at a new location', () => {
      const { system } = createSystem();
      expect(system.canHarvestAt('garden_1', 1)).toBe(true);
    });

    it('blocks harvest at recently harvested location', () => {
      const { system } = createSystem();
      system.markHarvested('garden_1', 1);
      expect(system.canHarvestAt('garden_1', 1)).toBe(false);
    });

    it('allows harvest after respawn cooldown', () => {
      const { system } = createSystem();
      system.markHarvested('garden_1', 1);
      expect(system.canHarvestAt('garden_1', 1 + RESPAWN_COOLDOWN_DAYS)).toBe(true);
    });

    it('isLocationRespawned returns true for unknown location', () => {
      const { system } = createSystem();
      expect(system.isLocationRespawned('unknown_loc', 5)).toBe(true);
    });
  });

  describe('event bus integration', () => {
    it('handles herbalism action completed events', () => {
      const { system, eventBus, callbacks } = createSystem();
      Math.random = () => 0.90;

      eventBus.emit({
        type: 'physical_action_completed',
        actionType: 'herbalism',
        locationId: 'garden_1',
        itemsProduced: [],
        energyCost: 5,
        xpGained: 8,
      });

      expect(callbacks.addInventoryItem).toHaveBeenCalled();
      expect(callbacks.showToast).toHaveBeenCalled();
    });

    it('ignores non-herbalism action events', () => {
      const { system, eventBus, callbacks } = createSystem();

      eventBus.emit({
        type: 'physical_action_completed',
        actionType: 'mining',
        locationId: 'mine_1',
        itemsProduced: [],
        energyCost: 20,
        xpGained: 20,
      });

      expect(callbacks.addInventoryItem).not.toHaveBeenCalled();
    });
  });

  describe('quest helpers', () => {
    it('hasHarvestedAtLeast returns false when not enough harvested', () => {
      const { system } = createSystem();
      expect(system.hasHarvestedAtLeast('lavande', 5)).toBe(false);
    });

    it('hasHarvestedAtLeast returns true when threshold met', () => {
      const { system } = createSystem();
      Math.random = () => 0.06; // basilic
      system.resolveHarvest();
      system.resolveHarvest();
      system.resolveHarvest();
      expect(system.hasHarvestedAtLeast('basilic', 3)).toBe(true);
    });

    it('getTotalHarvests tracks all successful harvests', () => {
      const { system } = createSystem();
      Math.random = () => 0.90;
      system.resolveHarvest();

      Math.random = () => 0.06; // basilic
      system.resolveHarvest();

      expect(system.getTotalHarvests()).toBe(2);
    });

    it('getUniquePlantsHarvested counts distinct plant types', () => {
      const { system } = createSystem();
      Math.random = () => 0.06; // basilic
      system.resolveHarvest();

      Math.random = () => 0.15; // sauge
      system.resolveHarvest();

      expect(system.getUniquePlantsHarvested()).toBe(2);
    });
  });

  describe('PlayerActionSystem herbalism definition', () => {
    it('has energy cost of 5', () => {
      expect(ACTION_DEFINITIONS.herbalism.energyCost).toBe(5);
    });

    it('does not require a tool (basket is optional bonus)', () => {
      expect(ACTION_DEFINITIONS.herbalism.requiredTool).toBeUndefined();
    });

    it('has correct plant type item rewards', () => {
      const rewards = ACTION_DEFINITIONS.herbalism.itemRewards;
      const names = rewards.map(r => r.itemName);
      expect(names).toContain('lavande');
      expect(names).toContain('romarin');
      expect(names).toContain('menthe');
      expect(names).toContain('rose');
      expect(names).toContain('thym');
      expect(names).toContain('sauge');
      expect(names).toContain('basilic');
      expect(names).toContain('fleur_sauvage');
    });

    it('has proper harvest chances', () => {
      const rewards = ACTION_DEFINITIONS.herbalism.itemRewards;
      expect(rewards.find(r => r.itemName === 'lavande')!.chance).toBe(0.20);
      expect(rewards.find(r => r.itemName === 'romarin')!.chance).toBe(0.20);
      expect(rewards.find(r => r.itemName === 'menthe')!.chance).toBe(0.15);
      expect(rewards.find(r => r.itemName === 'basilic')!.chance).toBe(0.05);
    });

    it('includes garden and forest in valid locations', () => {
      const locs = ACTION_DEFINITIONS.herbalism.validLocations;
      expect(locs).toContain('garden');
      expect(locs).toContain('forest');
      expect(locs).toContain('meadow');
      expect(locs).toContain('herb_shop');
    });

    it('has duration of 4 seconds', () => {
      expect(ACTION_DEFINITIONS.herbalism.duration).toBe(4);
    });

    it('prompt verb is Pick', () => {
      expect(ACTION_DEFINITIONS.herbalism.promptVerb).toBe('Pick');
    });
  });

  describe('dispose', () => {
    it('unsubscribes from event bus', () => {
      const { system, eventBus, callbacks } = createSystem();
      system.dispose();

      Math.random = () => 0.90;
      eventBus.emit({
        type: 'physical_action_completed',
        actionType: 'herbalism',
        locationId: 'garden_1',
        itemsProduced: [],
        energyCost: 5,
        xpGained: 8,
      });

      expect(callbacks.addInventoryItem).not.toHaveBeenCalled();
    });
  });

  describe('constants', () => {
    it('HERBALISM_HOTSPOT_RADIUS is 5 meters', () => {
      expect(HERBALISM_HOTSPOT_RADIUS).toBe(5);
    });

    it('NOTHING_BASE_CHANCE is 5%', () => {
      expect(NOTHING_BASE_CHANCE).toBe(0.05);
    });

    it('BASKET_BONUS is 10%', () => {
      expect(BASKET_BONUS).toBe(0.10);
    });

    it('MAX_HERBALISM_SKILL is 10', () => {
      expect(MAX_HERBALISM_SKILL).toBe(10);
    });

    it('SKILL_XP_THRESHOLDS has entries for levels 0 through MAX_HERBALISM_SKILL', () => {
      expect(SKILL_XP_THRESHOLDS).toHaveLength(MAX_HERBALISM_SKILL + 1);
    });

    it('SKILL_HARVEST_BONUS_PER_LEVEL is 2%', () => {
      expect(SKILL_HARVEST_BONUS_PER_LEVEL).toBe(0.02);
    });

    it('HARVEST_ENERGY_COST is 5', () => {
      expect(HARVEST_ENERGY_COST).toBe(5);
    });

    it('RESPAWN_COOLDOWN_DAYS is 1', () => {
      expect(RESPAWN_COOLDOWN_DAYS).toBe(1);
    });

    it('herbable location types include garden, forest, meadow, herb_shop', () => {
      expect(HERBABLE_LOCATION_TYPES).toContain('garden');
      expect(HERBABLE_LOCATION_TYPES).toContain('forest');
      expect(HERBABLE_LOCATION_TYPES).toContain('meadow');
      expect(HERBABLE_LOCATION_TYPES).toContain('herb_shop');
    });
  });
});
