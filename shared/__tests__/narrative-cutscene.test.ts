import { describe, it, expect, vi, beforeAll } from 'vitest';
import { NarrativeBeatDispatcher, NarrativeCutscenePanel } from '../game-engine/rendering/NarrativeCutscenePanel';
import type { PendingNarrativeBeat, NarrativeBeat } from '../quest/main-quest-chapters';

// Stub browser APIs not available in Node
beforeAll(() => {
  (globalThis as any).requestAnimationFrame = (cb: () => void) => setTimeout(cb, 0);
});

// Mock Babylon.js GUI since we can't import it in tests
vi.mock('@babylonjs/gui', () => {
  class MockControl {
    addControl() {}
    removeControl() {}
    width = ''; height = ''; background = ''; thickness = 0;
    cornerRadius = 0; color = ''; zIndex = 0; alpha = 1;
    horizontalAlignment = 0; verticalAlignment = 0;
    isVertical = true; adaptHeight = true; spacing = 0;
    adaptWidth = true; paddingTop = ''; paddingLeft = '';
    paddingBottom = ''; text = ''; fontSize = 0; fontWeight = '';
    textHorizontalAlignment = 0; fontFamily = '';
    lineSpacing = ''; textWrapping = 0; resizeToFit = false;
    left = '';
    onPointerClickObservable = { add: () => {} };
  }
  return {
    AdvancedDynamicTexture: MockControl,
    Rectangle: MockControl,
    StackPanel: MockControl,
    TextBlock: MockControl,
    Button: {
      CreateSimpleButton: () => new MockControl(),
    },
    Control: {
      HORIZONTAL_ALIGNMENT_CENTER: 0,
      HORIZONTAL_ALIGNMENT_LEFT: 1,
      VERTICAL_ALIGNMENT_CENTER: 0,
      VERTICAL_ALIGNMENT_TOP: 1,
    },
    TextWrapping: { WordWrap: 1 },
  };
});

function makeMockPanel(): NarrativeCutscenePanel {
  const mockTexture = {
    addControl: vi.fn(),
    removeControl: vi.fn(),
  } as any;
  return new NarrativeCutscenePanel(mockTexture);
}

const SAMPLE_BEAT: PendingNarrativeBeat = {
  id: 'chapter_intro:ch1_assignment_abroad',
  type: 'chapter_intro',
  chapterId: 'ch1_assignment_abroad',
  chapterTitle: 'Assignment Abroad',
  text: 'The ferry docks in an unfamiliar harbor...',
};

describe('NarrativeCutscenePanel', () => {
  it('tracks delivered beats', () => {
    const panel = makeMockPanel();
    expect(panel.wasBeatDelivered(SAMPLE_BEAT.id)).toBe(false);
    panel.recordBeatDelivered(SAMPLE_BEAT);
    expect(panel.wasBeatDelivered(SAMPLE_BEAT.id)).toBe(true);
  });

  it('serializes and restores delivered beats', () => {
    const panel = makeMockPanel();
    panel.recordBeatDelivered(SAMPLE_BEAT);
    const beats = panel.getDeliveredBeats();
    expect(beats).toHaveLength(1);
    expect(beats[0].id).toBe(SAMPLE_BEAT.id);
    expect(beats[0].type).toBe('chapter_intro');
    expect(beats[0].chapterId).toBe('ch1_assignment_abroad');

    const panel2 = makeMockPanel();
    panel2.restoreDeliveredBeats(beats);
    expect(panel2.wasBeatDelivered(SAMPLE_BEAT.id)).toBe(true);
  });

  it('starts not visible', () => {
    const panel = makeMockPanel();
    expect(panel.visible).toBe(false);
  });
});

describe('NarrativeBeatDispatcher', () => {
  it('skips already-delivered beats', () => {
    const panel = makeMockPanel();
    panel.recordBeatDelivered(SAMPLE_BEAT);
    const dispatcher = new NarrativeBeatDispatcher(panel);
    // This should not show since beat was already delivered
    dispatcher.queueBeat(SAMPLE_BEAT);
    // Panel should still not be visible (no new delivery)
    expect(panel.visible).toBe(false);
  });

  it('queues chapter transitions', () => {
    const panel = makeMockPanel();
    const dispatcher = new NarrativeBeatDispatcher(panel);

    const outroBeat: PendingNarrativeBeat = {
      id: 'chapter_outro:ch1_assignment_abroad',
      type: 'chapter_outro',
      chapterId: 'ch1_assignment_abroad',
      chapterTitle: 'Assignment Abroad',
      text: 'The editor regards you with cautious respect...',
    };

    const introBeat: PendingNarrativeBeat = {
      id: 'chapter_intro:ch2_following_the_trail',
      type: 'chapter_intro',
      chapterId: 'ch2_following_the_trail',
      chapterTitle: 'Following the Trail',
      text: 'The editor hands you a faded photograph...',
    };

    dispatcher.queueChapterTransition(outroBeat, introBeat);
    // After delivery, beats should be recorded
    expect(panel.wasBeatDelivered(outroBeat.id)).toBe(true);
  });
});
