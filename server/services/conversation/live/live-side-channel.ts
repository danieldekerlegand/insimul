/**
 * Live Side-Channel — Parallel Language Analysis
 *
 * Runs language learning analysis tasks in parallel after each Live session turn,
 * decoupled from the audio pipeline so side-effects never block audio delivery.
 *
 * Three concurrent tasks (all fire-and-forget):
 *   1. Metadata extraction (Gemini Flash) — vocab hints + grammar feedback + eval
 *   2. Quest goal evaluation (Gemini Flash) — evaluate active objectives
 *   3. Language progress tracking (local, no LLM) — quest trigger analysis
 */

import { getGenAI, GEMINI_MODELS } from '../../../config/gemini.js';
import { buildMetadataExtractionPrompt } from '../../../../shared/language/utils.js';
import { analyzeConversation } from '../quest-trigger-analyzer.js';
import type { ActiveQuest } from '../quest-trigger-analyzer.js';

// ── Types ─────────────────────────────────────────────────────────────

export interface SideChannelContext {
  /** Target language for the conversation (e.g. 'French') */
  targetLanguage: string;
  /** Player's CEFR proficiency level */
  playerProficiency?: string;
  /** Active quests with objectives to evaluate */
  activeQuests?: ActiveQuest[];
  /** Active objectives for LLM-based goal evaluation */
  activeObjectives?: Array<{
    questId: string;
    objectiveId: string;
    objectiveType: string;
    description: string;
    npcId?: string;
  }>;
  /** NPC character ID for quest trigger analysis */
  npcCharacterId?: string;
  /** NPC name for display */
  npcName?: string;
  /** Number of conversation turns so far */
  conversationTurnCount: number;
}

export interface SideChannelCallbacks {
  /** Vocabulary hints extracted from the exchange */
  onVocabHints?: (hints: Array<{ word: string; translation: string; context: string }>) => void;
  /** Grammar feedback on the player's message */
  onGrammarFeedback?: (feedback: { status: string; errors: Array<{ pattern: string; incorrect: string; corrected: string; explanation: string }> }) => void;
  /** Eval scores for the exchange */
  onEval?: (scores: Record<string, number>) => void;
  /** Quest progress triggers detected locally */
  onQuestProgress?: (triggers: Array<{ questId: string; objectiveId: string; objectiveType: string; trigger: string; incrementBy: number; newCount: number; requiredCount: number; completed: boolean }>, markerContent: string) => void;
  /** LLM-based goal evaluation results */
  onGoalEvaluation?: (evaluations: Array<{ objectiveId: string; questId: string; goalMet: boolean; confidence: number; extractedInfo: string }>) => void;
}

// ── Goal evaluation prompt (mirrors http-bridge) ──────────────────────

function buildConversationGoalPrompt(
  playerMessage: string,
  npcResponse: string,
  objectives: Array<{ questId: string; objectiveId: string; objectiveType: string; description: string; npcId?: string }>,
): string {
  const objectiveList = objectives.map((obj, i) =>
    `${i + 1}. [${obj.objectiveId}] (${obj.objectiveType}): "${obj.description}"`
  ).join('\n');

  return `You are evaluating whether a player's conversation exchange accomplished any quest objectives in a language learning RPG.

PLAYER SAID: "${playerMessage}"
NPC RESPONDED: "${npcResponse}"

ACTIVE QUEST OBJECTIVES TO EVALUATE:
${objectiveList}

For EACH objective, determine if the conversation exchange meaningfully progressed or completed it.
- "talk_to_npc" objectives: Met if the player had a substantive exchange (not just "hi").
- "conversation" objectives: Met if the player engaged with the topic described in the objective.
- "complete_conversation" objectives: Met if the player's exchange fulfilled the described goal.
- "use_vocabulary" objectives: Met if the player used relevant vocabulary in their message.

Return ONLY a JSON array. For each objective, include:
- "objectiveId": the objective ID
- "questId": the quest ID
- "goalMet": true/false
- "confidence": 0.0-1.0 (how confident you are)
- "extractedInfo": brief description of what the player achieved (or "" if goalMet is false)

IMPORTANT: Only set goalMet=true if you are genuinely confident (0.7+) that the exchange meaningfully addressed the objective. Do not be lenient — the player should actually engage with the goal, not just say anything.

Return JSON array only, no explanation:`;
}

// ── Side-channel runner ───────────────────────────────────────────────

/**
 * Run all side-channel analysis tasks in parallel. Fire-and-forget —
 * failures in any task are logged but never propagate.
 */
export function runSideChannel(
  playerMessage: string,
  npcResponse: string,
  context: SideChannelContext,
  callbacks: SideChannelCallbacks,
): void {
  // Task 1: Metadata extraction (Gemini Flash)
  const metadataTask = runMetadataExtraction(playerMessage, npcResponse, context, callbacks);

  // Task 2: Quest goal evaluation (Gemini Flash)
  const goalEvalTask = runGoalEvaluation(playerMessage, npcResponse, context, callbacks);

  // Task 3: Language progress tracking (local, no LLM)
  const progressTask = runLanguageProgressTracking(playerMessage, context, callbacks);

  // Log any failures but never throw
  Promise.allSettled([metadataTask, goalEvalTask, progressTask]).then(results => {
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('[LiveSideChannel] Task failed:', result.reason);
      }
    }
  });
}

// ── Task 1: Metadata extraction ───────────────────────────────────────

async function runMetadataExtraction(
  playerMessage: string,
  npcResponse: string,
  context: SideChannelContext,
  callbacks: SideChannelCallbacks,
): Promise<void> {
  if (!context.targetLanguage) return;
  if (!callbacks.onVocabHints && !callbacks.onGrammarFeedback && !callbacks.onEval) return;

  try {
    const prompt = buildMetadataExtractionPrompt(
      context.targetLanguage,
      playerMessage,
      npcResponse,
      {
        includeEval: !!callbacks.onEval,
        playerProficiency: context.playerProficiency ?? 'beginner',
      },
    );

    const ai = getGenAI();
    const result = await ai.models.generateContent({
      model: GEMINI_MODELS.FLASH,
      contents: prompt,
      config: { temperature: 0.1, maxOutputTokens: 500 },
    });

    const text = result.text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    } catch {
      console.warn('[LiveSideChannel] Failed to parse metadata JSON');
      return;
    }

    if (parsed.vocabHints && Array.isArray(parsed.vocabHints) && parsed.vocabHints.length > 0) {
      callbacks.onVocabHints?.(parsed.vocabHints);
    }
    if (parsed.grammarFeedback) {
      callbacks.onGrammarFeedback?.(parsed.grammarFeedback);
    }
    if (parsed.eval) {
      callbacks.onEval?.(parsed.eval);
    }
  } catch (err: any) {
    console.error('[LiveSideChannel] Metadata extraction failed:', err.message);
  }
}

// ── Task 2: Quest goal evaluation ─────────────────────────────────────

async function runGoalEvaluation(
  playerMessage: string,
  npcResponse: string,
  context: SideChannelContext,
  callbacks: SideChannelCallbacks,
): Promise<void> {
  if (!context.activeObjectives || context.activeObjectives.length === 0) return;
  if (!callbacks.onGoalEvaluation) return;

  try {
    const goalPrompt = buildConversationGoalPrompt(playerMessage, npcResponse, context.activeObjectives);

    const ai = getGenAI();
    const result = await ai.models.generateContent({
      model: GEMINI_MODELS.FLASH,
      contents: goalPrompt,
      config: { temperature: 0.0, maxOutputTokens: 300 },
    });

    const text = result.text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    } catch {
      console.warn('[LiveSideChannel] Failed to parse goal evaluation JSON');
      return;
    }

    const evaluations = Array.isArray(parsed) ? parsed : parsed.evaluations || [];
    if (evaluations.length > 0) {
      callbacks.onGoalEvaluation?.(evaluations);
    }
  } catch (err: any) {
    console.error('[LiveSideChannel] Goal evaluation failed:', err.message);
  }
}

// ── Task 3: Language progress tracking (local) ────────────────────────

async function runLanguageProgressTracking(
  playerMessage: string,
  context: SideChannelContext,
  callbacks: SideChannelCallbacks,
): Promise<void> {
  if (!context.activeQuests || context.activeQuests.length === 0) return;
  if (!callbacks.onQuestProgress) return;

  try {
    const result = analyzeConversation({
      playerMessage,
      npcCharacterId: context.npcCharacterId,
      npcName: context.npcName,
      conversationTurnCount: context.conversationTurnCount,
      activeQuests: context.activeQuests,
    });

    if (result.triggers.length > 0) {
      callbacks.onQuestProgress?.(result.triggers, result.markerContent);
    }
  } catch (err: any) {
    console.error('[LiveSideChannel] Language progress tracking failed:', err.message);
  }
}
