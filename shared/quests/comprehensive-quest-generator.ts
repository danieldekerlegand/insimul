/**
 * Comprehensive Main Quest Generator
 *
 * Instantiates a full NarrativeArcTemplate into a complete set of quests
 * bound to real world state (NPCs, locations, items). Produces the entire
 * game narrative in one call — all acts, chapters, and subquests.
 *
 * Unlike the per-arc `main-quest-generator.ts`, this generates the FULL
 * game narrative spanning A1→B2 from a single template.
 */

import type {
  NarrativeArcTemplate,
  SubQuestTemplate,
  CEFRLevel,
} from '../narrative-arc-types.js';
import type { WorldStateContext, NPCSummary } from './world-state-context.js';
import type { InsertQuest } from '../schema.js';
import { getQuestDifficultyInfo } from '../quest-difficulty.js';
import {
  FULL_NARRATIVE_TEMPLATES,
  getAllSubQuests,
} from './full-narrative-template.js';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Bindings resolved from world state for placeholder targets */
export type NarrativeBindings = Record<string, string>;

/** A generated chapter with its quest chain */
export interface GeneratedChapter {
  chapterKey: string;
  title: string;
  narrativeSummary: string;
  questChainId: string;
  requiredCefrLevel: CEFRLevel;
  quests: InsertQuest[];
}

/** A generated act containing chapters */
export interface GeneratedAct {
  actType: string;
  title: string;
  description: string;
  chapters: GeneratedChapter[];
}

/** The complete generated narrative — all quests for the entire game */
export interface GeneratedFullNarrative {
  templateId: string;
  name: string;
  description: string;
  targetLanguage: string;
  acts: GeneratedAct[];
  /** Flat list of all generated quests in story order */
  allQuests: InsertQuest[];
  /** Total quest count */
  totalQuestCount: number;
  /** Total estimated play time in minutes */
  estimatedMinutes: number;
  /** Bindings used during generation */
  bindings: NarrativeBindings;
}

// ─── Binding Resolution ──────────────────────────────────────────────────────

const ARCHETYPE_KEYWORDS: Record<string, string[]> = {
  guide: ['guide', 'scout', 'teacher', 'farmer', 'resident'],
  merchant: ['merchant', 'shopkeeper', 'vendor', 'trader', 'baker', 'grocer'],
  elder: ['elder', 'retired', 'mayor', 'chief', 'historian'],
  craftsman: ['blacksmith', 'carpenter', 'tailor', 'potter', 'artisan', 'craftsman'],
};

/**
 * Pick an NPC matching an archetype, avoiding already-used NPCs.
 */
function pickNpcForArchetype(
  archetype: string,
  npcs: NPCSummary[],
  usedIds: Set<string>,
): NPCSummary | null {
  const available = npcs.filter((n) => !usedIds.has(n.id));
  if (available.length === 0) return npcs.length > 0 ? npcs[0] : null;

  const keywords = ARCHETYPE_KEYWORDS[archetype] || [];
  if (keywords.length > 0) {
    const match = available.find((n) =>
      keywords.some((k) => n.occupation.toLowerCase().includes(k)),
    );
    if (match) return match;
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Resolve bindings from world state context for the full narrative.
 */
export function resolveNarrativeBindings(
  template: NarrativeArcTemplate,
  ctx: WorldStateContext,
): NarrativeBindings {
  const usedIds = new Set<string>();

  // Settlement name
  const settlementName =
    ctx.locations.length > 0 ? ctx.locations[0].name : 'the settlement';

  // Resolve each required archetype to a real NPC
  const archetypeBindings: Record<string, string> = {};
  for (const archetype of template.requiredArchetypes) {
    const npc = pickNpcForArchetype(archetype, ctx.npcs, usedIds);
    if (npc) {
      archetypeBindings[archetype] = npc.name;
      usedIds.add(npc.id);
    } else {
      archetypeBindings[archetype] = `a local ${archetype}`;
    }
  }

  // Location bindings
  const marketBiz = ctx.businesses.find((b) =>
    ['general_store', 'market', 'grocer', 'bakery'].includes(b.businessType),
  );
  const marketName = marketBiz?.name || `${settlementName} Market`;

  const workshopBiz = ctx.businesses.find((b) =>
    ['blacksmith', 'carpenter', 'workshop', 'tailor', 'pottery'].includes(b.businessType),
  );
  const workshopName = workshopBiz?.name || `${settlementName} Workshop`;

  const locationName =
    ctx.locations.length > 1 ? ctx.locations[1].name : settlementName;

  return {
    settlementName,
    ...archetypeBindings,
    locationName,
    marketName,
    workshopName,
  };
}

// ─── Objective Resolution ────────────────────────────────────────────────────

/**
 * Resolve the `target` field of a subquest objective to a real entity name.
 */
function resolveTarget(
  target: string,
  bindings: NarrativeBindings,
  ctx: WorldStateContext,
): string {
  // If the target matches a binding key, use the bound value
  if (target in bindings) return bindings[target];

  // Special targets
  if (target === 'location') {
    return bindings.locationName || bindings.settlementName;
  }
  if (target === 'item') {
    return ctx.items.length > 0 ? ctx.items[0] : 'any';
  }

  return target;
}

/**
 * Expand binding references in a description string.
 * Replaces archetype placeholders like "your guide" with actual NPC names.
 */
function expandDescription(desc: string, bindings: NarrativeBindings): string {
  let result = desc;
  for (const [key, value] of Object.entries(bindings)) {
    // Replace patterns like "the merchant", "your guide", "the elder"
    result = result.replace(new RegExp(`the ${key}`, 'gi'), value);
    result = result.replace(new RegExp(`your ${key}`, 'gi'), value);
  }
  return result;
}

// ─── Quest Generation ────────────────────────────────────────────────────────

/**
 * Generate a single InsertQuest from a SubQuestTemplate.
 */
function generateSubQuest(
  subquest: SubQuestTemplate,
  bindings: NarrativeBindings,
  ctx: WorldStateContext,
  worldId: string,
  targetLanguage: string,
  questChainId: string,
  chainOrder: number,
  globalOrder: number,
  actType: string,
  chapterKey: string,
  isFirstInChain: boolean,
): InsertQuest {
  const description = expandDescription(subquest.description, bindings);

  const objectives = subquest.objectives.map((obj) => ({
    type: obj.type,
    description: expandDescription(obj.description, bindings),
    target: resolveTarget(obj.target, bindings, ctx),
    required: obj.required,
    current: 0,
    completed: false,
  }));

  const difficultyInfo = getQuestDifficultyInfo(
    subquest.difficulty,
    subquest.questType,
    objectives.length,
  );

  const tags = [
    ...subquest.tags,
    `narrative_arc:${ctx.world.id}`,
    `arc_act:${actType}`,
    `arc_chapter:${chapterKey}`,
  ];

  return {
    worldId,
    title: subquest.title,
    description,
    questType: subquest.questType,
    difficulty: subquest.difficulty,
    cefrLevel: difficultyInfo.cefrLevel,
    difficultyStars: difficultyInfo.stars,
    estimatedMinutes: subquest.estimatedMinutes,
    targetLanguage,
    objectives,
    experienceReward: difficultyInfo.stars * 25 + globalOrder * 5,
    rewards: { experience: difficultyInfo.stars * 25 + globalOrder * 5 },
    status: isFirstInChain && chainOrder === 0 ? 'active' : 'pending',
    assignedTo: '',
    tags,
    questChainId,
    questChainOrder: chainOrder,
  };
}

/**
 * Generate the complete game narrative from a template.
 *
 * Produces all quests for all acts/chapters/subquests, bound to real
 * world state entities.
 *
 * @param templateId - The full narrative template ID (e.g., 'the_strangers_journey')
 * @param ctx - World state context with NPCs, locations, businesses, items
 * @param options - Optional assignedTo and custom bindings
 * @returns The complete generated narrative with all quests
 */
export function generateFullNarrative(
  templateId: string,
  ctx: WorldStateContext,
  options?: {
    assignedTo?: string;
    customBindings?: Partial<NarrativeBindings>;
  },
): GeneratedFullNarrative {
  const template = FULL_NARRATIVE_TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Unknown narrative template: ${templateId}`);
  }

  const bindings = resolveNarrativeBindings(template, ctx);
  if (options?.customBindings) {
    Object.assign(bindings, options.customBindings);
  }

  const worldId = ctx.world.id;
  const targetLanguage = ctx.world.targetLanguage || 'English';
  const allQuests: InsertQuest[] = [];
  const generatedActs: GeneratedAct[] = [];
  let globalOrder = 0;
  let isFirstQuest = true;

  for (const act of template.acts) {
    const generatedChapters: GeneratedChapter[] = [];

    for (const chapter of act.chapters) {
      const questChainId = `full_${templateId}_${chapter.key}_${Date.now()}`;
      const chapterQuests: InsertQuest[] = [];

      for (let i = 0; i < chapter.subQuests.length; i++) {
        const sq = chapter.subQuests[i];
        const quest = generateSubQuest(
          sq,
          bindings,
          ctx,
          worldId,
          targetLanguage,
          questChainId,
          i,
          globalOrder,
          act.actType,
          chapter.key,
          isFirstQuest,
        );

        if (options?.assignedTo) {
          (quest as any).assignedTo = options.assignedTo;
        }

        chapterQuests.push(quest);
        allQuests.push(quest);
        globalOrder++;
        isFirstQuest = false;
      }

      generatedChapters.push({
        chapterKey: chapter.key,
        title: chapter.title,
        narrativeSummary: expandDescription(chapter.narrativeSummary, bindings),
        questChainId,
        requiredCefrLevel: chapter.requiredCefrLevel,
        quests: chapterQuests,
      });
    }

    generatedActs.push({
      actType: act.actType,
      title: act.title,
      description: expandDescription(act.description, bindings),
      chapters: generatedChapters,
    });
  }

  const estimatedMinutes = allQuests.reduce(
    (sum, q) => sum + ((q as any).estimatedMinutes || 0),
    0,
  );

  return {
    templateId,
    name: template.name,
    description: expandDescription(template.description, bindings),
    targetLanguage,
    acts: generatedActs,
    allQuests,
    totalQuestCount: allQuests.length,
    estimatedMinutes,
    bindings,
  };
}

/**
 * List available full narrative templates with summary info.
 */
export function listFullNarrativeTemplates(): Array<{
  id: string;
  name: string;
  description: string;
  actCount: number;
  chapterCount: number;
  questCount: number;
  estimatedHours: number;
  requiredArchetypes: string[];
}> {
  return Object.values(FULL_NARRATIVE_TEMPLATES).map((t) => {
    const chapterCount = t.acts.reduce((sum, a) => sum + a.chapters.length, 0);
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      actCount: t.acts.length,
      chapterCount,
      questCount: getAllSubQuests(t).length,
      estimatedHours: t.estimatedHours,
      requiredArchetypes: t.requiredArchetypes,
    };
  });
}
