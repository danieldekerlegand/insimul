/**
 * Unity Scene Generator
 *
 * Generates both:
 * 1. A JSON-based scene descriptor for runtime data loading
 * 2. A Force Text .unity scene file (YAML) with camera, lighting,
 *    environment, and EventSystem GameObjects
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
  waterFeatures: WaterFeatureDesc[];
}

interface TerrainDesc {
  size: number;
  heightmap: number[][] | null;
  slopeMap: number[][] | null;
  terrainFeatures: any[];
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

interface WaterFeatureDesc {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  waterLevel: number;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number; centerX: number; centerZ: number } | null;
  depth: number;
  width: number;
  flowDirection: { x: number; y: number; z: number } | null;
  flowSpeed: number;
  shorelinePoints: { x: number; y: number; z: number }[];
  transparency: number;
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
      heightmap: ir.geography.heightmap ?? null,
      slopeMap: ir.geography.slopeMap ?? null,
      terrainFeatures: ir.geography.terrainFeatures,
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

    waterFeatures: ir.geography.waterFeatures.map(w => ({
      id: w.id,
      name: w.name,
      type: w.type,
      position: w.position,
      waterLevel: w.waterLevel,
      bounds: w.bounds,
      depth: w.depth,
      width: w.width,
      flowDirection: w.flowDirection,
      flowSpeed: w.flowSpeed,
      shorelinePoints: w.shorelinePoints,
      transparency: w.transparency,
    })),
  };
}

// ─────────────────────────────────────────────
// Unity YAML scene file generation
// ─────────────────────────────────────────────

// Unity class IDs (from YAML ClassIDReference)
const UNITY_CLASS = {
  GameObject: 1,
  Transform: 4,
  Camera: 20,
  Light: 108,
  AudioListener: 81,
  RenderSettings: 104,
  LightmapSettings: 157,
  NavMeshSettings: 196,
  OcclusionCullingSettings: 29,
  MonoBehaviour: 114,
} as const;

/**
 * Compute a quaternion rotation from a directional light direction vector.
 * Unity lights shine along their local Z-axis (forward), so we compute
 * the rotation that points forward in the given direction.
 */
function directionToQuaternion(dir: [number, number, number]): { x: number; y: number; z: number; w: number } {
  // Normalize
  const len = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]);
  if (len < 0.0001) return { x: 0.5, y: -0.5, z: 0.5, w: 0.5 }; // default: pointing down

  const nx = dir[0] / len;
  const ny = dir[1] / len;
  const nz = dir[2] / len;

  // Build rotation from forward vector (0,0,1) to (nx, ny, nz)
  // Using the half-vector method for quaternion from two vectors
  const dot = nz; // dot product of (0,0,1) and (nx,ny,nz)
  if (dot > 0.9999) return { x: 0, y: 0, z: 0, w: 1 };
  if (dot < -0.9999) return { x: 0, y: 1, z: 0, w: 0 };

  // cross product of (0,0,1) x (nx,ny,nz) = (-ny, nx, 0)
  const cx = -ny;
  const cy = nx;
  const cz = 0;
  const w = 1 + dot;
  const qLen = Math.sqrt(cx * cx + cy * cy + cz * cz + w * w);
  return { x: cx / qLen, y: cy / qLen, z: cz / qLen, w: w / qLen };
}

function yamlFloat(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(6).replace(/0+$/, '0');
}

/**
 * Generate the .unity scene YAML with camera, lighting, environment,
 * and EventSystem GameObjects in Unity's Force Text format.
 */
export function generateUnitySceneYaml(ir: WorldIR): string {
  const theme = ir.theme;
  const v = theme.visualTheme;
  const sp = ir.player.startPosition;

  // fileID counter — must be unique per object within the scene
  let nextFileId = 100;
  function allocId(): number {
    return nextFileId++;
  }

  // Pre-allocate all fileIDs for cross-referencing
  const ids = {
    // Scene root
    rootGO: allocId(),
    rootTransform: allocId(),
    // Main Camera
    cameraGO: allocId(),
    cameraTransform: allocId(),
    cameraComponent: allocId(),
    audioListener: allocId(),
    // Directional Light
    lightGO: allocId(),
    lightTransform: allocId(),
    lightComponent: allocId(),
    // EventSystem
    eventSystemGO: allocId(),
    eventSystemTransform: allocId(),
    eventSystemComponent: allocId(),
    inputModule: allocId(),
  };

  const lines: string[] = [];

  function emit(text: string): void {
    lines.push(text);
  }

  // ── YAML header ──
  emit('%YAML 1.1');
  emit('%TAG !u! tag:unity3d.com,2011:');

  // ── OcclusionCullingSettings ──
  emit(`--- !u!${UNITY_CLASS.OcclusionCullingSettings} &1`);
  emit('OcclusionCullingSettings:');
  emit('  serializedVersion: 2');
  emit('  m_ObjectHideFlags: 0');

  // ── RenderSettings (environment: ambient, fog, skybox) ──
  const ambColor = theme.ambientLighting.color;
  const ambIntensity = theme.ambientLighting.intensity;
  const fogColor = theme.fog?.color ?? [0.5, 0.5, 0.5];
  const fogDensity = theme.fog?.density ?? 0;
  const fogEnabled = theme.fog ? 1 : 0;

  emit(`--- !u!${UNITY_CLASS.RenderSettings} &2`);
  emit('RenderSettings:');
  emit('  serializedVersion: 9');
  emit('  m_ObjectHideFlags: 0');
  emit('  m_Fog: ' + fogEnabled);
  emit(`  m_FogColor: {r: ${yamlFloat(fogColor[0])}, g: ${yamlFloat(fogColor[1])}, b: ${yamlFloat(fogColor[2])}, a: 1}`);
  emit('  m_FogMode: 3'); // Exponential squared
  emit(`  m_FogDensity: ${yamlFloat(fogDensity)}`);
  emit('  m_LinearFogStart: 0');
  emit('  m_LinearFogEnd: 300');
  emit(`  m_AmbientSkyColor: {r: ${yamlFloat(ambColor[0] * ambIntensity)}, g: ${yamlFloat(ambColor[1] * ambIntensity)}, b: ${yamlFloat(ambColor[2] * ambIntensity)}, a: 1}`);
  emit(`  m_AmbientEquatorColor: {r: ${yamlFloat(ambColor[0] * ambIntensity * 0.7)}, g: ${yamlFloat(ambColor[1] * ambIntensity * 0.7)}, b: ${yamlFloat(ambColor[2] * ambIntensity * 0.7)}, a: 1}`);
  emit(`  m_AmbientGroundColor: {r: ${yamlFloat(v.groundColor.r * 0.3)}, g: ${yamlFloat(v.groundColor.g * 0.3)}, b: ${yamlFloat(v.groundColor.b * 0.3)}, a: 1}`);
  emit('  m_AmbientMode: 0'); // Skybox
  emit(`  m_AmbientIntensity: ${yamlFloat(ambIntensity)}`);
  emit('  m_SkyboxMaterial: {fileID: 0}'); // No skybox material — use procedural
  emit(`  m_SubtractiveShadowColor: {r: 0.42, g: 0.478, b: 0.627, a: 1}`);
  emit(`  m_Sun: {fileID: ${ids.lightComponent}}`);

  // ── LightmapSettings ──
  emit(`--- !u!${UNITY_CLASS.LightmapSettings} &3`);
  emit('LightmapSettings:');
  emit('  serializedVersion: 12');
  emit('  m_ObjectHideFlags: 0');

  // ── NavMeshSettings ──
  emit(`--- !u!${UNITY_CLASS.NavMeshSettings} &4`);
  emit('NavMeshSettings:');
  emit('  serializedVersion: 2');
  emit('  m_ObjectHideFlags: 0');
  emit('  m_BuildSettings:');
  emit('    agentRadius: 0.5');
  emit('    agentHeight: 2');
  emit('    agentSlope: 45');
  emit('    agentClimb: 0.4');

  // ── Scene Root GameObject ──
  emit(`--- !u!${UNITY_CLASS.GameObject} &${ids.rootGO}`);
  emit('GameObject:');
  emit('  serializedVersion: 6');
  emit('  m_ObjectHideFlags: 0');
  emit(`  m_Component:`);
  emit(`  - component: {fileID: ${ids.rootTransform}}`);
  emit('  m_Layer: 0');
  emit('  m_Name: SceneRoot');
  emit('  m_TagString: Untagged');
  emit('  m_IsActive: 1');

  emit(`--- !u!${UNITY_CLASS.Transform} &${ids.rootTransform}`);
  emit('Transform:');
  emit(`  m_ObjectHideFlags: 0`);
  emit(`  m_GameObject: {fileID: ${ids.rootGO}}`);
  emit('  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}');
  emit('  m_LocalPosition: {x: 0, y: 0, z: 0}');
  emit('  m_LocalScale: {x: 1, y: 1, z: 1}');
  emit(`  m_Children:`);
  emit(`  - {fileID: ${ids.cameraTransform}}`);
  emit(`  - {fileID: ${ids.lightTransform}}`);
  emit(`  - {fileID: ${ids.eventSystemTransform}}`);
  emit('  m_Father: {fileID: 0}');

  // ── Main Camera GameObject ──
  emit(`--- !u!${UNITY_CLASS.GameObject} &${ids.cameraGO}`);
  emit('GameObject:');
  emit('  serializedVersion: 6');
  emit('  m_ObjectHideFlags: 0');
  emit('  m_Component:');
  emit(`  - component: {fileID: ${ids.cameraTransform}}`);
  emit(`  - component: {fileID: ${ids.cameraComponent}}`);
  emit(`  - component: {fileID: ${ids.audioListener}}`);
  emit('  m_Layer: 0');
  emit('  m_Name: Main Camera');
  emit('  m_TagString: MainCamera');
  emit('  m_IsActive: 1');

  emit(`--- !u!${UNITY_CLASS.Transform} &${ids.cameraTransform}`);
  emit('Transform:');
  emit(`  m_ObjectHideFlags: 0`);
  emit(`  m_GameObject: {fileID: ${ids.cameraGO}}`);
  emit('  m_LocalRotation: {x: 0.1, y: 0, z: 0, w: 0.995}');
  emit(`  m_LocalPosition: {x: ${yamlFloat(sp.x)}, y: ${yamlFloat(sp.y + 5)}, z: ${yamlFloat(sp.z - 8)}}`);
  emit('  m_LocalScale: {x: 1, y: 1, z: 1}');
  emit('  m_Children: []');
  emit(`  m_Father: {fileID: ${ids.rootTransform}}`);

  // Camera FOV defaults — PlayerIR doesn't have FOV so use sensible defaults
  const fov = 60;
  const nearClip = 0.3;
  const farClip = 1000;

  emit(`--- !u!${UNITY_CLASS.Camera} &${ids.cameraComponent}`);
  emit('Camera:');
  emit(`  m_ObjectHideFlags: 0`);
  emit(`  m_GameObject: {fileID: ${ids.cameraGO}}`);
  emit('  m_Enabled: 1');
  emit('  serializedVersion: 2');
  emit('  m_ClearFlags: 1'); // Skybox
  emit(`  m_BackGroundColor: {r: ${yamlFloat(v.skyColor.r)}, g: ${yamlFloat(v.skyColor.g)}, b: ${yamlFloat(v.skyColor.b)}, a: 0}`);
  emit('  m_projectionMatrixMode: 1'); // Physical
  emit(`  m_GateFitMode: 2`);
  emit(`  m_FOVAxisMode: 0`);
  emit(`  field of view: ${fov}`);
  emit(`  near clip plane: ${nearClip}`);
  emit(`  far clip plane: ${farClip}`);
  emit('  m_Depth: -1');
  emit('  m_TargetDisplay: 0');

  emit(`--- !u!${UNITY_CLASS.AudioListener} &${ids.audioListener}`);
  emit('AudioListener:');
  emit(`  m_ObjectHideFlags: 0`);
  emit(`  m_GameObject: {fileID: ${ids.cameraGO}}`);
  emit('  m_Enabled: 1');

  // ── Directional Light GameObject ──
  const lightDir = theme.directionalLight.direction as [number, number, number];
  const lightIntensity = theme.directionalLight.intensity;
  const lightRot = directionToQuaternion(lightDir);

  emit(`--- !u!${UNITY_CLASS.GameObject} &${ids.lightGO}`);
  emit('GameObject:');
  emit('  serializedVersion: 6');
  emit('  m_ObjectHideFlags: 0');
  emit('  m_Component:');
  emit(`  - component: {fileID: ${ids.lightTransform}}`);
  emit(`  - component: {fileID: ${ids.lightComponent}}`);
  emit('  m_Layer: 0');
  emit('  m_Name: Directional Light');
  emit('  m_TagString: Untagged');
  emit('  m_IsActive: 1');

  emit(`--- !u!${UNITY_CLASS.Transform} &${ids.lightTransform}`);
  emit('Transform:');
  emit(`  m_ObjectHideFlags: 0`);
  emit(`  m_GameObject: {fileID: ${ids.lightGO}}`);
  emit(`  m_LocalRotation: {x: ${yamlFloat(lightRot.x)}, y: ${yamlFloat(lightRot.y)}, z: ${yamlFloat(lightRot.z)}, w: ${yamlFloat(lightRot.w)}}`);
  emit('  m_LocalPosition: {x: 0, y: 20, z: 0}');
  emit('  m_LocalScale: {x: 1, y: 1, z: 1}');
  emit('  m_Children: []');
  emit(`  m_Father: {fileID: ${ids.rootTransform}}`);

  emit(`--- !u!${UNITY_CLASS.Light} &${ids.lightComponent}`);
  emit('Light:');
  emit(`  m_ObjectHideFlags: 0`);
  emit(`  m_GameObject: {fileID: ${ids.lightGO}}`);
  emit('  m_Enabled: 1');
  emit('  serializedVersion: 10');
  emit('  m_Type: 1'); // Directional
  emit('  m_Shape: 0');
  emit(`  m_Color: {r: 1, g: 0.956, b: 0.839, a: 1}`); // Warm sunlight
  emit(`  m_Intensity: ${yamlFloat(lightIntensity)}`);
  emit('  m_Range: 10');
  emit('  m_SpotAngle: 30');
  emit('  m_CookieSize: 10');
  emit('  m_Shadows:');
  emit('    m_Type: 2'); // Soft shadows
  emit('    m_Resolution: -1');
  emit('    m_Strength: 1');
  emit('    m_Bias: 0.05');
  emit('    m_NormalBias: 0.4');
  emit('    m_NearPlane: 0.2');
  emit('  m_DrawHalo: 0');
  emit('  m_Flare: {fileID: 0}');
  emit('  m_RenderMode: 0'); // Auto
  emit('  m_CullingMask:');
  emit('    serializedVersion: 2');
  emit('    m_Bits: 4294967295'); // Everything

  // ── EventSystem GameObject (for UI interaction) ──
  emit(`--- !u!${UNITY_CLASS.GameObject} &${ids.eventSystemGO}`);
  emit('GameObject:');
  emit('  serializedVersion: 6');
  emit('  m_ObjectHideFlags: 0');
  emit('  m_Component:');
  emit(`  - component: {fileID: ${ids.eventSystemTransform}}`);
  emit(`  - component: {fileID: ${ids.eventSystemComponent}}`);
  emit(`  - component: {fileID: ${ids.inputModule}}`);
  emit('  m_Layer: 0');
  emit('  m_Name: EventSystem');
  emit('  m_TagString: Untagged');
  emit('  m_IsActive: 1');

  emit(`--- !u!${UNITY_CLASS.Transform} &${ids.eventSystemTransform}`);
  emit('Transform:');
  emit(`  m_ObjectHideFlags: 0`);
  emit(`  m_GameObject: {fileID: ${ids.eventSystemGO}}`);
  emit('  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}');
  emit('  m_LocalPosition: {x: 0, y: 0, z: 0}');
  emit('  m_LocalScale: {x: 1, y: 1, z: 1}');
  emit('  m_Children: []');
  emit(`  m_Father: {fileID: ${ids.rootTransform}}`);

  // EventSystem component (MonoBehaviour referencing UnityEngine.EventSystems)
  emit(`--- !u!${UNITY_CLASS.MonoBehaviour} &${ids.eventSystemComponent}`);
  emit('MonoBehaviour:');
  emit(`  m_ObjectHideFlags: 0`);
  emit(`  m_GameObject: {fileID: ${ids.eventSystemGO}}`);
  emit('  m_Enabled: 1');
  emit('  m_EditorHideFlags: 0');
  emit('  m_Script: {fileID: -619905303, guid: f70555f144d8491a825f0804e09c671c, type: 3}');
  emit('  m_Name: ');
  emit('  m_FirstSelected: {fileID: 0}');
  emit('  m_sendNavigationEvents: 1');
  emit('  m_DragThreshold: 10');

  // StandaloneInputModule
  emit(`--- !u!${UNITY_CLASS.MonoBehaviour} &${ids.inputModule}`);
  emit('MonoBehaviour:');
  emit(`  m_ObjectHideFlags: 0`);
  emit(`  m_GameObject: {fileID: ${ids.eventSystemGO}}`);
  emit('  m_Enabled: 1');
  emit('  m_EditorHideFlags: 0');
  emit('  m_Script: {fileID: 1077351063, guid: f70555f144d8491a825f0804e09c671c, type: 3}');
  emit('  m_Name: ');
  emit('  m_HorizontalAxis: Horizontal');
  emit('  m_VerticalAxis: Vertical');
  emit('  m_SubmitButton: Submit');
  emit('  m_CancelButton: Cancel');

  return lines.join('\n') + '\n';
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
    {
      path: 'Assets/Scenes/Main.unity',
      content: generateUnitySceneYaml(ir),
    },
  ];
}
