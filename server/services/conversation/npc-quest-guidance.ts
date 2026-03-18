/**
 * NPC Quest Guidance Builder
 *
 * Builds system prompt guidance for NPCs to steer conversations toward
 * helping the player complete active quest objectives. When a player talks
 * to an NPC who is the target of a quest objective (or the quest giver),
 * the NPC receives context about what the player needs to accomplish and
 * naturally guides the conversation accordingly.
 */

import type { Quest } from '@shared/schema';
import type { QuestParticipant, NpcRole } from '../../../shared/language/multi-npc-quest-scenarios.js';
import { isConversationOnlyQuest as checkConversationOnly } from '@shared/quest-objective-types';

// ── Types ────────────────────────────────────────────────────────────────────

export interface QuestObjective {
  type: string;
  description?: string;
  target?: string;
  targetId?: string;
  required?: number;
  current?: number;
  completed?: boolean;
  keywords?: string[];
  vocabulary?: string[];
  grammarPattern?: string;
}

export type GuidanceRole = 'quest_giver' | 'objective_target' | 'related_npc' | 'participant';

export interface QuestGuidanceContext {
  questId: string;
  questTitle: string;
  questDescription: string;
  role: GuidanceRole;
  relevantObjectives: QuestObjective[];
  /** For multi-NPC quests, the participant's specific role */
  participantRole?: NpcRole;
}

export interface QuestGuidanceResult {
  hasGuidance: boolean;
  systemPromptAddition: string;
  guidanceContexts: QuestGuidanceContext[];
}

// ── Objective type to guidance strategy mapping ─────────────────────────────

interface GuidanceStrategy {
  /** Instruction for the NPC on how to guide the conversation */
  buildGuidance(objective: QuestObjective, role: string): string;
}

const GUIDANCE_STRATEGIES: Record<string, GuidanceStrategy> = {
  talk_to_npc: {
    buildGuidance(obj) {
      return `The player needs to talk to you to complete a quest objective. Be welcoming and engage them in a meaningful conversation. Ask about their journey and share something about yourself.`;
    },
  },

  conversation_initiation: {
    buildGuidance(obj) {
      return `You are proactively approaching this player. Open with a natural greeting and engage them in conversation. Evaluate whether the player understands your opening and responds appropriately in the target language. Speak clearly and give them a chance to respond.`;
    },
  },

  complete_conversation: {
    buildGuidance(obj) {
      const remaining = (obj.required || 1) - (obj.current || 0);
      return `The player needs to sustain a conversation for ${remaining} more turn(s). Keep the dialogue engaging — ask follow-up questions, share anecdotes, and introduce new topics to keep them talking. Don't rush the conversation.`;
    },
  },

  use_vocabulary: {
    buildGuidance(obj) {
      const words = obj.vocabulary || obj.keywords || [];
      if (words.length === 0) return '';
      const remaining = (obj.required || words.length) - (obj.current || 0);
      return `The player needs to use these target-language words in conversation: ${words.join(', ')}. Naturally steer the topic toward situations where these words would be relevant. If the player struggles, use the words yourself in context and gently encourage them to try using the words too. They need to use ${remaining} more word(s).`;
    },
  },

  collect_vocabulary: {
    buildGuidance(obj) {
      return `The player is collecting vocabulary words. Mention interesting objects or places nearby that they might want to investigate. Give them hints about where to find labeled objects in the area.`;
    },
  },

  identify_object: {
    buildGuidance(obj) {
      return `The player needs to identify objects by their target-language names. Point out objects around you and teach them the names in the target language. Encourage them to try naming things.`;
    },
  },

  deliver_item: {
    buildGuidance(obj) {
      const itemName = obj.target || 'the item';
      return `The player should deliver "${itemName}" to you. If they have it, acknowledge the delivery with gratitude. If they don't seem to have it, remind them what you need and hint at where they might find it.`;
    },
  },

  listening_comprehension: {
    buildGuidance(obj) {
      return `The player needs to practice listening comprehension. Tell them a short story or describe an event in the target language, then ask them questions about it. Speak clearly and at an appropriate pace for their level.`;
    },
  },

  pronunciation_check: {
    buildGuidance(obj) {
      return `The player needs to practice pronunciation. Introduce words and phrases in the target language and encourage them to repeat after you. Praise good attempts and gently model correct pronunciation.`;
    },
  },

  translation_challenge: {
    buildGuidance(obj) {
      return `The player needs to practice translation. Naturally introduce phrases in the target language and ask them to explain what they mean, or say something in English and ask them how they'd say it in the target language.`;
    },
  },

  follow_directions: {
    buildGuidance(obj) {
      return `The player needs to follow directions in the target language. Give them step-by-step instructions using the target language. Start simple and progressively use more complex directional vocabulary.`;
    },
  },

  listen_and_repeat: {
    buildGuidance(obj) {
      const remaining = (obj.required || 1) - (obj.current || 0);
      return `The player needs to listen and repeat phrases. Say a phrase in the target language clearly, then ask them to repeat it. They need ${remaining} more phrase(s).`;
    },
  },

  ask_for_directions: {
    buildGuidance(obj) {
      return `The player needs to ask you for directions in the target language. Mention nearby locations and encourage them to ask how to get there using the target language.`;
    },
  },

  order_food: {
    buildGuidance(obj) {
      return `The player needs to order food or drinks from you in the target language. Present menu options and encourage them to place an order using target-language phrases.`;
    },
  },

  haggle_price: {
    buildGuidance(obj) {
      return `The player needs to negotiate a price with you in the target language. Quote a price for an item and encourage them to haggle using target-language number and bargaining vocabulary.`;
    },
  },

  introduce_self: {
    buildGuidance(obj) {
      return `The player needs to introduce themselves in the target language. Greet them and ask them to tell you about themselves — their name, where they're from, what they do.`;
    },
  },

  describe_scene: {
    buildGuidance(obj) {
      return `The player needs to describe their surroundings in the target language. Ask them what they see or what the area looks like, encouraging descriptive vocabulary.`;
    },
  },

  write_response: {
    buildGuidance(obj) {
      return `The player needs to compose a written response in the target language. Pose a question or scenario and ask them to write their answer in the target language.`;
    },
  },

  build_friendship: {
    buildGuidance(obj) {
      const remaining = (obj.required || 3) - (obj.current || 0);
      return `The player is building a friendship with you through conversation. Be warm and share personal details. They need ${remaining} more meaningful exchange(s) to deepen the relationship.`;
    },
  },
};

// Default guidance for any objective type not explicitly mapped
const DEFAULT_GUIDANCE: GuidanceStrategy = {
  buildGuidance(obj) {
    return obj.description
      ? `Help the player with their objective: ${obj.description}. Guide the conversation to support their progress.`
      : `The player has an active quest objective. Be helpful and guide the conversation to support their progress.`;
  },
};

// ── Core Functions ──────────────────────────────────────────────────────────

/**
 * Find active quests where the given NPC is relevant.
 * Checks: quest giver, objective target, and multi-NPC participant roles.
 */
export function findRelevantQuests(
  npcId: string,
  npcName: string,
  activeQuests: Quest[],
): QuestGuidanceContext[] {
  const contexts: QuestGuidanceContext[] = [];

  for (const quest of activeQuests) {
    if (quest.status !== 'active') continue;

    const objectives = (quest.objectives || []) as QuestObjective[];
    const relevantObjectives: QuestObjective[] = [];
    let role: GuidanceRole = 'related_npc';
    let participantRole: NpcRole | undefined;

    // Check if this NPC is the quest giver
    if (quest.assignedByCharacterId === npcId) {
      role = 'quest_giver';
    }

    // Check multi-NPC participants stored in quest progress
    const participants = getQuestParticipants(quest);
    const participant = participants.find(p => p.npcId === npcId);
    if (participant) {
      participantRole = participant.role;
      if (role === 'related_npc') {
        role = 'participant';
      }
    }

    // Check if any objectives target this NPC (by ID or name)
    const npcNameLower = npcName.toLowerCase();
    for (const obj of objectives) {
      if (obj.completed) continue;

      const targetMatches =
        obj.targetId === npcId ||
        (obj.target && obj.target.toLowerCase() === npcNameLower);

      // Also match if the objective description mentions this NPC by name
      const descriptionMentions = obj.description &&
        obj.description.toLowerCase().includes(npcNameLower);

      if (targetMatches || descriptionMentions) {
        relevantObjectives.push(obj);
        if (role !== 'quest_giver' && role !== 'participant') {
          role = 'objective_target';
        }
      }
    }

    // If NPC is quest giver or participant but no specific objectives target them,
    // include all incomplete objectives for context
    if ((role === 'quest_giver' || role === 'participant') && relevantObjectives.length === 0) {
      for (const obj of objectives) {
        if (!obj.completed) {
          relevantObjectives.push(obj);
        }
      }
    }

    if (relevantObjectives.length > 0 || role === 'quest_giver' || role === 'participant') {
      contexts.push({
        questId: quest.id,
        questTitle: quest.title ?? 'Unnamed Quest',
        questDescription: quest.description ?? '',
        role,
        relevantObjectives,
        participantRole,
      });
    }
  }

  return contexts;
}

/**
 * Extract participant data from a quest's progress field.
 * Multi-NPC quests store participants in progress.participants.
 */
export function getQuestParticipants(quest: Quest): QuestParticipant[] {
  const progress = quest.progress as Record<string, any> | null;
  if (!progress?.participants) return [];
  if (!Array.isArray(progress.participants)) return [];
  return progress.participants as QuestParticipant[];
}

// ── Participant role guidance for multi-NPC quests ───────────────────────────

const PARTICIPANT_ROLE_GUIDANCE: Record<string, string> = {
  sender: 'You are preparing a delivery for the player. Confirm the order details, describe the items clearly, and ensure the player understands where to take them.',
  receiver: 'You are expecting a delivery from the player. Ask about what they are bringing, verify the details, and express appreciation when the delivery is confirmed.',
  mediator_target: 'You are one side of a dispute the player is mediating. Explain your perspective passionately but fairly. Be open to compromise if the player makes a good case.',
  guide: 'You are showing the player around town. Introduce businesses and their owners with enthusiasm. Share local knowledge and encourage the player to practice the language.',
  shopkeeper: 'The player is visiting your business as part of a multi-stop quest. Be welcoming, describe your goods and services, and engage the player in conversation about your trade.',
  interviewer: 'The player is interviewing for a position. Ask them about their skills and experience. Conduct the interview naturally in the target language.',
  host: 'You are hosting or organizing an event. Discuss arrangements, share your vision, and ask the player for their input on plans.',
  competitor: 'The player is comparing your prices and products with another merchant. Be competitive — highlight what makes your business special and negotiate confidently.',
  teacher: 'You have knowledge the player needs. Share it naturally through conversation, teaching vocabulary and concepts related to your expertise.',
  supplier: 'You provide materials or goods that the player needs for their quest. Discuss quantities, quality, and prices in the target language.',
  customer: 'You need something the player can help with. Describe what you need clearly and negotiate the terms.',
};

/**
 * Build the system prompt addition for NPC-guided conversation mode.
 */
export function buildQuestGuidance(
  contexts: QuestGuidanceContext[],
): QuestGuidanceResult {
  if (contexts.length === 0) {
    return { hasGuidance: false, systemPromptAddition: '', guidanceContexts: [] };
  }

  // Detect if any quest is conversation-only
  const hasConversationOnlyQuest = contexts.some(ctx =>
    checkConversationOnly(ctx.relevantObjectives),
  );

  const lines: string[] = [
    '\nNPC-GUIDED CONVERSATION MODE:',
    'You have active quest context with this player. Guide the conversation naturally to help them progress.',
  ];

  if (hasConversationOnlyQuest) {
    lines.push('');
    lines.push('CONVERSATION-ONLY QUEST ACTIVE: This quest is completed entirely through dialogue.');
    lines.push('You are the sole vehicle for quest progression — the player does not need to go anywhere or collect anything.');
    lines.push('Proactively create opportunities for the player to practice, respond, and demonstrate language skills within this conversation.');
  }

  for (const ctx of contexts) {
    lines.push('');
    lines.push(`Quest: "${ctx.questTitle}"`);

    const isConvOnly = checkConversationOnly(ctx.relevantObjectives);

    if (ctx.role === 'quest_giver') {
      lines.push('Role: You are the quest giver. Ask about their progress, offer encouragement and hints.');
    } else if (ctx.role === 'participant' && ctx.participantRole) {
      lines.push(`Role: ${PARTICIPANT_ROLE_GUIDANCE[ctx.participantRole] ?? 'You are involved in this quest. Help the player with what they need.'}`);
    } else if (ctx.role === 'objective_target') {
      lines.push('Role: You are directly involved in a quest objective the player needs to complete.');
    }

    if (isConvOnly) {
      lines.push('Mode: CONVERSATION-ONLY — all objectives can be completed right here in this dialogue.');
    }

    for (const obj of ctx.relevantObjectives) {
      const strategy = GUIDANCE_STRATEGIES[obj.type] || DEFAULT_GUIDANCE;
      const guidance = strategy.buildGuidance(obj, ctx.role);
      if (guidance) {
        lines.push(`- ${guidance}`);
      }
    }
  }

  lines.push('');
  lines.push('IMPORTANT: Stay in character. Weave quest guidance naturally into dialogue — do not break immersion by referencing "quests" or "objectives" directly. Speak as your character would.');

  return {
    hasGuidance: true,
    systemPromptAddition: lines.join('\n'),
    guidanceContexts: contexts,
  };
}

/**
 * High-level function: given an NPC and active quests, produce guidance.
 */
export function getQuestGuidanceForNPC(
  npcId: string,
  npcName: string,
  activeQuests: Quest[],
): QuestGuidanceResult {
  const contexts = findRelevantQuests(npcId, npcName, activeQuests);
  return buildQuestGuidance(contexts);
}
