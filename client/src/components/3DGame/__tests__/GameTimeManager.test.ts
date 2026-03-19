import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameTimeManager } from '../GameTimeManager';
import { GameEventBus } from '../GameEventBus';

describe('GameTimeManager', () => {
  let manager: GameTimeManager;
  let eventBus: GameEventBus;

  beforeEach(() => {
    eventBus = new GameEventBus();
    manager = new GameTimeManager({ startHour: 8, startMinute: 0, startDay: 1 });
    manager.setEventBus(eventBus);
  });

  // ── Default state ───────────────────────────────────────────────────────

  it('initializes with default values', () => {
    const m = new GameTimeManager();
    expect(m.hour).toBe(8);
    expect(m.minute).toBe(0);
    expect(m.day).toBe(1);
    expect(m.timestep).toBe(1);
    expect(m.paused).toBe(false);
    expect(m.timeScale).toBe(1);
    expect(m.isDaytime).toBe(true);
    expect(m.timeString).toBe('08:00');
  });

  it('respects custom options', () => {
    const m = new GameTimeManager({ startHour: 22, startMinute: 30, startDay: 5, msPerGameHour: 30_000 });
    expect(m.hour).toBe(22);
    expect(m.minute).toBe(30);
    expect(m.day).toBe(5);
    expect(m.isDaytime).toBe(false);
    expect(m.msPerGameHour).toBe(30_000);
  });

  // ── Time advancement ──────────────────────────────────────────────────

  it('advances minutes from accumulated delta time', () => {
    // Default: 60000ms per game hour → 1000ms per game minute
    manager.update(1000); // 1 real second = 1 game minute
    expect(manager.minute).toBe(1);
    expect(manager.hour).toBe(8);
  });

  it('rolls over to next hour after 60 minutes', () => {
    // Advance 60 game minutes = 60000ms
    manager.update(60_000);
    expect(manager.hour).toBe(9);
    expect(manager.minute).toBe(0);
  });

  it('rolls over to next day after 24 hours', () => {
    // From hour 8, need 16 hours to reach midnight = 16 * 60000ms
    manager.update(16 * 60_000); // hour 0, day 2
    expect(manager.hour).toBe(0);
    expect(manager.day).toBe(2);
  });

  it('does not advance when paused', () => {
    manager.pause();
    manager.update(120_000);
    expect(manager.hour).toBe(8);
    expect(manager.minute).toBe(0);
  });

  it('resumes correctly after pause', () => {
    manager.pause();
    manager.update(60_000);
    manager.resume();
    manager.update(60_000);
    expect(manager.hour).toBe(9);
  });

  // ── Time scale ────────────────────────────────────────────────────────

  it('applies time scale multiplier', () => {
    manager.setTimeScale(2);
    // At 2x, 1000ms real = 2 game minutes
    manager.update(1000);
    expect(manager.minute).toBe(2);
  });

  it('clamps time scale to valid range', () => {
    manager.setTimeScale(0.1);
    expect(manager.timeScale).toBe(0.25);
    manager.setTimeScale(100);
    expect(manager.timeScale).toBe(16);
  });

  it('clamps msPerGameHour minimum', () => {
    manager.setMsPerGameHour(100);
    expect(manager.msPerGameHour).toBe(1000);
  });

  // ── Time-of-day ───────────────────────────────────────────────────────

  it('returns correct time-of-day periods', () => {
    manager.setTime(3);
    expect(manager.timeOfDay).toBe('night');
    manager.setTime(5);
    expect(manager.timeOfDay).toBe('dawn');
    manager.setTime(7);
    expect(manager.timeOfDay).toBe('morning');
    manager.setTime(12);
    expect(manager.timeOfDay).toBe('midday');
    manager.setTime(15);
    expect(manager.timeOfDay).toBe('afternoon');
    manager.setTime(19);
    expect(manager.timeOfDay).toBe('evening');
    manager.setTime(22);
    expect(manager.timeOfDay).toBe('night');
  });

  // ── setTime ───────────────────────────────────────────────────────────

  it('setTime clamps values', () => {
    manager.setTime(25, 70, 0);
    expect(manager.hour).toBe(23);
    expect(manager.minute).toBe(59);
    expect(manager.day).toBe(1); // clamped to minimum 1
  });

  // ── Events ────────────────────────────────────────────────────────────

  it('emits hour_changed when hour rolls over', () => {
    const handler = vi.fn();
    eventBus.on('hour_changed', handler);

    manager.update(60_000); // advance 1 hour
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'hour_changed', hour: 9, day: 1 })
    );
  });

  it('emits day_changed when day rolls over', () => {
    const handler = vi.fn();
    eventBus.on('day_changed', handler);

    // Advance from 8:00 to midnight = 16 hours
    manager.update(16 * 60_000);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'day_changed', day: 2, timestep: 2 })
    );
  });

  it('emits time_of_day_changed on period transitions', () => {
    const handler = vi.fn();
    eventBus.on('time_of_day_changed', handler);

    // Start at 8 (morning). Advance to 10 (midday) = 2 hours
    manager.update(2 * 60_000);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'time_of_day_changed', from: 'morning', to: 'midday' })
    );
  });

  it('does not emit events when paused', () => {
    const handler = vi.fn();
    eventBus.on('hour_changed', handler);

    manager.pause();
    manager.update(60_000);
    expect(handler).not.toHaveBeenCalled();
  });

  // ── Serialization ─────────────────────────────────────────────────────

  it('round-trips through getState/restoreState', () => {
    manager.setTime(14, 30, 3);
    manager.setTimeScale(4);
    manager.pause();

    const state = manager.getState();
    expect(state).toEqual({
      hour: 14,
      minute: 30,
      day: 3,
      msPerGameHour: 60_000,
      paused: true,
      timeScale: 4,
    });

    const m2 = new GameTimeManager();
    m2.restoreState(state);
    expect(m2.hour).toBe(14);
    expect(m2.minute).toBe(30);
    expect(m2.day).toBe(3);
    expect(m2.timeScale).toBe(4);
    expect(m2.paused).toBe(true);
  });

  // ── realSecondsPerGameHour ────────────────────────────────────────────

  it('computes realSecondsPerGameHour at default scale', () => {
    // 60000ms / (1 * 1000) = 60 seconds
    expect(manager.realSecondsPerGameHour).toBe(60);
  });

  it('computes realSecondsPerGameHour at 2x scale', () => {
    manager.setTimeScale(2);
    // 60000ms / (2 * 1000) = 30 seconds
    expect(manager.realSecondsPerGameHour).toBe(30);
  });

  // ── timeString formatting ─────────────────────────────────────────────

  it('formats timeString with zero-padding', () => {
    manager.setTime(5, 3);
    expect(manager.timeString).toBe('05:03');
    manager.setTime(23, 59);
    expect(manager.timeString).toBe('23:59');
  });

  // ── dispose ───────────────────────────────────────────────────────────

  it('stops emitting events after dispose', () => {
    const handler = vi.fn();
    eventBus.on('hour_changed', handler);

    manager.dispose();
    manager.update(60_000);
    expect(handler).not.toHaveBeenCalled();
  });

  // ── Multi-hour advance in single frame ────────────────────────────────

  it('handles large delta spanning multiple hours', () => {
    const hourHandler = vi.fn();
    eventBus.on('hour_changed', hourHandler);

    // Advance 3 hours in one frame
    manager.update(3 * 60_000);
    expect(manager.hour).toBe(11);
    expect(hourHandler).toHaveBeenCalledTimes(3);
  });

  it('handles large delta spanning a full day', () => {
    const dayHandler = vi.fn();
    eventBus.on('day_changed', dayHandler);

    // Advance 24 hours
    manager.update(24 * 60_000);
    expect(manager.day).toBe(2);
    expect(manager.hour).toBe(8); // back to starting hour
    expect(dayHandler).toHaveBeenCalledTimes(1);
  });
});
