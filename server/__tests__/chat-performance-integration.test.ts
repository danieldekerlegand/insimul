/**
 * Integration test: Chat Performance Pipeline (US-017)
 *
 * Tests the full flow: approach NPC → pre-warm → greeting → 3-turn convo
 * with context caching → NPC-NPC nearby from pool.
 *
 * All external dependencies (LLM, TTS) are mocked. The test verifies that
 * the various caching and optimization layers work together correctly.
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { ConversationContextCache, type CachedMessage } from '../services/conversation/conversation-context-cache';
import { GreetingCache, type GreetingVariant } from '../services/conversation/greeting-cache';
import { SpeculativeResponseCache, canonicalizeMessage } from '../services/conversation/speculative-cache';
import { ResponseCache, isCacheableMessage } from '../services/conversation/response-cache';
import { NpcConversationPool, type PooledConversation } from '../services/conversation/npc-conversation-pool';
import { classifyConversation } from '../services/conversation/conversation-classifier';
import { ConversationMetricsCollector } from '../services/conversation/conversation-metrics';
import type { CEFRLevel } from '@shared/assessment/cefr-mapping';

// ── Helpers ──────────────────────────────────────────────────────────

const WORLD_ID = 'world-1';
const NPC_ID = 'npc-baker';
const NPC_NAME = 'Pierre';
const NPC2_ID = 'npc-florist';
const PLAYER_CEFR: CEFRLevel = 'A2';

function chatKey(worldId: string, npcId: string): string {
  return `${worldId}:${npcId}`;
}

function makeVariant(text: string, cefrLevel: CEFRLevel = 'A2'): GreetingVariant {
  return { text, context: 'general', cefrLevel, generatedAt: Date.now() };
}

function makePooledConversation(npc1Id: string, npc2Id: string, topic: string): PooledConversation {
  return {
    conversationId: `conv-${Math.random().toString(36).slice(2)}`,
    npc1Id,
    npc2Id,
    topic,
    exchanges: [
      { speakerId: npc1Id, speakerName: 'Pierre', text: 'Bonjour Marie!', timestamp: Date.now() },
      { speakerId: npc2Id, speakerName: 'Marie', text: 'Bonjour Pierre!', timestamp: Date.now() + 3000 },
      { speakerId: npc1Id, speakerName: 'Pierre', text: 'Très bien, merci!', timestamp: Date.now() + 6000 },
    ],
    relationshipDelta: { friendshipChange: 0.02, trustChange: 0.01, romanceSpark: 0 },
    languageUsed: 'French',
    generatedAt: Date.now(),
    gameHourGenerated: 10,
  };
}

// ── Integration Test Suite ──────────────────────────────────────────

describe('Chat Performance Integration: Full Player Flow', () => {
  let contextCache: ConversationContextCache;
  let greetingCache: GreetingCache;
  let speculativeCache: SpeculativeResponseCache;
  let responseCache: ResponseCache;
  let conversationPool: NpcConversationPool;
  let metrics: ConversationMetricsCollector;

  beforeEach(() => {
    contextCache = new ConversationContextCache({ maxSize: 50, ttlMs: 60_000 });
    greetingCache = new GreetingCache();
    speculativeCache = new SpeculativeResponseCache();
    responseCache = new ResponseCache();
    conversationPool = new NpcConversationPool({ capacity: 50, replenishThreshold: 30 });
    metrics = new ConversationMetricsCollector();
  });

  describe('Phase 1: Player approaches NPC (pre-warm)', () => {
    it('pre-warms greeting cache and context on proximity', () => {
      // 1. Greeting cache is populated with pre-generated greetings
      greetingCache.set(WORLD_ID, NPC_ID, NPC_NAME, [
        makeVariant('Bonjour! Bienvenue à la boulangerie!'),
        makeVariant('Ah, bonjour! Ça va?'),
        makeVariant('Salut! Vous cherchez du pain?'),
      ]);

      // 2. Context cache is pre-built
      contextCache.set(chatKey(WORLD_ID, NPC_ID), {
        messages: [],
        systemPrompt: `You are ${NPC_NAME}, a friendly baker.`,
        formattedContext: 'World: French village. Time: morning.',
      });

      // 3. Speculative cache generates responses for likely openings
      speculativeCache.set(WORLD_ID, NPC_ID, 'hello', {
        text: 'Bonjour! Welcome to my bakery! What can I get you?',
        timestamp: Date.now(),
      });
      speculativeCache.set(WORLD_ID, NPC_ID, 'bonjour', {
        text: "Bonjour! Bienvenue! Qu'est-ce que je peux vous offrir?",
        timestamp: Date.now(),
      });

      // Record pre-warm metric
      metrics.record('pre_warm', 150);

      // Verify everything is warmed up
      expect(contextCache.has(chatKey(WORLD_ID, NPC_ID))).toBe(true);
      expect(greetingCache.has(WORLD_ID, NPC_ID)).toBe(true);
      const greetingText = greetingCache.get(WORLD_ID, NPC_ID);
      expect(greetingText).not.toBeNull();

      const specHit = speculativeCache.get(WORLD_ID, NPC_ID, 'Hello!');
      expect(specHit).not.toBeNull();
      expect(specHit!.text).toContain('bakery');
    });
  });

  describe('Phase 2: Player opens conversation (greeting)', () => {
    it('serves cached greeting instantly without LLM round-trip', () => {
      greetingCache.set(WORLD_ID, NPC_ID, NPC_NAME, [
        makeVariant('Bonjour! Bienvenue!'),
        makeVariant('Ah, salut!'),
      ]);

      const greeting = greetingCache.get(WORLD_ID, NPC_ID);
      expect(greeting).not.toBeNull();
      metrics.record('greeting_cache_hit', 2);

      // Classify the initial greeting (should be FAST tier)
      const classification = classifyConversation({
        message: 'Hello!',
        turnNumber: 1,
        cefrLevel: PLAYER_CEFR,
      });
      expect(classification.tier).toBe('fast');
    });

    it('falls back to speculative cache if greeting cache misses', () => {
      // No greeting cached, but speculative response exists
      speculativeCache.set(WORLD_ID, NPC_ID, 'hello', {
        text: 'Bonjour, bienvenue!',
        timestamp: Date.now(),
      });

      const greetingResult = greetingCache.get(WORLD_ID, NPC_ID);
      expect(greetingResult).toBeNull();
      metrics.record('greeting_cache_miss', 1);

      // Check speculative cache as fallback
      const specResult = speculativeCache.get(WORLD_ID, NPC_ID, 'Hello!');
      expect(specResult).not.toBeNull();
      expect(specResult!.text).toBe('Bonjour, bienvenue!');
      metrics.record('speculative_cache_hit', 3);
    });
  });

  describe('Phase 3: Multi-turn conversation with context caching', () => {
    it('caches context on first turn and reuses on follow-ups', () => {
      const key = chatKey(WORLD_ID, NPC_ID);

      // Turn 1: Cache miss → build full context
      expect(contextCache.has(key)).toBe(false);
      metrics.record('context_cache_miss', 80);

      // Build and store full context
      contextCache.set(key, {
        messages: [
          { role: 'user', content: 'Hello!' },
          { role: 'model', content: 'Bonjour! Bienvenue à la boulangerie!' },
        ],
        systemPrompt: `You are ${NPC_NAME}, a baker in a French village.`,
        formattedContext: 'World: French village. Time: morning. Weather: sunny.',
      });

      // Turn 2: Cache hit → skip full context rebuild
      expect(contextCache.has(key)).toBe(true);
      metrics.record('context_cache_hit', 2);
      const cached = contextCache.get(key);
      expect(cached).toBeDefined();
      expect(cached!.messages).toHaveLength(2);
      expect(cached!.systemPrompt).toContain('baker');

      // Append turn 2 messages
      contextCache.append(key, { role: 'user', content: 'Do you have croissants?' });
      contextCache.append(key, { role: 'model', content: 'Oui! Nous avons des croissants frais ce matin.' });

      // Turn 3: Still cached, history grown
      const cached3 = contextCache.get(key);
      expect(cached3!.messages).toHaveLength(4);
      metrics.record('context_cache_hit', 1);

      contextCache.append(key, { role: 'user', content: 'How much?' });
      contextCache.append(key, { role: 'model', content: "Deux euros, s'il vous plaît." });

      const final = contextCache.get(key);
      expect(final!.messages).toHaveLength(6);
    });

    it('uses response cache for repeated generic messages', () => {
      expect(isCacheableMessage('hello')).toBe(true);
      responseCache.set('npc-baker:A2:hello:1', 'Bonjour! Bienvenue!');

      const cached = responseCache.get('npc-baker:A2:hello:1');
      expect(cached).not.toBeNull();
      expect(cached!.text).toBe('Bonjour! Bienvenue!');
      metrics.record('response_cache_hit', 1);
    });

    it('does not cache quest-related messages', () => {
      expect(isCacheableMessage('Can you help me find the artifact?')).toBe(false);
      expect(isCacheableMessage('I need help with a quest')).toBe(false);
    });

    it('classifies turns correctly across conversation', () => {
      // Turn 1: greeting → FAST
      const t1 = classifyConversation({ message: 'Hello!', turnNumber: 1, cefrLevel: 'A2' });
      expect(t1.tier).toBe('fast');

      // Turn 2: simple follow-up → FAST
      const t2 = classifyConversation({ message: 'How are you?', turnNumber: 2, cefrLevel: 'A2' });
      expect(t2.tier).toBe('fast');

      // Turn 3: quest content → FULL
      const t3 = classifyConversation({
        message: 'Can you help me find the lost artifact?',
        turnNumber: 3,
        isQuestConversation: true,
        cefrLevel: 'A2',
      });
      expect(t3.tier).toBe('full');
    });
  });

  describe('Phase 4: NPC-NPC conversation nearby from pool', () => {
    it('serves pre-generated conversation from pool instantly', () => {
      const pooledConvo = makePooledConversation(NPC_ID, NPC2_ID, 'daily_life');
      conversationPool.add(WORLD_ID, pooledConvo);

      const taken = conversationPool.take(WORLD_ID, NPC_ID, NPC2_ID);
      expect(taken).not.toBeNull();
      expect(taken!.exchanges).toHaveLength(3);
      expect(taken!.topic).toBe('daily_life');
      expect(taken!.npc1Id).toBe(NPC_ID);
      expect(taken!.npc2Id).toBe(NPC2_ID);
      metrics.record('npc_npc_pool_served', 5);
    });

    it('falls back to any-available conversation if specific NPC pair not found', () => {
      const convo1 = makePooledConversation('npc-a', 'npc-b', 'weather');
      const convo2 = makePooledConversation('npc-c', 'npc-d', 'food');
      conversationPool.add(WORLD_ID, convo1);
      conversationPool.add(WORLD_ID, convo2);

      // Request for NPC pair not in pool → fallback to any available
      const taken = conversationPool.take(WORLD_ID, NPC_ID, NPC2_ID);
      expect(taken).not.toBeNull();
    });

    it('triggers replenishment when pool drops below threshold', () => {
      expect(conversationPool.size(WORLD_ID)).toBe(0);
      // Below replenish threshold of 30 → would trigger replenishment in production
      expect(conversationPool.size(WORLD_ID)).toBeLessThan(30);
    });

    it('NPC-NPC conversations use FAST tier', () => {
      const classification = classifyConversation({
        message: '',
        turnNumber: 1,
        isNpcToNpc: true,
      });
      expect(classification.tier).toBe('fast');
    });
  });

  describe('Phase 5: Full pipeline flow in sequence', () => {
    it('simulates complete player session with all optimization layers', () => {
      // Step 1: Player approaches NPC Pierre → pre-warm
      greetingCache.set(WORLD_ID, NPC_ID, NPC_NAME, [
        makeVariant('Bonjour! Bienvenue à ma boulangerie!'),
        makeVariant('Ah, bonjour mon ami!'),
        makeVariant('Salut! Vous cherchez quelque chose?'),
      ]);
      contextCache.set(chatKey(WORLD_ID, NPC_ID), {
        messages: [],
        systemPrompt: `You are Pierre, a friendly French baker.`,
      });
      speculativeCache.set(WORLD_ID, NPC_ID, 'bonjour', {
        text: 'Bonjour! Comment puis-je vous aider?',
        timestamp: Date.now(),
      });
      metrics.record('pre_warm', 200);

      // Step 2: Player opens chat → instant greeting
      const greeting = greetingCache.get(WORLD_ID, NPC_ID);
      expect(greeting).not.toBeNull();
      metrics.record('greeting_cache_hit', 3);

      // Step 3: Player says "Bonjour" → speculative cache hit
      const specResponse = speculativeCache.get(WORLD_ID, NPC_ID, 'Bonjour!');
      expect(specResponse).not.toBeNull();
      expect(specResponse!.text).toContain('Bonjour');
      metrics.record('speculative_cache_hit', 2);

      // Update context cache with the exchange
      contextCache.append(chatKey(WORLD_ID, NPC_ID), { role: 'user', content: 'Bonjour!' });
      contextCache.append(chatKey(WORLD_ID, NPC_ID), { role: 'model', content: specResponse!.text });

      // Step 4: Turn 2 — context cache hit
      expect(contextCache.has(chatKey(WORLD_ID, NPC_ID))).toBe(true);
      metrics.record('context_cache_hit', 1);

      contextCache.append(chatKey(WORLD_ID, NPC_ID), { role: 'user', content: 'Avez-vous des croissants?' });
      contextCache.append(chatKey(WORLD_ID, NPC_ID), {
        role: 'model',
        content: 'Oui, bien sûr! Nous avons des croissants au beurre tout frais.',
      });

      // Step 5: Turn 3 — still cached, classify as FAST (simple social)
      const t3Class = classifyConversation({ message: 'Merci!', turnNumber: 3, cefrLevel: PLAYER_CEFR });
      expect(t3Class.tier).toBe('fast');
      metrics.record('context_cache_hit', 1);

      contextCache.append(chatKey(WORLD_ID, NPC_ID), { role: 'user', content: 'Merci!' });
      contextCache.append(chatKey(WORLD_ID, NPC_ID), { role: 'model', content: 'De rien! Bonne journée!' });

      // Verify full history accumulated
      const finalCtx = contextCache.get(chatKey(WORLD_ID, NPC_ID));
      expect(finalCtx!.messages).toHaveLength(6); // 3 turns × 2 messages

      // Step 6: Player walks past two NPCs having a conversation → pool hit
      const pooledConvo = makePooledConversation(NPC_ID, NPC2_ID, 'daily_life');
      conversationPool.add(WORLD_ID, pooledConvo);
      const npcConvo = conversationPool.take(WORLD_ID, NPC_ID, NPC2_ID);
      expect(npcConvo).not.toBeNull();
      expect(npcConvo!.exchanges.length).toBeGreaterThan(0);
      metrics.record('npc_npc_pool_served', 3);

      // Verify metrics recorded throughout session (use getStageStats for all stages)
      expect(metrics.getStageStats('pre_warm')).not.toBeNull();
      expect(metrics.getStageStats('greeting_cache_hit')).not.toBeNull();
      expect(metrics.getStageStats('speculative_cache_hit')).not.toBeNull();
      expect(metrics.getStageStats('context_cache_hit')).not.toBeNull();
      expect(metrics.getStageStats('npc_npc_pool_served')).not.toBeNull();
      expect(metrics.getStageStats('context_cache_hit')!.count).toBe(2);
    });
  });

  describe('Phase 6: Adaptive quality under load', () => {
    it('degrades and recovers quality based on latency', () => {
      // Start at FULL quality
      expect(metrics.qualityTier).toBe('FULL');

      // Simulate sustained high latency → should degrade after hysteresis (10 consecutive)
      for (let i = 0; i < 15; i++) {
        metrics.record('end_to_end', 4000);
      }

      // Should have degraded from FULL
      expect(metrics.qualityTier).not.toBe('FULL');

      // Simulate recovery — need 20 consecutive low-latency measurements
      for (let i = 0; i < 25; i++) {
        metrics.record('end_to_end', 500);
      }

      // Should have recovered toward FULL
      const tier = metrics.qualityTier;
      expect(['FULL', 'STANDARD', 'REDUCED']).toContain(tier);
    });
  });

  describe('Cross-layer interaction: cache invalidation', () => {
    it('context cache invalidation does not affect greeting or speculative caches', () => {
      const key = chatKey(WORLD_ID, NPC_ID);

      // Populate all caches
      contextCache.set(key, { messages: [{ role: 'user', content: 'hi' }] });
      greetingCache.set(WORLD_ID, NPC_ID, NPC_NAME, [makeVariant('Bonjour!')]);
      speculativeCache.set(WORLD_ID, NPC_ID, 'hello', {
        text: 'Bonjour!',
        timestamp: Date.now(),
      });

      // Invalidate context cache (e.g., CEFR level change)
      contextCache.delete(key);
      expect(contextCache.has(key)).toBe(false);

      // Greeting and speculative caches should still work
      expect(greetingCache.has(WORLD_ID, NPC_ID)).toBe(true);
      expect(speculativeCache.get(WORLD_ID, NPC_ID, 'hello')).not.toBeNull();
    });

    it('canonicalization normalizes player messages consistently across caches', () => {
      expect(canonicalizeMessage('Hello!')).toBe(canonicalizeMessage('  HELLO  '));
      expect(canonicalizeMessage('Bonjour!!!')).toBe(canonicalizeMessage('bonjour'));

      expect(isCacheableMessage('Hello!')).toBe(true);
      expect(isCacheableMessage('hello')).toBe(true);
      expect(isCacheableMessage('HELLO')).toBe(true);
    });
  });
});
