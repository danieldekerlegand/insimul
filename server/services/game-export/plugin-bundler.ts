/**
 * Plugin Bundler — Bundles Insimul conversation plugins into exported game projects.
 *
 * Reads plugin source files from packages/ and generates engine-specific
 * configuration with character-to-NPC mappings and service URLs.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { WorldIR, CharacterIR, NPCIR, AIConfigIR } from '@shared/game-engine/ir-types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGES_DIR = join(__dirname, '..', '..', '..', 'packages');

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface PluginFile {
  path: string;
  content: string;
}

export interface CharacterMapping {
  characterId: string;
  characterName: string;
  npcRole: string;
}

export interface InsimulPluginConfig {
  serverUrl: string;
  wsUrl: string;
  worldId: string;
  apiKey: string;
  characterMappings: CharacterMapping[];
  aiConfig: AIConfigIR | null;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function buildCharacterMappings(ir: WorldIR): CharacterMapping[] {
  const characters = ir.entities.characters;
  const npcs = ir.entities.npcs;
  const mappings: CharacterMapping[] = [];

  for (const npc of npcs) {
    const character = characters.find(c => c.id === npc.characterId);
    if (character) {
      mappings.push({
        characterId: character.id,
        characterName: `${character.firstName} ${character.lastName}`.trim(),
        npcRole: npc.role,
      });
    }
  }

  return mappings;
}

function buildPluginConfig(ir: WorldIR): InsimulPluginConfig {
  const serverUrl = process.env.INSIMUL_SERVER_URL || 'http://localhost:5000';
  const wsUrl = process.env.INSIMUL_WS_URL || 'ws://localhost:50052';
  const apiKey = process.env.INSIMUL_API_KEY || '';

  return {
    serverUrl,
    wsUrl,
    worldId: ir.meta.worldId,
    apiKey,
    characterMappings: buildCharacterMappings(ir),
    aiConfig: ir.aiConfig || null,
  };
}

/**
 * Recursively read all files from a directory, returning relative paths.
 */
function readDirRecursive(baseDir: string, relPrefix: string = ''): PluginFile[] {
  const files: PluginFile[] = [];
  if (!existsSync(baseDir)) return files;

  const entries = readdirSync(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    const absPath = join(baseDir, entry.name);
    const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...readDirRecursive(absPath, relPath));
    } else if (entry.isFile()) {
      files.push({ path: relPath, content: readFileSync(absPath, 'utf8') });
    }
  }
  return files;
}

// ─────────────────────────────────────────────
// Babylon.js SDK bundling
// ─────────────────────────────────────────────

export function bundleBabylonPlugin(ir: WorldIR): PluginFile[] {
  const config = buildPluginConfig(ir);
  const sdkDir = join(PACKAGES_DIR, 'insimul-sdk-js', 'src');
  const files: PluginFile[] = [];

  // Copy SDK source files
  const sdkFiles = readDirRecursive(sdkDir);
  for (const f of sdkFiles) {
    files.push({ path: `src/insimul-sdk/${f.path}`, content: f.content });
  }

  // Generate configuration module
  files.push({
    path: 'src/insimul-sdk/insimul-config.ts',
    content: generateBabylonConfig(config),
  });

  console.log(`[Export] Babylon.js SDK bundled: ${files.length} files, ${config.characterMappings.length} character mappings`);
  return files;
}

function generateBabylonConfig(config: InsimulPluginConfig): string {
  return `/**
 * Insimul SDK Configuration — auto-generated during export.
 * Provides server connection details, character-to-NPC mappings, and AI config.
 */

export const INSIMUL_CONFIG = {
  serverUrl: ${JSON.stringify(config.serverUrl)},
  wsUrl: ${JSON.stringify(config.wsUrl)},
  worldId: ${JSON.stringify(config.worldId)},
  apiKey: ${JSON.stringify(config.apiKey)},
} as const;

export interface AIConfig {
  apiMode: 'insimul' | 'gemini';
  insimulEndpoint: string;
  geminiModel: string;
  geminiApiKeyPlaceholder: string;
  voiceEnabled: boolean;
  defaultVoice: string;
}

export const AI_CONFIG: AIConfig = ${JSON.stringify(config.aiConfig || {
  apiMode: 'insimul',
  insimulEndpoint: '/api/gemini/chat',
  geminiModel: 'gemini-2.5-flash',
  geminiApiKeyPlaceholder: 'YOUR_GEMINI_API_KEY',
  voiceEnabled: true,
  defaultVoice: 'Kore',
}, null, 2)};

export interface CharacterMapping {
  characterId: string;
  characterName: string;
  npcRole: string;
}

export const CHARACTER_MAPPINGS: CharacterMapping[] = ${JSON.stringify(config.characterMappings, null, 2)};

/**
 * Look up an Insimul character ID by game NPC name.
 */
export function getCharacterIdByName(name: string): string | undefined {
  return CHARACTER_MAPPINGS.find(m => m.characterName === name)?.characterId;
}

/**
 * Look up an Insimul character ID by NPC role.
 */
export function getCharacterIdsByRole(role: string): string[] {
  return CHARACTER_MAPPINGS.filter(m => m.npcRole === role).map(m => m.characterId);
}
`;
}

// ─────────────────────────────────────────────
// Unity plugin bundling
// ─────────────────────────────────────────────

export function bundleUnityPlugin(ir: WorldIR): PluginFile[] {
  const config = buildPluginConfig(ir);
  const pluginDir = join(PACKAGES_DIR, 'insimul-plugin-unity');
  const files: PluginFile[] = [];

  // Copy Runtime/ source files
  const runtimeDir = join(pluginDir, 'Runtime');
  const runtimeFiles = readDirRecursive(runtimeDir);
  for (const f of runtimeFiles) {
    files.push({ path: `Assets/Plugins/Insimul/Runtime/${f.path}`, content: f.content });
  }

  // Copy Editor/ source files if present
  const editorDir = join(pluginDir, 'Editor');
  const editorFiles = readDirRecursive(editorDir);
  for (const f of editorFiles) {
    files.push({ path: `Assets/Plugins/Insimul/Editor/${f.path}`, content: f.content });
  }

  // Copy package.json for UPM
  const pkgJsonPath = join(pluginDir, 'package.json');
  if (existsSync(pkgJsonPath)) {
    files.push({ path: `Assets/Plugins/Insimul/package.json`, content: readFileSync(pkgJsonPath, 'utf8') });
  }

  // Generate configuration ScriptableObject-style C# file
  files.push({
    path: 'Assets/Plugins/Insimul/Runtime/InsimulExportConfig.cs',
    content: generateUnityConfig(config),
  });

  console.log(`[Export] Unity plugin bundled: ${files.length} files, ${config.characterMappings.length} character mappings`);
  return files;
}

function generateUnityConfig(config: InsimulPluginConfig): string {
  const mappingEntries = config.characterMappings
    .map(m => `            new CharacterMapping { characterId = ${JSON.stringify(m.characterId)}, characterName = ${JSON.stringify(m.characterName)}, npcRole = ${JSON.stringify(m.npcRole)} }`)
    .join(',\n');

  return `// Auto-generated by Insimul export pipeline — do not edit manually.
using System.Collections.Generic;

namespace Insimul
{
    /// <summary>
    /// Pre-configured connection and character mapping for this exported world.
    /// </summary>
    public static class InsimulExportConfig
    {
        public const string ServerUrl = ${JSON.stringify(config.serverUrl)};
        public const string WsUrl = ${JSON.stringify(config.wsUrl)};
        public const string WorldId = ${JSON.stringify(config.worldId)};
        public const string ApiKey = ${JSON.stringify(config.apiKey)};

        public static readonly List<CharacterMapping> CharacterMappings = new List<CharacterMapping>
        {
${mappingEntries}
        };

        public static string GetCharacterIdByName(string name)
        {
            var mapping = CharacterMappings.Find(m => m.characterName == name);
            return mapping?.characterId;
        }
    }

    [System.Serializable]
    public class CharacterMapping
    {
        public string characterId;
        public string characterName;
        public string npcRole;
    }
}
`;
}

// ─────────────────────────────────────────────
// Godot plugin bundling
// ─────────────────────────────────────────────

export function bundleGodotPlugin(ir: WorldIR): PluginFile[] {
  const config = buildPluginConfig(ir);
  const pluginDir = join(PACKAGES_DIR, 'insimul-plugin-godot', 'addons', 'insimul');
  const files: PluginFile[] = [];

  // Copy addon files
  const addonFiles = readDirRecursive(pluginDir);
  for (const f of addonFiles) {
    files.push({ path: `addons/insimul/${f.path}`, content: f.content });
  }

  // Generate autoload configuration script
  files.push({
    path: 'addons/insimul/insimul_export_config.gd',
    content: generateGodotConfig(config),
  });

  console.log(`[Export] Godot plugin bundled: ${files.length} files, ${config.characterMappings.length} character mappings`);
  return files;
}

function generateGodotConfig(config: InsimulPluginConfig): string {
  const mappingEntries = config.characterMappings
    .map(m => `\t{ "character_id": ${JSON.stringify(m.characterId)}, "character_name": ${JSON.stringify(m.characterName)}, "npc_role": ${JSON.stringify(m.npcRole)} }`)
    .join(',\n');

  return `# Auto-generated by Insimul export pipeline — do not edit manually.
class_name InsimulExportConfig
extends RefCounted

const SERVER_URL: String = ${JSON.stringify(config.serverUrl)}
const WS_URL: String = ${JSON.stringify(config.wsUrl)}
const WORLD_ID: String = ${JSON.stringify(config.worldId)}
const API_KEY: String = ${JSON.stringify(config.apiKey)}

const CHARACTER_MAPPINGS: Array[Dictionary] = [
${mappingEntries}
]

static func get_character_id_by_name(character_name: String) -> String:
\tfor mapping in CHARACTER_MAPPINGS:
\t\tif mapping["character_name"] == character_name:
\t\t\treturn mapping["character_id"]
\treturn ""

static func get_character_ids_by_role(role: String) -> Array[String]:
\tvar result: Array[String] = []
\tfor mapping in CHARACTER_MAPPINGS:
\t\tif mapping["npc_role"] == role:
\t\t\tresult.append(mapping["character_id"])
\treturn result
`;
}

// ─────────────────────────────────────────────
// Unreal plugin bundling
// ─────────────────────────────────────────────

export function bundleUnrealPlugin(ir: WorldIR): PluginFile[] {
  const config = buildPluginConfig(ir);
  const pluginDir = join(PACKAGES_DIR, 'insimul-plugin-unreal');
  const files: PluginFile[] = [];

  // Copy Source/ files
  const sourceDir = join(pluginDir, 'Source');
  const sourceFiles = readDirRecursive(sourceDir);
  for (const f of sourceFiles) {
    files.push({ path: `Plugins/Insimul/Source/${f.path}`, content: f.content });
  }

  // Copy .uplugin
  const upluginPath = join(pluginDir, 'Insimul.uplugin');
  if (existsSync(upluginPath)) {
    files.push({ path: 'Plugins/Insimul/Insimul.uplugin', content: readFileSync(upluginPath, 'utf8') });
  }

  // Generate DefaultGame.ini section for character mappings
  files.push({
    path: 'Plugins/Insimul/Config/InsimulConfig.ini',
    content: generateUnrealConfig(config),
  });

  // Generate C++ config header
  files.push({
    path: 'Plugins/Insimul/Source/Insimul/Public/InsimulExportConfig.h',
    content: generateUnrealConfigHeader(config),
  });

  console.log(`[Export] Unreal plugin bundled: ${files.length} files, ${config.characterMappings.length} character mappings`);
  return files;
}

function generateUnrealConfig(config: InsimulPluginConfig): string {
  let ini = `; Auto-generated by Insimul export pipeline — do not edit manually.
[/Script/Insimul.InsimulSettings]
ServerUrl=${config.serverUrl}
WsUrl=${config.wsUrl}
WorldId=${config.worldId}
ApiKey=${config.apiKey}
`;

  for (let i = 0; i < config.characterMappings.length; i++) {
    const m = config.characterMappings[i];
    ini += `+CharacterMappings=(CharacterId="${m.characterId}",CharacterName="${m.characterName}",NpcRole="${m.npcRole}")\n`;
  }

  return ini;
}

function generateUnrealConfigHeader(config: InsimulPluginConfig): string {
  return `// Auto-generated by Insimul export pipeline — do not edit manually.
#pragma once

#include "CoreMinimal.h"

/**
 * Pre-configured connection settings and character mappings for this exported world.
 * Use UInsimulSubsystem to connect at runtime, or read these defaults directly.
 */
namespace InsimulExportConfig
{
    inline const FString ServerUrl = TEXT(${JSON.stringify(config.serverUrl)});
    inline const FString WsUrl = TEXT(${JSON.stringify(config.wsUrl)});
    inline const FString WorldId = TEXT(${JSON.stringify(config.worldId)});
    inline const FString ApiKey = TEXT(${JSON.stringify(config.apiKey)});

    struct FCharacterMapping
    {
        FString CharacterId;
        FString CharacterName;
        FString NpcRole;
    };

    inline const TArray<FCharacterMapping> CharacterMappings = {
${config.characterMappings.map(m => `        { TEXT(${JSON.stringify(m.characterId)}), TEXT(${JSON.stringify(m.characterName)}), TEXT(${JSON.stringify(m.npcRole)}) }`).join(',\n')}
    };
}
`;
}
