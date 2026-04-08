/**
 * World Snapshot Generator
 *
 * Fetches all world data from the database and produces a self-contained
 * WorldSnapshot for embedding in save files. This is a simplified version
 * of the IR generator — it captures the template state without computing
 * spatial layouts or building meshes.
 */

import { storage } from '../db/storage.js';
import type {
  WorldSnapshot,
  CharacterSnapshot,
  LotSnapshot,
  QuestSnapshot,
  SettlementSnapshot,
  CountrySnapshot,
  CurrentGameState,
} from '../../shared/save-file.js';

/**
 * Generate a complete WorldSnapshot from the database.
 * This is the read-only template embedded in every save file.
 */
export async function generateWorldSnapshot(worldId: string): Promise<WorldSnapshot> {
  console.log(`[Snapshot] Generating world snapshot for ${worldId}...`);
  const startTime = Date.now();

  // Fetch non-character data in parallel (these are small/fast)
  const [
    world,
    countries,
    settlements,
    quests,
    rules,
    actions,
    grammars,
  ] = await Promise.all([
    storage.getWorld(worldId).then((r: any) => { console.log('[Snapshot] ✓ world'); return r; }),
    storage.getCountriesByWorld(worldId).then((r: any) => { console.log('[Snapshot] ✓ countries'); return r; }),
    storage.getSettlementsByWorld(worldId).then((r: any) => { console.log('[Snapshot] ✓ settlements'); return r; }),
    storage.getQuestsByWorld(worldId).then((r: any) => { console.log(`[Snapshot] ✓ quests (${r.length})`); return r; }),
    storage.getRulesByWorld(worldId).then((r: any) => { console.log(`[Snapshot] ✓ rules (${r.length})`); return r; }),
    storage.getActionsByWorld(worldId).then((r: any) => { console.log(`[Snapshot] ✓ actions (${r.length})`); return r; }),
    storage.getGrammarsByWorld(worldId).then((r: any) => { console.log(`[Snapshot] ✓ grammars (${r.length})`); return r; }),
  ]);

  if (!world) {
    throw new Error(`World ${worldId} not found`);
  }

  // Fetch characters in batches to avoid MongoDB free-tier timeout
  const BATCH_SIZE = 50;
  const characters: any[] = [];
  let offset = 0;
  while (true) {
    const batch = await storage.getCharactersByWorld(worldId, { lean: true, limit: BATCH_SIZE, offset });
    characters.push(...batch);
    console.log(`[Snapshot] ✓ characters batch ${Math.floor(offset / BATCH_SIZE) + 1} (${batch.length} fetched, ${characters.length} total)`);
    if (batch.length < BATCH_SIZE) break;
    offset += BATCH_SIZE;
  }

  // Fetch lots per settlement (sequential to avoid overloading free-tier DB)
  const allLots: LotSnapshot[] = [];
  for (const s of settlements) {
    const lots = await storage.getLotsBySettlement(s.id);
    for (const lot of lots) {
      allLots.push({
        id: lot.id,
        settlementId: lot.settlementId,
        address: lot.address || null,
        houseNumber: lot.houseNumber || null,
        streetName: lot.streetName || null,
        streetId: lot.streetId || null,
        blockCol: lot.blockCol ?? null,
        blockRow: lot.blockRow ?? null,
        lotIndex: lot.lotIndex ?? null,
        lotType: lot.lotType || 'buildable',
        districtName: lot.districtName || null,
        side: lot.side || null,
        building: lot.building || null,
      });
    }
  }

  const elapsed = Date.now() - startTime;
  console.log(`[Snapshot] Fetched ${characters.length} characters, ${allLots.length} lots, ${quests.length} quests in ${elapsed}ms`);

  return {
    world: {
      id: world.id,
      name: world.name,
      worldType: world.worldType || null,
      gameType: world.gameType || null,
      targetLanguage: world.targetLanguage || null,
      description: world.description || null,
    },
    countries: countries.map((c: any): CountrySnapshot => ({
      id: c.id,
      name: c.name,
      governmentType: c.governmentType || null,
      economicSystem: c.economicSystem || null,
    })),
    settlements: settlements.map((s: any): SettlementSnapshot => ({
      id: s.id,
      name: s.name,
      settlementType: s.settlementType,
      streetPattern: s.streetPattern || null,
      population: s.population || 0,
      countryId: s.countryId || null,
      streets: s.streets || [],
      districts: s.districts || [],
      landmarks: s.landmarks || [],
    })),
    characters: characters.map((c: any): CharacterSnapshot => {
      // Deceased characters: only need name + dates for cemetery headstones
      if (!c.isAlive) {
        return {
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          gender: c.gender,
          birthYear: c.birthYear || null,
          isAlive: false,
          occupation: null,
          personality: null,
          spouseId: null,
          parentIds: null,
          childIds: null,
          currentLocation: c.currentLocation,
          appearance: null,
          socialAttributes: null,
        };
      }
      // Living characters: include gameplay-relevant fields only
      return {
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        gender: c.gender,
        birthYear: c.birthYear || null,
        isAlive: true,
        occupation: c.occupation || null,
        personality: c.personality || null,
        spouseId: c.spouseId || null,
        parentIds: null,
        childIds: null,
        currentLocation: c.currentLocation,
        appearance: null,
        socialAttributes: null, // Heavy blob (relationshipDetails) — not used by game client
      };
    }),
    lots: allLots,
    quests: quests.map((q: any): QuestSnapshot => ({
      id: q.id,
      name: q.name || q.title || '',
      title: q.title || q.name || '',
      description: q.description || null,
      giverNpcId: q.giverNpcId || q.assignedByCharacterId || null,
      status: q.status || 'active',
      stages: q.stages || [],
      rewards: q.rewards || null,
      storyText: null,
      content: q.content || null,
      questType: q.questType || null,
      difficulty: q.difficulty || null,
      tags: q.tags || null,
      targetLanguage: q.targetLanguage || null,
      assignedTo: q.assignedTo || null,
      assignedBy: q.assignedBy || null,
      assignedByCharacterId: q.assignedByCharacterId || null,
      experienceReward: q.experienceReward || 0,
      completionCriteria: q.completionCriteria || null,
      objectives: q.objectives || [],
      locationName: q.locationName || null,
      locationPosition: q.locationPosition || null,
      customData: q.customData || null,
    })),
    rules: rules.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      content: r.content,
      category: r.category,
    })),
    actions: actions.map((a: any) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      content: a.content || null,
      category: a.category,
      actionType: a.actionType || null,
      emitsEvent: a.emitsEvent || null,
      gameActivityVerb: a.gameActivityVerb || null,
      completesObjectiveType: a.completesObjectiveType || null,
    })),
    grammars: grammars.map((g: any) => ({
      id: g.id,
      name: g.name,
      grammarType: g.grammarType,
      rules: g.rules,
    })),
  };
}

/**
 * Create a fresh CurrentGameState for a new game.
 * This is the initial mutable state before the player has done anything.
 */
export function createInitialGameState(): CurrentGameState {
  return {
    player: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      gold: 100,
      health: 100,
      energy: 100,
      inventory: [],
      cefrLevel: null,
      effectiveFluency: null,
    },
    quests: {
      progress: {},
      dynamicQuests: [],
    },
    npcs: {
      relationships: {},
      romance: {},
      merchantStates: {},
    },
    reputation: {
      settlements: {},
    },
    containers: {
      containers: {},
    },
    languageProgress: {
      vocabulary: [],
      grammarPatterns: [],
      totalXP: 0,
      level: 1,
    },
    prologFacts: [],
    timeState: null,
    interiorState: null,
    extensions: {},
  };
}
