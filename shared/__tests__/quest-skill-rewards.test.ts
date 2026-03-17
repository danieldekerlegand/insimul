import { describe, it, expect } from 'vitest';
import {
  computeSkillRewards,
  applySkillRewards,
  type SkillReward,
} from '../language/quest-skill-rewards';

describe('computeSkillRewards', () => {
  it('returns explicit skillRewards when provided', () => {
    const explicit: SkillReward[] = [
      { skillId: 'custom', name: 'Custom', level: 5 },
    ];
    const result = computeSkillRewards({
      questType: 'conversation',
      difficulty: 'beginner',
      skillRewards: explicit,
    });
    expect(result).toEqual(explicit);
  });

  it('computes rewards from conversation quest type', () => {
    const result = computeSkillRewards({
      questType: 'conversation',
      difficulty: 'beginner',
    });
    expect(result).toEqual([
      { skillId: 'speaking', name: 'Speaking', level: 2 },
      { skillId: 'listening', name: 'Listening', level: 1 },
    ]);
  });

  it('scales rewards by intermediate difficulty', () => {
    const result = computeSkillRewards({
      questType: 'conversation',
      difficulty: 'intermediate',
    });
    expect(result).toEqual([
      { skillId: 'speaking', name: 'Speaking', level: 4 },
      { skillId: 'listening', name: 'Listening', level: 2 },
    ]);
  });

  it('scales rewards by advanced difficulty', () => {
    const result = computeSkillRewards({
      questType: 'vocabulary',
      difficulty: 'advanced',
    });
    expect(result).toEqual([
      { skillId: 'vocabulary', name: 'Vocabulary', level: 9 },
    ]);
  });

  it('computes rewards for translation quest type', () => {
    const result = computeSkillRewards({
      questType: 'translation',
      difficulty: 'beginner',
    });
    expect(result).toEqual([
      { skillId: 'reading', name: 'Reading', level: 2 },
      { skillId: 'writing', name: 'Writing', level: 2 },
    ]);
  });

  it('computes rewards for grammar quest type', () => {
    const result = computeSkillRewards({
      questType: 'grammar',
      difficulty: 'intermediate',
    });
    expect(result).toEqual([
      { skillId: 'grammar', name: 'Grammar', level: 6 },
    ]);
  });

  it('computes rewards for cultural quest type', () => {
    const result = computeSkillRewards({
      questType: 'cultural',
      difficulty: 'beginner',
    });
    expect(result).toEqual([
      { skillId: 'cultural_knowledge', name: 'Cultural Knowledge', level: 2 },
      { skillId: 'vocabulary', name: 'Vocabulary', level: 1 },
    ]);
  });

  it('computes rewards for navigation quest type', () => {
    const result = computeSkillRewards({
      questType: 'navigation',
      difficulty: 'beginner',
    });
    expect(result).toEqual([
      { skillId: 'listening', name: 'Listening', level: 2 },
      { skillId: 'speaking', name: 'Speaking', level: 1 },
    ]);
  });

  it('returns empty array for unknown quest type', () => {
    const result = computeSkillRewards({
      questType: 'unknown_type',
      difficulty: 'beginner',
    });
    expect(result).toEqual([]);
  });

  it('defaults to multiplier 1 for unknown difficulty', () => {
    const result = computeSkillRewards({
      questType: 'vocabulary',
      difficulty: 'unknown',
    });
    expect(result).toEqual([
      { skillId: 'vocabulary', name: 'Vocabulary', level: 3 },
    ]);
  });

  it('prefers explicit rewards over computed ones', () => {
    const explicit: SkillReward[] = [
      { skillId: 'special', name: 'Special', level: 10 },
    ];
    const result = computeSkillRewards({
      questType: 'conversation',
      difficulty: 'advanced',
      skillRewards: explicit,
    });
    expect(result).toEqual(explicit);
  });

  it('falls back to computed rewards when skillRewards is empty', () => {
    const result = computeSkillRewards({
      questType: 'conversation',
      difficulty: 'beginner',
      skillRewards: [],
    });
    expect(result).toEqual([
      { skillId: 'speaking', name: 'Speaking', level: 2 },
      { skillId: 'listening', name: 'Listening', level: 1 },
    ]);
  });
});

describe('applySkillRewards', () => {
  it('adds skill points to empty skills map', () => {
    const rewards: SkillReward[] = [
      { skillId: 'speaking', name: 'Speaking', level: 3 },
    ];
    const { skills, applied } = applySkillRewards({}, rewards);
    expect(skills).toEqual({ speaking: 3 });
    expect(applied).toEqual(rewards);
  });

  it('adds to existing skill values', () => {
    const { skills } = applySkillRewards(
      { speaking: 5, listening: 2 },
      [{ skillId: 'speaking', name: 'Speaking', level: 3 }],
    );
    expect(skills).toEqual({ speaking: 8, listening: 2 });
  });

  it('handles multiple rewards', () => {
    const { skills } = applySkillRewards(
      { speaking: 1 },
      [
        { skillId: 'speaking', name: 'Speaking', level: 2 },
        { skillId: 'listening', name: 'Listening', level: 3 },
      ],
    );
    expect(skills).toEqual({ speaking: 3, listening: 3 });
  });

  it('does not mutate the original skills map', () => {
    const original = { speaking: 5 };
    const { skills } = applySkillRewards(
      original,
      [{ skillId: 'speaking', name: 'Speaking', level: 2 }],
    );
    expect(original.speaking).toBe(5);
    expect(skills.speaking).toBe(7);
  });

  it('returns empty applied list for empty rewards', () => {
    const { skills, applied } = applySkillRewards({ speaking: 5 }, []);
    expect(skills).toEqual({ speaking: 5 });
    expect(applied).toEqual([]);
  });
});
