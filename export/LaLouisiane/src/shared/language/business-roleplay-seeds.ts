/**
 * Business Role-Play Scenario Quest Seeds
 *
 * Quest seeds for role-play scenarios centered on business interactions.
 * Each seed represents a common real-world business interaction that players
 * practice in the target language: ordering food, visiting a doctor, haggling
 * at a market, apprenticing with a tradesperson, etc.
 */

import type { QuestSeed } from './quest-seed-library';

// ── Business Role-Play Scenario Seeds ────────────────────────────────────────

export const BUSINESS_ROLEPLAY_SEEDS: QuestSeed[] = [
  // ── Restaurant / Food Service ─────────────────────────────────────────────
  {
    id: 'restaurant_patron',
    name: 'Restaurant Patron',
    category: 'business_roleplay',
    difficulty: 'beginner',
    params: [
      { name: 'businessName', type: 'string', description: 'Restaurant name' },
      { name: 'npcName', type: 'string', description: 'Server/owner NPC' },
      { name: 'location', type: 'string', description: 'Restaurant location' },
    ],
    titleTemplate: 'Dining at {{businessName}}',
    descriptionTemplate: 'Visit {{businessName}} and order a meal entirely in {{targetLanguage}}. Read the menu, ask {{npcName}} about the dishes, and place your order.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Order a meal from {{npcName}} in {{targetLanguage}}', countTemplate: 4 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use food and ordering vocabulary', countTemplate: 3 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 25,
    tags: ['business_roleplay', 'restaurant', 'food', 'ordering', 'beginner'],
  },
  {
    id: 'bakery_customer',
    name: 'At the Bakery',
    category: 'business_roleplay',
    difficulty: 'beginner',
    params: [
      { name: 'businessName', type: 'string', description: 'Bakery name' },
      { name: 'npcName', type: 'string', description: 'Baker NPC' },
      { name: 'location', type: 'string', description: 'Bakery location' },
    ],
    titleTemplate: 'Fresh from {{businessName}}',
    descriptionTemplate: 'Visit {{businessName}} and buy bread or pastries. Ask {{npcName}} what is fresh today and make your selection in {{targetLanguage}}.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Ask about and purchase baked goods from {{npcName}}', countTemplate: 3 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use food and number vocabulary', countTemplate: 3 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 20,
    tags: ['business_roleplay', 'bakery', 'food', 'shopping', 'beginner'],
  },

  // ── Medical / Health ──────────────────────────────────────────────────────
  {
    id: 'doctor_visit',
    name: 'At the Doctor',
    category: 'business_roleplay',
    difficulty: 'intermediate',
    params: [
      { name: 'businessName', type: 'string', description: 'Doctor office name' },
      { name: 'npcName', type: 'string', description: 'Doctor NPC' },
      { name: 'location', type: 'string', description: 'Office location' },
    ],
    titleTemplate: 'Visiting {{npcName}} at {{businessName}}',
    descriptionTemplate: 'Visit {{businessName}} and describe your symptoms to {{npcName}} in {{targetLanguage}}. Listen to their advice and ask follow-up questions.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Go to {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Describe symptoms and discuss treatment with {{npcName}}', countTemplate: 5 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use health and body vocabulary', countTemplate: 4 },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 5 },
    baseXp: 40,
    tags: ['business_roleplay', 'doctor', 'health', 'intermediate'],
  },

  // ── Shopping / Retail ─────────────────────────────────────────────────────
  {
    id: 'market_haggler',
    name: 'Market Haggler',
    category: 'business_roleplay',
    difficulty: 'intermediate',
    params: [
      { name: 'businessName', type: 'string', description: 'Store name' },
      { name: 'npcName', type: 'string', description: 'Shopkeeper NPC' },
      { name: 'location', type: 'string', description: 'Store location' },
    ],
    titleTemplate: 'Haggling at {{businessName}}',
    descriptionTemplate: 'Visit {{businessName}} and negotiate a price with {{npcName}} in {{targetLanguage}}. Ask about products, discuss quality, and agree on a fair price.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Negotiate a purchase with {{npcName}}', countTemplate: 5 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use number, price, and quality vocabulary', countTemplate: 4 },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 5 },
    baseXp: 40,
    tags: ['business_roleplay', 'shopping', 'negotiation', 'numbers', 'intermediate'],
  },
  {
    id: 'grocery_shopping',
    name: 'Grocery Run',
    category: 'business_roleplay',
    difficulty: 'beginner',
    params: [
      { name: 'businessName', type: 'string', description: 'Grocery store name' },
      { name: 'npcName', type: 'string', description: 'Shopkeeper NPC' },
      { name: 'location', type: 'string', description: 'Store location' },
      { name: 'itemCount', type: 'number', description: 'Items to buy', defaultValue: 3 },
    ],
    titleTemplate: 'Shopping at {{businessName}}',
    descriptionTemplate: 'Go to {{businessName}} and ask {{npcName}} for {{itemCount}} items on your shopping list in {{targetLanguage}}.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Ask for items from your shopping list', countTemplate: 3 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use food and quantity vocabulary', countTemplate: '{{itemCount}}' },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 20,
    tags: ['business_roleplay', 'grocery', 'shopping', 'food', 'beginner'],
  },

  // ── Hospitality / Lodging ─────────────────────────────────────────────────
  {
    id: 'inn_guest',
    name: 'Guest at the Inn',
    category: 'business_roleplay',
    difficulty: 'beginner',
    params: [
      { name: 'businessName', type: 'string', description: 'Inn name' },
      { name: 'npcName', type: 'string', description: 'Innkeeper NPC' },
      { name: 'location', type: 'string', description: 'Inn location' },
    ],
    titleTemplate: 'Checking In at {{businessName}}',
    descriptionTemplate: 'Arrive at {{businessName}} and check in with {{npcName}} in {{targetLanguage}}. Ask about rooms, prices, and amenities.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Arrive at {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Check in and ask about the room with {{npcName}}', countTemplate: 4 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use lodging and number vocabulary', countTemplate: 3 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 25,
    tags: ['business_roleplay', 'inn', 'lodging', 'beginner'],
  },
  {
    id: 'tavern_patron',
    name: 'Evening at the Tavern',
    category: 'business_roleplay',
    difficulty: 'intermediate',
    params: [
      { name: 'businessName', type: 'string', description: 'Tavern name' },
      { name: 'npcName', type: 'string', description: 'Bartender NPC' },
      { name: 'location', type: 'string', description: 'Tavern location' },
    ],
    titleTemplate: 'An Evening at {{businessName}}',
    descriptionTemplate: 'Spend an evening at {{businessName}}. Order a drink from {{npcName}}, ask about local news, and chat with the patrons — all in {{targetLanguage}}.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Order a drink and chat with {{npcName}}', countTemplate: 5 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use social and drink vocabulary', countTemplate: 4 },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 5 },
    baseXp: 35,
    tags: ['business_roleplay', 'tavern', 'social', 'intermediate'],
  },

  // ── Trades & Apprenticeship ───────────────────────────────────────────────
  {
    id: 'blacksmith_apprentice',
    name: 'Apprentice at the Forge',
    category: 'business_roleplay',
    difficulty: 'intermediate',
    params: [
      { name: 'businessName', type: 'string', description: 'Blacksmith name' },
      { name: 'npcName', type: 'string', description: 'Blacksmith NPC' },
      { name: 'location', type: 'string', description: 'Forge location' },
    ],
    titleTemplate: 'Learning the Trade at {{businessName}}',
    descriptionTemplate: 'Visit {{npcName}} at {{businessName}} and learn about their craft in {{targetLanguage}}. Ask about tools, materials, and techniques.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Learn about the craft from {{npcName}}', countTemplate: 5 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use trade and tool vocabulary', countTemplate: 4 },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 5 },
    baseXp: 40,
    tags: ['business_roleplay', 'blacksmith', 'apprentice', 'trade', 'intermediate'],
  },
  {
    id: 'tailor_fitting',
    name: 'At the Tailor',
    category: 'business_roleplay',
    difficulty: 'intermediate',
    params: [
      { name: 'businessName', type: 'string', description: 'Tailor shop name' },
      { name: 'npcName', type: 'string', description: 'Tailor NPC' },
      { name: 'location', type: 'string', description: 'Shop location' },
    ],
    titleTemplate: 'A Fitting at {{businessName}}',
    descriptionTemplate: 'Visit {{npcName}} at {{businessName}} to get fitted for new clothes. Describe what you want, discuss fabrics and colors in {{targetLanguage}}.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Discuss clothing and get fitted by {{npcName}}', countTemplate: 5 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use clothing, color, and size vocabulary', countTemplate: 4 },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 5 },
    baseXp: 35,
    tags: ['business_roleplay', 'tailor', 'clothing', 'intermediate'],
  },

  // ── Professional Services ─────────────────────────────────────────────────
  {
    id: 'bank_transaction',
    name: 'At the Bank',
    category: 'business_roleplay',
    difficulty: 'advanced',
    params: [
      { name: 'businessName', type: 'string', description: 'Bank name' },
      { name: 'npcName', type: 'string', description: 'Bank teller NPC' },
      { name: 'location', type: 'string', description: 'Bank location' },
    ],
    titleTemplate: 'Banking at {{businessName}}',
    descriptionTemplate: 'Visit {{businessName}} and conduct a transaction with {{npcName}} entirely in {{targetLanguage}}. Discuss accounts, exchange rates, or make a deposit.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Complete a banking transaction with {{npcName}}', countTemplate: 6 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use financial and number vocabulary', countTemplate: 5 },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 6 },
    baseXp: 55,
    tags: ['business_roleplay', 'bank', 'finance', 'numbers', 'advanced'],
  },

  // ── Multi-Business Scenarios ──────────────────────────────────────────────
  {
    id: 'business_tour',
    name: 'Town Business Tour',
    category: 'business_roleplay',
    difficulty: 'intermediate',
    params: [
      { name: 'npcName', type: 'string', description: 'Tour guide NPC' },
      { name: 'businessCount', type: 'number', description: 'Businesses to visit', defaultValue: 3 },
    ],
    titleTemplate: 'Business Tour with {{npcName}}',
    descriptionTemplate: '{{npcName}} offers to show you around town. Visit {{businessCount}} different businesses and introduce yourself to each owner in {{targetLanguage}}.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'talk_to_npc', descriptionTemplate: 'Meet {{npcName}} to start the tour', countTemplate: 1 },
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessCount}} businesses in town', countTemplate: '{{businessCount}}' },
      { type: 'complete_conversation', descriptionTemplate: 'Introduce yourself to business owners', countTemplate: '{{businessCount}}' },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 45,
    tags: ['business_roleplay', 'tour', 'introductions', 'intermediate'],
  },
  {
    id: 'shopping_list',
    name: 'Shopping List Challenge',
    category: 'business_roleplay',
    difficulty: 'intermediate',
    params: [
      { name: 'npcName', type: 'string', description: 'NPC who gives the list' },
      { name: 'itemCount', type: 'number', description: 'Items to find', defaultValue: 4 },
    ],
    titleTemplate: '{{npcName}}\'s Shopping List',
    descriptionTemplate: '{{npcName}} gives you a shopping list in {{targetLanguage}} with {{itemCount}} items. Visit different shops to find everything on the list.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'talk_to_npc', descriptionTemplate: 'Get the shopping list from {{npcName}}', countTemplate: 1 },
      { type: 'visit_location', descriptionTemplate: 'Visit shops to find the items', countTemplate: 2 },
      { type: 'complete_conversation', descriptionTemplate: 'Ask shopkeepers for items on the list', countTemplate: '{{itemCount}}' },
      { type: 'use_vocabulary', descriptionTemplate: 'Use item names and quantities in {{targetLanguage}}', countTemplate: '{{itemCount}}' },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 40,
    tags: ['business_roleplay', 'shopping', 'scavenger_hunt', 'intermediate'],
  },

  // ── Advanced Scenarios ────────────────────────────────────────────────────
  {
    id: 'supply_chain_delivery',
    name: 'Supply Chain',
    category: 'business_roleplay',
    difficulty: 'advanced',
    params: [
      { name: 'senderNpc', type: 'string', description: 'Sender business owner' },
      { name: 'receiverNpc', type: 'string', description: 'Receiver business owner' },
      { name: 'senderBusiness', type: 'string', description: 'Sender business name' },
      { name: 'receiverBusiness', type: 'string', description: 'Receiver business name' },
    ],
    titleTemplate: 'Delivery: {{senderBusiness}} to {{receiverBusiness}}',
    descriptionTemplate: 'Pick up a delivery from {{senderNpc}} at {{senderBusiness}} and bring it to {{receiverNpc}} at {{receiverBusiness}}. Confirm the order details in {{targetLanguage}} at both ends.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{senderBusiness}} to pick up the delivery', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Confirm the order with {{senderNpc}}', countTemplate: 3 },
      { type: 'visit_location', descriptionTemplate: 'Deliver to {{receiverBusiness}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Confirm the delivery with {{receiverNpc}}', countTemplate: 3 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use item, quantity, and direction vocabulary', countTemplate: 5 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 55,
    tags: ['business_roleplay', 'delivery', 'supply_chain', 'advanced'],
  },
  {
    id: 'business_dispute',
    name: 'Business Dispute',
    category: 'business_roleplay',
    difficulty: 'advanced',
    params: [
      { name: 'npcA', type: 'string', description: 'First business owner' },
      { name: 'npcB', type: 'string', description: 'Second business owner' },
      { name: 'businessA', type: 'string', description: 'First business name' },
      { name: 'businessB', type: 'string', description: 'Second business name' },
    ],
    titleTemplate: 'Mediating Between {{businessA}} and {{businessB}}',
    descriptionTemplate: '{{npcA}} and {{npcB}} have a disagreement. Visit both businesses, listen to each side in {{targetLanguage}}, and help mediate a resolution.',
    questType: 'business_roleplay',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessA}} to hear {{npcA}}\'s side', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Listen to {{npcA}}\'s complaint', countTemplate: 4 },
      { type: 'visit_location', descriptionTemplate: 'Visit {{businessB}} to hear {{npcB}}\'s side', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Listen to {{npcB}}\'s complaint', countTemplate: 4 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use persuasion and opinion vocabulary', countTemplate: 5 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 60,
    tags: ['business_roleplay', 'mediation', 'advanced'],
  },
];

/**
 * Map from business type IDs (from business-lifecycle.ts) to the seed IDs
 * that can be generated for that business type.
 */
export const BUSINESS_TYPE_TO_SEEDS: Record<string, string[]> = {
  restaurant: ['restaurant_patron'],
  bakery: ['bakery_customer'],
  doctor_office: ['doctor_visit'],
  general_store: ['market_haggler', 'grocery_shopping'],
  grocery: ['grocery_shopping'],
  clothing_store: ['market_haggler'],
  hardware_store: ['market_haggler'],
  bookstore: ['market_haggler'],
  inn: ['inn_guest'],
  tavern: ['tavern_patron'],
  blacksmith: ['blacksmith_apprentice'],
  tailor: ['tailor_fitting'],
  bank: ['bank_transaction'],
};

/** Get all business role-play seeds */
export function getBusinessRoleplaySeeds(): QuestSeed[] {
  return BUSINESS_ROLEPLAY_SEEDS;
}

/** Get seeds applicable to a specific business type */
export function getSeedsForBusinessType(businessTypeId: string): QuestSeed[] {
  const seedIds = BUSINESS_TYPE_TO_SEEDS[businessTypeId] || [];
  return BUSINESS_ROLEPLAY_SEEDS.filter(s => seedIds.includes(s.id));
}

/** Get seeds that don't require a specific business type (multi-business scenarios) */
export function getMultiBusinessSeeds(): QuestSeed[] {
  return BUSINESS_ROLEPLAY_SEEDS.filter(s =>
    ['business_tour', 'shopping_list', 'supply_chain_delivery', 'business_dispute'].includes(s.id),
  );
}
