import { describe, it, expect, vi } from 'vitest';
import { GameEventBus } from '../game-engine/logic/GameEventBus';
import {
  FarmingSystem,
  CROP_TYPES,
  MAX_CROP_PLOTS,
  SKILL_XP_THRESHOLDS,
  type FarmingSystemCallbacks,
} from '../game-engine/logic/FarmingSystem';

function createSystem() {
  const state = {
    toasts: [] as Array<{ title: string; description: string }>,
    inventory: new Map<string, number>(),
  };
  const callbacks: FarmingSystemCallbacks = {
    showToast: (opts) => state.toasts.push(opts),
    addInventoryItem: (name, qty) => {
      state.inventory.set(name, (state.inventory.get(name) || 0) + qty);
    },
    hasInventoryItem: (name) => (state.inventory.get(name) || 0) > 0,
  };
  return { system: new FarmingSystem(callbacks), state };
}

describe('FarmingSystem', () => {
  describe('planting', () => {
    it('plants a crop at a plot', () => {
      const { system } = createSystem();
      system.setCurrentDay(1);
      const crop = system.plantCrop('plot-1', 'wheat');
      expect(crop).not.toBeNull();
      expect(crop!.id).toBe('wheat');

      const plot = system.getPlot('plot-1');
      expect(plot).toBeDefined();
      expect(plot!.stage).toBe('planted');
      expect(plot!.plantedDay).toBe(1);
      expect(plot!.growthProgress).toBe(0);
    });

    it('rejects planting on occupied plot', () => {
      const { system } = createSystem();
      system.plantCrop('plot-1', 'wheat');
      expect(system.plantCrop('plot-1', 'corn')).toBeNull();
    });

    it('enforces MAX_CROP_PLOTS limit', () => {
      const { system } = createSystem();
      for (let i = 0; i < MAX_CROP_PLOTS; i++) {
        system.plantCrop(`plot-${i}`, 'wheat');
      }
      expect(system.plantCrop('plot-extra', 'wheat')).toBeNull();
    });

    it('plants random crop type when no cropTypeId given', () => {
      const { system } = createSystem();
      const crop = system.plantCrop('plot-rand');
      expect(crop).not.toBeNull();
      expect(CROP_TYPES.some(c => c.id === crop!.id)).toBe(true);
    });
  });

  describe('watering', () => {
    it('waters a planted crop', () => {
      const { system } = createSystem();
      system.setCurrentDay(1);
      system.plantCrop('plot-1', 'wheat');
      expect(system.waterCrop('plot-1')).toBe(true);
    });

    it('rejects double watering on same day', () => {
      const { system } = createSystem();
      system.setCurrentDay(1);
      system.plantCrop('plot-1', 'wheat');
      system.waterCrop('plot-1');
      expect(system.waterCrop('plot-1')).toBe(false);
    });

    it('allows watering on different days', () => {
      const { system } = createSystem();
      system.setCurrentDay(1);
      system.plantCrop('plot-1', 'wheat');
      system.waterCrop('plot-1');
      system.setCurrentDay(2);
      expect(system.waterCrop('plot-1')).toBe(true);
    });

    it('rejects watering non-existent plot', () => {
      const { system } = createSystem();
      expect(system.waterCrop('no-plot')).toBe(false);
    });

    it('rejects watering a ready crop', () => {
      const { system } = createSystem();
      system.plantCrop('plot-1', 'wheat');
      const plot = system.getPlot('plot-1')!;
      plot.stage = 'ready';
      expect(system.waterCrop('plot-1')).toBe(false);
    });
  });

  describe('growth', () => {
    it('grows unwatered crop over growthDays', () => {
      const { system } = createSystem();
      system.setCurrentDay(0);
      system.plantCrop('plot-1', 'wheat'); // 3 growthDays

      system.setCurrentDay(1);
      system.updateGrowth();
      const plot = system.getPlot('plot-1')!;
      expect(plot.stage).toBe('growing');
      expect(plot.growthProgress).toBeCloseTo(1 / 3, 2);

      system.setCurrentDay(2);
      system.updateGrowth();
      expect(plot.growthProgress).toBeCloseTo(2 / 3, 2);

      system.setCurrentDay(3);
      system.updateGrowth();
      expect(plot.stage).toBe('ready');
      expect(plot.growthProgress).toBe(1);
    });

    it('grows watered crop faster (1.5x)', () => {
      const { system } = createSystem();
      system.setCurrentDay(0);
      system.plantCrop('plot-1', 'wheat'); // 3 growthDays
      system.waterCrop('plot-1');

      system.setCurrentDay(1);
      system.updateGrowth();
      const plot = system.getPlot('plot-1')!;
      expect(plot.growthProgress).toBeCloseTo(0.5, 2); // (1/3)*1.5

      system.waterCrop('plot-1');
      system.setCurrentDay(2);
      system.updateGrowth();
      expect(plot.stage).toBe('ready'); // 0.5 + 0.5 = 1.0
    });
  });

  describe('harvesting', () => {
    it('harvests a ready crop', () => {
      const { system, state } = createSystem();
      system.plantCrop('plot-1', 'wheat');
      const plot = system.getPlot('plot-1')!;
      plot.stage = 'ready';
      plot.growthProgress = 1;

      const result = system.harvestCrop('plot-1');
      expect(result).not.toBeNull();
      expect(result!.crop.id).toBe('wheat');
      expect(result!.quantity).toBeGreaterThanOrEqual(1);
      expect(state.inventory.get('wheat')).toBeGreaterThanOrEqual(1);
      expect(system.getPlot('plot-1')).toBeUndefined();
    });

    it('rejects harvesting unready crop', () => {
      const { system } = createSystem();
      system.plantCrop('plot-1', 'wheat');
      expect(system.harvestCrop('plot-1')).toBeNull();
    });

    it('rejects harvesting non-existent plot', () => {
      const { system } = createSystem();
      expect(system.harvestCrop('no-plot')).toBeNull();
    });

    it('emits item_collected event on harvest', () => {
      const { system } = createSystem();
      const bus = new GameEventBus();
      system.setEventBus(bus);

      let collected: any = null;
      bus.on('item_collected', (e) => { collected = e; });

      system.plantCrop('plot-1', 'wheat');
      const plot = system.getPlot('plot-1')!;
      plot.stage = 'ready';
      plot.growthProgress = 1;
      system.harvestCrop('plot-1');

      expect(collected).not.toBeNull();
      expect(collected.itemId).toBe('wheat');
      expect(collected.quantity).toBeGreaterThanOrEqual(1);
      expect(collected.taxonomy.category).toBe('crop');
    });
  });

  describe('skill progression', () => {
    it('advances skill after threshold harvests', () => {
      const { system, state } = createSystem();
      for (let i = 0; i < SKILL_XP_THRESHOLDS[1]; i++) {
        system.plantCrop(`p-${i}`, 'wheat');
        const plot = system.getPlot(`p-${i}`)!;
        plot.stage = 'ready';
        plot.growthProgress = 1;
        system.harvestCrop(`p-${i}`);
      }
      expect(system.getSkillLevel()).toBe(1);
      expect(system.getTotalHarvests()).toBe(SKILL_XP_THRESHOLDS[1]);
      expect(state.toasts.some(t => t.title.includes('Skill Up'))).toBe(true);
    });

    it('saves and restores skill state', () => {
      const { system } = createSystem();
      system.setSkillState({ level: 5, totalHarvests: 40, harvestCounts: { wheat: 20, corn: 20 } });
      const skill = system.getSkill();
      expect(skill.level).toBe(5);
      expect(skill.totalHarvests).toBe(40);
      expect(skill.harvestCounts['wheat']).toBe(20);
    });
  });

  describe('serialization', () => {
    it('serializes and restores plots', () => {
      const { system: sys1 } = createSystem();
      sys1.setCurrentDay(5);
      sys1.plantCrop('plot-a', 'corn');
      sys1.waterCrop('plot-a');
      sys1.setCurrentDay(6);
      sys1.waterCrop('plot-a');

      const serialized = sys1.serializePlots();
      expect(serialized).toHaveLength(1);
      expect(serialized[0].cropTypeId).toBe('corn');
      expect(serialized[0].wateredDays).toContain(5);
      expect(serialized[0].wateredDays).toContain(6);

      const { system: sys2 } = createSystem();
      sys2.restorePlots(serialized);
      const plot = sys2.getPlot('plot-a');
      expect(plot).toBeDefined();
      expect(plot!.cropType.id).toBe('corn');
      expect(plot!.wateredDays.size).toBe(2);
    });
  });

  describe('event bus integration', () => {
    it('creates plot on farm_plant event', () => {
      const { system } = createSystem();
      const bus = new GameEventBus();
      system.setEventBus(bus);
      system.setCurrentDay(1);

      bus.emit({
        type: 'physical_action_completed',
        actionType: 'farm_plant',
        locationId: 'farm-plot-1',
        itemsProduced: [],
        energyCost: 10,
        xpGained: 1,
      });

      expect(system.getPlot('farm-plot-1')).toBeDefined();
    });

    it('waters plot on farm_water event', () => {
      const { system } = createSystem();
      const bus = new GameEventBus();
      system.setEventBus(bus);
      system.setCurrentDay(1);
      system.plantCrop('farm-plot-1', 'wheat');

      bus.emit({
        type: 'physical_action_completed',
        actionType: 'farm_water',
        locationId: 'farm-plot-1',
        itemsProduced: [],
        energyCost: 5,
        xpGained: 1,
      });

      expect(system.getPlot('farm-plot-1')!.wateredDays.has(1)).toBe(true);
    });

    it('updates growth on day_changed event', () => {
      const { system } = createSystem();
      const bus = new GameEventBus();
      system.setEventBus(bus);
      system.setCurrentDay(0);
      system.plantCrop('plot-1', 'wheat');

      bus.emit({ type: 'day_changed', day: 1, timestep: 1 });
      expect(system.getPlot('plot-1')!.growthProgress).toBeGreaterThan(0);
    });
  });

  describe('query helpers', () => {
    it('returns ready and growing plots', () => {
      const { system } = createSystem();
      system.plantCrop('p1', 'wheat');
      system.plantCrop('p2', 'corn');
      system.plantCrop('p3', 'potato');

      system.getPlot('p1')!.stage = 'ready';
      system.getPlot('p3')!.stage = 'ready';

      expect(system.getReadyPlots()).toHaveLength(2);
      expect(system.getGrowingPlots()).toHaveLength(1);
    });

    it('tracks harvest counts per crop', () => {
      const { system } = createSystem();
      system.plantCrop('p1', 'wheat');
      system.getPlot('p1')!.stage = 'ready';
      system.getPlot('p1')!.growthProgress = 1;
      system.harvestCrop('p1');

      expect(system.hasHarvestedAtLeast('wheat', 1)).toBe(true);
      expect(system.hasHarvestedAtLeast('wheat', 2)).toBe(false);
    });
  });

  describe('dispose', () => {
    it('stops processing events after dispose', () => {
      const { system } = createSystem();
      const bus = new GameEventBus();
      system.setEventBus(bus);
      system.dispose();

      system.setCurrentDay(1);
      bus.emit({
        type: 'physical_action_completed',
        actionType: 'farm_plant',
        locationId: 'post-dispose',
        itemsProduced: [],
        energyCost: 10,
        xpGained: 1,
      });

      expect(system.getPlot('post-dispose')).toBeUndefined();
    });
  });
});
