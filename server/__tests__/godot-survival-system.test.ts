/**
 * Tests for Godot survival_system.gd — complete survival system features.
 *
 * Verifies that:
 * - survival_system.gd template includes temperature, stamina, modifier, and restoration features
 * - game_manager.gd wires SurvivalSystem.load_from_data
 * - hud.gd includes survival bars
 * - GDScript generator includes survival_system.gd when survival is enabled
 * - Data generator outputs survival.json
 */

import { describe, it, expect } from 'vitest';
import { generateGDScriptFiles } from '../services/game-export/godot/godot-gdscript-generator';
import { generateDataFiles } from '../services/game-export/godot/godot-data-generator';
import { loadStaticTemplate } from '../services/game-export/godot/godot-template-loader';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(overrides?: Partial<WorldIR>): WorldIR {
  return {
    meta: {
      worldId: 'w1',
      worldName: 'Test World',
      worldType: 'survival',
      seed: 'test-seed',
      insimulVersion: '1.0.0',
      exportedAt: '2026-03-24',
      genreConfig: {
        id: 'survival',
        name: 'Survival',
        features: { crafting: true, resources: true, magic: false },
        worldDefaults: {},
      },
    },
    geography: {
      terrainSize: 200,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
      biomeZones: [],
      foliageLayers: [],
      terrainFeatures: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      businesses: [],
      roads: [],
      natureObjects: [],
      animals: [],
      dungeons: [],
      questObjects: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [],
      truths: [],
      grammars: [],
      languages: [],
      items: [],
      lootTables: [],
      dialogueContexts: [],
      knowledgeBase: '',
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.3, g: 0.5, b: 0.2 },
        skyColor: { r: 0.5, g: 0.7, b: 1.0 },
        roadColor: { r: 0.4, g: 0.35, b: 0.3 },
        roadRadius: 2,
        settlementBaseColor: { r: 0.7, g: 0.6, b: 0.5 },
        settlementRoofColor: { r: 0.5, g: 0.3, b: 0.2 },
      },
      ambientLighting: { color: [0.5, 0.5, 0.5], intensity: 0.5 },
      directionalLight: { direction: [0, -1, 0.5], intensity: 1 },
      fog: null,
    },
    assets: { textures: [], models: [], audio: [], animations: [] },
    player: {
      startPosition: { x: 100, y: 1, z: 100 },
      speed: 5,
      jumpHeight: 1.5,
      gravity: 9.8,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
    },
    ui: { showMinimap: true, showQuestTracker: true, showChat: true },
    combat: {
      style: 'real-time',
      settings: {
        baseDamage: 10,
        criticalChance: 0.1,
        criticalMultiplier: 2,
        blockReduction: 0.5,
        dodgeChance: 0.1,
        attackCooldown: 1000,
      },
    },
    survival: {
      needs: [
        { id: 'hunger', name: 'Hunger', icon: '🍖', startValue: 80, maxValue: 100, decayRate: 0.15, criticalThreshold: 15, damageRate: 2, warningThreshold: 30 },
        { id: 'thirst', name: 'Thirst', icon: '💧', startValue: 90, maxValue: 100, decayRate: 0.25, criticalThreshold: 15, damageRate: 3, warningThreshold: 30 },
        { id: 'temperature', name: 'Temperature', icon: '🌡️', startValue: 50, maxValue: 100, decayRate: 0, criticalThreshold: 10, damageRate: 1.5, warningThreshold: 20 },
        { id: 'stamina', name: 'Stamina', icon: '⚡', startValue: 100, maxValue: 100, decayRate: 0, criticalThreshold: 10, damageRate: 0, warningThreshold: 25 },
        { id: 'sleep', name: 'Sleep', icon: '😴', startValue: 100, maxValue: 100, decayRate: 0.08, criticalThreshold: 10, damageRate: 0.5, warningThreshold: 25 },
      ],
      damageConfig: { enabled: true, tickMode: 'continuous', globalDamageMultiplier: 1 },
      temperatureConfig: {
        environmentDriven: true,
        comfortZone: { min: 20, max: 80 },
        criticalAtBothExtremes: true,
      },
      staminaConfig: { actionDriven: true, recoveryRate: 2 },
      modifierPresets: [
        { id: 'near_campfire', name: 'Near Campfire', needType: 'temperature', rateMultiplier: 0, duration: 0, source: 'environment' },
        { id: 'well_fed', name: 'Well Fed', needType: 'hunger', rateMultiplier: 0.5, duration: 300000, source: 'consumable' },
        { id: 'dehydrated', name: 'Dehydrated', needType: 'thirst', rateMultiplier: 1.5, duration: 120000, source: 'status_effect' },
        { id: 'resting', name: 'Resting', needType: 'stamina', rateMultiplier: 0, duration: 0, source: 'action' },
      ],
    },
    resources: null,
    aiConfig: { apiMode: 'none', model: '', endpoint: '' },
    ...overrides,
  } as unknown as WorldIR;
}

// ─────────────────────────────────────────────
// survival_system.gd - Core need features
// ─────────────────────────────────────────────

describe('Godot survival_system.gd - core needs', () => {
  const content = loadStaticTemplate('scripts/systems/survival_system.gd');

  it('exposes get_all_needs method', () => {
    expect(content).toContain('func get_all_needs()');
  });

  it('exposes get_need_value method', () => {
    expect(content).toContain('func get_need_value(need_id: String)');
  });

  it('exposes get_need_percent method', () => {
    expect(content).toContain('func get_need_percent(need_id: String)');
  });

  it('exposes modify_need method', () => {
    expect(content).toContain('func modify_need(need_id: String, delta_val: float)');
  });

  it('fires need_warning signal', () => {
    expect(content).toContain('signal need_warning(need_id: String, value: float)');
  });

  it('fires need_critical signal', () => {
    expect(content).toContain('signal need_critical(need_id: String, value: float)');
  });

  it('fires damage_from_need signal', () => {
    expect(content).toContain('signal damage_from_need(need_id: String, damage: float)');
  });

  it('applies global_damage_multiplier', () => {
    expect(content).toContain('global_damage_multiplier');
  });

  it('clamps need values with clampf', () => {
    expect(content).toContain('clampf(');
  });
});

// ─────────────────────────────────────────────
// survival_system.gd - Need restoration
// ─────────────────────────────────────────────

describe('Godot survival_system.gd - need restoration', () => {
  const content = loadStaticTemplate('scripts/systems/survival_system.gd');

  it('fires need_restored signal', () => {
    expect(content).toContain('signal need_restored(need_id: String, value: float)');
  });

  it('checks was_critical or was_warning before firing restored', () => {
    expect(content).toContain('was_critical or was_warning');
  });

  it('exposes restore_need method', () => {
    expect(content).toContain('func restore_need(need_id: String, amount: float)');
  });

  it('exposes eat method for hunger', () => {
    expect(content).toContain('func eat(item_id: String');
  });

  it('exposes drink method for thirst', () => {
    expect(content).toContain('func drink(item_id: String');
  });

  it('exposes sleep_rest method for sleep and stamina', () => {
    expect(content).toContain('func sleep_rest(');
  });

  it('fires need_changed signal', () => {
    expect(content).toContain('signal need_changed(need_id: String, value: float, max_value: float)');
  });
});

// ─────────────────────────────────────────────
// survival_system.gd - Temperature system
// ─────────────────────────────────────────────

describe('Godot survival_system.gd - temperature system', () => {
  const content = loadStaticTemplate('scripts/systems/survival_system.gd');

  it('has environment_temperature field', () => {
    expect(content).toContain('environment_temperature');
  });

  it('loads temperature config from world data', () => {
    expect(content).toContain('temperatureConfig');
  });

  it('tracks comfort zone min and max', () => {
    expect(content).toContain('temperature_comfort_min');
    expect(content).toContain('temperature_comfort_max');
  });

  it('supports critical at both extremes', () => {
    expect(content).toContain('temperature_critical_both_extremes');
  });

  it('exposes set_environment_temperature method', () => {
    expect(content).toContain('func set_environment_temperature(temperature: float)');
  });

  it('exposes get_environment_temperature method', () => {
    expect(content).toContain('func get_environment_temperature()');
  });

  it('has dedicated _update_temperature_need method', () => {
    expect(content).toContain('func _update_temperature_need(');
  });

  it('uses inverse_lerp for temperature mapping', () => {
    expect(content).toContain('inverse_lerp');
  });

  it('uses move_toward for smooth temperature transitions', () => {
    expect(content).toContain('move_toward');
  });
});

// ─────────────────────────────────────────────
// survival_system.gd - Stamina system
// ─────────────────────────────────────────────

describe('Godot survival_system.gd - stamina system', () => {
  const content = loadStaticTemplate('scripts/systems/survival_system.gd');

  it('loads stamina config from world data', () => {
    expect(content).toContain('staminaConfig');
  });

  it('tracks action-driven stamina mode', () => {
    expect(content).toContain('stamina_action_driven');
  });

  it('has stamina recovery rate', () => {
    expect(content).toContain('stamina_recovery_rate');
  });

  it('has dedicated _update_stamina_need method', () => {
    expect(content).toContain('func _update_stamina_need(');
  });

  it('exposes consume_stamina method', () => {
    expect(content).toContain('func consume_stamina(amount: float)');
  });

  it('exposes has_stamina check', () => {
    expect(content).toContain('func has_stamina(amount: float)');
  });

  it('recovers stamina with recovery rate', () => {
    expect(content).toContain('effective_recovery * delta');
  });
});

// ─────────────────────────────────────────────
// survival_system.gd - Modifier presets
// ─────────────────────────────────────────────

describe('Godot survival_system.gd - modifier presets', () => {
  const content = loadStaticTemplate('scripts/systems/survival_system.gd');

  it('has modifier_presets dictionary', () => {
    expect(content).toContain('var modifier_presets: Dictionary');
  });

  it('has active_modifiers array', () => {
    expect(content).toContain('var active_modifiers:');
  });

  it('loads modifier presets from world data', () => {
    expect(content).toContain('modifierPresets');
  });

  it('exposes apply_modifier method', () => {
    expect(content).toContain('func apply_modifier(preset_id: String)');
  });

  it('exposes remove_modifier method', () => {
    expect(content).toContain('func remove_modifier(preset_id: String)');
  });

  it('exposes get_active_modifiers method', () => {
    expect(content).toContain('func get_active_modifiers()');
  });

  it('fires modifier_applied signal', () => {
    expect(content).toContain('signal modifier_applied(preset_id: String, need_type: String)');
  });

  it('fires modifier_expired signal', () => {
    expect(content).toContain('signal modifier_expired(preset_id: String, need_type: String)');
  });

  it('computes effective decay rate from modifiers', () => {
    expect(content).toContain('func _get_effective_decay_rate(');
  });

  it('refreshes duration on re-applied modifiers', () => {
    expect(content).toContain('remainingDuration');
  });

  it('converts duration from milliseconds to seconds', () => {
    expect(content).toContain('duration", 0.0) / 1000.0');
  });

  it('updates modifiers each frame', () => {
    expect(content).toContain('_update_modifiers(delta)');
  });

  it('handles permanent modifiers (duration 0)', () => {
    expect(content).toContain('isPermanent');
  });
});

// ─────────────────────────────────────────────
// game_manager.gd - SurvivalSystem wiring
// ─────────────────────────────────────────────

describe('Godot game_manager.gd - SurvivalSystem integration', () => {
  const content = loadStaticTemplate('scripts/core/game_manager.gd');

  it('finds SurvivalSystem node', () => {
    expect(content).toContain('get_node_or_null("/root/SurvivalSystem")');
  });

  it('calls SurvivalSystem.load_from_data', () => {
    expect(content).toContain('survival_system.load_from_data(world_data)');
  });
});

// ─────────────────────────────────────────────
// hud.gd - Survival bars
// ─────────────────────────────────────────────

describe('Godot hud.gd - survival bars integration', () => {
  const content = loadStaticTemplate('scripts/ui/hud.gd');

  it('connects to SurvivalSystem', () => {
    expect(content).toContain('_survival_system');
  });

  it('creates survival bar containers', () => {
    expect(content).toContain('_survival_container');
    expect(content).toContain('SurvivalBars');
  });

  it('has setup method for survival bars', () => {
    expect(content).toContain('func _setup_survival_bars()');
  });

  it('updates survival bars each frame', () => {
    expect(content).toContain('_update_survival_bars');
  });

  it('connects to need_warning signal', () => {
    expect(content).toContain('need_warning');
  });

  it('connects to need_critical signal', () => {
    expect(content).toContain('need_critical');
  });

  it('connects to need_restored signal', () => {
    expect(content).toContain('need_restored');
  });

  it('flashes bar on warning (yellow)', () => {
    expect(content).toContain('Color.YELLOW');
  });

  it('flashes bar on critical (red)', () => {
    expect(content).toContain('Color.RED');
  });

  it('defines need icons/labels', () => {
    expect(content).toContain('NEED_ICONS');
  });

  it('defines need colors', () => {
    expect(content).toContain('NEED_COLORS');
  });
});

// ─────────────────────────────────────────────
// GDScript generator includes survival_system.gd
// ─────────────────────────────────────────────

describe('Godot GDScript generator - survival system inclusion', () => {
  it('includes survival_system.gd when survival is enabled', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/survival_system.gd');
    expect(file).toBeDefined();
  });

  it('excludes survival_system.gd when survival is null', () => {
    const ir = makeMinimalIR({ survival: null });
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/survival_system.gd');
    expect(file).toBeUndefined();
  });

  it('survival_system.gd contains temperature support', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/survival_system.gd');
    expect(file!.content).toContain('set_environment_temperature');
    expect(file!.content).toContain('temperature_enabled');
  });

  it('survival_system.gd contains stamina support', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/survival_system.gd');
    expect(file!.content).toContain('consume_stamina');
    expect(file!.content).toContain('has_stamina');
  });

  it('survival_system.gd contains modifier support', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/survival_system.gd');
    expect(file!.content).toContain('apply_modifier');
    expect(file!.content).toContain('remove_modifier');
    expect(file!.content).toContain('modifier_presets');
  });

  it('survival_system.gd contains restoration events', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/survival_system.gd');
    expect(file!.content).toContain('need_restored');
  });
});

// ─────────────────────────────────────────────
// Data generator - survival.json
// ─────────────────────────────────────────────

describe('Godot data generator - survival.json', () => {
  it('generates survival.json when survival is enabled', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const file = files.find(f => f.path === 'data/survival.json');
    expect(file).toBeDefined();
  });

  it('does not generate survival.json when survival is null', () => {
    const ir = makeMinimalIR({ survival: null });
    const files = generateDataFiles(ir);
    const file = files.find(f => f.path === 'data/survival.json');
    expect(file).toBeUndefined();
  });

  it('survival.json includes all five needs', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const file = files.find(f => f.path === 'data/survival.json');
    const data = JSON.parse(file!.content);
    expect(data.needs).toHaveLength(5);
    const ids = data.needs.map((n: any) => n.id);
    expect(ids).toEqual(['hunger', 'thirst', 'temperature', 'stamina', 'sleep']);
  });

  it('survival.json includes damageConfig', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const file = files.find(f => f.path === 'data/survival.json');
    const data = JSON.parse(file!.content);
    expect(data.damageConfig.enabled).toBe(true);
    expect(data.damageConfig.globalDamageMultiplier).toBe(1);
  });

  it('survival.json includes temperatureConfig', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const file = files.find(f => f.path === 'data/survival.json');
    const data = JSON.parse(file!.content);
    expect(data.temperatureConfig.environmentDriven).toBe(true);
    expect(data.temperatureConfig.comfortZone.min).toBe(20);
    expect(data.temperatureConfig.comfortZone.max).toBe(80);
  });

  it('survival.json includes staminaConfig', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const file = files.find(f => f.path === 'data/survival.json');
    const data = JSON.parse(file!.content);
    expect(data.staminaConfig.actionDriven).toBe(true);
    expect(data.staminaConfig.recoveryRate).toBe(2);
  });

  it('survival.json includes modifierPresets', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const file = files.find(f => f.path === 'data/survival.json');
    const data = JSON.parse(file!.content);
    expect(data.modifierPresets).toHaveLength(4);
    const campfire = data.modifierPresets.find((p: any) => p.id === 'near_campfire');
    expect(campfire.rateMultiplier).toBe(0);
    expect(campfire.needType).toBe('temperature');
  });
});
