/**
 * Unity Data Generator
 *
 * Converts IR data into Unity-compatible JSON files placed in
 * Assets/Resources/Data/ so they can be loaded at runtime via
 * Resources.Load<TextAsset>().
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './unity-project-generator';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Unity is Y-up like Babylon, so no axis swap needed — just pass through */
function vec3(v: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  return { x: v.x, y: v.y, z: v.z };
}

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
  }));
}

function generateNPCs(ir: WorldIR): object[] {
  return ir.entities.npcs.map(n => ({
    characterId: n.characterId,
    role: n.role,
    homePosition: vec3(n.homePosition),
    patrolRadius: n.patrolRadius,
    disposition: n.disposition,
    settlementId: n.settlementId || '',
    questIds: n.questIds,
    schedule: n.schedule || null,
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
  }));
}

function generateSettlements(ir: WorldIR): object[] {
  return ir.geography.settlements.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description || '',
    settlementType: s.settlementType,
    population: s.population,
    position: vec3(s.position),
    radius: s.radius,
    countryId: s.countryId || '',
    stateId: s.stateId || '',
    mayorId: s.mayorId || '',
    infrastructure: s.infrastructure || [],
    lots: (s.lots || []).map(l => ({
      id: l.id,
      address: l.address,
      houseNumber: l.houseNumber,
      streetName: l.streetName,
      block: l.block || '',
      districtName: l.districtName || '',
      position: vec3(l.position),
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
    streetNetwork: s.streetNetwork ? {
      layout: s.streetNetwork.layout,
      nodes: s.streetNetwork.nodes.map(n => ({
        id: n.id,
        position: vec3(n.position),
        intersectionOf: n.intersectionOf,
      })),
      segments: s.streetNetwork.segments.map(seg => ({
        id: seg.id,
        name: seg.name,
        direction: seg.direction,
        nodeIds: seg.nodeIds,
        waypoints: seg.waypoints.map(w => vec3(w)),
        width: seg.width,
      })),
    } : null,
  }));
}

function generateWaterFeatures(ir: WorldIR): object[] {
  return ir.geography.waterFeatures.map(w => ({
    id: w.id,
    name: w.name,
    type: w.type,
    subType: w.subType,
    position: vec3(w.position),
    waterLevel: w.waterLevel,
    bounds: w.bounds,
    depth: w.depth,
    width: w.width,
    flowDirection: w.flowDirection ? vec3(w.flowDirection) : null,
    flowSpeed: w.flowSpeed,
    shorelinePoints: w.shorelinePoints.map(p => vec3(p)),
    settlementId: w.settlementId || '',
    biome: w.biome || '',
    isNavigable: w.isNavigable,
    isDrinkable: w.isDrinkable,
    modelAssetKey: w.modelAssetKey || '',
    transparency: w.transparency,
    color: w.color || null,
  }));
}

function generateBuildings(ir: WorldIR): object[] {
  return ir.entities.buildings.map(b => ({
    id: b.id,
    settlementId: b.settlementId,
    lotId: b.lotId || '',
    position: vec3(b.position),
    rotation: b.rotation,
    buildingRole: b.spec.buildingRole,
    floors: b.spec.floors,
    width: b.spec.width,
    depth: b.spec.depth,
    hasChimney: b.spec.hasChimney,
    hasBalcony: b.spec.hasBalcony,
    modelAssetKey: b.modelAssetKey || '',
    businessId: b.businessId || '',
  }));
}

function generateRoads(ir: WorldIR): object[] {
  return ir.entities.roads.map((r, i) => ({
    id: `road_${i}`,
    fromId: r.fromId,
    toId: r.toId,
    width: r.width,
    waypoints: r.waypoints.map(w => vec3(w)),
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

function generateAnimations(ir: WorldIR): object[] {
  return ir.assets.animations.map(a => ({
    name: a.name,
    animationType: a.animationType,
    assetPath: a.assetRef.babylonPath,
    frameRange: a.frameRange,
    loop: a.loop,
    speedRatio: a.speedRatio,
    format: a.format,
    skeletonType: a.skeletonType,
    isMixamo: a.isMixamo,
  }));
}

function generateGatheringNodesData(ir: WorldIR): object[] {
  return (ir.systems.resources?.gatheringNodes ?? []).map(n => ({
    id: n.id,
    resourceType: n.resourceType,
    position: vec3(n.position),
    maxAmount: n.maxAmount,
    respawnTime: n.respawnTime,
    scale: n.scale,
  }));
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateDataFiles(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'Assets/Resources/Data';

  // Full WorldIR (runtime loader)
  files.push({
    path: `${base}/WorldIR.json`,
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
    { name: 'texts', data: (ir.systems.texts || []) },
    { name: 'loot_tables', data: generateLootTables(ir) },
    { name: 'animations', data: generateAnimations(ir) },
    { name: 'gathering_nodes', data: generateGatheringNodesData(ir) },
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
      path: `${base}/DialogueContexts.json`,
      content: JSON.stringify(ir.systems.dialogueContexts, null, 2),
    });
  }

  // AI configuration
  if (ir.aiConfig) {
    files.push({
      path: `${base}/AIConfig.json`,
      content: JSON.stringify(ir.aiConfig, null, 2),
    });
  }

  // Prolog knowledge base
  if (ir.systems.knowledgeBase) {
    files.push({
      path: `${base}/KnowledgeBase.pl`,
      content: ir.systems.knowledgeBase,
    });
  }

  return files;
}
