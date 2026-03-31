/**
 * MongoQuestStorage
 *
 * Adapts the existing `storage` singleton to the QuestStorageProvider interface.
 * This is the server-side implementation used in the world creator — all calls
 * delegate directly to the existing MongoDB-backed storage layer.
 */

import { storage } from './storage.js';
import type { QuestStorageProvider } from '../../shared/quests/quest-storage-provider.js';

export const mongoQuestStorage: QuestStorageProvider = {
  // Quest CRUD
  getQuest: (id) => storage.getQuest(id),
  getQuestsByWorld: (worldId) => storage.getQuestsByWorld(worldId),
  getQuestsByPlayer: (playerId) => storage.getQuestsByPlayer(playerId),
  createQuest: (data) => storage.createQuest(data),
  updateQuest: (id, data) => storage.updateQuest(id, data as any),
  deleteQuest: (id) => storage.deleteQuest(id),

  // World context reads
  getWorld: (worldId) => storage.getWorld(worldId),
  getCharacter: (id) => storage.getCharacter(id),
  getCharactersByWorld: (worldId) => storage.getCharactersByWorld(worldId),
  getBusinessesByWorld: (worldId) => storage.getBusinessesByWorld(worldId),
  getSettlementsByWorld: (worldId) => storage.getSettlementsByWorld(worldId),
  getTruthsByWorld: (worldId) => storage.getTruthsByWorld(worldId),

  // Write ops
  createCharacter: (data) => storage.createCharacter(data as any),
  updateCharacter: (id, data) => storage.updateCharacter(id, data as any),
  createTruth: (data) => storage.createTruth(data),
  updateTruth: (id, data) => storage.updateTruth(id, data),
};
