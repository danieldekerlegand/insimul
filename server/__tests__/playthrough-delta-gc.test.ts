/**
 * Tests for playthrough delta garbage collection and compaction.
 * Covers: compactDeltasByPlaythrough, deleteDeltasByPlaythrough,
 * PlaythroughOverlayStorage.compactDeltas, and cascade delete behavior.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  PlaythroughOverlayStorage,
  type DeltaEntry,
} from "../db/playthrough-overlay-storage";
import type { IStorage } from "../db/storage";

const PLAYTHROUGH_ID = "pt-gc-test";

// ---------- Helpers ----------

/**
 * Creates a mock storage with an in-memory delta store that supports
 * create, get, delete, and compact operations for testing.
 */
function makeMockStorageWithDeltaStore(overrides: Partial<IStorage> = {}): {
  storage: IStorage;
  deltaStore: any[];
} {
  const deltaStore: any[] = [];
  let nextId = 1;

  const storage = {
    getDeltasByPlaythrough: vi.fn().mockImplementation(async (ptId: string) => {
      return deltaStore
        .filter((d) => d.playthroughId === ptId)
        .sort((a: any, b: any) => a.timestep - b.timestep);
    }),

    createPlaythroughDelta: vi.fn().mockImplementation(async (delta: any) => {
      const saved = {
        ...delta,
        id: `delta-${nextId++}`,
        createdAt: new Date(),
        appliedAt: new Date(),
      };
      deltaStore.push(saved);
      return saved;
    }),

    deletePlaythroughDelta: vi.fn().mockImplementation(async (id: string) => {
      const idx = deltaStore.findIndex((d) => d.id === id);
      if (idx >= 0) {
        deltaStore.splice(idx, 1);
        return true;
      }
      return false;
    }),

    deleteDeltasByPlaythrough: vi.fn().mockImplementation(async (ptId: string) => {
      const before = deltaStore.length;
      const toRemove = deltaStore.filter((d) => d.playthroughId === ptId);
      for (const d of toRemove) {
        const idx = deltaStore.indexOf(d);
        if (idx >= 0) deltaStore.splice(idx, 1);
      }
      return before - deltaStore.length;
    }),

    compactDeltasByPlaythrough: vi.fn().mockImplementation(async (ptId: string) => {
      const matching = deltaStore.filter((d) => d.playthroughId === ptId);
      const before = matching.length;
      if (before <= 1) return { before, after: before };

      // Group by entityType:entityId
      const grouped = new Map<string, any[]>();
      for (const d of matching) {
        const key = `${d.entityType}:${d.entityId}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(d);
      }

      // Remove old deltas
      for (const d of matching) {
        const idx = deltaStore.indexOf(d);
        if (idx >= 0) deltaStore.splice(idx, 1);
      }

      // Create compacted deltas
      for (const [, deltas] of grouped) {
        let finalOp = deltas[0].operation;
        let mergedDelta: Record<string, any> = {};
        let mergedFull: Record<string, any> | null = null;
        let maxTimestep = 0;

        for (const d of deltas) {
          maxTimestep = Math.max(maxTimestep, d.timestep);
          if (d.operation === "delete") {
            finalOp = "delete";
            mergedDelta = {};
            mergedFull = null;
          } else if (d.operation === "create") {
            finalOp = "create";
            mergedFull = { ...(mergedFull || {}), ...(d.fullData || {}) };
            mergedDelta = {};
          } else if (d.operation === "update") {
            if (finalOp === "create" && mergedFull) {
              mergedFull = { ...mergedFull, ...(d.deltaData || {}) };
            } else if (finalOp !== "delete") {
              finalOp = "update";
              mergedDelta = { ...mergedDelta, ...(d.deltaData || {}) };
            }
          }
        }

        const compacted = {
          id: `delta-${nextId++}`,
          playthroughId: ptId,
          entityType: deltas[0].entityType,
          entityId: deltas[0].entityId,
          operation: finalOp,
          deltaData: Object.keys(mergedDelta).length > 0 ? mergedDelta : null,
          fullData: mergedFull,
          timestep: maxTimestep,
          description: `Compacted ${deltas.length} deltas`,
          tags: ["compacted"],
          createdAt: new Date(),
        };
        deltaStore.push(compacted);
      }

      const after = deltaStore.filter((d) => d.playthroughId === ptId).length;
      return { before, after };
    }),

    // Character methods for resolve tests
    getCharacter: vi.fn().mockImplementation(async (id: string) => ({
      id,
      name: "Base Character",
      worldId: "world-1",
      age: 30,
    })),
    getCharactersByWorld: vi.fn().mockResolvedValue([]),
    createCharacter: vi.fn(),
    updateCharacter: vi.fn(),
    deleteCharacter: vi.fn(),

    // Item methods
    getItem: vi.fn().mockImplementation(async (id: string) => ({
      id,
      name: "Base Item",
      worldId: "world-1",
    })),
    getItemsByWorld: vi.fn().mockResolvedValue([]),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),

    // Truth methods
    getTruth: vi.fn().mockResolvedValue(undefined),
    getTruthsByWorld: vi.fn().mockResolvedValue([]),
    createTruth: vi.fn(),
    updateTruth: vi.fn(),
    deleteTruth: vi.fn(),

    ...overrides,
  } as unknown as IStorage;

  return { storage, deltaStore };
}

// ---------- Tests ----------

describe("Playthrough Delta Garbage Collection", () => {
  describe("deleteDeltasByPlaythrough", () => {
    it("removes all deltas for a playthrough", async () => {
      const { storage, deltaStore } = makeMockStorageWithDeltaStore();

      // Create some deltas
      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "character",
        entityId: "char-1",
        operation: "update",
        deltaData: { name: "A" },
        timestep: 1,
      } as any);
      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "item",
        entityId: "item-1",
        operation: "create",
        fullData: { id: "item-1", name: "Sword" },
        timestep: 2,
      } as any);
      // Delta for different playthrough
      await storage.createPlaythroughDelta({
        playthroughId: "other-pt",
        entityType: "character",
        entityId: "char-2",
        operation: "update",
        deltaData: { name: "B" },
        timestep: 1,
      } as any);

      expect(deltaStore.length).toBe(3);

      const deleted = await storage.deleteDeltasByPlaythrough(PLAYTHROUGH_ID);
      expect(deleted).toBe(2);
      expect(deltaStore.length).toBe(1);
      expect(deltaStore[0].playthroughId).toBe("other-pt");
    });

    it("returns 0 when no deltas exist", async () => {
      const { storage } = makeMockStorageWithDeltaStore();
      const deleted = await storage.deleteDeltasByPlaythrough("nonexistent");
      expect(deleted).toBe(0);
    });
  });

  describe("compactDeltasByPlaythrough", () => {
    it("merges multiple updates to same entity into one", async () => {
      const { storage, deltaStore } = makeMockStorageWithDeltaStore();

      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "character",
        entityId: "char-1",
        operation: "update",
        deltaData: { name: "First" },
        timestep: 1,
      } as any);
      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "character",
        entityId: "char-1",
        operation: "update",
        deltaData: { age: 40 },
        timestep: 2,
      } as any);
      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "character",
        entityId: "char-1",
        operation: "update",
        deltaData: { name: "Final" },
        timestep: 3,
      } as any);

      const result = await storage.compactDeltasByPlaythrough(PLAYTHROUGH_ID);
      expect(result.before).toBe(3);
      expect(result.after).toBe(1);

      const remaining = deltaStore.filter((d) => d.playthroughId === PLAYTHROUGH_ID);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].deltaData).toEqual({ name: "Final", age: 40 });
      expect(remaining[0].timestep).toBe(3);
    });

    it("handles create followed by updates", async () => {
      const { storage, deltaStore } = makeMockStorageWithDeltaStore();

      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "item",
        entityId: "item-new",
        operation: "create",
        fullData: { id: "item-new", name: "Sword", damage: 10 },
        timestep: 1,
      } as any);
      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "item",
        entityId: "item-new",
        operation: "update",
        deltaData: { damage: 15 },
        timestep: 2,
      } as any);

      const result = await storage.compactDeltasByPlaythrough(PLAYTHROUGH_ID);
      expect(result.before).toBe(2);
      expect(result.after).toBe(1);

      const remaining = deltaStore.filter((d) => d.playthroughId === PLAYTHROUGH_ID);
      expect(remaining[0].operation).toBe("create");
      expect(remaining[0].fullData).toEqual({ id: "item-new", name: "Sword", damage: 15 });
    });

    it("handles updates followed by delete (collapses to delete)", async () => {
      const { storage, deltaStore } = makeMockStorageWithDeltaStore();

      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "character",
        entityId: "char-1",
        operation: "update",
        deltaData: { name: "Temp" },
        timestep: 1,
      } as any);
      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "character",
        entityId: "char-1",
        operation: "delete",
        timestep: 2,
      } as any);

      const result = await storage.compactDeltasByPlaythrough(PLAYTHROUGH_ID);
      expect(result.after).toBe(1);

      const remaining = deltaStore.filter((d) => d.playthroughId === PLAYTHROUGH_ID);
      expect(remaining[0].operation).toBe("delete");
    });

    it("preserves single deltas unchanged", async () => {
      const { storage, deltaStore } = makeMockStorageWithDeltaStore();

      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "character",
        entityId: "char-1",
        operation: "update",
        deltaData: { name: "Solo" },
        timestep: 1,
      } as any);

      const result = await storage.compactDeltasByPlaythrough(PLAYTHROUGH_ID);
      expect(result.before).toBe(1);
      expect(result.after).toBe(1);
    });

    it("handles empty delta set", async () => {
      const { storage } = makeMockStorageWithDeltaStore();
      const result = await storage.compactDeltasByPlaythrough(PLAYTHROUGH_ID);
      expect(result.before).toBe(0);
      expect(result.after).toBe(0);
    });

    it("compacts multiple entities independently", async () => {
      const { storage, deltaStore } = makeMockStorageWithDeltaStore();

      // 3 deltas for char-1
      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "character",
        entityId: "char-1",
        operation: "update",
        deltaData: { name: "A" },
        timestep: 1,
      } as any);
      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "character",
        entityId: "char-1",
        operation: "update",
        deltaData: { name: "B" },
        timestep: 2,
      } as any);
      // 2 deltas for item-1
      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "item",
        entityId: "item-1",
        operation: "update",
        deltaData: { quantity: 5 },
        timestep: 1,
      } as any);
      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "item",
        entityId: "item-1",
        operation: "update",
        deltaData: { quantity: 10 },
        timestep: 3,
      } as any);

      const result = await storage.compactDeltasByPlaythrough(PLAYTHROUGH_ID);
      expect(result.before).toBe(4);
      expect(result.after).toBe(2); // One per entity

      const remaining = deltaStore.filter((d) => d.playthroughId === PLAYTHROUGH_ID);
      const charDelta = remaining.find((d) => d.entityId === "char-1");
      expect(charDelta!.deltaData).toEqual({ name: "B" });

      const itemDelta = remaining.find((d) => d.entityId === "item-1");
      expect(itemDelta!.deltaData).toEqual({ quantity: 10 });
    });

    it("does not affect other playthroughs", async () => {
      const { storage, deltaStore } = makeMockStorageWithDeltaStore();

      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "character",
        entityId: "char-1",
        operation: "update",
        deltaData: { name: "A" },
        timestep: 1,
      } as any);
      await storage.createPlaythroughDelta({
        playthroughId: PLAYTHROUGH_ID,
        entityType: "character",
        entityId: "char-1",
        operation: "update",
        deltaData: { name: "B" },
        timestep: 2,
      } as any);
      await storage.createPlaythroughDelta({
        playthroughId: "other-pt",
        entityType: "character",
        entityId: "char-1",
        operation: "update",
        deltaData: { name: "Other" },
        timestep: 1,
      } as any);

      await storage.compactDeltasByPlaythrough(PLAYTHROUGH_ID);

      const otherDeltas = deltaStore.filter((d) => d.playthroughId === "other-pt");
      expect(otherDeltas).toHaveLength(1);
      expect(otherDeltas[0].deltaData).toEqual({ name: "Other" });
    });
  });

  describe("PlaythroughOverlayStorage.compactDeltas", () => {
    it("compacts deltas and rebuilds in-memory index", async () => {
      const { storage } = makeMockStorageWithDeltaStore();
      const overlay = new PlaythroughOverlayStorage(storage, PLAYTHROUGH_ID, 0);

      // Create multiple updates to same entity
      await overlay.interceptUpdate("character", "char-1", { name: "First" });
      await overlay.interceptUpdate("character", "char-1", { age: 40 });
      await overlay.interceptUpdate("character", "char-1", { name: "Final" });

      // Verify 3 persist calls
      expect(storage.createPlaythroughDelta).toHaveBeenCalledTimes(3);

      // Compact
      const result = await overlay.compactDeltas();
      expect(result.before).toBe(3);
      expect(result.after).toBe(1);

      // Verify in-memory index is rebuilt correctly
      const charDeltas = overlay.getDeltasForType("character");
      expect(charDeltas).toHaveLength(1);
      expect(charDeltas[0].entityId).toBe("char-1");
      // After compaction the merged deltaData should have both name and age
      expect(charDeltas[0].deltaData).toEqual({ name: "Final", age: 40 });
    });

    it("preserves entity resolution after compaction", async () => {
      const { storage } = makeMockStorageWithDeltaStore();
      const overlay = new PlaythroughOverlayStorage(storage, PLAYTHROUGH_ID, 0);

      await overlay.interceptUpdate("character", "char-1", { name: "Modified" });
      await overlay.interceptUpdate("character", "char-1", { age: 50 });

      // Resolve before compaction
      const beforeCompact = await overlay.resolveEntity("character", "char-1");

      // Compact
      await overlay.compactDeltas();

      // Resolve after compaction — should produce same result
      const afterCompact = await overlay.resolveEntity("character", "char-1");
      expect(afterCompact).toEqual(beforeCompact);
    });

    it("handles mixed operations across entity types", async () => {
      const { storage } = makeMockStorageWithDeltaStore();
      const overlay = new PlaythroughOverlayStorage(storage, PLAYTHROUGH_ID, 0);

      await overlay.interceptCreate("item", { id: "new-item", name: "Potion" });
      await overlay.interceptUpdate("character", "char-1", { name: "Hero" });
      await overlay.interceptDelete("truth", "truth-1");

      const result = await overlay.compactDeltas();
      // Each entity has only 1 delta, so no reduction
      expect(result.before).toBe(3);
      expect(result.after).toBe(3);

      expect(overlay.getDeltaCount()).toBe(3);
      expect(overlay.isDeleted("truth", "truth-1")).toBe(true);
      expect(overlay.isPlaythroughCreated("item", "new-item")).toBe(true);
    });
  });
});
