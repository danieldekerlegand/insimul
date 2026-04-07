import { describe, it, expect } from 'vitest';

// Access the non-exported buildNpcNpcSystemPrompt via re-export
import { buildNpcNpcSystemPrompt } from '../services/conversation/npc-conversation-engine.js';

import type { Character } from '@shared/schema';
import type { BigFivePersonality } from '../services/conversation/context-manager.js';

const defaultPersonality: BigFivePersonality = {
  openness: 0.5,
  conscientiousness: 0.5,
  extroversion: 0.5,
  agreeableness: 0.5,
  neuroticism: 0.5,
};

function makeNpc(overrides: Partial<Character> = {}): Character {
  return {
    id: 'npc-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    occupation: 'baker',
    worldId: 'world-1',
    personality: defaultPersonality,
    ...overrides,
  } as Character;
}

describe('NPC-NPC language directive', () => {
  const npc1 = makeNpc({ id: 'npc-1', firstName: 'Jean', lastName: 'Dupont', occupation: 'baker' });
  const npc2 = makeNpc({ id: 'npc-2', firstName: 'Marie', lastName: 'Leclerc', occupation: 'teacher' });
  const p1 = defaultPersonality;
  const p2 = defaultPersonality;

  it('includes strong language directive when target language is French', () => {
    const prompt = buildNpcNpcSystemPrompt(
      npc1, npc2, p1, p2, 'weather', 'Paris', ['French', 'English'], 4, 0.5, undefined, 'French',
    );

    expect(prompt).toContain('LANGUAGE: This conversation must be entirely in French');
    expect(prompt).toContain('Both NPCs are native speakers');
    expect(prompt).toContain('no English');
  });

  it('does not include language directive when no target language', () => {
    const prompt = buildNpcNpcSystemPrompt(
      npc1, npc2, p1, p2, 'weather', 'New York', ['English'], 4, 0.5, undefined, null,
    );

    expect(prompt).not.toContain('LANGUAGE: This conversation must be entirely in');
    // Should still have the generic language instruction
    expect(prompt).toContain('They speak English');
  });

  it('uses generic language instruction when target language is English', () => {
    const prompt = buildNpcNpcSystemPrompt(
      npc1, npc2, p1, p2, 'weather', 'London', ['English', 'French'], 4, 0.5, undefined, 'English',
    );

    expect(prompt).not.toContain('LANGUAGE: This conversation must be entirely in');
    expect(prompt).toContain('They speak English and French');
  });

  it('uses generic language instruction when no target language and no languages', () => {
    const prompt = buildNpcNpcSystemPrompt(
      npc1, npc2, p1, p2, 'weather', 'Nowhere', [], 4, 0.5, undefined, undefined,
    );

    expect(prompt).not.toContain('LANGUAGE:');
    expect(prompt).not.toContain('They speak');
  });

  it('target language directive overrides generic language instruction', () => {
    const prompt = buildNpcNpcSystemPrompt(
      npc1, npc2, p1, p2, 'weather', 'Paris', ['French', 'English'], 4, 0.5, undefined, 'French',
    );

    // Should have the strong directive, NOT the generic one
    expect(prompt).toContain('LANGUAGE: This conversation must be entirely in French');
    expect(prompt).not.toContain('They speak French and English. Use this language naturally');
  });
});
