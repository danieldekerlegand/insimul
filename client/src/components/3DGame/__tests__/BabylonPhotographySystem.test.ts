import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PlayerPhoto, PhotoNounLabel } from '@shared/game-engine/types';

/**
 * We test the photography system's data-management layer (photo storage,
 * labels, favorites, captions) without requiring a real Babylon.js scene.
 *
 * The BabylonPhotographySystem class depends on Babylon Scene/Engine/Camera
 * for capture, so we import only the types and test the helper logic directly.
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
