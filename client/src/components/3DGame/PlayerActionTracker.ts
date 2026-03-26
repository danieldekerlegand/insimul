/**
 * Player Action Tracker
 *
 * Subscribes to GameEventBus events and records them as PlayTraces for
 * research-relevant behavioral analytics. Events are batched client-side
 * and flushed to the server periodically or on session end.
 *
 * Research-relevant categories tracked:
 * - Language learning interactions (vocabulary, pronunciation, conversations)
 * - Quest engagement patterns (accept, complete, abandon, fail)
 * - Social behavior (NPC dialogue, romance, reputation)
 * - Exploration (locations visited, settlements entered)
 * - Assessment performance (scores, phases, tier changes)
 */

import type { GameEventBus, GameEvent, GameEventType } from './GameEventBus';

// ── Types ───────────────────────────────────────────────────────────────────

export interface PlayerActionTrackerConfig {
  playthroughId: string;
  userId: string;
  worldId: string;
  /** Base URL for API calls (default: '') */
  apiBase?: string;
  /** Auth token for API calls */
  authToken?: string;
  /** Flush interval in ms (default: 30000 = 30s) */
  flushIntervalMs?: number;
  /** Max traces per batch (default: 100) */
  batchSize?: number;
  /** Current simulation timestep provider */
  getTimestep?: () => number;
  /** Current player character ID */
  characterId?: string;
  /** Current location ID provider */
  getLocationId?: () => string | undefined;
}

/** A pending trace waiting to be flushed to the server. */
export interface PendingTrace {
  actionType: string;
  actionName: string;
  actionData: Record<string, unknown>;
  timestep: number;
  characterId?: string;
  targetId?: string;
  targetType?: string;
  locationId?: string;
  outcome?: string;
  outcomeData?: Record<string, unknown>;
  durationMs?: number;
  timestamp: string; // ISO 8601
}

/** Research category for analytical grouping. */
export type ResearchCategory =
  | 'language_learning'
  | 'quest_engagement'
  | 'social_interaction'
  | 'exploration'
  | 'assessment'
  | 'combat'
  | 'inventory'
  | 'achievement'
  | 'session';

/** Maps event types to their research category. */
const EVENT_RESEARCH_CATEGORY: Record<GameEventType, ResearchCategory> = {
  // Language learning
  vocabulary_used: 'language_learning',
  vocabulary_overheard: 'language_learning',
  object_examined: 'language_learning',
  object_named: 'language_learning',
  utterance_evaluated: 'language_learning',
  utterance_quest_progress: 'language_learning',
  utterance_quest_completed: 'language_learning',
  pronunciation_assessment_data: 'language_learning',
  visual_vocab_prompted: 'language_learning',
  visual_vocab_answered: 'language_learning',
  direction_step_completed: 'language_learning',
  conversation_overheard: 'language_learning',
  ambient_conversation_started: 'language_learning',
  ambient_conversation_ended: 'language_learning',
  knowledge_applied: 'language_learning',
  identification_prompted: 'language_learning',
  identification_correct: 'language_learning',
  identification_incorrect: 'language_learning',

  // Quest engagement
  quest_accepted: 'quest_engagement',
  quest_completed: 'quest_engagement',
  quest_failed: 'quest_engagement',
  quest_abandoned: 'quest_engagement',
  quest_reminder: 'quest_engagement',
  quest_expired: 'quest_engagement',
  quest_milestone: 'quest_engagement',
  daily_quests_reset: 'quest_engagement',
  puzzle_solved: 'quest_engagement',
  puzzle_failed: 'quest_engagement',
  skill_rewards_applied: 'quest_engagement',

  // Social interaction
  npc_talked: 'social_interaction',
  conversation_turn: 'social_interaction',
  item_delivered: 'social_interaction',
  reputation_changed: 'social_interaction',
  romance_action: 'social_interaction',
  romance_stage_changed: 'social_interaction',
  npc_volition_action: 'social_interaction',
  npc_initiated_conversation: 'social_interaction',
  state_created_truth: 'social_interaction',
  state_expired_truth: 'social_interaction',
  create_truth: 'social_interaction',

  // Exploration
  location_visited: 'exploration',
  location_discovered: 'exploration',
  settlement_entered: 'exploration',

  // Assessment
  assessment_started: 'assessment',
  assessment_phase_started: 'assessment',
  assessment_phase_completed: 'assessment',
  assessment_tier_change: 'assessment',
  assessment_completed: 'assessment',
  assessment_conversation_quest_start: 'assessment',
  assessment_conversation_initiated: 'assessment',
  assessment_guided_conversation_start: 'assessment',
  assessment_conversation_completed: 'assessment',
  reading_completed: 'assessment',
  writing_submitted: 'assessment',
  listening_completed: 'assessment',
  conversation_assessment_completed: 'assessment',
  periodic_assessment_triggered: 'assessment',
  npc_exam_requested: 'assessment',
  npc_exam_started: 'assessment',
  npc_exam_listening_ready: 'assessment',
  npc_exam_question_answered: 'assessment',
  npc_exam_completed: 'assessment',

  // Combat
  enemy_defeated: 'combat',
  combat_action: 'combat',

  // Inventory
  item_collected: 'inventory',
  item_crafted: 'inventory',
  item_removed: 'inventory',
  item_used: 'inventory',
  item_dropped: 'inventory',
  item_equipped: 'inventory',
  item_unequipped: 'inventory',

  // Achievement
  achievement_unlocked: 'achievement',

  // Escort quests
  escort_started: 'quest_engagement',
  escort_completed: 'quest_engagement',

  // Session / onboarding
  onboarding_step_started: 'session',
  onboarding_step_completed: 'session',
  onboarding_completed: 'session',

  // Volition schedule events
  volition_schedule_override: 'social_interaction',
  volition_return_to_schedule: 'social_interaction',

  // NPC greetings
  npc_greeting: 'social_interaction',

  // Playthrough lifecycle
  playthrough_completed: 'session',
  playthrough_completion_requested: 'session',
  departure_assessment_triggered: 'assessment',

  // Time events
  hour_changed: 'session',
  day_changed: 'session',
  time_of_day_changed: 'session',

  // NPC relationship events
  npc_relationship_changed: 'social_interaction',

  // Conversational action detection
  conversational_action: 'language_learning',
  conversation_turn_counted: 'language_learning',
};

// ── Event-to-Trace Mapping ──────────────────────────────────────────────────

/** Extract target info from a game event. */
function extractTarget(event: GameEvent): { targetId?: string; targetType?: string } {
  const e = event as Record<string, any>;
  if (e.npcId) return { targetId: e.npcId, targetType: 'character' };
  if (e.entityId) return { targetId: e.entityId, targetType: 'character' };
  if (e.itemId) return { targetId: e.itemId, targetType: 'item' };
  if (e.locationId) return { targetId: e.locationId, targetType: 'location' };
  if (e.settlementId) return { targetId: e.settlementId, targetType: 'settlement' };
  if (e.questId) return { targetId: e.questId, targetType: 'quest' };
  if (e.puzzleId) return { targetId: e.puzzleId, targetType: 'puzzle' };
  if (e.objectId) return { targetId: e.objectId, targetType: 'object' };
  if (e.targetId) return { targetId: e.targetId, targetType: e.targetType || 'unknown' };
  return {};
}

/** Extract outcome info from a game event. */
function extractOutcome(event: GameEvent): { outcome?: string; outcomeData?: Record<string, unknown> } {
  const e = event as Record<string, any>;
  if (typeof e.correct === 'boolean') {
    return { outcome: e.correct ? 'success' : 'failure', outcomeData: { correct: e.correct } };
  }
  if (typeof e.passed === 'boolean') {
    return { outcome: e.passed ? 'success' : 'failure', outcomeData: { passed: e.passed, score: e.score } };
  }
  if (typeof e.accepted === 'boolean') {
    return { outcome: e.accepted ? 'accepted' : 'rejected', outcomeData: { accepted: e.accepted } };
  }
  if (typeof e.score === 'number') {
    return { outcome: 'scored', outcomeData: { score: e.score } };
  }
  if (event.type === 'quest_completed' || event.type === 'puzzle_solved' || event.type === 'achievement_unlocked') {
    return { outcome: 'success' };
  }
  if (event.type === 'quest_failed' || event.type === 'puzzle_failed') {
    return { outcome: 'failure' };
  }
  if (event.type === 'quest_abandoned') {
    return { outcome: 'abandoned' };
  }
  return {};
}

/** Build a human-readable action name from event type. */
function eventTypeToActionName(type: GameEventType): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Build actionData from event, stripping the type field. */
function extractActionData(event: GameEvent): Record<string, unknown> {
  const { type: _, ...rest } = event as Record<string, any>;
  return rest;
}

// ── Tracker ─────────────────────────────────────────────────────────────────

export class PlayerActionTracker {
  private config: Required<Pick<PlayerActionTrackerConfig, 'playthroughId' | 'userId' | 'worldId' | 'flushIntervalMs' | 'batchSize'>> & {
    apiBase: string;
    authToken: string | null;
    getTimestep: () => number;
    characterId: string | null;
    getLocationId: () => string | undefined;
  };

  private queue: PendingTrace[] = [];
  private flushTimerId: ReturnType<typeof setInterval> | null = null;
  private unsubscribers: Array<() => void> = [];
  private flushing = false;

  /** Count of traces successfully sent this session. */
  tracesSent = 0;
  /** Count of traces that failed to send. */
  tracesFailed = 0;

  constructor(config: PlayerActionTrackerConfig) {
    this.config = {
      playthroughId: config.playthroughId,
      userId: config.userId,
      worldId: config.worldId,
      apiBase: config.apiBase ?? '',
      authToken: config.authToken ?? null,
      flushIntervalMs: config.flushIntervalMs ?? 30_000,
      batchSize: config.batchSize ?? 100,
      getTimestep: config.getTimestep ?? (() => 0),
      characterId: config.characterId ?? null,
      getLocationId: config.getLocationId ?? (() => undefined),
    };
  }

  /** Subscribe to all game events and start periodic flushing. */
  start(eventBus: GameEventBus): void {
    const unsub = eventBus.onAny((event: GameEvent) => {
      this.recordEvent(event);
    });
    this.unsubscribers.push(unsub);

    this.flushTimerId = setInterval(() => {
      this.flush();
    }, this.config.flushIntervalMs);
  }

  /** Record a single game event as a pending trace. */
  recordEvent(event: GameEvent): void {
    const { targetId, targetType } = extractTarget(event);
    const { outcome, outcomeData } = extractOutcome(event);
    const category = EVENT_RESEARCH_CATEGORY[event.type] ?? 'session';

    const trace: PendingTrace = {
      actionType: event.type,
      actionName: eventTypeToActionName(event.type),
      actionData: {
        ...extractActionData(event),
        researchCategory: category,
      },
      timestep: this.config.getTimestep(),
      characterId: this.config.characterId ?? undefined,
      targetId,
      targetType,
      locationId: this.config.getLocationId(),
      outcome,
      outcomeData,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(trace);

    // Auto-flush if batch is full
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /** Flush pending traces to the server. */
  async flush(): Promise<void> {
    if (this.flushing || this.queue.length === 0) return;

    this.flushing = true;
    const batch = this.queue.splice(0, this.config.batchSize);

    try {
      const response = await fetch(
        `${this.config.apiBase}/api/playthroughs/${this.config.playthroughId}/traces/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.authToken ? { Authorization: `Bearer ${this.config.authToken}` } : {}),
          },
          body: JSON.stringify({ traces: batch }),
        },
      );

      if (!response.ok) {
        // Put traces back at the front of the queue for retry
        this.queue.unshift(...batch);
        this.tracesFailed += batch.length;
      } else {
        this.tracesSent += batch.length;
      }
    } catch {
      // Network error — put traces back for retry
      this.queue.unshift(...batch);
      this.tracesFailed += batch.length;
    } finally {
      this.flushing = false;
    }
  }

  /** Get current queue length. */
  get pendingCount(): number {
    return this.queue.length;
  }

  /** Get a snapshot of queue contents (for testing/debugging). */
  getPendingTraces(): readonly PendingTrace[] {
    return this.queue;
  }

  /** Stop tracking and flush remaining traces. */
  async dispose(): Promise<void> {
    if (this.flushTimerId !== null) {
      clearInterval(this.flushTimerId);
      this.flushTimerId = null;
    }

    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];

    // Final flush
    await this.flush();
  }
}
