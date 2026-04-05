/**
 * NPC-to-NPC Conversation Engine (US-007)
 *
 * Drives autonomous NPC-to-NPC conversations using the LLM provider.
 * Topic selection considers shared location, relationship history,
 * personality compatibility, and recent events.
 *
 * Conversations run 3-8 exchanges based on personality (extroverts talk longer).
 * Rate limited to max 3 concurrent conversations per world.
 *
 * Falls back to template-based conversations (AmbientConversationSystem)
 * when LLM is unavailable.
 */

import type {
  IStreamingLLMProvider,
  ConversationContext,
  StreamCompletionOptions,
} from './providers/llm-provider.js';
import type { ContextManagerStorage, BigFivePersonality } from './context-manager.js';
import { storage as defaultStorage } from '../../db/storage.js';
import type { Character, World } from '@shared/schema';
import type { WorldLanguage } from '@shared/language';
import type { WeatherCondition } from '@shared/npc-awareness-context';
import { describeWeather, describeTime } from '@shared/npc-awareness-context';
import { npcConversationPool } from './npc-conversation-pool.js';
import type { PooledConversation } from './npc-conversation-pool.js';

// ── Types ────────────────────────────────────────────────────────────

export interface NpcConversationResult {
  conversationId: string;
  npc1Id: string;
  npc2Id: string;
  worldId: string;
  topic: string;
  exchanges: ConversationExchange[];
  relationshipDelta: RelationshipDelta;
  durationMs: number;
  languageUsed: string;
}

export interface ConversationExchange {
  speakerId: string;
  speakerName: string;
  text: string;
  timestamp: number;
}

export interface RelationshipDelta {
  friendshipChange: number; // -0.1 to +0.1
  trustChange: number;      // -0.05 to +0.05
  romanceSpark: number;     // 0 to 0.05
}

export interface TopicCandidate {
  topic: string;
  weight: number;
  reason: string;
}

/** Environment context for NPC-NPC conversations */
export interface NpcConversationEnvironment {
  weather?: WeatherCondition;
  gameHour?: number;
  season?: string;
}

/** Callback fired when a complete NPC-NPC conversation line is parsed during streaming */
export type OnLineReadyCallback = (
  speaker: string,
  speakerId: string,
  line: string,
  lineIndex: number,
) => void;

export interface NpcConversationOptions {
  topic?: string;
  maxExchanges?: number;
  languageCode?: string;
  environment?: NpcConversationEnvironment;
  /** Called incrementally as each conversation line is parsed from the LLM stream */
  onLineReady?: OnLineReadyCallback;
}

/** Event types emitted during NPC conversations */
export interface NpcConversationEvent {
  type: 'ambient_conversation_started' | 'ambient_conversation_ended';
  conversationId: string;
  participants: [string, string];
  locationId: string;
  topic: string;
  durationMs?: number;
  vocabularyCount?: number;
}

// ── Fallback templates ───────────────────────────────────────────────

interface FallbackTemplate {
  topic: string;
  lines: Array<{ speaker: 'A' | 'B'; text: string }>;
}

const FALLBACK_TEMPLATES: FallbackTemplate[] = [
  {
    topic: 'greeting',
    lines: [
      { speaker: 'A', text: 'Good day! How have you been?' },
      { speaker: 'B', text: "I've been well, thank you. And yourself?" },
      { speaker: 'A', text: "Can't complain. The weather has been pleasant lately." },
      { speaker: 'B', text: 'Indeed it has. Well, I should be on my way.' },
    ],
  },
  {
    topic: 'work',
    lines: [
      { speaker: 'A', text: "Busy day at work today, wasn't it?" },
      { speaker: 'B', text: 'Tell me about it. I could use a break.' },
      { speaker: 'A', text: "At least it's almost over. Any plans for the evening?" },
      { speaker: 'B', text: 'Just a quiet night at home, I think.' },
    ],
  },
  {
    topic: 'gossip',
    lines: [
      { speaker: 'A', text: 'Have you heard the latest news around town?' },
      { speaker: 'B', text: 'No, what happened?' },
      { speaker: 'A', text: "Oh, just the usual comings and goings. Nothing too exciting." },
      { speaker: 'B', text: "Well, that's how it goes in a small town." },
    ],
  },
  {
    topic: 'weather',
    lines: [
      { speaker: 'A', text: "Looks like it might rain later, don't you think?" },
      { speaker: 'B', text: "I hope not. I didn't bring anything to cover myself." },
      { speaker: 'A', text: "You can always duck into a shop if it starts." },
      { speaker: 'B', text: "Good idea. Let's hope it holds off though." },
    ],
  },
];

// ── Topic selection ──────────────────────────────────────────────────

const TOPIC_POOL = [
  'daily_greeting',
  'weather',
  'work',
  'gossip',
  'food',
  'family',
  'local_events',
  'shared_hobby',
  'complaint',
  'philosophy',
  'romance',
  'rivalry',
];

function selectTopics(
  npc1: Character,
  npc2: Character,
  relationshipStrength: number,
  environment?: NpcConversationEnvironment,
): TopicCandidate[] {
  const p1 = (npc1.personality ?? {}) as BigFivePersonality;
  const p2 = (npc2.personality ?? {}) as BigFivePersonality;

  const candidates: TopicCandidate[] = [];

  // Always available
  candidates.push({ topic: 'daily_greeting', weight: 1.0, reason: 'universal' });

  // Weather topic — boosted when weather is notable
  const weather = environment?.weather ?? 'clear';
  const weatherWeight = (weather !== 'clear') ? 1.5 : 0.8;
  candidates.push({ topic: 'weather', weight: weatherWeight, reason: weather !== 'clear' ? `notable weather: ${weather}` : 'small talk' });

  // Work — if both have occupations
  if (npc1.occupation && npc2.occupation) {
    const sameWork = npc1.occupation === npc2.occupation;
    candidates.push({
      topic: 'work',
      weight: sameWork ? 1.5 : 0.9,
      reason: sameWork ? 'same occupation' : 'both employed',
    });
  }

  // Gossip — boosted by openness
  const avgOpenness = ((p1.openness ?? 0) + (p2.openness ?? 0)) / 2;
  candidates.push({
    topic: 'gossip',
    weight: 0.6 + Math.max(0, avgOpenness) * 0.5,
    reason: 'openness-driven',
  });

  // Food — universal, slight boost for agreeableness
  const avgAgree = ((p1.agreeableness ?? 0) + (p2.agreeableness ?? 0)) / 2;
  candidates.push({
    topic: 'food',
    weight: 0.7 + Math.max(0, avgAgree) * 0.3,
    reason: 'agreeableness-boosted',
  });

  // Family — requires moderate relationship
  if (relationshipStrength > 0.2) {
    candidates.push({
      topic: 'family',
      weight: 0.5 + relationshipStrength * 0.5,
      reason: 'friendship-gated',
    });
  }

  // Local events — boosted by extroversion
  const avgExtro = ((p1.extroversion ?? 0) + (p2.extroversion ?? 0)) / 2;
  candidates.push({
    topic: 'local_events',
    weight: 0.5 + Math.max(0, avgExtro) * 0.5,
    reason: 'extroversion-driven',
  });

  // Shared hobby — if both have high openness
  if ((p1.openness ?? 0) > 0.3 && (p2.openness ?? 0) > 0.3) {
    candidates.push({
      topic: 'shared_hobby',
      weight: 0.8,
      reason: 'mutual high openness',
    });
  }

  // Complaint — boosted by neuroticism
  const avgNeuro = ((p1.neuroticism ?? 0) + (p2.neuroticism ?? 0)) / 2;
  if (avgNeuro > 0) {
    candidates.push({
      topic: 'complaint',
      weight: 0.4 + avgNeuro * 0.6,
      reason: 'neuroticism-driven',
    });
  }

  // Philosophy — requires high openness from at least one
  if ((p1.openness ?? 0) > 0.5 || (p2.openness ?? 0) > 0.5) {
    candidates.push({
      topic: 'philosophy',
      weight: 0.4,
      reason: 'high openness',
    });
  }

  // Romance — requires positive relationship and opposite or compatible romance conditions
  if (relationshipStrength > 0.4) {
    const romancePotential =
      (p1.agreeableness ?? 0) + (p2.agreeableness ?? 0) +
      (p1.openness ?? 0) + (p2.openness ?? 0);
    if (romancePotential > 0.5) {
      candidates.push({
        topic: 'romance',
        weight: 0.3 + relationshipStrength * 0.3,
        reason: 'strong relationship + compatible personality',
      });
    }
  }

  // Rivalry — if relationship is negative
  if (relationshipStrength < -0.2) {
    candidates.push({
      topic: 'rivalry',
      weight: 0.5 + Math.abs(relationshipStrength) * 0.5,
      reason: 'negative relationship',
    });
  }

  return candidates;
}

function weightedRandomSelect(candidates: TopicCandidate[]): TopicCandidate {
  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) return candidate;
  }
  return candidates[candidates.length - 1];
}

// ── Exchange count from personality ──────────────────────────────────

function calculateExchangeCount(p1: BigFivePersonality, p2: BigFivePersonality): number {
  // Base: 3-8 exchanges. Extroverts talk longer.
  const avgExtroversion = ((p1.extroversion ?? 0) + (p2.extroversion ?? 0)) / 2;
  // Map -1..1 to 3..8
  const base = Math.round(5.5 + avgExtroversion * 2.5);
  return Math.max(3, Math.min(8, base));
}

// ── Relationship delta calculation ───────────────────────────────────

function calculateRelationshipDelta(
  topic: string,
  exchangeCount: number,
  p1: BigFivePersonality,
  p2: BigFivePersonality,
  currentStrength: number,
): RelationshipDelta {
  // Base friendship change from agreeableness
  const avgAgree = ((p1.agreeableness ?? 0) + (p2.agreeableness ?? 0)) / 2;
  let friendshipChange = 0.02 + avgAgree * 0.03; // 0.02 to 0.05 per conversation
  friendshipChange *= exchangeCount / 5; // scale by conversation length

  // Negative topics reduce friendship
  if (topic === 'rivalry') {
    friendshipChange = -0.03 - Math.abs(avgAgree) * 0.02;
  } else if (topic === 'complaint') {
    // Shared complaints can bond or push apart
    friendshipChange *= avgAgree > 0 ? 1.2 : 0.5;
  }

  // Trust builds slowly
  const trustChange = friendshipChange * 0.5;

  // Romance spark only for romantic topics
  let romanceSpark = 0;
  if (topic === 'romance') {
    romanceSpark = 0.02 + ((p1.openness ?? 0) + (p2.openness ?? 0)) * 0.01;
    romanceSpark = Math.max(0, Math.min(0.05, romanceSpark));
  }

  // Cap changes
  friendshipChange = Math.max(-0.1, Math.min(0.1, friendshipChange));
  const cappedTrust = Math.max(-0.05, Math.min(0.05, trustChange));

  return {
    friendshipChange,
    trustChange: cappedTrust,
    romanceSpark,
  };
}

// ── System prompt for NPC-NPC conversations ─────────────────────────

function buildNpcNpcSystemPrompt(
  npc1: Character,
  npc2: Character,
  p1: BigFivePersonality,
  p2: BigFivePersonality,
  topic: string,
  worldName: string,
  languages: string[],
  exchangeCount: number,
  relationshipStrength: number,
  environment?: NpcConversationEnvironment,
): string {
  const personalityDesc = (name: string, p: BigFivePersonality) =>
    `${name}: openness ${p.openness?.toFixed(1) ?? '0'}, conscientiousness ${p.conscientiousness?.toFixed(1) ?? '0'}, extroversion ${p.extroversion?.toFixed(1) ?? '0'}, agreeableness ${p.agreeableness?.toFixed(1) ?? '0'}, neuroticism ${p.neuroticism?.toFixed(1) ?? '0'}`;

  const relLabel =
    relationshipStrength >= 0.6
      ? 'close friends'
      : relationshipStrength >= 0.2
        ? 'friendly acquaintances'
        : relationshipStrength > -0.2
          ? 'acquaintances'
          : 'rivals';

  const langInstruction = languages.length > 0
    ? `They speak ${languages.join(' and ')}. Use this language naturally in dialogue.`
    : '';

  // Build environment description
  let envDesc = '';
  if (environment) {
    const parts: string[] = [];
    if (environment.gameHour !== undefined) {
      parts.push(`Time: ${describeTime(environment.gameHour)}`);
    }
    if (environment.weather && environment.weather !== 'clear') {
      parts.push(`Weather: ${describeWeather(environment.weather)}`);
    }
    if (environment.season) {
      parts.push(`Season: ${environment.season}`);
    }
    if (parts.length > 0) {
      envDesc = `Environment: ${parts.join('. ')}.`;
    }
  }

  return [
    `You are simulating a conversation between two NPCs in ${worldName}.`,
    `${npc1.firstName} ${npc1.lastName} (${npc1.occupation ?? 'unemployed'}) and ${npc2.firstName} ${npc2.lastName} (${npc2.occupation ?? 'unemployed'}).`,
    personalityDesc(`${npc1.firstName}`, p1),
    personalityDesc(`${npc2.firstName}`, p2),
    `They are ${relLabel}. Topic: ${topic}.`,
    envDesc,
    langInstruction,
    `Write exactly ${exchangeCount} exchanges (${exchangeCount * 2} lines total), alternating speakers.`,
    `Format each line as: "${npc1.firstName}: text" or "${npc2.firstName}: text"`,
    `Keep it natural, brief, and in-character based on their personalities and current environment.`,
    `${npc1.firstName} speaks first.`,
  ].filter(Boolean).join('\n');
}

// ── Rate limiting ────────────────────────────────────────────────────

const activeConversations = new Map<string, Set<string>>();
const MAX_CONCURRENT_PER_WORLD = 3;

function acquireSlot(worldId: string, conversationId: string): boolean {
  let worldSlots = activeConversations.get(worldId);
  if (!worldSlots) {
    worldSlots = new Set();
    activeConversations.set(worldId, worldSlots);
  }
  if (worldSlots.size >= MAX_CONCURRENT_PER_WORLD) return false;
  worldSlots.add(conversationId);
  return true;
}

function releaseSlot(worldId: string, conversationId: string): void {
  const worldSlots = activeConversations.get(worldId);
  if (worldSlots) {
    worldSlots.delete(conversationId);
    if (worldSlots.size === 0) activeConversations.delete(worldId);
  }
}

export function getActiveConversationCount(worldId: string): number {
  return activeConversations.get(worldId)?.size ?? 0;
}

// For testing: reset all rate limiting state
export function resetRateLimiting(): void {
  activeConversations.clear();
}

// ── Event emitter interface ──────────────────────────────────────────

export interface NpcConversationEventEmitter {
  emit(event: NpcConversationEvent): void;
}

// ── Fallback conversation ────────────────────────────────────────────

function generateFallbackConversation(
  npc1: Character,
  npc2: Character,
  topic: string,
): ConversationExchange[] {
  // Find a matching template or use the first one
  const template =
    FALLBACK_TEMPLATES.find((t) => topic.includes(t.topic)) ??
    FALLBACK_TEMPLATES[0];

  const now = Date.now();
  return template.lines.map((line, i) => {
    const isNpc1 = line.speaker === 'A';
    return {
      speakerId: isNpc1 ? npc1.id : npc2.id,
      speakerName: isNpc1
        ? `${npc1.firstName} ${npc1.lastName}`
        : `${npc2.firstName} ${npc2.lastName}`,
      text: line.text,
      timestamp: now + i * 3000,
    };
  });
}

// ── Parse single line (for incremental streaming) ──────────────────

interface ParsedLine {
  speakerId: string;
  speakerName: string;
  text: string;
}

function parseSingleLine(
  line: string,
  npc1: Character,
  npc2: Character,
): ParsedLine | null {
  const trimmed = line.trim();
  const name1 = npc1.firstName;
  const name2 = npc2.firstName;

  let speakerId: string;
  let speakerName: string;
  let dialogueText: string;

  if (trimmed.startsWith(`${name1}:`)) {
    speakerId = npc1.id;
    speakerName = `${npc1.firstName} ${npc1.lastName}`;
    dialogueText = trimmed.slice(name1.length + 1).trim();
  } else if (trimmed.startsWith(`${name2}:`)) {
    speakerId = npc2.id;
    speakerName = `${npc2.firstName} ${npc2.lastName}`;
    dialogueText = trimmed.slice(name2.length + 1).trim();
  } else {
    return null;
  }

  // Remove surrounding quotes if present
  if (dialogueText.startsWith('"') && dialogueText.endsWith('"')) {
    dialogueText = dialogueText.slice(1, -1);
  }

  if (dialogueText.length === 0) return null;

  return { speakerId, speakerName, text: dialogueText };
}

// ── Parse LLM response ──────────────────────────────────────────────

function parseLlmConversation(
  text: string,
  npc1: Character,
  npc2: Character,
): ConversationExchange[] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const exchanges: ConversationExchange[] = [];
  const now = Date.now();

  const name1 = npc1.firstName;
  const name2 = npc2.firstName;

  for (const line of lines) {
    const trimmed = line.trim();
    let speakerId: string;
    let speakerName: string;
    let dialogueText: string;

    if (trimmed.startsWith(`${name1}:`)) {
      speakerId = npc1.id;
      speakerName = `${npc1.firstName} ${npc1.lastName}`;
      dialogueText = trimmed.slice(name1.length + 1).trim();
    } else if (trimmed.startsWith(`${name2}:`)) {
      speakerId = npc2.id;
      speakerName = `${npc2.firstName} ${npc2.lastName}`;
      dialogueText = trimmed.slice(name2.length + 1).trim();
    } else {
      // Try to continue previous speaker's dialogue or skip
      continue;
    }

    // Remove surrounding quotes if present
    if (dialogueText.startsWith('"') && dialogueText.endsWith('"')) {
      dialogueText = dialogueText.slice(1, -1);
    }

    if (dialogueText.length > 0) {
      exchanges.push({
        speakerId,
        speakerName,
        text: dialogueText,
        timestamp: now + exchanges.length * 3000,
      });
    }
  }

  return exchanges;
}

// ── Main engine ──────────────────────────────────────────────────────

export async function initiateConversation(
  npc1Id: string,
  npc2Id: string,
  worldId: string,
  options?: NpcConversationOptions & {
    llmProvider?: IStreamingLLMProvider;
    storageOverride?: ContextManagerStorage;
    eventEmitter?: NpcConversationEventEmitter;
  },
): Promise<NpcConversationResult> {
  const conversationId = `npc-conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startTime = Date.now();
  const stor = options?.storageOverride ?? defaultStorage;

  // Rate limiting
  if (!acquireSlot(worldId, conversationId)) {
    throw new Error(
      `Rate limit exceeded: max ${MAX_CONCURRENT_PER_WORLD} concurrent NPC conversations per world`,
    );
  }

  try {
    // Load NPC and world data
    const [npc1, npc2, world, languages] = await Promise.all([
      stor.getCharacter(npc1Id),
      stor.getCharacter(npc2Id),
      stor.getWorld(worldId),
      stor.getWorldLanguagesByWorld(worldId),
    ]);

    if (!npc1) throw new Error(`NPC ${npc1Id} not found`);
    if (!npc2) throw new Error(`NPC ${npc2Id} not found`);
    if (!world) throw new Error(`World ${worldId} not found`);

    const p1: BigFivePersonality = (npc1.personality as BigFivePersonality) ?? {
      openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0,
    };
    const p2: BigFivePersonality = (npc2.personality as BigFivePersonality) ?? {
      openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0,
    };

    // Determine relationship strength between the two NPCs
    const rels1 = (npc1.relationships ?? {}) as Record<string, any>;
    const rel = rels1[npc2Id];
    const relationshipStrength = typeof rel?.strength === 'number' ? rel.strength : 0;

    // Topic selection (environment-aware)
    const environment = options?.environment;
    let topic = options?.topic;
    if (!topic) {
      const candidates = selectTopics(npc1, npc2, relationshipStrength, environment);
      const selected = weightedRandomSelect(candidates);
      topic = selected.topic;
    }

    // Exchange count from personality
    const maxExchanges = options?.maxExchanges ?? calculateExchangeCount(p1, p2);

    // Language
    const worldLangs = languages.map((l: WorldLanguage) => l.name);
    const languageUsed = options?.languageCode ?? worldLangs[0] ?? 'English';

    // Emit start event
    const location = npc1.currentLocation ?? npc2.currentLocation ?? 'unknown';
    options?.eventEmitter?.emit({
      type: 'ambient_conversation_started',
      conversationId,
      participants: [npc1Id, npc2Id],
      locationId: location,
      topic,
    });

    // Check pre-generated pool first
    const pooled = npcConversationPool.take(
      worldId, npc1Id, npc2Id, environment?.gameHour,
    );
    if (pooled) {
      const durationMs = Date.now() - startTime;
      options?.eventEmitter?.emit({
        type: 'ambient_conversation_ended',
        conversationId,
        participants: [npc1Id, npc2Id],
        locationId: location,
        topic: pooled.topic,
        durationMs,
        vocabularyCount: 0,
      });
      return {
        conversationId,
        npc1Id,
        npc2Id,
        worldId,
        topic: pooled.topic,
        exchanges: pooled.exchanges,
        relationshipDelta: pooled.relationshipDelta,
        durationMs,
        languageUsed: pooled.languageUsed,
      };
    }

    // Try LLM-based conversation
    let exchanges: ConversationExchange[];
    const llm = options?.llmProvider;

    if (llm) {
      try {
        const systemPrompt = buildNpcNpcSystemPrompt(
          npc1, npc2, p1, p2, topic, world.name, worldLangs, maxExchanges, relationshipStrength, environment,
        );

        const context: ConversationContext = {
          systemPrompt,
          characterName: `${npc1.firstName} & ${npc2.firstName}`,
          worldContext: world.name,
        };

        // Incremental line parsing: detect complete lines as they stream
        let fullResponse = '';
        let lineBuffer = '';
        let lineIndex = 0;
        const onLineReady = options?.onLineReady;

        for await (const token of llm.streamCompletion(
          `Begin the conversation about ${topic}.`,
          context,
          { temperature: 0.8, maxTokens: 1024 },
        )) {
          fullResponse += token;
          lineBuffer += token;

          // Check for complete lines (newline-delimited)
          while (lineBuffer.includes('\n')) {
            const newlinePos = lineBuffer.indexOf('\n');
            const completeLine = lineBuffer.slice(0, newlinePos).trim();
            lineBuffer = lineBuffer.slice(newlinePos + 1);

            if (completeLine.length > 0 && onLineReady) {
              const parsed = parseSingleLine(completeLine, npc1, npc2);
              if (parsed) {
                onLineReady(parsed.speakerName, parsed.speakerId, parsed.text, lineIndex);
                lineIndex++;
              }
            }
          }
        }

        // Flush any remaining buffered line
        const remaining = lineBuffer.trim();
        if (remaining.length > 0 && onLineReady) {
          const parsed = parseSingleLine(remaining, npc1, npc2);
          if (parsed) {
            onLineReady(parsed.speakerName, parsed.speakerId, parsed.text, lineIndex);
          }
        }

        // Full parse for relationship updates and persistence
        exchanges = parseLlmConversation(fullResponse, npc1, npc2);

        // Fallback if LLM produced nothing usable
        if (exchanges.length < 2) {
          exchanges = generateFallbackConversation(npc1, npc2, topic);
        }
      } catch {
        // LLM failed — use fallback
        exchanges = generateFallbackConversation(npc1, npc2, topic);
      }
    } else {
      // No LLM available — use fallback templates
      exchanges = generateFallbackConversation(npc1, npc2, topic);
    }

    // Calculate relationship changes
    const relationshipDelta = calculateRelationshipDelta(
      topic, exchanges.length, p1, p2, relationshipStrength,
    );

    const durationMs = Date.now() - startTime;

    // Emit end event
    options?.eventEmitter?.emit({
      type: 'ambient_conversation_ended',
      conversationId,
      participants: [npc1Id, npc2Id],
      locationId: location,
      topic,
      durationMs,
      vocabularyCount: 0,
    });

    return {
      conversationId,
      npc1Id,
      npc2Id,
      worldId,
      topic,
      exchanges,
      relationshipDelta,
      durationMs,
      languageUsed,
    };
  } finally {
    releaseSlot(worldId, conversationId);
  }
}

// Re-export for testing
export {
  selectTopics,
  weightedRandomSelect,
  calculateExchangeCount,
  calculateRelationshipDelta,
  parseLlmConversation,
  parseSingleLine,
  generateFallbackConversation,
  buildNpcNpcSystemPrompt,
  FALLBACK_TEMPLATES,
  MAX_CONCURRENT_PER_WORLD,
};

// Re-export pool for external access
export { npcConversationPool } from './npc-conversation-pool.js';
export type { PooledConversation, PoolStats } from './npc-conversation-pool.js';
