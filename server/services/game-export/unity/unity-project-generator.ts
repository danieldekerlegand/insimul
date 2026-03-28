/**
 * Unity Project Generator
 *
 * Generates the Unity project scaffolding: Packages/manifest.json,
 * ProjectSettings, assembly definition, and README — all loaded from
 * `templates/project/`. Static files are copied as-is; ProjectSettings.asset
 * and README.md receive {{TOKEN}} substitution from the WorldIR.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import { loadStaticTemplate, loadTemplate } from './unity-template-loader';

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface UnityProjectOptions {
  /** Unity editor version string, e.g. "6000.0.38f1" or "2022.3.18f1". */
  unityVersion?: string;
}

/** Default Unity version — Unity 6 LTS */
const DEFAULT_UNITY_VERSION = '6000.0.38f1';

function sanitiseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '');
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateProjectFiles(ir: WorldIR, options?: UnityProjectOptions): GeneratedFile[] {
  const g = ir.meta.genreConfig;
  const unityVersion = options?.unityVersion || DEFAULT_UNITY_VERSION;

  const projectTokens = {
    WORLD_SAFE_NAME: sanitiseName(ir.meta.worldName),
    UNITY_VERSION: unityVersion,
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
    { path: 'ProjectSettings/ProjectVersion.txt',          content: `m_EditorVersion: ${unityVersion}\n` },
    { path: 'Packages/manifest.json',                      content: loadStaticTemplate('project/manifest.json') },
    { path: 'ProjectSettings/ProjectSettings.asset',       content: loadTemplate('project/ProjectSettings.asset', projectTokens) },
    { path: 'ProjectSettings/InputManager.asset',          content: loadStaticTemplate('project/InputManager.asset') },
    { path: 'ProjectSettings/TagManager.asset',            content: loadStaticTemplate('project/TagManager.asset') },
    { path: 'ProjectSettings/QualitySettings.asset',       content: loadStaticTemplate('project/QualitySettings.asset') },
    { path: 'ProjectSettings/EditorSettings.asset',        content: loadStaticTemplate('project/EditorSettings.asset') },
    { path: 'ProjectSettings/EditorBuildSettings.asset',   content: loadStaticTemplate('project/EditorBuildSettings.asset') },
    { path: 'Assets/Scripts/Insimul.asmdef',               content: loadStaticTemplate('project/Insimul.asmdef') },
    { path: '.gitignore',                                  content: loadStaticTemplate('project/.gitignore') },
    { path: 'README.md',                                   content: loadTemplate('project/README.md', readmeTokens) },
  ];
}
