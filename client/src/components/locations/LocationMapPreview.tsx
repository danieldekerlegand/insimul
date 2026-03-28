import { useEffect, useRef, useState, useCallback } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import * as GUI from '@babylonjs/gui';
import { Loader2, Maximize, Minimize, ZoomIn, ZoomOut, Pause, Play } from 'lucide-react';
import {
  generateStreetAlignedLots,
  type StreetSegment,
} from '../3DGame/StreetAlignedPlacement';
import { getBuildingDefaults, DEFAULT_BUILDING_DIMENSIONS } from '../../../../shared/game-engine/building-defaults';
import type { MapLayer } from './MapLayersPanel';

export type ViewLevel = 'world' | 'country' | 'settlement';

export interface StreetSegmentData {
  id: string;
  name: string;
  direction?: string;
  waypoints: { x: number; z: number }[];
  width?: number;
}

interface LocationMapPreviewProps {
  viewLevel: ViewLevel;
  countries: any[];
  settlements: any[];
  lots?: any[];
  businesses?: any[];
  residences?: any[];
  streets?: any[];
  waterFeatures?: any[];
  selectedCountryId?: string | null;
  worldId?: string;
  worldName?: string;
  onSettlementClick?: (settlement: any) => void;
  onCountryClick?: (country: any) => void;
  onBuildingClick?: (lotId: string) => void;
  className?: string;
  visibleLayers?: Set<MapLayer>;
}

// Deterministic hash for consistent positioning
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Seeded pseudo-random from hash
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

const TERRAIN_COLORS: Record<string, BABYLON.Color3> = {
  plains: new BABYLON.Color3(0.45, 0.65, 0.3),
  hills: new BABYLON.Color3(0.55, 0.55, 0.35),
  mountains: new BABYLON.Color3(0.5, 0.45, 0.4),
  coast: new BABYLON.Color3(0.4, 0.6, 0.7),
  river: new BABYLON.Color3(0.3, 0.5, 0.7),
  forest: new BABYLON.Color3(0.2, 0.5, 0.25),
  desert: new BABYLON.Color3(0.8, 0.72, 0.45),
};

const TERRAIN_GROUND: Record<string, BABYLON.Color3> = {
  plains: new BABYLON.Color3(0.35, 0.55, 0.2),
  hills: new BABYLON.Color3(0.45, 0.45, 0.25),
  mountains: new BABYLON.Color3(0.4, 0.35, 0.3),
  coast: new BABYLON.Color3(0.7, 0.68, 0.55),
  river: new BABYLON.Color3(0.35, 0.5, 0.35),
  forest: new BABYLON.Color3(0.15, 0.4, 0.15),
  desert: new BABYLON.Color3(0.75, 0.65, 0.35),
};

const SETTLEMENT_SCALE: Record<string, number> = {
  city: 1.0,
  town: 0.7,
  village: 0.45,
  hamlet: 0.3,
};

const WATER_COLORS: Record<string, { color: BABYLON.Color3; alpha: number }> = {
  ocean: { color: new BABYLON.Color3(0.05, 0.2, 0.45), alpha: 0.8 },
  lake: { color: new BABYLON.Color3(0.15, 0.35, 0.55), alpha: 0.75 },
  river: { color: new BABYLON.Color3(0.15, 0.35, 0.55), alpha: 0.7 },
  pond: { color: new BABYLON.Color3(0.12, 0.3, 0.42), alpha: 0.7 },
  stream: { color: new BABYLON.Color3(0.18, 0.4, 0.58), alpha: 0.65 },
  waterfall: { color: new BABYLON.Color3(0.6, 0.75, 0.9), alpha: 0.55 },
  marsh: { color: new BABYLON.Color3(0.18, 0.28, 0.2), alpha: 0.85 },
  canal: { color: new BABYLON.Color3(0.12, 0.32, 0.5), alpha: 0.72 },
};

function getWaterStyle(type: string): { color: BABYLON.Color3; alpha: number } {
  return WATER_COLORS[type] ?? WATER_COLORS.lake;
}

function getTerrainColor(terrain: string | null): BABYLON.Color3 {
  return TERRAIN_COLORS[(terrain ?? 'plains').toLowerCase()] ?? TERRAIN_COLORS.plains;
}

function getGroundColor(terrain: string | null): BABYLON.Color3 {
  return TERRAIN_GROUND[(terrain ?? 'plains').toLowerCase()] ?? TERRAIN_GROUND.plains;
}

// Map business types to model roles (mirrors ProceduralBuildingGenerator.getRoleForSpec)
function getModelRole(type: string, businessType?: string): string {
  if (type === 'residence') {
    if (businessType === 'residence_large') return 'largeResidence';
    if (businessType === 'residence_mansion') return 'mansion';
    return 'smallResidence';
  }
  if (type === 'business' && businessType) {
    const bt = businessType.toLowerCase();
    if (bt === 'tavern' || bt === 'inn') return 'tavern';
    if (bt === 'shop' || bt === 'market') return 'shop';
    if (bt === 'blacksmith') return 'blacksmith';
    if (bt === 'church') return 'church';
    if (bt === 'library') return 'library';
    if (bt === 'hospital') return 'hospital';
    if (bt === 'school') return 'school';
    if (bt === 'bank') return 'bank';
    if (bt === 'theater') return 'theater';
    if (bt === 'windmill') return 'windmill';
    if (bt === 'watermill') return 'watermill';
    if (bt.includes('lumber')) return 'lumbermill';
    if (bt.includes('barrack') || bt.includes('military')) return 'barracks';
    if (bt.includes('mine') || bt.includes('mining')) return 'mine';
    return 'default';
  }
  return 'default';
}

// Known environment/ground meshes to strip from prototypes
function isEnvMesh(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes('ground') || lower.includes('plane') ||
    lower.includes('floor') || lower.includes('terrain') ||
    lower.includes('environment') || lower.includes('backdrop');
}

// ─── Camera Animation ─────────────────────────────────────────────────────────

function animateCameraTo(
  camera: BABYLON.ArcRotateCamera,
  scene: BABYLON.Scene,
  target: BABYLON.Vector3,
  radius: number,
  beta: number,
  duration: number = 800,
) {
  const fps = 60;
  const frames = Math.round(fps * (duration / 1000));

  const animTarget = new BABYLON.Animation('camTarget', 'target', fps, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  animTarget.setKeys([{ frame: 0, value: camera.target.clone() }, { frame: frames, value: target }]);

  const animRadius = new BABYLON.Animation('camRadius', 'radius', fps, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  animRadius.setKeys([{ frame: 0, value: camera.radius }, { frame: frames, value: radius }]);

  const animBeta = new BABYLON.Animation('camBeta', 'beta', fps, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  animBeta.setKeys([{ frame: 0, value: camera.beta }, { frame: frames, value: beta }]);

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
  animTarget.setEasingFunction(easing);
  animRadius.setEasingFunction(easing);
  animBeta.setEasingFunction(easing);

  scene.beginDirectAnimation(camera, [animTarget, animRadius, animBeta], 0, frames, false);
}

// ─── Unified Scene Refs ──────────────────────────────────────────────────────

interface SceneRefs {
  pickableMap: Map<string, { type: 'settlement' | 'country'; data: any }>;
  /** World-space position for each settlement marker */
  settlementPositions: Map<string, BABYLON.Vector3>;
  /** World-space position for each country center */
  countryPositions: Map<string, BABYLON.Vector3>;
  /** TransformNode parent for each settlement's detail geometry */
  settlementDetailNodes: Map<string, BABYLON.TransformNode>;
  /** Which settlements have had their detail geometry loaded */
  settlementLoaded: Set<string>;
  /** TransformNode parent for each settlement's marker (visible when zoomed out) */
  settlementMarkerNodes: Map<string, BABYLON.TransformNode>;
  /** Cached model prototypes */
  prototypes: Map<string, ModelPrototype> | null;
  /** World radius for camera zoom-out */
  worldRadius: number;
}

export function LocationMapPreview({
  viewLevel,
  countries,
  settlements,
  lots = [],
  businesses = [],
  residences = [],
  streets = [],
  waterFeatures = [],
  selectedCountryId,
  worldId,
  worldName = 'World',
  onSettlementClick,
  onCountryClick,
  onBuildingClick,
  className = '',
  visibleLayers,
}: LocationMapPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const cameraRef = useRef<BABYLON.ArcRotateCamera | null>(null);
  const guiRef = useRef<GUI.AdvancedDynamicTexture | null>(null);
  const sceneRefsRef = useRef<SceneRefs | null>(null);
  const isRotatingRef = useRef(true);
  const onBuildingClickRef = useRef(onBuildingClick);
  onBuildingClickRef.current = onBuildingClick;
  const onSettlementClickRef = useRef(onSettlementClick);
  onSettlementClickRef.current = onSettlementClick;
  const onCountryClickRef = useRef(onCountryClick);
  onCountryClickRef.current = onCountryClick;
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Create engine/scene ONCE ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new BABYLON.Color4(0.08, 0.1, 0.14, 1);

    const camera = new BABYLON.ArcRotateCamera('cam', -Math.PI / 4, Math.PI / 4.5, 20, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 120;
    camera.wheelPrecision = 20;
    camera.panningSensibility = 50;
    cameraRef.current = camera;

    const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0.3, 1, 0.2), scene);
    hemi.intensity = 0.75;
    const dir = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(-1, -2, -1), scene);
    dir.intensity = 0.45;

    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI', true, scene);
    guiRef.current = advancedTexture;

    const refs: SceneRefs = {
      pickableMap: new Map(),
      settlementPositions: new Map(),
      countryPositions: new Map(),
      settlementDetailNodes: new Map(),
      settlementLoaded: new Set(),
      settlementMarkerNodes: new Map(),
      prototypes: null,
      worldRadius: 20,
    };
    sceneRefsRef.current = refs;

    // Double-click to select
    scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERDOUBLETAP) return;
      const pickResult = pointerInfo.pickInfo;
      if (pickResult?.hit && pickResult.pickedMesh) {
        const id = pickResult.pickedMesh.id;
        const entry = refs.pickableMap.get(id);
        if (entry?.type === 'settlement' && onSettlementClickRef.current) {
          onSettlementClickRef.current(entry.data);
        } else if (entry?.type === 'country' && onCountryClickRef.current) {
          onCountryClickRef.current(entry.data);
        } else {
          let mesh: BABYLON.AbstractMesh | null = pickResult.pickedMesh;
          while (mesh) {
            if (mesh.metadata?.lotMeta?.id && onBuildingClickRef.current) {
              onBuildingClickRef.current(mesh.metadata.lotMeta.id);
              break;
            }
            mesh = mesh.parent as BABYLON.AbstractMesh | null;
          }
        }
      }
    });

    // Auto-rotate
    scene.onBeforeRenderObservable.add(() => {
      if (isRotatingRef.current) camera.alpha += 0.001;
    });

    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => engine.resize());

    return () => {
      window.removeEventListener('resize', onResize);
      scene.dispose();
      engine.dispose();
      engineRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      guiRef.current = null;
      sceneRefsRef.current = null;
    };
  }, []); // Runs ONCE

  // ── Populate world content when countries/settlements change ───────────────
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const gui = guiRef.current;
    const refs = sceneRefsRef.current;
    if (!scene || scene.isDisposed || !camera || !gui || !refs) return;

    // Clear previous world content (but not engine/scene)
    // Remove all meshes except infrastructure
    const toRemove = scene.meshes.filter(m => m.name !== 'cam');
    for (const m of toRemove) m.dispose();
    // Remove all GUI controls
    gui.dispose();
    const newGui = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI', true, scene);
    guiRef.current = newGui;

    // Reset refs
    refs.pickableMap.clear();
    refs.settlementPositions.clear();
    refs.countryPositions.clear();
    refs.settlementDetailNodes.clear();
    refs.settlementLoaded.clear();
    refs.settlementMarkerNodes.clear();

    // ── Build unified world scene ─────────────────────────────────────────
    const countryCount = Math.max(countries.length, 1);
    const countryRadius = Math.min(countryCount * 6, 40);
    refs.worldRadius = Math.max(countryRadius + 15, 25);

    // Large world ground
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {
      width: refs.worldRadius * 2.5,
      height: refs.worldRadius * 2.5,
    }, scene);
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.15, 0.2, 0.12);
    groundMat.specularColor = BABYLON.Color3.Black();
    ground.material = groundMat;
    tagMesh(ground, 'terrain');

    // Place countries
    countries.forEach((country, ci) => {
      const angle = (ci / countryCount) * Math.PI * 2;
      const cx = Math.cos(angle) * countryRadius;
      const cz = Math.sin(angle) * countryRadius;
      const countryPos = new BABYLON.Vector3(cx, 0, cz);
      refs.countryPositions.set(country.id, countryPos);

      const terrain = country.terrain ?? 'plains';
      const groundCol = getGroundColor(terrain);
      const terrainCol = getTerrainColor(terrain);

      // Country terrain disc
      const disc = BABYLON.MeshBuilder.CreateDisc(`country_${country.id}`, { radius: 8, tessellation: 24 }, scene);
      disc.rotation.x = Math.PI / 2;
      disc.position = new BABYLON.Vector3(cx, 0.02, cz);
      const discMat = new BABYLON.StandardMaterial(`cMat_${ci}`, scene);
      discMat.diffuseColor = groundCol;
      discMat.specularColor = BABYLON.Color3.Black();
      discMat.alpha = 0.7;
      disc.material = discMat;
      disc.id = `country_pick_${country.id}`;
      refs.pickableMap.set(disc.id, { type: 'country', data: country });
      tagMesh(disc, 'districts');

      // Country label
      const anchor = BABYLON.MeshBuilder.CreateBox(`cAnchor_${ci}`, { size: 0.01 }, scene);
      anchor.position = new BABYLON.Vector3(cx, 5, cz);
      anchor.isVisible = false;
      anchor.isPickable = false;
      tagMesh(anchor, 'labels');
      addLabel(newGui, anchor, country.name, 13, '#FFD700', 0);

      // Place settlement markers within this country
      const countrySettlements = settlements.filter(s => s.countryId === country.id);
      const sCount = Math.max(countrySettlements.length, 1);
      const sRadius = 6;
      countrySettlements.forEach((s, si) => {
        const sAngle = (si / sCount) * Math.PI * 2 + Math.PI / 4;
        const sx = cx + Math.cos(sAngle) * sRadius;
        const sz = cz + Math.sin(sAngle) * sRadius;
        const settlementPos = new BABYLON.Vector3(sx, 0, sz);
        refs.settlementPositions.set(s.id, settlementPos);

        // Marker group (visible when zoomed out)
        const markerNode = new BABYLON.TransformNode(`sMarkerNode_${s.id}`, scene);
        markerNode.position = settlementPos;
        refs.settlementMarkerNodes.set(s.id, markerNode);

        const scale = SETTLEMENT_SCALE[s.settlementType] ?? 0.5;
        const marker = BABYLON.MeshBuilder.CreateCylinder(`s_${s.id}`, {
          diameterTop: 0.3 * scale,
          diameterBottom: 1.0 * scale,
          height: 1.5 * scale,
          tessellation: 8,
        }, scene);
        marker.position = new BABYLON.Vector3(0, 0.75 * scale, 0);
        marker.parent = markerNode;
        const mMat = new BABYLON.StandardMaterial(`sMat_${s.id}`, scene);
        mMat.diffuseColor = terrainCol;
        mMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        marker.material = mMat;
        marker.id = `settlement_pick_${s.id}`;
        refs.pickableMap.set(marker.id, { type: 'settlement', data: s });
        tagMesh(marker, 'buildings');

        // Settlement label
        const sLabelAnchor = BABYLON.MeshBuilder.CreateBox(`sLabel_${s.id}`, { size: 0.01 }, scene);
        sLabelAnchor.position = new BABYLON.Vector3(0, 2.5, 0);
        sLabelAnchor.parent = markerNode;
        sLabelAnchor.isVisible = false;
        sLabelAnchor.isPickable = false;
        tagMesh(sLabelAnchor, 'labels');
        addLabel(newGui, sLabelAnchor, s.name, 10, '#CCC', 0);

        // Detail group placeholder (populated lazily)
        const detailNode = new BABYLON.TransformNode(`sDetailNode_${s.id}`, scene);
        detailNode.position = settlementPos;
        detailNode.setEnabled(false); // Hidden until zoomed in
        refs.settlementDetailNodes.set(s.id, detailNode);
      });
    });

    // Orphan settlements (no country)
    const orphanSettlements = settlements.filter(s => !s.countryId);
    orphanSettlements.forEach((s, si) => {
      const angle = (si / Math.max(orphanSettlements.length, 1)) * Math.PI * 2;
      const sx = Math.cos(angle) * (countryRadius * 0.5);
      const sz = Math.sin(angle) * (countryRadius * 0.5);
      const settlementPos = new BABYLON.Vector3(sx, 0, sz);
      refs.settlementPositions.set(s.id, settlementPos);

      const markerNode = new BABYLON.TransformNode(`sMarkerNode_${s.id}`, scene);
      markerNode.position = settlementPos;
      refs.settlementMarkerNodes.set(s.id, markerNode);

      const scale = SETTLEMENT_SCALE[s.settlementType] ?? 0.5;
      const marker = BABYLON.MeshBuilder.CreateCylinder(`s_${s.id}`, {
        diameterTop: 0.3 * scale, diameterBottom: 1.0 * scale, height: 1.5 * scale, tessellation: 8,
      }, scene);
      marker.position = new BABYLON.Vector3(0, 0.75 * scale, 0);
      marker.parent = markerNode;
      const mMat = new BABYLON.StandardMaterial(`sMat_${s.id}`, scene);
      mMat.diffuseColor = new BABYLON.Color3(0.4, 0.5, 0.3);
      mMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      marker.material = mMat;
      marker.id = `settlement_pick_${s.id}`;
      refs.pickableMap.set(marker.id, { type: 'settlement', data: s });
      tagMesh(marker, 'buildings');

      const sLabelAnchor = BABYLON.MeshBuilder.CreateBox(`sLabel_${s.id}`, { size: 0.01 }, scene);
      sLabelAnchor.position = new BABYLON.Vector3(0, 2.5, 0);
      sLabelAnchor.parent = markerNode;
      sLabelAnchor.isVisible = false;
      sLabelAnchor.isPickable = false;
      tagMesh(sLabelAnchor, 'labels');
      addLabel(newGui, sLabelAnchor, s.name, 10, '#CCC', 0);

      const detailNode = new BABYLON.TransformNode(`sDetailNode_${s.id}`, scene);
      detailNode.position = settlementPos;
      detailNode.setEnabled(false);
      refs.settlementDetailNodes.set(s.id, detailNode);
    });

    // Water features at world scale
    renderWaterFeatures(scene, newGui, waterFeatures, refs.worldRadius * 2, 'world');

    // Initial camera position
    camera.target = BABYLON.Vector3.Zero();
    camera.radius = refs.worldRadius;

    setIsLoading(false);
    setLoadingProgress(null);
  }, [countries, settlements, waterFeatures]);

  // ── Navigate camera when viewLevel / selection changes ────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const refs = sceneRefsRef.current;
    if (!scene || scene.isDisposed || !camera || !refs) return;

    if (viewLevel === 'world') {
      animateCameraTo(camera, scene, BABYLON.Vector3.Zero(), refs.worldRadius, Math.PI / 4.5);
    } else if (viewLevel === 'country' && selectedCountryId) {
      const pos = refs.countryPositions.get(selectedCountryId);
      if (pos) animateCameraTo(camera, scene, pos.clone(), 22, Math.PI / 4.2);
    } else if (viewLevel === 'settlement') {
      // Find the selected settlement from the settlements prop
      const selected = settlements.find(s =>
        (selectedCountryId && s.countryId === selectedCountryId) || !selectedCountryId
      );
      // We check lots to know if we have a specific settlement loaded
      if (lots.length > 0) {
        const settlementId = lots[0]?.settlementId;
        if (settlementId) {
          const pos = refs.settlementPositions.get(settlementId);
          if (pos) animateCameraTo(camera, scene, pos.clone(), 6, Math.PI / 3.5);
        }
      }
    }
  }, [viewLevel, selectedCountryId]);

  // ── Load settlement detail when lots/businesses arrive ─────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    const gui = guiRef.current;
    const refs = sceneRefsRef.current;
    if (!scene || scene.isDisposed || !gui || !refs) return;
    if (lots.length === 0) return;

    const settlementId = lots[0]?.settlementId;
    if (!settlementId) return;
    if (refs.settlementLoaded.has(settlementId)) {
      // Already loaded — just make sure detail is visible and zoom
      const detailNode = refs.settlementDetailNodes.get(settlementId);
      const markerNode = refs.settlementMarkerNodes.get(settlementId);
      if (detailNode) detailNode.setEnabled(true);
      if (markerNode) markerNode.setEnabled(false);
      const pos = refs.settlementPositions.get(settlementId);
      if (pos && cameraRef.current) {
        animateCameraTo(cameraRef.current, scene, pos.clone(), 6, Math.PI / 3.5);
      }
      return;
    }

    const detailNode = refs.settlementDetailNodes.get(settlementId);
    if (!detailNode) return;

    // Mark as loaded
    refs.settlementLoaded.add(settlementId);

    const buildDetail = async () => {
      setIsLoading(true);
      setLoadingProgress('Loading settlement detail...');

      // Load model prototypes once
      if (!refs.prototypes && worldId) {
        const onProgress = (loaded: number, total: number) => {
          setLoadingProgress(`Loading models ${loaded}/${total}...`);
        };
        refs.prototypes = await loadModelPrototypes(scene, worldId, onProgress);
      }
      if (scene.isDisposed) return;

      const prototypes = refs.prototypes || new Map();
      const normalizedStreets = normalizeStreets(streets);
      const hasStoredStreets = normalizedStreets.length > 0;

      if (hasStoredStreets) {
        renderStreetNetworkAtNode(scene, gui, normalizedStreets, detailNode);
      }

      const { positions, streets: layoutStreets, scale: layoutScale } = computeSettlementLayout(lots, worldId, hasStoredStreets ? normalizedStreets : undefined);

      if (!hasStoredStreets) {
        renderStreetsAtNode(scene, gui, layoutStreets, detailNode);
      }

      // Settlement ground (local to detailNode)
      const sGround = BABYLON.MeshBuilder.CreateGround('sGround_' + settlementId, { width: 30, height: 30 }, scene);
      const sGroundMat = new BABYLON.StandardMaterial('sGroundMat_' + settlementId, scene);
      sGroundMat.diffuseColor = new BABYLON.Color3(0.25, 0.3, 0.2);
      sGroundMat.specularColor = BABYLON.Color3.Black();
      sGround.material = sGroundMat;
      sGround.parent = detailNode;
      sGround.position = BABYLON.Vector3.Zero();
      tagMesh(sGround, 'terrain');

      // Build lots/buildings using existing buildSettlementView logic
      const bizByLot = new Map<string, any>();
      businesses.forEach(b => { if (b.lotId) bizByLot.set(b.lotId, b); });
      const resByLot = new Map<string, any>();
      residences.forEach(r => { if (r.lotId) resByLot.set(r.lotId, r); });

      lots.forEach((lot, li) => {
        const pos = positions.get(lot.id);
        if (!pos) return;
        const lx = pos.x;
        const lz = pos.z;
        const facingAngle = pos.angle;
        const rng = seededRandom(hashStr(lot.id));
        const bType = lot.buildingType?.toLowerCase() ?? 'vacant';
        const biz = bizByLot.get(lot.id);
        const res = resByLot.get(lot.id);
        const isPark = bType === 'park';
        const isBusiness = !isPark && (bType === 'business' || !!biz);
        const isResidence = !isPark && (bType === 'residence' || !!res);
        const buildingType = isPark ? 'park' : isBusiness ? 'business' : isResidence ? 'residence' : 'vacant';

        const tintColor = isPark
          ? new BABYLON.Color3(0.25, 0.55, 0.2)
          : isBusiness
            ? new BABYLON.Color3(0.55, 0.4, 0.25)
            : isResidence
              ? new BABYLON.Color3(0.4, 0.45, 0.6)
              : new BABYLON.Color3(0.35, 0.35, 0.3);

        const rawW = lot.lotWidth || 12;
        const rawD = lot.lotDepth || 16;
        const scaledW = rawW * layoutScale;
        const scaledD = rawD * layoutScale;

        // Lot ground plane
        const lotPlane = BABYLON.MeshBuilder.CreateGround(`lotGround_${lot.id}`, { width: scaledW, height: scaledD }, scene);
        lotPlane.position = new BABYLON.Vector3(lx, 0.005, lz);
        lotPlane.rotation.y = facingAngle;
        lotPlane.parent = detailNode;
        const lotPlaneMat = new BABYLON.StandardMaterial(`lotGroundMat_${li}`, scene);
        lotPlaneMat.diffuseColor = tintColor;
        lotPlaneMat.emissiveColor = BABYLON.Color3.Black();
        lotPlaneMat.specularColor = BABYLON.Color3.Black();
        lotPlaneMat.alpha = 0.12;
        lotPlaneMat.backFaceCulling = false;
        lotPlane.material = lotPlaneMat;
        const lotMeta = { id: lot.id, address: lot.address, buildingType, streetName: lot.streetName, houseNumber: lot.houseNumber, side: lot.side, lotWidth: lot.lotWidth, lotDepth: lot.lotDepth, bizName: biz?.name, resType: res?.residenceType };
        lotPlane.metadata = { lotMeta, tintColor, isLotPlane: true };
        tagMesh(lotPlane, 'buildings');

        if (isPark) {
          lotPlaneMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.15);
          lotPlaneMat.alpha = 0.6;
          const treeCount = Math.max(3, Math.floor((scaledW * scaledD) / 2));
          for (let ti = 0; ti < treeCount; ti++) {
            const tx = lx + (rng() - 0.5) * scaledW * 0.8;
            const tz = lz + (rng() - 0.5) * scaledD * 0.8;
            const treeScale = 0.15 + rng() * 0.15;
            const trunk = BABYLON.MeshBuilder.CreateCylinder(`park_trunk_${lot.id}_${ti}`, { height: treeScale * 2, diameter: treeScale * 0.3, tessellation: 6 }, scene);
            trunk.position = new BABYLON.Vector3(tx, treeScale, tz);
            trunk.parent = detailNode;
            const trunkMat = new BABYLON.StandardMaterial(`park_trunkMat_${lot.id}_${ti}`, scene);
            trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.28, 0.15);
            trunkMat.specularColor = BABYLON.Color3.Black();
            trunk.material = trunkMat;
            tagMesh(trunk, 'buildings');
            const foliage = BABYLON.MeshBuilder.CreateSphere(`park_foliage_${lot.id}_${ti}`, { diameter: treeScale * 2.5, segments: 6 }, scene);
            foliage.position = new BABYLON.Vector3(tx, treeScale * 2.2, tz);
            foliage.parent = detailNode;
            const foliageMat = new BABYLON.StandardMaterial(`park_foliageMat_${lot.id}_${ti}`, scene);
            foliageMat.diffuseColor = new BABYLON.Color3(0.15 + rng() * 0.1, 0.45 + rng() * 0.15, 0.1);
            foliageMat.specularColor = BABYLON.Color3.Black();
            foliage.material = foliageMat;
            tagMesh(foliage, 'buildings');
          }
          const parkLabelAnchor = new BABYLON.Mesh(`parkLabel_${lot.id}`, scene);
          parkLabelAnchor.position = new BABYLON.Vector3(lx, 0.5, lz);
          parkLabelAnchor.parent = detailNode;
          parkLabelAnchor.isVisible = false;
          tagMesh(parkLabelAnchor, 'labels');
          addLabel(gui, parkLabelAnchor, lot.address || 'Park', 10, '#50FA7B', 15);
        } else {
          // Building box using real dimensions
          const typeName = biz?.businessType || (isResidence ? (res?.residenceType || 'house') : '');
          const dims = typeName ? getBuildingDefaults(typeName) : DEFAULT_BUILDING_DIMENSIONS;
          const FLOOR_HEIGHT = 4;
          const width = dims.width * layoutScale;
          const depth = dims.depth * layoutScale;
          const clampedW = Math.min(width, scaledW * 0.85);
          const clampedD = Math.min(depth, scaledD * 0.85);
          const buildingHeight = buildingType !== 'vacant'
            ? dims.floors * FLOOR_HEIGHT * layoutScale
            : 0.05 + rng() * 0.05;

          const prototype = buildingType !== 'vacant' ? (prototypes.get(getModelRole(buildingType, biz?.businessType)) || prototypes.get('default')) : null;

          if (prototype && buildingType !== 'vacant') {
            const parent = new BABYLON.Mesh(`lot_parent_${lot.id}`, scene);
            parent.position = new BABYLON.Vector3(lx, 0, lz);
            parent.rotation.y = facingAngle;
            parent.parent = detailNode;
            parent.metadata = { lotMeta, tintColor };
            tagMesh(parent, 'buildings');
            placeModelInstance(prototype, parent, buildingHeight, lot.id);
          } else {
            const box = BABYLON.MeshBuilder.CreateBox(`lot_${lot.id}`, { width: clampedW, height: buildingHeight, depth: clampedD }, scene);
            box.position = new BABYLON.Vector3(lx, buildingHeight / 2, lz);
            box.rotation.y = facingAngle;
            box.parent = detailNode;
            const boxMat = new BABYLON.StandardMaterial(`lotMat_${li}`, scene);
            boxMat.diffuseColor = tintColor;
            boxMat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);
            box.material = boxMat;
            box.metadata = { lotMeta, tintColor };
            tagMesh(box, 'buildings');

            if (buildingType !== 'vacant') {
              const roofDiam = Math.min(Math.max(clampedW, clampedD) * 1.1, Math.min(scaledW, scaledD));
              const roof = BABYLON.MeshBuilder.CreateCylinder(`roof_${lot.id}`, { diameterTop: 0, diameterBottom: roofDiam, height: 0.2, tessellation: 4 }, scene);
              roof.position = new BABYLON.Vector3(lx, buildingHeight + 0.1, lz);
              roof.rotation.y = facingAngle + Math.PI / 4;
              roof.parent = detailNode;
              const roofMat = new BABYLON.StandardMaterial(`roofMat_${li}`, scene);
              roofMat.diffuseColor = isBusiness ? new BABYLON.Color3(0.6, 0.3, 0.15) : new BABYLON.Color3(0.3, 0.3, 0.5);
              roofMat.specularColor = BABYLON.Color3.Black();
              roof.material = roofMat;
              roof.metadata = { lotMeta, tintColor };
              tagMesh(roof, 'buildings');
            }
          }

          // Label
          const labelAnchor = new BABYLON.Mesh(`lotLabel_${lot.id}`, scene);
          labelAnchor.position = new BABYLON.Vector3(lx, buildingHeight + 0.3, lz);
          labelAnchor.parent = detailNode;
          labelAnchor.isVisible = false;
          tagMesh(labelAnchor, 'labels');
          const label = biz?.name ?? lot.address ?? `Lot ${li + 1}`;
          addLabel(gui, labelAnchor, label, 9, isBusiness ? '#FFB86C' : isResidence ? '#8BE9FD' : '#aaa', 15);
        }
      });

      // Setup hover system for this settlement
      setupLotHover(scene, gui);

      // Show detail, hide marker
      detailNode.setEnabled(true);
      const markerNode = refs.settlementMarkerNodes.get(settlementId);
      if (markerNode) markerNode.setEnabled(false);

      // Animate camera to settlement
      const sPos = refs.settlementPositions.get(settlementId);
      if (sPos && cameraRef.current) {
        animateCameraTo(cameraRef.current, scene, sPos.clone(), 6, Math.PI / 3.5);
      }

      setIsLoading(false);
      setLoadingProgress(null);
    };

    buildDetail();
  }, [lots, businesses, residences, streets, worldId]);

  // ── LOD: toggle detail vs markers based on camera distance ─────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const refs = sceneRefsRef.current;
    if (!scene || scene.isDisposed || !camera || !refs) return;

    const LOD_THRESHOLD = 4;
    const observer = scene.onBeforeRenderObservable.add(() => {
      refs.settlementPositions.forEach((pos, id) => {
        const dist = BABYLON.Vector3.Distance(camera.target, pos);
        const showDetail = dist < LOD_THRESHOLD && refs.settlementLoaded.has(id);
        const detailNode = refs.settlementDetailNodes.get(id);
        const markerNode = refs.settlementMarkerNodes.get(id);
        if (detailNode) detailNode.setEnabled(showDetail);
        if (markerNode) markerNode.setEnabled(!showDetail);
      });
    });

    return () => { scene.onBeforeRenderObservable.remove(observer); };
  }, [settlements]);

  // Apply layer visibility without rebuilding the scene
  useEffect(() => {
    if (!visibleLayers || !sceneRef.current || sceneRef.current.isDisposed) return;
    applyLayerVisibility(sceneRef.current, guiRef.current, visibleLayers);
  }, [visibleLayers]);

  const toggleRotation = useCallback(() => {
    const next = !isRotatingRef.current;
    isRotatingRef.current = next;
    setIsRotating(next);
  }, []);

  const zoomIn = useCallback(() => {
    const cam = cameraRef.current;
    if (cam) cam.radius = Math.max(cam.lowerRadiusLimit ?? 3, cam.radius * 0.8);
  }, []);

  const zoomOut = useCallback(() => {
    const cam = cameraRef.current;
    if (cam) cam.radius = Math.min(cam.upperRadiusLimit ?? 80, cam.radius * 1.25);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Sync fullscreen state when exiting via Escape key
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Resize engine when fullscreen changes
  useEffect(() => {
    const engine = engineRef.current;
    if (engine) requestAnimationFrame(() => engine.resize());
  }, [isFullscreen]);

  return (
    <div ref={containerRef} className={`relative bg-black rounded-b-lg overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      {/* Preview controls */}
      {!isLoading && (
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-1.5 rounded bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={toggleRotation}
            className="p-1.5 rounded bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors"
            title={isRotating ? 'Stop rotation' : 'Resume rotation'}
          >
            {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          {loadingProgress && (
            <span className="mt-2 text-xs text-white/70">{loadingProgress}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Layer Visibility ─────────────────────────────────────────────────────────

function tagMesh(mesh: BABYLON.AbstractMesh, layer: MapLayer): void {
  mesh.metadata = { ...mesh.metadata, layer };
}

function applyLayerVisibility(
  scene: BABYLON.Scene,
  gui: GUI.AdvancedDynamicTexture | null,
  visibleLayers: Set<MapLayer>,
): void {
  const labelsVisible = visibleLayers.has('labels');
  for (const mesh of scene.meshes) {
    const layer = mesh.metadata?.layer as MapLayer | undefined;
    if (!layer) continue;
    const layerVisible = visibleLayers.has(layer);
    mesh.isVisible = layerVisible;
    mesh.setEnabled(layerVisible);
    // GUI labels: visible only if both their parent layer AND the labels layer are on
    if (mesh.metadata?.guiControl) {
      mesh.metadata.guiControl.isVisible = layerVisible && labelsVisible;
    }
  }
}

// ─── World View ──────────────────────────────────────────────────────────────

function buildWorldView(
  scene: BABYLON.Scene,
  camera: BABYLON.ArcRotateCamera,
  gui: GUI.AdvancedDynamicTexture,
  countries: any[],
  settlements: any[],
  pickableMap: Map<string, { type: 'settlement' | 'country'; data: any }>,
  waterFeatures: any[] = []
) {
  // Ground plane
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 60, height: 60 }, scene);
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.15, 0.2, 0.12);
  groundMat.specularColor = BABYLON.Color3.Black();
  ground.material = groundMat;
  tagMesh(ground, 'terrain');

  // Layout countries in a circle pattern
  const countryCount = Math.max(countries.length, 1);
  const radius = Math.min(countryCount * 3, 20);

  countries.forEach((country, ci) => {
    const angle = (ci / countryCount) * Math.PI * 2;
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius;

    const terrain = country.terrain ?? 'plains';
    const color = getTerrainColor(terrain);
    const groundCol = getGroundColor(terrain);

    // Country disc
    const disc = BABYLON.MeshBuilder.CreateDisc(`country_${country.id}`, {
      radius: 6,
      tessellation: 24,
    }, scene);
    disc.rotation.x = Math.PI / 2;
    disc.position = new BABYLON.Vector3(cx, 0.02, cz);
    const discMat = new BABYLON.StandardMaterial(`cMat_${ci}`, scene);
    discMat.diffuseColor = groundCol;
    discMat.specularColor = BABYLON.Color3.Black();
    discMat.alpha = 0.7;
    disc.material = discMat;
    disc.id = `country_pick_${country.id}`;
    pickableMap.set(disc.id, { type: 'country', data: country });
    tagMesh(disc, 'districts');

    // Country name
    const anchor = BABYLON.MeshBuilder.CreateBox(`cAnchor_${ci}`, { size: 0.01 }, scene);
    anchor.position = new BABYLON.Vector3(cx, 3.5, cz);
    anchor.isVisible = false;
    anchor.isPickable = false;
    tagMesh(anchor, 'labels');
    addLabel(gui, anchor, country.name, 13, '#FFD700', 0);

    // Place settlement markers within country
    const countrySettlements = settlements.filter(s => s.countryId === country.id);
    const sCount = Math.max(countrySettlements.length, 1);
    const sRadius = 3;
    countrySettlements.forEach((s, si) => {
      const sAngle = (si / sCount) * Math.PI * 2 + Math.PI / 4;
      const sx = cx + Math.cos(sAngle) * sRadius;
      const sz = cz + Math.sin(sAngle) * sRadius;

      const scale = SETTLEMENT_SCALE[s.settlementType] ?? 0.5;
      const marker = BABYLON.MeshBuilder.CreateCylinder(`s_${s.id}`, {
        diameterTop: 0.2 * scale,
        diameterBottom: 0.8 * scale,
        height: 1.2 * scale,
        tessellation: 8,
      }, scene);
      marker.position = new BABYLON.Vector3(sx, 0.6 * scale, sz);
      const mMat = new BABYLON.StandardMaterial(`sMat_${si}`, scene);
      mMat.diffuseColor = color;
      mMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      marker.material = mMat;
      marker.id = `settlement_pick_${s.id}`;
      pickableMap.set(marker.id, { type: 'settlement', data: s });
      tagMesh(marker, 'buildings');

      addLabel(gui, marker, s.name, 10, '#CCC', 20);
    });
  });

  // Water features at world scale
  renderWaterFeatures(scene, gui, waterFeatures, radius * 2, 'world');

  camera.target = BABYLON.Vector3.Zero();
  camera.radius = Math.max(radius + 12, 20);
}

// ─── Country View ────────────────────────────────────────────────────────────

function buildCountryView(
  scene: BABYLON.Scene,
  camera: BABYLON.ArcRotateCamera,
  gui: GUI.AdvancedDynamicTexture,
  settlements: any[],
  country: any,
  pickableMap: Map<string, { type: 'settlement' | 'country'; data: any }>,
  waterFeatures: any[] = []
) {
  const terrain = country?.terrain ?? 'plains';
  const groundCol = getGroundColor(terrain);
  const buildingCol = getTerrainColor(terrain);

  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 40, height: 40 }, scene);
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = groundCol;
  groundMat.specularColor = BABYLON.Color3.Black();
  ground.material = groundMat;
  tagMesh(ground, 'terrain');

  const count = Math.max(settlements.length, 1);
  const radius = Math.min(count * 2.5, 15);

  settlements.forEach((s, si) => {
    const angle = (si / count) * Math.PI * 2;
    const sx = Math.cos(angle) * radius;
    const sz = Math.sin(angle) * radius;

    // Ground patch
    const disc = BABYLON.MeshBuilder.CreateDisc(`sGround_${si}`, {
      radius: 3,
      tessellation: 16,
    }, scene);
    disc.rotation.x = Math.PI / 2;
    disc.position = new BABYLON.Vector3(sx, 0.01, sz);
    const discMat = new BABYLON.StandardMaterial(`sgMat_${si}`, scene);
    discMat.diffuseColor = groundCol.scale(0.8);
    discMat.specularColor = BABYLON.Color3.Black();
    discMat.alpha = 0.6;
    disc.material = discMat;
    tagMesh(disc, 'districts');

    // Building cluster
    const rng = seededRandom(hashStr(s.id));
    const pop = s.population || 100;
    const buildingCount = Math.min(Math.ceil(pop / 20), 15);

    for (let bi = 0; bi < buildingCount; bi++) {
      const bAngle = rng() * Math.PI * 2;
      const bDist = 0.5 + rng() * 2;
      const bx = sx + Math.cos(bAngle) * bDist;
      const bz = sz + Math.sin(bAngle) * bDist;
      const bh = 0.3 + rng() * 0.5;

      const box = BABYLON.MeshBuilder.CreateBox(`bld_${si}_${bi}`, {
        width: 0.3 + rng() * 0.3,
        height: bh,
        depth: 0.3 + rng() * 0.3,
      }, scene);
      box.position = new BABYLON.Vector3(bx, bh / 2, bz);
      const bMat = new BABYLON.StandardMaterial(`bMat_${si}_${bi}`, scene);
      bMat.diffuseColor = buildingCol.scale(0.6 + rng() * 0.4);
      bMat.specularColor = BABYLON.Color3.Black();
      box.material = bMat;
      tagMesh(box, 'buildings');
    }

    // Settlement label and picker
    const marker = BABYLON.MeshBuilder.CreateBox(`sMarker_${si}`, { size: 0.01 }, scene);
    marker.position = new BABYLON.Vector3(sx, 2, sz);
    marker.isVisible = false;
    marker.id = `settlement_pick_${s.id}`;
    pickableMap.set(marker.id, { type: 'settlement', data: s });
    tagMesh(marker, 'labels');
    addLabel(gui, marker, s.name, 12, '#FFF', 0);
  });

  // Water features at country scale
  renderWaterFeatures(scene, gui, waterFeatures, radius * 2, 'country');

  camera.target = BABYLON.Vector3.Zero();
  camera.radius = Math.max(radius + 8, 12);
}

// ─── Settlement View (with real 3D models) ──────────────────────────────────

interface ModelPrototype {
  mesh: BABYLON.Mesh;
  originalHeight: number;
}

async function loadModelPrototypes(
  scene: BABYLON.Scene,
  worldId: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, ModelPrototype>> {
  const prototypes = new Map<string, ModelPrototype>();

  try {
    // Fetch 3D config and assets in parallel
    const [configRes, assetsRes] = await Promise.all([
      fetch(`/api/worlds/${worldId}/3d-config`),
      fetch(`/api/worlds/${worldId}/assets`),
    ]);

    if (!configRes.ok || !assetsRes.ok) return prototypes;

    const config3D = await configRes.json();
    const assets: any[] = await assetsRes.json();

    if (!config3D?.buildingModels) return prototypes;

    // Load each building model
    const entries = Object.entries(config3D.buildingModels);
    const total = entries.length;
    let loaded = 0;
    onProgress?.(0, total);

    for (const [role, assetId] of entries) {
      if (scene.isDisposed) break;
      const asset = assets.find((a: any) => a.id === assetId);
      if (!asset?.filePath) continue;

      try {
        const cleanPath = asset.filePath.replace(/^\//, '');
        const lastSlash = cleanPath.lastIndexOf('/');
        const rootUrl = lastSlash >= 0 ? '/' + cleanPath.substring(0, lastSlash + 1) : '/';
        const fileName = lastSlash >= 0 ? cleanPath.substring(lastSlash + 1) : cleanPath;

        const result = await BABYLON.SceneLoader.ImportMeshAsync('', rootUrl, fileName, scene);
        if (result.meshes.length === 0) continue;

        const root = result.meshes[0] as BABYLON.Mesh;

        // Strip environment meshes
        const envMeshes = root.getChildMeshes(false).filter(c => isEnvMesh(c.name));
        for (const m of envMeshes) m.dispose();

        // Measure height
        root.computeWorldMatrix(true);
        const children = root.getChildMeshes(false);
        let minY = Infinity, maxY = -Infinity;
        for (const child of children) {
          child.computeWorldMatrix(true);
          const bi = child.getBoundingInfo();
          minY = Math.min(minY, bi.boundingBox.minimumWorld.y);
          maxY = Math.max(maxY, bi.boundingBox.maximumWorld.y);
        }
        const originalHeight = isFinite(minY) ? maxY - minY : 1;

        // Hide prototype
        root.setEnabled(false);
        for (const child of result.meshes) child.setEnabled(false);
        root.position.y = -10000;

        prototypes.set(role as string, { mesh: root, originalHeight });
      } catch (err) {
        console.warn(`[MapPreview] Failed to load model for role ${role}:`, err);
      }
      loaded++;
      onProgress?.(loaded, total);
    }
  } catch (err) {
    console.warn('[MapPreview] Failed to fetch 3D config/assets:', err);
  }

  return prototypes;
}

function placeModelInstance(
  prototype: ModelPrototype,
  parent: BABYLON.Mesh,
  targetHeight: number,
  id: string
): void {
  const instance = prototype.mesh.instantiateHierarchy(
    parent,
    undefined,
    (source, clone) => { clone.name = `${source.name}_${id}`; }
  );
  if (!instance) return;

  instance.name = `model_${id}`;
  instance.position = BABYLON.Vector3.Zero();

  // Scale to target height
  const absScale = targetHeight / Math.max(prototype.originalHeight, 0.01);
  (instance as BABYLON.Mesh).scaling.set(absScale, absScale, absScale);

  // Enable all cloned nodes
  instance.setEnabled(true);
  instance.getChildMeshes().forEach(m => m.setEnabled(true));

  // Align bottom to ground
  instance.computeWorldMatrix(true);
  const children = instance.getChildMeshes(false);
  let newMinY = Infinity;
  for (const child of children) {
    child.computeWorldMatrix(true);
    const bi = child.getBoundingInfo();
    newMinY = Math.min(newMinY, bi.boundingBox.minimumWorld.y);
  }
  if (isFinite(newMinY)) {
    const parentY = parent.getAbsolutePosition().y;
    instance.position.y -= (newMinY - parentY);
  }
}

/**
 * Compute lot positions for the settlement preview. Uses actual positionX/positionZ
 * from the database when available (matching the 3D game). Falls back to
 * generateStreetAlignedLots (same algorithm as the 3D game) when positions are missing.
 *
 * Returns positions in preview-space (scaled to fit ~30-unit preview) and any
 * street segments for rendering.
 */
export function computeSettlementLayout(
  lots: any[],
  settlementId?: string,
  /** Pass normalized street data so lot positions use the same coordinate space */
  storedStreets?: StreetSegmentData[],
): { positions: Map<string, { x: number; z: number; angle: number }>; streets: StreetSegment[]; scale: number } {
  const positions = new Map<string, { x: number; z: number; angle: number }>();
  let streets: StreetSegment[] = [];
  let layoutScale = 1;

  if (lots.length === 0) return { positions, streets, scale: layoutScale };

  // Check if lots have position data from the database
  const hasPositions = lots.some(l => l.positionX != null && l.positionZ != null);

  if (hasPositions) {
    // Use actual positions from database — these match the 3D game.
    // CRITICAL: use the same scale/center as renderStreetNetwork so lots
    // and streets align in the same coordinate space.
    const lotsWithPos = lots.filter(l => l.positionX != null && l.positionZ != null);
    const lotsWithout = lots.filter(l => l.positionX == null || l.positionZ == null);

    let scale: number;
    let centerX: number;
    let centerZ: number;

    if (storedStreets && storedStreets.length > 0) {
      // Use the exact same transform as renderStreetNetwork
      const streetScale = computeStreetScale(storedStreets);
      scale = streetScale.scale;
      centerX = streetScale.cx;
      centerZ = streetScale.cz;
    } else {
      // Fallback: compute from lot positions
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (const l of lotsWithPos) {
        minX = Math.min(minX, l.positionX);
        maxX = Math.max(maxX, l.positionX);
        minZ = Math.min(minZ, l.positionZ);
        maxZ = Math.max(maxZ, l.positionZ);
      }
      const rangeX = maxX - minX || 1;
      const rangeZ = maxZ - minZ || 1;
      const editorSize = 24; // match computeStreetScale
      scale = editorSize / Math.max(rangeX, rangeZ);
      centerX = (minX + maxX) / 2;
      centerZ = (minZ + maxZ) / 2;
    }

    layoutScale = scale;

    for (const l of lotsWithPos) {
      positions.set(l.id, {
        x: (l.positionX - centerX) * scale,
        z: (l.positionZ - centerZ) * scale,
        angle: l.facingAngle ?? 0,
      });
    }

    // Place lots without positions nearby using a simple offset
    lotsWithout.forEach((l, i) => {
      const angle = (i / Math.max(lotsWithout.length, 1)) * Math.PI * 2;
      positions.set(l.id, {
        x: Math.cos(angle) * 14,
        z: Math.sin(angle) * 14,
        angle: 0,
      });
    });

    // Reconstruct street segments from lot street names for rendering
    // (only used when no stored streets are available)
    if (!storedStreets || storedStreets.length === 0) {
      const streetLots = new Map<string, { x: number; z: number }[]>();
      for (const l of lotsWithPos) {
        const sn = l.streetName || 'Main Street';
        if (!streetLots.has(sn)) streetLots.set(sn, []);
        streetLots.get(sn)!.push({
          x: (l.positionX - centerX) * scale,
          z: (l.positionZ - centerZ) * scale,
        });
      }
      streetLots.forEach((pts, streetName) => {
        if (pts.length < 2) return;
        let sMinX = Infinity, sMaxX = -Infinity, sMinZ = Infinity, sMaxZ = -Infinity;
        for (const p of pts) {
          sMinX = Math.min(sMinX, p.x); sMaxX = Math.max(sMaxX, p.x);
          sMinZ = Math.min(sMinZ, p.z); sMaxZ = Math.max(sMaxZ, p.z);
        }
        const margin = 1.5;
        streets.push({
          id: `street_preview_${streetName}`,
          from: new BABYLON.Vector3(sMinX - margin, 0, sMinZ - margin),
          to: new BABYLON.Vector3(sMaxX + margin, 0, sMaxZ + margin),
          isMainStreet: streetName.toLowerCase().includes('main'),
          streetName,
        });
      });
    }
  } else {
    // No position data — generate layout using same algorithm as 3D game
    const seed = settlementId || lots.map(l => l.id).join('');
    const streetNames = Array.from(new Set(lots.map(l => l.streetName).filter(Boolean))) as string[];
    const center = new BABYLON.Vector3(0, 0, 0);
    const radius = Math.max(40, lots.length * 3);

    const result = generateStreetAlignedLots(center, radius, lots.length, seed, 512, streetNames);
    streets = result.streets;

    // Scale generated positions to preview size
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const pl of result.lots) {
      minX = Math.min(minX, pl.position.x); maxX = Math.max(maxX, pl.position.x);
      minZ = Math.min(minZ, pl.position.z); maxZ = Math.max(maxZ, pl.position.z);
    }
    // Also include street endpoints
    for (const s of streets) {
      minX = Math.min(minX, s.from.x, s.to.x); maxX = Math.max(maxX, s.from.x, s.to.x);
      minZ = Math.min(minZ, s.from.z, s.to.z); maxZ = Math.max(maxZ, s.from.z, s.to.z);
    }

    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const maxRange = Math.max(rangeX, rangeZ);
    const PREVIEW_SIZE = 20;
    const scale = PREVIEW_SIZE / maxRange;
    layoutScale = scale;
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;

    // Map generated lots to actual lots by index
    for (let i = 0; i < lots.length && i < result.lots.length; i++) {
      const pl = result.lots[i];
      positions.set(lots[i].id, {
        x: (pl.position.x - cx) * scale,
        z: (pl.position.z - cz) * scale,
        angle: pl.facingAngle,
      });
    }

    // Handle any lots that didn't get generated positions (e.g. filtered by spawn radius)
    for (let i = result.lots.length; i < lots.length; i++) {
      const angle = (i / lots.length) * Math.PI * 2;
      positions.set(lots[i].id, {
        x: Math.cos(angle) * (PREVIEW_SIZE / 2),
        z: Math.sin(angle) * (PREVIEW_SIZE / 2),
        angle: 0,
      });
    }

    // Scale street segments to preview space
    streets = streets.map(s => ({
      ...s,
      from: new BABYLON.Vector3((s.from.x - cx) * scale, 0, (s.from.z - cz) * scale),
      to: new BABYLON.Vector3((s.to.x - cx) * scale, 0, (s.to.z - cz) * scale),
    }));
  }

  return { positions, streets, scale: layoutScale };
}

async function buildSettlementView(
  scene: BABYLON.Scene,
  camera: BABYLON.ArcRotateCamera,
  gui: GUI.AdvancedDynamicTexture,
  lots: any[],
  businesses: any[],
  residences: any[],
  rawStreets: any[],
  worldId?: string,
  onProgress?: (loaded: number, total: number) => void,
  waterFeatures: any[] = []
) {
  // Ground plane
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 30, height: 30 }, scene);
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.25, 0.3, 0.2);
  groundMat.specularColor = BABYLON.Color3.Black();
  ground.material = groundMat;
  tagMesh(ground, 'terrain');

  // Normalize raw street data from DB into expected format
  const streets = normalizeStreets(rawStreets);

  // Render street network from stored DB data (preferred)
  const hasStoredStreets = streets.length > 0;
  if (hasStoredStreets) {
    renderStreetNetwork(scene, gui, streets);
  }

  // Load model prototypes if worldId is available
  let prototypes = new Map<string, ModelPrototype>();
  if (worldId) {
    prototypes = await loadModelPrototypes(scene, worldId, onProgress);
  }

  // Scene may have been disposed during async loading
  if (scene.isDisposed) return;

  // Compute street-aligned layout (consistent with 3D game)
  // Pass normalized streets so lot positions use the exact same coordinate transform
  const { positions, streets: layoutStreets, scale: layoutScale } = computeSettlementLayout(lots, worldId, hasStoredStreets ? streets : undefined);

  // Only render layout-reconstructed streets if no stored street data exists
  // (stored streets are already rendered above; layout streets are approximations
  // that create incorrect diagonals when lots have DB positions)
  if (!hasStoredStreets) {
    renderStreets(scene, gui, layoutStreets);
  }

  // Business lookup by lotId
  const bizByLot = new Map<string, any>();
  businesses.forEach(b => {
    if (b.lotId) bizByLot.set(b.lotId, b);
  });

  // Residence lookup by lotId
  const resByLot = new Map<string, any>();
  residences.forEach(r => {
    if (r.lotId) resByLot.set(r.lotId, r);
  });

  lots.forEach((lot, li) => {
    const pos = positions.get(lot.id);
    if (!pos) return;

    const lx = pos.x;
    const lz = pos.z;
    const facingAngle = pos.angle;

    const rng = seededRandom(hashStr(lot.id));
    const bType = lot.buildingType?.toLowerCase() ?? 'vacant';
    const biz = bizByLot.get(lot.id);
    const res = resByLot.get(lot.id);

    const isPark = bType === 'park';
    const isBusiness = !isPark && (bType === 'business' || !!biz);
    const isResidence = !isPark && (bType === 'residence' || !!res);

    // Determine building type for role mapping
    const buildingType = isPark ? 'park' : isBusiness ? 'business' : isResidence ? 'residence' : 'vacant';
    const businessType = biz?.businessType || (isResidence ? 'residence_small' : undefined);
    const role = buildingType !== 'vacant' ? getModelRole(buildingType, businessType) : null;

    // Tint colors for type identification
    const tintColor = isPark
      ? new BABYLON.Color3(0.25, 0.55, 0.2)
      : isBusiness
        ? new BABYLON.Color3(0.55, 0.4, 0.25)
        : isResidence
          ? new BABYLON.Color3(0.4, 0.45, 0.6)
          : new BABYLON.Color3(0.35, 0.35, 0.3);

    const height = isBusiness
      ? 0.6 + rng() * 0.6
      : isResidence
        ? 0.4 + rng() * 0.4
        : 0.15 + rng() * 0.15;

    // Try to use a real model prototype
    const prototype = role ? (prototypes.get(role) || prototypes.get('default')) : null;

    // Lot metadata for hover tooltip
    const lotMeta = {
      id: lot.id,
      address: lot.address,
      buildingType,
      streetName: lot.streetName,
      houseNumber: lot.houseNumber,
      side: lot.side,
      lotWidth: lot.lotWidth,
      lotDepth: lot.lotDepth,
      bizName: biz?.name,
      resType: res?.residenceType,
    };

    // ─── Lot ground plane (hover target + visual boundary) ────────────
    const rawW = lot.lotWidth || 12;
    const rawD = lot.lotDepth || 16;
    const scaledW = rawW * layoutScale;
    const scaledD = rawD * layoutScale;
    const lotPlane = BABYLON.MeshBuilder.CreateGround(`lotGround_${lot.id}`, {
      width: scaledW,
      height: scaledD, // "height" in CreateGround = depth dimension
    }, scene);
    lotPlane.position = new BABYLON.Vector3(lx, 0.005, lz);
    lotPlane.rotation.y = facingAngle;
    const lotPlaneMat = new BABYLON.StandardMaterial(`lotGroundMat_${li}`, scene);
    lotPlaneMat.diffuseColor = tintColor;
    lotPlaneMat.emissiveColor = BABYLON.Color3.Black();
    lotPlaneMat.specularColor = BABYLON.Color3.Black();
    lotPlaneMat.alpha = 0.12;
    lotPlaneMat.backFaceCulling = false;
    lotPlane.material = lotPlaneMat;
    lotPlane.metadata = { lotMeta, tintColor, isLotPlane: true };
    tagMesh(lotPlane, 'buildings');

    if (isPark) {
      // ─── Park rendering: green ground + decorative trees ────────────
      // Make park ground plane more visible
      lotPlaneMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.15);
      lotPlaneMat.alpha = 0.6;

      // Place small decorative trees within the park
      const treeCount = Math.max(3, Math.floor((scaledW * scaledD) / 2));
      for (let ti = 0; ti < treeCount; ti++) {
        const tx = lx + (rng() - 0.5) * scaledW * 0.8;
        const tz = lz + (rng() - 0.5) * scaledD * 0.8;
        const treeScale = 0.15 + rng() * 0.15;

        // Trunk
        const trunk = BABYLON.MeshBuilder.CreateCylinder(`park_trunk_${lot.id}_${ti}`, {
          height: treeScale * 2,
          diameter: treeScale * 0.3,
          tessellation: 6,
        }, scene);
        trunk.position = new BABYLON.Vector3(tx, treeScale, tz);
        const trunkMat = new BABYLON.StandardMaterial(`park_trunkMat_${lot.id}_${ti}`, scene);
        trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.28, 0.15);
        trunkMat.specularColor = BABYLON.Color3.Black();
        trunk.material = trunkMat;
        tagMesh(trunk, 'buildings');

        // Foliage
        const foliage = BABYLON.MeshBuilder.CreateSphere(`park_foliage_${lot.id}_${ti}`, {
          diameter: treeScale * 2.5,
          segments: 6,
        }, scene);
        foliage.position = new BABYLON.Vector3(tx, treeScale * 2.2, tz);
        const foliageMat = new BABYLON.StandardMaterial(`park_foliageMat_${lot.id}_${ti}`, scene);
        foliageMat.diffuseColor = new BABYLON.Color3(0.15 + rng() * 0.1, 0.45 + rng() * 0.15, 0.1);
        foliageMat.specularColor = BABYLON.Color3.Black();
        foliage.material = foliageMat;
        tagMesh(foliage, 'buildings');
      }

      // Label
      const labelAnchor = new BABYLON.Mesh(`parkLabel_${lot.id}`, scene);
      labelAnchor.position = new BABYLON.Vector3(lx, 0.5, lz);
      labelAnchor.isVisible = false;
      tagMesh(labelAnchor, 'labels');
      addLabel(gui, labelAnchor, lot.address || 'Park', 10, '#50FA7B', 15);
    } else if (prototype && buildingType !== 'vacant') {
      // Create parent mesh at the lot position
      const parent = new BABYLON.Mesh(`lot_parent_${lot.id}`, scene);
      parent.position = new BABYLON.Vector3(lx, 0, lz);
      parent.rotation.y = facingAngle;
      parent.metadata = { ...parent.metadata, lotMeta, tintColor };
      tagMesh(parent, 'buildings');

      // Place the real model
      placeModelInstance(prototype, parent, height, lot.id);

      // Add a colored base plate for type identification
      const plate = BABYLON.MeshBuilder.CreateBox(`plate_${lot.id}`, {
        width: 0.9, height: 0.03, depth: 0.9
      }, scene);
      plate.position = new BABYLON.Vector3(lx, 0.015, lz);
      const plateMat = new BABYLON.StandardMaterial(`plateMat_${li}`, scene);
      plateMat.diffuseColor = tintColor;
      plateMat.specularColor = BABYLON.Color3.Black();
      plateMat.alpha = 0.7;
      plate.material = plateMat;
      plate.metadata = { ...plate.metadata, lotMeta, tintColor };
      tagMesh(plate, 'buildings');

      // Label
      const labelAnchor = new BABYLON.Mesh(`lotLabel_${lot.id}`, scene);
      labelAnchor.position = parent.position.clone();
      labelAnchor.isVisible = false;
      tagMesh(labelAnchor, 'labels');
      const label = biz?.name ?? lot.address ?? `Lot ${li + 1}`;
      addLabel(gui, labelAnchor, label, 9, isBusiness ? '#FFB86C' : isResidence ? '#8BE9FD' : '#aaa', 15);
    } else {
      // Fallback: primitive box + cone roof using actual building dimensions
      const typeName = biz?.businessType || (isResidence ? (res?.residenceType || 'house') : '');
      const dims = typeName ? getBuildingDefaults(typeName) : DEFAULT_BUILDING_DIMENSIONS;

      // Scale real-world dimensions (in game units) to preview space.
      // In-game each floor is 4 units tall, so total height = floors * 4.
      const FLOOR_HEIGHT = 4;
      const width = dims.width * layoutScale;
      const depth = dims.depth * layoutScale;
      // Clamp to lot bounds so buildings don't overflow
      const clampedW = Math.min(width, scaledW * 0.85);
      const clampedD = Math.min(depth, scaledD * 0.85);
      // Height uses the same scale as width/depth for proportional rendering
      const buildingHeight = buildingType !== 'vacant'
        ? dims.floors * FLOOR_HEIGHT * layoutScale
        : 0.05 + rng() * 0.05;

      const box = BABYLON.MeshBuilder.CreateBox(`lot_${lot.id}`, {
        width: clampedW,
        height: buildingHeight,
        depth: clampedD,
      }, scene);
      box.position = new BABYLON.Vector3(lx, buildingHeight / 2, lz);
      box.rotation.y = facingAngle;
      const boxMat = new BABYLON.StandardMaterial(`lotMat_${li}`, scene);
      boxMat.diffuseColor = tintColor;
      boxMat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);
      box.material = boxMat;
      box.metadata = { ...box.metadata, lotMeta, tintColor };
      tagMesh(box, 'buildings');

      // Roof for non-vacant — clamped to lot bounds
      if (buildingType !== 'vacant') {
        // Roof diagonal must fit within the lot rectangle
        const roofW = clampedW * 1.1;
        const roofD = clampedD * 1.1;
        const roofDiam = Math.min(
          Math.max(roofW, roofD),
          Math.min(scaledW, scaledD), // never exceed lot bounds
        );
        const roof = BABYLON.MeshBuilder.CreateCylinder(`roof_${lot.id}`, {
          diameterTop: 0,
          diameterBottom: roofDiam,
          height: 0.2,
          tessellation: 4,
        }, scene);
        roof.position = new BABYLON.Vector3(lx, buildingHeight + 0.1, lz);
        roof.rotation.y = facingAngle + Math.PI / 4;
        const roofMat = new BABYLON.StandardMaterial(`roofMat_${li}`, scene);
        roofMat.diffuseColor = isBusiness
          ? new BABYLON.Color3(0.6, 0.3, 0.15)
          : new BABYLON.Color3(0.3, 0.3, 0.5);
        roofMat.specularColor = BABYLON.Color3.Black();
        roof.material = roofMat;
        roof.metadata = { ...roof.metadata, lotMeta, tintColor };
        tagMesh(roof, 'buildings');
      }

      // Building label
      const labelAnchor2 = new BABYLON.Mesh(`lotLabel2_${lot.id}`, scene);
      labelAnchor2.position = box.position.clone();
      labelAnchor2.isVisible = false;
      tagMesh(labelAnchor2, 'labels');
      const label = biz?.name ?? lot.address ?? `Lot ${li + 1}`;
      addLabel(gui, labelAnchor2, label, 9, isBusiness ? '#FFB86C' : isResidence ? '#8BE9FD' : '#aaa', 15);
    }
  });

  // ─── Hover highlight & tooltip for lots ──────────────────────────────────────
  setupLotHover(scene, gui);

  // If no lots, show placeholder
  if (lots.length === 0) {
    const anchor = BABYLON.MeshBuilder.CreateBox('empty', { size: 0.01 }, scene);
    anchor.position = new BABYLON.Vector3(0, 1, 0);
    anchor.isVisible = false;
    addLabel(gui, anchor, 'No lots or buildings', 14, '#888', 0);
  }

  // Scale camera to fit layout bounds
  let maxDist = 8;
  positions.forEach(pos => {
    const d = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
    if (d > maxDist) maxDist = d;
  });

  // Water features at settlement scale
  const extent = Math.max(maxDist, 8);
  renderWaterFeatures(scene, gui, waterFeatures, extent, 'settlement');

  camera.target = BABYLON.Vector3.Zero();
  camera.radius = maxDist * 1.5;
}

/**
 * Render street network as ground-level lines in the preview.
 */
/** Render streets parented to a TransformNode (for unified scene) */
function renderStreetsAtNode(
  scene: BABYLON.Scene,
  gui: GUI.AdvancedDynamicTexture,
  streets: StreetSegment[],
  parent: BABYLON.TransformNode,
) {
  renderStreets(scene, gui, streets, parent);
}

/** Render street network parented to a TransformNode (for unified scene) */
function renderStreetNetworkAtNode(
  scene: BABYLON.Scene,
  gui: GUI.AdvancedDynamicTexture,
  streets: StreetSegmentData[],
  parent: BABYLON.TransformNode,
) {
  renderStreetNetwork(scene, gui, streets, parent);
}

function renderStreets(
  scene: BABYLON.Scene,
  gui: GUI.AdvancedDynamicTexture,
  streets: StreetSegment[],
  parent?: BABYLON.TransformNode,
) {
  streets.forEach((street, si) => {
    const width = street.isMainStreet ? 0.4 : 0.25;
    const color = street.isMainStreet
      ? new BABYLON.Color3(0.5, 0.48, 0.42)
      : new BABYLON.Color3(0.42, 0.4, 0.36);

    const dx = street.to.x - street.from.x;
    const dz = street.to.z - street.from.z;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.1) return;

    const midX = (street.from.x + street.to.x) / 2;
    const midZ = (street.from.z + street.to.z) / 2;
    const angle = Math.atan2(dx, dz);

    // Street surface as a flat box
    const road = BABYLON.MeshBuilder.CreateBox(`street_${si}`, {
      width,
      height: 0.02,
      depth: len,
    }, scene);
    road.position = new BABYLON.Vector3(midX, 0.005, midZ);
    road.rotation.y = angle;
    if (parent) road.parent = parent;
    const roadMat = new BABYLON.StandardMaterial(`streetMat_${si}`, scene);
    roadMat.diffuseColor = color;
    roadMat.specularColor = BABYLON.Color3.Black();
    road.material = roadMat;
    road.isPickable = false;
    tagMesh(road, 'streets');

    // Street name label at midpoint
    if (street.streetName) {
      const labelAnchor = BABYLON.MeshBuilder.CreateBox(`streetLabel_${si}`, { size: 0.01 }, scene);
      labelAnchor.position = new BABYLON.Vector3(midX, 0.3, midZ);
      if (parent) labelAnchor.parent = parent;
      labelAnchor.isVisible = false;
      labelAnchor.isPickable = false;
      tagMesh(labelAnchor, 'labels');
      addLabel(gui, labelAnchor, street.streetName, 8, '#AAA', 0);
    }
  });
}

// ─── Street Network Rendering ────────────────────────────────────────────────

/**
 * Normalize raw street data from the DB into StreetSegmentData[].
 * Handles both old format (waypoints in properties) and new format (top-level waypoints).
 */
export function normalizeStreets(raw: any[]): StreetSegmentData[] {
  const result: StreetSegmentData[] = [];
  for (const seg of raw) {
    const waypoints: { x: number; z: number }[] =
      Array.isArray(seg.waypoints) ? seg.waypoints
      : Array.isArray(seg.properties?.waypoints) ? seg.properties.waypoints
      : [];
    if (waypoints.length < 2) continue;
    result.push({
      id: seg.id ?? String(result.length),
      name: seg.name ?? seg.streetName ?? '',
      direction: seg.direction ?? seg.properties?.direction,
      waypoints,
      width: seg.width ?? seg.properties?.width,
    });
  }
  return result;
}

/** Scale factor to map server-space waypoints into the editor's coordinate space */
export function computeStreetScale(streets: StreetSegmentData[]): { scale: number; cx: number; cz: number } {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const seg of streets) {
    for (const wp of seg.waypoints) {
      if (wp.x < minX) minX = wp.x;
      if (wp.x > maxX) maxX = wp.x;
      if (wp.z < minZ) minZ = wp.z;
      if (wp.z > maxZ) maxZ = wp.z;
    }
  }
  const rangeX = maxX - minX || 1;
  const rangeZ = maxZ - minZ || 1;
  const editorSize = 24; // fit within the 30×30 ground with margin
  const scale = editorSize / Math.max(rangeX, rangeZ);
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  return { scale, cx, cz };
}

function renderStreetNetwork(
  scene: BABYLON.Scene,
  gui: GUI.AdvancedDynamicTexture,
  streets: StreetSegmentData[],
  parent?: BABYLON.TransformNode,
) {
  const { scale, cx, cz } = computeStreetScale(streets);

  const roadMat = new BABYLON.StandardMaterial('roadMat', scene);
  roadMat.diffuseColor = new BABYLON.Color3(0.35, 0.33, 0.3);
  roadMat.specularColor = BABYLON.Color3.Black();

  streets.forEach((seg, si) => {
    if (seg.waypoints.length < 2) return;

    // Map waypoints to editor space
    const editorWidth = Math.max((seg.width ?? 2.5) * scale * 0.5, 0.15);
    const points = seg.waypoints.map(wp =>
      new BABYLON.Vector3((wp.x - cx) * scale, 0.03, (wp.z - cz) * scale)
    );

    // Build a ribbon (flat road surface) from the polyline
    const leftPath: BABYLON.Vector3[] = [];
    const rightPath: BABYLON.Vector3[] = [];
    const halfW = editorWidth / 2;

    for (let i = 0; i < points.length; i++) {
      // Compute perpendicular direction
      let dir: BABYLON.Vector3;
      if (i === 0) {
        dir = points[1].subtract(points[0]).normalize();
      } else if (i === points.length - 1) {
        dir = points[i].subtract(points[i - 1]).normalize();
      } else {
        dir = points[i + 1].subtract(points[i - 1]).normalize();
      }
      const perp = new BABYLON.Vector3(-dir.z, 0, dir.x);
      leftPath.push(points[i].add(perp.scale(halfW)));
      rightPath.push(points[i].subtract(perp.scale(halfW)));
    }

    const ribbon = BABYLON.MeshBuilder.CreateRibbon(`street_${si}`, {
      pathArray: [leftPath, rightPath],
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    }, scene);
    ribbon.material = roadMat;
    ribbon.isPickable = false;
    if (parent) ribbon.parent = parent;
    tagMesh(ribbon, 'streets');

    // Street name label at the midpoint
    const midIdx = Math.floor(points.length / 2);
    const midPt = points[midIdx];
    const labelAnchor = BABYLON.MeshBuilder.CreateBox(`streetLabel_${si}`, { size: 0.01 }, scene);
    labelAnchor.position = new BABYLON.Vector3(midPt.x, 0.5, midPt.z);
    labelAnchor.isVisible = false;
    labelAnchor.isPickable = false;
    if (parent) labelAnchor.parent = parent;
    tagMesh(labelAnchor, 'labels');
    addLabel(gui, labelAnchor, seg.name, 8, '#E8E8D0', 0);
  });
}

// ─── Water Feature Rendering ─────────────────────────────────────────────────

function renderWaterFeatures(
  scene: BABYLON.Scene,
  gui: GUI.AdvancedDynamicTexture,
  waterFeatures: any[],
  mapExtent: number,
  viewLevel: ViewLevel
) {
  if (!waterFeatures.length) return;

  for (const wf of waterFeatures) {
    const type: string = wf.type ?? 'lake';
    const style = getWaterStyle(type);
    const pos = wf.position ?? { x: 0, y: 0, z: 0 };

    // Use custom color if provided
    const color = wf.color
      ? new BABYLON.Color3(wf.color.r, wf.color.g, wf.color.b)
      : style.color;
    const alpha = wf.transparency != null ? 1 - wf.transparency : style.alpha;

    if (type === 'river' || type === 'stream' || type === 'canal') {
      renderLinearWaterPreview(scene, gui, wf, color, alpha, mapExtent, viewLevel);
    } else {
      renderAreaWaterPreview(scene, gui, wf, color, alpha, mapExtent, viewLevel);
    }
  }
}

function renderLinearWaterPreview(
  scene: BABYLON.Scene,
  gui: GUI.AdvancedDynamicTexture,
  wf: any,
  color: BABYLON.Color3,
  alpha: number,
  mapExtent: number,
  viewLevel: ViewLevel
) {
  const points: { x: number; y: number; z: number }[] = wf.shorelinePoints ?? [];
  if (points.length < 2) return;

  // Scale positions to fit the preview map extent
  const scale = viewLevel === 'world' ? mapExtent / 100 : mapExtent / 60;
  const halfWidth = Math.max(0.15, ((wf.width ?? 4) / 2) * scale * 0.1);

  const leftPath: BABYLON.Vector3[] = [];
  const rightPath: BABYLON.Vector3[] = [];

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    let dirX: number, dirZ: number;
    if (i < points.length - 1) {
      dirX = points[i + 1].x - pt.x;
      dirZ = points[i + 1].z - pt.z;
    } else {
      dirX = pt.x - points[i - 1].x;
      dirZ = pt.z - points[i - 1].z;
    }
    const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
    if (len < 0.001) continue;
    dirX /= len;
    dirZ /= len;

    const px = pt.x * scale;
    const pz = pt.z * scale;
    const perpX = -dirZ * halfWidth;
    const perpZ = dirX * halfWidth;

    leftPath.push(new BABYLON.Vector3(px + perpX, 0.05, pz + perpZ));
    rightPath.push(new BABYLON.Vector3(px - perpX, 0.05, pz - perpZ));
  }

  if (leftPath.length < 2) return;

  try {
    const mesh = BABYLON.MeshBuilder.CreateRibbon(
      `water_preview_${wf.id ?? wf.name}`,
      {
        pathArray: [leftPath, rightPath],
        closeArray: false,
        closePath: false,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      },
      scene
    );
    const mat = new BABYLON.StandardMaterial(`waterMat_${wf.id ?? wf.name}`, scene);
    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(0.3);
    mat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.4);
    mat.alpha = alpha;
    mat.backFaceCulling = false;
    mesh.material = mat;
    mesh.isPickable = false;
    tagMesh(mesh, 'water');

    // Label at midpoint
    const mid = points[Math.floor(points.length / 2)];
    const labelAnchor = BABYLON.MeshBuilder.CreateBox(`wLabel_${wf.id}`, { size: 0.01 }, scene);
    labelAnchor.position = new BABYLON.Vector3(mid.x * scale, 0.5, mid.z * scale);
    labelAnchor.isVisible = false;
    labelAnchor.isPickable = false;
    tagMesh(labelAnchor, 'labels');
    addLabel(gui, labelAnchor, wf.name, 9, '#8BE9FD', 10);
  } catch {
    // Ribbon creation can fail with degenerate paths
  }
}

function renderAreaWaterPreview(
  scene: BABYLON.Scene,
  gui: GUI.AdvancedDynamicTexture,
  wf: any,
  color: BABYLON.Color3,
  alpha: number,
  mapExtent: number,
  viewLevel: ViewLevel
) {
  const pos = wf.position ?? { x: 0, y: 0, z: 0 };
  const scale = viewLevel === 'world' ? mapExtent / 100 : mapExtent / 60;
  const type: string = wf.type ?? 'lake';

  // Determine radius from bounds or width
  let radius: number;
  if (wf.bounds && wf.bounds.maxX !== wf.bounds.minX) {
    const boundsW = wf.bounds.maxX - wf.bounds.minX;
    const boundsD = wf.bounds.maxZ - wf.bounds.minZ;
    radius = Math.max(0.5, Math.max(boundsW, boundsD) / 2 * scale * 0.1);
  } else {
    radius = Math.max(0.5, (wf.width ?? 10) * scale * 0.05);
  }

  // Ocean gets a large ground plane
  if (type === 'ocean') {
    const size = Math.max(radius * 3, mapExtent * 0.4);
    const mesh = BABYLON.MeshBuilder.CreateGround(
      `water_preview_${wf.id ?? wf.name}`,
      { width: size, height: size, subdivisions: 1 },
      scene
    );
    mesh.position = new BABYLON.Vector3(pos.x * scale, 0.03, pos.z * scale);
    const mat = new BABYLON.StandardMaterial(`waterMat_${wf.id ?? wf.name}`, scene);
    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(0.3);
    mat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.4);
    mat.alpha = alpha;
    mesh.material = mat;
    mesh.isPickable = false;
    tagMesh(mesh, 'water');
  } else {
    // Lake, pond, marsh as discs
    const tessellation = type === 'marsh' ? 8 : 20;
    const disc = BABYLON.MeshBuilder.CreateDisc(
      `water_preview_${wf.id ?? wf.name}`,
      { radius, tessellation },
      scene
    );
    disc.rotation.x = Math.PI / 2;
    disc.position = new BABYLON.Vector3(pos.x * scale, 0.04, pos.z * scale);
    const mat = new BABYLON.StandardMaterial(`waterMat_${wf.id ?? wf.name}`, scene);
    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(0.3);
    mat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.4);
    mat.alpha = alpha;
    mat.backFaceCulling = false;
    disc.material = mat;
    disc.isPickable = false;
    tagMesh(disc, 'water');
  }

  // Label
  const labelAnchor = BABYLON.MeshBuilder.CreateBox(`wLabel_${wf.id}`, { size: 0.01 }, scene);
  labelAnchor.position = new BABYLON.Vector3(pos.x * scale, 0.5, pos.z * scale);
  labelAnchor.isVisible = false;
  labelAnchor.isPickable = false;
  tagMesh(labelAnchor, 'labels');
  addLabel(gui, labelAnchor, wf.name, 9, '#8BE9FD', 10);
}

// ─── Lot Hover Highlight ─────────────────────────────────────────────────────

function setupLotHover(scene: BABYLON.Scene, gui: GUI.AdvancedDynamicTexture) {
  let lastHighlightedMesh: BABYLON.AbstractMesh | null = null;
  // Track all related meshes for a lot so we can highlight building + ground plane together
  let lastHighlightedGroup: BABYLON.AbstractMesh[] = [];
  // Track lot-plane alpha/emissive changes separately (these use per-lot materials, safe to modify)
  let lastLotPlanes: BABYLON.AbstractMesh[] = [];

  // Use a HighlightLayer for model instances — avoids mutating shared materials
  const hl = new BABYLON.HighlightLayer('lotHighlight', scene);
  hl.outerGlow = true;
  hl.innerGlow = false;
  hl.blurHorizontalSize = 0.5;
  hl.blurVerticalSize = 0.5;

  // Tooltip panel (hidden initially)
  const tooltip = new GUI.Rectangle('lotTooltip');
  tooltip.width = '220px';
  tooltip.adaptHeightToChildren = true;
  tooltip.cornerRadius = 6;
  tooltip.thickness = 1;
  tooltip.color = '#666';
  tooltip.background = 'rgba(20, 20, 30, 0.92)';
  tooltip.paddingTop = '6px';
  tooltip.paddingBottom = '6px';
  tooltip.paddingLeft = '8px';
  tooltip.paddingRight = '8px';
  tooltip.isVisible = false;
  tooltip.isPointerBlocker = false;
  tooltip.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  tooltip.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  gui.addControl(tooltip);

  const tooltipText = new GUI.TextBlock('lotTooltipText');
  tooltipText.color = '#eee';
  tooltipText.fontSize = 12;
  tooltipText.fontFamily = 'system-ui, -apple-system, monospace';
  tooltipText.textWrapping = true;
  tooltipText.resizeToFit = true;
  tooltipText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  tooltipText.lineSpacing = '2px';
  tooltip.addControl(tooltipText);

  const clearHighlight = () => {
    // Remove highlight glow from all meshes
    for (const m of lastHighlightedGroup) {
      if (!m.isDisposed()) hl.removeMesh(m as BABYLON.Mesh);
    }
    // Restore lot ground planes (these have per-lot materials, safe to modify directly)
    for (const m of lastLotPlanes) {
      if (m.isDisposed()) continue;
      const mat = m.material as BABYLON.StandardMaterial | null;
      if (mat) {
        mat.emissiveColor = BABYLON.Color3.Black();
        mat.alpha = 0.12;
      }
    }
    lastHighlightedMesh = null;
    lastHighlightedGroup = [];
    lastLotPlanes = [];
    tooltip.isVisible = false;
  };

  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERMOVE) return;

    // Perform manual pick from the pointer position
    const pickResult = scene.pick(scene.pointerX, scene.pointerY);

    if (!pickResult?.hit || !pickResult.pickedMesh) {
      clearHighlight();
      return;
    }

    // Walk up parent chain to find a mesh with lotMeta
    let mesh: BABYLON.AbstractMesh | null = pickResult.pickedMesh;
    let lotMeta: any = null;
    while (mesh) {
      if (mesh.metadata?.lotMeta) {
        lotMeta = mesh.metadata.lotMeta;
        break;
      }
      mesh = mesh.parent as BABYLON.AbstractMesh | null;
    }

    if (!lotMeta || !mesh) {
      clearHighlight();
      return;
    }

    // Already highlighting this mesh
    if (mesh === lastHighlightedMesh) {
      // Update tooltip position to follow cursor
      const evt = pointerInfo.event as PointerEvent;
      tooltip.leftInPixels = evt.offsetX + 12;
      tooltip.topInPixels = evt.offsetY + 12;
      return;
    }

    // Clear previous highlight
    clearHighlight();

    // Find ALL meshes belonging to this lot (ground plane, building, plate, roof, children)
    const lotId = lotMeta.id;
    const group: BABYLON.Mesh[] = [];
    const lotPlanes: BABYLON.AbstractMesh[] = [];
    for (const m of scene.meshes) {
      if (m.metadata?.lotMeta?.id === lotId) {
        group.push(m as BABYLON.Mesh);
        // Also grab child meshes (e.g., model instances parented to lot_parent)
        m.getChildMeshes(false).forEach(child => {
          group.push(child as BABYLON.Mesh);
        });
      }
    }

    const highlightColor = new BABYLON.Color3(1, 0.95, 0.4);
    for (const m of group) {
      if (m.metadata?.isLotPlane) {
        // Lot ground planes have per-lot materials, safe to modify directly
        lotPlanes.push(m);
        const mat = m.material as BABYLON.StandardMaterial | null;
        if (mat) {
          mat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.1);
          mat.alpha = 0.45;
        }
      } else {
        // Use HighlightLayer glow — does NOT mutate shared materials
        try { hl.addMesh(m as BABYLON.Mesh, highlightColor); } catch { /* some meshes can't be highlighted */ }
      }
    }
    lastHighlightedMesh = mesh;
    lastHighlightedGroup = group;
    lastLotPlanes = lotPlanes;

    // Build tooltip content
    const lines: string[] = [];
    if (lotMeta.address) lines.push(lotMeta.address);
    if (lotMeta.bizName) lines.push(`Business: ${lotMeta.bizName}`);
    if (lotMeta.resType) lines.push(`Type: ${lotMeta.resType}`);
    lines.push(`Building: ${lotMeta.buildingType}`);
    if (lotMeta.streetName) lines.push(`Street: ${lotMeta.streetName}`);
    if (lotMeta.side) lines.push(`Side: ${lotMeta.side}`);
    if (lotMeta.lotWidth && lotMeta.lotDepth) {
      lines.push(`Lot: ${lotMeta.lotWidth}x${lotMeta.lotDepth}`);
    }
    lines.push(`ID: ${lotMeta.id?.slice(-8) ?? '?'}`);

    tooltipText.text = lines.join('\n');
    tooltip.isVisible = true;
    const evt = pointerInfo.event as PointerEvent;
    tooltip.leftInPixels = evt.offsetX + 12;
    tooltip.topInPixels = evt.offsetY + 12;
  });
}

// ─── Label Helper ────────────────────────────────────────────────────────────

function addLabel(
  gui: GUI.AdvancedDynamicTexture,
  mesh: BABYLON.AbstractMesh,
  text: string,
  fontSize: number,
  color: string,
  yOffset: number
) {
  // Guard against disposed scene/texture (async model loading may finish after unmount)
  if (!gui || !mesh || mesh.isDisposed()) return;
  try { gui.getScene(); } catch { return; }

  const label = new GUI.TextBlock();
  label.text = text;
  label.color = color;
  label.fontSize = fontSize;
  label.fontFamily = 'system-ui, -apple-system, sans-serif';
  label.outlineWidth = 2;
  label.outlineColor = 'black';
  label.resizeToFit = true;

  const container = new GUI.Rectangle();
  container.width = '200px';
  container.height = `${fontSize + 8}px`;
  container.thickness = 0;
  container.addControl(label);

  gui.addControl(container);
  container.linkWithMesh(mesh);
  container.linkOffsetY = -yOffset;

  // Store GUI control reference on the mesh for layer visibility toggling
  mesh.metadata = { ...mesh.metadata, guiControl: container };
}
