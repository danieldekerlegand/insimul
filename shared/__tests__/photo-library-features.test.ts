/**
 * Tests for Photo Library features:
 * - Activity detection in photo labels
 * - Photo quest integration with activity matching
 * - MenuPhotoData structure
 * - Photo detail view data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PlayerPhoto, PhotoNounLabel } from '../game-engine/types';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../../client/src/components/3DGame/QuestCompletionEngine';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeLabel(overrides: Partial<PhotoNounLabel> = {}): PhotoNounLabel {
  return {
    id: `label_${Date.now()}_${Math.random()}`,
    name: 'Tree',
    category: 'nature',
    x: 0.5,
    y: 0.5,
    ...overrides,
  };
}

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

function makeObjective(
  overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string },
): CompletionObjective {
  return {
    description: 'test objective',
    completed: false,
    ...overrides,
  };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

// ── Activity Detection in Labels ──────────────────────────────────────────────

describe('PhotoNounLabel activity field', () => {
  it('stores activity on a label', () => {
    const label = makeLabel({ name: 'Marie', category: 'person', activity: 'cooking' });
    expect(label.activity).toBe('cooking');
  });

  it('activity is optional and defaults to undefined', () => {
    const label = makeLabel({ name: 'Oak Tree', category: 'nature' });
    expect(label.activity).toBeUndefined();
  });

  it('labels on a photo include NPC activity info', () => {
    const photo = makePhoto({
      labels: [
        makeLabel({ name: 'Marie', category: 'person', activity: 'Sweeping up' }),
        makeLabel({ name: 'Pierre', category: 'person', activity: 'Tending the garden' }),
        makeLabel({ name: 'Bakery', category: 'building' }),
      ],
    });

    const npcLabels = photo.labels.filter(l => l.category === 'person');
    expect(npcLabels).toHaveLength(2);
    expect(npcLabels[0].activity).toBe('Sweeping up');
    expect(npcLabels[1].activity).toBe('Tending the garden');

    const buildingLabels = photo.labels.filter(l => l.category === 'building');
    expect(buildingLabels[0].activity).toBeUndefined();
  });

  it('displays name with activity as "Name - Activity"', () => {
    const label = makeLabel({ name: 'Marie', category: 'person', activity: 'cooking' });
    const displayText = label.activity ? `${label.name} - ${label.activity}` : label.name;
    expect(displayText).toBe('Marie - cooking');
  });

  it('displays just name when no activity', () => {
    const label = makeLabel({ name: 'Town Hall', category: 'building' });
    const displayText = label.activity ? `${label.name} - ${label.activity}` : label.name;
    expect(displayText).toBe('Town Hall');
  });
});

// ── Photo Detail Data ──────────────────────────────────────────────────────────

describe('Photo detail view data', () => {
  it('photo has imageData for full-size display', () => {
    const photo = makePhoto({ imageData: 'data:image/png;base64,fullsizedata' });
    expect(photo.imageData).toBe('data:image/png;base64,fullsizedata');
  });

  it('photo labels have screen positions for overlay markers', () => {
    const photo = makePhoto({
      labels: [
        makeLabel({ name: 'Marie', x: 0.3, y: 0.2 }),
        makeLabel({ name: 'Bakery', x: 0.7, y: 0.8 }),
      ],
    });
    expect(photo.labels[0].x).toBe(0.3);
    expect(photo.labels[0].y).toBe(0.2);
    expect(photo.labels[1].x).toBe(0.7);
    expect(photo.labels[1].y).toBe(0.8);
  });

  it('photo has timestamp and location for detail display', () => {
    const now = new Date().toISOString();
    const photo = makePhoto({
      takenAt: now,
      location: {
        settlementName: 'Riverside',
        buildingName: 'General Store',
        position: { x: 10, y: 0, z: 20 },
      },
    });
    expect(photo.takenAt).toBe(now);
    expect(photo.location.settlementName).toBe('Riverside');
    expect(photo.location.buildingName).toBe('General Store');
  });
});

// ── Quest Integration with Activity Matching ──────────────────────────────────

describe('Photo quest activity matching', () => {
  let engine: QuestCompletionEngine;
  let objectiveCompletedSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
    objectiveCompletedSpy = vi.fn();
    engine.setOnObjectiveCompleted(objectiveCompletedSpy);
    engine.setOnQuestCompleted(vi.fn());
  });

  it('completes activity-specific photo objective when activity matches', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      targetCategory: 'npc',
      targetActivity: 'cooking',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({
      type: 'photo_taken',
      subjectName: 'Marie',
      subjectCategory: 'npc',
      subjectActivity: 'Cooking a meal',
    });

    expect(obj.completed).toBe(true);
    expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
  });

  it('rejects photo when activity does not match', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      targetCategory: 'npc',
      targetActivity: 'cooking',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({
      type: 'photo_taken',
      subjectName: 'Marie',
      subjectCategory: 'npc',
      subjectActivity: 'Sweeping up',
    });

    expect(obj.completed).toBe(false);
  });

  it('rejects photo when activity is required but not present', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      targetActivity: 'painting',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({
      type: 'photo_taken',
      subjectName: 'Pierre',
      subjectCategory: 'npc',
    });

    expect(obj.completed).toBe(false);
  });

  it('matches activity case-insensitively with substring', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      targetActivity: 'cook',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({
      type: 'photo_taken',
      subjectName: 'Marie',
      subjectCategory: 'npc',
      subjectActivity: 'Cooking a meal',
    });

    expect(obj.completed).toBe(true);
  });

  it('tracks unique subject+activity combinations for activity objectives', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      targetActivity: 'cooking',
      requiredCount: 2,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    // Same person doing the same activity — should count as 1
    engine.trackEvent({
      type: 'photo_taken',
      subjectName: 'Marie',
      subjectCategory: 'npc',
      subjectActivity: 'cooking',
    });
    engine.trackEvent({
      type: 'photo_taken',
      subjectName: 'Marie',
      subjectCategory: 'npc',
      subjectActivity: 'cooking',
    });
    expect(obj.currentCount).toBe(1);

    // Different person cooking — should count as 2
    engine.trackEvent({
      type: 'photo_taken',
      subjectName: 'Pierre',
      subjectCategory: 'npc',
      subjectActivity: 'cooking',
    });
    expect(obj.currentCount).toBe(2);
    expect(obj.completed).toBe(true);
  });

  it('non-activity objectives still work with activity photos', () => {
    const obj = makeObjective({
      id: 'o1',
      questId: 'q1',
      type: 'photograph_subject',
      targetSubject: 'Marie',
      requiredCount: 1,
    });
    engine.addQuest(makeQuest('q1', [obj]));

    engine.trackEvent({
      type: 'photo_taken',
      subjectName: 'Marie',
      subjectCategory: 'npc',
      subjectActivity: 'Sweeping up',
    });

    expect(obj.completed).toBe(true);
  });
});

// ── MenuPhotoData conversion ──────────────────────────────────────────────────

describe('MenuPhotoData structure', () => {
  it('converts PlayerPhoto to MenuPhotoData format', () => {
    const photo = makePhoto({
      id: 'p1',
      labels: [
        makeLabel({ name: 'Marie', category: 'person', activity: 'cooking' }),
        makeLabel({ name: 'Bakery', category: 'building' }),
      ],
      location: { settlementName: 'Riverside', position: { x: 0, y: 0, z: 0 } },
    });

    // Simulate the conversion done in BabylonGame.ts getPhotos callback
    const menuData = {
      id: photo.id,
      thumbnail: photo.thumbnail,
      imageData: photo.imageData,
      takenAt: photo.takenAt,
      locationName: photo.location.settlementName || photo.location.buildingName || 'Unknown',
      favorite: photo.favorite,
      labelCount: photo.labels.length,
      labels: photo.labels.map(l => ({ name: l.name, category: l.category, activity: l.activity, x: l.x, y: l.y })),
      caption: photo.caption,
    };

    expect(menuData.id).toBe('p1');
    expect(menuData.labels).toHaveLength(2);
    expect(menuData.labels[0].activity).toBe('cooking');
    expect(menuData.labels[1].activity).toBeUndefined();
    expect(menuData.imageData).toBe(photo.imageData);
    expect(menuData.locationName).toBe('Riverside');
  });
});

// ── Photo persistence ─────────────────────────────────────────────────────────

describe('Photo persistence in GameSaveState', () => {
  it('SavedPhotoBookState preserves activity labels', () => {
    const photos: PlayerPhoto[] = [
      makePhoto({
        id: 'p1',
        labels: [
          makeLabel({ name: 'Marie', category: 'person', activity: 'cooking' }),
        ],
      }),
    ];

    const savedState = { photos };
    const restored = savedState.photos;

    expect(restored[0].labels[0].activity).toBe('cooking');
    expect(restored[0].labels[0].name).toBe('Marie');
  });
});
