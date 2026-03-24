/**
 * Tests for Unity quest journal UI export
 *
 * Verifies that the Unity export pipeline correctly generates:
 * - QuestJournalUI.cs template file in the UI directory
 * - Toggle with J key and time pause
 * - Filter tabs (All, Active, Completed, Available)
 * - Category dropdown filter
 * - Quest list with ScrollRect and entry prefab
 * - Detail panel with title, description, type, difficulty, location, rewards
 * - Objective list with progress tracking
 * - Track/Untrack, Accept, Abandon action buttons
 * - Tracked quests HUD display
 * - Difficulty color coding
 * - Event binding to QuestSystem
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generateCSharpFiles } from '../services/game-export/unity/unity-csharp-generator';
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
}

// ─────────────────────────────────────────────
// File generation
// ─────────────────────────────────────────────

describe('Unity export - Quest Journal UI file generation', () => {
  it('generates QuestJournalUI.cs in the UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    const uiFile = files.find(f => f.path.endsWith('QuestJournalUI.cs'));
    expect(uiFile).toBeDefined();
    expect(uiFile!.path).toContain('Assets/Scripts/UI/');
  });

  it('is a non-empty file', () => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    const uiFile = files.find(f => f.path.endsWith('QuestJournalUI.cs'));
    expect(uiFile!.content.length).toBeGreaterThan(100);
  });
});

// ─────────────────────────────────────────────
// Class structure
// ─────────────────────────────────────────────

describe('Unity export - Quest Journal UI class structure', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('QuestJournalUI.cs'))!.content;
  });

  it('is in the Insimul.UI namespace', () => {
    expect(content).toContain('namespace Insimul.UI');
  });

  it('extends MonoBehaviour', () => {
    expect(content).toContain('class QuestJournalUI : MonoBehaviour');
  });

  it('imports QuestSystem namespace', () => {
    expect(content).toContain('using Insimul.Systems');
  });

  it('imports quest data namespace', () => {
    expect(content).toContain('using Insimul.Data');
  });

  it('imports UnityEngine.UI for ScrollRect', () => {
    expect(content).toContain('using UnityEngine.UI');
  });

  it('imports TMPro for text elements', () => {
    expect(content).toContain('using TMPro');
  });
});

// ─────────────────────────────────────────────
// Toggle with J key and time pause
// ─────────────────────────────────────────────

describe('Unity export - Quest Journal UI toggle and pause', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('QuestJournalUI.cs'))!.content;
  });

  it('toggles on J key press', () => {
    expect(content).toContain('KeyCode.J');
  });

  it('has ToggleJournal method', () => {
    expect(content).toContain('void ToggleJournal()');
  });

  it('has OpenJournal and CloseJournal methods', () => {
    expect(content).toContain('void OpenJournal()');
    expect(content).toContain('void CloseJournal()');
  });

  it('pauses game when open (Time.timeScale = 0)', () => {
    expect(content).toContain('Time.timeScale = 0f');
  });

  it('resumes game when closed (Time.timeScale = 1)', () => {
    expect(content).toContain('Time.timeScale = 1f');
  });

  it('shows cursor when open', () => {
    expect(content).toContain('Cursor.visible = true');
  });

  it('hides cursor when closed', () => {
    expect(content).toContain('Cursor.visible = false');
  });
});

// ─────────────────────────────────────────────
// Filter tabs
// ─────────────────────────────────────────────

describe('Unity export - Quest Journal UI filter tabs', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('QuestJournalUI.cs'))!.content;
  });

  it('has filter tab buttons', () => {
    expect(content).toContain('Button tabAll');
    expect(content).toContain('Button tabActive');
    expect(content).toContain('Button tabCompleted');
    expect(content).toContain('Button tabAvailable');
  });

  it('has QuestFilterTab enum', () => {
    expect(content).toContain('enum QuestFilterTab');
    expect(content).toContain('QuestFilterTab.All');
    expect(content).toContain('QuestFilterTab.Active');
    expect(content).toContain('QuestFilterTab.Completed');
    expect(content).toContain('QuestFilterTab.Available');
  });

  it('implements SetFilterTab', () => {
    expect(content).toContain('void SetFilterTab(QuestFilterTab tab)');
  });

  it('filters active quests via QuestSystem', () => {
    expect(content).toContain('GetActiveQuests()');
  });

  it('filters completed quests via QuestSystem', () => {
    expect(content).toContain('GetCompletedQuests()');
  });

  it('filters available quests via QuestSystem', () => {
    expect(content).toContain('GetAvailableQuests()');
  });
});

// ─────────────────────────────────────────────
// Category dropdown filter
// ─────────────────────────────────────────────

describe('Unity export - Quest Journal UI category filter', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('QuestJournalUI.cs'))!.content;
  });

  it('has category dropdown', () => {
    expect(content).toContain('TMP_Dropdown categoryDropdown');
  });

  it('filters by quest type', () => {
    expect(content).toContain('q.questType');
  });
});

// ─────────────────────────────────────────────
// Quest list with ScrollRect
// ─────────────────────────────────────────────

describe('Unity export - Quest Journal UI quest list', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('QuestJournalUI.cs'))!.content;
  });

  it('has ScrollRect reference', () => {
    expect(content).toContain('ScrollRect questScrollRect');
  });

  it('has quest list content transform', () => {
    expect(content).toContain('Transform questListContent');
  });

  it('has quest entry prefab reference', () => {
    expect(content).toContain('GameObject questEntryPrefab');
  });

  it('instantiates entries from prefab', () => {
    expect(content).toContain('Instantiate(questEntryPrefab, questListContent)');
  });

  it('shows tracked quest indicator', () => {
    expect(content).toContain('► ');
  });

  it('shows completed quest indicator', () => {
    expect(content).toContain('✓ ');
  });

  it('highlights selected entry with outline', () => {
    expect(content).toContain('Outline');
    expect(content).toContain('Color.yellow');
  });
});

// ─────────────────────────────────────────────
// Selection and detail panel
// ─────────────────────────────────────────────

describe('Unity export - Quest Journal UI selection and detail panel', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('QuestJournalUI.cs'))!.content;
  });

  it('has SelectQuest method', () => {
    expect(content).toContain('void SelectQuest(int index)');
  });

  it('has ClearSelection method', () => {
    expect(content).toContain('void ClearSelection()');
  });

  it('has HasSelection check', () => {
    expect(content).toContain('bool HasSelection()');
  });

  it('displays quest title in detail panel', () => {
    expect(content).toContain('detailTitle');
  });

  it('displays quest description', () => {
    expect(content).toContain('detailDescription');
  });

  it('displays quest type', () => {
    expect(content).toContain('detailType');
  });

  it('displays quest difficulty', () => {
    expect(content).toContain('detailDifficulty');
  });

  it('displays quest location', () => {
    expect(content).toContain('detailLocation');
    expect(content).toContain('quest.locationName');
  });

  it('displays quest rewards', () => {
    expect(content).toContain('detailRewards');
    expect(content).toContain('experienceReward');
    expect(content).toContain('itemRewards');
    expect(content).toContain('skillRewards');
  });
});

// ─────────────────────────────────────────────
// Objectives list
// ─────────────────────────────────────────────

describe('Unity export - Quest Journal UI objectives', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('QuestJournalUI.cs'))!.content;
  });

  it('has objectives content container', () => {
    expect(content).toContain('Transform objectivesContent');
  });

  it('has objective prefab', () => {
    expect(content).toContain('GameObject objectivePrefab');
  });

  it('shows objective progress', () => {
    expect(content).toContain('currentProgress');
    expect(content).toContain('targetProgress');
  });

  it('marks optional objectives', () => {
    expect(content).toContain('isOptional');
    expect(content).toContain('(optional)');
  });
});

// ─────────────────────────────────────────────
// Action buttons (Track, Accept, Abandon)
// ─────────────────────────────────────────────

describe('Unity export - Quest Journal UI action buttons', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('QuestJournalUI.cs'))!.content;
  });

  it('has Track, Accept, Abandon buttons', () => {
    expect(content).toContain('Button trackButton');
    expect(content).toContain('Button acceptButton');
    expect(content).toContain('Button abandonButton');
  });

  it('has toggle track method', () => {
    expect(content).toContain('void ToggleTrackSelected()');
  });

  it('has accept method', () => {
    expect(content).toContain('void AcceptSelected()');
  });

  it('has abandon method', () => {
    expect(content).toContain('void AbandonSelected()');
  });

  it('calls QuestSystem.AcceptQuest', () => {
    expect(content).toContain('_questSystem.AcceptQuest(quest.id)');
  });

  it('shows Track/Untrack text based on state', () => {
    expect(content).toContain('"Untrack"');
    expect(content).toContain('"Track"');
  });

  it('enforces max tracked quests limit', () => {
    expect(content).toContain('maxTrackedQuests');
    expect(content).toContain('_trackedQuestIds.Count >= maxTrackedQuests');
  });
});

// ─────────────────────────────────────────────
// Tracked quests HUD
// ─────────────────────────────────────────────

describe('Unity export - Quest Journal UI tracked quests HUD', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('QuestJournalUI.cs'))!.content;
  });

  it('has tracked quests text field', () => {
    expect(content).toContain('TextMeshProUGUI trackedQuestsText');
  });

  it('has UpdateTrackedQuestsHUD method', () => {
    expect(content).toContain('void UpdateTrackedQuestsHUD()');
  });

  it('shows quest title in HUD', () => {
    expect(content).toContain('quest.title');
  });

  it('shows objective progress in HUD', () => {
    expect(content).toContain('obj.currentCount');
    expect(content).toContain('obj.requiredCount');
  });

  it('queries objectives from QuestSystem', () => {
    expect(content).toContain('GetObjectivesForQuest(questId)');
  });
});

// ─────────────────────────────────────────────
// Difficulty colors
// ─────────────────────────────────────────────

describe('Unity export - Quest Journal UI difficulty colors', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('QuestJournalUI.cs'))!.content;
  });

  it('has difficulty color mapping', () => {
    expect(content).toContain('GetDifficultyColor');
  });

  it('supports difficulty tiers', () => {
    expect(content).toContain('"easy"');
    expect(content).toContain('"medium"');
    expect(content).toContain('"hard"');
    expect(content).toContain('"legendary"');
  });
});

// ─────────────────────────────────────────────
// Event binding to QuestSystem
// ─────────────────────────────────────────────

describe('Unity export - Quest Journal UI event binding', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('QuestJournalUI.cs'))!.content;
  });

  it('subscribes to OnQuestAccepted', () => {
    expect(content).toContain('_questSystem.OnQuestAccepted += OnQuestAccepted');
  });

  it('subscribes to OnQuestCompleted', () => {
    expect(content).toContain('_questSystem.OnQuestCompleted += OnQuestCompleted');
  });

  it('unsubscribes on destroy', () => {
    expect(content).toContain('_questSystem.OnQuestAccepted -= OnQuestAccepted');
    expect(content).toContain('_questSystem.OnQuestCompleted -= OnQuestCompleted');
  });

  it('removes tracked quest when completed', () => {
    expect(content).toContain('_trackedQuestIds.Remove(questId)');
  });
});

// ─────────────────────────────────────────────
// QuestSystem accessors (needed by journal)
// ─────────────────────────────────────────────

describe('Unity export - QuestSystem accessors for journal', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('QuestSystem.cs'))!.content;
  });

  it('exposes GetAllQuests', () => {
    expect(content).toContain('GetAllQuests()');
  });

  it('exposes GetCompletedQuests', () => {
    expect(content).toContain('GetCompletedQuests()');
  });

  it('exposes GetAvailableQuests', () => {
    expect(content).toContain('GetAvailableQuests()');
  });

  it('exposes IsQuestActive', () => {
    expect(content).toContain('bool IsQuestActive(string id)');
  });

  it('exposes IsQuestCompleted', () => {
    expect(content).toContain('bool IsQuestCompleted(string id)');
  });

  it('exposes GetObjectivesForQuest', () => {
    expect(content).toContain('GetObjectivesForQuest(string questId)');
  });

  it('fires OnQuestAccepted event', () => {
    expect(content).toContain('OnQuestAccepted?.Invoke(questId)');
  });

  it('fires OnQuestCompleted event', () => {
    expect(content).toContain('OnQuestCompleted?.Invoke(questId)');
  });
});
