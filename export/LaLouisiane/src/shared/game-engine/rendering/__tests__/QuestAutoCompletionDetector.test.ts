/**
 * Tests for QuestAutoCompletionDetector
 *
 * Tests periodic quest completion detection, duplicate prevention,
 * start/stop lifecycle, and edge cases.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  QuestAutoCompletionDetector,
  type ActiveQuest,
  type AutoCompletionHandler,
} from '../../logic/QuestAutoCompletionDetector';

function makeQuest(overrides?: Partial<ActiveQuest>): ActiveQuest {
  return {
    id: 'quest-1',
    worldId: 'world-1',
    title: 'Learn Greetings',
    status: 'active',
    objectives: [
      { id: 'obj-1', completed: false },
      { id: 'obj-2', completed: false },
    ],
    ...overrides,
  };
}

describe('QuestAutoCompletionDetector', () => {
  let quests: ActiveQuest[];
  let handler: AutoCompletionHandler;
  let detector: QuestAutoCompletionDetector;

  beforeEach(() => {
    vi.useFakeTimers();
    quests = [];
    handler = vi.fn();
    detector = new QuestAutoCompletionDetector(
      () => quests,
      handler,
      2000,
    );
  });

  afterEach(() => {
    detector.dispose();
    vi.useRealTimers();
  });

  describe('check()', () => {
    it('should not fire for quests with incomplete objectives', () => {
      quests = [makeQuest()];
      detector.check();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should fire for quest with all objectives completed', () => {
      quests = [makeQuest({
        objectives: [
          { id: 'obj-1', completed: true },
          { id: 'obj-2', completed: true },
        ],
      })];
      detector.check();
      expect(handler).toHaveBeenCalledWith(quests[0]);
    });

    it('should not fire twice for the same quest', () => {
      quests = [makeQuest({
        objectives: [
          { id: 'obj-1', completed: true },
          { id: 'obj-2', completed: true },
        ],
      })];
      detector.check();
      detector.check();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should skip quests with status "completed"', () => {
      quests = [makeQuest({
        status: 'completed',
        objectives: [
          { id: 'obj-1', completed: true },
          { id: 'obj-2', completed: true },
        ],
      })];
      detector.check();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should skip quests with no objectives', () => {
      quests = [makeQuest({ objectives: [] })];
      detector.check();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should detect multiple quest completions in one check', () => {
      quests = [
        makeQuest({
          id: 'quest-1',
          objectives: [{ id: 'obj-1', completed: true }],
        }),
        makeQuest({
          id: 'quest-2',
          title: 'Second Quest',
          objectives: [{ id: 'obj-2', completed: true }],
        }),
      ];
      detector.check();
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should handle partially complete quests', () => {
      quests = [makeQuest({
        objectives: [
          { id: 'obj-1', completed: true },
          { id: 'obj-2', completed: false },
        ],
      })];
      detector.check();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('periodic checking', () => {
    it('should check on interval after start()', () => {
      quests = [makeQuest({
        objectives: [{ id: 'obj-1', completed: true }],
      })];
      detector.start();
      expect(handler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(2000);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should check multiple times', () => {
      detector.start();

      // First interval - no complete quests
      quests = [makeQuest()];
      vi.advanceTimersByTime(2000);
      expect(handler).not.toHaveBeenCalled();

      // Second interval - quest now complete
      quests[0].objectives = [
        { id: 'obj-1', completed: true },
        { id: 'obj-2', completed: true },
      ];
      vi.advanceTimersByTime(2000);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should stop checking after stop()', () => {
      quests = [makeQuest({
        objectives: [{ id: 'obj-1', completed: true }],
      })];
      detector.start();
      detector.stop();

      vi.advanceTimersByTime(4000);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should not start twice', () => {
      detector.start();
      detector.start();
      // Only one interval should be running
      quests = [makeQuest({
        objectives: [{ id: 'obj-1', completed: true }],
      })];
      vi.advanceTimersByTime(2000);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('markCompleted()', () => {
    it('should prevent detection of pre-marked quests', () => {
      quests = [makeQuest({
        objectives: [{ id: 'obj-1', completed: true }],
      })];
      detector.markCompleted('quest-1');
      detector.check();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('lifecycle', () => {
    it('should report running state correctly', () => {
      expect(detector.isRunning()).toBe(false);
      detector.start();
      expect(detector.isRunning()).toBe(true);
      detector.stop();
      expect(detector.isRunning()).toBe(false);
    });

    it('should track completed IDs', () => {
      quests = [makeQuest({
        objectives: [{ id: 'obj-1', completed: true }],
      })];
      detector.check();
      expect(detector.getCompletedIds().has('quest-1')).toBe(true);
    });

    it('should clear state on dispose', () => {
      detector.start();
      detector.markCompleted('quest-1');
      detector.dispose();
      expect(detector.isRunning()).toBe(false);
      expect(detector.getCompletedIds().size).toBe(0);
    });
  });
});
