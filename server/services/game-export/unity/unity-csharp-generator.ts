/**
 * Unity C# Generator
 *
 * Loads C# template files from `templates/` and performs {{TOKEN}} substitution
 * for world-specific values. Static scripts are copied as-is; dynamic scripts
 * receive a substitution map built from the WorldIR. Conditional scripts
 * (crafting, resources, survival) are included only when the genre enables them.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './unity-project-generator';
import { loadStaticTemplate, loadTemplate, type TokenMap } from './unity-template-loader';

// ─────────────────────────────────────────────
// Data Classes (fully static)
// ─────────────────────────────────────────────

function genDataClasses(): GeneratedFile[] {
  const base = 'Assets/Scripts/Data';
  return [
    { path: `${base}/InsimulCharacterData.cs`, content: loadStaticTemplate('scripts/data/InsimulCharacterData.cs') },
    { path: `${base}/InsimulNPCData.cs`,       content: loadStaticTemplate('scripts/data/InsimulNPCData.cs') },
    { path: `${base}/InsimulActionData.cs`,    content: loadStaticTemplate('scripts/data/InsimulActionData.cs') },
    { path: `${base}/InsimulRuleData.cs`,      content: loadStaticTemplate('scripts/data/InsimulRuleData.cs') },
    { path: `${base}/InsimulQuestData.cs`,     content: loadStaticTemplate('scripts/data/InsimulQuestData.cs') },
    { path: `${base}/InsimulSettlementData.cs`,content: loadStaticTemplate('scripts/data/InsimulSettlementData.cs') },
    { path: `${base}/InsimulBuildingData.cs`,  content: loadStaticTemplate('scripts/data/InsimulBuildingData.cs') },
    { path: `${base}/InsimulWorldIR.cs`,       content: loadStaticTemplate('scripts/data/InsimulWorldIR.cs') },
    { path: `${base}/InsimulAssetManifest.cs`, content: loadStaticTemplate('scripts/data/InsimulAssetManifest.cs') },
    { path: `${base}/InsimulDialogueContext.cs`, content: loadStaticTemplate('scripts/data/InsimulDialogueContext.cs') },
    { path: `${base}/InsimulAIConfig.cs`, content: loadStaticTemplate('scripts/data/InsimulAIConfig.cs') },
    { path: `${base}/InsimulWaterFeatureData.cs`, content: loadStaticTemplate('scripts/data/InsimulWaterFeatureData.cs') },
    { path: `${base}/InsimulLotData.cs`, content: loadStaticTemplate('scripts/data/InsimulLotData.cs') },
  ];
}

// ─────────────────────────────────────────────
// Core Classes (fully static)
// ─────────────────────────────────────────────

function genCoreClasses(): GeneratedFile[] {
  const base = 'Assets/Scripts/Core';
  return [
    { path: `${base}/InsimulGameManager.cs`, content: loadStaticTemplate('scripts/core/InsimulGameManager.cs') },
    { path: `${base}/InsimulDataLoader.cs`,  content: loadStaticTemplate('scripts/core/InsimulDataLoader.cs') },
  ];
}

// ─────────────────────────────────────────────
// Character Classes
// ─────────────────────────────────────────────

function genCharacterClasses(ir: WorldIR): GeneratedFile[] {
  const base = 'Assets/Scripts/Characters';
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
    { path: `${base}/InsimulPlayerController.cs`, content: loadTemplate('scripts/characters/InsimulPlayerController.cs', playerTokens) },
    { path: `${base}/NPCController.cs`,           content: loadStaticTemplate('scripts/characters/NPCController.cs') },
    { path: `${base}/NPCManager.cs`,              content: loadStaticTemplate('scripts/characters/NPCManager.cs') },
  ];
}

// ─────────────────────────────────────────────
// Game Systems
// ─────────────────────────────────────────────

function genSystemClasses(ir: WorldIR): GeneratedFile[] {
  const base = 'Assets/Scripts/Systems';
  const cs = ir.combat.settings;
  const combatTokens: TokenMap = {
    COMBAT_STYLE:               ir.combat.style,
    COMBAT_BASE_DAMAGE:         cs.baseDamage,
    COMBAT_CRITICAL_CHANCE:     cs.criticalChance,
    COMBAT_CRITICAL_MULTIPLIER: cs.criticalMultiplier,
    COMBAT_BLOCK_REDUCTION:     cs.blockReduction,
    COMBAT_DODGE_CHANCE:        cs.dodgeChance,
    COMBAT_ATTACK_COOLDOWN:     cs.attackCooldown / 1000,
  };

  const files: GeneratedFile[] = [
    { path: `${base}/IInteractable.cs`,   content: loadStaticTemplate('scripts/systems/IInteractable.cs') },
    { path: `${base}/ActionSystem.cs`,    content: loadStaticTemplate('scripts/systems/ActionSystem.cs') },
    { path: `${base}/RuleEnforcer.cs`,    content: loadStaticTemplate('scripts/systems/RuleEnforcer.cs') },
    { path: `${base}/CombatSystem.cs`,    content: loadTemplate('scripts/systems/CombatSystem.cs', combatTokens) },
    { path: `${base}/QuestSystem.cs`,     content: loadStaticTemplate('scripts/systems/QuestSystem.cs') },
    { path: `${base}/InventorySystem.cs`, content: loadStaticTemplate('scripts/systems/InventorySystem.cs') },
    { path: `${base}/DialogueSystem.cs`,  content: loadStaticTemplate('scripts/systems/DialogueSystem.cs') },
  ];

  const genre = ir.meta.genreConfig;
  if (genre.features.crafting) {
    files.push({ path: `${base}/CraftingSystem.cs`, content: loadStaticTemplate('scripts/systems/CraftingSystem.cs') });
  }
  if (genre.features.resources) {
    files.push({ path: `${base}/ResourceSystem.cs`, content: loadStaticTemplate('scripts/systems/ResourceSystem.cs') });
  }
  if (ir.survival != null) {
    files.push({ path: `${base}/SurvivalSystem.cs`, content: loadStaticTemplate('scripts/systems/SurvivalSystem.cs') });
  }

  return files;
}

// ─────────────────────────────────────────────
// World Generators
// ─────────────────────────────────────────────

function genWorldGenerators(ir: WorldIR): GeneratedFile[] {
  const base = 'Assets/Scripts/World';
  const theme = ir.theme.visualTheme;

  const worldScaleTokens: TokenMap = {
    TERRAIN_SIZE:   ir.geography.terrainSize,
    GROUND_COLOR_R: theme.groundColor.r,
    GROUND_COLOR_G: theme.groundColor.g,
    GROUND_COLOR_B: theme.groundColor.b,
    SKY_COLOR_R:    theme.skyColor.r,
    SKY_COLOR_G:    theme.skyColor.g,
    SKY_COLOR_B:    theme.skyColor.b,
    ROAD_COLOR_R:   theme.roadColor.r,
    ROAD_COLOR_G:   theme.roadColor.g,
    ROAD_COLOR_B:   theme.roadColor.b,
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
    { path: `${base}/WorldScaleManager.cs`,          content: loadTemplate('scripts/world/WorldScaleManager.cs', worldScaleTokens) },
    { path: `${base}/ProceduralBuildingGenerator.cs`, content: loadTemplate('scripts/world/ProceduralBuildingGenerator.cs', buildingTokens) },
    { path: `${base}/RoadGenerator.cs`,              content: loadTemplate('scripts/world/RoadGenerator.cs', roadTokens) },
    { path: `${base}/ProceduralNatureGenerator.cs`,  content: loadStaticTemplate('scripts/world/ProceduralNatureGenerator.cs') },
    { path: `${base}/ProceduralDungeonGenerator.cs`, content: loadStaticTemplate('scripts/world/ProceduralDungeonGenerator.cs') },
    { path: `${base}/WaterFeatureGenerator.cs`,      content: loadStaticTemplate('scripts/world/WaterFeatureGenerator.cs') },
  ];
}

// ─────────────────────────────────────────────
// UI Scripts (fully static)
// ─────────────────────────────────────────────

function genUIClasses(): GeneratedFile[] {
  const base = 'Assets/Scripts/UI';
  return [
    { path: `${base}/HUDManager.cs`,      content: loadStaticTemplate('scripts/ui/HUDManager.cs') },
    { path: `${base}/QuestTrackerUI.cs`,  content: loadStaticTemplate('scripts/ui/QuestTrackerUI.cs') },
    { path: `${base}/GameMenuUI.cs`,      content: loadStaticTemplate('scripts/ui/GameMenuUI.cs') },
    { path: `${base}/ChatPanel.cs`,       content: loadStaticTemplate('scripts/ui/ChatPanel.cs') },
  ];
}

// ─────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────

function genServiceClasses(): GeneratedFile[] {
  const base = 'Assets/Scripts/Services';
  return [
    { path: `${base}/InsimulAIService.cs`, content: loadStaticTemplate('scripts/services/InsimulAIService.cs') },
    { path: `${base}/LlamaNativePlugin.cs`, content: loadStaticTemplate('scripts/services/LlamaNativePlugin.cs') },
    { path: `${base}/LocalAIService.cs`, content: loadStaticTemplate('scripts/services/LocalAIService.cs') },
  ];
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateCSharpFiles(ir: WorldIR): GeneratedFile[] {
  return [
    ...genDataClasses(),
    ...genCoreClasses(),
    ...genCharacterClasses(ir),
    ...genSystemClasses(ir),
    ...genWorldGenerators(ir),
    ...genUIClasses(),
    ...genServiceClasses(),
  ];
}
