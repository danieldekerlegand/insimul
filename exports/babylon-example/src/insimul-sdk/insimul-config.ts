/**
 * Insimul SDK Configuration — auto-generated during export.
 * Provides server connection details, character-to-NPC mappings, and AI config.
 */

export const INSIMUL_CONFIG = {
  serverUrl: "http://localhost:5000",
  wsUrl: "ws://localhost:50052",
  worldId: "69bfc926b7a6c8040746a5ae",
  apiKey: "",
  aiProvider: "local",
  aiModelBasePath: "",
} as const;

export interface AIConfig {
  apiMode: 'insimul' | 'gemini';
  insimulEndpoint: string;
  geminiModel: string;
  geminiApiKeyPlaceholder: string;
  voiceEnabled: boolean;
  defaultVoice: string;
}

export const AI_CONFIG: AIConfig = {
  "apiMode": "local",
  "insimulEndpoint": "/api/gemini/chat",
  "geminiModel": "gemini-2.5-flash",
  "geminiApiKeyPlaceholder": "YOUR_GEMINI_API_KEY",
  "voiceEnabled": true,
  "defaultVoice": "Kore",
  "localModelPath": "",
  "localModelName": "phi-4-mini-q4"
};

export interface CharacterMapping {
  characterId: string;
  characterName: string;
  npcRole: string;
}

export const CHARACTER_MAPPINGS: CharacterMapping[] = [];

/**
 * Look up an Insimul character ID by game NPC name.
 */
export function getCharacterIdByName(name: string): string | undefined {
  return CHARACTER_MAPPINGS.find(m => m.characterName === name)?.characterId;
}

/**
 * Look up an Insimul character ID by NPC role.
 */
export function getCharacterIdsByRole(role: string): string[] {
  return CHARACTER_MAPPINGS.filter(m => m.npcRole === role).map(m => m.characterId);
}
