import { PrologManager } from './prolog-manager';
import { type IStorage } from '../../db/storage';
import type { Character } from '@shared/schema';

/**
 * PrologSyncService
 * 
 * Synchronizes Insimul database data (MongoDB/PostgreSQL) to Prolog knowledge base
 * Ensures 1:1 correspondence between Insimul data and Prolog facts
 */
export class PrologSyncService {
  private storage: IStorage;
  private prologManager: PrologManager;

  constructor(storage: IStorage, prologManager: PrologManager) {
    this.storage = storage;
    this.prologManager = prologManager;
  }

  /**
   * Sync entire world to Prolog knowledge base
   */
  async syncWorldToProlog(worldId: string): Promise<void> {
    console.log(`🔄 Syncing world ${worldId} to Prolog...`);
    
    try {
      // Sync all components
      await this.syncWorldMetadata(worldId);
      await this.syncCharactersToProlog(worldId);
      await this.syncRelationshipsToProlog(worldId);
      await this.syncLocationsToProlog(worldId);
      await this.syncBusinessesToProlog(worldId);
      await this.syncKnowledgeToProlog(worldId);  // Phase 6: Knowledge & Beliefs
      await this.syncOwnershipToProlog(worldId);  // Item ownership
      await this.syncCountriesToProlog(worldId);
      await this.syncStatesToProlog(worldId);
      await this.syncLotsToProlog(worldId);
      await this.syncResidencesToProlog(worldId);
      await this.syncItemsToProlog(worldId);
      await this.syncTruthsToProlog(worldId);
      await this.syncAchievementsToProlog(worldId);
      await this.syncLanguagesToProlog(worldId);
      await this.addHelperRules();
      
      console.log(`✅ World ${worldId} synced to Prolog`);
    } catch (error) {
      console.error(`❌ Failed to sync world ${worldId} to Prolog:`, error);
      throw error;
    }
  }

  /**
   * Sync world metadata as Prolog facts
   */
  private async syncWorldMetadata(worldId: string): Promise<void> {
    const world = await this.storage.getWorld(worldId);
    if (!world) {
      throw new Error(`World ${worldId} not found`);
    }

    const worldName = this.sanitizeAtom(world.name);
    await this.prologManager.addFact(`world(${worldName})`);
    
    if (world.description) {
      const desc = this.escapeString(world.description);
      await this.prologManager.addFact(`world_description(${worldName}, '${desc}')`);
    }
  }

  /**
   * Sync all characters to Prolog facts
   */
  async syncCharactersToProlog(worldId: string): Promise<void> {
    const characters = await this.storage.getCharactersByWorld(worldId);
    console.log(`  📝 Syncing ${characters.length} characters...`);

    for (const character of characters) {
      await this.syncCharacterToProlog(character);
    }
  }

  /**
   * Sync single character to Prolog facts
   */
  private async syncCharacterToProlog(character: Character): Promise<void> {
    const charId = this.sanitizeAtom(`${character.firstName}_${character.lastName}_${character.id}`);
    
    // Core person fact
    await this.prologManager.addFact(`person(${charId})`);
    
    // Names
    const firstName = this.escapeString(character.firstName);
    const lastName = this.escapeString(character.lastName);
    const fullName = this.escapeString(`${character.firstName} ${character.lastName}`);
    
    await this.prologManager.addFact(`first_name(${charId}, '${firstName}')`);
    await this.prologManager.addFact(`last_name(${charId}, '${lastName}')`);
    await this.prologManager.addFact(`full_name(${charId}, '${fullName}')`);
    
    // Demographics
    const gender = this.sanitizeAtom(character.gender);
    await this.prologManager.addFact(`gender(${charId}, ${gender})`);
    
    if (character.birthYear !== null) {
      await this.prologManager.addFact(`birth_year(${charId}, ${character.birthYear})`);
      
      // Calculate age if alive
      if (character.isAlive) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - character.birthYear;
        await this.prologManager.addFact(`age(${charId}, ${age})`);
        await this.prologManager.addFact(`alive(${charId})`);
      } else {
        await this.prologManager.addFact(`dead(${charId})`);
      }
    }
    
    // Occupation
    if (character.occupation) {
      const occupation = this.sanitizeAtom(character.occupation);
      await this.prologManager.addFact(`occupation(${charId}, ${occupation})`);
    }
    
    // Location
    if (character.currentLocation) {
      const locationId = this.sanitizeAtom(character.currentLocation);
      await this.prologManager.addFact(`at_location(${charId}, ${locationId})`);
    }
  }

  /**
   * Sync relationships to Prolog facts
   */
  async syncRelationshipsToProlog(worldId: string): Promise<void> {
    const characters = await this.storage.getCharactersByWorld(worldId);
    console.log(`  💕 Syncing relationships...`);

    for (const character of characters) {
      const charId = this.sanitizeAtom(`${character.firstName}_${character.lastName}_${character.id}`);
      
      // Spouse
      if (character.spouseId) {
        const spouse = characters.find(c => c.id === character.spouseId);
        if (spouse) {
          const spouseId = this.sanitizeAtom(`${spouse.firstName}_${spouse.lastName}_${spouse.id}`);
          await this.prologManager.addFact(`married_to(${charId}, ${spouseId})`);
          await this.prologManager.addFact(`spouse_of(${charId}, ${spouseId})`);
        }
      }
      
      // Parents
      if (character.parentIds && character.parentIds.length > 0) {
        for (const parentId of character.parentIds) {
          const parent = characters.find(c => c.id === parentId);
          if (parent) {
            const pId = this.sanitizeAtom(`${parent.firstName}_${parent.lastName}_${parent.id}`);
            await this.prologManager.addFact(`parent_of(${pId}, ${charId})`);
            await this.prologManager.addFact(`child_of(${charId}, ${pId})`);
          }
        }
      }
      
      // Friends
      if (character.friendIds && character.friendIds.length > 0) {
        for (const friendId of character.friendIds) {
          const friend = characters.find(c => c.id === friendId);
          if (friend) {
            const fId = this.sanitizeAtom(`${friend.firstName}_${friend.lastName}_${friend.id}`);
            await this.prologManager.addFact(`friend_of(${charId}, ${fId})`);
          }
        }
      }
    }
  }

  /**
   * Sync locations to Prolog facts
   */
  async syncLocationsToProlog(worldId: string): Promise<void> {
    console.log(`  🗺️  Syncing locations...`);
    
    try {
      const settlements = await this.storage.getSettlementsByWorld(worldId);
      for (const settlement of settlements) {
        const settlementId = this.sanitizeAtom(settlement.name);
        const settlementName = this.escapeString(settlement.name);
        
        await this.prologManager.addFact(`settlement(${settlementId})`);
        await this.prologManager.addFact(`settlement_name(${settlementId}, '${settlementName}')`);
        
        if (settlement.settlementType) {
          const settType = this.sanitizeAtom(settlement.settlementType);
          await this.prologManager.addFact(`settlement_type(${settlementId}, ${settType})`);
        }
        
        if (settlement.population !== null) {
          await this.prologManager.addFact(`population(${settlementId}, ${settlement.population})`);
        }
      }
    } catch (error) {
      console.warn('  ⚠️  Failed to sync locations:', error);
    }
  }

  /**
   * Sync businesses to Prolog facts
   */
  async syncBusinessesToProlog(worldId: string): Promise<void> {
    console.log(`  🏪 Syncing businesses...`);
    
    try {
      // Check if method exists (some storage implementations may not have it)
      if (typeof (this.storage as any).getBusinessesByWorld === 'function') {
        const businesses = await (this.storage as any).getBusinessesByWorld(worldId);
        
        for (const business of businesses) {
          const businessId = this.sanitizeAtom(business.name);
          const businessName = this.escapeString(business.name);
          
          await this.prologManager.addFact(`business(${businessId})`);
          await this.prologManager.addFact(`business_name(${businessId}, '${businessName}')`);
          
          if (business.businessType) {
            const bizType = this.sanitizeAtom(business.businessType);
            await this.prologManager.addFact(`business_type(${businessId}, ${bizType})`);
          }
          
          if (business.ownerId) {
            const owner = await this.storage.getCharacter(business.ownerId);
            if (owner) {
              const ownerId = this.sanitizeAtom(`${owner.firstName}_${owner.lastName}_${owner.id}`);
              await this.prologManager.addFact(`owns(${ownerId}, ${businessId})`);
              await this.prologManager.addFact(`business_owner(${businessId}, ${ownerId})`);
            }
          }
        }
      } else {
        console.warn('  ⚠️  getBusinessesByWorld method not available');
      }
    } catch (error) {
      console.warn('  ⚠️  Failed to sync businesses:', error);
    }
  }

  /**
   * Sync knowledge and belief facts to Prolog (Phase 6)
   */
  private async syncKnowledgeToProlog(worldId: string): Promise<void> {
    const characters = await this.storage.getCharactersByWorld(worldId);
    console.log(`  🧠 Syncing knowledge for ${characters.length} characters...`);
    
    let totalMentalModels = 0;
    let totalBeliefs = 0;
    
    for (const observer of characters) {
      const observerId = this.sanitizeAtom(`${observer.firstName}_${observer.lastName}_${observer.id}`);
      const knowledge = (observer.mentalModels as any) || { mentalModels: {} };
      
      if (!knowledge.mentalModels) continue;
      
      for (const [subjectId, model] of Object.entries(knowledge.mentalModels)) {
        const mentalModel = model as any;
        const subject = characters.find(c => c.id === subjectId);
        
        if (!subject) continue;
        
        const subjectPrologId = this.sanitizeAtom(`${subject.firstName}_${subject.lastName}_${subject.id}`);
        totalMentalModels++;
        
        // Sync mental model existence
        await this.prologManager.addFact(`has_mental_model(${observerId}, ${subjectPrologId})`);
        await this.prologManager.addFact(
          `mental_model_confidence(${observerId}, ${subjectPrologId}, ${mentalModel.confidence})`
        );
        await this.prologManager.addFact(
          `mental_model_updated(${observerId}, ${subjectPrologId}, ${mentalModel.lastUpdated})`
        );
        
        // Sync known facts
        if (mentalModel.knownFacts) {
          for (const [fact, known] of Object.entries(mentalModel.knownFacts)) {
            if (known) {
              const factAtom = this.sanitizeAtom(fact as string);
              await this.prologManager.addFact(`knows(${observerId}, ${subjectPrologId}, ${factAtom})`);
            }
          }
        }
        
        // Sync known values
        if (mentalModel.knownValues) {
          for (const [attr, value] of Object.entries(mentalModel.knownValues)) {
            const attrAtom = this.sanitizeAtom(attr);
            const valueAtom = typeof value === 'string' 
              ? `'${this.escapeString(value)}'`
              : String(value);
            await this.prologManager.addFact(
              `knows_value(${observerId}, ${subjectPrologId}, ${attrAtom}, ${valueAtom})`
            );
          }
        }
        
        // Sync beliefs
        if (mentalModel.beliefs) {
          for (const [quality, belief] of Object.entries(mentalModel.beliefs)) {
            const beliefData = belief as any;
            const qualityAtom = this.sanitizeAtom(quality);
            
            await this.prologManager.addFact(
              `believes(${observerId}, ${subjectPrologId}, ${qualityAtom}, ${beliefData.confidence})`
            );
            totalBeliefs++;
            
            // Sync evidence for this belief
            if (beliefData.evidence && Array.isArray(beliefData.evidence)) {
              for (const evidence of beliefData.evidence) {
                const evidenceType = this.sanitizeAtom(evidence.type);
                await this.prologManager.addFact(
                  `evidence(${observerId}, ${subjectPrologId}, ${qualityAtom}, ${evidenceType}, ${evidence.strength}, ${evidence.timestamp})`
                );
              }
            }
          }
        }
      }
    }
    
    console.log(`    ✅ Synced ${totalMentalModels} mental models, ${totalBeliefs} beliefs`);
  }

  /**
   * Sync item ownership truths to Prolog facts
   */
  private async syncOwnershipToProlog(worldId: string): Promise<void> {
    console.log(`  📦 Syncing item ownership...`);

    try {
      const truths = await this.storage.getTruthsByWorld(worldId);
      const ownershipTruths = truths.filter((t: any) => t.entryType === 'ownership');

      for (const truth of ownershipTruths) {
        const truthAny = truth as any;
        const data = typeof truthAny.customData === 'object' ? truthAny.customData : {};
        if (!truth.characterId || !data.itemId) continue;

        // Find the character to build proper Prolog ID
        const characters = await this.storage.getCharactersByWorld(worldId);
        const character = characters.find(c => c.id === truth.characterId);

        if (character) {
          const charId = this.sanitizeAtom(`${character.firstName}_${character.lastName}_${character.id}`);
          const itemId = this.sanitizeAtom(data.itemId);
          const itemName = this.escapeString(data.itemName || data.itemId);
          const quantity = data.quantity || 1;

          await this.prologManager.addFact(`has_item(${charId}, ${itemId}, ${quantity})`);
          await this.prologManager.addFact(`item_name(${itemId}, '${itemName}')`);

          if (data.itemType) {
            const itemType = this.sanitizeAtom(data.itemType);
            await this.prologManager.addFact(`item_type(${itemId}, ${itemType})`);
          }

          if (data.value) {
            await this.prologManager.addFact(`item_value(${itemId}, ${data.value})`);
          }
        }
      }

      console.log(`    ✅ Synced ${ownershipTruths.length} ownership facts`);
    } catch (error) {
      console.warn('  ⚠️  Failed to sync ownership:', error);
    }
  }

  /**
   * Sync countries to Prolog facts
   */
  private async syncCountriesToProlog(worldId: string): Promise<void> {
    console.log(`  🏴 Syncing countries...`);
    try {
      const countries = await this.storage.getCountriesByWorld(worldId);
      for (const country of countries) {
        const countryId = this.sanitizeAtom(country.name || country.id);
        await this.prologManager.addFact(`country(${countryId})`);
        await this.prologManager.addFact(`country_name(${countryId}, '${this.escapeString(country.name)}')`);

        const worldName = this.sanitizeAtom(worldId);
        await this.prologManager.addFact(`country_of_world(${countryId}, ${worldName})`);

        if (country.governmentType) {
          await this.prologManager.addFact(`government_type(${countryId}, ${this.sanitizeAtom(country.governmentType)})`);
        }
        if (country.economicSystem) {
          await this.prologManager.addFact(`economic_system(${countryId}, ${this.sanitizeAtom(country.economicSystem)})`);
        }
        if (country.foundedYear != null) {
          await this.prologManager.addFact(`country_founded(${countryId}, ${country.foundedYear})`);
        }
        // Array fields
        const alliances = country.alliances as any;
        if (Array.isArray(alliances)) {
          for (const ally of alliances) {
            const allyId = this.sanitizeAtom(typeof ally === 'string' ? ally : ally.name || ally.id);
            await this.prologManager.addFact(`country_alliance(${countryId}, ${allyId})`);
          }
        }
        const enemies = country.enemies as any;
        if (Array.isArray(enemies)) {
          for (const enemy of enemies) {
            const enemyId = this.sanitizeAtom(typeof enemy === 'string' ? enemy : enemy.name || enemy.id);
            await this.prologManager.addFact(`country_enemy(${countryId}, ${enemyId})`);
          }
        }
      }
      console.log(`    ✅ Synced ${countries.length} countries`);
    } catch (error) {
      console.warn('  ⚠️  Failed to sync countries:', error);
    }
  }

  /**
   * Sync states/provinces to Prolog facts
   */
  private async syncStatesToProlog(worldId: string): Promise<void> {
    console.log(`  🗾 Syncing states...`);
    try {
      const states = await this.storage.getStatesByWorld(worldId);
      for (const state of states) {
        const stateId = this.sanitizeAtom(state.name || state.id);
        await this.prologManager.addFact(`state(${stateId})`);
        await this.prologManager.addFact(`state_name(${stateId}, '${this.escapeString(state.name)}')`);

        if (state.countryId) {
          await this.prologManager.addFact(`state_of_country(${stateId}, ${this.sanitizeAtom(state.countryId)})`);
        }
        if (state.stateType) {
          await this.prologManager.addFact(`state_type(${stateId}, ${this.sanitizeAtom(state.stateType)})`);
        }
        if (state.terrain) {
          await this.prologManager.addFact(`state_terrain(${stateId}, ${this.sanitizeAtom(state.terrain)})`);
        }
        if (state.governorId) {
          await this.prologManager.addFact(`state_governor(${stateId}, ${this.sanitizeAtom(state.governorId)})`);
        }
      }
      console.log(`    ✅ Synced ${states.length} states`);
    } catch (error) {
      console.warn('  ⚠️  Failed to sync states:', error);
    }
  }

  /**
   * Sync lots to Prolog facts
   */
  private async syncLotsToProlog(worldId: string): Promise<void> {
    console.log(`  🏗️  Syncing lots...`);
    try {
      const settlements = await this.storage.getSettlementsByWorld(worldId);
      let totalLots = 0;
      for (const settlement of settlements) {
        const lots = await this.storage.getLotsBySettlement(settlement.id);
        for (const lot of lots) {
          const lotId = this.sanitizeAtom(lot.id);
          await this.prologManager.addFact(`lot(${lotId})`);
          await this.prologManager.addFact(`lot_of_settlement(${lotId}, ${this.sanitizeAtom(settlement.name)})`);

          if (lot.address) {
            await this.prologManager.addFact(`lot_address(${lotId}, '${this.escapeString(lot.address)}')`);
          }
          if (lot.streetName) {
            await this.prologManager.addFact(`lot_street(${lotId}, '${this.escapeString(lot.streetName)}')`);
          }
          if (lot.districtName) {
            await this.prologManager.addFact(`lot_district(${lotId}, '${this.escapeString(lot.districtName)}')`);
          }
          if (lot.buildingId) {
            await this.prologManager.addFact(`lot_building(${lotId}, ${this.sanitizeAtom(lot.buildingId)})`);
          }
          if (lot.buildingType) {
            await this.prologManager.addFact(`lot_building_type(${lotId}, ${this.sanitizeAtom(lot.buildingType)})`);
          }
          if (Array.isArray(lot.formerBuildingIds)) {
            for (const fmrId of lot.formerBuildingIds) {
              await this.prologManager.addFact(`lot_former_building(${lotId}, ${this.sanitizeAtom(fmrId)})`);
            }
          }
          totalLots++;
        }
      }
      console.log(`    ✅ Synced ${totalLots} lots`);
    } catch (error) {
      console.warn('  ⚠️  Failed to sync lots:', error);
    }
  }

  /**
   * Sync residences to Prolog facts
   */
  private async syncResidencesToProlog(worldId: string): Promise<void> {
    console.log(`  🏠 Syncing residences...`);
    try {
      const settlements = await this.storage.getSettlementsByWorld(worldId);
      let totalResidences = 0;
      for (const settlement of settlements) {
        const residences = await this.storage.getResidencesBySettlement(settlement.id);
        for (const residence of residences) {
          const resId = this.sanitizeAtom(residence.id);
          await this.prologManager.addFact(`residence(${resId})`);

          if (residence.lotId) {
            await this.prologManager.addFact(`residence_of_lot(${resId}, ${this.sanitizeAtom(residence.lotId)})`);
          }
          await this.prologManager.addFact(`residence_of_settlement(${resId}, ${this.sanitizeAtom(settlement.name)})`);

          if (residence.residenceType) {
            await this.prologManager.addFact(`residence_type(${resId}, ${this.sanitizeAtom(residence.residenceType)})`);
          }
          if (residence.address) {
            await this.prologManager.addFact(`residence_address(${resId}, '${this.escapeString(residence.address)}')`);
          }
          if (Array.isArray(residence.ownerIds)) {
            for (const ownerId of residence.ownerIds) {
              await this.prologManager.addFact(`residence_owner(${resId}, ${this.sanitizeAtom(ownerId)})`);
            }
          }
          if (Array.isArray(residence.residentIds)) {
            for (const residentId of residence.residentIds) {
              await this.prologManager.addFact(`residence_resident(${resId}, ${this.sanitizeAtom(residentId)})`);
            }
          }
          totalResidences++;
        }
      }
      console.log(`    ✅ Synced ${totalResidences} residences`);
    } catch (error) {
      console.warn('  ⚠️  Failed to sync residences:', error);
    }
  }

  /**
   * Sync item definitions to Prolog facts
   */
  private async syncItemsToProlog(worldId: string): Promise<void> {
    console.log(`  🎒 Syncing items...`);
    try {
      const items = await this.storage.getItemsByWorld(worldId);
      for (const item of items) {
        const itemId = this.sanitizeAtom(item.name || item.id);
        await this.prologManager.addFact(`item(${itemId})`);
        await this.prologManager.addFact(`item_name(${itemId}, '${this.escapeString(item.name)}')`);

        if (item.itemType) {
          await this.prologManager.addFact(`item_type(${itemId}, ${this.sanitizeAtom(item.itemType)})`);
        }
        if (item.value != null) {
          await this.prologManager.addFact(`item_value(${itemId}, ${item.value})`);
        }
        if (item.sellValue != null) {
          await this.prologManager.addFact(`item_sell_value(${itemId}, ${item.sellValue})`);
        }
        if (item.weight != null) {
          await this.prologManager.addFact(`item_weight(${itemId}, ${item.weight})`);
        }
        if (item.tradeable) {
          await this.prologManager.addFact(`item_tradeable(${itemId})`);
        }
        if (item.stackable) {
          await this.prologManager.addFact(`item_stackable(${itemId})`);
        }
        if (item.maxStack != null) {
          await this.prologManager.addFact(`item_max_stack(${itemId}, ${item.maxStack})`);
        }
        if (Array.isArray(item.tags)) {
          for (const tag of item.tags) {
            if (typeof tag === 'string') {
              await this.prologManager.addFact(`item_tag(${itemId}, ${this.sanitizeAtom(tag)})`);
            }
          }
        }
      }
      console.log(`    ✅ Synced ${items.length} items`);
    } catch (error) {
      console.warn('  ⚠️  Failed to sync items:', error);
    }
  }

  /**
   * Sync truths (world facts/events/lore) to Prolog facts
   */
  private async syncTruthsToProlog(worldId: string): Promise<void> {
    console.log(`  📜 Syncing truths...`);
    try {
      const truths = await this.storage.getTruthsByWorld(worldId);
      // Skip ownership truths — those are handled by syncOwnershipToProlog
      const nonOwnershipTruths = truths.filter((t: any) => t.entryType !== 'ownership');

      for (const truth of nonOwnershipTruths) {
        const truthId = this.sanitizeAtom(truth.id);
        const title = this.escapeString(truth.title || '');
        const content = this.escapeString((truth.content || '').substring(0, 500));
        await this.prologManager.addFact(`truth(${truthId}, '${title}', '${content}')`);

        if (truth.entryType) {
          await this.prologManager.addFact(`truth_type(${truthId}, ${this.sanitizeAtom(truth.entryType)})`);
        }
        if (truth.timestep != null) {
          await this.prologManager.addFact(`truth_timestep(${truthId}, ${truth.timestep})`);
        }
        if (truth.timeYear != null) {
          await this.prologManager.addFact(`truth_year(${truthId}, ${truth.timeYear})`);
        }
        if (truth.characterId) {
          await this.prologManager.addFact(`truth_character(${truthId}, ${this.sanitizeAtom(truth.characterId)})`);
        }
        if (Array.isArray(truth.relatedLocationIds)) {
          for (const locId of truth.relatedLocationIds) {
            await this.prologManager.addFact(`truth_location(${truthId}, ${this.sanitizeAtom(locId)})`);
          }
        }
        if (truth.importance != null) {
          await this.prologManager.addFact(`truth_importance(${truthId}, ${truth.importance})`);
        }
        if (truth.isPublic) {
          await this.prologManager.addFact(`truth_public(${truthId})`);
        }
        if (Array.isArray(truth.tags)) {
          for (const tag of truth.tags) {
            if (typeof tag === 'string') {
              await this.prologManager.addFact(`truth_tag(${truthId}, ${this.sanitizeAtom(tag)})`);
            }
          }
        }
      }
      console.log(`    ✅ Synced ${nonOwnershipTruths.length} truths`);
    } catch (error) {
      console.warn('  ⚠️  Failed to sync truths:', error);
    }
  }

  /**
   * Sync achievements to Prolog facts
   */
  private async syncAchievementsToProlog(worldId: string): Promise<void> {
    console.log(`  🏆 Syncing achievements...`);
    try {
      const achievements = await this.storage.getAchievementsByWorld(worldId);
      for (const achievement of achievements) {
        const achId = this.sanitizeAtom(achievement.name || achievement.id);
        await this.prologManager.addFact(`achievement(${achId})`);
        await this.prologManager.addFact(`achievement_name(${achId}, '${this.escapeString(achievement.name)}')`);

        if (achievement.achievementType) {
          await this.prologManager.addFact(`achievement_type(${achId}, ${this.sanitizeAtom(achievement.achievementType)})`);
        }
        if (achievement.rarity) {
          await this.prologManager.addFact(`achievement_rarity(${achId}, ${this.sanitizeAtom(achievement.rarity)})`);
        }
        if (achievement.isHidden) {
          await this.prologManager.addFact(`achievement_hidden(${achId})`);
        }
        // Rewards — expand object keys
        if (achievement.rewards && typeof achievement.rewards === 'object') {
          const rewards = achievement.rewards as Record<string, any>;
          for (const [rewardType, rewardValue] of Object.entries(rewards)) {
            const typeAtom = this.sanitizeAtom(rewardType);
            const valueStr = typeof rewardValue === 'string'
              ? `'${this.escapeString(rewardValue)}'`
              : String(rewardValue);
            await this.prologManager.addFact(`achievement_reward(${achId}, ${typeAtom}, ${valueStr})`);
          }
        }
      }
      console.log(`    ✅ Synced ${achievements.length} achievements`);
    } catch (error) {
      console.warn('  ⚠️  Failed to sync achievements:', error);
    }
  }

  /**
   * Sync world languages to Prolog facts
   */
  private async syncLanguagesToProlog(worldId: string): Promise<void> {
    console.log(`  🗣️  Syncing languages...`);
    try {
      const languages = await this.storage.getWorldLanguagesByWorld(worldId);
      for (const lang of languages) {
        const langId = this.sanitizeAtom(lang.name || lang.id);
        await this.prologManager.addFact(`language(${langId})`);
        await this.prologManager.addFact(`language_name(${langId}, '${this.escapeString(lang.name)}')`);

        if (lang.kind) {
          await this.prologManager.addFact(`language_kind(${langId}, ${this.sanitizeAtom(lang.kind)})`);
        }
        if (lang.scopeType && lang.scopeId) {
          await this.prologManager.addFact(
            `language_scope(${langId}, ${this.sanitizeAtom(lang.scopeType)}, ${this.sanitizeAtom(lang.scopeId)})`
          );
        }
        if (lang.isPrimary) {
          await this.prologManager.addFact(`language_primary(${langId})`);
        }
        if (lang.parentLanguageId) {
          await this.prologManager.addFact(`language_parent(${langId}, ${this.sanitizeAtom(lang.parentLanguageId)})`);
        }
        if (lang.realCode) {
          await this.prologManager.addFact(`language_real_code(${langId}, '${this.escapeString(lang.realCode)}')`);
        }
      }
      console.log(`    ✅ Synced ${languages.length} languages`);
    } catch (error) {
      console.warn('  ⚠️  Failed to sync languages:', error);
    }
  }

  /**
   * Add helper rules for common queries
   */
  private async addHelperRules(): Promise<void> {
    console.log(`  🔧 Adding helper rules...`);
    
    // Sibling relationship
    await this.prologManager.addRule(
      'sibling_of(X, Y) :- parent_of(P, X), parent_of(P, Y), X \\= Y'
    );
    
    // Grandparent relationship
    await this.prologManager.addRule(
      'grandparent_of(GP, GC) :- parent_of(GP, P), parent_of(P, GC)'
    );
    
    // Ancestor relationship (transitive)
    await this.prologManager.addRule(
      'ancestor_of(A, D) :- parent_of(A, D)'
    );
    await this.prologManager.addRule(
      'ancestor_of(A, D) :- parent_of(A, X), ancestor_of(X, D)'
    );
    
    // Unmarried predicate
    await this.prologManager.addRule(
      'unmarried(X) :- person(X), \\+ married_to(X, _)'
    );
    
    // Same location predicate
    await this.prologManager.addRule(
      'same_location(X, Y) :- at_location(X, L), at_location(Y, L), X \\= Y'
    );
    
    // Eldest child (simplified)
    await this.prologManager.addRule(
      'eldest_child(X) :- person(X), parent_of(P, X), birth_year(X, BY), \\+ (parent_of(P, Y), birth_year(Y, BY2), BY2 < BY)'
    );
    
    // Adult predicate (age >= 18)
    await this.prologManager.addRule(
      'adult(X) :- age(X, A), A >= 18'
    );
    
    // Child predicate (age < 18)
    await this.prologManager.addRule(
      'child(X) :- age(X, A), A < 18'
    );
    
    // Item ownership helper rules
    await this.prologManager.addRule(
      'owns_item(X, Item) :- has_item(X, Item, Q), Q > 0'
    );
    await this.prologManager.addRule(
      'has_item_type(X, Type) :- has_item(X, Item, _), item_type(Item, Type)'
    );
    await this.prologManager.addRule(
      'total_item_value(X, Total) :- findall(V, (has_item(X, Item, Q), item_value(Item, BaseV), V is BaseV * Q), Values), sum_list(Values, Total)'
    );
    await this.prologManager.addRule(
      'is_merchant(X) :- person(X), occupation(X, Occ), (Occ = merchant ; Occ = shopkeeper ; Occ = trader ; Occ = vendor ; Occ = blacksmith ; Occ = apothecary)'
    );

    // Phase 6: Knowledge & Belief helper rules
    
    // Can share knowledge about subject
    await this.prologManager.addRule(
      'can_share_knowledge(Speaker, Listener, Subject, Fact) :- ' +
      'knows(Speaker, Subject, Fact), ' +
      '\\+ knows(Listener, Subject, Fact), ' +
      'has_mental_model(Speaker, Listener)'
    );
    
    // Phase 7: Conversation helper rules
    // Note: Conversation facts (in_conversation, conversation_topic, etc.) 
    // are added dynamically during simulation as conversations are ephemeral
    
    // Can overhear conversation
    await this.prologManager.addRule(
      'can_overhear(Eavesdropper, Conv) :- ' +
      'conversation_at(Conv, Location), ' +
      'at_location(Eavesdropper, Location), ' +
      '\\+ in_conversation(Eavesdropper, _, _)'
    );
    
    // Strong belief (high confidence)
    await this.prologManager.addRule(
      'strong_belief(Observer, Subject, Quality) :- ' +
      'believes(Observer, Subject, Quality, C), C >= 0.7'
    );
    
    // Weak belief (low confidence)
    await this.prologManager.addRule(
      'weak_belief(Observer, Subject, Quality) :- ' +
      'believes(Observer, Subject, Quality, C), C < 0.4'
    );
    
    // Knows well (high mental model confidence)
    await this.prologManager.addRule(
      'knows_well(Observer, Subject) :- ' +
      'mental_model_confidence(Observer, Subject, C), C >= 0.6'
    );
    
    // Stranger (no mental model or low confidence)
    await this.prologManager.addRule(
      'stranger(Observer, Subject) :- ' +
      'person(Observer), person(Subject), ' +
      '\\+ has_mental_model(Observer, Subject)'
    );
  }

  /**
   * Sanitize string to valid Prolog atom
   */
  private sanitizeAtom(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^([0-9])/, '_$1')
      .replace(/_+/g, '_');
  }

  /**
   * Escape string for Prolog
   */
  private escapeString(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  /**
   * Clear all Prolog facts for a world (before re-sync)
   */
  async clearWorldFromProlog(worldId: string): Promise<void> {
    console.log(`🗑️  Clearing world ${worldId} from Prolog...`);
    await this.prologManager.clearKnowledgeBase();
  }
}

// Export singleton factory
export function createPrologSyncService(storage: IStorage, prologManager: PrologManager): PrologSyncService {
  return new PrologSyncService(storage, prologManager);
}
