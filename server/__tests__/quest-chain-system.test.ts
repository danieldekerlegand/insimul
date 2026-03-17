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
  it('has three starter templates', () => {
    const ids = Object.keys(questChainTemplates);
    expect(ids).toContain('first-words');
    expect(ids).toContain('market-day');
    expect(ids).toContain('town-explorer');
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
    expect(list).toHaveLength(3);

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
