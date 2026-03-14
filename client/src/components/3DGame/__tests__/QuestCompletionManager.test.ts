/**
 * Tests for QuestCompletionManager
 *
 * Tests reward distribution, player progress tracking, quest chain progression,
 * event bus emissions, and gamification integration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Babylon.js GUI and core modules using class syntax for constructors
vi.mock('@babylonjs/gui', () => {
  class MockRectangle {
    addControl = vi.fn();
    width = ''; height = ''; background = ''; color = '';
    thickness = 0; cornerRadius = 0; zIndex = 0;
    horizontalAlignment = 0; verticalAlignment = 0;
    adaptHeightToChildren = false; isVisible = true;
    paddingTop = ''; paddingBottom = '';
  }
  class MockStackPanel {
    addControl = vi.fn();
    width = ''; isVertical = true;
    paddingTop = ''; paddingBottom = ''; paddingLeft = ''; paddingRight = '';
  }
  class MockTextBlock {
    text = ''; color = ''; fontSize = 0; fontWeight = ''; height = '';
    textWrapping = 0;
  }
  return {
    AdvancedDynamicTexture: class {},
    Control: { HORIZONTAL_ALIGNMENT_CENTER: 0, VERTICAL_ALIGNMENT_CENTER: 0 },
    Rectangle: MockRectangle,
    StackPanel: MockStackPanel,
    TextBlock: MockTextBlock,
    TextWrapping: { WordWrap: 1 },
  };
});

vi.mock('@babylonjs/core', () => ({
  Scene: class {},
}));

// Import after mocks
import {
  QuestCompletionManager,
  type CompletedQuestData,
  type PlayerProgress,
} from '../QuestCompletionManager';
import type { GameEventBus, GameEvent } from '../GameEventBus';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createMockScene(): any {
  return {};
}

function createMockAdvancedTexture(): any {
  return {
    addControl: vi.fn(),
    removeControl: vi.fn(),
  };
}

function createMockEventBus(): GameEventBus & { emittedEvents: GameEvent[] } {
  const emittedEvents: GameEvent[] = [];
  return {
    emit: vi.fn((event: GameEvent) => emittedEvents.push(event)),
    on: vi.fn(() => () => {}),
    onAny: vi.fn(() => () => {}),
    dispose: vi.fn(),
    emittedEvents,
  };
}

function createMockGamificationTracker(): any {
  return {
    onQuestCompleted: vi.fn(),
    getState: vi.fn(() => ({ questsCompleted: 0, xp: { totalXP: 0, level: 1 } })),
  };
}

function createMockQuestTracker(): any {
  return {
    updateQuests: vi.fn(),
  };
}

function createSampleQuest(overrides?: Partial<CompletedQuestData>): CompletedQuestData {
  return {
    id: 'quest-1',
    worldId: 'world-1',
    title: 'Learn Greetings',
    questType: 'conversation',
    experienceReward: 50,
    itemRewards: undefined,
    skillRewards: undefined,
    unlocks: undefined,
    questChainId: null,
    questChainOrder: null,
    assignedBy: 'Maria',
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('QuestCompletionManager', () => {
  let manager: QuestCompletionManager;
  let mockScene: any;
  let mockTexture: any;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let mockGamification: any;
  let mockQuestTracker: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
    mockTexture = createMockAdvancedTexture();
    mockEventBus = createMockEventBus();
    mockGamification = createMockGamificationTracker();
    mockQuestTracker = createMockQuestTracker();

    manager = new QuestCompletionManager(mockScene, mockTexture);
    manager.setEventBus(mockEventBus);
    manager.setGamificationTracker(mockGamification);
    manager.setQuestTracker(mockQuestTracker);

    // Mock global fetch and requestAnimationFrame
    global.fetch = vi.fn();
    global.requestAnimationFrame = vi.fn(() => 0);

    // Mock AudioContext using class syntax
    global.AudioContext = class {
      state = 'running';
      currentTime = 0;
      destination = {};
      resume = vi.fn();
      close = vi.fn().mockResolvedValue(undefined);
      createOscillator = vi.fn(() => ({
        type: '',
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }));
      createGain = vi.fn(() => ({
        gain: {
          value: 0,
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }));
    } as any;
  });

  describe('completeQuest', () => {
    it('should emit quest_completed event', async () => {
      const quest = createSampleQuest();
      await manager.completeQuest(quest);

      expect(mockEventBus.emit).toHaveBeenCalledWith({
        type: 'quest_completed',
        questId: 'quest-1',
      });
    });

    it('should call gamification tracker onQuestCompleted', async () => {
      const quest = createSampleQuest();
      await manager.completeQuest(quest);

      expect(mockGamification.onQuestCompleted).toHaveBeenCalledWith('conversation', 50);
    });

    it('should add quest to playerProgress.questsCompleted', async () => {
      const quest = createSampleQuest();
      await manager.completeQuest(quest);

      const progress = manager.getPlayerProgress();
      expect(progress.questsCompleted).toContain('quest-1');
    });

    it('should not duplicate quest in questsCompleted', async () => {
      const quest = createSampleQuest();
      manager.setPlayerProgress({
        inventory: [],
        questsCompleted: ['quest-1'],
      });

      await manager.completeQuest(quest);

      const progress = manager.getPlayerProgress();
      expect(progress.questsCompleted.filter(id => id === 'quest-1').length).toBe(1);
    });

    it('should refresh quest tracker UI', async () => {
      const quest = createSampleQuest();
      await manager.completeQuest(quest);

      expect(mockQuestTracker.updateQuests).toHaveBeenCalledWith('world-1');
    });

    it('should show completion overlay', async () => {
      const quest = createSampleQuest();
      await manager.completeQuest(quest);

      expect(mockTexture.addControl).toHaveBeenCalled();
    });
  });

  describe('reward distribution', () => {
    it('should add item rewards to inventory', async () => {
      const quest = createSampleQuest({
        itemRewards: [
          { itemId: 'item-1', quantity: 2, name: 'Health Potion' },
        ],
      });

      await manager.completeQuest(quest);

      const progress = manager.getPlayerProgress();
      expect(progress.inventory).toEqual([
        { itemId: 'item-1', quantity: 2, name: 'Health Potion' },
      ]);
    });

    it('should stack item rewards with existing inventory', async () => {
      manager.setPlayerProgress({
        inventory: [{ itemId: 'item-1', quantity: 3, name: 'Health Potion' }],
        questsCompleted: [],
      });

      const quest = createSampleQuest({
        itemRewards: [
          { itemId: 'item-1', quantity: 2, name: 'Health Potion' },
        ],
      });

      await manager.completeQuest(quest);

      const progress = manager.getPlayerProgress();
      expect(progress.inventory[0].quantity).toBe(5);
    });

    it('should add multiple different items', async () => {
      const quest = createSampleQuest({
        itemRewards: [
          { itemId: 'item-1', quantity: 1, name: 'Sword' },
          { itemId: 'item-2', quantity: 3, name: 'Arrow' },
        ],
      });

      await manager.completeQuest(quest);

      const progress = manager.getPlayerProgress();
      expect(progress.inventory.length).toBe(2);
      expect(progress.inventory[0]).toEqual({ itemId: 'item-1', quantity: 1, name: 'Sword' });
      expect(progress.inventory[1]).toEqual({ itemId: 'item-2', quantity: 3, name: 'Arrow' });
    });
  });

  describe('quest chain progression', () => {
    it('should fetch and activate next quest in chain', async () => {
      const quest = createSampleQuest({
        questChainId: 'chain-1',
        questChainOrder: 0,
      });

      const chainQuests = [
        { ...quest },
        {
          id: 'quest-2',
          worldId: 'world-1',
          title: 'Learn Farewells',
          questType: 'conversation',
          experienceReward: 75,
          questChainId: 'chain-1',
          questChainOrder: 1,
        },
      ];

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(chainQuests),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        });

      await manager.completeQuest(quest);

      // Should have fetched world quests and activated next quest
      expect(global.fetch).toHaveBeenCalledWith('/api/worlds/world-1/quests');
      expect(global.fetch).toHaveBeenCalledWith('/api/quests/quest-2', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'active' }),
      }));
    });

    it('should emit quest_accepted for next chain quest', async () => {
      const quest = createSampleQuest({
        questChainId: 'chain-1',
        questChainOrder: 0,
      });

      const chainQuests = [
        { ...quest },
        {
          id: 'quest-2',
          worldId: 'world-1',
          title: 'Learn Farewells',
          questChainId: 'chain-1',
          questChainOrder: 1,
        },
      ];

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(chainQuests),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        });

      await manager.completeQuest(quest);

      expect(mockEventBus.emit).toHaveBeenCalledWith({
        type: 'quest_accepted',
        questId: 'quest-2',
        questTitle: 'Learn Farewells',
      });
    });

    it('should not attempt chain progression for non-chain quests', async () => {
      const quest = createSampleQuest({ questChainId: null });

      await manager.completeQuest(quest);

      // fetch should NOT be called for chain quest lookup
      // (the overlay and other things don't use fetch)
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('sound effects', () => {
    it('should play without errors', () => {
      expect(() => manager.playCompletionSound()).not.toThrow();
    });

    it('should not throw if AudioContext fails', () => {
      global.AudioContext = class {
        constructor() { throw new Error('AudioContext not supported'); }
      } as any;

      expect(() => manager.playCompletionSound()).not.toThrow();
    });
  });

  describe('playerProgress management', () => {
    it('should return set player progress', () => {
      const progress: PlayerProgress = {
        inventory: [{ itemId: 'item-1', quantity: 5, name: 'Gold Coin' }],
        questsCompleted: ['quest-old'],
      };

      manager.setPlayerProgress(progress);
      expect(manager.getPlayerProgress()).toBe(progress);
    });
  });

  describe('dispose', () => {
    it('should clean up resources without errors', () => {
      manager.playCompletionSound(); // initialize AudioContext
      expect(() => manager.dispose()).not.toThrow();
    });

    it('should remove overlay on dispose', async () => {
      const quest = createSampleQuest();
      await manager.completeQuest(quest);

      manager.dispose();
      // Overlay should have been removed (removeControl called)
      expect(mockTexture.removeControl).toHaveBeenCalled();
    });
  });
});
