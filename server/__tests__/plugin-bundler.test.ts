/**
 * Tests for Plugin Bundler — verifies that Insimul plugins are correctly
 * bundled into exported game projects with character mappings and configuration.
 */

import { describe, it, expect } from 'vitest';
import {
  bundleBabylonPlugin,
  bundleUnityPlugin,
  bundleGodotPlugin,
  bundleUnrealPlugin,
} from '../services/game-export/plugin-bundler.js';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ── Mock WorldIR ────────────────────────────────────────────────────────────

function createMockIR(): WorldIR {
  return {
    meta: {
      worldId: 'world-123',
      worldName: 'Test World',
      worldType: 'fantasy',
      gameType: 'rpg',
      exportVersion: '1.0.0',
    },
    entities: {
      characters: [
        {
          id: 'char-1',
          worldId: 'world-123',
          firstName: 'Greta',
          middleName: null,
          lastName: 'Baker',
          suffix: null,
          gender: 'female',
          isAlive: true,
          birthYear: 1990,
          personality: { openness: 0.7, conscientiousness: 0.8, extroversion: 0.5, agreeableness: 0.9, neuroticism: 0.2 },
          physicalTraits: {},
          mentalTraits: {},
          skills: {},
          relationships: {},
          socialAttributes: {},
          coworkerIds: [],
          friendIds: [],
          neighborIds: [],
          immediateFamilyIds: [],
          extendedFamilyIds: [],
          parentIds: [],
          childIds: [],
          spouseId: null,
          genealogyData: {},
          currentLocation: 'settlement-1',
          occupation: 'Baker',
          status: null,
        },
        {
          id: 'char-2',
          worldId: 'world-123',
          firstName: 'Erik',
          middleName: null,
          lastName: 'Guard',
          suffix: null,
          gender: 'male',
          isAlive: true,
          birthYear: 1985,
          personality: { openness: 0.3, conscientiousness: 0.9, extroversion: 0.4, agreeableness: 0.5, neuroticism: 0.6 },
          physicalTraits: {},
          mentalTraits: {},
          skills: {},
          relationships: {},
          socialAttributes: {},
          coworkerIds: [],
          friendIds: [],
          neighborIds: [],
          immediateFamilyIds: [],
          extendedFamilyIds: [],
          parentIds: [],
          childIds: [],
          spouseId: null,
          genealogyData: {},
          currentLocation: 'settlement-1',
          occupation: 'Guard',
          status: null,
        },
      ],
      npcs: [
        {
          characterId: 'char-1',
          role: 'merchant',
          homePosition: { x: 10, y: 0, z: 20 },
          patrolRadius: 15,
          disposition: 80,
          settlementId: 'settlement-1',
          questIds: [],
          greeting: null,
        },
        {
          characterId: 'char-2',
          role: 'guard',
          homePosition: { x: 30, y: 0, z: 40 },
          patrolRadius: 25,
          disposition: 50,
          settlementId: 'settlement-1',
          questIds: ['quest-1'],
          greeting: null,
        },
      ],
      buildings: [],
      businesses: [],
      roads: [],
      natureObjects: [],
      animals: [],
      dungeons: [],
      questObjects: [],
      items: [],
      lootTables: [],
    },
    geography: {
      terrain: { width: 512, depth: 512, heightScale: 30 },
      countries: [],
      states: [],
      settlements: [],
      lots: [],
    },
    systems: {
      ai: { dialogueContexts: [] },
      rules: [],
      actions: [],
      quests: [],
      truths: [],
      grammars: [],
      languages: [],
      knowledgeBase: '',
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.3, g: 0.5, b: 0.2 },
        skyColor: { r: 0.5, g: 0.7, b: 1.0 },
        roadColor: { r: 0.4, g: 0.35, b: 0.3 },
        roadRadius: 3,
      },
    },
    assets: { models: [], textures: [], audio: [], animations: [] },
    player: {
      speed: 5,
      jumpHeight: 2,
      gravity: -9.81,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
    },
    ui: {},
    combat: {
      style: 'melee',
      settings: {},
    },
  } as unknown as WorldIR;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Plugin Bundler', () => {
  const ir = createMockIR();

  describe('bundleBabylonPlugin', () => {
    it('bundles SDK source files into src/insimul-sdk/', () => {
      const files = bundleBabylonPlugin(ir);
      const sdkFiles = files.filter(f => f.path.startsWith('src/insimul-sdk/'));
      expect(sdkFiles.length).toBeGreaterThan(0);
    });

    it('generates configuration with world ID and character mappings', () => {
      const files = bundleBabylonPlugin(ir);
      const configFile = files.find(f => f.path.includes('insimul-config.ts'));
      expect(configFile).toBeDefined();
      expect(configFile!.content).toContain('world-123');
      expect(configFile!.content).toContain('Greta Baker');
      expect(configFile!.content).toContain('Erik Guard');
      expect(configFile!.content).toContain('merchant');
      expect(configFile!.content).toContain('guard');
    });

    it('includes SDK entry point files', () => {
      const files = bundleBabylonPlugin(ir);
      const paths = files.map(f => f.path);
      expect(paths).toContain('src/insimul-sdk/client.ts');
      expect(paths).toContain('src/insimul-sdk/types.ts');
      expect(paths).toContain('src/insimul-sdk/index.ts');
    });
  });

  describe('bundleUnityPlugin', () => {
    it('bundles plugin files into Assets/Plugins/Insimul/', () => {
      const files = bundleUnityPlugin(ir);
      const pluginFiles = files.filter(f => f.path.startsWith('Assets/Plugins/Insimul/'));
      expect(pluginFiles.length).toBeGreaterThan(0);
    });

    it('generates C# config with character mappings', () => {
      const files = bundleUnityPlugin(ir);
      const configFile = files.find(f => f.path.includes('InsimulExportConfig.cs'));
      expect(configFile).toBeDefined();
      expect(configFile!.content).toContain('world-123');
      expect(configFile!.content).toContain('Greta Baker');
      expect(configFile!.content).toContain('merchant');
      expect(configFile!.content).toContain('namespace Insimul');
    });

    it('includes InsimulManager runtime file', () => {
      const files = bundleUnityPlugin(ir);
      const managerFile = files.find(f => f.path.includes('InsimulManager.cs'));
      expect(managerFile).toBeDefined();
    });
  });

  describe('bundleGodotPlugin', () => {
    it('bundles plugin files into addons/insimul/', () => {
      const files = bundleGodotPlugin(ir);
      const addonFiles = files.filter(f => f.path.startsWith('addons/insimul/'));
      expect(addonFiles.length).toBeGreaterThan(0);
    });

    it('generates GDScript config with character mappings', () => {
      const files = bundleGodotPlugin(ir);
      const configFile = files.find(f => f.path.includes('insimul_export_config.gd'));
      expect(configFile).toBeDefined();
      expect(configFile!.content).toContain('world-123');
      expect(configFile!.content).toContain('Greta Baker');
      expect(configFile!.content).toContain('class_name InsimulExportConfig');
    });

    it('includes plugin.cfg', () => {
      const files = bundleGodotPlugin(ir);
      const cfgFile = files.find(f => f.path.endsWith('plugin.cfg'));
      expect(cfgFile).toBeDefined();
    });
  });

  describe('bundleUnrealPlugin', () => {
    it('bundles plugin files into Plugins/Insimul/', () => {
      const files = bundleUnrealPlugin(ir);
      const pluginFiles = files.filter(f => f.path.startsWith('Plugins/Insimul/'));
      expect(pluginFiles.length).toBeGreaterThan(0);
    });

    it('generates .uplugin file', () => {
      const files = bundleUnrealPlugin(ir);
      const uplugin = files.find(f => f.path.endsWith('.uplugin'));
      expect(uplugin).toBeDefined();
    });

    it('generates INI config with character mappings', () => {
      const files = bundleUnrealPlugin(ir);
      const iniFile = files.find(f => f.path.includes('InsimulConfig.ini'));
      expect(iniFile).toBeDefined();
      expect(iniFile!.content).toContain('world-123');
      expect(iniFile!.content).toContain('Greta Baker');
      expect(iniFile!.content).toContain('+CharacterMappings');
    });

    it('generates C++ config header', () => {
      const files = bundleUnrealPlugin(ir);
      const headerFile = files.find(f => f.path.includes('InsimulExportConfig.h'));
      expect(headerFile).toBeDefined();
      expect(headerFile!.content).toContain('InsimulExportConfig');
      expect(headerFile!.content).toContain('FCharacterMapping');
      expect(headerFile!.content).toContain('world-123');
    });
  });
});
