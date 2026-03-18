/**
 * Quest Peer Comparison Service
 *
 * Computes anonymized aggregate statistics for quest performance across all
 * players in a world, allowing individual players to see how they compare
 * to their peers without revealing anyone's identity.
 */

export interface QuestPeerStats {
  /** Total number of players included in the comparison */
  totalPlayers: number;
  /** Total completed quests across all players */
  totalCompletedQuests: number;
  /** Aggregate stats across all quest types */
  overall: PeerBucket;
  /** Stats broken down by quest type (e.g. vocabulary, conversation) */
  byQuestType: Record<string, PeerBucket>;
  /** Stats broken down by difficulty level */
  byDifficulty: Record<string, PeerBucket>;
}

export interface PeerBucket {
  /** Number of completed quests in this bucket */
  completedCount: number;
  /** Average completion time in milliseconds (assignedAt → completedAt) */
  avgCompletionTimeMs: number;
  /** Median completion time in milliseconds */
  medianCompletionTimeMs: number;
  /** Success rate: completed / (completed + failed + abandoned) */
  successRate: number;
  /** Average attempts before completion */
  avgAttempts: number;
  /** Average XP reward earned */
  avgXpEarned: number;
}

export interface PlayerPeerComparison {
  /** The requesting player's own stats */
  player: PeerBucket;
  /** Anonymized aggregate stats for all players */
  peers: QuestPeerStats;
  /** Percentile rankings (0–100) for the requesting player */
  percentiles: {
    completionTime: number;
    successRate: number;
    questsCompleted: number;
    xpEarned: number;
  };
}

/** Minimal quest shape needed for comparison computation */
export interface ComparisonQuest {
  assignedTo: string | null;
  status: string | null;
  questType: string;
  difficulty: string;
  assignedAt: Date | string | null;
  completedAt: Date | string | null;
  failedAt?: Date | string | null;
  abandonedAt?: Date | string | null;
  attemptCount?: number | null;
  experienceReward?: number | null;
}

/**
 * Compute the completion time in ms between assignedAt and completedAt.
 * Returns null if either date is missing or invalid.
 */
function completionTimeMs(quest: ComparisonQuest): number | null {
  if (!quest.assignedAt || !quest.completedAt) return null;
  const start = new Date(quest.assignedAt).getTime();
  const end = new Date(quest.completedAt).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return null;
  return end - start;
}

/** Compute the median of a sorted numeric array. */
function median(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Compute what percentile `value` falls at within a sorted array (0–100). */
export function percentileOf(value: number, sorted: number[]): number {
  if (sorted.length === 0) return 50;
  let count = 0;
  for (const v of sorted) {
    if (v < value) count++;
    else break;
  }
  return Math.round((count / sorted.length) * 100);
}

/** Build a PeerBucket from a set of quests. */
function buildBucket(quests: ComparisonQuest[]): PeerBucket {
  const completed = quests.filter(q => q.status === 'completed');
  const failed = quests.filter(q => q.status === 'failed');
  const abandoned = quests.filter(q => q.status === 'abandoned');
  const total = completed.length + failed.length + abandoned.length;

  const times = completed
    .map(completionTimeMs)
    .filter((t): t is number => t !== null)
    .sort((a, b) => a - b);

  const attempts = completed
    .map(q => q.attemptCount ?? 1)
    .filter(a => a > 0);

  const xpValues = completed.map(q => q.experienceReward ?? 0);

  return {
    completedCount: completed.length,
    avgCompletionTimeMs: times.length > 0
      ? Math.round(times.reduce((s, t) => s + t, 0) / times.length)
      : 0,
    medianCompletionTimeMs: Math.round(median(times)),
    successRate: total > 0
      ? Math.round((completed.length / total) * 1000) / 1000
      : 0,
    avgAttempts: attempts.length > 0
      ? Math.round((attempts.reduce((s, a) => s + a, 0) / attempts.length) * 10) / 10
      : 0,
    avgXpEarned: xpValues.length > 0
      ? Math.round(xpValues.reduce((s, x) => s + x, 0) / xpValues.length)
      : 0,
  };
}

/**
 * Compute anonymized peer stats from all quests in a world.
 * Only includes terminal quests (completed, failed, abandoned).
 */
export function computePeerStats(quests: ComparisonQuest[]): QuestPeerStats {
  const terminal = quests.filter(q =>
    q.status === 'completed' || q.status === 'failed' || q.status === 'abandoned'
  );

  const players = new Set(terminal.map(q => q.assignedTo).filter(Boolean));

  // Group by quest type
  const byType: Record<string, ComparisonQuest[]> = {};
  for (const q of terminal) {
    const key = q.questType || 'unknown';
    if (!byType[key]) byType[key] = [];
    byType[key].push(q);
  }

  // Group by difficulty
  const byDiff: Record<string, ComparisonQuest[]> = {};
  for (const q of terminal) {
    const key = q.difficulty || 'unknown';
    if (!byDiff[key]) byDiff[key] = [];
    byDiff[key].push(q);
  }

  const typeBuckets: Record<string, PeerBucket> = {};
  for (const [type, tQuests] of Object.entries(byType)) {
    typeBuckets[type] = buildBucket(tQuests);
  }

  const diffBuckets: Record<string, PeerBucket> = {};
  for (const [diff, dQuests] of Object.entries(byDiff)) {
    diffBuckets[diff] = buildBucket(dQuests);
  }

  return {
    totalPlayers: players.size,
    totalCompletedQuests: terminal.filter(q => q.status === 'completed').length,
    overall: buildBucket(terminal),
    byQuestType: typeBuckets,
    byDifficulty: diffBuckets,
  };
}

/**
 * Compute a player's peer comparison — their own stats plus percentile rankings.
 * The playerName is used only to partition data; it is NOT included in the output.
 */
export function computePlayerComparison(
  allQuests: ComparisonQuest[],
  playerName: string,
): PlayerPeerComparison {
  const peerStats = computePeerStats(allQuests);

  // Split quests for requesting player vs others
  const playerQuests = allQuests.filter(q => q.assignedTo === playerName);
  const playerBucket = buildBucket(playerQuests);

  // Compute per-player aggregates for percentile ranking
  const playerMap = new Map<string, ComparisonQuest[]>();
  for (const q of allQuests) {
    if (!q.assignedTo) continue;
    if (!playerMap.has(q.assignedTo)) playerMap.set(q.assignedTo, []);
    playerMap.get(q.assignedTo)!.push(q);
  }

  const perPlayerCompleted: number[] = [];
  const perPlayerAvgTime: number[] = [];
  const perPlayerSuccessRate: number[] = [];
  const perPlayerTotalXp: number[] = [];

  for (const [, pQuests] of Array.from(playerMap.entries())) {
    const bucket = buildBucket(pQuests);
    perPlayerCompleted.push(bucket.completedCount);
    if (bucket.avgCompletionTimeMs > 0) perPlayerAvgTime.push(bucket.avgCompletionTimeMs);
    const terminal = pQuests.filter(q =>
      q.status === 'completed' || q.status === 'failed' || q.status === 'abandoned'
    );
    if (terminal.length > 0) perPlayerSuccessRate.push(bucket.successRate);
    perPlayerTotalXp.push(
      pQuests
        .filter(q => q.status === 'completed')
        .reduce((s, q) => s + (q.experienceReward ?? 0), 0)
    );
  }

  perPlayerCompleted.sort((a, b) => a - b);
  perPlayerAvgTime.sort((a, b) => a - b);
  perPlayerSuccessRate.sort((a, b) => a - b);
  perPlayerTotalXp.sort((a, b) => a - b);

  const playerTotalXp = playerQuests
    .filter(q => q.status === 'completed')
    .reduce((s, q) => s + (q.experienceReward ?? 0), 0);

  return {
    player: playerBucket,
    peers: peerStats,
    percentiles: {
      completionTime: playerBucket.avgCompletionTimeMs > 0
        // For completion time, lower is better — invert percentile
        ? 100 - percentileOf(playerBucket.avgCompletionTimeMs, perPlayerAvgTime)
        : 50,
      successRate: percentileOf(playerBucket.successRate, perPlayerSuccessRate),
      questsCompleted: percentileOf(playerBucket.completedCount, perPlayerCompleted),
      xpEarned: percentileOf(playerTotalXp, perPlayerTotalXp),
    },
  };
}
