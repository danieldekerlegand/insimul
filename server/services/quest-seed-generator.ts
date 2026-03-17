/**
 * Quest Seed Generator
 *
 * Generates exactly one playable quest per canonical objective type using
 * real world data (NPCs, locations, items). Used during world generation
 * and bulk quest generation to ensure full mechanic coverage.
 */

import { ACHIEVABLE_OBJECTIVE_TYPES } from '../../shared/quest-objective-types.js';
import type { InsertQuest, Character, Settlement, World } from '../../shared/schema.js';
import { convertQuestToProlog } from '../../shared/prolog/quest-converter.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function charName(c: Character): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

function getNPCs(characters: Character[]): Character[] {
  return characters.filter(c => c.status === 'active');
}

function getLocationNames(settlements: Settlement[]): string[] {
  const names = settlements.map(s => s.name).filter(Boolean) as string[];
  return names.length > 0 ? names : ['Town Square', 'Market', 'Village Center'];
}

// ── Seed quest definitions per type ──────────────────────────────────────────

interface SeedQuestContext {
  world: World;
  npcs: Character[];
  locations: string[];
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
}

function buildSeedQuests(): SeedQuestDef[] {
  return [
    {
      objectiveType: 'visit_location',
      title: 'Explore the Neighborhood',
      description: 'Get familiar with the area by visiting a key location.',
      questType: 'navigation',
      difficulty: 'beginner',
      xp: 15,
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        return [{
          id: 'obj_0', type: 'visit_location',
          description: `Visit ${loc}`,
          target: loc, requiredCount: 1, currentCount: 0, completed: false,
        }];
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
        return [{
          id: 'obj_0', type: 'discover_location',
          description: `Discover ${loc}`,
          target: loc, locationName: loc,
          requiredCount: 1, currentCount: 0, completed: false,
        }];
      },
    },
    {
      objectiveType: 'talk_to_npc',
      title: 'Introduce Yourself',
      description: 'Meet a local resident and introduce yourself.',
      questType: 'conversation',
      difficulty: 'beginner',
      xp: 10,
      buildObjectives: (ctx) => {
        if (ctx.npcs.length === 0) return [{
          id: 'obj_0', type: 'talk_to_npc',
          description: 'Talk to a local resident',
          requiredCount: 1, currentCount: 0, completed: false,
        }];
        const npc = pick(ctx.npcs);
        return [{
          id: 'obj_0', type: 'talk_to_npc',
          description: `Talk to ${charName(npc)}`,
          target: charName(npc), npcId: npc.id,
          requiredCount: 1, currentCount: 0, completed: false,
        }];
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
        return [{
          id: 'obj_0', type: 'complete_conversation',
          description: npc
            ? `Have a 3-turn conversation with ${charName(npc)}`
            : 'Have a 3-turn conversation with any NPC',
          target: npc ? charName(npc) : undefined,
          requiredCount: 3, currentCount: 0, completed: false,
        }];
      },
    },
    {
      objectiveType: 'use_vocabulary',
      title: 'Words in Action',
      description: `Use target-language words during a conversation.`,
      questType: 'vocabulary',
      difficulty: 'beginner',
      xp: 20,
      buildObjectives: (ctx) => [{
        id: 'obj_0', type: 'use_vocabulary',
        description: `Use 3 ${ctx.targetLanguage} words in conversation`,
        requiredCount: 3, currentCount: 0, completed: false,
      }],
    },
    {
      objectiveType: 'collect_vocabulary',
      title: 'Word Collector',
      description: 'Walk around and collect vocabulary words from labeled objects in the world.',
      questType: 'vocabulary',
      difficulty: 'beginner',
      xp: 20,
      buildObjectives: (ctx) => [{
        id: 'obj_0', type: 'collect_vocabulary',
        description: `Collect 3 vocabulary words by approaching labeled objects`,
        requiredCount: 3, currentCount: 0, completed: false,
      }],
    },
    {
      objectiveType: 'identify_object',
      title: 'Name That Thing',
      description: 'Click on objects in the world and type their name in the target language.',
      questType: 'visual_vocabulary',
      difficulty: 'beginner',
      xp: 20,
      buildObjectives: (ctx) => [{
        id: 'obj_0', type: 'identify_object',
        description: `Correctly identify 3 objects by their ${ctx.targetLanguage} name`,
        requiredCount: 3, currentCount: 0, completed: false,
      }],
    },
    {
      objectiveType: 'collect_item',
      title: 'Gather Supplies',
      description: 'Collect an item from the world.',
      questType: 'collection',
      difficulty: 'beginner',
      xp: 15,
      buildObjectives: () => [{
        id: 'obj_0', type: 'collect_item',
        description: 'Pick up an item from the world',
        requiredCount: 1, currentCount: 0, completed: false,
      }],
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
          {
            id: 'obj_0', type: 'collect_item',
            description: 'Pick up the delivery package',
            requiredCount: 1, currentCount: 0, completed: false,
          },
          {
            id: 'obj_1', type: 'deliver_item',
            description: npc
              ? `Deliver the package to ${charName(npc)}`
              : 'Deliver the package to the recipient',
            target: npc ? charName(npc) : undefined,
            npcId: npc?.id,
            requiredCount: 1, currentCount: 0, completed: false,
          },
        ];
      },
    },
    {
      objectiveType: 'defeat_enemies',
      title: 'Prove Your Mettle',
      description: 'Defeat an enemy in combat.',
      questType: 'combat',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: () => [{
        id: 'obj_0', type: 'defeat_enemies',
        description: 'Defeat 1 enemy',
        requiredCount: 1, currentCount: 0, enemiesDefeated: 0, enemiesRequired: 1,
        completed: false,
      }],
    },
    {
      objectiveType: 'craft_item',
      title: 'First Craft',
      description: 'Craft an item using the crafting system.',
      questType: 'crafting',
      difficulty: 'intermediate',
      xp: 25,
      buildObjectives: () => [{
        id: 'obj_0', type: 'craft_item',
        description: 'Craft any item at a crafting station',
        requiredCount: 1, currentCount: 0, completed: false,
      }],
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
        return [{
          id: 'obj_0', type: 'escort_npc',
          description: npc
            ? `Escort ${charName(npc)} to ${dest}`
            : `Escort the traveler to ${dest}`,
          target: npc ? charName(npc) : undefined,
          npcId: npc?.id,
          requiredCount: 1, currentCount: 0, completed: false,
        }];
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
        return [{
          id: 'obj_0', type: 'build_friendship',
          description: npc
            ? `Have 3 conversations with ${charName(npc)} to build a friendship`
            : 'Have 3 conversations with a local to build a friendship',
          target: npc ? charName(npc) : undefined,
          npcId: npc?.id,
          requiredCount: 3, currentCount: 0, completed: false,
          friendshipInteractions: 0,
        }];
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
          {
            id: 'obj_0', type: 'collect_item',
            description: 'Find a gift item',
            requiredCount: 1, currentCount: 0, completed: false,
          },
          {
            id: 'obj_1', type: 'give_gift',
            description: npc
              ? `Present the gift to ${charName(npc)}`
              : 'Present the gift to a local resident',
            target: npc ? charName(npc) : undefined,
            npcId: npc?.id,
            requiredCount: 1, currentCount: 0, completed: false,
            giftGiven: false,
          },
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
      buildObjectives: () => [{
        id: 'obj_0', type: 'gain_reputation',
        description: 'Gain reputation through helpful actions',
        requiredCount: 1, currentCount: 0, completed: false,
        reputationRequired: 50, reputationGained: 0,
      }],
    },
    {
      objectiveType: 'listening_comprehension',
      title: 'Story Time',
      description: 'Listen to an NPC tell a story and answer comprehension questions.',
      questType: 'listening_comprehension',
      difficulty: 'intermediate',
      xp: 35,
      buildObjectives: (ctx) => {
        const npc = ctx.npcs.length > 0 ? pick(ctx.npcs) : null;
        return [{
          id: 'obj_0', type: 'listening_comprehension',
          description: npc
            ? `Listen to ${charName(npc)}'s story and answer 2 questions correctly`
            : 'Listen to a story and answer 2 questions correctly',
          target: npc ? charName(npc) : undefined,
          npcId: npc?.id,
          requiredCount: 2, currentCount: 0, completed: false,
          questionsAnswered: 0, questionsCorrect: 0,
        }];
      },
    },
    {
      objectiveType: 'translation_challenge',
      title: 'Lost in Translation',
      description: 'Translate phrases between English and the target language.',
      questType: 'translation_challenge',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: (ctx) => [{
        id: 'obj_0', type: 'translation_challenge',
        description: `Correctly translate 3 ${ctx.targetLanguage} phrases`,
        requiredCount: 3, currentCount: 0, completed: false,
        translationsCompleted: 0, translationsCorrect: 0,
      }],
    },
    {
      objectiveType: 'navigate_language',
      title: 'Follow the Signs',
      description: 'Follow directions given in the target language to reach your destination.',
      questType: 'navigation',
      difficulty: 'advanced',
      xp: 40,
      buildObjectives: (ctx) => {
        const dest = pick(ctx.locations);
        return [{
          id: 'obj_0', type: 'navigate_language',
          description: `Follow ${ctx.targetLanguage} directions to reach ${dest}`,
          target: dest,
          requiredCount: 1, currentCount: 0, completed: false,
          waypointsReached: 0, stepsCompleted: 0,
        }];
      },
    },
    {
      objectiveType: 'follow_directions',
      title: 'Direction Master',
      description: 'An NPC gives you directions in the target language. Follow them step by step.',
      questType: 'follow_instructions',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: (ctx) => [{
        id: 'obj_0', type: 'follow_directions',
        description: `Follow 3 steps of ${ctx.targetLanguage} directions`,
        requiredCount: 3, currentCount: 0, completed: false,
        stepsCompleted: 0,
      }],
    },
    {
      objectiveType: 'pronunciation_check',
      title: 'Say It Right',
      description: 'Pronounce phrases in the target language and get accuracy feedback.',
      questType: 'pronunciation',
      difficulty: 'intermediate',
      xp: 30,
      buildObjectives: (ctx) => [{
        id: 'obj_0', type: 'pronunciation_check',
        description: `Pronounce 3 ${ctx.targetLanguage} phrases with good accuracy`,
        requiredCount: 3, currentCount: 0, completed: false,
      }],
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
 * Generate one seed quest per canonical objective type.
 * Returns InsertQuest objects ready to be saved to the database.
 */
export function generateSeedQuests(options: SeedQuestOptions): InsertQuest[] {
  const { world, characters, settlements, onlyTypes, assignedTo = 'Player' } = options;

  const npcs = getNPCs(characters);
  const locations = getLocationNames(settlements);
  const targetLanguage = world.targetLanguage || 'English';

  const ctx: SeedQuestContext = { world, npcs, locations, targetLanguage };

  const seedDefs = buildSeedQuests();
  const filtered = onlyTypes
    ? seedDefs.filter(d => onlyTypes.includes(d.objectiveType))
    : seedDefs;

  const quests: InsertQuest[] = [];

  for (const def of filtered) {
    const objectives = def.buildObjectives(ctx);

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
      status: 'active',
      objectives,
      experienceReward: def.xp,
      rewards: { xp: def.xp, fluency: Math.round(def.xp / 5) },
      tags: ['seed', `objective-type:${def.objectiveType}`],
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

  return quests;
}

/**
 * Get the list of all canonical objective types that have seed quests.
 */
export function getSeedObjectiveTypes(): string[] {
  return ACHIEVABLE_OBJECTIVE_TYPES.map(t => t.type);
}
