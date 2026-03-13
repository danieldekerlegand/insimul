/**
 * Quest Completion Manager
 *
 * Handles the unified quest completion flow: sound effects, completion overlay,
 * reward distribution (XP, items, achievements), quest chain progression,
 * and event bus notifications.
 */

import {
  AdvancedDynamicTexture,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
  TextWrapping,
} from '@babylonjs/gui';
import { Scene } from '@babylonjs/core';
import type { GameEventBus } from './GameEventBus';
import type { LanguageGamificationTracker } from './LanguageGamificationTracker';
import type { BabylonQuestTracker } from './BabylonQuestTracker';

// ── Types ────────────────────────────────────────────────────────────────────

export interface QuestRewards {
  experienceReward: number;
  itemRewards?: Array<{ itemId: string; quantity: number; name: string }>;
  skillRewards?: Array<{ skillId: string; name: string; level: number }>;
  unlocks?: Array<{ type: 'area' | 'npc' | 'feature'; id: string; name: string }>;
}

export interface CompletedQuestData {
  id: string;
  worldId: string;
  title: string;
  questType: string;
  experienceReward: number;
  itemRewards?: QuestRewards['itemRewards'];
  skillRewards?: QuestRewards['skillRewards'];
  unlocks?: QuestRewards['unlocks'];
  questChainId?: string | null;
  questChainOrder?: number | null;
  assignedBy?: string | null;
}

export interface PlayerProgress {
  inventory: Array<{ itemId: string; quantity: number; name: string }>;
  questsCompleted: string[];
}

// ── Manager ──────────────────────────────────────────────────────────────────

export class QuestCompletionManager {
  private scene: Scene;
  private advancedTexture: AdvancedDynamicTexture;
  private eventBus: GameEventBus | null = null;
  private gamificationTracker: LanguageGamificationTracker | null = null;
  private questTracker: BabylonQuestTracker | null = null;
  private playerProgress: PlayerProgress = { inventory: [], questsCompleted: [] };
  private audioContext: AudioContext | null = null;
  private completionOverlay: Rectangle | null = null;

  constructor(scene: Scene, advancedTexture: AdvancedDynamicTexture) {
    this.scene = scene;
    this.advancedTexture = advancedTexture;
  }

  // ── Dependency Injection ─────────────────────────────────────────────────

  public setEventBus(eventBus: GameEventBus): void {
    this.eventBus = eventBus;
  }

  public setGamificationTracker(tracker: LanguageGamificationTracker): void {
    this.gamificationTracker = tracker;
  }

  public setQuestTracker(tracker: BabylonQuestTracker): void {
    this.questTracker = tracker;
  }

  public setPlayerProgress(progress: PlayerProgress): void {
    this.playerProgress = progress;
  }

  public getPlayerProgress(): PlayerProgress {
    return this.playerProgress;
  }

  // ── Main Completion Flow ─────────────────────────────────────────────────

  /**
   * Process quest completion: play sound, show overlay, distribute rewards,
   * update trackers, handle quest chains, and emit events.
   */
  public async completeQuest(quest: CompletedQuestData): Promise<void> {
    console.log(`[QuestCompletionManager] Completing quest: "${quest.title}"`);

    // 1. Play completion sound
    this.playCompletionSound();

    // 2. Distribute rewards
    const rewardSummary = this.distributeRewards(quest);

    // 3. Update gamification tracker (XP + achievements)
    this.gamificationTracker?.onQuestCompleted(quest.questType);

    // 4. Track completed quest
    if (!this.playerProgress.questsCompleted.includes(quest.id)) {
      this.playerProgress.questsCompleted.push(quest.id);
    }

    // 5. Show completion overlay
    this.showCompletionOverlay(quest, rewardSummary);

    // 6. Refresh quest tracker UI
    if (this.questTracker && quest.worldId) {
      this.questTracker.updateQuests(quest.worldId);
    }

    // 7. Fire event bus events
    this.eventBus?.emit({ type: 'quest_completed', questId: quest.id });

    // 8. Handle quest chain progression
    if (quest.questChainId) {
      await this.assignNextChainQuest(quest);
    }
  }

  // ── Sound Effects ────────────────────────────────────────────────────────

  /**
   * Play an ascending tone sequence as a quest completion fanfare.
   */
  public playCompletionSound(): void {
    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Ascending major chord: C5 → E5 → G5 → C6
      const frequencies = [523.25, 659.25, 783.99, 1046.50];
      const noteDuration = 0.15;
      const gap = 0.05;

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now);
        const startTime = now + i * (noteDuration + gap);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + noteDuration + 0.15);
      });
    } catch (e) {
      console.warn('[QuestCompletionManager] Audio playback failed:', e);
    }
  }

  // ── Reward Distribution ──────────────────────────────────────────────────

  private distributeRewards(quest: CompletedQuestData): string[] {
    const summary: string[] = [];

    // XP reward
    if (quest.experienceReward > 0) {
      summary.push(`+${quest.experienceReward} XP`);
    }

    // Item rewards → inventory
    if (quest.itemRewards && quest.itemRewards.length > 0) {
      for (const reward of quest.itemRewards) {
        const existing = this.playerProgress.inventory.find(
          item => item.itemId === reward.itemId
        );
        if (existing) {
          existing.quantity += reward.quantity;
        } else {
          this.playerProgress.inventory.push({ ...reward });
        }
        summary.push(`${reward.name} x${reward.quantity}`);
      }
    }

    // Skill rewards
    if (quest.skillRewards && quest.skillRewards.length > 0) {
      for (const reward of quest.skillRewards) {
        summary.push(`${reward.name} +${reward.level}`);
      }
    }

    // Unlocks
    if (quest.unlocks && quest.unlocks.length > 0) {
      for (const unlock of quest.unlocks) {
        summary.push(`Unlocked: ${unlock.name}`);
      }
    }

    return summary;
  }

  // ── Completion Overlay ───────────────────────────────────────────────────

  /**
   * Show a full-screen completion overlay for 3 seconds with quest title,
   * XP earned, and rewards.
   */
  public showCompletionOverlay(
    quest: CompletedQuestData,
    rewardSummary: string[]
  ): void {
    // Remove any existing overlay
    this.removeCompletionOverlay();

    // Full-screen backdrop
    const overlay = new Rectangle('questCompletionOverlay');
    overlay.width = '100%';
    overlay.height = '100%';
    overlay.background = 'rgba(0, 0, 0, 0.6)';
    overlay.thickness = 0;
    overlay.zIndex = 300;
    this.completionOverlay = overlay;

    // Central panel
    const panel = new Rectangle('completionPanel');
    panel.width = '400px';
    panel.adaptHeightToChildren = true;
    panel.background = 'rgba(20, 20, 40, 0.95)';
    panel.color = '#FFD700';
    panel.thickness = 3;
    panel.cornerRadius = 15;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    overlay.addControl(panel);

    const stack = new StackPanel();
    stack.width = '100%';
    stack.paddingTop = '20px';
    stack.paddingBottom = '20px';
    stack.paddingLeft = '20px';
    stack.paddingRight = '20px';
    panel.addControl(stack);

    // Trophy icon
    const icon = new TextBlock();
    icon.text = '\u{1F3C6}'; // trophy emoji
    icon.fontSize = 48;
    icon.height = '60px';
    stack.addControl(icon);

    // "Quest Complete!" header
    const header = new TextBlock();
    header.text = 'Quest Complete!';
    header.color = '#FFD700';
    header.fontSize = 24;
    header.fontWeight = 'bold';
    header.height = '35px';
    stack.addControl(header);

    // Quest title
    const title = new TextBlock();
    title.text = quest.title;
    title.color = 'white';
    title.fontSize = 16;
    title.height = '25px';
    title.textWrapping = TextWrapping.WordWrap;
    stack.addControl(title);

    // Quest giver
    if (quest.assignedBy) {
      const giver = new TextBlock();
      giver.text = `Completed for: ${quest.assignedBy}`;
      giver.color = '#AAA';
      giver.fontSize = 12;
      giver.height = '20px';
      stack.addControl(giver);
    }

    // Separator
    const sep = new Rectangle();
    sep.width = '80%';
    sep.height = '2px';
    sep.background = '#FFD700';
    sep.thickness = 0;
    sep.paddingTop = '10px';
    sep.paddingBottom = '10px';
    stack.addControl(sep);

    // Rewards header
    const rewardsHeader = new TextBlock();
    rewardsHeader.text = 'Rewards';
    rewardsHeader.color = '#FFD700';
    rewardsHeader.fontSize = 14;
    rewardsHeader.fontWeight = 'bold';
    rewardsHeader.height = '25px';
    stack.addControl(rewardsHeader);

    // XP with animated counter effect (displayed as final value)
    const xpText = new TextBlock();
    xpText.text = `\u2B50 ${quest.experienceReward} XP`;
    xpText.color = '#FFD700';
    xpText.fontSize = 22;
    xpText.fontWeight = 'bold';
    xpText.height = '35px';
    stack.addControl(xpText);

    // Animate XP counter from 0 to final value
    this.animateXPCounter(xpText, quest.experienceReward);

    // Additional rewards
    const nonXPRewards = rewardSummary.filter(r => !r.startsWith('+'));
    if (nonXPRewards.length > 0) {
      for (const reward of nonXPRewards) {
        const rewardLine = new TextBlock();
        rewardLine.text = `\u{1F381} ${reward}`;
        rewardLine.color = '#90EE90';
        rewardLine.fontSize = 14;
        rewardLine.height = '22px';
        stack.addControl(rewardLine);
      }
    }

    this.advancedTexture.addControl(overlay);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.removeCompletionOverlay();
    }, 3000);
  }

  private animateXPCounter(textBlock: TextBlock, targetXP: number): void {
    if (targetXP <= 0) return;
    const duration = 1500; // ms
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(targetXP * eased);
      textBlock.text = `\u2B50 ${current} XP`;
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  private removeCompletionOverlay(): void {
    if (this.completionOverlay) {
      this.advancedTexture.removeControl(this.completionOverlay);
      this.completionOverlay = null;
    }
  }

  // ── Quest Chain Progression ──────────────────────────────────────────────

  /**
   * If the completed quest is part of a chain, fetch and auto-assign the next quest.
   */
  private async assignNextChainQuest(quest: CompletedQuestData): Promise<void> {
    if (!quest.questChainId || !quest.worldId) return;

    try {
      const response = await fetch(`/api/worlds/${quest.worldId}/quests`);
      if (!response.ok) return;

      const allQuests: CompletedQuestData[] = await response.json();
      const chainQuests = allQuests
        .filter(q => q.questChainId === quest.questChainId)
        .sort((a, b) => (a.questChainOrder || 0) - (b.questChainOrder || 0));

      const nextOrder = (quest.questChainOrder || 0) + 1;
      const nextQuest = chainQuests.find(q => q.questChainOrder === nextOrder);

      if (nextQuest) {
        // Activate the next quest in the chain
        await fetch(`/api/quests/${nextQuest.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active' }),
        });

        this.eventBus?.emit({
          type: 'quest_accepted',
          questId: nextQuest.id,
          questTitle: nextQuest.title,
        });

        // Refresh tracker to show new quest
        if (this.questTracker) {
          this.questTracker.updateQuests(quest.worldId);
        }

        console.log(`[QuestCompletionManager] Auto-assigned next chain quest: "${nextQuest.title}"`);
      }
    } catch (e) {
      console.warn('[QuestCompletionManager] Failed to assign next chain quest:', e);
    }
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────

  public dispose(): void {
    this.removeCompletionOverlay();
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.eventBus = null;
    this.gamificationTracker = null;
    this.questTracker = null;
  }
}
