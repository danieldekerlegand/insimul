/**
 * NPC Quest Interaction Memory Service
 *
 * Tracks per-NPC memory of quest interactions with players.
 * NPCs remember which quests they gave, outcomes (completed/failed/abandoned),
 * and derive trust/willingness to give future quests based on history.
 *
 * Follows the same storage pattern as npc-memory.ts (conversation memory).
 */

import mongoose, { Schema, Document } from 'mongoose';

// ── Types ────────────────────────────────────────────────────────────

export type QuestOutcome = 'assigned' | 'completed' | 'failed' | 'abandoned';

export interface QuestInteraction {
  questId: string;
  questTitle: string;
  outcome: QuestOutcome;
  assignedAt: Date;
  resolvedAt: Date | null;
}

export interface NPCQuestMemory {
  id: string;
  npcId: string;
  playerId: string;
  worldId: string;
  questInteractions: QuestInteraction[];
  totalQuestsGiven: number;
  completedCount: number;
  failedCount: number;
  abandonedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Derived helpers ─────────────────────────────────────────────────

/** Returns a reliability score (0–1) based on quest completion history. */
export function getPlayerReliability(memory: NPCQuestMemory): number {
  const resolved = memory.completedCount + memory.failedCount + memory.abandonedCount;
  if (resolved === 0) return 0.5; // neutral for unknown players
  return memory.completedCount / resolved;
}

/** Returns the NPC's disposition toward giving more quests. */
export function getQuestDisposition(memory: NPCQuestMemory): 'eager' | 'cautious' | 'reluctant' {
  const reliability = getPlayerReliability(memory);
  if (reliability >= 0.7) return 'eager';
  if (reliability >= 0.4) return 'cautious';
  return 'reluctant';
}

// ── Mongoose model ───────────────────────────────────────────────────

interface NPCQuestMemoryDoc extends Document {
  npcId: string;
  playerId: string;
  worldId: string;
  questInteractions: QuestInteraction[];
  totalQuestsGiven: number;
  completedCount: number;
  failedCount: number;
  abandonedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestInteractionSchema = new Schema(
  {
    questId: { type: String, required: true },
    questTitle: { type: String, default: '' },
    outcome: { type: String, enum: ['assigned', 'completed', 'failed', 'abandoned'], default: 'assigned' },
    assignedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
  },
  { _id: false },
);

const NPCQuestMemorySchema = new Schema(
  {
    npcId: { type: String, required: true, index: true },
    playerId: { type: String, required: true, index: true },
    worldId: { type: String, required: true, index: true },
    questInteractions: { type: [QuestInteractionSchema], default: [] },
    totalQuestsGiven: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    abandonedCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

NPCQuestMemorySchema.index({ npcId: 1, playerId: 1, worldId: 1 }, { unique: true });

const NPCQuestMemoryModel = mongoose.model<NPCQuestMemoryDoc>(
  'NPCQuestMemory',
  NPCQuestMemorySchema,
);

function docToMemory(doc: NPCQuestMemoryDoc | any): NPCQuestMemory {
  if (doc.toObject) {
    const obj = doc.toObject();
    return { ...obj, id: doc._id.toString() };
  }
  return { ...doc, id: doc._id?.toString() ?? '' };
}

// ── Storage interface ───────────────────────────────────────────────

export interface QuestMemoryStorage {
  findMemory(npcId: string, playerId: string, worldId: string): Promise<NPCQuestMemory | null>;
  upsertMemory(
    npcId: string,
    playerId: string,
    worldId: string,
    update: Partial<NPCQuestMemory>,
  ): Promise<NPCQuestMemory>;
}

// ── MongoDB storage ─────────────────────────────────────────────────

export class MongoQuestMemoryStorage implements QuestMemoryStorage {
  async findMemory(npcId: string, playerId: string, worldId: string): Promise<NPCQuestMemory | null> {
    const doc = await NPCQuestMemoryModel.findOne({ npcId, playerId, worldId });
    return doc ? docToMemory(doc) : null;
  }

  async upsertMemory(
    npcId: string,
    playerId: string,
    worldId: string,
    update: Partial<NPCQuestMemory>,
  ): Promise<NPCQuestMemory> {
    const doc = await NPCQuestMemoryModel.findOneAndUpdate(
      { npcId, playerId, worldId },
      { $set: { ...update, npcId, playerId, worldId, updatedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return docToMemory(doc);
  }
}

// ── In-memory storage (testing) ─────────────────────────────────────

export class InMemoryQuestMemoryStorage implements QuestMemoryStorage {
  private store = new Map<string, NPCQuestMemory>();

  private key(npcId: string, playerId: string, worldId: string): string {
    return `${npcId}:${playerId}:${worldId}`;
  }

  async findMemory(npcId: string, playerId: string, worldId: string): Promise<NPCQuestMemory | null> {
    return this.store.get(this.key(npcId, playerId, worldId)) ?? null;
  }

  async upsertMemory(
    npcId: string,
    playerId: string,
    worldId: string,
    update: Partial<NPCQuestMemory>,
  ): Promise<NPCQuestMemory> {
    const k = this.key(npcId, playerId, worldId);
    const existing = this.store.get(k);
    const now = new Date();
    const merged: NPCQuestMemory = {
      id: existing?.id ?? `qmem-${Date.now()}`,
      npcId,
      playerId,
      worldId,
      questInteractions: existing?.questInteractions ?? [],
      totalQuestsGiven: existing?.totalQuestsGiven ?? 0,
      completedCount: existing?.completedCount ?? 0,
      failedCount: existing?.failedCount ?? 0,
      abandonedCount: existing?.abandonedCount ?? 0,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...update,
    };
    this.store.set(k, merged);
    return merged;
  }

  clear(): void {
    this.store.clear();
  }
}

// ── NPC Quest Memory Service ────────────────────────────────────────

/** Max quest interactions kept per NPC-player pair (oldest resolved are dropped). */
const MAX_INTERACTIONS = 50;

export class NPCQuestMemoryService {
  private storage: QuestMemoryStorage;

  constructor(storage?: QuestMemoryStorage) {
    this.storage = storage ?? new MongoQuestMemoryStorage();
  }

  /** Retrieve quest memory for an NPC-player pair. */
  async getMemory(npcId: string, playerId: string, worldId: string): Promise<NPCQuestMemory | null> {
    return this.storage.findMemory(npcId, playerId, worldId);
  }

  /** Record that an NPC assigned a quest to the player. */
  async recordQuestAssigned(
    npcId: string,
    playerId: string,
    worldId: string,
    questId: string,
    questTitle: string,
  ): Promise<NPCQuestMemory> {
    const existing = await this.storage.findMemory(npcId, playerId, worldId);

    const interaction: QuestInteraction = {
      questId,
      questTitle,
      outcome: 'assigned',
      assignedAt: new Date(),
      resolvedAt: null,
    };

    const interactions = [...(existing?.questInteractions ?? []), interaction];
    const totalQuestsGiven = (existing?.totalQuestsGiven ?? 0) + 1;

    return this.storage.upsertMemory(npcId, playerId, worldId, {
      questInteractions: interactions,
      totalQuestsGiven,
      completedCount: existing?.completedCount ?? 0,
      failedCount: existing?.failedCount ?? 0,
      abandonedCount: existing?.abandonedCount ?? 0,
    });
  }

  /** Update a quest's outcome (completed, failed, abandoned). */
  async recordQuestOutcome(
    npcId: string,
    playerId: string,
    worldId: string,
    questId: string,
    outcome: 'completed' | 'failed' | 'abandoned',
  ): Promise<NPCQuestMemory> {
    const existing = await this.storage.findMemory(npcId, playerId, worldId);
    if (!existing) {
      // Quest wasn't tracked via this NPC — create a minimal record
      const interaction: QuestInteraction = {
        questId,
        questTitle: '',
        outcome,
        assignedAt: new Date(),
        resolvedAt: new Date(),
      };
      return this.storage.upsertMemory(npcId, playerId, worldId, {
        questInteractions: [interaction],
        totalQuestsGiven: 1,
        completedCount: outcome === 'completed' ? 1 : 0,
        failedCount: outcome === 'failed' ? 1 : 0,
        abandonedCount: outcome === 'abandoned' ? 1 : 0,
      });
    }

    // Find the matching interaction and update it
    const interactions = [...existing.questInteractions];
    const idx = interactions.findIndex((i) => i.questId === questId && i.outcome === 'assigned');
    if (idx >= 0) {
      interactions[idx] = { ...interactions[idx], outcome, resolvedAt: new Date() };
    } else {
      // Quest not found as assigned — append as resolved
      interactions.push({
        questId,
        questTitle: '',
        outcome,
        assignedAt: new Date(),
        resolvedAt: new Date(),
      });
    }

    // Cap interactions, keeping the most recent
    if (interactions.length > MAX_INTERACTIONS) {
      interactions.splice(0, interactions.length - MAX_INTERACTIONS);
    }

    const completedCount = interactions.filter((i) => i.outcome === 'completed').length;
    const failedCount = interactions.filter((i) => i.outcome === 'failed').length;
    const abandonedCount = interactions.filter((i) => i.outcome === 'abandoned').length;

    return this.storage.upsertMemory(npcId, playerId, worldId, {
      questInteractions: interactions,
      totalQuestsGiven: existing.totalQuestsGiven,
      completedCount,
      failedCount,
      abandonedCount,
    });
  }

  /** Get all quest interactions for an NPC-player pair by outcome. */
  async getInteractionsByOutcome(
    npcId: string,
    playerId: string,
    worldId: string,
    outcome: QuestOutcome,
  ): Promise<QuestInteraction[]> {
    const memory = await this.storage.findMemory(npcId, playerId, worldId);
    if (!memory) return [];
    return memory.questInteractions.filter((i) => i.outcome === outcome);
  }

  /** Build a context string for NPC dialogue about past quests with this player. */
  async getQuestContextForDialogue(
    npcId: string,
    playerId: string,
    worldId: string,
  ): Promise<string | null> {
    const memory = await this.storage.findMemory(npcId, playerId, worldId);
    if (!memory || memory.questInteractions.length === 0) return null;

    const parts: string[] = [];
    const disposition = getQuestDisposition(memory);
    const reliability = getPlayerReliability(memory);

    parts.push(`[Quest History: gave ${memory.totalQuestsGiven} quest(s) to this player]`);

    if (memory.completedCount > 0) {
      parts.push(`[${memory.completedCount} completed successfully]`);
    }
    if (memory.failedCount > 0) {
      parts.push(`[${memory.failedCount} failed]`);
    }
    if (memory.abandonedCount > 0) {
      parts.push(`[${memory.abandonedCount} abandoned]`);
    }

    parts.push(`[Reliability: ${(reliability * 100).toFixed(0)}% — disposition: ${disposition}]`);

    // Mention most recent resolved quest
    const resolved = memory.questInteractions
      .filter((i) => i.outcome !== 'assigned' && i.questTitle)
      .slice(-1);
    if (resolved.length > 0) {
      const r = resolved[0];
      parts.push(`[Last quest "${r.questTitle}" was ${r.outcome}]`);
    }

    return parts.join(' ');
  }
}
