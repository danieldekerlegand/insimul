/**
 * Unit tests for conversation context manager
 *
 * Tests:
 * - buildContext produces correct structure from mock world data
 * - Context includes character personality, occupation, relationships
 * - Language-learning directives included when world has learning target
 * - System prompt serializes under 4000 tokens (~16000 chars)
 * - Player relationship correctly extracted
 */

import type { Character, World, Occupation, Business } from '@shared/schema';
import type { WorldLanguage } from '@shared/language';
import type { ContextManagerStorage } from '../services/conversation/context-manager.js';
import { buildContext } from '../services/conversation/context-manager.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

// ── Mock data ─────────────────────────────────────────────────────────

const mockCharacter: Character = {
  id: 'char-1',
  worldId: 'world-1',
  firstName: 'Elena',
  middleName: null,
  lastName: 'Vasquez',
  suffix: null,
  maidenName: null,
  birthYear: 1955,
  isAlive: true,
  gender: 'female',
  personality: {
    openness: 0.7,
    conscientiousness: 0.5,
    extroversion: -0.3,
    agreeableness: 0.8,
    neuroticism: -0.1,
  },
  physicalTraits: {},
  mentalTraits: {},
  skills: {},
  memory: 0.7,
  mentalModels: {},
  thoughts: [
    { emotion: 'content', timestamp: Date.now() },
    { emotion: 'anxious', timestamp: Date.now() - 100000 },
  ],
  relationships: {
    'player-1': { type: 'friendship', strength: 0.5, trust: 0.6, topics: ['weather', 'market'] },
    'char-2': { type: 'friendship', strength: 0.8 },
    'char-3': { type: 'rivalry', strength: -0.5 },
  },
  socialAttributes: {},
  coworkerIds: [],
  friendIds: ['char-2'],
  neighborIds: [],
  immediateFamilyIds: ['char-4'],
  extendedFamilyIds: [],
  parentIds: [],
  childIds: [],
  spouseId: 'char-5',
  genealogyData: {},
  generationMethod: 'tott',
  generationConfig: {},
  currentLocation: 'Town Square',
  occupation: 'Baker',
  status: 'active',
  currentOccupationId: 'occ-1',
  currentResidenceId: 'res-1',
  collegeGraduate: false,
  retired: false,
  departureYear: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

const mockPlayer: Character = {
  ...mockCharacter,
  id: 'player-1',
  firstName: 'Player',
  lastName: 'One',
  skills: { 'French': 0.3, 'lang-1': 0.5 },
  relationships: {},
  thoughts: [],
  personality: {
    openness: 0,
    conscientiousness: 0,
    extroversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  },
} as any;

const mockFriend: Character = {
  ...mockCharacter,
  id: 'char-2',
  firstName: 'Marco',
  lastName: 'Silva',
  relationships: {},
} as any;

const mockEnemy: Character = {
  ...mockCharacter,
  id: 'char-3',
  firstName: 'Diego',
  lastName: 'Reyes',
  relationships: {},
} as any;

const mockFamily1: Character = {
  ...mockCharacter,
  id: 'char-4',
  firstName: 'Sofia',
  lastName: 'Vasquez',
  relationships: {},
} as any;

const mockSpouse: Character = {
  ...mockCharacter,
  id: 'char-5',
  firstName: 'Carlos',
  lastName: 'Vasquez',
  relationships: {},
} as any;

const mockWorld: World = {
  id: 'world-1',
  name: 'Pueblo Bonito',
  description: 'A small Latin American town in the highlands.',
  targetLanguage: null,
  worldType: 'medieval-fantasy',
  gameType: 'language-learning',
  ownerId: null,
  visibility: 'private',
  isTemplate: false,
  allowedUserIds: [],
  maxPlayers: null,
  requiresAuth: false,
  selectedAssetCollectionId: null,
  cameraPerspective: null,
  timestepUnit: 'year',
  gameplayTimestepUnit: 'day',
  customTimestepLabel: null,
  customTimestepDurationMs: null,
  historyStartYear: 1839,
  historyEndYear: 1979,
  currentGameYear: 1980,
  config: {},
  generationConfig: {},
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

const mockOccupation: Occupation = {
  id: 'occ-1',
  worldId: 'world-1',
  characterId: 'char-1',
  businessId: 'biz-1',
  vocation: 'Baker',
  level: 2,
  shift: 'day',
  startYear: 1970,
  endYear: null,
  yearsExperience: 10,
  terminationReason: null,
  predecessorId: null,
} as any;

const mockBusiness: Business = {
  id: 'biz-1',
  worldId: 'world-1',
  settlementId: 'set-1',
  name: 'La Panadería',
  businessType: 'Bakery',
  ownerId: 'char-1',
} as any;

const mockLanguage: WorldLanguage = {
  id: 'lang-1',
  worldId: 'world-1',
  scopeType: 'world',
  scopeId: 'world-1',
  name: 'Spanish',
  description: 'The primary language',
  kind: 'real',
  realCode: 'es',
  isPrimary: true,
  isLearningTarget: true,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

const mockLanguageNoTarget: WorldLanguage = {
  ...mockLanguage,
  id: 'lang-2',
  name: 'Common',
  isLearningTarget: false,
  realCode: null,
} as any;

// ── Mock storage ──────────────────────────────────────────────────────

const allChars = [mockCharacter, mockPlayer, mockFriend, mockEnemy, mockFamily1, mockSpouse];

function createMockStorage(languageOverride?: WorldLanguage[]): ContextManagerStorage {
  return {
    getCharacter: async (id: string) => allChars.find((c) => c.id === id),
    getWorld: async (id: string) => (id === 'world-1' ? mockWorld : undefined),
    getCharactersByWorld: async (_worldId: string) => allChars,
    getWorldLanguagesByWorld: async (_worldId: string) => languageOverride ?? [mockLanguage],
    getCurrentOccupation: async (charId: string) =>
      charId === 'char-1' ? mockOccupation : undefined,
    getBusiness: async (id: string) => (id === 'biz-1' ? mockBusiness : undefined),
  };
}

// ── Tests ─────────────────────────────────────────────────────────────

async function runTests() {
  console.log('=== Context Manager Tests ===\n');

  const mockStore = createMockStorage();

  // Test 1: Basic structure
  console.log('Test 1: buildContext returns correct structure');
  const ctx = await buildContext('char-1', 'player-1', 'world-1', 'session-1', mockStore);
  assert(ctx.characterId === 'char-1', 'characterId matches');
  assert(ctx.characterName === 'Elena Vasquez', 'characterName matches');
  assert(ctx.worldName === 'Pueblo Bonito', 'worldName matches');

  // Test 2: Personality
  console.log('\nTest 2: Personality extracted correctly');
  assert(ctx.personality.openness === 0.7, 'openness value correct');
  assert(ctx.personality.agreeableness === 0.8, 'agreeableness value correct');
  assert(ctx.personality.extroversion === -0.3, 'extroversion value correct');

  // Test 3: Occupation
  console.log('\nTest 3: Occupation and workplace');
  assert(ctx.occupation === 'Baker', 'occupation is Baker');
  assert(ctx.workplace === 'La Panadería', 'workplace is La Panadería');

  // Test 4: Relationships
  console.log('\nTest 4: Relationships extracted');
  assert(ctx.friendships.length > 0, 'has friendships');
  assert(
    ctx.friendships.some((f) => f.characterName === 'Marco Silva'),
    'Marco Silva is a friend',
  );
  assert(ctx.enemies.length > 0, 'has enemies');
  assert(
    ctx.enemies.some((e) => e.characterName === 'Diego Reyes'),
    'Diego Reyes is an enemy',
  );

  // Test 5: Family
  console.log('\nTest 5: Family members');
  assert(ctx.family.length > 0, 'has family members');
  assert(ctx.romanticStatus === 'married', 'romantic status is married (has spouse)');

  // Test 6: Emotional state
  console.log('\nTest 6: Emotional state from thoughts');
  assert(ctx.emotionalState === 'content', 'most recent emotion is content');

  // Test 7: Player relationship
  console.log('\nTest 7: Player relationship');
  assert(ctx.playerRelationship.friendshipLevel === 0.5, 'friendship level correct');
  assert(ctx.playerRelationship.trust === 0.6, 'trust correct');
  assert(
    ctx.playerRelationship.previousTopics.includes('weather'),
    'previous topics include weather',
  );

  // Test 8: Language learning directives
  console.log('\nTest 8: Language learning directives');
  assert(ctx.languageLearning !== null, 'language learning present');
  assert(ctx.languageLearning!.targetLanguage === 'Spanish', 'target language is Spanish');
  assert(ctx.languageLearning!.targetLanguageCode === 'es', 'language code is es');
  assert(ctx.languageLearning!.playerProficiency === 'intermediate', 'player proficiency is intermediate (skill 0.5)');

  // Test 9: World context
  console.log('\nTest 9: World context');
  assert(ctx.era === 'Year 1980', 'era derived from currentGameYear');
  assert(ctx.worldType === 'medieval-fantasy', 'world type present');
  assert(ctx.languages.includes('Spanish'), 'languages includes Spanish');

  // Test 10: Conversation context for LLM
  console.log('\nTest 10: ConversationContext for LLM provider');
  assert(typeof ctx.conversationContext.systemPrompt === 'string', 'system prompt is string');
  assert(ctx.conversationContext.systemPrompt.length > 0, 'system prompt is non-empty');
  assert(
    ctx.conversationContext.systemPrompt.length < 16000,
    `system prompt under 16000 chars (${ctx.conversationContext.systemPrompt.length} chars)`,
  );
  assert(
    ctx.conversationContext.characterName === 'Elena Vasquez',
    'conversationContext.characterName matches',
  );
  assert(
    ctx.conversationContext.worldContext === 'Pueblo Bonito (Year 1980)',
    'conversationContext.worldContext matches',
  );

  // Test 11: System prompt content checks
  console.log('\nTest 11: System prompt content');
  const sp = ctx.conversationContext.systemPrompt;
  assert(sp.includes('Elena Vasquez'), 'prompt includes character name');
  assert(sp.includes('Baker'), 'prompt includes occupation');
  assert(sp.includes('La Panadería'), 'prompt includes workplace');
  assert(sp.includes('Pueblo Bonito'), 'prompt includes world name');
  assert(sp.includes('LANGUAGE LEARNING MODE'), 'prompt includes language learning mode');
  assert(sp.includes('Spanish'), 'prompt includes target language');

  // Test 12: No language learning when world has no learning target
  console.log('\nTest 12: No language learning for non-learning world');
  const noLangStore = createMockStorage([mockLanguageNoTarget]);
  const ctx2 = await buildContext('char-1', 'player-1', 'world-1', 'session-2', noLangStore);
  assert(ctx2.languageLearning === null, 'languageLearning is null when no learning target');
  assert(
    !ctx2.conversationContext.systemPrompt.includes('LANGUAGE LEARNING MODE'),
    'no language learning in prompt',
  );

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
