/**
 * Mentor Lesson Generation
 *
 * Generates structured lessons that mentors assign to players.
 * Each lesson maps to quest objectives the game can track.
 */

import type {
  MentorLesson,
  MentorLessonObjective,
  MentorProfile,
  MentorSpecialty,
  Mentorship,
  TeachingStyle,
} from './mentor-types.js';

/** Lesson templates by specialty and difficulty */
interface LessonTemplate {
  topic: string;
  objectives: MentorLessonObjective[];
}

const LESSON_TEMPLATES: Record<MentorSpecialty, Record<string, LessonTemplate[]>> = {
  vocabulary: {
    beginner: [
      {
        topic: 'Basic Greetings',
        objectives: [
          { type: 'collect_vocabulary', description: 'Learn greeting words from the world', required: 3 },
          { type: 'use_vocabulary', description: 'Use greetings in conversation', required: 2 },
        ],
      },
      {
        topic: 'Everyday Objects',
        objectives: [
          { type: 'identify_object', description: 'Identify objects by their names', required: 3 },
          { type: 'collect_vocabulary', description: 'Collect vocabulary from labeled objects', required: 3 },
        ],
      },
    ],
    intermediate: [
      {
        topic: 'Shopping & Commerce',
        objectives: [
          { type: 'collect_vocabulary', description: 'Learn shopping vocabulary', required: 5 },
          { type: 'talk_to_npc', description: 'Practice shopping dialogue with a merchant', target: 'merchant', required: 1 },
        ],
      },
    ],
    advanced: [
      {
        topic: 'Abstract Concepts',
        objectives: [
          { type: 'use_vocabulary', description: 'Use abstract vocabulary in conversation', required: 5 },
          { type: 'complete_conversation', description: 'Have an in-depth discussion', required: 1 },
        ],
      },
    ],
  },
  grammar: {
    beginner: [
      {
        topic: 'Simple Sentences',
        objectives: [
          { type: 'use_vocabulary', description: 'Form simple sentences using basic grammar', required: 3 },
          { type: 'translation_challenge', description: 'Translate simple phrases', required: 2 },
        ],
      },
    ],
    intermediate: [
      {
        topic: 'Past Tense Practice',
        objectives: [
          { type: 'translation_challenge', description: 'Translate sentences in past tense', required: 3 },
          { type: 'complete_conversation', description: 'Tell a story about yesterday', required: 1 },
        ],
      },
    ],
    advanced: [
      {
        topic: 'Complex Structures',
        objectives: [
          { type: 'translation_challenge', description: 'Translate complex sentences', required: 4 },
          { type: 'use_vocabulary', description: 'Use subjunctive mood in dialogue', required: 3 },
        ],
      },
    ],
  },
  pronunciation: {
    beginner: [
      {
        topic: 'Sound Basics',
        objectives: [
          { type: 'pronunciation_check', description: 'Pronounce basic words clearly', required: 3 },
          { type: 'listening_comprehension', description: 'Listen and repeat', required: 2 },
        ],
      },
    ],
    intermediate: [
      {
        topic: 'Sentence Flow',
        objectives: [
          { type: 'pronunciation_check', description: 'Pronounce full sentences', required: 4 },
        ],
      },
    ],
    advanced: [
      {
        topic: 'Natural Speech',
        objectives: [
          { type: 'pronunciation_check', description: 'Pronounce complex phrases naturally', required: 5 },
          { type: 'complete_conversation', description: 'Have a flowing conversation', required: 1 },
        ],
      },
    ],
  },
  conversation: {
    beginner: [
      {
        topic: 'Meeting People',
        objectives: [
          { type: 'talk_to_npc', description: 'Introduce yourself to townspeople', required: 2 },
          { type: 'use_vocabulary', description: 'Use introduction phrases', required: 2 },
        ],
      },
    ],
    intermediate: [
      {
        topic: 'Asking for Help',
        objectives: [
          { type: 'talk_to_npc', description: 'Ask NPCs for directions or help', required: 2 },
          { type: 'follow_directions', description: 'Follow directions given in the target language', required: 1 },
        ],
      },
    ],
    advanced: [
      {
        topic: 'Debate & Discussion',
        objectives: [
          { type: 'complete_conversation', description: 'Sustain a multi-turn discussion', required: 2 },
        ],
      },
    ],
  },
  culture: {
    beginner: [
      {
        topic: 'Local Customs',
        objectives: [
          { type: 'talk_to_npc', description: 'Ask NPCs about local traditions', required: 2 },
          { type: 'visit_location', description: 'Visit a culturally significant location', required: 1 },
        ],
      },
    ],
    intermediate: [
      {
        topic: 'Festivals & Celebrations',
        objectives: [
          { type: 'listening_comprehension', description: 'Listen to a story about a local festival', required: 1 },
          { type: 'talk_to_npc', description: 'Discuss cultural traditions with NPCs', required: 2 },
        ],
      },
    ],
    advanced: [
      {
        topic: 'History & Heritage',
        objectives: [
          { type: 'listening_comprehension', description: 'Listen to historical accounts', required: 2 },
          { type: 'complete_conversation', description: 'Discuss cultural topics in depth', required: 1 },
        ],
      },
    ],
  },
  reading: {
    beginner: [
      {
        topic: 'Signs & Labels',
        objectives: [
          { type: 'identify_object', description: 'Read and identify labeled objects', required: 4 },
        ],
      },
    ],
    intermediate: [
      {
        topic: 'Written Instructions',
        objectives: [
          { type: 'follow_directions', description: 'Follow written directions', required: 2 },
          { type: 'translation_challenge', description: 'Translate written passages', required: 2 },
        ],
      },
    ],
    advanced: [
      {
        topic: 'Literature & Poetry',
        objectives: [
          { type: 'translation_challenge', description: 'Translate literary passages', required: 3 },
          { type: 'listening_comprehension', description: 'Comprehend a narrated story', required: 1 },
        ],
      },
    ],
  },
  listening: {
    beginner: [
      {
        topic: 'Understanding Speech',
        objectives: [
          { type: 'listening_comprehension', description: 'Listen to simple NPC stories', required: 2 },
        ],
      },
    ],
    intermediate: [
      {
        topic: 'Conversation Following',
        objectives: [
          { type: 'listening_comprehension', description: 'Follow and comprehend NPC dialogue', required: 2 },
          { type: 'talk_to_npc', description: 'Respond to what you heard', required: 1 },
        ],
      },
    ],
    advanced: [
      {
        topic: 'Rapid Speech Comprehension',
        objectives: [
          { type: 'listening_comprehension', description: 'Comprehend fast-paced dialogue', required: 3 },
          { type: 'complete_conversation', description: 'Participate in a rapid conversation', required: 1 },
        ],
      },
    ],
  },
};

/** Dialogue templates by teaching style */
const INTRO_DIALOGUE: Record<TeachingStyle, string> = {
  patient: "Let's take this one step at a time. Today we'll work on {topic}. Don't worry about mistakes — they're how we learn.",
  strict: "Today's lesson is {topic}. Pay close attention and practice until you get it right.",
  encouraging: "You're doing great! Ready for something exciting? Today we'll explore {topic}!",
  socratic: "I have a question for you — what do you know about {topic}? Let's discover the answer together.",
  practical: "Time to practice. Today's focus: {topic}. The best way to learn is by doing.",
};

const COMPLETION_DIALOGUE: Record<TeachingStyle, string> = {
  patient: "Wonderful work. You've made real progress with {topic}. Take your time reviewing what you learned.",
  strict: "Good. You've completed the {topic} lesson. Remember to keep practicing on your own.",
  encouraging: "Amazing job! You crushed it! Your {topic} skills have really improved!",
  socratic: "Interesting — do you see how much you've learned about {topic}? What surprised you most?",
  practical: "Lesson complete. Your {topic} practice is paying off. On to the next challenge.",
};

/**
 * Determine lesson difficulty based on mentorship progress.
 */
export function getLessonDifficulty(mentorship: Pick<Mentorship, 'progress' | 'lessonsCompleted'>): string {
  if (mentorship.progress < 30 || mentorship.lessonsCompleted < 3) return 'beginner';
  if (mentorship.progress < 70 || mentorship.lessonsCompleted < 8) return 'intermediate';
  return 'advanced';
}

/**
 * Generate a lesson for a mentorship.
 */
export function generateLesson(
  mentor: MentorProfile,
  mentorship: Pick<Mentorship, 'playerCharacterId' | 'specialty' | 'progress' | 'lessonsCompleted'>,
): MentorLesson {
  const difficulty = getLessonDifficulty(mentorship);
  const templates = LESSON_TEMPLATES[mentorship.specialty]?.[difficulty] || [];

  if (templates.length === 0) {
    // Fallback: generic lesson
    return {
      mentorCharacterId: mentor.characterId,
      playerCharacterId: mentorship.playerCharacterId,
      specialty: mentorship.specialty,
      difficulty,
      topic: `${mentorship.specialty} practice`,
      objectives: [
        { type: 'talk_to_npc', description: `Practice ${mentorship.specialty} with ${mentor.characterName}`, target: mentor.characterName, required: 1 },
      ],
      introDialogue: INTRO_DIALOGUE[mentor.teachingStyle].replace('{topic}', `${mentorship.specialty} practice`),
      completionDialogue: COMPLETION_DIALOGUE[mentor.teachingStyle].replace('{topic}', `${mentorship.specialty} practice`),
    };
  }

  // Select a template (cycle through based on lessons completed)
  const templateIndex = mentorship.lessonsCompleted % templates.length;
  const template = templates[templateIndex];

  return {
    mentorCharacterId: mentor.characterId,
    playerCharacterId: mentorship.playerCharacterId,
    specialty: mentorship.specialty,
    difficulty,
    topic: template.topic,
    objectives: template.objectives.map(o => ({ ...o })),
    introDialogue: INTRO_DIALOGUE[mentor.teachingStyle].replace('{topic}', template.topic),
    completionDialogue: COMPLETION_DIALOGUE[mentor.teachingStyle].replace('{topic}', template.topic),
  };
}

/**
 * Convert a mentor lesson to a quest-compatible format.
 */
export function lessonToQuestData(lesson: MentorLesson, worldId: string): {
  worldId: string;
  title: string;
  description: string;
  questType: string;
  difficulty: string;
  objectives: MentorLessonObjective[];
  assignedByCharacterId: string;
  assignedToCharacterId: string;
  tags: string[];
} {
  return {
    worldId,
    title: `Lesson: ${lesson.topic}`,
    description: `${lesson.introDialogue}\n\nComplete the objectives to finish this lesson.`,
    questType: 'mentor_lesson',
    difficulty: lesson.difficulty,
    objectives: lesson.objectives,
    assignedByCharacterId: lesson.mentorCharacterId,
    assignedToCharacterId: lesson.playerCharacterId,
    tags: ['mentor_lesson', `specialty:${lesson.specialty}`, `mentor:${lesson.mentorCharacterId}`],
  };
}
