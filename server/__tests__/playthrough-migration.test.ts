/**
 * Tests for the playthrough migration system that marks editor-created
 * playthroughs with needsInitialization for the in-game system.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoStorage } from '../db/mongo-storage';

let mongoServer: MongoMemoryServer;
let storage: MongoStorage;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  storage = new MongoStorage(uri);
  await storage.connect();
}, 60000);

afterAll(async () => {
  await storage.disconnect();
  await mongoServer.stop();
}, 30000);

beforeEach(async () => {
  const col = mongoose.connection.collection('playthroughs');
  await col.deleteMany({});
});

const USER_ID = 'user-1';
const WORLD_ID = 'world-1';

async function createPlaythrough(overrides: Record<string, any> = {}) {
  return storage.createPlaythrough({
    userId: USER_ID,
    worldId: WORLD_ID,
    worldSnapshotVersion: 1,
    name: 'Test Playthrough',
    status: 'active',
    ...overrides,
  });
}

describe('needsInitialization field', () => {
  it('defaults to false when creating a playthrough', async () => {
    const pt = await createPlaythrough();
    expect(pt.needsInitialization).toBe(false);
  });

  it('can be set to true via updatePlaythrough', async () => {
    const pt = await createPlaythrough();
    const updated = await storage.updatePlaythrough(pt.id, { needsInitialization: true } as any);
    expect(updated?.needsInitialization).toBe(true);
  });

  it('can be cleared back to false', async () => {
    const pt = await createPlaythrough();
    await storage.updatePlaythrough(pt.id, { needsInitialization: true } as any);
    const cleared = await storage.updatePlaythrough(pt.id, { needsInitialization: false } as any);
    expect(cleared?.needsInitialization).toBe(false);
  });

  it('persists through get', async () => {
    const pt = await createPlaythrough();
    await storage.updatePlaythrough(pt.id, { needsInitialization: true } as any);
    const fetched = await storage.getPlaythrough(pt.id);
    expect(fetched?.needsInitialization).toBe(true);
  });
});

describe('migration logic — identifying editor-created playthroughs', () => {
  it('flags playthroughs with no save data, zero playtime, and zero actions', async () => {
    const pt = await createPlaythrough();
    const saveData = (pt.saveData as Record<string, any>) || {};
    const hasSaveSlots = Object.keys(saveData).some(k => k.startsWith('slot_'));
    const hasPlaytime = (pt.playtime || 0) > 0;
    const hasActions = (pt.actionsCount || 0) > 0;

    expect(hasSaveSlots).toBe(false);
    expect(hasPlaytime).toBe(false);
    expect(hasActions).toBe(false);

    await storage.updatePlaythrough(pt.id, { needsInitialization: true } as any);
    const updated = await storage.getPlaythrough(pt.id);
    expect(updated?.needsInitialization).toBe(true);
  });

  it('does NOT flag playthroughs with save data', async () => {
    const pt = await createPlaythrough();
    await storage.updatePlaythrough(pt.id, {
      saveData: { slot_0: { version: 1, savedAt: new Date().toISOString() } },
    } as any);

    const fetched = await storage.getPlaythrough(pt.id);
    const saveData = (fetched?.saveData as Record<string, any>) || {};
    const hasSaveSlots = Object.keys(saveData).some(k => k.startsWith('slot_'));
    expect(hasSaveSlots).toBe(true);
    expect(fetched?.needsInitialization).toBe(false);
  });

  it('does NOT flag playthroughs with playtime > 0', async () => {
    const pt = await createPlaythrough();
    await storage.updatePlaythrough(pt.id, { playtime: 120 } as any);

    const fetched = await storage.getPlaythrough(pt.id);
    expect((fetched?.playtime || 0) > 0).toBe(true);
    expect(fetched?.needsInitialization).toBe(false);
  });

  it('does NOT flag completed playthroughs', async () => {
    const pt = await createPlaythrough({ status: 'completed' });
    expect(pt.status).toBe('completed');
    expect(pt.needsInitialization).toBe(false);
  });

  it('does NOT flag abandoned playthroughs', async () => {
    const pt = await createPlaythrough({ status: 'abandoned' });
    expect(pt.status).toBe('abandoned');
    expect(pt.needsInitialization).toBe(false);
  });
});

describe('full migration scan', () => {
  it('correctly categorizes a mix of playthroughs', async () => {
    // Editor-created, never played
    const editorOnly = await createPlaythrough({ name: 'Editor Only' });

    // Has been played (has save data)
    const played = await createPlaythrough({ name: 'Played' });
    await storage.updatePlaythrough(played.id, {
      saveData: { slot_0: { version: 1 } },
      playtime: 300,
      actionsCount: 15,
    } as any);

    // Completed
    await createPlaythrough({ name: 'Completed', status: 'completed' });

    // Another editor-created with some actions but no save
    const partialPlay = await createPlaythrough({ name: 'Partial' });
    await storage.updatePlaythrough(partialPlay.id, { actionsCount: 5 } as any);

    // Run migration logic
    const allPts = await storage.getPlaythroughsByUser(USER_ID);
    let migrated = 0;
    let skipped = 0;

    for (const pt of allPts) {
      if (pt.status === 'completed' || pt.status === 'abandoned') {
        skipped++;
        continue;
      }
      const saveData = (pt.saveData as Record<string, any>) || {};
      const hasSaveSlots = Object.keys(saveData).some(k => k.startsWith('slot_'));
      const hasPlaytime = (pt.playtime || 0) > 0;
      const hasActions = (pt.actionsCount || 0) > 0;

      if (!hasSaveSlots && !hasPlaytime && !hasActions) {
        await storage.updatePlaythrough(pt.id, { needsInitialization: true } as any);
        migrated++;
      } else {
        skipped++;
      }
    }

    expect(migrated).toBe(1);
    expect(skipped).toBe(3);

    const flagged = await storage.getPlaythrough(editorOnly.id);
    expect(flagged?.needsInitialization).toBe(true);

    const playedPt = await storage.getPlaythrough(played.id);
    expect(playedPt?.needsInitialization).toBe(false);

    const partialPt = await storage.getPlaythrough(partialPlay.id);
    expect(partialPt?.needsInitialization).toBe(false);
  });
});
