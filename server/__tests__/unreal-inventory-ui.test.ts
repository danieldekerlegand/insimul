/**
 * Tests for Unreal inventory UI widget export
 *
 * Verifies that the Unreal export pipeline correctly generates:
 * - InsimulInventoryUI.h and .cpp template files in the UI directory
 * - Proper UUserWidget class with inventory system integration
 * - Category filtering, item selection, and action button support
 * - Stats sidebar bindings (gold, weight, slots)
 * - Delegate binding to InventorySystem
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
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

describe('Unreal export - Inventory UI widget generation', () => {
  it('generates InsimulInventoryUI.h in the UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulInventoryUI.h'));
    expect(header).toBeDefined();
    expect(header!.path).toContain('/UI/');
  });

  it('generates InsimulInventoryUI.cpp in the UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const source = files.find(f => f.path.endsWith('InsimulInventoryUI.cpp'));
    expect(source).toBeDefined();
    expect(source!.path).toContain('/UI/');
  });
});

// ─────────────────────────────────────────────
// Header content - UUserWidget class
// ─────────────────────────────────────────────

describe('Unreal export - Inventory UI header structure', () => {
  let header: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    header = files.find(f => f.path.endsWith('InsimulInventoryUI.h'))!.content;
  });

  it('extends UUserWidget', () => {
    expect(header).toContain('public UUserWidget');
  });

  it('includes the generated header', () => {
    expect(header).toContain('InsimulInventoryUI.generated.h');
  });

  it('includes InventorySystem header', () => {
    expect(header).toContain('#include "Systems/InventorySystem.h"');
  });

  it('declares UCLASS macro', () => {
    expect(header).toContain('UCLASS()');
  });

  it('declares category filter enum', () => {
    expect(header).toContain('EInventoryCategory');
    expect(header).toContain('All');
    expect(header).toContain('Weapons');
    expect(header).toContain('Armor');
    expect(header).toContain('Consumables');
    expect(header).toContain('QuestItems');
    expect(header).toContain('Materials');
  });
});

// ─────────────────────────────────────────────
// Toggle, open, close functionality
// ─────────────────────────────────────────────

describe('Unreal export - Inventory UI toggle and visibility', () => {
  let header: string;
  let source: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    header = files.find(f => f.path.endsWith('InsimulInventoryUI.h'))!.content;
    source = files.find(f => f.path.endsWith('InsimulInventoryUI.cpp'))!.content;
  });

  it('declares ToggleInventory function', () => {
    expect(header).toContain('void ToggleInventory()');
  });

  it('declares OpenInventory and CloseInventory', () => {
    expect(header).toContain('void OpenInventory()');
    expect(header).toContain('void CloseInventory()');
  });

  it('sets FInputModeGameAndUI when opening', () => {
    expect(source).toContain('FInputModeGameAndUI');
  });

  it('sets FInputModeGameOnly when closing', () => {
    expect(source).toContain('FInputModeGameOnly');
  });

  it('pauses game when inventory is open', () => {
    expect(source).toContain('SetPause(true)');
    expect(source).toContain('SetPause(false)');
  });

  it('shows mouse cursor when inventory is open', () => {
    expect(source).toContain('SetShowMouseCursor(true)');
    expect(source).toContain('SetShowMouseCursor(false)');
  });
});

// ─────────────────────────────────────────────
// Category filtering
// ─────────────────────────────────────────────

describe('Unreal export - Inventory UI category filtering', () => {
  let source: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    source = files.find(f => f.path.endsWith('InsimulInventoryUI.cpp'))!.content;
  });

  it('implements SetCategoryFilter', () => {
    expect(source).toContain('::SetCategoryFilter(EInventoryCategory Category)');
  });

  it('filters weapons category', () => {
    expect(source).toContain('EInsimulItemType::Weapon');
  });

  it('filters armor category', () => {
    expect(source).toContain('EInsimulItemType::Armor');
  });

  it('groups consumables, food, and drink together', () => {
    expect(source).toContain('EInsimulItemType::Consumable');
    expect(source).toContain('EInsimulItemType::Food');
    expect(source).toContain('EInsimulItemType::Drink');
  });

  it('groups quest and key items together', () => {
    expect(source).toContain('EInsimulItemType::Quest');
    expect(source).toContain('EInsimulItemType::Key');
  });
});

// ─────────────────────────────────────────────
// Item selection and detail panel
// ─────────────────────────────────────────────

describe('Unreal export - Inventory UI item selection', () => {
  let header: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    header = files.find(f => f.path.endsWith('InsimulInventoryUI.h'))!.content;
  });

  it('declares SelectItem with index parameter', () => {
    expect(header).toContain('void SelectItem(int32 FilteredIndex)');
  });

  it('declares ClearSelection', () => {
    expect(header).toContain('void ClearSelection()');
  });

  it('declares GetSelectedItem returning item struct', () => {
    expect(header).toContain('FInsimulInventoryItem GetSelectedItem()');
  });

  it('declares HasSelection check', () => {
    expect(header).toContain('bool HasSelection()');
  });
});

// ─────────────────────────────────────────────
// Action buttons (Use, Drop, Equip)
// ─────────────────────────────────────────────

describe('Unreal export - Inventory UI action buttons', () => {
  let header: string;
  let source: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    header = files.find(f => f.path.endsWith('InsimulInventoryUI.h'))!.content;
    source = files.find(f => f.path.endsWith('InsimulInventoryUI.cpp'))!.content;
  });

  it('declares Use, Drop, Equip action functions', () => {
    expect(header).toContain('void UseSelectedItem()');
    expect(header).toContain('void DropSelectedItem()');
    expect(header).toContain('void EquipSelectedItem()');
  });

  it('declares CanUse, CanDrop, CanEquip checks', () => {
    expect(header).toContain('bool CanUseSelected()');
    expect(header).toContain('bool CanDropSelected()');
    expect(header).toContain('bool CanEquipSelected()');
  });

  it('calls InventorySystem UseItem', () => {
    expect(source).toContain('Inv->UseItem(SelectedItemId)');
  });

  it('calls InventorySystem DropItem', () => {
    expect(source).toContain('Inv->DropItem(SelectedItemId)');
  });

  it('calls InventorySystem EquipItem', () => {
    expect(source).toContain('Inv->EquipItem(SelectedItemId)');
  });

  it('supports unequip toggle via EquipSelectedItem', () => {
    expect(source).toContain('Inv->UnequipSlot(Item.EquipSlot)');
  });
});

// ─────────────────────────────────────────────
// Stats sidebar
// ─────────────────────────────────────────────

describe('Unreal export - Inventory UI stats sidebar', () => {
  let header: string;
  let source: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    header = files.find(f => f.path.endsWith('InsimulInventoryUI.h'))!.content;
    source = files.find(f => f.path.endsWith('InsimulInventoryUI.cpp'))!.content;
  });

  it('declares GetTotalCarryWeight', () => {
    expect(header).toContain('float GetTotalCarryWeight()');
  });

  it('declares GetGold', () => {
    expect(header).toContain('int32 GetGold()');
  });

  it('declares GetUsedSlots and GetMaxSlots', () => {
    expect(header).toContain('int32 GetUsedSlots()');
    expect(header).toContain('int32 GetMaxSlots()');
  });

  it('calculates weight from item weight * quantity', () => {
    expect(source).toContain('Item.Weight * Item.Quantity');
  });
});

// ─────────────────────────────────────────────
// Delegate binding to InventorySystem
// ─────────────────────────────────────────────

describe('Unreal export - Inventory UI delegate binding', () => {
  let source: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    source = files.find(f => f.path.endsWith('InsimulInventoryUI.cpp'))!.content;
  });

  it('binds to OnItemAdded delegate', () => {
    expect(source).toContain('OnItemAdded.AddDynamic');
  });

  it('binds to OnItemRemoved delegate', () => {
    expect(source).toContain('OnItemRemoved.AddDynamic');
  });

  it('binds to OnGoldChanged delegate', () => {
    expect(source).toContain('OnGoldChanged.AddDynamic');
  });

  it('unbinds delegates on destruct', () => {
    expect(source).toContain('OnItemAdded.RemoveDynamic');
    expect(source).toContain('OnItemRemoved.RemoveDynamic');
    expect(source).toContain('OnGoldChanged.RemoveDynamic');
  });

  it('clears selection when removed item was selected', () => {
    expect(source).toContain('SelectedItemId == ItemId');
    expect(source).toContain('ClearSelection()');
  });
});

// ─────────────────────────────────────────────
// Blueprint events
// ─────────────────────────────────────────────

describe('Unreal export - Inventory UI blueprint events', () => {
  let header: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    header = files.find(f => f.path.endsWith('InsimulInventoryUI.h'))!.content;
  });

  it('declares OnGridRefreshed BlueprintImplementableEvent', () => {
    expect(header).toContain('BlueprintImplementableEvent');
    expect(header).toContain('OnGridRefreshed');
  });

  it('declares OnSelectionChanged event', () => {
    expect(header).toContain('OnSelectionChanged');
  });

  it('declares OnStatsChanged event', () => {
    expect(header).toContain('OnStatsChanged');
  });
});
