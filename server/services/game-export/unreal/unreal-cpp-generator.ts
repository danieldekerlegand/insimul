/**
 * Unreal C++ Generator
 *
 * Generates C++ header and source files for the UE5 project:
 * - Data structs (USTRUCTs for DataTable rows)
 * - Core classes (GameMode, GameInstance, PlayerController)
 * - Character classes (Player, NPC)
 * - Game systems (Action, Combat, Quest, Inventory, Crafting, Resource, Survival, Dialogue, Rule)
 * - World generators (Building, Nature, Road, Dungeon, WorldScale)
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './unreal-project-generator';
import { loadStaticTemplate, loadTemplate, cppFloat, type TokenMap } from './unreal-template-loader';

const M = 'InsimulExport'; // Module name

// ─────────────────────────────────────────────
// Data Structs (DataTable row types)
// ─────────────────────────────────────────────

function genDataStructs(): GeneratedFile[] {
  const base = `Source/${M}/Data`;
  return [
    { path: `${base}/CharacterData.h`,  content: loadStaticTemplate('source/data/CharacterData.h') },
    { path: `${base}/NPCData.h`,        content: loadStaticTemplate('source/data/NPCData.h') },
    { path: `${base}/ActionData.h`,     content: loadStaticTemplate('source/data/ActionData.h') },
    { path: `${base}/RuleData.h`,       content: loadStaticTemplate('source/data/RuleData.h') },
    { path: `${base}/QuestData.h`,      content: loadStaticTemplate('source/data/QuestData.h') },
    { path: `${base}/SettlementData.h`, content: loadStaticTemplate('source/data/SettlementData.h') },
    { path: `${base}/BuildingData.h`,   content: loadStaticTemplate('source/data/BuildingData.h') },
    { path: `${base}/DialogueContextData.h`, content: loadStaticTemplate('source/data/DialogueContextData.h') },
    { path: `${base}/WaterFeatureData.h`, content: loadStaticTemplate('source/data/WaterFeatureData.h') },
    { path: `${base}/GameTypes.h`,     content: loadStaticTemplate('source/data/GameTypes.h') },
    { path: `${base}/LotData.h`,       content: loadStaticTemplate('source/data/LotData.h') },
    { path: `${base}/InfrastructureData.h`, content: loadStaticTemplate('source/data/InfrastructureData.h') },
  ];
}

// ─────────────────────────────────────────────
// Core Classes
// ─────────────────────────────────────────────

function genCoreClasses(ir: WorldIR): GeneratedFile[] {
  const base = `Source/${M}/Core`;
  const theme = ir.theme.visualTheme;

  const gameModeTokens: TokenMap = {
    GROUND_COLOR_R: cppFloat(theme.groundColor.r),
    GROUND_COLOR_G: cppFloat(theme.groundColor.g),
    GROUND_COLOR_B: cppFloat(theme.groundColor.b),
    BASE_COLOR_R:   cppFloat(theme.settlementBaseColor.r),
    BASE_COLOR_G:   cppFloat(theme.settlementBaseColor.g),
    BASE_COLOR_B:   cppFloat(theme.settlementBaseColor.b),
    ROOF_COLOR_R:   cppFloat(theme.settlementRoofColor.r),
    ROOF_COLOR_G:   cppFloat(theme.settlementRoofColor.g),
    ROOF_COLOR_B:   cppFloat(theme.settlementRoofColor.b),
    ROAD_COLOR_R:   cppFloat(theme.roadColor.r),
    ROAD_COLOR_G:   cppFloat(theme.roadColor.g),
    ROAD_COLOR_B:   cppFloat(theme.roadColor.b),
  };

  return [
    { path: `${base}/InsimulGameInstance.h`,        content: loadStaticTemplate('source/core/InsimulGameInstance.h') },
    { path: `${base}/InsimulGameInstance.cpp`,      content: loadStaticTemplate('source/core/InsimulGameInstance.cpp') },
    { path: `${base}/InsimulMeshActor.h`,           content: loadStaticTemplate('source/core/InsimulMeshActor.h') },
    { path: `${base}/InsimulMeshActor.cpp`,         content: loadStaticTemplate('source/core/InsimulMeshActor.cpp') },
    { path: `${base}/InsimulPlayerController.h`,    content: loadStaticTemplate('source/core/InsimulPlayerController.h') },
    { path: `${base}/InsimulPlayerController.cpp`,  content: loadStaticTemplate('source/core/InsimulPlayerController.cpp') },
    { path: `${base}/CreateLevelCommandlet.h`,      content: loadStaticTemplate('source/core/CreateLevelCommandlet.h') },
    { path: `${base}/CreateLevelCommandlet.cpp`,    content: loadStaticTemplate('source/core/CreateLevelCommandlet.cpp') },
    { path: `${base}/InsimulGameMode.h`,            content: loadStaticTemplate('source/core/InsimulGameMode.h') },
    { path: `${base}/InsimulGameMode.cpp`,          content: loadTemplate('source/core/InsimulGameMode.cpp', gameModeTokens) },
  ];
}

// ─────────────────────────────────────────────
// Character Classes
// ─────────────────────────────────────────────

function genCharacterClasses(ir: WorldIR): GeneratedFile[] {
  const base = `Source/${M}/Characters`;
  const p = ir.player;

  const playerHTokens: TokenMap = {
    PLAYER_INITIAL_HEALTH: p.initialHealth,
    PLAYER_INITIAL_ENERGY: p.initialEnergy,
    PLAYER_INITIAL_GOLD:   p.initialGold,
    PLAYER_SPEED:          p.speed,
    PLAYER_JUMP_HEIGHT:    p.jumpHeight,
  };

  const playerCppTokens: TokenMap = {
    PLAYER_GRAVITY: cppFloat(p.gravity),
  };

  return [
    { path: `${base}/PlayerCharacter.h`,   content: loadTemplate('source/characters/PlayerCharacter.h', playerHTokens) },
    { path: `${base}/PlayerCharacter.cpp`, content: loadTemplate('source/characters/PlayerCharacter.cpp', playerCppTokens) },
    { path: `${base}/NPCCharacter.h`,      content: loadStaticTemplate('source/characters/NPCCharacter.h') },
    { path: `${base}/NPCCharacter.cpp`,    content: loadStaticTemplate('source/characters/NPCCharacter.cpp') },
  ];
}

// ─────────────────────────────────────────────
// Game Systems
// ─────────────────────────────────────────────

function genSystemClasses(ir: WorldIR): GeneratedFile[] {
  const base = `Source/${M}/Systems`;
  const cs = ir.combat.settings;
  const genre = ir.meta.genreConfig;

  const combatTokens: TokenMap = {
    COMBAT_STYLE:               ir.combat.style,
    COMBAT_BASE_DAMAGE:         cppFloat(cs.baseDamage),
    COMBAT_CRITICAL_CHANCE:     cppFloat(cs.criticalChance),
    COMBAT_CRITICAL_MULTIPLIER: cppFloat(cs.criticalMultiplier),
    COMBAT_BLOCK_REDUCTION:     cppFloat(cs.blockReduction),
    COMBAT_DODGE_CHANCE:        cppFloat(cs.dodgeChance),
  };

  const files: GeneratedFile[] = [
    { path: `${base}/ActionSystem.h`,    content: loadStaticTemplate('source/systems/ActionSystem.h') },
    { path: `${base}/ActionSystem.cpp`,  content: loadStaticTemplate('source/systems/ActionSystem.cpp') },
    { path: `${base}/RuleEnforcer.h`,    content: loadStaticTemplate('source/systems/RuleEnforcer.h') },
    { path: `${base}/RuleEnforcer.cpp`,  content: loadStaticTemplate('source/systems/RuleEnforcer.cpp') },
    { path: `${base}/CombatSystem.h`,    content: loadTemplate('source/systems/CombatSystem.h', combatTokens) },
    { path: `${base}/CombatSystem.cpp`,  content: loadStaticTemplate('source/systems/CombatSystem.cpp') },
    { path: `${base}/QuestSystem.h`,     content: loadStaticTemplate('source/systems/QuestSystem.h') },
    { path: `${base}/QuestSystem.cpp`,   content: loadStaticTemplate('source/systems/QuestSystem.cpp') },
    { path: `${base}/InventorySystem.h`, content: loadStaticTemplate('source/systems/InventorySystem.h') },
    { path: `${base}/InventorySystem.cpp`, content: loadStaticTemplate('source/systems/InventorySystem.cpp') },
    { path: `${base}/DialogueSystem.h`,  content: loadStaticTemplate('source/systems/DialogueSystem.h') },
    { path: `${base}/DialogueSystem.cpp`, content: loadStaticTemplate('source/systems/DialogueSystem.cpp') },
  ];

  if (genre.features.crafting) {
    files.push({ path: `${base}/CraftingSystem.h`,   content: loadStaticTemplate('source/systems/CraftingSystem.h') });
    files.push({ path: `${base}/CraftingSystem.cpp`, content: loadStaticTemplate('source/systems/CraftingSystem.cpp') });
  }

  if (genre.features.resources) {
    files.push({ path: `${base}/ResourceSystem.h`,   content: loadStaticTemplate('source/systems/ResourceSystem.h') });
    files.push({ path: `${base}/ResourceSystem.cpp`, content: loadStaticTemplate('source/systems/ResourceSystem.cpp') });
  }

  if (ir.survival) {
    files.push({ path: `${base}/SurvivalSystem.h`,   content: loadStaticTemplate('source/systems/SurvivalSystem.h') });
    files.push({ path: `${base}/SurvivalSystem.cpp`, content: loadStaticTemplate('source/systems/SurvivalSystem.cpp') });
  }

  return files;
}

// ─────────────────────────────────────────────
// World Generators
// ─────────────────────────────────────────────

function genWorldGenerators(ir: WorldIR): GeneratedFile[] {
  const base = `Source/${M}/World`;
  const theme = ir.theme.visualTheme;

  const worldScaleTokens: TokenMap = {
    TERRAIN_SIZE:   ir.geography.terrainSize,
    GROUND_COLOR_R: cppFloat(theme.groundColor.r),
    GROUND_COLOR_G: cppFloat(theme.groundColor.g),
    GROUND_COLOR_B: cppFloat(theme.groundColor.b),
    SKY_COLOR_R:    cppFloat(theme.skyColor.r),
    SKY_COLOR_G:    cppFloat(theme.skyColor.g),
    SKY_COLOR_B:    cppFloat(theme.skyColor.b),
    ROAD_COLOR_R:   cppFloat(theme.roadColor.r),
    ROAD_COLOR_G:   cppFloat(theme.roadColor.g),
    ROAD_COLOR_B:   cppFloat(theme.roadColor.b),
  };

  const buildingTokens: TokenMap = {
    BASE_COLOR_R: cppFloat(theme.settlementBaseColor.r),
    BASE_COLOR_G: cppFloat(theme.settlementBaseColor.g),
    BASE_COLOR_B: cppFloat(theme.settlementBaseColor.b),
    ROOF_COLOR_R: cppFloat(theme.settlementRoofColor.r),
    ROOF_COLOR_G: cppFloat(theme.settlementRoofColor.g),
    ROOF_COLOR_B: cppFloat(theme.settlementRoofColor.b),
  };

  const roadTokens: TokenMap = {
    ROAD_COLOR_R: cppFloat(theme.roadColor.r),
    ROAD_COLOR_G: cppFloat(theme.roadColor.g),
    ROAD_COLOR_B: cppFloat(theme.roadColor.b),
    ROAD_RADIUS:  cppFloat(theme.roadRadius),
  };

  return [
    { path: `${base}/WorldScaleManager.h`,              content: loadTemplate('source/world/WorldScaleManager.h', worldScaleTokens) },
    { path: `${base}/WorldScaleManager.cpp`,            content: loadStaticTemplate('source/world/WorldScaleManager.cpp') },
    { path: `${base}/ProceduralBuildingGenerator.h`,    content: loadTemplate('source/world/ProceduralBuildingGenerator.h', buildingTokens) },
    { path: `${base}/ProceduralBuildingGenerator.cpp`,  content: loadStaticTemplate('source/world/ProceduralBuildingGenerator.cpp') },
    { path: `${base}/RoadGenerator.h`,                  content: loadTemplate('source/world/RoadGenerator.h', roadTokens) },
    { path: `${base}/RoadGenerator.cpp`,                content: loadStaticTemplate('source/world/RoadGenerator.cpp') },
    { path: `${base}/ProceduralNatureGenerator.h`,      content: loadStaticTemplate('source/world/ProceduralNatureGenerator.h') },
    { path: `${base}/ProceduralNatureGenerator.cpp`,    content: loadStaticTemplate('source/world/ProceduralNatureGenerator.cpp') },
    { path: `${base}/ProceduralDungeonGenerator.h`,     content: loadStaticTemplate('source/world/ProceduralDungeonGenerator.h') },
    { path: `${base}/ProceduralDungeonGenerator.cpp`,   content: loadStaticTemplate('source/world/ProceduralDungeonGenerator.cpp') },
  ];
}

// ─────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────

function genServiceClasses(ir: WorldIR): GeneratedFile[] {
  const base = `Source/${M}/Services`;
  return [
    { path: `${base}/InsimulAIService.h`,   content: loadStaticTemplate('source/services/InsimulAIService.h') },
    { path: `${base}/InsimulAIService.cpp`, content: loadStaticTemplate('source/services/InsimulAIService.cpp') },
    { path: `${base}/InsimulAIBundle.h`,    content: loadStaticTemplate('source/services/InsimulAIBundle.h') },
    { path: `${base}/InsimulAIBundle.cpp`,  content: generateAIBundleCpp(ir) },
  ];
}

// ─────────────────────────────────────────────
// AI Bundle code generation
// ─────────────────────────────────────────────

/** Escape a string for use inside a C++ TEXT("...") literal. */
function cppEscape(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Generate InsimulAIBundle.cpp with baked-in AI config, dialogue contexts,
 * and knowledge base from the WorldIR.
 */
function generateAIBundleCpp(ir: WorldIR): string {
  const ai = ir.aiConfig;
  const contexts = ir.systems.dialogueContexts || [];
  const kb = ir.systems.knowledgeBase || '';

  // Build dialogue context initializers
  const contextEntries = contexts.map(ctx => {
    const truths = ctx.truths || [];
    const truthLines = truths.map(t =>
      `        { FInsimulDialogueTruth Truth; Truth.Title = TEXT("${cppEscape(t.title)}"); Truth.Content = TEXT("${cppEscape(t.content)}"); Ctx.Truths.Add(Truth); }`
    ).join('\n');

    return `    {
        Ctx.CharacterId = TEXT("${cppEscape(ctx.characterId)}");
        Ctx.CharacterName = TEXT("${cppEscape(ctx.characterName)}");
        Ctx.SystemPrompt = TEXT("${cppEscape(ctx.systemPrompt)}");
        Ctx.Greeting = TEXT("${cppEscape(ctx.greeting)}");
        Ctx.Voice = TEXT("${cppEscape(ctx.voice)}");
${truthLines}
        Result.Add(Ctx);
    }`;
  });

  const contextBlock = contexts.length > 0
    ? `    FInsimulDialogueContext Ctx;
${contextEntries.join('\n    Ctx = FInsimulDialogueContext();\n')}`
    : '';

  return `// Auto-generated by Insimul export pipeline — do not edit manually.
#include "InsimulAIBundle.h"
#include "Services/InsimulAIService.h"

void UInsimulAIBundle::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);

    // Auto-initialize the AI service with baked-in data
    UInsimulAIService* AIService = GetGameInstance()->GetSubsystem<UInsimulAIService>();
    if (AIService)
    {
        AIService->InitializeService(GetBundledConfig(), GetBundledContexts());
        bInitialized = true;
        UE_LOG(LogTemp, Log, TEXT("[InsimulAIBundle] AI service initialized with %d dialogue contexts"), GetBundledContexts().Num());
    }
    else
    {
        UE_LOG(LogTemp, Warning, TEXT("[InsimulAIBundle] InsimulAIService subsystem not found"));
    }
}

FInsimulAIConfig UInsimulAIBundle::GetBundledConfig() const
{
    FInsimulAIConfig Config;
    Config.ApiMode = TEXT("${cppEscape(ai.apiMode)}");
    Config.InsimulEndpoint = TEXT("${cppEscape(ai.insimulEndpoint)}");
    Config.GeminiModel = TEXT("${cppEscape(ai.geminiModel)}");
    Config.GeminiApiKey = TEXT("${cppEscape(ai.geminiApiKeyPlaceholder)}");
    Config.bVoiceEnabled = ${ai.voiceEnabled ? 'true' : 'false'};
    Config.DefaultVoice = TEXT("${cppEscape(ai.defaultVoice)}");
    return Config;
}

TArray<FInsimulDialogueContext> UInsimulAIBundle::GetBundledContexts() const
{
    TArray<FInsimulDialogueContext> Result;
${contextBlock}
    return Result;
}

FString UInsimulAIBundle::GetKnowledgeBase() const
{
    return TEXT("${cppEscape(kb)}");
}
`;
}

// ─────────────────────────────────────────────
// Asset Setup Scripts
// ─────────────────────────────────────────────

function genAssetScripts(): GeneratedFile[] {
  return [
    { path: 'Scripts/ImportInsimulAssets.py', content: loadStaticTemplate('scripts/ImportInsimulAssets.py') },
    { path: 'Setup.bat',                      content: loadStaticTemplate('scripts/Setup.bat') },
    { path: 'setup.sh',                       content: loadStaticTemplate('scripts/setup.sh') },
    { path: 'Content/Data/ASSET_SETUP.md',    content: loadStaticTemplate('scripts/ASSET_SETUP.md') },
  ];
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateCppFiles(ir: WorldIR): GeneratedFile[] {
  return [
    ...genDataStructs(),
    ...genCoreClasses(ir),
    ...genCharacterClasses(ir),
    ...genSystemClasses(ir),
    ...genServiceClasses(ir),
    ...genWorldGenerators(ir),
    ...genAssetScripts(),
  ];
}
