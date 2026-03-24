/**
 * Tests for Godot quest journal UI export
 *
 * Verifies that the Godot export pipeline correctly generates:
 * - quest_journal_ui.gd template file in the UI directory
 * - Toggle with J key and game pause
 * - Filter tabs (All, Active, Completed, Available)
 * - Split-panel layout: quest list (left), details (right)
 * - Quest entries with tracked/completed indicators and difficulty colors
 * - Detail panel with title, description, type, difficulty, location, rewards
 * - Objective list with progress tracking and optional markers
 * - Track/Untrack, Accept, Abandon action buttons
 * - Tracked quests HUD display
 * - Event binding to QuestSystem signals
 * - QuestSystem accessor methods needed by journal
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generateGDScriptFiles } from '../services/game-export/godot/godot-gdscript-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(): WorldIR {
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
  } as WorldIR;
}

// ─────────────────────────────────────────────
// File generation
// ─────────────────────────────────────────────

describe('Godot export - Quest Journal UI file generation', () => {
  it('generates quest_journal_ui.gd in the UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const uiFile = files.find(f => f.path.endsWith('quest_journal_ui.gd'));
    expect(uiFile).toBeDefined();
    expect(uiFile!.path).toBe('scripts/ui/quest_journal_ui.gd');
  });

  it('is a non-empty file', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const uiFile = files.find(f => f.path.endsWith('quest_journal_ui.gd'));
    expect(uiFile!.content.length).toBeGreaterThan(100);
  });
});

// ─────────────────────────────────────────────
// Class structure
// ─────────────────────────────────────────────

describe('Godot export - Quest Journal UI class structure', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('quest_journal_ui.gd'))!.content;
  });

  it('extends CanvasLayer', () => {
    expect(content).toContain('extends CanvasLayer');
  });

  it('has FilterTab enum', () => {
    expect(content).toContain('enum FilterTab');
    expect(content).toContain('FilterTab.ALL');
    expect(content).toContain('FilterTab.ACTIVE');
    expect(content).toContain('FilterTab.COMPLETED');
    expect(content).toContain('FilterTab.AVAILABLE');
  });

  it('connects to QuestSystem signals', () => {
    expect(content).toContain('QuestSystem.quest_accepted.connect');
    expect(content).toContain('QuestSystem.quest_completed.connect');
  });
});

// ─────────────────────────────────────────────
// Toggle with J key and game pause
// ─────────────────────────────────────────────

describe('Godot export - Quest Journal UI toggle and pause', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('quest_journal_ui.gd'))!.content;
  });

  it('toggles on J key press', () => {
    expect(content).toContain('KEY_J');
  });

  it('has toggle_journal method', () => {
    expect(content).toContain('func toggle_journal()');
  });

  it('has open_journal and close_journal methods', () => {
    expect(content).toContain('func open_journal()');
    expect(content).toContain('func close_journal()');
  });

  it('pauses game when open', () => {
    expect(content).toContain('get_tree().paused = true');
  });

  it('resumes game when closed', () => {
    expect(content).toContain('get_tree().paused = false');
  });

  it('shows cursor when open', () => {
    expect(content).toContain('Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)');
  });

  it('captures cursor when closed', () => {
    expect(content).toContain('Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)');
  });
});

// ─────────────────────────────────────────────
// Filter tabs
// ─────────────────────────────────────────────

describe('Godot export - Quest Journal UI filter tabs', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('quest_journal_ui.gd'))!.content;
  });

  it('has tab buttons for each filter', () => {
    expect(content).toContain('_tab_all');
    expect(content).toContain('_tab_active');
    expect(content).toContain('_tab_completed');
    expect(content).toContain('_tab_available');
  });

  it('has set_filter_tab method', () => {
    expect(content).toContain('func set_filter_tab(tab: FilterTab)');
  });

  it('filters active quests via QuestSystem', () => {
    expect(content).toContain('QuestSystem.get_active_quests()');
  });

  it('filters completed quests via QuestSystem', () => {
    expect(content).toContain('QuestSystem.get_completed_quests()');
  });

  it('filters available quests via QuestSystem', () => {
    expect(content).toContain('QuestSystem.get_available_quests()');
  });

  it('gets all quests for All tab', () => {
    expect(content).toContain('QuestSystem.get_all_quests()');
  });
});

// ─────────────────────────────────────────────
// Split-panel layout
// ─────────────────────────────────────────────

describe('Godot export - Quest Journal UI split panel layout', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('quest_journal_ui.gd'))!.content;
  });

  it('uses HSplitContainer for split layout', () => {
    expect(content).toContain('HSplitContainer');
  });

  it('has quest list container on left', () => {
    expect(content).toContain('_list_panel');
    expect(content).toContain('_quest_list_container');
  });

  it('has detail panel on right', () => {
    expect(content).toContain('_detail_panel');
  });

  it('has ScrollContainer for quest list', () => {
    expect(content).toContain('_quest_scroll');
    expect(content).toContain('ScrollContainer');
  });
});

// ─────────────────────────────────────────────
// Quest entries
// ─────────────────────────────────────────────

describe('Godot export - Quest Journal UI quest entries', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('quest_journal_ui.gd'))!.content;
  });

  it('shows tracked quest indicator', () => {
    expect(content).toContain('► ');
  });

  it('shows completed quest indicator', () => {
    expect(content).toContain('✓ ');
  });

  it('has difficulty color mapping', () => {
    expect(content).toContain('DIFFICULTY_COLORS');
  });

  it('supports difficulty tiers', () => {
    expect(content).toContain('"easy"');
    expect(content).toContain('"medium"');
    expect(content).toContain('"hard"');
    expect(content).toContain('"legendary"');
  });

  it('highlights selected entry', () => {
    expect(content).toContain('Color.YELLOW');
  });
});

// ─────────────────────────────────────────────
// Selection and detail panel
// ─────────────────────────────────────────────

describe('Godot export - Quest Journal UI selection and detail panel', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('quest_journal_ui.gd'))!.content;
  });

  it('has select_quest method', () => {
    expect(content).toContain('func select_quest(index: int)');
  });

  it('has has_selection check', () => {
    expect(content).toContain('func has_selection() -> bool');
  });

  it('displays quest title in detail panel', () => {
    expect(content).toContain('_detail_title');
  });

  it('displays quest description', () => {
    expect(content).toContain('_detail_description');
  });

  it('displays quest type', () => {
    expect(content).toContain('_detail_type');
    expect(content).toContain('questType');
  });

  it('displays quest difficulty', () => {
    expect(content).toContain('_detail_difficulty');
  });

  it('displays quest location', () => {
    expect(content).toContain('_detail_location');
    expect(content).toContain('locationName');
  });

  it('displays quest rewards', () => {
    expect(content).toContain('_detail_rewards');
    expect(content).toContain('experienceReward');
    expect(content).toContain('itemRewards');
    expect(content).toContain('skillRewards');
  });
});

// ─────────────────────────────────────────────
// Objectives list
// ─────────────────────────────────────────────

describe('Godot export - Quest Journal UI objectives', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('quest_journal_ui.gd'))!.content;
  });

  it('has objectives container', () => {
    expect(content).toContain('_objectives_container');
  });

  it('shows objective progress', () => {
    expect(content).toContain('current_count');
    expect(content).toContain('required_count');
  });

  it('marks optional objectives', () => {
    expect(content).toContain('"optional"');
    expect(content).toContain('(optional)');
  });

  it('shows completion checkmark', () => {
    expect(content).toContain('"completed"');
  });

  it('queries objectives from QuestSystem', () => {
    expect(content).toContain('QuestSystem.get_objectives_for_quest');
  });
});

// ─────────────────────────────────────────────
// Action buttons (Track, Accept, Abandon)
// ─────────────────────────────────────────────

describe('Godot export - Quest Journal UI action buttons', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('quest_journal_ui.gd'))!.content;
  });

  it('has Track, Accept, Abandon buttons', () => {
    expect(content).toContain('_track_button');
    expect(content).toContain('_accept_button');
    expect(content).toContain('_abandon_button');
  });

  it('has toggle_track_selected method', () => {
    expect(content).toContain('func toggle_track_selected()');
  });

  it('has accept_selected method', () => {
    expect(content).toContain('func accept_selected()');
  });

  it('has abandon_selected method', () => {
    expect(content).toContain('func abandon_selected()');
  });

  it('calls QuestSystem.accept_quest', () => {
    expect(content).toContain('QuestSystem.accept_quest');
  });

  it('shows Track/Untrack text based on state', () => {
    expect(content).toContain('"Untrack"');
    expect(content).toContain('"Track"');
  });

  it('enforces max tracked quests limit', () => {
    expect(content).toContain('MAX_TRACKED_QUESTS');
    expect(content).toContain('_tracked_quest_ids.size() >= MAX_TRACKED_QUESTS');
  });
});

// ─────────────────────────────────────────────
// Tracked quests HUD
// ─────────────────────────────────────────────

describe('Godot export - Quest Journal UI tracked quests HUD', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('quest_journal_ui.gd'))!.content;
  });

  it('has tracked quests HUD element', () => {
    expect(content).toContain('_tracked_hud');
  });

  it('has _update_tracked_hud method', () => {
    expect(content).toContain('func _update_tracked_hud()');
  });

  it('shows quest title in HUD', () => {
    expect(content).toContain('quest.get("title"');
  });

  it('shows objective progress in HUD', () => {
    expect(content).toContain('current_count');
    expect(content).toContain('required_count');
  });

  it('updates HUD each frame', () => {
    expect(content).toContain('func _process(_delta: float)');
    expect(content).toContain('_update_tracked_hud()');
  });
});

// ─────────────────────────────────────────────
// Event binding to QuestSystem
// ─────────────────────────────────────────────

describe('Godot export - Quest Journal UI event binding', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('quest_journal_ui.gd'))!.content;
  });

  it('connects to quest_accepted signal', () => {
    expect(content).toContain('QuestSystem.quest_accepted.connect');
  });

  it('connects to quest_completed signal', () => {
    expect(content).toContain('QuestSystem.quest_completed.connect');
  });

  it('removes tracked quest when completed', () => {
    expect(content).toContain('_tracked_quest_ids.erase(quest_id)');
  });

  it('refreshes list on quest accepted', () => {
    expect(content).toContain('func _on_quest_accepted');
    expect(content).toContain('refresh_quest_list()');
  });

  it('refreshes list on quest completed', () => {
    expect(content).toContain('func _on_quest_completed');
  });
});

// ─────────────────────────────────────────────
// QuestSystem accessors (needed by journal)
// ─────────────────────────────────────────────

describe('Godot export - QuestSystem accessors for journal', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('quest_system.gd'))!.content;
  });

  it('exposes get_all_quests', () => {
    expect(content).toContain('func get_all_quests() -> Array[Dictionary]');
  });

  it('exposes get_completed_quests', () => {
    expect(content).toContain('func get_completed_quests() -> Array[Dictionary]');
  });

  it('exposes get_available_quests', () => {
    expect(content).toContain('func get_available_quests() -> Array[Dictionary]');
  });

  it('exposes is_quest_active', () => {
    expect(content).toContain('func is_quest_active(quest_id: String) -> bool');
  });

  it('exposes is_quest_completed', () => {
    expect(content).toContain('func is_quest_completed(quest_id: String) -> bool');
  });

  it('exposes get_objectives_for_quest', () => {
    expect(content).toContain('func get_objectives_for_quest(quest_id: String) -> Array[Dictionary]');
  });

  it('fires quest_accepted signal', () => {
    expect(content).toContain('quest_accepted.emit(quest_id)');
  });

  it('fires quest_completed signal', () => {
    expect(content).toContain('quest_completed.emit(quest_id)');
  });
});
