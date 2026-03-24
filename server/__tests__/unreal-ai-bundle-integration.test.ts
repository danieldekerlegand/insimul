/**
 * Tests for AI bundle integration into Unreal export pipeline.
 *
 * Verifies that:
 * - InsimulAIBundle.h and .cpp are generated in the C++ output
 * - AI config values from IR are baked into the generated code
 * - Dialogue contexts with truths are embedded correctly
 * - Knowledge base content is escaped and embedded
 * - DataTable generator produces DataLoader-compatible file names
 * - Empty dialogue contexts and KB are handled gracefully
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import { generateDataTableFiles } from '../services/game-export/unreal/unreal-datatable-generator';
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
    ui: { showMinimap: true, showHealthBar: true, showStaminaBar: true, showAmmoCounter: false, showCompass: true, genreLayout: 'rpg', questJournal: { enabled: true, maxTrackedQuests: 3, showQuestMarkers: true, autoTrackNew: true, sortOrder: 'newest' as const, categories: ['conversation', 'vocabulary'] } },
    combat: {
      style: 'melee' as any,
      settings: { baseDamage: 10, damageVariance: 2, criticalChance: 0.1, criticalMultiplier: 2, blockReduction: 0.5, dodgeChance: 0.1, attackCooldown: 500, comboWindowMs: 300, maxComboLength: 3 },
    },
    survival: null,
    resources: null,
    aiConfig: {
      apiMode: 'insimul',
      insimulEndpoint: '/api/gemini/chat',
      geminiModel: 'gemini-2.5-flash',
      geminiApiKeyPlaceholder: 'YOUR_KEY_HERE',
      voiceEnabled: true,
      defaultVoice: 'Kore',
    },
  };

  return { ...base, ...overrides };
}

// ─────────────────────────────────────────────
// AI Bundle C++ generation
// ─────────────────────────────────────────────

describe('Unreal export - AI Bundle generation', () => {
  it('generates InsimulAIBundle.h in output', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulAIBundle.h'));
    expect(header).toBeDefined();
    expect(header!.content).toContain('UInsimulAIBundle');
    expect(header!.content).toContain('GetBundledConfig');
    expect(header!.content).toContain('GetBundledContexts');
    expect(header!.content).toContain('GetKnowledgeBase');
  });

  it('generates InsimulAIBundle.cpp with baked-in config', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulAIBundle.cpp'));
    expect(cpp).toBeDefined();
    expect(cpp!.content).toContain('insimul');
    expect(cpp!.content).toContain('/api/gemini/chat');
    expect(cpp!.content).toContain('gemini-2.5-flash');
    expect(cpp!.content).toContain('YOUR_KEY_HERE');
    expect(cpp!.content).toContain('true'); // voiceEnabled
    expect(cpp!.content).toContain('Kore');
  });

  it('auto-initializes AI service in Initialize()', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulAIBundle.cpp'))!;
    expect(cpp.content).toContain('GetSubsystem<UInsimulAIService>');
    expect(cpp.content).toContain('AIService->InitializeService');
    expect(cpp.content).toContain('bInitialized = true');
  });

  it('bakes in gemini mode when configured', () => {
    const ir = makeMinimalIR({
      aiConfig: {
        apiMode: 'gemini',
        insimulEndpoint: '',
        geminiModel: 'gemini-2.5-pro',
        geminiApiKeyPlaceholder: 'TEST_API_KEY',
        voiceEnabled: false,
        defaultVoice: 'Aoede',
      },
    });
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulAIBundle.cpp'))!;
    expect(cpp.content).toContain('"gemini"');
    expect(cpp.content).toContain('gemini-2.5-pro');
    expect(cpp.content).toContain('TEST_API_KEY');
    expect(cpp.content).toContain('bVoiceEnabled = false');
    expect(cpp.content).toContain('Aoede');
  });
});

// ─────────────────────────────────────────────
// Dialogue context embedding
// ─────────────────────────────────────────────

describe('Unreal export - AI Bundle dialogue contexts', () => {
  it('embeds dialogue contexts with truths', () => {
    const ir = makeMinimalIR({
      systems: {
        ...makeMinimalIR().systems,
        dialogueContexts: [
          {
            characterId: 'char-1',
            characterName: 'Alice Smith',
            systemPrompt: 'You are Alice, a friendly merchant.',
            greeting: 'Welcome to my shop!',
            voice: 'Kore',
            truths: [
              { title: 'Hometown', content: 'Alice grew up in Testville.' },
              { title: 'Occupation', content: 'Alice runs the general store.' },
            ],
          },
        ],
      },
    });

    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulAIBundle.cpp'))!;
    expect(cpp.content).toContain('char-1');
    expect(cpp.content).toContain('Alice Smith');
    expect(cpp.content).toContain('You are Alice, a friendly merchant.');
    expect(cpp.content).toContain('Welcome to my shop!');
    expect(cpp.content).toContain('Hometown');
    expect(cpp.content).toContain('Alice grew up in Testville.');
    expect(cpp.content).toContain('Occupation');
  });

  it('handles multiple dialogue contexts', () => {
    const ir = makeMinimalIR({
      systems: {
        ...makeMinimalIR().systems,
        dialogueContexts: [
          { characterId: 'c1', characterName: 'NPC One', systemPrompt: 'p1', greeting: 'g1', voice: 'Kore', truths: [] },
          { characterId: 'c2', characterName: 'NPC Two', systemPrompt: 'p2', greeting: 'g2', voice: 'Aoede', truths: [] },
        ],
      },
    });

    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulAIBundle.cpp'))!;
    expect(cpp.content).toContain('NPC One');
    expect(cpp.content).toContain('NPC Two');
    // Should contain two Result.Add calls
    const addCount = (cpp.content.match(/Result\.Add\(Ctx\)/g) || []).length;
    expect(addCount).toBe(2);
  });

  it('handles empty dialogue contexts gracefully', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulAIBundle.cpp'))!;
    // Should still compile — empty GetBundledContexts returns empty array
    expect(cpp.content).toContain('TArray<FInsimulDialogueContext> Result');
    expect(cpp.content).toContain('return Result');
    // No context initializer code
    expect(cpp.content).not.toContain('Result.Add');
  });

  it('escapes special characters in dialogue text', () => {
    const ir = makeMinimalIR({
      systems: {
        ...makeMinimalIR().systems,
        dialogueContexts: [
          {
            characterId: 'c1',
            characterName: 'O\'Brien',
            systemPrompt: 'You say "hello" to everyone.\nBe friendly.',
            greeting: 'Hi there!',
            voice: 'Kore',
            truths: [{ title: 'Quote', content: 'He said "yes"' }],
          },
        ],
      },
    });

    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulAIBundle.cpp'))!;
    // Quotes and newlines should be escaped for C++ TEXT("...") literals
    expect(cpp.content).toContain('\\"hello\\"');
    expect(cpp.content).toContain('\\n');
    expect(cpp.content).not.toContain('\n"'); // no raw newline inside a TEXT literal
  });
});

// ─────────────────────────────────────────────
// Knowledge base embedding
// ─────────────────────────────────────────────

describe('Unreal export - AI Bundle knowledge base', () => {
  it('embeds knowledge base content', () => {
    const ir = makeMinimalIR({
      systems: {
        ...makeMinimalIR().systems,
        knowledgeBase: ':- module(world, []).\ncharacter(alice).\nfriend(alice, bob).',
      },
    });

    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulAIBundle.cpp'))!;
    expect(cpp.content).toContain('character(alice)');
    expect(cpp.content).toContain('friend(alice, bob)');
  });

  it('handles null knowledge base', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulAIBundle.cpp'))!;
    expect(cpp.content).toContain('GetKnowledgeBase');
    // Should return empty string
    expect(cpp.content).toContain('return TEXT("")');
  });
});

// ─────────────────────────────────────────────
// DataTable file naming for DataLoader compatibility
// ─────────────────────────────────────────────

describe('Unreal export - DataLoader-compatible file names', () => {
  it('generates ai-config.json alongside AIConfig.json', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const aiConfig = files.find(f => f.path.endsWith('AIConfig.json'));
    const aiConfigCompat = files.find(f => f.path.endsWith('ai-config.json'));
    expect(aiConfig).toBeDefined();
    expect(aiConfigCompat).toBeDefined();
    expect(aiConfig!.content).toBe(aiConfigCompat!.content);
  });

  it('generates dialogue-contexts.json alongside DT_DialogueContexts.json', () => {
    const ir = makeMinimalIR({
      systems: {
        ...makeMinimalIR().systems,
        dialogueContexts: [
          { characterId: 'c1', characterName: 'NPC', systemPrompt: 'p', greeting: 'g', voice: 'v', truths: [] },
        ],
      },
    });
    const files = generateDataTableFiles(ir);
    const dt = files.find(f => f.path.endsWith('DT_DialogueContexts.json'));
    const compat = files.find(f => f.path.endsWith('dialogue-contexts.json'));
    expect(dt).toBeDefined();
    expect(compat).toBeDefined();
    expect(dt!.content).toBe(compat!.content);
  });

  it('generates knowledge_base.pl alongside KnowledgeBase.pl', () => {
    const ir = makeMinimalIR({
      systems: {
        ...makeMinimalIR().systems,
        knowledgeBase: 'fact(a).',
      },
    });
    const files = generateDataTableFiles(ir);
    const kb = files.find(f => f.path.endsWith('KnowledgeBase.pl'));
    const kbCompat = files.find(f => f.path.endsWith('knowledge_base.pl'));
    expect(kb).toBeDefined();
    expect(kbCompat).toBeDefined();
    expect(kb!.content).toBe(kbCompat!.content);
  });

  it('skips dialogue context files when no contexts exist', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const dt = files.find(f => f.path.endsWith('DT_DialogueContexts.json'));
    const compat = files.find(f => f.path.endsWith('dialogue-contexts.json'));
    expect(dt).toBeUndefined();
    expect(compat).toBeUndefined();
  });
});
