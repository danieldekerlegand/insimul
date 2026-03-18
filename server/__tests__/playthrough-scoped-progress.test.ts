/**
 * Tests that XP, language progress, and CEFR level are scoped to playthrough.
 *
 * Verifies that:
 * 1. Language progress with different playthroughIds are stored separately
 * 2. Vocabulary entries are scoped to playthrough
 * 3. Grammar patterns are scoped to playthrough
 * 4. Conversation records include playthroughId
 * 5. Assessment sessions include playthroughId
 * 6. Queries without playthroughId still return results (backward compat)
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoStorage } from '../db/mongo-storage';

let mongoServer: MongoMemoryServer;
let storage: MongoStorage;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  storage = new MongoStorage(uri);
  await storage.connect();
}, 60000);

afterAll(async () => {
  await storage.disconnect();
  await mongoServer.stop();
}, 30000);

beforeEach(async () => {
  const collections = ['proficiencyprogress', 'knowledgeentries', 'grammarpatterns', 'conversationrecords', 'assessmentsessions'];
  for (const name of collections) {
    try {
      await mongoose.connection.collection(name).deleteMany({});
    } catch {
      // Collection may not exist yet
    }
  }
});

const PLAYER = 'player-1';
const WORLD = 'world-1';
const PT_A = 'playthrough-a';
const PT_B = 'playthrough-b';

describe('Language progress scoped to playthrough', () => {
  it('stores separate progress per playthrough', async () => {
    await storage.upsertLanguageProgress(PLAYER, WORLD, {
      targetLanguage: 'Spanish',
      overallFluency: 30,
      xp: 100,
      level: 2,
    }, PT_A);

    await storage.upsertLanguageProgress(PLAYER, WORLD, {
      targetLanguage: 'Spanish',
      overallFluency: 60,
      xp: 500,
      level: 5,
    }, PT_B);

    const progressA = await storage.getLanguageProgress(PLAYER, WORLD, PT_A);
    const progressB = await storage.getLanguageProgress(PLAYER, WORLD, PT_B);

    expect(progressA).toBeTruthy();
    expect(progressA.xp).toBe(100);
    expect(progressA.level).toBe(2);
    expect(progressA.overallFluency).toBe(30);
    expect(progressA.playthroughId).toBe(PT_A);

    expect(progressB).toBeTruthy();
    expect(progressB.xp).toBe(500);
    expect(progressB.level).toBe(5);
    expect(progressB.overallFluency).toBe(60);
    expect(progressB.playthroughId).toBe(PT_B);
  });

  it('upserts within same playthrough without creating duplicates', async () => {
    await storage.upsertLanguageProgress(PLAYER, WORLD, {
      targetLanguage: 'Spanish',
      xp: 50,
    }, PT_A);

    await storage.upsertLanguageProgress(PLAYER, WORLD, {
      targetLanguage: 'Spanish',
      xp: 150,
    }, PT_A);

    const progress = await storage.getLanguageProgress(PLAYER, WORLD, PT_A);
    expect(progress.xp).toBe(150);
  });

  it('returns null when querying non-existent playthrough', async () => {
    await storage.upsertLanguageProgress(PLAYER, WORLD, {
      targetLanguage: 'Spanish',
      xp: 100,
    }, PT_A);

    const result = await storage.getLanguageProgress(PLAYER, WORLD, 'non-existent');
    expect(result).toBeNull();
  });
});

describe('Vocabulary scoped to playthrough', () => {
  it('stores separate vocabulary per playthrough', async () => {
    await storage.upsertVocabularyEntry(PLAYER, WORLD, 'hola', {
      meaning: 'hello',
      timesEncountered: 5,
      masteryLevel: 'familiar',
    }, PT_A);

    await storage.upsertVocabularyEntry(PLAYER, WORLD, 'hola', {
      meaning: 'hello',
      timesEncountered: 1,
      masteryLevel: 'new',
    }, PT_B);

    const vocabA = await storage.getVocabularyEntries(PLAYER, WORLD, PT_A);
    const vocabB = await storage.getVocabularyEntries(PLAYER, WORLD, PT_B);

    expect(vocabA).toHaveLength(1);
    expect(vocabA[0].timesEncountered).toBe(5);
    expect(vocabA[0].playthroughId).toBe(PT_A);

    expect(vocabB).toHaveLength(1);
    expect(vocabB[0].timesEncountered).toBe(1);
    expect(vocabB[0].playthroughId).toBe(PT_B);
  });
});

describe('Grammar patterns scoped to playthrough', () => {
  it('stores separate grammar patterns per playthrough', async () => {
    await storage.upsertGrammarPattern(PLAYER, WORLD, 'ser vs estar', {
      correctUsages: 10,
      incorrectUsages: 2,
    }, PT_A);

    await storage.upsertGrammarPattern(PLAYER, WORLD, 'ser vs estar', {
      correctUsages: 1,
      incorrectUsages: 5,
    }, PT_B);

    const patternsA = await storage.getGrammarPatterns(PLAYER, WORLD, PT_A);
    const patternsB = await storage.getGrammarPatterns(PLAYER, WORLD, PT_B);

    expect(patternsA).toHaveLength(1);
    expect(patternsA[0].correctUsages).toBe(10);

    expect(patternsB).toHaveLength(1);
    expect(patternsB[0].correctUsages).toBe(1);
  });
});

describe('Conversation records scoped to playthrough', () => {
  it('stores conversation with playthroughId', async () => {
    await storage.createConversationRecord({
      playerId: PLAYER,
      worldId: WORLD,
      playthroughId: PT_A,
      characterId: 'npc-1',
      turns: 5,
      targetLanguagePercentage: 70,
      fluencyGained: 2,
    });

    await storage.createConversationRecord({
      playerId: PLAYER,
      worldId: WORLD,
      playthroughId: PT_B,
      characterId: 'npc-1',
      turns: 3,
      targetLanguagePercentage: 40,
      fluencyGained: 1,
    });

    const convosA = await storage.getConversationRecords(PLAYER, WORLD, PT_A);
    const convosB = await storage.getConversationRecords(PLAYER, WORLD, PT_B);

    expect(convosA).toHaveLength(1);
    expect(convosA[0].turns).toBe(5);

    expect(convosB).toHaveLength(1);
    expect(convosB[0].turns).toBe(3);
  });
});

describe('Assessment sessions scoped to playthrough', () => {
  it('creates assessment with playthroughId', async () => {
    const session = await storage.createAssessmentSession({
      playerId: PLAYER,
      worldId: WORLD,
      playthroughId: PT_A,
      assessmentDefinitionId: 'arrival-encounter',
      assessmentType: 'arrival',
      targetLanguage: 'Spanish',
      status: 'idle',
      phaseResults: [],
      totalMaxPoints: 53,
      createdAt: new Date().toISOString(),
    });

    expect(session.playthroughId).toBe(PT_A);

    const sessions = await storage.getPlayerAssessments(PLAYER, WORLD, undefined, PT_A);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].playthroughId).toBe(PT_A);
  });

  it('CEFR level is scoped to playthrough via assessment session', async () => {
    // Create and complete session for playthrough A
    const sessionA = await storage.createAssessmentSession({
      playerId: PLAYER,
      worldId: WORLD,
      playthroughId: PT_A,
      assessmentDefinitionId: 'arrival-encounter',
      assessmentType: 'arrival',
      targetLanguage: 'Spanish',
      status: 'idle',
      phaseResults: [],
      totalMaxPoints: 53,
      createdAt: new Date().toISOString(),
    });
    await storage.completeAssessmentSession(sessionA.id, 40, 53, 'B1');

    // Create and complete session for playthrough B
    const sessionB = await storage.createAssessmentSession({
      playerId: PLAYER,
      worldId: WORLD,
      playthroughId: PT_B,
      assessmentDefinitionId: 'arrival-encounter',
      assessmentType: 'arrival',
      targetLanguage: 'Spanish',
      status: 'idle',
      phaseResults: [],
      totalMaxPoints: 53,
      createdAt: new Date().toISOString(),
    });
    await storage.completeAssessmentSession(sessionB.id, 15, 53, 'A1');

    // Query by playthrough
    const sessionsA = await storage.getPlayerAssessments(PLAYER, WORLD, undefined, PT_A);
    const sessionsB = await storage.getPlayerAssessments(PLAYER, WORLD, undefined, PT_B);

    expect(sessionsA).toHaveLength(1);
    expect(sessionsA[0].cefrLevel).toBe('B1');

    expect(sessionsB).toHaveLength(1);
    expect(sessionsB[0].cefrLevel).toBe('A1');
  });
});

describe('Backward compatibility', () => {
  it('queries without playthroughId return all records', async () => {
    await storage.upsertLanguageProgress(PLAYER, WORLD, {
      targetLanguage: 'Spanish',
      xp: 100,
    }, PT_A);

    await storage.upsertLanguageProgress(PLAYER, WORLD, {
      targetLanguage: 'Spanish',
      xp: 200,
    }, PT_B);

    // Query without playthroughId — should return one (first match)
    const progress = await storage.getLanguageProgress(PLAYER, WORLD);
    expect(progress).toBeTruthy();
    // The result should be one of the two records
    expect([100, 200]).toContain(progress.xp);
  });

  it('vocabulary query without playthroughId returns all entries', async () => {
    await storage.upsertVocabularyEntry(PLAYER, WORLD, 'hola', {
      meaning: 'hello',
    }, PT_A);

    await storage.upsertVocabularyEntry(PLAYER, WORLD, 'adios', {
      meaning: 'goodbye',
    }, PT_B);

    const allVocab = await storage.getVocabularyEntries(PLAYER, WORLD);
    expect(allVocab).toHaveLength(2);
  });
});
