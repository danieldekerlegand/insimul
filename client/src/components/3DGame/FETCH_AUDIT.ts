/**
 * FETCH API AUDIT — 3DGame Code
 *
 * Catalog of all direct fetch('/api/...') calls in the 3DGame codebase.
 * These are calls that bypass the DataSource abstraction layer and talk
 * directly to the server API, making the code non-portable to exported
 * (Godot/Unity/Unreal) targets.
 *
 * Generated: 2026-03-23
 *
 * Legend:
 *   - "DataSource" calls go through the DataSource interface (already abstracted)
 *   - "Direct" calls use fetch() inline and need migration to DataSource
 */

// ─────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────
//
// Files with direct fetch calls:  14
// Total direct fetch call sites:  51
// DataSource.ts fetch calls:      38  (already abstracted)
// ConversationClient.ts calls:     4  (already abstracted behind its own client)
//
// ─────────────────────────────────────────────────────────────────────

/**
 * Each entry represents a single direct fetch() call site that bypasses
 * the DataSource abstraction.
 */
export interface FetchCallSite {
  /** Source file (relative to client/src/components/3DGame/) */
  file: string;
  /** Line number of the fetch call */
  line: number;
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** API endpoint pattern (with path params as :param) */
  endpoint: string;
  /** Functional category */
  category: FetchCategory;
  /** Brief description of what this call does */
  description: string;
}

export type FetchCategory =
  | 'chat'           // Gemini chat, conversation, NPC dialogue
  | 'tts'            // Text-to-speech
  | 'stt'            // Speech-to-text
  | 'assessment'     // Exams, scoring, assessment content
  | 'quest'          // Quest CRUD, completion, guidance
  | 'playthrough'    // Playthrough state management
  | 'world'          // World data, languages
  | 'asset'          // Asset/texture loading
  | 'auth'           // Authentication
  | 'conversation'   // Conversation metadata, translation
  | 'pronunciation'  // Pronunciation scoring
  | 'xp'             // XP/gamification
  | 'reputation'     // Reputation system
  | 'reading'        // Reading progress
  | 'onboarding'     // Onboarding/language profile
  | 'grammar';       // Grammar analysis

/**
 * Complete catalog of all direct fetch() calls in 3DGame code
 * that bypass the DataSource abstraction.
 */
export const DIRECT_FETCH_CALLS: FetchCallSite[] = [
  // ── BabylonGame.ts ──────────────────────────────────────────────
  {
    file: 'BabylonGame.ts',
    line: 923,
    method: 'GET',
    endpoint: '/api/auth/verify',
    category: 'auth',
    description: 'Verify auth token on game init',
  },
  {
    file: 'BabylonGame.ts',
    line: 1065,
    method: 'POST',
    endpoint: '/api/auth/login',
    category: 'auth',
    description: 'Login with username/password from in-game prompt',
  },
  {
    file: 'BabylonGame.ts',
    line: 1263,
    method: 'PATCH',
    endpoint: '/api/playthroughs/:playthroughId',
    category: 'playthrough',
    description: 'Auto-save playthrough state',
  },
  {
    file: 'BabylonGame.ts',
    line: 1286,
    method: 'PATCH',
    endpoint: '/api/playthroughs/:playthroughId',
    category: 'playthrough',
    description: 'Save playthrough state (explicit save)',
  },
  {
    file: 'BabylonGame.ts',
    line: 1327,
    method: 'PATCH',
    endpoint: '/api/playthroughs/:playthroughId',
    category: 'playthrough',
    description: 'Final save on game shutdown',
  },
  {
    file: 'BabylonGame.ts',
    line: 2802,
    method: 'POST',
    endpoint: '/api/worlds/:worldId/main-quest/:playerId/try-unlock',
    category: 'quest',
    description: 'Try to unlock next main quest stage',
  },
  {
    file: 'BabylonGame.ts',
    line: 3039,
    method: 'POST',
    endpoint: '/api/worlds/:worldId/npc-npc-conversation',
    category: 'chat',
    description: 'Generate NPC-to-NPC ambient conversation',
  },
  {
    file: 'BabylonGame.ts',
    line: 10097,
    method: 'POST',
    endpoint: '/api/conversations/simulate-rich',
    category: 'chat',
    description: 'Simulate rich NPC conversation with audio',
  },
  {
    file: 'BabylonGame.ts',
    line: 10139,
    method: 'POST',
    endpoint: '/api/tts',
    category: 'tts',
    description: 'TTS for simulated conversation lines',
  },
  {
    file: 'BabylonGame.ts',
    line: 10249,
    method: 'GET',
    endpoint: '/api/worlds/:worldId/quests/npc-guidance/:npcId',
    category: 'quest',
    description: 'Get NPC quest guidance hints',
  },
  {
    file: 'BabylonGame.ts',
    line: 10960,
    method: 'GET',
    endpoint: '/api/worlds/:worldId/main-quest/:playerId',
    category: 'quest',
    description: 'Load main quest progress',
  },
  {
    file: 'BabylonGame.ts',
    line: 10984,
    method: 'GET',
    endpoint: '/api/worlds/:worldId/portfolio/:playerName',
    category: 'quest',
    description: 'Load player portfolio',
  },
  {
    file: 'BabylonGame.ts',
    line: 10999,
    method: 'POST',
    endpoint: '/api/worlds/:worldId/main-quest/:playerId/record-completion',
    category: 'quest',
    description: 'Record main quest completion',
  },
  {
    file: 'BabylonGame.ts',
    line: 13071,
    method: 'GET',
    endpoint: '/api/assets/:id',
    category: 'asset',
    description: 'Load individual asset by ID',
  },
  {
    file: 'BabylonGame.ts',
    line: 13276,
    method: 'POST',
    endpoint: '/api/reading-progress/sync',
    category: 'reading',
    description: 'Sync reading progress to server',
  },

  // ── BabylonChatPanel.ts ─────────────────────────────────────────
  {
    file: 'BabylonChatPanel.ts',
    line: 351,
    method: 'GET',
    endpoint: '/api/worlds/:worldId',
    category: 'world',
    description: 'Load world data for chat context',
  },
  {
    file: 'BabylonChatPanel.ts',
    line: 352,
    method: 'GET',
    endpoint: '/api/worlds/:worldId/languages',
    category: 'world',
    description: 'Load world languages for chat context',
  },
  {
    file: 'BabylonChatPanel.ts',
    line: 1603,
    method: 'POST',
    endpoint: '/api/conversation/metadata',
    category: 'conversation',
    description: 'Save conversation metadata (fire-and-forget)',
  },
  {
    file: 'BabylonChatPanel.ts',
    line: 1747,
    method: 'POST',
    endpoint: '/api/gemini/chat',
    category: 'chat',
    description: 'Send chat message to Gemini (primary chat)',
  },
  {
    file: 'BabylonChatPanel.ts',
    line: 1916,
    method: 'POST',
    endpoint: '/api/gemini/chat',
    category: 'chat',
    description: 'Send chat message to Gemini (structured response)',
  },
  {
    file: 'BabylonChatPanel.ts',
    line: 1998,
    method: 'POST',
    endpoint: '/api/gemini/chat',
    category: 'chat',
    description: 'Send chat message to Gemini (continuation)',
  },
  {
    file: 'BabylonChatPanel.ts',
    line: 2041,
    method: 'POST',
    endpoint: '/api/gemini/chat',
    category: 'chat',
    description: 'Send chat message to Gemini (follow-up)',
  },
  {
    file: 'BabylonChatPanel.ts',
    line: 2149,
    method: 'POST',
    endpoint: '/api/gemini/grammar-analysis',
    category: 'grammar',
    description: 'Analyze grammar of player message',
  },
  {
    file: 'BabylonChatPanel.ts',
    line: 2224,
    method: 'POST',
    endpoint: '/api/tts',
    category: 'tts',
    description: 'TTS for NPC chat response',
  },
  {
    file: 'BabylonChatPanel.ts',
    line: 2581,
    method: 'POST',
    endpoint: '/api/stt',
    category: 'stt',
    description: 'Speech-to-text for voice input',
  },
  {
    file: 'BabylonChatPanel.ts',
    line: 2729,
    method: 'POST',
    endpoint: '/api/stt',
    category: 'stt',
    description: 'Speech-to-text for voice input (alternative path)',
  },
  {
    file: 'BabylonChatPanel.ts',
    line: 3266,
    method: 'GET',
    endpoint: '/api/worlds/:worldId/quests',
    category: 'quest',
    description: 'Load quests for conversation quest tracking',
  },
  {
    file: 'BabylonChatPanel.ts',
    line: 3504,
    method: 'POST',
    endpoint: '/api/worlds/:worldId/quests',
    category: 'quest',
    description: 'Create quest from conversation',
  },

  // ── VRChatPanel.ts ──────────────────────────────────────────────
  {
    file: 'VRChatPanel.ts',
    line: 519,
    method: 'POST',
    endpoint: '/api/chat',
    category: 'chat',
    description: 'Send VR chat message',
  },
  {
    file: 'VRChatPanel.ts',
    line: 561,
    method: 'POST',
    endpoint: '/api/tts',
    category: 'tts',
    description: 'TTS for VR chat response',
  },

  // ── NpcExamEngine.ts ────────────────────────────────────────────
  {
    file: 'NpcExamEngine.ts',
    line: 338,
    method: 'POST',
    endpoint: '/api/pronunciation/score',
    category: 'pronunciation',
    description: 'Score pronunciation during NPC exam',
  },
  {
    file: 'NpcExamEngine.ts',
    line: 370,
    method: 'POST',
    endpoint: '/api/assessments',
    category: 'assessment',
    description: 'Create assessment session',
  },
  {
    file: 'NpcExamEngine.ts',
    line: 393,
    method: 'POST',
    endpoint: '/api/assessments/:sessionId/phases/:phaseId',
    category: 'assessment',
    description: 'Record exam phase result',
  },
  {
    file: 'NpcExamEngine.ts',
    line: 403,
    method: 'POST',
    endpoint: '/api/assessments/:sessionId/complete',
    category: 'assessment',
    description: 'Complete assessment session',
  },

  // ── NpcListeningExamController.ts ───────────────────────────────
  {
    file: 'NpcListeningExamController.ts',
    line: 318,
    method: 'POST',
    endpoint: '/api/assessments/generate-content',
    category: 'assessment',
    description: 'Generate listening exam content',
  },
  {
    file: 'NpcListeningExamController.ts',
    line: 343,
    method: 'POST',
    endpoint: '/api/assessments/tts',
    category: 'assessment',
    description: 'TTS for listening exam audio',
  },
  {
    file: 'NpcListeningExamController.ts',
    line: 448,
    method: 'POST',
    endpoint: '/api/assessments/score-phase',
    category: 'assessment',
    description: 'Score listening exam phase',
  },

  // ── AssessmentEngine.ts ─────────────────────────────────────────
  {
    file: 'AssessmentEngine.ts',
    line: 297,
    method: 'POST',
    endpoint: '/api/assessments/generate-content',
    category: 'assessment',
    description: 'Generate assessment content',
  },
  {
    file: 'AssessmentEngine.ts',
    line: 319,
    method: 'POST',
    endpoint: '/api/assessments/tts',
    category: 'assessment',
    description: 'TTS for assessment audio',
  },
  {
    file: 'AssessmentEngine.ts',
    line: 387,
    method: 'POST',
    endpoint: '/api/assessments/score-phase',
    category: 'assessment',
    description: 'Score assessment phase',
  },

  // ── TextureManager.ts ───────────────────────────────────────────
  {
    file: 'TextureManager.ts',
    line: 73,
    method: 'GET',
    endpoint: '/api/worlds/:worldId/assets?assetType=texture_*',
    category: 'asset',
    description: 'Load ground/wall/material texture assets',
  },
  {
    file: 'TextureManager.ts',
    line: 96,
    method: 'GET',
    endpoint: '/api/worlds/:worldId/assets?assetType=texture_:type',
    category: 'asset',
    description: 'Load texture assets by type',
  },
  {
    file: 'TextureManager.ts',
    line: 198,
    method: 'GET',
    endpoint: '/api/assets/:assetId',
    category: 'asset',
    description: 'Load individual texture asset',
  },

  // ── BabylonQuestTracker.ts ──────────────────────────────────────
  {
    file: 'BabylonQuestTracker.ts',
    line: 605,
    method: 'GET',
    endpoint: '/api/worlds/:worldId/quests',
    category: 'quest',
    description: 'Refresh quests for quest tracker',
  },

  // ── QuestCompletionManager.ts ───────────────────────────────────
  {
    file: 'QuestCompletionManager.ts',
    line: 143,
    method: 'POST',
    endpoint: '/api/worlds/:worldId/quests/:questId/complete',
    category: 'quest',
    description: 'Mark quest as completed',
  },

  // ── HoverTranslationSystem.ts ───────────────────────────────────
  {
    file: 'HoverTranslationSystem.ts',
    line: 154,
    method: 'POST',
    endpoint: '/api/conversation/translate-word',
    category: 'conversation',
    description: 'Translate hovered word',
  },

  // ── LanguageGamificationTracker.ts ──────────────────────────────
  {
    file: 'LanguageGamificationTracker.ts',
    line: 645,
    method: 'POST',
    endpoint: '/api/xp/experiences/update',
    category: 'xp',
    description: 'Sync XP/experience updates to server',
  },

  // ── ReputationManager.ts ────────────────────────────────────────
  {
    file: 'ReputationManager.ts',
    line: 93,
    method: 'POST',
    endpoint: '/api/playthroughs/:playthroughId/reputations',
    category: 'reputation',
    description: 'Sync reputation data',
  },

  // ── ListeningComprehensionManager.ts ────────────────────────────
  {
    file: 'ListeningComprehensionManager.ts',
    line: 236,
    method: 'POST',
    endpoint: '/api/gemini/comprehension-evaluation',
    category: 'chat',
    description: 'Evaluate listening comprehension answer',
  },

  // ── OnboardingLauncher.ts ───────────────────────────────────────
  {
    file: 'OnboardingLauncher.ts',
    line: 348,
    method: 'POST',
    endpoint: '/api/worlds/:worldId/quests',
    category: 'onboarding',
    description: 'Create onboarding quest',
  },
  {
    file: 'OnboardingLauncher.ts',
    line: 394,
    method: 'PUT',
    endpoint: '/api/worlds/:worldId/players/:playerId/language-profile',
    category: 'onboarding',
    description: 'Save player language profile after onboarding',
  },
];

// ─────────────────────────────────────────────────────────────────────
// STATISTICS BY CATEGORY
// ─────────────────────────────────────────────────────────────────────
//
//  chat:            7 calls (BabylonChatPanel×5, BabylonGame×1, VRChatPanel×1, ListeningComprehensionManager×1)
//  quest:           8 calls (BabylonGame×4, BabylonChatPanel×2, BabylonQuestTracker×1, QuestCompletionManager×1)
//  assessment:      7 calls (NpcExamEngine×3, NpcListeningExamController×3, AssessmentEngine×3) — note overlap
//  tts:             3 calls (BabylonGame×1, BabylonChatPanel×1, VRChatPanel×1)
//  stt:             2 calls (BabylonChatPanel×2)
//  playthrough:     3 calls (BabylonGame×3)
//  asset:           4 calls (BabylonGame×1, TextureManager×3)
//  auth:            2 calls (BabylonGame×2)
//  world:           2 calls (BabylonChatPanel×2)
//  conversation:    2 calls (BabylonChatPanel×1, HoverTranslationSystem×1)
//  pronunciation:   1 call  (NpcExamEngine×1)
//  xp:              1 call  (LanguageGamificationTracker×1)
//  reputation:      1 call  (ReputationManager×1)
//  reading:         1 call  (BabylonGame×1)
//  grammar:         1 call  (BabylonChatPanel×1)
//  onboarding:      2 calls (OnboardingLauncher×2)
//
// ─────────────────────────────────────────────────────────────────────
// STATISTICS BY FILE
// ─────────────────────────────────────────────────────────────────────
//
//  BabylonGame.ts:                    15 direct fetch calls
//  BabylonChatPanel.ts:               14 direct fetch calls
//  AssessmentEngine.ts:                3 direct fetch calls
//  NpcExamEngine.ts:                   4 direct fetch calls
//  NpcListeningExamController.ts:      3 direct fetch calls
//  TextureManager.ts:                  3 direct fetch calls
//  VRChatPanel.ts:                     2 direct fetch calls
//  OnboardingLauncher.ts:              2 direct fetch calls
//  BabylonQuestTracker.ts:             1 direct fetch call
//  QuestCompletionManager.ts:          1 direct fetch call
//  HoverTranslationSystem.ts:          1 direct fetch call
//  LanguageGamificationTracker.ts:     1 direct fetch call
//  ReputationManager.ts:               1 direct fetch call
//  ListeningComprehensionManager.ts:   1 direct fetch call
//
// ─────────────────────────────────────────────────────────────────────
// ALREADY ABSTRACTED (for reference)
// ─────────────────────────────────────────────────────────────────────
//
//  DataSource.ts:          38 fetch calls (behind DataSource interface)
//  ConversationClient.ts:   4 fetch calls (behind ConversationClient class)
//
// ─────────────────────────────────────────────────────────────────────
// UNIQUE API ENDPOINTS HIT BY DIRECT CALLS (26 unique patterns)
// ─────────────────────────────────────────────────────────────────────
//
//  GET  /api/auth/verify
//  POST /api/auth/login
//  PATCH /api/playthroughs/:id
//  POST /api/playthroughs/:id/reputations
//  GET  /api/worlds/:id
//  GET  /api/worlds/:id/languages
//  GET  /api/worlds/:id/quests
//  POST /api/worlds/:id/quests
//  POST /api/worlds/:id/quests/:questId/complete
//  GET  /api/worlds/:id/quests/npc-guidance/:npcId
//  GET  /api/worlds/:id/main-quest/:playerId
//  POST /api/worlds/:id/main-quest/:playerId/try-unlock
//  POST /api/worlds/:id/main-quest/:playerId/record-completion
//  GET  /api/worlds/:id/portfolio/:playerName
//  POST /api/worlds/:id/npc-npc-conversation
//  GET  /api/worlds/:id/assets?assetType=...
//  PUT  /api/worlds/:id/players/:playerId/language-profile
//  GET  /api/assets/:id
//  POST /api/gemini/chat
//  POST /api/gemini/grammar-analysis
//  POST /api/gemini/comprehension-evaluation
//  POST /api/chat
//  POST /api/tts
//  POST /api/stt
//  POST /api/conversation/metadata
//  POST /api/conversation/translate-word
//  POST /api/conversations/simulate-rich
//  POST /api/pronunciation/score
//  POST /api/assessments
//  POST /api/assessments/generate-content
//  POST /api/assessments/tts
//  POST /api/assessments/score-phase
//  POST /api/assessments/:sessionId/phases/:phaseId
//  POST /api/assessments/:sessionId/complete
//  POST /api/xp/experiences/update
//  POST /api/reading-progress/sync
//
