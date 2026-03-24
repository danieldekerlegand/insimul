/**
 * Tests for Godot dialogue UI panel export
 *
 * Verifies that the Godot export pipeline correctly generates:
 * - dialogue_panel.gd template file in the UI directory
 * - Updated dialogue_system.gd that references dialogue_panel
 * - Bottom-of-screen panel with NPC portrait, typewriter text, response buttons
 * - Language learning mode with target/translation labels and Listen button
 * - Close with Escape or Goodbye button, emitting dialogue_closed
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
    aiConfig: { apiMode: 'insimul', insimulEndpoint: '', geminiModel: '', geminiApiKeyPlaceholder: '', voiceEnabled: false, defaultVoice: '' },
  } as WorldIR;
}

// ─────────────────────────────────────────────
// File generation
// ─────────────────────────────────────────────

describe('Godot export - dialogue_panel.gd file generation', () => {
  it('generates dialogue_panel.gd in the UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const panelFile = files.find(f => f.path === 'scripts/ui/dialogue_panel.gd');
    expect(panelFile).toBeDefined();
  });

  it('does not generate the old chat_panel.gd', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const chatFile = files.find(f => f.path === 'scripts/ui/chat_panel.gd');
    expect(chatFile).toBeUndefined();
  });

  it('is a non-empty file', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const panelFile = files.find(f => f.path === 'scripts/ui/dialogue_panel.gd');
    expect(panelFile!.content.length).toBeGreaterThan(100);
  });
});

// ─────────────────────────────────────────────
// Panel structure
// ─────────────────────────────────────────────

describe('Godot export - dialogue panel structure', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path === 'scripts/ui/dialogue_panel.gd')!.content;
  });

  it('extends CanvasLayer', () => {
    expect(content).toContain('extends CanvasLayer');
  });

  it('emits dialogue_closed signal', () => {
    expect(content).toContain('signal dialogue_closed');
  });

  it('has open_dialogue method', () => {
    expect(content).toContain('func open_dialogue(character_id: String)');
  });

  it('has close_dialogue method', () => {
    expect(content).toContain('func close_dialogue()');
  });

  it('has is_open method', () => {
    expect(content).toContain('func is_open()');
  });

  it('uses high layer for UI overlay', () => {
    expect(content).toContain('layer = 100');
  });
});

// ─────────────────────────────────────────────
// NPC portrait
// ─────────────────────────────────────────────

describe('Godot export - dialogue panel NPC portrait', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path === 'scripts/ui/dialogue_panel.gd')!.content;
  });

  it('has a portrait ColorRect', () => {
    expect(content).toContain('_portrait_rect: ColorRect');
    expect(content).toContain('ColorRect.new()');
  });

  it('has a portrait label for first initial', () => {
    expect(content).toContain('_portrait_label: Label');
    expect(content).toContain('initial');
  });

  it('has NPC name label', () => {
    expect(content).toContain('_npc_name_label: Label');
  });

  it('derives portrait color from name hash', () => {
    expect(content).toContain('npc_name.hash()');
    expect(content).toContain('Color.from_hsv');
  });

  it('sets portrait with _set_portrait method', () => {
    expect(content).toContain('func _set_portrait(npc_name: String)');
  });
});

// ─────────────────────────────────────────────
// Typewriter effect
// ─────────────────────────────────────────────

describe('Godot export - dialogue panel typewriter effect', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path === 'scripts/ui/dialogue_panel.gd')!.content;
  });

  it('defines typewriter speed constant at 30 chars/sec', () => {
    expect(content).toContain('TYPEWRITER_SPEED := 30.0');
  });

  it('has typewriter state variables', () => {
    expect(content).toContain('_is_typing');
    expect(content).toContain('_typewriter_elapsed');
    expect(content).toContain('_typewriter_full_text');
    expect(content).toContain('_typewriter_visible_chars');
  });

  it('implements typewriter in _process', () => {
    expect(content).toContain('func _process(delta: float)');
    expect(content).toContain('_typewriter_elapsed += delta');
    expect(content).toContain('TYPEWRITER_SPEED');
  });

  it('has _start_typewriter method', () => {
    expect(content).toContain('func _start_typewriter(text: String)');
  });

  it('has _finish_typing method that shows responses', () => {
    expect(content).toContain('func _finish_typing()');
    expect(content).toContain('_display_responses');
  });

  it('can skip typewriter with _skip_typewriter', () => {
    expect(content).toContain('func _skip_typewriter()');
  });

  it('shows npc text via show_npc_text', () => {
    expect(content).toContain('func show_npc_text(text: String)');
  });
});

// ─────────────────────────────────────────────
// Response buttons
// ─────────────────────────────────────────────

describe('Godot export - dialogue panel response buttons', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path === 'scripts/ui/dialogue_panel.gd')!.content;
  });

  it('limits to MAX_RESPONSE_BUTTONS (4)', () => {
    expect(content).toContain('MAX_RESPONSE_BUTTONS := 4');
  });

  it('has show_responses method', () => {
    expect(content).toContain('func show_responses(responses: Array)');
  });

  it('creates response buttons dynamically', () => {
    expect(content).toContain('_display_responses');
    expect(content).toContain('Button.new()');
  });

  it('shows energy cost on buttons', () => {
    expect(content).toContain('energyCost');
    expect(content).toContain('energy)');
  });

  it('has a Goodbye close button', () => {
    expect(content).toContain('"Goodbye"');
    expect(content).toContain('goodbye.pressed.connect(close_dialogue)');
  });

  it('connects response buttons to _on_response_pressed', () => {
    expect(content).toContain('func _on_response_pressed(action_id: String)');
    expect(content).toContain('_on_response_pressed.bind(action_id)');
  });

  it('calls DialogueSystem.select_action on response press', () => {
    expect(content).toContain('ds.select_action(action_id)');
  });

  it('clears responses with _clear_responses', () => {
    expect(content).toContain('func _clear_responses()');
  });

  it('shows responses only after typewriter finishes', () => {
    expect(content).toContain('_pending_responses');
    expect(content).toContain('if not _is_typing');
  });
});

// ─────────────────────────────────────────────
// Language learning mode
// ─────────────────────────────────────────────

describe('Godot export - dialogue panel language learning mode', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path === 'scripts/ui/dialogue_panel.gd')!.content;
  });

  it('has language mode flag', () => {
    expect(content).toContain('_language_mode');
  });

  it('has target language label (prominent)', () => {
    expect(content).toContain('_lang_target_label: RichTextLabel');
  });

  it('has translation label (smaller)', () => {
    expect(content).toContain('_lang_translation_label: Label');
  });

  it('has Listen button', () => {
    expect(content).toContain('_lang_listen_button: Button');
    expect(content).toContain('"Listen"');
  });

  it('has show_language_content method', () => {
    expect(content).toContain('func show_language_content(target_text: String, translation: String)');
  });

  it('has hide_language_content method', () => {
    expect(content).toContain('func hide_language_content()');
  });

  it('emits audio signal on Listen press', () => {
    expect(content).toContain('func _on_listen_pressed()');
    expect(content).toContain('audio_requested');
  });

  it('language container is hidden by default', () => {
    expect(content).toContain('_lang_container.visible = false');
  });

  it('target text uses larger font size than translation', () => {
    expect(content).toContain('"normal_font_size", 20');
    expect(content).toContain('"font_size", 13');
  });
});

// ─────────────────────────────────────────────
// Close controls
// ─────────────────────────────────────────────

describe('Godot export - dialogue panel close controls', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path === 'scripts/ui/dialogue_panel.gd')!.content;
  });

  it('handles Escape key to close', () => {
    expect(content).toContain('KEY_ESCAPE');
    expect(content).toContain('close_dialogue()');
  });

  it('has a close button', () => {
    expect(content).toContain('_close_button: Button');
    expect(content).toContain('_close_button.pressed.connect(close_dialogue)');
  });

  it('emits dialogue_closed on close', () => {
    expect(content).toContain('dialogue_closed.emit()');
  });

  it('shows cursor when dialogue opens', () => {
    expect(content).toContain('Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)');
  });

  it('captures cursor when dialogue closes', () => {
    expect(content).toContain('Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)');
  });

  it('handles input only when open', () => {
    expect(content).toContain('if not _is_open');
  });
});

// ─────────────────────────────────────────────
// Bottom-of-screen layout
// ─────────────────────────────────────────────

describe('Godot export - dialogue panel layout', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path === 'scripts/ui/dialogue_panel.gd')!.content;
  });

  it('anchors panel to bottom of screen', () => {
    expect(content).toContain('PRESET_BOTTOM_WIDE');
  });

  it('panel covers lower portion of screen', () => {
    expect(content).toContain('anchor_top = 0.65');
    expect(content).toContain('anchor_bottom = 1.0');
  });

  it('has margins from screen edges', () => {
    expect(content).toContain('anchor_left = 0.05');
    expect(content).toContain('anchor_right = 0.95');
  });

  it('has styled panel background', () => {
    expect(content).toContain('StyleBoxFlat.new()');
    expect(content).toContain('set_corner_radius_all(10)');
    expect(content).toContain('border_color');
  });

  it('uses HBoxContainer for three-column layout', () => {
    expect(content).toContain('HBoxContainer.new()');
  });

  it('has portrait column with fixed width', () => {
    expect(content).toContain('Vector2(120, 0)');
  });

  it('has dialogue text that expands to fill space', () => {
    expect(content).toContain('SIZE_EXPAND_FILL');
  });

  it('has response container with minimum width', () => {
    expect(content).toContain('Vector2(200, 0)');
  });
});

// ─────────────────────────────────────────────
// Dialogue system integration
// ─────────────────────────────────────────────

describe('Godot export - dialogue_system.gd integration', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path === 'scripts/systems/dialogue_system.gd')!.content;
  });

  it('references dialogue_panel instead of chat_panel', () => {
    expect(content).toContain('dialogue_panel.gd');
    expect(content).not.toContain('chat_panel.gd');
  });

  it('has _dialogue_panel variable', () => {
    expect(content).toContain('_dialogue_panel');
  });

  it('calls open_dialogue on the panel', () => {
    expect(content).toContain('open_dialogue');
  });

  it('calls close_dialogue on the panel', () => {
    expect(content).toContain('close_dialogue');
  });

  it('connects to dialogue_closed signal', () => {
    expect(content).toContain('dialogue_closed');
  });

  it('passes available actions to panel as responses', () => {
    expect(content).toContain('show_responses');
    expect(content).toContain('get_available_actions');
  });

  it('has audio_requested signal for language learning', () => {
    expect(content).toContain('signal audio_requested');
  });

  it('finds panel by looking for open_dialogue method', () => {
    expect(content).toContain('has_method("open_dialogue")');
  });
});
