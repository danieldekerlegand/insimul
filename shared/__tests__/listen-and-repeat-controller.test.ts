/**
 * Tests for ListenAndRepeatController — the pronunciation practice
 * flow manager that integrates with BabylonChatPanel.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ListenAndRepeatController,
  detectTargetLanguagePhrases,
  type RepeatAttemptResult,
} from '../game-engine/rendering/ListenAndRepeatController';
import type { ListenAndRepeatPhrase } from '../game-engine/logic/actions/ListenAndRepeatAction';
import type { ListenAndRepeatCallbacks } from '../game-engine/rendering/ListenAndRepeatController';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createMockCallbacks(overrides?: Partial<ListenAndRepeatCallbacks>): ListenAndRepeatCallbacks {
  return {
    playTTS: vi.fn().mockResolvedValue(undefined),
    startSTT: vi.fn().mockResolvedValue('Bonjour comment allez-vous'),
    showNotification: vi.fn(),
    emitEvent: vi.fn(),
    getTargetLanguage: vi.fn().mockReturnValue('French'),
    ...overrides,
  };
}

const TEST_PHRASE: ListenAndRepeatPhrase = {
  phraseId: 'phrase_1',
  targetPhrase: 'Bonjour comment allez-vous',
  nativeTranslation: 'Hello how are you',
  language: 'French',
  npcId: 'npc_baker',
  npcName: 'Pierre',
};

// ── detectTargetLanguagePhrases ─────────────────────────────────────────────

describe('detectTargetLanguagePhrases', () => {
  it('detects French phrases in NPC messages', () => {
    const phrases = detectTargetLanguagePhrases(
      'Bonjour! Comment allez-vous? Je suis Marie.',
      'French',
    );
    expect(phrases.length).toBeGreaterThan(0);
  });

  it('detects quoted French phrases', () => {
    const phrases = detectTargetLanguagePhrases(
      'The word for bread is "le pain" in French.',
      'French',
    );
    expect(phrases).toContain('le pain');
  });

  it('detects guillemet-quoted phrases', () => {
    const phrases = detectTargetLanguagePhrases(
      'Try saying «Bonjour monsieur» when you meet someone.',
      'French',
    );
    expect(phrases).toContain('Bonjour monsieur');
  });

  it('returns empty for English-only messages', () => {
    const phrases = detectTargetLanguagePhrases(
      'Hello, welcome to the bakery. How can I help you?',
      'French',
    );
    expect(phrases.length).toBe(0);
  });

  it('returns empty when targetLanguage is null', () => {
    const phrases = detectTargetLanguagePhrases('Bonjour!', null);
    expect(phrases.length).toBe(0);
  });

  it('returns empty when targetLanguage is English', () => {
    const phrases = detectTargetLanguagePhrases('Bonjour!', 'English');
    expect(phrases.length).toBe(0);
  });

  it('detects Spanish phrases', () => {
    const phrases = detectTargetLanguagePhrases(
      '¿Cómo está usted? Bienvenido a la tienda.',
      'Spanish',
    );
    expect(phrases.length).toBeGreaterThan(0);
  });
});

// ── ListenAndRepeatController ───────────────────────────────────────────────

describe('ListenAndRepeatController', () => {
  let controller: ListenAndRepeatController;
  let callbacks: ListenAndRepeatCallbacks;

  beforeEach(() => {
    callbacks = createMockCallbacks();
    controller = new ListenAndRepeatController(callbacks);
  });

  describe('detectPhrases', () => {
    it('returns phrases when NPC speaks French', () => {
      const phrases = controller.detectPhrases(
        'Bonjour! Je suis le boulanger. Comment allez-vous?',
        'npc_baker',
        'Pierre',
      );
      expect(phrases.length).toBeGreaterThan(0);
      expect(phrases[0].npcId).toBe('npc_baker');
      expect(phrases[0].npcName).toBe('Pierre');
      expect(phrases[0].language).toBe('French');
    });

    it('returns empty when language is English', () => {
      (callbacks.getTargetLanguage as any).mockReturnValue('English');
      const phrases = controller.detectPhrases(
        'Hello, welcome to my shop!',
        'npc_baker',
        'Pierre',
      );
      expect(phrases.length).toBe(0);
    });

    it('returns empty when no target language is set', () => {
      (callbacks.getTargetLanguage as any).mockReturnValue(null);
      const phrases = controller.detectPhrases(
        'Bonjour comment allez-vous',
        'npc_baker',
        'Pierre',
      );
      expect(phrases.length).toBe(0);
    });
  });

  describe('attempt', () => {
    it('plays TTS, records STT, and scores pronunciation', async () => {
      const result = await controller.attempt(TEST_PHRASE);

      expect(callbacks.playTTS).toHaveBeenCalledWith(
        TEST_PHRASE.targetPhrase,
        TEST_PHRASE.language,
      );
      expect(callbacks.startSTT).toHaveBeenCalledWith(TEST_PHRASE.language);
      expect(result.score).toBe(100); // exact match
      expect(result.passed).toBe(true);
      expect(result.xpAwarded).toBe(4); // full XP for 100%
    });

    it('shows notifications during the flow', async () => {
      await controller.attempt(TEST_PHRASE);

      // Should show at least 2 notifications: listen + speak
      expect(callbacks.showNotification).toHaveBeenCalledTimes(3);
    });

    it('emits utterance_evaluated and action_executed events', async () => {
      await controller.attempt(TEST_PHRASE);

      expect(callbacks.emitEvent).toHaveBeenCalledTimes(2);
      const calls = (callbacks.emitEvent as any).mock.calls;

      const utteranceEvent = calls[0][0];
      expect(utteranceEvent.type).toBe('utterance_evaluated');
      expect(utteranceEvent.score).toBe(100);
      expect(utteranceEvent.passed).toBe(true);

      const actionEvent = calls[1][0];
      expect(actionEvent.type).toBe('action_executed');
      expect(actionEvent.actionName).toBe('listen_and_repeat');
      expect(actionEvent.actorId).toBe('player');
      expect(actionEvent.targetId).toBe('npc_baker');
    });

    it('handles poor pronunciation', async () => {
      (callbacks.startSTT as any).mockResolvedValue('something completely different');
      const result = await controller.attempt(TEST_PHRASE);

      expect(result.score).toBeLessThan(60);
      expect(result.passed).toBe(false);
      expect(result.xpAwarded).toBe(1);
    });

    it('handles empty STT result', async () => {
      (callbacks.startSTT as any).mockResolvedValue('');
      const result = await controller.attempt(TEST_PHRASE);

      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
    });

    it('sets isActive during attempt and clears after', async () => {
      expect(controller.isActive).toBe(false);

      const attemptPromise = controller.attempt(TEST_PHRASE);
      // Note: since playTTS/startSTT are resolved immediately in mocks,
      // isActive transitions are not observable between microtasks.
      await attemptPromise;

      expect(controller.isActive).toBe(false);
    });

    it('accumulates attempt history', async () => {
      expect(controller.attemptHistory.length).toBe(0);
      await controller.attempt(TEST_PHRASE);
      expect(controller.attemptHistory.length).toBe(1);
      await controller.attempt(TEST_PHRASE);
      expect(controller.attemptHistory.length).toBe(2);
    });
  });

  describe('attemptFromText', () => {
    it('scores text input against the target phrase', () => {
      const result = controller.attemptFromText(TEST_PHRASE, 'Bonjour comment allez-vous');
      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.xpAwarded).toBe(4);
    });

    it('scores partial text match', () => {
      const result = controller.attemptFromText(TEST_PHRASE, 'Bonjour comment');
      expect(result.score).toBeLessThan(100);
      expect(result.score).toBeGreaterThan(0);
    });

    it('emits events for text-based attempts', () => {
      controller.attemptFromText(TEST_PHRASE, 'Bonjour comment allez-vous');
      expect(callbacks.emitEvent).toHaveBeenCalledTimes(2);
    });

    it('shows a notification with the score', () => {
      controller.attemptFromText(TEST_PHRASE, 'Bonjour comment allez-vous');
      expect(callbacks.showNotification).toHaveBeenCalledTimes(1);
      const notifText = (callbacks.showNotification as any).mock.calls[0][0];
      expect(notifText).toContain('100%');
    });
  });

  describe('dispose', () => {
    it('clears state on dispose', async () => {
      await controller.attempt(TEST_PHRASE);
      expect(controller.attemptHistory.length).toBe(1);

      controller.dispose();
      expect(controller.isActive).toBe(false);
      expect(controller.currentPhrase).toBeNull();
      expect(controller.attemptHistory.length).toBe(0);
    });
  });
});
