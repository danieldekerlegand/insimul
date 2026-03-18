/**
 * Narrative Arc Templates for Main Quest Procedural Generation
 *
 * Defines story arc structures using Tracery grammars that can be
 * procedurally expanded with world-state bindings (NPCs, locations, etc.)
 * to produce coherent multi-stage main quests.
 */

/**
 * A single stage within a narrative arc.
 * Each stage maps to one quest in a quest chain.
 */
export interface NarrativeStage {
  /** Unique key within the arc */
  stageKey: string;
  /** Tracery grammar for generating the stage title */
  titleGrammar: Record<string, string[]>;
  /** Tracery grammar for generating the stage description */
  descriptionGrammar: Record<string, string[]>;
  /** Quest type category */
  questType: string;
  /** Difficulty level */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** Objective templates with placeholders bound at generation time */
  objectives: Array<{
    type: string;
    descriptionTemplate: string;
    requiredCount: number;
    targetPlaceholder?: string; // e.g. 'npc', 'location', 'item'
  }>;
  /** XP reward for this stage */
  xpReward: number;
  /** Tags for categorization */
  tags: string[];
}

/**
 * A complete narrative arc template.
 * Defines a story structure that unfolds across multiple quest stages.
 */
export interface NarrativeArc {
  /** Machine-readable ID */
  id: string;
  /** Tracery grammar for the arc name */
  nameGrammar: Record<string, string[]>;
  /** Tracery grammar for the arc's overarching description */
  descriptionGrammar: Record<string, string[]>;
  /** The thematic category of this arc */
  theme: 'arrival' | 'cultural' | 'mystery' | 'social' | 'exploration' | 'preservation';
  /** Minimum CEFR level to start this arc */
  minCefrLevel: string;
  /** Ordered stages that make up the arc */
  stages: NarrativeStage[];
  /** Bonus XP upon completing the entire arc */
  completionBonusXP: number;
  /** Achievement name granted on arc completion */
  achievement: string;
  /** Placeholders this arc requires from world state */
  requiredBindings: string[];
}

// ── Arc: The Newcomer's Welcome ──────────────────────────────────────────────
// A beginner-friendly arc about arriving in a new town and finding your place.

const newcomersWelcome: NarrativeArc = {
  id: 'newcomers-welcome',
  nameGrammar: {
    origin: ['#title#'],
    title: [
      "The Newcomer's Welcome",
      'A Stranger in #settlementName#',
      'Welcome to #settlementName#',
      'Finding Your Voice',
    ],
  },
  descriptionGrammar: {
    origin: ['#desc#'],
    desc: [
      'You have just arrived in #settlementName#. The locals are curious about the newcomer. Earn their trust by learning their language and customs.',
      'As a new arrival in #settlementName#, you must learn to communicate with the townspeople. Start with greetings and work your way into the community.',
      '#settlementName# welcomes you with open arms — but understanding its people requires learning their words. Begin your journey here.',
    ],
  },
  theme: 'arrival',
  minCefrLevel: 'A1',
  completionBonusXP: 250,
  achievement: 'Welcome to Town',
  requiredBindings: ['settlementName', 'guideName', 'merchantName', 'elderName'],
  stages: [
    {
      stageKey: 'first-greetings',
      titleGrammar: {
        origin: ['#title#'],
        title: ['First Greetings', 'Hello, #settlementName#!', 'Breaking the Ice'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          '#guideName# has offered to show you around. Start by learning how to greet the locals in their language.',
          'Your guide #guideName# suggests you begin by learning basic greetings. Introduce yourself to the townspeople.',
        ],
      },
      questType: 'vocabulary',
      difficulty: 'beginner',
      objectives: [
        { type: 'talk_to_npc', descriptionTemplate: 'Meet your guide #guideName#', requiredCount: 1, targetPlaceholder: 'npc' },
        { type: 'use_vocabulary', descriptionTemplate: 'Use 3 greeting words in conversation', requiredCount: 3 },
        { type: 'introduce_self', descriptionTemplate: 'Introduce yourself to a townsperson', requiredCount: 1, targetPlaceholder: 'npc' },
      ],
      xpReward: 50,
      tags: ['greetings', 'beginner', 'social'],
    },
    {
      stageKey: 'market-visit',
      titleGrammar: {
        origin: ['#title#'],
        title: ['The Market Square', "A Merchant's Offer", 'Goods and Words'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          '#merchantName# at the market is happy to teach you the names of common goods. Visit the market and learn some shopping vocabulary.',
          'The market in #settlementName# bustles with activity. #merchantName# invites you to learn the words for what they sell.',
        ],
      },
      questType: 'vocabulary',
      difficulty: 'beginner',
      objectives: [
        { type: 'visit_location', descriptionTemplate: 'Visit the market in #settlementName#', requiredCount: 1, targetPlaceholder: 'location' },
        { type: 'talk_to_npc', descriptionTemplate: 'Talk to #merchantName# about their wares', requiredCount: 1, targetPlaceholder: 'npc' },
        { type: 'collect_vocabulary', descriptionTemplate: 'Learn 5 new words from the market', requiredCount: 5 },
      ],
      xpReward: 75,
      tags: ['market', 'vocabulary', 'shopping'],
    },
    {
      stageKey: 'community-roots',
      titleGrammar: {
        origin: ['#title#'],
        title: ['Finding Your Place', 'Roots in #settlementName#', 'Part of the Community'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          '#elderName#, a respected elder, wants to hear your story. Tell them about yourself using the words you have learned.',
          'The elder #elderName# has taken an interest in you. Share your story and show that you belong in #settlementName#.',
        ],
      },
      questType: 'conversation',
      difficulty: 'beginner',
      objectives: [
        { type: 'talk_to_npc', descriptionTemplate: 'Speak with the elder #elderName#', requiredCount: 1, targetPlaceholder: 'npc' },
        { type: 'complete_conversation', descriptionTemplate: 'Have a sustained conversation about yourself', requiredCount: 1 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use 8 words you learned in earlier quests', requiredCount: 8 },
      ],
      xpReward: 100,
      tags: ['conversation', 'social', 'storytelling'],
    },
  ],
};

// ── Arc: The Lost Tradition ──────────────────────────────────────────────────
// An intermediate arc about uncovering and preserving a fading cultural practice.

const lostTradition: NarrativeArc = {
  id: 'lost-tradition',
  nameGrammar: {
    origin: ['#title#'],
    title: [
      'The Lost Tradition',
      'Echoes of the Past',
      'The Fading #tradition#',
      'Preserving #tradition#',
    ],
    tradition: ['Song', 'Dance', 'Craft', 'Story', 'Recipe', 'Ceremony'],
  },
  descriptionGrammar: {
    origin: ['#desc#'],
    desc: [
      'A beloved tradition in #settlementName# is being forgotten. #elderName# remembers it, but few others do. Help preserve it before it is lost.',
      'The people of #settlementName# are losing touch with a part of their heritage. #elderName# asks for your help in documenting and reviving it.',
    ],
  },
  theme: 'preservation',
  minCefrLevel: 'A2',
  completionBonusXP: 350,
  achievement: 'Keeper of Traditions',
  requiredBindings: ['settlementName', 'elderName', 'craftsmanName', 'locationName'],
  stages: [
    {
      stageKey: 'elders-request',
      titleGrammar: {
        origin: ['#title#'],
        title: ["The Elder's Request", 'A Plea for Memory', '#elderName# Remembers'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          '#elderName# approaches you with a request: help preserve a fading tradition. Listen to their story and learn the key vocabulary.',
          'Seek out #elderName#, who carries memories of an old tradition. Listen carefully and learn the words that describe it.',
        ],
      },
      questType: 'conversation',
      difficulty: 'intermediate',
      objectives: [
        { type: 'talk_to_npc', descriptionTemplate: 'Visit #elderName# and hear their request', requiredCount: 1, targetPlaceholder: 'npc' },
        { type: 'listening_comprehension', descriptionTemplate: 'Listen to #elderName# describe the tradition', requiredCount: 1, targetPlaceholder: 'npc' },
        { type: 'collect_vocabulary', descriptionTemplate: 'Learn 6 words related to the tradition', requiredCount: 6 },
      ],
      xpReward: 100,
      tags: ['cultural', 'listening', 'vocabulary'],
    },
    {
      stageKey: 'gathering-knowledge',
      titleGrammar: {
        origin: ['#title#'],
        title: ['Gathering the Pieces', 'Seeking the Craftsman', 'Words of the Trade'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          '#craftsmanName# may know more about the tradition. Visit their workshop at #locationName# and learn about the tools and techniques involved.',
          'Travel to #locationName# to find #craftsmanName#, who still practices parts of the old craft. Ask them about their work.',
        ],
      },
      questType: 'vocabulary',
      difficulty: 'intermediate',
      objectives: [
        { type: 'visit_location', descriptionTemplate: 'Visit #locationName#', requiredCount: 1, targetPlaceholder: 'location' },
        { type: 'talk_to_npc', descriptionTemplate: 'Interview #craftsmanName# about the tradition', requiredCount: 1, targetPlaceholder: 'npc' },
        { type: 'use_vocabulary', descriptionTemplate: 'Use 5 tradition-related words in conversation', requiredCount: 5 },
        { type: 'examine_object', descriptionTemplate: 'Examine 3 objects related to the craft', requiredCount: 3 },
      ],
      xpReward: 125,
      tags: ['cultural', 'exploration', 'vocabulary'],
    },
    {
      stageKey: 'sharing-tradition',
      titleGrammar: {
        origin: ['#title#'],
        title: ['Passing It On', 'The Tradition Lives', 'A Story Worth Telling'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          'You have gathered enough knowledge. Now share what you learned with the community. Tell others about the tradition in the local language.',
          'It is time to share the tradition with #settlementName#. Describe what you learned to others, using the vocabulary and phrases you collected.',
        ],
      },
      questType: 'conversation',
      difficulty: 'intermediate',
      objectives: [
        { type: 'complete_conversation', descriptionTemplate: 'Describe the tradition to 2 townspeople', requiredCount: 2 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use 10 tradition and cultural words', requiredCount: 10 },
        { type: 'describe_scene', descriptionTemplate: 'Describe the craft or ceremony in the target language', requiredCount: 1 },
      ],
      xpReward: 150,
      tags: ['cultural', 'storytelling', 'social'],
    },
  ],
};

// ── Arc: The Wanderer's Map ──────────────────────────────────────────────────
// An exploration arc about navigating the world using the target language.

const wanderersMap: NarrativeArc = {
  id: 'wanderers-map',
  nameGrammar: {
    origin: ['#title#'],
    title: [
      "The Wanderer's Map",
      'Charting #settlementName#',
      'Words as Waypoints',
      'The Language of Paths',
    ],
  },
  descriptionGrammar: {
    origin: ['#desc#'],
    desc: [
      'An old map of #settlementName# has been found, but its labels are in the local language. Navigate the landmarks to fill in the missing words.',
      '#guideName# challenges you to explore #settlementName# using only the target language for directions. Can you find every landmark?',
    ],
  },
  theme: 'exploration',
  minCefrLevel: 'A2',
  completionBonusXP: 300,
  achievement: 'Pathfinder',
  requiredBindings: ['settlementName', 'guideName', 'merchantName'],
  stages: [
    {
      stageKey: 'learning-directions',
      titleGrammar: {
        origin: ['#title#'],
        title: ['Which Way?', 'The Language of Directions', 'Left, Right, Forward'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          'Before you can explore, you need to know the words for directions. #guideName# will teach you the basics.',
          '#guideName# offers to teach you how to ask for and understand directions in the local language.',
        ],
      },
      questType: 'vocabulary',
      difficulty: 'beginner',
      objectives: [
        { type: 'talk_to_npc', descriptionTemplate: 'Learn direction words from #guideName#', requiredCount: 1, targetPlaceholder: 'npc' },
        { type: 'collect_vocabulary', descriptionTemplate: 'Learn 6 direction and location words', requiredCount: 6 },
        { type: 'use_vocabulary', descriptionTemplate: 'Practice using 4 direction words', requiredCount: 4 },
      ],
      xpReward: 75,
      tags: ['directions', 'vocabulary', 'navigation'],
    },
    {
      stageKey: 'guided-exploration',
      titleGrammar: {
        origin: ['#title#'],
        title: ['Following the Trail', 'Guided Tour', 'Step by Step'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          '#guideName# gives you directions in the target language to reach #merchantName# at the market. Follow them carefully.',
          'Follow #guideName#\'s instructions to navigate to key locations. Listen for direction words you learned.',
        ],
      },
      questType: 'conversation',
      difficulty: 'intermediate',
      objectives: [
        { type: 'follow_directions', descriptionTemplate: 'Follow spoken directions to reach the destination', requiredCount: 3 },
        { type: 'visit_location', descriptionTemplate: 'Reach the market in #settlementName#', requiredCount: 1, targetPlaceholder: 'location' },
        { type: 'ask_for_directions', descriptionTemplate: 'Ask someone for directions in the target language', requiredCount: 1, targetPlaceholder: 'npc' },
      ],
      xpReward: 100,
      tags: ['navigation', 'directions', 'listening'],
    },
    {
      stageKey: 'independent-navigation',
      titleGrammar: {
        origin: ['#title#'],
        title: ['On Your Own', 'The Complete Map', 'Navigator'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          'Now navigate #settlementName# independently. Visit 3 landmarks and describe each one in the target language.',
          'Prove your knowledge of #settlementName# by finding landmarks on your own and describing them to #guideName#.',
        ],
      },
      questType: 'conversation',
      difficulty: 'intermediate',
      objectives: [
        { type: 'discover_location', descriptionTemplate: 'Discover 3 landmarks in #settlementName#', requiredCount: 3, targetPlaceholder: 'location' },
        { type: 'describe_scene', descriptionTemplate: 'Describe 2 locations in the target language', requiredCount: 2 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use 8 direction and location words', requiredCount: 8 },
      ],
      xpReward: 125,
      tags: ['exploration', 'navigation', 'description'],
    },
  ],
};

// ── Arc: Bonds of Friendship ─────────────────────────────────────────────────
// A social arc about building deep connections with NPCs through language.

const bondsOfFriendship: NarrativeArc = {
  id: 'bonds-of-friendship',
  nameGrammar: {
    origin: ['#title#'],
    title: [
      'Bonds of Friendship',
      'Words That Connect',
      'The Language of Trust',
      'Heart of #settlementName#',
    ],
  },
  descriptionGrammar: {
    origin: ['#desc#'],
    desc: [
      'Language is more than words — it is how we connect. Build friendships with the people of #settlementName# by learning to express yourself in their tongue.',
      'The best way to learn a language is through its people. Form bonds with the residents of #settlementName# through conversation and kindness.',
    ],
  },
  theme: 'social',
  minCefrLevel: 'A2',
  completionBonusXP: 300,
  achievement: 'Friend of the People',
  requiredBindings: ['settlementName', 'friendName', 'merchantName', 'elderName'],
  stages: [
    {
      stageKey: 'making-acquaintances',
      titleGrammar: {
        origin: ['#title#'],
        title: ['Making Acquaintances', 'New Faces', 'The First Step'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          'Start by getting to know the people of #settlementName#. Talk to several residents and learn about their lives.',
          'Meet the townspeople of #settlementName#. Each conversation is a chance to learn something new.',
        ],
      },
      questType: 'conversation',
      difficulty: 'beginner',
      objectives: [
        { type: 'talk_to_npc', descriptionTemplate: 'Introduce yourself to 3 townspeople', requiredCount: 3, targetPlaceholder: 'npc' },
        { type: 'use_vocabulary', descriptionTemplate: 'Use 5 greeting and social words', requiredCount: 5 },
        { type: 'introduce_self', descriptionTemplate: 'Introduce yourself to #friendName#', requiredCount: 1, targetPlaceholder: 'npc' },
      ],
      xpReward: 75,
      tags: ['social', 'greetings', 'beginner'],
    },
    {
      stageKey: 'deepening-bonds',
      titleGrammar: {
        origin: ['#title#'],
        title: ['Deepening Bonds', 'Beyond Hello', 'Getting to Know You'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          '#friendName# wants to know more about you. Have a deeper conversation and ask questions about their life too.',
          'Your friendship with #friendName# is growing. Share stories and learn more about each other.',
        ],
      },
      questType: 'conversation',
      difficulty: 'intermediate',
      objectives: [
        { type: 'build_friendship', descriptionTemplate: 'Build rapport with #friendName# through conversation', requiredCount: 2, targetPlaceholder: 'npc' },
        { type: 'complete_conversation', descriptionTemplate: 'Have a 6-turn conversation with #friendName#', requiredCount: 1 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use 6 emotional and descriptive words', requiredCount: 6 },
      ],
      xpReward: 100,
      tags: ['social', 'conversation', 'friendship'],
    },
    {
      stageKey: 'act-of-kindness',
      titleGrammar: {
        origin: ['#title#'],
        title: ['An Act of Kindness', 'The Gift', 'True Friends'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          '#friendName# mentioned something they need. Find it and bring it to them as a gift, explaining your gesture in the target language.',
          'Show #friendName# your friendship through actions. Find a meaningful gift and present it to them.',
        ],
      },
      questType: 'conversation',
      difficulty: 'intermediate',
      objectives: [
        { type: 'collect_item', descriptionTemplate: 'Find a gift for #friendName#', requiredCount: 1 },
        { type: 'give_gift', descriptionTemplate: 'Present the gift to #friendName#', requiredCount: 1, targetPlaceholder: 'npc' },
        { type: 'complete_conversation', descriptionTemplate: 'Express your friendship in the target language', requiredCount: 1 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use 8 social and emotional vocabulary words', requiredCount: 8 },
      ],
      xpReward: 125,
      tags: ['social', 'gift', 'friendship'],
    },
  ],
};

// ── Arc: The Untold History ──────────────────────────────────────────────────
// An advanced arc about discovering the history of the settlement through language.

const untoldHistory: NarrativeArc = {
  id: 'untold-history',
  nameGrammar: {
    origin: ['#title#'],
    title: [
      'The Untold History',
      'Voices from the Past',
      'The Chronicle of #settlementName#',
      'Hidden Stories',
    ],
  },
  descriptionGrammar: {
    origin: ['#desc#'],
    desc: [
      '#settlementName# has a rich history that few remember. #elderName# holds the key to stories that have never been written down. Help document them.',
      'The history of #settlementName# lives in its language. Uncover forgotten stories by speaking with those who remember.',
    ],
  },
  theme: 'mystery',
  minCefrLevel: 'B1',
  completionBonusXP: 400,
  achievement: 'Town Historian',
  requiredBindings: ['settlementName', 'elderName', 'craftsmanName', 'locationName'],
  stages: [
    {
      stageKey: 'first-clues',
      titleGrammar: {
        origin: ['#title#'],
        title: ['First Clues', 'The Old Signs', 'Reading Between the Lines'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          'Start your investigation by reading old signs and inscriptions around #settlementName#. What stories do they tell?',
          'Ancient markers around #settlementName# hold clues to its past. Read them and learn the historical vocabulary.',
        ],
      },
      questType: 'vocabulary',
      difficulty: 'intermediate',
      objectives: [
        { type: 'read_sign', descriptionTemplate: 'Read 4 old signs or inscriptions', requiredCount: 4 },
        { type: 'collect_vocabulary', descriptionTemplate: 'Learn 8 historical vocabulary words', requiredCount: 8 },
        { type: 'visit_location', descriptionTemplate: 'Visit a historic site in #settlementName#', requiredCount: 1, targetPlaceholder: 'location' },
      ],
      xpReward: 125,
      tags: ['history', 'reading', 'vocabulary'],
    },
    {
      stageKey: 'oral-history',
      titleGrammar: {
        origin: ['#title#'],
        title: ['Oral History', 'The Elder Speaks', 'Living Memory'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          '#elderName# is willing to share stories of the past. Listen carefully — these stories have never been written down.',
          'Sit with #elderName# and listen to the oral history of #settlementName#. Every word matters.',
        ],
      },
      questType: 'conversation',
      difficulty: 'advanced',
      objectives: [
        { type: 'talk_to_npc', descriptionTemplate: 'Visit #elderName# to hear the town history', requiredCount: 1, targetPlaceholder: 'npc' },
        { type: 'listening_comprehension', descriptionTemplate: 'Answer questions about the historical story', requiredCount: 3, targetPlaceholder: 'npc' },
        { type: 'use_vocabulary', descriptionTemplate: 'Use 6 historical and temporal words', requiredCount: 6 },
      ],
      xpReward: 150,
      tags: ['history', 'listening', 'comprehension'],
    },
    {
      stageKey: 'the-chronicle',
      titleGrammar: {
        origin: ['#title#'],
        title: ['The Chronicle', 'Writing History', 'The Story Preserved'],
      },
      descriptionGrammar: {
        origin: ['#desc#'],
        desc: [
          'Write down what you have learned. Share the history with #craftsmanName# and others so it is never forgotten.',
          'Document the history of #settlementName# by retelling it to the community in the local language.',
        ],
      },
      questType: 'conversation',
      difficulty: 'advanced',
      objectives: [
        { type: 'write_response', descriptionTemplate: 'Write a summary of the town history', requiredCount: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Share the history with 2 townspeople', requiredCount: 2 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use 12 historical and narrative vocabulary words', requiredCount: 12 },
      ],
      xpReward: 175,
      tags: ['history', 'writing', 'storytelling'],
    },
  ],
};

// ── Registry ─────────────────────────────────────────────────────────────────

/** All available narrative arc templates, indexed by ID */
export const NARRATIVE_ARCS: Record<string, NarrativeArc> = {
  'newcomers-welcome': newcomersWelcome,
  'lost-tradition': lostTradition,
  'wanderers-map': wanderersMap,
  'bonds-of-friendship': bondsOfFriendship,
  'untold-history': untoldHistory,
};

/**
 * Get arcs suitable for a given CEFR level.
 * Returns arcs whose minCefrLevel is at or below the given level.
 */
export function getArcsForCefrLevel(cefrLevel: string): NarrativeArc[] {
  const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const playerIdx = order.indexOf(cefrLevel);
  if (playerIdx === -1) return Object.values(NARRATIVE_ARCS);

  return Object.values(NARRATIVE_ARCS).filter((arc) => {
    const arcIdx = order.indexOf(arc.minCefrLevel);
    return arcIdx <= playerIdx;
  });
}

/**
 * Get arcs by theme.
 */
export function getArcsByTheme(theme: NarrativeArc['theme']): NarrativeArc[] {
  return Object.values(NARRATIVE_ARCS).filter((arc) => arc.theme === theme);
}

/**
 * List summaries of all arcs for display purposes.
 */
export function listNarrativeArcs(): Array<{
  id: string;
  theme: string;
  minCefrLevel: string;
  stageCount: number;
  completionBonusXP: number;
  achievement: string;
}> {
  return Object.values(NARRATIVE_ARCS).map((arc) => ({
    id: arc.id,
    theme: arc.theme,
    minCefrLevel: arc.minCefrLevel,
    stageCount: arc.stages.length,
    completionBonusXP: arc.completionBonusXP,
    achievement: arc.achievement,
  }));
}
