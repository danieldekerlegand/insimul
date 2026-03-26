/**
 * Unified World Generator
 * Combines genealogy and geography generation for complete world creation
 */

import { storage } from '../db/storage';
import { GenealogyGenerator } from './genealogy-generator';
import { GeographyGenerator } from './geography-generator';
import type { InsertWorld, Business, Character, BusinessType, OccupationVocation } from '../../shared/schema';
import { foundBusiness, closeBusiness } from '../extensions/tott/business-system.js';
import { fillVacancy } from '../extensions/tott/hiring-system.js';
import { generateDefaultRoutine, setRoutine, updateAllWhereabouts } from '../extensions/tott/routine-system.js';
import { triggerAutomaticEvents } from '../extensions/tott/event-system.js';
// Phase 5-10: TotT Social Simulation Integration
import { updateRelationship } from '../extensions/tott/social-dynamics-system.js';
import { initializeFamilyKnowledge, initializeCoworkerKnowledge } from '../extensions/tott/knowledge-system.js';
import { addMoney } from '../extensions/tott/economics-system.js';
import { adjustCommunityMorale, scheduleFestival } from '../extensions/tott/town-events-system.js';
// GenAI Visual Asset Generation Integration
import { visualAssetGenerator } from '../services/visual-asset-generator.js';
// Item placement
import { placeItemsInWorld } from './item-placement-generator.js';
// Main quest NPC spawning
import { spawnMainQuestNPCs } from '../services/main-quest-npc-spawner.js';
import { assignDefaultOccupations } from './occupation-assignment.js';
// Population scaling
import { countBuildings, calculatePopulationTarget } from './population-scaling.js';

export interface WorldGenerationConfig {
  worldName: string;
  worldDescription?: string;
  worldType?: string;
  settlementName: string;
  settlementDescription?: string;
  settlementType: 'village' | 'town' | 'city';
  terrain: 'plains' | 'hills' | 'mountains' | 'coast' | 'river' | 'forest' | 'desert';
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
    visualAssets: {
      portraits: number;
      buildings: number;
      maps: number;
    };
  }> {
    console.log(`🌍 Generating world: ${config.worldName}...`);
    console.log(`   Settlement: ${config.settlementName} (${config.settlementType})`);
    console.log(`   Terrain: ${config.terrain}, Period: ${config.foundedYear} - ${config.currentYear}`);
    
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
    
    let population = 0;
    let families = 0;
    let generationsCreated = 0;
    let districts = 0;
    let buildings = 0;
    
    // Generate genealogy for the settlement
    if (config.generateGenealogy) {
      console.log('\n📖 Generating genealogy...');
      const genealogyResult = await this.genealogyGen.generate({
        worldId: world.id,
        settlementId: settlement.id,
        startYear: config.foundedYear,
        currentYear: config.currentYear,
        numFoundingFamilies: config.numFoundingFamilies,
        generationsToGenerate: config.generations,
        marriageRate: config.marriageRate,
        fertilityRate: config.fertilityRate,
        deathRate: config.deathRate
      });
      
      population = genealogyResult.totalCharacters;
      families = genealogyResult.families.length;
      generationsCreated = genealogyResult.generations;
      
      // Store family trees in settlement
      const familyTrees = genealogyResult.families.map(f => ({
        surname: f.surname,
        founderId: f.founders.father.id,
        generations: Object.fromEntries(f.generations)
      }));
      
      await storage.updateSettlement(settlement.id, {
        familyTrees,
        currentGeneration: generationsCreated
      });
    }
    
    // Generate geography for the settlement
    if (config.generateGeography) {
      console.log('\n🗺️  Generating geography...');
      // Fetch target language for localized street names
      const worldForLang = await storage.getWorld(world.id);
      const worldLanguages = await storage.getWorldLanguagesByWorld(world.id);
      const learningTarget = worldLanguages?.find((l: any) => l.isLearningTarget);
      const targetLanguage = learningTarget?.name || worldForLang?.targetLanguage || undefined;

      const geographyResult = await this.geographyGen.generate({
        worldId: world.id,
        settlementId: settlement.id,
        settlementName: settlement.name,
        settlementType: config.settlementType,
        population: population || this.estimatePopulation(config.settlementType),
        foundedYear: config.foundedYear,
        terrain: config.terrain,
        countryId: country.id,
        targetLanguage,
        worldType: config.worldType || world.worldType || undefined,
      });
      
      districts = geographyResult.districts.length;
      buildings = geographyResult.buildings.length;

      // Population scaling: ensure population is proportional to building count
      if (config.generateGenealogy) {
        const buildingCounts = countBuildings(geographyResult.buildings);
        const { target, deficit } = calculatePopulationTarget(buildingCounts, population);

        if (deficit > 0) {
          console.log(`\n👥 Population scaling: ${population} people for ${buildingCounts.residences} residences + ${buildingCounts.businesses} businesses (target: ${target})`);
          console.log(`   Generating ${deficit} immigrants to fill gap...`);
          const immigrantsCreated = await this.genealogyGen.generateImmigrants({
            worldId: world.id,
            settlementId: settlement.id,
            currentYear: config.currentYear,
            count: deficit,
          });
          population += immigrantsCreated;
          console.log(`   ✅ Population scaled: ${population} people`);
        }

        const ratio = buildingCounts.residences > 0
          ? (population / buildingCounts.residences).toFixed(1)
          : 'N/A';
        const bRatio = buildingCounts.businesses > 0
          ? (population / buildingCounts.businesses).toFixed(1)
          : 'N/A';
        console.log(`📊 Settlement generated: ${population} people, ${buildingCounts.residences} residences, ${buildingCounts.businesses} businesses (ratio: ${ratio} people/residence, ${bRatio} people/business)`);
      }
    }

    // Update settlement population
    await storage.updateSettlement(settlement.id, {
      population
    });
    
    let businessCount = 0;
    let employedCount = 0;
    let routineCount = 0;
    let eventCount = 0;
    let itemsPlaced = 0;
    
    // TotT Integration: Business Generation
    if (config.generateBusinesses && population > 0) {
      console.log('\n🏢 Founding initial businesses...');
      const businesses = await this.generateInitialBusinesses({
        worldId: world.id,
        settlementId: settlement.id,
        population: population,
        currentYear: config.currentYear,
        terrain: config.terrain
      });
      businessCount = businesses.length;
      
      // TotT Integration: Employment Assignment
      if (config.assignEmployment && businesses.length > 0) {
        console.log('\n👔 Assigning employment...');
        employedCount = await this.assignInitialEmployment({
          worldId: world.id,
          businesses: businesses,
          currentYear: config.currentYear
        });
      }
    }

    // Assign default occupations to all remaining characters (students, retired, laborers, etc.)
    if (population > 0) {
      console.log('\n🏷️ Assigning default occupations...');
      await assignDefaultOccupations({
        worldId: world.id,
        currentYear: config.currentYear,
        terrain: config.terrain
      });
    }

    // TotT Integration: Housing Assignment — runs for all worlds with population
    if (config.assignHousing !== false && population > 0) {
      console.log('\n🏠 Assigning housing...');
      await this.assignHousing({
        worldId: world.id,
        settlementId: settlement.id,
        currentYear: config.currentYear
      });
    }

    // Item Placement: populate businesses, residences, and exterior locations with contextual items
    if (businessCount > 0 || (config.generateGeography && population > 0)) {
      console.log('\n📦 Placing items in world locations...');
      const itemResult = await placeItemsInWorld(world.id, config.worldType || world.worldType || undefined);
      itemsPlaced = itemResult.totalPlaced;
      console.log(`   Placed ${itemResult.totalPlaced} items (${itemResult.businessItems} in businesses, ${itemResult.residenceItems} in residences, ${itemResult.exteriorItems} in exterior locations)`);
    }

    // Main Quest NPC Spawning: create the writer's associates for language-learning worlds
    if (population > 0) {
      console.log('\n📝 Spawning main quest NPCs...');
      const worldForLang = await storage.getWorld(world.id);
      const targetLang = worldForLang?.targetLanguage || undefined;
      const mqResult = await spawnMainQuestNPCs(world.id, targetLang);
      if (mqResult.created > 0) {
        console.log(`   Created ${mqResult.created} main quest NPCs`);
        for (const npc of mqResult.npcs) {
          console.log(`   - ${npc.role}: ${npc.name} (${npc.characterId})`);
        }
      }
    }

    // TotT Integration: Routine Generation
    if (config.generateRoutines && population > 0) {
      console.log('\n⏰ Generating daily routines...');
      routineCount = await this.generateInitialRoutines({
        worldId: world.id,
        currentYear: config.currentYear
      });
      
      // Set initial whereabouts (everyone at home at noon)
      console.log('\n📍 Setting initial whereabouts...');
      await updateAllWhereabouts(world.id, 0, 'day', 12);
    }
    
    // Phase 5-10: TotT Social Simulation Integration (following game.py patterns)
    
    // Phase 5: Initialize Social Dynamics (relationships for families & coworkers)
    if (config.initializeSocialDynamics && population > 0) {
      console.log('\n💫 Initializing social dynamics (Phase 5)...');
      await this.initializeSocialDynamics({
        worldId: world.id,
        currentYear: config.currentYear
      });
    }
    
    // Phase 6: Initialize Knowledge & Mental Models (like TotT's implant_knowledge)
    if (config.initializeKnowledge && population > 0) {
      console.log('\n🧠 Implanting knowledge (Phase 6)...');
      await this.implantKnowledge({
        worldId: world.id,
        currentTimestep: 0
      });
    }
    
    // Phase 9: Initialize Wealth (starting money)
    if (config.initializeWealth && population > 0) {
      console.log('\n💰 Initializing wealth (Phase 9)...');
      await this.initializeWealth({
        worldId: world.id,
        currentYear: config.currentYear
      });
    }
    
    // Phase 10: Initialize Community Morale & Schedule Festival
    if (config.initializeCommunityMorale && population > 0) {
      console.log('\n🎪 Initializing community (Phase 10)...');
      await adjustCommunityMorale(world.id, 50); // Start at base morale
      
      if (config.scheduleFestival) {
        // Schedule a founding festival
        await scheduleFestival(
          world.id,
          'founders_day',
          'town_square',
          7 // Week from now
        );
      }
    }
    
    // TotT Integration: Historical Simulation
    if (config.simulateHistory && population > 0) {
      const fidelity = config.historyFidelity || 'low';
      console.log(`\n⏳ Simulating historical events (${fidelity} fidelity)...`);
      eventCount = await this.simulateHistory({
        worldId: world.id,
        startYear: config.foundedYear,
        endYear: config.currentYear,
        fidelity: fidelity
      });
    }

    // GenAI Visual Asset Generation
    let portraitCount = 0;
    let buildingAssetCount = 0;
    let mapCount = 0;

    if (config.generateVisualAssets) {
      const provider = config.visualGenerationProvider || 'flux';

      // Generate character portraits
      if (config.generateCharacterPortraits && population > 0) {
        console.log('\n🎨 Generating character portraits...');
        portraitCount = await this.generateCharacterPortraitsForWorld({
          worldId: world.id,
          provider
        });
      }

      // Generate building exteriors
      if (config.generateBuildingExteriors && businessCount > 0) {
        console.log('\n🏢 Generating building exteriors...');
        buildingAssetCount = await this.generateBuildingExteriorsForWorld({
          worldId: world.id,
          provider
        });
      }

      // Generate settlement maps
      if (config.generateSettlementMaps) {
        console.log('\n🗺️  Generating settlement maps...');
        mapCount = await this.generateSettlementMapsForSettlement({
          settlementId: settlement.id,
          provider
        });
      }
    }

    console.log('\n✅ World generation complete!');
    console.log(`   Population: ${population}`);
    console.log(`   Families: ${families}`);
    console.log(`   Generations: ${generationsCreated}`);
    console.log(`   Districts: ${districts}`);
    console.log(`   Buildings: ${buildings}`);
    console.log(`   Businesses: ${businessCount}`);
    console.log(`   Employed: ${employedCount}`);
    console.log(`   Routines: ${routineCount}`);
    console.log(`   Items Placed: ${itemsPlaced}`);
    console.log(`   Historical Events: ${eventCount}`);
    if (config.generateVisualAssets) {
      console.log(`   Visual Assets Generated:`);
      console.log(`     - Character Portraits: ${portraitCount}`);
      console.log(`     - Building Exteriors: ${buildingAssetCount}`);
      console.log(`     - Settlement Maps: ${mapCount}`);
    }

    return {
      worldId: world.id,
      countryId: country.id,
      settlementId: settlement.id,
      population,
      families,
      generations: generationsCreated,
      districts,
      buildings,
      businesses: businessCount,
      employed: employedCount,
      routines: routineCount,
      events: eventCount,
      itemsPlaced,
      visualAssets: {
        portraits: portraitCount,
        buildings: buildingAssetCount,
        maps: mapCount
      }
    };
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
  }): Promise<any> {
    const world = await storage.getWorld(worldId);
    if (!world) throw new Error('World not found');
    
    return await this.genealogyGen.generate({
      worldId,
      settlementId: config.settlementId,
      startYear: config.startYear || 1900,
      currentYear: world.currentYear || 2000,
      numFoundingFamilies: config.numFoundingFamilies,
      generationsToGenerate: config.generations,
      marriageRate: config.marriageRate || 0.7,
      fertilityRate: config.fertilityRate || 0.6,
      deathRate: config.deathRate || 0.3
    });
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
      terrain: settlement.terrain as any,
      countryId: settlement.countryId ?? undefined,
      stateId: settlement.stateId ?? undefined,
      targetLanguage,
      worldType: world?.worldType || undefined,
    });
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
    terrain: string;
  }): Promise<Business[]> {
    const resultBusinesses: Business[] = [];

    // Determine what businesses are needed
    const businessPlan = this.determineBusinessMix(
      config.population,
      config.terrain,
      config.currentYear
    );

    console.log(`   Planning ${businessPlan.length} businesses...`);

    // Get available characters to be founders
    const characters = await storage.getCharactersByWorld(config.worldId);
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
          console.log(`   ✓ Founded ${name} at ${lotBusiness.address}`);
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

    // Phase 2: Create new businesses for types that couldn't be placed on lots
    for (const businessType of remainingPlan) {
      const founder = availableFounders.pop();
      if (founder) {
        try {
          const business = await foundBusiness({
            worldId: config.worldId,
            founderId: founder.id,
            name: this.generateBusinessName(businessType, founder),
            businessType: businessType,
            address: `${businessType} Street`,
            currentYear: config.currentYear,
            currentTimestep: 0,
            initialVacancies: this.getVacanciesForBusinessType(businessType)
          });

          resultBusinesses.push(business);
          await storage.updateCharacter(founder.id, { occupation: `Owner (${businessType})` });
          console.log(`   ✓ Founded ${business.name} (no lot)`);
        } catch (error) {
          console.error(`   ✗ Failed to found ${businessType}:`, error);
        }
      }
    }

    // Phase 3: Ensure remaining unowned lot businesses get owners assigned
    // This handles cases where there are more geography-generated businesses than business plan entries
    if (unownedQueue.length > 0) {
      // Build pool of all adult characters (allow multi-ownership if needed)
      const allAdults = adultCharacters.sort(() => Math.random() - 0.5);
      let adultIndex = 0;

      for (const business of unownedQueue) {
        if (allAdults.length === 0) {
          // No adults at all — close the business
          await storage.updateBusiness(business.id, { isOutOfBusiness: true, closedYear: config.currentYear });
          console.log(`   ✗ Closed ${business.name} (no available owners)`);
          continue;
        }

        const owner = allAdults[adultIndex % allAdults.length];
        adultIndex++;

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
          resultBusinesses.push({ ...business, ownerId: owner.id, founderId: owner.id, name } as Business);
          console.log(`   ✓ Assigned owner to ${name} at ${business.address}`);
        } catch (error) {
          console.error(`   ✗ Failed to assign owner to business at ${business.address}:`, error);
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
    terrain: string,
    year: number
  ): BusinessType[] {
    const businesses: BusinessType[] = [];

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
    const vacancies: Partial<Record<BusinessType, { day: OccupationVocation[]; night: OccupationVocation[] }>> = {
      'Farm': { day: ['Farmer', 'Farmhand'], night: [] },
      'GroceryStore': { day: ['Grocer', 'Cashier'], night: [] },
      'Shop': { day: ['Cashier', 'Cashier'], night: [] },
      'Restaurant': { day: ['Cook', 'Waiter'], night: ['Bartender'] },
      'Clinic': { day: ['Doctor', 'Nurse'], night: ['Nurse'] },
      'Hospital': { day: ['Doctor', 'Nurse'], night: ['Nurse'] },
      'Carpenter': { day: ['Carpenter', 'Carpenter'], night: [] },
      'Factory': { day: ['Laborer', 'Laborer'], night: [] },
      'LawFirm': { day: ['Lawyer', 'Secretary'], night: [] },
      'School': { day: ['Teacher', 'Teacher'], night: [] },
      'Bank': { day: ['BankTeller', 'BankTeller'], night: [] },
      'Bar': { day: ['Bartender'], night: ['Bartender'] },
      'TownHall': { day: ['Manager'], night: [] },
      'Blacksmith': { day: ['Blacksmith', 'Blacksmith'], night: [] },
      'Harbor': { day: ['Laborer'], night: [] },
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
    const characters = await storage.getCharactersByWorld(config.worldId);
    let residences = await storage.getResidencesBySettlement(config.settlementId);

    const livingCharacters = characters.filter(c => c.isAlive);

    if (livingCharacters.length === 0) {
      return;
    }

    // Generate overflow residences if there aren't enough for all characters
    if (residences.length === 0 || this.totalCapacity(residences) < livingCharacters.length) {
      const needed = livingCharacters.length - this.totalCapacity(residences);
      const housesNeeded = Math.ceil(needed / 4); // cottages hold 4
      console.log(`   Generating ${housesNeeded} additional cottage(s) to house ${needed} overflow character(s)`);

      const lots = await storage.getLotsBySettlement(config.settlementId);
      // Find an existing residential lot or use the first available lot
      const residentialLot = lots.find((l: any) => l.zoning === 'residential') || lots[0];
      const baseLotId = residentialLot?.id || config.settlementId;
      const baseAddress = residentialLot?.address || 'Main Street';

      const newResidences: any[] = [];
      for (let i = 0; i < housesNeeded; i++) {
        // Create a lot for each overflow residence
        const lot = await storage.createLot({
          worldId: config.worldId,
          settlementId: config.settlementId,
          address: `${baseAddress} #${residences.length + i + 1}`,
          zoning: 'residential',
        });
        newResidences.push({
          worldId: config.worldId,
          settlementId: config.settlementId,
          lotId: lot.id,
          address: lot.address,
          residenceType: 'cottage',
          ownerIds: [],
          residentIds: [],
        });
      }
      if (newResidences.length > 0) {
        const created = await (storage as any).createResidencesInBulk(newResidences);
        residences = [...residences, ...created];
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
    const empty = residenceCapacity.filter(r => r.residentIds.length === 0).length;
    const owned = residenceCapacity.filter(r => r.ownerIds.length > 0).length;
    console.log(`   ✓ Assigned ${assignedCount} characters to ${occupied} residences (${owned} with owners, ${empty} empty)`);
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
  private async simulateHistory(config: {
    worldId: string;
    startYear: number;
    endYear: number;
    fidelity: 'low' | 'medium' | 'high';
  }): Promise<number> {
    const yearsToSimulate = config.endYear - config.startYear;
    const timestepsPerYear = config.fidelity === 'low' ? 4 : // quarterly
                             config.fidelity === 'medium' ? 12 : // monthly
                             730; // daily
    
    let currentYear = config.startYear;
    let timestep = 0;
    let totalEvents = 0;
    
    for (let year = 0; year < yearsToSimulate; year++) {
      currentYear = config.startYear + year;
      
      // Trigger automatic lifecycle events (deaths, retirements, graduations)
      try {
        const events = await triggerAutomaticEvents(
          config.worldId,
          currentYear,
          timestep
        );
        
        totalEvents += events.length;
        
        if (events.length > 0) {
          console.log(`   Year ${currentYear}: ${events.length} events`);
        }
      } catch (error) {
        console.error(`   ✗ Failed to trigger events for ${currentYear}:`, error);
      }
      
      // Potentially found new businesses (5% chance per year)
      if (Math.random() < 0.05) {
        await this.attemptBusinessFounding(config.worldId, currentYear, timestep);
      }
      
      // Potentially close businesses (2% chance per year)
      if (Math.random() < 0.02) {
        await this.attemptBusinessClosure(config.worldId, currentYear, timestep);
      }
      
      timestep += timestepsPerYear;
    }
    
    console.log(`   ✓ Simulated ${yearsToSimulate} years, ${totalEvents} total events`);
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
      case 'village': return 500;
      case 'town': return 5000;
      case 'city': return 50000;
      default: return 5000;
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
    let relationshipsCreated = 0;
    
    for (const char1 of characters) {
      // Skip if too young (following TotT: age > 3 for social interactions)
      const age1 = this.getAge(char1, config.currentYear);
      if (age1 <= 3) continue;
      
      for (const char2 of characters) {
        if (char1.id >= char2.id) continue; // Avoid duplicates
        
        const age2 = this.getAge(char2, config.currentYear);
        if (age2 <= 3) continue;
        
        // Initialize relationship if they're family or coworkers
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
        
        if (isFamilyRelated || areCoworkers) {
          try {
            const relationshipType = isFamilyRelated ? 'family' : 'coworker';
            // Use initializeRelationshipWithCompatibility since initializeRelationship doesn't exist
            await updateRelationship(char1.id, char2.id, 5, 1900); // Bootstrap with positive charge
            relationshipsCreated++;
          } catch (error) {
            // Silent fail - relationship may already exist
          }
        }
      }
    }
    
    console.log(`   ✓ Created ${relationshipsCreated} initial relationships`);
  }
  
  /**
   * Phase 6: Implant Knowledge (based on TotT's implant_knowledge method)
   * Gives characters initial knowledge of family members and coworkers
   */
  private async implantKnowledge(config: {
    worldId: string;
    currentTimestep: number;
  }): Promise<void> {
    const characters = await storage.getCharactersByWorld(config.worldId);
    let mentalModelsCreated = 0;
    
    for (const observer of characters) {
      // Following TotT pattern: only for age > 3
      if ((observer as any).age <= 3) continue;
      
      // Initialize knowledge of family members
      try {
        await initializeFamilyKnowledge(observer.id, config.currentTimestep);
        mentalModelsCreated += 5; // Estimate: parents, siblings, spouse, children
      } catch (error) {
        // Silent fail
      }
      
      // Initialize knowledge of coworkers
      const customData = (observer as any).customData as Record<string, any> | undefined;
      if (customData?.currentOccupation) {
        try {
          await initializeCoworkerKnowledge(observer.id, config.currentTimestep);
          mentalModelsCreated += 3; // Estimate: a few coworkers
        } catch (error) {
          // Silent fail
        }
      }
    }
    
    console.log(`   ✓ Implanted ~${mentalModelsCreated} mental models`);
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
