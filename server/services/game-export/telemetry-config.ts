/**
 * Shared telemetry configuration types for the export pipeline.
 *
 * When the user enables telemetry in the export dialog, this config is passed
 * through the route handler to each engine-specific exporter so the generated
 * project includes a pre-configured telemetry client.
 */

export interface ExportTelemetryConfig {
  /** Whether telemetry is enabled for this export */
  enabled: boolean;
  /** The Insimul server URL for telemetry ingestion */
  serverUrl: string;
  /** The resolved API key string (looked up from apiKeyId on the server) */
  apiKey: string;
  /** Batch size for telemetry events (default 25) */
  batchSize?: number;
  /** Flush interval in ms (default 30000) */
  flushIntervalMs?: number;
}

/** Default telemetry batch settings */
export const TELEMETRY_DEFAULTS = {
  batchSize: 25,
  flushIntervalMs: 30_000,
} as const;
