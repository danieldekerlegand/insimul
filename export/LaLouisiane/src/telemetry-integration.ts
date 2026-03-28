/**
 * Insimul Telemetry — Babylon.js Integration (auto-generated)
 *
 * Drop this file into your Babylon.js project and call
 * `initTelemetry(engine, scene, eventBus)` after your scene is ready.
 */

import {
  TelemetryClient,
  LocalStorageAdapter,
} from '../shared/telemetry-client';
import type { GameEventBus } from './GameEventBus';
import type { Engine, Scene } from '@babylonjs/core';

// ── Configuration ───────────────────────────────────────────────────────────

const TELEMETRY_ENDPOINT = 'http://localhost:8080';
const TELEMETRY_API_KEY  = '';
const BATCH_SIZE         = 25;
const FLUSH_INTERVAL_MS  = 30000;
const FPS_SAMPLE_INTERVAL_MS = 5_000;

// ── Singleton client ────────────────────────────────────────────────────────

let client: TelemetryClient | null = null;
let fpsTimerId: ReturnType<typeof setInterval> | null = null;
let unsubscribeEventBus: (() => void) | null = null;

// ── Status indicator ─────────────────────────────────────────────────────────

export type TelemetryStatus = 'connected' | 'queued' | 'offline';
let _status: TelemetryStatus = 'offline';

/** Get the current telemetry connection status. */
export function getStatus(): TelemetryStatus {
  return _status;
}

// ── Consent ──────────────────────────────────────────────────────────────────

const CONSENT_KEY = 'insimul_telemetry_consent';

/** Check whether the user has granted telemetry consent (localStorage). */
export function hasConsent(): boolean {
  return localStorage.getItem(CONSENT_KEY) === 'granted';
}

/** Grant telemetry consent. Call from your consent UI. */
export function grantConsent(): void {
  localStorage.setItem(CONSENT_KEY, 'granted');
}

/** Revoke telemetry consent. */
export function revokeConsent(): void {
  localStorage.setItem(CONSENT_KEY, 'revoked');
  _status = 'offline';
}

// ── Language Progress ────────────────────────────────────────────────────────

/** Track language learning progress data. */
export function trackLanguageProgress(progressData: Record<string, unknown>): void {
  client?.track('language_progress', progressData);
}

/**
 * Resolve a player ID from localStorage or generate one.
 */
function getPlayerId(): string {
  const KEY = 'insimul_player_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = 'player_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * Initialise telemetry.  Call once after the Babylon.js scene is ready.
 *
 * @param engine    The Babylon.js Engine instance (used for FPS sampling).
 * @param scene     The active Scene (used to track load time).
 * @param eventBus  The GameEventBus (used to forward gameplay events).
 * @param worldId   The Insimul world ID for this export.
 */
export async function initTelemetry(
  engine: Engine,
  scene: Scene,
  eventBus: GameEventBus,
  worldId: string,
): Promise<void> {
  if (client) return; // already initialised

  // First-launch consent check
  if (!hasConsent()) {
    _status = 'offline';
    return;
  }

  client = new TelemetryClient({
    serverUrl: TELEMETRY_ENDPOINT,
    apiKey: TELEMETRY_API_KEY,
    worldId,
    playerId: getPlayerId(),
    batchSize: BATCH_SIZE,
    flushIntervalMs: FLUSH_INTERVAL_MS,
    storageAdapter: new LocalStorageAdapter('insimul_telemetry_queue'),
  });

  await client.start();
  _status = 'connected';

  // ── Session start ───────────────────────────────────────────────────────
  client.track('session_start', {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio,
  });

  // ── Scene load tracking ─────────────────────────────────────────────────
  const sceneLoadStart = performance.now();
  scene.executeWhenReady(() => {
    const loadDurationMs = Math.round(performance.now() - sceneLoadStart);
    client?.track('scene_loaded', {
      loadDurationMs,
      activeMeshes: scene.meshes.length,
      activeLights: scene.lights.length,
    });
  });

  // ── FPS sampling ────────────────────────────────────────────────────────
  fpsTimerId = setInterval(() => {
    client?.track('fps_sample', {
      fps: Math.round(engine.getFps()),
      activeMeshes: scene.getActiveMeshes().length,
      totalVertices: scene.getTotalVertices(),
    });
  }, FPS_SAMPLE_INTERVAL_MS);

  // ── GameEventBus forwarding ─────────────────────────────────────────────
  unsubscribeEventBus = eventBus.onAny((event) => {
    const { type, ...data } = event;
    client?.track(`game_${type}`, data as Record<string, unknown>);
  });

  // ── Session end (beforeunload) ──────────────────────────────────────────
  window.addEventListener('beforeunload', () => {
    client?.track('session_end', {
      sessionDurationMs: Math.round(performance.now()),
    });
    // Best-effort synchronous flush via sendBeacon
    try {
      const queueSize = client?.getLocalQueueSize() ?? 0;
      if (queueSize > 0) {
        client?.flush();
      }
    } catch {
      // swallow — page is unloading
    }
  });
}

/**
 * Tear down telemetry (e.g. when leaving the game view).
 */
export async function destroyTelemetry(): Promise<void> {
  if (fpsTimerId !== null) {
    clearInterval(fpsTimerId);
    fpsTimerId = null;
  }
  if (unsubscribeEventBus) {
    unsubscribeEventBus();
    unsubscribeEventBus = null;
  }
  if (client) {
    client.track('session_end', {
      sessionDurationMs: Math.round(performance.now()),
    });
    await client.stop();
    client = null;
  }
}
