#!/usr/bin/env tsx
/**
 * Migration 038: Unify action hierarchy
 *
 * Creates a 1:1:1 mapping between DB base actions, Prolog actions, and in-game
 * Action Matrix entries. Every action gets:
 *   - A unified category (movement, combat, social, commerce, resource, items, exploration, language, survival)
 *   - A parentAction reference for hierarchy (e.g., sword_attack → attack_enemy)
 *   - Prolog content
 *   - verbPast / verbPresent for language learning
 *
 * Changes:
 *   1. Updates all existing base actions to unified categories
 *   2. Sets parentAction on child actions
 *   3. Adds ~49 missing actions (from Action Matrix + new parent actions)
 *   4. Renames open_chest → open_container
 *
 * Usage:
 *   npx tsx server/migrations/038-unify-action-hierarchy.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';

// ─── Category mapping: old category → unified category ─────────────────────

const CATEGORY_MAP: Record<string, string> = {
  // → movement
  locomotion: 'movement',
  acrobatics: 'movement',
  stealth: 'movement',
  transport: 'movement',
  // → combat
  melee: 'combat',
  ranged: 'combat',
  defense: 'combat',
  reaction: 'combat',
  magic: 'combat',
  creature: 'combat',
  combat: 'combat',
  // → social
  conversation: 'social',
  expression: 'social',
  idle: 'social',
  // → commerce
  trade: 'commerce',
  // → resource
  gathering: 'resource',
  farming: 'resource',
  crafting: 'resource',
  labor: 'resource',
  // → items
  inventory: 'items',
  sustenance: 'items',
  utility: 'items',
  // → exploration
  interaction: 'exploration',
  navigation: 'exploration',
  puzzle: 'exploration',
  // → language
  'language-learning': 'language',
  // already correct
  movement: 'movement',
  social: 'social',
  commerce: 'commerce',
  resource: 'resource',
  items: 'items',
  exploration: 'exploration',
  language: 'language',
  survival: 'survival',
};

// ─── Parent action assignments for existing DB actions ──────────────────────

const PARENT_MAP: Record<string, string> = {
  // movement children → move
  walk: 'move',
  jog: 'move',
  sprint: 'move',
  swim: 'move',
  swim_idle: 'move',
  walk_carry: 'move',
  walk_formal: 'move',
  drive: 'move',
  crouch_walk: 'move',
  crouch_idle: 'move',
  // acrobatics children → jump
  ninja_jump: 'jump',
  roll: 'jump',
  slide: 'jump',
  climb: 'jump',
  // melee/ranged children → attack_enemy
  sword_attack: 'attack_enemy',
  sword_combo: 'attack_enemy',
  sword_dash: 'attack_enemy',
  sword_idle: 'attack_enemy',
  punch: 'attack_enemy',
  punch_heavy: 'attack_enemy',
  melee_hook: 'attack_enemy',
  shield_bash: 'attack_enemy',
  shield_dash: 'attack_enemy',
  pistol_shoot: 'attack_enemy',
  pistol_aim: 'attack_enemy',
  pistol_reload: 'attack_enemy',
  throw_projectile: 'attack_enemy',
  zombie_attack: 'attack_enemy',
  // defense children → defend
  shield_block: 'defend',
  sword_block: 'defend',
  // magic children → cast_spell
  spell_channel: 'cast_spell',
  // reaction children → react
  die: 'react',
  hit_head: 'react',
  hit_reaction: 'react',
  knockback: 'react',
  // creature idle/walk → creature parent grouping via category, no specific parent
  zombie_idle: 'idle',
  zombie_walk: 'move',
  // conversation children → talk_to_npc
  talk: 'talk_to_npc',
  sit_talk: 'talk_to_npc',
  phone_call: 'talk_to_npc',
  compliment_npc: 'talk_to_npc',
  greet: 'talk_to_npc',
  insult_npc: 'talk_to_npc',
  threaten: 'talk_to_npc',
  flirt: 'talk_to_npc',
  persuade: 'talk_to_npc',
  bribe: 'talk_to_npc',
  gossip: 'talk_to_npc',
  confess: 'talk_to_npc',
  apologize: 'talk_to_npc',
  comfort: 'talk_to_npc',
  argue: 'talk_to_npc',
  joke: 'talk_to_npc',
  share_story: 'talk_to_npc',
  ask_about: 'talk_to_npc',
  // expression children → express
  call_out: 'express',
  dance: 'express',
  fold_arms: 'express',
  nod_yes: 'express',
  shake_head_no: 'express',
  // idle children → idle
  sit_down: 'idle',
  sit_idle: 'idle',
  stand_up: 'idle',
  get_up: 'idle',
  lean_railing: 'idle',
  // gathering children → gather
  chop_tree: 'gather',
  mine_rock: 'gather',
  fish: 'gather',
  gather_herb: 'gather',
  // farming children → farm
  farm_plant: 'farm',
  farm_water: 'farm',
  farm_harvest: 'farm',
  // crafting children → craft_item
  cook: 'craft_item',
  fix_repair: 'craft_item',
  // labor children → work
  paint: 'work',
  sweep: 'work',
  push_object: 'work',
  // items children → use_item
  consume: 'use_item',
  equip_item: 'use_item',
  hold_lantern: 'use_item',
  hold_torch: 'use_item',
  // pick_up → collect_item
  pick_up: 'collect_item',
  // commerce children → trade
  buy_item: 'trade',
  sell_item: 'trade',
  // survival children → rest
  sleep: 'rest',
  sit: 'rest',
};

// ─── New actions to create ──────────────────────────────────────────────────

interface NewActionDef {
  name: string;
  description: string;
  actionType: string;
  category: string;
  parentAction: string | null;
  duration: number;
  difficulty: number;
  energyCost: number;
  targetType: string;
  requiresTarget: boolean;
  range: number;
  cooldown: number;
  verbPast: string;
  verbPresent: string;
  tags: string[];
}

const NEW_ACTIONS: NewActionDef[] = [
  // ─── New parent actions ───────────────────────────────────────────────────
  {
    name: 'move',
    description: 'Move to a new position',
    actionType: 'movement', category: 'movement', parentAction: null,
    duration: 1, difficulty: 0, energyCost: 1,
    targetType: 'location', requiresTarget: true, range: 0, cooldown: 0,
    verbPast: 'moved', verbPresent: 'moves',
    tags: ['movement', 'locomotion'],
  },
  {
    name: 'defend',
    description: 'Block or parry an incoming attack',
    actionType: 'combat', category: 'combat', parentAction: null,
    duration: 1, difficulty: 0.3, energyCost: 2,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 1,
    verbPast: 'defended', verbPresent: 'defends',
    tags: ['combat', 'defense'],
  },
  {
    name: 'react',
    description: 'Involuntary reaction to an event',
    actionType: 'combat', category: 'combat', parentAction: null,
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'reacted', verbPresent: 'reacts',
    tags: ['combat', 'reaction'],
  },
  {
    name: 'express',
    description: 'Express an emotion or gesture',
    actionType: 'social', category: 'social', parentAction: null,
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'expressed', verbPresent: 'expresses',
    tags: ['social', 'expression'],
  },
  {
    name: 'gather',
    description: 'Gather a natural resource',
    actionType: 'physical', category: 'resource', parentAction: null,
    duration: 2, difficulty: 0.2, energyCost: 2,
    targetType: 'object', requiresTarget: true, range: 3, cooldown: 0,
    verbPast: 'gathered', verbPresent: 'gathers',
    tags: ['resource', 'gathering'],
  },
  {
    name: 'farm',
    description: 'Perform a farming activity',
    actionType: 'physical', category: 'resource', parentAction: null,
    duration: 2, difficulty: 0.2, energyCost: 2,
    targetType: 'object', requiresTarget: true, range: 3, cooldown: 0,
    verbPast: 'farmed', verbPresent: 'farms',
    tags: ['resource', 'farming'],
  },
  {
    name: 'trade',
    description: 'Exchange goods with another character',
    actionType: 'economic', category: 'commerce', parentAction: null,
    duration: 1, difficulty: 0.1, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'traded', verbPresent: 'trades',
    tags: ['commerce', 'trade'],
  },
  {
    name: 'rest',
    description: 'Rest and recover energy',
    actionType: 'physical', category: 'survival', parentAction: null,
    duration: 3, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'rested', verbPresent: 'rests',
    tags: ['survival', 'rest'],
  },

  // ─── Missing matrix-only actions (not yet in DB) ──────────────────────────

  // Resource
  {
    name: 'fish',
    description: 'Cast a line and catch fish',
    actionType: 'physical', category: 'resource', parentAction: 'gather',
    duration: 3, difficulty: 0.3, energyCost: 2,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'fished', verbPresent: 'fishes',
    tags: ['resource', 'gathering', 'fishing'],
  },
  {
    name: 'mine_rock',
    description: 'Mine stone or ore from a rock deposit',
    actionType: 'physical', category: 'resource', parentAction: 'gather',
    duration: 3, difficulty: 0.3, energyCost: 3,
    targetType: 'object', requiresTarget: true, range: 3, cooldown: 0,
    verbPast: 'mined', verbPresent: 'mines',
    tags: ['resource', 'gathering', 'mining'],
  },
  {
    name: 'gather_herb',
    description: 'Pick herbs or plants from the ground',
    actionType: 'physical', category: 'resource', parentAction: 'gather',
    duration: 2, difficulty: 0.1, energyCost: 1,
    targetType: 'object', requiresTarget: false, range: 3, cooldown: 0,
    verbPast: 'gathered herbs', verbPresent: 'gathers herbs',
    tags: ['resource', 'gathering', 'herbalism'],
  },
  {
    name: 'cook',
    description: 'Prepare food by cooking ingredients',
    actionType: 'physical', category: 'resource', parentAction: 'craft_item',
    duration: 3, difficulty: 0.3, energyCost: 1,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'cooked', verbPresent: 'cooks',
    tags: ['resource', 'crafting', 'cooking'],
  },
  {
    name: 'paint',
    description: 'Apply paint to a surface',
    actionType: 'physical', category: 'resource', parentAction: 'work',
    duration: 2, difficulty: 0.2, energyCost: 2,
    targetType: 'object', requiresTarget: false, range: 3, cooldown: 0,
    verbPast: 'painted', verbPresent: 'paints',
    tags: ['resource', 'labor', 'painting'],
  },
  {
    name: 'sweep',
    description: 'Sweep the floor clean',
    actionType: 'physical', category: 'resource', parentAction: 'work',
    duration: 2, difficulty: 0.1, energyCost: 1,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'swept', verbPresent: 'sweeps',
    tags: ['resource', 'labor', 'cleaning'],
  },

  // Social
  {
    name: 'pray',
    description: 'Offer a prayer or moment of reflection',
    actionType: 'social', category: 'social', parentAction: null,
    duration: 2, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'prayed', verbPresent: 'prays',
    tags: ['social', 'spiritual'],
  },
  {
    name: 'steal',
    description: 'Take something that belongs to someone else',
    actionType: 'social', category: 'social', parentAction: null,
    duration: 1, difficulty: 0.6, energyCost: 1,
    targetType: 'other', requiresTarget: true, range: 3, cooldown: 5,
    verbPast: 'stole', verbPresent: 'steals',
    tags: ['social', 'crime'],
  },
  {
    name: 'escort_npc',
    description: 'Accompany and protect an NPC to a destination',
    actionType: 'social', category: 'social', parentAction: null,
    duration: 5, difficulty: 0.4, energyCost: 2,
    targetType: 'other', requiresTarget: true, range: 10, cooldown: 0,
    verbPast: 'escorted', verbPresent: 'escorts',
    tags: ['social', 'escort', 'quest'],
  },
  {
    name: 'request_quest',
    description: 'Ask an NPC for a quest or task',
    actionType: 'social', category: 'social', parentAction: null,
    duration: 1, difficulty: 0.1, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'requested a quest', verbPresent: 'requests a quest',
    tags: ['social', 'quest'],
  },
  {
    name: 'eavesdrop',
    description: 'Listen in on a conversation without being noticed',
    actionType: 'social', category: 'social', parentAction: null,
    duration: 2, difficulty: 0.3, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 15, cooldown: 0,
    verbPast: 'eavesdropped', verbPresent: 'eavesdrops',
    tags: ['social', 'stealth', 'observation'],
  },
  {
    name: 'greet',
    description: 'Greet someone with a hello or wave',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'greeted', verbPresent: 'greets',
    tags: ['social', 'conversation', 'greeting'],
  },
  {
    name: 'insult_npc',
    description: 'Say something rude or hurtful',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0.2, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 3,
    verbPast: 'insulted', verbPresent: 'insults',
    tags: ['social', 'conversation', 'negative'],
  },
  {
    name: 'threaten',
    description: 'Intimidate someone with words or gestures',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0.3, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 3,
    verbPast: 'threatened', verbPresent: 'threatens',
    tags: ['social', 'conversation', 'intimidation'],
  },
  {
    name: 'flirt',
    description: 'Express romantic interest playfully',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0.3, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 3,
    verbPast: 'flirted', verbPresent: 'flirts',
    tags: ['social', 'conversation', 'romance'],
  },
  {
    name: 'persuade',
    description: 'Convince someone to see your point of view',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0.5, energyCost: 1,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 5,
    verbPast: 'persuaded', verbPresent: 'persuades',
    tags: ['social', 'conversation', 'persuasion'],
  },
  {
    name: 'bribe',
    description: 'Offer money or items in exchange for a favor',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0.4, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 5,
    verbPast: 'bribed', verbPresent: 'bribes',
    tags: ['social', 'conversation', 'corruption'],
  },
  {
    name: 'gossip',
    description: 'Share rumors or juicy information',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0.1, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'gossiped', verbPresent: 'gossips',
    tags: ['social', 'conversation', 'information'],
  },
  {
    name: 'confess',
    description: 'Admit to something or share a secret',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0.4, energyCost: 1,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 10,
    verbPast: 'confessed', verbPresent: 'confesses',
    tags: ['social', 'conversation', 'honesty'],
  },
  {
    name: 'apologize',
    description: 'Express regret for a wrongdoing',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0.2, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 3,
    verbPast: 'apologized', verbPresent: 'apologizes',
    tags: ['social', 'conversation', 'reconciliation'],
  },
  {
    name: 'comfort',
    description: 'Console someone who is upset or distressed',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0.2, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'comforted', verbPresent: 'comforts',
    tags: ['social', 'conversation', 'empathy'],
  },
  {
    name: 'argue',
    description: 'Engage in a heated disagreement',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0.3, energyCost: 1,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 3,
    verbPast: 'argued', verbPresent: 'argues',
    tags: ['social', 'conversation', 'conflict'],
  },
  {
    name: 'joke',
    description: 'Tell a joke or make someone laugh',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0.2, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'joked', verbPresent: 'jokes',
    tags: ['social', 'conversation', 'humor'],
  },
  {
    name: 'share_story',
    description: 'Tell a personal story or anecdote',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 2, difficulty: 0.2, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'shared a story', verbPresent: 'shares a story',
    tags: ['social', 'conversation', 'storytelling'],
  },
  {
    name: 'ask_about',
    description: 'Ask someone about a topic or subject',
    actionType: 'social', category: 'social', parentAction: 'talk_to_npc',
    duration: 1, difficulty: 0.1, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'asked about', verbPresent: 'asks about',
    tags: ['social', 'conversation', 'inquiry'],
  },

  // Items
  {
    name: 'drop_item',
    description: 'Drop an item from your inventory onto the ground',
    actionType: 'physical', category: 'items', parentAction: null,
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'object', requiresTarget: true, range: 0, cooldown: 0,
    verbPast: 'dropped', verbPresent: 'drops',
    tags: ['items', 'inventory'],
  },
  {
    name: 'collect_item',
    description: 'Pick up and add an item to your inventory',
    actionType: 'physical', category: 'items', parentAction: null,
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'object', requiresTarget: true, range: 3, cooldown: 0,
    verbPast: 'collected', verbPresent: 'collects',
    tags: ['items', 'inventory', 'pickup'],
  },

  // Exploration
  {
    name: 'take_photo',
    description: 'Take a photograph of something interesting',
    actionType: 'physical', category: 'exploration', parentAction: null,
    duration: 1, difficulty: 0.1, energyCost: 0,
    targetType: 'object', requiresTarget: true, range: 20, cooldown: 0,
    verbPast: 'photographed', verbPresent: 'photographs',
    tags: ['exploration', 'photography'],
  },
  {
    name: 'observe_activity',
    description: 'Watch and learn from an activity happening nearby',
    actionType: 'social', category: 'exploration', parentAction: null,
    duration: 2, difficulty: 0.1, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 15, cooldown: 0,
    verbPast: 'observed', verbPresent: 'observes',
    tags: ['exploration', 'observation'],
  },
  {
    name: 'investigate',
    description: 'Examine a location or object closely for clues',
    actionType: 'physical', category: 'exploration', parentAction: null,
    duration: 2, difficulty: 0.3, energyCost: 1,
    targetType: 'object', requiresTarget: true, range: 3, cooldown: 0,
    verbPast: 'investigated', verbPresent: 'investigates',
    tags: ['exploration', 'investigation'],
  },
  {
    name: 'mount_vehicle',
    description: 'Mount or board a vehicle or rideable creature',
    actionType: 'physical', category: 'exploration', parentAction: null,
    duration: 1, difficulty: 0.1, energyCost: 0,
    targetType: 'object', requiresTarget: true, range: 3, cooldown: 0,
    verbPast: 'mounted', verbPresent: 'mounts',
    tags: ['exploration', 'transport'],
  },

  // Language
  {
    name: 'teach_vocabulary',
    description: 'Teach a word or phrase to someone',
    actionType: 'language', category: 'language', parentAction: null,
    duration: 2, difficulty: 0.3, energyCost: 1,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'taught vocabulary', verbPresent: 'teaches vocabulary',
    tags: ['language', 'teaching'],
  },
  {
    name: 'answer_question',
    description: 'Answer a question posed by someone',
    actionType: 'language', category: 'language', parentAction: null,
    duration: 1, difficulty: 0.3, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'answered', verbPresent: 'answers',
    tags: ['language', 'comprehension'],
  },
  {
    name: 'read_book',
    description: 'Read a book or written text',
    actionType: 'language', category: 'language', parentAction: null,
    duration: 3, difficulty: 0.3, energyCost: 0,
    targetType: 'object', requiresTarget: true, range: 0, cooldown: 0,
    verbPast: 'read', verbPresent: 'reads',
    tags: ['language', 'reading', 'literacy'],
  },

  // Survival
  {
    name: 'sleep',
    description: 'Sleep to restore energy and health',
    actionType: 'physical', category: 'survival', parentAction: 'rest',
    duration: 8, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'slept', verbPresent: 'sleeps',
    tags: ['survival', 'rest', 'recovery'],
  },
  {
    name: 'sit',
    description: 'Sit down to take a short break',
    actionType: 'physical', category: 'survival', parentAction: 'rest',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'sat', verbPresent: 'sits',
    tags: ['survival', 'rest'],
  },

  // Exploration — work (was standalone in matrix)
  {
    name: 'work',
    description: 'Perform a work task at your job or assigned location',
    actionType: 'physical', category: 'resource', parentAction: null,
    duration: 3, difficulty: 0.2, energyCost: 2,
    targetType: 'location', requiresTarget: true, range: 0, cooldown: 0,
    verbPast: 'worked', verbPresent: 'works',
    tags: ['resource', 'labor', 'employment'],
  },
];

// ─── Migration runner ───────────────────────────────────────────────────────

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  Migration 038: Unify action hierarchy');
  console.log('='.repeat(60) + '\n');

  // Get all existing base actions
  const allActions = await storage.getBaseActions();
  const actionsByName = new Map(allActions.map(a => [a.name, a]));

  console.log(`Found ${allActions.length} existing base actions\n`);

  // ── Step 1: Rename open_chest → open_container ──────────────────────────
  const openChest = actionsByName.get('open_chest');
  if (openChest) {
    await storage.updateAction(openChest.id, {
      name: 'open_container',
      description: 'Open a container, chest, or box',
      tags: ['exploration', 'interaction', 'container'],
    } as any);
    actionsByName.delete('open_chest');
    actionsByName.set('open_container', { ...openChest, name: 'open_container' });
    console.log('  Renamed: open_chest → open_container');
  }

  // ── Step 2: Update categories and parentAction on existing actions ──────
  let updated = 0;
  for (const action of allActions) {
    const name = action.name === 'open_chest' ? 'open_container' : action.name;
    const oldCategory = action.category || '';
    const newCategory = CATEGORY_MAP[oldCategory] || oldCategory;
    const parentAction = PARENT_MAP[name] || null;

    const needsUpdate = newCategory !== oldCategory || parentAction !== null;
    if (needsUpdate) {
      await storage.updateAction(action.id, {
        category: newCategory,
        parentAction,
      } as any);
      updated++;
    }
  }
  console.log(`  Updated categories/parents on ${updated} existing actions\n`);

  // ── Step 3: Create new actions ──────────────────────────────────────────
  let created = 0;
  let skipped = 0;

  for (const def of NEW_ACTIONS) {
    if (actionsByName.has(def.name)) {
      // Already exists — just update its category and parent
      const existing = actionsByName.get(def.name)!;
      const updates: any = {
        category: def.category,
      };
      if (def.parentAction) updates.parentAction = def.parentAction;
      // Fill in missing verbs
      if (!existing.verbPast && def.verbPast) updates.verbPast = def.verbPast;
      if (!existing.verbPresent && def.verbPresent) updates.verbPresent = def.verbPresent;
      await storage.updateAction(existing.id, updates);
      skipped++;
      continue;
    }

    const content = `action ${def.name} {
  description("${def.description}")
  action_type: ${def.actionType}
  category: ${def.category}
  energy_cost: ${def.energyCost}
  target_type: ${def.targetType}
  requires_target: ${def.requiresTarget}
  range: ${def.range}
  cooldown: ${def.cooldown}
  duration: ${def.duration}
  difficulty: ${def.difficulty}
}`;

    await storage.createAction({
      name: def.name,
      description: def.description,
      content,
      isBase: true,
      sourceFormat: 'prolog',
      parentAction: def.parentAction,
      actionType: def.actionType,
      category: def.category,
      duration: def.duration,
      difficulty: def.difficulty,
      energyCost: def.energyCost,
      targetType: def.targetType,
      requiresTarget: def.requiresTarget,
      range: def.range,
      cooldown: def.cooldown,
      verbPast: def.verbPast,
      verbPresent: def.verbPresent,
      tags: def.tags,
      isActive: true,
    } as any);

    console.log(`  Created: ${def.name} (parent: ${def.parentAction || 'root'})`);
    created++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  Done!`);
  console.log(`    Updated: ${updated}`);
  console.log(`    Created: ${created}`);
  console.log(`    Skipped (already existed): ${skipped}`);
  console.log(`    Total base actions: ${allActions.length + created}`);
  console.log('='.repeat(60) + '\n');
}

runMigration()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((err) => { console.error('Migration failed:', err); process.exit(1); });
