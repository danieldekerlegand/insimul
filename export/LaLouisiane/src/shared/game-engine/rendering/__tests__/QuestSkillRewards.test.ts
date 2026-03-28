/**
 * Tests for quest skill rewards integration.
 *
 * Verifies that:
 * 1. QuestCompletionManager applies skill rewards to player progress
 * 2. Skill rewards are computed from quest type and difficulty when not explicit
 * 3. Explicit skillRewards override computed ones
 * 4. LanguageGamificationTracker awards bonus XP for skill rewards
 * 5. Skill reward events are emitted on the event bus
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
}));

vi.mock('@shared/assessment/periodic-encounter', () => ({
  isPeriodicAssessmentLevel: () => false,
  isPeriodicAssessmentCooldownMet: () => false,
}));

import { LanguageGamificationTracker } from '../LanguageGamificationTracker';
import type { XPGainEvent, SkillRewardsAppliedEvent } from '../LanguageGamificationTracker';
import {
  QuestCompletionManager,
  type CompletedQuestData,
} from '../QuestCompletionManager';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createMockAdvancedTexture(): any {
  return { addControl: vi.fn(), removeControl: vi.fn() };
}

function createSampleQuest(overrides?: Partial<CompletedQuestData>): CompletedQuestData {
  return {
    id: 'quest-1',
    worldId: 'world-1',
    title: 'Learn Greetings',
    questType: 'conversation',
    difficulty: 'beginner',
    experienceReward: 50,
    questChainId: null,
    questChainOrder: null,
    assignedBy: 'Maria',
    ...overrides,
  };
}

function setupManager() {
  const mockTexture = createMockAdvancedTexture();
  const manager = new QuestCompletionManager({} as any, mockTexture);
  const mockGamification = {
    onQuestCompleted: vi.fn(),
    onSkillRewardsApplied: vi.fn(),
  };
  const emittedEvents: any[] = [];
  const mockEventBus = {
    emit: vi.fn((e: any) => emittedEvents.push(e)),
    on: vi.fn(() => () => {}),
    onAny: vi.fn(() => () => {}),
    dispose: vi.fn(),
  };
  manager.setGamificationTracker(mockGamification as any);
  manager.setEventBus(mockEventBus as any);

  global.requestAnimationFrame = vi.fn(() => 0);
  global.AudioContext = class {
    state = 'running';
    currentTime = 0;
    destination = {};
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

  return { manager, mockGamification, mockEventBus, emittedEvents };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Quest Skill Rewards', () => {
  describe('QuestCompletionManager - Skill Reward Application', () => {
    it('should apply computed skill rewards from conversation quest', async () => {
      const { manager } = setupManager();
      const quest = createSampleQuest({ questType: 'conversation', difficulty: 'beginner' });

      await manager.completeQuest(quest);

      const progress = manager.getPlayerProgress();
      expect(progress.skills.speaking).toBe(2);
      expect(progress.skills.listening).toBe(1);
    });

    it('should apply computed skill rewards with difficulty scaling', async () => {
      const { manager } = setupManager();
      const quest = createSampleQuest({ questType: 'conversation', difficulty: 'advanced' });

      await manager.completeQuest(quest);

      const progress = manager.getPlayerProgress();
      expect(progress.skills.speaking).toBe(6);
      expect(progress.skills.listening).toBe(3);
    });

    it('should use explicit skillRewards when provided', async () => {
      const { manager } = setupManager();
      const quest = createSampleQuest({
        skillRewards: [{ skillId: 'custom_skill', name: 'Custom Skill', level: 10 }],
      });

      await manager.completeQuest(quest);

      const progress = manager.getPlayerProgress();
      expect(progress.skills.custom_skill).toBe(10);
    });

    it('should accumulate skill rewards across multiple quests', async () => {
      const { manager } = setupManager();

      await manager.completeQuest(createSampleQuest({
        id: 'q1', questType: 'conversation', difficulty: 'beginner',
      }));
      await manager.completeQuest(createSampleQuest({
        id: 'q2', questType: 'conversation', difficulty: 'intermediate',
      }));

      const progress = manager.getPlayerProgress();
      // beginner: speaking=2, listening=1; intermediate: speaking=4, listening=2
      expect(progress.skills.speaking).toBe(6);
      expect(progress.skills.listening).toBe(3);
    });

    it('should call gamification tracker onSkillRewardsApplied', async () => {
      const { manager, mockGamification } = setupManager();
      const quest = createSampleQuest({ questType: 'vocabulary', difficulty: 'beginner' });

      await manager.completeQuest(quest);

      expect(mockGamification.onSkillRewardsApplied).toHaveBeenCalledWith([
        { skillId: 'vocabulary', name: 'Vocabulary', level: 3 },
      ]);
    });

    it('should emit skill_rewards_applied event on event bus', async () => {
      const { manager, emittedEvents } = setupManager();
      const quest = createSampleQuest({ questType: 'grammar', difficulty: 'beginner' });

      await manager.completeQuest(quest);

      const skillEvent = emittedEvents.find(e => e.type === 'skill_rewards_applied');
      expect(skillEvent).toBeDefined();
      expect(skillEvent.questId).toBe('quest-1');
      expect(skillEvent.rewards).toEqual([
        { skillId: 'grammar', name: 'Grammar', level: 3 },
      ]);
    });

    it('should not emit skill events for unknown quest types', async () => {
      const { manager, mockGamification, emittedEvents } = setupManager();
      const quest = createSampleQuest({ questType: 'unknown_type' });

      await manager.completeQuest(quest);

      expect(mockGamification.onSkillRewardsApplied).not.toHaveBeenCalled();
      expect(emittedEvents.find(e => e.type === 'skill_rewards_applied')).toBeUndefined();
    });
  });

  describe('LanguageGamificationTracker - Skill Reward XP', () => {
    let tracker: LanguageGamificationTracker;
    let xpEvents: XPGainEvent[];
    let skillEvents: SkillRewardsAppliedEvent[];

    beforeEach(() => {
      tracker = new LanguageGamificationTracker();
      xpEvents = [];
      skillEvents = [];
      tracker.setOnXPGain((e) => xpEvents.push(e));
      tracker.setOnSkillRewardsApplied((e) => skillEvents.push(e));
    });

    it('should award bonus XP based on total skill points', () => {
      tracker.onSkillRewardsApplied([
        { skillId: 'speaking', name: 'Speaking', level: 3 },
        { skillId: 'listening', name: 'Listening', level: 2 },
      ]);

      // Total points = 5, bonus XP = 5 * 2 = 10
      expect(xpEvents.length).toBe(1);
      expect(xpEvents[0].amount).toBe(10);
      expect(xpEvents[0].reason).toBe('Skill reward');
    });

    it('should emit SkillRewardsAppliedEvent via callback', () => {
      const rewards = [{ skillId: 'grammar', name: 'Grammar', level: 6 }];
      tracker.onSkillRewardsApplied(rewards);

      expect(skillEvents.length).toBe(1);
      expect(skillEvents[0].rewards).toEqual(rewards);
      expect(skillEvents[0].totalPoints).toBe(6);
    });

    it('should not award XP for zero skill points', () => {
      tracker.onSkillRewardsApplied([]);

      expect(xpEvents.length).toBe(0);
    });

    it('should accumulate XP from skill rewards with quest XP', () => {
      tracker.onQuestCompleted('conversation', 50);
      tracker.onSkillRewardsApplied([
        { skillId: 'speaking', name: 'Speaking', level: 2 },
      ]);

      // 50 (quest) + 4 (skill reward: 2*2)
      expect(tracker.getXP()).toBe(54);
    });
  });
});
