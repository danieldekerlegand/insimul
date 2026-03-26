/**
 * Side Quest Generator
 *
 * Procedurally generates side quests based on NPC occupation and personality.
 * Each occupation maps to thematic quest templates that exercise different game
 * mechanics: cooking, fishing, reading, exploration, delivery, herbalism,
 * mining+crafting, photography, etc.
 *
 * Features:
 *   - 2-3 quests per quest-giving NPC, based on their occupation
 *   - 2-4 objectives per quest using declarative action mappings
 *   - All text in French with English translations
 *   - Difficulty scales with player level
 *   - References real in-game locations, items, and NPCs
 *   - Quest rotation: completed quests regenerate after 1 game day
 *   - Clue discovery integration for relevant locations/NPCs
 */

import type { Character, Settlement, World, InsertQuest } from '../../shared/schema.js';
import { convertQuestToProlog } from '../../shared/prolog/quest-converter.js';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SideQuestOptions {
  world: World;
  characters: Character[];
  settlements: Settlement[];
  /** Player name (default: 'Player') */
  assignedTo?: string;
  /** Player level for difficulty scaling (default: 1) */
  playerLevel?: number;
  /** Max quests per NPC (default: 3) */
  questsPerNpc?: number;
  /** Max total quests to return (default: all) */
  maxQuests?: number;
  /** IDs of NPCs relevant to the main mystery (for clue integration) */
  mysteryRelevantNpcIds?: string[];
  /** Names of locations relevant to the main mystery */
  mysteryRelevantLocations?: string[];
}

interface SideQuestContext {
  world: World;
  targetLanguage: string;
  assignedTo: string;
  /** The NPC who gives this quest */
  giver: Character;
  /** All active NPCs (for delivery targets, etc.) */
  npcs: Character[];
  /** Available location names */
  locations: string[];
  /** Player level */
  playerLevel: number;
  /** Mystery-relevant NPC IDs */
  mysteryRelevantNpcIds: Set<string>;
  /** Mystery-relevant location names */
  mysteryRelevantLocations: Set<string>;
}

interface SideQuestTemplate {
  id: string;
  /** Occupations this template applies to */
  occupations: string[];
  /** Quest mechanic exercised */
  mechanic: string;
  title: (ctx: SideQuestContext) => { fr: string; en: string };
  description: (ctx: SideQuestContext) => { fr: string; en: string };
  difficulty: (playerLevel: number) => 'beginner' | 'intermediate' | 'advanced';
  questType: string;
  buildObjectives: (ctx: SideQuestContext) => QuestObjective[];
  xp: (playerLevel: number) => number;
  itemRewards?: (ctx: SideQuestContext) => Array<{ itemId: string; quantity: number; name: string }>;
  tags: string[];
}

interface QuestObjective {
  id: string;
  type: string;
  description: string;
  requiredCount: number;
  currentCount: number;
  completed: boolean;
  [key: string]: any;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

function charName(c: Character): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

function obj(id: string, type: string, description: string, extra: Record<string, any> = {}): QuestObjective {
  return {
    id, type, description,
    requiredCount: 1, currentCount: 0, completed: false,
    ...extra,
  };
}

function getActiveNPCs(characters: Character[]): Character[] {
  return characters.filter(c => c.status === 'active');
}

function getLocationNames(settlements: Settlement[]): string[] {
  const names = settlements.map(s => s.name).filter(Boolean) as string[];
  return names.length > 0 ? names : ['Place du Village', 'Le Marché', 'Le Port'];
}

/** Pick another NPC that is not the giver */
function pickOtherNpc(ctx: SideQuestContext): Character | null {
  const others = ctx.npcs.filter(n => n.id !== ctx.giver.id);
  return others.length > 0 ? pick(others) : null;
}

/** Scale XP by player level */
function scaleXp(base: number, playerLevel: number): number {
  return Math.round(base * (1 + (playerLevel - 1) * 0.15));
}

/** Determine difficulty from player level */
function difficultyFromLevel(playerLevel: number): 'beginner' | 'intermediate' | 'advanced' {
  if (playerLevel <= 3) return 'beginner';
  if (playerLevel <= 7) return 'intermediate';
  return 'advanced';
}

/** Check if a quest involves a mystery-relevant entity */
function touchesMystery(ctx: SideQuestContext, objectives: QuestObjective[]): boolean {
  for (const o of objectives) {
    if (o.npcId && ctx.mysteryRelevantNpcIds.has(o.npcId)) return true;
    if (o.locationName && ctx.mysteryRelevantLocations.has(o.locationName)) return true;
  }
  return ctx.mysteryRelevantNpcIds.has(ctx.giver.id);
}

// ── Occupation → Quest-giving eligibility ────────────────────────────────────

/** Occupations that can give side quests */
const QUEST_GIVING_OCCUPATIONS = new Set([
  'Baker', 'Cook', 'Farmer', 'Farmhand', 'Grocer', 'Butcher', 'Brewer', 'Distiller', 'Innkeeper',
  'Blacksmith', 'Carpenter', 'Woodworker', 'Stonecutter', 'Joiner', 'Plasterer', 'Plumber',
  'Doctor', 'Nurse', 'Pharmacist', 'Druggist', 'Dentist',
  'Teacher', 'Principal', 'Professor',
  'PoliceOfficer', 'PoliceChief', 'Firefighter', 'FireChief',
  'Bartender', 'Waiter',
  'Tailor', 'Seamstress', 'Dressmaker', 'Clothier', 'Shoemaker',
  'Painter', 'TattooArtist', 'Jeweler',
  'Miner', 'Puddler',
  'Barber',
  'Owner', 'Manager',
  'Architect', 'Engineer',
  'Mayor',
]);

/** Check if an NPC can give side quests */
export function canGiveSideQuests(npc: Character): boolean {
  if (!npc.occupation) return false;
  return QUEST_GIVING_OCCUPATIONS.has(npc.occupation);
}

// ── French vocabulary by domain ──────────────────────────────────────────────

const FRENCH_ITEMS = {
  bread: { fr: 'du pain', en: 'bread' },
  baguette: { fr: 'une baguette', en: 'a baguette' },
  croissant: { fr: 'un croissant', en: 'a croissant' },
  brioche: { fr: 'une brioche', en: 'a brioche' },
  flour: { fr: 'de la farine', en: 'flour' },
  butter: { fr: 'du beurre', en: 'butter' },
  sugar: { fr: 'du sucre', en: 'sugar' },
  eggs: { fr: 'des œufs', en: 'eggs' },
  fish: { fr: 'du poisson', en: 'fish' },
  herbs: { fr: 'des herbes', en: 'herbs' },
  basil: { fr: 'du basilic', en: 'basil' },
  rosemary: { fr: 'du romarin', en: 'rosemary' },
  thyme: { fr: 'du thym', en: 'thyme' },
  lavender: { fr: 'de la lavande', en: 'lavender' },
  mint: { fr: 'de la menthe', en: 'mint' },
  ore: { fr: 'du minerai', en: 'ore' },
  iron: { fr: 'du fer', en: 'iron' },
  wood: { fr: 'du bois', en: 'wood' },
  stone: { fr: 'de la pierre', en: 'stone' },
  leather: { fr: 'du cuir', en: 'leather' },
  cloth: { fr: 'du tissu', en: 'cloth' },
  medicine: { fr: 'des médicaments', en: 'medicine' },
  book: { fr: 'un livre', en: 'a book' },
  letter: { fr: 'une lettre', en: 'a letter' },
  photograph: { fr: 'une photographie', en: 'a photograph' },
  hammer: { fr: 'un marteau', en: 'a hammer' },
  tool: { fr: 'un outil', en: 'a tool' },
  sword: { fr: 'une épée', en: 'a sword' },
  ring: { fr: 'une bague', en: 'a ring' },
  necklace: { fr: 'un collier', en: 'a necklace' },
  hat: { fr: 'un chapeau', en: 'a hat' },
  shoes: { fr: 'des chaussures', en: 'shoes' },
  dress: { fr: 'une robe', en: 'a dress' },
  soup: { fr: 'de la soupe', en: 'soup' },
  cheese: { fr: 'du fromage', en: 'cheese' },
  wine: { fr: 'du vin', en: 'wine' },
  beer: { fr: 'de la bière', en: 'beer' },
  milk: { fr: 'du lait', en: 'milk' },
};

type FrenchItemKey = keyof typeof FRENCH_ITEMS;

function pickFrenchItem(keys: FrenchItemKey[]): { key: FrenchItemKey; fr: string; en: string } {
  const key = pick(keys);
  return { key, ...FRENCH_ITEMS[key] };
}

// ── Template library ─────────────────────────────────────────────────────────

function buildSideQuestTemplates(): SideQuestTemplate[] {
  return [
    // ═══════════════════════════════════════════════════════════════════════
    // BAKER / COOK — Cooking quests
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'baker_special_bread',
      occupations: ['Baker', 'Cook', 'Innkeeper'],
      mechanic: 'cooking',
      title: (ctx) => ({
        fr: `La Recette Spéciale de ${charName(ctx.giver)}`,
        en: `${charName(ctx.giver)}'s Special Recipe`,
      }),
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} a besoin d'ingrédients pour préparer un pain spécial. Rassemblez les ingrédients et aidez à la cuisson.`,
        en: `${charName(ctx.giver)} needs ingredients to bake a special bread. Gather ingredients and help with baking.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'cooking',
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        const ingredient = pickFrenchItem(['flour', 'butter', 'eggs', 'sugar']);
        return [
          obj('obj_0', 'collect_item', `Trouvez ${ingredient.fr} (${ingredient.en})`, {
            target: ingredient.key, itemName: ingredient.key,
          }),
          obj('obj_1', 'visit_location', `Allez à ${loc} (Go to ${loc})`, {
            target: loc, locationName: loc,
          }),
          obj('obj_2', 'craft_item', `Préparez le pain spécial (Bake the special bread)`, {
            itemName: 'bread', requiredCount: 1, craftedCount: 0,
          }),
          obj('obj_3', 'talk_to_npc', `Apportez le pain à ${charName(ctx.giver)} (Bring the bread to ${charName(ctx.giver)})`, {
            target: charName(ctx.giver), npcId: ctx.giver.id,
          }),
        ];
      },
      xp: (lvl) => scaleXp(30, lvl),
      itemRewards: () => [{ itemId: 'bread', quantity: 3, name: 'pain spécial' }],
      tags: ['side-quest', 'cooking', 'baking'],
    },
    {
      id: 'baker_ingredients_hunt',
      occupations: ['Baker', 'Cook', 'Grocer'],
      mechanic: 'cooking',
      title: (ctx) => ({
        fr: `Courses pour ${charName(ctx.giver)}`,
        en: `Shopping for ${charName(ctx.giver)}`,
      }),
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} manque d'ingrédients. Trouvez-les dans le village.`,
        en: `${charName(ctx.giver)} is running low on ingredients. Find them around the village.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'collection',
      buildObjectives: (ctx) => {
        const items = pickN<FrenchItemKey>(['flour', 'butter', 'eggs', 'sugar', 'milk', 'cheese'], 3);
        return [
          ...items.map((key, i) => {
            const item = FRENCH_ITEMS[key];
            return obj(`obj_${i}`, 'collect_item', `Trouvez ${item.fr} (${item.en})`, {
              target: key, itemName: key,
            });
          }),
          obj(`obj_${items.length}`, 'talk_to_npc', `Rapportez tout à ${charName(ctx.giver)} (Return everything to ${charName(ctx.giver)})`, {
            target: charName(ctx.giver), npcId: ctx.giver.id,
          }),
        ];
      },
      xp: (lvl) => scaleXp(25, lvl),
      tags: ['side-quest', 'cooking', 'collection'],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FARMER / FARMHAND — Herbalism quests
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'farmer_harvest_herbs',
      occupations: ['Farmer', 'Farmhand', 'Druggist', 'Pharmacist'],
      mechanic: 'herbalism',
      title: (ctx) => ({
        fr: `Herbes Médicinales pour ${charName(ctx.giver)}`,
        en: `Medicinal Herbs for ${charName(ctx.giver)}`,
      }),
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} a besoin d'herbes médicinales pour préparer des remèdes. Explorez la campagne et récoltez-les.`,
        en: `${charName(ctx.giver)} needs medicinal herbs to prepare remedies. Explore the countryside and harvest them.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'herbalism',
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        const herbs = pickN<FrenchItemKey>(['basil', 'rosemary', 'thyme', 'lavender', 'mint'], 2);
        return [
          obj('obj_0', 'visit_location', `Explorez ${loc} (Explore ${loc})`, {
            target: loc, locationName: loc,
          }),
          ...herbs.map((key, i) => {
            const herb = FRENCH_ITEMS[key];
            return obj(`obj_${i + 1}`, 'collect_item', `Récoltez ${herb.fr} (Harvest ${herb.en})`, {
              target: key, itemName: key,
            });
          }),
          obj(`obj_${herbs.length + 1}`, 'talk_to_npc', `Rapportez les herbes à ${charName(ctx.giver)} (Return the herbs to ${charName(ctx.giver)})`, {
            target: charName(ctx.giver), npcId: ctx.giver.id,
          }),
        ];
      },
      xp: (lvl) => scaleXp(25, lvl),
      itemRewards: () => [{ itemId: 'medicine', quantity: 2, name: 'remède' }],
      tags: ['side-quest', 'herbalism', 'nature'],
    },
    {
      id: 'farmer_crop_delivery',
      occupations: ['Farmer', 'Farmhand', 'Grocer'],
      mechanic: 'delivery',
      title: (ctx) => ({
        fr: `Livraison de Récolte`,
        en: `Crop Delivery`,
      }),
      description: (ctx) => {
        const recipient = pickOtherNpc(ctx);
        const recipientName = recipient ? charName(recipient) : 'le marché';
        return {
          fr: `${charName(ctx.giver)} a une récolte prête à livrer à ${recipientName}.`,
          en: `${charName(ctx.giver)} has a harvest ready to deliver to ${recipientName}.`,
        };
      },
      difficulty: difficultyFromLevel,
      questType: 'delivery',
      buildObjectives: (ctx) => {
        const recipient = pickOtherNpc(ctx);
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'collect_item', `Prenez la récolte (Pick up the harvest)`, {
            target: 'vegetables', itemName: 'vegetables',
          }),
          obj('obj_1', 'visit_location', `Allez à ${loc} (Go to ${loc})`, {
            target: loc, locationName: loc,
          }),
          ...(recipient ? [
            obj('obj_2', 'talk_to_npc', `Livrez à ${charName(recipient)} (Deliver to ${charName(recipient)})`, {
              target: charName(recipient), npcId: recipient.id,
            }),
          ] : []),
        ];
      },
      xp: (lvl) => scaleXp(20, lvl),
      tags: ['side-quest', 'delivery', 'farming'],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BLACKSMITH / CARPENTER — Mining + Crafting quests
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'blacksmith_forge_tool',
      occupations: ['Blacksmith', 'Carpenter', 'Woodworker', 'Stonecutter', 'Joiner'],
      mechanic: 'mining+crafting',
      title: (ctx) => ({
        fr: `Forge et Création`,
        en: `Forge and Create`,
      }),
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} a besoin de matériaux pour forger un nouvel outil. Trouvez du minerai et aidez à le forger.`,
        en: `${charName(ctx.giver)} needs materials to forge a new tool. Find ore and help forge it.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'crafting',
      buildObjectives: (ctx) => {
        const material = pickFrenchItem(['ore', 'iron', 'wood', 'stone']);
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'visit_location', `Allez à ${loc} pour chercher des matériaux (Go to ${loc} for materials)`, {
            target: loc, locationName: loc,
          }),
          obj('obj_1', 'collect_item', `Collectez ${material.fr} (Collect ${material.en})`, {
            target: material.key, itemName: material.key, requiredCount: 2, itemCount: 2,
          }),
          obj('obj_2', 'craft_item', `Forgez un outil (Forge a tool)`, {
            itemName: 'tool', requiredCount: 1, craftedCount: 0,
          }),
          obj('obj_3', 'talk_to_npc', `Montrez l'outil à ${charName(ctx.giver)} (Show the tool to ${charName(ctx.giver)})`, {
            target: charName(ctx.giver), npcId: ctx.giver.id,
          }),
        ];
      },
      xp: (lvl) => scaleXp(35, lvl),
      itemRewards: () => [{ itemId: 'tool', quantity: 1, name: 'outil forgé' }],
      tags: ['side-quest', 'crafting', 'mining'],
    },
    {
      id: 'blacksmith_repair_delivery',
      occupations: ['Blacksmith', 'Carpenter', 'Plumber', 'Engineer'],
      mechanic: 'delivery',
      title: (ctx) => ({
        fr: `Livraison de Réparation`,
        en: `Repair Delivery`,
      }),
      description: (ctx) => {
        const recipient = pickOtherNpc(ctx);
        const recipientName = recipient ? charName(recipient) : 'un voisin';
        return {
          fr: `${charName(ctx.giver)} a réparé un outil. Livrez-le à ${recipientName}.`,
          en: `${charName(ctx.giver)} has repaired a tool. Deliver it to ${recipientName}.`,
        };
      },
      difficulty: difficultyFromLevel,
      questType: 'delivery',
      buildObjectives: (ctx) => {
        const recipient = pickOtherNpc(ctx);
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'collect_item', `Prenez l'outil réparé (Pick up the repaired tool)`, {
            target: 'hammer', itemName: 'hammer',
          }),
          obj('obj_1', 'visit_location', `Allez à ${loc} (Go to ${loc})`, {
            target: loc, locationName: loc,
          }),
          ...(recipient ? [
            obj('obj_2', 'talk_to_npc', `Livrez à ${charName(recipient)} (Deliver to ${charName(recipient)})`, {
              target: charName(recipient), npcId: recipient.id,
            }),
          ] : []),
        ];
      },
      xp: (lvl) => scaleXp(20, lvl),
      tags: ['side-quest', 'delivery', 'crafting'],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TEACHER / PROFESSOR — Reading quests
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'teacher_read_discuss',
      occupations: ['Teacher', 'Principal', 'Professor'],
      mechanic: 'reading',
      title: (ctx) => ({
        fr: `Club de Lecture de ${charName(ctx.giver)}`,
        en: `${charName(ctx.giver)}'s Book Club`,
      }),
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} recommande un livre et aimerait en discuter avec vous.`,
        en: `${charName(ctx.giver)} recommends a book and would like to discuss it with you.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'reading',
      buildObjectives: (ctx) => [
        obj('obj_0', 'collect_item', `Trouvez un livre (Find a book)`, {
          target: 'book', itemName: 'book',
        }),
        obj('obj_1', 'complete_reading', `Lisez le livre (Read the book)`, {
          textId: 'side_quest_book',
        }),
        obj('obj_2', 'answer_questions', `Répondez aux questions (Answer the questions)`, {
          textId: 'side_quest_book',
        }),
        obj('obj_3', 'talk_to_npc', `Discutez avec ${charName(ctx.giver)} (Discuss with ${charName(ctx.giver)})`, {
          target: charName(ctx.giver), npcId: ctx.giver.id,
        }),
      ],
      xp: (lvl) => scaleXp(30, lvl),
      tags: ['side-quest', 'reading', 'education'],
    },
    {
      id: 'teacher_letter_delivery',
      occupations: ['Teacher', 'Principal', 'Professor', 'Mayor'],
      mechanic: 'delivery',
      title: (ctx) => ({
        fr: `Message Important`,
        en: `Important Message`,
      }),
      description: (ctx) => {
        const recipient = pickOtherNpc(ctx);
        const recipientName = recipient ? charName(recipient) : 'un collègue';
        return {
          fr: `${charName(ctx.giver)} a une lettre importante pour ${recipientName}. Lisez l'adresse et livrez-la.`,
          en: `${charName(ctx.giver)} has an important letter for ${recipientName}. Read the address and deliver it.`,
        };
      },
      difficulty: difficultyFromLevel,
      questType: 'delivery',
      buildObjectives: (ctx) => {
        const recipient = pickOtherNpc(ctx);
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'collect_item', `Prenez la lettre (Pick up the letter)`, {
            target: 'letter', itemName: 'letter',
          }),
          obj('obj_1', 'complete_reading', `Lisez l'adresse (Read the address)`, {
            textId: 'side_quest_letter',
          }),
          obj('obj_2', 'visit_location', `Allez à ${loc} (Go to ${loc})`, {
            target: loc, locationName: loc,
          }),
          ...(recipient ? [
            obj('obj_3', 'talk_to_npc', `Remettez la lettre à ${charName(recipient)} (Hand the letter to ${charName(recipient)})`, {
              target: charName(recipient), npcId: recipient.id,
            }),
          ] : []),
        ];
      },
      xp: (lvl) => scaleXp(20, lvl),
      tags: ['side-quest', 'delivery', 'reading'],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // POLICE / FIRE — Exploration / Investigation quests
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'guard_investigate_location',
      occupations: ['PoliceOfficer', 'PoliceChief', 'Firefighter', 'FireChief'],
      mechanic: 'exploration',
      title: (ctx) => ({
        fr: `Enquête à ${pick(ctx.locations)}`,
        en: `Investigation at ${pick(ctx.locations)}`,
      }),
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} a reçu un rapport suspect. Enquêtez sur le lieu et faites votre rapport.`,
        en: `${charName(ctx.giver)} received a suspicious report. Investigate the location and report back.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'exploration',
      buildObjectives: (ctx) => {
        const locs = pickN(ctx.locations, 2);
        return [
          obj('obj_0', 'visit_location', `Enquêtez à ${locs[0]} (Investigate ${locs[0]})`, {
            target: locs[0], locationName: locs[0],
          }),
          ...(locs.length > 1 ? [
            obj('obj_1', 'discover_location', `Explorez les environs de ${locs[1]} (Explore around ${locs[1]})`, {
              target: locs[1], locationName: locs[1],
            }),
          ] : []),
          obj(`obj_${locs.length}`, 'talk_to_npc', `Faites votre rapport à ${charName(ctx.giver)} (Report to ${charName(ctx.giver)})`, {
            target: charName(ctx.giver), npcId: ctx.giver.id,
          }),
        ];
      },
      xp: (lvl) => scaleXp(30, lvl),
      tags: ['side-quest', 'exploration', 'investigation'],
    },
    {
      id: 'guard_patrol',
      occupations: ['PoliceOfficer', 'PoliceChief', 'Firefighter', 'FireChief'],
      mechanic: 'exploration',
      title: () => ({
        fr: `Patrouille du Village`,
        en: `Village Patrol`,
      }),
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} demande de patrouiller plusieurs endroits et de signaler tout problème.`,
        en: `${charName(ctx.giver)} asks you to patrol several locations and report any issues.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'exploration',
      buildObjectives: (ctx) => {
        const locs = pickN(ctx.locations, Math.min(3, ctx.locations.length));
        return [
          ...locs.map((loc, i) =>
            obj(`obj_${i}`, 'visit_location', `Patrouille à ${loc} (Patrol ${loc})`, {
              target: loc, locationName: loc,
            }),
          ),
          obj(`obj_${locs.length}`, 'talk_to_npc', `Rapport à ${charName(ctx.giver)} (Report to ${charName(ctx.giver)})`, {
            target: charName(ctx.giver), npcId: ctx.giver.id,
          }),
        ];
      },
      xp: (lvl) => scaleXp(25, lvl),
      tags: ['side-quest', 'exploration', 'patrol'],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MERCHANT / OWNER / MANAGER — Delivery quests
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'merchant_deliver_goods',
      occupations: ['Owner', 'Manager', 'Grocer', 'Bartender', 'Innkeeper'],
      mechanic: 'delivery',
      title: (ctx) => {
        const recipient = pickOtherNpc(ctx);
        return {
          fr: `Livraison pour ${recipient ? charName(recipient) : 'un client'}`,
          en: `Delivery for ${recipient ? charName(recipient) : 'a customer'}`,
        };
      },
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} a des marchandises à livrer. Prenez le colis et apportez-le à destination.`,
        en: `${charName(ctx.giver)} has goods to deliver. Take the package and bring it to its destination.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'delivery',
      buildObjectives: (ctx) => {
        const recipient = pickOtherNpc(ctx);
        const loc = pick(ctx.locations);
        const item = pickFrenchItem(['cheese', 'wine', 'bread', 'cloth', 'leather']);
        return [
          obj('obj_0', 'collect_item', `Prenez ${item.fr} (Pick up ${item.en})`, {
            target: item.key, itemName: item.key,
          }),
          obj('obj_1', 'visit_location', `Allez à ${loc} (Go to ${loc})`, {
            target: loc, locationName: loc,
          }),
          ...(recipient ? [
            obj('obj_2', 'talk_to_npc', `Livrez à ${charName(recipient)} (Deliver to ${charName(recipient)})`, {
              target: charName(recipient), npcId: recipient.id,
            }),
          ] : []),
        ];
      },
      xp: (lvl) => scaleXp(20, lvl),
      tags: ['side-quest', 'delivery', 'merchant'],
    },
    {
      id: 'merchant_restock',
      occupations: ['Owner', 'Manager', 'Grocer', 'Butcher', 'Brewer'],
      mechanic: 'delivery',
      title: (ctx) => ({
        fr: `Réapprovisionnement`,
        en: `Restocking`,
      }),
      description: (ctx) => ({
        fr: `Le stock de ${charName(ctx.giver)} est bas. Collectez des fournitures auprès des fournisseurs.`,
        en: `${charName(ctx.giver)}'s stock is low. Collect supplies from suppliers.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'collection',
      buildObjectives: (ctx) => {
        const suppliers = pickN(ctx.npcs.filter(n => n.id !== ctx.giver.id), 2);
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'visit_location', `Allez au marché de ${loc} (Go to ${loc} market)`, {
            target: loc, locationName: loc,
          }),
          ...suppliers.map((s, i) =>
            obj(`obj_${i + 1}`, 'talk_to_npc', `Achetez des fournitures de ${charName(s)} (Buy supplies from ${charName(s)})`, {
              target: charName(s), npcId: s.id,
            }),
          ),
          obj(`obj_${suppliers.length + 1}`, 'talk_to_npc', `Rapportez à ${charName(ctx.giver)} (Report to ${charName(ctx.giver)})`, {
            target: charName(ctx.giver), npcId: ctx.giver.id,
          }),
        ];
      },
      xp: (lvl) => scaleXp(25, lvl),
      tags: ['side-quest', 'delivery', 'collection'],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PAINTER / TATTOO ARTIST / JEWELER — Photography quests
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'artist_photograph_scenes',
      occupations: ['Painter', 'TattooArtist', 'Jeweler', 'Architect'],
      mechanic: 'photography',
      title: (ctx) => ({
        fr: `L'Œil de l'Artiste`,
        en: `The Artist's Eye`,
      }),
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} cherche de l'inspiration. Photographiez de beaux endroits du village.`,
        en: `${charName(ctx.giver)} is looking for inspiration. Photograph beautiful spots in the village.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'photography',
      buildObjectives: (ctx) => {
        const locs = pickN(ctx.locations, 2);
        return [
          ...locs.map((loc, i) =>
            obj(`obj_${i}`, 'photograph_subject', `Photographiez ${loc} (Photograph ${loc})`, {
              targetSubject: loc, targetCategory: 'landscape',
              requiredCount: 1, currentCount: 0,
            }),
          ),
          obj(`obj_${locs.length}`, 'talk_to_npc', `Montrez les photos à ${charName(ctx.giver)} (Show photos to ${charName(ctx.giver)})`, {
            target: charName(ctx.giver), npcId: ctx.giver.id,
          }),
        ];
      },
      xp: (lvl) => scaleXp(25, lvl),
      tags: ['side-quest', 'photography', 'art'],
    },
    {
      id: 'artist_portrait_quest',
      occupations: ['Painter', 'TattooArtist'],
      mechanic: 'photography',
      title: (ctx) => ({
        fr: `Portraits du Village`,
        en: `Village Portraits`,
      }),
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} veut des portraits des habitants. Photographiez des villageois.`,
        en: `${charName(ctx.giver)} wants portraits of the residents. Photograph villagers.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'photography',
      buildObjectives: (ctx) => {
        const targets = pickN(ctx.npcs.filter(n => n.id !== ctx.giver.id), 2);
        return [
          ...targets.map((npc, i) =>
            obj(`obj_${i}`, 'photograph_subject', `Photographiez ${charName(npc)} (Photograph ${charName(npc)})`, {
              targetSubject: charName(npc), targetCategory: 'portrait',
              requiredCount: 1, currentCount: 0,
            }),
          ),
          obj(`obj_${targets.length}`, 'talk_to_npc', `Montrez les portraits à ${charName(ctx.giver)} (Show portraits to ${charName(ctx.giver)})`, {
            target: charName(ctx.giver), npcId: ctx.giver.id,
          }),
        ];
      },
      xp: (lvl) => scaleXp(25, lvl),
      tags: ['side-quest', 'photography', 'portraits'],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // DOCTOR / NURSE / PHARMACIST — Herbalism + Delivery
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'doctor_medicine_delivery',
      occupations: ['Doctor', 'Nurse', 'Pharmacist', 'Druggist', 'Dentist'],
      mechanic: 'herbalism',
      title: (ctx) => ({
        fr: `Remèdes Urgents`,
        en: `Urgent Remedies`,
      }),
      description: (ctx) => {
        const patient = pickOtherNpc(ctx);
        const patientName = patient ? charName(patient) : 'un patient';
        return {
          fr: `${charName(ctx.giver)} a besoin d'herbes médicinales pour ${patientName}. Récoltez et livrez le remède.`,
          en: `${charName(ctx.giver)} needs medicinal herbs for ${patientName}. Harvest and deliver the remedy.`,
        };
      },
      difficulty: difficultyFromLevel,
      questType: 'herbalism',
      buildObjectives: (ctx) => {
        const herb = pickFrenchItem(['basil', 'rosemary', 'thyme', 'mint', 'lavender']);
        const patient = pickOtherNpc(ctx);
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'visit_location', `Cherchez des herbes à ${loc} (Search for herbs at ${loc})`, {
            target: loc, locationName: loc,
          }),
          obj('obj_1', 'collect_item', `Récoltez ${herb.fr} (Harvest ${herb.en})`, {
            target: herb.key, itemName: herb.key,
          }),
          obj('obj_2', 'craft_item', `Préparez le remède (Prepare the remedy)`, {
            itemName: 'medicine', requiredCount: 1, craftedCount: 0,
          }),
          ...(patient ? [
            obj('obj_3', 'talk_to_npc', `Livrez le remède à ${charName(patient)} (Deliver the remedy to ${charName(patient)})`, {
              target: charName(patient), npcId: patient.id,
            }),
          ] : [
            obj('obj_3', 'talk_to_npc', `Rapportez à ${charName(ctx.giver)} (Report to ${charName(ctx.giver)})`, {
              target: charName(ctx.giver), npcId: ctx.giver.id,
            }),
          ]),
        ];
      },
      xp: (lvl) => scaleXp(30, lvl),
      itemRewards: () => [{ itemId: 'medicine', quantity: 1, name: 'remède' }],
      tags: ['side-quest', 'herbalism', 'medicine'],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TAILOR / SEAMSTRESS / DRESSMAKER — Crafting + Collection
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'tailor_craft_garment',
      occupations: ['Tailor', 'Seamstress', 'Dressmaker', 'Clothier', 'Shoemaker'],
      mechanic: 'crafting',
      title: (ctx) => ({
        fr: `Commande Spéciale`,
        en: `Special Order`,
      }),
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} a reçu une commande spéciale. Rassemblez les matériaux et aidez à confectionner le vêtement.`,
        en: `${charName(ctx.giver)} received a special order. Gather materials and help craft the garment.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'crafting',
      buildObjectives: (ctx) => {
        const materials = pickN<FrenchItemKey>(['cloth', 'leather', 'wood'], 2);
        return [
          ...materials.map((key, i) => {
            const mat = FRENCH_ITEMS[key];
            return obj(`obj_${i}`, 'collect_item', `Trouvez ${mat.fr} (Find ${mat.en})`, {
              target: key, itemName: key,
            });
          }),
          obj(`obj_${materials.length}`, 'craft_item', `Confectionnez le vêtement (Craft the garment)`, {
            itemName: 'dress', requiredCount: 1, craftedCount: 0,
          }),
          obj(`obj_${materials.length + 1}`, 'talk_to_npc', `Montrez à ${charName(ctx.giver)} (Show to ${charName(ctx.giver)})`, {
            target: charName(ctx.giver), npcId: ctx.giver.id,
          }),
        ];
      },
      xp: (lvl) => scaleXp(30, lvl),
      tags: ['side-quest', 'crafting', 'tailoring'],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BARBER — Social + Exploration (gather gossip)
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'barber_gossip',
      occupations: ['Barber', 'Bartender', 'Waiter', 'Innkeeper'],
      mechanic: 'exploration',
      title: (ctx) => ({
        fr: `Les Nouvelles du Village`,
        en: `Village News`,
      }),
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} veut les dernières nouvelles. Parlez aux villageois et rapportez ce que vous apprenez.`,
        en: `${charName(ctx.giver)} wants the latest news. Talk to villagers and report what you learn.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'exploration',
      buildObjectives: (ctx) => {
        const targets = pickN(ctx.npcs.filter(n => n.id !== ctx.giver.id), 3);
        return [
          ...targets.map((npc, i) =>
            obj(`obj_${i}`, 'talk_to_npc', `Parlez à ${charName(npc)} (Talk to ${charName(npc)})`, {
              target: charName(npc), npcId: npc.id,
            }),
          ),
          obj(`obj_${targets.length}`, 'talk_to_npc', `Rapportez les nouvelles à ${charName(ctx.giver)} (Report news to ${charName(ctx.giver)})`, {
            target: charName(ctx.giver), npcId: ctx.giver.id,
          }),
        ];
      },
      xp: (lvl) => scaleXp(20, lvl),
      tags: ['side-quest', 'exploration', 'social'],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MINER — Mining + Collection
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'miner_ore_collection',
      occupations: ['Miner', 'Puddler', 'Blacksmith'],
      mechanic: 'mining',
      title: () => ({
        fr: `Expédition Minière`,
        en: `Mining Expedition`,
      }),
      description: (ctx) => ({
        fr: `${charName(ctx.giver)} a besoin de minerai. Explorez et collectez des ressources.`,
        en: `${charName(ctx.giver)} needs ore. Explore and collect resources.`,
      }),
      difficulty: difficultyFromLevel,
      questType: 'collection',
      buildObjectives: (ctx) => {
        const loc = pick(ctx.locations);
        return [
          obj('obj_0', 'visit_location', `Explorez ${loc} (Explore ${loc})`, {
            target: loc, locationName: loc,
          }),
          obj('obj_1', 'collect_item', `Collectez du minerai (Collect ore)`, {
            target: 'ore', itemName: 'ore', requiredCount: 3, itemCount: 3,
          }),
          obj('obj_2', 'physical_action', `Minez dans la roche (Mine the rock)`, {
            actionType: 'mine', requiredCount: 2, actionsRequired: 2, actionsCompleted: 0,
          }),
          obj('obj_3', 'talk_to_npc', `Rapportez à ${charName(ctx.giver)} (Report to ${charName(ctx.giver)})`, {
            target: charName(ctx.giver), npcId: ctx.giver.id,
          }),
        ];
      },
      xp: (lvl) => scaleXp(30, lvl),
      tags: ['side-quest', 'mining', 'collection'],
    },
  ];
}

// ── Template selection ───────────────────────────────────────────────────────

/** Get templates matching an NPC's occupation */
function getTemplatesForOccupation(occupation: string): SideQuestTemplate[] {
  const allTemplates = buildSideQuestTemplates();
  return allTemplates.filter(t => t.occupations.includes(occupation));
}

// ── Main generator ───────────────────────────────────────────────────────────

/**
 * Generate side quests for all quest-giving NPCs in the world.
 * Returns ready-to-save InsertQuest objects.
 */
export function generateSideQuests(options: SideQuestOptions): InsertQuest[] {
  const {
    world,
    characters,
    settlements,
    assignedTo = 'Player',
    playerLevel = 1,
    questsPerNpc = 3,
    maxQuests,
    mysteryRelevantNpcIds = [],
    mysteryRelevantLocations = [],
  } = options;

  const npcs = getActiveNPCs(characters);
  const locations = getLocationNames(settlements);
  const targetLanguage = world.targetLanguage || 'French';
  const mysteryNpcSet = new Set(mysteryRelevantNpcIds);
  const mysteryLocSet = new Set(mysteryRelevantLocations);

  const questGivers = npcs.filter(npc => canGiveSideQuests(npc));
  const quests: InsertQuest[] = [];

  for (const giver of questGivers) {
    const templates = getTemplatesForOccupation(giver.occupation!);
    if (templates.length === 0) continue;

    const selected = pickN(templates, Math.min(questsPerNpc, templates.length));

    const ctx: SideQuestContext = {
      world,
      targetLanguage,
      assignedTo,
      giver,
      npcs,
      locations,
      playerLevel,
      mysteryRelevantNpcIds: mysteryNpcSet,
      mysteryRelevantLocations: mysteryLocSet,
    };

    for (const template of selected) {
      const titleText = template.title(ctx);
      const descText = template.description(ctx);
      const objectives = template.buildObjectives(ctx);
      const difficulty = template.difficulty(playerLevel);
      const xp = template.xp(playerLevel);

      const questTags = [
        'seed', 'side-quest', `difficulty:${difficulty}`,
        `mechanic:${template.mechanic}`, `occupation:${giver.occupation}`,
        ...template.tags,
      ];

      // Mark quests that touch mystery-relevant entities
      if (touchesMystery(ctx, objectives)) {
        questTags.push('mystery-relevant');
      }

      const quest: InsertQuest = {
        worldId: world.id,
        title: `${titleText.fr} — ${titleText.en}`,
        description: `${descText.fr}\n\n${descText.en}`,
        questType: template.questType,
        difficulty,
        targetLanguage,
        assignedTo,
        assignedBy: charName(giver),
        assignedByCharacterId: giver.id,
        status: 'available',
        objectives,
        experienceReward: xp,
        rewards: { xp, fluency: Math.round(xp / 5) },
        tags: questTags,
        recurrencePattern: 'daily',
        ...(template.itemRewards ? {
          itemRewards: template.itemRewards(ctx),
        } : {}),
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
  }

  return maxQuests ? quests.slice(0, maxQuests) : quests;
}

/**
 * Generate replacement side quests for a specific NPC after quest completion.
 * Used for quest rotation — generates new quests 1 game day after completion.
 */
export function generateReplacementQuests(options: {
  world: World;
  giver: Character;
  characters: Character[];
  settlements: Settlement[];
  assignedTo?: string;
  playerLevel?: number;
  /** Template IDs of completed quests to avoid repeating immediately */
  completedTemplateIds?: string[];
  mysteryRelevantNpcIds?: string[];
  mysteryRelevantLocations?: string[];
}): InsertQuest[] {
  const {
    world,
    giver,
    characters,
    settlements,
    assignedTo = 'Player',
    playerLevel = 1,
    completedTemplateIds = [],
    mysteryRelevantNpcIds = [],
    mysteryRelevantLocations = [],
  } = options;

  if (!giver.occupation || !canGiveSideQuests(giver)) return [];

  const templates = getTemplatesForOccupation(giver.occupation);
  const completedSet = new Set(completedTemplateIds);
  const available = templates.filter(t => !completedSet.has(t.id));
  const toGenerate = available.length > 0 ? available : templates; // fall back to all if exhausted

  const selected = pickN(toGenerate, 1);

  const npcs = getActiveNPCs(characters);
  const locations = getLocationNames(settlements);

  const ctx: SideQuestContext = {
    world,
    targetLanguage: world.targetLanguage || 'French',
    assignedTo,
    giver,
    npcs,
    locations,
    playerLevel,
    mysteryRelevantNpcIds: new Set(mysteryRelevantNpcIds),
    mysteryRelevantLocations: new Set(mysteryRelevantLocations),
  };

  return selected.map(template => {
    const titleText = template.title(ctx);
    const descText = template.description(ctx);
    const objectives = template.buildObjectives(ctx);
    const difficulty = template.difficulty(playerLevel);
    const xp = template.xp(playerLevel);

    const questTags = [
      'seed', 'side-quest', 'rotated', `difficulty:${difficulty}`,
      `mechanic:${template.mechanic}`, `occupation:${giver.occupation}`,
      ...template.tags,
    ];

    if (touchesMystery(ctx, objectives)) {
      questTags.push('mystery-relevant');
    }

    const quest: InsertQuest = {
      worldId: world.id,
      title: `${titleText.fr} — ${titleText.en}`,
      description: `${descText.fr}\n\n${descText.en}`,
      questType: template.questType,
      difficulty,
      targetLanguage: ctx.targetLanguage,
      assignedTo,
      assignedBy: charName(giver),
      assignedByCharacterId: giver.id,
      status: 'available',
      objectives,
      experienceReward: xp,
      rewards: { xp, fluency: Math.round(xp / 5) },
      tags: questTags,
      recurrencePattern: 'daily',
      ...(template.itemRewards ? {
        itemRewards: template.itemRewards(ctx),
      } : {}),
    };

    try {
      const result = convertQuestToProlog(quest as any);
      if (result.prologContent) {
        (quest as any).content = result.prologContent;
      }
    } catch {
      // Non-critical
    }

    return quest;
  });
}

// ── Utility exports ──────────────────────────────────────────────────────────

/** Get all supported occupation → mechanic mappings */
export function getOccupationMechanics(): Record<string, string[]> {
  const templates = buildSideQuestTemplates();
  const map: Record<string, string[]> = {};
  for (const t of templates) {
    for (const occ of t.occupations) {
      if (!map[occ]) map[occ] = [];
      if (!map[occ].includes(t.mechanic)) map[occ].push(t.mechanic);
    }
  }
  return map;
}

/** Get total template count */
export function getSideQuestTemplateCount(): number {
  return buildSideQuestTemplates().length;
}

/** Get template IDs grouped by mechanic */
export function getSideQuestsByMechanic(): Record<string, string[]> {
  const templates = buildSideQuestTemplates();
  const result: Record<string, string[]> = {};
  for (const t of templates) {
    if (!result[t.mechanic]) result[t.mechanic] = [];
    result[t.mechanic].push(t.id);
  }
  return result;
}
