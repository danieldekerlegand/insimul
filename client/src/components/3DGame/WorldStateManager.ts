/**
 * WorldStateManager — Serializes and deserializes game state for save/load.
 *
 * Collects state from BabylonGame systems (inventory, NPCs, romance, etc.)
 * and persists via the DataSource API. Supports 3 save slots per world,
 * auto-save every 5 minutes, and incremental (diff-based) saves.
 */

import type { DataSource } from './DataSource';
import type {
  GameSaveState,
  SavedNPCState,
  SavedMerchantState,
  InventoryItem,
  Vec3,
} from '@shared/game-engine/types';

const SAVE_VERSION = 1;
const AUTO_SAVE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_SAVE_SLOTS = 3;

/** Minimal interface for the game instance properties we need to serialize. */
export interface GameStateSource {
  getPlayerPosition(): Vec3;
  getPlayerRotation(): Vec3;
  getPlayerGold(): number;
  getPlayerHealth(): number;
  getPlayerEnergy(): number;
  getInventoryItems(): InventoryItem[];
  getNPCStates(): SavedNPCState[];
  getRelationships(): Record<string, Record<string, { type: string; strength: number; trust?: number }>>;
  getRomanceData(): any;
  getMerchantStates(): SavedMerchantState[];
  getCurrentZone(): { id: string; name: string; type: string } | null;
  getQuestProgress(): Record<string, any>;
  getGameTime(): number;
  getWorldId(): string;
  getPlaythroughId(): string | null;
}

/** Minimal interface for restoring state back into the game. */
export interface GameStateTarget {
  restorePlayerPosition(position: Vec3, rotation: Vec3): void;
  restorePlayerStats(gold: number, health: number, energy: number): void;
  restoreInventory(items: InventoryItem[]): void;
  restoreNPCStates(npcs: SavedNPCState[]): void;
  restoreRelationships(relationships: Record<string, Record<string, { type: string; strength: number; trust?: number }>>): void;
  restoreRomanceData(data: any): void;
  restoreMerchantStates(merchants: SavedMerchantState[]): void;
  restoreCurrentZone(zone: { id: string; name: string; type: string } | null): void;
  restoreQuestProgress(progress: Record<string, any>): void;
  restoreGameTime(time: number): void;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export class WorldStateManager {
  private dataSource: DataSource;
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
  private lastSavedState: GameSaveState | null = null;
  private gameSource: GameStateSource | null = null;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  /** Register the game instance as the source/target of state. */
  setGameSource(source: GameStateSource): void {
    this.gameSource = source;
  }

  /** Start auto-saving every 5 minutes. */
  startAutoSave(slotIndex: number = 0): void {
    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => {
      this.save(slotIndex).catch((err) =>
        console.error('[WorldStateManager] Auto-save failed:', err)
      );
    }, AUTO_SAVE_INTERVAL_MS);
  }

  /** Stop auto-save timer. */
  stopAutoSave(): void {
    if (this.autoSaveTimer != null) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /** Capture current game state into a serializable object. */
  captureState(slotIndex: number): GameSaveState {
    if (!this.gameSource) {
      throw new Error('No game source registered');
    }
    const src = this.gameSource;
    return {
      version: SAVE_VERSION,
      slotIndex,
      savedAt: new Date().toISOString(),
      gameTime: src.getGameTime(),
      player: {
        position: src.getPlayerPosition(),
        rotation: src.getPlayerRotation(),
        gold: src.getPlayerGold(),
        health: src.getPlayerHealth(),
        energy: src.getPlayerEnergy(),
        inventory: src.getInventoryItems(),
      },
      npcs: src.getNPCStates(),
      relationships: src.getRelationships(),
      romance: src.getRomanceData(),
      merchants: src.getMerchantStates(),
      currentZone: src.getCurrentZone(),
      questProgress: src.getQuestProgress(),
    };
  }

  /** Compute incremental diff between current and last saved state. */
  computeDiff(current: GameSaveState): Partial<GameSaveState> | null {
    if (!this.lastSavedState) return current;
    const diff: any = {};
    let hasDiff = false;

    // Always include metadata
    diff.version = current.version;
    diff.slotIndex = current.slotIndex;
    diff.savedAt = current.savedAt;
    diff.gameTime = current.gameTime;

    if (!deepEqual(current.player, this.lastSavedState.player)) {
      diff.player = current.player;
      hasDiff = true;
    }
    if (!deepEqual(current.npcs, this.lastSavedState.npcs)) {
      diff.npcs = current.npcs;
      hasDiff = true;
    }
    if (!deepEqual(current.relationships, this.lastSavedState.relationships)) {
      diff.relationships = current.relationships;
      hasDiff = true;
    }
    if (!deepEqual(current.romance, this.lastSavedState.romance)) {
      diff.romance = current.romance;
      hasDiff = true;
    }
    if (!deepEqual(current.merchants, this.lastSavedState.merchants)) {
      diff.merchants = current.merchants;
      hasDiff = true;
    }
    if (!deepEqual(current.currentZone, this.lastSavedState.currentZone)) {
      diff.currentZone = current.currentZone;
      hasDiff = true;
    }
    if (!deepEqual(current.questProgress, this.lastSavedState.questProgress)) {
      diff.questProgress = current.questProgress;
      hasDiff = true;
    }

    return hasDiff ? diff : null;
  }

  /** Save game state to a specific slot. Returns true if data was saved. */
  async save(slotIndex: number = 0): Promise<boolean> {
    if (!this.gameSource) {
      console.warn('[WorldStateManager] No game source — skipping save');
      return false;
    }

    const worldId = this.gameSource.getWorldId();
    const playthroughId = this.gameSource.getPlaythroughId();
    if (!worldId || !playthroughId) {
      console.warn('[WorldStateManager] Missing worldId or playthroughId — skipping save');
      return false;
    }

    const state = this.captureState(slotIndex);
    const diff = this.computeDiff(state);
    if (!diff) {
      console.log('[WorldStateManager] No changes to save');
      return false;
    }

    // Send full state for the slot (server stores by slot index)
    await this.dataSource.saveGameState(worldId, playthroughId, slotIndex, state);
    this.lastSavedState = state;
    console.log(`[WorldStateManager] Saved to slot ${slotIndex}`);
    return true;
  }

  /** Load game state from a specific slot and apply to the game. */
  async load(target: GameStateTarget, worldId: string, playthroughId: string, slotIndex: number = 0): Promise<boolean> {
    const state = await this.dataSource.loadGameState(worldId, playthroughId, slotIndex);
    if (!state) {
      console.warn(`[WorldStateManager] No save data in slot ${slotIndex}`);
      return false;
    }

    this.applyState(target, state);
    this.lastSavedState = state;
    console.log(`[WorldStateManager] Loaded from slot ${slotIndex}`);
    return true;
  }

  /** Apply a saved state to the game target. */
  applyState(target: GameStateTarget, state: GameSaveState): void {
    if (state.player) {
      target.restorePlayerPosition(state.player.position, state.player.rotation);
      target.restorePlayerStats(state.player.gold, state.player.health, state.player.energy);
      target.restoreInventory(state.player.inventory);
    }
    if (state.npcs) {
      target.restoreNPCStates(state.npcs);
    }
    if (state.relationships) {
      target.restoreRelationships(state.relationships);
    }
    if (state.romance != null) {
      target.restoreRomanceData(state.romance);
    }
    if (state.merchants) {
      target.restoreMerchantStates(state.merchants);
    }
    if (state.currentZone !== undefined) {
      target.restoreCurrentZone(state.currentZone);
    }
    if (state.questProgress) {
      target.restoreQuestProgress(state.questProgress);
    }
    if (state.gameTime != null) {
      target.restoreGameTime(state.gameTime);
    }
  }

  /** List available save slots for a world/playthrough. */
  async listSaveSlots(worldId: string, playthroughId: string): Promise<Array<{ slotIndex: number; savedAt: string; gameTime: number } | null>> {
    const slots: Array<{ slotIndex: number; savedAt: string; gameTime: number } | null> = [];
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
      const state = await this.dataSource.loadGameState(worldId, playthroughId, i);
      if (state) {
        slots.push({ slotIndex: i, savedAt: state.savedAt, gameTime: state.gameTime });
      } else {
        slots.push(null);
      }
    }
    return slots;
  }

  /** Clean up timers. */
  dispose(): void {
    this.stopAutoSave();
    this.gameSource = null;
    this.lastSavedState = null;
  }
}
