/**
 * Tests for AI bundle integration in the Babylon.js export pipeline.
 *
 * Verifies that:
 * - generateDataFiles exports ai_config.json and dialogue_contexts.json
 * - bundleBabylonPlugin includes AI config in the generated SDK config
 */

import { describe, it, expect } from 'vitest';
import { generateDataFiles } from '../services/game-export/babylon/babylon-data-generator';
import { bundleBabylonPlugin } from '../services/game-export/plugin-bundler';
import type { WorldIR, AIConfigIR } from '@shared/game-engine/ir-types';

// ── Minimal WorldIR fixture ───────────────────────────────────────────────

function createMockIR(overrides: {
  aiConfig?: AIConfigIR;
  dialogueContexts?: any[];
} = {}): WorldIR {
  return {
    meta: {
      worldId: 'world-ai-test',
      worldName: 'AI Test World',
      worldType: 'fantasy',
      gameType: 'rpg',
      exportVersion: '1.0.0',
    },
    entities: {
      characters: [
        {
          id: 'char-1',
          worldId: 'world-ai-test',
          firstName: 'Mira',
          middleName: null,
          lastName: 'Sage',
          suffix: null,
          gender: 'female',
          isAlive: true,
          birthYear: 1990,
          personality: { openness: 0.8, conscientiousness: 0.7, extroversion: 0.6, agreeableness: 0.9, neuroticism: 0.2 },
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
          occupation: 'Healer',
          status: null,
        },
      ],
      npcs: [
        {
          characterId: 'char-1',
          role: 'healer',
          homePosition: { x: 10, y: 0, z: 20 },
          patrolRadius: 10,
          disposition: 90,
          settlementId: 'settlement-1',
          questIds: [],
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
      terrain: { width: 256, depth: 256, heightScale: 20 },
      countries: [],
      states: [],
      settlements: [],
      lots: [],
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
      dialogueContexts: overrides.dialogueContexts ?? [],
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
    combat: { style: 'melee', settings: {} },
    aiConfig: overrides.aiConfig ?? {
      apiMode: 'insimul',
      insimulEndpoint: '/api/gemini/chat',
      geminiModel: 'gemini-2.5-flash',
      geminiApiKeyPlaceholder: 'YOUR_GEMINI_API_KEY',
      voiceEnabled: true,
      defaultVoice: 'Kore',
    },
  } as unknown as WorldIR;
}

// ── Data generator tests ──────────────────────────────────────────────────

describe('Babylon AI bundle — data generator', () => {
  it('exports ai_config.json when aiConfig is present', () => {
    const ir = createMockIR();
    const files = generateDataFiles(ir);
    const aiConfigFile = files.find(f => f.path === 'public/data/ai_config.json');

    expect(aiConfigFile).toBeDefined();
    const parsed = JSON.parse(aiConfigFile!.content);
    expect(parsed.apiMode).toBe('insimul');
    expect(parsed.insimulEndpoint).toBe('/api/gemini/chat');
    expect(parsed.geminiModel).toBe('gemini-2.5-flash');
    expect(parsed.voiceEnabled).toBe(true);
    expect(parsed.defaultVoice).toBe('Kore');
  });

  it('exports dialogue_contexts.json when contexts exist', () => {
    const ir = createMockIR({
      dialogueContexts: [
        {
          characterId: 'char-1',
          characterName: 'Mira Sage',
          systemPrompt: 'You are Mira, a wise healer.',
          greeting: 'Welcome, traveler.',
          voice: 'Kore',
          truths: [],
        },
      ],
    });
    const files = generateDataFiles(ir);
    const ctxFile = files.find(f => f.path === 'public/data/dialogue_contexts.json');

    expect(ctxFile).toBeDefined();
    const parsed = JSON.parse(ctxFile!.content);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].characterId).toBe('char-1');
    expect(parsed[0].systemPrompt).toContain('Mira');
  });

  it('does not export dialogue_contexts.json when empty', () => {
    const ir = createMockIR({ dialogueContexts: [] });
    const files = generateDataFiles(ir);
    const ctxFile = files.find(f => f.path === 'public/data/dialogue_contexts.json');

    expect(ctxFile).toBeUndefined();
  });

  it('preserves gemini apiMode in ai_config.json', () => {
    const ir = createMockIR({
      aiConfig: {
        apiMode: 'gemini',
        insimulEndpoint: '/api/gemini/chat',
        geminiModel: 'gemini-2.5-pro',
        geminiApiKeyPlaceholder: 'MY_KEY',
        voiceEnabled: false,
        defaultVoice: 'Aoede',
      },
    });
    const files = generateDataFiles(ir);
    const aiConfigFile = files.find(f => f.path === 'public/data/ai_config.json');
    const parsed = JSON.parse(aiConfigFile!.content);

    expect(parsed.apiMode).toBe('gemini');
    expect(parsed.geminiModel).toBe('gemini-2.5-pro');
    expect(parsed.voiceEnabled).toBe(false);
    expect(parsed.defaultVoice).toBe('Aoede');
  });
});

// ── Plugin bundler tests ──────────────────────────────────────────────────

describe('Babylon AI bundle — plugin config', () => {
  it('includes AI_CONFIG in generated insimul-config.ts', () => {
    const ir = createMockIR();
    const files = bundleBabylonPlugin(ir);
    const configFile = files.find(f => f.path.includes('insimul-config.ts'));

    expect(configFile).toBeDefined();
    expect(configFile!.content).toContain('AI_CONFIG');
    expect(configFile!.content).toContain('apiMode');
    expect(configFile!.content).toContain('insimul');
    expect(configFile!.content).toContain('voiceEnabled');
    expect(configFile!.content).toContain('defaultVoice');
  });

  it('includes AIConfig interface in generated config', () => {
    const ir = createMockIR();
    const files = bundleBabylonPlugin(ir);
    const configFile = files.find(f => f.path.includes('insimul-config.ts'));

    expect(configFile!.content).toContain('export interface AIConfig');
    expect(configFile!.content).toContain("apiMode: 'insimul' | 'gemini'");
  });

  it('embeds world-specific AI config values', () => {
    const ir = createMockIR({
      aiConfig: {
        apiMode: 'gemini',
        insimulEndpoint: '/api/gemini/chat',
        geminiModel: 'gemini-2.5-pro',
        geminiApiKeyPlaceholder: 'CUSTOM_KEY',
        voiceEnabled: false,
        defaultVoice: 'Aoede',
      },
    });
    const files = bundleBabylonPlugin(ir);
    const configFile = files.find(f => f.path.includes('insimul-config.ts'));

    expect(configFile!.content).toContain('"gemini"');
    expect(configFile!.content).toContain('gemini-2.5-pro');
    expect(configFile!.content).toContain('CUSTOM_KEY');
    expect(configFile!.content).toContain('Aoede');
  });

  it('uses defaults when aiConfig is missing', () => {
    const ir = createMockIR();
    (ir as any).aiConfig = undefined;
    const files = bundleBabylonPlugin(ir);
    const configFile = files.find(f => f.path.includes('insimul-config.ts'));

    expect(configFile!.content).toContain('AI_CONFIG');
    expect(configFile!.content).toContain('insimul');
    expect(configFile!.content).toContain('Kore');
  });
});
