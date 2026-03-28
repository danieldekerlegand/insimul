/**
 * Unreal Project Generator
 *
 * Generates the UE5 project scaffolding: .uproject file, Build.cs,
 * Config INI files, and README.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import { loadStaticTemplate, loadTemplate } from './unreal-template-loader';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface GeneratedFile {
  path: string;    // Relative path within export directory
  content: string; // File content
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function sanitiseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '');
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateProjectFiles(ir: WorldIR): GeneratedFile[] {
  const M = 'InsimulExport';

  const readmeTokens = {
    WORLD_NAME:       ir.meta.worldName,
    WORLD_TYPE:       ir.meta.worldType || 'default',
    GENRE_NAME:       ir.meta.genreConfig.name,
    GENRE_ID:         ir.meta.genreConfig.id,
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
    INSIMUL_VERSION:  ir.meta.insimulVersion,
    EXPORT_TIMESTAMP: ir.meta.exportTimestamp,
  };

  const gameIniTokens = {
    WORLD_NAME:   ir.meta.worldName,
    WORLD_TYPE:   ir.meta.worldType || 'default',
    GENRE_ID:     ir.meta.genreConfig.id,
    SEED:         ir.meta.seed,
    TERRAIN_SIZE: ir.geography.terrainSize,
  };

  return [
    { path: `${M}.uproject`,                  content: loadStaticTemplate('project/InsimulExport.uproject') },
    { path: `Source/${M}.Target.cs`,           content: loadStaticTemplate('project/Target.cs') },
    { path: `Source/${M}Editor.Target.cs`,     content: loadStaticTemplate('project/EditorTarget.cs') },
    { path: `Source/${M}/${M}.Build.cs`,       content: loadStaticTemplate('project/Build.cs') },
    { path: `Source/${M}/${M}.h`,              content: loadStaticTemplate('project/Module.h') },
    { path: `Source/${M}/${M}.cpp`,            content: loadStaticTemplate('project/Module.cpp') },
    { path: 'Config/DefaultEngine.ini',        content: loadStaticTemplate('project/DefaultEngine.ini') },
    { path: 'Config/DefaultGame.ini',          content: loadTemplate('project/DefaultGame.ini', gameIniTokens) },
    { path: 'Config/DefaultInput.ini',         content: loadStaticTemplate('project/DefaultInput.ini') },
    { path: 'README.md',                       content: loadTemplate('project/README.md', readmeTokens) },
    { path: 'setup.sh',                        content: loadStaticTemplate('project/setup.sh') },
    { path: 'setup.bat',                       content: loadStaticTemplate('project/setup.bat') },
    { path: 'Setup.command',                   content: loadStaticTemplate('project/Setup.command') },
  ];
}
