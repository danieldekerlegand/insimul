/**
 * Tests for Godot export_presets.cfg generation.
 *
 * Verifies that the project generator produces an export_presets.cfg with
 * all four platform targets (Windows, Linux, macOS, Web), correct export
 * paths with token substitution, and Forward Plus-compatible settings.
 */

import { describe, it, expect } from 'vitest';
import { generateProjectFiles } from '../services/game-export/godot/godot-project-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(overrides?: Partial<WorldIR>): WorldIR {
  return {
    meta: {
      worldId: 'w1',
      worldName: 'Test World',
      worldType: 'medieval_fantasy',
      seed: 'test-seed',
      insimulVersion: '1.0.0',
      exportedAt: '2026-03-24',
      genreConfig: {
        id: 'medieval_fantasy',
        name: 'Medieval Fantasy',
        features: { crafting: false, resources: false, magic: false },
        worldDefaults: {},
      },
    },
    geography: {
      terrainSize: 200,
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
    survival: null,
    resources: null,
    aiConfig: { apiMode: 'none', model: '', endpoint: '' },
    ...overrides,
  } as WorldIR;
}

function getExportPresets(ir?: WorldIR): string {
  const files = generateProjectFiles(ir ?? makeMinimalIR());
  const file = files.find(f => f.path === 'export_presets.cfg');
  expect(file).toBeDefined();
  return file!.content;
}

// ─────────────────────────────────────────────
// Export presets: file generation
// ─────────────────────────────────────────────

describe('Godot export_presets.cfg generation', () => {
  it('generates export_presets.cfg file', () => {
    const files = generateProjectFiles(makeMinimalIR());
    const file = files.find(f => f.path === 'export_presets.cfg');
    expect(file).toBeDefined();
  });

  it('contains all four platform presets', () => {
    const cfg = getExportPresets();
    expect(cfg).toContain('[preset.0]');
    expect(cfg).toContain('[preset.1]');
    expect(cfg).toContain('[preset.2]');
    expect(cfg).toContain('[preset.3]');
  });

  it('has Windows Desktop target', () => {
    const cfg = getExportPresets();
    expect(cfg).toContain('platform="Windows Desktop"');
    expect(cfg).toContain('builds/windows/Test_World.exe');
  });

  it('has Linux/X11 target', () => {
    const cfg = getExportPresets();
    expect(cfg).toContain('platform="Linux/X11"');
    expect(cfg).toContain('builds/linux/Test_World.x86_64');
  });

  it('has macOS target', () => {
    const cfg = getExportPresets();
    expect(cfg).toContain('platform="macOS"');
    expect(cfg).toContain('builds/macos/Test_World.app');
  });

  it('has Web target', () => {
    const cfg = getExportPresets();
    expect(cfg).toContain('platform="Web"');
    expect(cfg).toContain('builds/web/index.html');
  });

  it('substitutes world name into export paths', () => {
    const ir = makeMinimalIR();
    ir.meta.worldName = 'My Cool World!';
    const cfg = getExportPresets(ir);
    // Special chars replaced with underscores
    expect(cfg).toContain('builds/windows/My_Cool_World_.exe');
    expect(cfg).toContain('builds/linux/My_Cool_World_.x86_64');
    expect(cfg).toContain('builds/macos/My_Cool_World_.app');
    expect(cfg).not.toContain('{{WORLD_SAFE_NAME}}');
  });

  it('all presets are runnable', () => {
    const cfg = getExportPresets();
    const runnableMatches = cfg.match(/runnable=true/g);
    expect(runnableMatches).toHaveLength(4);
  });

  it('all presets use default encryption (disabled)', () => {
    const cfg = getExportPresets();
    const encryptPck = cfg.match(/encrypt_pck=false/g);
    const encryptDir = cfg.match(/encrypt_directory=false/g);
    expect(encryptPck).toHaveLength(4);
    expect(encryptDir).toHaveLength(4);
  });

  it('all presets export all resources', () => {
    const cfg = getExportPresets();
    const filterMatches = cfg.match(/export_filter="all_resources"/g);
    expect(filterMatches).toHaveLength(4);
  });

  it('desktop presets use s3tc_bptc texture format for Forward Plus', () => {
    const cfg = getExportPresets();
    const s3tcMatches = cfg.match(/texture_format\/s3tc_bptc=true/g);
    // Windows, Linux, macOS, and Web (for desktop) all have s3tc
    expect(s3tcMatches!.length).toBeGreaterThanOrEqual(3);
  });

  it('has options sections for each preset', () => {
    const cfg = getExportPresets();
    expect(cfg).toContain('[preset.0.options]');
    expect(cfg).toContain('[preset.1.options]');
    expect(cfg).toContain('[preset.2.options]');
    expect(cfg).toContain('[preset.3.options]');
  });
});
