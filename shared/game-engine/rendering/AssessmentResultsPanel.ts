/**
 * Assessment Results Summary Panel
 *
 * Displays assessment results after the arrival encounter:
 * - Overall score percentage
 * - CEFR level badge with description
 * - 5-dimension horizontal bars (Vocabulary, Grammar, Fluency, Pronunciation, Comprehension)
 * - "Your adventure begins!" CTA button
 *
 * Style matches BabylonSkillTreePanel.ts.
 */

import * as GUI from '@babylonjs/gui';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface ScoringDimension {
  name: string;
  /** Score from 1-5 */
  score: number;
}

export interface AssessmentResults {
  /** Overall score as a percentage (0-100) */
  overallScorePct: number;
  /** CEFR level */
  cefrLevel: CEFRLevel;
  /** 5 scoring dimensions, each scored 1-5 */
  dimensions: ScoringDimension[];
}

const CEFR_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: 'Beginner — Can understand and use basic phrases for immediate needs.',
  A2: 'Elementary — Can communicate in routine tasks and describe surroundings.',
  B1: 'Intermediate — Can handle most travel situations and describe experiences.',
  B2: 'Upper Intermediate — Can interact fluently with native speakers.',
};

const CEFR_COLORS: Record<CEFRLevel, string> = {
  A1: '#e74c3c',
  A2: '#e67e22',
  B1: '#f1c40f',
  B2: '#2ecc71',
};

const DIMENSION_COLORS: Record<number, string> = {
  1: '#e74c3c',
  2: '#e67e22',
  3: '#f1c40f',
  4: '#27ae60',
  5: '#2ecc71',
};

export class AssessmentResultsPanel {
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private container: GUI.Rectangle | null = null;
  private isVisible: boolean = false;
  private results: AssessmentResults | null = null;
  private onClose: (() => void) | null = null;
  private onAdventureStart: (() => void) | null = null;

  constructor(advancedTexture: GUI.AdvancedDynamicTexture) {
    this.advancedTexture = advancedTexture;
    this.createPanel();
  }

  private createPanel(): void {
    this.container = new GUI.Rectangle('assessmentResultsContainer');
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
    this.container.isVisible = false;
  }

  private refreshContent(): void {
    if (!this.container || !this.results) return;

    // Clear existing children except the container itself
    const children = this.container.children.slice();
    for (const child of children) {
      this.container.removeControl(child);
      child.dispose();
    }

    const mainLayout = new GUI.StackPanel('assessmentMainLayout');
    mainLayout.isVertical = true;
    mainLayout.width = '100%';
    mainLayout.height = '100%';
    this.container.addControl(mainLayout);

    // Title bar
    const titleBar = new GUI.Rectangle('assessmentTitleBar');
    titleBar.width = '500px';
    titleBar.height = '50px';
    titleBar.cornerRadius = 10;
    titleBar.background = 'rgba(40, 70, 50, 1)';
    titleBar.thickness = 0;
    mainLayout.addControl(titleBar);

    const titleText = new GUI.TextBlock('assessmentTitle');
    titleText.text = 'Assessment Results';
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

    // Scroll area
    const scrollViewer = new GUI.ScrollViewer('assessmentScroll');
    scrollViewer.width = '480px';
    scrollViewer.height = '520px';
    scrollViewer.thickness = 0;
    scrollViewer.barColor = 'rgba(100, 160, 100, 0.8)';
    scrollViewer.barBackground = 'rgba(50, 50, 50, 0.5)';
    mainLayout.addControl(scrollViewer);

    const contentStack = new GUI.StackPanel('assessmentContent');
    contentStack.width = '460px';
    contentStack.spacing = 12;
    scrollViewer.addControl(contentStack);

    this.createOverallScore(contentStack);
    this.createCEFRBadge(contentStack);
    this.createDimensionBars(contentStack);
    this.createCTAButton(contentStack);
  }

  private createOverallScore(parent: GUI.StackPanel): void {
    if (!this.results) return;

    const scoreSection = new GUI.Rectangle('overallScoreSection');
    scoreSection.width = '450px';
    scoreSection.height = '100px';
    scoreSection.cornerRadius = 8;
    scoreSection.thickness = 0;
    scoreSection.background = 'rgba(25, 25, 30, 0.7)';
    parent.addControl(scoreSection);

    const label = new GUI.TextBlock('overallScoreLabel');
    label.text = 'Overall Score';
    label.fontSize = 14;
    label.color = 'rgba(200, 200, 200, 0.9)';
    label.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    label.top = '12px';
    label.height = '20px';
    scoreSection.addControl(label);

    const scoreText = new GUI.TextBlock('overallScoreValue');
    scoreText.text = `${Math.round(this.results.overallScorePct)}%`;
    scoreText.fontSize = 42;
    scoreText.fontWeight = 'bold';
    scoreText.color = CEFR_COLORS[this.results.cefrLevel];
    scoreText.top = '10px';
    scoreSection.addControl(scoreText);
  }

  private createCEFRBadge(parent: GUI.StackPanel): void {
    if (!this.results) return;

    const badgeSection = new GUI.Rectangle('cefrBadgeSection');
    badgeSection.width = '450px';
    badgeSection.height = '80px';
    badgeSection.cornerRadius = 8;
    badgeSection.thickness = 2;
    badgeSection.color = CEFR_COLORS[this.results.cefrLevel];
    badgeSection.background = `rgba(${this.hexToRgb(CEFR_COLORS[this.results.cefrLevel])}, 0.1)`;
    parent.addControl(badgeSection);

    // CEFR level badge
    const levelBadge = new GUI.Rectangle('cefrLevelBadge');
    levelBadge.width = '60px';
    levelBadge.height = '36px';
    levelBadge.cornerRadius = 6;
    levelBadge.background = CEFR_COLORS[this.results.cefrLevel];
    levelBadge.thickness = 0;
    levelBadge.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    levelBadge.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    levelBadge.left = '16px';
    levelBadge.top = '12px';
    badgeSection.addControl(levelBadge);

    const levelText = new GUI.TextBlock('cefrLevelText');
    levelText.text = this.results.cefrLevel;
    levelText.fontSize = 18;
    levelText.fontWeight = 'bold';
    levelText.color = 'white';
    levelBadge.addControl(levelText);

    // CEFR description
    const descText = new GUI.TextBlock('cefrDescription');
    descText.text = CEFR_DESCRIPTIONS[this.results.cefrLevel];
    descText.fontSize = 12;
    descText.color = 'rgba(200, 200, 200, 0.9)';
    descText.textWrapping = true;
    descText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    descText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    descText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    descText.left = '16px';
    descText.top = '-10px';
    descText.width = '410px';
    descText.height = '30px';
    badgeSection.addControl(descText);
  }

  private createDimensionBars(parent: GUI.StackPanel): void {
    if (!this.results) return;

    const dimSection = new GUI.Rectangle('dimensionSection');
    const barHeight = 44;
    const sectionHeight = 34 + this.results.dimensions.length * (barHeight + 8) + 8;
    dimSection.width = '450px';
    dimSection.height = `${sectionHeight}px`;
    dimSection.cornerRadius = 8;
    dimSection.thickness = 0;
    dimSection.background = 'rgba(25, 25, 30, 0.7)';
    parent.addControl(dimSection);

    const sectionLabel = new GUI.TextBlock('dimSectionLabel');
    sectionLabel.text = 'Skill Dimensions';
    sectionLabel.fontSize = 14;
    sectionLabel.fontWeight = 'bold';
    sectionLabel.color = 'rgba(200, 200, 200, 0.9)';
    sectionLabel.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    sectionLabel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    sectionLabel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    sectionLabel.left = '16px';
    sectionLabel.top = '10px';
    sectionLabel.height = '20px';
    dimSection.addControl(sectionLabel);

    let yOffset = 34;
    for (const dim of this.results.dimensions) {
      this.createDimensionBar(dimSection, dim, yOffset);
      yOffset += barHeight + 8;
    }
  }

  private createDimensionBar(parent: GUI.Rectangle, dim: ScoringDimension, yOffset: number): void {
    const barContainer = new GUI.Rectangle(`dim_${dim.name}`);
    barContainer.width = '420px';
    barContainer.height = '44px';
    barContainer.cornerRadius = 5;
    barContainer.thickness = 0;
    barContainer.background = 'rgba(20, 20, 25, 0.6)';
    barContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    barContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    barContainer.top = `${yOffset}px`;
    parent.addControl(barContainer);

    // Dimension name
    const nameText = new GUI.TextBlock(`dimName_${dim.name}`);
    nameText.text = dim.name;
    nameText.fontSize = 12;
    nameText.fontWeight = 'bold';
    nameText.color = 'white';
    nameText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    nameText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    nameText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    nameText.left = '12px';
    nameText.top = '4px';
    nameText.height = '16px';
    barContainer.addControl(nameText);

    // Score text
    const clampedScore = Math.max(1, Math.min(5, Math.round(dim.score)));
    const color = DIMENSION_COLORS[clampedScore];

    const scoreText = new GUI.TextBlock(`dimScore_${dim.name}`);
    scoreText.text = `${dim.score.toFixed(1)} / 5`;
    scoreText.fontSize = 11;
    scoreText.color = color;
    scoreText.fontWeight = 'bold';
    scoreText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    scoreText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    scoreText.left = '-12px';
    scoreText.top = '4px';
    scoreText.height = '16px';
    scoreText.width = '60px';
    barContainer.addControl(scoreText);

    // Progress bar background
    const barBg = new GUI.Rectangle(`dimBarBg_${dim.name}`);
    barBg.width = '396px';
    barBg.height = '12px';
    barBg.cornerRadius = 6;
    barBg.background = 'rgba(50, 50, 50, 0.8)';
    barBg.thickness = 0;
    barBg.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    barBg.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    barBg.top = '-6px';
    barContainer.addControl(barBg);

    // Progress bar fill
    const fillPct = Math.max(2, (dim.score / 5) * 100);
    const barFill = new GUI.Rectangle(`dimBarFill_${dim.name}`);
    barFill.width = `${fillPct}%`;
    barFill.height = '12px';
    barFill.cornerRadius = 6;
    barFill.background = color;
    barFill.thickness = 0;
    barFill.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    barBg.addControl(barFill);
  }

  private createCTAButton(parent: GUI.StackPanel): void {
    const ctaContainer = new GUI.Rectangle('ctaContainer');
    ctaContainer.width = '450px';
    ctaContainer.height = '60px';
    ctaContainer.thickness = 0;
    ctaContainer.background = 'transparent';
    parent.addControl(ctaContainer);

    const ctaBtn = GUI.Button.CreateSimpleButton('ctaButton', 'Your adventure begins!');
    ctaBtn.width = '300px';
    ctaBtn.height = '48px';
    ctaBtn.color = 'white';
    ctaBtn.background = 'rgba(40, 120, 60, 0.9)';
    ctaBtn.cornerRadius = 8;
    ctaBtn.fontSize = 18;
    ctaBtn.fontWeight = 'bold';
    ctaBtn.onPointerUpObservable.add(() => {
      this.hide();
      this.onAdventureStart?.();
    });
    ctaContainer.addControl(ctaBtn);
  }

  private hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  // --- Public API ---

  public showResults(results: AssessmentResults): void {
    this.results = results;
    if (this.container) {
      this.container.isVisible = true;
      this.isVisible = true;
      this.refreshContent();
    }
  }

  public show(): void {
    if (this.container && this.results) {
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

  public setOnClose(cb: () => void): void { this.onClose = cb; }
  public setOnAdventureStart(cb: () => void): void { this.onAdventureStart = cb; }

  public dispose(): void {
    if (this.container) {
      this.advancedTexture.removeControl(this.container);
      this.container.dispose();
      this.container = null;
    }
  }
}
