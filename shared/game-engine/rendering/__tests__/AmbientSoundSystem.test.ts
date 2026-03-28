import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AmbientSoundSystem, type AmbientSoundCallbacks, type AmbientProfile } from '../../logic/AmbientSoundSystem';
import { GameEventBus } from '../../logic/GameEventBus';

function makeCallbacks(): AmbientSoundCallbacks & {
  onLayerStart: ReturnType<typeof vi.fn>;
  onLayerStop: ReturnType<typeof vi.fn>;
  onLayerVolumeChange: ReturnType<typeof vi.fn>;
} {
  return {
    onLayerStart: vi.fn(),
    onLayerStop: vi.fn(),
    onLayerVolumeChange: vi.fn(),
  };
}

describe('AmbientSoundSystem', () => {
  let callbacks: ReturnType<typeof makeCallbacks>;
  let system: AmbientSoundSystem;

  beforeEach(() => {
    callbacks = makeCallbacks();
    system = new AmbientSoundSystem(callbacks);
  });

  // ── Initialization ───────────────────────────────────────────────────

  it('starts in a stopped state with no active layers', () => {
    expect(system.isRunning).toBe(false);
    expect(system.activeLayerIds).toEqual([]);
  });

  it('defaults to wilderness/morning', () => {
    expect(system.environment).toBe('wilderness');
    expect(system.timeOfDay).toBe('morning');
  });

  // ── Start / stop ─────────────────────────────────────────────────────

  it('starts layers when started', () => {
    system.start('wilderness', 'morning');
    expect(system.isRunning).toBe(true);
    expect(callbacks.onLayerStart).toHaveBeenCalled();
    expect(system.activeLayerIds.length).toBeGreaterThan(0);
  });

  it('accepts initial environment and time on start', () => {
    system.start('settlement', 'night');
    expect(system.environment).toBe('settlement');
    expect(system.timeOfDay).toBe('night');
  });

  it('stops all layers when stopped', () => {
    system.start('wilderness', 'morning');
    const layerCount = system.activeLayerIds.length;

    system.stop();
    expect(system.isRunning).toBe(false);
    expect(system.activeLayerIds).toEqual([]);
    expect(callbacks.onLayerStop).toHaveBeenCalledTimes(layerCount);
  });

  // ── Environment changes ──────────────────────────────────────────────

  it('transitions layers when environment changes', () => {
    system.start('wilderness', 'morning');
    callbacks.onLayerStart.mockClear();
    callbacks.onLayerStop.mockClear();

    system.setEnvironment('settlement');
    expect(system.environment).toBe('settlement');
    // Some layers should have been stopped and new ones started
    expect(callbacks.onLayerStop.mock.calls.length + callbacks.onLayerStart.mock.calls.length).toBeGreaterThan(0);
  });

  it('does nothing when setting the same environment', () => {
    system.start('wilderness', 'morning');
    callbacks.onLayerStart.mockClear();
    callbacks.onLayerStop.mockClear();

    system.setEnvironment('wilderness');
    expect(callbacks.onLayerStart).not.toHaveBeenCalled();
    expect(callbacks.onLayerStop).not.toHaveBeenCalled();
  });

  it('does not apply profile when not running', () => {
    system.setEnvironment('settlement');
    expect(system.environment).toBe('settlement');
    expect(callbacks.onLayerStart).not.toHaveBeenCalled();
  });

  // ── Time-of-day changes ──────────────────────────────────────────────

  it('transitions layers when time of day changes', () => {
    system.start('wilderness', 'morning');
    callbacks.onLayerStart.mockClear();
    callbacks.onLayerStop.mockClear();

    system.setTimeOfDay('night');
    expect(system.timeOfDay).toBe('night');
    expect(callbacks.onLayerStop.mock.calls.length + callbacks.onLayerStart.mock.calls.length).toBeGreaterThan(0);
  });

  it('does nothing when setting the same time of day', () => {
    system.start('wilderness', 'morning');
    callbacks.onLayerStart.mockClear();

    system.setTimeOfDay('morning');
    expect(callbacks.onLayerStart).not.toHaveBeenCalled();
  });

  // ── Layer diffing ────────────────────────────────────────────────────

  it('keeps shared layers and updates volume if changed', () => {
    const profiles: AmbientProfile[] = [
      { environment: 'wilderness', timeOfDay: 'morning', layers: [
        { id: 'wind', volume: 0.3, loop: true },
        { id: 'birds', volume: 0.5, loop: true },
      ]},
      { environment: 'wilderness', timeOfDay: 'evening', layers: [
        { id: 'wind', volume: 0.6, loop: true }, // same layer, different volume
        { id: 'crickets', volume: 0.4, loop: true }, // new layer
      ]},
    ];

    const sys = new AmbientSoundSystem(callbacks, profiles);
    sys.start('wilderness', 'morning');
    expect(callbacks.onLayerStart).toHaveBeenCalledTimes(2);

    callbacks.onLayerStart.mockClear();
    callbacks.onLayerStop.mockClear();
    callbacks.onLayerVolumeChange.mockClear();

    sys.setTimeOfDay('evening');

    // 'birds' should be stopped
    expect(callbacks.onLayerStop).toHaveBeenCalledWith('birds');
    // 'wind' volume should be updated
    expect(callbacks.onLayerVolumeChange).toHaveBeenCalledWith('wind', 0.6);
    // 'crickets' should be started
    expect(callbacks.onLayerStart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'crickets' })
    );
  });

  it('does not call volumeChange when volume is the same', () => {
    const profiles: AmbientProfile[] = [
      { environment: 'wilderness', timeOfDay: 'morning', layers: [
        { id: 'wind', volume: 0.3, loop: true },
      ]},
      { environment: 'wilderness', timeOfDay: 'evening', layers: [
        { id: 'wind', volume: 0.3, loop: true },
      ]},
    ];

    const sys = new AmbientSoundSystem(callbacks, profiles);
    sys.start('wilderness', 'morning');
    callbacks.onLayerVolumeChange.mockClear();
    callbacks.onLayerStart.mockClear();
    callbacks.onLayerStop.mockClear();

    sys.setTimeOfDay('evening');
    expect(callbacks.onLayerVolumeChange).not.toHaveBeenCalled();
    expect(callbacks.onLayerStart).not.toHaveBeenCalled();
    expect(callbacks.onLayerStop).not.toHaveBeenCalled();
  });

  // ── Profile resolution ────────────────────────────────────────────────

  it('getProfile returns the matching profile', () => {
    const profile = system.getProfile('wilderness', 'dawn');
    expect(profile).not.toBeNull();
    expect(profile!.environment).toBe('wilderness');
    expect(profile!.timeOfDay).toBe('dawn');
  });

  it('getProfile returns null for unknown combo', () => {
    const sys = new AmbientSoundSystem(callbacks, []);
    expect(sys.getProfile('wilderness', 'dawn')).toBeNull();
  });

  it('stops all layers when profile is missing', () => {
    const profiles: AmbientProfile[] = [
      { environment: 'wilderness', timeOfDay: 'morning', layers: [
        { id: 'wind', volume: 0.3, loop: true },
      ]},
    ];
    const sys = new AmbientSoundSystem(callbacks, profiles);
    sys.start('wilderness', 'morning');
    callbacks.onLayerStop.mockClear();

    sys.setTimeOfDay('night'); // no profile for wilderness+night
    expect(callbacks.onLayerStop).toHaveBeenCalledWith('wind');
    expect(sys.activeLayerIds).toEqual([]);
  });

  // ── Event bus integration ─────────────────────────────────────────────

  it('responds to time_of_day_changed events', () => {
    const eventBus = new GameEventBus();
    system.connectEventBus(eventBus);
    system.start('wilderness', 'morning');
    callbacks.onLayerStart.mockClear();
    callbacks.onLayerStop.mockClear();

    eventBus.emit({ type: 'time_of_day_changed', from: 'morning', to: 'night', hour: 20 });
    expect(system.timeOfDay).toBe('night');
  });

  it('responds to settlement_entered events', () => {
    const eventBus = new GameEventBus();
    system.connectEventBus(eventBus);
    system.start('wilderness', 'morning');

    eventBus.emit({ type: 'settlement_entered', settlementId: 's1', settlementName: 'Town' });
    expect(system.environment).toBe('settlement');
  });

  // ── Dispose ──────────────────────────────────────────────────────────

  it('dispose stops layers and disconnects events', () => {
    const eventBus = new GameEventBus();
    system.connectEventBus(eventBus);
    system.start('wilderness', 'morning');

    system.dispose();
    expect(system.isRunning).toBe(false);
    expect(system.activeLayerIds).toEqual([]);

    // Events should no longer reach the system
    callbacks.onLayerStart.mockClear();
    eventBus.emit({ type: 'time_of_day_changed', from: 'morning', to: 'night', hour: 20 });
    expect(callbacks.onLayerStart).not.toHaveBeenCalled();
  });

  // ── Default profiles cover all environment/time combos ────────────────

  it('has default profiles for all environment × time-of-day combinations', () => {
    const environments = ['wilderness', 'settlement', 'indoor'] as const;
    const times = ['dawn', 'morning', 'midday', 'afternoon', 'evening', 'night'] as const;

    for (const env of environments) {
      for (const tod of times) {
        const profile = system.getProfile(env, tod);
        expect(profile, `Missing profile: ${env}/${tod}`).not.toBeNull();
        expect(profile!.layers.length, `Empty layers: ${env}/${tod}`).toBeGreaterThan(0);
      }
    }
  });
});
