/**
 * Tests for Unreal Quest Journal UI Widget export
 *
 * Verifies that the Unreal export pipeline correctly generates:
 * - QuestJournalWidget.h with token substitution for config values
 * - QuestJournalWidget.cpp as a static template
 * - QuestEntrySummary struct in QuestSystem.h
 * - QuestJournalConfigIR integration in the UI section
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
    ui: {
      showMinimap: true,
      showHealthBar: true,
      showStaminaBar: true,
      showAmmoCounter: false,
      showCompass: true,
      genreLayout: 'rpg',
      questJournal: {
        enabled: true,
        maxTrackedQuests: 5,
        showQuestMarkers: true,
        autoTrackNew: true,
        sortOrder: 'newest',
        categories: ['conversation', 'translation', 'vocabulary', 'grammar', 'cultural'],
      },
    },
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
// QuestJournalWidget template generation
// ─────────────────────────────────────────────

describe('Unreal export - Quest Journal Widget', () => {
  it('generates QuestJournalWidget.h file', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestJournalWidget.h'));
    expect(header).toBeDefined();
    expect(header!.path).toContain('UI/QuestJournalWidget.h');
  });

  it('generates QuestJournalWidget.cpp file', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.includes('QuestJournalWidget.cpp'));
    expect(cpp).toBeDefined();
    expect(cpp!.path).toContain('UI/QuestJournalWidget.cpp');
  });

  it('substitutes MaxTrackedQuests token from IR config', () => {
    const ir = makeMinimalIR();
    ir.ui.questJournal.maxTrackedQuests = 7;
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestJournalWidget.h'))!;
    expect(header.content).toContain('MaxTrackedQuests = 7');
    expect(header.content).not.toContain('{{MAX_TRACKED_QUESTS}}');
  });

  it('substitutes ShowQuestMarkers token as true', () => {
    const ir = makeMinimalIR();
    ir.ui.questJournal.showQuestMarkers = true;
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestJournalWidget.h'))!;
    expect(header.content).toContain('bShowQuestMarkers = true');
  });

  it('substitutes ShowQuestMarkers token as false', () => {
    const ir = makeMinimalIR();
    ir.ui.questJournal.showQuestMarkers = false;
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestJournalWidget.h'))!;
    expect(header.content).toContain('bShowQuestMarkers = false');
  });

  it('substitutes AutoTrackNew token', () => {
    const ir = makeMinimalIR();
    ir.ui.questJournal.autoTrackNew = false;
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestJournalWidget.h'))!;
    expect(header.content).toContain('bAutoTrackNew = false');
  });

  it('defaults to 3 max tracked when questJournal is missing', () => {
    const ir = makeMinimalIR();
    (ir.ui as any).questJournal = undefined;
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestJournalWidget.h'))!;
    expect(header.content).toContain('MaxTrackedQuests = 3');
  });

  it('header contains UUserWidget base class', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestJournalWidget.h'))!;
    expect(header.content).toContain('public UUserWidget');
  });

  it('header contains FQuestJournalEntry struct', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestJournalWidget.h'))!;
    expect(header.content).toContain('struct FQuestJournalEntry');
  });

  it('header contains FQuestFilter struct', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestJournalWidget.h'))!;
    expect(header.content).toContain('struct FQuestFilter');
  });

  it('header declares OnQuestSelected delegate', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestJournalWidget.h'))!;
    expect(header.content).toContain('FOnQuestSelected');
    expect(header.content).toContain('OnQuestSelected');
  });

  it('header declares tracking and pinning methods', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestJournalWidget.h'))!;
    expect(header.content).toContain('ToggleTracking');
    expect(header.content).toContain('PinQuest');
    expect(header.content).toContain('UnpinQuest');
    expect(header.content).toContain('GetTrackedEntries');
    expect(header.content).toContain('GetFilteredEntries');
  });

  it('cpp contains LoadConfig implementation', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.includes('QuestJournalWidget.cpp'))!;
    expect(cpp.content).toContain('UQuestJournalWidget::LoadConfig');
    expect(cpp.content).toContain('questJournal');
  });

  it('cpp contains RefreshEntries implementation', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.includes('QuestJournalWidget.cpp'))!;
    expect(cpp.content).toContain('UQuestJournalWidget::RefreshEntries');
    expect(cpp.content).toContain('QuestEntries');
  });
});

// ─────────────────────────────────────────────
// QuestSystem.h — QuestEntrySummary struct
// ─────────────────────────────────────────────

describe('Unreal export - QuestEntrySummary in QuestSystem', () => {
  it('QuestSystem.h contains FQuestEntrySummary struct', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestSystem.h'))!;
    expect(header).toBeDefined();
    expect(header.content).toContain('struct FQuestEntrySummary');
  });

  it('QuestSystem.h exposes QuestEntries array', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.includes('QuestSystem.h'))!;
    expect(header.content).toContain('TArray<FQuestEntrySummary> QuestEntries');
  });
});

// ─────────────────────────────────────────────
// QuestJournalConfigIR type shape
// ─────────────────────────────────────────────

describe('QuestJournalConfigIR', () => {
  it('is included in UIIR', () => {
    const ir = makeMinimalIR();
    expect(ir.ui.questJournal).toBeDefined();
    expect(ir.ui.questJournal.enabled).toBe(true);
    expect(ir.ui.questJournal.maxTrackedQuests).toBe(5);
    expect(ir.ui.questJournal.showQuestMarkers).toBe(true);
    expect(ir.ui.questJournal.autoTrackNew).toBe(true);
    expect(ir.ui.questJournal.sortOrder).toBe('newest');
    expect(ir.ui.questJournal.categories).toEqual(['conversation', 'translation', 'vocabulary', 'grammar', 'cultural']);
  });
});
