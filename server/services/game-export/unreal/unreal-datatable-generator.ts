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
    Schedule: n.schedule || null,
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
    MinElevation: (s.elevationProfile?.minElevation ?? 0) * 100,
    MaxElevation: (s.elevationProfile?.maxElevation ?? 0) * 100,
    MeanElevation: (s.elevationProfile?.meanElevation ?? 0) * 100,
    ElevationRange: (s.elevationProfile?.elevationRange ?? 0) * 100,
    SlopeClass: s.elevationProfile?.slopeClass ?? 'flat',
    Infrastructure: (s.infrastructure || []).map(inf => ({
      Id: inf.id,
      Name: inf.name,
      Category: inf.category,
      Level: inf.level,
      BuiltYear: inf.builtYear,
      Description: inf.description,
    })),
    StreetNetworkLayout: s.streetNetwork?.layout ?? '',
    StreetNodes: (s.streetNetwork?.nodes || []).map(n => ({
      Id: n.id,
      Position: vec3Obj(n.position),
      IntersectionOf: n.intersectionOf,
    })),
    StreetSegments: (s.streetNetwork?.segments || []).map(seg => ({
      Id: seg.id,
      Name: seg.name,
      Direction: seg.direction,
      NodeIds: seg.nodeIds,
      Waypoints: seg.waypoints.map(w => vec3Obj(w)),
      Width: seg.width * 100, // scale to cm
    })),
    Lots: (s.lots || []).map(l => ({
      Id: l.id,
      Address: l.address,
      HouseNumber: l.houseNumber,
      StreetName: l.streetName,
      Block: l.block || '',
      DistrictName: l.districtName || '',
      Position: vec3Obj(l.position),
      FacingAngle: l.facingAngle,
      Elevation: l.elevation * 100, // scale to cm
      BuildingType: l.buildingType || '',
      BuildingId: l.buildingId || '',
      StreetEdgeId: l.streetEdgeId || '',
      Side: l.side || '',
      NeighboringLotIds: l.neighboringLotIds,
      DistanceFromDowntown: l.distanceFromDowntown,
      FormerBuildingIds: l.formerBuildingIds,
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
// Foliage Layer DataTable
// ─────────────────────────────────────────────

function generateFoliageLayersDT(ir: WorldIR): object[] {
  return ir.geography.foliageLayers.map((l, i) => ({
    Name: `foliage_${l.settlementId}_${l.type}_${i}`,
    FoliageType: l.type,
    Biome: l.biome,
    SettlementId: l.settlementId,
    Density: l.density,
    ScaleRangeMin: l.scaleRange[0],
    ScaleRangeMax: l.scaleRange[1],
    MaxSlope: l.maxSlope,
    ElevationRangeMin: l.elevationRange[0],
    ElevationRangeMax: l.elevationRange[1],
    InstanceCount: l.instances.length,
  }));
}

// ─────────────────────────────────────────────
// Lot DataTable
// ─────────────────────────────────────────────

function generateLotsDT(ir: WorldIR): object[] {
  const lots: object[] = [];
  for (const settlement of ir.geography.settlements) {
    for (const lot of settlement.lots) {
      lots.push({
        Name: lot.id,
        LotId: lot.id,
        Address: lot.address,
        HouseNumber: lot.houseNumber,
        StreetName: lot.streetName,
        Block: lot.block || '',
        DistrictName: lot.districtName || '',
        Position: vec3Obj(lot.position),
        BuildingType: lot.buildingType || '',
        BuildingId: lot.buildingId || '',
        SettlementId: settlement.id,
      });
    }
  }
  return lots;
}

// ─────────────────────────────────────────────
// Building DataTable
// ─────────────────────────────────────────────

function generateBuildingsDT(ir: WorldIR): object[] {
  return ir.entities.buildings.map(b => ({
    Name: b.id,
    BuildingId: b.id,
    SettlementId: b.settlementId,
    LotId: b.lotId || '',
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

// ─────────────────────────────────────────────
// Survival Needs DataTable
// ─────────────────────────────────────────────

function generateSurvivalNeedsDT(ir: WorldIR): object[] {
  if (!ir.survival) return [];
  return ir.survival.needs.map(n => ({
    Name: n.id,
    NeedId: n.id,
    NeedName: n.name,
    Icon: n.icon,
    MaxValue: n.maxValue,
    StartValue: n.startValue,
    DecayRate: n.decayRate,
    CriticalThreshold: n.criticalThreshold,
    WarningThreshold: n.warningThreshold,
    DamageRate: n.damageRate,
  }));
}

// ─────────────────────────────────────────────
// Survival Modifier Presets DataTable
// ─────────────────────────────────────────────

function generateSurvivalModifierPresetsDT(ir: WorldIR): object[] {
  if (!ir.survival) return [];
  return ir.survival.modifierPresets.map(m => ({
    Name: m.id,
    PresetId: m.id,
    PresetName: m.name,
    NeedType: m.needType,
    RateMultiplier: m.rateMultiplier,
    Duration: m.duration,
    Source: m.source,
  }));
}

// ─────────────────────────────────────────────
// Resource Definition DataTable
// ─────────────────────────────────────────────

function generateResourcesDT(ir: WorldIR): object[] {
  if (!ir.resources) return [];
  return ir.resources.definitions.map(d => ({
    Name: d.id,
    ResourceId: d.id,
    ResourceName: d.name,
    Icon: d.icon,
    Color: { R: d.color.r, G: d.color.g, B: d.color.b, A: 1.0 },
    MaxStack: d.maxStack,
    GatherTime: d.gatherTime,
    RespawnTime: d.respawnTime,
  }));
}

// ─────────────────────────────────────────────
// Gathering Node DataTable
// ─────────────────────────────────────────────

function generateGatheringNodesDT(ir: WorldIR): object[] {
  if (!ir.resources) return [];
  return ir.resources.gatheringNodes.map(n => ({
    Name: n.id,
    NodeId: n.id,
    ResourceType: n.resourceType,
    Position: vec3Obj(n.position),
    MaxAmount: n.maxAmount,
    RespawnTime: n.respawnTime,
    Scale: n.scale,
  }));
}

// ─────────────────────────────────────────────
// Assessment Instruments DataTable
// ─────────────────────────────────────────────

function generateAssessmentInstrumentsDT(ir: WorldIR): object[] {
  if (!ir.assessment) return [];
  return ir.assessment.instruments.map(inst => ({
    Name: inst.id,
    InstrumentId: inst.id,
    InstrumentName: inst.name,
    Description: inst.description,
    Version: inst.version,
    Citation: inst.citation,
    ScoringMethod: inst.scoringMethod,
    ScoreMin: inst.scoreRange.min,
    ScoreMax: inst.scoreRange.max,
    EstimatedMinutes: inst.estimatedMinutes,
    QuestionCount: inst.questions.length,
    Subscales: inst.subscales.map(s => ({ Id: s.id, Name: s.name, QuestionCount: s.questionIds.length })),
  }));
}

// ─────────────────────────────────────────────
// Assessment Questions DataTable
// ─────────────────────────────────────────────

function generateAssessmentQuestionsDT(ir: WorldIR): object[] {
  if (!ir.assessment) return [];
  const rows: object[] = [];
  for (const inst of ir.assessment.instruments) {
    for (const q of inst.questions) {
      rows.push({
        Name: q.id,
        QuestionId: q.id,
        InstrumentId: inst.id,
        Text: q.text,
        Type: q.type,
        Options: q.options ?? [],
        ScaleAnchorLow: q.scaleAnchors?.low ?? '',
        ScaleAnchorHigh: q.scaleAnchors?.high ?? '',
        ReverseScored: q.reverseScored,
        Required: q.required,
        Subscale: q.subscale ?? '',
        Difficulty: q.difficulty ?? '',
        TargetLanguage: q.targetLanguage ?? '',
      });
    }
  }
  return rows;
}

// ─────────────────────────────────────────────
// Vocabulary DataTable
// ─────────────────────────────────────────────

function generateVocabularyDT(ir: WorldIR): object[] {
  if (!ir.languageLearning) return [];
  return ir.languageLearning.vocabulary.map(v => ({
    Name: v.id,
    VocabularyId: v.id,
    Word: v.word,
    Translation: v.translation,
    Category: v.category,
    ProficiencyLevel: v.proficiencyLevel,
    Pronunciation: v.pronunciation ?? '',
    AudioAssetKey: v.audioAssetKey ?? '',
    ExampleSentence: v.exampleSentence ?? '',
  }));
}

// ─────────────────────────────────────────────
// Grammar Patterns DataTable
// ─────────────────────────────────────────────

function generateGrammarPatternsDT(ir: WorldIR): object[] {
  if (!ir.languageLearning) return [];
  return ir.languageLearning.grammarPatterns.map(p => ({
    Name: p.id,
    PatternId: p.id,
    PatternName: p.name,
    Description: p.description,
    Pattern: p.pattern,
    Example: p.example,
    ExampleTranslation: p.exampleTranslation,
    ProficiencyLevel: p.proficiencyLevel,
  }));
}

// ─────────────────────────────────────────────
// Proficiency Tiers DataTable
// ─────────────────────────────────────────────

function generateProficiencyTiersDT(ir: WorldIR): object[] {
  if (!ir.languageLearning) return [];
  return ir.languageLearning.proficiencyTiers.map(t => ({
    Name: t.level,
    Level: t.level,
    TierName: t.name,
    XPThreshold: t.xpThreshold,
    UnlockedCategories: t.unlockedCategories,
    UnlockedPatternIds: t.unlockedPatternIds,
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
    { name: 'DT_FoliageLayers', data: generateFoliageLayersDT(ir) },
    { name: 'DT_Buildings', data: generateBuildingsDT(ir) },
    { name: 'DT_Lots', data: generateLotsDT(ir) },
    { name: 'DT_Grammars', data: generateGrammarsDT(ir) },
    { name: 'DT_Truths', data: generateTruthsDT(ir) },
    { name: 'DT_Roads', data: generateRoadsDT(ir) },
    { name: 'DT_Businesses', data: generateBusinessesDT(ir) },
    { name: 'DT_Items', data: generateItemsDT(ir) },
    { name: 'DT_LootTables', data: generateLootTablesDT(ir) },
    { name: 'DT_SurvivalNeeds', data: generateSurvivalNeedsDT(ir) },
    { name: 'DT_SurvivalModifierPresets', data: generateSurvivalModifierPresetsDT(ir) },
    { name: 'DT_Resources', data: generateResourcesDT(ir) },
    { name: 'DT_GatheringNodes', data: generateGatheringNodesDT(ir) },
  ];

  for (const table of tables) {
    files.push({
      path: `${base}/${table.name}.json`,
      content: JSON.stringify(table.data, null, 2),
    });
  }

  // NPC dialogue contexts (pre-built system prompts for AI chat)
  // Exported as both DT_ format and DataLoader-compatible name
  if (ir.systems.dialogueContexts?.length > 0) {
    const contextJson = JSON.stringify(ir.systems.dialogueContexts, null, 2);
    files.push({ path: `${base}/DT_DialogueContexts.json`, content: contextJson });
    files.push({ path: `${base}/dialogue-contexts.json`, content: contextJson });
  }

  // AI configuration — exported as both names for DataLoader compatibility
  if (ir.aiConfig) {
    const configJson = JSON.stringify(ir.aiConfig, null, 2);
    files.push({ path: `${base}/AIConfig.json`, content: configJson });
    files.push({ path: `${base}/ai-config.json`, content: configJson });
  }

  // Prolog knowledge base — both names for DataLoader compatibility
  if (ir.systems.knowledgeBase) {
    files.push({ path: `${base}/KnowledgeBase.pl`, content: ir.systems.knowledgeBase });
    files.push({ path: `${base}/knowledge_base.pl`, content: ir.systems.knowledgeBase });
  }

  // Assessment instruments and questions
  if (ir.assessment && ir.assessment.instruments.length > 0) {
    files.push({
      path: `${base}/DT_AssessmentInstruments.json`,
      content: JSON.stringify(generateAssessmentInstrumentsDT(ir), null, 2),
    });
    files.push({
      path: `${base}/DT_AssessmentQuestions.json`,
      content: JSON.stringify(generateAssessmentQuestionsDT(ir), null, 2),
    });
  }

  // Language learning vocabulary and grammar
  if (ir.languageLearning) {
    if (ir.languageLearning.vocabulary.length > 0) {
      files.push({
        path: `${base}/DT_Vocabulary.json`,
        content: JSON.stringify(generateVocabularyDT(ir), null, 2),
      });
    }
    if (ir.languageLearning.grammarPatterns.length > 0) {
      files.push({
        path: `${base}/DT_GrammarPatterns.json`,
        content: JSON.stringify(generateGrammarPatternsDT(ir), null, 2),
      });
    }
    if (ir.languageLearning.proficiencyTiers.length > 0) {
      files.push({
        path: `${base}/DT_ProficiencyTiers.json`,
        content: JSON.stringify(generateProficiencyTiersDT(ir), null, 2),
      });
    }
  }

  return files;
}
