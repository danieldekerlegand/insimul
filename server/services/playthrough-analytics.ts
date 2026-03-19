/**
 * Cross-Playthrough Analytics Service
 *
 * Computes aggregated analytics across all playthroughs for a world:
 * status breakdowns, playtime/actions distributions, engagement timelines,
 * player leaderboards, and completion rates.
 */

import type { Playthrough } from '@shared/schema';
import type {
  CrossPlaythroughAnalytics,
  StatusBreakdown,
  EngagementPoint,
  PlayerSummary,
  DistributionBucket,
} from '@shared/analytics/playthrough-analytics-types';

export function computeCrossPlaythroughAnalytics(
  playthroughs: Playthrough[],
): CrossPlaythroughAnalytics {
  const total = playthroughs.length;

  // Unique players
  const playerIds = new Set(playthroughs.map(p => p.userId));

  // Status breakdown
  const statusCounts = new Map<string, number>();
  for (const p of playthroughs) {
    const s = p.status || 'unknown';
    statusCounts.set(s, (statusCounts.get(s) || 0) + 1);
  }
  const byStatus: StatusBreakdown[] = Array.from(statusCounts.entries()).map(
    ([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? count / total : 0,
    }),
  );

  // Playtime stats
  const playtimes = playthroughs.map(p => p.playtime || 0);
  const totalPlaytime = playtimes.reduce((a, b) => a + b, 0);
  const avgPlaytime = total > 0 ? totalPlaytime / total : 0;
  const medianPlaytime = median(playtimes);

  // Actions stats
  const actions = playthroughs.map(p => p.actionsCount || 0);
  const totalActions = actions.reduce((a, b) => a + b, 0);
  const avgActions = total > 0 ? totalActions / total : 0;

  // Decisions
  const totalDecisions = playthroughs.reduce(
    (sum, p) => sum + (p.decisionsCount || 0),
    0,
  );

  // Completion rate
  const completed = playthroughs.filter(p => p.status === 'completed').length;
  const abandoned = playthroughs.filter(p => p.status === 'abandoned').length;
  const completionRate =
    completed + abandoned > 0 ? completed / (completed + abandoned) : 0;

  // Average timestep
  const timesteps = playthroughs
    .map(p => p.currentTimestep || 0)
    .filter(t => t > 0);
  const avgTimestep =
    timesteps.length > 0
      ? timesteps.reduce((a, b) => a + b, 0) / timesteps.length
      : 0;

  // Engagement timeline
  const engagementTimeline = computeEngagementTimeline(playthroughs);

  // Player summaries
  const playerMap = new Map<string, PlayerSummary>();
  for (const p of playthroughs) {
    let summary = playerMap.get(p.userId);
    if (!summary) {
      summary = {
        userId: p.userId,
        playthroughCount: 0,
        totalPlaytime: 0,
        totalActions: 0,
        lastActive: null,
      };
      playerMap.set(p.userId, summary);
    }
    summary.playthroughCount++;
    summary.totalPlaytime += p.playtime || 0;
    summary.totalActions += p.actionsCount || 0;
    const lastPlayed = p.lastPlayedAt
      ? new Date(p.lastPlayedAt).toISOString()
      : null;
    if (
      lastPlayed &&
      (!summary.lastActive || lastPlayed > summary.lastActive)
    ) {
      summary.lastActive = lastPlayed;
    }
  }
  const allPlayers = Array.from(playerMap.values());
  const topPlayersByPlaytime = [...allPlayers]
    .sort((a, b) => b.totalPlaytime - a.totalPlaytime)
    .slice(0, 10);
  const topPlayersByActions = [...allPlayers]
    .sort((a, b) => b.totalActions - a.totalActions)
    .slice(0, 10);

  // Distributions
  const playtimeDistribution = computeDistribution(
    playtimes,
    [0, 60, 300, 900, 1800, 3600, 7200, Infinity],
    ['<1m', '1-5m', '5-15m', '15-30m', '30m-1h', '1-2h', '2h+'],
  );
  const actionsDistribution = computeDistribution(
    actions,
    [0, 10, 50, 100, 250, 500, 1000, Infinity],
    ['<10', '10-50', '50-100', '100-250', '250-500', '500-1k', '1k+'],
  );

  return {
    totalPlaythroughs: total,
    uniquePlayers: playerIds.size,
    byStatus,
    totalPlaytime,
    avgPlaytime,
    medianPlaytime,
    totalActions,
    avgActions,
    totalDecisions,
    completionRate,
    avgTimestep,
    engagementTimeline,
    topPlayersByPlaytime,
    topPlayersByActions,
    playtimeDistribution,
    actionsDistribution,
  };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function computeEngagementTimeline(
  playthroughs: Playthrough[],
): EngagementPoint[] {
  const startedByDate = new Map<string, number>();
  const activeByDate = new Map<string, number>();

  for (const p of playthroughs) {
    const startDate = p.startedAt
      ? new Date(p.startedAt).toISOString().slice(0, 10)
      : p.createdAt
        ? new Date(p.createdAt).toISOString().slice(0, 10)
        : null;
    if (startDate) {
      startedByDate.set(startDate, (startedByDate.get(startDate) || 0) + 1);
    }

    const lastDate = p.lastPlayedAt
      ? new Date(p.lastPlayedAt).toISOString().slice(0, 10)
      : null;
    if (lastDate) {
      activeByDate.set(lastDate, (activeByDate.get(lastDate) || 0) + 1);
    }
  }

  const allDates = new Set([...Array.from(startedByDate.keys()), ...Array.from(activeByDate.keys())]);
  return Array.from(allDates)
    .sort()
    .map(date => ({
      date,
      started: startedByDate.get(date) || 0,
      activeSessions: activeByDate.get(date) || 0,
    }));
}

function computeDistribution(
  values: number[],
  boundaries: number[],
  labels: string[],
): DistributionBucket[] {
  const buckets: DistributionBucket[] = [];
  for (let i = 0; i < labels.length; i++) {
    buckets.push({
      min: boundaries[i],
      max: boundaries[i + 1],
      label: labels[i],
      count: 0,
    });
  }
  for (const v of values) {
    for (const bucket of buckets) {
      if (v >= bucket.min && v < bucket.max) {
        bucket.count++;
        break;
      }
    }
  }
  return buckets;
}
