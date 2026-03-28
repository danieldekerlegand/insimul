/**
 * Tests for FishingSystem
 *
 * Validates fishing catch probability, skill progression, water detection,
 * rod bonuses, vocabulary data, and quest objective helpers.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameEventBus } from '../../logic/GameEventBus';
import {
  FishingSystem,
  FISH_TYPES,
  NOTHING_BASE_CHANCE,
  ROD_BONUS,
  MAX_FISHING_SKILL,
  SKILL_XP_THRESHOLDS,
  FISHING_HOTSPOT_RADIUS,
  FISHABLE_WATER_TYPES,
  type FishingSystemCallbacks,
  type FishingSkillState,
} from '../../logic/FishingSystem';
import { ACTION_DEFINITIONS } from '../PlayerActionSystem';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createCallbacks(overrides: Partial<FishingSystemCallbacks> = {}): FishingSystemCallbacks {
  return {
    showToast: vi.fn(),
    addInventoryItem: vi.fn(),
    hasInventoryItem: vi.fn().mockReturnValue(false),
    ...overrides,
  };
}

function createSystem(callbackOverrides: Partial<FishingSystemCallbacks> = {}) {
  const eventBus = new GameEventBus();
  const callbacks = createCallbacks(callbackOverrides);
  const system = new FishingSystem(callbacks);
  system.setEventBus(eventBus);
  return { system, eventBus, callbacks };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('FishingSystem', () => {
  let origRandom: () => number;

  beforeEach(() => {
    origRandom = Math.random;
  });

  afterEach(() => {
    Math.random = origRandom;
  });

  describe('fish type definitions', () => {
    it('defines exactly 3 fish types', () => {
      expect(FISH_TYPES).toHaveLength(3);
    });

    it('has common, rare, and legendary fish', () => {
      const rarities = FISH_TYPES.map(f => f.rarity);
      expect(rarities).toContain('common');
      expect(rarities).toContain('rare');
      expect(rarities).toContain('legendary');
    });

    it('base chances sum to 95% (leaving 5% for nothing)', () => {
      const totalChance = FISH_TYPES.reduce((sum, f) => sum + f.baseChance, 0);
      expect(totalChance + NOTHING_BASE_CHANCE).toBeCloseTo(1.0, 5);
    });

    it('each fish has French name, English name, and language data', () => {
      for (const fish of FISH_TYPES) {
        expect(fish.nameFr).toBeTruthy();
        expect(fish.nameEn).toBeTruthy();
        expect(fish.languageData.targetWord).toBeTruthy();
        expect(fish.languageData.nativeWord).toBeTruthy();
        expect(fish.languageData.pronunciation).toBeTruthy();
        expect(fish.languageData.exampleSentence).toBeTruthy();
      }
    });

    it('common fish is Poisson (60%), rare is Truite (25%), legendary is Saumon (10%)', () => {
      const common = FISH_TYPES.find(f => f.id === 'common_fish')!;
      expect(common.nameFr).toBe('Poisson');
      expect(common.baseChance).toBe(0.60);

      const rare = FISH_TYPES.find(f => f.id === 'rare_fish')!;
      expect(rare.nameFr).toBe('Truite');
      expect(rare.baseChance).toBe(0.25);

      const legendary = FISH_TYPES.find(f => f.id === 'legendary_fish')!;
      expect(legendary.nameFr).toBe('Saumon');
      expect(legendary.baseChance).toBe(0.10);
    });
  });

  describe('rollCatch', () => {
    it('returns nothing when roll falls in nothing bucket', () => {
      const { system } = createSystem();
      // Nothing bucket is 0 to 0.05
      Math.random = () => 0.01;
      const result = system.rollCatch(false);
      expect(result.caught).toBe(false);
      expect(result.fish).toBeNull();
    });

    it('returns legendary fish when roll falls in legendary bucket', () => {
      const { system } = createSystem();
      // After nothing (0.05), legendary is 0.05 to 0.15
      Math.random = () => 0.10;
      const result = system.rollCatch(false);
      expect(result.caught).toBe(true);
      expect(result.fish?.rarity).toBe('legendary');
    });

    it('returns rare fish when roll falls in rare bucket', () => {
      const { system } = createSystem();
      // After legendary (0.15), rare is 0.15 to 0.40
      Math.random = () => 0.25;
      const result = system.rollCatch(false);
      expect(result.caught).toBe(true);
      expect(result.fish?.rarity).toBe('rare');
    });

    it('returns common fish when roll falls in common bucket', () => {
      const { system } = createSystem();
      // After rare (0.40), common is 0.40 to 1.0
      Math.random = () => 0.75;
      const result = system.rollCatch(false);
      expect(result.caught).toBe(true);
      expect(result.fish?.rarity).toBe('common');
    });

    it('rod bonus increases rare/legendary chances', () => {
      const { system } = createSystem();
      // With rod, legendary chance increases, so a roll that would be rare without rod
      // might become legendary with rod
      let legendaryCountNoRod = 0;
      let legendaryCountWithRod = 0;
      const iterations = 10000;

      Math.random = origRandom;
      for (let i = 0; i < iterations; i++) {
        if (system.rollCatch(false).fish?.rarity === 'legendary') legendaryCountNoRod++;
      }
      for (let i = 0; i < iterations; i++) {
        if (system.rollCatch(true).fish?.rarity === 'legendary') legendaryCountWithRod++;
      }

      // With rod should have higher legendary rate
      expect(legendaryCountWithRod).toBeGreaterThan(legendaryCountNoRod);
    });

    it('never catches nothing when roll >= nothing chance', () => {
      const { system } = createSystem();
      Math.random = () => 0.06; // just above 0.05 nothing threshold
      const result = system.rollCatch(false);
      expect(result.caught).toBe(true);
      expect(result.fish).not.toBeNull();
    });
  });

  describe('resolveCatch', () => {
    it('adds caught fish to inventory', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.75; // common fish
      system.resolveCatch('river_1');
      expect(callbacks.addInventoryItem).toHaveBeenCalledWith('common_fish', 1);
    });

    it('shows vocabulary toast on catch', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.75; // common fish
      system.resolveCatch();
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Poisson'),
        }),
      );
    });

    it('shows "Nothing Bites" toast when no fish caught', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.01; // nothing
      system.resolveCatch();
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nothing Bites',
        }),
      );
    });

    it('does not add item to inventory when nothing caught', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.01; // nothing
      system.resolveCatch();
      expect(callbacks.addInventoryItem).not.toHaveBeenCalled();
    });

    it('checks for fishing rod via hasInventoryItem', () => {
      const hasItem = vi.fn().mockReturnValue(true);
      const { system } = createSystem({ hasInventoryItem: hasItem });
      Math.random = () => 0.75;
      system.resolveCatch();
      expect(hasItem).toHaveBeenCalledWith('fishing_rod');
    });
  });

  describe('fishing skill progression', () => {
    it('starts at level 0 with 0 catches', () => {
      const { system } = createSystem();
      const skill = system.getSkill();
      expect(skill.level).toBe(0);
      expect(skill.totalCatches).toBe(0);
    });

    it('increments total catches on successful catch', () => {
      const { system } = createSystem();
      Math.random = () => 0.75; // common fish
      system.resolveCatch();
      expect(system.getSkill().totalCatches).toBe(1);
    });

    it('does not increment catches on nothing', () => {
      const { system } = createSystem();
      Math.random = () => 0.01; // nothing
      system.resolveCatch();
      expect(system.getSkill().totalCatches).toBe(0);
    });

    it('levels up at correct thresholds', () => {
      const { system } = createSystem();
      Math.random = () => 0.75; // always catch common fish

      // Level 1 at 3 catches
      for (let i = 0; i < 3; i++) system.resolveCatch();
      expect(system.getSkillLevel()).toBe(1);
    });

    it('shows level up toast', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.75;

      // Level 1 at 3 catches
      for (let i = 0; i < 3; i++) system.resolveCatch();
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Fishing Skill Up!',
        }),
      );
    });

    it('tracks catch counts per fish type', () => {
      const { system } = createSystem();
      Math.random = () => 0.75; // common
      system.resolveCatch();
      system.resolveCatch();

      Math.random = () => 0.10; // legendary
      system.resolveCatch();

      const skill = system.getSkill();
      expect(skill.catchCounts['common_fish']).toBe(2);
      expect(skill.catchCounts['legendary_fish']).toBe(1);
    });

    it('caps at MAX_FISHING_SKILL', () => {
      const { system } = createSystem();
      Math.random = () => 0.75;

      // Force enough catches to max out
      const state: FishingSkillState = {
        level: MAX_FISHING_SKILL,
        totalCatches: 999,
        catchCounts: {},
      };
      system.setSkillState(state);

      system.resolveCatch();
      expect(system.getSkillLevel()).toBe(MAX_FISHING_SKILL);
    });

    it('skill improves catch rates (reduces nothing chance)', () => {
      const { system } = createSystem();

      // At skill 0, roll 0.04 gives nothing
      Math.random = () => 0.04;
      const result0 = system.rollCatch(false);
      expect(result0.caught).toBe(false);

      // At skill 5, nothing chance is reduced by 5 * 0.02 = 0.10 → effectively 0
      system.setSkillState({ level: 5, totalCatches: 40, catchCounts: {} });
      const result5 = system.rollCatch(false);
      expect(result5.caught).toBe(true);
    });

    it('setSkillState and getSkill round-trip correctly', () => {
      const { system } = createSystem();
      const state: FishingSkillState = {
        level: 3,
        totalCatches: 20,
        catchCounts: { common_fish: 15, rare_fish: 5 },
      };
      system.setSkillState(state);
      const retrieved = system.getSkill();
      expect(retrieved.level).toBe(3);
      expect(retrieved.totalCatches).toBe(20);
      expect(retrieved.catchCounts['common_fish']).toBe(15);
    });
  });

  describe('water detection', () => {
    it('identifies water meshes by name prefix', () => {
      expect(FishingSystem.isWaterMesh('water_river_1')).toBe(true);
      expect(FishingSystem.isWaterMesh('water_lake_main')).toBe(true);
      expect(FishingSystem.isWaterMesh('Water_Pond')).toBe(true);
    });

    it('identifies water meshes by metadata waterType', () => {
      expect(FishingSystem.isWaterMesh('some_mesh', { waterType: 'river' })).toBe(true);
      expect(FishingSystem.isWaterMesh('some_mesh', { waterType: 'lake' })).toBe(true);
      expect(FishingSystem.isWaterMesh('some_mesh', { waterType: 'pond' })).toBe(true);
    });

    it('rejects non-water meshes', () => {
      expect(FishingSystem.isWaterMesh('building_house')).toBe(false);
      expect(FishingSystem.isWaterMesh('tree_oak', {})).toBe(false);
      expect(FishingSystem.isWaterMesh('ground_terrain', { waterType: 'ocean' })).toBe(false);
    });

    it('identifies water meshes by type name in mesh name', () => {
      expect(FishingSystem.isWaterMesh('big_river_section')).toBe(true);
      expect(FishingSystem.isWaterMesh('small_pond_area')).toBe(true);
      expect(FishingSystem.isWaterMesh('town_lake')).toBe(true);
    });

    it('recognizes all fishable water types', () => {
      for (const type of FISHABLE_WATER_TYPES) {
        expect(FishingSystem.isWaterMesh(`test_${type}_mesh`)).toBe(true);
      }
    });
  });

  describe('distance calculation', () => {
    it('returns 0 when player is within mesh radius', () => {
      const dist = FishingSystem.distanceToWaterMesh(5, 5, 5, 5, 3);
      expect(dist).toBe(0);
    });

    it('returns positive distance when player is outside mesh radius', () => {
      const dist = FishingSystem.distanceToWaterMesh(10, 0, 0, 0, 3);
      expect(dist).toBeCloseTo(7, 1);
    });

    it('returns 0 when player is exactly at mesh edge', () => {
      const dist = FishingSystem.distanceToWaterMesh(3, 0, 0, 0, 3);
      expect(dist).toBe(0);
    });
  });

  describe('event bus integration', () => {
    it('handles fishing action completed events', () => {
      const { system, eventBus, callbacks } = createSystem();
      Math.random = () => 0.75; // common fish

      eventBus.emit({
        type: 'physical_action_completed',
        actionType: 'fishing',
        locationId: 'river_1',
        itemsProduced: [],
        energyCost: 15,
        xpGained: 15,
      });

      // Should have resolved catch (vocabulary toast + inventory)
      expect(callbacks.addInventoryItem).toHaveBeenCalled();
      expect(callbacks.showToast).toHaveBeenCalled();
    });

    it('ignores non-fishing action events', () => {
      const { system, eventBus, callbacks } = createSystem();

      eventBus.emit({
        type: 'physical_action_completed',
        actionType: 'mining',
        locationId: 'mine_1',
        itemsProduced: [],
        energyCost: 8,
        xpGained: 20,
      });

      expect(callbacks.addInventoryItem).not.toHaveBeenCalled();
    });
  });

  describe('quest helpers', () => {
    it('hasCaughtAtLeast returns false when not enough caught', () => {
      const { system } = createSystem();
      expect(system.hasCaughtAtLeast('common_fish', 3)).toBe(false);
    });

    it('hasCaughtAtLeast returns true when threshold met', () => {
      const { system } = createSystem();
      Math.random = () => 0.75; // common fish
      system.resolveCatch();
      system.resolveCatch();
      system.resolveCatch();
      expect(system.hasCaughtAtLeast('common_fish', 3)).toBe(true);
    });

    it('getTotalCatches tracks all successful catches', () => {
      const { system } = createSystem();
      Math.random = () => 0.75; // common
      system.resolveCatch();

      Math.random = () => 0.10; // legendary
      system.resolveCatch();

      expect(system.getTotalCatches()).toBe(2);
    });
  });

  describe('PlayerActionSystem fishing definition', () => {
    it('has energy cost of 15', () => {
      expect(ACTION_DEFINITIONS.fishing.energyCost).toBe(15);
    });

    it('does not require a tool (fishing rod is optional)', () => {
      expect(ACTION_DEFINITIONS.fishing.requiredTool).toBeUndefined();
    });

    it('has correct fish type item rewards', () => {
      const rewards = ACTION_DEFINITIONS.fishing.itemRewards;
      const names = rewards.map(r => r.itemName);
      expect(names).toContain('common_fish');
      expect(names).toContain('rare_fish');
      expect(names).toContain('legendary_fish');
    });

    it('has proper catch chances (60%, 25%, 10%)', () => {
      const rewards = ACTION_DEFINITIONS.fishing.itemRewards;
      const common = rewards.find(r => r.itemName === 'common_fish')!;
      const rare = rewards.find(r => r.itemName === 'rare_fish')!;
      const legendary = rewards.find(r => r.itemName === 'legendary_fish')!;

      expect(common.chance).toBe(0.60);
      expect(rare.chance).toBe(0.25);
      expect(legendary.chance).toBe(0.10);
    });

    it('includes water body types in valid locations', () => {
      const locs = ACTION_DEFINITIONS.fishing.validLocations;
      expect(locs).toContain('river');
      expect(locs).toContain('lake');
      expect(locs).toContain('pond');
      expect(locs).toContain('water');
    });

    it('has duration of 10 seconds', () => {
      expect(ACTION_DEFINITIONS.fishing.duration).toBe(10);
    });
  });

  describe('dispose', () => {
    it('unsubscribes from event bus', () => {
      const { system, eventBus, callbacks } = createSystem();
      system.dispose();

      Math.random = () => 0.75;
      eventBus.emit({
        type: 'physical_action_completed',
        actionType: 'fishing',
        locationId: 'river_1',
        itemsProduced: [],
        energyCost: 15,
        xpGained: 15,
      });

      // Should not have processed the event after dispose
      expect(callbacks.addInventoryItem).not.toHaveBeenCalled();
    });
  });

  describe('constants', () => {
    it('FISHING_HOTSPOT_RADIUS is 5 meters', () => {
      expect(FISHING_HOTSPOT_RADIUS).toBe(5);
    });

    it('NOTHING_BASE_CHANCE is 5%', () => {
      expect(NOTHING_BASE_CHANCE).toBe(0.05);
    });

    it('ROD_BONUS is 15%', () => {
      expect(ROD_BONUS).toBe(0.15);
    });

    it('MAX_FISHING_SKILL is 10', () => {
      expect(MAX_FISHING_SKILL).toBe(10);
    });

    it('SKILL_XP_THRESHOLDS has entries for levels 0 through MAX_FISHING_SKILL', () => {
      expect(SKILL_XP_THRESHOLDS).toHaveLength(MAX_FISHING_SKILL + 1);
    });

    it('fishable water types include river, lake, pond', () => {
      expect(FISHABLE_WATER_TYPES).toContain('river');
      expect(FISHABLE_WATER_TYPES).toContain('lake');
      expect(FISHABLE_WATER_TYPES).toContain('pond');
    });
  });
});
