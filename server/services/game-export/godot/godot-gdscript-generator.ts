/**
 * Godot GDScript Generator
 *
 * Loads GDScript template files from `templates/scripts/` and performs
 * {{TOKEN}} substitution for world-specific values. Static scripts are
 * copied as-is; dynamic scripts receive a substitution map built from
 * the WorldIR. Conditional scripts (crafting, resources, survival) are
 * included only when the genre enables the relevant feature.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './godot-project-generator';
import { loadStaticTemplate, loadTemplate, type TokenMap } from './godot-template-loader';

// ─────────────────────────────────────────────
// Core scripts (fully static)
// ─────────────────────────────────────────────

function genCoreScripts(): GeneratedFile[] {
  return [
    { path: 'scripts/core/game_manager.gd', content: loadStaticTemplate('scripts/core/game_manager.gd') },
    { path: 'scripts/core/data_loader.gd',  content: loadStaticTemplate('scripts/core/data_loader.gd') },
  ];
}

// ─────────────────────────────────────────────
// Character scripts
// ─────────────────────────────────────────────

function genCharacterScripts(ir: WorldIR): GeneratedFile[] {
  const p = ir.player;
  const playerTokens: TokenMap = {
    PLAYER_SPEED:          p.speed,
    PLAYER_JUMP_HEIGHT:    p.jumpHeight,
    PLAYER_GRAVITY:        p.gravity,
    PLAYER_INITIAL_HEALTH: p.initialHealth,
    PLAYER_INITIAL_ENERGY: p.initialEnergy,
    PLAYER_INITIAL_GOLD:   p.initialGold,
  };

  return [
    { path: 'scripts/characters/player_controller.gd', content: loadTemplate('scripts/characters/player_controller.gd', playerTokens) },
    { path: 'scripts/characters/npc_controller.gd',    content: loadStaticTemplate('scripts/characters/npc_controller.gd') },
    { path: 'scripts/characters/npc_spawner.gd',       content: loadStaticTemplate('scripts/characters/npc_spawner.gd') },
  ];
}

// ─────────────────────────────────────────────
// System scripts
// ─────────────────────────────────────────────

function genSystemScripts(ir: WorldIR): GeneratedFile[] {
  const cs = ir.combat.settings;
  const combatTokens: TokenMap = {
    COMBAT_STYLE:               ir.combat.style,
    COMBAT_BASE_DAMAGE:         cs.baseDamage,
    COMBAT_CRITICAL_CHANCE:     cs.criticalChance,
    COMBAT_CRITICAL_MULTIPLIER: cs.criticalMultiplier,
    COMBAT_BLOCK_REDUCTION:     cs.blockReduction,
    COMBAT_DODGE_CHANCE:        cs.dodgeChance,
    COMBAT_ATTACK_COOLDOWN:     cs.attackCooldown / 1000.0,
  };

  const files: GeneratedFile[] = [
    { path: 'scripts/systems/action_system.gd',    content: loadStaticTemplate('scripts/systems/action_system.gd') },
    { path: 'scripts/systems/rule_enforcer.gd',    content: loadStaticTemplate('scripts/systems/rule_enforcer.gd') },
    { path: 'scripts/systems/combat_system.gd',    content: loadTemplate('scripts/systems/combat_system.gd', combatTokens) },
    { path: 'scripts/systems/quest_system.gd',     content: loadStaticTemplate('scripts/systems/quest_system.gd') },
    { path: 'scripts/systems/inventory_system.gd', content: loadStaticTemplate('scripts/systems/inventory_system.gd') },
    { path: 'scripts/systems/dialogue_system.gd',  content: loadStaticTemplate('scripts/systems/dialogue_system.gd') },
  ];

  const genre = ir.meta.genreConfig;
  if (genre.features.crafting) {
    files.push({ path: 'scripts/systems/crafting_system.gd', content: loadStaticTemplate('scripts/systems/crafting_system.gd') });
  }
  if (genre.features.resources) {
    files.push({ path: 'scripts/systems/resource_system.gd', content: loadStaticTemplate('scripts/systems/resource_system.gd') });
  }
  if (ir.survival != null) {
    files.push({ path: 'scripts/systems/survival_system.gd', content: loadStaticTemplate('scripts/systems/survival_system.gd') });
  }

  return files;
}

// ─────────────────────────────────────────────
// World generator scripts
// ─────────────────────────────────────────────

function genWorldScripts(ir: WorldIR): GeneratedFile[] {
  const theme = ir.theme.visualTheme;

  const worldScaleTokens: TokenMap = {
    TERRAIN_SIZE:   ir.geography.terrainSize,
    GROUND_COLOR_R: theme.groundColor.r,
    GROUND_COLOR_G: theme.groundColor.g,
    GROUND_COLOR_B: theme.groundColor.b,
    SKY_COLOR_R:    theme.skyColor.r,
    SKY_COLOR_G:    theme.skyColor.g,
    SKY_COLOR_B:    theme.skyColor.b,
  };

  const buildingTokens: TokenMap = {
    BASE_COLOR_R: theme.settlementBaseColor.r,
    BASE_COLOR_G: theme.settlementBaseColor.g,
    BASE_COLOR_B: theme.settlementBaseColor.b,
    ROOF_COLOR_R: theme.settlementRoofColor.r,
    ROOF_COLOR_G: theme.settlementRoofColor.g,
    ROOF_COLOR_B: theme.settlementRoofColor.b,
  };

  const roadTokens: TokenMap = {
    ROAD_COLOR_R: theme.roadColor.r,
    ROAD_COLOR_G: theme.roadColor.g,
    ROAD_COLOR_B: theme.roadColor.b,
    ROAD_WIDTH:   theme.roadRadius * 2,
  };

  return [
    { path: 'scripts/world/world_scale_manager.gd', content: loadTemplate('scripts/world/world_scale_manager.gd', worldScaleTokens) },
    { path: 'scripts/world/building_generator.gd',  content: loadTemplate('scripts/world/building_generator.gd', buildingTokens) },
    { path: 'scripts/world/road_generator.gd',      content: loadTemplate('scripts/world/road_generator.gd', roadTokens) },
    { path: 'scripts/world/nature_generator.gd',    content: loadStaticTemplate('scripts/world/nature_generator.gd') },
    { path: 'scripts/world/dungeon_generator.gd',   content: loadStaticTemplate('scripts/world/dungeon_generator.gd') },
  ];
}

// ─────────────────────────────────────────────
// UI scripts (fully static)
// ─────────────────────────────────────────────

function genUIScripts(): GeneratedFile[] {
  return [
    { path: 'scripts/ui/hud.gd',             content: loadStaticTemplate('scripts/ui/hud.gd') },
    { path: 'scripts/ui/quest_tracker_ui.gd', content: loadStaticTemplate('scripts/ui/quest_tracker_ui.gd') },
    { path: 'scripts/ui/game_menu.gd',        content: loadStaticTemplate('scripts/ui/game_menu.gd') },
    { path: 'scripts/ui/chat_panel.gd',       content: loadStaticTemplate('scripts/ui/chat_panel.gd') },
  ];
}

// ─────────────────────────────────────────────
// Service scripts
// ─────────────────────────────────────────────

function genServiceScripts(): GeneratedFile[] {
  return [
    { path: 'scripts/services/ai_service.gd', content: loadStaticTemplate('scripts/services/ai_service.gd') },
  ];
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateGDScriptFiles(ir: WorldIR): GeneratedFile[] {
  return [
    ...genCoreScripts(),
    ...genCharacterScripts(ir),
    ...genSystemScripts(ir),
    ...genWorldScripts(ir),
    ...genUIScripts(),
    ...genServiceScripts(),
  ];
}
