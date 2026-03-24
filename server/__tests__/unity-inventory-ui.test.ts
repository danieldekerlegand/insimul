/**
 * Tests for Unity inventory UI screen export
 *
 * Verifies that the Unity export pipeline correctly generates:
 * - InventoryUI.cs template file in the UI directory
 * - Grid with ScrollRect + GridLayoutGroup and slot buttons
 * - Category filtering (All, Weapons/Armor, Consumables, Quest, Materials)
 * - Selection highlights and detail panel with Use/Drop/Equip buttons
 * - Tab toggle with Time.timeScale=0 while open
 * - Stats sidebar: Health, Energy, Gold, Carry Weight
 * - Equipment slots display
 * - Connection to InventorySystem via events
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

describe('Unity export - Inventory UI file generation', () => {
  it('generates InventoryUI.cs in the UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    const uiFile = files.find(f => f.path.endsWith('InventoryUI.cs'));
    expect(uiFile).toBeDefined();
    expect(uiFile!.path).toContain('Assets/Scripts/UI/');
  });

  it('is a non-empty file', () => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    const uiFile = files.find(f => f.path.endsWith('InventoryUI.cs'));
    expect(uiFile!.content.length).toBeGreaterThan(100);
  });
});

// ─────────────────────────────────────────────
// Class structure
// ─────────────────────────────────────────────

describe('Unity export - Inventory UI class structure', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('InventoryUI.cs'))!.content;
  });

  it('is in the Insimul.UI namespace', () => {
    expect(content).toContain('namespace Insimul.UI');
  });

  it('extends MonoBehaviour', () => {
    expect(content).toContain('class InventoryUI : MonoBehaviour');
  });

  it('imports InventorySystem namespace', () => {
    expect(content).toContain('using Insimul.Systems');
  });

  it('imports UnityEngine.UI for ScrollRect and GridLayout', () => {
    expect(content).toContain('using UnityEngine.UI');
  });

  it('imports TMPro for text elements', () => {
    expect(content).toContain('using TMPro');
  });
});

// ─────────────────────────────────────────────
// Grid with ScrollRect + GridLayoutGroup
// ─────────────────────────────────────────────

describe('Unity export - Inventory UI grid', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('InventoryUI.cs'))!.content;
  });

  it('has ScrollRect reference', () => {
    expect(content).toContain('ScrollRect scrollRect');
  });

  it('has GridLayoutGroup reference', () => {
    expect(content).toContain('GridLayoutGroup gridLayout');
  });

  it('has grid content transform for slot children', () => {
    expect(content).toContain('Transform gridContent');
  });

  it('has slot prefab reference', () => {
    expect(content).toContain('GameObject slotPrefab');
  });

  it('instantiates slots from prefab', () => {
    expect(content).toContain('Instantiate(slotPrefab, gridContent)');
  });

  it('displays item quantity on slots', () => {
    expect(content).toContain('item.quantity');
  });
});

// ─────────────────────────────────────────────
// Toggle with Tab key and time pause
// ─────────────────────────────────────────────

describe('Unity export - Inventory UI toggle and pause', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('InventoryUI.cs'))!.content;
  });

  it('toggles on Tab key press', () => {
    expect(content).toContain('KeyCode.Tab');
  });

  it('has ToggleInventory method', () => {
    expect(content).toContain('void ToggleInventory()');
  });

  it('has OpenInventory and CloseInventory methods', () => {
    expect(content).toContain('void OpenInventory()');
    expect(content).toContain('void CloseInventory()');
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
// Category filtering
// ─────────────────────────────────────────────

describe('Unity export - Inventory UI category filtering', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('InventoryUI.cs'))!.content;
  });

  it('has category tab buttons', () => {
    expect(content).toContain('Button tabAll');
    expect(content).toContain('Button tabWeapons');
    expect(content).toContain('Button tabArmor');
    expect(content).toContain('Button tabConsumables');
    expect(content).toContain('Button tabQuestItems');
    expect(content).toContain('Button tabMaterials');
  });

  it('implements SetCategoryFilter', () => {
    expect(content).toContain('void SetCategoryFilter(FilterCategory category)');
  });

  it('filters weapons and armor', () => {
    expect(content).toContain('InsimulItemType.Weapon');
    expect(content).toContain('InsimulItemType.Armor');
  });

  it('groups consumables, food, and drink', () => {
    expect(content).toContain('InsimulItemType.Consumable');
    expect(content).toContain('InsimulItemType.Food');
    expect(content).toContain('InsimulItemType.Drink');
  });

  it('groups quest and key items', () => {
    expect(content).toContain('InsimulItemType.Quest');
    expect(content).toContain('InsimulItemType.Key');
  });

  it('includes materials and tools', () => {
    expect(content).toContain('InsimulItemType.Material');
    expect(content).toContain('InsimulItemType.Tool');
  });
});

// ─────────────────────────────────────────────
// Selection and detail panel
// ─────────────────────────────────────────────

describe('Unity export - Inventory UI selection and detail panel', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('InventoryUI.cs'))!.content;
  });

  it('has SelectItem method', () => {
    expect(content).toContain('void SelectItem(int filteredIndex)');
  });

  it('has ClearSelection method', () => {
    expect(content).toContain('void ClearSelection()');
  });

  it('has HasSelection check', () => {
    expect(content).toContain('bool HasSelection()');
  });

  it('displays item name in detail panel', () => {
    expect(content).toContain('detailName');
  });

  it('displays item description', () => {
    expect(content).toContain('detailDescription');
  });

  it('displays item weight', () => {
    expect(content).toContain('detailWeight');
  });

  it('displays item effects', () => {
    expect(content).toContain('detailEffects');
  });

  it('highlights selected slot with outline', () => {
    expect(content).toContain('Outline');
    expect(content).toContain('Color.yellow');
  });
});

// ─────────────────────────────────────────────
// Action buttons (Use, Drop, Equip)
// ─────────────────────────────────────────────

describe('Unity export - Inventory UI action buttons', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('InventoryUI.cs'))!.content;
  });

  it('has Use, Drop, Equip buttons', () => {
    expect(content).toContain('Button useButton');
    expect(content).toContain('Button dropButton');
    expect(content).toContain('Button equipButton');
  });

  it('declares action methods', () => {
    expect(content).toContain('void UseSelectedItem()');
    expect(content).toContain('void DropSelectedItem()');
    expect(content).toContain('void EquipSelectedItem()');
  });

  it('declares can-action checks', () => {
    expect(content).toContain('bool CanUseSelected()');
    expect(content).toContain('bool CanDropSelected()');
    expect(content).toContain('bool CanEquipSelected()');
  });

  it('calls InventorySystem.UseItem', () => {
    expect(content).toContain('_inventory.UseItem(item.id)');
  });

  it('calls InventorySystem.DropItem', () => {
    expect(content).toContain('_inventory.DropItem(item.id)');
  });

  it('calls InventorySystem.EquipItem', () => {
    expect(content).toContain('_inventory.EquipItem(item.id)');
  });

  it('supports unequip toggle', () => {
    expect(content).toContain('_inventory.UnequipSlot(item.equipSlot)');
  });

  it('shows Equip/Unequip text based on state', () => {
    expect(content).toContain('"Unequip"');
    expect(content).toContain('"Equip"');
  });
});

// ─────────────────────────────────────────────
// Stats sidebar
// ─────────────────────────────────────────────

describe('Unity export - Inventory UI stats sidebar', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('InventoryUI.cs'))!.content;
  });

  it('has health, energy, gold, weight text fields', () => {
    expect(content).toContain('TextMeshProUGUI healthText');
    expect(content).toContain('TextMeshProUGUI energyText');
    expect(content).toContain('TextMeshProUGUI goldText');
    expect(content).toContain('TextMeshProUGUI carryWeightText');
  });

  it('has slots counter', () => {
    expect(content).toContain('TextMeshProUGUI slotsText');
  });

  it('declares GetTotalCarryWeight', () => {
    expect(content).toContain('float GetTotalCarryWeight()');
  });

  it('declares GetGold', () => {
    expect(content).toContain('int GetGold()');
  });

  it('declares GetUsedSlots and GetMaxSlots', () => {
    expect(content).toContain('int GetUsedSlots()');
    expect(content).toContain('int GetMaxSlots()');
  });

  it('calculates weight from item.weight * item.quantity', () => {
    expect(content).toContain('item.weight * item.quantity');
  });
});

// ─────────────────────────────────────────────
// Equipment slots display
// ─────────────────────────────────────────────

describe('Unity export - Inventory UI equipment slots', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('InventoryUI.cs'))!.content;
  });

  it('has equipment slot text fields', () => {
    expect(content).toContain('TextMeshProUGUI weaponSlotText');
    expect(content).toContain('TextMeshProUGUI armorSlotText');
    expect(content).toContain('TextMeshProUGUI accessorySlotText');
  });

  it('reads equipped items from InventorySystem', () => {
    expect(content).toContain('GetEquippedItem(EquipmentSlot.Weapon)');
    expect(content).toContain('GetEquippedItem(EquipmentSlot.Armor)');
    expect(content).toContain('GetEquippedItem(EquipmentSlot.Accessory)');
  });
});

// ─────────────────────────────────────────────
// Event binding to InventorySystem
// ─────────────────────────────────────────────

describe('Unity export - Inventory UI event binding', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('InventoryUI.cs'))!.content;
  });

  it('subscribes to OnItemAdded', () => {
    expect(content).toContain('_inventory.OnItemAdded += OnItemAdded');
  });

  it('subscribes to OnItemRemoved', () => {
    expect(content).toContain('_inventory.OnItemRemoved += OnItemRemoved');
  });

  it('subscribes to OnGoldChanged', () => {
    expect(content).toContain('_inventory.OnGoldChanged += OnGoldChanged');
  });

  it('unsubscribes on destroy', () => {
    expect(content).toContain('_inventory.OnItemAdded -= OnItemAdded');
    expect(content).toContain('_inventory.OnItemRemoved -= OnItemRemoved');
    expect(content).toContain('_inventory.OnGoldChanged -= OnGoldChanged');
  });

  it('clears selection when removed item was selected', () => {
    expect(content).toContain('selected.id == itemId');
    expect(content).toContain('ClearSelection()');
  });
});

// ─────────────────────────────────────────────
// Rarity colors
// ─────────────────────────────────────────────

describe('Unity export - Inventory UI rarity colors', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('InventoryUI.cs'))!.content;
  });

  it('has rarity color mapping', () => {
    expect(content).toContain('GetRarityColor');
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

describe('Unity export - Inventory UI language learning', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('InventoryUI.cs'))!.content;
  });

  it('uses GetDisplayName for language-aware names', () => {
    expect(content).toContain('GetDisplayName(item)');
  });
});
