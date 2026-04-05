import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @babylonjs/gui before importing the panel
vi.mock('@babylonjs/gui', () => {
  class MockControl {
    static HORIZONTAL_ALIGNMENT_LEFT = 0;
    static HORIZONTAL_ALIGNMENT_RIGHT = 1;
    static VERTICAL_ALIGNMENT_TOP = 0;
    static VERTICAL_ALIGNMENT_CENTER = 1;
  }
  class MockRectangle {
    width = '';
    height = '';
    horizontalAlignment = 0;
    verticalAlignment = 0;
    left = '';
    top = '';
    background = '';
    color = '';
    thickness = 0;
    cornerRadius = 0;
    isVisible = true;
    isPointerBlocker = false;
    paddingLeft = '';
    paddingRight = '';
    paddingTop = '';
    paddingBottom = '';
    barSize = 0;
    barColor = '';
    thumbLength = 0;
    adaptHeight = false;
    isVertical = false;
    rotation = 0;
    fontStyle = '';
    addControl = vi.fn();
    removeControl = vi.fn();
    dispose = vi.fn();
  }
  class MockTextBlock {
    text = '';
    color = '';
    fontSize = 12;
    fontStyle = '';
    textHorizontalAlignment = 0;
    textWrapping = 0;
    resizeToFit = false;
    width = '';
    paddingLeft = '';
    paddingRight = '';
    paddingTop = '';
    paddingBottom = '';
    dispose = vi.fn();
  }
  class MockStackPanel extends MockRectangle {}
  class MockScrollViewer extends MockRectangle {
    verticalBar = { value: 0 };
  }
  class MockButton extends MockRectangle {
    onPointerClickObservable = { add: vi.fn() };
    static CreateSimpleButton = (_name: string, _text: string) => new MockButton();
  }
  return {
    Control: MockControl,
    Rectangle: MockRectangle,
    TextBlock: MockTextBlock,
    StackPanel: MockStackPanel,
    ScrollViewer: MockScrollViewer,
    Button: MockButton,
    TextWrapping: { WordWrap: 1 },
  };
});

import { BabylonEavesdropPanel, type EavesdropLine } from '../game-engine/rendering/BabylonEavesdropPanel';

// ── Helpers ────────────────────────────────────────────────────────────────

function createMockGui() {
  return {
    addControl: vi.fn(),
    removeControl: vi.fn(),
  } as any;
}

function createMockScene() {
  return {} as any;
}

function createMockEventBus() {
  return {
    emit: vi.fn(),
    on: vi.fn(() => () => {}),
    onAny: vi.fn(() => () => {}),
    dispose: vi.fn(),
  };
}

function createMockDataSource() {
  return {
    textToSpeech: vi.fn().mockResolvedValue(null),
  } as any;
}

function createMockHoverTranslation() {
  return {
    tokenize: vi.fn((text: string) =>
      text.split(/\s+/).map(word => ({ text: word, isWord: true }))
    ),
    recordWordEncounter: vi.fn(),
    getTranslation: vi.fn().mockReturnValue(null),
  } as any;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('BabylonEavesdropPanel', () => {
  let panel: BabylonEavesdropPanel;
  let gui: any;
  let scene: any;
  let eventBus: ReturnType<typeof createMockEventBus>;

  beforeEach(() => {
    vi.useFakeTimers();
    gui = createMockGui();
    scene = createMockScene();
    panel = new BabylonEavesdropPanel(scene, gui);
    eventBus = createMockEventBus();
    panel.setGameEventBus(eventBus as any);
  });

  describe('show/hide lifecycle', () => {
    it('starts hidden', () => {
      expect(panel.isVisible).toBe(false);
    });

    it('becomes visible on show()', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      expect(panel.isVisible).toBe(true);
    });

    it('hides on hide()', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      panel.hide();
      expect(panel.isVisible).toBe(false);
    });

    it('hide() is idempotent when already hidden', () => {
      panel.hide();
      expect(panel.isVisible).toBe(false);
    });
  });

  describe('addLine', () => {
    it('accepts an eavesdrop line', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      const line: EavesdropLine = {
        speaker: 'Alice',
        speakerId: 'npc1',
        text: 'Bonjour!',
        lineIndex: 0,
      };
      // Should not throw
      panel.addLine(line);
    });

    it('processes multiple lines without errors', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      for (let i = 0; i < 5; i++) {
        panel.addLine({
          speaker: i % 2 === 0 ? 'Alice' : 'Bob',
          speakerId: i % 2 === 0 ? 'npc1' : 'npc2',
          text: `Line ${i}`,
          lineIndex: i,
        });
      }
    });
  });

  describe('system messages', () => {
    it('adds system lines', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      // Should not throw
      panel.addSystemLine('The conversation has ended.');
    });
  });

  describe('quest integration — eavesdrop_completed events', () => {
    it('emits conversation_overheard on hide()', () => {
      panel.setTargetLanguage('French');
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      panel.hide();

      expect(eventBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'conversation_overheard',
          npcId1: 'npc1',
          npcId2: 'npc2',
          languageUsed: 'French',
        })
      );
    });

    it('emits ambient_conversation_ended on hide()', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      panel.hide();

      expect(eventBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ambient_conversation_ended',
          participants: ['npc1', 'npc2'],
        })
      );
    });

    it('does not emit when hidden without show()', () => {
      panel.hide();
      expect(eventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe('rate limiting', () => {
    it('emits only once per NPC pair per session', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      panel.hide();

      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      panel.hide();

      // conversation_overheard should be emitted exactly once
      const overheardCalls = (eventBus.emit as any).mock.calls.filter(
        (call: any) => call[0].type === 'conversation_overheard'
      );
      expect(overheardCalls).toHaveLength(1);
    });

    it('emits separately for different NPC pairs', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      panel.hide();

      panel.show('npc3', 'npc4', 'Charlie', 'Diana');
      panel.hide();

      const overheardCalls = (eventBus.emit as any).mock.calls.filter(
        (call: any) => call[0].type === 'conversation_overheard'
      );
      expect(overheardCalls).toHaveLength(2);
    });

    it('rate limit is order-independent (npc1:npc2 === npc2:npc1)', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      panel.hide();

      panel.show('npc2', 'npc1', 'Bob', 'Alice');
      panel.hide();

      const overheardCalls = (eventBus.emit as any).mock.calls.filter(
        (call: any) => call[0].type === 'conversation_overheard'
      );
      expect(overheardCalls).toHaveLength(1);
    });

    it('hasEmittedForPair returns correct state', () => {
      expect(panel.hasEmittedForPair('npc1', 'npc2')).toBe(false);
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      panel.hide();
      expect(panel.hasEmittedForPair('npc1', 'npc2')).toBe(true);
      expect(panel.hasEmittedForPair('npc2', 'npc1')).toBe(true);
    });

    it('resetRateLimits clears emitted pairs', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      panel.hide();
      expect(panel.hasEmittedForPair('npc1', 'npc2')).toBe(true);

      panel.resetRateLimits();
      expect(panel.hasEmittedForPair('npc1', 'npc2')).toBe(false);
    });
  });

  describe('vocabulary learning', () => {
    it('records word encounters via HoverTranslationSystem', () => {
      const hoverTranslation = createMockHoverTranslation();
      panel.setHoverTranslationSystem(hoverTranslation);
      panel.setTargetLanguage('French');
      panel.show('npc1', 'npc2', 'Alice', 'Bob');

      panel.addLine({
        speaker: 'Alice',
        speakerId: 'npc1',
        text: 'Bonjour comment allez-vous',
        lineIndex: 0,
      });

      expect(hoverTranslation.tokenize).toHaveBeenCalledWith('Bonjour comment allez-vous');
      expect(hoverTranslation.recordWordEncounter).toHaveBeenCalledTimes(3);
    });

    it('emits vocabulary_overheard events when translations are available', () => {
      const hoverTranslation = createMockHoverTranslation();
      hoverTranslation.getTranslation.mockReturnValue({ translation: 'hello' });
      panel.setHoverTranslationSystem(hoverTranslation);
      panel.setTargetLanguage('French');
      panel.show('npc1', 'npc2', 'Alice', 'Bob');

      panel.addLine({
        speaker: 'Alice',
        speakerId: 'npc1',
        text: 'Bonjour',
        lineIndex: 0,
      });

      expect(eventBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'vocabulary_overheard',
          word: 'Bonjour',
          translation: 'hello',
          language: 'French',
        })
      );
    });

    it('skips vocabulary recording without HoverTranslationSystem', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      // Should not throw
      panel.addLine({
        speaker: 'Alice',
        speakerId: 'npc1',
        text: 'Bonjour',
        lineIndex: 0,
      });
    });
  });

  describe('distance-scaled TTS', () => {
    it('calls textToSpeech when data source is available', () => {
      const ds = createMockDataSource();
      panel.setDataSource(ds);
      panel.setTargetLanguage('French');
      panel.setPlayerDistance(5);
      panel.show('npc1', 'npc2', 'Alice', 'Bob');

      panel.addLine({
        speaker: 'Alice',
        speakerId: 'npc1',
        text: 'Bonjour!',
        lineIndex: 0,
      });

      expect(ds.textToSpeech).toHaveBeenCalledWith('Bonjour!', 'Kore', 'female', 'French');
    });

    it('skips TTS when too far away (>15 units)', () => {
      const ds = createMockDataSource();
      panel.setDataSource(ds);
      panel.setTargetLanguage('French');
      panel.setPlayerDistance(16);
      panel.show('npc1', 'npc2', 'Alice', 'Bob');

      panel.addLine({
        speaker: 'Alice',
        speakerId: 'npc1',
        text: 'Bonjour!',
        lineIndex: 0,
      });

      expect(ds.textToSpeech).not.toHaveBeenCalled();
    });

    it('skips TTS when disabled', () => {
      const ds = createMockDataSource();
      panel.setDataSource(ds);
      panel.setTargetLanguage('French');
      panel.setTTSEnabled(false);
      panel.setPlayerDistance(5);
      panel.show('npc1', 'npc2', 'Alice', 'Bob');

      panel.addLine({
        speaker: 'Alice',
        speakerId: 'npc1',
        text: 'Bonjour!',
        lineIndex: 0,
      });

      expect(ds.textToSpeech).not.toHaveBeenCalled();
    });

    it('uses different voices for speaker 1 vs speaker 2', () => {
      const ds = createMockDataSource();
      panel.setDataSource(ds);
      panel.setTargetLanguage('French');
      panel.setPlayerDistance(5);
      panel.show('npc1', 'npc2', 'Alice', 'Bob');

      panel.addLine({ speaker: 'Alice', speakerId: 'npc1', text: 'Bonjour!', lineIndex: 0 });
      panel.addLine({ speaker: 'Bob', speakerId: 'npc2', text: 'Salut!', lineIndex: 1 });

      expect(ds.textToSpeech).toHaveBeenCalledWith('Bonjour!', 'Kore', 'female', 'French');
      expect(ds.textToSpeech).toHaveBeenCalledWith('Salut!', 'Charon', 'male', 'French');
    });
  });

  describe('typewriter effect', () => {
    it('starts typewriter on addLine', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');
      panel.addLine({
        speaker: 'Alice',
        speakerId: 'npc1',
        text: 'Hello world',
        lineIndex: 0,
      });

      // Advance partial typewriter
      vi.advanceTimersByTime(100);
      // Should not throw — typewriter in progress
    });

    it('queues lines and processes them sequentially', () => {
      panel.show('npc1', 'npc2', 'Alice', 'Bob');

      // Add two lines rapidly
      panel.addLine({ speaker: 'Alice', speakerId: 'npc1', text: 'Hi', lineIndex: 0 });
      panel.addLine({ speaker: 'Bob', speakerId: 'npc2', text: 'Hey', lineIndex: 1 });

      // First line: "Alice: Hi" = 9 chars × 25ms = 225ms
      vi.advanceTimersByTime(300);

      // Second line should start after first completes
      vi.advanceTimersByTime(300);
    });
  });

  describe('dispose', () => {
    it('cleans up GUI controls', () => {
      panel.dispose();
      // Should not throw on second dispose
      panel.dispose();
    });
  });

  describe('setPlayerDistance', () => {
    it('accepts distance values', () => {
      panel.setPlayerDistance(0);
      panel.setPlayerDistance(10);
      panel.setPlayerDistance(100);
    });
  });
});
