/**
 * Tests for MiningSystem
 *
 * Validates mineral probability, skill progression, rock/ore detection,
 * pickaxe bonuses, vocabulary data, and quest objective helpers.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameEventBus } from '../../logic/GameEventBus';
import {
  MiningSystem,
  MINERAL_TYPES,
  NOTHING_BASE_CHANCE,
  PICKAXE_BONUS,
  MAX_MINING_SKILL,
  SKILL_XP_THRESHOLDS,
  MINING_HOTSPOT_RADIUS,
  MINEABLE_LOCATION_TYPES,
  SKILL_MINE_BONUS_PER_LEVEL,
  type MiningSystemCallbacks,
  type MiningSkillState,
} from '../../logic/MiningSystem';
import { ACTION_DEFINITIONS } from '../PlayerActionSystem';

// -- Helpers ------------------------------------------------------------------

function createCallbacks(overrides: Partial<MiningSystemCallbacks> = {}): MiningSystemCallbacks {
  return {
    showToast: vi.fn(),
    addInventoryItem: vi.fn(),
    hasInventoryItem: vi.fn().mockReturnValue(false),
    ...overrides,
  };
}

function createSystem(callbackOverrides: Partial<MiningSystemCallbacks> = {}) {
  const eventBus = new GameEventBus();
  const callbacks = createCallbacks(callbackOverrides);
  const system = new MiningSystem(callbacks);
  system.setEventBus(eventBus);
  return { system, eventBus, callbacks };
}

// -- Tests --------------------------------------------------------------------

describe('MiningSystem', () => {
  let origRandom: () => number;

  beforeEach(() => {
    origRandom = Math.random;
  });

  afterEach(() => {
    Math.random = origRandom;
  });

  describe('mineral type definitions', () => {
    it('defines exactly 5 mineral types', () => {
      expect(MINERAL_TYPES).toHaveLength(5);
    });

    it('has stone, iron_ore, copper_ore, gem, and rare_gem', () => {
      const ids = MINERAL_TYPES.map(m => m.id);
      expect(ids).toContain('stone');
      expect(ids).toContain('iron_ore');
      expect(ids).toContain('copper_ore');
      expect(ids).toContain('gem');
      expect(ids).toContain('rare_gem');
    });

    it('base chances sum to 95% (leaving 5% for nothing)', () => {
      const totalChance = MINERAL_TYPES.reduce((sum, m) => sum + m.baseChance, 0);
      expect(totalChance + NOTHING_BASE_CHANCE).toBeCloseTo(1.0, 5);
    });

    it('each mineral has French name, English name, and language data', () => {
      for (const mineral of MINERAL_TYPES) {
        expect(mineral.nameFr).toBeTruthy();
        expect(mineral.nameEn).toBeTruthy();
        expect(mineral.languageData.targetWord).toBeTruthy();
        expect(mineral.languageData.nativeWord).toBeTruthy();
        expect(mineral.languageData.pronunciation).toBeTruthy();
        expect(mineral.languageData.exampleSentence).toBeTruthy();
      }
    });

    it('stone is 45%, iron_ore is 25%, copper_ore is 15%, gem is 8%, rare_gem is 2%', () => {
      const stone = MINERAL_TYPES.find(m => m.id === 'stone')!;
      expect(stone.baseChance).toBe(0.45);
      expect(stone.nameFr).toBe('Pierre');

      const iron = MINERAL_TYPES.find(m => m.id === 'iron_ore')!;
      expect(iron.baseChance).toBe(0.25);
      expect(iron.languageData.targetWord).toBe('fer');

      const copper = MINERAL_TYPES.find(m => m.id === 'copper_ore')!;
      expect(copper.baseChance).toBe(0.15);
      expect(copper.languageData.targetWord).toBe('cuivre');

      const gem = MINERAL_TYPES.find(m => m.id === 'gem')!;
      expect(gem.baseChance).toBe(0.08);
      expect(gem.languageData.targetWord).toBe('rubis');

      const rareGem = MINERAL_TYPES.find(m => m.id === 'rare_gem')!;
      expect(rareGem.baseChance).toBe(0.02);
      expect(rareGem.languageData.targetWord).toBe('émeraude');
    });
  });

  describe('rollMine', () => {
    it('returns nothing when roll falls in nothing bucket', () => {
      const { system } = createSystem();
      // Nothing bucket is 0 to 0.05
      Math.random = () => 0.01;
      const result = system.rollMine(false);
      expect(result.found).toBe(false);
      expect(result.mineral).toBeNull();
    });

    it('returns rare_gem when roll falls in rare_gem bucket', () => {
      const { system } = createSystem();
      // After nothing (0.05), rare_gem is 0.05 to 0.07
      Math.random = () => 0.06;
      const result = system.rollMine(false);
      expect(result.found).toBe(true);
      expect(result.mineral?.id).toBe('rare_gem');
    });

    it('returns gem when roll falls in gem bucket', () => {
      const { system } = createSystem();
      // After rare_gem (0.07), gem is 0.07 to 0.15
      Math.random = () => 0.10;
      const result = system.rollMine(false);
      expect(result.found).toBe(true);
      expect(result.mineral?.id).toBe('gem');
    });

    it('returns copper_ore when roll falls in copper bucket', () => {
      const { system } = createSystem();
      // After gem (0.15), copper is 0.15 to 0.30
      Math.random = () => 0.20;
      const result = system.rollMine(false);
      expect(result.found).toBe(true);
      expect(result.mineral?.id).toBe('copper_ore');
    });

    it('returns iron_ore when roll falls in iron bucket', () => {
      const { system } = createSystem();
      // After copper (0.30), iron is 0.30 to 0.55
      Math.random = () => 0.40;
      const result = system.rollMine(false);
      expect(result.found).toBe(true);
      expect(result.mineral?.id).toBe('iron_ore');
    });

    it('returns stone when roll falls in stone bucket (remainder)', () => {
      const { system } = createSystem();
      Math.random = () => 0.80;
      const result = system.rollMine(false);
      expect(result.found).toBe(true);
      expect(result.mineral?.id).toBe('stone');
    });

    it('pickaxe bonus increases rare mineral chances', () => {
      const { system } = createSystem();
      let rareCountNoPickaxe = 0;
      let rareCountWithPickaxe = 0;
      const iterations = 10000;

      Math.random = origRandom;
      for (let i = 0; i < iterations; i++) {
        const r = system.rollMine(false);
        if (r.mineral?.rarity === 'legendary' || r.mineral?.rarity === 'epic') rareCountNoPickaxe++;
      }
      for (let i = 0; i < iterations; i++) {
        const r = system.rollMine(true);
        if (r.mineral?.rarity === 'legendary' || r.mineral?.rarity === 'epic') rareCountWithPickaxe++;
      }

      expect(rareCountWithPickaxe).toBeGreaterThan(rareCountNoPickaxe);
    });

    it('pickaxe grants bonusItem flag', () => {
      const { system } = createSystem();
      Math.random = () => 0.80; // stone
      const result = system.rollMine(true);
      expect(result.bonusItem).toBe(true);
    });

    it('no pickaxe means no bonusItem', () => {
      const { system } = createSystem();
      Math.random = () => 0.80; // stone
      const result = system.rollMine(false);
      expect(result.bonusItem).toBe(false);
    });

    it('never finds nothing when roll >= nothing chance', () => {
      const { system } = createSystem();
      Math.random = () => 0.06; // just above 0.05 nothing threshold
      const result = system.rollMine(false);
      expect(result.found).toBe(true);
      expect(result.mineral).not.toBeNull();
    });
  });

  describe('resolveMine', () => {
    it('adds mined mineral to inventory', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.80; // stone
      system.resolveMine('mine_1');
      expect(callbacks.addInventoryItem).toHaveBeenCalledWith('stone', 1);
    });

    it('adds extra item with pickaxe bonus', () => {
      const hasItem = vi.fn().mockReturnValue(true);
      const { system, callbacks } = createSystem({ hasInventoryItem: hasItem });
      Math.random = () => 0.80; // stone
      system.resolveMine('mine_1');
      // 1 base + 1 bonus = 2
      expect(callbacks.addInventoryItem).toHaveBeenCalledWith('stone', 2);
    });

    it('shows vocabulary toast on find', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.80; // stone
      system.resolveMine();
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Pierre'),
        }),
      );
    });

    it('shows "Nothing Found" toast when no mineral found', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.01; // nothing
      system.resolveMine();
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nothing Found',
        }),
      );
    });

    it('does not add item to inventory when nothing found', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.01; // nothing
      system.resolveMine();
      expect(callbacks.addInventoryItem).not.toHaveBeenCalled();
    });

    it('checks for pickaxe via hasInventoryItem', () => {
      const hasItem = vi.fn().mockReturnValue(false);
      const { system } = createSystem({ hasInventoryItem: hasItem });
      Math.random = () => 0.80;
      system.resolveMine();
      expect(hasItem).toHaveBeenCalledWith('pickaxe');
    });
  });

  describe('mining skill progression', () => {
    it('starts at level 0 with 0 mines', () => {
      const { system } = createSystem();
      const skill = system.getSkill();
      expect(skill.level).toBe(0);
      expect(skill.totalMines).toBe(0);
    });

    it('increments total mines on successful mine', () => {
      const { system } = createSystem();
      Math.random = () => 0.80; // stone
      system.resolveMine();
      expect(system.getSkill().totalMines).toBe(1);
    });

    it('does not increment mines on nothing', () => {
      const { system } = createSystem();
      Math.random = () => 0.01; // nothing
      system.resolveMine();
      expect(system.getSkill().totalMines).toBe(0);
    });

    it('levels up at correct thresholds', () => {
      const { system } = createSystem();
      Math.random = () => 0.80; // always find stone

      // Level 1 at 3 mines
      for (let i = 0; i < 3; i++) system.resolveMine();
      expect(system.getSkillLevel()).toBe(1);
    });

    it('shows level up toast', () => {
      const { system, callbacks } = createSystem();
      Math.random = () => 0.80;

      for (let i = 0; i < 3; i++) system.resolveMine();
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Mining Skill Up!',
        }),
      );
    });

    it('tracks mine counts per mineral type', () => {
      const { system } = createSystem();
      Math.random = () => 0.80; // stone
      system.resolveMine();
      system.resolveMine();

      Math.random = () => 0.06; // rare_gem
      system.resolveMine();

      const skill = system.getSkill();
      expect(skill.mineCounts['stone']).toBe(2);
      expect(skill.mineCounts['rare_gem']).toBe(1);
    });

    it('caps at MAX_MINING_SKILL', () => {
      const { system } = createSystem();
      Math.random = () => 0.80;

      const state: MiningSkillState = {
        level: MAX_MINING_SKILL,
        totalMines: 999,
        mineCounts: {},
      };
      system.setSkillState(state);

      system.resolveMine();
      expect(system.getSkillLevel()).toBe(MAX_MINING_SKILL);
    });

    it('skill improves mine rates (reduces nothing chance)', () => {
      const { system } = createSystem();

      // At skill 0, roll 0.04 gives nothing
      Math.random = () => 0.04;
      const result0 = system.rollMine(false);
      expect(result0.found).toBe(false);

      // At skill 5, nothing chance is reduced by 5 * 0.02 = 0.10 -> effectively 0
      system.setSkillState({ level: 5, totalMines: 40, mineCounts: {} });
      const result5 = system.rollMine(false);
      expect(result5.found).toBe(true);
    });

    it('setSkillState and getSkill round-trip correctly', () => {
      const { system } = createSystem();
      const state: MiningSkillState = {
        level: 3,
        totalMines: 20,
        mineCounts: { stone: 12, iron_ore: 8 },
      };
      system.setSkillState(state);
      const retrieved = system.getSkill();
      expect(retrieved.level).toBe(3);
      expect(retrieved.totalMines).toBe(20);
      expect(retrieved.mineCounts['stone']).toBe(12);
    });
  });

  describe('rock/ore detection', () => {
    it('identifies mineable meshes by name prefix', () => {
      expect(MiningSystem.isMineableMesh('rock_granite_1')).toBe(true);
      expect(MiningSystem.isMineableMesh('ore_iron_deposit')).toBe(true);
      expect(MiningSystem.isMineableMesh('Rock_Large')).toBe(true);
    });

    it('identifies mineable meshes by metadata locationType', () => {
      expect(MiningSystem.isMineableMesh('some_mesh', { locationType: 'mine' })).toBe(true);
      expect(MiningSystem.isMineableMesh('some_mesh', { locationType: 'quarry' })).toBe(true);
      expect(MiningSystem.isMineableMesh('some_mesh', { locationType: 'cave' })).toBe(true);
    });

    it('identifies mineable meshes by buildingType metadata', () => {
      expect(MiningSystem.isMineableMesh('building_1', { buildingType: 'Mine' })).toBe(true);
      expect(MiningSystem.isMineableMesh('building_2', { buildingType: 'Blacksmith' })).toBe(true);
    });

    it('rejects non-mineable meshes', () => {
      expect(MiningSystem.isMineableMesh('building_house')).toBe(false);
      expect(MiningSystem.isMineableMesh('tree_oak', {})).toBe(false);
      expect(MiningSystem.isMineableMesh('ground_terrain', { locationType: 'forest' })).toBe(false);
    });

    it('identifies mineable meshes by type name in mesh name', () => {
      expect(MiningSystem.isMineableMesh('old_mine_entrance')).toBe(true);
      expect(MiningSystem.isMineableMesh('stone_quarry_big')).toBe(true);
      expect(MiningSystem.isMineableMesh('dark_cave_area')).toBe(true);
      expect(MiningSystem.isMineableMesh('mountain_peak')).toBe(true);
    });

    it('recognizes all mineable location types', () => {
      for (const type of MINEABLE_LOCATION_TYPES) {
        expect(MiningSystem.isMineableMesh(`test_${type}_mesh`)).toBe(true);
      }
    });
  });

  describe('distance calculation', () => {
    it('returns 0 when player is within mesh radius', () => {
      const dist = MiningSystem.distanceToMineableMesh(5, 5, 5, 5, 3);
      expect(dist).toBe(0);
    });

    it('returns positive distance when player is outside mesh radius', () => {
      const dist = MiningSystem.distanceToMineableMesh(10, 0, 0, 0, 3);
      expect(dist).toBeCloseTo(7, 1);
    });

    it('returns 0 when player is exactly at mesh edge', () => {
      const dist = MiningSystem.distanceToMineableMesh(3, 0, 0, 0, 3);
      expect(dist).toBe(0);
    });
  });

  describe('event bus integration', () => {
    it('handles mining action completed events', () => {
      const { system, eventBus, callbacks } = createSystem();
      Math.random = () => 0.80; // stone

      eventBus.emit({
        type: 'physical_action_completed',
        actionType: 'mining',
        locationId: 'mine_1',
        itemsProduced: [],
        energyCost: 20,
        xpGained: 20,
      });

      expect(callbacks.addInventoryItem).toHaveBeenCalled();
      expect(callbacks.showToast).toHaveBeenCalled();
    });

    it('ignores non-mining action events', () => {
      const { system, eventBus, callbacks } = createSystem();

      eventBus.emit({
        type: 'physical_action_completed',
        actionType: 'fishing',
        locationId: 'river_1',
        itemsProduced: [],
        energyCost: 15,
        xpGained: 15,
      });

      expect(callbacks.addInventoryItem).not.toHaveBeenCalled();
    });
  });

  describe('quest helpers', () => {
    it('hasMinedAtLeast returns false when not enough mined', () => {
      const { system } = createSystem();
      expect(system.hasMinedAtLeast('iron_ore', 5)).toBe(false);
    });

    it('hasMinedAtLeast returns true when threshold met', () => {
      const { system } = createSystem();
      Math.random = () => 0.80; // stone
      system.resolveMine();
      system.resolveMine();
      system.resolveMine();
      expect(system.hasMinedAtLeast('stone', 3)).toBe(true);
    });

    it('getTotalMines tracks all successful mines', () => {
      const { system } = createSystem();
      Math.random = () => 0.80; // stone
      system.resolveMine();

      Math.random = () => 0.06; // rare_gem
      system.resolveMine();

      expect(system.getTotalMines()).toBe(2);
    });
  });

  describe('PlayerActionSystem mining definition', () => {
    it('has energy cost of 20', () => {
      expect(ACTION_DEFINITIONS.mining.energyCost).toBe(20);
    });

    it('does not require a tool (pickaxe is optional bonus)', () => {
      expect(ACTION_DEFINITIONS.mining.requiredTool).toBeUndefined();
    });

    it('has correct mineral type item rewards', () => {
      const rewards = ACTION_DEFINITIONS.mining.itemRewards;
      const names = rewards.map(r => r.itemName);
      expect(names).toContain('stone');
      expect(names).toContain('iron_ore');
      expect(names).toContain('copper_ore');
      expect(names).toContain('gem');
      expect(names).toContain('rare_gem');
    });

    it('has proper drop chances (50%, 25%, 15%, 8%, 2%)', () => {
      const rewards = ACTION_DEFINITIONS.mining.itemRewards;
      expect(rewards.find(r => r.itemName === 'stone')!.chance).toBe(0.45);
      expect(rewards.find(r => r.itemName === 'iron_ore')!.chance).toBe(0.25);
      expect(rewards.find(r => r.itemName === 'copper_ore')!.chance).toBe(0.15);
      expect(rewards.find(r => r.itemName === 'gem')!.chance).toBe(0.08);
      expect(rewards.find(r => r.itemName === 'rare_gem')!.chance).toBe(0.02);
    });

    it('includes mine and quarry in valid locations', () => {
      const locs = ACTION_DEFINITIONS.mining.validLocations;
      expect(locs).toContain('mine');
      expect(locs).toContain('quarry');
      expect(locs).toContain('rock');
      expect(locs).toContain('mountain');
      expect(locs).toContain('ore_deposit');
    });

    it('has duration of 8 seconds', () => {
      expect(ACTION_DEFINITIONS.mining.duration).toBe(8);
    });
  });

  describe('dispose', () => {
    it('unsubscribes from event bus', () => {
      const { system, eventBus, callbacks } = createSystem();
      system.dispose();

      Math.random = () => 0.80;
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

  describe('constants', () => {
    it('MINING_HOTSPOT_RADIUS is 5 meters', () => {
      expect(MINING_HOTSPOT_RADIUS).toBe(5);
    });

    it('NOTHING_BASE_CHANCE is 5%', () => {
      expect(NOTHING_BASE_CHANCE).toBe(0.05);
    });

    it('PICKAXE_BONUS is 10%', () => {
      expect(PICKAXE_BONUS).toBe(0.10);
    });

    it('MAX_MINING_SKILL is 10', () => {
      expect(MAX_MINING_SKILL).toBe(10);
    });

    it('SKILL_XP_THRESHOLDS has entries for levels 0 through MAX_MINING_SKILL', () => {
      expect(SKILL_XP_THRESHOLDS).toHaveLength(MAX_MINING_SKILL + 1);
    });

    it('SKILL_MINE_BONUS_PER_LEVEL is 2%', () => {
      expect(SKILL_MINE_BONUS_PER_LEVEL).toBe(0.02);
    });

    it('mineable location types include mine, quarry, rock', () => {
      expect(MINEABLE_LOCATION_TYPES).toContain('mine');
      expect(MINEABLE_LOCATION_TYPES).toContain('quarry');
      expect(MINEABLE_LOCATION_TYPES).toContain('rock');
    });
  });
});
