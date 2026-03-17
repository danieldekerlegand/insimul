import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PointAndNameAction, type NameableObject } from '../PointAndNameAction';
import { GameEventBus } from '../GameEventBus';

function makeObject(overrides?: Partial<NameableObject>): NameableObject {
  return {
    objectId: 'obj-1',
    targetWord: 'pomme',
    englishMeaning: 'apple',
    category: 'food',
    difficulty: 'beginner',
    position: { x: 0, y: 0, z: 0 },
    ...overrides,
  };
}

describe('PointAndNameAction', () => {
  let action: PointAndNameAction;
  let eventBus: GameEventBus;

  beforeEach(() => {
    eventBus = new GameEventBus();
    action = new PointAndNameAction(eventBus);
  });

  // ── Registration ──────────────────────────────────────────────────────

  it('registers and queries objects', () => {
    action.registerObject(makeObject());
    expect(action.getTotalCount()).toBe(1);
    expect(action.getObjectInfo('obj-1')).not.toBeNull();
    expect(action.getObjectInfo('nonexistent')).toBeNull();
  });

  it('registers multiple objects', () => {
    action.registerObjects([
      makeObject({ objectId: 'a' }),
      makeObject({ objectId: 'b' }),
    ]);
    expect(action.getTotalCount()).toBe(2);
  });

  it('removes objects', () => {
    action.registerObject(makeObject());
    action.removeObject('obj-1');
    expect(action.getTotalCount()).toBe(0);
  });

  // ── Proximity ─────────────────────────────────────────────────────────

  it('finds objects in range', () => {
    action.registerObject(makeObject({ position: { x: 5, y: 0, z: 0 } }));
    const inRange = action.getObjectsInRange({ x: 0, y: 0, z: 0 });
    expect(inRange).toContain('obj-1');
  });

  it('excludes objects out of range', () => {
    action.registerObject(makeObject({ position: { x: 100, y: 0, z: 0 } }));
    const inRange = action.getObjectsInRange({ x: 0, y: 0, z: 0 });
    expect(inRange).toHaveLength(0);
  });

  it('excludes already-named objects from range', () => {
    action.registerObject(makeObject());
    action.submitName('obj-1', 'pomme');
    const inRange = action.getObjectsInRange({ x: 0, y: 0, z: 0 });
    expect(inRange).toHaveLength(0);
  });

  // ── pointAt ───────────────────────────────────────────────────────────

  it('pointAt triggers the prompt callback', () => {
    const onPrompt = vi.fn();
    action.setOnPrompt(onPrompt);
    action.registerObject(makeObject());

    const ok = action.pointAt('obj-1');
    expect(ok).toBe(true);
    expect(onPrompt).toHaveBeenCalledWith(
      expect.objectContaining({ objectId: 'obj-1' }),
      3, // default maxAttempts
    );
  });

  it('pointAt returns false for unknown object', () => {
    expect(action.pointAt('nonexistent')).toBe(false);
  });

  it('pointAt returns false for already-named object', () => {
    action.registerObject(makeObject());
    action.submitName('obj-1', 'pomme');
    expect(action.pointAt('obj-1')).toBe(false);
  });

  // ── submitName — correct answer ───────────────────────────────────────

  it('correct first-try answer awards full XP', () => {
    action.registerObject(makeObject());
    const result = action.submitName('obj-1', 'pomme');
    expect(result).not.toBeNull();
    expect(result!.correct).toBe(true);
    expect(result!.xpAwarded).toBe(5); // xpFirstTry default
    expect(result!.attempts).toBe(1);
    expect(action.isNamed('obj-1')).toBe(true);
  });

  it('correct retry answer awards reduced XP', () => {
    action.registerObject(makeObject());
    action.submitName('obj-1', 'wrong');
    const result = action.submitName('obj-1', 'pomme');
    expect(result!.correct).toBe(true);
    expect(result!.xpAwarded).toBe(2); // xpRetry default
    expect(result!.attempts).toBe(2);
  });

  it('case-insensitive matching by default', () => {
    action.registerObject(makeObject());
    const result = action.submitName('obj-1', 'POMME');
    expect(result!.correct).toBe(true);
  });

  it('trims whitespace from input', () => {
    action.registerObject(makeObject());
    const result = action.submitName('obj-1', '  pomme  ');
    expect(result!.correct).toBe(true);
  });

  // ── submitName — incorrect answer ─────────────────────────────────────

  it('incorrect answer does not mark as named', () => {
    action.registerObject(makeObject());
    const result = action.submitName('obj-1', 'banane');
    expect(result!.correct).toBe(false);
    expect(result!.xpAwarded).toBe(0);
    expect(action.isNamed('obj-1')).toBe(false);
  });

  it('tracks attempt counts', () => {
    action.registerObject(makeObject());
    action.submitName('obj-1', 'wrong1');
    action.submitName('obj-1', 'wrong2');
    expect(action.getAttempts('obj-1')).toBe(2);
  });

  it('reveals answer after max attempts', () => {
    const onReveal = vi.fn();
    action.setOnReveal(onReveal);
    action.registerObject(makeObject());

    action.submitName('obj-1', 'wrong1');
    action.submitName('obj-1', 'wrong2');
    action.submitName('obj-1', 'wrong3');

    expect(onReveal).toHaveBeenCalledWith(
      expect.objectContaining({ objectId: 'obj-1', targetWord: 'pomme' }),
    );
  });

  it('pointAt returns false after max attempts exhausted', () => {
    action = new PointAndNameAction(eventBus, { maxAttempts: 2 });
    action.registerObject(makeObject());
    action.submitName('obj-1', 'wrong1');
    action.submitName('obj-1', 'wrong2');
    expect(action.pointAt('obj-1')).toBe(false);
  });

  // ── submitName — already named ────────────────────────────────────────

  it('returns zero XP for already-named object', () => {
    action.registerObject(makeObject());
    action.submitName('obj-1', 'pomme');
    const again = action.submitName('obj-1', 'pomme');
    expect(again!.correct).toBe(true);
    expect(again!.xpAwarded).toBe(0);
  });

  it('returns null for unknown object', () => {
    expect(action.submitName('nonexistent', 'test')).toBeNull();
  });

  // ── Events ────────────────────────────────────────────────────────────

  it('emits object_named event on correct answer', () => {
    const handler = vi.fn();
    eventBus.on('object_named', handler);
    action.registerObject(makeObject());
    action.submitName('obj-1', 'pomme');

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'object_named',
        objectId: 'obj-1',
        targetWord: 'pomme',
        correct: true,
      }),
    );
  });

  it('emits vocabulary_used on correct answer', () => {
    const handler = vi.fn();
    eventBus.on('vocabulary_used', handler);
    action.registerObject(makeObject());
    action.submitName('obj-1', 'pomme');

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'vocabulary_used', word: 'pomme', correct: true }),
    );
  });

  it('emits vocabulary_used with correct=false on wrong answer', () => {
    const handler = vi.fn();
    eventBus.on('vocabulary_used', handler);
    action.registerObject(makeObject());
    action.submitName('obj-1', 'wrong');

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'vocabulary_used', word: 'pomme', correct: false }),
    );
  });

  it('does not emit object_named on wrong answer', () => {
    const handler = vi.fn();
    eventBus.on('object_named', handler);
    action.registerObject(makeObject());
    action.submitName('obj-1', 'wrong');
    expect(handler).not.toHaveBeenCalled();
  });

  // ── Callbacks ─────────────────────────────────────────────────────────

  it('fires onResult callback on every submission', () => {
    const onResult = vi.fn();
    action.setOnResult(onResult);
    action.registerObject(makeObject());

    action.submitName('obj-1', 'wrong');
    action.submitName('obj-1', 'pomme');
    expect(onResult).toHaveBeenCalledTimes(2);
  });

  // ── Query helpers ─────────────────────────────────────────────────────

  it('getUnnamedIds returns only unnamed objects', () => {
    action.registerObjects([
      makeObject({ objectId: 'a' }),
      makeObject({ objectId: 'b' }),
    ]);
    action.submitName('a', 'pomme');
    expect(action.getUnnamedIds()).toEqual(['b']);
  });

  it('getNamedCount increments on success', () => {
    action.registerObject(makeObject());
    expect(action.getNamedCount()).toBe(0);
    action.submitName('obj-1', 'pomme');
    expect(action.getNamedCount()).toBe(1);
  });

  // ── Config overrides ──────────────────────────────────────────────────

  it('respects custom XP config', () => {
    action = new PointAndNameAction(eventBus, { xpFirstTry: 10, xpRetry: 4 });
    action.registerObject(makeObject());
    const r1 = action.submitName('obj-1', 'pomme');
    expect(r1!.xpAwarded).toBe(10);

    action.registerObject(makeObject({ objectId: 'obj-2' }));
    action.submitName('obj-2', 'wrong');
    const r2 = action.submitName('obj-2', 'pomme');
    expect(r2!.xpAwarded).toBe(4);
  });

  it('case-sensitive mode rejects wrong case', () => {
    action = new PointAndNameAction(eventBus, { caseInsensitive: false });
    action.registerObject(makeObject());
    const result = action.submitName('obj-1', 'POMME');
    expect(result!.correct).toBe(false);
  });

  // ── Dispose ───────────────────────────────────────────────────────────

  it('dispose clears all state', () => {
    action.registerObject(makeObject());
    action.submitName('obj-1', 'pomme');
    action.dispose();

    expect(action.getTotalCount()).toBe(0);
    expect(action.getNamedCount()).toBe(0);
    expect(action.getAttempts('obj-1')).toBe(0);
  });

  // ── No event bus ──────────────────────────────────────────────────────

  it('works without an event bus', () => {
    const standalone = new PointAndNameAction();
    standalone.registerObject(makeObject());
    const result = standalone.submitName('obj-1', 'pomme');
    expect(result!.correct).toBe(true);
    expect(result!.xpAwarded).toBe(5);
    standalone.dispose();
  });
});
