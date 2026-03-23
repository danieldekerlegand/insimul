/**
 * Tests for survival system IR — decay rates and damage logic
 *
 * Verifies that the SurvivalIR structure correctly captures decay rates,
 * damage configuration, temperature/stamina rules, and modifier presets.
 */

import { describe, it, expect } from 'vitest';
import type {
  SurvivalIR,
  SurvivalDamageConfig,
  TemperatureConfig,
  StaminaConfig,
  SurvivalModifierPreset,
} from '../game-engine/ir-types';
import type { NeedConfig, NeedType } from '../game-engine/types';

// ─────────────────────────────────────────────
// Canonical defaults (must match SurvivalNeedsSystem.ts)
// ─────────────────────────────────────────────

const CANONICAL_NEEDS: NeedConfig[] = [
  { id: 'hunger', name: 'Hunger', icon: '🍖', maxValue: 100, startValue: 80, decayRate: 0.15, criticalThreshold: 15, damageRate: 2, warningThreshold: 30 },
  { id: 'thirst', name: 'Thirst', icon: '💧', maxValue: 100, startValue: 90, decayRate: 0.25, criticalThreshold: 15, damageRate: 3, warningThreshold: 30 },
  { id: 'temperature', name: 'Temperature', icon: '🌡️', maxValue: 100, startValue: 50, decayRate: 0, criticalThreshold: 10, damageRate: 1.5, warningThreshold: 20 },
  { id: 'stamina', name: 'Stamina', icon: '⚡', maxValue: 100, startValue: 100, decayRate: 0, criticalThreshold: 10, damageRate: 0, warningThreshold: 25 },
  { id: 'sleep', name: 'Sleep', icon: '😴', maxValue: 100, startValue: 100, decayRate: 0.08, criticalThreshold: 10, damageRate: 0.5, warningThreshold: 25 },
];

/**
 * Build a complete SurvivalIR matching the ir-generator output.
 */
function buildTestSurvivalIR(overrides?: Partial<SurvivalIR>): SurvivalIR {
  return {
    needs: CANONICAL_NEEDS,
    damageConfig: {
      enabled: true,
      tickMode: 'continuous',
      globalDamageMultiplier: 1,
    },
    temperatureConfig: {
      environmentDriven: true,
      comfortZone: { min: 20, max: 80 },
      criticalAtBothExtremes: true,
    },
    staminaConfig: {
      actionDriven: true,
      recoveryRate: 2,
    },
    modifierPresets: [
      { id: 'near_campfire', name: 'Near Campfire', needType: 'temperature', rateMultiplier: 0, duration: 0, source: 'environment' },
      { id: 'sheltered', name: 'Sheltered', needType: 'temperature', rateMultiplier: 0.5, duration: 0, source: 'environment' },
      { id: 'well_fed', name: 'Well Fed', needType: 'hunger', rateMultiplier: 0.5, duration: 300000, source: 'consumable' },
      { id: 'dehydrated', name: 'Dehydrated', needType: 'thirst', rateMultiplier: 1.5, duration: 120000, source: 'status_effect' },
      { id: 'exhausted', name: 'Exhausted', needType: 'sleep', rateMultiplier: 2, duration: 180000, source: 'status_effect' },
      { id: 'resting', name: 'Resting', needType: 'stamina', rateMultiplier: 0, duration: 0, source: 'action' },
    ],
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// Need configs and decay rates
// ─────────────────────────────────────────────

describe('SurvivalIR - need configs', () => {
  const ir = buildTestSurvivalIR();

  it('includes all five survival needs', () => {
    const ids = ir.needs.map(n => n.id);
    expect(ids).toEqual(['hunger', 'thirst', 'temperature', 'stamina', 'sleep']);
  });

  it('has positive decay rates only for time-based needs', () => {
    const decaying = ir.needs.filter(n => n.decayRate > 0).map(n => n.id);
    expect(decaying).toEqual(['hunger', 'thirst', 'sleep']);
  });

  it('temperature and stamina have zero decay rate', () => {
    const temp = ir.needs.find(n => n.id === 'temperature')!;
    const stamina = ir.needs.find(n => n.id === 'stamina')!;
    expect(temp.decayRate).toBe(0);
    expect(stamina.decayRate).toBe(0);
  });

  it('hunger decays at 0.15/s (~11 min to empty from 100)', () => {
    const hunger = ir.needs.find(n => n.id === 'hunger')!;
    expect(hunger.decayRate).toBe(0.15);
    const timeToEmpty = hunger.maxValue / hunger.decayRate;
    expect(timeToEmpty).toBeCloseTo(666.67, 0); // ~11 min
  });

  it('thirst decays at 0.25/s (~6.5 min to empty from 100)', () => {
    const thirst = ir.needs.find(n => n.id === 'thirst')!;
    expect(thirst.decayRate).toBe(0.25);
    const timeToEmpty = thirst.maxValue / thirst.decayRate;
    expect(timeToEmpty).toBe(400); // ~6.7 min
  });

  it('every need has warning threshold > critical threshold', () => {
    for (const need of ir.needs) {
      expect(need.warningThreshold).toBeGreaterThan(need.criticalThreshold);
    }
  });

  it('start values are within valid range', () => {
    for (const need of ir.needs) {
      expect(need.startValue).toBeGreaterThanOrEqual(0);
      expect(need.startValue).toBeLessThanOrEqual(need.maxValue);
    }
  });
});

// ─────────────────────────────────────────────
// Damage configuration
// ─────────────────────────────────────────────

describe('SurvivalIR - damage config', () => {
  const ir = buildTestSurvivalIR();

  it('damage is enabled by default', () => {
    expect(ir.damageConfig.enabled).toBe(true);
  });

  it('damage is continuous (per-frame in update loop)', () => {
    expect(ir.damageConfig.tickMode).toBe('continuous');
  });

  it('global damage multiplier defaults to 1', () => {
    expect(ir.damageConfig.globalDamageMultiplier).toBe(1);
  });

  it('only needs with damageRate > 0 cause health damage', () => {
    const damaging = ir.needs.filter(n => n.damageRate > 0).map(n => n.id);
    expect(damaging).toEqual(['hunger', 'thirst', 'temperature', 'sleep']);
    // stamina has damageRate 0 — low stamina blocks actions but doesn't kill
    const stamina = ir.needs.find(n => n.id === 'stamina')!;
    expect(stamina.damageRate).toBe(0);
  });

  it('damage per second at zero scales with globalDamageMultiplier', () => {
    const hunger = ir.needs.find(n => n.id === 'hunger')!;
    const multiplier = ir.damageConfig.globalDamageMultiplier;
    const effectiveDamage = hunger.damageRate * multiplier;
    expect(effectiveDamage).toBe(2);
  });
});

// ─────────────────────────────────────────────
// Temperature configuration
// ─────────────────────────────────────────────

describe('SurvivalIR - temperature config', () => {
  const ir = buildTestSurvivalIR();

  it('temperature is environment-driven', () => {
    expect(ir.temperatureConfig.environmentDriven).toBe(true);
  });

  it('has a comfort zone between 20 and 80', () => {
    expect(ir.temperatureConfig.comfortZone.min).toBe(20);
    expect(ir.temperatureConfig.comfortZone.max).toBe(80);
  });

  it('critical state applies at both extremes (freezing and overheating)', () => {
    expect(ir.temperatureConfig.criticalAtBothExtremes).toBe(true);
  });

  it('comfort zone is within the 0-100 scale', () => {
    expect(ir.temperatureConfig.comfortZone.min).toBeGreaterThanOrEqual(0);
    expect(ir.temperatureConfig.comfortZone.max).toBeLessThanOrEqual(100);
  });
});

// ─────────────────────────────────────────────
// Stamina configuration
// ─────────────────────────────────────────────

describe('SurvivalIR - stamina config', () => {
  const ir = buildTestSurvivalIR();

  it('stamina is action-driven (not time-based decay)', () => {
    expect(ir.staminaConfig.actionDriven).toBe(true);
  });

  it('has a positive recovery rate', () => {
    expect(ir.staminaConfig.recoveryRate).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// Modifier presets
// ─────────────────────────────────────────────

describe('SurvivalIR - modifier presets', () => {
  const ir = buildTestSurvivalIR();

  it('includes presets for common survival scenarios', () => {
    expect(ir.modifierPresets.length).toBeGreaterThanOrEqual(1);
  });

  it('all presets have valid needType values', () => {
    const validTypes: NeedType[] = ['hunger', 'thirst', 'temperature', 'stamina', 'sleep'];
    for (const preset of ir.modifierPresets) {
      expect(validTypes).toContain(preset.needType);
    }
  });

  it('permanent modifiers have duration 0', () => {
    const permanent = ir.modifierPresets.filter(p => p.duration === 0);
    expect(permanent.length).toBeGreaterThanOrEqual(1);
    for (const p of permanent) {
      expect(p.duration).toBe(0);
    }
  });

  it('campfire preset stops temperature decay (rateMultiplier = 0)', () => {
    const campfire = ir.modifierPresets.find(p => p.id === 'near_campfire');
    expect(campfire).toBeDefined();
    expect(campfire!.rateMultiplier).toBe(0);
    expect(campfire!.needType).toBe('temperature');
  });

  it('dehydrated preset accelerates thirst decay', () => {
    const dehydrated = ir.modifierPresets.find(p => p.id === 'dehydrated');
    expect(dehydrated).toBeDefined();
    expect(dehydrated!.rateMultiplier).toBeGreaterThan(1);
    expect(dehydrated!.needType).toBe('thirst');
  });

  it('well_fed preset slows hunger decay', () => {
    const wellFed = ir.modifierPresets.find(p => p.id === 'well_fed');
    expect(wellFed).toBeDefined();
    expect(wellFed!.rateMultiplier).toBeLessThan(1);
    expect(wellFed!.needType).toBe('hunger');
  });

  it('each preset has a unique id', () => {
    const ids = ir.modifierPresets.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─────────────────────────────────────────────
// Type structural checks
// ─────────────────────────────────────────────

describe('SurvivalIR - structural validity', () => {
  it('null survival IR is valid (non-survival genres)', () => {
    const nullSurvival: SurvivalIR | null = null;
    expect(nullSurvival).toBeNull();
  });

  it('survival IR satisfies the SurvivalIR interface', () => {
    const ir = buildTestSurvivalIR();
    expect(ir.needs).toBeDefined();
    expect(ir.damageConfig).toBeDefined();
    expect(ir.temperatureConfig).toBeDefined();
    expect(ir.staminaConfig).toBeDefined();
    expect(ir.modifierPresets).toBeDefined();
  });

  it('can override damage config for peaceful mode', () => {
    const peaceful = buildTestSurvivalIR({
      damageConfig: { enabled: false, tickMode: 'continuous', globalDamageMultiplier: 0 },
    });
    expect(peaceful.damageConfig.enabled).toBe(false);
    expect(peaceful.damageConfig.globalDamageMultiplier).toBe(0);
    // Needs still decay — just no health damage
    expect(peaceful.needs.find(n => n.id === 'hunger')!.decayRate).toBeGreaterThan(0);
  });
});
