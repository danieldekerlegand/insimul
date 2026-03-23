import { describe, it, expect } from 'vitest';
import {
  VALID_OBJECTIVE_TYPES,
  normalizeObjectiveType,
  ACHIEVABLE_OBJECTIVE_TYPES,
} from '../quest-objective-types';
import { MAIN_QUEST_CHAPTERS } from '../quest/main-quest-chapters';

describe('collect_text objective type', () => {
  it('is a valid canonical objective type', () => {
    expect(VALID_OBJECTIVE_TYPES.has('collect_text')).toBe(true);
  });

  it('has a definition in ACHIEVABLE_OBJECTIVE_TYPES', () => {
    const def = ACHIEVABLE_OBJECTIVE_TYPES.find(t => t.type === 'collect_text');
    expect(def).toBeDefined();
    expect(def!.countable).toBe(true);
    expect(def!.requiresTarget).toBe('none');
  });

  it('normalizes text collection aliases to collect_text', () => {
    const aliases = [
      'collect_book', 'collect_letter', 'collect_journal', 'collect_scroll',
      'find_text', 'find_book', 'pick_up_text', 'read_book',
      'gather_text', 'text_collected',
    ];
    for (const alias of aliases) {
      expect(normalizeObjectiveType(alias)).toBe('collect_text');
    }
  });

  it('collect_text normalizes to itself', () => {
    expect(normalizeObjectiveType('collect_text')).toBe('collect_text');
  });
});

describe('text collection in main quest chapters', () => {
  it('every chapter has a collect_text objective', () => {
    for (const chapter of MAIN_QUEST_CHAPTERS) {
      const textObj = chapter.objectives.find(o => o.questType === 'collect_text');
      expect(textObj).toBeDefined();
      expect(textObj!.requiredCount).toBeGreaterThan(0);
    }
  });

  it('collect_text objective IDs follow naming convention', () => {
    for (const chapter of MAIN_QUEST_CHAPTERS) {
      const textObj = chapter.objectives.find(o => o.questType === 'collect_text');
      expect(textObj!.id).toMatch(/^ch\d+_collect_texts$/);
    }
  });

  it('total text collection requirement across all chapters is reasonable', () => {
    const totalTexts = MAIN_QUEST_CHAPTERS.reduce((sum, ch) => {
      const textObj = ch.objectives.find(o => o.questType === 'collect_text');
      return sum + (textObj?.requiredCount ?? 0);
    }, 0);
    // 2+2+3+3+4+5 = 19 texts total across 6 chapters
    expect(totalTexts).toBeGreaterThanOrEqual(10);
    expect(totalTexts).toBeLessThanOrEqual(30);
  });
});
