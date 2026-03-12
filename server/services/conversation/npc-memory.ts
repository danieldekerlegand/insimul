/**
 * NPC Conversation Memory Service (US-006)
 *
 * Stores conversation summaries per NPC-player pair in MongoDB so NPCs
 * remember previous conversations and relationships feel meaningful.
 *
 * Summaries are compact key-point extractions, not full transcripts.
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { IStreamingLLMProvider, ConversationContext } from './providers/llm-provider.js';

// ── Types ────────────────────────────────────────────────────────────

export interface ConversationSummary {
  topicsDiscussed: string[];
  promisesMade: string[];
  questionsAsked: string[];
  emotionalTone: string;
  languageUsed: string;
  keyExchange: string; // one-sentence summary of the conversation
}

export interface ConversationMemory {
  id: string;
  npcId: string;
  playerId: string;
  worldId: string;
  conversationCount: number;
  lastConversationAt: Date;
  summaries: ConversationSummary[];
  keyFacts: string[]; // player-shared information the NPC remembers
  createdAt: Date;
  updatedAt: Date;
}

// ── Mongoose model ───────────────────────────────────────────────────

interface ConversationMemoryDoc extends Document {
  npcId: string;
  playerId: string;
  worldId: string;
  conversationCount: number;
  lastConversationAt: Date;
  summaries: ConversationSummary[];
  keyFacts: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSummarySchema = new Schema(
  {
    topicsDiscussed: { type: [String], default: [] },
    promisesMade: { type: [String], default: [] },
    questionsAsked: { type: [String], default: [] },
    emotionalTone: { type: String, default: 'neutral' },
    languageUsed: { type: String, default: 'English' },
    keyExchange: { type: String, default: '' },
  },
  { _id: false },
);

const ConversationMemorySchema = new Schema(
  {
    npcId: { type: String, required: true, index: true },
    playerId: { type: String, required: true, index: true },
    worldId: { type: String, required: true, index: true },
    conversationCount: { type: Number, default: 0 },
    lastConversationAt: { type: Date, default: Date.now },
    summaries: { type: [ConversationSummarySchema], default: [] },
    keyFacts: { type: [String], default: [] },
  },
  { timestamps: true },
);

// Compound index for efficient lookups
ConversationMemorySchema.index({ npcId: 1, playerId: 1, worldId: 1 }, { unique: true });

const ConversationMemoryModel = mongoose.model<ConversationMemoryDoc>(
  'ConversationMemory',
  ConversationMemorySchema,
);

function docToMemory(doc: ConversationMemoryDoc | any): ConversationMemory {
  if (doc.toObject) {
    const obj = doc.toObject();
    return { ...obj, id: doc._id.toString() };
  }
  return { ...doc, id: doc._id?.toString() ?? '' };
}

// ── Storage interface for dependency injection ───────────────────────

export interface MemoryStorage {
  findMemory(npcId: string, playerId: string, worldId: string): Promise<ConversationMemory | null>;
  upsertMemory(
    npcId: string,
    playerId: string,
    worldId: string,
    update: Partial<ConversationMemory>,
  ): Promise<ConversationMemory>;
}

// ── Default MongoDB storage ──────────────────────────────────────────

export class MongoMemoryStorage implements MemoryStorage {
  async findMemory(npcId: string, playerId: string, worldId: string): Promise<ConversationMemory | null> {
    const doc = await ConversationMemoryModel.findOne({ npcId, playerId, worldId });
    return doc ? docToMemory(doc) : null;
  }

  async upsertMemory(
    npcId: string,
    playerId: string,
    worldId: string,
    update: Partial<ConversationMemory>,
  ): Promise<ConversationMemory> {
    const doc = await ConversationMemoryModel.findOneAndUpdate(
      { npcId, playerId, worldId },
      { $set: { ...update, npcId, playerId, worldId, updatedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return docToMemory(doc);
  }
}

// ── In-memory storage for testing ────────────────────────────────────

export class InMemoryStorage implements MemoryStorage {
  private store = new Map<string, ConversationMemory>();

  private key(npcId: string, playerId: string, worldId: string): string {
    return `${npcId}:${playerId}:${worldId}`;
  }

  async findMemory(npcId: string, playerId: string, worldId: string): Promise<ConversationMemory | null> {
    return this.store.get(this.key(npcId, playerId, worldId)) ?? null;
  }

  async upsertMemory(
    npcId: string,
    playerId: string,
    worldId: string,
    update: Partial<ConversationMemory>,
  ): Promise<ConversationMemory> {
    const k = this.key(npcId, playerId, worldId);
    const existing = this.store.get(k);
    const now = new Date();
    const merged: ConversationMemory = {
      id: existing?.id ?? `mem-${Date.now()}`,
      npcId,
      playerId,
      worldId,
      conversationCount: existing?.conversationCount ?? 0,
      lastConversationAt: existing?.lastConversationAt ?? now,
      summaries: existing?.summaries ?? [],
      keyFacts: existing?.keyFacts ?? [],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...update,
    };
    this.store.set(k, merged);
    return merged;
  }

  clear(): void {
    this.store.clear();
  }
}

// ── Summarization prompt ─────────────────────────────────────────────

const SUMMARIZE_PROMPT = `Analyze this conversation and extract a JSON summary. Return ONLY valid JSON, no markdown.

Format:
{
  "topicsDiscussed": ["topic1", "topic2"],
  "promisesMade": ["promise1"],
  "questionsAsked": ["question1"],
  "emotionalTone": "friendly|hostile|neutral|romantic|tense|playful|sad",
  "keyFacts": ["fact about the player"],
  "keyExchange": "One sentence summary of the conversation"
}

Rules:
- Topics: main subjects discussed (max 5)
- Promises: commitments either party made (max 3)
- Questions: important questions the player asked (max 3)
- Key facts: information the player shared about themselves (name, origin, goals, etc.) (max 5)
- Keep everything concise

Conversation:
`;

// ── NPC Memory Service ───────────────────────────────────────────────

export class NPCMemoryService {
  private storage: MemoryStorage;
  private llmProvider: IStreamingLLMProvider | null;

  /** Max summaries kept per NPC-player pair (oldest are dropped). */
  private static readonly MAX_SUMMARIES = 10;

  constructor(storage?: MemoryStorage, llmProvider?: IStreamingLLMProvider) {
    this.storage = storage ?? new MongoMemoryStorage();
    this.llmProvider = llmProvider ?? null;
  }

  /**
   * Retrieve memory for an NPC-player pair.
   * Returns null if they have never conversed.
   */
  async getMemory(npcId: string, playerId: string, worldId: string): Promise<ConversationMemory | null> {
    return this.storage.findMemory(npcId, playerId, worldId);
  }

  /**
   * After a conversation ends, summarize and store the memory.
   *
   * If an LLM provider is available, uses it to extract a structured summary.
   * Otherwise falls back to a simple heuristic extraction.
   */
  async updateMemory(
    npcId: string,
    playerId: string,
    worldId: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    languageUsed: string = 'English',
  ): Promise<ConversationMemory> {
    // Get existing memory
    const existing = await this.storage.findMemory(npcId, playerId, worldId);
    const count = (existing?.conversationCount ?? 0) + 1;

    // Summarize the conversation
    let summary: ConversationSummary;
    let newFacts: string[] = [];

    if (this.llmProvider && conversationHistory.length > 0) {
      const result = await this.summarizeWithLLM(conversationHistory, languageUsed);
      summary = result.summary;
      newFacts = result.keyFacts;
    } else {
      const result = this.summarizeHeuristic(conversationHistory, languageUsed);
      summary = result.summary;
      newFacts = result.keyFacts;
    }

    // Merge summaries, keeping the most recent ones
    const summaries = [...(existing?.summaries ?? []), summary];
    if (summaries.length > NPCMemoryService.MAX_SUMMARIES) {
      summaries.splice(0, summaries.length - NPCMemoryService.MAX_SUMMARIES);
    }

    // Merge key facts, deduplicating
    const existingFacts = existing?.keyFacts ?? [];
    const allFacts = Array.from(new Set([...existingFacts, ...newFacts]));

    return this.storage.upsertMemory(npcId, playerId, worldId, {
      conversationCount: count,
      lastConversationAt: new Date(),
      summaries,
      keyFacts: allFacts,
    });
  }

  /**
   * Use the LLM to extract a structured summary from conversation history.
   */
  private async summarizeWithLLM(
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    languageUsed: string,
  ): Promise<{ summary: ConversationSummary; keyFacts: string[] }> {
    const transcript = history
      .map((m) => `${m.role === 'user' ? 'Player' : 'NPC'}: ${m.content}`)
      .join('\n');

    const prompt = SUMMARIZE_PROMPT + transcript;
    const context: ConversationContext = {
      systemPrompt: 'You are a conversation analyst. Return only valid JSON.',
    };

    let fullResponse = '';
    try {
      for await (const token of this.llmProvider!.streamCompletion(prompt, context, {
        temperature: 0.2,
        maxTokens: 512,
      })) {
        fullResponse += token;
      }

      const parsed = JSON.parse(fullResponse.trim());
      return {
        summary: {
          topicsDiscussed: Array.isArray(parsed.topicsDiscussed) ? parsed.topicsDiscussed.slice(0, 5) : [],
          promisesMade: Array.isArray(parsed.promisesMade) ? parsed.promisesMade.slice(0, 3) : [],
          questionsAsked: Array.isArray(parsed.questionsAsked) ? parsed.questionsAsked.slice(0, 3) : [],
          emotionalTone: typeof parsed.emotionalTone === 'string' ? parsed.emotionalTone : 'neutral',
          languageUsed,
          keyExchange: typeof parsed.keyExchange === 'string' ? parsed.keyExchange : '',
        },
        keyFacts: Array.isArray(parsed.keyFacts) ? parsed.keyFacts.slice(0, 5) : [],
      };
    } catch {
      // LLM returned invalid JSON — fall back to heuristic
      return this.summarizeHeuristic(
        history,
        languageUsed,
      );
    }
  }

  /**
   * Simple heuristic extraction when LLM is unavailable.
   */
  private summarizeHeuristic(
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    languageUsed: string,
  ): { summary: ConversationSummary; keyFacts: string[] } {
    const playerMessages = history.filter((m) => m.role === 'user').map((m) => m.content);
    const npcMessages = history.filter((m) => m.role === 'assistant').map((m) => m.content);

    // Extract questions (messages ending with ?)
    const questions = playerMessages
      .filter((m) => m.trim().endsWith('?'))
      .slice(0, 3);

    // Extract simple topics from keywords
    const allText = [...playerMessages, ...npcMessages].join(' ').toLowerCase();
    const topicKeywords = [
      'family', 'work', 'job', 'weather', 'quest', 'adventure', 'love', 'friend',
      'enemy', 'war', 'peace', 'trade', 'gold', 'magic', 'history', 'food', 'home',
    ];
    const topics = topicKeywords.filter((kw) => allText.includes(kw)).slice(0, 5);

    // Detect promises (simple keyword matching)
    const promisePatterns = /\b(i will|i'll|i promise|i can help|let me|i shall)\b/i;
    const promises = [...playerMessages, ...npcMessages]
      .filter((m) => promisePatterns.test(m))
      .map((m) => m.slice(0, 100))
      .slice(0, 3);

    // Detect emotional tone from keywords
    let tone = 'neutral';
    if (/\b(thank|grateful|happy|glad|great|wonderful)\b/i.test(allText)) tone = 'friendly';
    if (/\b(angry|hate|furious|leave me|go away)\b/i.test(allText)) tone = 'hostile';
    if (/\b(love|beautiful|darling|heart)\b/i.test(allText)) tone = 'romantic';
    if (/\b(sad|sorry|miss|lost|grief)\b/i.test(allText)) tone = 'sad';

    // Extract key facts — player self-references
    const factPatterns = /\b(my name is|i am from|i'm from|i came from|i'm looking for|i need|i want to)\b/i;
    const keyFacts = playerMessages
      .filter((m) => factPatterns.test(m))
      .map((m) => m.slice(0, 150))
      .slice(0, 5);

    // Build key exchange
    const keyExchange =
      history.length > 0
        ? `Conversation with ${history.length} exchanges about ${topics.length > 0 ? topics.join(', ') : 'general topics'}.`
        : '';

    return {
      summary: {
        topicsDiscussed: topics,
        promisesMade: promises,
        questionsAsked: questions,
        emotionalTone: tone,
        languageUsed,
        keyExchange,
      },
      keyFacts,
    };
  }
}
