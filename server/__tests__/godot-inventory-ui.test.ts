/**
 * Tests for Godot inventory UI screen export
 *
 * Verifies that the Godot export pipeline correctly generates:
 * - inventory_ui.gd template file in the UI directory
 * - Grid with ScrollContainer + GridContainer for item slots
 * - Category filtering (All, Weapons/Armor, Consumables, Quest, Materials)
 * - Selection highlight with Color.YELLOW border
 * - Detail panel with Use/Drop/Equip buttons
 * - Tab toggle with get_tree().paused while open
 * - Stats sidebar: Health, Energy, Gold, Carry Weight, Slots
 * - Equipment slots display (weapon, armor, accessory)
 * - Connection to InventorySystem via signals
 * - Rarity color mapping
 * - Language learning display name support
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

describe('Godot export - Inventory UI file generation', () => {
  it('generates inventory_ui.gd in the UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const uiFile = files.find(f => f.path.endsWith('inventory_ui.gd'));
    expect(uiFile).toBeDefined();
    expect(uiFile!.path).toContain('scripts/ui/');
  });

  it('is a non-empty file', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const uiFile = files.find(f => f.path.endsWith('inventory_ui.gd'));
    expect(uiFile!.content.length).toBeGreaterThan(100);
  });
});

// ─────────────────────────────────────────────
// Script structure
// ─────────────────────────────────────────────

describe('Godot export - Inventory UI script structure', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('inventory_ui.gd'))!.content;
  });

  it('extends PanelContainer', () => {
    expect(content).toContain('extends PanelContainer');
  });

  it('has inventory_closed signal', () => {
    expect(content).toContain('signal inventory_closed');
  });

  it('references InventorySystem singleton', () => {
    expect(content).toContain('/root/InventorySystem');
  });
});

// ─────────────────────────────────────────────
// Grid with ScrollContainer + GridContainer
// ─────────────────────────────────────────────

describe('Godot export - Inventory UI grid', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('inventory_ui.gd'))!.content;
  });

  it('has ScrollContainer for scrollable grid', () => {
    expect(content).toContain('ScrollContainer');
  });

  it('has GridContainer for item slot layout', () => {
    expect(content).toContain('GridContainer');
  });

  it('creates slot buttons for items', () => {
    expect(content).toContain('_slot_buttons');
  });

  it('displays item quantity on slots', () => {
    expect(content).toContain('item.get("quantity"');
  });
});

// ─────────────────────────────────────────────
// Toggle with Tab key and game pause
// ─────────────────────────────────────────────

describe('Godot export - Inventory UI toggle and pause', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('inventory_ui.gd'))!.content;
  });

  it('toggles on Tab key press', () => {
    expect(content).toContain('KEY_TAB');
  });

  it('has toggle_inventory method', () => {
    expect(content).toContain('func toggle_inventory()');
  });

  it('has open_inventory and close_inventory methods', () => {
    expect(content).toContain('func open_inventory()');
    expect(content).toContain('func close_inventory()');
  });

  it('pauses game when open', () => {
    expect(content).toContain('get_tree().paused = true');
  });

  it('resumes game when closed', () => {
    expect(content).toContain('get_tree().paused = false');
  });

  it('shows mouse cursor when open', () => {
    expect(content).toContain('Input.MOUSE_MODE_VISIBLE');
  });

  it('captures mouse when closed', () => {
    expect(content).toContain('Input.MOUSE_MODE_CAPTURED');
  });
});

// ─────────────────────────────────────────────
// Category filtering
// ─────────────────────────────────────────────

describe('Godot export - Inventory UI category filtering', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('inventory_ui.gd'))!.content;
  });

  it('defines FilterCategory enum', () => {
    expect(content).toContain('enum FilterCategory');
  });

  it('has category tab buttons', () => {
    expect(content).toContain('_tab_all');
    expect(content).toContain('_tab_weapons');
    expect(content).toContain('_tab_consumables');
    expect(content).toContain('_tab_quest');
    expect(content).toContain('_tab_materials');
  });

  it('implements set_category_filter', () => {
    expect(content).toContain('func set_category_filter(category: FilterCategory)');
  });

  it('filters weapons and armor', () => {
    expect(content).toContain('"weapon", "armor"');
  });

  it('groups consumables, food, and drink', () => {
    expect(content).toContain('"consumable", "food", "drink"');
  });

  it('groups quest and key items', () => {
    expect(content).toContain('"quest", "key"');
  });

  it('includes materials and tools', () => {
    expect(content).toContain('"material", "tool"');
  });
});

// ─────────────────────────────────────────────
// Selection and detail panel
// ─────────────────────────────────────────────

describe('Godot export - Inventory UI selection and detail panel', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('inventory_ui.gd'))!.content;
  });

  it('has select_item method', () => {
    expect(content).toContain('func select_item(filtered_index: int)');
  });

  it('has clear_selection method', () => {
    expect(content).toContain('func clear_selection()');
  });

  it('has has_selection check', () => {
    expect(content).toContain('func has_selection()');
  });

  it('displays item name in detail panel', () => {
    expect(content).toContain('_detail_name');
  });

  it('displays item description', () => {
    expect(content).toContain('_detail_description');
  });

  it('displays item weight', () => {
    expect(content).toContain('_detail_weight');
  });

  it('displays item effects', () => {
    expect(content).toContain('_detail_effects');
  });

  it('highlights selected slot with yellow border', () => {
    expect(content).toContain('Color.YELLOW');
  });
});

// ─────────────────────────────────────────────
// Action buttons (Use, Drop, Equip)
// ─────────────────────────────────────────────

describe('Godot export - Inventory UI action buttons', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('inventory_ui.gd'))!.content;
  });

  it('has Use, Drop, Equip buttons', () => {
    expect(content).toContain('_use_button');
    expect(content).toContain('_drop_button');
    expect(content).toContain('_equip_button');
  });

  it('declares action methods', () => {
    expect(content).toContain('func use_selected_item()');
    expect(content).toContain('func drop_selected_item()');
    expect(content).toContain('func equip_selected_item()');
  });

  it('declares can-action checks', () => {
    expect(content).toContain('func can_use_selected()');
    expect(content).toContain('func can_drop_selected()');
    expect(content).toContain('func can_equip_selected()');
  });

  it('calls InventorySystem.use_item', () => {
    expect(content).toContain('_inventory_system.use_item(');
  });

  it('calls InventorySystem.drop_item', () => {
    expect(content).toContain('_inventory_system.drop_item(');
  });

  it('calls InventorySystem.equip_item', () => {
    expect(content).toContain('_inventory_system.equip_item(');
  });

  it('supports unequip toggle', () => {
    expect(content).toContain('_inventory_system.unequip_slot(');
  });

  it('shows Equip/Unequip text based on state', () => {
    expect(content).toContain('"Unequip"');
    expect(content).toContain('"Equip"');
  });
});

// ─────────────────────────────────────────────
// Stats sidebar
// ─────────────────────────────────────────────

describe('Godot export - Inventory UI stats sidebar', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('inventory_ui.gd'))!.content;
  });

  it('has health, energy, gold, weight labels', () => {
    expect(content).toContain('_health_label');
    expect(content).toContain('_energy_label');
    expect(content).toContain('_gold_label');
    expect(content).toContain('_carry_weight_label');
  });

  it('has slots counter', () => {
    expect(content).toContain('_slots_label');
  });

  it('declares get_total_carry_weight', () => {
    expect(content).toContain('func get_total_carry_weight()');
  });

  it('declares get_gold', () => {
    expect(content).toContain('func get_gold()');
  });

  it('declares get_used_slots and get_max_slots', () => {
    expect(content).toContain('func get_used_slots()');
    expect(content).toContain('func get_max_slots()');
  });

  it('calculates weight from item weight * quantity', () => {
    expect(content).toContain('item.get("weight", 0)');
    expect(content).toContain('item.get("quantity", 1)');
  });
});

// ─────────────────────────────────────────────
// Equipment slots display
// ─────────────────────────────────────────────

describe('Godot export - Inventory UI equipment slots', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('inventory_ui.gd'))!.content;
  });

  it('has equipment slot labels', () => {
    expect(content).toContain('_weapon_slot_label');
    expect(content).toContain('_armor_slot_label');
    expect(content).toContain('_accessory_slot_label');
  });

  it('reads equipped items from InventorySystem', () => {
    expect(content).toContain('get_equipped_item("weapon")');
    expect(content).toContain('get_equipped_item("armor")');
    expect(content).toContain('get_equipped_item("accessory")');
  });
});

// ─────────────────────────────────────────────
// Event binding to InventorySystem
// ─────────────────────────────────────────────

describe('Godot export - Inventory UI event binding', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('inventory_ui.gd'))!.content;
  });

  it('subscribes to item_added signal', () => {
    expect(content).toContain('_inventory_system.item_added.connect(');
  });

  it('subscribes to item_removed signal', () => {
    expect(content).toContain('_inventory_system.item_removed.connect(');
  });

  it('subscribes to gold_changed signal', () => {
    expect(content).toContain('_inventory_system.gold_changed.connect(');
  });

  it('clears selection when removed item was selected', () => {
    expect(content).toContain('selected.get("id", "") == item_id');
    expect(content).toContain('clear_selection()');
  });
});

// ─────────────────────────────────────────────
// Rarity colors
// ─────────────────────────────────────────────

describe('Godot export - Inventory UI rarity colors', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('inventory_ui.gd'))!.content;
  });

  it('has rarity color mapping function', () => {
    expect(content).toContain('func get_rarity_color(');
  });

  it('supports all rarity tiers', () => {
    expect(content).toContain('"uncommon"');
    expect(content).toContain('"rare"');
    expect(content).toContain('"epic"');
    expect(content).toContain('"legendary"');
  });
});

// ─────────────────────────────────────────────
// Language learning support
// ─────────────────────────────────────────────

describe('Godot export - Inventory UI language learning', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    content = files.find(f => f.path.endsWith('inventory_ui.gd'))!.content;
  });

  it('uses get_display_name for language-aware names', () => {
    expect(content).toContain('get_display_name(item)');
  });

  it('delegates to InventorySystem get_display_name', () => {
    expect(content).toContain('_inventory_system.get_display_name(item)');
  });
});
