/**
 * MainMenuScreen - In-game main menu overlay using Babylon.js GUI
 *
 * Displays New Game, Continue, and Load Game options before the world loads.
 * Appears after the Babylon.js engine/scene are initialized but before world
 * data is loaded and the game starts.
 */

import {
  AdvancedDynamicTexture,
  Button,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
  TextWrapping,
  ScrollViewer,
} from "@babylonjs/gui";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PlaythroughInfo {
  id: string;
  name?: string;
  status: string;
  lastPlayedAt?: string;
  createdAt: string;
  playtime?: number;
}

export interface MainMenuCallbacks {
  /** Fetch all playthroughs for this world */
  getPlaythroughs: () => Promise<PlaythroughInfo[]>;
  /** Create a new playthrough and return its ID */
  onNewGame: () => Promise<string | null>;
  /** Continue the most recently played playthrough */
  onContinue: (playthroughId: string) => void;
  /** Load a specific playthrough */
  onLoadGame: (playthroughId: string) => void;
  /** Go back to the editor/world list */
  onBack: () => void;
}

// ─── Colors ─────────────────────────────────────────────────────────────────

const COLORS = {
  bg: "rgba(8, 8, 14, 0.98)",
  cardBg: "rgba(255, 255, 255, 0.05)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  cardHover: "rgba(255, 255, 255, 0.10)",
  textPrimary: "#E8EAED",
  textSecondary: "#9AA0A6",
  textMuted: "#5F6368",
  accent: "#4285F4",
  accentGreen: "#34A853",
  accentYellow: "#FBBC04",
  divider: "rgba(255, 255, 255, 0.08)",
};

// ─── Main class ─────────────────────────────────────────────────────────────

export class MainMenuScreen {
  private advancedTexture: AdvancedDynamicTexture;
  private callbacks: MainMenuCallbacks;
  private worldName: string;

  private overlay: Rectangle | null = null;
  private contentPanel: StackPanel | null = null;
  private playthroughs: PlaythroughInfo[] = [];
  private _isOpen = false;
  private _view: "main" | "load" = "main";

  constructor(
    advancedTexture: AdvancedDynamicTexture,
    worldName: string,
    callbacks: MainMenuCallbacks,
  ) {
    this.advancedTexture = advancedTexture;
    this.worldName = worldName;
    this.callbacks = callbacks;
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  async show(): Promise<void> {
    this._isOpen = true;
    this._view = "main";

    // Fetch playthroughs
    try {
      this.playthroughs = await this.callbacks.getPlaythroughs();
    } catch {
      this.playthroughs = [];
    }

    this.buildUI();
  }

  hide(): void {
    this._isOpen = false;
    if (this.overlay) {
      this.advancedTexture.removeControl(this.overlay);
      this.overlay = null;
    }
    this.contentPanel = null;
  }

  dispose(): void {
    this.hide();
  }

  // ─── UI Building ────────────────────────────────────────────────────────

  private buildUI(): void {
    // Remove previous overlay
    if (this.overlay) {
      this.advancedTexture.removeControl(this.overlay);
    }

    // Full-screen overlay
    this.overlay = new Rectangle("mainMenuOverlay");
    this.overlay.width = 1;
    this.overlay.height = 1;
    this.overlay.thickness = 0;
    this.overlay.background = COLORS.bg;
    this.overlay.zIndex = 9000;
    this.advancedTexture.addControl(this.overlay);

    if (this._view === "main") {
      this.renderMainView();
    } else {
      this.renderLoadView();
    }
  }

  private renderMainView(): void {
    if (!this.overlay) return;

    const container = new StackPanel("mainMenuContainer");
    container.width = "420px";
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.overlay.addControl(container);

    // Title
    const title = new TextBlock("menuTitle", this.worldName);
    title.color = COLORS.textPrimary;
    title.fontSize = 36;
    title.fontWeight = "bold";
    title.height = "60px";
    title.textWrapping = TextWrapping.Ellipsis;
    container.addControl(title);

    // Subtitle
    const subtitle = new TextBlock("menuSubtitle", "Main Menu");
    subtitle.color = COLORS.textSecondary;
    subtitle.fontSize = 14;
    subtitle.height = "30px";
    container.addControl(subtitle);

    // Spacer
    const spacer = new Rectangle("spacer1");
    spacer.height = "30px";
    spacer.thickness = 0;
    spacer.background = "transparent";
    container.addControl(spacer);

    // Find most recent playthrough for Continue
    const mostRecent = this.getMostRecentPlaythrough();

    // New Game button
    this.addMenuButton(container, "New Game", "Start a new adventure", COLORS.accent, async () => {
      this.showLoadingState("Creating new game...");
      const playthroughId = await this.callbacks.onNewGame();
      if (playthroughId) {
        this.hide();
        this.callbacks.onContinue(playthroughId);
      } else {
        // Failed - rebuild UI
        this.buildUI();
      }
    });

    // Continue button (only if there's a recent playthrough)
    if (mostRecent) {
      const label = mostRecent.name || "Continue";
      const desc = this.formatLastPlayed(mostRecent.lastPlayedAt || mostRecent.createdAt);
      this.addMenuButton(container, "Continue", desc, COLORS.accentGreen, () => {
        this.hide();
        this.callbacks.onContinue(mostRecent.id);
      });
    }

    // Load Game button (only if there are playthroughs)
    if (this.playthroughs.length > 0) {
      this.addMenuButton(container, "Load Game", `${this.playthroughs.length} playthrough${this.playthroughs.length === 1 ? "" : "s"} available`, COLORS.accentYellow, () => {
        this._view = "load";
        this.buildUI();
      });
    }

    // Spacer
    const spacer2 = new Rectangle("spacer2");
    spacer2.height = "20px";
    spacer2.thickness = 0;
    spacer2.background = "transparent";
    container.addControl(spacer2);

    // Back button
    this.addMenuButton(container, "Back", "Return to world list", COLORS.textMuted, () => {
      this.hide();
      this.callbacks.onBack();
    });
  }

  private renderLoadView(): void {
    if (!this.overlay) return;

    const container = new StackPanel("loadMenuContainer");
    container.width = "500px";
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.overlay.addControl(container);

    // Header
    const header = new StackPanel("loadHeader");
    header.isVertical = false;
    header.height = "50px";
    header.width = 1;
    container.addControl(header);

    // Back arrow button
    const backBtn = Button.CreateSimpleButton("loadBackBtn", "\u2190 Back");
    backBtn.width = "100px";
    backBtn.height = "40px";
    backBtn.color = COLORS.textSecondary;
    backBtn.background = "transparent";
    backBtn.thickness = 0;
    backBtn.fontSize = 14;
    backBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    backBtn.onPointerClickObservable.add(() => {
      this._view = "main";
      this.buildUI();
    });
    header.addControl(backBtn);

    const titleBlock = new TextBlock("loadTitle", "Load Game");
    titleBlock.color = COLORS.textPrimary;
    titleBlock.fontSize = 24;
    titleBlock.fontWeight = "bold";
    titleBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    header.addControl(titleBlock);

    // Spacer for symmetry
    const spacerRight = new Rectangle("spacerRight");
    spacerRight.width = "100px";
    spacerRight.thickness = 0;
    spacerRight.background = "transparent";
    header.addControl(spacerRight);

    // Spacer
    const spacer = new Rectangle("loadSpacer");
    spacer.height = "20px";
    spacer.thickness = 0;
    spacer.background = "transparent";
    container.addControl(spacer);

    // Scrollable list of playthroughs
    const scrollViewer = new ScrollViewer("loadScroll");
    scrollViewer.width = 1;
    scrollViewer.height = "400px";
    scrollViewer.thickness = 0;
    scrollViewer.barColor = COLORS.textMuted;
    scrollViewer.barBackground = COLORS.divider;
    container.addControl(scrollViewer);

    const list = new StackPanel("loadList");
    list.width = 1;
    scrollViewer.addControl(list);

    // Sort playthroughs by most recently played
    const sorted = [...this.playthroughs].sort((a, b) => {
      const dateA = a.lastPlayedAt || a.createdAt;
      const dateB = b.lastPlayedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    for (const pt of sorted) {
      this.addPlaythroughCard(list, pt);
    }

    if (sorted.length === 0) {
      const empty = new TextBlock("emptyMsg", "No playthroughs found.\nStart a New Game from the main menu.");
      empty.color = COLORS.textSecondary;
      empty.fontSize = 14;
      empty.height = "60px";
      empty.textWrapping = TextWrapping.WordWrap;
      list.addControl(empty);
    }
  }

  private addPlaythroughCard(parent: StackPanel, pt: PlaythroughInfo): void {
    const card = new Rectangle(`ptCard_${pt.id}`);
    card.width = 1;
    card.height = "80px";
    card.thickness = 1;
    card.color = COLORS.cardBorder;
    card.background = COLORS.cardBg;
    card.cornerRadius = 8;
    card.paddingBottom = "8px";
    parent.addControl(card);

    const inner = new StackPanel(`ptInner_${pt.id}`);
    inner.width = 1;
    inner.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    inner.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    inner.paddingLeft = "16px";
    card.addControl(inner);

    // Name
    const name = new TextBlock(`ptName_${pt.id}`, pt.name || `Playthrough`);
    name.color = COLORS.textPrimary;
    name.fontSize = 16;
    name.fontWeight = "bold";
    name.height = "24px";
    name.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    name.left = "16px";
    inner.addControl(name);

    // Details line
    const details: string[] = [];
    if (pt.status) details.push(pt.status);
    details.push(this.formatLastPlayed(pt.lastPlayedAt || pt.createdAt));
    if (pt.playtime) details.push(this.formatPlaytime(pt.playtime));

    const detailText = new TextBlock(`ptDetail_${pt.id}`, details.join("  \u2022  "));
    detailText.color = COLORS.textSecondary;
    detailText.fontSize = 12;
    detailText.height = "20px";
    detailText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    detailText.left = "16px";
    inner.addControl(detailText);

    // Hover effects
    card.onPointerEnterObservable.add(() => {
      card.background = COLORS.cardHover;
    });
    card.onPointerOutObservable.add(() => {
      card.background = COLORS.cardBg;
    });

    // Click to load
    card.onPointerClickObservable.add(() => {
      this.hide();
      this.callbacks.onLoadGame(pt.id);
    });
  }

  private addMenuButton(
    parent: StackPanel,
    label: string,
    description: string,
    accentColor: string,
    onClick: () => void,
  ): void {
    const card = new Rectangle(`menuBtn_${label}`);
    card.width = 1;
    card.height = "70px";
    card.thickness = 1;
    card.color = COLORS.cardBorder;
    card.background = COLORS.cardBg;
    card.cornerRadius = 8;
    card.paddingBottom = "8px";
    parent.addControl(card);

    // Accent bar on the left
    const accentBar = new Rectangle(`accent_${label}`);
    accentBar.width = "4px";
    accentBar.height = 1;
    accentBar.thickness = 0;
    accentBar.background = accentColor;
    accentBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    card.addControl(accentBar);

    const inner = new StackPanel(`btnInner_${label}`);
    inner.width = 1;
    inner.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    card.addControl(inner);

    const labelText = new TextBlock(`btnLabel_${label}`, label);
    labelText.color = COLORS.textPrimary;
    labelText.fontSize = 18;
    labelText.fontWeight = "bold";
    labelText.height = "28px";
    labelText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    labelText.left = "20px";
    inner.addControl(labelText);

    const descText = new TextBlock(`btnDesc_${label}`, description);
    descText.color = COLORS.textSecondary;
    descText.fontSize = 12;
    descText.height = "18px";
    descText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    descText.left = "20px";
    inner.addControl(descText);

    // Hover effects
    card.onPointerEnterObservable.add(() => {
      card.background = COLORS.cardHover;
    });
    card.onPointerOutObservable.add(() => {
      card.background = COLORS.cardBg;
    });

    card.onPointerClickObservable.add(() => onClick());
  }

  private showLoadingState(message: string): void {
    if (!this.overlay) return;

    // Clear existing content
    this.overlay.clearControls();

    const loadingText = new TextBlock("loadingMsg", message);
    loadingText.color = COLORS.textSecondary;
    loadingText.fontSize = 18;
    this.overlay.addControl(loadingText);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  private getMostRecentPlaythrough(): PlaythroughInfo | null {
    if (this.playthroughs.length === 0) return null;
    return [...this.playthroughs].sort((a, b) => {
      const dateA = a.lastPlayedAt || a.createdAt;
      const dateB = b.lastPlayedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })[0];
  }

  private formatLastPlayed(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  private formatPlaytime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m played`;
    return `${mins}m played`;
  }
}
