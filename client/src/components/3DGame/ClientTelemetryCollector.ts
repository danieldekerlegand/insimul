/**
 * Client Telemetry Collector
 *
 * Captures game performance metrics, chat latency, errors, and session
 * boundaries. Feeds events to a TelemetryClient-compatible tracker for
 * batching and server delivery.
 */

import type { GameEventBus, GameEvent } from '@shared/game-engine/logic/GameEventBus';

// ── Interfaces ──────────────────────────────────────────────────────────────

/** Minimal interface matching TelemetryClient.track() */
export interface TelemetryTracker {
  track(eventType: string, data: Record<string, unknown>): void;
}

export interface ClientTelemetryConfig {
  worldId: string;
  playerId: string;
  sessionId: string;
  telemetryClient?: TelemetryTracker;
  /** FPS sample interval in ms (default: 30000) */
  fpsSampleIntervalMs?: number;
  /** Idle threshold in ms (default: 60000) */
  idleThresholdMs?: number;
}

export interface SessionMetrics {
  sessionId: string;
  totalActiveTimeMs: number;
  totalIdleTimeMs: number;
  totalPausedTimeMs: number;
  actionsPerMinute: number;
  eventsCount: number;
  avgFps: number;
  errorCount: number;
  chatInteractions: number;
  avgChatLatencyMs: number;
}

// ── Collector ───────────────────────────────────────────────────────────────

export class ClientTelemetryCollector {
  private config: Required<Pick<ClientTelemetryConfig, 'worldId' | 'playerId' | 'sessionId' | 'fpsSampleIntervalMs' | 'idleThresholdMs'>> & {
    telemetryClient: TelemetryTracker | null;
  };

  // FPS sampling
  private fpsSamplingActive = false;
  private fpsTimerId: ReturnType<typeof setTimeout> | null = null;
  private fpsRafId: number | null = null;
  private fpsSamples: number[] = [];
  private lastFrameTime = 0;
  private frameCount = 0;
  private frameSampleStart = 0;

  // Session timing
  private sessionStartTime: number;
  private activeStartTime: number;
  private totalActiveMs = 0;
  private totalIdleMs = 0;
  private totalPausedMs = 0;
  private pauseStartTime: number | null = null;
  private idleStartTime: number | null = null;
  private isIdle = false;
  private isPaused = false;

  // Idle detection
  private idleTimerId: ReturnType<typeof setTimeout> | null = null;
  private readonly inputEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'] as const;

  // Metrics
  private eventsCount = 0;
  private errorCount = 0;
  private chatLatencies: number[] = [];
  private chatInteractionCount = 0;

  // Chat latency tracking (npc_talked start times)
  private pendingChatTimestamps = new Map<string, number>();

  // Cleanup
  private unsubscribers: Array<() => void> = [];
  private boundHandlers: {
    visibility: () => void;
    beforeUnload: () => void;
    error: (e: ErrorEvent) => void;
    unhandledRejection: (e: PromiseRejectionEvent) => void;
    input: () => void;
  };

  constructor(config: ClientTelemetryConfig) {
    this.config = {
      worldId: config.worldId,
      playerId: config.playerId,
      sessionId: config.sessionId,
      telemetryClient: config.telemetryClient ?? null,
      fpsSampleIntervalMs: config.fpsSampleIntervalMs ?? 30_000,
      idleThresholdMs: config.idleThresholdMs ?? 60_000,
    };

    const now = performance.now();
    this.sessionStartTime = now;
    this.activeStartTime = now;

    // Bind handlers so they can be removed later
    this.boundHandlers = {
      visibility: this.handleVisibilityChange.bind(this),
      beforeUnload: this.handleBeforeUnload.bind(this),
      error: this.handleGlobalError.bind(this),
      unhandledRejection: this.handleUnhandledRejection.bind(this),
      input: this.handleUserInput.bind(this),
    };

    this.setupSessionBoundary();
    this.setupErrorHandlers();
    this.setupIdleDetection();

    this.track('session_start', {});
  }

  // ── FPS Sampling ────────────────────────────────────────────────────────

  startFPSSampling(): void {
    if (this.fpsSamplingActive) return;
    this.fpsSamplingActive = true;
    this.scheduleFPSSample();
  }

  stopFPSSampling(): void {
    this.fpsSamplingActive = false;
    if (this.fpsTimerId !== null) {
      clearTimeout(this.fpsTimerId);
      this.fpsTimerId = null;
    }
    if (this.fpsRafId !== null) {
      cancelAnimationFrame(this.fpsRafId);
      this.fpsRafId = null;
    }
  }

  private scheduleFPSSample(): void {
    if (!this.fpsSamplingActive) return;

    this.fpsTimerId = setTimeout(() => {
      this.measureFPS();
    }, this.config.fpsSampleIntervalMs);
  }

  private measureFPS(): void {
    if (!this.fpsSamplingActive) return;

    this.frameCount = 0;
    this.frameSampleStart = performance.now();
    this.lastFrameTime = this.frameSampleStart;

    // Count frames over 1 second
    const countFrame = (timestamp: number) => {
      this.frameCount++;
      if (timestamp - this.frameSampleStart < 1000) {
        this.fpsRafId = requestAnimationFrame(countFrame);
      } else {
        const elapsed = (timestamp - this.frameSampleStart) / 1000;
        const fps = Math.round(this.frameCount / elapsed);
        this.fpsSamples.push(fps);
        this.track('fps_sample', { fps });
        this.scheduleFPSSample();
      }
    };

    this.fpsRafId = requestAnimationFrame(countFrame);
  }

  // ── Chat Latency ───────────────────────────────────────────────────────

  recordChatLatency(startTime: number, endTime: number, npcId: string): void {
    const latencyMs = endTime - startTime;
    this.chatLatencies.push(latencyMs);
    this.chatInteractionCount++;
    this.track('chat_latency', { latencyMs, npcId });
  }

  // ── Error Logging ─────────────────────────────────────────────────────

  recordError(error: Error, context?: Record<string, unknown>): void {
    this.errorCount++;
    this.track('client_error', {
      message: error.message,
      name: error.name,
      stack: error.stack?.slice(0, 500) ?? '',
      ...context,
    });
  }

  // ── Session Metrics ───────────────────────────────────────────────────

  getSessionMetrics(): SessionMetrics {
    // Flush any in-progress active period
    const now = performance.now();
    let currentActiveMs = this.totalActiveMs;
    let currentIdleMs = this.totalIdleMs;
    let currentPausedMs = this.totalPausedMs;

    if (this.isPaused && this.pauseStartTime !== null) {
      currentPausedMs += now - this.pauseStartTime;
    } else if (this.isIdle && this.idleStartTime !== null) {
      currentIdleMs += now - this.idleStartTime;
      currentActiveMs += this.idleStartTime - this.activeStartTime;
    } else {
      currentActiveMs += now - this.activeStartTime;
    }

    const totalMinutes = currentActiveMs / 60_000;
    const avgFps = this.fpsSamples.length > 0
      ? Math.round(this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length)
      : 0;
    const avgChatLatencyMs = this.chatLatencies.length > 0
      ? Math.round(this.chatLatencies.reduce((a, b) => a + b, 0) / this.chatLatencies.length)
      : 0;

    return {
      sessionId: this.config.sessionId,
      totalActiveTimeMs: Math.round(currentActiveMs),
      totalIdleTimeMs: Math.round(currentIdleMs),
      totalPausedTimeMs: Math.round(currentPausedMs),
      actionsPerMinute: totalMinutes > 0 ? Math.round((this.eventsCount / totalMinutes) * 100) / 100 : 0,
      eventsCount: this.eventsCount,
      avgFps,
      errorCount: this.errorCount,
      chatInteractions: this.chatInteractionCount,
      avgChatLatencyMs,
    };
  }

  // ── Event Bus Integration ─────────────────────────────────────────────

  subscribeToEventBus(eventBus: GameEventBus): void {
    // Track all events for metrics counting
    const unsubAll = eventBus.onAny((event: GameEvent) => {
      this.eventsCount++;
      this.resetIdleTimer();
    });
    this.unsubscribers.push(unsubAll);

    // Track chat interactions for latency via conversation_turn events
    const unsubChat = eventBus.on('npc_talked', (event) => {
      // Record that a chat interaction happened; latency is tracked
      // externally via recordChatLatency() since we need the start timestamp
      // from the UI layer.
      this.chatInteractionCount++;
      this.track('npc_chat_event', {
        npcId: event.npcId,
        npcName: event.npcName,
        turnCount: event.turnCount,
      });
    });
    this.unsubscribers.push(unsubChat);

    // Track quest lifecycle
    const unsubQuestAccept = eventBus.on('quest_accepted', (event) => {
      this.track('quest_accepted', { questId: event.questId, questTitle: event.questTitle });
    });
    this.unsubscribers.push(unsubQuestAccept);

    const unsubQuestComplete = eventBus.on('quest_completed', (event) => {
      this.track('quest_completed', { questId: event.questId });
    });
    this.unsubscribers.push(unsubQuestComplete);

    // Track errors from puzzle failures
    const unsubPuzzleFail = eventBus.on('puzzle_failed', (event) => {
      this.track('puzzle_failed', {
        puzzleId: event.puzzleId,
        puzzleType: event.puzzleType,
        attempts: event.attempts,
      });
    });
    this.unsubscribers.push(unsubPuzzleFail);
  }

  // ── Cleanup ───────────────────────────────────────────────────────────

  dispose(): void {
    this.stopFPSSampling();
    this.teardownIdleDetection();

    // Remove session boundary listeners
    document.removeEventListener('visibilitychange', this.boundHandlers.visibility);
    window.removeEventListener('beforeunload', this.boundHandlers.beforeUnload);
    window.removeEventListener('error', this.boundHandlers.error);
    window.removeEventListener('unhandledrejection', this.boundHandlers.unhandledRejection);

    // Unsubscribe from event bus
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];

    // Final metrics report
    this.track('session_end', this.getSessionMetrics() as unknown as Record<string, unknown>);
  }

  // ── Private: Session Boundary ─────────────────────────────────────────

  private setupSessionBoundary(): void {
    document.addEventListener('visibilitychange', this.boundHandlers.visibility);
    window.addEventListener('beforeunload', this.boundHandlers.beforeUnload);
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      this.pauseSession();
    } else {
      this.resumeSession();
    }
  }

  private handleBeforeUnload(): void {
    this.track('session_end', this.getSessionMetrics() as unknown as Record<string, unknown>);
  }

  private pauseSession(): void {
    if (this.isPaused) return;
    const now = performance.now();
    this.isPaused = true;

    // Accumulate active time up to now
    if (this.isIdle && this.idleStartTime !== null) {
      this.totalIdleMs += now - this.idleStartTime;
      this.totalActiveMs += this.idleStartTime - this.activeStartTime;
      this.isIdle = false;
      this.idleStartTime = null;
    } else {
      this.totalActiveMs += now - this.activeStartTime;
    }

    this.pauseStartTime = now;
    this.teardownIdleDetection();
    this.track('session_paused', {});
  }

  private resumeSession(): void {
    if (!this.isPaused) return;
    const now = performance.now();

    if (this.pauseStartTime !== null) {
      this.totalPausedMs += now - this.pauseStartTime;
    }

    this.isPaused = false;
    this.pauseStartTime = null;
    this.activeStartTime = now;
    this.setupIdleDetection();
    this.track('session_resumed', {});
  }

  // ── Private: Error Handlers ───────────────────────────────────────────

  private setupErrorHandlers(): void {
    window.addEventListener('error', this.boundHandlers.error);
    window.addEventListener('unhandledrejection', this.boundHandlers.unhandledRejection);
  }

  private handleGlobalError(event: ErrorEvent): void {
    const error = event.error instanceof Error
      ? event.error
      : new Error(event.message || 'Unknown error');
    this.recordError(error, {
      source: 'global_error_handler',
      filename: event.filename ?? '',
      lineno: event.lineno ?? 0,
      colno: event.colno ?? 0,
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const reason = event.reason;
    const error = reason instanceof Error
      ? reason
      : new Error(typeof reason === 'string' ? reason : 'Unhandled promise rejection');
    this.recordError(error, { source: 'unhandled_rejection' });
  }

  // ── Private: Idle Detection ───────────────────────────────────────────

  private setupIdleDetection(): void {
    for (const eventName of this.inputEvents) {
      document.addEventListener(eventName, this.boundHandlers.input, { passive: true });
    }
    this.resetIdleTimer();
  }

  private teardownIdleDetection(): void {
    for (const eventName of this.inputEvents) {
      document.removeEventListener(eventName, this.boundHandlers.input);
    }
    if (this.idleTimerId !== null) {
      clearTimeout(this.idleTimerId);
      this.idleTimerId = null;
    }
  }

  private handleUserInput(): void {
    if (this.isIdle) {
      this.exitIdle();
    }
    this.resetIdleTimer();
  }

  private resetIdleTimer(): void {
    if (this.idleTimerId !== null) {
      clearTimeout(this.idleTimerId);
    }
    this.idleTimerId = setTimeout(() => {
      this.enterIdle();
    }, this.config.idleThresholdMs);
  }

  private enterIdle(): void {
    if (this.isIdle || this.isPaused) return;
    const now = performance.now();
    this.isIdle = true;
    this.totalActiveMs += now - this.activeStartTime;
    this.idleStartTime = now;
    this.track('session_idle_start', {});
  }

  private exitIdle(): void {
    if (!this.isIdle) return;
    const now = performance.now();
    this.isIdle = false;
    if (this.idleStartTime !== null) {
      this.totalIdleMs += now - this.idleStartTime;
    }
    this.idleStartTime = null;
    this.activeStartTime = now;
    this.track('session_idle_end', {});
  }

  // ── Private: Tracking Helper ──────────────────────────────────────────

  private track(eventType: string, data: Record<string, unknown>): void {
    this.config.telemetryClient?.track(eventType, {
      worldId: this.config.worldId,
      playerId: this.config.playerId,
      sessionId: this.config.sessionId,
      ...data,
    });
  }
}
