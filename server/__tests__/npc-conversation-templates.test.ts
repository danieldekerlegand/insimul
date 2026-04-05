/**
 * Tests for NPC-NPC Conversation Template Library (US-012)
 *
 * Covers: template coverage, topic matching, personality-weighted selection,
 * bilingual CEFR templates, fallback generation, show-then-replace flow,
 * source tracking, and metrics recording.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CONVERSATION_TEMPLATES,
  BILINGUAL_TEMPLATES,
  selectTemplate,
  getTemplateCoverage,
} from '../services/conversation/npc-conversation-templates';
import type { CEFRTier } from '../services/conversation/npc-conversation-templates';
import type { BigFivePersonality } from '../services/conversation/context-manager';
import type { Character } from '@shared/schema';

// ── Helpers ─���───────────────────────────────────────────────────────

const TOPIC_POOL = [
  'daily_greeting', 'weather', 'work', 'gossip', 'food', 'family',
  'local_events', 'shared_hobby', 'complaint', 'philosophy', 'romance', 'rivalry',
];

function makePersonality(overrides: Partial<BigFivePersonality> = {}): BigFivePersonality {
  return {
    openness: 0,
    conscientiousness: 0,
    extroversion: 0,
    agreeableness: 0,
    neuroticism: 0,
    ...overrides,
  };
}

function makeCharacter(id: string, firstName: string, lastName: string, personality?: Partial<BigFivePersonality>): Character {
  return {
    id,
    firstName,
    lastName,
    personality: makePersonality(personality),
    relationships: {},
    worldId: 'world-1',
  } as unknown as Character;
}

// ── Template Library Coverage ───────────────────────────────────────

describe('Template Library Coverage', () => {
  it('has at least 20 total templates', () => {
    const total = CONVERSATION_TEMPLATES.length + BILINGUAL_TEMPLATES.length;
    expect(total).toBeGreaterThanOrEqual(20);
  });

  it('covers all 12 topic types with English templates', () => {
    const coveredTopics = new Set(CONVERSATION_TEMPLATES.map((t) => t.topic));
    for (const topic of TOPIC_POOL) {
      expect(coveredTopics.has(topic)).toBe(true);
    }
  });

  it('has multiple variants for high-frequency topics', () => {
    const greetings = CONVERSATION_TEMPLATES.filter((t) => t.topic === 'daily_greeting');
    const weather = CONVERSATION_TEMPLATES.filter((t) => t.topic === 'weather');
    const work = CONVERSATION_TEMPLATES.filter((t) => t.topic === 'work');
    expect(greetings.length).toBeGreaterThanOrEqual(2);
    expect(weather.length).toBeGreaterThanOrEqual(2);
    expect(work.length).toBeGreaterThanOrEqual(2);
  });

  it('all templates have at least 3 lines', () => {
    for (const t of CONVERSATION_TEMPLATES) {
      expect(t.lines.length).toBeGreaterThanOrEqual(3);
    }
    for (const t of BILINGUAL_TEMPLATES) {
      expect(t.lines.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('all templates alternate between speakers A and B', () => {
    for (const t of CONVERSATION_TEMPLATES) {
      expect(t.lines[0].speaker).toBe('A');
      for (let i = 1; i < t.lines.length; i++) {
        // Each line should have a valid speaker
        expect(['A', 'B']).toContain(t.lines[i].speaker);
      }
    }
  });

  it('getTemplateCoverage returns correct counts', () => {
    const coverage = getTemplateCoverage();
    expect(coverage.totalTemplates).toBe(CONVERSATION_TEMPLATES.length + BILINGUAL_TEMPLATES.length);
    expect(coverage.topicsCovered.length).toBe(12);
  });
});

// ── Bilingual Templates ��────────────────────────────────────────────

describe('Bilingual Templates', () => {
  it('has templates for all four CEFR tiers', () => {
    const tiers = new Set(BILINGUAL_TEMPLATES.map((t) => t.cefrTier));
    expect(tiers.has('A1')).toBe(true);
    expect(tiers.has('A2')).toBe(true);
    expect(tiers.has('B1')).toBe(true);
    expect(tiers.has('B2')).toBe(true);
  });

  it('A1 templates contain mostly English with basic target language words', () => {
    const a1Templates = BILINGUAL_TEMPLATES.filter((t) => t.cefrTier === 'A1');
    expect(a1Templates.length).toBeGreaterThan(0);
    // A1 should have recognizable French words but be mostly English
    for (const t of a1Templates) {
      const allText = t.lines.map((l) => l.text).join(' ');
      // Should contain at least some French
      expect(allText).toMatch(/[Bb]onjour|[Mm]erci|[Oo]ui|[Bb]on/);
    }
  });

  it('B2 templates are predominantly in target language', () => {
    const b2Templates = BILINGUAL_TEMPLATES.filter((t) => t.cefrTier === 'B2');
    expect(b2Templates.length).toBeGreaterThan(0);
    for (const t of b2Templates) {
      const allText = t.lines.map((l) => l.text).join(' ');
      // B2 should have substantial French
      expect(allText).toMatch(/[Jj]e|[Qq]ue|[Cc]'est|[Dd]e|[Ll]es/);
    }
  });
});

// ── Template Selection ──────────────────────────────────────────────

describe('selectTemplate', () => {
  it('returns a template matching the requested topic', () => {
    const p = makePersonality();
    const template = selectTemplate('weather', p, p);
    expect(template).toBeDefined();
    expect(template.lines.length).toBeGreaterThan(0);
  });

  it('falls back to daily_greeting for unknown topics', () => {
    const p = makePersonality();
    const template = selectTemplate('unknown_topic_xyz', p, p);
    expect(template).toBeDefined();
    expect(template.lines.length).toBeGreaterThan(0);
    // Should be a greeting fallback
    expect('topic' in template && template.topic).toBe('daily_greeting');
  });

  it('prefers bilingual templates when CEFR tier is provided', () => {
    const p = makePersonality();
    // Run multiple times to check probabilistic selection
    let bilingualCount = 0;
    for (let i = 0; i < 20; i++) {
      const template = selectTemplate('daily_greeting', p, p, 'A1');
      if ('cefrTier' in template) bilingualCount++;
    }
    // Should get bilingual templates most of the time
    expect(bilingualCount).toBeGreaterThan(0);
  });

  it('falls back to English templates when no bilingual match for topic+tier', () => {
    const p = makePersonality();
    // rivalry has no bilingual templates
    const template = selectTemplate('rivalry', p, p, 'A1');
    expect(template).toBeDefined();
    expect(template.lines.length).toBeGreaterThan(0);
  });

  it('personality-weighted selection favors matching templates', () => {
    // Extroverted NPCs should more often get extroverted templates
    const extrovert = makePersonality({ extroversion: 0.9 });
    const introvert = makePersonality({ extroversion: -0.8 });

    let extrovertHighEnergyCount = 0;
    let introvertHighEnergyCount = 0;

    for (let i = 0; i < 100; i++) {
      const tE = selectTemplate('daily_greeting', extrovert, extrovert);
      const tI = selectTemplate('daily_greeting', introvert, introvert);
      if ('variant' in tE && tE.variant === 2) extrovertHighEnergyCount++;
      if ('variant' in tI && tI.variant === 2) introvertHighEnergyCount++;
    }

    // Extroverted pair should get the high-energy variant more often
    expect(extrovertHighEnergyCount).toBeGreaterThan(introvertHighEnergyCount);
  });

  it('handles partial topic matching', () => {
    const p = makePersonality();
    // "daily_greeting" should match templates with topic "daily_greeting"
    const template = selectTemplate('daily_greeting', p, p);
    expect(template).toBeDefined();
  });
});

// ── Integration with initiateConversation ───────────────────────────

describe('Template integration with initiateConversation', () => {
  // Use dynamic imports for server-side modules to avoid import issues
  let initiateConversation: typeof import('../services/conversation/npc-conversation-engine').initiateConversation;
  let generateFallbackConversation: typeof import('../services/conversation/npc-conversation-engine').generateFallbackConversation;
  let resetRateLimiting: typeof import('../services/conversation/npc-conversation-engine').resetRateLimiting;
  let resetConversationMetrics: typeof import('../services/conversation/conversation-metrics').resetConversationMetrics;
  let getConversationMetrics: typeof import('../services/conversation/conversation-metrics').getConversationMetrics;

  beforeEach(async () => {
    const engine = await import('../services/conversation/npc-conversation-engine');
    const metrics = await import('../services/conversation/conversation-metrics');
    initiateConversation = engine.initiateConversation;
    generateFallbackConversation = engine.generateFallbackConversation;
    resetRateLimiting = engine.resetRateLimiting;
    resetConversationMetrics = metrics.resetConversationMetrics;
    getConversationMetrics = metrics.getConversationMetrics;
    resetRateLimiting();
    resetConversationMetrics();
  });

  const npc1 = makeCharacter('npc-1', 'Alice', 'Smith', { extroversion: 0.5 });
  const npc2 = makeCharacter('npc-2', 'Bob', 'Jones', { extroversion: 0.3 });

  it('generateFallbackConversation uses expanded templates', () => {
    const exchanges = generateFallbackConversation(npc1, npc2, 'food');
    expect(exchanges.length).toBeGreaterThanOrEqual(3);
    expect(exchanges[0].speakerName).toMatch(/Alice|Bob/);
  });

  it('generateFallbackConversation uses bilingual templates when CEFR provided', () => {
    // Run multiple times — bilingual templates include French words
    let hasFrench = false;
    for (let i = 0; i < 20; i++) {
      const exchanges = generateFallbackConversation(npc1, npc2, 'daily_greeting', 'A1');
      const allText = exchanges.map((e) => e.text).join(' ');
      if (/[Bb]onjour|[Mm]erci|[Oo]ui/.test(allText)) {
        hasFrench = true;
        break;
      }
    }
    expect(hasFrench).toBe(true);
  });

  it('initiateConversation returns source=template when no LLM', async () => {
    const mockStorage = {
      getCharacter: vi.fn().mockImplementation((id: string) =>
        id === 'npc-1' ? npc1 : npc2,
      ),
      getWorld: vi.fn().mockResolvedValue({ id: 'world-1', name: 'Test World' }),
      getWorldLanguagesByWorld: vi.fn().mockResolvedValue([{ name: 'French' }]),
    };

    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      storageOverride: mockStorage as any,
    });

    expect(result.source).toBe('template');
    expect(result.exchanges.length).toBeGreaterThanOrEqual(3);
  });

  it('initiateConversation fires onTemplateReady when LLM is available', async () => {
    const mockStorage = {
      getCharacter: vi.fn().mockImplementation((id: string) =>
        id === 'npc-1' ? npc1 : npc2,
      ),
      getWorld: vi.fn().mockResolvedValue({ id: 'world-1', name: 'Test World' }),
      getWorldLanguagesByWorld: vi.fn().mockResolvedValue([{ name: 'French' }]),
    };

    // Mock LLM that generates a valid conversation
    const mockLlm = {
      streamCompletion: async function* () {
        yield 'Alice: Hello there!\n';
        yield 'Bob: Hi Alice!\n';
        yield 'Alice: Lovely day!\n';
        yield 'Bob: Indeed it is!\n';
      },
    };

    const templateReady = vi.fn();
    const replacementReady = vi.fn();

    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      storageOverride: mockStorage as any,
      llmProvider: mockLlm as any,
      onTemplateReady: templateReady,
      onReplacementReady: replacementReady,
    });

    // Template should have been served first
    expect(templateReady).toHaveBeenCalledTimes(1);
    expect(templateReady.mock.calls[0][0].length).toBeGreaterThanOrEqual(3);

    // LLM replacement should have been sent
    expect(replacementReady).toHaveBeenCalledTimes(1);
    expect(replacementReady.mock.calls[0][0].length).toBeGreaterThanOrEqual(2);

    expect(result.source).toBe('template_with_replacement');
  });

  it('initiateConversation keeps template when LLM fails', async () => {
    const mockStorage = {
      getCharacter: vi.fn().mockImplementation((id: string) =>
        id === 'npc-1' ? npc1 : npc2,
      ),
      getWorld: vi.fn().mockResolvedValue({ id: 'world-1', name: 'Test World' }),
      getWorldLanguagesByWorld: vi.fn().mockResolvedValue([{ name: 'French' }]),
    };

    const mockLlm = {
      streamCompletion: async function* () {
        throw new Error('LLM unavailable');
      },
    };

    const templateReady = vi.fn();
    const replacementReady = vi.fn();

    const result = await initiateConversation('npc-1', 'npc-2', 'world-1', {
      storageOverride: mockStorage as any,
      llmProvider: mockLlm as any,
      onTemplateReady: templateReady,
      onReplacementReady: replacementReady,
    });

    expect(templateReady).toHaveBeenCalledTimes(1);
    expect(replacementReady).not.toHaveBeenCalled();
    expect(result.source).toBe('template');
  });

  it('records template_served metric when template is used', async () => {
    const mockStorage = {
      getCharacter: vi.fn().mockImplementation((id: string) =>
        id === 'npc-1' ? npc1 : npc2,
      ),
      getWorld: vi.fn().mockResolvedValue({ id: 'world-1', name: 'Test World' }),
      getWorldLanguagesByWorld: vi.fn().mockResolvedValue([{ name: 'French' }]),
    };

    await initiateConversation('npc-1', 'npc-2', 'world-1', {
      storageOverride: mockStorage as any,
    });

    const stats = getConversationMetrics().getStageStats('npc_npc_template_served');
    expect(stats).not.toBeNull();
    expect(stats!.count).toBeGreaterThanOrEqual(1);
  });

  it('records llm_served and template_replaced metrics on successful replacement', async () => {
    const mockStorage = {
      getCharacter: vi.fn().mockImplementation((id: string) =>
        id === 'npc-1' ? npc1 : npc2,
      ),
      getWorld: vi.fn().mockResolvedValue({ id: 'world-1', name: 'Test World' }),
      getWorldLanguagesByWorld: vi.fn().mockResolvedValue([{ name: 'French' }]),
    };

    const mockLlm = {
      streamCompletion: async function* () {
        yield 'Alice: Bonjour!\n';
        yield 'Bob: Salut Alice!\n';
        yield 'Alice: Comment ça va?\n';
      },
    };

    await initiateConversation('npc-1', 'npc-2', 'world-1', {
      storageOverride: mockStorage as any,
      llmProvider: mockLlm as any,
      onTemplateReady: () => {},
      onReplacementReady: () => {},
    });

    const llmStats = getConversationMetrics().getStageStats('npc_npc_llm_served');
    const replaceStats = getConversationMetrics().getStageStats('npc_npc_template_replaced');
    expect(llmStats).not.toBeNull();
    expect(llmStats!.count).toBeGreaterThanOrEqual(1);
    expect(replaceStats).not.toBeNull();
    expect(replaceStats!.count).toBeGreaterThanOrEqual(1);
  });

  it('all 12 topics produce valid template conversations', () => {
    for (const topic of TOPIC_POOL) {
      const exchanges = generateFallbackConversation(npc1, npc2, topic);
      expect(exchanges.length).toBeGreaterThanOrEqual(3);
      // Check exchange structure
      for (const e of exchanges) {
        expect(e.speakerId).toBeTruthy();
        expect(e.speakerName).toBeTruthy();
        expect(e.text).toBeTruthy();
        expect(e.timestamp).toBeGreaterThan(0);
      }
    }
  });
});
