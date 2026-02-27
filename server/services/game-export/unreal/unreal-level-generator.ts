/**
 * Unreal Level Generator
 *
 * Generates a JSON-based level description that the UE5 GameMode reads
 * at runtime to spawn actors (buildings, NPCs, roads, nature, etc.).
 *
 * Binary .umap files cannot be generated server-side, so this approach
 * uses a JSON descriptor + C++ runtime spawner pattern.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './unreal-project-generator';

// ─────────────────────────────────────────────
// Coordinate conversion (Babylon Y-up → Unreal Z-up, m→cm)
// ─────────────────────────────────────────────

function toUE(v: { x: number; y: number; z: number }): { X: number; Y: number; Z: number } {
  return { X: v.x * 100, Y: v.z * 100, Z: v.y * 100 };
}

// ─────────────────────────────────────────────
// Level descriptor types (written to JSON)
// ─────────────────────────────────────────────

interface LevelDescriptor {
  version: number;
  worldName: string;
  seed: string;
  terrain: TerrainDesc;
  lighting: LightingDesc;
  playerStart: { position: { X: number; Y: number; Z: number } };
  settlements: SettlementActorDesc[];
  buildings: BuildingActorDesc[];
  npcs: NPCActorDesc[];
  roads: RoadActorDesc[];
  nature: NatureDesc;
}

interface TerrainDesc {
  sizeUnreal: number; // cm
  groundColorLinear: [number, number, number];
  material: string | null;
}

interface LightingDesc {
  ambientColor: [number, number, number];
  ambientIntensity: number;
  directionalDirection: [number, number, number];
  directionalIntensity: number;
  skyColor: [number, number, number];
  fogEnabled: boolean;
  fogDensity: number;
  fogColor: [number, number, number] | null;
}

interface SettlementActorDesc {
  id: string;
  name: string;
  type: string;
  position: { X: number; Y: number; Z: number };
  radius: number; // cm
  population: number;
}

interface BuildingActorDesc {
  id: string;
  settlementId: string;
  position: { X: number; Y: number; Z: number };
  rotation: number;
  role: string;
  floors: number;
  width: number;  // cm
  depth: number;  // cm
  hasChimney: boolean;
  hasBalcony: boolean;
  modelAssetKey: string | null;
  businessId: string | null;
}

interface NPCActorDesc {
  characterId: string;
  role: string;
  position: { X: number; Y: number; Z: number };
  patrolRadius: number; // cm
  disposition: number;
  settlementId: string | null;
  questIds: string[];
}

interface RoadActorDesc {
  fromId: string;
  toId: string;
  width: number; // cm
  waypoints: { X: number; Y: number; Z: number }[];
}

interface NatureDesc {
  seed: string;
  terrainSize: number;
  biomeHint: string;
}

// ─────────────────────────────────────────────
// Generator
// ─────────────────────────────────────────────

function buildLevelDescriptor(ir: WorldIR): LevelDescriptor {
  const theme = ir.theme;
  const v = theme.visualTheme;

  return {
    version: 1,
    worldName: ir.meta.worldName,
    seed: ir.meta.seed,

    terrain: {
      sizeUnreal: ir.geography.terrainSize * 100,
      groundColorLinear: [v.groundColor.r, v.groundColor.g, v.groundColor.b],
      material: null,
    },

    lighting: {
      ambientColor: theme.ambientLighting.color as [number, number, number],
      ambientIntensity: theme.ambientLighting.intensity,
      directionalDirection: theme.directionalLight.direction as [number, number, number],
      directionalIntensity: theme.directionalLight.intensity,
      skyColor: [v.skyColor.r, v.skyColor.g, v.skyColor.b],
      fogEnabled: !!theme.fog,
      fogDensity: theme.fog?.density || 0,
      fogColor: theme.fog ? [theme.fog.color[0], theme.fog.color[1], theme.fog.color[2]] : null,
    },

    playerStart: {
      position: toUE(ir.player.startPosition),
    },

    settlements: ir.geography.settlements.map(s => ({
      id: s.id,
      name: s.name,
      type: s.settlementType,
      position: toUE(s.position),
      radius: s.radius * 100,
      population: s.population,
    })),

    buildings: ir.entities.buildings.map(b => ({
      id: b.id,
      settlementId: b.settlementId,
      position: toUE(b.position),
      rotation: b.rotation,
      role: b.spec.buildingRole,
      floors: b.spec.floors,
      width: b.spec.width * 100,
      depth: b.spec.depth * 100,
      hasChimney: b.spec.hasChimney,
      hasBalcony: b.spec.hasBalcony,
      modelAssetKey: b.modelAssetKey,
      businessId: b.businessId,
    })),

    npcs: ir.entities.npcs.map(n => ({
      characterId: n.characterId,
      role: n.role,
      position: toUE(n.homePosition),
      patrolRadius: n.patrolRadius * 100,
      disposition: n.disposition,
      settlementId: n.settlementId,
      questIds: n.questIds,
    })),

    roads: ir.entities.roads.map(r => ({
      fromId: r.fromId,
      toId: r.toId,
      width: r.width * 100,
      waypoints: r.waypoints.map(w => toUE(w)),
    })),

    nature: {
      seed: ir.meta.seed,
      terrainSize: ir.geography.terrainSize,
      biomeHint: ir.meta.worldType || 'default',
    },
  };
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateLevelFiles(ir: WorldIR): GeneratedFile[] {
  const descriptor = buildLevelDescriptor(ir);

  return [
    {
      path: 'Content/Data/LevelDescriptor.json',
      content: JSON.stringify(descriptor, null, 2),
    },
  ];
}
