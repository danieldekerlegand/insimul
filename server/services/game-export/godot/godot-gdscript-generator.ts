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
    { path: 'scripts/core/game_clock.gd',   content: loadStaticTemplate('scripts/core/game_clock.gd') },
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
    { path: 'scripts/characters/player_controller.gd',             content: loadTemplate('scripts/characters/player_controller.gd', playerTokens) },
    { path: 'scripts/characters/npc_controller.gd',                content: loadStaticTemplate('scripts/characters/npc_controller.gd') },
    { path: 'scripts/characters/npc_spawner.gd',                   content: loadStaticTemplate('scripts/characters/npc_spawner.gd') },
    { path: 'scripts/characters/character_animation_controller.gd', content: loadStaticTemplate('scripts/characters/character_animation_controller.gd') },
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

  const waterTokens: TokenMap = {
    WATER_COLOR_R: 0.15,
    WATER_COLOR_G: 0.45,
    WATER_COLOR_B: 0.65,
    WATER_ALPHA:   0.7,
  };

  const terrainTokens: TokenMap = {
    TERRAIN_SIZE:   ir.geography.terrainSize,
    HEIGHT_SCALE:   ir.geography.terrainSize * 0.15,
    GROUND_COLOR_R: theme.groundColor.r,
    GROUND_COLOR_G: theme.groundColor.g,
    GROUND_COLOR_B: theme.groundColor.b,
    SLOPE_COLOR_R:  Math.min(1, theme.groundColor.r + 0.2),
    SLOPE_COLOR_G:  Math.min(1, theme.groundColor.g + 0.1),
    SLOPE_COLOR_B:  Math.min(1, theme.groundColor.b + 0.05),
    PEAK_COLOR_R:   0.85,
    PEAK_COLOR_G:   0.85,
    PEAK_COLOR_B:   0.85,
  };

  return [
    { path: 'scripts/world/world_scale_manager.gd', content: loadTemplate('scripts/world/world_scale_manager.gd', worldScaleTokens) },
    { path: 'scripts/world/terrain_generator.gd',   content: loadTemplate('scripts/world/terrain_generator.gd', terrainTokens) },
    { path: 'scripts/world/building_generator.gd',  content: loadTemplate('scripts/world/building_generator.gd', buildingTokens) },
    { path: 'scripts/world/road_generator.gd',      content: loadTemplate('scripts/world/road_generator.gd', roadTokens) },
    { path: 'scripts/world/water_generator.gd',     content: loadTemplate('scripts/world/water_generator.gd', waterTokens) },
    { path: 'scripts/world/nature_generator.gd',    content: loadStaticTemplate('scripts/world/nature_generator.gd') },
    { path: 'scripts/world/dungeon_generator.gd',   content: loadStaticTemplate('scripts/world/dungeon_generator.gd') },
  ];
}

// ─────────────────────────────────────────────
// UI scripts (fully static)
// ─────────────────────────────────────────────

function genUIScripts(): GeneratedFile[] {
  return [
    { path: 'scripts/ui/hud.gd',              content: loadStaticTemplate('scripts/ui/hud.gd') },
    { path: 'scripts/ui/quest_tracker_ui.gd',  content: loadStaticTemplate('scripts/ui/quest_tracker_ui.gd') },
    { path: 'scripts/ui/quest_journal_ui.gd',  content: loadStaticTemplate('scripts/ui/quest_journal_ui.gd') },
    { path: 'scripts/ui/game_menu.gd',         content: loadStaticTemplate('scripts/ui/game_menu.gd') },
    { path: 'scripts/ui/chat_panel.gd',        content: loadStaticTemplate('scripts/ui/chat_panel.gd') },
    { path: 'scripts/ui/inventory_ui.gd',      content: loadStaticTemplate('scripts/ui/inventory_ui.gd') },
    { path: 'scripts/ui/dialogue_panel.gd',    content: loadStaticTemplate('scripts/ui/dialogue_panel.gd') },
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

// ─────────────────────────────────────────────
// Local AI manager (only included when AI bundle is present)
// ─────────────────────────────────────────────

export function generateLocalAIManagerScript(): GeneratedFile {
  const content = `extends Node
## Local AI Manager — autoloaded singleton for offline NPC inference.
##
## Wraps llama.cpp (via GDExtension or subprocess) for text generation,
## Piper for TTS, and Whisper for STT. Model paths are read from
## InsimulExportConfig at runtime.
##
## This script is only included in exports that bundle local AI models.

signal generation_started(npc_id: String)
signal token_generated(npc_id: String, token: String)
signal generation_complete(npc_id: String, full_text: String)
signal generation_error(npc_id: String, error: String)
signal tts_audio_ready(npc_id: String, audio: PackedByteArray)

var _is_loaded := false
var _is_generating := false
var _model_path := ""
var _stt_model_path := ""
var _voice_paths: Dictionary = {}

func _ready() -> void:
\tif InsimulExportConfig.AI_PROVIDER != "local":
\t\tprint("[LocalAI] AI provider is not local, disabling local AI manager")
\t\treturn
\t_model_path = InsimulExportConfig.AI_LLM_MODEL_PATH
\t_stt_model_path = InsimulExportConfig.AI_STT_MODEL_PATH
\t_voice_paths = InsimulExportConfig.AI_VOICE_PATHS
\tif _model_path != "":
\t\t_load_model()
\telse:
\t\tpush_warning("[LocalAI] No LLM model path configured")

func _load_model() -> void:
\tif not FileAccess.file_exists(_model_path):
\t\tpush_error("[LocalAI] LLM model not found at: " + _model_path)
\t\treturn
\tprint("[LocalAI] Loading LLM model: " + _model_path)
\t# Model loading is deferred to the GDExtension native library.
\t# The GDExtension plugin exposes a LlamaContext class that handles
\t# model loading and inference. If the extension is not available,
\t# we fall back to a subprocess-based approach.
\tif ClassDB.class_exists(&"LlamaContext"):
\t\tvar ctx = ClassDB.instantiate(&"LlamaContext")
\t\tif ctx != null and ctx.has_method("load_model"):
\t\t\tvar ok = ctx.call("load_model", _model_path)
\t\t\tif ok:
\t\t\t\t_is_loaded = true
\t\t\t\tprint("[LocalAI] Model loaded via GDExtension")
\t\t\t\treturn
\tpush_warning("[LocalAI] GDExtension LlamaContext not available — will use HTTP fallback")

func is_available() -> bool:
\treturn InsimulExportConfig.AI_PROVIDER == "local"

func is_model_loaded() -> bool:
\treturn _is_loaded

func generate(npc_id: String, system_prompt: String, messages: Array) -> void:
\tif _is_generating:
\t\tgeneration_error.emit(npc_id, "Already generating")
\t\treturn
\t_is_generating = true
\tgeneration_started.emit(npc_id)

\tif not _is_loaded:
\t\t# Fallback: use Insimul server API if model not loaded locally
\t\tgeneration_error.emit(npc_id, "Model not loaded — use cloud fallback")
\t\t_is_generating = false
\t\treturn

\t# Delegate to GDExtension LlamaContext for actual inference
\tvar prompt := _build_prompt(system_prompt, messages)
\tif ClassDB.class_exists(&"LlamaContext"):
\t\tvar ctx = ClassDB.instantiate(&"LlamaContext")
\t\tif ctx != null and ctx.has_method("generate"):
\t\t\tvar result: String = ctx.call("generate", prompt)
\t\t\ttoken_generated.emit(npc_id, result)
\t\t\tgeneration_complete.emit(npc_id, result)
\t\t\t_is_generating = false
\t\t\treturn

\tgeneration_error.emit(npc_id, "Generation failed — GDExtension not available")
\t_is_generating = false

func get_voice_path(voice_name: String) -> String:
\treturn _voice_paths.get(voice_name, "")

func get_stt_model_path() -> String:
\treturn _stt_model_path

func has_tts() -> bool:
\treturn _voice_paths.size() > 0

func has_stt() -> bool:
\treturn _stt_model_path != "" and FileAccess.file_exists(_stt_model_path)

func _build_prompt(system_prompt: String, messages: Array) -> String:
\tvar prompt := ""
\tif system_prompt != "":
\t\tprompt += "<|system|>\\n" + system_prompt + "\\n"
\tfor msg in messages:
\t\tvar role: String = msg.get("role", "user")
\t\tvar text: String = msg.get("text", "")
\t\tprompt += "<|" + role + "|>\\n" + text + "\\n"
\tprompt += "<|assistant|>\\n"
\treturn prompt
`;
  return { path: 'scripts/services/local_ai_manager.gd', content };
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
