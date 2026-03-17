/**
 * World State Context Builder
 *
 * Gathers rich world state for context-aware quest generation.
 * Provides NPCs with occupations, businesses with inventories,
 * settlements with locations, items, and time-of-day context.
 */

import type { Character, Settlement, World, Quest, Item } from '../../shared/schema.js';

/** A business summary for quest generation context. */
export interface BusinessSummary {
  name: string;
  businessType: string;
  ownerName: string | null;
  ownerId: string | null;
  settlementName: string | null;
  inventory: Array<{ nameLocal: string; nameEnglish: string; category: string; price: number }>;
}

/** An NPC summary for quest generation context. */
export interface NPCSummary {
  id: string;
  name: string;
  occupation: string;
  personality: string;
  settlementName: string | null;
}

/** A location summary for quest generation context. */
export interface LocationSummary {
  name: string;
  type: string;
  landmarks: string[];
}

/** Time-of-day period for quest flavor. */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/** Rich world state for quest generation. */
export interface WorldStateContext {
  world: World;
  npcs: NPCSummary[];
  businesses: BusinessSummary[];
  locations: LocationSummary[];
  items: string[];
  completedQuestTitles: string[];
  activeQuestTitles: string[];
  timeOfDay: TimeOfDay;
}

/** Build NPC name from character. */
function charName(c: Character): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

/** Summarize personality as a short string. */
function summarizePersonality(personality: any): string {
  if (!personality) return 'friendly';
  const traits: string[] = [];
  if (personality.openness > 70) traits.push('curious');
  if (personality.conscientiousness > 70) traits.push('diligent');
  if (personality.extroversion > 70) traits.push('outgoing');
  else if (personality.extroversion < 30) traits.push('reserved');
  if (personality.agreeableness > 70) traits.push('warm');
  if (personality.neuroticism > 70) traits.push('anxious');
  return traits.length > 0 ? traits.join(', ') : 'friendly';
}

/** Get current time of day based on real clock. */
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/** Map settlement name to characters by finding settlement for each character. */
function findSettlementForCharacter(
  character: Character,
  settlements: Settlement[],
): string | null {
  // Characters may have a settlement reference via residenceId or direct field
  for (const s of settlements) {
    if (s.id === (character as any).settlementId) return s.name;
  }
  // Fallback: return first settlement name if any
  return settlements.length > 0 ? settlements[0].name : null;
}

/**
 * Build rich world state context from raw data.
 */
export function buildWorldStateContext(params: {
  world: World;
  characters: Character[];
  settlements: Settlement[];
  businesses: any[];
  items: Item[];
  existingQuests: Quest[];
  timeOfDay?: TimeOfDay;
}): WorldStateContext {
  const { world, characters, settlements, businesses, items, existingQuests, timeOfDay } = params;

  // Build NPC summaries (active characters)
  const npcs: NPCSummary[] = characters
    .filter((c) => c.status === 'active')
    .slice(0, 30) // Limit to keep prompt manageable
    .map((c) => ({
      id: c.id,
      name: charName(c),
      occupation: (c as any).currentOccupation || (c as any).occupation || 'resident',
      personality: summarizePersonality(c.personality),
      settlementName: findSettlementForCharacter(c, settlements),
    }));

  // Build business summaries
  const businessSummaries: BusinessSummary[] = businesses
    .filter((b: any) => !b.isOutOfBusiness)
    .slice(0, 20)
    .map((b: any) => {
      const owner = b.ownerId
        ? characters.find((c) => c.id === b.ownerId)
        : null;
      const settlement = b.settlementId
        ? settlements.find((s) => s.id === b.settlementId)
        : null;

      const inventory = Array.isArray(b.inventory)
        ? b.inventory.slice(0, 8).map((item: any) => ({
            nameLocal: item.nameLocal || item.name || '',
            nameEnglish: item.nameEnglish || item.name || '',
            category: item.category || 'general',
            price: item.price || 0,
          }))
        : [];

      return {
        name: b.name || b.businessType || 'Unknown Business',
        businessType: b.businessType || 'general',
        ownerName: owner ? charName(owner) : null,
        ownerId: b.ownerId || null,
        settlementName: settlement?.name || null,
        inventory,
      };
    });

  // Build location summaries
  const locationSummaries: LocationSummary[] = settlements.map((s) => ({
    name: s.name,
    type: s.settlementType || 'town',
    landmarks: Array.isArray((s as any).landmarks)
      ? (s as any).landmarks.slice(0, 5).map((l: any) => (typeof l === 'string' ? l : l.name || ''))
      : [],
  }));

  // Build item names
  const itemNames = items
    .slice(0, 20)
    .map((i) => i.name);

  // Extract completed and active quest titles to avoid duplicates
  const completedQuestTitles = existingQuests
    .filter((q) => q.status === 'completed')
    .slice(-10)
    .map((q) => q.title);

  const activeQuestTitles = existingQuests
    .filter((q) => q.status === 'active')
    .map((q) => q.title);

  return {
    world,
    npcs,
    businesses: businessSummaries,
    locations: locationSummaries,
    items: itemNames,
    completedQuestTitles,
    activeQuestTitles,
    timeOfDay: timeOfDay ?? getCurrentTimeOfDay(),
  };
}

/** Vocabulary themes appropriate for different times of day. */
const TIME_VOCABULARY_THEMES: Record<TimeOfDay, string[]> = {
  morning: ['greetings', 'breakfast', 'market', 'weather', 'daily routine'],
  afternoon: ['work', 'shopping', 'directions', 'professions', 'business'],
  evening: ['dinner', 'social', 'storytelling', 'family', 'entertainment'],
  night: ['farewell', 'home', 'counting', 'time expressions', 'reflection'],
};

/**
 * Build a world context prompt section for the LLM.
 * Provides the AI with real entity names so it generates grounded quests.
 */
export function buildWorldContextPrompt(ctx: WorldStateContext): string {
  const parts: string[] = [];

  // NPCs
  if (ctx.npcs.length > 0) {
    const npcList = ctx.npcs
      .slice(0, 15)
      .map((n) => `  - ${n.name} (${n.occupation}, ${n.personality}${n.settlementName ? `, in ${n.settlementName}` : ''})`)
      .join('\n');
    parts.push(`AVAILABLE NPCs (use these EXACT names for NPC objectives):\n${npcList}`);
  }

  // Businesses
  if (ctx.businesses.length > 0) {
    const bizList = ctx.businesses
      .slice(0, 10)
      .map((b) => {
        let line = `  - ${b.name} (${b.businessType}`;
        if (b.ownerName) line += `, owner: ${b.ownerName}`;
        if (b.settlementName) line += `, in ${b.settlementName}`;
        line += ')';
        if (b.inventory.length > 0) {
          const items = b.inventory.slice(0, 4).map((i) => i.nameLocal || i.nameEnglish).join(', ');
          line += ` — sells: ${items}`;
        }
        return line;
      })
      .join('\n');
    parts.push(`BUSINESSES (reference these for shopping/service quests):\n${bizList}`);
  }

  // Locations
  if (ctx.locations.length > 0) {
    const locList = ctx.locations.map((l) => {
      let line = `  - ${l.name} (${l.type})`;
      if (l.landmarks.length > 0) line += ` — landmarks: ${l.landmarks.join(', ')}`;
      return line;
    }).join('\n');
    parts.push(`LOCATIONS (use these EXACT names for location objectives):\n${locList}`);
  }

  // Items
  if (ctx.items.length > 0) {
    parts.push(`AVAILABLE ITEMS: ${ctx.items.join(', ')}`);
  }

  // Time of day context
  const themes = TIME_VOCABULARY_THEMES[ctx.timeOfDay];
  parts.push(`TIME OF DAY: ${ctx.timeOfDay} — prefer vocabulary themes: ${themes.join(', ')}`);

  // Avoid duplicating existing quests
  if (ctx.activeQuestTitles.length > 0) {
    parts.push(`ACTIVE QUESTS (avoid duplicating): ${ctx.activeQuestTitles.join(', ')}`);
  }

  return `\nWORLD CONTEXT:\n${parts.join('\n\n')}\n\nIMPORTANT: Reference ACTUAL NPCs, locations, and businesses from the lists above. Do NOT invent entity names.`;
}

/**
 * Validate and bind generated quest data to real world entities.
 * Replaces invented NPC/location names with real ones where possible.
 */
export function bindQuestToWorldEntities(
  questData: any,
  ctx: WorldStateContext,
): any {
  const npcNames = new Set(ctx.npcs.map((n) => n.name.toLowerCase()));
  const locationNames = new Set(ctx.locations.map((l) => l.name.toLowerCase()));
  const businessNames = new Set(ctx.businesses.map((b) => b.name.toLowerCase()));

  // Validate objectives reference real entities
  if (Array.isArray(questData.objectives)) {
    for (const obj of questData.objectives) {
      // For talk_to_npc / complete_conversation, ensure target NPC exists
      if ((obj.type === 'talk_to_npc' || obj.type === 'complete_conversation') && obj.target) {
        if (!npcNames.has(obj.target.toLowerCase()) && obj.target !== 'any') {
          // Find closest match or pick a random NPC
          const match = findClosestMatch(obj.target, ctx.npcs.map((n) => n.name));
          if (match) {
            obj.target = match;
            obj.description = obj.description?.replace(new RegExp(escapeRegex(obj.target), 'gi'), match) || obj.description;
          }
        }
      }

      // For visit_location, ensure target location exists
      if (obj.type === 'visit_location' && obj.target) {
        const allLocNames = [
          ...ctx.locations.map((l) => l.name),
          ...ctx.businesses.map((b) => b.name),
        ];
        if (!locationNames.has(obj.target.toLowerCase()) && !businessNames.has(obj.target.toLowerCase())) {
          const match = findClosestMatch(obj.target, allLocNames);
          if (match) {
            obj.target = match;
          }
        }
      }
    }
  }

  // Bind quest-level location if referenced
  if (questData.locationName) {
    const allLocNames = [
      ...ctx.locations.map((l) => l.name),
      ...ctx.businesses.map((b) => b.name),
    ];
    if (!allLocNames.some((n) => n.toLowerCase() === questData.locationName.toLowerCase())) {
      const match = findClosestMatch(questData.locationName, allLocNames);
      if (match) questData.locationName = match;
    }
  }

  // Bind assignedBy to a real NPC
  if (questData.assignedBy && !npcNames.has(questData.assignedBy.toLowerCase())) {
    const match = findClosestMatch(questData.assignedBy, ctx.npcs.map((n) => n.name));
    if (match) {
      questData.assignedBy = match;
      const npc = ctx.npcs.find((n) => n.name === match);
      if (npc) questData.assignedByCharacterId = npc.id;
    }
  }

  return questData;
}

/** Escape special regex characters. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find the closest matching name using simple substring and case-insensitive comparison.
 * Returns null if no reasonable match found.
 */
function findClosestMatch(target: string, candidates: string[]): string | null {
  if (candidates.length === 0) return null;

  const lower = target.toLowerCase();

  // Exact match
  const exact = candidates.find((c) => c.toLowerCase() === lower);
  if (exact) return exact;

  // Substring match (target contains candidate or vice versa)
  const substring = candidates.find(
    (c) => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase()),
  );
  if (substring) return substring;

  // Word overlap match
  const targetWords = new Set(lower.split(/\s+/));
  let bestMatch: string | null = null;
  let bestOverlap = 0;
  for (const candidate of candidates) {
    const candidateWords = candidate.toLowerCase().split(/\s+/);
    const overlap = candidateWords.filter((w) => targetWords.has(w)).length;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestMatch = candidate;
    }
  }
  if (bestMatch && bestOverlap > 0) return bestMatch;

  // No reasonable match — pick a random candidate as fallback
  return candidates[Math.floor(Math.random() * candidates.length)];
}
