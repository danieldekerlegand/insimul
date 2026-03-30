/**
 * GuildQuestManager
 *
 * Controls quest visibility and guild progression. Instead of showing all
 * ~85 quests at once, this service gates quests behind guild membership
 * and tier progression, so players see 5-10 quests at a time.
 *
 * Flow:
 *   1. Player joins a guild by completing its Tier 0 "join" quest
 *   2. Tier 1 quests become visible (3-4 starter quests)
 *   3. Completing all Tier 1 quests unlocks Tier 2, etc.
 *   4. Players must return to the guild NPC to receive new quests
 *
 * Guild membership is tracked in the playthrough overlay (truths system).
 */

import type { GuildId, GuildTier } from '../../shared/guild-definitions';
import { GUILD_DEFINITIONS, getAllGuildIds } from '../../shared/guild-definitions';

// ── Types ────────────────────────────────────────────────────────────────────

export interface GuildProgress {
  guildId: GuildId;
  joined: boolean;
  currentTier: GuildTier;
  questsCompleted: number;
  questsInTier: number;
  tierComplete: boolean;
}

export interface VisibleQuest {
  quest: any;
  reason: 'active' | 'guild_available' | 'join_quest' | 'main_quest';
}

/** Maximum number of quests to surface at once (soft cap) */
const MAX_VISIBLE_QUESTS = 10;

// ── Service ──────────────────────────────────────────────────────────────────

export class GuildQuestManager {

  /**
   * Get quests visible to the player, filtered by guild membership and tier.
   *
   * Priority order:
   *   1. Active quests (already accepted, always shown)
   *   2. Main quest chain (always visible, ungated)
   *   3. Join quests for guilds not yet joined (one per unjoined guild)
   *   4. Available quests in joined guilds at current tier
   */
  getVisibleQuests(
    allQuests: any[],
    completedQuestIds: Set<string>,
    guildMemberships: Map<GuildId, GuildProgress>,
  ): VisibleQuest[] {
    const result: VisibleQuest[] = [];

    // 1. Active quests — always shown
    const activeQuests = allQuests.filter(q => q.status === 'active');
    for (const q of activeQuests) {
      result.push({ quest: q, reason: 'active' });
    }

    // 2. Main quest chain — always visible (no guild gating)
    const mainQuests = allQuests.filter(q =>
      !q.guildId && (q.questType === 'main_quest' || q.questType === 'main' || q.questChainId)
      && q.status !== 'active' && q.status !== 'completed'
      && this.prerequisitesMet(q, completedQuestIds)
    );
    for (const q of mainQuests) {
      result.push({ quest: q, reason: 'main_quest' });
    }

    // 2b. Radiant quests — always visible (one-off NPC quests, no guild gating)
    const radiantQuests = allQuests.filter(q =>
      !q.guildId && q.conversationContext
      && q.status !== 'active' && q.status !== 'completed'
    );
    for (const q of radiantQuests) {
      result.push({ quest: q, reason: 'main_quest' });
    }

    // 3. Join quests for guilds the player hasn't joined yet
    const activeIds = new Set(result.map(r => r.quest.id));
    for (const guildId of getAllGuildIds()) {
      const progress = guildMemberships.get(guildId);
      if (progress?.joined) continue;

      // Find the Tier 0 join quest for this guild
      const joinQuest = allQuests.find(q =>
        q.guildId === guildId
        && q.guildTier === 0
        && q.status !== 'completed'
        && q.status !== 'active'
        && !activeIds.has(q.id)
        && this.prerequisitesMet(q, completedQuestIds)
      );
      if (joinQuest) {
        result.push({ quest: joinQuest, reason: 'join_quest' });
        activeIds.add(joinQuest.id);
      }
    }

    // 4. Available quests in joined guilds at current tier
    for (const [guildId, progress] of Array.from(guildMemberships)) {
      if (!progress.joined) continue;

      // Get quests at current tier that are available
      const tierQuests = allQuests.filter(q =>
        q.guildId === guildId
        && q.guildTier === progress.currentTier
        && q.status !== 'completed'
        && q.status !== 'active'
        && !activeIds.has(q.id)
        && this.prerequisitesMet(q, completedQuestIds)
      );

      for (const q of tierQuests) {
        if (result.length >= MAX_VISIBLE_QUESTS) break;
        result.push({ quest: q, reason: 'guild_available' });
        activeIds.add(q.id);
      }

      // If current tier is complete, show one "unlock" quest from next tier
      if (progress.tierComplete && progress.currentTier < 3) {
        const nextTier = (progress.currentTier + 1) as GuildTier;
        const unlockQuest = allQuests.find(q =>
          q.guildId === guildId
          && q.guildTier === nextTier
          && q.status !== 'completed'
          && q.status !== 'active'
          && !activeIds.has(q.id)
          && this.prerequisitesMet(q, completedQuestIds)
        );
        if (unlockQuest && result.length < MAX_VISIBLE_QUESTS) {
          result.push({ quest: unlockQuest, reason: 'guild_available' });
          activeIds.add(unlockQuest.id);
        }
      }
    }

    return result;
  }

  /**
   * Compute guild progress for a player.
   */
  getGuildProgress(
    allQuests: any[],
    completedQuestIds: Set<string>,
    joinedGuildIds: Set<GuildId>,
  ): Map<GuildId, GuildProgress> {
    const progress = new Map<GuildId, GuildProgress>();

    for (const guildId of getAllGuildIds()) {
      const guildQuests = allQuests.filter(q => q.guildId === guildId);
      const joined = joinedGuildIds.has(guildId);

      // Determine current tier: highest tier where at least one quest is completed
      let currentTier: GuildTier = 0;
      if (joined) {
        for (let tier = 3 as GuildTier; tier >= 0; tier--) {
          const tierQuests = guildQuests.filter(q => q.guildTier === tier);
          const anyCompleted = tierQuests.some(q => completedQuestIds.has(q.id));
          if (anyCompleted) {
            currentTier = tier as GuildTier;
            break;
          }
        }
        // If all quests at current tier are complete, the player is ready for next tier
        // but currentTier stays at the one they're working on
        if (currentTier === 0 && !guildQuests.some(q => q.guildTier === 0 && completedQuestIds.has(q.id))) {
          currentTier = 1; // Just joined, start at tier 1
        }
      }

      const tierQuests = guildQuests.filter(q => q.guildTier === currentTier);
      const completed = tierQuests.filter(q => completedQuestIds.has(q.id)).length;
      const tierComplete = tierQuests.length > 0 && completed >= tierQuests.length;

      progress.set(guildId, {
        guildId,
        joined,
        currentTier,
        questsCompleted: completed,
        questsInTier: tierQuests.length,
        tierComplete,
      });
    }

    return progress;
  }

  /**
   * Check if all prerequisite quests for a quest have been completed.
   */
  private prerequisitesMet(quest: any, completedQuestIds: Set<string>): boolean {
    const prereqs = quest.prerequisiteQuestIds;
    if (!prereqs || !Array.isArray(prereqs) || prereqs.length === 0) return true;
    return prereqs.every((id: string) => completedQuestIds.has(id));
  }
}
