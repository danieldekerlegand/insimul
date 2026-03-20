/**
 * Conversation Context Manager
 *
 * Builds rich NPC context from world state so NPCs respond in-character.
 * Produces a ConversationContext for the streaming LLM provider and serializes
 * to under 4000 tokens (~16 000 characters as a conservative estimate).
 */

import { storage as defaultStorage } from '../../db/storage';
import type { Character, World, Occupation, Business, Settlement } from '@shared/schema';
import type { WorldLanguage } from '@shared/language';
import type { ConversationContext } from './providers/llm-provider';
import type { WeatherCondition, NPCAwareQuest } from '@shared/npc-awareness-context';
import { describeWeather, describeTime } from '@shared/npc-awareness-context';
import { getMainQuestNPCDefinition, isMainQuestNPC } from '@shared/quest/main-quest-npcs';

// ── Storage interface (subset needed by context manager) ──────────────

export interface ContextManagerStorage {
  getCharacter(id: string): Promise<Character | undefined>;
  getWorld(id: string): Promise<World | undefined>;
  getCharactersByWorld(worldId: string): Promise<Character[]>;
  getWorldLanguagesByWorld(worldId: string): Promise<WorldLanguage[]>;
  getCurrentOccupation(characterId: string): Promise<Occupation | undefined>;
  getBusiness(id: string): Promise<Business | undefined>;
  getSettlementsByWorld(worldId: string): Promise<Settlement[]>;
  getResidence(id: string): Promise<any | undefined>;
}

// ── Public types ──────────────────────────────────────────────────────

export interface BigFivePersonality {
  openness: number;
  conscientiousness: number;
  extroversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface RelationshipSummary {
  characterName: string;
  type: string;
  strength: number;
}

export interface LanguageLearningDirectives {
  targetLanguage: string;
  targetLanguageCode: string | null;
  playerProficiency: string;
  learnedVocabulary: string[];
}

export interface FullConversationContext {
  // Character
  characterId: string;
  characterName: string;
  personality: BigFivePersonality;
  occupation: string | null;
  workplace: string | null;
  family: string[];
  romanticStatus: string;
  friendships: RelationshipSummary[];
  enemies: RelationshipSummary[];
  emotionalState: string;
  currentLocation: string;
  timeOfDay: string;

  // World
  worldName: string;
  worldType: string | null;
  era: string;
  languages: string[];
  culturalSetting: string | null;

  // Environment awareness
  weather: WeatherCondition;
  gameHour: number;
  season: string | null;

  // Quest awareness
  activeQuests: NPCAwareQuest[];

  // Player progress
  playerProgress: {
    questsCompleted: number;
    reputation: number;
    isNewToTown: boolean;
  };

  // Relationship with player
  playerRelationship: {
    friendshipLevel: number;
    romanceStage: string;
    trust: number;
    previousTopics: string[];
  };

  // Language learning (null if not a language-learning world)
  languageLearning: LanguageLearningDirectives | null;

  // Serialised for the LLM
  conversationContext: ConversationContext;
}

// ── Helpers ───────────────────────────────────────────────────────────

function personalityLabel(value: number): string {
  if (value >= 0.6) return 'very high';
  if (value >= 0.2) return 'high';
  if (value > -0.2) return 'moderate';
  if (value > -0.6) return 'low';
  return 'very low';
}

function personalitySummary(p: BigFivePersonality): string {
  return [
    `openness: ${personalityLabel(p.openness)}`,
    `conscientiousness: ${personalityLabel(p.conscientiousness)}`,
    `extroversion: ${personalityLabel(p.extroversion)}`,
    `agreeableness: ${personalityLabel(p.agreeableness)}`,
    `neuroticism: ${personalityLabel(p.neuroticism)}`,
  ].join(', ');
}

function romanticStatus(character: Character): string {
  if (character.spouseId) return 'married';
  // Check relationships for romantic type
  const rels = (character.relationships ?? {}) as Record<string, any>;
  for (const rel of Object.values(rels)) {
    if (rel?.type === 'romantic') return 'in a relationship';
  }
  return 'single';
}

function emotionalState(character: Character): string {
  const thoughts = (character.thoughts ?? []) as Array<{ emotion?: string; timestamp?: number }>;
  if (thoughts.length === 0) return 'neutral';
  // Return most recent emotion
  const sorted = thoughts
    .filter((t) => t.emotion)
    .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
  return sorted[0]?.emotion ?? 'neutral';
}

function extractRelationships(
  character: Character,
  allCharacters: Map<string, Character>,
  threshold: number,
  direction: 'positive' | 'negative',
): RelationshipSummary[] {
  const rels = (character.relationships ?? {}) as Record<string, any>;
  const results: RelationshipSummary[] = [];
  for (const [id, rel] of Object.entries(rels)) {
    const strength = typeof rel?.strength === 'number' ? rel.strength : 0;
    const match =
      direction === 'positive' ? strength >= threshold : strength <= -threshold;
    if (match) {
      const other = allCharacters.get(id);
      results.push({
        characterName: other
          ? `${other.firstName} ${other.lastName}`
          : 'unknown',
        type: rel?.type ?? 'acquaintance',
        strength,
      });
    }
  }
  return results.slice(0, 5); // cap at 5 to save tokens
}

function eraDescription(world: World): string {
  const year = world.currentGameYear ?? world.historyEndYear;
  if (year != null) return `Year ${year}`;
  return world.worldType ?? 'unknown era';
}

// ── Business-specific context ────────────────────────────────────────

/** Maps business types to conversational role context for shopkeepers/service workers. */
const BUSINESS_ROLE_CONTEXT: Record<string, string> = {
  Bakery: 'You bake and sell bread, pastries, and cakes. You can discuss ingredients, recipes, and daily specials.',
  Restaurant: 'You serve food and drinks. You can recommend dishes, discuss the menu, and chat about local cuisine.',
  Bar: 'You serve drinks and provide a social atmosphere. You hear lots of gossip and local news.',
  GroceryStore: 'You sell groceries and household goods. You know about product availability, prices, and local food sources.',
  Hotel: 'You provide lodging and hospitality. You can recommend local attractions and help with accommodations.',
  Hospital: 'You provide medical care. You can discuss health, treatments, and wellness advice.',
  Bank: 'You handle financial transactions. You can discuss savings, loans, and the local economy.',
  LawFirm: 'You provide legal counsel. You can discuss legal matters, contracts, and local regulations.',
  Shop: 'You sell merchandise. You can discuss your products, prices, and help customers find what they need.',
  Pharmacy: 'You dispense medicines and health products. You can advise on remedies and wellness.',
  School: 'You educate students. You can discuss lessons, student progress, and educational topics.',
  University: 'You teach and research at the university. You can discuss academic subjects and scholarly work.',
  Farm: 'You grow crops and raise livestock. You can discuss farming, seasons, and the harvest.',
  Factory: 'You manufacture goods. You can discuss production, trade, and craftsmanship.',
  Brewery: 'You brew beer and spirits. You can discuss brewing techniques, flavors, and local drinking culture.',
  Church: 'You tend to spiritual matters. You can discuss faith, community events, and moral guidance.',
  PoliceStation: 'You maintain law and order. You can discuss safety, local incidents, and community rules.',
  FireStation: 'You respond to emergencies and fires. You can discuss safety tips and local incidents.',
  TownHall: 'You handle civic affairs. You can discuss local governance, events, and community matters.',
  Daycare: 'You care for children. You can discuss child development, activities, and family matters.',
  JewelryStore: 'You craft and sell jewelry. You can discuss gems, metalwork, and custom pieces.',
  TattoParlor: 'You create tattoo art. You can discuss designs, styles, and the art of tattooing.',
  DentalOffice: 'You provide dental care. You can discuss oral health and dental procedures.',
  OptometryOffice: 'You provide eye care. You can discuss vision health and eyewear.',
  RealEstateOffice: 'You handle property sales and rentals. You can discuss the local housing market and available properties.',
  InsuranceOffice: 'You provide insurance services. You can discuss coverage, claims, and risk management.',
  Mortuary: 'You handle funeral arrangements with dignity. You can discuss memorial services and offer condolences.',
  ApartmentComplex: 'You manage rental housing. You can discuss available units, tenant concerns, and building maintenance.',
};

/** Vocation-specific behavioral hints (applies across business types). */
const VOCATION_BEHAVIOR: Record<string, string> = {
  Owner: 'As the owner, you take pride in your business and care about its reputation and success.',
  Manager: 'As the manager, you oversee daily operations and handle customer issues.',
  Cashier: 'You handle transactions and greet customers at the counter.',
  Waiter: 'You take orders, serve food, and ensure guests are comfortable.',
  Bartender: 'You mix drinks, serve patrons, and lend a listening ear.',
  Baker: 'You prepare baked goods fresh each day and take pride in your craft.',
  Cook: 'You prepare meals in the kitchen and take pride in the quality of your food.',
  Doctor: 'You diagnose and treat patients with professional care and compassion.',
  Nurse: 'You provide patient care and support the medical team.',
  Teacher: 'You educate and mentor your students with patience and dedication.',
  Grocer: 'You keep the shelves stocked and help customers find what they need.',
  Butcher: 'You prepare and sell cuts of meat with expertise.',
  Barber: 'You cut hair and groom clients while making friendly conversation.',
  Farmer: 'You work the land and tend to crops and animals.',
  Innkeeper: 'You welcome guests and ensure their stay is comfortable.',
  Concierge: 'You assist guests with information, recommendations, and special requests.',
};

/**
 * Builds business-specific conversation context for an NPC's workplace.
 * Returns null if the NPC has no relevant business context.
 */
export function buildBusinessContext(
  business: Business | null | undefined,
  vocation: string | null,
  isOwner: boolean,
): string | null {
  if (!business) return null;

  const parts: string[] = [];

  // Business role context
  const roleCtx = BUSINESS_ROLE_CONTEXT[business.businessType];
  if (roleCtx) {
    parts.push(roleCtx);
  }

  // Vocation-specific behavior
  if (vocation) {
    const vocBehavior = VOCATION_BEHAVIOR[vocation];
    if (vocBehavior) {
      parts.push(vocBehavior);
    } else if (isOwner) {
      parts.push(VOCATION_BEHAVIOR['Owner']!);
    }
  }

  // Business founding year for depth
  if (business.foundedYear) {
    parts.push(`${business.name} was founded in year ${business.foundedYear}.`);
  }

  return parts.length > 0 ? parts.join(' ') : null;
}

function playerRelationshipFromCharacter(
  character: Character,
  playerId: string,
): { friendshipLevel: number; romanceStage: string; trust: number; previousTopics: string[] } {
  const rels = (character.relationships ?? {}) as Record<string, any>;
  const rel = rels[playerId];
  if (!rel) {
    return { friendshipLevel: 0, romanceStage: 'none', trust: 0, previousTopics: [] };
  }
  return {
    friendshipLevel: typeof rel.strength === 'number' ? rel.strength : 0,
    romanceStage: rel.type === 'romantic' ? 'romantic' : 'none',
    trust: typeof rel.trust === 'number' ? rel.trust : (typeof rel.strength === 'number' ? rel.strength : 0),
    previousTopics: Array.isArray(rel.topics) ? rel.topics : [],
  };
}

// ── Core builder ──────────────────────────────────────────────────────

export async function buildContext(
  characterId: string,
  playerId: string,
  worldId: string,
  _sessionId: string,
  storageOverride?: ContextManagerStorage,
  gameState?: {
    weather?: WeatherCondition;
    gameHour?: number;
    season?: string;
    activeQuests?: NPCAwareQuest[];
    playerProgress?: { questsCompleted: number; reputation: number; isNewToTown: boolean };
  },
): Promise<FullConversationContext> {
  const storage = storageOverride ?? defaultStorage;

  // Load data in parallel
  const [character, world, allCharacters, languages, occupation, allSettlements] = await Promise.all([
    storage.getCharacter(characterId),
    storage.getWorld(worldId),
    storage.getCharactersByWorld(worldId),
    storage.getWorldLanguagesByWorld(worldId),
    storage.getCurrentOccupation(characterId),
    storage.getSettlementsByWorld(worldId),
  ]);

  if (!character) throw new Error(`Character ${characterId} not found`);
  if (!world) throw new Error(`World ${worldId} not found`);

  // Resolve the character's settlement via their residence
  let characterSettlement: Settlement | undefined;
  if (character.currentResidenceId) {
    const residence = await storage.getResidence(character.currentResidenceId);
    if (residence?.settlementId) {
      characterSettlement = allSettlements.find(s => s.id === residence.settlementId);
    }
  }
  // Fallback: if only one settlement exists, use it
  if (!characterSettlement && allSettlements.length === 1) {
    characterSettlement = allSettlements[0];
  }

  const charMap = new Map<string, Character>();
  for (const c of allCharacters) charMap.set(c.id, c);

  const personality: BigFivePersonality = (character.personality as BigFivePersonality) ?? {
    openness: 0,
    conscientiousness: 0,
    extroversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  // Family names
  const familyIds = [
    ...(character.immediateFamilyIds ?? []),
    ...(character.spouseId ? [character.spouseId] : []),
    ...(character.parentIds ?? []),
    ...(character.childIds ?? []),
  ];
  const family = Array.from(new Set(familyIds))
    .map((id) => {
      const c = charMap.get(id);
      return c ? `${c.firstName} ${c.lastName}` : null;
    })
    .filter(Boolean) as string[];

  // Relationships
  const friendships = extractRelationships(character, charMap, 0.3, 'positive');
  const enemies = extractRelationships(character, charMap, 0.3, 'negative');

  // Occupation / workplace / business context
  const occupationName = occupation?.vocation ?? character.occupation ?? null;
  let workplace: string | null = null;
  let business: Business | null = null;
  if (occupation?.businessId) {
    const biz = await storage.getBusiness(occupation.businessId);
    business = biz ?? null;
    workplace = biz?.name ?? null;
  }
  const isOwner = !!(business && business.ownerId === characterId);
  const businessContext = buildBusinessContext(business, occupationName, isOwner);

  // Language learning
  const targetLang = languages.find((l: WorldLanguage) => l.isLearningTarget);
  let languageLearning: LanguageLearningDirectives | null = null;
  if (targetLang) {
    const playerChar = charMap.get(playerId);
    const playerSkills = (playerChar?.skills ?? {}) as Record<string, number>;
    const proficiency = playerSkills[targetLang.id] ?? playerSkills[targetLang.name] ?? 0;
    const profLabel =
      proficiency >= 0.8
        ? 'advanced'
        : proficiency >= 0.4
          ? 'intermediate'
          : 'beginner';
    languageLearning = {
      targetLanguage: targetLang.name,
      targetLanguageCode: targetLang.realCode ?? null,
      playerProficiency: profLabel,
      learnedVocabulary: Object.keys(playerSkills).filter(
        (k) => k !== targetLang.id && k !== targetLang.name,
      ),
    };
  }

  const worldLanguageNames = languages.map((l: WorldLanguage) => l.name);
  const era = eraDescription(world);
  const weather: WeatherCondition = gameState?.weather ?? 'clear';
  const gameHour = gameState?.gameHour ?? new Date().getHours();
  const timeOfDay = describeTime(gameHour);
  const season = gameState?.season ?? null;
  const activeQuests = gameState?.activeQuests ?? [];
  const playerProgress = gameState?.playerProgress ?? { questsCompleted: 0, reputation: 0, isNewToTown: true };
  const emotion = emotionalState(character);
  const romantic = romanticStatus(character);
  const playerRel = playerRelationshipFromCharacter(character, playerId);

  // Build system prompt (kept concise to fit under 4000 tokens)
  const systemPrompt = buildSystemPrompt({
    character,
    personality,
    occupationName,
    workplace,
    businessContext,
    family,
    romantic,
    friendships,
    enemies,
    emotion,
    timeOfDay,
    weather,
    gameHour,
    season,
    activeQuests,
    playerProgress,
    world,
    era,
    worldLanguageNames,
    languageLearning,
    playerRel,
    settlement: characterSettlement ?? null,
  });

  return {
    characterId,
    characterName: `${character.firstName} ${character.lastName}`,
    personality,
    occupation: occupationName,
    workplace,
    family,
    romanticStatus: romantic,
    friendships,
    enemies,
    emotionalState: emotion,
    currentLocation: character.currentLocation,
    timeOfDay,
    worldName: world.name,
    worldType: world.worldType ?? null,
    era,
    languages: worldLanguageNames,
    culturalSetting: world.description ?? null,
    weather,
    gameHour,
    season,
    activeQuests,
    playerProgress,
    playerRelationship: playerRel,
    languageLearning,
    conversationContext: {
      systemPrompt,
      characterName: `${character.firstName} ${character.lastName}`,
      worldContext: `${world.name} (${era})`,
      characterGender: character.gender ?? undefined,
    },
  };
}

// ── System prompt builder ─────────────────────────────────────────────

interface PromptParts {
  character: Character;
  personality: BigFivePersonality;
  occupationName: string | null;
  workplace: string | null;
  businessContext: string | null;
  family: string[];
  romantic: string;
  friendships: RelationshipSummary[];
  enemies: RelationshipSummary[];
  emotion: string;
  timeOfDay: string;
  weather: WeatherCondition;
  gameHour: number;
  season: string | null;
  activeQuests: NPCAwareQuest[];
  playerProgress: { questsCompleted: number; reputation: number; isNewToTown: boolean };
  world: World;
  era: string;
  worldLanguageNames: string[];
  languageLearning: LanguageLearningDirectives | null;
  playerRel: { friendshipLevel: number; romanceStage: string; trust: number; previousTopics: string[] };
  settlement: Settlement | null;
}

function buildSystemPrompt(p: PromptParts): string {
  const lines: string[] = [];

  // Identity
  lines.push(`You are ${p.character.firstName} ${p.character.lastName}, a character in the world of ${p.world.name}.`);
  if (p.character.gender) lines.push(`Gender: ${p.character.gender}.`);
  if (p.character.birthYear) lines.push(`Born: year ${p.character.birthYear}.`);

  // Personality
  lines.push(`Personality (Big Five): ${personalitySummary(p.personality)}.`);

  // Occupation & workplace context
  if (p.occupationName) {
    lines.push(`Occupation: ${p.occupationName}${p.workplace ? ` at ${p.workplace}` : ''}.`);
  }
  if (p.businessContext) {
    lines.push(`Workplace context: ${p.businessContext}`);
  }

  // Location, time & weather
  if (p.settlement) {
    lines.push(`You live in the ${p.settlement.settlementType} of ${p.settlement.name}.`);
    if (p.settlement.description) {
      const desc = p.settlement.description.length > 150
        ? p.settlement.description.slice(0, 150) + '...'
        : p.settlement.description;
      lines.push(`About ${p.settlement.name}: ${desc}`);
    }
  }
  const weatherDesc = describeWeather(p.weather);
  lines.push(`Current location: ${p.character.currentLocation}. Time: ${p.timeOfDay}. Weather: ${weatherDesc}.`);
  if (p.season) {
    lines.push(`Season: ${p.season}.`);
  }

  // Family
  if (p.family.length > 0) {
    lines.push(`Family: ${p.family.join(', ')}.`);
  }

  // Romantic status
  lines.push(`Romantic status: ${p.romantic}.`);

  // Friends
  if (p.friendships.length > 0) {
    const fList = p.friendships.map((f) => f.characterName).join(', ');
    lines.push(`Friends: ${fList}.`);
  }

  // Enemies
  if (p.enemies.length > 0) {
    const eList = p.enemies.map((e) => e.characterName).join(', ');
    lines.push(`Rivals/enemies: ${eList}.`);
  }

  // Emotional state
  lines.push(`Current mood: ${p.emotion}.`);

  // World context
  lines.push(`World: ${p.world.name}, ${p.era}.`);
  if (p.world.worldType) lines.push(`Setting: ${p.world.worldType}.`);
  if (p.worldLanguageNames.length > 0) {
    lines.push(`Languages spoken: ${p.worldLanguageNames.join(', ')}.`);
  }
  if (p.world.description) {
    // Truncate long descriptions
    const desc = p.world.description.length > 200
      ? p.world.description.slice(0, 200) + '...'
      : p.world.description;
    lines.push(`World description: ${desc}`);
  }

  // Relationship with player
  const relLevel = p.playerRel.friendshipLevel;
  const relLabel =
    relLevel >= 0.6
      ? 'close friend'
      : relLevel >= 0.2
        ? 'friendly acquaintance'
        : relLevel > -0.2
          ? 'stranger'
          : 'disliked';
  lines.push(`Relationship with player: ${relLabel} (trust: ${p.playerRel.trust.toFixed(1)}).`);
  if (p.playerRel.romanceStage !== 'none') {
    lines.push(`Romance stage: ${p.playerRel.romanceStage}.`);
  }
  if (p.playerRel.previousTopics.length > 0) {
    lines.push(`Previously discussed: ${p.playerRel.previousTopics.slice(0, 5).join(', ')}.`);
  }

  // Language learning directives
  if (p.languageLearning) {
    const ll = p.languageLearning;
    lines.push(`\nLANGUAGE LEARNING MODE:`);
    lines.push(`Target language: ${ll.targetLanguage}${ll.targetLanguageCode ? ` (${ll.targetLanguageCode})` : ''}.`);
    lines.push(`Player proficiency: ${ll.playerProficiency}.`);
    if (ll.learnedVocabulary.length > 0) {
      lines.push(`Known vocabulary: ${ll.learnedVocabulary.slice(0, 20).join(', ')}.`);
    }
    lines.push(`Incorporate the target language naturally. For a ${ll.playerProficiency} learner, adjust complexity accordingly.`);
    lines.push(`CRITICAL: Your ENTIRE response is read aloud by TTS. Respond with ONLY natural spoken dialogue — no English translations, no glosses, no parenthetical hints, no vocabulary blocks, no structured data, no markup of any kind.`);
  }

  // Quest awareness — NPC knows about quests they assigned
  const npcQuests = p.activeQuests.filter(q => q.assignedByThisNPC);
  const otherQuests = p.activeQuests.filter(q => !q.assignedByThisNPC && q.status === 'active');
  if (npcQuests.length > 0) {
    const questLines = npcQuests.map(q => {
      if (q.status === 'active') return `"${q.questName}" (in progress — you can ask about progress)`;
      if (q.status === 'completed') return `"${q.questName}" (completed — express gratitude)`;
      if (q.status === 'failed') return `"${q.questName}" (failed — react based on personality)`;
      return `"${q.questName}" (${q.status})`;
    });
    lines.push(`Quests you gave the player: ${questLines.join('; ')}.`);
  }
  if (otherQuests.length > 0 && otherQuests.length <= 3) {
    lines.push(`You've heard the player is working on: ${otherQuests.map(q => q.questName).join(', ')}.`);
  }

  // Player progress awareness
  if (p.playerProgress.isNewToTown) {
    lines.push(`The player is new in town. React based on your personality — welcome them or be cautious.`);
  } else if (p.playerProgress.questsCompleted > 5) {
    lines.push(`The player is well-known locally, having completed ${p.playerProgress.questsCompleted} tasks for the community.`);
  } else if (p.playerProgress.questsCompleted > 0) {
    lines.push(`The player has helped around town (${p.playerProgress.questsCompleted} tasks completed).`);
  }

  // Weather-aware behavioral hint
  if (p.weather === 'storm' || p.weather === 'rain') {
    lines.push(`The weather is ${weatherDesc} — you might comment on it or suggest shelter.`);
  }

  // Main quest NPC context
  if (isMainQuestNPC(p.character)) {
    const mqDef = getMainQuestNPCDefinition(p.character);
    if (mqDef) {
      lines.push(`\nMAIN QUEST ROLE: ${mqDef.role.replace(/_/g, ' ').toUpperCase()}`);
      lines.push(mqDef.conversationContext);
      // Include all chapter hints the NPC has — the LLM will adapt based on conversation
      for (const [chapterId, hint] of Object.entries(mqDef.chapterHints)) {
        lines.push(`[If the player is on ${chapterId}]: ${hint}`);
      }
    }
  }

  // Behavioral instructions
  lines.push(`\nStay in character. Respond as ${p.character.firstName} would based on personality, mood, and current surroundings. Keep responses concise and natural.`);

  return lines.join('\n');
}
