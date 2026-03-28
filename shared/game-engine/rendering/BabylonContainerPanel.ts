/**
 * BabylonContainerPanel
 *
 * A Babylon.js GUI panel for browsing and interacting with container contents
 * (chests, cupboards, barrels, crates, shelves, cabinets).
 *
 * Features:
 * - Scrollable item list with rarity color coding
 * - Take / Take All actions to move items to player inventory
 * - Place Item section showing player inventory for depositing items
 * - Capacity indicator (used/total slots)
 * - Language-learning item name display
 * - Examine action for vocabulary quest objectives
 */

import * as GUI from '@babylonjs/gui';
import type { InventoryItem, GameContainer, ContainerType } from '@shared/game-engine/types';

const RARITY_COLORS: Record<string, string> = {
  common: '#CCCCCC',
  uncommon: '#1EFF00',
  rare: '#0070FF',
  epic: '#A335EE',
  legendary: '#FF8000',
};

const CONTAINER_ICONS: Record<ContainerType, string> = {
  chest: '\u{1F4E6}',
  cupboard: '\u{1F6AA}',
  barrel: '\u{1F6E2}',
  crate: '\u{1F4E6}',
  shelf: '\u{1F4DA}',
  cabinet: '\u{1F6AA}',
};

export interface ContainerPanelConfig {
  container: GameContainer;
  playerItems: InventoryItem[];
}

export interface ContainerTransaction {
  type: 'take' | 'place' | 'examine';
  item: InventoryItem;
  quantity: number;
  containerId: string;
}

export class BabylonContainerPanel {
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private panel: GUI.Rectangle | null = null;
  private containerItemsPanel: GUI.StackPanel | null = null;
  private playerItemsPanel: GUI.StackPanel | null = null;
  private capacityText: GUI.TextBlock | null = null;
  private statusText: GUI.TextBlock | null = null;
  private titleText: GUI.TextBlock | null = null;
  private isVisible: boolean = false;

  private containerConfig: GameContainer | null = null;
  private playerItems: InventoryItem[] = [];

  private onTake: ((transaction: ContainerTransaction) => void) | null = null;
  private onPlace: ((transaction: ContainerTransaction) => void) | null = null;
  private onExamine: ((transaction: ContainerTransaction) => void) | null = null;
  private onClose: (() => void) | null = null;

  constructor(advancedTexture: GUI.AdvancedDynamicTexture) {
    this.advancedTexture = advancedTexture;
    this.createUI();
  }

  private createUI(): void {
    // Main container
    this.panel = new GUI.Rectangle('containerPanel');
    this.panel.width = '700px';
    this.panel.height = '520px';
    this.panel.cornerRadius = 10;
    this.panel.color = 'white';
    this.panel.thickness = 2;
    this.panel.background = 'rgba(0, 0, 0, 0.9)';
    this.panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.advancedTexture.addControl(this.panel);

    const mainLayout = new GUI.StackPanel('containerMainLayout');
    mainLayout.isVertical = true;
    mainLayout.width = '100%';
    mainLayout.height = '100%';
    this.panel.addControl(mainLayout);

    // Title bar
    const titleBar = new GUI.Rectangle('containerTitleBar');
    titleBar.width = '700px';
    titleBar.height = '45px';
    titleBar.cornerRadius = 10;
    titleBar.background = 'rgba(40, 50, 60, 1)';
    titleBar.thickness = 0;
    mainLayout.addControl(titleBar);

    this.titleText = new GUI.TextBlock('containerTitle');
    this.titleText.text = 'Container';
    this.titleText.fontSize = 18;
    this.titleText.fontWeight = 'bold';
    this.titleText.color = '#87CEEB';
    titleBar.addControl(this.titleText);

    // Capacity indicator in title bar
    this.capacityText = new GUI.TextBlock('containerCapacity');
    this.capacityText.text = '0/0';
    this.capacityText.fontSize = 13;
    this.capacityText.color = '#AAA';
    this.capacityText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.capacityText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.capacityText.left = '-50px';
    titleBar.addControl(this.capacityText);

    // Close button
    const closeBtn = GUI.Button.CreateSimpleButton('containerClose', 'X');
    closeBtn.width = '35px';
    closeBtn.height = '35px';
    closeBtn.color = 'white';
    closeBtn.background = 'rgba(200, 50, 50, 0.8)';
    closeBtn.cornerRadius = 5;
    closeBtn.fontSize = 16;
    closeBtn.fontWeight = 'bold';
    closeBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    closeBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    closeBtn.left = '-5px';
    closeBtn.onPointerUpObservable.add(() => this.hide());
    titleBar.addControl(closeBtn);

    // Two-column layout
    const columnsContainer = new GUI.StackPanel('containerColumns');
    columnsContainer.isVertical = false;
    columnsContainer.width = '680px';
    columnsContainer.height = '440px';
    mainLayout.addControl(columnsContainer);

    // Left column: Container contents
    const leftCol = this.createColumn('contCol', 'Container Contents');
    columnsContainer.addControl(leftCol.wrapper);
    this.containerItemsPanel = leftCol.itemsPanel;

    // Divider
    const divider = new GUI.Rectangle('containerDivider');
    divider.width = '2px';
    divider.height = '400px';
    divider.background = 'rgba(100, 100, 100, 0.5)';
    divider.thickness = 0;
    columnsContainer.addControl(divider);

    // Right column: Player inventory (placeable items)
    const rightCol = this.createColumn('placeCol', 'Your Items');
    columnsContainer.addControl(rightCol.wrapper);
    this.playerItemsPanel = rightCol.itemsPanel;

    // Status bar
    this.statusText = new GUI.TextBlock('containerStatus');
    this.statusText.text = '';
    this.statusText.fontSize = 13;
    this.statusText.color = '#AAAAAA';
    this.statusText.height = '25px';
    mainLayout.addControl(this.statusText);

    this.panel.isVisible = false;
  }

  private createColumn(
    id: string,
    title: string,
  ): { wrapper: GUI.Rectangle; itemsPanel: GUI.StackPanel; headerText: GUI.TextBlock } {
    const wrapper = new GUI.Rectangle(`${id}_wrapper`);
    wrapper.width = '338px';
    wrapper.height = '440px';
    wrapper.thickness = 0;
    wrapper.background = 'transparent';

    const colLayout = new GUI.StackPanel(`${id}_layout`);
    colLayout.isVertical = true;
    colLayout.width = '100%';
    colLayout.height = '100%';
    wrapper.addControl(colLayout);

    // Column header
    const header = new GUI.Rectangle(`${id}_header`);
    header.width = '330px';
    header.height = '35px';
    header.background = 'rgba(40, 40, 40, 0.8)';
    header.cornerRadius = 5;
    header.thickness = 0;
    colLayout.addControl(header);

    const headerText = new GUI.TextBlock(`${id}_title`);
    headerText.text = title;
    headerText.fontSize = 14;
    headerText.fontWeight = 'bold';
    headerText.color = 'white';
    headerText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    headerText.paddingLeft = '10px';
    headerText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    header.addControl(headerText);

    // Scrollable items area
    const scrollViewer = new GUI.ScrollViewer(`${id}_scroll`);
    scrollViewer.width = '330px';
    scrollViewer.height = '400px';
    scrollViewer.thickness = 0;
    scrollViewer.barColor = 'rgba(100, 100, 100, 0.8)';
    scrollViewer.barBackground = 'rgba(50, 50, 50, 0.5)';
    colLayout.addControl(scrollViewer);

    const itemsPanel = new GUI.StackPanel(`${id}_items`);
    itemsPanel.width = '310px';
    itemsPanel.spacing = 4;
    scrollViewer.addControl(itemsPanel);

    return { wrapper, itemsPanel, headerText };
  }

  public open(config: ContainerPanelConfig): void {
    this.containerConfig = config.container;
    this.playerItems = config.playerItems;

    if (this.panel) {
      const icon = CONTAINER_ICONS[config.container.containerType] || '';
      if (this.titleText) {
        this.titleText.text = `${icon} ${config.container.name}`;
      }
      this.updateCapacity();
      this.refreshContainerItems();
      this.refreshPlayerItems();

      this.panel.isVisible = true;
      this.isVisible = true;
    }
  }

  public hide(): void {
    if (this.panel) {
      this.panel.isVisible = false;
      this.isVisible = false;
      if (this.onClose) this.onClose();
    }
  }

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  public getContainerItems(): InventoryItem[] {
    return this.containerConfig?.items || [];
  }

  private updateCapacity(): void {
    if (!this.capacityText || !this.containerConfig) return;
    const used = this.containerConfig.items.length;
    const total = this.containerConfig.capacity;
    this.capacityText.text = `${used}/${total} slots`;
    this.capacityText.color = used >= total ? '#FF6347' : '#AAA';
  }

  private refreshContainerItems(): void {
    if (!this.containerItemsPanel || !this.containerConfig) return;
    this.containerItemsPanel.clearControls();

    if (this.containerConfig.isLocked) {
      const lockedText = new GUI.TextBlock('contLocked');
      lockedText.text = 'This container is locked.';
      lockedText.height = '30px';
      lockedText.fontSize = 13;
      lockedText.color = '#FF6347';
      this.containerItemsPanel.addControl(lockedText);
      return;
    }

    if (this.containerConfig.items.length === 0) {
      const emptyText = new GUI.TextBlock('contEmpty');
      emptyText.text = 'Empty';
      emptyText.height = '30px';
      emptyText.fontSize = 13;
      emptyText.color = '#888';
      this.containerItemsPanel.addControl(emptyText);
    } else {
      // Take All button
      const takeAllBtn = GUI.Button.CreateSimpleButton('contTakeAll', 'Take All');
      takeAllBtn.width = '305px';
      takeAllBtn.height = '28px';
      takeAllBtn.color = 'white';
      takeAllBtn.background = 'rgba(40, 120, 40, 0.8)';
      takeAllBtn.cornerRadius = 5;
      takeAllBtn.fontSize = 13;
      takeAllBtn.fontWeight = 'bold';
      takeAllBtn.onPointerUpObservable.add(() => this.handleTakeAll());
      this.containerItemsPanel.addControl(takeAllBtn);

      for (const item of this.containerConfig.items) {
        const card = this.createContainerItemCard(item);
        this.containerItemsPanel.addControl(card);
      }
    }
  }

  private refreshPlayerItems(): void {
    if (!this.playerItemsPanel || !this.containerConfig) return;
    this.playerItemsPanel.clearControls();

    const isFull = this.containerConfig.items.length >= this.containerConfig.capacity;

    if (this.playerItems.length === 0) {
      const emptyText = new GUI.TextBlock('placeEmpty');
      emptyText.text = 'No items in inventory';
      emptyText.height = '30px';
      emptyText.fontSize = 13;
      emptyText.color = '#888';
      this.playerItemsPanel.addControl(emptyText);
      return;
    }

    if (isFull) {
      const fullText = new GUI.TextBlock('placeFull');
      fullText.text = 'Container is full';
      fullText.height = '30px';
      fullText.fontSize = 13;
      fullText.color = '#FF6347';
      this.playerItemsPanel.addControl(fullText);
    }

    for (const item of this.playerItems) {
      const card = this.createPlayerItemCard(item, isFull);
      this.playerItemsPanel.addControl(card);
    }
  }

  private createContainerItemCard(item: InventoryItem): GUI.Rectangle {
    const uid = `cont_${item.id}`;
    const card = new GUI.Rectangle(uid);
    card.width = '305px';
    card.height = '65px';
    card.cornerRadius = 5;
    card.color = 'rgba(100, 100, 100, 0.4)';
    card.thickness = 1;
    card.background = 'rgba(25, 25, 25, 0.9)';

    const cardStack = new GUI.StackPanel(`${uid}_stack`);
    cardStack.isVertical = true;
    cardStack.width = '100%';
    cardStack.height = '100%';
    cardStack.paddingLeft = '10px';
    cardStack.paddingRight = '10px';
    cardStack.paddingTop = '4px';
    card.addControl(cardStack);

    // Row 1: Name + rarity + quantity
    const topRow = new GUI.StackPanel(`${uid}_topRow`);
    topRow.isVertical = false;
    topRow.width = '100%';
    topRow.height = '20px';
    cardStack.addControl(topRow);

    const nameText = new GUI.TextBlock(`${uid}_name`);
    const rarityLabel = item.rarity && item.rarity !== 'common' ? ` [${item.rarity}]` : '';
    nameText.text = item.name + rarityLabel;
    nameText.fontSize = 14;
    nameText.fontWeight = 'bold';
    nameText.color = item.rarity ? RARITY_COLORS[item.rarity] || '#CCCCCC' : '#CCCCCC';
    nameText.width = '70%';
    nameText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    topRow.addControl(nameText);

    if (item.quantity > 1) {
      const qtyText = new GUI.TextBlock(`${uid}_qty`);
      qtyText.text = `x${item.quantity}`;
      qtyText.fontSize = 12;
      qtyText.color = '#AAA';
      qtyText.width = '30%';
      qtyText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      topRow.addControl(qtyText);
    }

    // Row 2: Description
    if (item.description) {
      const descText = new GUI.TextBlock(`${uid}_desc`);
      descText.text = item.description;
      descText.fontSize = 10;
      descText.color = '#999';
      descText.height = '14px';
      descText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      cardStack.addControl(descText);
    }

    // Row 3: Action buttons
    const btnRow = new GUI.StackPanel(`${uid}_btnRow`);
    btnRow.isVertical = false;
    btnRow.width = '100%';
    btnRow.height = '26px';
    cardStack.addControl(btnRow);

    // Value display
    if (item.value) {
      const valueText = new GUI.TextBlock(`${uid}_val`);
      valueText.text = `${item.value}g`;
      valueText.fontSize = 12;
      valueText.color = '#FFD700';
      valueText.width = '40%';
      valueText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      btnRow.addControl(valueText);
    } else {
      const spacer = new GUI.TextBlock(`${uid}_spacer`);
      spacer.text = '';
      spacer.width = '40%';
      btnRow.addControl(spacer);
    }

    // Examine button
    const examineBtn = GUI.Button.CreateSimpleButton(`${uid}_examine`, 'Examine');
    examineBtn.width = '70px';
    examineBtn.height = '24px';
    examineBtn.color = 'white';
    examineBtn.background = 'rgba(80, 80, 150, 0.9)';
    examineBtn.cornerRadius = 4;
    examineBtn.fontSize = 11;
    examineBtn.fontWeight = 'bold';
    examineBtn.onPointerUpObservable.add(() => {
      this.handleExamine(item);
    });
    btnRow.addControl(examineBtn);

    // Take button
    const takeBtn = GUI.Button.CreateSimpleButton(`${uid}_take`, 'Take');
    takeBtn.width = '60px';
    takeBtn.height = '24px';
    takeBtn.color = 'white';
    takeBtn.background = 'rgba(40, 120, 40, 0.9)';
    takeBtn.cornerRadius = 4;
    takeBtn.fontSize = 12;
    takeBtn.fontWeight = 'bold';
    takeBtn.onPointerUpObservable.add(() => {
      this.handleTake(item);
    });
    btnRow.addControl(takeBtn);

    return card;
  }

  private createPlayerItemCard(item: InventoryItem, containerFull: boolean): GUI.Rectangle {
    const uid = `place_${item.id}`;
    const card = new GUI.Rectangle(uid);
    card.width = '305px';
    card.height = '50px';
    card.cornerRadius = 5;
    card.color = containerFull ? 'rgba(80, 50, 50, 0.6)' : 'rgba(100, 100, 100, 0.4)';
    card.thickness = 1;
    card.background = containerFull ? 'rgba(30, 15, 15, 0.9)' : 'rgba(25, 25, 25, 0.9)';

    const cardStack = new GUI.StackPanel(`${uid}_stack`);
    cardStack.isVertical = false;
    cardStack.width = '100%';
    cardStack.height = '100%';
    cardStack.paddingLeft = '10px';
    cardStack.paddingRight = '10px';
    card.addControl(cardStack);

    // Item name
    const nameText = new GUI.TextBlock(`${uid}_name`);
    const rarityLabel = item.rarity && item.rarity !== 'common' ? ` [${item.rarity}]` : '';
    nameText.text = item.name + rarityLabel + (item.quantity > 1 ? ` x${item.quantity}` : '');
    nameText.fontSize = 13;
    nameText.fontWeight = 'bold';
    nameText.color = containerFull
      ? '#666'
      : (item.rarity ? RARITY_COLORS[item.rarity] || '#CCCCCC' : '#CCCCCC');
    nameText.width = '70%';
    nameText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    cardStack.addControl(nameText);

    // Place button
    const placeBtn = GUI.Button.CreateSimpleButton(`${uid}_place`, 'Place');
    placeBtn.width = '60px';
    placeBtn.height = '24px';
    placeBtn.color = containerFull ? '#666' : 'white';
    placeBtn.background = containerFull
      ? 'rgba(50, 50, 50, 0.5)'
      : 'rgba(40, 80, 150, 0.9)';
    placeBtn.cornerRadius = 4;
    placeBtn.fontSize = 12;
    placeBtn.fontWeight = 'bold';
    if (!containerFull) {
      placeBtn.onPointerUpObservable.add(() => {
        this.handlePlace(item);
      });
    }
    cardStack.addControl(placeBtn);

    return card;
  }

  private handleTake(item: InventoryItem): void {
    if (!this.containerConfig) return;
    const transaction: ContainerTransaction = {
      type: 'take',
      item,
      quantity: item.quantity,
      containerId: this.containerConfig.id,
    };

    // Remove from container items
    this.containerConfig.items = this.containerConfig.items.filter(i => i.id !== item.id);

    if (this.onTake) this.onTake(transaction);
    this.showStatus(`Took ${item.name}`, '#2ecc71');
    this.updateCapacity();
    this.refreshContainerItems();
    this.refreshPlayerItems();
  }

  private handleTakeAll(): void {
    if (!this.containerConfig) return;
    const items = [...this.containerConfig.items];
    for (const item of items) {
      const transaction: ContainerTransaction = {
        type: 'take',
        item,
        quantity: item.quantity,
        containerId: this.containerConfig.id,
      };
      if (this.onTake) this.onTake(transaction);
    }

    this.containerConfig.items = [];
    this.showStatus('Took all items', '#2ecc71');
    this.updateCapacity();
    this.refreshContainerItems();
    this.refreshPlayerItems();
  }

  private handlePlace(item: InventoryItem): void {
    if (!this.containerConfig) return;
    if (this.containerConfig.items.length >= this.containerConfig.capacity) {
      this.showStatus('Container is full!', '#FF6347');
      return;
    }

    const transaction: ContainerTransaction = {
      type: 'place',
      item,
      quantity: item.quantity,
      containerId: this.containerConfig.id,
    };

    // Add to container, remove from player
    this.containerConfig.items.push(item);
    this.playerItems = this.playerItems.filter(i => i.id !== item.id);

    if (this.onPlace) this.onPlace(transaction);
    this.showStatus(`Placed ${item.name}`, '#87CEEB');
    this.updateCapacity();
    this.refreshContainerItems();
    this.refreshPlayerItems();
  }

  private handleExamine(item: InventoryItem): void {
    if (!this.containerConfig) return;
    const transaction: ContainerTransaction = {
      type: 'examine',
      item,
      quantity: 1,
      containerId: this.containerConfig.id,
    };
    if (this.onExamine) this.onExamine(transaction);

    const langInfo = item.languageLearningData
      ? ` — "${item.languageLearningData.targetWord}" (${item.languageLearningData.targetLanguage})`
      : '';
    this.showStatus(`${item.name}: ${item.description || 'No description'}${langInfo}`, '#87CEEB');
  }

  private showStatus(text: string, color: string): void {
    if (this.statusText) {
      this.statusText.text = text;
      this.statusText.color = color;
    }
  }

  public setOnTake(callback: (transaction: ContainerTransaction) => void): void {
    this.onTake = callback;
  }

  public setOnPlace(callback: (transaction: ContainerTransaction) => void): void {
    this.onPlace = callback;
  }

  public setOnExamine(callback: (transaction: ContainerTransaction) => void): void {
    this.onExamine = callback;
  }

  public setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  public dispose(): void {
    if (this.panel) {
      this.advancedTexture.removeControl(this.panel);
      this.panel.dispose();
      this.panel = null;
    }
    this.containerItemsPanel = null;
    this.playerItemsPanel = null;
    this.containerConfig = null;
  }
}
