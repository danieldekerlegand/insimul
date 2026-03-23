import { describe, it, expect } from 'vitest';
import {
  QUEST_SEEDS,
  getSeedById,
  getSeedsByCategory,
  instantiateSeed,
  instantiateBusinessTourChain,
  BUSINESS_TOUR_SEED_IDS,
  type BusinessTourParams,
} from '../language/quest-seed-library';

const BASE_TOUR_PARAMS: BusinessTourParams = {
  worldId: 'world-1',
  targetLanguage: 'French',
  assignedTo: 'Player One',
  settlementName: 'Bayou Bend',
  guideName: 'Marie',
  businessNpcs: {
    merchantName: 'Jean',
    tavernKeeper: 'Pierre',
    crafterName: 'Colette',
  },
};

describe('business tour quest chain', () => {
  describe('seeds exist in library', () => {
    it('all business tour seed IDs exist', () => {
      for (const id of BUSINESS_TOUR_SEED_IDS) {
        const seed = getSeedById(id);
        expect(seed, `seed ${id} should exist`).toBeDefined();
      }
    });

    it('all seeds are beginner difficulty', () => {
      for (const id of BUSINESS_TOUR_SEED_IDS) {
        expect(getSeedById(id)!.difficulty).toBe('beginner');
      }
    });

    it('all seeds are in the exploration category', () => {
      for (const id of BUSINESS_TOUR_SEED_IDS) {
        expect(getSeedById(id)!.category).toBe('exploration');
      }
    });

    it('all seeds have business_tour tag', () => {
      for (const id of BUSINESS_TOUR_SEED_IDS) {
        expect(getSeedById(id)!.tags).toContain('business_tour');
      }
    });

    it('seeds have unique IDs', () => {
      const ids = new Set(BUSINESS_TOUR_SEED_IDS);
      expect(ids.size).toBe(BUSINESS_TOUR_SEED_IDS.length);
    });

    it('first seed has chain_start tag', () => {
      expect(getSeedById('business_tour_intro')!.tags).toContain('chain_start');
    });

    it('last seed has chain_end tag', () => {
      expect(getSeedById('business_tour_finale')!.tags).toContain('chain_end');
    });

    it('getSeedsByCategory returns all business tour seeds', () => {
      const exploration = getSeedsByCategory('exploration');
      for (const id of BUSINESS_TOUR_SEED_IDS) {
        expect(exploration.some(s => s.id === id)).toBe(true);
      }
    });
  });

  describe('individual seed instantiation', () => {
    it('intro seed resolves settlement and guide name', () => {
      const seed = getSeedById('business_tour_intro')!;
      const quest = instantiateSeed(seed, {
        ...BASE_TOUR_PARAMS,
        values: { guideName: 'Marie', settlementName: 'Bayou Bend' },
      });

      expect(quest.title).toBe('Welcome to Bayou Bend');
      expect(quest.description).toContain('Marie');
      expect(quest.description).toContain('Bayou Bend');
    });

    it('market seed resolves merchant name', () => {
      const seed = getSeedById('business_tour_market')!;
      const quest = instantiateSeed(seed, {
        ...BASE_TOUR_PARAMS,
        values: { merchantName: 'Jean', marketName: 'Grand Marché' },
      });

      expect(quest.title).toBe('Visit Grand Marché');
      expect(quest.description).toContain('Jean');
    });

    it('tavern seed resolves tavern keeper', () => {
      const seed = getSeedById('business_tour_tavern')!;
      const quest = instantiateSeed(seed, {
        ...BASE_TOUR_PARAMS,
        values: { tavernKeeper: 'Pierre', tavernName: 'Le Bayou Bar' },
      });

      expect(quest.title).toBe('Visit Le Bayou Bar');
      expect(quest.description).toContain('Pierre');
    });

    it('workshop seed resolves crafter name', () => {
      const seed = getSeedById('business_tour_workshop')!;
      const quest = instantiateSeed(seed, {
        ...BASE_TOUR_PARAMS,
        values: { crafterName: 'Colette' },
      });

      expect(quest.description).toContain('Colette');
    });

    it('finale seed references guide and settlement', () => {
      const seed = getSeedById('business_tour_finale')!;
      const quest = instantiateSeed(seed, {
        ...BASE_TOUR_PARAMS,
        values: { guideName: 'Marie', settlementName: 'Bayou Bend' },
      });

      expect(quest.title).toBe('Tour of Bayou Bend Complete');
      expect(quest.description).toContain('Marie');
    });

    it('each seed generates Prolog content', () => {
      for (const id of BUSINESS_TOUR_SEED_IDS) {
        const seed = getSeedById(id)!;
        const quest = instantiateSeed(seed, {
          ...BASE_TOUR_PARAMS,
          values: {
            guideName: 'Marie',
            settlementName: 'Bayou Bend',
            merchantName: 'Jean',
            tavernKeeper: 'Pierre',
            crafterName: 'Colette',
          },
        });
        expect(quest.content, `${id} should have Prolog content`).toBeTruthy();
        expect(quest.content).toContain('quest(');
      }
    });
  });

  describe('instantiateBusinessTourChain', () => {
    it('returns 5 quests in order', () => {
      const chain = instantiateBusinessTourChain(BASE_TOUR_PARAMS);
      expect(chain).toHaveLength(5);
      for (let i = 0; i < chain.length; i++) {
        expect(chain[i].questChainOrder).toBe(i);
      }
    });

    it('all quests share worldId and assignedTo', () => {
      const chain = instantiateBusinessTourChain(BASE_TOUR_PARAMS);
      for (const quest of chain) {
        expect(quest.worldId).toBe('world-1');
        expect(quest.assignedTo).toBe('Player One');
      }
    });

    it('defaults assignedBy to the guide name', () => {
      const chain = instantiateBusinessTourChain(BASE_TOUR_PARAMS);
      for (const quest of chain) {
        expect(quest.assignedBy).toBe('Marie');
      }
    });

    it('uses explicit assignedBy when provided', () => {
      const chain = instantiateBusinessTourChain({
        ...BASE_TOUR_PARAMS,
        assignedBy: 'Mayor',
      });
      for (const quest of chain) {
        expect(quest.assignedBy).toBe('Mayor');
      }
    });

    it('resolves NPC names into correct quests', () => {
      const chain = instantiateBusinessTourChain(BASE_TOUR_PARAMS);

      // Intro: guide
      expect(chain[0].description).toContain('Marie');
      // Market: merchant
      expect(chain[1].description).toContain('Jean');
      // Tavern: tavern keeper
      expect(chain[2].description).toContain('Pierre');
      // Workshop: crafter
      expect(chain[3].description).toContain('Colette');
      // Finale: guide
      expect(chain[4].description).toContain('Marie');
    });

    it('uses custom business location names when provided', () => {
      const chain = instantiateBusinessTourChain({
        ...BASE_TOUR_PARAMS,
        businessLocations: {
          marketName: 'Grand Marché',
          tavernName: 'Le Bayou Bar',
          workshopName: 'Atelier du Bois',
        },
      });

      expect(chain[1].title).toBe('Visit Grand Marché');
      expect(chain[2].title).toBe('Visit Le Bayou Bar');
      expect(chain[3].title).toBe('Visit Atelier du Bois');
    });

    it('falls back to default location names', () => {
      const chain = instantiateBusinessTourChain(BASE_TOUR_PARAMS);

      expect(chain[1].title).toBe('Visit the market');
      expect(chain[2].title).toBe('Visit the tavern');
      expect(chain[3].title).toBe('Visit the workshop');
    });

    it('all quests have Prolog content', () => {
      const chain = instantiateBusinessTourChain(BASE_TOUR_PARAMS);
      for (const quest of chain) {
        expect(quest.content).toBeTruthy();
        expect(quest.content).toContain('quest(');
      }
    });

    it('all quests are active and beginner', () => {
      const chain = instantiateBusinessTourChain(BASE_TOUR_PARAMS);
      for (const quest of chain) {
        expect(quest.status).toBe('active');
        expect(quest.difficulty).toBe('beginner');
      }
    });

    it('all quests have positive XP rewards', () => {
      const chain = instantiateBusinessTourChain(BASE_TOUR_PARAMS);
      for (const quest of chain) {
        expect(quest.experienceReward).toBeGreaterThan(0);
      }
    });

    it('total chain XP is sum of individual quests', () => {
      const chain = instantiateBusinessTourChain(BASE_TOUR_PARAMS);
      const totalXp = chain.reduce((sum, q) => sum + q.experienceReward, 0);
      // 15 + 20 + 20 + 20 + 25 = 100 (all beginner, 1x multiplier)
      expect(totalXp).toBe(100);
    });

    it('each quest has at least one objective', () => {
      const chain = instantiateBusinessTourChain(BASE_TOUR_PARAMS);
      for (const quest of chain) {
        expect(quest.objectives.length).toBeGreaterThan(0);
      }
    });

    it('middle quests include visit_location objectives', () => {
      const chain = instantiateBusinessTourChain(BASE_TOUR_PARAMS);
      // Market, tavern, workshop (indices 1-3) should have visit_location
      for (let i = 1; i <= 3; i++) {
        const hasVisit = chain[i].objectives.some((o: any) => o.type === 'visit_location');
        expect(hasVisit, `quest ${i} should have visit_location objective`).toBe(true);
      }
    });

    it('includes targetLanguage in descriptions', () => {
      const chain = instantiateBusinessTourChain(BASE_TOUR_PARAMS);
      // At least some quests should mention the target language
      const mentionsLanguage = chain.some(q => q.description.includes('French'));
      expect(mentionsLanguage).toBe(true);
    });
  });
});
