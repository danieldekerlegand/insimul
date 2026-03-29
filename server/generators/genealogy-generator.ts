/**
 * Procedural Genealogy Generator
 * Creates multi-generational family trees with realistic relationships
 */

import { storage } from '../db/storage';
import { nameGenerator } from './name-generator.js';
import type { InsertCharacter } from '../../shared/schema';
import { initializeCharacterAppearance } from '../extensions/tott/appearance-system.js';

interface GenerationConfig {
  worldId: string;
  settlementId?: string;
  startYear: number;
  currentYear: number;
  numFoundingFamilies: number;
  generationsToGenerate: number;
  marriageRate: number;
  fertilityRate: number;
  deathRate: number;
  targetLanguage?: string;
}

interface FamilyLine {
  surname: string;
  generations: Map<number, string[]>; // generation number -> character IDs
  founders: { father: any; mother: any };
}

/** Language-specific fallback name pools for when LLM generation is unavailable */
const LANGUAGE_NAME_POOLS: Record<string, { male: string[]; female: string[]; surnames: string[] }> = {
  french: {
    male: ['Jean', 'Pierre', 'Jacques', 'Louis', 'Henri', 'François', 'Antoine', 'Michel', 'Claude', 'André',
           'Philippe', 'René', 'Marcel', 'Étienne', 'Gérard', 'Yves', 'Alain', 'Bernard', 'Thierry', 'Lucien',
           'Évariste', 'Gervais', 'Théo', 'Émile', 'Gustave', 'Léon', 'Raoul', 'Gaston', 'Armand', 'Julien'],
    female: ['Marie', 'Jeanne', 'Marguerite', 'Céleste', 'Geneviève', 'Françoise', 'Madeleine', 'Catherine',
             'Thérèse', 'Élise', 'Claire', 'Hélène', 'Isabelle', 'Adèle', 'Charlotte', 'Colette', 'Simone',
             'Lucienne', 'Renée', 'Odette', 'Sylvie', 'Monique', 'Brigitte', 'Yvette', 'Solange',
             'Delphine', 'Cécile', 'Josette', 'Paulette', 'Bernadette'],
    surnames: ['Broussard', 'Fontenot', 'Thibodeaux', 'Landry', 'Mouton', 'Guidry', 'Boudreaux', 'Hébert',
               'Doucet', 'Arceneaux', 'Trahan', 'Melancon', 'Leblanc', 'Comeaux', 'Dugas', 'Richard',
               'Gaudet', 'Pellerin', 'Aucoin', 'Babineaux', 'Theriot', 'Breaux', 'Leger', 'Picard',
               'Robichaux', 'Arnaud', 'Bergeron', 'Castille', 'Daigle', 'Girard'],
  },
  spanish: {
    male: ['Carlos', 'Miguel', 'José', 'Juan', 'Pedro', 'Luis', 'Antonio', 'Francisco', 'Manuel', 'Rafael',
           'Diego', 'Alejandro', 'Fernando', 'Pablo', 'Enrique', 'Sergio', 'Ricardo', 'Andrés', 'Tomás', 'Javier'],
    female: ['María', 'Carmen', 'Isabel', 'Ana', 'Rosa', 'Elena', 'Lucía', 'Teresa', 'Pilar', 'Dolores',
             'Sofía', 'Catalina', 'Beatriz', 'Marta', 'Laura', 'Patricia', 'Alicia', 'Inés', 'Clara', 'Raquel'],
    surnames: ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Pérez', 'Sánchez',
               'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes',
               'Ortiz', 'Gutiérrez', 'Ramos'],
  },
  german: {
    male: ['Hans', 'Friedrich', 'Wilhelm', 'Karl', 'Heinrich', 'Otto', 'Ernst', 'Werner', 'Klaus', 'Dieter',
           'Günther', 'Helmut', 'Manfred', 'Walter', 'Kurt', 'Rolf', 'Jürgen', 'Gerhard', 'Bernd', 'Wolfgang'],
    female: ['Anna', 'Maria', 'Greta', 'Helga', 'Ingrid', 'Ursula', 'Elke', 'Monika', 'Renate', 'Brigitte',
             'Hildegard', 'Gertrud', 'Liesel', 'Käthe', 'Irmgard', 'Elfriede', 'Hilde', 'Erika', 'Waltraud', 'Christa'],
    surnames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz',
               'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann',
               'Schwarz', 'Braun'],
  },
};

const DEFAULT_NAME_POOL = {
  male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
         'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth',
         'Joshua', 'George', 'Kevin', 'Brian', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan'],
  female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen',
           'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle',
           'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Laura', 'Sharon', 'Cynthia', 'Anna'],
  surnames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
            'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
            'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Hall', 'Young'],
};

/** Resolve the name pool for a target language, falling back to English defaults */
function resolveNamePool(targetLanguage?: string): typeof DEFAULT_NAME_POOL {
  if (!targetLanguage) return DEFAULT_NAME_POOL;
  const lang = targetLanguage.toLowerCase();
  for (const [key, pool] of Object.entries(LANGUAGE_NAME_POOLS)) {
    if (lang.includes(key)) return pool;
  }
  return DEFAULT_NAME_POOL;
}

export class GenealogyGenerator {
  private namePool = DEFAULT_NAME_POOL;
  private targetLanguage: string | undefined;

  private usedNames = new Set<string>();
  private worldContext: any = null;
  private countryContext: any = null;
  private settlementContext: any = null;

  /**
   * Generate a complete multi-generational genealogy
   */
  async generate(config: GenerationConfig): Promise<{
    families: FamilyLine[];
    totalCharacters: number;
    generations: number;
  }> {
    console.log(`🌳 Generating genealogy for ${config.numFoundingFamilies} families over ${config.generationsToGenerate} generations...`);
    
    // Validate that settlementId is provided
    if (!config.settlementId) {
      throw new Error('settlementId is required for character generation to prevent orphaned characters');
    }
    
    // TypeScript type narrowing - settlementId is now guaranteed to be defined
    const settlementId: string = config.settlementId;
    
    // Load context for name generation
    await this.loadContext(config);
    
    const families: FamilyLine[] = [];
    
    // Batch generate ALL founder names upfront to reduce API calls
    console.log(`   👥 Batch generating names for ${config.numFoundingFamilies} founding families...`);
    const founderNames = await this.batchGenerateFounderNames(config.numFoundingFamilies);
    
    // Create founding generation (Generation 0)
    for (let i = 0; i < config.numFoundingFamilies; i++) {
      const family = await this.createFoundingFamily(config, i, founderNames[i]);
      families.push(family);
    }
    
    // Generate subsequent generations
    for (let gen = 1; gen < config.generationsToGenerate; gen++) {
      console.log(`   👨‍👩‍👧‍👦 Generating generation ${gen}...`);
      
      for (const family of families) {
        await this.generateNextGeneration(config, family, gen);
      }
      
      // Create cross-family marriages
      await this.createMarriages(config, families, gen);
    }
    
    // Count total characters
    let totalCharacters = 0;
    for (const family of families) {
      for (const [_, charIds] of Array.from(family.generations.entries())) {
        totalCharacters += charIds.length;
      }
    }
    
    console.log(`✅ Generated ${totalCharacters} characters across ${config.generationsToGenerate} generations`);
    
    return {
      families,
      totalCharacters,
      generations: config.generationsToGenerate
    };
  }

  /**
   * Batch generate all founder names to reduce API calls
   */
  private async batchGenerateFounderNames(numFamilies: number): Promise<Array<{
    surname: string,
    fatherName: string,
    motherName: string,
    motherMaidenName: string
  }>> {
    if (!this.worldContext) {
      // Fallback to traditional name generation
      return Array(numFamilies).fill(null).map(() => ({
        surname: this.getFallbackName('male') + 'son',
        fatherName: this.getFallbackName('male'),
        motherName: this.getFallbackName('female'),
        motherMaidenName: this.getFallbackName('male') + 'son'
      }));
    }

    try {
      // Generate all male names (for fathers) in one batch
      const maleNames = await nameGenerator.generateCharacterNamesBatch({
        worldId: this.worldContext.id,
        worldName: this.worldContext.name,
        worldDescription: this.worldContext.description || undefined,
        worldType: this.worldContext.worldType || undefined,
        countryName: this.countryContext?.name,
        countryDescription: this.countryContext?.description || undefined,
        settlementName: this.settlementContext?.name,
        settlementType: this.settlementContext?.settlementType,
        gender: 'male',
        generation: 0,
        isFounder: true,
        targetLanguage: this.targetLanguage,
      }, numFamilies);

      // Generate all female names (for mothers) in one batch
      const femaleNames = await nameGenerator.generateCharacterNamesBatch({
        worldId: this.worldContext.id,
        worldName: this.worldContext.name,
        worldDescription: this.worldContext.description || undefined,
        worldType: this.worldContext.worldType || undefined,
        countryName: this.countryContext?.name,
        countryDescription: this.countryContext?.description || undefined,
        settlementName: this.settlementContext?.name,
        settlementType: this.settlementContext?.settlementType,
        gender: 'female',
        generation: 0,
        isFounder: true,
        targetLanguage: this.targetLanguage,
      }, numFamilies);

      // Combine into founder records
      const founders = [];
      for (let i = 0; i < numFamilies; i++) {
        const male = maleNames[i] || { firstName: this.getFallbackName('male'), lastName: this.getFallbackName('male') + 'son' };
        const female = femaleNames[i] || { firstName: this.getFallbackName('female'), lastName: this.getFallbackName('male') + 'son' };
        
        founders.push({
          surname: male.lastName,
          fatherName: male.firstName,
          motherName: female.firstName,
          motherMaidenName: female.lastName
        });
        
        // Mark names as used
        this.usedNames.add(male.firstName);
        this.usedNames.add(female.firstName);
        this.usedNames.add(male.lastName);
        this.usedNames.add(female.lastName);
      }

      return founders;
    } catch (error) {
      console.warn('Batch founder name generation failed, using fallbacks:', error);
      return Array(numFamilies).fill(null).map(() => ({
        surname: this.getFallbackName('male') + 'son',
        fatherName: this.getFallbackName('male'),
        motherName: this.getFallbackName('female'),
        motherMaidenName: this.getFallbackName('male') + 'son'
      }));
    }
  }

  /**
   * Create a founding family (generation 0)
   */
  private async createFoundingFamily(
    config: GenerationConfig, 
    index: number,
    names?: {surname: string, fatherName: string, motherName: string, motherMaidenName: string}
  ): Promise<FamilyLine> {
    // Use pre-generated names if provided, otherwise generate them
    const surname = names?.surname || await this.getUniqueSurname();
    const fatherName = names?.fatherName || await this.getUniqueName('male', 0, true);
    const motherName = names?.motherName || await this.getUniqueName('female', 0, true);
    const motherMaidenName = names?.motherMaidenName || await this.getUniqueSurname();
    
    // Create father
    const fatherPersonality = this.generatePersonality();
    const fatherAge = config.currentYear - (config.startYear - 25);
    const father = await storage.createCharacter({
      worldId: config.worldId,
      firstName: fatherName,
      lastName: surname,
      gender: 'male',
      birthYear: config.startYear - 25,
      age: fatherAge,
      isAlive: this.isAlive(config.startYear - 25, config.currentYear, config.deathRate),
      currentLocation: config.settlementId!,
      personality: fatherPersonality,
      skills: this.generateSkills(fatherPersonality, fatherAge),
      socialAttributes: {
        generation: 0,
        founderFamily: true
      }
    });

    // Generate appearance for father (no parents — founder)
    try { await initializeCharacterAppearance(father.id, 'male', undefined, undefined, fatherAge); } catch {}

    // Create mother
    const motherPersonality = this.generatePersonality();
    const motherAge = config.currentYear - (config.startYear - 23);
    const mother = await storage.createCharacter({
      worldId: config.worldId,
      firstName: motherName,
      lastName: surname,
      maidenName: motherMaidenName,
      gender: 'female',
      birthYear: config.startYear - 23,
      age: motherAge,
      isAlive: this.isAlive(config.startYear - 23, config.currentYear, config.deathRate),
      spouseId: father.id,
      currentLocation: config.settlementId!,
      personality: motherPersonality,
      skills: this.generateSkills(motherPersonality, motherAge),
      socialAttributes: {
        generation: 0,
        founderFamily: true
      }
    });
    
    // Generate appearance for mother (no parents — founder)
    try { await initializeCharacterAppearance(mother.id, 'female', undefined, undefined, motherAge); } catch {}

    await storage.updateCharacter(father.id, { spouseId: mother.id });
    
    // Create initial children
    const numChildren = this.rollChildren(config.fertilityRate);
    const children = await this.createChildren(config, father, mother, config.startYear, 1, numChildren);
    
    const childIds = children.map(c => c.id);
    await storage.updateCharacter(father.id, { childIds });
    await storage.updateCharacter(mother.id, { childIds });
    
    const familyLine: FamilyLine = {
      surname,
      generations: new Map(),
      founders: { father, mother }
    };
    
    familyLine.generations.set(0, [father.id, mother.id]);
    familyLine.generations.set(1, childIds);
    
    return familyLine;
  }

  /**
   * Generate the next generation for a family
   */
  private async generateNextGeneration(
    config: GenerationConfig,
    family: FamilyLine,
    generation: number
  ): Promise<void> {
    const previousGen = family.generations.get(generation - 1) || [];
    const newGeneration: string[] = [];
    
    // Track which couples we've already processed (avoid duplicates when
    // both spouses appear in previousGen)
    const processedCouples = new Set<string>();

    for (const parentId of previousGen) {
      const parent = await storage.getCharacter(parentId);
      if (!parent || !parent.spouseId) continue;

      // Avoid processing the same couple twice (both partners may be in the gen list)
      const coupleKey = [parent.id, parent.spouseId].sort().join('_');
      if (processedCouples.has(coupleKey)) continue;
      processedCouples.add(coupleKey);

      const spouse = await storage.getCharacter(parent.spouseId);
      if (!spouse) continue;
      
      // Determine if couple has children based on age at time of childbirth
      // (NOT age at currentYear — founders born 150+ years ago would always fail)
      const childBirthYear = config.startYear + (generation * 25);
      const parentAgeAtBirth = childBirthYear - (parent.birthYear || 0);
      if (parentAgeAtBirth < 20 || parentAgeAtBirth > 50) continue;

      // rollChildren handles fertility probability internally
      const numChildren = this.rollChildren(config.fertilityRate);
      const birthYear = config.startYear + (generation * 25) + Math.floor(Math.random() * 10);
      
      const children = await this.createChildren(
        config,
        parent.gender === 'male' ? parent : spouse,
        parent.gender === 'female' ? parent : spouse,
        birthYear,
        generation + 1,
        numChildren
      );
      
      const newChildIds = children.map(c => c.id);
      newGeneration.push(...newChildIds);

      // Append to existing childIds (parents may have children from multiple generations)
      const existingParentChildren = (parent.childIds as string[]) || [];
      const existingSpouseChildren = (spouse.childIds as string[]) || [];
      await storage.updateCharacter(parent.id, { childIds: [...existingParentChildren, ...newChildIds] });
      await storage.updateCharacter(spouse.id, { childIds: [...existingSpouseChildren, ...newChildIds] });
    }
    
    if (newGeneration.length > 0) {
      const existing = family.generations.get(generation) || [];
      family.generations.set(generation, [...existing, ...newGeneration]);
    }
  }

  /**
   * Create marriages between different families
   */
  private async createMarriages(
    config: GenerationConfig,
    families: FamilyLine[],
    generation: number
  ): Promise<void> {
    // Collect all unmarried adults from this generation across all families
    const unmarried: any[] = [];
    
    for (const family of families) {
      const genCharIds = family.generations.get(generation) || [];
      for (const charId of genCharIds) {
        const char = await storage.getCharacter(charId);
        if (char && !char.spouseId && char.isAlive) {
          unmarried.push(char);
        }
      }
    }
    
    // Shuffle and pair them up based on marriage rate
    this.shuffle(unmarried);
    
    for (let i = 0; i < unmarried.length - 1; i += 2) {
      if (Math.random() > config.marriageRate) continue;
      
      const char1 = unmarried[i];
      const char2 = unmarried[i + 1];
      
      // Don't marry siblings or people of same gender
      if (char1.gender === char2.gender) continue;
      if (char1.parentIds && char2.parentIds && 
          char1.parentIds.some((p: string) => char2.parentIds?.includes(p))) continue;
      
      // Create marriage
      await storage.updateCharacter(char1.id, { spouseId: char2.id });
      await storage.updateCharacter(char2.id, { spouseId: char1.id });
      
      // If female, update maiden name and surname
      if (char1.gender === 'female') {
        await storage.updateCharacter(char1.id, {
          maidenName: char1.lastName,
          lastName: char2.lastName
        });
      } else {
        await storage.updateCharacter(char2.id, {
          maidenName: char2.lastName,
          lastName: char1.lastName
        });
      }
    }
  }

  /**
   * Create children for a couple
   */
  private async createChildren(
    config: GenerationConfig,
    father: any,
    mother: any,
    birthYear: number,
    generation: number,
    count: number
  ): Promise<any[]> {
    const children = [];
    
    // Pre-determine genders
    const childrenInfo = Array(count).fill(null).map((_, i) => ({
      gender: Math.random() > 0.5 ? 'male' as const : 'female' as const,
      birthYear: birthYear + i
    }));
    
    // Batch generate all names at once if LLM is available
    let firstNames: string[];
    if (this.worldContext) {
      try {
        const maleCount = childrenInfo.filter(c => c.gender === 'male').length;
        const femaleCount = childrenInfo.filter(c => c.gender === 'female').length;
        
        const maleNames = maleCount > 0 ? await nameGenerator.generateCharacterNamesBatch({
          worldId: this.worldContext.id,
          worldName: this.worldContext.name,
          worldDescription: this.worldContext.description || undefined,
          worldType: this.worldContext.worldType || undefined,
          countryName: this.countryContext?.name,
          countryDescription: this.countryContext?.description || undefined,
          settlementName: this.settlementContext?.name,
          settlementType: this.settlementContext?.settlementType,
          gender: 'male',
          generation,
          isFounder: false,
          targetLanguage: this.targetLanguage,
        }, maleCount) : [];

        const femaleNames = femaleCount > 0 ? await nameGenerator.generateCharacterNamesBatch({
          worldId: this.worldContext.id,
          worldName: this.worldContext.name,
          worldDescription: this.worldContext.description || undefined,
          worldType: this.worldContext.worldType || undefined,
          countryName: this.countryContext?.name,
          countryDescription: this.countryContext?.description || undefined,
          settlementName: this.settlementContext?.name,
          settlementType: this.settlementContext?.settlementType,
          gender: 'female',
          generation,
          isFounder: false,
          targetLanguage: this.targetLanguage,
        }, femaleCount) : [];
        
        // Interleave names based on original gender order
        let maleIdx = 0, femaleIdx = 0;
        firstNames = childrenInfo.map(c => {
          if (c.gender === 'male') {
            return maleNames[maleIdx++]?.firstName || this.getFallbackName('male');
          } else {
            return femaleNames[femaleIdx++]?.firstName || this.getFallbackName('female');
          }
        });
      } catch (error) {
        console.warn('Batch name generation failed, using fallbacks');
        firstNames = childrenInfo.map(c => this.getFallbackName(c.gender));
      }
    } else {
      firstNames = childrenInfo.map(c => this.getFallbackName(c.gender));
    }
    
    // Create all children with generated names
    for (let i = 0; i < count; i++) {
      const info = childrenInfo[i];
      const firstName = firstNames[i];
      this.usedNames.add(firstName);
      
      const childPersonality = this.inheritPersonality(father.personality, mother.personality);
      const childAge = Math.max(0, config.currentYear - info.birthYear);
      const child = await storage.createCharacter({
        worldId: config.worldId,
        firstName,
        lastName: father.lastName,
        gender: info.gender,
        birthYear: info.birthYear,
        age: childAge,
        isAlive: this.isAlive(info.birthYear, config.currentYear, config.deathRate),
        parentIds: [father.id, mother.id],
        currentLocation: config.settlementId!,
        personality: childPersonality,
        skills: this.generateSkills(childPersonality, childAge),
        socialAttributes: {
          generation,
          paternalGrandparents: father.parentIds,
          maternalGrandparents: mother.parentIds
        }
      });
      
      // Generate appearance with inheritance from parents
      try {
        await initializeCharacterAppearance(
          child.id,
          info.gender as 'male' | 'female',
          mother.id,
          father.id,
          childAge
        );
      } catch {}

      children.push(child);
    }

    return children;
  }

  /**
   * Generate personality traits
   */
  private generatePersonality() {
    return {
      openness: Math.random() * 2 - 1,
      conscientiousness: Math.random() * 2 - 1,
      extroversion: Math.random() * 2 - 1,
      agreeableness: Math.random() * 2 - 1,
      neuroticism: Math.random() * 2 - 1
    };
  }

  /**
   * Generate initial skills based on personality traits and age.
   * Personality influences skill aptitudes:
   * - Openness → creativity, music, languages
   * - Conscientiousness → crafting, farming, cooking
   * - Extroversion → persuasion, leadership, trading
   * - Agreeableness → medicine, teaching, diplomacy
   * - Neuroticism (inverse) → combat, athletics, endurance
   */
  generateSkills(personality: {
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  }, age: number): Record<string, number> {
    const skills: Record<string, number> = {};
    // Age factor: skills grow with age, peak around 40-50
    const ageFactor = Math.min(1, Math.max(0.1, age / 40));

    // Map personality traits to skill aptitudes (base 0-1 range)
    const traitSkills: [string, number][] = [
      ['creativity', (personality.openness + 1) / 2],
      ['music', (personality.openness + 1) / 2 * 0.8],
      ['languages', (personality.openness + 1) / 2 * 0.7],
      ['crafting', (personality.conscientiousness + 1) / 2],
      ['farming', (personality.conscientiousness + 1) / 2 * 0.9],
      ['cooking', (personality.conscientiousness + 1) / 2 * 0.7],
      ['persuasion', (personality.extroversion + 1) / 2],
      ['leadership', (personality.extroversion + 1) / 2 * 0.8],
      ['trading', (personality.extroversion + 1) / 2 * 0.7],
      ['medicine', (personality.agreeableness + 1) / 2],
      ['teaching', (personality.agreeableness + 1) / 2 * 0.8],
      ['diplomacy', (personality.agreeableness + 1) / 2 * 0.7],
      ['combat', (1 - personality.neuroticism) / 2],
      ['athletics', (1 - personality.neuroticism) / 2 * 0.9],
      ['endurance', (1 - personality.neuroticism) / 2 * 0.8],
    ];

    for (const [skill, aptitude] of traitSkills) {
      // Add random variation (±20%), scale by age, clamp to 0-1
      const variation = (Math.random() - 0.5) * 0.4;
      const value = Math.max(0, Math.min(1, (aptitude + variation) * ageFactor));
      // Only include skills with meaningful values (> 0.1)
      if (value > 0.1) {
        skills[skill] = Math.round(value * 100) / 100;
      }
    }

    return skills;
  }

  /**
   * Inherit personality from parents with variation
   */
  private inheritPersonality(p1: any, p2: any) {
    if (!p1 || !p2) return this.generatePersonality();
    
    return {
      openness: this.inheritTrait(p1.openness, p2.openness),
      conscientiousness: this.inheritTrait(p1.conscientiousness, p2.conscientiousness),
      extroversion: this.inheritTrait(p1.extroversion, p2.extroversion),
      agreeableness: this.inheritTrait(p1.agreeableness, p2.agreeableness),
      neuroticism: this.inheritTrait(p1.neuroticism, p2.neuroticism)
    };
  }

  private inheritTrait(t1: number, t2: number): number {
    const avg = (t1 + t2) / 2;
    const variation = (Math.random() - 0.5) * 0.4; // 20% variation
    return Math.max(-1, Math.min(1, avg + variation));
  }

  /**
   * Determine if someone born in birthYear is alive in currentYear
   */
  private isAlive(birthYear: number, currentYear: number, deathRate: number): boolean {
    const age = currentYear - birthYear;
    if (age < 0) return true; // Not born yet
    if (age > 85) return false; // Very old
    
    // Death probability increases with age
    const deathProbability = (age / 100) * deathRate;
    return Math.random() > deathProbability;
  }

  /**
   * Roll number of children based on fertility rate
   */
  /**
   * Roll number of children for a couple.
   * Distribution (when fertile): 1-2 children most common, 3-5 less common.
   * Historical average ~4-6 children per couple, but we account for infant mortality
   * and not all couples having children.
   */
  private rollChildren(fertilityRate: number): number {
    // fertilityRate chance of having no children at all
    if (Math.random() > fertilityRate) return 0;

    // Distribution of children for fertile couples:
    // ~15% have 1, ~25% have 2, ~25% have 3, ~20% have 4, ~10% have 5, ~5% have 6
    const roll = Math.random();
    if (roll < 0.15) return 1;
    if (roll < 0.40) return 2;
    if (roll < 0.65) return 3;
    if (roll < 0.85) return 4;
    if (roll < 0.95) return 5;
    return 6;
  }

  /**
   * Get a fallback name from the name pool
   */
  private getFallbackName(gender: 'male' | 'female'): string {
    const pool = this.namePool[gender];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Get a unique name from the pool (or LLM if available)
   */
  private async getUniqueName(gender: 'male' | 'female', generation: number = 0, isFounder: boolean = false): Promise<string> {
    // Try LLM generation if context is available
    if (this.worldContext) {
      try {
        const names = await nameGenerator.generateCharacterNames({
          worldName: this.worldContext.name,
          worldDescription: this.worldContext.description,
          countryName: this.countryContext?.name,
          countryDescription: this.countryContext?.description,
          settlementName: this.settlementContext?.name,
          settlementType: this.settlementContext?.settlementType,
          gender,
          generation,
          isFounder,
          targetLanguage: this.targetLanguage,
        }, 1);

        if (names.length > 0) {
          const firstName = names[0].firstName;
          if (!this.usedNames.has(firstName)) {
            this.usedNames.add(firstName);
            return firstName;
          }
        }
      } catch (error) {
        console.warn('LLM name generation failed, using fallback');
      }
    }

    // Fallback to language-appropriate pool
    const pool = this.namePool[gender];
    let name;
    let attempts = 0;
    
    do {
      name = pool[Math.floor(Math.random() * pool.length)];
      attempts++;
      if (attempts > 100) {
        // Add suffix if we've exhausted names
        name = name + ' ' + (attempts - 100);
      }
    } while (this.usedNames.has(name) && attempts < 200);
    
    this.usedNames.add(name);
    return name;
  }

  /**
   * Get a unique surname (or LLM-generated if available)
   */
  private async getUniqueSurname(): Promise<string> {
    // Try LLM generation if context is available
    if (this.worldContext) {
      try {
        const names = await nameGenerator.generateCharacterNames({
          worldName: this.worldContext.name,
          worldDescription: this.worldContext.description,
          countryName: this.countryContext?.name,
          countryDescription: this.countryContext?.description,
          settlementName: this.settlementContext?.name,
          settlementType: this.settlementContext?.settlementType,
          gender: 'male', // Use male for surname generation
          generation: 0,
          isFounder: true,
          targetLanguage: this.targetLanguage,
        }, 1);
        
        if (names.length > 0) {
          const lastName = names[0].lastName;
          if (!this.usedNames.has(lastName)) {
            this.usedNames.add(lastName);
            return lastName;
          }
        }
      } catch (error) {
        console.warn('LLM surname generation failed, using fallback');
      }
    }
    
    // Fallback to pool
    const pool = this.namePool.surnames;
    let name;
    let attempts = 0;
    
    do {
      name = pool[Math.floor(Math.random() * pool.length)];
      attempts++;
      if (attempts > 50) {
        name = name + (attempts - 50);
      }
    } while (this.usedNames.has(name) && attempts < 100);
    
    this.usedNames.add(name);
    return name;
  }

  /**
   * Shuffle array in place
   */
  private shuffle(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Load world, country, and settlement context for name generation
   */
  private async loadContext(config: GenerationConfig): Promise<void> {
    try {
      this.worldContext = await storage.getWorld(config.worldId);
      this.targetLanguage = config.targetLanguage || this.worldContext?.targetLanguage;
      this.namePool = resolveNamePool(this.targetLanguage);

      if (config.settlementId) {
        this.settlementContext = await storage.getSettlement(config.settlementId);
        if (this.settlementContext?.countryId) {
          this.countryContext = await storage.getCountry(this.settlementContext.countryId);
        }
      }
    } catch (error) {
      console.error('Failed to load context for name generation:', error);
    }
  }

  /**
   * Generate individual immigrant characters (non-family) to fill population gaps.
   * Returns the number of characters created.
   */
  async generateImmigrants(config: {
    worldId: string;
    settlementId: string;
    currentYear: number;
    count: number;
    targetLanguage?: string;
  }): Promise<number> {
    if (config.count <= 0) return 0;

    // Ensure context is loaded for name generation
    await this.loadContext({
      worldId: config.worldId,
      settlementId: config.settlementId,
      startYear: config.currentYear - 50,
      currentYear: config.currentYear,
      numFoundingFamilies: 0,
      generationsToGenerate: 0,
      marriageRate: 0,
      fertilityRate: 0,
      deathRate: 0,
      targetLanguage: config.targetLanguage,
    });

    // Plan family units: 60% couples with children, 30% couples only, 10% singles
    interface ImmigrantSlot { gender: 'male' | 'female'; role: 'spouse' | 'child' | 'single'; familyIdx: number; age: number }
    const slots: ImmigrantSlot[] = [];
    let remaining = config.count;
    let familyIdx = 0;

    while (remaining > 0) {
      const roll = Math.random();
      if (roll < 0.6 && remaining >= 3) {
        // Couple with 1-3 children
        const husbandAge = 25 + Math.floor(Math.random() * 20); // 25-44
        const wifeAge = 23 + Math.floor(Math.random() * 18);    // 23-40
        slots.push({ gender: 'male', role: 'spouse', familyIdx, age: husbandAge });
        slots.push({ gender: 'female', role: 'spouse', familyIdx, age: wifeAge });
        remaining -= 2;
        const numChildren = Math.min(remaining, 1 + Math.floor(Math.random() * 3));
        for (let c = 0; c < numChildren; c++) {
          const childAge = 1 + Math.floor(Math.random() * Math.min(16, Math.min(husbandAge, wifeAge) - 20));
          slots.push({ gender: Math.random() > 0.5 ? 'male' : 'female', role: 'child', familyIdx, age: Math.max(1, childAge) });
          remaining--;
        }
        familyIdx++;
      } else if (roll < 0.9 && remaining >= 2) {
        // Couple only
        slots.push({ gender: 'male', role: 'spouse', familyIdx, age: 25 + Math.floor(Math.random() * 25) });
        slots.push({ gender: 'female', role: 'spouse', familyIdx, age: 23 + Math.floor(Math.random() * 23) });
        remaining -= 2;
        familyIdx++;
      } else {
        // Single immigrant
        const gender = Math.random() > 0.5 ? 'male' as const : 'female' as const;
        slots.push({ gender, role: 'single', familyIdx, age: 18 + Math.floor(Math.random() * 45) });
        remaining--;
        familyIdx++;
      }
    }

    // Batch-generate all names in 2 LLM calls (one per gender)
    const maleCount = slots.filter(s => s.gender === 'male').length;
    const femaleCount = slots.filter(s => s.gender === 'female').length;

    const nameContext = {
      worldName: this.worldContext?.name,
      worldDescription: this.worldContext?.description,
      countryName: this.countryContext?.name,
      countryDescription: this.countryContext?.description,
      settlementName: this.settlementContext?.name,
      settlementType: this.settlementContext?.settlementType,
      worldId: this.worldContext?.id,
      worldType: this.worldContext?.worldType,
      generation: 0,
      isFounder: false,
      targetLanguage: this.targetLanguage,
    };

    const [maleNames, femaleNames] = await Promise.all([
      maleCount > 0
        ? nameGenerator.generateCharacterNamesBatch({ ...nameContext, gender: 'male' }, maleCount)
        : [],
      femaleCount > 0
        ? nameGenerator.generateCharacterNamesBatch({ ...nameContext, gender: 'female' }, femaleCount)
        : [],
    ]);
    console.log(`   👥 Batch generated ${maleNames.length} male + ${femaleNames.length} female immigrant names`);

    // Create all characters and track them by family for linking
    let maleIdx = 0, femaleIdx = 0;
    const createdByFamily = new Map<number, { spouses: any[]; children: any[] }>();

    for (const slot of slots) {
      const nameData = slot.gender === 'male' ? maleNames[maleIdx++] : femaleNames[femaleIdx++];
      // Children take surname from their family's first spouse
      const familyEntry = createdByFamily.get(slot.familyIdx);
      const familySurname = familyEntry?.spouses[0]?.lastName;

      const firstName = nameData?.firstName || this.getFallbackName(slot.gender);
      const lastName = slot.role === 'child' && familySurname
        ? familySurname
        : (nameData?.lastName || `Immigrant${slot.familyIdx}`);
      const birthYear = config.currentYear - slot.age;
      const personality = this.generatePersonality();

      const immigrant = await storage.createCharacter({
        worldId: config.worldId,
        firstName,
        lastName,
        gender: slot.gender,
        birthYear,
        age: slot.age,
        isAlive: true,
        currentLocation: config.settlementId,
        personality,
        skills: this.generateSkills(personality, slot.age),
        socialAttributes: {
          immigrant: true,
          generation: slot.role === 'child' ? 1 : 0,
        },
      });

      try { await initializeCharacterAppearance(immigrant.id, slot.gender, undefined, undefined, slot.age); } catch {}

      if (!createdByFamily.has(slot.familyIdx)) {
        createdByFamily.set(slot.familyIdx, { spouses: [], children: [] });
      }
      const entry = createdByFamily.get(slot.familyIdx)!;
      if (slot.role === 'spouse') {
        entry.spouses.push(immigrant);
      } else if (slot.role === 'child') {
        entry.children.push(immigrant);
      }
    }

    // Link family members with spouseId, parentIds, childIds
    for (const [, family] of Array.from(createdByFamily.entries())) {
      if (family.spouses.length === 2) {
        const [s1, s2] = family.spouses;
        const childIds = family.children.map((c: any) => c.id);
        await storage.updateCharacter(s1.id, { spouseId: s2.id, childIds });
        await storage.updateCharacter(s2.id, { spouseId: s1.id, childIds });

        // Link children to parents
        const fatherId = s1.gender === 'male' ? s1.id : s2.id;
        const motherId = s1.gender === 'female' ? s1.id : s2.id;
        for (const child of family.children) {
          await storage.updateCharacter(child.id, {
            parentIds: [fatherId, motherId],
            immediateFamilyIds: [fatherId, motherId, ...childIds.filter((id: string) => id !== child.id)],
          });
        }
      }
    }

    return slots.length;
  }

  /**
   * Reset used names
   */
  reset(): void {
    this.usedNames.clear();
    this.worldContext = null;
    this.countryContext = null;
    this.settlementContext = null;
    this.targetLanguage = undefined;
    this.namePool = DEFAULT_NAME_POOL;
  }
}
