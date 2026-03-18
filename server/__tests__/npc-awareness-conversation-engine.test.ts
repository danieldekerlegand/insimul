import { describe, it, expect } from 'vitest';
import {
  selectTopics,
  buildNpcNpcSystemPrompt,
} from '../services/conversation/npc-conversation-engine';
import type { Character } from '@shared/schema';
import type { BigFivePersonality } from '../services/conversation/context-manager';

function makeChar(overrides: Partial<Character> = {}): Character {
  return {
    id: 'npc-1',
    worldId: 'world-1',
    firstName: 'Alice',
    lastName: 'Smith',
    occupation: 'Baker',
    personality: {
      openness: 0.5,
      conscientiousness: 0.5,
      extroversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.3,
    },
    relationships: {},
    ...overrides,
  } as Character;
}

describe('selectTopics - environment awareness', () => {
  const npc1 = makeChar({ firstName: 'Alice' });
  const npc2 = makeChar({ id: 'npc-2', firstName: 'Bob' });

  it('boosts weather topic weight when weather is notable', () => {
    const clearTopics = selectTopics(npc1, npc2, 0.3);
    const rainyTopics = selectTopics(npc1, npc2, 0.3, { weather: 'rain' });

    const clearWeather = clearTopics.find(t => t.topic === 'weather');
    const rainyWeather = rainyTopics.find(t => t.topic === 'weather');

    expect(clearWeather!.weight).toBe(0.8);
    expect(rainyWeather!.weight).toBe(1.5);
  });

  it('uses default weight for clear weather', () => {
    const topics = selectTopics(npc1, npc2, 0.3, { weather: 'clear' });
    const weather = topics.find(t => t.topic === 'weather');
    expect(weather!.weight).toBe(0.8);
  });

  it('includes reason for notable weather', () => {
    const topics = selectTopics(npc1, npc2, 0.3, { weather: 'storm' });
    const weather = topics.find(t => t.topic === 'weather');
    expect(weather!.reason).toContain('storm');
  });

  it('works without environment (backward compatible)', () => {
    const topics = selectTopics(npc1, npc2, 0.3);
    expect(topics.length).toBeGreaterThan(0);
    expect(topics.find(t => t.topic === 'weather')).toBeDefined();
  });
});

describe('buildNpcNpcSystemPrompt - environment context', () => {
  const npc1 = makeChar({ firstName: 'Alice', lastName: 'Smith' });
  const npc2 = makeChar({ id: 'npc-2', firstName: 'Bob', lastName: 'Jones' });
  const p1: BigFivePersonality = { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.3 };
  const p2: BigFivePersonality = { openness: 0.6, conscientiousness: 0.4, extroversion: 0.6, agreeableness: 0.6, neuroticism: 0.2 };

  it('includes weather in prompt when notable', () => {
    const prompt = buildNpcNpcSystemPrompt(
      npc1, npc2, p1, p2, 'weather', 'TestWorld', [], 4, 0.3,
      { weather: 'rain', gameHour: 14 },
    );

    expect(prompt).toContain('rainy');
  });

  it('includes time description in prompt', () => {
    const prompt = buildNpcNpcSystemPrompt(
      npc1, npc2, p1, p2, 'greeting', 'TestWorld', [], 4, 0.3,
      { gameHour: 6 },
    );

    expect(prompt).toContain('sunrise');
  });

  it('includes season in prompt', () => {
    const prompt = buildNpcNpcSystemPrompt(
      npc1, npc2, p1, p2, 'greeting', 'TestWorld', [], 4, 0.3,
      { season: 'winter', gameHour: 12 },
    );

    expect(prompt).toContain('winter');
  });

  it('does not include environment line for clear weather and no extra context', () => {
    const prompt = buildNpcNpcSystemPrompt(
      npc1, npc2, p1, p2, 'greeting', 'TestWorld', [], 4, 0.3,
      { weather: 'clear', gameHour: 14 },
    );

    // Should still include time but not weather "clear"
    expect(prompt).toContain('afternoon');
    expect(prompt).not.toContain('pleasant');
  });

  it('works without environment (backward compatible)', () => {
    const prompt = buildNpcNpcSystemPrompt(
      npc1, npc2, p1, p2, 'greeting', 'TestWorld', [], 4, 0.3,
    );

    expect(prompt).toContain('Alice');
    expect(prompt).toContain('Bob');
    expect(prompt).toContain('current environment');
  });
});
