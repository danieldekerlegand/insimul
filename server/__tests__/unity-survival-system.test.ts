/**
 * Tests for Unity SurvivalSystem.cs — complete survival system features.
 *
 * Verifies that:
 * - SurvivalSystem.cs template includes temperature, stamina, modifier, and restoration features
 * - ActiveModifier class is defined
 * - GameManager wires SurvivalSystem.LoadFromData in SpawnWorld
 * - C# generator includes SurvivalSystem.cs when survival is enabled
 */

import { describe, it, expect } from 'vitest';
import { generateCSharpFiles } from '../services/game-export/unity/unity-csharp-generator';
import { loadStaticTemplate } from '../services/game-export/unity/unity-template-loader';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(): WorldIR {
  return {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'test-world',
      worldName: 'Test World',
      worldType: 'medieval_fantasy',
      seed: 'test-seed',
      terrainSize: 512,
      genreConfig: {
        genre: 'rpg',
        features: { crafting: false, resources: false, survival: true },
      },
    },
    geography: {
      terrainSize: 512,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      roads: [],
      businesses: [],
      natureObjects: [],
      animals: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [],
      truths: [],
      grammars: [],
      items: [],
      lootTables: [],
      languages: [],
      knowledgeBase: null,
      dialogueContexts: [],
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.5, g: 0.4, b: 0.3 },
        skyColor: { r: 0.6, g: 0.7, b: 0.9 },
        roadColor: { r: 0.3, g: 0.3, b: 0.3 },
        roadRadius: 1.5,
        settlementBaseColor: { r: 0.6, g: 0.5, b: 0.4 },
        settlementRoofColor: { r: 0.3, g: 0.2, b: 0.15 },
      },
      ambientLighting: { color: [0.4, 0.4, 0.5], intensity: 0.5 },
      directionalLight: { direction: [0, 1, 0], intensity: 1.0 },
      fog: { density: 0.02 },
    },
    assets: [],
    player: {
      speed: 5,
      jumpHeight: 1.2,
      gravity: 1,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
      startPosition: { x: 50, y: 0, z: 50 },
    },
    ui: {
      minimap: true,
      healthBar: true,
      staminaBar: false,
      ammoCounter: false,
      compass: true,
    },
    combat: {
      style: 'melee',
      settings: {
        baseDamage: 10,
        criticalChance: 0.15,
        criticalMultiplier: 1.5,
        blockReduction: 0.25,
        dodgeChance: 0.1,
        attackCooldown: 1000,
        combatRange: 2,
      },
    },
    survival: {
      needs: [
        { id: 'hunger', name: 'Hunger', startValue: 100, maxValue: 100, decayRate: 0.5, criticalThreshold: 10, warningThreshold: 30, damageRate: 1 },
        { id: 'thirst', name: 'Thirst', startValue: 100, maxValue: 100, decayRate: 0.8, criticalThreshold: 10, warningThreshold: 30, damageRate: 1.5 },
        { id: 'temperature', name: 'Temperature', startValue: 50, maxValue: 100, decayRate: 0, criticalThreshold: 10, warningThreshold: 20, damageRate: 1.5 },
        { id: 'stamina', name: 'Stamina', startValue: 100, maxValue: 100, decayRate: 0, criticalThreshold: 10, warningThreshold: 25, damageRate: 0 },
        { id: 'sleep', name: 'Sleep', startValue: 100, maxValue: 100, decayRate: 0.08, criticalThreshold: 10, warningThreshold: 25, damageRate: 0.5 },
      ],
      damageConfig: { enabled: true, globalDamageMultiplier: 1 },
      temperatureConfig: {
        environmentDriven: true,
        comfortZone: { min: 20, max: 80 },
        criticalAtBothExtremes: true,
      },
      staminaConfig: { actionDriven: true, recoveryRate: 2 },
      modifierPresets: [
        { id: 'near_campfire', name: 'Near Campfire', needType: 'temperature', rateMultiplier: 0, duration: 0, source: 'environment' },
        { id: 'well_fed', name: 'Well Fed', needType: 'hunger', rateMultiplier: 0.5, duration: 300000, source: 'consumable' },
      ],
    },
    resources: null,
  } as unknown as WorldIR;
}

// ─────────────────────────────────────────────
// SurvivalSystem.cs - Core need features
// ─────────────────────────────────────────────

describe('Unity SurvivalSystem - core needs', () => {
  const content = loadStaticTemplate('scripts/systems/SurvivalSystem.cs');

  it('exposes GetAllNeeds method', () => {
    expect(content).toContain('GetAllNeeds()');
  });

  it('returns IReadOnlyList<NeedState>', () => {
    expect(content).toContain('IReadOnlyList<NeedState>');
  });

  it('exposes GetNeedValue method', () => {
    expect(content).toContain('GetNeedValue(string needId)');
  });

  it('exposes ModifyNeed method', () => {
    expect(content).toContain('ModifyNeed(string needId, float delta)');
  });

  it('fires OnNeedWarning event', () => {
    expect(content).toContain('OnNeedWarning');
  });

  it('fires OnNeedCritical event', () => {
    expect(content).toContain('OnNeedCritical');
  });

  it('fires OnDamageFromNeed event', () => {
    expect(content).toContain('OnDamageFromNeed');
  });

  it('applies global damage multiplier', () => {
    expect(content).toContain('_globalDamageMultiplier');
  });

  it('clamps need values between 0 and maxValue', () => {
    expect(content).toContain('Mathf.Clamp(need.value');
  });
});

// ─────────────────────────────────────────────
// SurvivalSystem.cs - Need restoration event
// ─────────────────────────────────────────────

describe('Unity SurvivalSystem - need restoration', () => {
  const content = loadStaticTemplate('scripts/systems/SurvivalSystem.cs');

  it('fires OnNeedRestored event when need recovers from critical/warning', () => {
    expect(content).toContain('OnNeedRestored');
  });

  it('checks wasCritical or wasWarning before firing restored event', () => {
    expect(content).toContain('need.wasCritical || need.wasWarning');
  });
});

// ─────────────────────────────────────────────
// SurvivalSystem.cs - Temperature system
// ─────────────────────────────────────────────

describe('Unity SurvivalSystem - temperature system', () => {
  const content = loadStaticTemplate('scripts/systems/SurvivalSystem.cs');

  it('has environment temperature field', () => {
    expect(content).toContain('_environmentTemperature');
  });

  it('loads temperature config from world data', () => {
    expect(content).toContain('temperatureConfig');
  });

  it('tracks comfort zone min and max', () => {
    expect(content).toContain('_temperatureComfortMin');
    expect(content).toContain('_temperatureComfortMax');
  });

  it('supports critical at both extremes', () => {
    expect(content).toContain('_temperatureCriticalBothExtremes');
  });

  it('exposes SetEnvironmentTemperature method', () => {
    expect(content).toContain('SetEnvironmentTemperature(float temperature)');
  });

  it('exposes GetEnvironmentTemperature method', () => {
    expect(content).toContain('GetEnvironmentTemperature()');
  });

  it('has dedicated UpdateTemperatureNeed method', () => {
    expect(content).toContain('UpdateTemperatureNeed(');
  });

  it('uses InverseLerp for temperature-to-need mapping', () => {
    expect(content).toContain('Mathf.InverseLerp');
  });

  it('uses MoveTowards for smooth temperature transitions', () => {
    expect(content).toContain('Mathf.MoveTowards');
  });
});

// ─────────────────────────────────────────────
// SurvivalSystem.cs - Stamina system
// ─────────────────────────────────────────────

describe('Unity SurvivalSystem - stamina system', () => {
  const content = loadStaticTemplate('scripts/systems/SurvivalSystem.cs');

  it('loads stamina config from world data', () => {
    expect(content).toContain('staminaConfig');
  });

  it('tracks action-driven stamina mode', () => {
    expect(content).toContain('_staminaActionDriven');
  });

  it('has stamina recovery rate', () => {
    expect(content).toContain('_staminaRecoveryRate');
  });

  it('has dedicated UpdateStaminaNeed method', () => {
    expect(content).toContain('UpdateStaminaNeed(');
  });

  it('exposes ConsumeStamina method for action-based drain', () => {
    expect(content).toContain('ConsumeStamina(float amount)');
  });

  it('exposes HasStamina check for action gating', () => {
    expect(content).toContain('HasStamina(float amount)');
  });

  it('recovers stamina when not decaying', () => {
    expect(content).toContain('recoveryRate * dt');
  });
});

// ─────────────────────────────────────────────
// SurvivalSystem.cs - Modifier presets
// ─────────────────────────────────────────────

describe('Unity SurvivalSystem - modifier presets', () => {
  const content = loadStaticTemplate('scripts/systems/SurvivalSystem.cs');

  it('defines ActiveModifier class', () => {
    expect(content).toContain('class ActiveModifier');
  });

  it('ActiveModifier has presetId field', () => {
    expect(content).toContain('public string presetId');
  });

  it('ActiveModifier has rateMultiplier field', () => {
    expect(content).toContain('public float rateMultiplier');
  });

  it('ActiveModifier has remainingDuration field', () => {
    expect(content).toContain('public float remainingDuration');
  });

  it('ActiveModifier has isPermanent flag', () => {
    expect(content).toContain('public bool isPermanent');
  });

  it('loads modifier presets from world data into lookup', () => {
    expect(content).toContain('_presetLookup');
  });

  it('exposes ApplyModifier method', () => {
    expect(content).toContain('ApplyModifier(string presetId)');
  });

  it('exposes RemoveModifier method', () => {
    expect(content).toContain('RemoveModifier(string presetId)');
  });

  it('exposes GetActiveModifiers method', () => {
    expect(content).toContain('GetActiveModifiers()');
  });

  it('fires OnModifierApplied event', () => {
    expect(content).toContain('OnModifierApplied');
  });

  it('fires OnModifierExpired event', () => {
    expect(content).toContain('OnModifierExpired');
  });

  it('computes effective decay rate from modifiers', () => {
    expect(content).toContain('GetEffectiveDecayRate(');
  });

  it('refreshes duration on re-applied modifiers', () => {
    expect(content).toContain('existing.remainingDuration');
  });

  it('converts duration from milliseconds to seconds', () => {
    expect(content).toContain('preset.duration / 1000f');
  });

  it('updates modifiers each frame to tick down duration', () => {
    expect(content).toContain('UpdateModifiers(dt)');
  });
});

// ─────────────────────────────────────────────
// InsimulGameManager.cs - SurvivalSystem wiring
// ─────────────────────────────────────────────

describe('Unity InsimulGameManager - SurvivalSystem integration', () => {
  const content = loadStaticTemplate('scripts/core/InsimulGameManager.cs');

  it('finds SurvivalSystem in SpawnWorld', () => {
    expect(content).toContain('FindObjectOfType<Insimul.Systems.SurvivalSystem>()');
  });

  it('calls SurvivalSystem.LoadFromData', () => {
    expect(content).toContain('survivalSys.LoadFromData(WorldData)');
  });
});

// ─────────────────────────────────────────────
// C# generator includes SurvivalSystem
// ─────────────────────────────────────────────

describe('Unity C# generator - SurvivalSystem inclusion', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('includes SurvivalSystem.cs when survival is enabled', () => {
    const file = files.find(f => f.path.endsWith('SurvivalSystem.cs'));
    expect(file).toBeDefined();
  });

  it('SurvivalSystem.cs contains temperature support', () => {
    const file = files.find(f => f.path.endsWith('SurvivalSystem.cs'));
    expect(file!.content).toContain('SetEnvironmentTemperature');
    expect(file!.content).toContain('_temperatureEnabled');
  });

  it('SurvivalSystem.cs contains stamina support', () => {
    const file = files.find(f => f.path.endsWith('SurvivalSystem.cs'));
    expect(file!.content).toContain('ConsumeStamina');
    expect(file!.content).toContain('HasStamina');
  });

  it('SurvivalSystem.cs contains modifier support', () => {
    const file = files.find(f => f.path.endsWith('SurvivalSystem.cs'));
    expect(file!.content).toContain('ApplyModifier');
    expect(file!.content).toContain('RemoveModifier');
    expect(file!.content).toContain('ActiveModifier');
  });

  it('SurvivalSystem.cs contains restoration event', () => {
    const file = files.find(f => f.path.endsWith('SurvivalSystem.cs'));
    expect(file!.content).toContain('OnNeedRestored');
  });
});
