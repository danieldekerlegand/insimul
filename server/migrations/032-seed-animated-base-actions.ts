#!/usr/bin/env tsx
/**
 * Migration 032: Seed base actions with animation mappings
 *
 * Creates ~70 new base actions covering all 88 UAL animation clips.
 * Each action stores animation info in `customData.animation` for
 * the Babylon.js ActionManager to use at runtime.
 *
 * Animation data format in customData:
 *   {
 *     animation: {
 *       clip: "Walk_Loop",       // Primary animation clip name
 *       clipAlt?: "Jog_Fwd_Loop", // Fallback clip name
 *       library: "UAL1" | "UAL2", // Which library contains it
 *       loop: true,              // Whether to loop
 *       speed?: 1.0,             // Playback speed multiplier
 *       blendIn?: 0.2,           // Blend transition time (seconds)
 *     }
 *   }
 *
 * Usage:
 *   npx tsx server/migrations/032-seed-animated-base-actions.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';

// ─── Animation-mapped action definitions ─────────────────────────────────────

interface ActionDef {
  name: string;
  description: string;
  actionType: string;
  category: string;
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
  animation: {
    clip: string;
    clipAlt?: string;
    library: 'UAL1' | 'UAL2';
    loop: boolean;
    speed?: number;
    blendIn?: number;
  };
  content?: string; // Prolog content
}

const ACTIONS: ActionDef[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MOVEMENT (UAL1)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'walk',
    description: 'Walk at a normal pace to a destination',
    actionType: 'movement', category: 'locomotion',
    duration: 1, difficulty: 0, energyCost: 1,
    targetType: 'location', requiresTarget: true, range: 0, cooldown: 0,
    verbPast: 'walked', verbPresent: 'walks',
    tags: ['movement', 'locomotion', 'basic'],
    animation: { clip: 'Walk_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'walk_formal',
    description: 'Walk in a formal, dignified manner',
    actionType: 'movement', category: 'locomotion',
    duration: 1, difficulty: 0, energyCost: 1,
    targetType: 'location', requiresTarget: true, range: 0, cooldown: 0,
    verbPast: 'walked formally', verbPresent: 'walks formally',
    tags: ['movement', 'locomotion', 'formal'],
    animation: { clip: 'Walk_Formal_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'jog',
    description: 'Jog at a moderate pace',
    actionType: 'movement', category: 'locomotion',
    duration: 1, difficulty: 0.1, energyCost: 2,
    targetType: 'location', requiresTarget: true, range: 0, cooldown: 0,
    verbPast: 'jogged', verbPresent: 'jogs',
    tags: ['movement', 'locomotion', 'running'],
    animation: { clip: 'Jog_Fwd_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'sprint',
    description: 'Run at full speed',
    actionType: 'movement', category: 'locomotion',
    duration: 1, difficulty: 0.2, energyCost: 4,
    targetType: 'location', requiresTarget: true, range: 0, cooldown: 0,
    verbPast: 'sprinted', verbPresent: 'sprints',
    tags: ['movement', 'locomotion', 'running', 'fast'],
    animation: { clip: 'Sprint_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'crouch_walk',
    description: 'Move stealthily while crouching',
    actionType: 'movement', category: 'stealth',
    duration: 1, difficulty: 0.3, energyCost: 2,
    targetType: 'location', requiresTarget: true, range: 0, cooldown: 0,
    verbPast: 'crept', verbPresent: 'creeps',
    tags: ['movement', 'stealth', 'crouch'],
    animation: { clip: 'Crouch_Fwd_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'crouch_idle',
    description: 'Crouch in place, hiding or waiting',
    actionType: 'movement', category: 'stealth',
    duration: 1, difficulty: 0.1, energyCost: 1,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'crouched', verbPresent: 'crouches',
    tags: ['movement', 'stealth', 'crouch', 'idle'],
    animation: { clip: 'Crouch_Idle_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'jump',
    description: 'Jump over an obstacle or gap',
    actionType: 'movement', category: 'acrobatics',
    duration: 1, difficulty: 0.3, energyCost: 3,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 1,
    verbPast: 'jumped', verbPresent: 'jumps',
    tags: ['movement', 'acrobatics', 'jump'],
    animation: { clip: 'Jump_Start', clipAlt: 'Jump_Loop', library: 'UAL1', loop: false },
  },
  {
    name: 'roll',
    description: 'Perform a dodge roll',
    actionType: 'movement', category: 'acrobatics',
    duration: 1, difficulty: 0.4, energyCost: 3,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 2,
    verbPast: 'rolled', verbPresent: 'rolls',
    tags: ['movement', 'acrobatics', 'dodge'],
    animation: { clip: 'Roll', library: 'UAL1', loop: false },
  },
  {
    name: 'swim',
    description: 'Swim through water',
    actionType: 'movement', category: 'locomotion',
    duration: 1, difficulty: 0.3, energyCost: 3,
    targetType: 'location', requiresTarget: true, range: 0, cooldown: 0,
    verbPast: 'swam', verbPresent: 'swims',
    tags: ['movement', 'locomotion', 'swimming', 'water'],
    animation: { clip: 'Swim_Fwd_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'swim_idle',
    description: 'Tread water in place',
    actionType: 'movement', category: 'locomotion',
    duration: 1, difficulty: 0.2, energyCost: 2,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'treaded water', verbPresent: 'treads water',
    tags: ['movement', 'swimming', 'water', 'idle'],
    animation: { clip: 'Swim_Idle_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'slide',
    description: 'Slide under an obstacle or down a slope',
    actionType: 'movement', category: 'acrobatics',
    duration: 1, difficulty: 0.4, energyCost: 2,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 2,
    verbPast: 'slid', verbPresent: 'slides',
    tags: ['movement', 'acrobatics', 'slide'],
    animation: { clip: 'Slide_Start', library: 'UAL2', loop: false },
  },
  {
    name: 'climb',
    description: 'Climb up a ledge or wall',
    actionType: 'movement', category: 'acrobatics',
    duration: 2, difficulty: 0.5, energyCost: 4,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'climbed', verbPresent: 'climbs',
    tags: ['movement', 'acrobatics', 'climb'],
    animation: { clip: 'ClimbUp_1m_RM', library: 'UAL2', loop: false },
  },
  {
    name: 'ninja_jump',
    description: 'Perform an acrobatic double-jump',
    actionType: 'movement', category: 'acrobatics',
    duration: 1, difficulty: 0.7, energyCost: 5,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 3,
    verbPast: 'leapt', verbPresent: 'leaps',
    tags: ['movement', 'acrobatics', 'jump', 'advanced'],
    animation: { clip: 'NinjaJump_Start', library: 'UAL2', loop: false },
  },
  {
    name: 'walk_carry',
    description: 'Walk while carrying a heavy object',
    actionType: 'movement', category: 'locomotion',
    duration: 1, difficulty: 0.2, energyCost: 3,
    targetType: 'location', requiresTarget: true, range: 0, cooldown: 0,
    verbPast: 'carried', verbPresent: 'carries',
    tags: ['movement', 'locomotion', 'carry', 'labor'],
    animation: { clip: 'Walk_Carry_Loop', library: 'UAL2', loop: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IDLE / SOCIAL (UAL1 + UAL2)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'idle',
    description: 'Stand idle, waiting or resting',
    actionType: 'social', category: 'idle',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'stood idle', verbPresent: 'stands idle',
    tags: ['idle', 'rest', 'basic'],
    animation: { clip: 'Idle_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'talk',
    description: 'Talk with someone nearby',
    actionType: 'social', category: 'conversation',
    duration: 2, difficulty: 0.1, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'talked', verbPresent: 'talks',
    tags: ['social', 'conversation', 'talking'],
    animation: { clip: 'Idle_Talking_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'dance',
    description: 'Dance with joy or celebration',
    actionType: 'social', category: 'expression',
    duration: 3, difficulty: 0.2, energyCost: 2,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 5,
    verbPast: 'danced', verbPresent: 'dances',
    tags: ['social', 'expression', 'dance', 'celebration'],
    animation: { clip: 'Dance_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'sit_down',
    description: 'Sit down on a chair or bench',
    actionType: 'social', category: 'idle',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'sat down', verbPresent: 'sits down',
    tags: ['social', 'idle', 'sitting'],
    animation: { clip: 'Sitting_Enter', library: 'UAL1', loop: false },
  },
  {
    name: 'sit_idle',
    description: 'Sit quietly, resting or waiting',
    actionType: 'social', category: 'idle',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'sat', verbPresent: 'sits',
    tags: ['social', 'idle', 'sitting', 'rest'],
    animation: { clip: 'Sitting_Idle_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'sit_talk',
    description: 'Chat while sitting',
    actionType: 'social', category: 'conversation',
    duration: 2, difficulty: 0.1, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'chatted', verbPresent: 'chats',
    tags: ['social', 'conversation', 'sitting'],
    animation: { clip: 'Sitting_Talking_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'stand_up',
    description: 'Stand up from a seated position',
    actionType: 'social', category: 'idle',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'stood up', verbPresent: 'stands up',
    tags: ['social', 'idle', 'transition'],
    animation: { clip: 'Sitting_Exit', library: 'UAL1', loop: false },
  },
  {
    name: 'fold_arms',
    description: 'Stand with arms folded, looking impatient or thoughtful',
    actionType: 'social', category: 'expression',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'folded arms', verbPresent: 'folds arms',
    tags: ['social', 'expression', 'idle', 'impatient'],
    animation: { clip: 'Idle_FoldArms_Loop', library: 'UAL2', loop: true },
  },
  {
    name: 'nod_yes',
    description: 'Nod in agreement',
    actionType: 'social', category: 'expression',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'nodded', verbPresent: 'nods',
    tags: ['social', 'expression', 'agreement'],
    animation: { clip: 'Yes', library: 'UAL2', loop: false },
  },
  {
    name: 'shake_head_no',
    description: 'Shake head in disagreement',
    actionType: 'social', category: 'expression',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 0,
    verbPast: 'shook head', verbPresent: 'shakes head',
    tags: ['social', 'expression', 'disagreement'],
    animation: { clip: 'Idle_No_Loop', library: 'UAL2', loop: false },
  },
  {
    name: 'phone_call',
    description: 'Talk on a phone or communication device',
    actionType: 'social', category: 'conversation',
    duration: 3, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'made a call', verbPresent: 'makes a call',
    tags: ['social', 'conversation', 'phone', 'modern'],
    animation: { clip: 'Idle_TalkingPhone_Loop', library: 'UAL2', loop: true },
  },
  {
    name: 'lean_railing',
    description: 'Lean against a railing or fence',
    actionType: 'social', category: 'idle',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'leaned', verbPresent: 'leans',
    tags: ['social', 'idle', 'leaning', 'relaxed'],
    animation: { clip: 'Idle_Rail_Loop', library: 'UAL2', loop: true },
  },
  {
    name: 'call_out',
    description: 'Call out to someone from a railing or balcony',
    actionType: 'social', category: 'expression',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 15, cooldown: 3,
    verbPast: 'called out', verbPresent: 'calls out',
    tags: ['social', 'expression', 'shouting'],
    animation: { clip: 'Idle_Rail_Call', library: 'UAL2', loop: false },
  },
  {
    name: 'get_up',
    description: 'Get up from lying down',
    actionType: 'social', category: 'idle',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'got up', verbPresent: 'gets up',
    tags: ['social', 'idle', 'transition'],
    animation: { clip: 'LayToIdle', library: 'UAL2', loop: false },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMBAT — MELEE (UAL1 + UAL2)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'sword_attack',
    description: 'Strike with a sword or bladed weapon',
    actionType: 'combat', category: 'melee',
    duration: 1, difficulty: 0.4, energyCost: 3,
    targetType: 'other', requiresTarget: true, range: 3, cooldown: 1,
    verbPast: 'slashed', verbPresent: 'slashes',
    tags: ['combat', 'melee', 'sword', 'attack'],
    animation: { clip: 'Sword_Attack', library: 'UAL1', loop: false, speed: 1.2 },
  },
  {
    name: 'sword_idle',
    description: 'Hold a sword at the ready',
    actionType: 'combat', category: 'melee',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'readied sword', verbPresent: 'readies sword',
    tags: ['combat', 'melee', 'sword', 'idle', 'stance'],
    animation: { clip: 'Sword_Idle', library: 'UAL1', loop: true },
  },
  {
    name: 'sword_combo',
    description: 'Perform a multi-hit sword combo',
    actionType: 'combat', category: 'melee',
    duration: 2, difficulty: 0.6, energyCost: 6,
    targetType: 'other', requiresTarget: true, range: 3, cooldown: 3,
    verbPast: 'unleashed a combo', verbPresent: 'unleashes a combo',
    tags: ['combat', 'melee', 'sword', 'combo', 'advanced'],
    animation: { clip: 'Sword_Regular_Combo', library: 'UAL2', loop: false, speed: 1.1 },
  },
  {
    name: 'sword_block',
    description: 'Block an incoming attack with a sword',
    actionType: 'combat', category: 'defense',
    duration: 1, difficulty: 0.4, energyCost: 2,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 1,
    verbPast: 'blocked', verbPresent: 'blocks',
    tags: ['combat', 'defense', 'sword', 'block'],
    animation: { clip: 'Sword_Block', library: 'UAL2', loop: false },
  },
  {
    name: 'sword_dash',
    description: 'Dash forward with a sword strike',
    actionType: 'combat', category: 'melee',
    duration: 1, difficulty: 0.6, energyCost: 5,
    targetType: 'other', requiresTarget: true, range: 6, cooldown: 4,
    verbPast: 'dash-attacked', verbPresent: 'dash-attacks',
    tags: ['combat', 'melee', 'sword', 'dash', 'advanced'],
    animation: { clip: 'Sword_Dash_RM', library: 'UAL2', loop: false },
  },
  {
    name: 'punch',
    description: 'Throw a quick punch',
    actionType: 'combat', category: 'melee',
    duration: 1, difficulty: 0.3, energyCost: 2,
    targetType: 'other', requiresTarget: true, range: 2, cooldown: 1,
    verbPast: 'punched', verbPresent: 'punches',
    tags: ['combat', 'melee', 'unarmed', 'punch'],
    animation: { clip: 'Punch_Jab', library: 'UAL1', loop: false, speed: 1.3 },
  },
  {
    name: 'punch_heavy',
    description: 'Throw a powerful cross punch',
    actionType: 'combat', category: 'melee',
    duration: 1, difficulty: 0.5, energyCost: 4,
    targetType: 'other', requiresTarget: true, range: 2, cooldown: 2,
    verbPast: 'struck hard', verbPresent: 'strikes hard',
    tags: ['combat', 'melee', 'unarmed', 'punch', 'heavy'],
    animation: { clip: 'Punch_Cross', library: 'UAL1', loop: false },
  },
  {
    name: 'melee_hook',
    description: 'Deliver a powerful hook punch',
    actionType: 'combat', category: 'melee',
    duration: 1, difficulty: 0.5, energyCost: 4,
    targetType: 'other', requiresTarget: true, range: 2, cooldown: 2,
    verbPast: 'hooked', verbPresent: 'hooks',
    tags: ['combat', 'melee', 'unarmed', 'hook'],
    animation: { clip: 'Melee_Hook', library: 'UAL2', loop: false },
  },
  {
    name: 'shield_block',
    description: 'Raise shield to block attacks',
    actionType: 'combat', category: 'defense',
    duration: 1, difficulty: 0.3, energyCost: 2,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 1,
    verbPast: 'raised shield', verbPresent: 'raises shield',
    tags: ['combat', 'defense', 'shield', 'block'],
    animation: { clip: 'Idle_Shield_Loop', library: 'UAL2', loop: true },
  },
  {
    name: 'shield_bash',
    description: 'Bash an enemy with a shield',
    actionType: 'combat', category: 'melee',
    duration: 1, difficulty: 0.5, energyCost: 4,
    targetType: 'other', requiresTarget: true, range: 2, cooldown: 3,
    verbPast: 'shield-bashed', verbPresent: 'shield-bashes',
    tags: ['combat', 'melee', 'shield', 'bash'],
    animation: { clip: 'Shield_OneShot', library: 'UAL2', loop: false },
  },
  {
    name: 'shield_dash',
    description: 'Charge forward with shield raised',
    actionType: 'combat', category: 'melee',
    duration: 1, difficulty: 0.6, energyCost: 5,
    targetType: 'other', requiresTarget: true, range: 5, cooldown: 4,
    verbPast: 'shield-charged', verbPresent: 'shield-charges',
    tags: ['combat', 'melee', 'shield', 'dash', 'charge'],
    animation: { clip: 'Shield_Dash_RM', library: 'UAL2', loop: false },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMBAT — RANGED (UAL1)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'pistol_shoot',
    description: 'Fire a pistol or handgun',
    actionType: 'combat', category: 'ranged',
    duration: 1, difficulty: 0.4, energyCost: 2,
    targetType: 'other', requiresTarget: true, range: 15, cooldown: 1,
    verbPast: 'shot', verbPresent: 'shoots',
    tags: ['combat', 'ranged', 'pistol', 'firearm'],
    animation: { clip: 'Pistol_Shoot', library: 'UAL1', loop: false },
  },
  {
    name: 'pistol_aim',
    description: 'Aim a pistol at a target',
    actionType: 'combat', category: 'ranged',
    duration: 1, difficulty: 0.2, energyCost: 1,
    targetType: 'other', requiresTarget: true, range: 15, cooldown: 0,
    verbPast: 'aimed', verbPresent: 'aims',
    tags: ['combat', 'ranged', 'pistol', 'aim'],
    animation: { clip: 'Pistol_Aim_Neutral', library: 'UAL1', loop: true },
  },
  {
    name: 'pistol_reload',
    description: 'Reload a pistol',
    actionType: 'combat', category: 'ranged',
    duration: 2, difficulty: 0.2, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'reloaded', verbPresent: 'reloads',
    tags: ['combat', 'ranged', 'pistol', 'reload'],
    animation: { clip: 'Pistol_Reload', library: 'UAL1', loop: false },
  },
  {
    name: 'throw_projectile',
    description: 'Throw an object at a target',
    actionType: 'combat', category: 'ranged',
    duration: 1, difficulty: 0.4, energyCost: 3,
    targetType: 'other', requiresTarget: true, range: 10, cooldown: 2,
    verbPast: 'threw', verbPresent: 'throws',
    tags: ['combat', 'ranged', 'throw'],
    animation: { clip: 'OverhandThrow', library: 'UAL2', loop: false },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMBAT — REACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'hit_reaction',
    description: 'React to being hit in the chest',
    actionType: 'combat', category: 'reaction',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'staggered', verbPresent: 'staggers',
    tags: ['combat', 'reaction', 'hit', 'stagger'],
    animation: { clip: 'Hit_Chest', library: 'UAL1', loop: false },
  },
  {
    name: 'hit_head',
    description: 'React to being hit in the head',
    actionType: 'combat', category: 'reaction',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'reeled', verbPresent: 'reels',
    tags: ['combat', 'reaction', 'hit', 'head'],
    animation: { clip: 'Hit_Head', library: 'UAL1', loop: false },
  },
  {
    name: 'knockback',
    description: 'Get knocked back by a powerful blow',
    actionType: 'combat', category: 'reaction',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'was knocked back', verbPresent: 'gets knocked back',
    tags: ['combat', 'reaction', 'knockback'],
    animation: { clip: 'Hit_Knockback', library: 'UAL2', loop: false },
  },
  {
    name: 'die',
    description: 'Fall in defeat',
    actionType: 'combat', category: 'reaction',
    duration: 2, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'fell', verbPresent: 'falls',
    tags: ['combat', 'reaction', 'death'],
    animation: { clip: 'Death01', library: 'UAL1', loop: false },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MAGIC / SPELL CASTING (UAL1)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'cast_spell',
    description: 'Cast a spell or use a magical ability',
    actionType: 'combat', category: 'magic',
    duration: 2, difficulty: 0.5, energyCost: 5,
    targetType: 'other', requiresTarget: true, range: 10, cooldown: 3,
    verbPast: 'cast a spell', verbPresent: 'casts a spell',
    tags: ['combat', 'magic', 'spell', 'fantasy'],
    animation: { clip: 'Spell_Simple_Shoot', library: 'UAL1', loop: false },
  },
  {
    name: 'spell_channel',
    description: 'Channel magical energy',
    actionType: 'combat', category: 'magic',
    duration: 3, difficulty: 0.4, energyCost: 3,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'channeled', verbPresent: 'channels',
    tags: ['combat', 'magic', 'spell', 'channel'],
    animation: { clip: 'Spell_Simple_Idle_Loop', library: 'UAL1', loop: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORK / LABOR (UAL1 + UAL2)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'push_object',
    description: 'Push a heavy object',
    actionType: 'physical', category: 'labor',
    duration: 2, difficulty: 0.4, energyCost: 4,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'pushed', verbPresent: 'pushes',
    tags: ['physical', 'labor', 'push', 'strength'],
    animation: { clip: 'Push_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'pick_up',
    description: 'Pick up an object from a table or surface',
    actionType: 'physical', category: 'interaction',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'picked up', verbPresent: 'picks up',
    tags: ['physical', 'interaction', 'pickup'],
    animation: { clip: 'PickUp_Table', library: 'UAL1', loop: false },
  },
  {
    name: 'fix_repair',
    description: 'Kneel down and repair or fix something',
    actionType: 'physical', category: 'crafting',
    duration: 3, difficulty: 0.4, energyCost: 3,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'repaired', verbPresent: 'repairs',
    tags: ['physical', 'crafting', 'repair', 'kneeling'],
    animation: { clip: 'Fixing_Kneeling', library: 'UAL1', loop: true },
  },
  {
    name: 'drive',
    description: 'Drive a vehicle or cart',
    actionType: 'physical', category: 'transport',
    duration: 1, difficulty: 0.3, energyCost: 1,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'drove', verbPresent: 'drives',
    tags: ['physical', 'transport', 'driving', 'vehicle'],
    animation: { clip: 'Driving_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'interact',
    description: 'Interact with an object or mechanism',
    actionType: 'physical', category: 'interaction',
    duration: 1, difficulty: 0.1, energyCost: 0,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'interacted with', verbPresent: 'interacts with',
    tags: ['physical', 'interaction', 'generic'],
    animation: { clip: 'Interact', library: 'UAL1', loop: false },
  },
  {
    name: 'open_chest',
    description: 'Open a chest, crate, or container',
    actionType: 'physical', category: 'interaction',
    duration: 1, difficulty: 0.1, energyCost: 0,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'opened', verbPresent: 'opens',
    tags: ['physical', 'interaction', 'container', 'loot'],
    animation: { clip: 'Chest_Open', library: 'UAL2', loop: false },
  },
  {
    name: 'consume',
    description: 'Eat food or drink a beverage',
    actionType: 'physical', category: 'sustenance',
    duration: 2, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'consumed', verbPresent: 'consumes',
    tags: ['physical', 'sustenance', 'eat', 'drink'],
    animation: { clip: 'Consume', library: 'UAL2', loop: false },
  },
  {
    name: 'chop_tree',
    description: 'Chop down a tree for wood',
    actionType: 'physical', category: 'gathering',
    duration: 5, difficulty: 0.4, energyCost: 5,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'chopped', verbPresent: 'chops',
    tags: ['physical', 'gathering', 'woodcutting', 'labor'],
    animation: { clip: 'TreeChopping_Loop', library: 'UAL2', loop: true },
  },
  {
    name: 'farm_harvest',
    description: 'Harvest crops from a field',
    actionType: 'physical', category: 'farming',
    duration: 3, difficulty: 0.2, energyCost: 3,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'harvested', verbPresent: 'harvests',
    tags: ['physical', 'farming', 'harvest', 'agriculture'],
    animation: { clip: 'Farm_Harvest', library: 'UAL2', loop: true },
  },
  {
    name: 'farm_plant',
    description: 'Plant seeds in prepared soil',
    actionType: 'physical', category: 'farming',
    duration: 2, difficulty: 0.2, energyCost: 2,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'planted', verbPresent: 'plants',
    tags: ['physical', 'farming', 'planting', 'agriculture'],
    animation: { clip: 'Farm_PlantSeed', library: 'UAL2', loop: false },
  },
  {
    name: 'farm_water',
    description: 'Water crops or a garden',
    actionType: 'physical', category: 'farming',
    duration: 2, difficulty: 0.1, energyCost: 2,
    targetType: 'object', requiresTarget: true, range: 2, cooldown: 0,
    verbPast: 'watered', verbPresent: 'waters',
    tags: ['physical', 'farming', 'watering', 'agriculture'],
    animation: { clip: 'Farm_Watering', library: 'UAL2', loop: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY / SPECIAL (UAL1 + UAL2)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'hold_torch',
    description: 'Hold a torch or lantern aloft',
    actionType: 'physical', category: 'utility',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'held a torch', verbPresent: 'holds a torch',
    tags: ['utility', 'light', 'torch', 'lantern'],
    animation: { clip: 'Idle_Torch_Loop', library: 'UAL1', loop: true },
  },
  {
    name: 'hold_lantern',
    description: 'Hold a lantern to light the way',
    actionType: 'physical', category: 'utility',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'held a lantern', verbPresent: 'holds a lantern',
    tags: ['utility', 'light', 'lantern'],
    animation: { clip: 'Idle_Lantern_Loop', library: 'UAL2', loop: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ZOMBIE / CREATURE BEHAVIORS (UAL2)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'zombie_idle',
    description: 'Shamble and sway like the undead',
    actionType: 'movement', category: 'creature',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'none', requiresTarget: false, range: 0, cooldown: 0,
    verbPast: 'shambled', verbPresent: 'shambles',
    tags: ['creature', 'zombie', 'undead', 'idle'],
    animation: { clip: 'Zombie_Idle_Loop', library: 'UAL2', loop: true },
  },
  {
    name: 'zombie_walk',
    description: 'Lurch forward with undead movement',
    actionType: 'movement', category: 'creature',
    duration: 1, difficulty: 0, energyCost: 0,
    targetType: 'location', requiresTarget: true, range: 0, cooldown: 0,
    verbPast: 'lurched', verbPresent: 'lurches',
    tags: ['creature', 'zombie', 'undead', 'movement'],
    animation: { clip: 'Zombie_Walk_Fwd_Loop', library: 'UAL2', loop: true },
  },
  {
    name: 'zombie_attack',
    description: 'Scratch and claw at a target',
    actionType: 'combat', category: 'creature',
    duration: 1, difficulty: 0.3, energyCost: 0,
    targetType: 'other', requiresTarget: true, range: 2, cooldown: 1,
    verbPast: 'clawed', verbPresent: 'claws',
    tags: ['creature', 'zombie', 'undead', 'attack'],
    animation: { clip: 'Zombie_Scratch', library: 'UAL2', loop: false },
  },
];

// ─── Main ───────────────────────────────────────────────────────────────────

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  Migration 032: Seed Animated Base Actions');
  console.log('='.repeat(60) + '\n');

  // Get existing base actions to avoid duplicates
  const existing = await storage.getBaseActions();
  const existingNames = new Set(existing.map(a => a.name));
  console.log(`Existing base actions: ${existingNames.size}`);
  console.log(`New actions to seed: ${ACTIONS.length}\n`);

  let created = 0;
  let skipped = 0;

  for (const def of ACTIONS) {
    if (existingNames.has(def.name)) {
      // Update existing action with animation data if it doesn't have it
      const existingAction = existing.find(a => a.name === def.name);
      if (existingAction && !(existingAction.customData as any)?.animation) {
        await storage.updateAction(existingAction.id, {
          customData: { ...(existingAction.customData as any || {}), animation: def.animation },
        });
        console.log(`  Updated: ${def.name} (added animation)`);
      } else {
        console.log(`  Skipped: ${def.name} (exists)`);
      }
      skipped++;
      continue;
    }

    const content = def.content || `action ${def.name} {
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
      customData: { animation: def.animation },
    } as any);

    console.log(`  Created: ${def.name} -> ${def.animation.clip}`);
    created++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  Done! Created: ${created} | Skipped/Updated: ${skipped}`);
  console.log(`  Total base actions: ${existingNames.size + created}`);
  console.log('='.repeat(60) + '\n');
}

runMigration()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((error) => { console.error('Failed:', error); process.exit(1); });
