/**
 * Tests for Unreal survival system export
 *
 * Verifies that the Unreal export pipeline correctly generates:
 * - SurvivalSystem.h and .cpp when survival IR is present
 * - SurvivalSystem is omitted when survival IR is null
 * - Generated C++ has complete decay, threshold, damage, modifier logic
 * - Survival DataTable entries for needs and modifier presets
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import { generateDataTableFiles } from '../services/game-export/unreal/unreal-datatable-generator';
import type { WorldIR, SurvivalIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

function makeSurvivalIR(): SurvivalIR {
  return {
    needs: [
      { id: 'hunger', name: 'Hunger', icon: '🍖', maxValue: 100, startValue: 100, decayRate: 0.15, criticalThreshold: 10, warningThreshold: 25, damageRate: 2 },
      { id: 'thirst', name: 'Thirst', icon: '💧', maxValue: 100, startValue: 100, decayRate: 0.25, criticalThreshold: 10, warningThreshold: 25, damageRate: 3 },
      { id: 'temperature', name: 'Temperature', icon: '🌡️', maxValue: 100, startValue: 50, decayRate: 0, criticalThreshold: 10, warningThreshold: 20, damageRate: 1.5 },
      { id: 'stamina', name: 'Stamina', icon: '⚡', maxValue: 100, startValue: 100, decayRate: 0, criticalThreshold: 10, warningThreshold: 25, damageRate: 0 },
      { id: 'sleep', name: 'Sleep', icon: '😴', maxValue: 100, startValue: 100, decayRate: 0.08, criticalThreshold: 10, warningThreshold: 25, damageRate: 0.5 },
    ],
    damageConfig: { enabled: true, tickMode: 'continuous', globalDamageMultiplier: 1.0 },
    temperatureConfig: { environmentDriven: true, comfortZone: { min: 20, max: 80 }, criticalAtBothExtremes: true },
    staminaConfig: { actionDriven: true, recoveryRate: 2 },
    modifierPresets: [
      { id: 'near_campfire', name: 'Near Campfire', needType: 'temperature', rateMultiplier: 0, duration: 0, source: 'environment' },
      { id: 'well_fed', name: 'Well Fed', needType: 'hunger', rateMultiplier: 0.5, duration: 300000, source: 'consumable' },
      { id: 'dehydrated', name: 'Dehydrated', needType: 'thirst', rateMultiplier: 1.5, duration: 120000, source: 'environment' },
    ],
  };
}

function makeMinimalIR(overrides?: Partial<WorldIR>): WorldIR {
  const base: WorldIR = {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'test-world',
      worldName: 'Test World',
      worldDescription: 'A test world',
      worldType: 'survival',
      genreConfig: {
        genre: 'survival',
        subGenre: 'wilderness-survival',
        features: { crafting: true, resources: true, survival: true, dungeons: false, vehicles: false, companions: false, factions: false, housing: false, farming: false, fishing: false, cooking: false, mining: false, trading: true },
        cameraMode: 'third-person' as any,
        combatStyle: 'melee' as any,
      },
      exportTimestamp: new Date().toISOString(),
      exportVersion: 1,
      seed: 'test-seed',
    },
    geography: { terrainSize: 1000, countries: [], states: [], settlements: [], waterFeatures: [], foliageLayers: [] },
    entities: { characters: [], npcs: [], buildings: [], businesses: [], roads: [], natureObjects: [], animals: [], dungeons: [], questObjects: [] },
    systems: { rules: [], baseRules: [], actions: [], baseActions: [], quests: [], truths: [], grammars: [], languages: [], items: [], lootTables: [], dialogueContexts: [], knowledgeBase: null },
    theme: {
      visualTheme: { groundColor: { r: 0.4, g: 0.6, b: 0.3 }, skyColor: { r: 0.5, g: 0.7, b: 1.0 }, settlementBaseColor: { r: 0.8, g: 0.7, b: 0.6 }, settlementRoofColor: { r: 0.6, g: 0.3, b: 0.2 }, roadColor: { r: 0.5, g: 0.5, b: 0.5 }, roadRadius: 2.5 } as any,
      skyboxAssetKey: null,
      ambientLighting: { color: [0.3, 0.3, 0.3], intensity: 0.5 },
      directionalLight: { direction: [0, -1, 0], intensity: 1.0 },
      fog: null,
    },
    assets: { collectionId: null, textures: [], models: [], audio: [], animations: [] },
    player: { startPosition: { x: 0, y: 1, z: 0 }, modelAssetKey: null, initialEnergy: 100, initialGold: 50, initialHealth: 100, speed: 6, jumpHeight: 4, gravity: 9.8 },
    ui: { showMinimap: true, showHealthBar: true, showStaminaBar: true, showAmmoCounter: false, showCompass: true, genreLayout: 'survival' },
    combat: { style: 'melee' as any, settings: { baseDamage: 10, damageVariance: 2, criticalChance: 0.1, criticalMultiplier: 2, blockReduction: 0.5, dodgeChance: 0.1, attackCooldown: 500, comboWindowMs: 300, maxComboLength: 3 } },
    survival: makeSurvivalIR(),
    resources: null,
    aiConfig: { apiMode: 'insimul', insimulEndpoint: '', geminiModel: '', geminiApiKeyPlaceholder: '', voiceEnabled: false, defaultVoice: '' },
  };
  return { ...base, ...overrides };
}

// ─────────────────────────────────────────────
// SurvivalSystem C++ generation
// ─────────────────────────────────────────────

describe('Unreal export - SurvivalSystem C++ files', () => {
  it('generates SurvivalSystem.h when survival IR is present', () => {
    const files = generateCppFiles(makeMinimalIR());
    const header = files.find(f => f.path.endsWith('SurvivalSystem.h'));
    expect(header).toBeDefined();
    expect(header!.content).toContain('USurvivalSystem');
    expect(header!.content).toContain('UGameInstanceSubsystem');
  });

  it('generates SurvivalSystem.cpp when survival IR is present', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'));
    expect(impl).toBeDefined();
    expect(impl!.content).toContain('USurvivalSystem');
  });

  it('omits SurvivalSystem files when survival IR is null', () => {
    const files = generateCppFiles(makeMinimalIR({ survival: null }));
    const header = files.find(f => f.path.endsWith('SurvivalSystem.h'));
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'));
    expect(header).toBeUndefined();
    expect(impl).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// SurvivalSystem.h completeness
// ─────────────────────────────────────────────

describe('Unreal export - SurvivalSystem.h completeness', () => {
  it('declares Update method for tick-based decay', () => {
    const files = generateCppFiles(makeMinimalIR());
    const header = files.find(f => f.path.endsWith('SurvivalSystem.h'))!;
    expect(header.content).toContain('void Update(float DeltaTime)');
  });

  it('declares GetNeedValue and GetNeedPercent getters', () => {
    const files = generateCppFiles(makeMinimalIR());
    const header = files.find(f => f.path.endsWith('SurvivalSystem.h'))!;
    expect(header.content).toContain('GetNeedValue');
    expect(header.content).toContain('GetNeedPercent');
  });

  it('declares RestoreNeed for consumption', () => {
    const files = generateCppFiles(makeMinimalIR());
    const header = files.find(f => f.path.endsWith('SurvivalSystem.h'))!;
    expect(header.content).toContain('RestoreNeed');
  });

  it('declares ConsumeStamina and RecoverStamina', () => {
    const files = generateCppFiles(makeMinimalIR());
    const header = files.find(f => f.path.endsWith('SurvivalSystem.h'))!;
    expect(header.content).toContain('ConsumeStamina');
    expect(header.content).toContain('RecoverStamina');
  });

  it('declares SetTemperature for environment-driven temperature', () => {
    const files = generateCppFiles(makeMinimalIR());
    const header = files.find(f => f.path.endsWith('SurvivalSystem.h'))!;
    expect(header.content).toContain('SetTemperature');
  });

  it('declares AddModifier and RemoveModifier', () => {
    const files = generateCppFiles(makeMinimalIR());
    const header = files.find(f => f.path.endsWith('SurvivalSystem.h'))!;
    expect(header.content).toContain('AddModifier');
    expect(header.content).toContain('RemoveModifier');
  });

  it('declares IsAnyCritical and IsAnyWarning queries', () => {
    const files = generateCppFiles(makeMinimalIR());
    const header = files.find(f => f.path.endsWith('SurvivalSystem.h'))!;
    expect(header.content).toContain('IsAnyCritical');
    expect(header.content).toContain('IsAnyWarning');
  });

  it('declares OnSurvivalEvent delegate', () => {
    const files = generateCppFiles(makeMinimalIR());
    const header = files.find(f => f.path.endsWith('SurvivalSystem.h'))!;
    expect(header.content).toContain('OnSurvivalEvent');
    expect(header.content).toContain('FOnSurvivalEvent');
  });

  it('declares all config properties from IR', () => {
    const files = generateCppFiles(makeMinimalIR());
    const header = files.find(f => f.path.endsWith('SurvivalSystem.h'))!;
    expect(header.content).toContain('DamageConfig');
    expect(header.content).toContain('TemperatureConfig');
    expect(header.content).toContain('StaminaConfig');
    expect(header.content).toContain('ModifierPresets');
  });
});

// ─────────────────────────────────────────────
// SurvivalSystem.cpp completeness
// ─────────────────────────────────────────────

describe('Unreal export - SurvivalSystem.cpp completeness', () => {
  it('LoadFromIR parses needs array from JSON', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('needs');
    expect(impl.content).toContain('decayRate');
    expect(impl.content).toContain('criticalThreshold');
    expect(impl.content).toContain('warningThreshold');
    expect(impl.content).toContain('damageRate');
  });

  it('LoadFromIR parses damageConfig', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('damageConfig');
    expect(impl.content).toContain('globalDamageMultiplier');
  });

  it('LoadFromIR parses temperatureConfig with comfortZone', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('temperatureConfig');
    expect(impl.content).toContain('comfortZone');
    expect(impl.content).toContain('environmentDriven');
    expect(impl.content).toContain('criticalAtBothExtremes');
  });

  it('LoadFromIR parses staminaConfig', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('staminaConfig');
    expect(impl.content).toContain('actionDriven');
    expect(impl.content).toContain('recoveryRate');
  });

  it('LoadFromIR parses modifier presets', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('modifierPresets');
    expect(impl.content).toContain('RateMultiplier');
  });

  it('Update method applies decay with modifier multiplier', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('GetDecayMultiplier');
    expect(impl.content).toContain('DecayRate');
    expect(impl.content).toContain('DeltaTime');
  });

  it('Update method handles threshold transitions', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('NeedCritical');
    expect(impl.content).toContain('NeedWarning');
    expect(impl.content).toContain('NeedRestored');
    expect(impl.content).toContain('bWasCritical');
    expect(impl.content).toContain('bWasWarning');
  });

  it('Update method applies damage when need is depleted', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('DamageFromNeed');
    expect(impl.content).toContain('GlobalDamageMultiplier');
  });

  it('Update method handles temperature critical at both extremes', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('bCriticalAtBothExtremes');
    expect(impl.content).toContain('MaxValue - Cfg.CriticalThreshold');
  });

  it('Update method ticks down modifier durations', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('RemainingTime');
    expect(impl.content).toContain('RemoveAt');
  });

  it('Update method has stamina passive recovery', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('RecoveryRate');
    expect(impl.content).toContain('stamina');
  });

  it('ConsumeStamina returns false when insufficient', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('ConsumeStamina');
    expect(impl.content).toContain('return false');
  });

  it('SetTemperature clamps to 0-MaxValue', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('SetTemperature');
    expect(impl.content).toContain('FMath::Clamp');
  });

  it('RestoreNeed fires NeedSatisfied event on recovery', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('NeedSatisfied');
  });

  it('FireEvent broadcasts delegate and logs', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('OnSurvivalEvent.Broadcast');
    expect(impl.content).toContain('UE_LOG');
  });

  it('StringToNeedType maps all 5 need types', () => {
    const files = generateCppFiles(makeMinimalIR());
    const impl = files.find(f => f.path.endsWith('SurvivalSystem.cpp'))!;
    expect(impl.content).toContain('hunger');
    expect(impl.content).toContain('thirst');
    expect(impl.content).toContain('temperature');
    expect(impl.content).toContain('stamina');
    expect(impl.content).toContain('sleep');
  });
});

// ─────────────────────────────────────────────
// Survival DataTable generation
// ─────────────────────────────────────────────

describe('Unreal export - Survival DataTable files', () => {
  it('generates DT_SurvivalNeeds.json with all 5 needs', () => {
    const files = generateDataTableFiles(makeMinimalIR());
    const dt = files.find(f => f.path.endsWith('DT_SurvivalNeeds.json'));
    expect(dt).toBeDefined();
    const rows = JSON.parse(dt!.content);
    expect(rows).toHaveLength(5);
    const ids = rows.map((r: any) => r.NeedId);
    expect(ids).toContain('hunger');
    expect(ids).toContain('thirst');
    expect(ids).toContain('temperature');
    expect(ids).toContain('stamina');
    expect(ids).toContain('sleep');
  });

  it('DT_SurvivalNeeds rows have correct fields', () => {
    const files = generateDataTableFiles(makeMinimalIR());
    const dt = files.find(f => f.path.endsWith('DT_SurvivalNeeds.json'))!;
    const rows = JSON.parse(dt.content);
    const hunger = rows.find((r: any) => r.NeedId === 'hunger');
    expect(hunger.NeedName).toBe('Hunger');
    expect(hunger.MaxValue).toBe(100);
    expect(hunger.StartValue).toBe(100);
    expect(hunger.DecayRate).toBe(0.15);
    expect(hunger.CriticalThreshold).toBe(10);
    expect(hunger.WarningThreshold).toBe(25);
    expect(hunger.DamageRate).toBe(2);
  });

  it('generates DT_SurvivalModifierPresets.json', () => {
    const files = generateDataTableFiles(makeMinimalIR());
    const dt = files.find(f => f.path.endsWith('DT_SurvivalModifierPresets.json'));
    expect(dt).toBeDefined();
    const rows = JSON.parse(dt!.content);
    expect(rows).toHaveLength(3);
    const campfire = rows.find((r: any) => r.PresetId === 'near_campfire');
    expect(campfire.NeedType).toBe('temperature');
    expect(campfire.RateMultiplier).toBe(0);
  });

  it('DT_SurvivalNeeds is empty when survival IR is null', () => {
    const files = generateDataTableFiles(makeMinimalIR({ survival: null }));
    const dt = files.find(f => f.path.endsWith('DT_SurvivalNeeds.json'))!;
    const rows = JSON.parse(dt.content);
    expect(rows).toHaveLength(0);
  });

  it('DT_SurvivalModifierPresets is empty when survival IR is null', () => {
    const files = generateDataTableFiles(makeMinimalIR({ survival: null }));
    const dt = files.find(f => f.path.endsWith('DT_SurvivalModifierPresets.json'))!;
    const rows = JSON.parse(dt.content);
    expect(rows).toHaveLength(0);
  });
});
