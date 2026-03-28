/**
 * Insimul SDK Configuration — auto-generated during export.
 * Provides server connection details, character-to-NPC mappings, and AI config.
 */

export const INSIMUL_CONFIG = {
  serverUrl: "http://localhost:5000",
  wsUrl: "ws://localhost:50052",
  worldId: "69c7ef7854de6edea916a60d",
  apiKey: "",
  aiProvider: "insimul",
  aiModelBasePath: "",
} as const;

export interface AIConfig {
  apiMode: 'insimul' | 'gemini' | 'local';
  insimulEndpoint: string;
  geminiModel: string;
  geminiApiKeyPlaceholder: string;
  voiceEnabled: boolean;
  defaultVoice: string;
  localModelPath?: string;
  localModelName?: string;
}

export const AI_CONFIG: AIConfig = {
  "apiMode": "insimul",
  "insimulEndpoint": "/api/gemini/chat",
  "geminiModel": "gemini-3.1-flash",
  "geminiApiKeyPlaceholder": "YOUR_GEMINI_API_KEY",
  "voiceEnabled": true,
  "defaultVoice": "Kore"
};

export interface CharacterMapping {
  characterId: string;
  characterName: string;
  npcRole: string;
}

export const CHARACTER_MAPPINGS: CharacterMapping[] = [
  {
    "characterId": "69c7efe254de6edea916a6cd",
    "characterName": "Élodie Boudreaux",
    "npcRole": "questgiver"
  },
  {
    "characterId": "69c7efe254de6edea916a6cf",
    "characterName": "Geneviève Thibodeaux",
    "npcRole": "questgiver"
  },
  {
    "characterId": "69c7efe254de6edea916a6d1",
    "characterName": "Jean-Baptiste Broussard",
    "npcRole": "civilian"
  },
  {
    "characterId": "69c7efe254de6edea916a6d3",
    "characterName": "Émile Thibodeaux",
    "npcRole": "questgiver"
  },
  {
    "characterId": "69c7efe254de6edea916a6d5",
    "characterName": "Amélie Landry",
    "npcRole": "questgiver"
  },
  {
    "characterId": "69c7efe254de6edea916a6d7",
    "characterName": "Céline LeBlanc",
    "npcRole": "civilian"
  },
  {
    "characterId": "69c7efe254de6edea916a6d9",
    "characterName": "Louis Fontenot",
    "npcRole": "civilian"
  },
  {
    "characterId": "69c7efe254de6edea916a6db",
    "characterName": "Antoine Hébert",
    "npcRole": "civilian"
  }
];

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
