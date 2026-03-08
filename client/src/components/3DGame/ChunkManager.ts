/**
 * ChunkManager - Spatial partitioning system for performance optimization.
 *
 * Divides the world into a grid of chunks and only enables meshes within
 * the player's active radius. Disabled meshes are completely skipped by
 * Babylon's render pipeline (geometry, shadows, physics).
 */

import { AbstractMesh, Vector3 } from '@babylonjs/core';

export interface ChunkManagerConfig {
  /** World size in world units (default 512) */
  worldSize: number;
  /** Size of each chunk in world units (default 64) */
  chunkSize: number;
  /** Number of chunks visible in each direction from the player (default 2) */
  renderRadius: number;
}

interface Chunk {
  x: number;
  z: number;
  meshes: AbstractMesh[];
  active: boolean;
}

export class ChunkManager {
  private chunks: Map<string, Chunk> = new Map();
  private currentChunkX = Infinity;
  private currentChunkZ = Infinity;
  private config: ChunkManagerConfig;

  constructor(config: Partial<ChunkManagerConfig> = {}) {
    this.config = {
      worldSize: config.worldSize ?? 512,
      chunkSize: config.chunkSize ?? 64,
      renderRadius: config.renderRadius ?? 2,
    };
  }

  private chunkKey(cx: number, cz: number): string {
    return `${cx},${cz}`;
  }

  private worldToChunk(worldX: number, worldZ: number): [number, number] {
    const half = this.config.worldSize / 2;
    const cx = Math.floor((worldX + half) / this.config.chunkSize);
    const cz = Math.floor((worldZ + half) / this.config.chunkSize);
    return [cx, cz];
  }

  /**
   * Register a mesh with the chunk system. The mesh's current position
   * determines which chunk it belongs to.
   */
  registerMesh(mesh: AbstractMesh): void {
    const pos = mesh.getAbsolutePosition();
    const [cx, cz] = this.worldToChunk(pos.x, pos.z);
    const key = this.chunkKey(cx, cz);

    let chunk = this.chunks.get(key);
    if (!chunk) {
      chunk = { x: cx, z: cz, meshes: [], active: false };
      this.chunks.set(key, chunk);
    }
    chunk.meshes.push(mesh);
  }

  /**
   * Register multiple meshes at once.
   */
  registerMeshes(meshes: AbstractMesh[]): void {
    for (const mesh of meshes) {
      if (!mesh.isDisposed()) {
        this.registerMesh(mesh);
      }
    }
  }

  /**
   * Update the active chunk set based on the player's position.
   * Returns true if the active set changed.
   */
  update(playerPosition: Vector3): boolean {
    const [cx, cz] = this.worldToChunk(playerPosition.x, playerPosition.z);

    // No change if player is in the same chunk
    if (cx === this.currentChunkX && cz === this.currentChunkZ) {
      return false;
    }

    this.currentChunkX = cx;
    this.currentChunkZ = cz;

    const r = this.config.renderRadius;

    // Determine which chunks should be active
    const activeKeys = new Set<string>();
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        activeKeys.add(this.chunkKey(cx + dx, cz + dz));
      }
    }

    let changed = false;

    this.chunks.forEach((chunk, key) => {
      const shouldBeActive = activeKeys.has(key);

      if (shouldBeActive && !chunk.active) {
        // Activate chunk
        chunk.active = true;
        for (const mesh of chunk.meshes) {
          if (!mesh.isDisposed()) {
            mesh.setEnabled(true);
          }
        }
        changed = true;
      } else if (!shouldBeActive && chunk.active) {
        // Deactivate chunk
        chunk.active = false;
        for (const mesh of chunk.meshes) {
          if (!mesh.isDisposed()) {
            mesh.setEnabled(false);
          }
        }
        changed = true;
      }
    });

    return changed;
  }

  /**
   * Force-activate all chunks (e.g., for debugging or minimap rendering).
   */
  activateAll(): void {
    this.chunks.forEach((chunk) => {
      chunk.active = true;
      for (const mesh of chunk.meshes) {
        if (!mesh.isDisposed()) {
          mesh.setEnabled(true);
        }
      }
    });
  }

  /**
   * Get stats for debugging.
   */
  getStats(): { totalChunks: number; activeChunks: number; totalMeshes: number; activeMeshes: number } {
    let activeChunks = 0;
    let totalMeshes = 0;
    let activeMeshes = 0;

    this.chunks.forEach((chunk) => {
      if (chunk.active) activeChunks++;
      totalMeshes += chunk.meshes.length;
      if (chunk.active) activeMeshes += chunk.meshes.length;
    });

    return {
      totalChunks: this.chunks.size,
      activeChunks,
      totalMeshes,
      activeMeshes,
    };
  }

  /**
   * Remove all meshes and reset state.
   */
  dispose(): void {
    this.chunks.clear();
    this.currentChunkX = Infinity;
    this.currentChunkZ = Infinity;
  }
}
