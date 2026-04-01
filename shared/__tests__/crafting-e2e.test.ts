/**
 * End-to-end crafting system tests
 *
 * Verifies the full pipeline: genre enables crafting → RecipeCraftingSystem
 * initializes → station detection → inventory checks → craft completes →
 * item_crafted event fires → Prolog facts asserted.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGenreConfig } from '@shared/game-genres/index';
import { GameEventBus } from '@shared/game-engine/logic/GameEventBus';
import {
  RecipeCraftingSystem,
  RECIPES,
  CRAFTING_STATIONS,
  type RecipeCraftingCallbacks,
  type CraftingStationType,
} from '@shared/game-engine/logic/RecipeCraftingSystem';
import { resolveActions, resolveMenuOptions } from '@shared/game-engine/rendering/actions/ContextualActionResolver';
import type { InteractableTarget } from '@shared/game-engine/rendering/InteractionPromptSystem';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createInventory() {
  const items = new Map<string, number>();
  return {
    items,
    add(itemId: string, qty: number) {
      items.set(itemId, (items.get(itemId) ?? 0) + qty);
    },
    remove(itemId: string, qty: number): boolean {
      const current = items.get(itemId) ?? 0;
      if (current < qty) return false;
      const newQty = current - qty;
      if (newQty === 0) items.delete(itemId);
      else items.set(itemId, newQty);
      return true;
    },
    count(itemId: string): number {
      return items.get(itemId) ?? 0;
    },
  };
}

function createSystemWithInventory() {
  const eventBus = new GameEventBus();
  const inventory = createInventory();
  const toasts: Array<{ title: string; description: string }> = [];

  const callbacks: RecipeCraftingCallbacks = {
    showToast: (opts) => toasts.push(opts),
    addInventoryItem: (itemName, qty) => inventory.add(itemName, qty),
    removeInventoryItem: (itemName, qty) => inventory.remove(itemName, qty),
    getInventoryCount: (itemName) => inventory.count(itemName),
  };

  const system = new RecipeCraftingSystem(callbacks);
  system.setEventBus(eventBus);

  return { system, eventBus, inventory, toasts };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Crafting System E2E', () => {
  describe('genre configuration', () => {
    it('language-learning genre enables crafting and inventory', () => {
      const config = getGenreConfig('language-learning');
      expect(config.features.crafting).toBe(true);
      expect(config.features.inventory).toBe(true);
    });

    it('rpg genre enables crafting', () => {
      const config = getGenreConfig('rpg');
      expect(config.features.crafting).toBe(true);
    });

    it('action genre does not enable crafting', () => {
      const config = getGenreConfig('action');
      expect(config.features.crafting).toBe(false);
    });
  });

  describe('station detection', () => {
    it('detects kitchen_stove from mesh name', () => {
      expect(RecipeCraftingSystem.detectStation('Interior_Stove_01')).toBe('kitchen_stove');
      expect(RecipeCraftingSystem.detectStation('Kitchen_Counter')).toBe('kitchen_stove');
      expect(RecipeCraftingSystem.detectStation('Cuisiniere_Large')).toBe('kitchen_stove');
    });

    it('detects alchemy_table from mesh name', () => {
      expect(RecipeCraftingSystem.detectStation('Alchemy_Table')).toBe('alchemy_table');
      expect(RecipeCraftingSystem.detectStation('Potion_Bench')).toBe('alchemy_table');
      expect(RecipeCraftingSystem.detectStation('Cauldron_01')).toBe('alchemy_table');
    });

    it('detects workbench from mesh name', () => {
      expect(RecipeCraftingSystem.detectStation('Workbench_01')).toBe('workbench');
      expect(RecipeCraftingSystem.detectStation('Anvil_Large')).toBe('workbench');
      expect(RecipeCraftingSystem.detectStation('Forge_Fire')).toBe('workbench');
      expect(RecipeCraftingSystem.detectStation('Etabli_Petit')).toBe('workbench');
    });

    it('detects station from metadata stationType', () => {
      expect(RecipeCraftingSystem.detectStation('generic_mesh', { stationType: 'kitchen_stove' })).toBe('kitchen_stove');
      expect(RecipeCraftingSystem.detectStation('generic_mesh', { stationType: 'alchemy_table' })).toBe('alchemy_table');
    });

    it('detects station from metadata buildingType', () => {
      expect(RecipeCraftingSystem.detectStation('generic_mesh', { buildingType: 'Restaurant' })).toBe('kitchen_stove');
      expect(RecipeCraftingSystem.detectStation('generic_mesh', { buildingType: 'Blacksmith' })).toBe('workbench');
      expect(RecipeCraftingSystem.detectStation('generic_mesh', { buildingType: 'HerbShop' })).toBe('alchemy_table');
    });

    it('returns null for unrecognized meshes', () => {
      expect(RecipeCraftingSystem.detectStation('Tree_01')).toBeNull();
      expect(RecipeCraftingSystem.detectStation('Chair_Wooden')).toBeNull();
    });

    it('provides correct prompts for each station', () => {
      expect(RecipeCraftingSystem.getStationPrompt('kitchen_stove')).toBe('[G]: Cook');
      expect(RecipeCraftingSystem.getStationPrompt('alchemy_table')).toBe('[G]: Brew');
      expect(RecipeCraftingSystem.getStationPrompt('workbench')).toBe('[G]: Craft');
    });
  });

  describe('crafting station building type mapping', () => {
    it('each station has at least one building type', () => {
      for (const station of CRAFTING_STATIONS) {
        expect(station.buildingTypes.length).toBeGreaterThan(0);
      }
    });

    it('stations cover key building types', () => {
      const allBuildingTypes = CRAFTING_STATIONS.flatMap(s => s.buildingTypes);
      expect(allBuildingTypes).toContain('Restaurant');
      expect(allBuildingTypes).toContain('Blacksmith');
      expect(allBuildingTypes).toContain('HerbShop');
    });
  });

  describe('full crafting flow with real inventory', () => {
    let system: RecipeCraftingSystem;
    let eventBus: GameEventBus;
    let inventory: ReturnType<typeof createInventory>;
    let toasts: Array<{ title: string; description: string }>;

    beforeEach(() => {
      ({ system, eventBus, inventory, toasts } = createSystemWithInventory());
    });

    it('cannot craft without ingredients', () => {
      const result = system.startCraft('soupe_de_poisson');
      expect(result).toBe(false);
      expect(system.getIsCrafting()).toBe(false);
    });

    it('can craft fish soup with correct ingredients', () => {
      // Stock ingredients
      inventory.add('common_fish', 1);
      inventory.add('romarin', 1);

      // Verify can craft
      expect(system.canCraft('soupe_de_poisson')).toBe(true);

      // Start crafting
      const started = system.startCraft('soupe_de_poisson');
      expect(started).toBe(true);
      expect(system.getIsCrafting()).toBe(true);

      // Ingredients consumed
      expect(inventory.count('common_fish')).toBe(0);
      expect(inventory.count('romarin')).toBe(0);

      // Vocabulary toast shown
      expect(toasts.length).toBeGreaterThan(0);
      expect(toasts[0].title).toContain('Soupe de Poisson');
    });

    it('completes craft after time elapses and emits event', () => {
      inventory.add('common_fish', 1);
      inventory.add('romarin', 1);

      const events: any[] = [];
      eventBus.on('item_crafted', (e) => events.push(e));

      system.startCraft('soupe_de_poisson');

      // Advance time by faking Date.now
      const originalNow = Date.now;
      Date.now = () => originalNow() + 5000; // 5 seconds (craftTime = 4000)

      const progress = system.update(16);
      expect(progress).toBe(-1); // Craft completed

      Date.now = originalNow;

      // Result item in inventory
      expect(inventory.count('prepared_soup')).toBe(1);

      // Event fired
      expect(events).toHaveLength(1);
      expect(events[0].itemId).toBe('prepared_soup');
      expect(events[0].itemName).toBe('Soupe de Poisson');
      expect(events[0].quantity).toBe(1);
      expect(events[0].taxonomy.category).toBe('food');
      expect(events[0].taxonomy.baseType).toBe('crafted');
    });

    it('skill advances after multiple crafts', () => {
      expect(system.getSkillLevel()).toBe(0);

      // Craft twice (threshold for level 1 = 2 crafts)
      for (let i = 0; i < 2; i++) {
        inventory.add('common_fish', 1);
        inventory.add('romarin', 1);
        system.startCraft('soupe_de_poisson');
        const originalNow = Date.now;
        Date.now = () => originalNow() + 5000;
        system.update(16);
        Date.now = originalNow;
      }

      expect(system.getSkillLevel()).toBe(1);
      expect(system.getTotalCrafts()).toBe(2);
    });

    it('cannot start second craft while already crafting', () => {
      inventory.add('common_fish', 2);
      inventory.add('romarin', 2);

      system.startCraft('soupe_de_poisson');
      const second = system.startCraft('soupe_de_poisson');
      expect(second).toBe(false);
    });

    it('getAvailableRecipes only returns craftable recipes for station', () => {
      // No ingredients — should return empty for all stations
      expect(system.getAvailableRecipes('kitchen_stove')).toHaveLength(0);
      expect(system.getAvailableRecipes('alchemy_table')).toHaveLength(0);
      expect(system.getAvailableRecipes('workbench')).toHaveLength(0);

      // Add bread ingredients
      inventory.add('fleur_sauvage', 2);
      inventory.add('stone', 1);

      const available = system.getAvailableRecipes('kitchen_stove');
      expect(available.length).toBe(1);
      expect(available[0].id).toBe('pain');
    });

    it('getInventoryCountForIngredient delegates to callbacks', () => {
      inventory.add('iron_ore', 5);
      expect(system.getInventoryCountForIngredient('iron_ore')).toBe(5);
      expect(system.getInventoryCountForIngredient('nonexistent')).toBe(0);
    });

    it('bread recipe yields 2 items', () => {
      inventory.add('fleur_sauvage', 2);
      inventory.add('stone', 1);

      system.startCraft('pain');
      const originalNow = Date.now;
      Date.now = () => originalNow() + 6000;
      system.update(16);
      Date.now = originalNow;

      expect(inventory.count('bread')).toBe(2);
    });
  });

  describe('contextual action resolver for crafting stations', () => {
    it('resolves crafting station actions for kitchen_stove', () => {
      const target: InteractableTarget = {
        type: 'crafting_station',
        id: 'crafting_kitchen_stove',
        name: 'Kitchen Stove',
        mesh: {} as any,
        promptText: '[G]: Cook',
        craftingStationType: 'kitchen_stove',
      };

      const actions = resolveActions(target, {
        playerActionSystem: null,
        nearbyActionHotspotTypes: [],
        isInsideBuilding: true,
        currentBusinessType: 'Restaurant',
        hasBusinessInteractions: false,
        hasInventoryItems: false,
      });

      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe('__craft_at_kitchen_stove__');
      expect(actions[0].label).toBe('Cuisiner');
      expect(actions[0].labelTranslation).toBe('Cook');
      expect(actions[0].canPerform).toBe(true);
    });

    it('resolves crafting station actions for workbench', () => {
      const target: InteractableTarget = {
        type: 'crafting_station',
        id: 'crafting_workbench',
        name: 'Workbench',
        mesh: {} as any,
        promptText: '[G]: Craft',
        craftingStationType: 'workbench',
      };

      const actions = resolveActions(target, {
        playerActionSystem: null,
        nearbyActionHotspotTypes: [],
        isInsideBuilding: true,
        currentBusinessType: 'Blacksmith',
        hasBusinessInteractions: false,
        hasInventoryItems: false,
      });

      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe('__craft_at_workbench__');
      expect(actions[0].label).toBe('Fabriquer');
    });

    it('resolves crafting station actions for alchemy_table', () => {
      const target: InteractableTarget = {
        type: 'crafting_station',
        id: 'crafting_alchemy_table',
        name: 'Alchemy Table',
        mesh: {} as any,
        promptText: '[G]: Brew',
        craftingStationType: 'alchemy_table',
      };

      const actions = resolveActions(target, {
        playerActionSystem: null,
        nearbyActionHotspotTypes: [],
        isInsideBuilding: true,
        currentBusinessType: 'HerbShop',
        hasBusinessInteractions: false,
        hasInventoryItems: false,
      });

      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe('__craft_at_alchemy_table__');
      expect(actions[0].label).toBe('Préparer');
    });

    it('resolves correct menu options for crafting station', () => {
      const target: InteractableTarget = {
        type: 'crafting_station',
        id: 'crafting_workbench',
        name: 'Workbench',
        mesh: {} as any,
        promptText: '[G]: Craft',
        craftingStationType: 'workbench',
      };

      const opts = resolveMenuOptions(target);
      expect(opts.title).toBe('Workbench');
      expect(opts.titleIcon).toBe('🔨');
    });
  });

  describe('event bus integration', () => {
    it('item_crafted event has correct taxonomy for each station type', () => {
      // Use recipes with difficulty <= 2 (skill 0 can craft up to difficulty 2)
      const stationRecipes: Record<CraftingStationType, string[]> = {
        kitchen_stove: ['soupe_de_poisson'],
        alchemy_table: ['elixir_de_lavande'],
        workbench: ['outil_de_base'],
      };

      const expectedCategories: Record<CraftingStationType, string> = {
        kitchen_stove: 'food',
        alchemy_table: 'alchemy',
        workbench: 'crafting',
      };

      for (const [stationType, recipeIds] of Object.entries(stationRecipes) as [CraftingStationType, string[]][]) {
        const { system, eventBus, inventory } = createSystemWithInventory();
        const events: any[] = [];
        eventBus.on('item_crafted', (e) => events.push(e));

        const recipe = RECIPES.find(r => r.id === recipeIds[0])!;
        for (const ing of recipe.ingredients) {
          inventory.add(ing.itemId, ing.quantity);
        }

        system.startCraft(recipe.id);
        const originalNow = Date.now;
        Date.now = () => originalNow() + recipe.craftTime + 1000;
        system.update(16);
        Date.now = originalNow;

        expect(events).toHaveLength(1);
        expect(events[0].taxonomy.category).toBe(expectedCategories[stationType]);
      }
    });
  });

  describe('recipe data integrity', () => {
    it('all recipes have unique IDs', () => {
      const ids = RECIPES.map(r => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all recipes have at least one ingredient', () => {
      for (const recipe of RECIPES) {
        expect(recipe.ingredients.length).toBeGreaterThan(0);
      }
    });

    it('all recipes have positive craft time', () => {
      for (const recipe of RECIPES) {
        expect(recipe.craftTime).toBeGreaterThan(0);
      }
    });

    it('all recipes have language data', () => {
      for (const recipe of RECIPES) {
        expect(recipe.languageData.targetWord).toBeTruthy();
        expect(recipe.languageData.nativeWord).toBeTruthy();
        expect(recipe.languageData.pronunciation).toBeTruthy();
        expect(recipe.languageData.exampleSentence).toBeTruthy();
      }
    });

    it('all recipes produce at least 1 item', () => {
      for (const recipe of RECIPES) {
        expect(recipe.resultQuantity).toBeGreaterThan(0);
      }
    });
  });
});
