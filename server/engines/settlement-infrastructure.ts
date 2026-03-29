/**
 * Settlement Infrastructure Development (US-065)
 *
 * Manages infrastructure upgrades as settlements grow. Each settlement tier
 * unlocks new infrastructure categories and improvements. The engine tracks
 * which infrastructure a settlement has built and emits events when new
 * infrastructure is unlocked or upgraded.
 *
 * Infrastructure categories:
 *   water    — Wells, aqueducts, reservoirs
 *   transport — Paths, roads, bridges
 *   civic    — Town hall, courthouse, fire station
 *   commerce — Market stalls, trading post, bank
 *   defense  — Watch tower, walls, garrison
 *   sanitation — Waste pits, sewers, public baths
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Settlement tiers (mirrors settlement-growth.ts). */
export type SettlementTier = 'dwelling' | 'roadhouse' | 'homestead' | 'hamlet' | 'village' | 'town' | 'city' | 'metropolis';

/** Infrastructure categories. */
export type InfrastructureCategory =
  | 'water'
  | 'transport'
  | 'civic'
  | 'commerce'
  | 'defense'
  | 'sanitation';

/** A single infrastructure item definition. */
export interface InfrastructureDefinition {
  id: string;
  name: string;
  category: InfrastructureCategory;
  /** Minimum tier required to build this infrastructure. */
  minTier: SettlementTier;
  /** Optional: replaces a previous infrastructure item (upgrade chain). */
  replacesId: string | null;
  /** Capacity or effectiveness level (1-5). */
  level: number;
  /** Description of what this infrastructure provides. */
  description: string;
}

/** A built infrastructure instance in a settlement. */
export interface BuiltInfrastructure {
  definitionId: string;
  builtYear: number;
  level: number;
}

/** Event emitted when infrastructure changes. */
export interface InfrastructureEvent {
  type: 'infrastructure_built' | 'infrastructure_upgraded' | 'infrastructure_unlocked';
  year: number;
  description: string;
  importance: number;
  metadata: Record<string, unknown>;
}

/** State tracked per settlement. */
export interface InfrastructureState {
  settlementId: string;
  tier: SettlementTier;
  built: BuiltInfrastructure[];
  /** Infrastructure IDs that have been unlocked but not yet built. */
  unlocked: string[];
}

// ---------------------------------------------------------------------------
// Infrastructure definitions
// ---------------------------------------------------------------------------

const TIER_ORDER: SettlementTier[] = ['hamlet', 'village', 'town', 'city', 'metropolis'];

function tierIndex(tier: SettlementTier): number {
  return TIER_ORDER.indexOf(tier);
}

/** All infrastructure definitions, ordered by tier progression. */
export const INFRASTRUCTURE_DEFINITIONS: InfrastructureDefinition[] = [
  // Water
  { id: 'well', name: 'Well', category: 'water', minTier: 'hamlet', replacesId: null, level: 1, description: 'Basic water source for the settlement' },
  { id: 'cistern', name: 'Cistern', category: 'water', minTier: 'village', replacesId: 'well', level: 2, description: 'Rainwater collection system' },
  { id: 'aqueduct', name: 'Aqueduct', category: 'water', minTier: 'town', replacesId: 'cistern', level: 3, description: 'Channels water from distant sources' },
  { id: 'waterworks', name: 'Waterworks', category: 'water', minTier: 'city', replacesId: 'aqueduct', level: 4, description: 'Centralized water treatment and distribution' },
  { id: 'reservoir', name: 'Reservoir', category: 'water', minTier: 'metropolis', replacesId: 'waterworks', level: 5, description: 'Large-scale water storage and management' },

  // Transport
  { id: 'dirt_path', name: 'Dirt Path', category: 'transport', minTier: 'hamlet', replacesId: null, level: 1, description: 'Basic foot paths between buildings' },
  { id: 'gravel_road', name: 'Gravel Road', category: 'transport', minTier: 'village', replacesId: 'dirt_path', level: 2, description: 'Improved roads with gravel surface' },
  { id: 'paved_road', name: 'Paved Road', category: 'transport', minTier: 'town', replacesId: 'gravel_road', level: 3, description: 'Stone-paved main roads' },
  { id: 'bridge', name: 'Bridge', category: 'transport', minTier: 'town', replacesId: null, level: 3, description: 'Spans rivers and ravines' },
  { id: 'highway', name: 'Highway', category: 'transport', minTier: 'city', replacesId: 'paved_road', level: 4, description: 'Wide arterial roads connecting districts' },

  // Civic
  { id: 'meeting_hall', name: 'Meeting Hall', category: 'civic', minTier: 'hamlet', replacesId: null, level: 1, description: 'Communal gathering place' },
  { id: 'town_hall', name: 'Town Hall', category: 'civic', minTier: 'village', replacesId: 'meeting_hall', level: 2, description: 'Administrative center for the settlement' },
  { id: 'courthouse', name: 'Courthouse', category: 'civic', minTier: 'town', replacesId: null, level: 3, description: 'Center for law and justice' },
  { id: 'city_hall', name: 'City Hall', category: 'civic', minTier: 'city', replacesId: 'town_hall', level: 4, description: 'Large administrative complex' },
  { id: 'fire_station', name: 'Fire Station', category: 'civic', minTier: 'city', replacesId: null, level: 4, description: 'Firefighting services' },

  // Commerce
  { id: 'market_stall', name: 'Market Stall', category: 'commerce', minTier: 'hamlet', replacesId: null, level: 1, description: 'Open-air trading spot' },
  { id: 'trading_post', name: 'Trading Post', category: 'commerce', minTier: 'village', replacesId: 'market_stall', level: 2, description: 'Permanent trade building' },
  { id: 'marketplace', name: 'Marketplace', category: 'commerce', minTier: 'town', replacesId: 'trading_post', level: 3, description: 'Dedicated market square with multiple vendors' },
  { id: 'bank', name: 'Bank', category: 'commerce', minTier: 'city', replacesId: null, level: 4, description: 'Financial institution for loans and deposits' },
  { id: 'stock_exchange', name: 'Stock Exchange', category: 'commerce', minTier: 'metropolis', replacesId: 'bank', level: 5, description: 'Securities trading hub' },

  // Defense
  { id: 'watchtower', name: 'Watchtower', category: 'defense', minTier: 'village', replacesId: null, level: 2, description: 'Lookout post for early warning' },
  { id: 'palisade', name: 'Palisade', category: 'defense', minTier: 'village', replacesId: null, level: 2, description: 'Wooden perimeter fence' },
  { id: 'stone_wall', name: 'Stone Wall', category: 'defense', minTier: 'town', replacesId: 'palisade', level: 3, description: 'Fortified stone perimeter wall' },
  { id: 'garrison', name: 'Garrison', category: 'defense', minTier: 'city', replacesId: null, level: 4, description: 'Military barracks and armory' },
  { id: 'fortress', name: 'Fortress', category: 'defense', minTier: 'metropolis', replacesId: 'garrison', level: 5, description: 'Major defensive fortification' },

  // Sanitation
  { id: 'waste_pit', name: 'Waste Pit', category: 'sanitation', minTier: 'hamlet', replacesId: null, level: 1, description: 'Basic waste disposal' },
  { id: 'latrine', name: 'Public Latrine', category: 'sanitation', minTier: 'village', replacesId: 'waste_pit', level: 2, description: 'Communal sanitation facility' },
  { id: 'sewer', name: 'Sewer System', category: 'sanitation', minTier: 'town', replacesId: 'latrine', level: 3, description: 'Underground waste removal' },
  { id: 'public_baths', name: 'Public Baths', category: 'sanitation', minTier: 'city', replacesId: null, level: 4, description: 'Communal bathing and hygiene' },
  { id: 'water_treatment', name: 'Water Treatment', category: 'sanitation', minTier: 'metropolis', replacesId: 'sewer', level: 5, description: 'Waste water purification' },
];

/** Index definitions by ID for fast lookup. */
const DEFINITIONS_BY_ID = new Map<string, InfrastructureDefinition>(
  INFRASTRUCTURE_DEFINITIONS.map(d => [d.id, d]),
);

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

/**
 * Get all infrastructure definitions available at or below a given tier.
 */
export function getAvailableInfrastructure(tier: SettlementTier): InfrastructureDefinition[] {
  const maxIndex = tierIndex(tier);
  return INFRASTRUCTURE_DEFINITIONS.filter(d => tierIndex(d.minTier) <= maxIndex);
}

/**
 * Get infrastructure definitions newly unlocked at a specific tier
 * (not available at the previous tier).
 */
export function getNewlyUnlockedInfrastructure(tier: SettlementTier): InfrastructureDefinition[] {
  return INFRASTRUCTURE_DEFINITIONS.filter(d => d.minTier === tier);
}

/**
 * Get the definition for an infrastructure ID.
 */
export function getInfrastructureDefinition(id: string): InfrastructureDefinition | undefined {
  return DEFINITIONS_BY_ID.get(id);
}

/**
 * Compute the overall infrastructure level for a settlement (1-5)
 * based on the average level of built infrastructure.
 */
export function computeInfrastructureLevel(built: BuiltInfrastructure[]): number {
  if (built.length === 0) return 1;
  const sum = built.reduce((acc, b) => acc + b.level, 0);
  return Math.round(sum / built.length);
}

/**
 * Settlement Infrastructure Engine
 *
 * Tracks infrastructure state and auto-builds infrastructure when the
 * settlement tier changes. Infrastructure follows upgrade chains: when a
 * higher-tier version is built, it replaces the previous version.
 */
export class SettlementInfrastructureEngine {
  private state: InfrastructureState;

  constructor(settlementId: string, initialTier: SettlementTier = 'hamlet') {
    this.state = {
      settlementId,
      tier: initialTier,
      built: [],
      unlocked: [],
    };

    // Auto-build starting infrastructure for the initial tier
    this.buildInitialInfrastructure(initialTier, 0);
  }

  /** Get the current state (read-only snapshot). */
  getState(): Readonly<InfrastructureState> {
    return this.state;
  }

  /** Get all built infrastructure. */
  getBuilt(): readonly BuiltInfrastructure[] {
    return this.state.built;
  }

  /** Get the current overall infrastructure level. */
  getLevel(): number {
    return computeInfrastructureLevel(this.state.built);
  }

  /** Check if a specific infrastructure is built. */
  hasInfrastructure(definitionId: string): boolean {
    return this.state.built.some(b => b.definitionId === definitionId);
  }

  /** Get built infrastructure by category. */
  getByCategory(category: InfrastructureCategory): BuiltInfrastructure[] {
    return this.state.built.filter(b => {
      const def = DEFINITIONS_BY_ID.get(b.definitionId);
      return def?.category === category;
    });
  }

  /**
   * Update the engine when the settlement tier changes.
   * Automatically builds new infrastructure and upgrades existing ones.
   *
   * @returns Array of infrastructure events
   */
  onTierChange(newTier: SettlementTier, year: number): InfrastructureEvent[] {
    const oldTier = this.state.tier;
    if (newTier === oldTier) return [];

    const grew = tierIndex(newTier) > tierIndex(oldTier);
    this.state.tier = newTier;

    if (!grew) return [];

    return this.upgradeInfrastructure(newTier, year);
  }

  /**
   * Serialize the state for persistence.
   */
  serialize(): InfrastructureState {
    return { ...this.state, built: [...this.state.built], unlocked: [...this.state.unlocked] };
  }

  /**
   * Restore from serialized state.
   */
  deserialize(data: InfrastructureState): void {
    this.state = { ...data, built: [...data.built], unlocked: [...data.unlocked] };
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  /**
   * Build all infrastructure available at the initial tier.
   */
  private buildInitialInfrastructure(tier: SettlementTier, year: number): void {
    // Build one item per category upgrade chain at the highest available level for this tier
    const available = getAvailableInfrastructure(tier);
    const bestByChain = this.selectBestPerChain(available);

    for (const def of bestByChain) {
      this.state.built.push({
        definitionId: def.id,
        builtYear: year,
        level: def.level,
      });
    }
  }

  /**
   * Upgrade infrastructure when tier grows. Builds newly unlocked items
   * and replaces lower-tier items in upgrade chains.
   */
  private upgradeInfrastructure(newTier: SettlementTier, year: number): InfrastructureEvent[] {
    const events: InfrastructureEvent[] = [];
    const newlyUnlocked = getNewlyUnlockedInfrastructure(newTier);

    for (const def of newlyUnlocked) {
      if (def.replacesId && this.hasInfrastructure(def.replacesId)) {
        // Upgrade: replace old with new
        this.state.built = this.state.built.filter(b => b.definitionId !== def.replacesId);
        this.state.built.push({ definitionId: def.id, builtYear: year, level: def.level });

        const oldDef = DEFINITIONS_BY_ID.get(def.replacesId);
        events.push({
          type: 'infrastructure_upgraded',
          year,
          description: `${oldDef?.name ?? def.replacesId} upgraded to ${def.name}.`,
          importance: def.level >= 4 ? 6 : 4,
          metadata: {
            settlementId: this.state.settlementId,
            oldInfrastructureId: def.replacesId,
            newInfrastructureId: def.id,
            category: def.category,
            level: def.level,
          },
        });
      } else if (!def.replacesId) {
        // New independent infrastructure
        if (!this.hasInfrastructure(def.id)) {
          this.state.built.push({ definitionId: def.id, builtYear: year, level: def.level });
          events.push({
            type: 'infrastructure_built',
            year,
            description: `A new ${def.name} has been constructed.`,
            importance: def.level >= 4 ? 6 : 4,
            metadata: {
              settlementId: this.state.settlementId,
              infrastructureId: def.id,
              category: def.category,
              level: def.level,
            },
          });
        }
      } else {
        // Replaces something we don't have — check if we have an earlier ancestor
        const ancestor = this.findBuiltAncestor(def);
        if (ancestor) {
          this.state.built = this.state.built.filter(b => b.definitionId !== ancestor.definitionId);
          this.state.built.push({ definitionId: def.id, builtYear: year, level: def.level });
          const oldDef = DEFINITIONS_BY_ID.get(ancestor.definitionId);
          events.push({
            type: 'infrastructure_upgraded',
            year,
            description: `${oldDef?.name ?? ancestor.definitionId} upgraded to ${def.name}.`,
            importance: def.level >= 4 ? 6 : 4,
            metadata: {
              settlementId: this.state.settlementId,
              oldInfrastructureId: ancestor.definitionId,
              newInfrastructureId: def.id,
              category: def.category,
              level: def.level,
            },
          });
        } else {
          // No ancestor built — build fresh
          this.state.built.push({ definitionId: def.id, builtYear: year, level: def.level });
          events.push({
            type: 'infrastructure_built',
            year,
            description: `A new ${def.name} has been constructed.`,
            importance: def.level >= 4 ? 6 : 4,
            metadata: {
              settlementId: this.state.settlementId,
              infrastructureId: def.id,
              category: def.category,
              level: def.level,
            },
          });
        }
      }
    }

    if (events.length > 0) {
      events.unshift({
        type: 'infrastructure_unlocked',
        year,
        description: `Settlement infrastructure upgraded to ${newTier} level.`,
        importance: 5,
        metadata: {
          settlementId: this.state.settlementId,
          tier: newTier,
          totalBuilt: this.state.built.length,
          level: this.getLevel(),
        },
      });
    }

    return events;
  }

  /**
   * Walk up the replacesId chain to find a built ancestor.
   */
  private findBuiltAncestor(def: InfrastructureDefinition): BuiltInfrastructure | null {
    let currentId = def.replacesId;
    while (currentId) {
      const built = this.state.built.find(b => b.definitionId === currentId);
      if (built) return built;
      const parentDef = DEFINITIONS_BY_ID.get(currentId);
      currentId = parentDef?.replacesId ?? null;
    }
    return null;
  }

  /**
   * From a list of available definitions, select the highest-level item
   * per upgrade chain (identified by tracing replacesId to the root).
   */
  private selectBestPerChain(available: InfrastructureDefinition[]): InfrastructureDefinition[] {
    // Group by chain root
    const chains = new Map<string, InfrastructureDefinition>();

    for (const def of available) {
      const root = this.getChainRoot(def);
      const key = `${def.category}:${root}`;
      const existing = chains.get(key);
      if (!existing || def.level > existing.level) {
        chains.set(key, def);
      }
    }

    return Array.from(chains.values());
  }

  /**
   * Get the root ID of an upgrade chain.
   */
  private getChainRoot(def: InfrastructureDefinition): string {
    let current = def;
    while (current.replacesId) {
      const parent = DEFINITIONS_BY_ID.get(current.replacesId);
      if (!parent) break;
      current = parent;
    }
    return current.id;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a SettlementInfrastructureEngine for a settlement.
 */
export function createSettlementInfrastructureEngine(
  settlementId: string,
  initialTier: SettlementTier = 'hamlet',
): SettlementInfrastructureEngine {
  return new SettlementInfrastructureEngine(settlementId, initialTier);
}
