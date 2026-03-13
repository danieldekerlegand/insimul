/**
 * Player Assessment Panel
 *
 * In-game panel (L key) showing RPG-style progress with:
 * - 5 stat bars (1-5 scale, color-coded) for assessment dimensions
 * - CEFR badge showing language proficiency level
 * - Improvement arrows comparing against previous assessment
 * - Next assessment indicator
 */

import * as GUI from '@babylonjs/gui';
import {
  ASSESSMENT_DIMENSIONS,
  CEFR_COLORS,
  CEFR_DESCRIPTIONS,
  DIMENSION_ICONS,
  DIMENSION_LABELS,
  getImprovementArrow,
  getImprovementColor,
  getScoreColor,
  type CEFRLevel,
  type DimensionScore,
  type PlayerAssessmentData,
} from '@shared/assessment-types';

export class PlayerAssessmentPanel {
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private container: GUI.Rectangle | null = null;
  private contentStack: GUI.StackPanel | null = null;
  private isVisible: boolean = false;
  private onClose: (() => void) | null = null;
  private data: PlayerAssessmentData | null = null;
  private playerLevel: number = 1;

  constructor(advancedTexture: GUI.AdvancedDynamicTexture) {
    this.advancedTexture = advancedTexture;
    this.createPanel();
  }

  private createPanel(): void {
    this.container = new GUI.Rectangle('assessmentContainer');
    this.container.width = '460px';
    this.container.height = '480px';
    this.container.cornerRadius = 10;
    this.container.color = 'white';
    this.container.thickness = 2;
    this.container.background = 'rgba(0, 0, 0, 0.95)';
    this.container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.container.zIndex = 50;
    this.advancedTexture.addControl(this.container);

    const mainLayout = new GUI.StackPanel('assessmentMainLayout');
    mainLayout.isVertical = true;
    mainLayout.width = '100%';
    mainLayout.height = '100%';
    this.container.addControl(mainLayout);

    // Title bar
    const titleBar = new GUI.Rectangle('assessmentTitleBar');
    titleBar.width = '460px';
    titleBar.height = '50px';
    titleBar.cornerRadius = 10;
    titleBar.background = 'rgba(40, 50, 100, 1)';
    titleBar.thickness = 0;
    mainLayout.addControl(titleBar);

    const titleText = new GUI.TextBlock('assessmentTitle');
    titleText.text = 'Language Progress';
    titleText.fontSize = 20;
    titleText.fontWeight = 'bold';
    titleText.color = 'white';
    titleBar.addControl(titleText);

    // Close button
    const closeBtn = GUI.Button.CreateSimpleButton('assessmentClose', 'X');
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

    // Content area
    this.contentStack = new GUI.StackPanel('assessmentContent');
    this.contentStack.isVertical = true;
    this.contentStack.width = '440px';
    this.contentStack.spacing = 6;
    this.contentStack.paddingTopInPixels = 10;
    mainLayout.addControl(this.contentStack);

    this.container.isVisible = false;
  }

  private refreshContent(): void {
    if (!this.contentStack) return;

    // Clear existing children
    const children = this.contentStack.children.slice();
    for (const child of children) {
      this.contentStack.removeControl(child);
      child.dispose();
    }

    if (!this.data) {
      this.renderNoData();
      return;
    }

    this.renderCEFRBadge(this.data.cefrLevel);
    this.renderDimensionBars(this.data.dimensionScores);
    this.renderNextAssessment(this.data.nextAssessmentLevel);
  }

  private renderNoData(): void {
    if (!this.contentStack) return;

    const noDataText = new GUI.TextBlock('noAssessmentData');
    noDataText.text = 'No assessment data yet.\nComplete your first assessment to see your progress!';
    noDataText.fontSize = 14;
    noDataText.color = 'rgba(200, 200, 200, 0.8)';
    noDataText.height = '80px';
    noDataText.textWrapping = true;
    noDataText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.contentStack.addControl(noDataText);
  }

  private renderCEFRBadge(cefrLevel: CEFRLevel): void {
    if (!this.contentStack) return;

    const badgeContainer = new GUI.Rectangle('cefrBadgeContainer');
    badgeContainer.width = '420px';
    badgeContainer.height = '70px';
    badgeContainer.cornerRadius = 8;
    badgeContainer.thickness = 2;
    badgeContainer.color = CEFR_COLORS[cefrLevel];
    badgeContainer.background = `rgba(0, 0, 0, 0.3)`;
    this.contentStack.addControl(badgeContainer);

    // CEFR level text (large)
    const levelText = new GUI.TextBlock('cefrLevelText');
    levelText.text = cefrLevel;
    levelText.fontSize = 28;
    levelText.fontWeight = 'bold';
    levelText.color = CEFR_COLORS[cefrLevel];
    levelText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    levelText.left = '20px';
    levelText.width = '60px';
    badgeContainer.addControl(levelText);

    // Description
    const descText = new GUI.TextBlock('cefrDescText');
    descText.text = CEFR_DESCRIPTIONS[cefrLevel];
    descText.fontSize = 16;
    descText.color = 'white';
    descText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    descText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    descText.left = '80px';
    descText.top = '14px';
    descText.height = '24px';
    badgeContainer.addControl(descText);

    const subDesc = new GUI.TextBlock('cefrSubDesc');
    subDesc.text = 'CEFR Proficiency Level';
    subDesc.fontSize = 11;
    subDesc.color = 'rgba(180, 180, 180, 0.8)';
    subDesc.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    subDesc.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    subDesc.left = '80px';
    subDesc.top = '38px';
    subDesc.height = '18px';
    badgeContainer.addControl(subDesc);
  }

  private renderDimensionBars(scores: DimensionScore[]): void {
    if (!this.contentStack) return;

    // Section header
    const sectionHeader = new GUI.TextBlock('dimensionHeader');
    sectionHeader.text = 'Assessment Dimensions';
    sectionHeader.fontSize = 14;
    sectionHeader.fontWeight = 'bold';
    sectionHeader.color = 'rgba(200, 200, 200, 0.9)';
    sectionHeader.height = '28px';
    sectionHeader.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    sectionHeader.paddingLeftInPixels = 10;
    this.contentStack.addControl(sectionHeader);

    // Build a map for easy lookup
    const scoreMap = new Map(scores.map(s => [s.dimension, s]));

    for (const dim of ASSESSMENT_DIMENSIONS) {
      const scoreData = scoreMap.get(dim);
      const score = scoreData?.score ?? 0;
      const previousScore = scoreData?.previousScore;
      this.renderStatBar(dim, score, previousScore);
    }
  }

  private renderStatBar(dimension: (typeof ASSESSMENT_DIMENSIONS)[number], score: number, previousScore?: number): void {
    if (!this.contentStack) return;

    const rowHeight = 44;
    const row = new GUI.Rectangle(`statRow_${dimension}`);
    row.width = '420px';
    row.height = `${rowHeight}px`;
    row.cornerRadius = 6;
    row.thickness = 1;
    row.color = 'rgba(60, 60, 80, 0.6)';
    row.background = 'rgba(20, 20, 30, 0.5)';
    this.contentStack.addControl(row);

    // Icon
    const icon = new GUI.TextBlock(`statIcon_${dimension}`);
    icon.text = DIMENSION_ICONS[dimension];
    icon.fontSize = 18;
    icon.width = '28px';
    icon.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    icon.left = '8px';
    row.addControl(icon);

    // Label
    const label = new GUI.TextBlock(`statLabel_${dimension}`);
    label.text = DIMENSION_LABELS[dimension];
    label.fontSize = 13;
    label.fontWeight = 'bold';
    label.color = 'white';
    label.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    label.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    label.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    label.left = '40px';
    label.top = '4px';
    label.height = '18px';
    label.width = '120px';
    row.addControl(label);

    // Bar background
    const barBg = new GUI.Rectangle(`statBarBg_${dimension}`);
    barBg.width = '180px';
    barBg.height = '14px';
    barBg.cornerRadius = 7;
    barBg.background = 'rgba(50, 50, 60, 0.8)';
    barBg.thickness = 0;
    barBg.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    barBg.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    barBg.left = '160px';
    row.addControl(barBg);

    // 5 segment markers
    for (let i = 1; i < 5; i++) {
      const marker = new GUI.Rectangle(`statMarker_${dimension}_${i}`);
      marker.width = '1px';
      marker.height = '14px';
      marker.background = 'rgba(80, 80, 90, 0.6)';
      marker.thickness = 0;
      marker.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      marker.left = `${(i / 5) * 180}px`;
      barBg.addControl(marker);
    }

    // Bar fill
    const fillWidth = Math.max(2, (score / 5) * 180);
    const barFill = new GUI.Rectangle(`statBarFill_${dimension}`);
    barFill.width = `${fillWidth}px`;
    barFill.height = '14px';
    barFill.cornerRadius = 7;
    barFill.background = getScoreColor(score);
    barFill.thickness = 0;
    barFill.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    barBg.addControl(barFill);

    // Score text
    const scoreText = new GUI.TextBlock(`statScore_${dimension}`);
    scoreText.text = score > 0 ? `${score}/5` : '-';
    scoreText.fontSize = 12;
    scoreText.fontWeight = 'bold';
    scoreText.color = score > 0 ? getScoreColor(score) : 'rgba(120,120,120,0.6)';
    scoreText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    scoreText.left = '-40px';
    scoreText.width = '36px';
    row.addControl(scoreText);

    // Improvement arrow
    const arrow = getImprovementArrow(score, previousScore);
    if (arrow) {
      const arrowText = new GUI.TextBlock(`statArrow_${dimension}`);
      arrowText.text = arrow;
      arrowText.fontSize = 14;
      arrowText.fontWeight = 'bold';
      arrowText.color = getImprovementColor(score, previousScore);
      arrowText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      arrowText.left = '-12px';
      arrowText.width = '20px';
      row.addControl(arrowText);
    }
  }

  private renderNextAssessment(nextLevel?: number): void {
    if (!this.contentStack) return;

    const infoRow = new GUI.Rectangle('nextAssessmentRow');
    infoRow.width = '420px';
    infoRow.height = '40px';
    infoRow.cornerRadius = 6;
    infoRow.thickness = 1;
    infoRow.color = 'rgba(60, 60, 80, 0.4)';
    infoRow.background = 'rgba(20, 20, 30, 0.3)';
    this.contentStack.addControl(infoRow);

    const infoText = new GUI.TextBlock('nextAssessmentText');
    if (nextLevel && this.playerLevel < nextLevel) {
      infoText.text = `Next assessment at Level ${nextLevel} (currently Level ${this.playerLevel})`;
    } else {
      infoText.text = 'Assessment available!';
      infoRow.color = 'rgba(46, 204, 113, 0.6)';
    }
    infoText.fontSize = 12;
    infoText.color = 'rgba(180, 180, 200, 0.9)';
    infoRow.addControl(infoText);
  }

  // --- Public API ---

  public updateData(data: PlayerAssessmentData | null, playerLevel?: number): void {
    this.data = data;
    if (playerLevel !== undefined) this.playerLevel = playerLevel;
    if (this.isVisible) this.refreshContent();
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
    if (this.isVisible) this.hide();
    else this.show();
  }

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  public setOnClose(cb: () => void): void {
    this.onClose = cb;
  }

  public dispose(): void {
    if (this.container) {
      this.advancedTexture.removeControl(this.container);
      this.container.dispose();
      this.container = null;
    }
  }
}
