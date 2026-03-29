/**
 * Action Prerequisites — Prolog goal definitions for action feasibility
 *
 * Defines what Prolog goals must succeed for each action's can_perform rule.
 * Used by the action converter to generate proper Prolog can_perform rules.
 *
 * Prerequisites reference predicates from:
 *   - gameplay-predicates.ts (has_item, has_equipped, energy, health, etc.)
 *   - helper-predicates.ts (is_weapon_type, is_tool_type, cefr_gte, skill_gte)
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface PrerequisiteDefinition {
  actionId: string;
  prerequisites: string[];
  inheritsFromParent: boolean;
}

// ── Combat Prerequisites ────────────────────────────────────────────────────

const COMBAT_PREREQUISITES: Record<string, PrerequisiteDefinition> = {
  // Base combat action — requires energy, proximity, and living target
  attack_enemy: {
    actionId: 'attack_enemy',
    prerequisites: [
      'energy(Actor, E, _), E >= 10',
      'near(Actor, Target, 3)',
      'alive(Target)',
    ],
    inheritsFromParent: false,
  },

  // Sword attacks — inherit from attack_enemy + require sword equipped
  sword_attack: {
    actionId: 'sword_attack',
    prerequisites: [
      'has_equipped(Actor, weapon, W), is_weapon_type(W, sword)',
    ],
    inheritsFromParent: true,
  },
  sword_combo: {
    actionId: 'sword_combo',
    prerequisites: [
      'has_equipped(Actor, weapon, W), is_weapon_type(W, sword)',
    ],
    inheritsFromParent: true,
  },
  sword_dash: {
    actionId: 'sword_dash',
    prerequisites: [
      'has_equipped(Actor, weapon, W), is_weapon_type(W, sword)',
    ],
    inheritsFromParent: true,
  },

  // Unarmed attacks — inherit from attack_enemy, no weapon required
  punch: {
    actionId: 'punch',
    prerequisites: [],
    inheritsFromParent: true,
  },
  punch_heavy: {
    actionId: 'punch_heavy',
    prerequisites: [],
    inheritsFromParent: true,
  },
  melee_hook: {
    actionId: 'melee_hook',
    prerequisites: [],
    inheritsFromParent: true,
  },

  // Shield attacks — inherit from attack_enemy + require shield
  shield_bash: {
    actionId: 'shield_bash',
    prerequisites: [
      'has_equipped(Actor, shield, _)',
    ],
    inheritsFromParent: true,
  },
  shield_dash: {
    actionId: 'shield_dash',
    prerequisites: [
      'has_equipped(Actor, shield, _)',
    ],
    inheritsFromParent: true,
  },

  // Ranged attacks
  pistol_shoot: {
    actionId: 'pistol_shoot',
    prerequisites: [
      'has_equipped(Actor, weapon, W), is_weapon_type(W, pistol)',
    ],
    inheritsFromParent: true,
  },
  throw_projectile: {
    actionId: 'throw_projectile',
    prerequisites: [
      'has_item(Actor, projectile, _)',
    ],
    inheritsFromParent: true,
  },

  // Defense actions — require appropriate equipment
  defend: {
    actionId: 'defend',
    prerequisites: [
      'has_equipped(Actor, shield, _)',
    ],
    inheritsFromParent: false,
  },
  shield_block: {
    actionId: 'shield_block',
    prerequisites: [
      'has_equipped(Actor, shield, _)',
    ],
    inheritsFromParent: false,
  },
  sword_block: {
    actionId: 'sword_block',
    prerequisites: [
      'has_equipped(Actor, weapon, W), is_weapon_type(W, sword)',
    ],
    inheritsFromParent: false,
  },

  // Magic actions — require energy and magic ability
  cast_spell: {
    actionId: 'cast_spell',
    prerequisites: [
      'energy(Actor, E, _), E >= 20',
      'has_ability(Actor, magic)',
    ],
    inheritsFromParent: false,
  },
  spell_channel: {
    actionId: 'spell_channel',
    prerequisites: [
      'energy(Actor, E, _), E >= 20',
      'has_ability(Actor, magic)',
    ],
    inheritsFromParent: false,
  },

  // Animation-only combat actions — no additional prerequisites
  react: {
    actionId: 'react',
    prerequisites: [],
    inheritsFromParent: true,
  },
  die: {
    actionId: 'die',
    prerequisites: [],
    inheritsFromParent: true,
  },
  hit_head: {
    actionId: 'hit_head',
    prerequisites: [],
    inheritsFromParent: true,
  },
  hit_reaction: {
    actionId: 'hit_reaction',
    prerequisites: [],
    inheritsFromParent: true,
  },
  knockback: {
    actionId: 'knockback',
    prerequisites: [],
    inheritsFromParent: true,
  },
  sword_idle: {
    actionId: 'sword_idle',
    prerequisites: [],
    inheritsFromParent: true,
  },
  pistol_aim: {
    actionId: 'pistol_aim',
    prerequisites: [],
    inheritsFromParent: true,
  },
  pistol_reload: {
    actionId: 'pistol_reload',
    prerequisites: [],
    inheritsFromParent: true,
  },
  zombie_attack: {
    actionId: 'zombie_attack',
    prerequisites: [],
    inheritsFromParent: true,
  },
  zombie_idle: {
    actionId: 'zombie_idle',
    prerequisites: [],
    inheritsFromParent: true,
  },
  zombie_walk: {
    actionId: 'zombie_walk',
    prerequisites: [],
    inheritsFromParent: true,
  },
};

// ── Combined Export ──────────────────────────────────────────────────────────

export const ACTION_PREREQUISITES: Record<string, PrerequisiteDefinition> = {
  ...COMBAT_PREREQUISITES,
};
