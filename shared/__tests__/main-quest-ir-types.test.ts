import { describe, it, expect } from 'vitest';
import type { MainQuestLocationIR, NarrativeIR, SystemsIR } from '../game-engine/ir-types';

describe('MainQuestLocationIR type', () => {
  it('can be constructed with all fields', () => {
    const location: MainQuestLocationIR = {
      id: 'abandoned_cabin',
      nameEn: 'The Abandoned Cabin',
      nameFr: 'La Cabane Abandonnee',
      description: 'A weathered cabin reclaimed by nature.',
      locationType: 'hidden_location',
      position: { x: 100, z: 50 },
      rarity: 'uncommon',
      isWriterSecret: true,
      investigationPoints: [
        {
          id: 'cabin_desk',
          offset: { x: 1, z: 0 },
          contentType: 'clue',
          contentFr: 'Un journal intime...',
          contentEn: 'An open diary...',
        },
      ],
    };
    expect(location.id).toBe('abandoned_cabin');
    expect(location.isWriterSecret).toBe(true);
    expect(location.investigationPoints).toHaveLength(1);
    expect(location.investigationPoints[0].contentType).toBe('clue');
  });
});

describe('NarrativeIR type', () => {
  it('can be constructed with all fields', () => {
    const narrative: NarrativeIR = {
      writerName: 'Emile Beaumont',
      writerFirstName: 'Emile',
      writerLastName: 'Beaumont',
      writerBackstory: 'A celebrated novelist...',
      disappearanceReason: 'Discovered corruption...',
      chapters: [
        {
          chapterId: 'ch1_assignment_abroad',
          chapterNumber: 1,
          title: 'Assignment Abroad',
          introNarrative: 'The ferry docks...',
          outroNarrative: 'The editor regards you...',
          mysteryDetails: 'The newspaper office...',
          clueDescriptions: [
            { clueId: 'ch1_clue_1', text: 'A diary entry...', locationId: 'abandoned_cabin' },
          ],
        },
      ],
      redHerrings: [
        { description: 'A neighbor claims...', source: 'Neighbor gossip' },
      ],
      finalRevelation: 'The writer is alive and well...',
    };
    expect(narrative.writerName).toBe('Emile Beaumont');
    expect(narrative.chapters).toHaveLength(1);
    expect(narrative.redHerrings).toHaveLength(1);
  });
});

describe('SystemsIR includes main quest fields', () => {
  it('accepts mainQuestLocations and narrative fields', () => {
    // This is a compile-time type check — if it compiles, the fields exist
    const partial: Pick<SystemsIR, 'mainQuestLocations' | 'narrative'> = {
      mainQuestLocations: [],
      narrative: null,
    };
    expect(partial.mainQuestLocations).toEqual([]);
    expect(partial.narrative).toBeNull();
  });
});
