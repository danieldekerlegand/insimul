import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FurnitureInteractionManager, FurnitureInteractionCallbacks } from '../FurnitureInteractionManager';
import { GameEventBus } from '../GameEventBus';
import { GameTimeManager } from '../GameTimeManager';
import type { InteractableTarget } from '../InteractionPromptSystem';

function createMockCallbacks(overrides?: Partial<FurnitureInteractionCallbacks>): FurnitureInteractionCallbacks {
  return {
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
    showLorePopup: vi.fn(),
    setMovementLocked: vi.fn(),
    playPlayerAnimation: vi.fn(),
    stopPlayerAnimation: vi.fn(),
    getTruths: vi.fn().mockReturnValue([]),
    isPlayerOwnedBuilding: vi.fn().mockReturnValue(false),
    getCurrentBusinessType: vi.fn().mockReturnValue(null),
    getCurrentBuildingId: vi.fn().mockReturnValue('building-1'),
    ...overrides,
  };
}

function createFurnitureTarget(
  furnitureType: 'seat' | 'bed' | 'bookshelf' | 'workstation',
  name = 'Chair',
): InteractableTarget {
  return {
    type: 'furniture',
    id: `furniture_${furnitureType}_1`,
    name,
    mesh: { metadata: { furnitureSubType: name.toLowerCase() }, uniqueId: 1 } as any,
    promptText: `[Enter]: Sit on ${name}`,
    furnitureType,
  };
}

describe('FurnitureInteractionManager', () => {
  let manager: FurnitureInteractionManager;
  let callbacks: FurnitureInteractionCallbacks;
  let eventBus: GameEventBus;
  let timeManager: GameTimeManager;

  beforeEach(() => {
    callbacks = createMockCallbacks();
    eventBus = new GameEventBus();
    timeManager = new GameTimeManager({ startHour: 8, startMinute: 0 });
    timeManager.setEventBus(eventBus);

    manager = new FurnitureInteractionManager(callbacks);
    manager.setEventBus(eventBus);
    manager.setTimeManager(timeManager);
  });

  // ── Seat interactions ───────────────────────────────────────────────────

  describe('seat interaction', () => {
    it('seats the player and locks movement', async () => {
      const target = createFurnitureTarget('seat', 'Chair');
      const handled = await manager.handleInteraction(target);

      expect(handled).toBe(true);
      expect(manager.isSeated).toBe(true);
      expect(callbacks.setMovementLocked).toHaveBeenCalledWith(true);
      expect(callbacks.playPlayerAnimation).toHaveBeenCalledWith('sit');
      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Sitting' }),
      );
    });

    it('emits furniture_sat event', async () => {
      const events: any[] = [];
      eventBus.on('furniture_sat', (e) => events.push(e));

      await manager.handleInteraction(createFurnitureTarget('seat'));

      expect(events).toHaveLength(1);
      expect(events[0].furnitureType).toBe('chair');
      expect(events[0].buildingId).toBe('building-1');
    });

    it('stands up on second interaction', async () => {
      const target = createFurnitureTarget('seat');
      await manager.handleInteraction(target);
      expect(manager.isSeated).toBe(true);

      await manager.handleInteraction(target);
      expect(manager.isSeated).toBe(false);
      expect(callbacks.setMovementLocked).toHaveBeenCalledWith(false);
      expect(callbacks.stopPlayerAnimation).toHaveBeenCalledWith('sit');
    });

    it('emits furniture_stood event when standing', async () => {
      const events: any[] = [];
      eventBus.on('furniture_stood', (e) => events.push(e));

      await manager.handleInteraction(createFurnitureTarget('seat'));
      manager.standUp();

      expect(events).toHaveLength(1);
    });
  });

  // ── Bed interactions ──────────────────────────────────────────────────

  describe('bed interaction', () => {
    it('rejects sleep during daytime', async () => {
      timeManager.setTime(12, 0); // noon
      const target = createFurnitureTarget('bed', 'Bed');
      await manager.handleInteraction(target);

      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Not Tired' }),
      );
    });

    it('sleeps at night and advances time to 7 AM', async () => {
      const events: any[] = [];
      eventBus.on('furniture_slept', (e) => events.push(e));

      timeManager.setTime(22, 0); // 10 PM
      const target = createFurnitureTarget('bed', 'Bed');
      await manager.handleInteraction(target);

      // Confirm was called and returned true
      expect(callbacks.showConfirm).toHaveBeenCalled();
      // Time should be 7 AM (22 + 9 = 31, wrap = 7)
      expect(timeManager.hour).toBe(7);
      expect(events).toHaveLength(1);
      expect(events[0].hoursSlept).toBe(9);
    });

    it('does not sleep if confirm is denied', async () => {
      (callbacks.showConfirm as ReturnType<typeof vi.fn>).mockResolvedValue(false);
      timeManager.setTime(22, 0);
      const target = createFurnitureTarget('bed', 'Bed');
      await manager.handleInteraction(target);

      expect(timeManager.hour).toBe(22); // unchanged
    });

    it('sleeps at early morning hours (e.g. 3 AM)', async () => {
      timeManager.setTime(3, 0);
      const target = createFurnitureTarget('bed', 'Bed');
      await manager.handleInteraction(target);

      expect(timeManager.hour).toBe(7);
    });
  });

  // ── Bookshelf interactions ────────────────────────────────────────────

  describe('bookshelf interaction', () => {
    it('shows empty shelf message when no truths', async () => {
      const target = createFurnitureTarget('bookshelf', 'Bookshelf');
      await manager.handleInteraction(target);

      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Empty Shelf' }),
      );
    });

    it('shows lore popup from truths', async () => {
      const truths = [
        { id: 't1', title: 'Ancient Legend', content: 'Long ago, the river spoke...' },
      ];
      (callbacks.getTruths as ReturnType<typeof vi.fn>).mockReturnValue(truths);

      const target = createFurnitureTarget('bookshelf', 'Bookshelf');
      await manager.handleInteraction(target);

      expect(callbacks.showLorePopup).toHaveBeenCalledWith('Ancient Legend', 'Long ago, the river spoke...');
    });

    it('emits furniture_read_lore event', async () => {
      const events: any[] = [];
      eventBus.on('furniture_read_lore', (e) => events.push(e));

      const truths = [{ id: 't1', title: 'History', content: 'Content here' }];
      (callbacks.getTruths as ReturnType<typeof vi.fn>).mockReturnValue(truths);

      await manager.handleInteraction(createFurnitureTarget('bookshelf', 'Bookshelf'));

      expect(events).toHaveLength(1);
      expect(events[0].truthTitle).toBe('History');
      expect(events[0].truthId).toBe('t1');
    });
  });

  // ── Workstation interactions ──────────────────────────────────────────

  describe('workstation interaction', () => {
    it('rejects if no business type', async () => {
      const target = createFurnitureTarget('workstation', 'Counter');
      await manager.handleInteraction(target);

      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Cannot Work' }),
      );
    });

    it('rejects if player does not own the building', async () => {
      (callbacks.getCurrentBusinessType as ReturnType<typeof vi.fn>).mockReturnValue('bakery');
      const target = createFurnitureTarget('workstation', 'Counter');
      await manager.handleInteraction(target);

      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Not Your Business' }),
      );
    });

    it('allows work if player owns the business', async () => {
      const events: any[] = [];
      eventBus.on('furniture_worked', (e) => events.push(e));

      (callbacks.getCurrentBusinessType as ReturnType<typeof vi.fn>).mockReturnValue('bakery');
      (callbacks.isPlayerOwnedBuilding as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const target = createFurnitureTarget('workstation', 'Counter');
      await manager.handleInteraction(target);

      expect(callbacks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Working' }),
      );
      expect(events).toHaveLength(1);
      expect(events[0].businessType).toBe('bakery');
    });
  });

  // ── Non-furniture targets ─────────────────────────────────────────────

  it('returns false for non-furniture targets', async () => {
    const target: InteractableTarget = {
      type: 'object',
      id: 'some-object',
      name: 'Rock',
      mesh: {} as any,
      promptText: '[Enter]: Examine Rock',
    };
    const handled = await manager.handleInteraction(target);
    expect(handled).toBe(false);
  });

  // ── Dispose ──────────────────────────────────────────────────────────

  it('stands up on dispose if seated', async () => {
    await manager.handleInteraction(createFurnitureTarget('seat'));
    expect(manager.isSeated).toBe(true);

    manager.dispose();
    expect(manager.isSeated).toBe(false);
    expect(callbacks.setMovementLocked).toHaveBeenCalledWith(false);
  });
});
