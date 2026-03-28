/**
 * Tests for XP awards wiring to quests and learning activities.
 *
 * Verifies that:
 * 1. Quest completion uses quest-specific experienceReward when available
 * 2. Quest completion falls back to flat XP_REWARDS.questComplete when no experienceReward
 * 3. Learning activities (assessment, onboarding, puzzle, location) award correct XP
 * 4. QuestCompletionManager passes experienceReward to gamification tracker
 * 5. NPC exam completion awards XP with score-based bonus
 * 6. Listening comprehension awards XP (full for pass, half for fail)
 * 7. Eavesdrop conversation awards XP
 * 8. XP syncs to server via debounced fetch
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

  describe('LanguageGamificationTracker - NPC Exam XP', () => {
    let tracker: LanguageGamificationTracker;
    let xpEvents: XPGainEvent[];

    beforeEach(() => {
      tracker = new LanguageGamificationTracker();
      xpEvents = [];
      tracker.setOnXPGain((e) => xpEvents.push(e));
    });

    it('should award base XP for NPC exam with no percentage', () => {
      tracker.onNpcExamCompleted();

      expect(xpEvents.length).toBe(1);
      expect(xpEvents[0].amount).toBe(XP_REWARDS.npcExamComplete);
      expect(xpEvents[0].reason).toBe('NPC exam complete');
    });

    it('should award bonus XP for high exam scores', () => {
      tracker.onNpcExamCompleted(100);

      expect(xpEvents.length).toBe(1);
      // 35 * (1 + 1.0 * 0.5) = 35 * 1.5 = 52.5 → 53
      expect(xpEvents[0].amount).toBe(Math.round(XP_REWARDS.npcExamComplete * 1.5));
    });

    it('should award proportional bonus for partial exam scores', () => {
      tracker.onNpcExamCompleted(50);

      // 35 * (1 + 0.5 * 0.5) = 35 * 1.25 = 43.75 → 44
      expect(xpEvents[0].amount).toBe(Math.round(XP_REWARDS.npcExamComplete * 1.25));
    });

    it('should award base XP for 0% score', () => {
      tracker.onNpcExamCompleted(0);

      // percentage is 0 so the condition `percentage > 0` is false → falls through to base XP
      expect(xpEvents[0].amount).toBe(XP_REWARDS.npcExamComplete);
    });
  });

  describe('LanguageGamificationTracker - Listening Comprehension XP', () => {
    let tracker: LanguageGamificationTracker;
    let xpEvents: XPGainEvent[];

    beforeEach(() => {
      tracker = new LanguageGamificationTracker();
      xpEvents = [];
      tracker.setOnXPGain((e) => xpEvents.push(e));
    });

    it('should award full XP when listening comprehension is passed', () => {
      tracker.onListeningComprehensionCompleted(true);

      expect(xpEvents.length).toBe(1);
      expect(xpEvents[0].amount).toBe(XP_REWARDS.listeningComprehensionComplete);
      expect(xpEvents[0].reason).toBe('Listening comprehension passed');
    });

    it('should award half XP when listening comprehension is failed', () => {
      tracker.onListeningComprehensionCompleted(false);

      expect(xpEvents.length).toBe(1);
      expect(xpEvents[0].amount).toBe(Math.round(XP_REWARDS.listeningComprehensionComplete * 0.5));
      expect(xpEvents[0].reason).toBe('Listening comprehension attempted');
    });
  });

  describe('LanguageGamificationTracker - Eavesdrop XP', () => {
    let tracker: LanguageGamificationTracker;
    let xpEvents: XPGainEvent[];

    beforeEach(() => {
      tracker = new LanguageGamificationTracker();
      xpEvents = [];
      tracker.setOnXPGain((e) => xpEvents.push(e));
    });

    it('should award XP for eavesdrop conversation', () => {
      tracker.onEavesdropCompleted();

      expect(xpEvents.length).toBe(1);
      expect(xpEvents[0].amount).toBe(XP_REWARDS.eavesdropConversation);
      expect(xpEvents[0].reason).toBe('Eavesdrop conversation');
    });
  });

  describe('LanguageGamificationTracker - Server XP Sync', () => {
    let tracker: LanguageGamificationTracker;

    beforeEach(() => {
      vi.useFakeTimers();
      tracker = new LanguageGamificationTracker();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('should debounce XP sync to server after 5 seconds', () => {
      tracker.setWorldId('world-1');
      tracker.onPuzzleSolved();

      expect(fetch).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5000);

      expect(fetch).toHaveBeenCalledWith('/api/xp/experiences/update', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });

    it('should not sync when worldId is not set', () => {
      tracker.onPuzzleSolved();
      vi.advanceTimersByTime(5000);

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should debounce multiple XP changes into one sync', () => {
      tracker.setWorldId('world-1');
      tracker.onPuzzleSolved();
      tracker.onLocationDiscovered();
      tracker.onEavesdropCompleted();

      vi.advanceTimersByTime(5000);

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
