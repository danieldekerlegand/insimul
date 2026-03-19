/**
 * PlaythroughOverlayStorage — intercepts world-mutating writes during a playthrough.
 *
 * Wraps an IStorage instance and redirects create/update/delete operations on
 * world entities into PlaythroughDelta records, leaving the base world untouched.
 * Reads merge base world data with playthrough deltas (overlay-on-read).
 */

import { randomUUID } from "crypto";
import type { IStorage } from "./storage";
import type {
  PlaythroughDelta,
  InsertPlaythroughDelta,
} from "@shared/schema";

/** Entity types that belong to the world and should be overlaid during playthrough */
export const OVERLAID_ENTITY_TYPES = [
  "character",
  "item",
  "truth",
  "quest",
  "business",
  "lot",
  "residence",
  "occupation",
  "rule",
  "action",
  "grammar",
  "settlement",
  "simulation",
] as const;

export type OverlaidEntityType = (typeof OVERLAID_ENTITY_TYPES)[number];

/**
 * In-memory delta index keyed by entityType -> entityId -> latest delta.
 * For updates, deltaData is merged; for deletes, a tombstone is stored.
 */
export interface DeltaEntry {
  operation: "create" | "update" | "delete";
  entityId: string;
  entityType: OverlaidEntityType;
  deltaData?: Record<string, any>;
  fullData?: Record<string, any>;
}

/**
 * Maps method-name prefixes to entity types so the proxy can auto-detect
 * which entity type a storage method operates on.
 */
const METHOD_ENTITY_MAP: Record<string, OverlaidEntityType> = {
  Character: "character",
  Item: "item",
  Truth: "truth",
  Quest: "quest",
  Business: "business",
  Lot: "lot",
  Residence: "residence",
  Occupation: "occupation",
  Rule: "rule",
  Action: "action",
  Grammar: "grammar",
  Settlement: "settlement",
  Simulation: "simulation",
};

/** Detect entity type from a storage method name like "createCharacter" */
function entityTypeFromMethod(method: string): OverlaidEntityType | null {
  for (const [suffix, type] of Object.entries(METHOD_ENTITY_MAP)) {
    if (method.endsWith(suffix) || method.includes(suffix + "s")) {
      return type;
    }
  }
  return null;
}

/** Detect operation kind from method name prefix */
function operationFromMethod(method: string): "create" | "update" | "delete" | "get" | null {
  if (method.startsWith("create")) return "create";
  if (method.startsWith("update")) return "update";
  if (method.startsWith("delete")) return "delete";
  if (method.startsWith("get")) return "get";
  return null;
}

export class PlaythroughOverlayStorage {
  private deltaIndex: Map<string, Map<string, DeltaEntry>> = new Map();
  private playthroughId: string;
  private currentTimestep: number;
  private baseStorage: IStorage;
  private initialized = false;

  constructor(baseStorage: IStorage, playthroughId: string, currentTimestep: number = 0) {
    this.baseStorage = baseStorage;
    this.playthroughId = playthroughId;
    this.currentTimestep = currentTimestep;

    for (const type of OVERLAID_ENTITY_TYPES) {
      this.deltaIndex.set(type, new Map());
    }
  }

  /** Load existing deltas from the database into the in-memory index */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    const deltas = await this.baseStorage.getDeltasByPlaythrough(this.playthroughId);
    for (const delta of deltas) {
      const entityType = delta.entityType as OverlaidEntityType;
      if (!this.deltaIndex.has(entityType)) continue;
      const typeMap = this.deltaIndex.get(entityType)!;
      const existing = typeMap.get(delta.entityId);

      if (delta.operation === "delete") {
        typeMap.set(delta.entityId, {
          operation: "delete",
          entityId: delta.entityId,
          entityType,
        });
      } else if (delta.operation === "create") {
        typeMap.set(delta.entityId, {
          operation: "create",
          entityId: delta.entityId,
          entityType,
          fullData: (delta.fullData as Record<string, any>) || {},
        });
      } else if (delta.operation === "update") {
        const merged = {
          ...(existing?.deltaData || {}),
          ...((delta.deltaData as Record<string, any>) || {}),
        };
        typeMap.set(delta.entityId, {
          operation: existing?.operation === "create" ? "create" : "update",
          entityId: delta.entityId,
          entityType,
          deltaData: merged,
          fullData: existing?.fullData
            ? { ...existing.fullData, ...merged }
            : undefined,
        });
      }
    }
    this.initialized = true;
  }

  /** Get the current delta index (for inspection/testing) */
  getDeltaIndex(): Map<string, Map<string, DeltaEntry>> {
    return this.deltaIndex;
  }

  /** Update the current timestep */
  setTimestep(timestep: number): void {
    this.currentTimestep = timestep;
  }

  /** Record a create operation — stores the full entity as a delta */
  async interceptCreate<T extends Record<string, any>>(
    entityType: OverlaidEntityType,
    data: T,
  ): Promise<T & { id: string }> {
    const id = (data as any).id || randomUUID();
    const fullData = { ...data, id };

    const typeMap = this.deltaIndex.get(entityType)!;
    typeMap.set(id, {
      operation: "create",
      entityId: id,
      entityType,
      fullData,
    });

    await this.persistDelta({
      playthroughId: this.playthroughId,
      entityType,
      entityId: id,
      operation: "create",
      fullData,
      timestep: this.currentTimestep,
      description: `Created ${entityType} ${id}`,
    });

    return fullData as T & { id: string };
  }

  /** Record an update operation — stores only the changed fields */
  async interceptUpdate<T extends Record<string, any>>(
    entityType: OverlaidEntityType,
    entityId: string,
    changes: Partial<T>,
  ): Promise<(T & { id: string }) | undefined> {
    const typeMap = this.deltaIndex.get(entityType)!;
    const existing = typeMap.get(entityId);

    if (existing?.operation === "delete") {
      return undefined; // Entity was deleted in this playthrough
    }

    if (existing?.operation === "create") {
      // Update the full data for a playthrough-created entity
      const updated = { ...existing.fullData, ...changes };
      typeMap.set(entityId, {
        ...existing,
        fullData: updated,
      });
    } else {
      // Accumulate delta for a base-world entity
      const merged = { ...(existing?.deltaData || {}), ...changes };
      typeMap.set(entityId, {
        operation: "update",
        entityId,
        entityType,
        deltaData: merged,
      });
    }

    await this.persistDelta({
      playthroughId: this.playthroughId,
      entityType,
      entityId,
      operation: "update",
      deltaData: changes as Record<string, any>,
      timestep: this.currentTimestep,
      description: `Updated ${entityType} ${entityId}`,
    });

    // Return the merged entity
    return this.resolveEntity(entityType, entityId);
  }

  /** Record a delete operation — stores a tombstone */
  async interceptDelete(
    entityType: OverlaidEntityType,
    entityId: string,
  ): Promise<boolean> {
    const typeMap = this.deltaIndex.get(entityType)!;
    typeMap.set(entityId, {
      operation: "delete",
      entityId,
      entityType,
    });

    await this.persistDelta({
      playthroughId: this.playthroughId,
      entityType,
      entityId,
      operation: "delete",
      timestep: this.currentTimestep,
      description: `Deleted ${entityType} ${entityId}`,
    });

    return true;
  }

  /** Resolve a single entity by merging base data with overlay deltas */
  async resolveEntity<T extends Record<string, any>>(
    entityType: OverlaidEntityType,
    entityId: string,
  ): Promise<(T & { id: string }) | undefined> {
    const typeMap = this.deltaIndex.get(entityType);
    const delta = typeMap?.get(entityId);

    if (delta?.operation === "delete") {
      return undefined;
    }

    if (delta?.operation === "create") {
      return delta.fullData as T & { id: string };
    }

    // Fetch from base storage
    const getter = `get${capitalize(entityType)}` as keyof IStorage;
    const baseEntity = await (this.baseStorage[getter] as Function)(entityId) as T | undefined;

    if (!baseEntity) return undefined;

    if (delta?.operation === "update" && delta.deltaData) {
      return { ...baseEntity, ...delta.deltaData } as T & { id: string };
    }

    return baseEntity as T & { id: string };
  }

  /** Resolve a list of entities, applying overlay (creates, updates, tombstones) */
  async resolveEntityList<T extends Record<string, any>>(
    entityType: OverlaidEntityType,
    baseEntities: T[],
  ): Promise<T[]> {
    const typeMap = this.deltaIndex.get(entityType);
    if (!typeMap || typeMap.size === 0) return baseEntities;

    const result: T[] = [];
    const seenIds = new Set<string>();

    // Process base entities (apply updates and filter deletes)
    for (const entity of baseEntities) {
      const id = (entity as any).id;
      seenIds.add(id);
      const delta = typeMap.get(id);

      if (delta?.operation === "delete") continue;

      if (delta?.operation === "update" && delta.deltaData) {
        result.push({ ...entity, ...delta.deltaData } as T);
      } else {
        result.push(entity);
      }
    }

    // Add playthrough-created entities
    for (const [id, delta] of typeMap) {
      if (delta.operation === "create" && !seenIds.has(id)) {
        result.push(delta.fullData as T);
      }
    }

    return result;
  }

  /** Check if an entity has been deleted in this playthrough */
  isDeleted(entityType: OverlaidEntityType, entityId: string): boolean {
    return this.deltaIndex.get(entityType)?.get(entityId)?.operation === "delete";
  }

  /** Check if an entity was created in this playthrough */
  isPlaythroughCreated(entityType: OverlaidEntityType, entityId: string): boolean {
    return this.deltaIndex.get(entityType)?.get(entityId)?.operation === "create";
  }

  /** Get all deltas for a given entity type */
  getDeltasForType(entityType: OverlaidEntityType): DeltaEntry[] {
    const typeMap = this.deltaIndex.get(entityType);
    if (!typeMap) return [];
    return Array.from(typeMap.values());
  }

  /** Get total count of deltas across all types */
  getDeltaCount(): number {
    let count = 0;
    for (const typeMap of this.deltaIndex.values()) {
      count += typeMap.size;
    }
    return count;
  }

  /**
   * Create a Proxy-wrapped IStorage that automatically intercepts
   * world-mutating methods and delegates everything else to base storage.
   */
  createProxy(): IStorage {
    const self = this;
    const base = this.baseStorage;

    return new Proxy(base, {
      get(target, prop: string) {
        const op = operationFromMethod(prop);
        const entityType = entityTypeFromMethod(prop);

        // Only intercept overlaid entity types
        if (!op || !entityType || !OVERLAID_ENTITY_TYPES.includes(entityType)) {
          return (target as any)[prop];
        }

        if (op === "create") {
          return async (data: any) => {
            return self.interceptCreate(entityType, data);
          };
        }

        if (op === "update") {
          return async (id: string, changes: any) => {
            return self.interceptUpdate(entityType, id, changes);
          };
        }

        if (op === "delete") {
          return async (id: string) => {
            return self.interceptDelete(entityType, id);
          };
        }

        if (op === "get") {
          // Single entity getter (e.g., getCharacter)
          const isSingleGetter = prop === `get${capitalize(entityType)}`;
          if (isSingleGetter) {
            return async (id: string) => {
              return self.resolveEntity(entityType, id);
            };
          }

          // List getters (e.g., getCharactersByWorld, getItemsByWorld)
          return async (...args: any[]) => {
            const baseResult = await (target as any)[prop](...args);
            if (Array.isArray(baseResult)) {
              return self.resolveEntityList(entityType, baseResult);
            }
            return baseResult;
          };
        }

        return (target as any)[prop];
      },
    });
  }

  /**
   * Compact all persisted deltas for this playthrough by merging
   * multiple deltas per entity into a single record. Also rebuilds
   * the in-memory index from the compacted result.
   */
  async compactDeltas(): Promise<{ before: number; after: number }> {
    const result = await this.baseStorage.compactDeltasByPlaythrough(this.playthroughId);

    // Rebuild in-memory index from compacted DB state
    for (const type of OVERLAID_ENTITY_TYPES) {
      this.deltaIndex.set(type, new Map());
    }
    const deltas = await this.baseStorage.getDeltasByPlaythrough(this.playthroughId);
    for (const delta of deltas) {
      const entityType = delta.entityType as OverlaidEntityType;
      if (!this.deltaIndex.has(entityType)) continue;
      const typeMap = this.deltaIndex.get(entityType)!;
      typeMap.set(delta.entityId, {
        operation: delta.operation as DeltaEntry["operation"],
        entityId: delta.entityId,
        entityType,
        deltaData: (delta.deltaData as Record<string, any>) || undefined,
        fullData: (delta.fullData as Record<string, any>) || undefined,
      });
    }

    return result;
  }

  private async persistDelta(
    delta: Omit<InsertPlaythroughDelta, "id" | "createdAt" | "appliedAt" | "tags">,
  ): Promise<PlaythroughDelta> {
    return this.baseStorage.createPlaythroughDelta({
      ...delta,
      tags: [],
    } as InsertPlaythroughDelta);
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
