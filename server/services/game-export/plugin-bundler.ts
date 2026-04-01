/**
 * Plugin Bundler — Bundles Insimul conversation plugins into exported game projects.
 *
 * Reads plugin source files from packages/ and generates engine-specific
 * configuration with character-to-NPC mappings and service URLs.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { WorldIR, CharacterIR, NPCIR, AIConfigIR, ModelPackIR } from '@shared/game-engine/ir-types';

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

export interface AIModelPaths {
  llm?: string;
  voices?: Record<string, string>;
  stt?: string;
}

export interface AIProviderConfig {
  /** Which AI provider the exported game should use */
  provider: 'cloud' | 'local';
  /** Path prefix where model files are placed in the export */
  modelBasePath: string;
  /** Model pack details (null when provider is 'cloud') */
  modelPack: ModelPackIR | null;
  /** Explicit model paths for Godot exports (res:// prefixed) */
  aiModelPaths?: AIModelPaths;
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

function buildPluginConfig(ir: WorldIR, aiModelPaths?: AIModelPaths, modelPack?: ModelPackIR | null): InsimulPluginConfig {
  const serverUrl = process.env.INSIMUL_SERVER_URL || 'http://localhost:8080';
  const wsUrl = process.env.INSIMUL_WS_URL || 'ws://localhost:8080';
  const apiKey = process.env.INSIMUL_API_KEY || '';
  const hasLocalModels = aiModelPaths != null || modelPack?.enabled === true;

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

export function bundleBabylonPlugin(ir: WorldIR, modelPack?: ModelPackIR | null): PluginFile[] {
  const config = buildPluginConfig(ir, undefined, modelPack);
  const sdkDir = join(PACKAGES_DIR, 'typescript', 'src');
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
  aiProvider: ${JSON.stringify(config.aiConfig?.apiMode ?? 'cloud')},
  aiModelBasePath: ${JSON.stringify(config.aiConfig?.localModelPath ?? '')},
} as const;

export interface AIConfig {
  apiMode: 'insimul' | 'gemini' | 'local';
  insimulEndpoint: string;
  geminiModel: string;
  geminiApiKeyPlaceholder: string;
  voiceEnabled: boolean;
  defaultVoice: string;
  localModelPath?: string;
  localModelName?: string;
}

export const AI_CONFIG: AIConfig = ${JSON.stringify(config.aiConfig || {
  apiMode: 'insimul',
  insimulEndpoint: '/api/gemini/chat',
  geminiModel: 'gemini-3.1-flash',
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

export function bundleUnityPlugin(ir: WorldIR, modelPack?: ModelPackIR | null): PluginFile[] {
  const config = buildPluginConfig(ir, undefined, modelPack);
  const pluginDir = join(PACKAGES_DIR, 'unity');
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
  const isLocal = config.aiConfig?.apiMode === 'local';
  const chatProvider = isLocal ? 'InsimulChatProvider.Local' : 'InsimulChatProvider.Server';
  const ttsProvider = isLocal ? 'InsimulTTSProvider.Local' : 'InsimulTTSProvider.Server';

  const mappingEntries = config.characterMappings
    .map(m => `            new CharacterMapping { characterId = ${JSON.stringify(m.characterId)}, characterName = ${JSON.stringify(m.characterName)}, npcRole = ${JSON.stringify(m.npcRole)} }`)
    .join(',\n');

  return `// Auto-generated by Insimul export pipeline — do not edit manually.
using System.Collections.Generic;

namespace Insimul
{
    /// <summary>
    /// Pre-configured connection and character mapping for this exported world.
    /// Apply these settings to InsimulManager in your scene.
    /// </summary>
    public static class InsimulExportConfig
    {
        public const string ServerUrl = ${JSON.stringify(config.serverUrl)};
        public const string WorldId = ${JSON.stringify(config.worldId)};
        public const string ApiKey = ${JSON.stringify(config.apiKey)};
        public static readonly InsimulChatProvider ChatProvider = ${chatProvider};
        public static readonly InsimulTTSProvider TTSProvider = ${ttsProvider};
${isLocal ? `        public const string LocalLLMServerURL = "http://localhost:11434/api/generate";
        public const string LocalLLMModel = ${JSON.stringify(config.aiConfig?.localModelName ?? 'mistral')};
        public const string WorldDataPath = "InsimulData/world_export.json";` : ''}

        public static readonly List<CharacterMapping> CharacterMappings = new List<CharacterMapping>
        {
${mappingEntries}
        };

        public static string GetCharacterIdByName(string name)
        {
            var mapping = CharacterMappings.Find(m => m.characterName == name);
            return mapping?.characterId;
        }

        /// <summary>Apply export config to an InsimulManager instance.</summary>
        public static void ApplyTo(InsimulManager manager)
        {
            manager.chatProvider = ChatProvider;
            manager.ttsProvider = TTSProvider;
            manager.serverUrl = ServerUrl;
            manager.worldId = WorldId;
            manager.apiKey = ApiKey;
${isLocal ? `            manager.localLLMServerURL = LocalLLMServerURL;
            manager.localLLMModel = LocalLLMModel;
            manager.worldDataPath = WorldDataPath;` : ''}
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

export function bundleGodotPlugin(ir: WorldIR, aiModelPaths?: AIModelPaths): PluginFile[] {
  const config = buildPluginConfig(ir, aiModelPaths);
  const pluginDir = join(PACKAGES_DIR, 'godot', 'addons', 'insimul');
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

  // AI model path constants (only when local provider is configured)
  let aiSection = '';
  const mp = config.aiConfig?.modelPack;
  if (config.aiConfig?.apiMode === 'local' && mp) {
    aiSection += `\nconst AI_PROVIDER: String = "local"`;
    aiSection += `\nconst AI_LLM_MODEL_PATH: String = ${JSON.stringify(mp.llmModel?.exportPath ?? '')}`;
    aiSection += `\nconst AI_STT_MODEL_PATH: String = ${JSON.stringify(mp.sttModel?.exportPath ?? '')}`;

    if (mp.ttsModels.length > 0) {
      const voiceEntries = mp.ttsModels
        .map(m => `\t${JSON.stringify(m.id)}: ${JSON.stringify(m.exportPath)}`)
        .join(',\n');
      aiSection += `\nconst AI_VOICE_PATHS: Dictionary = {\n${voiceEntries}\n}`;
    } else {
      aiSection += `\nconst AI_VOICE_PATHS: Dictionary = {}`;
    }
  } else {
    aiSection += `\nconst AI_PROVIDER: String = "cloud"`;
    aiSection += `\nconst AI_LLM_MODEL_PATH: String = ""`;
    aiSection += `\nconst AI_STT_MODEL_PATH: String = ""`;
    aiSection += `\nconst AI_VOICE_PATHS: Dictionary = {}`;
  }

  return `# Auto-generated by Insimul export pipeline — do not edit manually.
class_name InsimulExportConfig
extends RefCounted

const SERVER_URL: String = ${JSON.stringify(config.serverUrl)}
const WS_URL: String = ${JSON.stringify(config.wsUrl)}
const WORLD_ID: String = ${JSON.stringify(config.worldId)}
const API_KEY: String = ${JSON.stringify(config.apiKey)}
${aiSection}

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

export function bundleUnrealPlugin(ir: WorldIR, modelPack?: ModelPackIR | null): PluginFile[] {
  const config = buildPluginConfig(ir, undefined, modelPack);
  const pluginDir = join(PACKAGES_DIR, 'unreal');
  const files: PluginFile[] = [];

  // Copy Source/ files (new plugin uses InsimulRuntime module)
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

  // Copy README
  const readmePath = join(pluginDir, 'README.md');
  if (existsSync(readmePath)) {
    files.push({ path: 'Plugins/Insimul/README.md', content: readFileSync(readmePath, 'utf8') });
  }

  // Generate DefaultGame.ini settings for UInsimulSettings
  files.push({
    path: 'Plugins/Insimul/Config/InsimulConfig.ini',
    content: generateUnrealConfig(config),
  });

  // Generate C++ config header with character mappings
  files.push({
    path: 'Plugins/Insimul/Source/InsimulRuntime/Public/InsimulExportConfig.h',
    content: generateUnrealConfigHeader(config),
  });

  // Generate world export JSON for offline mode
  files.push({
    path: 'Content/InsimulData/world_export.json',
    content: generateWorldExportJson(ir, config),
  });

  console.log(`[Export] Unreal plugin bundled: ${files.length} files, ${config.characterMappings.length} character mappings`);
  return files;
}

function generateUnrealConfig(config: InsimulPluginConfig): string {
  const isLocal = config.aiConfig?.apiMode === 'local';
  const chatProvider = isLocal ? 'Local' : 'Server';
  const ttsProvider = isLocal ? 'Local' : 'Server';

  let ini = `; Auto-generated by Insimul export pipeline — do not edit manually.
; Paste this section into Config/DefaultGame.ini (or it will be read from here).
[/Script/InsimulRuntime.InsimulSettings]
ChatProvider=${chatProvider}
TTSProvider=${ttsProvider}
STTProvider=None
ServerURL=${config.serverUrl}
DefaultWorldID=${config.worldId}
APIKey=${config.apiKey}
bPreferWebSocket=true
LanguageCode=en
`;

  if (isLocal) {
    ini += `LocalLLMServerURL=http://localhost:11434/api/generate
LocalLLMModel=${config.aiConfig?.localModelName ?? 'mistral'}
WorldDataPath=InsimulData/world_export.json
MaxTokens=256
Temperature=0.7
LocalVoiceModel=en_US-amy-medium
LocalSpeakerIndex=0
`;
  }

  return ini;
}

function generateUnrealConfigHeader(config: InsimulPluginConfig): string {
  return `// Auto-generated by Insimul export pipeline — do not edit manually.
#pragma once

#include "CoreMinimal.h"

/**
 * Pre-configured connection settings and character mappings for this exported world.
 * These are compile-time defaults. Runtime configuration comes from UInsimulSettings
 * in Project Settings > Plugins > Insimul.
 */
namespace InsimulExportConfig
{
    inline const FString ServerUrl = TEXT(${JSON.stringify(config.serverUrl)});
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

/**
 * Generate a world export JSON compatible with FInsimulWorldExportLoader.
 * This embeds character data and dialogue contexts for offline mode.
 */
function generateWorldExportJson(ir: WorldIR, config: InsimulPluginConfig): string {
  const characters = ir.entities.characters.map((c: CharacterIR) => {
    const personality = (c.personality || {}) as Record<string, number>;
    return {
      characterId: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      gender: c.gender || '',
      occupation: c.occupation || '',
      birthYear: c.birthYear || 0,
      isAlive: c.isAlive !== false,
      openness: personality.openness ?? 0,
      conscientiousness: personality.conscientiousness ?? 0,
      extroversion: personality.extroversion ?? 0,
      agreeableness: personality.agreeableness ?? 0,
      neuroticism: personality.neuroticism ?? 0,
    };
  });

  // Build dialogue contexts from the IR's dialogue context data
  const dialogueContexts = (ir.systems?.dialogueContexts || []).map((ctx: any) => ({
    characterId: ctx.characterId,
    characterName: ctx.characterName,
    systemPrompt: ctx.systemPrompt,
    greeting: ctx.greeting || '',
    voice: ctx.voice || 'Kore',
    truths: (ctx.truths || []).map((t: any) => ({
      title: t.title || '',
      content: t.content || '',
    })),
  }));

  return JSON.stringify({
    worldName: ir.meta.worldName,
    worldId: ir.meta.worldId,
    exportedAt: new Date().toISOString(),
    characters,
    dialogueContexts,
  }, null, 2);
}
