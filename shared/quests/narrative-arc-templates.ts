/**
 * Narrative Arc Templates
 *
 * Pre-built story arc templates that define the main quest structure.
 * Each template provides a full 3-act story with chapters and subquests,
 * progressively increasing language difficulty from A1 to B2+.
 */

import type { NarrativeArcTemplate } from '../narrative-arc-types.js';

/**
 * "The Lost Heritage" — A newcomer discovers the town's forgotten history
 * and helps preserve its cultural legacy.
 *
 * Act 1: Arrive, meet key NPCs, learn basic communication
 * Act 2: Uncover historical mysteries, explore the town deeply
 * Act 3: Organize a cultural festival, deliver a speech, save a tradition
 */
const theLostHeritage: NarrativeArcTemplate = {
  id: 'the_lost_heritage',
  name: 'The Lost Heritage',
  description: 'A newcomer arrives in town and discovers its forgotten cultural heritage, ultimately helping preserve it for future generations.',
  targetLanguage: '',
  estimatedHours: 20,
  requiredArchetypes: ['mayor', 'historian', 'elder', 'merchant', 'artisan'],
  requiredLocationTypes: ['town_hall', 'library', 'market', 'workshop', 'plaza'],
  acts: [
    {
      actType: 'introduction',
      title: 'A New Beginning',
      description: 'You arrive in a small town where nobody knows you. Learn to communicate, make friends, and find your place.',
      chapters: [
        {
          key: 'arrival',
          order: 0,
          title: 'First Steps',
          narrativeSummary: 'You step off the bus into a charming town square. The locals eye you curiously — time to introduce yourself.',
          requiredCefrLevel: 'A1',
          prerequisiteChapterKeys: [],
          vocabularyDomains: ['greetings', 'introductions', 'basic_phrases'],
          subQuests: [
            {
              key: 'greet_locals',
              title: 'Hello, Neighbor',
              description: 'Greet three townspeople and introduce yourself.',
              questType: 'conversation',
              difficulty: 'beginner',
              cefrLevel: 'A1',
              estimatedMinutes: 10,
              objectives: [
                { type: 'talk_to_npc', description: 'Greet townspeople', target: 'any', required: 3 },
                { type: 'use_vocabulary', description: 'Use greeting phrases', target: 'greetings', required: 3 },
              ],
              vocabularyDomains: ['greetings'],
              tags: ['social', 'greetings'],
            },
            {
              key: 'find_lodging',
              title: 'A Place to Stay',
              description: 'Ask around to find a place to stay for the night.',
              questType: 'conversation',
              difficulty: 'beginner',
              cefrLevel: 'A1',
              estimatedMinutes: 15,
              objectives: [
                { type: 'talk_to_npc', description: 'Ask about lodging', target: 'any', required: 2 },
                { type: 'visit_location', description: 'Find the inn or guest house', target: 'lodging', required: 1 },
              ],
              vocabularyDomains: ['directions', 'basic_phrases'],
              tags: ['navigation', 'practical'],
            },
          ],
        },
        {
          key: 'getting_settled',
          order: 1,
          title: 'Getting Settled',
          narrativeSummary: 'With a roof over your head, it\'s time to explore the town and meet its key figures.',
          requiredCefrLevel: 'A1',
          prerequisiteChapterKeys: ['arrival'],
          vocabularyDomains: ['directions', 'places', 'occupations'],
          subQuests: [
            {
              key: 'explore_town',
              title: 'Town Tour',
              description: 'Visit the major landmarks and learn their names.',
              questType: 'vocabulary',
              difficulty: 'beginner',
              cefrLevel: 'A1',
              estimatedMinutes: 15,
              objectives: [
                { type: 'visit_location', description: 'Visit key locations', target: 'landmark', required: 4 },
                { type: 'collect_vocabulary', description: 'Learn place names', target: 'places', required: 6 },
              ],
              vocabularyDomains: ['places', 'directions'],
              tags: ['exploration', 'vocabulary'],
            },
            {
              key: 'meet_mayor',
              title: 'The Mayor\'s Welcome',
              description: 'Visit the town hall and formally introduce yourself to the mayor.',
              questType: 'conversation',
              difficulty: 'beginner',
              cefrLevel: 'A1',
              estimatedMinutes: 10,
              objectives: [
                { type: 'visit_location', description: 'Go to town hall', target: 'town_hall', required: 1 },
                { type: 'complete_conversation', description: 'Talk with the mayor', target: 'mayor', required: 1 },
              ],
              vocabularyDomains: ['introductions', 'formal_speech'],
              tags: ['story', 'social'],
            },
            {
              key: 'first_errand',
              title: 'A Small Favor',
              description: 'The mayor asks you to deliver a message to the market. Navigate there and complete the errand.',
              questType: 'conversation',
              difficulty: 'beginner',
              cefrLevel: 'A1',
              estimatedMinutes: 15,
              objectives: [
                { type: 'deliver_item', description: 'Deliver the mayor\'s message', target: 'merchant', required: 1 },
                { type: 'use_vocabulary', description: 'Use direction words', target: 'directions', required: 4 },
              ],
              vocabularyDomains: ['directions', 'commerce'],
              tags: ['story', 'navigation'],
            },
          ],
        },
        {
          key: 'the_old_library',
          order: 2,
          title: 'The Old Library',
          narrativeSummary: 'While exploring, you stumble upon a dusty, neglected library. The historian mentions it holds secrets about the town\'s past.',
          requiredCefrLevel: 'A2',
          prerequisiteChapterKeys: ['getting_settled'],
          vocabularyDomains: ['reading', 'history', 'descriptions'],
          subQuests: [
            {
              key: 'discover_library',
              title: 'Dusty Pages',
              description: 'Find the old library and talk to the historian about it.',
              questType: 'conversation',
              difficulty: 'beginner',
              cefrLevel: 'A2',
              estimatedMinutes: 10,
              objectives: [
                { type: 'visit_location', description: 'Find the library', target: 'library', required: 1 },
                { type: 'talk_to_npc', description: 'Talk to the historian', target: 'historian', required: 1 },
              ],
              vocabularyDomains: ['reading', 'history'],
              tags: ['story', 'discovery'],
            },
            {
              key: 'first_clue',
              title: 'A Faded Letter',
              description: 'The historian shows you a faded letter written in the old language. Try to understand its meaning.',
              questType: 'translation',
              difficulty: 'intermediate',
              cefrLevel: 'A2',
              estimatedMinutes: 15,
              objectives: [
                { type: 'collect_item', description: 'Examine the faded letter', target: 'letter', required: 1 },
                { type: 'use_vocabulary', description: 'Translate key phrases', target: 'history', required: 5 },
              ],
              vocabularyDomains: ['history', 'reading'],
              tags: ['story', 'mystery', 'translation'],
            },
          ],
        },
      ],
    },
    {
      actType: 'rising_action',
      title: 'Uncovering the Past',
      description: 'The letter reveals hints of a forgotten tradition. You investigate deeper, building language skills and community trust along the way.',
      chapters: [
        {
          key: 'the_investigation',
          order: 3,
          title: 'Following the Trail',
          narrativeSummary: 'The faded letter mentions a craftsperson who once practiced a dying art. You set out to learn more.',
          requiredCefrLevel: 'A2',
          prerequisiteChapterKeys: ['the_old_library'],
          vocabularyDomains: ['crafts', 'descriptions', 'past_tense'],
          subQuests: [
            {
              key: 'ask_around',
              title: 'Word of Mouth',
              description: 'Ask different townspeople what they know about the old craft tradition.',
              questType: 'conversation',
              difficulty: 'intermediate',
              cefrLevel: 'A2',
              estimatedMinutes: 15,
              objectives: [
                { type: 'talk_to_npc', description: 'Interview townspeople', target: 'any', required: 4 },
                { type: 'use_vocabulary', description: 'Use past tense phrases', target: 'past_tense', required: 4 },
              ],
              vocabularyDomains: ['past_tense', 'descriptions'],
              tags: ['story', 'investigation'],
            },
            {
              key: 'find_artisan',
              title: 'The Last Artisan',
              description: 'Track down the elderly artisan who still remembers the old craft.',
              questType: 'conversation',
              difficulty: 'intermediate',
              cefrLevel: 'A2',
              estimatedMinutes: 20,
              objectives: [
                { type: 'visit_location', description: 'Find the artisan\'s workshop', target: 'workshop', required: 1 },
                { type: 'complete_conversation', description: 'Convince the artisan to talk', target: 'artisan', required: 1 },
              ],
              vocabularyDomains: ['crafts', 'persuasion'],
              tags: ['story', 'discovery'],
            },
          ],
        },
        {
          key: 'learning_the_craft',
          order: 4,
          title: 'The Apprentice',
          narrativeSummary: 'The artisan agrees to teach you the basics. As you learn the craft, you also learn the language woven into it.',
          requiredCefrLevel: 'B1',
          prerequisiteChapterKeys: ['the_investigation'],
          vocabularyDomains: ['crafts', 'instructions', 'materials'],
          subQuests: [
            {
              key: 'gather_materials',
              title: 'The Right Materials',
              description: 'The artisan sends you to gather supplies from around town.',
              questType: 'vocabulary',
              difficulty: 'intermediate',
              cefrLevel: 'B1',
              estimatedMinutes: 20,
              objectives: [
                { type: 'collect_item', description: 'Gather craft materials', target: 'material', required: 3 },
                { type: 'use_vocabulary', description: 'Name materials correctly', target: 'materials', required: 6 },
              ],
              vocabularyDomains: ['materials', 'commerce'],
              tags: ['story', 'collection'],
            },
            {
              key: 'first_lesson',
              title: 'Hands and Words',
              description: 'Follow the artisan\'s instructions to create your first piece. The instructions are all in the target language.',
              questType: 'grammar',
              difficulty: 'intermediate',
              cefrLevel: 'B1',
              estimatedMinutes: 20,
              objectives: [
                { type: 'complete_conversation', description: 'Follow craft instructions', target: 'artisan', required: 1 },
                { type: 'use_vocabulary', description: 'Use imperative and instructional verbs', target: 'instructions', required: 8 },
              ],
              vocabularyDomains: ['instructions', 'crafts'],
              tags: ['story', 'learning'],
            },
            {
              key: 'the_secret_pattern',
              title: 'Hidden in the Pattern',
              description: 'Your craft piece reveals a symbol that matches the one in the faded letter. The artisan is stunned.',
              questType: 'cultural',
              difficulty: 'intermediate',
              cefrLevel: 'B1',
              estimatedMinutes: 15,
              objectives: [
                { type: 'complete_conversation', description: 'Discuss the discovery with the artisan', target: 'artisan', required: 1 },
                { type: 'talk_to_npc', description: 'Share the news with the historian', target: 'historian', required: 1 },
              ],
              vocabularyDomains: ['history', 'culture'],
              tags: ['story', 'revelation'],
            },
          ],
        },
        {
          key: 'community_support',
          order: 5,
          title: 'Rallying the Town',
          narrativeSummary: 'The discovery excites the town. But not everyone is convinced the old ways are worth preserving. You must build support.',
          requiredCefrLevel: 'B1',
          prerequisiteChapterKeys: ['learning_the_craft'],
          vocabularyDomains: ['opinions', 'persuasion', 'community'],
          subQuests: [
            {
              key: 'convince_skeptic',
              title: 'The Skeptic',
              description: 'A prominent townsperson doesn\'t believe the old traditions matter. Convince them otherwise.',
              questType: 'conversation',
              difficulty: 'intermediate',
              cefrLevel: 'B1',
              estimatedMinutes: 20,
              objectives: [
                { type: 'complete_conversation', description: 'Debate with the skeptic', target: 'skeptic', required: 1 },
                { type: 'use_vocabulary', description: 'Use opinion and persuasion phrases', target: 'persuasion', required: 6 },
              ],
              vocabularyDomains: ['opinions', 'persuasion'],
              tags: ['story', 'social', 'debate'],
            },
            {
              key: 'gather_supporters',
              title: 'Allies and Friends',
              description: 'Talk to townspeople and gather support for a heritage preservation event.',
              questType: 'conversation',
              difficulty: 'intermediate',
              cefrLevel: 'B1',
              estimatedMinutes: 20,
              objectives: [
                { type: 'talk_to_npc', description: 'Recruit supporters', target: 'any', required: 5 },
                { type: 'use_vocabulary', description: 'Use community and cooperation vocabulary', target: 'community', required: 6 },
              ],
              vocabularyDomains: ['community', 'persuasion'],
              tags: ['story', 'social'],
            },
          ],
        },
      ],
    },
    {
      actType: 'climax_resolution',
      title: 'The Heritage Festival',
      description: 'With the town behind you, organize and lead a festival celebrating the rediscovered tradition. Your language skills are put to the ultimate test.',
      chapters: [
        {
          key: 'festival_planning',
          order: 6,
          title: 'The Grand Plan',
          narrativeSummary: 'The mayor gives you permission to organize the Heritage Festival. There\'s a lot to arrange.',
          requiredCefrLevel: 'B1',
          prerequisiteChapterKeys: ['community_support'],
          vocabularyDomains: ['planning', 'events', 'commerce'],
          subQuests: [
            {
              key: 'plan_festival',
              title: 'The Organizer',
              description: 'Meet with the mayor and key figures to plan the festival logistics.',
              questType: 'conversation',
              difficulty: 'intermediate',
              cefrLevel: 'B1',
              estimatedMinutes: 15,
              objectives: [
                { type: 'complete_conversation', description: 'Plan with the mayor', target: 'mayor', required: 1 },
                { type: 'use_vocabulary', description: 'Use planning vocabulary', target: 'planning', required: 6 },
              ],
              vocabularyDomains: ['planning', 'events'],
              tags: ['story', 'planning'],
            },
            {
              key: 'arrange_supplies',
              title: 'Setting the Stage',
              description: 'Visit merchants and craftspeople to arrange supplies and decorations.',
              questType: 'conversation',
              difficulty: 'intermediate',
              cefrLevel: 'B1',
              estimatedMinutes: 20,
              objectives: [
                { type: 'talk_to_npc', description: 'Negotiate with merchants', target: 'merchant', required: 3 },
                { type: 'collect_item', description: 'Gather festival supplies', target: 'supply', required: 3 },
              ],
              vocabularyDomains: ['commerce', 'materials'],
              tags: ['story', 'commerce'],
            },
          ],
        },
        {
          key: 'the_festival',
          order: 7,
          title: 'Festival Day',
          narrativeSummary: 'The day has arrived. The town square is decorated, and everyone has gathered. This is the moment everything has built towards.',
          requiredCefrLevel: 'B2',
          prerequisiteChapterKeys: ['festival_planning'],
          vocabularyDomains: ['culture', 'emotions', 'narrative'],
          subQuests: [
            {
              key: 'welcome_speech',
              title: 'Words for the Town',
              description: 'Deliver a welcome speech at the festival in the target language.',
              questType: 'conversation',
              difficulty: 'advanced',
              cefrLevel: 'B2',
              estimatedMinutes: 15,
              objectives: [
                { type: 'complete_conversation', description: 'Deliver the welcome speech', target: 'audience', required: 1 },
                { type: 'use_vocabulary', description: 'Use formal and emotional vocabulary', target: 'narrative', required: 10 },
              ],
              vocabularyDomains: ['narrative', 'emotions', 'formal_speech'],
              tags: ['story', 'climax', 'speech'],
            },
            {
              key: 'craft_demonstration',
              title: 'The Living Tradition',
              description: 'Demonstrate the rediscovered craft alongside the artisan, explaining each step to the audience.',
              questType: 'cultural',
              difficulty: 'advanced',
              cefrLevel: 'B2',
              estimatedMinutes: 20,
              objectives: [
                { type: 'complete_conversation', description: 'Explain the craft to the audience', target: 'audience', required: 1 },
                { type: 'use_vocabulary', description: 'Use craft and instructional vocabulary', target: 'crafts', required: 8 },
              ],
              vocabularyDomains: ['crafts', 'instructions', 'culture'],
              tags: ['story', 'climax', 'cultural'],
            },
            {
              key: 'closing_ceremony',
              title: 'A New Chapter',
              description: 'The elder and mayor thank you. The town has rediscovered a part of itself. You\'ve found your place.',
              questType: 'conversation',
              difficulty: 'advanced',
              cefrLevel: 'B2',
              estimatedMinutes: 15,
              objectives: [
                { type: 'complete_conversation', description: 'Share a moment with the elder', target: 'elder', required: 1 },
                { type: 'complete_conversation', description: 'Receive the mayor\'s thanks', target: 'mayor', required: 1 },
              ],
              vocabularyDomains: ['emotions', 'narrative', 'culture'],
              tags: ['story', 'resolution', 'ending'],
            },
          ],
        },
      ],
    },
  ],
};

/** Registry of all available narrative arc templates */
export const narrativeArcTemplates: Record<string, NarrativeArcTemplate> = {
  'the_lost_heritage': theLostHeritage,
};

/**
 * Get a template by ID, applying the target language.
 */
export function getNarrativeArcTemplate(
  templateId: string,
  targetLanguage: string,
): NarrativeArcTemplate | null {
  const template = narrativeArcTemplates[templateId];
  if (!template) return null;
  return { ...template, targetLanguage };
}

/**
 * List available narrative arc template summaries.
 */
export function listNarrativeArcTemplates(): Array<{
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  totalChapters: number;
  totalSubQuests: number;
}> {
  return Object.values(narrativeArcTemplates).map(t => {
    let totalChapters = 0;
    let totalSubQuests = 0;
    for (const act of t.acts) {
      totalChapters += act.chapters.length;
      for (const chapter of act.chapters) {
        totalSubQuests += chapter.subQuests.length;
      }
    }
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      estimatedHours: t.estimatedHours,
      totalChapters,
      totalSubQuests,
    };
  });
}
