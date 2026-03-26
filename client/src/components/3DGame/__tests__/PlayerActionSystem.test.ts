/**
 * Tests for PlayerActionSystem
 *
 * Validates physical action lifecycle: start, update progress, complete,
 * cancel, energy checks, tool requirements, item production, and event emission.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameEventBus } from '../GameEventBus';
import {
  PlayerActionSystem,
  ACTION_DEFINITIONS,
  BUSINESS_ACTION_HOTSPOTS,
  type PlayerActionCallbacks,
  type PhysicalActionType,
} from '../PlayerActionSystem';
import type { InteractableTarget } from '../InteractionPromptSystem';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createCallbacks(overrides: Partial<PlayerActionCallbacks> = {}): PlayerActionCallbacks {
  return {
    showToast: vi.fn(),
    setMovementLocked: vi.fn(),
    playPlayerAnimation: vi.fn(),
    stopPlayerAnimation: vi.fn(),
    getPlayerEnergy: vi.fn().mockReturnValue(100),
    setPlayerEnergy: vi.fn(),
    addInventoryItem: vi.fn(),
    hasInventoryItem: vi.fn().mockReturnValue(true),
    getCurrentBuildingId: vi.fn().mockReturnValue('building-1'),
    getCurrentBusinessType: vi.fn().mockReturnValue('blacksmith'),
    updateProgressBar: vi.fn(),
    hideProgressBar: vi.fn(),
    ...overrides,
  };
}

function createSystem(callbackOverrides: Partial<PlayerActionCallbacks> = {}) {
  const eventBus = new GameEventBus();
  const callbacks = createCallbacks(callbackOverrides);
  const system = new PlayerActionSystem(callbacks);
  system.setEventBus(eventBus);
  return { system, eventBus, callbacks };
}

function makeHotspotTarget(actionType: PhysicalActionType): InteractableTarget {
  return {
    type: 'action_hotspot',
    id: `hotspot_${actionType}`,
    name: actionType,
    mesh: {} as any,
    promptText: `[G]: ${actionType} here`,
    actionHotspotType: actionType,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('PlayerActionSystem', () => {
  describe('action definitions', () => {
    it('has definitions for all 10 action types', () => {
      const expectedTypes: PhysicalActionType[] = [
        'fishing', 'mining', 'harvesting', 'cooking', 'crafting',
        'painting', 'reading', 'praying', 'sweeping', 'chopping',
      ];
      for (const type of expectedTypes) {
        expect(ACTION_DEFINITIONS[type]).toBeDefined();
        expect(ACTION_DEFINITIONS[type].type).toBe(type);
        expect(ACTION_DEFINITIONS[type].duration).toBeGreaterThan(0);
        expect(ACTION_DEFINITIONS[type].energyCost).toBeGreaterThan(0);
        expect(ACTION_DEFINITIONS[type].xpReward).toBeGreaterThan(0);
        expect(ACTION_DEFINITIONS[type].animationClip).toBeTruthy();
        expect(ACTION_DEFINITIONS[type].itemRewards.length).toBeGreaterThan(0);
      }
    });

    it('all actions have valid animation clip names', () => {
      for (const def of Object.values(ACTION_DEFINITIONS)) {
        expect(def.animationClip).toBeTruthy();
        expect(def.animationFallback).toBeTruthy();
      }
    });
  });

  describe('handleInteraction', () => {
    it('starts action for valid action_hotspot target', () => {
      const { system } = createSystem();
      const target = makeHotspotTarget('cooking');
      const result = system.handleInteraction(target);
      expect(result).toBe(true);
      expect(system.isPerformingAction).toBe(true);
    });

    it('ignores non-action_hotspot targets', () => {
      const { system } = createSystem();
      const target: InteractableTarget = {
        type: 'furniture',
        id: 'chair-1',
        name: 'Chair',
        mesh: {} as any,
        promptText: '[G]: Sit',
      };
      const result = system.handleInteraction(target);
      expect(result).toBe(false);
      expect(system.isPerformingAction).toBe(false);
    });
  });

  describe('startAction', () => {
    it('locks movement and plays animation', () => {
      const { system, callbacks } = createSystem();
      system.startAction(ACTION_DEFINITIONS.cooking);
      expect(callbacks.setMovementLocked).toHaveBeenCalledWith(true);
      expect(callbacks.playPlayerAnimation).toHaveBeenCalledWith('Interact');
    });

    it('rejects when already performing an action', () => {
      const { system, callbacks } = createSystem();
      system.startAction(ACTION_DEFINITIONS.cooking);
      const result = system.startAction(ACTION_DEFINITIONS.mining);
      expect(result).toBe(false);
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Busy' }),
      );
    });

    it('rejects when player has insufficient energy', () => {
      const { system, callbacks } = createSystem({
        getPlayerEnergy: vi.fn().mockReturnValue(1),
      });
      const result = system.startAction(ACTION_DEFINITIONS.mining); // costs 8
      expect(result).toBe(false);
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Too Tired' }),
      );
    });

    it('rejects when required tool is missing', () => {
      const { system, callbacks } = createSystem({
        hasInventoryItem: vi.fn().mockReturnValue(false),
      });
      const result = system.startAction(ACTION_DEFINITIONS.mining); // requires pickaxe
      expect(result).toBe(false);
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Missing Tool' }),
      );
    });

    it('allows actions without required tool if no tool check callback', () => {
      const { system } = createSystem({ hasInventoryItem: undefined });
      const result = system.startAction(ACTION_DEFINITIONS.mining);
      expect(result).toBe(true);
    });

    it('allows actions that have no tool requirement', () => {
      const { system } = createSystem({
        hasInventoryItem: vi.fn().mockReturnValue(false),
      });
      const result = system.startAction(ACTION_DEFINITIONS.cooking); // no tool required
      expect(result).toBe(true);
    });
  });

  describe('update', () => {
    it('returns null when no action is in progress', () => {
      const { system } = createSystem();
      expect(system.update(100)).toBeNull();
    });

    it('returns progress fraction during action', () => {
      const { system } = createSystem();
      system.startAction(ACTION_DEFINITIONS.cooking); // 6 seconds
      const progress = system.update(3000); // 3 seconds = 50%
      expect(progress).toBeCloseTo(0.5, 1);
    });

    it('updates progress bar callback', () => {
      const { system, callbacks } = createSystem();
      system.startAction(ACTION_DEFINITIONS.cooking);
      system.update(1000);
      expect(callbacks.updateProgressBar).toHaveBeenCalledWith(
        expect.any(Number),
        'Cook',
      );
    });

    it('completes action when duration elapses', () => {
      const { system, callbacks } = createSystem();
      system.startAction(ACTION_DEFINITIONS.sweeping); // 4 seconds
      const result = system.update(4500); // > 4 seconds
      expect(result).toBeNull(); // completed
      expect(system.isPerformingAction).toBe(false);
      expect(callbacks.setMovementLocked).toHaveBeenLastCalledWith(false);
      expect(callbacks.stopPlayerAnimation).toHaveBeenCalled();
      expect(callbacks.hideProgressBar).toHaveBeenCalled();
    });

    it('deducts energy on completion', () => {
      const { system, callbacks } = createSystem({
        getPlayerEnergy: vi.fn().mockReturnValue(50),
      });
      system.startAction(ACTION_DEFINITIONS.sweeping); // costs 2
      system.update(5000); // complete
      expect(callbacks.setPlayerEnergy).toHaveBeenCalledWith(48);
    });

    it('emits physical_action_completed event on completion', () => {
      const { system, eventBus } = createSystem();
      const handler = vi.fn();
      eventBus.on('physical_action_completed', handler);

      system.startAction(ACTION_DEFINITIONS.praying); // 5 seconds
      system.update(6000); // complete

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0];
      expect(event.actionType).toBe('praying');
      expect(event.energyCost).toBe(1);
      expect(event.xpGained).toBe(5);
      expect(Array.isArray(event.itemsProduced)).toBe(true);
    });
  });

  describe('cancelAction', () => {
    it('stops animation and unlocks movement', () => {
      const { system, callbacks } = createSystem();
      system.startAction(ACTION_DEFINITIONS.cooking);
      system.cancelAction();
      expect(system.isPerformingAction).toBe(false);
      expect(callbacks.stopPlayerAnimation).toHaveBeenCalled();
      expect(callbacks.setMovementLocked).toHaveBeenLastCalledWith(false);
      expect(callbacks.hideProgressBar).toHaveBeenCalled();
    });

    it('does not emit event or deduct energy', () => {
      const { system, eventBus, callbacks } = createSystem();
      const handler = vi.fn();
      eventBus.on('physical_action_completed', handler);

      system.startAction(ACTION_DEFINITIONS.mining);
      system.cancelAction();

      expect(handler).not.toHaveBeenCalled();
      expect(callbacks.setPlayerEnergy).not.toHaveBeenCalled();
    });

    it('is a no-op when no action is active', () => {
      const { system, callbacks } = createSystem();
      system.cancelAction();
      expect(callbacks.stopPlayerAnimation).not.toHaveBeenCalled();
    });
  });

  describe('item production', () => {
    it('adds produced items to inventory', () => {
      const { system, callbacks } = createSystem();
      // Use praying which has a small chance for blessing_token (0.15)
      // Run multiple completions to verify addInventoryItem is called when items are produced
      let itemsAdded = 0;
      (callbacks.addInventoryItem as ReturnType<typeof vi.fn>).mockImplementation(() => { itemsAdded++; });

      // Force Math.random to always return 0 (all chances pass)
      const origRandom = Math.random;
      Math.random = () => 0;

      try {
        system.startAction(ACTION_DEFINITIONS.cooking);
        system.update(7000); // complete cooking

        // With Math.random = 0, all item rewards should be produced
        expect(callbacks.addInventoryItem).toHaveBeenCalled();
        // Cooking has 2 rewards: prepared_food (0.8 chance) and baked_goods (0.3 chance)
        expect(itemsAdded).toBe(2);
      } finally {
        Math.random = origRandom;
      }
    });

    it('does not add items when RNG fails', () => {
      const { system, callbacks } = createSystem();
      const origRandom = Math.random;
      Math.random = () => 0.99; // all chances fail

      try {
        system.startAction(ACTION_DEFINITIONS.cooking);
        system.update(7000);
        expect(callbacks.addInventoryItem).not.toHaveBeenCalled();
      } finally {
        Math.random = origRandom;
      }
    });
  });

  describe('business hotspot mapping', () => {
    it('returns cooking hotspot for restaurant', () => {
      const hotspots = PlayerActionSystem.getHotspotsForBusiness('restaurant');
      expect(hotspots.length).toBeGreaterThan(0);
      expect(hotspots[0].actionType).toBe('cooking');
    });

    it('returns crafting hotspot for blacksmith', () => {
      const hotspots = PlayerActionSystem.getHotspotsForBusiness('blacksmith');
      expect(hotspots.length).toBeGreaterThan(0);
      expect(hotspots[0].actionType).toBe('crafting');
    });

    it('returns reading hotspot for library', () => {
      const hotspots = PlayerActionSystem.getHotspotsForBusiness('library');
      expect(hotspots.length).toBeGreaterThan(0);
      expect(hotspots[0].actionType).toBe('reading');
    });

    it('returns praying hotspot for church', () => {
      const hotspots = PlayerActionSystem.getHotspotsForBusiness('church');
      expect(hotspots.length).toBeGreaterThan(0);
      expect(hotspots[0].actionType).toBe('praying');
    });

    it('returns empty array for unknown business', () => {
      const hotspots = PlayerActionSystem.getHotspotsForBusiness('unknown_type');
      expect(hotspots).toEqual([]);
    });

    it('is case-insensitive', () => {
      const hotspots = PlayerActionSystem.getHotspotsForBusiness('Restaurant');
      // getHotspotsForBusiness lowercases the input
      expect(hotspots.length).toBeGreaterThan(0);
    });
  });

  describe('prompt text', () => {
    it('generates correct prompt for each action type', () => {
      expect(PlayerActionSystem.getPromptText('fishing')).toBe('[G]: Fish here');
      expect(PlayerActionSystem.getPromptText('mining')).toBe('[G]: Mine here');
      expect(PlayerActionSystem.getPromptText('cooking')).toBe('[G]: Cook here');
      expect(PlayerActionSystem.getPromptText('crafting')).toBe('[G]: Craft here');
      expect(PlayerActionSystem.getPromptText('reading')).toBe('[G]: Study here');
      expect(PlayerActionSystem.getPromptText('praying')).toBe('[G]: Pray here');
      expect(PlayerActionSystem.getPromptText('chopping')).toBe('[G]: Chop here');
    });
  });

  describe('dispose', () => {
    it('cancels any in-progress action', () => {
      const { system, callbacks } = createSystem();
      system.startAction(ACTION_DEFINITIONS.cooking);
      system.dispose();
      expect(system.isPerformingAction).toBe(false);
      expect(callbacks.setMovementLocked).toHaveBeenLastCalledWith(false);
    });
  });

  describe('currentAction', () => {
    it('returns null when no action active', () => {
      const { system } = createSystem();
      expect(system.currentAction).toBeNull();
    });

    it('returns action progress during action', () => {
      const { system } = createSystem();
      system.startAction(ACTION_DEFINITIONS.cooking);
      const action = system.currentAction;
      expect(action).not.toBeNull();
      expect(action!.actionType).toBe('cooking');
      expect(action!.definition).toBe(ACTION_DEFINITIONS.cooking);
    });
  });
});
