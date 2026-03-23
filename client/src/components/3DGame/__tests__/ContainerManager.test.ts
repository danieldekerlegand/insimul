import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContainerManager } from '../ContainerManager';
import type { DataSource } from '../DataSource';

function createMockDataSource(containers: any[] = []): DataSource {
  return {
    questOverlay: null,
    loadWorld: vi.fn().mockResolvedValue({}),
    loadCharacters: vi.fn().mockResolvedValue([]),
    loadActions: vi.fn().mockResolvedValue([]),
    loadBaseActions: vi.fn().mockResolvedValue([]),
    loadQuests: vi.fn().mockResolvedValue([]),
    loadSettlements: vi.fn().mockResolvedValue([]),
    loadRules: vi.fn().mockResolvedValue([]),
    loadBaseRules: vi.fn().mockResolvedValue([]),
    loadCountries: vi.fn().mockResolvedValue([]),
    loadStates: vi.fn().mockResolvedValue([]),
    loadBaseResources: vi.fn().mockResolvedValue({}),
    loadAssets: vi.fn().mockResolvedValue([]),
    loadConfig3D: vi.fn().mockResolvedValue({}),
    loadTruths: vi.fn().mockResolvedValue([]),
    loadCharacter: vi.fn().mockResolvedValue(null),
    listPlaythroughs: vi.fn().mockResolvedValue([]),
    startPlaythrough: vi.fn().mockResolvedValue(null),
    updateQuest: vi.fn().mockResolvedValue(undefined),
    loadSettlementBusinesses: vi.fn().mockResolvedValue([]),
    loadSettlementLots: vi.fn().mockResolvedValue([]),
    loadSettlementResidences: vi.fn().mockResolvedValue([]),
    payFines: vi.fn().mockResolvedValue(null),
    getEntityInventory: vi.fn().mockResolvedValue({ items: [], gold: 0 }),
    getPlayerInventory: vi.fn().mockResolvedValue({ items: [], gold: 0 }),
    getContainerContents: vi.fn().mockResolvedValue(null),
    transferItem: vi.fn().mockResolvedValue({ success: true }),
    getMerchantInventory: vi.fn().mockResolvedValue(null),
    loadPrologContent: vi.fn().mockResolvedValue(null),
    loadWorldItems: vi.fn().mockResolvedValue([]),
    loadContainers: vi.fn().mockResolvedValue(containers),
    loadContainersByLocation: vi.fn().mockResolvedValue([]),
    updateContainer: vi.fn().mockResolvedValue(null),
    transferContainerItem: vi.fn().mockResolvedValue(null),
    saveGameState: vi.fn().mockResolvedValue(undefined),
    loadGameState: vi.fn().mockResolvedValue(null),
    deleteGameState: vi.fn().mockResolvedValue(undefined),
    saveQuestProgress: vi.fn().mockResolvedValue(undefined),
    loadQuestProgress: vi.fn().mockResolvedValue(null),
    loadGeography: vi.fn().mockResolvedValue(null),
    saveConversation: vi.fn().mockResolvedValue(null),
    updateConversation: vi.fn().mockResolvedValue(null),
    getConversations: vi.fn().mockResolvedValue([]),
    getPlaythrough: vi.fn().mockResolvedValue(null),
    markPlaythroughInitialized: vi.fn().mockResolvedValue(undefined),
    loadPlaythroughRelationships: vi.fn().mockResolvedValue([]),
    updatePlaythroughRelationship: vi.fn().mockResolvedValue({ success: true }),
  } as unknown as DataSource;
}

const CHEST = {
  id: 'c1',
  name: 'Wooden Chest',
  containerType: 'chest',
  capacity: 5,
  items: [{ itemId: 'item1', itemName: 'Sword', quantity: 1 }],
  locked: false,
  respawns: false,
  businessId: 'biz1',
};

const LOCKED_SAFE = {
  id: 'c2',
  name: 'Iron Safe',
  containerType: 'safe',
  capacity: 3,
  items: [],
  locked: true,
  lockDifficulty: 50,
  keyItemId: 'key1',
  respawns: false,
  residenceId: 'res1',
};

const RESPAWNING_BARREL = {
  id: 'c3',
  name: 'Supply Barrel',
  containerType: 'barrel',
  capacity: 10,
  items: [],
  locked: false,
  respawns: true,
  respawnTimeMinutes: 60,
  lastOpenedAt: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
  lotId: 'lot1',
};

describe('ContainerManager', () => {
  let manager: ContainerManager;
  let ds: DataSource;

  beforeEach(async () => {
    ds = createMockDataSource([CHEST, LOCKED_SAFE, RESPAWNING_BARREL]);
    manager = new ContainerManager('world1', ds);
    await manager.loadContainers();
  });

  it('loads containers from data source', () => {
    expect(manager.getAllContainers()).toHaveLength(3);
    expect(ds.loadContainers).toHaveBeenCalledWith('world1');
  });

  it('retrieves a container by ID', () => {
    const c = manager.getContainer('c1');
    expect(c).toBeDefined();
    expect(c!.name).toBe('Wooden Chest');
    expect(c!.items).toHaveLength(1);
  });

  it('returns undefined for unknown container', () => {
    expect(manager.getContainer('unknown')).toBeUndefined();
  });

  it('filters containers by business location', () => {
    const results = manager.getContainersAtLocation({ businessId: 'biz1' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('c1');
  });

  it('filters containers by residence location', () => {
    const results = manager.getContainersAtLocation({ residenceId: 'res1' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('c2');
  });

  it('filters containers by lot', () => {
    const results = manager.getContainersAtLocation({ lotId: 'lot1' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('c3');
  });

  describe('locking', () => {
    it('reports locked state', () => {
      expect(manager.isLocked('c1')).toBe(false);
      expect(manager.isLocked('c2')).toBe(true);
    });

    it('canUnlock returns true when player has key', () => {
      expect(manager.canUnlock('c2', ['key1', 'other'])).toBe(true);
    });

    it('canUnlock returns false when player lacks key', () => {
      expect(manager.canUnlock('c2', ['other'])).toBe(false);
    });

    it('canUnlock returns true for unlocked containers', () => {
      expect(manager.canUnlock('c1', [])).toBe(true);
    });

    it('unlock changes locked state', () => {
      expect(manager.unlock('c2')).toBe(true);
      expect(manager.isLocked('c2')).toBe(false);
    });

    it('unlock returns false for already-unlocked container', () => {
      expect(manager.unlock('c1')).toBe(false);
    });
  });

  describe('capacity', () => {
    it('isFull returns false when under capacity', () => {
      expect(manager.isFull('c1')).toBe(false); // 1/5
    });

    it('isFull returns true for unknown container', () => {
      expect(manager.isFull('unknown')).toBe(true);
    });
  });

  describe('respawning', () => {
    it('shouldRespawn returns true when enough time has passed', () => {
      expect(manager.shouldRespawn('c3')).toBe(true);
    });

    it('shouldRespawn returns false for non-respawning container', () => {
      expect(manager.shouldRespawn('c1')).toBe(false);
    });
  });

  describe('deposit', () => {
    it('deposits item via data source', async () => {
      const updatedContainer = {
        ...CHEST,
        items: [
          { itemId: 'item1', itemName: 'Sword', quantity: 1 },
          { itemId: 'item2', itemName: 'Shield', quantity: 1 },
        ],
      };
      (ds.transferContainerItem as ReturnType<typeof vi.fn>).mockResolvedValue(updatedContainer);

      const result = await manager.deposit('c1', 'item2', 'Shield', 1);
      expect(result).toBeDefined();
      expect(result!.items).toHaveLength(2);
      expect(ds.transferContainerItem).toHaveBeenCalledWith('c1', {
        itemId: 'item2',
        itemName: 'Shield',
        quantity: 1,
        direction: 'deposit',
      });
    });

    it('returns null for locked container', async () => {
      const result = await manager.deposit('c2', 'item1', 'Sword');
      expect(result).toBeNull();
      expect(ds.transferContainerItem).not.toHaveBeenCalled();
    });
  });

  describe('withdraw', () => {
    it('withdraws item via data source', async () => {
      const updatedContainer = { ...CHEST, items: [] };
      (ds.transferContainerItem as ReturnType<typeof vi.fn>).mockResolvedValue(updatedContainer);

      const result = await manager.withdraw('c1', 'item1', 1);
      expect(result).toBeDefined();
      expect(result!.items).toHaveLength(0);
      expect(ds.transferContainerItem).toHaveBeenCalledWith('c1', {
        itemId: 'item1',
        quantity: 1,
        direction: 'withdraw',
      });
    });

    it('returns null for locked container', async () => {
      const result = await manager.withdraw('c2', 'item1');
      expect(result).toBeNull();
    });
  });

  describe('loadContainersForLocation', () => {
    it('loads and caches containers by location', async () => {
      const locationContainers = [CHEST];
      (ds.loadContainersByLocation as ReturnType<typeof vi.fn>).mockResolvedValue(locationContainers);

      const result = await manager.loadContainersForLocation({ businessId: 'biz1' });
      expect(result).toHaveLength(1);
      expect(ds.loadContainersByLocation).toHaveBeenCalledWith('world1', { businessId: 'biz1' });
    });
  });
});
