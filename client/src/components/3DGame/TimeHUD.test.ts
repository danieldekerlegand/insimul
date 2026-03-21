/**
 * Tests for Time HUD indicator and time controls
 *
 * Run with: npx tsx client/src/components/3DGame/TimeHUD.test.ts
 *
 * Tests the GameTimeManager time-of-day detection, time scale stepping,
 * pause/resume, and keyboard map exports.
 */

import { GameTimeManager, type TimeOfDay } from './GameTimeManager';
import { GameEventBus } from './GameEventBus';
import {
  KEY_TIME_PAUSE,
  KEY_TIME_SLOW,
  KEY_TIME_FAST,
} from './KeyboardMap';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Time-of-day detection
// ---------------------------------------------------------------------------

console.log('\n── Time-of-day detection ──');

{
  const tm = new GameTimeManager({ startHour: 5 });
  assert(tm.timeOfDay === 'dawn', 'hour 5 => dawn');
}
{
  const tm = new GameTimeManager({ startHour: 8 });
  assert(tm.timeOfDay === 'morning', 'hour 8 => morning');
}
{
  const tm = new GameTimeManager({ startHour: 12 });
  assert(tm.timeOfDay === 'midday', 'hour 12 => midday');
}
{
  const tm = new GameTimeManager({ startHour: 15 });
  assert(tm.timeOfDay === 'afternoon', 'hour 15 => afternoon');
}
{
  const tm = new GameTimeManager({ startHour: 18 });
  assert(tm.timeOfDay === 'evening', 'hour 18 => evening');
}
{
  const tm = new GameTimeManager({ startHour: 23 });
  assert(tm.timeOfDay === 'night', 'hour 23 => night');
}
{
  const tm = new GameTimeManager({ startHour: 3 });
  assert(tm.timeOfDay === 'night', 'hour 3 => night');
}

// ---------------------------------------------------------------------------
// timeString formatting
// ---------------------------------------------------------------------------

console.log('\n── timeString formatting ──');

{
  const tm = new GameTimeManager({ startHour: 8, startMinute: 5 });
  assert(tm.timeString === '08:05', 'pads single-digit hour and minute');
}
{
  const tm = new GameTimeManager({ startHour: 14, startMinute: 30 });
  assert(tm.timeString === '14:30', 'double-digit hour and minute');
}

// ---------------------------------------------------------------------------
// Pause / resume
// ---------------------------------------------------------------------------

console.log('\n── Pause / resume ──');

{
  const tm = new GameTimeManager({ startHour: 8 });
  assert(!tm.paused, 'starts unpaused');
  tm.pause();
  assert(tm.paused, 'pause sets paused');
  const h = tm.hour;
  tm.update(120_000); // 2 minutes of real time
  assert(tm.hour === h, 'time does not advance while paused');
  tm.resume();
  assert(!tm.paused, 'resume clears paused');
}

// ---------------------------------------------------------------------------
// Time scale
// ---------------------------------------------------------------------------

console.log('\n── Time scale ──');

{
  const tm = new GameTimeManager({ startHour: 8 });
  assert(tm.timeScale === 1, 'default time scale is 1');
  tm.setTimeScale(4);
  assert(tm.timeScale === 4, 'setTimeScale(4) => 4');
  tm.setTimeScale(0.1);
  assert(tm.timeScale === 0.25, 'clamps to min 0.25');
  tm.setTimeScale(100);
  assert(tm.timeScale === 16, 'clamps to max 16');
}

// ---------------------------------------------------------------------------
// Time advance
// ---------------------------------------------------------------------------

console.log('\n── Time advance ──');

{
  const tm = new GameTimeManager({ startHour: 8, startMinute: 0, msPerGameHour: 60_000 });
  tm.update(60_000); // 1 real minute = 1 game hour at default rate
  assert(tm.hour === 9, 'advances 1 hour after 60s at 1x');
  assert(tm.minute === 0, 'minute resets after full hour');
}
{
  const tm = new GameTimeManager({ startHour: 8, startMinute: 0, msPerGameHour: 60_000 });
  tm.setTimeScale(2);
  tm.update(60_000); // At 2x, 60s real = 2 game hours
  assert(tm.hour === 10, 'advances 2 hours at 2x speed');
}

// ---------------------------------------------------------------------------
// Day rollover and events
// ---------------------------------------------------------------------------

console.log('\n── Day rollover ──');

{
  const bus = new GameEventBus();
  const events: string[] = [];
  bus.on('day_changed', () => events.push('day'));
  bus.on('hour_changed', () => events.push('hour'));

  const tm = new GameTimeManager({ startHour: 23, startMinute: 59, msPerGameHour: 60_000 });
  tm.setEventBus(bus);
  tm.update(2_000); // 2s => 2 game minutes => rolls to 00:01 next day
  assert(tm.hour === 0, 'hour rolls over to 0');
  assert(tm.day === 2, 'day increments');
  assert(events.includes('day'), 'day_changed event fired');
  assert(events.includes('hour'), 'hour_changed event fired');
}

// ---------------------------------------------------------------------------
// time_of_day_changed event
// ---------------------------------------------------------------------------

console.log('\n── time_of_day_changed event ──');

{
  const bus = new GameEventBus();
  const todChanges: Array<{ from: string; to: string }> = [];
  bus.on('time_of_day_changed', (e: any) => todChanges.push({ from: e.from, to: e.to }));

  const tm = new GameTimeManager({ startHour: 6, startMinute: 59, msPerGameHour: 60_000 });
  tm.setEventBus(bus);
  tm.update(2_000); // => 07:01, dawn->morning
  assert(todChanges.length === 1, 'time_of_day_changed fired once');
  assert(todChanges[0].from === 'dawn', 'from dawn');
  assert(todChanges[0].to === 'morning', 'to morning');
}

// ---------------------------------------------------------------------------
// Serialization round-trip
// ---------------------------------------------------------------------------

console.log('\n── Serialization ──');

{
  const tm = new GameTimeManager({ startHour: 14, startMinute: 30 });
  tm.setTimeScale(4);
  tm.pause();
  const state = tm.getState();
  const tm2 = new GameTimeManager();
  tm2.restoreState(state);
  assert(tm2.hour === 14, 'restored hour');
  assert(tm2.minute === 30, 'restored minute');
  assert(tm2.timeScale === 4, 'restored timeScale');
  assert(tm2.paused === true, 'restored paused');
}

// ---------------------------------------------------------------------------
// Speed stepping logic (mirrors BabylonGame.handleTimeSpeedChange)
// ---------------------------------------------------------------------------

console.log('\n── Speed stepping ──');

{
  const STEPS = [0.25, 0.5, 1, 2, 4, 8, 16];

  function stepSpeed(currentScale: number, delta: number): number {
    let idx = STEPS.findIndex(s => s >= currentScale);
    if (idx === -1) idx = STEPS.length - 1;
    idx = Math.max(0, Math.min(STEPS.length - 1, idx + delta));
    return STEPS[idx];
  }

  assert(stepSpeed(1, 1) === 2, '1x + up => 2x');
  assert(stepSpeed(1, -1) === 0.5, '1x + down => 0.5x');
  assert(stepSpeed(0.25, -1) === 0.25, '0.25x + down => stays 0.25x (min)');
  assert(stepSpeed(16, 1) === 16, '16x + up => stays 16x (max)');
  assert(stepSpeed(4, 1) === 8, '4x + up => 8x');
  assert(stepSpeed(2, -1) === 1, '2x + down => 1x');
}

// ---------------------------------------------------------------------------
// Keyboard map exports
// ---------------------------------------------------------------------------

console.log('\n── Keyboard map ──');

assert(KEY_TIME_PAUSE === 'Period', 'KEY_TIME_PAUSE = Period');
assert(KEY_TIME_SLOW === 'Comma', 'KEY_TIME_SLOW = Comma');
assert(KEY_TIME_FAST === 'Slash', 'KEY_TIME_FAST = Slash');

// ---------------------------------------------------------------------------
// isDaytime
// ---------------------------------------------------------------------------

console.log('\n── isDaytime ──');

{
  const tm = new GameTimeManager({ startHour: 12 });
  assert(tm.isDaytime === true, 'noon is daytime');
}
{
  const tm = new GameTimeManager({ startHour: 22 });
  assert(tm.isDaytime === false, '10pm is not daytime');
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
