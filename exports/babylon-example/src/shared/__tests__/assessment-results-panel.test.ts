import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @babylonjs/gui before importing the panel
vi.mock('@babylonjs/gui', () => {
  class MockControl {
    children: MockControl[] = [];
    isVisible = true;
    width = '';
    height = '';
    color = '';
    background = '';
    cornerRadius = 0;
    thickness = 0;
    fontSize = 0;
    fontWeight = '';
    text = '';
    left = '';
    top = '';
    zIndex = 0;
    spacing = 0;
    isVertical = true;
    textWrapping = false;
    barColor = '';
    barBackground = '';
    horizontalAlignment = 0;
    verticalAlignment = 0;
    textHorizontalAlignment = 0;
    onPointerUpObservable = { add: vi.fn() };

    addControl(child: MockControl) { this.children.push(child); return this; }
    removeControl(child: MockControl) {
      const idx = this.children.indexOf(child);
      if (idx >= 0) this.children.splice(idx, 1);
      return this;
    }
    dispose() { this.children = []; }
  }

  class MockRectangle extends MockControl {
    constructor(public name?: string) { super(); }
  }

  class MockTextBlock extends MockControl {
    constructor(public name?: string) { super(); }
  }

  class MockStackPanel extends MockControl {
    constructor(public name?: string) { super(); }
  }

  class MockScrollViewer extends MockControl {
    constructor(public name?: string) { super(); }
  }

  class MockButton extends MockControl {
    constructor(public name?: string) { super(); }
    static CreateSimpleButton(name: string, text: string) {
      const btn = new MockButton(name);
      btn.text = text;
      return btn;
    }
  }

  class MockAdvancedDynamicTexture extends MockControl {
    static CreateFullscreenUI() { return new MockAdvancedDynamicTexture(); }
  }

  return {
    Rectangle: MockRectangle,
    TextBlock: MockTextBlock,
    StackPanel: MockStackPanel,
    ScrollViewer: MockScrollViewer,
    Button: MockButton,
    AdvancedDynamicTexture: MockAdvancedDynamicTexture,
    Control: {
      HORIZONTAL_ALIGNMENT_CENTER: 2,
      HORIZONTAL_ALIGNMENT_LEFT: 0,
      HORIZONTAL_ALIGNMENT_RIGHT: 1,
      VERTICAL_ALIGNMENT_CENTER: 2,
      VERTICAL_ALIGNMENT_TOP: 0,
      VERTICAL_ALIGNMENT_BOTTOM: 1,
    },
  };
});

import * as GUI from '@babylonjs/gui';
import {
  AssessmentResultsPanel,
  type AssessmentResults,
} from '../../client/src/components/3DGame/AssessmentResultsPanel';

function createMockTexture(): GUI.AdvancedDynamicTexture {
  return GUI.AdvancedDynamicTexture.CreateFullscreenUI('test') as unknown as GUI.AdvancedDynamicTexture;
}

function createSampleResults(): AssessmentResults {
  return {
    overallScorePct: 42,
    cefrLevel: 'A2',
    dimensions: [
      { name: 'Vocabulary', score: 3.2 },
      { name: 'Grammar', score: 2.1 },
      { name: 'Fluency', score: 2.8 },
      { name: 'Pronunciation', score: 3.5 },
      { name: 'Comprehension', score: 4.0 },
    ],
  };
}

describe('AssessmentResultsPanel', () => {
  let texture: GUI.AdvancedDynamicTexture;
  let panel: AssessmentResultsPanel;

  beforeEach(() => {
    texture = createMockTexture();
    panel = new AssessmentResultsPanel(texture);
  });

  it('starts hidden', () => {
    expect(panel.getIsVisible()).toBe(false);
  });

  it('shows when showResults is called with results', () => {
    panel.showResults(createSampleResults());
    expect(panel.getIsVisible()).toBe(true);
  });

  it('hides when hide is called', () => {
    panel.showResults(createSampleResults());
    panel.hide();
    expect(panel.getIsVisible()).toBe(false);
  });

  it('toggles visibility', () => {
    panel.showResults(createSampleResults());
    expect(panel.getIsVisible()).toBe(true);
    panel.toggle();
    expect(panel.getIsVisible()).toBe(false);
    panel.toggle();
    expect(panel.getIsVisible()).toBe(true);
  });

  it('show() does nothing without results', () => {
    panel.show();
    expect(panel.getIsVisible()).toBe(false);
  });

  it('calls onClose callback when close button is clicked', () => {
    const onClose = vi.fn();
    panel.setOnClose(onClose);
    panel.showResults(createSampleResults());

    // Find close button and trigger its callback
    const container = (texture as any).children[0];
    const mainLayout = container.children[0];
    const titleBar = mainLayout.children[0];
    const closeBtn = titleBar.children.find((c: any) => c.name === 'assessmentClose');
    expect(closeBtn).toBeDefined();
    closeBtn.onPointerUpObservable.add.mock.calls[0][0]();
    expect(onClose).toHaveBeenCalled();
    expect(panel.getIsVisible()).toBe(false);
  });

  it('calls onAdventureStart callback when CTA button is clicked', () => {
    const onStart = vi.fn();
    panel.setOnAdventureStart(onStart);
    panel.showResults(createSampleResults());

    // Find CTA button in scroll content
    const container = (texture as any).children[0];
    const mainLayout = container.children[0];
    const scrollViewer = mainLayout.children[1];
    const contentStack = scrollViewer.children[0];
    // CTA container is the last child
    const ctaContainer = contentStack.children[contentStack.children.length - 1];
    const ctaBtn = ctaContainer.children.find((c: any) => c.name === 'ctaButton');
    expect(ctaBtn).toBeDefined();
    expect(ctaBtn.text).toBe('Your adventure begins!');
    ctaBtn.onPointerUpObservable.add.mock.calls[0][0]();
    expect(onStart).toHaveBeenCalled();
    expect(panel.getIsVisible()).toBe(false);
  });

  it('displays correct overall score percentage', () => {
    panel.showResults(createSampleResults());
    const container = (texture as any).children[0];
    const mainLayout = container.children[0];
    const scrollViewer = mainLayout.children[1];
    const contentStack = scrollViewer.children[0];
    // First section is overall score
    const scoreSection = contentStack.children[0];
    const scoreValue = scoreSection.children.find((c: any) => c.name === 'overallScoreValue');
    expect(scoreValue.text).toBe('42%');
  });

  it('displays correct CEFR level badge', () => {
    panel.showResults(createSampleResults());
    const container = (texture as any).children[0];
    const mainLayout = container.children[0];
    const scrollViewer = mainLayout.children[1];
    const contentStack = scrollViewer.children[0];
    // Second section is CEFR badge
    const badgeSection = contentStack.children[1];
    const levelText = badgeSection.children.find((c: any) => c.name === 'cefrLevelText');
    // levelText is inside levelBadge rectangle
    const levelBadge = badgeSection.children.find((c: any) => c.name === 'cefrLevelBadge');
    const innerText = levelBadge.children[0];
    expect(innerText.text).toBe('A2');
  });

  it('creates 5 dimension bars', () => {
    panel.showResults(createSampleResults());
    const container = (texture as any).children[0];
    const mainLayout = container.children[0];
    const scrollViewer = mainLayout.children[1];
    const contentStack = scrollViewer.children[0];
    // Third section is dimensions
    const dimSection = contentStack.children[2];
    // Section has: label + 5 bar containers
    const dimBars = dimSection.children.filter((c: any) => c.name?.startsWith('dim_'));
    expect(dimBars).toHaveLength(5);
  });

  it('handles all CEFR levels', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2'] as const) {
      const results = createSampleResults();
      results.cefrLevel = level;
      panel.showResults(results);
      expect(panel.getIsVisible()).toBe(true);
      panel.hide();
    }
  });

  it('clamps dimension scores for color coding', () => {
    const results = createSampleResults();
    results.dimensions = [
      { name: 'Test', score: 0.5 }, // Below 1, should clamp to 1
      { name: 'Test2', score: 5.5 }, // Above 5, should clamp to 5
    ];
    // Should not throw
    panel.showResults(results);
    expect(panel.getIsVisible()).toBe(true);
  });

  it('dispose cleans up container', () => {
    panel.dispose();
    // After dispose, show should be a no-op
    panel.show();
    expect(panel.getIsVisible()).toBe(false);
  });

  it('refreshes content on repeated showResults calls', () => {
    panel.showResults(createSampleResults());
    const results2: AssessmentResults = {
      overallScorePct: 85,
      cefrLevel: 'B2',
      dimensions: [
        { name: 'Vocabulary', score: 4.5 },
        { name: 'Grammar', score: 4.0 },
        { name: 'Fluency', score: 4.2 },
        { name: 'Pronunciation', score: 3.8 },
        { name: 'Comprehension', score: 4.7 },
      ],
    };
    panel.showResults(results2);
    expect(panel.getIsVisible()).toBe(true);

    // Verify updated score
    const container = (texture as any).children[0];
    const mainLayout = container.children[0];
    const scrollViewer = mainLayout.children[1];
    const contentStack = scrollViewer.children[0];
    const scoreSection = contentStack.children[0];
    const scoreValue = scoreSection.children.find((c: any) => c.name === 'overallScoreValue');
    expect(scoreValue.text).toBe('85%');
  });
});
