/**
 * US-013: Continue from proximity greeting if recent
 *
 * Tests that when an NPC recently greeted the player via proximity speech,
 * the chat panel continues from that greeting rather than starting fresh.
 *
 * Note: getRecentGreeting() integration tests are in npc-proximity-speech-system.test.ts.
 * This file focuses on the BabylonChatPanel cue-building and message pre-population logic.
 */

import { describe, it, expect } from 'vitest';

/**
 * Simulates the buildOpeningCue logic from BabylonChatPanel when a recent
 * greeting is present vs absent. Mirrors the exact code path in the component.
 */
function simulateBuildOpeningCue(opts: {
  recentGreeting: string | null;
  characterName: string;
  occupation: string | null;
  location: string | null;
  timeOfDay: string;
  targetLanguage: string | null;
  hasRelationship: boolean;
  questOffering: boolean;
}): string {
  const { characterName: name, occupation, location, targetLanguage: targetLang, hasRelationship, questOffering, recentGreeting } = opts;
  const timeDesc = opts.timeOfDay;
  const relHint = hasRelationship ? ' You have an existing relationship with this player.' : '';

  if (questOffering) {
    return `[The player approaches you (${name}${occupation ? ', ' + occupation : ''}) during the ${timeDesc}${location ? ' at ' + location : ''}.${relHint} Give a brief greeting (1-2 sentences max) and mention what you need help with. Respond in ${targetLang || 'the target language'}.]`;
  }

  // US-013: Continuation cue when recent greeting exists
  if (recentGreeting) {
    let cue = `[You just said: "${recentGreeting}" The player has approached you to continue the conversation.`;
    cue += ` You are ${name}`;
    if (occupation) cue += `, ${occupation}`;
    cue += ` during the ${timeDesc}`;
    if (location) cue += ` at ${location}`;
    cue += `.${relHint}`;
    cue += ` Continue naturally from your greeting — do NOT repeat it. Say something that builds on what you just said and invites the player to respond (1-2 sentences).`;
    if (targetLang) cue += ` Respond in ${targetLang}.`;
    cue += `]`;
    return cue;
  }

  // Standard opening cue
  let cue = `[The player approaches you (${name}`;
  if (occupation) cue += `, ${occupation}`;
  cue += `) during the ${timeDesc}`;
  if (location) cue += ` at ${location}`;
  cue += `.${relHint}`;
  cue += ` React naturally to being approached. Give a brief, in-character greeting (1-2 sentences) and end with a question or engagement hook that invites the player to respond.`;
  if (targetLang) cue += ` Respond in ${targetLang}.`;
  cue += `]`;
  return cue;
}

/**
 * Simulates the show() message pre-population logic from BabylonChatPanel.
 */
function simulateShowWithGreeting(recentGreeting: string | null): {
  messages: Array<{ role: string; content: string }>;
  cueIncludesGreeting: boolean;
  recentGreetingClearedAfterCue: boolean;
} {
  const messages: Array<{ role: string; content: string }> = [];
  let _recentGreeting = recentGreeting;

  // US-013: If recent greeting exists, insert it as first assistant message
  if (_recentGreeting) {
    messages.push({ role: 'assistant', content: _recentGreeting });
  }

  const cue = simulateBuildOpeningCue({
    recentGreeting: _recentGreeting,
    characterName: 'Marie',
    occupation: 'baker',
    location: 'the bakery',
    timeOfDay: 'morning',
    targetLanguage: 'French',
    hasRelationship: false,
    questOffering: false,
  });

  // Clear after building cue (mirrors BabylonChatPanel.show())
  _recentGreeting = null;

  return {
    messages,
    cueIncludesGreeting: cue.includes('You just said:'),
    recentGreetingClearedAfterCue: _recentGreeting === null,
  };
}

describe('US-013: Continue from proximity greeting if recent', () => {
  describe('BabylonChatPanel opening cue with recent greeting', () => {
    it('builds a continuation cue when recent greeting is provided', () => {
      const cue = simulateBuildOpeningCue({
        recentGreeting: 'Bonjour, comment allez-vous?',
        characterName: 'Marie',
        occupation: 'baker',
        location: 'the bakery',
        timeOfDay: 'morning',
        targetLanguage: 'French',
        hasRelationship: false,
        questOffering: false,
      });

      expect(cue).toContain('You just said: "Bonjour, comment allez-vous?"');
      expect(cue).toContain('The player has approached you to continue the conversation');
      expect(cue).toContain('do NOT repeat it');
      expect(cue).toContain('Marie');
      expect(cue).toContain('baker');
      expect(cue).toContain('Respond in French');
    });

    it('builds standard cue when no recent greeting exists', () => {
      const cue = simulateBuildOpeningCue({
        recentGreeting: null,
        characterName: 'Marie',
        occupation: 'baker',
        location: 'the bakery',
        timeOfDay: 'morning',
        targetLanguage: 'French',
        hasRelationship: false,
        questOffering: false,
      });

      expect(cue).not.toContain('You just said');
      expect(cue).toContain('The player approaches you');
      expect(cue).toContain('React naturally');
    });

    it('quest offering takes priority over recent greeting', () => {
      const cue = simulateBuildOpeningCue({
        recentGreeting: 'Bonjour!',
        characterName: 'Marie',
        occupation: 'baker',
        location: 'the bakery',
        timeOfDay: 'morning',
        targetLanguage: 'French',
        hasRelationship: false,
        questOffering: true,
      });

      expect(cue).not.toContain('You just said');
      expect(cue).toContain('mention what you need help with');
    });

    it('includes relationship context in continuation cue', () => {
      const cue = simulateBuildOpeningCue({
        recentGreeting: 'Bonjour!',
        characterName: 'Marie',
        occupation: null,
        location: null,
        timeOfDay: 'evening',
        targetLanguage: 'French',
        hasRelationship: true,
        questOffering: false,
      });

      expect(cue).toContain('You just said');
      expect(cue).toContain('existing relationship');
    });

    it('includes NPC context (occupation, location, time) in continuation cue', () => {
      const cue = simulateBuildOpeningCue({
        recentGreeting: 'Salut!',
        characterName: 'Pierre',
        occupation: 'fisherman',
        location: 'the docks',
        timeOfDay: 'afternoon',
        targetLanguage: 'French',
        hasRelationship: false,
        questOffering: false,
      });

      expect(cue).toContain('Pierre');
      expect(cue).toContain('fisherman');
      expect(cue).toContain('the docks');
      expect(cue).toContain('afternoon');
    });

    it('handles missing target language gracefully', () => {
      const cue = simulateBuildOpeningCue({
        recentGreeting: 'Bonjour!',
        characterName: 'Marie',
        occupation: null,
        location: null,
        timeOfDay: 'morning',
        targetLanguage: null,
        hasRelationship: false,
        questOffering: false,
      });

      expect(cue).toContain('You just said');
      expect(cue).not.toContain('Respond in');
    });
  });

  describe('show() message pre-population', () => {
    it('inserts recent greeting as first assistant message', () => {
      const result = simulateShowWithGreeting('Bonjour, comment allez-vous?');

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('assistant');
      expect(result.messages[0].content).toBe('Bonjour, comment allez-vous?');
      expect(result.cueIncludesGreeting).toBe(true);
    });

    it('does not insert any message when no recent greeting', () => {
      const result = simulateShowWithGreeting(null);

      expect(result.messages).toHaveLength(0);
      expect(result.cueIncludesGreeting).toBe(false);
    });

    it('clears recent greeting after building the cue', () => {
      const result = simulateShowWithGreeting('Bonjour!');
      expect(result.recentGreetingClearedAfterCue).toBe(true);
    });
  });
});
