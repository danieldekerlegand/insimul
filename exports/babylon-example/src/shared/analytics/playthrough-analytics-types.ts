/**
 * Cross-Playthrough Analytics Types
 *
 * Shared types for aggregated analytics across all playthroughs in a world.
 * Used by both server (computation) and client (display).
 */

/** Aggregated analytics across all playthroughs for a world. */
export interface CrossPlaythroughAnalytics {
  /** Total number of playthroughs */
  totalPlaythroughs: number;
  /** Number of unique players (by userId) */
  uniquePlayers: number;
  /** Breakdown by playthrough status */
  byStatus: StatusBreakdown[];
  /** Total playtime across all playthroughs (seconds) */
  totalPlaytime: number;
  /** Average playtime per playthrough (seconds) */
  avgPlaytime: number;
  /** Median playtime per playthrough (seconds) */
  medianPlaytime: number;
  /** Total actions across all playthroughs */
  totalActions: number;
  /** Average actions per playthrough */
  avgActions: number;
  /** Total decisions across all playthroughs */
  totalDecisions: number;
  /** Completion rate (completed / (completed + abandoned)) */
  completionRate: number;
  /** Average timestep reached */
  avgTimestep: number;
  /** Engagement over time — playthroughs started per day */
  engagementTimeline: EngagementPoint[];
  /** Top players by playtime */
  topPlayersByPlaytime: PlayerSummary[];
  /** Top players by actions */
  topPlayersByActions: PlayerSummary[];
  /** Playtime distribution buckets (for histogram) */
  playtimeDistribution: DistributionBucket[];
  /** Actions distribution buckets (for histogram) */
  actionsDistribution: DistributionBucket[];
}

/** Playthrough count by status. */
export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

/** A point on the engagement timeline. */
export interface EngagementPoint {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Playthroughs started on this date */
  started: number;
  /** Playthroughs active on this date */
  activeSessions: number;
}

/** Summary of a single player's cross-playthrough stats. */
export interface PlayerSummary {
  userId: string;
  playthroughCount: number;
  totalPlaytime: number;
  totalActions: number;
  lastActive: string | null;
}

/** A bucket in a distribution histogram. */
export interface DistributionBucket {
  /** Lower bound of the bucket (inclusive) */
  min: number;
  /** Upper bound of the bucket (exclusive) */
  max: number;
  /** Display label */
  label: string;
  /** Count of playthroughs in this bucket */
  count: number;
}
