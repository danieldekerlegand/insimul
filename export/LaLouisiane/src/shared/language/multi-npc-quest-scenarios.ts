/**
 * Multi-NPC Quest Scenarios Across Businesses
 *
 * Defines structured quest scenarios involving multiple NPCs with specific
 * roles across different businesses. Each scenario specifies:
 * - NPC roles (sender, receiver, mediator, guide, etc.)
 * - Business requirements (types, minimum count)
 * - Objectives linked to specific NPC roles and businesses
 * - Participant metadata for NPC guidance system
 */

import type { QuestSeed, SeedObjective } from './quest-seed-library';

// ── Types ────────────────────────────────────────────────────────────────────

/** Role an NPC plays in a multi-NPC quest */
export type NpcRole =
  | 'quest_giver'
  | 'sender'
  | 'receiver'
  | 'mediator_target'
  | 'guide'
  | 'shopkeeper'
  | 'interviewer'
  | 'host'
  | 'competitor'
  | 'teacher'
  | 'supplier'
  | 'customer';

/** A participant slot that gets filled with a real NPC during generation */
export interface NpcRoleSlot {
  /** The role this NPC plays */
  role: NpcRole;
  /** Template param name this NPC maps to (e.g., 'senderNpc') */
  paramName: string;
  /** If true, NPC must own a business */
  requiresBusinessOwner: boolean;
  /** Business type filter — NPC's business must match one of these */
  businessTypes?: string[];
  /** Template param for the NPC's business name */
  businessParamName?: string;
}

/** A resolved participant with real NPC and business data */
export interface QuestParticipant {
  role: NpcRole;
  npcId: string;
  npcName: string;
  businessId?: string;
  businessName?: string;
  businessType?: string;
}

/** Multi-NPC scenario definition */
export interface MultiNpcScenario {
  /** Unique scenario ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** Scenario category */
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** NPC role slots to fill */
  npcRoles: NpcRoleSlot[];
  /** Minimum number of active businesses required */
  minBusinesses: number;
  /** The underlying quest seed */
  seed: QuestSeed;
}

// ── Scenario Definitions ─────────────────────────────────────────────────────

export const MULTI_NPC_SCENARIOS: MultiNpcScenario[] = [
  // ── Supply Chain: pick up from one business, deliver to another ─────────
  {
    id: 'supply_chain_delivery',
    name: 'Supply Chain Delivery',
    category: 'business_roleplay',
    difficulty: 'advanced',
    minBusinesses: 2,
    npcRoles: [
      {
        role: 'sender',
        paramName: 'senderNpc',
        requiresBusinessOwner: true,
        businessParamName: 'senderBusiness',
      },
      {
        role: 'receiver',
        paramName: 'receiverNpc',
        requiresBusinessOwner: true,
        businessParamName: 'receiverBusiness',
      },
    ],
    seed: {
      id: 'multi_npc_supply_chain',
      name: 'Supply Chain',
      category: 'business_roleplay',
      difficulty: 'advanced',
      params: [
        { name: 'senderNpc', type: 'string', description: 'Sender NPC' },
        { name: 'receiverNpc', type: 'string', description: 'Receiver NPC' },
        { name: 'senderBusiness', type: 'string', description: 'Sender business' },
        { name: 'receiverBusiness', type: 'string', description: 'Receiver business' },
      ],
      titleTemplate: 'Delivery: {{senderBusiness}} → {{receiverBusiness}}',
      descriptionTemplate:
        'Pick up a delivery from {{senderNpc}} at {{senderBusiness}} and bring it to {{receiverNpc}} at {{receiverBusiness}}. Confirm order details in {{targetLanguage}} at both ends.',
      questType: 'business_roleplay',
      objectiveTemplates: [
        { type: 'visit_location', descriptionTemplate: 'Go to {{senderBusiness}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Confirm the order with {{senderNpc}}', countTemplate: 3 },
        { type: 'visit_location', descriptionTemplate: 'Deliver to {{receiverBusiness}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Confirm delivery with {{receiverNpc}}', countTemplate: 3 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use item, quantity, and direction vocabulary', countTemplate: 5 },
      ],
      completionCriteria: { type: 'all_objectives' },
      baseXp: 55,
      tags: ['business_roleplay', 'delivery', 'supply_chain', 'multi_npc', 'advanced'],
    },
  },

  // ── Business Dispute: mediate between two business owners ──────────────
  {
    id: 'business_dispute',
    name: 'Business Dispute Mediation',
    category: 'business_roleplay',
    difficulty: 'advanced',
    minBusinesses: 2,
    npcRoles: [
      {
        role: 'mediator_target',
        paramName: 'npcA',
        requiresBusinessOwner: true,
        businessParamName: 'businessA',
      },
      {
        role: 'mediator_target',
        paramName: 'npcB',
        requiresBusinessOwner: true,
        businessParamName: 'businessB',
      },
    ],
    seed: {
      id: 'multi_npc_business_dispute',
      name: 'Business Dispute',
      category: 'business_roleplay',
      difficulty: 'advanced',
      params: [
        { name: 'npcA', type: 'string', description: 'First business owner' },
        { name: 'npcB', type: 'string', description: 'Second business owner' },
        { name: 'businessA', type: 'string', description: 'First business' },
        { name: 'businessB', type: 'string', description: 'Second business' },
      ],
      titleTemplate: 'Mediating Between {{businessA}} and {{businessB}}',
      descriptionTemplate:
        '{{npcA}} and {{npcB}} have a disagreement. Visit both businesses, listen to each side in {{targetLanguage}}, and help mediate a resolution.',
      questType: 'business_roleplay',
      objectiveTemplates: [
        { type: 'visit_location', descriptionTemplate: "Visit {{businessA}} to hear {{npcA}}'s side", countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: "Listen to {{npcA}}'s complaint", countTemplate: 4 },
        { type: 'visit_location', descriptionTemplate: "Visit {{businessB}} to hear {{npcB}}'s side", countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: "Listen to {{npcB}}'s complaint", countTemplate: 4 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use persuasion and opinion vocabulary', countTemplate: 5 },
      ],
      completionCriteria: { type: 'all_objectives' },
      baseXp: 60,
      tags: ['business_roleplay', 'mediation', 'multi_npc', 'advanced'],
    },
  },

  // ── Trade Network: coordinate supplies across three businesses ─────────
  {
    id: 'trade_network',
    name: 'Trade Network',
    category: 'business_roleplay',
    difficulty: 'advanced',
    minBusinesses: 3,
    npcRoles: [
      {
        role: 'supplier',
        paramName: 'supplierNpc',
        requiresBusinessOwner: true,
        businessParamName: 'supplierBusiness',
      },
      {
        role: 'customer',
        paramName: 'crafterNpc',
        requiresBusinessOwner: true,
        businessParamName: 'crafterBusiness',
      },
      {
        role: 'customer',
        paramName: 'buyerNpc',
        requiresBusinessOwner: true,
        businessParamName: 'buyerBusiness',
      },
    ],
    seed: {
      id: 'multi_npc_trade_network',
      name: 'Trade Network',
      category: 'business_roleplay',
      difficulty: 'advanced',
      params: [
        { name: 'supplierNpc', type: 'string', description: 'Raw material supplier' },
        { name: 'crafterNpc', type: 'string', description: 'Crafter who processes materials' },
        { name: 'buyerNpc', type: 'string', description: 'Final buyer' },
        { name: 'supplierBusiness', type: 'string', description: 'Supplier business' },
        { name: 'crafterBusiness', type: 'string', description: 'Crafter business' },
        { name: 'buyerBusiness', type: 'string', description: 'Buyer business' },
      ],
      titleTemplate: 'The {{supplierBusiness}} Trade Route',
      descriptionTemplate:
        'Help coordinate a trade chain: get materials from {{supplierNpc}} at {{supplierBusiness}}, bring them to {{crafterNpc}} at {{crafterBusiness}}, then deliver the finished product to {{buyerNpc}} at {{buyerBusiness}}. Negotiate in {{targetLanguage}} at each stop.',
      questType: 'business_roleplay',
      objectiveTemplates: [
        { type: 'visit_location', descriptionTemplate: 'Visit {{supplierBusiness}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Negotiate materials with {{supplierNpc}}', countTemplate: 3 },
        { type: 'visit_location', descriptionTemplate: 'Bring materials to {{crafterBusiness}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Discuss the order with {{crafterNpc}}', countTemplate: 3 },
        { type: 'visit_location', descriptionTemplate: 'Deliver finished goods to {{buyerBusiness}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Complete the sale with {{buyerNpc}}', countTemplate: 3 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use trade, quantity, and negotiation vocabulary', countTemplate: 6 },
      ],
      completionCriteria: { type: 'all_objectives' },
      baseXp: 75,
      tags: ['business_roleplay', 'trade', 'supply_chain', 'multi_npc', 'advanced'],
    },
  },

  // ── Business Tour: guide introduces player to multiple owners ──────────
  {
    id: 'guided_business_tour',
    name: 'Guided Business Tour',
    category: 'business_roleplay',
    difficulty: 'beginner',
    minBusinesses: 2,
    npcRoles: [
      {
        role: 'guide',
        paramName: 'guideNpc',
        requiresBusinessOwner: false,
      },
      {
        role: 'shopkeeper',
        paramName: 'ownerA',
        requiresBusinessOwner: true,
        businessParamName: 'businessA',
      },
      {
        role: 'shopkeeper',
        paramName: 'ownerB',
        requiresBusinessOwner: true,
        businessParamName: 'businessB',
      },
    ],
    seed: {
      id: 'multi_npc_guided_tour',
      name: 'Town Business Tour',
      category: 'business_roleplay',
      difficulty: 'beginner',
      params: [
        { name: 'guideNpc', type: 'string', description: 'Tour guide NPC' },
        { name: 'ownerA', type: 'string', description: 'First business owner' },
        { name: 'ownerB', type: 'string', description: 'Second business owner' },
        { name: 'businessA', type: 'string', description: 'First business' },
        { name: 'businessB', type: 'string', description: 'Second business' },
      ],
      titleTemplate: 'Town Tour with {{guideNpc}}',
      descriptionTemplate:
        '{{guideNpc}} offers to show you around town. Visit {{businessA}} and {{businessB}}, and introduce yourself to {{ownerA}} and {{ownerB}} in {{targetLanguage}}.',
      questType: 'business_roleplay',
      objectiveTemplates: [
        { type: 'talk_to_npc', descriptionTemplate: 'Meet {{guideNpc}} to start the tour', countTemplate: 1 },
        { type: 'visit_location', descriptionTemplate: 'Visit {{businessA}}', countTemplate: 1 },
        { type: 'introduce_self', descriptionTemplate: 'Introduce yourself to {{ownerA}}', countTemplate: 1 },
        { type: 'visit_location', descriptionTemplate: 'Visit {{businessB}}', countTemplate: 1 },
        { type: 'introduce_self', descriptionTemplate: 'Introduce yourself to {{ownerB}}', countTemplate: 1 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use greeting and introduction vocabulary', countTemplate: 3 },
      ],
      completionCriteria: { type: 'all_objectives' },
      baseXp: 30,
      tags: ['business_roleplay', 'tour', 'introductions', 'multi_npc', 'beginner'],
    },
  },

  // ── Recipe Exchange: collect recipes from multiple business owners ─────
  {
    id: 'recipe_exchange',
    name: 'Recipe Exchange',
    category: 'business_roleplay',
    difficulty: 'intermediate',
    minBusinesses: 2,
    npcRoles: [
      {
        role: 'quest_giver',
        paramName: 'questGiverNpc',
        requiresBusinessOwner: true,
        businessTypes: ['restaurant', 'bakery'],
        businessParamName: 'questGiverBusiness',
      },
      {
        role: 'teacher',
        paramName: 'recipeNpc',
        requiresBusinessOwner: true,
        businessTypes: ['restaurant', 'bakery', 'tavern'],
        businessParamName: 'recipeBusiness',
      },
    ],
    seed: {
      id: 'multi_npc_recipe_exchange',
      name: 'Recipe Exchange',
      category: 'business_roleplay',
      difficulty: 'intermediate',
      params: [
        { name: 'questGiverNpc', type: 'string', description: 'NPC who wants a recipe' },
        { name: 'recipeNpc', type: 'string', description: 'NPC who has the recipe' },
        { name: 'questGiverBusiness', type: 'string', description: "Quest giver's business" },
        { name: 'recipeBusiness', type: 'string', description: "Recipe holder's business" },
      ],
      titleTemplate: 'Recipe Exchange: {{questGiverBusiness}} & {{recipeBusiness}}',
      descriptionTemplate:
        '{{questGiverNpc}} at {{questGiverBusiness}} wants to learn a recipe from {{recipeNpc}} at {{recipeBusiness}}. Visit both, learn the recipe in {{targetLanguage}}, and relay it back.',
      questType: 'business_roleplay',
      objectiveTemplates: [
        { type: 'talk_to_npc', descriptionTemplate: 'Talk to {{questGiverNpc}} at {{questGiverBusiness}}', countTemplate: 1 },
        { type: 'visit_location', descriptionTemplate: 'Visit {{recipeBusiness}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Learn the recipe from {{recipeNpc}}', countTemplate: 4 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use cooking and ingredient vocabulary', countTemplate: 4 },
        { type: 'visit_location', descriptionTemplate: 'Return to {{questGiverBusiness}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Relay the recipe to {{questGiverNpc}}', countTemplate: 3 },
      ],
      completionCriteria: { type: 'all_objectives' },
      baseXp: 45,
      tags: ['business_roleplay', 'recipe', 'cooking', 'multi_npc', 'intermediate'],
    },
  },

  // ── Job Interview Circuit: interview at multiple businesses ────────────
  {
    id: 'job_interview_circuit',
    name: 'Job Interview Circuit',
    category: 'business_roleplay',
    difficulty: 'intermediate',
    minBusinesses: 2,
    npcRoles: [
      {
        role: 'interviewer',
        paramName: 'interviewerA',
        requiresBusinessOwner: true,
        businessParamName: 'businessA',
      },
      {
        role: 'interviewer',
        paramName: 'interviewerB',
        requiresBusinessOwner: true,
        businessParamName: 'businessB',
      },
    ],
    seed: {
      id: 'multi_npc_job_interviews',
      name: 'Job Interview Circuit',
      category: 'business_roleplay',
      difficulty: 'intermediate',
      params: [
        { name: 'interviewerA', type: 'string', description: 'First interviewer' },
        { name: 'interviewerB', type: 'string', description: 'Second interviewer' },
        { name: 'businessA', type: 'string', description: 'First business' },
        { name: 'businessB', type: 'string', description: 'Second business' },
      ],
      titleTemplate: 'Job Interviews Around Town',
      descriptionTemplate:
        'You are looking for work! Visit {{businessA}} and {{businessB}} to interview with {{interviewerA}} and {{interviewerB}} in {{targetLanguage}}. Describe your skills and ask about the positions.',
      questType: 'business_roleplay',
      objectiveTemplates: [
        { type: 'visit_location', descriptionTemplate: 'Visit {{businessA}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Interview with {{interviewerA}}', countTemplate: 4 },
        { type: 'introduce_self', descriptionTemplate: 'Introduce yourself to {{interviewerA}}', countTemplate: 1 },
        { type: 'visit_location', descriptionTemplate: 'Visit {{businessB}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Interview with {{interviewerB}}', countTemplate: 4 },
        { type: 'introduce_self', descriptionTemplate: 'Introduce yourself to {{interviewerB}}', countTemplate: 1 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use profession and skill vocabulary', countTemplate: 5 },
      ],
      completionCriteria: { type: 'all_objectives' },
      baseXp: 45,
      tags: ['business_roleplay', 'job', 'interview', 'multi_npc', 'intermediate'],
    },
  },

  // ── Community Event: plan an event with multiple business owners ───────
  {
    id: 'community_event',
    name: 'Community Festival Planning',
    category: 'business_roleplay',
    difficulty: 'advanced',
    minBusinesses: 3,
    npcRoles: [
      {
        role: 'host',
        paramName: 'hostNpc',
        requiresBusinessOwner: true,
        businessTypes: ['tavern', 'inn', 'restaurant'],
        businessParamName: 'venueBusiness',
      },
      {
        role: 'supplier',
        paramName: 'foodNpc',
        requiresBusinessOwner: true,
        businessTypes: ['bakery', 'restaurant', 'grocery'],
        businessParamName: 'foodBusiness',
      },
      {
        role: 'supplier',
        paramName: 'decorNpc',
        requiresBusinessOwner: true,
        businessParamName: 'decorBusiness',
      },
    ],
    seed: {
      id: 'multi_npc_community_event',
      name: 'Festival Planning',
      category: 'business_roleplay',
      difficulty: 'advanced',
      params: [
        { name: 'hostNpc', type: 'string', description: 'Event venue host' },
        { name: 'foodNpc', type: 'string', description: 'Food supplier' },
        { name: 'decorNpc', type: 'string', description: 'Decoration supplier' },
        { name: 'venueBusiness', type: 'string', description: 'Venue business' },
        { name: 'foodBusiness', type: 'string', description: 'Food business' },
        { name: 'decorBusiness', type: 'string', description: 'Decoration business' },
      ],
      titleTemplate: 'Planning a Festival at {{venueBusiness}}',
      descriptionTemplate:
        'Help plan a community festival! Coordinate with {{hostNpc}} at {{venueBusiness}} for the venue, {{foodNpc}} at {{foodBusiness}} for food, and {{decorNpc}} at {{decorBusiness}} for decorations. Negotiate everything in {{targetLanguage}}.',
      questType: 'business_roleplay',
      objectiveTemplates: [
        { type: 'visit_location', descriptionTemplate: 'Visit {{venueBusiness}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Discuss venue arrangements with {{hostNpc}}', countTemplate: 4 },
        { type: 'visit_location', descriptionTemplate: 'Visit {{foodBusiness}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Order food from {{foodNpc}}', countTemplate: 3 },
        { type: 'visit_location', descriptionTemplate: 'Visit {{decorBusiness}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Arrange decorations with {{decorNpc}}', countTemplate: 3 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use celebration, food, and negotiation vocabulary', countTemplate: 6 },
      ],
      completionCriteria: { type: 'all_objectives' },
      baseXp: 70,
      tags: ['business_roleplay', 'festival', 'planning', 'multi_npc', 'advanced'],
    },
  },

  // ── Merchant Competition: compare prices across businesses ─────────────
  {
    id: 'merchant_competition',
    name: 'Merchant Price Comparison',
    category: 'business_roleplay',
    difficulty: 'intermediate',
    minBusinesses: 2,
    npcRoles: [
      {
        role: 'competitor',
        paramName: 'merchantA',
        requiresBusinessOwner: true,
        businessParamName: 'shopA',
      },
      {
        role: 'competitor',
        paramName: 'merchantB',
        requiresBusinessOwner: true,
        businessParamName: 'shopB',
      },
    ],
    seed: {
      id: 'multi_npc_merchant_competition',
      name: 'Merchant Price Comparison',
      category: 'business_roleplay',
      difficulty: 'intermediate',
      params: [
        { name: 'merchantA', type: 'string', description: 'First merchant' },
        { name: 'merchantB', type: 'string', description: 'Second merchant' },
        { name: 'shopA', type: 'string', description: 'First shop' },
        { name: 'shopB', type: 'string', description: 'Second shop' },
      ],
      titleTemplate: 'Best Deal: {{shopA}} vs {{shopB}}',
      descriptionTemplate:
        'Compare prices between {{merchantA}} at {{shopA}} and {{merchantB}} at {{shopB}}. Ask about products, negotiate prices, and find the best deal — all in {{targetLanguage}}.',
      questType: 'business_roleplay',
      objectiveTemplates: [
        { type: 'visit_location', descriptionTemplate: 'Visit {{shopA}}', countTemplate: 1 },
        { type: 'haggle_price', descriptionTemplate: 'Negotiate prices with {{merchantA}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Ask {{merchantA}} about products', countTemplate: 3 },
        { type: 'visit_location', descriptionTemplate: 'Visit {{shopB}}', countTemplate: 1 },
        { type: 'haggle_price', descriptionTemplate: 'Negotiate prices with {{merchantB}}', countTemplate: 1 },
        { type: 'complete_conversation', descriptionTemplate: 'Ask {{merchantB}} about products', countTemplate: 3 },
        { type: 'use_vocabulary', descriptionTemplate: 'Use number, price, and comparison vocabulary', countTemplate: 5 },
      ],
      completionCriteria: { type: 'all_objectives' },
      baseXp: 45,
      tags: ['business_roleplay', 'shopping', 'negotiation', 'multi_npc', 'intermediate'],
    },
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Get all multi-NPC scenarios */
export function getMultiNpcScenarios(): MultiNpcScenario[] {
  return MULTI_NPC_SCENARIOS;
}

/** Get scenarios that can be generated with the given number of businesses */
export function getScenariosForBusinessCount(businessCount: number): MultiNpcScenario[] {
  return MULTI_NPC_SCENARIOS.filter(s => s.minBusinesses <= businessCount);
}

/** Get scenarios filtered by difficulty */
export function getScenariosByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced',
): MultiNpcScenario[] {
  return MULTI_NPC_SCENARIOS.filter(s => s.difficulty === difficulty);
}

/** Get the NPC role slots that require business owners */
export function getBusinessOwnerRoles(scenario: MultiNpcScenario): NpcRoleSlot[] {
  return scenario.npcRoles.filter(r => r.requiresBusinessOwner);
}

/** Get unique NPC role types needed for a scenario */
export function getRequiredRoleTypes(scenario: MultiNpcScenario): NpcRole[] {
  return Array.from(new Set(scenario.npcRoles.map(r => r.role)));
}
