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
import type { VocabularyEntry, GrammarPattern } from '@shared/language/progress';
import {
  getReviewWordsForNPC,
  getWeakGrammarPatterns,
  buildVocabGrammarPrompt,
  type ReviewWordForNPC,
  type WeakGrammarPattern,
} from '@shared/language/npc-conversation-prompts';
import { getMainQuestNPCDefinition, isMainQuestNPC } from '@shared/quest/main-quest-npcs';
import { generateMVTContext } from '@shared/prolog/mvt-context';
import type { SerializedFact } from '@shared/game-engine/logic/GameTruthSync';
import type { CEFRLevel } from '@shared/assessment/cefr-mapping';
import { assignNPCLanguageMode, buildLanguageModeDirective } from '@shared/language/cefr-adaptation';

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
  cefrLevel: CEFRLevel;
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
    playerVocabulary?: VocabularyEntry[];
    playerGrammarPatterns?: GrammarPattern[];
    prologFacts?: SerializedFact[];
    cefrLevel?: string;
  },
  turnNumber: number = 1,
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
  let targetLang = languages.find((l: WorldLanguage) => l.isLearningTarget);

  // Fallback: if no language has isLearningTarget, check world.targetLanguage or world.gameType
  if (!targetLang && world.targetLanguage && world.targetLanguage !== 'English') {
    console.warn('[Context] No isLearningTarget in languages, falling back to world.targetLanguage:', world.targetLanguage);
    // Find matching language in languages collection, or construct a minimal one
    const matchingLang = languages.find((l: WorldLanguage) => l.name === world.targetLanguage);
    if (matchingLang) {
      targetLang = matchingLang;
    } else {
      targetLang = { name: world.targetLanguage!, realCode: null, id: world.targetLanguage!, isLearningTarget: true, worldId: worldId, scopeType: 'world', scopeId: worldId, kind: 'real', isPrimary: false } as WorldLanguage;
    }
  } else if (!targetLang && world.gameType === 'language-learning') {
    // If gameType is language-learning but no targetLanguage is set, check for any non-English language
    const nonEnglish = languages.find((l: WorldLanguage) => l.name !== 'English');
    if (nonEnglish) {
      console.warn('[Context] No isLearningTarget in languages, falling back to gameType=language-learning + first non-English language:', nonEnglish.name);
      targetLang = nonEnglish;
    }
  }

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

    // Map proficiency label to CEFR level; prefer explicit gameState.cefrLevel if available
    const cefrLevel: CEFRLevel = gameState?.cefrLevel as CEFRLevel
      ?? (profLabel === 'advanced' ? 'B2' : profLabel === 'intermediate' ? 'B1' : 'A1');

    languageLearning = {
      targetLanguage: targetLang.name,
      targetLanguageCode: targetLang.realCode ?? null,
      playerProficiency: profLabel,
      cefrLevel,
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

  // Compute vocabulary review words and weak grammar patterns
  const reviewWords = languageLearning && gameState?.playerVocabulary
    ? getReviewWordsForNPC(gameState.playerVocabulary)
    : [];
  const weakGrammarPatterns = languageLearning && gameState?.playerGrammarPatterns
    ? getWeakGrammarPatterns(gameState.playerGrammarPatterns)
    : [];

  // Generate MVT context from Prolog facts (if provided by client)
  const mvtContext = gameState?.prologFacts
    ? generateMVTContext(gameState.prologFacts)
    : null;

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
    reviewWords,
    weakGrammarPatterns,
    playerRel,
    settlement: characterSettlement ?? null,
    mvtContext: mvtContext || null,
    turnNumber,
  });

  // ── Debug: log the constructed server-side system prompt ──
  console.debug('[LLM:Context] ══════════════════════════════════════════');
  console.debug('[LLM:Context] Built system prompt for:', `${character.firstName} ${character.lastName}`);
  console.debug('[LLM:Context] Language learning:', languageLearning ? `target=${languageLearning.targetLanguage}, proficiency=${languageLearning.playerProficiency}` : 'disabled');
  console.debug('[LLM:Context] Review words:', reviewWords.length, '| Weak grammar patterns:', weakGrammarPatterns.length);
  console.debug('[LLM:Context] Active quests:', activeQuests.length);
  console.debug('[LLM:Context] MVT context:', mvtContext ? `${mvtContext.length} chars` : 'none');
  console.debug('[LLM:Context] ── FULL SYSTEM PROMPT ──');
  console.debug(systemPrompt);
  console.debug('[LLM:Context] ══════════════════════════════════════════');

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
  reviewWords: ReviewWordForNPC[];
  weakGrammarPatterns: WeakGrammarPattern[];
  playerRel: { friendshipLevel: number; romanceStage: string; trust: number; previousTopics: string[] };
  settlement: Settlement | null;
  mvtContext: string | null;
  turnNumber: number;
}

/** Estimated token count for a string (~4 chars per token). */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Section-level token counts logged on each prompt build. */
export interface PromptSectionTokens {
  character: number;
  world: number;
  environment: number;
  relationships: number;
  quests: number;
  language: number;
  total: number;
  turnNumber: number;
}

/** Last computed section token counts (for metrics/debugging). */
let _lastSectionTokens: PromptSectionTokens | null = null;

/** Returns the token counts from the most recent buildSystemPrompt() call. */
export function getLastPromptSectionTokens(): PromptSectionTokens | null {
  return _lastSectionTokens;
}

function buildSystemPrompt(p: PromptParts): string {
  const isFollowUp = p.turnNumber >= 2;
  const sectionLines: Record<string, string[]> = {
    character: [],
    world: [],
    environment: [],
    relationships: [],
    quests: [],
    language: [],
  };

  // ── Character section (always full) ────────────────────────────────
  sectionLines.character.push(`You are ${p.character.firstName} ${p.character.lastName}, a character in the world of ${p.world.name}.`);
  if (p.character.gender) sectionLines.character.push(`Gender: ${p.character.gender}.`);
  if (p.character.birthYear) sectionLines.character.push(`Born: year ${p.character.birthYear}.`);
  sectionLines.character.push(`Personality (Big Five): ${personalitySummary(p.personality)}.`);
  if (p.occupationName) {
    sectionLines.character.push(`Occupation: ${p.occupationName}${p.workplace ? ` at ${p.workplace}` : ''}.`);
  }
  if (p.businessContext) {
    sectionLines.character.push(`Workplace context: ${p.businessContext}`);
  }

  // ── World section (condensed on follow-up) ─────────────────────────
  if (isFollowUp) {
    // Condensed: one-line world reference
    sectionLines.world.push(`World: ${p.world.name}, ${p.era}.`);
  } else {
    sectionLines.world.push(`World: ${p.world.name}, ${p.era}.`);
    if (p.world.worldType) sectionLines.world.push(`Setting: ${p.world.worldType}.`);
    if (p.worldLanguageNames.length > 0) {
      sectionLines.world.push(`Languages spoken: ${p.worldLanguageNames.join(', ')}.`);
    }
    if (p.world.description) {
      const desc = p.world.description.length > 200
        ? p.world.description.slice(0, 200) + '...'
        : p.world.description;
      sectionLines.world.push(`World description: ${desc}`);
    }
  }

  // ── Environment section (condensed on follow-up) ───────────────────
  const weatherDesc = describeWeather(p.weather);
  if (isFollowUp) {
    // Condensed: just time and weather on one line, skip settlement description
    sectionLines.environment.push(`Location: ${p.character.currentLocation}. Time: ${p.timeOfDay}. Weather: ${weatherDesc}.`);
  } else {
    if (p.settlement) {
      sectionLines.environment.push(`You live in the ${p.settlement.settlementType} of ${p.settlement.name}.`);
      if (p.settlement.description) {
        const desc = p.settlement.description.length > 150
          ? p.settlement.description.slice(0, 150) + '...'
          : p.settlement.description;
        sectionLines.environment.push(`About ${p.settlement.name}: ${desc}`);
      }
    }
    sectionLines.environment.push(`Current location: ${p.character.currentLocation}. Time: ${p.timeOfDay}. Weather: ${weatherDesc}.`);
    if (p.season) {
      sectionLines.environment.push(`Season: ${p.season}.`);
    }
  }

  // ── Relationships section (always full for player rel, condensed others) ──
  if (!isFollowUp) {
    if (p.family.length > 0) {
      sectionLines.relationships.push(`Family: ${p.family.join(', ')}.`);
    }
    sectionLines.relationships.push(`Romantic status: ${p.romantic}.`);
    if (p.friendships.length > 0) {
      const fList = p.friendships.map((f) => f.characterName).join(', ');
      sectionLines.relationships.push(`Friends: ${fList}.`);
    }
    if (p.enemies.length > 0) {
      const eList = p.enemies.map((e) => e.characterName).join(', ');
      sectionLines.relationships.push(`Rivals/enemies: ${eList}.`);
    }
  }
  sectionLines.relationships.push(`Current mood: ${p.emotion}.`);

  // Player relationship — always full
  const relLevel = p.playerRel.friendshipLevel;
  const relLabel =
    relLevel >= 0.6
      ? 'close friend'
      : relLevel >= 0.2
        ? 'friendly acquaintance'
        : relLevel > -0.2
          ? 'stranger'
          : 'disliked';
  sectionLines.relationships.push(`Relationship with player: ${relLabel} (trust: ${p.playerRel.trust.toFixed(1)}).`);
  if (p.playerRel.romanceStage !== 'none') {
    sectionLines.relationships.push(`Romance stage: ${p.playerRel.romanceStage}.`);
  }
  if (p.playerRel.previousTopics.length > 0) {
    sectionLines.relationships.push(`Previously discussed: ${p.playerRel.previousTopics.slice(0, 5).join(', ')}.`);
  }

  // Player game state (from Prolog MVT facts) — only on turn 1
  if (p.mvtContext && !isFollowUp) {
    sectionLines.relationships.push(`\n${p.mvtContext}`);
  }

  // ── Language section (always full) ─────────────────────────────────
  if (p.languageLearning) {
    const ll = p.languageLearning;
    sectionLines.language.push(`\nLANGUAGE LEARNING MODE:`);
    sectionLines.language.push(`Target language: ${ll.targetLanguage}${ll.targetLanguageCode ? ` (${ll.targetLanguageCode})` : ''}.`);
    sectionLines.language.push(`Player proficiency: ${ll.playerProficiency}${ll.cefrLevel ? ` (CEFR ${ll.cefrLevel})` : ''}.`);
    if (ll.learnedVocabulary.length > 0) {
      sectionLines.language.push(`Known vocabulary: ${ll.learnedVocabulary.slice(0, 20).join(', ')}.`);
    }
    // CEFR-aware NPC language mode directive (simplified/natural/bilingual) with frequency constraints
    if (ll.cefrLevel) {
      const npcMode = assignNPCLanguageMode(ll.cefrLevel, p.character.id);
      const modeDirective = buildLanguageModeDirective(npcMode, ll.targetLanguage, 'English', ll.cefrLevel);
      sectionLines.language.push(modeDirective);
    } else {
      sectionLines.language.push(`Incorporate the target language naturally. For a ${ll.playerProficiency} learner, adjust complexity accordingly.`);
    }
    sectionLines.language.push(`CRITICAL: Your ENTIRE response is read aloud by TTS. Respond with ONLY natural spoken dialogue — no English translations, no glosses, no parenthetical hints, no vocabulary blocks, no structured data, no markup of any kind.`);

    const vocabGrammarPrompt = buildVocabGrammarPrompt({
      reviewWords: p.reviewWords,
      weakGrammarPatterns: p.weakGrammarPatterns,
      playerProficiency: ll.playerProficiency,
      targetLanguage: ll.targetLanguage,
    });
    if (vocabGrammarPrompt) {
      sectionLines.language.push(vocabGrammarPrompt);
    }

  }

  // ── Quest section (condensed on follow-up) ─────────────────────────
  const npcQuests = p.activeQuests.filter(q => q.assignedByThisNPC);
  const otherQuests = p.activeQuests.filter(q => !q.assignedByThisNPC && q.status === 'active');

  if (isFollowUp) {
    // Condensed: IDs + current objective only
    if (npcQuests.length > 0) {
      const condensed = npcQuests.map(q => `"${q.questName}" (${q.status})`).join('; ');
      sectionLines.quests.push(`Your quests for player: ${condensed}.`);
    }
  } else {
    if (npcQuests.length > 0) {
      const questLines = npcQuests.map(q => {
        if (q.status === 'active') return `"${q.questName}" (in progress — you can ask about progress)`;
        if (q.status === 'completed') return `"${q.questName}" (completed — express gratitude)`;
        if (q.status === 'failed') return `"${q.questName}" (failed — react based on personality)`;
        return `"${q.questName}" (${q.status})`;
      });
      sectionLines.quests.push(`Quests you gave the player: ${questLines.join('; ')}.`);
    }
    if (otherQuests.length > 0 && otherQuests.length <= 3) {
      sectionLines.quests.push(`You've heard the player is working on: ${otherQuests.map(q => q.questName).join(', ')}.`);
    }
  }

  // Player progress — only on turn 1
  if (!isFollowUp) {
    if (p.playerProgress.isNewToTown) {
      sectionLines.quests.push(`The player is new in town. React based on your personality — welcome them or be cautious.`);
    } else if (p.playerProgress.questsCompleted > 5) {
      sectionLines.quests.push(`The player is well-known locally, having completed ${p.playerProgress.questsCompleted} tasks for the community.`);
    } else if (p.playerProgress.questsCompleted > 0) {
      sectionLines.quests.push(`The player has helped around town (${p.playerProgress.questsCompleted} tasks completed).`);
    }
  }

  // Weather-aware behavioral hint — only on turn 1
  if (!isFollowUp && (p.weather === 'storm' || p.weather === 'rain')) {
    sectionLines.environment.push(`The weather is ${weatherDesc} — you might comment on it or suggest shelter.`);
  }

  // Main quest NPC context — always included (important for quest NPCs)
  if (isMainQuestNPC(p.character)) {
    const mqDef = getMainQuestNPCDefinition(p.character);
    if (mqDef) {
      sectionLines.quests.push(`\nMAIN QUEST ROLE: ${mqDef.role.replace(/_/g, ' ').toUpperCase()}`);
      sectionLines.quests.push(mqDef.conversationContext);
      for (const [chapterId, hint] of Object.entries(mqDef.chapterHints)) {
        sectionLines.quests.push(`[If the player is on ${chapterId}]: ${hint}`);
      }
    }
  }

  // ── Assemble final prompt ──────────────────────────────────────────
  const lines: string[] = [
    ...sectionLines.character,
    ...sectionLines.environment,
    ...sectionLines.relationships,
    ...sectionLines.world,
    ...sectionLines.language,
    ...sectionLines.quests,
  ];

  // Behavioral instructions (always included)
  lines.push(`\nStay in character. Respond as ${p.character.firstName} would based on personality, mood, and current surroundings. Keep responses concise and natural.`);
  lines.push(`IMPORTANT: Your response is read aloud by text-to-speech. Do NOT include action descriptions, stage directions, or narration (e.g., *sighs*, *looks around*, *pauses*). Write ONLY spoken dialogue — the words ${p.character.firstName} would actually say out loud.`);

  // CRITICAL LANGUAGE RULE — placed at the very end of the prompt to maximize LLM compliance
  if (p.languageLearning) {
    lines.push(`\nCRITICAL LANGUAGE RULE: Your ENTIRE response must be in ${p.languageLearning.targetLanguage}. Do NOT use English. Every word must be in ${p.languageLearning.targetLanguage}. This is non-negotiable.`);
  }

  const prompt = lines.join('\n');

  // Log section token counts
  _lastSectionTokens = {
    character: estimateTokens(sectionLines.character.join('\n')),
    world: estimateTokens(sectionLines.world.join('\n')),
    environment: estimateTokens(sectionLines.environment.join('\n')),
    relationships: estimateTokens(sectionLines.relationships.join('\n')),
    quests: estimateTokens(sectionLines.quests.join('\n')),
    language: estimateTokens(sectionLines.language.join('\n')),
    total: estimateTokens(prompt),
    turnNumber: p.turnNumber,
  };

  return prompt;
}
