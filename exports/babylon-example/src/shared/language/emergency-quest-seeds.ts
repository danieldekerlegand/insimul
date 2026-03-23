/**
 * Emergency / Situational Quest Seeds
 *
 * Time-sensitive quest templates that practice practical, survival-oriented
 * language. Each scenario creates urgency through soft time pressure:
 * completing quickly earns bonus XP, but there is no hard failure deadline.
 *
 * Scenarios:
 *   1. Lost and Found — describe a lost item to shopkeepers
 *   2. Medical Emergency — communicate symptoms to a healer
 *   3. Wrong Order — politely explain a mistake and request correction
 *   4. Rush Delivery — relay an urgent order between businesses
 */

import type { QuestSeed } from './quest-seed-library';

// ── Emergency / Situational Quest Seeds ─────────────────────────────────────

export const EMERGENCY_QUEST_SEEDS: QuestSeed[] = [
  // ── Lost and Found ────────────────────────────────────────────────────────
  {
    id: 'lost_and_found',
    name: 'Lost and Found',
    category: 'emergency',
    difficulty: 'beginner',
    params: [
      { name: 'itemName', type: 'string', description: 'Name of the lost item' },
      { name: 'ownerNpc', type: 'string', description: 'NPC who lost the item' },
      { name: 'businessA', type: 'string', description: 'First business to check' },
      { name: 'shopkeeperA', type: 'string', description: 'Shopkeeper at first business' },
      { name: 'businessB', type: 'string', description: 'Second business to check' },
      { name: 'shopkeeperB', type: 'string', description: 'Shopkeeper at second business' },
    ],
    titleTemplate: 'Lost: {{itemName}}',
    descriptionTemplate:
      '{{ownerNpc}} has lost their {{itemName}}! Visit nearby businesses and describe the item in {{targetLanguage}} to see if anyone has found it.',
    questType: 'emergency',
    objectiveTemplates: [
      { type: 'talk_to_npc', descriptionTemplate: 'Talk to {{ownerNpc}} about the lost {{itemName}}', countTemplate: 1 },
      { type: 'visit_location', descriptionTemplate: 'Check {{businessA}} for the lost item', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Describe the {{itemName}} to {{shopkeeperA}} in {{targetLanguage}}', countTemplate: 3 },
      { type: 'visit_location', descriptionTemplate: 'Check {{businessB}} for the lost item', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Describe the {{itemName}} to {{shopkeeperB}} in {{targetLanguage}}', countTemplate: 3 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use descriptive vocabulary (color, size, shape)', countTemplate: 4 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 35,
    tags: ['emergency', 'situational', 'lost_and_found', 'descriptive', 'practical', 'beginner'],
  },

  // ── Medical Emergency ─────────────────────────────────────────────────────
  {
    id: 'medical_emergency',
    name: 'Medical Emergency',
    category: 'emergency',
    difficulty: 'intermediate',
    params: [
      { name: 'patientNpc', type: 'string', description: 'NPC who is ill' },
      { name: 'healerNpc', type: 'string', description: 'Healer / doctor NPC' },
      { name: 'healerBusiness', type: 'string', description: 'Healer business name' },
      { name: 'symptom', type: 'string', description: 'Primary symptom', defaultValue: 'a bad headache' },
    ],
    titleTemplate: 'Help {{patientNpc}}!',
    descriptionTemplate:
      '{{patientNpc}} is feeling very ill with {{symptom}}. Rush to {{healerBusiness}} and explain the symptoms to {{healerNpc}} in {{targetLanguage}} so they can help.',
    questType: 'emergency',
    objectiveTemplates: [
      { type: 'talk_to_npc', descriptionTemplate: 'Check on {{patientNpc}} and learn about their symptoms', countTemplate: 1 },
      { type: 'visit_location', descriptionTemplate: 'Go to {{healerBusiness}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Explain {{patientNpc}}\'s symptoms to {{healerNpc}} in {{targetLanguage}}', countTemplate: 5 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use health and body vocabulary', countTemplate: 5 },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 5 },
    baseXp: 45,
    tags: ['emergency', 'situational', 'medical', 'health', 'body', 'practical', 'intermediate'],
  },

  // ── Wrong Order ───────────────────────────────────────────────────────────
  {
    id: 'wrong_order',
    name: 'Wrong Order',
    category: 'emergency',
    difficulty: 'beginner',
    params: [
      { name: 'businessName', type: 'string', description: 'Business where the mistake happened' },
      { name: 'npcName', type: 'string', description: 'Shopkeeper / server NPC' },
      { name: 'wrongItem', type: 'string', description: 'Item received incorrectly', defaultValue: 'the wrong dish' },
      { name: 'correctItem', type: 'string', description: 'Item that was actually ordered', defaultValue: 'what you ordered' },
    ],
    titleTemplate: 'That\'s Not What I Ordered!',
    descriptionTemplate:
      'You received {{wrongItem}} at {{businessName}} instead of {{correctItem}}. Politely explain the mistake to {{npcName}} in {{targetLanguage}} and request the correct item.',
    questType: 'emergency',
    objectiveTemplates: [
      { type: 'visit_location', descriptionTemplate: 'Go to {{businessName}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Politely explain the mistake to {{npcName}} in {{targetLanguage}}', countTemplate: 4 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use polite request and correction vocabulary', countTemplate: 3 },
    ],
    completionCriteria: { type: 'conversation_turns', requiredTurns: 4 },
    baseXp: 30,
    tags: ['emergency', 'situational', 'wrong_order', 'polite_request', 'practical', 'beginner'],
  },

  // ── Rush Delivery ─────────────────────────────────────────────────────────
  {
    id: 'rush_delivery',
    name: 'Rush Delivery',
    category: 'emergency',
    difficulty: 'intermediate',
    params: [
      { name: 'senderNpc', type: 'string', description: 'NPC who needs the delivery' },
      { name: 'senderBusiness', type: 'string', description: 'Business sending the order' },
      { name: 'receiverNpc', type: 'string', description: 'NPC at destination business' },
      { name: 'receiverBusiness', type: 'string', description: 'Business receiving the order' },
      { name: 'orderItem', type: 'string', description: 'Item being ordered', defaultValue: 'supplies' },
    ],
    titleTemplate: 'Urgent Delivery for {{senderBusiness}}',
    descriptionTemplate:
      '{{senderNpc}} at {{senderBusiness}} urgently needs {{orderItem}} from {{receiverBusiness}}. Rush over and relay the order to {{receiverNpc}} in {{targetLanguage}}, then bring back confirmation.',
    questType: 'emergency',
    objectiveTemplates: [
      { type: 'talk_to_npc', descriptionTemplate: 'Get the order details from {{senderNpc}} at {{senderBusiness}}', countTemplate: 1 },
      { type: 'visit_location', descriptionTemplate: 'Go to {{receiverBusiness}}', countTemplate: 1 },
      { type: 'complete_conversation', descriptionTemplate: 'Relay the order to {{receiverNpc}} in {{targetLanguage}}', countTemplate: 4 },
      { type: 'use_vocabulary', descriptionTemplate: 'Use quantity, item, and urgency vocabulary', countTemplate: 4 },
      { type: 'visit_location', descriptionTemplate: 'Return to {{senderBusiness}} with confirmation', countTemplate: 1 },
      { type: 'talk_to_npc', descriptionTemplate: 'Confirm the delivery to {{senderNpc}}', countTemplate: 1 },
    ],
    completionCriteria: { type: 'all_objectives' },
    baseXp: 45,
    tags: ['emergency', 'situational', 'rush_delivery', 'urgency', 'practical', 'intermediate'],
  },
];

/**
 * Soft time-pressure bonus configuration.
 * Completing an emergency quest within the bonus window awards extra XP.
 * There is no hard failure — the quest remains active past the bonus window.
 */
export interface TimeBonusConfig {
  /** Minutes within which the bonus is awarded */
  bonusWindowMinutes: number;
  /** Multiplier applied to base XP when completed within the window */
  bonusMultiplier: number;
}

export const EMERGENCY_TIME_BONUS: Record<string, TimeBonusConfig> = {
  lost_and_found: { bonusWindowMinutes: 10, bonusMultiplier: 1.5 },
  medical_emergency: { bonusWindowMinutes: 7, bonusMultiplier: 1.75 },
  wrong_order: { bonusWindowMinutes: 5, bonusMultiplier: 1.5 },
  rush_delivery: { bonusWindowMinutes: 8, bonusMultiplier: 1.75 },
};

/** Get all emergency quest seeds */
export function getEmergencyQuestSeeds(): QuestSeed[] {
  return EMERGENCY_QUEST_SEEDS;
}

/** Get a specific emergency seed by ID */
export function getEmergencySeedById(id: string): QuestSeed | undefined {
  return EMERGENCY_QUEST_SEEDS.find(s => s.id === id);
}

/**
 * Compute bonus XP for completing an emergency quest within the time window.
 * Returns the total XP (base + bonus) and whether the bonus was earned.
 */
export function computeTimeBonusXp(
  seedId: string,
  baseXp: number,
  startedAt: Date,
  completedAt: Date,
): { totalXp: number; bonusEarned: boolean; bonusXp: number } {
  const config = EMERGENCY_TIME_BONUS[seedId];
  if (!config) return { totalXp: baseXp, bonusEarned: false, bonusXp: 0 };

  const elapsedMinutes = (completedAt.getTime() - startedAt.getTime()) / 60_000;
  if (elapsedMinutes <= config.bonusWindowMinutes) {
    const bonusXp = Math.round(baseXp * (config.bonusMultiplier - 1));
    return { totalXp: baseXp + bonusXp, bonusEarned: true, bonusXp };
  }

  return { totalXp: baseXp, bonusEarned: false, bonusXp: 0 };
}
