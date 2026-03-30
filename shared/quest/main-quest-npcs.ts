/**
 * Main Quest NPC Definitions
 *
 * Defines the writer's associates — special NPCs tied to the "Missing Writer"
 * main quest. Each NPC is linked to specific chapters and provides leads,
 * context, and personality-colored perspectives on the disappearance.
 */

/** Roles for main quest NPCs */
export type MainQuestNPCRole =
  | 'the_editor'
  | 'the_neighbor'
  | 'the_patron'
  | 'the_scholar'
  | 'the_confidant';

/** Chapter relevance mapping — which chapters each NPC is active for */
export interface MainQuestNPCDefinition {
  role: MainQuestNPCRole;
  /** Occupation the NPC should have */
  occupation: string;
  /** Business types this NPC could work at (first match wins) */
  preferredBusinessTypes: string[];
  /** Chapters where this NPC provides leads (shows quest indicator) */
  activeChapterIds: string[];
  /** Big Five personality template */
  personality: {
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  /** Conversation context injected when player talks to this NPC */
  conversationContext: string;
  /** Per-chapter dialogue hints for the LLM */
  chapterHints: Record<string, string>;
}

/**
 * The 5 writer's associates. Their personalities color how they discuss
 * the missing writer, and their chapter assignments gate information flow.
 */
export const MAIN_QUEST_NPC_DEFINITIONS: MainQuestNPCDefinition[] = [
  {
    role: 'the_editor',
    occupation: 'Editor',
    preferredBusinessTypes: ['Shop', 'School', 'TownHall'],
    activeChapterIds: ['ch1_assignment_abroad', 'ch2_following_the_trail'],
    personality: {
      openness: 0.3,
      conscientiousness: 0.8,
      extroversion: 0.2,
      agreeableness: 0.4,
      neuroticism: 0.3,
    },
    conversationContext:
      'You are the editor who published the missing writer\'s work. You are professional, factual, and measured. You knew the writer through their manuscripts and correspondence. You noticed the writer became increasingly secretive in their final submissions.',
    chapterHints: {
      ch1_assignment_abroad:
        'The player is new in town investigating the writer\'s disappearance. Introduce yourself as the editor. Share basic facts: when the writer was last seen, what they were working on. Be cautious but helpful — you want the truth found.',
      ch2_following_the_trail:
        'Share more details about the writer\'s final manuscript. Mention that it dealt with a controversial local topic. Suggest the player talk to the writer\'s neighbor for personal details.',
    },
  },
  {
    role: 'the_neighbor',
    occupation: 'Retired',
    preferredBusinessTypes: [],
    activeChapterIds: ['ch2_following_the_trail', 'ch3_the_inner_circle'],
    personality: {
      openness: 0.5,
      conscientiousness: 0.2,
      extroversion: 0.7,
      agreeableness: 0.6,
      neuroticism: 0.5,
    },
    conversationContext:
      'You lived next door to the missing writer. You are gossipy, informal, and observant. You noticed visitors coming and going at odd hours. You heard arguments. You care about the writer but also enjoy the drama of the mystery.',
    chapterHints: {
      ch2_following_the_trail:
        'Share observations about the writer\'s daily habits. Mention a wealthy patron who visited frequently. You noticed the writer seemed worried in their last weeks. Be chatty and prone to tangents.',
      ch3_the_inner_circle:
        'Open up about the night the writer disappeared. You heard a loud argument. Describe a mysterious visitor you didn\'t recognize. Suggest the player investigate the patron\'s connection.',
    },
  },
  {
    role: 'the_patron',
    occupation: 'Merchant',
    preferredBusinessTypes: ['Bank', 'JewelryStore', 'Shop', 'RealEstateOffice'],
    activeChapterIds: ['ch3_the_inner_circle', 'ch4_hidden_messages'],
    personality: {
      openness: 0.1,
      conscientiousness: 0.7,
      extroversion: 0.5,
      agreeableness: 0.1,
      neuroticism: 0.4,
    },
    conversationContext:
      'You are the wealthy patron who funded the writer\'s work. You are formal, evasive, and guarded. You have your own secrets about why you funded the research. You deflect personal questions but drop hints when pressed.',
    chapterHints: {
      ch3_the_inner_circle:
        'Acknowledge funding the writer but downplay the relationship. Claim it was purely a business arrangement. Be evasive about what the writer was researching. If pressed, hint that the research touched on local history that powerful people would rather forget.',
      ch4_hidden_messages:
        'Under pressure, reveal that the writer was investigating a historical event that implicates local elites. Admit you funded the research because you wanted the truth told. Suggest the player consult the scholar at the library for academic context.',
    },
  },
  {
    role: 'the_scholar',
    occupation: 'Professor',
    preferredBusinessTypes: ['School', 'University'],
    activeChapterIds: ['ch4_hidden_messages', 'ch5_the_truth_emerges'],
    personality: {
      openness: 0.9,
      conscientiousness: 0.6,
      extroversion: 0.3,
      agreeableness: 0.5,
      neuroticism: 0.2,
    },
    conversationContext:
      'You are a scholar who studies the same subject the writer was investigating. You are analytical, precise, and intellectually passionate. You admired the writer\'s work and corresponded with them about their research. You have academic evidence that supports the writer\'s controversial findings.',
    chapterHints: {
      ch4_hidden_messages:
        'Discuss the writer\'s research topic from an academic perspective. Explain why the findings are controversial. Share correspondence you had with the writer. Mention that the writer confided in a close friend about feeling threatened.',
      ch5_the_truth_emerges:
        'Present the academic evidence you\'ve gathered. Debate the implications with the player. Reveal that the writer told you they had found definitive proof but needed to hide it. Direct the player to the writer\'s closest friend — the confidant.',
    },
  },
  {
    role: 'the_confidant',
    occupation: 'Innkeeper',
    preferredBusinessTypes: ['Hotel', 'Bar', 'Restaurant'],
    activeChapterIds: ['ch5_the_truth_emerges', 'ch6_the_final_chapter'],
    personality: {
      openness: 0.6,
      conscientiousness: 0.4,
      extroversion: 0.4,
      agreeableness: 0.8,
      neuroticism: 0.6,
    },
    conversationContext:
      'You are the writer\'s closest and most trusted friend. You are emotional, loyal, and protective. You know the truth about where the writer went but have been sworn to secrecy. You will only share the final clue when you trust the player enough.',
    chapterHints: {
      ch5_the_truth_emerges:
        'Be guarded at first. Test the player\'s sincerity and knowledge of the case. If they demonstrate real understanding of the writer\'s work and motivations, begin to open up. Hint that the writer is alive.',
      ch6_the_final_chapter:
        'Finally trust the player enough to reveal the truth: the writer went into voluntary hiding to protect the evidence. Share the location where the writer can be found. Be emotional — you\'ve carried this secret for a long time.',
    },
  },
];

/** Tag value stored in character generationConfig to identify main quest NPCs */
export const MAIN_QUEST_NPC_TAG = 'main_quest_npc';

/**
 * Check if a character is a main quest NPC by examining generationConfig.
 */
export function isMainQuestNPC(character: { generationConfig?: Record<string, any> | null }): boolean {
  return character.generationConfig?.mainQuestRole != null;
}

/**
 * Get the main quest role from a character's generationConfig.
 */
export function getMainQuestRole(
  character: { generationConfig?: Record<string, any> | null },
): MainQuestNPCRole | null {
  return (character.generationConfig?.mainQuestRole as MainQuestNPCRole) ?? null;
}

/**
 * Get the NPC definition for a character's main quest role.
 */
export function getMainQuestNPCDefinition(
  character: { generationConfig?: Record<string, any> | null },
): MainQuestNPCDefinition | null {
  const role = getMainQuestRole(character);
  if (!role) return null;
  return MAIN_QUEST_NPC_DEFINITIONS.find(d => d.role === role) ?? null;
}

/**
 * Check if a main quest NPC should show a quest indicator for a given chapter.
 */
export function isNPCActiveForChapter(
  character: { generationConfig?: Record<string, any> | null },
  chapterId: string,
): boolean {
  const def = getMainQuestNPCDefinition(character);
  if (!def) return false;
  return def.activeChapterIds.includes(chapterId);
}
