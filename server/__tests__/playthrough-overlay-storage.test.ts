/**
 * Tests for PlaythroughOverlayStorage — the copy-on-write overlay that intercepts
 * world-mutating writes during a playthrough and stores them as deltas.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  PlaythroughOverlayStorage,
  OVERLAID_ENTITY_TYPES,
  type DeltaEntry,
} from "../db/playthrough-overlay-storage";
import type { IStorage } from "../db/storage";

// ---------- Helpers ----------

function makeMockStorage(overrides: Partial<IStorage> = {}): IStorage {
  const deltas: any[] = [];

  return {
    // Playthrough delta methods (always needed)
    getDeltasByPlaythrough: vi.fn().mockResolvedValue([]),
    createPlaythroughDelta: vi.fn().mockImplementation(async (delta: any) => {
      const saved = { ...delta, id: `delta-${deltas.length}`, createdAt: new Date() };
      deltas.push(saved);
      return saved;
    }),

    // Character methods
    getCharacter: vi.fn().mockImplementation(async (id: string) => ({
      id,
      name: "Base Character",
      worldId: "world-1",
      age: 30,
    })),
    getCharactersByWorld: vi.fn().mockResolvedValue([
      { id: "char-1", name: "Alice", worldId: "world-1", age: 25 },
      { id: "char-2", name: "Bob", worldId: "world-1", age: 35 },
    ]),
    createCharacter: vi.fn(),
    updateCharacter: vi.fn(),
    deleteCharacter: vi.fn(),

    // Item methods
    getItem: vi.fn().mockImplementation(async (id: string) => ({
      id,
      name: "Base Item",
      worldId: "world-1",
      quantity: 1,
    })),
    getItemsByWorld: vi.fn().mockResolvedValue([
      { id: "item-1", name: "Sword", worldId: "world-1", quantity: 1 },
    ]),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),

    // Truth methods
    getTruth: vi.fn().mockImplementation(async (id: string) => ({
      id,
      subject: "test",
      worldId: "world-1",
    })),
    getTruthsByWorld: vi.fn().mockResolvedValue([]),
    createTruth: vi.fn(),
    updateTruth: vi.fn(),
    deleteTruth: vi.fn(),

    // Quest methods
    getQuest: vi.fn().mockImplementation(async (id: string) => ({
      id,
      name: "Base Quest",
      worldId: "world-1",
    })),
    getQuestsByWorld: vi.fn().mockResolvedValue([]),
    createQuest: vi.fn(),
    updateQuest: vi.fn(),
    deleteQuest: vi.fn(),

    // Business methods
    getBusiness: vi.fn().mockImplementation(async (id: string) => ({
      id,
      name: "Base Business",
    })),
    getBusinessesByWorld: vi.fn().mockResolvedValue([]),
    createBusiness: vi.fn(),
    updateBusiness: vi.fn(),
    deleteBusiness: vi.fn(),

    // User methods (should NOT be intercepted)
    getUser: vi.fn().mockImplementation(async (id: string) => ({
      id,
      username: "testuser",
    })),
    createUser: vi.fn(),
    updateUser: vi.fn(),

    // World methods (should NOT be intercepted — worlds are containers, not mutable game entities)
    getWorld: vi.fn().mockImplementation(async (id: string) => ({
      id,
      name: "Test World",
    })),

    // Playthrough methods (pass-through)
    getPlaythrough: vi.fn(),
    createPlaythrough: vi.fn(),
    updatePlaythrough: vi.fn(),

    ...overrides,
  } as unknown as IStorage;
}

const PLAYTHROUGH_ID = "pt-test-1";

// ---------- Tests ----------

describe("PlaythroughOverlayStorage", () => {
  let mockStorage: IStorage;
  let overlay: PlaythroughOverlayStorage;

  beforeEach(() => {
    mockStorage = makeMockStorage();
    overlay = new PlaythroughOverlayStorage(mockStorage, PLAYTHROUGH_ID, 0);
  });

  describe("initialization", () => {
    it("loads existing deltas from database on initialize", async () => {
      const existingDeltas = [
        {
          id: "d1",
          playthroughId: PLAYTHROUGH_ID,
          entityType: "character",
          entityId: "char-1",
          operation: "update",
          deltaData: { name: "Modified Alice" },
          fullData: null,
          timestep: 1,
          createdAt: new Date(),
        },
        {
          id: "d2",
          playthroughId: PLAYTHROUGH_ID,
          entityType: "item",
          entityId: "item-new",
          operation: "create",
          deltaData: null,
          fullData: { id: "item-new", name: "Magic Wand", worldId: "world-1" },
          timestep: 2,
          createdAt: new Date(),
        },
      ];

      (mockStorage.getDeltasByPlaythrough as any).mockResolvedValue(existingDeltas);
      await overlay.initialize();

      const charDeltas = overlay.getDeltasForType("character");
      expect(charDeltas).toHaveLength(1);
      expect(charDeltas[0].operation).toBe("update");
      expect(charDeltas[0].deltaData).toEqual({ name: "Modified Alice" });

      const itemDeltas = overlay.getDeltasForType("item");
      expect(itemDeltas).toHaveLength(1);
      expect(itemDeltas[0].operation).toBe("create");
      expect(itemDeltas[0].fullData).toEqual({ id: "item-new", name: "Magic Wand", worldId: "world-1" });
    });

    it("handles delete deltas on initialize", async () => {
      (mockStorage.getDeltasByPlaythrough as any).mockResolvedValue([
        {
          id: "d1",
          playthroughId: PLAYTHROUGH_ID,
          entityType: "character",
          entityId: "char-1",
          operation: "delete",
          deltaData: null,
          fullData: null,
          timestep: 3,
          createdAt: new Date(),
        },
      ]);

      await overlay.initialize();
      expect(overlay.isDeleted("character", "char-1")).toBe(true);
    });

    it("only initializes once", async () => {
      await overlay.initialize();
      await overlay.initialize();
      expect(mockStorage.getDeltasByPlaythrough).toHaveBeenCalledTimes(1);
    });
  });

  describe("interceptCreate", () => {
    it("stores full entity data as a create delta", async () => {
      const newChar = { name: "New NPC", worldId: "world-1", age: 20 };
      const result = await overlay.interceptCreate("character", newChar);

      expect(result.id).toBeDefined();
      expect(result.name).toBe("New NPC");
      expect(overlay.isPlaythroughCreated("character", result.id)).toBe(true);
      expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledWith(
        expect.objectContaining({
          playthroughId: PLAYTHROUGH_ID,
          entityType: "character",
          operation: "create",
          fullData: expect.objectContaining({ name: "New NPC" }),
        }),
      );
    });

    it("preserves provided id", async () => {
      const result = await overlay.interceptCreate("item", {
        id: "custom-id",
        name: "Custom Item",
      });
      expect(result.id).toBe("custom-id");
    });

    it("does NOT call base storage create", async () => {
      await overlay.interceptCreate("character", { name: "Test" });
      expect(mockStorage.createCharacter).not.toHaveBeenCalled();
    });
  });

  describe("interceptUpdate", () => {
    it("stores only changed fields for base entity updates", async () => {
      const result = await overlay.interceptUpdate("character", "char-1", {
        name: "Updated Name",
      });

      expect(result).toBeDefined();
      expect(result!.name).toBe("Updated Name");
      expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: "update",
          entityId: "char-1",
          deltaData: { name: "Updated Name" },
        }),
      );
    });

    it("accumulates multiple updates to same entity", async () => {
      await overlay.interceptUpdate("character", "char-1", { name: "First" });
      await overlay.interceptUpdate("character", "char-1", { age: 50 });

      const deltas = overlay.getDeltasForType("character");
      const charDelta = deltas.find((d) => d.entityId === "char-1");
      expect(charDelta!.deltaData).toEqual({ name: "First", age: 50 });
    });

    it("updates fullData for playthrough-created entities", async () => {
      const created = await overlay.interceptCreate("character", {
        name: "NewChar",
        age: 20,
      });
      await overlay.interceptUpdate("character", created.id, { age: 25 });

      const entry = overlay.getDeltaIndex().get("character")!.get(created.id)!;
      expect(entry.operation).toBe("create"); // stays as create
      expect(entry.fullData!.age).toBe(25);
    });

    it("returns undefined for deleted entities", async () => {
      await overlay.interceptDelete("character", "char-1");
      const result = await overlay.interceptUpdate("character", "char-1", {
        name: "Ghost",
      });
      expect(result).toBeUndefined();
    });

    it("does NOT call base storage update", async () => {
      await overlay.interceptUpdate("character", "char-1", { name: "X" });
      expect(mockStorage.updateCharacter).not.toHaveBeenCalled();
    });
  });

  describe("interceptDelete", () => {
    it("stores a tombstone for base entities", async () => {
      const result = await overlay.interceptDelete("character", "char-1");
      expect(result).toBe(true);
      expect(overlay.isDeleted("character", "char-1")).toBe(true);
      expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: "delete",
          entityId: "char-1",
        }),
      );
    });

    it("can delete playthrough-created entities", async () => {
      const created = await overlay.interceptCreate("item", { name: "Temp" });
      await overlay.interceptDelete("item", created.id);
      expect(overlay.isDeleted("item", created.id)).toBe(true);
    });

    it("does NOT call base storage delete", async () => {
      await overlay.interceptDelete("character", "char-1");
      expect(mockStorage.deleteCharacter).not.toHaveBeenCalled();
    });
  });

  describe("resolveEntity", () => {
    it("returns base entity when no delta exists", async () => {
      const result = await overlay.resolveEntity("character", "char-1");
      expect(result).toEqual({
        id: "char-1",
        name: "Base Character",
        worldId: "world-1",
        age: 30,
      });
    });

    it("merges delta with base entity", async () => {
      await overlay.interceptUpdate("character", "char-1", { name: "Modified" });
      const result = await overlay.resolveEntity("character", "char-1");
      expect(result!.name).toBe("Modified");
      expect(result!.age).toBe(30); // base field preserved
    });

    it("returns playthrough-created entity from fullData", async () => {
      const created = await overlay.interceptCreate("character", {
        name: "New",
        age: 10,
      });
      const result = await overlay.resolveEntity("character", created.id);
      expect(result!.name).toBe("New");
    });

    it("returns undefined for deleted entities", async () => {
      await overlay.interceptDelete("character", "char-1");
      const result = await overlay.resolveEntity("character", "char-1");
      expect(result).toBeUndefined();
    });

    it("returns undefined for nonexistent base entities", async () => {
      (mockStorage.getCharacter as any).mockResolvedValue(undefined);
      const result = await overlay.resolveEntity("character", "nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("resolveEntityList", () => {
    it("returns base list when no deltas", async () => {
      const base = [
        { id: "char-1", name: "Alice" },
        { id: "char-2", name: "Bob" },
      ];
      const result = await overlay.resolveEntityList("character", base);
      expect(result).toEqual(base);
    });

    it("applies updates to base entities in list", async () => {
      await overlay.interceptUpdate("character", "char-1", { name: "Modified Alice" });
      const base = [
        { id: "char-1", name: "Alice" },
        { id: "char-2", name: "Bob" },
      ];
      const result = await overlay.resolveEntityList("character", base);
      expect(result.find((c) => c.id === "char-1")!.name).toBe("Modified Alice");
      expect(result.find((c) => c.id === "char-2")!.name).toBe("Bob");
    });

    it("filters deleted entities from list", async () => {
      await overlay.interceptDelete("character", "char-1");
      const base = [
        { id: "char-1", name: "Alice" },
        { id: "char-2", name: "Bob" },
      ];
      const result = await overlay.resolveEntityList("character", base);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Bob");
    });

    it("appends playthrough-created entities to list", async () => {
      await overlay.interceptCreate("character", {
        id: "char-new",
        name: "NewChar",
      });
      const base = [{ id: "char-1", name: "Alice" }];
      const result = await overlay.resolveEntityList("character", base);
      expect(result).toHaveLength(2);
      expect(result.find((c) => c.id === "char-new")!.name).toBe("NewChar");
    });

    it("handles all three operations together", async () => {
      await overlay.interceptUpdate("character", "char-1", { name: "Updated" });
      await overlay.interceptDelete("character", "char-2");
      await overlay.interceptCreate("character", {
        id: "char-3",
        name: "Created",
      });

      const base = [
        { id: "char-1", name: "Alice" },
        { id: "char-2", name: "Bob" },
      ];
      const result = await overlay.resolveEntityList("character", base);
      expect(result).toHaveLength(2);
      expect(result.find((c) => c.id === "char-1")!.name).toBe("Updated");
      expect(result.find((c) => c.id === "char-2")).toBeUndefined();
      expect(result.find((c) => c.id === "char-3")!.name).toBe("Created");
    });
  });

  describe("createProxy", () => {
    it("intercepts create methods on overlaid types", async () => {
      const proxy = overlay.createProxy();
      const result = await proxy.createCharacter({ name: "ProxyChar" } as any);
      expect(result.id).toBeDefined();
      expect(result.name).toBe("ProxyChar");
      expect(mockStorage.createCharacter).not.toHaveBeenCalled();
    });

    it("intercepts update methods on overlaid types", async () => {
      const proxy = overlay.createProxy();
      await proxy.updateCharacter("char-1", { name: "ProxyUpdated" } as any);
      expect(mockStorage.updateCharacter).not.toHaveBeenCalled();
      expect(mockStorage.createPlaythroughDelta).toHaveBeenCalled();
    });

    it("intercepts delete methods on overlaid types", async () => {
      const proxy = overlay.createProxy();
      await proxy.deleteCharacter("char-1");
      expect(mockStorage.deleteCharacter).not.toHaveBeenCalled();
      expect(overlay.isDeleted("character", "char-1")).toBe(true);
    });

    it("intercepts single get methods with overlay resolution", async () => {
      await overlay.interceptUpdate("character", "char-1", { name: "Overlaid" });
      const proxy = overlay.createProxy();
      const result = await proxy.getCharacter("char-1");
      expect(result!.name).toBe("Overlaid");
    });

    it("intercepts list get methods with overlay resolution", async () => {
      await overlay.interceptDelete("character", "char-1");
      await overlay.interceptCreate("character", {
        id: "char-new",
        name: "New",
        worldId: "world-1",
        age: 20,
      });

      const proxy = overlay.createProxy();
      const result = await proxy.getCharactersByWorld("world-1");
      // char-1 deleted, char-2 kept, char-new added
      expect(result.find((c: any) => c.id === "char-1")).toBeUndefined();
      expect(result.find((c: any) => c.id === "char-2")).toBeDefined();
      expect(result.find((c: any) => c.id === "char-new")).toBeDefined();
    });

    it("passes through non-overlaid entity methods", async () => {
      const proxy = overlay.createProxy();
      await proxy.getUser("user-1");
      expect(mockStorage.getUser).toHaveBeenCalledWith("user-1");
    });

    it("passes through world methods (not overlaid)", async () => {
      const proxy = overlay.createProxy();
      await proxy.getWorld("world-1");
      expect(mockStorage.getWorld).toHaveBeenCalledWith("world-1");
    });

    it("passes through playthrough methods", async () => {
      const proxy = overlay.createProxy();
      await proxy.getPlaythrough("pt-1");
      expect(mockStorage.getPlaythrough).toHaveBeenCalledWith("pt-1");
    });
  });

  describe("getDeltaCount", () => {
    it("returns 0 initially", () => {
      expect(overlay.getDeltaCount()).toBe(0);
    });

    it("counts all deltas across types", async () => {
      await overlay.interceptCreate("character", { name: "A" });
      await overlay.interceptCreate("item", { name: "B" });
      await overlay.interceptDelete("truth", "t-1");
      expect(overlay.getDeltaCount()).toBe(3);
    });
  });

  describe("setTimestep", () => {
    it("uses updated timestep for new deltas", async () => {
      overlay.setTimestep(5);
      await overlay.interceptCreate("character", { name: "Late" });
      expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledWith(
        expect.objectContaining({ timestep: 5 }),
      );
    });
  });

  describe("delta persistence", () => {
    it("persists every operation to base storage", async () => {
      await overlay.interceptCreate("character", { name: "A" });
      await overlay.interceptUpdate("item", "item-1", { quantity: 5 });
      await overlay.interceptDelete("truth", "t-1");

      expect(mockStorage.createPlaythroughDelta).toHaveBeenCalledTimes(3);
    });
  });

  describe("edge cases", () => {
    it("handles initialize with merged update deltas", async () => {
      (mockStorage.getDeltasByPlaythrough as any).mockResolvedValue([
        {
          id: "d1",
          playthroughId: PLAYTHROUGH_ID,
          entityType: "character",
          entityId: "char-1",
          operation: "update",
          deltaData: { name: "First" },
          fullData: null,
          timestep: 1,
          createdAt: new Date(),
        },
        {
          id: "d2",
          playthroughId: PLAYTHROUGH_ID,
          entityType: "character",
          entityId: "char-1",
          operation: "update",
          deltaData: { age: 40 },
          fullData: null,
          timestep: 2,
          createdAt: new Date(),
        },
      ]);

      await overlay.initialize();
      const deltas = overlay.getDeltasForType("character");
      expect(deltas[0].deltaData).toEqual({ name: "First", age: 40 });
    });

    it("delete after update replaces with tombstone", async () => {
      await overlay.interceptUpdate("character", "char-1", { name: "X" });
      await overlay.interceptDelete("character", "char-1");
      expect(overlay.isDeleted("character", "char-1")).toBe(true);
      const result = await overlay.resolveEntity("character", "char-1");
      expect(result).toBeUndefined();
    });
  });
});
