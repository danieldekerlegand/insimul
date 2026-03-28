/**
 * Tests for WeatherSystem
 *
 * Mocks @babylonjs/core since tests run in Node without a canvas/WebGL context.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock @babylonjs/core ────────────────────────────────────────────────────

const disposedMeshes: string[] = [];

function makeMockMesh(name: string) {
  return {
    name,
    position: { x: 0, y: 0, z: 0, copyFrom: vi.fn() },
    rotation: { x: 0, y: 0, z: 0 },
    material: null,
    metadata: null,
    visibility: 1,
    isPickable: true,
    checkCollisions: false,
    dispose: vi.fn(() => disposedMeshes.push(name)),
  };
}

vi.mock('@babylonjs/core', () => {
  class Vector3 {
    x: number; y: number; z: number;
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    copyFrom(other: any) { this.x = other.x; this.y = other.y; this.z = other.z; }
    static Zero() { return new Vector3(0, 0, 0); }
  }

  class Color3 {
    r: number; g: number; b: number;
    constructor(r = 0, g = 0, b = 0) { this.r = r; this.g = g; this.b = b; }
    static Black() { return new Color3(0, 0, 0); }
  }

  class Color4 {
    r: number; g: number; b: number; a: number;
    constructor(r = 0, g = 0, b = 0, a = 1) { this.r = r; this.g = g; this.b = b; this.a = a; }
  }

  return {
    Color3,
    Color4,
    Vector3,
    Mesh: class { static BACKSIDE = 1; },
    MeshBuilder: {
      CreatePlane: vi.fn((name: string) => makeMockMesh(name)),
      CreateSphere: vi.fn((name: string) => makeMockMesh(name)),
    },
    ParticleSystem: class {
      name: string;
      emitRate: number = 0;
      gravity: any = { x: 0, y: -30, z: 0 };
      color1: any = null;
      color2: any = null;
      colorDead: any = null;
      minSize: number = 0;
      maxSize: number = 0;
      minScaleX: number = 0;
      maxScaleX: number = 0;
      minScaleY: number = 0;
      maxScaleY: number = 0;
      minLifeTime: number = 0;
      maxLifeTime: number = 0;
      minEmitBox: any = null;
      maxEmitBox: any = null;
      emitter: any = null;
      constructor(name: string) { this.name = name; }
      createPointEmitter = vi.fn();
      start = vi.fn();
      dispose = vi.fn();
    },
    Scene: class {
      static FOGMODE_EXP2 = 1;
      fogEnabled = false;
      fogMode = 0;
      fogDensity = 0;
      fogColor: any = null;
      getLightByName = vi.fn((name: string) => ({
        intensity: name === 'sun' ? 1.1 : 0.7,
      }));
    },
    StandardMaterial: class {
      name: string;
      diffuseColor: any = new Color3();
      emissiveColor: any = new Color3();
      specularColor: any = new Color3();
      alpha: number = 1;
      backFaceCulling: boolean = true;
      dispose = vi.fn();
      constructor(name: string) { this.name = name; }
    },
    ShaderMaterial: class {
      constructor() {}
      setColor3 = vi.fn();
      backFaceCulling = true;
    },
    Texture: class {
      constructor() {}
    },
  };
});

// ── Import after mock ────────────────────────────────────────────────────────

import {
  WeatherSystem,
  smoothstep,
  lerpWeatherState,
  lerpAngle,
  weightedRandom,
  WEATHER_DEFAULTS,
  WEATHER_TRANSITIONS,
} from '../WeatherSystem';
import type { WeatherState, WeatherType } from '../WeatherSystem';
import { Scene, Vector3 } from '@babylonjs/core';

// ── Tests ────────────────────────────────────────────────────────────────────

describe('WeatherSystem', () => {
  let scene: any;
  let system: WeatherSystem;

  beforeEach(() => {
    disposedMeshes.length = 0;
    scene = new Scene();
    system = new WeatherSystem(scene, { autoTransition: false });
  });

  // ── Initialization ──────────────────────────────────────────────────────

  it('initializes with clear weather', () => {
    expect(system.weatherType).toBe('clear');
    const state = system.currentWeather;
    expect(state.intensity).toBe(0);
    expect(state.cloudCoverage).toBe(WEATHER_DEFAULTS.clear.cloudCoverage);
  });

  // ── setWeather ──────────────────────────────────────────────────────────

  it('transitions to a new weather type', () => {
    system.setWeather('rain', 0.1);
    // Run enough updates to complete the transition
    for (let i = 0; i < 20; i++) {
      system.update(50); // 50ms * 20 = 1s, transition is 0.1s
    }
    expect(system.weatherType).toBe('rain');
    const state = system.currentWeather;
    expect(state.intensity).toBeGreaterThan(0);
    expect(state.cloudCoverage).toBeGreaterThan(0.5);
  });

  it('setWeather to storm produces high intensity', () => {
    system.setWeather('storm', 0.1);
    for (let i = 0; i < 20; i++) system.update(50);
    expect(system.weatherType).toBe('storm');
    expect(system.currentWeather.intensity).toBeCloseTo(1.0, 1);
  });

  // ── Sky darkening ───────────────────────────────────────────────────────

  it('returns 1.0 sky darkening for clear weather', () => {
    expect(system.getSkyDarkening()).toBeCloseTo(1.0 - WEATHER_DEFAULTS.clear.cloudCoverage * 0.6, 1);
  });

  it('returns lower sky darkening for storm weather', () => {
    system.setWeather('storm', 0.1);
    for (let i = 0; i < 20; i++) system.update(50);
    expect(system.getSkyDarkening()).toBeLessThan(0.5);
  });

  // ── Fog ─────────────────────────────────────────────────────────────────

  it('enables fog during rain', () => {
    system.setWeather('rain', 0.1);
    for (let i = 0; i < 20; i++) system.update(50);
    expect(scene.fogEnabled).toBe(true);
    expect(scene.fogDensity).toBeGreaterThan(0);
  });

  it('disables fog during clear weather', () => {
    system.update(16);
    expect(scene.fogEnabled).toBe(false);
  });

  // ── Player position tracking ────────────────────────────────────────────

  it('accepts player position', () => {
    const pos = new Vector3(10, 0, 20);
    system.setPlayerPosition(pos);
    // No error thrown
    system.update(16);
  });

  // ── Dispose ─────────────────────────────────────────────────────────────

  it('disposes all resources', () => {
    system.dispose();
    // After dispose, update should be a no-op
    system.update(16);
    expect(disposedMeshes.length).toBeGreaterThan(0);
  });

  it('restores fog state on dispose', () => {
    scene.fogEnabled = false;
    const sys = new WeatherSystem(scene, { autoTransition: false });
    sys.setWeather('storm', 0.1);
    for (let i = 0; i < 20; i++) sys.update(50);
    sys.dispose();
    expect(scene.fogEnabled).toBe(false);
  });
});

// ── Helper function tests ─────────────────────────────────────────────────

describe('smoothstep', () => {
  it('returns 0 at t=0', () => expect(smoothstep(0)).toBe(0));
  it('returns 1 at t=1', () => expect(smoothstep(1)).toBe(1));
  it('returns 0.5 at t=0.5', () => expect(smoothstep(0.5)).toBe(0.5));
  it('is monotonically increasing', () => {
    let prev = 0;
    for (let t = 0; t <= 1; t += 0.1) {
      const v = smoothstep(t);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe('lerpAngle', () => {
  it('interpolates between 0 and PI/2', () => {
    const mid = lerpAngle(0, Math.PI / 2, 0.5);
    expect(mid).toBeCloseTo(Math.PI / 4, 1);
  });

  it('handles wraparound correctly', () => {
    // From just below 2PI to just above 0 should go the short way
    const result = lerpAngle(Math.PI * 1.9, Math.PI * 0.1, 0.5);
    // Should be near 0/2PI, not near PI
    expect(Math.abs(result) < Math.PI / 2 || Math.abs(result - Math.PI * 2) < Math.PI / 2).toBe(true);
  });
});

describe('lerpWeatherState', () => {
  it('returns a at t=0', () => {
    const a: WeatherState = { type: 'clear', intensity: 0, windSpeed: 0, windDirection: 0, fogDensity: 0, cloudCoverage: 0 };
    const b: WeatherState = { type: 'storm', intensity: 1, windSpeed: 1, windDirection: Math.PI, fogDensity: 1, cloudCoverage: 1 };
    const result = lerpWeatherState(a, b, 0);
    expect(result.intensity).toBe(0);
    expect(result.cloudCoverage).toBe(0);
    expect(result.type).toBe('clear');
  });

  it('returns b at t=1', () => {
    const a: WeatherState = { type: 'clear', intensity: 0, windSpeed: 0, windDirection: 0, fogDensity: 0, cloudCoverage: 0 };
    const b: WeatherState = { type: 'storm', intensity: 1, windSpeed: 1, windDirection: Math.PI, fogDensity: 1, cloudCoverage: 1 };
    const result = lerpWeatherState(a, b, 1);
    expect(result.intensity).toBe(1);
    expect(result.cloudCoverage).toBe(1);
    expect(result.type).toBe('storm');
  });

  it('interpolates at t=0.5', () => {
    const a: WeatherState = { type: 'clear', intensity: 0, windSpeed: 0, windDirection: 0, fogDensity: 0, cloudCoverage: 0 };
    const b: WeatherState = { type: 'storm', intensity: 1, windSpeed: 1, windDirection: 0, fogDensity: 1, cloudCoverage: 1 };
    const result = lerpWeatherState(a, b, 0.5);
    expect(result.intensity).toBeCloseTo(0.5);
    expect(result.cloudCoverage).toBeCloseTo(0.5);
  });
});

describe('weightedRandom', () => {
  it('returns a valid weather type', () => {
    const weights = { clear: 1, rain: 1 };
    const result = weightedRandom(weights);
    expect(['clear', 'rain']).toContain(result);
  });

  it('returns the only option when weight is singular', () => {
    const result = weightedRandom({ storm: 1 });
    expect(result).toBe('storm');
  });
});

describe('WEATHER_TRANSITIONS', () => {
  it('has entries for all weather types', () => {
    const types: WeatherType[] = ['clear', 'cloudy', 'overcast', 'rain', 'storm'];
    for (const t of types) {
      expect(WEATHER_TRANSITIONS[t]).toBeDefined();
      const transitions = Object.values(WEATHER_TRANSITIONS[t]);
      expect(transitions.length).toBeGreaterThan(0);
    }
  });
});

describe('WEATHER_DEFAULTS', () => {
  it('has valid defaults for all weather types', () => {
    const types: WeatherType[] = ['clear', 'cloudy', 'overcast', 'rain', 'storm'];
    for (const t of types) {
      const d = WEATHER_DEFAULTS[t];
      expect(d.intensity).toBeGreaterThanOrEqual(0);
      expect(d.intensity).toBeLessThanOrEqual(1);
      expect(d.cloudCoverage).toBeGreaterThanOrEqual(0);
      expect(d.cloudCoverage).toBeLessThanOrEqual(1);
      expect(d.windSpeed).toBeGreaterThanOrEqual(0);
    }
  });

  it('storm has higher intensity than clear', () => {
    expect(WEATHER_DEFAULTS.storm.intensity).toBeGreaterThan(WEATHER_DEFAULTS.clear.intensity);
  });

  it('storm has more cloud coverage than clear', () => {
    expect(WEATHER_DEFAULTS.storm.cloudCoverage).toBeGreaterThan(WEATHER_DEFAULTS.clear.cloudCoverage);
  });
});
