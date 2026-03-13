/**
 * Language Gamification Tracker
 *
 * Tracks XP, levels, achievements, and daily challenges for
 * language-learning game worlds. Integrates with LanguageProgressTracker
 * to react to vocabulary, grammar, and conversation events.
 */

import {
  GamificationState,
  createDefaultGamificationState,
  getLevelForXP,
  getXPForNextLevel,
  getLevelTier,
  generateDailyChallenge,
  getTodayDateKey,
  XP_REWARDS,
  MAX_LEVEL,
  LEVEL_THRESHOLDS,
} from '@shared/language-gamification';
import type { Achievement, DailyChallenge } from '@shared/language-gamification';
import type { FluencyGainResult, VocabularyEntry, GrammarFeedback } from '@shared/language-progress';
import {
  isPeriodicAssessmentLevel,
  isPeriodicAssessmentCooldownMet,
} from '@shared/assessment/periodic-encounter';

export interface XPGainEvent {
  amount: number;
  reason: string;
  newTotal: number;
}

export interface LevelUpEvent {
  oldLevel: number;
  newLevel: number;
  tier: string;
}

export interface AchievementUnlockedEvent {
  achievement: Achievement;
}

export interface PeriodicAssessmentEvent {
  level: number;
  tier: string;
}

export class LanguageGamificationTracker {
  private state: GamificationState;

  // Per-session counters (not persisted, used for daily challenge tracking)
  private sessionConversations: number = 0;
  private sessionNewWords: number = 0;
  private sessionQuestsCompleted: number = 0;

  // Periodic assessment cooldown tracking
  private lastPeriodicAssessmentTimestamp: number | null = null;

  // Callbacks
  private onXPGain: ((event: XPGainEvent) => void) | null = null;
  private onLevelUp: ((event: LevelUpEvent) => void) | null = null;
  private onAchievementUnlocked: ((event: AchievementUnlockedEvent) => void) | null = null;
  private onDailyChallengeCompleted: ((challenge: DailyChallenge) => void) | null = null;
  private onPeriodicAssessmentTriggered: ((event: PeriodicAssessmentEvent) => void) | null = null;

  constructor() {
    this.state = createDefaultGamificationState();
    this.ensureDailyChallenge();
  }

  // --- XP System ---

  private addXP(amount: number, reason: string): void {
    const oldLevel = this.state.xp.level;
    this.state.xp.totalXP += amount;
    this.state.xp.level = getLevelForXP(this.state.xp.totalXP);
    this.state.xp.xpForNextLevel = getXPForNextLevel(this.state.xp.level);

    // Calculate currentLevelXP
    const currentLevelThreshold = LEVEL_THRESHOLDS[this.state.xp.level - 1] || 0;
    this.state.xp.currentLevelXP = this.state.xp.totalXP - currentLevelThreshold;

    this.onXPGain?.({
      amount,
      reason,
      newTotal: this.state.xp.totalXP,
    });

    if (this.state.xp.level > oldLevel) {
      const tier = getLevelTier(this.state.xp.level);
      this.onLevelUp?.({
        oldLevel,
        newLevel: this.state.xp.level,
        tier,
      });

      // Trigger periodic assessment at milestone levels
      this.checkPeriodicAssessment(this.state.xp.level, tier);

      // Check level-based achievements
      this.checkAchievements();
    }
  }

  // --- Event Handlers (called by BabylonGame) ---

  /**
   * Called when a conversation ends
   */
  public onConversationEnd(result: FluencyGainResult): void {
    // Base XP for conversation
    let xp = XP_REWARDS.conversationBase;

    // Bonus for long conversations
    const turns = Math.round((result.gain / 0.5) * 2); // approximate turns from gain
    if (turns > 5) {
      xp += (turns - 5) * XP_REWARDS.conversationLong;
    }

    this.addXP(xp, 'Conversation');
    this.sessionConversations++;

    // Track daily challenge
    this.trackDailyProgress('conversation_count', 1);
    if (result.grammarScore >= 0.8) {
      this.trackDailyProgress('grammar_accuracy', result.grammarScore * 100);
    }
    if (result.targetLanguagePercentage && result.targetLanguagePercentage >= 90) {
      this.trackDailyProgress('target_language_only', 1);
    }

    this.checkAchievements();
  }

  /**
   * Called when a new word is learned
   */
  public onNewWordLearned(_entry: VocabularyEntry): void {
    this.addXP(XP_REWARDS.vocabularyNewWord, 'New word');
    this.sessionNewWords++;
    this.trackDailyProgress('new_words', 1);
    this.checkAchievements();
  }

  /**
   * Called when a word reaches mastered status
   */
  public onWordMastered(_entry: VocabularyEntry): void {
    this.addXP(XP_REWARDS.vocabularyMastered, 'Word mastered');
  }

  /**
   * Called when grammar feedback is received
   */
  public onGrammarFeedback(feedback: GrammarFeedback): void {
    if (feedback.status === 'correct') {
      this.addXP(XP_REWARDS.grammarPatternCorrect, 'Grammar correct');
    }
  }

  /**
   * Called when a grammar pattern is mastered
   */
  public onGrammarPatternMastered(): void {
    this.addXP(XP_REWARDS.grammarPatternMastered, 'Grammar pattern mastered');
    this.checkAchievements();
  }

  /**
   * Called when a quest is completed
   */
  public onQuestCompleted(questCategory?: string): void {
    this.addXP(XP_REWARDS.questComplete, 'Quest complete');
    this.state.questsCompleted++;
    this.sessionQuestsCompleted++;

    if (questCategory === 'navigation' || questCategory === 'follow_instructions') {
      this.state.navigationQuestsCompleted++;
    }
    if (questCategory === 'cultural') {
      this.state.culturalQuestsCompleted = (this.state.culturalQuestsCompleted || 0) + 1;
    }

    this.trackDailyProgress('quest_count', 1);
    this.checkAchievements();
  }

  /**
   * Called with vocabulary category usage for daily challenges
   */
  public onVocabularyCategoryUsed(category: string): void {
    this.trackDailyProgress('vocabulary_category', 1);
  }

  /**
   * Called when a notice board article is read
   */
  public onArticleRead(): void {
    this.state.articlesRead = (this.state.articlesRead || 0) + 1;
    this.checkAchievements();
  }

  // --- Achievement System ---

  private checkAchievements(): void {
    for (const achievement of this.state.achievements) {
      if (achievement.unlockedAt) continue; // Already unlocked

      const met = this.isConditionMet(achievement);
      if (met) {
        achievement.unlockedAt = Date.now();
        this.addXP(XP_REWARDS.achievementUnlocked, `Achievement: ${achievement.name}`);
        this.onAchievementUnlocked?.({ achievement });
      }
    }
  }

  private isConditionMet(achievement: Achievement): boolean {
    const { type, threshold } = achievement.condition;

    switch (type) {
      case 'words_learned':
        // Checked externally via setProgressStats
        return false; // Will be checked when stats are updated
      case 'conversations':
        return false; // Will be checked when stats are updated
      case 'grammar_mastered':
        return false; // Will be checked when stats are updated
      case 'quests_completed':
        return this.state.questsCompleted >= threshold;
      case 'navigation_quests':
        return this.state.navigationQuestsCompleted >= threshold;
      case 'streak_days':
        return this.state.consecutiveDays >= threshold;
      case 'level_reached':
        return this.state.xp.level >= threshold;
      case 'fluency_reached':
        return false; // Checked via setProgressStats
      case 'cultural_quests':
        return (this.state.culturalQuestsCompleted || 0) >= threshold;
      case 'articles_read':
        return (this.state.articlesRead || 0) >= threshold;
      default:
        return false;
    }
  }

  /**
   * Update achievement checks with external stats from LanguageProgressTracker
   */
  public updateProgressStats(stats: {
    wordsLearned: number;
    conversations: number;
    grammarMastered: number;
    overallFluency: number;
    streakDays: number;
  }): void {
    this.state.consecutiveDays = stats.streakDays;

    for (const achievement of this.state.achievements) {
      if (achievement.unlockedAt) continue;

      const { type, threshold } = achievement.condition;
      let met = false;

      switch (type) {
        case 'words_learned':
          met = stats.wordsLearned >= threshold;
          break;
        case 'conversations':
          met = stats.conversations >= threshold;
          break;
        case 'grammar_mastered':
          met = stats.grammarMastered >= threshold;
          break;
        case 'fluency_reached':
          met = stats.overallFluency >= threshold;
          break;
        case 'streak_days':
          met = stats.streakDays >= threshold;
          break;
      }

      if (met) {
        achievement.unlockedAt = Date.now();
        this.addXP(XP_REWARDS.achievementUnlocked, `Achievement: ${achievement.name}`);
        this.onAchievementUnlocked?.({ achievement });
      }
    }
  }

  // --- Daily Challenge ---

  private ensureDailyChallenge(): void {
    const today = getTodayDateKey();
    if (!this.state.dailyChallenge || this.state.dailyChallenge.dateKey !== today) {
      this.state.dailyChallenge = generateDailyChallenge(today);
    }
  }

  private trackDailyProgress(type: string, amount: number): void {
    this.ensureDailyChallenge();
    const challenge = this.state.dailyChallenge;
    if (!challenge || challenge.completed) return;

    if (challenge.type === type) {
      challenge.progress += amount;
      if (challenge.progress >= challenge.target) {
        challenge.completed = true;

        // Streak tracking
        const today = getTodayDateKey();
        const lastDate = this.state.lastDailyChallengeDate;
        if (lastDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
          if (lastDate === yesterdayKey) {
            this.state.dailyChallengeStreak = (this.state.dailyChallengeStreak || 0) + 1;
          } else if (lastDate !== today) {
            this.state.dailyChallengeStreak = 1; // Reset streak
          }
        } else {
          this.state.dailyChallengeStreak = 1;
        }
        this.state.lastDailyChallengeDate = today;

        // Apply streak multiplier: 1.0x base, +0.1x per streak day (max 2.0x)
        const streakMultiplier = Math.min(2.0, 1.0 + (this.state.dailyChallengeStreak - 1) * 0.1);
        const streakXP = Math.round(challenge.xpReward * streakMultiplier);

        this.addXP(streakXP, `Daily challenge (${this.state.dailyChallengeStreak}-day streak)`);
        this.onDailyChallengeCompleted?.(challenge);
      }
    }
  }

  // --- Periodic Assessment ---

  private checkPeriodicAssessment(level: number, tier: string): void {
    if (!isPeriodicAssessmentLevel(level)) return;
    if (!isPeriodicAssessmentCooldownMet(this.lastPeriodicAssessmentTimestamp)) return;

    this.lastPeriodicAssessmentTimestamp = Date.now();
    this.onPeriodicAssessmentTriggered?.({ level, tier });
  }

  /**
   * Record that a periodic assessment was completed.
   * Resets the cooldown timer so the same level won't re-trigger immediately.
   */
  public recordPeriodicAssessmentCompleted(): void {
    this.lastPeriodicAssessmentTimestamp = Date.now();
  }

  public getLastPeriodicAssessmentTimestamp(): number | null {
    return this.lastPeriodicAssessmentTimestamp;
  }

  // --- Getters ---

  public getState(): GamificationState { return { ...this.state }; }
  public getXP(): number { return this.state.xp.totalXP; }
  public getLevel(): number { return this.state.xp.level; }
  public getLevelTier(): string { return getLevelTier(this.state.xp.level); }
  public getXPProgress(): number {
    if (this.state.xp.level >= MAX_LEVEL) return 1;
    const currentThreshold = LEVEL_THRESHOLDS[this.state.xp.level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[this.state.xp.level] || currentThreshold + 100;
    return (this.state.xp.totalXP - currentThreshold) / (nextThreshold - currentThreshold);
  }
  public getUnlockedAchievements(): Achievement[] {
    return this.state.achievements.filter(a => a.unlockedAt);
  }
  public getDailyChallenge(): DailyChallenge | null {
    this.ensureDailyChallenge();
    return this.state.dailyChallenge;
  }

  // --- Persistence ---

  public exportState(): string {
    return JSON.stringify({
      ...this.state,
      lastPeriodicAssessmentTimestamp: this.lastPeriodicAssessmentTimestamp,
    });
  }

  public importState(json: string): void {
    try {
      const parsed = JSON.parse(json);
      const { lastPeriodicAssessmentTimestamp, ...gamificationState } = parsed;
      this.state = gamificationState;
      this.lastPeriodicAssessmentTimestamp = lastPeriodicAssessmentTimestamp ?? null;
      this.ensureDailyChallenge();
    } catch (e) {
      console.error('[LanguageGamificationTracker] Failed to import state:', e);
    }
  }

  // --- Callback Setters ---

  public setOnXPGain(cb: (event: XPGainEvent) => void): void { this.onXPGain = cb; }
  public setOnLevelUp(cb: (event: LevelUpEvent) => void): void { this.onLevelUp = cb; }
  public setOnAchievementUnlocked(cb: (event: AchievementUnlockedEvent) => void): void { this.onAchievementUnlocked = cb; }
  public setOnDailyChallengeCompleted(cb: (challenge: DailyChallenge) => void): void { this.onDailyChallengeCompleted = cb; }
  public setOnPeriodicAssessmentTriggered(cb: (event: PeriodicAssessmentEvent) => void): void { this.onPeriodicAssessmentTriggered = cb; }

  public dispose(): void {
    this.onXPGain = null;
    this.onLevelUp = null;
    this.onAchievementUnlocked = null;
    this.onDailyChallengeCompleted = null;
    this.onPeriodicAssessmentTriggered = null;
  }
}
