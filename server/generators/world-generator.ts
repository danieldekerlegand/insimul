/**
 * Unified World Generator
 * Combines genealogy and geography generation for complete world creation
 */

import { storage } from '../db/storage';
import { GenealogyGenerator, resolveNamePool } from './genealogy-generator';
import { GeographyGenerator } from './geography-generator';
import type { InsertWorld, Business, Character, BusinessType, OccupationVocation } from '../../shared/schema';
import { foundBusiness, closeBusiness } from '../extensions/tott/business-system.js';
import { fillVacancy } from '../extensions/tott/hiring-system.js';
import { generateDefaultRoutine, setRoutine, updateAllWhereabouts } from '../extensions/tott/routine-system.js';
import { triggerAutomaticEvents } from '../extensions/tott/event-system.js';
// Phase 5-10: TotT Social Simulation Integration
import { updateRelationship, calculateCompatibility, calculateChargeIncrement, calculateSparkIncrement, calculateTrust, calculateAgeDifferenceEffect, calculateJobLevelDifferenceEffect } from '../extensions/tott/social-dynamics-system.js';
import { initializeFamilyKnowledge, initializeCoworkerKnowledge } from '../extensions/tott/knowledge-system.js';
import { addMoney, classifyWealth } from '../extensions/tott/economics-system.js';
import type { RelationshipDetails } from '../extensions/tott/social-dynamics-system.js';
import { adjustCommunityMorale, scheduleFestival } from '../extensions/tott/town-events-system.js';
// Lifecycle, artifacts, grieving, education, drama — TotT systems for history simulation
import { calculateDeathProbability, die, developAttraction, marry, conceive, giveBirth, divorce } from '../extensions/tott/lifecycle-system.js';
import { createGravestone, createWeddingRing } from '../extensions/tott/artifact-system.js';
import { processDeathGrief } from '../extensions/tott/grieving-system.js';
import { shouldAttendCollege, enrollInCollege, selectMajor } from '../extensions/tott/education-system.js';
import { excavateDrama, generateStorySummary } from '../extensions/tott/drama-recognition-system.js';
import { initializeCharacterAppearance } from '../extensions/tott/appearance-system.js';
// GenAI Visual Asset Generation Integration
import { visualAssetGenerator } from '../services/assets/visual-asset-generator.js';
// Item placement
import { placeItemsInWorld } from './item-placement-generator.js';
// Main quest NPC spawning
import { spawnMainQuestNPCs } from '../../shared/quests/main-quest-npc-spawner.js';
import { mongoQuestStorage } from '../db/mongo-quest-storage.js';
// Text document seeding
import { seedTextsForWorld } from '../services/text-seed-generator.js';
import { assignDefaultOccupations } from './occupation-assignment.js';
// Population scaling
import { countBuildings, calculatePopulationTarget } from './population-scaling.js';
// Territory generation
import { generateWorldGeography, resolveScaleConfig, getSettlementBaseRadius, type WorldScale, type ScaleConfig } from './territory-generator.js';
// AI content generation (for truths)
import { isGeminiConfigured } from '../config/gemini.js';
import { getContentProvider } from '../services/providers/index.js';

/**
 * Result of generating a single settlement through the full pipeline.
 */
export interface SettlementGenerationResult {
  settlementId: string;
  population: number;
  families: number;
  generations: number;
  districts: number;
  buildings: number;
  businesses: number;
  employed: number;
  occupations: number;
  housed: number;
  routines: number;
  events: number;
  itemsPlaced: number;
  textsSeeded: number;
  truths: number;
}

/**
 * Config for the unified per-settlement generation pipeline.
 */
export interface SettlementPipelineConfig {
  worldId: string;
  countryId?: string;
  settlementId: string;
  foundedYear: number;
  currentYear: number;
  terrain?: string;
  settlementType: string;
  worldType?: string;
  // Genealogy params
  numFoundingFamilies: number;
  generations: number;
  marriageRate?: number;
  fertilityRate?: number;
  deathRate?: number;
  targetPopulation?: number;
  // Phase toggles (all default to true)
  generateGenealogy?: boolean;
  generateGeography?: boolean;
  generateBusinesses?: boolean;
  assignEmployment?: boolean;
  assignHousing?: boolean;
  generateRoutines?: boolean;
  generateTruths?: boolean;
  initializeSocialDynamics?: boolean;
  initializeKnowledge?: boolean;
  initializeWealth?: boolean;
  initializeCommunityMorale?: boolean;
  simulateHistory?: boolean;
  historyFidelity?: 'low' | 'medium' | 'high';
  // Guild assignment: list of guild business types to place in this settlement
  // e.g. ['GuildDiplomates', 'GuildConteurs']. Overrides the default guild-per-type binding.
  guilds?: string[];
  // Street layout pattern override (user-selected in creation dialog)
  // e.g. 'grid', 'organic', 'linear', 'waterfront', 'hillside', 'radial'
  streetPattern?: string;
  // Progress callback (optional, for UI updates)
  onProgress?: (phase: string, message: string) => void;
}

export interface WorldGenerationConfig {
  worldName: string;
  worldDescription?: string;
  worldType?: string;
  settlementName: string;
  settlementDescription?: string;
  settlementType: 'dwelling' | 'roadhouse' | 'homestead' | 'landing' | 'forge' | 'chapel' | 'market' | 'hamlet' | 'village' | 'town' | 'city';
  terrain?: 'plains' | 'hills' | 'mountains' | 'coast' | 'river' | 'forest' | 'desert';
  foundedYear: number;
  currentYear: number;
  numFoundingFamilies: number;
  generations: number;
  marriageRate: number;
  fertilityRate: number;
  deathRate: number;
  generateGeography: boolean;
  generateGenealogy: boolean;
  // Optional country/state info
  countryName?: string;
  governmentType?: string;
  economicSystem?: string;
  // TotT integration options
  generateBusinesses?: boolean;
  assignEmployment?: boolean;
  assignHousing?: boolean;
  generateRoutines?: boolean;
  simulateHistory?: boolean;
  historyFidelity?: 'low' | 'medium' | 'high';
  // Phase 5-10: TotT Social Simulation
  initializeSocialDynamics?: boolean;  // Phase 5: Relationships
  initializeKnowledge?: boolean;       // Phase 6: Mental models
  initializeWealth?: boolean;          // Phase 9: Starting money
  initializeCommunityMorale?: boolean; // Phase 10: Community
  scheduleFestival?: boolean;          // Phase 10: Initial festival
  // GenAI Visual Asset Generation
  generateVisualAssets?: boolean;      // Master toggle for visual generation
  generateCharacterPortraits?: boolean; // Generate portraits for all characters
  generateBuildingExteriors?: boolean;  // Generate exteriors for all buildings
  generateSettlementMaps?: boolean;     // Generate settlement maps
  visualGenerationProvider?: 'flux' | 'gemini-imagen' | 'dalle' | 'stable-diffusion';
}

export class WorldGenerator {
  private genealogyGen = new GenealogyGenerator();
  private geographyGen = new GeographyGenerator();

  /**
   * Generate a complete world with geographical hierarchy (world → country → settlement)
   */
  async generateWorld(config: WorldGenerationConfig): Promise<{
    worldId: string;
    countryId: string;
    settlementId: string;
    population: number;
    families: number;
    generations: number;
    districts: number;
    buildings: number;
    businesses: number;
    employed: number;
    routines: number;
    events: number;
    itemsPlaced: number;
    textsSeeded: number;
    visualAssets: {
      portraits: number;
      buildings: number;
      maps: number;
    };
  }> {
    console.log(`🌍 Generating world: ${config.worldName}...`);
    console.log(`   Settlement: ${config.settlementName} (${config.settlementType})`);
    console.log(`   Period: ${config.foundedYear} - ${config.currentYear}`);
    
    // Create world (abstract universe)
    const worldData: InsertWorld = {
      name: config.worldName,
      description: config.worldDescription || `A procedurally generated world`,
      currentYear: config.currentYear,
      sourceFormats: ['insimul', 'tott'],
      generationConfig: {
        numFoundingFamilies: config.numFoundingFamilies,
        generations: config.generations,
        marriageRate: config.marriageRate,
        fertilityRate: config.fertilityRate,
        deathRate: config.deathRate
      }
    };
    
    const world = await storage.createWorld(worldData);
    console.log(`✅ Created world: ${world.id}`);
    
    // Create country within the world
    const countryData = {
      worldId: world.id,
      name: config.countryName || `Kingdom of ${config.settlementName}`,
      description: `A ${config.governmentType || 'feudal'} realm`,
      governmentType: config.governmentType || 'monarchy',
      economicSystem: config.economicSystem || 'agricultural',
      foundedYear: config.foundedYear
    };
    
    const country = await storage.createCountry(countryData);
    console.log(`✅ Created country: ${country.id}`);
    
    // Create settlement within the country
    const settlementData = {
      worldId: world.id,
      countryId: country.id,
      name: config.settlementName,
      description: config.settlementDescription || `A ${config.settlementType} in ${country.name}`,
      settlementType: config.settlementType,
      terrain: config.terrain,
      population: 0,
      foundedYear: config.foundedYear,
      generationConfig: {
        numFoundingFamilies: config.numFoundingFamilies,
        generations: config.generations,
        marriageRate: config.marriageRate,
        fertilityRate: config.fertilityRate,
        deathRate: config.deathRate
      }
    };
    
    const settlement = await storage.createSettlement(settlementData);
    console.log(`✅ Created settlement: ${settlement.id}`);

    // Generate world geography — always use grid-based layout
    // Single world: 1×1 world grid, 1×1 country, settlement at (0,0)
    console.log('\n🗺️  Generating world territory layout (grid-based)...');

    const geoLayout = generateWorldGeography({
      worldId: world.id,
      seed: `${world.id}-territory`,
      scale: ((config as any).worldScale as WorldScale) || 'standard',
      worldGrid: { width: 1, height: 1 },
      countries: [{
        id: country.id,
        terrain: config.terrain,
        gridPlacement: { gridX: 0, gridY: 0, gridWidth: 1, gridHeight: 1 },
        settlements: [{
          id: settlement.id,
          type: config.settlementType,
          terrain: config.terrain,
          population: this.estimatePopulation(config.settlementType),
          gridPlacement: { countryGridX: 0, countryGridY: 0 },
        }],
      }],
    });

    // Persist world grid + map dimensions
    await storage.updateWorld(world.id, {
      gridWidth: 1,
      gridHeight: 1,
      mapWidth: geoLayout.mapWidth,
      mapDepth: geoLayout.mapDepth,
      mapCenter: geoLayout.mapCenter,
    } as any);

    // Persist country territory + grid placement
    const countryGeo = geoLayout.countries.get(country.id);
    if (countryGeo) {
      await storage.updateCountry(country.id, {
        gridX: 0, gridY: 0, gridWidth: 1, gridHeight: 1,
        position: countryGeo.position,
        territoryPolygon: countryGeo.territoryPolygon,
        territoryRadius: countryGeo.territoryRadius,
      } as any);
    }

    // Persist settlement world position + grid cell
    const settlementGeo = geoLayout.settlements.get(settlement.id);
    if (settlementGeo) {
      await storage.updateSettlement(settlement.id, {
        countryGridX: 0, countryGridY: 0,
        worldPositionX: settlementGeo.worldPositionX,
        worldPositionZ: settlementGeo.worldPositionZ,
        radius: settlementGeo.radius,
      } as any);
    }
    console.log(`   ✓ World map: ${geoLayout.mapWidth}×${geoLayout.mapDepth} units`);
    console.log(`   ✓ Country territory: radius ${countryGeo?.territoryRadius ?? '?'}`);
    console.log(`   ✓ Settlement at (${settlementGeo?.worldPositionX?.toFixed(0) ?? '?'}, ${settlementGeo?.worldPositionZ?.toFixed(0) ?? '?'}) radius ${settlementGeo?.radius ?? '?'}`);

    // ── Delegate to the unified per-settlement pipeline ───────────────
    const POPULATION_BY_TYPE: Record<string, number> = { dwelling: 3, roadhouse: 3, landing: 10, forge: 10, chapel: 10, homestead: 10, market: 30, hamlet: 50, village: 100, town: 1000, city: 5000 };

    const result = await this.generateSettlement({
      worldId: world.id,
      countryId: country.id,
      settlementId: settlement.id,
      foundedYear: config.foundedYear,
      currentYear: config.currentYear,
      terrain: config.terrain,
      settlementType: config.settlementType,
      worldType: config.worldType,
      numFoundingFamilies: config.numFoundingFamilies,
      generations: config.generations,
      marriageRate: config.marriageRate,
      fertilityRate: config.fertilityRate,
      deathRate: config.deathRate,
      targetPopulation: POPULATION_BY_TYPE[config.settlementType] || 50,
      generateGenealogy: config.generateGenealogy,
      generateGeography: config.generateGeography,
      generateBusinesses: config.generateBusinesses,
      assignEmployment: config.assignEmployment,
      assignHousing: config.assignHousing,
      generateRoutines: config.generateRoutines,
      generateTruths: true,
      initializeSocialDynamics: config.initializeSocialDynamics,
      initializeKnowledge: config.initializeKnowledge,
      initializeWealth: config.initializeWealth,
      initializeCommunityMorale: config.initializeCommunityMorale,
      simulateHistory: config.simulateHistory,
      historyFidelity: config.historyFidelity,
    });

    // GenAI Visual Asset Generation (world-level, stays here)
    let portraitCount = 0;
    let buildingAssetCount = 0;
    let mapCount = 0;

    if (config.generateVisualAssets) {
      const provider = config.visualGenerationProvider || 'flux';

      if (config.generateCharacterPortraits && result.population > 0) {
        console.log('\n🎨 Generating character portraits...');
        portraitCount = await this.generateCharacterPortraitsForWorld({ worldId: world.id, provider });
      }
      if (config.generateBuildingExteriors && result.businesses > 0) {
        console.log('\n🏢 Generating building exteriors...');
        buildingAssetCount = await this.generateBuildingExteriorsForWorld({ worldId: world.id, provider });
      }
      if (config.generateSettlementMaps) {
        console.log('\n🗺️  Generating settlement maps...');
        mapCount = await this.generateSettlementMapsForSettlement({ settlementId: settlement.id, provider });
      }
    }

    console.log('\n✅ World generation complete!');

    return {
      worldId: world.id,
      countryId: country.id,
      settlementId: settlement.id,
      population: result.population,
      families: result.families,
      generations: result.generations,
      districts: result.districts,
      buildings: result.buildings,
      businesses: result.businesses,
      employed: result.employed,
      routines: result.routines,
      events: result.events,
      itemsPlaced: result.itemsPlaced,
      textsSeeded: result.textsSeeded,
      visualAssets: {
        portraits: portraitCount,
        buildings: buildingAssetCount,
        maps: mapCount
      }
    };
  }

  /**
   * Unified per-settlement generation pipeline.
   * This is the single source of truth for all settlement generation —
   * generateWorld(), generateCountry(), and individual settlement creation all call this.
   */
  async generateSettlement(config: SettlementPipelineConfig): Promise<SettlementGenerationResult> {
    const progress = config.onProgress || ((phase: string, msg: string) => console.log(`   [${phase}] ${msg}`));
    const settlement = await storage.getSettlement(config.settlementId);
    if (!settlement) throw new Error(`Settlement ${config.settlementId} not found`);

    const world = await storage.getWorld(config.worldId);
    const worldLanguages = await storage.getWorldLanguagesByWorld(config.worldId);
    const learningTarget = worldLanguages?.find((l: any) => l.isLearningTarget);
    const targetLanguage = learningTarget?.name || world?.targetLanguage || undefined;

    let population = 0;
    let families = 0;
    let generationsCreated = 0;
    let districts = 0;
    let buildings = 0;
    let businessCount = 0;
    let employedCount = 0;
    let occupationCount = 0;
    let housed = 0;
    let routineCount = 0;
    let eventCount = 0;
    let itemsPlaced = 0;
    let textsSeeded = 0;
    let truthCount = 0;

    // ── Phase 1: Genealogy ─────────────────────────────────────────────
    if (config.generateGenealogy !== false) {
      progress('genealogy', 'Generating families & characters...');
      // Ensure enough founding families to produce a viable living population.
      // Each family tree yields ~10-15 living descendants over 6 generations,
      // so we need at least ceil(targetPop / 12) families.
      const minFamilies = Math.max(
        config.numFoundingFamilies,
        Math.ceil((config.targetPopulation || 50) / 12)
      );
      const genealogyResult = await this.genealogyGen.generate({
        worldId: config.worldId,
        settlementId: config.settlementId,
        startYear: config.foundedYear,
        currentYear: config.currentYear,
        numFoundingFamilies: minFamilies,
        generationsToGenerate: config.generations,
        marriageRate: config.marriageRate || 0.7,
        fertilityRate: config.fertilityRate || 0.8,
        deathRate: config.deathRate || 0.3,
        targetLanguage,
      });
      population = genealogyResult.totalCharacters;
      families = genealogyResult.families.length;
      generationsCreated = genealogyResult.generations;

      await storage.updateSettlement(config.settlementId, { currentGeneration: generationsCreated });
    }

    // ── Phase 2: Geography ─────────────────────────────────────────────
    if (config.generateGeography !== false) {
      progress('geography', 'Generating streets & buildings...');
      const livingChars = (await storage.getCharactersBySettlement(config.settlementId)).filter((c: any) => c.isAlive);
      const geographyResult = await this.geographyGen.generate({
        worldId: config.worldId,
        settlementId: config.settlementId,
        settlementName: settlement.name,
        settlementType: config.settlementType as any,
        population: livingChars.length || config.targetPopulation || this.estimatePopulation(config.settlementType),
        foundedYear: config.foundedYear,
        terrain: config.terrain as any,
        countryId: config.countryId ?? settlement.countryId ?? undefined,
        stateId: settlement.stateId ?? undefined,
        targetLanguage,
        worldType: config.worldType || world?.worldType || undefined,
        streetPattern: config.streetPattern,
      });
      districts = geographyResult.districts.length;
      buildings = geographyResult.buildings.length;

      // Population scaling: generate immigrants if building count implies a deficit
      if (config.generateGenealogy !== false) {
        const buildingCounts = countBuildings(geographyResult.buildings);
        const { target, deficit } = calculatePopulationTarget(buildingCounts, livingChars.length, config.targetPopulation);
        if (deficit > 0) {
          progress('population', `Generating ${deficit} immigrants to fill gap...`);
          const immigrantsCreated = await this.genealogyGen.generateImmigrants({
            worldId: config.worldId,
            settlementId: config.settlementId,
            currentYear: config.currentYear,
            count: deficit,
            targetLanguage,
          });
          population += immigrantsCreated;
        }
      }
    }

    // Recount living population for subsequent phases
    const allChars = await storage.getCharactersBySettlement(config.settlementId);
    const livingCharacters = allChars.filter((c: any) => c.isAlive);
    population = livingCharacters.length + allChars.filter((c: any) => !c.isAlive).length;
    const livingCount = livingCharacters.length;

    await storage.updateSettlement(config.settlementId, { population: livingCount });

    // ── Phase 3: Business generation ───────────────────────────────────
    let resultBusinesses: Business[] = [];
    if (config.generateBusinesses !== false && livingCount > 0) {
      progress('businesses', 'Founding initial businesses...');
      resultBusinesses = await this.generateInitialBusinesses({
        worldId: config.worldId,
        settlementId: config.settlementId,
        population: livingCount,
        currentYear: config.currentYear,
        terrain: config.terrain,
        settlementType: config.settlementType,
        guilds: config.guilds,
      });
      businessCount = resultBusinesses.length;
    }

    // ── Phase 4: Employment assignment ─────────────────────────────────
    if (config.assignEmployment !== false && resultBusinesses.length > 0) {
      progress('employment', 'Assigning employment...');
      employedCount = await this.assignInitialEmployment({
        worldId: config.worldId,
        businesses: resultBusinesses,
        currentYear: config.currentYear,
      });
    }

    // ── Phase 4.5: Default occupations ─────────────────────────────────
    if (livingCount > 0) {
      progress('occupations', 'Assigning default occupations...');
      occupationCount = await assignDefaultOccupations({
        worldId: config.worldId,
        currentYear: config.currentYear,
        terrain: config.terrain,
      });
    }

    // ── Phase 4.6: Housing assignment ──────────────────────────────────
    if (config.assignHousing !== false && livingCount > 0) {
      progress('housing', 'Assigning housing...');
      await this.assignHousing({
        worldId: config.worldId,
        settlementId: config.settlementId,
        currentYear: config.currentYear,
      });
      const residences = await storage.getResidencesBySettlement(config.settlementId);
      housed = residences.reduce((sum, r: any) => sum + ((r.residentIds as string[])?.length || 0), 0);
    }

    // ── Phase 4.7: Item placement ──────────────────────────────────────
    if (businessCount > 0 || livingCount > 0) {
      progress('items', 'Placing items in world locations...');
      try {
        const itemResult = await placeItemsInWorld(config.worldId, config.worldType || world?.worldType || undefined);
        itemsPlaced = itemResult.totalPlaced;
      } catch (e) {
        console.warn('Item placement failed:', e);
      }
    }

    // ── Phase 4.75: Merchant inventories ────────────────────────────────
    if (businessCount > 0) {
      progress('merchants', 'Populating merchant inventories...');
      try {
        const { generateAndPersistWorldInventories } = await import('../services/merchant-inventory.js');
        const merchantResult = await generateAndPersistWorldInventories(config.worldId, storage, targetLanguage);
        console.log(`   🏪 Generated ${merchantResult.inventoryCount} merchant inventories (${merchantResult.translatedCount} translated)`);
      } catch (e) {
        console.warn('Merchant inventory generation failed:', e);
      }
    }

    // ── Phase 4.8: Main quest NPCs ─────────────────────────────────────
    if (livingCount > 0) {
      try {
        const mqResult = await spawnMainQuestNPCs(mongoQuestStorage, config.worldId, targetLanguage, config.settlementId);
        if (mqResult.created > 0) {
          progress('npcs', `Spawned ${mqResult.created} main quest NPCs`);
        }
      } catch (e) {
        console.warn('Main quest NPC spawning failed:', e);
      }
    }

    // ── Phase 4.85: Generate main quest chapter records ─────────────────
    try {
      const { MAIN_QUEST_CHAPTERS } = await import('../../shared/quest/main-quest-chapters.js');
      const { createMainQuestRecord } = await import('../services/quests/main-quest-records.js');

      // Load narrative truth for chapter context
      const allTruths = await storage.getTruthsByWorld(config.worldId);
      const narrativeTruth = allTruths.find((t: any) => t.entryType === 'world_narrative');
      let narrativeData: any = null;
      if (narrativeTruth?.content) {
        try { narrativeData = JSON.parse(narrativeTruth.content); } catch {}
      }

      let chaptersCreated = 0;
      for (const chapter of MAIN_QUEST_CHAPTERS) {
        const narrativeCtx = narrativeData?.chapters?.find((ch: any) => ch.chapterId === chapter.id);
        try {
          await createMainQuestRecord(
            mongoQuestStorage,
            config.worldId,
            'Player',
            chapter,
            targetLanguage || 'French',
            narrativeCtx ? {
              introNarrative: narrativeCtx.introNarrative,
              outroNarrative: narrativeCtx.outroNarrative,
              mysteryDetails: narrativeCtx.mysteryDetails,
              clueDescriptions: narrativeCtx.clueDescriptions,
            } : undefined,
          );
          chaptersCreated++;
        } catch {}
      }
      if (chaptersCreated > 0) {
        progress('quests', `Created ${chaptersCreated} main quest chapters`);
      }
    } catch (e) {
      console.warn('Main quest chapter generation failed:', e);
    }

    // ── Phase 4.9: Text document seeding ───────────────────────────────
    if (livingCount > 0) {
      try {
        const seedResult = await seedTextsForWorld(storage, {
          worldId: config.worldId,
          targetLanguage: targetLanguage || 'French',
        });
        textsSeeded = seedResult.created;
      } catch (e) {
        console.warn('Text seeding failed:', e);
      }
    }

    // ── Phase 5: Daily routines ────────────────────────────────────────
    if (config.generateRoutines !== false && livingCount > 0) {
      progress('routines', 'Generating daily routines...');
      routineCount = await this.generateInitialRoutines({
        worldId: config.worldId,
        currentYear: config.currentYear,
      });
      await updateAllWhereabouts(config.worldId, 0, 'day', 12);
    }

    // ── Phase 6: Social dynamics ───────────────────────────────────────
    if (config.initializeSocialDynamics !== false && livingCount > 0) {
      progress('social', 'Initializing social dynamics...');
      await this.initializeSocialDynamics({
        worldId: config.worldId,
        currentYear: config.currentYear,
      });
    }

    // ── Phase 7: Knowledge ─────────────────────────────────────────────
    if (config.initializeKnowledge !== false && livingCount > 0) {
      progress('knowledge', 'Implanting knowledge...');
      await this.implantKnowledge({
        worldId: config.worldId,
        currentTimestep: 0,
      });
    }

    // ── Phase 8: Wealth ────────────────────────────────────────────────
    if (config.initializeWealth !== false && livingCount > 0) {
      progress('wealth', 'Initializing wealth...');
      await this.initializeWealth({
        worldId: config.worldId,
        currentYear: config.currentYear,
      });
    }

    // ── Phase 9: Community morale ──────────────────────────────────────
    if (config.initializeCommunityMorale !== false && livingCount > 0) {
      progress('community', 'Initializing community...');
      await adjustCommunityMorale(config.worldId, 50);
      try {
        await scheduleFestival(config.worldId, 'founders_day', 'town_square', 7);
      } catch (e) {
        console.warn('Festival scheduling failed:', e);
      }
    }

    // ── Phase 10: History simulation (defaults to ON — core TotT feature) ──
    if (config.simulateHistory !== false && livingCount > 0) {
      progress('history', 'Simulating historical events...');
      eventCount = await this.simulateHistory({
        worldId: config.worldId,
        startYear: config.foundedYear,
        endYear: config.currentYear,
        fidelity: config.historyFidelity || 'low',
        targetLanguage,
      });
    }

    // ── Phase 10.5: Drama recognition → truths + quests ────────────────
    if (livingCount > 0) {
      progress('drama', 'Analyzing emergent dramas...');
      try {
        const drama = await excavateDrama(config.worldId);
        if (drama.totalDramaCount > 0) {
          const summary = generateStorySummary(drama);
          console.log(`   ✓ Found ${drama.totalDramaCount} dramatic situations`);

          // Store drama summary on settlement
          try {
            await storage.updateSettlement(config.settlementId, {
              dramaSummary: summary,
              dramaAnalysis: {
                unrequitedLove: drama.unrequitedLove.length,
                loveTriangles: drama.loveTriangles.length,
                extramaritalAffairs: drama.extramaritalAffairs.length,
                rivalries: drama.rivalries.length,
                siblingRivalries: drama.siblingRivalries.length,
                businessRivalries: drama.businessRivalries.length,
                totalDramaCount: drama.totalDramaCount,
              },
            } as any);
          } catch {}

          // Create truths from dramatic situations so they appear in World History views
          const currentYear = config.currentYear;

          for (const ul of drama.unrequitedLove.slice(0, 5)) {
            await this.createHistoricalTruth({
              worldId: config.worldId, characterId: ul.lover,
              title: `Unrequited love for ${ul.nonreciprocatorName}`,
              content: `${ul.loverName} harbors deep feelings for ${ul.nonreciprocatorName}, but the affection is not returned.`,
              entryType: 'relationship', year: currentYear, importance: 6, tags: ['drama', 'unrequited_love'],
            });
          }

          for (const lt of drama.loveTriangles.slice(0, 3)) {
            await this.createHistoricalTruth({
              worldId: config.worldId,
              title: `Love triangle: ${lt.names[0]}, ${lt.names[1]}, ${lt.names[2]}`,
              content: `A complicated romantic entanglement exists between ${lt.names[0]}, ${lt.names[1]}, and ${lt.names[2]}. ${lt.pattern}`,
              entryType: 'relationship', year: currentYear, importance: 8, tags: ['drama', 'love_triangle'],
            });
          }

          for (const ea of drama.extramaritalAffairs.slice(0, 3)) {
            await this.createHistoricalTruth({
              worldId: config.worldId, characterId: ea.marriedPerson,
              title: `Secret affair of ${ea.marriedPersonName}`,
              content: `${ea.marriedPersonName} has developed feelings for ${ea.loveInterestName} while married to ${ea.spouseName}.`,
              entryType: 'secret', year: currentYear, importance: 8, tags: ['drama', 'affair', 'secret'],
            });
          }

          for (const r of drama.rivalries.slice(0, 5)) {
            await this.createHistoricalTruth({
              worldId: config.worldId, characterId: r.person1,
              title: `Rivalry between ${r.person1Name} and ${r.person2Name}`,
              content: `${r.person1Name} and ${r.person2Name} share a mutual antagonism. ${r.description}`,
              entryType: 'relationship', year: currentYear, importance: 5, tags: ['drama', 'rivalry'],
            });
          }

          for (const br of drama.businessRivalries.slice(0, 3)) {
            await this.createHistoricalTruth({
              worldId: config.worldId, characterId: br.person1,
              title: `Business rivalry: ${br.person1Name} vs ${br.person2Name}`,
              content: `${br.person1Name} and ${br.person2Name} are fierce business competitors. ${br.description}`,
              entryType: 'relationship', year: currentYear, importance: 6, tags: ['drama', 'business_rivalry'],
            });
          }

          // Create quests from the most interesting dramas
          const questsCreated: string[] = [];

          // Unrequited love → matchmaking or rival quest
          for (const ul of drama.unrequitedLove.slice(0, 2)) {
            try {
              await storage.createQuest({
                worldId: config.worldId,
                title: `The Heart of ${ul.loverName}`,
                description: `${ul.loverName} is secretly in love with ${ul.nonreciprocatorName}. Perhaps someone could help — or make things worse.`,
                questType: 'social',
                difficulty: 'medium',
                objectives: [
                  { description: `Speak with ${ul.loverName} about their feelings`, completed: false },
                  { description: `Learn what ${ul.nonreciprocatorName} thinks`, completed: false },
                  { description: 'Decide whether to play matchmaker or counsel acceptance', completed: false },
                ],
                rewards: { experience: 50, reputation: 10 },
                relatedCharacterIds: [ul.lover, ul.nonreciprocator],
                tags: ['drama', 'social', 'procedural'],
                source: 'drama_recognition',
              } as any);
              questsCreated.push(`Unrequited love: ${ul.loverName}`);
            } catch {}
          }

          // Rivalries → mediation quest
          for (const r of drama.rivalries.slice(0, 2)) {
            try {
              await storage.createQuest({
                worldId: config.worldId,
                title: `Bad Blood: ${r.person1Name} & ${r.person2Name}`,
                description: `The feud between ${r.person1Name} and ${r.person2Name} is causing tension in the settlement. Someone needs to mediate — or pick a side.`,
                questType: 'social',
                difficulty: 'hard',
                objectives: [
                  { description: `Talk to ${r.person1Name} about the conflict`, completed: false },
                  { description: `Talk to ${r.person2Name} about the conflict`, completed: false },
                  { description: 'Attempt to broker peace or take a side', completed: false },
                ],
                rewards: { experience: 75, reputation: 15 },
                relatedCharacterIds: [r.person1, r.person2],
                tags: ['drama', 'social', 'procedural'],
                source: 'drama_recognition',
              } as any);
              questsCreated.push(`Rivalry: ${r.person1Name} vs ${r.person2Name}`);
            } catch {}
          }

          // Business rivalry → economic quest
          for (const br of drama.businessRivalries.slice(0, 1)) {
            try {
              await storage.createQuest({
                worldId: config.worldId,
                title: `Market War: ${br.person1Name} vs ${br.person2Name}`,
                description: `Two competing business owners are locked in a bitter economic battle. The outcome could reshape the settlement's economy.`,
                questType: 'economic',
                difficulty: 'hard',
                objectives: [
                  { description: `Visit ${br.person1Name}'s establishment`, completed: false },
                  { description: `Visit ${br.person2Name}'s establishment`, completed: false },
                  { description: 'Choose who to support — or find a way both can thrive', completed: false },
                ],
                rewards: { experience: 100, reputation: 20, money: 50 },
                relatedCharacterIds: [br.person1, br.person2],
                tags: ['drama', 'economic', 'procedural'],
                source: 'drama_recognition',
              } as any);
              questsCreated.push(`Business rivalry: ${br.person1Name} vs ${br.person2Name}`);
            } catch {}
          }

          if (questsCreated.length > 0) {
            console.log(`   ✓ Created ${questsCreated.length} drama-driven quests`);
          }
        }
      } catch (e) {
        console.warn('Drama recognition failed:', (e as Error).message);
      }
    }

    // ── Phase 11: Character truths (AI-generated backstories) ──────────
    if (config.generateTruths !== false && livingCount > 0) {
      progress('truths', 'Generating character backstories...');
      truthCount = await this.generateCharacterTruths({
        worldId: config.worldId,
        worldName: world?.name || 'Unknown',
        worldDescription: world?.description || '',
        worldType: config.worldType,
      });
    }

    progress('complete', `Settlement generation complete: ${livingCount} living, ${businessCount} businesses, ${housed} housed`);

    return {
      settlementId: config.settlementId,
      population,
      families,
      generations: generationsCreated,
      districts,
      buildings,
      businesses: businessCount,
      employed: employedCount,
      occupations: occupationCount,
      housed,
      routines: routineCount,
      events: eventCount,
      itemsPlaced,
      textsSeeded,
      truths: truthCount,
    };
  }

  /**
   * Generate character truths (backstories, traits, secrets) using AI.
   * Gracefully returns 0 if Gemini is not configured.
   */
  async generateCharacterTruths(config: {
    worldId: string;
    worldName: string;
    worldDescription?: string;
    worldType?: string;
  }): Promise<number> {
    if (!isGeminiConfigured()) return 0;

    const characters = await storage.getCharactersByWorld(config.worldId);
    const living = characters.filter(c => c.isAlive);
    if (living.length === 0) return 0;

    const currentYear = new Date().getFullYear();
    // Process in batches of 10 to avoid LLM output truncation
    const BATCH_SIZE = 10;
    let totalTruths = 0;
    for (let batchStart = 0; batchStart < Math.min(living.length, 50); batchStart += BATCH_SIZE) {
      const charactersToProcess = living.slice(batchStart, batchStart + BATCH_SIZE);
      try {
        totalTruths += await this.generateTruthBatch(config, charactersToProcess, currentYear);
      } catch (err) {
        console.warn(`Truth batch ${batchStart}-${batchStart + BATCH_SIZE} failed:`, (err as Error).message);
      }
    }
    return totalTruths;
  }

  private async generateTruthBatch(
    config: { worldId: string; worldName: string; worldDescription?: string; worldType?: string },
    charactersToProcess: any[],
    currentYear: number,
  ): Promise<number> {
    const worldContext = `A ${config.worldType || 'medieval-fantasy'} world named "${config.worldName}". ${config.worldDescription || ''}`;

    const truthsPrompt = `Generate interesting character truths (backstories, personality traits, secrets, relationships) for ${charactersToProcess.length} characters in ${worldContext}.

For each character, create 2-3 truths that include:
- A defining personality trait or quirk
- A secret or hidden aspect of their past
- A relationship truth or social connection

Return as a JSON array with this structure:
[
  {
    "characterIndex": 0,
    "truths": [
      {
        "title": "Brief truth title",
        "content": "1-2 sentence description",
        "entryType": "trait|secret|relationship|backstory",
        "importance": 1-10
      }
    ]
  }
]

Character list:
${charactersToProcess.map((c, i) => `${i}. ${c.firstName} ${c.lastName} (${c.gender}, age ${c.birthYear ? (currentYear - c.birthYear) : 'unknown'})`).join('\n')}

Make truths fitting for the world's theme and each character's context.

IMPORTANT: Return ONLY valid JSON. Use double quotes for all strings. Escape any special characters (apostrophes, quotes) inside string values with backslash. Do not include markdown fences.`;

    try {
      const contentResult = await getContentProvider().generate({
        prompt: truthsPrompt,
        temperature: 0.7,
        responseMimeType: 'application/json',
        model: 'pro',
      });

      // Robust JSON sanitization for LLM output
      let jsonText = contentResult.text.trim();
      // Strip markdown fences
      jsonText = jsonText.replace(/^```json?\s*/i, '').replace(/\s*```\s*$/, '');
      // Fix trailing commas before } or ]
      jsonText = jsonText.replace(/,\s*([}\]])/g, '$1');
      // Fix single-quoted strings → double-quoted (but preserve apostrophes inside words)
      // Replace single-quoted property names: 'key': → "key":
      jsonText = jsonText.replace(/(?<=[\{,\s])'(\w+)'\s*:/g, '"$1":');
      // Fix unescaped control characters in strings
      jsonText = jsonText.replace(/[\x00-\x1f]/g, (ch) => ch === '\n' ? '\\n' : ch === '\t' ? '\\t' : '');
      // Fix invalid JSON escape sequences (e.g. \' → ', LLMs often escape apostrophes)
      jsonText = jsonText.replace(/\\'/g, "'");
      // If truncated, find last complete object and close
      if (!jsonText.endsWith(']')) {
        const lastBrace = jsonText.lastIndexOf('}');
        if (lastBrace > 0) {
          // Check if we need to close a truths array or the outer array
          const afterBrace = jsonText.substring(lastBrace + 1).trim();
          if (!afterBrace.startsWith(']')) {
            jsonText = jsonText.substring(0, lastBrace + 1) + ']}]';
          }
        }
      }

      let generatedTruths: any[];
      try {
        generatedTruths = JSON.parse(jsonText);
      } catch (parseErr1) {
        // Attempt 1: Fix unescaped quotes inside string values
        // Pattern: "content": "He said "hello" to her" → "content": "He said \"hello\" to her"
        try {
          const fixedQuotes = jsonText.replace(
            /"((?:title|content|entryType)":\s*")([^"]*?)(?="[,}\s])/g,
            (_, prefix, value) => `"${prefix}${value.replace(/"/g, '\\"')}`
          );
          generatedTruths = JSON.parse(fixedQuotes);
        } catch {
          // Attempt 2: Extract individual character truth objects via regex
          console.warn('Truth generation JSON parse failed, attempting object-by-object recovery...');
          try {
            const objectMatches = jsonText.match(/\{\s*"characterIndex"\s*:\s*\d+\s*,\s*"truths"\s*:\s*\[[\s\S]*?\]\s*\}/g);
            if (objectMatches && objectMatches.length > 0) {
              generatedTruths = [];
              for (const objStr of objectMatches) {
                try {
                  generatedTruths.push(JSON.parse(objStr));
                } catch {
                  // Skip malformed individual objects
                }
              }
              if (generatedTruths.length === 0) throw parseErr1;
            } else {
              throw parseErr1;
            }
          } catch {
            throw parseErr1;
          }
        }
      }

      let numTruths = 0;
      if (Array.isArray(generatedTruths)) {
        for (const charTruths of generatedTruths) {
          const character = charactersToProcess[charTruths.characterIndex];
          if (character && Array.isArray(charTruths.truths)) {
            for (const truth of charTruths.truths) {
              if (truth.title && truth.content) {
                await storage.createTruth({
                  worldId: config.worldId,
                  characterId: character.id,
                  title: truth.title,
                  content: truth.content,
                  entryType: truth.entryType || 'backstory',
                  importance: truth.importance || 5,
                  isPublic: false,
                  source: 'ai_generated',
                  tags: ['generated', 'ai'],
                });
                numTruths++;
              }
            }
          }
        }
      }

      console.log(`   ✓ Generated ${numTruths} character truths`);
      return numTruths;
    } catch (error) {
      console.warn('Character truth generation failed:', (error as Error).message);
      return 0;
    }
  }

  /**
   * Generate just genealogy for an existing world/settlement
   */
  async generateGenealogy(worldId: string, config: {
    settlementId?: string;
    numFoundingFamilies: number;
    generations: number;
    marriageRate?: number;
    fertilityRate?: number;
    deathRate?: number;
    startYear?: number;
    /** Target number of LIVING residents. Immigrants are generated to fill any deficit. */
    targetPopulation?: number;
  }): Promise<any> {
    const world = await storage.getWorld(worldId);
    if (!world) throw new Error('World not found');

    const currentYear = world.currentYear || 2000;

    const genealogyResult = await this.genealogyGen.generate({
      worldId,
      settlementId: config.settlementId,
      startYear: config.startYear || 1900,
      currentYear,
      numFoundingFamilies: config.numFoundingFamilies,
      generationsToGenerate: config.generations,
      marriageRate: config.marriageRate || 0.7,
      fertilityRate: config.fertilityRate || 0.6,
      deathRate: config.deathRate || 0.3
    });

    const result: any = { ...genealogyResult };

    // If a target living population was specified, count living characters
    // and generate immigrants to fill any deficit.
    if (config.targetPopulation && config.targetPopulation > 0 && config.settlementId) {
      const allCharacters = await storage.getCharactersBySettlement(config.settlementId);
      const livingCount = allCharacters.filter((c: any) => c.isAlive).length;
      const deficit = config.targetPopulation - livingCount;

      if (deficit > 0) {
        const immigrantsCreated = await this.genealogyGen.generateImmigrants({
          worldId,
          settlementId: config.settlementId,
          currentYear,
          count: deficit,
        });
        result.totalCharacters += immigrantsCreated;
        result.livingCharacters = config.targetPopulation;
        console.log(`[Genealogy] Generated ${immigrantsCreated} immigrants to reach target population of ${config.targetPopulation} (had ${livingCount} living from ${result.totalCharacters - immigrantsCreated} genealogy characters)`);
      } else {
        result.livingCharacters = livingCount;
      }
    }

    return result;
  }

  /**
   * Generate just geography for an existing settlement
   */
  async generateGeography(settlementId: string, config: {
    foundedYear?: number;
  }): Promise<any> {
    const settlement = await storage.getSettlement(settlementId);
    if (!settlement) throw new Error('Settlement not found');
    
    const characters = await storage.getCharactersByWorld(settlement.worldId);
    
    // Fetch target language for localized street names
    const world = await storage.getWorld(settlement.worldId);
    const worldLanguages = await storage.getWorldLanguagesByWorld(settlement.worldId);
    const learningTarget = worldLanguages?.find((l: any) => l.isLearningTarget);
    const targetLanguage = learningTarget?.name || world?.targetLanguage || undefined;

    return await this.geographyGen.generate({
      worldId: settlement.worldId,
      settlementId: settlement.id,
      settlementName: settlement.name,
      settlementType: settlement.settlementType as any,
      population: characters.length || this.estimatePopulation(settlement.settlementType),
      foundedYear: config.foundedYear || settlement.foundedYear || 1900,
      countryId: settlement.countryId ?? undefined,
      stateId: settlement.stateId ?? undefined,
      streetPattern: settlement.streetPattern || undefined,
      targetLanguage,
      worldType: world?.worldType || undefined,
    });
  }

  /**
   * Post-process a settlement after geography/character generation:
   * assigns business owners, employment, default occupations, and housing.
   * Used by the hierarchical generation endpoint which creates characters
   * and geography separately but skips the full WorldGenerator pipeline.
   */
  async postProcessSettlement(config: {
    worldId: string;
    settlementId: string;
    currentYear: number;
    terrain?: string;
    worldType?: string;
    settlementType?: string;
    guilds?: string[];
  }): Promise<{ businesses: number; employed: number; occupations: number; housed: number }> {
    const characters = await storage.getCharactersByWorld(config.worldId);
    const population = characters.filter(c => c.isAlive).length;
    let businessCount = 0;
    let employedCount = 0;

    // Step 1: Business ownership + employment
    if (population > 0) {
      const businesses = await this.generateInitialBusinesses({
        worldId: config.worldId,
        settlementId: config.settlementId,
        population,
        currentYear: config.currentYear,
        terrain: config.terrain,
        settlementType: config.settlementType,
        guilds: config.guilds,
      });
      businessCount = businesses.length;

      if (businesses.length > 0) {
        employedCount = await this.assignInitialEmployment({
          worldId: config.worldId,
          businesses,
          currentYear: config.currentYear,
        });
      }
    }

    // Step 2: Default occupations for anyone still unassigned
    const occupations = population > 0
      ? await assignDefaultOccupations({
          worldId: config.worldId,
          currentYear: config.currentYear,
          terrain: config.terrain,
        })
      : 0;

    // Step 3: Housing assignment
    let housed = 0;
    if (population > 0) {
      await this.assignHousing({
        worldId: config.worldId,
        settlementId: config.settlementId,
        currentYear: config.currentYear,
      });
      // Count assigned
      const residences = await storage.getResidencesBySettlement(config.settlementId);
      housed = residences.reduce((sum, r: any) => sum + ((r.residentIds as string[])?.length || 0), 0);
    }

    // Step 4: Place items
    if (businessCount > 0 || population > 0) {
      try {
        await placeItemsInWorld(config.worldId, config.worldType);
      } catch (e) {
        console.warn('Item placement during post-processing failed:', e);
      }
    }

    return { businesses: businessCount, employed: employedCount, occupations, housed };
  }

  /**
   * Generate initial businesses for the settlement based on population and terrain.
   * First assigns founders and proper types to geography-generated lot businesses,
   * then creates additional businesses if needed.
   */
  private async generateInitialBusinesses(config: {
    worldId: string;
    settlementId: string;
    population: number;
    currentYear: number;
    terrain?: string;
    settlementType?: string;
    guilds?: string[];
  }): Promise<Business[]> {
    const resultBusinesses: Business[] = [];

    // Determine what businesses are needed
    const businessPlan = this.determineBusinessMix(
      config.population,
      config.terrain,
      config.currentYear,
      config.settlementType,
      config.guilds
    );

    console.log(`   Planning ${businessPlan.length} businesses...`);

    // Get available characters to be founders — only from THIS settlement
    // so businesses aren't owned by people who live elsewhere.
    const characters = await storage.getCharactersBySettlement(config.settlementId);
    const adultCharacters = characters.filter(c =>
      this.getAge(c, config.currentYear) >= 18 &&
      this.getAge(c, config.currentYear) <= 65 &&
      c.isAlive
    );

    // Shuffle to randomize founder selection
    const availableFounders = adultCharacters.sort(() => Math.random() - 0.5);

    // Get existing geography-generated businesses on lots (no founder assigned yet)
    const existingBusinesses = await storage.getBusinessesBySettlement(config.settlementId);
    const unownedBusinesses = existingBusinesses.filter(b => !b.ownerId && !b.founderId);

    // Phase 1: Assign founders and proper types to existing lot-based businesses
    const unownedQueue = [...unownedBusinesses];
    const remainingPlan: BusinessType[] = [];

    for (const businessType of businessPlan) {
      const founder = availableFounders.pop();
      if (!founder) break;

      const lotBusiness = unownedQueue.shift();
      if (lotBusiness) {
        // Adopt the geography-generated business: update its type, name, and founder
        try {
          const name = this.generateBusinessName(businessType, founder);
          await storage.updateBusiness(lotBusiness.id, {
            businessType,
            name,
            ownerId: founder.id,
            founderId: founder.id,
            foundedYear: config.currentYear,
            vacancies: this.getVacanciesForBusinessType(businessType),
          });
          await storage.updateCharacter(founder.id, { occupation: `Owner (${businessType})` });
          resultBusinesses.push({ ...lotBusiness, businessType, name, ownerId: founder.id, founderId: founder.id } as Business);
          console.log(`   ✓ Founded ${name}`);
        } catch (error) {
          console.error(`   ✗ Failed to assign ${businessType} to lot:`, error);
          availableFounders.push(founder);
        }
      } else {
        // No more lot-based businesses — track for phase 2
        remainingPlan.push(businessType);
        availableFounders.push(founder);
      }
    }

    // Phase 2: Place overflow businesses on vacant lots (lots with no building).
    // This avoids creating orphaned location records with no address/position.
    if (remainingPlan.length > 0) {
      const allLots = await storage.getLotsBySettlement(config.settlementId);
      const vacantLots = allLots.filter((lot: any) => !lot.building && lot.address);

      for (const businessType of remainingPlan) {
        const founder = availableFounders.pop();
        if (!founder) break;

        const vacantLot = vacantLots.shift();
        if (vacantLot) {
          // Place the business on an existing vacant lot (inherits address/position)
          try {
            const name = this.generateBusinessName(businessType, founder);
            const business = await storage.createBusiness({
              lotId: vacantLot.id,
              worldId: config.worldId,
              settlementId: config.settlementId,
              name,
              businessType,
              ownerId: founder.id,
              founderId: founder.id,
              foundedYear: config.currentYear,
              isOutOfBusiness: false,
              vacancies: this.getVacanciesForBusinessType(businessType),
            });
            resultBusinesses.push(business);
            await storage.updateCharacter(founder.id, { occupation: `Owner (${businessType})` });
            console.log(`   ✓ Founded ${name} at ${vacantLot.address}`);
          } catch (error) {
            console.error(`   ✗ Failed to place ${businessType} on vacant lot:`, error);
            availableFounders.push(founder);
          }
        } else {
          // No vacant lots available — skip this business rather than creating an orphan
          console.log(`   ⚠️ No vacant lot for ${businessType}, skipping`);
          availableFounders.push(founder);
        }
      }
    }

    // Phase 3: Handle remaining unowned lot businesses.
    // Only assign owners from the settlement's own adults. If no adults are
    // available, delete the business and its lot — don't leave vacant buildings.
    if (unownedQueue.length > 0) {
      const allAdults = adultCharacters.filter(c =>
        !resultBusinesses.some(b => b.ownerId === c.id)
      );
      let adultIndex = 0;

      for (const business of unownedQueue) {
        if (adultIndex >= allAdults.length) {
          // No more local adults — remove the vacant business and its lot
          try {
            await storage.deleteBusiness(business.id);
            if ((business as any).lotId) {
              await storage.deleteLot((business as any).lotId);
            }
          } catch { /* lot may already be gone */ }
          console.log(`   🗑️ Removed vacant ${business.name} (no local owners)`);
          continue;
        }

        const owner = allAdults[adultIndex++];

        try {
          const businessType = business.businessType || 'Shop';
          const name = this.generateBusinessName(businessType as BusinessType, owner);
          await storage.updateBusiness(business.id, {
            ownerId: owner.id,
            founderId: owner.id,
            name,
            foundedYear: config.currentYear,
            vacancies: this.getVacanciesForBusinessType(businessType as BusinessType),
          });
          await storage.updateCharacter(owner.id, { occupation: `Owner (${businessType})` });
          resultBusinesses.push({ ...business, ownerId: owner.id, founderId: owner.id, name } as Business);
          console.log(`   ✓ Assigned owner to ${name}`);
        } catch (error) {
          console.error(`   ✗ Failed to assign owner to business ${business.name}:`, error);
        }
      }
    }

    return resultBusinesses;
  }

  /**
   * Determine business mix based on population, terrain, and era
   */
  private determineBusinessMix(
    population: number,
    terrain: string | undefined,
    year: number,
    settlementType?: string,
    guilds?: string[],
  ): BusinessType[] {
    const businesses: BusinessType[] = [];

    // Specialized settlement types guarantee specific businesses
    if (settlementType === 'landing') {
      businesses.push('Harbor', 'FishMarket');
      if (population > 3) businesses.push('Farm');
    } else if (settlementType === 'forge') {
      businesses.push('Blacksmith', 'Carpenter');
      if (population > 3) businesses.push('Farm');
    } else if (settlementType === 'chapel') {
      businesses.push('Church', 'School');
      if (population > 3) businesses.push('Farm');
    } else if (settlementType === 'market') {
      businesses.push('Shop', 'GroceryStore', 'Tavern' as any);
      if (population > 10) businesses.push('Farm');
    } else if (settlementType === 'hamlet') {
      businesses.push('Farm', 'GroceryStore', 'Restaurant');
    } else if (settlementType === 'village') {
      businesses.push('Farm', 'GroceryStore', 'Restaurant');
      if (population > 30) businesses.push('School');
    } else if (settlementType === 'homestead') {
      businesses.push('Farm');
    }

    // Add explicitly assigned guilds
    const specializedTypes = ['landing', 'forge', 'chapel', 'market', 'hamlet', 'village', 'homestead'];
    if (guilds && guilds.length > 0) {
      for (const guild of guilds) {
        businesses.push(guild as BusinessType);
      }
      // Early return for specialized types that already have their businesses
      if (specializedTypes.includes(settlementType || '')) {
        return businesses;
      }
    } else if (specializedTypes.includes(settlementType || '')) {
      // No explicit guilds — use legacy defaults for backward compatibility
      const defaultGuild: Record<string, string> = {
        landing: 'GuildDiplomates',
        forge: 'GuildArtisans',
        chapel: 'GuildExplorateurs',
        market: 'GuildMarchands',
        hamlet: 'GuildConteurs',
      };
      if (settlementType && defaultGuild[settlementType]) {
        businesses.push(defaultGuild[settlementType] as BusinessType);
      }
      return businesses;
    }

    // Tiny settlements (< 15 people): just a farm, maybe nothing
    if (population < 15) {
      businesses.push('Farm');
      return businesses;
    }

    // Core essentials (always needed)
    businesses.push('Farm');

    if (population > 100) {
      businesses.push('GroceryStore');
      businesses.push('Restaurant');
    }

    if (population > 300) {
      businesses.push('Clinic');
      businesses.push('Carpenter');
      businesses.push('Factory');
    }

    if (population > 500) {
      businesses.push('LawFirm');
      businesses.push('School');
      businesses.push('Bank');
    }

    if (population > 1000) {
      businesses.push('Bar');
      businesses.push('TownHall');
    }

    // Terrain-specific
    if (terrain === 'mountains') {
      businesses.push('Blacksmith');
    } else if (terrain === 'coast' || terrain === 'river') {
      businesses.push('Harbor');
    } else if (terrain === 'forest') {
      businesses.push('Carpenter');
    }

    // Era-specific adjustments
    if (year < 1900) {
      // More agricultural in pre-industrial era
      businesses.push('Farm');
    } else if (year > 1950) {
      // More retail/service in modern era
      businesses.push('Shop');
      if (population > 500) {
        businesses.push('Hospital');
      }
    }

    return businesses;
  }

  /**
   * Generate business name based on type and founder
   */
  private generateBusinessName(businessType: BusinessType, founder: Character): string {
    const templates: Partial<Record<BusinessType, string[]>> = {
      'Farm': ['Farm', 'Ranch', 'Farmstead'],
      'GroceryStore': ['General Store', 'Grocery', 'Mercantile'],
      'Shop': ['Shop', 'Emporium', 'Goods'],
      'Restaurant': ['Tavern', 'Inn', 'Eatery'],
      'Clinic': ['Clinic', 'Practice', 'Medical Office'],
      'Hospital': ['Hospital', 'Medical Center', 'Infirmary'],
      'Carpenter': ['Builders', 'Woodworks', 'Carpentry'],
      'Factory': ['Workshop', 'Factory', 'Manufactory'],
      'LawFirm': ['Law Office', 'Legal Services', 'Attorney at Law'],
      'School': ['School', 'Academy', 'Institute'],
      'Bank': ['Bank', 'Savings & Loan', 'Credit Union'],
      'Bar': ['Saloon', 'Pub', 'Tavern'],
      'TownHall': ['Town Hall', 'City Hall', 'Municipal Building'],
      'Blacksmith': ['Forge', 'Smithy', 'Ironworks'],
      'Harbor': ['Shipping Co.', 'Dock', 'Wharf'],
      'GuildMarchands': ['La Guilde des Marchands'],
      'GuildArtisans': ['La Guilde des Artisans'],
      'GuildConteurs': ['La Guilde des Conteurs'],
      'GuildExplorateurs': ['La Guilde des Explorateurs'],
      'GuildDiplomates': ['La Guilde des Diplomates'],
    };

    const typeTemplates = templates[businessType] || [businessType];
    const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];

    return `${founder.lastName}'s ${template}`;
  }

  /**
   * Get initial vacancies for a business type
   */
  private getVacanciesForBusinessType(businessType: BusinessType): {
    day: OccupationVocation[];
    night: OccupationVocation[];
  } {
    // Vacancy counts per task requirements:
    // Small (shops, bakeries): 1 employee beyond owner
    // Medium (taverns, restaurants): 2-3 employees beyond owner
    // Large (factories, hotels, hospitals): 3-5 employees beyond owner
    const vacancies: Partial<Record<BusinessType, { day: OccupationVocation[]; night: OccupationVocation[] }>> = {
      // Small businesses (1 employee)
      'Farm': { day: ['Farmhand'], night: [] },
      'GroceryStore': { day: ['Cashier'], night: [] },
      'Shop': { day: ['Cashier'], night: [] },
      'Carpenter': { day: ['Carpenter'], night: [] },
      'Blacksmith': { day: ['Blacksmith'], night: [] },
      'Harbor': { day: ['Laborer'], night: [] },
      'Clinic': { day: ['Nurse'], night: [] },
      // Medium businesses (2-3 employees)
      'Restaurant': { day: ['Cook', 'Waiter'], night: ['Bartender'] },
      'Bar': { day: ['Bartender', 'Waiter'], night: ['Bartender'] },
      'LawFirm': { day: ['Lawyer', 'Secretary'], night: [] },
      'School': { day: ['Teacher', 'Teacher'], night: [] },
      'Bank': { day: ['BankTeller', 'BankTeller'], night: [] },
      'TownHall': { day: ['Manager', 'Secretary'], night: [] },
      // Large businesses (3-5 employees)
      'Factory': { day: ['Laborer', 'Laborer', 'Laborer'], night: ['Laborer', 'Laborer'] },
      'Hospital': { day: ['Doctor', 'Nurse', 'Nurse'], night: ['Nurse', 'Nurse'] },
      // Guild halls (1 trainer employee)
      'GuildMarchands': { day: ['Cashier'], night: [] },
      'GuildArtisans': { day: ['Carpenter'], night: [] },
      'GuildConteurs': { day: ['Teacher'], night: [] },
      'GuildExplorateurs': { day: ['Farmer'], night: [] },
      'GuildDiplomates': { day: ['Secretary'], night: [] },
    };

    return vacancies[businessType] || { day: [], night: [] };
  }

  /**
   * Get the default vocation for a business type (used as fallback when no vacancies are defined)
   */
  private getDefaultVocationForBusinessType(businessType: BusinessType): OccupationVocation {
    const defaults: Partial<Record<BusinessType, OccupationVocation>> = {
      'Farm': 'Farmhand',
      'GroceryStore': 'Grocer',
      'Shop': 'Cashier',
      'Restaurant': 'Waiter',
      'Clinic': 'Nurse',
      'Hospital': 'Nurse',
      'Carpenter': 'Carpenter',
      'Factory': 'Laborer',
      'LawFirm': 'Secretary',
      'School': 'Teacher',
      'Bank': 'BankTeller',
      'Bar': 'Bartender',
      'TownHall': 'Manager',
      'Blacksmith': 'Blacksmith',
      'Harbor': 'Laborer',
    };
    return defaults[businessType] || 'Worker';
  }

  /**
   * Assign employment to characters based on businesses.
   * Guarantees every business gets at least one employee beyond the owner.
   */
  private async assignInitialEmployment(config: {
    worldId: string;
    businesses: Business[];
    currentYear: number;
  }): Promise<number> {
    const characters = await storage.getCharactersByWorld(config.worldId);
    // Collect all founder/owner IDs so we don't reassign them
    const ownerIds = new Set(config.businesses.map(b => b.ownerId).filter(Boolean));
    const employableCharacters = characters.filter(c =>
      this.getAge(c, config.currentYear) >= 18 &&
      this.getAge(c, config.currentYear) <= 65 &&
      c.isAlive &&
      !ownerIds.has(c.id)
    );

    // Create Owner occupation records in the database for all business owners
    for (const business of config.businesses) {
      if (!business.ownerId) continue;
      try {
        await storage.createOccupation({
          worldId: config.worldId,
          characterId: business.ownerId,
          businessId: business.id,
          vocation: 'Owner',
          shift: 'day',
          startYear: config.currentYear,
          yearsExperience: 0,
          level: 5,
          isSupplemental: false,
          hiredAsFavor: false
        });
      } catch (error) {
        console.error(`   ✗ Failed to create Owner occupation for business ${business.name}:`, error);
      }
    }

    // Shuffle to randomize hiring
    const candidatePool = employableCharacters.sort(() => Math.random() - 0.5);
    let employedCount = 0;

    // Track which businesses have received at least one employee
    const businessesWithEmployees = new Set<string>();

    // Helper to hire one candidate for a business
    const hireCandidate = async (
      business: Business,
      vocation: OccupationVocation,
      shift: 'day' | 'night'
    ): Promise<boolean> => {
      const candidate = candidatePool.pop();
      if (!candidate) return false;
      try {
        await fillVacancy(
          business.id,
          candidate.id,
          vocation,
          shift,
          business.ownerId || candidate.id,
          config.currentYear
        );
        await storage.updateCharacter(candidate.id, { occupation: vocation });
        employedCount++;
        businessesWithEmployees.add(business.id);
        return true;
      } catch (error) {
        console.error(`   ✗ Failed to hire ${vocation}:`, error);
        candidatePool.push(candidate); // Return candidate to pool on failure
        return false;
      }
    };

    // Pass 1: Guarantee at least one employee per business
    for (const business of config.businesses) {
      if (candidatePool.length === 0) break;

      const dayVacancies: OccupationVocation[] = (business.vacancies as any)?.day || [];
      const nightVacancies: OccupationVocation[] = (business.vacancies as any)?.night || [];

      if (dayVacancies.length > 0) {
        // Hire the first day vacancy
        await hireCandidate(business, dayVacancies[0], 'day');
      } else if (nightVacancies.length > 0) {
        // Hire the first night vacancy
        await hireCandidate(business, nightVacancies[0], 'night');
      } else {
        // No vacancies defined — assign a default worker
        const defaultVocation = this.getDefaultVocationForBusinessType(
          business.businessType as BusinessType
        );
        await hireCandidate(business, defaultVocation, 'day');
      }
    }

    // Pass 2: Fill remaining vacancies across all businesses
    for (const business of config.businesses) {
      if (candidatePool.length === 0) break;

      const dayVacancies: OccupationVocation[] = (business.vacancies as any)?.day || [];
      const nightVacancies: OccupationVocation[] = (business.vacancies as any)?.night || [];

      // Skip the first day/night vacancy already filled in pass 1
      const skipFirst = businessesWithEmployees.has(business.id);
      const remainingDay = skipFirst && dayVacancies.length > 0 ? dayVacancies.slice(1) : dayVacancies;
      const remainingNight = skipFirst && dayVacancies.length === 0 && nightVacancies.length > 0
        ? nightVacancies.slice(1)
        : nightVacancies;

      for (const vocation of remainingDay) {
        if (candidatePool.length === 0) break;
        await hireCandidate(business, vocation, 'day');
      }

      for (const vocation of remainingNight) {
        if (candidatePool.length === 0) break;
        await hireCandidate(business, vocation, 'night');
      }
    }

    const unstaffed = config.businesses.filter(b => !businessesWithEmployees.has(b.id));
    if (unstaffed.length > 0) {
      console.warn(`   ⚠ ${unstaffed.length} business(es) could not be staffed (not enough candidates)`);
    }

    console.log(`   ✓ Assigned ${employedCount} jobs across ${businessesWithEmployees.size}/${config.businesses.length} businesses`);
    return employedCount;
  }

  /**
   * Assign living characters to residences, grouping families together.
   * Follows TotT's pattern where each person has a home (DwellingPlace).
   */
  private async assignHousing(config: {
    worldId: string;
    settlementId: string;
    currentYear: number;
  }): Promise<void> {
    // Only house characters who actually belong to this settlement
    const characters = await storage.getCharactersBySettlement(config.settlementId);
    let residences = await storage.getResidencesBySettlement(config.settlementId);

    const livingCharacters = characters.filter(c => c.isAlive);

    if (livingCharacters.length === 0) {
      return;
    }

    // Convert vacant lots into residences if we don't have enough housing
    if (residences.length === 0 || this.totalCapacity(residences) < livingCharacters.length) {
      const allLots = await storage.getLotsBySettlement(config.settlementId);
      const vacantLots = allLots.filter((l: any) => !l.building && l.address && l.lotType !== 'park');
      const needed = livingCharacters.length - this.totalCapacity(residences);
      const housesNeeded = Math.ceil(needed / 4); // each residence holds ~4
      const lotsToConvert = vacantLots.slice(0, housesNeeded);

      if (lotsToConvert.length > 0) {
        console.log(`   Converting ${lotsToConvert.length} vacant lots into residences`);
        for (const lot of lotsToConvert) {
          const updated = await storage.updateLot(lot.id, {
            building: {
              buildingCategory: 'residence',
              residenceType: 'house',
              residentIds: [],
              ownerIds: [],
            },
          });
          if (updated) {
            residences.push({
              id: lot.id,
              lotId: lot.id,
              address: lot.address,
              residenceType: 'house',
              ownerIds: [],
              residentIds: [],
              remaining: 4,
            });
          }
        }
      }
    }

    // Group characters by family (last name) to keep families together
    const families = new Map<string, typeof livingCharacters>();
    for (const char of livingCharacters) {
      const key = char.lastName || char.id;
      if (!families.has(key)) families.set(key, []);
      families.get(key)!.push(char);
    }

    // Capacity per residence type
    const capacities: Record<string, number> = {
      mansion: 12, house: 6, cottage: 4, apartment: 2, townhouse: 5, mobile_home: 3
    };

    // Track remaining capacity per residence
    const residenceCapacity = residences.map((r: any) => ({
      id: r.id,
      remaining: capacities[r.residenceType] || 4,
      residentIds: [] as string[],
      ownerIds: [] as string[]
    }));

    let residenceIdx = 0;
    let assignedCount = 0;

    // Assign each family to a residence
    for (const [, members] of families) {
      if (residenceIdx >= residenceCapacity.length) {
        // Wrap around if more families than residences
        residenceIdx = 0;
      }

      // Identify adults in the family (18+ years old)
      const adults = members.filter((m: any) => m.birthYear && (config.currentYear - m.birthYear) >= 18);

      let placed = false;
      // Try to find a residence with enough capacity for the family
      for (let attempts = 0; attempts < residenceCapacity.length; attempts++) {
        const idx = (residenceIdx + attempts) % residenceCapacity.length;
        const res = residenceCapacity[idx];
        if (res.remaining >= members.length) {
          for (const member of members) {
            res.residentIds.push(member.id);
            res.remaining--;
            assignedCount++;
          }
          // First adult becomes the owner; if no adults, first member owns
          const owner = adults[0] || members[0];
          if (owner && !res.ownerIds.includes(owner.id)) {
            res.ownerIds.push(owner.id);
          }
          residenceIdx = idx + 1;
          placed = true;
          break;
        }
      }

      // Fallback: split the family across residences if no single one fits
      if (!placed) {
        const owner = adults[0] || members[0];
        let ownerAssigned = false;
        for (const member of members) {
          const res = residenceCapacity[residenceIdx % residenceCapacity.length];
          res.residentIds.push(member.id);
          res.remaining = Math.max(0, res.remaining - 1);
          assignedCount++;
          // Assign owner to the first residence the family lands in
          if (!ownerAssigned && owner && !res.ownerIds.includes(owner.id)) {
            res.ownerIds.push(owner.id);
            ownerAssigned = true;
          }
          if (res.remaining <= 0) residenceIdx++;
        }
      }
    }

    // Ensure every residence has at least one resident by distributing unhoused characters
    // or reassigning from over-populated residences
    const emptyResidences = residenceCapacity.filter(r => r.residentIds.length === 0);
    if (emptyResidences.length > 0 && livingCharacters.length > 0) {
      // Find characters from the most crowded residences to redistribute
      const sortedByPopulation = [...residenceCapacity]
        .filter(r => r.residentIds.length > 1)
        .sort((a, b) => b.residentIds.length - a.residentIds.length);

      for (const emptyRes of emptyResidences) {
        if (sortedByPopulation.length === 0) break;
        const crowded = sortedByPopulation[0];
        if (crowded.residentIds.length <= 1) break;

        // Move last resident from the most crowded residence
        const movedId = crowded.residentIds.pop()!;
        crowded.remaining++;
        emptyRes.residentIds.push(movedId);
        emptyRes.remaining--;
        emptyRes.ownerIds.push(movedId);

        // Also remove from ownerIds if they were an owner of the old residence
        const ownerIdx = crowded.ownerIds.indexOf(movedId);
        if (ownerIdx !== -1) crowded.ownerIds.splice(ownerIdx, 1);

        // Re-sort after modification
        sortedByPopulation.sort((a, b) => b.residentIds.length - a.residentIds.length);
      }
    }

    // Batch update all residences and characters
    const assignedCharIds = new Set<string>();
    for (const res of residenceCapacity) {
      await storage.updateResidence(res.id, {
        residentIds: res.residentIds,
        ownerIds: res.ownerIds
      });
      // Set currentResidenceId on each character
      for (const charId of res.residentIds) {
        await storage.updateCharacter(charId, { currentResidenceId: res.id });
        assignedCharIds.add(charId);
      }
    }

    // Warn about any unhoused characters
    const unhoused = livingCharacters.filter(c => !assignedCharIds.has(c.id));
    if (unhoused.length > 0) {
      console.warn(`   ⚠ WARNING: ${unhoused.length} character(s) remain unhoused after assignment: ${unhoused.slice(0, 5).map(c => c.firstName + ' ' + c.lastName).join(', ')}${unhoused.length > 5 ? '...' : ''}`);
      // Assign unhoused characters to a random existing residence as fallback
      for (const char of unhoused) {
        const fallbackRes = residenceCapacity[Math.floor(Math.random() * residenceCapacity.length)];
        fallbackRes.residentIds.push(char.id);
        await storage.updateResidence(fallbackRes.id, { residentIds: fallbackRes.residentIds });
        await storage.updateCharacter(char.id, { currentResidenceId: fallbackRes.id });
        assignedCount++;
      }
    }

    const occupied = residenceCapacity.filter(r => r.residentIds.length > 0).length;
    const emptyFinal = residenceCapacity.filter(r => r.residentIds.length === 0);
    const owned = residenceCapacity.filter(r => r.ownerIds.length > 0).length;

    // Remove vacant residences and their lots — no reason to keep empty buildings
    if (emptyFinal.length > 0) {
      for (const res of emptyFinal) {
        try {
          await storage.deleteResidence(res.id);
          if (res.lotId) await storage.deleteLot(res.lotId);
        } catch { /* lot may already be gone */ }
      }
      console.log(`   🗑️ Removed ${emptyFinal.length} vacant residence(s)`);
    }

    console.log(`   ✓ Assigned ${assignedCount} characters to ${occupied} residences (${owned} with owners)`);
  }

  private totalCapacity(residences: any[]): number {
    const capacities: Record<string, number> = {
      mansion: 12, house: 6, cottage: 4, apartment: 2, townhouse: 5, mobile_home: 3
    };
    return residences.reduce((sum: number, r: any) => sum + (capacities[r.residenceType] || 4), 0);
  }

  /**
   * Generate daily routines for all characters
   */
  private async generateInitialRoutines(config: {
    worldId: string;
    currentYear: number;
  }): Promise<number> {
    const characters = await storage.getCharactersByWorld(config.worldId);
    let routineCount = 0;
    
    for (const character of characters) {
      // Only generate for living individuals age 10+
      const age = this.getAge(character, config.currentYear);
      if (character.isAlive && age >= 10) {
        try {
          const routine = await generateDefaultRoutine(character.id);
          await setRoutine(character.id, routine);
          routineCount++;
        } catch (error) {
          console.error(`   ✗ Failed to generate routine for ${character.firstName}:`, error);
        }
      }
    }
    
    console.log(`   ✓ Generated ${routineCount} routines`);
    return routineCount;
  }

  /**
   * Simulate historical events over time
   */
  /**
   * Lo-fi historical simulation following Talk of the Town's two-phase approach.
   * Simulates years of history probabilistically: deaths, marriages, births,
   * divorces, education, business cycles. Each year, a subset of life events
   * are evaluated. Artifacts (gravestones, wedding rings) are created as
   * side-effects of life events. Grieving is triggered on deaths.
   */
  /**
   * Create a historical Truth record for a world event during simulation.
   * These truths are timestep-0 (base world state) and form the world history
   * visible in the World History timeline/graph views.
   */
  private async createHistoricalTruth(config: {
    worldId: string;
    characterId?: string;
    title: string;
    content: string;
    entryType: string;
    year: number;
    importance?: number;
    tags?: string[];
  }): Promise<void> {
    try {
      await storage.createTruth({
        worldId: config.worldId,
        characterId: config.characterId,
        title: config.title,
        content: config.content,
        entryType: config.entryType,
        importance: config.importance || 5,
        isPublic: true,
        source: 'procedural_history',
        tags: ['history', 'timestep_0', ...(config.tags || [])],
        timeYear: config.year,
        historicalSignificance: config.characterId ? 'personal' : 'settlement',
      });
    } catch {}
  }

  private async simulateHistory(config: {
    worldId: string;
    startYear: number;
    endYear: number;
    fidelity: 'low' | 'medium' | 'high';
    targetLanguage?: string;
  }): Promise<number> {
    const yearsToSimulate = config.endYear - config.startYear;
    if (yearsToSimulate <= 0) return 0;

    // Lo-fi: simulate probabilistically per year (like TotT's chance_of_a_timestep_being_simulated)
    const simChance = config.fidelity === 'low' ? 0.15 : config.fidelity === 'medium' ? 0.4 : 1.0;

    // Resolve name pool for generating child names
    const namePool = resolveNamePool(config.targetLanguage);

    let timestep = 0;
    let totalEvents = 0;
    let deaths = 0, marriages = 0, births = 0, divorces = 0, educated = 0;

    for (let year = 0; year < yearsToSimulate; year++) {
      const currentYear = config.startYear + year;
      timestep = year * 730; // 2 timesteps/day × 365 days

      // Refresh characters once per year
      const characters = await storage.getCharactersByWorld(config.worldId);
      const living = characters.filter(c => c.isAlive);
      if (living.length === 0) break;

      // ── Deaths (always checked, like TotT) ────────────────────────────
      for (const char of living) {
        const age = this.getAge(char, currentYear);
        if (age < 68) continue;
        const deathProb = calculateDeathProbability(age);
        if (Math.random() < deathProb) {
          try {
            await die(char.id, 'old_age', char.currentLocation || '', timestep);
            deaths++;
            totalEvents++;

            // Historical truth
            await this.createHistoricalTruth({
              worldId: config.worldId, characterId: char.id,
              title: `Death of ${char.firstName} ${char.lastName}`,
              content: `${char.firstName} ${char.lastName} passed away at the age of ${age} in ${currentYear}.`,
              entryType: 'death', year: currentYear, importance: 7, tags: ['death'],
            });

            // Grieving — notify family and friends
            try { await processDeathGrief(char.id, config.worldId, timestep); } catch {}

            // Gravestone artifact
            try { await createGravestone(char.id, config.worldId, 'cemetery', timestep); } catch {}
          } catch {}
        }
      }

      // Skip remaining events probabilistically (lo-fi optimization)
      if (Math.random() > simChance) {
        // Still handle business cycles even on skipped years
        if (Math.random() < 0.05) {
          await this.attemptBusinessFounding(config.worldId, currentYear, timestep);
          totalEvents++;
        }
        continue;
      }

      // ── Marriages (unmarried adults with compatible partners) ─────────
      const unmarried = living.filter(c =>
        !c.spouseId && this.getAge(c, currentYear) >= 18 && this.getAge(c, currentYear) <= 55 && c.isAlive
      );
      // Pair up random unmarried adults (simplified courtship for lo-fi)
      const shuffled = unmarried.sort(() => Math.random() - 0.5);
      const paired = new Set<string>();
      for (let i = 0; i < shuffled.length - 1; i += 2) {
        const a = shuffled[i], b = shuffled[i + 1];
        if (paired.has(a.id) || paired.has(b.id)) continue;
        if (a.gender === b.gender) continue; // simple pairing
        // 15% chance per eligible pair per simulated year
        if (Math.random() > 0.15) continue;
        try {
          await developAttraction(a.id, b.id, timestep);
          await marry(a.id, b.id, a.currentLocation || '', [], timestep);
          marriages++;
          totalEvents++;
          paired.add(a.id);
          paired.add(b.id);

          // Historical truth (one per couple, linked to both)
          await this.createHistoricalTruth({
            worldId: config.worldId, characterId: a.id,
            title: `Marriage of ${a.firstName} ${a.lastName} and ${b.firstName} ${b.lastName}`,
            content: `${a.firstName} ${a.lastName} and ${b.firstName} ${b.lastName} were married in ${currentYear}.`,
            entryType: 'marriage', year: currentYear, importance: 6, tags: ['marriage', 'relationship'],
          });

          // Wedding ring artifacts
          try {
            await createWeddingRing(a.id, b.id, config.worldId, timestep);
            await createWeddingRing(b.id, a.id, config.worldId, timestep);
          } catch {}
        } catch {}
      }

      // ── Births (married women of childbearing age) ───────────────────
      // Re-check living since some may have died this year
      const mothers = living.filter(c =>
        c.isAlive && c.gender?.toLowerCase() === 'female' &&
        c.spouseId && this.getAge(c, currentYear) >= 18 && this.getAge(c, currentYear) <= 45
      );
      for (const mother of mothers) {
        // 20% chance per year, reduced by number of existing children
        const childCount = characters.filter(c =>
          (c as any).parentIds?.includes(mother.id) || (c as any).motherId === mother.id
        ).length;
        const birthChance = 0.20 * Math.pow(0.7, childCount);
        if (Math.random() < birthChance && mother.spouseId) {
          try {
            await conceive(mother.id, mother.spouseId, timestep);
            // Pick a name from the culture-appropriate pool
            const childGender = Math.random() < 0.5 ? 'male' : 'female';
            const childNamePool = namePool[childGender as 'male' | 'female'];
            const childFirstName = childNamePool[Math.floor(Math.random() * childNamePool.length)];
            const birth = await giveBirth(mother.id, mother.currentLocation || '', timestep + 270, currentYear, childFirstName);
            births++;
            totalEvents++;

            // Historical truth for birth
            if (birth.childId) {
              const newborn = await storage.getCharacter(birth.childId);
              if (newborn) {
                await this.createHistoricalTruth({
                  worldId: config.worldId, characterId: birth.childId,
                  title: `Birth of ${newborn.firstName} ${newborn.lastName}`,
                  content: `${newborn.firstName} ${newborn.lastName} was born to ${mother.firstName} ${mother.lastName} in ${currentYear}.`,
                  entryType: 'birth', year: currentYear, importance: 5, tags: ['birth'],
                });
              }
            }

            // Initialize appearance for newborn (inherits from parents)
            if (birth.childId) {
              const child = await storage.getCharacter(birth.childId);
              if (child) {
                try {
                  await initializeCharacterAppearance(
                    child.id,
                    (child.gender?.toLowerCase() === 'female' ? 'female' : 'male'),
                    mother.id,
                    mother.spouseId,
                    0
                  );
                } catch {}
              }
            }
          } catch {}
        }
      }

      // ── Divorces (unhappy marriages) ─────────────────────────────────
      const married = living.filter(c => c.spouseId && c.isAlive);
      for (const char of married) {
        // 1% chance per year
        if (Math.random() < 0.01) {
          try {
            const exSpouse = await storage.getCharacter(char.spouseId!);
            await divorce(char.id, char.spouseId!, char.currentLocation || '', timestep);
            divorces++;
            totalEvents++;

            // Historical truth
            if (exSpouse) {
              await this.createHistoricalTruth({
                worldId: config.worldId, characterId: char.id,
                title: `Divorce of ${char.firstName} ${char.lastName} and ${exSpouse.firstName} ${exSpouse.lastName}`,
                content: `${char.firstName} ${char.lastName} and ${exSpouse.firstName} ${exSpouse.lastName} divorced in ${currentYear}.`,
                entryType: 'divorce', year: currentYear, importance: 5, tags: ['divorce', 'relationship'],
              });
            }
          } catch {}
        }
      }

      // ── Education (college-age adults) ───────────────────────────────
      const collegeAge = living.filter(c =>
        c.isAlive && this.getAge(c, currentYear) >= 18 && this.getAge(c, currentYear) <= 22
      );
      for (const student of collegeAge) {
        try {
          const result = await shouldAttendCollege(student, student.personality as any, config.worldId);
          if (result.shouldAttend) {
            const major = selectMajor(student.personality as any, student.gender || 'male');
            await enrollInCollege(student.id, major, 'University', timestep, config.worldId);
            educated++;
            totalEvents++;
          }
        } catch {}
      }

      // ── Business cycles ──────────────────────────────────────────────
      if (Math.random() < 0.05) {
        await this.attemptBusinessFounding(config.worldId, currentYear, timestep);
        totalEvents++;
      }
      if (Math.random() < 0.02) {
        await this.attemptBusinessClosure(config.worldId, currentYear, timestep);
        totalEvents++;
      }

      // Trigger any additional automatic events from the event system
      try {
        const events = await triggerAutomaticEvents(config.worldId, currentYear, timestep);
        totalEvents += events.length;
      } catch {}
    }

    console.log(`   ✓ Simulated ${yearsToSimulate} years (${config.fidelity} fidelity): ${deaths} deaths, ${marriages} marriages, ${births} births, ${divorces} divorces, ${educated} educated, ${totalEvents} total events`);
    return totalEvents;
  }

  /**
   * Attempt to found a new business during simulation
   */
  private async attemptBusinessFounding(
    worldId: string,
    currentYear: number,
    timestep: number
  ): Promise<void> {
    const characters = await storage.getCharactersByWorld(worldId);
    const unemployed = characters.filter(c => {
      const age = this.getAge(c, currentYear);
      const customData = (c as any).customData as Record<string, any> | undefined;
      return c.isAlive &&
             age >= 25 &&
             age <= 60 &&
             !customData?.currentOccupation;
    });
    
    if (unemployed.length > 0 && Math.random() < 0.3) {
      const founder = unemployed[Math.floor(Math.random() * unemployed.length)];
      const businessTypes: BusinessType[] = ['Retail', 'Restaurant', 'Manufacturing'];
      const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
      
      try {
        await foundBusiness({
          worldId,
          founderId: founder.id,
          name: `${founder.lastName}'s ${businessType}`,
          businessType,
          address: 'Main Street',
          currentYear,
          currentTimestep: timestep
        });
        console.log(`   ✓ ${founder.lastName} founded new ${businessType}`);
      } catch (error) {
        // Silent fail - founding doesn't always succeed
      }
    }
  }

  /**
   * Attempt to close a business during simulation
   */
  private async attemptBusinessClosure(
    worldId: string,
    currentYear: number,
    timestep: number
  ): Promise<void> {
    try {
      const businesses = await storage.getBusinessesByWorld(worldId);
      const activeBusinesses = businesses.filter((b: Business) => !b.isOutOfBusiness);
      
      if (activeBusinesses.length > 5 && Math.random() < 0.5) {
        const businessToClose = activeBusinesses[
          Math.floor(Math.random() * activeBusinesses.length)
        ];
        
        await closeBusiness({
          businessId: businessToClose.id,
          reason: Math.random() < 0.5 ? 'bankruptcy' : 'retirement',
          currentYear,
          currentTimestep: timestep,
          notifyEmployees: true
        });
        console.log(`   ✓ ${businessToClose.name} closed`);
      }
    } catch (error) {
      // Silent fail - closure doesn't always succeed
    }
  }

  /**
   * Get character age at a specific year
   */
  private getAge(character: Character, currentYear: number): number {
    return currentYear - (character.birthYear || 0);
  }

  /**
   * Count employed characters in a world
   */
  private async countEmployed(worldId: string): Promise<number> {
    const characters = await storage.getCharactersByWorld(worldId);
    return characters.filter(c => {
      const customData = (c as any).customData as Record<string, any> | undefined;
      return customData?.currentOccupation;
    }).length;
  }

  /**
   * Estimate population based on settlement type
   */
  private estimatePopulation(type: string): number {
    switch (type) {
      case 'dwelling': case 'roadhouse': return 2;
      case 'landing': case 'forge': case 'chapel': case 'homestead': return 5;
      case 'market': return 15;
      case 'hamlet': return 25;
      case 'village': return 50;
      case 'town': return 500;
      case 'city': return 2500;
      default: return 50;
    }
  }

  /**
   * Phase 5: Initialize Social Dynamics (based on TotT's relationship initialization)
   * Creates initial relationships for families and coworkers
   */
  private async initializeSocialDynamics(config: {
    worldId: string;
    currentYear: number;
  }): Promise<void> {
    const characters = await storage.getCharactersByWorld(config.worldId);

    // Build character lookup map for O(1) access
    const charMap = new Map<string, typeof characters[0]>();
    for (const c of characters) charMap.set(c.id, c);

    // Pre-filter eligible characters (age > 3)
    const eligible = characters.filter(c => this.getAge(c, config.currentYear) > 3);

    // Accumulate all relationship mutations in-memory: charId -> { relationshipDetails }
    const socialUpdates = new Map<string, Record<string, RelationshipDetails>>();

    const getOrCreateSocialData = (charId: string): Record<string, RelationshipDetails> => {
      const existing = socialUpdates.get(charId);
      if (existing) return existing;
      const char = charMap.get(charId)!;
      const data: Record<string, RelationshipDetails> = { ...((char.socialAttributes as any)?.relationshipDetails || {}) };
      socialUpdates.set(charId, data);
      return data;
    };

    let relationshipsCreated = 0;

    for (let i = 0; i < eligible.length; i++) {
      const char1 = eligible[i];
      for (let j = i + 1; j < eligible.length; j++) {
        const char2 = eligible[j];

        const customData1 = (char1 as any).customData as Record<string, any> | undefined;
        const customData2 = (char2 as any).customData as Record<string, any> | undefined;

        const isFamilyRelated = (
          char1.fatherId === char2.fatherId ||
          char1.motherId === char2.motherId ||
          char1.spouseId === char2.id ||
          char2.spouseId === char1.id
        );

        const areCoworkers = (
          customData1?.currentOccupation?.company === customData2?.currentOccupation?.company &&
          customData1?.currentOccupation?.company !== undefined
        );

        if (!isFamilyRelated && !areCoworkers) continue;

        // Compute relationship in-memory (pure functions, no DB)
        const compatibility = calculateCompatibility(char1, char2);
        const chargeIncrement = calculateChargeIncrement(char1, char2, compatibility);
        const sparkIncrement = calculateSparkIncrement(char1, char2, config.currentYear);
        const interactionQuality = 5;

        const chargeChange = chargeIncrement * interactionQuality;
        const initialCharge = chargeIncrement + chargeChange;
        const sparkChange = sparkIncrement * interactionQuality;
        const initialSpark = (sparkIncrement * (1 - 0.05)) + sparkChange;

        const char1Age = config.currentYear - (char1.birthYear || 0);
        const char2Age = config.currentYear - (char2.birthYear || 0);

        const relationship: RelationshipDetails = {
          compatibility,
          charge: initialCharge,
          chargeIncrement,
          spark: initialSpark,
          sparkIncrement: sparkIncrement * (1 - 0.05),
          trust: calculateTrust(initialCharge),
          ageDifferenceEffect: calculateAgeDifferenceEffect(char1Age, char2Age),
          jobLevelDifferenceEffect: calculateJobLevelDifferenceEffect(char1, char2),
          firstMetDate: new Date(),
          lastInteractionDate: new Date(),
          totalInteractions: 1,
          conversationCount: 0,
          areFriends: initialCharge >= 10,
          areEnemies: initialCharge <= -10,
          areRomantic: initialSpark >= 15,
        };

        // Store for char1 -> char2
        const data1 = getOrCreateSocialData(char1.id);
        data1[char2.id] = relationship;

        relationshipsCreated++;
      }
    }

    // Bulk write all accumulated social attribute updates
    const updates = Array.from(socialUpdates.entries()).map(([charId, relationshipDetails]) => {
      const char = charMap.get(charId)!;
      const socialAttributes = { ...((char.socialAttributes as any) || {}), relationshipDetails };
      return { id: charId, data: { socialAttributes: socialAttributes as Record<string, any> } };
    });

    if (updates.length > 0) {
      await storage.bulkUpdateCharacters(updates);
    }

    console.log(`   ✓ Created ${relationshipsCreated} initial relationships`);
  }
  
  /**
   * Phase 6: Implant Knowledge (based on TotT's implant_knowledge method)
   * Gives characters initial knowledge of family members and coworkers
   *
   * Optimized: builds all mental models in-memory, then bulk-writes once.
   */
  private async implantKnowledge(config: {
    worldId: string;
    currentTimestep: number;
  }): Promise<void> {
    const characters = await storage.getCharactersByWorld(config.worldId);

    // Build character lookup map
    const charMap = new Map<string, typeof characters[0]>();
    for (const c of characters) charMap.set(c.id, c);

    // Accumulate all mental model mutations in-memory: charId -> CharacterKnowledge
    const knowledgeUpdates = new Map<string, { mentalModels: Record<string, any> }>();

    const getOrCreateKnowledge = (charId: string) => {
      let knowledge = knowledgeUpdates.get(charId);
      if (!knowledge) {
        const char = charMap.get(charId)!;
        const existing = (char.mentalModels as any) || { mentalModels: {} };
        knowledge = { mentalModels: { ...(existing.mentalModels || {}) } };
        knowledgeUpdates.set(charId, knowledge);
      }
      return knowledge;
    };

    // Confidence values from knowledge-system CONFIG
    const FAMILY_CONFIDENCE = 0.6;
    const COWORKER_CONFIDENCE = 0.3;

    const createMentalModel = (subjectId: string, confidence: number, facts: string[], timestep: number) => {
      const knownFacts: Record<string, boolean> = {};
      for (const fact of facts) knownFacts[fact] = true;
      return {
        subjectId,
        confidence,
        lastUpdated: timestep,
        knownFacts,
        knownValues: {},
        beliefs: {}
      };
    };

    const addBeliefToModel = (model: any, quality: string, confidence: number, evidence: any) => {
      model.beliefs[quality] = {
        quality,
        confidence,
        evidence: [evidence],
        lastUpdated: evidence.timestamp,
      };
    };

    let mentalModelsCreated = 0;

    // Build index: company -> character ids (for coworker knowledge)
    const companyEmployees = new Map<string, string[]>();
    for (const char of characters) {
      const customData = (char as any).customData as Record<string, any> | undefined;
      const company = customData?.currentOccupation?.company;
      if (company) {
        const list = companyEmployees.get(company) || [];
        list.push(char.id);
        companyEmployees.set(company, list);
      }
    }

    for (const observer of characters) {
      if ((observer as any).age <= 3) continue;

      const knowledge = getOrCreateKnowledge(observer.id);

      // Family knowledge
      const familyIds = [
        ...(observer.parentIds || []),
        ...(observer.childIds || []),
        ...(observer.immediateFamilyIds || [])
      ];

      for (const familyMemberId of familyIds) {
        if (!charMap.has(familyMemberId)) continue;
        if (!knowledge.mentalModels[familyMemberId]) {
          const model = createMentalModel(familyMemberId, FAMILY_CONFIDENCE, ['name', 'age', 'family', 'personality'], config.currentTimestep);
          addBeliefToModel(model, 'trustworthy', 0.8, {
            type: 'direct_experience',
            strength: 0.9,
            timestamp: config.currentTimestep,
            description: 'Family member'
          });
          knowledge.mentalModels[familyMemberId] = model;
          mentalModelsCreated++;
        }
      }

      // Coworker knowledge
      const customData = (observer as any).customData as Record<string, any> | undefined;
      const company = customData?.currentOccupation?.company;
      if (company) {
        const coworkerIds = companyEmployees.get(company) || [];
        for (const coworkerId of coworkerIds) {
          if (coworkerId === observer.id) continue;
          if (!knowledge.mentalModels[coworkerId]) {
            const model = createMentalModel(coworkerId, COWORKER_CONFIDENCE, ['name', 'occupation'], config.currentTimestep);
            addBeliefToModel(model, 'professional', 0.5, {
              type: 'observation',
              strength: 0.5,
              timestamp: config.currentTimestep,
              description: 'Works together'
            });
            knowledge.mentalModels[coworkerId] = model;
            mentalModelsCreated++;
          }
        }
      }
    }

    // Bulk write all accumulated mental model updates
    const updates = Array.from(knowledgeUpdates.entries()).map(([charId, knowledge]) => ({
      id: charId,
      data: { mentalModels: knowledge as any }
    }));

    if (updates.length > 0) {
      await storage.bulkUpdateCharacters(updates);
    }

    console.log(`   ✓ Implanted ${mentalModelsCreated} mental models`);
  }
  
  /**
   * Phase 9: Initialize Wealth (give characters starting money based on occupation)
   */
  private async initializeWealth(config: {
    worldId: string;
    currentYear: number;
  }): Promise<void> {
    const characters = await storage.getCharactersByWorld(config.worldId);
    let wealthInitialized = 0;
    
    for (const character of characters) {
      const age = this.getAge(character, config.currentYear);
      if (age < 18) continue; // Only adults get money
      
      // Determine starting wealth based on occupation/age
      const customData = (character as any).customData as Record<string, any> | undefined;
      let startingMoney = 100; // Base amount
      
      if (customData?.currentOccupation) {
        // Employed: more money
        startingMoney = 300 + Math.random() * 200;
      } else {
        // Unemployed: less money
        startingMoney = 50 + Math.random() * 100;
      }
      
      // Older characters have accumulated more wealth
      if (age > 40) {
        startingMoney *= 1.5;
      }
      if (age > 60) {
        startingMoney *= 2;
      }
      
      try {
        await addMoney(
          character.id,
          Math.round(startingMoney),
          'Initial wealth at world generation',
          0
        );
        wealthInitialized++;
      } catch (error) {
        // Silent fail
      }
    }
    
    console.log(`   ✓ Initialized wealth for ${wealthInitialized} characters`);
  }

  /**
   * Generate character portraits for all characters in a world
   */
  private async generateCharacterPortraitsForWorld(config: {
    worldId: string;
    provider: 'flux' | 'gemini-imagen' | 'dalle' | 'stable-diffusion';
  }): Promise<number> {
    try {
      const assetIds = await visualAssetGenerator.batchGenerateCharacterPortraits(
        config.worldId,
        config.provider
      );
      console.log(`   ✓ Generated ${assetIds.length} character portraits`);
      return assetIds.length;
    } catch (error) {
      console.error('   ✗ Failed to generate character portraits:', error);
      return 0;
    }
  }

  /**
   * Generate building exteriors for all businesses in a world
   */
  private async generateBuildingExteriorsForWorld(config: {
    worldId: string;
    provider: 'flux' | 'gemini-imagen' | 'dalle' | 'stable-diffusion';
  }): Promise<number> {
    try {
      const assetIds = await visualAssetGenerator.batchGenerateBuildingExteriors(
        config.worldId,
        config.provider
      );
      console.log(`   ✓ Generated ${assetIds.length} building exteriors`);
      return assetIds.length;
    } catch (error) {
      console.error('   ✗ Failed to generate building exteriors:', error);
      return 0;
    }
  }

  /**
   * Generate all map types for a settlement
   */
  private async generateSettlementMapsForSettlement(config: {
    settlementId: string;
    provider: 'flux' | 'gemini-imagen' | 'dalle' | 'stable-diffusion';
  }): Promise<number> {
    try {
      const assetIds = await visualAssetGenerator.batchGenerateSettlementMaps(
        config.settlementId,
        config.provider
      );
      console.log(`   ✓ Generated ${assetIds.length} settlement maps`);
      return assetIds.length;
    } catch (error) {
      console.error('   ✗ Failed to generate settlement maps:', error);
      return 0;
    }
  }

  /**
   * Get preset configurations
   */
  static getPresets(): Record<string, Partial<WorldGenerationConfig>> {
    return {
      medievalVillage: {
        worldName: 'Medieval Realm',
        settlementName: 'Thornbrook',
        settlementType: 'village',
        terrain: 'plains',
        foundedYear: 1200,
        currentYear: 1300,
        numFoundingFamilies: 5,
        generations: 4,
        marriageRate: 0.8,
        fertilityRate: 0.7,
        deathRate: 0.4,
        governmentType: 'feudal',
        economicSystem: 'agricultural',
        generateBusinesses: true,
        assignEmployment: true,
        generateRoutines: true,
        simulateHistory: true,
        historyFidelity: 'low',
        // Phase 5-10: TotT Social Simulation
        initializeSocialDynamics: true,
        initializeKnowledge: true,
        initializeWealth: true,
        initializeCommunityMorale: true,
        scheduleFestival: true,
        // GenAI Visual Asset Generation
        generateVisualAssets: true,
        generateCharacterPortraits: true,
        generateBuildingExteriors: true,
        generateSettlementMaps: true,
        visualGenerationProvider: 'flux'
      },
      colonialTown: {
        worldName: 'New World',
        settlementName: 'Port Haven',
        settlementType: 'town',
        terrain: 'coast',
        foundedYear: 1650,
        currentYear: 1750,
        numFoundingFamilies: 10,
        generations: 4,
        marriageRate: 0.75,
        fertilityRate: 0.65,
        deathRate: 0.35,
        governmentType: 'republic',
        economicSystem: 'mercantile',
        generateBusinesses: true,
        assignEmployment: true,
        generateRoutines: true,
        simulateHistory: true,
        historyFidelity: 'low',
        // GenAI Visual Asset Generation
        generateVisualAssets: true,
        generateCharacterPortraits: true,
        generateBuildingExteriors: true,
        generateSettlementMaps: true,
        visualGenerationProvider: 'flux'
      },
      modernCity: {
        worldName: 'Contemporary World',
        settlementName: 'Riverside',
        settlementType: 'city',
        terrain: 'river',
        foundedYear: 1850,
        currentYear: 2000,
        numFoundingFamilies: 20,
        generations: 6,
        marriageRate: 0.65,
        fertilityRate: 0.5,
        deathRate: 0.2,
        governmentType: 'democracy',
        economicSystem: 'mixed',
        generateBusinesses: true,
        assignEmployment: true,
        generateRoutines: true,
        simulateHistory: true,
        historyFidelity: 'medium',
        // GenAI Visual Asset Generation
        generateVisualAssets: true,
        generateCharacterPortraits: true,
        generateBuildingExteriors: true,
        generateSettlementMaps: true,
        visualGenerationProvider: 'flux'
      },
      fantasyRealm: {
        worldName: 'Mystical Lands',
        settlementName: 'Dragonspire',
        settlementType: 'city',
        terrain: 'mountains',
        foundedYear: 500,
        currentYear: 1000,
        numFoundingFamilies: 12,
        generations: 20,
        marriageRate: 0.7,
        fertilityRate: 0.6,
        deathRate: 0.35,
        governmentType: 'empire',
        economicSystem: 'feudal',
        generateBusinesses: true,
        assignEmployment: true,
        generateRoutines: true,
        simulateHistory: true,
        historyFidelity: 'low',
        // GenAI Visual Asset Generation
        generateVisualAssets: true,
        generateCharacterPortraits: true,
        generateBuildingExteriors: true,
        generateSettlementMaps: true,
        visualGenerationProvider: 'flux'
      }
    };
  }
}
