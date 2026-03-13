/**
 * Babylon Skill Tree Panel
 *
 * In-game panel (K key) showing a visual 5-tier skill tree
 * representing language learning progression from "First Words" to "Near Native".
 */

import * as GUI from '@babylonjs/gui';
import {
  SKILL_TIERS,
  createDefaultSkillTreeState,
  updateSkillProgress,
  type SkillTreeState,
  type SkillNode,
  type SkillTier,
} from '@shared/language/language-skill-tree';

export interface SkillTreeStats {
  wordsLearned: number;
  wordsMastered: number;
  conversations: number;
  grammarPatterns: number;
  avgTargetLanguagePct: number;
  fluency: number;
  maxSustainedTurns: number;
  questsCompleted: number;
}

export class BabylonSkillTreePanel {
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private container: GUI.Rectangle | null = null;
  private contentStack: GUI.StackPanel | null = null;
  private scrollViewer: GUI.ScrollViewer | null = null;
  private headerText: GUI.TextBlock | null = null;
  private isVisible: boolean = false;

  private state: SkillTreeState;
  private onClose: (() => void) | null = null;
  private onSkillUnlocked: ((node: SkillNode) => void) | null = null;

  constructor(advancedTexture: GUI.AdvancedDynamicTexture) {
    this.advancedTexture = advancedTexture;
    this.state = createDefaultSkillTreeState();
    this.createPanel();
  }

  private createPanel(): void {
    this.container = new GUI.Rectangle('skillTreeContainer');
    this.container.width = '500px';
    this.container.height = '580px';
    this.container.cornerRadius = 10;
    this.container.color = 'white';
    this.container.thickness = 2;
    this.container.background = 'rgba(0, 0, 0, 0.95)';
    this.container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.container.zIndex = 50;
    this.advancedTexture.addControl(this.container);

    // Vertical layout: title bar -> header -> scroll area
    const mainLayout = new GUI.StackPanel('skillTreeMainLayout');
    mainLayout.isVertical = true;
    mainLayout.width = '100%';
    mainLayout.height = '100%';
    this.container.addControl(mainLayout);

    // Title bar
    const titleBar = new GUI.Rectangle('skillTreeTitleBar');
    titleBar.width = '500px';
    titleBar.height = '50px';
    titleBar.cornerRadius = 10;
    titleBar.background = 'rgba(40, 70, 50, 1)';
    titleBar.thickness = 0;
    mainLayout.addControl(titleBar);

    const titleText = new GUI.TextBlock('skillTreeTitle');
    titleText.text = 'Skill Tree';
    titleText.fontSize = 20;
    titleText.fontWeight = 'bold';
    titleText.color = 'white';
    titleBar.addControl(titleText);

    // Close button
    const closeBtn = GUI.Button.CreateSimpleButton('skillTreeClose', 'X');
    closeBtn.width = '36px';
    closeBtn.height = '36px';
    closeBtn.color = 'white';
    closeBtn.background = 'rgba(200, 50, 50, 0.8)';
    closeBtn.cornerRadius = 5;
    closeBtn.fontSize = 16;
    closeBtn.fontWeight = 'bold';
    closeBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    closeBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    closeBtn.left = '-8px';
    closeBtn.onPointerUpObservable.add(() => {
      this.hide();
      this.onClose?.();
    });
    titleBar.addControl(closeBtn);

    // Header summary
    this.headerText = new GUI.TextBlock('skillTreeHeader');
    this.headerText.text = '';
    this.headerText.fontSize = 12;
    this.headerText.color = 'rgba(200, 200, 200, 0.9)';
    this.headerText.height = '20px';
    mainLayout.addControl(this.headerText);

    // Scroll area — fills remaining space
    this.scrollViewer = new GUI.ScrollViewer('skillTreeScroll');
    this.scrollViewer.width = '480px';
    this.scrollViewer.height = '500px';
    this.scrollViewer.thickness = 0;
    this.scrollViewer.barColor = 'rgba(100, 160, 100, 0.8)';
    this.scrollViewer.barBackground = 'rgba(50, 50, 50, 0.5)';
    mainLayout.addControl(this.scrollViewer);

    this.contentStack = new GUI.StackPanel('skillTreeContent');
    this.contentStack.width = '460px';
    this.contentStack.spacing = 8;
    this.scrollViewer.addControl(this.contentStack);

    this.container.isVisible = false;
  }

  private updateHeader(): void {
    if (!this.headerText) return;
    const unlocked = this.state.nodes.filter(n => n.unlocked).length;
    const total = this.state.nodes.length;
    this.headerText.text = `${unlocked}/${total} skills unlocked`;
  }

  private refreshContent(): void {
    this.updateHeader();
    if (!this.contentStack) return;

    // Clear existing
    const children = this.contentStack.children.slice();
    for (const child of children) {
      this.contentStack.removeControl(child);
      child.dispose();
    }

    // Render tiers top to bottom (tier 1 at top)
    for (const tierDef of SKILL_TIERS) {
      const tierNodes = this.state.nodes.filter(n => n.tier === tierDef.tier);
      const tierCard = this.createTierSection(tierDef, tierNodes);
      this.contentStack.addControl(tierCard);
    }
  }

  private createTierSection(tierDef: SkillTier, nodes: SkillNode[]): GUI.Rectangle {
    const unlockedCount = nodes.filter(n => n.unlocked).length;
    const allUnlocked = unlockedCount === nodes.length;
    const nodeHeight = 50;
    const totalHeight = 40 + nodes.length * (nodeHeight + 4) + 8;

    const section = new GUI.Rectangle(`tier_${tierDef.tier}`);
    section.width = '450px';
    section.height = `${totalHeight}px`;
    section.cornerRadius = 8;
    section.thickness = 2;
    section.color = allUnlocked ? tierDef.color : 'rgba(80, 80, 80, 0.6)';
    section.background = allUnlocked
      ? `rgba(${this.hexToRgb(tierDef.color)}, 0.1)`
      : 'rgba(25, 25, 30, 0.7)';

    // Tier header
    const tierHeader = new GUI.TextBlock(`tierHeader_${tierDef.tier}`);
    tierHeader.text = `Tier ${tierDef.tier}: ${tierDef.name}  (${tierDef.fluencyRange[0]}-${tierDef.fluencyRange[1]}% fluency)`;
    tierHeader.fontSize = 13;
    tierHeader.fontWeight = 'bold';
    tierHeader.color = allUnlocked ? tierDef.color : 'rgba(180, 180, 180, 0.9)';
    tierHeader.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    tierHeader.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    tierHeader.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    tierHeader.left = '12px';
    tierHeader.top = '8px';
    tierHeader.height = '20px';
    section.addControl(tierHeader);

    // Completion badge
    const badge = new GUI.TextBlock(`tierBadge_${tierDef.tier}`);
    badge.text = `${unlockedCount}/${nodes.length}`;
    badge.fontSize = 11;
    badge.fontWeight = 'bold';
    badge.color = allUnlocked ? '#2ecc71' : 'rgba(150, 150, 150, 0.8)';
    badge.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    badge.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    badge.left = '-12px';
    badge.top = '8px';
    badge.height = '18px';
    badge.width = '40px';
    section.addControl(badge);

    // Skill nodes
    let yOffset = 34;
    for (const node of nodes) {
      const nodeCard = this.createSkillNode(node, tierDef.color, yOffset);
      section.addControl(nodeCard);
      yOffset += nodeHeight + 4;
    }

    return section;
  }

  private createSkillNode(node: SkillNode, tierColor: string, yOffset: number): GUI.Rectangle {
    const card = new GUI.Rectangle(`skill_${node.id}`);
    card.width = '430px';
    card.height = '50px';
    card.cornerRadius = 5;
    card.thickness = 1;
    card.color = node.unlocked ? tierColor : 'rgba(60, 60, 60, 0.5)';
    card.background = node.unlocked
      ? `rgba(${this.hexToRgb(tierColor)}, 0.15)`
      : 'rgba(20, 20, 25, 0.6)';
    card.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    card.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    card.top = `${yOffset}px`;

    // Icon
    const icon = new GUI.TextBlock(`skillIcon_${node.id}`);
    icon.text = node.icon;
    icon.fontSize = 20;
    icon.width = '30px';
    icon.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    icon.left = '8px';
    card.addControl(icon);

    // Name
    const nameText = new GUI.TextBlock(`skillName_${node.id}`);
    nameText.text = node.name;
    nameText.fontSize = 13;
    nameText.fontWeight = 'bold';
    nameText.color = node.unlocked ? 'white' : 'rgba(150, 150, 150, 0.8)';
    nameText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    nameText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    nameText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    nameText.left = '42px';
    nameText.top = '6px';
    nameText.height = '18px';
    card.addControl(nameText);

    // Description
    const descText = new GUI.TextBlock(`skillDesc_${node.id}`);
    descText.text = node.description;
    descText.fontSize = 10;
    descText.color = node.unlocked ? 'rgba(200, 200, 200, 0.8)' : 'rgba(120, 120, 120, 0.7)';
    descText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    descText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    descText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    descText.left = '42px';
    descText.top = '24px';
    descText.height = '14px';
    card.addControl(descText);

    // Progress bar (only for non-unlocked)
    if (!node.unlocked) {
      const barBg = new GUI.Rectangle(`skillBarBg_${node.id}`);
      barBg.width = '100px';
      barBg.height = '8px';
      barBg.cornerRadius = 4;
      barBg.background = 'rgba(50, 50, 50, 0.8)';
      barBg.thickness = 0;
      barBg.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      barBg.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      barBg.left = '-40px';
      barBg.top = '12px';
      card.addControl(barBg);

      const fillWidth = Math.max(2, node.progress * 100);
      const barFill = new GUI.Rectangle(`skillBarFill_${node.id}`);
      barFill.width = `${fillWidth}px`;
      barFill.height = '8px';
      barFill.cornerRadius = 4;
      barFill.background = tierColor;
      barFill.thickness = 0;
      barFill.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      barBg.addControl(barFill);

      const pctText = new GUI.TextBlock(`skillPct_${node.id}`);
      pctText.text = `${Math.round(node.progress * 100)}%`;
      pctText.fontSize = 9;
      pctText.color = 'rgba(160, 160, 160, 0.8)';
      pctText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      pctText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      pctText.left = '-8px';
      pctText.top = '10px';
      pctText.height = '14px';
      pctText.width = '30px';
      card.addControl(pctText);
    } else {
      // Unlocked checkmark
      const check = new GUI.TextBlock(`skillCheck_${node.id}`);
      check.text = '✓';
      check.fontSize = 18;
      check.fontWeight = 'bold';
      check.color = '#2ecc71';
      check.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      check.left = '-12px';
      check.width = '30px';
      card.addControl(check);
    }

    return card;
  }

  private hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  // --- Public API ---

  public updateStats(stats: SkillTreeStats): void {
    const newlyUnlocked = updateSkillProgress(this.state, stats);
    for (const node of newlyUnlocked) {
      this.onSkillUnlocked?.(node);
    }
    if (this.isVisible) {
      this.refreshContent();
    }
  }

  public show(): void {
    if (this.container) {
      this.container.isVisible = true;
      this.isVisible = true;
      this.refreshContent();
    }
  }

  public hide(): void {
    if (this.container) {
      this.container.isVisible = false;
      this.isVisible = false;
    }
  }

  public toggle(): void {
    if (this.isVisible) this.hide(); else this.show();
  }

  public getIsVisible(): boolean { return this.isVisible; }

  public getState(): SkillTreeState { return { nodes: this.state.nodes.map(n => ({ ...n })) }; }

  public setOnClose(cb: () => void): void { this.onClose = cb; }
  public setOnSkillUnlocked(cb: (node: SkillNode) => void): void { this.onSkillUnlocked = cb; }

  public exportState(): string { return JSON.stringify(this.state); }

  public importState(json: string): void {
    try {
      this.state = JSON.parse(json);
    } catch (e) {
      console.error('[BabylonSkillTreePanel] Failed to import state:', e);
    }
  }

  public dispose(): void {
    if (this.container) {
      this.advancedTexture.removeControl(this.container);
      this.container.dispose();
      this.container = null;
    }
  }
}
