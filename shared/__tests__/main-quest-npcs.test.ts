/**
 * Tests for Main Quest NPC definitions and utility functions.
 */
import { describe, it, expect } from 'vitest';
import {
  MAIN_QUEST_NPC_DEFINITIONS,
  MAIN_QUEST_NPC_TAG,
  isMainQuestNPC,
  getMainQuestRole,
  getMainQuestNPCDefinition,
  isNPCActiveForChapter,
  type MainQuestNPCRole,
} from '../quest/main-quest-npcs';

describe('MAIN_QUEST_NPC_DEFINITIONS', () => {
  it('defines exactly 5 writer associates', () => {
    expect(MAIN_QUEST_NPC_DEFINITIONS).toHaveLength(5);
  });

  it('has unique roles for each NPC', () => {
    const roles = MAIN_QUEST_NPC_DEFINITIONS.map(d => d.role);
    expect(new Set(roles).size).toBe(5);
  });

  it('includes all expected roles', () => {
    const roles = MAIN_QUEST_NPC_DEFINITIONS.map(d => d.role);
    expect(roles).toContain('the_editor');
    expect(roles).toContain('the_neighbor');
    expect(roles).toContain('the_patron');
    expect(roles).toContain('the_scholar');
    expect(roles).toContain('the_confidant');
  });

  it('each NPC has valid personality traits (Big Five)', () => {
    for (const def of MAIN_QUEST_NPC_DEFINITIONS) {
      expect(def.personality).toHaveProperty('openness');
      expect(def.personality).toHaveProperty('conscientiousness');
      expect(def.personality).toHaveProperty('extroversion');
      expect(def.personality).toHaveProperty('agreeableness');
      expect(def.personality).toHaveProperty('neuroticism');
      // Values between -1 and 1
      for (const val of Object.values(def.personality)) {
        expect(val).toBeGreaterThanOrEqual(-1);
        expect(val).toBeLessThanOrEqual(1);
      }
    }
  });

  it('each NPC has at least one active chapter', () => {
    for (const def of MAIN_QUEST_NPC_DEFINITIONS) {
      expect(def.activeChapterIds.length).toBeGreaterThan(0);
    }
  });

  it('each NPC has chapter hints for all active chapters', () => {
    for (const def of MAIN_QUEST_NPC_DEFINITIONS) {
      for (const chapterId of def.activeChapterIds) {
        expect(def.chapterHints).toHaveProperty(chapterId);
        expect(def.chapterHints[chapterId].length).toBeGreaterThan(0);
      }
    }
  });

  it('chapter coverage spans all 6 chapters', () => {
    const allChapterIds = new Set<string>();
    for (const def of MAIN_QUEST_NPC_DEFINITIONS) {
      for (const id of def.activeChapterIds) {
        allChapterIds.add(id);
      }
    }
    expect(allChapterIds).toContain('ch1_arrival');
    expect(allChapterIds).toContain('ch2_settling_in');
    expect(allChapterIds).toContain('ch3_making_friends');
    expect(allChapterIds).toContain('ch4_the_wider_world');
    expect(allChapterIds).toContain('ch5_the_scholar');
    expect(allChapterIds).toContain('ch6_fluent_citizen');
  });

  it('each NPC has a non-empty conversation context', () => {
    for (const def of MAIN_QUEST_NPC_DEFINITIONS) {
      expect(def.conversationContext.length).toBeGreaterThan(20);
    }
  });

  it('each NPC has an occupation', () => {
    for (const def of MAIN_QUEST_NPC_DEFINITIONS) {
      expect(def.occupation).toBeTruthy();
    }
  });
});

describe('isMainQuestNPC', () => {
  it('returns true for characters with mainQuestRole in generationConfig', () => {
    expect(isMainQuestNPC({ generationConfig: { mainQuestRole: 'the_editor' } })).toBe(true);
  });

  it('returns false for regular characters', () => {
    expect(isMainQuestNPC({ generationConfig: {} })).toBe(false);
    expect(isMainQuestNPC({ generationConfig: null })).toBe(false);
    expect(isMainQuestNPC({})).toBe(false);
  });
});

describe('getMainQuestRole', () => {
  it('returns the role from generationConfig', () => {
    expect(getMainQuestRole({ generationConfig: { mainQuestRole: 'the_patron' } })).toBe('the_patron');
  });

  it('returns null for non-main-quest characters', () => {
    expect(getMainQuestRole({ generationConfig: {} })).toBeNull();
    expect(getMainQuestRole({})).toBeNull();
  });
});

describe('getMainQuestNPCDefinition', () => {
  it('returns the definition for a known role', () => {
    const def = getMainQuestNPCDefinition({ generationConfig: { mainQuestRole: 'the_scholar' } });
    expect(def).not.toBeNull();
    expect(def!.role).toBe('the_scholar');
    expect(def!.occupation).toBe('Professor');
  });

  it('returns null for unknown roles', () => {
    expect(getMainQuestNPCDefinition({ generationConfig: { mainQuestRole: 'unknown' } })).toBeNull();
  });
});

describe('isNPCActiveForChapter', () => {
  const editorChar = { generationConfig: { mainQuestRole: 'the_editor' as MainQuestNPCRole } };
  const confidantChar = { generationConfig: { mainQuestRole: 'the_confidant' as MainQuestNPCRole } };

  it('returns true when NPC is active for the given chapter', () => {
    expect(isNPCActiveForChapter(editorChar, 'ch1_arrival')).toBe(true);
    expect(isNPCActiveForChapter(editorChar, 'ch2_settling_in')).toBe(true);
  });

  it('returns false when NPC is not active for the given chapter', () => {
    expect(isNPCActiveForChapter(editorChar, 'ch5_the_scholar')).toBe(false);
  });

  it('confidant is active for chapters 5-6', () => {
    expect(isNPCActiveForChapter(confidantChar, 'ch5_the_scholar')).toBe(true);
    expect(isNPCActiveForChapter(confidantChar, 'ch6_fluent_citizen')).toBe(true);
    expect(isNPCActiveForChapter(confidantChar, 'ch1_arrival')).toBe(false);
  });

  it('returns false for non-main-quest characters', () => {
    expect(isNPCActiveForChapter({}, 'ch1_arrival')).toBe(false);
  });
});

describe('MAIN_QUEST_NPC_TAG', () => {
  it('is defined as a string', () => {
    expect(typeof MAIN_QUEST_NPC_TAG).toBe('string');
    expect(MAIN_QUEST_NPC_TAG).toBe('main_quest_npc');
  });
});
