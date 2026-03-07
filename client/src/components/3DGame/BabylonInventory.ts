/**
 * Babylon Inventory
 *
 * Manages player inventory for quest items and collected objects
 */

import { Scene } from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

// Re-export engine-agnostic type from shared game-engine
export type { InventoryItem } from '@shared/game-engine/types';
import type { InventoryItem } from '@shared/game-engine/types';

export class BabylonInventory {
  private scene: Scene;
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private container: GUI.Rectangle | null = null;
  private itemsContainer: GUI.StackPanel | null = null;
  private isVisible: boolean = false;

  private items: Map<string, InventoryItem> = new Map();
  private playerGold: number = 100;
  private goldDisplay: GUI.TextBlock | null = null;
  private onItemAdded: ((item: InventoryItem) => void) | null = null;
  private onItemRemoved: ((itemId: string) => void) | null = null;
  private onItemDropped: ((item: InventoryItem) => void) | null = null;
  private onItemUsed: ((item: InventoryItem) => void) | null = null;

  constructor(scene: Scene, advancedTexture: GUI.AdvancedDynamicTexture) {
    this.scene = scene;
    this.advancedTexture = advancedTexture;

    this.createInventoryUI();
  }

  /**
   * Create the inventory UI
   */
  private createInventoryUI(): void {
    // Main container
    this.container = new GUI.Rectangle('inventoryContainer');
    this.container.width = '350px';
    this.container.height = '500px';
    this.container.cornerRadius = 10;
    this.container.color = 'white';
    this.container.thickness = 2;
    this.container.background = 'rgba(0, 0, 0, 0.85)';
    this.advancedTexture.addControl(this.container);

    // Center on screen
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

    // Items scroll view
    const scrollViewer = new GUI.ScrollViewer('inventoryScroll');
    scrollViewer.width = '330px';
    scrollViewer.height = '430px';
    scrollViewer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    scrollViewer.top = '60px';
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

  /**
   * Show inventory
   */
  public show(): void {
    if (this.container) {
      this.container.isVisible = true;
      this.isVisible = true;
      this.refreshItemList();
    }
  }

  /**
   * Hide inventory
   */
  public hide(): void {
    if (this.container) {
      this.container.isVisible = false;
      this.isVisible = false;
    }
  }

  /**
   * Toggle inventory visibility
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Add item to inventory
   */
  public addItem(item: InventoryItem): void {
    const existingItem = this.items.get(item.id);

    if (existingItem) {
      // If item already exists, increase quantity
      existingItem.quantity += item.quantity;
    } else {
      // Add new item
      this.items.set(item.id, { ...item });
    }

    this.refreshItemList();

    // Trigger callback
    if (this.onItemAdded) {
      this.onItemAdded(item);
    }
  }

  /**
   * Remove item from inventory
   */
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

    // Trigger callback
    if (this.onItemRemoved) {
      this.onItemRemoved(itemId);
    }

    return true;
  }

  /**
   * Check if item exists in inventory
   */
  public hasItem(itemId: string): boolean {
    return this.items.has(itemId);
  }

  /**
   * Get item from inventory
   */
  public getItem(itemId: string): InventoryItem | undefined {
    return this.items.get(itemId);
  }

  /**
   * Get all items
   */
  public getAllItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Clear all items
   */
  public clearAll(): void {
    this.items.clear();
    this.refreshItemList();
  }

  /**
   * Refresh the item list display
   */
  private refreshItemList(): void {
    if (!this.itemsContainer) return;

    // Clear existing items
    this.itemsContainer.clearControls();

    if (this.items.size === 0) {
      // Show empty message
      const emptyText = new GUI.TextBlock('emptyInventory');
      emptyText.text = 'Your inventory is empty';
      emptyText.height = '40px';
      emptyText.fontSize = 14;
      emptyText.color = '#888888';
      emptyText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
      this.itemsContainer.addControl(emptyText);
      return;
    }

    // Add each item
    for (const item of this.items.values()) {
      const itemCard = this.createItemCard(item);
      this.itemsContainer.addControl(itemCard);
    }
  }

  /**
   * Create an item card
   */
  private createItemCard(item: InventoryItem): GUI.Rectangle {
    const card = new GUI.Rectangle(`item_${item.id}`);
    card.width = '300px';
    card.height = '95px';
    card.cornerRadius = 5;
    card.color = 'rgba(150, 150, 150, 0.5)';
    card.thickness = 1;
    card.background = 'rgba(30, 30, 30, 0.8)';

    // Item name
    const nameText = new GUI.TextBlock(`item_name_${item.id}`);
    nameText.text = item.name;
    nameText.fontSize = 16;
    nameText.fontWeight = 'bold';
    nameText.color = this.getItemColor(item.type);
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

    // Item description
    if (item.description) {
      const descText = new GUI.TextBlock(`item_desc_${item.id}`);
      descText.text = item.description;
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

    if (item.type === 'consumable') {
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

    if (item.type !== 'quest') {
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

  /**
   * Get color for item type
   */
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

  // ─── Callbacks ────────────────────────────────────────────────────────────

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
    this.items.clear();
  }
}
