/**
 * Quest Seed Generator
 *
 * Generates a rich corpus of playable seed quests across all quest categories
 * and difficulty levels using real world data (NPCs, locations, items).
 * Used during world generation to populate the world's available quest pool.
 *
 * Covers: exploration, conversation, vocabulary, grammar, listening, translation,
 * pronunciation, navigation, cultural, scavenger hunt, storytelling, commerce,
 * social, collection, delivery, crafting, combat, escort, and composite quests.
 */

import { ACHIEVABLE_OBJECTIVE_TYPES } from '../quest-objective-types.js';
import type { InsertQuest, Character, Settlement, World } from '../schema.js';
import { convertQuestToProlog } from '../prolog/quest-converter.js';
import { buildArrivalAssessmentQuest } from '../services/assessment-quest-bridge-shared.js';
import { DEPARTURE_ENCOUNTER, resolveTemplate } from '../assessment/departure-encounter.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick n distinct items from an array (or fewer if array is smaller) */
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function charName(c: Character): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

function getNPCs(characters: Character[]): Character[] {
  // Include characters with status 'active' or null (null means not explicitly deactivated)
  return characters.filter(c => c.status === 'active' || c.status === null || c.status === undefined);
}

function getLocationNames(settlements: Settlement[]): string[] {
  const names = settlements.map(s => s.name).filter(Boolean) as string[];
  return names.length > 0 ? names : ['Town Square', 'Market', 'Village Center'];
}

/** Compute center position from a settlement's boundary polygon, position field, or return null. */
function getSettlementCenter(settlement: Settlement): { x: number; y: number; z: number } | null {
  // Try boundary polygon first (most accurate)
  const poly = (settlement as any).boundaryPolygon as Array<{ x: number; z: number }> | undefined;
  if (poly && poly.length > 0) {
    const sumX = poly.reduce((s, p) => s + p.x, 0);
    const sumZ = poly.reduce((s, p) => s + p.z, 0);
    return {
      x: sumX / poly.length,
      y: (settlement as any).elevation ?? 0,
      z: sumZ / poly.length,
    };
  }
  // Fall back to settlement.position field
  const pos = (settlement as any).position as { x: number; y: number; z: number } | undefined;
  if (pos && typeof pos.x === 'number' && typeof pos.z === 'number') {
    return { x: pos.x, y: pos.y ?? 0, z: pos.z };
  }
  return null;
}

/** Build a map from settlement name → world-space position. */
function buildLocationPositionMap(settlements: Settlement[]): Map<string, { x: number; y: number; z: number }> {
  const map = new Map<string, { x: number; y: number; z: number }>();
  for (const s of settlements) {
    if (!s.name) continue;
    const pos = getSettlementCenter(s);
    if (pos) map.set(s.name, pos);
  }
  return map;
}

/** Build a map from settlement ID → world-space position (for NPC location resolution). */
function buildSettlementIdPositionMap(settlements: Settlement[]): Map<string, { x: number; y: number; z: number }> {
  const map = new Map<string, { x: number; y: number; z: number }>();
  for (const s of settlements) {
    const pos = getSettlementCenter(s);
    if (pos) map.set(s.id, pos);
  }
  return map;
}

/** Resolve an NPC's position by looking up their currentLocation (settlement ID) in the settlement map. */
function resolveNpcPosition(
  npc: Character,
  settlementIdPositions: Map<string, { x: number; y: number; z: number }>,
): { x: number; y: number; z: number } | null {
  if (!npc.currentLocation) return null;
  return settlementIdPositions.get(npc.currentLocation) ?? null;
}

// ── Seed quest definitions per type ──────────────────────────────────────────

interface SeedQuestContext {
  world: World;
  npcs: Character[];
  locations: string[];
  locationPositions: Map<string, { x: number; y: number; z: number }>;
  targetLanguage: string;
}

interface SeedQuestDef {
  objectiveType: string;
  title: string;
  description: string;
  questType: string;
  difficulty: string;
  buildObjectives: (ctx: SeedQuestContext) => any[];
  xp: number;
  /** Extra tags beyond the auto-generated 'seed' and 'objective-type:*' */
  extraTags?: string[];
}

function buildSeedQuests(): SeedQuestDef[] {
  // Helper to make an objective with standard fields
  const obj = (id: string, type: string, description: string, extra: Record<string, any> = {}) => ({
    id, type, description,
    requiredCount: 1, currentCount: 0, completed: false,
    ...extra,
  });

  return [
    // ═══════════════════════════════════════════════════════════════════════
    // EXPLORATION & NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'visit_location',
      title: 'Explore the Neighborhood',
      description: 'Get familiar with the area by visiting a key location.',
      questType: 'navigation',
      difficulty: 'beginner',
      xp: 15,
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        return [obj('obj_0', 'visit_location', `Visit ${loc}`, { target: loc })];
      },
    },
    {
      objectiveType: 'visit_location',
      title: 'Grand Tour',
      description: 'Visit three different locations to get a feel for the area.',
      questType: 'exploration',
      difficulty: 'intermediate',
      xp: 30,
      extraTags: ['multi-step'],
      buildObjectives: (ctx) => {
        const locs = pickN(ctx.locations, 3);
        return locs.map((loc, i) => obj(`obj_${i}`, 'visit_location', `Visit ${loc}`, { target: loc }));
      },
    },
    {
      objectiveType: 'discover_location',
      title: 'Uncharted Territory',
      description: 'Discover a new location you have not visited before.',
      questType: 'exploration',
      difficulty: 'beginner',
      xp: 20,
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        return [obj('obj_0', 'discover_location', `Discover ${loc}`, { target: loc, locationName: loc })];
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CONVERSATION & SOCIAL
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'talk_to_npc',
      title: 'Introduce Yourself',
      description: 'Meet a local resident and introduce yourself.',
      questType: 'conversation',
      difficulty: 'beginner',
      xp: 10,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [obj('obj_0', 'talk_to_npc', npc ? `Talk to ${charName(npc)}` : 'Talk to a local resident', {
          target: npc ? charName(npc) : undefined, npcId: npc?.id,
        })];
      },
    },
    {
      objectiveType: 'talk_to_npc',
      title: 'Meet the Locals',
      description: 'Introduce yourself to three different people in the area.',
      questType: 'social',
      difficulty: 'beginner',
      xp: 20,
      extraTags: ['multi-npc'],
      buildObjectives: (ctx) => {
        const npcs = pickN(ctx.npcs, 3);
        if (npcs.length === 0) return [obj('obj_0', 'talk_to_npc', 'Talk to 3 different residents', { requiredCount: 3 })];
        return npcs.map((npc, i) => obj(`obj_${i}`, 'talk_to_npc', `Talk to ${charName(npc)}`, {
          target: charName(npc), npcId: npc.id, npcName: charName(npc),
        }));
      },
    },
    {
      objectiveType: 'complete_conversation',
      title: 'A Good Chat',
      description: 'Have a meaningful conversation with an NPC — keep talking for several turns.',
      questType: 'conversation',
      difficulty: 'beginner',
      xp: 20,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [obj('obj_0', 'complete_conversation',
          npc ? `Have a 3-turn conversation with ${charName(npc)}` : 'Have a 3-turn conversation with any NPC',
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined, requiredCount: 3 },
        )];
      },
    },
    {
      objectiveType: 'complete_conversation',
      title: 'Deep Conversation',
      description: 'Have an extended conversation of at least 6 turns with a single NPC.',
      questType: 'conversation',
      difficulty: 'intermediate',
      xp: 35,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [obj('obj_0', 'complete_conversation',
          npc ? `Have a 6-turn conversation with ${charName(npc)}` : 'Have a 6-turn conversation with any NPC',
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined, requiredCount: 6 },
        )];
      },
    },
    {
      objectiveType: 'introduce_self',
      title: 'First Impressions',
      description: 'Introduce yourself to an NPC using the target language.',
      questType: 'conversation',
      difficulty: 'beginner',
      xp: 15,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [obj('obj_0', 'introduce_self',
          npc ? `Introduce yourself to ${charName(npc)} in ${ctx.targetLanguage}` : `Introduce yourself in ${ctx.targetLanguage}`,
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined },
        )];
      },
    },
    {
      objectiveType: 'build_friendship',
      title: 'Making Friends',
      description: 'Build a friendship with a local by having several conversations.',
      questType: 'social',
      difficulty: 'beginner',
      xp: 25,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [obj('obj_0', 'build_friendship',
          npc ? `Have 3 conversations with ${charName(npc)} to build a friendship` : 'Have 3 conversations with a local to build a friendship',
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined, requiredCount: 3 },
        )];
      },
    },
    {
      objectiveType: 'give_gift',
      title: 'A Thoughtful Gift',
      description: 'Find a gift and present it to a local to strengthen your bond.',
      questType: 'social',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          obj('obj_0', 'collect_item', 'Find a gift item'),
          obj('obj_1', 'give_gift',
            npc ? `Present the gift to ${charName(npc)}` : 'Present the gift to a local resident',
            { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined },
          ),
        ];
      },
    },
    {
      objectiveType: 'gain_reputation',
      title: 'Earn Their Trust',
      description: 'Build your standing with the community through positive interactions.',
      questType: 'social',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: (ctx) => {
        const settlementName = ctx.locations[0] || 'the settlement';
        return [obj('obj_0', 'gain_reputation', `Gain reputation with ${settlementName}`, {
          factionId: settlementName,
          reputationGained: 0,
          reputationRequired: 10,
        })];
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // VOCABULARY & KNOWLEDGE ACQUISITION
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'use_vocabulary',
      title: 'Words in Action',
      description: 'Use target-language words during a conversation.',
      questType: 'vocabulary',
      difficulty: 'beginner',
      xp: 20,
      buildObjectives: (ctx) => [obj('obj_0', 'use_vocabulary',
        `Use 3 ${ctx.targetLanguage} words in conversation`, { requiredCount: 3 },
      )],
    },
    {
      objectiveType: 'use_vocabulary',
      title: 'Vocabulary Immersion',
      description: 'Use many target-language words across multiple conversations.',
      questType: 'vocabulary',
      difficulty: 'intermediate',
      xp: 35,
      buildObjectives: (ctx) => [obj('obj_0', 'use_vocabulary',
        `Use 10 ${ctx.targetLanguage} words in conversations`, { requiredCount: 10 },
      )],
    },
    {
      objectiveType: 'collect_vocabulary',
      title: 'Word Collector',
      description: 'Walk around and collect vocabulary words from labeled objects in the world.',
      questType: 'vocabulary',
      difficulty: 'beginner',
      xp: 20,
      buildObjectives: () => [obj('obj_0', 'collect_vocabulary',
        'Collect 3 vocabulary words by approaching labeled objects', { requiredCount: 3 },
      )],
    },
    {
      objectiveType: 'collect_vocabulary',
      title: 'Word Hoarder',
      description: 'Collect a large number of vocabulary words from the world around you.',
      questType: 'vocabulary',
      difficulty: 'intermediate',
      xp: 35,
      buildObjectives: () => [obj('obj_0', 'collect_vocabulary',
        'Collect 8 vocabulary words from the world', { requiredCount: 8 },
      )],
    },
    {
      objectiveType: 'identify_object',
      title: 'Name That Thing',
      description: 'Click on objects in the world and type their name in the target language.',
      questType: 'visual_vocabulary',
      difficulty: 'beginner',
      xp: 20,
      buildObjectives: (ctx) => [obj('obj_0', 'identify_object',
        `Correctly identify 3 objects by their ${ctx.targetLanguage} name`, { requiredCount: 3 },
      )],
    },
    {
      objectiveType: 'examine_object',
      title: 'Curious Observer',
      description: 'Examine objects in the world to learn their names in the target language.',
      questType: 'vocabulary',
      difficulty: 'beginner',
      xp: 15,
      buildObjectives: (ctx) => [obj('obj_0', 'examine_object',
        `Examine 3 objects to learn their ${ctx.targetLanguage} names`, { requiredCount: 3 },
      )],
    },
    {
      objectiveType: 'point_and_name',
      title: 'Point and Say',
      description: 'Click on objects and name them in the target language to practice vocabulary.',
      questType: 'visual_vocabulary',
      difficulty: 'beginner',
      xp: 20,
      buildObjectives: (ctx) => [obj('obj_0', 'point_and_name',
        `Point at 5 objects and name them in ${ctx.targetLanguage}`, { requiredCount: 5 },
      )],
    },
    {
      objectiveType: 'read_sign',
      title: 'Reading Around Town',
      description: 'Read signs, menus, and other text written in the target language.',
      questType: 'vocabulary',
      difficulty: 'beginner',
      xp: 15,
      buildObjectives: (ctx) => [obj('obj_0', 'read_sign',
        `Read 3 signs or texts written in ${ctx.targetLanguage}`, { requiredCount: 3 },
      )],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // GRAMMAR & PATTERN RECOGNITION
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'use_vocabulary',
      title: 'Grammar in Practice',
      description: 'Use correct grammar patterns during conversations with NPCs.',
      questType: 'grammar',
      difficulty: 'intermediate',
      xp: 30,
      extraTags: ['grammar'],
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          obj('obj_0', 'complete_conversation',
            npc ? `Have a conversation with ${charName(npc)} (3 turns minimum)` : 'Have a conversation with any NPC (3 turns minimum)',
            { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined, requiredCount: 3 }),
          obj('obj_1', 'use_vocabulary', `Use 5 ${ctx.targetLanguage} words correctly in context`, { requiredCount: 5 }),
        ];
      },
    },
    {
      objectiveType: 'write_response',
      title: 'Written Word',
      description: 'Practice writing in the target language by composing responses to prompts.',
      questType: 'grammar',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: (ctx) => [obj('obj_0', 'write_response',
        `Write 2 responses in ${ctx.targetLanguage}`, { requiredCount: 2 },
      )],
    },
    {
      objectiveType: 'describe_scene',
      title: 'Picture This',
      description: 'Describe what you see around you using the target language.',
      questType: 'grammar',
      difficulty: 'intermediate',
      xp: 25,
      buildObjectives: (ctx) => [obj('obj_0', 'describe_scene',
        `Describe 2 scenes in ${ctx.targetLanguage}`, { requiredCount: 2 },
      )],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // LISTENING & COMPREHENSION
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'listening_comprehension',
      title: 'Story Time',
      description: 'Listen to an NPC tell a story and answer comprehension questions.',
      questType: 'listening_comprehension',
      difficulty: 'intermediate',
      xp: 35,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [obj('obj_0', 'listening_comprehension',
          npc ? `Listen to ${charName(npc)}'s story and answer 2 questions correctly` : 'Listen to a story and answer 2 questions correctly',
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined, requiredCount: 2 },
        )];
      },
    },
    {
      objectiveType: 'listen_and_repeat',
      title: 'Parrot Practice',
      description: 'Listen to an NPC speak and repeat what they say to practice pronunciation.',
      questType: 'listening_comprehension',
      difficulty: 'beginner',
      xp: 20,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [obj('obj_0', 'listen_and_repeat',
          npc ? `Listen to ${charName(npc)} and repeat 3 phrases` : 'Listen and repeat 3 phrases from an NPC',
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined, requiredCount: 3 },
        )];
      },
    },
    {
      objectiveType: 'listen_and_repeat',
      title: 'Echo Challenge',
      description: 'Repeat back longer phrases from NPCs to improve your listening and speaking.',
      questType: 'listening_comprehension',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [obj('obj_0', 'listen_and_repeat',
          npc ? `Listen to ${charName(npc)} and repeat 6 phrases` : 'Listen and repeat 6 phrases from NPCs',
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined, requiredCount: 6 },
        )];
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TRANSLATION
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'translation_challenge',
      title: 'Lost in Translation',
      description: 'Translate phrases between English and the target language.',
      questType: 'translation_challenge',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: (ctx) => [obj('obj_0', 'translation_challenge',
        `Correctly translate 3 ${ctx.targetLanguage} phrases`, { requiredCount: 3 },
      )],
    },
    {
      objectiveType: 'translation_challenge',
      title: 'Master Translator',
      description: 'Translate many phrases accurately to prove your language skills.',
      questType: 'translation_challenge',
      difficulty: 'advanced',
      xp: 45,
      buildObjectives: (ctx) => [obj('obj_0', 'translation_challenge',
        `Correctly translate 8 ${ctx.targetLanguage} phrases`, { requiredCount: 8 },
      )],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PRONUNCIATION & SPEAKING
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'pronunciation_check',
      title: 'Say It Right',
      description: 'Pronounce phrases in the target language and get accuracy feedback.',
      questType: 'pronunciation',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: (ctx) => [obj('obj_0', 'pronunciation_check',
        `Pronounce 3 ${ctx.targetLanguage} phrases with good accuracy`, { requiredCount: 3 },
      )],
    },
    {
      objectiveType: 'pronunciation_check',
      title: 'Fluency Drill',
      description: 'Pronounce many phrases to build confidence and accuracy.',
      questType: 'pronunciation',
      difficulty: 'advanced',
      xp: 40,
      buildObjectives: (ctx) => [obj('obj_0', 'pronunciation_check',
        `Pronounce 8 ${ctx.targetLanguage} phrases accurately`, { requiredCount: 8 },
      )],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NAVIGATION (LANGUAGE-BASED)
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'navigate_language',
      title: 'Follow the Signs',
      description: 'Follow directions given in the target language to reach your destination.',
      questType: 'navigation',
      difficulty: 'advanced',
      xp: 40,
      buildObjectives: (ctx) => {
        const dest = pick(ctx.locations);
        const intermediates = ctx.locations.filter(l => l !== dest).slice(0, 2);
        const allWaypoints = [...intermediates, dest];
        return [obj('obj_0', 'navigate_language',
          `Follow ${ctx.targetLanguage} directions to reach ${dest}`,
          { target: dest, stepsRequired: allWaypoints.length,
            navigationWaypoints: allWaypoints.map(name => ({ instruction: `Walk toward ${name}`, locationName: name })),
          },
        )];
      },
    },
    {
      objectiveType: 'follow_directions',
      title: 'Direction Master',
      description: 'An NPC gives you directions in the target language. Follow them step by step.',
      questType: 'follow_instructions',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: (ctx) => {
        const stepLocations = ctx.locations.slice(0, 3);
        const stepCount = stepLocations.length || 3;
        return [obj('obj_0', 'follow_directions',
          `Follow ${stepCount} steps of ${ctx.targetLanguage} directions`,
          { requiredCount: stepCount, stepsRequired: stepCount,
            directionSteps: stepLocations.map(name => ({ instruction: `Go to ${name}`, englishHint: `Go to ${name}`, locationName: name })),
          },
        )];
      },
    },
    {
      objectiveType: 'ask_for_directions',
      title: 'Which Way?',
      description: 'Ask NPCs for directions using the target language.',
      questType: 'navigation',
      difficulty: 'beginner',
      xp: 20,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [obj('obj_0', 'ask_for_directions',
          npc ? `Ask ${charName(npc)} for directions in ${ctx.targetLanguage}` : `Ask an NPC for directions in ${ctx.targetLanguage}`,
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined, requiredCount: 2 },
        )];
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CULTURAL
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'talk_to_npc',
      title: 'Cultural Exchange',
      description: 'Talk to locals to learn about the customs and culture of the area.',
      questType: 'cultural',
      difficulty: 'beginner',
      xp: 20,
      extraTags: ['cultural'],
      buildObjectives: (ctx) => {
        const npcs = pickN(ctx.npcs, 2);
        if (npcs.length === 0) return [obj('obj_0', 'talk_to_npc', 'Talk to 2 locals about their culture', { requiredCount: 2 })];
        return npcs.map((npc, i) => obj(`obj_${i}`, 'talk_to_npc', `Talk to ${charName(npc)} about local customs`, {
          target: charName(npc), npcId: npc.id, npcName: charName(npc),
        }));
      },
    },
    {
      objectiveType: 'visit_location',
      title: 'Cultural Landmarks',
      description: 'Visit important cultural locations and examine what you find there.',
      questType: 'cultural',
      difficulty: 'intermediate',
      xp: 30,
      extraTags: ['cultural'],
      buildObjectives: (ctx) => {
        const locs = pickN(ctx.locations, 2);
        const objectives: any[] = locs.map((loc, i) => obj(`obj_${i}`, 'visit_location', `Visit ${loc}`, { target: loc }));
        objectives.push(obj(`obj_${locs.length}`, 'examine_object', 'Examine a cultural object at one of the locations', { requiredCount: 1 }));
        return objectives;
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SCAVENGER HUNT
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'identify_object',
      title: 'Scavenger Hunt: Basics',
      description: 'Find and identify objects around town by their target-language names.',
      questType: 'scavenger_hunt',
      difficulty: 'beginner',
      xp: 25,
      buildObjectives: (ctx) => [
        obj('obj_0', 'identify_object', `Identify 3 objects by their ${ctx.targetLanguage} name`, { requiredCount: 3 }),
        obj('obj_1', 'collect_vocabulary', 'Collect 2 new vocabulary words along the way', { requiredCount: 2 }),
      ],
    },
    {
      objectiveType: 'collect_item',
      title: 'Scavenger Hunt: Collector',
      description: 'Collect specific items from around the world while learning their names.',
      questType: 'scavenger_hunt',
      difficulty: 'intermediate',
      xp: 35,
      buildObjectives: (ctx) => [
        obj('obj_0', 'collect_item', 'Collect 3 items from the world', { requiredCount: 3 }),
        obj('obj_1', 'examine_object', `Examine 2 objects to learn their ${ctx.targetLanguage} names`, { requiredCount: 2 }),
      ],
    },
    {
      objectiveType: 'identify_object',
      title: 'Scavenger Hunt: Expert',
      description: 'Find, identify, and name many objects in the target language — a comprehensive vocabulary challenge.',
      questType: 'scavenger_hunt',
      difficulty: 'advanced',
      xp: 50,
      buildObjectives: (ctx) => [
        obj('obj_0', 'identify_object', `Identify 6 objects by their ${ctx.targetLanguage} name`, { requiredCount: 6 }),
        obj('obj_1', 'point_and_name', `Point and name 4 additional objects`, { requiredCount: 4 }),
        obj('obj_2', 'collect_vocabulary', 'Collect 5 vocabulary words', { requiredCount: 5 }),
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // STORYTELLING
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'complete_conversation',
      title: 'Tell Your Story',
      description: 'Practice narrative skills by having a long conversation where you tell a story about yourself.',
      questType: 'storytelling',
      difficulty: 'intermediate',
      xp: 35,
      extraTags: ['storytelling', 'narrative'],
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [obj('obj_0', 'complete_conversation',
          npc ? `Tell ${charName(npc)} a story about yourself (5 turns)` : 'Tell an NPC a story about yourself (5 turns)',
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined, requiredCount: 5 },
        )];
      },
    },
    {
      objectiveType: 'complete_conversation',
      title: 'Campfire Tales',
      description: 'Listen to a local tell a story, then retell it in your own words to someone else.',
      questType: 'storytelling',
      difficulty: 'advanced',
      xp: 45,
      extraTags: ['storytelling', 'listening'],
      buildObjectives: (ctx) => {
        const npcs = pickN(ctx.npcs, 2);
        if (npcs.length < 2) return [
          obj('obj_0', 'listen_and_repeat', 'Listen to an NPC tell a story and repeat key phrases', { requiredCount: 3 }),
          obj('obj_1', 'complete_conversation', 'Retell the story to another NPC (5 turns)', { requiredCount: 5 }),
        ];
        return [
          obj('obj_0', 'listen_and_repeat', `Listen to ${charName(npcs[0])} tell a story and repeat key phrases`, {
            target: charName(npcs[0]), npcId: npcs[0].id, npcName: charName(npcs[0]), requiredCount: 3,
          }),
          obj('obj_1', 'complete_conversation', `Retell the story to ${charName(npcs[1])} (5 turns)`, {
            target: charName(npcs[1]), npcId: npcs[1].id, npcName: charName(npcs[1]), requiredCount: 5,
          }),
        ];
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // COMMERCE & DAILY LIFE
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'order_food',
      title: 'Lunch Order',
      description: 'Order food or drinks at a local establishment using the target language.',
      questType: 'conversation',
      difficulty: 'beginner',
      xp: 20,
      extraTags: ['commerce', 'daily-life'],
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [obj('obj_0', 'order_food',
          npc ? `Order food from ${charName(npc)} in ${ctx.targetLanguage}` : `Order food in ${ctx.targetLanguage}`,
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined },
        )];
      },
    },
    {
      objectiveType: 'haggle_price',
      title: 'Bargain Hunter',
      description: 'Negotiate a price with a merchant using the target language.',
      questType: 'conversation',
      difficulty: 'intermediate',
      xp: 30,
      extraTags: ['commerce'],
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [obj('obj_0', 'haggle_price',
          npc ? `Negotiate a price with ${charName(npc)} in ${ctx.targetLanguage}` : `Negotiate a price in ${ctx.targetLanguage}`,
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined },
        )];
      },
    },
    {
      objectiveType: 'order_food',
      title: 'Dinner Party',
      description: 'Order a full meal — appetizer, main course, and drink — using only the target language.',
      questType: 'conversation',
      difficulty: 'intermediate',
      xp: 35,
      extraTags: ['commerce', 'daily-life'],
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          obj('obj_0', 'order_food',
            npc ? `Order food from ${charName(npc)} in ${ctx.targetLanguage}` : `Order food in ${ctx.targetLanguage}`,
            { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined, requiredCount: 3 }),
          obj('obj_1', 'use_vocabulary', `Use 3 food-related ${ctx.targetLanguage} words`, { requiredCount: 3 }),
        ];
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ITEMS, DELIVERY & CRAFTING
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'collect_item',
      title: 'Gather Supplies',
      description: 'Collect an item from the world.',
      questType: 'collection',
      difficulty: 'beginner',
      xp: 15,
      buildObjectives: () => [obj('obj_0', 'collect_item', 'Pick up an item from the world')],
    },
    {
      objectiveType: 'deliver_item',
      title: 'Special Delivery',
      description: 'Pick up an item and deliver it to an NPC.',
      questType: 'delivery',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          obj('obj_0', 'collect_item', 'Pick up the delivery package'),
          obj('obj_1', 'deliver_item',
            npc ? `Deliver the package to ${charName(npc)}` : 'Deliver the package to the recipient',
            { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined },
          ),
        ];
      },
    },
    {
      objectiveType: 'craft_item',
      title: 'First Craft',
      description: 'Craft an item using the crafting system.',
      questType: 'crafting',
      difficulty: 'intermediate',
      xp: 25,
      buildObjectives: () => [obj('obj_0', 'craft_item', 'Craft any item at a crafting station')],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // COMBAT & ESCORT
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'defeat_enemies',
      title: 'Prove Your Mettle',
      description: 'Defeat an enemy in combat.',
      questType: 'combat',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: () => [obj('obj_0', 'defeat_enemies', 'Defeat 1 enemy')],
    },
    {
      objectiveType: 'escort_npc',
      title: 'Safe Passage',
      description: 'Escort an NPC safely to their destination.',
      questType: 'escort',
      difficulty: 'intermediate',
      xp: 35,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        const dest = pick(ctx.locations);
        return [obj('obj_0', 'escort_npc',
          npc ? `Escort ${charName(npc)} to ${dest}` : `Escort the traveler to ${dest}`,
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined },
        )];
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MULTI-SKILL COMPOSITE QUESTS
    // ═══════════════════════════════════════════════════════════════════════

    {
      objectiveType: 'talk_to_npc',
      title: 'Newcomer\'s Welcome',
      description: 'Get oriented: visit a location, meet someone, and learn a few words along the way.',
      questType: 'exploration',
      difficulty: 'beginner',
      xp: 30,
      extraTags: ['composite', 'onboarding'],
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          obj('obj_0', 'visit_location', `Visit ${loc}`, { target: loc }),
          obj('obj_1', 'talk_to_npc',
            npc ? `Talk to ${charName(npc)}` : 'Talk to a local',
            { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined },
          ),
          obj('obj_2', 'collect_vocabulary', 'Collect 2 vocabulary words', { requiredCount: 2 }),
        ];
      },
    },
    {
      objectiveType: 'complete_conversation',
      title: 'The Full Experience',
      description: 'Visit a location, have a conversation, use vocabulary, and identify an object — a well-rounded language challenge.',
      questType: 'conversation',
      difficulty: 'intermediate',
      xp: 45,
      extraTags: ['composite'],
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [
          obj('obj_0', 'visit_location', `Go to ${loc}`, { target: loc }),
          obj('obj_1', 'complete_conversation',
            npc ? `Have a 3-turn conversation with ${charName(npc)}` : 'Have a 3-turn conversation',
            { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined, requiredCount: 3 },
          ),
          obj('obj_2', 'use_vocabulary', `Use 3 ${ctx.targetLanguage} words in conversation`, { requiredCount: 3 }),
          obj('obj_3', 'identify_object', `Identify 1 object by its ${ctx.targetLanguage} name`),
        ];
      },
    },
    {
      objectiveType: 'use_vocabulary',
      title: 'Language Explorer',
      description: 'Explore a new area, read signs, examine objects, and talk to people — all in the target language.',
      questType: 'exploration',
      difficulty: 'advanced',
      xp: 55,
      extraTags: ['composite', 'immersion'],
      buildObjectives: (ctx) => {
        const locs = pickN(ctx.locations, 2);
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        const objectives: any[] = [
          ...locs.map((loc, i) => obj(`obj_${i}`, 'visit_location', `Visit ${loc}`, { target: loc })),
        ];
        const nextIdx = locs.length;
        objectives.push(obj(`obj_${nextIdx}`, 'read_sign', `Read 2 signs in ${ctx.targetLanguage}`, { requiredCount: 2 }));
        objectives.push(obj(`obj_${nextIdx + 1}`, 'examine_object', 'Examine 2 objects', { requiredCount: 2 }));
        objectives.push(obj(`obj_${nextIdx + 2}`, 'complete_conversation',
          npc ? `Have a conversation with ${charName(npc)} (4 turns)` : 'Have a conversation (4 turns)',
          { target: npc ? charName(npc) : undefined, npcId: npc?.id, npcName: npc ? charName(npc) : undefined, requiredCount: 4 },
        ));
        objectives.push(obj(`obj_${nextIdx + 3}`, 'use_vocabulary', `Use 5 ${ctx.targetLanguage} words`, { requiredCount: 5 }));
        return objectives;
      },
    },
  ];
}

// ── Main generator ───────────────────────────────────────────────────────────

export interface SeedQuestOptions {
  world: World;
  characters: Character[];
  settlements: Settlement[];
  /** If provided, only generate seed quests for these objective types */
  onlyTypes?: string[];
  /** Player name to assign quests to (default: 'Player') */
  assignedTo?: string;
}

/**
 * Generate seed quests for a world — multiple quests per category at varying difficulties.
 * Returns InsertQuest objects ready to be saved to the database.
 */
export function generateSeedQuests(options: SeedQuestOptions): InsertQuest[] {
  const { world, characters, settlements, onlyTypes, assignedTo = 'Player' } = options;

  const npcs = getNPCs(characters);
  const locations = getLocationNames(settlements);
  const locationPositions = buildLocationPositionMap(settlements);
  const settlementIdPositions = buildSettlementIdPositionMap(settlements);
  const targetLanguage = world.targetLanguage || 'English';

  // Build NPC ID → position map for resolving NPC-targeted objectives
  const npcPositionMap = new Map<string, { x: number; y: number; z: number }>();
  for (const npc of npcs) {
    const pos = resolveNpcPosition(npc, settlementIdPositions);
    if (pos) npcPositionMap.set(npc.id, pos);
  }

  const ctx: SeedQuestContext = { world, npcs, locations, locationPositions, targetLanguage };

  const seedDefs = buildSeedQuests();
  const filtered = onlyTypes
    ? seedDefs.filter(d => onlyTypes.includes(d.objectiveType))
    : seedDefs;

  const quests: InsertQuest[] = [];

  for (const def of filtered) {
    const objectives = def.buildObjectives(ctx);

    // Enrich objectives that reference locations with position data
    let questLocationName: string | null = null;
    let questLocationPosition: { x: number; y: number; z: number } | null = null;

    for (const objective of objectives) {
      // Objectives reference locations via target (visit_location) or locationName
      const locName: string | undefined = objective.locationName || objective.target;
      if (locName && locationPositions.has(locName)) {
        const pos = locationPositions.get(locName)!;
        objective.locationPosition = pos;
        if (!objective.locationName) objective.locationName = locName;
        // Use the first location-referencing objective for the quest-level binding
        if (!questLocationName) {
          questLocationName = locName;
          questLocationPosition = pos;
        }
      }

      // For NPC-targeted objectives, resolve position from NPC's settlement
      if (!objective.locationPosition && objective.npcId && npcPositionMap.has(objective.npcId)) {
        objective.locationPosition = { ...npcPositionMap.get(objective.npcId)! };
      }

      // Enrich navigation waypoints with positions
      if (objective.navigationWaypoints) {
        for (const wp of objective.navigationWaypoints) {
          if (wp.locationName && locationPositions.has(wp.locationName)) {
            wp.locationPosition = locationPositions.get(wp.locationName)!;
          }
        }
      }
      if (objective.directionSteps) {
        for (const step of objective.directionSteps) {
          if (step.locationName && locationPositions.has(step.locationName)) {
            step.locationPosition = locationPositions.get(step.locationName)!;
          }
        }
      }
    }

    // Fallback pass: ensure every objective has a locationPosition.
    // Use the first resolved quest-level position, NPC position, or pick a random settlement center.
    const fallbackPosition = questLocationPosition
      ?? (locationPositions.size > 0 ? Array.from(locationPositions.values())[0] : null)
      ?? (settlementIdPositions.size > 0 ? Array.from(settlementIdPositions.values())[0] : null);

    if (fallbackPosition) {
      for (const objective of objectives) {
        if (!objective.locationPosition) {
          objective.locationPosition = { ...fallbackPosition };
        }
      }
    }

    // Pick a random NPC as quest giver
    const giver = npcs.length > 0 ? pick(npcs) : null;

    const quest: InsertQuest = {
      worldId: world.id,
      title: def.title,
      description: def.description,
      questType: def.questType,
      difficulty: def.difficulty,
      targetLanguage,
      assignedTo,
      assignedBy: giver ? charName(giver) : null,
      assignedByCharacterId: giver?.id ?? null,
      status: 'unavailable',
      objectives,
      experienceReward: def.xp,
      rewards: { xp: def.xp, fluency: Math.round(def.xp / 5) },
      tags: ['seed', `objective-type:${def.objectiveType}`, `category:${def.questType}`, ...(def.extraTags || [])],
      locationName: questLocationName ?? (fallbackPosition ? locations[0] : null),
      locationPosition: questLocationPosition ?? fallbackPosition ?? null,
    };

    // Generate Prolog content
    try {
      const result = convertQuestToProlog(quest as any);
      if (result.prologContent) {
        (quest as any).content = result.prologContent;
      }
    } catch {
      // Non-critical
    }

    quests.push(quest);
  }

  // ── Assessment quests (Arrival + Departure) ────────────────────────────────
  // These are pre-created in the world so the playthrough can find and use them.
  // They should NOT be created per-playthrough.

  if (isLanguageLearningWorld(world)) {
    const cityName = locations[0] || 'the city';

    // Resolve a default assessment position (first settlement or any available position)
    const assessmentPosition = (locationPositions.size > 0 ? Array.from(locationPositions.values())[0] : null)
      ?? (settlementIdPositions.size > 0 ? Array.from(settlementIdPositions.values())[0] : null);

    // Arrival Assessment — SKIP here; created by seedMainQuestChain() in quest-chain-templates.ts.
    // Generating it here as well creates a duplicate.

    // Departure Assessment
    const departureVars = { targetLanguage, cityName };
    const departureObjectives = DEPARTURE_ENCOUNTER.phases.map(phase => ({
      id: `obj_${phase.id}`,
      type: 'complete_conversation',
      description: resolveTemplate(phase.description, departureVars),
      requiredCount: 1,
      currentCount: 0,
      completed: false,
      assessmentPhaseId: phase.id,
      ...(assessmentPosition ? { locationPosition: { ...assessmentPosition } } : {}),
    }));

    const departureQuest: InsertQuest = {
      worldId: world.id,
      assignedTo: 'unassigned',
      assignedBy: null,
      title: 'Departure Assessment',
      description: resolveTemplate(DEPARTURE_ENCOUNTER.description, departureVars),
      questType: 'assessment',
      difficulty: 'beginner',
      targetLanguage,
      objectives: departureObjectives,
      experienceReward: 50,
      rewards: { xp: 50, fluency: 5, cefrAssessment: true },
      status: 'unavailable',
      tags: ['assessment', 'departure', 'non-skippable', 'non-abandonable'],
      ...(assessmentPosition ? { locationPosition: assessmentPosition, locationName: cityName } : {}),
    } as InsertQuest;
    quests.push(departureQuest);
  }

  return quests;
}

/**
 * Check if a world is a language-learning world.
 */
function isLanguageLearningWorld(world: World): boolean {
  const gameType = ((world as any).gameType || '').toLowerCase();
  return (
    gameType === 'language-learning' ||
    gameType.includes('language') ||
    !!world.targetLanguage
  );
}

/**
 * Get the list of all canonical objective types that have seed quests.
 */
export function getSeedObjectiveTypes(): string[] {
  return ACHIEVABLE_OBJECTIVE_TYPES.map(t => t.type);
}
