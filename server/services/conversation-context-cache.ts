/**
 * Server-side conversation context cache.
 *
 * Keeps recent conversation histories in memory so that:
 *  - The Gemini chat endpoint can track server-side state and avoid
 *    the client re-sending the entire history on every turn.
 *  - The language chat service can skip redundant MongoDB queries
 *    when the conversation hasn't changed since the last fetch.
 *
 * Uses a simple LRU strategy with a configurable max size and TTL.
 */

export interface CachedMessage {
  role: "user" | "model" | "assistant";
  content: string;
  /** Optional metadata (e.g. inLanguage for language chat) */
  meta?: Record<string, unknown>;
}

export interface ConversationContext {
  messages: CachedMessage[];
  /** Pre-formatted context string ready for prompt injection */
  formattedContext?: string;
  /** System prompt / instruction associated with this conversation */
  systemPrompt?: string;
  createdAt: number;
  lastAccessedAt: number;
}

interface CacheOptions {
  /** Maximum number of conversations to keep cached (default 200) */
  maxSize?: number;
  /** Time-to-live in milliseconds (default 30 minutes) */
  ttlMs?: number;
  /** Max messages to retain per conversation (default 50) */
  maxMessagesPerConversation?: number;
}

const DEFAULT_MAX_SIZE = 200;
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_MAX_MESSAGES = 50;

export class ConversationContextCache {
  private cache = new Map<string, ConversationContext>();
  private readonly maxSize: number;
  private readonly ttlMs: number;
  private readonly maxMessages: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    this.maxMessages = options.maxMessagesPerConversation ?? DEFAULT_MAX_MESSAGES;
  }

  /** Retrieve a conversation context if it exists and hasn't expired. */
  get(key: string): ConversationContext | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.lastAccessedAt > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end for LRU ordering
    this.cache.delete(key);
    entry.lastAccessedAt = Date.now();
    this.cache.set(key, entry);
    return entry;
  }

  /** Store or replace a full conversation context. */
  set(key: string, context: Omit<ConversationContext, "createdAt" | "lastAccessedAt">): void {
    this.evictIfNeeded();

    const now = Date.now();
    const existing = this.cache.get(key);

    this.cache.delete(key); // re-insert at end for LRU
    this.cache.set(key, {
      ...context,
      messages: context.messages.slice(-this.maxMessages),
      createdAt: existing?.createdAt ?? now,
      lastAccessedAt: now,
    });
  }

  /** Append a message to an existing conversation, creating one if needed. */
  append(key: string, message: CachedMessage, systemPrompt?: string): ConversationContext {
    const existing = this.get(key);
    const now = Date.now();

    const messages = existing
      ? [...existing.messages, message].slice(-this.maxMessages)
      : [message];

    const context: ConversationContext = {
      messages,
      systemPrompt: systemPrompt ?? existing?.systemPrompt,
      formattedContext: undefined, // invalidate formatted cache
      createdAt: existing?.createdAt ?? now,
      lastAccessedAt: now,
    };

    this.evictIfNeeded();
    this.cache.delete(key);
    this.cache.set(key, context);
    return context;
  }

  /** Remove a specific conversation from the cache. */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /** Clear all cached conversations. */
  clear(): void {
    this.cache.clear();
  }

  /** Return the number of cached conversations. */
  get size(): number {
    return this.cache.size;
  }

  /** Check if a key exists and hasn't expired. */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Build a cache key for the Gemini chat endpoint.
   * Uses worldId + npcId + playerId to identify a unique NPC conversation.
   */
  static chatKey(worldId: string, npcId: string, playerId: string): string {
    return `chat:${worldId}:${npcId}:${playerId}`;
  }

  /** Build a cache key for language chat. */
  static languageKey(languageId: string): string {
    return `lang:${languageId}`;
  }

  /** Evict expired entries, then oldest entries if still over capacity. */
  private evictIfNeeded(): void {
    const now = Date.now();

    // First pass: remove expired entries
    const expiredKeys: string[] = [];
    this.cache.forEach((entry, key) => {
      if (now - entry.lastAccessedAt > this.ttlMs) {
        expiredKeys.push(key);
      }
    });
    expiredKeys.forEach(key => this.cache.delete(key));

    // Second pass: evict oldest (first in Map) if over capacity
    while (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      } else {
        break;
      }
    }
  }
}

/** Singleton instance used across the server. */
export const conversationContextCache = new ConversationContextCache();
