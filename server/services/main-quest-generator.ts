/**
 * Main Quest Procedural Generator
 *
 * Generates coherent multi-stage main quest chains from narrative arc templates.
 * Uses Tracery grammars for procedural title/description generation and binds
 * to real world state (NPCs, locations, items) for grounded quests.
 *
 * Unlike the LLM-based quest-generator.ts, this produces quests entirely from
 * templates — no AI calls required, making it fast and deterministic.
 */

import { TraceryService } from './tracery-service.js';
import {
  NARRATIVE_ARCS,
  getArcsForCefrLevel,
  type NarrativeArc,
  type NarrativeStage,
} from './narrative-templates.js';
import type { WorldStateContext, NPCSummary } from './world-state-context.js';
import type { InsertQuest } from '../../shared/schema.js';
import { getQuestDifficultyInfo } from '../../shared/quest-difficulty.js';

/** Bindings map: placeholder name → resolved world value */
export type NarrativeBindings = Record<string, string>;

/** Result of generating a main quest arc */
export interface GeneratedMainQuest {
  /** Generated chain ID */
  chainId: string;
  /** Expanded arc name */
  arcName: string;
  /** Expanded arc description */
  arcDescription: string;
  /** The template arc used */
  arcId: string;
  /** Generated quests in order */
  quests: InsertQuest[];
  /** Bonus XP on completion */
  completionBonusXP: number;
  /** Achievement name */
  achievement: string;
}

/**
 * Resolve required bindings for a narrative arc from the world state context.
 * Maps placeholder names like 'elderName', 'settlementName' to real entities.
 */
export function resolveBindings(
  arc: NarrativeArc,
  ctx: WorldStateContext,
): NarrativeBindings {
  const bindings: NarrativeBindings = {};
  const usedNpcIds = new Set<string>();

  for (const placeholder of arc.requiredBindings) {
    if (placeholder === 'settlementName') {
      bindings.settlementName =
        ctx.locations.length > 0
          ? ctx.locations[0].name
          : 'the settlement';
    } else if (placeholder === 'locationName') {
      // Pick a business or location name
      if (ctx.businesses.length > 0) {
        bindings.locationName = ctx.businesses[0].name;
      } else if (ctx.locations.length > 1) {
        bindings.locationName = ctx.locations[1].name;
      } else {
        bindings.locationName = bindings.settlementName || 'the town center';
      }
    } else if (placeholder.endsWith('Name')) {
      // NPC binding: pick a unique NPC for each placeholder
      const npc = pickUnusedNpc(ctx.npcs, usedNpcIds, placeholder);
      if (npc) {
        bindings[placeholder] = npc.name;
        usedNpcIds.add(npc.id);
      } else {
        bindings[placeholder] = 'a local resident';
      }
    } else {
      bindings[placeholder] = placeholder;
    }
  }

  return bindings;
}

/**
 * Pick an NPC that hasn't been used yet, preferring occupation-relevant NPCs.
 */
function pickUnusedNpc(
  npcs: NPCSummary[],
  usedIds: Set<string>,
  placeholder: string,
): NPCSummary | null {
  const available = npcs.filter((n) => !usedIds.has(n.id));
  if (available.length === 0) return npcs.length > 0 ? npcs[0] : null;

  // Try to match by occupation hint from placeholder name
  const hint = placeholder.replace('Name', '').toLowerCase();
  const occupationKeywords: Record<string, string[]> = {
    elder: ['elder', 'retired', 'mayor', 'chief', 'historian'],
    merchant: ['merchant', 'shopkeeper', 'vendor', 'trader', 'baker', 'grocer'],
    craftsman: ['blacksmith', 'carpenter', 'tailor', 'potter', 'artisan', 'craftsman'],
    guide: ['guide', 'scout', 'teacher', 'farmer', 'resident'],
    friend: ['resident', 'farmer', 'student', 'worker'],
  };

  const keywords = occupationKeywords[hint] || [];
  if (keywords.length > 0) {
    const match = available.find((n) =>
      keywords.some((k) => n.occupation.toLowerCase().includes(k)),
    );
    if (match) return match;
  }

  // Fallback: pick randomly from available
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Expand Tracery grammar with bindings.
 */
function expandGrammar(
  grammar: Record<string, string[]>,
  bindings: NarrativeBindings,
): string {
  return TraceryService.expand(grammar, bindings);
}

/**
 * Expand placeholder references in an objective description template.
 * Replaces #placeholder# patterns with bound values.
 */
function expandObjectiveDescription(
  template: string,
  bindings: NarrativeBindings,
): string {
  return template.replace(/#(\w+)#/g, (_, key) => bindings[key] || key);
}

/**
 * Resolve the target for an objective based on its placeholder type.
 */
function resolveObjectiveTarget(
  targetPlaceholder: string | undefined,
  bindings: NarrativeBindings,
  ctx: WorldStateContext,
): string {
  if (!targetPlaceholder) return 'any';

  if (targetPlaceholder === 'npc') {
    // Return any bound NPC name — pick the first one available
    for (const [key, val] of Object.entries(bindings)) {
      if (key.endsWith('Name') && key !== 'settlementName' && key !== 'locationName') {
        return val;
      }
    }
    return ctx.npcs.length > 0 ? ctx.npcs[0].name : 'any';
  }

  if (targetPlaceholder === 'location') {
    return bindings.locationName || bindings.settlementName || 'any';
  }

  if (targetPlaceholder === 'item') {
    return ctx.items.length > 0 ? ctx.items[0] : 'any';
  }

  return 'any';
}

/**
 * Generate a single quest from a narrative stage.
 */
function generateStageQuest(
  stage: NarrativeStage,
  bindings: NarrativeBindings,
  ctx: WorldStateContext,
  worldId: string,
  targetLanguage: string,
  chainId: string,
  stageIndex: number,
): InsertQuest {
  const title = expandGrammar(stage.titleGrammar, bindings);
  const description = expandGrammar(stage.descriptionGrammar, bindings);

  const objectives = stage.objectives.map((objTemplate) => ({
    type: objTemplate.type,
    description: expandObjectiveDescription(objTemplate.descriptionTemplate, bindings),
    target: resolveObjectiveTarget(objTemplate.targetPlaceholder, bindings, ctx),
    required: objTemplate.requiredCount,
    current: 0,
    completed: false,
  }));

  const difficultyInfo = getQuestDifficultyInfo(
    stage.difficulty,
    stage.questType,
    objectives.length,
  );

  const quest: InsertQuest = {
    worldId,
    title,
    description,
    questType: stage.questType,
    difficulty: stage.difficulty,
    cefrLevel: difficultyInfo.cefrLevel,
    difficultyStars: difficultyInfo.stars,
    estimatedMinutes: difficultyInfo.estimatedMinutes,
    targetLanguage,
    objectives,
    experienceReward: stage.xpReward,
    rewards: { experience: stage.xpReward },
    status: stageIndex === 0 ? 'active' : 'pending',
    assignedTo: '',
    tags: [...stage.tags, 'main-quest'],
    questChainId: chainId,
    questChainOrder: stageIndex,
  };

  return quest;
}

/**
 * Generate a complete main quest arc from a narrative template.
 *
 * @param arcId - The narrative arc template ID to use
 * @param ctx - World state context with NPCs, locations, etc.
 * @param options - Optional overrides
 * @returns Generated main quest with all stages as InsertQuest objects
 */
export function generateMainQuest(
  arcId: string,
  ctx: WorldStateContext,
  options?: {
    assignedTo?: string;
    customBindings?: Partial<NarrativeBindings>;
  },
): GeneratedMainQuest {
  const arc = NARRATIVE_ARCS[arcId];
  if (!arc) {
    throw new Error(`Unknown narrative arc: ${arcId}`);
  }

  // Resolve bindings from world state
  const bindings = resolveBindings(arc, ctx);

  // Apply any custom overrides
  if (options?.customBindings) {
    Object.assign(bindings, options.customBindings);
  }

  // Expand arc-level narrative
  const arcName = expandGrammar(arc.nameGrammar, bindings);
  const arcDescription = expandGrammar(arc.descriptionGrammar, bindings);

  // Generate chain ID
  const chainId = `main_${arcId}_${Date.now()}`;

  // Generate quests for each stage
  const worldId = ctx.world.id;
  const targetLanguage = ctx.world.targetLanguage || 'English';

  const quests = arc.stages.map((stage, index) => {
    const quest = generateStageQuest(
      stage,
      bindings,
      ctx,
      worldId,
      targetLanguage,
      chainId,
      index,
    );

    if (options?.assignedTo) {
      (quest as any).assignedTo = options.assignedTo;
    }

    return quest;
  });

  // Set prerequisiteQuestIds for linear progression
  // (Quest IDs aren't known until DB insert, so we use chain order for now;
  // the QuestChainManager handles actual prerequisite linking at insert time.)

  return {
    chainId,
    arcName,
    arcDescription,
    arcId,
    quests,
    completionBonusXP: arc.completionBonusXP,
    achievement: arc.achievement,
  };
}

/**
 * Select the best narrative arc for the player's current state.
 *
 * Factors:
 * - Player CEFR level (filter arcs they qualify for)
 * - Already-completed arcs (avoid duplicates)
 * - Theme variety
 */
export function selectBestArc(
  cefrLevel: string,
  completedArcIds: string[],
): NarrativeArc | null {
  const eligible = getArcsForCefrLevel(cefrLevel);
  const available = eligible.filter((arc) => !completedArcIds.includes(arc.id));

  if (available.length === 0) return null;

  // Prefer higher-level arcs that match the player's current level
  // (more challenging but still accessible)
  const cefrOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const playerIdx = cefrOrder.indexOf(cefrLevel);

  // Sort by closest to player level (prefer matching level, then lower)
  available.sort((a, b) => {
    const aIdx = cefrOrder.indexOf(a.minCefrLevel);
    const bIdx = cefrOrder.indexOf(b.minCefrLevel);
    // Prefer arcs closest to player level (higher is better, but not above)
    return bIdx - aIdx;
  });

  return available[0];
}

/**
 * Generate a main quest automatically based on the player's progress.
 * Selects the best arc and generates quests from it.
 */
export function generateMainQuestAuto(
  ctx: WorldStateContext,
  cefrLevel: string,
  completedArcIds: string[],
  assignedTo?: string,
): GeneratedMainQuest | null {
  const arc = selectBestArc(cefrLevel, completedArcIds);
  if (!arc) return null;

  return generateMainQuest(arc.id, ctx, { assignedTo });
}
