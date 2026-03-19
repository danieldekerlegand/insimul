/**
 * Playthrough Metrics Service
 *
 * Handles accumulation of playtime, actions count, and decisions count
 * for player playthroughs. Provides logic for determining which action
 * types constitute "decisions" and for safely accumulating metric deltas.
 */

import { storage } from '../db/storage';

/** Action types that count as major player decisions */
const DECISION_ACTION_TYPES = new Set([
  'dialogue_choice',
  'quest_accept',
  'quest_reject',
  'quest_abandon',
  'quest_complete',
  'faction_join',
  'faction_leave',
  'moral_choice',
  'trade',
  'gift',
  'combat_initiate',
  'relationship_change',
  'language_choice',
]);

/**
 * Returns true if the given actionType represents a major player decision.
 */
export function isDecisionAction(actionType: string): boolean {
  return DECISION_ACTION_TYPES.has(actionType);
}

/**
 * Accumulate metrics on a playthrough. All values are deltas (additive).
 * Returns the updated playthrough.
 */
export async function accumulateMetrics(
  playthroughId: string,
  deltas: {
    playtimeSeconds?: number;
    actions?: number;
    decisions?: number;
  },
) {
  const playthrough = await storage.getPlaythrough(playthroughId);
  if (!playthrough) {
    return undefined;
  }

  const updates: Record<string, any> = {
    lastPlayedAt: new Date(),
  };

  if (deltas.playtimeSeconds && deltas.playtimeSeconds > 0) {
    updates.playtime = (playthrough.playtime || 0) + Math.round(deltas.playtimeSeconds);
  }

  if (deltas.actions && deltas.actions > 0) {
    updates.actionsCount = (playthrough.actionsCount || 0) + deltas.actions;
  }

  if (deltas.decisions && deltas.decisions > 0) {
    updates.decisionsCount = (playthrough.decisionsCount || 0) + deltas.decisions;
  }

  // Only update if there are actual metric changes
  if (Object.keys(updates).length <= 1) {
    // Only lastPlayedAt, no real metric changes
    return playthrough;
  }

  return storage.updatePlaythrough(playthroughId, updates);
}

/**
 * Get the current metrics snapshot for a playthrough.
 */
export function getMetricsSnapshot(playthrough: {
  playtime?: number | null;
  actionsCount?: number | null;
  decisionsCount?: number | null;
  startedAt?: Date | null;
  lastPlayedAt?: Date | null;
}) {
  return {
    playtime: playthrough.playtime || 0,
    actionsCount: playthrough.actionsCount || 0,
    decisionsCount: playthrough.decisionsCount || 0,
    startedAt: playthrough.startedAt || null,
    lastPlayedAt: playthrough.lastPlayedAt || null,
  };
}
