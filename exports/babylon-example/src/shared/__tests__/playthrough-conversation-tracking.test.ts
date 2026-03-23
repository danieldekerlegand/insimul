/**
 * Tests for playthrough conversation tracking schema, types, and data structures.
 * Validates that conversation records capture all research-relevant data.
 */
import { describe, it, expect } from 'vitest';
import type {
  PlaythroughConversation,
  InsertPlaythroughConversation,
  ConversationTurn,
} from '../schema.js';

// ── ConversationTurn structure ───────────────────────────────────────────────

describe('ConversationTurn', () => {
  it('represents a player turn with target language usage', () => {
    const turn: ConversationTurn = {
      role: 'player',
      text: 'Bonjour, comment allez-vous?',
      timestamp: Date.now(),
      targetLanguageUsed: true,
      wordsUsed: ['bonjour', 'comment', 'allez-vous'],
    };
    expect(turn.role).toBe('player');
    expect(turn.targetLanguageUsed).toBe(true);
    expect(turn.wordsUsed).toHaveLength(3);
  });

  it('represents an NPC turn', () => {
    const turn: ConversationTurn = {
      role: 'npc',
      text: 'Je vais bien, merci!',
      timestamp: Date.now(),
    };
    expect(turn.role).toBe('npc');
    expect(turn.targetLanguageUsed).toBeUndefined();
  });

  it('represents a system turn', () => {
    const turn: ConversationTurn = {
      role: 'system',
      text: 'Grammar hint: use "vous" for formal address',
      timestamp: Date.now(),
      metadata: { hintType: 'grammar' },
    };
    expect(turn.role).toBe('system');
    expect(turn.metadata?.hintType).toBe('grammar');
  });

  it('includes grammar feedback', () => {
    const turn: ConversationTurn = {
      role: 'player',
      text: 'Je suis allé au marché',
      timestamp: Date.now(),
      targetLanguageUsed: true,
      grammarFeedback: {
        status: 'correct',
        errorCount: 0,
      },
    };
    expect(turn.grammarFeedback?.status).toBe('correct');
    expect(turn.grammarFeedback?.errorCount).toBe(0);
  });

  it('tracks grammar corrections', () => {
    const turn: ConversationTurn = {
      role: 'player',
      text: 'Je suis allée au marché',
      timestamp: Date.now(),
      targetLanguageUsed: true,
      grammarFeedback: {
        status: 'corrected',
        errorCount: 1,
      },
    };
    expect(turn.grammarFeedback?.status).toBe('corrected');
    expect(turn.grammarFeedback?.errorCount).toBe(1);
  });
});

// ── InsertPlaythroughConversation ────────────────────────────────────────────

describe('InsertPlaythroughConversation', () => {
  it('captures a complete conversation record for research', () => {
    const conversation: InsertPlaythroughConversation = {
      playthroughId: 'pt-123',
      userId: 'user-456',
      worldId: 'world-789',
      npcCharacterId: 'npc-001',
      npcCharacterName: 'Marie Dupont',
      playerCharacterId: 'player-001',
      turns: [
        { role: 'npc', text: 'Bonjour!', timestamp: 1000 },
        { role: 'player', text: 'Bonjour, Marie!', timestamp: 2000, targetLanguageUsed: true, wordsUsed: ['bonjour'] },
        { role: 'npc', text: 'Comment allez-vous?', timestamp: 3000 },
        { role: 'player', text: 'Je vais bien, merci.', timestamp: 4000, targetLanguageUsed: true, wordsUsed: ['je', 'vais', 'bien', 'merci'] },
      ],
      turnCount: 4,
      locationId: 'loc-cafe',
      locationName: 'Café de la Place',
      timestep: 42,
      initiatedBy: 'npc',
      targetLanguage: 'French',
      targetLanguagePercentage: 75,
      wordsUsed: ['bonjour', 'je', 'vais', 'bien', 'merci'],
      newWordsLearned: ['merci'],
      fluencyGained: 5,
      grammarErrorCount: 0,
      grammarCorrectCount: 2,
      activeQuestIds: ['quest-greet-npcs'],
      topics: ['greetings', 'small_talk'],
      durationMs: 30000,
    };

    expect(conversation.playthroughId).toBe('pt-123');
    expect(conversation.npcCharacterId).toBe('npc-001');
    expect(conversation.turns).toHaveLength(4);
    expect(conversation.turnCount).toBe(4);
    expect(conversation.targetLanguage).toBe('French');
    expect(conversation.targetLanguagePercentage).toBe(75);
    expect(conversation.wordsUsed).toHaveLength(5);
    expect(conversation.newWordsLearned).toEqual(['merci']);
    expect(conversation.topics).toContain('greetings');
  });

  it('supports minimal conversation records', () => {
    const minimal: InsertPlaythroughConversation = {
      playthroughId: 'pt-123',
      userId: 'user-456',
      worldId: 'world-789',
      npcCharacterId: 'npc-001',
    };

    expect(minimal.playthroughId).toBe('pt-123');
    expect(minimal.npcCharacterId).toBe('npc-001');
    expect(minimal.turns).toBeUndefined();
    expect(minimal.targetLanguage).toBeUndefined();
  });

  it('tracks player-initiated conversations', () => {
    const conv: InsertPlaythroughConversation = {
      playthroughId: 'pt-123',
      userId: 'user-456',
      worldId: 'world-789',
      npcCharacterId: 'npc-002',
      initiatedBy: 'player',
      turns: [
        { role: 'player', text: 'Excusez-moi, où est la bibliothèque?', timestamp: 1000, targetLanguageUsed: true },
        { role: 'npc', text: 'La bibliothèque est à gauche.', timestamp: 2000 },
      ],
      turnCount: 2,
    };

    expect(conv.initiatedBy).toBe('player');
    expect(conv.turnCount).toBe(2);
  });

  it('tracks ambient overheard conversations', () => {
    const conv: InsertPlaythroughConversation = {
      playthroughId: 'pt-123',
      userId: 'user-456',
      worldId: 'world-789',
      npcCharacterId: 'npc-003',
      initiatedBy: 'ambient',
      turns: [
        { role: 'npc', text: 'Le temps est beau aujourd\'hui.', timestamp: 1000 },
        { role: 'npc', text: 'Oui, c\'est magnifique!', timestamp: 2000 },
      ],
      turnCount: 2,
      newWordsLearned: ['magnifique'],
    };

    expect(conv.initiatedBy).toBe('ambient');
    expect(conv.newWordsLearned).toEqual(['magnifique']);
  });
});

// ── PlaythroughConversation (full type with id) ──────────────────────────────

describe('PlaythroughConversation', () => {
  it('includes id and timestamps from database', () => {
    const record: PlaythroughConversation = {
      id: 'conv-001',
      playthroughId: 'pt-123',
      userId: 'user-456',
      worldId: 'world-789',
      playerCharacterId: 'player-001',
      npcCharacterId: 'npc-001',
      npcCharacterName: 'Marie',
      turns: [],
      turnCount: 0,
      locationId: null,
      locationName: null,
      timestep: null,
      initiatedBy: null,
      targetLanguage: 'French',
      targetLanguagePercentage: 0,
      wordsUsed: [],
      newWordsLearned: [],
      fluencyGained: 0,
      grammarErrorCount: 0,
      grammarCorrectCount: 0,
      activeQuestIds: [],
      topics: [],
      durationMs: null,
      startedAt: new Date(),
      endedAt: null,
      createdAt: new Date(),
    };

    expect(record.id).toBe('conv-001');
    expect(record.createdAt).toBeInstanceOf(Date);
  });
});

// ── Research data validation ─────────────────────────────────────────────────

describe('Research data completeness', () => {
  it('captures all language learning metrics needed for research', () => {
    const conv: InsertPlaythroughConversation = {
      playthroughId: 'pt-research',
      userId: 'user-student',
      worldId: 'world-chitimacha',
      npcCharacterId: 'npc-elder',
      npcCharacterName: 'Elder Joseph',
      targetLanguage: 'Chitimacha',
      targetLanguagePercentage: 30,
      wordsUsed: ['wetkash', 'kuti', 'nakt'],
      newWordsLearned: ['nakt'],
      fluencyGained: 8,
      grammarErrorCount: 2,
      grammarCorrectCount: 3,
      turnCount: 6,
      turns: [
        { role: 'npc', text: 'Wetkash!', timestamp: 1000 },
        { role: 'player', text: 'Wetkash! Kuti...', timestamp: 2000, targetLanguageUsed: true, wordsUsed: ['wetkash', 'kuti'] },
        { role: 'npc', text: 'Good! Now try: nakt', timestamp: 3000 },
        { role: 'player', text: 'nakt', timestamp: 4000, targetLanguageUsed: true, wordsUsed: ['nakt'], grammarFeedback: { status: 'correct', errorCount: 0 } },
        { role: 'npc', text: 'Very good!', timestamp: 5000 },
        { role: 'player', text: 'Thank you, Elder', timestamp: 6000, targetLanguageUsed: false },
      ],
      topics: ['greetings', 'vocabulary_drill'],
      activeQuestIds: ['quest-learn-greetings'],
      durationMs: 45000,
    };

    // Verify all research-critical fields are present
    expect(conv.targetLanguage).toBeTruthy();
    expect(conv.targetLanguagePercentage).toBeGreaterThanOrEqual(0);
    expect(conv.wordsUsed!.length).toBeGreaterThan(0);
    expect(conv.newWordsLearned!.length).toBeGreaterThan(0);
    expect(conv.fluencyGained).toBeGreaterThan(0);
    expect(typeof conv.grammarErrorCount).toBe('number');
    expect(typeof conv.grammarCorrectCount).toBe('number');
    expect(conv.turnCount).toBe(conv.turns!.length);
    expect(conv.durationMs).toBeGreaterThan(0);

    // Verify turn-level detail
    const playerTurns = conv.turns!.filter(t => t.role === 'player');
    expect(playerTurns.length).toBe(3);
    const turnsWithTargetLang = playerTurns.filter(t => t.targetLanguageUsed);
    expect(turnsWithTargetLang.length).toBe(2);
  });

  it('can compute research metrics from conversation data', () => {
    const turns: ConversationTurn[] = [
      { role: 'npc', text: 'Hello!', timestamp: 1000 },
      { role: 'player', text: 'Bonjour!', timestamp: 2000, targetLanguageUsed: true, wordsUsed: ['bonjour'] },
      { role: 'npc', text: 'How are you?', timestamp: 3000 },
      { role: 'player', text: 'I am fine', timestamp: 4000, targetLanguageUsed: false },
      { role: 'npc', text: 'Try in French!', timestamp: 5000 },
      { role: 'player', text: 'Je vais bien', timestamp: 6000, targetLanguageUsed: true, wordsUsed: ['je', 'vais', 'bien'] },
    ];

    const playerTurns = turns.filter(t => t.role === 'player');
    const targetLangTurns = playerTurns.filter(t => t.targetLanguageUsed);
    const targetLangPercentage = Math.round((targetLangTurns.length / playerTurns.length) * 100);

    expect(targetLangPercentage).toBe(67); // 2 out of 3 player turns

    const allWords = playerTurns.flatMap(t => t.wordsUsed || []);
    expect(allWords).toEqual(['bonjour', 'je', 'vais', 'bien']);

    const durationMs = turns[turns.length - 1].timestamp - turns[0].timestamp;
    expect(durationMs).toBe(5000);
  });
});
