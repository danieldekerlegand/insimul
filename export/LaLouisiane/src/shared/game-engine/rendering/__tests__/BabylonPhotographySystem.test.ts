import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { PlayerPhoto, PhotoNounLabel } from '@shared/game-engine/types';

/**
 * We test the photography system's data-management layer (photo storage,
 * labels, favorites, captions) without requiring a real Babylon.js scene.
 *
 * The BabylonPhotographySystem class depends on Babylon Scene/Engine/Camera
 * for capture, so we import only the types and test the helper logic directly.
 * We also test the capture timeout/fallback logic using mocks.
 */

// ─── Photo data helpers ─────────────────────────────────────────────────────

function makePhoto(overrides: Partial<PlayerPhoto> = {}): PlayerPhoto {
  return {
    id: `photo_${Date.now()}_${Math.random()}`,
    imageData: 'data:image/png;base64,fake',
    thumbnail: 'data:image/jpeg;base64,fakethumb',
    takenAt: new Date().toISOString(),
    location: {
      settlementName: 'Test Town',
      position: { x: 0, y: 0, z: 0 },
    },
    labels: [],
    favorite: false,
    ...overrides,
  };
}

function makeLabel(overrides: Partial<PhotoNounLabel> = {}): PhotoNounLabel {
  return {
    id: `label_${Date.now()}`,
    name: 'Tree',
    category: 'nature',
    x: 0.5,
    y: 0.5,
    ...overrides,
  };
}

// ─── Unit tests for photo data management ───────────────────────────────────

describe('PlayerPhoto data management', () => {
  let photos: PlayerPhoto[];

  beforeEach(() => {
    photos = [];
  });

  it('stores photos and retrieves them', () => {
    const p1 = makePhoto({ id: 'p1' });
    const p2 = makePhoto({ id: 'p2' });
    photos.push(p1, p2);
    expect(photos).toHaveLength(2);
    expect(photos[0].id).toBe('p1');
    expect(photos[1].id).toBe('p2');
  });

  it('deletes a photo by id', () => {
    photos.push(makePhoto({ id: 'p1' }), makePhoto({ id: 'p2' }), makePhoto({ id: 'p3' }));
    photos = photos.filter(p => p.id !== 'p2');
    expect(photos).toHaveLength(2);
    expect(photos.find(p => p.id === 'p2')).toBeUndefined();
  });

  it('toggles favorite on a photo', () => {
    const photo = makePhoto({ id: 'p1', favorite: false });
    photos.push(photo);
    photo.favorite = !photo.favorite;
    expect(photo.favorite).toBe(true);
    photo.favorite = !photo.favorite;
    expect(photo.favorite).toBe(false);
  });

  it('updates caption on a photo', () => {
    const photo = makePhoto({ id: 'p1' });
    expect(photo.caption).toBeUndefined();
    photo.caption = 'A beautiful sunset';
    expect(photo.caption).toBe('A beautiful sunset');
  });

  it('enforces max photo limit', () => {
    const MAX = 50;
    for (let i = 0; i < MAX + 10; i++) {
      photos.push(makePhoto({ id: `p${i}` }));
    }
    photos = photos.slice(0, MAX);
    expect(photos).toHaveLength(MAX);
  });

  it('filters photos by favorites', () => {
    photos.push(
      makePhoto({ id: 'p1', favorite: true }),
      makePhoto({ id: 'p2', favorite: false }),
      makePhoto({ id: 'p3', favorite: true }),
    );
    const favorites = photos.filter(p => p.favorite);
    expect(favorites).toHaveLength(2);
  });

  it('filters photos by labeled/unlabeled', () => {
    photos.push(
      makePhoto({ id: 'p1', labels: [makeLabel()] }),
      makePhoto({ id: 'p2', labels: [] }),
      makePhoto({ id: 'p3', labels: [makeLabel(), makeLabel()] }),
    );
    const labeled = photos.filter(p => p.labels.length > 0);
    const unlabeled = photos.filter(p => p.labels.length === 0);
    expect(labeled).toHaveLength(2);
    expect(unlabeled).toHaveLength(1);
  });
});

describe('PhotoNounLabel management', () => {
  let photo: PlayerPhoto;

  beforeEach(() => {
    photo = makePhoto({ id: 'test_photo' });
  });

  it('adds labels to a photo', () => {
    const label = makeLabel({ id: 'lbl1', name: 'Oak Tree', category: 'nature' });
    photo.labels.push(label);
    expect(photo.labels).toHaveLength(1);
    expect(photo.labels[0].name).toBe('Oak Tree');
    expect(photo.labels[0].category).toBe('nature');
  });

  it('removes a label from a photo', () => {
    photo.labels.push(
      makeLabel({ id: 'lbl1' }),
      makeLabel({ id: 'lbl2' }),
      makeLabel({ id: 'lbl3' }),
    );
    photo.labels = photo.labels.filter(l => l.id !== 'lbl2');
    expect(photo.labels).toHaveLength(2);
    expect(photo.labels.find(l => l.id === 'lbl2')).toBeUndefined();
  });

  it('stores language learning data in labels', () => {
    const label = makeLabel({
      id: 'lbl1',
      name: 'House',
      targetWord: 'maison',
      targetLanguage: 'fr',
      pronunciation: 'mɛ.zɔ̃',
      category: 'building',
    });
    photo.labels.push(label);

    expect(photo.labels[0].targetWord).toBe('maison');
    expect(photo.labels[0].targetLanguage).toBe('fr');
    expect(photo.labels[0].pronunciation).toBe('mɛ.zɔ̃');
  });

  it('validates label positions are normalized 0-1', () => {
    const label = makeLabel({ x: 0.3, y: 0.7 });
    expect(label.x).toBeGreaterThanOrEqual(0);
    expect(label.x).toBeLessThanOrEqual(1);
    expect(label.y).toBeGreaterThanOrEqual(0);
    expect(label.y).toBeLessThanOrEqual(1);
  });

  it('supports multiple categories', () => {
    const categories = ['person', 'building', 'nature', 'item', 'animal'];
    for (const cat of categories) {
      photo.labels.push(makeLabel({ id: `lbl_${cat}`, category: cat }));
    }
    expect(photo.labels).toHaveLength(5);
    const uniqueCats = new Set(photo.labels.map(l => l.category));
    expect(uniqueCats.size).toBe(5);
  });
});

describe('Photo location tracking', () => {
  it('stores settlement info', () => {
    const photo = makePhoto({
      location: {
        settlementId: 'settlement_1',
        settlementName: 'Riverside',
        position: { x: 10, y: 0, z: 20 },
      },
    });
    expect(photo.location.settlementName).toBe('Riverside');
    expect(photo.location.position.x).toBe(10);
  });

  it('stores building info when inside', () => {
    const photo = makePhoto({
      location: {
        settlementName: 'Riverside',
        buildingId: 'building_1',
        buildingName: 'General Store',
        position: { x: 5, y: 1, z: 15 },
      },
    });
    expect(photo.location.buildingName).toBe('General Store');
  });

  it('handles photos with no settlement', () => {
    const photo = makePhoto({
      location: {
        position: { x: 100, y: 5, z: 200 },
      },
    });
    expect(photo.location.settlementName).toBeUndefined();
    expect(photo.location.position.x).toBe(100);
  });
});

describe('SavedPhotoBookState serialization', () => {
  it('serializes and deserializes photo book state', () => {
    const photos = [
      makePhoto({
        id: 'p1',
        labels: [makeLabel({ id: 'l1', name: 'Person', category: 'person', targetWord: 'persona' })],
        favorite: true,
        caption: 'Meeting at the square',
      }),
      makePhoto({ id: 'p2', labels: [] }),
    ];

    const savedState = { photos };
    const json = JSON.stringify(savedState);
    const restored = JSON.parse(json);

    expect(restored.photos).toHaveLength(2);
    expect(restored.photos[0].id).toBe('p1');
    expect(restored.photos[0].labels[0].targetWord).toBe('persona');
    expect(restored.photos[0].favorite).toBe(true);
    expect(restored.photos[0].caption).toBe('Meeting at the square');
    expect(restored.photos[1].labels).toHaveLength(0);
  });
});

// ─── Capture timeout / fallback / guard tests ─────────────────────────────────

/**
 * These tests exercise the captureScreenshotWithTimeout logic and capture
 * guards by mocking Babylon.js Tools and constructing a minimal
 * BabylonPhotographySystem with mock scene/engine/camera.
 */

// Mock @babylonjs/gui before importing the system
vi.mock('@babylonjs/gui', () => ({
  AdvancedDynamicTexture: class {},
  Rectangle: class {
    width = ''; height = ''; thickness = 0; background = '';
    zIndex = 0; isPointerBlocker = false; isVisible = true; color = '';
    cornerRadius = 0; top = ''; left = '';
    addControl() {}
  },
  TextBlock: class {
    text = ''; fontSize = 0; color = ''; verticalAlignment = 0;
    horizontalAlignment = 0; top = ''; left = ''; shadowColor = '';
    shadowBlur = 0;
  },
  Control: { VERTICAL_ALIGNMENT_BOTTOM: 1, VERTICAL_ALIGNMENT_TOP: 0, HORIZONTAL_ALIGNMENT_RIGHT: 1 },
}));

// Mock @babylonjs/core with controllable Tools
const mockCreateScreenshotAsync = vi.fn<() => Promise<string>>();
const mockCreateScreenshotUsingRenderTargetAsync = vi.fn<() => Promise<string>>();

vi.mock('@babylonjs/core', () => ({
  Scene: class {},
  Engine: class {},
  Camera: class {},
  Vector3: class {
    static Project() { return { x: 0, y: 0, z: 0 }; }
  },
  AbstractMesh: class {},
  Tools: {
    CreateScreenshotAsync: (...args: unknown[]) => mockCreateScreenshotAsync(),
    CreateScreenshotUsingRenderTargetAsync: (...args: unknown[]) => mockCreateScreenshotUsingRenderTargetAsync(),
  },
}));

// Must import after mocks
import { BabylonPhotographySystem, type PhotographyCallbacks } from '../BabylonPhotographySystem';

function makeMockScene() {
  return {
    getEngine: () => ({ getRenderWidth: () => 800, getRenderHeight: () => 600 }),
    activeCamera: {
      getTransformationMatrix: () => ({}),
      viewport: { toGlobal: () => ({}) },
    },
    getTransformMatrix: () => ({}),
  } as any;
}

function makeMockCallbacks(overrides: Partial<PhotographyCallbacks> = {}): PhotographyCallbacks {
  return {
    getPlayerPosition: () => ({ x: 0, y: 0, z: 0 }),
    getLocationInfo: () => ({ settlementName: 'Test Town' }),
    getVisibleSceneObjects: () => [],
    showToast: vi.fn(),
    onPhotoTaken: vi.fn(),
    ...overrides,
  };
}

function createSystem(cbOverrides: Partial<PhotographyCallbacks> = {}) {
  const scene = makeMockScene();
  const advancedTexture = { addControl: vi.fn() } as any;
  const callbacks = makeMockCallbacks(cbOverrides);
  const system = new BabylonPhotographySystem(scene, advancedTexture, callbacks);
  return { system, callbacks };
}

describe('BabylonPhotographySystem capture behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockCreateScreenshotAsync.mockReset();
    mockCreateScreenshotUsingRenderTargetAsync.mockReset();

    // Mock window.Image for createThumbnail
    (globalThis as any).window = {
      Image: class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_: string) {
          // Trigger onload synchronously for test predictability
          setTimeout(() => this.onload?.(), 0);
        }
      },
    };
    // Mock document.createElement for canvas thumbnail
    (globalThis as any).document = {
      createElement: () => ({
        width: 0, height: 0,
        getContext: () => ({
          drawImage: () => {},
        }),
        toDataURL: () => 'data:image/jpeg;base64,thumb',
      }),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as any).window;
    delete (globalThis as any).document;
  });

  it('returns null when viewfinder is not active', async () => {
    const { system } = createSystem();
    expect(system.active).toBe(false);
    const result = await system.capturePhoto();
    expect(result).toBeNull();
  });

  it('captures a photo successfully using primary method', async () => {
    const { system, callbacks } = createSystem();
    mockCreateScreenshotAsync.mockResolvedValue('data:image/png;base64,abc');

    system.toggleViewfinder();
    expect(system.active).toBe(true);

    const capturePromise = system.capturePhoto();
    // Advance timers to let the promise chain resolve
    await vi.advanceTimersByTimeAsync(100);
    const photo = await capturePromise;

    expect(photo).not.toBeNull();
    expect(photo!.imageData).toBe('data:image/png;base64,abc');
    expect(system.photoCount).toBe(1);
    expect(callbacks.onPhotoTaken).toHaveBeenCalledWith(photo);
  });

  it('falls back to render target when primary fails', async () => {
    const { system } = createSystem();
    mockCreateScreenshotAsync.mockRejectedValue(new Error('canvas not available'));
    mockCreateScreenshotUsingRenderTargetAsync.mockResolvedValue('data:image/png;base64,fallback');

    system.toggleViewfinder();
    const capturePromise = system.capturePhoto();
    await vi.advanceTimersByTimeAsync(100);
    const photo = await capturePromise;

    expect(photo).not.toBeNull();
    expect(photo!.imageData).toBe('data:image/png;base64,fallback');
    expect(mockCreateScreenshotUsingRenderTargetAsync).toHaveBeenCalled();
  });

  it('times out and shows error toast if capture takes too long', async () => {
    const { system, callbacks } = createSystem();
    // Never-resolving promise simulates a frozen GPU
    mockCreateScreenshotAsync.mockReturnValue(new Promise(() => {}));

    system.toggleViewfinder();
    const capturePromise = system.capturePhoto();

    // Advance past the 3-second timeout
    await vi.advanceTimersByTimeAsync(3500);
    const photo = await capturePromise;

    expect(photo).toBeNull();
    expect(callbacks.showToast).toHaveBeenCalledWith('Capture Failed', 'Could not take photo');
  });

  it('prevents double capture while one is in progress', async () => {
    const { system } = createSystem();
    // Slow-resolving promise
    let resolveCapture!: (v: string) => void;
    mockCreateScreenshotAsync.mockReturnValue(new Promise(r => { resolveCapture = r; }));

    system.toggleViewfinder();
    const first = system.capturePhoto();
    const second = await system.capturePhoto(); // should return null immediately
    expect(second).toBeNull();

    // Finish the first capture
    resolveCapture('data:image/png;base64,ok');
    await vi.advanceTimersByTimeAsync(100);
    const result = await first;
    expect(result).not.toBeNull();
  });

  it('shows toast when photo book is full', async () => {
    const { system, callbacks } = createSystem();
    // Fill up with 50 photos
    const fullPhotos = Array.from({ length: 50 }, (_, i) => makePhoto({ id: `p${i}` }));
    system.setPhotos(fullPhotos);
    expect(system.photoCount).toBe(50);

    system.toggleViewfinder();
    const result = await system.capturePhoto();
    expect(result).toBeNull();
    expect(callbacks.showToast).toHaveBeenCalledWith('Photo Book Full', 'Maximum 50 photos reached.');
  });

  it('restores viewfinder visibility after successful capture', async () => {
    const { system } = createSystem();
    mockCreateScreenshotAsync.mockResolvedValue('data:image/png;base64,ok');

    system.toggleViewfinder();
    const capturePromise = system.capturePhoto();
    await vi.advanceTimersByTimeAsync(100);
    await capturePromise;

    // Viewfinder should still be active (visible restored in finally block)
    expect(system.active).toBe(true);
  });

  it('restores viewfinder visibility after failed capture', async () => {
    const { system } = createSystem();
    mockCreateScreenshotAsync.mockRejectedValue(new Error('fail'));
    mockCreateScreenshotUsingRenderTargetAsync.mockRejectedValue(new Error('also fail'));

    system.toggleViewfinder();
    const capturePromise = system.capturePhoto();
    await vi.advanceTimersByTimeAsync(100);
    await capturePromise;

    // Viewfinder should still be active despite error
    expect(system.active).toBe(true);
  });

  it('generates photos with timestamps and location', async () => {
    const { system } = createSystem({
      getLocationInfo: () => ({
        settlementId: 's1',
        settlementName: 'Riverside',
        buildingId: 'b1',
        buildingName: 'Bakery',
      }),
      getPlayerPosition: () => ({ x: 10, y: 2, z: 30 }),
    });
    mockCreateScreenshotAsync.mockResolvedValue('data:image/png;base64,ok');

    system.toggleViewfinder();
    const capturePromise = system.capturePhoto();
    await vi.advanceTimersByTimeAsync(100);
    const photo = await capturePromise;

    expect(photo).not.toBeNull();
    expect(photo!.takenAt).toBeTruthy();
    expect(photo!.location.settlementName).toBe('Riverside');
    expect(photo!.location.buildingName).toBe('Bakery');
    expect(photo!.location.position).toEqual({ x: 10, y: 2, z: 30 });
  });
});
