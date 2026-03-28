/**
 * Automated Playability Test Suite
 *
 * Simulates gameplay to verify quest completability against a WorldIR.
 * Tests the full validation pipeline: world validator, dependency graph,
 * and QuestCompletionEngine event simulation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validateQuestsAgainstWorld, type WorldValidationReport } from '../quest-world-validator';
import { validateQuestDependencyGraph, type DependencyGraphReport } from '../quest-dependency-graph-validator';
import { validateWorldForExport, type ExportValidationReport } from '../game-export-validator';
import { QuestCompletionEngine, type CompletionQuest, type CompletionObjective, type CompletionEvent } from '../game-engine/logic/QuestCompletionEngine';
import type { WorldIR, QuestIR, CharacterIR, NPCIR, BuildingIR, ItemIR, TextIR, NPCDialogueContext } from '../game-engine/ir-types';
import { MAIN_QUEST_CHAPTERS } from '../quest/main-quest-chapters';

// ── Mock WorldIR factory ────────────────────────────────────────────────────

function createMockCharacter(id: string, firstName: string, lastName: string): CharacterIR {
  return {
    id,
    worldId: 'world-1',
    firstName,
    middleName: null,
    lastName,
    suffix: null,
    gender: 'male',
    isAlive: true,
    birthYear: 1980,
    personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
    relationships: [],
    skills: [],
    genealogy: { parentIds: [], siblingIds: [], spouseId: null, childIds: [] },
    occupation: null,
    currentLocationId: null,
    status: 'alive',
  } as any;
}

function createMockNpc(characterId: string, questIds: string[] = []): NPCIR {
  return {
    characterId,
    role: 'questgiver',
    homePosition: { x: 10, y: 0, z: 10 },
    patrolRadius: 5,
    disposition: 70,
    settlementId: 'settlement-1',
    questIds,
    greeting: 'Hello!',
    schedule: null,
  };
}

function createMockBuilding(id: string, role: string): BuildingIR {
  return {
    id,
    settlementId: 'settlement-1',
    lotId: null,
    position: { x: 20, y: 0, z: 20 },
    rotation: 0,
    spec: { buildingRole: role, floors: 1, footprint: { width: 10, depth: 10 } } as any,
    style: {} as any,
    occupantIds: [],
    interior: null,
    businessId: null,
    modelAssetKey: null,
  };
}

function createMockItem(id: string, name: string): ItemIR {
  return {
    id,
    name,
    description: null,
    itemType: 'general',
    icon: null,
    value: 10,
    sellValue: 5,
    weight: 1,
    tradeable: true,
    stackable: true,
    maxStack: 99,
    objectRole: null,
    effects: null,
    lootWeight: 1,
    tags: [],
  };
}

function createMockText(id: string, title: string): TextIR {
  return {
    id,
    title,
    titleTranslation: title,
    textCategory: 'book',
    cefrLevel: 'A1',
    pages: [{ content: 'Bonjour le monde!', contentTranslation: 'Hello world!' }],
    vocabularyHighlights: [],
    comprehensionQuestions: [],
    targetLanguage: 'french',
    authorName: null,
    clueText: null,
    difficulty: 'easy',
    tags: [],
    spawnLocationHint: '',
    isMainQuest: false,
  };
}

function createMockDialogue(characterId: string, name: string): NPCDialogueContext {
  return {
    characterId,
    characterName: name,
    systemPrompt: 'You are a helpful NPC.',
    greeting: 'Bonjour!',
    voice: 'default',
    truths: [],
  };
}

function createMockQuest(overrides: Partial<QuestIR> = {}): QuestIR {
  return {
    id: `quest-${Math.random().toString(36).slice(2, 8)}`,
    worldId: 'world-1',
    title: 'Test Quest',
    description: 'A test quest',
    questType: 'vocabulary',
    difficulty: 'easy',
    targetLanguage: 'french',
    gameType: null,
    questChainId: null,
    questChainOrder: null,
    prerequisiteQuestIds: null,
    objectives: [],
    completionCriteria: {},
    experienceReward: 100,
    rewards: {},
    itemRewards: null,
    skillRewards: null,
    unlocks: null,
    failureConditions: null,
    assignedBy: null,
    assignedByCharacterId: null,
    locationId: null,
    locationName: null,
    locationPosition: null,
    tags: [],
    status: 'active',
    content: null,
    ...overrides,
  };
}

function createMinimalWorldIR(overrides: Partial<WorldIR> = {}): WorldIR {
  return {
    meta: {
      insimulVersion: '1.0',
      worldId: 'world-1',
      worldName: 'Test World',
      worldDescription: 'A test world',
      worldType: 'language_learning',
      genreConfig: { id: 'language_adventure' } as any,
      exportTimestamp: new Date().toISOString(),
      exportVersion: 1,
      seed: 'test-seed',
    },
    geography: {
      terrainSize: 512,
      heightmap: [],
      biomes: [],
      countries: [],
      states: [],
      settlements: [{
        id: 'settlement-1',
        worldId: 'world-1',
        countryId: null,
        stateId: null,
        name: 'Test Town',
        description: 'A test town',
        settlementType: 'town',
        terrain: null,
        population: 100,
        foundedYear: null,
        founderIds: [],
        mayorId: null,
        position: { x: 0, y: 0, z: 0 },
        radius: 100,
        elevationProfile: null,
        lots: [],
        businessIds: [],
        internalRoads: [],
        infrastructure: [],
      }],
      waterFeatures: [],
    } as any,
    entities: {
      characters: [
        createMockCharacter('char-1', 'Jean', 'Dupont'),
        createMockCharacter('char-2', 'Marie', 'Leblanc'),
        createMockCharacter('char-3', 'Pierre', 'Martin'),
      ],
      npcs: [
        createMockNpc('char-1', ['quest-1']),
        createMockNpc('char-2', ['quest-2']),
        createMockNpc('char-3'),
      ],
      buildings: [
        createMockBuilding('building-cafe', 'cafe'),
        createMockBuilding('building-bookshop', 'bookshop'),
        createMockBuilding('building-library', 'library'),
      ],
      businesses: [],
      roads: [],
      natureObjects: [],
      animals: [],
      dungeons: [],
      questObjects: [],
      containers: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [],
      truths: [],
      grammars: [],
      languages: [],
      items: [
        createMockItem('item-book', 'Old Book'),
        createMockItem('item-key', 'Rusty Key'),
        createMockItem('item-letter', 'Sealed Letter'),
      ],
      lootTables: [],
      dialogueContexts: [
        createMockDialogue('char-1', 'Jean Dupont'),
        createMockDialogue('char-2', 'Marie Leblanc'),
      ],
      knowledgeBase: null,
      mainQuestLocations: [],
      narrative: null,
      texts: [
        createMockText('text-1', 'Welcome Sign'),
        createMockText('text-2', 'Town History'),
      ],
    },
    theme: {} as any,
    assets: { textures: [], models: [], audio: [], animations: [] } as any,
    player: {} as any,
    ui: {} as any,
    combat: {} as any,
    survival: null,
    resources: null,
    assessment: null,
    languageLearning: null,
    aiConfig: { apiMode: 'insimul', insimulEndpoint: '', geminiModel: '', geminiApiKeyPlaceholder: '', voiceEnabled: false, defaultVoice: '' },
    ...overrides,
  } as WorldIR;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Quest World Validator', () => {
  it('reports all quests feasible when world data matches', () => {
    const world = createMinimalWorldIR();
    world.systems.quests = [
      createMockQuest({
        id: 'quest-1',
        title: 'Talk to Jean',
        objectives: [{ type: 'talk_to_npc', npcId: 'char-1', description: 'Talk to Jean' }],
      }),
      createMockQuest({
        id: 'quest-2',
        title: 'Visit Cafe',
        objectives: [{ type: 'visit_location', locationName: 'cafe', description: 'Visit the cafe' }],
      }),
    ];

    const report = validateQuestsAgainstWorld(world);
    expect(report.feasible).toHaveLength(2);
    expect(report.infeasible).toHaveLength(0);
  });

  it('detects quests referencing non-existent NPCs', () => {
    const world = createMinimalWorldIR();
    world.systems.quests = [
      createMockQuest({
        id: 'quest-bad-npc',
        title: 'Talk to Ghost',
        objectives: [{ type: 'talk_to_npc', npcId: 'char-nonexistent', description: 'Talk to nobody' }],
      }),
    ];

    const report = validateQuestsAgainstWorld(world);
    expect(report.infeasible).toHaveLength(1);
    expect(report.issues.some(i => i.message.includes('char-nonexistent') && i.severity === 'error')).toBe(true);
  });

  it('detects quests referencing non-existent locations', () => {
    const world = createMinimalWorldIR();
    world.systems.quests = [
      createMockQuest({
        id: 'quest-bad-loc',
        title: 'Visit Atlantis',
        objectives: [{ type: 'visit_location', locationName: 'atlantis_ruins', description: 'Find Atlantis' }],
      }),
    ];

    const report = validateQuestsAgainstWorld(world);
    expect(report.infeasible).toHaveLength(1);
    expect(report.issues.some(i => i.message.includes('atlantis_ruins'))).toBe(true);
  });

  it('detects quests referencing non-existent items', () => {
    const world = createMinimalWorldIR();
    world.systems.quests = [
      createMockQuest({
        id: 'quest-bad-item',
        title: 'Collect Magic Orb',
        objectives: [{ type: 'collect_item', itemName: 'magic_orb', description: 'Find the magic orb' }],
      }),
    ];

    const report = validateQuestsAgainstWorld(world);
    expect(report.infeasible).toHaveLength(1);
    expect(report.issues.some(i => i.message.includes('magic_orb'))).toBe(true);
  });

  it('warns when NPC lacks dialogue context for conversation objectives', () => {
    const world = createMinimalWorldIR();
    // char-3 (Pierre) has no dialogue context
    world.systems.quests = [
      createMockQuest({
        id: 'quest-no-dialogue',
        title: 'Talk to Pierre',
        objectives: [{ type: 'talk_to_npc', npcId: 'char-3', description: 'Talk to Pierre' }],
      }),
    ];

    const report = validateQuestsAgainstWorld(world);
    expect(report.feasible).toHaveLength(1); // warnings don't make infeasible
    expect(report.issues.some(i => i.message.includes('dialogue context'))).toBe(true);
  });

  it('validates quest assignedBy character exists', () => {
    const world = createMinimalWorldIR();
    world.systems.quests = [
      createMockQuest({
        id: 'quest-bad-assigner',
        title: 'Quest from Ghost',
        assignedByCharacterId: 'char-ghost',
        assignedBy: 'Ghost NPC',
        objectives: [{ type: 'visit_location', locationName: 'Test Town', description: 'Go to town' }],
      }),
    ];

    const report = validateQuestsAgainstWorld(world);
    expect(report.warnings.some(w => w.includes('char-ghost'))).toBe(true);
  });

  it('finds items from loot tables', () => {
    const world = createMinimalWorldIR();
    world.systems.lootTables = [{
      enemyType: 'bandit',
      entries: [{ itemId: 'item-loot-gem', itemName: 'Ruby Gem', dropChance: 0.5, minQuantity: 1, maxQuantity: 1 }],
      goldMin: 0,
      goldMax: 10,
    }];
    world.systems.quests = [
      createMockQuest({
        id: 'quest-loot-item',
        title: 'Collect Gem',
        objectives: [{ type: 'collect_item', itemName: 'Ruby Gem', description: 'Find the gem' }],
      }),
    ];

    const report = validateQuestsAgainstWorld(world);
    expect(report.feasible).toHaveLength(1);
    expect(report.infeasible).toHaveLength(0);
  });

  it('handles quests with no objectives gracefully', () => {
    const world = createMinimalWorldIR();
    world.systems.quests = [
      createMockQuest({ id: 'quest-empty', title: 'Empty Quest', objectives: [] }),
    ];

    const report = validateQuestsAgainstWorld(world);
    expect(report.feasible).toHaveLength(1);
  });
});

describe('Quest Dependency Graph Validator', () => {
  it('validates a clean dependency graph', () => {
    const quests: QuestIR[] = [
      createMockQuest({ id: 'q1', title: 'First Quest' }),
      createMockQuest({ id: 'q2', title: 'Second Quest', prerequisiteQuestIds: ['q1'] }),
      createMockQuest({ id: 'q3', title: 'Third Quest', prerequisiteQuestIds: ['q2'] }),
    ];

    const report = validateQuestDependencyGraph(quests);
    expect(report.valid).toBe(true);
    expect(report.entryPoints).toContain('q1');
    expect(report.terminalQuests).toContain('q3');
  });

  it('detects circular dependencies', () => {
    const quests: QuestIR[] = [
      createMockQuest({ id: 'q1', title: 'Quest A', prerequisiteQuestIds: ['q2'] }),
      createMockQuest({ id: 'q2', title: 'Quest B', prerequisiteQuestIds: ['q1'] }),
    ];

    const report = validateQuestDependencyGraph(quests);
    expect(report.valid).toBe(false);
    expect(report.issues.some(i => i.message.includes('Circular dependency'))).toBe(true);
  });

  it('detects missing prerequisites', () => {
    const quests: QuestIR[] = [
      createMockQuest({ id: 'q1', title: 'Quest A', prerequisiteQuestIds: ['q-nonexistent'] }),
    ];

    const report = validateQuestDependencyGraph(quests);
    expect(report.valid).toBe(false);
    expect(report.issues.some(i => i.message.includes('q-nonexistent') && i.message.includes('does not exist'))).toBe(true);
  });

  it('detects chain gaps', () => {
    const quests: QuestIR[] = [
      createMockQuest({ id: 'q1', title: 'Chain Step 1', questChainId: 'chain-1', questChainOrder: 1 }),
      createMockQuest({ id: 'q3', title: 'Chain Step 3', questChainId: 'chain-1', questChainOrder: 3 }),
      // Missing step 2
    ];

    const report = validateQuestDependencyGraph(quests);
    expect(report.issues.some(i => i.message.includes('gap'))).toBe(true);
  });

  it('builds chains correctly', () => {
    const quests: QuestIR[] = [
      createMockQuest({ id: 'q1', title: 'Step 1', questChainId: 'chain-a', questChainOrder: 1 }),
      createMockQuest({ id: 'q2', title: 'Step 2', questChainId: 'chain-a', questChainOrder: 2 }),
      createMockQuest({ id: 'q3', title: 'Step 3', questChainId: 'chain-a', questChainOrder: 3 }),
    ];

    const report = validateQuestDependencyGraph(quests);
    expect(report.chains.get('chain-a')).toEqual(['q1', 'q2', 'q3']);
  });

  it('generates mermaid diagram', () => {
    const quests: QuestIR[] = [
      createMockQuest({ id: 'q1', title: 'First' }),
      createMockQuest({ id: 'q2', title: 'Second', prerequisiteQuestIds: ['q1'] }),
    ];

    const report = validateQuestDependencyGraph(quests);
    expect(report.mermaidDiagram).toContain('graph TD');
    expect(report.mermaidDiagram).toContain('q1');
    expect(report.mermaidDiagram).toContain('q2');
  });

  it('validates empty quest list', () => {
    const report = validateQuestDependencyGraph([]);
    expect(report.valid).toBe(true);
    expect(report.entryPoints).toHaveLength(0);
  });

  it('detects all-prerequisite deadlock', () => {
    const quests: QuestIR[] = [
      createMockQuest({ id: 'q1', title: 'Quest A', prerequisiteQuestIds: ['q3'] }),
      createMockQuest({ id: 'q2', title: 'Quest B', prerequisiteQuestIds: ['q1'] }),
      createMockQuest({ id: 'q3', title: 'Quest C', prerequisiteQuestIds: ['q2'] }),
    ];

    const report = validateQuestDependencyGraph(quests);
    expect(report.valid).toBe(false);
    // Should detect either cycles or no entry points
    const hasCycleOrDeadlock = report.issues.some(i =>
      i.message.includes('Circular') || i.message.includes('entry point'),
    );
    expect(hasCycleOrDeadlock).toBe(true);
  });
});

describe('Export Validation Report', () => {
  it('passes a valid world', () => {
    const world = createMinimalWorldIR();
    world.systems.quests = [
      createMockQuest({
        id: 'quest-1',
        title: 'Talk to Jean',
        objectives: [{ type: 'talk_to_npc', npcId: 'char-1', description: 'Talk to Jean' }],
      }),
    ];

    const report = validateWorldForExport(world);
    expect(report.canExport).toBe(true);
    expect(report.summary.errors).toBe(0);
    expect(report.health.totalQuests).toBe(1);
    expect(report.health.completableQuests).toBe(1);
  });

  it('blocks export for world with no NPCs', () => {
    const world = createMinimalWorldIR();
    world.entities.npcs = [];
    world.entities.characters = [];
    world.systems.dialogueContexts = [];

    const report = validateWorldForExport(world);
    expect(report.canExport).toBe(false);
    expect(report.entries.some(e => e.severity === 'error' && e.message.includes('no NPCs'))).toBe(true);
  });

  it('blocks export for world with no settlements', () => {
    const world = createMinimalWorldIR();
    world.geography.settlements = [];

    const report = validateWorldForExport(world);
    expect(report.canExport).toBe(false);
    expect(report.entries.some(e => e.severity === 'error' && e.message.includes('no settlements'))).toBe(true);
  });

  it('warns about NPCs without dialogue contexts', () => {
    const world = createMinimalWorldIR();
    // char-3 has no dialogue context
    const report = validateWorldForExport(world);
    expect(report.entries.some(e => e.severity === 'warning' && e.message.includes('no dialogue context'))).toBe(true);
    expect(report.health.npcsWithDialogue).toBe(2);
    expect(report.health.totalNpcs).toBe(3);
  });

  it('warns about quests with non-existent item rewards', () => {
    const world = createMinimalWorldIR();
    world.systems.quests = [
      createMockQuest({
        id: 'quest-bad-reward',
        title: 'Quest with bad reward',
        itemRewards: [{ itemId: 'item-nonexistent', quantity: 1, name: 'Ghost Sword' }],
        objectives: [],
      }),
    ];

    const report = validateWorldForExport(world);
    expect(report.entries.some(e => e.message.includes('Ghost Sword'))).toBe(true);
  });

  it('reports correct health metrics', () => {
    const world = createMinimalWorldIR();
    world.systems.quests = [
      createMockQuest({ id: 'q1', title: 'Good Quest', objectives: [] }),
      createMockQuest({
        id: 'q2',
        title: 'Bad Quest',
        objectives: [{ type: 'talk_to_npc', npcId: 'ghost-npc', description: 'Talk to ghost' }],
      }),
    ];

    const report = validateWorldForExport(world);
    expect(report.health.totalQuests).toBe(2);
    expect(report.health.completableQuests).toBe(1);
    expect(report.health.totalBuildings).toBe(3);
    expect(report.health.totalTexts).toBe(2);
    expect(report.health.totalSettlements).toBe(1);
  });
});

describe('QuestCompletionEngine Playability Simulation', () => {
  let engine: QuestCompletionEngine;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
  });

  it('completes a talk_to_npc quest via event simulation', () => {
    const quest: CompletionQuest = {
      id: 'quest-talk',
      objectives: [{
        id: 'obj-1',
        questId: 'quest-talk',
        type: 'talk_to_npc',
        description: 'Talk to Jean',
        completed: false,
        npcId: 'char-1',
      }],
    };

    engine.addQuest(quest);
    engine.trackEvent({ type: 'npc_conversation', npcId: 'char-1' });

    expect(engine.isQuestComplete('quest-talk')).toBe(true);
  });

  it('completes a visit_location quest via event simulation', () => {
    const quest: CompletionQuest = {
      id: 'quest-visit',
      objectives: [{
        id: 'obj-1',
        questId: 'quest-visit',
        type: 'visit_location',
        description: 'Visit the cafe',
        completed: false,
        locationName: 'cafe',
      }],
    };

    engine.addQuest(quest);
    // location_discovery triggers trackLocationVisit which matches by name
    engine.trackEvent({ type: 'location_discovery', locationId: 'cafe', locationName: 'cafe' });

    expect(engine.isQuestComplete('quest-visit')).toBe(true);
  });

  it('completes a collect_item quest via event simulation', () => {
    const quest: CompletionQuest = {
      id: 'quest-collect',
      objectives: [{
        id: 'obj-1',
        questId: 'quest-collect',
        type: 'collect_item',
        description: 'Collect the old book',
        completed: false,
        itemName: 'Old Book',
        itemCount: 1,
        collectedCount: 0,
      }],
    };

    engine.addQuest(quest);
    engine.trackEvent({ type: 'collect_item_by_name', itemName: 'Old Book' });

    expect(engine.isQuestComplete('quest-collect')).toBe(true);
  });

  it('completes multi-objective quest sequentially', () => {
    const quest: CompletionQuest = {
      id: 'quest-multi',
      objectives: [
        {
          id: 'obj-1',
          questId: 'quest-multi',
          type: 'talk_to_npc',
          description: 'Talk to Jean',
          completed: false,
          npcId: 'char-1',
        },
        {
          id: 'obj-2',
          questId: 'quest-multi',
          type: 'visit_location',
          description: 'Visit the cafe',
          completed: false,
          locationName: 'cafe',
        },
        {
          id: 'obj-3',
          questId: 'quest-multi',
          type: 'collect_item',
          description: 'Collect the key',
          completed: false,
          itemName: 'Rusty Key',
          itemCount: 1,
          collectedCount: 0,
        },
      ],
    };

    engine.addQuest(quest);
    expect(engine.isQuestComplete('quest-multi')).toBe(false);

    engine.trackEvent({ type: 'npc_conversation', npcId: 'char-1' });
    expect(engine.isQuestComplete('quest-multi')).toBe(false);

    engine.trackEvent({ type: 'location_discovery', locationId: 'cafe', locationName: 'cafe' });
    expect(engine.isQuestComplete('quest-multi')).toBe(false);

    engine.trackEvent({ type: 'collect_item_by_name', itemName: 'Rusty Key' });
    expect(engine.isQuestComplete('quest-multi')).toBe(true);
  });

  it('side quests do not block main quest progression', () => {
    // Main quest
    const mainQuest: CompletionQuest = {
      id: 'main-quest',
      objectives: [{
        id: 'main-obj-1',
        questId: 'main-quest',
        type: 'talk_to_npc',
        description: 'Talk to main NPC',
        completed: false,
        npcId: 'char-1',
      }],
    };

    // Side quest — independent
    const sideQuest: CompletionQuest = {
      id: 'side-quest',
      objectives: [{
        id: 'side-obj-1',
        questId: 'side-quest',
        type: 'collect_item',
        description: 'Collect rare gem',
        completed: false,
        itemName: 'Rare Gem',
        itemCount: 5,
        collectedCount: 0,
      }],
    };

    engine.addQuest(mainQuest);
    engine.addQuest(sideQuest);

    // Complete main quest without touching side quest
    engine.trackEvent({ type: 'npc_conversation', npcId: 'char-1' });

    expect(engine.isQuestComplete('main-quest')).toBe(true);
    expect(engine.isQuestComplete('side-quest')).toBe(false);
  });

  it('completes vocabulary objective via word usage', () => {
    const quest: CompletionQuest = {
      id: 'quest-vocab',
      objectives: [{
        id: 'obj-1',
        questId: 'quest-vocab',
        type: 'use_vocabulary',
        description: 'Use greeting words',
        completed: false,
        targetWords: ['bonjour', 'merci'],
        wordsUsed: [],
        requiredCount: 2,
        currentCount: 0,
      }],
    };

    engine.addQuest(quest);
    engine.trackEvent({ type: 'vocabulary_usage', word: 'bonjour' });
    expect(engine.isQuestComplete('quest-vocab')).toBe(false);

    engine.trackEvent({ type: 'vocabulary_usage', word: 'merci' });
    expect(engine.isQuestComplete('quest-vocab')).toBe(true);
  });

  it('handles objective dependencies correctly', () => {
    const quest: CompletionQuest = {
      id: 'quest-deps',
      objectives: [
        {
          id: 'obj-1',
          questId: 'quest-deps',
          type: 'talk_to_npc',
          description: 'Talk to Jean first',
          completed: false,
          npcId: 'char-1',
          order: 1,
        },
        {
          id: 'obj-2',
          questId: 'quest-deps',
          type: 'visit_location',
          description: 'Then visit cafe',
          completed: false,
          locationName: 'cafe',
          order: 2,
          dependsOn: ['obj-1'],
        },
      ],
    };

    engine.addQuest(quest);

    // obj-2 should be locked
    expect(engine.isObjectiveLocked(quest, quest.objectives![1])).toBe(true);

    // Complete obj-1
    engine.trackEvent({ type: 'npc_conversation', npcId: 'char-1' });

    // obj-2 should now be unlocked
    expect(engine.isObjectiveLocked(quest, quest.objectives![1])).toBe(false);

    // Complete obj-2
    engine.trackEvent({ type: 'location_discovery', locationId: 'cafe', locationName: 'cafe' });
    expect(engine.isQuestComplete('quest-deps')).toBe(true);
  });

  it('tracks pronunciation attempts', () => {
    const quest: CompletionQuest = {
      id: 'quest-pronun',
      objectives: [{
        id: 'obj-1',
        questId: 'quest-pronun',
        type: 'pronunciation_check',
        description: 'Pronounce bonjour correctly',
        completed: false,
        requiredCount: 1,
        currentCount: 0,
        minAverageScore: 60,
        pronunciationScores: [],
      }],
    };

    engine.addQuest(quest);
    engine.trackEvent({ type: 'pronunciation_attempt', passed: true, score: 80 });

    expect(engine.isQuestComplete('quest-pronun')).toBe(true);
  });
});

describe('Playability Report Generation', () => {
  it('generates a full playability report from WorldIR', () => {
    const world = createMinimalWorldIR();
    world.systems.quests = [
      createMockQuest({
        id: 'q1',
        title: 'Good Quest',
        objectives: [{ type: 'talk_to_npc', npcId: 'char-1', description: 'Talk' }],
      }),
      createMockQuest({
        id: 'q2',
        title: 'Bad Quest',
        objectives: [{ type: 'talk_to_npc', npcId: 'ghost', description: 'Talk to ghost' }],
      }),
      createMockQuest({
        id: 'q3',
        title: 'Item Quest',
        objectives: [{ type: 'collect_item', itemName: 'Old Book', description: 'Find it' }],
      }),
    ];

    const worldReport = validateQuestsAgainstWorld(world);
    const depReport = validateQuestDependencyGraph(world.systems.quests);
    const exportReport = validateWorldForExport(world);

    // Playability summary
    const completable = worldReport.feasible.length;
    const total = world.systems.quests.length;
    const issues = worldReport.infeasible.map(q => q.title);

    expect(completable).toBe(2);
    expect(total).toBe(3);
    expect(issues).toContain('Bad Quest');
    expect(depReport.valid).toBe(true);
    // Quest referencing 'ghost' NPC creates an error, so export is blocked
    expect(exportReport.summary.errors).toBeGreaterThan(0);
  });

  it('main quest chapters are validated', () => {
    const world = createMinimalWorldIR();
    // Add a minimal set of quests but not enough for chapters
    world.systems.quests = [
      createMockQuest({ id: 'q1', title: 'Vocab Quest', questType: 'vocabulary' }),
    ];

    const depReport = validateQuestDependencyGraph(world.systems.quests);
    // Should warn about insufficient quests for chapter objectives
    const chapterWarnings = depReport.issues.filter(i =>
      i.message.includes('Chapter'),
    );
    expect(chapterWarnings.length).toBeGreaterThan(0);
  });
});
