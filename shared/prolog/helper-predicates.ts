/**
 * Helper Predicates for Prolog KB
 *
 * Base Prolog helper rules that action prerequisites can reference.
 * Loaded into GamePrologEngine at initialization before action definitions.
 *
 * Includes:
 *   - CEFR level comparison (cefr_gte/2)
 *   - Weapon/tool type classification (is_weapon_type/2, is_tool_type/2)
 *   - Skill tier naming and comparison (skill_tier_name/2, skill_gte/3)
 */

export const HELPER_PREDICATES_PROLOG = `
% ═══════════════════════════════════════════════════════════════════════════
% Helper Predicates — base rules for action prerequisite evaluation
% ═══════════════════════════════════════════════════════════════════════════

% ── CEFR Level Comparison ─────────────────────────────────────────────────
% Maps CEFR language proficiency levels to integer ranks for comparison.
% Usage: cefr_gte(ActualLevel, RequiredLevel) succeeds if ActualLevel >= RequiredLevel

cefr_level_rank(a1, 1).
cefr_level_rank(a2, 2).
cefr_level_rank(b1, 3).
cefr_level_rank(b2, 4).
cefr_level_rank(c1, 5).
cefr_level_rank(c2, 6).

cefr_gte(Actual, Required) :-
  cefr_level_rank(Actual, AR),
  cefr_level_rank(Required, RR),
  AR >= RR.

% ── Weapon Type Classification ────────────────────────────────────────────
% Checks if an item is a weapon of a given type.
% Requires item_type/2 facts to be asserted for items in the KB.

:- dynamic(item_type/2).

is_weapon_type(ItemId, sword) :- item_type(ItemId, sword).
is_weapon_type(ItemId, axe) :- item_type(ItemId, axe).
is_weapon_type(ItemId, bow) :- item_type(ItemId, bow).
is_weapon_type(ItemId, staff) :- item_type(ItemId, staff).
is_weapon_type(ItemId, pistol) :- item_type(ItemId, pistol).

% ── Tool Type Classification ──────────────────────────────────────────────
% Checks if an item is a tool of a given type.

is_tool_type(ItemId, fishing_rod) :- item_type(ItemId, fishing_rod).
is_tool_type(ItemId, pickaxe) :- item_type(ItemId, pickaxe).
is_tool_type(ItemId, axe) :- item_type(ItemId, axe).
is_tool_type(ItemId, hoe) :- item_type(ItemId, hoe).

% ── Skill Tier Names ──────────────────────────────────────────────────────
% Maps integer skill levels to human-readable tier names.

skill_tier_name(1, novice).
skill_tier_name(2, novice).
skill_tier_name(3, apprentice).
skill_tier_name(4, apprentice).
skill_tier_name(5, journeyman).
skill_tier_name(6, journeyman).
skill_tier_name(7, expert).
skill_tier_name(8, expert).
skill_tier_name(9, expert).
skill_tier_name(10, master).

% ── Skill Level Comparison ────────────────────────────────────────────────
% Succeeds if Actor has Skill at Level >= MinLevel.

skill_gte(Actor, Skill, MinLevel) :-
  has_skill(Actor, Skill, Level),
  Level >= MinLevel.
`.trim();
