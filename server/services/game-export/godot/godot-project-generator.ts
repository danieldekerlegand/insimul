/**
 * Godot Project Generator
 *
 * Generates the Godot 4.x project scaffolding: project.godot,
 * export_presets.cfg, .gitignore, default_bus_layout.tres, icon.svg,
 * and README.md — all loaded from `templates/project/`.
 *
 * Static files are copied as-is. project.godot and README.md receive
 * {{TOKEN}} substitution from the WorldIR.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import { loadStaticTemplate, loadTemplate } from './godot-template-loader';

export interface GeneratedFile {
  path: string;
  content: string;
}

function sanitiseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateProjectFiles(ir: WorldIR): GeneratedFile[] {
  const g = ir.meta.genreConfig;

  const projectTokens = {
    WORLD_SAFE_NAME:  sanitiseName(ir.meta.worldName),
    WORLD_NAME:       ir.meta.worldName,
    WORLD_TYPE:       ir.meta.worldType || 'default',
    INSIMUL_VERSION:  ir.meta.insimulVersion,
  };

  const readmeTokens = {
    WORLD_NAME:       ir.meta.worldName,
    WORLD_TYPE:       ir.meta.worldType || 'default',
    GENRE_NAME:       g.name,
    GENRE_ID:         g.id,
    TERRAIN_SIZE:     ir.geography.terrainSize,
    COUNTRY_COUNT:    ir.geography.countries.length,
    STATE_COUNT:      ir.geography.states.length,
    SETTLEMENT_COUNT: ir.geography.settlements.length,
    CHARACTER_COUNT:  ir.entities.characters.length,
    NPC_COUNT:        ir.entities.npcs.length,
    BUILDING_COUNT:   ir.entities.buildings.length,
    ROAD_COUNT:       ir.entities.roads.length,
    RULE_COUNT:       ir.systems.rules.length,
    ACTION_COUNT:     ir.systems.actions.length,
    QUEST_COUNT:      ir.systems.quests.length,
    EXPORT_TIMESTAMP: ir.meta.exportTimestamp,
    INSIMUL_VERSION:  ir.meta.insimulVersion,
  };

  return [
    { path: 'project.godot',            content: loadTemplate('project/project.godot', projectTokens) },
    { path: 'export_presets.cfg',       content: loadTemplate('project/export_presets.cfg', { WORLD_SAFE_NAME: sanitiseName(ir.meta.worldName) }) },
    { path: 'default_bus_layout.tres',  content: loadStaticTemplate('project/default_bus_layout.tres') },
    { path: 'icon.svg',                 content: loadStaticTemplate('project/icon.svg') },
    { path: '.gitignore',               content: loadStaticTemplate('project/.gitignore') },
    { path: '.gitattributes',           content: loadStaticTemplate('project/.gitattributes') },
    { path: 'README.md',                content: loadTemplate('project/README.md', readmeTokens) },
  ];
}
