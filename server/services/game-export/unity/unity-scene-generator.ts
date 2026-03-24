/**
 * Unity Scene Generator
 *
 * Generates Force Text .unity scene files in Unity's YAML serialization format.
 * Also generates the JSON scene descriptor for runtime data loading.
 *
 * Force Text scenes use YAML 1.1 with Unity's custom !u! tag prefix.
 * Each document in the file represents a Unity Object (GameObject, Component, etc.)
 * identified by a classID and fileID.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './unity-project-generator';
import { GuidRegistry } from './unity-guid-manager';

// ─────────────────────────────────────────────
// Unity class IDs (from Unity's YAML serialization)
// ─────────────────────────────────────────────

const CLASS_ID = {
  GameObject: 1,
  Transform: 4,
  Camera: 20,
  Light: 108,
  AudioListener: 81,
  MonoBehaviour: 114,
  OcclusionCullingSettings: 29,
  RenderSettings: 104,
  LightmapSettings: 157,
  NavMeshSettings: 196,
} as const;

// ─────────────────────────────────────────────
// Scene descriptor types (for JSON runtime data)
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
// YAML helpers
// ─────────────────────────────────────────────

const YAML_HEADER = '%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n';

function yamlDoc(classId: number, fileId: number, content: string): string {
  return `--- !u!${classId} &${fileId}\n${content}`;
}

function vec3(x: number, y: number, z: number): string {
  return `{x: ${x}, y: ${y}, z: ${z}}`;
}

function vec4(x: number, y: number, z: number, w: number): string {
  return `{x: ${x}, y: ${y}, z: ${z}, w: ${w}}`;
}

function color(r: number, g: number, b: number, a: number): string {
  return `{r: ${r}, g: ${g}, b: ${b}, a: ${a}}`;
}

// ─────────────────────────────────────────────
// Scene YAML generation
// ─────────────────────────────────────────────

function generateOcclusionCullingSettings(fileId: number): string {
  return yamlDoc(CLASS_ID.OcclusionCullingSettings, fileId,
`OcclusionCullingSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 2
  m_OcclusionBakeSettings:
    smallestOccluder: 5
    smallestHole: 0.25
    backfaceThreshold: 100
  m_SceneGUID: 00000000000000000000000000000000
  m_OcclusionCullingData: {fileID: 0}
`);
}

function generateRenderSettings(fileId: number, ir: WorldIR): string {
  const ambient = ir.theme.ambientLighting;
  const fog = ir.theme.fog;
  const sky = ir.theme.visualTheme.skyColor;

  return yamlDoc(CLASS_ID.RenderSettings, fileId,
`RenderSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 9
  m_Fog: ${fog ? 1 : 0}
  m_FogColor: ${color(sky.r, sky.g, sky.b, 1)}
  m_FogMode: 3
  m_FogDensity: ${fog?.density || 0}
  m_LinearFogStart: 0
  m_LinearFogEnd: 300
  m_AmbientSkyColor: ${color(ambient.color[0], ambient.color[1], ambient.color[2], 1)}
  m_AmbientEquatorColor: ${color(ambient.color[0] * 0.8, ambient.color[1] * 0.8, ambient.color[2] * 0.8, 1)}
  m_AmbientGroundColor: ${color(ambient.color[0] * 0.5, ambient.color[1] * 0.5, ambient.color[2] * 0.5, 1)}
  m_AmbientIntensity: ${ambient.intensity}
  m_AmbientMode: 0
  m_SubtractiveShadowColor: ${color(0.42, 0.478, 0.627, 1)}
  m_SkyboxMaterial: {fileID: 0}
  m_HaloStrength: 0.5
  m_FlareStrength: 1
  m_FlareFadeSpeed: 3
  m_HaloTexture: {fileID: 0}
  m_SpotCookie: {fileID: 0}
  m_DefaultReflectionMode: 0
  m_DefaultReflectionResolution: 128
  m_ReflectionBounces: 1
  m_ReflectionIntensity: 1
  m_CustomReflection: {fileID: 0}
  m_Sun: {fileID: 0}
  m_IndirectSpecularColor: ${color(0, 0, 0, 1)}
  m_UseRadianceAmbientProbe: 0
`);
}

function generateLightmapSettings(fileId: number): string {
  return yamlDoc(CLASS_ID.LightmapSettings, fileId,
`LightmapSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 12
  m_GIWorkflowMode: 1
  m_GISettings:
    serializedVersion: 2
    m_BounceScale: 1
    m_IndirectOutputScale: 1
    m_AlbedoBoost: 1
    m_EnvironmentLightingMode: 0
    m_EnableBakedLightmaps: 1
    m_EnableRealtimeLightmaps: 0
  m_LightmapEditorSettings:
    serializedVersion: 12
    m_Resolution: 2
    m_BakeResolution: 40
    m_AtlasSize: 1024
    m_AO: 0
    m_AOMaxDistance: 1
    m_CompAOExponent: 1
    m_CompAOExponentDirect: 0
    m_ExtractAmbientOcclusion: 0
    m_Padding: 2
    m_LightmapParameters: {fileID: 0}
    m_LightmapsBakeMode: 1
    m_TextureCompression: 1
    m_MixedBakeMode: 2
    m_BakeBackend: 1
    m_PVRSampling: 1
    m_PVRDirectSampleCount: 32
    m_PVRSampleCount: 512
    m_PVRBounces: 2
    m_PVREnvironmentSampleCount: 256
    m_PVREnvironmentReferencePointCount: 2048
    m_PVRFilteringMode: 1
    m_PVRDenoiserTypeDirect: 1
    m_PVRDenoiserTypeIndirect: 1
    m_PVRDenoiserTypeAO: 1
    m_PVRFilterTypeDirect: 0
    m_PVRFilterTypeIndirect: 0
    m_PVRFilterTypeAO: 0
    m_PVREnvironmentMIS: 1
    m_PVRCulling: 1
    m_PVRFilteringGaussRadiusDirect: 1
    m_PVRFilteringGaussRadiusIndirect: 5
    m_PVRFilteringGaussRadiusAO: 2
    m_PVRFilteringAtrousPositionSigmaDirect: 0.5
    m_PVRFilteringAtrousPositionSigmaIndirect: 2
    m_PVRFilteringAtrousPositionSigmaAO: 1
    m_ExportTrainingData: 0
    m_TrainingDataDestination: TrainingData
    m_LightProbeSampleCountMultiplier: 4
  m_LightingDataAsset: {fileID: 0}
  m_LightingSettings: {fileID: 0}
`);
}

function generateNavMeshSettings(fileId: number): string {
  return yamlDoc(CLASS_ID.NavMeshSettings, fileId,
`NavMeshSettings:
  serializedVersion: 2
  m_ObjectHideFlags: 0
  m_BuildSettings:
    serializedVersion: 3
    agentTypeID: 0
    agentRadius: 0.5
    agentHeight: 2
    agentSlope: 45
    agentClimb: 0.4
    ledgeDropHeight: 0
    maxJumpAcrossDistance: 0
    minRegionArea: 2
    manualCellSize: 0
    cellSize: 0.16666667
    manualTileSize: 0
    tileSize: 256
    buildHeightMesh: 0
    maxJobWorkers: 0
    preserveTilesOutsideBounds: 0
    debug:
      m_Flags: 0
  m_NavMeshData: {fileID: 0}
`);
}

interface GameObjectDef {
  name: string;
  fileIdGO: number;
  fileIdTransform: number;
  componentFileIds: { classId: number; fileId: number }[];
  parentTransformFileId: number;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  childTransformFileIds?: number[];
  tag?: string;
  layer?: number;
}

function generateGameObject(def: GameObjectDef): string {
  const allComponents = [
    { classId: CLASS_ID.Transform, fileId: def.fileIdTransform },
    ...def.componentFileIds,
  ];

  const goYaml = yamlDoc(CLASS_ID.GameObject, def.fileIdGO,
`GameObject:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  serializedVersion: 6
  m_Component:
${allComponents.map(c => `  - component: {fileID: ${c.fileId}}`).join('\n')}
  m_Layer: ${def.layer ?? 0}
  m_Name: ${def.name}
  m_TagString: ${def.tag ?? 'Untagged'}
  m_Icon: {fileID: 0}
  m_NavMeshLayer: 0
  m_StaticEditorFlags: 0
  m_IsActive: 1
`);

  const pos = def.position ?? { x: 0, y: 0, z: 0 };
  const rot = def.rotation ?? { x: 0, y: 0, z: 0 };

  const transformYaml = yamlDoc(CLASS_ID.Transform, def.fileIdTransform,
`Transform:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: ${def.fileIdGO}}
  serializedVersion: 2
  m_LocalRotation: ${vec4(rot.x, rot.y, rot.z, 1)}
  m_LocalPosition: ${vec3(pos.x, pos.y, pos.z)}
  m_LocalScale: ${vec3(1, 1, 1)}
  m_ConstrainProportionsScale: 0
  m_Children:
${(def.childTransformFileIds ?? []).map(id => `  - {fileID: ${id}}`).join('\n') || '  []'}
  m_Father: {fileID: ${def.parentTransformFileId}}
  m_LocalEulerAnglesHint: ${vec3(rot.x, rot.y, rot.z)}
`);

  return goYaml + transformYaml;
}

function generateCameraComponent(fileId: number, goFileId: number, fov: number): string {
  return yamlDoc(CLASS_ID.Camera, fileId,
`Camera:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: ${goFileId}}
  m_Enabled: 1
  serializedVersion: 2
  m_ClearFlags: 1
  m_BackGroundColor: {r: 0.19215687, g: 0.3019608, b: 0.4745098, a: 0}
  m_projectionMatrixMode: 1
  m_GateFitMode: 2
  m_FOVAxisMode: 0
  m_Iso: 200
  m_ShutterSpeed: 0.005
  m_Aperture: 16
  m_FocusDistance: 10
  m_FocalLength: 50
  m_BladeCount: 5
  m_Curvature: {x: 2, y: 11}
  m_BarrelClipping: 0.25
  m_Anamorphism: 0
  m_SensorSize: {x: 36, y: 24}
  m_LensShift: {x: 0, y: 0}
  m_NormalizedViewPortRect:
    serializedVersion: 2
    x: 0
    y: 0
    width: 1
    height: 1
  near clip plane: 0.3
  far clip plane: 1000
  field of view: ${fov}
  orthographic: 0
  orthographic size: 5
  m_Depth: -1
  m_CullingMask:
    serializedVersion: 2
    m_Bits: 4294967295
  m_RenderingPath: -1
  m_TargetTexture: {fileID: 0}
  m_TargetDisplay: 0
  m_TargetEye: 3
  m_HDR: 1
  m_AllowMSAA: 1
  m_AllowDynamicResolution: 0
  m_ForceIntoRenderTexture: 0
  m_OcclusionCulling: 1
  m_StereoConvergence: 10
  m_StereoSeparation: 0.022
`);
}

function generateAudioListenerComponent(fileId: number, goFileId: number): string {
  return yamlDoc(CLASS_ID.AudioListener, fileId,
`AudioListener:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: ${goFileId}}
  m_Enabled: 1
`);
}

function generateLightComponent(fileId: number, goFileId: number, ir: WorldIR): string {
  const dir = ir.theme.directionalLight;
  return yamlDoc(CLASS_ID.Light, fileId,
`Light:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: ${goFileId}}
  m_Enabled: 1
  serializedVersion: 10
  m_Type: 1
  m_Shape: 0
  m_Color: {r: 1, g: 0.95686275, b: 0.8392157, a: 1}
  m_Intensity: ${dir.intensity}
  m_Range: 10
  m_SpotAngle: 30
  m_InnerSpotAngle: 21.80208
  m_CookieSize: 10
  m_Shadows:
    m_Type: 2
    m_Resolution: -1
    m_CustomResolution: -1
    m_Strength: 1
    m_Bias: 0.05
    m_NormalBias: 0.4
    m_NearPlane: 0.2
    m_CullingMatrixOverride:
      e00: 1
      e01: 0
      e02: 0
      e03: 0
      e10: 0
      e11: 1
      e12: 0
      e13: 0
      e20: 0
      e21: 0
      e22: 1
      e23: 0
      e30: 0
      e31: 0
      e32: 0
      e33: 1
    m_UseCullingMatrixOverride: 0
  m_Cookie: {fileID: 0}
  m_DrawHalo: 0
  m_Flare: {fileID: 0}
  m_RenderMode: 0
  m_CullingMask:
    serializedVersion: 2
    m_Bits: 4294967295
  m_RenderingLayerMask: 1
  m_Lightmapping: 4
  m_LightShadowCasterMode: 0
  m_AreaSize: {x: 1, y: 1}
  m_BounceIntensity: 1
  m_ColorTemperature: 6570
  m_UseColorTemperature: 0
  m_BoundingSphereOverride: ${vec4(0, 0, 0, 0)}
  m_UseBoundingSphereOverride: 0
  m_UseViewFrustumForShadowCasterCull: 1
  m_ShadowRadius: 0
  m_ShadowAngle: 0
`);
}

/**
 * Build the complete Force Text .unity scene YAML from the WorldIR.
 */
export function buildSceneYaml(ir: WorldIR, registry: GuidRegistry): string {
  const parts: string[] = [YAML_HEADER];

  // Allocate fileIDs for scene-level settings
  const occlusionId = registry.getFileId('scene:occlusion');
  const renderId = registry.getFileId('scene:render');
  const lightmapId = registry.getFileId('scene:lightmap');
  const navmeshId = registry.getFileId('scene:navmesh');

  // Scene-level settings
  parts.push(generateOcclusionCullingSettings(occlusionId));
  parts.push(generateRenderSettings(renderId, ir));
  parts.push(generateLightmapSettings(lightmapId));
  parts.push(generateNavMeshSettings(navmeshId));

  // ── Main Camera ──
  const camGoId = registry.getFileId('camera:go');
  const camTransformId = registry.getFileId('camera:transform');
  const camComponentId = registry.getFileId('camera:camera');
  const camListenerId = registry.getFileId('camera:listener');

  const fov = 60; // Default FOV
  parts.push(generateGameObject({
    name: 'Main Camera',
    fileIdGO: camGoId,
    fileIdTransform: camTransformId,
    componentFileIds: [
      { classId: CLASS_ID.Camera, fileId: camComponentId },
      { classId: CLASS_ID.AudioListener, fileId: camListenerId },
    ],
    parentTransformFileId: 0,
    position: { x: 0, y: 10, z: -10 },
    rotation: { x: 30, y: 0, z: 0 },
    tag: 'MainCamera',
    layer: 0,
  }));
  parts.push(generateCameraComponent(camComponentId, camGoId, fov));
  parts.push(generateAudioListenerComponent(camListenerId, camGoId));

  // ── Directional Light ──
  const lightGoId = registry.getFileId('light:go');
  const lightTransformId = registry.getFileId('light:transform');
  const lightComponentId = registry.getFileId('light:component');
  const dir = ir.theme.directionalLight.direction;

  parts.push(generateGameObject({
    name: 'Directional Light',
    fileIdGO: lightGoId,
    fileIdTransform: lightTransformId,
    componentFileIds: [
      { classId: CLASS_ID.Light, fileId: lightComponentId },
    ],
    parentTransformFileId: 0,
    position: { x: 0, y: 3, z: 0 },
    rotation: { x: dir[0] * 50, y: dir[1] * 30, z: dir[2] },
  }));
  parts.push(generateLightComponent(lightComponentId, lightGoId, ir));

  // ── EventSystem ──
  const esGoId = registry.getFileId('eventsystem:go');
  const esTransformId = registry.getFileId('eventsystem:transform');

  parts.push(generateGameObject({
    name: 'EventSystem',
    fileIdGO: esGoId,
    fileIdTransform: esTransformId,
    componentFileIds: [],
    parentTransformFileId: 0,
  }));

  // ── GameManager (empty GO for script attachment) ──
  const gmGoId = registry.getFileId('gamemanager:go');
  const gmTransformId = registry.getFileId('gamemanager:transform');

  parts.push(generateGameObject({
    name: 'GameManager',
    fileIdGO: gmGoId,
    fileIdTransform: gmTransformId,
    componentFileIds: [],
    parentTransformFileId: 0,
  }));

  return parts.join('');
}

// ─────────────────────────────────────────────
// JSON scene descriptor (kept for runtime loading)
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

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateSceneFiles(ir: WorldIR, registry?: GuidRegistry): GeneratedFile[] {
  const descriptor = buildSceneDescriptor(ir);
  const reg = registry ?? new GuidRegistry();

  const sceneYaml = buildSceneYaml(ir, reg);

  return [
    {
      path: 'Assets/Scenes/Main.unity',
      content: sceneYaml,
    },
    {
      path: 'Assets/Resources/Data/SceneDescriptor.json',
      content: JSON.stringify(descriptor, null, 2),
    },
  ];
}
