/**
 * Unity Scene Generator
 *
 * Generates a JSON-based scene description that the Unity GameManager
 * reads at runtime to spawn GameObjects. Binary .unity scene files
 * cannot be generated server-side, so this uses a descriptor pattern.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './unity-project-generator';

// ─────────────────────────────────────────────
// Scene descriptor types
// ─────────────────────────────────────────────

interface SceneDescriptor {
  version: number;
  worldName: string;
  seed: string;
  terrain: TerrainDesc;
  lighting: LightingDesc;
  playerStart: { position: { x: number; y: number; z: number } };
  settlements: SettlementDesc[];
  buildings: BuildingDesc[];
  npcs: NPCDesc[];
  roads: RoadDesc[];
}

interface TerrainDesc {
  size: number;
  groundColor: [number, number, number];
}

interface LightingDesc {
  ambientColor: [number, number, number];
  ambientIntensity: number;
  directionalDirection: [number, number, number];
  directionalIntensity: number;
  skyColor: [number, number, number];
  fogEnabled: boolean;
  fogDensity: number;
}

interface SettlementDesc {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  radius: number;
  population: number;
}

interface BuildingDesc {
  id: string;
  settlementId: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  role: string;
  floors: number;
  width: number;
  depth: number;
  modelAssetKey: string | null;
}

interface NPCDesc {
  characterId: string;
  role: string;
  position: { x: number; y: number; z: number };
  patrolRadius: number;
  disposition: number;
  settlementId: string | null;
}

interface RoadDesc {
  fromId: string;
  toId: string;
  width: number;
  waypoints: { x: number; y: number; z: number }[];
}

// ─────────────────────────────────────────────
// Generator
// ─────────────────────────────────────────────

function buildSceneDescriptor(ir: WorldIR): SceneDescriptor {
  const v = ir.theme.visualTheme;

  return {
    version: 1,
    worldName: ir.meta.worldName,
    seed: ir.meta.seed,

    terrain: {
      size: ir.geography.terrainSize,
      groundColor: [v.groundColor.r, v.groundColor.g, v.groundColor.b],
    },

    lighting: {
      ambientColor: ir.theme.ambientLighting.color as [number, number, number],
      ambientIntensity: ir.theme.ambientLighting.intensity,
      directionalDirection: ir.theme.directionalLight.direction as [number, number, number],
      directionalIntensity: ir.theme.directionalLight.intensity,
      skyColor: [v.skyColor.r, v.skyColor.g, v.skyColor.b],
      fogEnabled: !!ir.theme.fog,
      fogDensity: ir.theme.fog?.density || 0,
    },

    playerStart: {
      position: ir.player.startPosition,
    },

    settlements: ir.geography.settlements.map(s => ({
      id: s.id,
      name: s.name,
      type: s.settlementType,
      position: s.position,
      radius: s.radius,
      population: s.population,
    })),

    buildings: ir.entities.buildings.map(b => ({
      id: b.id,
      settlementId: b.settlementId,
      position: b.position,
      rotation: b.rotation,
      role: b.spec.buildingRole,
      floors: b.spec.floors,
      width: b.spec.width,
      depth: b.spec.depth,
      modelAssetKey: b.modelAssetKey,
    })),

    npcs: ir.entities.npcs.map(n => ({
      characterId: n.characterId,
      role: n.role,
      position: n.homePosition,
      patrolRadius: n.patrolRadius,
      disposition: n.disposition,
      settlementId: n.settlementId,
    })),

    roads: ir.entities.roads.map(r => ({
      fromId: r.fromId,
      toId: r.toId,
      width: r.width,
      waypoints: r.waypoints,
    })),
  };
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateSceneFiles(ir: WorldIR): GeneratedFile[] {
  const descriptor = buildSceneDescriptor(ir);

  return [
    {
      path: 'Assets/Resources/Data/SceneDescriptor.json',
      content: JSON.stringify(descriptor, null, 2),
    },
  ];
}
