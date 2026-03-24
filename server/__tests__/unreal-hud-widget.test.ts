/**
 * Tests for Unreal HUD widget generation
 *
 * Verifies that the Unreal export pipeline correctly generates:
 * - InsimulHUDWidget.h and .cpp in UI directory
 * - PlayerController includes HUD creation with correct IR-driven tokens
 * - Survival bars are included when survival IR is present
 * - Compass heading logic in the widget template
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(overrides?: Partial<WorldIR>): WorldIR {
  const base: WorldIR = {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'test-world',
      worldName: 'Test World',
      worldDescription: 'A test world',
      worldType: 'fantasy',
      genreConfig: {
        genre: 'rpg',
        subGenre: 'action-rpg',
        features: { crafting: false, resources: false, survival: false, dungeons: false, vehicles: false, companions: false, factions: false, housing: false, farming: false, fishing: false, cooking: false, mining: false, trading: true },
        cameraMode: 'third-person' as any,
        combatStyle: 'melee' as any,
      },
      exportTimestamp: new Date().toISOString(),
      exportVersion: 1,
      seed: 'test-seed',
    },
    geography: {
      terrainSize: 1000,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
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
      knowledgeBase: null,
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.4, g: 0.6, b: 0.3 },
        skyColor: { r: 0.5, g: 0.7, b: 1.0 },
        settlementBaseColor: { r: 0.8, g: 0.7, b: 0.6 },
        settlementRoofColor: { r: 0.6, g: 0.3, b: 0.2 },
        roadColor: { r: 0.5, g: 0.5, b: 0.5 },
        roadRadius: 2.5,
      } as any,
      skyboxAssetKey: null,
      ambientLighting: { color: [0.3, 0.3, 0.3], intensity: 0.5 },
      directionalLight: { direction: [0, -1, 0], intensity: 1.0 },
      fog: null,
    },
    assets: { collectionId: null, textures: [], models: [], audio: [], animations: [] },
    player: {
      startPosition: { x: 0, y: 1, z: 0 },
      modelAssetKey: null,
      initialEnergy: 100,
      initialGold: 50,
      initialHealth: 100,
      speed: 6,
      jumpHeight: 4,
      gravity: 9.8,
    },
    ui: { showMinimap: true, showHealthBar: true, showStaminaBar: true, showAmmoCounter: false, showCompass: true, genreLayout: 'rpg' },
    combat: {
      style: 'melee' as any,
      settings: { baseDamage: 10, damageVariance: 2, criticalChance: 0.1, criticalMultiplier: 2, blockReduction: 0.5, dodgeChance: 0.1, attackCooldown: 500, comboWindowMs: 300, maxComboLength: 3 },
    },
    survival: null,
    resources: null,
    aiConfig: { apiMode: 'insimul', insimulEndpoint: '', geminiModel: '', geminiApiKeyPlaceholder: '', voiceEnabled: false, defaultVoice: '' },
  };

  return { ...base, ...overrides };
}

// ─────────────────────────────────────────────
// HUD widget generation
// ─────────────────────────────────────────────

describe('Unreal export - HUD widget', () => {
  it('generates InsimulHUDWidget.h in UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const hud = files.find(f => f.path.endsWith('UI/InsimulHUDWidget.h'));
    expect(hud).toBeDefined();
    expect(hud!.content).toContain('UInsimulHUDWidget');
    expect(hud!.content).toContain('UUserWidget');
  });

  it('generates InsimulHUDWidget.cpp in UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const hud = files.find(f => f.path.endsWith('UI/InsimulHUDWidget.cpp'));
    expect(hud).toBeDefined();
    expect(hud!.content).toContain('UInsimulHUDWidget');
  });

  it('HUD widget header declares health, energy, gold, compass, and survival methods', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const hud = files.find(f => f.path.endsWith('UI/InsimulHUDWidget.h'))!;
    expect(hud.content).toContain('UpdateHealth');
    expect(hud.content).toContain('UpdateEnergy');
    expect(hud.content).toContain('UpdateGold');
    expect(hud.content).toContain('UpdateCompassHeading');
    expect(hud.content).toContain('UpdateSurvivalNeed');
  });

  it('HUD widget source implements compass heading with 8 directions', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const hud = files.find(f => f.path.endsWith('UI/InsimulHUDWidget.cpp'))!;
    // Verify all 8 cardinal/intercardinal directions
    for (const dir of ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']) {
      expect(hud.content).toContain(`"${dir}"`);
    }
  });

  it('HUD widget source creates survival bars for all 5 needs', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const hud = files.find(f => f.path.endsWith('UI/InsimulHUDWidget.cpp'))!;
    expect(hud.content).toContain('"hunger"');
    expect(hud.content).toContain('"thirst"');
    expect(hud.content).toContain('"temperature"');
    expect(hud.content).toContain('"stamina"');
    expect(hud.content).toContain('"sleep"');
  });

  it('HUD widget source has health color shift logic', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const hud = files.find(f => f.path.endsWith('UI/InsimulHUDWidget.cpp'))!;
    // Green above 60%, yellow above 30%, red below
    expect(hud.content).toContain('0.6f');
    expect(hud.content).toContain('0.3f');
  });
});

// ─────────────────────────────────────────────
// PlayerController HUD integration
// ─────────────────────────────────────────────

describe('Unreal export - PlayerController HUD integration', () => {
  it('PlayerController includes HUD widget header', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const pc = files.find(f => f.path.endsWith('InsimulPlayerController.h'))!;
    expect(pc.content).toContain('UInsimulHUDWidget');
  });

  it('PlayerController.cpp includes HUD creation', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const pc = files.find(f => f.path.endsWith('InsimulPlayerController.cpp'))!;
    expect(pc.content).toContain('CreateWidget<UInsimulHUDWidget>');
    expect(pc.content).toContain('AddToViewport');
  });

  it('PlayerController.cpp substitutes UI visibility tokens from IR', () => {
    const ir = makeMinimalIR({
      ui: { showMinimap: false, showHealthBar: true, showStaminaBar: false, showAmmoCounter: false, showCompass: true, genreLayout: 'rpg' },
    });
    const files = generateCppFiles(ir);
    const pc = files.find(f => f.path.endsWith('InsimulPlayerController.cpp'))!;
    // showHealthBar=true, showStaminaBar=false, showCompass=true, survival=null→false
    expect(pc.content).toContain('InitializeHUD(true, false, true, false)');
  });

  it('PlayerController.cpp sets HAS_SURVIVAL=true when survival IR is present', () => {
    const ir = makeMinimalIR({
      survival: {
        needs: [],
        damageConfig: { enabled: true, tickMode: 'continuous', globalDamageMultiplier: 1 },
        temperatureConfig: { comfortMin: 15, comfortMax: 35, criticalLow: 0, criticalHigh: 50, damageRate: 1 } as any,
        staminaConfig: { regenRate: 5, sprintDrainRate: 10, actionCosts: {} } as any,
        modifierPresets: [],
      },
    });
    const files = generateCppFiles(ir);
    const pc = files.find(f => f.path.endsWith('InsimulPlayerController.cpp'))!;
    expect(pc.content).toContain('true, true, true, true');
  });

  it('PlayerController.cpp pushes player stats to HUD each tick', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const pc = files.find(f => f.path.endsWith('InsimulPlayerController.cpp'))!;
    expect(pc.content).toContain('UpdateHealth(PC->Health, PC->MaxHealth)');
    expect(pc.content).toContain('UpdateEnergy(PC->Energy');
    expect(pc.content).toContain('UpdateGold(PC->Gold)');
    expect(pc.content).toContain('UpdateCompassHeading(Yaw)');
  });

  it('PlayerController.cpp substitutes PLAYER_MAX_ENERGY from IR', () => {
    const ir = makeMinimalIR();
    ir.player.initialEnergy = 200;
    const files = generateCppFiles(ir);
    const pc = files.find(f => f.path.endsWith('InsimulPlayerController.cpp'))!;
    expect(pc.content).toContain('200.f');
    expect(pc.content).not.toContain('{{PLAYER_MAX_ENERGY}}');
  });
});
