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

function timeOfDayFromDate(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
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

  // Occupation / workplace
  const occupationName = occupation?.vocation ?? character.occupation ?? null;
  let workplace: string | null = null;
  if (occupation?.businessId) {
    const biz = await storage.getBusiness(occupation.businessId);
    workplace = biz?.name ?? null;
  }

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
  const timeOfDay = timeOfDayFromDate();
  const emotion = emotionalState(character);
  const romantic = romanticStatus(character);
  const playerRel = playerRelationshipFromCharacter(character, playerId);

  // Build system prompt (kept concise to fit under 4000 tokens)
  const systemPrompt = buildSystemPrompt({
    character,
    personality,
    occupationName,
    workplace,
    family,
    romantic,
    friendships,
    enemies,
    emotion,
    timeOfDay,
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
  family: string[];
  romantic: string;
  friendships: RelationshipSummary[];
  enemies: RelationshipSummary[];
  emotion: string;
  timeOfDay: string;
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

  // Occupation
  if (p.occupationName) {
    lines.push(`Occupation: ${p.occupationName}${p.workplace ? ` at ${p.workplace}` : ''}.`);
  }

  // Location & time
  if (p.settlement) {
    lines.push(`You live in the ${p.settlement.settlementType} of ${p.settlement.name}.`);
    if (p.settlement.description) {
      const desc = p.settlement.description.length > 150
        ? p.settlement.description.slice(0, 150) + '...'
        : p.settlement.description;
      lines.push(`About ${p.settlement.name}: ${desc}`);
    }
  }
  lines.push(`Current location: ${p.character.currentLocation}. Time: ${p.timeOfDay}.`);

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

  // Behavioral instructions
  lines.push(`\nStay in character. Respond as ${p.character.firstName} would based on personality and mood. Keep responses concise and natural.`);

  return lines.join('\n');
}
