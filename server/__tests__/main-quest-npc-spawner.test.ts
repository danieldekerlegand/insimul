/**
 * Tests for Main Quest NPC Spawner
 *
 * Verifies that the spawner creates the correct NPCs with proper
 * roles, personalities, and generationConfig tagging.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock storage before importing the module under test
const mockCharacters: any[] = [];
const mockBusinesses: any[] = [];
let createdCharacters: any[] = [];

vi.mock('../db/storage', () => ({
  storage: {
    getCharactersByWorld: vi.fn(async () => mockCharacters),
    getBusinessesByWorld: vi.fn(async () => mockBusinesses),
    createCharacter: vi.fn(async (data: any) => {
      const char = { ...data, id: `char-${createdCharacters.length + 1}` };
      createdCharacters.push(char);
      return char;
    }),
  },
}));

import { spawnMainQuestNPCs, getMainQuestNPCs } from '../services/main-quest-npc-spawner';
import { MAIN_QUEST_NPC_DEFINITIONS } from '../../shared/quest/main-quest-npcs';

beforeEach(() => {
  mockCharacters.length = 0;
  mockBusinesses.length = 0;
  createdCharacters = [];
  vi.clearAllMocks();
});

describe('spawnMainQuestNPCs', () => {
  it('creates all 5 NPCs for a fresh world', async () => {
    const result = await spawnMainQuestNPCs('world-1', 'French');
    expect(result.created).toBe(5);
    expect(result.npcs).toHaveLength(5);
  });

  it('assigns correct roles to NPCs', async () => {
    const result = await spawnMainQuestNPCs('world-1', 'French');
    const roles = result.npcs.map(n => n.role);
    expect(roles).toContain('the_editor');
    expect(roles).toContain('the_neighbor');
    expect(roles).toContain('the_patron');
    expect(roles).toContain('the_scholar');
    expect(roles).toContain('the_confidant');
  });

  it('tags NPCs with mainQuestRole in generationConfig', async () => {
    await spawnMainQuestNPCs('world-1');
    for (const char of createdCharacters) {
      expect(char.generationConfig).toBeDefined();
      expect(char.generationConfig.mainQuestNPC).toBe(true);
      expect(char.generationConfig.mainQuestRole).toBeTruthy();
      expect(char.generationConfig.tag).toBe('main_quest_npc');
    }
  });

  it('sets personality traits matching definitions', async () => {
    await spawnMainQuestNPCs('world-1');
    for (const char of createdCharacters) {
      const role = char.generationConfig.mainQuestRole;
      const def = MAIN_QUEST_NPC_DEFINITIONS.find(d => d.role === role);
      expect(def).toBeDefined();
      expect(char.personality).toEqual(def!.personality);
    }
  });

  it('sets occupation matching definitions', async () => {
    await spawnMainQuestNPCs('world-1');
    for (const char of createdCharacters) {
      const role = char.generationConfig.mainQuestRole;
      const def = MAIN_QUEST_NPC_DEFINITIONS.find(d => d.role === role);
      expect(char.occupation).toBe(def!.occupation);
    }
  });

  it('uses French names when targetLanguage is French', async () => {
    await spawnMainQuestNPCs('world-1', 'French');
    // French names should include accented characters or known French names
    const names = createdCharacters.map(c => c.firstName);
    // At least one name should be a French name from our pool
    const frenchFirstNames = ['Henri', 'Marcel', 'Étienne', 'Jacques', 'Pierre'];
    const hasFrenchName = names.some(n => frenchFirstNames.includes(n));
    expect(hasFrenchName).toBe(true);
  });

  it('uses default names when no targetLanguage specified', async () => {
    await spawnMainQuestNPCs('world-1');
    const names = createdCharacters.map(c => c.firstName);
    const defaultFirstNames = ['James', 'Thomas', 'Charles', 'Edward', 'Arthur'];
    const hasDefaultName = names.some(n => defaultFirstNames.includes(n));
    expect(hasDefaultName).toBe(true);
  });

  it('is idempotent — skips existing NPCs', async () => {
    // Simulate existing NPCs in the world
    mockCharacters.push({
      id: 'existing-1',
      firstName: 'Henri',
      lastName: 'Beaumont',
      generationConfig: { mainQuestRole: 'the_editor', mainQuestNPC: true },
    });
    mockCharacters.push({
      id: 'existing-2',
      firstName: 'Claire',
      lastName: 'Moreau',
      generationConfig: { mainQuestRole: 'the_neighbor', mainQuestNPC: true },
    });

    const result = await spawnMainQuestNPCs('world-1');
    // Only 3 new NPCs should be created (5 total - 2 existing)
    expect(result.created).toBe(3);
    // All 5 should be reported
    expect(result.npcs).toHaveLength(5);
    // Existing ones should be listed with their original IDs
    const editorNpc = result.npcs.find(n => n.role === 'the_editor');
    expect(editorNpc?.characterId).toBe('existing-1');
  });

  it('assigns NPCs to matching businesses when available', async () => {
    mockBusinesses.push(
      { id: 'biz-1', name: 'Town Bookshop', businessType: 'Shop' },
      { id: 'biz-2', name: 'Central Bank', businessType: 'Bank' },
      { id: 'biz-3', name: 'University', businessType: 'University' },
      { id: 'biz-4', name: 'Grand Hotel', businessType: 'Hotel' },
    );

    await spawnMainQuestNPCs('world-1');

    // The editor prefers Shop, so should be at bookshop
    const editor = createdCharacters.find(c => c.generationConfig.mainQuestRole === 'the_editor');
    expect(editor?.currentLocation).toBe('Town Bookshop');

    // The patron prefers Bank, so should be at the bank
    const patron = createdCharacters.find(c => c.generationConfig.mainQuestRole === 'the_patron');
    expect(patron?.currentLocation).toBe('Central Bank');
  });

  it('sets all NPCs to active status', async () => {
    await spawnMainQuestNPCs('world-1');
    for (const char of createdCharacters) {
      expect(char.status).toBe('active');
    }
  });

  it('sets generationMethod to insimul', async () => {
    await spawnMainQuestNPCs('world-1');
    for (const char of createdCharacters) {
      expect(char.generationMethod).toBe('insimul');
    }
  });
});

describe('getMainQuestNPCs', () => {
  it('returns a map of role to character', async () => {
    mockCharacters.push(
      {
        id: 'char-1',
        firstName: 'Henri',
        lastName: 'Beaumont',
        generationConfig: { mainQuestRole: 'the_editor' },
      },
      {
        id: 'char-2',
        firstName: 'Marie',
        lastName: 'Lefèvre',
        generationConfig: { mainQuestRole: 'the_neighbor' },
      },
      {
        id: 'char-3',
        firstName: 'Jean',
        lastName: 'Dupont',
        generationConfig: {},
      },
    );

    const result = await getMainQuestNPCs('world-1');
    expect(result.size).toBe(2);
    expect(result.get('the_editor')?.id).toBe('char-1');
    expect(result.get('the_neighbor')?.id).toBe('char-2');
  });

  it('returns empty map when no main quest NPCs exist', async () => {
    const result = await getMainQuestNPCs('world-1');
    expect(result.size).toBe(0);
  });
});
