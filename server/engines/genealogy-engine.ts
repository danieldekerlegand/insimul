/**
 * Genealogy Engine (US-3.05)
 *
 * Generates multi-generational family trees from founding characters,
 * simulating marriages, births, and deaths across the historical period.
 * Produces genealogy data compatible with the family-chart library format
 * and cross-references with historical simulation truth entries.
 *
 * Design:
 *   - Deterministic via SeededRNG (same seed = same family trees)
 *   - Patrilineal surname convention by default (configurable)
 *   - Outputs GenealogyData containing per-family trees and a flat node map
 *   - Each genealogy event (birth/death/marriage) produces a TruthEntry for
 *     integration with the historical timeline
 */

import { SeededRNG } from './historical-simulation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single person in the genealogy tree. */
export interface GenealogyNode {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  birthYear: number;
  deathYear: number | null;
  gender: 'male' | 'female';
  generation: number;
  parentIds: string[];
  spouseIds: string[];
  childrenIds: string[];
  /** Maiden name for characters who changed surname on marriage. */
  maidenName?: string;
  /** Whether the character is still alive at the end of the simulation. */
  isAlive: boolean;
  /** Additional metadata (occupation, cause of death, etc.). */
  metadata: Record<string, any>;
}

/** A rooted family tree (one per founding surname). */
export interface FamilyTree {
  /** Root nodes of this family (generation-0 founders). */
  rootNodeIds: string[];
  /** All nodes belonging to this family tree keyed by id. */
  allNodeIds: string[];
  /** Founding surname. */
  familyName: string;
  /** Number of generations produced. */
  generationCount: number;
}

/** Top-level genealogy output. */
export interface GenealogyData {
  /** One tree per founding family. */
  trees: FamilyTree[];
  /** Every node across all families, keyed by id. */
  allNodes: Map<string, GenealogyNode>;
  /** Total character count. */
  totalCharacters: number;
  /** [startYear, endYear] of the simulation window. */
  yearRange: [number, number];
}

/** Truth entries produced as side-effects of genealogy events. */
export interface GenealogyTruthEntry {
  type: 'birth' | 'death' | 'marriage';
  year: number;
  characterIds: string[];
  title: string;
  description: string;
  familyName: string;
  importance: number;
}

/** Surname inheritance mode. */
export type SurnameConvention = 'patrilineal' | 'matrilineal' | 'hyphenated' | 'random';

/** Configuration for a genealogy generation run. */
export interface GenealogyConfig {
  /** First year of the historical window. */
  startYear: number;
  /** Last year of the historical window (exclusive). */
  endYear: number;
  /** Seed for deterministic RNG. */
  seed: number;
  /** How surnames are inherited. @default 'patrilineal' */
  surnameConvention: SurnameConvention;
  /** Base probability a married couple of childbearing age conceives per year. @default 0.15 */
  birthRate: number;
  /** Base probability a single adult marries per year. @default 0.08 */
  marriageRate: number;
  /** Minimum age for marriage. @default 18 */
  minMarriageAge: number;
  /** Maximum age for female fertility. @default 45 */
  maxFertilityAge: number;
  /** Minimum age for male fertility. @default 16 */
  minFertilityAge: number;
  /** Maximum number of children per couple. @default 8 */
  maxChildrenPerCouple: number;
  /** Average lifespan (used in death probability curve). @default 70 */
  averageLifespan: number;
  /** Whether to allow cross-family marriages (not just within same surname). @default true */
  allowCrossFamilyMarriage: boolean;
}

// ---------------------------------------------------------------------------
// Name banks
// ---------------------------------------------------------------------------

const MALE_FIRST_NAMES = [
  'James', 'John', 'Robert', 'William', 'Thomas', 'Charles', 'George',
  'Joseph', 'Edward', 'Henry', 'Samuel', 'Benjamin', 'Daniel', 'Richard',
  'David', 'Michael', 'Andrew', 'Isaac', 'Nathan', 'Oliver', 'Elijah',
  'Matthew', 'Alexander', 'Patrick', 'Walter', 'Frederick', 'Arthur',
  'Theodore', 'Albert', 'Ernest', 'Franklin', 'Harold', 'Herbert',
  'Lawrence', 'Leonard', 'Norman', 'Raymond', 'Russell', 'Stanley',
  'Vernon', 'Warren', 'Wesley', 'Clarence', 'Clifford', 'Eugene',
  'Howard', 'Luther', 'Martin', 'Oscar', 'Ralph',
];

const FEMALE_FIRST_NAMES = [
  'Mary', 'Elizabeth', 'Margaret', 'Dorothy', 'Helen', 'Ruth', 'Anna',
  'Florence', 'Alice', 'Catherine', 'Sarah', 'Martha', 'Clara', 'Jane',
  'Grace', 'Emma', 'Rose', 'Edith', 'Lillian', 'Mabel', 'Eleanor',
  'Frances', 'Josephine', 'Harriet', 'Virginia', 'Louise', 'Evelyn',
  'Beatrice', 'Gertrude', 'Gladys', 'Hazel', 'Irene', 'Lucille',
  'Mildred', 'Norma', 'Pearl', 'Thelma', 'Vivian', 'Wanda', 'Agnes',
  'Blanche', 'Carolyn', 'Doris', 'Ethel', 'Ida', 'Jean', 'Katherine',
  'Lena', 'Minnie', 'Nellie',
];

const FOUNDING_SURNAMES = [
  'Adams', 'Baker', 'Carter', 'Davis', 'Evans', 'Foster', 'Greene',
  'Harris', 'Irving', 'Jones', 'Kelly', 'Lewis', 'Miller', 'Nelson',
  'Owen', 'Parker', 'Quinn', 'Reed', 'Smith', 'Taylor', 'Underwood',
  'Vaughn', 'Walker', 'Young', 'Zimmerman', 'Brooks', 'Clark', 'Dixon',
  'Edwards', 'Fisher', 'Grant', 'Hayes', 'Jackson', 'King', 'Long',
  'Moore', 'Perry', 'Ross', 'Stone', 'Turner', 'Ward', 'Bell',
];

// ---------------------------------------------------------------------------
// Default config helper
// ---------------------------------------------------------------------------

function applyDefaults(
  partial: Partial<GenealogyConfig> & Pick<GenealogyConfig, 'startYear' | 'endYear' | 'seed'>,
): GenealogyConfig {
  return {
    surnameConvention: 'patrilineal',
    birthRate: 0.15,
    marriageRate: 0.08,
    minMarriageAge: 18,
    maxFertilityAge: 45,
    minFertilityAge: 16,
    maxChildrenPerCouple: 8,
    averageLifespan: 70,
    allowCrossFamilyMarriage: true,
    ...partial,
  };
}

// ---------------------------------------------------------------------------
// GenealogyEngine
// ---------------------------------------------------------------------------

export class GenealogyEngine {
  private config: GenealogyConfig;
  private rng: SeededRNG;
  private nodes: Map<string, GenealogyNode> = new Map();
  private truthEntries: GenealogyTruthEntry[] = [];
  private nextId = 1;

  /**
   * Married couples tracked as [characterA_id, characterB_id] for efficient
   * fertility checks. Removed on death of either partner.
   */
  private marriages: Array<{ partnerId1: string; partnerId2: string; year: number }> = [];

  constructor(config: Partial<GenealogyConfig> & Pick<GenealogyConfig, 'startYear' | 'endYear' | 'seed'>) {
    this.config = applyDefaults(config);
    this.rng = new SeededRNG(config.seed);
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Generate a full genealogy from the given founding characters.
   *
   * @param founders - Generation-0 characters. Each must have at minimum
   *   an id, firstName, lastName, gender, and birthYear. If empty, the
   *   engine auto-generates a set of founding families.
   * @param founderCount - Number of auto-generated founders if `founders` is
   *   empty. Default 10. Ignored when founders are provided.
   */
  generate(
    founders: Array<{
      id?: string;
      firstName: string;
      lastName: string;
      gender: 'male' | 'female';
      birthYear: number;
    }> = [],
    founderCount = 10,
  ): GenealogyData {
    this.nodes.clear();
    this.truthEntries = [];
    this.marriages = [];
    this.nextId = 1;

    // Create or import founding generation
    const gen0 = founders.length > 0
      ? founders.map(f => this.importFounder(f))
      : this.generateFounders(founderCount);

    // Simulate year by year
    for (let year = this.config.startYear; year < this.config.endYear; year++) {
      this.simulateYear(year);
    }

    // Build per-family trees
    const familyMap = new Map<string, string[]>();
    for (const node of Array.from(this.nodes.values())) {
      // Family identity is the root surname traced through parentage
      const rootSurname = this.getRootSurname(node);
      const existing = familyMap.get(rootSurname);
      if (existing) {
        existing.push(node.id);
      } else {
        familyMap.set(rootSurname, [node.id]);
      }
    }

    const trees: FamilyTree[] = Array.from(familyMap.entries()).map(([familyName, nodeIds]) => {
      const rootNodeIds = nodeIds.filter(id => {
        const n = this.nodes.get(id)!;
        return n.generation === 0;
      });
      const maxGen = nodeIds.reduce((max, id) => {
        const n = this.nodes.get(id)!;
        return Math.max(max, n.generation);
      }, 0);

      return {
        rootNodeIds,
        allNodeIds: nodeIds,
        familyName,
        generationCount: maxGen + 1,
      };
    });

    return {
      trees,
      allNodes: new Map(this.nodes),
      totalCharacters: this.nodes.size,
      yearRange: [this.config.startYear, this.config.endYear],
    };
  }

  /** Return all truth entries generated during the last run. */
  getTruthEntries(): ReadonlyArray<GenealogyTruthEntry> {
    return this.truthEntries;
  }

  /**
   * Convert the genealogy data to the family-chart library's expected format.
   *
   * family-chart expects an array of datum objects:
   *   { id, rels: { spouses: [], father, mother, children: [] }, data: { ... } }
   */
  toFamilyChartFormat(data: GenealogyData): Array<Record<string, any>> {
    const result: Array<Record<string, any>> = [];

    for (const node of Array.from(data.allNodes.values())) {
      const father = node.parentIds.find(pid => {
        const parent = data.allNodes.get(pid);
        return parent?.gender === 'male';
      });
      const mother = node.parentIds.find(pid => {
        const parent = data.allNodes.get(pid);
        return parent?.gender === 'female';
      });

      result.push({
        id: node.id,
        rels: {
          spouses: node.spouseIds,
          father: father ?? null,
          mother: mother ?? null,
          children: node.childrenIds,
        },
        data: {
          'first name': node.firstName,
          'last name': node.lastName,
          'name': node.name,
          gender: node.gender === 'male' ? 'M' : 'F',
          birthday: `${node.birthYear}`,
          deathday: node.deathYear != null ? `${node.deathYear}` : undefined,
          generation: node.generation,
          isAlive: node.isAlive,
        },
      });
    }

    return result;
  }

  // -----------------------------------------------------------------------
  // Founder generation
  // -----------------------------------------------------------------------

  private importFounder(f: {
    id?: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female';
    birthYear: number;
  }): GenealogyNode {
    const id = f.id ?? this.generateId();
    const node: GenealogyNode = {
      id,
      firstName: f.firstName,
      lastName: f.lastName,
      name: `${f.firstName} ${f.lastName}`,
      birthYear: f.birthYear,
      deathYear: null,
      gender: f.gender,
      generation: 0,
      parentIds: [],
      spouseIds: [],
      childrenIds: [],
      isAlive: true,
      metadata: { isFounder: true },
    };
    this.nodes.set(id, node);
    return node;
  }

  private generateFounders(count: number): GenealogyNode[] {
    const founders: GenealogyNode[] = [];
    const usedSurnames = new Set<string>();
    // Generate roughly equal male/female split
    const shuffledSurnames = this.rng.shuffle([...FOUNDING_SURNAMES]);

    for (let i = 0; i < count; i++) {
      const gender: 'male' | 'female' = i % 2 === 0 ? 'male' : 'female';
      const firstName = gender === 'male'
        ? this.rng.pick(MALE_FIRST_NAMES)!
        : this.rng.pick(FEMALE_FIRST_NAMES)!;

      let lastName: string;
      if (i < shuffledSurnames.length) {
        lastName = shuffledSurnames[i];
      } else {
        lastName = this.rng.pick(FOUNDING_SURNAMES)!;
      }
      usedSurnames.add(lastName);

      // Founders are born 20-35 years before the simulation start
      const birthYear = this.config.startYear - this.rng.randomInt(20, 35);

      const node = this.importFounder({ firstName, lastName, gender, birthYear });
      founders.push(node);
    }

    return founders;
  }

  // -----------------------------------------------------------------------
  // Year simulation
  // -----------------------------------------------------------------------

  private simulateYear(year: number): void {
    // Process deaths first (so dead characters don't marry/reproduce this year)
    this.processDeaths(year);

    // Process marriages among eligible singles
    this.processMarriages(year);

    // Process births for married couples
    this.processBirths(year);
  }

  // -----------------------------------------------------------------------
  // Deaths
  // -----------------------------------------------------------------------

  private processDeaths(year: number): void {
    for (const node of Array.from(this.nodes.values())) {
      if (!node.isAlive) continue;

      const age = year - node.birthYear;
      const deathProb = this.calculateDeathProbability(age);

      if (this.rng.chance(deathProb)) {
        node.isAlive = false;
        node.deathYear = year;

        // Remove from active marriages
        this.marriages = this.marriages.filter(
          m => m.partnerId1 !== node.id && m.partnerId2 !== node.id,
        );

        this.truthEntries.push({
          type: 'death',
          year,
          characterIds: [node.id],
          title: `Death of ${node.name}`,
          description: `${node.name} passed away in ${year} at the age of ${age}.`,
          familyName: node.lastName,
          importance: node.generation === 0 ? 6 : 3,
        });
      }
    }
  }

  /**
   * Age-banded mortality curve inspired by Talk of the Town.
   * Returns probability of death per year for a given age.
   */
  private calculateDeathProbability(age: number): number {
    const avg = this.config.averageLifespan;
    if (age < 1) return 0.08; // Infant mortality
    if (age < 5) return 0.02;
    if (age < 15) return 0.003;
    if (age < 40) return 0.004;
    if (age < 50) return 0.008;
    if (age < 60) return 0.015;
    if (age < avg) return 0.03;
    if (age < avg + 5) return 0.06;
    if (age < avg + 10) return 0.12;
    if (age < avg + 15) return 0.25;
    if (age < avg + 20) return 0.40;
    return 0.60;
  }

  // -----------------------------------------------------------------------
  // Marriages
  // -----------------------------------------------------------------------

  private processMarriages(year: number): void {
    const eligibleMales: GenealogyNode[] = [];
    const eligibleFemales: GenealogyNode[] = [];

    for (const node of Array.from(this.nodes.values())) {
      if (!node.isAlive) continue;
      const age = year - node.birthYear;
      if (age < this.config.minMarriageAge) continue;
      // Skip if already in an active marriage
      if (this.isCurrentlyMarried(node.id)) continue;

      if (node.gender === 'male') {
        eligibleMales.push(node);
      } else {
        eligibleFemales.push(node);
      }
    }

    // Shuffle to avoid ordering bias
    this.rng.shuffle(eligibleMales);
    this.rng.shuffle(eligibleFemales);

    const pairsToForm = Math.min(eligibleMales.length, eligibleFemales.length);

    for (let i = 0; i < pairsToForm; i++) {
      if (!this.rng.chance(this.config.marriageRate)) continue;

      const male = eligibleMales[i];
      const female = eligibleFemales[i];

      // Prevent incest: skip if they share a parent
      if (this.areRelated(male, female)) continue;

      // Cross-family marriage check
      if (!this.config.allowCrossFamilyMarriage && male.lastName !== female.lastName) continue;

      // Perform marriage
      male.spouseIds.push(female.id);
      female.spouseIds.push(male.id);

      // Surname change based on convention
      this.applySurnameConvention(male, female);

      this.marriages.push({ partnerId1: male.id, partnerId2: female.id, year });

      this.truthEntries.push({
        type: 'marriage',
        year,
        characterIds: [male.id, female.id],
        title: `Marriage of ${male.name} and ${female.name}`,
        description: `${male.name} and ${female.name} were married in ${year}.`,
        familyName: male.lastName,
        importance: 4,
      });
    }
  }

  private isCurrentlyMarried(nodeId: string): boolean {
    return this.marriages.some(m => m.partnerId1 === nodeId || m.partnerId2 === nodeId);
  }

  /**
   * Check whether two nodes are related (share a parent or are parent/child).
   * Walks up to 2 generations to catch siblings and first cousins.
   */
  private areRelated(a: GenealogyNode, b: GenealogyNode): boolean {
    // Direct parent-child
    if (a.parentIds.includes(b.id) || b.parentIds.includes(a.id)) return true;

    // Siblings (share at least one parent)
    for (const pid of a.parentIds) {
      if (b.parentIds.includes(pid)) return true;
    }

    // First cousins: check if parents are siblings
    for (const aPid of a.parentIds) {
      const aParent = this.nodes.get(aPid);
      if (!aParent) continue;
      for (const bPid of b.parentIds) {
        const bParent = this.nodes.get(bPid);
        if (!bParent) continue;
        // Check if aParent and bParent share a parent
        for (const agpId of aParent.parentIds) {
          if (bParent.parentIds.includes(agpId)) return true;
        }
      }
    }

    return false;
  }

  private applySurnameConvention(male: GenealogyNode, female: GenealogyNode): void {
    switch (this.config.surnameConvention) {
      case 'patrilineal':
        if (female.lastName !== male.lastName) {
          female.maidenName = female.lastName;
          female.lastName = male.lastName;
          female.name = `${female.firstName} ${female.lastName}`;
        }
        break;
      case 'matrilineal':
        if (male.lastName !== female.lastName) {
          male.lastName = female.lastName;
          male.name = `${male.firstName} ${male.lastName}`;
        }
        break;
      case 'hyphenated': {
        const hyphenated = `${male.lastName}-${female.lastName}`;
        female.maidenName = female.lastName;
        male.lastName = hyphenated;
        female.lastName = hyphenated;
        male.name = `${male.firstName} ${hyphenated}`;
        female.name = `${female.firstName} ${hyphenated}`;
        break;
      }
      case 'random':
        // Randomly pick one surname
        if (this.rng.chance(0.5)) {
          female.maidenName = female.lastName;
          female.lastName = male.lastName;
          female.name = `${female.firstName} ${female.lastName}`;
        } else {
          male.lastName = female.lastName;
          male.name = `${male.firstName} ${male.lastName}`;
        }
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Births
  // -----------------------------------------------------------------------

  private processBirths(year: number): void {
    for (const marriage of [...this.marriages]) {
      const p1 = this.nodes.get(marriage.partnerId1);
      const p2 = this.nodes.get(marriage.partnerId2);
      if (!p1 || !p2) continue;
      if (!p1.isAlive || !p2.isAlive) continue;

      // Identify the female partner for fertility check
      const female = p1.gender === 'female' ? p1 : p2;
      const male = p1.gender === 'male' ? p1 : p2;
      const femaleAge = year - female.birthYear;
      const maleAge = year - male.birthYear;

      // Fertility constraints
      if (femaleAge < this.config.minFertilityAge || femaleAge > this.config.maxFertilityAge) continue;
      if (maleAge < this.config.minFertilityAge) continue;

      // Max children check (count children of this specific couple)
      const coupleChildren = male.childrenIds.filter(cid => female.childrenIds.includes(cid));
      if (coupleChildren.length >= this.config.maxChildrenPerCouple) continue;

      // Reduce birth rate as couple already has more children
      const adjustedRate = this.config.birthRate * Math.max(0.3, 1 - coupleChildren.length * 0.1);

      if (!this.rng.chance(adjustedRate)) continue;

      // Create child
      const childGender: 'male' | 'female' = this.rng.chance(0.51) ? 'male' : 'female';
      const childFirstName = childGender === 'male'
        ? this.rng.pick(MALE_FIRST_NAMES)!
        : this.rng.pick(FEMALE_FIRST_NAMES)!;

      // Surname follows the convention set for the family
      const childLastName = this.getChildSurname(male, female);
      const parentGeneration = Math.max(male.generation, female.generation);

      const childId = this.generateId();
      const child: GenealogyNode = {
        id: childId,
        firstName: childFirstName,
        lastName: childLastName,
        name: `${childFirstName} ${childLastName}`,
        birthYear: year,
        deathYear: null,
        gender: childGender,
        generation: parentGeneration + 1,
        parentIds: [male.id, female.id],
        spouseIds: [],
        childrenIds: [],
        isAlive: true,
        metadata: {},
      };

      this.nodes.set(childId, child);
      male.childrenIds.push(childId);
      female.childrenIds.push(childId);

      this.truthEntries.push({
        type: 'birth',
        year,
        characterIds: [childId, male.id, female.id],
        title: `Birth of ${child.name}`,
        description: `${child.name} was born in ${year} to ${male.name} and ${female.name}.`,
        familyName: childLastName,
        importance: 3,
      });
    }
  }

  private getChildSurname(male: GenealogyNode, female: GenealogyNode): string {
    switch (this.config.surnameConvention) {
      case 'patrilineal':
        return male.lastName;
      case 'matrilineal':
        return female.lastName;
      case 'hyphenated':
        return male.lastName; // Already hyphenated from marriage
      case 'random':
        return this.rng.chance(0.5) ? male.lastName : female.lastName;
      default:
        return male.lastName;
    }
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private generateId(): string {
    return `gen-${this.nextId++}`;
  }

  /**
   * Trace a node's root surname by walking up the patrilineal (or configured)
   * line to generation 0. Falls back to the node's own lastName.
   */
  private getRootSurname(node: GenealogyNode): string {
    if (node.generation === 0) {
      // For founders who changed name on marriage, use maiden name if available
      return node.maidenName ?? node.lastName;
    }

    // Walk up through the parent line based on surname convention
    const targetParentGender = this.config.surnameConvention === 'matrilineal' ? 'female' : 'male';

    for (const pid of node.parentIds) {
      const parent = this.nodes.get(pid);
      if (parent && parent.gender === targetParentGender) {
        return this.getRootSurname(parent);
      }
    }

    // Fallback: try any parent
    for (const pid of node.parentIds) {
      const parent = this.nodes.get(pid);
      if (parent) {
        return this.getRootSurname(parent);
      }
    }

    return node.lastName;
  }
}

// ---------------------------------------------------------------------------
// Convenience factory
// ---------------------------------------------------------------------------

/**
 * Create a {@link GenealogyEngine} with sensible defaults.
 *
 * Only `startYear`, `endYear`, and `seed` are required.
 */
export function createGenealogyEngine(
  config: Partial<GenealogyConfig> & Pick<GenealogyConfig, 'startYear' | 'endYear' | 'seed'>,
): GenealogyEngine {
  return new GenealogyEngine(config);
}
