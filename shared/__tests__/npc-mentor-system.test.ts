import { describe, it, expect } from 'vitest';
import {
  deriveTeachingStyle,
  buildMentorProfile,
  findMentors,
  selectBestMentor,
} from '../mentor/mentor-matching';
import {
  generateLesson,
  getLessonDifficulty,
  lessonToQuestData,
} from '../mentor/mentor-lessons';
import type { BigFivePersonality } from '../schema';
import type { MentorProfile, Mentorship } from '../mentor/mentor-types';

// --- Fixtures ---

function makePersonality(overrides: Partial<BigFivePersonality> = {}): BigFivePersonality {
  return {
    openness: 0,
    conscientiousness: 0,
    extroversion: 0,
    agreeableness: 0,
    neuroticism: 0,
    ...overrides,
  };
}

function makeCharacter(overrides: Record<string, any> = {}) {
  return {
    id: `char-${Math.random().toString(36).slice(2, 8)}`,
    firstName: 'NPC',
    lastName: 'Test',
    occupation: 'teacher',
    personality: makePersonality(),
    skills: {},
    status: 'active',
    ...overrides,
  };
}

// --- deriveTeachingStyle ---

describe('deriveTeachingStyle', () => {
  it('returns socratic for high openness + agreeableness', () => {
    expect(deriveTeachingStyle(makePersonality({ openness: 0.6, agreeableness: 0.5 }))).toBe('socratic');
  });

  it('returns strict for high conscientiousness + low agreeableness', () => {
    expect(deriveTeachingStyle(makePersonality({ conscientiousness: 0.6, agreeableness: -0.3 }))).toBe('strict');
  });

  it('returns encouraging for high extroversion + agreeableness', () => {
    expect(deriveTeachingStyle(makePersonality({ extroversion: 0.5, agreeableness: 0.5 }))).toBe('encouraging');
  });

  it('returns patient for high agreeableness + low neuroticism', () => {
    expect(deriveTeachingStyle(makePersonality({ agreeableness: 0.5, neuroticism: -0.3 }))).toBe('patient');
  });

  it('returns practical as fallback', () => {
    expect(deriveTeachingStyle(makePersonality())).toBe('practical');
  });
});

// --- buildMentorProfile ---

describe('buildMentorProfile', () => {
  it('builds a profile for a teacher', () => {
    const char = makeCharacter({ occupation: 'teacher' });
    const profile = buildMentorProfile(char);

    expect(profile).not.toBeNull();
    expect(profile!.specialties).toContain('vocabulary');
    expect(profile!.specialties).toContain('grammar');
    expect(profile!.specialties).toContain('conversation');
    expect(profile!.maxMentees).toBe(3); // educated occupation
  });

  it('returns null for an occupation with no mentor mapping', () => {
    const char = makeCharacter({ occupation: 'miner' });
    const profile = buildMentorProfile(char);
    expect(profile).toBeNull();
  });

  it('gives educated occupations a higher qualification score', () => {
    const teacher = makeCharacter({ id: 't1', occupation: 'teacher' });
    const baker = makeCharacter({ id: 'b1', occupation: 'baker' });

    const teacherProfile = buildMentorProfile(teacher)!;
    const bakerProfile = buildMentorProfile(baker)!;

    expect(teacherProfile.qualificationScore).toBeGreaterThan(bakerProfile.qualificationScore);
  });

  it('includes vocabulary categories from occupation map', () => {
    const char = makeCharacter({ occupation: 'baker' });
    const profile = buildMentorProfile(char)!;
    expect(profile.vocabularyCategories).toContain('food');
  });

  it('boosts score for agreeable personality', () => {
    const nice = makeCharacter({ id: 'n1', personality: makePersonality({ agreeableness: 0.5 }), occupation: 'baker' });
    const neutral = makeCharacter({ id: 'n2', personality: makePersonality(), occupation: 'baker' });

    const niceProfile = buildMentorProfile(nice)!;
    const neutralProfile = buildMentorProfile(neutral)!;

    expect(niceProfile.qualificationScore).toBeGreaterThan(neutralProfile.qualificationScore);
  });

  it('handles missing personality gracefully', () => {
    const char = makeCharacter({ personality: null });
    const profile = buildMentorProfile(char);
    expect(profile).not.toBeNull();
    expect(profile!.teachingStyle).toBe('practical');
  });
});

// --- findMentors ---

describe('findMentors', () => {
  it('returns mentors sorted by qualification score descending', () => {
    const characters = [
      makeCharacter({ id: 'a', occupation: 'baker', personality: makePersonality() }),
      makeCharacter({ id: 'b', occupation: 'teacher', personality: makePersonality({ agreeableness: 0.5, openness: 0.5 }) }),
      makeCharacter({ id: 'c', occupation: 'merchant' }),
    ];

    const mentors = findMentors(characters);
    expect(mentors.length).toBeGreaterThanOrEqual(2);
    expect(mentors[0].characterId).toBe('b'); // teacher should rank highest
  });

  it('filters by specialty', () => {
    const characters = [
      makeCharacter({ id: 'a', occupation: 'baker' }),
      makeCharacter({ id: 'b', occupation: 'teacher' }),
    ];

    const grammarMentors = findMentors(characters, { specialty: 'grammar' });
    expect(grammarMentors.every(m => m.specialties.includes('grammar'))).toBe(true);
  });

  it('excludes specified character IDs', () => {
    const characters = [
      makeCharacter({ id: 'a', occupation: 'teacher' }),
      makeCharacter({ id: 'b', occupation: 'teacher' }),
    ];

    const mentors = findMentors(characters, { excludeIds: ['a'] });
    expect(mentors.every(m => m.characterId !== 'a')).toBe(true);
  });

  it('excludes inactive characters', () => {
    const characters = [
      makeCharacter({ id: 'a', occupation: 'teacher', status: 'deceased' }),
      makeCharacter({ id: 'b', occupation: 'teacher', status: 'active' }),
    ];

    const mentors = findMentors(characters);
    expect(mentors.length).toBe(1);
    expect(mentors[0].characterId).toBe('b');
  });

  it('returns empty array when no mentors match', () => {
    const characters = [
      makeCharacter({ id: 'a', occupation: 'miner' }),
    ];
    expect(findMentors(characters)).toEqual([]);
  });
});

// --- selectBestMentor ---

describe('selectBestMentor', () => {
  it('returns the highest-scoring mentor for a specialty', () => {
    const characters = [
      makeCharacter({ id: 'a', occupation: 'baker' }),
      makeCharacter({ id: 'b', occupation: 'teacher', personality: makePersonality({ openness: 0.5, agreeableness: 0.5 }) }),
    ];

    const best = selectBestMentor(characters, 'vocabulary');
    expect(best).not.toBeNull();
    expect(best!.characterId).toBe('b');
  });

  it('returns null when no mentor matches the specialty', () => {
    const characters = [
      makeCharacter({ id: 'a', occupation: 'miner' }),
    ];

    expect(selectBestMentor(characters, 'grammar')).toBeNull();
  });
});

// --- getLessonDifficulty ---

describe('getLessonDifficulty', () => {
  it('returns beginner for low progress', () => {
    expect(getLessonDifficulty({ progress: 10, lessonsCompleted: 1 })).toBe('beginner');
  });

  it('returns intermediate for moderate progress', () => {
    expect(getLessonDifficulty({ progress: 50, lessonsCompleted: 5 })).toBe('intermediate');
  });

  it('returns advanced for high progress', () => {
    expect(getLessonDifficulty({ progress: 80, lessonsCompleted: 10 })).toBe('advanced');
  });
});

// --- generateLesson ---

describe('generateLesson', () => {
  const mentorProfile: MentorProfile = {
    characterId: 'mentor-1',
    characterName: 'Marie Dupont',
    occupation: 'teacher',
    specialties: ['vocabulary', 'grammar', 'conversation'],
    teachingStyle: 'encouraging',
    qualificationScore: 0.9,
    vocabularyCategories: ['social', 'numbers', 'time', 'actions'],
    maxMentees: 3,
  };

  it('generates a lesson with correct structure', () => {
    const mentorship = {
      playerCharacterId: 'player-1',
      specialty: 'vocabulary' as const,
      progress: 10,
      lessonsCompleted: 0,
    };

    const lesson = generateLesson(mentorProfile, mentorship);

    expect(lesson.mentorCharacterId).toBe('mentor-1');
    expect(lesson.playerCharacterId).toBe('player-1');
    expect(lesson.specialty).toBe('vocabulary');
    expect(lesson.difficulty).toBe('beginner');
    expect(lesson.objectives.length).toBeGreaterThan(0);
    expect(lesson.introDialogue).toContain(lesson.topic);
    expect(lesson.completionDialogue).toContain(lesson.topic);
  });

  it('uses teaching style in dialogue', () => {
    const mentorship = {
      playerCharacterId: 'player-1',
      specialty: 'vocabulary' as const,
      progress: 10,
      lessonsCompleted: 0,
    };

    const lesson = generateLesson(mentorProfile, mentorship);
    // 'encouraging' style has exclamation marks
    expect(lesson.introDialogue).toContain('!');
  });

  it('cycles through templates based on lessons completed', () => {
    const mentorship1 = { playerCharacterId: 'p1', specialty: 'vocabulary' as const, progress: 10, lessonsCompleted: 0 };
    const mentorship2 = { playerCharacterId: 'p1', specialty: 'vocabulary' as const, progress: 10, lessonsCompleted: 1 };

    const lesson1 = generateLesson(mentorProfile, mentorship1);
    const lesson2 = generateLesson(mentorProfile, mentorship2);

    // beginner vocabulary has 2 templates, so lessons 0 and 1 should differ
    expect(lesson1.topic).not.toBe(lesson2.topic);
  });

  it('scales difficulty with progress', () => {
    const beginner = generateLesson(mentorProfile, { playerCharacterId: 'p1', specialty: 'grammar' as const, progress: 5, lessonsCompleted: 0 });
    const advanced = generateLesson(mentorProfile, { playerCharacterId: 'p1', specialty: 'grammar' as const, progress: 90, lessonsCompleted: 12 });

    expect(beginner.difficulty).toBe('beginner');
    expect(advanced.difficulty).toBe('advanced');
  });
});

// --- lessonToQuestData ---

describe('lessonToQuestData', () => {
  it('converts a lesson to quest-compatible format', () => {
    const lesson = {
      mentorCharacterId: 'mentor-1',
      playerCharacterId: 'player-1',
      specialty: 'vocabulary' as const,
      difficulty: 'beginner',
      topic: 'Basic Greetings',
      objectives: [
        { type: 'collect_vocabulary', description: 'Learn greeting words', required: 3 },
      ],
      introDialogue: 'Let us learn greetings.',
      completionDialogue: 'Well done!',
    };

    const quest = lessonToQuestData(lesson, 'world-1');

    expect(quest.worldId).toBe('world-1');
    expect(quest.title).toBe('Lesson: Basic Greetings');
    expect(quest.questType).toBe('mentor_lesson');
    expect(quest.assignedByCharacterId).toBe('mentor-1');
    expect(quest.assignedToCharacterId).toBe('player-1');
    expect(quest.tags).toContain('mentor_lesson');
    expect(quest.tags).toContain('specialty:vocabulary');
    expect(quest.objectives).toHaveLength(1);
  });
});
