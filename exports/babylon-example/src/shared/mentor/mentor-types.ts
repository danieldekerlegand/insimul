/**
 * NPC Mentor System Types
 *
 * Defines the data structures for NPC mentorship in language learning.
 * Mentors are NPCs whose occupation and skills align with teaching areas.
 * They guide players through structured learning progressions.
 */

/** Areas an NPC can mentor in, mapped to vocabulary specializations */
export type MentorSpecialty =
  | 'vocabulary'
  | 'grammar'
  | 'pronunciation'
  | 'conversation'
  | 'culture'
  | 'reading'
  | 'listening';

/** How the mentor approaches teaching */
export type TeachingStyle =
  | 'patient'      // High agreeableness, low neuroticism — gentle corrections
  | 'strict'       // High conscientiousness — demands precision
  | 'encouraging'  // High extroversion, high agreeableness — lots of praise
  | 'socratic'     // High openness — asks questions to guide discovery
  | 'practical';   // Low openness, high conscientiousness — drills and repetition

/** A mentorship relationship between an NPC and a player */
export interface Mentorship {
  mentorCharacterId: string;
  playerCharacterId: string;
  worldId: string;
  specialty: MentorSpecialty;
  teachingStyle: TeachingStyle;
  /** 0-100: how far the player has progressed under this mentor */
  progress: number;
  /** Number of lessons/quests completed with this mentor */
  lessonsCompleted: number;
  /** Timestamp of when the mentorship began */
  startedAt: number;
  /** Whether the mentorship is currently active */
  isActive: boolean;
}

/** Describes an NPC's suitability as a mentor */
export interface MentorProfile {
  characterId: string;
  characterName: string;
  occupation: string;
  specialties: MentorSpecialty[];
  teachingStyle: TeachingStyle;
  /** 0-1 score indicating how qualified this NPC is as a mentor */
  qualificationScore: number;
  /** Vocabulary categories this mentor can teach */
  vocabularyCategories: string[];
  /** Maximum number of active mentees this NPC can handle */
  maxMentees: number;
}

/** A structured lesson that a mentor assigns to a player */
export interface MentorLesson {
  mentorCharacterId: string;
  playerCharacterId: string;
  specialty: MentorSpecialty;
  /** Difficulty: beginner, intermediate, advanced */
  difficulty: string;
  /** The lesson topic (e.g., "food vocabulary", "past tense") */
  topic: string;
  /** Quest objectives the lesson translates into */
  objectives: MentorLessonObjective[];
  /** Dialogue the mentor uses to introduce the lesson */
  introDialogue: string;
  /** Dialogue the mentor uses when the lesson is completed */
  completionDialogue: string;
}

export interface MentorLessonObjective {
  type: string;
  description: string;
  target?: string;
  required: number;
}
