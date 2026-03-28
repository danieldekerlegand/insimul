import { describe, it, expect, vi, beforeEach } from 'vitest';

// Patch Babylon.js GUI imports — factory must be self-contained (hoisted)
vi.mock('@babylonjs/gui', () => {
  class MockControl {
    name = '';
    width: any = 0;
    height: any = 0;
    thickness = 0;
    background = '';
    color = '';
    fontSize = 0;
    fontWeight = '';
    zIndex = 0;
    cornerRadius = 0;
    paddingBottom = '';
    paddingLeft = '';
    left = '';
    isVertical = true;
    textWrapping: any = 0;
    textHorizontalAlignment: any = 0;
    verticalAlignment: any = 0;
    horizontalAlignment: any = 0;
    barColor = '';
    barBackground = '';
    children: MockControl[] = [];
    onPointerClickObservable = { add: vi.fn() };
    onPointerEnterObservable = { add: vi.fn() };
    onPointerOutObservable = { add: vi.fn() };
    addControl(c: any) { this.children.push(c); }
    removeControl(c: any) {
      const idx = this.children.indexOf(c);
      if (idx >= 0) this.children.splice(idx, 1);
    }
    clearControls() { this.children = []; }
  }

  return {
    AdvancedDynamicTexture: { CreateFullscreenUI: vi.fn() },
    Button: {
      CreateSimpleButton: (_name: string, _text: string) => {
        const btn = new MockControl();
        btn.name = _name;
        return btn;
      },
    },
    Control: {
      VERTICAL_ALIGNMENT_CENTER: 1,
      HORIZONTAL_ALIGNMENT_CENTER: 1,
      HORIZONTAL_ALIGNMENT_LEFT: 0,
    },
    Rectangle: class extends MockControl {
      constructor(name?: string) { super(); this.name = name || ''; }
    },
    StackPanel: class extends MockControl {
      constructor(name?: string) { super(); this.name = name || ''; }
    },
    TextBlock: class extends MockControl {
      text: string;
      constructor(name?: string, text?: string) { super(); this.name = name || ''; this.text = text || ''; }
    },
    TextWrapping: { Ellipsis: 1, WordWrap: 2 },
    ScrollViewer: class extends MockControl {
      constructor(name?: string) { super(); this.name = name || ''; }
    },
  };
});

import { MainMenuScreen, type MainMenuCallbacks, type PlaythroughInfo } from '../MainMenuScreen';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createMockTexture() {
  const controls: any[] = [];
  return {
    addControl: vi.fn((c: any) => controls.push(c)),
    removeControl: vi.fn((c: any) => {
      const idx = controls.indexOf(c);
      if (idx >= 0) controls.splice(idx, 1);
    }),
    _controls: controls,
  };
}

function makeCallbacks(overrides: Partial<MainMenuCallbacks> = {}): MainMenuCallbacks {
  return {
    getPlaythroughs: vi.fn().mockResolvedValue([]),
    onNewGame: vi.fn().mockResolvedValue('new-pt-id'),
    onContinue: vi.fn(),
    onLoadGame: vi.fn(),
    onBack: vi.fn(),
    ...overrides,
  };
}

const samplePlaythroughs: PlaythroughInfo[] = [
  {
    id: 'pt-1',
    name: 'First Run',
    status: 'active',
    createdAt: '2026-03-01T12:00:00Z',
    lastPlayedAt: '2026-03-18T10:00:00Z',
    playtime: 3600,
  },
  {
    id: 'pt-2',
    name: 'Second Run',
    status: 'active',
    createdAt: '2026-03-10T08:00:00Z',
    lastPlayedAt: '2026-03-15T14:00:00Z',
    playtime: 1800,
  },
];

// ── Tests ────────────────────────────────────────────────────────────────────

describe('MainMenuScreen', () => {
  let texture: ReturnType<typeof createMockTexture>;
  let callbacks: MainMenuCallbacks;

  beforeEach(() => {
    texture = createMockTexture();
    callbacks = makeCallbacks();
  });

  it('starts closed', () => {
    const menu = new MainMenuScreen(texture as any, 'Test World', callbacks);
    expect(menu.isOpen).toBe(false);
  });

  it('opens and fetches playthroughs', async () => {
    const menu = new MainMenuScreen(texture as any, 'Test World', callbacks);
    await menu.show();
    expect(menu.isOpen).toBe(true);
    expect(callbacks.getPlaythroughs).toHaveBeenCalled();
    expect(texture.addControl).toHaveBeenCalled();
  });

  it('hides and removes overlay', async () => {
    const menu = new MainMenuScreen(texture as any, 'Test World', callbacks);
    await menu.show();
    expect(menu.isOpen).toBe(true);
    menu.hide();
    expect(menu.isOpen).toBe(false);
    expect(texture.removeControl).toHaveBeenCalled();
  });

  it('shows Continue and Load buttons when playthroughs exist', async () => {
    callbacks = makeCallbacks({
      getPlaythroughs: vi.fn().mockResolvedValue(samplePlaythroughs),
    });
    const menu = new MainMenuScreen(texture as any, 'Test World', callbacks);
    await menu.show();

    const overlay = texture._controls[0];
    const container = overlay.children[0];
    // title, subtitle, spacer, New Game, Continue, Load Game, spacer, Back = 8
    expect(container.children.length).toBe(8);
  });

  it('shows only New Game and Back when no playthroughs', async () => {
    const menu = new MainMenuScreen(texture as any, 'Test World', callbacks);
    await menu.show();

    const overlay = texture._controls[0];
    const container = overlay.children[0];
    // title, subtitle, spacer, New Game, spacer, Back = 6
    expect(container.children.length).toBe(6);
  });

  it('dispose cleans up', async () => {
    const menu = new MainMenuScreen(texture as any, 'Test World', callbacks);
    await menu.show();
    menu.dispose();
    expect(menu.isOpen).toBe(false);
  });

  it('handles getPlaythroughs failure gracefully', async () => {
    callbacks = makeCallbacks({
      getPlaythroughs: vi.fn().mockRejectedValue(new Error('Network error')),
    });
    const menu = new MainMenuScreen(texture as any, 'Test World', callbacks);
    await menu.show();
    expect(menu.isOpen).toBe(true);
    const overlay = texture._controls[0];
    const container = overlay.children[0];
    // title, subtitle, spacer, New Game, spacer, Back = 6
    expect(container.children.length).toBe(6);
  });

  describe('button interactions', () => {
    it('New Game calls onNewGame then onContinue with new ID', async () => {
      const menu = new MainMenuScreen(texture as any, 'Test World', callbacks);
      await menu.show();

      const overlay = texture._controls[0];
      const container = overlay.children[0];
      // New Game card at index 3
      const newGameCard = container.children[3];
      const clickHandler = newGameCard.onPointerClickObservable.add.mock.calls[0]?.[0];
      expect(clickHandler).toBeDefined();

      await clickHandler();
      expect(callbacks.onNewGame).toHaveBeenCalled();
      expect(callbacks.onContinue).toHaveBeenCalledWith('new-pt-id');
    });

    it('Back calls onBack', async () => {
      const menu = new MainMenuScreen(texture as any, 'Test World', callbacks);
      await menu.show();

      const overlay = texture._controls[0];
      const container = overlay.children[0];
      // Back is last: index 5
      const backCard = container.children[5];
      const clickHandler = backCard.onPointerClickObservable.add.mock.calls[0]?.[0];
      expect(clickHandler).toBeDefined();

      clickHandler();
      expect(callbacks.onBack).toHaveBeenCalled();
      expect(menu.isOpen).toBe(false);
    });

    it('Continue calls onContinue with most recent playthrough', async () => {
      callbacks = makeCallbacks({
        getPlaythroughs: vi.fn().mockResolvedValue(samplePlaythroughs),
      });
      const menu = new MainMenuScreen(texture as any, 'Test World', callbacks);
      await menu.show();

      const overlay = texture._controls[0];
      const container = overlay.children[0];
      // Continue at index 4
      const continueCard = container.children[4];
      const clickHandler = continueCard.onPointerClickObservable.add.mock.calls[0]?.[0];
      expect(clickHandler).toBeDefined();

      clickHandler();
      // pt-1 has the most recent lastPlayedAt
      expect(callbacks.onContinue).toHaveBeenCalledWith('pt-1');
      expect(menu.isOpen).toBe(false);
    });

    it('Load Game switches to load view', async () => {
      callbacks = makeCallbacks({
        getPlaythroughs: vi.fn().mockResolvedValue(samplePlaythroughs),
      });
      const menu = new MainMenuScreen(texture as any, 'Test World', callbacks);
      await menu.show();

      const overlay = texture._controls[0];
      const container = overlay.children[0];
      // Load Game at index 5
      const loadCard = container.children[5];
      const clickHandler = loadCard.onPointerClickObservable.add.mock.calls[0]?.[0];
      expect(clickHandler).toBeDefined();

      clickHandler();
      // Should rebuild with load view
      expect(texture.addControl.mock.calls.length).toBeGreaterThan(1);
    });
  });
});
