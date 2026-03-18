import { describe, it, expect } from 'vitest';
import {
  getNPCReasoningRules,
  getEnvironmentFacts,
  getPersonalityFacts,
} from '../prolog/npc-reasoning';

describe('getEnvironmentFacts', () => {
  it('generates basic environment facts', () => {
    const facts = getEnvironmentFacts({
      gameHour: 14,
      timePeriod: 'afternoon',
      weather: 'rain',
    });

    expect(facts).toContain('game_hour(14)');
    expect(facts).toContain('time_period(afternoon)');
    expect(facts).toContain('weather(rain)');
  });

  it('includes season when provided', () => {
    const facts = getEnvironmentFacts({
      gameHour: 10,
      timePeriod: 'morning',
      weather: 'snow',
      season: 'winter',
    });

    expect(facts).toContain('season(winter)');
  });

  it('includes player progress facts', () => {
    const facts = getEnvironmentFacts({
      gameHour: 12,
      timePeriod: 'afternoon',
      weather: 'clear',
      playerQuestsCompleted: 5,
      playerReputation: 75,
      playerIsNew: false,
    });

    expect(facts).toContain('player_quests_completed(5)');
    expect(facts).toContain('player_reputation(75)');
    expect(facts).not.toContain('player_is_new');
  });

  it('includes player_is_new when true', () => {
    const facts = getEnvironmentFacts({
      gameHour: 8,
      timePeriod: 'morning',
      weather: 'clear',
      playerIsNew: true,
    });

    expect(facts).toContain('player_is_new');
  });

  it('sanitizes weather values', () => {
    const facts = getEnvironmentFacts({
      gameHour: 12,
      timePeriod: 'afternoon',
      weather: 'Heavy Rain',
    });

    expect(facts).toContain('weather(heavy_rain)');
  });
});

describe('getNPCReasoningRules - environment awareness', () => {
  const rules = getNPCReasoningRules();

  it('includes weather-driven behavior rules', () => {
    expect(rules).toContain('should_seek_shelter');
    expect(rules).toContain('enjoys_weather');
    expect(rules).toContain('weather_complaint_likely');
  });

  it('includes time-driven topic rules', () => {
    expect(rules).toContain('morning_routine');
    expect(rules).toContain('evening_plans');
  });

  it('includes player progress rules', () => {
    expect(rules).toContain('respects_player');
    expect(rules).toContain('impressed_by_player');
    expect(rules).toContain('wary_of_newcomer');
    expect(rules).toContain('welcoming_to_newcomer');
  });

  it('includes dynamic declarations for environment predicates', () => {
    expect(rules).toContain(':- dynamic(weather/1).');
    expect(rules).toContain(':- dynamic(game_hour/1).');
    expect(rules).toContain(':- dynamic(time_period/1).');
    expect(rules).toContain(':- dynamic(player_quests_completed/1).');
    expect(rules).toContain(':- dynamic(player_reputation/1).');
    expect(rules).toContain(':- dynamic(player_is_new/0).');
  });

  it('includes quest awareness rules', () => {
    expect(rules).toContain('is_quest_giver');
  });

  it('includes late-night behavior rules', () => {
    expect(rules).toContain('should_be_sleeping');
    expect(rules).toContain('is_night_owl');
  });
});
