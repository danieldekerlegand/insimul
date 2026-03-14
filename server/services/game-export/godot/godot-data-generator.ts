/**
 * Godot Data Generator
 *
 * Converts IR data into JSON files placed in res://data/
 * for runtime loading via DataLoader autoload.
 *
 * Godot 4 uses Y-up like Babylon, so no axis swap is needed.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './godot-project-generator';

// ─────────────────────────────────────────────
// Individual data files
// ─────────────────────────────────────────────

function generateCharacters(ir: WorldIR): object[] {
  return ir.entities.characters.map(c => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    gender: c.gender,
    isAlive: c.isAlive,
    occupation: c.occupation || '',
    currentLocation: c.currentLocation || '',
    status: c.status || '',
    birthYear: c.birthYear || 0,
    personality: c.personality,
    coworkerIds: c.coworkerIds,
    friendIds: c.friendIds,
    spouseId: c.spouseId || '',
    middleName: c.middleName || '',
    suffix: c.suffix || '',
  }));
}

function generateNPCs(ir: WorldIR): object[] {
  return ir.entities.npcs.map(n => ({
    characterId: n.characterId,
    role: n.role,
    homePosition: { x: n.homePosition.x, y: n.homePosition.y, z: n.homePosition.z },
    patrolRadius: n.patrolRadius,
    disposition: n.disposition,
    settlementId: n.settlementId || '',
    questIds: n.questIds,
    greeting: n.greeting || '',
  }));
}

function generateActions(ir: WorldIR): object[] {
  return [...ir.systems.actions, ...ir.systems.baseActions].map(a => ({
    id: a.id,
    name: a.name,
    description: a.description || '',
    actionType: a.actionType,
    category: a.category || '',
    duration: a.duration,
    difficulty: a.difficulty,
    energyCost: a.energyCost,
    requiresTarget: a.requiresTarget,
    range: a.range,
    cooldown: a.cooldown,
    isActive: a.isActive,
    tags: a.tags,
    content: a.content || '',
    verbPast: a.verbPast || '',
    verbPresent: a.verbPresent || '',
    narrativeTemplates: a.narrativeTemplates || [],
    customData: a.customData || {},
    targetType: a.targetType || '',
    isBase: a.isBase,
    sourceFormat: a.sourceFormat || '',
  }));
}

function generateRules(ir: WorldIR): object[] {
  return [...ir.systems.rules, ...ir.systems.baseRules].map(r => ({
    id: r.id,
    name: r.name,
    description: r.description || '',
    content: r.content,
    ruleType: r.ruleType,
    category: r.category || '',
    priority: r.priority,
    likelihood: r.likelihood,
    isBase: r.isBase,
    isActive: r.isActive,
    tags: r.tags,
  }));
}

function generateQuests(ir: WorldIR): object[] {
  return ir.systems.quests.map(q => ({
    id: q.id,
    title: q.title,
    description: q.description,
    questType: q.questType,
    difficulty: q.difficulty,
    experienceReward: q.experienceReward,
    assignedByCharacterId: q.assignedByCharacterId || '',
    locationId: q.locationId || '',
    locationName: q.locationName || '',
    locationPosition: q.locationPosition || null,
    status: q.status,
    tags: q.tags,
    prerequisiteQuestIds: q.prerequisiteQuestIds || [],
    objectives: q.objectives,
    itemRewards: q.itemRewards || [],
    content: q.content || '',
    gameType: q.gameType || '',
    questChainId: q.questChainId || '',
    questChainOrder: q.questChainOrder || 0,
    skillRewards: q.skillRewards || [],
    unlocks: q.unlocks || [],
    failureConditions: q.failureConditions || [],
    completionCriteria: q.completionCriteria || {},
    rewards: q.rewards || {},
  }));
}

function generateSettlements(ir: WorldIR): object[] {
  return ir.geography.settlements.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description || '',
    settlementType: s.settlementType,
    population: s.population,
    position: { x: s.position.x, y: s.position.y, z: s.position.z },
    radius: s.radius,
    countryId: s.countryId || '',
    stateId: s.stateId || '',
    mayorId: s.mayorId || '',
    elevationProfile: s.elevationProfile || null,
    infrastructure: s.infrastructure || [],
    lots: s.lots.map(l => ({
      id: l.id,
      address: l.address,
      houseNumber: l.houseNumber,
      streetName: l.streetName,
      block: l.block || '',
      districtName: l.districtName || '',
      position: { x: l.position.x, y: l.position.y, z: l.position.z },
      facingAngle: l.facingAngle,
      elevation: l.elevation,
      buildingType: l.buildingType || '',
      buildingId: l.buildingId || '',
      streetEdgeId: l.streetEdgeId || '',
      side: l.side || '',
      neighboringLotIds: l.neighboringLotIds,
      distanceFromDowntown: l.distanceFromDowntown,
      formerBuildingIds: l.formerBuildingIds,
    })),
    streetNetwork: {
      layout: s.streetNetwork.layout,
      nodes: s.streetNetwork.nodes.map(n => ({
        id: n.id,
        position: { x: n.position.x, y: n.position.y, z: n.position.z },
        intersectionOf: n.intersectionOf,
      })),
      segments: s.streetNetwork.segments.map(seg => ({
        id: seg.id,
        name: seg.name,
        direction: seg.direction,
        nodeIds: seg.nodeIds,
        waypoints: seg.waypoints.map(w => ({ x: w.x, y: w.y, z: w.z })),
        width: seg.width,
      })),
    },
  }));
}

function generateWaterFeatures(ir: WorldIR): object[] {
  return ir.geography.waterFeatures.map(w => ({
    id: w.id,
    name: w.name,
    type: w.type,
    subType: w.subType,
    position: { x: w.position.x, y: w.position.y, z: w.position.z },
    waterLevel: w.waterLevel,
    bounds: w.bounds,
    depth: w.depth,
    width: w.width,
    flowDirection: w.flowDirection ? { x: w.flowDirection.x, y: w.flowDirection.y, z: w.flowDirection.z } : null,
    flowSpeed: w.flowSpeed,
    shorelinePoints: w.shorelinePoints.map(p => ({ x: p.x, y: p.y, z: p.z })),
    settlementId: w.settlementId || '',
    biome: w.biome || '',
    isNavigable: w.isNavigable,
    isDrinkable: w.isDrinkable,
    modelAssetKey: w.modelAssetKey || '',
    transparency: w.transparency,
  }));
}

function generateBuildings(ir: WorldIR): object[] {
  return ir.entities.buildings.map(b => ({
    id: b.id,
    settlementId: b.settlementId,
    lotId: b.lotId || '',
    position: { x: b.position.x, y: b.position.y, z: b.position.z },
    rotation: b.rotation,
    spec: {
      buildingRole: b.spec.buildingRole,
      floors: b.spec.floors,
      width: b.spec.width,
      depth: b.spec.depth,
      hasChimney: b.spec.hasChimney,
      hasBalcony: b.spec.hasBalcony,
    },
    modelAssetKey: b.modelAssetKey || '',
    businessId: b.businessId || '',
    occupantIds: b.occupantIds || [],
  }));
}

function generateRoads(ir: WorldIR): object[] {
  return ir.entities.roads.map((r, i) => ({
    id: `road_${i}`,
    fromId: r.fromId,
    toId: r.toId,
    width: r.width,
    waypoints: r.waypoints.map(w => ({ x: w.x, y: w.y, z: w.z })),
  }));
}

function generateBusinesses(ir: WorldIR): object[] {
  return ir.entities.businesses.map(b => ({
    id: b.id,
    settlementId: b.settlementId,
    name: b.name,
    businessType: b.businessType,
    ownerId: b.ownerId,
    isOutOfBusiness: b.isOutOfBusiness,
    foundedYear: b.foundedYear,
    lotId: b.lotId || '',
  }));
}

function generateGrammars(ir: WorldIR): object[] {
  return ir.systems.grammars.map(g => ({
    id: g.id,
    name: g.name,
    description: g.description || '',
    grammar: g.grammar,
    tags: g.tags,
    worldType: g.worldType || '',
    isActive: g.isActive,
  }));
}

function generateTruths(ir: WorldIR): object[] {
  return ir.systems.truths.map(t => ({
    id: t.id,
    title: t.title,
    content: t.content,
    entryType: t.entryType,
    timestep: t.timestep,
    importance: t.importance,
    isPublic: t.isPublic,
    tags: t.tags,
    relatedCharacterIds: t.relatedCharacterIds,
    relatedLocationIds: t.relatedLocationIds,
  }));
}

function generateItems(ir: WorldIR): object[] {
  return ir.systems.items.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    itemType: item.itemType,
    icon: item.icon || '',
    value: item.value,
    sellValue: item.sellValue,
    weight: item.weight,
    tradeable: item.tradeable,
    stackable: item.stackable,
    maxStack: item.maxStack,
    objectRole: item.objectRole || '',
    effects: item.effects || {},
    lootWeight: item.lootWeight,
    tags: item.tags,
  }));
}

function generateLootTables(ir: WorldIR): object[] {
  return ir.systems.lootTables.map(lt => ({
    enemyType: lt.enemyType,
    entries: lt.entries.map(e => ({
      itemId: e.itemId,
      itemName: e.itemName,
      dropChance: e.dropChance,
      minQuantity: e.minQuantity,
      maxQuantity: e.maxQuantity,
    })),
    goldMin: lt.goldMin,
    goldMax: lt.goldMax,
  }));
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateDataFiles(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'data';

  // Full WorldIR (runtime loader reads this)
  files.push({
    path: `${base}/world_ir.json`,
    content: JSON.stringify(ir, null, 2),
  });

  // Individual data files
  const tables: { name: string; data: object[] }[] = [
    { name: 'characters', data: generateCharacters(ir) },
    { name: 'npcs', data: generateNPCs(ir) },
    { name: 'actions', data: generateActions(ir) },
    { name: 'rules', data: generateRules(ir) },
    { name: 'quests', data: generateQuests(ir) },
    { name: 'settlements', data: generateSettlements(ir) },
    { name: 'water_features', data: generateWaterFeatures(ir) },
    { name: 'buildings', data: generateBuildings(ir) },
    { name: 'roads', data: generateRoads(ir) },
    { name: 'businesses', data: generateBusinesses(ir) },
    { name: 'grammars', data: generateGrammars(ir) },
    { name: 'truths', data: generateTruths(ir) },
    { name: 'items', data: generateItems(ir) },
    { name: 'loot_tables', data: generateLootTables(ir) },
  ];

  for (const table of tables) {
    files.push({
      path: `${base}/${table.name}.json`,
      content: JSON.stringify(table.data, null, 2),
    });
  }

  // NPC dialogue contexts (pre-built system prompts for AI chat)
  if (ir.systems.dialogueContexts?.length > 0) {
    files.push({
      path: `${base}/dialogue_contexts.json`,
      content: JSON.stringify(ir.systems.dialogueContexts, null, 2),
    });
  }

  // AI configuration
  if (ir.aiConfig) {
    files.push({
      path: `${base}/ai_config.json`,
      content: JSON.stringify(ir.aiConfig, null, 2),
    });
  }

  // Prolog knowledge base
  if (ir.systems.knowledgeBase) {
    files.push({
      path: `${base}/knowledge_base.pl`,
      content: ir.systems.knowledgeBase,
    });
  }

  return files;
}
