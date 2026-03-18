/**
 * Quest Trigger Analyzer
 *
 * Analyzes player conversation messages against active quest objectives to detect
 * progress triggers. Runs after each player turn in the conversation pipeline and
 * emits quest_progress events when triggers are detected.
 *
 * Trigger types:
 *   - Vocabulary usage: keyword + fuzzy matching (Levenshtein ≤ 2)
 *   - Conversation objectives: talk_to_npc, complete_conversation turn counting
 *   - Grammar patterns: regex-based pattern detection
 *   - Topic relevance: keyword overlap with quest description/tags
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface QuestObjective {
  id: string;
  type: string;
  description?: string;
  target?: string;
  targetWords?: string[];
  grammarPattern?: string;
  requiredCount?: number;
  currentCount?: number;
  completed?: boolean;
}

export interface ActiveQuest {
  id: string;
  title: string;
  questType: string;
  objectives: QuestObjective[];
  assignedBy?: string;
  assignedByCharacterId?: string;
  tags?: string[];
  status?: string;
}

export interface TriggerMatch {
  questId: string;
  objectiveId: string;
  objectiveType: string;
  trigger: string;
  incrementBy: number;
  newCount: number;
  requiredCount: number;
  completed: boolean;
}

export interface AnalysisResult {
  triggers: TriggerMatch[];
  /** Formatted as QUEST_PROGRESS marker block content (empty string if no triggers) */
  markerContent: string;
}

export interface AnalysisContext {
  playerMessage: string;
  npcCharacterId?: string;
  npcName?: string;
  conversationTurnCount: number;
  activeQuests: ActiveQuest[];
}

// ── Levenshtein distance ───────────────────────────────────────────────────

export function levenshteinDistance(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  // Single-row DP
  let prev = Array.from({ length: lb + 1 }, (_, i) => i);
  for (let i = 1; i <= la; i++) {
    const curr = [i];
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,       // insertion
        prev[j] + 1,           // deletion
        prev[j - 1] + cost,    // substitution
      );
    }
    prev = curr;
  }
  return prev[lb];
}

// ── Vocabulary trigger detection ───────────────────────────────────────────

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-záàâäãåæçéèêëíìîïñóòôöõøúùûüýÿ'-]/gi, '').trim();
}

function tokenize(text: string): string[] {
  return text
    .split(/[\s,;:.!?¿¡"""''()\[\]{}<>\/\\|@#$%^&*+=~`]+/)
    .map(normalizeWord)
    .filter(w => w.length > 0);
}

/**
 * Check if any target words appear in the player message.
 * Uses exact match first, then fuzzy match (Levenshtein ≤ 2) for words ≥ 4 chars.
 */
export function detectVocabularyUsage(
  playerMessage: string,
  targetWords: string[],
): string[] {
  if (!targetWords || targetWords.length === 0) return [];

  const messageTokens = tokenize(playerMessage);
  const matched: string[] = [];

  for (const target of targetWords) {
    const normalizedTarget = normalizeWord(target);
    if (!normalizedTarget) continue;

    let found = false;

    for (const token of messageTokens) {
      // Exact match
      if (token === normalizedTarget) {
        found = true;
        break;
      }
      // Fuzzy match only for words ≥ 4 chars (short words have too many false positives)
      if (normalizedTarget.length >= 4 && token.length >= 4) {
        if (levenshteinDistance(token, normalizedTarget) <= 2) {
          found = true;
          break;
        }
      }
    }

    if (found) {
      matched.push(target);
    }
  }

  return matched;
}

// ── Grammar pattern detection ──────────────────────────────────────────────

/**
 * Check if the player message matches a grammar pattern.
 * The pattern is treated as a case-insensitive regex.
 */
export function detectGrammarPattern(
  playerMessage: string,
  grammarPattern: string,
): boolean {
  if (!grammarPattern) return false;
  try {
    const regex = new RegExp(grammarPattern, 'i');
    return regex.test(playerMessage);
  } catch {
    // Invalid regex — fall back to substring match
    return playerMessage.toLowerCase().includes(grammarPattern.toLowerCase());
  }
}

// ── Topic relevance detection ──────────────────────────────────────────────

/**
 * Check if the player message is topically relevant to a quest based on
 * keyword overlap with quest tags and title words.
 */
export function detectTopicRelevance(
  playerMessage: string,
  quest: ActiveQuest,
): boolean {
  const messageTokens = new Set(tokenize(playerMessage));
  if (messageTokens.size === 0) return false;

  const questKeywords: string[] = [];
  if (quest.tags) {
    for (const tag of quest.tags) {
      questKeywords.push(...tokenize(tag));
    }
  }
  questKeywords.push(...tokenize(quest.title));

  // Need at least 1 keyword overlap
  return questKeywords.some(kw => messageTokens.has(normalizeWord(kw)));
}

// ── Core analyzer ──────────────────────────────────────────────────────────

/**
 * Analyze a player message against active quests and return trigger matches.
 */
export function analyzeConversation(ctx: AnalysisContext): AnalysisResult {
  const { playerMessage, npcCharacterId, conversationTurnCount, activeQuests } = ctx;
  const triggers: TriggerMatch[] = [];

  for (const quest of activeQuests) {
    if (quest.status && quest.status !== 'active') continue;

    for (const obj of quest.objectives) {
      if (obj.completed) continue;

      const currentCount = obj.currentCount ?? 0;
      const requiredCount = obj.requiredCount ?? 1;

      switch (obj.type) {
        case 'use_vocabulary': {
          const words = obj.targetWords ?? [];
          const matched = detectVocabularyUsage(playerMessage, words);
          if (matched.length > 0) {
            const newCount = Math.min(currentCount + matched.length, requiredCount);
            triggers.push({
              questId: quest.id,
              objectiveId: obj.id,
              objectiveType: obj.type,
              trigger: `used words: ${matched.join(', ')}`,
              incrementBy: matched.length,
              newCount,
              requiredCount,
              completed: newCount >= requiredCount,
            });
          }
          break;
        }

        case 'talk_to_npc': {
          // Check if the player is talking to the right NPC
          const targetNpc = obj.target;
          if (targetNpc && npcCharacterId) {
            const targetNorm = normalizeWord(targetNpc);
            const npcNorm = normalizeWord(npcCharacterId);
            if (npcNorm.includes(targetNorm) || targetNorm.includes(npcNorm)) {
              const newCount = Math.min(currentCount + 1, requiredCount);
              triggers.push({
                questId: quest.id,
                objectiveId: obj.id,
                objectiveType: obj.type,
                trigger: `talked to ${targetNpc}`,
                incrementBy: 1,
                newCount,
                requiredCount,
                completed: newCount >= requiredCount,
              });
            }
          }
          break;
        }

        case 'complete_conversation': {
          // Progress based on conversation turn count
          const turnThreshold = requiredCount;
          if (conversationTurnCount >= turnThreshold && currentCount < requiredCount) {
            triggers.push({
              questId: quest.id,
              objectiveId: obj.id,
              objectiveType: obj.type,
              trigger: `completed ${conversationTurnCount} conversation turns`,
              incrementBy: 1,
              newCount: requiredCount,
              requiredCount,
              completed: true,
            });
          }
          break;
        }

        case 'translation_challenge': {
          // If the quest has target words, check if any appear in the message
          const words = obj.targetWords ?? [];
          if (words.length > 0) {
            const matched = detectVocabularyUsage(playerMessage, words);
            if (matched.length > 0) {
              const newCount = Math.min(currentCount + matched.length, requiredCount);
              triggers.push({
                questId: quest.id,
                objectiveId: obj.id,
                objectiveType: obj.type,
                trigger: `translated: ${matched.join(', ')}`,
                incrementBy: matched.length,
                newCount,
                requiredCount,
                completed: newCount >= requiredCount,
              });
            }
          }
          break;
        }

        case 'listening_comprehension': {
          // Topic relevance check — did the player respond about the quest topic?
          if (detectTopicRelevance(playerMessage, quest)) {
            const newCount = Math.min(currentCount + 1, requiredCount);
            triggers.push({
              questId: quest.id,
              objectiveId: obj.id,
              objectiveType: obj.type,
              trigger: `responded to comprehension topic`,
              incrementBy: 1,
              newCount,
              requiredCount,
              completed: newCount >= requiredCount,
            });
          }
          break;
        }

        // Conversation-only objective types — progress on each conversation turn
        case 'ask_for_directions':
        case 'order_food':
        case 'haggle_price':
        case 'listen_and_repeat':
        case 'describe_scene':
        case 'write_response':
        case 'build_friendship': {
          // These objectives progress when the player sends a relevant message
          if (playerMessage.trim().length > 0) {
            const newCount = Math.min(currentCount + 1, requiredCount);
            if (newCount > currentCount) {
              triggers.push({
                questId: quest.id,
                objectiveId: obj.id,
                objectiveType: obj.type,
                trigger: `conversation turn for ${obj.type}`,
                incrementBy: 1,
                newCount,
                requiredCount,
                completed: newCount >= requiredCount,
              });
            }
          }
          break;
        }

        case 'introduce_self': {
          // Detect self-introduction patterns (name mentions, greetings)
          const introPatterns = /\b(my name|i am|i'm|je m'appelle|me llamo|ich bin|ich heiße)\b/i;
          if (introPatterns.test(playerMessage)) {
            triggers.push({
              questId: quest.id,
              objectiveId: obj.id,
              objectiveType: obj.type,
              trigger: `introduced self`,
              incrementBy: 1,
              newCount: requiredCount,
              requiredCount,
              completed: true,
            });
          }
          break;
        }

        default: {
          // For any objective with a grammarPattern, check it
          if (obj.grammarPattern && detectGrammarPattern(playerMessage, obj.grammarPattern)) {
            const newCount = Math.min(currentCount + 1, requiredCount);
            triggers.push({
              questId: quest.id,
              objectiveId: obj.id,
              objectiveType: obj.type,
              trigger: `matched grammar pattern`,
              incrementBy: 1,
              newCount,
              requiredCount,
              completed: newCount >= requiredCount,
            });
          }
          break;
        }
      }
    }
  }

  return {
    triggers,
    markerContent: formatMarkerContent(triggers),
  };
}

// ── Marker content formatting ──────────────────────────────────────────────

function formatMarkerContent(triggers: TriggerMatch[]): string {
  if (triggers.length === 0) return '';

  const lines = triggers.map(
    t => `ObjectiveId: ${t.objectiveId}, Progress: ${t.newCount}/${t.requiredCount}, Trigger: '${t.trigger}'`,
  );
  return lines.join('\n');
}
