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
  waterFeatures: WaterFeatureActorDesc[];
  containers: ContainerActorDesc[];
  foliage: FoliageLayerDesc[];
  interiorTemplates: Record<string, InteriorTemplateDesc>;
  townSquares: TownSquareDesc[];
  outdoorFurniture: OutdoorFurnitureDesc[];
}

interface TerrainDesc {
  sizeUnreal: number; // cm
  heightmapResolution: number; // grid dimension (e.g. 128)
  elevationScale: number; // heightmap [0,1] * this = world meters
  groundColorLinear: [number, number, number];
  material: string | null;
  heightmap: number[][] | null;
  slopeMap: number[][] | null;
  terrainFeatures: any[];
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

interface WaterFeatureActorDesc {
  id: string;
  type: string;
  position: { X: number; Y: number; Z: number };
  size: { width: number; depth: number; waterLevel: number }; // cm
  riverPath: { X: number; Y: number; Z: number }[];
  color: [number, number, number] | null;
}

interface ContainerActorDesc {
  id: string;
  buildingId: string;
  containerType: string;
  position: { X: number; Y: number; Z: number };
  location: 'interior' | 'outdoor';
  lootTable: Array<{ itemName: string; itemType: string; quantity: number; rarity?: string }>;
}

interface FoliageLayerDesc {
  type: string;
  biome: string;
  settlementId: string;
  density: number;
  scaleRange: [number, number];
  maxSlope: number;
  elevationRange: [number, number];
  instanceCount: number;
}

interface InteriorTemplateDesc {
  mode: 'model' | 'procedural';
  assetPath: string | null;
  roomTemplates: Array<{
    width: number;   // cm
    depth: number;   // cm
    height: number;  // cm
    furnitureCount: number;
  }>;
}

interface TownSquareDesc {
  settlementId: string;
  settlementName: string;
  position: { X: number; Y: number; Z: number };
  radius: number; // cm
}

interface OutdoorFurnitureDesc {
  settlementId: string;
  density: number;
  types: string[];
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
      heightmapResolution: ir.geography.heightmap?.length ?? 0,
      elevationScale: 20, // heightmap [0,1] * 20 = world meters
      groundColorLinear: [v.groundColor.r, v.groundColor.g, v.groundColor.b],
      material: null,
      heightmap: ir.geography.heightmap ?? null,
      slopeMap: ir.geography.slopeMap ?? null,
      terrainFeatures: ir.geography.terrainFeatures,
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

    // ── Water features ──────────────────────────────────────────────────
    waterFeatures: (ir.geography.waterFeatures ?? []).map(wf => ({
      id: wf.id,
      type: wf.type,
      position: toUE(wf.position),
      size: {
        width: wf.width * 100,
        depth: wf.depth * 100,
        waterLevel: wf.waterLevel * 100,
      },
      riverPath: wf.shorelinePoints.map(p => toUE(p)),
      color: wf.color ? [wf.color.r, wf.color.g, wf.color.b] as [number, number, number] : null,
    })),

    // ── Containers ──────────────────────────────────────────────────────
    containers: (ir.entities.containers ?? []).map(c => ({
      id: c.id,
      buildingId: c.buildingId,
      containerType: c.containerType,
      position: toUE(c.position),
      location: c.location,
      lootTable: c.items,
    })),

    // ── Foliage / nature scatter layers ─────────────────────────────────
    foliage: (ir.geography.foliageLayers ?? []).map(fl => ({
      type: fl.type,
      biome: fl.biome,
      settlementId: fl.settlementId,
      density: fl.density,
      scaleRange: fl.scaleRange,
      maxSlope: fl.maxSlope,
      elevationRange: fl.elevationRange,
      instanceCount: fl.instances.length,
    })),

    // ── Interior templates per building ─────────────────────────────────
    interiorTemplates: Object.fromEntries(
      ir.entities.buildings
        .filter(b => b.interior)
        .map(b => [
          b.id,
          {
            mode: (b.modelAssetKey ? 'model' : 'procedural') as 'model' | 'procedural',
            assetPath: b.modelAssetKey ?? null,
            roomTemplates: b.interior ? [{
              width: b.interior.width * 100,
              depth: b.interior.depth * 100,
              height: b.interior.height * 100,
              furnitureCount: b.interior.furniture?.length ?? 0,
            }] : [],
          },
        ]),
    ),

    // ── Town squares (one per settlement center) ────────────────────────
    townSquares: ir.geography.settlements.map(s => ({
      settlementId: s.id,
      settlementName: s.name,
      position: toUE(s.position),
      radius: Math.min(s.radius * 0.15, 50) * 100, // 15% of settlement radius, max 50m → cm
    })),

    // ── Outdoor furniture per settlement ────────────────────────────────
    outdoorFurniture: ir.geography.settlements.map(s => ({
      settlementId: s.id,
      density: Math.min(s.population / 100, 1.0), // scale with population, cap at 1.0
      types: ['bench', 'lantern', 'signpost', 'barrel', 'cart', 'well'],
    })),
  };
}

// ─────────────────────────────────────────────
// Main Menu Level Descriptor
// ─────────────────────────────────────────────

interface MainMenuLevelDescriptor {
  version: number;
  levelType: 'main_menu';
  worldName: string;
  title: string;
  backgroundImage: string;
  buttons: { label: string; action: string }[];
  settingsCategories: string[];
  gameLevelName: string;
}

function buildMainMenuLevelDescriptor(ir: WorldIR): MainMenuLevelDescriptor {
  const menu = ir.ui?.menuConfig;

  return {
    version: 1,
    levelType: 'main_menu',
    worldName: ir.meta.worldName,
    title: menu?.mainMenu?.title ?? ir.meta.worldName,
    backgroundImage: menu?.mainMenu?.backgroundImage ?? '',
    buttons: (menu?.mainMenu?.buttons ?? []).map(b => ({
      label: b.label,
      action: b.action,
    })),
    settingsCategories: (menu?.settingsMenu?.categories ?? []).map(c => c.name),
    gameLevelName: 'GameLevel',
  };
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateLevelFiles(ir: WorldIR): GeneratedFile[] {
  const descriptor = buildLevelDescriptor(ir);
  const menuDescriptor = buildMainMenuLevelDescriptor(ir);

  return [
    {
      path: 'Content/Data/LevelDescriptor.json',
      content: JSON.stringify(descriptor, null, 2),
    },
    {
      path: 'Content/Data/MainMenuLevel.json',
      content: JSON.stringify(menuDescriptor, null, 2),
    },
  ];
}
