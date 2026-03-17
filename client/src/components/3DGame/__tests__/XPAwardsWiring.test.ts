/**
 * Tests for XP awards wiring to quests and learning activities.
 *
 * Verifies that:
 * 1. Quest completion uses quest-specific experienceReward when available
 * 2. Quest completion falls back to flat XP_REWARDS.questComplete when no experienceReward
 * 3. Learning activities (assessment, onboarding, puzzle, location) award correct XP
 * 4. QuestCompletionManager passes experienceReward to gamification tracker
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
import type { XPGainEvent } from '../LanguageGamificationTracker';
import { XP_REWARDS } from '@shared/language/language-gamification';
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
    experienceReward: 50,
    questChainId: null,
    questChainOrder: null,
    assignedBy: 'Maria',
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('XP Awards Wiring', () => {
  describe('LanguageGamificationTracker - Quest XP', () => {
    let tracker: LanguageGamificationTracker;
    let xpEvents: XPGainEvent[];

    beforeEach(() => {
      tracker = new LanguageGamificationTracker();
      xpEvents = [];
      tracker.setOnXPGain((e) => xpEvents.push(e));
    });

    it('should use quest experienceReward when provided', () => {
      tracker.onQuestCompleted('conversation', 100);

      expect(xpEvents.length).toBe(1);
      expect(xpEvents[0].amount).toBe(100);
      expect(xpEvents[0].reason).toBe('Quest complete');
    });

    it('should fall back to flat XP_REWARDS.questComplete when experienceReward is 0', () => {
      tracker.onQuestCompleted('conversation', 0);

      expect(xpEvents[0].amount).toBe(XP_REWARDS.questComplete);
    });

    it('should fall back to flat XP_REWARDS.questComplete when experienceReward is undefined', () => {
      tracker.onQuestCompleted('conversation');

      expect(xpEvents[0].amount).toBe(XP_REWARDS.questComplete);
    });

    it('should still track quest category stats with custom XP', () => {
      tracker.onQuestCompleted('navigation', 75);
      const state = tracker.getState();

      expect(state.questsCompleted).toBe(1);
      expect(state.navigationQuestsCompleted).toBe(1);
    });

    it('should track cultural quest category', () => {
      tracker.onQuestCompleted('cultural', 60);
      const state = tracker.getState();

      expect(state.culturalQuestsCompleted).toBe(1);
    });
  });

  describe('LanguageGamificationTracker - Learning Activity XP', () => {
    let tracker: LanguageGamificationTracker;
    let xpEvents: XPGainEvent[];

    beforeEach(() => {
      tracker = new LanguageGamificationTracker();
      xpEvents = [];
      tracker.setOnXPGain((e) => xpEvents.push(e));
    });

    it('should award XP for assessment phase completion', () => {
      tracker.onAssessmentPhaseCompleted();

      expect(xpEvents.length).toBe(1);
      expect(xpEvents[0].amount).toBe(XP_REWARDS.assessmentPhaseComplete);
      expect(xpEvents[0].reason).toBe('Assessment phase complete');
    });

    it('should award XP for full assessment completion', () => {
      tracker.onAssessmentCompleted();

      expect(xpEvents.length).toBe(1);
      expect(xpEvents[0].amount).toBe(XP_REWARDS.assessmentComplete);
      expect(xpEvents[0].reason).toBe('Assessment complete');
    });

    it('should award XP for onboarding step completion', () => {
      tracker.onOnboardingStepCompleted();

      expect(xpEvents.length).toBe(1);
      expect(xpEvents[0].amount).toBe(XP_REWARDS.onboardingStepComplete);
      expect(xpEvents[0].reason).toBe('Onboarding step complete');
    });

    it('should award XP for full onboarding completion', () => {
      tracker.onOnboardingCompleted();

      expect(xpEvents.length).toBe(1);
      expect(xpEvents[0].amount).toBe(XP_REWARDS.onboardingComplete);
      expect(xpEvents[0].reason).toBe('Onboarding complete');
    });

    it('should award XP for puzzle solved', () => {
      tracker.onPuzzleSolved();

      expect(xpEvents.length).toBe(1);
      expect(xpEvents[0].amount).toBe(XP_REWARDS.puzzleSolved);
      expect(xpEvents[0].reason).toBe('Puzzle solved');
    });

    it('should award XP for location discovered', () => {
      tracker.onLocationDiscovered();

      expect(xpEvents.length).toBe(1);
      expect(xpEvents[0].amount).toBe(XP_REWARDS.locationDiscovered);
      expect(xpEvents[0].reason).toBe('Location discovered');
    });

    it('should accumulate XP across multiple learning activities', () => {
      tracker.onAssessmentPhaseCompleted();
      tracker.onAssessmentPhaseCompleted();
      tracker.onAssessmentCompleted();

      const expectedTotal =
        XP_REWARDS.assessmentPhaseComplete * 2 +
        XP_REWARDS.assessmentComplete;

      expect(tracker.getXP()).toBe(expectedTotal);
    });
  });

  describe('QuestCompletionManager - XP passthrough', () => {
    let manager: QuestCompletionManager;
    let mockGamification: any;

    beforeEach(() => {
      vi.clearAllMocks();
      const mockTexture = createMockAdvancedTexture();
      manager = new QuestCompletionManager({} as any, mockTexture);

      mockGamification = {
        onQuestCompleted: vi.fn(),
        onSkillRewardsApplied: vi.fn(),
      };
      manager.setGamificationTracker(mockGamification);
      manager.setEventBus({
        emit: vi.fn(),
        on: vi.fn(() => () => {}),
        onAny: vi.fn(() => () => {}),
        dispose: vi.fn(),
      } as any);

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
    });

    it('should pass experienceReward to gamification tracker', async () => {
      const quest = createSampleQuest({ experienceReward: 100 });
      await manager.completeQuest(quest);

      expect(mockGamification.onQuestCompleted).toHaveBeenCalledWith('conversation', 100);
    });

    it('should pass 0 experienceReward when quest has none', async () => {
      const quest = createSampleQuest({ experienceReward: 0 });
      await manager.completeQuest(quest);

      expect(mockGamification.onQuestCompleted).toHaveBeenCalledWith('conversation', 0);
    });
  });
});
