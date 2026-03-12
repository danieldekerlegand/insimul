import type { ExportTelemetryConfig } from '../telemetry-config';

export interface BabylonExportOptions {
  mode: 'web' | 'electron';
  worldId?: string;
  authToken?: string;
  telemetry?: ExportTelemetryConfig;
}
