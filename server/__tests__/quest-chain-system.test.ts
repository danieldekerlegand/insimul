import { describe, it, expect } from 'vitest';
import {
  questChainTemplates,
  getChainTemplate,
  listChainTemplates,
} from '../services/quest-chain-templates';
import {
  encodeChainMeta,
  extractChainMeta,
} from '../services/quest-chain-manager';

// ── Template Tests ────────────────────────────────────────────────────────────

describe('Quest Chain Templates', () => {
  it('has four templates including main quest', () => {
    const ids = Object.keys(questChainTemplates);
    expect(ids).toContain('first-words');
    expect(ids).toContain('market-day');
    expect(ids).toContain('town-explorer');
    expect(ids).toContain('missing-writer-mystery');
  });

  it('first-words has 5 quests progressing in difficulty', () => {
    const t = questChainTemplates['first-words'];
    expect(t.quests).toHaveLength(5);
    expect(t.name).toBe('First Words');
    expect(t.isLinear).toBe(true);
    expect(t.bonusXP).toBeGreaterThan(0);
    expect(t.achievement).toBeTruthy();

    // First quest should be active, rest pending
    expect(t.quests[0].status).toBe('active');
    for (let i = 1; i < t.quests.length; i++) {
      expect(t.quests[i].status).toBe('pending');
    }
  });

  it('market-day has 3 quests', () => {
    const t = questChainTemplates['market-day'];
    expect(t.quests).toHaveLength(3);
    expect(t.name).toBe('Market Day');
  });

  it('town-explorer has 4 quests', () => {
    const t = questChainTemplates['town-explorer'];
    expect(t.quests).toHaveLength(4);
    expect(t.name).toBe('Town Explorer');
  });

  it('missing-writer-mystery has 8 quests forming the main narrative arc', () => {
    const t = questChainTemplates['missing-writer-mystery'];
    expect(t.quests).toHaveLength(8);
    expect(t.name).toBe('The Missing Writer');
    expect(t.isLinear).toBe(true);
    expect(t.bonusXP).toBe(500);
    expect(t.achievement).toBe('Mystery Solved');
    expect(t.category).toBe('narrative');
  });

  it('missing-writer-mystery quests follow the correct order', () => {
    const t = questChainTemplates['missing-writer-mystery'];
    const titles = t.quests.map(q => q.title);
    expect(titles).toEqual([
      'Arrival Assessment',
      'The Notice Board',
      "The Writer's Home",
      'Following the Trail',
      'The Hidden Writings',
      'The Secret Location',
      'The Final Chapter',
      'Departure Assessment',
    ]);
  });

  it('missing-writer-mystery first quest is active, rest pending', () => {
    const t = questChainTemplates['missing-writer-mystery'];
    expect(t.quests[0].status).toBe('active');
    for (let i = 1; i < t.quests.length; i++) {
      expect(t.quests[i].status).toBe('pending');
    }
  });

  it('missing-writer-mystery quests use diverse action types', () => {
    const t = questChainTemplates['missing-writer-mystery'];
    const questTypes = new Set(t.quests.map(q => q.questType));
    expect(questTypes.size).toBeGreaterThanOrEqual(4);
    expect(questTypes).toContain('assessment');
    expect(questTypes).toContain('exploration');
    expect(questTypes).toContain('conversation');
    expect(questTypes).toContain('collection');
  });

  it('missing-writer-mystery quests use diverse objective types', () => {
    const t = questChainTemplates['missing-writer-mystery'];
    const objectiveTypes = new Set<string>();
    for (const quest of t.quests) {
      for (const obj of quest.objectives) {
        objectiveTypes.add(obj.type as string);
      }
    }
    // Should include reading, conversation, exploration, photography, item collection
    expect(objectiveTypes).toContain('read_document');
    expect(objectiveTypes).toContain('talk_to_npc');
    expect(objectiveTypes).toContain('visit_location');
    expect(objectiveTypes).toContain('photograph');
    expect(objectiveTypes).toContain('collect_item');
  });

  it('missing-writer-mystery all quests are tagged main-quest', () => {
    const t = questChainTemplates['missing-writer-mystery'];
    for (const quest of t.quests) {
      expect(quest.tags).toContain('main-quest');
      expect(quest.tags).toContain('narrative');
    }
  });

  it('missing-writer-mystery assessment quests bookend the chain', () => {
    const t = questChainTemplates['missing-writer-mystery'];
    expect(t.quests[0].questType).toBe('assessment');
    expect(t.quests[0].tags).toContain('arrival');
    expect(t.quests[7].questType).toBe('assessment');
    expect(t.quests[7].tags).toContain('departure');
  });

  it('missing-writer-mystery difficulty progresses naturally', () => {
    const t = questChainTemplates['missing-writer-mystery'];
    const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
    let maxDifficulty = 0;
    for (const quest of t.quests) {
      const idx = difficultyOrder.indexOf(quest.difficulty);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeGreaterThanOrEqual(maxDifficulty - 1); // Allow same or higher
      maxDifficulty = Math.max(maxDifficulty, idx);
    }
    // Should reach at least intermediate
    expect(maxDifficulty).toBeGreaterThanOrEqual(1);
  });

  it('all templates have valid quest data', () => {
    for (const [id, template] of Object.entries(questChainTemplates)) {
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.bonusXP).toBeGreaterThan(0);
      expect(template.achievement).toBeTruthy();

      for (const quest of template.quests) {
        expect(quest.title).toBeTruthy();
        expect(quest.description).toBeTruthy();
        expect(quest.questType).toBeTruthy();
        expect(quest.difficulty).toBeTruthy();
        expect(quest.experienceReward).toBeGreaterThan(0);
        expect(quest.objectives).toBeTruthy();
        expect(quest.objectives!.length).toBeGreaterThan(0);
        expect(quest.completionCriteria).toBeTruthy();
        expect(quest.tags).toBeTruthy();
        expect(quest.tags!.length).toBeGreaterThan(0);
      }
    }
  });

  it('quest XP increases across chain', () => {
    for (const template of Object.values(questChainTemplates)) {
      const xpValues = template.quests.map(q => q.experienceReward);
      // Last quest should have >= first quest XP (progressive)
      expect(xpValues[xpValues.length - 1]).toBeGreaterThanOrEqual(xpValues[0]);
    }
  });
});

describe('getChainTemplate', () => {
  it('returns null for unknown template', () => {
    expect(getChainTemplate('nonexistent', 'French')).toBeNull();
  });

  it('applies target language to all quests', () => {
    const template = getChainTemplate('first-words', 'Chitimacha');
    expect(template).not.toBeNull();
    for (const quest of template!.quests) {
      expect(quest.targetLanguage).toBe('Chitimacha');
    }
  });

  it('preserves template structure', () => {
    const template = getChainTemplate('market-day', 'French');
    expect(template!.name).toBe('Market Day');
    expect(template!.quests).toHaveLength(3);
    expect(template!.bonusXP).toBe(150);
  });
});

describe('listChainTemplates', () => {
  it('returns summary for all templates', () => {
    const list = listChainTemplates();
    expect(list).toHaveLength(4);

    for (const item of list) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.questCount).toBeGreaterThan(0);
      expect(item.difficulty).toBeTruthy();
      expect(item.bonusXP).toBeGreaterThan(0);
      expect(item.achievement).toBeTruthy();
    }
  });

  it('quest counts match actual template quest counts', () => {
    const list = listChainTemplates();
    for (const item of list) {
      const template = questChainTemplates[item.id];
      expect(item.questCount).toBe(template.quests.length);
    }
  });
});

// ── Chain Metadata Tests ──────────────────────────────────────────────────────

describe('Chain Metadata Encoding/Extraction', () => {
  it('encodes and extracts chain metadata', () => {
    const encoded = encodeChainMeta('First Words', 200, 'First Words Master');
    expect(encoded).toContain('chain_meta:');

    const quests = [{ tags: [encoded] }] as any[];
    const meta = extractChainMeta(quests);
    expect(meta.name).toBe('First Words');
    expect(meta.bonusXP).toBe(200);
    expect(meta.achievement).toBe('First Words Master');
  });

  it('returns defaults when no metadata found', () => {
    const meta = extractChainMeta([{ tags: ['some-tag'] }] as any[]);
    expect(meta.name).toBe('Quest Chain');
    expect(meta.bonusXP).toBe(0);
  });

  it('handles quests with no tags', () => {
    const meta = extractChainMeta([{ tags: null }, { tags: undefined }] as any[]);
    expect(meta.name).toBe('Quest Chain');
  });

  it('handles malformed metadata gracefully', () => {
    const meta = extractChainMeta([{ tags: ['chain_meta:not-json'] }] as any[]);
    expect(meta.name).toBe('Quest Chain');
  });

  it('finds metadata from any quest in chain', () => {
    const encoded = encodeChainMeta('Market Day', 150, 'Market Regular');
    const quests = [
      { tags: ['some-tag'] },
      { tags: [encoded, 'other-tag'] },
      { tags: [] },
    ] as any[];

    const meta = extractChainMeta(quests);
    expect(meta.name).toBe('Market Day');
    expect(meta.bonusXP).toBe(150);
    expect(meta.achievement).toBe('Market Regular');
  });
});
