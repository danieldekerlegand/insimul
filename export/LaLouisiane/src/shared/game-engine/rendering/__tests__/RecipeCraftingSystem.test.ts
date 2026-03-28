/**
 * Tests for RecipeCraftingSystem
 *
 * Validates recipe definitions, ingredient checking, crafting flow,
 * skill progression, station detection, vocabulary display, event emission,
 * and quest helpers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameEventBus } from '../../logic/GameEventBus';
import {
  RecipeCraftingSystem,
  RECIPES,
  CRAFTING_STATIONS,
  MAX_CRAFTING_SKILL,
  SKILL_XP_THRESHOLDS,
  CRAFTING_HOTSPOT_RADIUS,
  type RecipeCraftingCallbacks,
  type CraftingSkillState,
  type CraftingStationType,
} from '../../logic/RecipeCraftingSystem';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createCallbacks(overrides: Partial<RecipeCraftingCallbacks> = {}): RecipeCraftingCallbacks {
  return {
    showToast: vi.fn(),
    addInventoryItem: vi.fn(),
    removeInventoryItem: vi.fn().mockReturnValue(true),
    getInventoryCount: vi.fn().mockReturnValue(99),
    ...overrides,
  };
}

function createSystem(callbackOverrides: Partial<RecipeCraftingCallbacks> = {}) {
  const eventBus = new GameEventBus();
  const callbacks = createCallbacks(callbackOverrides);
  const system = new RecipeCraftingSystem(callbacks);
  system.setEventBus(eventBus);
  return { system, eventBus, callbacks };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('RecipeCraftingSystem', () => {
  describe('recipe definitions', () => {
    it('defines 10 recipes', () => {
      expect(RECIPES).toHaveLength(10);
    });

    it('has recipes for all three station types', () => {
      const stations = new Set(RECIPES.map(r => r.station));
      expect(stations).toContain('kitchen_stove');
      expect(stations).toContain('alchemy_table');
      expect(stations).toContain('workbench');
    });

    it('each recipe has French name, English name, and language data', () => {
      for (const recipe of RECIPES) {
        expect(recipe.nameFr).toBeTruthy();
        expect(recipe.nameEn).toBeTruthy();
        expect(recipe.languageData.targetWord).toBeTruthy();
        expect(recipe.languageData.nativeWord).toBeTruthy();
        expect(recipe.languageData.pronunciation).toBeTruthy();
        expect(recipe.languageData.exampleSentence).toBeTruthy();
      }
    });

    it('each recipe has at least one ingredient', () => {
      for (const recipe of RECIPES) {
        expect(recipe.ingredients.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('each ingredient has French and English names', () => {
      for (const recipe of RECIPES) {
        for (const ing of recipe.ingredients) {
          expect(ing.nameFr).toBeTruthy();
          expect(ing.nameEn).toBeTruthy();
          expect(ing.itemId).toBeTruthy();
          expect(ing.quantity).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it('Soupe de Poisson requires fish + herbs', () => {
      const soup = RECIPES.find(r => r.id === 'soupe_de_poisson')!;
      expect(soup.nameFr).toBe('Soupe de Poisson');
      expect(soup.station).toBe('kitchen_stove');
      const ids = soup.ingredients.map(i => i.itemId);
      expect(ids).toContain('common_fish');
      expect(ids).toContain('romarin');
      expect(soup.resultItemId).toBe('prepared_soup');
    });

    it('Potion de Soin requires sage + mint + rose', () => {
      const potion = RECIPES.find(r => r.id === 'potion_de_soin')!;
      expect(potion.station).toBe('alchemy_table');
      const ids = potion.ingredients.map(i => i.itemId);
      expect(ids).toContain('sauge');
      expect(ids).toContain('menthe');
      expect(ids).toContain('rose');
      expect(potion.resultItemId).toBe('healing_potion');
    });

    it('Outil de Base requires stone + iron ore', () => {
      const tool = RECIPES.find(r => r.id === 'outil_de_base')!;
      expect(tool.station).toBe('workbench');
      const ids = tool.ingredients.map(i => i.itemId);
      expect(ids).toContain('stone');
      expect(ids).toContain('iron_ore');
      expect(tool.resultItemId).toBe('basic_tool');
    });

    it('all recipes have positive craft time between 3-5 seconds', () => {
      for (const recipe of RECIPES) {
        expect(recipe.craftTime).toBeGreaterThanOrEqual(3000);
        expect(recipe.craftTime).toBeLessThanOrEqual(5000);
      }
    });
  });

  describe('crafting stations', () => {
    it('defines 3 station types', () => {
      expect(CRAFTING_STATIONS).toHaveLength(3);
    });

    it('each station has French/English name and building types', () => {
      for (const station of CRAFTING_STATIONS) {
        expect(station.nameFr).toBeTruthy();
        expect(station.nameEn).toBeTruthy();
        expect(station.buildingTypes.length).toBeGreaterThan(0);
      }
    });

    it('kitchen stove is in Restaurant and Bakery', () => {
      const stove = CRAFTING_STATIONS.find(s => s.type === 'kitchen_stove')!;
      expect(stove.buildingTypes).toContain('Restaurant');
      expect(stove.buildingTypes).toContain('Bakery');
    });

    it('alchemy table is in HerbShop and Pharmacy', () => {
      const alchemy = CRAFTING_STATIONS.find(s => s.type === 'alchemy_table')!;
      expect(alchemy.buildingTypes).toContain('HerbShop');
      expect(alchemy.buildingTypes).toContain('Pharmacy');
    });

    it('workbench is in Blacksmith and Carpenter', () => {
      const workbench = CRAFTING_STATIONS.find(s => s.type === 'workbench')!;
      expect(workbench.buildingTypes).toContain('Blacksmith');
      expect(workbench.buildingTypes).toContain('Carpenter');
    });
  });

  describe('canCraft', () => {
    it('returns true when player has all ingredients', () => {
      const { system } = createSystem();
      expect(system.canCraft('soupe_de_poisson')).toBe(true);
    });

    it('returns false when missing ingredients', () => {
      const { system } = createSystem({
        getInventoryCount: vi.fn().mockReturnValue(0),
      });
      expect(system.canCraft('soupe_de_poisson')).toBe(false);
    });

    it('returns false for unknown recipe', () => {
      const { system } = createSystem();
      expect(system.canCraft('nonexistent_recipe')).toBe(false);
    });

    it('returns false when difficulty exceeds skill + 2', () => {
      const { system } = createSystem();
      // Difficulty 4 recipe requires at least skill level 2
      const recipe = RECIPES.find(r => r.difficulty === 4)!;
      system.setSkillState({ level: 0, totalCrafts: 0, craftCounts: {} });
      expect(system.canCraft(recipe.id)).toBe(false);
    });

    it('returns true when skill is high enough for difficulty', () => {
      const { system } = createSystem();
      const recipe = RECIPES.find(r => r.difficulty === 4)!;
      system.setSkillState({ level: 3, totalCrafts: 10, craftCounts: {} });
      expect(system.canCraft(recipe.id)).toBe(true);
    });
  });

  describe('getAvailableRecipes', () => {
    it('returns only recipes for the specified station', () => {
      const { system } = createSystem();
      const cooking = system.getAvailableRecipes('kitchen_stove');
      for (const r of cooking) {
        expect(r.station).toBe('kitchen_stove');
      }
    });

    it('filters out recipes player cannot craft', () => {
      const getCount = vi.fn().mockImplementation((itemId: string) => {
        return itemId === 'common_fish' || itemId === 'romarin' ? 5 : 0;
      });
      const { system } = createSystem({ getInventoryCount: getCount });
      // Set high skill so difficulty isn't the issue
      system.setSkillState({ level: 10, totalCrafts: 100, craftCounts: {} });
      const available = system.getAvailableRecipes('kitchen_stove');
      // Only soupe_de_poisson should be available (needs common_fish + romarin)
      expect(available.length).toBeGreaterThanOrEqual(1);
      expect(available.some(r => r.id === 'soupe_de_poisson')).toBe(true);
    });
  });

  describe('startCraft', () => {
    it('starts crafting and consumes ingredients', () => {
      const { system, callbacks } = createSystem();
      const result = system.startCraft('soupe_de_poisson');
      expect(result).toBe(true);
      expect(system.getIsCrafting()).toBe(true);
      expect(callbacks.removeInventoryItem).toHaveBeenCalledWith('common_fish', 1);
      expect(callbacks.removeInventoryItem).toHaveBeenCalledWith('romarin', 1);
    });

    it('shows recipe vocabulary toast when starting', () => {
      const { system, callbacks } = createSystem();
      system.startCraft('soupe_de_poisson');
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Soupe de Poisson'),
        }),
      );
    });

    it('returns false when already crafting', () => {
      const { system } = createSystem();
      system.startCraft('soupe_de_poisson');
      expect(system.startCraft('salade_aux_herbes')).toBe(false);
    });

    it('returns false for unknown recipe', () => {
      const { system } = createSystem();
      expect(system.startCraft('nonexistent')).toBe(false);
    });

    it('returns false when cannot craft', () => {
      const { system } = createSystem({
        getInventoryCount: vi.fn().mockReturnValue(0),
      });
      expect(system.startCraft('soupe_de_poisson')).toBe(false);
    });

    it('returns false if removeInventoryItem fails', () => {
      const { system } = createSystem({
        removeInventoryItem: vi.fn().mockReturnValue(false),
      });
      expect(system.startCraft('soupe_de_poisson')).toBe(false);
    });
  });

  describe('update and completion', () => {
    it('returns -1 when not crafting', () => {
      const { system } = createSystem();
      expect(system.update(16)).toBe(-1);
    });

    it('returns progress 0-1 during crafting', () => {
      const { system } = createSystem();
      system.startCraft('soupe_de_poisson');
      // Immediately after starting, progress should be very small
      const progress = system.update(16);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThan(1);
    });

    it('completes craft and adds result to inventory after craft time', () => {
      const { system, callbacks } = createSystem();
      system.startCraft('soupe_de_poisson');

      // Fast-forward time by mocking Date.now
      const origNow = Date.now;
      Date.now = () => origNow() + 5000; // 5 seconds later (craft time is 4000)

      system.update(16);

      expect(callbacks.addInventoryItem).toHaveBeenCalledWith('prepared_soup', 1);
      expect(system.getIsCrafting()).toBe(false);

      Date.now = origNow;
    });

    it('emits item_crafted event on completion', () => {
      const { system, eventBus } = createSystem();
      const handler = vi.fn();
      eventBus.on('item_crafted', handler);

      system.startCraft('soupe_de_poisson');

      const origNow = Date.now;
      Date.now = () => origNow() + 5000;
      system.update(16);
      Date.now = origNow;

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'item_crafted',
          itemId: 'prepared_soup',
          itemName: 'Soupe de Poisson',
          quantity: 1,
        }),
      );
    });

    it('shows result vocabulary toast on completion', () => {
      const { system, callbacks } = createSystem();
      system.startCraft('soupe_de_poisson');

      const origNow = Date.now;
      Date.now = () => origNow() + 5000;
      system.update(16);
      Date.now = origNow;

      // Last toast call should be the completion one
      const calls = (callbacks.showToast as ReturnType<typeof vi.fn>).mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.title).toContain('Soupe de Poisson');
      expect(lastCall.description).toContain('soupe de poisson');
    });
  });

  describe('crafting skill progression', () => {
    it('starts at level 0 with 0 crafts', () => {
      const { system } = createSystem();
      const skill = system.getSkill();
      expect(skill.level).toBe(0);
      expect(skill.totalCrafts).toBe(0);
    });

    it('increments total crafts after successful craft', () => {
      const { system } = createSystem();
      system.startCraft('soupe_de_poisson');

      const origNow = Date.now;
      Date.now = () => origNow() + 5000;
      system.update(16);
      Date.now = origNow;

      expect(system.getSkill().totalCrafts).toBe(1);
    });

    it('levels up at correct thresholds', () => {
      const { system } = createSystem();

      // Level 1 at 2 crafts
      for (let i = 0; i < 2; i++) {
        system.startCraft('soupe_de_poisson');
        const origNow = Date.now;
        Date.now = () => origNow() + 5000;
        system.update(16);
        Date.now = origNow;
      }
      expect(system.getSkillLevel()).toBe(1);
    });

    it('shows skill up toast', () => {
      const { system, callbacks } = createSystem();

      for (let i = 0; i < 2; i++) {
        system.startCraft('soupe_de_poisson');
        const origNow = Date.now;
        Date.now = () => origNow() + 5000;
        system.update(16);
        Date.now = origNow;
      }

      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Crafting Skill Up!',
        }),
      );
    });

    it('tracks craft counts per recipe', () => {
      const { system } = createSystem();

      system.startCraft('soupe_de_poisson');
      const origNow = Date.now;
      Date.now = () => origNow() + 5000;
      system.update(16);
      Date.now = origNow;

      const skill = system.getSkill();
      expect(skill.craftCounts['soupe_de_poisson']).toBe(1);
    });

    it('caps at MAX_CRAFTING_SKILL', () => {
      const { system } = createSystem();
      system.setSkillState({ level: MAX_CRAFTING_SKILL, totalCrafts: 999, craftCounts: {} });

      system.startCraft('soupe_de_poisson');
      const origNow = Date.now;
      Date.now = () => origNow() + 5000;
      system.update(16);
      Date.now = origNow;

      expect(system.getSkillLevel()).toBe(MAX_CRAFTING_SKILL);
    });

    it('setSkillState and getSkill round-trip correctly', () => {
      const { system } = createSystem();
      const state: CraftingSkillState = {
        level: 3,
        totalCrafts: 12,
        craftCounts: { soupe_de_poisson: 8, potion_de_soin: 4 },
      };
      system.setSkillState(state);
      const retrieved = system.getSkill();
      expect(retrieved.level).toBe(3);
      expect(retrieved.totalCrafts).toBe(12);
      expect(retrieved.craftCounts['soupe_de_poisson']).toBe(8);
    });
  });

  describe('station detection', () => {
    it('detects kitchen stove by mesh name', () => {
      expect(RecipeCraftingSystem.detectStation('kitchen_stove_01')).toBe('kitchen_stove');
      expect(RecipeCraftingSystem.detectStation('Big_Oven')).toBe('kitchen_stove');
      expect(RecipeCraftingSystem.detectStation('old_stove')).toBe('kitchen_stove');
    });

    it('detects alchemy table by mesh name', () => {
      expect(RecipeCraftingSystem.detectStation('alchemy_station')).toBe('alchemy_table');
      expect(RecipeCraftingSystem.detectStation('potion_table')).toBe('alchemy_table');
      expect(RecipeCraftingSystem.detectStation('big_cauldron')).toBe('alchemy_table');
    });

    it('detects workbench by mesh name', () => {
      expect(RecipeCraftingSystem.detectStation('workbench_large')).toBe('workbench');
      expect(RecipeCraftingSystem.detectStation('iron_anvil')).toBe('workbench');
      expect(RecipeCraftingSystem.detectStation('Forge_01')).toBe('workbench');
    });

    it('detects station by metadata stationType', () => {
      expect(RecipeCraftingSystem.detectStation('mesh_01', { stationType: 'kitchen_stove' })).toBe('kitchen_stove');
      expect(RecipeCraftingSystem.detectStation('mesh_02', { stationType: 'alchemy_table' })).toBe('alchemy_table');
      expect(RecipeCraftingSystem.detectStation('mesh_03', { stationType: 'workbench' })).toBe('workbench');
    });

    it('detects station by building type metadata', () => {
      expect(RecipeCraftingSystem.detectStation('generic_mesh', { buildingType: 'Restaurant' })).toBe('kitchen_stove');
      expect(RecipeCraftingSystem.detectStation('generic_mesh', { buildingType: 'HerbShop' })).toBe('alchemy_table');
      expect(RecipeCraftingSystem.detectStation('generic_mesh', { buildingType: 'Blacksmith' })).toBe('workbench');
    });

    it('returns null for non-station meshes', () => {
      expect(RecipeCraftingSystem.detectStation('tree_oak')).toBeNull();
      expect(RecipeCraftingSystem.detectStation('building_house', {})).toBeNull();
    });
  });

  describe('station prompts', () => {
    it('returns Cook for kitchen stove', () => {
      expect(RecipeCraftingSystem.getStationPrompt('kitchen_stove')).toBe('[G]: Cook');
    });

    it('returns Brew for alchemy table', () => {
      expect(RecipeCraftingSystem.getStationPrompt('alchemy_table')).toBe('[G]: Brew');
    });

    it('returns Craft for workbench', () => {
      expect(RecipeCraftingSystem.getStationPrompt('workbench')).toBe('[G]: Craft');
    });
  });

  describe('recipe queries', () => {
    it('getAllRecipes returns all 10 recipes', () => {
      const { system } = createSystem();
      expect(system.getAllRecipes()).toHaveLength(10);
    });

    it('getRecipe returns specific recipe by ID', () => {
      const { system } = createSystem();
      const recipe = system.getRecipe('soupe_de_poisson');
      expect(recipe).toBeDefined();
      expect(recipe!.nameFr).toBe('Soupe de Poisson');
    });

    it('getRecipe returns undefined for unknown ID', () => {
      const { system } = createSystem();
      expect(system.getRecipe('nonexistent')).toBeUndefined();
    });

    it('getRecipesForStation filters by station type', () => {
      const { system } = createSystem();
      const cooking = system.getRecipesForStation('kitchen_stove');
      expect(cooking.length).toBe(4);
      for (const r of cooking) {
        expect(r.station).toBe('kitchen_stove');
      }
    });
  });

  describe('quest helpers', () => {
    it('hasCraftedAtLeast returns false when not enough crafted', () => {
      const { system } = createSystem();
      expect(system.hasCraftedAtLeast('soupe_de_poisson', 3)).toBe(false);
    });

    it('hasCraftedAtLeast returns true when threshold met', () => {
      const { system } = createSystem();
      system.setSkillState({
        level: 3,
        totalCrafts: 5,
        craftCounts: { soupe_de_poisson: 3 },
      });
      expect(system.hasCraftedAtLeast('soupe_de_poisson', 3)).toBe(true);
    });

    it('getTotalCrafts tracks all successful crafts', () => {
      const { system } = createSystem();

      system.startCraft('soupe_de_poisson');
      const origNow = Date.now;
      Date.now = () => origNow() + 5000;
      system.update(16);
      Date.now = origNow;

      expect(system.getTotalCrafts()).toBe(1);
    });

    it('getUniqueCrafts counts distinct recipe types', () => {
      const { system } = createSystem();
      system.setSkillState({
        level: 5,
        totalCrafts: 10,
        craftCounts: { soupe_de_poisson: 5, potion_de_soin: 3, outil_de_base: 2 },
      });
      expect(system.getUniqueCrafts()).toBe(3);
    });
  });

  describe('cancelCraft', () => {
    it('stops crafting', () => {
      const { system } = createSystem();
      system.startCraft('soupe_de_poisson');
      expect(system.getIsCrafting()).toBe(true);
      system.cancelCraft();
      expect(system.getIsCrafting()).toBe(false);
    });

    it('returns -1 for progress after cancel', () => {
      const { system } = createSystem();
      system.startCraft('soupe_de_poisson');
      system.cancelCraft();
      expect(system.getCraftProgress()).toBe(-1);
    });
  });

  describe('dispose', () => {
    it('clears state', () => {
      const { system } = createSystem();
      system.startCraft('soupe_de_poisson');
      system.dispose();
      expect(system.getIsCrafting()).toBe(false);
      expect(system.getAllRecipes()).toHaveLength(0);
    });
  });

  describe('constants', () => {
    it('CRAFTING_HOTSPOT_RADIUS is 3 meters', () => {
      expect(CRAFTING_HOTSPOT_RADIUS).toBe(3);
    });

    it('MAX_CRAFTING_SKILL is 10', () => {
      expect(MAX_CRAFTING_SKILL).toBe(10);
    });

    it('SKILL_XP_THRESHOLDS has entries for levels 0 through MAX_CRAFTING_SKILL', () => {
      expect(SKILL_XP_THRESHOLDS).toHaveLength(MAX_CRAFTING_SKILL + 1);
    });
  });
});
