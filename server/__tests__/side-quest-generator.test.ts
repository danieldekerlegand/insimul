import { describe, it, expect } from 'vitest';
import {
  generateSideQuests,
  generateReplacementQuests,
  canGiveSideQuests,
  getSideQuestTemplateCount,
  getSideQuestsByMechanic,
  getOccupationMechanics,
  type SideQuestOptions,
} from '../../shared/quests/side-quest-generator.js';
import type { Character, Settlement, World } from '../../shared/schema';

// ── Test fixtures ────────────────────────────────────────────────────────────

const MOCK_WORLD: World = {
  id: 'world-1',
  name: 'Test World',
  targetLanguage: 'French',
  description: 'A test world',
  worldType: 'village',
  userId: 'user-1',
} as World;

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: `char-${Math.random().toString(36).slice(2, 8)}`,
    firstName: 'Jean',
    lastName: 'Dupont',
    status: 'active',
    worldId: 'world-1',
    occupation: null,
    ...overrides,
  } as Character;
}

function makeSettlement(overrides: Partial<Settlement> = {}): Settlement {
  return {
    id: `settle-${Math.random().toString(36).slice(2, 8)}`,
    name: 'Test Village',
    worldId: 'world-1',
    ...overrides,
  } as Settlement;
}

const BAKER = makeCharacter({ id: 'char-baker', firstName: 'Marie', lastName: 'Boulanger', occupation: 'Baker' });
const BLACKSMITH = makeCharacter({ id: 'char-smith', firstName: 'Pierre', lastName: 'Forgeron', occupation: 'Blacksmith' });
const TEACHER = makeCharacter({ id: 'char-teacher', firstName: 'Luc', lastName: 'Professeur', occupation: 'Teacher' });
const GUARD = makeCharacter({ id: 'char-guard', firstName: 'Anne', lastName: 'Garde', occupation: 'PoliceOfficer' });
const PAINTER = makeCharacter({ id: 'char-painter', firstName: 'Claude', lastName: 'Artiste', occupation: 'Painter' });
const FARMER = makeCharacter({ id: 'char-farmer', firstName: 'Jules', lastName: 'Fermier', occupation: 'Farmer' });
const MERCHANT = makeCharacter({ id: 'char-merchant', firstName: 'Sophie', lastName: 'Marchand', occupation: 'Owner' });
const DOCTOR = makeCharacter({ id: 'char-doctor', firstName: 'Émile', lastName: 'Médecin', occupation: 'Doctor' });
const TAILOR = makeCharacter({ id: 'char-tailor', firstName: 'Léa', lastName: 'Couturière', occupation: 'Tailor' });
const MINER = makeCharacter({ id: 'char-miner', firstName: 'Henri', lastName: 'Mineur', occupation: 'Miner' });
const NO_QUEST_NPC = makeCharacter({ id: 'char-noquests', firstName: 'Paul', lastName: 'Labeur', occupation: 'Laborer' });

const ALL_NPCS: Character[] = [BAKER, BLACKSMITH, TEACHER, GUARD, PAINTER, FARMER, MERCHANT, DOCTOR, TAILOR, MINER, NO_QUEST_NPC];

const SETTLEMENTS: Settlement[] = [
  makeSettlement({ id: 's-1', name: 'Place du Village' }),
  makeSettlement({ id: 's-2', name: 'Le Marché' }),
  makeSettlement({ id: 's-3', name: 'Le Port' }),
  makeSettlement({ id: 's-4', name: 'La Forêt' }),
];

// ── Tests ────────────────────────────────────────────────────────────────────

describe('side-quest-generator', () => {
  describe('canGiveSideQuests', () => {
    it('returns true for quest-giving occupations', () => {
      expect(canGiveSideQuests(BAKER)).toBe(true);
      expect(canGiveSideQuests(BLACKSMITH)).toBe(true);
      expect(canGiveSideQuests(TEACHER)).toBe(true);
      expect(canGiveSideQuests(GUARD)).toBe(true);
      expect(canGiveSideQuests(PAINTER)).toBe(true);
      expect(canGiveSideQuests(FARMER)).toBe(true);
      expect(canGiveSideQuests(MERCHANT)).toBe(true);
      expect(canGiveSideQuests(DOCTOR)).toBe(true);
    });

    it('returns false for non-quest-giving occupations', () => {
      expect(canGiveSideQuests(NO_QUEST_NPC)).toBe(false);
    });

    it('returns false for NPCs without occupation', () => {
      const noOcc = makeCharacter({ occupation: null });
      expect(canGiveSideQuests(noOcc)).toBe(false);
    });
  });

  describe('generateSideQuests', () => {
    it('generates quests for quest-giving NPCs', () => {
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: ALL_NPCS,
        settlements: SETTLEMENTS,
      });

      expect(quests.length).toBeGreaterThan(0);
    });

    it('generates 2-3 quests per NPC by default', () => {
      // Use just one NPC to test per-NPC count
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: [BAKER, NO_QUEST_NPC], // Baker + non-quest-giver
        settlements: SETTLEMENTS,
      });

      expect(quests.length).toBeGreaterThanOrEqual(2);
      expect(quests.length).toBeLessThanOrEqual(3);
    });

    it('does not generate quests for non-quest-giving NPCs', () => {
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: [NO_QUEST_NPC],
        settlements: SETTLEMENTS,
      });

      expect(quests.length).toBe(0);
    });

    it('all quests have required fields', () => {
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: ALL_NPCS,
        settlements: SETTLEMENTS,
      });

      for (const quest of quests) {
        expect(quest.worldId).toBe('world-1');
        expect(quest.title).toBeTruthy();
        expect(quest.description).toBeTruthy();
        expect(quest.questType).toBeTruthy();
        expect(quest.difficulty).toBeTruthy();
        expect(quest.targetLanguage).toBe('French');
        expect(quest.assignedTo).toBe('Player');
        expect(quest.assignedBy).toBeTruthy();
        expect(quest.assignedByCharacterId).toBeTruthy();
        expect(quest.status).toBe('available');
        expect(quest.objectives).toBeDefined();
        expect((quest.objectives as any[]).length).toBeGreaterThanOrEqual(2);
        expect((quest.objectives as any[]).length).toBeLessThanOrEqual(4);
        expect(quest.experienceReward).toBeGreaterThan(0);
        expect(quest.tags).toBeDefined();
        expect(quest.tags!.length).toBeGreaterThan(0);
      }
    });

    it('quest titles contain both French and English', () => {
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: [BAKER],
        settlements: SETTLEMENTS,
      });

      for (const quest of quests) {
        // Title format: "French — English"
        expect(quest.title).toContain('—');
      }
    });

    it('quest descriptions contain both French and English', () => {
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: [BAKER],
        settlements: SETTLEMENTS,
      });

      for (const quest of quests) {
        // Description has French paragraph then English paragraph
        expect(quest.description.split('\n').length).toBeGreaterThanOrEqual(2);
      }
    });

    it('tags include side-quest and occupation', () => {
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: [BAKER],
        settlements: SETTLEMENTS,
      });

      for (const quest of quests) {
        expect(quest.tags).toContain('side-quest');
        expect(quest.tags!.some(t => t.startsWith('occupation:'))).toBe(true);
        expect(quest.tags!.some(t => t.startsWith('mechanic:'))).toBe(true);
      }
    });

    it('objectives use declarative action mapping types', () => {
      const VALID_TYPES = new Set([
        'collect_item', 'visit_location', 'discover_location', 'talk_to_npc',
        'complete_reading', 'answer_questions', 'photograph_subject',
        'photograph_activity', 'physical_action', 'craft_item',
        'deliver_item', 'use_vocabulary', 'read_sign',
      ]);

      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: ALL_NPCS,
        settlements: SETTLEMENTS,
      });

      for (const quest of quests) {
        for (const objective of quest.objectives as any[]) {
          expect(VALID_TYPES.has(objective.type)).toBe(true);
        }
      }
    });

    it('respects maxQuests option', () => {
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: ALL_NPCS,
        settlements: SETTLEMENTS,
        maxQuests: 5,
      });

      expect(quests.length).toBeLessThanOrEqual(5);
    });

    it('respects questsPerNpc option', () => {
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: [BAKER],
        settlements: SETTLEMENTS,
        questsPerNpc: 1,
      });

      expect(quests.length).toBe(1);
    });

    it('scales XP with player level', () => {
      const lowLevel = generateSideQuests({
        world: MOCK_WORLD,
        characters: [BAKER],
        settlements: SETTLEMENTS,
        playerLevel: 1,
        questsPerNpc: 1,
      });

      const highLevel = generateSideQuests({
        world: MOCK_WORLD,
        characters: [BAKER],
        settlements: SETTLEMENTS,
        playerLevel: 10,
        questsPerNpc: 1,
      });

      // Higher level should give more XP
      expect(highLevel[0].experienceReward!).toBeGreaterThan(lowLevel[0].experienceReward!);
    });

    it('sets recurrencePattern to daily for quest rotation', () => {
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: [BAKER],
        settlements: SETTLEMENTS,
      });

      for (const quest of quests) {
        expect(quest.recurrencePattern).toBe('daily');
      }
    });

    it('references real NPC names in objectives', () => {
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: ALL_NPCS,
        settlements: SETTLEMENTS,
      });

      const npcNames = ALL_NPCS.map(n => `${n.firstName} ${n.lastName}`.trim());

      for (const quest of quests) {
        // assignedBy should be a real NPC name
        expect(npcNames).toContain(quest.assignedBy);
      }
    });

    it('references real location names in objectives', () => {
      const settlementNames = SETTLEMENTS.map(s => s.name);

      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: [GUARD], // Guard quests always visit locations
        settlements: SETTLEMENTS,
      });

      const allObjectives = quests.flatMap(q => q.objectives as any[]);
      const locationObjs = allObjectives.filter(o => o.locationName);

      expect(locationObjs.length).toBeGreaterThan(0);
      for (const o of locationObjs) {
        expect(settlementNames).toContain(o.locationName);
      }
    });

    it('marks mystery-relevant quests', () => {
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: [BAKER],
        settlements: SETTLEMENTS,
        mysteryRelevantNpcIds: [BAKER.id],
      });

      // Baker gives quests, and their ID is mystery-relevant
      for (const quest of quests) {
        expect(quest.tags).toContain('mystery-relevant');
      }
    });

    it('uses fallback locations when no settlements provided', () => {
      const quests = generateSideQuests({
        world: MOCK_WORLD,
        characters: [GUARD],
        settlements: [],
      });

      expect(quests.length).toBeGreaterThan(0);
    });
  });

  describe('generateReplacementQuests', () => {
    it('generates replacement quest for a completed NPC quest', () => {
      const quests = generateReplacementQuests({
        world: MOCK_WORLD,
        giver: BAKER,
        characters: ALL_NPCS,
        settlements: SETTLEMENTS,
      });

      expect(quests.length).toBe(1);
      expect(quests[0].assignedBy).toBe('Marie Boulanger');
    });

    it('returns empty for non-quest-giving NPC', () => {
      const quests = generateReplacementQuests({
        world: MOCK_WORLD,
        giver: NO_QUEST_NPC,
        characters: ALL_NPCS,
        settlements: SETTLEMENTS,
      });

      expect(quests.length).toBe(0);
    });

    it('tags replacement quests with rotated', () => {
      const quests = generateReplacementQuests({
        world: MOCK_WORLD,
        giver: BAKER,
        characters: ALL_NPCS,
        settlements: SETTLEMENTS,
      });

      expect(quests[0].tags).toContain('rotated');
      expect(quests[0].tags).toContain('side-quest');
    });

    it('avoids recently completed template IDs when possible', () => {
      // Generate multiple times to check it doesn't always pick the same
      const results = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const quests = generateReplacementQuests({
          world: MOCK_WORLD,
          giver: BAKER,
          characters: ALL_NPCS,
          settlements: SETTLEMENTS,
          completedTemplateIds: ['baker_special_bread'],
        });
        if (quests.length > 0) {
          results.add(quests[0].title);
        }
      }
      // Should have at least 1 result
      expect(results.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('occupation coverage', () => {
    const OCCUPATIONS_TO_TEST = [
      { npc: BAKER, mechanic: 'cooking' },
      { npc: FARMER, mechanic: 'herbalism' },
      { npc: BLACKSMITH, mechanic: 'mining+crafting' },
      { npc: TEACHER, mechanic: 'reading' },
      { npc: GUARD, mechanic: 'exploration' },
      { npc: MERCHANT, mechanic: 'delivery' },
      { npc: PAINTER, mechanic: 'photography' },
      { npc: DOCTOR, mechanic: 'herbalism' },
      { npc: TAILOR, mechanic: 'crafting' },
      { npc: MINER, mechanic: 'mining' },
    ];

    for (const { npc, mechanic } of OCCUPATIONS_TO_TEST) {
      it(`${npc.occupation} generates ${mechanic} quests`, () => {
        const quests = generateSideQuests({
          world: MOCK_WORLD,
          characters: [npc, ...ALL_NPCS.filter(n => n.id !== npc.id)],
          settlements: SETTLEMENTS,
        });

        const npcQuests = quests.filter(q => q.assignedByCharacterId === npc.id);
        expect(npcQuests.length).toBeGreaterThan(0);
        expect(npcQuests.some(q => q.tags!.includes(`mechanic:${mechanic}`))).toBe(true);
      });
    }
  });

  describe('utility functions', () => {
    it('getSideQuestTemplateCount returns template count', () => {
      const count = getSideQuestTemplateCount();
      expect(count).toBeGreaterThanOrEqual(18);
    });

    it('getSideQuestsByMechanic covers required mechanics', () => {
      const byMechanic = getSideQuestsByMechanic();
      expect(byMechanic['cooking']).toBeDefined();
      expect(byMechanic['herbalism']).toBeDefined();
      expect(byMechanic['mining+crafting']).toBeDefined();
      expect(byMechanic['reading']).toBeDefined();
      expect(byMechanic['exploration']).toBeDefined();
      expect(byMechanic['delivery']).toBeDefined();
      expect(byMechanic['photography']).toBeDefined();
      expect(byMechanic['mining']).toBeDefined();
      expect(byMechanic['crafting']).toBeDefined();
    });

    it('getOccupationMechanics maps occupations to mechanics', () => {
      const map = getOccupationMechanics();
      expect(map['Baker']).toContain('cooking');
      expect(map['Blacksmith']).toContain('mining+crafting');
      expect(map['Teacher']).toContain('reading');
      expect(map['PoliceOfficer']).toContain('exploration');
      expect(map['Painter']).toContain('photography');
      expect(map['Farmer']).toContain('herbalism');
      expect(map['Miner']).toContain('mining');
    });
  });
});
