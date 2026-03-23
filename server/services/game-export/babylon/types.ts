import type { ExportTelemetryConfig } from '../telemetry-config';

export type AIProviderChoice = 'cloud' | 'local';

export interface BabylonExportOptions {
  mode: 'web' | 'electron';
  worldId?: string;
  authToken?: string;
  telemetry?: ExportTelemetryConfig;
  /** AI provider for the exported game: 'cloud' (Gemini API) or 'local' (bundled llama.cpp + Piper + Whisper) */
  aiProvider?: AIProviderChoice;
  /** When true, run npm install + vite build (+ electron-builder for electron mode) and return the built artifact */
  buildExecutable?: boolean;
  /** API server URL for cloud saves in standalone/Electron mode (e.g., 'http://localhost:8080') */
  apiUrl?: string;
}
