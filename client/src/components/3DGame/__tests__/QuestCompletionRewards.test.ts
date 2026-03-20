/**
 * Tests for quest completion rewards and turn-in flow.
 *
 * Tests server completion integration, gold rewards, bonus XP display,
 * streak tracking, and the unified turn-in flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Babylon.js GUI and core modules
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
  Vector3: class {
    constructor(public x = 0, public y = 0, public z = 0) {}
    clone() { return new (this.constructor as any)(this.x, this.y, this.z); }
    add(v: any) { return new (this.constructor as any)(this.x + v.x, this.y + v.y, this.z + v.z); }
  },
  Color4: class { constructor(public r = 0, public g = 0, public b = 0, public a = 1) {} },
  ParticleSystem: class {
    static BLENDMODE_STANDARD = 0;
    createPointEmitter = vi.fn();
    start = vi.fn(); stop = vi.fn(); dispose = vi.fn();
    emitter = null; minSize = 0; maxSize = 0; minLifeTime = 0; maxLifeTime = 0;
    emitRate = 0; gravity = null; minEmitPower = 0; maxEmitPower = 0;
    color1 = null; color2 = null; colorDead = null; blendMode = 0;
    targetStopDuration = 0; disposeOnStop = false;
  },
  GPUParticleSystem: class {},
  Texture: class {},
}));

import {
  QuestCompletionManager,
  type CompletedQuestData,
  type ServerCompletionResult,
} from '../QuestCompletionManager';
import type { GameEventBus, GameEvent } from '../GameEventBus';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createMockTexture(): any {
  return { addControl: vi.fn(), removeControl: vi.fn() };
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
    onSkillRewardsApplied: vi.fn(),
    getState: vi.fn(() => ({ questsCompleted: 0, xp: { totalXP: 0, level: 1 } })),
  };
}

function createSampleQuest(overrides?: Partial<CompletedQuestData>): CompletedQuestData {
  return {
    id: 'quest-1',
    worldId: 'world-1',
    title: 'Learn Greetings',
    questType: 'conversation',
    difficulty: 'beginner',
    experienceReward: 50,
    goldReward: 0,
    ...overrides,
  };
}

function createServerResult(overrides?: Partial<ServerCompletionResult>): ServerCompletionResult {
  return {
    bonus: {
      baseXP: 50,
      totalXP: 62,
      bonusXP: 12,
      grandTotalXP: 62,
      streak: 3,
      difficultyMultiplier: 1.0,
      streakMultiplier: 1.3,
      hintPenalty: 1.0,
      milestone: null,
      milestoneXP: 0,
    },
    chainCompletion: null,
    skillRewards: [],
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Quest Completion Rewards & Turn-In Flow', () => {
  let manager: QuestCompletionManager;
  let mockTexture: any;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let mockGamification: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTexture = createMockTexture();
    mockEventBus = createMockEventBus();
    mockGamification = createMockGamificationTracker();

    manager = new QuestCompletionManager({} as any, mockTexture);
    manager.setEventBus(mockEventBus);
    manager.setGamificationTracker(mockGamification);

    global.requestAnimationFrame = vi.fn(() => 0);
    global.AudioContext = class {
      state = 'running'; currentTime = 0; destination = {};
      resume = vi.fn();
      close = vi.fn().mockResolvedValue(undefined);
      createOscillator = vi.fn(() => ({
        type: '', frequency: { value: 0 },
        connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
      }));
      createGain = vi.fn(() => ({
        gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      }));
    } as any;
  });

  // ── Server Completion ──────────────────────────────────────────────────

  describe('completeQuestOnServer', () => {
    it('should POST to server completion endpoint', async () => {
      const serverResponse = createServerResult();
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(serverResponse),
      });

      const result = await manager.completeQuestOnServer('world-1', 'quest-1');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/worlds/world-1/quests/quest-1/complete',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      expect(result).toEqual(serverResponse);
    });

    it('should return null on server error', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

      const result = await manager.completeQuestOnServer('world-1', 'quest-1');

      expect(result).toBeNull();
    });

    it('should return null on network failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await manager.completeQuestOnServer('world-1', 'quest-1');

      expect(result).toBeNull();
    });
  });

  // ── Server Integration in completeQuest ────────────────────────────────

  describe('completeQuest with server integration', () => {
    it('should call server and use grand total XP for gamification', async () => {
      const serverResponse = createServerResult({
        bonus: {
          baseXP: 50, totalXP: 75, bonusXP: 25, grandTotalXP: 100,
          streak: 5, difficultyMultiplier: 1.5, streakMultiplier: 1.5,
          hintPenalty: 1.0, milestone: 'Hot Streak', milestoneXP: 25,
        },
      });
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(serverResponse),
      });

      const quest = createSampleQuest({ experienceReward: 50 });
      await manager.completeQuest(quest);

      // Gamification tracker should receive grandTotalXP (100), not base (50)
      expect(mockGamification.onQuestCompleted).toHaveBeenCalledWith('conversation', 100);
    });

    it('should fall back to base XP when server fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });

      const quest = createSampleQuest({ experienceReward: 50 });
      await manager.completeQuest(quest);

      // Should use base experienceReward as fallback
      expect(mockGamification.onQuestCompleted).toHaveBeenCalledWith('conversation', 50);
    });

    it('should emit quest_completed event after server call', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createServerResult()),
      });

      const quest = createSampleQuest();
      await manager.completeQuest(quest);

      expect(mockEventBus.emit).toHaveBeenCalledWith({
        type: 'quest_completed',
        questId: 'quest-1',
      });
    });
  });

  // ── Gold Rewards ───────────────────────────────────────────────────────

  describe('gold rewards', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
    });

    it('should add gold to player progress', async () => {
      manager.setPlayerProgress({
        inventory: [], questsCompleted: [], skills: {}, gold: 100,
      });

      const quest = createSampleQuest({ goldReward: 50 });
      await manager.completeQuest(quest);

      expect(manager.getPlayerProgress().gold).toBe(150);
    });

    it('should fire onGoldAwarded callback', async () => {
      const goldCallback = vi.fn();
      manager.setOnGoldAwarded(goldCallback);

      const quest = createSampleQuest({ goldReward: 75 });
      await manager.completeQuest(quest);

      expect(goldCallback).toHaveBeenCalledWith(75);
    });

    it('should not fire gold callback when goldReward is 0', async () => {
      const goldCallback = vi.fn();
      manager.setOnGoldAwarded(goldCallback);

      const quest = createSampleQuest({ goldReward: 0 });
      await manager.completeQuest(quest);

      expect(goldCallback).not.toHaveBeenCalled();
    });

    it('should handle undefined gold in progress gracefully', async () => {
      manager.setPlayerProgress({
        inventory: [], questsCompleted: [], skills: {},
      } as any);

      const quest = createSampleQuest({ goldReward: 30 });
      await manager.completeQuest(quest);

      expect(manager.getPlayerProgress().gold).toBe(30);
    });
  });

  // ── Completion Overlay with Bonus Info ─────────────────────────────────

  describe('completion overlay with server bonus', () => {
    it('should show overlay with bonus XP info', async () => {
      const serverResponse = createServerResult({
        bonus: {
          baseXP: 50, totalXP: 75, bonusXP: 25, grandTotalXP: 75,
          streak: 3, difficultyMultiplier: 1.5, streakMultiplier: 1.0,
          hintPenalty: 1.0, milestone: null, milestoneXP: 0,
        },
      });
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(serverResponse),
      });

      const quest = createSampleQuest({ experienceReward: 50 });
      await manager.completeQuest(quest);

      // Verify overlay was added
      expect(mockTexture.addControl).toHaveBeenCalled();
    });

    it('should show milestone in overlay when earned', async () => {
      const serverResponse = createServerResult({
        bonus: {
          baseXP: 50, totalXP: 62, bonusXP: 12, grandTotalXP: 87,
          streak: 7, difficultyMultiplier: 1.0, streakMultiplier: 1.25,
          hintPenalty: 1.0, milestone: 'Weekly Warrior', milestoneXP: 75,
        },
      });
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(serverResponse),
      });

      const quest = createSampleQuest();
      await manager.completeQuest(quest);

      // Gamification should get the grand total (87)
      expect(mockGamification.onQuestCompleted).toHaveBeenCalledWith('conversation', 87);
    });
  });

  // ── Combined Rewards ───────────────────────────────────────────────────

  describe('combined reward distribution', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
    });

    it('should distribute XP, gold, and items together', async () => {
      manager.setPlayerProgress({
        inventory: [], questsCompleted: [], skills: {}, gold: 0,
      });

      const quest = createSampleQuest({
        experienceReward: 100,
        goldReward: 50,
        itemRewards: [
          { itemId: 'potion-1', quantity: 3, name: 'Health Potion' },
        ],
      });

      await manager.completeQuest(quest);

      const progress = manager.getPlayerProgress();
      expect(progress.gold).toBe(50);
      expect(progress.inventory).toEqual([
        { itemId: 'potion-1', quantity: 3, name: 'Health Potion' },
      ]);
      expect(progress.questsCompleted).toContain('quest-1');
    });

    it('should compute and apply skill rewards', async () => {
      manager.setPlayerProgress({
        inventory: [], questsCompleted: [], skills: {}, gold: 0,
      });

      const quest = createSampleQuest({
        questType: 'vocabulary',
        difficulty: 'intermediate',
      });

      await manager.completeQuest(quest);

      const progress = manager.getPlayerProgress();
      // vocabulary quest type awards Vocabulary skill
      expect(progress.skills).toBeDefined();
      expect(Object.keys(progress.skills).length).toBeGreaterThan(0);
    });

    it('should emit skill_rewards_applied event', async () => {
      const quest = createSampleQuest({
        questType: 'conversation',
        difficulty: 'beginner',
      });

      await manager.completeQuest(quest);

      const skillEvent = mockEventBus.emittedEvents.find(
        (e: any) => e.type === 'skill_rewards_applied',
      );
      expect(skillEvent).toBeDefined();
    });
  });

  // ── Server Chain Completion ────────────────────────────────────────────

  describe('server-provided chain completion', () => {
    it('should use server chain result instead of local', async () => {
      const serverResponse = createServerResult({
        chainCompletion: {
          chainName: 'Greeting Mastery',
          bonusXP: 200,
          achievement: 'Greeting Expert',
          totalQuests: 5,
        },
      });
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(serverResponse),
      });

      const quest = createSampleQuest({
        questChainId: 'chain-1',
        questChainOrder: 4,
      });

      await manager.completeQuest(quest);

      // Should still emit quest_completed
      expect(mockEventBus.emit).toHaveBeenCalledWith({
        type: 'quest_completed',
        questId: 'quest-1',
      });
    });
  });
});
