import { useEffect, useRef, useState, useCallback } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import * as GUI from '@babylonjs/gui';
import { Loader2, Maximize, Minimize, ZoomIn, ZoomOut, Pause, Play } from 'lucide-react';
import {
  generateStreetAlignedLots,
  type StreetSegment,
} from '@shared/game-engine/rendering/StreetAlignedPlacement';
import { getBuildingDefaults, DEFAULT_BUILDING_DIMENSIONS } from '../../../../shared/game-engine/building-defaults';
import { generateSettlementLayout } from '@shared/settlement-layout-svg';
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
  /** World record with mapWidth/mapDepth for geographic coordinate rendering */
  worldData?: { mapWidth?: number; mapDepth?: number; mapCenter?: { x: number; z: number }; gridWidth?: number; gridHeight?: number } | null;
  onWorldClick?: () => void;
  onSettlementClick?: (settlement: any) => void;
  onCountryClick?: (country: any) => void;
  onBuildingClick?: (lotId: string) => void;
  /** Lot ID to highlight and focus the camera on */
  selectedLotId?: string | null;
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
  worldData,
  onWorldClick,
  onSettlementClick,
  onCountryClick,
  onBuildingClick,
  selectedLotId,
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
  const onWorldClickRef = useRef(onWorldClick);
  onWorldClickRef.current = onWorldClick;
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
    scene.clearColor = new BABYLON.Color4(0.62, 0.60, 0.52, 1); // Warm parchment edge

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

    // Compute preview scale: map real world-space coordinates into a
    // manageable preview size (~50 units across for camera framing).
    const PREVIEW_TARGET_SIZE = 50;
    const hasRealCoords = !!(worldData?.mapWidth && worldData.mapWidth > 0);
    const realMapSize = hasRealCoords ? Math.max(worldData!.mapWidth!, worldData!.mapDepth ?? worldData!.mapWidth!) : 1;
    const previewScale = hasRealCoords ? PREVIEW_TARGET_SIZE / realMapSize : 1;
    const mapCenterX = (worldData?.mapCenter?.x ?? 0) * previewScale;
    const mapCenterZ = (worldData?.mapCenter?.z ?? 0) * previewScale;

    // Helper to convert world coords to preview coords
    const toPreview = (x: number, z: number): BABYLON.Vector3 =>
      new BABYLON.Vector3((x * previewScale) - mapCenterX, 0, (z * previewScale) - mapCenterZ);
    const toPreviewPoly = (polygon: Array<{ x: number; z: number }>): BABYLON.Vector3[] =>
      polygon.map(p => new BABYLON.Vector3((p.x * previewScale) - mapCenterX, 0.03, (p.z * previewScale) - mapCenterZ));

    const countryCount = Math.max(countries.length, 1);
    // Fallback layout for worlds without real coordinates —
    // ensure clear visual hierarchy: world >> country >> settlement
    const fallbackCountryRadius = Math.max(countryCount * 8, 14);
    const fallbackSettlementSpread = fallbackCountryRadius * 0.55;

    // For rectangular grids, the preview radius should frame the larger dimension
    const wGridW = (worldData as any)?.gridWidth as number | undefined;
    const wGridH = (worldData as any)?.gridHeight as number | undefined;
    const worldAspect = (wGridW && wGridH) ? Math.max(wGridW, wGridH) / Math.min(wGridW, wGridH) : 1;
    refs.worldRadius = hasRealCoords
      ? (PREVIEW_TARGET_SIZE / 2) * 1.2 * worldAspect
      : fallbackCountryRadius + 12;

    // Large world ground — parchment/cartographic base
    const groundSize = hasRealCoords ? PREVIEW_TARGET_SIZE * 1.3 * worldAspect : refs.worldRadius * 2.5;
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {
      width: groundSize,
      height: groundSize,
    }, scene);
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.78, 0.75, 0.65); // Parchment
    groundMat.specularColor = BABYLON.Color3.Black();
    ground.material = groundMat;
    tagMesh(ground, 'terrain');

    // World boundary — rectangle when grid data present, circle otherwise
    const wData = worldData as any;
    const hasWorldGrid = !!(wData?.gridWidth && wData?.gridHeight);
    if (hasWorldGrid && hasRealCoords) {
      // Draw rectangular world border matching the grid
      const WORLD_CELL = 1600;
      const halfW = (wData.gridWidth * WORLD_CELL) / 2;
      const halfD = (wData.gridHeight * WORLD_CELL) / 2;
      const borderColor = new BABYLON.Color3(0.45, 0.50, 0.55);
      const corners = [
        toPreview(-halfW, -halfD),
        toPreview(halfW, -halfD),
        toPreview(halfW, halfD),
        toPreview(-halfW, halfD),
      ];
      corners.forEach(c => { c.y = 0.03; });
      corners.push(corners[0].clone());
      const worldBorder = BABYLON.MeshBuilder.CreateLines('worldBorder', { points: corners }, scene);
      worldBorder.color = borderColor;
      worldBorder.isPickable = false;
      tagMesh(worldBorder, 'districts');

    } else {
      const worldBorderRadius = hasRealCoords
        ? (PREVIEW_TARGET_SIZE / 2) * 1.1
        : refs.worldRadius;
      const worldBorder = drawBorderCircle(
        scene, 'worldBorder', BABYLON.Vector3.Zero(), worldBorderRadius,
        new BABYLON.Color3(0.45, 0.50, 0.55), 64, true,
      );
      tagMesh(worldBorder, 'districts');
    }

    // World name label (centered at top of map) — clickable to zoom back to world view
    {
      const worldLabelAnchor = BABYLON.MeshBuilder.CreateBox('worldLabelAnchor', { size: 0.01 }, scene);
      worldLabelAnchor.position = new BABYLON.Vector3(0, 6, 0);
      worldLabelAnchor.isVisible = false;
      worldLabelAnchor.isPickable = false;
      tagMesh(worldLabelAnchor, 'labels');
      addLabel(newGui, worldLabelAnchor, worldName, 18, '#3A2E1E', 0, {
        fontFamily: '"Georgia", "Times New Roman", serif',
        fontWeight: 'bold',
        outlineColor: 'rgba(200, 190, 170, 0.6)',
        outlineWidth: 1,
      });
      // Make the GUI container clickable for navigation
      const guiContainer = worldLabelAnchor.metadata?.guiControl;
      if (guiContainer) {
        guiContainer.isPointerBlocker = true;
        guiContainer.cursor = 'pointer';
        guiContainer.onPointerClickObservable.add(() => {
          if (onWorldClickRef.current) onWorldClickRef.current();
        });
      }
    }

    // ── World grid overlay ──────────────────────────────────────────────────
    // Draw grid lines when the world has grid dimensions
    {
      const wData = worldData as any;
      const wGridW = wData?.gridWidth as number | undefined;
      const wGridH = wData?.gridHeight as number | undefined;
      if (hasRealCoords && wGridW && wGridH) {
        const WORLD_CELL = 1600; // game units per world cell
        const halfMapW = (wGridW * WORLD_CELL) / 2;
        const halfMapD = (wGridH * WORLD_CELL) / 2;
        const gridColor = new BABYLON.Color3(0.5, 0.5, 0.5);

        // Vertical lines
        for (let col = 0; col <= wGridW; col++) {
          const wx = -halfMapW + col * WORLD_CELL;
          const p1 = toPreview(wx, -halfMapD);
          const p2 = toPreview(wx, halfMapD);
          p1.y = 0.02; p2.y = 0.02;
          const line = BABYLON.MeshBuilder.CreateLines(`worldGridV_${col}`, { points: [p1, p2] }, scene);
          line.color = gridColor;
          line.alpha = 0.25;
          line.isPickable = false;
          tagMesh(line, 'districts');
        }
        // Horizontal lines
        for (let row = 0; row <= wGridH; row++) {
          const wz = -halfMapD + row * WORLD_CELL;
          const p1 = toPreview(-halfMapW, wz);
          const p2 = toPreview(halfMapW, wz);
          p1.y = 0.02; p2.y = 0.02;
          const line = BABYLON.MeshBuilder.CreateLines(`worldGridH_${row}`, { points: [p1, p2] }, scene);
          line.color = gridColor;
          line.alpha = 0.25;
          line.isPickable = false;
          tagMesh(line, 'districts');
        }
      }
    }

    // Place countries
    countries.forEach((country, ci) => {
      // Use real coordinates if available, otherwise fall back to circular layout
      let countryPos: BABYLON.Vector3;
      if (hasRealCoords && country.position) {
        countryPos = toPreview(country.position.x, country.position.z);
      } else {
        const angle = (ci / countryCount) * Math.PI * 2;
        countryPos = new BABYLON.Vector3(
          Math.cos(angle) * fallbackCountryRadius,
          0,
          Math.sin(angle) * fallbackCountryRadius,
        );
      }
      refs.countryPositions.set(country.id, countryPos);

      const terrain = country.terrain ?? 'plains';
      const terrainCol = getTerrainColor(terrain);

      // Draw country territory fill and border — warm olive tint, distinct from cool world border
      const countryBorderColor = new BABYLON.Color3(
        0.55 + terrainCol.r * 0.2,
        0.48 + terrainCol.g * 0.15,
        0.35 + terrainCol.b * 0.1,
      );
      if (hasRealCoords && country.territoryPolygon && country.territoryPolygon.length >= 3) {
        const polyPoints = toPreviewPoly(country.territoryPolygon);
        polyPoints.push(polyPoints[0].clone());
        const borderLine = BABYLON.MeshBuilder.CreateLines(
          `countryBorder_${country.id}`,
          { points: polyPoints },
          scene,
        );
        borderLine.color = countryBorderColor;
        borderLine.isPickable = false;
        tagMesh(borderLine, 'districts');

        // Filled territory rectangle (for grid-based rectangular countries)
        if (country.territoryPolygon.length === 4 && country.gridWidth != null) {
          const rawPoly = toPreviewPoly(country.territoryPolygon);
          // Build a simple ground plane matching the rectangle
          const minX = Math.min(...rawPoly.map((p: BABYLON.Vector3) => p.x));
          const maxX = Math.max(...rawPoly.map((p: BABYLON.Vector3) => p.x));
          const minZ = Math.min(...rawPoly.map((p: BABYLON.Vector3) => p.z));
          const maxZ = Math.max(...rawPoly.map((p: BABYLON.Vector3) => p.z));
          const fillW = maxX - minX;
          const fillH = maxZ - minZ;
          const territoryFill = BABYLON.MeshBuilder.CreateGround(
            `countryFill_${country.id}`,
            { width: fillW, height: fillH },
            scene,
          );
          territoryFill.position = new BABYLON.Vector3((minX + maxX) / 2, 0.015, (minZ + maxZ) / 2);
          const fillMat = new BABYLON.StandardMaterial(`countryFillMat_${country.id}`, scene);
          fillMat.diffuseColor = terrainCol.scale(0.85);
          fillMat.specularColor = BABYLON.Color3.Black();
          fillMat.alpha = 0.15;
          territoryFill.material = fillMat;
          territoryFill.isPickable = false;
          tagMesh(territoryFill, 'districts');
        }
      } else {
        const countryBorderRadius = hasRealCoords
          ? (country.territoryRadius ?? 800) * previewScale
          : fallbackCountryRadius;

        // Subtle filled territory disc
        const territoryFill = BABYLON.MeshBuilder.CreateDisc(
          `countryFill_${country.id}`,
          { radius: countryBorderRadius, tessellation: 48 },
          scene,
        );
        territoryFill.rotation.x = Math.PI / 2;
        territoryFill.position = new BABYLON.Vector3(countryPos.x, 0.015, countryPos.z);
        const fillMat = new BABYLON.StandardMaterial(`countryFillMat_${country.id}`, scene);
        fillMat.diffuseColor = terrainCol.scale(0.85);
        fillMat.specularColor = BABYLON.Color3.Black();
        fillMat.alpha = 0.15;
        territoryFill.material = fillMat;
        territoryFill.isPickable = false;
        tagMesh(territoryFill, 'districts');

        // Country border line
        const countryBorder = drawBorderCircle(
          scene, `countryBorder_${country.id}`, countryPos, countryBorderRadius,
          countryBorderColor, 48, false,
        );
        tagMesh(countryBorder, 'districts');
      }

      // Invisible pick disc for click detection
      const pickRadius = hasRealCoords
        ? (country.territoryRadius ?? 800) * previewScale
        : fallbackCountryRadius;
      const pickDisc = BABYLON.MeshBuilder.CreateDisc(`country_${country.id}`, { radius: pickRadius, tessellation: 24 }, scene);
      pickDisc.rotation.x = Math.PI / 2;
      pickDisc.position = new BABYLON.Vector3(countryPos.x, 0.01, countryPos.z);
      pickDisc.visibility = 0;
      pickDisc.id = `country_pick_${country.id}`;
      refs.pickableMap.set(pickDisc.id, { type: 'country', data: country });
      tagMesh(pickDisc, 'districts');

      // Country label — uppercase, serif, cartographic style — clickable to zoom into country
      const anchor = BABYLON.MeshBuilder.CreateBox(`cAnchor_${ci}`, { size: 0.01 }, scene);
      anchor.position = new BABYLON.Vector3(countryPos.x, 1.5, countryPos.z);
      anchor.isVisible = false;
      anchor.isPickable = false;
      tagMesh(anchor, 'labels');
      addLabel(newGui, anchor, country.name.toUpperCase(), 14, '#4A3C28', 0, {
        fontFamily: '"Georgia", "Times New Roman", serif',
        outlineColor: 'rgba(200, 190, 170, 0.7)',
        outlineWidth: 1,
      });
      const countryGuiContainer = anchor.metadata?.guiControl;
      if (countryGuiContainer) {
        countryGuiContainer.isPointerBlocker = true;
        countryGuiContainer.cursor = 'pointer';
        countryGuiContainer.onPointerClickObservable.add(() => {
          if (onCountryClickRef.current) onCountryClickRef.current(country);
        });
      }

      // Place settlement markers within this country
      const countrySettlements = settlements.filter(s => s.countryId === country.id);
      countrySettlements.forEach((s, si) => {
        // Use real world position if available, otherwise fall back to circular layout
        let settlementPos: BABYLON.Vector3;
        if (hasRealCoords && s.worldPositionX != null && s.worldPositionZ != null) {
          settlementPos = toPreview(s.worldPositionX, s.worldPositionZ);
        } else {
          const sCount = Math.max(countrySettlements.length, 1);
          const sAngle = (si / sCount) * Math.PI * 2 + Math.PI / 4;
          settlementPos = new BABYLON.Vector3(
            countryPos.x + Math.cos(sAngle) * fallbackSettlementSpread,
            0,
            countryPos.z + Math.sin(sAngle) * fallbackSettlementSpread,
          );
        }
        refs.settlementPositions.set(s.id, settlementPos);

        // Marker group (visible when zoomed out)
        const markerNode = new BABYLON.TransformNode(`sMarkerNode_${s.id}`, scene);
        markerNode.position = settlementPos;
        refs.settlementMarkerNodes.set(s.id, markerNode);

        // Flat circle dot (map-style marker)
        const sRadius = hasRealCoords && s.radius
          ? s.radius * previewScale
          : (SETTLEMENT_SCALE[s.settlementType] ?? 0.5) * 0.5;
        const markerSize = Math.max(0.3, sRadius * 0.15);
        const marker = BABYLON.MeshBuilder.CreateDisc(`s_${s.id}`, {
          radius: markerSize,
          tessellation: 16,
        }, scene);
        marker.rotation.x = Math.PI / 2;
        marker.position = new BABYLON.Vector3(0, 0.04, 0);
        marker.parent = markerNode;
        const mMat = new BABYLON.StandardMaterial(`sMat_${s.id}`, scene);
        mMat.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.15);
        mMat.specularColor = BABYLON.Color3.Black();
        marker.material = mMat;
        marker.id = `settlement_pick_${s.id}`;
        refs.pickableMap.set(marker.id, { type: 'settlement', data: s });
        tagMesh(marker, 'buildings');

        // Settlement boundary ring (dashed) — use real radius if available
        const borderRadius = hasRealCoords && s.radius
          ? s.radius * previewScale
          : (SETTLEMENT_SCALE[s.settlementType] ?? 0.5) * 1.5;
        const sBorder = drawBorderCircle(
          scene, `sBorder_${s.id}`, BABYLON.Vector3.Zero(), borderRadius,
          new BABYLON.Color3(0.45, 0.4, 0.35), 32, true, markerNode,
        );
        tagMesh(sBorder, 'districts');

        // Settlement footprint — miniature layout visible at country zoom
        const footprintSize = Math.max(1, borderRadius * 1.6);
        try {
          const layout = generateSettlementLayout(
            128, 90,
            s.settlementType ?? 'town',
            s.terrain ?? country.terrain ?? 'plains',
            s.foundedYear ?? 1800,
            s.population,
          );
          const texSize = 256;
          const dtex = new BABYLON.DynamicTexture(`sFootprint_${s.id}`, texSize, scene, false);
          const ctx = dtex.getContext();
          const scaleX = texSize / 128;
          const scaleY = texSize / 90;

          // Background
          ctx.fillStyle = 'rgba(210, 200, 180, 0.4)';
          ctx.fillRect(0, 0, texSize, texSize);

          // Streets
          ctx.strokeStyle = 'rgba(120, 100, 70, 0.8)';
          for (const st of layout.streets) {
            ctx.lineWidth = st.main ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(st.x1 * scaleX, st.y1 * scaleY);
            ctx.lineTo(st.x2 * scaleX, st.y2 * scaleY);
            ctx.stroke();
          }

          // Buildings
          for (const b of layout.buildings) {
            ctx.fillStyle = b.biz ? 'rgba(140, 100, 60, 0.9)' : 'rgba(80, 90, 110, 0.8)';
            ctx.fillRect(b.x * scaleX, b.y * scaleY, b.w * scaleX, b.h * scaleY);
          }

          // Park
          if (layout.park) {
            ctx.fillStyle = 'rgba(70, 130, 70, 0.6)';
            ctx.fillRect(
              layout.park.x * scaleX, layout.park.y * scaleY,
              layout.park.w * scaleX, layout.park.h * scaleY,
            );
          }

          dtex.update();

          const footprintPlane = BABYLON.MeshBuilder.CreateGround(
            `sFootprintPlane_${s.id}`,
            { width: footprintSize, height: footprintSize * 0.7 },
            scene,
          );
          footprintPlane.position = new BABYLON.Vector3(0, 0.03, 0);
          footprintPlane.parent = markerNode;
          const fMat = new BABYLON.StandardMaterial(`sFootprintMat_${s.id}`, scene);
          fMat.diffuseTexture = dtex;
          fMat.specularColor = BABYLON.Color3.Black();
          fMat.useAlphaFromDiffuseTexture = true;
          fMat.backFaceCulling = false;
          footprintPlane.material = fMat;
          footprintPlane.isPickable = false;
          tagMesh(footprintPlane, 'buildings');
        } catch {
          // Footprint is non-critical, ignore errors
        }

        // Settlement label — italic, cartographic
        const sLabelAnchor = BABYLON.MeshBuilder.CreateBox(`sLabel_${s.id}`, { size: 0.01 }, scene);
        sLabelAnchor.position = new BABYLON.Vector3(0, 0.8, 0);
        sLabelAnchor.parent = markerNode;
        sLabelAnchor.isVisible = false;
        sLabelAnchor.isPickable = false;
        tagMesh(sLabelAnchor, 'labels');
        addLabel(newGui, sLabelAnchor, s.name, 10, '#5A4A38', 0, {
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontStyle: 'italic',
          outlineColor: 'rgba(200, 190, 170, 0.7)',
          outlineWidth: 1,
        });

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

    // When navigating away from settlement detail, hide all detail nodes immediately
    // (don't wait for LOD distance check which lags during camera animation)
    if (viewLevel !== 'settlement') {
      refs.settlementDetailNodes.forEach((detailNode) => {
        detailNode.setEnabled(false);
        for (const child of detailNode.getChildMeshes()) {
          if (child.metadata?.guiControl) {
            child.metadata.guiControl.isVisible = false;
          }
        }
      });
      // Re-enable all settlement markers
      refs.settlementMarkerNodes.forEach((markerNode) => {
        markerNode.setEnabled(true);
      });
    }

    if (viewLevel === 'world') {
      // Nearly top-down for cartographic world overview
      animateCameraTo(camera, scene, BABYLON.Vector3.Zero(), refs.worldRadius * 0.9, Math.PI / 8);
    } else if (viewLevel === 'country' && selectedCountryId) {
      const pos = refs.countryPositions.get(selectedCountryId);
      // Frame the country by its territory radius in preview space
      const country = countries.find(c => c.id === selectedCountryId);
      const hasReal = !!(worldData?.mapWidth && worldData.mapWidth > 0);
      const pScale = hasReal ? (50 / Math.max(worldData!.mapWidth!, worldData!.mapDepth ?? worldData!.mapWidth!)) : 1;
      const countryViewRadius = hasReal && country?.territoryRadius
        ? country.territoryRadius * pScale * 1.3
        : 18;
      if (pos) animateCameraTo(camera, scene, pos.clone(), countryViewRadius, Math.PI / 5);
    } else if (viewLevel === 'settlement') {
      // Determine target settlement from loaded lots
      if (lots.length > 0) {
        const settlementId = lots[0]?.settlementId;
        if (settlementId) {
          const pos = refs.settlementPositions.get(settlementId);
          const sType2 = settlements.find(s => s.id === settlementId)?.settlementType;
          const sFallback2 = Math.max(countries.length * 8, 14);
          const sViewR = Math.max(4, (SETTLEMENT_SCALE[sType2] ?? 0.5) * sFallback2 * 0.8) * 0.7;
          if (pos) animateCameraTo(camera, scene, pos.clone(), sViewR, Math.PI / 3.5);
        }
      }
    }
  }, [viewLevel, selectedCountryId, lots]);

  // ── Load settlement detail when lots/businesses arrive ─────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    const gui = guiRef.current;
    const refs = sceneRefsRef.current;
    if (!scene || scene.isDisposed || !gui || !refs) return;
    if (lots.length === 0) return;
    // Only show settlement detail when actually at settlement view level
    if (viewLevel !== 'settlement') return;

    const settlementId = lots[0]?.settlementId;
    if (!settlementId) return;

    // Filter lots to only the target settlement — the lots array may contain
    // lots from multiple settlements (e.g. from a country-level fetch).
    const settlementLots = lots.filter(l => l.settlementId === settlementId);
    if (refs.settlementLoaded.has(settlementId)) {
      // Already loaded — just make sure detail is visible and zoom to frame the whole settlement
      const detailNode = refs.settlementDetailNodes.get(settlementId);
      const markerNode = refs.settlementMarkerNodes.get(settlementId);
      if (detailNode) detailNode.setEnabled(true);
      if (markerNode) markerNode.setEnabled(false);
      const pos = refs.settlementPositions.get(settlementId);
      if (pos && cameraRef.current) {
        // Radius that frames the entire settlement (layout spans ~24 preview units)
        const sType = settlements.find(s => s.id === settlementId)?.settlementType;
        const sFallback = Math.max(countries.length * 8, 14);
        const sDetailSize = (SETTLEMENT_SCALE[sType] ?? 0.5) * sFallback * 0.8;
        const settlementViewRadius = Math.max(4, sDetailSize) * 0.7;
        animateCameraTo(cameraRef.current, scene, pos.clone(), settlementViewRadius, Math.PI / 3.5);
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

      // Scale settlement detail to fit proportionally within the country.
      // A hamlet should be visually small inside its country circle, a city larger.
      const settlement = settlements.find(s => s.id === settlementId);
      const hasReal = !!(worldData?.mapWidth && worldData.mapWidth > 0);
      const previewTargetSize = 50;
      const countryRadiusFallback = Math.max(countries.length * 8, 14);
      const detailTargetSize = hasReal && settlement?.radius
        ? settlement.radius * (previewTargetSize / Math.max(worldData!.mapWidth!, worldData!.mapDepth ?? worldData!.mapWidth!)) * 2
        : (SETTLEMENT_SCALE[settlement?.settlementType] ?? 0.5) * countryRadiusFallback * 0.8;
      const clampedDetailSize = Math.max(4, detailTargetSize);

      if (hasStoredStreets) {
        renderStreetNetworkAtNode(scene, gui, normalizedStreets, detailNode, clampedDetailSize);
      }

      const { positions, streets: layoutStreets, scale: layoutScale } = computeSettlementLayout(settlementLots, worldId, hasStoredStreets ? normalizedStreets : undefined, clampedDetailSize);

      if (!hasStoredStreets) {
        renderStreetsAtNode(scene, gui, layoutStreets, detailNode);
      }

      // Settlement boundary — compute actual extent from lot + street positions
      // (all already in the scaled-down targetSize coordinate space)
      const margin = clampedDetailSize * 0.1;
      let extentMax = clampedDetailSize * 0.4; // minimum half-extent proportional to detail size
      positions.forEach(pos => {
        extentMax = Math.max(extentMax, Math.abs(pos.x) + margin, Math.abs(pos.z) + margin);
      });
      for (const seg of layoutStreets) {
        extentMax = Math.max(extentMax, Math.abs(seg.from.x) + margin, Math.abs(seg.from.z) + margin,
                                        Math.abs(seg.to.x) + margin, Math.abs(seg.to.z) + margin);
      }
      if (hasStoredStreets) {
        const ss = computeStreetScale(normalizedStreets);
        const ssFactor = clampedDetailSize / 24;
        for (const seg of normalizedStreets) {
          for (const wp of seg.waypoints) {
            const sx = (wp.x - ss.cx) * ss.scale * ssFactor;
            const sz = (wp.z - ss.cz) * ss.scale * ssFactor;
            extentMax = Math.max(extentMax, Math.abs(sx) + margin, Math.abs(sz) + margin);
          }
        }
      }
      // Dashed settlement limits border
      const settlementBorder = drawBorderCircle(
        scene, `settlementLimits_${settlementId}`, BABYLON.Vector3.Zero(),
        extentMax * 1.1, new BABYLON.Color3(0.5, 0.45, 0.35), 64, true, detailNode,
      );
      tagMesh(settlementBorder, 'districts');

      // Build lots/buildings using existing buildSettlementView logic
      const bizByLot = new Map<string, any>();
      businesses.forEach(b => { if (b.lotId) bizByLot.set(b.lotId, b); });
      const resByLot = new Map<string, any>();
      residences.forEach(r => { if (r.lotId) resByLot.set(r.lotId, r); });

      settlementLots.forEach((lot, li) => {
        const pos = positions.get(lot.id);
        if (!pos) return;
        const lx = pos.x;
        const lz = pos.z;
        const facingAngle = pos.angle;
        const rng = seededRandom(hashStr(lot.id));
        const lt = lot.lotType?.toLowerCase() ?? 'buildable';
        const bc = lot.building?.buildingCategory?.toLowerCase();
        const biz = bizByLot.get(lot.id);
        const res = resByLot.get(lot.id);
        const isPark = ['park', 'forest', 'cemetery', 'garden'].includes(lt);
        const isBusiness = !isPark && (bc === 'business' || !!biz);
        const isResidence = !isPark && (bc === 'residence' || !!res);
        const buildingType = isPark ? 'park' : isBusiness ? 'business' : isResidence ? 'residence' : 'vacant';

        const parkColors: Record<string, BABYLON.Color3> = {
          park: new BABYLON.Color3(0.45, 0.55, 0.35),     // warm sage — town square
          forest: new BABYLON.Color3(0.15, 0.45, 0.15),    // deep green — grove
          cemetery: new BABYLON.Color3(0.4, 0.4, 0.35),    // muted stone — cemetery
          garden: new BABYLON.Color3(0.35, 0.55, 0.25),    // bright green — garden
        };
        const tintColor = isPark
          ? (parkColors[lt] || new BABYLON.Color3(0.25, 0.55, 0.2))
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
          const parkGroundColor = parkColors[lt] || new BABYLON.Color3(0.2, 0.5, 0.15);
          lotPlaneMat.diffuseColor = parkGroundColor;
          lotPlaneMat.alpha = 0.6;

          if (lt === 'forest' || lt === 'garden') {
            // Forest/garden: dense trees
            const treeCount = Math.max(3, Math.floor((scaledW * scaledD) / 2));
            for (let ti = 0; ti < treeCount; ti++) {
              const tx = lx + (rng() - 0.5) * scaledW * 0.8;
              const tz = lz + (rng() - 0.5) * scaledD * 0.8;
              const treeScale = lt === 'garden' ? 0.08 + rng() * 0.08 : 0.15 + rng() * 0.15;
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
              foliageMat.diffuseColor = lt === 'garden'
                ? new BABYLON.Color3(0.3 + rng() * 0.3, 0.5 + rng() * 0.2, 0.1) // varied greens/yellows for garden
                : new BABYLON.Color3(0.15 + rng() * 0.1, 0.45 + rng() * 0.15, 0.1); // deep greens for forest
              foliageMat.specularColor = BABYLON.Color3.Black();
              foliage.material = foliageMat;
              tagMesh(foliage, 'buildings');
            }
          } else if (lt === 'cemetery') {
            // Cemetery: gravestones (tall thin boxes)
            const stoneCount = Math.max(4, Math.floor((scaledW * scaledD) / 1.5));
            for (let ti = 0; ti < stoneCount; ti++) {
              const tx = lx + (rng() - 0.5) * scaledW * 0.7;
              const tz = lz + (rng() - 0.5) * scaledD * 0.7;
              const stoneH = 0.06 + rng() * 0.06;
              const stone = BABYLON.MeshBuilder.CreateBox(`grave_${lot.id}_${ti}`, { width: 0.04, height: stoneH, depth: 0.02 }, scene);
              stone.position = new BABYLON.Vector3(tx, stoneH / 2, tz);
              stone.parent = detailNode;
              const stoneMat = new BABYLON.StandardMaterial(`graveMat_${lot.id}_${ti}`, scene);
              stoneMat.diffuseColor = new BABYLON.Color3(0.55 + rng() * 0.1, 0.55 + rng() * 0.1, 0.5 + rng() * 0.1);
              stoneMat.specularColor = BABYLON.Color3.Black();
              stone.material = stoneMat;
              tagMesh(stone, 'buildings');
            }
          } else {
            // Town square (park): benches and a central feature
            // Central feature (fountain/statue — simple cylinder + sphere)
            const fountain = BABYLON.MeshBuilder.CreateCylinder(`fountain_${lot.id}`, { height: 0.08, diameter: 0.15, tessellation: 12 }, scene);
            fountain.position = new BABYLON.Vector3(lx, 0.04, lz);
            fountain.parent = detailNode;
            const fountainMat = new BABYLON.StandardMaterial(`fountainMat_${lot.id}`, scene);
            fountainMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.65);
            fountainMat.specularColor = BABYLON.Color3.Black();
            fountain.material = fountainMat;
            tagMesh(fountain, 'buildings');
            // Benches (small flat boxes around the center)
            for (let bi = 0; bi < 4; bi++) {
              const angle = (bi / 4) * Math.PI * 2;
              const dist = Math.min(scaledW, scaledD) * 0.3;
              const bx = lx + Math.cos(angle) * dist;
              const bz = lz + Math.sin(angle) * dist;
              const bench = BABYLON.MeshBuilder.CreateBox(`bench_${lot.id}_${bi}`, { width: 0.08, height: 0.02, depth: 0.03 }, scene);
              bench.position = new BABYLON.Vector3(bx, 0.01, bz);
              bench.rotation.y = angle + Math.PI / 2;
              bench.parent = detailNode;
              const benchMat = new BABYLON.StandardMaterial(`benchMat_${lot.id}_${bi}`, scene);
              benchMat.diffuseColor = new BABYLON.Color3(0.45, 0.3, 0.15);
              benchMat.specularColor = BABYLON.Color3.Black();
              bench.material = benchMat;
              tagMesh(bench, 'buildings');
            }
          }

          const parkLabelAnchor = new BABYLON.Mesh(`parkLabel_${lot.id}`, scene);
          parkLabelAnchor.position = new BABYLON.Vector3(lx, 0.5, lz);
          parkLabelAnchor.parent = detailNode;
          parkLabelAnchor.isVisible = false;
          tagMesh(parkLabelAnchor, 'labels');
          const labelText = lot.name || lot.address || lt.charAt(0).toUpperCase() + lt.slice(1);
          const labelColor = lt === 'cemetery' ? '#A0A0A0' : lt === 'forest' ? '#2ECC71' : '#50FA7B';
          addLabel(gui, parkLabelAnchor, labelText, 10, labelColor, 15);
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

      // Animate camera to frame the entire settlement
      const sPos = refs.settlementPositions.get(settlementId);
      if (sPos && cameraRef.current) {
        const sType = settlements.find(s => s.id === settlementId)?.settlementType;
        const sFallback = Math.max(countries.length * 8, 14);
        const sDetailSize = (SETTLEMENT_SCALE[sType] ?? 0.5) * sFallback * 0.8;
        const settlementViewRadius = Math.max(4, sDetailSize) * 0.7;
        animateCameraTo(cameraRef.current, scene, sPos.clone(), settlementViewRadius, Math.PI / 3.5);
      }

      setIsLoading(false);
      setLoadingProgress(null);
    };

    buildDetail();
  }, [lots, businesses, residences, streets, worldId, viewLevel]);

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
        if (detailNode) {
          detailNode.setEnabled(showDetail);
          // Toggle GUI labels parented to this detail node so they don't
          // bleed through at world/country zoom levels
          for (const child of detailNode.getChildMeshes()) {
            if (child.metadata?.guiControl) {
              child.metadata.guiControl.isVisible = showDetail;
            }
          }
        }
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

  // Highlight selected lot and focus camera on it
  const prevHighlightRef = useRef<BABYLON.AbstractMesh[]>([]);
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || scene.isDisposed || !camera) return;

    // Remove previous highlight
    for (const mesh of prevHighlightRef.current) {
      if (!mesh.isDisposed()) {
        mesh.dispose();
      }
    }
    prevHighlightRef.current = [];

    if (!selectedLotId) return;

    // Find the meshes belonging to the selected lot
    let targetPosition: BABYLON.Vector3 | null = null;
    for (const mesh of scene.meshes) {
      if (mesh.metadata?.lotMeta?.id === selectedLotId) {
        targetPosition = mesh.absolutePosition.clone();
        break;
      }
    }

    if (!targetPosition) return;

    // Create a highlight ring around the selected lot
    const ring = BABYLON.MeshBuilder.CreateTorus(
      '__lot_highlight',
      { diameter: 6, thickness: 0.3, tessellation: 32 },
      scene
    );
    ring.position = new BABYLON.Vector3(targetPosition.x, targetPosition.y + 0.3, targetPosition.z);
    ring.rotation.x = 0;
    const ringMat = new BABYLON.StandardMaterial('__lot_highlight_mat', scene);
    ringMat.diffuseColor = new BABYLON.Color3(1, 0.85, 0.2);
    ringMat.emissiveColor = new BABYLON.Color3(1, 0.85, 0.2);
    ringMat.alpha = 0.8;
    ringMat.disableLighting = true;
    ring.material = ringMat;
    ring.isPickable = false;
    prevHighlightRef.current.push(ring);

    // Animate camera to focus on the lot
    isRotatingRef.current = false;
    setIsRotating(false);
    const targetAlpha = Math.atan2(targetPosition.x - camera.target.x, targetPosition.z - camera.target.z);
    BABYLON.Animation.CreateAndStartAnimation(
      'camTarget', camera, 'target', 30, 20,
      camera.target.clone(), targetPosition, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    BABYLON.Animation.CreateAndStartAnimation(
      'camRadius', camera, 'radius', 30, 20,
      camera.radius, Math.min(camera.radius, 30), BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
  }, [selectedLotId]);

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
  /** Target size in preview units for the layout. Defaults to 24. */
  targetSize: number = 24,
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
      // Use the same center as renderStreetNetwork, but scale to targetSize
      const streetScale = computeStreetScale(storedStreets);
      scale = streetScale.scale * (targetSize / 24); // computeStreetScale uses editorSize=24
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
      scale = targetSize / Math.max(rangeX, rangeZ);
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

    // Place lots without positions in non-overlapping spots.
    // Use a grid search to find empty cells that don't collide with positioned lots.
    if (lotsWithout.length > 0) {
      const lotW = (lotsWithout[0].lotWidth || 12) * scale;
      const lotD = (lotsWithout[0].lotDepth || 16) * scale;
      const cellSize = Math.max(lotW, lotD, 1);

      // Collect occupied rectangles from already-positioned lots
      const occupied: { x: number; z: number }[] = [];
      positions.forEach(p => occupied.push({ x: p.x, z: p.z }));

      // Spiral outward from center to find empty cells
      let placed = 0;
      const maxRing = Math.ceil(targetSize / cellSize) + 2;
      for (let ring = 0; ring <= maxRing && placed < lotsWithout.length; ring++) {
        for (let dx = -ring; dx <= ring && placed < lotsWithout.length; dx++) {
          for (let dz = -ring; dz <= ring && placed < lotsWithout.length; dz++) {
            if (Math.abs(dx) !== ring && Math.abs(dz) !== ring) continue; // only perimeter
            const cx = dx * cellSize;
            const cz = dz * cellSize;
            // Check this cell doesn't overlap any occupied lot
            let collides = false;
            for (const o of occupied) {
              if (Math.abs(cx - o.x) < cellSize * 0.9 && Math.abs(cz - o.z) < cellSize * 0.9) {
                collides = true;
                break;
              }
            }
            if (collides) continue;
            positions.set(lotsWithout[placed].id, { x: cx, z: cz, angle: 0 });
            occupied.push({ x: cx, z: cz });
            placed++;
          }
        }
      }
    }

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

    // Handle any lots that didn't get generated positions — find empty grid cells
    if (result.lots.length < lots.length) {
      const occupiedGen: { x: number; z: number }[] = [];
      positions.forEach(p => occupiedGen.push({ x: p.x, z: p.z }));
      const cellGen = PREVIEW_SIZE / Math.max(Math.ceil(Math.sqrt(lots.length)), 2);
      let placedGen = 0;
      const remaining = lots.length - result.lots.length;
      const maxRingGen = Math.ceil(PREVIEW_SIZE / cellGen) + 2;
      for (let ring = 0; ring <= maxRingGen && placedGen < remaining; ring++) {
        for (let dx = -ring; dx <= ring && placedGen < remaining; dx++) {
          for (let dz = -ring; dz <= ring && placedGen < remaining; dz++) {
            if (Math.abs(dx) !== ring && Math.abs(dz) !== ring) continue;
            const gx = dx * cellGen, gz = dz * cellGen;
            let collides = false;
            for (const o of occupiedGen) {
              if (Math.abs(gx - o.x) < cellGen * 0.9 && Math.abs(gz - o.z) < cellGen * 0.9) {
                collides = true;
                break;
              }
            }
            if (collides) continue;
            positions.set(lots[result.lots.length + placedGen].id, { x: gx, z: gz, angle: 0 });
            occupiedGen.push({ x: gx, z: gz });
            placedGen++;
          }
        }
      }
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
    const lt = lot.lotType?.toLowerCase() ?? 'buildable';
    const bc = lot.building?.buildingCategory?.toLowerCase();
    const biz = bizByLot.get(lot.id);
    const res = resByLot.get(lot.id);

    const isPark = ['park', 'forest', 'cemetery', 'garden'].includes(lt);
    const isBusiness = !isPark && (bc === 'business' || !!biz);
    const isResidence = !isPark && (bc === 'residence' || !!res);

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
      // ─── Park rendering: type-specific visuals ────────────
      const parkColors: Record<string, BABYLON.Color3> = {
        park: new BABYLON.Color3(0.45, 0.55, 0.35),
        forest: new BABYLON.Color3(0.15, 0.45, 0.15),
        cemetery: new BABYLON.Color3(0.4, 0.4, 0.35),
        garden: new BABYLON.Color3(0.35, 0.55, 0.25),
      };
      const parkGroundColor = parkColors[lt] || new BABYLON.Color3(0.2, 0.5, 0.15);
      lotPlaneMat.diffuseColor = parkGroundColor;
      lotPlaneMat.alpha = 0.6;

      if (lt === 'forest' || lt === 'garden') {
        // Trees for forest/garden
        const treeCount = Math.max(3, Math.floor((scaledW * scaledD) / 2));
        for (let ti = 0; ti < treeCount; ti++) {
          const tx = lx + (rng() - 0.5) * scaledW * 0.8;
          const tz = lz + (rng() - 0.5) * scaledD * 0.8;
          const treeScale = lt === 'garden' ? 0.08 + rng() * 0.08 : 0.15 + rng() * 0.15;
          const trunk = BABYLON.MeshBuilder.CreateCylinder(`park_trunk_${lot.id}_${ti}`, { height: treeScale * 2, diameter: treeScale * 0.3, tessellation: 6 }, scene);
          trunk.position = new BABYLON.Vector3(tx, treeScale, tz);
          const trunkMat = new BABYLON.StandardMaterial(`park_trunkMat_${lot.id}_${ti}`, scene);
          trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.28, 0.15);
          trunkMat.specularColor = BABYLON.Color3.Black();
          trunk.material = trunkMat;
          tagMesh(trunk, 'buildings');
          const foliage = BABYLON.MeshBuilder.CreateSphere(`park_foliage_${lot.id}_${ti}`, { diameter: treeScale * 2.5, segments: 6 }, scene);
          foliage.position = new BABYLON.Vector3(tx, treeScale * 2.2, tz);
          const foliageMat = new BABYLON.StandardMaterial(`park_foliageMat_${lot.id}_${ti}`, scene);
          foliageMat.diffuseColor = lt === 'garden'
            ? new BABYLON.Color3(0.3 + rng() * 0.3, 0.5 + rng() * 0.2, 0.1)
            : new BABYLON.Color3(0.15 + rng() * 0.1, 0.45 + rng() * 0.15, 0.1);
          foliageMat.specularColor = BABYLON.Color3.Black();
          foliage.material = foliageMat;
          tagMesh(foliage, 'buildings');
        }
      } else if (lt === 'cemetery') {
        // Gravestones
        const stoneCount = Math.max(4, Math.floor((scaledW * scaledD) / 1.5));
        for (let ti = 0; ti < stoneCount; ti++) {
          const tx = lx + (rng() - 0.5) * scaledW * 0.7;
          const tz = lz + (rng() - 0.5) * scaledD * 0.7;
          const stoneH = 0.06 + rng() * 0.06;
          const stone = BABYLON.MeshBuilder.CreateBox(`grave_${lot.id}_${ti}`, { width: 0.04, height: stoneH, depth: 0.02 }, scene);
          stone.position = new BABYLON.Vector3(tx, stoneH / 2, tz);
          const stoneMat = new BABYLON.StandardMaterial(`graveMat_${lot.id}_${ti}`, scene);
          stoneMat.diffuseColor = new BABYLON.Color3(0.55 + rng() * 0.1, 0.55 + rng() * 0.1, 0.5 + rng() * 0.1);
          stoneMat.specularColor = BABYLON.Color3.Black();
          stone.material = stoneMat;
          tagMesh(stone, 'buildings');
        }
      } else {
        // Town square: fountain + benches
        const fountain = BABYLON.MeshBuilder.CreateCylinder(`fountain_${lot.id}`, { height: 0.08, diameter: 0.15, tessellation: 12 }, scene);
        fountain.position = new BABYLON.Vector3(lx, 0.04, lz);
        const fountainMat = new BABYLON.StandardMaterial(`fountainMat_${lot.id}`, scene);
        fountainMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.65);
        fountainMat.specularColor = BABYLON.Color3.Black();
        fountain.material = fountainMat;
        tagMesh(fountain, 'buildings');
        for (let bi = 0; bi < 4; bi++) {
          const angle = (bi / 4) * Math.PI * 2;
          const dist = Math.min(scaledW, scaledD) * 0.3;
          const bx = lx + Math.cos(angle) * dist;
          const bz = lz + Math.sin(angle) * dist;
          const bench = BABYLON.MeshBuilder.CreateBox(`bench_${lot.id}_${bi}`, { width: 0.08, height: 0.02, depth: 0.03 }, scene);
          bench.position = new BABYLON.Vector3(bx, 0.01, bz);
          bench.rotation.y = angle + Math.PI / 2;
          const benchMat = new BABYLON.StandardMaterial(`benchMat_${lot.id}_${bi}`, scene);
          benchMat.diffuseColor = new BABYLON.Color3(0.45, 0.3, 0.15);
          benchMat.specularColor = BABYLON.Color3.Black();
          bench.material = benchMat;
          tagMesh(bench, 'buildings');
        }
      }

      // Label
      const labelAnchor = new BABYLON.Mesh(`parkLabel_${lot.id}`, scene);
      labelAnchor.position = new BABYLON.Vector3(lx, 0.5, lz);
      labelAnchor.isVisible = false;
      tagMesh(labelAnchor, 'labels');
      const labelText = lot.name || lot.address || lt.charAt(0).toUpperCase() + lt.slice(1);
      const labelColor = lt === 'cemetery' ? '#A0A0A0' : lt === 'forest' ? '#2ECC71' : '#50FA7B';
      addLabel(gui, labelAnchor, labelText, 10, labelColor, 15);
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
  /** Target size in preview units. Default 24 matches computeStreetScale's editorSize. */
  targetSize: number = 24,
) {
  renderStreetNetwork(scene, gui, streets, parent, targetSize);
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
  /** Target size in preview units. Default 24 matches computeStreetScale's editorSize. */
  targetSize: number = 24,
) {
  const { scale: baseScale, cx, cz } = computeStreetScale(streets);
  const scale = baseScale * (targetSize / 24);

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
    else if (lotMeta.resType) lines.push(`Type: ${lotMeta.resType}`);
    else {
      const typeLabels: Record<string, string> = { park: 'Park', forest: 'Forest', cemetery: 'Cemetery', garden: 'Garden', vacant: 'Vacant' };
      lines.push(typeLabels[lotMeta.buildingType] || lotMeta.buildingType);
    }
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
  yOffset: number,
  style?: { fontFamily?: string; fontStyle?: string; fontWeight?: string; outlineColor?: string; outlineWidth?: number },
) {
  // Guard against disposed scene/texture (async model loading may finish after unmount)
  if (!gui || !mesh || mesh.isDisposed()) return;
  try { gui.getScene(); } catch { return; }

  const label = new GUI.TextBlock();
  label.text = text;
  label.color = color;
  label.fontSize = fontSize;
  label.fontFamily = style?.fontFamily ?? 'system-ui, -apple-system, sans-serif';
  if (style?.fontStyle) (label as any).fontStyle = style.fontStyle;
  if (style?.fontWeight) label.fontWeight = style.fontWeight;
  label.outlineWidth = style?.outlineWidth ?? 2;
  label.outlineColor = style?.outlineColor ?? 'black';
  label.resizeToFit = true;

  const container = new GUI.Rectangle();
  container.width = '300px';
  container.height = `${fontSize + 8}px`;
  container.thickness = 0;
  container.addControl(label);

  gui.addControl(container);
  container.linkWithMesh(mesh);
  container.linkOffsetY = -yOffset;

  // Store GUI control reference on the mesh for layer visibility toggling
  mesh.metadata = { ...mesh.metadata, guiControl: container };
}

// ─── Border Drawing ──────────────────────────────────────────────────────────

/** Draw a circular border line (solid or dashed) at a given position and radius. */
function drawBorderCircle(
  scene: BABYLON.Scene,
  name: string,
  center: BABYLON.Vector3,
  radius: number,
  color: BABYLON.Color3,
  segments: number = 48,
  dashed: boolean = false,
  parent?: BABYLON.TransformNode,
): BABYLON.LinesMesh {
  const points: BABYLON.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new BABYLON.Vector3(
      center.x + Math.cos(angle) * radius,
      center.y + 0.03,
      center.z + Math.sin(angle) * radius,
    ));
  }

  const lines = dashed
    ? BABYLON.MeshBuilder.CreateDashedLines(name, { points, dashSize: 1, gapSize: 0.5, dashNb: segments * 3 }, scene)
    : BABYLON.MeshBuilder.CreateLines(name, { points }, scene);
  lines.color = color;
  lines.isPickable = false;
  if (parent) lines.parent = parent;
  return lines;
}
