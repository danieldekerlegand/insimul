/**
 * Mentor Matching
 *
 * Selects the best NPC mentor for a player based on occupation expertise,
 * personality-derived teaching style, and vocabulary specialization overlap.
 */

import type { BigFivePersonality } from '../schema.js';
import { OCCUPATION_VOCABULARY_MAP } from '../language/character-profile.js';
import type {
  MentorSpecialty,
  MentorProfile,
  TeachingStyle,
} from './mentor-types.js';

/** Maps occupations to their mentoring specialties */
const OCCUPATION_MENTOR_SPECIALTIES: Record<string, MentorSpecialty[]> = {
  teacher:    ['vocabulary', 'grammar', 'conversation'],
  professor:  ['grammar', 'reading', 'culture'],
  scholar:    ['grammar', 'reading', 'culture'],
  priest:     ['culture', 'conversation', 'reading'],
  mayor:      ['conversation', 'culture'],
  doctor:     ['vocabulary', 'listening'],
  innkeeper:  ['conversation', 'vocabulary', 'listening'],
  merchant:   ['vocabulary', 'conversation'],
  baker:      ['vocabulary', 'pronunciation'],
  farmer:     ['vocabulary', 'pronunciation'],
  blacksmith: ['vocabulary', 'pronunciation'],
  tailor:     ['vocabulary', 'conversation'],
  guard:      ['vocabulary', 'listening'],
  carpenter:  ['vocabulary', 'pronunciation'],
};

/** Educated occupations get a qualification bonus */
const EDUCATED_OCCUPATIONS = new Set([
  'teacher', 'professor', 'scholar', 'priest', 'mayor', 'doctor',
]);

/**
 * Derive a teaching style from Big Five personality traits.
 */
export function deriveTeachingStyle(personality: BigFivePersonality): TeachingStyle {
  const { openness, conscientiousness, extroversion, agreeableness, neuroticism } = personality;

  if (openness > 0.4 && agreeableness > 0.2) return 'socratic';
  if (conscientiousness > 0.4 && agreeableness < 0) return 'strict';
  if (extroversion > 0.3 && agreeableness > 0.3) return 'encouraging';
  if (agreeableness > 0.3 && neuroticism < 0) return 'patient';
  return 'practical';
}

/**
 * Build a MentorProfile for a character.
 * Returns null if the character has no mentoring capability.
 */
export function buildMentorProfile(character: {
  id: string;
  firstName: string;
  lastName: string;
  occupation?: string | null;
  personality?: BigFivePersonality | null;
  skills?: Record<string, number> | null;
}): MentorProfile | null {
  const occupation = (character.occupation || '').toLowerCase();
  const specialties = OCCUPATION_MENTOR_SPECIALTIES[occupation];

  if (!specialties || specialties.length === 0) return null;

  const personality = character.personality || {
    openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0,
  };

  const teachingStyle = deriveTeachingStyle(personality);
  const vocabCategories = OCCUPATION_VOCABULARY_MAP[occupation] || [];

  // Qualification score: base from occupation + personality bonuses
  let score = 0.5;
  if (EDUCATED_OCCUPATIONS.has(occupation)) score += 0.3;
  if (personality.agreeableness > 0.3) score += 0.1;
  if (personality.openness > 0.3) score += 0.1;
  score = Math.min(1, score);

  // Skills bonus
  const skills = character.skills || {};
  const teachingSkill = skills['teaching'] || skills['education'] || 0;
  if (teachingSkill > 0) score = Math.min(1, score + teachingSkill * 0.05);

  return {
    characterId: character.id,
    characterName: `${character.firstName} ${character.lastName}`.trim(),
    occupation,
    specialties,
    teachingStyle,
    qualificationScore: Math.round(score * 100) / 100,
    vocabularyCategories: vocabCategories,
    maxMentees: EDUCATED_OCCUPATIONS.has(occupation) ? 3 : 1,
  };
}

/**
 * Find the best mentor NPC for a given specialty from a list of characters.
 * Returns profiles sorted by qualification score (descending).
 */
export function findMentors(
  characters: Array<{
    id: string;
    firstName: string;
    lastName: string;
    occupation?: string | null;
    personality?: BigFivePersonality | null;
    skills?: Record<string, number> | null;
    status?: string;
  }>,
  options: {
    specialty?: MentorSpecialty;
    excludeIds?: string[];
  } = {},
): MentorProfile[] {
  const { specialty, excludeIds = [] } = options;
  const excludeSet = new Set(excludeIds);

  const profiles: MentorProfile[] = [];

  for (const char of characters) {
    if (char.status && char.status !== 'active') continue;
    if (excludeSet.has(char.id)) continue;

    const profile = buildMentorProfile(char);
    if (!profile) continue;

    if (specialty && !profile.specialties.includes(specialty)) continue;

    profiles.push(profile);
  }

  // Sort by qualification score descending
  profiles.sort((a, b) => b.qualificationScore - a.qualificationScore);

  return profiles;
}

/**
 * Select the single best mentor for a specialty.
 */
export function selectBestMentor(
  characters: Array<{
    id: string;
    firstName: string;
    lastName: string;
    occupation?: string | null;
    personality?: BigFivePersonality | null;
    skills?: Record<string, number> | null;
    status?: string;
  }>,
  specialty: MentorSpecialty,
  excludeIds: string[] = [],
): MentorProfile | null {
  const mentors = findMentors(characters, { specialty, excludeIds });
  return mentors[0] || null;
}
