/**
 * GuildQuestManager
 *
 * Simple sequential guild quest progression. Each guild has a quest master
 * NPC who gives the player one quest at a time. Completing it unlocks the
 * next one in the guild's sequence (ordered by guildTier, then creation order).
 *
 * Flow:
 *   1. Player talks to guild master → receives the next unavailable quest
 *      (status changes: unavailable → available)
 *   2. Player equips it (available → active)
 *   3. Player completes it (active → completed)
 *   4. Next quest in sequence becomes receivable from the guild master
 *
 * Guild membership is implicit: completing the Tier 0 "join" quest means
 * the player has joined that guild.
 */

import type { GuildId, GuildTier } from '../guild-definitions';
import { getAllGuildIds, getGuildDefinition } from '../guild-definitions';

// ── Types ────────────────────────────────────────────────────────────────────

export interface GuildProgress {
  guildId: GuildId;
  joined: boolean;
  currentTier: GuildTier;
  questsCompleted: number;
  totalQuests: number;
}

// ── Service ──────────────────────────────────────────────────────────────────

export class GuildQuestManager {

  /**
   * Get the next quest available from a guild master.
   * Returns null if the player has no more quests to receive from this guild,
   * or if they already have an unreceived quest pending (must complete current first).
   */
  getNextQuestForGuild(
    guildId: GuildId,
    allQuests: any[],
  ): any | null {
    const guildQuests = allQuests
      .filter(q => q.guildId === guildId)
      .sort((a, b) => (a.guildTier ?? 0) - (b.guildTier ?? 0));

    // If the player has an active or available quest from this guild, don't give another
    const hasPending = guildQuests.some(q =>
      q.status === 'active' || q.status === 'available'
    );
    if (hasPending) return null;

    // Find the first unavailable quest in sequence
    const next = guildQuests.find(q => q.status === 'unavailable');
    return next || null;
  }

  /**
   * Find an NPC who serves as the guild master for a given guild.
   * Matches by occupation (case-insensitive) against the guild's guildMasterOccupation.
   * Returns { name, id } or null if no matching NPC exists.
   */
  findGuildMasterNpc(
    guildId: GuildId,
    characters: Array<{ id?: string; name?: string; firstName?: string; lastName?: string; occupation?: string | null }>,
  ): { name: string; id: string } | null {
    const def = getGuildDefinition(guildId);
    if (!def) return null;

    const targetOccupation = def.guildMasterOccupation.toLowerCase();
    const match = characters.find(c =>
      c.occupation && c.occupation.toLowerCase() === targetOccupation
    );
    if (!match) return null;

    const name = match.name || [match.firstName, match.lastName].filter(Boolean).join(' ') || 'Guild Master';
    return { name, id: match.id || '' };
  }

  /**
   * Receive a quest from a guild master: moves it from unavailable → available.
   * If characters are provided, assigns the guild master NPC to the quest.
   * Returns the quest ID if successful, null if nothing to receive.
   */
  receiveNextQuest(
    guildId: GuildId,
    allQuests: any[],
    characters?: Array<{ id?: string; name?: string; firstName?: string; lastName?: string; occupation?: string | null }>,
  ): string | null {
    const next = this.getNextQuestForGuild(guildId, allQuests);
    if (!next) return null;
    next.status = 'available';

    // Assign guild master NPC if characters are provided
    if (characters) {
      const guildMaster = this.findGuildMasterNpc(guildId, characters);
      if (guildMaster) {
        next.assignedBy = guildMaster.name;
        next.assignedByCharacterId = guildMaster.id;
      }
    }

    return next.id;
  }

  /**
   * Get the join quest (Tier 0) for a guild. Returns null if already completed.
   */
  getJoinQuest(
    guildId: GuildId,
    allQuests: any[],
  ): any | null {
    return allQuests.find(q =>
      q.guildId === guildId
      && q.guildTier === 0
      && q.status !== 'completed'
    ) || null;
  }

  /**
   * Check if player has joined a guild (completed its Tier 0 quest).
   */
  hasJoinedGuild(
    guildId: GuildId,
    allQuests: any[],
  ): boolean {
    return allQuests.some(q =>
      q.guildId === guildId
      && q.guildTier === 0
      && q.status === 'completed'
    );
  }

  /**
   * Compute progress for all guilds.
   */
  getAllGuildProgress(allQuests: any[]): Map<GuildId, GuildProgress> {
    const progress = new Map<GuildId, GuildProgress>();

    for (const guildId of getAllGuildIds()) {
      const guildQuests = allQuests.filter(q => q.guildId === guildId);
      const completed = guildQuests.filter(q => q.status === 'completed').length;
      const joined = this.hasJoinedGuild(guildId, allQuests);

      // Current tier = tier of the next incomplete quest, or highest tier if all done
      let currentTier: GuildTier = 0;
      const nextIncomplete = guildQuests
        .sort((a, b) => (a.guildTier ?? 0) - (b.guildTier ?? 0))
        .find(q => q.status !== 'completed');
      if (nextIncomplete) {
        currentTier = (nextIncomplete.guildTier ?? 0) as GuildTier;
      } else if (guildQuests.length > 0) {
        currentTier = Math.max(...guildQuests.map(q => q.guildTier ?? 0)) as GuildTier;
      }

      progress.set(guildId, {
        guildId,
        joined,
        currentTier,
        questsCompleted: completed,
        totalQuests: guildQuests.length,
      });
    }

    return progress;
  }
}
