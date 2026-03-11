/**
 * BabylonShopPanel
 *
 * A Babylon.js GUI panel for buying/selling items with merchant NPCs.
 * Displays merchant inventory on the left and player inventory on the right.
 */

import * as GUI from '@babylonjs/gui';
import type { ShopItem, InventoryItem } from '@shared/game-engine/types';

export interface ShopPanelConfig {
  merchantId: string;
  merchantName: string;
  items: ShopItem[];
  goldReserve: number;
  buyMultiplier: number;
  sellMultiplier: number;
}

export interface ShopTransaction {
  type: 'buy' | 'sell';
  item: ShopItem | InventoryItem;
  quantity: number;
  totalPrice: number;
}

export class BabylonShopPanel {
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private container: GUI.Rectangle | null = null;
  private merchantItemsContainer: GUI.StackPanel | null = null;
  private playerItemsContainer: GUI.StackPanel | null = null;
  private playerGoldText: GUI.TextBlock | null = null;
  private merchantGoldText: GUI.TextBlock | null = null;
  private statusText: GUI.TextBlock | null = null;
  private isVisible: boolean = false;

  private merchantConfig: ShopPanelConfig | null = null;
  private playerItems: InventoryItem[] = [];
  private playerGold: number = 0;

  private onBuy: ((transaction: ShopTransaction) => void) | null = null;
  private onSell: ((transaction: ShopTransaction) => void) | null = null;
  private onClose: (() => void) | null = null;

  constructor(advancedTexture: GUI.AdvancedDynamicTexture) {
    this.advancedTexture = advancedTexture;
    this.createUI();
  }

  private createUI(): void {
    // Main container
    this.container = new GUI.Rectangle('shopContainer');
    this.container.width = '700px';
    this.container.height = '520px';
    this.container.cornerRadius = 10;
    this.container.color = 'white';
    this.container.thickness = 2;
    this.container.background = 'rgba(0, 0, 0, 0.9)';
    this.container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.advancedTexture.addControl(this.container);

    // Vertical layout: title bar -> columns -> status
    const mainLayout = new GUI.StackPanel('shopMainLayout');
    mainLayout.isVertical = true;
    mainLayout.width = '100%';
    mainLayout.height = '100%';
    this.container.addControl(mainLayout);

    // Title bar
    const titleBar = new GUI.Rectangle('shopTitleBar');
    titleBar.width = '700px';
    titleBar.height = '45px';
    titleBar.cornerRadius = 10;
    titleBar.background = 'rgba(50, 35, 20, 1)';
    titleBar.thickness = 0;
    mainLayout.addControl(titleBar);

    const titleText = new GUI.TextBlock('shopTitle');
    titleText.text = 'Shop';
    titleText.fontSize = 18;
    titleText.fontWeight = 'bold';
    titleText.color = '#FFD700';
    titleBar.addControl(titleText);

    // Close button
    const closeBtn = GUI.Button.CreateSimpleButton('shopClose', 'X');
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
    const columnsContainer = new GUI.StackPanel('shopColumns');
    columnsContainer.isVertical = false;
    columnsContainer.width = '680px';
    columnsContainer.height = '440px';
    mainLayout.addControl(columnsContainer);

    // Left column: Merchant inventory
    const leftCol = this.createColumn('merchantCol', 'Merchant Wares', true);
    columnsContainer.addControl(leftCol.wrapper);
    this.merchantItemsContainer = leftCol.itemsPanel;
    this.merchantGoldText = leftCol.goldText;

    // Divider
    const divider = new GUI.Rectangle('shopDivider');
    divider.width = '2px';
    divider.height = '400px';
    divider.background = 'rgba(100, 100, 100, 0.5)';
    divider.thickness = 0;
    columnsContainer.addControl(divider);

    // Right column: Player inventory (sellable)
    const rightCol = this.createColumn('playerCol', 'Your Items', false);
    columnsContainer.addControl(rightCol.wrapper);
    this.playerItemsContainer = rightCol.itemsPanel;
    this.playerGoldText = rightCol.goldText;

    // Status bar at bottom
    this.statusText = new GUI.TextBlock('shopStatus');
    this.statusText.text = '';
    this.statusText.fontSize = 13;
    this.statusText.color = '#AAAAAA';
    this.statusText.height = '25px';
    mainLayout.addControl(this.statusText);

    this.container.isVisible = false;
  }

  private createColumn(
    id: string,
    title: string,
    isMerchant: boolean
  ): { wrapper: GUI.Rectangle; itemsPanel: GUI.StackPanel; goldText: GUI.TextBlock } {
    // Use a StackPanel wrapper to vertically stack header + scroll area
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

    const goldText = new GUI.TextBlock(`${id}_gold`);
    goldText.text = 'Gold: 0';
    goldText.fontSize = 13;
    goldText.color = '#FFD700';
    goldText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    goldText.paddingRight = '10px';
    goldText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    header.addControl(goldText);

    // Scrollable items area — fills remaining height
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

    return { wrapper, itemsPanel, goldText };
  }

  public open(config: ShopPanelConfig, playerItems: InventoryItem[], playerGold: number): void {
    this.merchantConfig = config;
    this.playerItems = playerItems;
    this.playerGold = playerGold;

    if (this.container) {
      // Update title
      const titleControl = this.container.getChildByName('shopTitle') as GUI.TextBlock;
      if (titleControl) {
        titleControl.text = `${config.merchantName}'s Shop`;
      }

      this.refreshMerchantItems();
      this.refreshPlayerItems();
      this.updateGoldDisplays();

      this.container.isVisible = true;
      this.isVisible = true;
    }
  }

  public hide(): void {
    if (this.container) {
      this.container.isVisible = false;
      this.isVisible = false;
      if (this.onClose) this.onClose();
    }
  }

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  private refreshMerchantItems(): void {
    if (!this.merchantItemsContainer || !this.merchantConfig) return;
    this.merchantItemsContainer.clearControls();

    if (this.merchantConfig.items.length === 0) {
      const emptyText = new GUI.TextBlock('shopEmpty');
      emptyText.text = 'No items for sale';
      emptyText.height = '30px';
      emptyText.fontSize = 13;
      emptyText.color = '#888';
      this.merchantItemsContainer.addControl(emptyText);
      return;
    }

    for (const item of this.merchantConfig.items) {
      if (item.stock <= 0) continue;
      const card = this.createShopItemCard(item, 'buy');
      this.merchantItemsContainer.addControl(card);
    }
  }

  private refreshPlayerItems(): void {
    if (!this.playerItemsContainer) return;
    this.playerItemsContainer.clearControls();

    const sellableItems = this.playerItems.filter(
      i => i.tradeable !== false && i.type !== 'quest'
    );

    if (sellableItems.length === 0) {
      const emptyText = new GUI.TextBlock('sellEmpty');
      emptyText.text = 'No items to sell';
      emptyText.height = '30px';
      emptyText.fontSize = 13;
      emptyText.color = '#888';
      this.playerItemsContainer.addControl(emptyText);
      return;
    }

    for (const item of sellableItems) {
      const sellPrice = Math.floor(
        (item.sellValue || item.value || 0) * (this.merchantConfig?.sellMultiplier || 0.6)
      );
      const shopItem: ShopItem = {
        ...item,
        buyPrice: item.value || 0,
        sellPrice,
        stock: item.quantity,
        maxStock: item.quantity,
      };
      const card = this.createShopItemCard(shopItem, 'sell');
      this.playerItemsContainer.addControl(card);
    }
  }

  private createShopItemCard(
    item: ShopItem,
    mode: 'buy' | 'sell'
  ): GUI.Rectangle {
    const uid = `${mode}_${item.id}`;
    const card = new GUI.Rectangle(uid);
    card.width = '305px';
    card.height = '65px';
    card.cornerRadius = 5;
    card.color = 'rgba(100, 100, 100, 0.4)';
    card.thickness = 1;
    card.background = 'rgba(25, 25, 25, 0.9)';

    // Vertical stack for card content rows
    const cardStack = new GUI.StackPanel(`${uid}_stack`);
    cardStack.isVertical = true;
    cardStack.width = '100%';
    cardStack.height = '100%';
    cardStack.paddingLeft = '10px';
    cardStack.paddingRight = '10px';
    cardStack.paddingTop = '4px';
    card.addControl(cardStack);

    // Row 1: Name + stock
    const topRow = new GUI.StackPanel(`${uid}_topRow`);
    topRow.isVertical = false;
    topRow.width = '100%';
    topRow.height = '20px';
    cardStack.addControl(topRow);

    const nameText = new GUI.TextBlock(`${uid}_name`);
    nameText.text = item.name;
    nameText.fontSize = 14;
    nameText.fontWeight = 'bold';
    nameText.color = this.getItemColor(item.type);
    nameText.width = mode === 'buy' ? '70%' : '100%';
    nameText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    topRow.addControl(nameText);

    if (mode === 'buy') {
      const stockText = new GUI.TextBlock(`${uid}_stock`);
      stockText.text = `Stock: ${item.stock}`;
      stockText.fontSize = 11;
      stockText.color = item.stock <= 2 ? '#FF6347' : '#AAA';
      stockText.width = '30%';
      stockText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      topRow.addControl(stockText);
    }

    // Row 2: Description
    const descText = new GUI.TextBlock(`${uid}_desc`);
    descText.text = item.description || '';
    descText.fontSize = 10;
    descText.color = '#999';
    descText.height = '16px';
    descText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    cardStack.addControl(descText);

    // Row 3: Price + action button
    const price = mode === 'buy' ? item.buyPrice : item.sellPrice;
    const canAfford = mode === 'buy' ? this.playerGold >= price : true;
    const merchantCanAfford = mode === 'sell'
      ? (this.merchantConfig?.goldReserve || 0) >= price
      : true;

    const bottomRow = new GUI.StackPanel(`${uid}_bottomRow`);
    bottomRow.isVertical = false;
    bottomRow.width = '100%';
    bottomRow.height = '26px';
    cardStack.addControl(bottomRow);

    const priceText = new GUI.TextBlock(`${uid}_price`);
    priceText.text = `${price}g`;
    priceText.fontSize = 14;
    priceText.fontWeight = 'bold';
    priceText.color = canAfford && merchantCanAfford ? '#FFD700' : '#FF4444';
    priceText.width = '70%';
    priceText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    bottomRow.addControl(priceText);

    const actionBtn = GUI.Button.CreateSimpleButton(
      `${uid}_btn`,
      mode === 'buy' ? 'Buy' : 'Sell'
    );
    actionBtn.width = '60px';
    actionBtn.height = '24px';
    actionBtn.color = 'white';
    actionBtn.background =
      mode === 'buy'
        ? canAfford ? 'rgba(40, 120, 40, 0.9)' : 'rgba(80, 80, 80, 0.5)'
        : merchantCanAfford ? 'rgba(40, 80, 150, 0.9)' : 'rgba(80, 80, 80, 0.5)';
    actionBtn.cornerRadius = 4;
    actionBtn.fontSize = 12;
    actionBtn.fontWeight = 'bold';

    if (canAfford && merchantCanAfford) {
      actionBtn.onPointerUpObservable.add(() => {
        this.executeTransaction(mode, item, 1, price);
      });
    }

    bottomRow.addControl(actionBtn);

    return card;
  }

  private executeTransaction(
    type: 'buy' | 'sell',
    item: ShopItem,
    quantity: number,
    totalPrice: number
  ): void {
    const transaction: ShopTransaction = { type, item, quantity, totalPrice };

    if (type === 'buy') {
      if (this.playerGold < totalPrice) {
        this.showStatus('Not enough gold!', '#FF4444');
        return;
      }

      this.playerGold -= totalPrice;
      if (this.merchantConfig) {
        this.merchantConfig.goldReserve += totalPrice;
        const shopItem = this.merchantConfig.items.find(i => i.id === item.id);
        if (shopItem) shopItem.stock -= quantity;
      }

      if (this.onBuy) this.onBuy(transaction);
      this.showStatus(`Bought ${item.name} for ${totalPrice}g`, '#90EE90');
    } else {
      if (this.merchantConfig && this.merchantConfig.goldReserve < totalPrice) {
        this.showStatus('Merchant cannot afford this!', '#FF4444');
        return;
      }

      this.playerGold += totalPrice;
      if (this.merchantConfig) {
        this.merchantConfig.goldReserve -= totalPrice;
      }

      // Remove from player items
      const playerItem = this.playerItems.find(i => i.id === item.id);
      if (playerItem) {
        playerItem.quantity -= quantity;
        if (playerItem.quantity <= 0) {
          this.playerItems = this.playerItems.filter(i => i.id !== item.id);
        }
      }

      if (this.onSell) this.onSell(transaction);
      this.showStatus(`Sold ${item.name} for ${totalPrice}g`, '#87CEEB');
    }

    this.refreshMerchantItems();
    this.refreshPlayerItems();
    this.updateGoldDisplays();
  }

  private updateGoldDisplays(): void {
    if (this.playerGoldText) {
      this.playerGoldText.text = `Gold: ${this.playerGold}`;
    }
    if (this.merchantGoldText && this.merchantConfig) {
      this.merchantGoldText.text = `Gold: ${this.merchantConfig.goldReserve}`;
    }
  }

  private showStatus(message: string, color: string): void {
    if (this.statusText) {
      this.statusText.text = message;
      this.statusText.color = color;
    }
  }

  private getItemColor(type: string): string {
    switch (type) {
      case 'quest': return '#FFD700';
      case 'weapon': return '#FF8C00';
      case 'armor': return '#B0C4DE';
      case 'consumable': return '#90EE90';
      case 'food': case 'drink': return '#DEB887';
      case 'material': return '#D2B48C';
      case 'tool': return '#C0C0C0';
      case 'key': return '#FF6347';
      case 'collectible': return '#87CEEB';
      default: return 'white';
    }
  }

  public getPlayerGold(): number {
    return this.playerGold;
  }

  public setOnBuy(callback: (transaction: ShopTransaction) => void): void {
    this.onBuy = callback;
  }

  public setOnSell(callback: (transaction: ShopTransaction) => void): void {
    this.onSell = callback;
  }

  public setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  public dispose(): void {
    if (this.container) {
      this.advancedTexture.removeControl(this.container);
      this.container.dispose();
      this.container = null;
    }
    this.merchantItemsContainer = null;
    this.playerItemsContainer = null;
  }
}
