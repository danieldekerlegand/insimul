/**
 * Data Layer Abstraction for BabylonGame
 *
 * This provides a unified interface for loading game data
 * that can switch between API calls (for Insimul) and
 * file loading (for exported games).
 */

import { SaveQueue, SaveConflictError, type QueuedOperation, type ConflictHandler } from './SaveQueue';
import { PlaythroughQuestOverlay } from './PlaythroughQuestOverlay';
import {
  detectConflict,
  resolveConflict,
  type ConflictDialogHandler,
  type SaveConflict,
} from './SaveConflictResolver';
import type { GameSaveState } from '@shared/game-engine/types';

export interface DataSource {
  /** Playthrough-scoped quest overlay. When set, loadQuests merges overlay
   *  state on top of base world quests, and updateQuest writes to the overlay
   *  instead of the world. */
  questOverlay: PlaythroughQuestOverlay | null;
  loadWorld(worldId: string): Promise<any>;
  loadCharacters(worldId: string): Promise<any[]>;
  loadActions(worldId: string): Promise<any[]>;
  loadBaseActions(): Promise<any[]>;
  loadQuests(worldId: string): Promise<any[]>;
  loadSettlements(worldId: string): Promise<any[]>;
  loadRules(worldId: string): Promise<any[]>;
  loadBaseRules(): Promise<any[]>;
  loadCountries(worldId: string): Promise<any[]>;
  loadStates(worldId: string): Promise<any[]>;
  loadBaseResources(worldId: string): Promise<any>;
  loadAssets(worldId: string): Promise<any[]>;
  loadConfig3D(worldId: string): Promise<any>;
  loadTruths(worldId: string, playthroughId?: string): Promise<any[]>;
  loadCharacter(characterId: string): Promise<any>;
  listPlaythroughs(worldId: string, authToken: string): Promise<any[]>;
  startPlaythrough(worldId: string, authToken: string, playthroughName: string): Promise<any>;
  updateQuest(questId: string, data: any): Promise<void>;
  loadSettlementBusinesses(settlementId: string): Promise<any[]>;
  loadSettlementLots(settlementId: string): Promise<any[]>;
  loadSettlementResidences(settlementId: string): Promise<any[]>;
  payFines(playthroughId: string, settlementId: string): Promise<any>;
  getEntityInventory(worldId: string, entityId: string): Promise<any>;
  transferItem(worldId: string, transfer: {
    fromEntityId?: string;
    toEntityId?: string;
    itemId: string;
    itemName?: string;
    itemDescription?: string;
    itemType?: string;
    quantity?: number;
    transactionType: 'buy' | 'sell' | 'steal' | 'discard' | 'give' | 'quest_reward';
    totalPrice?: number;
  }): Promise<any>;
  getMerchantInventory(worldId: string, merchantId: string): Promise<any>;
  loadPrologContent(worldId: string): Promise<string | null>;
  loadWorldItems(worldId: string): Promise<any[]>;
  saveGameState(worldId: string, playthroughId: string, slotIndex: number, state: any): Promise<void>;
  loadGameState(worldId: string, playthroughId: string, slotIndex: number): Promise<any | null>;
  saveQuestProgress(playthroughId: string, questProgress: any): Promise<void>;
  loadQuestProgress(playthroughId: string): Promise<any | null>;
  loadGeography(worldId: string): Promise<{ heightmap?: number[][]; terrainSize?: number } | null>;
  saveConversation(playthroughId: string, conversation: any): Promise<any>;
  updateConversation(playthroughId: string, conversationId: string, updates: any): Promise<any>;
  getConversations(playthroughId: string, npcCharacterId?: string): Promise<any[]>;
}

/**
 * API-based data source for Insimul
 */
export class ApiDataSource implements DataSource {
  public questOverlay: PlaythroughQuestOverlay | null = null;
  private saveQueue: SaveQueue;
  /** Last-known server state per slot, used as the "base" for three-way merge. */
  private lastKnownServerState: Map<string, GameSaveState> = new Map();
  private conflictDialogHandler: ConflictDialogHandler | null = null;

  constructor(private authToken: string) {
    this.saveQueue = new SaveQueue((op) => this.executeQueuedOp(op));
    this.saveQueue.onConflict((op) => this.handleConflict(op));
    this.saveQueue.init().catch((err) =>
      console.warn('[ApiDataSource] SaveQueue init failed (IndexedDB unavailable):', err)
    );
  }

  /** Register a UI handler for save conflict dialogs. */
  setConflictDialogHandler(handler: ConflictDialogHandler): void {
    this.conflictDialogHandler = handler;
  }

  /** Track the last-known server state for a slot (called after loads). */
  private slotKey(worldId: string, playthroughId: string, slotIndex: number): string {
    return `${worldId}:${playthroughId}:${slotIndex}`;
  }

  /** Handle a save conflict detected during flush. */
  private async handleConflict(op: QueuedOperation): Promise<'resolved' | 'discard'> {
    if (op.type !== 'saveGameState') return 'discard';

    const { worldId, playthroughId, slotIndex, state } = op.payload;
    const key = this.slotKey(worldId, playthroughId, slotIndex);
    const baseState = this.lastKnownServerState.get(key) ?? null;

    // Fetch current server state
    const serverState = await this.fetchServerState(worldId, playthroughId, slotIndex);
    if (!serverState) {
      // Server has no state — just save directly
      await this.directSave(worldId, playthroughId, slotIndex, state);
      this.lastKnownServerState.set(key, state);
      return 'resolved';
    }

    const conflict: SaveConflict = {
      localState: state,
      serverState,
      baseState,
      slotIndex,
      worldId,
      playthroughId,
    };

    const result = await resolveConflict(conflict, this.conflictDialogHandler ?? undefined);

    // Save the resolved state
    await this.directSave(worldId, playthroughId, slotIndex, result.resolvedState);
    this.lastKnownServerState.set(key, result.resolvedState);

    console.log(`[ApiDataSource] Conflict resolved via ${result.resolution}`, result.fieldSummary);
    return 'resolved';
  }

  /** Fetch game state directly from server (bypassing queue). */
  private async fetchServerState(worldId: string, playthroughId: string, slotIndex: number): Promise<GameSaveState | null> {
    try {
      const res = await fetch(
        `/api/worlds/${worldId}/game-state?playthroughId=${playthroughId}&slotIndex=${slotIndex}`,
        { headers: this.getHeaders() },
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.state ?? null;
    } catch {
      return null;
    }
  }

  /** Save directly to the API (bypassing queue). */
  private async directSave(worldId: string, playthroughId: string, slotIndex: number, state: GameSaveState): Promise<void> {
    const res = await fetch(`/api/worlds/${worldId}/game-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getHeaders() },
      body: JSON.stringify({ playthroughId, slotIndex, state }),
    });
    if (!res.ok) {
      throw new Error(`Direct save failed: ${res.status}`);
    }
  }

  /** Execute a queued operation against the API. */
  private async executeQueuedOp(op: QueuedOperation): Promise<void> {
    const headers: HeadersInit = { 'Content-Type': 'application/json', ...this.getHeaders() };
    let url: string;
    let method = 'POST';
    let body: string;

    switch (op.type) {
      case 'saveGameState': {
        const { worldId, playthroughId, slotIndex, state } = op.payload;

        // Check for conflicts before saving
        const key = this.slotKey(worldId, playthroughId, slotIndex);
        const baseState = this.lastKnownServerState.get(key) ?? null;
        const serverState = await this.fetchServerState(worldId, playthroughId, slotIndex);

        if (detectConflict(state, serverState, baseState)) {
          throw new SaveConflictError(
            'Server has a newer save than expected',
            op.id,
            op.payload,
          );
        }

        url = `/api/worlds/${worldId}/game-state`;
        body = JSON.stringify({ playthroughId, slotIndex, state });
        break;
      }
      case 'updateQuest': {
        const { questId, data } = op.payload;
        url = `/api/quests/${questId}`;
        method = 'PUT';
        body = JSON.stringify(data);
        break;
      }
      case 'transferItem': {
        const { worldId, transfer } = op.payload;
        url = `/api/worlds/${worldId}/inventory/transfer`;
        body = JSON.stringify(transfer);
        break;
      }
      case 'payFines': {
        const { playthroughId, settlementId } = op.payload;
        url = `/api/playthroughs/${playthroughId}/reputations/settlement/${settlementId}/pay-fines`;
        body = '{}';
        break;
      }
      case 'saveQuestProgress': {
        const { playthroughId: ptId, questProgress } = op.payload;
        url = `/api/playthroughs/${ptId}/quest-progress`;
        method = 'PUT';
        body = JSON.stringify({ questProgress });
        break;
      }
      case 'saveConversation': {
        const { playthroughId: ptId2, conversation } = op.payload;
        url = `/api/playthroughs/${ptId2}/conversations`;
        body = JSON.stringify(conversation);
        break;
      }
      case 'updateConversation': {
        const { playthroughId: ptId3, conversationId, updates } = op.payload;
        url = `/api/playthroughs/${ptId3}/conversations/${conversationId}`;
        method = 'PATCH';
        body = JSON.stringify(updates);
        break;
      }
      default:
        throw new Error(`Unknown operation type: ${(op as any).type}`);
    }

    const res = await fetch(url, { method, headers, body });
    if (!res.ok) {
      throw new Error(`API ${method} ${url} returned ${res.status}`);
    }

    // Track server state after successful save
    if (op.type === 'saveGameState') {
      const { worldId, playthroughId, slotIndex, state } = op.payload;
      this.lastKnownServerState.set(this.slotKey(worldId, playthroughId, slotIndex), state);
    }
  }

  /** Get the save queue (for status monitoring). */
  getSaveQueue(): SaveQueue {
    return this.saveQueue;
  }

  /** Dispose the save queue when no longer needed. */
  dispose(): void {
    this.saveQueue.dispose();
  }

  private getHeaders(): HeadersInit {
    return this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {};
  }

  async loadWorld(worldId: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : {};
  }

  async loadCharacters(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/characters`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadActions(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/actions`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadBaseActions(): Promise<any[]> {
    const res = await fetch(`/api/actions/base`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadQuests(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/quests`, { headers: this.getHeaders() });
    const baseQuests = res.ok ? await res.json() : [];
    return this.questOverlay ? this.questOverlay.mergeQuests(baseQuests) : baseQuests;
  }

  async loadSettlements(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/settlements`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadRules(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/rules?worldId=${worldId}`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadBaseRules(): Promise<any[]> {
    const res = await fetch(`/api/rules/base`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadCountries(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/countries`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadStates(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/states`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadBaseResources(worldId: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/base-resources/config`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : {};
  }

  async loadAssets(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/assets`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadConfig3D(worldId: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/3d-config`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : {};
  }

  async loadTruths(worldId: string, playthroughId?: string): Promise<any[]> {
    const url = playthroughId
      ? `/api/worlds/${worldId}/truth?playthroughId=${encodeURIComponent(playthroughId)}`
      : `/api/worlds/${worldId}/truth`;
    const res = await fetch(url, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadCharacter(characterId: string): Promise<any> {
    const res = await fetch(`/api/characters/${characterId}`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : null;
  }

  async listPlaythroughs(worldId: string, authToken: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/playthroughs`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    return res.ok ? await res.json() : [];
  }

  async startPlaythrough(worldId: string, authToken: string, playthroughName: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/playthroughs/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ name: playthroughName }),
    });
    return res.ok ? await res.json() : null;
  }

  async updateQuest(questId: string, data: any): Promise<void> {
    if (this.questOverlay) {
      this.questOverlay.updateQuest(questId, data);
      return;
    }
    // Fallback: queue direct world write (no playthrough active)
    await this.saveQueue.enqueue('updateQuest', `quest:${questId}`, { questId, data });
  }

  async loadSettlementBusinesses(settlementId: string): Promise<any[]> {
    const res = await fetch(`/api/settlements/${settlementId}/businesses`);
    return res.ok ? await res.json() : [];
  }

  async loadSettlementLots(settlementId: string): Promise<any[]> {
    const res = await fetch(`/api/settlements/${settlementId}/lots`);
    return res.ok ? await res.json() : [];
  }

  async loadSettlementResidences(settlementId: string): Promise<any[]> {
    const res = await fetch(`/api/settlements/${settlementId}/residences`);
    return res.ok ? await res.json() : [];
  }

  async payFines(playthroughId: string, settlementId: string): Promise<any> {
    const res = await fetch(
      `/api/playthroughs/${playthroughId}/reputations/settlement/${settlementId}/pay-fines`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authToken ? `Bearer ${this.authToken}` : ''
        }
      }
    );
    return res.ok ? await res.json() : null;
  }

  async getEntityInventory(worldId: string, entityId: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}/inventory`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : { entityId, items: [], gold: 0 };
  }

  async transferItem(worldId: string, transfer: any): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/inventory/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getHeaders() },
      body: JSON.stringify(transfer),
    });
    return res.ok ? await res.json() : { success: false };
  }

  async getMerchantInventory(worldId: string, merchantId: string): Promise<any> {
    const res = await fetch(`/api/worlds/${worldId}/merchants/${merchantId}/inventory`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : null;
  }

  async loadWorldItems(worldId: string): Promise<any[]> {
    const res = await fetch(`/api/worlds/${worldId}/items`, { headers: this.getHeaders() });
    return res.ok ? await res.json() : [];
  }

  async loadPrologContent(worldId: string): Promise<string | null> {
    try {
      const res = await fetch(`/api/prolog/tau/export/${worldId}`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.content || null;
      }
    } catch { /* Prolog not available */ }
    return null;
  }

  async saveGameState(worldId: string, playthroughId: string, slotIndex: number, state: any): Promise<void> {
    await this.saveQueue.enqueue(
      'saveGameState',
      `save:${worldId}:${playthroughId}:${slotIndex}`,
      { worldId, playthroughId, slotIndex, state },
    );
  }

  async loadGameState(worldId: string, playthroughId: string, slotIndex: number): Promise<any | null> {
    const res = await fetch(
      `/api/worlds/${worldId}/game-state?playthroughId=${playthroughId}&slotIndex=${slotIndex}`,
      { headers: this.getHeaders() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const state = data.state || null;

    // Track as last-known server state for future conflict detection
    if (state) {
      this.lastKnownServerState.set(this.slotKey(worldId, playthroughId, slotIndex), state);
    }

    return state;
  }

  async saveQuestProgress(playthroughId: string, questProgress: any): Promise<void> {
    await this.saveQueue.enqueue(
      'saveQuestProgress',
      `questProgress:${playthroughId}`,
      { playthroughId, questProgress },
    );
  }

  async loadQuestProgress(playthroughId: string): Promise<any | null> {
    const res = await fetch(
      `/api/playthroughs/${playthroughId}/quest-progress`,
      { headers: this.getHeaders() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.questProgress || null;
  }

  async loadGeography(worldId: string): Promise<{ heightmap?: number[][]; terrainSize?: number } | null> {
    try {
      const res = await fetch(`/api/worlds/${worldId}/geography`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data || null;
      }
    } catch { /* Geography not available */ }
    return null;
  }

  async saveConversation(playthroughId: string, conversation: any): Promise<any> {
    const res = await fetch(
      `/api/playthroughs/${playthroughId}/conversations`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(conversation),
      }
    );
    if (!res.ok) throw new Error('Failed to save conversation');
    return res.json();
  }

  async updateConversation(playthroughId: string, conversationId: string, updates: any): Promise<any> {
    const res = await fetch(
      `/api/playthroughs/${playthroughId}/conversations/${conversationId}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      }
    );
    if (!res.ok) throw new Error('Failed to update conversation');
    return res.json();
  }

  async getConversations(playthroughId: string, npcCharacterId?: string): Promise<any[]> {
    const query = npcCharacterId ? `?npcCharacterId=${npcCharacterId}` : '';
    const res = await fetch(
      `/api/playthroughs/${playthroughId}/conversations${query}`,
      { headers: this.getHeaders() }
    );
    if (!res.ok) return [];
    return res.json();
  }
}

// Reads a JSON data file, using Electron IPC when running from file:// (production build),
// or falling back to fetch() in dev / web mode.
async function readDataFile(relativePath: string): Promise<any> {
  const isElectronProduction =
    typeof window !== 'undefined' &&
    window.location?.protocol === 'file:' &&
    (window as any).electronAPI?.readFile;
  if (isElectronProduction) {
    const text = await (window as any).electronAPI.readFile(relativePath);
    return JSON.parse(text);
  }
  const res = await fetch(`./${relativePath}`);
  return res.json();
}

/**
 * Local game state manager for exported games.
 * Tracks runtime mutations (quest progress, inventories, reputation)
 * in memory and persists to localStorage.
 */
export interface LocalStateData {
  playthroughId: string;
  playthroughName: string;
  questUpdates: Record<string, any>;
  inventories: Record<string, { items: any[]; gold: number }>;
  merchantInventories: Record<string, any>;
  finesPaid: Record<string, number>;
  transactions: any[];
}

const LOCAL_STATE_KEY = 'insimul_local_state';

export class LocalGameState {
  private state: LocalStateData;

  constructor(private storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = localStorage) {
    this.state = this.load();
    this.persist();
  }

  private load(): LocalStateData {
    try {
      const raw = this.storage.getItem(LOCAL_STATE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* corrupted data, start fresh */ }
    return this.defaultState();
  }

  private defaultState(): LocalStateData {
    return {
      playthroughId: `exported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      playthroughName: '',
      questUpdates: {},
      inventories: {},
      merchantInventories: {},
      finesPaid: {},
      transactions: [],
    };
  }

  private persist(): void {
    try {
      this.storage.setItem(LOCAL_STATE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.error('[LocalGameState] Failed to persist:', err);
    }
  }

  getPlaythroughId(): string { return this.state.playthroughId; }

  startPlaythrough(name: string): { id: string; name: string } {
    this.state.playthroughName = name;
    this.persist();
    return { id: this.state.playthroughId, name };
  }

  updateQuest(questId: string, data: any): void {
    this.state.questUpdates[questId] = {
      ...this.state.questUpdates[questId],
      ...data,
    };
    this.persist();
  }

  getQuestUpdates(): Record<string, any> {
    return this.state.questUpdates;
  }

  getInventory(entityId: string): { entityId: string; items: any[]; gold: number } {
    const inv = this.state.inventories[entityId] || { items: [], gold: 0 };
    return { entityId, ...inv };
  }

  initializeInventory(entityId: string, items: any[], gold: number): void {
    if (!this.state.inventories[entityId]) {
      this.state.inventories[entityId] = { items, gold };
      this.persist();
    }
  }

  transferItem(transfer: {
    fromEntityId?: string;
    toEntityId?: string;
    itemId: string;
    itemName?: string;
    itemDescription?: string;
    itemType?: string;
    quantity?: number;
    transactionType: string;
    totalPrice?: number;
  }): { success: boolean; timestamp: number } {
    const qty = transfer.quantity || 1;
    const price = transfer.totalPrice || 0;

    // Remove from source
    if (transfer.fromEntityId) {
      const from = this.state.inventories[transfer.fromEntityId] ||= { items: [], gold: 0 };
      const idx = from.items.findIndex((i: any) => i.id === transfer.itemId || i.itemId === transfer.itemId);
      if (idx >= 0) {
        const item = from.items[idx];
        const currentQty = item.quantity || 1;
        if (currentQty <= qty) {
          from.items.splice(idx, 1);
        } else {
          item.quantity = currentQty - qty;
        }
      }
      if (transfer.transactionType === 'sell' && price > 0) {
        from.gold += price;
      }
    }

    // Add to destination
    if (transfer.toEntityId) {
      const to = this.state.inventories[transfer.toEntityId] ||= { items: [], gold: 0 };
      const existing = to.items.find((i: any) => i.id === transfer.itemId || i.itemId === transfer.itemId);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + qty;
      } else {
        to.items.push({
          id: transfer.itemId,
          itemId: transfer.itemId,
          name: transfer.itemName || transfer.itemId,
          description: transfer.itemDescription || '',
          type: transfer.itemType || 'misc',
          quantity: qty,
        });
      }
      if (transfer.transactionType === 'buy' && price > 0) {
        to.gold -= price;
      }
    }

    const record = { ...transfer, timestamp: Date.now() };
    this.state.transactions.push(record);
    this.persist();
    return { success: true, timestamp: record.timestamp };
  }

  getMerchantInventory(merchantId: string): any | null {
    return this.state.merchantInventories[merchantId] || null;
  }

  setMerchantInventory(merchantId: string, inventory: any): void {
    this.state.merchantInventories[merchantId] = inventory;
    this.persist();
  }

  payFines(settlementId: string): { success: true; finesPaid: number; timestamp: number } {
    const amount = this.state.finesPaid[settlementId] || 0;
    this.state.finesPaid[settlementId] = 0;
    this.persist();
    return { success: true, finesPaid: amount, timestamp: Date.now() };
  }

  addFine(settlementId: string, amount: number): void {
    this.state.finesPaid[settlementId] = (this.state.finesPaid[settlementId] || 0) + amount;
    this.persist();
  }

  reset(): void {
    this.state = this.defaultState();
    this.persist();
  }
}

/** Merchant occupation keywords for matching */
const MERCHANT_OCCUPATIONS = [
  'merchant', 'shopkeeper', 'trader', 'vendor', 'blacksmith',
  'apothecary', 'baker', 'butcher', 'tailor', 'jeweler', 'armorer', 'weaponsmith'
];

/** Default stock templates by occupation */
const MERCHANT_STOCK_TEMPLATES: Record<string, Array<{ name: string; type: string; basePrice: number; description: string }>> = {
  default: [
    { name: 'Bread', type: 'food', basePrice: 2, description: 'A fresh loaf of bread' },
    { name: 'Water Flask', type: 'drink', basePrice: 1, description: 'A flask of clean water' },
    { name: 'Torch', type: 'tool', basePrice: 3, description: 'A sturdy torch for dark places' },
    { name: 'Rope', type: 'tool', basePrice: 5, description: 'Strong hemp rope, 50 feet' },
    { name: 'Healing Herb', type: 'consumable', basePrice: 8, description: 'A herb with mild restorative properties' },
  ],
  blacksmith: [
    { name: 'Iron Sword', type: 'weapon', basePrice: 25, description: 'A well-forged iron sword' },
    { name: 'Iron Shield', type: 'armor', basePrice: 20, description: 'A sturdy iron shield' },
    { name: 'Dagger', type: 'weapon', basePrice: 10, description: 'A sharp steel dagger' },
    { name: 'Iron Pickaxe', type: 'tool', basePrice: 15, description: 'A heavy pickaxe for mining' },
  ],
  apothecary: [
    { name: 'Health Potion', type: 'consumable', basePrice: 15, description: 'Restores a moderate amount of health' },
    { name: 'Antidote', type: 'consumable', basePrice: 12, description: 'Cures common poisons' },
    { name: 'Energy Tonic', type: 'consumable', basePrice: 10, description: 'Restores energy and vigor' },
    { name: 'Healing Salve', type: 'consumable', basePrice: 8, description: 'A soothing salve for wounds' },
  ],
  baker: [
    { name: 'Bread', type: 'food', basePrice: 2, description: 'A fresh loaf of bread' },
    { name: 'Meat Pie', type: 'food', basePrice: 5, description: 'A hearty meat pie' },
    { name: 'Sweet Roll', type: 'food', basePrice: 3, description: 'A delicious sweet roll' },
    { name: 'Trail Rations', type: 'food', basePrice: 8, description: 'Packed food for long journeys' },
  ],
  tailor: [
    { name: 'Leather Boots', type: 'armor', basePrice: 12, description: 'Comfortable leather boots' },
    { name: 'Wool Cloak', type: 'armor', basePrice: 15, description: 'A warm wool cloak' },
    { name: 'Traveler\'s Pack', type: 'tool', basePrice: 10, description: 'A sturdy leather backpack' },
  ],
};

function generateLocalMerchantStock(occupation: string): any {
  const occ = occupation.toLowerCase();
  let template = MERCHANT_STOCK_TEMPLATES.default;
  for (const [key, items] of Object.entries(MERCHANT_STOCK_TEMPLATES)) {
    if (occ.includes(key)) { template = items; break; }
  }
  const items = template.map((t, i) => ({
    id: `merchant_item_${occ}_${i}`,
    name: t.name,
    type: t.type,
    description: t.description,
    basePrice: t.basePrice,
    price: t.basePrice,
    quantity: 3 + Math.floor(Math.random() * 5),
    tradeable: true,
  }));
  return { items, goldReserve: 200, buyMultiplier: 0.5, sellMultiplier: 1.0 };
}

/**
 * File-based data source for exported games
 */
export class FileDataSource implements DataSource {
  public questOverlay: PlaythroughQuestOverlay | null = null;
  private worldData: any = null;
  private worldIR: any = null;
  readonly localState: LocalGameState;

  constructor(storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>) {
    this.localState = new LocalGameState(storage);
    this.loadWorldData();
  }

  private async loadWorldData(): Promise<void> {
    try {
      this.worldIR = await readDataFile('data/world_ir.json');

      const [characters, npcs, quests, actions, rules, geography, theme, assetManifest] = await Promise.all([
        readDataFile('data/characters.json').catch(() => []),
        readDataFile('data/npcs.json').catch(() => []),
        readDataFile('data/quests.json').catch(() => []),
        readDataFile('data/actions.json').catch(() => []),
        readDataFile('data/rules.json').catch(() => []),
        readDataFile('data/geography.json').catch(() => ({})),
        readDataFile('data/theme.json').catch(() => ({})),
        readDataFile('data/asset-manifest.json').catch(() => ({})),
      ]);

      this.worldData = {
        world: this.worldIR.meta,
        characters,
        npcs,
        quests,
        actions,
        rules,
        geography,
        theme,
        assetManifest,
      };
    } catch (error) {
      console.error('Failed to load world data:', error);
    }
  }

  private async waitForData(): Promise<void> {
    if (!this.worldData) {
      await this.loadWorldData();
    }
  }

  async loadWorld(worldId: string): Promise<any> {
    await this.waitForData();
    const meta = this.worldIR?.meta || {};
    return { ...meta, name: meta.worldName || meta.name || 'Unknown World' };
  }

  async loadCharacters(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.characters || [];
  }

  async loadActions(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.actions || [];
  }

  async loadBaseActions(): Promise<any[]> {
    await this.waitForData();
    return this.worldIR?.systems?.actions || [];
  }

  async loadQuests(worldId: string): Promise<any[]> {
    await this.waitForData();
    const baseQuests = this.worldData?.quests || [];
    if (this.questOverlay) return this.questOverlay.mergeQuests(baseQuests);
    const updates = this.localState.getQuestUpdates();
    return baseQuests.map((q: any) => {
      const update = updates[q.id];
      if (!update) return q;
      return { ...q, ...update };
    });
  }

  async loadSettlements(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.geography?.settlements || [];
  }

  async loadRules(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.rules || [];
  }

  async loadBaseRules(): Promise<any[]> {
    await this.waitForData();
    return this.worldIR?.systems?.rules || [];
  }

  async loadCountries(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.geography?.countries || [];
  }

  async loadStates(worldId: string): Promise<any[]> {
    await this.waitForData();
    return this.worldData?.geography?.states || [];
  }

  async loadBaseResources(worldId: string): Promise<any> {
    await this.waitForData();
    return this.worldIR?.systems?.resources || {};
  }

  async loadAssets(worldId: string): Promise<any[]> {
    await this.waitForData();
    const manifest = this.worldData?.assetManifest;
    if (!manifest?.assets) return [];

    const categoryToAssetType: Record<string, string> = {
      character: 'character',
      ground: 'texture_ground',
      quest_object: 'quest_object',
      audio: 'audio',
      building: 'building',
      nature: 'nature',
      prop: 'prop',
    };

    return manifest.assets
      .filter((a: any) => !a.role.endsWith('_bin') && !a.role.startsWith('roof_') && !a.role.includes('_tex_'))
      .map((a: any) => {
        const ext = a.exportPath.split('.').pop()?.toLowerCase() || '';
        let assetType = categoryToAssetType[a.category] || a.category;
        if (a.category === 'building' && (ext === 'png' || ext === 'jpg' || ext === 'jpeg')) {
          assetType = 'texture_wall';
        }
        const mimeType =
          ext === 'glb' || ext === 'gltf' ? 'model/gltf-binary' :
          ext === 'mp3' ? 'audio/mpeg' :
          ext === 'ogg' ? 'audio/ogg' :
          ext === 'png' ? 'image/png' :
          ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
          'application/octet-stream';
        return {
          id: a.role,
          name: a.role,
          assetType,
          filePath: a.exportPath,
          fileName: a.exportPath.split('/').pop() || a.role,
          fileSize: a.fileSize,
          mimeType,
        };
      });
  }

  async loadConfig3D(worldId: string): Promise<any> {
    await this.waitForData();
    const manifest = this.worldData?.assetManifest;
    if (!manifest) return {};

    const buildingModels: Record<string, string> = {};
    for (const a of (manifest.categories?.building || [])) {
      const ext = a.exportPath.split('.').pop()?.toLowerCase() || '';
      if (!a.role.endsWith('_bin') && !a.role.includes('_tex_') && ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
        buildingModels[a.role] = a.role;
      }
    }
    const buildingFallbacks: Record<string, string> = {
      tavern: 'house', shop: 'house', market: 'house', farm: 'house',
      mill: 'blacksmith', watchtower: 'barracks', wall: 'house',
      gate: 'church', tower: 'barracks', keep: 'castle', palace: 'castle',
    };
    for (const [type, fallback] of Object.entries(buildingFallbacks)) {
      if (!buildingModels[type] && buildingModels[fallback]) {
        buildingModels[type] = fallback;
      }
    }

    const questObjectModels: Record<string, string> = {};
    for (const a of (manifest.categories?.quest_object || [])) {
      if (!a.role.endsWith('_bin') && !a.role.includes('_tex_')) {
        questObjectModels[a.role] = a.role;
      }
    }
    const questFallbacks: Record<string, string> = {
      key: 'chest', scroll: 'chest', artifact: 'collectible_gem',
    };
    for (const [type, fallback] of Object.entries(questFallbacks)) {
      if (!questObjectModels[type] && questObjectModels[fallback]) {
        questObjectModels[type] = fallback;
      }
    }

    const natureModels: Record<string, string> = {};
    for (const a of (manifest.categories?.nature || [])) {
      if (!a.role.endsWith('_bin') && !a.role.includes('_tex_')) {
        natureModels[a.role] = a.role;
      }
    }

    const objectModels: Record<string, string> = {};
    for (const a of (manifest.categories?.prop || [])) {
      if (!a.role.endsWith('_bin') && !a.role.includes('_tex_')) {
        objectModels[a.role] = a.role;
      }
    }

    const characterModels: Record<string, string> = {};
    const playerModels: Record<string, string> = {};
    for (const a of (manifest.categories?.character || [])) {
      if (!a.role.endsWith('_bin') && !a.role.includes('_tex_') && a.role !== 'player_texture') {
        if (a.role.startsWith('player')) {
          playerModels[a.role] = a.role;
          if (a.role === 'player_default') playerModels['default'] = 'player_default';
        } else {
          characterModels[a.role] = a.role;
          if (a.role === 'npc_default') {
            if (!characterModels['npcDefault']) characterModels['npcDefault'] = 'npc_default';
            if (!characterModels['guard']) characterModels['guard'] = 'npc_default';
            if (!characterModels['merchant']) characterModels['merchant'] = 'npc_default';
            if (!characterModels['civilian']) characterModels['civilian'] = 'npc_default';
            if (!characterModels['questgiver']) characterModels['questgiver'] = 'npc_default';
          }
          if (a.role === 'npc_guard') characterModels['guard'] = 'npc_guard';
          if (a.role === 'npc_merchant') characterModels['merchant'] = 'npc_merchant';
          if (a.role === 'npc_civilian_male') {
            characterModels['civilianMale'] = a.role;
            if (!characterModels['civilian']) characterModels['civilian'] = a.role;
          }
          if (a.role === 'npc_civilian_female') {
            characterModels['civilianFemale'] = a.role;
            if (!characterModels['civilian']) characterModels['civilian'] = a.role;
          }
        }
      }
    }

    const groundAsset = manifest.categories?.ground?.find((a: any) => a.role === 'ground_diffuse') || manifest.categories?.ground?.[0];
    const buildingTexture = (manifest.categories?.building || []).find(
      (a: any) => { const ext = a.exportPath.split('.').pop()?.toLowerCase(); return ext === 'png' || ext === 'jpg' || ext === 'jpeg'; }
    );

    return {
      buildingModels: Object.keys(buildingModels).length > 0 ? buildingModels : undefined,
      natureModels: Object.keys(natureModels).length > 0 ? natureModels : undefined,
      objectModels: Object.keys(objectModels).length > 0 ? objectModels : undefined,
      questObjectModels: Object.keys(questObjectModels).length > 0 ? questObjectModels : undefined,
      characterModels: Object.keys(characterModels).length > 0 ? characterModels : undefined,
      playerModels: Object.keys(playerModels).length > 0 ? playerModels : undefined,
      groundTextureId: groundAsset?.role,
      roadTextureId: groundAsset?.role,
      wallTextureId: buildingTexture?.role,
      roofTextureId: buildingTexture?.role,
    };
  }

  async loadTruths(worldId: string, _playthroughId?: string): Promise<any[]> {
    await this.waitForData();
    // Base truths from the exported JSON; gameplay truths are merged via the overlay layer
    return this.worldIR?.truths || [];
  }

  async loadCharacter(characterId: string): Promise<any> {
    await this.waitForData();
    const chars = this.worldData?.characters || [];
    const npcs = this.worldData?.npcs || [];
    return chars.find((c: any) => c.id === characterId) ||
           npcs.find((c: any) => c.id === characterId) || null;
  }

  async listPlaythroughs(_worldId: string, _authToken: string): Promise<any[]> {
    return [];
  }

  async startPlaythrough(_worldId: string, _authToken: string, playthroughName: string): Promise<any> {
    return this.localState.startPlaythrough(playthroughName);
  }

  async updateQuest(questId: string, data: any): Promise<void> {
    if (this.questOverlay) {
      this.questOverlay.updateQuest(questId, data);
      return;
    }
    this.localState.updateQuest(questId, data);
  }

  async loadSettlementBusinesses(settlementId: string): Promise<any[]> {
    await this.waitForData();
    const settlement = this.worldData?.geography?.settlements?.find((s: any) => s.id === settlementId);
    return settlement?.businesses || [];
  }

  async loadSettlementLots(settlementId: string): Promise<any[]> {
    await this.waitForData();
    const settlement = this.worldData?.geography?.settlements?.find((s: any) => s.id === settlementId);
    return settlement?.lots || [];
  }

  async loadSettlementResidences(settlementId: string): Promise<any[]> {
    await this.waitForData();
    const settlement = this.worldData?.geography?.settlements?.find((s: any) => s.id === settlementId);
    return settlement?.residences || [];
  }

  async payFines(_playthroughId: string, settlementId: string): Promise<any> {
    return this.localState.payFines(settlementId);
  }

  async getEntityInventory(_worldId: string, entityId: string): Promise<any> {
    return this.localState.getInventory(entityId);
  }

  async transferItem(_worldId: string, transfer: any): Promise<any> {
    const result = this.localState.transferItem(transfer);
    return { ...result, ...transfer };
  }

  async getMerchantInventory(_worldId: string, merchantId: string): Promise<any> {
    const cached = this.localState.getMerchantInventory(merchantId);
    if (cached) return cached;

    await this.waitForData();
    const chars = this.worldData?.characters || [];
    const npcs = this.worldData?.npcs || [];
    const character = chars.find((c: any) => c.id === merchantId) ||
                      npcs.find((c: any) => c.id === merchantId);
    if (!character) return null;

    const occupation = (character.occupation || character.role || '').toLowerCase();
    const isMerchant = MERCHANT_OCCUPATIONS.some(term => occupation.includes(term));
    if (!isMerchant) return null;

    const stock = generateLocalMerchantStock(occupation);
    const inventory = {
      merchantId,
      merchantName: `${character.firstName || ''} ${character.lastName || ''}`.trim() || character.name || 'Merchant',
      items: stock.items,
      goldReserve: stock.goldReserve,
      buyMultiplier: stock.buyMultiplier,
      sellMultiplier: stock.sellMultiplier,
      businessType: 'Shop',
    };
    this.localState.setMerchantInventory(merchantId, inventory);
    return inventory;
  }

  async loadPrologContent(worldId: string): Promise<string | null> {
    try {
      const content = await readDataFile('data/knowledge-base.pl');
      return typeof content === 'string' ? content : null;
    } catch {
      return null;
    }
  }

  async loadWorldItems(worldId: string): Promise<any[]> {
    try {
      return await readDataFile('data/items.json');
    } catch {
      return [];
    }
  }

  async saveGameState(_worldId: string, _playthroughId: string, slotIndex: number, state: any): Promise<void> {
    try {
      localStorage.setItem(`insimul_save_${slotIndex}`, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save game state to localStorage:', err);
    }
  }

  async loadGameState(_worldId: string, _playthroughId: string, slotIndex: number): Promise<any | null> {
    try {
      const raw = localStorage.getItem(`insimul_save_${slotIndex}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async saveQuestProgress(_playthroughId: string, questProgress: any): Promise<void> {
    try {
      localStorage.setItem('insimul_quest_progress', JSON.stringify(questProgress));
    } catch (err) {
      console.error('Failed to save quest progress to localStorage:', err);
    }
  }

  async loadQuestProgress(_playthroughId: string): Promise<any | null> {
    try {
      const raw = localStorage.getItem('insimul_quest_progress');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async loadGeography(worldId: string): Promise<{ heightmap?: number[][]; terrainSize?: number } | null> {
    await this.waitForData();
    const geo = this.worldData?.geography;
    if (!geo) return null;
    return { heightmap: geo.heightmap, terrainSize: geo.terrainSize };
  }

  async saveConversation(_playthroughId: string, conversation: any): Promise<any> {
    try {
      const key = 'insimul_conversations';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const record = { ...conversation, id: `local-${Date.now()}`, createdAt: new Date().toISOString() };
      existing.push(record);
      localStorage.setItem(key, JSON.stringify(existing));
      return record;
    } catch { return conversation; }
  }

  async updateConversation(_playthroughId: string, conversationId: string, updates: any): Promise<any> {
    try {
      const key = 'insimul_conversations';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = existing.findIndex((c: any) => c.id === conversationId);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...updates };
        localStorage.setItem(key, JSON.stringify(existing));
        return existing[idx];
      }
    } catch { /* noop */ }
    return updates;
  }

  async getConversations(_playthroughId: string, _npcCharacterId?: string): Promise<any[]> {
    try {
      return JSON.parse(localStorage.getItem('insimul_conversations') || '[]');
    } catch { return []; }
  }
}

/**
 * Factory to create the appropriate data source
 */
export function createDataSource(authToken?: string): DataSource {
  // Check if we're in an exported environment (no API available)
  if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
    return new FileDataSource();
  }
  
  // Check if we have an auth token (Insimul environment)
  if (authToken) {
    return new ApiDataSource(authToken);
  }
  
  // Default to file-based for safety
  return new FileDataSource();
}
