import { describe, it, expect } from 'vitest';
import {
  getTimePeriod,
  describeTime,
  describeWeather,
} from '../npc-awareness-context';

describe('getTimePeriod', () => {
  it('returns dawn for early morning hours', () => {
    expect(getTimePeriod(5)).toBe('dawn');
    expect(getTimePeriod(6)).toBe('dawn');
  });

  it('returns morning for mid-morning hours', () => {
    expect(getTimePeriod(7)).toBe('morning');
    expect(getTimePeriod(11)).toBe('morning');
  });

  it('returns afternoon for midday hours', () => {
    expect(getTimePeriod(12)).toBe('afternoon');
    expect(getTimePeriod(16)).toBe('afternoon');
  });

  it('returns evening for late hours', () => {
    expect(getTimePeriod(17)).toBe('evening');
    expect(getTimePeriod(20)).toBe('evening');
  });

  it('returns night for late night and early morning', () => {
    expect(getTimePeriod(21)).toBe('night');
    expect(getTimePeriod(0)).toBe('night');
    expect(getTimePeriod(4)).toBe('night');
  });
});

describe('describeTime', () => {
  it('returns natural descriptions for each period', () => {
    expect(describeTime(5)).toContain('sunrise');
    expect(describeTime(9)).toBe('morning');
    expect(describeTime(14)).toBe('afternoon');
    expect(describeTime(19)).toBe('evening');
    expect(describeTime(22)).toContain('late evening');
    expect(describeTime(2)).toContain('night');
  });
});

describe('describeWeather', () => {
  it('returns descriptions for all weather conditions', () => {
    expect(describeWeather('clear')).toContain('pleasant');
    expect(describeWeather('rain')).toContain('rainy');
    expect(describeWeather('storm')).toContain('storm');
    expect(describeWeather('snow')).toContain('snow');
    expect(describeWeather('fog')).toContain('fog');
    expect(describeWeather('cloudy')).toContain('overcast');
    expect(describeWeather('windy')).toContain('windy');
  });
});
