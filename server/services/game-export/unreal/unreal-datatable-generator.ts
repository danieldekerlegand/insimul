/**
 * Unreal DataTable Generator
 *
 * Converts IR data arrays into Unreal Engine DataTable-compatible JSON files.
 * These can be imported directly into UE5 as DataTable assets, or loaded
 * at runtime via the GameInstance JSON loader.
 *
 * Format: Unreal DataTable JSON uses an array of objects where each object
 * has a "Name" key (row name) plus all USTRUCT fields.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './unreal-project-generator';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Convert IR Vec3 {x,y,z} to Unreal FVector string: (X=...,Y=...,Z=...) */
function vec3ToUnreal(v: { x: number; y: number; z: number }): string {
  // Unreal uses Z-up, Babylon uses Y-up → swap Y and Z, scale ×100 (m→cm)
  return `(X=${(v.x * 100).toFixed(1)},Y=${(v.z * 100).toFixed(1)},Z=${(v.y * 100).toFixed(1)})`;
}

/** FVector as object for JSON DataTable format */
function vec3Obj(v: { x: number; y: number; z: number }): { X: number; Y: number; Z: number } {
  return { X: v.x * 100, Y: v.z * 100, Z: v.y * 100 };
}

// ─────────────────────────────────────────────
// Character DataTable
// ─────────────────────────────────────────────

function generateCharactersDT(ir: WorldIR): object[] {
  return ir.entities.characters.map(c => {
    const p = c.personality || { openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0 };
    return {
      Name: c.id,
      CharacterId: c.id,
      FirstName: c.firstName,
      LastName: c.lastName,
      Gender: c.gender,
      bIsAlive: c.isAlive,
      Occupation: c.occupation || '',
      CurrentLocation: c.currentLocation || '',
      Status: c.status || '',
      BirthYear: c.birthYear || 0,
      Openness: p.openness || 0,
      Conscientiousness: p.conscientiousness || 0,
      Extroversion: p.extroversion || 0,
      Agreeableness: p.agreeableness || 0,
      Neuroticism: p.neuroticism || 0,
    };
  });
}

// ─────────────────────────────────────────────
// NPC DataTable
// ─────────────────────────────────────────────

function generateNPCsDT(ir: WorldIR): object[] {
  return ir.entities.npcs.map(n => ({
    Name: n.characterId,
    CharacterId: n.characterId,
    Role: n.role,
    HomePosition: vec3Obj(n.homePosition),
    PatrolRadius: n.patrolRadius,
    Disposition: n.disposition,
    SettlementId: n.settlementId || '',
    QuestIds: n.questIds,
  }));
}

// ─────────────────────────────────────────────
// Action DataTable
// ─────────────────────────────────────────────

function generateActionsDT(ir: WorldIR): object[] {
  const all = [...ir.systems.actions, ...ir.systems.baseActions];
  return all.map(a => ({
    Name: a.id,
    ActionId: a.id,
    ActionName: a.name,
    Description: a.description || '',
    ActionType: a.actionType,
    Category: a.category || '',
    Duration: a.duration,
    Difficulty: a.difficulty,
    EnergyCost: a.energyCost,
    bRequiresTarget: a.requiresTarget,
    Range: a.range,
    Cooldown: a.cooldown,
    bIsActive: a.isActive,
    Tags: a.tags,
  }));
}

// ─────────────────────────────────────────────
// Rule DataTable
// ─────────────────────────────────────────────

function generateRulesDT(ir: WorldIR): object[] {
  const all = [...ir.systems.rules, ...ir.systems.baseRules];
  return all.map(r => ({
    Name: r.id,
    RuleId: r.id,
    RuleName: r.name,
    Description: r.description || '',
    Content: r.content,
    RuleType: r.ruleType,
    Category: r.category || '',
    Priority: r.priority,
    Likelihood: r.likelihood,
    bIsBase: r.isBase,
    bIsActive: r.isActive,
    Tags: r.tags,
  }));
}

// ─────────────────────────────────────────────
// Quest DataTable
// ─────────────────────────────────────────────

function generateQuestsDT(ir: WorldIR): object[] {
  return ir.systems.quests.map(q => ({
    Name: q.id,
    QuestId: q.id,
    Title: q.title,
    Description: q.description,
    QuestType: q.questType,
    Difficulty: q.difficulty,
    ExperienceReward: q.experienceReward,
    AssignedByCharacterId: q.assignedByCharacterId || '',
    LocationId: q.locationId || '',
    LocationName: q.locationName || '',
    LocationX: q.locationPosition?.x ?? 0,
    LocationY: q.locationPosition?.y ?? 0,
    LocationZ: q.locationPosition?.z ?? 0,
    Status: q.status,
    Tags: q.tags,
    PrerequisiteQuestIds: q.prerequisiteQuestIds || [],
    ItemRewards: (q.itemRewards || []).map(r => ({
      ItemId: r.itemId,
      Quantity: r.quantity,
      ItemName: r.name,
    })),
  }));
}

// ─────────────────────────────────────────────
// Settlement DataTable
// ─────────────────────────────────────────────

function generateSettlementsDT(ir: WorldIR): object[] {
  return ir.geography.settlements.map(s => ({
    Name: s.id,
    SettlementId: s.id,
    SettlementName: s.name,
    Description: s.description || '',
    SettlementType: s.settlementType,
    Population: s.population,
    Position: vec3Obj(s.position),
    Radius: s.radius * 100, // scale to cm
    CountryId: s.countryId || '',
    StateId: s.stateId || '',
    MayorId: s.mayorId || '',
    StreetNetworkLayout: s.streetNetwork.layout,
    StreetNodes: s.streetNetwork.nodes.map(n => ({
      Id: n.id,
      Position: vec3Obj(n.position),
      IntersectionOf: n.intersectionOf,
    })),
    StreetSegments: s.streetNetwork.segments.map(seg => ({
      Id: seg.id,
      Name: seg.name,
      Direction: seg.direction,
      NodeIds: seg.nodeIds,
      Waypoints: seg.waypoints.map(w => vec3Obj(w)),
      Width: seg.width * 100, // scale to cm
    })),
  }));
}

// ─────────────────────────────────────────────
// Water Feature DataTable
// ─────────────────────────────────────────────

function generateWaterFeaturesDT(ir: WorldIR): object[] {
  return ir.geography.waterFeatures.map(w => ({
    Name: w.id,
    WaterFeatureId: w.id,
    WaterFeatureName: w.name,
    WaterType: w.type,
    SubType: w.subType,
    Position: vec3Obj(w.position),
    WaterLevel: w.waterLevel * 100,
    Depth: w.depth * 100,
    Width: w.width * 100,
    FlowSpeed: w.flowSpeed,
    bIsNavigable: w.isNavigable,
    bIsDrinkable: w.isDrinkable,
    SettlementId: w.settlementId || '',
    Biome: w.biome || '',
    Transparency: w.transparency,
    ModelAssetKey: w.modelAssetKey || '',
  }));
}

// ─────────────────────────────────────────────
// Building DataTable
// ─────────────────────────────────────────────

function generateBuildingsDT(ir: WorldIR): object[] {
  return ir.entities.buildings.map(b => ({
    Name: b.id,
    BuildingId: b.id,
    SettlementId: b.settlementId,
    Position: vec3Obj(b.position),
    Rotation: b.rotation,
    BuildingRole: b.spec.buildingRole,
    Floors: b.spec.floors,
    Width: b.spec.width * 100,
    Depth: b.spec.depth * 100,
    bHasChimney: b.spec.hasChimney,
    bHasBalcony: b.spec.hasBalcony,
    ModelAssetKey: b.modelAssetKey || '',
    BusinessId: b.businessId || '',
  }));
}

// ─────────────────────────────────────────────
// Grammar DataTable
// ─────────────────────────────────────────────

function generateGrammarsDT(ir: WorldIR): object[] {
  return ir.systems.grammars.map(g => ({
    Name: g.id,
    GrammarId: g.id,
    GrammarName: g.name,
    Description: g.description || '',
    GrammarJson: JSON.stringify(g.grammar),
    Tags: g.tags,
    WorldType: g.worldType || '',
    bIsActive: g.isActive,
  }));
}

// ─────────────────────────────────────────────
// Truth DataTable
// ─────────────────────────────────────────────

function generateTruthsDT(ir: WorldIR): object[] {
  return ir.systems.truths.map(t => ({
    Name: t.id,
    TruthId: t.id,
    Title: t.title,
    Content: t.content,
    EntryType: t.entryType,
    Timestep: t.timestep,
    Importance: t.importance,
    bIsPublic: t.isPublic,
    Tags: t.tags,
    RelatedCharacterIds: t.relatedCharacterIds,
    RelatedLocationIds: t.relatedLocationIds,
  }));
}

// ─────────────────────────────────────────────
// Road DataTable
// ─────────────────────────────────────────────

function generateRoadsDT(ir: WorldIR): object[] {
  return ir.entities.roads.map((r, i) => ({
    Name: `road_${i}`,
    FromId: r.fromId,
    ToId: r.toId,
    Width: r.width * 100,
    Waypoints: r.waypoints.map(w => vec3Obj(w)),
  }));
}

// ─────────────────────────────────────────────
// Business DataTable
// ─────────────────────────────────────────────

function generateBusinessesDT(ir: WorldIR): object[] {
  return ir.entities.businesses.map(b => ({
    Name: b.id,
    BusinessId: b.id,
    SettlementId: b.settlementId,
    BusinessName: b.name,
    BusinessType: b.businessType,
    OwnerId: b.ownerId,
    bIsOutOfBusiness: b.isOutOfBusiness,
    FoundedYear: b.foundedYear,
    LotId: b.lotId || '',
  }));
}

// ─────────────────────────────────────────────
// Item DataTable
// ─────────────────────────────────────────────

function generateItemsDT(ir: WorldIR): object[] {
  return ir.systems.items.map(item => ({
    Name: item.id,
    ItemId: item.id,
    ItemName: item.name,
    Description: item.description || '',
    ItemType: item.itemType,
    Icon: item.icon || '',
    Value: item.value,
    SellValue: item.sellValue,
    Weight: item.weight,
    bTradeable: item.tradeable,
    bStackable: item.stackable,
    MaxStack: item.maxStack,
    ObjectRole: item.objectRole || '',
    Effects: item.effects || {},
    LootWeight: item.lootWeight,
    Tags: item.tags,
  }));
}

// ─────────────────────────────────────────────
// Loot Table DataTable
// ─────────────────────────────────────────────

function generateLootTablesDT(ir: WorldIR): object[] {
  return ir.systems.lootTables.map((lt, i) => ({
    Name: `loot_${lt.enemyType}_${i}`,
    EnemyType: lt.enemyType,
    Entries: lt.entries.map(e => ({
      ItemId: e.itemId,
      ItemName: e.itemName,
      DropChance: e.dropChance,
      MinQuantity: e.minQuantity,
      MaxQuantity: e.maxQuantity,
    })),
    GoldMin: lt.goldMin,
    GoldMax: lt.goldMax,
  }));
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateDataTableFiles(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const base = 'Content/Data';

  // Full WorldIR JSON (runtime loader reads this)
  files.push({
    path: `${base}/WorldIR.json`,
    content: JSON.stringify(ir, null, 2),
  });

  // Individual DataTable JSON files (importable into UE5 editor)
  const tables: { name: string; data: object[] }[] = [
    { name: 'DT_Characters', data: generateCharactersDT(ir) },
    { name: 'DT_NPCs', data: generateNPCsDT(ir) },
    { name: 'DT_Actions', data: generateActionsDT(ir) },
    { name: 'DT_Rules', data: generateRulesDT(ir) },
    { name: 'DT_Quests', data: generateQuestsDT(ir) },
    { name: 'DT_Settlements', data: generateSettlementsDT(ir) },
    { name: 'DT_WaterFeatures', data: generateWaterFeaturesDT(ir) },
    { name: 'DT_Buildings', data: generateBuildingsDT(ir) },
    { name: 'DT_Grammars', data: generateGrammarsDT(ir) },
    { name: 'DT_Truths', data: generateTruthsDT(ir) },
    { name: 'DT_Roads', data: generateRoadsDT(ir) },
    { name: 'DT_Businesses', data: generateBusinessesDT(ir) },
    { name: 'DT_Items', data: generateItemsDT(ir) },
    { name: 'DT_LootTables', data: generateLootTablesDT(ir) },
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
      path: `${base}/DT_DialogueContexts.json`,
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
