/**
 * Babylon Inventory
 *
 * Manages player inventory for quest items and collected objects,
 * with equipment slots for weapon, armor, and accessory.
 */

import { Scene } from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

// Re-export engine-agnostic type from shared game-engine
export type { InventoryItem } from '@shared/game-engine/types';
import type { InventoryItem, EquipmentSlot } from '@shared/game-engine/types';

const EQUIPPABLE_TYPES = new Set(['weapon', 'armor', 'tool']);
const USABLE_TYPES = new Set(['consumable', 'food', 'drink', 'quest', 'key']);
const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: 'Weapon',
  armor: 'Armor',
  accessory: 'Accessory',
};

export class BabylonInventory {
  private scene: Scene;
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private container: GUI.Rectangle | null = null;
  private itemsContainer: GUI.StackPanel | null = null;
  private isVisible: boolean = false;

  private items: Map<string, InventoryItem> = new Map();
  private playerGold: number = 100;
  private goldDisplay: GUI.TextBlock | null = null;

  // Equipment slot display elements
  private equipmentSlots: Map<EquipmentSlot, GUI.Rectangle> = new Map();
  private equipmentLabels: Map<EquipmentSlot, GUI.TextBlock> = new Map();

  // Callbacks
  private onItemAdded: ((item: InventoryItem) => void) | null = null;
  private onItemRemoved: ((itemId: string) => void) | null = null;
  private onItemDropped: ((item: InventoryItem) => void) | null = null;
  private onItemUsed: ((item: InventoryItem) => void) | null = null;
  private onItemEquipped: ((item: InventoryItem) => void) | null = null;
  private onItemUnequipped: ((item: InventoryItem) => void) | null = null;

  constructor(scene: Scene, advancedTexture: GUI.AdvancedDynamicTexture) {
    this.scene = scene;
    this.advancedTexture = advancedTexture;

    this.createInventoryUI();
  }

  private createInventoryUI(): void {
    // Main container — taller to accommodate equipment section
    this.container = new GUI.Rectangle('inventoryContainer');
    this.container.width = '350px';
    this.container.height = '580px';
    this.container.cornerRadius = 10;
    this.container.color = 'white';
    this.container.thickness = 2;
    this.container.background = 'rgba(0, 0, 0, 0.85)';
    this.advancedTexture.addControl(this.container);

    this.container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;

    // Title bar
    const titleBar = new GUI.Rectangle('inventoryTitleBar');
    titleBar.width = '350px';
    titleBar.height = '50px';
    titleBar.cornerRadius = 10;
    titleBar.background = 'rgba(40, 40, 40, 1)';
    titleBar.thickness = 0;
    titleBar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this.container.addControl(titleBar);

    // Title text
    const titleText = new GUI.TextBlock('inventoryTitle');
    titleText.text = 'Inventory';
    titleText.fontSize = 20;
    titleText.fontWeight = 'bold';
    titleText.color = 'white';
    titleText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    titleText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    titleText.top = '15px';
    titleText.left = '15px';
    titleText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.container.addControl(titleText);

    // Gold display
    this.goldDisplay = new GUI.TextBlock('inventoryGold');
    this.goldDisplay.text = `Gold: ${this.playerGold}`;
    this.goldDisplay.fontSize = 16;
    this.goldDisplay.fontWeight = 'bold';
    this.goldDisplay.color = '#FFD700';
    this.goldDisplay.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this.goldDisplay.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.goldDisplay.top = '17px';
    this.goldDisplay.left = '-50px';
    this.goldDisplay.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.container.addControl(this.goldDisplay);

    // Close button
    const closeButton = GUI.Button.CreateSimpleButton('inventoryClose', 'X');
    closeButton.width = '40px';
    closeButton.height = '40px';
    closeButton.color = 'white';
    closeButton.background = 'rgba(200, 50, 50, 0.8)';
    closeButton.cornerRadius = 5;
    closeButton.fontSize = 18;
    closeButton.fontWeight = 'bold';
    closeButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    closeButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    closeButton.top = '5px';
    closeButton.left = '-5px';
    closeButton.onPointerUpObservable.add(() => {
      this.hide();
    });
    this.container.addControl(closeButton);

    // ── Equipment Section ──
    this.createEquipmentSection();

    // Items scroll view — shifted down to make room for equipment
    const scrollViewer = new GUI.ScrollViewer('inventoryScroll');
    scrollViewer.width = '330px';
    scrollViewer.height = '350px';
    scrollViewer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    scrollViewer.top = '140px';
    scrollViewer.thickness = 0;
    scrollViewer.barColor = 'rgba(100, 100, 100, 0.8)';
    scrollViewer.barBackground = 'rgba(50, 50, 50, 0.5)';
    this.container.addControl(scrollViewer);

    // Items container (stack panel inside scroll viewer)
    this.itemsContainer = new GUI.StackPanel('inventoryItems');
    this.itemsContainer.width = '310px';
    this.itemsContainer.spacing = 5;
    scrollViewer.addControl(this.itemsContainer);

    // Initially hidden
    this.container.isVisible = false;
  }

  private createEquipmentSection(): void {
    if (!this.container) return;

    // Equipment header label
    const equipLabel = new GUI.TextBlock('equipLabel');
    equipLabel.text = 'Equipment';
    equipLabel.fontSize = 12;
    equipLabel.color = '#888888';
    equipLabel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    equipLabel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    equipLabel.top = '55px';
    equipLabel.left = '15px';
    equipLabel.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.container.addControl(equipLabel);

    // Slot row
    const slotRow = new GUI.StackPanel('equipSlotRow');
    slotRow.isVertical = false;
    slotRow.height = '65px';
    slotRow.width = '330px';
    slotRow.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    slotRow.top = '70px';
    slotRow.spacing = 8;
    this.container.addControl(slotRow);

    const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];
    for (const slot of slots) {
      const slotRect = new GUI.Rectangle(`equipSlot_${slot}`);
      slotRect.width = '100px';
      slotRect.height = '60px';
      slotRect.cornerRadius = 5;
      slotRect.color = 'rgba(100, 100, 100, 0.6)';
      slotRect.thickness = 1;
      slotRect.background = 'rgba(20, 20, 20, 0.8)';

      // Slot type label
      const typeLabel = new GUI.TextBlock(`equipType_${slot}`);
      typeLabel.text = SLOT_LABELS[slot];
      typeLabel.fontSize = 10;
      typeLabel.color = '#666666';
      typeLabel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      typeLabel.top = '4px';
      slotRect.addControl(typeLabel);

      // Item name label
      const nameLabel = new GUI.TextBlock(`equipName_${slot}`);
      nameLabel.text = 'Empty';
      nameLabel.fontSize = 11;
      nameLabel.color = '#555555';
      nameLabel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
      nameLabel.top = '8px';
      nameLabel.textWrapping = true;
      slotRect.addControl(nameLabel);

      // Click to unequip
      slotRect.onPointerUpObservable.add(() => {
        const nameText = this.equipmentLabels.get(slot);
        if (nameText && nameText.text !== 'Empty') {
          // Find the equipped item in inventory
          for (const item of Array.from(this.items.values())) {
            if (item.equipped && this.getItemSlot(item) === slot) {
              if (this.onItemUnequipped) this.onItemUnequipped(item);
              break;
            }
          }
        }
      });

      this.equipmentSlots.set(slot, slotRect);
      this.equipmentLabels.set(slot, nameLabel);
      slotRow.addControl(slotRect);
    }
  }

  /** Determine which equipment slot an item belongs to. */
  private getItemSlot(item: InventoryItem): EquipmentSlot | null {
    if (item.equipSlot) return item.equipSlot;
    if (item.type === 'weapon') return 'weapon';
    if (item.type === 'armor') return 'armor';
    if (item.type === 'tool' && item.effects) return 'accessory';
    return null;
  }

  // ─── Show / Hide ────────────────────────────────────────────────────────

  public show(): void {
    if (this.container) {
      this.container.isVisible = true;
      this.isVisible = true;
      this.refreshItemList();
    }
  }

  public hide(): void {
    if (this.container) {
      this.container.isVisible = false;
      this.isVisible = false;
    }
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  // ─── Item Management ────────────────────────────────────────────────────

  public addItem(item: InventoryItem): void {
    const existingItem = this.items.get(item.id);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.items.set(item.id, { ...item });
    }

    this.refreshItemList();

    if (this.onItemAdded) {
      this.onItemAdded(item);
    }
  }

  public removeItem(itemId: string, quantity: number = 1): boolean {
    const item = this.items.get(itemId);

    if (!item) {
      return false;
    }

    item.quantity -= quantity;

    if (item.quantity <= 0) {
      this.items.delete(itemId);
    }

    this.refreshItemList();

    if (this.onItemRemoved) {
      this.onItemRemoved(itemId);
    }

    return true;
  }

  public hasItem(itemId: string): boolean {
    return this.items.has(itemId);
  }

  public getItem(itemId: string): InventoryItem | undefined {
    return this.items.get(itemId);
  }

  public getAllItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  public clearAll(): void {
    this.items.clear();
    this.refreshItemList();
  }

  // ─── Equipment Display ──────────────────────────────────────────────────

  /** Update equipment slot displays from external equipment state. */
  public updateEquipmentDisplay(equipped: Map<EquipmentSlot, InventoryItem | null>): void {
    for (const [slot, item] of Array.from(equipped.entries())) {
      const label = this.equipmentLabels.get(slot);
      const rect = this.equipmentSlots.get(slot);
      if (!label || !rect) continue;

      if (item) {
        label.text = item.name;
        label.color = this.getItemColor(item.type);
        rect.color = this.getItemColor(item.type);
        rect.background = 'rgba(30, 40, 30, 0.9)';
      } else {
        label.text = 'Empty';
        label.color = '#555555';
        rect.color = 'rgba(100, 100, 100, 0.6)';
        rect.background = 'rgba(20, 20, 20, 0.8)';
      }
    }
  }

  // ─── Item List Rendering ────────────────────────────────────────────────

  public refreshItemList(): void {
    if (!this.itemsContainer) return;

    this.itemsContainer.clearControls();

    if (this.items.size === 0) {
      const emptyText = new GUI.TextBlock('emptyInventory');
      emptyText.text = 'Your inventory is empty';
      emptyText.height = '40px';
      emptyText.fontSize = 14;
      emptyText.color = '#888888';
      emptyText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
      this.itemsContainer.addControl(emptyText);
      return;
    }

    for (const item of Array.from(this.items.values())) {
      const itemCard = this.createItemCard(item);
      this.itemsContainer.addControl(itemCard);
    }
  }

  private createItemCard(item: InventoryItem): GUI.Rectangle {
    const card = new GUI.Rectangle(`item_${item.id}`);
    card.width = '300px';
    card.height = '95px';
    card.cornerRadius = 5;
    card.color = 'rgba(150, 150, 150, 0.5)';
    card.thickness = 1;
    card.background = 'rgba(30, 30, 30, 0.8)';

    // Item name (with [E] badge if equipped)
    const nameText = new GUI.TextBlock(`item_name_${item.id}`);
    nameText.text = item.equipped ? `[E] ${item.name}` : item.name;
    nameText.fontSize = 16;
    nameText.fontWeight = 'bold';
    nameText.color = item.equipped ? '#90EE90' : this.getItemColor(item.type);
    nameText.height = '20px';
    nameText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    nameText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    nameText.top = '8px';
    nameText.left = '15px';
    nameText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    card.addControl(nameText);

    // Quantity and value row
    const infoRow = new GUI.StackPanel(`item_info_${item.id}`);
    infoRow.isVertical = false;
    infoRow.height = '20px';
    infoRow.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    infoRow.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    infoRow.top = '8px';
    infoRow.left = '-10px';
    card.addControl(infoRow);

    if (item.value) {
      const valueText = new GUI.TextBlock(`item_val_${item.id}`);
      valueText.text = `${item.value}g`;
      valueText.fontSize = 12;
      valueText.color = '#FFD700';
      valueText.width = '40px';
      infoRow.addControl(valueText);
    }

    if (item.quantity > 1) {
      const quantityText = new GUI.TextBlock(`item_qty_${item.id}`);
      quantityText.text = `x${item.quantity}`;
      quantityText.fontSize = 12;
      quantityText.fontWeight = 'bold';
      quantityText.color = '#8888FF';
      quantityText.width = '35px';
      infoRow.addControl(quantityText);
    }

    // Description line + stat preview
    const descLine = this.getDescriptionWithStats(item);
    if (descLine) {
      const descText = new GUI.TextBlock(`item_desc_${item.id}`);
      descText.text = descLine;
      descText.fontSize = 11;
      descText.color = '#CCCCCC';
      descText.height = '30px';
      descText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      descText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      descText.top = '30px';
      descText.left = '15px';
      descText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      descText.textWrapping = true;
      card.addControl(descText);
    }

    // Action buttons row
    const buttonsRow = new GUI.StackPanel(`item_btns_${item.id}`);
    buttonsRow.isVertical = false;
    buttonsRow.height = '25px';
    buttonsRow.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    buttonsRow.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    buttonsRow.top = '-5px';
    buttonsRow.left = '-10px';
    card.addControl(buttonsRow);

    // Equip button — for equippable types, not already equipped
    const slot = this.getItemSlot(item);
    if (slot && !item.equipped) {
      const equipBtn = GUI.Button.CreateSimpleButton(`equip_${item.id}`, 'Equip');
      equipBtn.width = '50px';
      equipBtn.height = '22px';
      equipBtn.color = 'white';
      equipBtn.background = 'rgba(50, 90, 160, 0.9)';
      equipBtn.cornerRadius = 3;
      equipBtn.fontSize = 11;
      equipBtn.onPointerUpObservable.add(() => {
        if (this.onItemEquipped) this.onItemEquipped(item);
      });
      buttonsRow.addControl(equipBtn);
    }

    // Use button — for consumable, food, drink, quest, key items
    if (USABLE_TYPES.has(item.type)) {
      const useBtn = GUI.Button.CreateSimpleButton(`use_${item.id}`, 'Use');
      useBtn.width = '50px';
      useBtn.height = '22px';
      useBtn.color = 'white';
      useBtn.background = 'rgba(60, 130, 60, 0.9)';
      useBtn.cornerRadius = 3;
      useBtn.fontSize = 11;
      useBtn.onPointerUpObservable.add(() => {
        if (this.onItemUsed) this.onItemUsed(item);
      });
      buttonsRow.addControl(useBtn);
    }

    // Drop button — not for quest items, not for equipped items
    if (item.type !== 'quest' && !item.equipped) {
      const dropBtn = GUI.Button.CreateSimpleButton(`drop_${item.id}`, 'Drop');
      dropBtn.width = '50px';
      dropBtn.height = '22px';
      dropBtn.color = 'white';
      dropBtn.background = 'rgba(130, 60, 60, 0.9)';
      dropBtn.cornerRadius = 3;
      dropBtn.fontSize = 11;
      dropBtn.paddingLeft = '4px';
      dropBtn.onPointerUpObservable.add(() => {
        if (this.onItemDropped) this.onItemDropped(item);
      });
      buttonsRow.addControl(dropBtn);
    }

    return card;
  }

  /** Build description string, appending stat bonuses if present. */
  private getDescriptionWithStats(item: InventoryItem): string {
    const parts: string[] = [];
    if (item.description) parts.push(item.description);

    if (item.effects) {
      const statParts: string[] = [];
      if (item.effects.attackPower) statParts.push(`ATK +${item.effects.attackPower}`);
      if (item.effects.defense) statParts.push(`DEF +${item.effects.defense}`);
      if (item.effects.dodgeChance) statParts.push(`DODGE +${(item.effects.dodgeChance * 100).toFixed(0)}%`);
      if (item.effects.health) statParts.push(`HP +${item.effects.health}`);
      if (item.effects.energy) statParts.push(`EN +${item.effects.energy}`);
      if (statParts.length > 0) parts.push(statParts.join(' | '));
    }

    return parts.join(' — ');
  }

  private getItemColor(type: string): string {
    switch (type) {
      case 'quest':
        return '#FFD700';
      case 'collectible':
        return '#87CEEB';
      case 'key':
        return '#FF6347';
      case 'consumable':
        return '#90EE90';
      case 'weapon':
        return '#FF8C00';
      case 'armor':
        return '#B0C4DE';
      case 'food':
      case 'drink':
        return '#DEB887';
      case 'material':
        return '#D2B48C';
      case 'tool':
        return '#C0C0C0';
      default:
        return 'white';
    }
  }

  // ─── Gold Management ──────────────────────────────────────────────────────

  public getGold(): number {
    return this.playerGold;
  }

  public setGold(amount: number): void {
    this.playerGold = Math.max(0, amount);
    this.updateGoldDisplay();
  }

  public addGold(amount: number): void {
    this.playerGold += amount;
    this.updateGoldDisplay();
  }

  public removeGold(amount: number): boolean {
    if (this.playerGold < amount) return false;
    this.playerGold -= amount;
    this.updateGoldDisplay();
    return true;
  }

  private updateGoldDisplay(): void {
    if (this.goldDisplay) {
      this.goldDisplay.text = `Gold: ${this.playerGold}`;
    }
  }

  // ─── Callbacks ────────────────────────────────────────────────────────

  public setOnItemAdded(callback: (item: InventoryItem) => void): void {
    this.onItemAdded = callback;
  }

  public setOnItemRemoved(callback: (itemId: string) => void): void {
    this.onItemRemoved = callback;
  }

  public setOnItemDropped(callback: (item: InventoryItem) => void): void {
    this.onItemDropped = callback;
  }

  public setOnItemUsed(callback: (item: InventoryItem) => void): void {
    this.onItemUsed = callback;
  }

  public setOnItemEquipped(callback: (item: InventoryItem) => void): void {
    this.onItemEquipped = callback;
  }

  public setOnItemUnequipped(callback: (item: InventoryItem) => void): void {
    this.onItemUnequipped = callback;
  }

  /**
   * Dispose inventory
   */
  public dispose(): void {
    if (this.container) {
      this.advancedTexture.removeControl(this.container);
      this.container.dispose();
      this.container = null;
    }

    this.itemsContainer = null;
    this.equipmentSlots.clear();
    this.equipmentLabels.clear();
    this.items.clear();
  }
}
