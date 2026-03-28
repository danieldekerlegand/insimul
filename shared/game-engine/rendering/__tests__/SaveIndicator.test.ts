import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SaveIndicator } from '../SaveIndicator';

// Mock @babylonjs/gui
vi.mock('@babylonjs/gui', () => {
  const Control = {
    HORIZONTAL_ALIGNMENT_LEFT: 0,
    HORIZONTAL_ALIGNMENT_CENTER: 1,
    HORIZONTAL_ALIGNMENT_RIGHT: 2,
    VERTICAL_ALIGNMENT_TOP: 0,
    VERTICAL_ALIGNMENT_CENTER: 1,
    VERTICAL_ALIGNMENT_BOTTOM: 2,
  };

  class MockControl {
    width: string = '';
    height: string = '';
    color: string = '';
    background: string = '';
    thickness: number = 0;
    cornerRadius: number = 0;
    horizontalAlignment: number = 0;
    verticalAlignment: number = 0;
    textHorizontalAlignment: number = 0;
    textVerticalAlignment: number = 0;
    left: string = '';
    top: string = '';
    alpha: number = 1;
    isVisible: boolean = true;
    isVertical: boolean = true;
    text: string = '';
    fontSize: number = 14;
    name: string;
    children: MockControl[] = [];
    constructor(name?: string) {
      this.name = name || '';
    }
    addControl(child: MockControl) {
      this.children.push(child);
    }
  }

  class Rectangle extends MockControl {}
  class StackPanel extends MockControl {}
  class TextBlock extends MockControl {
    constructor(name?: string, text?: string) {
      super(name);
      if (text) this.text = text;
    }
  }

  class AdvancedDynamicTexture {
    controls: MockControl[] = [];
    addControl(control: MockControl) {
      this.controls.push(control);
    }
    removeControl(control: MockControl) {
      const idx = this.controls.indexOf(control);
      if (idx >= 0) this.controls.splice(idx, 1);
    }
  }

  return { Control, Rectangle, StackPanel, TextBlock, AdvancedDynamicTexture };
});

import { AdvancedDynamicTexture } from '@babylonjs/gui';

describe('SaveIndicator', () => {
  let texture: AdvancedDynamicTexture;
  let indicator: SaveIndicator;

  beforeEach(() => {
    vi.useFakeTimers();
    texture = new AdvancedDynamicTexture();
    indicator = new SaveIndicator(texture);
  });

  afterEach(() => {
    indicator.dispose();
    vi.useRealTimers();
  });

  it('starts hidden', () => {
    expect(indicator.isVisible).toBe(false);
  });

  it('adds container to texture on construction', () => {
    expect((texture as any).controls.length).toBe(1);
  });

  it('shows saving state', () => {
    indicator.showSaving();
    expect(indicator.isVisible).toBe(true);
  });

  it('shows saved result', () => {
    indicator.showResult(true);
    expect(indicator.isVisible).toBe(true);
  });

  it('shows failure result', () => {
    indicator.showResult(false);
    expect(indicator.isVisible).toBe(true);
  });

  it('fades out after showing result', () => {
    indicator.showResult(true);
    expect(indicator.isVisible).toBe(true);

    // Advance past the 1s hold + 2s fade
    vi.advanceTimersByTime(3100);
    expect(indicator.isVisible).toBe(false);
  });

  it('cancels fade when showSaving is called during fade', () => {
    indicator.showResult(true);
    // Start fading
    vi.advanceTimersByTime(1500);
    expect(indicator.isVisible).toBe(true);

    // Interrupt with new save
    indicator.showSaving();
    // Advance past original fade period
    vi.advanceTimersByTime(3000);
    // Should still be visible because showSaving reset the fade
    expect(indicator.isVisible).toBe(true);
  });

  it('removes container from texture on dispose', () => {
    indicator.dispose();
    expect((texture as any).controls.length).toBe(0);
  });

  it('integrates with WorldStateManager callbacks', async () => {
    // Simulate the callback flow: onStart → onEnd
    indicator.showSaving();
    expect(indicator.isVisible).toBe(true);

    indicator.showResult(true);
    expect(indicator.isVisible).toBe(true);

    vi.advanceTimersByTime(3100);
    expect(indicator.isVisible).toBe(false);
  });

  it('showResult(false) stays visible until fade completes', () => {
    indicator.showResult(false);
    expect(indicator.isVisible).toBe(true);

    vi.advanceTimersByTime(500);
    expect(indicator.isVisible).toBe(true);

    vi.advanceTimersByTime(2700);
    expect(indicator.isVisible).toBe(false);
  });
});
