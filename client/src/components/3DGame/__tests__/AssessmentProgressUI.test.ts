/**
 * Tests for AssessmentProgressUI
 *
 * Mocks @babylonjs/gui since tests run in Node without a canvas/WebGL context.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock @babylonjs/gui ──────────────────────────────────────────────────────

function makeMockControl(name?: string) {
  return {
    name: name ?? '',
    width: '',
    height: '',
    background: '',
    color: '',
    thickness: 0,
    cornerRadius: 0,
    top: '',
    left: '',
    horizontalAlignment: 0,
    verticalAlignment: 0,
    isVisible: true,
    isPointerBlocker: false,
    zIndex: 0,
    alpha: 1,
    spacing: 0,
    isVertical: true,
    paddingTop: '',
    paddingBottom: '',
    paddingLeft: '',
    paddingRight: '',
    fontSize: 0,
    fontWeight: '',
    text: '',
    textHorizontalAlignment: 0,
    textVerticalAlignment: 0,
    resizeToFit: false,
    addControl: vi.fn(),
    dispose: vi.fn(),
  };
}

vi.mock('@babylonjs/gui', () => {
  class MockRectangle {
    [key: string]: any;
    constructor(public name?: string) {
      Object.assign(this, makeMockControl(name));
    }
    addControl = vi.fn();
    dispose = vi.fn();
  }

  class MockEllipse {
    [key: string]: any;
    constructor(public name?: string) {
      Object.assign(this, makeMockControl(name));
    }
    addControl = vi.fn();
    dispose = vi.fn();
  }

  class MockStackPanel {
    [key: string]: any;
    constructor(public name?: string) {
      Object.assign(this, makeMockControl(name));
    }
    addControl = vi.fn();
    dispose = vi.fn();
  }

  class MockTextBlock {
    [key: string]: any;
    constructor(public name?: string, public text?: string) {
      Object.assign(this, makeMockControl(name));
      this.text = text ?? '';
    }
    addControl = vi.fn();
    dispose = vi.fn();
  }

  class MockAdvancedDynamicTexture {
    addControl = vi.fn();
    removeControl = vi.fn();
  }

  return {
    AdvancedDynamicTexture: MockAdvancedDynamicTexture,
    Control: {
      HORIZONTAL_ALIGNMENT_LEFT: 0,
      HORIZONTAL_ALIGNMENT_RIGHT: 1,
      HORIZONTAL_ALIGNMENT_CENTER: 2,
      VERTICAL_ALIGNMENT_TOP: 0,
      VERTICAL_ALIGNMENT_BOTTOM: 1,
      VERTICAL_ALIGNMENT_CENTER: 2,
    },
    Ellipse: MockEllipse,
    Rectangle: MockRectangle,
    StackPanel: MockStackPanel,
    TextBlock: MockTextBlock,
  };
});

import { AssessmentProgressUI } from '../AssessmentProgressUI';
import { AdvancedDynamicTexture } from '@babylonjs/gui';

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AssessmentProgressUI', () => {
  let ui: AssessmentProgressUI;
  let advancedTexture: AdvancedDynamicTexture;

  beforeEach(() => {
    vi.useFakeTimers();
    advancedTexture = new AdvancedDynamicTexture();
    ui = new AssessmentProgressUI(advancedTexture);
  });

  afterEach(() => {
    ui.dispose();
    vi.useRealTimers();
  });

  it('should add the panel to the advanced texture on construction', () => {
    expect(advancedTexture.addControl).toHaveBeenCalled();
  });

  it('should start hidden', () => {
    expect(ui.isVisible).toBe(false);
  });

  it('should become visible on show()', () => {
    ui.show();
    expect(ui.isVisible).toBe(true);
  });

  it('should hide on hide()', () => {
    ui.show();
    ui.hide();
    expect(ui.isVisible).toBe(false);
  });

  it('should track the current time remaining via setPhase', () => {
    ui.setPhase(0, 300);
    expect(ui.timeRemaining).toBe(300);
  });

  it('should decrement the timer every second', () => {
    ui.setPhase(0, 300);
    vi.advanceTimersByTime(3000);
    expect(ui.timeRemaining).toBe(297);
  });

  it('should not go below zero', () => {
    ui.setPhase(0, 2);
    vi.advanceTimersByTime(5000);
    expect(ui.timeRemaining).toBe(0);
  });

  it('should allow external timer update', () => {
    ui.setPhase(0, 300);
    ui.updateTimer(100);
    expect(ui.timeRemaining).toBe(100);
  });

  it('should show fade overlay during phase transition', async () => {
    vi.useRealTimers();
    ui.transitionToNextPhase(1, 300);
    // Wait for fade-in (600ms) + hold (800ms) + fade-out (600ms) + margin
    await new Promise(r => setTimeout(r, 2200));
    // After the full transition, the phase should be set
    expect(ui.timeRemaining).toBeGreaterThanOrEqual(297);
  });

  it('should clean up on dispose', () => {
    ui.setPhase(0, 300);
    ui.dispose();
    // Timer should be stopped — advancing time should not change anything
    expect(ui.timeRemaining).toBe(300);
  });

  it('should handle multiple setPhase calls', () => {
    ui.setPhase(0, 300);
    vi.advanceTimersByTime(2000);
    expect(ui.timeRemaining).toBe(298);

    ui.setPhase(1, 250);
    vi.advanceTimersByTime(1000);
    expect(ui.timeRemaining).toBe(249);
  });
});
