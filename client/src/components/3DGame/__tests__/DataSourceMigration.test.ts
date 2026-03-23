/**
 * Tests for LanguageProgressTracker and ConversationClient DataSource migration.
 *
 * Verifies that:
 * 1. LanguageProgressTracker uses DataSource.loadLanguageProgress instead of fetch
 * 2. LanguageProgressTracker uses DataSource.saveLanguageProgress instead of fetch
 * 3. ConversationClient uses DataSource.checkConversationHealth instead of fetch
 * 4. FileDataSource persists language progress to localStorage
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LanguageProgressTracker } from '../LanguageProgressTracker';
import { ConversationClient } from '../ConversationClient';
import type { DataSource } from '../DataSource';

function createMockDataSource(overrides: Partial<DataSource> = {}): DataSource {
  return {
    questOverlay: null,
    loadWorld: vi.fn().mockResolvedValue({}),
    loadCharacters: vi.fn().mockResolvedValue([]),
    loadActions: vi.fn().mockResolvedValue([]),
    loadBaseActions: vi.fn().mockResolvedValue([]),
    loadQuests: vi.fn().mockResolvedValue([]),
    loadSettlements: vi.fn().mockResolvedValue([]),
    loadRules: vi.fn().mockResolvedValue([]),
    loadBaseRules: vi.fn().mockResolvedValue([]),
    loadCountries: vi.fn().mockResolvedValue([]),
    loadStates: vi.fn().mockResolvedValue([]),
    loadBaseResources: vi.fn().mockResolvedValue({}),
    loadAssets: vi.fn().mockResolvedValue([]),
    loadConfig3D: vi.fn().mockResolvedValue({}),
    loadTruths: vi.fn().mockResolvedValue([]),
    loadCharacter: vi.fn().mockResolvedValue(null),
    listPlaythroughs: vi.fn().mockResolvedValue([]),
    startPlaythrough: vi.fn().mockResolvedValue(null),
    updateQuest: vi.fn().mockResolvedValue(undefined),
    loadSettlementBusinesses: vi.fn().mockResolvedValue([]),
    loadSettlementLots: vi.fn().mockResolvedValue([]),
    loadSettlementResidences: vi.fn().mockResolvedValue([]),
    payFines: vi.fn().mockResolvedValue(null),
    getEntityInventory: vi.fn().mockResolvedValue({ items: [], gold: 0 }),
    transferItem: vi.fn().mockResolvedValue({ success: false }),
    getMerchantInventory: vi.fn().mockResolvedValue(null),
    loadPrologContent: vi.fn().mockResolvedValue(null),
    loadWorldItems: vi.fn().mockResolvedValue([]),
    loadContainers: vi.fn().mockResolvedValue([]),
    loadContainersByLocation: vi.fn().mockResolvedValue([]),
    updateContainer: vi.fn().mockResolvedValue(null),
    transferContainerItem: vi.fn().mockResolvedValue(null),
    saveGameState: vi.fn().mockResolvedValue(undefined),
    loadGameState: vi.fn().mockResolvedValue(null),
    deleteGameState: vi.fn().mockResolvedValue(undefined),
    saveQuestProgress: vi.fn().mockResolvedValue(undefined),
    loadQuestProgress: vi.fn().mockResolvedValue(null),
    loadGeography: vi.fn().mockResolvedValue(null),
    loadAIConfig: vi.fn().mockResolvedValue(null),
    loadDialogueContexts: vi.fn().mockResolvedValue([]),
    saveConversation: vi.fn().mockResolvedValue({}),
    updateConversation: vi.fn().mockResolvedValue({}),
    getConversations: vi.fn().mockResolvedValue([]),
    getPlaythrough: vi.fn().mockResolvedValue(null),
    markPlaythroughInitialized: vi.fn().mockResolvedValue(undefined),
    loadPlaythroughRelationships: vi.fn().mockResolvedValue([]),
    updatePlaythroughRelationship: vi.fn().mockResolvedValue(null),
    loadLanguageProgress: vi.fn().mockResolvedValue(null),
    saveLanguageProgress: vi.fn().mockResolvedValue(true),
    checkConversationHealth: vi.fn().mockResolvedValue(false),
    ...overrides,
  };
}

describe('LanguageProgressTracker DataSource migration', () => {
  let tracker: LanguageProgressTracker;
  let mockDs: DataSource;

  beforeEach(() => {
    tracker = new LanguageProgressTracker('player1', 'world1', 'Spanish', 'pt1');
    mockDs = createMockDataSource();
    tracker.setDataSource(mockDs);
  });

  afterEach(() => {
    tracker.dispose();
  });

  it('should call DataSource.loadLanguageProgress in loadFromServer', async () => {
    (mockDs.loadLanguageProgress as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      progress: { overallFluency: 42, totalConversations: 3, totalWordsLearned: 7, streakDays: 1 },
      vocabulary: [
        { word: 'hola', meaning: 'hello', category: 'greetings', timesEncountered: 5, timesUsedCorrectly: 3, masteryLevel: 'familiar' },
      ],
      grammarPatterns: [],
      conversations: [],
    });

    const result = await tracker.loadFromServer();

    expect(result).toBe(true);
    expect(mockDs.loadLanguageProgress).toHaveBeenCalledWith('player1', 'world1', 'pt1');
    expect(tracker.getProgress().overallFluency).toBe(42);
    expect(tracker.getVocabulary()).toHaveLength(1);
    expect(tracker.getVocabulary()[0].word).toBe('hola');
  });

  it('should return false when DataSource returns null', async () => {
    (mockDs.loadLanguageProgress as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const result = await tracker.loadFromServer();

    expect(result).toBe(false);
    expect(tracker.getVocabulary()).toHaveLength(0);
  });

  it('should return false when no DataSource is set', async () => {
    const noDs = new LanguageProgressTracker('p', 'w', 'L');
    const result = await noDs.loadFromServer();
    expect(result).toBe(false);
    noDs.dispose();
  });

  it('should call DataSource.saveLanguageProgress in syncToServer', async () => {
    // Trigger activity so sync has something to send
    tracker.addVocabularyWord('hola', 'hello', 'greetings', true);

    await tracker.syncToServer();

    expect(mockDs.saveLanguageProgress).toHaveBeenCalledTimes(1);
    const payload = (mockDs.saveLanguageProgress as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.playerId).toBe('player1');
    expect(payload.worldId).toBe('world1');
    expect(payload.playthroughId).toBe('pt1');
    expect(payload.vocabulary).toHaveLength(1);
    expect(payload.vocabulary[0].word).toBe('hola');
  });

  it('should not sync when no DataSource is set', async () => {
    const noDs = new LanguageProgressTracker('p', 'w', 'L');
    noDs.addVocabularyWord('test', 'test', 'general', true);
    await noDs.syncToServer();
    // No error, just silently returns
    noDs.dispose();
  });

  it('should not sync when no changes since last sync', async () => {
    // loadFromServer sets lastSyncTimestamp
    (mockDs.loadLanguageProgress as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      progress: {}, vocabulary: [], grammarPatterns: [], conversations: [],
    });
    await tracker.loadFromServer();

    await tracker.syncToServer();
    expect(mockDs.saveLanguageProgress).not.toHaveBeenCalled();
  });

  it('should merge server vocabulary with local vocabulary', async () => {
    tracker.addVocabularyWord('hola', 'hello', 'greetings', true);

    (mockDs.loadLanguageProgress as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      progress: { overallFluency: 20 },
      vocabulary: [
        { word: 'hola', meaning: 'hello', timesEncountered: 15, timesUsedCorrectly: 10, masteryLevel: 'mastered' },
        { word: 'adios', meaning: 'goodbye', timesEncountered: 5, timesUsedCorrectly: 3, masteryLevel: 'learning' },
      ],
      grammarPatterns: [],
      conversations: [],
    });

    await tracker.loadFromServer();

    const vocab = tracker.getVocabulary();
    expect(vocab).toHaveLength(2);
    expect(vocab.find(v => v.word === 'hola')!.timesEncountered).toBe(15);
    expect(vocab.find(v => v.word === 'adios')!.meaning).toBe('goodbye');
  });

  it('should handle DataSource error gracefully', async () => {
    (mockDs.loadLanguageProgress as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    const result = await tracker.loadFromServer();

    expect(result).toBe(false);
    expect(tracker.getVocabulary()).toHaveLength(0);
  });
});

describe('ConversationClient DataSource migration', () => {
  it('should use DataSource.checkConversationHealth for isAvailable', async () => {
    const mockDs = createMockDataSource({
      checkConversationHealth: vi.fn().mockResolvedValue(true),
    });

    const client = new ConversationClient();
    client.setDataSource(mockDs);

    const available = await client.isAvailable();

    expect(available).toBe(true);
    expect(mockDs.checkConversationHealth).toHaveBeenCalledTimes(1);
    client.dispose();
  });

  it('should return false when conversation service is unavailable', async () => {
    const mockDs = createMockDataSource({
      checkConversationHealth: vi.fn().mockResolvedValue(false),
    });

    const client = new ConversationClient();
    client.setDataSource(mockDs);

    const available = await client.isAvailable();

    expect(available).toBe(false);
    client.dispose();
  });

  it('should cache the availability result', async () => {
    const mockDs = createMockDataSource({
      checkConversationHealth: vi.fn().mockResolvedValue(true),
    });

    const client = new ConversationClient();
    client.setDataSource(mockDs);

    await client.isAvailable();
    await client.isAvailable();

    // Should only call once due to caching
    expect(mockDs.checkConversationHealth).toHaveBeenCalledTimes(1);
    client.dispose();
  });
});

describe('FileDataSource language progress localStorage', () => {
  it('should persist and load language progress from storage', async () => {
    // Use a mock storage to simulate localStorage
    const storage: Record<string, string> = {};
    const mockStorage = {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => { storage[key] = value; },
      removeItem: (key: string) => { delete storage[key]; },
    };

    // Dynamically import FileDataSource to avoid Babylon.js deps
    const { FileDataSource } = await import('../DataSource');
    const ds = new FileDataSource(mockStorage);

    // Save language progress
    const progressData = {
      playerId: 'player1',
      worldId: 'world1',
      progress: { overallFluency: 50 },
      vocabulary: [{ word: 'hola', meaning: 'hello' }],
    };

    const saved = await ds.saveLanguageProgress(progressData);
    expect(saved).toBe(true);

    // Load it back
    const loaded = await ds.loadLanguageProgress('player1', 'world1');
    expect(loaded).not.toBeNull();
    expect(loaded.playerId).toBe('player1');
    expect(loaded.vocabulary[0].word).toBe('hola');
  });

  it('should return null for non-existent progress', async () => {
    const mockStorage = {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    const { FileDataSource } = await import('../DataSource');
    const ds = new FileDataSource(mockStorage);

    const loaded = await ds.loadLanguageProgress('nobody', 'noworld');
    expect(loaded).toBeNull();
  });

  it('should return false for conversation health', async () => {
    const mockStorage = {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    const { FileDataSource } = await import('../DataSource');
    const ds = new FileDataSource(mockStorage);

    const available = await ds.checkConversationHealth();
    expect(available).toBe(false);
  });
});
