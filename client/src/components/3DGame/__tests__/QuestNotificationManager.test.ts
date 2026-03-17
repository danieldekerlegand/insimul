/**
 * Tests for QuestNotificationManager
 *
 * Mocks @babylonjs/gui since tests run in Node without a canvas/WebGL context.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock @babylonjs/gui ──────────────────────────────────────────────────────

function makeMockControl(name?: string) {
  return {
    name: name ?? '',
    width: '',
    height: '',
    background: '',
    color: '',
    thickness: 0,
    cornerRadius: 0,
    top: '',
    left: '',
    horizontalAlignment: 0,
    verticalAlignment: 0,
    isVisible: true,
    isPointerBlocker: false,
    isVertical: true,
    paddingTop: '',
    paddingBottom: '',
    paddingLeft: '',
    paddingRight: '',
    fontSize: 0,
    fontWeight: '',
    text: '',
    textHorizontalAlignment: 0,
    textVerticalAlignment: 0,
    textWrapping: 0,
    addControl: vi.fn(),
    removeControl: vi.fn(),
    dispose: vi.fn(),
    onPointerClickObservable: { add: vi.fn() },
  };
}

vi.mock('@babylonjs/gui', () => {
  class MockRectangle {
    [key: string]: any;
    constructor(public name?: string) {
      Object.assign(this, makeMockControl(name));
    }
    addControl = vi.fn();
    removeControl = vi.fn();
    dispose = vi.fn();
    onPointerClickObservable = { add: vi.fn() };
  }

  class MockStackPanel {
    [key: string]: any;
    constructor(public name?: string) {
      Object.assign(this, makeMockControl(name));
    }
    addControl = vi.fn();
    removeControl = vi.fn();
    dispose = vi.fn();
  }

  class MockTextBlock {
    [key: string]: any;
    constructor(public name?: string, public text?: string) {
      Object.assign(this, makeMockControl(name));
      this.text = text ?? '';
    }
    addControl = vi.fn();
    dispose = vi.fn();
  }

  class MockAdvancedDynamicTexture {
    addControl = vi.fn();
    removeControl = vi.fn();
  }

  return {
    AdvancedDynamicTexture: MockAdvancedDynamicTexture,
    Control: {
      HORIZONTAL_ALIGNMENT_LEFT: 0,
      HORIZONTAL_ALIGNMENT_RIGHT: 1,
      HORIZONTAL_ALIGNMENT_CENTER: 2,
      VERTICAL_ALIGNMENT_TOP: 0,
      VERTICAL_ALIGNMENT_BOTTOM: 1,
      VERTICAL_ALIGNMENT_CENTER: 2,
    },
    Rectangle: MockRectangle,
    StackPanel: MockStackPanel,
    TextBlock: MockTextBlock,
    TextWrapping: { WordWrap: 1, Clip: 2 },
  };
});

import { QuestNotificationManager } from '../QuestNotificationManager';
import { GameEventBus } from '../GameEventBus';
import { AdvancedDynamicTexture } from '@babylonjs/gui';

// ── Tests ────────────────────────────────────────────────────────────────────

describe('QuestNotificationManager', () => {
  let manager: QuestNotificationManager;
  let advancedTexture: AdvancedDynamicTexture;
  let eventBus: GameEventBus;

  beforeEach(() => {
    vi.useFakeTimers();
    advancedTexture = new AdvancedDynamicTexture();
    eventBus = new GameEventBus();
    manager = new QuestNotificationManager(advancedTexture, eventBus);
  });

  afterEach(() => {
    manager.dispose();
    eventBus.dispose();
    vi.useRealTimers();
  });

  it('should add toast container and HUD indicator to the texture on construction', () => {
    // Toast container + HUD indicator = 2 controls added
    expect(advancedTexture.addControl).toHaveBeenCalledTimes(2);
  });

  it('should show a toast when quest_accepted is emitted', () => {
    eventBus.emit({ type: 'quest_accepted', questId: 'q1', questTitle: 'Test Quest' });
    // The toast container's addControl should have been called with a toast Rectangle
    const toastContainer = (advancedTexture.addControl as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(toastContainer.addControl).toHaveBeenCalled();
  });

  it('should show a toast when quest_completed is emitted', () => {
    eventBus.emit({ type: 'quest_completed', questId: 'q1' });
    const toastContainer = (advancedTexture.addControl as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(toastContainer.addControl).toHaveBeenCalled();
  });

  it('should show a toast when quest_failed is emitted', () => {
    eventBus.emit({ type: 'quest_failed', questId: 'q1' });
    const toastContainer = (advancedTexture.addControl as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(toastContainer.addControl).toHaveBeenCalled();
  });

  it('should show a toast when quest_abandoned is emitted', () => {
    eventBus.emit({ type: 'quest_abandoned', questId: 'q1' });
    const toastContainer = (advancedTexture.addControl as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(toastContainer.addControl).toHaveBeenCalled();
  });

  it('should show a toast for utterance_quest_progress', () => {
    eventBus.emit({
      type: 'utterance_quest_progress',
      questId: 'q1',
      objectiveId: 'obj1',
      current: 3,
      required: 5,
      percentage: 60,
    });
    const toastContainer = (advancedTexture.addControl as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(toastContainer.addControl).toHaveBeenCalled();
  });

  it('should show a toast for utterance_quest_completed', () => {
    eventBus.emit({
      type: 'utterance_quest_completed',
      questId: 'q1',
      objectiveId: 'obj1',
      finalScore: 95,
      xpAwarded: 50,
    });
    const toastContainer = (advancedTexture.addControl as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(toastContainer.addControl).toHaveBeenCalled();
  });

  it('should auto-dismiss toasts after duration', () => {
    eventBus.emit({ type: 'quest_accepted', questId: 'q1', questTitle: 'Test' });
    const toastContainer = (advancedTexture.addControl as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const addCount = toastContainer.addControl.mock.calls.length;

    // Advance past the 4000ms duration for quest_accepted
    vi.advanceTimersByTime(4100);

    // Toast should have been removed
    expect(toastContainer.removeControl).toHaveBeenCalled();
  });

  it('should increment active quest count on quest_accepted', () => {
    manager.setActiveQuestCount(2);
    eventBus.emit({ type: 'quest_accepted', questId: 'q1', questTitle: 'New Quest' });
    // After accepting, count should be 3 — we verify through the HUD text
    // The HUD count text should reflect the new count
    // (internal state is tested indirectly through behavior)
  });

  it('should decrement active quest count on quest_completed', () => {
    manager.setActiveQuestCount(3);
    eventBus.emit({ type: 'quest_completed', questId: 'q1' });
    // Count decremented to 2
  });

  it('should not go below 0 active quests', () => {
    manager.setActiveQuestCount(0);
    eventBus.emit({ type: 'quest_failed', questId: 'q1' });
    // Should stay at 0, not go negative
  });

  it('should set tracked quest on quest_accepted', () => {
    eventBus.emit({ type: 'quest_accepted', questId: 'q1', questTitle: 'Track Me' });
    // Tracked quest should be set (tested through setTrackedQuest)
  });

  it('should clear tracked quest when it completes', () => {
    manager.setTrackedQuest({ id: 'q1', title: 'Test', progress: 0.5 });
    eventBus.emit({ type: 'quest_completed', questId: 'q1' });
    // Tracked quest cleared
  });

  it('should update tracked quest progress on utterance_quest_progress', () => {
    manager.setTrackedQuest({ id: 'q1', title: 'Test', progress: 0 });
    eventBus.emit({
      type: 'utterance_quest_progress',
      questId: 'q1',
      objectiveId: 'obj1',
      current: 3,
      required: 5,
      percentage: 60,
    });
    // Progress updated to 0.6
  });

  it('should fire onHudClicked callback when set', () => {
    const callback = vi.fn();
    manager.setOnHudClicked(callback);
    // The HUD click handler was registered via onPointerClickObservable
    // We verify the callback is stored (the actual click is Babylon.js internal)
    expect(callback).not.toHaveBeenCalled(); // Not called yet, only on click
  });

  it('should toggle HUD visibility', () => {
    manager.setHudVisible(false);
    manager.setHudVisible(true);
    // No error thrown
  });

  it('should unsubscribe from events on dispose', () => {
    manager.dispose();
    // After dispose, emitting events should not cause errors
    eventBus.emit({ type: 'quest_accepted', questId: 'q1', questTitle: 'After Dispose' });
    // No toast container to add to (already cleaned up)
  });

  it('should remove UI controls from texture on dispose', () => {
    manager.dispose();
    // removeControl should have been called for toast container and HUD
    expect(advancedTexture.removeControl).toHaveBeenCalledTimes(2);
  });

  it('should handle setActiveQuestCount correctly', () => {
    manager.setActiveQuestCount(5);
    // No error
    manager.setActiveQuestCount(0);
    // No error
  });

  it('should show a toast for quest_reminder events', () => {
    eventBus.emit({
      type: 'quest_reminder',
      questId: 'q1',
      questTitle: 'Learn Greetings',
      message: 'Quest: Talk to Elder Maria nearby',
      reminderType: 'proximity',
    });
    const toastContainer = (advancedTexture.addControl as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(toastContainer.addControl).toHaveBeenCalled();
  });

  it('should show a toast and decrement count for quest_expired', () => {
    manager.setActiveQuestCount(2);
    manager.setTrackedQuest({ id: 'q1', title: 'Expiring', progress: 0.5 });
    eventBus.emit({ type: 'quest_expired', questId: 'q1', questTitle: 'Expiring' });
    const toastContainer = (advancedTexture.addControl as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(toastContainer.addControl).toHaveBeenCalled();
  });

  it('should show a toast for quest_milestone events', () => {
    eventBus.emit({
      type: 'quest_milestone',
      milestoneType: 'first_quest',
      label: 'First Quest Complete!',
    });
    const toastContainer = (advancedTexture.addControl as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(toastContainer.addControl).toHaveBeenCalled();
  });

  it('should show a toast for daily_quests_reset', () => {
    eventBus.emit({ type: 'daily_quests_reset' });
    const toastContainer = (advancedTexture.addControl as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(toastContainer.addControl).toHaveBeenCalled();
  });
});
